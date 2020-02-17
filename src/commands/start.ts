import {flags} from '@oclif/command'
import {execSync} from 'child_process'

import BaseCmd from '../base-cmd-abstract'
import ComposeConfig from '../compose-config-interface'

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
   * Docker compose content parsed from yaml.
   */
  private readonly composeConfig: ComposeConfig
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
  private readonly tmpHostsFile: string
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
    this.composeConfig = this.LoadComposeConfig(this.activeComposeFilePath)
    this.tmpHostsFile = this.config.cacheDir + '/etcHosts'
  }

  /**
   * @inheritdoc
   */
  async run() {
    this.up()
    this.updateHostsFile()
    this.ensureUid()
  }

  /**
   * Wrapper around docker-compose.
   */
  private up() {
    this.log('Starting project containers...')
    execSync(this.dockerComposeBin + ' -p ' + this.activeProjectInfo.project_name + ' up -d', {cwd: this.ceDevDir, stdio: 'inherit'})
  }

  /**
   * Update the /etc/hosts file with container informations.
   */
  private updateHostsFile() {
    this.log('Updating /etc/hosts file')
    this.gatherRunningContainers()
    this.generateHostsFile()
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
      let ip = execSync(this.dockerBin + ' inspect ' + containerName + ' --format={{.NetworkSettings.Networks.ce_dev.IPAddress}}').toString().trim()
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

  private ensureUid() {
    if (this.config.platform !== 'linux') {
      return
    }
    const running = this.getProjectRunningContainersCeDev()
    if (running.length < 1) {
      return
    }
    // Ensure uid match on Linux.
    // @todo this should be on CMD, but system.d gets in the way.
    running.forEach(containerName => {
      let uid = process.getuid()
      let gid = process.getgid()
      if (uid > 1000 && gid > 1000) {
        execSync(this.dockerBin + ' exec ' + containerName + ' /bin/sh /opt/ce-dev-start.sh ' + uid.toString() + ' ' + gid.toString() + ' || exit 0', {stdio: 'inherit'})
      }
    })
  }
}
