import {flags} from '@oclif/command'

import BaseCmd from '../base-cmd-abstract'
import CeDevConfig from '../ce-dev-config-interface'
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
      default: 'ce-dev.compose.prebuilt.yml'
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
  private readonly composeConfig: CeDevConfig

  /**
   * @inheritdoc
   */
  public constructor(argv: string[], config: any) {
    super(argv, config)
    const {flags} = this.parse(InitCmd)
    this.composeTemplate = this.getPathFromRelative(flags.template)
    if (!this.composeTemplate) {
      this.composeTemplate = this.getPathFromRelative('ce-dev.compose.yml')
    }
    this.composeConfig = this.LoadComposeConfig(this.composeTemplate) as CeDevConfig
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
    this.injectContainersNetworking()
    this.injectContainersSSH()
    this.injectContainersHostname()
    this.injectContainersSysFs()
    this.injectCacheVolumes()
    this.injectProjectVolume()
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
      if (!service.volumes) {
        service.volumes = []
      }
      service.volumes.push('ce_dev_ssh:/home/ce-dev/.ssh')
      service.volumes = [...new Set(service.volumes)]
    }
    if (!this.composeConfig.volumes) {
      this.composeConfig.volumes = {}
    }
    this.composeConfig.volumes.ce_dev_ssh = {
      external: true
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
      if (service['x-ce_dev'] && service['x-ce_dev'].host_aliases) {
        service['x-ce_dev'].host_aliases.forEach(alias => {
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
        service.ports?.push([port, port].join(':'))
      })
      service.ports = [...new Set(service.ports)]
    }
  }
  /**
   * Gather mount points for ansible playbooks.
   */
  private injectProjectInfo() {
    this.activeProjectInfo.provision = []
    if (this.composeConfig['x-ce_dev'].provision) {
      this.composeConfig['x-ce_dev'].provision.forEach(playbookPath => {
        let absolutePath = this.getPathFromRelative(playbookPath)
        if (absolutePath.length > 3) {
          this.activeProjectInfo.provision.push(absolutePath)
        }
      })
    }
    this.activeProjectInfo.deploy = []
    if (this.composeConfig['x-ce_dev'].deploy) {
      this.composeConfig['x-ce_dev'].deploy.forEach(playbookPath => {
        let absolutePath = this.getPathFromRelative(playbookPath)
        if (absolutePath.length > 3) {
          this.activeProjectInfo.deploy.push(absolutePath)
        }
      })
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
   * Inject volumes.
   */
  private injectCacheVolumes() {
    for (let service of Object.values(this.composeConfig.services)) {
      if (service['x-ce_dev']) {
        if (!service.volumes) {
          service.volumes = []
        }
        service.volumes.push('/var/log')
        service.volumes.push('/var/cache')
        service.volumes.push('/var/backups')
        service.volumes.push('/var/tmp')
        service.volumes.push('/var/spool')
        service.volumes.push('/var/mail')
        service.volumes.push('ce_dev_apt_cache:/var/cache/apt/archives')
        service.volumes.push('ce_dev_composer_cache:/home/ce-dev/.composer/cache')
        service.volumes.push('ce_dev_nvm_node:/home/ce-dev/.nvm/versions/node')
        //@todo npm/yarn
        service.volumes = [...new Set(service.volumes)]
      }
    }
    if (!this.composeConfig.volumes) {
      this.composeConfig.volumes = {}
    }
    this.composeConfig.volumes.ce_dev_apt_cache = {
      external: true
    }
    this.composeConfig.volumes.ce_dev_composer_cache = {
      external: true
    }
    this.composeConfig.volumes.ce_dev_nvm_node = {
      external: true
    }
  }
  /**
   * Inject volumes.
   */
  private injectProjectVolume() {
    for (let service of Object.values(this.composeConfig.services)) {
      if (service['x-ce_dev']) {
        if (!service.volumes) {
          service.volumes = []
        }
        service.volumes.push('../:/.x-ce-dev:delegated')
        service.volumes = [...new Set(service.volumes)]
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
