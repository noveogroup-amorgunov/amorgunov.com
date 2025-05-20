import process from 'node:process'
import minimist from 'minimist'
import { z } from 'zod'
import { generatePost } from './generatePost.ts'

const CLI_HELP_MESSAGE = `Usage: pnpm generate-post <options>

options:
    --title=<title>  Required post title
    --slug=<slug>    Post slug
    --date=<date>    Post published date in YYYY-MM-DD
`

const argvSchema = z.object({
  title: z.string(),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
})

const argv = minimist(process.argv.slice(2))

if (argv.help || argv.h) {
  console.log(CLI_HELP_MESSAGE)
  process.exit(0)
}

const parsedArgs = argvSchema.parse(argv)

// @ts-expect-error FIXME: title and slug are required, not optional
generatePost(parsedArgs)
  .catch(err => console.error(err))
  .finally(() => process.exit(0))
