import { copyFile, readdir, unlink, writeFile } from 'node:fs/promises'
import path from 'node:path'
import imagemin from 'imagemin'
import imageminMozjpeg from 'imagemin-mozjpeg'
import imageminPngquant from 'imagemin-pngquant'
import lqip from 'lqip'

export async function optimizeImages(inputPath: string) {
  const files = await readdir(inputPath)
  let optimizedCount = 0

  for (const file of files) {
    if (!shouldOptimizeImage(file)) {
      continue
    }

    console.log(`Image ${file} will be optimized`)
    await createImageStub(inputPath, file)
    await compressImage(inputPath, file)

    console.log(`Removing origin image ${file}`)
    await unlink(`${inputPath}${file}`)

    optimizedCount += 1
  }

  if (optimizedCount > 0) {
    console.log('Images were optimize successfully')
  }
  else {
    console.log('Nothing to optimize')
  }
}

export async function createImageStub(inputPath: string, file: string) {
  const [fileName, extension] = file.split('.')

  const raw = await lqip.base64(path.join(`${inputPath}${file}`))
  const base64Data = raw.replace(/^data:image\/(png|gif|jpeg);base64,/, '')
  const outputFilename = path.join(inputPath, `${fileName}.min.${extension}`)

  await writeFile(outputFilename, base64Data, 'base64')
}

export function shouldOptimizeImage(file: string) {
  const [, extension] = file.split('.')

  return (
    file !== 'preview.jpg'
    && /png|jpg|jpeg$/.test(extension)
    && !['min', 'gif', 'out'].includes(extension)
  )
}

export async function compressImage(inputPath, file: string) {
  const [fileName, extension] = file.split('.')
  const outputFilename = `${inputPath}${fileName}.out.${extension}`

  await copyFile(`${inputPath}${file}`, outputFilename)

  await imagemin([outputFilename], {
    destination: inputPath,
    plugins: [
      imageminMozjpeg({
        quality: 90,
      }),
      imageminPngquant({
        quality: [0.6, 0.8],
      }),
    ],
  })
}
