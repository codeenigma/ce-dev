import CeDevConfigService from './ce-dev-config-service-interface'
import CeDevProjectConfig from './ce-dev-project-config-interface'
import ComposeConfig from './compose-config-interface'
/**
 * Describes a docker compose structure.
 */

export default interface CeDevConfig extends ComposeConfig {
  'version': string
  'services': Record<string, CeDevConfigService>
  'x-ce_dev': CeDevProjectConfig
  'networks': Record<string, object>,
  'volumes': Record<string, object>
}
