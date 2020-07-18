import * as inquirer from 'inquirer'

import BaseCmd from '../base-cmd-abstract'
import ComposeConfig from '../compose-config-interface'
import ComposeConfigService from '../compose-config-service-interface'
import IPManager from '../ip-manager'
import UnisonVolumeContainer from '../ce-dev-project-config-unison-volume-interface'
import YamlParser from '../yaml-parser'
import {flags} from '@oclif/command'

inquirer.registerPrompt('fuzzypath', require('inquirer-fuzzy-path'))
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
      default: 'ce-dev.compose.prebuilt.yml',
    }),
  }

  /**
   * @member
   * Absolute path to the Compose file template.
   */
  private readonly composeTemplate: string

  /**
   * @member
   * Docker compose content parsed from yaml.
   */
  private readonly composeConfig: ComposeConfig

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
    this.composeConfig = this.loadComposeConfig(this.composeTemplate) as ComposeConfig
  }

  /**
   * @inheritdoc
   */
  async run(): Promise<any> {
    this.generateProjectInfo()
    this.generateCompose()
    this.removePrivateProperties()
    YamlParser.writeYaml(this.activeComposeFilePath, this.composeConfig)
  }

  /**
   * Alter parsed config to be written in actual compose file.
   */
  private generateCompose(): void {
    this.injectContainersNetworking()
    this.injectContainersSSH()
    this.injectContainersHostname()
    this.injectContainersSysFs()
    this.injectCacheVolumes()
    this.injectUnisonVolumes()
  }

  /**
   * Adds port forwarding for SSH.
   * This can only work for containers using
   * our base images.
   *
   * @todo Do want to be more specific and only
   * apply to a set flag like x-ce_dev.ssh === true?
   */
  private injectContainersSSH(): void {
    for (const service of Object.values(this.composeConfig.services)) {
      if (service['x-ce_dev'] instanceof Object === false) {
        continue
      }
      if (!service.expose) {
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
      external: true,
    }
  }

  /**
   * Inject container name as hostname.
   */
  private injectContainersHostname(): void {
    for (const [name, service] of Object.entries(this.composeConfig.services)) {
      const fullName = this.composeConfig['x-ce_dev'].project_name + '-' + name
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
  private injectContainersNetworking(): void {
    const ipManager = new IPManager(this.dockerBin, this.config)
    for (const service of Object.values(this.composeConfig.services)) {
      const ip = ipManager.getAvailableIP()
      // Manually configured, we do nothing.
      if (service.networks instanceof Object) {
        continue
      }
      const host_aliases: any = []
      if (service['x-ce_dev'] && service['x-ce_dev'].host_aliases) {
        service['x-ce_dev'].host_aliases.forEach(alias => {
          host_aliases.push(alias)
        })
      }
      service.networks = {
        ce_dev: {
          aliases: host_aliases,
          ipv4_address: ip,
        },
      }
      if (this.config.platform === 'darwin') {
        this.assignContainerPortForwarding(service, ip)
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
        external: true,
      },
    }
  }

  /**
   * Mac OS only. Replace exposed ports with forwarding.
   *
   * @param service
   * Service definition.
   * @param ip
   * IP to associate with.
   */
  private assignContainerPortForwarding(service: ComposeConfigService, ip: string): void {
    if (Array.isArray(service.expose)) {
      if (Array.isArray(service.ports) === false) {
        service.ports = []
      }
      service.expose.forEach(port => {
        service.ports?.push([ip, port, port].join(':'))
      })
      service.ports = [...new Set(service.ports)]
    }
  }

  /**
   * Gather mount points for ansible playbooks.
   */
  private generateProjectInfo(): void {
    this.activeProjectInfo.provision = []
    if (this.composeConfig['x-ce_dev'].provision) {
      this.composeConfig['x-ce_dev'].provision.forEach(playbookPath => {
        const absolutePath = this.getPathFromRelative(playbookPath)
        if (absolutePath.length > 3) {
          this.activeProjectInfo.provision.push(absolutePath)
        }
      })
    }
    this.activeProjectInfo.deploy = []
    if (this.composeConfig['x-ce_dev'].deploy) {
      this.composeConfig['x-ce_dev'].deploy.forEach(playbookPath => {
        const absolutePath = this.getPathFromRelative(playbookPath)
        if (absolutePath.length > 3) {
          this.activeProjectInfo.deploy.push(absolutePath)
        }
      })
    }
    this.activeProjectInfo.urls = []
    if (this.composeConfig['x-ce_dev'].urls) {
      this.composeConfig['x-ce_dev'].urls.forEach(url => {
        this.activeProjectInfo.urls.push(url)
      })
    }
    this.activeProjectInfo.project_name = this.composeConfig['x-ce_dev'].project_name
    if (this.composeConfig['x-ce_dev'].registry) {
      this.activeProjectInfo.registry = this.composeConfig['x-ce_dev'].registry
    }
    this.activeProjectInfo.version = this.composeConfig['x-ce_dev'].version ? this.composeConfig['x-ce_dev'].version : '1.x'
    this.activeProjectInfo.ssh_hosts = []
    this.saveActiveProjectInfo()
    this.gatherConfig()
  }

  /**
   * Gather SSH hosts information.
   */
  private gatherConfig(): void {
    if (!this.composeConfig['x-ce_dev'].ssh_hosts) {
      return
    }
    const prompts: Array<inquirer.Question> = []
    this.composeConfig['x-ce_dev'].ssh_hosts.forEach((hostname, index) => {
      prompts.push(...this.gatherHostsSSHPrompt(hostname, index))
    })
    const config = this.activeProjectInfo.ssh_hosts
    const hosts = this.composeConfig['x-ce_dev'].ssh_hosts
    inquirer.prompt(prompts).then(
      response => {
        hosts.forEach((hostname, index) => {
          config.push(
            {
              host: hostname,
              user: response['user' + index],
              src_key: response['key' + index],
            },
          )
        })
        this.saveActiveProjectInfo()
      }).catch(
      // @todo something sketchy going on with error handling.
      // Surely me being stupid.
      error => {
        this.log(error)
        this.exit(1)
      })
  }

  /**
   * Gather SSH hosts information recursively.
   *
   * @param host
   * External host name.
   * @param index
   * Index in the original array.
   * @returns
   * Prompts for each hosts.
   */
  private gatherHostsSSHPrompt(host: string, index: number): Array<inquirer.Question> {
    return [
      {
        name: 'user' + index,
        message: 'Username to use for SSH host ' + host,
        type: 'input',
        default: this.UserConfig.ssh_user,
      },
      {
        name: 'key' + index,
        message: 'Key to use for SSH host ' + host,
        type: 'fuzzypath',
        // @ts-ignore
        // Can not autoregister plugins yet.
        itemType: 'file',
        rootPath: process.env.HOME + '/.ssh',
        default: this.UserConfig.ssh_key,
      },
    ]
  }

  /**
   * Inject SysFs for systemd.
   */
  private injectContainersSysFs(): void {
    for (const service of Object.values(this.composeConfig.services)) {
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
  private injectCacheVolumes(): void {
    for (const service of Object.values(this.composeConfig.services)) {
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
        // @todo npm/yarn
        service.volumes = [...new Set(service.volumes)]
      }
    }
    if (!this.composeConfig.volumes) {
      this.composeConfig.volumes = {}
    }
    this.composeConfig.volumes.ce_dev_apt_cache = {
      external: true,
    }
    this.composeConfig.volumes.ce_dev_composer_cache = {
      external: true,
    }
    this.composeConfig.volumes.ce_dev_nvm_node = {
      external: true,
    }
  }

  /**
   * Inject volumes.
   */
  private injectUnisonVolumes(): void {
    for (const [serviceName, service] of Object.entries(this.composeConfig.services)) {
      if (service['x-ce_dev'] && service['x-ce_dev'].unison) {
        this.injectUnisonVolume(serviceName, service)
      }
    }
  }

  /**
   * Replace unison volume mounts.
   *
   * @param serviceName
   * Container name
   * @param service
   * Service definition
   */
  private injectUnisonVolume(serviceName: string, service: ComposeConfigService): void {
    if (!service['x-ce_dev'] || !service['x-ce_dev'].unison) {
      return
    }
    service['x-ce_dev'].unison.forEach(volume => {
      if (volume.target_platforms.indexOf(this.config.platform) >= 0) {
        if (!service.volumes) {
          service.volumes = []
        }
        service.volumes.push([volume.src, '/.x-ce-dev' + volume.dest, 'delegated'].join(':'))
        this.activeProjectInfo.unison[serviceName] = []
        const volumeConfig: UnisonVolumeContainer = {
          src: '/.x-ce-dev' + volume.dest,
          dest: volume.dest,
          ignore: '',
        }
        const ignoreList: Array<string> = []
        if (volume.ignore) {
          volume.ignore.forEach(ignoreDirective => {
            ignoreList.push('-ignore "' + ignoreDirective + '"')
          })
        }
        volumeConfig.ignore = ignoreList.join(' ')
        this.activeProjectInfo.unison[serviceName].push(volumeConfig)
      } else {
        if (!service.volumes) {
          service.volumes = []
        }
        service.volumes.push([volume.src, volume.dest, 'delegated'].join(':'))
      }
    })
    this.saveActiveProjectInfo()
  }

  /**
   * Clean up compose structure.
   */
  private removePrivateProperties(): void {
    delete this.composeConfig['x-ce_dev']
    for (const service of Object.values(this.composeConfig.services)) {
      delete service['x-ce_dev']
    }
  }
}
