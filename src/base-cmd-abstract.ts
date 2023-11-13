import CeDevControllerManager from './controller-manager'
import CeDevProjectConfig from './ce-dev-project-config-interface'
import { Command, ux } from '@oclif/core'
import ComposeConfig from './compose-config-interface'
import UserConfig from './user-config-interface'
import YamlParser from './yaml-parser'
import {execSync} from 'child_process'

const {spawnSync} = require('child_process')
const fs = require('fs')
const fspath = require('path')

export default abstract class BaseCmd extends Command {
  /**
   * @member
   * Project root
   */
  protected rootDir: string = process.cwd()

  /**
   * @member
   * Inner ce-dev dir.
   */
  protected ceDevDir = ''

  /**
   * @member
   * Docker executable path.
   */
  protected dockerBin = 'docker'

  /**
   * @member
   * Docker-compose executable path.
   */
  protected dockerComposeBin = 'docker compose'

  /**
   * @member
   * MKCERT executable path.
   */
  protected mkcertBin = 'mkcert'

  /**
   * @member
   * Path to the active docker-compose.yml file.
   */
  protected activeComposeFilePath = ''

  /**
   * @member
   * Path to the active ansible info file.
   */
  protected activeProjectInfoFilePath = ''

  /**
   * @member
   * Project info.
   */
  protected activeProjectInfo: CeDevProjectConfig = {
    project_name: 'ce-dev',
    registry: 'codeenigma',
    provision: [],
    deploy: [],
    urls: [],
    unison: {},
    ssh_hosts: [],
    version: '1.x',
  }

  /**
   * @member
   * Path to the user config file.
   */
  protected userConfigFilePath = fspath.resolve(
    this.config.configDir + '/preferences-1.x.yml',
  )

  /**
   * @member
   * User preferences.
   */
  protected UserConfig: UserConfig = {
    docker_bin: this.config.platform === 'linux' ? 'sudo docker' : 'docker',
    docker_compose_bin:
      this.config.platform === 'linux' ?
        'sudo docker compose' :
        'docker compose',
    mkcert_bin: 'mkcert',
    ssh_user: process.env.USER as string,
    ssh_key: (process.env.HOME as string) + '/.ssh/id_rsa',
  }

  /**
   * @member
   * Docker repository to use.
   */
  protected dockerRegistry = ''

  /**
   * @member
   * Network range.
   */
  protected network = ''

  /**
   * @member
   * Docker compose content.
   */
  private readonly controllerManager: CeDevControllerManager

  /**
   * @inheritdoc
   */
  public constructor(argv: string[], config: any) {
    super(argv, config)
    const gitRoot = spawnSync('git', ['rev-parse', '--show-toplevel'])
    .stdout.toString()
    .trim()
    if (fs.existsSync(gitRoot) && fs.lstatSync(gitRoot).isDirectory()) {
      this.rootDir = gitRoot
    }
    const ceDevDir = this.rootDir + '/ce-dev'
    if (fs.existsSync(ceDevDir) && fs.lstatSync(ceDevDir).isDirectory()) {
      this.ceDevDir = ceDevDir
    }
    this.activeComposeFilePath = this.ceDevDir + '/docker-compose.yml'
    // Create data dir if needed.
    const config_path = fspath.resolve(this.config.dataDir + '/' + this.rootDir)
    if (fs.existsSync(config_path) === false) {
      fs.mkdirSync(config_path, {recursive: true})
    }
    this.activeProjectInfoFilePath = fspath.resolve(
      config_path + '/project.yml',
    )
    if (fs.existsSync(this.activeProjectInfoFilePath)) {
      this.activeProjectInfo = this.parseYaml(this.activeProjectInfoFilePath)
    }
    if (fs.existsSync(this.activeProjectInfoFilePath)) {
      this.activeProjectInfo = this.parseYaml(this.activeProjectInfoFilePath)
    }
    if (fs.existsSync(this.userConfigFilePath)) {
      this.UserConfig = this.parseYaml(this.userConfigFilePath)
    }
    this.dockerBin = this.UserConfig.docker_bin
    this.dockerComposeBin = this.UserConfig.docker_compose_bin
    this.mkcertBin = this.UserConfig.mkcert_bin
    this.dockerRegistry = this.activeProjectInfo.registry
    this.controllerManager = new CeDevControllerManager(
      this.config,
      this.dockerBin,
      this.dockerComposeBin,
      this.mkcertBin,
    )
    this.ensureController()
  }

  protected ensureController(): void {
    if (this.controllerManager.networkExists() === false) {
      this.log('Creating private network...')
      this.controllerManager.networkStart()
    }
    if (this.controllerManager.controllerExists() === false) {
      this.log('Starting controller container...')
      this.controllerManager.controllerStart()
    }
  }

  /**
   * Stop the global controller container.
   *
   */
  protected stopControllerContainer(): void {
    ux.action.start('Stopping controller container')
    this.controllerManager.controllerStop()
    ux.action.stop()
  }

  /**
   * Generate an SSL certificate.
   *
   * @param domain
   * Domain/host name.
   */
  protected generateCertificate(domain: string): void {
    this.controllerManager.generateCertificate(domain)
  }

  /**
   * Installs CA for mkcerts on the host.
   */
  protected installCertificateAuth(): void {
    this.controllerManager.installCertificateAuth()
  }

  /**
   * Pull controller latest image.
   *
   */
  protected pullControllerContainer(): void {
    this.controllerManager.pullImage()
  }

  /**
   * Try to "fix" relative paths based on git repo root.
   *
   * @param target Relative (or absolute) path to a file.
   * @returns string
   */
  protected getPathFromRelative(target: string): string {
    const paths = [
      target,
      process.cwd() + '/' + target,
      this.rootDir + '/' + target,
      this.ceDevDir + '/' + target,
    ]
    let exists = ''
    paths.forEach(path => {
      const absolutePath = fspath.resolve(path.trim())
      if (fs.existsSync(absolutePath)) {
        exists = absolutePath
      }
    })
    return exists
  }

  protected saveActiveProjectInfo(): void {
    YamlParser.writeYaml(this.activeProjectInfoFilePath, this.activeProjectInfo)
  }

  protected saveUserConfig(): void {
    YamlParser.writeYaml(this.userConfigFilePath, this.UserConfig, true)
  }

  /**
   * Get path relative to repo root.
   * Note: no check of existence of passed path.
   *
   * @param target Absolute path to a file/dir.
   * @returns Path relative to the root of the project.
   */
  protected getRelativePath(target: string): string {
    return fspath.relative(this.rootDir, target)
  }

  /**
   * Ensure compose config is valid.
   *
   * @param file
   * Path to a file to parse
   * @returns Parsed docker compose declaration.
   */
  protected loadComposeConfig(file: string): ComposeConfig {
    // @todo Check config is valid.
    const composeConfig = this.parseYaml(file) as ComposeConfig
    return composeConfig
  }

  /**
   * Gather project's containers that are actually running.
   *
   * @returns Array
   */
  protected getProjectRunningContainers(): Array<string> {
    const config: ComposeConfig = this.loadComposeConfig(
      this.activeComposeFilePath,
    )
    const projectContainers: Array<string> = []
    if (config.services) {
      for (const service of Object.values(config.services)) {
        projectContainers.push(service.container_name as string)
      }
    }
    const running = execSync(this.dockerBin + ' ps --format={{.Names}}').toString()
    const runningContainers = running.split('\n').filter(item => {
      if (item.length === 0) {
        return false
      }
      return projectContainers.indexOf(item) > -1
    })
    return runningContainers
  }

  /**
   * Gather project's containers that are build from ce-dev base image.
   *
   * @returns an array of container names.
   */
  protected getProjectRunningContainersCeDev(): Array<string> {
    const running: Array<string> = this.getProjectRunningContainers()
    const ceDev: Array<string> = []
    running.forEach(containerName => {
      const image = execSync(
        this.dockerBin +
          ' inspect ' +
          containerName +
          ' --format={{.Config.Image}}',
      )
      .toString()
      .trim()
      const labels = execSync(
        this.dockerBin + ' inspect ' + image + ' --format={{.Config.Labels}}',
      )
      .toString()
      .trim()
      if (labels.indexOf('ce-dev-1.x:') > -1) {
        ceDev.push(containerName)
      }
    })
    return ceDev
  }

  /**
   * Check that we have a generated compose file, or exit.
   */
  protected ensureActiveComposeFile(): void {
    if (fs.existsSync(this.activeComposeFilePath) === false) {
      this.error(
        'No active docker-compose.yml file found. You must generate one first with `ce-dev init`.',
      )
    }
  }

  /**
   * Parse a YAML file.
   *
   * @param file
   * Path to a file to parse
   * @returns Parsed YAML.
   */
  protected parseYaml(file: string): any {
    return YamlParser.parseYaml(file)
  }
}
