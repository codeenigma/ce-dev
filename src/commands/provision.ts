import AnsibleCmd from '../base-cmd-ansible-abstract'
import {flags} from '@oclif/command'

export default class ProvisionCmd extends AnsibleCmd {
  static description = 'Provision containers with Ansible playbooks.'

  static examples = [
    '$ ce-dev provision --branch 1.x --config 1.x --verbose',
  ]

  static flags = {
    help: flags.help({char: 'h'}),
    branch: flags.string({
      char: 'b',
      description: 'The branch of ce-provision to use for provisioning your containers. See https://github.com/codeenigma/ce-provision for options.',
      default: '1.x',
    }),
    config: flags.string({
      char: 'c',
      description: 'The branch of the ce-provision-config repository. See https://github.com/codeenigma/ce-dev-ce-provision-config for options.',
      default: '1.x',
    }),
    verbose: flags.boolean({
      char: 'v',
      description: 'Enable verbose output in Ansible.',
    }),
  }

  protected ansibleProjectPlaybooksPath = '/home/ce-dev/projects-playbooks/provision'

  protected ansibleScriptsPath = '/home/ce-dev/ce-provision'

  protected ansibleScript = 'scripts/provision.sh'

  protected ownBranch = '1.x'

  protected configBranch = '1.x'

  protected verbose = false

  /**
   * @inheritdoc
   */
  public constructor(argv: string[], config: any) {
    super(argv, config)
    const {flags} = this.parse(ProvisionCmd)
    this.ansiblePaths = this.activeProjectInfo.provision
    this.ownBranch = flags.branch
    this.configBranch = flags.config
    if (flags.verbose) this.verbose = true
  }

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
}
