import ComposeConfigCeDev from './compose-config-ce-dev-interface.ts'
/**
 * Describes a docker compose structure.
 */
import ComposeConfigService from './compose-config-service-interface.ts'

export default interface ComposeConfig {
  'version': string;
  'services': Record<string, ComposeConfigService>;
  'networks'?: Record<string, object>;
  'volumes'?: Record<string, object>;
  'x-ce_dev'?: ComposeConfigCeDev;
}
