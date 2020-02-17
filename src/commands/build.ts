import {flags} from '@oclif/command'
import {execSync} from 'child_process'

import BaseCmd from '../base-cmd-abstract'
import CeDevConfig from '../ce-dev-config-interface'

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
      default: 'ce-dev.compose.yml'
    }),
    destination: flags.string({
      char: 'd',
      description: 'Path to the output docker-compose file, relative to the project ce-dev folder.',
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
  private readonly composeConfig: CeDevConfig

  /**
   * @inheritdoc
   */
  public constructor(argv: string[], config: any) {
    super(argv, config)
    const {flags} = this.parse(BuildCmd)
    this.composeTemplate = this.getPathFromRelative(flags.template)
    //@todo normalize path for destination.
    this.composeDest = fspath.join(this.ceDevDir, flags.destination)
    this.composeConfig = this.LoadComposeConfig(this.composeTemplate) as CeDevConfig
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
    for (let name of Object.keys(this.composeConfig.services)) {
      let containerName = this.composeConfig['x-ce_dev'].project_name + '-' + name
      this.log('Committing container ' + containerName + ' as a new image.')
      execSync(this.dockerBin + ' commit ' + containerName + ' ' + this.dockerRepository + '/' + containerName + ':latest', {stdio: 'inherit'})
    }
  }
  /**
   * Generate derivative compose file.
   */
  private generateCompose() {
    this.log('Generating new compose file ' + this.composeDest + '.')
    for (let [name, service] of Object.entries(this.composeConfig.services)) {
      let containerName = this.composeConfig['x-ce_dev'].project_name + '-' + name
      service.image = this.dockerRepository + '/' + containerName + ':latest'
    }
    this.writeYaml(this.composeDest, this.composeConfig)
  }
}
