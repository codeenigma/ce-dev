import UnisonVolumeContainer from './unison-volume-container-interface'

export default interface CeDevProjectConfig {
  'project_name': string,
  'registry': string,
  'provision': Array<string>,
  'deploy': Array<string>,
  'urls': Array<string>
  'unison': Record<string, Array<UnisonVolumeContainer>>
}
