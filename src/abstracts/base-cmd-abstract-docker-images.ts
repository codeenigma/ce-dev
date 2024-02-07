import { Flags } from '@oclif/core'
import {execSync} from 'node:child_process'

import ComposeConfig from '../interfaces/docker-compose-config-interface.js'
import BaseCmd from './base-cmd-abstract.js'

export default abstract class DockerImagesCmd extends BaseCmd {
  static flags= {
    anonymous: Flags.boolean({
      char: 'a',
      description: 'Do not prompt for login credentials.',
    }),
    help: Flags.help({char: 'h'}),
    password: Flags.string({
      char: 'p',
      description: 'Password to use to login against the Docker registry. Warning, this will appear in your shell history in clear text.',
    }),
    registry: Flags.string({
      char: 'r',
      default: '',
      description: 'Docker registry to use. This overrides the one defined in the source compose template.',
    }),
    template: Flags.string({
      char: 't',
      default: 'ce-dev.compose.prebuilt.yml',
      description: 'Path to a docker compose template file, relative to the project root. WARNING: this must match the original one the project was constructed with.',
    }),
    username: Flags.string({
      char: 'u',
      description: 'Username to use to login against the Docker registry.',
    }),
  }

  /**
   * @member
   * Docker compose content parsed from yaml.
   */
  protected composeConfig: ComposeConfig

  /**
   * @member
   * Absolute path to the Compose file template.
   */
  protected composeTemplate = ''

  /**
   * @member
   * Wether to prompt for a login.
   */
  protected dockerLogin = true

  /**
   * @member
   * Docker repository password.
   */
  protected dockerPassword = ''

  /**
   * @member
   * Docker repository username.
   */
  protected dockerUsername = ''

  /**
   * Login to Docker repository.
   *
   * @return void
   */
  protected login(): void {
    this.log('Login to repository ' + this.dockerRegistry + '.')
    let cmd = this.dockerBin + ' login ' + this.dockerRegistry
    if (this.dockerUsername.length > 0) {
      cmd += ' -u ' + this.dockerUsername
    }

    if (this.dockerPassword.length > 0) {
      cmd += ' -p ' + this.dockerPassword
    }

    execSync(cmd, {stdio: 'inherit'})
  }
}
