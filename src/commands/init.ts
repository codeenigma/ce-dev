import {flags} from '@oclif/command'
import {execSync} from 'child_process'

import BaseCmd from '../base-cmd-abstract'
import ComposeConfig from '../compose-config-interface'
import ComposeConfigService from '../compose-config-service-interface'

const fspath = require('path')
export default class InitCmd extends BaseCmd {
  static description = 'Generates a docker-compose.yml file from a template'
  static examples = [
    '$ ce-dev init --template example.compose.yml',
  ]
  static flags = {
    help: flags.help({char: 'h'}),
    template: flags.string({
      char: 't',
      description: 'path to a docker-compose template file, relative to the project root',
      default: 'ce-dev.compose.yml'
    })
  }
  /**
   * @var
   * Absolute path to the Compose file template.
   */
  private readonly composeTemplate: string

  /**
   * @var
   * Docker compose content parsed from yaml.
   */
  private readonly composeConfig: ComposeConfig
  /**
   * @var
   * Network range.
   */
  private network = ''
  /**
   * @var
   * Network name.
   */
  private networkName = ''
  /**
   * @var
   * Hostnames/IP pairs.
   */
  private readonly hostnames: Map<string, string> = new Map()

  /**
   * @inheritdoc
   */
  public constructor(argv: string[], config: any) {
    super(argv, config)
    const {flags} = this.parse(InitCmd)
    this.composeTemplate = this.getPathFromRelative(flags.template)
    this.composeConfig = this.LoadComposeConfig(this.composeTemplate)
  }
  /**
   * @inheritdoc
   */
  async run() {
    this.generateCompose()
    this.removePrivateProperties()
    this.writeYaml(this.activeComposeFilePath, this.composeConfig)
  }

  /**
   * Alter parsed config to be written in actual compose file.
   */
  private generateCompose() {
    this.injectNetwork()
    this.injectContainersSSH()
    this.injectContainersHostname()
    this.injectContainersNetworking()
    this.injectContainersExtraHosts()
    this.injectContainersSysFs()
    this.injectControllerAnsibleInfo()
  }
  /**
   * Defines a custom private network.
   */
  private injectNetwork() {
    // Do nothing if we already have some custom one(s).
    if (this.composeConfig.networks instanceof Object) {
      return
    }
    // Gather available range.
    this.assignNetwork()
    const network = {
      [this.networkName]: {
        name: this.networkName,
        driver: 'bridge',
        ipam: {
          driver: 'default',
          config: [
            {subnet: this.network + '.0/24'}
          ]
        }
      }
    }
    this.composeConfig.networks = network
  }
  /**
   * Assign an available Docker network.
   */
  private assignNetwork() {
    this.log('Checking available network ranges...')
    this.log('This requires admin priviledges')
    for (let i = 0; i < 255; i++) {
      this.network = '10.0.' + Math.floor(Math.random() * (254 - 1) + 2)
      let cmd = 'sudo ifconfig | grep ' + this.network + '. | wc -l'
      let exists = execSync(cmd).toString().trim()
      if (exists === '0') {
        this.log('Selecting network range ' + this.network)
        this.networkName = 'ce-dev-' + this.network.replace(/\./g, '_')
        return
      }
    }
    // We could not find a range.
    this.error('Could not find an available network range')
    this.exit(1)
  }
  /**
   * Adds port forwarding for SSH.
   * This can only work for containers using
   * our base images.
   * @todo Do want to be more specific and only
   * apply to a set flag like x-ce_dev.ssh === true?
   */
  private injectContainersSSH() {
    for (let service of Object.values(this.composeConfig.services)) {
      if (service['x-ce_dev'] instanceof Object === false) {
        continue
      }
      if (service.expose instanceof Array === false) {
        service.expose = []
      }
      service.expose.push('22')
      service.expose = [...new Set(service.expose)]
    }
  }
  /**
   * Inject container name as hostname.
   */
  private injectContainersHostname() {
    for (let service of Object.values(this.composeConfig.services)) {
      if (service.hostname) {
        continue
      }
      service.hostname = service.container_name
    }
  }

  /**
   * Inject a fixed ip to containers and amend networking accordingly.
   */
  private injectContainersNetworking() {
    let counter = 2
    for (let service of Object.values(this.composeConfig.services)) {
      // Manually configured, we do nothing.
      if (service.networks instanceof Object) {
        continue
      }
      let ip = this.network + '.' + counter
      this.assignContainerIP(service, ip)
      this.collectContainerHostnames(service, ip)
      if (this.config.platform === 'darwin') {
        this.assignContainerPortForwarding(service, ip)
      }
      counter++
    }
  }
  /**
   * Assign ip to a container.
   * @param service
   * Service definition.
   * @param ip
   * Assigned IP.
   */
  private assignContainerIP(service: ComposeConfigService, ip: string) {
    service.networks = {
      [this.networkName]: {
        ipv4_address: ip
      }
    }
  }
  /**
   * Collect container hostname for injecting later.
   * @param service
   * Service definition.
   * @param ip
   * Assigned IP.
   */
  private collectContainerHostnames(service: ComposeConfigService, ip: string) {
    if (service['x-ce_dev'] && service['x-ce_dev'].hostnames instanceof Array) {
      service['x-ce_dev'].hostnames.forEach(hostname => {
        this.hostnames.set(hostname, ip)
      })
    }
  }
  /**
   * Mac OS only. Replace exposed ports with forwarding.
   * @param service
   * Service definition.
   * @param ip
   * Assigned IP.
   */
  private assignContainerPortForwarding(service: ComposeConfigService, ip: string) {
    if (service.expose instanceof Array) {
      if (service.ports instanceof Array === false) {
        service.ports = []
      }
      service.expose.forEach(port => {
        service.ports.push([ip, port, port].join(':'))
      })
      service.ports = [...new Set(service.ports)]
    }
  }

  /**
   * Adds extra hosts entries for all knowns containers.
   */
  private injectContainersExtraHosts() {
    for (let service of Object.values(this.composeConfig.services)) {
      if (service.extra_hosts instanceof Array === false) {
        service.extra_hosts = []
      }
      for (let [host, ip] of this.hostnames) {
        service.extra_hosts.push([host, ip].join(':'))
      }
    }
  }
  /**
   * Gather mount points for ansible playbooks.
   */
  private injectControllerAnsibleInfo() {
    let ansiblePaths = []
    let mountPaths = []
    const controller = this.getControllerService(this.composeConfig)
    if (controller === null) {
      return
    }
    for (let service of Object.values(this.composeConfig.services)) {
      if (service['x-ce_dev'] && service['x-ce_dev'].ansible && service['x-ce_dev'].ansible.path) {
        let absolutePath = this.getPathFromRelative(service['x-ce_dev'].ansible.path)
        if (absolutePath.length < 3) {
          continue
        }
        let relativePath = '/ce-dev/' + this.getRelativePath(absolutePath)
        ansiblePaths.push({
          containerName: service.container_name,
          ansiblePath: relativePath
        })
        mountPaths.push([fspath.dirname(absolutePath), fspath.dirname(relativePath), 'delegated'].join(':'))
      }
    }
    // Store for provisioning.
    this.writeYaml(this.activeAnsibleInfoFilePath, ansiblePaths)
    // Add as volumes on the controller.
    if (!controller.volumes) {
      controller.volumes = []
    }
    mountPaths.forEach(volume => {
      controller.volumes.push(volume)
    })
    controller.volumes = [...new Set(controller.volumes)]
  }
  /**
   * Inject SysFs for systemd.
   */
  private injectContainersSysFs() {
    for (let service of Object.values(this.composeConfig.services)) {
      if (service['x-ce_dev']) {
        if (!service.volumes) {
          service.volumes = []
        }
        service.volumes.push('/sys/fs/cgroup:/sys/fs/cgroup:ro')
        service.volumes = [...new Set(service.volumes)]
        if (!service.cap_add) {
          service.cap_add = []
        }
        service.cap_add.push('SYS_ADMIN')
        service.cap_add = [...new Set(service.cap_add)]
      }
    }
  }
  /**
   * Clean up compose structure.
   */
  private removePrivateProperties() {
    delete this.composeConfig['x-ce_dev']
    // for (let [name, service] of Object.entries(this.composeConfig.services)) {
    //   delete service['x-ce_dev']
    // }
  }
}
