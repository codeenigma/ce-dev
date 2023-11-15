import DockerImagesCmd from '../base-cmd-abstract-docker-images.ts'
import {execSync} from 'child_process'
import { ux } from '@oclif/core'

export default class PullCmd extends DockerImagesCmd {
  static description = 'Pull images referenced in a compose file from a remote repository.'

  static examples = [
    '$ ce-dev pull --template example.compose.yml',
  ]

  /**
   * @inheritdoc
   */
  async run(): Promise<any> {
    if (this.dockerLogin) {
      this.login()
    }
    this.pull()
  }

  /**
   * Pull custom generated images.
   */
  private pull(): void {
    for (const service of Object.values(this.composeConfig.services)) {
      if (service.image) {
        ux.action.start('Pulling image ' + service.image)
        execSync(this.dockerBin + ' pull ' + service.image, {stdio: 'inherit'})
        ux.action.stop()
      }
    }
  }
}
