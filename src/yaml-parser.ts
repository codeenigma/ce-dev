import { dump, load } from 'js-yaml'
import fs from 'node:fs'
import fspath from 'node:path'

export default class YamlParser {
  public static parseYaml(file: string, ignoreNonExisting = false): unknown {
    if (!fs.existsSync(file.trim())) {
      if (ignoreNonExisting) {
        return false
      }

      throw new Error('Could not find file ' + file)
    }

    try {
      return load(fs.readFileSync(file, 'utf8'))
    } catch {
      throw new Error('Could not read the file ' + file)
    }
  }

  public static writeYaml(file: string, data: unknown, createNonExistingParentDir = false): void {
    if (!fs.existsSync(fspath.dirname(file.trim()))) {
      if (createNonExistingParentDir) {
        fs.mkdirSync(fspath.dirname(file.trim()))
      } else {
        throw new Error('Could not find parent directory ' + fspath.dirname(file.trim()))
      }
    }

    try {
      const content = dump(data, {lineWidth: 1000})
      fs.writeFileSync(file.trim(), content)
    } catch {
      throw new Error('Could not write in the directory ' + fspath.dirname(file.trim()))
    }
  }
}
