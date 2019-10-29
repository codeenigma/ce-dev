import ComposeConfigService from './compose-config-service-interface'
/**
 * Describes a docker compose structure.
 */

export default interface ComposeConfig {
  'version': string
  'services': Array<ComposeConfigService>
  'x-ce_dev': object
  'networks': object
}
