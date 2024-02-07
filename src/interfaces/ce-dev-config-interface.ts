import CeDevConfigHostSSH from './ce-dev-config-host-ssh-interface.js'
import CeDevConfigUnisonVolume from './ce-dev-config-unison-volume-interface.js'

export default interface CeDevConfig {
  'deploy': Array<string>;
  'project_name': string;
  'provision': Array<string>;
  'registry': string;
  'ssh_hosts': Array<CeDevConfigHostSSH>;
  'unison': Record<string, Array<CeDevConfigUnisonVolume>>;
  'urls': Array<string>;
  'version': string;
}
