import {IConfig} from '@oclif/config'
import YamlParser from './yaml-parser'
import {execSync} from 'child_process'

const fspath = require('path')
/**
 * Manages static IP addressing.
 */

export default class IPManager {
  /**
   * @member
   * Docker executable path.
   */
  private readonly dockerBin: string = 'docker'

  /**
   * @member
   * Config from oclif.
   */
  private readonly config: IConfig

  /**
   * @member
   * Path to our data file.
   */
  private readonly NetworkConfigFilePath: string

  /**
   * @member
   * Last assigned IP.
   */
  private lastAssignedIP = 10

  /**
   * Network base subnet.
   */
  private readonly netBase: string

  public constructor(config: IConfig, dockerBin: string) {
    this.dockerBin = dockerBin
    this.config = config
    this.NetworkConfigFilePath = fspath.resolve(this.config.dataDir + '/ip.yml')
    this.netBase = this.getNetBase()
    const stored = YamlParser.parseYaml(this.NetworkConfigFilePath, true)
    if (stored && stored < 200) {
      this.lastAssignedIP = stored
    }
  }

  /**
   * Constructs an newly incremented ip address.
   *
   * @returns
   * An IP address
   */
  public getAvailableIP(): string {
    while (this.lastAssignedIP < 200) {
      this.lastAssignedIP++
      const existing = execSync(this.dockerBin + ' ps -a -q --filter network=ce_dev').toString()
      const filtered = existing.split('\n').filter(item => {
        return item.length
      })
      const assigned: Array<string> = []
      filtered.forEach(containerID => {
        assigned.push(execSync(this.dockerBin + ' inspect --format "{{.NetworkSettings.Networks.ce_dev.IPAMConfig.IPv4Address}}" ' + containerID).toString().trim())
      })
      const ip = this.netBase + '.' + this.lastAssignedIP
      if (assigned.indexOf(ip) === -1) {
        YamlParser.writeYaml(this.NetworkConfigFilePath, this.lastAssignedIP)
        return ip
      }
    }
    throw new Error('Could not assign an available IP')
  }

  /**
   * Hardcodes the controller IP.
   *
   * @returns
   * An IP address
   */
  public getControllerIP(): string {
    return this.netBase + '.' + 2
  }

  /**
   * Mac OS only. Creates a loopback alias.
   *
   * @param ip
   * IP to create the alias with.
   */
  public createInterfaceAlias(ip: string): void {
    // @todo check for existing.
    execSync('sudo ifconfig lo0 alias ' + ip)
  }

  /**
   * Gather base subnet.
   *
   * @returns
   * Base subnet.
   */
  public getNetBase(): string {
    if (this.networkExists()) {
      const gw = execSync(this.dockerBin + ' network inspect ce_dev --format "{{range.IPAM.Config}}{{.Gateway}}{{end}}"').toString().trim()
      return gw.substr(0, gw.length - 2)
    }
    return this.getAvailableSubnet()
  }

  /**
   * Check if our network is up and running.
   *
   * @returns
   * True if network exists, else false.
   */
  private networkExists(): boolean {
    const existing = execSync(
      this.dockerBin + ' network ls | grep -w ce_dev | wc -l',
    )
    .toString()
    .trim()
    if (existing === '0') {
      return false
    }
    return true
  }

  /**
   * Constructs an newly incremented subnet base.
   *
   * @returns
   * A base subnet string.
   */
  private getAvailableSubnet(): string {
    for (let i = 18; i <= 31; i++) {
      const subnet = '172.' + i + '.0'
      const existing = execSync('sudo ifconfig | grep ' + subnet + ' | wc -l').toString().trim()
      if (existing === '0') {
        return subnet
      }
    }
    throw new Error('Could not assign an available Subnet range.')
  }
}
