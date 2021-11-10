import AnsibleCmd from '../base-cmd-ansible-abstract'
import {flags} from '@oclif/command'

export default class ProvisionCmd extends AnsibleCmd {
  static description = 'Provision containers with Ansible playbooks.'

  static examples = [
    '$ ce-dev provision --ownbranch devel --configbranch devel',
  ]

  static flags = {
    help: flags.help({char: 'h'}),
    ownbranch: flags.string({
      char: 'o',
      description: 'git branch to pull ce-provision from',
      default: '1.x',
    }),
    configbranch: flags.string({
      char: 'c',
      description: 'git branch to pull ce-provision configuration from',
      default: '1.x',
    }),
  }

  protected ansibleProjectPlaybooksPath = '/home/ce-dev/projects-playbooks/provision'

  protected ansibleScriptsPath = '/home/ce-dev/ce-provision'

  protected ansibleScript = 'scripts/provision.sh'

 /**
  * @member
  * Branch to pull ce-provision from.
  */
  private readonly ownBranch: string

 /**
  * @member
  * Branch to pull ce-provision configuration from.
  */
  private readonly configBranch: string

  /**
   * @inheritdoc
   */
  public constructor(argv: string[], config: any) {
    super(argv, config)
    const {flags} = this.parse(ProvisionCmd)
    this.ownBranch = flags.ownbranch
    if (!this.ownBranch) {
      this.ownBranch = '1.x'
    }
    this.configBranch = flags.configbranch
    if (!this.configBranch) {
      this.configBranch = '1.x'
    }
    this.ansiblePaths = this.activeProjectInfo.provision
  }

  protected getCommandParameters(ansiblePath: string): string {
    const workspace = this.ansibleProjectPlaybooksPath
    const repo = this.activeProjectInfo.project_name
    let cmd = '--own-branch ' + this.ownBranch
    cmd += ' --config-branch ' + this.configBranch
    cmd += ' --workspace ' + workspace
    cmd += ' --repo ' + repo
    cmd += ' --branch ce-dev --playbook ' + ansiblePath
    cmd += ' --ansible-extra-vars \'{"is_local":"true","_ce_dev_mkcert_base":"/home/ce-dev/.local/share/mkcert","ce_dev_host_platform":"' + this.config.platform + '"}\''
    return cmd
  }
}
