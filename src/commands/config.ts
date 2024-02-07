import inquirer from "inquirer";
import inquirerFuzzyPath from "inquirer-fuzzy-path"

import BaseCmd from '../abstracts/base-cmd-abstract.js'

inquirer.registerPrompt('fuzzypath', <inquirer.prompts.PromptConstructor>inquirerFuzzyPath)
export default class ConfigCmd extends BaseCmd {
  static description = 'Configure global user preferences.'

  static examples = [
    '$ ce-dev config ',
  ]

  async run(): Promise<void> {
    const prompts = this.globalConfig()
    const response = await inquirer.prompt(prompts)
    for (const key of Object.keys(this.UserConfig)) {
      this.UserConfig[key as keyof typeof this.UserConfig] = response[key]
    }

    this.saveUserConfig()
  }

  /**
   * Global user config prompts.
   *
   * @returns
   * Prompts for user.
   */
  private globalConfig(): Array<object> {
    return [
      {
        default: this.UserConfig.docker_bin,
        message: 'Docker command/binary',
        name: 'docker_bin',
        type: 'input',
      },
      {
        default: this.UserConfig.docker_compose_bin,
        message: 'Docker Compose command/binary',
        name: 'docker_compose_bin',
        type: 'input',
      },
      {
        default: this.UserConfig.mkcert_bin,
        message: 'MKCert command/binary',
        name: 'mkcert_bin',
        type: 'input',
      },
      {
        default: this.UserConfig.ssh_user,
        message: 'Default SSH username for external hosts',
        name: 'ssh_user',
        type: 'input',
      },
      {
        default: this.UserConfig.ssh_key,
        // Can not autoregister plugins yet.
        itemType: 'file',
        message: 'Default SSH private key for external hosts',
        name: 'ssh_key',
        rootPath: process.env.HOME + '/.ssh',
        type: 'fuzzypath',
      },
    ]
  }
}
