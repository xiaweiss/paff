export const paragraphLine = async (doc, lineWidth, component) => {

  for (const node of doc.content) {
    if (node.type === 'paragraph' && node.content) {
      node.line = []
      /** 总行数 */
      let line = 0

      for (const node1 of node.content) {
        if (node1.type === 'text') {
          node1.width = []

          // todo: split 方法区分 emoji、微信表情
          for (const text of node1.text.split('')) {
            // console.log('measureText')
            const textWidth = await component.measureText(text)
            node1.width.push(textWidth)

            // todo: 处理标点符号

            // 1. 新建一行、换行
            if (line === 0 || (node.line[line - 1].width + textWidth > lineWidth)) {
              line += 1
              node.line.push({
                letterSpacing: 0,
                size: 0,
                width: 0,
                content: []
              })

              // 两端对齐，换行后，计算上一行字间距
              // todo: 英语的情况看看如何处理？
              if (line > 1) {
                const prev = node.line[line - 2]
                prev.letterSpacing = (lineWidth - prev.width) / prev.size
              }
            }

            // 2. 处理行内 content
            const { content } = node.line[line - 1]

            // 首个、不同类 push
            if (content.length === 0) {
              content.push({
                type: 'text',
                text,
                width: [textWidth]
              })

            // 其他 merge
            } else {
              content[content.length - 1].text += text
              content[content.length - 1].width.push(textWidth)
            }

            // 3. 更新 size、width
            node.line[line - 1].size += 1
            node.line[line - 1].width += textWidth
          }
        }
      }
    }
  }

  console.log('doc', doc)

  return doc
}
