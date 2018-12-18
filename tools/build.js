'use strict'

const { $, go, run, fromRoot, getDirFiles } = require('./runner')
const path = require('path')
const fs = require('fs-extra')

const paths = {
  index: 'src/bootstrap/index.html',
  processExplorer: 'src/bootstrap/process-explorer.html',
}

const copy = {
  index: () => {
    $`copying index html`
    return fs.copy(fromRoot(paths.index), fromRoot('build/bootstrap/index.html'))
  },
  processExplorer: () => {
    $`copying process-explorer html`
    return fs.copy(fromRoot(paths.processExplorer), fromRoot('build/bootstrap/process-explorer.html'))
  },
  assets: () => {
    $`copying assets`
    return fs.copy(fromRoot('src/assets'), fromRoot('build/assets'))
  },
  runtime: () => {
    $`copying runtime files`
    return fs.copy(fromRoot('runtime'), fromRoot('build/runtime'))
  },
}

const wtfTypescriptSucks = 'Object.defineProperty(exports, "__esModule", { value: true });'

const unfuckTypescript = async () => {
  $`unfucking typescript exports shit javascript/electron is cancer programming sucks`
  const dirs = await getDirFiles(fromRoot('build'))
  const filesReq = dirs.reduce((files, dir) => {
    return [...files, getDirFiles(dir.path)]
  }, [])

  const dirfiles = await Promise.all(filesReq)
  const files = dirfiles.reduce((files, fileGroup) => {
    return [...files, ...fileGroup.map(f => f.path)]
  }, [])

  const jsFiles = files.filter(f => path.extname(f) === '.js')

  const requests = jsFiles.map(async f => {
    const filedata = await fs.readFile(f, 'utf8')
    const unfucked = filedata.replace(wtfTypescriptSucks, '')
    return fs.writeFile(f, unfucked)
  })

  return Promise.all(requests)
}

require.main === module && go(async () => {
  $`cleaning build folder`
  await fs.emptyDir(fromRoot('build'))

  await run('ttsc -p tsconfig.json')
  await unfuckTypescript()

  await Promise.all([
    copy.index(),
    copy.processExplorer(),
    copy.assets(),
    copy.runtime(),
  ])
})

module.exports = { paths, copy, unfuckTypescript }
