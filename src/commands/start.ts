import BaseCmd from '../base-cmd-abstract.ts'
import ComposeConfigBare from '../compose-config-bare-interface.ts'
import IPManager from '../ip-manager.ts'
import {execSync} from 'child_process'
import { Flags, ux } from '@oclif/core'
import * as fs from 'fs'
import * as readline from 'readline'

export default class StartCmd extends BaseCmd {
  static description = 'Spin up containers using docker compose and update /etc/hosts file.'

  static examples = [
    '$ ce-dev start',
  ]

  static flags = {
    help: Flags.help({char: 'h'}),
  }

  /**
   * @member
   * Pairs of Hostnames/IP.
   */
  private readonly runningHosts: Map<string, string> = new Map()

  /**
   * @member
   * File path to host file.
   */
  private readonly hostsFile = '/etc/hosts'

  /**
   * @member
   * File path to tmp host file.
   */
  private readonly tmpHostsFile: string = this.config.cacheDir + '/etcHosts'

  /**
   * @member
   * File path to tmp ssh config file.
   */
  private readonly tmpSSHConfigFile: string = this.config.cacheDir + '/sshConfig'

  /**
   * @member
   * Delimiter marker for managed entries.
   */
  private readonly delimiterStart = '######### CE-DEV ### START ### DO NOT EDIT MANUALLY BELOW'

  /**
   * @member
   * Delimiter marker for managed entries.
   */
  private readonly delimiterEnd = '######### CE-DEV ### END ### DO NOT EDIT MANUALLY ABOVE'

  /**
   * @member
   * Docker compose content parsed from yaml.
   */
  private readonly composeConfig: ComposeConfigBare

  /**
   * @inheritdoc
   */
  public constructor(argv: string[], config: any) {
    super(argv, config)
    this.ensureActiveComposeFile()
    this.composeConfig = this.loadComposeConfig(this.activeComposeFilePath)
  }

  /**
   * @inheritdoc
   */
  async run(): Promise<any> {
    this.ensureAliases()
    this.up()
    this.updateHostsFile()
    this.performStartTasks()
  }

  private ensureAliases(): void {
    if (this.config.platform !== 'darwin') {
      return
    }
    if (!this.composeConfig.services) {
      return
    }
    const ipManager = new IPManager(this.config, this.dockerBin)
    for (const service of Object.values(this.composeConfig.services)) {
      if (service.networks && Object.prototype.hasOwnProperty.call(service.networks, 'ce_dev')) {
        // @ts-ignore
        const ip = service.networks.ce_dev.ipv4_address
        ipManager.createInterfaceAlias(ip)
      }
    }
  }

  /**
   * Match numeric user ids  with hosts.
   *
   * @param containerName
   * Name of a container.
   */
  private ensureOwnership(containerName: string): void {
    const uid = process.getuid?.() ?? 1000
    let gid = process.getgid?.() ?? 1000
    ux.action.start('Ensuring file ownership')
    execSync(this.dockerBin + ' exec ' + containerName + ' /bin/sh /opt/ce-dev-ownership.sh ' + uid?.toString() + ' ' + gid.toString(), {stdio: 'inherit'})
    execSync(this.dockerBin + ' exec ' + containerName + ' chown -R ce-dev:ce-dev /home/ce-dev/.local', {stdio: 'inherit'})
    ux.action.stop()
  }

  /**
   * Generate SSH Config.
   *
   * @param containerName
   * Container name.
   */
  private generateSSHConfig(containerName: string): void {
    ux.action.start('Generate SSH config')
    // Grab back existing file.
    const existing = execSync(this.dockerBin + ' exec ' + containerName + ' cat /home/ce-dev/.ssh/config').toString()
    const config: Array<string> = []
    this.activeProjectInfo.ssh_hosts.forEach(host => {
      const dest = '/home/ce-dev/.ssh/' + host.host
      const entry = [
        'Host ' + host.host,
        'User ' + host.user,
        'IdentityFile ' + dest,
        '',
      ]
      config.push(...entry)
      execSync(this.dockerBin + ' cp ' + host.src_key + ' ' + containerName + ':' + dest, {stdio: 'inherit'})
    })
    fs.writeFile(this.tmpSSHConfigFile, existing + config.join('\n') + '\n', () => {
      execSync(this.dockerBin + ' cp ' + this.tmpSSHConfigFile + ' ' + containerName + ':/home/ce-dev/.ssh/config', {stdio: 'inherit'})
    })
    ux.action.stop()
  }

  /**
   * Wrapper around docker compose.
   */
  private up(): void {
    const running = this.getProjectRunningContainers()
    if (running.length > 0) {
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
  private updateHostsFile(): void {
    ux.action.start('Updating /etc/hosts file')
    this.gatherRunningContainers()
    this.generateHostsFile()
    ux.action.stop()
  }

  /**
   * Gather running containers.
   */
  private gatherRunningContainers(): void {
    const running = execSync(this.dockerBin + ' ps -q --filter network=ce_dev').toString()
    const runningContainers = running.split('\n').filter(item => {
      return (item.length)
    })
    runningContainers.forEach(containerName => {
      const ip = execSync(this.dockerBin + ' inspect ' + containerName + ' --format {{.NetworkSettings.Networks.ce_dev.IPAddress}}').toString().trim()
      const aliasesString = execSync(this.dockerBin + ' inspect ' + containerName + ' --format={{.NetworkSettings.Networks.ce_dev.Aliases}}').toString().trim()
      const aliases = aliasesString.split(/[[\] ]/).filter(Boolean)

      aliases.forEach(alias => {
        this.runningHosts.set(alias.toString(), ip)
      })
    })
  }

  /**
   * Write hosts information.
   */
  private generateHostsFile(): void {
    let write = true
    const lines: Array<string> = []
    const lineReader = readline.createInterface({
      input: fs.createReadStream(this.hostsFile),
      crlfDelay: Infinity,
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

  private performStartTasks(): void {
    const running = this.getProjectRunningContainersCeDev()
    if (running.length === 0) {
      return
    }
    running.forEach(containerName => {
      this.ensureOwnership(containerName)
      this.triggerUnison(containerName)
      this.generateSSHConfig(containerName)
    })
  }

  private triggerUnison(containerName: string): void {
    if (this.activeProjectInfo.unison[containerName]) {
      ux.action.start('Trigger Unison file synchronisation')
      this.activeProjectInfo.unison[containerName].forEach(volume => {
        execSync(this.dockerBin + ' exec ' + containerName + ' /bin/sh /opt/unison-startup.sh ' + volume.src + ' ' + volume.dest + ' ' + volume.ignore, {stdio: 'inherit'})
      })
      ux.action.stop()
    }
  }
}
