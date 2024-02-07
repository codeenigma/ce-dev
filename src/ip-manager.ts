import { Config } from '@oclif/core'
import {execSync} from 'node:child_process'

/**
 * Manages static IP addressing.
 */

export default class IPManager {

  /**
   * @member
   *   Config from oclif.
   */
  private readonly config: Config

  /**
   * @member
   *   Docker executable path.
   */
  private readonly dockerBin: string = 'docker'

  /**
   * @member
   *   Last assigned IP.
   */
  private lastAssignedIP = 10

  /**
   * @member
   *   Network base subnet.
   */
  private readonly netBase: string

  public constructor(config: Config, dockerBin: string) {
    this.dockerBin = dockerBin
    this.config = config
    this.netBase = this.getNetBase()
  }

  /**
   * Mac OS only. Creates a loopback alias.
   *
   * @param ip
   * IP to create the alias with.
   *
   * @returns void
   */
  public createInterfaceAlias(ip: string): void {
    // @todo check for existing.
    execSync('sudo ifconfig lo0 alias ' + ip)
  }

  /**
   * Constructs an newly incremented ip address.
   *
   * @returns
   * An IP address
   */
  public getAvailableIP(): string {
    while (this.lastAssignedIP < IPManager.maxIP()) {
      this.lastAssignedIP++
      const ip = this.netBase + '.' + this.lastAssignedIP;
      if (this.isAvailableIP(ip)) {
        return ip;
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
   * Gather max IP we can assign.
   *
   * @return int
   *   The max IP.
   */
  public static maxIP() { return 200 }

  /**
   * Gather base subnet.
   *
   * @returns
   *   Base subnet.
   */
  public getNetBase(): string {
    if (this.networkExists()) {
      const gw = execSync(this.dockerBin + ' network inspect ce_dev --format "{{range.IPAM.Config}}{{.Gateway}}{{end}}"').toString().trim()
      return gw.slice(0, - 2)
    }

    return this.getAvailableSubnet()
  }


  /**
   * Constructs a newly incremented subnet base.
   *
   * @returns
   * A base subnet string.
   */
  private getAvailableSubnet(): string {
    const ifconfigCommand = this.config.platform === 'darwin' ? 'ifconfig' : 'ip a'
    for (let i = 18; i <= 31; i++) {
      const subnet = '172.' + i + '.0'
      const existing = execSync('sudo ' + ifconfigCommand + ' | grep ' + subnet + ' | wc -l').toString().trim()
      if (existing === '0') {
        return subnet
      }
    }

    throw new Error('Could not assign an available Subnet range.')
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

    return existing !== '0';
  }

  /**
   *  Check if an IP is available or not.
   *
   * @param ip
   *   The IP to check as string.
   * @return boolean
   *   TRUE is IP is available, otherwise FALSE.
   */
  private isAvailableIP(ip: string): boolean {
    const existing = execSync(this.dockerBin + ' ps -a -q --filter network=ce_dev').toString();
    const filtered = existing.split('\n').filter(item => item.length);
    const assigned = [];

    for (const containerID of filtered) {
      assigned.push(execSync(this.dockerBin + ' inspect --format "{{.NetworkSettings.Networks.ce_dev.IPAMConfig.IPv4Address}}" ' + containerID).toString().trim());
    }

    return !assigned.includes(ip);
  }

}
