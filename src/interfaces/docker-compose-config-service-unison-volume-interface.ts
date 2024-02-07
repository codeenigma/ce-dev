/**
 * Describes unison mount element.
 */
export default interface DockerComposeConfigServiceUnisonVolumeInterface {
  'dest': string;
  'ignore': Array<string>;
  'src': string;
  'target_platforms': Array<string>;
}
