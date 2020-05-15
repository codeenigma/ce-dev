import ux from 'cli-ux'

import BaseCmd from '../base-cmd-abstract'

export default class BrowseCmd extends BaseCmd {
  static description = 'Open preset URL(s) in a browser'
  static examples = [
    '$ ce-dev browse',
  ]

  /**
   * @inheritdoc
   */
  async run() {
    this.activeProjectInfo.urls.forEach(async url => {
      await ux.open(url)
    })
  }

}
