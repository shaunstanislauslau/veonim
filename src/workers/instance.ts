import { VimMode, HyperspaceCoordinates } from '../neovim/types'
import * as bufferSearch from '../services/buffer-search'
import { call, on } from '../messaging/worker-client'
import getWindowMetadata from '../windows/metadata'
import { GitStatus } from '../support/git'
import * as git from '../support/git'
import nvim from '../neovim/api'
import '../core/ai'
import '../services/mru-buffers'
import '../services/watch-reload'
import '../support/dependency-manager'
// TODO: not used:
// require('../services/job-reader')
// require('../services/dev-recorder')

const actions = new Map<string, (args: any) => void>()
const state = {
  instanceIsActive: true,
}

export const isInstanceActive = () => state.instanceIsActive

nvim.onStateChange(nextState => call.nvimStateUpdate(nextState))
nvim.onVimrcLoad(sourcedFile => call.vimrcLoaded(sourcedFile))
git.onStatus((status: GitStatus) => call.gitStatus(status))
git.onBranch((onBranch: string) => call.gitBranch(onBranch))

on.instanceActiveStatus((instanceIsActive: boolean) => Object.assign(state, { instanceIsActive }))
on.bufferSearch(async (file: string, query: string) => bufferSearch.fuzzy(file, query))
on.bufferSearchVisible(async (query: string) => bufferSearch.fuzzyVisible(query))
on.nvimJumpTo((coords: HyperspaceCoordinates) => nvim.jumpTo(coords))
on.nvimJumpToProjectFile((coords: HyperspaceCoordinates) => nvim.jumpToProjectFile(coords))
on.nvimExpr(async (expr: string) => nvim.expr(expr))
on.nvimFeedkeys((keys: string, mode: string) => nvim.feedkeys(keys, mode))
on.nvimCall(async (name: string, args: any[]) => Reflect.get(nvim.call, name)(...args))
on.nvimCommand(async (command: string) => nvim.cmd(command))
on.nvimGetVar(async (key: string) => Reflect.get(nvim.g, key))
on.setNvimMode((mode: VimMode) => Object.assign(nvim.state, { mode }))
on.getBufferInfo(async () => nvim.buffers.listWithInfo())
on.getGitInfo(async () => git.getGitInfo())
on.getState(async () => ({ ...nvim.state }))
on.getWindowMetadata(async () => getWindowMetadata())
on.nvimSaveCursor(async () => nvim.current.window.cursor)
on.nvimRestoreCursor((position: number[]) => nvim.current.window.setCursor(position[0], position[1]))
on.onAction(async (name: string) => {
  if (!actions.has(name)) actions.set(name, (...a: any[]) => call.actionCalled(name, a))
  const cb = actions.get(name)!
    nvim.onAction(name, cb)
})
