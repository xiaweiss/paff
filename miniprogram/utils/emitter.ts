import mitt from 'mitt'
import type { Emitter } from 'mitt'


type Events = {
  // todo: audioListUpdate: AudioList,
  'audioPlayIndex': number,
  'closeVersionTip': void,
  'keyboardHeightChange': { height: number },
  'onNoteRefVisited': string,
  'page:touchstart': WechatMiniprogram.TouchEvent,
  'page:touchend': WechatMiniprogram.TouchEvent,
  'page:tap': WechatMiniprogram.TouchEvent,
  'RecorderManager:onDurationUpdate': {duration: number}
  'RecorderManager:onError': any
  'RecorderManager:onFinish': {text: string, tempFilePath: string, duration: number}
  'RecorderManager:onInput': {text: string}
  'windowResize': void
}

/** 事件总线 */
export const emitter: Emitter<Events> = mitt<Events>()
