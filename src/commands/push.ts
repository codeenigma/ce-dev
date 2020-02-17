import {flags} from '@oclif/command'
import {execSync} from 'child_process'

import BaseCmd from '../base-cmd-abstract'
import CeDevConfig from '../ce-dev-config-interface'

export default class BuildCmd extends BaseCmd {
  static description = 'Push images referenced in a compose file to a remote repository.'
  static examples = [
    '$ ce-dev push --template example.compose.yml',
  ]
  static flags = {
    help: flags.help({char: 'h'}),
    template: flags.string({
      char: 't',
      description: 'Path to a docker-compose template file, relative to the project root. WARNING: this must match the original one the project was constructed with.',
      default: 'ce-dev.compose.prebuilt.yml'
    }),
    username: flags.string({
      char: 'u',
      description: 'Username to use to login against the Docker registry. For repository that do not require auth, you can enter anything as username/pwd',
    }),
    password: flags.string({
      char: 'p',
      description: 'Password to use to login against the Docker registry. Warning, this will appear in your shell history in clear text.',
    })
  }

  /**
   * @var
   * Absolute path to the Compose file template.
   */
  private readonly composeTemplate: string

  /**
   * @var
   * Docker compose content parsed from yaml.
   */
  private readonly composeConfig: CeDevConfig

  /**
   * @var
   * Docker repository username.
   */
  private readonly dockerUsername: string = ''

  /**
   * @var
   * Docker repository password.
   */
  private readonly dockerPassword: string = ''

  /**
   * @inheritdoc
   */
  public constructor(argv: string[], config: any) {
    super(argv, config)
    const {flags} = this.parse(BuildCmd)
    this.composeTemplate = this.getPathFromRelative(flags.template)
    this.composeConfig = this.LoadComposeConfig(this.composeTemplate) as CeDevConfig
    if (flags.username) {
      this.dockerUsername = flags.username
    }
    if (flags.password) {
      this.dockerPassword = flags.password
    }
  }

  /**
   * @inheritdoc
   */
  async run() {
    this.login()
    this.push()
  }

  /**
   * Login to Docker repository.
   */
  private login() {
    this.log('Login to repository ' + this.dockerRepository + '.')
    let cmd = this.dockerBin + ' login ' + this.dockerRepository
    if (this.dockerUsername.length > 0) {
      cmd += ' -u ' + this.dockerUsername
    }
    if (this.dockerPassword.length > 0) {
      cmd += ' -p ' + this.dockerPassword
    }
    execSync(cmd, {stdio: 'inherit'})
  }

  /**
   * Push generated images.
   */
  private push() {
    for (let name of Object.keys(this.composeConfig.services)) {
      let containerName = this.composeConfig['x-ce_dev'].project_name + '-' + name
      this.log('Pushing image ' + containerName + '...')
      execSync(this.dockerBin + ' push ' + this.dockerRepository + '/' + containerName + ':latest', {stdio: 'inherit'})
    }
  }
}
