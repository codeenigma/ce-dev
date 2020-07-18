import BaseCmd from '../base-cmd-abstract'
import ComposeConfig from '../compose-config-interface'
import YamlParser from '../yaml-parser'
import {execSync} from 'child_process'
import {flags} from '@oclif/command'
import ux from 'cli-ux'

const fspath = require('path')
export default class BuildCmd extends BaseCmd {
  static description = 'Commit the existing containers as new docker images, and create a new docker-compose file referencing them.'

  static examples = [
    '$ ce-dev build --template example.compose.yml',
  ]

  static flags = {
    help: flags.help({char: 'h'}),
    template: flags.string({
      char: 't',
      description: 'Path to a docker-compose template file, relative to the project ce-dev folder. WARNING: this must match the original one the project was constructed with.',
      default: 'ce-dev.compose.yml',
    }),
    destination: flags.string({
      char: 'd',
      description: 'Path to the output docker-compose file, relative to the project ce-dev folder.',
      default: 'ce-dev.compose.prebuilt.yml',
    }),
  }

  /**
   * @member
   * Absolute path to the Compose file template.
   */
  private readonly composeTemplate: string

  /**
   * @member
   * Absolute path to the Compose file output.
   */
  private readonly composeDest: string

  /**
   * @member
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
    // @todo normalize path for destination.
    this.composeDest = fspath.join(this.ceDevDir, flags.destination)
    this.composeConfig = this.loadComposeConfig(this.composeTemplate) as ComposeConfig
  }

  /**
   * @inheritdoc
   */
  async run(): Promise<any> {
    this.commit()
    this.generateCompose()
  }

  /**
   * Commit containers as base images.
   */
  private commit(): void {
    for (const name of Object.keys(this.composeConfig.services)) {
      const containerName = this.composeConfig['x-ce_dev'].project_name + '-' + name
      ux.action.start('Committing container ' + containerName + ' as a new image.')
      execSync(this.dockerBin + ' commit ' + containerName + ' ' + this.dockerRegistry + '/' + containerName + ':latest', {stdio: 'inherit'})
      ux.action.stop()
    }
  }

  /**
   * Generate derivative compose file.
   */
  private generateCompose(): void {
    ux.action.start('Generating new compose file ' + this.composeDest + '.')
    for (const [name, service] of Object.entries(this.composeConfig.services)) {
      const containerName = this.composeConfig['x-ce_dev'].project_name + '-' + name
      service.image = this.dockerRegistry + '/' + containerName + ':latest'
    }
    YamlParser.writeYaml(this.composeDest, this.composeConfig)
    ux.action.stop()
  }
}
