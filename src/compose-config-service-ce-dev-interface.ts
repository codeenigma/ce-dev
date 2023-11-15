import ComposeConfigServiceUnisonVolume from './compose-config-service-unison-volume-interface.ts'
/**
 * Describes a docker compose "service" ce-dev element.
 */

export default interface ComposeConfigServiceCeDev {
  'host_aliases': [string] | [];
  'unison': Array<ComposeConfigServiceUnisonVolume>;
}
