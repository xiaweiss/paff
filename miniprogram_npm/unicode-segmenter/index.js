module.exports = (function() {
var __MODS__ = {};
var __DEFINE__ = function(modId, func, req) { var m = { exports: {}, _tempexports: {} }; __MODS__[modId] = { status: 0, func: func, req: req, m: m }; };
var __REQUIRE__ = function(modId, source) { if(!__MODS__[modId]) return require(source); if(!__MODS__[modId].status) { var m = __MODS__[modId].m; m._exports = m._tempexports; var desp = Object.getOwnPropertyDescriptor(m, "exports"); if (desp && desp.configurable) Object.defineProperty(m, "exports", { set: function (val) { if(typeof val === "object" && val !== m._exports) { m._exports.__proto__ = val.__proto__; Object.keys(val).forEach(function (k) { m._exports[k] = val[k]; }); } m._tempexports = val }, get: function () { return m._tempexports; } }); __MODS__[modId].status = 1; __MODS__[modId].func(__MODS__[modId].req, m, m.exports); } return __MODS__[modId].m.exports; };
var __REQUIRE_WILDCARD__ = function(obj) { if(obj && obj.__esModule) { return obj; } else { var newObj = {}; if(obj != null) { for(var k in obj) { if (Object.prototype.hasOwnProperty.call(obj, k)) newObj[k] = obj[k]; } } newObj.default = obj; return newObj; } };
var __REQUIRE_DEFAULT__ = function(obj) { return obj && obj.__esModule ? obj.default : obj; };
__DEFINE__(1747898168593, function(require, module, exports) {
// @ts-check

if (!exports.__esModule) Object.defineProperty(exports, "__esModule", { value: true });var __TEMP__ = require('./general.js');Object.keys(__TEMP__).forEach(function(k) { if (k === "default" || k === "__esModule") return; Object.defineProperty(exports, k, { enumerable: true, configurable: true, get: function() { return __TEMP__[k]; } }); });
if (!exports.__esModule) Object.defineProperty(exports, "__esModule", { value: true });var __TEMP__ = require('./emoji.js');Object.keys(__TEMP__).forEach(function(k) { if (k === "default" || k === "__esModule") return; Object.defineProperty(exports, k, { enumerable: true, configurable: true, get: function() { return __TEMP__[k]; } }); });
if (!exports.__esModule) Object.defineProperty(exports, "__esModule", { value: true });var __TEMP__ = require('./grapheme.js');Object.keys(__TEMP__).forEach(function(k) { if (k === "default" || k === "__esModule") return; Object.defineProperty(exports, k, { enumerable: true, configurable: true, get: function() { return __TEMP__[k]; } }); });
if (!exports.__esModule) Object.defineProperty(exports, "__esModule", { value: true });var __TEMP__ = require('./utils.js');Object.keys(__TEMP__).forEach(function(k) { if (k === "default" || k === "__esModule") return; Object.defineProperty(exports, k, { enumerable: true, configurable: true, get: function() { return __TEMP__[k]; } }); });

}, function(modId) {var map = {"./general.js":1747898168594,"./emoji.js":1747898168597,"./grapheme.js":1747898168599,"./utils.js":1747898168600}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1747898168594, function(require, module, exports) {
// @ts-check

var __TEMP__ = require('./core.js');var findUnicodeRangeIndex = __TEMP__['findUnicodeRangeIndex'];
var __TEMP__ = require('./_general_data.js');var letter_ranges = __TEMP__['letter_ranges'];var alphabetic_ranges = __TEMP__['alphabetic_ranges'];var numeric_ranges = __TEMP__['numeric_ranges'];





/**
 * Check if the given code point is included in Unicode \\p{L} general property
 *
 * @param {number} cp
 * @return boolean
 */
if (!exports.__esModule) Object.defineProperty(exports, "__esModule", { value: true });function isLetter(cp) {
  return findUnicodeRangeIndex(cp, letter_ranges) >= 0;
};exports.isLetter = isLetter

/**
 * Check if the given code point is included in Unicode \\p{Alphabetic} dervied property
 *
 * @param {number} cp
 * @return boolean
 */
if (!exports.__esModule) Object.defineProperty(exports, "__esModule", { value: true });function isAlphabetic(cp) {
  return findUnicodeRangeIndex(cp, alphabetic_ranges) >= 0;
};exports.isAlphabetic = isAlphabetic

/**
 * Check if the given code point is included in Unicode \\p{N} general property
 *
 * @param {number} cp
 * @return boolean true if 
 */
if (!exports.__esModule) Object.defineProperty(exports, "__esModule", { value: true });function isNumeric(cp) {
  return findUnicodeRangeIndex(cp, numeric_ranges) >= 0;
};exports.isNumeric = isNumeric

/**
 * @param {number} cp
 * @return boolean true
 */
if (!exports.__esModule) Object.defineProperty(exports, "__esModule", { value: true });function isAlphanumeric(cp) {
  return isAlphabetic(cp) || isNumeric(cp);
};exports.isAlphanumeric = isAlphanumeric

}, function(modId) { var map = {"./core.js":1747898168595,"./_general_data.js":1747898168596}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1747898168595, function(require, module, exports) {
// @ts-check

/**
 * @template {number} [T=number]
 * @typedef {[from: number, to: number, category: T]} CategorizedUnicodeRange
 */

/**
 * @typedef {CategorizedUnicodeRange<0>} UnicodeRange
 */

/**
 * @typedef {string & { __tag: 'UnicodeDataEncoding' }} UnicodeDataEncoding
 *
 * Encoding for array of {@link UnicodeRange}, items separated by comma.
 *
 * Each {@link UnicodeDataRow} packed as a base36 integer:
 *
 * padding  = to - from
 * encoding = base36(from) + ',' + base36(padding)
 *
 * Notes:
 * - base36 can hold surprisingly large numbers in a few characters.
 * - The biggest codepoint is 0xE01F0 (918,000) at this point
 * - The max value of a category is 23; https://www.unicode.org/reports/tr29/tr29-45.html#Table_Word_Break_Property_Values
 * - The longest range is 42,720; CJK UNIFIED IDEOGRAPH-20000..CJK UNIFIED IDEOGRAPH-2A6DF
 */

/**
 * @template {number} [T=number]
 * @param {UnicodeDataEncoding} data
 * @param {string} [cats='']
 * @returns {Array<CategorizedUnicodeRange<T>>}
 */
if (!exports.__esModule) Object.defineProperty(exports, "__esModule", { value: true });function decodeUnicodeData(data, cats = '') {
  let buf = /** @type {Array<CategorizedUnicodeRange<T>>} */([])
    , nums = data.split(',').map(s => s ? parseInt(s, 36) : 0)
    , n = 0;
  for (let i = 0; i < nums.length; i++)
    i % 2
      ? buf.push([n, n + nums[i], /** @type {T} */ (cats ? parseInt(cats[i >> 1], 36) : 0)])
      : n = nums[i];
  return buf;
};exports.decodeUnicodeData = decodeUnicodeData

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
 * @template {number} [T=number]
 * @param {number} cp
 * @param {CategorizedUnicodeRange<T>[]} ranges
 * @return {number} index of matched unicode range, or -1 if no match
 */
if (!exports.__esModule) Object.defineProperty(exports, "__esModule", { value: true });function findUnicodeRangeIndex(cp, ranges) {
  let lo = 0
    , hi = ranges.length - 1;
  while (lo <= hi) {
    let mid = lo + hi >> 1
      , range = ranges[mid]
      , l = range[0]
      , h = range[1];
    if (l <= cp && cp <= h) return mid;
    else if (cp > h) lo = mid + 1;
    else hi = mid - 1;
  }
  return -1;
};exports.findUnicodeRangeIndex = findUnicodeRangeIndex

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1747898168596, function(require, module, exports) {
// The following code was generated by "scripts/unicode.js",
// DO NOT EDIT DIRECTLY.
//
// @ts-check

var __TEMP__ = require('./core.js');var decodeUnicodeData = __TEMP__['decodeUnicodeData'];

/**
 * @typedef {import('./core.js').UnicodeRange} UnicodeRange
 * @typedef {import('./core.js').UnicodeDataEncoding} UnicodeDataEncoding
 */

/**
 * The Unicode `L` (Letter) properties data
 *
 * @type {UnicodeRange[]}
 */
if (!exports.__esModule) Object.defineProperty(exports, "__esModule", { value: true });var letter_ranges = exports.letter_ranges = decodeUnicodeData(
  /** @type {UnicodeDataEncoding} */
  ('1t,p,2p,p,4q,,51,,56,,5c,m,60,u,6w,cp,jq,b,kg,4,ks,,ku,,og,4,om,1,oq,3,ov,,p2,,p4,2,p8,,pa,j,pv,2a,s7,3u,wa,4l,10x,11,121,,128,14,15c,q,167,3,17k,16,19q,1,19t,2q,1cl,,1d1,1,1da,1,1dm,2,1dr,,1e8,,1ea,t,1fx,2g,1ip,,1je,w,1kk,1,1kq,,1kw,l,1lm,,1lw,,1m0,,1mo,o,1nk,a,1o0,n,1op,5,1pc,15,1s4,1h,1tp,,1u8,,1ug,9,1v5,f,1vp,7,1vz,1,1w3,l,1wq,6,1wy,,1x2,3,1x9,,1xq,,1y4,1,1y7,2,1yo,1,1z0,,1z9,5,1zj,1,1zn,l,20a,6,20i,1,20l,1,20o,1,21l,3,21q,,22a,2,22t,8,233,2,237,l,23u,6,242,1,245,4,24d,,24w,,25c,1,261,,26d,7,26n,1,26r,l,27e,6,27m,1,27p,4,27x,,28s,1,28v,2,29d,,29v,,29x,5,2a6,2,2aa,3,2ah,1,2ak,,2am,1,2ar,1,2aw,2,2b2,b,2c0,,2dh,7,2dq,2,2du,m,2ei,f,2f1,,2fs,2,2fx,,2g0,1,2gw,,2h1,7,2ha,2,2he,m,2i2,9,2id,4,2il,,2jh,1,2jk,1,2k1,1,2kk,8,2ku,2,2ky,14,2m5,,2mm,,2ms,2,2n3,2,2nu,5,2o5,h,2oq,n,2pf,8,2pp,,2ps,6,2rl,1b,2sy,1,2tc,6,2v5,1,2v8,,2va,4,2vg,n,2w5,,2w7,9,2wi,1,2wt,,2ww,4,2x2,,2xo,3,2yo,,30g,7,30p,z,32g,4,35s,16,37j,,380,5,38a,3,38h,,38l,1,38u,2,391,c,39q,,3a8,11,3bb,,3bh,,3bk,16,3cs,98,3m2,3,3m8,6,3mg,,3mi,3,3mo,14,3nu,3,3o0,w,3oy,3,3p4,6,3pc,,3pe,3,3pk,e,3q0,1k,3rm,3,3rs,1u,3uo,f,3vk,2d,3y0,5,3y9,h7,4fj,g,4g1,p,4gw,22,4j5,7,4jk,h,4kf,i,4lc,h,4m8,c,4mm,2,4n4,1f,4pj,,4po,,4rk,2g,4u8,4,4uf,x,4ve,,4vk,1x,4xs,u,500,t,50w,4,51c,17,52o,p,54w,m,55s,1g,59j,,5c5,1a,5dx,7,5fn,t,5gu,1,5h6,17,5j4,z,5l9,2,5lm,z,5mo,a,5n4,16,5od,2,5pl,3,5pq,5,5px,1,5q2,,5q8,5b,5xc,7p,654,5,65c,11,66g,5,66o,7,66x,,66z,,671,,673,u,680,1g,69i,6,69q,,69u,2,69y,6,6a8,3,6ae,5,6ao,c,6b6,2,6ba,6,6ep,,6f3,,6fk,c,6iq,,6iv,,6iy,9,6j9,,6jd,4,6jo,,6jq,,6js,,6ju,3,6jz,a,6kc,3,6kl,4,6ku,,6mb,1,8ow,6c,8vf,3,8vm,1,8w0,11,8x3,,8x9,,8xc,1j,8z3,,8zk,m,90g,6,90o,6,90w,6,914,6,91c,6,91k,6,91s,6,920,6,94f,,9hh,1,9ip,4,9iz,1,9j5,2d,9lp,2,9lt,2h,9oc,3,9ol,16,9pt,2l,9sw,v,9v4,f,a9s,533,feo,h3g,wk0,19,wlc,7g,wsw,f,wtm,1,wu8,1a,wvz,u,www,1x,x07,8,x0i,2u,x3f,1u,x5c,1,x5f,,x5h,7,x6a,f,x6r,2,x6v,3,x70,m,x8g,1f,xaa,1d,xde,5,xdn,,xdp,1,xe2,r,xf4,m,xgg,s,xhg,1a,xjj,,xk0,4,xk6,9,xkq,4,xkw,14,xmo,2,xms,7,xnk,m,xoa,,xoe,1d,xpt,,xpx,1,xq1,4,xq8,,xqa,,xqz,2,xr4,a,xrm,2,xs1,5,xs9,5,xsh,5,xsw,6,xt4,6,xtc,16,xuk,d,xv4,36,xz4,8mb,16ls,m,16mj,1c,1d6o,a5,1dgw,2x,1dkw,6,1dlf,4,1dlp,,1dlr,9,1dm2,c,1dmg,4,1dmm,,1dmo,1,1dmr,1,1dmu,2z,1dqr,a2,1e1c,1r,1e36,1h,1e5s,b,1e9c,4,1e9i,3q,1ee9,p,1ef5,p,1eg6,2g,1eiq,5,1eiy,5,1ej6,5,1eje,2,1ekg,b,1ekt,p,1elk,i,1em4,1,1em7,e,1emo,d,1eo0,3e,1f28,s,1f34,1c,1f5s,v,1f71,j,1f7m,7,1f80,11,1f9c,t,1fa8,z,1fbc,7,1fcw,4d,1fhs,z,1fiw,z,1fk0,13,1flc,1f,1fn4,a,1fng,e,1fnw,6,1fo4,1,1fo7,a,1foj,e,1foz,6,1fp7,1,1fpc,1f,1fr4,8m,1g00,l,1g0w,7,1g1s,5,1g1z,15,1g36,8,1g5c,5,1g5k,,1g5m,17,1g6v,1,1g70,,1g73,m,1g80,m,1g8w,u,1gbk,i,1gc4,1,1gcg,l,1gdc,p,1gg0,1j,1ghq,1,1gjk,,1gk0,3,1gk5,2,1gk9,s,1gm8,s,1gn4,s,1gow,7,1gp5,r,1gqo,1h,1gsg,l,1gtc,i,1gu8,h,1gxs,20,1h1c,1e,1h34,1e,1h4w,z,1h6y,r,1h7z,m,1hfk,15,1hgw,1,1hhe,2,1hj4,s,1hk7,,1hkg,l,1hm8,h,1ho0,k,1hpc,m,1hqb,1g,1htd,1,1hth,,1htv,18,1hw0,o,1hxf,z,1hz8,,1hzb,,1hzk,y,1i0m,,1i0z,1b,1i2p,3,1i3e,,1i3g,,1i4g,h,1i4z,o,1i67,1,1i80,6,1i88,,1i8a,3,1i8f,e,1i8v,9,1i9c,1a,1ibp,7,1ibz,1,1ic3,l,1icq,6,1icy,1,1id1,4,1id9,,1ids,,1ie5,4,1if4,9,1iff,,1ifi,,1ifk,11,1ign,,1ihd,,1ihf,,1iio,1g,1ikn,3,1ilb,2,1im8,1b,1io4,1,1io7,,1itc,1a,1ivs,3,1iww,1b,1iys,,1j0g,16,1j20,,1j40,q,1j5s,6,1jb4,17,1jfk,1r,1ji7,7,1jih,,1jik,7,1jit,1,1jiw,n,1jjz,,1jk1,,1jmo,7,1jmy,12,1joh,,1joj,,1jpc,,1jpn,13,1jqy,,1jrk,,1jrw,19,1jtp,,1ju8,20,1k1s,w,1k3k,8,1k3u,10,1k5c,,1k6q,t,1kao,6,1kaw,1,1kaz,11,1kcm,,1kdc,5,1kdj,1,1kdm,v,1kew,,1ko0,i,1koy,,1kp0,c,1kpe,x,1kts,,1kw0,pl,1ls0,5f,1nyo,2o,1o1s,tr,1ow1,5,1oww,32y,1s00,g6,1xq8,t,1z40,fs,1zk0,u,1zlc,26,1zo0,t,1zpc,1b,1zr4,3,1zs3,k,1zst,i,205c,18,20cg,1r,20hs,22,20k0,,20lv,c,20o0,1,20o3,,20ow,4qf,25fk,yd,26f3,9,2dbk,3,2dbp,6,2dbx,1,2dc0,82,2dki,,2dlc,2,2dlh,,2dlw,3,2dm8,az,2fpc,2y,2fsg,c,2fsw,8,2ftc,9,2kg0,2c,2kie,1y,2kke,1,2kki,,2kkl,1,2kkp,3,2kku,b,2kl7,,2kl9,6,2klh,1s,2knb,3,2knh,7,2knq,6,2kny,r,2kor,3,2kow,4,2kp2,,2kp6,6,2kpe,9f,2kyw,o,2kzm,o,2l0c,u,2l18,o,2l1y,u,2l2u,o,2l3k,u,2l4g,o,2l56,u,2l62,o,2l6s,7,2mm8,u,2mn9,5,2muo,1p,2n0g,18,2n1z,6,2n2m,,2nbk,t,2ncw,17,2nrk,r,2nyo,t,2nzk,,2odc,6,2odk,3,2odp,1,2ods,e,2oe8,5g,2olc,1v,2onf,,2pkw,3,2pl1,q,2plt,1,2plw,,2plz,,2pm1,9,2pmc,3,2pmh,,2pmj,,2pmq,,2pmv,,2pmx,,2pmz,,2pn1,2,2pn5,1,2pn8,,2pnb,,2pnd,,2pnf,,2pnh,,2pnj,,2pnl,1,2pno,,2pnr,3,2pnw,6,2po4,3,2po9,3,2poe,,2pog,9,2por,g,2ppd,2,2pph,4,2ppn,g,2t4w,wyn,3q4g,37d,3tc0,65,3ti8,4g1,3xyo,5rk,43qo,h9,464g,f1,47pc,3t6,4bio,38f')
);

/**
 * The Unicode `N` (Numeric) properties data
 *
 * @type {UnicodeRange[]}
 */
if (!exports.__esModule) Object.defineProperty(exports, "__esModule", { value: true });var numeric_ranges = exports.numeric_ranges = decodeUnicodeData(
  /** @type {UnicodeDataEncoding} */
  ('1c,9,4y,1,55,,58,2,19c,9,1dc,9,1j4,9,1uu,9,1ye,9,1ys,5,21y,9,25i,9,292,9,29e,5,2cm,c,2g6,9,2go,6,2jq,9,2mw,6,2na,i,2qu,9,2ts,9,2xc,9,2zk,j,37k,9,39s,9,3u1,j,4j2,2,4ps,9,4q8,9,4r4,9,4zq,9,53k,a,58g,9,58w,9,5e8,9,5gw,9,5kw,9,5lc,9,6eo,,6es,5,6f4,9,6kw,1e,6md,4,76o,1n,7ai,l,7sm,t,8vx,,9hj,,9i9,8,9iw,2,9si,3,9wg,9,9xk,7,9xt,e,9z4,9,a0h,e,wtc,9,wyu,9,x80,5,xcg,9,xds,9,xjk,9,xkg,9,xn4,9,xyo,9,1eds,9,1err,18,1etc,1k,1eve,1,1f4x,q,1f6o,3,1f7l,,1f7u,,1fbl,4,1fhc,9,1g7s,7,1g8p,6,1g9z,8,1gcb,4,1gd2,5,1gho,1,1ghs,f,1gia,19,1glc,8,1gn1,1,1gnx,2,1gq3,4,1gt4,7,1gu0,7,1gvd,6,1h4q,5,1h68,9,1h6o,9,1heo,u,1hjx,9,1hld,3,1hol,6,1hsi,t,1hww,9,1hyu,9,1i34,9,1i3l,j,1ib4,9,1ikw,9,1iog,9,1iz4,9,1j28,9,1j2o,j,1j5c,b,1jhc,i,1jkg,9,1k34,9,1k5s,s,1kcw,9,1kf4,9,1kr4,9,1ku8,k,1log,32,1xrk,9,1zkw,9,1znk,9,1zrk,9,1zrv,6,206o,9,20e8,m,2j1s,9,2k74,j,2k80,j,2kbk,o,2l72,1d,2n28,9,2ne8,9,2nsg,9,2nzl,9,2ojr,8,2onk,9,2p9t,1m,2pbh,2,2pbl,3,2pdt,18,2pf3,e,2q68,c,2sc0,9')
);

/**
 * The Unicode `Alphabetic` properties data
 *
 * @type {UnicodeRange[]}
 */
if (!exports.__esModule) Object.defineProperty(exports, "__esModule", { value: true });var alphabetic_ranges = exports.alphabetic_ranges = decodeUnicodeData(
  /** @type {UnicodeDataEncoding} */
  ('1t,p,2p,p,4q,,51,,56,,5c,m,60,u,6w,cp,jq,b,kg,4,ks,,ku,,n9,,o3,h,om,1,oq,3,ov,,p2,,p4,2,p8,,pa,j,pv,2a,s7,3u,wa,4l,10x,11,121,,128,14,14g,d,14v,,14x,1,150,1,153,,15c,q,167,3,174,a,17k,1j,195,6,19q,2t,1cl,7,1cx,7,1d9,2,1dm,2,1dr,,1e8,1b,1fx,2s,1je,w,1kk,1,1kq,,1kw,n,1lm,i,1mo,o,1nk,a,1o0,n,1op,5,1p3,,1pc,15,1qs,b,1r7,6,1rk,23,1tp,f,1u6,2,1ud,e,1v5,i,1vp,7,1vz,1,1w3,l,1wq,6,1wy,,1x2,3,1x9,7,1xj,1,1xn,1,1xq,,1xz,,1y4,1,1y7,4,1yo,1,1z0,,1z5,2,1z9,5,1zj,1,1zn,l,20a,6,20i,1,20l,1,20o,1,20u,4,213,1,217,1,21d,,21l,3,21q,,228,5,22p,2,22t,8,233,2,237,l,23u,6,242,1,245,4,24d,8,24n,2,24r,1,24w,,25c,3,261,3,269,2,26d,7,26n,1,26r,l,27e,6,27m,1,27p,4,27x,7,287,1,28b,1,28m,1,28s,1,28v,4,29d,,29u,1,29x,5,2a6,2,2aa,3,2ah,1,2ak,,2am,1,2ar,1,2aw,2,2b2,b,2bi,4,2bq,2,2bu,2,2c0,,2c7,,2dc,c,2dq,2,2du,m,2ei,f,2f1,7,2fa,2,2fe,2,2fp,1,2fs,2,2fx,,2g0,3,2gw,3,2h1,7,2ha,2,2he,m,2i2,9,2id,4,2il,7,2iu,2,2iy,2,2j9,1,2jh,1,2jk,3,2k1,2,2kg,c,2ku,2,2ky,14,2m5,7,2me,2,2mi,2,2mm,,2ms,3,2n3,4,2nu,5,2o1,2,2o5,h,2oq,n,2pf,8,2pp,,2ps,6,2q7,5,2qe,,2qg,7,2r6,1,2rl,1l,2tc,6,2tp,,2v5,1,2v8,,2va,4,2vg,n,2w5,,2w7,i,2wr,2,2ww,4,2x2,,2x9,,2xo,3,2yo,,30g,7,30p,z,31t,i,32g,f,32x,z,35s,1i,37c,,37f,4,380,1r,3a2,3,3a8,11,3bb,,3bh,,3bk,16,3cs,98,3m2,3,3m8,6,3mg,,3mi,3,3mo,14,3nu,3,3o0,w,3oy,3,3p4,6,3pc,,3pe,3,3pk,e,3q0,1k,3rm,3,3rs,1u,3uo,f,3vk,2d,3y0,5,3y9,h7,4fj,g,4g1,p,4gw,22,4j2,a,4jk,j,4kf,k,4lc,j,4m8,c,4mm,2,4mq,1,4n4,1f,4om,i,4pj,,4po,,4rk,2g,4u8,16,4vk,1x,4xs,u,4yo,b,4z4,8,500,t,50w,4,51c,17,52o,p,54w,r,55s,1q,57l,j,59j,,5a7,1,5ak,2,5c0,1f,5dh,e,5dx,7,5fk,15,5gs,3,5h6,17,5if,a,5j4,1i,5l9,2,5lm,z,5mo,a,5n4,16,5od,2,5pl,3,5pq,5,5px,1,5q2,,5q8,5b,5w3,x,5xc,7p,654,5,65c,11,66g,5,66o,7,66x,,66z,,671,,673,u,680,1g,69i,6,69q,,69u,2,69y,6,6a8,3,6ae,5,6ao,c,6b6,2,6ba,6,6ep,,6f3,,6fk,c,6iq,,6iv,,6iy,9,6j9,,6jd,4,6jo,,6jq,,6js,,6ju,3,6jz,a,6kc,3,6kl,4,6ku,,6lc,14,792,1f,8ow,6c,8vf,3,8vm,1,8w0,11,8x3,,8x9,,8xc,1j,8z3,,8zk,m,90g,6,90o,6,90w,6,914,6,91c,6,91k,6,91s,6,920,6,928,v,94f,,9hh,2,9i9,8,9ip,4,9iw,4,9j5,2d,9lp,2,9lt,2h,9oc,3,9ol,16,9pt,2l,9sw,v,9v4,f,a9s,533,feo,h3g,wk0,19,wlc,7g,wsw,f,wtm,1,wu8,1a,wvo,7,wvz,34,x07,8,x0i,2u,x3f,1u,x5c,1,x5f,,x5h,7,x6a,j,x6v,w,x8g,1f,xa8,1v,xc5,,xde,5,xdn,,xdp,2,xe2,w,xf4,y,xgg,s,xhc,1e,xis,b,xjj,,xk0,f,xkq,4,xkw,1i,xmo,d,xnk,m,xoa,1w,xq8,,xqa,,xqz,2,xr4,f,xrm,3,xs1,5,xs9,5,xsh,5,xsw,6,xt4,6,xtc,16,xuk,d,xv4,3e,xz4,8mb,16ls,m,16mj,1c,1d6o,a5,1dgw,2x,1dkw,6,1dlf,4,1dlp,b,1dm2,c,1dmg,4,1dmm,,1dmo,1,1dmr,1,1dmu,2z,1dqr,a2,1e1c,1r,1e36,1h,1e5s,b,1e9c,4,1e9i,3q,1ee9,p,1ef5,p,1eg6,2g,1eiq,5,1eiy,5,1ej6,5,1eje,2,1ekg,b,1ekt,p,1elk,i,1em4,1,1em7,e,1emo,d,1eo0,3e,1etc,1g,1f28,s,1f34,1c,1f5s,v,1f71,t,1f80,16,1f9c,t,1fa8,z,1fbc,7,1fbl,4,1fcw,4d,1fhs,z,1fiw,z,1fk0,13,1flc,1f,1fn4,a,1fng,e,1fnw,6,1fo4,1,1fo7,a,1foj,e,1foz,6,1fp7,1,1fpc,1f,1fr4,8m,1g00,l,1g0w,7,1g1s,5,1g1z,15,1g36,8,1g5c,5,1g5k,,1g5m,17,1g6v,1,1g70,,1g73,m,1g80,m,1g8w,u,1gbk,i,1gc4,1,1gcg,l,1gdc,p,1gg0,1j,1ghq,1,1gjk,3,1gjp,1,1gjw,7,1gk5,2,1gk9,s,1gm8,s,1gn4,s,1gow,7,1gp5,r,1gqo,1h,1gsg,l,1gtc,i,1gu8,h,1gxs,20,1h1c,1e,1h34,1e,1h4w,13,1h6y,r,1h7t,,1h7z,m,1hfk,15,1hgr,1,1hgw,1,1hhe,2,1hj0,,1hj4,s,1hk7,,1hkg,l,1hm8,h,1ho0,k,1hpc,m,1hq8,1x,1htd,4,1hts,1k,1hvm,,1hw0,o,1hxc,1e,1hz8,3,1hzk,y,1i0m,,1i0w,1r,1i2p,3,1i32,1,1i3e,,1i3g,,1i4g,h,1i4z,x,1i5z,,1i66,3,1i80,6,1i88,,1i8a,3,1i8f,e,1i8v,9,1i9c,1k,1ibk,3,1ibp,7,1ibz,1,1ic3,l,1icq,6,1icy,1,1id1,4,1id9,7,1idj,1,1idn,1,1ids,,1idz,,1ie5,6,1if4,9,1iff,,1ifi,,1ifk,11,1ign,9,1igy,,1ih1,,1ih3,3,1ih8,1,1ihd,,1ihf,,1iio,1t,1ikj,2,1ikn,3,1ilb,2,1im8,1t,1io4,1,1io7,,1itc,1h,1iuw,6,1ivs,5,1iww,1q,1iyo,,1iys,,1j0g,1h,1j20,,1j40,q,1j4t,d,1j5s,6,1jb4,1k,1jfk,1r,1ji7,7,1jih,,1jik,7,1jit,1,1jiw,t,1jjr,1,1jjv,1,1jjz,3,1jmo,7,1jmy,19,1joa,5,1joh,,1joj,1,1jpc,1e,1jqt,9,1jrk,1z,1jtp,,1ju8,20,1k1s,w,1k3k,8,1k3u,18,1k54,6,1k5c,,1k6q,t,1k7m,l,1k89,d,1kao,6,1kaw,1,1kaz,17,1kca,,1kcc,1,1kcf,2,1kcj,,1kcm,1,1kdc,5,1kdj,1,1kdm,10,1keo,1,1ker,3,1kew,,1ko0,m,1kow,g,1kpe,14,1kqm,2,1kts,,1kw0,pl,1log,32,1ls0,5f,1nyo,2o,1o1s,tr,1ow1,5,1oww,32y,1s00,g6,1xq8,1a,1z40,fs,1zk0,u,1zlc,26,1zo0,t,1zpc,1b,1zr4,3,1zs3,k,1zst,i,205c,18,20cg,1r,20hs,22,20jz,1k,20lr,g,20o0,1,20o3,,20og,1,20ow,4qf,25fk,yd,26f3,9,2dbk,3,2dbp,6,2dbx,1,2dc0,82,2dki,,2dlc,2,2dlh,,2dlw,3,2dm8,az,2fpc,2y,2fsg,c,2fsw,8,2ftc,9,2ftq,,2kg0,2c,2kie,1y,2kke,1,2kki,,2kkl,1,2kkp,3,2kku,b,2kl7,,2kl9,6,2klh,1s,2knb,3,2knh,7,2knq,6,2kny,r,2kor,3,2kow,4,2kp2,,2kp6,6,2kpe,9f,2kyw,o,2kzm,o,2l0c,u,2l18,o,2l1y,u,2l2u,o,2l3k,u,2l4g,o,2l56,u,2l62,o,2l6s,7,2mm8,u,2mn9,5,2mtc,6,2mtk,g,2mu3,6,2mub,1,2mue,4,2muo,1p,2mxb,,2n0g,18,2n1z,6,2n2m,,2nbk,t,2ncw,17,2nrk,r,2nyo,t,2nzk,,2odc,6,2odk,3,2odp,1,2ods,e,2oe8,5g,2olc,1v,2onb,,2onf,,2pkw,3,2pl1,q,2plt,1,2plw,,2plz,,2pm1,9,2pmc,3,2pmh,,2pmj,,2pmq,,2pmv,,2pmx,,2pmz,,2pn1,2,2pn5,1,2pn8,,2pnb,,2pnd,,2pnf,,2pnh,,2pnj,,2pnl,1,2pno,,2pnr,3,2pnw,6,2po4,3,2po9,3,2poe,,2pog,9,2por,g,2ppd,2,2pph,4,2ppn,g,2q7k,p,2q8g,p,2q9c,p,2t4w,wyn,3q4g,37d,3tc0,65,3ti8,4g1,3xyo,5rk,43qo,h9,464g,f1,47pc,3t6,4bio,38f')
);

}, function(modId) { var map = {"./core.js":1747898168595}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1747898168597, function(require, module, exports) {
// @ts-check

var __TEMP__ = require('./core.js');var findUnicodeRangeIndex = __TEMP__['findUnicodeRangeIndex'];
var __TEMP__ = require('./_emoji_data.js');var emoji_presentation_ranges = __TEMP__['emoji_presentation_ranges'];var extended_pictographic_ranges = __TEMP__['extended_pictographic_ranges'];




/**
 * An alias to {@link isExtendedPictographic}
 *
 * @deprecated in favor of {@link isExtendedPictographic}, will be removed in v1.
 *
 * @param {number} cp
 * @return boolean
 */
if (!exports.__esModule) Object.defineProperty(exports, "__esModule", { value: true });function isEmoji(cp) {
  return isExtendedPictographic(cp);
};exports.isEmoji = isEmoji

/**
 * Check if the given code point is included in Unicode \\p{Emoji_Presentation} script property
 *
 * @param {number} cp
 * @return boolean
 */
if (!exports.__esModule) Object.defineProperty(exports, "__esModule", { value: true });function isEmojiPresentation(cp) {
  return findUnicodeRangeIndex(cp, emoji_presentation_ranges) >= 0;
};exports.isEmojiPresentation = isEmojiPresentation

/**
 * Check if the given code point is included in Unicode \\p{Extended_Pictographic} script property
 *
 * @param {number} cp
 * @return boolean
 */
if (!exports.__esModule) Object.defineProperty(exports, "__esModule", { value: true });function isExtendedPictographic(cp) {
  return findUnicodeRangeIndex(cp, extended_pictographic_ranges) >= 0;
};exports.isExtendedPictographic = isExtendedPictographic

}, function(modId) { var map = {"./core.js":1747898168595,"./_emoji_data.js":1747898168598}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1747898168598, function(require, module, exports) {
// The following code was generated by "scripts/unicode.js",
// DO NOT EDIT DIRECTLY.
//
// @ts-check

var __TEMP__ = require('./core.js');var decodeUnicodeData = __TEMP__['decodeUnicodeData'];

/**
 * @typedef {import('./core.js').UnicodeRange} UnicodeRange
 * @typedef {import('./core.js').UnicodeDataEncoding} UnicodeDataEncoding
 */

/**
 * The Unicode `Emoji_Presentation` properties data
 *
 * @type {UnicodeRange[]}
 */
if (!exports.__esModule) Object.defineProperty(exports, "__esModule", { value: true });var emoji_presentation_ranges = exports.emoji_presentation_ranges = decodeUnicodeData(
  /** @type {UnicodeDataEncoding} */
  ('6xm,1,73d,3,73k,,73n,,7i5,1,7is,1,7k8,b,7lr,,7mb,,7mp,,7my,1,7nh,1,7no,1,7ny,,7o4,,7oq,,7oy,1,7p1,,7p6,,7p9,,7ph,,7pm,1,7qg,,7rg,,7ri,,7rn,2,7rr,,7th,2,7u8,,7un,,8ij,1,8k0,,8k5,,2pz8,,2q4v,,2qa6,,2qa9,9,2qcm,p,2qdd,,2qe2,,2qen,,2qeq,4,2qew,2,2qfk,1,2qkg,w,2qlp,8,2qlz,1x,2qny,l,2qow,16,2qq7,4,2qqo,g,2qr8,,2qrc,1y,2qtc,,2qte,56,2qyn,1q,2r0r,3,2r0w,n,2r22,,2r2t,1,2r38,,2r5n,2c,2r9c,1x,2rbg,,2rbk,2,2rbp,2,2rbw,3,2rcb,1,2rck,8,2rj4,b,2rjk,,2rrg,1a,2rss,9,2rt3,54,2s1c,c,2s1s,9,2s27,1j,2s3y,e,2s4f,a,2s4w,8')
);

/**
 * The Unicode `Extended_Pictographic` properties data
 *
 * @type {UnicodeRange[]}
 */
if (!exports.__esModule) Object.defineProperty(exports, "__esModule", { value: true });var extended_pictographic_ranges = exports.extended_pictographic_ranges = decodeUnicodeData(
  /** @type {UnicodeDataEncoding} */
  ('4p,,4u,,6d8,,6dl,,6jm,,6k9,,6ms,5,6nd,1,6xm,1,6y0,,70o,,72n,,73d,a,73s,2,79e,,7fu,1,7g6,,7gg,,7i3,3,7i8,5,7if,b,7is,35,7m8,39,7pk,a,7pw,,7py,,7q5,,7q9,,7qg,,7qr,1,7r8,,7rb,,7rg,,7ri,,7rn,2,7rr,,7s3,4,7th,2,7tt,,7u8,,7un,,850,1,8hx,2,8ij,1,8k0,,8k5,,9io,,9j1,,9zr,,9zt,,2pz4,73,2q6l,2,2q7j,,2q98,5,2q9q,1,2qa6,,2qa9,9,2qb1,1k,2qdd,e,2qe2,,2qen,,2qeq,8,2qf0,3,2qfd,c1,2qrk,8t,2r0m,7d,2r9c,3j,2rg4,b,2rit,16,2rkc,3,2rm0,7,2rmi,5,2rns,7,2rou,29,2rrg,1a,2rss,9,2rt3,c8,2scg,sd')
);

}, function(modId) { var map = {"./core.js":1747898168595}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1747898168599, function(require, module, exports) {
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

var __TEMP__ = require('./core.js');var findUnicodeRangeIndex = __TEMP__['findUnicodeRangeIndex'];
var __TEMP__ = require('./utils.js');var isBMP = __TEMP__['isBMP'];
var __TEMP__ = require('./_grapheme_data.js');var GraphemeCategory = __TEMP__['GraphemeCategory'];var grapheme_ranges = __TEMP__['grapheme_ranges'];
var __TEMP__ = require('./_incb_data.js');var consonant_ranges = __TEMP__['consonant_ranges'];

/**
 * @typedef {import('./_grapheme_data.js').GC_Any} GC_Any
 *
 * @typedef {import('./_grapheme_data.js').GraphemeCategoryNum} GraphemeCategoryNum
 * @typedef {import('./_grapheme_data.js').GraphemeCategoryRange} GraphemeCategoryRange
 *
 * @typedef {object} GraphemeSegmentExtra
 * @property {number} _hd The first code point of the segment
 * @property {GraphemeCategoryNum} _catBegin Beginning Grapheme_Cluster_Break category of the segment
 * @property {GraphemeCategoryNum} _catEnd Ending Grapheme_Cluster_Break category of the segment
 *
 * @typedef {import('./core.js').Segmenter<GraphemeSegmentExtra>} GraphemeSegmenter
 */

if (!exports.__esModule) Object.defineProperty(exports, "__esModule", { value: true });Object.defineProperty(exports, 'GraphemeCategory', { enumerable: true, configurable: true, get: function() { return GraphemeCategory; } });

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

  let cp = /** @type {number} */ (input.codePointAt(cursor));

  /** Memoize the beginnig code point a the segment. */
  let _hd = cp;

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
        _hd,
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
        _hd,
        _catBegin: /** @type {typeof catBefore} */ (catBegin),
        _catEnd: catBefore,
      };

      // flush
      index = cursor;
      segment = '';
      emoji = false;
      incb = false;
      catBegin = catAfter;
      _hd = cp;
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
      let index = findUnicodeRangeIndex(cp, grapheme_ranges);
      if (index < 0) {
        return 0;
      }
      let range = grapheme_ranges[index];
      cache[0] = range[0];
      cache[1] = range[1];
      cache[2] = range[2];
    }
    return cache[2];
  }
};

/**
 * @param {number} cp
 * @return {boolean}
 */
function isIndicConjunctCosonant(cp) {
  return findUnicodeRangeIndex(cp, consonant_ranges) >= 0;
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

}, function(modId) { var map = {"./core.js":1747898168595,"./utils.js":1747898168600,"./_grapheme_data.js":1747898168601,"./_incb_data.js":1747898168602}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1747898168600, function(require, module, exports) {
// @ts-check

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
__DEFINE__(1747898168601, function(require, module, exports) {
// The following code was generated by "scripts/unicode.js",
// DO NOT EDIT DIRECTLY.
//
// @ts-check

var __TEMP__ = require('./core.js');var decodeUnicodeData = __TEMP__['decodeUnicodeData'];

/**
 * @typedef {import('./core.js').UnicodeDataEncoding} UnicodeDataEncoding
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
 * Note:
 *   The object isn't actually frozen
 *   because using `Object.freeze` increases 800 bytes on Brotli compression.
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

/**
 * @type {GraphemeCategoryRange[]}
 */
if (!exports.__esModule) Object.defineProperty(exports, "__esModule", { value: true });var grapheme_ranges = exports.grapheme_ranges = decodeUnicodeData(
  /** @type {UnicodeDataEncoding} */
  (',9,a,,b,1,d,,e,h,3j,w,4p,,4t,,4u,,lc,33,w3,6,13l,18,14v,,14x,1,150,1,153,,16o,5,174,a,17g,,18r,k,19s,,1cm,6,1ct,,1cv,5,1d3,1,1d6,3,1e7,,1e9,,1f4,q,1ie,a,1kb,8,1kt,,1li,3,1ln,8,1lx,2,1m1,4,1nd,2,1ow,1,1p3,8,1qi,n,1r6,,1r7,v,1s3,,1tm,,1tn,,1to,,1tq,2,1tt,7,1u1,3,1u5,,1u6,1,1u9,6,1uq,1,1vl,,1vm,1,1x8,,1xa,,1xb,1,1xd,3,1xj,1,1xn,1,1xp,,1xz,,1ya,1,1z2,,1z5,1,1z7,,20s,,20u,2,20x,1,213,1,217,2,21d,,228,1,22d,,22p,1,22r,,24c,,24e,2,24h,4,24n,1,24p,,24r,1,24t,,25e,1,262,5,269,,26a,1,27w,,27y,1,280,,281,3,287,1,28b,1,28d,,28l,2,28y,1,29u,,2bi,,2bj,,2bk,,2bl,1,2bq,2,2bu,2,2bx,,2c7,,2dc,,2dd,2,2dg,,2f0,,2f2,2,2f5,3,2fa,2,2fe,3,2fp,1,2g2,1,2gx,,2gy,1,2ik,,2im,,2in,1,2ip,,2iq,,2ir,1,2iu,2,2iy,3,2j9,1,2jm,1,2k3,,2kg,1,2ki,1,2m3,1,2m6,,2m7,1,2m9,3,2me,2,2mi,2,2ml,,2mm,,2mv,,2n6,1,2o1,,2o2,1,2q2,,2q7,,2q8,1,2qa,2,2qe,,2qg,6,2qn,,2r6,1,2sx,,2sz,,2t0,6,2tj,7,2wh,,2wj,,2wk,8,2x4,6,2zc,1,305,,307,,309,,30e,1,31t,d,327,,328,4,32e,1,32l,a,32x,z,346,,371,3,375,,376,5,37d,1,37f,1,37h,1,386,1,388,1,38e,2,38x,3,39e,,39g,,39h,1,39p,,3a5,,3cw,2n,3fk,1z,3hk,2f,3tp,2,4k2,3,4ky,2,4lu,1,4mq,1,4ok,1,4om,,4on,6,4ou,7,4p2,,4p3,1,4p5,a,4pp,,4qz,2,4r2,,4r3,,4ud,1,4vd,,4yo,2,4yr,3,4yv,1,4yx,2,4z4,1,4z6,,4z7,5,4zd,2,55j,1,55l,1,55n,,579,,57a,,57b,,57c,6,57k,,57m,,57p,7,57x,5,583,9,58f,,59s,u,5c0,3,5c4,,5dg,9,5dq,3,5du,2,5ez,8,5fk,1,5fm,,5gh,,5gi,3,5gm,1,5go,5,5ie,,5if,,5ig,1,5ii,2,5il,,5im,,5in,4,5k4,7,5kc,7,5kk,1,5km,1,5ow,2,5p0,c,5pd,,5pe,6,5pp,,5pw,,5pz,,5q0,1,5vk,1r,6bv,,6bw,,6bx,,6by,1,6co,6,6d8,,6dl,,6e8,f,6hc,w,6jm,,6k9,,6ms,5,6nd,1,6xm,1,6y0,,70o,,72n,,73d,a,73s,2,79e,,7fu,1,7g6,,7gg,,7i3,3,7i8,5,7if,b,7is,35,7m8,39,7pk,a,7pw,,7py,,7q5,,7q9,,7qg,,7qr,1,7r8,,7rb,,7rg,,7ri,,7rn,2,7rr,,7s3,4,7th,2,7tt,,7u8,,7un,,850,1,8hx,2,8ij,1,8k0,,8k5,,8vj,2,8zj,,928,v,9ii,5,9io,,9j1,,9ll,1,9zr,,9zt,,wvj,3,wvo,9,wwu,1,wz4,1,x6q,,x6u,,x6z,,x7n,1,x7p,1,x7r,,x7w,,xa8,1,xbo,f,xc4,1,xcw,h,xdr,,xeu,7,xfr,a,xg2,,xg3,,xgg,s,xhc,2,xhf,,xir,,xis,1,xiu,3,xiy,1,xj0,1,xj2,1,xj4,,xk5,,xm1,5,xm7,1,xm9,1,xmb,1,xmd,1,xmr,,xn0,,xn1,,xoc,,xps,,xpu,2,xpz,1,xq6,1,xq9,,xrf,,xrg,1,xri,1,xrp,,xrq,,xyb,1,xyd,,xye,1,xyg,,xyh,1,xyk,,xyl,,xz4,,xz5,q,xzw,,xzx,q,y0o,,y0p,q,y1g,,y1h,q,y28,,y29,q,y30,,y31,q,y3s,,y3t,q,y4k,,y4l,q,y5c,,y5d,q,y64,,y65,q,y6w,,y6x,q,y7o,,y7p,q,y8g,,y8h,q,y98,,y99,q,ya0,,ya1,q,yas,,yat,q,ybk,,ybl,q,ycc,,ycd,q,yd4,,yd5,q,ydw,,ydx,q,yeo,,yep,q,yfg,,yfh,q,yg8,,yg9,q,yh0,,yh1,q,yhs,,yht,q,yik,,yil,q,yjc,,yjd,q,yk4,,yk5,q,ykw,,ykx,q,ylo,,ylp,q,ymg,,ymh,q,yn8,,yn9,q,yo0,,yo1,q,yos,,yot,q,ypk,,ypl,q,yqc,,yqd,q,yr4,,yr5,q,yrw,,yrx,q,yso,,ysp,q,ytg,,yth,q,yu8,,yu9,q,yv0,,yv1,q,yvs,,yvt,q,ywk,,ywl,q,yxc,,yxd,q,yy4,,yy5,q,yyw,,yyx,q,yzo,,yzp,q,z0g,,z0h,q,z18,,z19,q,z20,,z21,q,z2s,,z2t,q,z3k,,z3l,q,z4c,,z4d,q,z54,,z55,q,z5w,,z5x,q,z6o,,z6p,q,z7g,,z7h,q,z88,,z89,q,z90,,z91,q,z9s,,z9t,q,zak,,zal,q,zbc,,zbd,q,zc4,,zc5,q,zcw,,zcx,q,zdo,,zdp,q,zeg,,zeh,q,zf8,,zf9,q,zg0,,zg1,q,zgs,,zgt,q,zhk,,zhl,q,zic,,zid,q,zj4,,zj5,q,zjw,,zjx,q,zko,,zkp,q,zlg,,zlh,q,zm8,,zm9,q,zn0,,zn1,q,zns,,znt,q,zok,,zol,q,zpc,,zpd,q,zq4,,zq5,q,zqw,,zqx,q,zro,,zrp,q,zsg,,zsh,q,zt8,,zt9,q,zu0,,zu1,q,zus,,zut,q,zvk,,zvl,q,zwc,,zwd,q,zx4,,zx5,q,zxw,,zxx,q,zyo,,zyp,q,zzg,,zzh,q,1008,,1009,q,1010,,1011,q,101s,,101t,q,102k,,102l,q,103c,,103d,q,1044,,1045,q,104w,,104x,q,105o,,105p,q,106g,,106h,q,1078,,1079,q,1080,,1081,q,108s,,108t,q,109k,,109l,q,10ac,,10ad,q,10b4,,10b5,q,10bw,,10bx,q,10co,,10cp,q,10dg,,10dh,q,10e8,,10e9,q,10f0,,10f1,q,10fs,,10ft,q,10gk,,10gl,q,10hc,,10hd,q,10i4,,10i5,q,10iw,,10ix,q,10jo,,10jp,q,10kg,,10kh,q,10l8,,10l9,q,10m0,,10m1,q,10ms,,10mt,q,10nk,,10nl,q,10oc,,10od,q,10p4,,10p5,q,10pw,,10px,q,10qo,,10qp,q,10rg,,10rh,q,10s8,,10s9,q,10t0,,10t1,q,10ts,,10tt,q,10uk,,10ul,q,10vc,,10vd,q,10w4,,10w5,q,10ww,,10wx,q,10xo,,10xp,q,10yg,,10yh,q,10z8,,10z9,q,1100,,1101,q,110s,,110t,q,111k,,111l,q,112c,,112d,q,1134,,1135,q,113w,,113x,q,114o,,114p,q,115g,,115h,q,1168,,1169,q,1170,,1171,q,117s,,117t,q,118k,,118l,q,119c,,119d,q,11a4,,11a5,q,11aw,,11ax,q,11bo,,11bp,q,11cg,,11ch,q,11d8,,11d9,q,11e0,,11e1,q,11es,,11et,q,11fk,,11fl,q,11gc,,11gd,q,11h4,,11h5,q,11hw,,11hx,q,11io,,11ip,q,11jg,,11jh,q,11k8,,11k9,q,11l0,,11l1,q,11ls,,11lt,q,11mk,,11ml,q,11nc,,11nd,q,11o4,,11o5,q,11ow,,11ox,q,11po,,11pp,q,11qg,,11qh,q,11r8,,11r9,q,11s0,,11s1,q,11ss,,11st,q,11tk,,11tl,q,11uc,,11ud,q,11v4,,11v5,q,11vw,,11vx,q,11wo,,11wp,q,11xg,,11xh,q,11y8,,11y9,q,11z0,,11z1,q,11zs,,11zt,q,120k,,120l,q,121c,,121d,q,1224,,1225,q,122w,,122x,q,123o,,123p,q,124g,,124h,q,1258,,1259,q,1260,,1261,q,126s,,126t,q,127k,,127l,q,128c,,128d,q,1294,,1295,q,129w,,129x,q,12ao,,12ap,q,12bg,,12bh,q,12c8,,12c9,q,12d0,,12d1,q,12ds,,12dt,q,12ek,,12el,q,12fc,,12fd,q,12g4,,12g5,q,12gw,,12gx,q,12ho,,12hp,q,12ig,,12ih,q,12j8,,12j9,q,12k0,,12k1,q,12ks,,12kt,q,12lk,,12ll,q,12mc,,12md,q,12n4,,12n5,q,12nw,,12nx,q,12oo,,12op,q,12pg,,12ph,q,12q8,,12q9,q,12r0,,12r1,q,12rs,,12rt,q,12sk,,12sl,q,12tc,,12td,q,12u4,,12u5,q,12uw,,12ux,q,12vo,,12vp,q,12wg,,12wh,q,12x8,,12x9,q,12y0,,12y1,q,12ys,,12yt,q,12zk,,12zl,q,130c,,130d,q,1314,,1315,q,131w,,131x,q,132o,,132p,q,133g,,133h,q,1348,,1349,q,1350,,1351,q,135s,,135t,q,136k,,136l,q,137c,,137d,q,1384,,1385,q,138w,,138x,q,139o,,139p,q,13ag,,13ah,q,13b8,,13b9,q,13c0,,13c1,q,13cs,,13ct,q,13dk,,13dl,q,13ec,,13ed,q,13f4,,13f5,q,13fw,,13fx,q,13go,,13gp,q,13hg,,13hh,q,13i8,,13i9,q,13j0,,13j1,q,13js,,13jt,q,13kk,,13kl,q,13lc,,13ld,q,13m4,,13m5,q,13mw,,13mx,q,13no,,13np,q,13og,,13oh,q,13p8,,13p9,q,13q0,,13q1,q,13qs,,13qt,q,13rk,,13rl,q,13sc,,13sd,q,13t4,,13t5,q,13tw,,13tx,q,13uo,,13up,q,13vg,,13vh,q,13w8,,13w9,q,13x0,,13x1,q,13xs,,13xt,q,13yk,,13yl,q,13zc,,13zd,q,1404,,1405,q,140w,,140x,q,141o,,141p,q,142g,,142h,q,1438,,1439,q,1440,,1441,q,144s,,144t,q,145k,,145l,q,146c,,146d,q,1474,,1475,q,147w,,147x,q,148o,,148p,q,149g,,149h,q,14a8,,14a9,q,14b0,,14b1,q,14bs,,14bt,q,14ck,,14cl,q,14dc,,14dd,q,14e4,,14e5,q,14ew,,14ex,q,14fo,,14fp,q,14gg,,14gh,q,14h8,,14h9,q,14i0,,14i1,q,14is,,14it,q,14jk,,14jl,q,14kc,,14kd,q,14l4,,14l5,q,14lw,,14lx,q,14mo,,14mp,q,14ng,,14nh,q,14o8,,14o9,q,14p0,,14p1,q,14ps,,14pt,q,14qk,,14ql,q,14rc,,14rd,q,14s4,,14s5,q,14sw,,14sx,q,14to,,14tp,q,14ug,,14uh,q,14v8,,14v9,q,14w0,,14w1,q,14ws,,14wt,q,14xk,,14xl,q,14yc,,14yd,q,14z4,,14z5,q,14zw,,14zx,q,150o,,150p,q,151g,,151h,q,1528,,1529,q,1530,,1531,q,153s,,153t,q,154k,,154l,q,155c,,155d,q,1564,,1565,q,156w,,156x,q,157o,,157p,q,158g,,158h,q,1598,,1599,q,15a0,,15a1,q,15as,,15at,q,15bk,,15bl,q,15cc,,15cd,q,15d4,,15d5,q,15dw,,15dx,q,15eo,,15ep,q,15fg,,15fh,q,15g8,,15g9,q,15h0,,15h1,q,15hs,,15ht,q,15ik,,15il,q,15jc,,15jd,q,15k4,,15k5,q,15kw,,15kx,q,15lo,,15lp,q,15mg,,15mh,q,15n8,,15n9,q,15o0,,15o1,q,15os,,15ot,q,15pk,,15pl,q,15qc,,15qd,q,15r4,,15r5,q,15rw,,15rx,q,15so,,15sp,q,15tg,,15th,q,15u8,,15u9,q,15v0,,15v1,q,15vs,,15vt,q,15wk,,15wl,q,15xc,,15xd,q,15y4,,15y5,q,15yw,,15yx,q,15zo,,15zp,q,160g,,160h,q,1618,,1619,q,1620,,1621,q,162s,,162t,q,163k,,163l,q,164c,,164d,q,1654,,1655,q,165w,,165x,q,166o,,166p,q,167g,,167h,q,1688,,1689,q,1690,,1691,q,169s,,169t,q,16ak,,16al,q,16bc,,16bd,q,16c4,,16c5,q,16cw,,16cx,q,16do,,16dp,q,16eg,,16eh,q,16f8,,16f9,q,16g0,,16g1,q,16gs,,16gt,q,16hk,,16hl,q,16ic,,16id,q,16j4,,16j5,q,16jw,,16jx,q,16ko,,16kp,q,16ls,m,16mj,1c,1dlq,,1e68,f,1e74,f,1edb,,1ehq,1,1ek0,b,1eyl,,1f4w,,1f92,4,1gjl,2,1gjp,1,1gjw,3,1gl4,2,1glb,,1gpx,1,1h5w,3,1h7t,4,1hgr,1,1hj0,3,1hl2,a,1hmq,3,1hq8,,1hq9,,1hqa,,1hrs,e,1htc,,1htf,1,1htr,2,1htu,,1hv4,2,1hv7,3,1hvb,1,1hvd,1,1hvh,,1hvm,,1hvx,,1hxc,2,1hyf,4,1hyk,,1hyl,7,1hz9,1,1i0j,,1i0w,1,1i0y,,1i2b,2,1i2e,8,1i2n,,1i2o,,1i2q,1,1i2x,3,1i32,,1i33,,1i5o,2,1i5r,2,1i5u,1,1i5w,3,1i66,,1i69,,1ian,,1iao,2,1iar,7,1ibk,1,1ibm,1,1id7,1,1ida,,1idb,,1idc,,1idd,3,1idj,1,1idn,1,1idp,,1idz,,1iea,1,1iee,6,1ieo,4,1igo,,1igp,1,1igr,5,1igy,,1ih1,,1ih3,2,1ih6,,1ih8,1,1iha,2,1ihd,,1ihe,,1iht,1,1ik5,2,1ik8,7,1ikg,1,1iki,2,1ikl,,1ikm,,1ila,,1ink,,1inl,1,1inn,5,1int,,1inu,,1inv,1,1inx,,1iny,,1inz,1,1io1,,1io2,1,1iun,,1iuo,1,1iuq,3,1iuw,3,1iv0,1,1iv2,,1iv3,1,1ivw,1,1iy8,2,1iyb,7,1iyj,1,1iyl,,1iym,,1iyn,1,1j1n,,1j1o,,1j1p,,1j1q,1,1j1s,7,1j4t,,1j4u,,1j4v,,1j4y,3,1j52,,1j53,4,1jcc,2,1jcf,8,1jco,,1jcp,1,1jjk,,1jjl,4,1jjr,1,1jjv,3,1jjz,,1jk0,,1jk1,,1jk2,,1jk3,,1jo1,2,1jo4,3,1joa,1,1joc,3,1jog,,1jok,,1jpd,9,1jqr,5,1jqx,,1jqy,,1jqz,3,1jrb,,1jrl,5,1jrr,1,1jrt,2,1jt0,5,1jt6,c,1jtj,,1jtk,1,1k4v,,1k4w,6,1k54,5,1k5a,,1k5b,,1k7m,l,1k89,,1k8a,6,1k8h,,1k8i,1,1k8k,,1k8l,1,1kc1,5,1kca,,1kcc,1,1kcf,6,1kcm,,1kcn,,1kei,4,1keo,1,1ker,1,1ket,,1keu,,1kev,,1koj,1,1kol,1,1kow,1,1koy,,1koz,,1kqc,1,1kqe,4,1kqm,1,1kqo,2,1kre,,1ovk,f,1ow0,,1ow7,e,1xr2,b,1xre,2,1xrh,2,1zow,4,1zqo,6,206b,,206f,3,20jz,,20k1,1i,20lr,3,20o4,,20og,1,2ftp,1,2fts,3,2jgg,19,2jhs,m,2jxh,4,2jxp,5,2jxv,7,2jy3,7,2jyd,6,2jze,3,2k3m,2,2lmo,1i,2lob,1d,2lpx,,2lqc,,2lqz,4,2lr5,e,2mtc,6,2mtk,g,2mu3,6,2mub,1,2mue,4,2mxb,,2n1s,6,2nce,,2ne4,3,2nsc,3,2nzi,1,2ok0,6,2on8,6,2pz4,73,2q6l,2,2q7j,,2q98,5,2q9q,1,2qa6,,2qa9,9,2qb1,1k,2qcm,p,2qdd,e,2qe2,,2qen,,2qeq,8,2qf0,3,2qfd,c1,2qrf,4,2qrk,8t,2r0m,7d,2r9c,3j,2rg4,b,2rit,16,2rkc,3,2rm0,7,2rmi,5,2rns,7,2rou,29,2rrg,1a,2rss,9,2rt3,c8,2scg,sd,jny8,v,jnz4,2n,jo1s,3j,jo5c,6n,joc0,2rz'),
  '262122424333333393233393339333333333393393b3b3b3b3b333b33b3bb33333b3b3333333b3b33bb3333b33b3bb33333b3bbb333b333b33333b3b3b3b3333b3b33b3bb39333b33b33b3b3b333b333333b3b333333b33b3b3333b3335dc333333b3b3b33323333b3bb3b33b3b3b3333b3333b3b333bb3b33b3b3b3b3b333b333b3323e2244234444444444444444444444444444444444444444443333443443333333b3b3bb33333b353b3b3b3b333b3b333b333333b3bb3b3b3bb3787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878787878dc333232333333333333333b3b3333bb3b393933b3b33bb3b393b3b3b3333b33b33b3bbb33b333b3333bb3933b3b3b333b3b3b3b3b33b3b3b33b3b3b33b3b33b33b3b3b33bb39b9b3b33b3b33b9333b393b3b33b33b3b3b3333393b3b3b33b39bb3b332333b333dd3b33332333323333333333333333333333344444444a44444434444444444444423232',
);

}, function(modId) { var map = {"./core.js":1747898168595}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1747898168602, function(require, module, exports) {
// The following code was generated by "scripts/unicode.js",
// DO NOT EDIT DIRECTLY.
//
// @ts-check

var __TEMP__ = require('./core.js');var decodeUnicodeData = __TEMP__['decodeUnicodeData'];

/**
 * @typedef {import('./core.js').UnicodeRange} UnicodeRange
 * @typedef {import('./core.js').UnicodeDataEncoding} UnicodeDataEncoding
 */

/**
 * The Unicode `Indic_Conjunct_Break=Consonant` derived property table
 *
 * @type {UnicodeRange[]}
 */
if (!exports.__esModule) Object.defineProperty(exports, "__esModule", { value: true });var consonant_ranges = exports.consonant_ranges = decodeUnicodeData(
  /** @type {UnicodeDataEncoding} */
  ('1sl,10,1ug,7,1vc,7,1w5,j,1wq,6,1wy,,1x2,3,1y4,1,1y7,,1yo,1,239,j,23u,6,242,1,245,4,261,,26t,j,27e,6,27m,1,27p,4,28s,1,28v,,29d,,2dx,j,2ei,f,2fs,2,2l1,11')
);

}, function(modId) { var map = {"./core.js":1747898168595}; return __REQUIRE__(map[modId], modId); })
return __REQUIRE__(1747898168593);
})()
//miniprogram-npm-outsideDeps=[]
//# sourceMappingURL=index.js.map