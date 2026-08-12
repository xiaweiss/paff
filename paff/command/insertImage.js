export const insertImage = ({src}) => ({editor}) => {
  editor.command.insertCustomBlock({type: 'image', src})
}
