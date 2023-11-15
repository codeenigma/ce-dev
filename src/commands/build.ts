import BaseCmd from '../base-cmd-abstract.ts'
import ComposeConfig from '../compose-config-interface.ts'
import YamlParser from '../yaml-parser.ts'
import {execSync} from 'child_process'
import { Flags, ux } from '@oclif/core'
import * as fspath from 'path'


export default class BuildCmd extends BaseCmd {
  static description = 'Commit the existing containers as new docker images, and create a new docker compose file referencing them.'

  static examples = [
    '$ ce-dev build --template example.compose.yml',
  ]

  static flags = {
    help: Flags.help({char: 'h'}),
    template: Flags.string({
      char: 't',
      description: 'Path to a docker compose template file, relative to the project ce-dev folder. WARNING: this must match the original one the project was constructed with.',
      default: 'ce-dev.compose.yml',
    }),
    destination: Flags.string({
      char: 'd',
      description: 'Path to the output docker compose file, relative to the project ce-dev folder.',
      default: 'ce-dev.compose.prebuilt.yml',
    }),
    registry: Flags.string({
      char: 'r',
      description: 'Docker registry to use. This overrides the one defined in the source compose template.',
      default: '',
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
    this.composeTemplate = this.getPathFromRelative(this.constructor().flags.template)
    // @todo normalize path for destination.
    this.composeDest = fspath.join(this.ceDevDir, this.constructor().flags.destination)
    this.composeConfig = this.loadComposeConfig(this.composeTemplate)
    if (this.constructor().flags.registry.length > 0) {
      this.dockerRegistry = this.constructor().flags.registry
    }
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
      const containerName = this.composeConfig['x-ce_dev']?.project_name + '-' + name
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
      const containerName = this.composeConfig['x-ce_dev']?.project_name + '-' + name
      service.image = this.dockerRegistry + '/' + containerName + ':latest'
    }
    YamlParser.writeYaml(this.composeDest, this.composeConfig)
    ux.action.stop()
  }
}
