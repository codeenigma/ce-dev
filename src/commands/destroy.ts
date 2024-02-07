import { Config, Flags, ux } from '@oclif/core'
import {execSync} from 'node:child_process'

import BaseCmd from '../abstracts/base-cmd-abstract.js'
import ComposeConfig from '../interfaces/docker-compose-config-interface.js'

export default class DestroyCmd extends BaseCmd {
  static description = 'Destroy project\'s containers using docker compose kill.'

  static examples = [
    '$ ce-dev destroy',
  ]

  static flags = {
    help: Flags.help({char: 'h'}),
  }

  /**
   * @member
   * Docker compose content parsed from yaml.
   */
  private readonly composeConfig: ComposeConfig

  /**
   * @inheritdoc
   */
  public constructor(argv: string[], config: Config) {
    super(argv, config)
    this.ensureActiveComposeFile()
    this.composeConfig = this.loadComposeConfig(this.activeComposeFilePath)
  }

  /**
   * @inheritdoc
   */
  async run(): Promise<void> {
    this.down()
    this.stopControllerContainer()
  }

  /**
   * Wrapper around docker compose.
   *
   * @return void
   */
  private down(): void {
    ux.action.start('Killing containers with docker compose kill')
    execSync(this.dockerComposeBin + ' -p ' + this.activeProjectInfo.project_name + ' kill', {cwd: this.ceDevDir, stdio: 'inherit'})
    ux.action.stop()
    ux.action.start('Remove containers and anonymous volumes with docker compose rm')
    execSync(this.dockerComposeBin + ' -p ' + this.activeProjectInfo.project_name + ' rm -v --force', {cwd: this.ceDevDir, stdio: 'inherit'})
    ux.action.stop()
  }
}
