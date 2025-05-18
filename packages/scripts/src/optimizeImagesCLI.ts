import fs from 'node:fs'
import process from 'node:process'
import minimist from 'minimist'
import { optimizeImages } from './optimizeImages.ts'

const argv = minimist(process.argv.slice(2))
const [imagesPath] = argv._

if (!imagesPath) {
  throw new Error(
    'The image folder path is required.\n'
    + 'You should run script like `pnpm optimize-images --path=<image-folder>`.',
  )
}

const inputPath = imagesPath.endsWith('/') ? imagesPath : `${imagesPath}/`
const folderIsExists = fs.existsSync(inputPath)

if (!folderIsExists) {
  throw new Error(
    `Nothing to optimize in ${inputPath}. Try change folder path.`,
  )
}

optimizeImages(inputPath)
  .catch(err => console.error(err))
  .finally(() => process.exit(0))
