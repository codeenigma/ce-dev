import BaseCmd from '../base-cmd-abstract'
import {execSync} from 'child_process'
import { Flags, ux } from '@oclif/core'

const inquirer = require('inquirer')
const prompt = inquirer.createPromptModule();

export default class CleanCmd extends BaseCmd {
  static description = 'Remove unused Docker artifacts (volumes, images).'

  static examples = [
    '$ ce-dev clean ',
  ]

  static flags = {
    quiet: Flags.boolean({
      char: 'q',
      description: 'Non-interactive, do not prompt for container deletion choice.',
      default: false,
    }),
  }

  async run(): Promise<any> {
    const {flags} = await this.parse(CleanCmd)
    if (!flags.quiet) {
      const prompts = this.containerChoice()
      const response = await prompt(prompts)
      response.containers.forEach((containerName: string) => {
        ux.action.start(this.dockerBin + ' stop ' + containerName)
        execSync(this.dockerBin + ' stop ' + containerName)
        ux.action.stop()
        ux.action.start(this.dockerBin + ' rm ' + containerName)
        execSync(this.dockerBin + ' rm ' + containerName)
        ux.action.stop()
      })
    }
    this.cleanUp()
  }

  /**
   * Global container deletion prompts.
   *
   * @returns
   * Prompts for user.
   */
  private containerChoice(): { name: string; message: string; type: string; choices: string[] }[] {
    const containers = execSync(this.dockerBin + ' ps -a --format={{.Names}}').toString()
    const containerNames = containers.split('\n').filter(item => {
      return (item.length > 0)
    })
    return [
      {
        name: 'containers',
        message: 'Select containers you want to delete (if any)',
        type: 'checkbox',
        // @ts-ignore
        choices: containerNames,
      },
    ]
  }

  /**
   * Clean up docker images/volumes.
   *
   */
  private cleanUp(): void {
    this.log('Remove all custom networks not used by at least one container.')
    this.log(this.dockerBin + ' network prune')
    execSync(this.dockerBin + ' network prune --force', {stdio: 'inherit'})
    this.log('Remove all dangling and unused images.')
    this.log(this.dockerBin + ' image prune --all')
    execSync(this.dockerBin + ' image prune --all --force', {stdio: 'pipe'})
    this.log('Remove all unused local volumes.')
    this.log(this.dockerBin + ' volume prune')
    execSync(this.dockerBin + ' volume prune --force', {stdio: 'inherit'})
  }
}
