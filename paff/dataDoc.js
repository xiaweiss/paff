export const dataDoc = {
  type: 'doc',
  content: [
    {
      type: 'paragraph',
      content: [
        {
          type: 'text',
          text: '图文笔记'
        }
      ]
    },
    {
      type: 'paragraph'
    },
    {
      type: 'paragraph',
      content: [
        {
          type: 'text',
          text: '文字'
        },
        {
          type: 'text',
          text: '高亮',
          marks: [{type: 'highlight'}]
        },
        {
          type: 'text',
          text: '加粗',
          marks: [{type: 'bold'}]
        }
      ]
    },
    {
      type: 'paragraph',
      content: [
        {
          type: 'text',
          text: '文字同时'
        },
        {
          type: 'text',
          text: '高亮加粗',
          marks: [{type: 'highlight'}, {type: 'bold'}]
        }
      ]
    },
    {
      type: 'image',
      attrs: {
        width: 300,
        height: 300,
        url: 'https://pub-sdn-001.mowen.cn/fe/assets/mowen-note.png'
      }
    },
    {
      type: 'paragraph'
    }
  ]
}
