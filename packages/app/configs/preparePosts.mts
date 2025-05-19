import path from 'node:path'
import process from 'node:process'
import { copyPosts } from '@amorgunov/scripts/copyPosts'

const [targetDir, destinationDir] = process.argv.slice(2)

copyPosts(
  path.join(process.cwd(), targetDir),
  path.join(process.cwd(), destinationDir),
)
