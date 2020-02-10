import ComposeConfigService from './compose-config-service-interface'
/**
 * Describes a docker compose structure.
 */

export default interface ComposeConfig {
  'version': string
  //@todo this is actually not an array.
  'services': Record<string, ComposeConfigService>
  'x-ce_dev': {
    'registry': string,
    'project_name': string
  }
  'networks': object
}
