import {flags} from '@oclif/command'
import {execSync} from 'child_process'

import BaseCmd from '../base-cmd-abstract'
import ComposeConfig from '../compose-config-interface'

export default class DestroyCmd extends BaseCmd {
  static description = 'Destroy project\'s containers using docker-compose kill.'
  static examples = [
    '$ ce-dev destroy',
  ]
  static flags = {
    help: flags.help({char: 'h'})
  }

  /**
   * @var
   * Docker compose content parsed from yaml.
   */
  private readonly composeConfig: ComposeConfig

  /**
   * @inheritdoc
   */
  public constructor(argv: string[], config: any) {
    super(argv, config)
    this.ensureActiveComposeFile()
    this.composeConfig = this.LoadComposeConfig(this.activeComposeFilePath)
  }

  /**
   * @inheritdoc
   */
  async run() {
    this.down()
  }

  /**
   * Wrapper around docker-compose.
   */
  private down() {
    this.log('Killing containers with docker-compose kill')
    execSync(this.dockerComposeBin + ' -p ' + this.activeProjectInfo.project_name + ' kill', {cwd: this.ceDevDir, stdio: 'inherit'})
  }
}