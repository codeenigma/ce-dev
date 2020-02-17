import {flags} from '@oclif/command'
import {execSync} from 'child_process'

import BaseCmd from '../base-cmd-abstract'
import CeDevConfig from '../ce-dev-config-interface'

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
  private readonly composeConfig: CeDevConfig

  /**
   * @inheritdoc
   */
  public constructor(argv: string[], config: any) {
    super(argv, config)
    const {flags} = this.parse(BuildCmd)
    this.composeTemplate = this.getPathFromRelative(flags.template)
    //@todo normalize path for destination.
    this.composeDest = flags.destination
    this.composeConfig = this.LoadComposeConfig(this.composeTemplate) as CeDevConfig
  }
  /**
   * @inheritdoc
   */
  async run() {
    this.ensureLocalRegistry()
    this.commit()
    this.generateCompose()
  }

  /**
   * Ensure we have a local registry, if we're using localhost.
   */
  private ensureLocalRegistry() {
    let [registryHost, registryPort] = this.dockerRepository.split(':')
    if (registryHost !== 'ce-dev-registry') {
      return
    }
    let port = parseInt(registryPort, 10)
    if (isNaN(port)) {
      return
    }
    let existing = execSync(this.dockerBin + ' ps -a | grep ce-dev-registry | wc -l').toString().trim()
    if (existing === '0') {
      this.log('Creating local registry container "ce-dev-registry".')
      execSync(this.dockerBin + ' run -d -p ' + port + ':5000 --restart=unless-stopped --name ce-dev-registry registry:2')
      return
    }
    let status = execSync(this.dockerBin + ' inspect ce-dev-registry --format={{.State.Status}}').toString().trim()
    if (status === 'running') {
      return
    }
    this.log('Starting local registry container "ce-dev-registry".')
    execSync(this.dockerBin + ' start ce-dev-registry')
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
