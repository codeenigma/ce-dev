import BaseCmd from '../base-cmd-abstract'
import {execSync} from 'child_process'
import {flags} from '@oclif/command'
import ux from 'cli-ux'

export default class StopCmd extends BaseCmd {
  static description = 'Stops running containers for a project.'

  static examples = [
    '$ ce-dev stop',
  ]

  static flags = {
    help: flags.help({char: 'h'}),
  }

  /**
   * @inheritdoc
   */
  async run(): Promise<any> {
    this.ensureActiveComposeFile()
    ux.action.start('Stopping running containers with docker compose stop')
    execSync(this.dockerComposeBin + ' -p ' + this.activeProjectInfo.project_name + ' stop', {cwd: this.ceDevDir})
    this.stopControllerContainer()
    ux.action.stop()
  }
}
