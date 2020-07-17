import {flags} from '@oclif/command'
import {execSync} from 'child_process'
import ux from 'cli-ux'

import BaseCmd from '../base-cmd-abstract'

const fs = require('fs')
const readline = require('readline')

export default class StartCmd extends BaseCmd {
  static description = 'Spin up containers using docker-compose and update /etc/hosts file.'
  static examples = [
    '$ ce-dev start',
  ]
  static flags = {
    help: flags.help({char: 'h'})
  }

  /**
   * @var
   * Hostnames/IP pairs.
   */
  private readonly runningHosts: Map<string, string> = new Map()
  /**
   * @var
   * File path to host file.
   */
  private readonly hostsFile = '/etc/hosts'

  /**
   * @var
   * File path to tmp host file.
   */
  private readonly tmpHostsFile: string = this.config.cacheDir + '/etcHosts'
  /**
   * @var
   * File path to tmp ssh config file.
   */
  private readonly tmpSSHConfigFile: string = this.config.cacheDir + '/sshConfig'
  /**
   * @var
   * Delimiter marker for managed entries.
   */
  private readonly delimiterStart = '######### CE-DEV ### START ### DO NOT EDIT MANUALLY BELOW'
  /**
   * @var
   * Delimiter marker for managed entries.
   */
  private readonly delimiterEnd = '######### CE-DEV ### END ### DO NOT EDIT MANUALLY ABOVE'

  /**
   * @inheritdoc
   */
  public constructor(argv: string[], config: any) {
    super(argv, config)
    this.ensureActiveComposeFile()
  }

  /**
   * @inheritdoc
   */
  async run() {
    this.up()
    this.updateHostsFile()
    this.performStartTasks()
  }
  /**
   * Match numeric user ids  with hosts.
   */
  protected ensureOwnership(containerName: string) {
    let uid = 1000
    let gid = 1000
    if (this.config.platform === 'linux') {
      uid = process.getuid()
      gid = process.getgid()
    }
    ux.action.start('Ensuring file ownership')
    execSync(this.dockerBin + ' exec ' + containerName + ' /bin/sh /opt/ce-dev-ownership.sh ' + uid.toString() + ' ' + gid.toString(), {stdio: 'inherit'})
    ux.action.stop()
  }
  /**
   * Generate SSH Config.
   * @todo Change how we handle this, as it works only for one project running at a time.
   */
  protected generateSSHConfig(containerName: string) {
    ux.action.start('Generate SSH config')
    // Grab back existing file.
    const existing = execSync(this.dockerBin + ' exec ' + containerName + ' cat /home/ce-dev/.ssh/config').toString()
    let config: Array<string> = []
    this.activeProjectInfo.ssh_hosts.forEach(host => {
      let dest = '/dev/shm/' + host.host
      let entry = [
        'Host ' + host.host,
        'User ' + host.user,
        'IdentityFile ' + dest,
        ''
      ]
      config.push(...entry)
      execSync(this.dockerBin + ' cp ' + host.src_key + ' ' + containerName + ':' + '/tmp/' + host.host, {stdio: 'inherit'})
      execSync(this.dockerBin + ' exec -t ' + containerName + ' mv /tmp/' + host.host + ' ' + dest, {stdio: 'inherit'})
    })
    fs.writeFile(this.tmpSSHConfigFile, existing + config.join('\n') + '\n', () => {
      execSync(this.dockerBin + ' cp ' + this.tmpSSHConfigFile + ' ' + containerName + ':/home/ce-dev/.ssh/config', {stdio: 'inherit'})
    })
    ux.action.stop()
  }

  /**
   * Wrapper around docker-compose.
   */
  private up() {
    let running = this.getProjectRunningContainers()
    if (running.length) {
      ux.action.start('Project containers are already running, stopping.')
      execSync(this.dockerComposeBin + ' -p ' + this.activeProjectInfo.project_name + ' stop', {cwd: this.ceDevDir, stdio: 'inherit'})
      ux.action.stop()
    }
    ux.action.start('Starting project containers')
    execSync(this.dockerComposeBin + ' -p ' + this.activeProjectInfo.project_name + ' up -d', {cwd: this.ceDevDir, stdio: 'inherit'})
    ux.action.stop()
  }

  /**
   * Update the /etc/hosts file with container informations.
   */
  private updateHostsFile() {
    ux.action.start('Updating /etc/hosts file')
    this.gatherRunningContainers()
    this.generateHostsFile()
    ux.action.stop()
  }

  /**
   * Gather running containers.
   */
  private gatherRunningContainers() {
    const running = execSync(this.dockerBin + ' ps --quiet').toString()
    const runningContainers = running.split('\n').filter(item => {
      return (item.length)
    })
    runningContainers.forEach(containerName => {
      let ip = '127.0.0.1'
      if (this.config.platform === 'linux') {
        ip = execSync(this.dockerBin + ' inspect ' + containerName + ' --format={{.NetworkSettings.Networks.ce_dev.IPAddress}}').toString().trim()
      }
      //@todo Need a better check.
      if (ip !== '<no value>') {
        let aliasesString = execSync(this.dockerBin + ' inspect ' + containerName + ' --format={{.NetworkSettings.Networks.ce_dev.Aliases}}').toString().trim()
        let aliases = aliasesString.split(/[\[\]\ ]/).filter(Boolean)
        aliases.forEach(alias => {
          this.runningHosts.set(alias.toString(), ip)
        })
      }
    })

  }
  /**
   * Write hosts information.
   */
  private generateHostsFile() {
    let write = true
    const lines: Array<string> = []
    const lineReader = readline.createInterface({
      input: fs.createReadStream(this.hostsFile),
      crlfDelay: Infinity
    })
    lineReader.on('line', (line: string) => {
      if (line.indexOf(this.delimiterStart) === 0) {
        write = false
      }
      if (write) {
        lines.push(line)
      }
      if (line.indexOf(this.delimiterEnd) === 0) {
        write = true
      }
    })
    lineReader.on('close', () => {
      lines.push(this.delimiterStart)
      this.runningHosts.forEach((host, ip) => {
        lines.push(host + '    ' + ip)
      })
      lines.push(this.delimiterEnd)
      fs.writeFile(this.tmpHostsFile, lines.join('\n') + '\n', () => {
        execSync('sudo mv ' + this.tmpHostsFile + ' ' + this.hostsFile)
      })
    })
  }

  private performStartTasks() {
    const running = this.getProjectRunningContainersCeDev()
    if (running.length < 1) {
      return
    }
    running.forEach(containerName => {
      this.ensureOwnership(containerName)
      this.triggerUnison(containerName)
      this.generateSSHConfig(containerName)
    })
  }
  private triggerUnison(containerName: string) {
    if (this.activeProjectInfo.unison[containerName]) {
      ux.action.start('Trigger Unison file synchronisation')
      this.activeProjectInfo.unison[containerName].forEach(volume => {
        execSync(this.dockerBin + ' exec ' + containerName + ' /bin/sh /opt/unison-startup.sh ' + volume.src + ' ' + volume.dest + ' ' + volume.ignore, {stdio: 'inherit'})
      })
      ux.action.stop()
    }
  }
}
