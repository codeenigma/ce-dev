import path from 'node:path'

export default class RenameDist {
  replace(filePath) {
    const file = path.parse(filePath)
    let base = file.base
    base = base.split("-")
    // Remove the 4 position, where the hash is place.
    base.splice(3, 1)
    const newName = base.join('-')
    return path.join(file.dir, newName)
  }
}
