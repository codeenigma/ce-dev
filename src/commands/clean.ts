import { Flags, ux } from '@oclif/core'
import inquirer from 'inquirer';
import {execSync} from 'node:child_process'

import BaseCmd from '../abstracts/base-cmd-abstract.js'

export default class CleanCmd extends BaseCmd {
  static description = 'Remove unused Docker artifacts (volumes, images).'

  static examples = [
    '$ ce-dev clean ',
  ]

  static flags = {
    quiet: Flags.boolean({
      char: 'q',
      default: false,
      description: 'Non-interactive, do not prompt for container deletion choice.',
    }),
  }

  async run(): Promise<void> {
    const {flags} = await this.parse(CleanCmd)
    if (!flags.quiet) {
      const prompts = this.containerChoice()
      const response = await inquirer.prompt(prompts)
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
   * Clean up docker images/volumes.
   *
   * @return void
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

  /**
   * Global container deletion prompts.
   *
   * @returns
   * Prompts for user.
   */
  private containerChoice(): Array<object> {
    const containers = execSync(this.dockerBin + ' ps -a --format={{.Names}}').toString()
    const containerNames = containers.split('\n').filter(item => (item.length > 0))
    return [
      {
        // @ts-ignore
        choices: containerNames,
        message: 'Select containers you want to delete (if any)',
        name: 'containers',
        type: 'checkbox',
      },
    ]
  }
}
