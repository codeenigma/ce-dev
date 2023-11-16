import BaseCmd from '../base-cmd-abstract'
//import open from 'open'

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
      await open(url)
    })
  }
}
