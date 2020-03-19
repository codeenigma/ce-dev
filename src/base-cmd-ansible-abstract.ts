
import {execSync} from 'child_process'

import BaseCmd from './base-cmd-abstract'
import ComposeConfig from './compose-config-interface'

const fspath = require('path')
const fs = require('fs')

export default abstract class AnsibleCmd extends BaseCmd {
    /**
     * @var
     * Operation, either provision or deploy.
     */
  protected ansiblePaths: Array<string> = []
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
   * Relative path to the script to call.
   */
  protected ansibleScript = ''
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
    this.play()
  }
  /**
   *
   */
  protected play() {
    this.ansiblePaths.forEach(ansiblePath => {
      const src = fspath.dirname(ansiblePath)
      const dest = this.ansibleProjectPlaybooksPath + fspath.dirname(src)
      this.log('Copy Ansible configuration')
      execSync(this.dockerBin + ' exec -t --user ce-dev ce_dev_controller mkdir -p ' + dest)
      execSync(this.dockerBin + ' cp ' + src + ' ce_dev_controller:' + dest)
      const script = fspath.join(this.ansibleScriptsPath, this.ansibleScript)
      const cmd = script + ' ' + this.getCommandParameters(ansiblePath)
      execSync(this.dockerBin + ' exec -t --workdir ' + this.ansibleScriptsPath + ' --user ce-dev ce_dev_controller ' + cmd , {stdio: 'inherit'})
    })
  }

  protected getCommandParameters(ansiblePath: string): string {
    return ansiblePath
  }

  /**
   * Inject Ansible hosts file onto the controller.
   */
  protected populateAnsibleHosts() {
    this.log('Rebuilding Ansible hosts information on the controller.')
    if (this.composeConfig.services) {
      const hosts = Object.keys(this.composeConfig.services).join('\n')
      fs.writeFileSync(this.tmpHostsFile, hosts + '\n')
      execSync(this.dockerBin + ' cp ' + this.tmpHostsFile + ' ce_dev_controller:' + this.ansibleScriptsPath + '/hosts/hosts')
      execSync(this.dockerBin + ' exec -t ce_dev_controller chown -R ce-dev:ce-dev ' + this.ansibleScriptsPath + '/hosts/hosts')
    }
  }

}
