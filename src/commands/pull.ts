import {execSync} from 'child_process'
import ux from 'cli-ux'

import DockerImagesCmd from '../base-cmd-abstract-docker-images'
import ComposeConfigService from '../compose-config-service-interface'
export default class PullCmd extends DockerImagesCmd {
  static description = 'Pull images referenced in a compose file from a remote repository.'
  static examples = [
    '$ ce-dev pull --template example.compose.yml',
  ]

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
        ux.action.start('Pulling image ' + service.image)
        execSync(this.dockerBin + ' pull ' + service.image , {stdio: 'inherit'})
        ux.action.stop()
      }
    }
  }
}
