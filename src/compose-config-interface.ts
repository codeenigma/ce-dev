import ComposeConfigService from './compose-config-service-interface'
import ProjectConfig from './project-config-interface'
/**
 * Describes a docker compose structure.
 */

export default interface ComposeConfig {
  'version': string
  'services': Record<string, ComposeConfigService>
  'x-ce_dev': ProjectConfig
  'networks': Record<string, object>,
  'volumes': Record<string, object>
}
