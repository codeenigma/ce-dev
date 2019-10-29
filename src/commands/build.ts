import {flags} from '@oclif/command'
import {execSync} from 'child_process'

import BaseCmd from '../base-cmd-abstract'
import ComposeConfig from '../compose-config-interface'

export default class BuildCmd extends BaseCmd {
  static description = 'Commit the existing containers as new docker images, and create a new docker-compose file referencing them.'
  static examples = [
    '$ ce-dev build --template example.compose.yml',
  ]
  static flags = {
    help: flags.help({char: 'h'}),
    template: flags.string({
      char: 't',
      description: 'Path to a docker-compose template file, relative to the project root. WARNING: this must match the original one the project was constructed with.',
      default: 'ce-dev.compose.yml'
    }),
    destination: flags.string({
      char: 'd',
      description: 'Path to the output docker-compose file, relative to the project root.',
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
   * Absolute path to the Compose file output.
   */
  private readonly composeDest: string

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
    //@todo normalize path for destination.
    this.composeDest = flags.destination
    this.composeConfig = this.LoadComposeConfig(this.composeTemplate)
  }
  /**
   * @inheritdoc
   */
  async run() {
    this.commit()
    this.generateCompose()
  }

  /**
   * Commit containers as base images.
   */
  private commit() {
    for (let service of Object.values(this.composeConfig.services)) {
      this.log('Committing container ' + service.container_name + ' as a new image.')
      execSync(this.dockerBin + ' commit ' + service.container_name + ' ' + this.dockerRepository + '/' + service.container_name + ':latest', {stdio: 'inherit'})
    }
  }
  /**
   * Generate derivative compose file.
   */
  private generateCompose() {
    this.log('Generating new compose file ' + this.composeDest + '.')
    for (let service of Object.values(this.composeConfig.services)) {
      service.image = this.dockerRepository + '/' + service.container_name + ':latest'
    }
    this.writeYaml(this.composeDest, this.composeConfig)
  }
}
