import {Config} from '@oclif/core'

import AnsibleCmd from '../abstracts/base-cmd-abstract-ansible.js'

export default class DeployCmd extends AnsibleCmd {
  static description = 'Setup an app with Ansible playbooks.'

  static examples = [
    '$ ce-dev deploy example-app',
  ]

  protected ansibleProjectPlaybooksPath = '/home/ce-dev/projects-playbooks/deploy'

  protected ansibleScript = 'scripts/deploy.sh'

  protected ansibleScriptsPath = '/home/ce-dev/ce-deploy'

  /**
   * @inheritdoc
   */
  public constructor(argv: string[], config: Config) {
    super(argv, config)
    this.ansiblePaths = this.activeProjectInfo.deploy
  }

  protected getCommandParameters(ansiblePath: string): string {
    const workspace = this.ansibleProjectPlaybooksPath;
    const buildId = this.activeProjectInfo.project_name;
    const ownBranch = '1.x';
    const configBranch = '1.x';
    let cmd = '--own-branch ' + ownBranch;
    cmd += ' --config-branch ' + configBranch;
    cmd += ' --workspace ' + workspace;
    cmd += ' --build-id ' + buildId;
    cmd += ' --playbook ' + ansiblePath;
    cmd += ' --build-number 1 --previous-stable-build-number 1 --ansible-extra-vars \'{"is_local":"true"}\'';

    return cmd;
  }
}
