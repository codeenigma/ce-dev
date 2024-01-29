import AnsibleCmd from '../base-cmd-ansible-abstract'
import {flags} from '@oclif/command'

export default class DeployCmd extends AnsibleCmd {
  static description = 'Setup an app with Ansible playbooks.'

  static examples = [
    '$ ce-dev deploy example-app --verbose',
  ]

  static flags = {
    help: flags.help({char: 'h'}),
    verbose: flags.boolean({
      char: 'v',
      description: 'Enable verbose output in Ansible.',
    }),
  }

  protected ansibleProjectPlaybooksPath = '/home/ce-dev/projects-playbooks/deploy'

  protected ansibleScriptsPath = '/home/ce-dev/ce-deploy'

  protected ansibleScript = 'scripts/deploy.sh'

  protected verbose = false

  /**
   * @inheritdoc
   */
  public constructor(argv: string[], config: any) {
    super(argv, config)
    const {flags} = this.parse(DeployCmd)
    this.ansiblePaths = this.activeProjectInfo.deploy
    if (flags.verbose) this.verbose = true
  }

  protected getCommandParameters(ansiblePath: string): string {
    const workspace = this.ansibleProjectPlaybooksPath
    const buildId = this.activeProjectInfo.project_name
    const ownBranch = '1.x'
    const configBranch = '1.x'
    let cmd = '--own-branch ' + ownBranch + ' --config-branch ' + configBranch + ' --workspace ' + workspace + ' --build-id ' + buildId + ' --playbook ' + ansiblePath + ' --build-number 1 --previous-stable-build-number 1 --ansible-extra-vars \'{"is_local":"true"}\''
    if (this.verbose) cmd += ' --verbose'
    return cmd
  }
}
