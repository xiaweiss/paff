import * as command from '../command/index'

export const registerCommand = (editor) => {
  editor.command = {}

  for (const key in command) {
    editor.command[key] = (...args) => {
      command[key](args)({editor})
    }
  }

  return editor
}
