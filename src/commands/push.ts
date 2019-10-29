import {flags} from '@oclif/command'
import {execSync} from 'child_process'

import BaseCmd from '../base-cmd-abstract'
import ComposeConfig from '../compose-config-interface'

export default class BuildCmd extends BaseCmd {
  static description = 'Push images referenced in a compose file to a remote repository.'
  static examples = [
    '$ ce-dev push --template example.compose.yml',
  ]
  static flags = {
    help: flags.help({char: 'h'}),
    template: flags.string({
      char: 't',
      description: 'Path to a docker-compose template file, relative to the project root. WARNING: this must match the original one the project was constructed with.',
      default: 'ce-dev.compose.prebuilt.yml'
    })
  }
  /**
   * @var
   * Absolute path to the Compose file template.
   */
  private readonly composeTemplate: string

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
    const {flags} = this.parse(BuildCmd)
    this.composeTemplate = this.getPathFromRelative(flags.template)
    this.composeConfig = this.LoadComposeConfig(this.composeTemplate)
  }
  /**
   * @inheritdoc
   */
  async run() {
    this.push()

  }

  /**
   * Push generated images.
   */
  private push() {
    for (let service of Object.values(this.composeConfig.services)) {
      this.log('Pushing image ' + service.container_name + '...')
      execSync(this.dockerBin + ' push ' + this.dockerRepository + '/' + service.container_name + ':latest', {stdio: 'inherit'})
    }
  }
}
