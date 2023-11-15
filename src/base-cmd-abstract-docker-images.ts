import BaseCmd from './base-cmd-abstract.js'
import ComposeConfig from './compose-config-interface.ts'
import {execSync} from 'child_process'
import { Flags } from '@oclif/core'

export default abstract class DockerImagesCmd extends BaseCmd {
  static flags = {
    help: Flags.help({char: 'h'}),
    template: Flags.string({
      char: 't',
      description: 'Path to a docker compose template file, relative to the project root. WARNING: this must match the original one the project was constructed with.',
      default: 'ce-dev.compose.prebuilt.yml',
    }),
    username: Flags.string({
      char: 'u',
      description: 'Username to use to login against the Docker registry.',
    }),
    password: Flags.string({
      char: 'p',
      description: 'Password to use to login against the Docker registry. Warning, this will appear in your shell history in clear text.',
    }),
    anonymous: Flags.boolean({
      char: 'a',
      description: 'Do not prompt for login credentials.',
    }),
    registry: Flags.string({
      char: 'r',
      description: 'Docker registry to use. This overrides the one defined in the source compose template.',
      default: '',
    }),
  }

  /**
   * @member
   * Absolute path to the Compose file template.
   */
  protected composeTemplate = ''

  /**
   * @member
   * Docker compose content parsed from yaml.
   */
  protected composeConfig: ComposeConfig

  /**
   * @member
   * Docker repository username.
   */
  protected dockerUsername = ''

  /**
   * @member
   * Docker repository password.
   */
  protected dockerPassword = ''

  /**
   * @member
   * Wether to prompt for a login.
   */
  protected dockerLogin = true

  /**
   * @inheritdoc
   */
  public constructor(argv: string[], config: any) {
    super(argv, config)
    this.composeTemplate = this.getPathFromRelative(this.constructor().flags.template)
    this.composeConfig = this.loadComposeConfig(this.composeTemplate)
    if (this.constructor().flags.username) {
      this.dockerUsername = this.constructor().flags.username
    }
    if (this.constructor().flags.password) {
      this.dockerPassword = this.constructor().flags.password
    }
    if (this.constructor().flags.anonymous) {
      this.dockerLogin = false
    }
    if (this.constructor().flags.registry.length > 0) {
      this.dockerRegistry = this.constructor().flags.registry
    }
  }

  /**
   * Login to Docker repository.
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
