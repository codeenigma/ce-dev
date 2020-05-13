import {execSync} from 'child_process'

import DockerImagesCmd from '../base-cmd-abstract-docker-images'
import CeDevConfig from '../ce-dev-config-interface'
import ComposeConfigService from '../compose-config-service-interface'
export default class PullCmd extends DockerImagesCmd {
  static description = 'Pull images referenced in a compose file from a remote repository.'
  static examples = [
    '$ ce-dev pull --template example.compose.yml',
  ]

  /**
   * @inheritdoc
   */
  public constructor(argv: string[], config: any) {
    super(argv, config)
    const {flags} = this.parse(DockerImagesCmd)
    this.composeTemplate = this.getPathFromRelative(flags.template)
    this.composeConfig = this.LoadComposeConfig(this.composeTemplate) as CeDevConfig
    if (flags.username) {
      this.dockerUsername = flags.username
    }
    if (flags.password) {
      this.dockerPassword = flags.password
    }
    if (flags.anonymous) {
      this.dockerLogin = false
    }
  }

  /**
   * @inheritdoc
   */
  async run() {
    if (this.dockerLogin) {
      this.login()
    }
    this.pull()
  }

  /**
   * Push generated images.
   */
  private pull() {
    this.pullControllerContainer()
    for (let service of Object.values(this.composeConfig.services as ComposeConfigService)) {
      if (service.image) {
        this.log('Pulling image ' + service.image + '...')
        execSync(this.dockerBin + ' pull ' + service.image , {stdio: 'inherit'})
      }
    }
  }
}
