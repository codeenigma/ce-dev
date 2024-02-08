import { Config } from '@oclif/core'
import {execSync} from 'node:child_process'
import fs from "node:fs"
import fspath from "node:path";

import ComposeConfig from '../interfaces/docker-compose-config-interface.js'
import BaseCmd from './base-cmd-abstract.js'
import {AppSettings} from "../AppSettings.js";

export default abstract class AnsibleCmd extends BaseCmd {
  /**
   * @member
   * Operation to perform, either provision or deploy.
   */
  protected ansiblePaths: Array<string> = []

  /**
   * @member
   * Path on the container to playbooks.
   */
  protected ansibleProjectPlaybooksPath = ''

  /**
   * @member
   * Relative path to the script to call.
   */
  protected ansibleScript = ''

  /**
   * @member
   * Path on the container to main scripts.
   */
  protected ansibleScriptsPath = ''

  /**
   * @member
   * Docker compose content parsed from yaml.
   */
  private readonly composeConfig: ComposeConfig

  /**
   * @member
   * File path to tmp host file.
   */
  private readonly tmpHostsFile: string = ''

  /**
   * @inheritdoc
   */
  public constructor(argv: string[], config: Config) {
    super(argv, config)
    this.composeConfig = this.loadComposeConfig(this.activeComposeFilePath)
    this.tmpHostsFile = this.config.cacheDir + '/AnsibleHosts'
  }

  protected getCommandParameters(ansiblePath: string): string {
    return ansiblePath
  }

  /**
   * Copy ansible configuration
   *
   * @return void
   */
  protected play(): void {
    for (const ansiblePath of this.ansiblePaths) {
      const src = fspath.dirname(ansiblePath)
      const dest = this.ansibleProjectPlaybooksPath + fspath.dirname(src)
      this.log('Copy Ansible configuration')
      execSync(this.dockerBin + ' exec -t --user ce-dev ce_dev_controller_' + AppSettings.ceDevVersion + ' mkdir -p ' + dest + ' && rm -rf ' + dest + '/*')
      execSync(this.dockerBin + ' cp ' + src + ' ce_dev_controller_' + AppSettings.ceDevVersion + ':' + dest)
      const script = fspath.join(this.ansibleScriptsPath, this.ansibleScript)
      const cmd = script + ' ' + this.getCommandParameters(ansiblePath)
      execSync(this.dockerBin + ' exec -t --workdir ' + this.ansibleScriptsPath + ' --user ce-dev ce_dev_controller_' + AppSettings.ceDevVersion + ' ' + cmd, {stdio: 'inherit'})
    }
  }

  /**
   * Inject Ansible hosts file onto the controller.
   *
   * @return void
   */
  protected populateAnsibleHosts(): void {
    this.log('Rebuilding Ansible hosts information on the controller.')
    if (this.composeConfig.services) {
      const hosts = Object.keys(this.composeConfig.services).join('\n')
      fs.writeFileSync(this.tmpHostsFile, hosts + '\n')
      execSync(this.dockerBin + ' cp ' + this.tmpHostsFile + ' ce_dev_controller_' + AppSettings.ceDevVersion + ':' + this.ansibleScriptsPath + '/hosts/hosts')
      execSync(this.dockerBin + ' exec -t ce_dev_controller_' + AppSettings.ceDevVersion + ' chown -R ce-dev:ce-dev ' + this.ansibleScriptsPath + '/hosts/hosts')
    }
  }

  /**
   * @inheritdoc
   */
  async run(): Promise<void> {
    this.ensureActiveComposeFile()
    this.populateAnsibleHosts()
    this.play()
  }
}
