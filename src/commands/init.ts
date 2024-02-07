import { Flags, ux } from '@oclif/core'
import inquirer from 'inquirer'
import inquirerFuzzyPath from 'inquirer-fuzzy-path';

import BaseCmd from '../abstracts/base-cmd-abstract.js'
import UnisonVolumeContainer from '../interfaces/ce-dev-config-unison-volume-interface.js'
import ComposeConfig from '../interfaces/docker-compose-config-interface.js'
import ComposeConfigService from '../interfaces/docker-compose-config-service-interface.js'
import IPManager from '../ip-manager.js'
import YamlParser from '../yaml-parser.js'

inquirer.registerPrompt('fuzzypath', (<inquirer.prompts.PromptConstructor>inquirerFuzzyPath))
export default class InitCmd extends BaseCmd {
  static description = 'Generates a docker-compose.yml file from a template'

  static examples = [
    '$ ce-dev init --template example.compose.yml',
  ]

  static flags = {
    help: Flags.help({char: 'h'}),
    template: Flags.string({
      char: 't',
      default: 'ce-dev.compose.prebuilt.yml',
      description: 'path to a docker compose template file, relative to the project root',
    }),
  }

  /**
   * @member
   * Docker compose content parsed from yaml.
   */
  private composeConfig: ComposeConfig

  /**
   * @member
   * Absolute path to the Compose file template.
   */
  private composeTemplate: string

  /**
   * @inheritdoc
   */
  async run(): Promise<void> {
    const {flags} = await this.parse(InitCmd)
    this.composeTemplate = this.getPathFromRelative(flags.template)
    if (!this.composeTemplate) {
      this.composeTemplate = this.getPathFromRelative('ce-dev.compose.yml')
    }

    this.composeConfig = this.loadComposeConfig(this.composeTemplate) as ComposeConfig

    this.generateProjectInfo()
    this.generateCompose()
    this.removePrivateProperties()
    YamlParser.writeYaml(this.activeComposeFilePath, this.composeConfig)
    this.installCertificateAuth()
  }

  /**
   * Mac OS only. Replace exposed ports with forwarding.
   *
   * @param service
   * Service definition.
   * @param ip
   * IP to associate with.
   *
   * @return void
   */
  private assignContainerPortForwarding(service: ComposeConfigService, ip: string): void {
    if (Array.isArray(service.expose)) {
      if (Array.isArray(service.ports) === false) {
        service.ports = []
      }

      for (const port of service.expose) {
        service.ports?.push([ip, port, port].join(':'))
      }

      service.ports = [...new Set(service.ports)]
    }
  }

  /**
   * Gather SSH hosts information.
   *
   * @return void
   */
  private gatherConfig(): void {
    if (!this.composeConfig['x-ce_dev'].ssh_hosts) {
      return
    }

    const prompts: Array<object> = []
    for (const [index, hostname] of this.composeConfig['x-ce_dev'].ssh_hosts.entries()) {
      prompts.push(...this.gatherHostsSSHPrompt(hostname, index))
    }

    const config = this.activeProjectInfo.ssh_hosts
    const hosts = this.composeConfig['x-ce_dev'].ssh_hosts
    inquirer.prompt(prompts).then(
      response => {
        for (const [index, hostname] of hosts.entries()) {
          config.push(
            {
              host: hostname,
              src_key: response['key' + index],
              user: response['user' + index],
            },
          )
        }

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
  private gatherHostsSSHPrompt(host: string, index: number): Array<object> {
    return [
      {
        default: this.UserConfig.ssh_user,
        message: 'Username to use for SSH host ' + host,
        name: 'user' + index,
        type: 'input',
      },
      {
        default: this.UserConfig.ssh_key,
        // Can not autoregister plugins yet.
        itemType: 'file',
        message: 'Key to use for SSH host ' + host,
        // @ts-ignore
        name: 'key' + index,
        rootPath: process.env.HOME + '/.ssh',
        type: 'fuzzypath',
      },
    ]
  }

  /**
   * Alter parsed config to be written in actual compose file.
   *
   * @return void
   */
  private generateCompose(): void {
    this.injectContainersNetworking()
    this.injectContainersSSH()
    this.injectContainersHostname()
    this.injectContainersSysFs()
    this.injectCommonVolumes()
    this.injectUnisonVolumes()
  }

  /**
   * Gather mount points for ansible playbooks.
   *
   * @return void
   */
  private generateProjectInfo(): void {
    this.activeProjectInfo.provision = []
    if (this.composeConfig['x-ce_dev'].provision) {
      for (const playbookPath of this.composeConfig['x-ce_dev'].provision) {
        const absolutePath = this.getPathFromRelative(playbookPath)
        if (absolutePath.length > 3) {
          this.activeProjectInfo.provision.push(absolutePath)
        }
      }
    }

    this.activeProjectInfo.deploy = []
    if (this.composeConfig['x-ce_dev'].deploy) {
      for (const playbookPath of this.composeConfig['x-ce_dev'].deploy) {
        const absolutePath = this.getPathFromRelative(playbookPath)
        if (absolutePath.length > 3) {
          this.activeProjectInfo.deploy.push(absolutePath)
        }
      }
    }

    this.activeProjectInfo.urls = []
    if (this.composeConfig['x-ce_dev'].urls) {
      for (const url of this.composeConfig['x-ce_dev'].urls) {
        this.activeProjectInfo.urls.push(url)
      }
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
   * Inject volumes.
   *
   * @return void
   */
  private injectCommonVolumes(): void {
    for (const service of Object.values(this.composeConfig.services)) {
      if (service['x-ce_dev']) {
        if (!service.volumes) {
          service.volumes = []
        }

        service.volumes.push('/var/log', '/var/cache', '/var/backups', '/var/tmp', '/var/spool', '/var/mail', 'ce_dev_apt_cache:/var/cache/apt/archives', 'ce_dev_composer_cache:/home/ce-dev/.composer/cache', 'ce_dev_nvm_node:/home/ce-dev/.nvm/versions/node', 'ce_dev_mkcert:/home/ce-dev/.local/share/mkcert')
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
    this.composeConfig.volumes.ce_dev_mkcert = {
      external: true,
    }
  }

  /**
   * Inject container name as hostname.
   *
   * @return void
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
   *
   * @return void
   */
  private injectContainersNetworking(): void {
    const ipManager = new IPManager(this.config, this.dockerBin)
    for (const service of Object.values(this.composeConfig.services)) {
      const ip = ipManager.getAvailableIP()
      // Manually configured, we do nothing.
      if (service.networks instanceof Object) {
        continue
      }

      const host_aliases = []
      if (service['x-ce_dev'] && service['x-ce_dev'].host_aliases) {
        for (const alias of service['x-ce_dev'].host_aliases) {
          host_aliases.push(alias)
          // Generate a matching SSL certificate.
          ux.action.start('Generating SSL certificate for ' + alias)
          this.generateCertificate(alias)
          ux.action.stop()
        }
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
        driver: 'bridge',
        external: true,
        name: 'ce_dev',
      },
    }
  }

  /**
   * Adds port forwarding for SSH.
   * This can only work for containers using
   * our base images.
   *
   * @todo Do want to be more specific and only
   * apply to a set flag like x-ce_dev.ssh === true?
   *
   * @return void
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
   * Inject SysFs for systemd.
   *
   * @return void
   */
  private injectContainersSysFs(): void {
    for (const service of Object.values(this.composeConfig.services)) {
      if (service['x-ce_dev']) {
        if (!service.volumes) {
          service.volumes = []
        }

        service.volumes.push('/sys/fs/cgroup:/sys/fs/cgroup:rw')
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
   * Replace unison volume mounts.
   *
   * @param serviceName
   * Container name
   * @param service
   * Service definition
   *
   * @return void
   */
  private injectUnisonVolume(serviceName: string, service: ComposeConfigService): void {
    if (!service['x-ce_dev'] || !service['x-ce_dev'].unison) {
      return
    }

    for (const volume of service['x-ce_dev'].unison) {
      if (volume.target_platforms.includes(this.config.platform)) {
        if (!service.volumes) {
          service.volumes = []
        }

        service.volumes.push([volume.src, '/.x-ce-dev' + volume.dest, 'delegated'].join(':'))
        this.activeProjectInfo.unison[serviceName] = []
        const volumeConfig: UnisonVolumeContainer = {
          dest: volume.dest,
          ignore: '',
          src: '/.x-ce-dev' + volume.dest,
        }
        const ignoreList: Array<string> = []
        if (volume.ignore) {
          for (const ignoreDirective of volume.ignore) {
            ignoreList.push('-ignore "' + ignoreDirective + '"')
          }
        }

        volumeConfig.ignore = ignoreList.join(' ')
        this.activeProjectInfo.unison[serviceName].push(volumeConfig)
      } else {
        if (!service.volumes) {
          service.volumes = []
        }

        service.volumes.push([volume.src, volume.dest, 'delegated'].join(':'))
      }
    }

    this.saveActiveProjectInfo()
  }

  /**
   * Inject volumes.
   *
   * @return void
   */
  private injectUnisonVolumes(): void {
    for (const [serviceName, service] of Object.entries(this.composeConfig.services)) {
      if (service['x-ce_dev'] && service['x-ce_dev'].unison) {
        this.injectUnisonVolume(serviceName, service)
      }
    }
  }

  /**
   * Clean up compose structure.
   *
   * @return void
   */
  private removePrivateProperties(): void {
    delete (this.composeConfig as any)['x-ce_dev']
    for (const service of Object.values(this.composeConfig.services)) {
      delete service['x-ce_dev']
    }
  }
}
