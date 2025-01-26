/**
 * 用于处理 emoji 等特殊字符
 * Split a string into an array of graphemes
 * @see https://github.com/flmnt/graphemer
 *
 * @export {function} graphemeSlice 剪切字符串
 * @export {function} graphemeSplit 将字符串分割为数组
 * @export {function} graphemeCount 计算字符串长度
 */
const CLUSTER_BREAK = {
  CR: 0,
  LF: 1,
  CONTROL: 2,
  EXTEND: 3,
  REGIONAL_INDICATOR: 4,
  SPACINGMARK: 5,
  L: 6,
  V: 7,
  T: 8,
  LV: 9,
  LVT: 10,
  OTHER: 11,
  PREPEND: 12,
  E_BASE: 13,
  E_MODIFIER: 14,
  ZWJ: 15,
  GLUE_AFTER_ZWJ: 16,
  E_BASE_GAZ: 17,
}

const EXTENDED_PICTOGRAPHIC = 101

export function graphemeSlice(str, start, end) {
  return graphemeSplit(str).slice(start, end).join('')
}

export function graphemeSplit(str) {
  const res = []
  let index = 0
  let brk
  while ((brk = nextBreak(str, index)) < str.length) {
    res.push(str.slice(index, brk))
    index = brk
  }
  if (index < str.length) res.push(str.slice(index))
  return res
}

export function graphemeCount(str) {
  let count = 0
  let index = 0
  let brk
  while ((brk = nextBreak(str, index)) < str.length) {
    index = brk
    count++
  }
  if (index < str.length) count++
  return count
}

function isSurrogate(str, pos) {
  return (
    0xd800 <= str.charCodeAt(pos) &&
    str.charCodeAt(pos) <= 0xdbff &&
    0xdc00 <= str.charCodeAt(pos + 1) &&
    str.charCodeAt(pos + 1) <= 0xdfff
  )
}

function shouldBreak (
  start,
  mid,
  end,
  startEmoji,
  midEmoji,
  endEmoji,
) {
  const {
    CR,
    LF,
    CONTROL,
    EXTEND,
    REGIONAL_INDICATOR,
    SPACINGMARK,
    L,
    V,
    T,
    LV,
    LVT,
    PREPEND,
    ZWJ,
  } = CLUSTER_BREAK

  const NotBreak = 0
  const BreakStart = 1
  const Break = 2
  const BreakLastRegional = 3
  const BreakPenultimateRegional = 4

  const all = [start].concat(mid).concat([end])
  const allEmoji = [startEmoji].concat(midEmoji).concat([endEmoji])
  const previous = all[all.length - 2]
  const next = end
  const nextEmoji = endEmoji

  const rIIndex = all.lastIndexOf(REGIONAL_INDICATOR)

  if (
    rIIndex > 0 &&
    all.slice(1, rIIndex).every(function (c) {
      return c === REGIONAL_INDICATOR
    }) &&
    [PREPEND, REGIONAL_INDICATOR].indexOf(previous) === -1
  )
    if (
      all.filter(function (c) {
        return c === REGIONAL_INDICATOR
      }).length % 2 === 1
    )
      return BreakLastRegional
    else
      return BreakPenultimateRegional

  if (previous === CR && next === LF)
    return NotBreak
  else if (
    previous === CONTROL ||
    previous === CR ||
    previous === LF
  )
    return BreakStart
  else if (
    next === CONTROL ||
    next === CR ||
    next === LF
  )
    return BreakStart
  else if (
    previous === L &&
    (next === L ||
      next === V ||
      next === LV ||
      next === LVT)
  )
    return NotBreak
  else if (
    (previous === LV || previous === V) &&
    (next === V || next === T)
  )
    return NotBreak
  else if (
    (previous === LVT || previous === T) &&
    next === T
  )
    return NotBreak
  else if (next === EXTEND || next === ZWJ)
    return NotBreak
  else if (next === SPACINGMARK)
    return NotBreak
  else if (previous === PREPEND)
    return NotBreak

  const previousNonExtendIndex = allEmoji
    .slice(0, -1)
    .lastIndexOf(EXTENDED_PICTOGRAPHIC)

  if (
    previousNonExtendIndex !== -1 &&
    allEmoji[previousNonExtendIndex] === EXTENDED_PICTOGRAPHIC &&
    all.slice(previousNonExtendIndex + 1, -2).every(function (c) {
      return c === EXTEND
    }) &&
    previous === ZWJ &&
    nextEmoji === EXTENDED_PICTOGRAPHIC
  )
    return NotBreak

  if (mid.indexOf(REGIONAL_INDICATOR) !== -1) {
    return Break
  }

  if (
    previous === REGIONAL_INDICATOR &&
    next === REGIONAL_INDICATOR
  )
    return NotBreak

  return BreakStart
}

/**
 * Returns the next grapheme break in the string after the given index
 * @param string {string}
 * @param index {number}
 * @returns {number}
 */
function nextBreak(string, index) {
  if (index === undefined) {
    index = 0
  }
  if (index < 0) {
    return 0
  }
  if (index >= string.length - 1) {
    return string.length
  }
  const prevCP = string.codePointAt(index) || 0
  const prev = getGraphemeBreakProperty(prevCP)
  const prevEmoji = getEmojiProperty(prevCP)
  const mid = []
  const midEmoji = []
  for (let i = index + 1; i < string.length; i++) {

    if (isSurrogate(string, i - 1)) {
      continue
    }

    const nextCP = string.codePointAt(i) || 0
    const next = getGraphemeBreakProperty(nextCP)
    const nextEmoji = getEmojiProperty(nextCP)
    if (
      shouldBreak(
        prev,
        mid,
        next,
        prevEmoji,
        midEmoji,
        nextEmoji,
      )
    ) {
      return i;
    }

    mid.push(next)
    midEmoji.push(nextEmoji)
  }
  return string.length
}

/**
 * Given a Unicode code point, determines this symbol's grapheme break property
 * @param code {number} Unicode code point
 * @returns {number}
 */
function getGraphemeBreakProperty (code) {
  const c = code
  const {
    CR,
    LF,
    CONTROL: C,
    EXTEND: E,
    REGIONAL_INDICATOR: R,
    SPACINGMARK: S,
    L,
    V,
    T,
    LV,
    LVT,
    OTHER,
    PREPEND: P,
    ZWJ,
  } = CLUSTER_BREAK

  function i (a, b) {
    return a <= c && c <= b
  }

  if (c < 0xbf09) {
    if (c < 0xac54) {
      if (c < 0x102d) {
        if (c < 0xb02) {
          if (c < 0x93b) {
            if (c < 0x6df) {
              if (c < 0x5bf) {
                if (c < 0x7f) {
                  if (c < 0xb) {
                    if (c < 0xa && i(0x0, 0x9)) return C
                    else if (0xa === c) return LF
                  } else {
                    if (c < 0xd && i(0xb, 0xc)) return C
                    else if (c < 0xe && 0xd === c) return CR
                    else if (i(0xe, 0x1f)) return C
                  }
                } else {
                  if (c < 0x300) {
                    if (c < 0xad && i(0x7f, 0x9f)) return C
                    else if (0xad === c) return C
                  } else {
                    if (c < 0x483 && i(0x300, 0x36f)) return E
                    else if (c < 0x591 && i(0x483, 0x489)) return E
                    else if (i(0x591, 0x5bd)) return E
                  }
                }
              } else {
                if (c < 0x610) {
                  if (c < 0x5c4) {
                    if (c < 0x5c1 && 0x5bf === c) return E
                    else if (i(0x5c1, 0x5c2)) return E
                  } else {
                    if (c < 0x5c7 && i(0x5c4, 0x5c5)) return E
                    else if (c < 0x600 && 0x5c7 === c) return E
                    else if (i(0x600, 0x605)) return P
                  }
                } else {
                  if (c < 0x670) {
                    if (c < 0x61c && i(0x610, 0x61a)) return E
                    else if (c < 0x64b && 0x61c === c) return C
                    else if (i(0x64b, 0x65f)) return E
                  } else {
                    if (c < 0x6d6 && 0x670 === c) return E
                    else if (c < 0x6dd && i(0x6d6, 0x6dc)) return E
                    else if (0x6dd === c) return P
                  }
                }
              }
            } else {
              if (c < 0x81b) {
                if (c < 0x730) {
                  if (c < 0x6ea) {
                    if (c < 0x6e7 && i(0x6df, 0x6e4)) return E
                    else if (i(0x6e7, 0x6e8)) return E
                  } else {
                    if (c < 0x70f && i(0x6ea, 0x6ed)) return E
                    else if (0x70f === c) return P
                    else if (0x711 === c) return E
                  }
                } else {
                  if (c < 0x7eb) {
                    if (c < 0x7a6 && i(0x730, 0x74a)) return E
                    else if (i(0x7a6, 0x7b0)) return E
                  } else {
                    if (c < 0x7fd && i(0x7eb, 0x7f3)) return E
                    else if (c < 0x816 && 0x7fd === c) return E
                    else if (i(0x816, 0x819)) return E
                  }
                }
              } else {
                if (c < 0x898) {
                  if (c < 0x829) {
                    if (c < 0x825 && i(0x81b, 0x823)) return E
                    else if (i(0x825, 0x827)) return E
                  } else {
                    if (c < 0x859 && i(0x829, 0x82d)) return E
                    else if (c < 0x890 && i(0x859, 0x85b)) return E
                    else if (i(0x890, 0x891)) return P
                  }
                } else {
                  if (c < 0x8e3) {
                    if (c < 0x8ca && i(0x898, 0x89f)) return E
                    else if (c < 0x8e2 && i(0x8ca, 0x8e1)) return E
                    else if (0x8e2 === c) return P
                  } else {
                    if (c < 0x903 && i(0x8e3, 0x902)) return E
                    else if (0x903 === c) return S
                    else if (0x93a === c) return E
                  }
                }
              }
            }
          } else {
            if (c < 0xa01) {
              if (c < 0x982) {
                if (c < 0x94d) {
                  if (c < 0x93e) {
                    if (0x93b === c) return S
                    if (0x93c === c) return E
                  } else {
                    if (c < 0x941 && i(0x93e, 0x940)) return S
                    else if (c < 0x949 && i(0x941, 0x948)) return E
                    else if (i(0x949, 0x94c)) return S
                  }
                } else {
                  if (c < 0x951) {
                    if (c < 0x94e && 0x94d === c) return E
                    else if (i(0x94e, 0x94f)) return S
                  } else {
                    if (c < 0x962 && i(0x951, 0x957)) return E
                    else if (c < 0x981 && i(0x962, 0x963)) return E
                    else if (0x981 === c) return E
                  }
                }
              } else {
                if (c < 0x9c7) {
                  if (c < 0x9be) {
                    if (c < 0x9bc && i(0x982, 0x983)) return S
                    else if (0x9bc === c) return E
                  } else {
                    if (c < 0x9bf && 0x9be === c) return E
                    else if (c < 0x9c1 && i(0x9bf, 0x9c0)) return S
                    else if (i(0x9c1, 0x9c4)) return E
                  }
                } else {
                  if (c < 0x9d7) {
                    if (c < 0x9cb && i(0x9c7, 0x9c8)) return S
                    else if (c < 0x9cd && i(0x9cb, 0x9cc)) return S
                    else if (0x9cd === c) return E
                  } else {
                    if (c < 0x9e2 && 0x9d7 === c) return E
                    else if (c < 0x9fe && i(0x9e2, 0x9e3)) return E
                    else if (0x9fe === c) return E
                  }
                }
              }
            } else {
              if (c < 0xa83) {
                if (c < 0xa47) {
                  if (c < 0xa3c) {
                    if (c < 0xa03 && i(0xa01, 0xa02)) return E
                    else if (0xa03 === c) return S
                  } else {
                    if (c < 0xa3e && 0xa3c === c) return E
                    else if (c < 0xa41 && i(0xa3e, 0xa40)) return S
                    else if (i(0xa41, 0xa42)) return E
                  }
                } else {
                  if (c < 0xa70) {
                    if (c < 0xa4b && i(0xa47, 0xa48)) return E
                    else if (c < 0xa51 && i(0xa4b, 0xa4d)) return E
                    else if (0xa51 === c) return E
                  } else {
                    if (c < 0xa75 && i(0xa70, 0xa71)) return E
                    else if (c < 0xa81 && 0xa75 === c) return E
                    else if (i(0xa81, 0xa82)) return E
                  }
                }
              } else {
                if (c < 0xac9) {
                  if (c < 0xabe) {
                    if (0xa83 === c) return S
                    if (0xabc === c) return E
                  } else {
                    if (c < 0xac1 && i(0xabe, 0xac0)) return S
                    else if (c < 0xac7 && i(0xac1, 0xac5)) return E
                    else if (i(0xac7, 0xac8)) return E
                  }
                } else {
                  if (c < 0xae2) {
                    if (c < 0xacb && 0xac9 === c) return S
                    else if (c < 0xacd && i(0xacb, 0xacc)) return S
                    else if (0xacd === c) return E
                  } else {
                    if (c < 0xafa && i(0xae2, 0xae3)) return E
                    else if (c < 0xb01 && i(0xafa, 0xaff)) return E
                    else if (0xb01 === c) return E
                  }
                }
              }
            }
          }
        } else {
          if (c < 0xcf3) {
            if (c < 0xc04) {
              if (c < 0xb82) {
                if (c < 0xb47) {
                  if (c < 0xb3e) {
                    if (c < 0xb3c && i(0xb02, 0xb03)) return S
                    else if (0xb3c === c) return E
                  } else {
                    if (c < 0xb40 && i(0xb3e, 0xb3f)) return E
                    else if (c < 0xb41 && 0xb40 === c) return S
                    else if (i(0xb41, 0xb44)) return E
                  }
                } else {
                  if (c < 0xb4d) {
                    if (c < 0xb4b && i(0xb47, 0xb48)) return S
                    else if (i(0xb4b, 0xb4c)) return S
                  } else {
                    if (c < 0xb55 && 0xb4d === c) return E
                    else if (c < 0xb62 && i(0xb55, 0xb57)) return E
                    else if (i(0xb62, 0xb63)) return E
                  }
                }
              } else {
                if (c < 0xbc6) {
                  if (c < 0xbbf) {
                    if (0xb82 === c) return E
                    if (0xbbe === c) return E
                  } else {
                    if (c < 0xbc0 && 0xbbf === c) return S
                    else if (c < 0xbc1 && 0xbc0 === c) return E
                    else if (i(0xbc1, 0xbc2)) return S
                  }
                } else {
                  if (c < 0xbd7) {
                    if (c < 0xbca && i(0xbc6, 0xbc8)) return S
                    else if (c < 0xbcd && i(0xbca, 0xbcc)) return S
                    else if (0xbcd === c) return E
                  } else {
                    if (c < 0xc00 && 0xbd7 === c) return E
                    else if (c < 0xc01 && 0xc00 === c) return E
                    else if (i(0xc01, 0xc03)) return S
                  }
                }
              }
            } else {
              if (c < 0xcbe) {
                if (c < 0xc4a) {
                  if (c < 0xc3e) {
                    if (0xc04 === c) return E
                    if (0xc3c === c) return E
                  } else {
                    if (c < 0xc41 && i(0xc3e, 0xc40)) return E
                    else if (c < 0xc46 && i(0xc41, 0xc44)) return S
                    else if (i(0xc46, 0xc48)) return E
                  }
                } else {
                  if (c < 0xc81) {
                    if (c < 0xc55 && i(0xc4a, 0xc4d)) return E
                    else if (c < 0xc62 && i(0xc55, 0xc56)) return E
                    else if (i(0xc62, 0xc63)) return E
                  } else {
                    if (c < 0xc82 && 0xc81 === c) return E
                    else if (c < 0xcbc && i(0xc82, 0xc83)) return S
                    else if (0xcbc === c) return E
                  }
                }
              } else {
                if (c < 0xcc6) {
                  if (c < 0xcc0) {
                    if (0xcbe === c) return S
                    if (0xcbf === c) return E
                  } else {
                    if (c < 0xcc2 && i(0xcc0, 0xcc1)) return S
                    else if (c < 0xcc3 && 0xcc2 === c) return E
                    else if (i(0xcc3, 0xcc4)) return S
                  }
                } else {
                  if (c < 0xccc) {
                    if (c < 0xcc7 && 0xcc6 === c) return E
                    else if (c < 0xcca && i(0xcc7, 0xcc8)) return S
                    else if (i(0xcca, 0xccb)) return S
                  } else {
                    if (c < 0xcd5 && i(0xccc, 0xccd)) return E
                    else if (c < 0xce2 && i(0xcd5, 0xcd6)) return E
                    else if (i(0xce2, 0xce3)) return E
                  }
                }
              }
            }
          } else {
            if (c < 0xddf) {
              if (c < 0xd4e) {
                if (c < 0xd3f) {
                  if (c < 0xd02) {
                    if (c < 0xd00 && 0xcf3 === c) return S
                    else if (i(0xd00, 0xd01)) return E
                  } else {
                    if (c < 0xd3b && i(0xd02, 0xd03)) return S
                    else if (c < 0xd3e && i(0xd3b, 0xd3c)) return E
                    else if (0xd3e === c) return E
                  }
                } else {
                  if (c < 0xd46) {
                    if (c < 0xd41 && i(0xd3f, 0xd40)) return S
                    else if (i(0xd41, 0xd44)) return E
                  } else {
                    if (c < 0xd4a && i(0xd46, 0xd48)) return S
                    else if (c < 0xd4d && i(0xd4a, 0xd4c)) return S
                    else if (0xd4d === c) return E
                  }
                }
              } else {
                if (c < 0xdca) {
                  if (c < 0xd62) {
                    if (0xd4e === c) return P
                    if (0xd57 === c) return E
                  } else {
                    if (c < 0xd81 && i(0xd62, 0xd63)) return E
                    else if (c < 0xd82 && 0xd81 === c) return E
                    else if (i(0xd82, 0xd83)) return S
                  }
                } else {
                  if (c < 0xdd2) {
                    if (c < 0xdcf && 0xdca === c) return E
                    else if (c < 0xdd0 && 0xdcf === c) return E
                    else if (i(0xdd0, 0xdd1)) return S
                  } else {
                    if (c < 0xdd6 && i(0xdd2, 0xdd4)) return E
                    else if (c < 0xdd8 && 0xdd6 === c) return E
                    else if (i(0xdd8, 0xdde)) return S
                  }
                }
              }
            } else {
              if (c < 0xf35) {
                if (c < 0xe47) {
                  if (c < 0xe31) {
                    if (c < 0xdf2 && 0xddf === c) return E
                    else if (i(0xdf2, 0xdf3)) return S
                  } else {
                    if (c < 0xe33 && 0xe31 === c) return E
                    else if (c < 0xe34 && 0xe33 === c) return S
                    else if (i(0xe34, 0xe3a)) return E
                  }
                } else {
                  if (c < 0xeb4) {
                    if (c < 0xeb1 && i(0xe47, 0xe4e)) return E
                    else if (0xeb1 === c) return E
                    else if (0xeb3 === c) return S
                  } else {
                    if (c < 0xec8 && i(0xeb4, 0xebc)) return E
                    else if (c < 0xf18 && i(0xec8, 0xece)) return E
                    else if (i(0xf18, 0xf19)) return E
                  }
                }
              } else {
                if (c < 0xf7f) {
                  if (c < 0xf39) {
                    if (0xf35 === c) return E
                    if (0xf37 === c) return E
                  } else {
                    if (c < 0xf3e && 0xf39 === c) return E
                    else if (c < 0xf71 && i(0xf3e, 0xf3f)) return S
                    else if (i(0xf71, 0xf7e)) return E
                  }
                } else {
                  if (c < 0xf8d) {
                    if (c < 0xf80 && 0xf7f === c) return S
                    else if (c < 0xf86 && i(0xf80, 0xf84)) return E
                    else if (i(0xf86, 0xf87)) return E
                  } else {
                    if (c < 0xf99 && i(0xf8d, 0xf97)) return E
                    else if (c < 0xfc6 && i(0xf99, 0xfbc)) return E
                    else if (0xfc6 === c) return E
                  }
                }
              }
            }
          }
        }
      } else {
        if (c < 0x1c24) {
          if (c < 0x1930) {
            if (c < 0x1732) {
              if (c < 0x1082) {
                if (c < 0x103d) {
                  if (c < 0x1032) {
                    if (c < 0x1031 && i(0x102d, 0x1030)) return E
                    else if (0x1031 === c) return S
                  } else {
                    if (c < 0x1039 && i(0x1032, 0x1037)) return E
                    else if (c < 0x103b && i(0x1039, 0x103a)) return E
                    else if (i(0x103b, 0x103c)) return S
                  }
                } else {
                  if (c < 0x1058) {
                    if (c < 0x1056 && i(0x103d, 0x103e)) return E
                    else if (i(0x1056, 0x1057)) return S
                  } else {
                    if (c < 0x105e && i(0x1058, 0x1059)) return E
                    else if (c < 0x1071 && i(0x105e, 0x1060)) return E
                    else if (i(0x1071, 0x1074)) return E
                  }
                }
              } else {
                if (c < 0x1100) {
                  if (c < 0x1085) {
                    if (0x1082 === c) return E
                    if (0x1084 === c) return S
                  } else {
                    if (c < 0x108d && i(0x1085, 0x1086)) return E
                    else if (0x108d === c) return E
                    else if (0x109d === c) return E
                  }
                } else {
                  if (c < 0x135d) {
                    if (c < 0x1160 && i(0x1100, 0x115f)) return L
                    else if (c < 0x11a8 && i(0x1160, 0x11a7)) return V
                    else if (i(0x11a8, 0x11ff)) return T
                  } else {
                    if (c < 0x1712 && i(0x135d, 0x135f)) return E
                    else if (c < 0x1715 && i(0x1712, 0x1714)) return E
                    else if (0x1715 === c) return S
                  }
                }
              }
            } else {
              if (c < 0x17c9) {
                if (c < 0x17b6) {
                  if (c < 0x1752) {
                    if (c < 0x1734 && i(0x1732, 0x1733)) return E
                    else if (0x1734 === c) return S
                  } else {
                    if (c < 0x1772 && i(0x1752, 0x1753)) return E
                    else if (c < 0x17b4 && i(0x1772, 0x1773)) return E
                    else if (i(0x17b4, 0x17b5)) return E
                  }
                } else {
                  if (c < 0x17be) {
                    if (c < 0x17b7 && 0x17b6 === c) return S
                    else if (i(0x17b7, 0x17bd)) return E
                  } else {
                    if (c < 0x17c6 && i(0x17be, 0x17c5)) return S
                    else if (c < 0x17c7 && 0x17c6 === c) return E
                    else if (i(0x17c7, 0x17c8)) return S
                  }
                }
              } else {
                if (c < 0x1885) {
                  if (c < 0x180b) {
                    if (c < 0x17dd && i(0x17c9, 0x17d3)) return E
                    else if (0x17dd === c) return E
                  } else {
                    if (c < 0x180e && i(0x180b, 0x180d)) return E
                    else if (0x180e === c) return C
                    else if (0x180f === c) return E
                  }
                } else {
                  if (c < 0x1923) {
                    if (c < 0x18a9 && i(0x1885, 0x1886)) return E
                    else if (c < 0x1920 && 0x18a9 === c) return E
                    else if (i(0x1920, 0x1922)) return E
                  } else {
                    if (c < 0x1927 && i(0x1923, 0x1926)) return S
                    else if (c < 0x1929 && i(0x1927, 0x1928)) return E
                    else if (i(0x1929, 0x192b)) return S
                  }
                }
              }
            }
          } else {
            if (c < 0x1b3b) {
              if (c < 0x1a58) {
                if (c < 0x1a19) {
                  if (c < 0x1933) {
                    if (c < 0x1932 && i(0x1930, 0x1931)) return S
                    else if (0x1932 === c) return E
                  } else {
                    if (c < 0x1939 && i(0x1933, 0x1938)) return S
                    else if (c < 0x1a17 && i(0x1939, 0x193b)) return E
                    else if (i(0x1a17, 0x1a18)) return E
                  }
                } else {
                  if (c < 0x1a55) {
                    if (c < 0x1a1b && i(0x1a19, 0x1a1a)) return S
                    else if (0x1a1b === c) return E
                  } else {
                    if (c < 0x1a56 && 0x1a55 === c) return S
                    else if (0x1a56 === c) return E
                    else if (0x1a57 === c) return S
                  }
                }
              } else {
                if (c < 0x1a73) {
                  if (c < 0x1a62) {
                    if (c < 0x1a60 && i(0x1a58, 0x1a5e)) return E
                    else if (0x1a60 === c) return E
                  } else {
                    if (c < 0x1a65 && 0x1a62 === c) return E
                    else if (c < 0x1a6d && i(0x1a65, 0x1a6c)) return E
                    else if (i(0x1a6d, 0x1a72)) return S
                  }
                } else {
                  if (c < 0x1b00) {
                    if (c < 0x1a7f && i(0x1a73, 0x1a7c)) return E
                    else if (c < 0x1ab0 && 0x1a7f === c) return E
                    else if (i(0x1ab0, 0x1ace)) return E
                  } else {
                    if (c < 0x1b04 && i(0x1b00, 0x1b03)) return E
                    else if (c < 0x1b34 && 0x1b04 === c) return S
                    else if (i(0x1b34, 0x1b3a)) return E
                  }
                }
              }
            } else {
              if (c < 0x1ba8) {
                if (c < 0x1b6b) {
                  if (c < 0x1b3d) {
                    if (0x1b3b === c) return S
                    if (0x1b3c === c) return E
                  } else {
                    if (c < 0x1b42 && i(0x1b3d, 0x1b41)) return S
                    else if (c < 0x1b43 && 0x1b42 === c) return E
                    else if (i(0x1b43, 0x1b44)) return S
                  }
                } else {
                  if (c < 0x1ba1) {
                    if (c < 0x1b80 && i(0x1b6b, 0x1b73)) return E
                    else if (c < 0x1b82 && i(0x1b80, 0x1b81)) return E
                    else if (0x1b82 === c) return S
                  } else {
                    if (c < 0x1ba2 && 0x1ba1 === c) return S
                    else if (c < 0x1ba6 && i(0x1ba2, 0x1ba5)) return E
                    else if (i(0x1ba6, 0x1ba7)) return S
                  }
                }
              } else {
                if (c < 0x1be8) {
                  if (c < 0x1bab) {
                    if (c < 0x1baa && i(0x1ba8, 0x1ba9)) return E
                    else if (0x1baa === c) return S
                  } else {
                    if (c < 0x1be6 && i(0x1bab, 0x1bad)) return E
                    else if (0x1be6 === c) return E
                    else if (0x1be7 === c) return S
                  }
                } else {
                  if (c < 0x1bee) {
                    if (c < 0x1bea && i(0x1be8, 0x1be9)) return E
                    else if (c < 0x1bed && i(0x1bea, 0x1bec)) return S
                    else if (0x1bed === c) return E
                  } else {
                    if (c < 0x1bef && 0x1bee === c) return S
                    else if (c < 0x1bf2 && i(0x1bef, 0x1bf1)) return E
                    else if (i(0x1bf2, 0x1bf3)) return S
                  }
                }
              }
            }
          }
        } else {
          if (c < 0xa952) {
            if (c < 0x2d7f) {
              if (c < 0x1cf7) {
                if (c < 0x1cd4) {
                  if (c < 0x1c34) {
                    if (c < 0x1c2c && i(0x1c24, 0x1c2b)) return S
                    else if (i(0x1c2c, 0x1c33)) return E
                  } else {
                    if (c < 0x1c36 && i(0x1c34, 0x1c35)) return S
                    else if (c < 0x1cd0 && i(0x1c36, 0x1c37)) return E
                    else if (i(0x1cd0, 0x1cd2)) return E
                  }
                } else {
                  if (c < 0x1ce2) {
                    if (c < 0x1ce1 && i(0x1cd4, 0x1ce0)) return E
                    else if (0x1ce1 === c) return S
                  } else {
                    if (c < 0x1ced && i(0x1ce2, 0x1ce8)) return E
                    else if (0x1ced === c) return E
                    else if (0x1cf4 === c) return E
                  }
                }
              } else {
                if (c < 0x200d) {
                  if (c < 0x1dc0) {
                    if (c < 0x1cf8 && 0x1cf7 === c) return S
                    else if (i(0x1cf8, 0x1cf9)) return E
                  } else {
                    if (c < 0x200b && i(0x1dc0, 0x1dff)) return E
                    else if (0x200b === c) return C
                    else if (0x200c === c) return E
                  }
                } else {
                  if (c < 0x2060) {
                    if (c < 0x200e && 0x200d === c) return ZWJ
                    else if (c < 0x2028 && i(0x200e, 0x200f)) return C
                    else if (i(0x2028, 0x202e)) return C
                  } else {
                    if (c < 0x20d0 && i(0x2060, 0x206f)) return C
                    else if (c < 0x2cef && i(0x20d0, 0x20f0)) return E
                    else if (i(0x2cef, 0x2cf1)) return E
                  }
                }
              }
            } else {
              if (c < 0xa823) {
                if (c < 0xa674) {
                  if (c < 0x302a) {
                    if (c < 0x2de0 && 0x2d7f === c) return E
                    else if (i(0x2de0, 0x2dff)) return E
                  } else {
                    if (c < 0x3099 && i(0x302a, 0x302f)) return E
                    else if (c < 0xa66f && i(0x3099, 0x309a)) return E
                    else if (i(0xa66f, 0xa672)) return E
                  }
                } else {
                  if (c < 0xa802) {
                    if (c < 0xa69e && i(0xa674, 0xa67d)) return E
                    else if (c < 0xa6f0 && i(0xa69e, 0xa69f)) return E
                    else if (i(0xa6f0, 0xa6f1)) return E
                  } else {
                    if (c < 0xa806 && 0xa802 === c) return E
                    else if (0xa806 === c) return E
                    else if (0xa80b === c) return E
                  }
                }
              } else {
                if (c < 0xa8b4) {
                  if (c < 0xa827) {
                    if (c < 0xa825 && i(0xa823, 0xa824)) return S
                    else if (i(0xa825, 0xa826)) return E
                  } else {
                    if (c < 0xa82c && 0xa827 === c) return S
                    else if (c < 0xa880 && 0xa82c === c) return E
                    else if (i(0xa880, 0xa881)) return S
                  }
                } else {
                  if (c < 0xa8ff) {
                    if (c < 0xa8c4 && i(0xa8b4, 0xa8c3)) return S
                    else if (c < 0xa8e0 && i(0xa8c4, 0xa8c5)) return E
                    else if (i(0xa8e0, 0xa8f1)) return E
                  } else {
                    if (c < 0xa926 && 0xa8ff === c) return E
                    else if (c < 0xa947 && i(0xa926, 0xa92d)) return E
                    else if (i(0xa947, 0xa951)) return E
                  }
                }
              }
            }
          } else {
            if (c < 0xaab2) {
              if (c < 0xa9e5) {
                if (c < 0xa9b4) {
                  if (c < 0xa980) {
                    if (c < 0xa960 && i(0xa952, 0xa953)) return S
                    else if (i(0xa960, 0xa97c)) return L
                  } else {
                    if (c < 0xa983 && i(0xa980, 0xa982)) return E
                    else if (0xa983 === c) return S
                    else if (0xa9b3 === c) return E
                  }
                } else {
                  if (c < 0xa9ba) {
                    if (c < 0xa9b6 && i(0xa9b4, 0xa9b5)) return S
                    else if (i(0xa9b6, 0xa9b9)) return E
                  } else {
                    if (c < 0xa9bc && i(0xa9ba, 0xa9bb)) return S
                    else if (c < 0xa9be && i(0xa9bc, 0xa9bd)) return E
                    else if (i(0xa9be, 0xa9c0)) return S
                  }
                }
              } else {
                if (c < 0xaa35) {
                  if (c < 0xaa2f) {
                    if (c < 0xaa29 && 0xa9e5 === c) return E
                    else if (i(0xaa29, 0xaa2e)) return E
                  } else {
                    if (c < 0xaa31 && i(0xaa2f, 0xaa30)) return S
                    else if (c < 0xaa33 && i(0xaa31, 0xaa32)) return E
                    else if (i(0xaa33, 0xaa34)) return S
                  }
                } else {
                  if (c < 0xaa4d) {
                    if (c < 0xaa43 && i(0xaa35, 0xaa36)) return E
                    else if (0xaa43 === c) return E
                    else if (0xaa4c === c) return E
                  } else {
                    if (c < 0xaa7c && 0xaa4d === c) return S
                    else if (0xaa7c === c) return E
                    else if (0xaab0 === c) return E
                  }
                }
              }
            } else {
              if (c < 0xabe6) {
                if (c < 0xaaec) {
                  if (c < 0xaabe) {
                    if (c < 0xaab7 && i(0xaab2, 0xaab4)) return E
                    else if (i(0xaab7, 0xaab8)) return E
                  } else {
                    if (c < 0xaac1 && i(0xaabe, 0xaabf)) return E
                    else if (0xaac1 === c) return E
                    else if (0xaaeb === c) return S
                  }
                } else {
                  if (c < 0xaaf6) {
                    if (c < 0xaaee && i(0xaaec, 0xaaed)) return E
                    else if (c < 0xaaf5 && i(0xaaee, 0xaaef)) return S
                    else if (0xaaf5 === c) return S
                  } else {
                    if (c < 0xabe3 && 0xaaf6 === c) return E
                    else if (c < 0xabe5 && i(0xabe3, 0xabe4)) return S
                    else if (0xabe5 === c) return E
                  }
                }
              } else {
                if (c < 0xac00) {
                  if (c < 0xabe9) {
                    if (c < 0xabe8 && i(0xabe6, 0xabe7)) return S
                    else if (0xabe8 === c) return E
                  } else {
                    if (c < 0xabec && i(0xabe9, 0xabea)) return S
                    else if (0xabec === c) return S
                    else if (0xabed === c) return E
                  }
                } else {
                  if (c < 0xac1d) {
                    if (c < 0xac01 && 0xac00 === c) return LV
                    else if (c < 0xac1c && i(0xac01, 0xac1b)) return LVT
                    else if (0xac1c === c) return LV
                  } else {
                    if (c < 0xac38 && i(0xac1d, 0xac37)) return LVT
                    else if (c < 0xac39 && 0xac38 === c) return LV
                    else if (i(0xac39, 0xac53)) return LVT
                  }
                }
              }
            }
          }
        }
      }
    } else {
      if (c < 0xb5a1) {
        if (c < 0xb0ed) {
          if (c < 0xaea0) {
            if (c < 0xad6d) {
              if (c < 0xace0) {
                if (c < 0xac8d) {
                  if (c < 0xac70) {
                    if (c < 0xac55 && 0xac54 === c) return LV
                    else if (i(0xac55, 0xac6f)) return LVT
                  } else {
                    if (c < 0xac71 && 0xac70 === c) return LV
                    else if (c < 0xac8c && i(0xac71, 0xac8b)) return LVT
                    else if (0xac8c === c) return LV
                  }
                } else {
                  if (c < 0xaca9) {
                    if (c < 0xaca8 && i(0xac8d, 0xaca7)) return LVT
                    else if (0xaca8 === c) return LV
                  } else {
                    if (c < 0xacc4 && i(0xaca9, 0xacc3)) return LVT
                    else if (c < 0xacc5 && 0xacc4 === c) return LV
                    else if (i(0xacc5, 0xacdf)) return LVT
                  }
                }
              } else {
                if (c < 0xad19) {
                  if (c < 0xacfc) {
                    if (c < 0xace1 && 0xace0 === c) return LV
                    else if (i(0xace1, 0xacfb)) return LVT
                  } else {
                    if (c < 0xacfd && 0xacfc === c) return LV
                    else if (c < 0xad18 && i(0xacfd, 0xad17)) return LVT
                    else if (0xad18 === c) return LV
                  }
                } else {
                  if (c < 0xad50) {
                    if (c < 0xad34 && i(0xad19, 0xad33)) return LVT
                    else if (c < 0xad35 && 0xad34 === c) return LV
                    else if (i(0xad35, 0xad4f)) return LVT
                  } else {
                    if (c < 0xad51 && 0xad50 === c) return LV
                    else if (c < 0xad6c && i(0xad51, 0xad6b)) return LVT
                    else if (0xad6c === c) return LV
                  }
                }
              }
            } else {
              if (c < 0xadf9) {
                if (c < 0xadc0) {
                  if (c < 0xad89) {
                    if (c < 0xad88 && i(0xad6d, 0xad87)) return LVT
                    else if (0xad88 === c) return LV
                  } else {
                    if (c < 0xada4 && i(0xad89, 0xada3)) return LVT
                    else if (c < 0xada5 && 0xada4 === c) return LV
                    else if (i(0xada5, 0xadbf)) return LVT
                  }
                } else {
                  if (c < 0xaddc) {
                    if (c < 0xadc1 && 0xadc0 === c) return LV
                    else if (i(0xadc1, 0xaddb)) return LVT
                  } else {
                    if (c < 0xaddd && 0xaddc === c) return LV
                    else if (c < 0xadf8 && i(0xaddd, 0xadf7)) return LVT
                    else if (0xadf8 === c) return LV
                  }
                }
              } else {
                if (c < 0xae4c) {
                  if (c < 0xae15) {
                    if (c < 0xae14 && i(0xadf9, 0xae13)) return LVT
                    else if (0xae14 === c) return LV
                  } else {
                    if (c < 0xae30 && i(0xae15, 0xae2f)) return LVT
                    else if (c < 0xae31 && 0xae30 === c) return LV
                    else if (i(0xae31, 0xae4b)) return LVT
                  }
                } else {
                  if (c < 0xae69) {
                    if (c < 0xae4d && 0xae4c === c) return LV
                    else if (c < 0xae68 && i(0xae4d, 0xae67)) return LVT
                    else if (0xae68 === c) return LV
                  } else {
                    if (c < 0xae84 && i(0xae69, 0xae83)) return LVT
                    else if (c < 0xae85 && 0xae84 === c) return LV
                    else if (i(0xae85, 0xae9f)) return LVT
                  }
                }
              }
            }
          } else {
            if (c < 0xafb9) {
              if (c < 0xaf2c) {
                if (c < 0xaed9) {
                  if (c < 0xaebc) {
                    if (c < 0xaea1 && 0xaea0 === c) return LV
                    else if (i(0xaea1, 0xaebb)) return LVT
                  } else {
                    if (c < 0xaebd && 0xaebc === c) return LV
                    else if (c < 0xaed8 && i(0xaebd, 0xaed7)) return LVT
                    else if (0xaed8 === c) return LV
                  }
                } else {
                  if (c < 0xaef5) {
                    if (c < 0xaef4 && i(0xaed9, 0xaef3)) return LVT
                    else if (0xaef4 === c) return LV
                  } else {
                    if (c < 0xaf10 && i(0xaef5, 0xaf0f)) return LVT
                    else if (c < 0xaf11 && 0xaf10 === c) return LV
                    else if (i(0xaf11, 0xaf2b)) return LVT
                  }
                }
              } else {
                if (c < 0xaf65) {
                  if (c < 0xaf48) {
                    if (c < 0xaf2d && 0xaf2c === c) return LV
                    else if (i(0xaf2d, 0xaf47)) return LVT
                  } else {
                    if (c < 0xaf49 && 0xaf48 === c) return LV
                    else if (c < 0xaf64 && i(0xaf49, 0xaf63)) return LVT
                    else if (0xaf64 === c) return LV
                  }
                } else {
                  if (c < 0xaf9c) {
                    if (c < 0xaf80 && i(0xaf65, 0xaf7f)) return LVT
                    else if (c < 0xaf81 && 0xaf80 === c) return LV
                    else if (i(0xaf81, 0xaf9b)) return LVT
                  } else {
                    if (c < 0xaf9d && 0xaf9c === c) return LV
                    else if (c < 0xafb8 && i(0xaf9d, 0xafb7)) return LVT
                    else if (0xafb8 === c) return LV
                  }
                }
              }
            } else {
              if (c < 0xb060) {
                if (c < 0xb00c) {
                  if (c < 0xafd5) {
                    if (c < 0xafd4 && i(0xafb9, 0xafd3)) return LVT
                    else if (0xafd4 === c) return LV
                  } else {
                    if (c < 0xaff0 && i(0xafd5, 0xafef)) return LVT
                    else if (c < 0xaff1 && 0xaff0 === c) return LV
                    else if (i(0xaff1, 0xb00b)) return LVT
                  }
                } else {
                  if (c < 0xb029) {
                    if (c < 0xb00d && 0xb00c === c) return LV
                    else if (c < 0xb028 && i(0xb00d, 0xb027)) return LVT
                    else if (0xb028 === c) return LV
                  } else {
                    if (c < 0xb044 && i(0xb029, 0xb043)) return LVT
                    else if (c < 0xb045 && 0xb044 === c) return LV
                    else if (i(0xb045, 0xb05f)) return LVT
                  }
                }
              } else {
                if (c < 0xb099) {
                  if (c < 0xb07c) {
                    if (c < 0xb061 && 0xb060 === c) return LV
                    else if (i(0xb061, 0xb07b)) return LVT
                  } else {
                    if (c < 0xb07d && 0xb07c === c) return LV
                    else if (c < 0xb098 && i(0xb07d, 0xb097)) return LVT
                    else if (0xb098 === c) return LV
                  }
                } else {
                  if (c < 0xb0d0) {
                    if (c < 0xb0b4 && i(0xb099, 0xb0b3)) return LVT
                    else if (c < 0xb0b5 && 0xb0b4 === c) return LV
                    else if (i(0xb0b5, 0xb0cf)) return LVT
                  } else {
                    if (c < 0xb0d1 && 0xb0d0 === c) return LV
                    else if (c < 0xb0ec && i(0xb0d1, 0xb0eb)) return LVT
                    else if (0xb0ec === c) return LV
                  }
                }
              }
            }
          }
        } else {
          if (c < 0xb354) {
            if (c < 0xb220) {
              if (c < 0xb179) {
                if (c < 0xb140) {
                  if (c < 0xb109) {
                    if (c < 0xb108 && i(0xb0ed, 0xb107)) return LVT
                    else if (0xb108 === c) return LV
                  } else {
                    if (c < 0xb124 && i(0xb109, 0xb123)) return LVT
                    else if (c < 0xb125 && 0xb124 === c) return LV
                    else if (i(0xb125, 0xb13f)) return LVT
                  }
                } else {
                  if (c < 0xb15c) {
                    if (c < 0xb141 && 0xb140 === c) return LV
                    else if (i(0xb141, 0xb15b)) return LVT
                  } else {
                    if (c < 0xb15d && 0xb15c === c) return LV
                    else if (c < 0xb178 && i(0xb15d, 0xb177)) return LVT
                    else if (0xb178 === c) return LV
                  }
                }
              } else {
                if (c < 0xb1cc) {
                  if (c < 0xb195) {
                    if (c < 0xb194 && i(0xb179, 0xb193)) return LVT
                    else if (0xb194 === c) return LV
                  } else {
                    if (c < 0xb1b0 && i(0xb195, 0xb1af)) return LVT
                    else if (c < 0xb1b1 && 0xb1b0 === c) return LV
                    else if (i(0xb1b1, 0xb1cb)) return LVT
                  }
                } else {
                  if (c < 0xb1e9) {
                    if (c < 0xb1cd && 0xb1cc === c) return LV
                    else if (c < 0xb1e8 && i(0xb1cd, 0xb1e7)) return LVT
                    else if (0xb1e8 === c) return LV
                  } else {
                    if (c < 0xb204 && i(0xb1e9, 0xb203)) return LVT
                    else if (c < 0xb205 && 0xb204 === c) return LV
                    else if (i(0xb205, 0xb21f)) return LVT
                  }
                }
              }
            } else {
              if (c < 0xb2ad) {
                if (c < 0xb259) {
                  if (c < 0xb23c) {
                    if (c < 0xb221 && 0xb220 === c) return LV
                    else if (i(0xb221, 0xb23b)) return LVT
                  } else {
                    if (c < 0xb23d && 0xb23c === c) return LV
                    else if (c < 0xb258 && i(0xb23d, 0xb257)) return LVT
                    else if (0xb258 === c) return LV
                  }
                } else {
                  if (c < 0xb290) {
                    if (c < 0xb274 && i(0xb259, 0xb273)) return LVT
                    else if (c < 0xb275 && 0xb274 === c) return LV
                    else if (i(0xb275, 0xb28f)) return LVT
                  } else {
                    if (c < 0xb291 && 0xb290 === c) return LV
                    else if (c < 0xb2ac && i(0xb291, 0xb2ab)) return LVT
                    else if (0xb2ac === c) return LV
                  }
                }
              } else {
                if (c < 0xb300) {
                  if (c < 0xb2c9) {
                    if (c < 0xb2c8 && i(0xb2ad, 0xb2c7)) return LVT
                    else if (0xb2c8 === c) return LV
                  } else {
                    if (c < 0xb2e4 && i(0xb2c9, 0xb2e3)) return LVT
                    else if (c < 0xb2e5 && 0xb2e4 === c) return LV
                    else if (i(0xb2e5, 0xb2ff)) return LVT
                  }
                } else {
                  if (c < 0xb31d) {
                    if (c < 0xb301 && 0xb300 === c) return LV
                    else if (c < 0xb31c && i(0xb301, 0xb31b)) return LVT
                    else if (0xb31c === c) return LV
                  } else {
                    if (c < 0xb338 && i(0xb31d, 0xb337)) return LVT
                    else if (c < 0xb339 && 0xb338 === c) return LV
                    else if (i(0xb339, 0xb353)) return LVT
                  }
                }
              }
            }
          } else {
            if (c < 0xb46d) {
              if (c < 0xb3e0) {
                if (c < 0xb38d) {
                  if (c < 0xb370) {
                    if (c < 0xb355 && 0xb354 === c) return LV
                    else if (i(0xb355, 0xb36f)) return LVT
                  } else {
                    if (c < 0xb371 && 0xb370 === c) return LV
                    else if (c < 0xb38c && i(0xb371, 0xb38b)) return LVT
                    else if (0xb38c === c) return LV
                  }
                } else {
                  if (c < 0xb3a9) {
                    if (c < 0xb3a8 && i(0xb38d, 0xb3a7)) return LVT
                    else if (0xb3a8 === c) return LV
                  } else {
                    if (c < 0xb3c4 && i(0xb3a9, 0xb3c3)) return LVT
                    else if (c < 0xb3c5 && 0xb3c4 === c) return LV
                    else if (i(0xb3c5, 0xb3df)) return LVT
                  }
                }
              } else {
                if (c < 0xb419) {
                  if (c < 0xb3fc) {
                    if (c < 0xb3e1 && 0xb3e0 === c) return LV
                    else if (i(0xb3e1, 0xb3fb)) return LVT
                  } else {
                    if (c < 0xb3fd && 0xb3fc === c) return LV
                    else if (c < 0xb418 && i(0xb3fd, 0xb417)) return LVT
                    else if (0xb418 === c) return LV
                  }
                } else {
                  if (c < 0xb450) {
                    if (c < 0xb434 && i(0xb419, 0xb433)) return LVT
                    else if (c < 0xb435 && 0xb434 === c) return LV
                    else if (i(0xb435, 0xb44f)) return LVT
                  } else {
                    if (c < 0xb451 && 0xb450 === c) return LV
                    else if (c < 0xb46c && i(0xb451, 0xb46b)) return LVT
                    else if (0xb46c === c) return LV
                  }
                }
              }
            } else {
              if (c < 0xb514) {
                if (c < 0xb4c0) {
                  if (c < 0xb489) {
                    if (c < 0xb488 && i(0xb46d, 0xb487)) return LVT
                    else if (0xb488 === c) return LV
                  } else {
                    if (c < 0xb4a4 && i(0xb489, 0xb4a3)) return LVT
                    else if (c < 0xb4a5 && 0xb4a4 === c) return LV
                    else if (i(0xb4a5, 0xb4bf)) return LVT
                  }
                } else {
                  if (c < 0xb4dd) {
                    if (c < 0xb4c1 && 0xb4c0 === c) return LV
                    else if (c < 0xb4dc && i(0xb4c1, 0xb4db)) return LVT
                    else if (0xb4dc === c) return LV
                  } else {
                    if (c < 0xb4f8 && i(0xb4dd, 0xb4f7)) return LVT
                    else if (c < 0xb4f9 && 0xb4f8 === c) return LV
                    else if (i(0xb4f9, 0xb513)) return LVT
                  }
                }
              } else {
                if (c < 0xb54d) {
                  if (c < 0xb530) {
                    if (c < 0xb515 && 0xb514 === c) return LV
                    else if (i(0xb515, 0xb52f)) return LVT
                  } else {
                    if (c < 0xb531 && 0xb530 === c) return LV
                    else if (c < 0xb54c && i(0xb531, 0xb54b)) return LVT
                    else if (0xb54c === c) return LV
                  }
                } else {
                  if (c < 0xb584) {
                    if (c < 0xb568 && i(0xb54d, 0xb567)) return LVT
                    else if (c < 0xb569 && 0xb568 === c) return LV
                    else if (i(0xb569, 0xb583)) return LVT
                  } else {
                    if (c < 0xb585 && 0xb584 === c) return LV
                    else if (c < 0xb5a0 && i(0xb585, 0xb59f)) return LVT
                    else if (0xb5a0 === c) return LV
                  }
                }
              }
            }
          }
        }
      } else {
        if (c < 0xba55) {
          if (c < 0xb808) {
            if (c < 0xb6d4) {
              if (c < 0xb62d) {
                if (c < 0xb5f4) {
                  if (c < 0xb5bd) {
                    if (c < 0xb5bc && i(0xb5a1, 0xb5bb)) return LVT
                    else if (0xb5bc === c) return LV
                  } else {
                    if (c < 0xb5d8 && i(0xb5bd, 0xb5d7)) return LVT
                    else if (c < 0xb5d9 && 0xb5d8 === c) return LV
                    else if (i(0xb5d9, 0xb5f3)) return LVT
                  }
                } else {
                  if (c < 0xb610) {
                    if (c < 0xb5f5 && 0xb5f4 === c) return LV
                    else if (i(0xb5f5, 0xb60f)) return LVT
                  } else {
                    if (c < 0xb611 && 0xb610 === c) return LV
                    else if (c < 0xb62c && i(0xb611, 0xb62b)) return LVT
                    else if (0xb62c === c) return LV
                  }
                }
              } else {
                if (c < 0xb680) {
                  if (c < 0xb649) {
                    if (c < 0xb648 && i(0xb62d, 0xb647)) return LVT
                    else if (0xb648 === c) return LV
                  } else {
                    if (c < 0xb664 && i(0xb649, 0xb663)) return LVT
                    else if (c < 0xb665 && 0xb664 === c) return LV
                    else if (i(0xb665, 0xb67f)) return LVT
                  }
                } else {
                  if (c < 0xb69d) {
                    if (c < 0xb681 && 0xb680 === c) return LV
                    else if (c < 0xb69c && i(0xb681, 0xb69b)) return LVT
                    else if (0xb69c === c) return LV
                  } else {
                    if (c < 0xb6b8 && i(0xb69d, 0xb6b7)) return LVT
                    else if (c < 0xb6b9 && 0xb6b8 === c) return LV
                    else if (i(0xb6b9, 0xb6d3)) return LVT
                  }
                }
              }
            } else {
              if (c < 0xb761) {
                if (c < 0xb70d) {
                  if (c < 0xb6f0) {
                    if (c < 0xb6d5 && 0xb6d4 === c) return LV
                    else if (i(0xb6d5, 0xb6ef)) return LVT
                  } else {
                    if (c < 0xb6f1 && 0xb6f0 === c) return LV
                    else if (c < 0xb70c && i(0xb6f1, 0xb70b)) return LVT
                    else if (0xb70c === c) return LV
                  }
                } else {
                  if (c < 0xb744) {
                    if (c < 0xb728 && i(0xb70d, 0xb727)) return LVT
                    else if (c < 0xb729 && 0xb728 === c) return LV
                    else if (i(0xb729, 0xb743)) return LVT
                  } else {
                    if (c < 0xb745 && 0xb744 === c) return LV
                    else if (c < 0xb760 && i(0xb745, 0xb75f)) return LVT
                    else if (0xb760 === c) return LV
                  }
                }
              } else {
                if (c < 0xb7b4) {
                  if (c < 0xb77d) {
                    if (c < 0xb77c && i(0xb761, 0xb77b)) return LVT
                    else if (0xb77c === c) return LV
                  } else {
                    if (c < 0xb798 && i(0xb77d, 0xb797)) return LVT
                    else if (c < 0xb799 && 0xb798 === c) return LV
                    else if (i(0xb799, 0xb7b3)) return LVT
                  }
                } else {
                  if (c < 0xb7d1) {
                    if (c < 0xb7b5 && 0xb7b4 === c) return LV
                    else if (c < 0xb7d0 && i(0xb7b5, 0xb7cf)) return LVT
                    else if (0xb7d0 === c) return LV
                  } else {
                    if (c < 0xb7ec && i(0xb7d1, 0xb7eb)) return LVT
                    else if (c < 0xb7ed && 0xb7ec === c) return LV
                    else if (i(0xb7ed, 0xb807)) return LVT
                  }
                }
              }
            }
          } else {
            if (c < 0xb921) {
              if (c < 0xb894) {
                if (c < 0xb841) {
                  if (c < 0xb824) {
                    if (c < 0xb809 && 0xb808 === c) return LV
                    else if (i(0xb809, 0xb823)) return LVT
                  } else {
                    if (c < 0xb825 && 0xb824 === c) return LV
                    else if (c < 0xb840 && i(0xb825, 0xb83f)) return LVT
                    else if (0xb840 === c) return LV
                  }
                } else {
                  if (c < 0xb85d) {
                    if (c < 0xb85c && i(0xb841, 0xb85b)) return LVT
                    else if (0xb85c === c) return LV
                  } else {
                    if (c < 0xb878 && i(0xb85d, 0xb877)) return LVT
                    else if (c < 0xb879 && 0xb878 === c) return LV
                    else if (i(0xb879, 0xb893)) return LVT
                  }
                }
              } else {
                if (c < 0xb8cd) {
                  if (c < 0xb8b0) {
                    if (c < 0xb895 && 0xb894 === c) return LV
                    else if (i(0xb895, 0xb8af)) return LVT
                  } else {
                    if (c < 0xb8b1 && 0xb8b0 === c) return LV
                    else if (c < 0xb8cc && i(0xb8b1, 0xb8cb)) return LVT
                    else if (0xb8cc === c) return LV
                  }
                } else {
                  if (c < 0xb904) {
                    if (c < 0xb8e8 && i(0xb8cd, 0xb8e7)) return LVT
                    else if (c < 0xb8e9 && 0xb8e8 === c) return LV
                    else if (i(0xb8e9, 0xb903)) return LVT
                  } else {
                    if (c < 0xb905 && 0xb904 === c) return LV
                    else if (c < 0xb920 && i(0xb905, 0xb91f)) return LVT
                    else if (0xb920 === c) return LV
                  }
                }
              }
            } else {
              if (c < 0xb9c8) {
                if (c < 0xb974) {
                  if (c < 0xb93d) {
                    if (c < 0xb93c && i(0xb921, 0xb93b)) return LVT
                    else if (0xb93c === c) return LV
                  } else {
                    if (c < 0xb958 && i(0xb93d, 0xb957)) return LVT
                    else if (c < 0xb959 && 0xb958 === c) return LV
                    else if (i(0xb959, 0xb973)) return LVT
                  }
                } else {
                  if (c < 0xb991) {
                    if (c < 0xb975 && 0xb974 === c) return LV
                    else if (c < 0xb990 && i(0xb975, 0xb98f)) return LVT
                    else if (0xb990 === c) return LV
                  } else {
                    if (c < 0xb9ac && i(0xb991, 0xb9ab)) return LVT
                    else if (c < 0xb9ad && 0xb9ac === c) return LV
                    else if (i(0xb9ad, 0xb9c7)) return LVT
                  }
                }
              } else {
                if (c < 0xba01) {
                  if (c < 0xb9e4) {
                    if (c < 0xb9c9 && 0xb9c8 === c) return LV
                    else if (i(0xb9c9, 0xb9e3)) return LVT
                  } else {
                    if (c < 0xb9e5 && 0xb9e4 === c) return LV
                    else if (c < 0xba00 && i(0xb9e5, 0xb9ff)) return LVT
                    else if (0xba00 === c) return LV
                  }
                } else {
                  if (c < 0xba38) {
                    if (c < 0xba1c && i(0xba01, 0xba1b)) return LVT
                    else if (c < 0xba1d && 0xba1c === c) return LV
                    else if (i(0xba1d, 0xba37)) return LVT
                  } else {
                    if (c < 0xba39 && 0xba38 === c) return LV
                    else if (c < 0xba54 && i(0xba39, 0xba53)) return LVT
                    else if (0xba54 === c) return LV
                  }
                }
              }
            }
          }
        } else {
          if (c < 0xbcbc) {
            if (c < 0xbb88) {
              if (c < 0xbae1) {
                if (c < 0xbaa8) {
                  if (c < 0xba71) {
                    if (c < 0xba70 && i(0xba55, 0xba6f)) return LVT
                    else if (0xba70 === c) return LV
                  } else {
                    if (c < 0xba8c && i(0xba71, 0xba8b)) return LVT
                    else if (c < 0xba8d && 0xba8c === c) return LV
                    else if (i(0xba8d, 0xbaa7)) return LVT
                  }
                } else {
                  if (c < 0xbac4) {
                    if (c < 0xbaa9 && 0xbaa8 === c) return LV
                    else if (i(0xbaa9, 0xbac3)) return LVT
                  } else {
                    if (c < 0xbac5 && 0xbac4 === c) return LV
                    else if (c < 0xbae0 && i(0xbac5, 0xbadf)) return LVT
                    else if (0xbae0 === c) return LV
                  }
                }
              } else {
                if (c < 0xbb34) {
                  if (c < 0xbafd) {
                    if (c < 0xbafc && i(0xbae1, 0xbafb)) return LVT
                    else if (0xbafc === c) return LV
                  } else {
                    if (c < 0xbb18 && i(0xbafd, 0xbb17)) return LVT
                    else if (c < 0xbb19 && 0xbb18 === c) return LV
                    else if (i(0xbb19, 0xbb33)) return LVT
                  }
                } else {
                  if (c < 0xbb51) {
                    if (c < 0xbb35 && 0xbb34 === c) return LV
                    else if (c < 0xbb50 && i(0xbb35, 0xbb4f)) return LVT
                    else if (0xbb50 === c) return LV
                  } else {
                    if (c < 0xbb6c && i(0xbb51, 0xbb6b)) return LVT
                    else if (c < 0xbb6d && 0xbb6c === c) return LV
                    else if (i(0xbb6d, 0xbb87)) return LVT
                  }
                }
              }
            } else {
              if (c < 0xbc15) {
                if (c < 0xbbc1) {
                  if (c < 0xbba4) {
                    if (c < 0xbb89 && 0xbb88 === c) return LV
                    else if (i(0xbb89, 0xbba3)) return LVT
                  } else {
                    if (c < 0xbba5 && 0xbba4 === c) return LV
                    else if (c < 0xbbc0 && i(0xbba5, 0xbbbf)) return LVT
                    else if (0xbbc0 === c) return LV
                  }
                } else {
                  if (c < 0xbbf8) {
                    if (c < 0xbbdc && i(0xbbc1, 0xbbdb)) return LVT
                    else if (c < 0xbbdd && 0xbbdc === c) return LV
                    else if (i(0xbbdd, 0xbbf7)) return LVT
                  } else {
                    if (c < 0xbbf9 && 0xbbf8 === c) return LV
                    else if (c < 0xbc14 && i(0xbbf9, 0xbc13)) return LVT
                    else if (0xbc14 === c) return LV
                  }
                }
              } else {
                if (c < 0xbc68) {
                  if (c < 0xbc31) {
                    if (c < 0xbc30 && i(0xbc15, 0xbc2f)) return LVT
                    else if (0xbc30 === c) return LV
                  } else {
                    if (c < 0xbc4c && i(0xbc31, 0xbc4b)) return LVT
                    else if (c < 0xbc4d && 0xbc4c === c) return LV
                    else if (i(0xbc4d, 0xbc67)) return LVT
                  }
                } else {
                  if (c < 0xbc85) {
                    if (c < 0xbc69 && 0xbc68 === c) return LV
                    else if (c < 0xbc84 && i(0xbc69, 0xbc83)) return LVT
                    else if (0xbc84 === c) return LV
                  } else {
                    if (c < 0xbca0 && i(0xbc85, 0xbc9f)) return LVT
                    else if (c < 0xbca1 && 0xbca0 === c) return LV
                    else if (i(0xbca1, 0xbcbb)) return LVT
                  }
                }
              }
            }
          } else {
            if (c < 0xbdd5) {
              if (c < 0xbd48) {
                if (c < 0xbcf5) {
                  if (c < 0xbcd8) {
                    if (c < 0xbcbd && 0xbcbc === c) return LV
                    else if (i(0xbcbd, 0xbcd7)) return LVT
                  } else {
                    if (c < 0xbcd9 && 0xbcd8 === c) return LV
                    else if (c < 0xbcf4 && i(0xbcd9, 0xbcf3)) return LVT
                    else if (0xbcf4 === c) return LV
                  }
                } else {
                  if (c < 0xbd11) {
                    if (c < 0xbd10 && i(0xbcf5, 0xbd0f)) return LVT
                    else if (0xbd10 === c) return LV
                  } else {
                    if (c < 0xbd2c && i(0xbd11, 0xbd2b)) return LVT
                    else if (c < 0xbd2d && 0xbd2c === c) return LV
                    else if (i(0xbd2d, 0xbd47)) return LVT
                  }
                }
              } else {
                if (c < 0xbd81) {
                  if (c < 0xbd64) {
                    if (c < 0xbd49 && 0xbd48 === c) return LV
                    else if (i(0xbd49, 0xbd63)) return LVT
                  } else {
                    if (c < 0xbd65 && 0xbd64 === c) return LV
                    else if (c < 0xbd80 && i(0xbd65, 0xbd7f)) return LVT
                    else if (0xbd80 === c) return LV
                  }
                } else {
                  if (c < 0xbdb8) {
                    if (c < 0xbd9c && i(0xbd81, 0xbd9b)) return LVT
                    else if (c < 0xbd9d && 0xbd9c === c) return LV
                    else if (i(0xbd9d, 0xbdb7)) return LVT
                  } else {
                    if (c < 0xbdb9 && 0xbdb8 === c) return LV
                    else if (c < 0xbdd4 && i(0xbdb9, 0xbdd3)) return LVT
                    else if (0xbdd4 === c) return LV
                  }
                }
              }
            } else {
              if (c < 0xbe7c) {
                if (c < 0xbe28) {
                  if (c < 0xbdf1) {
                    if (c < 0xbdf0 && i(0xbdd5, 0xbdef)) return LVT
                    else if (0xbdf0 === c) return LV
                  } else {
                    if (c < 0xbe0c && i(0xbdf1, 0xbe0b)) return LVT
                    else if (c < 0xbe0d && 0xbe0c === c) return LV
                    else if (i(0xbe0d, 0xbe27)) return LVT
                  }
                } else {
                  if (c < 0xbe45) {
                    if (c < 0xbe29 && 0xbe28 === c) return LV
                    else if (c < 0xbe44 && i(0xbe29, 0xbe43)) return LVT
                    else if (0xbe44 === c) return LV
                  } else {
                    if (c < 0xbe60 && i(0xbe45, 0xbe5f)) return LVT
                    else if (c < 0xbe61 && 0xbe60 === c) return LV
                    else if (i(0xbe61, 0xbe7b)) return LVT
                  }
                }
              } else {
                if (c < 0xbeb5) {
                  if (c < 0xbe98) {
                    if (c < 0xbe7d && 0xbe7c === c) return LV
                    else if (i(0xbe7d, 0xbe97)) return LVT
                  } else {
                    if (c < 0xbe99 && 0xbe98 === c) return LV
                    else if (c < 0xbeb4 && i(0xbe99, 0xbeb3)) return LVT
                    else if (0xbeb4 === c) return LV
                  }
                } else {
                  if (c < 0xbeec) {
                    if (c < 0xbed0 && i(0xbeb5, 0xbecf)) return LVT
                    else if (c < 0xbed1 && 0xbed0 === c) return LV
                    else if (i(0xbed1, 0xbeeb)) return LVT
                  } else {
                    if (c < 0xbeed && 0xbeec === c) return LV
                    else if (c < 0xbf08 && i(0xbeed, 0xbf07)) return LVT
                    else if (0xbf08 === c) return LV
                  }
                }
              }
            }
          }
        }
      }
    }
  } else {
    if (c < 0xd1d8) {
      if (c < 0xc870) {
        if (c < 0xc3bc) {
          if (c < 0xc155) {
            if (c < 0xc03c) {
              if (c < 0xbf95) {
                if (c < 0xbf5c) {
                  if (c < 0xbf25) {
                    if (c < 0xbf24 && i(0xbf09, 0xbf23)) return LVT
                    else if (0xbf24 === c) return LV
                  } else {
                    if (c < 0xbf40 && i(0xbf25, 0xbf3f)) return LVT
                    else if (c < 0xbf41 && 0xbf40 === c) return LV
                    else if (i(0xbf41, 0xbf5b)) return LVT
                  }
                } else {
                  if (c < 0xbf78) {
                    if (c < 0xbf5d && 0xbf5c === c) return LV
                    else if (i(0xbf5d, 0xbf77)) return LVT
                  } else {
                    if (c < 0xbf79 && 0xbf78 === c) return LV
                    else if (c < 0xbf94 && i(0xbf79, 0xbf93)) return LVT
                    else if (0xbf94 === c) return LV
                  }
                }
              } else {
                if (c < 0xbfe8) {
                  if (c < 0xbfb1) {
                    if (c < 0xbfb0 && i(0xbf95, 0xbfaf)) return LVT
                    else if (0xbfb0 === c) return LV
                  } else {
                    if (c < 0xbfcc && i(0xbfb1, 0xbfcb)) return LVT
                    else if (c < 0xbfcd && 0xbfcc === c) return LV
                    else if (i(0xbfcd, 0xbfe7)) return LVT
                  }
                } else {
                  if (c < 0xc005) {
                    if (c < 0xbfe9 && 0xbfe8 === c) return LV
                    else if (c < 0xc004 && i(0xbfe9, 0xc003)) return LVT
                    else if (0xc004 === c) return LV
                  } else {
                    if (c < 0xc020 && i(0xc005, 0xc01f)) return LVT
                    else if (c < 0xc021 && 0xc020 === c) return LV
                    else if (i(0xc021, 0xc03b)) return LVT
                  }
                }
              }
            } else {
              if (c < 0xc0c8) {
                if (c < 0xc075) {
                  if (c < 0xc058) {
                    if (c < 0xc03d && 0xc03c === c) return LV
                    else if (i(0xc03d, 0xc057)) return LVT
                  } else {
                    if (c < 0xc059 && 0xc058 === c) return LV
                    else if (c < 0xc074 && i(0xc059, 0xc073)) return LVT
                    else if (0xc074 === c) return LV
                  }
                } else {
                  if (c < 0xc091) {
                    if (c < 0xc090 && i(0xc075, 0xc08f)) return LVT
                    else if (0xc090 === c) return LV
                  } else {
                    if (c < 0xc0ac && i(0xc091, 0xc0ab)) return LVT
                    else if (c < 0xc0ad && 0xc0ac === c) return LV
                    else if (i(0xc0ad, 0xc0c7)) return LVT
                  }
                }
              } else {
                if (c < 0xc101) {
                  if (c < 0xc0e4) {
                    if (c < 0xc0c9 && 0xc0c8 === c) return LV
                    else if (i(0xc0c9, 0xc0e3)) return LVT
                  } else {
                    if (c < 0xc0e5 && 0xc0e4 === c) return LV
                    else if (c < 0xc100 && i(0xc0e5, 0xc0ff)) return LVT
                    else if (0xc100 === c) return LV
                  }
                } else {
                  if (c < 0xc138) {
                    if (c < 0xc11c && i(0xc101, 0xc11b)) return LVT
                    else if (c < 0xc11d && 0xc11c === c) return LV
                    else if (i(0xc11d, 0xc137)) return LVT
                  } else {
                    if (c < 0xc139 && 0xc138 === c) return LV
                    else if (c < 0xc154 && i(0xc139, 0xc153)) return LVT
                    else if (0xc154 === c) return LV
                  }
                }
              }
            }
          } else {
            if (c < 0xc288) {
              if (c < 0xc1e1) {
                if (c < 0xc1a8) {
                  if (c < 0xc171) {
                    if (c < 0xc170 && i(0xc155, 0xc16f)) return LVT
                    else if (0xc170 === c) return LV
                  } else {
                    if (c < 0xc18c && i(0xc171, 0xc18b)) return LVT
                    else if (c < 0xc18d && 0xc18c === c) return LV
                    else if (i(0xc18d, 0xc1a7)) return LVT
                  }
                } else {
                  if (c < 0xc1c4) {
                    if (c < 0xc1a9 && 0xc1a8 === c) return LV
                    else if (i(0xc1a9, 0xc1c3)) return LVT
                  } else {
                    if (c < 0xc1c5 && 0xc1c4 === c) return LV
                    else if (c < 0xc1e0 && i(0xc1c5, 0xc1df)) return LVT
                    else if (0xc1e0 === c) return LV
                  }
                }
              } else {
                if (c < 0xc234) {
                  if (c < 0xc1fd) {
                    if (c < 0xc1fc && i(0xc1e1, 0xc1fb)) return LVT
                    else if (0xc1fc === c) return LV
                  } else {
                    if (c < 0xc218 && i(0xc1fd, 0xc217)) return LVT
                    else if (c < 0xc219 && 0xc218 === c) return LV
                    else if (i(0xc219, 0xc233)) return LVT
                  }
                } else {
                  if (c < 0xc251) {
                    if (c < 0xc235 && 0xc234 === c) return LV
                    else if (c < 0xc250 && i(0xc235, 0xc24f)) return LVT
                    else if (0xc250 === c) return LV
                  } else {
                    if (c < 0xc26c && i(0xc251, 0xc26b)) return LVT
                    else if (c < 0xc26d && 0xc26c === c) return LV
                    else if (i(0xc26d, 0xc287)) return LVT
                  }
                }
              }
            } else {
              if (c < 0xc315) {
                if (c < 0xc2c1) {
                  if (c < 0xc2a4) {
                    if (c < 0xc289 && 0xc288 === c) return LV
                    else if (i(0xc289, 0xc2a3)) return LVT
                  } else {
                    if (c < 0xc2a5 && 0xc2a4 === c) return LV
                    else if (c < 0xc2c0 && i(0xc2a5, 0xc2bf)) return LVT
                    else if (0xc2c0 === c) return LV
                  }
                } else {
                  if (c < 0xc2f8) {
                    if (c < 0xc2dc && i(0xc2c1, 0xc2db)) return LVT
                    else if (c < 0xc2dd && 0xc2dc === c) return LV
                    else if (i(0xc2dd, 0xc2f7)) return LVT
                  } else {
                    if (c < 0xc2f9 && 0xc2f8 === c) return LV
                    else if (c < 0xc314 && i(0xc2f9, 0xc313)) return LVT
                    else if (0xc314 === c) return LV
                  }
                }
              } else {
                if (c < 0xc368) {
                  if (c < 0xc331) {
                    if (c < 0xc330 && i(0xc315, 0xc32f)) return LVT
                    else if (0xc330 === c) return LV
                  } else {
                    if (c < 0xc34c && i(0xc331, 0xc34b)) return LVT
                    else if (c < 0xc34d && 0xc34c === c) return LV
                    else if (i(0xc34d, 0xc367)) return LVT
                  }
                } else {
                  if (c < 0xc385) {
                    if (c < 0xc369 && 0xc368 === c) return LV
                    else if (c < 0xc384 && i(0xc369, 0xc383)) return LVT
                    else if (0xc384 === c) return LV
                  } else {
                    if (c < 0xc3a0 && i(0xc385, 0xc39f)) return LVT
                    else if (c < 0xc3a1 && 0xc3a0 === c) return LV
                    else if (i(0xc3a1, 0xc3bb)) return LVT
                  }
                }
              }
            }
          }
        } else {
          if (c < 0xc609) {
            if (c < 0xc4d5) {
              if (c < 0xc448) {
                if (c < 0xc3f5) {
                  if (c < 0xc3d8) {
                    if (c < 0xc3bd && 0xc3bc === c) return LV
                    else if (i(0xc3bd, 0xc3d7)) return LVT
                  } else {
                    if (c < 0xc3d9 && 0xc3d8 === c) return LV
                    else if (c < 0xc3f4 && i(0xc3d9, 0xc3f3)) return LVT
                    else if (0xc3f4 === c) return LV
                  }
                } else {
                  if (c < 0xc411) {
                    if (c < 0xc410 && i(0xc3f5, 0xc40f)) return LVT
                    else if (0xc410 === c) return LV
                  } else {
                    if (c < 0xc42c && i(0xc411, 0xc42b)) return LVT
                    else if (c < 0xc42d && 0xc42c === c) return LV
                    else if (i(0xc42d, 0xc447)) return LVT
                  }
                }
              } else {
                if (c < 0xc481) {
                  if (c < 0xc464) {
                    if (c < 0xc449 && 0xc448 === c) return LV
                    else if (i(0xc449, 0xc463)) return LVT
                  } else {
                    if (c < 0xc465 && 0xc464 === c) return LV
                    else if (c < 0xc480 && i(0xc465, 0xc47f)) return LVT
                    else if (0xc480 === c) return LV
                  }
                } else {
                  if (c < 0xc4b8) {
                    if (c < 0xc49c && i(0xc481, 0xc49b)) return LVT
                    else if (c < 0xc49d && 0xc49c === c) return LV
                    else if (i(0xc49d, 0xc4b7)) return LVT
                  } else {
                    if (c < 0xc4b9 && 0xc4b8 === c) return LV
                    else if (c < 0xc4d4 && i(0xc4b9, 0xc4d3)) return LVT
                    else if (0xc4d4 === c) return LV
                  }
                }
              }
            } else {
              if (c < 0xc57c) {
                if (c < 0xc528) {
                  if (c < 0xc4f1) {
                    if (c < 0xc4f0 && i(0xc4d5, 0xc4ef)) return LVT
                    else if (0xc4f0 === c) return LV
                  } else {
                    if (c < 0xc50c && i(0xc4f1, 0xc50b)) return LVT
                    else if (c < 0xc50d && 0xc50c === c) return LV
                    else if (i(0xc50d, 0xc527)) return LVT
                  }
                } else {
                  if (c < 0xc545) {
                    if (c < 0xc529 && 0xc528 === c) return LV
                    else if (c < 0xc544 && i(0xc529, 0xc543)) return LVT
                    else if (0xc544 === c) return LV
                  } else {
                    if (c < 0xc560 && i(0xc545, 0xc55f)) return LVT
                    else if (c < 0xc561 && 0xc560 === c) return LV
                    else if (i(0xc561, 0xc57b)) return LVT
                  }
                }
              } else {
                if (c < 0xc5b5) {
                  if (c < 0xc598) {
                    if (c < 0xc57d && 0xc57c === c) return LV
                    else if (i(0xc57d, 0xc597)) return LVT
                  } else {
                    if (c < 0xc599 && 0xc598 === c) return LV
                    else if (c < 0xc5b4 && i(0xc599, 0xc5b3)) return LVT
                    else if (0xc5b4 === c) return LV
                  }
                } else {
                  if (c < 0xc5ec) {
                    if (c < 0xc5d0 && i(0xc5b5, 0xc5cf)) return LVT
                    else if (c < 0xc5d1 && 0xc5d0 === c) return LV
                    else if (i(0xc5d1, 0xc5eb)) return LVT
                  } else {
                    if (c < 0xc5ed && 0xc5ec === c) return LV
                    else if (c < 0xc608 && i(0xc5ed, 0xc607)) return LVT
                    else if (0xc608 === c) return LV
                  }
                }
              }
            }
          } else {
            if (c < 0xc73c) {
              if (c < 0xc695) {
                if (c < 0xc65c) {
                  if (c < 0xc625) {
                    if (c < 0xc624 && i(0xc609, 0xc623)) return LVT
                    else if (0xc624 === c) return LV
                  } else {
                    if (c < 0xc640 && i(0xc625, 0xc63f)) return LVT
                    else if (c < 0xc641 && 0xc640 === c) return LV
                    else if (i(0xc641, 0xc65b)) return LVT
                  }
                } else {
                  if (c < 0xc678) {
                    if (c < 0xc65d && 0xc65c === c) return LV
                    else if (i(0xc65d, 0xc677)) return LVT
                  } else {
                    if (c < 0xc679 && 0xc678 === c) return LV
                    else if (c < 0xc694 && i(0xc679, 0xc693)) return LVT
                    else if (0xc694 === c) return LV
                  }
                }
              } else {
                if (c < 0xc6e8) {
                  if (c < 0xc6b1) {
                    if (c < 0xc6b0 && i(0xc695, 0xc6af)) return LVT
                    else if (0xc6b0 === c) return LV
                  } else {
                    if (c < 0xc6cc && i(0xc6b1, 0xc6cb)) return LVT
                    else if (c < 0xc6cd && 0xc6cc === c) return LV
                    else if (i(0xc6cd, 0xc6e7)) return LVT
                  }
                } else {
                  if (c < 0xc705) {
                    if (c < 0xc6e9 && 0xc6e8 === c) return LV
                    else if (c < 0xc704 && i(0xc6e9, 0xc703)) return LVT
                    else if (0xc704 === c) return LV
                  } else {
                    if (c < 0xc720 && i(0xc705, 0xc71f)) return LVT
                    else if (c < 0xc721 && 0xc720 === c) return LV
                    else if (i(0xc721, 0xc73b)) return LVT
                  }
                }
              }
            } else {
              if (c < 0xc7c9) {
                if (c < 0xc775) {
                  if (c < 0xc758) {
                    if (c < 0xc73d && 0xc73c === c) return LV
                    else if (i(0xc73d, 0xc757)) return LVT
                  } else {
                    if (c < 0xc759 && 0xc758 === c) return LV
                    else if (c < 0xc774 && i(0xc759, 0xc773)) return LVT
                    else if (0xc774 === c) return LV
                  }
                } else {
                  if (c < 0xc7ac) {
                    if (c < 0xc790 && i(0xc775, 0xc78f)) return LVT
                    else if (c < 0xc791 && 0xc790 === c) return LV
                    else if (i(0xc791, 0xc7ab)) return LVT
                  } else {
                    if (c < 0xc7ad && 0xc7ac === c) return LV
                    else if (c < 0xc7c8 && i(0xc7ad, 0xc7c7)) return LVT
                    else if (0xc7c8 === c) return LV
                  }
                }
              } else {
                if (c < 0xc81c) {
                  if (c < 0xc7e5) {
                    if (c < 0xc7e4 && i(0xc7c9, 0xc7e3)) return LVT
                    else if (0xc7e4 === c) return LV
                  } else {
                    if (c < 0xc800 && i(0xc7e5, 0xc7ff)) return LVT
                    else if (c < 0xc801 && 0xc800 === c) return LV
                    else if (i(0xc801, 0xc81b)) return LVT
                  }
                } else {
                  if (c < 0xc839) {
                    if (c < 0xc81d && 0xc81c === c) return LV
                    else if (c < 0xc838 && i(0xc81d, 0xc837)) return LVT
                    else if (0xc838 === c) return LV
                  } else {
                    if (c < 0xc854 && i(0xc839, 0xc853)) return LVT
                    else if (c < 0xc855 && 0xc854 === c) return LV
                    else if (i(0xc855, 0xc86f)) return LVT
                  }
                }
              }
            }
          }
        }
      } else {
        if (c < 0xcd24) {
          if (c < 0xcabd) {
            if (c < 0xc989) {
              if (c < 0xc8fc) {
                if (c < 0xc8a9) {
                  if (c < 0xc88c) {
                    if (c < 0xc871 && 0xc870 === c) return LV
                    else if (i(0xc871, 0xc88b)) return LVT
                  } else {
                    if (c < 0xc88d && 0xc88c === c) return LV
                    else if (c < 0xc8a8 && i(0xc88d, 0xc8a7)) return LVT
                    else if (0xc8a8 === c) return LV
                  }
                } else {
                  if (c < 0xc8c5) {
                    if (c < 0xc8c4 && i(0xc8a9, 0xc8c3)) return LVT
                    else if (0xc8c4 === c) return LV
                  } else {
                    if (c < 0xc8e0 && i(0xc8c5, 0xc8df)) return LVT
                    else if (c < 0xc8e1 && 0xc8e0 === c) return LV
                    else if (i(0xc8e1, 0xc8fb)) return LVT
                  }
                }
              } else {
                if (c < 0xc935) {
                  if (c < 0xc918) {
                    if (c < 0xc8fd && 0xc8fc === c) return LV
                    else if (i(0xc8fd, 0xc917)) return LVT
                  } else {
                    if (c < 0xc919 && 0xc918 === c) return LV
                    else if (c < 0xc934 && i(0xc919, 0xc933)) return LVT
                    else if (0xc934 === c) return LV
                  }
                } else {
                  if (c < 0xc96c) {
                    if (c < 0xc950 && i(0xc935, 0xc94f)) return LVT
                    else if (c < 0xc951 && 0xc950 === c) return LV
                    else if (i(0xc951, 0xc96b)) return LVT
                  } else {
                    if (c < 0xc96d && 0xc96c === c) return LV
                    else if (c < 0xc988 && i(0xc96d, 0xc987)) return LVT
                    else if (0xc988 === c) return LV
                  }
                }
              }
            } else {
              if (c < 0xca30) {
                if (c < 0xc9dc) {
                  if (c < 0xc9a5) {
                    if (c < 0xc9a4 && i(0xc989, 0xc9a3)) return LVT
                    else if (0xc9a4 === c) return LV
                  } else {
                    if (c < 0xc9c0 && i(0xc9a5, 0xc9bf)) return LVT
                    else if (c < 0xc9c1 && 0xc9c0 === c) return LV
                    else if (i(0xc9c1, 0xc9db)) return LVT
                  }
                } else {
                  if (c < 0xc9f9) {
                    if (c < 0xc9dd && 0xc9dc === c) return LV
                    else if (c < 0xc9f8 && i(0xc9dd, 0xc9f7)) return LVT
                    else if (0xc9f8 === c) return LV
                  } else {
                    if (c < 0xca14 && i(0xc9f9, 0xca13)) return LVT
                    else if (c < 0xca15 && 0xca14 === c) return LV
                    else if (i(0xca15, 0xca2f)) return LVT
                  }
                }
              } else {
                if (c < 0xca69) {
                  if (c < 0xca4c) {
                    if (c < 0xca31 && 0xca30 === c) return LV
                    else if (i(0xca31, 0xca4b)) return LVT
                  } else {
                    if (c < 0xca4d && 0xca4c === c) return LV
                    else if (c < 0xca68 && i(0xca4d, 0xca67)) return LVT
                    else if (0xca68 === c) return LV
                  }
                } else {
                  if (c < 0xcaa0) {
                    if (c < 0xca84 && i(0xca69, 0xca83)) return LVT
                    else if (c < 0xca85 && 0xca84 === c) return LV
                    else if (i(0xca85, 0xca9f)) return LVT
                  } else {
                    if (c < 0xcaa1 && 0xcaa0 === c) return LV
                    else if (c < 0xcabc && i(0xcaa1, 0xcabb)) return LVT
                    else if (0xcabc === c) return LV
                  }
                }
              }
            }
          } else {
            if (c < 0xcbf0) {
              if (c < 0xcb49) {
                if (c < 0xcb10) {
                  if (c < 0xcad9) {
                    if (c < 0xcad8 && i(0xcabd, 0xcad7)) return LVT
                    else if (0xcad8 === c) return LV
                  } else {
                    if (c < 0xcaf4 && i(0xcad9, 0xcaf3)) return LVT
                    else if (c < 0xcaf5 && 0xcaf4 === c) return LV
                    else if (i(0xcaf5, 0xcb0f)) return LVT
                  }
                } else {
                  if (c < 0xcb2c) {
                    if (c < 0xcb11 && 0xcb10 === c) return LV
                    else if (i(0xcb11, 0xcb2b)) return LVT
                  } else {
                    if (c < 0xcb2d && 0xcb2c === c) return LV
                    else if (c < 0xcb48 && i(0xcb2d, 0xcb47)) return LVT
                    else if (0xcb48 === c) return LV
                  }
                }
              } else {
                if (c < 0xcb9c) {
                  if (c < 0xcb65) {
                    if (c < 0xcb64 && i(0xcb49, 0xcb63)) return LVT
                    else if (0xcb64 === c) return LV
                  } else {
                    if (c < 0xcb80 && i(0xcb65, 0xcb7f)) return LVT
                    else if (c < 0xcb81 && 0xcb80 === c) return LV
                    else if (i(0xcb81, 0xcb9b)) return LVT
                  }
                } else {
                  if (c < 0xcbb9) {
                    if (c < 0xcb9d && 0xcb9c === c) return LV
                    else if (c < 0xcbb8 && i(0xcb9d, 0xcbb7)) return LVT
                    else if (0xcbb8 === c) return LV
                  } else {
                    if (c < 0xcbd4 && i(0xcbb9, 0xcbd3)) return LVT
                    else if (c < 0xcbd5 && 0xcbd4 === c) return LV
                    else if (i(0xcbd5, 0xcbef)) return LVT
                  }
                }
              }
            } else {
              if (c < 0xcc7d) {
                if (c < 0xcc29) {
                  if (c < 0xcc0c) {
                    if (c < 0xcbf1 && 0xcbf0 === c) return LV
                    else if (i(0xcbf1, 0xcc0b)) return LVT
                  } else {
                    if (c < 0xcc0d && 0xcc0c === c) return LV
                    else if (c < 0xcc28 && i(0xcc0d, 0xcc27)) return LVT
                    else if (0xcc28 === c) return LV
                  }
                } else {
                  if (c < 0xcc60) {
                    if (c < 0xcc44 && i(0xcc29, 0xcc43)) return LVT
                    else if (c < 0xcc45 && 0xcc44 === c) return LV
                    else if (i(0xcc45, 0xcc5f)) return LVT
                  } else {
                    if (c < 0xcc61 && 0xcc60 === c) return LV
                    else if (c < 0xcc7c && i(0xcc61, 0xcc7b)) return LVT
                    else if (0xcc7c === c) return LV
                  }
                }
              } else {
                if (c < 0xccd0) {
                  if (c < 0xcc99) {
                    if (c < 0xcc98 && i(0xcc7d, 0xcc97)) return LVT
                    else if (0xcc98 === c) return LV
                  } else {
                    if (c < 0xccb4 && i(0xcc99, 0xccb3)) return LVT
                    else if (c < 0xccb5 && 0xccb4 === c) return LV
                    else if (i(0xccb5, 0xcccf)) return LVT
                  }
                } else {
                  if (c < 0xcced) {
                    if (c < 0xccd1 && 0xccd0 === c) return LV
                    else if (c < 0xccec && i(0xccd1, 0xcceb)) return LVT
                    else if (0xccec === c) return LV
                  } else {
                    if (c < 0xcd08 && i(0xcced, 0xcd07)) return LVT
                    else if (c < 0xcd09 && 0xcd08 === c) return LV
                    else if (i(0xcd09, 0xcd23)) return LVT
                  }
                }
              }
            }
          }
        } else {
          if (c < 0xcf71) {
            if (c < 0xce3d) {
              if (c < 0xcdb0) {
                if (c < 0xcd5d) {
                  if (c < 0xcd40) {
                    if (c < 0xcd25 && 0xcd24 === c) return LV
                    else if (i(0xcd25, 0xcd3f)) return LVT
                  } else {
                    if (c < 0xcd41 && 0xcd40 === c) return LV
                    else if (c < 0xcd5c && i(0xcd41, 0xcd5b)) return LVT
                    else if (0xcd5c === c) return LV
                  }
                } else {
                  if (c < 0xcd79) {
                    if (c < 0xcd78 && i(0xcd5d, 0xcd77)) return LVT
                    else if (0xcd78 === c) return LV
                  } else {
                    if (c < 0xcd94 && i(0xcd79, 0xcd93)) return LVT
                    else if (c < 0xcd95 && 0xcd94 === c) return LV
                    else if (i(0xcd95, 0xcdaf)) return LVT
                  }
                }
              } else {
                if (c < 0xcde9) {
                  if (c < 0xcdcc) {
                    if (c < 0xcdb1 && 0xcdb0 === c) return LV
                    else if (i(0xcdb1, 0xcdcb)) return LVT
                  } else {
                    if (c < 0xcdcd && 0xcdcc === c) return LV
                    else if (c < 0xcde8 && i(0xcdcd, 0xcde7)) return LVT
                    else if (0xcde8 === c) return LV
                  }
                } else {
                  if (c < 0xce20) {
                    if (c < 0xce04 && i(0xcde9, 0xce03)) return LVT
                    else if (c < 0xce05 && 0xce04 === c) return LV
                    else if (i(0xce05, 0xce1f)) return LVT
                  } else {
                    if (c < 0xce21 && 0xce20 === c) return LV
                    else if (c < 0xce3c && i(0xce21, 0xce3b)) return LVT
                    else if (0xce3c === c) return LV
                  }
                }
              }
            } else {
              if (c < 0xcee4) {
                if (c < 0xce90) {
                  if (c < 0xce59) {
                    if (c < 0xce58 && i(0xce3d, 0xce57)) return LVT
                    else if (0xce58 === c) return LV
                  } else {
                    if (c < 0xce74 && i(0xce59, 0xce73)) return LVT
                    else if (c < 0xce75 && 0xce74 === c) return LV
                    else if (i(0xce75, 0xce8f)) return LVT
                  }
                } else {
                  if (c < 0xcead) {
                    if (c < 0xce91 && 0xce90 === c) return LV
                    else if (c < 0xceac && i(0xce91, 0xceab)) return LVT
                    else if (0xceac === c) return LV
                  } else {
                    if (c < 0xcec8 && i(0xcead, 0xcec7)) return LVT
                    else if (c < 0xcec9 && 0xcec8 === c) return LV
                    else if (i(0xcec9, 0xcee3)) return LVT
                  }
                }
              } else {
                if (c < 0xcf1d) {
                  if (c < 0xcf00) {
                    if (c < 0xcee5 && 0xcee4 === c) return LV
                    else if (i(0xcee5, 0xceff)) return LVT
                  } else {
                    if (c < 0xcf01 && 0xcf00 === c) return LV
                    else if (c < 0xcf1c && i(0xcf01, 0xcf1b)) return LVT
                    else if (0xcf1c === c) return LV
                  }
                } else {
                  if (c < 0xcf54) {
                    if (c < 0xcf38 && i(0xcf1d, 0xcf37)) return LVT
                    else if (c < 0xcf39 && 0xcf38 === c) return LV
                    else if (i(0xcf39, 0xcf53)) return LVT
                  } else {
                    if (c < 0xcf55 && 0xcf54 === c) return LV
                    else if (c < 0xcf70 && i(0xcf55, 0xcf6f)) return LVT
                    else if (0xcf70 === c) return LV
                  }
                }
              }
            }
          } else {
            if (c < 0xd0a4) {
              if (c < 0xcffd) {
                if (c < 0xcfc4) {
                  if (c < 0xcf8d) {
                    if (c < 0xcf8c && i(0xcf71, 0xcf8b)) return LVT
                    else if (0xcf8c === c) return LV
                  } else {
                    if (c < 0xcfa8 && i(0xcf8d, 0xcfa7)) return LVT
                    else if (c < 0xcfa9 && 0xcfa8 === c) return LV
                    else if (i(0xcfa9, 0xcfc3)) return LVT
                  }
                } else {
                  if (c < 0xcfe0) {
                    if (c < 0xcfc5 && 0xcfc4 === c) return LV
                    else if (i(0xcfc5, 0xcfdf)) return LVT
                  } else {
                    if (c < 0xcfe1 && 0xcfe0 === c) return LV
                    else if (c < 0xcffc && i(0xcfe1, 0xcffb)) return LVT
                    else if (0xcffc === c) return LV
                  }
                }
              } else {
                if (c < 0xd050) {
                  if (c < 0xd019) {
                    if (c < 0xd018 && i(0xcffd, 0xd017)) return LVT
                    else if (0xd018 === c) return LV
                  } else {
                    if (c < 0xd034 && i(0xd019, 0xd033)) return LVT
                    else if (c < 0xd035 && 0xd034 === c) return LV
                    else if (i(0xd035, 0xd04f)) return LVT
                  }
                } else {
                  if (c < 0xd06d) {
                    if (c < 0xd051 && 0xd050 === c) return LV
                    else if (c < 0xd06c && i(0xd051, 0xd06b)) return LVT
                    else if (0xd06c === c) return LV
                  } else {
                    if (c < 0xd088 && i(0xd06d, 0xd087)) return LVT
                    else if (c < 0xd089 && 0xd088 === c) return LV
                    else if (i(0xd089, 0xd0a3)) return LVT
                  }
                }
              }
            } else {
              if (c < 0xd131) {
                if (c < 0xd0dd) {
                  if (c < 0xd0c0) {
                    if (c < 0xd0a5 && 0xd0a4 === c) return LV
                    else if (i(0xd0a5, 0xd0bf)) return LVT
                  } else {
                    if (c < 0xd0c1 && 0xd0c0 === c) return LV
                    else if (c < 0xd0dc && i(0xd0c1, 0xd0db)) return LVT
                    else if (0xd0dc === c) return LV
                  }
                } else {
                  if (c < 0xd114) {
                    if (c < 0xd0f8 && i(0xd0dd, 0xd0f7)) return LVT
                    else if (c < 0xd0f9 && 0xd0f8 === c) return LV
                    else if (i(0xd0f9, 0xd113)) return LVT
                  } else {
                    if (c < 0xd115 && 0xd114 === c) return LV
                    else if (c < 0xd130 && i(0xd115, 0xd12f)) return LVT
                    else if (0xd130 === c) return LV
                  }
                }
              } else {
                if (c < 0xd184) {
                  if (c < 0xd14d) {
                    if (c < 0xd14c && i(0xd131, 0xd14b)) return LVT
                    else if (0xd14c === c) return LV
                  } else {
                    if (c < 0xd168 && i(0xd14d, 0xd167)) return LVT
                    else if (c < 0xd169 && 0xd168 === c) return LV
                    else if (i(0xd169, 0xd183)) return LVT
                  }
                } else {
                  if (c < 0xd1a1) {
                    if (c < 0xd185 && 0xd184 === c) return LV
                    else if (c < 0xd1a0 && i(0xd185, 0xd19f)) return LVT
                    else if (0xd1a0 === c) return LV
                  } else {
                    if (c < 0xd1bc && i(0xd1a1, 0xd1bb)) return LVT
                    else if (c < 0xd1bd && 0xd1bc === c) return LV
                    else if (i(0xd1bd, 0xd1d7)) return LVT
                  }
                }
              }
            }
          }
        }
      }
    } else {
      if (c < 0x1133b) {
        if (c < 0xd671) {
          if (c < 0xd424) {
            if (c < 0xd2f1) {
              if (c < 0xd264) {
                if (c < 0xd211) {
                  if (c < 0xd1f4) {
                    if (c < 0xd1d9 && 0xd1d8 === c) return LV
                    else if (i(0xd1d9, 0xd1f3)) return LVT
                  } else {
                    if (c < 0xd1f5 && 0xd1f4 === c) return LV
                    else if (c < 0xd210 && i(0xd1f5, 0xd20f)) return LVT
                    else if (0xd210 === c) return LV
                  }
                } else {
                  if (c < 0xd22d) {
                    if (c < 0xd22c && i(0xd211, 0xd22b)) return LVT
                    else if (0xd22c === c) return LV
                  } else {
                    if (c < 0xd248 && i(0xd22d, 0xd247)) return LVT
                    else if (c < 0xd249 && 0xd248 === c) return LV
                    else if (i(0xd249, 0xd263)) return LVT
                  }
                }
              } else {
                if (c < 0xd29d) {
                  if (c < 0xd280) {
                    if (c < 0xd265 && 0xd264 === c) return LV
                    else if (i(0xd265, 0xd27f)) return LVT
                  } else {
                    if (c < 0xd281 && 0xd280 === c) return LV
                    else if (c < 0xd29c && i(0xd281, 0xd29b)) return LVT
                    else if (0xd29c === c) return LV
                  }
                } else {
                  if (c < 0xd2d4) {
                    if (c < 0xd2b8 && i(0xd29d, 0xd2b7)) return LVT
                    else if (c < 0xd2b9 && 0xd2b8 === c) return LV
                    else if (i(0xd2b9, 0xd2d3)) return LVT
                  } else {
                    if (c < 0xd2d5 && 0xd2d4 === c) return LV
                    else if (c < 0xd2f0 && i(0xd2d5, 0xd2ef)) return LVT
                    else if (0xd2f0 === c) return LV
                  }
                }
              }
            } else {
              if (c < 0xd37d) {
                if (c < 0xd344) {
                  if (c < 0xd30d) {
                    if (c < 0xd30c && i(0xd2f1, 0xd30b)) return LVT
                    else if (0xd30c === c) return LV
                  } else {
                    if (c < 0xd328 && i(0xd30d, 0xd327)) return LVT
                    else if (c < 0xd329 && 0xd328 === c) return LV
                    else if (i(0xd329, 0xd343)) return LVT
                  }
                } else {
                  if (c < 0xd360) {
                    if (c < 0xd345 && 0xd344 === c) return LV
                    else if (i(0xd345, 0xd35f)) return LVT
                  } else {
                    if (c < 0xd361 && 0xd360 === c) return LV
                    else if (c < 0xd37c && i(0xd361, 0xd37b)) return LVT
                    else if (0xd37c === c) return LV
                  }
                }
              } else {
                if (c < 0xd3d0) {
                  if (c < 0xd399) {
                    if (c < 0xd398 && i(0xd37d, 0xd397)) return LVT
                    else if (0xd398 === c) return LV
                  } else {
                    if (c < 0xd3b4 && i(0xd399, 0xd3b3)) return LVT
                    else if (c < 0xd3b5 && 0xd3b4 === c) return LV
                    else if (i(0xd3b5, 0xd3cf)) return LVT
                  }
                } else {
                  if (c < 0xd3ed) {
                    if (c < 0xd3d1 && 0xd3d0 === c) return LV
                    else if (c < 0xd3ec && i(0xd3d1, 0xd3eb)) return LVT
                    else if (0xd3ec === c) return LV
                  } else {
                    if (c < 0xd408 && i(0xd3ed, 0xd407)) return LVT
                    else if (c < 0xd409 && 0xd408 === c) return LV
                    else if (i(0xd409, 0xd423)) return LVT
                  }
                }
              }
            }
          } else {
            if (c < 0xd53d) {
              if (c < 0xd4b0) {
                if (c < 0xd45d) {
                  if (c < 0xd440) {
                    if (c < 0xd425 && 0xd424 === c) return LV
                    else if (i(0xd425, 0xd43f)) return LVT
                  } else {
                    if (c < 0xd441 && 0xd440 === c) return LV
                    else if (c < 0xd45c && i(0xd441, 0xd45b)) return LVT
                    else if (0xd45c === c) return LV
                  }
                } else {
                  if (c < 0xd479) {
                    if (c < 0xd478 && i(0xd45d, 0xd477)) return LVT
                    else if (0xd478 === c) return LV
                  } else {
                    if (c < 0xd494 && i(0xd479, 0xd493)) return LVT
                    else if (c < 0xd495 && 0xd494 === c) return LV
                    else if (i(0xd495, 0xd4af)) return LVT
                  }
                }
              } else {
                if (c < 0xd4e9) {
                  if (c < 0xd4cc) {
                    if (c < 0xd4b1 && 0xd4b0 === c) return LV
                    else if (i(0xd4b1, 0xd4cb)) return LVT
                  } else {
                    if (c < 0xd4cd && 0xd4cc === c) return LV
                    else if (c < 0xd4e8 && i(0xd4cd, 0xd4e7)) return LVT
                    else if (0xd4e8 === c) return LV
                  }
                } else {
                  if (c < 0xd520) {
                    if (c < 0xd504 && i(0xd4e9, 0xd503)) return LVT
                    else if (c < 0xd505 && 0xd504 === c) return LV
                    else if (i(0xd505, 0xd51f)) return LVT
                  } else {
                    if (c < 0xd521 && 0xd520 === c) return LV
                    else if (c < 0xd53c && i(0xd521, 0xd53b)) return LVT
                    else if (0xd53c === c) return LV
                  }
                }
              }
            } else {
              if (c < 0xd5e4) {
                if (c < 0xd590) {
                  if (c < 0xd559) {
                    if (c < 0xd558 && i(0xd53d, 0xd557)) return LVT
                    else if (0xd558 === c) return LV
                  } else {
                    if (c < 0xd574 && i(0xd559, 0xd573)) return LVT
                    else if (c < 0xd575 && 0xd574 === c) return LV
                    else if (i(0xd575, 0xd58f)) return LVT
                  }
                } else {
                  if (c < 0xd5ad) {
                    if (c < 0xd591 && 0xd590 === c) return LV
                    else if (c < 0xd5ac && i(0xd591, 0xd5ab)) return LVT
                    else if (0xd5ac === c) return LV
                  } else {
                    if (c < 0xd5c8 && i(0xd5ad, 0xd5c7)) return LVT
                    else if (c < 0xd5c9 && 0xd5c8 === c) return LV
                    else if (i(0xd5c9, 0xd5e3)) return LVT
                  }
                }
              } else {
                if (c < 0xd61d) {
                  if (c < 0xd600) {
                    if (c < 0xd5e5 && 0xd5e4 === c) return LV
                    else if (i(0xd5e5, 0xd5ff)) return LVT
                  } else {
                    if (c < 0xd601 && 0xd600 === c) return LV
                    else if (c < 0xd61c && i(0xd601, 0xd61b)) return LVT
                    else if (0xd61c === c) return LV
                  }
                } else {
                  if (c < 0xd654) {
                    if (c < 0xd638 && i(0xd61d, 0xd637)) return LVT
                    else if (c < 0xd639 && 0xd638 === c) return LV
                    else if (i(0xd639, 0xd653)) return LVT
                  } else {
                    if (c < 0xd655 && 0xd654 === c) return LV
                    else if (c < 0xd670 && i(0xd655, 0xd66f)) return LVT
                    else if (0xd670 === c) return LV
                  }
                }
              }
            }
          }
        } else {
          if (c < 0x11000) {
            if (c < 0xd7b0) {
              if (c < 0xd6fd) {
                if (c < 0xd6c4) {
                  if (c < 0xd68d) {
                    if (c < 0xd68c && i(0xd671, 0xd68b)) return LVT
                    else if (0xd68c === c) return LV
                  } else {
                    if (c < 0xd6a8 && i(0xd68d, 0xd6a7)) return LVT
                    else if (c < 0xd6a9 && 0xd6a8 === c) return LV
                    else if (i(0xd6a9, 0xd6c3)) return LVT
                  }
                } else {
                  if (c < 0xd6e0) {
                    if (c < 0xd6c5 && 0xd6c4 === c) return LV
                    else if (i(0xd6c5, 0xd6df)) return LVT
                  } else {
                    if (c < 0xd6e1 && 0xd6e0 === c) return LV
                    else if (c < 0xd6fc && i(0xd6e1, 0xd6fb)) return LVT
                    else if (0xd6fc === c) return LV
                  }
                }
              } else {
                if (c < 0xd750) {
                  if (c < 0xd719) {
                    if (c < 0xd718 && i(0xd6fd, 0xd717)) return LVT
                    else if (0xd718 === c) return LV
                  } else {
                    if (c < 0xd734 && i(0xd719, 0xd733)) return LVT
                    else if (c < 0xd735 && 0xd734 === c) return LV
                    else if (i(0xd735, 0xd74f)) return LVT
                  }
                } else {
                  if (c < 0xd76d) {
                    if (c < 0xd751 && 0xd750 === c) return LV
                    else if (c < 0xd76c && i(0xd751, 0xd76b)) return LVT
                    else if (0xd76c === c) return LV
                  } else {
                    if (c < 0xd788 && i(0xd76d, 0xd787)) return LVT
                    else if (c < 0xd789 && 0xd788 === c) return LV
                    else if (i(0xd789, 0xd7a3)) return LVT
                  }
                }
              }
            } else {
              if (c < 0x10a01) {
                if (c < 0xfeff) {
                  if (c < 0xfb1e) {
                    if (c < 0xd7cb && i(0xd7b0, 0xd7c6)) return V
                    else if (i(0xd7cb, 0xd7fb)) return T
                  } else {
                    if (c < 0xfe00 && 0xfb1e === c) return E
                    else if (c < 0xfe20 && i(0xfe00, 0xfe0f)) return E
                    else if (i(0xfe20, 0xfe2f)) return E
                  }
                } else {
                  if (c < 0x101fd) {
                    if (c < 0xff9e && 0xfeff === c) return C
                    else if (c < 0xfff0 && i(0xff9e, 0xff9f)) return E
                    else if (i(0xfff0, 0xfffb)) return C
                  } else {
                    if (c < 0x102e0 && 0x101fd === c) return E
                    else if (c < 0x10376 && 0x102e0 === c) return E
                    else if (i(0x10376, 0x1037a)) return E
                  }
                }
              } else {
                if (c < 0x10ae5) {
                  if (c < 0x10a0c) {
                    if (c < 0x10a05 && i(0x10a01, 0x10a03)) return E
                    else if (i(0x10a05, 0x10a06)) return E
                  } else {
                    if (c < 0x10a38 && i(0x10a0c, 0x10a0f)) return E
                    else if (c < 0x10a3f && i(0x10a38, 0x10a3a)) return E
                    else if (0x10a3f === c) return E
                  }
                } else {
                  if (c < 0x10efd) {
                    if (c < 0x10d24 && i(0x10ae5, 0x10ae6)) return E
                    else if (c < 0x10eab && i(0x10d24, 0x10d27)) return E
                    else if (i(0x10eab, 0x10eac)) return E
                  } else {
                    if (c < 0x10f46 && i(0x10efd, 0x10eff)) return E
                    else if (c < 0x10f82 && i(0x10f46, 0x10f50)) return E
                    else if (i(0x10f82, 0x10f85)) return E
                  }
                }
              }
            }
          } else {
            if (c < 0x11180) {
              if (c < 0x110b7) {
                if (c < 0x11073) {
                  if (c < 0x11002) {
                    if (0x11000 === c) return S
                    if (0x11001 === c) return E
                  } else {
                    if (c < 0x11038 && 0x11002 === c) return S
                    else if (c < 0x11070 && i(0x11038, 0x11046)) return E
                    else if (0x11070 === c) return E
                  }
                } else {
                  if (c < 0x11082) {
                    if (c < 0x1107f && i(0x11073, 0x11074)) return E
                    else if (i(0x1107f, 0x11081)) return E
                  } else {
                    if (c < 0x110b0 && 0x11082 === c) return S
                    else if (c < 0x110b3 && i(0x110b0, 0x110b2)) return S
                    else if (i(0x110b3, 0x110b6)) return E
                  }
                }
              } else {
                if (c < 0x11100) {
                  if (c < 0x110bd) {
                    if (c < 0x110b9 && i(0x110b7, 0x110b8)) return S
                    else if (i(0x110b9, 0x110ba)) return E
                  } else {
                    if (c < 0x110c2 && 0x110bd === c) return P
                    else if (0x110c2 === c) return E
                    else if (0x110cd === c) return P
                  }
                } else {
                  if (c < 0x1112d) {
                    if (c < 0x11127 && i(0x11100, 0x11102)) return E
                    else if (c < 0x1112c && i(0x11127, 0x1112b)) return E
                    else if (0x1112c === c) return S
                  } else {
                    if (c < 0x11145 && i(0x1112d, 0x11134)) return E
                    else if (c < 0x11173 && i(0x11145, 0x11146)) return S
                    else if (0x11173 === c) return E
                  }
                }
              }
            } else {
              if (c < 0x11232) {
                if (c < 0x111c2) {
                  if (c < 0x111b3) {
                    if (c < 0x11182 && i(0x11180, 0x11181)) return E
                    else if (0x11182 === c) return S
                  } else {
                    if (c < 0x111b6 && i(0x111b3, 0x111b5)) return S
                    else if (c < 0x111bf && i(0x111b6, 0x111be)) return E
                    else if (i(0x111bf, 0x111c0)) return S
                  }
                } else {
                  if (c < 0x111cf) {
                    if (c < 0x111c9 && i(0x111c2, 0x111c3)) return P
                    else if (c < 0x111ce && i(0x111c9, 0x111cc)) return E
                    else if (0x111ce === c) return S
                  } else {
                    if (c < 0x1122c && 0x111cf === c) return E
                    else if (c < 0x1122f && i(0x1122c, 0x1122e)) return S
                    else if (i(0x1122f, 0x11231)) return E
                  }
                }
              } else {
                if (c < 0x11241) {
                  if (c < 0x11235) {
                    if (c < 0x11234 && i(0x11232, 0x11233)) return S
                    else if (0x11234 === c) return E
                  } else {
                    if (c < 0x11236 && 0x11235 === c) return S
                    else if (c < 0x1123e && i(0x11236, 0x11237)) return E
                    else if (0x1123e === c) return E
                  }
                } else {
                  if (c < 0x112e3) {
                    if (c < 0x112df && 0x11241 === c) return E
                    else if (c < 0x112e0 && 0x112df === c) return E
                    else if (i(0x112e0, 0x112e2)) return S
                  } else {
                    if (c < 0x11300 && i(0x112e3, 0x112ea)) return E
                    else if (c < 0x11302 && i(0x11300, 0x11301)) return E
                    else if (i(0x11302, 0x11303)) return S
                  }
                }
              }
            }
          }
        }
      } else {
        if (c < 0x11a97) {
          if (c < 0x116ab) {
            if (c < 0x114b9) {
              if (c < 0x11370) {
                if (c < 0x11347) {
                  if (c < 0x1133f) {
                    if (c < 0x1133e && i(0x1133b, 0x1133c)) return E
                    else if (0x1133e === c) return E
                  } else {
                    if (c < 0x11340 && 0x1133f === c) return S
                    else if (c < 0x11341 && 0x11340 === c) return E
                    else if (i(0x11341, 0x11344)) return S
                  }
                } else {
                  if (c < 0x11357) {
                    if (c < 0x1134b && i(0x11347, 0x11348)) return S
                    else if (i(0x1134b, 0x1134d)) return S
                  } else {
                    if (c < 0x11362 && 0x11357 === c) return E
                    else if (c < 0x11366 && i(0x11362, 0x11363)) return S
                    else if (i(0x11366, 0x1136c)) return E
                  }
                }
              } else {
                if (c < 0x11445) {
                  if (c < 0x11438) {
                    if (c < 0x11435 && i(0x11370, 0x11374)) return E
                    else if (i(0x11435, 0x11437)) return S
                  } else {
                    if (c < 0x11440 && i(0x11438, 0x1143f)) return E
                    else if (c < 0x11442 && i(0x11440, 0x11441)) return S
                    else if (i(0x11442, 0x11444)) return E
                  }
                } else {
                  if (c < 0x114b0) {
                    if (c < 0x11446 && 0x11445 === c) return S
                    else if (0x11446 === c) return E
                    else if (0x1145e === c) return E
                  } else {
                    if (c < 0x114b1 && 0x114b0 === c) return E
                    else if (c < 0x114b3 && i(0x114b1, 0x114b2)) return S
                    else if (i(0x114b3, 0x114b8)) return E
                  }
                }
              }
            } else {
              if (c < 0x115b8) {
                if (c < 0x114bf) {
                  if (c < 0x114bb) {
                    if (0x114b9 === c) return S
                    if (0x114ba === c) return E
                  } else {
                    if (c < 0x114bd && i(0x114bb, 0x114bc)) return S
                    else if (0x114bd === c) return E
                    else if (0x114be === c) return S
                  }
                } else {
                  if (c < 0x115af) {
                    if (c < 0x114c1 && i(0x114bf, 0x114c0)) return E
                    else if (c < 0x114c2 && 0x114c1 === c) return S
                    else if (i(0x114c2, 0x114c3)) return E
                  } else {
                    if (c < 0x115b0 && 0x115af === c) return E
                    else if (c < 0x115b2 && i(0x115b0, 0x115b1)) return S
                    else if (i(0x115b2, 0x115b5)) return E
                  }
                }
              } else {
                if (c < 0x11630) {
                  if (c < 0x115be) {
                    if (c < 0x115bc && i(0x115b8, 0x115bb)) return S
                    else if (i(0x115bc, 0x115bd)) return E
                  } else {
                    if (c < 0x115bf && 0x115be === c) return S
                    else if (c < 0x115dc && i(0x115bf, 0x115c0)) return E
                    else if (i(0x115dc, 0x115dd)) return E
                  }
                } else {
                  if (c < 0x1163d) {
                    if (c < 0x11633 && i(0x11630, 0x11632)) return S
                    else if (c < 0x1163b && i(0x11633, 0x1163a)) return E
                    else if (i(0x1163b, 0x1163c)) return S
                  } else {
                    if (c < 0x1163e && 0x1163d === c) return E
                    else if (c < 0x1163f && 0x1163e === c) return S
                    else if (i(0x1163f, 0x11640)) return E
                  }
                }
              }
            }
          } else {
            if (c < 0x1193f) {
              if (c < 0x11727) {
                if (c < 0x116b6) {
                  if (c < 0x116ad) {
                    if (0x116ab === c) return E
                    if (0x116ac === c) return S
                  } else {
                    if (c < 0x116ae && 0x116ad === c) return E
                    else if (c < 0x116b0 && i(0x116ae, 0x116af)) return S
                    else if (i(0x116b0, 0x116b5)) return E
                  }
                } else {
                  if (c < 0x1171d) {
                    if (0x116b6 === c) return S
                    if (0x116b7 === c) return E
                  } else {
                    if (c < 0x11722 && i(0x1171d, 0x1171f)) return E
                    else if (c < 0x11726 && i(0x11722, 0x11725)) return E
                    else if (0x11726 === c) return S
                  }
                }
              } else {
                if (c < 0x11930) {
                  if (c < 0x1182f) {
                    if (c < 0x1182c && i(0x11727, 0x1172b)) return E
                    else if (i(0x1182c, 0x1182e)) return S
                  } else {
                    if (c < 0x11838 && i(0x1182f, 0x11837)) return E
                    else if (c < 0x11839 && 0x11838 === c) return S
                    else if (i(0x11839, 0x1183a)) return E
                  }
                } else {
                  if (c < 0x1193b) {
                    if (c < 0x11931 && 0x11930 === c) return E
                    else if (c < 0x11937 && i(0x11931, 0x11935)) return S
                    else if (i(0x11937, 0x11938)) return S
                  } else {
                    if (c < 0x1193d && i(0x1193b, 0x1193c)) return E
                    else if (0x1193d === c) return S
                    else if (0x1193e === c) return E
                  }
                }
              }
            } else {
              if (c < 0x11a01) {
                if (c < 0x119d1) {
                  if (c < 0x11941) {
                    if (0x1193f === c) return P
                    if (0x11940 === c) return S
                  } else {
                    if (c < 0x11942 && 0x11941 === c) return P
                    else if (0x11942 === c) return S
                    else if (0x11943 === c) return E
                  }
                } else {
                  if (c < 0x119dc) {
                    if (c < 0x119d4 && i(0x119d1, 0x119d3)) return S
                    else if (c < 0x119da && i(0x119d4, 0x119d7)) return E
                    else if (i(0x119da, 0x119db)) return E
                  } else {
                    if (c < 0x119e0 && i(0x119dc, 0x119df)) return S
                    else if (0x119e0 === c) return E
                    else if (0x119e4 === c) return S
                  }
                }
              } else {
                if (c < 0x11a47) {
                  if (c < 0x11a39) {
                    if (c < 0x11a33 && i(0x11a01, 0x11a0a)) return E
                    else if (i(0x11a33, 0x11a38)) return E
                  } else {
                    if (c < 0x11a3a && 0x11a39 === c) return S
                    else if (c < 0x11a3b && 0x11a3a === c) return P
                    else if (i(0x11a3b, 0x11a3e)) return E
                  }
                } else {
                  if (c < 0x11a59) {
                    if (c < 0x11a51 && 0x11a47 === c) return E
                    else if (c < 0x11a57 && i(0x11a51, 0x11a56)) return E
                    else if (i(0x11a57, 0x11a58)) return S
                  } else {
                    if (c < 0x11a84 && i(0x11a59, 0x11a5b)) return E
                    else if (c < 0x11a8a && i(0x11a84, 0x11a89)) return P
                    else if (i(0x11a8a, 0x11a96)) return E
                  }
                }
              }
            }
          }
        } else {
          if (c < 0x16f51) {
            if (c < 0x11d90) {
              if (c < 0x11cb1) {
                if (c < 0x11c3e) {
                  if (c < 0x11c2f) {
                    if (c < 0x11a98 && 0x11a97 === c) return S
                    else if (i(0x11a98, 0x11a99)) return E
                  } else {
                    if (c < 0x11c30 && 0x11c2f === c) return S
                    else if (c < 0x11c38 && i(0x11c30, 0x11c36)) return E
                    else if (i(0x11c38, 0x11c3d)) return E
                  }
                } else {
                  if (c < 0x11c92) {
                    if (0x11c3e === c) return S
                    if (0x11c3f === c) return E
                  } else {
                    if (c < 0x11ca9 && i(0x11c92, 0x11ca7)) return E
                    else if (c < 0x11caa && 0x11ca9 === c) return S
                    else if (i(0x11caa, 0x11cb0)) return E
                  }
                }
              } else {
                if (c < 0x11d3a) {
                  if (c < 0x11cb4) {
                    if (c < 0x11cb2 && 0x11cb1 === c) return S
                    else if (i(0x11cb2, 0x11cb3)) return E
                  } else {
                    if (c < 0x11cb5 && 0x11cb4 === c) return S
                    else if (c < 0x11d31 && i(0x11cb5, 0x11cb6)) return E
                    else if (i(0x11d31, 0x11d36)) return E
                  }
                } else {
                  if (c < 0x11d46) {
                    if (c < 0x11d3c && 0x11d3a === c) return E
                    else if (c < 0x11d3f && i(0x11d3c, 0x11d3d)) return E
                    else if (i(0x11d3f, 0x11d45)) return E
                  } else {
                    if (c < 0x11d47 && 0x11d46 === c) return P
                    else if (c < 0x11d8a && 0x11d47 === c) return E
                    else if (i(0x11d8a, 0x11d8e)) return S
                  }
                }
              }
            } else {
              if (c < 0x11f36) {
                if (c < 0x11ef3) {
                  if (c < 0x11d95) {
                    if (c < 0x11d93 && i(0x11d90, 0x11d91)) return E
                    else if (i(0x11d93, 0x11d94)) return S
                  } else {
                    if (c < 0x11d96 && 0x11d95 === c) return E
                    else if (0x11d96 === c) return S
                    else if (0x11d97 === c) return E
                  }
                } else {
                  if (c < 0x11f02) {
                    if (c < 0x11ef5 && i(0x11ef3, 0x11ef4)) return E
                    else if (c < 0x11f00 && i(0x11ef5, 0x11ef6)) return S
                    else if (i(0x11f00, 0x11f01)) return E
                  } else {
                    if (c < 0x11f03 && 0x11f02 === c) return P
                    else if (c < 0x11f34 && 0x11f03 === c) return S
                    else if (i(0x11f34, 0x11f35)) return S
                  }
                }
              } else {
                if (c < 0x13430) {
                  if (c < 0x11f40) {
                    if (c < 0x11f3e && i(0x11f36, 0x11f3a)) return E
                    else if (i(0x11f3e, 0x11f3f)) return S
                  } else {
                    if (c < 0x11f41 && 0x11f40 === c) return E
                    else if (0x11f41 === c) return S
                    else if (0x11f42 === c) return E
                  }
                } else {
                  if (c < 0x16af0) {
                    if (c < 0x13440 && i(0x13430, 0x1343f)) return C
                    else if (c < 0x13447 && 0x13440 === c) return E
                    else if (i(0x13447, 0x13455)) return E
                  } else {
                    if (c < 0x16b30 && i(0x16af0, 0x16af4)) return E
                    else if (c < 0x16f4f && i(0x16b30, 0x16b36)) return E
                    else if (0x16f4f === c) return E
                  }
                }
              }
            }
          } else {
            if (c < 0x1da84) {
              if (c < 0x1d167) {
                if (c < 0x1bca0) {
                  if (c < 0x16fe4) {
                    if (c < 0x16f8f && i(0x16f51, 0x16f87)) return S
                    else if (i(0x16f8f, 0x16f92)) return E
                  } else {
                    if (c < 0x16ff0 && 0x16fe4 === c) return E
                    else if (c < 0x1bc9d && i(0x16ff0, 0x16ff1)) return S
                    else if (i(0x1bc9d, 0x1bc9e)) return E
                  }
                } else {
                  if (c < 0x1cf30) {
                    if (c < 0x1cf00 && i(0x1bca0, 0x1bca3)) return C
                    else if (i(0x1cf00, 0x1cf2d)) return E
                  } else {
                    if (c < 0x1d165 && i(0x1cf30, 0x1cf46)) return E
                    else if (0x1d165 === c) return E
                    else if (0x1d166 === c) return S
                  }
                }
              } else {
                if (c < 0x1d185) {
                  if (c < 0x1d16e) {
                    if (c < 0x1d16d && i(0x1d167, 0x1d169)) return E
                    else if (0x1d16d === c) return S
                  } else {
                    if (c < 0x1d173 && i(0x1d16e, 0x1d172)) return E
                    else if (c < 0x1d17b && i(0x1d173, 0x1d17a)) return C
                    else if (i(0x1d17b, 0x1d182)) return E
                  }
                } else {
                  if (c < 0x1da00) {
                    if (c < 0x1d1aa && i(0x1d185, 0x1d18b)) return E
                    else if (c < 0x1d242 && i(0x1d1aa, 0x1d1ad)) return E
                    else if (i(0x1d242, 0x1d244)) return E
                  } else {
                    if (c < 0x1da3b && i(0x1da00, 0x1da36)) return E
                    else if (c < 0x1da75 && i(0x1da3b, 0x1da6c)) return E
                    else if (0x1da75 === c) return E
                  }
                }
              }
            } else {
              if (c < 0x1e2ec) {
                if (c < 0x1e01b) {
                  if (c < 0x1daa1) {
                    if (c < 0x1da9b && 0x1da84 === c) return E
                    else if (i(0x1da9b, 0x1da9f)) return E
                  } else {
                    if (c < 0x1e000 && i(0x1daa1, 0x1daaf)) return E
                    else if (c < 0x1e008 && i(0x1e000, 0x1e006)) return E
                    else if (i(0x1e008, 0x1e018)) return E
                  }
                } else {
                  if (c < 0x1e08f) {
                    if (c < 0x1e023 && i(0x1e01b, 0x1e021)) return E
                    else if (c < 0x1e026 && i(0x1e023, 0x1e024)) return E
                    else if (i(0x1e026, 0x1e02a)) return E
                  } else {
                    if (c < 0x1e130 && 0x1e08f === c) return E
                    else if (c < 0x1e2ae && i(0x1e130, 0x1e136)) return E
                    else if (0x1e2ae === c) return E
                  }
                }
              } else {
                if (c < 0x1f3fb) {
                  if (c < 0x1e8d0) {
                    if (c < 0x1e4ec && i(0x1e2ec, 0x1e2ef)) return E
                    else if (i(0x1e4ec, 0x1e4ef)) return E
                  } else {
                    if (c < 0x1e944 && i(0x1e8d0, 0x1e8d6)) return E
                    else if (c < 0x1f1e6 && i(0x1e944, 0x1e94a)) return E
                    else if (i(0x1f1e6, 0x1f1ff)) return R
                  }
                } else {
                  if (c < 0xe0080) {
                    if (c < 0xe0000 && i(0x1f3fb, 0x1f3ff)) return E
                    else if (c < 0xe0020 && i(0xe0000, 0xe001f)) return C
                    else if (i(0xe0020, 0xe007f)) return E
                  } else {
                    if (c < 0xe0100 && i(0xe0080, 0xe00ff)) return C
                    else if (c < 0xe01f0 && i(0xe0100, 0xe01ef)) return E
                    else if (i(0xe01f0, 0xe0fff)) return C
                  }
                }
              }
            }
          }
        }
      }
    }
  }
  return OTHER
}

/**
 * Given a Unicode code point, returns if symbol is an extended pictographic or some other break
 * @param code {number} Unicode code point
 * @returns {number}
 */
function getEmojiProperty(code) {
  const c = code
  const { OTHER } = CLUSTER_BREAK
  const E = EXTENDED_PICTOGRAPHIC

  function i (a, b) {
    return a <= c && c <= b
  }

  if (c < 0x27b0) {
    if (c < 0x2600) {
      if (c < 0x2328) {
        if (c < 0x2122) {
          if (c < 0x203c) {
            if (0xa9 === c) return E
            if (0xae === c) return E
          } else {
            if (0x203c === c) return E
            else if (0x2049 === c) return E
          }
        } else {
          if (c < 0x2194) {
            if (0x2122 === c) return E
            if (0x2139 === c) return E
          } else {
            if (c < 0x21a9 && i(0x2194, 0x2199)) return E
            else if (c < 0x231a && i(0x21a9, 0x21aa)) return E
            else if (i(0x231a, 0x231b)) return E
          }
        }
      } else {
        if (c < 0x24c2) {
          if (c < 0x23cf) {
            if (0x2328 === c) return E
            if (0x2388 === c) return E
          } else {
            if (c < 0x23e9 && 0x23cf === c) return E
            else if (c < 0x23f8 && i(0x23e9, 0x23f3)) return E
            else if (i(0x23f8, 0x23fa)) return E
          }
        } else {
          if (c < 0x25b6) {
            if (c < 0x25aa && 0x24c2 === c) return E
            else if (i(0x25aa, 0x25ab)) return E
          } else {
            if (c < 0x25c0 && 0x25b6 === c) return E
            else if (c < 0x25fb && 0x25c0 === c) return E
            else if (i(0x25fb, 0x25fe)) return E
          }
        }
      }
    } else {
      if (c < 0x2733) {
        if (c < 0x2714) {
          if (c < 0x2614) {
            if (c < 0x2607 && i(0x2600, 0x2605)) return E
            else if (i(0x2607, 0x2612)) return E
          } else {
            if (c < 0x2690 && i(0x2614, 0x2685)) return E
            else if (c < 0x2708 && i(0x2690, 0x2705)) return E
            else if (i(0x2708, 0x2712)) return E
          }
        } else {
          if (c < 0x271d) {
            if (0x2714 === c) return E
            if (0x2716 === c) return E
          } else {
            if (c < 0x2721 && 0x271d === c) return E
            else if (0x2721 === c) return E
            else if (0x2728 === c) return E
          }
        }
      } else {
        if (c < 0x2753) {
          if (c < 0x2747) {
            if (c < 0x2744 && i(0x2733, 0x2734)) return E
            else if (0x2744 === c) return E
          } else {
            if (c < 0x274c && 0x2747 === c) return E
            else if (0x274c === c) return E
            else if (0x274e === c) return E
          }
        } else {
          if (c < 0x2763) {
            if (c < 0x2757 && i(0x2753, 0x2755)) return E
            else if (0x2757 === c) return E
          } else {
            if (c < 0x2795 && i(0x2763, 0x2767)) return E
            else if (c < 0x27a1 && i(0x2795, 0x2797)) return E
            else if (0x27a1 === c) return E
          }
        }
      }
    }
  } else {
    if (c < 0x1f201) {
      if (c < 0x3297) {
        if (c < 0x2b1b) {
          if (c < 0x2934) {
            if (0x27b0 === c) return E
            if (0x27bf === c) return E
          } else if (c < 0x2b05 && i(0x2934, 0x2935)) return E
 else if (i(0x2b05, 0x2b07)) return E
        } else {
          if (c < 0x2b55) {
            if (c < 0x2b50 && i(0x2b1b, 0x2b1c)) return E
            else if (0x2b50 === c) return E
          } else {
            if (c < 0x3030 && 0x2b55 === c) return E
            else if (0x3030 === c) return E
            else if (0x303d === c) return E
          }
        }
      } else {
        if (c < 0x1f16c) {
          if (c < 0x1f000) {
            if (0x3297 === c) return E
            if (0x3299 === c) return E
          } else {
            if (c < 0x1f10d && i(0x1f000, 0x1f0ff)) return E
            else if (c < 0x1f12f && i(0x1f10d, 0x1f10f)) return E
            else if (0x1f12f === c) return E
          }
        } else {
          if (c < 0x1f18e) {
            if (c < 0x1f17e && i(0x1f16c, 0x1f171)) return E
            else if (i(0x1f17e, 0x1f17f)) return E
          } else {
            if (c < 0x1f191 && 0x1f18e === c) return E
            else if (c < 0x1f1ad && i(0x1f191, 0x1f19a)) return E
            else if (i(0x1f1ad, 0x1f1e5)) return E
          }
        }
      }
    } else {
      if (c < 0x1f7d5) {
        if (c < 0x1f249) {
          if (c < 0x1f22f) {
            if (c < 0x1f21a && i(0x1f201, 0x1f20f)) return E
            else if (0x1f21a === c) return E
          } else {
            if (c < 0x1f232 && 0x1f22f === c) return E
            else if (c < 0x1f23c && i(0x1f232, 0x1f23a)) return E
            else if (i(0x1f23c, 0x1f23f)) return E
          }
        } else {
          if (c < 0x1f546) {
            if (c < 0x1f400 && i(0x1f249, 0x1f3fa)) return E
            else if (i(0x1f400, 0x1f53d)) return E
          } else {
            if (c < 0x1f680 && i(0x1f546, 0x1f64f)) return E
            else if (c < 0x1f774 && i(0x1f680, 0x1f6ff)) return E
            else if (i(0x1f774, 0x1f77f)) return E
          }
        }
      } else {
        if (c < 0x1f8ae) {
          if (c < 0x1f848) {
            if (c < 0x1f80c && i(0x1f7d5, 0x1f7ff)) return E
            else if (i(0x1f80c, 0x1f80f)) return E
          } else {
            if (c < 0x1f85a && i(0x1f848, 0x1f84f)) return E
            else if (c < 0x1f888 && i(0x1f85a, 0x1f85f)) return E
            else if (i(0x1f888, 0x1f88f)) return E
          }
        } else {
          if (c < 0x1f93c) {
            if (c < 0x1f90c && i(0x1f8ae, 0x1f8ff)) return E
            else if (i(0x1f90c, 0x1f93a)) return E
          } else {
            if (c < 0x1f947 && i(0x1f93c, 0x1f945)) return E
            else if (c < 0x1fc00 && i(0x1f947, 0x1faff)) return E
            else if (i(0x1fc00, 0x1fffd)) return E
          }
        }
      }
    }
  }
  return OTHER
}

