
import AnsibleCmd from '../base-cmd-ansible-abstract'

export default class ProvisionCmd extends AnsibleCmd {
  static description = 'Provision containers with Ansible playbooks.'
  static examples = [
    '$ ce-dev provision example-app',
  ]

  protected ansibleProjectPlaybooksPath = '/home/ce-dev/projects-playbooks/provision'
  protected ansibleScriptsPath = '/home/ce-dev/ansible-provision'

  /**
   * @inheritdoc
   */
  public constructor(argv: string[], config: any) {
    super(argv, config)
    this.ansiblePaths = this.activeProjectInfo.provision
  }

}
