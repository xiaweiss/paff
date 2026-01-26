import * as command from '../command/index'

export const registerCommand = (editor, paff) => {
  editor.command = {}

  for (const key in command) {
    editor.command[key] = (...args) => {
      command[key](args)({editor, paff})
    }
  }

  return editor
}
