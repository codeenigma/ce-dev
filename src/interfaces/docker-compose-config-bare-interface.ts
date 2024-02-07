import DockerComposeConfigServiceInterface from './docker-compose-config-service-interface.js'
/**
 * Describes a docker compose structure.
 */

export default interface DockerComposeConfigBareInterface {
  'networks'?: Record<string, object>;
  'services'?: Record<string, DockerComposeConfigServiceInterface>;
  'version': string;
  'volumes'?: Record<string, object>;
}