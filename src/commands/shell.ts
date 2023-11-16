import BaseCmd from '../base-cmd-abstract'
import {execSync} from 'child_process'
import { Flags, Args} from '@oclif/core'

const inquirer = require('inquirer')
const prompt = inquirer.createPromptModule();

export default class ShellCmd extends BaseCmd {
  static description = 'Open a shell session on the given container.'

  static examples = [
    '$ ce-dev shell example-app',
  ]

  static flags = {
    help: Flags.help({char: 'h'}),
    container: Flags.string({
      description: 'Name of the container to target. Use `docker ps` to see available containers.',
      required: false,
      aliases: ['container']
    }),
  }

  async run(): Promise<any> {
    this.ensureActiveComposeFile()
    const { flags} = await this.parse(ShellCmd)
    let container = flags.container
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
        const response: any = await prompt([{
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
