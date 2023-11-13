import * as inquirer from 'inquirer'

import BaseCmd from '../base-cmd-abstract'
import {execSync} from 'child_process'
import { Flags} from '@oclif/core'

export default class ShellCmd extends BaseCmd {
  static description = 'Open a shell session on the given container.'

  static examples = [
    '$ ce-dev shell example-app',
  ]

  static flags = {
    help: Flags.help({char: 'h'}),
  }

  static args = [
    {
      name: 'container',
      required: false,
      description: 'Name of the container to target. Use `docker ps` to see available containers.',
    },
  ]

  async run(): Promise<any> {
    this.ensureActiveComposeFile()
    const {args} = this.parse(ShellCmd)
    let container = args.container
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
        const response: any = await inquirer.prompt([{
          name: 'container',
          message: 'Select a container to target',
          type: 'list',
          choices: running,
        }])
        container = response.container
      }
    }
    execSync(this.dockerBin + ' exec -it -u ce-dev -w /home/ce-dev ' + container + ' sudo su ce-dev || exit 0', {stdio: 'inherit'})
  }
}
