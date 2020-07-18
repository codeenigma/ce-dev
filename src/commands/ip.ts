import BaseCmd from '../base-cmd-abstract'
import IPManager from '../ip-manager'
import {flags} from '@oclif/command'

export default class IpCmd extends BaseCmd {
  static description = 'Open a shell session on the given container.'

  static examples = [
    '$ ce-dev shell example-app',
  ]

  static flags = {
    help: flags.help({char: 'h'}),
  }

  async run(): Promise<any> {
    const ipManager = new IPManager('sudo docker', this.config)
    const ip = ipManager.getAvailableIP()
    console.log(ip)
  }
}
