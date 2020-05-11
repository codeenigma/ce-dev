import {execSync} from 'child_process'

import DockerImagesCmd from '../base-cmd-abstract-docker-images'
import CeDevConfig from '../ce-dev-config-interface'
export default class PushCmd extends DockerImagesCmd {
  static description = 'Push images referenced in a compose file to a remote repository.'
  static examples = [
    '$ ce-dev push --template example.compose.yml',
  ]
  /**
   * @inheritdoc
   */
  public constructor(argv: string[], config: any) {
    super(argv, config)
    const {flags} = this.parse(PushCmd)
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
    this.push()
  }

  /**
   * Push generated images.
   */
  private push() {
    for (let name of Object.keys(this.composeConfig.services)) {
      let containerName = this.composeConfig['x-ce_dev'].project_name + '-' + name
      this.log('Pushing image ' + containerName + '...')
      execSync(this.dockerBin + ' push ' + this.dockerRegistry + '/' + containerName + ':latest', {stdio: 'inherit'})
    }
  }
}
