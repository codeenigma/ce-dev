import { Command, Config, ux } from '@oclif/core'
import {execSync, spawnSync} from 'node:child_process'
import fs from 'node:fs'
import fspath from "node:path";

import {AppSettings} from "../app-settings.js";
import CeDevControllerManager from '../controller-manager.js'
import CeDevConfig from '../interfaces/ce-dev-config-interface.js'
import ComposeConfig from '../interfaces/docker-compose-config-interface.js'
import UserConfig from '../interfaces/user-config-interface.js'
import YamlParser from '../yaml-parser.js'

export default abstract class BaseCmd extends Command {
  /**
   * @member
   * Path to the active docker-compose.yml file.
   */
  protected activeComposeFilePath = ''

  /**
   * @member
   * Project info.
   */
  protected activeProjectInfo: CeDevConfig = {
    deploy: [],
    project_name: 'ce-dev',
    provision: [],
    registry: 'codeenigma',
    ssh_hosts: [],
    unison: {},
    urls: [],
    version: AppSettings.ceDevVersion + '.x',
  }

  /**
   * @member
   * Path to the active ansible info file.
   */
  protected activeProjectInfoFilePath = ''

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
   * Docker repository to use.
   */
  protected dockerRegistry = ''


  /**
   * @member
   * MKCERT executable path.
   */
  protected mkcertBin = 'mkcert'

  /**
   * @member
   * Project root
   */
  protected rootDir: string = process.cwd()

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
    ssh_key: (process.env.HOME as string) + '/.ssh/id_rsa',
    ssh_user: process.env.USER as string,
  }

  /**
   * @member
   * Path to the user config file.
   */
  protected userConfigFilePath = fspath.resolve(
    this.config.configDir + '/preferences-2.x.yml',
  )

  /**
   * @member
   * Docker compose content.
   */
  private readonly controllerManager: CeDevControllerManager

  /**
   * @inheritdoc
   */
  protected constructor(argv: string[], config: Config) {
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
    if (!fs.existsSync(config_path)) {
      fs.mkdirSync(config_path, {recursive: true})
    }

    this.activeProjectInfoFilePath = fspath.resolve(
      config_path + '/project.yml',
    )

    if (fs.existsSync(this.activeProjectInfoFilePath)) {
      this.activeProjectInfo = this.parseYaml(this.activeProjectInfoFilePath) as CeDevConfig
    }

    if (fs.existsSync(this.userConfigFilePath)) {
      this.UserConfig = this.parseYaml(this.userConfigFilePath) as UserConfig
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

  /**
   * Check that we have a generated compose file, or exit.
   *
   * @return void
   */
  protected ensureActiveComposeFile(): void {
    if (fs.existsSync(this.activeComposeFilePath) === false) {
      this.error(
        'No active docker-compose.yml file found. You must generate one first with `ce-dev init`.',
      )
    }
  }

  /**
   * Create private network and starting controller container
   *
   * @return void
   */
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
   * Generate an SSL certificate.
   *
   * @param domain
   * Domain/host name.
   *
   * @return void
   */
  protected generateCertificate(domain: string): void {
    this.controllerManager.generateCertificate(domain)
  }

  /**
   * Try to "fix" relative paths based on git repo root.
   *
   * @param target
   *   Relative (or absolute) path to a file.
   *
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
    for (const path of paths) {
      const absolutePath = fspath.resolve(path.trim())
      if (fs.existsSync(absolutePath)) {
        exists = absolutePath
      }
    }

    return exists
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

      return projectContainers.includes(item)
    })
    return runningContainers
  }

  /**
   * Gather project's containers that are build from ce-dev base image.
   *
   * @returns Array.
   */
  protected getProjectRunningContainersCeDev(): Array<string> {
    const running = this.getProjectRunningContainers();
    const ceDev = [];
    const regex = /^codeenigma\/.*/gm;
    for (const containerName of running) {
      const image = execSync(this.dockerBin +
        ' inspect ' +
        containerName +
        ' --format={{.Config.Image}}')
        .toString()
        .trim();
      if (regex.test(image)) {
        ceDev.push(containerName);
      }
    }
    return ceDev;
  }

  /**
   * Get path relative to repo root.
   * Note: no check of existence of passed path.
   *
   * @param target
   *   Absolute path to a file/dir.
   *
   * @returns string
   */
  protected getRelativePath(target: string): string {
    return fspath.relative(this.rootDir, target)
  }

  /**
   * Installs CA for mkcerts on the host.
   *
   * @return void
   */
  protected installCertificateAuth(): void {
    this.controllerManager.installCertificateAuth()
  }

  /**
   * Ensure compose config is valid.
   *
   * @param file
   *   Path to a file to parse.
   *
   * @return object
   *   Parsed docker compose declaration.
   */
  protected loadComposeConfig(file: string): ComposeConfig {
    // @todo Check config is valid.
    const composeConfig = this.parseYaml(file) as ComposeConfig
    return composeConfig
  }

  /**
   * Parse a YAML file.
   *
   * @param file
   * Path to a file to parse
   *
   * @returns Parsed YAML.
   */
  protected parseYaml(file: string): unknown {
    return YamlParser.parseYaml(file)
  }

  /**
   * Pull controller latest image.
   *
   * @return void
   */
  protected pullControllerContainer(): void {
    this.controllerManager.pullImage()
  }

  protected saveActiveProjectInfo(): void {
    YamlParser.writeYaml(this.activeProjectInfoFilePath, this.activeProjectInfo)
  }

  protected saveUserConfig(): void {
    YamlParser.writeYaml(this.userConfigFilePath, this.UserConfig, true)
  }

  /**
   * Stop the global controller container.
   *
   * @return void
   */
  protected stopControllerContainer(): void {
    ux.action.start('Stopping controller container')
    this.controllerManager.controllerStop()
    ux.action.stop()
  }
}
