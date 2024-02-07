/**
 * Describes our vendor-specific configuration for the compose file.
 */

export default interface DockerComposeConfigCeDevInterface {
  deploy: Array<string>;
  project_name: string;
  provision: Array<string>;
  registry: string;
  ssh_hosts: Array<string>;
  urls: Array<string>;
  version: string;
}
