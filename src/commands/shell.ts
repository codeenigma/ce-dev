import {flags} from '@oclif/command'
import {execSync} from 'child_process'
import * as inquirer from 'inquirer'

import BaseCmd from '../base-cmd-abstract'

export default class ShellCmd extends BaseCmd {
  static description = 'Open a shell session on the given container.'
  static examples = [
    '$ ce-dev shell example-app',
  ]
  static flags = {
    help: flags.help({char: 'h'})
  }
  static args = [
    {
      name: 'container',
      required: false,
      description: 'Name of the container to target. Use `docker ps` to see available containers.'
    }
  ]
  async run() {
    this.ensureActiveComposeFile()
    const {args} = this.parse(ShellCmd)
    let container = args.container
    if (!container) {
      const running = this.getProjectRunningContainersCeDev()
      if (running.length < 1) {
        this.warn('No running containers can be targetted. Exiting.')
        this.exit(1)
      }
      let response: any = await inquirer.prompt([{
        name: 'container',
        message: 'Select a container to target',
        type: 'list',
        choices: running,
      }])
      container = response.container
    }
    execSync(this.dockerBin + ' exec -it ' + container + ' su ce-dev', {stdio: 'inherit'})
  }
}
