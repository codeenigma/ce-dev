import {execSync} from 'node:child_process'

import BaseCmd from '../abstracts/base-cmd-abstract.js'

export default class UpdateCmd extends BaseCmd {
  static description = 'Update base images and ce-dev cli.'

  static examples = [
    '$ ce-dev update',
  ]

  async run(): Promise<void> {
    this.pullControllerContainer()
    execSync('curl -sL https://raw.githubusercontent.com/codeenigma/ce-dev/1.x/install.sh | /bin/sh -s -- ' + this.config.platform, {stdio: 'inherit'})
  }
}
