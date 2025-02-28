module.exports = (function() {
var __MODS__ = {};
var __DEFINE__ = function(modId, func, req) { var m = { exports: {}, _tempexports: {} }; __MODS__[modId] = { status: 0, func: func, req: req, m: m }; };
var __REQUIRE__ = function(modId, source) { if(!__MODS__[modId]) return require(source); if(!__MODS__[modId].status) { var m = __MODS__[modId].m; m._exports = m._tempexports; var desp = Object.getOwnPropertyDescriptor(m, "exports"); if (desp && desp.configurable) Object.defineProperty(m, "exports", { set: function (val) { if(typeof val === "object" && val !== m._exports) { m._exports.__proto__ = val.__proto__; Object.keys(val).forEach(function (k) { m._exports[k] = val[k]; }); } m._tempexports = val }, get: function () { return m._tempexports; } }); __MODS__[modId].status = 1; __MODS__[modId].func(__MODS__[modId].req, m, m.exports); } return __MODS__[modId].m.exports; };
var __REQUIRE_WILDCARD__ = function(obj) { if(obj && obj.__esModule) { return obj; } else { var newObj = {}; if(obj != null) { for(var k in obj) { if (Object.prototype.hasOwnProperty.call(obj, k)) newObj[k] = obj[k]; } } newObj.default = obj; return newObj; } };
var __REQUIRE_DEFAULT__ = function(obj) { return obj && obj.__esModule ? obj.default : obj; };
__DEFINE__(1740739901106, function(require, module, exports) {
// @ts-check
if (!exports.__esModule) Object.defineProperty(exports, "__esModule", { value: true });var __TEMP__ = require('./grapheme.js');Object.keys(__TEMP__).forEach(function(k) { if (k === "default" || k === "__esModule") return; Object.defineProperty(exports, k, { enumerable: true, configurable: true, get: function() { return __TEMP__[k]; } }); });

}, function(modId) {var map = {"./grapheme.js":1740739901107}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1740739901107, function(require, module, exports) {
// Copyright 2012-2018 The Rust Project Developers. See the COPYRIGHT
// file at the top-level directory of this distribution and at
// http://rust-lang.org/COPYRIGHT.
//
// Licensed under the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>.
//
// Modified original Rust library [source code]
// (https://github.com/unicode-rs/unicode-segmentation/blob/1f88570/src/grapheme.rs)
//
// to create JavaScript library [unicode-segmenter]
// (https://github.com/cometkim/unicode-segmenter)

// @ts-check

var __TEMP__ = require('./core.js');var searchUnicodeRange = __TEMP__['searchUnicodeRange'];
var __TEMP__ = require('./utils.js');var isBMP = __TEMP__['isBMP'];
var __TEMP__ = require('./_grapheme_data.js');var GraphemeCategory = __TEMP__['GraphemeCategory'];var findGraphemeIndex = __TEMP__['findGraphemeIndex'];var grapheme_buffer = __TEMP__['grapheme_buffer'];var grapheme_cats = __TEMP__['grapheme_cats'];





var __TEMP__ = require('./_incb_data.js');var consonant_buffer = __TEMP__['consonant_buffer'];



/**
 * @typedef {import('./_grapheme_data.js').GC_Any} GC_Any
 *
 * @typedef {import('./_grapheme_data.js').GraphemeCategoryNum} GraphemeCategoryNum
 * @typedef {import('./_grapheme_data.js').GraphemeCategoryRange} GraphemeCategoryRange
 *
 * @typedef {object} GraphemeSegmentExtra
 * @property {GraphemeCategoryNum} _catBegin Beginning Grapheme_Cluster_Break category of the segment
 * @property {GraphemeCategoryNum} _catEnd Ending Grapheme_Cluster_Break category of the segment
 *
 * @typedef {import('./core.js').Segmenter<GraphemeSegmentExtra>} GraphemeSegmenter
 */

if (!exports.__esModule) Object.defineProperty(exports, "__esModule", { value: true });Object.defineProperty(exports, 'searchGrapheme', { enumerable: true, configurable: true, get: function() { return searchGraphemeCategory; } });Object.defineProperty(exports, 'GraphemeCategory', { enumerable: true, configurable: true, get: function() { return GraphemeCategory; } });







/**
 * @deprecated DO NOT USE directly, will be removed in v1
 * @param {number} cp
 * @return A {@link GraphemeCategoryRange} value if found, or garbage value with {@link GC_Any} category.
 */
if (!exports.__esModule) Object.defineProperty(exports, "__esModule", { value: true });function searchGraphemeCategory(cp) {
  let index = findGraphemeIndex(cp);
  if (index < 0) {
    return [0, 0, 0 /* GC_Any */];
  }
  return [
    grapheme_buffer[index],
    grapheme_buffer[index + 1],
    grapheme_cats[index >> 1],
  ];
};exports.searchGraphemeCategory = searchGraphemeCategory

/**
 * Unicode segmentation by extended grapheme rules.
 *
 * This is fully compatible with the {@link Intl.Segmenter.segment} API
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/Segmenter/segment
 *
 * @param {string} input
 * @return {GraphemeSegmenter} iterator for grapheme cluster segments
 */
if (!exports.__esModule) Object.defineProperty(exports, "__esModule", { value: true });function* graphemeSegments(input) {
  // do nothing on empty string
  if (input === '') {
    return;
  }

  /** @type {number} Current cursor position. */
  let cursor = 0;

  /** @type {number} Total length of the input string. */
  let len = input.length;

  /** @type {GraphemeCategoryNum | null} Category of codepoint immediately preceding cursor, if known. */
  let catBefore = null;

  /** @type {GraphemeCategoryNum | null} Category of codepoint immediately preceding cursor, if known. */
  let catAfter = null;

  /** @type {GraphemeCategoryNum | null} Beginning category of a segment */
  let catBegin = null;

  /** @type {import('./_grapheme_data.js').GraphemeCategoryRange} */
  let cache = [0, 0, 2 /* GC_Control */];

  /** @type {number} The number of RIS codepoints preceding `cursor`. */
  let risCount = 0;

  /** Emoji state */
  let emoji = false;

  /** InCB=Consonant */
  let consonant = false;

  /** InCB=Linker */
  let linker = false;

  /** InCB=Consonant InCB=Linker x InCB=Consonant */
  let incb = false;

  let cp = /** @type number */ (input.codePointAt(cursor));

  let index = 0;
  let segment = '';

  while (true) {
    segment += input[cursor++];
    if (!isBMP(cp)) {
      segment += input[cursor++];
    }

    // Note: Of course the nullish coalescing is useful here,
    // but avoid it for aggressive compatibility and perf claim
    catBefore = catAfter;
    if (catBefore === null) {
      catBefore = cat(cp, cache);
      catBegin = catBefore;
    }

    // Note: Lazily update `consonant` and `linker` state
    // which is a extra overhead only for Hindi text.
    if (!consonant && catBefore === 0) {
      consonant = isIndicConjunctCosonant(cp);
    } else if (catBefore === 3 /* Extend */) {
      // Note: \p{InCB=Linker} is a subset of \p{Extend}
      linker = isIndicConjunctLinker(cp);
    }

    if (cursor < len) {
      cp = /** @type {number} */ (input.codePointAt(cursor));
      catAfter = cat(cp, cache);
    } else {
      yield {
        segment,
        index,
        input,
        _catBegin: /** @type {typeof catBefore} */ (catBegin),
        _catEnd: catBefore,
      };
      return;
    }

    if (catBefore === 10 /* Regional_Indicator */) {
      risCount += 1;
    } else {
      risCount = 0;
      if (
        catAfter === 14 /* ZWJ */
        && (catBefore === 3 /* Extend */ || catBefore === 4 /* Extended_Pictographic */)
      ) {
        emoji = true;

      } else if (catAfter === 0 /* Any */) {
        // Note: Put GB9c rule checking here to reduce.
        incb = consonant && linker && (consonant = isIndicConjunctCosonant(cp));
        // It cannot be both a linker and a consonant.
        linker = linker && !consonant;
      }
    }

    if (isBoundary(catBefore, catAfter, risCount, emoji, incb)) {
      yield {
        segment,
        index,
        input,
        _catBegin: /** @type {typeof catBefore} */ (catBegin),
        _catEnd: catBefore,
      };

      // flush
      index = cursor;
      segment = '';
      emoji = false;
      incb = false;
      catBegin = catAfter;
    }
  }
};exports.graphemeSegments = graphemeSegments

/**
 * Count number of extended grapheme clusters in given text.
 *
 * NOTE:
 *
 * This function is a small wrapper around {@link graphemeSegments}.
 *
 * If you call it more than once at a time, consider memoization
 * or use {@link graphemeSegments} or {@link splitGraphemes} once instead
 *
 * @param {string} text
 * @return {number} count of grapheme clusters
 */
if (!exports.__esModule) Object.defineProperty(exports, "__esModule", { value: true });function countGraphemes(text) {
  let count = 0;
  for (let _ of graphemeSegments(text)) count += 1;
  return count;
};exports.countGraphemes = countGraphemes

if (!exports.__esModule) Object.defineProperty(exports, "__esModule", { value: true });Object.defineProperty(exports, 'countGrapheme', { enumerable: true, configurable: true, get: function() { return countGraphemes; } });






/**
 * Split given text into extended grapheme clusters.
 *
 * @param {string} text
 * @return {IterableIterator<string>} iterator for grapheme clusters
 *
 * @see {@link graphemeSegments} if you need extra information.
 *
 * @example
 * [...splitGraphemes('abc')] // => ['a', 'b', 'c']
 */
if (!exports.__esModule) Object.defineProperty(exports, "__esModule", { value: true });function* splitGraphemes(text) {
  for (let s of graphemeSegments(text)) yield s.segment;
};exports.splitGraphemes = splitGraphemes

/**
 * `Grapheme_Cluster_Break` property value of a given codepoint
 *
 * @see https://www.unicode.org/reports/tr29/tr29-43.html#Default_Grapheme_Cluster_Table
 *
 * @param {number} cp
 * @param {import('./_grapheme_data.js').GraphemeCategoryRange} cache
 * @return {GraphemeCategoryNum}
 */
function cat(cp, cache) {
  if (cp < 127) {
    // Special-case optimization for ascii, except U+007F.  This
    // improves performance even for many primarily non-ascii texts,
    // due to use of punctuation and white space characters from the
    // ascii range.
    if (cp >= 32) {
      return 0 /* GC_Any */;
    } else if (cp === 10) {
      return 6 /* GC_LF */;
    } else if (cp === 13) {
      return 1 /* GC_CR */;
    } else {
      return 2 /* GC_Control */;
    }
  } else {
    // If this char isn't within the cached range, update the cache to the
    // range that includes it.
    if (cp < cache[0] || cp > cache[1]) {
      let index = findGraphemeIndex(cp);

      if (index < 0) {
        return 0;
      }

      cache[0] = grapheme_buffer[index];
      cache[1] = grapheme_buffer[index + 1];
      cache[2] = /** @type {GraphemeCategoryNum} */ (grapheme_cats[index >> 1]);
    }
    return cache[2];
  }
};

/**
 * @param {number} cp
 * @return {boolean}
 */
function isIndicConjunctCosonant(cp) {
  return searchUnicodeRange(cp, consonant_buffer) >= 0;
}

/**
 * @param {number} cp
 * @return {boolean}
 */
function isIndicConjunctLinker(cp) {
  return (
    cp === 2381 /* 0x094D */ ||
    cp === 2509 /* 0x09CD */ ||
    cp === 2765 /* 0x0ACD */ ||
    cp === 2893 /* 0x0B4D */ ||
    cp === 3149 /* 0x0C4D */ ||
    cp === 3405 /* 0x0D4D */
  );
}

/**
 * @param {GraphemeCategoryNum} catBefore
 * @param {GraphemeCategoryNum} catAfter
 * @param {number} risCount Regional_Indicator state
 * @param {boolean} emoji Extended_Pictographic state
 * @param {boolean} incb Indic_Conjunct_Break state
 * @return {boolean}
 *
 * @see https://www.unicode.org/reports/tr29/tr29-43.html#Grapheme_Cluster_Boundary_Rules
 */
function isBoundary(catBefore, catAfter, risCount, emoji, incb) {
  // GB3
  if (catBefore === 1 && catAfter === 6) {
    return false;
  }

  // GB4
  if (catBefore === 1 || catBefore === 2 || catBefore === 6) {
    return true;
  }

  // GB5
  if (catAfter === 1 || catAfter === 2 || catAfter === 6) {
    return true;
  }

  // GB6
  if (
    catBefore === 5 &&
    (catAfter === 5 || catAfter === 7 || catAfter === 8 || catAfter === 13)
  ) {
    return false;
  }

  // GB7
  if (
    (catBefore === 7 || catBefore === 13) &&
    (catAfter === 12 || catAfter === 13)
  ) {
    return false;
  }

  // GB8
  if (
    catAfter === 12 &&
    (catBefore === 8 || catBefore === 12)
  ) {
    return false;
  }

  // GB9
  if (catAfter === 3 || catAfter === 14) {
    return false;
  }

  // GB9a
  if (catAfter === 11) {
    return false;
  }

  // GB9b
  if (catBefore === 9) {
    return false;
  }

  // GB9c
  if (catAfter === 0 && incb) {
    return false;
  }

  // GB11
  if (catBefore === 14 && catAfter === 4) {
    return !emoji;
  }

  // GB12, GB13
  if (catBefore === 10 && catAfter === 10) {
    return risCount % 2 === 0;
  }

  // GB999
  return true;
}

}, function(modId) { var map = {"./core.js":1740739901108,"./utils.js":1740739901109,"./_grapheme_data.js":1740739901110,"./_incb_data.js":1740739901111}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1740739901108, function(require, module, exports) {
// @ts-check

/**
 * @typedef {[from: number, to: number]} UnicodeRange
 *
 * [from..to] code points included
 */

/**
 * @template {number} T
 * @typedef {[fro: number, to: number, category: T]} CategorizedUnicodeRange
 */

/**
 * @typedef {string & { __tag: 'LookupTableEncoding' }} LookupTableEncoding
 *
 * Base36 encoded {@link LookupTableBuffer} data. It's a sequence of `base36(code point)` with separators.
 *
 * Separator can be omitted if each value is small (=< 36)
 */

/**
 * @typedef {Array<number> & { __tag: 'LookupTableBuffer' }} LookupTableBuffer
 *
 * Value lookup table serialized into a TypedArray
 */

/**
 * @typedef {Array<number> & { __tag: 'UnicodeRangeBuffer' }} UnicodeRangeBuffer
 *
 * {@link UnicodeRange} data serialized into a TypedArray
 *
 * It's a dense array like `[from,to,from,to,...]`
 * So always has an even length and is quantized into 2-items chunks.
 *
 * The pairs must be sorted in ascending order to allow binary search. 
 */

/**
 * @typedef {string & { __tag: 'UnicodeRangeEncoding' }} UnicodeRangeEncoding
 *
 * Base36 encoded {@link UnicodeRangeBuffer} data. It's a sequence of `base36(code point),base36(padding)`
 *
 * Value `0` is represented as empty strings
 */

/**
 * @template {object} Ext
 * @typedef {{
 *   segment: string,
 *   index: number,
 *   input: string,
 * } & Ext} SegmentOutput
 */

/**
 * @template {object} T
 * @typedef {IterableIterator<SegmentOutput<T>>} Segmenter
 */

/**
 * @template {number} T
 * @param {T} x
 * @param {UnicodeRangeBuffer} buffer
 * @param {number} [sliceFrom]
 * @param {number} [sliceTo]
 * @return {number} index of including range, or -(low+1) if there isn't
 */
if (!exports.__esModule) Object.defineProperty(exports, "__esModule", { value: true });function searchUnicodeRange(x, buffer, sliceFrom = 0, sliceTo = buffer.length) {
  let lo = sliceFrom;
  let hi = sliceTo - 2;

  while (lo <= hi) {
    let mid = lo + hi >> 1 & ~1;
    let l = buffer[mid], h = buffer[mid + 1];
    if (l <= x && x <= h) {
      return mid;
    } else if (h < x) {
      lo = mid + 2;
    } else {
      hi = mid - 2;
    }
  }

  return -lo - 1;
};exports.searchUnicodeRange = searchUnicodeRange

/**
 * @param {Array<number>} buffer 
 * @param {LookupTableEncoding} value
 * @param {'' | ','} [sep = '']
 * @return {LookupTableBuffer}
 */
if (!exports.__esModule) Object.defineProperty(exports, "__esModule", { value: true });function initLookupTableBuffer(buffer, value, sep = '') {
  let nums = value.split(sep).map(s => s ? parseInt(s, 36) : 0);
  for (let i = 0; i < nums.length; i++)
    buffer[i] = nums[i];
  return /** @type {LookupTableBuffer} */ (buffer);
};exports.initLookupTableBuffer = initLookupTableBuffer;

/**
 * @param {Array<number>} buffer
 * @param {UnicodeRangeEncoding} value
 * @return {UnicodeRangeBuffer}
 */
if (!exports.__esModule) Object.defineProperty(exports, "__esModule", { value: true });function initUnicodeRangeBuffer(buffer, value) {
  let nums = value.split(',').map(s => s ? parseInt(s, 36) : 0);
  for (let i = 0, n = 0; i < nums.length; i++)
    buffer[i] = i % 2 ? n + nums[i] : (n = nums[i]);
  return /** @type {UnicodeRangeBuffer} */ (buffer);
};exports.initUnicodeRangeBuffer = initUnicodeRangeBuffer;

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1740739901109, function(require, module, exports) {
// @ts-check

/**
 * Take a Unicode code point from the given input by cursor
 *
 * @deprecated
 * Use this only if `String.prototype.codePointAt()` isn't available on the host environment
 *
 * @param {string} input
 * @param {number} cursor
 * @param {number} [length] length of input
 * @return {number} a code point of the character
 */
if (!exports.__esModule) Object.defineProperty(exports, "__esModule", { value: true });function takeCodePoint(input, cursor, length = input.length) {
  let hi = input.charCodeAt(cursor);
  if (isHighSurrogate(hi)) {
    if (cursor + 1 < length) {
      let lo = input.charCodeAt(cursor + 1);
      if (isLowSurrogate(lo)) {
        return surrogatePairToCodePoint(hi, lo);
      }
    }
  }
  return hi;
};exports.takeCodePoint = takeCodePoint

/**
 * Take a UTF-8 char from the given input by cursor
 *
 * @deprecated
 * Use this only if `String.fromCodePoint()` isn't available on the host environment
 *
 * @param {string} input
 * @param {number} cursor
 * @param {number} [length] length of input
 * @return {string} a UTF-8 character (its `.length` will be 1 or 2)
 */
if (!exports.__esModule) Object.defineProperty(exports, "__esModule", { value: true });function takeChar(input, cursor, length = input.length) {
  let hi = input.charCodeAt(cursor);
  if (isHighSurrogate(hi)) {
    if (cursor + 1 < length) {
      let lo = input.charCodeAt(cursor + 1);
      if (isLowSurrogate(lo)) {
        // This seems to be much slower in V8
        // return String.fromCharCode(hi, lo);
        return String.fromCharCode(hi) + String.fromCharCode(lo);
      }
    }
  }
  return String.fromCharCode(hi);
};exports.takeChar = takeChar

/** 
 * @param {number} c UTF-16 code point
 */
if (!exports.__esModule) Object.defineProperty(exports, "__esModule", { value: true });function isHighSurrogate(c) {
  return 0xd800 <= c && c <= 0xdbff;
};exports.isHighSurrogate = isHighSurrogate

/** 
 * @param {number} c UTF-16 code point
 */
if (!exports.__esModule) Object.defineProperty(exports, "__esModule", { value: true });function isLowSurrogate(c) {
  return 0xdc00 <= c && c <= 0xdfff;
};exports.isLowSurrogate = isLowSurrogate

/** 
 * @param {number} hi high surrogate
 * @param {number} lo low surrogate
 */
if (!exports.__esModule) Object.defineProperty(exports, "__esModule", { value: true });function surrogatePairToCodePoint(hi, lo) {
  return ((hi - 0xd800) << 10) + (lo - 0xdc00) + 0x10000;
};exports.surrogatePairToCodePoint = surrogatePairToCodePoint

/**
 * Check if given code point is within the BMP(Basic Multilingual Plane)
 *
 * @param {number} c Unicode code point
 * @return {boolean}
 */
if (!exports.__esModule) Object.defineProperty(exports, "__esModule", { value: true });function isBMP(c) {
  return c <= 0xffff;
};exports.isBMP = isBMP

/**
 * Check if given code point is within the SMP(Supplementary Multilingual Plane)
 *
 * @param {number} c Unicode code point
 * @return {boolean}
 */
if (!exports.__esModule) Object.defineProperty(exports, "__esModule", { value: true });function isSMP(c) {
  return 0x10000 <= c && c <= 0x1ffff;
};exports.isSMP = isSMP

/**
 * Check if given code point is within the SIP(Supplementary Ideographic Plane)
 *
 * @param {number} c Unicode code point
 * @return {boolean}
 */
if (!exports.__esModule) Object.defineProperty(exports, "__esModule", { value: true });function isSIP(c) {
  return 0x20000 <= c && c <= 0x2ffff;
};exports.isSIP = isSIP

/**
 * Check if given code point is within the TIP(Tertiary Ideographic Plane)
 *
 * @param {number} c Unicode code point
 * @return {boolean}
 */
if (!exports.__esModule) Object.defineProperty(exports, "__esModule", { value: true });function isTIP(c) {
  return 0x30000 <= c && c <= 0x3ffff;
};exports.isTIP = isTIP

/**
 * Check if given code point is within the SSP(Supplementary Special-purpose Plane)
 *
 * @param {number} c Unicode code point
 * @return {boolean}
 */
if (!exports.__esModule) Object.defineProperty(exports, "__esModule", { value: true });function isSSP(c) {
  return 0xe0000 <= c && c <= 0xeffff;
};exports.isSSP = isSSP

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1740739901110, function(require, module, exports) {
// The following code was generated by "scripts/unicode.js",
// DO NOT EDIT DIRECTLY.
//
// @ts-check

var __TEMP__ = require('./core.js');var searchUnicodeRange = __TEMP__['searchUnicodeRange'];var initLookupTableBuffer = __TEMP__['initLookupTableBuffer'];var initUnicodeRangeBuffer = __TEMP__['initUnicodeRangeBuffer'];





/**
 * @typedef {import('./core.js').LookupTableEncoding} LookupTableEncoding
 * @typedef {import('./core.js').UnicodeRangeEncoding} UnicodeRangeEncoding
 */

/**
 * @typedef {0} GC_Any
 * @typedef {1} GC_CR
 * @typedef {2} GC_Control
 * @typedef {3} GC_Extend
 * @typedef {4} GC_Extended_Pictographic
 * @typedef {5} GC_L
 * @typedef {6} GC_LF
 * @typedef {7} GC_LV
 * @typedef {8} GC_LVT
 * @typedef {9} GC_Prepend
 * @typedef {10} GC_Regional_Indicator
 * @typedef {11} GC_SpacingMark
 * @typedef {12} GC_T
 * @typedef {13} GC_V
 * @typedef {14} GC_ZWJ
 * @typedef {(
 *   | GC_Any
 *   | GC_CR
 *   | GC_Control
 *   | GC_Extend
 *   | GC_Extended_Pictographic
 *   | GC_L
 *   | GC_LF
 *   | GC_LV
 *   | GC_LVT
 *   | GC_Prepend
 *   | GC_Regional_Indicator
 *   | GC_SpacingMark
 *   | GC_T
 *   | GC_V
 *   | GC_ZWJ
 * )} GraphemeCategoryNum
 */

/**
 * @typedef {import('./core.js').CategorizedUnicodeRange<GraphemeCategoryNum>} GraphemeCategoryRange
 */

/**
 * @typedef {(
 *   | 'Any'
 *   | 'CR'
 *   | 'Control'
 *   | 'Extend'
 *   | 'Extended_Pictographic'
 *   | 'L'
 *   | 'LF'
 *   | 'LV'
 *   | 'LVT'
 *   | 'Prepend'
 *   | 'Regional_Indicator'
 *   | 'SpacingMark'
 *   | 'T'
 *   | 'V'
 *   | 'ZWJ'
 * )} GraphemeCategoryKey
 */

/**
 * Grapheme category enum
 *
 * Note: The enum object is not actually `Object.freeze`
 * because it increases 800 bytes of Brotli compression... Not sure why :P
 *
 * @type {Readonly<Record<GraphemeCategoryKey, GraphemeCategoryNum>>}
 */
if (!exports.__esModule) Object.defineProperty(exports, "__esModule", { value: true });var GraphemeCategory = exports.GraphemeCategory = {
  Any: 0,
  CR: 1,
  Control: 2,
  Extend: 3,
  Extended_Pictographic: 4,
  L: 5,
  LF: 6,
  LV: 7,
  LVT: 8,
  Prepend: 9,
  Regional_Indicator: 10,
  SpacingMark: 11,
  T: 12,
  V: 13,
  ZWJ: 14,
};

if (!exports.__esModule) Object.defineProperty(exports, "__esModule", { value: true });var grapheme_buffer = exports.grapheme_buffer = initUnicodeRangeBuffer(
  Array(2908),
  /** @type {UnicodeRangeEncoding} */
  (',9,a,,b,1,d,,e,h,3j,w,4p,,4t,,4u,,lc,33,w3,6,13l,18,14v,,14x,1,150,1,153,,16o,5,174,a,17g,,18r,k,19s,,1cm,6,1ct,,1cv,5,1d3,1,1d6,3,1e7,,1e9,,1f4,q,1ie,a,1kb,8,1kt,,1li,3,1ln,8,1lx,2,1m1,4,1nd,2,1ow,1,1p3,8,1qi,n,1r6,,1r7,v,1s3,,1tm,,1tn,,1to,,1tq,2,1tt,7,1u1,3,1u5,,1u6,1,1u9,6,1uq,1,1vl,,1vm,1,1x8,,1xa,,1xb,1,1xd,3,1xj,1,1xn,1,1xp,,1xz,,1ya,1,1z2,,1z5,1,1z7,,20s,,20u,2,20x,1,213,1,217,2,21d,,228,1,22d,,22p,1,22r,,24c,,24e,2,24h,4,24n,1,24p,,24r,1,24t,,25e,1,262,5,269,,26a,1,27w,,27y,1,280,,281,3,287,1,28b,1,28d,,28l,2,28y,1,29u,,2bi,,2bj,,2bk,,2bl,1,2bq,2,2bu,2,2bx,,2c7,,2dc,,2dd,2,2dg,,2f0,,2f2,2,2f5,3,2fa,2,2fe,3,2fp,1,2g2,1,2gx,,2gy,1,2ik,,2im,,2in,1,2ip,,2iq,,2ir,1,2iu,2,2iy,3,2j9,1,2jm,1,2k3,,2kg,1,2ki,1,2m3,1,2m6,,2m7,1,2m9,3,2me,2,2mi,2,2ml,,2mm,,2mv,,2n6,1,2o1,,2o2,1,2q2,,2q7,,2q8,1,2qa,2,2qe,,2qg,6,2qn,,2r6,1,2sx,,2sz,,2t0,6,2tj,7,2wh,,2wj,,2wk,8,2x4,6,2zc,1,305,,307,,309,,30e,1,31t,d,327,,328,4,32e,1,32l,a,32x,z,346,,371,3,375,,376,5,37d,1,37f,1,37h,1,386,1,388,1,38e,2,38x,3,39e,,39g,,39h,1,39p,,3a5,,3cw,2n,3fk,1z,3hk,2f,3tp,2,4k2,3,4ky,2,4lu,1,4mq,1,4ok,1,4om,,4on,6,4ou,7,4p2,,4p3,1,4p5,a,4pp,,4qz,2,4r2,,4r3,,4ud,1,4vd,,4yo,2,4yr,3,4yv,1,4yx,2,4z4,1,4z6,,4z7,5,4zd,2,55j,1,55l,1,55n,,579,,57a,,57b,,57c,6,57k,,57m,,57p,7,57x,5,583,9,58f,,59s,u,5c0,3,5c4,,5dg,9,5dq,3,5du,2,5ez,8,5fk,1,5fm,,5gh,,5gi,3,5gm,1,5go,5,5ie,,5if,,5ig,1,5ii,2,5il,,5im,,5in,4,5k4,7,5kc,7,5kk,1,5km,1,5ow,2,5p0,c,5pd,,5pe,6,5pp,,5pw,,5pz,,5q0,1,5vk,1r,6bv,,6bw,,6bx,,6by,1,6co,6,6d8,,6dl,,6e8,f,6hc,w,6jm,,6k9,,6ms,5,6nd,1,6xm,1,6y0,,70o,,72n,,73d,a,73s,2,79e,,7fu,1,7g6,,7gg,,7i3,3,7i8,5,7if,b,7is,35,7m8,39,7pk,a,7pw,,7py,,7q5,,7q9,,7qg,,7qr,1,7r8,,7rb,,7rg,,7ri,,7rn,2,7rr,,7s3,4,7th,2,7tt,,7u8,,7un,,850,1,8hx,2,8ij,1,8k0,,8k5,,8vj,2,8zj,,928,v,9ii,5,9io,,9j1,,9ll,1,9zr,,9zt,,wvj,3,wvo,9,wwu,1,wz4,1,x6q,,x6u,,x6z,,x7n,1,x7p,1,x7r,,x7w,,xa8,1,xbo,f,xc4,1,xcw,h,xdr,,xeu,7,xfr,a,xg2,,xg3,,xgg,s,xhc,2,xhf,,xir,,xis,1,xiu,3,xiy,1,xj0,1,xj2,1,xj4,,xk5,,xm1,5,xm7,1,xm9,1,xmb,1,xmd,1,xmr,,xn0,,xn1,,xoc,,xps,,xpu,2,xpz,1,xq6,1,xq9,,xrf,,xrg,1,xri,1,xrp,,xrq,,xyb,1,xyd,,xye,1,xyg,,xyh,1,xyk,,xyl,,xz4,,xz5,q,xzw,,xzx,q,y0o,,y0p,q,y1g,,y1h,q,y28,,y29,q,y30,,y31,q,y3s,,y3t,q,y4k,,y4l,q,y5c,,y5d,q,y64,,y65,q,y6w,,y6x,q,y7o,,y7p,q,y8g,,y8h,q,y98,,y99,q,ya0,,ya1,q,yas,,yat,q,ybk,,ybl,q,ycc,,ycd,q,yd4,,yd5,q,ydw,,ydx,q,yeo,,yep,q,yfg,,yfh,q,yg8,,yg9,q,yh0,,yh1,q,yhs,,yht,q,yik,,yil,q,yjc,,yjd,q,yk4,,yk5,q,ykw,,ykx,q,ylo,,ylp,q,ymg,,ymh,q,yn8,,yn9,q,yo0,,yo1,q,yos,,yot,q,ypk,,ypl,q,yqc,,yqd,q,yr4,,yr5,q,yrw,,yrx,q,yso,,ysp,q,ytg,,yth,q,yu8,,yu9,q,yv0,,yv1,q,yvs,,yvt,q,ywk,,ywl,q,yxc,,yxd,q,yy4,,yy5,q,yyw,,yyx,q,yzo,,yzp,q,z0g,,z0h,q,z18,,z19,q,z20,,z21,q,z2s,,z2t,q,z3k,,z3l,q,z4c,,z4d,q,z54,,z55,q,z5w,,z5x,q,z6o,,z6p,q,z7g,,z7h,q,z88,,z89,q,z90,,z91,q,z9s,,z9t,q,zak,,zal,q,zbc,,zbd,q,zc4,,zc5,q,zcw,,zcx,q,zdo,,zdp,q,zeg,,zeh,q,zf8,,zf9,q,zg0,,zg1,q,zgs,,zgt,q,zhk,,zhl,q,zic,,zid,q,zj4,,zj5,q,zjw,,zjx,q,zko,,zkp,q,zlg,,zlh,q,zm8,,zm9,q,zn0,,zn1,q,zns,,znt,q,zok,,zol,q,zpc,,zpd,q,zq4,,zq5,q,zqw,,zqx,q,zro,,zrp,q,zsg,,zsh,q,zt8,,zt9,q,zu0,,zu1,q,zus,,zut,q,zvk,,zvl,q,zwc,,zwd,q,zx4,,zx5,q,zxw,,zxx,q,zyo,,zyp,q,zzg,,zzh,q,1008,,1009,q,1010,,1011,q,101s,,101t,q,102k,,102l,q,103c,,103d,q,1044,,1045,q,104w,,104x,q,105o,,105p,q,106g,,106h,q,1078,,1079,q,1080,,1081,q,108s,,108t,q,109k,,109l,q,10ac,,10ad,q,10b4,,10b5,q,10bw,,10bx,q,10co,,10cp,q,10dg,,10dh,q,10e8,,10e9,q,10f0,,10f1,q,10fs,,10ft,q,10gk,,10gl,q,10hc,,10hd,q,10i4,,10i5,q,10iw,,10ix,q,10jo,,10jp,q,10kg,,10kh,q,10l8,,10l9,q,10m0,,10m1,q,10ms,,10mt,q,10nk,,10nl,q,10oc,,10od,q,10p4,,10p5,q,10pw,,10px,q,10qo,,10qp,q,10rg,,10rh,q,10s8,,10s9,q,10t0,,10t1,q,10ts,,10tt,q,10uk,,10ul,q,10vc,,10vd,q,10w4,,10w5,q,10ww,,10wx,q,10xo,,10xp,q,10yg,,10yh,q,10z8,,10z9,q,1100,,1101,q,110s,,110t,q,111k,,111l,q,112c,,112d,q,1134,,1135,q,113w,,113x,q,114o,,114p,q,115g,,115h,q,1168,,1169,q,1170,,1171,q,117s,,117t,q,118k,,118l,q,119c,,119d,q,11a4,,11a5,q,11aw,,11ax,q,11bo,,11bp,q,11cg,,11ch,q,11d8,,11d9,q,11e0,,11e1,q,11es,,11et,q,11fk,,11fl,q,11gc,,11gd,q,11h4,,11h5,q,11hw,,11hx,q,11io,,11ip,q,11jg,,11jh,q,11k8,,11k9,q,11l0,,11l1,q,11ls,,11lt,q,11mk,,11ml,q,11nc,,11nd,q,11o4,,11o5,q,11ow,,11ox,q,11po,,11pp,q,11qg,,11qh,q,11r8,,11r9,q,11s0,,11s1,q,11ss,,11st,q,11tk,,11tl,q,11uc,,11ud,q,11v4,,11v5,q,11vw,,11vx,q,11wo,,11wp,q,11xg,,11xh,q,11y8,,11y9,q,11z0,,11z1,q,11zs,,11zt,q,120k,,120l,q,121c,,121d,q,1224,,1225,q,122w,,122x,q,123o,,123p,q,124g,,124h,q,1258,,1259,q,1260,,1261,q,126s,,126t,q,127k,,127l,q,128c,,128d,q,1294,,1295,q,129w,,129x,q,12ao,,12ap,q,12bg,,12bh,q,12c8,,12c9,q,12d0,,12d1,q,12ds,,12dt,q,12ek,,12el,q,12fc,,12fd,q,12g4,,12g5,q,12gw,,12gx,q,12ho,,12hp,q,12ig,,12ih,q,12j8,,12j9,q,12k0,,12k1,q,12ks,,12kt,q,12lk,,12ll,q,12mc,,12md,q,12n4,,12n5,q,12nw,,12nx,q,12oo,,12op,q,12pg,,12ph,q,12q8,,12q9,q,12r0,,12r1,q,12rs,,12rt,q,12sk,,12sl,q,12tc,,12td,q,12u4,,12u5,q,12uw,,12ux,q,12vo,,12vp,q,12wg,,12wh,q,12x8,,12x9,q,12y0,,12y1,q,12ys,,12yt,q,12zk,,12zl,q,130c,,130d,q,1314,,1315,q,131w,,131x,q,132o,,132p,q,133g,,133h,q,1348,,1349,q,1350,,1351,q,135s,,135t,q,136k,,136l,q,137c,,137d,q,1384,,1385,q,138w,,138x,q,139o,,139p,q,13ag,,13ah,q,13b8,,13b9,q,13c0,,13c1,q,13cs,,13ct,q,13dk,,13dl,q,13ec,,13ed,q,13f4,,13f5,q,13fw,,13fx,q,13go,,13gp,q,13hg,,13hh,q,13i8,,13i9,q,13j0,,13j1,q,13js,,13jt,q,13kk,,13kl,q,13lc,,13ld,q,13m4,,13m5,q,13mw,,13mx,q,13no,,13np,q,13og,,13oh,q,13p8,,13p9,q,13q0,,13q1,q,13qs,,13qt,q,13rk,,13rl,q,13sc,,13sd,q,13t4,,13t5,q,13tw,,13tx,q,13uo,,13up,q,13vg,,13vh,q,13w8,,13w9,q,13x0,,13x1,q,13xs,,13xt,q,13yk,,13yl,q,13zc,,13zd,q,1404,,1405,q,140w,,140x,q,141o,,141p,q,142g,,142h,q,1438,,1439,q,1440,,1441,q,144s,,144t,q,145k,,145l,q,146c,,146d,q,1474,,1475,q,147w,,147x,q,148o,,148p,q,149g,,149h,q,14a8,,14a9,q,14b0,,14b1,q,14bs,,14bt,q,14ck,,14cl,q,14dc,,14dd,q,14e4,,14e5,q,14ew,,14ex,q,14fo,,14fp,q,14gg,,14gh,q,14h8,,14h9,q,14i0,,14i1,q,14is,,14it,q,14jk,,14jl,q,14kc,,14kd,q,14l4,,14l5,q,14lw,,14lx,q,14mo,,14mp,q,14ng,,14nh,q,14o8,,14o9,q,14p0,,14p1,q,14ps,,14pt,q,14qk,,14ql,q,14rc,,14rd,q,14s4,,14s5,q,14sw,,14sx,q,14to,,14tp,q,14ug,,14uh,q,14v8,,14v9,q,14w0,,14w1,q,14ws,,14wt,q,14xk,,14xl,q,14yc,,14yd,q,14z4,,14z5,q,14zw,,14zx,q,150o,,150p,q,151g,,151h,q,1528,,1529,q,1530,,1531,q,153s,,153t,q,154k,,154l,q,155c,,155d,q,1564,,1565,q,156w,,156x,q,157o,,157p,q,158g,,158h,q,1598,,1599,q,15a0,,15a1,q,15as,,15at,q,15bk,,15bl,q,15cc,,15cd,q,15d4,,15d5,q,15dw,,15dx,q,15eo,,15ep,q,15fg,,15fh,q,15g8,,15g9,q,15h0,,15h1,q,15hs,,15ht,q,15ik,,15il,q,15jc,,15jd,q,15k4,,15k5,q,15kw,,15kx,q,15lo,,15lp,q,15mg,,15mh,q,15n8,,15n9,q,15o0,,15o1,q,15os,,15ot,q,15pk,,15pl,q,15qc,,15qd,q,15r4,,15r5,q,15rw,,15rx,q,15so,,15sp,q,15tg,,15th,q,15u8,,15u9,q,15v0,,15v1,q,15vs,,15vt,q,15wk,,15wl,q,15xc,,15xd,q,15y4,,15y5,q,15yw,,15yx,q,15zo,,15zp,q,160g,,160h,q,1618,,1619,q,1620,,1621,q,162s,,162t,q,163k,,163l,q,164c,,164d,q,1654,,1655,q,165w,,165x,q,166o,,166p,q,167g,,167h,q,1688,,1689,q,1690,,1691,q,169s,,169t,q,16ak,,16al,q,16bc,,16bd,q,16c4,,16c5,q,16cw,,16cx,q,16do,,16dp,q,16eg,,16eh,q,16f8,,16f9,q,16g0,,16g1,q,16gs,,16gt,q,16hk,,16hl,q,16ic,,16id,q,16j4,,16j5,q,16jw,,16jx,q,16ko,,16kp,q,16ls,m,16mj,1c,1dlq,,1e68,f,1e74,f,1edb,,1ehq,1,1ek0,b,1eyl,,1f4w,,1f92,4,1gjl,2,1gjp,1,1gjw,3,1gl4,2,1glb,,1gpx,1,1h5w,3,1h7t,4,1hgr,1,1hj0,3,1hl2,a,1hmq,3,1hq8,,1hq9,,1hqa,,1hrs,e,1htc,,1htf,1,1htr,2,1htu,,1hv4,2,1hv7,3,1hvb,1,1hvd,1,1hvh,,1hvm,,1hvx,,1hxc,2,1hyf,4,1hyk,,1hyl,7,1hz9,1,1i0j,,1i0w,1,1i0y,,1i2b,2,1i2e,8,1i2n,,1i2o,,1i2q,1,1i2x,3,1i32,,1i33,,1i5o,2,1i5r,2,1i5u,1,1i5w,3,1i66,,1i69,,1ian,,1iao,2,1iar,7,1ibk,1,1ibm,1,1id7,1,1ida,,1idb,,1idc,,1idd,3,1idj,1,1idn,1,1idp,,1idz,,1iea,1,1iee,6,1ieo,4,1igo,,1igp,1,1igr,5,1igy,,1ih1,,1ih3,2,1ih6,,1ih8,1,1iha,2,1ihd,,1ihe,,1iht,1,1ik5,2,1ik8,7,1ikg,1,1iki,2,1ikl,,1ikm,,1ila,,1ink,,1inl,1,1inn,5,1int,,1inu,,1inv,1,1inx,,1iny,,1inz,1,1io1,,1io2,1,1iun,,1iuo,1,1iuq,3,1iuw,3,1iv0,1,1iv2,,1iv3,1,1ivw,1,1iy8,2,1iyb,7,1iyj,1,1iyl,,1iym,,1iyn,1,1j1n,,1j1o,,1j1p,,1j1q,1,1j1s,7,1j4t,,1j4u,,1j4v,,1j4y,3,1j52,,1j53,4,1jcc,2,1jcf,8,1jco,,1jcp,1,1jjk,,1jjl,4,1jjr,1,1jjv,3,1jjz,,1jk0,,1jk1,,1jk2,,1jk3,,1jo1,2,1jo4,3,1joa,1,1joc,3,1jog,,1jok,,1jpd,9,1jqr,5,1jqx,,1jqy,,1jqz,3,1jrb,,1jrl,5,1jrr,1,1jrt,2,1jt0,5,1jt6,c,1jtj,,1jtk,1,1k4v,,1k4w,6,1k54,5,1k5a,,1k5b,,1k7m,l,1k89,,1k8a,6,1k8h,,1k8i,1,1k8k,,1k8l,1,1kc1,5,1kca,,1kcc,1,1kcf,6,1kcm,,1kcn,,1kei,4,1keo,1,1ker,1,1ket,,1keu,,1kev,,1koj,1,1kol,1,1kow,1,1koy,,1koz,,1kqc,1,1kqe,4,1kqm,1,1kqo,2,1kre,,1ovk,f,1ow0,,1ow7,e,1xr2,b,1xre,2,1xrh,2,1zow,4,1zqo,6,206b,,206f,3,20jz,,20k1,1i,20lr,3,20o4,,20og,1,2ftp,1,2fts,3,2jgg,19,2jhs,m,2jxh,4,2jxp,5,2jxv,7,2jy3,7,2jyd,6,2jze,3,2k3m,2,2lmo,1i,2lob,1d,2lpx,,2lqc,,2lqz,4,2lr5,e,2mtc,6,2mtk,g,2mu3,6,2mub,1,2mue,4,2mxb,,2n1s,6,2nce,,2ne4,3,2nsc,3,2nzi,1,2ok0,6,2on8,6,2pz4,73,2q6l,2,2q7j,,2q98,5,2q9q,1,2qa6,,2qa9,9,2qb1,1k,2qcm,p,2qdd,e,2qe2,,2qen,,2qeq,8,2qf0,3,2qfd,c1,2qrf,4,2qrk,8t,2r0m,7d,2r9c,3j,2rg4,b,2rit,16,2rkc,3,2rm0,7,2rmi,5,2rns,7,2rou,29,2rrg,1a,2rss,9,2rt3,c8,2scg,sd,jny8,v,jnz4,2n,jo1s,3j,jo5c,6n,joc0,2rz')
);

if (!exports.__esModule) Object.defineProperty(exports, "__esModule", { value: true });var grapheme_cats = exports.grapheme_cats = initLookupTableBuffer(
  Array(1454),
  /** @type {LookupTableEncoding} */
  ('262122424333333393233393339333333333393393b3b3b3b3b333b33b3bb33333b3b3333333b3b33bb3333b33b3bb33333b3bbb333b333b33333b3b3b3b3333b3b33b3bb39333b33b33b3b3b333b333333b3b333333b33b3b3333b3335dc333333b3b3b33323333b3bb3b33b3b3b3333b3333b3b333bb3b33b3b3b3b3b333b333b3323e2244234444444444444444444444444444444444444444443333443443333333b3b3bb33333b353b3b3b3b333b3b333b333333b3bb3b3b3bb3787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878dc333232333333333333333b3b3333bb3b393933b3b33bb3b393b3b3b3333b33b33b3bbb33b333b3333bb3933b3b3b333b3b3b3b3b33b3b3b33b3b3b33b3b33b33b3b3b33bb39b9b3b33b3b33b9333b393b3b33b33b3b3b3333393b3b3b33b39bb3b332333b333dd3b33332333323333333333333333333333344444444a44444434444444444444423232')
);

const grapheme_lookup = initLookupTableBuffer(
  Array(128),
  /** @type {LookupTableEncoding} */
  (',a,w,2y,4r,5a,5m,6w,79,7s,8j,8o,8r,8x,8x,8x,8x,8x,8x,8x,8x,8x,8x,8x,8x,8x,8x,8x,8x,8x,8x,8x,8x,8x,8x,8x,8x,8x,8x,8x,8x,8x,91,ai,cj,el,gl,in,kn,mp,oq,qr,st,ut,wq,wq,wq,wq,wq,wq,wq,wq,wq,wr,ww,wz,wz,x5,xb,z5,10c,118,126,126,126,126,126,126,129,129,129,129,129,129,129,129,129,129,129,12c,12c,12e,12l,12l,12l,12l,12l,12l,12l,12l,12l,12l,12l,12l,12l,12l,12l,12l,12l,12l,12l,12l,12n,12n,12n,12n,12p,12w,12w,132,132,13b,13d,13f,13f,13v,140,148'),
  ','
);

/**
 * @param {number} cp
 * @return Index of {@link grapheme_ranges} if found, or negation of last visited low cursor.
 */
if (!exports.__esModule) Object.defineProperty(exports, "__esModule", { value: true });function findGraphemeIndex(cp) {
  // Perform a quick O(1) lookup in a precomputed table to determine
  // the slice of the range table to search in.
  let lookup_table = grapheme_lookup;
  let lookup_interval = 1024;

  let idx = cp / lookup_interval | 0;
  // If the `idx` is outside of the precomputed table - use the slice
  // starting from the last covered index in the precomputed table and
  // ending with the length of the range table.
  let sliceFrom = 1448, sliceTo = 1454;
  if (idx + 1 < lookup_table.length) {
    sliceFrom = lookup_table[idx];
    sliceTo = lookup_table[idx + 1] + 1;
  }

  return searchUnicodeRange(cp, grapheme_buffer, sliceFrom * 2, sliceTo * 2);
};exports.findGraphemeIndex = findGraphemeIndex

}, function(modId) { var map = {"./core.js":1740739901108}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1740739901111, function(require, module, exports) {
// The following code was generated by "scripts/unicode.js",
// DO NOT EDIT DIRECTLY.
//
// @ts-check

var __TEMP__ = require('./core.js');var initUnicodeRangeBuffer = __TEMP__['initUnicodeRangeBuffer'];

/**
 * @typedef {import('./core.js').UnicodeRangeEncoding} UnicodeRangeEncoding
 */

/**
 * The Unicode `Indic_Conjunct_Break=Consonant` derived property table
 */
if (!exports.__esModule) Object.defineProperty(exports, "__esModule", { value: true });var consonant_buffer = exports.consonant_buffer = initUnicodeRangeBuffer(
  Array(52),
  /** @type {UnicodeRangeEncoding} */
  ('1sl,10,1ug,7,1vc,7,1w5,j,1wq,6,1wy,,1x2,3,1y4,1,1y7,,1yo,1,239,j,23u,6,242,1,245,4,261,,26t,j,27e,6,27m,1,27p,4,28s,1,28v,,29d,,2dx,j,2ei,f,2fs,2,2l1,11')
);

}, function(modId) { var map = {"./core.js":1740739901108}; return __REQUIRE__(map[modId], modId); })
return __REQUIRE__(1740739901106);
})()
//miniprogram-npm-outsideDeps=[]
//# sourceMappingURL=index.js.map