import fs from 'node:fs'
import path from 'node:path'
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

function getInputPaths(inputPaths: string[]) {
  for (const inputPath of inputPaths) {
    const folderIsExists = fs.existsSync(inputPath)

    if (folderIsExists) {
      return inputPath
    }
  }

  return null
}

const rootInputPath = path.join(
  process.cwd(),
  // FIXME: when we run script from root, we need to go up two levels
  '../..',
  imagesPath.endsWith('/') ? imagesPath : `${imagesPath}/`
)

const inputPath = path.join(
  process.cwd(),
  imagesPath.endsWith('/') ? imagesPath : `${imagesPath}/`
)

const correntInputPath = getInputPaths([rootInputPath, inputPath])

if (!correntInputPath) {
  throw new Error(
    `Nothing to optimize in ${imagesPath}. Try change folder path.
Try open by follow paths:
-  ${rootInputPath}
-  ${inputPath}
    `,
  )
}

optimizeImages(correntInputPath)
  .catch(err => console.error(err))
  .finally(() => process.exit(0))
