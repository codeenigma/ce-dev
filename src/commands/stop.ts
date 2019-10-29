import {flags} from '@oclif/command'
import {execSync} from 'child_process'

import BaseCmd from '../base-cmd-abstract'

export default class StopCmd extends BaseCmd {
  static description = 'Stops running containers for a project.'
  static examples = [
    '$ ce-dev stop',
  ]
  static flags = {
    help: flags.help({char: 'h'})
  }

  /**
   * @inheritdoc
   */
  async run() {
    this.ensureActiveComposeFile()
    this.log('Stopping running containers with docker-compose stop')
    execSync(this.dockerComposeBin + ' stop', {cwd: this.ceDevDir})
  }
}
