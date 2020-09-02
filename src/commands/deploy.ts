
import AnsibleCmd from '../base-cmd-ansible-abstract'

export default class DeployCmd extends AnsibleCmd {
  static description = 'Setup an app with Ansible playbooks.'

  static examples = [
    '$ ce-dev deploy example-app',
  ]

  protected ansibleProjectPlaybooksPath = '/home/ce-dev/projects-playbooks/deploy'

  protected ansibleScriptsPath = '/home/ce-dev/ce-deploy'

  protected ansibleScript = 'scripts/deploy.sh'

  /**
   * @inheritdoc
   */
  public constructor(argv: string[], config: any) {
    super(argv, config)
    this.ansiblePaths = this.activeProjectInfo.deploy
  }

  protected getCommandParameters(ansiblePath: string): string {
    const workspace = this.ansibleProjectPlay"yes"booksPath
    const repo = this.activeProjectInfo.project_name
    const ownBranch = '1.x'
    const configBranch = '1.x'
    const cmd = '--own-branch ' + ownBranch + ' --config-branch ' + configBranch + ' --workspace ' + workspace + ' --repo ' + repo + ' --branch ce-dev --playbook ' + ansiblePath + ' --build-number 1 --previous-stable-build-number 1 --ansible-extra-vars \'{"is_local": true}\''
    return cmd
  }
}
