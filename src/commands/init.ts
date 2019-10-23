import { flags } from '@oclif/command'

import BaseCmd from '../cmd'

export default class InitCmd extends BaseCmd {
  static description = 'Generates a docker-compose.yml file from a template'
  static examples = [
    '$ ce-dev --template example.compose.yml',
  ]
  static flags = {
    help: flags.help({ char: 'h' }),
    template: flags.string({
      char: 't',
      description: 'path to a docker-compose template file, relative to the project root',
      default: 'ce-dev.compose.yml'
    })
  }
  /**
   * @var
   * Absolute path to the Compose file template.
   */
  protected composeTemplate: string
  /**
   * @inheritdoc 
   */
  public constructor(argv: string[], config: any) {
    super(argv, config)
    const { flags } = this.parse(InitCmd)
    this.composeTemplate = this.getRelativePath(flags.template)
  }
  /**
   * @inheritdoc
   */
  async run() {
    this.log(this.composeTemplate)

  }
}
