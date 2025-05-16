import path from 'node:path'
import process from 'node:process'
import { updatePostReactions, walk } from './updatePostReactions.ts'

Promise
  .all(walk(path.join(process.cwd(), '../src/posts'), /\.md$/)
    .map(updatePostReactions)
    .filter(Boolean))
  .then((updatedPosts) => updatedPosts.length 
    ? console.log(`Post reactions updated: ${updatedPosts.length}`)
    : console.log('No posts to update'))
