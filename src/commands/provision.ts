import { Config, Flags} from '@oclif/core'

import AnsibleCmd from '../abstracts/base-cmd-abstract-ansible.js'
import {AppSettings} from "../app-settings.js";

export default class ProvisionCmd extends AnsibleCmd {

  static description = 'Provision containers with Ansible playbooks.'

  static flags = {
    branch: Flags.string({
      char: 'b',
      default: '2.x',
      description: 'The branch of ce-provision to use for provisioning your containers. See https://github.com/codeenigma/ce-provision for options.'
    }),
    config: Flags.string({
      char: 'c',
      default: '1.x',
      description: 'The branch of the ce-provision-config repository. See https://github.com/codeenigma/ce-dev-ce-provision-config for options.'
    }),
    help: Flags.help({char: 'h'}),
    verbose: Flags.boolean({
      char: 'v',
      description: 'Enable verbose output in Ansible.'
    }),
  }

  protected ansibleProjectPlaybooksPath = '/home/ce-dev/projects-playbooks/provision'

  protected ansibleScript = 'scripts/provision.sh'

  protected ansibleScriptsPath = '/home/ce-dev/ce-provision'

  protected configBranch = '1.x'

  protected ownBranch = '2.x'

  protected verbose = false

  /**
   * @inheritdoc
   */
  public constructor(argv: string[], config: Config) {
    super(argv, config)
    this.ansiblePaths = this.activeProjectInfo.provision
  }

  /**
   * @inheritDoc
   */
  protected getCommandParameters(ansiblePath: string): string {
    const workspace = this.ansibleProjectPlaybooksPath
    const repo = this.activeProjectInfo.project_name
    let cmd = '--own-branch ' + this.ownBranch
    if (this.verbose) cmd += ' --verbose'
    cmd += ' --config-branch ' + this.configBranch
    cmd += ' --workspace ' + workspace
    cmd += ' --repo ' + repo
    cmd += ' --branch ce-dev --playbook ' + ansiblePath
    cmd += ' --ansible-extra-vars \'{"is_local":"true","_ce_dev_mkcert_base":"/home/ce-dev/.local/share/mkcert","ce_dev_host_platform":"' + this.config.platform + '"}\''
    return cmd
  }

  /**
   * @inheritdoc
   *
   * We need to overwrite this function to read the flags.
   */
  async run(): Promise<void> {
    const {flags} = await this.parse(ProvisionCmd)
    this.ownBranch = flags.branch
    this.configBranch = flags.config
    if (flags.verbose) this.verbose = true

    // Update ce-provision path if we are running version > 1.
    if (this.ownBranch !== '1.x')
      this.ansibleScriptsPath = this.ansibleScriptsPath + '-' + AppSettings.ceDevVersion

    this.ensureActiveComposeFile()
    this.populateAnsibleHosts()
    this.play()
  }
}
