import { ux } from '@oclif/core'
import {execSync} from 'node:child_process'

import DockerImagesCmd from '../abstracts/base-cmd-abstract-docker-images.js'

export default class PushCmd extends DockerImagesCmd {
  static description = 'Push images referenced in a compose file to a remote repository.'

  static examples = [
    '$ ce-dev push --template example.compose.yml',
  ]

  /**
   * @inheritdoc
   */
  async run(): Promise<void> {
    const { flags } = await this.parse(PushCmd)
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

    this.push()
  }

  /**
   * Push generated images.
   *
   * @return void
   */
  private push(): void {
    let version = 'latest'
    if (this.developmentMode) {
      version = 'devel'
    }
    for (const name of Object.keys(this.composeConfig.services)) {
      const containerName = this.composeConfig['x-ce_dev'].project_name + '-' + name
      ux.action.start('Pushing image ' + containerName)
      execSync(this.dockerBin + ' push ' + this.dockerRegistry + '/' + containerName + ':' + version, {stdio: 'inherit'})
      ux.action.stop()
    }
  }
}
