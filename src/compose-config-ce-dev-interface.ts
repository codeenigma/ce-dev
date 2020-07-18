/**
 * Describes our vendor-specific configuration for the compose file.
 */

export default interface ComposeConfigCeDev {
  project_name: string;
  registry: string;
  provision: Array<string>;
  deploy: Array<string>;
  urls: Array<string>;
  ssh_hosts: Array<string>;
  version: string;
}
