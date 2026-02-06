import { w as watch, j as onMounted, n as nextTick, Z as onUnmounted, y as openBlock, D as createElementBlock, G as createBaseVNode, E as createVNode, F as withCtx, u as unref, H as normalizeStyle, U as toDisplayString, R as createCommentVNode, W as Transition$1, r as ref, c as computed, S as createTextVNode, M as Fragment, a6 as renderList, I as normalizeClass, P as withDirectives, an as vModelText, am as withKeys, V as vShow, z as createBlock, Q as resolveDynamicComponent, aE as KeepAlive } from "./vue-vendor-rpbpBucb.js";
import { _ as _export_sfc, u as useGraphStore, a as useLayoutStore } from "./index-DDdIzyMR.js";
import { d as dispatch, t as timer, a as timeout, n as now, f as forceRadial, b as forceSimulation, c as forceLink, e as forceManyBody, g as forceCenter, h as forceManyBody$1, i as forceLink$1, j as forceCollide } from "./g6-of8JZalD.js";
import { s as select, p as pointer, n as namespace, m as matcher, a as selector, b as selectorAll, c as selection, d as styleValue, t as tinycolor, i as index$1, e as index$2, f as index$3, G as Group, o as ordinal, g as schemePaired, h as min$1, j as max$1, T as Tween, E as Easing, k as Graph3D } from "./Graph3D-B0AcdIba.js";
import { t as throttle, E as ElMessage } from "./element-plus-DavumCtP.js";
import { g as getActiveNodeTypes, a as getTypeGroups } from "./nodeColors-SuxP957Z.js";
function sum(values, valueof) {
  let sum2 = 0;
  {
    for (let value of values) {
      if (value = +value) {
        sum2 += value;
      }
    }
  }
  return sum2;
}
function define(constructor, factory, prototype) {
  constructor.prototype = factory.prototype = prototype;
  prototype.constructor = constructor;
}
function extend(parent, definition) {
  var prototype = Object.create(parent.prototype);
  for (var key in definition) prototype[key] = definition[key];
  return prototype;
}
function Color() {
}
var darker = 0.7;
var brighter = 1 / darker;
var reI = "\\s*([+-]?\\d+)\\s*", reN = "\\s*([+-]?(?:\\d*\\.)?\\d+(?:[eE][+-]?\\d+)?)\\s*", reP = "\\s*([+-]?(?:\\d*\\.)?\\d+(?:[eE][+-]?\\d+)?)%\\s*", reHex = /^#([0-9a-f]{3,8})$/, reRgbInteger = new RegExp(`^rgb\\(${reI},${reI},${reI}\\)$`), reRgbPercent = new RegExp(`^rgb\\(${reP},${reP},${reP}\\)$`), reRgbaInteger = new RegExp(`^rgba\\(${reI},${reI},${reI},${reN}\\)$`), reRgbaPercent = new RegExp(`^rgba\\(${reP},${reP},${reP},${reN}\\)$`), reHslPercent = new RegExp(`^hsl\\(${reN},${reP},${reP}\\)$`), reHslaPercent = new RegExp(`^hsla\\(${reN},${reP},${reP},${reN}\\)$`);
var named = {
  aliceblue: 15792383,
  antiquewhite: 16444375,
  aqua: 65535,
  aquamarine: 8388564,
  azure: 15794175,
  beige: 16119260,
  bisque: 16770244,
  black: 0,
  blanchedalmond: 16772045,
  blue: 255,
  blueviolet: 9055202,
  brown: 10824234,
  burlywood: 14596231,
  cadetblue: 6266528,
  chartreuse: 8388352,
  chocolate: 13789470,
  coral: 16744272,
  cornflowerblue: 6591981,
  cornsilk: 16775388,
  crimson: 14423100,
  cyan: 65535,
  darkblue: 139,
  darkcyan: 35723,
  darkgoldenrod: 12092939,
  darkgray: 11119017,
  darkgreen: 25600,
  darkgrey: 11119017,
  darkkhaki: 12433259,
  darkmagenta: 9109643,
  darkolivegreen: 5597999,
  darkorange: 16747520,
  darkorchid: 10040012,
  darkred: 9109504,
  darksalmon: 15308410,
  darkseagreen: 9419919,
  darkslateblue: 4734347,
  darkslategray: 3100495,
  darkslategrey: 3100495,
  darkturquoise: 52945,
  darkviolet: 9699539,
  deeppink: 16716947,
  deepskyblue: 49151,
  dimgray: 6908265,
  dimgrey: 6908265,
  dodgerblue: 2003199,
  firebrick: 11674146,
  floralwhite: 16775920,
  forestgreen: 2263842,
  fuchsia: 16711935,
  gainsboro: 14474460,
  ghostwhite: 16316671,
  gold: 16766720,
  goldenrod: 14329120,
  gray: 8421504,
  green: 32768,
  greenyellow: 11403055,
  grey: 8421504,
  honeydew: 15794160,
  hotpink: 16738740,
  indianred: 13458524,
  indigo: 4915330,
  ivory: 16777200,
  khaki: 15787660,
  lavender: 15132410,
  lavenderblush: 16773365,
  lawngreen: 8190976,
  lemonchiffon: 16775885,
  lightblue: 11393254,
  lightcoral: 15761536,
  lightcyan: 14745599,
  lightgoldenrodyellow: 16448210,
  lightgray: 13882323,
  lightgreen: 9498256,
  lightgrey: 13882323,
  lightpink: 16758465,
  lightsalmon: 16752762,
  lightseagreen: 2142890,
  lightskyblue: 8900346,
  lightslategray: 7833753,
  lightslategrey: 7833753,
  lightsteelblue: 11584734,
  lightyellow: 16777184,
  lime: 65280,
  limegreen: 3329330,
  linen: 16445670,
  magenta: 16711935,
  maroon: 8388608,
  mediumaquamarine: 6737322,
  mediumblue: 205,
  mediumorchid: 12211667,
  mediumpurple: 9662683,
  mediumseagreen: 3978097,
  mediumslateblue: 8087790,
  mediumspringgreen: 64154,
  mediumturquoise: 4772300,
  mediumvioletred: 13047173,
  midnightblue: 1644912,
  mintcream: 16121850,
  mistyrose: 16770273,
  moccasin: 16770229,
  navajowhite: 16768685,
  navy: 128,
  oldlace: 16643558,
  olive: 8421376,
  olivedrab: 7048739,
  orange: 16753920,
  orangered: 16729344,
  orchid: 14315734,
  palegoldenrod: 15657130,
  palegreen: 10025880,
  paleturquoise: 11529966,
  palevioletred: 14381203,
  papayawhip: 16773077,
  peachpuff: 16767673,
  peru: 13468991,
  pink: 16761035,
  plum: 14524637,
  powderblue: 11591910,
  purple: 8388736,
  rebeccapurple: 6697881,
  red: 16711680,
  rosybrown: 12357519,
  royalblue: 4286945,
  saddlebrown: 9127187,
  salmon: 16416882,
  sandybrown: 16032864,
  seagreen: 3050327,
  seashell: 16774638,
  sienna: 10506797,
  silver: 12632256,
  skyblue: 8900331,
  slateblue: 6970061,
  slategray: 7372944,
  slategrey: 7372944,
  snow: 16775930,
  springgreen: 65407,
  steelblue: 4620980,
  tan: 13808780,
  teal: 32896,
  thistle: 14204888,
  tomato: 16737095,
  turquoise: 4251856,
  violet: 15631086,
  wheat: 16113331,
  white: 16777215,
  whitesmoke: 16119285,
  yellow: 16776960,
  yellowgreen: 10145074
};
define(Color, color, {
  copy(channels) {
    return Object.assign(new this.constructor(), this, channels);
  },
  displayable() {
    return this.rgb().displayable();
  },
  hex: color_formatHex,
  // Deprecated! Use color.formatHex.
  formatHex: color_formatHex,
  formatHex8: color_formatHex8,
  formatHsl: color_formatHsl,
  formatRgb: color_formatRgb,
  toString: color_formatRgb
});
function color_formatHex() {
  return this.rgb().formatHex();
}
function color_formatHex8() {
  return this.rgb().formatHex8();
}
function color_formatHsl() {
  return hslConvert(this).formatHsl();
}
function color_formatRgb() {
  return this.rgb().formatRgb();
}
function color(format) {
  var m, l;
  format = (format + "").trim().toLowerCase();
  return (m = reHex.exec(format)) ? (l = m[1].length, m = parseInt(m[1], 16), l === 6 ? rgbn(m) : l === 3 ? new Rgb(m >> 8 & 15 | m >> 4 & 240, m >> 4 & 15 | m & 240, (m & 15) << 4 | m & 15, 1) : l === 8 ? rgba(m >> 24 & 255, m >> 16 & 255, m >> 8 & 255, (m & 255) / 255) : l === 4 ? rgba(m >> 12 & 15 | m >> 8 & 240, m >> 8 & 15 | m >> 4 & 240, m >> 4 & 15 | m & 240, ((m & 15) << 4 | m & 15) / 255) : null) : (m = reRgbInteger.exec(format)) ? new Rgb(m[1], m[2], m[3], 1) : (m = reRgbPercent.exec(format)) ? new Rgb(m[1] * 255 / 100, m[2] * 255 / 100, m[3] * 255 / 100, 1) : (m = reRgbaInteger.exec(format)) ? rgba(m[1], m[2], m[3], m[4]) : (m = reRgbaPercent.exec(format)) ? rgba(m[1] * 255 / 100, m[2] * 255 / 100, m[3] * 255 / 100, m[4]) : (m = reHslPercent.exec(format)) ? hsla(m[1], m[2] / 100, m[3] / 100, 1) : (m = reHslaPercent.exec(format)) ? hsla(m[1], m[2] / 100, m[3] / 100, m[4]) : named.hasOwnProperty(format) ? rgbn(named[format]) : format === "transparent" ? new Rgb(NaN, NaN, NaN, 0) : null;
}
function rgbn(n) {
  return new Rgb(n >> 16 & 255, n >> 8 & 255, n & 255, 1);
}
function rgba(r, g, b, a) {
  if (a <= 0) r = g = b = NaN;
  return new Rgb(r, g, b, a);
}
function rgbConvert(o) {
  if (!(o instanceof Color)) o = color(o);
  if (!o) return new Rgb();
  o = o.rgb();
  return new Rgb(o.r, o.g, o.b, o.opacity);
}
function rgb(r, g, b, opacity) {
  return arguments.length === 1 ? rgbConvert(r) : new Rgb(r, g, b, opacity == null ? 1 : opacity);
}
function Rgb(r, g, b, opacity) {
  this.r = +r;
  this.g = +g;
  this.b = +b;
  this.opacity = +opacity;
}
define(Rgb, rgb, extend(Color, {
  brighter(k) {
    k = k == null ? brighter : Math.pow(brighter, k);
    return new Rgb(this.r * k, this.g * k, this.b * k, this.opacity);
  },
  darker(k) {
    k = k == null ? darker : Math.pow(darker, k);
    return new Rgb(this.r * k, this.g * k, this.b * k, this.opacity);
  },
  rgb() {
    return this;
  },
  clamp() {
    return new Rgb(clampi(this.r), clampi(this.g), clampi(this.b), clampa(this.opacity));
  },
  displayable() {
    return -0.5 <= this.r && this.r < 255.5 && (-0.5 <= this.g && this.g < 255.5) && (-0.5 <= this.b && this.b < 255.5) && (0 <= this.opacity && this.opacity <= 1);
  },
  hex: rgb_formatHex,
  // Deprecated! Use color.formatHex.
  formatHex: rgb_formatHex,
  formatHex8: rgb_formatHex8,
  formatRgb: rgb_formatRgb,
  toString: rgb_formatRgb
}));
function rgb_formatHex() {
  return `#${hex(this.r)}${hex(this.g)}${hex(this.b)}`;
}
function rgb_formatHex8() {
  return `#${hex(this.r)}${hex(this.g)}${hex(this.b)}${hex((isNaN(this.opacity) ? 1 : this.opacity) * 255)}`;
}
function rgb_formatRgb() {
  const a = clampa(this.opacity);
  return `${a === 1 ? "rgb(" : "rgba("}${clampi(this.r)}, ${clampi(this.g)}, ${clampi(this.b)}${a === 1 ? ")" : `, ${a})`}`;
}
function clampa(opacity) {
  return isNaN(opacity) ? 1 : Math.max(0, Math.min(1, opacity));
}
function clampi(value) {
  return Math.max(0, Math.min(255, Math.round(value) || 0));
}
function hex(value) {
  value = clampi(value);
  return (value < 16 ? "0" : "") + value.toString(16);
}
function hsla(h, s, l, a) {
  if (a <= 0) h = s = l = NaN;
  else if (l <= 0 || l >= 1) h = s = NaN;
  else if (s <= 0) h = NaN;
  return new Hsl(h, s, l, a);
}
function hslConvert(o) {
  if (o instanceof Hsl) return new Hsl(o.h, o.s, o.l, o.opacity);
  if (!(o instanceof Color)) o = color(o);
  if (!o) return new Hsl();
  if (o instanceof Hsl) return o;
  o = o.rgb();
  var r = o.r / 255, g = o.g / 255, b = o.b / 255, min2 = Math.min(r, g, b), max2 = Math.max(r, g, b), h = NaN, s = max2 - min2, l = (max2 + min2) / 2;
  if (s) {
    if (r === max2) h = (g - b) / s + (g < b) * 6;
    else if (g === max2) h = (b - r) / s + 2;
    else h = (r - g) / s + 4;
    s /= l < 0.5 ? max2 + min2 : 2 - max2 - min2;
    h *= 60;
  } else {
    s = l > 0 && l < 1 ? 0 : h;
  }
  return new Hsl(h, s, l, o.opacity);
}
function hsl(h, s, l, opacity) {
  return arguments.length === 1 ? hslConvert(h) : new Hsl(h, s, l, opacity == null ? 1 : opacity);
}
function Hsl(h, s, l, opacity) {
  this.h = +h;
  this.s = +s;
  this.l = +l;
  this.opacity = +opacity;
}
define(Hsl, hsl, extend(Color, {
  brighter(k) {
    k = k == null ? brighter : Math.pow(brighter, k);
    return new Hsl(this.h, this.s, this.l * k, this.opacity);
  },
  darker(k) {
    k = k == null ? darker : Math.pow(darker, k);
    return new Hsl(this.h, this.s, this.l * k, this.opacity);
  },
  rgb() {
    var h = this.h % 360 + (this.h < 0) * 360, s = isNaN(h) || isNaN(this.s) ? 0 : this.s, l = this.l, m2 = l + (l < 0.5 ? l : 1 - l) * s, m1 = 2 * l - m2;
    return new Rgb(
      hsl2rgb(h >= 240 ? h - 240 : h + 120, m1, m2),
      hsl2rgb(h, m1, m2),
      hsl2rgb(h < 120 ? h + 240 : h - 120, m1, m2),
      this.opacity
    );
  },
  clamp() {
    return new Hsl(clamph(this.h), clampt(this.s), clampt(this.l), clampa(this.opacity));
  },
  displayable() {
    return (0 <= this.s && this.s <= 1 || isNaN(this.s)) && (0 <= this.l && this.l <= 1) && (0 <= this.opacity && this.opacity <= 1);
  },
  formatHsl() {
    const a = clampa(this.opacity);
    return `${a === 1 ? "hsl(" : "hsla("}${clamph(this.h)}, ${clampt(this.s) * 100}%, ${clampt(this.l) * 100}%${a === 1 ? ")" : `, ${a})`}`;
  }
}));
function clamph(value) {
  value = (value || 0) % 360;
  return value < 0 ? value + 360 : value;
}
function clampt(value) {
  return Math.max(0, Math.min(1, value || 0));
}
function hsl2rgb(h, m1, m2) {
  return (h < 60 ? m1 + (m2 - m1) * h / 60 : h < 180 ? m2 : h < 240 ? m1 + (m2 - m1) * (240 - h) / 60 : m1) * 255;
}
const constant$2 = (x) => () => x;
function linear(a, d) {
  return function(t2) {
    return a + t2 * d;
  };
}
function exponential(a, b, y) {
  return a = Math.pow(a, y), b = Math.pow(b, y) - a, y = 1 / y, function(t2) {
    return Math.pow(a + t2 * b, y);
  };
}
function gamma(y) {
  return (y = +y) === 1 ? nogamma : function(a, b) {
    return b - a ? exponential(a, b, y) : constant$2(isNaN(a) ? b : a);
  };
}
function nogamma(a, b) {
  var d = b - a;
  return d ? linear(a, d) : constant$2(isNaN(a) ? b : a);
}
const interpolateRgb = function rgbGamma(y) {
  var color2 = gamma(y);
  function rgb$1(start2, end) {
    var r = color2((start2 = rgb(start2)).r, (end = rgb(end)).r), g = color2(start2.g, end.g), b = color2(start2.b, end.b), opacity = nogamma(start2.opacity, end.opacity);
    return function(t2) {
      start2.r = r(t2);
      start2.g = g(t2);
      start2.b = b(t2);
      start2.opacity = opacity(t2);
      return start2 + "";
    };
  }
  rgb$1.gamma = rgbGamma;
  return rgb$1;
}(1);
function interpolateNumber(a, b) {
  return a = +a, b = +b, function(t2) {
    return a * (1 - t2) + b * t2;
  };
}
var reA = /[-+]?(?:\d+\.?\d*|\.?\d+)(?:[eE][-+]?\d+)?/g, reB = new RegExp(reA.source, "g");
function zero(b) {
  return function() {
    return b;
  };
}
function one(b) {
  return function(t2) {
    return b(t2) + "";
  };
}
function interpolateString(a, b) {
  var bi = reA.lastIndex = reB.lastIndex = 0, am, bm, bs, i = -1, s = [], q = [];
  a = a + "", b = b + "";
  while ((am = reA.exec(a)) && (bm = reB.exec(b))) {
    if ((bs = bm.index) > bi) {
      bs = b.slice(bi, bs);
      if (s[i]) s[i] += bs;
      else s[++i] = bs;
    }
    if ((am = am[0]) === (bm = bm[0])) {
      if (s[i]) s[i] += bm;
      else s[++i] = bm;
    } else {
      s[++i] = null;
      q.push({ i, x: interpolateNumber(am, bm) });
    }
    bi = reB.lastIndex;
  }
  if (bi < b.length) {
    bs = b.slice(bi);
    if (s[i]) s[i] += bs;
    else s[++i] = bs;
  }
  return s.length < 2 ? q[0] ? one(q[0].x) : zero(b) : (b = q.length, function(t2) {
    for (var i2 = 0, o; i2 < b; ++i2) s[(o = q[i2]).i] = o.x(t2);
    return s.join("");
  });
}
var degrees = 180 / Math.PI;
var identity$1 = {
  translateX: 0,
  translateY: 0,
  rotate: 0,
  skewX: 0,
  scaleX: 1,
  scaleY: 1
};
function decompose(a, b, c, d, e, f) {
  var scaleX, scaleY, skewX;
  if (scaleX = Math.sqrt(a * a + b * b)) a /= scaleX, b /= scaleX;
  if (skewX = a * c + b * d) c -= a * skewX, d -= b * skewX;
  if (scaleY = Math.sqrt(c * c + d * d)) c /= scaleY, d /= scaleY, skewX /= scaleY;
  if (a * d < b * c) a = -a, b = -b, skewX = -skewX, scaleX = -scaleX;
  return {
    translateX: e,
    translateY: f,
    rotate: Math.atan2(b, a) * degrees,
    skewX: Math.atan(skewX) * degrees,
    scaleX,
    scaleY
  };
}
var svgNode;
function parseCss(value) {
  const m = new (typeof DOMMatrix === "function" ? DOMMatrix : WebKitCSSMatrix)(value + "");
  return m.isIdentity ? identity$1 : decompose(m.a, m.b, m.c, m.d, m.e, m.f);
}
function parseSvg(value) {
  if (value == null) return identity$1;
  if (!svgNode) svgNode = document.createElementNS("http://www.w3.org/2000/svg", "g");
  svgNode.setAttribute("transform", value);
  if (!(value = svgNode.transform.baseVal.consolidate())) return identity$1;
  value = value.matrix;
  return decompose(value.a, value.b, value.c, value.d, value.e, value.f);
}
function interpolateTransform(parse, pxComma, pxParen, degParen) {
  function pop(s) {
    return s.length ? s.pop() + " " : "";
  }
  function translate(xa, ya, xb, yb, s, q) {
    if (xa !== xb || ya !== yb) {
      var i = s.push("translate(", null, pxComma, null, pxParen);
      q.push({ i: i - 4, x: interpolateNumber(xa, xb) }, { i: i - 2, x: interpolateNumber(ya, yb) });
    } else if (xb || yb) {
      s.push("translate(" + xb + pxComma + yb + pxParen);
    }
  }
  function rotate(a, b, s, q) {
    if (a !== b) {
      if (a - b > 180) b += 360;
      else if (b - a > 180) a += 360;
      q.push({ i: s.push(pop(s) + "rotate(", null, degParen) - 2, x: interpolateNumber(a, b) });
    } else if (b) {
      s.push(pop(s) + "rotate(" + b + degParen);
    }
  }
  function skewX(a, b, s, q) {
    if (a !== b) {
      q.push({ i: s.push(pop(s) + "skewX(", null, degParen) - 2, x: interpolateNumber(a, b) });
    } else if (b) {
      s.push(pop(s) + "skewX(" + b + degParen);
    }
  }
  function scale(xa, ya, xb, yb, s, q) {
    if (xa !== xb || ya !== yb) {
      var i = s.push(pop(s) + "scale(", null, ",", null, ")");
      q.push({ i: i - 4, x: interpolateNumber(xa, xb) }, { i: i - 2, x: interpolateNumber(ya, yb) });
    } else if (xb !== 1 || yb !== 1) {
      s.push(pop(s) + "scale(" + xb + "," + yb + ")");
    }
  }
  return function(a, b) {
    var s = [], q = [];
    a = parse(a), b = parse(b);
    translate(a.translateX, a.translateY, b.translateX, b.translateY, s, q);
    rotate(a.rotate, b.rotate, s, q);
    skewX(a.skewX, b.skewX, s, q);
    scale(a.scaleX, a.scaleY, b.scaleX, b.scaleY, s, q);
    a = b = null;
    return function(t2) {
      var i = -1, n = q.length, o;
      while (++i < n) s[(o = q[i]).i] = o.x(t2);
      return s.join("");
    };
  };
}
var interpolateTransformCss = interpolateTransform(parseCss, "px, ", "px)", "deg)");
var interpolateTransformSvg = interpolateTransform(parseSvg, ", ", ")", ")");
var epsilon2 = 1e-12;
function cosh(x) {
  return ((x = Math.exp(x)) + 1 / x) / 2;
}
function sinh(x) {
  return ((x = Math.exp(x)) - 1 / x) / 2;
}
function tanh(x) {
  return ((x = Math.exp(2 * x)) - 1) / (x + 1);
}
const interpolateZoom = function zoomRho(rho, rho2, rho4) {
  function zoom3(p0, p1) {
    var ux0 = p0[0], uy0 = p0[1], w0 = p0[2], ux1 = p1[0], uy1 = p1[1], w1 = p1[2], dx = ux1 - ux0, dy = uy1 - uy0, d2 = dx * dx + dy * dy, i, S;
    if (d2 < epsilon2) {
      S = Math.log(w1 / w0) / rho;
      i = function(t2) {
        return [
          ux0 + t2 * dx,
          uy0 + t2 * dy,
          w0 * Math.exp(rho * t2 * S)
        ];
      };
    } else {
      var d1 = Math.sqrt(d2), b0 = (w1 * w1 - w0 * w0 + rho4 * d2) / (2 * w0 * rho2 * d1), b1 = (w1 * w1 - w0 * w0 - rho4 * d2) / (2 * w1 * rho2 * d1), r0 = Math.log(Math.sqrt(b0 * b0 + 1) - b0), r1 = Math.log(Math.sqrt(b1 * b1 + 1) - b1);
      S = (r1 - r0) / rho;
      i = function(t2) {
        var s = t2 * S, coshr0 = cosh(r0), u = w0 / (rho2 * d1) * (coshr0 * tanh(rho * s + r0) - sinh(r0));
        return [
          ux0 + u * dx,
          uy0 + u * dy,
          w0 * coshr0 / cosh(rho * s + r0)
        ];
      };
    }
    i.duration = S * 1e3 * rho / Math.SQRT2;
    return i;
  }
  zoom3.rho = function(_) {
    var _1 = Math.max(1e-3, +_), _2 = _1 * _1, _4 = _2 * _2;
    return zoomRho(_1, _2, _4);
  };
  return zoom3;
}(Math.SQRT2, 2, 4);
const nonpassive = { passive: false };
const nonpassivecapture = { capture: true, passive: false };
function nopropagation$1(event) {
  event.stopImmediatePropagation();
}
function noevent$1(event) {
  event.preventDefault();
  event.stopImmediatePropagation();
}
function dragDisable(view) {
  var root = view.document.documentElement, selection2 = select(view).on("dragstart.drag", noevent$1, nonpassivecapture);
  if ("onselectstart" in root) {
    selection2.on("selectstart.drag", noevent$1, nonpassivecapture);
  } else {
    root.__noselect = root.style.MozUserSelect;
    root.style.MozUserSelect = "none";
  }
}
function yesdrag(view, noclick) {
  var root = view.document.documentElement, selection2 = select(view).on("dragstart.drag", null);
  if (noclick) {
    selection2.on("click.drag", noevent$1, nonpassivecapture);
    setTimeout(function() {
      selection2.on("click.drag", null);
    }, 0);
  }
  if ("onselectstart" in root) {
    selection2.on("selectstart.drag", null);
  } else {
    root.style.MozUserSelect = root.__noselect;
    delete root.__noselect;
  }
}
const constant$1 = (x) => () => x;
function DragEvent(type, {
  sourceEvent,
  subject,
  target,
  identifier,
  active,
  x,
  y,
  dx,
  dy,
  dispatch: dispatch2
}) {
  Object.defineProperties(this, {
    type: { value: type, enumerable: true, configurable: true },
    sourceEvent: { value: sourceEvent, enumerable: true, configurable: true },
    subject: { value: subject, enumerable: true, configurable: true },
    target: { value: target, enumerable: true, configurable: true },
    identifier: { value: identifier, enumerable: true, configurable: true },
    active: { value: active, enumerable: true, configurable: true },
    x: { value: x, enumerable: true, configurable: true },
    y: { value: y, enumerable: true, configurable: true },
    dx: { value: dx, enumerable: true, configurable: true },
    dy: { value: dy, enumerable: true, configurable: true },
    _: { value: dispatch2 }
  });
}
DragEvent.prototype.on = function() {
  var value = this._.on.apply(this._, arguments);
  return value === this._ ? this : value;
};
function defaultFilter$1(event) {
  return !event.ctrlKey && !event.button;
}
function defaultContainer() {
  return this.parentNode;
}
function defaultSubject(event, d) {
  return d == null ? { x: event.x, y: event.y } : d;
}
function defaultTouchable$1() {
  return navigator.maxTouchPoints || "ontouchstart" in this;
}
function drag() {
  var filter = defaultFilter$1, container = defaultContainer, subject = defaultSubject, touchable = defaultTouchable$1, gestures = {}, listeners = dispatch("start", "drag", "end"), active = 0, mousedownx, mousedowny, mousemoving, touchending, clickDistance2 = 0;
  function drag2(selection2) {
    selection2.on("mousedown.drag", mousedowned).filter(touchable).on("touchstart.drag", touchstarted).on("touchmove.drag", touchmoved, nonpassive).on("touchend.drag touchcancel.drag", touchended).style("touch-action", "none").style("-webkit-tap-highlight-color", "rgba(0,0,0,0)");
  }
  function mousedowned(event, d) {
    if (touchending || !filter.call(this, event, d)) return;
    var gesture = beforestart(this, container.call(this, event, d), event, d, "mouse");
    if (!gesture) return;
    select(event.view).on("mousemove.drag", mousemoved, nonpassivecapture).on("mouseup.drag", mouseupped, nonpassivecapture);
    dragDisable(event.view);
    nopropagation$1(event);
    mousemoving = false;
    mousedownx = event.clientX;
    mousedowny = event.clientY;
    gesture("start", event);
  }
  function mousemoved(event) {
    noevent$1(event);
    if (!mousemoving) {
      var dx = event.clientX - mousedownx, dy = event.clientY - mousedowny;
      mousemoving = dx * dx + dy * dy > clickDistance2;
    }
    gestures.mouse("drag", event);
  }
  function mouseupped(event) {
    select(event.view).on("mousemove.drag mouseup.drag", null);
    yesdrag(event.view, mousemoving);
    noevent$1(event);
    gestures.mouse("end", event);
  }
  function touchstarted(event, d) {
    if (!filter.call(this, event, d)) return;
    var touches = event.changedTouches, c = container.call(this, event, d), n = touches.length, i, gesture;
    for (i = 0; i < n; ++i) {
      if (gesture = beforestart(this, c, event, d, touches[i].identifier, touches[i])) {
        nopropagation$1(event);
        gesture("start", event, touches[i]);
      }
    }
  }
  function touchmoved(event) {
    var touches = event.changedTouches, n = touches.length, i, gesture;
    for (i = 0; i < n; ++i) {
      if (gesture = gestures[touches[i].identifier]) {
        noevent$1(event);
        gesture("drag", event, touches[i]);
      }
    }
  }
  function touchended(event) {
    var touches = event.changedTouches, n = touches.length, i, gesture;
    if (touchending) clearTimeout(touchending);
    touchending = setTimeout(function() {
      touchending = null;
    }, 500);
    for (i = 0; i < n; ++i) {
      if (gesture = gestures[touches[i].identifier]) {
        nopropagation$1(event);
        gesture("end", event, touches[i]);
      }
    }
  }
  function beforestart(that, container2, event, d, identifier, touch) {
    var dispatch2 = listeners.copy(), p = pointer(touch || event, container2), dx, dy, s;
    if ((s = subject.call(that, new DragEvent("beforestart", {
      sourceEvent: event,
      target: drag2,
      identifier,
      active,
      x: p[0],
      y: p[1],
      dx: 0,
      dy: 0,
      dispatch: dispatch2
    }), d)) == null) return;
    dx = s.x - p[0] || 0;
    dy = s.y - p[1] || 0;
    return function gesture(type, event2, touch2) {
      var p0 = p, n;
      switch (type) {
        case "start":
          gestures[identifier] = gesture, n = active++;
          break;
        case "end":
          delete gestures[identifier], --active;
        case "drag":
          p = pointer(touch2 || event2, container2), n = active;
          break;
      }
      dispatch2.call(
        type,
        that,
        new DragEvent(type, {
          sourceEvent: event2,
          subject: s,
          target: drag2,
          identifier,
          active: n,
          x: p[0] + dx,
          y: p[1] + dy,
          dx: p[0] - p0[0],
          dy: p[1] - p0[1],
          dispatch: dispatch2
        }),
        d
      );
    };
  }
  drag2.filter = function(_) {
    return arguments.length ? (filter = typeof _ === "function" ? _ : constant$1(!!_), drag2) : filter;
  };
  drag2.container = function(_) {
    return arguments.length ? (container = typeof _ === "function" ? _ : constant$1(_), drag2) : container;
  };
  drag2.subject = function(_) {
    return arguments.length ? (subject = typeof _ === "function" ? _ : constant$1(_), drag2) : subject;
  };
  drag2.touchable = function(_) {
    return arguments.length ? (touchable = typeof _ === "function" ? _ : constant$1(!!_), drag2) : touchable;
  };
  drag2.on = function() {
    var value = listeners.on.apply(listeners, arguments);
    return value === listeners ? drag2 : value;
  };
  drag2.clickDistance = function(_) {
    return arguments.length ? (clickDistance2 = (_ = +_) * _, drag2) : Math.sqrt(clickDistance2);
  };
  return drag2;
}
var emptyOn = dispatch("start", "end", "cancel", "interrupt");
var emptyTween = [];
var CREATED = 0;
var SCHEDULED = 1;
var STARTING = 2;
var STARTED = 3;
var RUNNING = 4;
var ENDING = 5;
var ENDED = 6;
function schedule(node, name, id2, index2, group, timing) {
  var schedules = node.__transition;
  if (!schedules) node.__transition = {};
  else if (id2 in schedules) return;
  create(node, id2, {
    name,
    index: index2,
    // For context during callback.
    group,
    // For context during callback.
    on: emptyOn,
    tween: emptyTween,
    time: timing.time,
    delay: timing.delay,
    duration: timing.duration,
    ease: timing.ease,
    timer: null,
    state: CREATED
  });
}
function init(node, id2) {
  var schedule2 = get(node, id2);
  if (schedule2.state > CREATED) throw new Error("too late; already scheduled");
  return schedule2;
}
function set(node, id2) {
  var schedule2 = get(node, id2);
  if (schedule2.state > STARTED) throw new Error("too late; already running");
  return schedule2;
}
function get(node, id2) {
  var schedule2 = node.__transition;
  if (!schedule2 || !(schedule2 = schedule2[id2])) throw new Error("transition not found");
  return schedule2;
}
function create(node, id2, self) {
  var schedules = node.__transition, tween;
  schedules[id2] = self;
  self.timer = timer(schedule2, 0, self.time);
  function schedule2(elapsed) {
    self.state = SCHEDULED;
    self.timer.restart(start2, self.delay, self.time);
    if (self.delay <= elapsed) start2(elapsed - self.delay);
  }
  function start2(elapsed) {
    var i, j, n, o;
    if (self.state !== SCHEDULED) return stop();
    for (i in schedules) {
      o = schedules[i];
      if (o.name !== self.name) continue;
      if (o.state === STARTED) return timeout(start2);
      if (o.state === RUNNING) {
        o.state = ENDED;
        o.timer.stop();
        o.on.call("interrupt", node, node.__data__, o.index, o.group);
        delete schedules[i];
      } else if (+i < id2) {
        o.state = ENDED;
        o.timer.stop();
        o.on.call("cancel", node, node.__data__, o.index, o.group);
        delete schedules[i];
      }
    }
    timeout(function() {
      if (self.state === STARTED) {
        self.state = RUNNING;
        self.timer.restart(tick, self.delay, self.time);
        tick(elapsed);
      }
    });
    self.state = STARTING;
    self.on.call("start", node, node.__data__, self.index, self.group);
    if (self.state !== STARTING) return;
    self.state = STARTED;
    tween = new Array(n = self.tween.length);
    for (i = 0, j = -1; i < n; ++i) {
      if (o = self.tween[i].value.call(node, node.__data__, self.index, self.group)) {
        tween[++j] = o;
      }
    }
    tween.length = j + 1;
  }
  function tick(elapsed) {
    var t2 = elapsed < self.duration ? self.ease.call(null, elapsed / self.duration) : (self.timer.restart(stop), self.state = ENDING, 1), i = -1, n = tween.length;
    while (++i < n) {
      tween[i].call(node, t2);
    }
    if (self.state === ENDING) {
      self.on.call("end", node, node.__data__, self.index, self.group);
      stop();
    }
  }
  function stop() {
    self.state = ENDED;
    self.timer.stop();
    delete schedules[id2];
    for (var i in schedules) return;
    delete node.__transition;
  }
}
function interrupt(node, name) {
  var schedules = node.__transition, schedule2, active, empty = true, i;
  if (!schedules) return;
  name = name == null ? null : name + "";
  for (i in schedules) {
    if ((schedule2 = schedules[i]).name !== name) {
      empty = false;
      continue;
    }
    active = schedule2.state > STARTING && schedule2.state < ENDING;
    schedule2.state = ENDED;
    schedule2.timer.stop();
    schedule2.on.call(active ? "interrupt" : "cancel", node, node.__data__, schedule2.index, schedule2.group);
    delete schedules[i];
  }
  if (empty) delete node.__transition;
}
function selection_interrupt(name) {
  return this.each(function() {
    interrupt(this, name);
  });
}
function tweenRemove(id2, name) {
  var tween0, tween1;
  return function() {
    var schedule2 = set(this, id2), tween = schedule2.tween;
    if (tween !== tween0) {
      tween1 = tween0 = tween;
      for (var i = 0, n = tween1.length; i < n; ++i) {
        if (tween1[i].name === name) {
          tween1 = tween1.slice();
          tween1.splice(i, 1);
          break;
        }
      }
    }
    schedule2.tween = tween1;
  };
}
function tweenFunction(id2, name, value) {
  var tween0, tween1;
  if (typeof value !== "function") throw new Error();
  return function() {
    var schedule2 = set(this, id2), tween = schedule2.tween;
    if (tween !== tween0) {
      tween1 = (tween0 = tween).slice();
      for (var t2 = { name, value }, i = 0, n = tween1.length; i < n; ++i) {
        if (tween1[i].name === name) {
          tween1[i] = t2;
          break;
        }
      }
      if (i === n) tween1.push(t2);
    }
    schedule2.tween = tween1;
  };
}
function transition_tween(name, value) {
  var id2 = this._id;
  name += "";
  if (arguments.length < 2) {
    var tween = get(this.node(), id2).tween;
    for (var i = 0, n = tween.length, t2; i < n; ++i) {
      if ((t2 = tween[i]).name === name) {
        return t2.value;
      }
    }
    return null;
  }
  return this.each((value == null ? tweenRemove : tweenFunction)(id2, name, value));
}
function tweenValue(transition, name, value) {
  var id2 = transition._id;
  transition.each(function() {
    var schedule2 = set(this, id2);
    (schedule2.value || (schedule2.value = {}))[name] = value.apply(this, arguments);
  });
  return function(node) {
    return get(node, id2).value[name];
  };
}
function interpolate(a, b) {
  var c;
  return (typeof b === "number" ? interpolateNumber : b instanceof color ? interpolateRgb : (c = color(b)) ? (b = c, interpolateRgb) : interpolateString)(a, b);
}
function attrRemove(name) {
  return function() {
    this.removeAttribute(name);
  };
}
function attrRemoveNS(fullname) {
  return function() {
    this.removeAttributeNS(fullname.space, fullname.local);
  };
}
function attrConstant(name, interpolate2, value1) {
  var string00, string1 = value1 + "", interpolate0;
  return function() {
    var string0 = this.getAttribute(name);
    return string0 === string1 ? null : string0 === string00 ? interpolate0 : interpolate0 = interpolate2(string00 = string0, value1);
  };
}
function attrConstantNS(fullname, interpolate2, value1) {
  var string00, string1 = value1 + "", interpolate0;
  return function() {
    var string0 = this.getAttributeNS(fullname.space, fullname.local);
    return string0 === string1 ? null : string0 === string00 ? interpolate0 : interpolate0 = interpolate2(string00 = string0, value1);
  };
}
function attrFunction(name, interpolate2, value) {
  var string00, string10, interpolate0;
  return function() {
    var string0, value1 = value(this), string1;
    if (value1 == null) return void this.removeAttribute(name);
    string0 = this.getAttribute(name);
    string1 = value1 + "";
    return string0 === string1 ? null : string0 === string00 && string1 === string10 ? interpolate0 : (string10 = string1, interpolate0 = interpolate2(string00 = string0, value1));
  };
}
function attrFunctionNS(fullname, interpolate2, value) {
  var string00, string10, interpolate0;
  return function() {
    var string0, value1 = value(this), string1;
    if (value1 == null) return void this.removeAttributeNS(fullname.space, fullname.local);
    string0 = this.getAttributeNS(fullname.space, fullname.local);
    string1 = value1 + "";
    return string0 === string1 ? null : string0 === string00 && string1 === string10 ? interpolate0 : (string10 = string1, interpolate0 = interpolate2(string00 = string0, value1));
  };
}
function transition_attr(name, value) {
  var fullname = namespace(name), i = fullname === "transform" ? interpolateTransformSvg : interpolate;
  return this.attrTween(name, typeof value === "function" ? (fullname.local ? attrFunctionNS : attrFunction)(fullname, i, tweenValue(this, "attr." + name, value)) : value == null ? (fullname.local ? attrRemoveNS : attrRemove)(fullname) : (fullname.local ? attrConstantNS : attrConstant)(fullname, i, value));
}
function attrInterpolate(name, i) {
  return function(t2) {
    this.setAttribute(name, i.call(this, t2));
  };
}
function attrInterpolateNS(fullname, i) {
  return function(t2) {
    this.setAttributeNS(fullname.space, fullname.local, i.call(this, t2));
  };
}
function attrTweenNS(fullname, value) {
  var t0, i0;
  function tween() {
    var i = value.apply(this, arguments);
    if (i !== i0) t0 = (i0 = i) && attrInterpolateNS(fullname, i);
    return t0;
  }
  tween._value = value;
  return tween;
}
function attrTween(name, value) {
  var t0, i0;
  function tween() {
    var i = value.apply(this, arguments);
    if (i !== i0) t0 = (i0 = i) && attrInterpolate(name, i);
    return t0;
  }
  tween._value = value;
  return tween;
}
function transition_attrTween(name, value) {
  var key = "attr." + name;
  if (arguments.length < 2) return (key = this.tween(key)) && key._value;
  if (value == null) return this.tween(key, null);
  if (typeof value !== "function") throw new Error();
  var fullname = namespace(name);
  return this.tween(key, (fullname.local ? attrTweenNS : attrTween)(fullname, value));
}
function delayFunction(id2, value) {
  return function() {
    init(this, id2).delay = +value.apply(this, arguments);
  };
}
function delayConstant(id2, value) {
  return value = +value, function() {
    init(this, id2).delay = value;
  };
}
function transition_delay(value) {
  var id2 = this._id;
  return arguments.length ? this.each((typeof value === "function" ? delayFunction : delayConstant)(id2, value)) : get(this.node(), id2).delay;
}
function durationFunction(id2, value) {
  return function() {
    set(this, id2).duration = +value.apply(this, arguments);
  };
}
function durationConstant(id2, value) {
  return value = +value, function() {
    set(this, id2).duration = value;
  };
}
function transition_duration(value) {
  var id2 = this._id;
  return arguments.length ? this.each((typeof value === "function" ? durationFunction : durationConstant)(id2, value)) : get(this.node(), id2).duration;
}
function easeConstant(id2, value) {
  if (typeof value !== "function") throw new Error();
  return function() {
    set(this, id2).ease = value;
  };
}
function transition_ease(value) {
  var id2 = this._id;
  return arguments.length ? this.each(easeConstant(id2, value)) : get(this.node(), id2).ease;
}
function easeVarying(id2, value) {
  return function() {
    var v = value.apply(this, arguments);
    if (typeof v !== "function") throw new Error();
    set(this, id2).ease = v;
  };
}
function transition_easeVarying(value) {
  if (typeof value !== "function") throw new Error();
  return this.each(easeVarying(this._id, value));
}
function transition_filter(match) {
  if (typeof match !== "function") match = matcher(match);
  for (var groups = this._groups, m = groups.length, subgroups = new Array(m), j = 0; j < m; ++j) {
    for (var group = groups[j], n = group.length, subgroup = subgroups[j] = [], node, i = 0; i < n; ++i) {
      if ((node = group[i]) && match.call(node, node.__data__, i, group)) {
        subgroup.push(node);
      }
    }
  }
  return new Transition(subgroups, this._parents, this._name, this._id);
}
function transition_merge(transition) {
  if (transition._id !== this._id) throw new Error();
  for (var groups0 = this._groups, groups1 = transition._groups, m0 = groups0.length, m1 = groups1.length, m = Math.min(m0, m1), merges = new Array(m0), j = 0; j < m; ++j) {
    for (var group0 = groups0[j], group1 = groups1[j], n = group0.length, merge = merges[j] = new Array(n), node, i = 0; i < n; ++i) {
      if (node = group0[i] || group1[i]) {
        merge[i] = node;
      }
    }
  }
  for (; j < m0; ++j) {
    merges[j] = groups0[j];
  }
  return new Transition(merges, this._parents, this._name, this._id);
}
function start(name) {
  return (name + "").trim().split(/^|\s+/).every(function(t2) {
    var i = t2.indexOf(".");
    if (i >= 0) t2 = t2.slice(0, i);
    return !t2 || t2 === "start";
  });
}
function onFunction(id2, name, listener) {
  var on0, on1, sit = start(name) ? init : set;
  return function() {
    var schedule2 = sit(this, id2), on = schedule2.on;
    if (on !== on0) (on1 = (on0 = on).copy()).on(name, listener);
    schedule2.on = on1;
  };
}
function transition_on(name, listener) {
  var id2 = this._id;
  return arguments.length < 2 ? get(this.node(), id2).on.on(name) : this.each(onFunction(id2, name, listener));
}
function removeFunction(id2) {
  return function() {
    var parent = this.parentNode;
    for (var i in this.__transition) if (+i !== id2) return;
    if (parent) parent.removeChild(this);
  };
}
function transition_remove() {
  return this.on("end.remove", removeFunction(this._id));
}
function transition_select(select2) {
  var name = this._name, id2 = this._id;
  if (typeof select2 !== "function") select2 = selector(select2);
  for (var groups = this._groups, m = groups.length, subgroups = new Array(m), j = 0; j < m; ++j) {
    for (var group = groups[j], n = group.length, subgroup = subgroups[j] = new Array(n), node, subnode, i = 0; i < n; ++i) {
      if ((node = group[i]) && (subnode = select2.call(node, node.__data__, i, group))) {
        if ("__data__" in node) subnode.__data__ = node.__data__;
        subgroup[i] = subnode;
        schedule(subgroup[i], name, id2, i, subgroup, get(node, id2));
      }
    }
  }
  return new Transition(subgroups, this._parents, name, id2);
}
function transition_selectAll(select2) {
  var name = this._name, id2 = this._id;
  if (typeof select2 !== "function") select2 = selectorAll(select2);
  for (var groups = this._groups, m = groups.length, subgroups = [], parents = [], j = 0; j < m; ++j) {
    for (var group = groups[j], n = group.length, node, i = 0; i < n; ++i) {
      if (node = group[i]) {
        for (var children = select2.call(node, node.__data__, i, group), child, inherit2 = get(node, id2), k = 0, l = children.length; k < l; ++k) {
          if (child = children[k]) {
            schedule(child, name, id2, k, children, inherit2);
          }
        }
        subgroups.push(children);
        parents.push(node);
      }
    }
  }
  return new Transition(subgroups, parents, name, id2);
}
var Selection = selection.prototype.constructor;
function transition_selection() {
  return new Selection(this._groups, this._parents);
}
function styleNull(name, interpolate2) {
  var string00, string10, interpolate0;
  return function() {
    var string0 = styleValue(this, name), string1 = (this.style.removeProperty(name), styleValue(this, name));
    return string0 === string1 ? null : string0 === string00 && string1 === string10 ? interpolate0 : interpolate0 = interpolate2(string00 = string0, string10 = string1);
  };
}
function styleRemove(name) {
  return function() {
    this.style.removeProperty(name);
  };
}
function styleConstant(name, interpolate2, value1) {
  var string00, string1 = value1 + "", interpolate0;
  return function() {
    var string0 = styleValue(this, name);
    return string0 === string1 ? null : string0 === string00 ? interpolate0 : interpolate0 = interpolate2(string00 = string0, value1);
  };
}
function styleFunction(name, interpolate2, value) {
  var string00, string10, interpolate0;
  return function() {
    var string0 = styleValue(this, name), value1 = value(this), string1 = value1 + "";
    if (value1 == null) string1 = value1 = (this.style.removeProperty(name), styleValue(this, name));
    return string0 === string1 ? null : string0 === string00 && string1 === string10 ? interpolate0 : (string10 = string1, interpolate0 = interpolate2(string00 = string0, value1));
  };
}
function styleMaybeRemove(id2, name) {
  var on0, on1, listener0, key = "style." + name, event = "end." + key, remove;
  return function() {
    var schedule2 = set(this, id2), on = schedule2.on, listener = schedule2.value[key] == null ? remove || (remove = styleRemove(name)) : void 0;
    if (on !== on0 || listener0 !== listener) (on1 = (on0 = on).copy()).on(event, listener0 = listener);
    schedule2.on = on1;
  };
}
function transition_style(name, value, priority) {
  var i = (name += "") === "transform" ? interpolateTransformCss : interpolate;
  return value == null ? this.styleTween(name, styleNull(name, i)).on("end.style." + name, styleRemove(name)) : typeof value === "function" ? this.styleTween(name, styleFunction(name, i, tweenValue(this, "style." + name, value))).each(styleMaybeRemove(this._id, name)) : this.styleTween(name, styleConstant(name, i, value), priority).on("end.style." + name, null);
}
function styleInterpolate(name, i, priority) {
  return function(t2) {
    this.style.setProperty(name, i.call(this, t2), priority);
  };
}
function styleTween(name, value, priority) {
  var t2, i0;
  function tween() {
    var i = value.apply(this, arguments);
    if (i !== i0) t2 = (i0 = i) && styleInterpolate(name, i, priority);
    return t2;
  }
  tween._value = value;
  return tween;
}
function transition_styleTween(name, value, priority) {
  var key = "style." + (name += "");
  if (arguments.length < 2) return (key = this.tween(key)) && key._value;
  if (value == null) return this.tween(key, null);
  if (typeof value !== "function") throw new Error();
  return this.tween(key, styleTween(name, value, priority == null ? "" : priority));
}
function textConstant(value) {
  return function() {
    this.textContent = value;
  };
}
function textFunction(value) {
  return function() {
    var value1 = value(this);
    this.textContent = value1 == null ? "" : value1;
  };
}
function transition_text(value) {
  return this.tween("text", typeof value === "function" ? textFunction(tweenValue(this, "text", value)) : textConstant(value == null ? "" : value + ""));
}
function textInterpolate(i) {
  return function(t2) {
    this.textContent = i.call(this, t2);
  };
}
function textTween(value) {
  var t0, i0;
  function tween() {
    var i = value.apply(this, arguments);
    if (i !== i0) t0 = (i0 = i) && textInterpolate(i);
    return t0;
  }
  tween._value = value;
  return tween;
}
function transition_textTween(value) {
  var key = "text";
  if (arguments.length < 1) return (key = this.tween(key)) && key._value;
  if (value == null) return this.tween(key, null);
  if (typeof value !== "function") throw new Error();
  return this.tween(key, textTween(value));
}
function transition_transition() {
  var name = this._name, id0 = this._id, id1 = newId();
  for (var groups = this._groups, m = groups.length, j = 0; j < m; ++j) {
    for (var group = groups[j], n = group.length, node, i = 0; i < n; ++i) {
      if (node = group[i]) {
        var inherit2 = get(node, id0);
        schedule(node, name, id1, i, group, {
          time: inherit2.time + inherit2.delay + inherit2.duration,
          delay: 0,
          duration: inherit2.duration,
          ease: inherit2.ease
        });
      }
    }
  }
  return new Transition(groups, this._parents, name, id1);
}
function transition_end() {
  var on0, on1, that = this, id2 = that._id, size = that.size();
  return new Promise(function(resolve, reject) {
    var cancel = { value: reject }, end = { value: function() {
      if (--size === 0) resolve();
    } };
    that.each(function() {
      var schedule2 = set(this, id2), on = schedule2.on;
      if (on !== on0) {
        on1 = (on0 = on).copy();
        on1._.cancel.push(cancel);
        on1._.interrupt.push(cancel);
        on1._.end.push(end);
      }
      schedule2.on = on1;
    });
    if (size === 0) resolve();
  });
}
var id = 0;
function Transition(groups, parents, name, id2) {
  this._groups = groups;
  this._parents = parents;
  this._name = name;
  this._id = id2;
}
function newId() {
  return ++id;
}
var selection_prototype = selection.prototype;
Transition.prototype = {
  constructor: Transition,
  select: transition_select,
  selectAll: transition_selectAll,
  selectChild: selection_prototype.selectChild,
  selectChildren: selection_prototype.selectChildren,
  filter: transition_filter,
  merge: transition_merge,
  selection: transition_selection,
  transition: transition_transition,
  call: selection_prototype.call,
  nodes: selection_prototype.nodes,
  node: selection_prototype.node,
  size: selection_prototype.size,
  empty: selection_prototype.empty,
  each: selection_prototype.each,
  on: transition_on,
  attr: transition_attr,
  attrTween: transition_attrTween,
  style: transition_style,
  styleTween: transition_styleTween,
  text: transition_text,
  textTween: transition_textTween,
  remove: transition_remove,
  tween: transition_tween,
  delay: transition_delay,
  duration: transition_duration,
  ease: transition_ease,
  easeVarying: transition_easeVarying,
  end: transition_end,
  [Symbol.iterator]: selection_prototype[Symbol.iterator]
};
function cubicInOut(t2) {
  return ((t2 *= 2) <= 1 ? t2 * t2 * t2 : (t2 -= 2) * t2 * t2 + 2) / 2;
}
var defaultTiming = {
  time: null,
  // Set on use.
  delay: 0,
  duration: 250,
  ease: cubicInOut
};
function inherit(node, id2) {
  var timing;
  while (!(timing = node.__transition) || !(timing = timing[id2])) {
    if (!(node = node.parentNode)) {
      throw new Error(`transition ${id2} not found`);
    }
  }
  return timing;
}
function selection_transition(name) {
  var id2, timing;
  if (name instanceof Transition) {
    id2 = name._id, name = name._name;
  } else {
    id2 = newId(), (timing = defaultTiming).time = now(), name = name == null ? null : name + "";
  }
  for (var groups = this._groups, m = groups.length, j = 0; j < m; ++j) {
    for (var group = groups[j], n = group.length, node, i = 0; i < n; ++i) {
      if (node = group[i]) {
        schedule(node, name, id2, i, group, timing || inherit(node, id2));
      }
    }
  }
  return new Transition(groups, this._parents, name, id2);
}
selection.prototype.interrupt = selection_interrupt;
selection.prototype.transition = selection_transition;
const constant = (x) => () => x;
function ZoomEvent(type, {
  sourceEvent,
  target,
  transform: transform2,
  dispatch: dispatch2
}) {
  Object.defineProperties(this, {
    type: { value: type, enumerable: true, configurable: true },
    sourceEvent: { value: sourceEvent, enumerable: true, configurable: true },
    target: { value: target, enumerable: true, configurable: true },
    transform: { value: transform2, enumerable: true, configurable: true },
    _: { value: dispatch2 }
  });
}
function Transform(k, x, y) {
  this.k = k;
  this.x = x;
  this.y = y;
}
Transform.prototype = {
  constructor: Transform,
  scale: function(k) {
    return k === 1 ? this : new Transform(this.k * k, this.x, this.y);
  },
  translate: function(x, y) {
    return x === 0 & y === 0 ? this : new Transform(this.k, this.x + this.k * x, this.y + this.k * y);
  },
  apply: function(point) {
    return [point[0] * this.k + this.x, point[1] * this.k + this.y];
  },
  applyX: function(x) {
    return x * this.k + this.x;
  },
  applyY: function(y) {
    return y * this.k + this.y;
  },
  invert: function(location) {
    return [(location[0] - this.x) / this.k, (location[1] - this.y) / this.k];
  },
  invertX: function(x) {
    return (x - this.x) / this.k;
  },
  invertY: function(y) {
    return (y - this.y) / this.k;
  },
  rescaleX: function(x) {
    return x.copy().domain(x.range().map(this.invertX, this).map(x.invert, x));
  },
  rescaleY: function(y) {
    return y.copy().domain(y.range().map(this.invertY, this).map(y.invert, y));
  },
  toString: function() {
    return "translate(" + this.x + "," + this.y + ") scale(" + this.k + ")";
  }
};
var identity = new Transform(1, 0, 0);
transform.prototype = Transform.prototype;
function transform(node) {
  while (!node.__zoom) if (!(node = node.parentNode)) return identity;
  return node.__zoom;
}
function nopropagation(event) {
  event.stopImmediatePropagation();
}
function noevent(event) {
  event.preventDefault();
  event.stopImmediatePropagation();
}
function defaultFilter(event) {
  return (!event.ctrlKey || event.type === "wheel") && !event.button;
}
function defaultExtent() {
  var e = this;
  if (e instanceof SVGElement) {
    e = e.ownerSVGElement || e;
    if (e.hasAttribute("viewBox")) {
      e = e.viewBox.baseVal;
      return [[e.x, e.y], [e.x + e.width, e.y + e.height]];
    }
    return [[0, 0], [e.width.baseVal.value, e.height.baseVal.value]];
  }
  return [[0, 0], [e.clientWidth, e.clientHeight]];
}
function defaultTransform() {
  return this.__zoom || identity;
}
function defaultWheelDelta(event) {
  return -event.deltaY * (event.deltaMode === 1 ? 0.05 : event.deltaMode ? 1 : 2e-3) * (event.ctrlKey ? 10 : 1);
}
function defaultTouchable() {
  return navigator.maxTouchPoints || "ontouchstart" in this;
}
function defaultConstrain(transform2, extent, translateExtent) {
  var dx0 = transform2.invertX(extent[0][0]) - translateExtent[0][0], dx1 = transform2.invertX(extent[1][0]) - translateExtent[1][0], dy0 = transform2.invertY(extent[0][1]) - translateExtent[0][1], dy1 = transform2.invertY(extent[1][1]) - translateExtent[1][1];
  return transform2.translate(
    dx1 > dx0 ? (dx0 + dx1) / 2 : Math.min(0, dx0) || Math.max(0, dx1),
    dy1 > dy0 ? (dy0 + dy1) / 2 : Math.min(0, dy0) || Math.max(0, dy1)
  );
}
function zoom() {
  var filter = defaultFilter, extent = defaultExtent, constrain = defaultConstrain, wheelDelta = defaultWheelDelta, touchable = defaultTouchable, scaleExtent = [0, Infinity], translateExtent = [[-Infinity, -Infinity], [Infinity, Infinity]], duration = 250, interpolate2 = interpolateZoom, listeners = dispatch("start", "zoom", "end"), touchstarting, touchfirst, touchending, touchDelay = 500, wheelDelay = 150, clickDistance2 = 0, tapDistance = 10;
  function zoom3(selection2) {
    selection2.property("__zoom", defaultTransform).on("wheel.zoom", wheeled, { passive: false }).on("mousedown.zoom", mousedowned).on("dblclick.zoom", dblclicked).filter(touchable).on("touchstart.zoom", touchstarted).on("touchmove.zoom", touchmoved).on("touchend.zoom touchcancel.zoom", touchended).style("-webkit-tap-highlight-color", "rgba(0,0,0,0)");
  }
  zoom3.transform = function(collection, transform2, point, event) {
    var selection2 = collection.selection ? collection.selection() : collection;
    selection2.property("__zoom", defaultTransform);
    if (collection !== selection2) {
      schedule2(collection, transform2, point, event);
    } else {
      selection2.interrupt().each(function() {
        gesture(this, arguments).event(event).start().zoom(null, typeof transform2 === "function" ? transform2.apply(this, arguments) : transform2).end();
      });
    }
  };
  zoom3.scaleBy = function(selection2, k, p, event) {
    zoom3.scaleTo(selection2, function() {
      var k0 = this.__zoom.k, k1 = typeof k === "function" ? k.apply(this, arguments) : k;
      return k0 * k1;
    }, p, event);
  };
  zoom3.scaleTo = function(selection2, k, p, event) {
    zoom3.transform(selection2, function() {
      var e = extent.apply(this, arguments), t0 = this.__zoom, p0 = p == null ? centroid(e) : typeof p === "function" ? p.apply(this, arguments) : p, p1 = t0.invert(p0), k1 = typeof k === "function" ? k.apply(this, arguments) : k;
      return constrain(translate(scale(t0, k1), p0, p1), e, translateExtent);
    }, p, event);
  };
  zoom3.translateBy = function(selection2, x, y, event) {
    zoom3.transform(selection2, function() {
      return constrain(this.__zoom.translate(
        typeof x === "function" ? x.apply(this, arguments) : x,
        typeof y === "function" ? y.apply(this, arguments) : y
      ), extent.apply(this, arguments), translateExtent);
    }, null, event);
  };
  zoom3.translateTo = function(selection2, x, y, p, event) {
    zoom3.transform(selection2, function() {
      var e = extent.apply(this, arguments), t2 = this.__zoom, p0 = p == null ? centroid(e) : typeof p === "function" ? p.apply(this, arguments) : p;
      return constrain(identity.translate(p0[0], p0[1]).scale(t2.k).translate(
        typeof x === "function" ? -x.apply(this, arguments) : -x,
        typeof y === "function" ? -y.apply(this, arguments) : -y
      ), e, translateExtent);
    }, p, event);
  };
  function scale(transform2, k) {
    k = Math.max(scaleExtent[0], Math.min(scaleExtent[1], k));
    return k === transform2.k ? transform2 : new Transform(k, transform2.x, transform2.y);
  }
  function translate(transform2, p0, p1) {
    var x = p0[0] - p1[0] * transform2.k, y = p0[1] - p1[1] * transform2.k;
    return x === transform2.x && y === transform2.y ? transform2 : new Transform(transform2.k, x, y);
  }
  function centroid(extent2) {
    return [(+extent2[0][0] + +extent2[1][0]) / 2, (+extent2[0][1] + +extent2[1][1]) / 2];
  }
  function schedule2(transition, transform2, point, event) {
    transition.on("start.zoom", function() {
      gesture(this, arguments).event(event).start();
    }).on("interrupt.zoom end.zoom", function() {
      gesture(this, arguments).event(event).end();
    }).tween("zoom", function() {
      var that = this, args = arguments, g = gesture(that, args).event(event), e = extent.apply(that, args), p = point == null ? centroid(e) : typeof point === "function" ? point.apply(that, args) : point, w = Math.max(e[1][0] - e[0][0], e[1][1] - e[0][1]), a = that.__zoom, b = typeof transform2 === "function" ? transform2.apply(that, args) : transform2, i = interpolate2(a.invert(p).concat(w / a.k), b.invert(p).concat(w / b.k));
      return function(t2) {
        if (t2 === 1) t2 = b;
        else {
          var l = i(t2), k = w / l[2];
          t2 = new Transform(k, p[0] - l[0] * k, p[1] - l[1] * k);
        }
        g.zoom(null, t2);
      };
    });
  }
  function gesture(that, args, clean) {
    return !clean && that.__zooming || new Gesture(that, args);
  }
  function Gesture(that, args) {
    this.that = that;
    this.args = args;
    this.active = 0;
    this.sourceEvent = null;
    this.extent = extent.apply(that, args);
    this.taps = 0;
  }
  Gesture.prototype = {
    event: function(event) {
      if (event) this.sourceEvent = event;
      return this;
    },
    start: function() {
      if (++this.active === 1) {
        this.that.__zooming = this;
        this.emit("start");
      }
      return this;
    },
    zoom: function(key, transform2) {
      if (this.mouse && key !== "mouse") this.mouse[1] = transform2.invert(this.mouse[0]);
      if (this.touch0 && key !== "touch") this.touch0[1] = transform2.invert(this.touch0[0]);
      if (this.touch1 && key !== "touch") this.touch1[1] = transform2.invert(this.touch1[0]);
      this.that.__zoom = transform2;
      this.emit("zoom");
      return this;
    },
    end: function() {
      if (--this.active === 0) {
        delete this.that.__zooming;
        this.emit("end");
      }
      return this;
    },
    emit: function(type) {
      var d = select(this.that).datum();
      listeners.call(
        type,
        this.that,
        new ZoomEvent(type, {
          sourceEvent: this.sourceEvent,
          target: zoom3,
          transform: this.that.__zoom,
          dispatch: listeners
        }),
        d
      );
    }
  };
  function wheeled(event, ...args) {
    if (!filter.apply(this, arguments)) return;
    var g = gesture(this, args).event(event), t2 = this.__zoom, k = Math.max(scaleExtent[0], Math.min(scaleExtent[1], t2.k * Math.pow(2, wheelDelta.apply(this, arguments)))), p = pointer(event);
    if (g.wheel) {
      if (g.mouse[0][0] !== p[0] || g.mouse[0][1] !== p[1]) {
        g.mouse[1] = t2.invert(g.mouse[0] = p);
      }
      clearTimeout(g.wheel);
    } else if (t2.k === k) return;
    else {
      g.mouse = [p, t2.invert(p)];
      interrupt(this);
      g.start();
    }
    noevent(event);
    g.wheel = setTimeout(wheelidled, wheelDelay);
    g.zoom("mouse", constrain(translate(scale(t2, k), g.mouse[0], g.mouse[1]), g.extent, translateExtent));
    function wheelidled() {
      g.wheel = null;
      g.end();
    }
  }
  function mousedowned(event, ...args) {
    if (touchending || !filter.apply(this, arguments)) return;
    var currentTarget = event.currentTarget, g = gesture(this, args, true).event(event), v = select(event.view).on("mousemove.zoom", mousemoved, true).on("mouseup.zoom", mouseupped, true), p = pointer(event, currentTarget), x0 = event.clientX, y0 = event.clientY;
    dragDisable(event.view);
    nopropagation(event);
    g.mouse = [p, this.__zoom.invert(p)];
    interrupt(this);
    g.start();
    function mousemoved(event2) {
      noevent(event2);
      if (!g.moved) {
        var dx = event2.clientX - x0, dy = event2.clientY - y0;
        g.moved = dx * dx + dy * dy > clickDistance2;
      }
      g.event(event2).zoom("mouse", constrain(translate(g.that.__zoom, g.mouse[0] = pointer(event2, currentTarget), g.mouse[1]), g.extent, translateExtent));
    }
    function mouseupped(event2) {
      v.on("mousemove.zoom mouseup.zoom", null);
      yesdrag(event2.view, g.moved);
      noevent(event2);
      g.event(event2).end();
    }
  }
  function dblclicked(event, ...args) {
    if (!filter.apply(this, arguments)) return;
    var t0 = this.__zoom, p0 = pointer(event.changedTouches ? event.changedTouches[0] : event, this), p1 = t0.invert(p0), k1 = t0.k * (event.shiftKey ? 0.5 : 2), t1 = constrain(translate(scale(t0, k1), p0, p1), extent.apply(this, args), translateExtent);
    noevent(event);
    if (duration > 0) select(this).transition().duration(duration).call(schedule2, t1, p0, event);
    else select(this).call(zoom3.transform, t1, p0, event);
  }
  function touchstarted(event, ...args) {
    if (!filter.apply(this, arguments)) return;
    var touches = event.touches, n = touches.length, g = gesture(this, args, event.changedTouches.length === n).event(event), started, i, t2, p;
    nopropagation(event);
    for (i = 0; i < n; ++i) {
      t2 = touches[i], p = pointer(t2, this);
      p = [p, this.__zoom.invert(p), t2.identifier];
      if (!g.touch0) g.touch0 = p, started = true, g.taps = 1 + !!touchstarting;
      else if (!g.touch1 && g.touch0[2] !== p[2]) g.touch1 = p, g.taps = 0;
    }
    if (touchstarting) touchstarting = clearTimeout(touchstarting);
    if (started) {
      if (g.taps < 2) touchfirst = p[0], touchstarting = setTimeout(function() {
        touchstarting = null;
      }, touchDelay);
      interrupt(this);
      g.start();
    }
  }
  function touchmoved(event, ...args) {
    if (!this.__zooming) return;
    var g = gesture(this, args).event(event), touches = event.changedTouches, n = touches.length, i, t2, p, l;
    noevent(event);
    for (i = 0; i < n; ++i) {
      t2 = touches[i], p = pointer(t2, this);
      if (g.touch0 && g.touch0[2] === t2.identifier) g.touch0[0] = p;
      else if (g.touch1 && g.touch1[2] === t2.identifier) g.touch1[0] = p;
    }
    t2 = g.that.__zoom;
    if (g.touch1) {
      var p0 = g.touch0[0], l0 = g.touch0[1], p1 = g.touch1[0], l1 = g.touch1[1], dp = (dp = p1[0] - p0[0]) * dp + (dp = p1[1] - p0[1]) * dp, dl = (dl = l1[0] - l0[0]) * dl + (dl = l1[1] - l0[1]) * dl;
      t2 = scale(t2, Math.sqrt(dp / dl));
      p = [(p0[0] + p1[0]) / 2, (p0[1] + p1[1]) / 2];
      l = [(l0[0] + l1[0]) / 2, (l0[1] + l1[1]) / 2];
    } else if (g.touch0) p = g.touch0[0], l = g.touch0[1];
    else return;
    g.zoom("touch", constrain(translate(t2, p, l), g.extent, translateExtent));
  }
  function touchended(event, ...args) {
    if (!this.__zooming) return;
    var g = gesture(this, args).event(event), touches = event.changedTouches, n = touches.length, i, t2;
    nopropagation(event);
    if (touchending) clearTimeout(touchending);
    touchending = setTimeout(function() {
      touchending = null;
    }, touchDelay);
    for (i = 0; i < n; ++i) {
      t2 = touches[i];
      if (g.touch0 && g.touch0[2] === t2.identifier) delete g.touch0;
      else if (g.touch1 && g.touch1[2] === t2.identifier) delete g.touch1;
    }
    if (g.touch1 && !g.touch0) g.touch0 = g.touch1, delete g.touch1;
    if (g.touch0) g.touch0[1] = this.__zoom.invert(g.touch0[0]);
    else {
      g.end();
      if (g.taps === 2) {
        t2 = pointer(t2, this);
        if (Math.hypot(touchfirst[0] - t2[0], touchfirst[1] - t2[1]) < tapDistance) {
          var p = select(this).on("dblclick.zoom");
          if (p) p.apply(this, arguments);
        }
      }
    }
  }
  zoom3.wheelDelta = function(_) {
    return arguments.length ? (wheelDelta = typeof _ === "function" ? _ : constant(+_), zoom3) : wheelDelta;
  };
  zoom3.filter = function(_) {
    return arguments.length ? (filter = typeof _ === "function" ? _ : constant(!!_), zoom3) : filter;
  };
  zoom3.touchable = function(_) {
    return arguments.length ? (touchable = typeof _ === "function" ? _ : constant(!!_), zoom3) : touchable;
  };
  zoom3.extent = function(_) {
    return arguments.length ? (extent = typeof _ === "function" ? _ : constant([[+_[0][0], +_[0][1]], [+_[1][0], +_[1][1]]]), zoom3) : extent;
  };
  zoom3.scaleExtent = function(_) {
    return arguments.length ? (scaleExtent[0] = +_[0], scaleExtent[1] = +_[1], zoom3) : [scaleExtent[0], scaleExtent[1]];
  };
  zoom3.translateExtent = function(_) {
    return arguments.length ? (translateExtent[0][0] = +_[0][0], translateExtent[1][0] = +_[1][0], translateExtent[0][1] = +_[0][1], translateExtent[1][1] = +_[1][1], zoom3) : [[translateExtent[0][0], translateExtent[0][1]], [translateExtent[1][0], translateExtent[1][1]]];
  };
  zoom3.constrain = function(_) {
    return arguments.length ? (constrain = _, zoom3) : constrain;
  };
  zoom3.duration = function(_) {
    return arguments.length ? (duration = +_, zoom3) : duration;
  };
  zoom3.interpolate = function(_) {
    return arguments.length ? (interpolate2 = _, zoom3) : interpolate2;
  };
  zoom3.on = function() {
    var value = listeners.on.apply(listeners, arguments);
    return value === listeners ? zoom3 : value;
  };
  zoom3.clickDistance = function(_) {
    return arguments.length ? (clickDistance2 = (_ = +_) * _, zoom3) : Math.sqrt(clickDistance2);
  };
  zoom3.tapDistance = function(_) {
    return arguments.length ? (tapDistance = +_, zoom3) : tapDistance;
  };
  return zoom3;
}
function _arrayLikeToArray$2(r, a) {
  (null == a || a > r.length) && (a = r.length);
  for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e];
  return n;
}
function _arrayWithoutHoles$2(r) {
  if (Array.isArray(r)) return _arrayLikeToArray$2(r);
}
function _assertClassBrand(e, t2, n) {
  if ("function" == typeof e ? e === t2 : e.has(t2)) return arguments.length < 3 ? t2 : n;
  throw new TypeError("Private element is not present on this object");
}
function _checkPrivateRedeclaration(e, t2) {
  if (t2.has(e)) throw new TypeError("Cannot initialize the same private elements twice on an object");
}
function _classCallCheck(a, n) {
  if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function");
}
function _classPrivateFieldGet2(s, a) {
  return s.get(_assertClassBrand(s, a));
}
function _classPrivateFieldInitSpec(e, t2, a) {
  _checkPrivateRedeclaration(e, t2), t2.set(e, a);
}
function _classPrivateFieldSet2(s, a, r) {
  return s.set(_assertClassBrand(s, a), r), r;
}
function _defineProperties(e, r) {
  for (var t2 = 0; t2 < r.length; t2++) {
    var o = r[t2];
    o.enumerable = o.enumerable || false, o.configurable = true, "value" in o && (o.writable = true), Object.defineProperty(e, _toPropertyKey$2(o.key), o);
  }
}
function _createClass(e, r, t2) {
  return r && _defineProperties(e.prototype, r), Object.defineProperty(e, "prototype", {
    writable: false
  }), e;
}
function _iterableToArray$2(r) {
  if ("undefined" != typeof Symbol && null != r[Symbol.iterator] || null != r["@@iterator"]) return Array.from(r);
}
function _nonIterableSpread$2() {
  throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function _toConsumableArray$2(r) {
  return _arrayWithoutHoles$2(r) || _iterableToArray$2(r) || _unsupportedIterableToArray$2(r) || _nonIterableSpread$2();
}
function _toPrimitive$2(t2, r) {
  if ("object" != typeof t2 || !t2) return t2;
  var e = t2[Symbol.toPrimitive];
  if (void 0 !== e) {
    var i = e.call(t2, r);
    if ("object" != typeof i) return i;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return String(t2);
}
function _toPropertyKey$2(t2) {
  var i = _toPrimitive$2(t2, "string");
  return "symbol" == typeof i ? i : i + "";
}
function _unsupportedIterableToArray$2(r, a) {
  if (r) {
    if ("string" == typeof r) return _arrayLikeToArray$2(r, a);
    var t2 = {}.toString.call(r).slice(8, -1);
    return "Object" === t2 && r.constructor && (t2 = r.constructor.name), "Map" === t2 || "Set" === t2 ? Array.from(r) : "Arguments" === t2 || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t2) ? _arrayLikeToArray$2(r, a) : void 0;
  }
}
var ENTROPY = 123;
var int2HexColor = function int2HexColor2(num) {
  return "#".concat(Math.min(num, Math.pow(2, 24)).toString(16).padStart(6, "0"));
};
var rgb2Int = function rgb2Int2(r, g, b) {
  return (r << 16) + (g << 8) + b;
};
var colorStr2Int = function colorStr2Int2(str) {
  var _tinyColor$toRgb = tinycolor(str).toRgb(), r = _tinyColor$toRgb.r, g = _tinyColor$toRgb.g, b = _tinyColor$toRgb.b;
  return rgb2Int(r, g, b);
};
var checksum = function checksum2(n, csBits) {
  return n * ENTROPY % Math.pow(2, csBits);
};
var _registry = /* @__PURE__ */ new WeakMap();
var _csBits = /* @__PURE__ */ new WeakMap();
var _default = /* @__PURE__ */ function() {
  function _default11() {
    var csBits = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 6;
    _classCallCheck(this, _default11);
    _classPrivateFieldInitSpec(this, _registry, void 0);
    _classPrivateFieldInitSpec(this, _csBits, void 0);
    _classPrivateFieldSet2(_csBits, this, csBits);
    this.reset();
  }
  return _createClass(_default11, [{
    key: "reset",
    value: function reset() {
      _classPrivateFieldSet2(_registry, this, ["__reserved for background__"]);
    }
  }, {
    key: "register",
    value: function register(obj) {
      if (_classPrivateFieldGet2(_registry, this).length >= Math.pow(2, 24 - _classPrivateFieldGet2(_csBits, this))) {
        return null;
      }
      var idx = _classPrivateFieldGet2(_registry, this).length;
      var cs = checksum(idx, _classPrivateFieldGet2(_csBits, this));
      var color2 = int2HexColor(idx + (cs << 24 - _classPrivateFieldGet2(_csBits, this)));
      _classPrivateFieldGet2(_registry, this).push(obj);
      return color2;
    }
  }, {
    key: "lookup",
    value: function lookup(color2) {
      if (!color2) return null;
      var n = typeof color2 === "string" ? colorStr2Int(color2) : rgb2Int.apply(void 0, _toConsumableArray$2(color2));
      if (!n) return null;
      var idx = n & Math.pow(2, 24 - _classPrivateFieldGet2(_csBits, this)) - 1;
      var cs = n >> 24 - _classPrivateFieldGet2(_csBits, this) & Math.pow(2, _classPrivateFieldGet2(_csBits, this)) - 1;
      if (checksum(idx, _classPrivateFieldGet2(_csBits, this)) !== cs || idx >= _classPrivateFieldGet2(_registry, this).length) return null;
      return _classPrivateFieldGet2(_registry, this)[idx];
    }
    // How many bits to reserve for checksum. Will eat away into the usable size of the registry.
  }]);
}();
const { abs: abs$1, cos: cos$1, sin: sin$1, acos: acos$1, atan2, sqrt: sqrt$1, pow } = Math;
function crt(v) {
  return v < 0 ? -pow(-v, 1 / 3) : pow(v, 1 / 3);
}
const pi$1 = Math.PI, tau = 2 * pi$1, quart = pi$1 / 2, epsilon = 1e-6, nMax = Number.MAX_SAFE_INTEGER || 9007199254740991, nMin = Number.MIN_SAFE_INTEGER || -9007199254740991, ZERO = { x: 0, y: 0, z: 0 };
const utils = {
  // Legendre-Gauss abscissae with n=24 (x_i values, defined at i=n as the roots of the nth order Legendre polynomial Pn(x))
  Tvalues: [
    -0.06405689286260563,
    0.06405689286260563,
    -0.1911188674736163,
    0.1911188674736163,
    -0.3150426796961634,
    0.3150426796961634,
    -0.4337935076260451,
    0.4337935076260451,
    -0.5454214713888396,
    0.5454214713888396,
    -0.6480936519369755,
    0.6480936519369755,
    -0.7401241915785544,
    0.7401241915785544,
    -0.820001985973903,
    0.820001985973903,
    -0.8864155270044011,
    0.8864155270044011,
    -0.9382745520027328,
    0.9382745520027328,
    -0.9747285559713095,
    0.9747285559713095,
    -0.9951872199970213,
    0.9951872199970213
  ],
  // Legendre-Gauss weights with n=24 (w_i values, defined by a function linked to in the Bezier primer article)
  Cvalues: [
    0.12793819534675216,
    0.12793819534675216,
    0.1258374563468283,
    0.1258374563468283,
    0.12167047292780339,
    0.12167047292780339,
    0.1155056680537256,
    0.1155056680537256,
    0.10744427011596563,
    0.10744427011596563,
    0.09761865210411388,
    0.09761865210411388,
    0.08619016153195327,
    0.08619016153195327,
    0.0733464814110803,
    0.0733464814110803,
    0.05929858491543678,
    0.05929858491543678,
    0.04427743881741981,
    0.04427743881741981,
    0.028531388628933663,
    0.028531388628933663,
    0.0123412297999872,
    0.0123412297999872
  ],
  arcfn: function(t2, derivativeFn) {
    const d = derivativeFn(t2);
    let l = d.x * d.x + d.y * d.y;
    if (typeof d.z !== "undefined") {
      l += d.z * d.z;
    }
    return sqrt$1(l);
  },
  compute: function(t2, points, _3d) {
    if (t2 === 0) {
      points[0].t = 0;
      return points[0];
    }
    const order = points.length - 1;
    if (t2 === 1) {
      points[order].t = 1;
      return points[order];
    }
    const mt = 1 - t2;
    let p = points;
    if (order === 0) {
      points[0].t = t2;
      return points[0];
    }
    if (order === 1) {
      const ret = {
        x: mt * p[0].x + t2 * p[1].x,
        y: mt * p[0].y + t2 * p[1].y,
        t: t2
      };
      if (_3d) {
        ret.z = mt * p[0].z + t2 * p[1].z;
      }
      return ret;
    }
    if (order < 4) {
      let mt2 = mt * mt, t22 = t2 * t2, a, b, c, d = 0;
      if (order === 2) {
        p = [p[0], p[1], p[2], ZERO];
        a = mt2;
        b = mt * t2 * 2;
        c = t22;
      } else if (order === 3) {
        a = mt2 * mt;
        b = mt2 * t2 * 3;
        c = mt * t22 * 3;
        d = t2 * t22;
      }
      const ret = {
        x: a * p[0].x + b * p[1].x + c * p[2].x + d * p[3].x,
        y: a * p[0].y + b * p[1].y + c * p[2].y + d * p[3].y,
        t: t2
      };
      if (_3d) {
        ret.z = a * p[0].z + b * p[1].z + c * p[2].z + d * p[3].z;
      }
      return ret;
    }
    const dCpts = JSON.parse(JSON.stringify(points));
    while (dCpts.length > 1) {
      for (let i = 0; i < dCpts.length - 1; i++) {
        dCpts[i] = {
          x: dCpts[i].x + (dCpts[i + 1].x - dCpts[i].x) * t2,
          y: dCpts[i].y + (dCpts[i + 1].y - dCpts[i].y) * t2
        };
        if (typeof dCpts[i].z !== "undefined") {
          dCpts[i].z = dCpts[i].z + (dCpts[i + 1].z - dCpts[i].z) * t2;
        }
      }
      dCpts.splice(dCpts.length - 1, 1);
    }
    dCpts[0].t = t2;
    return dCpts[0];
  },
  computeWithRatios: function(t2, points, ratios, _3d) {
    const mt = 1 - t2, r = ratios, p = points;
    let f1 = r[0], f2 = r[1], f3 = r[2], f4 = r[3], d;
    f1 *= mt;
    f2 *= t2;
    if (p.length === 2) {
      d = f1 + f2;
      return {
        x: (f1 * p[0].x + f2 * p[1].x) / d,
        y: (f1 * p[0].y + f2 * p[1].y) / d,
        z: !_3d ? false : (f1 * p[0].z + f2 * p[1].z) / d,
        t: t2
      };
    }
    f1 *= mt;
    f2 *= 2 * mt;
    f3 *= t2 * t2;
    if (p.length === 3) {
      d = f1 + f2 + f3;
      return {
        x: (f1 * p[0].x + f2 * p[1].x + f3 * p[2].x) / d,
        y: (f1 * p[0].y + f2 * p[1].y + f3 * p[2].y) / d,
        z: !_3d ? false : (f1 * p[0].z + f2 * p[1].z + f3 * p[2].z) / d,
        t: t2
      };
    }
    f1 *= mt;
    f2 *= 1.5 * mt;
    f3 *= 3 * mt;
    f4 *= t2 * t2 * t2;
    if (p.length === 4) {
      d = f1 + f2 + f3 + f4;
      return {
        x: (f1 * p[0].x + f2 * p[1].x + f3 * p[2].x + f4 * p[3].x) / d,
        y: (f1 * p[0].y + f2 * p[1].y + f3 * p[2].y + f4 * p[3].y) / d,
        z: !_3d ? false : (f1 * p[0].z + f2 * p[1].z + f3 * p[2].z + f4 * p[3].z) / d,
        t: t2
      };
    }
  },
  derive: function(points, _3d) {
    const dpoints = [];
    for (let p = points, d = p.length, c = d - 1; d > 1; d--, c--) {
      const list = [];
      for (let j = 0, dpt; j < c; j++) {
        dpt = {
          x: c * (p[j + 1].x - p[j].x),
          y: c * (p[j + 1].y - p[j].y)
        };
        if (_3d) {
          dpt.z = c * (p[j + 1].z - p[j].z);
        }
        list.push(dpt);
      }
      dpoints.push(list);
      p = list;
    }
    return dpoints;
  },
  between: function(v, m, M) {
    return m <= v && v <= M || utils.approximately(v, m) || utils.approximately(v, M);
  },
  approximately: function(a, b, precision) {
    return abs$1(a - b) <= (precision || epsilon);
  },
  length: function(derivativeFn) {
    const z = 0.5, len = utils.Tvalues.length;
    let sum2 = 0;
    for (let i = 0, t2; i < len; i++) {
      t2 = z * utils.Tvalues[i] + z;
      sum2 += utils.Cvalues[i] * utils.arcfn(t2, derivativeFn);
    }
    return z * sum2;
  },
  map: function(v, ds, de, ts, te) {
    const d1 = de - ds, d2 = te - ts, v2 = v - ds, r = v2 / d1;
    return ts + d2 * r;
  },
  lerp: function(r, v1, v2) {
    const ret = {
      x: v1.x + r * (v2.x - v1.x),
      y: v1.y + r * (v2.y - v1.y)
    };
    if (v1.z !== void 0 && v2.z !== void 0) {
      ret.z = v1.z + r * (v2.z - v1.z);
    }
    return ret;
  },
  pointToString: function(p) {
    let s = p.x + "/" + p.y;
    if (typeof p.z !== "undefined") {
      s += "/" + p.z;
    }
    return s;
  },
  pointsToString: function(points) {
    return "[" + points.map(utils.pointToString).join(", ") + "]";
  },
  copy: function(obj) {
    return JSON.parse(JSON.stringify(obj));
  },
  angle: function(o, v1, v2) {
    const dx1 = v1.x - o.x, dy1 = v1.y - o.y, dx2 = v2.x - o.x, dy2 = v2.y - o.y, cross = dx1 * dy2 - dy1 * dx2, dot = dx1 * dx2 + dy1 * dy2;
    return atan2(cross, dot);
  },
  // round as string, to avoid rounding errors
  round: function(v, d) {
    const s = "" + v;
    const pos = s.indexOf(".");
    return parseFloat(s.substring(0, pos + 1 + d));
  },
  dist: function(p1, p2) {
    const dx = p1.x - p2.x, dy = p1.y - p2.y;
    return sqrt$1(dx * dx + dy * dy);
  },
  closest: function(LUT, point) {
    let mdist = pow(2, 63), mpos, d;
    LUT.forEach(function(p, idx) {
      d = utils.dist(point, p);
      if (d < mdist) {
        mdist = d;
        mpos = idx;
      }
    });
    return { mdist, mpos };
  },
  abcratio: function(t2, n) {
    if (n !== 2 && n !== 3) {
      return false;
    }
    if (typeof t2 === "undefined") {
      t2 = 0.5;
    } else if (t2 === 0 || t2 === 1) {
      return t2;
    }
    const bottom = pow(t2, n) + pow(1 - t2, n), top = bottom - 1;
    return abs$1(top / bottom);
  },
  projectionratio: function(t2, n) {
    if (n !== 2 && n !== 3) {
      return false;
    }
    if (typeof t2 === "undefined") {
      t2 = 0.5;
    } else if (t2 === 0 || t2 === 1) {
      return t2;
    }
    const top = pow(1 - t2, n), bottom = pow(t2, n) + top;
    return top / bottom;
  },
  lli8: function(x1, y1, x2, y2, x3, y3, x4, y4) {
    const nx = (x1 * y2 - y1 * x2) * (x3 - x4) - (x1 - x2) * (x3 * y4 - y3 * x4), ny = (x1 * y2 - y1 * x2) * (y3 - y4) - (y1 - y2) * (x3 * y4 - y3 * x4), d = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
    if (d == 0) {
      return false;
    }
    return { x: nx / d, y: ny / d };
  },
  lli4: function(p1, p2, p3, p4) {
    const x1 = p1.x, y1 = p1.y, x2 = p2.x, y2 = p2.y, x3 = p3.x, y3 = p3.y, x4 = p4.x, y4 = p4.y;
    return utils.lli8(x1, y1, x2, y2, x3, y3, x4, y4);
  },
  lli: function(v1, v2) {
    return utils.lli4(v1, v1.c, v2, v2.c);
  },
  makeline: function(p1, p2) {
    return new Bezier(
      p1.x,
      p1.y,
      (p1.x + p2.x) / 2,
      (p1.y + p2.y) / 2,
      p2.x,
      p2.y
    );
  },
  findbbox: function(sections) {
    let mx = nMax, my = nMax, MX = nMin, MY = nMin;
    sections.forEach(function(s) {
      const bbox = s.bbox();
      if (mx > bbox.x.min) mx = bbox.x.min;
      if (my > bbox.y.min) my = bbox.y.min;
      if (MX < bbox.x.max) MX = bbox.x.max;
      if (MY < bbox.y.max) MY = bbox.y.max;
    });
    return {
      x: { min: mx, mid: (mx + MX) / 2, max: MX, size: MX - mx },
      y: { min: my, mid: (my + MY) / 2, max: MY, size: MY - my }
    };
  },
  shapeintersections: function(s1, bbox1, s2, bbox2, curveIntersectionThreshold) {
    if (!utils.bboxoverlap(bbox1, bbox2)) return [];
    const intersections = [];
    const a1 = [s1.startcap, s1.forward, s1.back, s1.endcap];
    const a2 = [s2.startcap, s2.forward, s2.back, s2.endcap];
    a1.forEach(function(l1) {
      if (l1.virtual) return;
      a2.forEach(function(l2) {
        if (l2.virtual) return;
        const iss = l1.intersects(l2, curveIntersectionThreshold);
        if (iss.length > 0) {
          iss.c1 = l1;
          iss.c2 = l2;
          iss.s1 = s1;
          iss.s2 = s2;
          intersections.push(iss);
        }
      });
    });
    return intersections;
  },
  makeshape: function(forward, back, curveIntersectionThreshold) {
    const bpl = back.points.length;
    const fpl = forward.points.length;
    const start2 = utils.makeline(back.points[bpl - 1], forward.points[0]);
    const end = utils.makeline(forward.points[fpl - 1], back.points[0]);
    const shape = {
      startcap: start2,
      forward,
      back,
      endcap: end,
      bbox: utils.findbbox([start2, forward, back, end])
    };
    shape.intersections = function(s2) {
      return utils.shapeintersections(
        shape,
        shape.bbox,
        s2,
        s2.bbox,
        curveIntersectionThreshold
      );
    };
    return shape;
  },
  getminmax: function(curve, d, list) {
    if (!list) return { min: 0, max: 0 };
    let min2 = nMax, max2 = nMin, t2, c;
    if (list.indexOf(0) === -1) {
      list = [0].concat(list);
    }
    if (list.indexOf(1) === -1) {
      list.push(1);
    }
    for (let i = 0, len = list.length; i < len; i++) {
      t2 = list[i];
      c = curve.get(t2);
      if (c[d] < min2) {
        min2 = c[d];
      }
      if (c[d] > max2) {
        max2 = c[d];
      }
    }
    return { min: min2, mid: (min2 + max2) / 2, max: max2, size: max2 - min2 };
  },
  align: function(points, line) {
    const tx = line.p1.x, ty = line.p1.y, a = -atan2(line.p2.y - ty, line.p2.x - tx), d = function(v) {
      return {
        x: (v.x - tx) * cos$1(a) - (v.y - ty) * sin$1(a),
        y: (v.x - tx) * sin$1(a) + (v.y - ty) * cos$1(a)
      };
    };
    return points.map(d);
  },
  roots: function(points, line) {
    line = line || { p1: { x: 0, y: 0 }, p2: { x: 1, y: 0 } };
    const order = points.length - 1;
    const aligned = utils.align(points, line);
    const reduce = function(t2) {
      return 0 <= t2 && t2 <= 1;
    };
    if (order === 2) {
      const a2 = aligned[0].y, b2 = aligned[1].y, c2 = aligned[2].y, d2 = a2 - 2 * b2 + c2;
      if (d2 !== 0) {
        const m1 = -sqrt$1(b2 * b2 - a2 * c2), m2 = -a2 + b2, v12 = -(m1 + m2) / d2, v2 = -(-m1 + m2) / d2;
        return [v12, v2].filter(reduce);
      } else if (b2 !== c2 && d2 === 0) {
        return [(2 * b2 - c2) / (2 * b2 - 2 * c2)].filter(reduce);
      }
      return [];
    }
    const pa = aligned[0].y, pb = aligned[1].y, pc = aligned[2].y, pd = aligned[3].y;
    let d = -pa + 3 * pb - 3 * pc + pd, a = 3 * pa - 6 * pb + 3 * pc, b = -3 * pa + 3 * pb, c = pa;
    if (utils.approximately(d, 0)) {
      if (utils.approximately(a, 0)) {
        if (utils.approximately(b, 0)) {
          return [];
        }
        return [-c / b].filter(reduce);
      }
      const q3 = sqrt$1(b * b - 4 * a * c), a2 = 2 * a;
      return [(q3 - b) / a2, (-b - q3) / a2].filter(reduce);
    }
    a /= d;
    b /= d;
    c /= d;
    const p = (3 * b - a * a) / 3, p3 = p / 3, q = (2 * a * a * a - 9 * a * b + 27 * c) / 27, q2 = q / 2, discriminant = q2 * q2 + p3 * p3 * p3;
    let u1, v1, x1, x2, x3;
    if (discriminant < 0) {
      const mp3 = -p / 3, mp33 = mp3 * mp3 * mp3, r = sqrt$1(mp33), t2 = -q / (2 * r), cosphi = t2 < -1 ? -1 : t2 > 1 ? 1 : t2, phi = acos$1(cosphi), crtr = crt(r), t1 = 2 * crtr;
      x1 = t1 * cos$1(phi / 3) - a / 3;
      x2 = t1 * cos$1((phi + tau) / 3) - a / 3;
      x3 = t1 * cos$1((phi + 2 * tau) / 3) - a / 3;
      return [x1, x2, x3].filter(reduce);
    } else if (discriminant === 0) {
      u1 = q2 < 0 ? crt(-q2) : -crt(q2);
      x1 = 2 * u1 - a / 3;
      x2 = -u1 - a / 3;
      return [x1, x2].filter(reduce);
    } else {
      const sd = sqrt$1(discriminant);
      u1 = crt(-q2 + sd);
      v1 = crt(q2 + sd);
      return [u1 - v1 - a / 3].filter(reduce);
    }
  },
  droots: function(p) {
    if (p.length === 3) {
      const a = p[0], b = p[1], c = p[2], d = a - 2 * b + c;
      if (d !== 0) {
        const m1 = -sqrt$1(b * b - a * c), m2 = -a + b, v1 = -(m1 + m2) / d, v2 = -(-m1 + m2) / d;
        return [v1, v2];
      } else if (b !== c && d === 0) {
        return [(2 * b - c) / (2 * (b - c))];
      }
      return [];
    }
    if (p.length === 2) {
      const a = p[0], b = p[1];
      if (a !== b) {
        return [a / (a - b)];
      }
      return [];
    }
    return [];
  },
  curvature: function(t2, d1, d2, _3d, kOnly) {
    let num, dnm, adk, dk, k = 0, r = 0;
    const d = utils.compute(t2, d1);
    const dd = utils.compute(t2, d2);
    const qdsum = d.x * d.x + d.y * d.y;
    if (_3d) {
      num = sqrt$1(
        pow(d.y * dd.z - dd.y * d.z, 2) + pow(d.z * dd.x - dd.z * d.x, 2) + pow(d.x * dd.y - dd.x * d.y, 2)
      );
      dnm = pow(qdsum + d.z * d.z, 3 / 2);
    } else {
      num = d.x * dd.y - d.y * dd.x;
      dnm = pow(qdsum, 3 / 2);
    }
    if (num === 0 || dnm === 0) {
      return { k: 0, r: 0 };
    }
    k = num / dnm;
    r = dnm / num;
    if (!kOnly) {
      const pk = utils.curvature(t2 - 1e-3, d1, d2, _3d, true).k;
      const nk = utils.curvature(t2 + 1e-3, d1, d2, _3d, true).k;
      dk = (nk - k + (k - pk)) / 2;
      adk = (abs$1(nk - k) + abs$1(k - pk)) / 2;
    }
    return { k, r, dk, adk };
  },
  inflections: function(points) {
    if (points.length < 4) return [];
    const p = utils.align(points, { p1: points[0], p2: points.slice(-1)[0] }), a = p[2].x * p[1].y, b = p[3].x * p[1].y, c = p[1].x * p[2].y, d = p[3].x * p[2].y, v1 = 18 * (-3 * a + 2 * b + 3 * c - d), v2 = 18 * (3 * a - b - 3 * c), v3 = 18 * (c - a);
    if (utils.approximately(v1, 0)) {
      if (!utils.approximately(v2, 0)) {
        let t2 = -v3 / v2;
        if (0 <= t2 && t2 <= 1) return [t2];
      }
      return [];
    }
    const d2 = 2 * v1;
    if (utils.approximately(d2, 0)) return [];
    const trm = v2 * v2 - 4 * v1 * v3;
    if (trm < 0) return [];
    const sq = Math.sqrt(trm);
    return [(sq - v2) / d2, -(v2 + sq) / d2].filter(function(r) {
      return 0 <= r && r <= 1;
    });
  },
  bboxoverlap: function(b1, b2) {
    const dims = ["x", "y"], len = dims.length;
    for (let i = 0, dim, l, t2, d; i < len; i++) {
      dim = dims[i];
      l = b1[dim].mid;
      t2 = b2[dim].mid;
      d = (b1[dim].size + b2[dim].size) / 2;
      if (abs$1(l - t2) >= d) return false;
    }
    return true;
  },
  expandbox: function(bbox, _bbox) {
    if (_bbox.x.min < bbox.x.min) {
      bbox.x.min = _bbox.x.min;
    }
    if (_bbox.y.min < bbox.y.min) {
      bbox.y.min = _bbox.y.min;
    }
    if (_bbox.z && _bbox.z.min < bbox.z.min) {
      bbox.z.min = _bbox.z.min;
    }
    if (_bbox.x.max > bbox.x.max) {
      bbox.x.max = _bbox.x.max;
    }
    if (_bbox.y.max > bbox.y.max) {
      bbox.y.max = _bbox.y.max;
    }
    if (_bbox.z && _bbox.z.max > bbox.z.max) {
      bbox.z.max = _bbox.z.max;
    }
    bbox.x.mid = (bbox.x.min + bbox.x.max) / 2;
    bbox.y.mid = (bbox.y.min + bbox.y.max) / 2;
    if (bbox.z) {
      bbox.z.mid = (bbox.z.min + bbox.z.max) / 2;
    }
    bbox.x.size = bbox.x.max - bbox.x.min;
    bbox.y.size = bbox.y.max - bbox.y.min;
    if (bbox.z) {
      bbox.z.size = bbox.z.max - bbox.z.min;
    }
  },
  pairiteration: function(c1, c2, curveIntersectionThreshold) {
    const c1b = c1.bbox(), c2b = c2.bbox(), r = 1e5, threshold = curveIntersectionThreshold || 0.5;
    if (c1b.x.size + c1b.y.size < threshold && c2b.x.size + c2b.y.size < threshold) {
      return [
        (r * (c1._t1 + c1._t2) / 2 | 0) / r + "/" + (r * (c2._t1 + c2._t2) / 2 | 0) / r
      ];
    }
    let cc1 = c1.split(0.5), cc2 = c2.split(0.5), pairs = [
      { left: cc1.left, right: cc2.left },
      { left: cc1.left, right: cc2.right },
      { left: cc1.right, right: cc2.right },
      { left: cc1.right, right: cc2.left }
    ];
    pairs = pairs.filter(function(pair) {
      return utils.bboxoverlap(pair.left.bbox(), pair.right.bbox());
    });
    let results = [];
    if (pairs.length === 0) return results;
    pairs.forEach(function(pair) {
      results = results.concat(
        utils.pairiteration(pair.left, pair.right, threshold)
      );
    });
    results = results.filter(function(v, i) {
      return results.indexOf(v) === i;
    });
    return results;
  },
  getccenter: function(p1, p2, p3) {
    const dx1 = p2.x - p1.x, dy1 = p2.y - p1.y, dx2 = p3.x - p2.x, dy2 = p3.y - p2.y, dx1p = dx1 * cos$1(quart) - dy1 * sin$1(quart), dy1p = dx1 * sin$1(quart) + dy1 * cos$1(quart), dx2p = dx2 * cos$1(quart) - dy2 * sin$1(quart), dy2p = dx2 * sin$1(quart) + dy2 * cos$1(quart), mx1 = (p1.x + p2.x) / 2, my1 = (p1.y + p2.y) / 2, mx2 = (p2.x + p3.x) / 2, my2 = (p2.y + p3.y) / 2, mx1n = mx1 + dx1p, my1n = my1 + dy1p, mx2n = mx2 + dx2p, my2n = my2 + dy2p, arc = utils.lli8(mx1, my1, mx1n, my1n, mx2, my2, mx2n, my2n), r = utils.dist(arc, p1);
    let s = atan2(p1.y - arc.y, p1.x - arc.x), m = atan2(p2.y - arc.y, p2.x - arc.x), e = atan2(p3.y - arc.y, p3.x - arc.x), _;
    if (s < e) {
      if (s > m || m > e) {
        s += tau;
      }
      if (s > e) {
        _ = e;
        e = s;
        s = _;
      }
    } else {
      if (e < m && m < s) {
        _ = e;
        e = s;
        s = _;
      } else {
        e += tau;
      }
    }
    arc.s = s;
    arc.e = e;
    arc.r = r;
    return arc;
  },
  numberSort: function(a, b) {
    return a - b;
  }
};
class PolyBezier {
  constructor(curves) {
    this.curves = [];
    this._3d = false;
    if (!!curves) {
      this.curves = curves;
      this._3d = this.curves[0]._3d;
    }
  }
  valueOf() {
    return this.toString();
  }
  toString() {
    return "[" + this.curves.map(function(curve) {
      return utils.pointsToString(curve.points);
    }).join(", ") + "]";
  }
  addCurve(curve) {
    this.curves.push(curve);
    this._3d = this._3d || curve._3d;
  }
  length() {
    return this.curves.map(function(v) {
      return v.length();
    }).reduce(function(a, b) {
      return a + b;
    });
  }
  curve(idx) {
    return this.curves[idx];
  }
  bbox() {
    const c = this.curves;
    var bbox = c[0].bbox();
    for (var i = 1; i < c.length; i++) {
      utils.expandbox(bbox, c[i].bbox());
    }
    return bbox;
  }
  offset(d) {
    const offset = [];
    this.curves.forEach(function(v) {
      offset.push(...v.offset(d));
    });
    return new PolyBezier(offset);
  }
}
const { abs, min, max, cos, sin, acos, sqrt } = Math;
const pi = Math.PI;
class Bezier {
  constructor(coords) {
    let args = coords && coords.forEach ? coords : Array.from(arguments).slice();
    let coordlen = false;
    if (typeof args[0] === "object") {
      coordlen = args.length;
      const newargs = [];
      args.forEach(function(point2) {
        ["x", "y", "z"].forEach(function(d) {
          if (typeof point2[d] !== "undefined") {
            newargs.push(point2[d]);
          }
        });
      });
      args = newargs;
    }
    let higher = false;
    const len = args.length;
    if (coordlen) {
      if (coordlen > 4) {
        if (arguments.length !== 1) {
          throw new Error(
            "Only new Bezier(point[]) is accepted for 4th and higher order curves"
          );
        }
        higher = true;
      }
    } else {
      if (len !== 6 && len !== 8 && len !== 9 && len !== 12) {
        if (arguments.length !== 1) {
          throw new Error(
            "Only new Bezier(point[]) is accepted for 4th and higher order curves"
          );
        }
      }
    }
    const _3d = this._3d = !higher && (len === 9 || len === 12) || coords && coords[0] && typeof coords[0].z !== "undefined";
    const points = this.points = [];
    for (let idx = 0, step = _3d ? 3 : 2; idx < len; idx += step) {
      var point = {
        x: args[idx],
        y: args[idx + 1]
      };
      if (_3d) {
        point.z = args[idx + 2];
      }
      points.push(point);
    }
    const order = this.order = points.length - 1;
    const dims = this.dims = ["x", "y"];
    if (_3d) dims.push("z");
    this.dimlen = dims.length;
    const aligned = utils.align(points, { p1: points[0], p2: points[order] });
    const baselength = utils.dist(points[0], points[order]);
    this._linear = aligned.reduce((t2, p) => t2 + abs(p.y), 0) < baselength / 50;
    this._lut = [];
    this._t1 = 0;
    this._t2 = 1;
    this.update();
  }
  static quadraticFromPoints(p1, p2, p3, t2) {
    if (typeof t2 === "undefined") {
      t2 = 0.5;
    }
    if (t2 === 0) {
      return new Bezier(p2, p2, p3);
    }
    if (t2 === 1) {
      return new Bezier(p1, p2, p2);
    }
    const abc = Bezier.getABC(2, p1, p2, p3, t2);
    return new Bezier(p1, abc.A, p3);
  }
  static cubicFromPoints(S, B, E, t2, d1) {
    if (typeof t2 === "undefined") {
      t2 = 0.5;
    }
    const abc = Bezier.getABC(3, S, B, E, t2);
    if (typeof d1 === "undefined") {
      d1 = utils.dist(B, abc.C);
    }
    const d2 = d1 * (1 - t2) / t2;
    const selen = utils.dist(S, E), lx = (E.x - S.x) / selen, ly = (E.y - S.y) / selen, bx1 = d1 * lx, by1 = d1 * ly, bx2 = d2 * lx, by2 = d2 * ly;
    const e1 = { x: B.x - bx1, y: B.y - by1 }, e2 = { x: B.x + bx2, y: B.y + by2 }, A = abc.A, v1 = { x: A.x + (e1.x - A.x) / (1 - t2), y: A.y + (e1.y - A.y) / (1 - t2) }, v2 = { x: A.x + (e2.x - A.x) / t2, y: A.y + (e2.y - A.y) / t2 }, nc1 = { x: S.x + (v1.x - S.x) / t2, y: S.y + (v1.y - S.y) / t2 }, nc2 = {
      x: E.x + (v2.x - E.x) / (1 - t2),
      y: E.y + (v2.y - E.y) / (1 - t2)
    };
    return new Bezier(S, nc1, nc2, E);
  }
  static getUtils() {
    return utils;
  }
  getUtils() {
    return Bezier.getUtils();
  }
  static get PolyBezier() {
    return PolyBezier;
  }
  valueOf() {
    return this.toString();
  }
  toString() {
    return utils.pointsToString(this.points);
  }
  toSVG() {
    if (this._3d) return false;
    const p = this.points, x = p[0].x, y = p[0].y, s = ["M", x, y, this.order === 2 ? "Q" : "C"];
    for (let i = 1, last = p.length; i < last; i++) {
      s.push(p[i].x);
      s.push(p[i].y);
    }
    return s.join(" ");
  }
  setRatios(ratios) {
    if (ratios.length !== this.points.length) {
      throw new Error("incorrect number of ratio values");
    }
    this.ratios = ratios;
    this._lut = [];
  }
  verify() {
    const print = this.coordDigest();
    if (print !== this._print) {
      this._print = print;
      this.update();
    }
  }
  coordDigest() {
    return this.points.map(function(c, pos) {
      return "" + pos + c.x + c.y + (c.z ? c.z : 0);
    }).join("");
  }
  update() {
    this._lut = [];
    this.dpoints = utils.derive(this.points, this._3d);
    this.computedirection();
  }
  computedirection() {
    const points = this.points;
    const angle = utils.angle(points[0], points[this.order], points[1]);
    this.clockwise = angle > 0;
  }
  length() {
    return utils.length(this.derivative.bind(this));
  }
  static getABC(order = 2, S, B, E, t2 = 0.5) {
    const u = utils.projectionratio(t2, order), um = 1 - u, C = {
      x: u * S.x + um * E.x,
      y: u * S.y + um * E.y
    }, s = utils.abcratio(t2, order), A = {
      x: B.x + (B.x - C.x) / s,
      y: B.y + (B.y - C.y) / s
    };
    return { A, B, C, S, E };
  }
  getABC(t2, B) {
    B = B || this.get(t2);
    let S = this.points[0];
    let E = this.points[this.order];
    return Bezier.getABC(this.order, S, B, E, t2);
  }
  getLUT(steps) {
    this.verify();
    steps = steps || 100;
    if (this._lut.length === steps + 1) {
      return this._lut;
    }
    this._lut = [];
    steps++;
    this._lut = [];
    for (let i = 0, p, t2; i < steps; i++) {
      t2 = i / (steps - 1);
      p = this.compute(t2);
      p.t = t2;
      this._lut.push(p);
    }
    return this._lut;
  }
  on(point, error) {
    error = error || 5;
    const lut = this.getLUT(), hits = [];
    for (let i = 0, c, t2 = 0; i < lut.length; i++) {
      c = lut[i];
      if (utils.dist(c, point) < error) {
        hits.push(c);
        t2 += i / lut.length;
      }
    }
    if (!hits.length) return false;
    return t /= hits.length;
  }
  project(point) {
    const LUT = this.getLUT(), l = LUT.length - 1, closest = utils.closest(LUT, point), mpos = closest.mpos, t1 = (mpos - 1) / l, t2 = (mpos + 1) / l, step = 0.1 / l;
    let mdist = closest.mdist, t3 = t1, ft = t3, p;
    mdist += 1;
    for (let d; t3 < t2 + step; t3 += step) {
      p = this.compute(t3);
      d = utils.dist(point, p);
      if (d < mdist) {
        mdist = d;
        ft = t3;
      }
    }
    ft = ft < 0 ? 0 : ft > 1 ? 1 : ft;
    p = this.compute(ft);
    p.t = ft;
    p.d = mdist;
    return p;
  }
  get(t2) {
    return this.compute(t2);
  }
  point(idx) {
    return this.points[idx];
  }
  compute(t2) {
    if (this.ratios) {
      return utils.computeWithRatios(t2, this.points, this.ratios, this._3d);
    }
    return utils.compute(t2, this.points, this._3d, this.ratios);
  }
  raise() {
    const p = this.points, np = [p[0]], k = p.length;
    for (let i = 1, pi2, pim; i < k; i++) {
      pi2 = p[i];
      pim = p[i - 1];
      np[i] = {
        x: (k - i) / k * pi2.x + i / k * pim.x,
        y: (k - i) / k * pi2.y + i / k * pim.y
      };
    }
    np[k] = p[k - 1];
    return new Bezier(np);
  }
  derivative(t2) {
    return utils.compute(t2, this.dpoints[0], this._3d);
  }
  dderivative(t2) {
    return utils.compute(t2, this.dpoints[1], this._3d);
  }
  align() {
    let p = this.points;
    return new Bezier(utils.align(p, { p1: p[0], p2: p[p.length - 1] }));
  }
  curvature(t2) {
    return utils.curvature(t2, this.dpoints[0], this.dpoints[1], this._3d);
  }
  inflections() {
    return utils.inflections(this.points);
  }
  normal(t2) {
    return this._3d ? this.__normal3(t2) : this.__normal2(t2);
  }
  __normal2(t2) {
    const d = this.derivative(t2);
    const q = sqrt(d.x * d.x + d.y * d.y);
    return { t: t2, x: -d.y / q, y: d.x / q };
  }
  __normal3(t2) {
    const r1 = this.derivative(t2), r2 = this.derivative(t2 + 0.01), q1 = sqrt(r1.x * r1.x + r1.y * r1.y + r1.z * r1.z), q2 = sqrt(r2.x * r2.x + r2.y * r2.y + r2.z * r2.z);
    r1.x /= q1;
    r1.y /= q1;
    r1.z /= q1;
    r2.x /= q2;
    r2.y /= q2;
    r2.z /= q2;
    const c = {
      x: r2.y * r1.z - r2.z * r1.y,
      y: r2.z * r1.x - r2.x * r1.z,
      z: r2.x * r1.y - r2.y * r1.x
    };
    const m = sqrt(c.x * c.x + c.y * c.y + c.z * c.z);
    c.x /= m;
    c.y /= m;
    c.z /= m;
    const R = [
      c.x * c.x,
      c.x * c.y - c.z,
      c.x * c.z + c.y,
      c.x * c.y + c.z,
      c.y * c.y,
      c.y * c.z - c.x,
      c.x * c.z - c.y,
      c.y * c.z + c.x,
      c.z * c.z
    ];
    const n = {
      t: t2,
      x: R[0] * r1.x + R[1] * r1.y + R[2] * r1.z,
      y: R[3] * r1.x + R[4] * r1.y + R[5] * r1.z,
      z: R[6] * r1.x + R[7] * r1.y + R[8] * r1.z
    };
    return n;
  }
  hull(t2) {
    let p = this.points, _p = [], q = [], idx = 0;
    q[idx++] = p[0];
    q[idx++] = p[1];
    q[idx++] = p[2];
    if (this.order === 3) {
      q[idx++] = p[3];
    }
    while (p.length > 1) {
      _p = [];
      for (let i = 0, pt, l = p.length - 1; i < l; i++) {
        pt = utils.lerp(t2, p[i], p[i + 1]);
        q[idx++] = pt;
        _p.push(pt);
      }
      p = _p;
    }
    return q;
  }
  split(t1, t2) {
    if (t1 === 0 && !!t2) {
      return this.split(t2).left;
    }
    if (t2 === 1) {
      return this.split(t1).right;
    }
    const q = this.hull(t1);
    const result = {
      left: this.order === 2 ? new Bezier([q[0], q[3], q[5]]) : new Bezier([q[0], q[4], q[7], q[9]]),
      right: this.order === 2 ? new Bezier([q[5], q[4], q[2]]) : new Bezier([q[9], q[8], q[6], q[3]]),
      span: q
    };
    result.left._t1 = utils.map(0, 0, 1, this._t1, this._t2);
    result.left._t2 = utils.map(t1, 0, 1, this._t1, this._t2);
    result.right._t1 = utils.map(t1, 0, 1, this._t1, this._t2);
    result.right._t2 = utils.map(1, 0, 1, this._t1, this._t2);
    if (!t2) {
      return result;
    }
    t2 = utils.map(t2, t1, 1, 0, 1);
    return result.right.split(t2).left;
  }
  extrema() {
    const result = {};
    let roots = [];
    this.dims.forEach(
      (function(dim) {
        let mfn = function(v) {
          return v[dim];
        };
        let p = this.dpoints[0].map(mfn);
        result[dim] = utils.droots(p);
        if (this.order === 3) {
          p = this.dpoints[1].map(mfn);
          result[dim] = result[dim].concat(utils.droots(p));
        }
        result[dim] = result[dim].filter(function(t2) {
          return t2 >= 0 && t2 <= 1;
        });
        roots = roots.concat(result[dim].sort(utils.numberSort));
      }).bind(this)
    );
    result.values = roots.sort(utils.numberSort).filter(function(v, idx) {
      return roots.indexOf(v) === idx;
    });
    return result;
  }
  bbox() {
    const extrema = this.extrema(), result = {};
    this.dims.forEach(
      (function(d) {
        result[d] = utils.getminmax(this, d, extrema[d]);
      }).bind(this)
    );
    return result;
  }
  overlaps(curve) {
    const lbbox = this.bbox(), tbbox = curve.bbox();
    return utils.bboxoverlap(lbbox, tbbox);
  }
  offset(t2, d) {
    if (typeof d !== "undefined") {
      const c = this.get(t2), n = this.normal(t2);
      const ret = {
        c,
        n,
        x: c.x + n.x * d,
        y: c.y + n.y * d
      };
      if (this._3d) {
        ret.z = c.z + n.z * d;
      }
      return ret;
    }
    if (this._linear) {
      const nv = this.normal(0), coords = this.points.map(function(p) {
        const ret = {
          x: p.x + t2 * nv.x,
          y: p.y + t2 * nv.y
        };
        if (p.z && nv.z) {
          ret.z = p.z + t2 * nv.z;
        }
        return ret;
      });
      return [new Bezier(coords)];
    }
    return this.reduce().map(function(s) {
      if (s._linear) {
        return s.offset(t2)[0];
      }
      return s.scale(t2);
    });
  }
  simple() {
    if (this.order === 3) {
      const a1 = utils.angle(this.points[0], this.points[3], this.points[1]);
      const a2 = utils.angle(this.points[0], this.points[3], this.points[2]);
      if (a1 > 0 && a2 < 0 || a1 < 0 && a2 > 0) return false;
    }
    const n1 = this.normal(0);
    const n2 = this.normal(1);
    let s = n1.x * n2.x + n1.y * n2.y;
    if (this._3d) {
      s += n1.z * n2.z;
    }
    return abs(acos(s)) < pi / 3;
  }
  reduce() {
    let i, t1 = 0, t2 = 0, step = 0.01, segment, pass1 = [], pass2 = [];
    let extrema = this.extrema().values;
    if (extrema.indexOf(0) === -1) {
      extrema = [0].concat(extrema);
    }
    if (extrema.indexOf(1) === -1) {
      extrema.push(1);
    }
    for (t1 = extrema[0], i = 1; i < extrema.length; i++) {
      t2 = extrema[i];
      segment = this.split(t1, t2);
      segment._t1 = t1;
      segment._t2 = t2;
      pass1.push(segment);
      t1 = t2;
    }
    pass1.forEach(function(p1) {
      t1 = 0;
      t2 = 0;
      while (t2 <= 1) {
        for (t2 = t1 + step; t2 <= 1 + step; t2 += step) {
          segment = p1.split(t1, t2);
          if (!segment.simple()) {
            t2 -= step;
            if (abs(t1 - t2) < step) {
              return [];
            }
            segment = p1.split(t1, t2);
            segment._t1 = utils.map(t1, 0, 1, p1._t1, p1._t2);
            segment._t2 = utils.map(t2, 0, 1, p1._t1, p1._t2);
            pass2.push(segment);
            t1 = t2;
            break;
          }
        }
      }
      if (t1 < 1) {
        segment = p1.split(t1, 1);
        segment._t1 = utils.map(t1, 0, 1, p1._t1, p1._t2);
        segment._t2 = p1._t2;
        pass2.push(segment);
      }
    });
    return pass2;
  }
  translate(v, d1, d2) {
    d2 = typeof d2 === "number" ? d2 : d1;
    const o = this.order;
    let d = this.points.map((_, i) => (1 - i / o) * d1 + i / o * d2);
    return new Bezier(
      this.points.map((p, i) => ({
        x: p.x + v.x * d[i],
        y: p.y + v.y * d[i]
      }))
    );
  }
  scale(d) {
    const order = this.order;
    let distanceFn = false;
    if (typeof d === "function") {
      distanceFn = d;
    }
    if (distanceFn && order === 2) {
      return this.raise().scale(distanceFn);
    }
    const clockwise = this.clockwise;
    const points = this.points;
    if (this._linear) {
      return this.translate(
        this.normal(0),
        distanceFn ? distanceFn(0) : d,
        distanceFn ? distanceFn(1) : d
      );
    }
    const r1 = distanceFn ? distanceFn(0) : d;
    const r2 = distanceFn ? distanceFn(1) : d;
    const v = [this.offset(0, 10), this.offset(1, 10)];
    const np = [];
    const o = utils.lli4(v[0], v[0].c, v[1], v[1].c);
    if (!o) {
      throw new Error("cannot scale this curve. Try reducing it first.");
    }
    [0, 1].forEach(function(t2) {
      const p = np[t2 * order] = utils.copy(points[t2 * order]);
      p.x += (t2 ? r2 : r1) * v[t2].n.x;
      p.y += (t2 ? r2 : r1) * v[t2].n.y;
    });
    if (!distanceFn) {
      [0, 1].forEach((t2) => {
        if (order === 2 && !!t2) return;
        const p = np[t2 * order];
        const d2 = this.derivative(t2);
        const p2 = { x: p.x + d2.x, y: p.y + d2.y };
        np[t2 + 1] = utils.lli4(p, p2, o, points[t2 + 1]);
      });
      return new Bezier(np);
    }
    [0, 1].forEach(function(t2) {
      if (order === 2 && !!t2) return;
      var p = points[t2 + 1];
      var ov = {
        x: p.x - o.x,
        y: p.y - o.y
      };
      var rc = distanceFn ? distanceFn((t2 + 1) / order) : d;
      if (distanceFn && !clockwise) rc = -rc;
      var m = sqrt(ov.x * ov.x + ov.y * ov.y);
      ov.x /= m;
      ov.y /= m;
      np[t2 + 1] = {
        x: p.x + rc * ov.x,
        y: p.y + rc * ov.y
      };
    });
    return new Bezier(np);
  }
  outline(d1, d2, d3, d4) {
    d2 = d2 === void 0 ? d1 : d2;
    if (this._linear) {
      const n = this.normal(0);
      const start2 = this.points[0];
      const end = this.points[this.points.length - 1];
      let s, mid, e;
      if (d3 === void 0) {
        d3 = d1;
        d4 = d2;
      }
      s = { x: start2.x + n.x * d1, y: start2.y + n.y * d1 };
      e = { x: end.x + n.x * d3, y: end.y + n.y * d3 };
      mid = { x: (s.x + e.x) / 2, y: (s.y + e.y) / 2 };
      const fline = [s, mid, e];
      s = { x: start2.x - n.x * d2, y: start2.y - n.y * d2 };
      e = { x: end.x - n.x * d4, y: end.y - n.y * d4 };
      mid = { x: (s.x + e.x) / 2, y: (s.y + e.y) / 2 };
      const bline = [e, mid, s];
      const ls2 = utils.makeline(bline[2], fline[0]);
      const le2 = utils.makeline(fline[2], bline[0]);
      const segments2 = [ls2, new Bezier(fline), le2, new Bezier(bline)];
      return new PolyBezier(segments2);
    }
    const reduced = this.reduce(), len = reduced.length, fcurves = [];
    let bcurves = [], p, alen = 0, tlen = this.length();
    const graduated = typeof d3 !== "undefined" && typeof d4 !== "undefined";
    function linearDistanceFunction(s, e, tlen2, alen2, slen) {
      return function(v) {
        const f1 = alen2 / tlen2, f2 = (alen2 + slen) / tlen2, d = e - s;
        return utils.map(v, 0, 1, s + f1 * d, s + f2 * d);
      };
    }
    reduced.forEach(function(segment) {
      const slen = segment.length();
      if (graduated) {
        fcurves.push(
          segment.scale(linearDistanceFunction(d1, d3, tlen, alen, slen))
        );
        bcurves.push(
          segment.scale(linearDistanceFunction(-d2, -d4, tlen, alen, slen))
        );
      } else {
        fcurves.push(segment.scale(d1));
        bcurves.push(segment.scale(-d2));
      }
      alen += slen;
    });
    bcurves = bcurves.map(function(s) {
      p = s.points;
      if (p[3]) {
        s.points = [p[3], p[2], p[1], p[0]];
      } else {
        s.points = [p[2], p[1], p[0]];
      }
      return s;
    }).reverse();
    const fs = fcurves[0].points[0], fe = fcurves[len - 1].points[fcurves[len - 1].points.length - 1], bs = bcurves[len - 1].points[bcurves[len - 1].points.length - 1], be = bcurves[0].points[0], ls = utils.makeline(bs, fs), le = utils.makeline(fe, be), segments = [ls].concat(fcurves).concat([le]).concat(bcurves);
    return new PolyBezier(segments);
  }
  outlineshapes(d1, d2, curveIntersectionThreshold) {
    d2 = d2 || d1;
    const outline = this.outline(d1, d2).curves;
    const shapes = [];
    for (let i = 1, len = outline.length; i < len / 2; i++) {
      const shape = utils.makeshape(
        outline[i],
        outline[len - i],
        curveIntersectionThreshold
      );
      shape.startcap.virtual = i > 1;
      shape.endcap.virtual = i < len / 2 - 1;
      shapes.push(shape);
    }
    return shapes;
  }
  intersects(curve, curveIntersectionThreshold) {
    if (!curve) return this.selfintersects(curveIntersectionThreshold);
    if (curve.p1 && curve.p2) {
      return this.lineIntersects(curve);
    }
    if (curve instanceof Bezier) {
      curve = curve.reduce();
    }
    return this.curveintersects(
      this.reduce(),
      curve,
      curveIntersectionThreshold
    );
  }
  lineIntersects(line) {
    const mx = min(line.p1.x, line.p2.x), my = min(line.p1.y, line.p2.y), MX = max(line.p1.x, line.p2.x), MY = max(line.p1.y, line.p2.y);
    return utils.roots(this.points, line).filter((t2) => {
      var p = this.get(t2);
      return utils.between(p.x, mx, MX) && utils.between(p.y, my, MY);
    });
  }
  selfintersects(curveIntersectionThreshold) {
    const reduced = this.reduce(), len = reduced.length - 2, results = [];
    for (let i = 0, result, left, right; i < len; i++) {
      left = reduced.slice(i, i + 1);
      right = reduced.slice(i + 2);
      result = this.curveintersects(left, right, curveIntersectionThreshold);
      results.push(...result);
    }
    return results;
  }
  curveintersects(c1, c2, curveIntersectionThreshold) {
    const pairs = [];
    c1.forEach(function(l) {
      c2.forEach(function(r) {
        if (l.overlaps(r)) {
          pairs.push({ left: l, right: r });
        }
      });
    });
    let intersections = [];
    pairs.forEach(function(pair) {
      const result = utils.pairiteration(
        pair.left,
        pair.right,
        curveIntersectionThreshold
      );
      if (result.length > 0) {
        intersections = intersections.concat(result);
      }
    });
    return intersections;
  }
  arcs(errorThreshold) {
    errorThreshold = errorThreshold || 0.5;
    return this._iterate(errorThreshold, []);
  }
  _error(pc, np1, s, e) {
    const q = (e - s) / 4, c1 = this.get(s + q), c2 = this.get(e - q), ref2 = utils.dist(pc, np1), d1 = utils.dist(pc, c1), d2 = utils.dist(pc, c2);
    return abs(d1 - ref2) + abs(d2 - ref2);
  }
  _iterate(errorThreshold, circles) {
    let t_s = 0, t_e = 1, safety;
    do {
      safety = 0;
      t_e = 1;
      let np1 = this.get(t_s), np2, np3, arc, prev_arc;
      let curr_good = false, prev_good = false, done;
      let t_m = t_e, prev_e = 1;
      do {
        prev_good = curr_good;
        prev_arc = arc;
        t_m = (t_s + t_e) / 2;
        np2 = this.get(t_m);
        np3 = this.get(t_e);
        arc = utils.getccenter(np1, np2, np3);
        arc.interval = {
          start: t_s,
          end: t_e
        };
        let error = this._error(arc, np1, t_s, t_e);
        curr_good = error <= errorThreshold;
        done = prev_good && !curr_good;
        if (!done) prev_e = t_e;
        if (curr_good) {
          if (t_e >= 1) {
            arc.interval.end = prev_e = 1;
            prev_arc = arc;
            if (t_e > 1) {
              let d = {
                x: arc.x + arc.r * cos(arc.e),
                y: arc.y + arc.r * sin(arc.e)
              };
              arc.e += utils.angle({ x: arc.x, y: arc.y }, d, this.get(1));
            }
            break;
          }
          t_e = t_e + (t_e - t_s) / 2;
        } else {
          t_e = t_m;
        }
      } while (!done && safety++ < 100);
      if (safety >= 100) {
        break;
      }
      prev_arc = prev_arc ? prev_arc : arc;
      circles.push(prev_arc);
      t_s = prev_e;
    } while (t_e < 1);
    return circles;
  }
}
function _arrayLikeToArray$1(r, a) {
  (null == a || a > r.length) && (a = r.length);
  for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e];
  return n;
}
function _arrayWithHoles$1(r) {
  if (Array.isArray(r)) return r;
}
function _arrayWithoutHoles$1(r) {
  if (Array.isArray(r)) return _arrayLikeToArray$1(r);
}
function _iterableToArray$1(r) {
  if ("undefined" != typeof Symbol && null != r[Symbol.iterator] || null != r["@@iterator"]) return Array.from(r);
}
function _iterableToArrayLimit$1(r, l) {
  var t2 = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"];
  if (null != t2) {
    var e, n, i, u, a = [], f = true, o = false;
    try {
      if (i = (t2 = t2.call(r)).next, 0 === l) ;
      else for (; !(f = (e = i.call(t2)).done) && (a.push(e.value), a.length !== l); f = true) ;
    } catch (r2) {
      o = true, n = r2;
    } finally {
      try {
        if (!f && null != t2.return && (u = t2.return(), Object(u) !== u)) return;
      } finally {
        if (o) throw n;
      }
    }
    return a;
  }
}
function _nonIterableRest$1() {
  throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function _nonIterableSpread$1() {
  throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function _objectWithoutProperties(e, t2) {
  if (null == e) return {};
  var o, r, i = _objectWithoutPropertiesLoose(e, t2);
  if (Object.getOwnPropertySymbols) {
    var s = Object.getOwnPropertySymbols(e);
    for (r = 0; r < s.length; r++) o = s[r], t2.includes(o) || {}.propertyIsEnumerable.call(e, o) && (i[o] = e[o]);
  }
  return i;
}
function _objectWithoutPropertiesLoose(r, e) {
  if (null == r) return {};
  var t2 = {};
  for (var n in r) if ({}.hasOwnProperty.call(r, n)) {
    if (e.includes(n)) continue;
    t2[n] = r[n];
  }
  return t2;
}
function _slicedToArray$1(r, e) {
  return _arrayWithHoles$1(r) || _iterableToArrayLimit$1(r, e) || _unsupportedIterableToArray$1(r, e) || _nonIterableRest$1();
}
function _toConsumableArray$1(r) {
  return _arrayWithoutHoles$1(r) || _iterableToArray$1(r) || _unsupportedIterableToArray$1(r) || _nonIterableSpread$1();
}
function _toPrimitive$1(t2, r) {
  if ("object" != typeof t2 || !t2) return t2;
  var e = t2[Symbol.toPrimitive];
  if (void 0 !== e) {
    var i = e.call(t2, r);
    if ("object" != typeof i) return i;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return String(t2);
}
function _toPropertyKey$1(t2) {
  var i = _toPrimitive$1(t2, "string");
  return "symbol" == typeof i ? i : i + "";
}
function _unsupportedIterableToArray$1(r, a) {
  if (r) {
    if ("string" == typeof r) return _arrayLikeToArray$1(r, a);
    var t2 = {}.toString.call(r).slice(8, -1);
    return "Object" === t2 && r.constructor && (t2 = r.constructor.name), "Map" === t2 || "Set" === t2 ? Array.from(r) : "Arguments" === t2 || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t2) ? _arrayLikeToArray$1(r, a) : void 0;
  }
}
var index = function() {
  var list = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : [];
  var keyAccessors = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : [];
  var multiItem = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : true;
  var flattenKeys = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : false;
  var keys = (keyAccessors instanceof Array ? keyAccessors.length ? keyAccessors : [void 0] : [keyAccessors]).map(function(key) {
    return {
      keyAccessor: key,
      isProp: !(key instanceof Function)
    };
  });
  var indexedResult = list.reduce(function(res, item) {
    var iterObj = res;
    var itemVal = item;
    keys.forEach(function(_ref, idx) {
      var keyAccessor = _ref.keyAccessor, isProp = _ref.isProp;
      var key;
      if (isProp) {
        var _itemVal = itemVal, propVal = _itemVal[keyAccessor], rest = _objectWithoutProperties(_itemVal, [keyAccessor].map(_toPropertyKey$1));
        key = propVal;
        itemVal = rest;
      } else {
        key = keyAccessor(itemVal, idx);
      }
      if (idx + 1 < keys.length) {
        if (!iterObj.hasOwnProperty(key)) {
          iterObj[key] = {};
        }
        iterObj = iterObj[key];
      } else {
        if (multiItem) {
          if (!iterObj.hasOwnProperty(key)) {
            iterObj[key] = [];
          }
          iterObj[key].push(itemVal);
        } else {
          iterObj[key] = itemVal;
        }
      }
    });
    return res;
  }, {});
  if (multiItem instanceof Function) {
    (function reduce(node) {
      var level = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 1;
      if (level === keys.length) {
        Object.keys(node).forEach(function(k) {
          return node[k] = multiItem(node[k]);
        });
      } else {
        Object.values(node).forEach(function(child) {
          return reduce(child, level + 1);
        });
      }
    })(indexedResult);
  }
  var result = indexedResult;
  if (flattenKeys) {
    result = [];
    (function flatten(node) {
      var accKeys = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : [];
      if (accKeys.length === keys.length) {
        result.push({
          keys: accKeys,
          vals: node
        });
      } else {
        Object.entries(node).forEach(function(_ref2) {
          var _ref3 = _slicedToArray$1(_ref2, 2), key = _ref3[0], val = _ref3[1];
          return flatten(val, [].concat(_toConsumableArray$1(accKeys), [key]));
        });
      }
    })(indexedResult);
    if (keyAccessors instanceof Array && keyAccessors.length === 0 && result.length === 1) {
      result[0].keys = [];
    }
  }
  return result;
};
function styleInject(css, ref2) {
  if (ref2 === void 0) ref2 = {};
  var insertAt = ref2.insertAt;
  if (typeof document === "undefined") {
    return;
  }
  var head = document.head || document.getElementsByTagName("head")[0];
  var style = document.createElement("style");
  style.type = "text/css";
  if (insertAt === "top") {
    if (head.firstChild) {
      head.insertBefore(style, head.firstChild);
    } else {
      head.appendChild(style);
    }
  } else {
    head.appendChild(style);
  }
  if (style.styleSheet) {
    style.styleSheet.cssText = css;
  } else {
    style.appendChild(document.createTextNode(css));
  }
}
var css_248z = ".force-graph-container canvas {\n  display: block;\n  user-select: none;\n  outline: none;\n  -webkit-tap-highlight-color: transparent;\n}\n\n.force-graph-container .clickable {\n  cursor: pointer;\n}\n\n.force-graph-container .grabbable {\n  cursor: move;\n  cursor: grab;\n  cursor: -moz-grab;\n  cursor: -webkit-grab;\n}\n\n.force-graph-container .grabbable:active {\n  cursor: grabbing;\n  cursor: -moz-grabbing;\n  cursor: -webkit-grabbing;\n}\n";
styleInject(css_248z);
function _arrayLikeToArray(r, a) {
  (null == a || a > r.length) && (a = r.length);
  for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e];
  return n;
}
function _arrayWithHoles(r) {
  if (Array.isArray(r)) return r;
}
function _arrayWithoutHoles(r) {
  if (Array.isArray(r)) return _arrayLikeToArray(r);
}
function _construct(t2, e, r) {
  if (_isNativeReflectConstruct()) return Reflect.construct.apply(null, arguments);
  var o = [null];
  o.push.apply(o, e);
  var p = new (t2.bind.apply(t2, o))();
  return p;
}
function _defineProperty(e, r, t2) {
  return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, {
    value: t2,
    enumerable: true,
    configurable: true,
    writable: true
  }) : e[r] = t2, e;
}
function _isNativeReflectConstruct() {
  try {
    var t2 = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function() {
    }));
  } catch (t3) {
  }
  return (_isNativeReflectConstruct = function() {
    return !!t2;
  })();
}
function _iterableToArray(r) {
  if ("undefined" != typeof Symbol && null != r[Symbol.iterator] || null != r["@@iterator"]) return Array.from(r);
}
function _iterableToArrayLimit(r, l) {
  var t2 = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"];
  if (null != t2) {
    var e, n, i, u, a = [], f = true, o = false;
    try {
      if (i = (t2 = t2.call(r)).next, 0 === l) ;
      else for (; !(f = (e = i.call(t2)).done) && (a.push(e.value), a.length !== l); f = true) ;
    } catch (r2) {
      o = true, n = r2;
    } finally {
      try {
        if (!f && null != t2.return && (u = t2.return(), Object(u) !== u)) return;
      } finally {
        if (o) throw n;
      }
    }
    return a;
  }
}
function _nonIterableRest() {
  throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function _nonIterableSpread() {
  throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function ownKeys(e, r) {
  var t2 = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var o = Object.getOwnPropertySymbols(e);
    r && (o = o.filter(function(r2) {
      return Object.getOwnPropertyDescriptor(e, r2).enumerable;
    })), t2.push.apply(t2, o);
  }
  return t2;
}
function _objectSpread2(e) {
  for (var r = 1; r < arguments.length; r++) {
    var t2 = null != arguments[r] ? arguments[r] : {};
    r % 2 ? ownKeys(Object(t2), true).forEach(function(r2) {
      _defineProperty(e, r2, t2[r2]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t2)) : ownKeys(Object(t2)).forEach(function(r2) {
      Object.defineProperty(e, r2, Object.getOwnPropertyDescriptor(t2, r2));
    });
  }
  return e;
}
function _slicedToArray(r, e) {
  return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest();
}
function _toConsumableArray(r) {
  return _arrayWithoutHoles(r) || _iterableToArray(r) || _unsupportedIterableToArray(r) || _nonIterableSpread();
}
function _toPrimitive(t2, r) {
  if ("object" != typeof t2 || !t2) return t2;
  var e = t2[Symbol.toPrimitive];
  if (void 0 !== e) {
    var i = e.call(t2, r);
    if ("object" != typeof i) return i;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return ("string" === r ? String : Number)(t2);
}
function _toPropertyKey(t2) {
  var i = _toPrimitive(t2, "string");
  return "symbol" == typeof i ? i : i + "";
}
function _typeof(o) {
  "@babel/helpers - typeof";
  return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(o2) {
    return typeof o2;
  } : function(o2) {
    return o2 && "function" == typeof Symbol && o2.constructor === Symbol && o2 !== Symbol.prototype ? "symbol" : typeof o2;
  }, _typeof(o);
}
function _unsupportedIterableToArray(r, a) {
  if (r) {
    if ("string" == typeof r) return _arrayLikeToArray(r, a);
    var t2 = {}.toString.call(r).slice(8, -1);
    return "Object" === t2 && r.constructor && (t2 = r.constructor.name), "Map" === t2 || "Set" === t2 ? Array.from(r) : "Arguments" === t2 || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t2) ? _arrayLikeToArray(r, a) : void 0;
  }
}
var autoColorScale = ordinal(schemePaired);
function autoColorObjects(objects, colorByAccessor, colorField) {
  if (!colorByAccessor || typeof colorField !== "string") return;
  objects.filter(function(obj) {
    return !obj[colorField];
  }).forEach(function(obj) {
    obj[colorField] = autoColorScale(colorByAccessor(obj));
  });
}
function getDagDepths(_ref, idAccessor) {
  var nodes = _ref.nodes, links = _ref.links;
  var _ref2 = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {}, _ref2$nodeFilter = _ref2.nodeFilter, nodeFilter = _ref2$nodeFilter === void 0 ? function() {
    return true;
  } : _ref2$nodeFilter, _ref2$onLoopError = _ref2.onLoopError, onLoopError = _ref2$onLoopError === void 0 ? function(loopIds) {
    throw "Invalid DAG structure! Found cycle in node path: ".concat(loopIds.join(" -> "), ".");
  } : _ref2$onLoopError;
  var graph = {};
  nodes.forEach(function(node) {
    return graph[idAccessor(node)] = {
      data: node,
      out: [],
      depth: -1,
      skip: !nodeFilter(node)
    };
  });
  links.forEach(function(_ref3) {
    var source = _ref3.source, target = _ref3.target;
    var sourceId = getNodeId(source);
    var targetId = getNodeId(target);
    if (!graph.hasOwnProperty(sourceId)) throw "Missing source node with id: ".concat(sourceId);
    if (!graph.hasOwnProperty(targetId)) throw "Missing target node with id: ".concat(targetId);
    var sourceNode = graph[sourceId];
    var targetNode = graph[targetId];
    sourceNode.out.push(targetNode);
    function getNodeId(node) {
      return _typeof(node) === "object" ? idAccessor(node) : node;
    }
  });
  var foundLoops = [];
  traverse(Object.values(graph));
  var nodeDepths = Object.assign.apply(Object, [{}].concat(_toConsumableArray(Object.entries(graph).filter(function(_ref4) {
    var _ref5 = _slicedToArray(_ref4, 2), node = _ref5[1];
    return !node.skip;
  }).map(function(_ref6) {
    var _ref7 = _slicedToArray(_ref6, 2), id2 = _ref7[0], node = _ref7[1];
    return _defineProperty({}, id2, node.depth);
  }))));
  return nodeDepths;
  function traverse(nodes2) {
    var nodeStack = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : [];
    var currentDepth = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : 0;
    var _loop = function _loop2() {
      var node = nodes2[i];
      if (nodeStack.indexOf(node) !== -1) {
        var loop = [].concat(_toConsumableArray(nodeStack.slice(nodeStack.indexOf(node))), [node]).map(function(d) {
          return idAccessor(d.data);
        });
        if (!foundLoops.some(function(foundLoop) {
          return foundLoop.length === loop.length && foundLoop.every(function(id2, idx) {
            return id2 === loop[idx];
          });
        })) {
          foundLoops.push(loop);
          onLoopError(loop);
        }
        return 1;
      }
      if (currentDepth > node.depth) {
        node.depth = currentDepth;
        traverse(node.out, [].concat(_toConsumableArray(nodeStack), [node]), currentDepth + (node.skip ? 0 : 1));
      }
    };
    for (var i = 0, l = nodes2.length; i < l; i++) {
      if (_loop()) continue;
    }
  }
}
var DAG_LEVEL_NODE_RATIO = 2;
var notifyRedraw = function notifyRedraw2(_, state) {
  return state.onNeedsRedraw && state.onNeedsRedraw();
};
var updDataPhotons = function updDataPhotons2(_, state) {
  if (!state.isShadow) {
    var linkParticlesAccessor = index$2(state.linkDirectionalParticles);
    state.graphData.links.forEach(function(link) {
      var numPhotons = Math.round(Math.abs(linkParticlesAccessor(link)));
      if (numPhotons) {
        link.__photons = _toConsumableArray(Array(numPhotons)).map(function() {
          return {};
        });
      } else {
        delete link.__photons;
      }
    });
  }
};
var CanvasForceGraph = index$1({
  props: {
    graphData: {
      "default": {
        nodes: [],
        links: []
      },
      onChange: function onChange(_, state) {
        state.engineRunning = false;
        updDataPhotons(_, state);
      }
    },
    dagMode: {
      onChange: function onChange2(dagMode, state) {
        !dagMode && (state.graphData.nodes || []).forEach(function(n) {
          return n.fx = n.fy = void 0;
        });
      }
    },
    dagLevelDistance: {},
    dagNodeFilter: {
      "default": function _default2(node) {
        return true;
      }
    },
    onDagError: {
      triggerUpdate: false
    },
    nodeRelSize: {
      "default": 4,
      triggerUpdate: false,
      onChange: notifyRedraw
    },
    // area per val unit
    nodeId: {
      "default": "id"
    },
    nodeVal: {
      "default": "val",
      triggerUpdate: false,
      onChange: notifyRedraw
    },
    nodeColor: {
      "default": "color",
      triggerUpdate: false,
      onChange: notifyRedraw
    },
    nodeAutoColorBy: {},
    nodeCanvasObject: {
      triggerUpdate: false,
      onChange: notifyRedraw
    },
    nodeCanvasObjectMode: {
      "default": function _default3() {
        return "replace";
      },
      triggerUpdate: false,
      onChange: notifyRedraw
    },
    nodeVisibility: {
      "default": true,
      triggerUpdate: false,
      onChange: notifyRedraw
    },
    linkSource: {
      "default": "source"
    },
    linkTarget: {
      "default": "target"
    },
    linkVisibility: {
      "default": true,
      triggerUpdate: false,
      onChange: notifyRedraw
    },
    linkColor: {
      "default": "color",
      triggerUpdate: false,
      onChange: notifyRedraw
    },
    linkAutoColorBy: {},
    linkLineDash: {
      triggerUpdate: false,
      onChange: notifyRedraw
    },
    linkWidth: {
      "default": 1,
      triggerUpdate: false,
      onChange: notifyRedraw
    },
    linkCurvature: {
      "default": 0,
      triggerUpdate: false,
      onChange: notifyRedraw
    },
    linkCanvasObject: {
      triggerUpdate: false,
      onChange: notifyRedraw
    },
    linkCanvasObjectMode: {
      "default": function _default4() {
        return "replace";
      },
      triggerUpdate: false,
      onChange: notifyRedraw
    },
    linkDirectionalArrowLength: {
      "default": 0,
      triggerUpdate: false,
      onChange: notifyRedraw
    },
    linkDirectionalArrowColor: {
      triggerUpdate: false,
      onChange: notifyRedraw
    },
    linkDirectionalArrowRelPos: {
      "default": 0.5,
      triggerUpdate: false,
      onChange: notifyRedraw
    },
    // value between 0<>1 indicating the relative pos along the (exposed) line
    linkDirectionalParticles: {
      "default": 0,
      triggerUpdate: false,
      onChange: updDataPhotons
    },
    // animate photons travelling in the link direction
    linkDirectionalParticleSpeed: {
      "default": 0.01,
      triggerUpdate: false
    },
    // in link length ratio per frame
    linkDirectionalParticleOffset: {
      "default": 0,
      triggerUpdate: false
    },
    // starting position offset along the link's length, like a pre-delay. Values between [0, 1]
    linkDirectionalParticleWidth: {
      "default": 4,
      triggerUpdate: false
    },
    linkDirectionalParticleColor: {
      triggerUpdate: false
    },
    linkDirectionalParticleCanvasObject: {
      triggerUpdate: false
    },
    globalScale: {
      "default": 1,
      triggerUpdate: false
    },
    d3AlphaMin: {
      "default": 0,
      triggerUpdate: false
    },
    d3AlphaDecay: {
      "default": 0.0228,
      triggerUpdate: false,
      onChange: function onChange3(alphaDecay, state) {
        state.forceLayout.alphaDecay(alphaDecay);
      }
    },
    d3AlphaTarget: {
      "default": 0,
      triggerUpdate: false,
      onChange: function onChange4(alphaTarget, state) {
        state.forceLayout.alphaTarget(alphaTarget);
      }
    },
    d3VelocityDecay: {
      "default": 0.4,
      triggerUpdate: false,
      onChange: function onChange5(velocityDecay, state) {
        state.forceLayout.velocityDecay(velocityDecay);
      }
    },
    warmupTicks: {
      "default": 0,
      triggerUpdate: false
    },
    // how many times to tick the force engine at init before starting to render
    cooldownTicks: {
      "default": Infinity,
      triggerUpdate: false
    },
    cooldownTime: {
      "default": 15e3,
      triggerUpdate: false
    },
    // ms
    onUpdate: {
      "default": function _default5() {
      },
      triggerUpdate: false
    },
    onFinishUpdate: {
      "default": function _default6() {
      },
      triggerUpdate: false
    },
    onEngineTick: {
      "default": function _default7() {
      },
      triggerUpdate: false
    },
    onEngineStop: {
      "default": function _default8() {
      },
      triggerUpdate: false
    },
    onNeedsRedraw: {
      triggerUpdate: false
    },
    isShadow: {
      "default": false,
      triggerUpdate: false
    }
  },
  methods: {
    // Expose d3 forces for external manipulation
    d3Force: function d3Force(state, forceName, forceFn) {
      if (forceFn === void 0) {
        return state.forceLayout.force(forceName);
      }
      state.forceLayout.force(forceName, forceFn);
      return this;
    },
    d3ReheatSimulation: function d3ReheatSimulation(state) {
      state.forceLayout.alpha(1);
      this.resetCountdown();
      return this;
    },
    // reset cooldown state
    resetCountdown: function resetCountdown(state) {
      state.cntTicks = 0;
      state.startTickTime = /* @__PURE__ */ new Date();
      state.engineRunning = true;
      return this;
    },
    isEngineRunning: function isEngineRunning(state) {
      return !!state.engineRunning;
    },
    tickFrame: function tickFrame(state) {
      !state.isShadow && layoutTick();
      paintLinks();
      !state.isShadow && paintArrows();
      !state.isShadow && paintPhotons();
      paintNodes();
      return this;
      function layoutTick() {
        if (state.engineRunning) {
          if (++state.cntTicks > state.cooldownTicks || /* @__PURE__ */ new Date() - state.startTickTime > state.cooldownTime || state.d3AlphaMin > 0 && state.forceLayout.alpha() < state.d3AlphaMin) {
            state.engineRunning = false;
            state.onEngineStop();
          } else {
            state.forceLayout.tick();
            state.onEngineTick();
          }
        }
      }
      function paintNodes() {
        var getVisibility = index$2(state.nodeVisibility);
        var getVal = index$2(state.nodeVal);
        var getColor = index$2(state.nodeColor);
        var getNodeCanvasObjectMode = index$2(state.nodeCanvasObjectMode);
        var ctx = state.ctx;
        var padAmount = state.isShadow / state.globalScale;
        var visibleNodes = state.graphData.nodes.filter(getVisibility);
        ctx.save();
        visibleNodes.forEach(function(node) {
          var nodeCanvasObjectMode = getNodeCanvasObjectMode(node);
          if (state.nodeCanvasObject && (nodeCanvasObjectMode === "before" || nodeCanvasObjectMode === "replace")) {
            state.nodeCanvasObject(node, ctx, state.globalScale);
            if (nodeCanvasObjectMode === "replace") {
              ctx.restore();
              return;
            }
          }
          var r = Math.sqrt(Math.max(0, getVal(node) || 1)) * state.nodeRelSize + padAmount;
          ctx.beginPath();
          ctx.arc(node.x, node.y, r, 0, 2 * Math.PI, false);
          ctx.fillStyle = getColor(node) || "rgba(31, 120, 180, 0.92)";
          ctx.fill();
          if (state.nodeCanvasObject && nodeCanvasObjectMode === "after") {
            state.nodeCanvasObject(node, state.ctx, state.globalScale);
          }
        });
        ctx.restore();
      }
      function paintLinks() {
        var getVisibility = index$2(state.linkVisibility);
        var getColor = index$2(state.linkColor);
        var getWidth = index$2(state.linkWidth);
        var getLineDash = index$2(state.linkLineDash);
        var getCurvature = index$2(state.linkCurvature);
        var getLinkCanvasObjectMode = index$2(state.linkCanvasObjectMode);
        var ctx = state.ctx;
        var padAmount = state.isShadow * 2;
        var visibleLinks = state.graphData.links.filter(getVisibility);
        visibleLinks.forEach(calcLinkControlPoints);
        var beforeCustomLinks = [], afterCustomLinks = [], defaultPaintLinks = visibleLinks;
        if (state.linkCanvasObject) {
          var replaceCustomLinks = [], otherCustomLinks = [];
          visibleLinks.forEach(function(d) {
            return ({
              before: beforeCustomLinks,
              after: afterCustomLinks,
              replace: replaceCustomLinks
            }[getLinkCanvasObjectMode(d)] || otherCustomLinks).push(d);
          });
          defaultPaintLinks = [].concat(_toConsumableArray(beforeCustomLinks), afterCustomLinks, otherCustomLinks);
          beforeCustomLinks = beforeCustomLinks.concat(replaceCustomLinks);
        }
        ctx.save();
        beforeCustomLinks.forEach(function(link) {
          return state.linkCanvasObject(link, ctx, state.globalScale);
        });
        ctx.restore();
        var linksPerColor = index(defaultPaintLinks, [getColor, getWidth, getLineDash]);
        ctx.save();
        Object.entries(linksPerColor).forEach(function(_ref) {
          var _ref2 = _slicedToArray(_ref, 2), color2 = _ref2[0], linksPerWidth = _ref2[1];
          var lineColor = !color2 || color2 === "undefined" ? "rgba(0,0,0,0.15)" : color2;
          Object.entries(linksPerWidth).forEach(function(_ref3) {
            var _ref4 = _slicedToArray(_ref3, 2), width = _ref4[0], linesPerLineDash = _ref4[1];
            var lineWidth = (width || 1) / state.globalScale + padAmount;
            Object.entries(linesPerLineDash).forEach(function(_ref5) {
              var _ref6 = _slicedToArray(_ref5, 2);
              _ref6[0];
              var links = _ref6[1];
              var lineDashSegments = getLineDash(links[0]);
              ctx.beginPath();
              links.forEach(function(link) {
                var start2 = link.source;
                var end = link.target;
                if (!start2 || !end || !start2.hasOwnProperty("x") || !end.hasOwnProperty("x")) return;
                ctx.moveTo(start2.x, start2.y);
                var controlPoints = link.__controlPoints;
                if (!controlPoints) {
                  ctx.lineTo(end.x, end.y);
                } else {
                  ctx[controlPoints.length === 2 ? "quadraticCurveTo" : "bezierCurveTo"].apply(ctx, _toConsumableArray(controlPoints).concat([end.x, end.y]));
                }
              });
              ctx.strokeStyle = lineColor;
              ctx.lineWidth = lineWidth;
              ctx.setLineDash(lineDashSegments || []);
              ctx.stroke();
            });
          });
        });
        ctx.restore();
        ctx.save();
        afterCustomLinks.forEach(function(link) {
          return state.linkCanvasObject(link, ctx, state.globalScale);
        });
        ctx.restore();
        function calcLinkControlPoints(link) {
          var curvature = getCurvature(link);
          if (!curvature) {
            link.__controlPoints = null;
            return;
          }
          var start2 = link.source;
          var end = link.target;
          if (!start2 || !end || !start2.hasOwnProperty("x") || !end.hasOwnProperty("x")) return;
          var l = Math.sqrt(Math.pow(end.x - start2.x, 2) + Math.pow(end.y - start2.y, 2));
          if (l > 0) {
            var a = Math.atan2(end.y - start2.y, end.x - start2.x);
            var d = l * curvature;
            var cp = {
              // control point
              x: (start2.x + end.x) / 2 + d * Math.cos(a - Math.PI / 2),
              y: (start2.y + end.y) / 2 + d * Math.sin(a - Math.PI / 2)
            };
            link.__controlPoints = [cp.x, cp.y];
          } else {
            var _d = curvature * 70;
            link.__controlPoints = [end.x, end.y - _d, end.x + _d, end.y];
          }
        }
      }
      function paintArrows() {
        var ARROW_WH_RATIO = 1.6;
        var ARROW_VLEN_RATIO = 0.2;
        var getLength = index$2(state.linkDirectionalArrowLength);
        var getRelPos = index$2(state.linkDirectionalArrowRelPos);
        var getVisibility = index$2(state.linkVisibility);
        var getColor = index$2(state.linkDirectionalArrowColor || state.linkColor);
        var getNodeVal = index$2(state.nodeVal);
        var ctx = state.ctx;
        ctx.save();
        state.graphData.links.filter(getVisibility).forEach(function(link) {
          var arrowLength = getLength(link);
          if (!arrowLength || arrowLength < 0) return;
          var start2 = link.source;
          var end = link.target;
          if (!start2 || !end || !start2.hasOwnProperty("x") || !end.hasOwnProperty("x")) return;
          var startR = Math.sqrt(Math.max(0, getNodeVal(start2) || 1)) * state.nodeRelSize;
          var endR = Math.sqrt(Math.max(0, getNodeVal(end) || 1)) * state.nodeRelSize;
          var arrowRelPos = Math.min(1, Math.max(0, getRelPos(link)));
          var arrowColor = getColor(link) || "rgba(0,0,0,0.28)";
          var arrowHalfWidth = arrowLength / ARROW_WH_RATIO / 2;
          var bzLine = link.__controlPoints && _construct(Bezier, [start2.x, start2.y].concat(_toConsumableArray(link.__controlPoints), [end.x, end.y]));
          var getCoordsAlongLine = bzLine ? function(t2) {
            return bzLine.get(t2);
          } : function(t2) {
            return {
              // straight line: interpolate linearly
              x: start2.x + (end.x - start2.x) * t2 || 0,
              y: start2.y + (end.y - start2.y) * t2 || 0
            };
          };
          var lineLen = bzLine ? bzLine.length() : Math.sqrt(Math.pow(end.x - start2.x, 2) + Math.pow(end.y - start2.y, 2));
          var posAlongLine = startR + arrowLength + (lineLen - startR - endR - arrowLength) * arrowRelPos;
          var arrowHead = getCoordsAlongLine(posAlongLine / lineLen);
          var arrowTail = getCoordsAlongLine((posAlongLine - arrowLength) / lineLen);
          var arrowTailVertex = getCoordsAlongLine((posAlongLine - arrowLength * (1 - ARROW_VLEN_RATIO)) / lineLen);
          var arrowTailAngle = Math.atan2(arrowHead.y - arrowTail.y, arrowHead.x - arrowTail.x) - Math.PI / 2;
          ctx.beginPath();
          ctx.moveTo(arrowHead.x, arrowHead.y);
          ctx.lineTo(arrowTail.x + arrowHalfWidth * Math.cos(arrowTailAngle), arrowTail.y + arrowHalfWidth * Math.sin(arrowTailAngle));
          ctx.lineTo(arrowTailVertex.x, arrowTailVertex.y);
          ctx.lineTo(arrowTail.x - arrowHalfWidth * Math.cos(arrowTailAngle), arrowTail.y - arrowHalfWidth * Math.sin(arrowTailAngle));
          ctx.fillStyle = arrowColor;
          ctx.fill();
        });
        ctx.restore();
      }
      function paintPhotons() {
        var getNumPhotons = index$2(state.linkDirectionalParticles);
        var getSpeed = index$2(state.linkDirectionalParticleSpeed);
        var getOffset = index$2(state.linkDirectionalParticleOffset);
        var getDiameter = index$2(state.linkDirectionalParticleWidth);
        var getVisibility = index$2(state.linkVisibility);
        var getColor = index$2(state.linkDirectionalParticleColor || state.linkColor);
        var ctx = state.ctx;
        ctx.save();
        state.graphData.links.filter(getVisibility).forEach(function(link) {
          var numCyclePhotons = getNumPhotons(link);
          if (!link.hasOwnProperty("__photons") || !link.__photons.length) return;
          var start2 = link.source;
          var end = link.target;
          if (!start2 || !end || !start2.hasOwnProperty("x") || !end.hasOwnProperty("x")) return;
          var particleSpeed = getSpeed(link);
          var particleOffset = Math.abs(getOffset(link));
          var photons = link.__photons || [];
          var photonR = Math.max(0, getDiameter(link) / 2) / Math.sqrt(state.globalScale);
          var photonColor = getColor(link) || "rgba(0,0,0,0.28)";
          ctx.fillStyle = photonColor;
          var bzLine = link.__controlPoints ? _construct(Bezier, [start2.x, start2.y].concat(_toConsumableArray(link.__controlPoints), [end.x, end.y])) : null;
          var cyclePhotonIdx = 0;
          var needsCleanup = false;
          photons.forEach(function(photon) {
            var singleHop = !!photon.__singleHop;
            if (!photon.hasOwnProperty("__progressRatio")) {
              photon.__progressRatio = singleHop ? 0 : (cyclePhotonIdx + particleOffset) / numCyclePhotons;
            }
            !singleHop && cyclePhotonIdx++;
            photon.__progressRatio += particleSpeed;
            if (photon.__progressRatio >= 1) {
              if (!singleHop) {
                photon.__progressRatio = photon.__progressRatio % 1;
              } else {
                needsCleanup = true;
                return;
              }
            }
            var photonPosRatio = photon.__progressRatio;
            var coords = bzLine ? bzLine.get(photonPosRatio) : {
              // straight line: interpolate linearly
              x: start2.x + (end.x - start2.x) * photonPosRatio || 0,
              y: start2.y + (end.y - start2.y) * photonPosRatio || 0
            };
            if (state.linkDirectionalParticleCanvasObject) {
              state.linkDirectionalParticleCanvasObject(coords.x, coords.y, link, ctx, state.globalScale);
            } else {
              ctx.beginPath();
              ctx.arc(coords.x, coords.y, photonR, 0, 2 * Math.PI, false);
              ctx.fill();
            }
          });
          if (needsCleanup) {
            link.__photons = link.__photons.filter(function(photon) {
              return !photon.__singleHop || photon.__progressRatio <= 1;
            });
          }
        });
        ctx.restore();
      }
    },
    emitParticle: function emitParticle(state, link) {
      if (link) {
        !link.__photons && (link.__photons = []);
        link.__photons.push({
          __singleHop: true
        });
      }
      return this;
    }
  },
  stateInit: function stateInit() {
    return {
      forceLayout: forceSimulation().force("link", forceLink()).force("charge", forceManyBody()).force("center", forceCenter()).force("dagRadial", null).stop(),
      engineRunning: false
    };
  },
  init: function init2(canvasCtx, state) {
    state.ctx = canvasCtx;
  },
  update: function update(state, changedProps) {
    state.engineRunning = false;
    state.onUpdate();
    if (state.nodeAutoColorBy !== null) {
      autoColorObjects(state.graphData.nodes, index$2(state.nodeAutoColorBy), state.nodeColor);
    }
    if (state.linkAutoColorBy !== null) {
      autoColorObjects(state.graphData.links, index$2(state.linkAutoColorBy), state.linkColor);
    }
    state.graphData.links.forEach(function(link) {
      link.source = link[state.linkSource];
      link.target = link[state.linkTarget];
    });
    state.forceLayout.stop().alpha(1).nodes(state.graphData.nodes);
    var linkForce = state.forceLayout.force("link");
    if (linkForce) {
      linkForce.id(function(d) {
        return d[state.nodeId];
      }).links(state.graphData.links);
    }
    var nodeDepths = state.dagMode && getDagDepths(state.graphData, function(node) {
      return node[state.nodeId];
    }, {
      nodeFilter: state.dagNodeFilter,
      onLoopError: state.onDagError || void 0
    });
    var maxDepth = Math.max.apply(Math, _toConsumableArray(Object.values(nodeDepths || [])));
    var dagLevelDistance = state.dagLevelDistance || state.graphData.nodes.length / (maxDepth || 1) * DAG_LEVEL_NODE_RATIO * (["radialin", "radialout"].indexOf(state.dagMode) !== -1 ? 0.7 : 1);
    if (["lr", "rl", "td", "bu"].includes(changedProps.dagMode)) {
      var resetProp = ["lr", "rl"].includes(changedProps.dagMode) ? "fx" : "fy";
      state.graphData.nodes.filter(state.dagNodeFilter).forEach(function(node) {
        return delete node[resetProp];
      });
    }
    if (["lr", "rl", "td", "bu"].includes(state.dagMode)) {
      var invert = ["rl", "bu"].includes(state.dagMode);
      var fixFn = function fixFn2(node) {
        return (nodeDepths[node[state.nodeId]] - maxDepth / 2) * dagLevelDistance * (invert ? -1 : 1);
      };
      var _resetProp = ["lr", "rl"].includes(state.dagMode) ? "fx" : "fy";
      state.graphData.nodes.filter(state.dagNodeFilter).forEach(function(node) {
        return node[_resetProp] = fixFn(node);
      });
    }
    state.forceLayout.force("dagRadial", ["radialin", "radialout"].indexOf(state.dagMode) !== -1 ? forceRadial(function(node) {
      var nodeDepth = nodeDepths[node[state.nodeId]] || -1;
      return (state.dagMode === "radialin" ? maxDepth - nodeDepth : nodeDepth) * dagLevelDistance;
    }).strength(function(node) {
      return state.dagNodeFilter(node) ? 1 : 0;
    }) : null);
    for (var i = 0; i < state.warmupTicks && !(state.d3AlphaMin > 0 && state.forceLayout.alpha() < state.d3AlphaMin); i++) {
      state.forceLayout.tick();
    }
    this.resetCountdown();
    state.onFinishUpdate();
  }
});
function linkKapsule(kapsulePropNames, kapsuleType) {
  var propNames = kapsulePropNames instanceof Array ? kapsulePropNames : [kapsulePropNames];
  var dummyK = new kapsuleType();
  dummyK._destructor && dummyK._destructor();
  return {
    linkProp: function linkProp(prop) {
      return {
        "default": dummyK[prop](),
        onChange: function onChange15(v, state) {
          propNames.forEach(function(propName) {
            return state[propName][prop](v);
          });
        },
        triggerUpdate: false
      };
    },
    linkMethod: function linkMethod(method) {
      return function(state) {
        for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
          args[_key - 1] = arguments[_key];
        }
        var returnVals = [];
        propNames.forEach(function(propName) {
          var kapsuleInstance = state[propName];
          var returnVal = kapsuleInstance[method].apply(kapsuleInstance, args);
          if (returnVal !== kapsuleInstance) {
            returnVals.push(returnVal);
          }
        });
        return returnVals.length ? returnVals[0] : this;
      };
    }
  };
}
var HOVER_CANVAS_THROTTLE_DELAY = 800;
var ZOOM2NODES_FACTOR = 4;
var DRAG_CLICK_TOLERANCE_PX = 5;
var bindFG = linkKapsule("forceGraph", CanvasForceGraph);
var bindBoth = linkKapsule(["forceGraph", "shadowGraph"], CanvasForceGraph);
var linkedProps = Object.assign.apply(Object, _toConsumableArray(["nodeColor", "nodeAutoColorBy", "nodeCanvasObject", "nodeCanvasObjectMode", "linkColor", "linkAutoColorBy", "linkLineDash", "linkWidth", "linkCanvasObject", "linkCanvasObjectMode", "linkDirectionalArrowLength", "linkDirectionalArrowColor", "linkDirectionalArrowRelPos", "linkDirectionalParticles", "linkDirectionalParticleSpeed", "linkDirectionalParticleOffset", "linkDirectionalParticleWidth", "linkDirectionalParticleColor", "linkDirectionalParticleCanvasObject", "dagMode", "dagLevelDistance", "dagNodeFilter", "onDagError", "d3AlphaMin", "d3AlphaDecay", "d3VelocityDecay", "warmupTicks", "cooldownTicks", "cooldownTime", "onEngineTick", "onEngineStop"].map(function(p) {
  return _defineProperty({}, p, bindFG.linkProp(p));
})).concat(_toConsumableArray(["nodeRelSize", "nodeId", "nodeVal", "nodeVisibility", "linkSource", "linkTarget", "linkVisibility", "linkCurvature"].map(function(p) {
  return _defineProperty({}, p, bindBoth.linkProp(p));
}))));
var linkedMethods = Object.assign.apply(Object, _toConsumableArray(["d3Force", "d3ReheatSimulation", "emitParticle"].map(function(p) {
  return _defineProperty({}, p, bindFG.linkMethod(p));
})));
function adjustCanvasSize(state) {
  if (state.canvas) {
    var curWidth = state.canvas.width;
    var curHeight = state.canvas.height;
    if (curWidth === 300 && curHeight === 150) {
      curWidth = curHeight = 0;
    }
    var pxScale = window.devicePixelRatio;
    curWidth /= pxScale;
    curHeight /= pxScale;
    [state.canvas, state.shadowCanvas].forEach(function(canvas) {
      canvas.style.width = "".concat(state.width, "px");
      canvas.style.height = "".concat(state.height, "px");
      canvas.width = state.width * pxScale;
      canvas.height = state.height * pxScale;
      if (!curWidth && !curHeight) {
        canvas.getContext("2d").scale(pxScale, pxScale);
      }
    });
    var k = transform(state.canvas).k;
    state.zoom.translateBy(state.zoom.__baseElem, (state.width - curWidth) / 2 / k, (state.height - curHeight) / 2 / k);
    state.needsRedraw = true;
  }
}
function resetTransform(ctx) {
  var pxRatio = window.devicePixelRatio;
  ctx.setTransform(pxRatio, 0, 0, pxRatio, 0, 0);
}
function clearCanvas(ctx, width, height) {
  ctx.save();
  resetTransform(ctx);
  ctx.clearRect(0, 0, width, height);
  ctx.restore();
}
var forceGraph = index$1({
  props: _objectSpread2({
    width: {
      "default": window.innerWidth,
      onChange: function onChange6(_, state) {
        return adjustCanvasSize(state);
      },
      triggerUpdate: false
    },
    height: {
      "default": window.innerHeight,
      onChange: function onChange7(_, state) {
        return adjustCanvasSize(state);
      },
      triggerUpdate: false
    },
    graphData: {
      "default": {
        nodes: [],
        links: []
      },
      onChange: function onChange8(d, state) {
        [d.nodes, d.links].every(function(arr) {
          return (arr || []).every(function(d2) {
            return !d2.hasOwnProperty("__indexColor");
          });
        }) && state.colorTracker.reset();
        [{
          type: "Node",
          objs: d.nodes
        }, {
          type: "Link",
          objs: d.links
        }].forEach(hexIndex);
        state.forceGraph.graphData(d);
        state.shadowGraph.graphData(d);
        function hexIndex(_ref4) {
          var type = _ref4.type, objs = _ref4.objs;
          objs.filter(function(d2) {
            if (!d2.hasOwnProperty("__indexColor")) return true;
            var cur = state.colorTracker.lookup(d2.__indexColor);
            return !cur || !cur.hasOwnProperty("d") || cur.d !== d2;
          }).forEach(function(d2) {
            d2.__indexColor = state.colorTracker.register({
              type,
              d: d2
            });
          });
        }
      },
      triggerUpdate: false
    },
    backgroundColor: {
      onChange: function onChange9(color2, state) {
        state.canvas && color2 && (state.canvas.style.background = color2);
      },
      triggerUpdate: false
    },
    nodeLabel: {
      "default": "name",
      triggerUpdate: false
    },
    nodePointerAreaPaint: {
      onChange: function onChange10(paintFn, state) {
        state.shadowGraph.nodeCanvasObject(!paintFn ? null : function(node, ctx, globalScale) {
          return paintFn(node, node.__indexColor, ctx, globalScale);
        });
        state.flushShadowCanvas && state.flushShadowCanvas();
      },
      triggerUpdate: false
    },
    linkPointerAreaPaint: {
      onChange: function onChange11(paintFn, state) {
        state.shadowGraph.linkCanvasObject(!paintFn ? null : function(link, ctx, globalScale) {
          return paintFn(link, link.__indexColor, ctx, globalScale);
        });
        state.flushShadowCanvas && state.flushShadowCanvas();
      },
      triggerUpdate: false
    },
    linkLabel: {
      "default": "name",
      triggerUpdate: false
    },
    linkHoverPrecision: {
      "default": 4,
      triggerUpdate: false
    },
    minZoom: {
      "default": 0.01,
      onChange: function onChange12(minZoom, state) {
        state.zoom.scaleExtent([minZoom, state.zoom.scaleExtent()[1]]);
      },
      triggerUpdate: false
    },
    maxZoom: {
      "default": 1e3,
      onChange: function onChange13(maxZoom, state) {
        state.zoom.scaleExtent([state.zoom.scaleExtent()[0], maxZoom]);
      },
      triggerUpdate: false
    },
    enableNodeDrag: {
      "default": true,
      triggerUpdate: false
    },
    enableZoomInteraction: {
      "default": true,
      triggerUpdate: false
    },
    enablePanInteraction: {
      "default": true,
      triggerUpdate: false
    },
    enableZoomPanInteraction: {
      "default": true,
      triggerUpdate: false
    },
    // to be deprecated
    enablePointerInteraction: {
      "default": true,
      onChange: function onChange14(_, state) {
        state.hoverObj = null;
      },
      triggerUpdate: false
    },
    autoPauseRedraw: {
      "default": true,
      triggerUpdate: false
    },
    onNodeDrag: {
      "default": function _default9() {
      },
      triggerUpdate: false
    },
    onNodeDragEnd: {
      "default": function _default10() {
      },
      triggerUpdate: false
    },
    onNodeClick: {
      triggerUpdate: false
    },
    onNodeRightClick: {
      triggerUpdate: false
    },
    onNodeHover: {
      triggerUpdate: false
    },
    onLinkClick: {
      triggerUpdate: false
    },
    onLinkRightClick: {
      triggerUpdate: false
    },
    onLinkHover: {
      triggerUpdate: false
    },
    onBackgroundClick: {
      triggerUpdate: false
    },
    onBackgroundRightClick: {
      triggerUpdate: false
    },
    showPointerCursor: {
      "default": true,
      triggerUpdate: false
    },
    onZoom: {
      triggerUpdate: false
    },
    onZoomEnd: {
      triggerUpdate: false
    },
    onRenderFramePre: {
      triggerUpdate: false
    },
    onRenderFramePost: {
      triggerUpdate: false
    }
  }, linkedProps),
  aliases: {
    // Prop names supported for backwards compatibility
    stopAnimation: "pauseAnimation"
  },
  methods: _objectSpread2({
    graph2ScreenCoords: function graph2ScreenCoords(state, x, y) {
      var t2 = transform(state.canvas);
      return {
        x: x * t2.k + t2.x,
        y: y * t2.k + t2.y
      };
    },
    screen2GraphCoords: function screen2GraphCoords(state, x, y) {
      var t2 = transform(state.canvas);
      return {
        x: (x - t2.x) / t2.k,
        y: (y - t2.y) / t2.k
      };
    },
    centerAt: function centerAt(state, x, y, transitionDuration) {
      if (!state.canvas) return null;
      if (x !== void 0 || y !== void 0) {
        var finalPos = Object.assign({}, x !== void 0 ? {
          x
        } : {}, y !== void 0 ? {
          y
        } : {});
        if (!transitionDuration) {
          setCenter(finalPos);
        } else {
          state.tweenGroup.add(new Tween(getCenter()).to(finalPos, transitionDuration).easing(Easing.Quadratic.Out).onUpdate(setCenter).start());
        }
        return this;
      }
      return getCenter();
      function getCenter() {
        var t2 = transform(state.canvas);
        return {
          x: (state.width / 2 - t2.x) / t2.k,
          y: (state.height / 2 - t2.y) / t2.k
        };
      }
      function setCenter(_ref5) {
        var x2 = _ref5.x, y2 = _ref5.y;
        state.zoom.translateTo(state.zoom.__baseElem, x2 === void 0 ? getCenter().x : x2, y2 === void 0 ? getCenter().y : y2);
        state.needsRedraw = true;
      }
    },
    zoom: function zoom2(state, k, transitionDuration) {
      if (!state.canvas) return null;
      if (k !== void 0) {
        if (!transitionDuration) {
          setZoom(k);
        } else {
          state.tweenGroup.add(new Tween({
            k: getZoom()
          }).to({
            k
          }, transitionDuration).easing(Easing.Quadratic.Out).onUpdate(function(_ref6) {
            var k2 = _ref6.k;
            return setZoom(k2);
          }).start());
        }
        return this;
      }
      return getZoom();
      function getZoom() {
        return transform(state.canvas).k;
      }
      function setZoom(k2) {
        state.zoom.scaleTo(state.zoom.__baseElem, k2);
        state.needsRedraw = true;
      }
    },
    zoomToFit: function zoomToFit(state) {
      var transitionDuration = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 0;
      var padding = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : 10;
      for (var _len = arguments.length, bboxArgs = new Array(_len > 3 ? _len - 3 : 0), _key = 3; _key < _len; _key++) {
        bboxArgs[_key - 3] = arguments[_key];
      }
      var bbox = this.getGraphBbox.apply(this, bboxArgs);
      if (bbox) {
        var center = {
          x: (bbox.x[0] + bbox.x[1]) / 2,
          y: (bbox.y[0] + bbox.y[1]) / 2
        };
        var zoomK = Math.max(1e-12, Math.min(1e12, (state.width - padding * 2) / (bbox.x[1] - bbox.x[0]), (state.height - padding * 2) / (bbox.y[1] - bbox.y[0])));
        this.centerAt(center.x, center.y, transitionDuration);
        this.zoom(zoomK, transitionDuration);
      }
      return this;
    },
    getGraphBbox: function getGraphBbox(state) {
      var nodeFilter = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : function() {
        return true;
      };
      var getVal = index$2(state.nodeVal);
      var getR = function getR2(node) {
        return Math.sqrt(Math.max(0, getVal(node) || 1)) * state.nodeRelSize;
      };
      var nodesPos = state.graphData.nodes.filter(nodeFilter).map(function(node) {
        return {
          x: node.x,
          y: node.y,
          r: getR(node)
        };
      });
      return !nodesPos.length ? null : {
        x: [min$1(nodesPos, function(node) {
          return node.x - node.r;
        }), max$1(nodesPos, function(node) {
          return node.x + node.r;
        })],
        y: [min$1(nodesPos, function(node) {
          return node.y - node.r;
        }), max$1(nodesPos, function(node) {
          return node.y + node.r;
        })]
      };
    },
    pauseAnimation: function pauseAnimation(state) {
      if (state.animationFrameRequestId) {
        cancelAnimationFrame(state.animationFrameRequestId);
        state.animationFrameRequestId = null;
      }
      return this;
    },
    resumeAnimation: function resumeAnimation(state) {
      if (!state.animationFrameRequestId) {
        this._animationCycle();
      }
      return this;
    },
    _destructor: function _destructor() {
      this.pauseAnimation();
      this.graphData({
        nodes: [],
        links: []
      });
    }
  }, linkedMethods),
  stateInit: function stateInit2() {
    return {
      lastSetZoom: 1,
      zoom: zoom(),
      forceGraph: new CanvasForceGraph(),
      shadowGraph: new CanvasForceGraph().cooldownTicks(0).nodeColor("__indexColor").linkColor("__indexColor").isShadow(true),
      colorTracker: new _default(),
      // indexed objects for rgb lookup
      tweenGroup: new Group()
    };
  },
  init: function init3(domNode, state) {
    var _this = this;
    domNode.innerHTML = "";
    var container = document.createElement("div");
    container.classList.add("force-graph-container");
    container.style.position = "relative";
    domNode.appendChild(container);
    state.canvas = document.createElement("canvas");
    if (state.backgroundColor) state.canvas.style.background = state.backgroundColor;
    container.appendChild(state.canvas);
    state.shadowCanvas = document.createElement("canvas");
    var ctx = state.canvas.getContext("2d");
    var shadowCtx = state.shadowCanvas.getContext("2d", {
      willReadFrequently: true
    });
    var pointerPos = {
      x: -1e12,
      y: -1e12
    };
    var getObjUnderPointer = function getObjUnderPointer2() {
      var obj = null;
      var pxScale = window.devicePixelRatio;
      var px = pointerPos.x > 0 && pointerPos.y > 0 ? shadowCtx.getImageData(pointerPos.x * pxScale, pointerPos.y * pxScale, 1, 1) : null;
      px && (obj = state.colorTracker.lookup(px.data));
      return obj;
    };
    select(state.canvas).call(drag().subject(function() {
      if (!state.enableNodeDrag) {
        return null;
      }
      var obj = getObjUnderPointer();
      return obj && obj.type === "Node" ? obj.d : null;
    }).on("start", function(ev) {
      var obj = ev.subject;
      obj.__initialDragPos = {
        x: obj.x,
        y: obj.y,
        fx: obj.fx,
        fy: obj.fy
      };
      if (!ev.active) {
        obj.fx = obj.x;
        obj.fy = obj.y;
      }
      state.canvas.classList.add("grabbable");
    }).on("drag", function(ev) {
      var obj = ev.subject;
      var initPos = obj.__initialDragPos;
      var dragPos = ev;
      var k = transform(state.canvas).k;
      var translate = {
        x: initPos.x + (dragPos.x - initPos.x) / k - obj.x,
        y: initPos.y + (dragPos.y - initPos.y) / k - obj.y
      };
      ["x", "y"].forEach(function(c) {
        return obj["f".concat(c)] = obj[c] = initPos[c] + (dragPos[c] - initPos[c]) / k;
      });
      if (!obj.__dragged && DRAG_CLICK_TOLERANCE_PX >= Math.sqrt(sum(["x", "y"].map(function(k2) {
        return Math.pow(ev[k2] - initPos[k2], 2);
      })))) return;
      state.forceGraph.d3AlphaTarget(0.3).resetCountdown();
      state.isPointerDragging = true;
      obj.__dragged = true;
      state.onNodeDrag(obj, translate);
    }).on("end", function(ev) {
      var obj = ev.subject;
      var initPos = obj.__initialDragPos;
      var translate = {
        x: obj.x - initPos.x,
        y: obj.y - initPos.y
      };
      if (initPos.fx === void 0) {
        obj.fx = void 0;
      }
      if (initPos.fy === void 0) {
        obj.fy = void 0;
      }
      delete obj.__initialDragPos;
      if (state.forceGraph.d3AlphaTarget()) {
        state.forceGraph.d3AlphaTarget(0).resetCountdown();
      }
      state.canvas.classList.remove("grabbable");
      state.isPointerDragging = false;
      if (obj.__dragged) {
        delete obj.__dragged;
        state.onNodeDragEnd(obj, translate);
      }
    }));
    state.zoom(state.zoom.__baseElem = select(state.canvas));
    state.zoom.__baseElem.on("dblclick.zoom", null);
    state.zoom.filter(function(ev) {
      return (
        // disable zoom interaction
        !ev.button && state.enableZoomPanInteraction && (ev.type !== "wheel" || index$2(state.enableZoomInteraction)(ev)) && (ev.type === "wheel" || index$2(state.enablePanInteraction)(ev))
      );
    }).on("zoom", function(ev) {
      var t2 = ev.transform;
      [ctx, shadowCtx].forEach(function(c) {
        resetTransform(c);
        c.translate(t2.x, t2.y);
        c.scale(t2.k, t2.k);
      });
      state.isPointerDragging = true;
      state.onZoom && state.onZoom(_objectSpread2(_objectSpread2({}, t2), _this.centerAt()));
      state.needsRedraw = true;
    }).on("end", function(ev) {
      state.isPointerDragging = false;
      state.onZoomEnd && state.onZoomEnd(_objectSpread2(_objectSpread2({}, ev.transform), _this.centerAt()));
    });
    adjustCanvasSize(state);
    state.forceGraph.onNeedsRedraw(function() {
      return state.needsRedraw = true;
    }).onFinishUpdate(function() {
      if (transform(state.canvas).k === state.lastSetZoom && state.graphData.nodes.length) {
        state.zoom.scaleTo(state.zoom.__baseElem, state.lastSetZoom = ZOOM2NODES_FACTOR / Math.cbrt(state.graphData.nodes.length));
        state.needsRedraw = true;
      }
    });
    state.tooltip = new index$3(container);
    ["pointermove", "pointerdown"].forEach(function(evType) {
      return container.addEventListener(evType, function(ev) {
        if (evType === "pointerdown") {
          state.isPointerPressed = true;
          state.pointerDownEvent = ev;
        }
        !state.isPointerDragging && ev.type === "pointermove" && state.onBackgroundClick && (ev.pressure > 0 || state.isPointerPressed) && (ev.pointerType === "mouse" || ev.movementX === void 0 || [ev.movementX, ev.movementY].some(function(m) {
          return Math.abs(m) > 1;
        })) && (state.isPointerDragging = true);
        var offset = getOffset(container);
        pointerPos.x = ev.pageX - offset.left;
        pointerPos.y = ev.pageY - offset.top;
        function getOffset(el) {
          var rect = el.getBoundingClientRect(), scrollLeft = window.pageXOffset || document.documentElement.scrollLeft, scrollTop = window.pageYOffset || document.documentElement.scrollTop;
          return {
            top: rect.top + scrollTop,
            left: rect.left + scrollLeft
          };
        }
      }, {
        passive: true
      });
    });
    container.addEventListener("pointerup", function(ev) {
      if (!state.isPointerPressed) {
        return;
      }
      state.isPointerPressed = false;
      if (state.isPointerDragging) {
        state.isPointerDragging = false;
        return;
      }
      var cbEvents = [ev, state.pointerDownEvent];
      requestAnimationFrame(function() {
        if (ev.button === 0) {
          if (state.hoverObj) {
            var fn = state["on".concat(state.hoverObj.type, "Click")];
            fn && fn.apply(void 0, [state.hoverObj.d].concat(cbEvents));
          } else {
            state.onBackgroundClick && state.onBackgroundClick.apply(state, cbEvents);
          }
        }
        if (ev.button === 2) {
          if (state.hoverObj) {
            var _fn = state["on".concat(state.hoverObj.type, "RightClick")];
            _fn && _fn.apply(void 0, [state.hoverObj.d].concat(cbEvents));
          } else {
            state.onBackgroundRightClick && state.onBackgroundRightClick.apply(state, cbEvents);
          }
        }
      });
    }, {
      passive: true
    });
    container.addEventListener("contextmenu", function(ev) {
      if (!state.onBackgroundRightClick && !state.onNodeRightClick && !state.onLinkRightClick) return true;
      ev.preventDefault();
      return false;
    });
    state.forceGraph(ctx);
    state.shadowGraph(shadowCtx);
    var refreshShadowCanvas = throttle(function() {
      clearCanvas(shadowCtx, state.width, state.height);
      state.shadowGraph.linkWidth(function(l) {
        return index$2(state.linkWidth)(l) + state.linkHoverPrecision;
      });
      var t2 = transform(state.canvas);
      state.shadowGraph.globalScale(t2.k).tickFrame();
    }, HOVER_CANVAS_THROTTLE_DELAY);
    state.flushShadowCanvas = refreshShadowCanvas.flush;
    (this._animationCycle = function animate() {
      var doRedraw = !state.autoPauseRedraw || !!state.needsRedraw || state.forceGraph.isEngineRunning() || state.graphData.links.some(function(d) {
        return d.__photons && d.__photons.length;
      });
      state.needsRedraw = false;
      if (state.enablePointerInteraction) {
        var obj = !state.isPointerDragging ? getObjUnderPointer() : null;
        if (obj !== state.hoverObj) {
          var prevObj = state.hoverObj;
          var prevObjType = prevObj ? prevObj.type : null;
          var objType = obj ? obj.type : null;
          if (prevObjType && prevObjType !== objType) {
            var fn = state["on".concat(prevObjType, "Hover")];
            fn && fn(null, prevObj.d);
          }
          if (objType) {
            var _fn2 = state["on".concat(objType, "Hover")];
            _fn2 && _fn2(obj.d, prevObjType === objType ? prevObj.d : null);
          }
          state.tooltip.content(obj ? index$2(state["".concat(obj.type.toLowerCase(), "Label")])(obj.d) || null : null);
          state.canvas.classList[(obj && state["on".concat(objType, "Click")] || !obj && state.onBackgroundClick) && index$2(state.showPointerCursor)(obj === null || obj === void 0 ? void 0 : obj.d) ? "add" : "remove"]("clickable");
          state.hoverObj = obj;
        }
        doRedraw && refreshShadowCanvas();
      }
      if (doRedraw) {
        clearCanvas(ctx, state.width, state.height);
        var globalScale = transform(state.canvas).k;
        state.onRenderFramePre && state.onRenderFramePre(ctx, globalScale);
        state.forceGraph.globalScale(globalScale).tickFrame();
        state.onRenderFramePost && state.onRenderFramePost(ctx, globalScale);
      }
      state.tweenGroup.update();
      state.animationFrameRequestId = requestAnimationFrame(animate);
    })();
  },
  update: function updateFn(state) {
  }
});
const _hoisted_1$7 = { class: "graph-2d-container" };
const _hoisted_2$7 = {
  key: 0,
  class: "node-detail-card"
};
const _hoisted_3$7 = { class: "card-header" };
const _hoisted_4$7 = { class: "node-name" };
const _hoisted_5$5 = { class: "node-description" };
const _hoisted_6$5 = { class: "node-meta" };
const _hoisted_7$4 = {
  key: 0,
  class: "meta-item"
};
const _hoisted_8$4 = { class: "meta-value" };
const _hoisted_9$3 = {
  key: 1,
  class: "meta-item"
};
const _hoisted_10$3 = { class: "meta-value" };
const _hoisted_11$3 = { class: "connections-info" };
const _hoisted_12$3 = { class: "connections-count" };
const _sfc_main$7 = {
  __name: "Graph2D",
  props: {
    densityThreshold: { type: Number, default: 0 },
    // 0~100 密度過濾
    focusFade: { type: Boolean, default: true },
    // 聚焦時淡化無關節點
    clusterEnabled: { type: Boolean, default: true }
    // 語義聚合叢集
  },
  setup(__props, { expose: __expose }) {
    const debounce = (func, wait) => {
      let timeout2;
      const debounced = function(...args) {
        clearTimeout(timeout2);
        timeout2 = setTimeout(() => func.apply(this, args), wait);
      };
      debounced.cancel = () => clearTimeout(timeout2);
      return debounced;
    };
    const graphStore = useGraphStore();
    const layoutStore = useLayoutStore();
    const props = __props;
    const containerRef = ref(null);
    let graphInstance = null;
    let isUpdating = ref(false);
    const backgroundColor = computed(() => {
      return "#0a0e27";
    });
    const linkColor = computed(() => {
      return "rgba(120, 200, 255, 0.85)";
    });
    const linkParticleColor = computed(() => {
      return "rgba(68, 138, 255, 0.5)";
    });
    const labelBgColor = computed(() => {
      return "rgba(10, 14, 39, 0.8)";
    });
    const updateGraphData = debounce(() => {
      if (!graphInstance || isUpdating.value) return;
      const newNodes = graphStore.nodes;
      const newLinks = graphStore.links;
      const newAiLinks = graphStore.aiLinks;
      const isCrossGraph = graphStore.isCrossGraphMode;
      if (newNodes.length === 0) return;
      isUpdating.value = true;
      try {
        const nodesClone = JSON.parse(JSON.stringify(newNodes));
        let linksClone = JSON.parse(JSON.stringify(newLinks));
        if (isCrossGraph && newAiLinks && newAiLinks.length > 0) {
          const aiLinksClone = JSON.parse(JSON.stringify(newAiLinks));
          linksClone = [...linksClone, ...aiLinksClone];
        }
        graphInstance.graphData({ nodes: nodesClone, links: linksClone });
      } finally {
        isUpdating.value = false;
      }
    }, 150);
    watch(
      () => ({
        nodeCount: graphStore.nodes.length,
        linkCount: graphStore.links.length,
        aiLinkCount: graphStore.aiLinks.length,
        crossGraphMode: graphStore.isCrossGraphMode,
        currentGraphId: graphStore.currentGraphId
      }),
      (newVal, oldVal) => {
        if (graphInstance && (newVal.nodeCount !== (oldVal == null ? void 0 : oldVal.nodeCount) || newVal.linkCount !== (oldVal == null ? void 0 : oldVal.linkCount) || newVal.aiLinkCount !== (oldVal == null ? void 0 : oldVal.aiLinkCount) || newVal.crossGraphMode !== (oldVal == null ? void 0 : oldVal.crossGraphMode) || newVal.currentGraphId !== (oldVal == null ? void 0 : oldVal.currentGraphId))) {
          updateGraphData();
        }
      }
    );
    const initGraph = async () => {
      if (!containerRef.value) return;
      graphStore.nodes.length > 0;
      const nodesClone = JSON.parse(JSON.stringify(graphStore.nodes));
      const linksClone = graphStore.isCrossGraphMode ? JSON.parse(JSON.stringify([...graphStore.links, ...graphStore.aiLinks])) : JSON.parse(JSON.stringify(graphStore.links));
      graphInstance = forceGraph()(containerRef.value).graphData({ nodes: nodesClone, links: linksClone }).backgroundColor(backgroundColor.value).nodeLabel("name").nodeColor((node) => node.color || "#448aff").nodeVal((node) => node.size || 10).nodeVisibility((node) => {
        if (props.densityThreshold > 0) {
          const linkCount = graphStore.getNodeLinks(node.id).length;
          const maxLinks = Math.max(1, ...graphStore.nodes.map((n) => graphStore.getNodeLinks(n.id).length));
          const normalised = linkCount / maxLinks * 100;
          if (normalised < props.densityThreshold) return false;
        }
        return true;
      }).nodeCanvasObject((node, ctx, globalScale) => {
        var _a;
        const selectedId = (_a = graphStore.selectedNode) == null ? void 0 : _a.id;
        const isSelected = selectedId === node.id;
        let fadeAlpha = 1;
        if (props.focusFade && selectedId && !isSelected) {
          const neighborIds = /* @__PURE__ */ new Set();
          graphStore.links.forEach((l) => {
            const src = typeof l.source === "object" ? l.source.id : l.source;
            const tgt = typeof l.target === "object" ? l.target.id : l.target;
            if (src === selectedId) neighborIds.add(tgt);
            if (tgt === selectedId) neighborIds.add(src);
          });
          fadeAlpha = neighborIds.has(node.id) ? 0.85 : 0.12;
        }
        ctx.globalAlpha = fadeAlpha;
        if (props.clusterEnabled && globalScale < 0.7 && node.__clusterCenter) {
          const r = node.__clusterRadius || 40;
          ctx.beginPath();
          ctx.arc(node.x, node.y, r, 0, 2 * Math.PI);
          ctx.fillStyle = (node.color || "#448aff") + "15";
          ctx.fill();
          ctx.strokeStyle = (node.color || "#448aff") + "30";
          ctx.lineWidth = 1.5 / globalScale;
          ctx.setLineDash([4 / globalScale, 4 / globalScale]);
          ctx.stroke();
          ctx.setLineDash([]);
          const clusterFont = 14 / globalScale;
          ctx.font = `bold ${clusterFont}px 'Inter', sans-serif`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillStyle = (node.color || "#448aff") + "aa";
          ctx.fillText(node.__clusterLabel || node.type, node.x, node.y - r - 6 / globalScale);
        }
        const label = node.name;
        let fontSize;
        if (globalScale <= 1.5) {
          fontSize = 12;
        } else if (globalScale <= 2.5) {
          fontSize = 10;
        } else if (globalScale <= 3.5) {
          fontSize = 8;
        } else {
          fontSize = 6;
        }
        ctx.font = `${fontSize}px 'Inter', sans-serif`;
        const textWidth = ctx.measureText(label).width;
        const bckgDimensions = [textWidth, fontSize].map((n) => n + fontSize * 0.4);
        const baseNodeSize = Math.sqrt(node.size || 10) * 1.5;
        const nodeSize = isSelected ? baseNodeSize * 1.8 : baseNodeSize;
        if (isSelected) {
          const pulseSize = nodeSize + Math.sin(Date.now() / 300) * 3;
          ctx.beginPath();
          ctx.arc(node.x, node.y, pulseSize, 0, 2 * Math.PI, false);
          ctx.fillStyle = (node.color || "#448aff") + "30";
          ctx.fill();
          ctx.beginPath();
          ctx.arc(node.x, node.y, pulseSize + 4, 0, 2 * Math.PI, false);
          ctx.strokeStyle = (node.color || "#448aff") + "60";
          ctx.lineWidth = 3 / globalScale;
          ctx.stroke();
        }
        ctx.beginPath();
        ctx.arc(node.x, node.y, nodeSize, 0, 2 * Math.PI, false);
        ctx.fillStyle = node.color || "#448aff";
        ctx.fill();
        if (isSelected) {
          ctx.strokeStyle = "#fbbf24";
          ctx.lineWidth = 3 / globalScale;
          ctx.stroke();
          ctx.beginPath();
          ctx.arc(node.x, node.y, nodeSize - 2 / globalScale, 0, 2 * Math.PI, false);
          ctx.strokeStyle = "rgba(255, 255, 255, 0.8)";
          ctx.lineWidth = 1 / globalScale;
          ctx.stroke();
        } else {
          ctx.strokeStyle = `rgba(255, 255, 255, ${0.2 * fadeAlpha})`;
          ctx.lineWidth = 0.5 / globalScale;
          ctx.stroke();
        }
        const labelFontSize = isSelected ? fontSize * 1.4 : fontSize;
        const labelOffset = nodeSize + 4;
        if (isSelected) {
          ctx.font = `bold ${labelFontSize}px 'Inter', sans-serif`;
          const selectedTextWidth = ctx.measureText(label).width;
          const selectedBckgDimensions = [selectedTextWidth + labelFontSize * 0.8, labelFontSize + 8];
          ctx.shadowColor = "rgba(0, 0, 0, 0.4)";
          ctx.shadowBlur = 8;
          ctx.shadowOffsetX = 0;
          ctx.shadowOffsetY = 2;
          ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
          const cornerRadius = 6;
          const rectX = node.x - selectedBckgDimensions[0] / 2;
          const rectY = node.y + labelOffset;
          const rectW = selectedBckgDimensions[0];
          const rectH = selectedBckgDimensions[1];
          ctx.beginPath();
          ctx.moveTo(rectX + cornerRadius, rectY);
          ctx.lineTo(rectX + rectW - cornerRadius, rectY);
          ctx.quadraticCurveTo(rectX + rectW, rectY, rectX + rectW, rectY + cornerRadius);
          ctx.lineTo(rectX + rectW, rectY + rectH - cornerRadius);
          ctx.quadraticCurveTo(rectX + rectW, rectY + rectH, rectX + rectW - cornerRadius, rectY + rectH);
          ctx.lineTo(rectX + cornerRadius, rectY + rectH);
          ctx.quadraticCurveTo(rectX, rectY + rectH, rectX, rectY + rectH - cornerRadius);
          ctx.lineTo(rectX, rectY + cornerRadius);
          ctx.quadraticCurveTo(rectX, rectY, rectX + cornerRadius, rectY);
          ctx.closePath();
          ctx.fill();
          ctx.shadowColor = "transparent";
          ctx.strokeStyle = "#fbbf24";
          ctx.lineWidth = 2 / globalScale;
          ctx.stroke();
          ctx.shadowColor = "transparent";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillStyle = "#1e293b";
          ctx.fillText(label, node.x, node.y + labelOffset + selectedBckgDimensions[1] / 2);
        } else if (fadeAlpha > 0.3) {
          const isHovered = hoveredNodeId.value === node.id;
          const showLabel = isHovered || globalScale >= 1.2;
          if (showLabel) {
            ctx.shadowColor = "transparent";
            ctx.fillStyle = labelBgColor.value;
            ctx.fillRect(
              node.x - bckgDimensions[0] / 2,
              node.y + labelOffset,
              bckgDimensions[0],
              bckgDimensions[1]
            );
            ctx.font = `${labelFontSize}px 'Inter', sans-serif`;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillStyle = node.color || "#e5e5e5";
            ctx.fillText(label, node.x, node.y + labelOffset + labelFontSize / 2 + 2);
          }
        }
        ctx.globalAlpha = 1;
      }).linkColor((link) => {
        var _a, _b;
        const selectedId = (_a = graphStore.selectedNode) == null ? void 0 : _a.id;
        if (props.focusFade && selectedId) {
          const src = typeof link.source === "object" ? link.source.id : link.source;
          const tgt = typeof link.target === "object" ? link.target.id : link.target;
          const related = src === selectedId || tgt === selectedId;
          if (!related) return "rgba(120, 200, 255, 0.06)";
        }
        if (link.type === "ai-link") return ((_b = link.style) == null ? void 0 : _b.color) || "#fbbf24";
        return linkColor.value;
      }).linkWidth((link) => {
        var _a, _b;
        const selectedId = (_a = graphStore.selectedNode) == null ? void 0 : _a.id;
        if (props.focusFade && selectedId) {
          const src = typeof link.source === "object" ? link.source.id : link.source;
          const tgt = typeof link.target === "object" ? link.target.id : link.target;
          if (src !== selectedId && tgt !== selectedId) return 0.5;
        }
        if (link.type === "ai-link") return ((_b = link.style) == null ? void 0 : _b.width) || 3;
        return 4;
      }).linkVisibility((link) => {
        if (props.densityThreshold <= 0) return true;
        const src = typeof link.source === "object" ? link.source.id : link.source;
        const tgt = typeof link.target === "object" ? link.target.id : link.target;
        const srcCount = graphStore.getNodeLinks(src).length;
        const tgtCount = graphStore.getNodeLinks(tgt).length;
        const maxLinks = Math.max(1, ...graphStore.nodes.map((n) => graphStore.getNodeLinks(n.id).length));
        return srcCount / maxLinks * 100 >= props.densityThreshold && tgtCount / maxLinks * 100 >= props.densityThreshold;
      }).linkDirectionalParticles((link) => {
        var _a;
        if (link.type === "ai-link" && ((_a = link.style) == null ? void 0 : _a.animated)) {
          return 2;
        }
        return 0;
      }).linkDirectionalParticleWidth(3).linkDirectionalParticleColor((link) => {
        var _a;
        if (link.type === "ai-link") {
          return ((_a = link.style) == null ? void 0 : _a.color) || "#fbbf24";
        }
        return linkParticleColor.value;
      }).onNodeClick(handleNodeClick).onNodeHover(handleNodeHover).d3Force("charge", forceManyBody$1().strength(-800)).d3Force("link", forceLink$1().distance(200)).d3Force("collide", forceCollide().radius((node) => Math.sqrt(node.size || 10) * 3 + 20).strength(0.7)).d3VelocityDecay(0.3).warmupTicks(100).cooldownTicks(300);
      computeClusterCenters();
    };
    const handleNodeClick = (node) => {
      if (node) {
        graphStore.selectNode(node.id);
        if (graphInstance && node.x !== void 0 && node.y !== void 0) {
          const currentZoom = graphInstance.zoom();
          graphInstance.centerAt(node.x, node.y, 800);
          const targetZoom = Math.max(currentZoom, 3);
          setTimeout(() => {
            graphInstance.zoom(targetZoom, 600);
          }, 400);
          let frameCount = 0;
          const animate = () => {
            if (frameCount < 60) {
              graphInstance.nodeCanvasObject(graphInstance.nodeCanvasObject());
              frameCount++;
              requestAnimationFrame(animate);
            }
          };
          animate();
        }
      }
    };
    const hoveredNodeId = ref(null);
    const handleNodeHover = (node) => {
      hoveredNodeId.value = node ? node.id : null;
      if (containerRef.value) {
        containerRef.value.style.cursor = node ? "pointer" : "grab";
      }
      if (graphInstance) graphInstance.nodeCanvasObject(graphInstance.nodeCanvasObject());
    };
    watch(() => graphStore.selectedNode, (newNode) => {
      if (graphInstance && newNode) {
        graphInstance.nodeCanvasObject(graphInstance.nodeCanvasObject());
      }
    });
    watch(
      () => layoutStore.theme,
      debounce((newTheme) => {
        if (graphInstance) {
          graphInstance.backgroundColor(backgroundColor.value);
          graphInstance.nodeCanvasObject(graphInstance.nodeCanvasObject());
        }
      }, 100)
    );
    watch(
      () => [props.densityThreshold, props.focusFade, props.clusterEnabled],
      () => {
        if (graphInstance) {
          computeClusterCenters();
          graphInstance.nodeCanvasObject(graphInstance.nodeCanvasObject());
        }
      }
    );
    const computeClusterCenters = () => {
      if (!props.clusterEnabled) return;
      const typeGroups = {};
      graphStore.nodes.forEach((n) => {
        const t2 = n.type || "unknown";
        if (!typeGroups[t2]) typeGroups[t2] = [];
        typeGroups[t2].push(n);
      });
      graphStore.nodes.forEach((n) => {
        n.__clusterCenter = false;
      });
      Object.entries(typeGroups).forEach(([type, members]) => {
        if (members.length < 3) return;
        let center = members[0];
        let maxLinks = 0;
        members.forEach((m) => {
          const lc = graphStore.getNodeLinks(m.id).length;
          if (lc > maxLinks) {
            maxLinks = lc;
            center = m;
          }
        });
        center.__clusterCenter = true;
        center.__clusterRadius = Math.max(30, Math.sqrt(members.length) * 25);
        center.__clusterLabel = `${type} (${members.length})`;
      });
    };
    const focusNode = (node) => {
      const graphNode = graphStore.nodes.find((n) => n.id === node.id);
      if (!graphNode) {
        return;
      }
      handleNodeClick(graphNode);
    };
    const resetView = () => {
      if (graphInstance) {
        graphInstance.zoomToFit(1e3);
      }
    };
    const zoomIn = () => {
      if (graphInstance) {
        const z = graphInstance.zoom();
        graphInstance.zoom(z * 1.4, 300);
      }
    };
    const zoomOut = () => {
      if (graphInstance) {
        const z = graphInstance.zoom();
        graphInstance.zoom(z / 1.4, 300);
      }
    };
    const getZoom = () => {
      return graphInstance ? graphInstance.zoom() : 1;
    };
    const zoomToFit2 = () => {
      if (graphInstance) {
        graphInstance.zoomToFit(800);
      }
    };
    __expose({
      focusNode,
      resetView,
      zoomIn,
      zoomOut,
      getZoom,
      zoomToFit: zoomToFit2
    });
    const handleResize = debounce(() => {
      if (graphInstance && containerRef.value) {
        const width = containerRef.value.offsetWidth;
        const height = containerRef.value.offsetHeight;
        graphInstance.width(width).height(height);
      }
    }, 200);
    onMounted(async () => {
      await nextTick();
      await initGraph();
      window.addEventListener("resize", handleResize);
    });
    onUnmounted(() => {
      window.removeEventListener("resize", handleResize);
      updateGraphData.cancel();
      if (graphInstance) {
        graphInstance._destructor();
        graphInstance = null;
      }
    });
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", _hoisted_1$7, [
        createBaseVNode("div", {
          ref_key: "containerRef",
          ref: containerRef,
          class: "graph-canvas"
        }, null, 512),
        createVNode(Transition$1, { name: "slide-up" }, {
          default: withCtx(() => [
            unref(graphStore).selectedNode ? (openBlock(), createElementBlock("div", _hoisted_2$7, [
              createBaseVNode("div", _hoisted_3$7, [
                createBaseVNode("div", {
                  class: "node-type",
                  style: normalizeStyle({ color: unref(graphStore).selectedNode.color })
                }, toDisplayString(unref(graphStore).selectedNode.type), 5),
                createBaseVNode("button", {
                  class: "close-btn",
                  onClick: _cache[0] || (_cache[0] = ($event) => unref(graphStore).clearSelection())
                }, "✕")
              ]),
              createBaseVNode("h3", _hoisted_4$7, toDisplayString(unref(graphStore).selectedNode.name), 1),
              createBaseVNode("p", _hoisted_5$5, toDisplayString(unref(graphStore).selectedNode.description), 1),
              createBaseVNode("div", _hoisted_6$5, [
                unref(graphStore).selectedNode.status ? (openBlock(), createElementBlock("div", _hoisted_7$4, [
                  _cache[1] || (_cache[1] = createBaseVNode("span", { class: "meta-label" }, "狀態:", -1)),
                  createBaseVNode("span", _hoisted_8$4, toDisplayString(unref(graphStore).selectedNode.status), 1)
                ])) : createCommentVNode("", true),
                unref(graphStore).selectedNode.date ? (openBlock(), createElementBlock("div", _hoisted_9$3, [
                  _cache[2] || (_cache[2] = createBaseVNode("span", { class: "meta-label" }, "日期:", -1)),
                  createBaseVNode("span", _hoisted_10$3, toDisplayString(unref(graphStore).selectedNode.date), 1)
                ])) : createCommentVNode("", true)
              ]),
              createBaseVNode("div", _hoisted_11$3, [
                _cache[3] || (_cache[3] = createBaseVNode("span", { class: "connections-label" }, "🔗 連線數量:", -1)),
                createBaseVNode("span", _hoisted_12$3, toDisplayString(unref(graphStore).getNodeLinks(unref(graphStore).selectedNode.id).length), 1)
              ])
            ])) : createCommentVNode("", true)
          ]),
          _: 1
        })
      ]);
    };
  }
};
const Graph2D = /* @__PURE__ */ _export_sfc(_sfc_main$7, [["__scopeId", "data-v-f16636c0"]]);
const _hoisted_1$6 = { class: "nexus-panel flex flex-col h-full" };
const _hoisted_2$6 = { class: "px-6 py-4 select-wrapper" };
const _hoisted_3$6 = ["value"];
const _hoisted_4$6 = ["value"];
const _hoisted_5$4 = { class: "flex gap-2 mt-3" };
const _hoisted_6$4 = { class: "relative px-6 py-2" };
const _hoisted_7$3 = { class: "grid grid-cols-4 gap-2 px-6 py-2" };
const _hoisted_8$3 = { class: "grid grid-cols-2 gap-2 px-6 py-2" };
const _hoisted_9$2 = { class: "px-6 py-2" };
const _hoisted_10$2 = { class: "text-xs" };
const _hoisted_11$2 = { class: "grid grid-cols-3 gap-3 px-6 py-4 border-y bg-white/5 border-white/5" };
const _hoisted_12$2 = { class: "flex flex-col items-center gap-1" };
const _hoisted_13$2 = { class: "text-2xl font-bold text-blue-400 font-mono" };
const _hoisted_14$1 = { class: "flex flex-col items-center gap-1" };
const _hoisted_15$1 = { class: "text-2xl font-bold text-blue-400 font-mono" };
const _hoisted_16$1 = {
  key: 0,
  class: "flex flex-col items-center gap-1"
};
const _hoisted_17$1 = { class: "text-2xl font-bold text-purple-400 font-mono" };
const _hoisted_18$1 = {
  key: 0,
  class: "flex flex-col items-center justify-center h-full gap-4 py-12"
};
const _hoisted_19$1 = {
  key: 1,
  class: "flex flex-col gap-1"
};
const _hoisted_20$1 = ["onClick"];
const _hoisted_21$1 = { class: "text-lg" };
const _hoisted_22$1 = { class: "flex-1 text-sm font-medium text-white truncate" };
const _hoisted_23$1 = {
  key: 2,
  class: "grid grid-cols-4 gap-2"
};
const _hoisted_24$1 = ["onClick", "title"];
const _hoisted_25$1 = { class: "text-2xl" };
const _hoisted_26$1 = {
  key: 3,
  class: "grid grid-cols-2 gap-3"
};
const _hoisted_27$1 = ["onClick"];
const _hoisted_28$1 = { class: "text-3xl" };
const _hoisted_29$1 = { class: "flex flex-col gap-1" };
const _hoisted_30 = { class: "text-sm font-semibold text-white truncate" };
const _hoisted_31 = { class: "text-xs text-gray-400 truncate" };
const _hoisted_32 = {
  key: 4,
  class: "flex flex-col gap-4"
};
const _hoisted_33 = ["onClick"];
const _hoisted_34 = { class: "flex items-start gap-4 mb-3" };
const _hoisted_35 = { class: "text-3xl" };
const _hoisted_36 = { class: "flex-1 flex flex-col gap-1" };
const _hoisted_37 = { class: "text-base font-bold text-white" };
const _hoisted_38 = { class: "text-sm text-gray-400" };
const _hoisted_39 = {
  key: 0,
  class: "text-xs text-gray-300 leading-relaxed m-0"
};
const _sfc_main$6 = {
  __name: "NexusPanel",
  props: {
    searchQuery: {
      type: String,
      default: ""
    },
    selectedGraphId: {
      type: Number,
      default: 1
    },
    activeFilter: {
      type: String,
      default: "all"
    },
    nodeViewMode: {
      type: String,
      default: "medium"
    },
    isLinkingMode: {
      type: Boolean,
      default: false
    },
    linkingSource: {
      type: Object,
      default: null
    }
  },
  emits: [
    "update:searchQuery",
    "update:selectedGraphId",
    "update:activeFilter",
    "update:nodeViewMode",
    "update:isLinkingMode",
    "graph-change",
    "edit-graph",
    "create-graph",
    "delete-graph",
    "search",
    "clear-search",
    "toggle-view-mode",
    "toggle-linking-mode",
    "node-click"
  ],
  setup(__props, { emit: __emit }) {
    const graphStore = useGraphStore();
    useLayoutStore();
    const props = __props;
    const emit = __emit;
    const isSelectOpen = ref(false);
    const searchQueryLocal = computed({
      get: () => props.searchQuery,
      set: (val) => emit("update:searchQuery", val)
    });
    const filteredNodes = computed(() => {
      let nodes = graphStore.nodes;
      if (props.activeFilter === "focus" && graphStore.selectedNode) {
        const neighbors = graphStore.getNeighbors(graphStore.selectedNode.id);
        const neighborIds = /* @__PURE__ */ new Set([graphStore.selectedNode.id, ...neighbors.map((n) => n.id)]);
        nodes = nodes.filter((n) => neighborIds.has(n.id));
      } else if (props.activeFilter === "part") {
        nodes = nodes.filter((n) => {
          var _a;
          return n.group === ((_a = graphStore.selectedNode) == null ? void 0 : _a.group);
        });
      }
      if (searchQueryLocal.value) {
        const query = searchQueryLocal.value.toLowerCase();
        nodes = nodes.filter(
          (n) => {
            var _a, _b, _c;
            return ((_a = n.name) == null ? void 0 : _a.toLowerCase().includes(query)) || ((_b = n.label) == null ? void 0 : _b.toLowerCase().includes(query)) || ((_c = n.type) == null ? void 0 : _c.toLowerCase().includes(query));
          }
        );
      }
      return nodes;
    });
    const nodeStats = computed(() => ({
      total: graphStore.nodes.length,
      links: graphStore.links.length,
      filtered: filteredNodes.value.length
    }));
    function handleGraphChange(event) {
      let newId2 = event.target.value;
      if (!isNaN(newId2) && newId2.trim() !== "") {
        newId2 = parseInt(newId2);
      }
      console.log("📊 [NexusPanel] 切換圖譜:", newId2);
      emit("update:selectedGraphId", newId2);
      emit("graph-change", newId2);
    }
    function onSelectMouseDown() {
      isSelectOpen.value = true;
    }
    function onSelectBlur() {
      setTimeout(() => {
        isSelectOpen.value = false;
      }, 200);
    }
    function clearSearch() {
      searchQueryLocal.value = "";
      emit("clear-search");
    }
    function setNodeViewMode(mode) {
      emit("update:nodeViewMode", mode);
    }
    function setFilter(filter) {
      emit("update:activeFilter", filter);
    }
    function toggleViewMode() {
      emit("toggle-view-mode");
    }
    function toggleLinkingMode() {
      emit("update:isLinkingMode", !props.isLinkingMode);
      emit("toggle-linking-mode");
    }
    function handleNodeClick(node) {
      emit("node-click", node);
    }
    function getNodeIcon(node) {
      const iconMap = {
        "file": "📄",
        "document": "📝",
        "folder": "📁",
        "link": "🔗",
        "person": "👤",
        "company": "🏢",
        "project": "📊",
        "task": "✅",
        "note": "📋",
        "image": "🖼️",
        "video": "🎬",
        "audio": "🎵",
        "code": "💻",
        "database": "🗄️",
        "api": "⚡"
      };
      return node.emoji || iconMap[node.group] || iconMap[node.type] || "📌";
    }
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", _hoisted_1$6, [
        _cache[19] || (_cache[19] = createBaseVNode("div", { class: "flex items-center justify-between px-6 py-5 border-b border-white/5" }, [
          createBaseVNode("h2", { class: "m-0 text-xl font-extrabold tracking-tight text-white" }, [
            createTextVNode(" BruV AI "),
            createBaseVNode("span", { class: "bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent" }, "NEXUS")
          ]),
          createBaseVNode("span", { class: "px-3 py-1 bg-blue-600 text-white rounded-md text-xs font-semibold uppercase tracking-wider" }, "Admin")
        ], -1)),
        createBaseVNode("div", _hoisted_2$6, [
          createBaseVNode("select", {
            class: "w-full px-4 py-2.5 border rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer select-smooth bg-white/5 border-white/10 text-white hover:bg-white/8 focus:bg-white/10",
            value: __props.selectedGraphId,
            onChange: handleGraphChange,
            onMousedown: onSelectMouseDown,
            onBlur: onSelectBlur
          }, [
            _cache[12] || (_cache[12] = createBaseVNode("option", { value: "1" }, "🧠 主腦圖譜", -1)),
            (openBlock(true), createElementBlock(Fragment, null, renderList(unref(graphStore).graphMetadataList.filter((g) => g.id !== 1 && g.id !== "1"), (graph) => {
              return openBlock(), createElementBlock("option", {
                key: graph.id,
                value: graph.id
              }, toDisplayString(graph.icon) + " " + toDisplayString(graph.name), 9, _hoisted_4$6);
            }), 128))
          ], 40, _hoisted_3$6),
          createBaseVNode("div", {
            class: normalizeClass(["select-arrow", { "rotate": isSelectOpen.value }])
          }, [..._cache[13] || (_cache[13] = [
            createBaseVNode("svg", {
              width: "12",
              height: "12",
              viewBox: "0 0 12 12",
              fill: "currentColor"
            }, [
              createBaseVNode("path", { d: "M6 8L2 4h8L6 8z" })
            ], -1)
          ])], 2),
          createBaseVNode("div", _hoisted_5$4, [
            createBaseVNode("button", {
              class: "flex-1 px-3 py-2 border rounded-lg text-sm transition-all bg-white/5 hover:bg-white/10 border-white/10",
              onClick: _cache[0] || (_cache[0] = ($event) => emit("edit-graph")),
              title: "編輯圖譜"
            }, " ✏️ "),
            createBaseVNode("button", {
              class: "flex-1 px-3 py-2 border rounded-lg text-sm transition-all bg-white/5 hover:bg-white/10 border-white/10",
              onClick: _cache[1] || (_cache[1] = ($event) => emit("create-graph")),
              title: "新增圖譜"
            }, " ➕ "),
            createBaseVNode("button", {
              class: "flex-1 px-3 py-2 border rounded-lg text-sm transition-all bg-white/5 hover:bg-white/10 border-white/10",
              onClick: _cache[2] || (_cache[2] = ($event) => emit("delete-graph")),
              title: "刪除圖譜"
            }, " 🗑️ ")
          ])
        ]),
        createBaseVNode("div", _hoisted_6$4, [
          withDirectives(createBaseVNode("input", {
            "onUpdate:modelValue": _cache[3] || (_cache[3] = ($event) => searchQueryLocal.value = $event),
            type: "text",
            class: "w-full px-4 py-2.5 pr-10 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all bg-white/5 border-white/10 text-white placeholder-gray-400 focus:bg-white/10",
            placeholder: "Search nodes...",
            onKeyup: _cache[4] || (_cache[4] = withKeys(($event) => emit("search"), ["enter"]))
          }, null, 544), [
            [vModelText, searchQueryLocal.value]
          ]),
          searchQueryLocal.value ? (openBlock(), createElementBlock("button", {
            key: 0,
            class: "absolute right-8 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded-full text-xs transition-all bg-white/20 hover:bg-white/30 text-white",
            onClick: clearSearch
          }, "✕")) : createCommentVNode("", true)
        ]),
        createBaseVNode("div", _hoisted_7$3, [
          createBaseVNode("button", {
            class: normalizeClass(["px-3 py-2 bg-white/5 hover:bg-blue-600 hover:text-white border border-white/10 rounded-lg text-base font-bold text-gray-300 transition-all", { "bg-blue-600 text-white border-blue-600": __props.nodeViewMode === "list" }]),
            onClick: _cache[5] || (_cache[5] = ($event) => setNodeViewMode("list")),
            title: "文字列表"
          }, " ≣ ", 2),
          createBaseVNode("button", {
            class: normalizeClass(["px-3 py-2 bg-white/5 hover:bg-blue-600 hover:text-white border border-white/10 rounded-lg text-base font-bold text-gray-300 transition-all", { "bg-blue-600 text-white border-blue-600": __props.nodeViewMode === "small" }]),
            onClick: _cache[6] || (_cache[6] = ($event) => setNodeViewMode("small")),
            title: "小圖示"
          }, " ▦ ", 2),
          createBaseVNode("button", {
            class: normalizeClass(["px-3 py-2 bg-white/5 hover:bg-blue-600 hover:text-white border border-white/10 rounded-lg text-base font-bold text-gray-300 transition-all", { "bg-blue-600 text-white border-blue-600": __props.nodeViewMode === "medium" }]),
            onClick: _cache[7] || (_cache[7] = ($event) => setNodeViewMode("medium")),
            title: "中等卡片"
          }, " ⊞ ", 2),
          createBaseVNode("button", {
            class: normalizeClass(["px-3 py-2 bg-white/5 hover:bg-blue-600 hover:text-white border border-white/10 rounded-lg text-base font-bold text-gray-300 transition-all", { "bg-blue-600 text-white border-blue-600": __props.nodeViewMode === "large" }]),
            onClick: _cache[8] || (_cache[8] = ($event) => setNodeViewMode("large")),
            title: "大型卡片"
          }, " 🎆 ", 2)
        ]),
        createBaseVNode("div", _hoisted_8$3, [
          createBaseVNode("button", {
            class: normalizeClass(["px-4 py-2.5 hover:bg-blue-600 hover:text-white border rounded-lg text-sm font-semibold transition-all", __props.activeFilter === "all" ? "bg-blue-600 text-white border-blue-600" : "bg-white/5 border-white/10 text-gray-300"]),
            onClick: _cache[9] || (_cache[9] = ($event) => setFilter("all"))
          }, " Show All ", 2),
          createBaseVNode("button", {
            class: normalizeClass(["px-4 py-2.5 hover:bg-blue-600 hover:text-white border rounded-lg text-sm font-semibold transition-all", __props.activeFilter === "focus" ? "bg-blue-600 text-white border-blue-600" : "bg-white/5 border-white/10 text-gray-300"]),
            onClick: _cache[10] || (_cache[10] = ($event) => setFilter("focus"))
          }, " Focus ", 2),
          createBaseVNode("button", {
            class: normalizeClass(["px-4 py-2.5 hover:bg-blue-600 hover:text-white border rounded-lg text-sm font-semibold transition-all", __props.activeFilter === "part" ? "bg-blue-600 text-white border-blue-600" : "bg-white/5 border-white/10 text-gray-300"]),
            onClick: _cache[11] || (_cache[11] = ($event) => setFilter("part"))
          }, " Show Part ", 2),
          createBaseVNode("button", {
            class: "px-4 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-0 rounded-lg text-sm font-semibold transition-all",
            onClick: toggleViewMode
          }, toDisplayString(unref(graphStore).viewMode === "3d" ? "🧊 3D" : "📐 2D") + " View ", 1)
        ]),
        createBaseVNode("div", _hoisted_9$2, [
          createBaseVNode("button", {
            class: normalizeClass(["w-full px-4 py-3 flex flex-col items-center gap-2 hover:bg-purple-600 hover:text-white border rounded-xl font-semibold transition-all", __props.isLinkingMode ? "bg-purple-600 text-white border-purple-600" : "bg-white/5 border-white/10 text-white"]),
            onClick: toggleLinkingMode
          }, [
            _cache[14] || (_cache[14] = createBaseVNode("span", { class: "text-2xl" }, "🔗", -1)),
            createBaseVNode("span", _hoisted_10$2, toDisplayString(__props.isLinkingMode ? "Linking" : "Link Mode"), 1)
          ], 2)
        ]),
        createBaseVNode("div", _hoisted_11$2, [
          createBaseVNode("div", _hoisted_12$2, [
            createBaseVNode("span", _hoisted_13$2, toDisplayString(nodeStats.value.total), 1),
            _cache[15] || (_cache[15] = createBaseVNode("span", { class: "text-xs font-semibold uppercase tracking-wider text-gray-400" }, "NODES", -1))
          ]),
          createBaseVNode("div", _hoisted_14$1, [
            createBaseVNode("span", _hoisted_15$1, toDisplayString(nodeStats.value.links), 1),
            _cache[16] || (_cache[16] = createBaseVNode("span", { class: "text-xs font-semibold uppercase tracking-wider text-gray-400" }, "LINKS", -1))
          ]),
          searchQueryLocal.value ? (openBlock(), createElementBlock("div", _hoisted_16$1, [
            createBaseVNode("span", _hoisted_17$1, toDisplayString(nodeStats.value.filtered), 1),
            _cache[17] || (_cache[17] = createBaseVNode("span", { class: "text-xs font-semibold uppercase tracking-wider text-gray-400" }, "FILTERED", -1))
          ])) : createCommentVNode("", true)
        ]),
        createBaseVNode("div", {
          class: normalizeClass(["flex-1 overflow-y-auto px-6 py-4", `view-mode-${__props.nodeViewMode}`])
        }, [
          filteredNodes.value.length === 0 ? (openBlock(), createElementBlock("div", _hoisted_18$1, [..._cache[18] || (_cache[18] = [
            createBaseVNode("span", { class: "text-6xl opacity-30" }, "📭", -1),
            createBaseVNode("div", { class: "text-center" }, [
              createBaseVNode("p", { class: "text-sm font-semibold text-gray-400 mb-1" }, "暫無資料"),
              createBaseVNode("p", { class: "text-xs text-gray-500" }, "請從下方匯入檔案")
            ], -1)
          ])])) : __props.nodeViewMode === "list" ? (openBlock(), createElementBlock("div", _hoisted_19$1, [
            (openBlock(true), createElementBlock(Fragment, null, renderList(filteredNodes.value.slice(0, 30), (node) => {
              var _a, _b;
              return openBlock(), createElementBlock("div", {
                key: node.id,
                class: normalizeClass(["flex items-center gap-3 px-3 py-2 bg-white/5 hover:bg-white/10 border border-transparent rounded-lg cursor-pointer transition-all", {
                  "bg-blue-900/30 border-blue-500": ((_a = unref(graphStore).selectedNode) == null ? void 0 : _a.id) === node.id,
                  "bg-purple-900/30 border-purple-500 animate-pulse": __props.isLinkingMode && ((_b = __props.linkingSource) == null ? void 0 : _b.id) === node.id
                }]),
                onClick: ($event) => handleNodeClick(node)
              }, [
                createBaseVNode("span", _hoisted_21$1, toDisplayString(getNodeIcon(node)), 1),
                createBaseVNode("span", _hoisted_22$1, toDisplayString(node.name || node.label), 1)
              ], 10, _hoisted_20$1);
            }), 128))
          ])) : __props.nodeViewMode === "small" ? (openBlock(), createElementBlock("div", _hoisted_23$1, [
            (openBlock(true), createElementBlock(Fragment, null, renderList(filteredNodes.value.slice(0, 40), (node) => {
              var _a, _b;
              return openBlock(), createElementBlock("div", {
                key: node.id,
                class: normalizeClass(["aspect-square flex items-center justify-center bg-white/5 hover:bg-white/10 border rounded-lg cursor-pointer transition-all", {
                  "border-blue-500 bg-blue-900/30": ((_a = unref(graphStore).selectedNode) == null ? void 0 : _a.id) === node.id,
                  "border-purple-500 bg-purple-900/30 animate-pulse": __props.isLinkingMode && ((_b = __props.linkingSource) == null ? void 0 : _b.id) === node.id
                }]),
                onClick: ($event) => handleNodeClick(node),
                title: node.name || node.label
              }, [
                createBaseVNode("span", _hoisted_25$1, toDisplayString(getNodeIcon(node)), 1)
              ], 10, _hoisted_24$1);
            }), 128))
          ])) : __props.nodeViewMode === "medium" ? (openBlock(), createElementBlock("div", _hoisted_26$1, [
            (openBlock(true), createElementBlock(Fragment, null, renderList(filteredNodes.value.slice(0, 20), (node) => {
              var _a, _b;
              return openBlock(), createElementBlock("div", {
                key: node.id,
                class: normalizeClass(["p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl cursor-pointer transition-all", {
                  "border-blue-500 bg-blue-900/20": ((_a = unref(graphStore).selectedNode) == null ? void 0 : _a.id) === node.id,
                  "border-purple-500 bg-purple-900/20 animate-pulse": __props.isLinkingMode && ((_b = __props.linkingSource) == null ? void 0 : _b.id) === node.id
                }]),
                onClick: ($event) => handleNodeClick(node)
              }, [
                createBaseVNode("div", {
                  class: "w-full aspect-square flex items-center justify-center rounded-lg mb-2",
                  style: normalizeStyle({ background: (node.color || "#3b82f6") + "30" })
                }, [
                  createBaseVNode("span", _hoisted_28$1, toDisplayString(getNodeIcon(node)), 1)
                ], 4),
                createBaseVNode("div", _hoisted_29$1, [
                  createBaseVNode("span", _hoisted_30, toDisplayString(node.name || node.label), 1),
                  createBaseVNode("span", _hoisted_31, toDisplayString(node.type || node.group), 1)
                ])
              ], 10, _hoisted_27$1);
            }), 128))
          ])) : __props.nodeViewMode === "large" ? (openBlock(), createElementBlock("div", _hoisted_32, [
            (openBlock(true), createElementBlock(Fragment, null, renderList(filteredNodes.value.slice(0, 10), (node) => {
              var _a, _b;
              return openBlock(), createElementBlock("div", {
                key: node.id,
                class: normalizeClass(["p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl cursor-pointer transition-all", {
                  "border-blue-500 bg-blue-900/20": ((_a = unref(graphStore).selectedNode) == null ? void 0 : _a.id) === node.id,
                  "border-purple-500 bg-purple-900/20 animate-pulse": __props.isLinkingMode && ((_b = __props.linkingSource) == null ? void 0 : _b.id) === node.id
                }]),
                onClick: ($event) => handleNodeClick(node)
              }, [
                createBaseVNode("div", _hoisted_34, [
                  createBaseVNode("div", {
                    class: "w-16 h-16 flex items-center justify-center rounded-xl flex-shrink-0",
                    style: normalizeStyle({ background: (node.color || "#3b82f6") + "40" })
                  }, [
                    createBaseVNode("span", _hoisted_35, toDisplayString(getNodeIcon(node)), 1)
                  ], 4),
                  createBaseVNode("div", _hoisted_36, [
                    createBaseVNode("span", _hoisted_37, toDisplayString(node.name || node.label), 1),
                    createBaseVNode("span", _hoisted_38, toDisplayString(node.type || node.group), 1)
                  ])
                ]),
                node.description ? (openBlock(), createElementBlock("p", _hoisted_39, toDisplayString(node.description), 1)) : createCommentVNode("", true)
              ], 10, _hoisted_33);
            }), 128))
          ])) : createCommentVNode("", true)
        ], 2)
      ]);
    };
  }
};
const NexusPanel = /* @__PURE__ */ _export_sfc(_sfc_main$6, [["__scopeId", "data-v-f5e176c9"]]);
const _hoisted_1$5 = { class: "color-legend" };
const _hoisted_2$5 = { class: "flex items-center gap-2" };
const _hoisted_3$5 = { class: "px-1.5 py-0.5 text-[10px] font-bold text-neon-blue bg-neon-blue/10 rounded-full" };
const _hoisted_4$5 = { class: "mt-2 space-y-1" };
const _hoisted_5$3 = {
  key: 0,
  class: "mb-2"
};
const _hoisted_6$3 = { class: "flex items-center gap-1.5 px-2 py-1 mb-1" };
const _hoisted_7$2 = { class: "text-xs" };
const _hoisted_8$2 = { class: "text-[10px] font-semibold text-text-tertiary uppercase tracking-wider" };
const _hoisted_9$1 = { class: "flex flex-wrap gap-1.5 px-1" };
const _hoisted_10$1 = ["onClick", "title"];
const _hoisted_11$1 = { class: "text-[11px] font-medium text-white/80" };
const _hoisted_12$1 = { class: "text-[10px] text-text-tertiary font-mono" };
const _hoisted_13$1 = {
  key: 0,
  class: "text-center py-4 text-text-tertiary text-xs"
};
const _sfc_main$5 = {
  __name: "ColorLegend",
  emits: ["filter-type"],
  setup(__props) {
    const graphStore = useGraphStore();
    const isExpanded = ref(false);
    const activeTypes = computed(() => {
      return getActiveNodeTypes(graphStore.nodes);
    });
    const groupedTypes = computed(() => {
      const groups = getTypeGroups();
      const result = [];
      Object.entries(groups).sort((a, b) => a[1].order - b[1].order).forEach(([name, config]) => {
        const types = activeTypes.value.filter((t2) => t2.group === name);
        if (types.length > 0) {
          result.push({
            name,
            label: config.label,
            icon: config.icon,
            types
          });
        }
      });
      return result;
    });
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", _hoisted_1$5, [
        createBaseVNode("button", {
          onClick: _cache[0] || (_cache[0] = ($event) => isExpanded.value = !isExpanded.value),
          class: "flex items-center justify-between w-full px-3 py-2 rounded-lg bg-white/5 hover:bg-white/8 border border-white/10 transition-all group"
        }, [
          createBaseVNode("div", _hoisted_2$5, [
            _cache[1] || (_cache[1] = createBaseVNode("span", { class: "text-sm" }, "🎨", -1)),
            _cache[2] || (_cache[2] = createBaseVNode("span", { class: "text-xs font-semibold text-white uppercase tracking-wider" }, "Node Types", -1)),
            createBaseVNode("span", _hoisted_3$5, toDisplayString(activeTypes.value.length), 1)
          ]),
          createBaseVNode("span", {
            class: normalizeClass(["text-text-tertiary text-xs transition-transform duration-300", { "rotate-180": isExpanded.value }])
          }, "▼", 2)
        ]),
        createVNode(Transition$1, { name: "legend-expand" }, {
          default: withCtx(() => [
            withDirectives(createBaseVNode("div", _hoisted_4$5, [
              (openBlock(true), createElementBlock(Fragment, null, renderList(groupedTypes.value, (group) => {
                return openBlock(), createElementBlock(Fragment, {
                  key: group.name
                }, [
                  group.types.length > 0 ? (openBlock(), createElementBlock("div", _hoisted_5$3, [
                    createBaseVNode("div", _hoisted_6$3, [
                      createBaseVNode("span", _hoisted_7$2, toDisplayString(group.icon), 1),
                      createBaseVNode("span", _hoisted_8$2, toDisplayString(group.label), 1)
                    ]),
                    createBaseVNode("div", _hoisted_9$1, [
                      (openBlock(true), createElementBlock(Fragment, null, renderList(group.types, (t2) => {
                        return openBlock(), createElementBlock("button", {
                          key: t2.type,
                          onClick: ($event) => _ctx.$emit("filter-type", t2.type),
                          class: "flex items-center gap-1.5 px-2 py-1 rounded-md border transition-all hover:scale-105",
                          style: normalizeStyle({
                            borderColor: t2.color + "40",
                            background: t2.color + "10"
                          }),
                          title: `${t2.label} (${t2.count} 個節點)`
                        }, [
                          createBaseVNode("span", {
                            class: "w-2.5 h-2.5 rounded-full flex-shrink-0",
                            style: normalizeStyle({
                              backgroundColor: t2.color,
                              boxShadow: `0 0 6px ${t2.glow}`
                            })
                          }, null, 4),
                          createBaseVNode("span", _hoisted_11$1, toDisplayString(t2.label), 1),
                          createBaseVNode("span", _hoisted_12$1, toDisplayString(t2.count), 1)
                        ], 12, _hoisted_10$1);
                      }), 128))
                    ])
                  ])) : createCommentVNode("", true)
                ], 64);
              }), 128)),
              activeTypes.value.length === 0 ? (openBlock(), createElementBlock("div", _hoisted_13$1, " 尚無節點數據 ")) : createCommentVNode("", true)
            ], 512), [
              [vShow, isExpanded.value]
            ])
          ]),
          _: 1
        })
      ]);
    };
  }
};
const ColorLegend = /* @__PURE__ */ _export_sfc(_sfc_main$5, [["__scopeId", "data-v-b8e30ca8"]]);
const _hoisted_1$4 = { class: "zoom-controls" };
const _hoisted_2$4 = ["title"];
const _hoisted_3$4 = ["title"];
const _hoisted_4$4 = { class: "text-[11px] font-bold" };
const _sfc_main$4 = {
  __name: "ZoomControls",
  props: {
    zoomPercent: { type: Number, default: 100 },
    is3D: { type: Boolean, default: false }
  },
  emits: ["zoom-in", "zoom-out", "zoom-fit", "zoom-reset", "toggle-layout"],
  setup(__props) {
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", _hoisted_1$4, [
        createBaseVNode("button", {
          onClick: _cache[0] || (_cache[0] = ($event) => _ctx.$emit("zoom-in")),
          class: "zoom-btn",
          title: "放大"
        }, [..._cache[5] || (_cache[5] = [
          createBaseVNode("svg", {
            width: "16",
            height: "16",
            viewBox: "0 0 16 16",
            fill: "none"
          }, [
            createBaseVNode("path", {
              d: "M8 3v10M3 8h10",
              stroke: "currentColor",
              "stroke-width": "1.5",
              "stroke-linecap": "round"
            })
          ], -1)
        ])]),
        createBaseVNode("div", {
          class: "zoom-level",
          title: `${__props.zoomPercent}%`
        }, toDisplayString(__props.zoomPercent) + "% ", 9, _hoisted_2$4),
        createBaseVNode("button", {
          onClick: _cache[1] || (_cache[1] = ($event) => _ctx.$emit("zoom-out")),
          class: "zoom-btn",
          title: "縮小"
        }, [..._cache[6] || (_cache[6] = [
          createBaseVNode("svg", {
            width: "16",
            height: "16",
            viewBox: "0 0 16 16",
            fill: "none"
          }, [
            createBaseVNode("path", {
              d: "M3 8h10",
              stroke: "currentColor",
              "stroke-width": "1.5",
              "stroke-linecap": "round"
            })
          ], -1)
        ])]),
        _cache[9] || (_cache[9] = createBaseVNode("div", { class: "zoom-sep" }, null, -1)),
        createBaseVNode("button", {
          onClick: _cache[2] || (_cache[2] = ($event) => _ctx.$emit("zoom-fit")),
          class: "zoom-btn",
          title: "畫面適配"
        }, [..._cache[7] || (_cache[7] = [
          createBaseVNode("svg", {
            width: "16",
            height: "16",
            viewBox: "0 0 16 16",
            fill: "none"
          }, [
            createBaseVNode("path", {
              d: "M2 6V3a1 1 0 011-1h3M10 2h3a1 1 0 011 1v3M14 10v3a1 1 0 01-1 1h-3M6 14H3a1 1 0 01-1-1v-3",
              stroke: "currentColor",
              "stroke-width": "1.5",
              "stroke-linecap": "round",
              "stroke-linejoin": "round"
            })
          ], -1)
        ])]),
        createBaseVNode("button", {
          onClick: _cache[3] || (_cache[3] = ($event) => _ctx.$emit("zoom-reset")),
          class: "zoom-btn",
          title: "重置視圖"
        }, [..._cache[8] || (_cache[8] = [
          createBaseVNode("svg", {
            width: "16",
            height: "16",
            viewBox: "0 0 16 16",
            fill: "none"
          }, [
            createBaseVNode("path", {
              d: "M2 8a6 6 0 0110.47-4M14 2v4h-4",
              stroke: "currentColor",
              "stroke-width": "1.5",
              "stroke-linecap": "round",
              "stroke-linejoin": "round"
            }),
            createBaseVNode("path", {
              d: "M14 8a6 6 0 01-10.47 4M2 14v-4h4",
              stroke: "currentColor",
              "stroke-width": "1.5",
              "stroke-linecap": "round",
              "stroke-linejoin": "round"
            })
          ], -1)
        ])]),
        _cache[10] || (_cache[10] = createBaseVNode("div", { class: "zoom-sep" }, null, -1)),
        createBaseVNode("button", {
          onClick: _cache[4] || (_cache[4] = ($event) => _ctx.$emit("toggle-layout")),
          class: normalizeClass(["zoom-btn", { "active": __props.is3D }]),
          title: __props.is3D ? "切回 2D" : "切到 3D"
        }, [
          createBaseVNode("span", _hoisted_4$4, toDisplayString(__props.is3D ? "3D" : "2D"), 1)
        ], 10, _hoisted_3$4)
      ]);
    };
  }
};
const ZoomControls = /* @__PURE__ */ _export_sfc(_sfc_main$4, [["__scopeId", "data-v-046d06ce"]]);
const _hoisted_1$3 = { class: "bottom-toolbar" };
const _hoisted_2$3 = {
  key: 0,
  class: "tb-badge"
};
const _hoisted_3$3 = {
  key: 0,
  class: "layer-menu"
};
const _hoisted_4$3 = ["onClick"];
const _sfc_main$3 = {
  __name: "BottomToolbar",
  props: {
    isFocusMode: { type: Boolean, default: false },
    isLinkingMode: { type: Boolean, default: false },
    activeFilter: { type: String, default: "all" }
  },
  emits: ["toggle-focus", "set-filter", "add-node", "toggle-linking"],
  setup(__props) {
    const showLayerMenu = ref(false);
    const layerMenuRef = ref(null);
    const layers = [
      { value: "all", icon: "🌐", label: "全部節點" },
      { value: "focus", icon: "🎯", label: "焦點聚鄰" },
      { value: "part", icon: "📌", label: "部分顯示" }
    ];
    const handleShare = () => {
      var _a;
      (_a = navigator.clipboard) == null ? void 0 : _a.writeText(window.location.href).then(() => {
        ElMessage.success("✅ 已複製圖譜連結");
      }).catch(() => {
        ElMessage.info("📋 分享功能開發中");
      });
    };
    const handleClickOutside = (e) => {
      if (layerMenuRef.value && !layerMenuRef.value.contains(e.target)) {
        showLayerMenu.value = false;
      }
    };
    onMounted(() => document.addEventListener("click", handleClickOutside));
    onUnmounted(() => document.removeEventListener("click", handleClickOutside));
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", _hoisted_1$3, [
        createBaseVNode("button", {
          class: normalizeClass(["tb-btn", { "tb-btn-active": __props.isFocusMode }]),
          onClick: _cache[0] || (_cache[0] = ($event) => _ctx.$emit("toggle-focus")),
          title: "聚焦模式"
        }, [
          _cache[4] || (_cache[4] = createBaseVNode("span", { class: "tb-icon" }, "🎯", -1)),
          _cache[5] || (_cache[5] = createBaseVNode("span", { class: "tb-label" }, "Focus", -1)),
          __props.isFocusMode ? (openBlock(), createElementBlock("span", _hoisted_2$3)) : createCommentVNode("", true)
        ], 2),
        createBaseVNode("div", {
          class: "relative",
          ref_key: "layerMenuRef",
          ref: layerMenuRef
        }, [
          createBaseVNode("button", {
            class: "tb-btn",
            onClick: _cache[1] || (_cache[1] = ($event) => showLayerMenu.value = !showLayerMenu.value),
            title: "圖層切換"
          }, [..._cache[6] || (_cache[6] = [
            createBaseVNode("span", { class: "tb-icon" }, "◑", -1),
            createBaseVNode("span", { class: "tb-label" }, "圖層", -1)
          ])]),
          createVNode(Transition$1, { name: "pop" }, {
            default: withCtx(() => [
              showLayerMenu.value ? (openBlock(), createElementBlock("div", _hoisted_3$3, [
                (openBlock(), createElementBlock(Fragment, null, renderList(layers, (layer) => {
                  return createBaseVNode("button", {
                    key: layer.value,
                    class: normalizeClass(["layer-item", { "active": __props.activeFilter === layer.value }]),
                    onClick: ($event) => {
                      _ctx.$emit("set-filter", layer.value);
                      showLayerMenu.value = false;
                    }
                  }, [
                    createBaseVNode("span", null, toDisplayString(layer.icon), 1),
                    createBaseVNode("span", null, toDisplayString(layer.label), 1)
                  ], 10, _hoisted_4$3);
                }), 64))
              ])) : createCommentVNode("", true)
            ]),
            _: 1
          })
        ], 512),
        _cache[10] || (_cache[10] = createBaseVNode("div", { class: "tb-sep" }, null, -1)),
        createBaseVNode("button", {
          class: "tb-btn tb-btn-primary",
          onClick: _cache[2] || (_cache[2] = ($event) => _ctx.$emit("add-node")),
          title: "快速新增節點"
        }, [..._cache[7] || (_cache[7] = [
          createBaseVNode("span", { class: "tb-icon" }, "＋", -1),
          createBaseVNode("span", { class: "tb-label" }, "New Node", -1)
        ])]),
        createBaseVNode("button", {
          class: normalizeClass(["tb-btn", { "tb-btn-active": __props.isLinkingMode }]),
          onClick: _cache[3] || (_cache[3] = ($event) => _ctx.$emit("toggle-linking")),
          title: "手動連線"
        }, [..._cache[8] || (_cache[8] = [
          createBaseVNode("span", { class: "tb-icon" }, "🔗", -1),
          createBaseVNode("span", { class: "tb-label" }, "連線", -1)
        ])], 2),
        _cache[11] || (_cache[11] = createBaseVNode("div", { class: "tb-sep" }, null, -1)),
        createBaseVNode("button", {
          class: "tb-btn",
          onClick: handleShare,
          title: "分享圖譜"
        }, [..._cache[9] || (_cache[9] = [
          createBaseVNode("span", { class: "tb-icon" }, "↗", -1),
          createBaseVNode("span", { class: "tb-label" }, "分享", -1)
        ])])
      ]);
    };
  }
};
const BottomToolbar = /* @__PURE__ */ _export_sfc(_sfc_main$3, [["__scopeId", "data-v-17253302"]]);
const _hoisted_1$2 = { class: "stats-bar" };
const _hoisted_2$2 = { class: "stat-item" };
const _hoisted_3$2 = { class: "stat-value text-neon-blue" };
const _hoisted_4$2 = { class: "stat-item" };
const _hoisted_5$2 = { class: "stat-value text-neon-purple" };
const _hoisted_6$2 = { class: "stat-item" };
const _hoisted_7$1 = {
  key: 0,
  class: "stat-selected"
};
const _hoisted_8$1 = { class: "stat-selected-text" };
const _sfc_main$2 = {
  __name: "StatsBar",
  setup(__props) {
    const graphStore = useGraphStore();
    const nodeCount = computed(() => graphStore.nodeCount);
    const linkCount = computed(() => graphStore.linkCount);
    const coverage = computed(() => {
      const n = nodeCount.value;
      if (n < 2) return 0;
      const maxLinks = n * (n - 1) / 2;
      return Math.min(100, Math.round(linkCount.value / maxLinks * 100));
    });
    const coverageColor = computed(() => {
      if (coverage.value >= 70) return "text-green-400";
      if (coverage.value >= 30) return "text-yellow-400";
      return "text-neon-cyan";
    });
    const selectedName = computed(() => {
      const sel = graphStore.selectedNode;
      if (!sel) return "";
      return sel.name || sel.id;
    });
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", _hoisted_1$2, [
        createBaseVNode("div", _hoisted_2$2, [
          createBaseVNode("span", _hoisted_3$2, toDisplayString(nodeCount.value), 1),
          _cache[0] || (_cache[0] = createBaseVNode("span", { class: "stat-label" }, "Nodes", -1))
        ]),
        _cache[4] || (_cache[4] = createBaseVNode("div", { class: "stat-dot" }, null, -1)),
        createBaseVNode("div", _hoisted_4$2, [
          createBaseVNode("span", _hoisted_5$2, toDisplayString(linkCount.value), 1),
          _cache[1] || (_cache[1] = createBaseVNode("span", { class: "stat-label" }, "Links", -1))
        ]),
        _cache[5] || (_cache[5] = createBaseVNode("div", { class: "stat-dot" }, null, -1)),
        createBaseVNode("div", _hoisted_6$2, [
          createBaseVNode("span", {
            class: normalizeClass(["stat-value", coverageColor.value])
          }, toDisplayString(coverage.value) + "%", 3),
          _cache[2] || (_cache[2] = createBaseVNode("span", { class: "stat-label" }, "Coverage", -1))
        ]),
        selectedName.value ? (openBlock(), createElementBlock("div", _hoisted_7$1, [
          _cache[3] || (_cache[3] = createBaseVNode("div", { class: "stat-dot-active" }, null, -1)),
          createBaseVNode("span", _hoisted_8$1, toDisplayString(selectedName.value), 1)
        ])) : createCommentVNode("", true)
      ]);
    };
  }
};
const StatsBar = /* @__PURE__ */ _export_sfc(_sfc_main$2, [["__scopeId", "data-v-cde20846"]]);
const _hoisted_1$1 = { class: "density-slider" };
const _hoisted_2$1 = { class: "ds-track-wrap" };
const _hoisted_3$1 = ["value"];
const _hoisted_4$1 = { class: "ds-value" };
const _hoisted_5$1 = { class: "ds-presets" };
const _hoisted_6$1 = ["title", "onClick"];
const _sfc_main$1 = {
  __name: "DensitySlider",
  props: {
    modelValue: { type: Number, default: 0 }
  },
  emits: ["update:modelValue"],
  setup(__props) {
    const presets = [
      { value: 0, icon: "🌐", label: "全部" },
      { value: 30, icon: "◐", label: "中等密度" },
      { value: 60, icon: "◑", label: "高密度" },
      { value: 85, icon: "●", label: "核心節點" }
    ];
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", _hoisted_1$1, [
        _cache[1] || (_cache[1] = createBaseVNode("div", { class: "ds-header" }, [
          createBaseVNode("span", { class: "ds-icon" }, "◉"),
          createBaseVNode("span", { class: "ds-title" }, "Density")
        ], -1)),
        createBaseVNode("div", _hoisted_2$1, [
          createBaseVNode("input", {
            type: "range",
            value: __props.modelValue,
            min: "0",
            max: "100",
            step: "1",
            class: "ds-range",
            onInput: _cache[0] || (_cache[0] = ($event) => _ctx.$emit("update:modelValue", Number($event.target.value)))
          }, null, 40, _hoisted_3$1),
          createBaseVNode("div", {
            class: "ds-fill",
            style: normalizeStyle({ height: __props.modelValue + "%" })
          }, null, 4)
        ]),
        createBaseVNode("span", _hoisted_4$1, toDisplayString(__props.modelValue) + "%", 1),
        createBaseVNode("div", _hoisted_5$1, [
          (openBlock(), createElementBlock(Fragment, null, renderList(presets, (p) => {
            return createBaseVNode("button", {
              key: p.value,
              class: normalizeClass(["ds-preset-btn", { active: __props.modelValue === p.value }]),
              title: p.label,
              onClick: ($event) => _ctx.$emit("update:modelValue", p.value)
            }, toDisplayString(p.icon), 11, _hoisted_6$1);
          }), 64))
        ])
      ]);
    };
  }
};
const DensitySlider = /* @__PURE__ */ _export_sfc(_sfc_main$1, [["__scopeId", "data-v-4dd3579b"]]);
const _hoisted_1 = { class: "flex h-screen w-screen overflow-hidden bg-[#0a0e27]" };
const _hoisted_2 = { class: "flex-1 overflow-y-auto border-b border-[#2d3154]" };
const _hoisted_3 = { class: "px-3 py-2 border-t border-[#2d3154]" };
const _hoisted_4 = { class: "flex-1 relative bg-black" };
const _hoisted_5 = {
  key: 0,
  class: "absolute inset-0 flex flex-col items-center justify-center gap-5 z-10"
};
const _hoisted_6 = { class: "absolute right-4 top-1/2 -translate-y-1/2 z-30 flex flex-col gap-3" };
const _hoisted_7 = { class: "absolute bottom-14 left-1/2 -translate-x-1/2 z-30" };
const _hoisted_8 = { class: "absolute bottom-3 left-1/2 -translate-x-1/2 z-30" };
const _hoisted_9 = {
  key: 0,
  class: "fixed top-16 left-1/2 -translate-x-1/2 w-[950px] max-h-[85vh] z-50 backdrop-blur-xl border rounded-xl shadow-2xl overflow-hidden transition-all duration-300 bg-[#0f0f0f]/95 border-white/10"
};
const _hoisted_10 = { class: "flex items-stretch h-full" };
const _hoisted_11 = { class: "w-64 flex-shrink-0" };
const _hoisted_12 = { class: "relative group h-full bg-white/5 border-r border-white/10" };
const _hoisted_13 = {
  key: 0,
  class: "w-full h-full flex flex-col items-center justify-center gap-2"
};
const _hoisted_14 = ["src"];
const _hoisted_15 = { class: "flex-1 flex flex-col p-5 gap-3" };
const _hoisted_16 = { class: "flex flex-col gap-1.5" };
const _hoisted_17 = { class: "flex flex-col gap-1.5" };
const _hoisted_18 = { class: "flex gap-2" };
const _hoisted_19 = {
  key: 0,
  class: "flex flex-col gap-2 mt-2"
};
const _hoisted_20 = { class: "max-h-32 overflow-y-auto space-y-2 pr-2" };
const _hoisted_21 = ["onMouseenter"];
const _hoisted_22 = ["checked", "onChange"];
const _hoisted_23 = { class: "flex-1 text-sm" };
const _hoisted_24 = { class: "flex items-center gap-2 mb-1" };
const _hoisted_25 = { class: "font-semibold text-white" };
const _hoisted_26 = { class: "px-2 py-0.5 bg-purple-500/20 text-purple-300 text-xs font-medium rounded" };
const _hoisted_27 = { class: "text-xs text-gray-400 leading-relaxed" };
const _hoisted_28 = { class: "w-80 flex-shrink-0 p-5 border-l border-white/10" };
const _hoisted_29 = { class: "flex flex-col gap-2 h-full" };
const _sfc_main = {
  __name: "GraphPage",
  setup(__props) {
    const graphStore = useGraphStore();
    const layoutStore = useLayoutStore();
    const searchQuery = ref("");
    const isLoading = ref(false);
    const showRightPanel = ref(true);
    const leftPanelWidth = ref(340);
    const localNodeData = ref({
      id: "",
      name: "",
      link: "",
      description: "",
      image: null
    });
    const suggestedLinks = ref([]);
    const selectedSuggestedLinks = ref(/* @__PURE__ */ new Set());
    const hoveredLinkTarget = ref(null);
    const selectedGraphId = ref(1);
    const activeFilter = ref("all");
    const nodeViewMode = ref("medium");
    const isLinkingMode = ref(false);
    const linkingSource = ref(null);
    const isSelectOpen = ref(false);
    const graphComponentRef = ref(null);
    const zoomPercent = ref(100);
    let zoomPollTimer = null;
    const densityThreshold = ref(0);
    const clusterEnabled = ref(true);
    const currentComponent = computed(() => {
      return graphStore.viewMode === "3d" ? Graph3D : Graph2D;
    });
    const filteredNodes = computed(() => {
      let nodes = graphStore.filteredNodes;
      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase();
        nodes = nodes.filter(
          (node) => node.name.toLowerCase().includes(query) || node.type.toLowerCase().includes(query) || node.description && node.description.toLowerCase().includes(query)
        );
      }
      return nodes;
    });
    const clearSearch = () => {
      searchQuery.value = "";
    };
    const handleSearch = () => {
      console.log("🔍 搜尋:", searchQuery.value);
      if (filteredNodes.value.length > 0 && searchQuery.value) {
        graphStore.selectNode(filteredNodes.value[0].id);
      }
    };
    const handleFilterByType = (type) => {
      searchQuery.value = `type:${type}`;
      const matched = graphStore.nodes.filter((n) => (n.type || "").toLowerCase() === type);
      if (matched.length > 0) {
        graphStore.selectNode(matched[0].id);
        ElMessage({ message: `已篩選 ${matched.length} 個「${type}」節點`, type: "info", duration: 1500 });
      }
    };
    const handleNodeClick = (node) => {
      if (isLinkingMode.value) {
        handleLinkingClick(node);
        return;
      }
      graphStore.selectNode(node.id);
      showRightPanel.value = true;
      localNodeData.value = {
        id: node.id,
        name: node.name,
        link: node.link || "",
        description: node.description || "",
        image: node.image || null
      };
      if (node.links && Array.isArray(node.links)) {
        suggestedLinks.value = node.links.map((link) => ({
          ...link,
          id: `${node.id}_to_${link.target_id}`
          // 為每個連線生成唯一 ID
        }));
        selectedSuggestedLinks.value = new Set(suggestedLinks.value.map((link) => link.id));
      } else {
        suggestedLinks.value = [];
        selectedSuggestedLinks.value = /* @__PURE__ */ new Set();
      }
      if (graphComponentRef.value && typeof graphComponentRef.value.focusNode === "function") {
        console.log("🎯 [GraphPage] 觸發節點聚焦:", node.name);
        graphComponentRef.value.focusNode(node);
      } else {
        console.warn("⚠️ [GraphPage] 圖表組件未提供 focusNode 方法");
      }
    };
    const saveChanges = () => {
      if (!graphStore.selectedNode) {
        ElMessage.warning("⚠️ 未選擇節點");
        return;
      }
      const nodeId = localNodeData.value.id;
      const updates = {
        name: localNodeData.value.name,
        link: localNodeData.value.link,
        description: localNodeData.value.description,
        image: localNodeData.value.image
      };
      console.log("💾 [GraphPage] 保存節點變更:", nodeId, updates);
      console.log("🔄 [GraphPage] 當前視圖模式:", graphStore.viewMode);
      graphStore.updateNode(nodeId, updates);
      const selectedLinks = Array.from(selectedSuggestedLinks.value);
      if (selectedLinks.length > 0) {
        selectedLinks.forEach((linkId) => {
          const link = suggestedLinks.value.find((l) => l.id === linkId);
          if (link) {
            graphStore.addLink({
              source: nodeId,
              target: link.target_id,
              relation: link.relation,
              reason: link.reason,
              value: 1
            });
            console.log("🔗 [GraphPage] 添加建議連線:", link.target_id, link.relation);
          }
        });
        ElMessage.success(`💾 已保存節點及 ${selectedLinks.length} 個建議連線`);
      } else {
        ElMessage.success(`💾 已保存節點 "${localNodeData.value.name}" 的變更`);
      }
      console.log("✅ [GraphPage] 節點已更新，3D 圖譜應自動同步");
      setTimeout(() => {
        const updatedNode = graphStore.nodes.find((n) => n.id === nodeId);
        if (updatedNode) {
          console.log("✅ [GraphPage] 驗證: Store 中的節點已更新:", updatedNode);
        }
      }, 500);
    };
    const openLink = () => {
      const url = localNodeData.value.link;
      if (!url) {
        ElMessage.warning("⚠️ 連結為空");
        return;
      }
      const validUrl = url.startsWith("http://") || url.startsWith("https://") ? url : `https://${url}`;
      window.open(validUrl, "_blank");
      console.log("🔗 開啟連結:", validUrl);
    };
    const handleImageChange = () => {
      ElMessage.info("📷 圖片上傳功能開發中...");
    };
    const closeInspector = () => {
      showRightPanel.value = false;
      graphStore.clearSelection();
      suggestedLinks.value = [];
      selectedSuggestedLinks.value = /* @__PURE__ */ new Set();
      hoveredLinkTarget.value = null;
    };
    const toggleSuggestedLink = (linkId) => {
      if (selectedSuggestedLinks.value.has(linkId)) {
        selectedSuggestedLinks.value.delete(linkId);
      } else {
        selectedSuggestedLinks.value.add(linkId);
      }
      selectedSuggestedLinks.value = new Set(selectedSuggestedLinks.value);
    };
    const handleLinkHover = (targetId) => {
      hoveredLinkTarget.value = targetId;
      if (graphComponentRef.value && typeof graphComponentRef.value.highlightNode === "function") {
        graphComponentRef.value.highlightNode(targetId);
      }
    };
    const handleLinkLeave = () => {
      hoveredLinkTarget.value = null;
      if (graphComponentRef.value && typeof graphComponentRef.value.unhighlightNode === "function") {
        graphComponentRef.value.unhighlightNode();
      }
    };
    const getTargetNodeName = (targetId) => {
      const node = graphStore.getNodeById(targetId);
      return node ? node.name : targetId;
    };
    const deleteNode = () => {
      if (!graphStore.selectedNode) {
        ElMessage.warning("⚠️ 未選擇節點");
        return;
      }
      const nodeId = graphStore.selectedNode.id;
      const nodeName = graphStore.selectedNode.name;
      if (confirm(`確定要刪除節點「${nodeName}」嗎？

此操作將同時刪除所有相關連接，且無法復原。`)) {
        console.log("🗑️ [GraphPage] 刪除節點:", nodeId, nodeName);
        graphStore.deleteNode(nodeId);
        showRightPanel.value = false;
        ElMessage.success({
          message: `🗑️ 已刪除節點「${nodeName}」`,
          duration: 2e3,
          showClose: true
        });
      }
    };
    const handleGraphChange = (event) => {
      let graphId = event.target.value;
      if (!isNaN(graphId) && graphId.trim() !== "") {
        graphId = parseInt(graphId);
      }
      console.log("📊 [GraphPage] 切換圖譜:", graphId);
      selectedGraphId.value = graphId;
      graphStore.fetchGraphData(graphId);
      ElMessage.success(`🔄 已切換到圖譜: ${graphId}`);
      isSelectOpen.value = false;
    };
    const handleEditGraph = () => {
      ElMessage.info("✏️ 編輯圖譜功能開發中...");
    };
    const handleCreateGraph = () => {
      ElMessage.info("➕ 新增圖譜功能開發中...");
    };
    const handleDeleteGraph = () => {
      ElMessage.warning("🗑️ 刪除圖譜功能開發中...");
    };
    const setFilter = (filter) => {
      activeFilter.value = filter;
      graphStore.setFilterMode(filter);
      ElMessage.info(`🔎 已切換到: ${filter === "all" ? "顯示全部" : filter === "focus" ? "焦點模式" : "部分顯示"}`);
    };
    const handleZoomIn = () => {
      var _a, _b;
      (_b = (_a = graphComponentRef.value) == null ? void 0 : _a.zoomIn) == null ? void 0 : _b.call(_a);
      updateZoomPercent();
    };
    const handleZoomOut = () => {
      var _a, _b;
      (_b = (_a = graphComponentRef.value) == null ? void 0 : _a.zoomOut) == null ? void 0 : _b.call(_a);
      updateZoomPercent();
    };
    const handleZoomFit = () => {
      var _a, _b;
      (_b = (_a = graphComponentRef.value) == null ? void 0 : _a.zoomToFit) == null ? void 0 : _b.call(_a);
      setTimeout(updateZoomPercent, 900);
    };
    const handleZoomReset = () => {
      var _a, _b;
      (_b = (_a = graphComponentRef.value) == null ? void 0 : _a.resetView) == null ? void 0 : _b.call(_a);
      setTimeout(updateZoomPercent, 1100);
    };
    const updateZoomPercent = () => {
      var _a, _b;
      const z = (_b = (_a = graphComponentRef.value) == null ? void 0 : _a.getZoom) == null ? void 0 : _b.call(_a);
      if (z) zoomPercent.value = Math.round(z * 100);
    };
    const isFocusMode = computed(() => activeFilter.value === "focus");
    const toggleFocusMode = () => {
      const next = isFocusMode.value ? "all" : "focus";
      setFilter(next);
    };
    const handleQuickAddNode = () => {
      const name = `新節點 ${graphStore.nodeCount + 1}`;
      graphStore.addNode({
        name,
        type: "note",
        description: ""
      });
      ElMessage.success(`✅ 已新增：${name}`);
    };
    const toggleViewMode = () => {
      const currentMode = graphStore.viewMode;
      const newMode = currentMode === "2d" ? "3d" : "2d";
      console.log(`🔄 [GraphPage] 視圖模式切換: ${currentMode} → ${newMode}`);
      console.log(`📊 [GraphPage] 切換前 Store 狀態:`, {
        viewMode: graphStore.viewMode,
        nodeCount: graphStore.nodeCount,
        linkCount: graphStore.linkCount
      });
      graphStore.setViewMode(newMode);
      ElMessage.success({
        message: `✅ 已切換到 ${newMode.toUpperCase()} 視圖`,
        duration: 1500,
        showClose: false
      });
      setTimeout(() => {
        console.log("📊 [GraphPage] 切換後 Store 狀態:", {
          viewMode: graphStore.viewMode,
          component: graphStore.viewMode === "3d" ? "Graph3D" : "Graph2D"
        });
        console.log("✅ [GraphPage] 視圖模式切換完成");
      }, 100);
    };
    const toggleLinkingMode = () => {
      isLinkingMode.value = !isLinkingMode.value;
      if (isLinkingMode.value) {
        linkingSource.value = null;
        ElMessage.success("🔗 連線模式已開啟，請點擊兩個節點建立連結");
      } else {
        linkingSource.value = null;
        ElMessage.info("🔗 連線模式已關閉");
      }
    };
    const handleLinkingClick = (node) => {
      if (!linkingSource.value) {
        linkingSource.value = node;
        ElMessage.info(`📍 起點: ${node.name}，請選擇目標節點`);
      } else {
        if (linkingSource.value.id === node.id) {
          ElMessage.warning("⚠️ 無法連結到自己");
          return;
        }
        const existingLink = graphStore.links.find(
          (link) => link.source === linkingSource.value.id && link.target === node.id || link.source === node.id && link.target === linkingSource.value.id
        );
        if (existingLink) {
          ElMessage.warning("⚠️ 連結已存在");
          linkingSource.value = null;
          return;
        }
        graphStore.addLink({
          source: linkingSource.value.id,
          target: node.id,
          value: 3,
          label: "手動連結"
        });
        ElMessage.success(`✅ 已連結: ${linkingSource.value.name} → ${node.name}`);
        console.log("🔗 新連結:", linkingSource.value.id, "->", node.id);
        linkingSource.value = null;
      }
    };
    const startDragLeft = () => {
      isDraggingLeft.value = true;
      document.addEventListener("mousemove", onDragLeft);
      document.addEventListener("mouseup", stopDragLeft);
    };
    const onDragLeft = (e) => {
      if (!isDraggingLeft.value) return;
      const newWidth = e.clientX - (layoutStore.isSidebarCollapsed ? 0 : 280);
      leftPanelWidth.value = Math.max(320, Math.min(700, newWidth));
    };
    const stopDragLeft = () => {
      isDraggingLeft.value = false;
      document.removeEventListener("mousemove", onDragLeft);
      document.removeEventListener("mouseup", stopDragLeft);
    };
    watch(
      () => graphStore.selectedNode,
      (newNode) => {
        if (newNode) {
          localNodeData.value = {
            id: newNode.id,
            name: newNode.name || "",
            link: newNode.link || "",
            description: newNode.description || "",
            image: newNode.image || null
          };
          console.log("🔄 [GraphPage] 選中節點已同步到編輯面板:", newNode.name);
        }
      },
      { immediate: false }
    );
    onMounted(async () => {
      console.log("🔄 [GraphPage] 加載圖譜數據");
      isLoading.value = true;
      try {
        await graphStore.fetchGraphData(graphStore.currentGraphId);
        console.log("✅ [GraphPage] 圖譜數據已加載:", graphStore.nodeCount, "個節點,", graphStore.linkCount, "個連接");
        zoomPollTimer = setInterval(updateZoomPercent, 2e3);
      } catch (error) {
        console.error("❌ 圖譜數據加載失敗:", error);
        ElMessage.error("圖譜數據加載失敗");
      } finally {
        isLoading.value = false;
      }
    });
    onUnmounted(() => {
      if (zoomPollTimer) clearInterval(zoomPollTimer);
    });
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", _hoisted_1, [
        createBaseVNode("aside", {
          class: "h-full flex-shrink-0 border-r bg-[#0a0e27] flex flex-col shadow-sm z-20 border-[#2d3154] relative",
          style: normalizeStyle({ width: leftPanelWidth.value + "px" })
        }, [
          createBaseVNode("div", _hoisted_2, [
            createVNode(NexusPanel, {
              searchQuery: searchQuery.value,
              "onUpdate:searchQuery": _cache[0] || (_cache[0] = ($event) => searchQuery.value = $event),
              selectedGraphId: selectedGraphId.value,
              "onUpdate:selectedGraphId": _cache[1] || (_cache[1] = ($event) => selectedGraphId.value = $event),
              activeFilter: activeFilter.value,
              "onUpdate:activeFilter": _cache[2] || (_cache[2] = ($event) => activeFilter.value = $event),
              nodeViewMode: nodeViewMode.value,
              "onUpdate:nodeViewMode": _cache[3] || (_cache[3] = ($event) => nodeViewMode.value = $event),
              isLinkingMode: isLinkingMode.value,
              "onUpdate:isLinkingMode": _cache[4] || (_cache[4] = ($event) => isLinkingMode.value = $event),
              "linking-source": linkingSource.value,
              onGraphChange: handleGraphChange,
              onEditGraph: handleEditGraph,
              onCreateGraph: handleCreateGraph,
              onDeleteGraph: handleDeleteGraph,
              onSearch: handleSearch,
              onClearSearch: clearSearch,
              onToggleViewMode: toggleViewMode,
              onToggleLinkingMode: toggleLinkingMode,
              onNodeClick: handleNodeClick
            }, null, 8, ["searchQuery", "selectedGraphId", "activeFilter", "nodeViewMode", "isLinkingMode", "linking-source"])
          ]),
          createBaseVNode("div", _hoisted_3, [
            createVNode(ColorLegend, { onFilterType: handleFilterByType })
          ]),
          createBaseVNode("div", {
            class: "absolute top-0 right-0 h-full w-1 cursor-col-resize hover:bg-blue-500/50 transition-colors z-30",
            onMousedown: startDragLeft,
            title: "拖動調整寬度"
          }, [..._cache[10] || (_cache[10] = [
            createBaseVNode("div", { class: "h-full w-px mx-auto bg-white/20" }, null, -1)
          ])], 32)
        ], 4),
        createBaseVNode("main", _hoisted_4, [
          isLoading.value ? (openBlock(), createElementBlock("div", _hoisted_5, [..._cache[11] || (_cache[11] = [
            createBaseVNode("div", { class: "w-15 h-15 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" }, null, -1),
            createBaseVNode("p", { class: "text-sm text-gray-400 m-0" }, "載入知識圖譜中...", -1)
          ])])) : (openBlock(), createBlock(KeepAlive, { key: 1 }, [
            (openBlock(), createBlock(resolveDynamicComponent(currentComponent.value), {
              key: unref(graphStore).viewMode,
              ref_key: "graphComponentRef",
              ref: graphComponentRef,
              "density-threshold": densityThreshold.value,
              "focus-fade": isFocusMode.value || !!unref(graphStore).selectedNode,
              "cluster-enabled": clusterEnabled.value
            }, null, 8, ["density-threshold", "focus-fade", "cluster-enabled"]))
          ], 1024)),
          createBaseVNode("div", _hoisted_6, [
            createVNode(ZoomControls, {
              "zoom-percent": zoomPercent.value,
              "is3-d": unref(graphStore).viewMode === "3d",
              onZoomIn: handleZoomIn,
              onZoomOut: handleZoomOut,
              onZoomFit: handleZoomFit,
              onZoomReset: handleZoomReset,
              onToggleLayout: toggleViewMode
            }, null, 8, ["zoom-percent", "is3-d"]),
            createVNode(DensitySlider, {
              modelValue: densityThreshold.value,
              "onUpdate:modelValue": _cache[5] || (_cache[5] = ($event) => densityThreshold.value = $event)
            }, null, 8, ["modelValue"])
          ]),
          createBaseVNode("div", _hoisted_7, [
            createVNode(BottomToolbar, {
              "is-focus-mode": isFocusMode.value,
              "is-linking-mode": isLinkingMode.value,
              "active-filter": activeFilter.value,
              onToggleFocus: toggleFocusMode,
              onSetFilter: setFilter,
              onAddNode: handleQuickAddNode,
              onToggleLinking: toggleLinkingMode
            }, null, 8, ["is-focus-mode", "is-linking-mode", "active-filter"])
          ]),
          createBaseVNode("div", _hoisted_8, [
            createVNode(StatsBar)
          ])
        ]),
        createVNode(Transition$1, { name: "slide-down" }, {
          default: withCtx(() => [
            showRightPanel.value && unref(graphStore).selectedNode ? (openBlock(), createElementBlock("div", _hoisted_9, [
              createBaseVNode("button", {
                class: "absolute top-3 right-3 w-7 h-7 flex items-center justify-center rounded-lg transition-all z-10 bg-white/10 hover:bg-white/20 text-white",
                onClick: closeInspector,
                title: "關閉"
              }, "✕"),
              createBaseVNode("div", _hoisted_10, [
                createBaseVNode("div", _hoisted_11, [
                  createBaseVNode("div", _hoisted_12, [
                    !localNodeData.value.image ? (openBlock(), createElementBlock("div", _hoisted_13, [..._cache[12] || (_cache[12] = [
                      createBaseVNode("span", { class: "text-5xl opacity-30" }, "🖼️", -1),
                      createBaseVNode("span", { class: "text-sm text-gray-400 font-medium" }, "No Cover", -1)
                    ])])) : (openBlock(), createElementBlock("img", {
                      key: 1,
                      src: localNodeData.value.image,
                      alt: "Node Cover",
                      class: "w-full h-full object-cover"
                    }, null, 8, _hoisted_14)),
                    createBaseVNode("div", {
                      class: "absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer",
                      onClick: handleImageChange
                    }, [..._cache[13] || (_cache[13] = [
                      createBaseVNode("span", { class: "text-3xl" }, "📷", -1),
                      createBaseVNode("span", { class: "text-sm text-white font-semibold" }, "Change Cover", -1)
                    ])])
                  ])
                ]),
                createBaseVNode("div", _hoisted_15, [
                  createBaseVNode("div", null, [
                    withDirectives(createBaseVNode("input", {
                      "onUpdate:modelValue": _cache[6] || (_cache[6] = ($event) => localNodeData.value.name = $event),
                      type: "text",
                      class: "w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-lg font-bold text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all",
                      placeholder: "節點標題..."
                    }, null, 512), [
                      [vModelText, localNodeData.value.name]
                    ])
                  ]),
                  createBaseVNode("div", _hoisted_16, [
                    _cache[14] || (_cache[14] = createBaseVNode("label", { class: "text-xs font-bold text-gray-400 uppercase tracking-wider" }, "SRL", -1)),
                    withDirectives(createBaseVNode("input", {
                      "onUpdate:modelValue": _cache[7] || (_cache[7] = ($event) => localNodeData.value.id = $event),
                      type: "text",
                      class: "px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all",
                      readonly: ""
                    }, null, 512), [
                      [vModelText, localNodeData.value.id]
                    ])
                  ]),
                  createBaseVNode("div", _hoisted_17, [
                    _cache[15] || (_cache[15] = createBaseVNode("label", { class: "text-xs font-bold text-gray-400 uppercase tracking-wider" }, "LINK", -1)),
                    createBaseVNode("div", _hoisted_18, [
                      withDirectives(createBaseVNode("input", {
                        "onUpdate:modelValue": _cache[8] || (_cache[8] = ($event) => localNodeData.value.link = $event),
                        type: "text",
                        class: "flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all",
                        placeholder: "https://..."
                      }, null, 512), [
                        [vModelText, localNodeData.value.link]
                      ]),
                      createBaseVNode("button", {
                        class: "px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-all",
                        onClick: openLink
                      }, "Go")
                    ])
                  ]),
                  suggestedLinks.value.length > 0 ? (openBlock(), createElementBlock("div", _hoisted_19, [
                    _cache[16] || (_cache[16] = createBaseVNode("label", { class: "text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1.5" }, [
                      createBaseVNode("span", null, "🤖"),
                      createBaseVNode("span", null, "AI 建議連線"),
                      createBaseVNode("span", { class: "text-xs font-normal text-gray-400" }, "(取消勾選不儲存)")
                    ], -1)),
                    createBaseVNode("div", _hoisted_20, [
                      (openBlock(true), createElementBlock(Fragment, null, renderList(suggestedLinks.value, (link) => {
                        return openBlock(), createElementBlock("div", {
                          key: link.id,
                          class: normalizeClass(["group flex items-start gap-2 p-2.5 rounded-lg border transition-all cursor-pointer", [
                            selectedSuggestedLinks.value.has(link.id) ? "bg-purple-500/10 border-purple-500/30" : "bg-white/5 border-white/10",
                            hoveredLinkTarget.value === link.target_id ? "ring-2 ring-purple-500" : ""
                          ]]),
                          onMouseenter: ($event) => handleLinkHover(link.target_id),
                          onMouseleave: handleLinkLeave
                        }, [
                          createBaseVNode("input", {
                            type: "checkbox",
                            checked: selectedSuggestedLinks.value.has(link.id),
                            onChange: ($event) => toggleSuggestedLink(link.id),
                            class: "mt-0.5 w-4 h-4 text-purple-600 rounded focus:ring-2 focus:ring-purple-500 cursor-pointer"
                          }, null, 40, _hoisted_22),
                          createBaseVNode("div", _hoisted_23, [
                            createBaseVNode("div", _hoisted_24, [
                              createBaseVNode("span", _hoisted_25, toDisplayString(getTargetNodeName(link.target_id)), 1),
                              createBaseVNode("span", _hoisted_26, toDisplayString(link.relation), 1)
                            ]),
                            createBaseVNode("p", _hoisted_27, toDisplayString(link.reason), 1)
                          ])
                        ], 42, _hoisted_21);
                      }), 128))
                    ])
                  ])) : createCommentVNode("", true),
                  createBaseVNode("div", { class: "flex gap-3 mt-auto pt-2" }, [
                    createBaseVNode("button", {
                      class: "flex-1 px-4 py-2 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white rounded-lg font-semibold shadow-lg shadow-blue-500/30 transition-all",
                      onClick: saveChanges
                    }, [..._cache[17] || (_cache[17] = [
                      createBaseVNode("span", { class: "text-base" }, "💾", -1),
                      createBaseVNode("span", null, "SAVE", -1)
                    ])]),
                    createBaseVNode("button", {
                      class: "px-4 py-2 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold shadow-lg shadow-red-500/30 transition-all",
                      onClick: deleteNode,
                      title: "刪除節點"
                    }, [..._cache[18] || (_cache[18] = [
                      createBaseVNode("span", { class: "text-base" }, "🗑️", -1),
                      createBaseVNode("span", null, "DELETE", -1)
                    ])])
                  ])
                ]),
                createBaseVNode("div", _hoisted_28, [
                  createBaseVNode("div", _hoisted_29, [
                    _cache[19] || (_cache[19] = createBaseVNode("label", { class: "text-xs font-bold text-gray-400 uppercase tracking-wider" }, "DESCRIPTION", -1)),
                    withDirectives(createBaseVNode("textarea", {
                      "onUpdate:modelValue": _cache[9] || (_cache[9] = ($event) => localNodeData.value.description = $event),
                      class: "flex-1 px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm leading-relaxed text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none transition-all",
                      placeholder: "節點描述..."
                    }, null, 512), [
                      [vModelText, localNodeData.value.description]
                    ])
                  ])
                ])
              ])
            ])) : createCommentVNode("", true)
          ]),
          _: 1
        })
      ]);
    };
  }
};
const GraphPage = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-e69af6f0"]]);
export {
  GraphPage as default
};
