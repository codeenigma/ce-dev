
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
    const cmd = '--workspace ' + workspace + ' --repo ' + repo + ' --branch ce-dev --playbook ' + ansiblePath + ' --ansible-extra-vars \'{"is_local":"yes"}\''
    return cmd
  }

}
