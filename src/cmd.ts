import { Command } from '@oclif/command'

const { spawnSync } = require('child_process')
const fs = require('fs')
export default abstract class BaseCmd extends Command {
  /**
   * @var 
   * Project root
   */
  protected rootDir: string = process.cwd()
  /**
   * @var
   * Inner ce-dev dir.
   */
  protected ceDevDir: string = ''
  /**
   * @inheritdoc
   */
  public constructor(argv: string[], config: any) {
    super(argv, config)
    this.rootDir = process.cwd()
    let gitRoot = spawnSync('git', ['rev-parse', '--show-toplevel']).stdout.toString().trim()
    if (fs.existsSync(gitRoot) && fs.lstatSync(gitRoot).isDirectory()) {
      this.rootDir = gitRoot
    }
    let ceDevDir = this.rootDir + '/ce-dev'
    if (fs.existsSync(ceDevDir) && fs.lstatSync(ceDevDir).isDirectory()) {
      this.ceDevDir = ceDevDir
    }
  }

  /**
   * Try to "fix" relative paths based on git repo root.
   * @param target Relative (or absolute) path to a file.
   */
  protected getRelativePath(target: string): string {
    const paths = [
      this.rootDir + '/' + target,
      this.ceDevDir + '/' + target,
      process.cwd() + '/' + target,
      target
    ]
    let exists = ''
    paths.forEach((path) => {
      if (fs.existsSync(path.trim())) {
        exists = path.trim()
      }
    })
    return exists
  }

}
