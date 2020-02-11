
import {flags} from '@oclif/command'
import {execSync} from 'child_process'
import * as inquirer from 'inquirer'

import BaseCmd from './base-cmd-abstract'
import ComposeConfig from './compose-config-interface'

const fspath = require('path')
const fs = require('fs')

export default abstract class AnsibleCmd extends BaseCmd {
  static flags = {
    help: flags.help({char: 'h'}),
    all: flags.boolean({
      char: 'a',
      description: 'Target all containers'
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
     * Operation, either provision or deploy.
     */
  protected ansiblePaths: Record<string, string> = {}
    /**
     * @var
     * Path on the container to main scripts.
     */
  protected ansibleScriptsPath = ''
    /**
     * @var
     * Path on the container to playbooks.
     */
  protected ansibleProjectPlaybooksPath = ''

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
    const {flags} = this.parse(AnsibleCmd)
    if (flags.all) {
      this.playAll()
      this.exit(0)
    }
    const {args} = this.parse(AnsibleCmd)
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
    this.playContainer(container)
  }
  /**
   * Target a single container.
   * @param containerName
   * Name of the container to target.
   */
  protected playContainer(containerName: string) {
    let ansiblePath = this.ansiblePaths[containerName]
    let src = fspath.dirname(ansiblePath)
    let dest = this.ansibleProjectPlaybooksPath + fspath.dirname(src)
    this.log('Copy Ansible configuration')
    execSync(this.dockerBin + ' exec -t --user ce-dev ce_dev_controller mkdir -p ' + dest)
    execSync(this.dockerBin + ' cp ' + src + ' ce_dev_controller:' + dest)
    execSync(this.dockerBin + ' exec -t --workdir ' + this.ansibleScriptsPath + ' --user ce-dev ce_dev_controller ansible-playbook ' + this.ansibleProjectPlaybooksPath + ansiblePath + ' --extra-vars \'{"is_local":"yes"}\'', {stdio: 'inherit'})
  }
  /**
   * Gather project's containers that define an ansible path.
   */
  protected getProjectRunningContainersAnsible(): Array<string> {
    const running: Array<string> = this.getProjectRunningContainers()
    const ansible: Array<string> = []
    running.forEach(containerName => {
      if (this.ansiblePaths.hasOwnProperty(containerName)) {
        ansible.push(containerName)
      }
    })
    return ansible
  }

  /**
   * Inject Ansible hosts file onto the controller.
   */
  protected populateAnsibleHosts() {
    this.log('Rebuilding Ansible hosts information on the controller.')
    const hosts = Object.keys(this.activeProjectInfo.provision).join('\n')
    fs.writeFileSync(this.tmpHostsFile, hosts + '\n')
    execSync(this.dockerBin + ' cp ' + this.tmpHostsFile + ' ce_dev_controller:/home/ce-dev/ansible-provision/hosts/hosts')
    execSync(this.dockerBin + ' exec -t ce_dev_controller chown -R ce-dev:ce-dev /home/ce-dev/ansible-provision/hosts/hosts')
  }
  /**
   * Provision all enable containers in row.
   */
  private playAll() {
    const running = this.getProjectRunningContainersAnsible()
    running.forEach(containerName => {
      this.playContainer(containerName)
    })
  }
}
