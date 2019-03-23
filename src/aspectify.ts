#!/usr/bin/env node
import os from 'os'
import path from 'path'
import {stat as statCb, writeFile} from 'fs'
import {promisify} from 'util'
import PQueue from 'p-queue'
import meow from 'meow'
import chalk from 'chalk'
import sharp from 'sharp'

const stat = promisify(statCb)
const write = promisify(writeFile)

function error(message: string, code = 1) {
  console.error(chalk.red(message))
  process.exit(code)
}

function hasFileExt(filename: string) {
  return path.extname(filename || '') !== ''
}

const cli = meow(
  `
    Usage
      $ aspectify <...files>
 
    Options
      -a, --aspect       Aspect ratio to use (eg: 16:9, 16:10, 4:3, 1.77)
      -o, --output       Output filename (default: <filename>.<aspect>.<ext>)
      -r, --replace      Replace the original file
      -c, --concurrency  Maximum number of crops to perform simultaneously
      -v, --verbose      Be verbose about operations performed
 
    Examples
      $ aspectify you.jpg
      $ aspectify -o target.png source.png
      $ aspectify -r replace-me.webp
      $ aspectify 1.jpg 2.jpg 3.jpg
      $ aspectify -c 3 *.jpg
`,
  {
    flags: {
      aspect: {
        type: 'string',
        alias: 'a',
        default: '16:9',
      },
      output: {
        type: 'string',
        alias: 'o',
      },
      replace: {
        type: 'boolean',
        alias: 'r',
        default: false,
      },
      concurrency: {
        type: 'string',
        alias: 'c',
        default: `${os.cpus().length}`,
      },
      verbose: {
        type: 'boolean',
        alias: 'v',
        default: false,
      },
    },
  },
)

const sourceFiles = cli.input
const {replace, aspect, output, concurrency, verbose} = cli.flags

if (isNaN(parseInt(concurrency, 10))) {
  error('Invalid concurrency specified')
}

if (sourceFiles.length === 0) {
  error('No input file specified')
}

if (replace && output) {
  error('`--replace` and `--output` are mutually exclusive')
}

if (sourceFiles.length > 1 && /\.(png|jpg|webp)$/.test(output || '')) {
  error('When specifying multiple files as input, `--output` must be a directory')
}

const queue = new PQueue({concurrency: parseInt(concurrency, 10)})

let printAspect = aspect.trim().replace(/:/g, '-')
let aspectRatio = Number(aspect)
if (/^\s*\d+:\d+\s*$/.test(aspect)) {
  const [width, height] = aspect.trim().split(':')
  aspectRatio = Number(width) / Number(height)
}

if (isNaN(aspectRatio)) {
  error('Invalid aspect ratio specified')
}

for (let fileName of sourceFiles) {
  queue.add(() => processFile(fileName).catch(err => error(`${fileName}: ${err.message}`)))
}

async function processFile(fileName: string) {
  const sourceFilePath = path.resolve(fileName)
  const isDir = (await stat(sourceFilePath)).isDirectory()
  if (isDir) {
    console.warn(`${sourceFilePath} is a directory, skipping`)
    return
  }

  let toDir: string = process.cwd()
  if (sourceFiles.length > 1 || (output && !hasFileExt(output))) {
    toDir = output ? path.resolve(output) : process.cwd()
  } else if (!output) {
    toDir = path.dirname(sourceFilePath)
  }

  const baseName = path.basename(fileName, path.extname(fileName))
  const outName = `${baseName}.${printAspect}${path.extname(fileName)}`
  const outPath = replace ? sourceFilePath : path.join(toDir, outName)

  const image = sharp(sourceFilePath)
  const {width, height} = await image.metadata()
  if (!width || !height) {
    throw new Error('Unable to read width/height')
  }

  let newWidth = width
  let newHeight = height

  const originalAspectRatio = width / height
  if (originalAspectRatio > 0) {
    // Landscape
    newWidth = Math.floor(height * aspectRatio)
  } else {
    // Portrait
    newHeight = Math.floor(width / aspectRatio)
  }

  if (newWidth === width && newHeight === height) {
    console.warn(`${sourceFilePath}: aspect ratio already ${aspect}, skipping`)
    return
  }

  if (verbose) {
    console.log(
      `${fileName} -> ${outPath} [Cropping from %dx%d to %dx%d]`,
      width,
      height,
      newWidth,
      newHeight,
    )
  }

  const cropped = image.resize(newWidth, newHeight, {fit: 'cover'})
  return replace
    ? cropped.toBuffer().then(buffer => write(outPath, buffer))
    : cropped.toFile(outPath)
}
