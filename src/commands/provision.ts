
import {flags} from '@oclif/command'
import {execSync} from 'child_process'
import * as inquirer from 'inquirer'

import AnsibleInfo from '../ansible-info-interface'
import BaseCmd from '../base-cmd-abstract'
import ComposeConfig from '../compose-config-interface'
import ComposeConfigService from '../compose-config-service-interface'

const fs = require('fs')

export default class ProvisionCmd extends BaseCmd {
  static description = 'Provision containers with Ansible playbooks.'
  static examples = [
    '$ ce-dev provision example-app',
  ]
  static flags = {
    help: flags.help({char: 'h'}),
    all: flags.boolean({
      char: 'a',
      description: 'Provision all containers'
    })
  }
  static args = [
    {
      name: 'container',
      required: false,
      description: 'Name of the container to target. Use `docker ps` to see available containers.'
    }
  ]

  /**
   * @var
   * Docker compose content parsed from yaml.
   */
  private readonly composeConfig: ComposeConfig

    /**
     * @var
     * File path to tmp host file.
     */
  private readonly tmpHostsFile: string = ''

  /**
   * @inheritdoc
   */
  public constructor(argv: string[], config: any) {
    super(argv, config)
    this.composeConfig = this.LoadComposeConfig(this.activeComposeFilePath)
    this.tmpHostsFile = this.config.cacheDir + '/AnsibleHosts'
  }

  /**
   * @inheritdoc
   */
  async run() {
    this.ensureActiveComposeFile()
    this.populateAnsibleHosts()
    const {flags} = this.parse(ProvisionCmd)
    if (flags.all) {
      this.provisionAll()
      this.exit(0)
    }
    const {args} = this.parse(ProvisionCmd)
    let container = args.container
    if (!container) {
      const running = this.getProjectRunningContainersAnsible()
      if (running.length < 1) {
        this.warn('No running containers can be targeted. Exiting.')
        this.exit(1)
      }
      let response: any = await inquirer.prompt([{
        name: 'container',
        message: 'Select a container to target',
        type: 'list',
        choices: running,
      }])
      container = response.container
    }
    this.provisionContainer(container)
  }
  /**
   * Provision all enable containers in row.
   */
  private provisionAll() {
    const running = this.getProjectRunningContainersAnsible()
    running.forEach(containerName => {
      this.provisionContainer(containerName)
    })
  }
  /**
   * Provision a single container.
   * @param containerName
   * Name of the container to target.
   */
  private provisionContainer(containerName: string) {
    const ansibleInfo: Array<AnsibleInfo> = this.parseYaml(this.activeAnsibleInfoFilePath)
    const controllerService = this.getControllerService(this.composeConfig) as ComposeConfigService
    if (!controllerService) {
      this.error('No controller container is defined. Cannot provision.')
      this.exit(1)
    }
    ansibleInfo.forEach(info => {
      if (info.containerName === containerName) {
        execSync(this.dockerBin + ' exec -t ' + controllerService.container_name + ' mkdir -p /etc/ansible/data/' + containerName)
        execSync(this.dockerBin + ' exec -t ' + controllerService.container_name + ' chown -R ce-dev:ce-dev /etc/ansible/data')
        execSync(this.dockerBin + ' exec -t --user ce-dev ' + controllerService.container_name + ' ansible-playbook ' + info.ansiblePath + ' --extra-vars \'{"is_local":"yes"}\'', {stdio: 'inherit'})
      }
    })
  }

  /**
   * Inject Ansible hosts file onto the controller.
   */
  private populateAnsibleHosts() {
    const controllerService = this.getControllerService(this.composeConfig) as ComposeConfigService
    if (!controllerService) {
      this.error('No controller container is defined. Cannot provision.')
      this.exit(1)
    }
    this.log('Rebuilding Ansible hosts information on the controller.')
    const hosts = this.getProjectRunningContainersAnsible().join('\n')
    fs.writeFileSync(this.tmpHostsFile, hosts + '\n')
    execSync(this.dockerBin + ' cp ' + this.tmpHostsFile + ' ' + controllerService.container_name + ':/etc/ansible/hosts/hosts')
    execSync(this.dockerBin + ' exec -t ' + controllerService.container_name + '  chown -R ce-dev:ce-dev /etc/ansible/hosts')
  }
}
