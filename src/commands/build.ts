import { Flags, ux } from '@oclif/core'
import {execSync} from 'node:child_process'
import fspath from "node:path";

import BaseCmd from '../abstracts/base-cmd-abstract.js'
import ComposeConfig from '../interfaces/docker-compose-config-interface.js'
import YamlParser from '../yaml-parser.js'

export default class BuildCmd extends BaseCmd {
  static description = 'Commit the existing containers as new docker images, and create a new docker compose file referencing them.'

  static examples = [
    '$ ce-dev build --template example.compose.yml',
  ]

  static flags = {
    destination: Flags.string({
      char: 'd',
      default: 'ce-dev.compose.prebuilt.yml',
      description: 'Path to the output docker compose file, relative to the project ce-dev folder.',
    }),
    help: Flags.help({char: 'h'}),
    registry: Flags.string({
      char: 'r',
      default: '',
      description: 'Docker registry to use. This overrides the one defined in the source compose template.',
    }),
    template: Flags.string({
      char: 't',
      default: 'ce-dev.compose.yml',
      description: 'Path to a docker compose template file, relative to the project ce-dev folder. WARNING: this must match the original one the project was constructed with.',
    }),
  }

  /**
   * @member
   * Docker compose content parsed from yaml.
   */
  private composeConfig: ComposeConfig

  /**
   * @member
   * Absolute path to the Compose file output.
   */
  private composeDest: string = ''

  /**
   * @member
   * Absolute path to the Compose file template.
   */
  private composeTemplate: string = ''

  /**
   * @inheritdoc
   */
  async run(): Promise<void> {
    const {flags} = await this.parse(BuildCmd)
    this.composeTemplate = this.getPathFromRelative(flags.template)
    // @todo normalize path for destination.
    this.composeDest = fspath.join(this.ceDevDir, flags.destination)
    this.composeConfig = this.loadComposeConfig(this.composeTemplate)
    if (flags.registry.length > 0) {
      this.dockerRegistry = flags.registry
    }

    this.commit()
    this.generateCompose()
  }

  /**
   * Commit containers as base images.
   *
   * @return void
   */
  private commit(): void {
    for (const name of Object.keys(this.composeConfig?.services)) {
      let containerName = name;
      if (this.composeConfig['x-ce_dev']) {
        containerName = this.composeConfig['x-ce_dev'].project_name + '-' + name
      }
      let version = 'latest'
      if (this.developmentMode) {
        version = 'devel'
      }

      ux.action.start('Committing container ' + containerName + ' as a new image.')
      execSync(this.dockerBin + ' commit ' + containerName + ' ' + this.dockerRegistry + '/' + containerName + ':' + version, {stdio: 'inherit'})
      ux.action.stop()
    }
  }

  /**
   * Generate derivative compose file.
   *
   * @return void
   */
  private generateCompose(): void {
    let version = 'latest'
    if (this.developmentMode) {
      version = 'devel'
    }
    ux.action.start('Generating new compose file ' + this.composeDest + '.')
    for (const [name, service] of Object.entries(this.composeConfig.services)) {
      const containerName = this.composeConfig['x-ce_dev'].project_name + '-' + name
      service.image = this.dockerRegistry + '/' + containerName + ':' + version
    }

    YamlParser.writeYaml(this.composeDest, this.composeConfig)
    ux.action.stop()
  }
}
