import ComposeConfigCeDev from './compose-config-ce-dev-interface'
/**
 * Describes a docker compose structure.
 */
import ComposeConfigService from './compose-config-service-interface'

export default interface ComposeConfig {
  'version': string;
  'services': Record<string, ComposeConfigService>;
  'networks'?: Record<string, object>;
  'volumes'?: Record<string, object>;
  'x-ce_dev': ComposeConfigCeDev;
}
