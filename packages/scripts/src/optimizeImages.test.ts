import * as nodeFs from 'node:fs/promises'
import imagemin from 'imagemin'
import { afterEach, describe, expect, test, vi } from 'vitest'
import { compressImage, createImageStub, optimizeImages, shouldOptimizeImage } from './optimizeImages.js'

vi.mock('node:fs/promises', () => ({
  copyFile: vi.fn().mockImplementation(() => ''),
  readdir: vi.fn().mockImplementation(() => ''),
  unlink: vi.fn().mockImplementation(() => ''),
  writeFile: vi.fn().mockImplementation(() => ''),
}))

vi.mock('imagemin', () => ({
  default: vi.fn().mockImplementation(() => ''),
}))

describe('shouldOptimizeImage', () => {
  test('should return true for image files', () => {
    expect(shouldOptimizeImage('image.png')).toBe(true)
  })

  test('should return false for non-image files', () => {
    expect(shouldOptimizeImage('image.txt')).toBe(false)
  })

  test('should return false for preview image', () => {
    expect(shouldOptimizeImage('preview.jpg')).toBe(false)
  })

  test('should return false for gif/processed files', () => {
    expect(shouldOptimizeImage('image.gif')).toBe(false)
    expect(shouldOptimizeImage('image.min.png')).toBe(false)
    expect(shouldOptimizeImage('image.out.png')).toBe(false)
  })
})

describe('createImageStub', () => {
  afterEach(() => {
    vi.resetModules()
  })

  test('should create a stub for an image file', async () => {
    const spy = vi.spyOn(nodeFs, 'writeFile')

    const inputPath = 'src/__tests__/'
    const file = 'image.png'

    await createImageStub(inputPath, file)

    expect(spy).toHaveBeenCalledTimes(1)
    expect(spy).toHaveBeenCalledWith(
      'src/__tests__/image.min.png',
      'iVBORw0KGgoAAAANSUhEUgAAAAoAAAAGCAYAAAD68A/GAAAAAklEQVR4AewaftIAAACzSURBVGXBu07CYACG4fc/lBY0YdB6WByAocTJ6BXo6C24eavehYunASG0WEhoC/0/0pi4+DzmNHtWuasYKCfdvzObv0GzxUt0AlAJrKynl0Rc6JWnu3MepldI/OPxEVYtx/UP34sjRumQTgsIcIDB4I3r4YzjJI4IbSDxno4BAgYhhLDD9IzJ+JKPneOrWPFZlIyub/BxH4k/NktnRMsXinpP3gTW25pN1XB7/0gy6BP4dQDlaEN/nU8YAwAAAABJRU5ErkJggg==',
      'base64',
    )
  })
})

describe('compressImage', () => {
  afterEach(() => {
    vi.resetModules()
  })

  test('should create a stub for an image file', async () => {
    const spy = vi.mocked(imagemin)

    const inputPath = 'src/__tests__/'
    const file = 'image.png'

    await compressImage(inputPath, file)

    expect(spy).toHaveBeenCalledTimes(1)
    expect(spy).toMatchSnapshot()
  })
})

describe('optimizeImages', () => {
  afterEach(() => {
    vi.resetModules()
  })

  test('should optimize images', async () => {
    const spy = vi.spyOn(console, 'log')

    vi.mocked(nodeFs.readdir).mockResolvedValue([
      'image.png',
      'image.min.png',
      'image.out.png',
    ])

    const inputPath = 'src/__tests__/'
    await optimizeImages(inputPath)

    expect(spy).toHaveBeenNthCalledWith(1, 'Image image.png will be optimized')
    expect(spy).toHaveBeenNthCalledWith(2, 'Removing origin image image.png')
    expect(spy).toHaveBeenNthCalledWith(3, 'Images were optimize successfully')
  })

  test('should do nothing if there are no images to optimize', async () => {
    const spy = vi.spyOn(console, 'log')

    vi.mocked(nodeFs.readdir).mockResolvedValue([
      'image.min.png',
      'image.out.png',
    ])

    const inputPath = 'src/__tests__/'
    await optimizeImages(inputPath)

    expect(spy).toHaveBeenNthCalledWith(1, 'Nothing to optimize')
  })
})
