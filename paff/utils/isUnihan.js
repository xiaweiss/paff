/**
 * 判断是否为汉字
 * 只判断了大区，不判断个别的生僻字
 * @see https://zh.wikipedia.org/wiki/中日韓統一表意文字
 */
export const isUnihan = (text) => {
  const c = text.charCodeAt(0)

  const d = (a, b) => {
    return c >= a && c <= b
  }
  const e = (a) => {
    return c === a
  }

  return (
    // 1993 中日韩统一表意文字
    d(0x4E00, 0x9FA5) || e(0x3007) ||
    // 1999 中日韩统一表意文字扩展区A
    d(0x3400, 0x4DBF) ||
    // 2001 中日韩统一表意文字扩展区B
    d(0x20000, 0x2A6D6) ||
    // 2009 中日韩统一表意文字扩展区C
    d(0x2A700, 0x2B734) ||
    // 2010 中日韩统一表意文字扩展区D
    d(0x2B740, 0x2B81D) ||
    // 2015 中日韩统一表意文字扩展区E
    d(0x2B820, 0x2CEA1) ||
    // 2017 中日韩统一表意文字扩展区F
    d(0x2CEB0, 0x2EBE0) ||
    // 2020 中日韩统一表意文字扩展区G
    d(0x30000, 0x3134A) ||
    // 2022 中日韩统一表意文字扩展区H
    d(0x31350, 0x323AF) ||
    // 2023 中日韩统一表意文字扩展区I
    d(0x2EBF0, 0x2EE5F)
  )
}
