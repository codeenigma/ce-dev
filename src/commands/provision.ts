
import {flags} from '@oclif/command'
import {execSync} from 'child_process'
import * as inquirer from 'inquirer'
const fspath = require('path')
import BaseCmd from '../base-cmd-abstract'
import ComposeConfig from '../compose-config-interface'

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
    let ansiblePath = this.activeProjectInfo.ansible_paths[containerName]
    let src = fspath.dirname(ansiblePath)
    let dest = '/home/ce-dev/projects-playbooks' + fspath.dirname(src)
    this.log('Copy Ansible configuration')
    execSync(this.dockerBin + ' exec -t --user ce-dev ce_dev_controller mkdir -p ' + dest)
    execSync(this.dockerBin + ' cp ' + src + ' ce_dev_controller:' + dest)
    execSync(this.dockerBin + ' exec -t --user ce-dev ce_dev_controller ansible-playbook /home/ce-dev/projects-playbooks' + ansiblePath + ' --extra-vars \'{"is_local":"yes","ansible_provision_dir":"/home/ce-dev/ansible-provision"}\'', {stdio: 'inherit'})
  }

  /**
   * Inject Ansible hosts file onto the controller.
   */
  private populateAnsibleHosts() {
    this.log('Rebuilding Ansible hosts information on the controller.')
    const hosts = Object.keys(this.activeProjectInfo.ansible_paths).join('\n')
    fs.writeFileSync(this.tmpHostsFile, hosts + '\n')
    execSync(this.dockerBin + ' cp ' + this.tmpHostsFile + ' ce_dev_controller:/etc/ansible/hosts/hosts')
    execSync(this.dockerBin + ' exec -t ce_dev_controller chown -R ce-dev:ce-dev /etc/ansible/hosts/hosts')
  }
}
