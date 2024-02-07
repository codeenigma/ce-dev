import { Args, Flags } from '@oclif/core'
import inquirer from 'inquirer'
import {execSync} from 'node:child_process'

import BaseCmd from '../abstracts/base-cmd-abstract.js'

export default class ShellCmd extends BaseCmd {
  static args = {
    container: Args.string({
      description: 'Name of the container to target. Use `docker ps` to see available containers.',
      name: 'container',
      required: false
    })
  }

  static description = 'Open a shell session on the given container.'

  static examples = [
    '$ ce-dev shell example-app',
  ]

  static flags = {
    help: Flags.help({char: 'h'}),
  }

  async run(): Promise<void> {
    this.ensureActiveComposeFile()
    const { args} = await this.parse(ShellCmd)
    let { container } = args
    if (!container) {
      const running = this.getProjectRunningContainersCeDev()
      if (running.length === 0) {
        this.warn('No running containers can be targetted. Exiting.')
        this.exit(1)
      }

      // Single container, just use this.
      if (running.length === 1) {
        container = running[0]
      } else {
        const response = await inquirer.prompt([{
          choices: running,
          message: 'Select a container to target',
          name: 'container',
          type: 'list',
        }])
        container = response.container
      }
    }

    execSync(this.dockerBin + ' exec -it -u ce-dev -w /home/ce-dev ' + container + ' sudo su ce-dev || exit 0', {stdio: 'inherit'})
  }
}
