import CeDevProjectConfigHostSSH from './ce-dev-project-config-host-ssh-interface.ts'
import CeDevProjectConfigUnisonVolume from './ce-dev-project-config-unison-volume-interface.ts'
export default interface CeDevProjectConfig {
  'project_name': string;
  'registry': string;
  'provision': Array<string>;
  'deploy': Array<string>;
  'urls': Array<string>;
  'unison': Record<string, Array<CeDevProjectConfigUnisonVolume>>;
  'ssh_hosts': Array<CeDevProjectConfigHostSSH>;
  'version': string;
}
