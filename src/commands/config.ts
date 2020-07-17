import {flags} from '@oclif/command'
import * as inquirer from 'inquirer'

import BaseCmd from '../base-cmd-abstract'

export default class ConfigCmd extends BaseCmd {
  static description = 'Configure global user preferences.'
  static examples = [
    '$ ce-dev config ',
  ]
  static flags = {
    global: flags.boolean({
      char: 'g',
      description: 'Update global config instead of project one',
      default: false
    })
  }

  async run() {
    let prompts = this.globalConfig()
    let response: inquirer.Answers = await inquirer.prompt(prompts)
    for (let key of Object.keys(this.UserConfig)) {
      // @todo
      // @ts-ignore
      this.UserConfig[key] = response[key]
    }
    this.saveUserConfig()
  }
  /**
   * Global user config prompts.
   */
  private globalConfig(): Array<inquirer.Question> {
    return [
      {
        name: 'docker_bin',
        message: 'Docker command/binary',
        type: 'input',
        default: this.UserConfig.docker_bin
      },
      {
        name: 'docker_compose_bin',
        message: 'Docker Compose command/binary',
        type: 'input',
        default: this.UserConfig.docker_compose_bin
      },
      {
        name: 'ssh_user',
        message: 'Default SSH username for external hosts',
        type: 'input',
        default: this.UserConfig.ssh_user
      },
      {
        name: 'ssh_key',
        message: 'Default SSH private key for external hosts',
        type: 'input',
        default: this.UserConfig.ssh_key
      }
    ]
  }

}
