/**
 * Describes unison mount element.
 */

export default interface ComposeConfigServiceUnisonVolume {
  'target_platforms': Array<string>;
  'src': string;
  'dest': string;
  'ignore': Array<string>;
}
