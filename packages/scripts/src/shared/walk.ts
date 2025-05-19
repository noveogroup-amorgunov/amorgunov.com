import path from 'node:path'
import fs from 'node:fs'

export function walk(dir: string, filter: RegExp, fileList: string[] = []) {
  const files = fs.readdirSync(dir)

  files.forEach((file) => {
    const filePath = path.join(dir, file)
    const fileStat = fs.lstatSync(filePath)

    if (fileStat.isDirectory()) {
      walk(filePath, filter, fileList)
    }
    else if (filter.test(filePath)) {
      fileList.push(filePath)
    }
  })

  return fileList
}
