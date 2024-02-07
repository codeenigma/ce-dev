import DockerComposeConfigCeDevInterface from './docker-compose-config-ce-dev-interface.js'
import DockerComposeConfigServiceInterface from './docker-compose-config-service-interface.js'

export default interface DockerComposeConfigInterface {
  'networks'?: Record<string, object>
  'services': Record<string, DockerComposeConfigServiceInterface>;
  'version': string
  'volumes'?: Record<string, object>
  'x-ce_dev': DockerComposeConfigCeDevInterface
}
