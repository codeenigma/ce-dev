
import AnsibleCmd from '../base-cmd-ansible-abstract'

export default class DeployCmd extends AnsibleCmd {
  static description = 'Setu an app with Ansible playbooks.'
  static examples = [
    '$ ce-dev deploy example-app',
  ]

  protected ansibleProjectPlaybooksPath = '/home/ce-dev/projects-playbooks/deploy'
  protected ansibleScriptsPath = '/home/ce-dev/ansible-deploy'

  /**
   * @inheritdoc
   */
  public constructor(argv: string[], config: any) {
    super(argv, config)
    this.ansiblePaths = this.activeProjectInfo.deploy
  }

}
