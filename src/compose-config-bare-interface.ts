import ComposeConfigService from './compose-config-service-interface'
/**
 * Describes a docker compose structure.
 */

export default interface ComposeConfigBare {
  'version': string;
  'services'?: Record<string, ComposeConfigService>;
  'networks'?: Record<string, object>;
  'volumes'?: Record<string, object>;
}
