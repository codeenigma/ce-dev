import DockerComposeConfigServiceUnisonVolumeInterface from './docker-compose-config-service-unison-volume-interface.js'

/**
 * Describes a docker compose "service" ce-dev element.
 *
 * @param ComposeConfigServiceCeDev
 */
export default interface DockerComposeConfigServiceCeDevInterface {
  'host_aliases': [] | [string];
  'unison': Array<DockerComposeConfigServiceUnisonVolumeInterface>;
}
