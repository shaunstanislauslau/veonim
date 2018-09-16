import { InventoryLayerKind } from '../inventory/layers'
import nvim from '../core/neovim'

export interface InventoryAction {
  /** Which layer this action belongs to */
  layer: InventoryLayerKind
  /** Key binding to activate this action */
  keybind: string
  /** Action name. Will be formatted and appended to layer name. Final command value would be :Veonim ${layer}-${command}*/ 
  name: string
  /** User friendly description provided in the UI */
  description: string
  /** Callback will be executed when this action is selected */
  onAction: () => any
  /** Indicate to the user that this action is experimental. Default: FALSE */
  experimental?: boolean
  /** Hide this action from the inventory menu. Otherwise will show up in the inventory search menu. Default: FALSE */ 
  hidden?: boolean
}

const mod = (modulePath: string, func = 'default') => {
  try {
    return require(`../${modulePath}`)[func]
  } catch(e) {
    console.error('trying to call veonim layer action with a bad modulePath. you probably mistyped the module path\n', e)
  }
}

const modc = (modulePath: string, func = 'default') => mod(`components/${modulePath}`, func)
const moda = (modulePath: string, func = 'default') => mod(`ai/${modulePath}`, func)

// TODO: allow actions to be registered as 'hidden'. these will not be displayed
// in the UI as options, but can be found in the fuzzy search menu. useful for
// some less common actions
const actions: InventoryAction[] = [
  {
    layer: InventoryLayerKind.Project,
    keybind: 'f',
    name: 'Files',
    description: 'Find files in project',
    onAction: modc('files'),
  },
  {
    layer: InventoryLayerKind.Project,
    keybind: 's',
    name: 'Spawn Instance',
    description: 'Spawn Neovim instance with project',
    onAction: modc('change-project', 'createInstanceWithDir'),
  },
  {
    layer: InventoryLayerKind.Instance,
    keybind: 'p',
    name: 'Create Project',
    description: 'Create Neovim instance with project',
    onAction: modc('change-project', 'createInstanceWithDir'),
  },
  {
    layer: InventoryLayerKind.Project,
    keybind: 'c',
    name: 'Change',
    description: 'Change project directory',
    onAction: modc('change-project', 'changeDir'),
  },
  {
    layer: InventoryLayerKind.Search,
    keybind: 'v',
    name: 'Viewport',
    description: 'Search visible viewport',
    onAction: modc('viewport-search'),
  },
  {
    layer: InventoryLayerKind.Instance,
    keybind: 's',
    name: 'Switch',
    description: 'Switch to another Neovim instance',
    onAction: modc('vim-switch'),
  },
  {
    layer: InventoryLayerKind.Instance,
    keybind: 'c',
    name: 'Create',
    description: 'Create new Neovim instance',
    onAction: modc('vim-create'),
  },
  {
    layer: InventoryLayerKind.Search,
    keybind: 'r',
    name: 'Resume Find All',
    description: 'Resume previous find all query',
    onAction: modc('grep', 'grepResume'),
  },
  {
    layer: InventoryLayerKind.Search,
    keybind: 'w',
    name: 'Word All Files',
    description: 'Find current word in all files',
    onAction: modc('grep', 'grepWord'),
  },
  {
    layer: InventoryLayerKind.Search,
    keybind: 'f',
    name: 'All Files',
    description: 'Find in all workspace files',
    onAction: modc('grep', 'grep'),
  },
  {
    layer: InventoryLayerKind.Buffer,
    keybind: 'l',
    name: 'List',
    description: 'Switch to buffer from list',
    onAction: modc('buffers'),
  },
  {
    layer: InventoryLayerKind.Jump,
    keybind: 's',
    name: 'Search',
    description: 'Jump to a Vim search result',
    onAction: modc('divination', 'divinationSearch'),
    experimental: true,
},
  {
    layer: InventoryLayerKind.Jump,
    keybind: 'l',
    name: 'Line',
    description: 'Jump to a line',
    onAction: modc('divination', 'divinationLine'),
    experimental: true,
},
]

actions.forEach(action => nvim.registerAction(action))

export default {
  list: () => actions,
  getActionsForLayer: (layerKind: InventoryLayerKind) => actions.filter(m => m.layer === layerKind),
}
