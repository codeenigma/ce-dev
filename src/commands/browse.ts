import BaseCmd from '../base-cmd-abstract'
import ux from 'cli-ux'

export default class BrowseCmd extends BaseCmd {
  static description = 'Open preset URL(s) in a browser'

  static examples = [
    '$ ce-dev browse',
  ]

  /**
   * @inheritdoc
   */
  async run(): Promise<any> {
    this.activeProjectInfo.urls.forEach(async url => {
      await ux.open(url)
    })
  }
}
