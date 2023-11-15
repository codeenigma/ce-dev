import * as fs from 'fs'
import * as fspath from 'path'
import { load, dump } from 'js-yaml';

export default class YamlParser {
  /**
   * Parse a YAML file.
   *
   * @param file
   * Path to a file to parse
   * @param ignoreNonExisting
   * Do not throw an exception if trying to load
   * an non-existing file, but return false instead.
   * @returns
   * Parsed content of the YAML file (or false if empty)
   */
  public static parseYaml(file: string, ignoreNonExisting = false): any {
    if (fs.existsSync(file.trim()) === false) {
      if (ignoreNonExisting) {
        return false
      }
      throw new Error('Could not find file ' + file)
    }
    try {
      return load(fs.readFileSync(file, 'utf-8'))
    } catch (error) {
      throw new Error('Could not read the file ' + file)
    }
  }

  /**
   * Dump structure as YAML to a file.
   *
   * @param file
   * Path to a file to write to
   * @param data
   * Data to write to.
   * @param createNonExistingParentDir
   * Creates the overarching parent dir if it doesn't exist.
   */
  public static writeYaml(file: string, data: any, createNonExistingParentDir = false): void {
    if (fs.existsSync(fspath.dirname(file.trim())) === false) {
      if (createNonExistingParentDir) {
        fs.mkdirSync(fspath.dirname(file.trim()))
      } else {
        throw new Error('Could not find parent directory ' + fspath.dirname(file.trim()))
      }
    }
    try {
      const content = dump(data, {lineWidth: 1000})
      fs.writeFileSync(file.trim(), content)
    } catch (error) {
      throw new Error('Could not write in the directory ' + fspath.dirname(file.trim()))
    }
  }
}
