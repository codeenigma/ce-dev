import * as inquirer from 'inquirer'

import BaseCmd from '../base-cmd-abstract'
import {flags} from '@oclif/command'

inquirer.registerPrompt('fuzzypath', require('inquirer-fuzzy-path'))
export default class ConfigCmd extends BaseCmd {
  static description = 'Configure global user preferences.'

  static examples = [
    '$ ce-dev config ',
  ]

  static flags = {
    global: flags.boolean({
      char: 'g',
      description: 'Update global config instead of project one',
      default: false,
    }),
  }

  async run(): Promise<any> {
    const prompts = this.globalConfig()
    const response: inquirer.Answers = await inquirer.prompt(prompts)
    for (const key of Object.keys(this.UserConfig)) {
      // @todo
      // @ts-ignore
      this.UserConfig[key] = response[key]
    }
    this.saveUserConfig()
  }

  /**
   * Global user config prompts.
   *
   * @returns
   * Prompts for user.
   */
  private globalConfig(): Array<inquirer.Question> {
    return [
      {
        name: 'docker_bin',
        message: 'Docker command/binary',
        type: 'input',
        default: this.UserConfig.docker_bin,
      },
      {
        name: 'docker_compose_bin',
        message: 'Docker Compose command/binary',
        type: 'input',
        default: this.UserConfig.docker_compose_bin,
      },
      {
        name: 'mkcert_bin',
        message: 'MKCert command/binary',
        type: 'input',
        default: this.UserConfig.mkcert_bin,
      },
      {
        name: 'ssh_user',
        message: 'Default SSH username for external hosts',
        type: 'input',
        default: this.UserConfig.ssh_user,
      },
      {
        name: 'ssh_key',
        message: 'Default SSH private key for external hosts',
        type: 'fuzzypath',
        // @ts-ignore
        // Can not autoregister plugins yet.
        itemType: 'file',
        rootPath: process.env.HOME + '/.ssh',
        default: this.UserConfig.ssh_key,
      },
    ]
  }
}
