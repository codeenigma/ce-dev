/**
 * Describes unison mount element.
 */

export default interface UnisonVolume {
  'target_platforms': string,
  'src': string,
  'dest': string,
  'ignore': Array<string>
}
