import {Command} from '@oclif/command'
import {execSync} from 'child_process'

import AnsibleInfo from './ansible-info-interface'
import ComposeConfig from './compose-config-interface'
import ComposeConfigService from './compose-config-service-interface'

const {spawnSync} = require('child_process')
const fs = require('fs')
const fspath = require('path')
const yaml = require('js-yaml')

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
  protected ceDevDir = ''
  /**
   * @var
   * Docker executable path.
   */
  protected dockerBin = 'docker'
  /**
   * @var
   * Docker-compose executable path.
   */
  protected dockerComposeBin = 'docker-compose'
  /**
   * @var
   * Path to the active docker-compose.yml file.
   */
  protected activeComposeFilePath = ''
  /**
   * @var
   * Path to the active ansible info file.
   */
  protected activeAnsibleInfoFilePath = ''
  /**
   * @var
   * Docker repository to use.
   */
  protected dockerRepository = 'ce-dev-registry:5000'

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
    if (this.config.platform === 'linux') {
      this.dockerBin = 'sudo docker'
    }
    if (this.config.platform === 'linux') {
      this.dockerComposeBin = 'sudo docker-compose'
    }
    this.activeComposeFilePath = this.ceDevDir + '/docker-compose.yml'
    this.activeAnsibleInfoFilePath = this.ceDevDir + '/.ansible'
  }

  /**
   * Try to "fix" relative paths based on git repo root.
   * @param target Relative (or absolute) path to a file.
   */
  protected getPathFromRelative(target: string): string {
    const paths = [
      target,
      process.cwd() + '/' + target,
      this.rootDir + '/' + target,
      this.ceDevDir + '/' + target
    ]
    let exists = ''
    paths.forEach(path => {
      let absolutePath = fspath.resolve(path.trim())
      if (fs.existsSync(absolutePath)) {
        exists = absolutePath
      }
    })
    return exists
  }

  /**
   * Get path relative to repo root.
   * @param target Absolute path to a file/dir.
   * Note: no check of existence of passed path.
   */
  protected getRelativePath(target: string): string {
    return fspath.relative(this.rootDir, target)
  }

  /**
   * Parse a YAML file.
   * @param file
   * Path to a file to parse
   */
  protected parseYaml(file: string): any {
    if (fs.existsSync(file.trim()) === false) {
      this.error('File ' + file + ' could not be found.')
      this.exit(1)
    }
    try {
      let doc = yaml.safeLoad(fs.readFileSync(file.trim(), 'utf8'))
      return doc
    } catch (e) {
      this.error(e)
      this.exit(1)
    }
    // @todo Convenient but dirty.
    // We are actually cheating here, an we don't always
    // return but exit midway in case of error.
    return {}
  }

  /**
   * Dump structure as YAML to a file.
   * @param file
   * Path to a file to write to
   * @param data
   * Data to write to.
   */
  protected writeYaml(file: string, data: any) {
    if (fs.existsSync(fspath.dirname(file.trim())) === false) {
      this.error('File ' + file + ' could not be found.')
      this.exit(1)
    }
    try {
      let content = yaml.safeDump(data, {lineWidth: 1000})
      fs.writeFileSync(file.trim(), content)
    } catch (e) {
      this.error(e)
      this.exit(1)
    }
  }

  /**
   * Ensure compose config is valid.
   * @param file
   * Path to a file to parse
   */
  protected LoadComposeConfig(file: string): ComposeConfig {
    //@todo Check config is valid.
    let composeConfig = this.parseYaml(file) as ComposeConfig
    return composeConfig
  }

  /**
   * Fetches the service definition for the "controller" from config.
   */
  protected getControllerService(config: ComposeConfig): ComposeConfigService | null {
    for (let service of Object.values(config.services)) {
      if (!service['x-ce_dev'] || !service['x-ce_dev'].role) {
        continue
      }
      if (service['x-ce_dev'].role === 'controller') {
        return service
      }
    }
    return null
  }

  /**
   * Gather project's containers that are actually running.
   */
  protected getProjectRunningContainers(): Array<string> {
    const running: Array<string> = []
    const config: ComposeConfig = this.LoadComposeConfig(this.activeComposeFilePath)
    for (let service of Object.values(config.services)) {
      let status = execSync(this.dockerBin + ' inspect ' + service.container_name + ' --format={{.State.Status}}').toString().trim()
      if (status === 'running') {
        running.push(service.container_name)
      }
    }
    return running
  }
  /**
   * Gather project's containers that are build from ce-dev base image.
   */
  protected getProjectRunningContainersCeDev(): Array<string> {
    const running: Array<string> = this.getProjectRunningContainers()
    const ceDev: Array<string> = []
    running.forEach(containerName => {
      let image = execSync(this.dockerBin + ' inspect ' + containerName + ' --format={{.Config.Image}}').toString().trim()
      let labels = execSync(this.dockerBin + ' inspect ' + image + ' --format={{.Config.Labels}}').toString().trim()
      if (labels.indexOf('ce-dev:') > 0) {
        ceDev.push(containerName)
      }
    })
    return ceDev
  }
  /**
   * Gather project's containers that have an Ansible playbook.
   */
  protected getProjectRunningContainersAnsible(): Array<string> {
    const ansible: Array<string> = []
    if (fs.existsSync(this.activeAnsibleInfoFilePath) === false) {
      return ansible
    }
    const running: Array<string> = this.getProjectRunningContainers()
    const ansibleInfo: Array<AnsibleInfo> = this.parseYaml(this.activeAnsibleInfoFilePath)
    ansibleInfo.forEach(info => {
      if (running.indexOf(info.containerName)) {
        ansible.push(info.containerName)
      }
    })
    return ansible
  }

  /**
   * Check that we have a generated compose file, or exit.
   */
  protected ensureActiveComposeFile() {
    if (fs.existsSync(this.activeComposeFilePath) === false) {
      this.error('No active docker-compose.yml file found. You must generate one first with `ce-dev init`.')
      this.exit(1)
    }
  }
}
