import BaseCmd from '../base-cmd-abstract'
import {execSync} from 'child_process'

export default class UpdateCmd extends BaseCmd {
  static description = 'Update base images and ce-dev cli.'

  static examples = [
    '$ ce-dev update',
  ]

  async run(): Promise<any> {
    execSync(this.dockerBin + ' image pull codeenigma/ce-dev-controller-1.x', {stdio: 'inherit'})
    execSync(this.dockerBin + ' image pull codeenigma/ce-dev-1.x:latest', {stdio: 'inherit'})
    execSync('curl -sL https://raw.githubusercontent.com/codeenigma/ce-dev/1.x/install/' + this.config.platform + '.sh | /bin/sh', {stdio: 'inherit'})
  }
}
