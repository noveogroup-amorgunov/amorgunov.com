import fs from 'node:fs'
import path from 'node:path'
import axios from 'axios'

// TODO: move to env
const REACTIONS_API_URL_TEMPLATE = 'https://i7on6ck7ng.execute-api.us-east-2.amazonaws.com/dev/posts/{SLUG}/likes'

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

export async function updatePostReactions(file: string) {
  const data = fs.readFileSync(file, 'utf-8')
  const slug = file.replace(/.*src\/posts\/(.*)\.md/i, '$1')

  const response = await axios(REACTIONS_API_URL_TEMPLATE.replace('{SLUG}', slug))
  const reactions = Object.values(response.data as Record<string, number>).reduce((acc, count) => acc + count, 0)

  const currentReactions = Number(data.match(/likes: (\d+)/)?.[1]) ?? 0

  if (reactions === currentReactions) {
    return false
  }

  const next = data.replace(/likes: (\d+)/gi, `likes: ${reactions}`)

  fs.writeFileSync(file, next, 'utf-8')

  console.log(`Update reactions in the post "${slug}" from ${currentReactions} to ${reactions} count`)

  return true
}
