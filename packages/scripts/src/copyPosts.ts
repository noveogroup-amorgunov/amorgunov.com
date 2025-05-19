import fs from 'node:fs'
import path from 'node:path'
import { walk } from './shared/walk.ts'

export async function copyPosts(targetDir: string, destinationDir: string) {
  const files = walk(targetDir, /\.md$/)

  for (const file of files) {
    const data = fs.readFileSync(file, 'utf-8')
    const slug = file.replace(/.*\/(.*)\.md/i, '$1')

    const nextData = data
      .replaceAll(/(?<!data-)src="\.\.\/images\/(.+).out.png"/g, 'src="/assets/images/$1.min.png"')
      .replaceAll(/src="\.\.\/images\/(.+)"/g, 'src="/assets/images/$1"')
      .replaceAll(/featuredImageThumbnail: "\.\.\/images\/(.+)"/g, 'featuredImageThumbnail: "/assets/images/$1"')

    fs.writeFileSync(path.join(destinationDir, `${slug}.md`), nextData, 'utf-8')
  }
}
