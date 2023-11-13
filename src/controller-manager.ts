import ComposeConfigBare from './compose-config-bare-interface'
import IPManager from './ip-manager'
import YamlParser from './yaml-parser'
import {execSync} from 'child_process'
import { Config, ux } from '@oclif/core'

const fs = require('fs')
const fspath = require('path')

export default class ControllerManager {
  /**
   * @member
   * Docker executable path.
   */
  private readonly dockerBin: string = 'docker'

  /**
   * @member
   * Docker compose executable path.
   */
  private readonly dockerComposeBin: string = 'docker compose'

  /**
   * @member
   * Mkcert executable path.
   */
  private readonly mkcertBin: string = 'mkcert'

  /**
   * @member
   * Config from oclif.
   */
  private readonly config: Config

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
    config: Config,
    dockerBin: string,
    dockerComposeBin: string,
    mkcertBin: string,
  ) {
    this.dockerBin = dockerBin
    this.dockerComposeBin = dockerComposeBin
    this.mkcertBin = mkcertBin
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
    const ipManager = new IPManager(this.config, this.dockerBin)
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
    // Ensure uid/gid.
    ux.action.start('Ensure user UID match those on the host')
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
    ux.action.stop()
    // Regenerate SSH keys.
    ux.action.start('Regenerate containers SSH key')
    execSync(
      this.dockerBin + ' exec ce_dev_controller /bin/sh /opt/ce-dev-ssh.sh',
    )
    ux.action.stop()
    // Ensure file perms.
    ux.action.start('Ensure file ownership')
    execSync(
      this.dockerBin + ' exec ce_dev_controller chown -R ce-dev:ce-dev /home/ce-dev',
    )
    ux.action.stop()
    // Ensure CA.
    ux.action.start('Generate/renew CA certificate for SSL')
    execSync(
      this.dockerBin + ' exec --user ce-dev ce_dev_controller /usr/local/bin/mkcert -install',
      {stdio: ['ignore', 'ignore', 'pipe']},
    )
    ux.action.stop()
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
   * Generate an SSL certificate.
   *
   * @param domain
   * Domain/host name.
   */
  public generateCertificate(domain: string): void {
    execSync(
      this.dockerBin + ' exec --workdir /home/ce-dev/.local/share/mkcert --user ce-dev ce_dev_controller /usr/local/bin/mkcert ' + domain,
      {stdio: ['ignore', 'ignore', 'pipe']},
    )
  }

  /**
   * Installs CA for mkcerts on the host.
   */
  public installCertificateAuth(): void {
    const currentCert = fspath.resolve(this.config.cacheDir + '/rootCA.pem')
    const existingCert = fspath.resolve(this.config.dataDir + '/rootCA.pem')
    // Copy new (or possibly new) cert.
    execSync(
      this.dockerBin + ' cp ce_dev_controller:/home/ce-dev/.local/share/mkcert/rootCA.pem ' + currentCert,
    )
    // Check if we have a new certs.
    if (fs.existsSync(existingCert)) {
      const currentCertBuffer = fs.readFileSync(currentCert)
      const existingCertBuffer = fs.readFileSync(existingCert)
      if (currentCertBuffer.equals(existingCertBuffer)) {
        return
      }
    }
    // New/changed certs.
    ux.action.start('Install mkcert CA on the host.')
    fs.renameSync(currentCert, existingCert)
    process.env.CAROOT = this.config.dataDir
    execSync(
      this.mkcertBin + ' -install', {env: process.env},
    )
    ux.action.stop()
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
    const ipManager = new IPManager(this.config, this.dockerBin)
    return {
      version: '3.7',
      services: {
        ce_dev_controller: {
          container_name: 'ce_dev_controller',
          image: 'codeenigma/ce-dev-controller-1.x:latest',
          platform: 'linux/amd64',
          cgroup: 'host',
          hostname: 'ce_dev_controller',
          networks: {
            ce_dev: {
              ipv4_address: ipManager.getControllerIP(),
            },
          },
          volumes: [
            'ce_dev_ssh:/home/ce-dev/.ssh',
            'ce_dev_mkcert:/home/ce-dev/.local/share/mkcert',
            'ce_dev_apt_cache:/var/cache/apt/archives',
            'ce_dev_composer_cache:/home/ce-dev/.composer/cache',
            'ce_dev_nvm_node:/home/ce-dev/.nvm/versions/node',
            '/sys/fs/cgroup:/sys/fs/cgroup:rw',
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
        ce_dev_mkcert: {
          name: 'ce_dev_mkcert',
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
