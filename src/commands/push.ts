import {execSync} from 'child_process'
import ux from 'cli-ux'

import DockerImagesCmd from '../base-cmd-abstract-docker-images'
export default class PushCmd extends DockerImagesCmd {
  static description = 'Push images referenced in a compose file to a remote repository.'
  static examples = [
    '$ ce-dev push --template example.compose.yml',
  ]

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
      ux.action.start('Pushing image ' + containerName)
      execSync(this.dockerBin + ' push ' + this.dockerRegistry + '/' + containerName + ':latest', {stdio: 'inherit'})
      ux.action.stop()
    }
  }
}
