import fs from 'node:fs'
import { afterEach, describe, expect, test, vi } from 'vitest'
import { copyPosts } from './copyPosts.js'

describe('copyPosts', () => {
  afterEach(() => {
    vi.resetModules()
  })

  test('should copy post with updating images path', async () => {
    const spy = vi.spyOn(fs, 'writeFileSync')

    spy.mockImplementationOnce(() => 'calling mock function')

    const targetDir = 'src/__tests__/'
    const destinationDir = 'src/__tests__/'

    await copyPosts(targetDir, destinationDir)

    expect(spy).toHaveBeenCalledTimes(1)
    expect(spy).toMatchSnapshot()
  })
})
