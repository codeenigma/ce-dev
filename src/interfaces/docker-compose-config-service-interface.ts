import DockerComposeConfigServiceCeDevInterface from './docker-compose-config-service-ce-dev-interface.js'
/**
 * Describes a docker compose "service" element.
 */

export default interface DockerComposeConfigServiceInterface {
  'cap_add'?: Array<string>;
  'cgroup'?: 'host' | 'private';
  'command'?: Array<string>;
  'container_name'?: string;
  'expose'?: Array<string>;
  'extra_hosts'?: Array<string>;
  'hostname'?: string;
  'image'?: string;
  'networks'?: object;
  'platform'?: string;
  'ports'?: Array<string>;
  'volumes'?: Array<string>;
  'x-ce_dev'?: DockerComposeConfigServiceCeDevInterface;
}