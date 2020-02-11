import {flags} from '@oclif/command'

import BaseCmd from '../base-cmd-abstract'
import ComposeConfig from '../compose-config-interface'
import ComposeConfigService from '../compose-config-service-interface'

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
    this.injectContainersSSH()
    this.injectContainersNetworking()
    this.injectContainersHostname()
    this.injectContainersSysFs()
    this.injectProjectInfo()
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
    for (let [name, service] of Object.entries(this.composeConfig.services)) {
      let fullName = this.composeConfig['x-ce_dev'].project_name + '-' + name
      this.composeConfig.services[fullName] = service
      delete (this.composeConfig.services[name])
      service.container_name = fullName
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
    for (let service of Object.values(this.composeConfig.services)) {
      // Manually configured, we do nothing.
      if (service.networks instanceof Object) {
        continue
      }
      let host_aliases: any = []
      if (service['x-ce_dev'] && service['x-ce_dev'].hostnames) {
        service['x-ce_dev'].hostnames.forEach(alias => {
          host_aliases.push(alias)
        })
      }
      service.networks = {
        ce_dev: {
          aliases: host_aliases
        }
      }
      if (this.config.platform === 'darwin') {
        this.assignContainerPortForwarding(service)
      }
    }
    // Add general network.
    if (this.composeConfig.networks) {
      return
    }
    this.composeConfig.networks = {
      ce_dev: {
        name: 'ce_dev',
        driver: 'bridge',
        external: true
      }
    }
  }

  /**
   * Mac OS only. Replace exposed ports with forwarding.
   * @param service
   * Service definition.
   *
   */
  private assignContainerPortForwarding(service: ComposeConfigService) {
    if (service.expose instanceof Array) {
      if (service.ports instanceof Array === false) {
        service.ports = []
      }
      service.expose.forEach(port => {
        service.ports.push([port, port].join(':'))
      })
      service.ports = [...new Set(service.ports)]
    }
  }
  /**
   * Gather mount points for ansible playbooks.
   */
  private injectProjectInfo() {
    for (let service of Object.values(this.composeConfig.services)) {
      if (service['x-ce_dev'] && service['x-ce_dev'].ansible && service['x-ce_dev'].ansible.path) {
        let absolutePath = this.getPathFromRelative(service['x-ce_dev'].ansible.path)
        if (absolutePath.length < 3) {
          continue
        }
        this.activeProjectInfo.ansible_paths[service.container_name] = absolutePath
      }
    }
    this.activeProjectInfo.project_name = this.composeConfig['x-ce_dev'].project_name
    this.saveActiveProjectInfo()
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
    for (let service of Object.values(this.composeConfig.services)) {
      delete service['x-ce_dev']
    }
  }
}
