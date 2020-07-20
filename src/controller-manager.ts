import ComposeConfigBare from './compose-config-bare-interface'
import {IConfig} from '@oclif/config'
import IPManager from './ip-manager'
import YamlParser from './yaml-parser'
import {execSync} from 'child_process'
const fspath = require('path')

export default class ControllerManager {
  /**
   * @member
   * Docker executable path.
   */
  private readonly dockerBin: string = 'docker'

  /**
   * @member
   * Docker-compose executable path.
   */
  private readonly dockerComposeBin: string = 'docker-compose'

  /**
   * @member
   * Config from oclif.
   */
  private readonly config: IConfig

  /**
   * @member
   * Compose file path for our network definition.
   */
  private readonly networkComposeFile: string

  /**
   * @member
   * Compose file path for our controller definition.
   */
  private readonly controllerComposeFile: string

  public constructor(
    dockerBin: string,
    dockerComposeBin: string,
    config: IConfig,
  ) {
    this.dockerBin = dockerBin
    this.dockerComposeBin = dockerComposeBin
    this.config = config
    this.controllerComposeFile = fspath.join(
      this.config.dataDir,
      'docker-compose.controller.yml',
    )
    this.networkComposeFile = fspath.join(
      this.config.dataDir,
      'docker-compose.network.yml',
    )
  }

  /**
   * Check if our network is up and running.
   *
   * @returns
   * True if network exists, else false.
   */
  public networkExists(): boolean {
    const existing = execSync(
      this.dockerBin + ' network ls | grep -w ce_dev | wc -l',
    )
    .toString()
    .trim()
    if (existing === '0') {
      return false
    }
    return true
  }

  /**
   * Start our network.
   */
  public networkStart(): void {
    const ipManager = new IPManager(this.dockerBin, this.config)
    const base = ipManager.getNetBase()
    const gw = base + '.1'
    const subnet = base + '.0/24'
    execSync(this.dockerBin + ' network create ce_dev --attachable --gateway ' + gw + ' --subnet ' + subnet, {
      cwd: this.config.dataDir,
      stdio: 'inherit',
    })
  }

  /**
   * Check if our controller is up and running.
   *
   * @returns
   * Whether controller already exists and is up.
   */
  public controllerExists(): boolean {
    const existing = execSync(
      this.dockerBin + ' ps | grep -w ce_dev_controller | wc -l',
    )
    .toString()
    .trim()
    if (existing === '0') {
      return false
    }
    return true
  }

  /**
   * Start our controller.
   */
  public controllerStart(): void {
    YamlParser.writeYaml(this.controllerComposeFile, this.getControllerConfig())
    execSync(
      this.dockerComposeBin +
        ' -f ' +
        this.controllerComposeFile +
        ' -p ce_dev_controller up -d',
      {cwd: this.config.dataDir, stdio: 'inherit'},
    )
    const uid = process.getuid()
    let gid = 1000
    if (process.getgid() > 1000) {
      gid = process.getegid()
    }
    execSync(
      this.dockerBin +
        ' exec ce_dev_controller /bin/sh /opt/ce-dev-ownership.sh ' +
        uid.toString() +
        ' ' +
        gid.toString(),
      {stdio: 'inherit'},
    )
    execSync(
      this.dockerBin + ' exec ce_dev_controller /bin/sh /opt/ce-dev-ssh.sh',
    )
  }

  /**
   * Stop our controller.
   */
  public controllerStop(): void {
    const existing = execSync(
      this.dockerBin + ' ps | grep -w ce_dev_controller | wc -l',
    )
    .toString()
    .trim()
    if (existing !== '0') {
      execSync(this.dockerBin + ' stop ce_dev_controller')
    }
  }

  /**
   * Pull our controller image.
   */
  public pullImage(): void {
    execSync(this.dockerBin + ' pull codeenigma/ce-dev-controller-1.x:latest', {
      stdio: 'inherit',
    })
  }

  private getControllerConfig(): ComposeConfigBare {
    const ipManager = new IPManager(this.dockerBin, this.config)
    return {
      version: '3.7',
      services: {
        ce_dev_controller: {
          container_name: 'ce_dev_controller',
          image: 'codeenigma/ce-dev-controller-1.x:latest',
          hostname: 'ce_dev_controller',
          networks: {
            ce_dev: {
              ipv4_address: ipManager.getControllerIP(),
            },
          },
          volumes: [
            'ce_dev_ssh:/home/ce-dev/.ssh',
            '/sys/fs/cgroup:/sys/fs/cgroup:ro',
            this.config.cacheDir + ':/home/ce-dev/.ce-dev-cache',
          ],
        },
      },
      networks: {
        ce_dev: {
          external: true,
          name: 'ce_dev',
        },
      },
      volumes: {
        ce_dev_ssh: {
          name: 'ce_dev_ssh',
        },
        ce_dev_apt_cache: {
          name: 'ce_dev_apt_cache',
        },
        ce_dev_composer_cache: {
          name: 'ce_dev_composer_cache',
        },
        ce_dev_nvm_node: {
          name: 'ce_dev_nvm_node',
        },
      },
    }
  }
}
