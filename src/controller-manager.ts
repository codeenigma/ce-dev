import { Config, ux } from '@oclif/core'
import {execSync} from 'node:child_process'
import fs from 'node:fs'
import fspath from "node:path";

import {AppSettings} from './app-settings.js'
import DockerComposeConfigBare from './interfaces/docker-compose-config-bare-interface.js'
import IPManager from './ip-manager.js'
import YamlParser from './yaml-parser.js'

export default class ControllerManager {
  /**
   * @member
   * Config from oclif.
   */
  private readonly config: Config

  /**
   * @member
   * Compose file path for our controller definition.
   */
  private readonly controllerComposeFile: string

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
   * Compose file path for our network definition.
   */
  private readonly networkComposeFile: string

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
   *
   * @return void
   */
  public controllerStart(): void {
    YamlParser.writeYaml(this.controllerComposeFile, this.getControllerConfig())
    execSync(
      this.dockerComposeBin +
      ' -f ' +
      this.controllerComposeFile +
      ' -p ce_dev_controller up -d --debug',
      {cwd: this.config.dataDir, stdio: 'inherit'},
    )
    // Ensure uid/gid.
    ux.action.start('Ensure user UID match those on the host')
    let uid = 1000
    let gid = 1000
    if (process.getuid) {
      uid = process.getuid()
    }

    if (process.getgid && process.getegid && process.getgid() > 1000) {
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
   *
   * @return void
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
   *
   * @return void
   */
  public generateCertificate(domain: string): void {
    execSync(
      this.dockerBin + ' exec --workdir /home/ce-dev/.local/share/mkcert --user ce-dev ce_dev_controller /usr/local/bin/mkcert ' + domain,
      {stdio: ['ignore', 'ignore', 'pipe']},
    )
  }

  /**
   * Installs CA for mkcerts on the host.
   *
   * @return void
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
   * Check if our network is up and running.
   *
   * @returns
   * True if network exists, else false.
   */
  public networkExists(): boolean {
    const existing = execSync(
      this.dockerBin + ' network ls | grep -w ce_dev | wc -l',
    ).toString().trim();

    if (existing === '0') {
      return false
    }

    return true
  }

  /**
   * Start our network.
   *
   * @return void
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
   * Pull our controller image.
   *
   * @return void
   */
  public pullImage(): void {
    execSync(this.dockerBin + ' pull codeenigma/ce-dev-controller-' + AppSettings.ceDevVersion + '.x:latest', {
      stdio: 'inherit',
    })
  }

  private getControllerConfig(): DockerComposeConfigBare {
    const ipManager = new IPManager(this.config, this.dockerBin)
    return {
      networks: {
        ce_dev: {
          external: true,
          name: 'ce_dev',
        },
      },
      services: {
        ce_dev_controller: {
          cgroup: 'host',
          container_name: 'ce_dev_controller',
          hostname: 'ce_dev_controller',
          image: 'codeenigma/ce-dev-controller-'+ AppSettings.ceDevVersion + '.x:latest',
          networks: {
            ce_dev: {
              ipv4_address: ipManager.getControllerIP(),
            },
          },
          platform: 'linux/amd64',
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
      version: '3.7',
      volumes: {
        ce_dev_apt_cache: {
          name: 'ce_dev_apt_cache',
        },
        ce_dev_composer_cache: {
          name: 'ce_dev_composer_cache',
        },
        ce_dev_mkcert: {
          name: 'ce_dev_mkcert',
        },
        ce_dev_nvm_node: {
          name: 'ce_dev_nvm_node',
        },
        ce_dev_ssh: {
          name: 'ce_dev_ssh',
        },
      },
    }
  }
}
