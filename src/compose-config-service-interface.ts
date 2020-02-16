
/**
 * Describes a docker compose "service" element.
 */

export default interface ComposeConfigService {
  'container_name': string
  'image': string
  'x-ce_dev': {
    'host_aliases': [string] | []
  }
  'volumes': Array<string>
  'expose': Array<string>
  'ports': Array<string>
  'networks': object
  'hostname': string
  'extra_hosts': Array<string>
  'cap_add': Array<string>
}
