import BaseCmd from '../base-cmd-abstract.ts'
import {execSync} from 'child_process'

export default class UpdateCmd extends BaseCmd {
  static description = 'Update base images and ce-dev cli.'

  static examples = [
    '$ ce-dev update',
  ]

  async run(): Promise<any> {
    this.pullControllerContainer()
    execSync('curl -sL https://raw.githubusercontent.com/codeenigma/ce-dev/1.x/install.sh | /bin/sh -s -- ' + this.config.platform, {stdio: 'inherit'})
  }
}
