import open from "open";

import BaseCmd from '../abstracts/base-cmd-abstract.js'

export default class BrowseCmd extends BaseCmd {
  static description = 'Open preset URL(s) in a browser'

  static examples = [
    '$ ce-dev browse',
  ]

  /**
   * @inheritdoc
   */
  async run(): Promise<void> {
    this.activeProjectInfo.urls.forEach(async url => {
      await open(url)
    })
  }
}
