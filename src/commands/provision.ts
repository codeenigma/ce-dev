import AnsibleCmd from '../base-cmd-ansible-abstract'

export default class ProvisionCmd extends AnsibleCmd {
  static description = 'Provision containers with Ansible playbooks.'

  protected ansibleProjectPlaybooksPath = '/home/ce-dev/projects-playbooks/provision'

  protected ansibleScriptsPath = '/home/ce-dev/ce-provision'

  protected ansibleScript = 'scripts/provision.sh'

  /**
   * @inheritdoc
   */
  public constructor(argv: string[], config: any) {
    super(argv, config)
    this.ansiblePaths = this.activeProjectInfo.provision
  }

  protected getCommandParameters(ansiblePath: string): string {
    const workspace = this.ansibleProjectPlaybooksPath
    const repo = this.activeProjectInfo.project_name
    const ownBranch = '1.x'
    const configBranch = '1.x'
    let cmd = '--own-branch ' + ownBranch
    cmd +=  ' --config-branch ' + configBranch
    cmd += ' --workspace ' + workspace
    cmd += ' --repo ' + repo
    cmd += ' --branch ce-dev --playbook ' + ansiblePath
    cmd += ' --ansible-extra-vars \'{"is_local":"yes", "_ce_dev_mkcert_base":"/home/ce-dev/.local/share/mkcert", "ce_dev_host_platform":"' + this.config.platform + '"}\''
    return cmd
  }
}
