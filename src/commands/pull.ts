import { ux } from '@oclif/core'
import {execSync} from 'node:child_process'

import DockerImagesCmd from '../abstracts/base-cmd-abstract-docker-images.js'

export default class PullCmd extends DockerImagesCmd {
  static description = 'Pull images referenced in a compose file from a remote repository.'

  static examples = [
    '$ ce-dev pull --template example.compose.yml',
  ]

  /**
   * @inheritdoc
   */
  async run(): Promise<void> {
    const { flags } = await this.parse(PullCmd)
    this.composeTemplate = this.getPathFromRelative(flags.template)
    this.composeConfig = this.loadComposeConfig(this.composeTemplate)

    if (flags.username) {
      this.dockerUsername = flags.username
    }

    if (flags.password) {
      this.dockerPassword = flags.password
    }

    if (flags.anonymous) {
      this.dockerLogin = false
    }

    if (flags.registry.length > 0) {
      this.dockerRegistry = flags.registry
    }

    if (this.dockerLogin) {
      this.login()
    }

    this.pull()
  }

  /**
   * Pull custom generated images.
   *
   * @return void
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
