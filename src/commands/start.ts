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
    if (this.config.platform === 'darwin') {
      this.createLoopAliases()
    }
    this.up()
    this.updateHostsFile()
  }

  /**
   * Wrapper around docker-compose.
   */
  private up() {
    this.log('Starting containers with docker-compose up -d')
    execSync(this.dockerComposeBin + ' up -d', {cwd: this.ceDevDir, stdio: 'inherit'})
  }
  /**
   * Mac OS. Set-up loopback aliases.
   */
  private createLoopAliases() {
    this.log('Setting up loopback interface aliases. This requires administrative privileges.')
    for (let service of Object.values(this.composeConfig.services)) {
      if (service.networks instanceof Object === false) {
        continue
      }
      for (let network of Object.values(service.networks)) {
        if (network.ipv4_address) {
          this.log('Creating loopback alias ' + network.ipv4_address)
          execSync('sudo ifconfig lo0 alias ' + network.ipv4_address + '/32')
        }
      }
    }
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
    runningContainers.forEach(container => {
      let hostInfo = execSync(this.dockerBin + ' inspect ' + container + ' --format={{.HostConfig.ExtraHosts}}').toString()
      let hostnames = hostInfo.trim().replace('[', '').replace(']', '').split(':')
      if (hostnames[0].length > 0) {
        this.runningHosts.set(hostnames[0], hostnames[1])
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
}
