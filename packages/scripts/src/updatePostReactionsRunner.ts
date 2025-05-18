import path from 'node:path'
import process from 'node:process'
import { updatePostReactions, walk } from './updatePostReactions.ts'

Promise
  .all(walk(path.join(process.cwd(), '../src/posts'), /\.md$/).map(updatePostReactions))
  .then((updatedPosts) => updatedPosts.filter(Boolean).length 
    ? console.log(`Post reactions updated: ${updatedPosts.filter(Boolean).length}`)
    : console.log('No posts to update'))
