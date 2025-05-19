import path from 'node:path'
import process from 'node:process'
import { updatePostReactions } from './updatePostReactions.ts'
import { walk } from './shared/walk.ts'

// TODO: move to env
const CONTENT_POSTS_PATH = '../../app/src/posts'

Promise
  .all(walk(path.join(process.cwd(), CONTENT_POSTS_PATH), /\.md$/).map(updatePostReactions))
  .then((updatedPosts) => updatedPosts.filter(Boolean).length 
    ? console.log(`Post reactions updated: ${updatedPosts.filter(Boolean).length}`)
    : console.log('No posts to update'))
