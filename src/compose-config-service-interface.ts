import ComposeConfigServiceCeDev from './compose-config-service-ce-dev-interface'
/**
 * Describes a docker compose "service" element.
 */

export default interface ComposeConfigService {
  'container_name'?: string
  'image'?: string
  'volumes'?: Array<string>
  'expose'?: Array<string>
  'ports'?: Array<string>
  'networks'?: object
  'hostname'?: string
  'extra_hosts'?: Array<string>
  'cap_add'?: Array<string>
  'command'?: Array<string>,
  'x-ce_dev'?: ComposeConfigServiceCeDev
}
