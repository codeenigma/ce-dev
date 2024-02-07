import { Flags, ux } from '@oclif/core'
import {execSync} from 'node:child_process'

import BaseCmd from '../abstracts/base-cmd-abstract.js'

export default class StopCmd extends BaseCmd {
  static description = 'Stops running containers for a project.'

  static examples = [
    '$ ce-dev stop',
  ]

  static flags = {
    help: Flags.help({char: 'h'}),
  }

  /**
   * @inheritdoc
   */
  async run(): Promise<void> {
    this.ensureActiveComposeFile()
    ux.action.start('Stopping running containers with docker compose stop')
    execSync(this.dockerComposeBin + ' -p ' + this.activeProjectInfo.project_name + ' stop', {cwd: this.ceDevDir})
    this.stopControllerContainer()
    ux.action.stop()
  }
}
