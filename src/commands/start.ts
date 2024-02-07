import {Config, Flags, ux} from '@oclif/core'
import {execSync} from 'node:child_process'
import fs from 'node:fs'
import readline from 'node:readline'

import BaseCmd from '../abstracts/base-cmd-abstract.js'
import ComposeConfigBare from '../interfaces/docker-compose-config-bare-interface.js'
import IPManager from '../ip-manager.js'

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
   * Docker compose content parsed from yaml.
   */
  private readonly composeConfig: ComposeConfigBare

  /**
   * @member
   * Delimiter marker for managed entries.
   */
  private readonly delimiterEnd = '######### CE-DEV ### END ### DO NOT EDIT MANUALLY ABOVE'

  /**
   * @member
   * Delimiter marker for managed entries.
   */
  private readonly delimiterStart = '######### CE-DEV ### START ### DO NOT EDIT MANUALLY BELOW'

  /**
   * @member
   * File path to host file.
   */
  private readonly hostsFile = '/etc/hosts'

  /**
   * @member
   * Pairs of Hostnames/IP.
   */
  private readonly runningHosts: Map<string, string> = new Map()

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
   * @inheritdoc
   */
  public constructor(argv: string[], config: Config) {
    super(argv, config)
    this.ensureActiveComposeFile()
    this.composeConfig = this.loadComposeConfig(this.activeComposeFilePath)
  }

  /**
   * @inheritdoc
   */
  async run(): Promise<void> {
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
   *
   * @return void
   */
  private ensureOwnership(containerName: string): void {
    let gid = 1000
    let uid = 1000

    if (process.getuid) {
      uid = process.getuid()
    }

    if (process.getegid && process.getgid && process.getgid() > 1000) {
      gid = process.getegid()
    }

    ux.action.start('Ensuring file ownership')
    execSync(this.dockerBin + ' exec ' + containerName + ' /bin/sh /opt/ce-dev-ownership.sh ' + uid.toString() + ' ' + gid.toString(), {stdio: 'inherit'})
    execSync(this.dockerBin + ' exec ' + containerName + ' chown -R ce-dev:ce-dev /home/ce-dev/.local', {stdio: 'inherit'})
    ux.action.stop()
  }

  /**
   * Gather running containers.
   *
   * @return void
   */
  private gatherRunningContainers(): void {
    const running = execSync(this.dockerBin + ' ps -q --filter network=ce_dev').toString()
    const runningContainers = running.split('\n').filter(item => (item.length))
    for (const containerName of runningContainers) {
      const ip = execSync(this.dockerBin + ' inspect ' + containerName + ' --format {{.NetworkSettings.Networks.ce_dev.IPAddress}}').toString().trim()
      const aliasesString = execSync(this.dockerBin + ' inspect ' + containerName + ' --format={{.NetworkSettings.Networks.ce_dev.Aliases}}').toString().trim()
      const aliases = aliasesString.split(/[ [\]]/).filter(Boolean)

      for (const alias of aliases) {
        this.runningHosts.set(alias.toString(), ip)
      }
    }
  }

  /**
   * Write hosts information.
   *
   * @return void
   */
  private generateHostsFile(): void {
    let write = true
    const lines: Array<string> = []
    const lineReader = readline.createInterface({
      crlfDelay: Number.POSITIVE_INFINITY,
      input: fs.createReadStream(this.hostsFile),
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
      for (const [ip, host] of this.runningHosts.entries()) {
        lines.push(host + '    ' + ip)
      }

      lines.push(this.delimiterEnd)
      fs.writeFile(this.tmpHostsFile, lines.join('\n') + '\n', () => {
        execSync('sudo mv ' + this.tmpHostsFile + ' ' + this.hostsFile)
      })
    })
  }

  /**
   * Generate SSH Config.
   *
   * @param containerName
   *   Container name.
   *
   * @return void
   */
  private generateSSHConfig(containerName: string): void {
    ux.action.start('Generate SSH config')
    // Grab back existing file.
    const existing = execSync(this.dockerBin + ' exec ' + containerName + ' cat /home/ce-dev/.ssh/config').toString()
    const config: Array<string> = []
    for (const host of this.activeProjectInfo.ssh_hosts) {
      const dest = '/home/ce-dev/.ssh/' + host.host
      const entry = [
        'Host ' + host.host,
        'User ' + host.user,
        'IdentityFile ' + dest,
        '',
      ]
      config.push(...entry)
      execSync(this.dockerBin + ' cp ' + host.src_key + ' ' + containerName + ':' + dest, {stdio: 'inherit'})
    }

    fs.writeFile(this.tmpSSHConfigFile, existing + config.join('\n') + '\n', () => {
      execSync(this.dockerBin + ' cp ' + this.tmpSSHConfigFile + ' ' + containerName + ':/home/ce-dev/.ssh/config', {stdio: 'inherit'})
    })
    ux.action.stop()
  }

  private performStartTasks(): void {
    const running = this.getProjectRunningContainersCeDev()
    if (running.length === 0) {
      return
    }

    for (const containerName of running) {
      this.ensureOwnership(containerName)
      this.triggerUnison(containerName)
      this.generateSSHConfig(containerName)
    }
  }

  private triggerUnison(containerName: string): void {
    if (this.activeProjectInfo.unison[containerName]) {
      ux.action.start('Trigger Unison file synchronisation')
      for (const volume of this.activeProjectInfo.unison[containerName]) {
        execSync(this.dockerBin + ' exec ' + containerName + ' /bin/sh /opt/unison-startup.sh ' + volume.src + ' ' + volume.dest + ' ' + volume.ignore, {stdio: 'inherit'})
      }

      ux.action.stop()
    }
  }

  /**
   * Wrapper around docker compose.
   *
   * @return void
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
   *
   * @return void
   */
  private updateHostsFile(): void {
    ux.action.start('Updating /etc/hosts file')
    this.gatherRunningContainers()
    this.generateHostsFile()
    ux.action.stop()
  }
}
