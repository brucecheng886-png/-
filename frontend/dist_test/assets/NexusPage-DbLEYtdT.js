import { aF as vue_runtime_esmBundler, w as watch, j as onMounted, B as onActivated, y as openBlock, D as createElementBlock, G as createBaseVNode, az as createStaticVNode, E as createVNode, F as withCtx, $ as withModifiers, U as toDisplayString, R as createCommentVNode, u as unref, P as withDirectives, an as vModelText, M as Fragment, a6 as renderList, I as normalizeClass, aj as vModelCheckbox, aG as vModelSelect, r as ref, c as computed, ay as useRouter, aA as useRoute } from "./vue-vendor-rpbpBucb.js";
import { _ as _export_sfc, u as useGraphStore } from "./index-DDdIzyMR.js";
import { a as getAugmentedNamespace, g as getDefaultExportFromCjs, c as commonjsGlobal, E as ElMessage } from "./element-plus-DavumCtP.js";
function bind(fn, thisArg) {
  return function wrap() {
    return fn.apply(thisArg, arguments);
  };
}
const { toString } = Object.prototype;
const { getPrototypeOf } = Object;
const { iterator, toStringTag } = Symbol;
const kindOf = /* @__PURE__ */ ((cache) => (thing) => {
  const str = toString.call(thing);
  return cache[str] || (cache[str] = str.slice(8, -1).toLowerCase());
})(/* @__PURE__ */ Object.create(null));
const kindOfTest = (type) => {
  type = type.toLowerCase();
  return (thing) => kindOf(thing) === type;
};
const typeOfTest = (type) => (thing) => typeof thing === type;
const { isArray } = Array;
const isUndefined = typeOfTest("undefined");
function isBuffer(val) {
  return val !== null && !isUndefined(val) && val.constructor !== null && !isUndefined(val.constructor) && isFunction$1(val.constructor.isBuffer) && val.constructor.isBuffer(val);
}
const isArrayBuffer = kindOfTest("ArrayBuffer");
function isArrayBufferView(val) {
  let result;
  if (typeof ArrayBuffer !== "undefined" && ArrayBuffer.isView) {
    result = ArrayBuffer.isView(val);
  } else {
    result = val && val.buffer && isArrayBuffer(val.buffer);
  }
  return result;
}
const isString = typeOfTest("string");
const isFunction$1 = typeOfTest("function");
const isNumber = typeOfTest("number");
const isObject = (thing) => thing !== null && typeof thing === "object";
const isBoolean = (thing) => thing === true || thing === false;
const isPlainObject = (val) => {
  if (kindOf(val) !== "object") {
    return false;
  }
  const prototype2 = getPrototypeOf(val);
  return (prototype2 === null || prototype2 === Object.prototype || Object.getPrototypeOf(prototype2) === null) && !(toStringTag in val) && !(iterator in val);
};
const isEmptyObject = (val) => {
  if (!isObject(val) || isBuffer(val)) {
    return false;
  }
  try {
    return Object.keys(val).length === 0 && Object.getPrototypeOf(val) === Object.prototype;
  } catch (e) {
    return false;
  }
};
const isDate = kindOfTest("Date");
const isFile = kindOfTest("File");
const isBlob = kindOfTest("Blob");
const isFileList = kindOfTest("FileList");
const isStream = (val) => isObject(val) && isFunction$1(val.pipe);
const isFormData = (thing) => {
  let kind;
  return thing && (typeof FormData === "function" && thing instanceof FormData || isFunction$1(thing.append) && ((kind = kindOf(thing)) === "formdata" || // detect form-data instance
  kind === "object" && isFunction$1(thing.toString) && thing.toString() === "[object FormData]"));
};
const isURLSearchParams = kindOfTest("URLSearchParams");
const [isReadableStream, isRequest, isResponse, isHeaders] = ["ReadableStream", "Request", "Response", "Headers"].map(kindOfTest);
const trim = (str) => str.trim ? str.trim() : str.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, "");
function forEach(obj, fn, { allOwnKeys = false } = {}) {
  if (obj === null || typeof obj === "undefined") {
    return;
  }
  let i;
  let l;
  if (typeof obj !== "object") {
    obj = [obj];
  }
  if (isArray(obj)) {
    for (i = 0, l = obj.length; i < l; i++) {
      fn.call(null, obj[i], i, obj);
    }
  } else {
    if (isBuffer(obj)) {
      return;
    }
    const keys = allOwnKeys ? Object.getOwnPropertyNames(obj) : Object.keys(obj);
    const len = keys.length;
    let key;
    for (i = 0; i < len; i++) {
      key = keys[i];
      fn.call(null, obj[key], key, obj);
    }
  }
}
function findKey(obj, key) {
  if (isBuffer(obj)) {
    return null;
  }
  key = key.toLowerCase();
  const keys = Object.keys(obj);
  let i = keys.length;
  let _key;
  while (i-- > 0) {
    _key = keys[i];
    if (key === _key.toLowerCase()) {
      return _key;
    }
  }
  return null;
}
const _global = (() => {
  if (typeof globalThis !== "undefined") return globalThis;
  return typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : global;
})();
const isContextDefined = (context) => !isUndefined(context) && context !== _global;
function merge() {
  const { caseless, skipUndefined } = isContextDefined(this) && this || {};
  const result = {};
  const assignValue = (val, key) => {
    const targetKey = caseless && findKey(result, key) || key;
    if (isPlainObject(result[targetKey]) && isPlainObject(val)) {
      result[targetKey] = merge(result[targetKey], val);
    } else if (isPlainObject(val)) {
      result[targetKey] = merge({}, val);
    } else if (isArray(val)) {
      result[targetKey] = val.slice();
    } else if (!skipUndefined || !isUndefined(val)) {
      result[targetKey] = val;
    }
  };
  for (let i = 0, l = arguments.length; i < l; i++) {
    arguments[i] && forEach(arguments[i], assignValue);
  }
  return result;
}
const extend$1 = (a, b, thisArg, { allOwnKeys } = {}) => {
  forEach(b, (val, key) => {
    if (thisArg && isFunction$1(val)) {
      Object.defineProperty(a, key, {
        value: bind(val, thisArg),
        writable: true,
        enumerable: true,
        configurable: true
      });
    } else {
      Object.defineProperty(a, key, {
        value: val,
        writable: true,
        enumerable: true,
        configurable: true
      });
    }
  }, { allOwnKeys });
  return a;
};
const stripBOM = (content) => {
  if (content.charCodeAt(0) === 65279) {
    content = content.slice(1);
  }
  return content;
};
const inherits = (constructor, superConstructor, props, descriptors) => {
  constructor.prototype = Object.create(superConstructor.prototype, descriptors);
  Object.defineProperty(constructor.prototype, "constructor", {
    value: constructor,
    writable: true,
    enumerable: false,
    configurable: true
  });
  Object.defineProperty(constructor, "super", {
    value: superConstructor.prototype
  });
  props && Object.assign(constructor.prototype, props);
};
const toFlatObject = (sourceObj, destObj, filter2, propFilter) => {
  let props;
  let i;
  let prop;
  const merged = {};
  destObj = destObj || {};
  if (sourceObj == null) return destObj;
  do {
    props = Object.getOwnPropertyNames(sourceObj);
    i = props.length;
    while (i-- > 0) {
      prop = props[i];
      if ((!propFilter || propFilter(prop, sourceObj, destObj)) && !merged[prop]) {
        destObj[prop] = sourceObj[prop];
        merged[prop] = true;
      }
    }
    sourceObj = filter2 !== false && getPrototypeOf(sourceObj);
  } while (sourceObj && (!filter2 || filter2(sourceObj, destObj)) && sourceObj !== Object.prototype);
  return destObj;
};
const endsWith = (str, searchString, position) => {
  str = String(str);
  if (position === void 0 || position > str.length) {
    position = str.length;
  }
  position -= searchString.length;
  const lastIndex = str.indexOf(searchString, position);
  return lastIndex !== -1 && lastIndex === position;
};
const toArray = (thing) => {
  if (!thing) return null;
  if (isArray(thing)) return thing;
  let i = thing.length;
  if (!isNumber(i)) return null;
  const arr = new Array(i);
  while (i-- > 0) {
    arr[i] = thing[i];
  }
  return arr;
};
const isTypedArray = /* @__PURE__ */ ((TypedArray) => {
  return (thing) => {
    return TypedArray && thing instanceof TypedArray;
  };
})(typeof Uint8Array !== "undefined" && getPrototypeOf(Uint8Array));
const forEachEntry = (obj, fn) => {
  const generator = obj && obj[iterator];
  const _iterator = generator.call(obj);
  let result;
  while ((result = _iterator.next()) && !result.done) {
    const pair = result.value;
    fn.call(obj, pair[0], pair[1]);
  }
};
const matchAll = (regExp, str) => {
  let matches2;
  const arr = [];
  while ((matches2 = regExp.exec(str)) !== null) {
    arr.push(matches2);
  }
  return arr;
};
const isHTMLForm = kindOfTest("HTMLFormElement");
const toCamelCase = (str) => {
  return str.toLowerCase().replace(
    /[-_\s]([a-z\d])(\w*)/g,
    function replacer(m, p1, p2) {
      return p1.toUpperCase() + p2;
    }
  );
};
const hasOwnProperty = (({ hasOwnProperty: hasOwnProperty2 }) => (obj, prop) => hasOwnProperty2.call(obj, prop))(Object.prototype);
const isRegExp = kindOfTest("RegExp");
const reduceDescriptors = (obj, reducer) => {
  const descriptors = Object.getOwnPropertyDescriptors(obj);
  const reducedDescriptors = {};
  forEach(descriptors, (descriptor, name) => {
    let ret;
    if ((ret = reducer(descriptor, name, obj)) !== false) {
      reducedDescriptors[name] = ret || descriptor;
    }
  });
  Object.defineProperties(obj, reducedDescriptors);
};
const freezeMethods = (obj) => {
  reduceDescriptors(obj, (descriptor, name) => {
    if (isFunction$1(obj) && ["arguments", "caller", "callee"].indexOf(name) !== -1) {
      return false;
    }
    const value = obj[name];
    if (!isFunction$1(value)) return;
    descriptor.enumerable = false;
    if ("writable" in descriptor) {
      descriptor.writable = false;
      return;
    }
    if (!descriptor.set) {
      descriptor.set = () => {
        throw Error("Can not rewrite read-only method '" + name + "'");
      };
    }
  });
};
const toObjectSet = (arrayOrString, delimiter) => {
  const obj = {};
  const define = (arr) => {
    arr.forEach((value) => {
      obj[value] = true;
    });
  };
  isArray(arrayOrString) ? define(arrayOrString) : define(String(arrayOrString).split(delimiter));
  return obj;
};
const noop = () => {
};
const toFiniteNumber = (value, defaultValue) => {
  return value != null && Number.isFinite(value = +value) ? value : defaultValue;
};
function isSpecCompliantForm(thing) {
  return !!(thing && isFunction$1(thing.append) && thing[toStringTag] === "FormData" && thing[iterator]);
}
const toJSONObject = (obj) => {
  const stack = new Array(10);
  const visit = (source, i) => {
    if (isObject(source)) {
      if (stack.indexOf(source) >= 0) {
        return;
      }
      if (isBuffer(source)) {
        return source;
      }
      if (!("toJSON" in source)) {
        stack[i] = source;
        const target = isArray(source) ? [] : {};
        forEach(source, (value, key) => {
          const reducedValue = visit(value, i + 1);
          !isUndefined(reducedValue) && (target[key] = reducedValue);
        });
        stack[i] = void 0;
        return target;
      }
    }
    return source;
  };
  return visit(obj, 0);
};
const isAsyncFn = kindOfTest("AsyncFunction");
const isThenable = (thing) => thing && (isObject(thing) || isFunction$1(thing)) && isFunction$1(thing.then) && isFunction$1(thing.catch);
const _setImmediate = ((setImmediateSupported, postMessageSupported) => {
  if (setImmediateSupported) {
    return setImmediate;
  }
  return postMessageSupported ? ((token, callbacks) => {
    _global.addEventListener("message", ({ source, data }) => {
      if (source === _global && data === token) {
        callbacks.length && callbacks.shift()();
      }
    }, false);
    return (cb) => {
      callbacks.push(cb);
      _global.postMessage(token, "*");
    };
  })(`axios@${Math.random()}`, []) : (cb) => setTimeout(cb);
})(
  typeof setImmediate === "function",
  isFunction$1(_global.postMessage)
);
const asap = typeof queueMicrotask !== "undefined" ? queueMicrotask.bind(_global) : typeof process !== "undefined" && process.nextTick || _setImmediate;
const isIterable = (thing) => thing != null && isFunction$1(thing[iterator]);
const utils$1 = {
  isArray,
  isArrayBuffer,
  isBuffer,
  isFormData,
  isArrayBufferView,
  isString,
  isNumber,
  isBoolean,
  isObject,
  isPlainObject,
  isEmptyObject,
  isReadableStream,
  isRequest,
  isResponse,
  isHeaders,
  isUndefined,
  isDate,
  isFile,
  isBlob,
  isRegExp,
  isFunction: isFunction$1,
  isStream,
  isURLSearchParams,
  isTypedArray,
  isFileList,
  forEach,
  merge,
  extend: extend$1,
  trim,
  stripBOM,
  inherits,
  toFlatObject,
  kindOf,
  kindOfTest,
  endsWith,
  toArray,
  forEachEntry,
  matchAll,
  isHTMLForm,
  hasOwnProperty,
  hasOwnProp: hasOwnProperty,
  // an alias to avoid ESLint no-prototype-builtins detection
  reduceDescriptors,
  freezeMethods,
  toObjectSet,
  toCamelCase,
  noop,
  toFiniteNumber,
  findKey,
  global: _global,
  isContextDefined,
  isSpecCompliantForm,
  toJSONObject,
  isAsyncFn,
  isThenable,
  setImmediate: _setImmediate,
  asap,
  isIterable
};
let AxiosError$1 = class AxiosError extends Error {
  static from(error, code, config, request, response, customProps) {
    const axiosError = new AxiosError(error.message, code || error.code, config, request, response);
    axiosError.cause = error;
    axiosError.name = error.name;
    customProps && Object.assign(axiosError, customProps);
    return axiosError;
  }
  /**
   * Create an Error with the specified message, config, error code, request and response.
   *
   * @param {string} message The error message.
   * @param {string} [code] The error code (for example, 'ECONNABORTED').
   * @param {Object} [config] The config.
   * @param {Object} [request] The request.
   * @param {Object} [response] The response.
   *
   * @returns {Error} The created error.
   */
  constructor(message, code, config, request, response) {
    super(message);
    this.name = "AxiosError";
    this.isAxiosError = true;
    code && (this.code = code);
    config && (this.config = config);
    request && (this.request = request);
    if (response) {
      this.response = response;
      this.status = response.status;
    }
  }
  toJSON() {
    return {
      // Standard
      message: this.message,
      name: this.name,
      // Microsoft
      description: this.description,
      number: this.number,
      // Mozilla
      fileName: this.fileName,
      lineNumber: this.lineNumber,
      columnNumber: this.columnNumber,
      stack: this.stack,
      // Axios
      config: utils$1.toJSONObject(this.config),
      code: this.code,
      status: this.status
    };
  }
};
AxiosError$1.ERR_BAD_OPTION_VALUE = "ERR_BAD_OPTION_VALUE";
AxiosError$1.ERR_BAD_OPTION = "ERR_BAD_OPTION";
AxiosError$1.ECONNABORTED = "ECONNABORTED";
AxiosError$1.ETIMEDOUT = "ETIMEDOUT";
AxiosError$1.ERR_NETWORK = "ERR_NETWORK";
AxiosError$1.ERR_FR_TOO_MANY_REDIRECTS = "ERR_FR_TOO_MANY_REDIRECTS";
AxiosError$1.ERR_DEPRECATED = "ERR_DEPRECATED";
AxiosError$1.ERR_BAD_RESPONSE = "ERR_BAD_RESPONSE";
AxiosError$1.ERR_BAD_REQUEST = "ERR_BAD_REQUEST";
AxiosError$1.ERR_CANCELED = "ERR_CANCELED";
AxiosError$1.ERR_NOT_SUPPORT = "ERR_NOT_SUPPORT";
AxiosError$1.ERR_INVALID_URL = "ERR_INVALID_URL";
const httpAdapter = null;
function isVisitable(thing) {
  return utils$1.isPlainObject(thing) || utils$1.isArray(thing);
}
function removeBrackets(key) {
  return utils$1.endsWith(key, "[]") ? key.slice(0, -2) : key;
}
function renderKey(path, key, dots) {
  if (!path) return key;
  return path.concat(key).map(function each(token, i) {
    token = removeBrackets(token);
    return !dots && i ? "[" + token + "]" : token;
  }).join(dots ? "." : "");
}
function isFlatArray(arr) {
  return utils$1.isArray(arr) && !arr.some(isVisitable);
}
const predicates = utils$1.toFlatObject(utils$1, {}, null, function filter(prop) {
  return /^is[A-Z]/.test(prop);
});
function toFormData$1(obj, formData, options) {
  if (!utils$1.isObject(obj)) {
    throw new TypeError("target must be an object");
  }
  formData = formData || new FormData();
  options = utils$1.toFlatObject(options, {
    metaTokens: true,
    dots: false,
    indexes: false
  }, false, function defined(option2, source) {
    return !utils$1.isUndefined(source[option2]);
  });
  const metaTokens = options.metaTokens;
  const visitor = options.visitor || defaultVisitor;
  const dots = options.dots;
  const indexes = options.indexes;
  const _Blob = options.Blob || typeof Blob !== "undefined" && Blob;
  const useBlob = _Blob && utils$1.isSpecCompliantForm(formData);
  if (!utils$1.isFunction(visitor)) {
    throw new TypeError("visitor must be a function");
  }
  function convertValue(value) {
    if (value === null) return "";
    if (utils$1.isDate(value)) {
      return value.toISOString();
    }
    if (utils$1.isBoolean(value)) {
      return value.toString();
    }
    if (!useBlob && utils$1.isBlob(value)) {
      throw new AxiosError$1("Blob is not supported. Use a Buffer instead.");
    }
    if (utils$1.isArrayBuffer(value) || utils$1.isTypedArray(value)) {
      return useBlob && typeof Blob === "function" ? new Blob([value]) : Buffer.from(value);
    }
    return value;
  }
  function defaultVisitor(value, key, path) {
    let arr = value;
    if (value && !path && typeof value === "object") {
      if (utils$1.endsWith(key, "{}")) {
        key = metaTokens ? key : key.slice(0, -2);
        value = JSON.stringify(value);
      } else if (utils$1.isArray(value) && isFlatArray(value) || (utils$1.isFileList(value) || utils$1.endsWith(key, "[]")) && (arr = utils$1.toArray(value))) {
        key = removeBrackets(key);
        arr.forEach(function each(el, index2) {
          !(utils$1.isUndefined(el) || el === null) && formData.append(
            // eslint-disable-next-line no-nested-ternary
            indexes === true ? renderKey([key], index2, dots) : indexes === null ? key : key + "[]",
            convertValue(el)
          );
        });
        return false;
      }
    }
    if (isVisitable(value)) {
      return true;
    }
    formData.append(renderKey(path, key, dots), convertValue(value));
    return false;
  }
  const stack = [];
  const exposedHelpers = Object.assign(predicates, {
    defaultVisitor,
    convertValue,
    isVisitable
  });
  function build(value, path) {
    if (utils$1.isUndefined(value)) return;
    if (stack.indexOf(value) !== -1) {
      throw Error("Circular reference detected in " + path.join("."));
    }
    stack.push(value);
    utils$1.forEach(value, function each(el, key) {
      const result = !(utils$1.isUndefined(el) || el === null) && visitor.call(
        formData,
        el,
        utils$1.isString(key) ? key.trim() : key,
        path,
        exposedHelpers
      );
      if (result === true) {
        build(el, path ? path.concat(key) : [key]);
      }
    });
    stack.pop();
  }
  if (!utils$1.isObject(obj)) {
    throw new TypeError("data must be an object");
  }
  build(obj);
  return formData;
}
function encode$1(str) {
  const charMap = {
    "!": "%21",
    "'": "%27",
    "(": "%28",
    ")": "%29",
    "~": "%7E",
    "%20": "+",
    "%00": "\0"
  };
  return encodeURIComponent(str).replace(/[!'()~]|%20|%00/g, function replacer(match) {
    return charMap[match];
  });
}
function AxiosURLSearchParams(params, options) {
  this._pairs = [];
  params && toFormData$1(params, this, options);
}
const prototype = AxiosURLSearchParams.prototype;
prototype.append = function append(name, value) {
  this._pairs.push([name, value]);
};
prototype.toString = function toString2(encoder) {
  const _encode = encoder ? function(value) {
    return encoder.call(this, value, encode$1);
  } : encode$1;
  return this._pairs.map(function each(pair) {
    return _encode(pair[0]) + "=" + _encode(pair[1]);
  }, "").join("&");
};
function encode(val) {
  return encodeURIComponent(val).replace(/%3A/gi, ":").replace(/%24/g, "$").replace(/%2C/gi, ",").replace(/%20/g, "+");
}
function buildURL(url, params, options) {
  if (!params) {
    return url;
  }
  const _encode = options && options.encode || encode;
  const _options = utils$1.isFunction(options) ? {
    serialize: options
  } : options;
  const serializeFn = _options && _options.serialize;
  let serializedParams;
  if (serializeFn) {
    serializedParams = serializeFn(params, _options);
  } else {
    serializedParams = utils$1.isURLSearchParams(params) ? params.toString() : new AxiosURLSearchParams(params, _options).toString(_encode);
  }
  if (serializedParams) {
    const hashmarkIndex = url.indexOf("#");
    if (hashmarkIndex !== -1) {
      url = url.slice(0, hashmarkIndex);
    }
    url += (url.indexOf("?") === -1 ? "?" : "&") + serializedParams;
  }
  return url;
}
class InterceptorManager {
  constructor() {
    this.handlers = [];
  }
  /**
   * Add a new interceptor to the stack
   *
   * @param {Function} fulfilled The function to handle `then` for a `Promise`
   * @param {Function} rejected The function to handle `reject` for a `Promise`
   * @param {Object} options The options for the interceptor, synchronous and runWhen
   *
   * @return {Number} An ID used to remove interceptor later
   */
  use(fulfilled, rejected, options) {
    this.handlers.push({
      fulfilled,
      rejected,
      synchronous: options ? options.synchronous : false,
      runWhen: options ? options.runWhen : null
    });
    return this.handlers.length - 1;
  }
  /**
   * Remove an interceptor from the stack
   *
   * @param {Number} id The ID that was returned by `use`
   *
   * @returns {void}
   */
  eject(id) {
    if (this.handlers[id]) {
      this.handlers[id] = null;
    }
  }
  /**
   * Clear all interceptors from the stack
   *
   * @returns {void}
   */
  clear() {
    if (this.handlers) {
      this.handlers = [];
    }
  }
  /**
   * Iterate over all the registered interceptors
   *
   * This method is particularly useful for skipping over any
   * interceptors that may have become `null` calling `eject`.
   *
   * @param {Function} fn The function to call for each interceptor
   *
   * @returns {void}
   */
  forEach(fn) {
    utils$1.forEach(this.handlers, function forEachHandler(h) {
      if (h !== null) {
        fn(h);
      }
    });
  }
}
const transitionalDefaults = {
  silentJSONParsing: true,
  forcedJSONParsing: true,
  clarifyTimeoutError: false
};
const URLSearchParams$1 = typeof URLSearchParams !== "undefined" ? URLSearchParams : AxiosURLSearchParams;
const FormData$1 = typeof FormData !== "undefined" ? FormData : null;
const Blob$1 = typeof Blob !== "undefined" ? Blob : null;
const platform$1 = {
  isBrowser: true,
  classes: {
    URLSearchParams: URLSearchParams$1,
    FormData: FormData$1,
    Blob: Blob$1
  },
  protocols: ["http", "https", "file", "blob", "url", "data"]
};
const hasBrowserEnv = typeof window !== "undefined" && typeof document !== "undefined";
const _navigator = typeof navigator === "object" && navigator || void 0;
const hasStandardBrowserEnv = hasBrowserEnv && (!_navigator || ["ReactNative", "NativeScript", "NS"].indexOf(_navigator.product) < 0);
const hasStandardBrowserWebWorkerEnv = (() => {
  return typeof WorkerGlobalScope !== "undefined" && // eslint-disable-next-line no-undef
  self instanceof WorkerGlobalScope && typeof self.importScripts === "function";
})();
const origin = hasBrowserEnv && window.location.href || "http://localhost";
const utils = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  hasBrowserEnv,
  hasStandardBrowserEnv,
  hasStandardBrowserWebWorkerEnv,
  navigator: _navigator,
  origin
}, Symbol.toStringTag, { value: "Module" }));
const platform = {
  ...utils,
  ...platform$1
};
function toURLEncodedForm(data, options) {
  return toFormData$1(data, new platform.classes.URLSearchParams(), {
    visitor: function(value, key, path, helpers) {
      if (platform.isNode && utils$1.isBuffer(value)) {
        this.append(key, value.toString("base64"));
        return false;
      }
      return helpers.defaultVisitor.apply(this, arguments);
    },
    ...options
  });
}
function parsePropPath(name) {
  return utils$1.matchAll(/\w+|\[(\w*)]/g, name).map((match) => {
    return match[0] === "[]" ? "" : match[1] || match[0];
  });
}
function arrayToObject(arr) {
  const obj = {};
  const keys = Object.keys(arr);
  let i;
  const len = keys.length;
  let key;
  for (i = 0; i < len; i++) {
    key = keys[i];
    obj[key] = arr[key];
  }
  return obj;
}
function formDataToJSON(formData) {
  function buildPath(path, value, target, index2) {
    let name = path[index2++];
    if (name === "__proto__") return true;
    const isNumericKey = Number.isFinite(+name);
    const isLast = index2 >= path.length;
    name = !name && utils$1.isArray(target) ? target.length : name;
    if (isLast) {
      if (utils$1.hasOwnProp(target, name)) {
        target[name] = [target[name], value];
      } else {
        target[name] = value;
      }
      return !isNumericKey;
    }
    if (!target[name] || !utils$1.isObject(target[name])) {
      target[name] = [];
    }
    const result = buildPath(path, value, target[name], index2);
    if (result && utils$1.isArray(target[name])) {
      target[name] = arrayToObject(target[name]);
    }
    return !isNumericKey;
  }
  if (utils$1.isFormData(formData) && utils$1.isFunction(formData.entries)) {
    const obj = {};
    utils$1.forEachEntry(formData, (name, value) => {
      buildPath(parsePropPath(name), value, obj, 0);
    });
    return obj;
  }
  return null;
}
function stringifySafely(rawValue, parser, encoder) {
  if (utils$1.isString(rawValue)) {
    try {
      (parser || JSON.parse)(rawValue);
      return utils$1.trim(rawValue);
    } catch (e) {
      if (e.name !== "SyntaxError") {
        throw e;
      }
    }
  }
  return (encoder || JSON.stringify)(rawValue);
}
const defaults$1 = {
  transitional: transitionalDefaults,
  adapter: ["xhr", "http", "fetch"],
  transformRequest: [function transformRequest(data, headers) {
    const contentType = headers.getContentType() || "";
    const hasJSONContentType = contentType.indexOf("application/json") > -1;
    const isObjectPayload = utils$1.isObject(data);
    if (isObjectPayload && utils$1.isHTMLForm(data)) {
      data = new FormData(data);
    }
    const isFormData2 = utils$1.isFormData(data);
    if (isFormData2) {
      return hasJSONContentType ? JSON.stringify(formDataToJSON(data)) : data;
    }
    if (utils$1.isArrayBuffer(data) || utils$1.isBuffer(data) || utils$1.isStream(data) || utils$1.isFile(data) || utils$1.isBlob(data) || utils$1.isReadableStream(data)) {
      return data;
    }
    if (utils$1.isArrayBufferView(data)) {
      return data.buffer;
    }
    if (utils$1.isURLSearchParams(data)) {
      headers.setContentType("application/x-www-form-urlencoded;charset=utf-8", false);
      return data.toString();
    }
    let isFileList2;
    if (isObjectPayload) {
      if (contentType.indexOf("application/x-www-form-urlencoded") > -1) {
        return toURLEncodedForm(data, this.formSerializer).toString();
      }
      if ((isFileList2 = utils$1.isFileList(data)) || contentType.indexOf("multipart/form-data") > -1) {
        const _FormData = this.env && this.env.FormData;
        return toFormData$1(
          isFileList2 ? { "files[]": data } : data,
          _FormData && new _FormData(),
          this.formSerializer
        );
      }
    }
    if (isObjectPayload || hasJSONContentType) {
      headers.setContentType("application/json", false);
      return stringifySafely(data);
    }
    return data;
  }],
  transformResponse: [function transformResponse(data) {
    const transitional2 = this.transitional || defaults$1.transitional;
    const forcedJSONParsing = transitional2 && transitional2.forcedJSONParsing;
    const JSONRequested = this.responseType === "json";
    if (utils$1.isResponse(data) || utils$1.isReadableStream(data)) {
      return data;
    }
    if (data && utils$1.isString(data) && (forcedJSONParsing && !this.responseType || JSONRequested)) {
      const silentJSONParsing = transitional2 && transitional2.silentJSONParsing;
      const strictJSONParsing = !silentJSONParsing && JSONRequested;
      try {
        return JSON.parse(data, this.parseReviver);
      } catch (e) {
        if (strictJSONParsing) {
          if (e.name === "SyntaxError") {
            throw AxiosError$1.from(e, AxiosError$1.ERR_BAD_RESPONSE, this, null, this.response);
          }
          throw e;
        }
      }
    }
    return data;
  }],
  /**
   * A timeout in milliseconds to abort a request. If set to 0 (default) a
   * timeout is not created.
   */
  timeout: 0,
  xsrfCookieName: "XSRF-TOKEN",
  xsrfHeaderName: "X-XSRF-TOKEN",
  maxContentLength: -1,
  maxBodyLength: -1,
  env: {
    FormData: platform.classes.FormData,
    Blob: platform.classes.Blob
  },
  validateStatus: function validateStatus(status) {
    return status >= 200 && status < 300;
  },
  headers: {
    common: {
      "Accept": "application/json, text/plain, */*",
      "Content-Type": void 0
    }
  }
};
utils$1.forEach(["delete", "get", "head", "post", "put", "patch"], (method) => {
  defaults$1.headers[method] = {};
});
const ignoreDuplicateOf = utils$1.toObjectSet([
  "age",
  "authorization",
  "content-length",
  "content-type",
  "etag",
  "expires",
  "from",
  "host",
  "if-modified-since",
  "if-unmodified-since",
  "last-modified",
  "location",
  "max-forwards",
  "proxy-authorization",
  "referer",
  "retry-after",
  "user-agent"
]);
const parseHeaders = (rawHeaders) => {
  const parsed = {};
  let key;
  let val;
  let i;
  rawHeaders && rawHeaders.split("\n").forEach(function parser(line) {
    i = line.indexOf(":");
    key = line.substring(0, i).trim().toLowerCase();
    val = line.substring(i + 1).trim();
    if (!key || parsed[key] && ignoreDuplicateOf[key]) {
      return;
    }
    if (key === "set-cookie") {
      if (parsed[key]) {
        parsed[key].push(val);
      } else {
        parsed[key] = [val];
      }
    } else {
      parsed[key] = parsed[key] ? parsed[key] + ", " + val : val;
    }
  });
  return parsed;
};
const $internals = Symbol("internals");
function normalizeHeader(header) {
  return header && String(header).trim().toLowerCase();
}
function normalizeValue(value) {
  if (value === false || value == null) {
    return value;
  }
  return utils$1.isArray(value) ? value.map(normalizeValue) : String(value);
}
function parseTokens(str) {
  const tokens = /* @__PURE__ */ Object.create(null);
  const tokensRE = /([^\s,;=]+)\s*(?:=\s*([^,;]+))?/g;
  let match;
  while (match = tokensRE.exec(str)) {
    tokens[match[1]] = match[2];
  }
  return tokens;
}
const isValidHeaderName = (str) => /^[-_a-zA-Z0-9^`|~,!#$%&'*+.]+$/.test(str.trim());
function matchHeaderValue(context, value, header, filter2, isHeaderNameFilter) {
  if (utils$1.isFunction(filter2)) {
    return filter2.call(this, value, header);
  }
  if (isHeaderNameFilter) {
    value = header;
  }
  if (!utils$1.isString(value)) return;
  if (utils$1.isString(filter2)) {
    return value.indexOf(filter2) !== -1;
  }
  if (utils$1.isRegExp(filter2)) {
    return filter2.test(value);
  }
}
function formatHeader(header) {
  return header.trim().toLowerCase().replace(/([a-z\d])(\w*)/g, (w, char, str) => {
    return char.toUpperCase() + str;
  });
}
function buildAccessors(obj, header) {
  const accessorName = utils$1.toCamelCase(" " + header);
  ["get", "set", "has"].forEach((methodName) => {
    Object.defineProperty(obj, methodName + accessorName, {
      value: function(arg1, arg2, arg3) {
        return this[methodName].call(this, header, arg1, arg2, arg3);
      },
      configurable: true
    });
  });
}
let AxiosHeaders$1 = class AxiosHeaders {
  constructor(headers) {
    headers && this.set(headers);
  }
  set(header, valueOrRewrite, rewrite) {
    const self2 = this;
    function setHeader(_value, _header, _rewrite) {
      const lHeader = normalizeHeader(_header);
      if (!lHeader) {
        throw new Error("header name must be a non-empty string");
      }
      const key = utils$1.findKey(self2, lHeader);
      if (!key || self2[key] === void 0 || _rewrite === true || _rewrite === void 0 && self2[key] !== false) {
        self2[key || _header] = normalizeValue(_value);
      }
    }
    const setHeaders = (headers, _rewrite) => utils$1.forEach(headers, (_value, _header) => setHeader(_value, _header, _rewrite));
    if (utils$1.isPlainObject(header) || header instanceof this.constructor) {
      setHeaders(header, valueOrRewrite);
    } else if (utils$1.isString(header) && (header = header.trim()) && !isValidHeaderName(header)) {
      setHeaders(parseHeaders(header), valueOrRewrite);
    } else if (utils$1.isObject(header) && utils$1.isIterable(header)) {
      let obj = {}, dest, key;
      for (const entry of header) {
        if (!utils$1.isArray(entry)) {
          throw TypeError("Object iterator must return a key-value pair");
        }
        obj[key = entry[0]] = (dest = obj[key]) ? utils$1.isArray(dest) ? [...dest, entry[1]] : [dest, entry[1]] : entry[1];
      }
      setHeaders(obj, valueOrRewrite);
    } else {
      header != null && setHeader(valueOrRewrite, header, rewrite);
    }
    return this;
  }
  get(header, parser) {
    header = normalizeHeader(header);
    if (header) {
      const key = utils$1.findKey(this, header);
      if (key) {
        const value = this[key];
        if (!parser) {
          return value;
        }
        if (parser === true) {
          return parseTokens(value);
        }
        if (utils$1.isFunction(parser)) {
          return parser.call(this, value, key);
        }
        if (utils$1.isRegExp(parser)) {
          return parser.exec(value);
        }
        throw new TypeError("parser must be boolean|regexp|function");
      }
    }
  }
  has(header, matcher) {
    header = normalizeHeader(header);
    if (header) {
      const key = utils$1.findKey(this, header);
      return !!(key && this[key] !== void 0 && (!matcher || matchHeaderValue(this, this[key], key, matcher)));
    }
    return false;
  }
  delete(header, matcher) {
    const self2 = this;
    let deleted = false;
    function deleteHeader(_header) {
      _header = normalizeHeader(_header);
      if (_header) {
        const key = utils$1.findKey(self2, _header);
        if (key && (!matcher || matchHeaderValue(self2, self2[key], key, matcher))) {
          delete self2[key];
          deleted = true;
        }
      }
    }
    if (utils$1.isArray(header)) {
      header.forEach(deleteHeader);
    } else {
      deleteHeader(header);
    }
    return deleted;
  }
  clear(matcher) {
    const keys = Object.keys(this);
    let i = keys.length;
    let deleted = false;
    while (i--) {
      const key = keys[i];
      if (!matcher || matchHeaderValue(this, this[key], key, matcher, true)) {
        delete this[key];
        deleted = true;
      }
    }
    return deleted;
  }
  normalize(format) {
    const self2 = this;
    const headers = {};
    utils$1.forEach(this, (value, header) => {
      const key = utils$1.findKey(headers, header);
      if (key) {
        self2[key] = normalizeValue(value);
        delete self2[header];
        return;
      }
      const normalized = format ? formatHeader(header) : String(header).trim();
      if (normalized !== header) {
        delete self2[header];
      }
      self2[normalized] = normalizeValue(value);
      headers[normalized] = true;
    });
    return this;
  }
  concat(...targets) {
    return this.constructor.concat(this, ...targets);
  }
  toJSON(asStrings) {
    const obj = /* @__PURE__ */ Object.create(null);
    utils$1.forEach(this, (value, header) => {
      value != null && value !== false && (obj[header] = asStrings && utils$1.isArray(value) ? value.join(", ") : value);
    });
    return obj;
  }
  [Symbol.iterator]() {
    return Object.entries(this.toJSON())[Symbol.iterator]();
  }
  toString() {
    return Object.entries(this.toJSON()).map(([header, value]) => header + ": " + value).join("\n");
  }
  getSetCookie() {
    return this.get("set-cookie") || [];
  }
  get [Symbol.toStringTag]() {
    return "AxiosHeaders";
  }
  static from(thing) {
    return thing instanceof this ? thing : new this(thing);
  }
  static concat(first, ...targets) {
    const computed2 = new this(first);
    targets.forEach((target) => computed2.set(target));
    return computed2;
  }
  static accessor(header) {
    const internals = this[$internals] = this[$internals] = {
      accessors: {}
    };
    const accessors = internals.accessors;
    const prototype2 = this.prototype;
    function defineAccessor(_header) {
      const lHeader = normalizeHeader(_header);
      if (!accessors[lHeader]) {
        buildAccessors(prototype2, _header);
        accessors[lHeader] = true;
      }
    }
    utils$1.isArray(header) ? header.forEach(defineAccessor) : defineAccessor(header);
    return this;
  }
};
AxiosHeaders$1.accessor(["Content-Type", "Content-Length", "Accept", "Accept-Encoding", "User-Agent", "Authorization"]);
utils$1.reduceDescriptors(AxiosHeaders$1.prototype, ({ value }, key) => {
  let mapped = key[0].toUpperCase() + key.slice(1);
  return {
    get: () => value,
    set(headerValue) {
      this[mapped] = headerValue;
    }
  };
});
utils$1.freezeMethods(AxiosHeaders$1);
function transformData(fns, response) {
  const config = this || defaults$1;
  const context = response || config;
  const headers = AxiosHeaders$1.from(context.headers);
  let data = context.data;
  utils$1.forEach(fns, function transform(fn) {
    data = fn.call(config, data, headers.normalize(), response ? response.status : void 0);
  });
  headers.normalize();
  return data;
}
function isCancel$1(value) {
  return !!(value && value.__CANCEL__);
}
let CanceledError$1 = class CanceledError extends AxiosError$1 {
  /**
   * A `CanceledError` is an object that is thrown when an operation is canceled.
   *
   * @param {string=} message The message.
   * @param {Object=} config The config.
   * @param {Object=} request The request.
   *
   * @returns {CanceledError} The created error.
   */
  constructor(message, config, request) {
    super(message == null ? "canceled" : message, AxiosError$1.ERR_CANCELED, config, request);
    this.name = "CanceledError";
    this.__CANCEL__ = true;
  }
};
function settle(resolve, reject, response) {
  const validateStatus2 = response.config.validateStatus;
  if (!response.status || !validateStatus2 || validateStatus2(response.status)) {
    resolve(response);
  } else {
    reject(new AxiosError$1(
      "Request failed with status code " + response.status,
      [AxiosError$1.ERR_BAD_REQUEST, AxiosError$1.ERR_BAD_RESPONSE][Math.floor(response.status / 100) - 4],
      response.config,
      response.request,
      response
    ));
  }
}
function parseProtocol(url) {
  const match = /^([-+\w]{1,25})(:?\/\/|:)/.exec(url);
  return match && match[1] || "";
}
function speedometer(samplesCount, min) {
  samplesCount = samplesCount || 10;
  const bytes = new Array(samplesCount);
  const timestamps = new Array(samplesCount);
  let head = 0;
  let tail = 0;
  let firstSampleTS;
  min = min !== void 0 ? min : 1e3;
  return function push(chunkLength) {
    const now = Date.now();
    const startedAt = timestamps[tail];
    if (!firstSampleTS) {
      firstSampleTS = now;
    }
    bytes[head] = chunkLength;
    timestamps[head] = now;
    let i = tail;
    let bytesCount = 0;
    while (i !== head) {
      bytesCount += bytes[i++];
      i = i % samplesCount;
    }
    head = (head + 1) % samplesCount;
    if (head === tail) {
      tail = (tail + 1) % samplesCount;
    }
    if (now - firstSampleTS < min) {
      return;
    }
    const passed = startedAt && now - startedAt;
    return passed ? Math.round(bytesCount * 1e3 / passed) : void 0;
  };
}
function throttle$1(fn, freq) {
  let timestamp = 0;
  let threshold = 1e3 / freq;
  let lastArgs;
  let timer;
  const invoke = (args, now = Date.now()) => {
    timestamp = now;
    lastArgs = null;
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
    fn(...args);
  };
  const throttled = (...args) => {
    const now = Date.now();
    const passed = now - timestamp;
    if (passed >= threshold) {
      invoke(args, now);
    } else {
      lastArgs = args;
      if (!timer) {
        timer = setTimeout(() => {
          timer = null;
          invoke(lastArgs);
        }, threshold - passed);
      }
    }
  };
  const flush = () => lastArgs && invoke(lastArgs);
  return [throttled, flush];
}
const progressEventReducer = (listener, isDownloadStream, freq = 3) => {
  let bytesNotified = 0;
  const _speedometer = speedometer(50, 250);
  return throttle$1((e) => {
    const loaded = e.loaded;
    const total = e.lengthComputable ? e.total : void 0;
    const progressBytes = loaded - bytesNotified;
    const rate = _speedometer(progressBytes);
    const inRange = loaded <= total;
    bytesNotified = loaded;
    const data = {
      loaded,
      total,
      progress: total ? loaded / total : void 0,
      bytes: progressBytes,
      rate: rate ? rate : void 0,
      estimated: rate && total && inRange ? (total - loaded) / rate : void 0,
      event: e,
      lengthComputable: total != null,
      [isDownloadStream ? "download" : "upload"]: true
    };
    listener(data);
  }, freq);
};
const progressEventDecorator = (total, throttled) => {
  const lengthComputable = total != null;
  return [(loaded) => throttled[0]({
    lengthComputable,
    total,
    loaded
  }), throttled[1]];
};
const asyncDecorator = (fn) => (...args) => utils$1.asap(() => fn(...args));
const isURLSameOrigin = platform.hasStandardBrowserEnv ? /* @__PURE__ */ ((origin2, isMSIE) => (url) => {
  url = new URL(url, platform.origin);
  return origin2.protocol === url.protocol && origin2.host === url.host && (isMSIE || origin2.port === url.port);
})(
  new URL(platform.origin),
  platform.navigator && /(msie|trident)/i.test(platform.navigator.userAgent)
) : () => true;
const cookies = platform.hasStandardBrowserEnv ? (
  // Standard browser envs support document.cookie
  {
    write(name, value, expires, path, domain, secure, sameSite) {
      if (typeof document === "undefined") return;
      const cookie = [`${name}=${encodeURIComponent(value)}`];
      if (utils$1.isNumber(expires)) {
        cookie.push(`expires=${new Date(expires).toUTCString()}`);
      }
      if (utils$1.isString(path)) {
        cookie.push(`path=${path}`);
      }
      if (utils$1.isString(domain)) {
        cookie.push(`domain=${domain}`);
      }
      if (secure === true) {
        cookie.push("secure");
      }
      if (utils$1.isString(sameSite)) {
        cookie.push(`SameSite=${sameSite}`);
      }
      document.cookie = cookie.join("; ");
    },
    read(name) {
      if (typeof document === "undefined") return null;
      const match = document.cookie.match(new RegExp("(?:^|; )" + name + "=([^;]*)"));
      return match ? decodeURIComponent(match[1]) : null;
    },
    remove(name) {
      this.write(name, "", Date.now() - 864e5, "/");
    }
  }
) : (
  // Non-standard browser env (web workers, react-native) lack needed support.
  {
    write() {
    },
    read() {
      return null;
    },
    remove() {
    }
  }
);
function isAbsoluteURL(url) {
  return /^([a-z][a-z\d+\-.]*:)?\/\//i.test(url);
}
function combineURLs(baseURL, relativeURL) {
  return relativeURL ? baseURL.replace(/\/?\/$/, "") + "/" + relativeURL.replace(/^\/+/, "") : baseURL;
}
function buildFullPath(baseURL, requestedURL, allowAbsoluteUrls) {
  let isRelativeUrl = !isAbsoluteURL(requestedURL);
  if (baseURL && (isRelativeUrl || allowAbsoluteUrls == false)) {
    return combineURLs(baseURL, requestedURL);
  }
  return requestedURL;
}
const headersToObject = (thing) => thing instanceof AxiosHeaders$1 ? { ...thing } : thing;
function mergeConfig$1(config1, config2) {
  config2 = config2 || {};
  const config = {};
  function getMergedValue(target, source, prop, caseless) {
    if (utils$1.isPlainObject(target) && utils$1.isPlainObject(source)) {
      return utils$1.merge.call({ caseless }, target, source);
    } else if (utils$1.isPlainObject(source)) {
      return utils$1.merge({}, source);
    } else if (utils$1.isArray(source)) {
      return source.slice();
    }
    return source;
  }
  function mergeDeepProperties(a, b, prop, caseless) {
    if (!utils$1.isUndefined(b)) {
      return getMergedValue(a, b, prop, caseless);
    } else if (!utils$1.isUndefined(a)) {
      return getMergedValue(void 0, a, prop, caseless);
    }
  }
  function valueFromConfig2(a, b) {
    if (!utils$1.isUndefined(b)) {
      return getMergedValue(void 0, b);
    }
  }
  function defaultToConfig2(a, b) {
    if (!utils$1.isUndefined(b)) {
      return getMergedValue(void 0, b);
    } else if (!utils$1.isUndefined(a)) {
      return getMergedValue(void 0, a);
    }
  }
  function mergeDirectKeys(a, b, prop) {
    if (prop in config2) {
      return getMergedValue(a, b);
    } else if (prop in config1) {
      return getMergedValue(void 0, a);
    }
  }
  const mergeMap = {
    url: valueFromConfig2,
    method: valueFromConfig2,
    data: valueFromConfig2,
    baseURL: defaultToConfig2,
    transformRequest: defaultToConfig2,
    transformResponse: defaultToConfig2,
    paramsSerializer: defaultToConfig2,
    timeout: defaultToConfig2,
    timeoutMessage: defaultToConfig2,
    withCredentials: defaultToConfig2,
    withXSRFToken: defaultToConfig2,
    adapter: defaultToConfig2,
    responseType: defaultToConfig2,
    xsrfCookieName: defaultToConfig2,
    xsrfHeaderName: defaultToConfig2,
    onUploadProgress: defaultToConfig2,
    onDownloadProgress: defaultToConfig2,
    decompress: defaultToConfig2,
    maxContentLength: defaultToConfig2,
    maxBodyLength: defaultToConfig2,
    beforeRedirect: defaultToConfig2,
    transport: defaultToConfig2,
    httpAgent: defaultToConfig2,
    httpsAgent: defaultToConfig2,
    cancelToken: defaultToConfig2,
    socketPath: defaultToConfig2,
    responseEncoding: defaultToConfig2,
    validateStatus: mergeDirectKeys,
    headers: (a, b, prop) => mergeDeepProperties(headersToObject(a), headersToObject(b), prop, true)
  };
  utils$1.forEach(Object.keys({ ...config1, ...config2 }), function computeConfigValue(prop) {
    const merge2 = mergeMap[prop] || mergeDeepProperties;
    const configValue = merge2(config1[prop], config2[prop], prop);
    utils$1.isUndefined(configValue) && merge2 !== mergeDirectKeys || (config[prop] = configValue);
  });
  return config;
}
const resolveConfig = (config) => {
  const newConfig = mergeConfig$1({}, config);
  let { data, withXSRFToken, xsrfHeaderName, xsrfCookieName, headers, auth } = newConfig;
  newConfig.headers = headers = AxiosHeaders$1.from(headers);
  newConfig.url = buildURL(buildFullPath(newConfig.baseURL, newConfig.url, newConfig.allowAbsoluteUrls), config.params, config.paramsSerializer);
  if (auth) {
    headers.set(
      "Authorization",
      "Basic " + btoa((auth.username || "") + ":" + (auth.password ? unescape(encodeURIComponent(auth.password)) : ""))
    );
  }
  if (utils$1.isFormData(data)) {
    if (platform.hasStandardBrowserEnv || platform.hasStandardBrowserWebWorkerEnv) {
      headers.setContentType(void 0);
    } else if (utils$1.isFunction(data.getHeaders)) {
      const formHeaders = data.getHeaders();
      const allowedHeaders = ["content-type", "content-length"];
      Object.entries(formHeaders).forEach(([key, val]) => {
        if (allowedHeaders.includes(key.toLowerCase())) {
          headers.set(key, val);
        }
      });
    }
  }
  if (platform.hasStandardBrowserEnv) {
    withXSRFToken && utils$1.isFunction(withXSRFToken) && (withXSRFToken = withXSRFToken(newConfig));
    if (withXSRFToken || withXSRFToken !== false && isURLSameOrigin(newConfig.url)) {
      const xsrfValue = xsrfHeaderName && xsrfCookieName && cookies.read(xsrfCookieName);
      if (xsrfValue) {
        headers.set(xsrfHeaderName, xsrfValue);
      }
    }
  }
  return newConfig;
};
const isXHRAdapterSupported = typeof XMLHttpRequest !== "undefined";
const xhrAdapter = isXHRAdapterSupported && function(config) {
  return new Promise(function dispatchXhrRequest(resolve, reject) {
    const _config = resolveConfig(config);
    let requestData = _config.data;
    const requestHeaders = AxiosHeaders$1.from(_config.headers).normalize();
    let { responseType, onUploadProgress, onDownloadProgress } = _config;
    let onCanceled;
    let uploadThrottled, downloadThrottled;
    let flushUpload, flushDownload;
    function done() {
      flushUpload && flushUpload();
      flushDownload && flushDownload();
      _config.cancelToken && _config.cancelToken.unsubscribe(onCanceled);
      _config.signal && _config.signal.removeEventListener("abort", onCanceled);
    }
    let request = new XMLHttpRequest();
    request.open(_config.method.toUpperCase(), _config.url, true);
    request.timeout = _config.timeout;
    function onloadend() {
      if (!request) {
        return;
      }
      const responseHeaders = AxiosHeaders$1.from(
        "getAllResponseHeaders" in request && request.getAllResponseHeaders()
      );
      const responseData = !responseType || responseType === "text" || responseType === "json" ? request.responseText : request.response;
      const response = {
        data: responseData,
        status: request.status,
        statusText: request.statusText,
        headers: responseHeaders,
        config,
        request
      };
      settle(function _resolve(value) {
        resolve(value);
        done();
      }, function _reject(err) {
        reject(err);
        done();
      }, response);
      request = null;
    }
    if ("onloadend" in request) {
      request.onloadend = onloadend;
    } else {
      request.onreadystatechange = function handleLoad() {
        if (!request || request.readyState !== 4) {
          return;
        }
        if (request.status === 0 && !(request.responseURL && request.responseURL.indexOf("file:") === 0)) {
          return;
        }
        setTimeout(onloadend);
      };
    }
    request.onabort = function handleAbort() {
      if (!request) {
        return;
      }
      reject(new AxiosError$1("Request aborted", AxiosError$1.ECONNABORTED, config, request));
      request = null;
    };
    request.onerror = function handleError(event) {
      const msg = event && event.message ? event.message : "Network Error";
      const err = new AxiosError$1(msg, AxiosError$1.ERR_NETWORK, config, request);
      err.event = event || null;
      reject(err);
      request = null;
    };
    request.ontimeout = function handleTimeout() {
      let timeoutErrorMessage = _config.timeout ? "timeout of " + _config.timeout + "ms exceeded" : "timeout exceeded";
      const transitional2 = _config.transitional || transitionalDefaults;
      if (_config.timeoutErrorMessage) {
        timeoutErrorMessage = _config.timeoutErrorMessage;
      }
      reject(new AxiosError$1(
        timeoutErrorMessage,
        transitional2.clarifyTimeoutError ? AxiosError$1.ETIMEDOUT : AxiosError$1.ECONNABORTED,
        config,
        request
      ));
      request = null;
    };
    requestData === void 0 && requestHeaders.setContentType(null);
    if ("setRequestHeader" in request) {
      utils$1.forEach(requestHeaders.toJSON(), function setRequestHeader(val, key) {
        request.setRequestHeader(key, val);
      });
    }
    if (!utils$1.isUndefined(_config.withCredentials)) {
      request.withCredentials = !!_config.withCredentials;
    }
    if (responseType && responseType !== "json") {
      request.responseType = _config.responseType;
    }
    if (onDownloadProgress) {
      [downloadThrottled, flushDownload] = progressEventReducer(onDownloadProgress, true);
      request.addEventListener("progress", downloadThrottled);
    }
    if (onUploadProgress && request.upload) {
      [uploadThrottled, flushUpload] = progressEventReducer(onUploadProgress);
      request.upload.addEventListener("progress", uploadThrottled);
      request.upload.addEventListener("loadend", flushUpload);
    }
    if (_config.cancelToken || _config.signal) {
      onCanceled = (cancel) => {
        if (!request) {
          return;
        }
        reject(!cancel || cancel.type ? new CanceledError$1(null, config, request) : cancel);
        request.abort();
        request = null;
      };
      _config.cancelToken && _config.cancelToken.subscribe(onCanceled);
      if (_config.signal) {
        _config.signal.aborted ? onCanceled() : _config.signal.addEventListener("abort", onCanceled);
      }
    }
    const protocol = parseProtocol(_config.url);
    if (protocol && platform.protocols.indexOf(protocol) === -1) {
      reject(new AxiosError$1("Unsupported protocol " + protocol + ":", AxiosError$1.ERR_BAD_REQUEST, config));
      return;
    }
    request.send(requestData || null);
  });
};
const composeSignals = (signals, timeout) => {
  const { length } = signals = signals ? signals.filter(Boolean) : [];
  if (timeout || length) {
    let controller = new AbortController();
    let aborted;
    const onabort = function(reason) {
      if (!aborted) {
        aborted = true;
        unsubscribe();
        const err = reason instanceof Error ? reason : this.reason;
        controller.abort(err instanceof AxiosError$1 ? err : new CanceledError$1(err instanceof Error ? err.message : err));
      }
    };
    let timer = timeout && setTimeout(() => {
      timer = null;
      onabort(new AxiosError$1(`timeout of ${timeout}ms exceeded`, AxiosError$1.ETIMEDOUT));
    }, timeout);
    const unsubscribe = () => {
      if (signals) {
        timer && clearTimeout(timer);
        timer = null;
        signals.forEach((signal2) => {
          signal2.unsubscribe ? signal2.unsubscribe(onabort) : signal2.removeEventListener("abort", onabort);
        });
        signals = null;
      }
    };
    signals.forEach((signal2) => signal2.addEventListener("abort", onabort));
    const { signal } = controller;
    signal.unsubscribe = () => utils$1.asap(unsubscribe);
    return signal;
  }
};
const streamChunk = function* (chunk, chunkSize) {
  let len = chunk.byteLength;
  if (len < chunkSize) {
    yield chunk;
    return;
  }
  let pos = 0;
  let end;
  while (pos < len) {
    end = pos + chunkSize;
    yield chunk.slice(pos, end);
    pos = end;
  }
};
const readBytes = async function* (iterable, chunkSize) {
  for await (const chunk of readStream(iterable)) {
    yield* streamChunk(chunk, chunkSize);
  }
};
const readStream = async function* (stream) {
  if (stream[Symbol.asyncIterator]) {
    yield* stream;
    return;
  }
  const reader = stream.getReader();
  try {
    for (; ; ) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }
      yield value;
    }
  } finally {
    await reader.cancel();
  }
};
const trackStream = (stream, chunkSize, onProgress, onFinish) => {
  const iterator2 = readBytes(stream, chunkSize);
  let bytes = 0;
  let done;
  let _onFinish = (e) => {
    if (!done) {
      done = true;
      onFinish && onFinish(e);
    }
  };
  return new ReadableStream({
    async pull(controller) {
      try {
        const { done: done2, value } = await iterator2.next();
        if (done2) {
          _onFinish();
          controller.close();
          return;
        }
        let len = value.byteLength;
        if (onProgress) {
          let loadedBytes = bytes += len;
          onProgress(loadedBytes);
        }
        controller.enqueue(new Uint8Array(value));
      } catch (err) {
        _onFinish(err);
        throw err;
      }
    },
    cancel(reason) {
      _onFinish(reason);
      return iterator2.return();
    }
  }, {
    highWaterMark: 2
  });
};
const DEFAULT_CHUNK_SIZE = 64 * 1024;
const { isFunction } = utils$1;
const globalFetchAPI = (({ Request, Response }) => ({
  Request,
  Response
}))(utils$1.global);
const {
  ReadableStream: ReadableStream$1,
  TextEncoder
} = utils$1.global;
const test = (fn, ...args) => {
  try {
    return !!fn(...args);
  } catch (e) {
    return false;
  }
};
const factory = (env) => {
  env = utils$1.merge.call({
    skipUndefined: true
  }, globalFetchAPI, env);
  const { fetch: envFetch, Request, Response } = env;
  const isFetchSupported = envFetch ? isFunction(envFetch) : typeof fetch === "function";
  const isRequestSupported = isFunction(Request);
  const isResponseSupported = isFunction(Response);
  if (!isFetchSupported) {
    return false;
  }
  const isReadableStreamSupported = isFetchSupported && isFunction(ReadableStream$1);
  const encodeText = isFetchSupported && (typeof TextEncoder === "function" ? /* @__PURE__ */ ((encoder) => (str) => encoder.encode(str))(new TextEncoder()) : async (str) => new Uint8Array(await new Request(str).arrayBuffer()));
  const supportsRequestStream = isRequestSupported && isReadableStreamSupported && test(() => {
    let duplexAccessed = false;
    const hasContentType = new Request(platform.origin, {
      body: new ReadableStream$1(),
      method: "POST",
      get duplex() {
        duplexAccessed = true;
        return "half";
      }
    }).headers.has("Content-Type");
    return duplexAccessed && !hasContentType;
  });
  const supportsResponseStream = isResponseSupported && isReadableStreamSupported && test(() => utils$1.isReadableStream(new Response("").body));
  const resolvers = {
    stream: supportsResponseStream && ((res) => res.body)
  };
  isFetchSupported && (() => {
    ["text", "arrayBuffer", "blob", "formData", "stream"].forEach((type) => {
      !resolvers[type] && (resolvers[type] = (res, config) => {
        let method = res && res[type];
        if (method) {
          return method.call(res);
        }
        throw new AxiosError$1(`Response type '${type}' is not supported`, AxiosError$1.ERR_NOT_SUPPORT, config);
      });
    });
  })();
  const getBodyLength = async (body) => {
    if (body == null) {
      return 0;
    }
    if (utils$1.isBlob(body)) {
      return body.size;
    }
    if (utils$1.isSpecCompliantForm(body)) {
      const _request = new Request(platform.origin, {
        method: "POST",
        body
      });
      return (await _request.arrayBuffer()).byteLength;
    }
    if (utils$1.isArrayBufferView(body) || utils$1.isArrayBuffer(body)) {
      return body.byteLength;
    }
    if (utils$1.isURLSearchParams(body)) {
      body = body + "";
    }
    if (utils$1.isString(body)) {
      return (await encodeText(body)).byteLength;
    }
  };
  const resolveBodyLength = async (headers, body) => {
    const length = utils$1.toFiniteNumber(headers.getContentLength());
    return length == null ? getBodyLength(body) : length;
  };
  return async (config) => {
    let {
      url,
      method,
      data,
      signal,
      cancelToken,
      timeout,
      onDownloadProgress,
      onUploadProgress,
      responseType,
      headers,
      withCredentials = "same-origin",
      fetchOptions
    } = resolveConfig(config);
    let _fetch = envFetch || fetch;
    responseType = responseType ? (responseType + "").toLowerCase() : "text";
    let composedSignal = composeSignals([signal, cancelToken && cancelToken.toAbortSignal()], timeout);
    let request = null;
    const unsubscribe = composedSignal && composedSignal.unsubscribe && (() => {
      composedSignal.unsubscribe();
    });
    let requestContentLength;
    try {
      if (onUploadProgress && supportsRequestStream && method !== "get" && method !== "head" && (requestContentLength = await resolveBodyLength(headers, data)) !== 0) {
        let _request = new Request(url, {
          method: "POST",
          body: data,
          duplex: "half"
        });
        let contentTypeHeader;
        if (utils$1.isFormData(data) && (contentTypeHeader = _request.headers.get("content-type"))) {
          headers.setContentType(contentTypeHeader);
        }
        if (_request.body) {
          const [onProgress, flush] = progressEventDecorator(
            requestContentLength,
            progressEventReducer(asyncDecorator(onUploadProgress))
          );
          data = trackStream(_request.body, DEFAULT_CHUNK_SIZE, onProgress, flush);
        }
      }
      if (!utils$1.isString(withCredentials)) {
        withCredentials = withCredentials ? "include" : "omit";
      }
      const isCredentialsSupported = isRequestSupported && "credentials" in Request.prototype;
      const resolvedOptions = {
        ...fetchOptions,
        signal: composedSignal,
        method: method.toUpperCase(),
        headers: headers.normalize().toJSON(),
        body: data,
        duplex: "half",
        credentials: isCredentialsSupported ? withCredentials : void 0
      };
      request = isRequestSupported && new Request(url, resolvedOptions);
      let response = await (isRequestSupported ? _fetch(request, fetchOptions) : _fetch(url, resolvedOptions));
      const isStreamResponse = supportsResponseStream && (responseType === "stream" || responseType === "response");
      if (supportsResponseStream && (onDownloadProgress || isStreamResponse && unsubscribe)) {
        const options = {};
        ["status", "statusText", "headers"].forEach((prop) => {
          options[prop] = response[prop];
        });
        const responseContentLength = utils$1.toFiniteNumber(response.headers.get("content-length"));
        const [onProgress, flush] = onDownloadProgress && progressEventDecorator(
          responseContentLength,
          progressEventReducer(asyncDecorator(onDownloadProgress), true)
        ) || [];
        response = new Response(
          trackStream(response.body, DEFAULT_CHUNK_SIZE, onProgress, () => {
            flush && flush();
            unsubscribe && unsubscribe();
          }),
          options
        );
      }
      responseType = responseType || "text";
      let responseData = await resolvers[utils$1.findKey(resolvers, responseType) || "text"](response, config);
      !isStreamResponse && unsubscribe && unsubscribe();
      return await new Promise((resolve, reject) => {
        settle(resolve, reject, {
          data: responseData,
          headers: AxiosHeaders$1.from(response.headers),
          status: response.status,
          statusText: response.statusText,
          config,
          request
        });
      });
    } catch (err) {
      unsubscribe && unsubscribe();
      if (err && err.name === "TypeError" && /Load failed|fetch/i.test(err.message)) {
        throw Object.assign(
          new AxiosError$1("Network Error", AxiosError$1.ERR_NETWORK, config, request),
          {
            cause: err.cause || err
          }
        );
      }
      throw AxiosError$1.from(err, err && err.code, config, request);
    }
  };
};
const seedCache = /* @__PURE__ */ new Map();
const getFetch = (config) => {
  let env = config && config.env || {};
  const { fetch: fetch2, Request, Response } = env;
  const seeds = [
    Request,
    Response,
    fetch2
  ];
  let len = seeds.length, i = len, seed, target, map = seedCache;
  while (i--) {
    seed = seeds[i];
    target = map.get(seed);
    target === void 0 && map.set(seed, target = i ? /* @__PURE__ */ new Map() : factory(env));
    map = target;
  }
  return target;
};
getFetch();
const knownAdapters = {
  http: httpAdapter,
  xhr: xhrAdapter,
  fetch: {
    get: getFetch
  }
};
utils$1.forEach(knownAdapters, (fn, value) => {
  if (fn) {
    try {
      Object.defineProperty(fn, "name", { value });
    } catch (e) {
    }
    Object.defineProperty(fn, "adapterName", { value });
  }
});
const renderReason = (reason) => `- ${reason}`;
const isResolvedHandle = (adapter) => utils$1.isFunction(adapter) || adapter === null || adapter === false;
function getAdapter$1(adapters2, config) {
  adapters2 = utils$1.isArray(adapters2) ? adapters2 : [adapters2];
  const { length } = adapters2;
  let nameOrAdapter;
  let adapter;
  const rejectedReasons = {};
  for (let i = 0; i < length; i++) {
    nameOrAdapter = adapters2[i];
    let id;
    adapter = nameOrAdapter;
    if (!isResolvedHandle(nameOrAdapter)) {
      adapter = knownAdapters[(id = String(nameOrAdapter)).toLowerCase()];
      if (adapter === void 0) {
        throw new AxiosError$1(`Unknown adapter '${id}'`);
      }
    }
    if (adapter && (utils$1.isFunction(adapter) || (adapter = adapter.get(config)))) {
      break;
    }
    rejectedReasons[id || "#" + i] = adapter;
  }
  if (!adapter) {
    const reasons = Object.entries(rejectedReasons).map(
      ([id, state]) => `adapter ${id} ` + (state === false ? "is not supported by the environment" : "is not available in the build")
    );
    let s = length ? reasons.length > 1 ? "since :\n" + reasons.map(renderReason).join("\n") : " " + renderReason(reasons[0]) : "as no adapter specified";
    throw new AxiosError$1(
      `There is no suitable adapter to dispatch the request ` + s,
      "ERR_NOT_SUPPORT"
    );
  }
  return adapter;
}
const adapters = {
  /**
   * Resolve an adapter from a list of adapter names or functions.
   * @type {Function}
   */
  getAdapter: getAdapter$1,
  /**
   * Exposes all known adapters
   * @type {Object<string, Function|Object>}
   */
  adapters: knownAdapters
};
function throwIfCancellationRequested(config) {
  if (config.cancelToken) {
    config.cancelToken.throwIfRequested();
  }
  if (config.signal && config.signal.aborted) {
    throw new CanceledError$1(null, config);
  }
}
function dispatchRequest(config) {
  throwIfCancellationRequested(config);
  config.headers = AxiosHeaders$1.from(config.headers);
  config.data = transformData.call(
    config,
    config.transformRequest
  );
  if (["post", "put", "patch"].indexOf(config.method) !== -1) {
    config.headers.setContentType("application/x-www-form-urlencoded", false);
  }
  const adapter = adapters.getAdapter(config.adapter || defaults$1.adapter, config);
  return adapter(config).then(function onAdapterResolution(response) {
    throwIfCancellationRequested(config);
    response.data = transformData.call(
      config,
      config.transformResponse,
      response
    );
    response.headers = AxiosHeaders$1.from(response.headers);
    return response;
  }, function onAdapterRejection(reason) {
    if (!isCancel$1(reason)) {
      throwIfCancellationRequested(config);
      if (reason && reason.response) {
        reason.response.data = transformData.call(
          config,
          config.transformResponse,
          reason.response
        );
        reason.response.headers = AxiosHeaders$1.from(reason.response.headers);
      }
    }
    return Promise.reject(reason);
  });
}
const VERSION$1 = "1.13.4";
const validators$1 = {};
["object", "boolean", "number", "function", "string", "symbol"].forEach((type, i) => {
  validators$1[type] = function validator2(thing) {
    return typeof thing === type || "a" + (i < 1 ? "n " : " ") + type;
  };
});
const deprecatedWarnings = {};
validators$1.transitional = function transitional(validator2, version2, message) {
  function formatMessage(opt, desc) {
    return "[Axios v" + VERSION$1 + "] Transitional option '" + opt + "'" + desc + (message ? ". " + message : "");
  }
  return (value, opt, opts) => {
    if (validator2 === false) {
      throw new AxiosError$1(
        formatMessage(opt, " has been removed" + (version2 ? " in " + version2 : "")),
        AxiosError$1.ERR_DEPRECATED
      );
    }
    if (version2 && !deprecatedWarnings[opt]) {
      deprecatedWarnings[opt] = true;
      console.warn(
        formatMessage(
          opt,
          " has been deprecated since v" + version2 + " and will be removed in the near future"
        )
      );
    }
    return validator2 ? validator2(value, opt, opts) : true;
  };
};
validators$1.spelling = function spelling(correctSpelling) {
  return (value, opt) => {
    console.warn(`${opt} is likely a misspelling of ${correctSpelling}`);
    return true;
  };
};
function assertOptions(options, schema, allowUnknown) {
  if (typeof options !== "object") {
    throw new AxiosError$1("options must be an object", AxiosError$1.ERR_BAD_OPTION_VALUE);
  }
  const keys = Object.keys(options);
  let i = keys.length;
  while (i-- > 0) {
    const opt = keys[i];
    const validator2 = schema[opt];
    if (validator2) {
      const value = options[opt];
      const result = value === void 0 || validator2(value, opt, options);
      if (result !== true) {
        throw new AxiosError$1("option " + opt + " must be " + result, AxiosError$1.ERR_BAD_OPTION_VALUE);
      }
      continue;
    }
    if (allowUnknown !== true) {
      throw new AxiosError$1("Unknown option " + opt, AxiosError$1.ERR_BAD_OPTION);
    }
  }
}
const validator = {
  assertOptions,
  validators: validators$1
};
const validators = validator.validators;
let Axios$1 = class Axios {
  constructor(instanceConfig) {
    this.defaults = instanceConfig || {};
    this.interceptors = {
      request: new InterceptorManager(),
      response: new InterceptorManager()
    };
  }
  /**
   * Dispatch a request
   *
   * @param {String|Object} configOrUrl The config specific for this request (merged with this.defaults)
   * @param {?Object} config
   *
   * @returns {Promise} The Promise to be fulfilled
   */
  async request(configOrUrl, config) {
    try {
      return await this._request(configOrUrl, config);
    } catch (err) {
      if (err instanceof Error) {
        let dummy = {};
        Error.captureStackTrace ? Error.captureStackTrace(dummy) : dummy = new Error();
        const stack = dummy.stack ? dummy.stack.replace(/^.+\n/, "") : "";
        try {
          if (!err.stack) {
            err.stack = stack;
          } else if (stack && !String(err.stack).endsWith(stack.replace(/^.+\n.+\n/, ""))) {
            err.stack += "\n" + stack;
          }
        } catch (e) {
        }
      }
      throw err;
    }
  }
  _request(configOrUrl, config) {
    if (typeof configOrUrl === "string") {
      config = config || {};
      config.url = configOrUrl;
    } else {
      config = configOrUrl || {};
    }
    config = mergeConfig$1(this.defaults, config);
    const { transitional: transitional2, paramsSerializer, headers } = config;
    if (transitional2 !== void 0) {
      validator.assertOptions(transitional2, {
        silentJSONParsing: validators.transitional(validators.boolean),
        forcedJSONParsing: validators.transitional(validators.boolean),
        clarifyTimeoutError: validators.transitional(validators.boolean)
      }, false);
    }
    if (paramsSerializer != null) {
      if (utils$1.isFunction(paramsSerializer)) {
        config.paramsSerializer = {
          serialize: paramsSerializer
        };
      } else {
        validator.assertOptions(paramsSerializer, {
          encode: validators.function,
          serialize: validators.function
        }, true);
      }
    }
    if (config.allowAbsoluteUrls !== void 0) ;
    else if (this.defaults.allowAbsoluteUrls !== void 0) {
      config.allowAbsoluteUrls = this.defaults.allowAbsoluteUrls;
    } else {
      config.allowAbsoluteUrls = true;
    }
    validator.assertOptions(config, {
      baseUrl: validators.spelling("baseURL"),
      withXsrfToken: validators.spelling("withXSRFToken")
    }, true);
    config.method = (config.method || this.defaults.method || "get").toLowerCase();
    let contextHeaders = headers && utils$1.merge(
      headers.common,
      headers[config.method]
    );
    headers && utils$1.forEach(
      ["delete", "get", "head", "post", "put", "patch", "common"],
      (method) => {
        delete headers[method];
      }
    );
    config.headers = AxiosHeaders$1.concat(contextHeaders, headers);
    const requestInterceptorChain = [];
    let synchronousRequestInterceptors = true;
    this.interceptors.request.forEach(function unshiftRequestInterceptors(interceptor) {
      if (typeof interceptor.runWhen === "function" && interceptor.runWhen(config) === false) {
        return;
      }
      synchronousRequestInterceptors = synchronousRequestInterceptors && interceptor.synchronous;
      requestInterceptorChain.unshift(interceptor.fulfilled, interceptor.rejected);
    });
    const responseInterceptorChain = [];
    this.interceptors.response.forEach(function pushResponseInterceptors(interceptor) {
      responseInterceptorChain.push(interceptor.fulfilled, interceptor.rejected);
    });
    let promise;
    let i = 0;
    let len;
    if (!synchronousRequestInterceptors) {
      const chain = [dispatchRequest.bind(this), void 0];
      chain.unshift(...requestInterceptorChain);
      chain.push(...responseInterceptorChain);
      len = chain.length;
      promise = Promise.resolve(config);
      while (i < len) {
        promise = promise.then(chain[i++], chain[i++]);
      }
      return promise;
    }
    len = requestInterceptorChain.length;
    let newConfig = config;
    while (i < len) {
      const onFulfilled = requestInterceptorChain[i++];
      const onRejected = requestInterceptorChain[i++];
      try {
        newConfig = onFulfilled(newConfig);
      } catch (error) {
        onRejected.call(this, error);
        break;
      }
    }
    try {
      promise = dispatchRequest.call(this, newConfig);
    } catch (error) {
      return Promise.reject(error);
    }
    i = 0;
    len = responseInterceptorChain.length;
    while (i < len) {
      promise = promise.then(responseInterceptorChain[i++], responseInterceptorChain[i++]);
    }
    return promise;
  }
  getUri(config) {
    config = mergeConfig$1(this.defaults, config);
    const fullPath = buildFullPath(config.baseURL, config.url, config.allowAbsoluteUrls);
    return buildURL(fullPath, config.params, config.paramsSerializer);
  }
};
utils$1.forEach(["delete", "get", "head", "options"], function forEachMethodNoData(method) {
  Axios$1.prototype[method] = function(url, config) {
    return this.request(mergeConfig$1(config || {}, {
      method,
      url,
      data: (config || {}).data
    }));
  };
});
utils$1.forEach(["post", "put", "patch"], function forEachMethodWithData(method) {
  function generateHTTPMethod(isForm) {
    return function httpMethod(url, data, config) {
      return this.request(mergeConfig$1(config || {}, {
        method,
        headers: isForm ? {
          "Content-Type": "multipart/form-data"
        } : {},
        url,
        data
      }));
    };
  }
  Axios$1.prototype[method] = generateHTTPMethod();
  Axios$1.prototype[method + "Form"] = generateHTTPMethod(true);
});
let CancelToken$1 = class CancelToken {
  constructor(executor) {
    if (typeof executor !== "function") {
      throw new TypeError("executor must be a function.");
    }
    let resolvePromise;
    this.promise = new Promise(function promiseExecutor(resolve) {
      resolvePromise = resolve;
    });
    const token = this;
    this.promise.then((cancel) => {
      if (!token._listeners) return;
      let i = token._listeners.length;
      while (i-- > 0) {
        token._listeners[i](cancel);
      }
      token._listeners = null;
    });
    this.promise.then = (onfulfilled) => {
      let _resolve;
      const promise = new Promise((resolve) => {
        token.subscribe(resolve);
        _resolve = resolve;
      }).then(onfulfilled);
      promise.cancel = function reject() {
        token.unsubscribe(_resolve);
      };
      return promise;
    };
    executor(function cancel(message, config, request) {
      if (token.reason) {
        return;
      }
      token.reason = new CanceledError$1(message, config, request);
      resolvePromise(token.reason);
    });
  }
  /**
   * Throws a `CanceledError` if cancellation has been requested.
   */
  throwIfRequested() {
    if (this.reason) {
      throw this.reason;
    }
  }
  /**
   * Subscribe to the cancel signal
   */
  subscribe(listener) {
    if (this.reason) {
      listener(this.reason);
      return;
    }
    if (this._listeners) {
      this._listeners.push(listener);
    } else {
      this._listeners = [listener];
    }
  }
  /**
   * Unsubscribe from the cancel signal
   */
  unsubscribe(listener) {
    if (!this._listeners) {
      return;
    }
    const index2 = this._listeners.indexOf(listener);
    if (index2 !== -1) {
      this._listeners.splice(index2, 1);
    }
  }
  toAbortSignal() {
    const controller = new AbortController();
    const abort = (err) => {
      controller.abort(err);
    };
    this.subscribe(abort);
    controller.signal.unsubscribe = () => this.unsubscribe(abort);
    return controller.signal;
  }
  /**
   * Returns an object that contains a new `CancelToken` and a function that, when called,
   * cancels the `CancelToken`.
   */
  static source() {
    let cancel;
    const token = new CancelToken(function executor(c) {
      cancel = c;
    });
    return {
      token,
      cancel
    };
  }
};
function spread$1(callback) {
  return function wrap(arr) {
    return callback.apply(null, arr);
  };
}
function isAxiosError$1(payload) {
  return utils$1.isObject(payload) && payload.isAxiosError === true;
}
const HttpStatusCode$1 = {
  Continue: 100,
  SwitchingProtocols: 101,
  Processing: 102,
  EarlyHints: 103,
  Ok: 200,
  Created: 201,
  Accepted: 202,
  NonAuthoritativeInformation: 203,
  NoContent: 204,
  ResetContent: 205,
  PartialContent: 206,
  MultiStatus: 207,
  AlreadyReported: 208,
  ImUsed: 226,
  MultipleChoices: 300,
  MovedPermanently: 301,
  Found: 302,
  SeeOther: 303,
  NotModified: 304,
  UseProxy: 305,
  Unused: 306,
  TemporaryRedirect: 307,
  PermanentRedirect: 308,
  BadRequest: 400,
  Unauthorized: 401,
  PaymentRequired: 402,
  Forbidden: 403,
  NotFound: 404,
  MethodNotAllowed: 405,
  NotAcceptable: 406,
  ProxyAuthenticationRequired: 407,
  RequestTimeout: 408,
  Conflict: 409,
  Gone: 410,
  LengthRequired: 411,
  PreconditionFailed: 412,
  PayloadTooLarge: 413,
  UriTooLong: 414,
  UnsupportedMediaType: 415,
  RangeNotSatisfiable: 416,
  ExpectationFailed: 417,
  ImATeapot: 418,
  MisdirectedRequest: 421,
  UnprocessableEntity: 422,
  Locked: 423,
  FailedDependency: 424,
  TooEarly: 425,
  UpgradeRequired: 426,
  PreconditionRequired: 428,
  TooManyRequests: 429,
  RequestHeaderFieldsTooLarge: 431,
  UnavailableForLegalReasons: 451,
  InternalServerError: 500,
  NotImplemented: 501,
  BadGateway: 502,
  ServiceUnavailable: 503,
  GatewayTimeout: 504,
  HttpVersionNotSupported: 505,
  VariantAlsoNegotiates: 506,
  InsufficientStorage: 507,
  LoopDetected: 508,
  NotExtended: 510,
  NetworkAuthenticationRequired: 511,
  WebServerIsDown: 521,
  ConnectionTimedOut: 522,
  OriginIsUnreachable: 523,
  TimeoutOccurred: 524,
  SslHandshakeFailed: 525,
  InvalidSslCertificate: 526
};
Object.entries(HttpStatusCode$1).forEach(([key, value]) => {
  HttpStatusCode$1[value] = key;
});
function createInstance(defaultConfig) {
  const context = new Axios$1(defaultConfig);
  const instance = bind(Axios$1.prototype.request, context);
  utils$1.extend(instance, Axios$1.prototype, context, { allOwnKeys: true });
  utils$1.extend(instance, context, null, { allOwnKeys: true });
  instance.create = function create(instanceConfig) {
    return createInstance(mergeConfig$1(defaultConfig, instanceConfig));
  };
  return instance;
}
const axios = createInstance(defaults$1);
axios.Axios = Axios$1;
axios.CanceledError = CanceledError$1;
axios.CancelToken = CancelToken$1;
axios.isCancel = isCancel$1;
axios.VERSION = VERSION$1;
axios.toFormData = toFormData$1;
axios.AxiosError = AxiosError$1;
axios.Cancel = axios.CanceledError;
axios.all = function all(promises) {
  return Promise.all(promises);
};
axios.spread = spread$1;
axios.isAxiosError = isAxiosError$1;
axios.mergeConfig = mergeConfig$1;
axios.AxiosHeaders = AxiosHeaders$1;
axios.formToJSON = (thing) => formDataToJSON(utils$1.isHTMLForm(thing) ? new FormData(thing) : thing);
axios.getAdapter = adapters.getAdapter;
axios.HttpStatusCode = HttpStatusCode$1;
axios.default = axios;
const {
  Axios: Axios2,
  AxiosError: AxiosError2,
  CanceledError: CanceledError2,
  isCancel,
  CancelToken: CancelToken2,
  VERSION,
  all: all2,
  Cancel,
  isAxiosError,
  spread,
  toFormData,
  AxiosHeaders: AxiosHeaders2,
  HttpStatusCode,
  formToJSON,
  getAdapter,
  mergeConfig
} = axios;
var vuedraggable_umd = { exports: {} };
const require$$0 = /* @__PURE__ */ getAugmentedNamespace(vue_runtime_esmBundler);
/**!
 * Sortable 1.14.0
 * @author	RubaXa   <trash@rubaxa.org>
 * @author	owenm    <owen23355@gmail.com>
 * @license MIT
 */
function ownKeys(object, enumerableOnly) {
  var keys = Object.keys(object);
  if (Object.getOwnPropertySymbols) {
    var symbols = Object.getOwnPropertySymbols(object);
    if (enumerableOnly) {
      symbols = symbols.filter(function(sym) {
        return Object.getOwnPropertyDescriptor(object, sym).enumerable;
      });
    }
    keys.push.apply(keys, symbols);
  }
  return keys;
}
function _objectSpread2(target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i] != null ? arguments[i] : {};
    if (i % 2) {
      ownKeys(Object(source), true).forEach(function(key) {
        _defineProperty(target, key, source[key]);
      });
    } else if (Object.getOwnPropertyDescriptors) {
      Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
    } else {
      ownKeys(Object(source)).forEach(function(key) {
        Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
      });
    }
  }
  return target;
}
function _typeof(obj) {
  "@babel/helpers - typeof";
  if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
    _typeof = function(obj2) {
      return typeof obj2;
    };
  } else {
    _typeof = function(obj2) {
      return obj2 && typeof Symbol === "function" && obj2.constructor === Symbol && obj2 !== Symbol.prototype ? "symbol" : typeof obj2;
    };
  }
  return _typeof(obj);
}
function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }
  return obj;
}
function _extends() {
  _extends = Object.assign || function(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];
      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }
    return target;
  };
  return _extends.apply(this, arguments);
}
function _objectWithoutPropertiesLoose(source, excluded) {
  if (source == null) return {};
  var target = {};
  var sourceKeys = Object.keys(source);
  var key, i;
  for (i = 0; i < sourceKeys.length; i++) {
    key = sourceKeys[i];
    if (excluded.indexOf(key) >= 0) continue;
    target[key] = source[key];
  }
  return target;
}
function _objectWithoutProperties(source, excluded) {
  if (source == null) return {};
  var target = _objectWithoutPropertiesLoose(source, excluded);
  var key, i;
  if (Object.getOwnPropertySymbols) {
    var sourceSymbolKeys = Object.getOwnPropertySymbols(source);
    for (i = 0; i < sourceSymbolKeys.length; i++) {
      key = sourceSymbolKeys[i];
      if (excluded.indexOf(key) >= 0) continue;
      if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue;
      target[key] = source[key];
    }
  }
  return target;
}
function _toConsumableArray(arr) {
  return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread();
}
function _arrayWithoutHoles(arr) {
  if (Array.isArray(arr)) return _arrayLikeToArray(arr);
}
function _iterableToArray(iter) {
  if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter);
}
function _unsupportedIterableToArray(o, minLen) {
  if (!o) return;
  if (typeof o === "string") return _arrayLikeToArray(o, minLen);
  var n = Object.prototype.toString.call(o).slice(8, -1);
  if (n === "Object" && o.constructor) n = o.constructor.name;
  if (n === "Map" || n === "Set") return Array.from(o);
  if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
}
function _arrayLikeToArray(arr, len) {
  if (len == null || len > arr.length) len = arr.length;
  for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];
  return arr2;
}
function _nonIterableSpread() {
  throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
var version = "1.14.0";
function userAgent(pattern) {
  if (typeof window !== "undefined" && window.navigator) {
    return !!/* @__PURE__ */ navigator.userAgent.match(pattern);
  }
}
var IE11OrLess = userAgent(/(?:Trident.*rv[ :]?11\.|msie|iemobile|Windows Phone)/i);
var Edge = userAgent(/Edge/i);
var FireFox = userAgent(/firefox/i);
var Safari = userAgent(/safari/i) && !userAgent(/chrome/i) && !userAgent(/android/i);
var IOS = userAgent(/iP(ad|od|hone)/i);
var ChromeForAndroid = userAgent(/chrome/i) && userAgent(/android/i);
var captureMode = {
  capture: false,
  passive: false
};
function on(el, event, fn) {
  el.addEventListener(event, fn, !IE11OrLess && captureMode);
}
function off(el, event, fn) {
  el.removeEventListener(event, fn, !IE11OrLess && captureMode);
}
function matches(el, selector) {
  if (!selector) return;
  selector[0] === ">" && (selector = selector.substring(1));
  if (el) {
    try {
      if (el.matches) {
        return el.matches(selector);
      } else if (el.msMatchesSelector) {
        return el.msMatchesSelector(selector);
      } else if (el.webkitMatchesSelector) {
        return el.webkitMatchesSelector(selector);
      }
    } catch (_) {
      return false;
    }
  }
  return false;
}
function getParentOrHost(el) {
  return el.host && el !== document && el.host.nodeType ? el.host : el.parentNode;
}
function closest(el, selector, ctx, includeCTX) {
  if (el) {
    ctx = ctx || document;
    do {
      if (selector != null && (selector[0] === ">" ? el.parentNode === ctx && matches(el, selector) : matches(el, selector)) || includeCTX && el === ctx) {
        return el;
      }
      if (el === ctx) break;
    } while (el = getParentOrHost(el));
  }
  return null;
}
var R_SPACE = /\s+/g;
function toggleClass(el, name, state) {
  if (el && name) {
    if (el.classList) {
      el.classList[state ? "add" : "remove"](name);
    } else {
      var className = (" " + el.className + " ").replace(R_SPACE, " ").replace(" " + name + " ", " ");
      el.className = (className + (state ? " " + name : "")).replace(R_SPACE, " ");
    }
  }
}
function css(el, prop, val) {
  var style = el && el.style;
  if (style) {
    if (val === void 0) {
      if (document.defaultView && document.defaultView.getComputedStyle) {
        val = document.defaultView.getComputedStyle(el, "");
      } else if (el.currentStyle) {
        val = el.currentStyle;
      }
      return prop === void 0 ? val : val[prop];
    } else {
      if (!(prop in style) && prop.indexOf("webkit") === -1) {
        prop = "-webkit-" + prop;
      }
      style[prop] = val + (typeof val === "string" ? "" : "px");
    }
  }
}
function matrix(el, selfOnly) {
  var appliedTransforms = "";
  if (typeof el === "string") {
    appliedTransforms = el;
  } else {
    do {
      var transform = css(el, "transform");
      if (transform && transform !== "none") {
        appliedTransforms = transform + " " + appliedTransforms;
      }
    } while (!selfOnly && (el = el.parentNode));
  }
  var matrixFn = window.DOMMatrix || window.WebKitCSSMatrix || window.CSSMatrix || window.MSCSSMatrix;
  return matrixFn && new matrixFn(appliedTransforms);
}
function find(ctx, tagName, iterator2) {
  if (ctx) {
    var list = ctx.getElementsByTagName(tagName), i = 0, n = list.length;
    if (iterator2) {
      for (; i < n; i++) {
        iterator2(list[i], i);
      }
    }
    return list;
  }
  return [];
}
function getWindowScrollingElement() {
  var scrollingElement = document.scrollingElement;
  if (scrollingElement) {
    return scrollingElement;
  } else {
    return document.documentElement;
  }
}
function getRect(el, relativeToContainingBlock, relativeToNonStaticParent, undoScale, container) {
  if (!el.getBoundingClientRect && el !== window) return;
  var elRect, top, left, bottom, right, height, width;
  if (el !== window && el.parentNode && el !== getWindowScrollingElement()) {
    elRect = el.getBoundingClientRect();
    top = elRect.top;
    left = elRect.left;
    bottom = elRect.bottom;
    right = elRect.right;
    height = elRect.height;
    width = elRect.width;
  } else {
    top = 0;
    left = 0;
    bottom = window.innerHeight;
    right = window.innerWidth;
    height = window.innerHeight;
    width = window.innerWidth;
  }
  if ((relativeToContainingBlock || relativeToNonStaticParent) && el !== window) {
    container = container || el.parentNode;
    if (!IE11OrLess) {
      do {
        if (container && container.getBoundingClientRect && (css(container, "transform") !== "none" || relativeToNonStaticParent && css(container, "position") !== "static")) {
          var containerRect = container.getBoundingClientRect();
          top -= containerRect.top + parseInt(css(container, "border-top-width"));
          left -= containerRect.left + parseInt(css(container, "border-left-width"));
          bottom = top + elRect.height;
          right = left + elRect.width;
          break;
        }
      } while (container = container.parentNode);
    }
  }
  if (undoScale && el !== window) {
    var elMatrix = matrix(container || el), scaleX = elMatrix && elMatrix.a, scaleY = elMatrix && elMatrix.d;
    if (elMatrix) {
      top /= scaleY;
      left /= scaleX;
      width /= scaleX;
      height /= scaleY;
      bottom = top + height;
      right = left + width;
    }
  }
  return {
    top,
    left,
    bottom,
    right,
    width,
    height
  };
}
function isScrolledPast(el, elSide, parentSide) {
  var parent = getParentAutoScrollElement(el, true), elSideVal = getRect(el)[elSide];
  while (parent) {
    var parentSideVal = getRect(parent)[parentSide], visible = void 0;
    {
      visible = elSideVal >= parentSideVal;
    }
    if (!visible) return parent;
    if (parent === getWindowScrollingElement()) break;
    parent = getParentAutoScrollElement(parent, false);
  }
  return false;
}
function getChild(el, childNum, options, includeDragEl) {
  var currentChild = 0, i = 0, children = el.children;
  while (i < children.length) {
    if (children[i].style.display !== "none" && children[i] !== Sortable.ghost && (includeDragEl || children[i] !== Sortable.dragged) && closest(children[i], options.draggable, el, false)) {
      if (currentChild === childNum) {
        return children[i];
      }
      currentChild++;
    }
    i++;
  }
  return null;
}
function lastChild(el, selector) {
  var last = el.lastElementChild;
  while (last && (last === Sortable.ghost || css(last, "display") === "none" || selector && !matches(last, selector))) {
    last = last.previousElementSibling;
  }
  return last || null;
}
function index(el, selector) {
  var index2 = 0;
  if (!el || !el.parentNode) {
    return -1;
  }
  while (el = el.previousElementSibling) {
    if (el.nodeName.toUpperCase() !== "TEMPLATE" && el !== Sortable.clone && (!selector || matches(el, selector))) {
      index2++;
    }
  }
  return index2;
}
function getRelativeScrollOffset(el) {
  var offsetLeft = 0, offsetTop = 0, winScroller = getWindowScrollingElement();
  if (el) {
    do {
      var elMatrix = matrix(el), scaleX = elMatrix.a, scaleY = elMatrix.d;
      offsetLeft += el.scrollLeft * scaleX;
      offsetTop += el.scrollTop * scaleY;
    } while (el !== winScroller && (el = el.parentNode));
  }
  return [offsetLeft, offsetTop];
}
function indexOfObject(arr, obj) {
  for (var i in arr) {
    if (!arr.hasOwnProperty(i)) continue;
    for (var key in obj) {
      if (obj.hasOwnProperty(key) && obj[key] === arr[i][key]) return Number(i);
    }
  }
  return -1;
}
function getParentAutoScrollElement(el, includeSelf) {
  if (!el || !el.getBoundingClientRect) return getWindowScrollingElement();
  var elem = el;
  var gotSelf = false;
  do {
    if (elem.clientWidth < elem.scrollWidth || elem.clientHeight < elem.scrollHeight) {
      var elemCSS = css(elem);
      if (elem.clientWidth < elem.scrollWidth && (elemCSS.overflowX == "auto" || elemCSS.overflowX == "scroll") || elem.clientHeight < elem.scrollHeight && (elemCSS.overflowY == "auto" || elemCSS.overflowY == "scroll")) {
        if (!elem.getBoundingClientRect || elem === document.body) return getWindowScrollingElement();
        if (gotSelf || includeSelf) return elem;
        gotSelf = true;
      }
    }
  } while (elem = elem.parentNode);
  return getWindowScrollingElement();
}
function extend(dst, src) {
  if (dst && src) {
    for (var key in src) {
      if (src.hasOwnProperty(key)) {
        dst[key] = src[key];
      }
    }
  }
  return dst;
}
function isRectEqual(rect1, rect2) {
  return Math.round(rect1.top) === Math.round(rect2.top) && Math.round(rect1.left) === Math.round(rect2.left) && Math.round(rect1.height) === Math.round(rect2.height) && Math.round(rect1.width) === Math.round(rect2.width);
}
var _throttleTimeout;
function throttle(callback, ms) {
  return function() {
    if (!_throttleTimeout) {
      var args = arguments, _this = this;
      if (args.length === 1) {
        callback.call(_this, args[0]);
      } else {
        callback.apply(_this, args);
      }
      _throttleTimeout = setTimeout(function() {
        _throttleTimeout = void 0;
      }, ms);
    }
  };
}
function cancelThrottle() {
  clearTimeout(_throttleTimeout);
  _throttleTimeout = void 0;
}
function scrollBy(el, x, y) {
  el.scrollLeft += x;
  el.scrollTop += y;
}
function clone(el) {
  var Polymer = window.Polymer;
  var $ = window.jQuery || window.Zepto;
  if (Polymer && Polymer.dom) {
    return Polymer.dom(el).cloneNode(true);
  } else if ($) {
    return $(el).clone(true)[0];
  } else {
    return el.cloneNode(true);
  }
}
function setRect(el, rect) {
  css(el, "position", "absolute");
  css(el, "top", rect.top);
  css(el, "left", rect.left);
  css(el, "width", rect.width);
  css(el, "height", rect.height);
}
function unsetRect(el) {
  css(el, "position", "");
  css(el, "top", "");
  css(el, "left", "");
  css(el, "width", "");
  css(el, "height", "");
}
var expando = "Sortable" + (/* @__PURE__ */ new Date()).getTime();
function AnimationStateManager() {
  var animationStates = [], animationCallbackId;
  return {
    captureAnimationState: function captureAnimationState() {
      animationStates = [];
      if (!this.options.animation) return;
      var children = [].slice.call(this.el.children);
      children.forEach(function(child) {
        if (css(child, "display") === "none" || child === Sortable.ghost) return;
        animationStates.push({
          target: child,
          rect: getRect(child)
        });
        var fromRect = _objectSpread2({}, animationStates[animationStates.length - 1].rect);
        if (child.thisAnimationDuration) {
          var childMatrix = matrix(child, true);
          if (childMatrix) {
            fromRect.top -= childMatrix.f;
            fromRect.left -= childMatrix.e;
          }
        }
        child.fromRect = fromRect;
      });
    },
    addAnimationState: function addAnimationState(state) {
      animationStates.push(state);
    },
    removeAnimationState: function removeAnimationState(target) {
      animationStates.splice(indexOfObject(animationStates, {
        target
      }), 1);
    },
    animateAll: function animateAll(callback) {
      var _this = this;
      if (!this.options.animation) {
        clearTimeout(animationCallbackId);
        if (typeof callback === "function") callback();
        return;
      }
      var animating = false, animationTime = 0;
      animationStates.forEach(function(state) {
        var time = 0, target = state.target, fromRect = target.fromRect, toRect = getRect(target), prevFromRect = target.prevFromRect, prevToRect = target.prevToRect, animatingRect = state.rect, targetMatrix = matrix(target, true);
        if (targetMatrix) {
          toRect.top -= targetMatrix.f;
          toRect.left -= targetMatrix.e;
        }
        target.toRect = toRect;
        if (target.thisAnimationDuration) {
          if (isRectEqual(prevFromRect, toRect) && !isRectEqual(fromRect, toRect) && // Make sure animatingRect is on line between toRect & fromRect
          (animatingRect.top - toRect.top) / (animatingRect.left - toRect.left) === (fromRect.top - toRect.top) / (fromRect.left - toRect.left)) {
            time = calculateRealTime(animatingRect, prevFromRect, prevToRect, _this.options);
          }
        }
        if (!isRectEqual(toRect, fromRect)) {
          target.prevFromRect = fromRect;
          target.prevToRect = toRect;
          if (!time) {
            time = _this.options.animation;
          }
          _this.animate(target, animatingRect, toRect, time);
        }
        if (time) {
          animating = true;
          animationTime = Math.max(animationTime, time);
          clearTimeout(target.animationResetTimer);
          target.animationResetTimer = setTimeout(function() {
            target.animationTime = 0;
            target.prevFromRect = null;
            target.fromRect = null;
            target.prevToRect = null;
            target.thisAnimationDuration = null;
          }, time);
          target.thisAnimationDuration = time;
        }
      });
      clearTimeout(animationCallbackId);
      if (!animating) {
        if (typeof callback === "function") callback();
      } else {
        animationCallbackId = setTimeout(function() {
          if (typeof callback === "function") callback();
        }, animationTime);
      }
      animationStates = [];
    },
    animate: function animate(target, currentRect, toRect, duration) {
      if (duration) {
        css(target, "transition", "");
        css(target, "transform", "");
        var elMatrix = matrix(this.el), scaleX = elMatrix && elMatrix.a, scaleY = elMatrix && elMatrix.d, translateX = (currentRect.left - toRect.left) / (scaleX || 1), translateY = (currentRect.top - toRect.top) / (scaleY || 1);
        target.animatingX = !!translateX;
        target.animatingY = !!translateY;
        css(target, "transform", "translate3d(" + translateX + "px," + translateY + "px,0)");
        this.forRepaintDummy = repaint(target);
        css(target, "transition", "transform " + duration + "ms" + (this.options.easing ? " " + this.options.easing : ""));
        css(target, "transform", "translate3d(0,0,0)");
        typeof target.animated === "number" && clearTimeout(target.animated);
        target.animated = setTimeout(function() {
          css(target, "transition", "");
          css(target, "transform", "");
          target.animated = false;
          target.animatingX = false;
          target.animatingY = false;
        }, duration);
      }
    }
  };
}
function repaint(target) {
  return target.offsetWidth;
}
function calculateRealTime(animatingRect, fromRect, toRect, options) {
  return Math.sqrt(Math.pow(fromRect.top - animatingRect.top, 2) + Math.pow(fromRect.left - animatingRect.left, 2)) / Math.sqrt(Math.pow(fromRect.top - toRect.top, 2) + Math.pow(fromRect.left - toRect.left, 2)) * options.animation;
}
var plugins = [];
var defaults = {
  initializeByDefault: true
};
var PluginManager = {
  mount: function mount(plugin) {
    for (var option2 in defaults) {
      if (defaults.hasOwnProperty(option2) && !(option2 in plugin)) {
        plugin[option2] = defaults[option2];
      }
    }
    plugins.forEach(function(p) {
      if (p.pluginName === plugin.pluginName) {
        throw "Sortable: Cannot mount plugin ".concat(plugin.pluginName, " more than once");
      }
    });
    plugins.push(plugin);
  },
  pluginEvent: function pluginEvent(eventName, sortable, evt) {
    var _this = this;
    this.eventCanceled = false;
    evt.cancel = function() {
      _this.eventCanceled = true;
    };
    var eventNameGlobal = eventName + "Global";
    plugins.forEach(function(plugin) {
      if (!sortable[plugin.pluginName]) return;
      if (sortable[plugin.pluginName][eventNameGlobal]) {
        sortable[plugin.pluginName][eventNameGlobal](_objectSpread2({
          sortable
        }, evt));
      }
      if (sortable.options[plugin.pluginName] && sortable[plugin.pluginName][eventName]) {
        sortable[plugin.pluginName][eventName](_objectSpread2({
          sortable
        }, evt));
      }
    });
  },
  initializePlugins: function initializePlugins(sortable, el, defaults2, options) {
    plugins.forEach(function(plugin) {
      var pluginName = plugin.pluginName;
      if (!sortable.options[pluginName] && !plugin.initializeByDefault) return;
      var initialized = new plugin(sortable, el, sortable.options);
      initialized.sortable = sortable;
      initialized.options = sortable.options;
      sortable[pluginName] = initialized;
      _extends(defaults2, initialized.defaults);
    });
    for (var option2 in sortable.options) {
      if (!sortable.options.hasOwnProperty(option2)) continue;
      var modified = this.modifyOption(sortable, option2, sortable.options[option2]);
      if (typeof modified !== "undefined") {
        sortable.options[option2] = modified;
      }
    }
  },
  getEventProperties: function getEventProperties(name, sortable) {
    var eventProperties = {};
    plugins.forEach(function(plugin) {
      if (typeof plugin.eventProperties !== "function") return;
      _extends(eventProperties, plugin.eventProperties.call(sortable[plugin.pluginName], name));
    });
    return eventProperties;
  },
  modifyOption: function modifyOption(sortable, name, value) {
    var modifiedValue;
    plugins.forEach(function(plugin) {
      if (!sortable[plugin.pluginName]) return;
      if (plugin.optionListeners && typeof plugin.optionListeners[name] === "function") {
        modifiedValue = plugin.optionListeners[name].call(sortable[plugin.pluginName], value);
      }
    });
    return modifiedValue;
  }
};
function dispatchEvent(_ref) {
  var sortable = _ref.sortable, rootEl2 = _ref.rootEl, name = _ref.name, targetEl = _ref.targetEl, cloneEl2 = _ref.cloneEl, toEl = _ref.toEl, fromEl = _ref.fromEl, oldIndex2 = _ref.oldIndex, newIndex2 = _ref.newIndex, oldDraggableIndex2 = _ref.oldDraggableIndex, newDraggableIndex2 = _ref.newDraggableIndex, originalEvent = _ref.originalEvent, putSortable2 = _ref.putSortable, extraEventProperties = _ref.extraEventProperties;
  sortable = sortable || rootEl2 && rootEl2[expando];
  if (!sortable) return;
  var evt, options = sortable.options, onName = "on" + name.charAt(0).toUpperCase() + name.substr(1);
  if (window.CustomEvent && !IE11OrLess && !Edge) {
    evt = new CustomEvent(name, {
      bubbles: true,
      cancelable: true
    });
  } else {
    evt = document.createEvent("Event");
    evt.initEvent(name, true, true);
  }
  evt.to = toEl || rootEl2;
  evt.from = fromEl || rootEl2;
  evt.item = targetEl || rootEl2;
  evt.clone = cloneEl2;
  evt.oldIndex = oldIndex2;
  evt.newIndex = newIndex2;
  evt.oldDraggableIndex = oldDraggableIndex2;
  evt.newDraggableIndex = newDraggableIndex2;
  evt.originalEvent = originalEvent;
  evt.pullMode = putSortable2 ? putSortable2.lastPutMode : void 0;
  var allEventProperties = _objectSpread2(_objectSpread2({}, extraEventProperties), PluginManager.getEventProperties(name, sortable));
  for (var option2 in allEventProperties) {
    evt[option2] = allEventProperties[option2];
  }
  if (rootEl2) {
    rootEl2.dispatchEvent(evt);
  }
  if (options[onName]) {
    options[onName].call(sortable, evt);
  }
}
var _excluded = ["evt"];
var pluginEvent2 = function pluginEvent3(eventName, sortable) {
  var _ref = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {}, originalEvent = _ref.evt, data = _objectWithoutProperties(_ref, _excluded);
  PluginManager.pluginEvent.bind(Sortable)(eventName, sortable, _objectSpread2({
    dragEl,
    parentEl,
    ghostEl,
    rootEl,
    nextEl,
    lastDownEl,
    cloneEl,
    cloneHidden,
    dragStarted: moved,
    putSortable,
    activeSortable: Sortable.active,
    originalEvent,
    oldIndex,
    oldDraggableIndex,
    newIndex,
    newDraggableIndex,
    hideGhostForTarget: _hideGhostForTarget,
    unhideGhostForTarget: _unhideGhostForTarget,
    cloneNowHidden: function cloneNowHidden() {
      cloneHidden = true;
    },
    cloneNowShown: function cloneNowShown() {
      cloneHidden = false;
    },
    dispatchSortableEvent: function dispatchSortableEvent(name) {
      _dispatchEvent({
        sortable,
        name,
        originalEvent
      });
    }
  }, data));
};
function _dispatchEvent(info) {
  dispatchEvent(_objectSpread2({
    putSortable,
    cloneEl,
    targetEl: dragEl,
    rootEl,
    oldIndex,
    oldDraggableIndex,
    newIndex,
    newDraggableIndex
  }, info));
}
var dragEl, parentEl, ghostEl, rootEl, nextEl, lastDownEl, cloneEl, cloneHidden, oldIndex, newIndex, oldDraggableIndex, newDraggableIndex, activeGroup, putSortable, awaitingDragStarted = false, ignoreNextClick = false, sortables = [], tapEvt, touchEvt, lastDx, lastDy, tapDistanceLeft, tapDistanceTop, moved, lastTarget, lastDirection, pastFirstInvertThresh = false, isCircumstantialInvert = false, targetMoveDistance, ghostRelativeParent, ghostRelativeParentInitialScroll = [], _silent = false, savedInputChecked = [];
var documentExists = typeof document !== "undefined", PositionGhostAbsolutely = IOS, CSSFloatProperty = Edge || IE11OrLess ? "cssFloat" : "float", supportDraggable = documentExists && !ChromeForAndroid && !IOS && "draggable" in document.createElement("div"), supportCssPointerEvents = function() {
  if (!documentExists) return;
  if (IE11OrLess) {
    return false;
  }
  var el = document.createElement("x");
  el.style.cssText = "pointer-events:auto";
  return el.style.pointerEvents === "auto";
}(), _detectDirection = function _detectDirection2(el, options) {
  var elCSS = css(el), elWidth = parseInt(elCSS.width) - parseInt(elCSS.paddingLeft) - parseInt(elCSS.paddingRight) - parseInt(elCSS.borderLeftWidth) - parseInt(elCSS.borderRightWidth), child1 = getChild(el, 0, options), child2 = getChild(el, 1, options), firstChildCSS = child1 && css(child1), secondChildCSS = child2 && css(child2), firstChildWidth = firstChildCSS && parseInt(firstChildCSS.marginLeft) + parseInt(firstChildCSS.marginRight) + getRect(child1).width, secondChildWidth = secondChildCSS && parseInt(secondChildCSS.marginLeft) + parseInt(secondChildCSS.marginRight) + getRect(child2).width;
  if (elCSS.display === "flex") {
    return elCSS.flexDirection === "column" || elCSS.flexDirection === "column-reverse" ? "vertical" : "horizontal";
  }
  if (elCSS.display === "grid") {
    return elCSS.gridTemplateColumns.split(" ").length <= 1 ? "vertical" : "horizontal";
  }
  if (child1 && firstChildCSS["float"] && firstChildCSS["float"] !== "none") {
    var touchingSideChild2 = firstChildCSS["float"] === "left" ? "left" : "right";
    return child2 && (secondChildCSS.clear === "both" || secondChildCSS.clear === touchingSideChild2) ? "vertical" : "horizontal";
  }
  return child1 && (firstChildCSS.display === "block" || firstChildCSS.display === "flex" || firstChildCSS.display === "table" || firstChildCSS.display === "grid" || firstChildWidth >= elWidth && elCSS[CSSFloatProperty] === "none" || child2 && elCSS[CSSFloatProperty] === "none" && firstChildWidth + secondChildWidth > elWidth) ? "vertical" : "horizontal";
}, _dragElInRowColumn = function _dragElInRowColumn2(dragRect, targetRect, vertical) {
  var dragElS1Opp = vertical ? dragRect.left : dragRect.top, dragElS2Opp = vertical ? dragRect.right : dragRect.bottom, dragElOppLength = vertical ? dragRect.width : dragRect.height, targetS1Opp = vertical ? targetRect.left : targetRect.top, targetS2Opp = vertical ? targetRect.right : targetRect.bottom, targetOppLength = vertical ? targetRect.width : targetRect.height;
  return dragElS1Opp === targetS1Opp || dragElS2Opp === targetS2Opp || dragElS1Opp + dragElOppLength / 2 === targetS1Opp + targetOppLength / 2;
}, _detectNearestEmptySortable = function _detectNearestEmptySortable2(x, y) {
  var ret;
  sortables.some(function(sortable) {
    var threshold = sortable[expando].options.emptyInsertThreshold;
    if (!threshold || lastChild(sortable)) return;
    var rect = getRect(sortable), insideHorizontally = x >= rect.left - threshold && x <= rect.right + threshold, insideVertically = y >= rect.top - threshold && y <= rect.bottom + threshold;
    if (insideHorizontally && insideVertically) {
      return ret = sortable;
    }
  });
  return ret;
}, _prepareGroup = function _prepareGroup2(options) {
  function toFn(value, pull) {
    return function(to, from, dragEl2, evt) {
      var sameGroup = to.options.group.name && from.options.group.name && to.options.group.name === from.options.group.name;
      if (value == null && (pull || sameGroup)) {
        return true;
      } else if (value == null || value === false) {
        return false;
      } else if (pull && value === "clone") {
        return value;
      } else if (typeof value === "function") {
        return toFn(value(to, from, dragEl2, evt), pull)(to, from, dragEl2, evt);
      } else {
        var otherGroup = (pull ? to : from).options.group.name;
        return value === true || typeof value === "string" && value === otherGroup || value.join && value.indexOf(otherGroup) > -1;
      }
    };
  }
  var group = {};
  var originalGroup = options.group;
  if (!originalGroup || _typeof(originalGroup) != "object") {
    originalGroup = {
      name: originalGroup
    };
  }
  group.name = originalGroup.name;
  group.checkPull = toFn(originalGroup.pull, true);
  group.checkPut = toFn(originalGroup.put);
  group.revertClone = originalGroup.revertClone;
  options.group = group;
}, _hideGhostForTarget = function _hideGhostForTarget2() {
  if (!supportCssPointerEvents && ghostEl) {
    css(ghostEl, "display", "none");
  }
}, _unhideGhostForTarget = function _unhideGhostForTarget2() {
  if (!supportCssPointerEvents && ghostEl) {
    css(ghostEl, "display", "");
  }
};
if (documentExists) {
  document.addEventListener("click", function(evt) {
    if (ignoreNextClick) {
      evt.preventDefault();
      evt.stopPropagation && evt.stopPropagation();
      evt.stopImmediatePropagation && evt.stopImmediatePropagation();
      ignoreNextClick = false;
      return false;
    }
  }, true);
}
var nearestEmptyInsertDetectEvent = function nearestEmptyInsertDetectEvent2(evt) {
  if (dragEl) {
    evt = evt.touches ? evt.touches[0] : evt;
    var nearest = _detectNearestEmptySortable(evt.clientX, evt.clientY);
    if (nearest) {
      var event = {};
      for (var i in evt) {
        if (evt.hasOwnProperty(i)) {
          event[i] = evt[i];
        }
      }
      event.target = event.rootEl = nearest;
      event.preventDefault = void 0;
      event.stopPropagation = void 0;
      nearest[expando]._onDragOver(event);
    }
  }
};
var _checkOutsideTargetEl = function _checkOutsideTargetEl2(evt) {
  if (dragEl) {
    dragEl.parentNode[expando]._isOutsideThisEl(evt.target);
  }
};
function Sortable(el, options) {
  if (!(el && el.nodeType && el.nodeType === 1)) {
    throw "Sortable: `el` must be an HTMLElement, not ".concat({}.toString.call(el));
  }
  this.el = el;
  this.options = options = _extends({}, options);
  el[expando] = this;
  var defaults2 = {
    group: null,
    sort: true,
    disabled: false,
    store: null,
    handle: null,
    draggable: /^[uo]l$/i.test(el.nodeName) ? ">li" : ">*",
    swapThreshold: 1,
    // percentage; 0 <= x <= 1
    invertSwap: false,
    // invert always
    invertedSwapThreshold: null,
    // will be set to same as swapThreshold if default
    removeCloneOnHide: true,
    direction: function direction() {
      return _detectDirection(el, this.options);
    },
    ghostClass: "sortable-ghost",
    chosenClass: "sortable-chosen",
    dragClass: "sortable-drag",
    ignore: "a, img",
    filter: null,
    preventOnFilter: true,
    animation: 0,
    easing: null,
    setData: function setData(dataTransfer, dragEl2) {
      dataTransfer.setData("Text", dragEl2.textContent);
    },
    dropBubble: false,
    dragoverBubble: false,
    dataIdAttr: "data-id",
    delay: 0,
    delayOnTouchOnly: false,
    touchStartThreshold: (Number.parseInt ? Number : window).parseInt(window.devicePixelRatio, 10) || 1,
    forceFallback: false,
    fallbackClass: "sortable-fallback",
    fallbackOnBody: false,
    fallbackTolerance: 0,
    fallbackOffset: {
      x: 0,
      y: 0
    },
    supportPointer: Sortable.supportPointer !== false && "PointerEvent" in window && !Safari,
    emptyInsertThreshold: 5
  };
  PluginManager.initializePlugins(this, el, defaults2);
  for (var name in defaults2) {
    !(name in options) && (options[name] = defaults2[name]);
  }
  _prepareGroup(options);
  for (var fn in this) {
    if (fn.charAt(0) === "_" && typeof this[fn] === "function") {
      this[fn] = this[fn].bind(this);
    }
  }
  this.nativeDraggable = options.forceFallback ? false : supportDraggable;
  if (this.nativeDraggable) {
    this.options.touchStartThreshold = 1;
  }
  if (options.supportPointer) {
    on(el, "pointerdown", this._onTapStart);
  } else {
    on(el, "mousedown", this._onTapStart);
    on(el, "touchstart", this._onTapStart);
  }
  if (this.nativeDraggable) {
    on(el, "dragover", this);
    on(el, "dragenter", this);
  }
  sortables.push(this.el);
  options.store && options.store.get && this.sort(options.store.get(this) || []);
  _extends(this, AnimationStateManager());
}
Sortable.prototype = /** @lends Sortable.prototype */
{
  constructor: Sortable,
  _isOutsideThisEl: function _isOutsideThisEl(target) {
    if (!this.el.contains(target) && target !== this.el) {
      lastTarget = null;
    }
  },
  _getDirection: function _getDirection(evt, target) {
    return typeof this.options.direction === "function" ? this.options.direction.call(this, evt, target, dragEl) : this.options.direction;
  },
  _onTapStart: function _onTapStart(evt) {
    if (!evt.cancelable) return;
    var _this = this, el = this.el, options = this.options, preventOnFilter = options.preventOnFilter, type = evt.type, touch = evt.touches && evt.touches[0] || evt.pointerType && evt.pointerType === "touch" && evt, target = (touch || evt).target, originalTarget = evt.target.shadowRoot && (evt.path && evt.path[0] || evt.composedPath && evt.composedPath()[0]) || target, filter2 = options.filter;
    _saveInputCheckedState(el);
    if (dragEl) {
      return;
    }
    if (/mousedown|pointerdown/.test(type) && evt.button !== 0 || options.disabled) {
      return;
    }
    if (originalTarget.isContentEditable) {
      return;
    }
    if (!this.nativeDraggable && Safari && target && target.tagName.toUpperCase() === "SELECT") {
      return;
    }
    target = closest(target, options.draggable, el, false);
    if (target && target.animated) {
      return;
    }
    if (lastDownEl === target) {
      return;
    }
    oldIndex = index(target);
    oldDraggableIndex = index(target, options.draggable);
    if (typeof filter2 === "function") {
      if (filter2.call(this, evt, target, this)) {
        _dispatchEvent({
          sortable: _this,
          rootEl: originalTarget,
          name: "filter",
          targetEl: target,
          toEl: el,
          fromEl: el
        });
        pluginEvent2("filter", _this, {
          evt
        });
        preventOnFilter && evt.cancelable && evt.preventDefault();
        return;
      }
    } else if (filter2) {
      filter2 = filter2.split(",").some(function(criteria) {
        criteria = closest(originalTarget, criteria.trim(), el, false);
        if (criteria) {
          _dispatchEvent({
            sortable: _this,
            rootEl: criteria,
            name: "filter",
            targetEl: target,
            fromEl: el,
            toEl: el
          });
          pluginEvent2("filter", _this, {
            evt
          });
          return true;
        }
      });
      if (filter2) {
        preventOnFilter && evt.cancelable && evt.preventDefault();
        return;
      }
    }
    if (options.handle && !closest(originalTarget, options.handle, el, false)) {
      return;
    }
    this._prepareDragStart(evt, touch, target);
  },
  _prepareDragStart: function _prepareDragStart(evt, touch, target) {
    var _this = this, el = _this.el, options = _this.options, ownerDocument = el.ownerDocument, dragStartFn;
    if (target && !dragEl && target.parentNode === el) {
      var dragRect = getRect(target);
      rootEl = el;
      dragEl = target;
      parentEl = dragEl.parentNode;
      nextEl = dragEl.nextSibling;
      lastDownEl = target;
      activeGroup = options.group;
      Sortable.dragged = dragEl;
      tapEvt = {
        target: dragEl,
        clientX: (touch || evt).clientX,
        clientY: (touch || evt).clientY
      };
      tapDistanceLeft = tapEvt.clientX - dragRect.left;
      tapDistanceTop = tapEvt.clientY - dragRect.top;
      this._lastX = (touch || evt).clientX;
      this._lastY = (touch || evt).clientY;
      dragEl.style["will-change"] = "all";
      dragStartFn = function dragStartFn2() {
        pluginEvent2("delayEnded", _this, {
          evt
        });
        if (Sortable.eventCanceled) {
          _this._onDrop();
          return;
        }
        _this._disableDelayedDragEvents();
        if (!FireFox && _this.nativeDraggable) {
          dragEl.draggable = true;
        }
        _this._triggerDragStart(evt, touch);
        _dispatchEvent({
          sortable: _this,
          name: "choose",
          originalEvent: evt
        });
        toggleClass(dragEl, options.chosenClass, true);
      };
      options.ignore.split(",").forEach(function(criteria) {
        find(dragEl, criteria.trim(), _disableDraggable);
      });
      on(ownerDocument, "dragover", nearestEmptyInsertDetectEvent);
      on(ownerDocument, "mousemove", nearestEmptyInsertDetectEvent);
      on(ownerDocument, "touchmove", nearestEmptyInsertDetectEvent);
      on(ownerDocument, "mouseup", _this._onDrop);
      on(ownerDocument, "touchend", _this._onDrop);
      on(ownerDocument, "touchcancel", _this._onDrop);
      if (FireFox && this.nativeDraggable) {
        this.options.touchStartThreshold = 4;
        dragEl.draggable = true;
      }
      pluginEvent2("delayStart", this, {
        evt
      });
      if (options.delay && (!options.delayOnTouchOnly || touch) && (!this.nativeDraggable || !(Edge || IE11OrLess))) {
        if (Sortable.eventCanceled) {
          this._onDrop();
          return;
        }
        on(ownerDocument, "mouseup", _this._disableDelayedDrag);
        on(ownerDocument, "touchend", _this._disableDelayedDrag);
        on(ownerDocument, "touchcancel", _this._disableDelayedDrag);
        on(ownerDocument, "mousemove", _this._delayedDragTouchMoveHandler);
        on(ownerDocument, "touchmove", _this._delayedDragTouchMoveHandler);
        options.supportPointer && on(ownerDocument, "pointermove", _this._delayedDragTouchMoveHandler);
        _this._dragStartTimer = setTimeout(dragStartFn, options.delay);
      } else {
        dragStartFn();
      }
    }
  },
  _delayedDragTouchMoveHandler: function _delayedDragTouchMoveHandler(e) {
    var touch = e.touches ? e.touches[0] : e;
    if (Math.max(Math.abs(touch.clientX - this._lastX), Math.abs(touch.clientY - this._lastY)) >= Math.floor(this.options.touchStartThreshold / (this.nativeDraggable && window.devicePixelRatio || 1))) {
      this._disableDelayedDrag();
    }
  },
  _disableDelayedDrag: function _disableDelayedDrag() {
    dragEl && _disableDraggable(dragEl);
    clearTimeout(this._dragStartTimer);
    this._disableDelayedDragEvents();
  },
  _disableDelayedDragEvents: function _disableDelayedDragEvents() {
    var ownerDocument = this.el.ownerDocument;
    off(ownerDocument, "mouseup", this._disableDelayedDrag);
    off(ownerDocument, "touchend", this._disableDelayedDrag);
    off(ownerDocument, "touchcancel", this._disableDelayedDrag);
    off(ownerDocument, "mousemove", this._delayedDragTouchMoveHandler);
    off(ownerDocument, "touchmove", this._delayedDragTouchMoveHandler);
    off(ownerDocument, "pointermove", this._delayedDragTouchMoveHandler);
  },
  _triggerDragStart: function _triggerDragStart(evt, touch) {
    touch = touch || evt.pointerType == "touch" && evt;
    if (!this.nativeDraggable || touch) {
      if (this.options.supportPointer) {
        on(document, "pointermove", this._onTouchMove);
      } else if (touch) {
        on(document, "touchmove", this._onTouchMove);
      } else {
        on(document, "mousemove", this._onTouchMove);
      }
    } else {
      on(dragEl, "dragend", this);
      on(rootEl, "dragstart", this._onDragStart);
    }
    try {
      if (document.selection) {
        _nextTick(function() {
          document.selection.empty();
        });
      } else {
        window.getSelection().removeAllRanges();
      }
    } catch (err) {
    }
  },
  _dragStarted: function _dragStarted(fallback, evt) {
    awaitingDragStarted = false;
    if (rootEl && dragEl) {
      pluginEvent2("dragStarted", this, {
        evt
      });
      if (this.nativeDraggable) {
        on(document, "dragover", _checkOutsideTargetEl);
      }
      var options = this.options;
      !fallback && toggleClass(dragEl, options.dragClass, false);
      toggleClass(dragEl, options.ghostClass, true);
      Sortable.active = this;
      fallback && this._appendGhost();
      _dispatchEvent({
        sortable: this,
        name: "start",
        originalEvent: evt
      });
    } else {
      this._nulling();
    }
  },
  _emulateDragOver: function _emulateDragOver() {
    if (touchEvt) {
      this._lastX = touchEvt.clientX;
      this._lastY = touchEvt.clientY;
      _hideGhostForTarget();
      var target = document.elementFromPoint(touchEvt.clientX, touchEvt.clientY);
      var parent = target;
      while (target && target.shadowRoot) {
        target = target.shadowRoot.elementFromPoint(touchEvt.clientX, touchEvt.clientY);
        if (target === parent) break;
        parent = target;
      }
      dragEl.parentNode[expando]._isOutsideThisEl(target);
      if (parent) {
        do {
          if (parent[expando]) {
            var inserted = void 0;
            inserted = parent[expando]._onDragOver({
              clientX: touchEvt.clientX,
              clientY: touchEvt.clientY,
              target,
              rootEl: parent
            });
            if (inserted && !this.options.dragoverBubble) {
              break;
            }
          }
          target = parent;
        } while (parent = parent.parentNode);
      }
      _unhideGhostForTarget();
    }
  },
  _onTouchMove: function _onTouchMove(evt) {
    if (tapEvt) {
      var options = this.options, fallbackTolerance = options.fallbackTolerance, fallbackOffset = options.fallbackOffset, touch = evt.touches ? evt.touches[0] : evt, ghostMatrix = ghostEl && matrix(ghostEl, true), scaleX = ghostEl && ghostMatrix && ghostMatrix.a, scaleY = ghostEl && ghostMatrix && ghostMatrix.d, relativeScrollOffset = PositionGhostAbsolutely && ghostRelativeParent && getRelativeScrollOffset(ghostRelativeParent), dx = (touch.clientX - tapEvt.clientX + fallbackOffset.x) / (scaleX || 1) + (relativeScrollOffset ? relativeScrollOffset[0] - ghostRelativeParentInitialScroll[0] : 0) / (scaleX || 1), dy = (touch.clientY - tapEvt.clientY + fallbackOffset.y) / (scaleY || 1) + (relativeScrollOffset ? relativeScrollOffset[1] - ghostRelativeParentInitialScroll[1] : 0) / (scaleY || 1);
      if (!Sortable.active && !awaitingDragStarted) {
        if (fallbackTolerance && Math.max(Math.abs(touch.clientX - this._lastX), Math.abs(touch.clientY - this._lastY)) < fallbackTolerance) {
          return;
        }
        this._onDragStart(evt, true);
      }
      if (ghostEl) {
        if (ghostMatrix) {
          ghostMatrix.e += dx - (lastDx || 0);
          ghostMatrix.f += dy - (lastDy || 0);
        } else {
          ghostMatrix = {
            a: 1,
            b: 0,
            c: 0,
            d: 1,
            e: dx,
            f: dy
          };
        }
        var cssMatrix = "matrix(".concat(ghostMatrix.a, ",").concat(ghostMatrix.b, ",").concat(ghostMatrix.c, ",").concat(ghostMatrix.d, ",").concat(ghostMatrix.e, ",").concat(ghostMatrix.f, ")");
        css(ghostEl, "webkitTransform", cssMatrix);
        css(ghostEl, "mozTransform", cssMatrix);
        css(ghostEl, "msTransform", cssMatrix);
        css(ghostEl, "transform", cssMatrix);
        lastDx = dx;
        lastDy = dy;
        touchEvt = touch;
      }
      evt.cancelable && evt.preventDefault();
    }
  },
  _appendGhost: function _appendGhost() {
    if (!ghostEl) {
      var container = this.options.fallbackOnBody ? document.body : rootEl, rect = getRect(dragEl, true, PositionGhostAbsolutely, true, container), options = this.options;
      if (PositionGhostAbsolutely) {
        ghostRelativeParent = container;
        while (css(ghostRelativeParent, "position") === "static" && css(ghostRelativeParent, "transform") === "none" && ghostRelativeParent !== document) {
          ghostRelativeParent = ghostRelativeParent.parentNode;
        }
        if (ghostRelativeParent !== document.body && ghostRelativeParent !== document.documentElement) {
          if (ghostRelativeParent === document) ghostRelativeParent = getWindowScrollingElement();
          rect.top += ghostRelativeParent.scrollTop;
          rect.left += ghostRelativeParent.scrollLeft;
        } else {
          ghostRelativeParent = getWindowScrollingElement();
        }
        ghostRelativeParentInitialScroll = getRelativeScrollOffset(ghostRelativeParent);
      }
      ghostEl = dragEl.cloneNode(true);
      toggleClass(ghostEl, options.ghostClass, false);
      toggleClass(ghostEl, options.fallbackClass, true);
      toggleClass(ghostEl, options.dragClass, true);
      css(ghostEl, "transition", "");
      css(ghostEl, "transform", "");
      css(ghostEl, "box-sizing", "border-box");
      css(ghostEl, "margin", 0);
      css(ghostEl, "top", rect.top);
      css(ghostEl, "left", rect.left);
      css(ghostEl, "width", rect.width);
      css(ghostEl, "height", rect.height);
      css(ghostEl, "opacity", "0.8");
      css(ghostEl, "position", PositionGhostAbsolutely ? "absolute" : "fixed");
      css(ghostEl, "zIndex", "100000");
      css(ghostEl, "pointerEvents", "none");
      Sortable.ghost = ghostEl;
      container.appendChild(ghostEl);
      css(ghostEl, "transform-origin", tapDistanceLeft / parseInt(ghostEl.style.width) * 100 + "% " + tapDistanceTop / parseInt(ghostEl.style.height) * 100 + "%");
    }
  },
  _onDragStart: function _onDragStart(evt, fallback) {
    var _this = this;
    var dataTransfer = evt.dataTransfer;
    var options = _this.options;
    pluginEvent2("dragStart", this, {
      evt
    });
    if (Sortable.eventCanceled) {
      this._onDrop();
      return;
    }
    pluginEvent2("setupClone", this);
    if (!Sortable.eventCanceled) {
      cloneEl = clone(dragEl);
      cloneEl.draggable = false;
      cloneEl.style["will-change"] = "";
      this._hideClone();
      toggleClass(cloneEl, this.options.chosenClass, false);
      Sortable.clone = cloneEl;
    }
    _this.cloneId = _nextTick(function() {
      pluginEvent2("clone", _this);
      if (Sortable.eventCanceled) return;
      if (!_this.options.removeCloneOnHide) {
        rootEl.insertBefore(cloneEl, dragEl);
      }
      _this._hideClone();
      _dispatchEvent({
        sortable: _this,
        name: "clone"
      });
    });
    !fallback && toggleClass(dragEl, options.dragClass, true);
    if (fallback) {
      ignoreNextClick = true;
      _this._loopId = setInterval(_this._emulateDragOver, 50);
    } else {
      off(document, "mouseup", _this._onDrop);
      off(document, "touchend", _this._onDrop);
      off(document, "touchcancel", _this._onDrop);
      if (dataTransfer) {
        dataTransfer.effectAllowed = "move";
        options.setData && options.setData.call(_this, dataTransfer, dragEl);
      }
      on(document, "drop", _this);
      css(dragEl, "transform", "translateZ(0)");
    }
    awaitingDragStarted = true;
    _this._dragStartId = _nextTick(_this._dragStarted.bind(_this, fallback, evt));
    on(document, "selectstart", _this);
    moved = true;
    if (Safari) {
      css(document.body, "user-select", "none");
    }
  },
  // Returns true - if no further action is needed (either inserted or another condition)
  _onDragOver: function _onDragOver(evt) {
    var el = this.el, target = evt.target, dragRect, targetRect, revert, options = this.options, group = options.group, activeSortable = Sortable.active, isOwner = activeGroup === group, canSort = options.sort, fromSortable = putSortable || activeSortable, vertical, _this = this, completedFired = false;
    if (_silent) return;
    function dragOverEvent(name, extra) {
      pluginEvent2(name, _this, _objectSpread2({
        evt,
        isOwner,
        axis: vertical ? "vertical" : "horizontal",
        revert,
        dragRect,
        targetRect,
        canSort,
        fromSortable,
        target,
        completed,
        onMove: function onMove(target2, after2) {
          return _onMove(rootEl, el, dragEl, dragRect, target2, getRect(target2), evt, after2);
        },
        changed
      }, extra));
    }
    function capture() {
      dragOverEvent("dragOverAnimationCapture");
      _this.captureAnimationState();
      if (_this !== fromSortable) {
        fromSortable.captureAnimationState();
      }
    }
    function completed(insertion) {
      dragOverEvent("dragOverCompleted", {
        insertion
      });
      if (insertion) {
        if (isOwner) {
          activeSortable._hideClone();
        } else {
          activeSortable._showClone(_this);
        }
        if (_this !== fromSortable) {
          toggleClass(dragEl, putSortable ? putSortable.options.ghostClass : activeSortable.options.ghostClass, false);
          toggleClass(dragEl, options.ghostClass, true);
        }
        if (putSortable !== _this && _this !== Sortable.active) {
          putSortable = _this;
        } else if (_this === Sortable.active && putSortable) {
          putSortable = null;
        }
        if (fromSortable === _this) {
          _this._ignoreWhileAnimating = target;
        }
        _this.animateAll(function() {
          dragOverEvent("dragOverAnimationComplete");
          _this._ignoreWhileAnimating = null;
        });
        if (_this !== fromSortable) {
          fromSortable.animateAll();
          fromSortable._ignoreWhileAnimating = null;
        }
      }
      if (target === dragEl && !dragEl.animated || target === el && !target.animated) {
        lastTarget = null;
      }
      if (!options.dragoverBubble && !evt.rootEl && target !== document) {
        dragEl.parentNode[expando]._isOutsideThisEl(evt.target);
        !insertion && nearestEmptyInsertDetectEvent(evt);
      }
      !options.dragoverBubble && evt.stopPropagation && evt.stopPropagation();
      return completedFired = true;
    }
    function changed() {
      newIndex = index(dragEl);
      newDraggableIndex = index(dragEl, options.draggable);
      _dispatchEvent({
        sortable: _this,
        name: "change",
        toEl: el,
        newIndex,
        newDraggableIndex,
        originalEvent: evt
      });
    }
    if (evt.preventDefault !== void 0) {
      evt.cancelable && evt.preventDefault();
    }
    target = closest(target, options.draggable, el, true);
    dragOverEvent("dragOver");
    if (Sortable.eventCanceled) return completedFired;
    if (dragEl.contains(evt.target) || target.animated && target.animatingX && target.animatingY || _this._ignoreWhileAnimating === target) {
      return completed(false);
    }
    ignoreNextClick = false;
    if (activeSortable && !options.disabled && (isOwner ? canSort || (revert = parentEl !== rootEl) : putSortable === this || (this.lastPutMode = activeGroup.checkPull(this, activeSortable, dragEl, evt)) && group.checkPut(this, activeSortable, dragEl, evt))) {
      vertical = this._getDirection(evt, target) === "vertical";
      dragRect = getRect(dragEl);
      dragOverEvent("dragOverValid");
      if (Sortable.eventCanceled) return completedFired;
      if (revert) {
        parentEl = rootEl;
        capture();
        this._hideClone();
        dragOverEvent("revert");
        if (!Sortable.eventCanceled) {
          if (nextEl) {
            rootEl.insertBefore(dragEl, nextEl);
          } else {
            rootEl.appendChild(dragEl);
          }
        }
        return completed(true);
      }
      var elLastChild = lastChild(el, options.draggable);
      if (!elLastChild || _ghostIsLast(evt, vertical, this) && !elLastChild.animated) {
        if (elLastChild === dragEl) {
          return completed(false);
        }
        if (elLastChild && el === evt.target) {
          target = elLastChild;
        }
        if (target) {
          targetRect = getRect(target);
        }
        if (_onMove(rootEl, el, dragEl, dragRect, target, targetRect, evt, !!target) !== false) {
          capture();
          el.appendChild(dragEl);
          parentEl = el;
          changed();
          return completed(true);
        }
      } else if (elLastChild && _ghostIsFirst(evt, vertical, this)) {
        var firstChild = getChild(el, 0, options, true);
        if (firstChild === dragEl) {
          return completed(false);
        }
        target = firstChild;
        targetRect = getRect(target);
        if (_onMove(rootEl, el, dragEl, dragRect, target, targetRect, evt, false) !== false) {
          capture();
          el.insertBefore(dragEl, firstChild);
          parentEl = el;
          changed();
          return completed(true);
        }
      } else if (target.parentNode === el) {
        targetRect = getRect(target);
        var direction = 0, targetBeforeFirstSwap, differentLevel = dragEl.parentNode !== el, differentRowCol = !_dragElInRowColumn(dragEl.animated && dragEl.toRect || dragRect, target.animated && target.toRect || targetRect, vertical), side1 = vertical ? "top" : "left", scrolledPastTop = isScrolledPast(target, "top", "top") || isScrolledPast(dragEl, "top", "top"), scrollBefore = scrolledPastTop ? scrolledPastTop.scrollTop : void 0;
        if (lastTarget !== target) {
          targetBeforeFirstSwap = targetRect[side1];
          pastFirstInvertThresh = false;
          isCircumstantialInvert = !differentRowCol && options.invertSwap || differentLevel;
        }
        direction = _getSwapDirection(evt, target, targetRect, vertical, differentRowCol ? 1 : options.swapThreshold, options.invertedSwapThreshold == null ? options.swapThreshold : options.invertedSwapThreshold, isCircumstantialInvert, lastTarget === target);
        var sibling;
        if (direction !== 0) {
          var dragIndex = index(dragEl);
          do {
            dragIndex -= direction;
            sibling = parentEl.children[dragIndex];
          } while (sibling && (css(sibling, "display") === "none" || sibling === ghostEl));
        }
        if (direction === 0 || sibling === target) {
          return completed(false);
        }
        lastTarget = target;
        lastDirection = direction;
        var nextSibling = target.nextElementSibling, after = false;
        after = direction === 1;
        var moveVector = _onMove(rootEl, el, dragEl, dragRect, target, targetRect, evt, after);
        if (moveVector !== false) {
          if (moveVector === 1 || moveVector === -1) {
            after = moveVector === 1;
          }
          _silent = true;
          setTimeout(_unsilent, 30);
          capture();
          if (after && !nextSibling) {
            el.appendChild(dragEl);
          } else {
            target.parentNode.insertBefore(dragEl, after ? nextSibling : target);
          }
          if (scrolledPastTop) {
            scrollBy(scrolledPastTop, 0, scrollBefore - scrolledPastTop.scrollTop);
          }
          parentEl = dragEl.parentNode;
          if (targetBeforeFirstSwap !== void 0 && !isCircumstantialInvert) {
            targetMoveDistance = Math.abs(targetBeforeFirstSwap - getRect(target)[side1]);
          }
          changed();
          return completed(true);
        }
      }
      if (el.contains(dragEl)) {
        return completed(false);
      }
    }
    return false;
  },
  _ignoreWhileAnimating: null,
  _offMoveEvents: function _offMoveEvents() {
    off(document, "mousemove", this._onTouchMove);
    off(document, "touchmove", this._onTouchMove);
    off(document, "pointermove", this._onTouchMove);
    off(document, "dragover", nearestEmptyInsertDetectEvent);
    off(document, "mousemove", nearestEmptyInsertDetectEvent);
    off(document, "touchmove", nearestEmptyInsertDetectEvent);
  },
  _offUpEvents: function _offUpEvents() {
    var ownerDocument = this.el.ownerDocument;
    off(ownerDocument, "mouseup", this._onDrop);
    off(ownerDocument, "touchend", this._onDrop);
    off(ownerDocument, "pointerup", this._onDrop);
    off(ownerDocument, "touchcancel", this._onDrop);
    off(document, "selectstart", this);
  },
  _onDrop: function _onDrop(evt) {
    var el = this.el, options = this.options;
    newIndex = index(dragEl);
    newDraggableIndex = index(dragEl, options.draggable);
    pluginEvent2("drop", this, {
      evt
    });
    parentEl = dragEl && dragEl.parentNode;
    newIndex = index(dragEl);
    newDraggableIndex = index(dragEl, options.draggable);
    if (Sortable.eventCanceled) {
      this._nulling();
      return;
    }
    awaitingDragStarted = false;
    isCircumstantialInvert = false;
    pastFirstInvertThresh = false;
    clearInterval(this._loopId);
    clearTimeout(this._dragStartTimer);
    _cancelNextTick(this.cloneId);
    _cancelNextTick(this._dragStartId);
    if (this.nativeDraggable) {
      off(document, "drop", this);
      off(el, "dragstart", this._onDragStart);
    }
    this._offMoveEvents();
    this._offUpEvents();
    if (Safari) {
      css(document.body, "user-select", "");
    }
    css(dragEl, "transform", "");
    if (evt) {
      if (moved) {
        evt.cancelable && evt.preventDefault();
        !options.dropBubble && evt.stopPropagation();
      }
      ghostEl && ghostEl.parentNode && ghostEl.parentNode.removeChild(ghostEl);
      if (rootEl === parentEl || putSortable && putSortable.lastPutMode !== "clone") {
        cloneEl && cloneEl.parentNode && cloneEl.parentNode.removeChild(cloneEl);
      }
      if (dragEl) {
        if (this.nativeDraggable) {
          off(dragEl, "dragend", this);
        }
        _disableDraggable(dragEl);
        dragEl.style["will-change"] = "";
        if (moved && !awaitingDragStarted) {
          toggleClass(dragEl, putSortable ? putSortable.options.ghostClass : this.options.ghostClass, false);
        }
        toggleClass(dragEl, this.options.chosenClass, false);
        _dispatchEvent({
          sortable: this,
          name: "unchoose",
          toEl: parentEl,
          newIndex: null,
          newDraggableIndex: null,
          originalEvent: evt
        });
        if (rootEl !== parentEl) {
          if (newIndex >= 0) {
            _dispatchEvent({
              rootEl: parentEl,
              name: "add",
              toEl: parentEl,
              fromEl: rootEl,
              originalEvent: evt
            });
            _dispatchEvent({
              sortable: this,
              name: "remove",
              toEl: parentEl,
              originalEvent: evt
            });
            _dispatchEvent({
              rootEl: parentEl,
              name: "sort",
              toEl: parentEl,
              fromEl: rootEl,
              originalEvent: evt
            });
            _dispatchEvent({
              sortable: this,
              name: "sort",
              toEl: parentEl,
              originalEvent: evt
            });
          }
          putSortable && putSortable.save();
        } else {
          if (newIndex !== oldIndex) {
            if (newIndex >= 0) {
              _dispatchEvent({
                sortable: this,
                name: "update",
                toEl: parentEl,
                originalEvent: evt
              });
              _dispatchEvent({
                sortable: this,
                name: "sort",
                toEl: parentEl,
                originalEvent: evt
              });
            }
          }
        }
        if (Sortable.active) {
          if (newIndex == null || newIndex === -1) {
            newIndex = oldIndex;
            newDraggableIndex = oldDraggableIndex;
          }
          _dispatchEvent({
            sortable: this,
            name: "end",
            toEl: parentEl,
            originalEvent: evt
          });
          this.save();
        }
      }
    }
    this._nulling();
  },
  _nulling: function _nulling() {
    pluginEvent2("nulling", this);
    rootEl = dragEl = parentEl = ghostEl = nextEl = cloneEl = lastDownEl = cloneHidden = tapEvt = touchEvt = moved = newIndex = newDraggableIndex = oldIndex = oldDraggableIndex = lastTarget = lastDirection = putSortable = activeGroup = Sortable.dragged = Sortable.ghost = Sortable.clone = Sortable.active = null;
    savedInputChecked.forEach(function(el) {
      el.checked = true;
    });
    savedInputChecked.length = lastDx = lastDy = 0;
  },
  handleEvent: function handleEvent(evt) {
    switch (evt.type) {
      case "drop":
      case "dragend":
        this._onDrop(evt);
        break;
      case "dragenter":
      case "dragover":
        if (dragEl) {
          this._onDragOver(evt);
          _globalDragOver(evt);
        }
        break;
      case "selectstart":
        evt.preventDefault();
        break;
    }
  },
  /**
   * Serializes the item into an array of string.
   * @returns {String[]}
   */
  toArray: function toArray2() {
    var order = [], el, children = this.el.children, i = 0, n = children.length, options = this.options;
    for (; i < n; i++) {
      el = children[i];
      if (closest(el, options.draggable, this.el, false)) {
        order.push(el.getAttribute(options.dataIdAttr) || _generateId(el));
      }
    }
    return order;
  },
  /**
   * Sorts the elements according to the array.
   * @param  {String[]}  order  order of the items
   */
  sort: function sort(order, useAnimation) {
    var items = {}, rootEl2 = this.el;
    this.toArray().forEach(function(id, i) {
      var el = rootEl2.children[i];
      if (closest(el, this.options.draggable, rootEl2, false)) {
        items[id] = el;
      }
    }, this);
    useAnimation && this.captureAnimationState();
    order.forEach(function(id) {
      if (items[id]) {
        rootEl2.removeChild(items[id]);
        rootEl2.appendChild(items[id]);
      }
    });
    useAnimation && this.animateAll();
  },
  /**
   * Save the current sorting
   */
  save: function save() {
    var store = this.options.store;
    store && store.set && store.set(this);
  },
  /**
   * For each element in the set, get the first element that matches the selector by testing the element itself and traversing up through its ancestors in the DOM tree.
   * @param   {HTMLElement}  el
   * @param   {String}       [selector]  default: `options.draggable`
   * @returns {HTMLElement|null}
   */
  closest: function closest$1(el, selector) {
    return closest(el, selector || this.options.draggable, this.el, false);
  },
  /**
   * Set/get option
   * @param   {string} name
   * @param   {*}      [value]
   * @returns {*}
   */
  option: function option(name, value) {
    var options = this.options;
    if (value === void 0) {
      return options[name];
    } else {
      var modifiedValue = PluginManager.modifyOption(this, name, value);
      if (typeof modifiedValue !== "undefined") {
        options[name] = modifiedValue;
      } else {
        options[name] = value;
      }
      if (name === "group") {
        _prepareGroup(options);
      }
    }
  },
  /**
   * Destroy
   */
  destroy: function destroy() {
    pluginEvent2("destroy", this);
    var el = this.el;
    el[expando] = null;
    off(el, "mousedown", this._onTapStart);
    off(el, "touchstart", this._onTapStart);
    off(el, "pointerdown", this._onTapStart);
    if (this.nativeDraggable) {
      off(el, "dragover", this);
      off(el, "dragenter", this);
    }
    Array.prototype.forEach.call(el.querySelectorAll("[draggable]"), function(el2) {
      el2.removeAttribute("draggable");
    });
    this._onDrop();
    this._disableDelayedDragEvents();
    sortables.splice(sortables.indexOf(this.el), 1);
    this.el = el = null;
  },
  _hideClone: function _hideClone() {
    if (!cloneHidden) {
      pluginEvent2("hideClone", this);
      if (Sortable.eventCanceled) return;
      css(cloneEl, "display", "none");
      if (this.options.removeCloneOnHide && cloneEl.parentNode) {
        cloneEl.parentNode.removeChild(cloneEl);
      }
      cloneHidden = true;
    }
  },
  _showClone: function _showClone(putSortable2) {
    if (putSortable2.lastPutMode !== "clone") {
      this._hideClone();
      return;
    }
    if (cloneHidden) {
      pluginEvent2("showClone", this);
      if (Sortable.eventCanceled) return;
      if (dragEl.parentNode == rootEl && !this.options.group.revertClone) {
        rootEl.insertBefore(cloneEl, dragEl);
      } else if (nextEl) {
        rootEl.insertBefore(cloneEl, nextEl);
      } else {
        rootEl.appendChild(cloneEl);
      }
      if (this.options.group.revertClone) {
        this.animate(dragEl, cloneEl);
      }
      css(cloneEl, "display", "");
      cloneHidden = false;
    }
  }
};
function _globalDragOver(evt) {
  if (evt.dataTransfer) {
    evt.dataTransfer.dropEffect = "move";
  }
  evt.cancelable && evt.preventDefault();
}
function _onMove(fromEl, toEl, dragEl2, dragRect, targetEl, targetRect, originalEvent, willInsertAfter) {
  var evt, sortable = fromEl[expando], onMoveFn = sortable.options.onMove, retVal;
  if (window.CustomEvent && !IE11OrLess && !Edge) {
    evt = new CustomEvent("move", {
      bubbles: true,
      cancelable: true
    });
  } else {
    evt = document.createEvent("Event");
    evt.initEvent("move", true, true);
  }
  evt.to = toEl;
  evt.from = fromEl;
  evt.dragged = dragEl2;
  evt.draggedRect = dragRect;
  evt.related = targetEl || toEl;
  evt.relatedRect = targetRect || getRect(toEl);
  evt.willInsertAfter = willInsertAfter;
  evt.originalEvent = originalEvent;
  fromEl.dispatchEvent(evt);
  if (onMoveFn) {
    retVal = onMoveFn.call(sortable, evt, originalEvent);
  }
  return retVal;
}
function _disableDraggable(el) {
  el.draggable = false;
}
function _unsilent() {
  _silent = false;
}
function _ghostIsFirst(evt, vertical, sortable) {
  var rect = getRect(getChild(sortable.el, 0, sortable.options, true));
  var spacer = 10;
  return vertical ? evt.clientX < rect.left - spacer || evt.clientY < rect.top && evt.clientX < rect.right : evt.clientY < rect.top - spacer || evt.clientY < rect.bottom && evt.clientX < rect.left;
}
function _ghostIsLast(evt, vertical, sortable) {
  var rect = getRect(lastChild(sortable.el, sortable.options.draggable));
  var spacer = 10;
  return vertical ? evt.clientX > rect.right + spacer || evt.clientX <= rect.right && evt.clientY > rect.bottom && evt.clientX >= rect.left : evt.clientX > rect.right && evt.clientY > rect.top || evt.clientX <= rect.right && evt.clientY > rect.bottom + spacer;
}
function _getSwapDirection(evt, target, targetRect, vertical, swapThreshold, invertedSwapThreshold, invertSwap, isLastTarget) {
  var mouseOnAxis = vertical ? evt.clientY : evt.clientX, targetLength = vertical ? targetRect.height : targetRect.width, targetS1 = vertical ? targetRect.top : targetRect.left, targetS2 = vertical ? targetRect.bottom : targetRect.right, invert = false;
  if (!invertSwap) {
    if (isLastTarget && targetMoveDistance < targetLength * swapThreshold) {
      if (!pastFirstInvertThresh && (lastDirection === 1 ? mouseOnAxis > targetS1 + targetLength * invertedSwapThreshold / 2 : mouseOnAxis < targetS2 - targetLength * invertedSwapThreshold / 2)) {
        pastFirstInvertThresh = true;
      }
      if (!pastFirstInvertThresh) {
        if (lastDirection === 1 ? mouseOnAxis < targetS1 + targetMoveDistance : mouseOnAxis > targetS2 - targetMoveDistance) {
          return -lastDirection;
        }
      } else {
        invert = true;
      }
    } else {
      if (mouseOnAxis > targetS1 + targetLength * (1 - swapThreshold) / 2 && mouseOnAxis < targetS2 - targetLength * (1 - swapThreshold) / 2) {
        return _getInsertDirection(target);
      }
    }
  }
  invert = invert || invertSwap;
  if (invert) {
    if (mouseOnAxis < targetS1 + targetLength * invertedSwapThreshold / 2 || mouseOnAxis > targetS2 - targetLength * invertedSwapThreshold / 2) {
      return mouseOnAxis > targetS1 + targetLength / 2 ? 1 : -1;
    }
  }
  return 0;
}
function _getInsertDirection(target) {
  if (index(dragEl) < index(target)) {
    return 1;
  } else {
    return -1;
  }
}
function _generateId(el) {
  var str = el.tagName + el.className + el.src + el.href + el.textContent, i = str.length, sum = 0;
  while (i--) {
    sum += str.charCodeAt(i);
  }
  return sum.toString(36);
}
function _saveInputCheckedState(root) {
  savedInputChecked.length = 0;
  var inputs = root.getElementsByTagName("input");
  var idx = inputs.length;
  while (idx--) {
    var el = inputs[idx];
    el.checked && savedInputChecked.push(el);
  }
}
function _nextTick(fn) {
  return setTimeout(fn, 0);
}
function _cancelNextTick(id) {
  return clearTimeout(id);
}
if (documentExists) {
  on(document, "touchmove", function(evt) {
    if ((Sortable.active || awaitingDragStarted) && evt.cancelable) {
      evt.preventDefault();
    }
  });
}
Sortable.utils = {
  on,
  off,
  css,
  find,
  is: function is(el, selector) {
    return !!closest(el, selector, el, false);
  },
  extend,
  throttle,
  closest,
  toggleClass,
  clone,
  index,
  nextTick: _nextTick,
  cancelNextTick: _cancelNextTick,
  detectDirection: _detectDirection,
  getChild
};
Sortable.get = function(element) {
  return element[expando];
};
Sortable.mount = function() {
  for (var _len = arguments.length, plugins2 = new Array(_len), _key = 0; _key < _len; _key++) {
    plugins2[_key] = arguments[_key];
  }
  if (plugins2[0].constructor === Array) plugins2 = plugins2[0];
  plugins2.forEach(function(plugin) {
    if (!plugin.prototype || !plugin.prototype.constructor) {
      throw "Sortable: Mounted plugin must be a constructor function, not ".concat({}.toString.call(plugin));
    }
    if (plugin.utils) Sortable.utils = _objectSpread2(_objectSpread2({}, Sortable.utils), plugin.utils);
    PluginManager.mount(plugin);
  });
};
Sortable.create = function(el, options) {
  return new Sortable(el, options);
};
Sortable.version = version;
var autoScrolls = [], scrollEl, scrollRootEl, scrolling = false, lastAutoScrollX, lastAutoScrollY, touchEvt$1, pointerElemChangedInterval;
function AutoScrollPlugin() {
  function AutoScroll() {
    this.defaults = {
      scroll: true,
      forceAutoScrollFallback: false,
      scrollSensitivity: 30,
      scrollSpeed: 10,
      bubbleScroll: true
    };
    for (var fn in this) {
      if (fn.charAt(0) === "_" && typeof this[fn] === "function") {
        this[fn] = this[fn].bind(this);
      }
    }
  }
  AutoScroll.prototype = {
    dragStarted: function dragStarted2(_ref) {
      var originalEvent = _ref.originalEvent;
      if (this.sortable.nativeDraggable) {
        on(document, "dragover", this._handleAutoScroll);
      } else {
        if (this.options.supportPointer) {
          on(document, "pointermove", this._handleFallbackAutoScroll);
        } else if (originalEvent.touches) {
          on(document, "touchmove", this._handleFallbackAutoScroll);
        } else {
          on(document, "mousemove", this._handleFallbackAutoScroll);
        }
      }
    },
    dragOverCompleted: function dragOverCompleted(_ref2) {
      var originalEvent = _ref2.originalEvent;
      if (!this.options.dragOverBubble && !originalEvent.rootEl) {
        this._handleAutoScroll(originalEvent);
      }
    },
    drop: function drop3() {
      if (this.sortable.nativeDraggable) {
        off(document, "dragover", this._handleAutoScroll);
      } else {
        off(document, "pointermove", this._handleFallbackAutoScroll);
        off(document, "touchmove", this._handleFallbackAutoScroll);
        off(document, "mousemove", this._handleFallbackAutoScroll);
      }
      clearPointerElemChangedInterval();
      clearAutoScrolls();
      cancelThrottle();
    },
    nulling: function nulling() {
      touchEvt$1 = scrollRootEl = scrollEl = scrolling = pointerElemChangedInterval = lastAutoScrollX = lastAutoScrollY = null;
      autoScrolls.length = 0;
    },
    _handleFallbackAutoScroll: function _handleFallbackAutoScroll(evt) {
      this._handleAutoScroll(evt, true);
    },
    _handleAutoScroll: function _handleAutoScroll(evt, fallback) {
      var _this = this;
      var x = (evt.touches ? evt.touches[0] : evt).clientX, y = (evt.touches ? evt.touches[0] : evt).clientY, elem = document.elementFromPoint(x, y);
      touchEvt$1 = evt;
      if (fallback || this.options.forceAutoScrollFallback || Edge || IE11OrLess || Safari) {
        autoScroll(evt, this.options, elem, fallback);
        var ogElemScroller = getParentAutoScrollElement(elem, true);
        if (scrolling && (!pointerElemChangedInterval || x !== lastAutoScrollX || y !== lastAutoScrollY)) {
          pointerElemChangedInterval && clearPointerElemChangedInterval();
          pointerElemChangedInterval = setInterval(function() {
            var newElem = getParentAutoScrollElement(document.elementFromPoint(x, y), true);
            if (newElem !== ogElemScroller) {
              ogElemScroller = newElem;
              clearAutoScrolls();
            }
            autoScroll(evt, _this.options, newElem, fallback);
          }, 10);
          lastAutoScrollX = x;
          lastAutoScrollY = y;
        }
      } else {
        if (!this.options.bubbleScroll || getParentAutoScrollElement(elem, true) === getWindowScrollingElement()) {
          clearAutoScrolls();
          return;
        }
        autoScroll(evt, this.options, getParentAutoScrollElement(elem, false), false);
      }
    }
  };
  return _extends(AutoScroll, {
    pluginName: "scroll",
    initializeByDefault: true
  });
}
function clearAutoScrolls() {
  autoScrolls.forEach(function(autoScroll2) {
    clearInterval(autoScroll2.pid);
  });
  autoScrolls = [];
}
function clearPointerElemChangedInterval() {
  clearInterval(pointerElemChangedInterval);
}
var autoScroll = throttle(function(evt, options, rootEl2, isFallback) {
  if (!options.scroll) return;
  var x = (evt.touches ? evt.touches[0] : evt).clientX, y = (evt.touches ? evt.touches[0] : evt).clientY, sens = options.scrollSensitivity, speed = options.scrollSpeed, winScroller = getWindowScrollingElement();
  var scrollThisInstance = false, scrollCustomFn;
  if (scrollRootEl !== rootEl2) {
    scrollRootEl = rootEl2;
    clearAutoScrolls();
    scrollEl = options.scroll;
    scrollCustomFn = options.scrollFn;
    if (scrollEl === true) {
      scrollEl = getParentAutoScrollElement(rootEl2, true);
    }
  }
  var layersOut = 0;
  var currentParent = scrollEl;
  do {
    var el = currentParent, rect = getRect(el), top = rect.top, bottom = rect.bottom, left = rect.left, right = rect.right, width = rect.width, height = rect.height, canScrollX = void 0, canScrollY = void 0, scrollWidth = el.scrollWidth, scrollHeight = el.scrollHeight, elCSS = css(el), scrollPosX = el.scrollLeft, scrollPosY = el.scrollTop;
    if (el === winScroller) {
      canScrollX = width < scrollWidth && (elCSS.overflowX === "auto" || elCSS.overflowX === "scroll" || elCSS.overflowX === "visible");
      canScrollY = height < scrollHeight && (elCSS.overflowY === "auto" || elCSS.overflowY === "scroll" || elCSS.overflowY === "visible");
    } else {
      canScrollX = width < scrollWidth && (elCSS.overflowX === "auto" || elCSS.overflowX === "scroll");
      canScrollY = height < scrollHeight && (elCSS.overflowY === "auto" || elCSS.overflowY === "scroll");
    }
    var vx = canScrollX && (Math.abs(right - x) <= sens && scrollPosX + width < scrollWidth) - (Math.abs(left - x) <= sens && !!scrollPosX);
    var vy = canScrollY && (Math.abs(bottom - y) <= sens && scrollPosY + height < scrollHeight) - (Math.abs(top - y) <= sens && !!scrollPosY);
    if (!autoScrolls[layersOut]) {
      for (var i = 0; i <= layersOut; i++) {
        if (!autoScrolls[i]) {
          autoScrolls[i] = {};
        }
      }
    }
    if (autoScrolls[layersOut].vx != vx || autoScrolls[layersOut].vy != vy || autoScrolls[layersOut].el !== el) {
      autoScrolls[layersOut].el = el;
      autoScrolls[layersOut].vx = vx;
      autoScrolls[layersOut].vy = vy;
      clearInterval(autoScrolls[layersOut].pid);
      if (vx != 0 || vy != 0) {
        scrollThisInstance = true;
        autoScrolls[layersOut].pid = setInterval((function() {
          if (isFallback && this.layer === 0) {
            Sortable.active._onTouchMove(touchEvt$1);
          }
          var scrollOffsetY = autoScrolls[this.layer].vy ? autoScrolls[this.layer].vy * speed : 0;
          var scrollOffsetX = autoScrolls[this.layer].vx ? autoScrolls[this.layer].vx * speed : 0;
          if (typeof scrollCustomFn === "function") {
            if (scrollCustomFn.call(Sortable.dragged.parentNode[expando], scrollOffsetX, scrollOffsetY, evt, touchEvt$1, autoScrolls[this.layer].el) !== "continue") {
              return;
            }
          }
          scrollBy(autoScrolls[this.layer].el, scrollOffsetX, scrollOffsetY);
        }).bind({
          layer: layersOut
        }), 24);
      }
    }
    layersOut++;
  } while (options.bubbleScroll && currentParent !== winScroller && (currentParent = getParentAutoScrollElement(currentParent, false)));
  scrolling = scrollThisInstance;
}, 30);
var drop = function drop2(_ref) {
  var originalEvent = _ref.originalEvent, putSortable2 = _ref.putSortable, dragEl2 = _ref.dragEl, activeSortable = _ref.activeSortable, dispatchSortableEvent = _ref.dispatchSortableEvent, hideGhostForTarget = _ref.hideGhostForTarget, unhideGhostForTarget = _ref.unhideGhostForTarget;
  if (!originalEvent) return;
  var toSortable = putSortable2 || activeSortable;
  hideGhostForTarget();
  var touch = originalEvent.changedTouches && originalEvent.changedTouches.length ? originalEvent.changedTouches[0] : originalEvent;
  var target = document.elementFromPoint(touch.clientX, touch.clientY);
  unhideGhostForTarget();
  if (toSortable && !toSortable.el.contains(target)) {
    dispatchSortableEvent("spill");
    this.onSpill({
      dragEl: dragEl2,
      putSortable: putSortable2
    });
  }
};
function Revert() {
}
Revert.prototype = {
  startIndex: null,
  dragStart: function dragStart(_ref2) {
    var oldDraggableIndex2 = _ref2.oldDraggableIndex;
    this.startIndex = oldDraggableIndex2;
  },
  onSpill: function onSpill(_ref3) {
    var dragEl2 = _ref3.dragEl, putSortable2 = _ref3.putSortable;
    this.sortable.captureAnimationState();
    if (putSortable2) {
      putSortable2.captureAnimationState();
    }
    var nextSibling = getChild(this.sortable.el, this.startIndex, this.options);
    if (nextSibling) {
      this.sortable.el.insertBefore(dragEl2, nextSibling);
    } else {
      this.sortable.el.appendChild(dragEl2);
    }
    this.sortable.animateAll();
    if (putSortable2) {
      putSortable2.animateAll();
    }
  },
  drop
};
_extends(Revert, {
  pluginName: "revertOnSpill"
});
function Remove() {
}
Remove.prototype = {
  onSpill: function onSpill2(_ref4) {
    var dragEl2 = _ref4.dragEl, putSortable2 = _ref4.putSortable;
    var parentSortable = putSortable2 || this.sortable;
    parentSortable.captureAnimationState();
    dragEl2.parentNode && dragEl2.parentNode.removeChild(dragEl2);
    parentSortable.animateAll();
  },
  drop
};
_extends(Remove, {
  pluginName: "removeOnSpill"
});
var lastSwapEl;
function SwapPlugin() {
  function Swap() {
    this.defaults = {
      swapClass: "sortable-swap-highlight"
    };
  }
  Swap.prototype = {
    dragStart: function dragStart2(_ref) {
      var dragEl2 = _ref.dragEl;
      lastSwapEl = dragEl2;
    },
    dragOverValid: function dragOverValid(_ref2) {
      var completed = _ref2.completed, target = _ref2.target, onMove = _ref2.onMove, activeSortable = _ref2.activeSortable, changed = _ref2.changed, cancel = _ref2.cancel;
      if (!activeSortable.options.swap) return;
      var el = this.sortable.el, options = this.options;
      if (target && target !== el) {
        var prevSwapEl = lastSwapEl;
        if (onMove(target) !== false) {
          toggleClass(target, options.swapClass, true);
          lastSwapEl = target;
        } else {
          lastSwapEl = null;
        }
        if (prevSwapEl && prevSwapEl !== lastSwapEl) {
          toggleClass(prevSwapEl, options.swapClass, false);
        }
      }
      changed();
      completed(true);
      cancel();
    },
    drop: function drop3(_ref3) {
      var activeSortable = _ref3.activeSortable, putSortable2 = _ref3.putSortable, dragEl2 = _ref3.dragEl;
      var toSortable = putSortable2 || this.sortable;
      var options = this.options;
      lastSwapEl && toggleClass(lastSwapEl, options.swapClass, false);
      if (lastSwapEl && (options.swap || putSortable2 && putSortable2.options.swap)) {
        if (dragEl2 !== lastSwapEl) {
          toSortable.captureAnimationState();
          if (toSortable !== activeSortable) activeSortable.captureAnimationState();
          swapNodes(dragEl2, lastSwapEl);
          toSortable.animateAll();
          if (toSortable !== activeSortable) activeSortable.animateAll();
        }
      }
    },
    nulling: function nulling() {
      lastSwapEl = null;
    }
  };
  return _extends(Swap, {
    pluginName: "swap",
    eventProperties: function eventProperties() {
      return {
        swapItem: lastSwapEl
      };
    }
  });
}
function swapNodes(n1, n2) {
  var p1 = n1.parentNode, p2 = n2.parentNode, i1, i2;
  if (!p1 || !p2 || p1.isEqualNode(n2) || p2.isEqualNode(n1)) return;
  i1 = index(n1);
  i2 = index(n2);
  if (p1.isEqualNode(p2) && i1 < i2) {
    i2++;
  }
  p1.insertBefore(n2, p1.children[i1]);
  p2.insertBefore(n1, p2.children[i2]);
}
var multiDragElements = [], multiDragClones = [], lastMultiDragSelect, multiDragSortable, initialFolding = false, folding = false, dragStarted = false, dragEl$1, clonesFromRect, clonesHidden;
function MultiDragPlugin() {
  function MultiDrag(sortable) {
    for (var fn in this) {
      if (fn.charAt(0) === "_" && typeof this[fn] === "function") {
        this[fn] = this[fn].bind(this);
      }
    }
    if (sortable.options.supportPointer) {
      on(document, "pointerup", this._deselectMultiDrag);
    } else {
      on(document, "mouseup", this._deselectMultiDrag);
      on(document, "touchend", this._deselectMultiDrag);
    }
    on(document, "keydown", this._checkKeyDown);
    on(document, "keyup", this._checkKeyUp);
    this.defaults = {
      selectedClass: "sortable-selected",
      multiDragKey: null,
      setData: function setData(dataTransfer, dragEl2) {
        var data = "";
        if (multiDragElements.length && multiDragSortable === sortable) {
          multiDragElements.forEach(function(multiDragElement, i) {
            data += (!i ? "" : ", ") + multiDragElement.textContent;
          });
        } else {
          data = dragEl2.textContent;
        }
        dataTransfer.setData("Text", data);
      }
    };
  }
  MultiDrag.prototype = {
    multiDragKeyDown: false,
    isMultiDrag: false,
    delayStartGlobal: function delayStartGlobal(_ref) {
      var dragged = _ref.dragEl;
      dragEl$1 = dragged;
    },
    delayEnded: function delayEnded() {
      this.isMultiDrag = ~multiDragElements.indexOf(dragEl$1);
    },
    setupClone: function setupClone(_ref2) {
      var sortable = _ref2.sortable, cancel = _ref2.cancel;
      if (!this.isMultiDrag) return;
      for (var i = 0; i < multiDragElements.length; i++) {
        multiDragClones.push(clone(multiDragElements[i]));
        multiDragClones[i].sortableIndex = multiDragElements[i].sortableIndex;
        multiDragClones[i].draggable = false;
        multiDragClones[i].style["will-change"] = "";
        toggleClass(multiDragClones[i], this.options.selectedClass, false);
        multiDragElements[i] === dragEl$1 && toggleClass(multiDragClones[i], this.options.chosenClass, false);
      }
      sortable._hideClone();
      cancel();
    },
    clone: function clone2(_ref3) {
      var sortable = _ref3.sortable, rootEl2 = _ref3.rootEl, dispatchSortableEvent = _ref3.dispatchSortableEvent, cancel = _ref3.cancel;
      if (!this.isMultiDrag) return;
      if (!this.options.removeCloneOnHide) {
        if (multiDragElements.length && multiDragSortable === sortable) {
          insertMultiDragClones(true, rootEl2);
          dispatchSortableEvent("clone");
          cancel();
        }
      }
    },
    showClone: function showClone(_ref4) {
      var cloneNowShown = _ref4.cloneNowShown, rootEl2 = _ref4.rootEl, cancel = _ref4.cancel;
      if (!this.isMultiDrag) return;
      insertMultiDragClones(false, rootEl2);
      multiDragClones.forEach(function(clone2) {
        css(clone2, "display", "");
      });
      cloneNowShown();
      clonesHidden = false;
      cancel();
    },
    hideClone: function hideClone(_ref5) {
      var _this = this;
      _ref5.sortable;
      var cloneNowHidden = _ref5.cloneNowHidden, cancel = _ref5.cancel;
      if (!this.isMultiDrag) return;
      multiDragClones.forEach(function(clone2) {
        css(clone2, "display", "none");
        if (_this.options.removeCloneOnHide && clone2.parentNode) {
          clone2.parentNode.removeChild(clone2);
        }
      });
      cloneNowHidden();
      clonesHidden = true;
      cancel();
    },
    dragStartGlobal: function dragStartGlobal(_ref6) {
      _ref6.sortable;
      if (!this.isMultiDrag && multiDragSortable) {
        multiDragSortable.multiDrag._deselectMultiDrag();
      }
      multiDragElements.forEach(function(multiDragElement) {
        multiDragElement.sortableIndex = index(multiDragElement);
      });
      multiDragElements = multiDragElements.sort(function(a, b) {
        return a.sortableIndex - b.sortableIndex;
      });
      dragStarted = true;
    },
    dragStarted: function dragStarted2(_ref7) {
      var _this2 = this;
      var sortable = _ref7.sortable;
      if (!this.isMultiDrag) return;
      if (this.options.sort) {
        sortable.captureAnimationState();
        if (this.options.animation) {
          multiDragElements.forEach(function(multiDragElement) {
            if (multiDragElement === dragEl$1) return;
            css(multiDragElement, "position", "absolute");
          });
          var dragRect = getRect(dragEl$1, false, true, true);
          multiDragElements.forEach(function(multiDragElement) {
            if (multiDragElement === dragEl$1) return;
            setRect(multiDragElement, dragRect);
          });
          folding = true;
          initialFolding = true;
        }
      }
      sortable.animateAll(function() {
        folding = false;
        initialFolding = false;
        if (_this2.options.animation) {
          multiDragElements.forEach(function(multiDragElement) {
            unsetRect(multiDragElement);
          });
        }
        if (_this2.options.sort) {
          removeMultiDragElements();
        }
      });
    },
    dragOver: function dragOver(_ref8) {
      var target = _ref8.target, completed = _ref8.completed, cancel = _ref8.cancel;
      if (folding && ~multiDragElements.indexOf(target)) {
        completed(false);
        cancel();
      }
    },
    revert: function revert(_ref9) {
      var fromSortable = _ref9.fromSortable, rootEl2 = _ref9.rootEl, sortable = _ref9.sortable, dragRect = _ref9.dragRect;
      if (multiDragElements.length > 1) {
        multiDragElements.forEach(function(multiDragElement) {
          sortable.addAnimationState({
            target: multiDragElement,
            rect: folding ? getRect(multiDragElement) : dragRect
          });
          unsetRect(multiDragElement);
          multiDragElement.fromRect = dragRect;
          fromSortable.removeAnimationState(multiDragElement);
        });
        folding = false;
        insertMultiDragElements(!this.options.removeCloneOnHide, rootEl2);
      }
    },
    dragOverCompleted: function dragOverCompleted(_ref10) {
      var sortable = _ref10.sortable, isOwner = _ref10.isOwner, insertion = _ref10.insertion, activeSortable = _ref10.activeSortable, parentEl2 = _ref10.parentEl, putSortable2 = _ref10.putSortable;
      var options = this.options;
      if (insertion) {
        if (isOwner) {
          activeSortable._hideClone();
        }
        initialFolding = false;
        if (options.animation && multiDragElements.length > 1 && (folding || !isOwner && !activeSortable.options.sort && !putSortable2)) {
          var dragRectAbsolute = getRect(dragEl$1, false, true, true);
          multiDragElements.forEach(function(multiDragElement) {
            if (multiDragElement === dragEl$1) return;
            setRect(multiDragElement, dragRectAbsolute);
            parentEl2.appendChild(multiDragElement);
          });
          folding = true;
        }
        if (!isOwner) {
          if (!folding) {
            removeMultiDragElements();
          }
          if (multiDragElements.length > 1) {
            var clonesHiddenBefore = clonesHidden;
            activeSortable._showClone(sortable);
            if (activeSortable.options.animation && !clonesHidden && clonesHiddenBefore) {
              multiDragClones.forEach(function(clone2) {
                activeSortable.addAnimationState({
                  target: clone2,
                  rect: clonesFromRect
                });
                clone2.fromRect = clonesFromRect;
                clone2.thisAnimationDuration = null;
              });
            }
          } else {
            activeSortable._showClone(sortable);
          }
        }
      }
    },
    dragOverAnimationCapture: function dragOverAnimationCapture(_ref11) {
      var dragRect = _ref11.dragRect, isOwner = _ref11.isOwner, activeSortable = _ref11.activeSortable;
      multiDragElements.forEach(function(multiDragElement) {
        multiDragElement.thisAnimationDuration = null;
      });
      if (activeSortable.options.animation && !isOwner && activeSortable.multiDrag.isMultiDrag) {
        clonesFromRect = _extends({}, dragRect);
        var dragMatrix = matrix(dragEl$1, true);
        clonesFromRect.top -= dragMatrix.f;
        clonesFromRect.left -= dragMatrix.e;
      }
    },
    dragOverAnimationComplete: function dragOverAnimationComplete() {
      if (folding) {
        folding = false;
        removeMultiDragElements();
      }
    },
    drop: function drop3(_ref12) {
      var evt = _ref12.originalEvent, rootEl2 = _ref12.rootEl, parentEl2 = _ref12.parentEl, sortable = _ref12.sortable, dispatchSortableEvent = _ref12.dispatchSortableEvent, oldIndex2 = _ref12.oldIndex, putSortable2 = _ref12.putSortable;
      var toSortable = putSortable2 || this.sortable;
      if (!evt) return;
      var options = this.options, children = parentEl2.children;
      if (!dragStarted) {
        if (options.multiDragKey && !this.multiDragKeyDown) {
          this._deselectMultiDrag();
        }
        toggleClass(dragEl$1, options.selectedClass, !~multiDragElements.indexOf(dragEl$1));
        if (!~multiDragElements.indexOf(dragEl$1)) {
          multiDragElements.push(dragEl$1);
          dispatchEvent({
            sortable,
            rootEl: rootEl2,
            name: "select",
            targetEl: dragEl$1
          });
          if (evt.shiftKey && lastMultiDragSelect && sortable.el.contains(lastMultiDragSelect)) {
            var lastIndex = index(lastMultiDragSelect), currentIndex = index(dragEl$1);
            if (~lastIndex && ~currentIndex && lastIndex !== currentIndex) {
              var n, i;
              if (currentIndex > lastIndex) {
                i = lastIndex;
                n = currentIndex;
              } else {
                i = currentIndex;
                n = lastIndex + 1;
              }
              for (; i < n; i++) {
                if (~multiDragElements.indexOf(children[i])) continue;
                toggleClass(children[i], options.selectedClass, true);
                multiDragElements.push(children[i]);
                dispatchEvent({
                  sortable,
                  rootEl: rootEl2,
                  name: "select",
                  targetEl: children[i]
                });
              }
            }
          } else {
            lastMultiDragSelect = dragEl$1;
          }
          multiDragSortable = toSortable;
        } else {
          multiDragElements.splice(multiDragElements.indexOf(dragEl$1), 1);
          lastMultiDragSelect = null;
          dispatchEvent({
            sortable,
            rootEl: rootEl2,
            name: "deselect",
            targetEl: dragEl$1
          });
        }
      }
      if (dragStarted && this.isMultiDrag) {
        folding = false;
        if ((parentEl2[expando].options.sort || parentEl2 !== rootEl2) && multiDragElements.length > 1) {
          var dragRect = getRect(dragEl$1), multiDragIndex = index(dragEl$1, ":not(." + this.options.selectedClass + ")");
          if (!initialFolding && options.animation) dragEl$1.thisAnimationDuration = null;
          toSortable.captureAnimationState();
          if (!initialFolding) {
            if (options.animation) {
              dragEl$1.fromRect = dragRect;
              multiDragElements.forEach(function(multiDragElement) {
                multiDragElement.thisAnimationDuration = null;
                if (multiDragElement !== dragEl$1) {
                  var rect = folding ? getRect(multiDragElement) : dragRect;
                  multiDragElement.fromRect = rect;
                  toSortable.addAnimationState({
                    target: multiDragElement,
                    rect
                  });
                }
              });
            }
            removeMultiDragElements();
            multiDragElements.forEach(function(multiDragElement) {
              if (children[multiDragIndex]) {
                parentEl2.insertBefore(multiDragElement, children[multiDragIndex]);
              } else {
                parentEl2.appendChild(multiDragElement);
              }
              multiDragIndex++;
            });
            if (oldIndex2 === index(dragEl$1)) {
              var update = false;
              multiDragElements.forEach(function(multiDragElement) {
                if (multiDragElement.sortableIndex !== index(multiDragElement)) {
                  update = true;
                  return;
                }
              });
              if (update) {
                dispatchSortableEvent("update");
              }
            }
          }
          multiDragElements.forEach(function(multiDragElement) {
            unsetRect(multiDragElement);
          });
          toSortable.animateAll();
        }
        multiDragSortable = toSortable;
      }
      if (rootEl2 === parentEl2 || putSortable2 && putSortable2.lastPutMode !== "clone") {
        multiDragClones.forEach(function(clone2) {
          clone2.parentNode && clone2.parentNode.removeChild(clone2);
        });
      }
    },
    nullingGlobal: function nullingGlobal() {
      this.isMultiDrag = dragStarted = false;
      multiDragClones.length = 0;
    },
    destroyGlobal: function destroyGlobal() {
      this._deselectMultiDrag();
      off(document, "pointerup", this._deselectMultiDrag);
      off(document, "mouseup", this._deselectMultiDrag);
      off(document, "touchend", this._deselectMultiDrag);
      off(document, "keydown", this._checkKeyDown);
      off(document, "keyup", this._checkKeyUp);
    },
    _deselectMultiDrag: function _deselectMultiDrag(evt) {
      if (typeof dragStarted !== "undefined" && dragStarted) return;
      if (multiDragSortable !== this.sortable) return;
      if (evt && closest(evt.target, this.options.draggable, this.sortable.el, false)) return;
      if (evt && evt.button !== 0) return;
      while (multiDragElements.length) {
        var el = multiDragElements[0];
        toggleClass(el, this.options.selectedClass, false);
        multiDragElements.shift();
        dispatchEvent({
          sortable: this.sortable,
          rootEl: this.sortable.el,
          name: "deselect",
          targetEl: el
        });
      }
    },
    _checkKeyDown: function _checkKeyDown(evt) {
      if (evt.key === this.options.multiDragKey) {
        this.multiDragKeyDown = true;
      }
    },
    _checkKeyUp: function _checkKeyUp(evt) {
      if (evt.key === this.options.multiDragKey) {
        this.multiDragKeyDown = false;
      }
    }
  };
  return _extends(MultiDrag, {
    // Static methods & properties
    pluginName: "multiDrag",
    utils: {
      /**
       * Selects the provided multi-drag item
       * @param  {HTMLElement} el    The element to be selected
       */
      select: function select(el) {
        var sortable = el.parentNode[expando];
        if (!sortable || !sortable.options.multiDrag || ~multiDragElements.indexOf(el)) return;
        if (multiDragSortable && multiDragSortable !== sortable) {
          multiDragSortable.multiDrag._deselectMultiDrag();
          multiDragSortable = sortable;
        }
        toggleClass(el, sortable.options.selectedClass, true);
        multiDragElements.push(el);
      },
      /**
       * Deselects the provided multi-drag item
       * @param  {HTMLElement} el    The element to be deselected
       */
      deselect: function deselect(el) {
        var sortable = el.parentNode[expando], index2 = multiDragElements.indexOf(el);
        if (!sortable || !sortable.options.multiDrag || !~index2) return;
        toggleClass(el, sortable.options.selectedClass, false);
        multiDragElements.splice(index2, 1);
      }
    },
    eventProperties: function eventProperties() {
      var _this3 = this;
      var oldIndicies = [], newIndicies = [];
      multiDragElements.forEach(function(multiDragElement) {
        oldIndicies.push({
          multiDragElement,
          index: multiDragElement.sortableIndex
        });
        var newIndex2;
        if (folding && multiDragElement !== dragEl$1) {
          newIndex2 = -1;
        } else if (folding) {
          newIndex2 = index(multiDragElement, ":not(." + _this3.options.selectedClass + ")");
        } else {
          newIndex2 = index(multiDragElement);
        }
        newIndicies.push({
          multiDragElement,
          index: newIndex2
        });
      });
      return {
        items: _toConsumableArray(multiDragElements),
        clones: [].concat(multiDragClones),
        oldIndicies,
        newIndicies
      };
    },
    optionListeners: {
      multiDragKey: function multiDragKey(key) {
        key = key.toLowerCase();
        if (key === "ctrl") {
          key = "Control";
        } else if (key.length > 1) {
          key = key.charAt(0).toUpperCase() + key.substr(1);
        }
        return key;
      }
    }
  });
}
function insertMultiDragElements(clonesInserted, rootEl2) {
  multiDragElements.forEach(function(multiDragElement, i) {
    var target = rootEl2.children[multiDragElement.sortableIndex + (clonesInserted ? Number(i) : 0)];
    if (target) {
      rootEl2.insertBefore(multiDragElement, target);
    } else {
      rootEl2.appendChild(multiDragElement);
    }
  });
}
function insertMultiDragClones(elementsInserted, rootEl2) {
  multiDragClones.forEach(function(clone2, i) {
    var target = rootEl2.children[clone2.sortableIndex + (elementsInserted ? Number(i) : 0)];
    if (target) {
      rootEl2.insertBefore(clone2, target);
    } else {
      rootEl2.appendChild(clone2);
    }
  });
}
function removeMultiDragElements() {
  multiDragElements.forEach(function(multiDragElement) {
    if (multiDragElement === dragEl$1) return;
    multiDragElement.parentNode && multiDragElement.parentNode.removeChild(multiDragElement);
  });
}
Sortable.mount(new AutoScrollPlugin());
Sortable.mount(Remove, Revert);
const sortable_esm = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  MultiDrag: MultiDragPlugin,
  Sortable,
  Swap: SwapPlugin,
  default: Sortable
}, Symbol.toStringTag, { value: "Module" }));
const require$$1 = /* @__PURE__ */ getAugmentedNamespace(sortable_esm);
(function(module, exports$1) {
  (function webpackUniversalModuleDefinition(root, factory2) {
    module.exports = factory2(require$$0, require$$1);
  })(typeof self !== "undefined" ? self : commonjsGlobal, function(__WEBPACK_EXTERNAL_MODULE__8bbf__, __WEBPACK_EXTERNAL_MODULE_a352__) {
    return (
      /******/
      function(modules) {
        var installedModules = {};
        function __webpack_require__(moduleId) {
          if (installedModules[moduleId]) {
            return installedModules[moduleId].exports;
          }
          var module2 = installedModules[moduleId] = {
            /******/
            i: moduleId,
            /******/
            l: false,
            /******/
            exports: {}
            /******/
          };
          modules[moduleId].call(module2.exports, module2, module2.exports, __webpack_require__);
          module2.l = true;
          return module2.exports;
        }
        __webpack_require__.m = modules;
        __webpack_require__.c = installedModules;
        __webpack_require__.d = function(exports$12, name, getter) {
          if (!__webpack_require__.o(exports$12, name)) {
            Object.defineProperty(exports$12, name, { enumerable: true, get: getter });
          }
        };
        __webpack_require__.r = function(exports$12) {
          if (typeof Symbol !== "undefined" && Symbol.toStringTag) {
            Object.defineProperty(exports$12, Symbol.toStringTag, { value: "Module" });
          }
          Object.defineProperty(exports$12, "__esModule", { value: true });
        };
        __webpack_require__.t = function(value, mode) {
          if (mode & 1) value = __webpack_require__(value);
          if (mode & 8) return value;
          if (mode & 4 && typeof value === "object" && value && value.__esModule) return value;
          var ns = /* @__PURE__ */ Object.create(null);
          __webpack_require__.r(ns);
          Object.defineProperty(ns, "default", { enumerable: true, value });
          if (mode & 2 && typeof value != "string") for (var key in value) __webpack_require__.d(ns, key, (function(key2) {
            return value[key2];
          }).bind(null, key));
          return ns;
        };
        __webpack_require__.n = function(module2) {
          var getter = module2 && module2.__esModule ? (
            /******/
            function getDefault() {
              return module2["default"];
            }
          ) : (
            /******/
            function getModuleExports() {
              return module2;
            }
          );
          __webpack_require__.d(getter, "a", getter);
          return getter;
        };
        __webpack_require__.o = function(object, property) {
          return Object.prototype.hasOwnProperty.call(object, property);
        };
        __webpack_require__.p = "";
        return __webpack_require__(__webpack_require__.s = "fb15");
      }({
        /***/
        "00ee": (
          /***/
          function(module2, exports$12, __webpack_require__) {
            var wellKnownSymbol = __webpack_require__("b622");
            var TO_STRING_TAG = wellKnownSymbol("toStringTag");
            var test2 = {};
            test2[TO_STRING_TAG] = "z";
            module2.exports = String(test2) === "[object z]";
          }
        ),
        /***/
        "0366": (
          /***/
          function(module2, exports$12, __webpack_require__) {
            var aFunction = __webpack_require__("1c0b");
            module2.exports = function(fn, that, length) {
              aFunction(fn);
              if (that === void 0) return fn;
              switch (length) {
                case 0:
                  return function() {
                    return fn.call(that);
                  };
                case 1:
                  return function(a) {
                    return fn.call(that, a);
                  };
                case 2:
                  return function(a, b) {
                    return fn.call(that, a, b);
                  };
                case 3:
                  return function(a, b, c) {
                    return fn.call(that, a, b, c);
                  };
              }
              return function() {
                return fn.apply(that, arguments);
              };
            };
          }
        ),
        /***/
        "057f": (
          /***/
          function(module2, exports$12, __webpack_require__) {
            var toIndexedObject = __webpack_require__("fc6a");
            var nativeGetOwnPropertyNames = __webpack_require__("241c").f;
            var toString3 = {}.toString;
            var windowNames = typeof window == "object" && window && Object.getOwnPropertyNames ? Object.getOwnPropertyNames(window) : [];
            var getWindowNames = function(it) {
              try {
                return nativeGetOwnPropertyNames(it);
              } catch (error) {
                return windowNames.slice();
              }
            };
            module2.exports.f = function getOwnPropertyNames(it) {
              return windowNames && toString3.call(it) == "[object Window]" ? getWindowNames(it) : nativeGetOwnPropertyNames(toIndexedObject(it));
            };
          }
        ),
        /***/
        "06cf": (
          /***/
          function(module2, exports$12, __webpack_require__) {
            var DESCRIPTORS = __webpack_require__("83ab");
            var propertyIsEnumerableModule = __webpack_require__("d1e7");
            var createPropertyDescriptor = __webpack_require__("5c6c");
            var toIndexedObject = __webpack_require__("fc6a");
            var toPrimitive = __webpack_require__("c04e");
            var has = __webpack_require__("5135");
            var IE8_DOM_DEFINE = __webpack_require__("0cfb");
            var nativeGetOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
            exports$12.f = DESCRIPTORS ? nativeGetOwnPropertyDescriptor : function getOwnPropertyDescriptor(O, P) {
              O = toIndexedObject(O);
              P = toPrimitive(P, true);
              if (IE8_DOM_DEFINE) try {
                return nativeGetOwnPropertyDescriptor(O, P);
              } catch (error) {
              }
              if (has(O, P)) return createPropertyDescriptor(!propertyIsEnumerableModule.f.call(O, P), O[P]);
            };
          }
        ),
        /***/
        "0cfb": (
          /***/
          function(module2, exports$12, __webpack_require__) {
            var DESCRIPTORS = __webpack_require__("83ab");
            var fails = __webpack_require__("d039");
            var createElement = __webpack_require__("cc12");
            module2.exports = !DESCRIPTORS && !fails(function() {
              return Object.defineProperty(createElement("div"), "a", {
                get: function() {
                  return 7;
                }
              }).a != 7;
            });
          }
        ),
        /***/
        "13d5": (
          /***/
          function(module2, exports$12, __webpack_require__) {
            var $ = __webpack_require__("23e7");
            var $reduce = __webpack_require__("d58f").left;
            var arrayMethodIsStrict = __webpack_require__("a640");
            var arrayMethodUsesToLength = __webpack_require__("ae40");
            var STRICT_METHOD = arrayMethodIsStrict("reduce");
            var USES_TO_LENGTH = arrayMethodUsesToLength("reduce", { 1: 0 });
            $({ target: "Array", proto: true, forced: !STRICT_METHOD || !USES_TO_LENGTH }, {
              reduce: function reduce(callbackfn) {
                return $reduce(this, callbackfn, arguments.length, arguments.length > 1 ? arguments[1] : void 0);
              }
            });
          }
        ),
        /***/
        "14c3": (
          /***/
          function(module2, exports$12, __webpack_require__) {
            var classof = __webpack_require__("c6b6");
            var regexpExec = __webpack_require__("9263");
            module2.exports = function(R, S) {
              var exec = R.exec;
              if (typeof exec === "function") {
                var result = exec.call(R, S);
                if (typeof result !== "object") {
                  throw TypeError("RegExp exec method returned something other than an Object or null");
                }
                return result;
              }
              if (classof(R) !== "RegExp") {
                throw TypeError("RegExp#exec called on incompatible receiver");
              }
              return regexpExec.call(R, S);
            };
          }
        ),
        /***/
        "159b": (
          /***/
          function(module2, exports$12, __webpack_require__) {
            var global2 = __webpack_require__("da84");
            var DOMIterables = __webpack_require__("fdbc");
            var forEach2 = __webpack_require__("17c2");
            var createNonEnumerableProperty = __webpack_require__("9112");
            for (var COLLECTION_NAME in DOMIterables) {
              var Collection = global2[COLLECTION_NAME];
              var CollectionPrototype = Collection && Collection.prototype;
              if (CollectionPrototype && CollectionPrototype.forEach !== forEach2) try {
                createNonEnumerableProperty(CollectionPrototype, "forEach", forEach2);
              } catch (error) {
                CollectionPrototype.forEach = forEach2;
              }
            }
          }
        ),
        /***/
        "17c2": (
          /***/
          function(module2, exports$12, __webpack_require__) {
            var $forEach = __webpack_require__("b727").forEach;
            var arrayMethodIsStrict = __webpack_require__("a640");
            var arrayMethodUsesToLength = __webpack_require__("ae40");
            var STRICT_METHOD = arrayMethodIsStrict("forEach");
            var USES_TO_LENGTH = arrayMethodUsesToLength("forEach");
            module2.exports = !STRICT_METHOD || !USES_TO_LENGTH ? function forEach2(callbackfn) {
              return $forEach(this, callbackfn, arguments.length > 1 ? arguments[1] : void 0);
            } : [].forEach;
          }
        ),
        /***/
        "1be4": (
          /***/
          function(module2, exports$12, __webpack_require__) {
            var getBuiltIn = __webpack_require__("d066");
            module2.exports = getBuiltIn("document", "documentElement");
          }
        ),
        /***/
        "1c0b": (
          /***/
          function(module2, exports$12) {
            module2.exports = function(it) {
              if (typeof it != "function") {
                throw TypeError(String(it) + " is not a function");
              }
              return it;
            };
          }
        ),
        /***/
        "1c7e": (
          /***/
          function(module2, exports$12, __webpack_require__) {
            var wellKnownSymbol = __webpack_require__("b622");
            var ITERATOR = wellKnownSymbol("iterator");
            var SAFE_CLOSING = false;
            try {
              var called = 0;
              var iteratorWithReturn = {
                next: function() {
                  return { done: !!called++ };
                },
                "return": function() {
                  SAFE_CLOSING = true;
                }
              };
              iteratorWithReturn[ITERATOR] = function() {
                return this;
              };
              Array.from(iteratorWithReturn, function() {
                throw 2;
              });
            } catch (error) {
            }
            module2.exports = function(exec, SKIP_CLOSING) {
              if (!SKIP_CLOSING && !SAFE_CLOSING) return false;
              var ITERATION_SUPPORT = false;
              try {
                var object = {};
                object[ITERATOR] = function() {
                  return {
                    next: function() {
                      return { done: ITERATION_SUPPORT = true };
                    }
                  };
                };
                exec(object);
              } catch (error) {
              }
              return ITERATION_SUPPORT;
            };
          }
        ),
        /***/
        "1d80": (
          /***/
          function(module2, exports$12) {
            module2.exports = function(it) {
              if (it == void 0) throw TypeError("Can't call method on " + it);
              return it;
            };
          }
        ),
        /***/
        "1dde": (
          /***/
          function(module2, exports$12, __webpack_require__) {
            var fails = __webpack_require__("d039");
            var wellKnownSymbol = __webpack_require__("b622");
            var V8_VERSION = __webpack_require__("2d00");
            var SPECIES = wellKnownSymbol("species");
            module2.exports = function(METHOD_NAME) {
              return V8_VERSION >= 51 || !fails(function() {
                var array = [];
                var constructor = array.constructor = {};
                constructor[SPECIES] = function() {
                  return { foo: 1 };
                };
                return array[METHOD_NAME](Boolean).foo !== 1;
              });
            };
          }
        ),
        /***/
        "23cb": (
          /***/
          function(module2, exports$12, __webpack_require__) {
            var toInteger = __webpack_require__("a691");
            var max = Math.max;
            var min = Math.min;
            module2.exports = function(index2, length) {
              var integer = toInteger(index2);
              return integer < 0 ? max(integer + length, 0) : min(integer, length);
            };
          }
        ),
        /***/
        "23e7": (
          /***/
          function(module2, exports$12, __webpack_require__) {
            var global2 = __webpack_require__("da84");
            var getOwnPropertyDescriptor = __webpack_require__("06cf").f;
            var createNonEnumerableProperty = __webpack_require__("9112");
            var redefine = __webpack_require__("6eeb");
            var setGlobal = __webpack_require__("ce4e");
            var copyConstructorProperties = __webpack_require__("e893");
            var isForced = __webpack_require__("94ca");
            module2.exports = function(options, source) {
              var TARGET = options.target;
              var GLOBAL = options.global;
              var STATIC = options.stat;
              var FORCED, target, key, targetProperty, sourceProperty, descriptor;
              if (GLOBAL) {
                target = global2;
              } else if (STATIC) {
                target = global2[TARGET] || setGlobal(TARGET, {});
              } else {
                target = (global2[TARGET] || {}).prototype;
              }
              if (target) for (key in source) {
                sourceProperty = source[key];
                if (options.noTargetGet) {
                  descriptor = getOwnPropertyDescriptor(target, key);
                  targetProperty = descriptor && descriptor.value;
                } else targetProperty = target[key];
                FORCED = isForced(GLOBAL ? key : TARGET + (STATIC ? "." : "#") + key, options.forced);
                if (!FORCED && targetProperty !== void 0) {
                  if (typeof sourceProperty === typeof targetProperty) continue;
                  copyConstructorProperties(sourceProperty, targetProperty);
                }
                if (options.sham || targetProperty && targetProperty.sham) {
                  createNonEnumerableProperty(sourceProperty, "sham", true);
                }
                redefine(target, key, sourceProperty, options);
              }
            };
          }
        ),
        /***/
        "241c": (
          /***/
          function(module2, exports$12, __webpack_require__) {
            var internalObjectKeys = __webpack_require__("ca84");
            var enumBugKeys = __webpack_require__("7839");
            var hiddenKeys = enumBugKeys.concat("length", "prototype");
            exports$12.f = Object.getOwnPropertyNames || function getOwnPropertyNames(O) {
              return internalObjectKeys(O, hiddenKeys);
            };
          }
        ),
        /***/
        "25f0": (
          /***/
          function(module2, exports$12, __webpack_require__) {
            var redefine = __webpack_require__("6eeb");
            var anObject = __webpack_require__("825a");
            var fails = __webpack_require__("d039");
            var flags = __webpack_require__("ad6d");
            var TO_STRING = "toString";
            var RegExpPrototype = RegExp.prototype;
            var nativeToString = RegExpPrototype[TO_STRING];
            var NOT_GENERIC = fails(function() {
              return nativeToString.call({ source: "a", flags: "b" }) != "/a/b";
            });
            var INCORRECT_NAME = nativeToString.name != TO_STRING;
            if (NOT_GENERIC || INCORRECT_NAME) {
              redefine(RegExp.prototype, TO_STRING, function toString3() {
                var R = anObject(this);
                var p = String(R.source);
                var rf = R.flags;
                var f = String(rf === void 0 && R instanceof RegExp && !("flags" in RegExpPrototype) ? flags.call(R) : rf);
                return "/" + p + "/" + f;
              }, { unsafe: true });
            }
          }
        ),
        /***/
        "2ca0": (
          /***/
          function(module2, exports$12, __webpack_require__) {
            var $ = __webpack_require__("23e7");
            var getOwnPropertyDescriptor = __webpack_require__("06cf").f;
            var toLength = __webpack_require__("50c4");
            var notARegExp = __webpack_require__("5a34");
            var requireObjectCoercible = __webpack_require__("1d80");
            var correctIsRegExpLogic = __webpack_require__("ab13");
            var IS_PURE = __webpack_require__("c430");
            var nativeStartsWith = "".startsWith;
            var min = Math.min;
            var CORRECT_IS_REGEXP_LOGIC = correctIsRegExpLogic("startsWith");
            var MDN_POLYFILL_BUG = !IS_PURE && !CORRECT_IS_REGEXP_LOGIC && !!function() {
              var descriptor = getOwnPropertyDescriptor(String.prototype, "startsWith");
              return descriptor && !descriptor.writable;
            }();
            $({ target: "String", proto: true, forced: !MDN_POLYFILL_BUG && !CORRECT_IS_REGEXP_LOGIC }, {
              startsWith: function startsWith(searchString) {
                var that = String(requireObjectCoercible(this));
                notARegExp(searchString);
                var index2 = toLength(min(arguments.length > 1 ? arguments[1] : void 0, that.length));
                var search = String(searchString);
                return nativeStartsWith ? nativeStartsWith.call(that, search, index2) : that.slice(index2, index2 + search.length) === search;
              }
            });
          }
        ),
        /***/
        "2d00": (
          /***/
          function(module2, exports$12, __webpack_require__) {
            var global2 = __webpack_require__("da84");
            var userAgent2 = __webpack_require__("342f");
            var process2 = global2.process;
            var versions = process2 && process2.versions;
            var v8 = versions && versions.v8;
            var match, version2;
            if (v8) {
              match = v8.split(".");
              version2 = match[0] + match[1];
            } else if (userAgent2) {
              match = userAgent2.match(/Edge\/(\d+)/);
              if (!match || match[1] >= 74) {
                match = userAgent2.match(/Chrome\/(\d+)/);
                if (match) version2 = match[1];
              }
            }
            module2.exports = version2 && +version2;
          }
        ),
        /***/
        "342f": (
          /***/
          function(module2, exports$12, __webpack_require__) {
            var getBuiltIn = __webpack_require__("d066");
            module2.exports = getBuiltIn("navigator", "userAgent") || "";
          }
        ),
        /***/
        "35a1": (
          /***/
          function(module2, exports$12, __webpack_require__) {
            var classof = __webpack_require__("f5df");
            var Iterators = __webpack_require__("3f8c");
            var wellKnownSymbol = __webpack_require__("b622");
            var ITERATOR = wellKnownSymbol("iterator");
            module2.exports = function(it) {
              if (it != void 0) return it[ITERATOR] || it["@@iterator"] || Iterators[classof(it)];
            };
          }
        ),
        /***/
        "37e8": (
          /***/
          function(module2, exports$12, __webpack_require__) {
            var DESCRIPTORS = __webpack_require__("83ab");
            var definePropertyModule = __webpack_require__("9bf2");
            var anObject = __webpack_require__("825a");
            var objectKeys = __webpack_require__("df75");
            module2.exports = DESCRIPTORS ? Object.defineProperties : function defineProperties(O, Properties) {
              anObject(O);
              var keys = objectKeys(Properties);
              var length = keys.length;
              var index2 = 0;
              var key;
              while (length > index2) definePropertyModule.f(O, key = keys[index2++], Properties[key]);
              return O;
            };
          }
        ),
        /***/
        "3bbe": (
          /***/
          function(module2, exports$12, __webpack_require__) {
            var isObject2 = __webpack_require__("861d");
            module2.exports = function(it) {
              if (!isObject2(it) && it !== null) {
                throw TypeError("Can't set " + String(it) + " as a prototype");
              }
              return it;
            };
          }
        ),
        /***/
        "3ca3": (
          /***/
          function(module2, exports$12, __webpack_require__) {
            var charAt = __webpack_require__("6547").charAt;
            var InternalStateModule = __webpack_require__("69f3");
            var defineIterator = __webpack_require__("7dd0");
            var STRING_ITERATOR = "String Iterator";
            var setInternalState = InternalStateModule.set;
            var getInternalState = InternalStateModule.getterFor(STRING_ITERATOR);
            defineIterator(String, "String", function(iterated) {
              setInternalState(this, {
                type: STRING_ITERATOR,
                string: String(iterated),
                index: 0
              });
            }, function next() {
              var state = getInternalState(this);
              var string = state.string;
              var index2 = state.index;
              var point;
              if (index2 >= string.length) return { value: void 0, done: true };
              point = charAt(string, index2);
              state.index += point.length;
              return { value: point, done: false };
            });
          }
        ),
        /***/
        "3f8c": (
          /***/
          function(module2, exports$12) {
            module2.exports = {};
          }
        ),
        /***/
        "4160": (
          /***/
          function(module2, exports$12, __webpack_require__) {
            var $ = __webpack_require__("23e7");
            var forEach2 = __webpack_require__("17c2");
            $({ target: "Array", proto: true, forced: [].forEach != forEach2 }, {
              forEach: forEach2
            });
          }
        ),
        /***/
        "428f": (
          /***/
          function(module2, exports$12, __webpack_require__) {
            var global2 = __webpack_require__("da84");
            module2.exports = global2;
          }
        ),
        /***/
        "44ad": (
          /***/
          function(module2, exports$12, __webpack_require__) {
            var fails = __webpack_require__("d039");
            var classof = __webpack_require__("c6b6");
            var split = "".split;
            module2.exports = fails(function() {
              return !Object("z").propertyIsEnumerable(0);
            }) ? function(it) {
              return classof(it) == "String" ? split.call(it, "") : Object(it);
            } : Object;
          }
        ),
        /***/
        "44d2": (
          /***/
          function(module2, exports$12, __webpack_require__) {
            var wellKnownSymbol = __webpack_require__("b622");
            var create = __webpack_require__("7c73");
            var definePropertyModule = __webpack_require__("9bf2");
            var UNSCOPABLES = wellKnownSymbol("unscopables");
            var ArrayPrototype = Array.prototype;
            if (ArrayPrototype[UNSCOPABLES] == void 0) {
              definePropertyModule.f(ArrayPrototype, UNSCOPABLES, {
                configurable: true,
                value: create(null)
              });
            }
            module2.exports = function(key) {
              ArrayPrototype[UNSCOPABLES][key] = true;
            };
          }
        ),
        /***/
        "44e7": (
          /***/
          function(module2, exports$12, __webpack_require__) {
            var isObject2 = __webpack_require__("861d");
            var classof = __webpack_require__("c6b6");
            var wellKnownSymbol = __webpack_require__("b622");
            var MATCH = wellKnownSymbol("match");
            module2.exports = function(it) {
              var isRegExp2;
              return isObject2(it) && ((isRegExp2 = it[MATCH]) !== void 0 ? !!isRegExp2 : classof(it) == "RegExp");
            };
          }
        ),
        /***/
        "4930": (
          /***/
          function(module2, exports$12, __webpack_require__) {
            var fails = __webpack_require__("d039");
            module2.exports = !!Object.getOwnPropertySymbols && !fails(function() {
              return !String(Symbol());
            });
          }
        ),
        /***/
        "4d64": (
          /***/
          function(module2, exports$12, __webpack_require__) {
            var toIndexedObject = __webpack_require__("fc6a");
            var toLength = __webpack_require__("50c4");
            var toAbsoluteIndex = __webpack_require__("23cb");
            var createMethod = function(IS_INCLUDES) {
              return function($this, el, fromIndex) {
                var O = toIndexedObject($this);
                var length = toLength(O.length);
                var index2 = toAbsoluteIndex(fromIndex, length);
                var value;
                if (IS_INCLUDES && el != el) while (length > index2) {
                  value = O[index2++];
                  if (value != value) return true;
                }
                else for (; length > index2; index2++) {
                  if ((IS_INCLUDES || index2 in O) && O[index2] === el) return IS_INCLUDES || index2 || 0;
                }
                return !IS_INCLUDES && -1;
              };
            };
            module2.exports = {
              // `Array.prototype.includes` method
              // https://tc39.github.io/ecma262/#sec-array.prototype.includes
              includes: createMethod(true),
              // `Array.prototype.indexOf` method
              // https://tc39.github.io/ecma262/#sec-array.prototype.indexof
              indexOf: createMethod(false)
            };
          }
        ),
        /***/
        "4de4": (
          /***/
          function(module2, exports$12, __webpack_require__) {
            var $ = __webpack_require__("23e7");
            var $filter = __webpack_require__("b727").filter;
            var arrayMethodHasSpeciesSupport = __webpack_require__("1dde");
            var arrayMethodUsesToLength = __webpack_require__("ae40");
            var HAS_SPECIES_SUPPORT = arrayMethodHasSpeciesSupport("filter");
            var USES_TO_LENGTH = arrayMethodUsesToLength("filter");
            $({ target: "Array", proto: true, forced: !HAS_SPECIES_SUPPORT || !USES_TO_LENGTH }, {
              filter: function filter2(callbackfn) {
                return $filter(this, callbackfn, arguments.length > 1 ? arguments[1] : void 0);
              }
            });
          }
        ),
        /***/
        "4df4": (
          /***/
          function(module2, exports$12, __webpack_require__) {
            var bind2 = __webpack_require__("0366");
            var toObject = __webpack_require__("7b0b");
            var callWithSafeIterationClosing = __webpack_require__("9bdd");
            var isArrayIteratorMethod = __webpack_require__("e95a");
            var toLength = __webpack_require__("50c4");
            var createProperty = __webpack_require__("8418");
            var getIteratorMethod = __webpack_require__("35a1");
            module2.exports = function from(arrayLike) {
              var O = toObject(arrayLike);
              var C = typeof this == "function" ? this : Array;
              var argumentsLength = arguments.length;
              var mapfn = argumentsLength > 1 ? arguments[1] : void 0;
              var mapping = mapfn !== void 0;
              var iteratorMethod = getIteratorMethod(O);
              var index2 = 0;
              var length, result, step, iterator2, next, value;
              if (mapping) mapfn = bind2(mapfn, argumentsLength > 2 ? arguments[2] : void 0, 2);
              if (iteratorMethod != void 0 && !(C == Array && isArrayIteratorMethod(iteratorMethod))) {
                iterator2 = iteratorMethod.call(O);
                next = iterator2.next;
                result = new C();
                for (; !(step = next.call(iterator2)).done; index2++) {
                  value = mapping ? callWithSafeIterationClosing(iterator2, mapfn, [step.value, index2], true) : step.value;
                  createProperty(result, index2, value);
                }
              } else {
                length = toLength(O.length);
                result = new C(length);
                for (; length > index2; index2++) {
                  value = mapping ? mapfn(O[index2], index2) : O[index2];
                  createProperty(result, index2, value);
                }
              }
              result.length = index2;
              return result;
            };
          }
        ),
        /***/
        "4fad": (
          /***/
          function(module2, exports$12, __webpack_require__) {
            var $ = __webpack_require__("23e7");
            var $entries = __webpack_require__("6f53").entries;
            $({ target: "Object", stat: true }, {
              entries: function entries(O) {
                return $entries(O);
              }
            });
          }
        ),
        /***/
        "50c4": (
          /***/
          function(module2, exports$12, __webpack_require__) {
            var toInteger = __webpack_require__("a691");
            var min = Math.min;
            module2.exports = function(argument) {
              return argument > 0 ? min(toInteger(argument), 9007199254740991) : 0;
            };
          }
        ),
        /***/
        "5135": (
          /***/
          function(module2, exports$12) {
            var hasOwnProperty2 = {}.hasOwnProperty;
            module2.exports = function(it, key) {
              return hasOwnProperty2.call(it, key);
            };
          }
        ),
        /***/
        "5319": (
          /***/
          function(module2, exports$12, __webpack_require__) {
            var fixRegExpWellKnownSymbolLogic = __webpack_require__("d784");
            var anObject = __webpack_require__("825a");
            var toObject = __webpack_require__("7b0b");
            var toLength = __webpack_require__("50c4");
            var toInteger = __webpack_require__("a691");
            var requireObjectCoercible = __webpack_require__("1d80");
            var advanceStringIndex = __webpack_require__("8aa5");
            var regExpExec = __webpack_require__("14c3");
            var max = Math.max;
            var min = Math.min;
            var floor = Math.floor;
            var SUBSTITUTION_SYMBOLS = /\$([$&'`]|\d\d?|<[^>]*>)/g;
            var SUBSTITUTION_SYMBOLS_NO_NAMED = /\$([$&'`]|\d\d?)/g;
            var maybeToString = function(it) {
              return it === void 0 ? it : String(it);
            };
            fixRegExpWellKnownSymbolLogic("replace", 2, function(REPLACE, nativeReplace, maybeCallNative, reason) {
              var REGEXP_REPLACE_SUBSTITUTES_UNDEFINED_CAPTURE = reason.REGEXP_REPLACE_SUBSTITUTES_UNDEFINED_CAPTURE;
              var REPLACE_KEEPS_$0 = reason.REPLACE_KEEPS_$0;
              var UNSAFE_SUBSTITUTE = REGEXP_REPLACE_SUBSTITUTES_UNDEFINED_CAPTURE ? "$" : "$0";
              return [
                // `String.prototype.replace` method
                // https://tc39.github.io/ecma262/#sec-string.prototype.replace
                function replace(searchValue, replaceValue) {
                  var O = requireObjectCoercible(this);
                  var replacer = searchValue == void 0 ? void 0 : searchValue[REPLACE];
                  return replacer !== void 0 ? replacer.call(searchValue, O, replaceValue) : nativeReplace.call(String(O), searchValue, replaceValue);
                },
                // `RegExp.prototype[@@replace]` method
                // https://tc39.github.io/ecma262/#sec-regexp.prototype-@@replace
                function(regexp, replaceValue) {
                  if (!REGEXP_REPLACE_SUBSTITUTES_UNDEFINED_CAPTURE && REPLACE_KEEPS_$0 || typeof replaceValue === "string" && replaceValue.indexOf(UNSAFE_SUBSTITUTE) === -1) {
                    var res = maybeCallNative(nativeReplace, regexp, this, replaceValue);
                    if (res.done) return res.value;
                  }
                  var rx = anObject(regexp);
                  var S = String(this);
                  var functionalReplace = typeof replaceValue === "function";
                  if (!functionalReplace) replaceValue = String(replaceValue);
                  var global2 = rx.global;
                  if (global2) {
                    var fullUnicode = rx.unicode;
                    rx.lastIndex = 0;
                  }
                  var results = [];
                  while (true) {
                    var result = regExpExec(rx, S);
                    if (result === null) break;
                    results.push(result);
                    if (!global2) break;
                    var matchStr = String(result[0]);
                    if (matchStr === "") rx.lastIndex = advanceStringIndex(S, toLength(rx.lastIndex), fullUnicode);
                  }
                  var accumulatedResult = "";
                  var nextSourcePosition = 0;
                  for (var i = 0; i < results.length; i++) {
                    result = results[i];
                    var matched = String(result[0]);
                    var position = max(min(toInteger(result.index), S.length), 0);
                    var captures = [];
                    for (var j = 1; j < result.length; j++) captures.push(maybeToString(result[j]));
                    var namedCaptures = result.groups;
                    if (functionalReplace) {
                      var replacerArgs = [matched].concat(captures, position, S);
                      if (namedCaptures !== void 0) replacerArgs.push(namedCaptures);
                      var replacement = String(replaceValue.apply(void 0, replacerArgs));
                    } else {
                      replacement = getSubstitution(matched, S, position, captures, namedCaptures, replaceValue);
                    }
                    if (position >= nextSourcePosition) {
                      accumulatedResult += S.slice(nextSourcePosition, position) + replacement;
                      nextSourcePosition = position + matched.length;
                    }
                  }
                  return accumulatedResult + S.slice(nextSourcePosition);
                }
              ];
              function getSubstitution(matched, str, position, captures, namedCaptures, replacement) {
                var tailPos = position + matched.length;
                var m = captures.length;
                var symbols = SUBSTITUTION_SYMBOLS_NO_NAMED;
                if (namedCaptures !== void 0) {
                  namedCaptures = toObject(namedCaptures);
                  symbols = SUBSTITUTION_SYMBOLS;
                }
                return nativeReplace.call(replacement, symbols, function(match, ch) {
                  var capture;
                  switch (ch.charAt(0)) {
                    case "$":
                      return "$";
                    case "&":
                      return matched;
                    case "`":
                      return str.slice(0, position);
                    case "'":
                      return str.slice(tailPos);
                    case "<":
                      capture = namedCaptures[ch.slice(1, -1)];
                      break;
                    default:
                      var n = +ch;
                      if (n === 0) return match;
                      if (n > m) {
                        var f = floor(n / 10);
                        if (f === 0) return match;
                        if (f <= m) return captures[f - 1] === void 0 ? ch.charAt(1) : captures[f - 1] + ch.charAt(1);
                        return match;
                      }
                      capture = captures[n - 1];
                  }
                  return capture === void 0 ? "" : capture;
                });
              }
            });
          }
        ),
        /***/
        "5692": (
          /***/
          function(module2, exports$12, __webpack_require__) {
            var IS_PURE = __webpack_require__("c430");
            var store = __webpack_require__("c6cd");
            (module2.exports = function(key, value) {
              return store[key] || (store[key] = value !== void 0 ? value : {});
            })("versions", []).push({
              version: "3.6.5",
              mode: IS_PURE ? "pure" : "global",
              copyright: "© 2020 Denis Pushkarev (zloirock.ru)"
            });
          }
        ),
        /***/
        "56ef": (
          /***/
          function(module2, exports$12, __webpack_require__) {
            var getBuiltIn = __webpack_require__("d066");
            var getOwnPropertyNamesModule = __webpack_require__("241c");
            var getOwnPropertySymbolsModule = __webpack_require__("7418");
            var anObject = __webpack_require__("825a");
            module2.exports = getBuiltIn("Reflect", "ownKeys") || function ownKeys2(it) {
              var keys = getOwnPropertyNamesModule.f(anObject(it));
              var getOwnPropertySymbols = getOwnPropertySymbolsModule.f;
              return getOwnPropertySymbols ? keys.concat(getOwnPropertySymbols(it)) : keys;
            };
          }
        ),
        /***/
        "5a34": (
          /***/
          function(module2, exports$12, __webpack_require__) {
            var isRegExp2 = __webpack_require__("44e7");
            module2.exports = function(it) {
              if (isRegExp2(it)) {
                throw TypeError("The method doesn't accept regular expressions");
              }
              return it;
            };
          }
        ),
        /***/
        "5c6c": (
          /***/
          function(module2, exports$12) {
            module2.exports = function(bitmap, value) {
              return {
                enumerable: !(bitmap & 1),
                configurable: !(bitmap & 2),
                writable: !(bitmap & 4),
                value
              };
            };
          }
        ),
        /***/
        "5db7": (
          /***/
          function(module2, exports$12, __webpack_require__) {
            var $ = __webpack_require__("23e7");
            var flattenIntoArray = __webpack_require__("a2bf");
            var toObject = __webpack_require__("7b0b");
            var toLength = __webpack_require__("50c4");
            var aFunction = __webpack_require__("1c0b");
            var arraySpeciesCreate = __webpack_require__("65f0");
            $({ target: "Array", proto: true }, {
              flatMap: function flatMap(callbackfn) {
                var O = toObject(this);
                var sourceLen = toLength(O.length);
                var A;
                aFunction(callbackfn);
                A = arraySpeciesCreate(O, 0);
                A.length = flattenIntoArray(A, O, O, sourceLen, 0, 1, callbackfn, arguments.length > 1 ? arguments[1] : void 0);
                return A;
              }
            });
          }
        ),
        /***/
        "6547": (
          /***/
          function(module2, exports$12, __webpack_require__) {
            var toInteger = __webpack_require__("a691");
            var requireObjectCoercible = __webpack_require__("1d80");
            var createMethod = function(CONVERT_TO_STRING) {
              return function($this, pos) {
                var S = String(requireObjectCoercible($this));
                var position = toInteger(pos);
                var size = S.length;
                var first, second;
                if (position < 0 || position >= size) return CONVERT_TO_STRING ? "" : void 0;
                first = S.charCodeAt(position);
                return first < 55296 || first > 56319 || position + 1 === size || (second = S.charCodeAt(position + 1)) < 56320 || second > 57343 ? CONVERT_TO_STRING ? S.charAt(position) : first : CONVERT_TO_STRING ? S.slice(position, position + 2) : (first - 55296 << 10) + (second - 56320) + 65536;
              };
            };
            module2.exports = {
              // `String.prototype.codePointAt` method
              // https://tc39.github.io/ecma262/#sec-string.prototype.codepointat
              codeAt: createMethod(false),
              // `String.prototype.at` method
              // https://github.com/mathiasbynens/String.prototype.at
              charAt: createMethod(true)
            };
          }
        ),
        /***/
        "65f0": (
          /***/
          function(module2, exports$12, __webpack_require__) {
            var isObject2 = __webpack_require__("861d");
            var isArray2 = __webpack_require__("e8b5");
            var wellKnownSymbol = __webpack_require__("b622");
            var SPECIES = wellKnownSymbol("species");
            module2.exports = function(originalArray, length) {
              var C;
              if (isArray2(originalArray)) {
                C = originalArray.constructor;
                if (typeof C == "function" && (C === Array || isArray2(C.prototype))) C = void 0;
                else if (isObject2(C)) {
                  C = C[SPECIES];
                  if (C === null) C = void 0;
                }
              }
              return new (C === void 0 ? Array : C)(length === 0 ? 0 : length);
            };
          }
        ),
        /***/
        "69f3": (
          /***/
          function(module2, exports$12, __webpack_require__) {
            var NATIVE_WEAK_MAP = __webpack_require__("7f9a");
            var global2 = __webpack_require__("da84");
            var isObject2 = __webpack_require__("861d");
            var createNonEnumerableProperty = __webpack_require__("9112");
            var objectHas = __webpack_require__("5135");
            var sharedKey = __webpack_require__("f772");
            var hiddenKeys = __webpack_require__("d012");
            var WeakMap = global2.WeakMap;
            var set, get, has;
            var enforce = function(it) {
              return has(it) ? get(it) : set(it, {});
            };
            var getterFor = function(TYPE) {
              return function(it) {
                var state;
                if (!isObject2(it) || (state = get(it)).type !== TYPE) {
                  throw TypeError("Incompatible receiver, " + TYPE + " required");
                }
                return state;
              };
            };
            if (NATIVE_WEAK_MAP) {
              var store = new WeakMap();
              var wmget = store.get;
              var wmhas = store.has;
              var wmset = store.set;
              set = function(it, metadata) {
                wmset.call(store, it, metadata);
                return metadata;
              };
              get = function(it) {
                return wmget.call(store, it) || {};
              };
              has = function(it) {
                return wmhas.call(store, it);
              };
            } else {
              var STATE = sharedKey("state");
              hiddenKeys[STATE] = true;
              set = function(it, metadata) {
                createNonEnumerableProperty(it, STATE, metadata);
                return metadata;
              };
              get = function(it) {
                return objectHas(it, STATE) ? it[STATE] : {};
              };
              has = function(it) {
                return objectHas(it, STATE);
              };
            }
            module2.exports = {
              set,
              get,
              has,
              enforce,
              getterFor
            };
          }
        ),
        /***/
        "6eeb": (
          /***/
          function(module2, exports$12, __webpack_require__) {
            var global2 = __webpack_require__("da84");
            var createNonEnumerableProperty = __webpack_require__("9112");
            var has = __webpack_require__("5135");
            var setGlobal = __webpack_require__("ce4e");
            var inspectSource = __webpack_require__("8925");
            var InternalStateModule = __webpack_require__("69f3");
            var getInternalState = InternalStateModule.get;
            var enforceInternalState = InternalStateModule.enforce;
            var TEMPLATE = String(String).split("String");
            (module2.exports = function(O, key, value, options) {
              var unsafe = options ? !!options.unsafe : false;
              var simple = options ? !!options.enumerable : false;
              var noTargetGet = options ? !!options.noTargetGet : false;
              if (typeof value == "function") {
                if (typeof key == "string" && !has(value, "name")) createNonEnumerableProperty(value, "name", key);
                enforceInternalState(value).source = TEMPLATE.join(typeof key == "string" ? key : "");
              }
              if (O === global2) {
                if (simple) O[key] = value;
                else setGlobal(key, value);
                return;
              } else if (!unsafe) {
                delete O[key];
              } else if (!noTargetGet && O[key]) {
                simple = true;
              }
              if (simple) O[key] = value;
              else createNonEnumerableProperty(O, key, value);
            })(Function.prototype, "toString", function toString3() {
              return typeof this == "function" && getInternalState(this).source || inspectSource(this);
            });
          }
        ),
        /***/
        "6f53": (
          /***/
          function(module2, exports$12, __webpack_require__) {
            var DESCRIPTORS = __webpack_require__("83ab");
            var objectKeys = __webpack_require__("df75");
            var toIndexedObject = __webpack_require__("fc6a");
            var propertyIsEnumerable = __webpack_require__("d1e7").f;
            var createMethod = function(TO_ENTRIES) {
              return function(it) {
                var O = toIndexedObject(it);
                var keys = objectKeys(O);
                var length = keys.length;
                var i = 0;
                var result = [];
                var key;
                while (length > i) {
                  key = keys[i++];
                  if (!DESCRIPTORS || propertyIsEnumerable.call(O, key)) {
                    result.push(TO_ENTRIES ? [key, O[key]] : O[key]);
                  }
                }
                return result;
              };
            };
            module2.exports = {
              // `Object.entries` method
              // https://tc39.github.io/ecma262/#sec-object.entries
              entries: createMethod(true),
              // `Object.values` method
              // https://tc39.github.io/ecma262/#sec-object.values
              values: createMethod(false)
            };
          }
        ),
        /***/
        "73d9": (
          /***/
          function(module2, exports$12, __webpack_require__) {
            var addToUnscopables = __webpack_require__("44d2");
            addToUnscopables("flatMap");
          }
        ),
        /***/
        "7418": (
          /***/
          function(module2, exports$12) {
            exports$12.f = Object.getOwnPropertySymbols;
          }
        ),
        /***/
        "746f": (
          /***/
          function(module2, exports$12, __webpack_require__) {
            var path = __webpack_require__("428f");
            var has = __webpack_require__("5135");
            var wrappedWellKnownSymbolModule = __webpack_require__("e538");
            var defineProperty = __webpack_require__("9bf2").f;
            module2.exports = function(NAME) {
              var Symbol2 = path.Symbol || (path.Symbol = {});
              if (!has(Symbol2, NAME)) defineProperty(Symbol2, NAME, {
                value: wrappedWellKnownSymbolModule.f(NAME)
              });
            };
          }
        ),
        /***/
        "7839": (
          /***/
          function(module2, exports$12) {
            module2.exports = [
              "constructor",
              "hasOwnProperty",
              "isPrototypeOf",
              "propertyIsEnumerable",
              "toLocaleString",
              "toString",
              "valueOf"
            ];
          }
        ),
        /***/
        "7b0b": (
          /***/
          function(module2, exports$12, __webpack_require__) {
            var requireObjectCoercible = __webpack_require__("1d80");
            module2.exports = function(argument) {
              return Object(requireObjectCoercible(argument));
            };
          }
        ),
        /***/
        "7c73": (
          /***/
          function(module2, exports$12, __webpack_require__) {
            var anObject = __webpack_require__("825a");
            var defineProperties = __webpack_require__("37e8");
            var enumBugKeys = __webpack_require__("7839");
            var hiddenKeys = __webpack_require__("d012");
            var html = __webpack_require__("1be4");
            var documentCreateElement = __webpack_require__("cc12");
            var sharedKey = __webpack_require__("f772");
            var GT = ">";
            var LT = "<";
            var PROTOTYPE = "prototype";
            var SCRIPT = "script";
            var IE_PROTO = sharedKey("IE_PROTO");
            var EmptyConstructor = function() {
            };
            var scriptTag = function(content) {
              return LT + SCRIPT + GT + content + LT + "/" + SCRIPT + GT;
            };
            var NullProtoObjectViaActiveX = function(activeXDocument2) {
              activeXDocument2.write(scriptTag(""));
              activeXDocument2.close();
              var temp = activeXDocument2.parentWindow.Object;
              activeXDocument2 = null;
              return temp;
            };
            var NullProtoObjectViaIFrame = function() {
              var iframe = documentCreateElement("iframe");
              var JS = "java" + SCRIPT + ":";
              var iframeDocument;
              iframe.style.display = "none";
              html.appendChild(iframe);
              iframe.src = String(JS);
              iframeDocument = iframe.contentWindow.document;
              iframeDocument.open();
              iframeDocument.write(scriptTag("document.F=Object"));
              iframeDocument.close();
              return iframeDocument.F;
            };
            var activeXDocument;
            var NullProtoObject = function() {
              try {
                activeXDocument = document.domain && new ActiveXObject("htmlfile");
              } catch (error) {
              }
              NullProtoObject = activeXDocument ? NullProtoObjectViaActiveX(activeXDocument) : NullProtoObjectViaIFrame();
              var length = enumBugKeys.length;
              while (length--) delete NullProtoObject[PROTOTYPE][enumBugKeys[length]];
              return NullProtoObject();
            };
            hiddenKeys[IE_PROTO] = true;
            module2.exports = Object.create || function create(O, Properties) {
              var result;
              if (O !== null) {
                EmptyConstructor[PROTOTYPE] = anObject(O);
                result = new EmptyConstructor();
                EmptyConstructor[PROTOTYPE] = null;
                result[IE_PROTO] = O;
              } else result = NullProtoObject();
              return Properties === void 0 ? result : defineProperties(result, Properties);
            };
          }
        ),
        /***/
        "7dd0": (
          /***/
          function(module2, exports$12, __webpack_require__) {
            var $ = __webpack_require__("23e7");
            var createIteratorConstructor = __webpack_require__("9ed3");
            var getPrototypeOf2 = __webpack_require__("e163");
            var setPrototypeOf = __webpack_require__("d2bb");
            var setToStringTag = __webpack_require__("d44e");
            var createNonEnumerableProperty = __webpack_require__("9112");
            var redefine = __webpack_require__("6eeb");
            var wellKnownSymbol = __webpack_require__("b622");
            var IS_PURE = __webpack_require__("c430");
            var Iterators = __webpack_require__("3f8c");
            var IteratorsCore = __webpack_require__("ae93");
            var IteratorPrototype = IteratorsCore.IteratorPrototype;
            var BUGGY_SAFARI_ITERATORS = IteratorsCore.BUGGY_SAFARI_ITERATORS;
            var ITERATOR = wellKnownSymbol("iterator");
            var KEYS = "keys";
            var VALUES = "values";
            var ENTRIES = "entries";
            var returnThis = function() {
              return this;
            };
            module2.exports = function(Iterable, NAME, IteratorConstructor, next, DEFAULT, IS_SET, FORCED) {
              createIteratorConstructor(IteratorConstructor, NAME, next);
              var getIterationMethod = function(KIND) {
                if (KIND === DEFAULT && defaultIterator) return defaultIterator;
                if (!BUGGY_SAFARI_ITERATORS && KIND in IterablePrototype) return IterablePrototype[KIND];
                switch (KIND) {
                  case KEYS:
                    return function keys() {
                      return new IteratorConstructor(this, KIND);
                    };
                  case VALUES:
                    return function values() {
                      return new IteratorConstructor(this, KIND);
                    };
                  case ENTRIES:
                    return function entries() {
                      return new IteratorConstructor(this, KIND);
                    };
                }
                return function() {
                  return new IteratorConstructor(this);
                };
              };
              var TO_STRING_TAG = NAME + " Iterator";
              var INCORRECT_VALUES_NAME = false;
              var IterablePrototype = Iterable.prototype;
              var nativeIterator = IterablePrototype[ITERATOR] || IterablePrototype["@@iterator"] || DEFAULT && IterablePrototype[DEFAULT];
              var defaultIterator = !BUGGY_SAFARI_ITERATORS && nativeIterator || getIterationMethod(DEFAULT);
              var anyNativeIterator = NAME == "Array" ? IterablePrototype.entries || nativeIterator : nativeIterator;
              var CurrentIteratorPrototype, methods, KEY;
              if (anyNativeIterator) {
                CurrentIteratorPrototype = getPrototypeOf2(anyNativeIterator.call(new Iterable()));
                if (IteratorPrototype !== Object.prototype && CurrentIteratorPrototype.next) {
                  if (!IS_PURE && getPrototypeOf2(CurrentIteratorPrototype) !== IteratorPrototype) {
                    if (setPrototypeOf) {
                      setPrototypeOf(CurrentIteratorPrototype, IteratorPrototype);
                    } else if (typeof CurrentIteratorPrototype[ITERATOR] != "function") {
                      createNonEnumerableProperty(CurrentIteratorPrototype, ITERATOR, returnThis);
                    }
                  }
                  setToStringTag(CurrentIteratorPrototype, TO_STRING_TAG, true, true);
                  if (IS_PURE) Iterators[TO_STRING_TAG] = returnThis;
                }
              }
              if (DEFAULT == VALUES && nativeIterator && nativeIterator.name !== VALUES) {
                INCORRECT_VALUES_NAME = true;
                defaultIterator = function values() {
                  return nativeIterator.call(this);
                };
              }
              if ((!IS_PURE || FORCED) && IterablePrototype[ITERATOR] !== defaultIterator) {
                createNonEnumerableProperty(IterablePrototype, ITERATOR, defaultIterator);
              }
              Iterators[NAME] = defaultIterator;
              if (DEFAULT) {
                methods = {
                  values: getIterationMethod(VALUES),
                  keys: IS_SET ? defaultIterator : getIterationMethod(KEYS),
                  entries: getIterationMethod(ENTRIES)
                };
                if (FORCED) for (KEY in methods) {
                  if (BUGGY_SAFARI_ITERATORS || INCORRECT_VALUES_NAME || !(KEY in IterablePrototype)) {
                    redefine(IterablePrototype, KEY, methods[KEY]);
                  }
                }
                else $({ target: NAME, proto: true, forced: BUGGY_SAFARI_ITERATORS || INCORRECT_VALUES_NAME }, methods);
              }
              return methods;
            };
          }
        ),
        /***/
        "7f9a": (
          /***/
          function(module2, exports$12, __webpack_require__) {
            var global2 = __webpack_require__("da84");
            var inspectSource = __webpack_require__("8925");
            var WeakMap = global2.WeakMap;
            module2.exports = typeof WeakMap === "function" && /native code/.test(inspectSource(WeakMap));
          }
        ),
        /***/
        "825a": (
          /***/
          function(module2, exports$12, __webpack_require__) {
            var isObject2 = __webpack_require__("861d");
            module2.exports = function(it) {
              if (!isObject2(it)) {
                throw TypeError(String(it) + " is not an object");
              }
              return it;
            };
          }
        ),
        /***/
        "83ab": (
          /***/
          function(module2, exports$12, __webpack_require__) {
            var fails = __webpack_require__("d039");
            module2.exports = !fails(function() {
              return Object.defineProperty({}, 1, { get: function() {
                return 7;
              } })[1] != 7;
            });
          }
        ),
        /***/
        "8418": (
          /***/
          function(module2, exports$12, __webpack_require__) {
            var toPrimitive = __webpack_require__("c04e");
            var definePropertyModule = __webpack_require__("9bf2");
            var createPropertyDescriptor = __webpack_require__("5c6c");
            module2.exports = function(object, key, value) {
              var propertyKey = toPrimitive(key);
              if (propertyKey in object) definePropertyModule.f(object, propertyKey, createPropertyDescriptor(0, value));
              else object[propertyKey] = value;
            };
          }
        ),
        /***/
        "861d": (
          /***/
          function(module2, exports$12) {
            module2.exports = function(it) {
              return typeof it === "object" ? it !== null : typeof it === "function";
            };
          }
        ),
        /***/
        "8875": (
          /***/
          function(module2, exports$12, __webpack_require__) {
            var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;
            (function(root, factory2) {
              {
                !(__WEBPACK_AMD_DEFINE_ARRAY__ = [], __WEBPACK_AMD_DEFINE_FACTORY__ = factory2, __WEBPACK_AMD_DEFINE_RESULT__ = typeof __WEBPACK_AMD_DEFINE_FACTORY__ === "function" ? __WEBPACK_AMD_DEFINE_FACTORY__.apply(exports$12, __WEBPACK_AMD_DEFINE_ARRAY__) : __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_RESULT__ !== void 0 && (module2.exports = __WEBPACK_AMD_DEFINE_RESULT__));
              }
            })(typeof self !== "undefined" ? self : this, function() {
              function getCurrentScript() {
                var descriptor = Object.getOwnPropertyDescriptor(document, "currentScript");
                if (!descriptor && "currentScript" in document && document.currentScript) {
                  return document.currentScript;
                }
                if (descriptor && descriptor.get !== getCurrentScript && document.currentScript) {
                  return document.currentScript;
                }
                try {
                  throw new Error();
                } catch (err) {
                  var ieStackRegExp = /.*at [^(]*\((.*):(.+):(.+)\)$/ig, ffStackRegExp = /@([^@]*):(\d+):(\d+)\s*$/ig, stackDetails = ieStackRegExp.exec(err.stack) || ffStackRegExp.exec(err.stack), scriptLocation = stackDetails && stackDetails[1] || false, line = stackDetails && stackDetails[2] || false, currentLocation = document.location.href.replace(document.location.hash, ""), pageSource, inlineScriptSourceRegExp, inlineScriptSource, scripts = document.getElementsByTagName("script");
                  if (scriptLocation === currentLocation) {
                    pageSource = document.documentElement.outerHTML;
                    inlineScriptSourceRegExp = new RegExp("(?:[^\\n]+?\\n){0," + (line - 2) + "}[^<]*<script>([\\d\\D]*?)<\\/script>[\\d\\D]*", "i");
                    inlineScriptSource = pageSource.replace(inlineScriptSourceRegExp, "$1").trim();
                  }
                  for (var i = 0; i < scripts.length; i++) {
                    if (scripts[i].readyState === "interactive") {
                      return scripts[i];
                    }
                    if (scripts[i].src === scriptLocation) {
                      return scripts[i];
                    }
                    if (scriptLocation === currentLocation && scripts[i].innerHTML && scripts[i].innerHTML.trim() === inlineScriptSource) {
                      return scripts[i];
                    }
                  }
                  return null;
                }
              }
              return getCurrentScript;
            });
          }
        ),
        /***/
        "8925": (
          /***/
          function(module2, exports$12, __webpack_require__) {
            var store = __webpack_require__("c6cd");
            var functionToString = Function.toString;
            if (typeof store.inspectSource != "function") {
              store.inspectSource = function(it) {
                return functionToString.call(it);
              };
            }
            module2.exports = store.inspectSource;
          }
        ),
        /***/
        "8aa5": (
          /***/
          function(module2, exports$12, __webpack_require__) {
            var charAt = __webpack_require__("6547").charAt;
            module2.exports = function(S, index2, unicode) {
              return index2 + (unicode ? charAt(S, index2).length : 1);
            };
          }
        ),
        /***/
        "8bbf": (
          /***/
          function(module2, exports$12) {
            module2.exports = __WEBPACK_EXTERNAL_MODULE__8bbf__;
          }
        ),
        /***/
        "90e3": (
          /***/
          function(module2, exports$12) {
            var id = 0;
            var postfix = Math.random();
            module2.exports = function(key) {
              return "Symbol(" + String(key === void 0 ? "" : key) + ")_" + (++id + postfix).toString(36);
            };
          }
        ),
        /***/
        "9112": (
          /***/
          function(module2, exports$12, __webpack_require__) {
            var DESCRIPTORS = __webpack_require__("83ab");
            var definePropertyModule = __webpack_require__("9bf2");
            var createPropertyDescriptor = __webpack_require__("5c6c");
            module2.exports = DESCRIPTORS ? function(object, key, value) {
              return definePropertyModule.f(object, key, createPropertyDescriptor(1, value));
            } : function(object, key, value) {
              object[key] = value;
              return object;
            };
          }
        ),
        /***/
        "9263": (
          /***/
          function(module2, exports$12, __webpack_require__) {
            var regexpFlags = __webpack_require__("ad6d");
            var stickyHelpers = __webpack_require__("9f7f");
            var nativeExec = RegExp.prototype.exec;
            var nativeReplace = String.prototype.replace;
            var patchedExec = nativeExec;
            var UPDATES_LAST_INDEX_WRONG = function() {
              var re1 = /a/;
              var re2 = /b*/g;
              nativeExec.call(re1, "a");
              nativeExec.call(re2, "a");
              return re1.lastIndex !== 0 || re2.lastIndex !== 0;
            }();
            var UNSUPPORTED_Y = stickyHelpers.UNSUPPORTED_Y || stickyHelpers.BROKEN_CARET;
            var NPCG_INCLUDED = /()??/.exec("")[1] !== void 0;
            var PATCH = UPDATES_LAST_INDEX_WRONG || NPCG_INCLUDED || UNSUPPORTED_Y;
            if (PATCH) {
              patchedExec = function exec(str) {
                var re = this;
                var lastIndex, reCopy, match, i;
                var sticky = UNSUPPORTED_Y && re.sticky;
                var flags = regexpFlags.call(re);
                var source = re.source;
                var charsAdded = 0;
                var strCopy = str;
                if (sticky) {
                  flags = flags.replace("y", "");
                  if (flags.indexOf("g") === -1) {
                    flags += "g";
                  }
                  strCopy = String(str).slice(re.lastIndex);
                  if (re.lastIndex > 0 && (!re.multiline || re.multiline && str[re.lastIndex - 1] !== "\n")) {
                    source = "(?: " + source + ")";
                    strCopy = " " + strCopy;
                    charsAdded++;
                  }
                  reCopy = new RegExp("^(?:" + source + ")", flags);
                }
                if (NPCG_INCLUDED) {
                  reCopy = new RegExp("^" + source + "$(?!\\s)", flags);
                }
                if (UPDATES_LAST_INDEX_WRONG) lastIndex = re.lastIndex;
                match = nativeExec.call(sticky ? reCopy : re, strCopy);
                if (sticky) {
                  if (match) {
                    match.input = match.input.slice(charsAdded);
                    match[0] = match[0].slice(charsAdded);
                    match.index = re.lastIndex;
                    re.lastIndex += match[0].length;
                  } else re.lastIndex = 0;
                } else if (UPDATES_LAST_INDEX_WRONG && match) {
                  re.lastIndex = re.global ? match.index + match[0].length : lastIndex;
                }
                if (NPCG_INCLUDED && match && match.length > 1) {
                  nativeReplace.call(match[0], reCopy, function() {
                    for (i = 1; i < arguments.length - 2; i++) {
                      if (arguments[i] === void 0) match[i] = void 0;
                    }
                  });
                }
                return match;
              };
            }
            module2.exports = patchedExec;
          }
        ),
        /***/
        "94ca": (
          /***/
          function(module2, exports$12, __webpack_require__) {
            var fails = __webpack_require__("d039");
            var replacement = /#|\.prototype\./;
            var isForced = function(feature, detection) {
              var value = data[normalize(feature)];
              return value == POLYFILL ? true : value == NATIVE ? false : typeof detection == "function" ? fails(detection) : !!detection;
            };
            var normalize = isForced.normalize = function(string) {
              return String(string).replace(replacement, ".").toLowerCase();
            };
            var data = isForced.data = {};
            var NATIVE = isForced.NATIVE = "N";
            var POLYFILL = isForced.POLYFILL = "P";
            module2.exports = isForced;
          }
        ),
        /***/
        "99af": (
          /***/
          function(module2, exports$12, __webpack_require__) {
            var $ = __webpack_require__("23e7");
            var fails = __webpack_require__("d039");
            var isArray2 = __webpack_require__("e8b5");
            var isObject2 = __webpack_require__("861d");
            var toObject = __webpack_require__("7b0b");
            var toLength = __webpack_require__("50c4");
            var createProperty = __webpack_require__("8418");
            var arraySpeciesCreate = __webpack_require__("65f0");
            var arrayMethodHasSpeciesSupport = __webpack_require__("1dde");
            var wellKnownSymbol = __webpack_require__("b622");
            var V8_VERSION = __webpack_require__("2d00");
            var IS_CONCAT_SPREADABLE = wellKnownSymbol("isConcatSpreadable");
            var MAX_SAFE_INTEGER = 9007199254740991;
            var MAXIMUM_ALLOWED_INDEX_EXCEEDED = "Maximum allowed index exceeded";
            var IS_CONCAT_SPREADABLE_SUPPORT = V8_VERSION >= 51 || !fails(function() {
              var array = [];
              array[IS_CONCAT_SPREADABLE] = false;
              return array.concat()[0] !== array;
            });
            var SPECIES_SUPPORT = arrayMethodHasSpeciesSupport("concat");
            var isConcatSpreadable = function(O) {
              if (!isObject2(O)) return false;
              var spreadable = O[IS_CONCAT_SPREADABLE];
              return spreadable !== void 0 ? !!spreadable : isArray2(O);
            };
            var FORCED = !IS_CONCAT_SPREADABLE_SUPPORT || !SPECIES_SUPPORT;
            $({ target: "Array", proto: true, forced: FORCED }, {
              concat: function concat(arg) {
                var O = toObject(this);
                var A = arraySpeciesCreate(O, 0);
                var n = 0;
                var i, k, length, len, E;
                for (i = -1, length = arguments.length; i < length; i++) {
                  E = i === -1 ? O : arguments[i];
                  if (isConcatSpreadable(E)) {
                    len = toLength(E.length);
                    if (n + len > MAX_SAFE_INTEGER) throw TypeError(MAXIMUM_ALLOWED_INDEX_EXCEEDED);
                    for (k = 0; k < len; k++, n++) if (k in E) createProperty(A, n, E[k]);
                  } else {
                    if (n >= MAX_SAFE_INTEGER) throw TypeError(MAXIMUM_ALLOWED_INDEX_EXCEEDED);
                    createProperty(A, n++, E);
                  }
                }
                A.length = n;
                return A;
              }
            });
          }
        ),
        /***/
        "9bdd": (
          /***/
          function(module2, exports$12, __webpack_require__) {
            var anObject = __webpack_require__("825a");
            module2.exports = function(iterator2, fn, value, ENTRIES) {
              try {
                return ENTRIES ? fn(anObject(value)[0], value[1]) : fn(value);
              } catch (error) {
                var returnMethod = iterator2["return"];
                if (returnMethod !== void 0) anObject(returnMethod.call(iterator2));
                throw error;
              }
            };
          }
        ),
        /***/
        "9bf2": (
          /***/
          function(module2, exports$12, __webpack_require__) {
            var DESCRIPTORS = __webpack_require__("83ab");
            var IE8_DOM_DEFINE = __webpack_require__("0cfb");
            var anObject = __webpack_require__("825a");
            var toPrimitive = __webpack_require__("c04e");
            var nativeDefineProperty = Object.defineProperty;
            exports$12.f = DESCRIPTORS ? nativeDefineProperty : function defineProperty(O, P, Attributes) {
              anObject(O);
              P = toPrimitive(P, true);
              anObject(Attributes);
              if (IE8_DOM_DEFINE) try {
                return nativeDefineProperty(O, P, Attributes);
              } catch (error) {
              }
              if ("get" in Attributes || "set" in Attributes) throw TypeError("Accessors not supported");
              if ("value" in Attributes) O[P] = Attributes.value;
              return O;
            };
          }
        ),
        /***/
        "9ed3": (
          /***/
          function(module2, exports$12, __webpack_require__) {
            var IteratorPrototype = __webpack_require__("ae93").IteratorPrototype;
            var create = __webpack_require__("7c73");
            var createPropertyDescriptor = __webpack_require__("5c6c");
            var setToStringTag = __webpack_require__("d44e");
            var Iterators = __webpack_require__("3f8c");
            var returnThis = function() {
              return this;
            };
            module2.exports = function(IteratorConstructor, NAME, next) {
              var TO_STRING_TAG = NAME + " Iterator";
              IteratorConstructor.prototype = create(IteratorPrototype, { next: createPropertyDescriptor(1, next) });
              setToStringTag(IteratorConstructor, TO_STRING_TAG, false, true);
              Iterators[TO_STRING_TAG] = returnThis;
              return IteratorConstructor;
            };
          }
        ),
        /***/
        "9f7f": (
          /***/
          function(module2, exports$12, __webpack_require__) {
            var fails = __webpack_require__("d039");
            function RE(s, f) {
              return RegExp(s, f);
            }
            exports$12.UNSUPPORTED_Y = fails(function() {
              var re = RE("a", "y");
              re.lastIndex = 2;
              return re.exec("abcd") != null;
            });
            exports$12.BROKEN_CARET = fails(function() {
              var re = RE("^r", "gy");
              re.lastIndex = 2;
              return re.exec("str") != null;
            });
          }
        ),
        /***/
        "a2bf": (
          /***/
          function(module2, exports$12, __webpack_require__) {
            var isArray2 = __webpack_require__("e8b5");
            var toLength = __webpack_require__("50c4");
            var bind2 = __webpack_require__("0366");
            var flattenIntoArray = function(target, original, source, sourceLen, start, depth, mapper, thisArg) {
              var targetIndex = start;
              var sourceIndex = 0;
              var mapFn = mapper ? bind2(mapper, thisArg, 3) : false;
              var element;
              while (sourceIndex < sourceLen) {
                if (sourceIndex in source) {
                  element = mapFn ? mapFn(source[sourceIndex], sourceIndex, original) : source[sourceIndex];
                  if (depth > 0 && isArray2(element)) {
                    targetIndex = flattenIntoArray(target, original, element, toLength(element.length), targetIndex, depth - 1) - 1;
                  } else {
                    if (targetIndex >= 9007199254740991) throw TypeError("Exceed the acceptable array length");
                    target[targetIndex] = element;
                  }
                  targetIndex++;
                }
                sourceIndex++;
              }
              return targetIndex;
            };
            module2.exports = flattenIntoArray;
          }
        ),
        /***/
        "a352": (
          /***/
          function(module2, exports$12) {
            module2.exports = __WEBPACK_EXTERNAL_MODULE_a352__;
          }
        ),
        /***/
        "a434": (
          /***/
          function(module2, exports$12, __webpack_require__) {
            var $ = __webpack_require__("23e7");
            var toAbsoluteIndex = __webpack_require__("23cb");
            var toInteger = __webpack_require__("a691");
            var toLength = __webpack_require__("50c4");
            var toObject = __webpack_require__("7b0b");
            var arraySpeciesCreate = __webpack_require__("65f0");
            var createProperty = __webpack_require__("8418");
            var arrayMethodHasSpeciesSupport = __webpack_require__("1dde");
            var arrayMethodUsesToLength = __webpack_require__("ae40");
            var HAS_SPECIES_SUPPORT = arrayMethodHasSpeciesSupport("splice");
            var USES_TO_LENGTH = arrayMethodUsesToLength("splice", { ACCESSORS: true, 0: 0, 1: 2 });
            var max = Math.max;
            var min = Math.min;
            var MAX_SAFE_INTEGER = 9007199254740991;
            var MAXIMUM_ALLOWED_LENGTH_EXCEEDED = "Maximum allowed length exceeded";
            $({ target: "Array", proto: true, forced: !HAS_SPECIES_SUPPORT || !USES_TO_LENGTH }, {
              splice: function splice(start, deleteCount) {
                var O = toObject(this);
                var len = toLength(O.length);
                var actualStart = toAbsoluteIndex(start, len);
                var argumentsLength = arguments.length;
                var insertCount, actualDeleteCount, A, k, from, to;
                if (argumentsLength === 0) {
                  insertCount = actualDeleteCount = 0;
                } else if (argumentsLength === 1) {
                  insertCount = 0;
                  actualDeleteCount = len - actualStart;
                } else {
                  insertCount = argumentsLength - 2;
                  actualDeleteCount = min(max(toInteger(deleteCount), 0), len - actualStart);
                }
                if (len + insertCount - actualDeleteCount > MAX_SAFE_INTEGER) {
                  throw TypeError(MAXIMUM_ALLOWED_LENGTH_EXCEEDED);
                }
                A = arraySpeciesCreate(O, actualDeleteCount);
                for (k = 0; k < actualDeleteCount; k++) {
                  from = actualStart + k;
                  if (from in O) createProperty(A, k, O[from]);
                }
                A.length = actualDeleteCount;
                if (insertCount < actualDeleteCount) {
                  for (k = actualStart; k < len - actualDeleteCount; k++) {
                    from = k + actualDeleteCount;
                    to = k + insertCount;
                    if (from in O) O[to] = O[from];
                    else delete O[to];
                  }
                  for (k = len; k > len - actualDeleteCount + insertCount; k--) delete O[k - 1];
                } else if (insertCount > actualDeleteCount) {
                  for (k = len - actualDeleteCount; k > actualStart; k--) {
                    from = k + actualDeleteCount - 1;
                    to = k + insertCount - 1;
                    if (from in O) O[to] = O[from];
                    else delete O[to];
                  }
                }
                for (k = 0; k < insertCount; k++) {
                  O[k + actualStart] = arguments[k + 2];
                }
                O.length = len - actualDeleteCount + insertCount;
                return A;
              }
            });
          }
        ),
        /***/
        "a4d3": (
          /***/
          function(module2, exports$12, __webpack_require__) {
            var $ = __webpack_require__("23e7");
            var global2 = __webpack_require__("da84");
            var getBuiltIn = __webpack_require__("d066");
            var IS_PURE = __webpack_require__("c430");
            var DESCRIPTORS = __webpack_require__("83ab");
            var NATIVE_SYMBOL = __webpack_require__("4930");
            var USE_SYMBOL_AS_UID = __webpack_require__("fdbf");
            var fails = __webpack_require__("d039");
            var has = __webpack_require__("5135");
            var isArray2 = __webpack_require__("e8b5");
            var isObject2 = __webpack_require__("861d");
            var anObject = __webpack_require__("825a");
            var toObject = __webpack_require__("7b0b");
            var toIndexedObject = __webpack_require__("fc6a");
            var toPrimitive = __webpack_require__("c04e");
            var createPropertyDescriptor = __webpack_require__("5c6c");
            var nativeObjectCreate = __webpack_require__("7c73");
            var objectKeys = __webpack_require__("df75");
            var getOwnPropertyNamesModule = __webpack_require__("241c");
            var getOwnPropertyNamesExternal = __webpack_require__("057f");
            var getOwnPropertySymbolsModule = __webpack_require__("7418");
            var getOwnPropertyDescriptorModule = __webpack_require__("06cf");
            var definePropertyModule = __webpack_require__("9bf2");
            var propertyIsEnumerableModule = __webpack_require__("d1e7");
            var createNonEnumerableProperty = __webpack_require__("9112");
            var redefine = __webpack_require__("6eeb");
            var shared = __webpack_require__("5692");
            var sharedKey = __webpack_require__("f772");
            var hiddenKeys = __webpack_require__("d012");
            var uid = __webpack_require__("90e3");
            var wellKnownSymbol = __webpack_require__("b622");
            var wrappedWellKnownSymbolModule = __webpack_require__("e538");
            var defineWellKnownSymbol = __webpack_require__("746f");
            var setToStringTag = __webpack_require__("d44e");
            var InternalStateModule = __webpack_require__("69f3");
            var $forEach = __webpack_require__("b727").forEach;
            var HIDDEN = sharedKey("hidden");
            var SYMBOL = "Symbol";
            var PROTOTYPE = "prototype";
            var TO_PRIMITIVE = wellKnownSymbol("toPrimitive");
            var setInternalState = InternalStateModule.set;
            var getInternalState = InternalStateModule.getterFor(SYMBOL);
            var ObjectPrototype = Object[PROTOTYPE];
            var $Symbol = global2.Symbol;
            var $stringify = getBuiltIn("JSON", "stringify");
            var nativeGetOwnPropertyDescriptor = getOwnPropertyDescriptorModule.f;
            var nativeDefineProperty = definePropertyModule.f;
            var nativeGetOwnPropertyNames = getOwnPropertyNamesExternal.f;
            var nativePropertyIsEnumerable = propertyIsEnumerableModule.f;
            var AllSymbols = shared("symbols");
            var ObjectPrototypeSymbols = shared("op-symbols");
            var StringToSymbolRegistry = shared("string-to-symbol-registry");
            var SymbolToStringRegistry = shared("symbol-to-string-registry");
            var WellKnownSymbolsStore = shared("wks");
            var QObject = global2.QObject;
            var USE_SETTER = !QObject || !QObject[PROTOTYPE] || !QObject[PROTOTYPE].findChild;
            var setSymbolDescriptor = DESCRIPTORS && fails(function() {
              return nativeObjectCreate(nativeDefineProperty({}, "a", {
                get: function() {
                  return nativeDefineProperty(this, "a", { value: 7 }).a;
                }
              })).a != 7;
            }) ? function(O, P, Attributes) {
              var ObjectPrototypeDescriptor = nativeGetOwnPropertyDescriptor(ObjectPrototype, P);
              if (ObjectPrototypeDescriptor) delete ObjectPrototype[P];
              nativeDefineProperty(O, P, Attributes);
              if (ObjectPrototypeDescriptor && O !== ObjectPrototype) {
                nativeDefineProperty(ObjectPrototype, P, ObjectPrototypeDescriptor);
              }
            } : nativeDefineProperty;
            var wrap = function(tag, description) {
              var symbol = AllSymbols[tag] = nativeObjectCreate($Symbol[PROTOTYPE]);
              setInternalState(symbol, {
                type: SYMBOL,
                tag,
                description
              });
              if (!DESCRIPTORS) symbol.description = description;
              return symbol;
            };
            var isSymbol = USE_SYMBOL_AS_UID ? function(it) {
              return typeof it == "symbol";
            } : function(it) {
              return Object(it) instanceof $Symbol;
            };
            var $defineProperty = function defineProperty(O, P, Attributes) {
              if (O === ObjectPrototype) $defineProperty(ObjectPrototypeSymbols, P, Attributes);
              anObject(O);
              var key = toPrimitive(P, true);
              anObject(Attributes);
              if (has(AllSymbols, key)) {
                if (!Attributes.enumerable) {
                  if (!has(O, HIDDEN)) nativeDefineProperty(O, HIDDEN, createPropertyDescriptor(1, {}));
                  O[HIDDEN][key] = true;
                } else {
                  if (has(O, HIDDEN) && O[HIDDEN][key]) O[HIDDEN][key] = false;
                  Attributes = nativeObjectCreate(Attributes, { enumerable: createPropertyDescriptor(0, false) });
                }
                return setSymbolDescriptor(O, key, Attributes);
              }
              return nativeDefineProperty(O, key, Attributes);
            };
            var $defineProperties = function defineProperties(O, Properties) {
              anObject(O);
              var properties = toIndexedObject(Properties);
              var keys = objectKeys(properties).concat($getOwnPropertySymbols(properties));
              $forEach(keys, function(key) {
                if (!DESCRIPTORS || $propertyIsEnumerable.call(properties, key)) $defineProperty(O, key, properties[key]);
              });
              return O;
            };
            var $create = function create(O, Properties) {
              return Properties === void 0 ? nativeObjectCreate(O) : $defineProperties(nativeObjectCreate(O), Properties);
            };
            var $propertyIsEnumerable = function propertyIsEnumerable(V) {
              var P = toPrimitive(V, true);
              var enumerable = nativePropertyIsEnumerable.call(this, P);
              if (this === ObjectPrototype && has(AllSymbols, P) && !has(ObjectPrototypeSymbols, P)) return false;
              return enumerable || !has(this, P) || !has(AllSymbols, P) || has(this, HIDDEN) && this[HIDDEN][P] ? enumerable : true;
            };
            var $getOwnPropertyDescriptor = function getOwnPropertyDescriptor(O, P) {
              var it = toIndexedObject(O);
              var key = toPrimitive(P, true);
              if (it === ObjectPrototype && has(AllSymbols, key) && !has(ObjectPrototypeSymbols, key)) return;
              var descriptor = nativeGetOwnPropertyDescriptor(it, key);
              if (descriptor && has(AllSymbols, key) && !(has(it, HIDDEN) && it[HIDDEN][key])) {
                descriptor.enumerable = true;
              }
              return descriptor;
            };
            var $getOwnPropertyNames = function getOwnPropertyNames(O) {
              var names = nativeGetOwnPropertyNames(toIndexedObject(O));
              var result = [];
              $forEach(names, function(key) {
                if (!has(AllSymbols, key) && !has(hiddenKeys, key)) result.push(key);
              });
              return result;
            };
            var $getOwnPropertySymbols = function getOwnPropertySymbols(O) {
              var IS_OBJECT_PROTOTYPE = O === ObjectPrototype;
              var names = nativeGetOwnPropertyNames(IS_OBJECT_PROTOTYPE ? ObjectPrototypeSymbols : toIndexedObject(O));
              var result = [];
              $forEach(names, function(key) {
                if (has(AllSymbols, key) && (!IS_OBJECT_PROTOTYPE || has(ObjectPrototype, key))) {
                  result.push(AllSymbols[key]);
                }
              });
              return result;
            };
            if (!NATIVE_SYMBOL) {
              $Symbol = function Symbol2() {
                if (this instanceof $Symbol) throw TypeError("Symbol is not a constructor");
                var description = !arguments.length || arguments[0] === void 0 ? void 0 : String(arguments[0]);
                var tag = uid(description);
                var setter = function(value) {
                  if (this === ObjectPrototype) setter.call(ObjectPrototypeSymbols, value);
                  if (has(this, HIDDEN) && has(this[HIDDEN], tag)) this[HIDDEN][tag] = false;
                  setSymbolDescriptor(this, tag, createPropertyDescriptor(1, value));
                };
                if (DESCRIPTORS && USE_SETTER) setSymbolDescriptor(ObjectPrototype, tag, { configurable: true, set: setter });
                return wrap(tag, description);
              };
              redefine($Symbol[PROTOTYPE], "toString", function toString3() {
                return getInternalState(this).tag;
              });
              redefine($Symbol, "withoutSetter", function(description) {
                return wrap(uid(description), description);
              });
              propertyIsEnumerableModule.f = $propertyIsEnumerable;
              definePropertyModule.f = $defineProperty;
              getOwnPropertyDescriptorModule.f = $getOwnPropertyDescriptor;
              getOwnPropertyNamesModule.f = getOwnPropertyNamesExternal.f = $getOwnPropertyNames;
              getOwnPropertySymbolsModule.f = $getOwnPropertySymbols;
              wrappedWellKnownSymbolModule.f = function(name) {
                return wrap(wellKnownSymbol(name), name);
              };
              if (DESCRIPTORS) {
                nativeDefineProperty($Symbol[PROTOTYPE], "description", {
                  configurable: true,
                  get: function description() {
                    return getInternalState(this).description;
                  }
                });
                if (!IS_PURE) {
                  redefine(ObjectPrototype, "propertyIsEnumerable", $propertyIsEnumerable, { unsafe: true });
                }
              }
            }
            $({ global: true, wrap: true, forced: !NATIVE_SYMBOL, sham: !NATIVE_SYMBOL }, {
              Symbol: $Symbol
            });
            $forEach(objectKeys(WellKnownSymbolsStore), function(name) {
              defineWellKnownSymbol(name);
            });
            $({ target: SYMBOL, stat: true, forced: !NATIVE_SYMBOL }, {
              // `Symbol.for` method
              // https://tc39.github.io/ecma262/#sec-symbol.for
              "for": function(key) {
                var string = String(key);
                if (has(StringToSymbolRegistry, string)) return StringToSymbolRegistry[string];
                var symbol = $Symbol(string);
                StringToSymbolRegistry[string] = symbol;
                SymbolToStringRegistry[symbol] = string;
                return symbol;
              },
              // `Symbol.keyFor` method
              // https://tc39.github.io/ecma262/#sec-symbol.keyfor
              keyFor: function keyFor(sym) {
                if (!isSymbol(sym)) throw TypeError(sym + " is not a symbol");
                if (has(SymbolToStringRegistry, sym)) return SymbolToStringRegistry[sym];
              },
              useSetter: function() {
                USE_SETTER = true;
              },
              useSimple: function() {
                USE_SETTER = false;
              }
            });
            $({ target: "Object", stat: true, forced: !NATIVE_SYMBOL, sham: !DESCRIPTORS }, {
              // `Object.create` method
              // https://tc39.github.io/ecma262/#sec-object.create
              create: $create,
              // `Object.defineProperty` method
              // https://tc39.github.io/ecma262/#sec-object.defineproperty
              defineProperty: $defineProperty,
              // `Object.defineProperties` method
              // https://tc39.github.io/ecma262/#sec-object.defineproperties
              defineProperties: $defineProperties,
              // `Object.getOwnPropertyDescriptor` method
              // https://tc39.github.io/ecma262/#sec-object.getownpropertydescriptors
              getOwnPropertyDescriptor: $getOwnPropertyDescriptor
            });
            $({ target: "Object", stat: true, forced: !NATIVE_SYMBOL }, {
              // `Object.getOwnPropertyNames` method
              // https://tc39.github.io/ecma262/#sec-object.getownpropertynames
              getOwnPropertyNames: $getOwnPropertyNames,
              // `Object.getOwnPropertySymbols` method
              // https://tc39.github.io/ecma262/#sec-object.getownpropertysymbols
              getOwnPropertySymbols: $getOwnPropertySymbols
            });
            $({ target: "Object", stat: true, forced: fails(function() {
              getOwnPropertySymbolsModule.f(1);
            }) }, {
              getOwnPropertySymbols: function getOwnPropertySymbols(it) {
                return getOwnPropertySymbolsModule.f(toObject(it));
              }
            });
            if ($stringify) {
              var FORCED_JSON_STRINGIFY = !NATIVE_SYMBOL || fails(function() {
                var symbol = $Symbol();
                return $stringify([symbol]) != "[null]" || $stringify({ a: symbol }) != "{}" || $stringify(Object(symbol)) != "{}";
              });
              $({ target: "JSON", stat: true, forced: FORCED_JSON_STRINGIFY }, {
                // eslint-disable-next-line no-unused-vars
                stringify: function stringify(it, replacer, space) {
                  var args = [it];
                  var index2 = 1;
                  var $replacer;
                  while (arguments.length > index2) args.push(arguments[index2++]);
                  $replacer = replacer;
                  if (!isObject2(replacer) && it === void 0 || isSymbol(it)) return;
                  if (!isArray2(replacer)) replacer = function(key, value) {
                    if (typeof $replacer == "function") value = $replacer.call(this, key, value);
                    if (!isSymbol(value)) return value;
                  };
                  args[1] = replacer;
                  return $stringify.apply(null, args);
                }
              });
            }
            if (!$Symbol[PROTOTYPE][TO_PRIMITIVE]) {
              createNonEnumerableProperty($Symbol[PROTOTYPE], TO_PRIMITIVE, $Symbol[PROTOTYPE].valueOf);
            }
            setToStringTag($Symbol, SYMBOL);
            hiddenKeys[HIDDEN] = true;
          }
        ),
        /***/
        "a630": (
          /***/
          function(module2, exports$12, __webpack_require__) {
            var $ = __webpack_require__("23e7");
            var from = __webpack_require__("4df4");
            var checkCorrectnessOfIteration = __webpack_require__("1c7e");
            var INCORRECT_ITERATION = !checkCorrectnessOfIteration(function(iterable) {
              Array.from(iterable);
            });
            $({ target: "Array", stat: true, forced: INCORRECT_ITERATION }, {
              from
            });
          }
        ),
        /***/
        "a640": (
          /***/
          function(module2, exports$12, __webpack_require__) {
            var fails = __webpack_require__("d039");
            module2.exports = function(METHOD_NAME, argument) {
              var method = [][METHOD_NAME];
              return !!method && fails(function() {
                method.call(null, argument || function() {
                  throw 1;
                }, 1);
              });
            };
          }
        ),
        /***/
        "a691": (
          /***/
          function(module2, exports$12) {
            var ceil = Math.ceil;
            var floor = Math.floor;
            module2.exports = function(argument) {
              return isNaN(argument = +argument) ? 0 : (argument > 0 ? floor : ceil)(argument);
            };
          }
        ),
        /***/
        "ab13": (
          /***/
          function(module2, exports$12, __webpack_require__) {
            var wellKnownSymbol = __webpack_require__("b622");
            var MATCH = wellKnownSymbol("match");
            module2.exports = function(METHOD_NAME) {
              var regexp = /./;
              try {
                "/./"[METHOD_NAME](regexp);
              } catch (e) {
                try {
                  regexp[MATCH] = false;
                  return "/./"[METHOD_NAME](regexp);
                } catch (f) {
                }
              }
              return false;
            };
          }
        ),
        /***/
        "ac1f": (
          /***/
          function(module2, exports$12, __webpack_require__) {
            var $ = __webpack_require__("23e7");
            var exec = __webpack_require__("9263");
            $({ target: "RegExp", proto: true, forced: /./.exec !== exec }, {
              exec
            });
          }
        ),
        /***/
        "ad6d": (
          /***/
          function(module2, exports$12, __webpack_require__) {
            var anObject = __webpack_require__("825a");
            module2.exports = function() {
              var that = anObject(this);
              var result = "";
              if (that.global) result += "g";
              if (that.ignoreCase) result += "i";
              if (that.multiline) result += "m";
              if (that.dotAll) result += "s";
              if (that.unicode) result += "u";
              if (that.sticky) result += "y";
              return result;
            };
          }
        ),
        /***/
        "ae40": (
          /***/
          function(module2, exports$12, __webpack_require__) {
            var DESCRIPTORS = __webpack_require__("83ab");
            var fails = __webpack_require__("d039");
            var has = __webpack_require__("5135");
            var defineProperty = Object.defineProperty;
            var cache = {};
            var thrower = function(it) {
              throw it;
            };
            module2.exports = function(METHOD_NAME, options) {
              if (has(cache, METHOD_NAME)) return cache[METHOD_NAME];
              if (!options) options = {};
              var method = [][METHOD_NAME];
              var ACCESSORS = has(options, "ACCESSORS") ? options.ACCESSORS : false;
              var argument0 = has(options, 0) ? options[0] : thrower;
              var argument1 = has(options, 1) ? options[1] : void 0;
              return cache[METHOD_NAME] = !!method && !fails(function() {
                if (ACCESSORS && !DESCRIPTORS) return true;
                var O = { length: -1 };
                if (ACCESSORS) defineProperty(O, 1, { enumerable: true, get: thrower });
                else O[1] = 1;
                method.call(O, argument0, argument1);
              });
            };
          }
        ),
        /***/
        "ae93": (
          /***/
          function(module2, exports$12, __webpack_require__) {
            var getPrototypeOf2 = __webpack_require__("e163");
            var createNonEnumerableProperty = __webpack_require__("9112");
            var has = __webpack_require__("5135");
            var wellKnownSymbol = __webpack_require__("b622");
            var IS_PURE = __webpack_require__("c430");
            var ITERATOR = wellKnownSymbol("iterator");
            var BUGGY_SAFARI_ITERATORS = false;
            var returnThis = function() {
              return this;
            };
            var IteratorPrototype, PrototypeOfArrayIteratorPrototype, arrayIterator;
            if ([].keys) {
              arrayIterator = [].keys();
              if (!("next" in arrayIterator)) BUGGY_SAFARI_ITERATORS = true;
              else {
                PrototypeOfArrayIteratorPrototype = getPrototypeOf2(getPrototypeOf2(arrayIterator));
                if (PrototypeOfArrayIteratorPrototype !== Object.prototype) IteratorPrototype = PrototypeOfArrayIteratorPrototype;
              }
            }
            if (IteratorPrototype == void 0) IteratorPrototype = {};
            if (!IS_PURE && !has(IteratorPrototype, ITERATOR)) {
              createNonEnumerableProperty(IteratorPrototype, ITERATOR, returnThis);
            }
            module2.exports = {
              IteratorPrototype,
              BUGGY_SAFARI_ITERATORS
            };
          }
        ),
        /***/
        "b041": (
          /***/
          function(module2, exports$12, __webpack_require__) {
            var TO_STRING_TAG_SUPPORT = __webpack_require__("00ee");
            var classof = __webpack_require__("f5df");
            module2.exports = TO_STRING_TAG_SUPPORT ? {}.toString : function toString3() {
              return "[object " + classof(this) + "]";
            };
          }
        ),
        /***/
        "b0c0": (
          /***/
          function(module2, exports$12, __webpack_require__) {
            var DESCRIPTORS = __webpack_require__("83ab");
            var defineProperty = __webpack_require__("9bf2").f;
            var FunctionPrototype = Function.prototype;
            var FunctionPrototypeToString = FunctionPrototype.toString;
            var nameRE = /^\s*function ([^ (]*)/;
            var NAME = "name";
            if (DESCRIPTORS && !(NAME in FunctionPrototype)) {
              defineProperty(FunctionPrototype, NAME, {
                configurable: true,
                get: function() {
                  try {
                    return FunctionPrototypeToString.call(this).match(nameRE)[1];
                  } catch (error) {
                    return "";
                  }
                }
              });
            }
          }
        ),
        /***/
        "b622": (
          /***/
          function(module2, exports$12, __webpack_require__) {
            var global2 = __webpack_require__("da84");
            var shared = __webpack_require__("5692");
            var has = __webpack_require__("5135");
            var uid = __webpack_require__("90e3");
            var NATIVE_SYMBOL = __webpack_require__("4930");
            var USE_SYMBOL_AS_UID = __webpack_require__("fdbf");
            var WellKnownSymbolsStore = shared("wks");
            var Symbol2 = global2.Symbol;
            var createWellKnownSymbol = USE_SYMBOL_AS_UID ? Symbol2 : Symbol2 && Symbol2.withoutSetter || uid;
            module2.exports = function(name) {
              if (!has(WellKnownSymbolsStore, name)) {
                if (NATIVE_SYMBOL && has(Symbol2, name)) WellKnownSymbolsStore[name] = Symbol2[name];
                else WellKnownSymbolsStore[name] = createWellKnownSymbol("Symbol." + name);
              }
              return WellKnownSymbolsStore[name];
            };
          }
        ),
        /***/
        "b64b": (
          /***/
          function(module2, exports$12, __webpack_require__) {
            var $ = __webpack_require__("23e7");
            var toObject = __webpack_require__("7b0b");
            var nativeKeys = __webpack_require__("df75");
            var fails = __webpack_require__("d039");
            var FAILS_ON_PRIMITIVES = fails(function() {
              nativeKeys(1);
            });
            $({ target: "Object", stat: true, forced: FAILS_ON_PRIMITIVES }, {
              keys: function keys(it) {
                return nativeKeys(toObject(it));
              }
            });
          }
        ),
        /***/
        "b727": (
          /***/
          function(module2, exports$12, __webpack_require__) {
            var bind2 = __webpack_require__("0366");
            var IndexedObject = __webpack_require__("44ad");
            var toObject = __webpack_require__("7b0b");
            var toLength = __webpack_require__("50c4");
            var arraySpeciesCreate = __webpack_require__("65f0");
            var push = [].push;
            var createMethod = function(TYPE) {
              var IS_MAP = TYPE == 1;
              var IS_FILTER = TYPE == 2;
              var IS_SOME = TYPE == 3;
              var IS_EVERY = TYPE == 4;
              var IS_FIND_INDEX = TYPE == 6;
              var NO_HOLES = TYPE == 5 || IS_FIND_INDEX;
              return function($this, callbackfn, that, specificCreate) {
                var O = toObject($this);
                var self2 = IndexedObject(O);
                var boundFunction = bind2(callbackfn, that, 3);
                var length = toLength(self2.length);
                var index2 = 0;
                var create = specificCreate || arraySpeciesCreate;
                var target = IS_MAP ? create($this, length) : IS_FILTER ? create($this, 0) : void 0;
                var value, result;
                for (; length > index2; index2++) if (NO_HOLES || index2 in self2) {
                  value = self2[index2];
                  result = boundFunction(value, index2, O);
                  if (TYPE) {
                    if (IS_MAP) target[index2] = result;
                    else if (result) switch (TYPE) {
                      case 3:
                        return true;
                      case 5:
                        return value;
                      case 6:
                        return index2;
                      case 2:
                        push.call(target, value);
                    }
                    else if (IS_EVERY) return false;
                  }
                }
                return IS_FIND_INDEX ? -1 : IS_SOME || IS_EVERY ? IS_EVERY : target;
              };
            };
            module2.exports = {
              // `Array.prototype.forEach` method
              // https://tc39.github.io/ecma262/#sec-array.prototype.foreach
              forEach: createMethod(0),
              // `Array.prototype.map` method
              // https://tc39.github.io/ecma262/#sec-array.prototype.map
              map: createMethod(1),
              // `Array.prototype.filter` method
              // https://tc39.github.io/ecma262/#sec-array.prototype.filter
              filter: createMethod(2),
              // `Array.prototype.some` method
              // https://tc39.github.io/ecma262/#sec-array.prototype.some
              some: createMethod(3),
              // `Array.prototype.every` method
              // https://tc39.github.io/ecma262/#sec-array.prototype.every
              every: createMethod(4),
              // `Array.prototype.find` method
              // https://tc39.github.io/ecma262/#sec-array.prototype.find
              find: createMethod(5),
              // `Array.prototype.findIndex` method
              // https://tc39.github.io/ecma262/#sec-array.prototype.findIndex
              findIndex: createMethod(6)
            };
          }
        ),
        /***/
        "c04e": (
          /***/
          function(module2, exports$12, __webpack_require__) {
            var isObject2 = __webpack_require__("861d");
            module2.exports = function(input, PREFERRED_STRING) {
              if (!isObject2(input)) return input;
              var fn, val;
              if (PREFERRED_STRING && typeof (fn = input.toString) == "function" && !isObject2(val = fn.call(input))) return val;
              if (typeof (fn = input.valueOf) == "function" && !isObject2(val = fn.call(input))) return val;
              if (!PREFERRED_STRING && typeof (fn = input.toString) == "function" && !isObject2(val = fn.call(input))) return val;
              throw TypeError("Can't convert object to primitive value");
            };
          }
        ),
        /***/
        "c430": (
          /***/
          function(module2, exports$12) {
            module2.exports = false;
          }
        ),
        /***/
        "c6b6": (
          /***/
          function(module2, exports$12) {
            var toString3 = {}.toString;
            module2.exports = function(it) {
              return toString3.call(it).slice(8, -1);
            };
          }
        ),
        /***/
        "c6cd": (
          /***/
          function(module2, exports$12, __webpack_require__) {
            var global2 = __webpack_require__("da84");
            var setGlobal = __webpack_require__("ce4e");
            var SHARED = "__core-js_shared__";
            var store = global2[SHARED] || setGlobal(SHARED, {});
            module2.exports = store;
          }
        ),
        /***/
        "c740": (
          /***/
          function(module2, exports$12, __webpack_require__) {
            var $ = __webpack_require__("23e7");
            var $findIndex = __webpack_require__("b727").findIndex;
            var addToUnscopables = __webpack_require__("44d2");
            var arrayMethodUsesToLength = __webpack_require__("ae40");
            var FIND_INDEX = "findIndex";
            var SKIPS_HOLES = true;
            var USES_TO_LENGTH = arrayMethodUsesToLength(FIND_INDEX);
            if (FIND_INDEX in []) Array(1)[FIND_INDEX](function() {
              SKIPS_HOLES = false;
            });
            $({ target: "Array", proto: true, forced: SKIPS_HOLES || !USES_TO_LENGTH }, {
              findIndex: function findIndex(callbackfn) {
                return $findIndex(this, callbackfn, arguments.length > 1 ? arguments[1] : void 0);
              }
            });
            addToUnscopables(FIND_INDEX);
          }
        ),
        /***/
        "c8ba": (
          /***/
          function(module2, exports$12) {
            var g;
            g = /* @__PURE__ */ function() {
              return this;
            }();
            try {
              g = g || new Function("return this")();
            } catch (e) {
              if (typeof window === "object") g = window;
            }
            module2.exports = g;
          }
        ),
        /***/
        "c975": (
          /***/
          function(module2, exports$12, __webpack_require__) {
            var $ = __webpack_require__("23e7");
            var $indexOf = __webpack_require__("4d64").indexOf;
            var arrayMethodIsStrict = __webpack_require__("a640");
            var arrayMethodUsesToLength = __webpack_require__("ae40");
            var nativeIndexOf = [].indexOf;
            var NEGATIVE_ZERO = !!nativeIndexOf && 1 / [1].indexOf(1, -0) < 0;
            var STRICT_METHOD = arrayMethodIsStrict("indexOf");
            var USES_TO_LENGTH = arrayMethodUsesToLength("indexOf", { ACCESSORS: true, 1: 0 });
            $({ target: "Array", proto: true, forced: NEGATIVE_ZERO || !STRICT_METHOD || !USES_TO_LENGTH }, {
              indexOf: function indexOf(searchElement) {
                return NEGATIVE_ZERO ? nativeIndexOf.apply(this, arguments) || 0 : $indexOf(this, searchElement, arguments.length > 1 ? arguments[1] : void 0);
              }
            });
          }
        ),
        /***/
        "ca84": (
          /***/
          function(module2, exports$12, __webpack_require__) {
            var has = __webpack_require__("5135");
            var toIndexedObject = __webpack_require__("fc6a");
            var indexOf = __webpack_require__("4d64").indexOf;
            var hiddenKeys = __webpack_require__("d012");
            module2.exports = function(object, names) {
              var O = toIndexedObject(object);
              var i = 0;
              var result = [];
              var key;
              for (key in O) !has(hiddenKeys, key) && has(O, key) && result.push(key);
              while (names.length > i) if (has(O, key = names[i++])) {
                ~indexOf(result, key) || result.push(key);
              }
              return result;
            };
          }
        ),
        /***/
        "caad": (
          /***/
          function(module2, exports$12, __webpack_require__) {
            var $ = __webpack_require__("23e7");
            var $includes = __webpack_require__("4d64").includes;
            var addToUnscopables = __webpack_require__("44d2");
            var arrayMethodUsesToLength = __webpack_require__("ae40");
            var USES_TO_LENGTH = arrayMethodUsesToLength("indexOf", { ACCESSORS: true, 1: 0 });
            $({ target: "Array", proto: true, forced: !USES_TO_LENGTH }, {
              includes: function includes(el) {
                return $includes(this, el, arguments.length > 1 ? arguments[1] : void 0);
              }
            });
            addToUnscopables("includes");
          }
        ),
        /***/
        "cc12": (
          /***/
          function(module2, exports$12, __webpack_require__) {
            var global2 = __webpack_require__("da84");
            var isObject2 = __webpack_require__("861d");
            var document2 = global2.document;
            var EXISTS = isObject2(document2) && isObject2(document2.createElement);
            module2.exports = function(it) {
              return EXISTS ? document2.createElement(it) : {};
            };
          }
        ),
        /***/
        "ce4e": (
          /***/
          function(module2, exports$12, __webpack_require__) {
            var global2 = __webpack_require__("da84");
            var createNonEnumerableProperty = __webpack_require__("9112");
            module2.exports = function(key, value) {
              try {
                createNonEnumerableProperty(global2, key, value);
              } catch (error) {
                global2[key] = value;
              }
              return value;
            };
          }
        ),
        /***/
        "d012": (
          /***/
          function(module2, exports$12) {
            module2.exports = {};
          }
        ),
        /***/
        "d039": (
          /***/
          function(module2, exports$12) {
            module2.exports = function(exec) {
              try {
                return !!exec();
              } catch (error) {
                return true;
              }
            };
          }
        ),
        /***/
        "d066": (
          /***/
          function(module2, exports$12, __webpack_require__) {
            var path = __webpack_require__("428f");
            var global2 = __webpack_require__("da84");
            var aFunction = function(variable) {
              return typeof variable == "function" ? variable : void 0;
            };
            module2.exports = function(namespace, method) {
              return arguments.length < 2 ? aFunction(path[namespace]) || aFunction(global2[namespace]) : path[namespace] && path[namespace][method] || global2[namespace] && global2[namespace][method];
            };
          }
        ),
        /***/
        "d1e7": (
          /***/
          function(module2, exports$12, __webpack_require__) {
            var nativePropertyIsEnumerable = {}.propertyIsEnumerable;
            var getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
            var NASHORN_BUG = getOwnPropertyDescriptor && !nativePropertyIsEnumerable.call({ 1: 2 }, 1);
            exports$12.f = NASHORN_BUG ? function propertyIsEnumerable(V) {
              var descriptor = getOwnPropertyDescriptor(this, V);
              return !!descriptor && descriptor.enumerable;
            } : nativePropertyIsEnumerable;
          }
        ),
        /***/
        "d28b": (
          /***/
          function(module2, exports$12, __webpack_require__) {
            var defineWellKnownSymbol = __webpack_require__("746f");
            defineWellKnownSymbol("iterator");
          }
        ),
        /***/
        "d2bb": (
          /***/
          function(module2, exports$12, __webpack_require__) {
            var anObject = __webpack_require__("825a");
            var aPossiblePrototype = __webpack_require__("3bbe");
            module2.exports = Object.setPrototypeOf || ("__proto__" in {} ? function() {
              var CORRECT_SETTER = false;
              var test2 = {};
              var setter;
              try {
                setter = Object.getOwnPropertyDescriptor(Object.prototype, "__proto__").set;
                setter.call(test2, []);
                CORRECT_SETTER = test2 instanceof Array;
              } catch (error) {
              }
              return function setPrototypeOf(O, proto) {
                anObject(O);
                aPossiblePrototype(proto);
                if (CORRECT_SETTER) setter.call(O, proto);
                else O.__proto__ = proto;
                return O;
              };
            }() : void 0);
          }
        ),
        /***/
        "d3b7": (
          /***/
          function(module2, exports$12, __webpack_require__) {
            var TO_STRING_TAG_SUPPORT = __webpack_require__("00ee");
            var redefine = __webpack_require__("6eeb");
            var toString3 = __webpack_require__("b041");
            if (!TO_STRING_TAG_SUPPORT) {
              redefine(Object.prototype, "toString", toString3, { unsafe: true });
            }
          }
        ),
        /***/
        "d44e": (
          /***/
          function(module2, exports$12, __webpack_require__) {
            var defineProperty = __webpack_require__("9bf2").f;
            var has = __webpack_require__("5135");
            var wellKnownSymbol = __webpack_require__("b622");
            var TO_STRING_TAG = wellKnownSymbol("toStringTag");
            module2.exports = function(it, TAG, STATIC) {
              if (it && !has(it = STATIC ? it : it.prototype, TO_STRING_TAG)) {
                defineProperty(it, TO_STRING_TAG, { configurable: true, value: TAG });
              }
            };
          }
        ),
        /***/
        "d58f": (
          /***/
          function(module2, exports$12, __webpack_require__) {
            var aFunction = __webpack_require__("1c0b");
            var toObject = __webpack_require__("7b0b");
            var IndexedObject = __webpack_require__("44ad");
            var toLength = __webpack_require__("50c4");
            var createMethod = function(IS_RIGHT) {
              return function(that, callbackfn, argumentsLength, memo) {
                aFunction(callbackfn);
                var O = toObject(that);
                var self2 = IndexedObject(O);
                var length = toLength(O.length);
                var index2 = IS_RIGHT ? length - 1 : 0;
                var i = IS_RIGHT ? -1 : 1;
                if (argumentsLength < 2) while (true) {
                  if (index2 in self2) {
                    memo = self2[index2];
                    index2 += i;
                    break;
                  }
                  index2 += i;
                  if (IS_RIGHT ? index2 < 0 : length <= index2) {
                    throw TypeError("Reduce of empty array with no initial value");
                  }
                }
                for (; IS_RIGHT ? index2 >= 0 : length > index2; index2 += i) if (index2 in self2) {
                  memo = callbackfn(memo, self2[index2], index2, O);
                }
                return memo;
              };
            };
            module2.exports = {
              // `Array.prototype.reduce` method
              // https://tc39.github.io/ecma262/#sec-array.prototype.reduce
              left: createMethod(false),
              // `Array.prototype.reduceRight` method
              // https://tc39.github.io/ecma262/#sec-array.prototype.reduceright
              right: createMethod(true)
            };
          }
        ),
        /***/
        "d784": (
          /***/
          function(module2, exports$12, __webpack_require__) {
            __webpack_require__("ac1f");
            var redefine = __webpack_require__("6eeb");
            var fails = __webpack_require__("d039");
            var wellKnownSymbol = __webpack_require__("b622");
            var regexpExec = __webpack_require__("9263");
            var createNonEnumerableProperty = __webpack_require__("9112");
            var SPECIES = wellKnownSymbol("species");
            var REPLACE_SUPPORTS_NAMED_GROUPS = !fails(function() {
              var re = /./;
              re.exec = function() {
                var result = [];
                result.groups = { a: "7" };
                return result;
              };
              return "".replace(re, "$<a>") !== "7";
            });
            var REPLACE_KEEPS_$0 = function() {
              return "a".replace(/./, "$0") === "$0";
            }();
            var REPLACE = wellKnownSymbol("replace");
            var REGEXP_REPLACE_SUBSTITUTES_UNDEFINED_CAPTURE = function() {
              if (/./[REPLACE]) {
                return /./[REPLACE]("a", "$0") === "";
              }
              return false;
            }();
            var SPLIT_WORKS_WITH_OVERWRITTEN_EXEC = !fails(function() {
              var re = /(?:)/;
              var originalExec = re.exec;
              re.exec = function() {
                return originalExec.apply(this, arguments);
              };
              var result = "ab".split(re);
              return result.length !== 2 || result[0] !== "a" || result[1] !== "b";
            });
            module2.exports = function(KEY, length, exec, sham) {
              var SYMBOL = wellKnownSymbol(KEY);
              var DELEGATES_TO_SYMBOL = !fails(function() {
                var O = {};
                O[SYMBOL] = function() {
                  return 7;
                };
                return ""[KEY](O) != 7;
              });
              var DELEGATES_TO_EXEC = DELEGATES_TO_SYMBOL && !fails(function() {
                var execCalled = false;
                var re = /a/;
                if (KEY === "split") {
                  re = {};
                  re.constructor = {};
                  re.constructor[SPECIES] = function() {
                    return re;
                  };
                  re.flags = "";
                  re[SYMBOL] = /./[SYMBOL];
                }
                re.exec = function() {
                  execCalled = true;
                  return null;
                };
                re[SYMBOL]("");
                return !execCalled;
              });
              if (!DELEGATES_TO_SYMBOL || !DELEGATES_TO_EXEC || KEY === "replace" && !(REPLACE_SUPPORTS_NAMED_GROUPS && REPLACE_KEEPS_$0 && !REGEXP_REPLACE_SUBSTITUTES_UNDEFINED_CAPTURE) || KEY === "split" && !SPLIT_WORKS_WITH_OVERWRITTEN_EXEC) {
                var nativeRegExpMethod = /./[SYMBOL];
                var methods = exec(SYMBOL, ""[KEY], function(nativeMethod, regexp, str, arg2, forceStringMethod) {
                  if (regexp.exec === regexpExec) {
                    if (DELEGATES_TO_SYMBOL && !forceStringMethod) {
                      return { done: true, value: nativeRegExpMethod.call(regexp, str, arg2) };
                    }
                    return { done: true, value: nativeMethod.call(str, regexp, arg2) };
                  }
                  return { done: false };
                }, {
                  REPLACE_KEEPS_$0,
                  REGEXP_REPLACE_SUBSTITUTES_UNDEFINED_CAPTURE
                });
                var stringMethod = methods[0];
                var regexMethod = methods[1];
                redefine(String.prototype, KEY, stringMethod);
                redefine(
                  RegExp.prototype,
                  SYMBOL,
                  length == 2 ? function(string, arg) {
                    return regexMethod.call(string, this, arg);
                  } : function(string) {
                    return regexMethod.call(string, this);
                  }
                );
              }
              if (sham) createNonEnumerableProperty(RegExp.prototype[SYMBOL], "sham", true);
            };
          }
        ),
        /***/
        "d81d": (
          /***/
          function(module2, exports$12, __webpack_require__) {
            var $ = __webpack_require__("23e7");
            var $map = __webpack_require__("b727").map;
            var arrayMethodHasSpeciesSupport = __webpack_require__("1dde");
            var arrayMethodUsesToLength = __webpack_require__("ae40");
            var HAS_SPECIES_SUPPORT = arrayMethodHasSpeciesSupport("map");
            var USES_TO_LENGTH = arrayMethodUsesToLength("map");
            $({ target: "Array", proto: true, forced: !HAS_SPECIES_SUPPORT || !USES_TO_LENGTH }, {
              map: function map(callbackfn) {
                return $map(this, callbackfn, arguments.length > 1 ? arguments[1] : void 0);
              }
            });
          }
        ),
        /***/
        "da84": (
          /***/
          function(module2, exports$12, __webpack_require__) {
            (function(global2) {
              var check = function(it) {
                return it && it.Math == Math && it;
              };
              module2.exports = // eslint-disable-next-line no-undef
              check(typeof globalThis == "object" && globalThis) || check(typeof window == "object" && window) || check(typeof self == "object" && self) || check(typeof global2 == "object" && global2) || // eslint-disable-next-line no-new-func
              Function("return this")();
            }).call(this, __webpack_require__("c8ba"));
          }
        ),
        /***/
        "dbb4": (
          /***/
          function(module2, exports$12, __webpack_require__) {
            var $ = __webpack_require__("23e7");
            var DESCRIPTORS = __webpack_require__("83ab");
            var ownKeys2 = __webpack_require__("56ef");
            var toIndexedObject = __webpack_require__("fc6a");
            var getOwnPropertyDescriptorModule = __webpack_require__("06cf");
            var createProperty = __webpack_require__("8418");
            $({ target: "Object", stat: true, sham: !DESCRIPTORS }, {
              getOwnPropertyDescriptors: function getOwnPropertyDescriptors(object) {
                var O = toIndexedObject(object);
                var getOwnPropertyDescriptor = getOwnPropertyDescriptorModule.f;
                var keys = ownKeys2(O);
                var result = {};
                var index2 = 0;
                var key, descriptor;
                while (keys.length > index2) {
                  descriptor = getOwnPropertyDescriptor(O, key = keys[index2++]);
                  if (descriptor !== void 0) createProperty(result, key, descriptor);
                }
                return result;
              }
            });
          }
        ),
        /***/
        "dbf1": (
          /***/
          function(module2, __webpack_exports__, __webpack_require__) {
            (function(global2) {
              __webpack_require__.d(__webpack_exports__, "a", function() {
                return console2;
              });
              function getConsole() {
                if (typeof window !== "undefined") {
                  return window.console;
                }
                return global2.console;
              }
              var console2 = getConsole();
            }).call(this, __webpack_require__("c8ba"));
          }
        ),
        /***/
        "ddb0": (
          /***/
          function(module2, exports$12, __webpack_require__) {
            var global2 = __webpack_require__("da84");
            var DOMIterables = __webpack_require__("fdbc");
            var ArrayIteratorMethods = __webpack_require__("e260");
            var createNonEnumerableProperty = __webpack_require__("9112");
            var wellKnownSymbol = __webpack_require__("b622");
            var ITERATOR = wellKnownSymbol("iterator");
            var TO_STRING_TAG = wellKnownSymbol("toStringTag");
            var ArrayValues = ArrayIteratorMethods.values;
            for (var COLLECTION_NAME in DOMIterables) {
              var Collection = global2[COLLECTION_NAME];
              var CollectionPrototype = Collection && Collection.prototype;
              if (CollectionPrototype) {
                if (CollectionPrototype[ITERATOR] !== ArrayValues) try {
                  createNonEnumerableProperty(CollectionPrototype, ITERATOR, ArrayValues);
                } catch (error) {
                  CollectionPrototype[ITERATOR] = ArrayValues;
                }
                if (!CollectionPrototype[TO_STRING_TAG]) {
                  createNonEnumerableProperty(CollectionPrototype, TO_STRING_TAG, COLLECTION_NAME);
                }
                if (DOMIterables[COLLECTION_NAME]) for (var METHOD_NAME in ArrayIteratorMethods) {
                  if (CollectionPrototype[METHOD_NAME] !== ArrayIteratorMethods[METHOD_NAME]) try {
                    createNonEnumerableProperty(CollectionPrototype, METHOD_NAME, ArrayIteratorMethods[METHOD_NAME]);
                  } catch (error) {
                    CollectionPrototype[METHOD_NAME] = ArrayIteratorMethods[METHOD_NAME];
                  }
                }
              }
            }
          }
        ),
        /***/
        "df75": (
          /***/
          function(module2, exports$12, __webpack_require__) {
            var internalObjectKeys = __webpack_require__("ca84");
            var enumBugKeys = __webpack_require__("7839");
            module2.exports = Object.keys || function keys(O) {
              return internalObjectKeys(O, enumBugKeys);
            };
          }
        ),
        /***/
        "e01a": (
          /***/
          function(module2, exports$12, __webpack_require__) {
            var $ = __webpack_require__("23e7");
            var DESCRIPTORS = __webpack_require__("83ab");
            var global2 = __webpack_require__("da84");
            var has = __webpack_require__("5135");
            var isObject2 = __webpack_require__("861d");
            var defineProperty = __webpack_require__("9bf2").f;
            var copyConstructorProperties = __webpack_require__("e893");
            var NativeSymbol = global2.Symbol;
            if (DESCRIPTORS && typeof NativeSymbol == "function" && (!("description" in NativeSymbol.prototype) || // Safari 12 bug
            NativeSymbol().description !== void 0)) {
              var EmptyStringDescriptionStore = {};
              var SymbolWrapper = function Symbol2() {
                var description = arguments.length < 1 || arguments[0] === void 0 ? void 0 : String(arguments[0]);
                var result = this instanceof SymbolWrapper ? new NativeSymbol(description) : description === void 0 ? NativeSymbol() : NativeSymbol(description);
                if (description === "") EmptyStringDescriptionStore[result] = true;
                return result;
              };
              copyConstructorProperties(SymbolWrapper, NativeSymbol);
              var symbolPrototype = SymbolWrapper.prototype = NativeSymbol.prototype;
              symbolPrototype.constructor = SymbolWrapper;
              var symbolToString = symbolPrototype.toString;
              var native = String(NativeSymbol("test")) == "Symbol(test)";
              var regexp = /^Symbol\((.*)\)[^)]+$/;
              defineProperty(symbolPrototype, "description", {
                configurable: true,
                get: function description() {
                  var symbol = isObject2(this) ? this.valueOf() : this;
                  var string = symbolToString.call(symbol);
                  if (has(EmptyStringDescriptionStore, symbol)) return "";
                  var desc = native ? string.slice(7, -1) : string.replace(regexp, "$1");
                  return desc === "" ? void 0 : desc;
                }
              });
              $({ global: true, forced: true }, {
                Symbol: SymbolWrapper
              });
            }
          }
        ),
        /***/
        "e163": (
          /***/
          function(module2, exports$12, __webpack_require__) {
            var has = __webpack_require__("5135");
            var toObject = __webpack_require__("7b0b");
            var sharedKey = __webpack_require__("f772");
            var CORRECT_PROTOTYPE_GETTER = __webpack_require__("e177");
            var IE_PROTO = sharedKey("IE_PROTO");
            var ObjectPrototype = Object.prototype;
            module2.exports = CORRECT_PROTOTYPE_GETTER ? Object.getPrototypeOf : function(O) {
              O = toObject(O);
              if (has(O, IE_PROTO)) return O[IE_PROTO];
              if (typeof O.constructor == "function" && O instanceof O.constructor) {
                return O.constructor.prototype;
              }
              return O instanceof Object ? ObjectPrototype : null;
            };
          }
        ),
        /***/
        "e177": (
          /***/
          function(module2, exports$12, __webpack_require__) {
            var fails = __webpack_require__("d039");
            module2.exports = !fails(function() {
              function F() {
              }
              F.prototype.constructor = null;
              return Object.getPrototypeOf(new F()) !== F.prototype;
            });
          }
        ),
        /***/
        "e260": (
          /***/
          function(module2, exports$12, __webpack_require__) {
            var toIndexedObject = __webpack_require__("fc6a");
            var addToUnscopables = __webpack_require__("44d2");
            var Iterators = __webpack_require__("3f8c");
            var InternalStateModule = __webpack_require__("69f3");
            var defineIterator = __webpack_require__("7dd0");
            var ARRAY_ITERATOR = "Array Iterator";
            var setInternalState = InternalStateModule.set;
            var getInternalState = InternalStateModule.getterFor(ARRAY_ITERATOR);
            module2.exports = defineIterator(Array, "Array", function(iterated, kind) {
              setInternalState(this, {
                type: ARRAY_ITERATOR,
                target: toIndexedObject(iterated),
                // target
                index: 0,
                // next index
                kind
                // kind
              });
            }, function() {
              var state = getInternalState(this);
              var target = state.target;
              var kind = state.kind;
              var index2 = state.index++;
              if (!target || index2 >= target.length) {
                state.target = void 0;
                return { value: void 0, done: true };
              }
              if (kind == "keys") return { value: index2, done: false };
              if (kind == "values") return { value: target[index2], done: false };
              return { value: [index2, target[index2]], done: false };
            }, "values");
            Iterators.Arguments = Iterators.Array;
            addToUnscopables("keys");
            addToUnscopables("values");
            addToUnscopables("entries");
          }
        ),
        /***/
        "e439": (
          /***/
          function(module2, exports$12, __webpack_require__) {
            var $ = __webpack_require__("23e7");
            var fails = __webpack_require__("d039");
            var toIndexedObject = __webpack_require__("fc6a");
            var nativeGetOwnPropertyDescriptor = __webpack_require__("06cf").f;
            var DESCRIPTORS = __webpack_require__("83ab");
            var FAILS_ON_PRIMITIVES = fails(function() {
              nativeGetOwnPropertyDescriptor(1);
            });
            var FORCED = !DESCRIPTORS || FAILS_ON_PRIMITIVES;
            $({ target: "Object", stat: true, forced: FORCED, sham: !DESCRIPTORS }, {
              getOwnPropertyDescriptor: function getOwnPropertyDescriptor(it, key) {
                return nativeGetOwnPropertyDescriptor(toIndexedObject(it), key);
              }
            });
          }
        ),
        /***/
        "e538": (
          /***/
          function(module2, exports$12, __webpack_require__) {
            var wellKnownSymbol = __webpack_require__("b622");
            exports$12.f = wellKnownSymbol;
          }
        ),
        /***/
        "e893": (
          /***/
          function(module2, exports$12, __webpack_require__) {
            var has = __webpack_require__("5135");
            var ownKeys2 = __webpack_require__("56ef");
            var getOwnPropertyDescriptorModule = __webpack_require__("06cf");
            var definePropertyModule = __webpack_require__("9bf2");
            module2.exports = function(target, source) {
              var keys = ownKeys2(source);
              var defineProperty = definePropertyModule.f;
              var getOwnPropertyDescriptor = getOwnPropertyDescriptorModule.f;
              for (var i = 0; i < keys.length; i++) {
                var key = keys[i];
                if (!has(target, key)) defineProperty(target, key, getOwnPropertyDescriptor(source, key));
              }
            };
          }
        ),
        /***/
        "e8b5": (
          /***/
          function(module2, exports$12, __webpack_require__) {
            var classof = __webpack_require__("c6b6");
            module2.exports = Array.isArray || function isArray2(arg) {
              return classof(arg) == "Array";
            };
          }
        ),
        /***/
        "e95a": (
          /***/
          function(module2, exports$12, __webpack_require__) {
            var wellKnownSymbol = __webpack_require__("b622");
            var Iterators = __webpack_require__("3f8c");
            var ITERATOR = wellKnownSymbol("iterator");
            var ArrayPrototype = Array.prototype;
            module2.exports = function(it) {
              return it !== void 0 && (Iterators.Array === it || ArrayPrototype[ITERATOR] === it);
            };
          }
        ),
        /***/
        "f5df": (
          /***/
          function(module2, exports$12, __webpack_require__) {
            var TO_STRING_TAG_SUPPORT = __webpack_require__("00ee");
            var classofRaw = __webpack_require__("c6b6");
            var wellKnownSymbol = __webpack_require__("b622");
            var TO_STRING_TAG = wellKnownSymbol("toStringTag");
            var CORRECT_ARGUMENTS = classofRaw(/* @__PURE__ */ function() {
              return arguments;
            }()) == "Arguments";
            var tryGet = function(it, key) {
              try {
                return it[key];
              } catch (error) {
              }
            };
            module2.exports = TO_STRING_TAG_SUPPORT ? classofRaw : function(it) {
              var O, tag, result;
              return it === void 0 ? "Undefined" : it === null ? "Null" : typeof (tag = tryGet(O = Object(it), TO_STRING_TAG)) == "string" ? tag : CORRECT_ARGUMENTS ? classofRaw(O) : (result = classofRaw(O)) == "Object" && typeof O.callee == "function" ? "Arguments" : result;
            };
          }
        ),
        /***/
        "f772": (
          /***/
          function(module2, exports$12, __webpack_require__) {
            var shared = __webpack_require__("5692");
            var uid = __webpack_require__("90e3");
            var keys = shared("keys");
            module2.exports = function(key) {
              return keys[key] || (keys[key] = uid(key));
            };
          }
        ),
        /***/
        "fb15": (
          /***/
          function(module2, __webpack_exports__, __webpack_require__) {
            __webpack_require__.r(__webpack_exports__);
            if (typeof window !== "undefined") {
              var currentScript = window.document.currentScript;
              {
                var getCurrentScript = __webpack_require__("8875");
                currentScript = getCurrentScript();
                if (!("currentScript" in document)) {
                  Object.defineProperty(document, "currentScript", { get: getCurrentScript });
                }
              }
              var src = currentScript && currentScript.src.match(/(.+\/)[^/]+\.js(\?.*)?$/);
              if (src) {
                __webpack_require__.p = src[1];
              }
            }
            __webpack_require__("99af");
            __webpack_require__("4de4");
            __webpack_require__("4160");
            __webpack_require__("c975");
            __webpack_require__("d81d");
            __webpack_require__("a434");
            __webpack_require__("159b");
            __webpack_require__("a4d3");
            __webpack_require__("e439");
            __webpack_require__("dbb4");
            __webpack_require__("b64b");
            function _defineProperty2(obj, key, value) {
              if (key in obj) {
                Object.defineProperty(obj, key, {
                  value,
                  enumerable: true,
                  configurable: true,
                  writable: true
                });
              } else {
                obj[key] = value;
              }
              return obj;
            }
            function ownKeys2(object, enumerableOnly) {
              var keys = Object.keys(object);
              if (Object.getOwnPropertySymbols) {
                var symbols = Object.getOwnPropertySymbols(object);
                if (enumerableOnly) symbols = symbols.filter(function(sym) {
                  return Object.getOwnPropertyDescriptor(object, sym).enumerable;
                });
                keys.push.apply(keys, symbols);
              }
              return keys;
            }
            function _objectSpread22(target) {
              for (var i = 1; i < arguments.length; i++) {
                var source = arguments[i] != null ? arguments[i] : {};
                if (i % 2) {
                  ownKeys2(Object(source), true).forEach(function(key) {
                    _defineProperty2(target, key, source[key]);
                  });
                } else if (Object.getOwnPropertyDescriptors) {
                  Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
                } else {
                  ownKeys2(Object(source)).forEach(function(key) {
                    Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
                  });
                }
              }
              return target;
            }
            function _arrayWithHoles(arr) {
              if (Array.isArray(arr)) return arr;
            }
            __webpack_require__("e01a");
            __webpack_require__("d28b");
            __webpack_require__("e260");
            __webpack_require__("d3b7");
            __webpack_require__("3ca3");
            __webpack_require__("ddb0");
            function _iterableToArrayLimit(arr, i) {
              if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return;
              var _arr = [];
              var _n = true;
              var _d = false;
              var _e = void 0;
              try {
                for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
                  _arr.push(_s.value);
                  if (i && _arr.length === i) break;
                }
              } catch (err) {
                _d = true;
                _e = err;
              } finally {
                try {
                  if (!_n && _i["return"] != null) _i["return"]();
                } finally {
                  if (_d) throw _e;
                }
              }
              return _arr;
            }
            __webpack_require__("a630");
            __webpack_require__("fb6a");
            __webpack_require__("b0c0");
            __webpack_require__("25f0");
            function _arrayLikeToArray2(arr, len) {
              if (len == null || len > arr.length) len = arr.length;
              for (var i = 0, arr2 = new Array(len); i < len; i++) {
                arr2[i] = arr[i];
              }
              return arr2;
            }
            function _unsupportedIterableToArray2(o, minLen) {
              if (!o) return;
              if (typeof o === "string") return _arrayLikeToArray2(o, minLen);
              var n = Object.prototype.toString.call(o).slice(8, -1);
              if (n === "Object" && o.constructor) n = o.constructor.name;
              if (n === "Map" || n === "Set") return Array.from(o);
              if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray2(o, minLen);
            }
            function _nonIterableRest() {
              throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
            }
            function _slicedToArray(arr, i) {
              return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray2(arr, i) || _nonIterableRest();
            }
            function _arrayWithoutHoles2(arr) {
              if (Array.isArray(arr)) return _arrayLikeToArray2(arr);
            }
            function _iterableToArray2(iter) {
              if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter)) return Array.from(iter);
            }
            function _nonIterableSpread2() {
              throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
            }
            function _toConsumableArray2(arr) {
              return _arrayWithoutHoles2(arr) || _iterableToArray2(arr) || _unsupportedIterableToArray2(arr) || _nonIterableSpread2();
            }
            var external_commonjs_sortablejs_commonjs2_sortablejs_amd_sortablejs_root_Sortable_ = __webpack_require__("a352");
            var external_commonjs_sortablejs_commonjs2_sortablejs_amd_sortablejs_root_Sortable_default = /* @__PURE__ */ __webpack_require__.n(external_commonjs_sortablejs_commonjs2_sortablejs_amd_sortablejs_root_Sortable_);
            function removeNode(node) {
              if (node.parentElement !== null) {
                node.parentElement.removeChild(node);
              }
            }
            function insertNodeAt(fatherNode, node, position) {
              var refNode = position === 0 ? fatherNode.children[0] : fatherNode.children[position - 1].nextSibling;
              fatherNode.insertBefore(node, refNode);
            }
            var console2 = __webpack_require__("dbf1");
            __webpack_require__("13d5");
            __webpack_require__("4fad");
            __webpack_require__("ac1f");
            __webpack_require__("5319");
            function cached(fn) {
              var cache = /* @__PURE__ */ Object.create(null);
              return function cachedFn(str) {
                var hit = cache[str];
                return hit || (cache[str] = fn(str));
              };
            }
            var regex = /-(\w)/g;
            var camelize = cached(function(str) {
              return str.replace(regex, function(_, c) {
                return c.toUpperCase();
              });
            });
            __webpack_require__("5db7");
            __webpack_require__("73d9");
            var manageAndEmit = ["Start", "Add", "Remove", "Update", "End"];
            var emit = ["Choose", "Unchoose", "Sort", "Filter", "Clone"];
            var manage = ["Move"];
            var eventHandlerNames = [manage, manageAndEmit, emit].flatMap(function(events2) {
              return events2;
            }).map(function(evt) {
              return "on".concat(evt);
            });
            var events = {
              manage,
              manageAndEmit,
              emit
            };
            function isReadOnly(eventName) {
              return eventHandlerNames.indexOf(eventName) !== -1;
            }
            __webpack_require__("caad");
            __webpack_require__("2ca0");
            var tags = ["a", "abbr", "address", "area", "article", "aside", "audio", "b", "base", "bdi", "bdo", "blockquote", "body", "br", "button", "canvas", "caption", "cite", "code", "col", "colgroup", "data", "datalist", "dd", "del", "details", "dfn", "dialog", "div", "dl", "dt", "em", "embed", "fieldset", "figcaption", "figure", "footer", "form", "h1", "h2", "h3", "h4", "h5", "h6", "head", "header", "hgroup", "hr", "html", "i", "iframe", "img", "input", "ins", "kbd", "label", "legend", "li", "link", "main", "map", "mark", "math", "menu", "menuitem", "meta", "meter", "nav", "noscript", "object", "ol", "optgroup", "option", "output", "p", "param", "picture", "pre", "progress", "q", "rb", "rp", "rt", "rtc", "ruby", "s", "samp", "script", "section", "select", "slot", "small", "source", "span", "strong", "style", "sub", "summary", "sup", "svg", "table", "tbody", "td", "template", "textarea", "tfoot", "th", "thead", "time", "title", "tr", "track", "u", "ul", "var", "video", "wbr"];
            function isHtmlTag(name) {
              return tags.includes(name);
            }
            function isTransition(name) {
              return ["transition-group", "TransitionGroup"].includes(name);
            }
            function isHtmlAttribute(value) {
              return ["id", "class", "role", "style"].includes(value) || value.startsWith("data-") || value.startsWith("aria-") || value.startsWith("on");
            }
            function project(entries) {
              return entries.reduce(function(res, _ref) {
                var _ref2 = _slicedToArray(_ref, 2), key = _ref2[0], value = _ref2[1];
                res[key] = value;
                return res;
              }, {});
            }
            function getComponentAttributes(_ref3) {
              var $attrs = _ref3.$attrs, _ref3$componentData = _ref3.componentData, componentData = _ref3$componentData === void 0 ? {} : _ref3$componentData;
              var attributes = project(Object.entries($attrs).filter(function(_ref4) {
                var _ref5 = _slicedToArray(_ref4, 2), key = _ref5[0];
                _ref5[1];
                return isHtmlAttribute(key);
              }));
              return _objectSpread22(_objectSpread22({}, attributes), componentData);
            }
            function createSortableOption(_ref6) {
              var $attrs = _ref6.$attrs, callBackBuilder = _ref6.callBackBuilder;
              var options = project(getValidSortableEntries($attrs));
              Object.entries(callBackBuilder).forEach(function(_ref7) {
                var _ref8 = _slicedToArray(_ref7, 2), eventType = _ref8[0], eventBuilder = _ref8[1];
                events[eventType].forEach(function(event) {
                  options["on".concat(event)] = eventBuilder(event);
                });
              });
              var draggable2 = "[data-draggable]".concat(options.draggable || "");
              return _objectSpread22(_objectSpread22({}, options), {}, {
                draggable: draggable2
              });
            }
            function getValidSortableEntries(value) {
              return Object.entries(value).filter(function(_ref9) {
                var _ref10 = _slicedToArray(_ref9, 2), key = _ref10[0];
                _ref10[1];
                return !isHtmlAttribute(key);
              }).map(function(_ref11) {
                var _ref12 = _slicedToArray(_ref11, 2), key = _ref12[0], value2 = _ref12[1];
                return [camelize(key), value2];
              }).filter(function(_ref13) {
                var _ref14 = _slicedToArray(_ref13, 2), key = _ref14[0];
                _ref14[1];
                return !isReadOnly(key);
              });
            }
            __webpack_require__("c740");
            function _classCallCheck(instance, Constructor) {
              if (!(instance instanceof Constructor)) {
                throw new TypeError("Cannot call a class as a function");
              }
            }
            function _defineProperties(target, props2) {
              for (var i = 0; i < props2.length; i++) {
                var descriptor = props2[i];
                descriptor.enumerable = descriptor.enumerable || false;
                descriptor.configurable = true;
                if ("value" in descriptor) descriptor.writable = true;
                Object.defineProperty(target, descriptor.key, descriptor);
              }
            }
            function _createClass(Constructor, protoProps, staticProps) {
              if (protoProps) _defineProperties(Constructor.prototype, protoProps);
              return Constructor;
            }
            var getHtmlElementFromNode = function getHtmlElementFromNode2(_ref) {
              var el = _ref.el;
              return el;
            };
            var addContext = function addContext2(domElement, context) {
              return domElement.__draggable_context = context;
            };
            var getContext = function getContext2(domElement) {
              return domElement.__draggable_context;
            };
            var componentStructure_ComponentStructure = /* @__PURE__ */ function() {
              function ComponentStructure(_ref2) {
                var _ref2$nodes = _ref2.nodes, header = _ref2$nodes.header, defaultNodes = _ref2$nodes.default, footer = _ref2$nodes.footer, root = _ref2.root, realList = _ref2.realList;
                _classCallCheck(this, ComponentStructure);
                this.defaultNodes = defaultNodes;
                this.children = [].concat(_toConsumableArray2(header), _toConsumableArray2(defaultNodes), _toConsumableArray2(footer));
                this.externalComponent = root.externalComponent;
                this.rootTransition = root.transition;
                this.tag = root.tag;
                this.realList = realList;
              }
              _createClass(ComponentStructure, [{
                key: "render",
                value: function render(h, attributes) {
                  var tag = this.tag, children = this.children, _isRootComponent = this._isRootComponent;
                  var option2 = !_isRootComponent ? children : {
                    default: function _default() {
                      return children;
                    }
                  };
                  return h(tag, attributes, option2);
                }
              }, {
                key: "updated",
                value: function updated() {
                  var defaultNodes = this.defaultNodes, realList = this.realList;
                  defaultNodes.forEach(function(node, index2) {
                    addContext(getHtmlElementFromNode(node), {
                      element: realList[index2],
                      index: index2
                    });
                  });
                }
              }, {
                key: "getUnderlyingVm",
                value: function getUnderlyingVm(domElement) {
                  return getContext(domElement);
                }
              }, {
                key: "getVmIndexFromDomIndex",
                value: function getVmIndexFromDomIndex(domIndex, element) {
                  var defaultNodes = this.defaultNodes;
                  var length = defaultNodes.length;
                  var domChildren = element.children;
                  var domElement = domChildren.item(domIndex);
                  if (domElement === null) {
                    return length;
                  }
                  var context = getContext(domElement);
                  if (context) {
                    return context.index;
                  }
                  if (length === 0) {
                    return 0;
                  }
                  var firstDomListElement = getHtmlElementFromNode(defaultNodes[0]);
                  var indexFirstDomListElement = _toConsumableArray2(domChildren).findIndex(function(element2) {
                    return element2 === firstDomListElement;
                  });
                  return domIndex < indexFirstDomListElement ? 0 : length;
                }
              }, {
                key: "_isRootComponent",
                get: function get() {
                  return this.externalComponent || this.rootTransition;
                }
              }]);
              return ComponentStructure;
            }();
            var external_commonjs_vue_commonjs2_vue_root_Vue_ = __webpack_require__("8bbf");
            function getSlot(slots, key) {
              var slotValue = slots[key];
              return slotValue ? slotValue() : [];
            }
            function computeNodes(_ref) {
              var $slots = _ref.$slots, realList = _ref.realList, getKey = _ref.getKey;
              var normalizedList = realList || [];
              var _map = ["header", "footer"].map(function(name) {
                return getSlot($slots, name);
              }), _map2 = _slicedToArray(_map, 2), header = _map2[0], footer = _map2[1];
              var item = $slots.item;
              if (!item) {
                throw new Error("draggable element must have an item slot");
              }
              var defaultNodes = normalizedList.flatMap(function(element, index2) {
                return item({
                  element,
                  index: index2
                }).map(function(node) {
                  node.key = getKey(element);
                  node.props = _objectSpread22(_objectSpread22({}, node.props || {}), {}, {
                    "data-draggable": true
                  });
                  return node;
                });
              });
              if (defaultNodes.length !== normalizedList.length) {
                throw new Error("Item slot must have only one child");
              }
              return {
                header,
                footer,
                default: defaultNodes
              };
            }
            function getRootInformation(tag) {
              var transition = isTransition(tag);
              var externalComponent = !isHtmlTag(tag) && !transition;
              return {
                transition,
                externalComponent,
                tag: externalComponent ? Object(external_commonjs_vue_commonjs2_vue_root_Vue_["resolveComponent"])(tag) : transition ? external_commonjs_vue_commonjs2_vue_root_Vue_["TransitionGroup"] : tag
              };
            }
            function computeComponentStructure(_ref2) {
              var $slots = _ref2.$slots, tag = _ref2.tag, realList = _ref2.realList, getKey = _ref2.getKey;
              var nodes = computeNodes({
                $slots,
                realList,
                getKey
              });
              var root = getRootInformation(tag);
              return new componentStructure_ComponentStructure({
                nodes,
                root,
                realList
              });
            }
            function _emit(evtName, evtData) {
              var _this = this;
              Object(external_commonjs_vue_commonjs2_vue_root_Vue_["nextTick"])(function() {
                return _this.$emit(evtName.toLowerCase(), evtData);
              });
            }
            function _manage(evtName) {
              var _this2 = this;
              return function(evtData, originalElement) {
                if (_this2.realList !== null) {
                  return _this2["onDrag".concat(evtName)](evtData, originalElement);
                }
              };
            }
            function _manageAndEmit(evtName) {
              var _this3 = this;
              var delegateCallBack = _manage.call(this, evtName);
              return function(evtData, originalElement) {
                delegateCallBack.call(_this3, evtData, originalElement);
                _emit.call(_this3, evtName, evtData);
              };
            }
            var draggingElement = null;
            var props = {
              list: {
                type: Array,
                required: false,
                default: null
              },
              modelValue: {
                type: Array,
                required: false,
                default: null
              },
              itemKey: {
                type: [String, Function],
                required: true
              },
              clone: {
                type: Function,
                default: function _default(original) {
                  return original;
                }
              },
              tag: {
                type: String,
                default: "div"
              },
              move: {
                type: Function,
                default: null
              },
              componentData: {
                type: Object,
                required: false,
                default: null
              }
            };
            var emits = ["update:modelValue", "change"].concat(_toConsumableArray2([].concat(_toConsumableArray2(events.manageAndEmit), _toConsumableArray2(events.emit)).map(function(evt) {
              return evt.toLowerCase();
            })));
            var draggableComponent = Object(external_commonjs_vue_commonjs2_vue_root_Vue_["defineComponent"])({
              name: "draggable",
              inheritAttrs: false,
              props,
              emits,
              data: function data() {
                return {
                  error: false
                };
              },
              render: function render() {
                try {
                  this.error = false;
                  var $slots = this.$slots, $attrs = this.$attrs, tag = this.tag, componentData = this.componentData, realList = this.realList, getKey = this.getKey;
                  var componentStructure = computeComponentStructure({
                    $slots,
                    tag,
                    realList,
                    getKey
                  });
                  this.componentStructure = componentStructure;
                  var attributes = getComponentAttributes({
                    $attrs,
                    componentData
                  });
                  return componentStructure.render(external_commonjs_vue_commonjs2_vue_root_Vue_["h"], attributes);
                } catch (err) {
                  this.error = true;
                  return Object(external_commonjs_vue_commonjs2_vue_root_Vue_["h"])("pre", {
                    style: {
                      color: "red"
                    }
                  }, err.stack);
                }
              },
              created: function created() {
                if (this.list !== null && this.modelValue !== null) {
                  console2[
                    "a"
                    /* console */
                  ].error("modelValue and list props are mutually exclusive! Please set one or another.");
                }
              },
              mounted: function mounted() {
                var _this4 = this;
                if (this.error) {
                  return;
                }
                var $attrs = this.$attrs, $el = this.$el, componentStructure = this.componentStructure;
                componentStructure.updated();
                var sortableOptions = createSortableOption({
                  $attrs,
                  callBackBuilder: {
                    manageAndEmit: function manageAndEmit2(event) {
                      return _manageAndEmit.call(_this4, event);
                    },
                    emit: function emit2(event) {
                      return _emit.bind(_this4, event);
                    },
                    manage: function manage2(event) {
                      return _manage.call(_this4, event);
                    }
                  }
                });
                var targetDomElement = $el.nodeType === 1 ? $el : $el.parentElement;
                this._sortable = new external_commonjs_sortablejs_commonjs2_sortablejs_amd_sortablejs_root_Sortable_default.a(targetDomElement, sortableOptions);
                this.targetDomElement = targetDomElement;
                targetDomElement.__draggable_component__ = this;
              },
              updated: function updated() {
                this.componentStructure.updated();
              },
              beforeUnmount: function beforeUnmount() {
                if (this._sortable !== void 0) this._sortable.destroy();
              },
              computed: {
                realList: function realList() {
                  var list = this.list;
                  return list ? list : this.modelValue;
                },
                getKey: function getKey() {
                  var itemKey = this.itemKey;
                  if (typeof itemKey === "function") {
                    return itemKey;
                  }
                  return function(element) {
                    return element[itemKey];
                  };
                }
              },
              watch: {
                $attrs: {
                  handler: function handler(newOptionValue) {
                    var _sortable = this._sortable;
                    if (!_sortable) return;
                    getValidSortableEntries(newOptionValue).forEach(function(_ref) {
                      var _ref2 = _slicedToArray(_ref, 2), key = _ref2[0], value = _ref2[1];
                      _sortable.option(key, value);
                    });
                  },
                  deep: true
                }
              },
              methods: {
                getUnderlyingVm: function getUnderlyingVm(domElement) {
                  return this.componentStructure.getUnderlyingVm(domElement) || null;
                },
                getUnderlyingPotencialDraggableComponent: function getUnderlyingPotencialDraggableComponent(htmElement) {
                  return htmElement.__draggable_component__;
                },
                emitChanges: function emitChanges(evt) {
                  var _this5 = this;
                  Object(external_commonjs_vue_commonjs2_vue_root_Vue_["nextTick"])(function() {
                    return _this5.$emit("change", evt);
                  });
                },
                alterList: function alterList(onList) {
                  if (this.list) {
                    onList(this.list);
                    return;
                  }
                  var newList = _toConsumableArray2(this.modelValue);
                  onList(newList);
                  this.$emit("update:modelValue", newList);
                },
                spliceList: function spliceList() {
                  var _arguments = arguments;
                  var spliceList2 = function spliceList3(list) {
                    return list.splice.apply(list, _toConsumableArray2(_arguments));
                  };
                  this.alterList(spliceList2);
                },
                updatePosition: function updatePosition(oldIndex2, newIndex2) {
                  var updatePosition2 = function updatePosition3(list) {
                    return list.splice(newIndex2, 0, list.splice(oldIndex2, 1)[0]);
                  };
                  this.alterList(updatePosition2);
                },
                getRelatedContextFromMoveEvent: function getRelatedContextFromMoveEvent(_ref3) {
                  var to = _ref3.to, related = _ref3.related;
                  var component = this.getUnderlyingPotencialDraggableComponent(to);
                  if (!component) {
                    return {
                      component
                    };
                  }
                  var list = component.realList;
                  var context = {
                    list,
                    component
                  };
                  if (to !== related && list) {
                    var destination = component.getUnderlyingVm(related) || {};
                    return _objectSpread22(_objectSpread22({}, destination), context);
                  }
                  return context;
                },
                getVmIndexFromDomIndex: function getVmIndexFromDomIndex(domIndex) {
                  return this.componentStructure.getVmIndexFromDomIndex(domIndex, this.targetDomElement);
                },
                onDragStart: function onDragStart(evt) {
                  this.context = this.getUnderlyingVm(evt.item);
                  evt.item._underlying_vm_ = this.clone(this.context.element);
                  draggingElement = evt.item;
                },
                onDragAdd: function onDragAdd(evt) {
                  var element = evt.item._underlying_vm_;
                  if (element === void 0) {
                    return;
                  }
                  removeNode(evt.item);
                  var newIndex2 = this.getVmIndexFromDomIndex(evt.newIndex);
                  this.spliceList(newIndex2, 0, element);
                  var added = {
                    element,
                    newIndex: newIndex2
                  };
                  this.emitChanges({
                    added
                  });
                },
                onDragRemove: function onDragRemove(evt) {
                  insertNodeAt(this.$el, evt.item, evt.oldIndex);
                  if (evt.pullMode === "clone") {
                    removeNode(evt.clone);
                    return;
                  }
                  var _this$context = this.context, oldIndex2 = _this$context.index, element = _this$context.element;
                  this.spliceList(oldIndex2, 1);
                  var removed = {
                    element,
                    oldIndex: oldIndex2
                  };
                  this.emitChanges({
                    removed
                  });
                },
                onDragUpdate: function onDragUpdate(evt) {
                  removeNode(evt.item);
                  insertNodeAt(evt.from, evt.item, evt.oldIndex);
                  var oldIndex2 = this.context.index;
                  var newIndex2 = this.getVmIndexFromDomIndex(evt.newIndex);
                  this.updatePosition(oldIndex2, newIndex2);
                  var moved2 = {
                    element: this.context.element,
                    oldIndex: oldIndex2,
                    newIndex: newIndex2
                  };
                  this.emitChanges({
                    moved: moved2
                  });
                },
                computeFutureIndex: function computeFutureIndex(relatedContext, evt) {
                  if (!relatedContext.element) {
                    return 0;
                  }
                  var domChildren = _toConsumableArray2(evt.to.children).filter(function(el) {
                    return el.style["display"] !== "none";
                  });
                  var currentDomIndex = domChildren.indexOf(evt.related);
                  var currentIndex = relatedContext.component.getVmIndexFromDomIndex(currentDomIndex);
                  var draggedInList = domChildren.indexOf(draggingElement) !== -1;
                  return draggedInList || !evt.willInsertAfter ? currentIndex : currentIndex + 1;
                },
                onDragMove: function onDragMove(evt, originalEvent) {
                  var move = this.move, realList = this.realList;
                  if (!move || !realList) {
                    return true;
                  }
                  var relatedContext = this.getRelatedContextFromMoveEvent(evt);
                  var futureIndex = this.computeFutureIndex(relatedContext, evt);
                  var draggedContext = _objectSpread22(_objectSpread22({}, this.context), {}, {
                    futureIndex
                  });
                  var sendEvent = _objectSpread22(_objectSpread22({}, evt), {}, {
                    relatedContext,
                    draggedContext
                  });
                  return move(sendEvent, originalEvent);
                },
                onDragEnd: function onDragEnd() {
                  draggingElement = null;
                }
              }
            });
            var vuedraggable = draggableComponent;
            __webpack_exports__["default"] = vuedraggable;
          }
        ),
        /***/
        "fb6a": (
          /***/
          function(module2, exports$12, __webpack_require__) {
            var $ = __webpack_require__("23e7");
            var isObject2 = __webpack_require__("861d");
            var isArray2 = __webpack_require__("e8b5");
            var toAbsoluteIndex = __webpack_require__("23cb");
            var toLength = __webpack_require__("50c4");
            var toIndexedObject = __webpack_require__("fc6a");
            var createProperty = __webpack_require__("8418");
            var wellKnownSymbol = __webpack_require__("b622");
            var arrayMethodHasSpeciesSupport = __webpack_require__("1dde");
            var arrayMethodUsesToLength = __webpack_require__("ae40");
            var HAS_SPECIES_SUPPORT = arrayMethodHasSpeciesSupport("slice");
            var USES_TO_LENGTH = arrayMethodUsesToLength("slice", { ACCESSORS: true, 0: 0, 1: 2 });
            var SPECIES = wellKnownSymbol("species");
            var nativeSlice = [].slice;
            var max = Math.max;
            $({ target: "Array", proto: true, forced: !HAS_SPECIES_SUPPORT || !USES_TO_LENGTH }, {
              slice: function slice(start, end) {
                var O = toIndexedObject(this);
                var length = toLength(O.length);
                var k = toAbsoluteIndex(start, length);
                var fin = toAbsoluteIndex(end === void 0 ? length : end, length);
                var Constructor, result, n;
                if (isArray2(O)) {
                  Constructor = O.constructor;
                  if (typeof Constructor == "function" && (Constructor === Array || isArray2(Constructor.prototype))) {
                    Constructor = void 0;
                  } else if (isObject2(Constructor)) {
                    Constructor = Constructor[SPECIES];
                    if (Constructor === null) Constructor = void 0;
                  }
                  if (Constructor === Array || Constructor === void 0) {
                    return nativeSlice.call(O, k, fin);
                  }
                }
                result = new (Constructor === void 0 ? Array : Constructor)(max(fin - k, 0));
                for (n = 0; k < fin; k++, n++) if (k in O) createProperty(result, n, O[k]);
                result.length = n;
                return result;
              }
            });
          }
        ),
        /***/
        "fc6a": (
          /***/
          function(module2, exports$12, __webpack_require__) {
            var IndexedObject = __webpack_require__("44ad");
            var requireObjectCoercible = __webpack_require__("1d80");
            module2.exports = function(it) {
              return IndexedObject(requireObjectCoercible(it));
            };
          }
        ),
        /***/
        "fdbc": (
          /***/
          function(module2, exports$12) {
            module2.exports = {
              CSSRuleList: 0,
              CSSStyleDeclaration: 0,
              CSSValueList: 0,
              ClientRectList: 0,
              DOMRectList: 0,
              DOMStringList: 0,
              DOMTokenList: 1,
              DataTransferItemList: 0,
              FileList: 0,
              HTMLAllCollection: 0,
              HTMLCollection: 0,
              HTMLFormElement: 0,
              HTMLSelectElement: 0,
              MediaList: 0,
              MimeTypeArray: 0,
              NamedNodeMap: 0,
              NodeList: 1,
              PaintRequestList: 0,
              Plugin: 0,
              PluginArray: 0,
              SVGLengthList: 0,
              SVGNumberList: 0,
              SVGPathSegList: 0,
              SVGPointList: 0,
              SVGStringList: 0,
              SVGTransformList: 0,
              SourceBufferList: 0,
              StyleSheetList: 0,
              TextTrackCueList: 0,
              TextTrackList: 0,
              TouchList: 0
            };
          }
        ),
        /***/
        "fdbf": (
          /***/
          function(module2, exports$12, __webpack_require__) {
            var NATIVE_SYMBOL = __webpack_require__("4930");
            module2.exports = NATIVE_SYMBOL && !Symbol.sham && typeof Symbol.iterator == "symbol";
          }
        )
        /******/
      })["default"]
    );
  });
})(vuedraggable_umd);
var vuedraggable_umdExports = vuedraggable_umd.exports;
const draggable = /* @__PURE__ */ getDefaultExportFromCjs(vuedraggable_umdExports);
const _hoisted_1 = { class: "min-h-screen bg-nexus-bg overflow-hidden relative" };
const _hoisted_2 = { class: "relative z-10 flex flex-col h-screen" };
const _hoisted_3 = { class: "flex-1 overflow-y-auto custom-scrollbar p-8" };
const _hoisted_4 = { class: "max-w-7xl mx-auto" };
const _hoisted_5 = ["onClick"];
const _hoisted_6 = { class: "relative space-y-3" };
const _hoisted_7 = { class: "flex items-start justify-between" };
const _hoisted_8 = { class: "text-lg font-semibold text-white" };
const _hoisted_9 = {
  key: 0,
  class: "px-2 py-0.5 text-xs font-medium uppercase tracking-wider rounded bg-neon-blue/20 text-neon-blue border border-neon-blue/30"
};
const _hoisted_10 = { class: "flex items-center gap-4 pt-2" };
const _hoisted_11 = { class: "flex items-center gap-2" };
const _hoisted_12 = { class: "text-sm text-text-tertiary" };
const _hoisted_13 = { class: "flex items-center gap-2" };
const _hoisted_14 = { class: "text-xs text-text-tertiary" };
const _hoisted_15 = { class: "bg-nexus-surface rounded-2xl shadow-2xl w-full max-w-2xl mx-4 border border-white/10 animate-slide-up" };
const _hoisted_16 = { class: "p-6 space-y-4" };
const _hoisted_17 = { class: "grid grid-cols-8 gap-2" };
const _hoisted_18 = ["onClick"];
const _hoisted_19 = {
  key: 1,
  class: "flex items-center justify-between"
};
const _hoisted_20 = { class: "flex items-center gap-2" };
const _hoisted_21 = { class: "text-sm text-white" };
const _hoisted_22 = { class: "flex items-center gap-2 p-3 bg-black/20 border border-white/10 rounded-lg" };
const _hoisted_23 = { key: 0 };
const _hoisted_24 = ["value"];
const _hoisted_25 = { class: "px-6 py-4 border-t border-white/10 flex justify-end gap-3" };
const _hoisted_26 = ["disabled"];
const _sfc_main = {
  __name: "NexusPage",
  setup(__props) {
    const router = useRouter();
    const route = useRoute();
    const graphStore = useGraphStore();
    const showCreateDialog = ref(false);
    const isCreating = ref(false);
    const isDragging = ref(false);
    const uploadedFile = ref(null);
    const fileInputRef = ref(null);
    const useRAGFlow = ref(false);
    const selectedDataset = ref("");
    const ragflowDatasets = ref([]);
    const newGraphData = ref({
      name: "",
      description: "",
      icon: "🧠"
    });
    const iconOptions = ["🧠", "📚", "🎯", "💡", "🌟", "🚀", "🎨", "⚡", "🔮", "🎪", "🌈", "🎭", "🎪", "🎬", "🎮", "🎲"];
    const formatLastUpdate = (lastUpdate) => {
      if (!lastUpdate) return "尚未載入";
      const now = /* @__PURE__ */ new Date();
      const updateTime = new Date(lastUpdate);
      const diffMins = Math.floor((now - updateTime) / 6e4);
      if (diffMins < 1) return "剛剛更新";
      if (diffMins < 60) return `${diffMins} 分鐘前`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours} 小時前`;
      return updateTime.toLocaleDateString("zh-TW");
    };
    const graphList = computed(() => {
      const list = graphStore.graphMetadataList;
      if (list && list.length > 0) {
        return list.map((g) => ({
          id: g.id,
          name: g.name || `圖譜 ${g.id}`,
          icon: g.icon || "🌐",
          nodeCount: g.nodeCount || g.node_count || 0,
          linkCount: g.linkCount || g.link_count || 0,
          lastUpdate: formatLastUpdate(g.lastUpdate || g.last_update || g.updated_at),
          defaultView: g.defaultView || "2D",
          description: g.description || ""
        }));
      }
      if (graphStore.nodeCount > 0) {
        return [{
          id: graphStore.currentGraphId,
          name: "主腦圖譜",
          icon: "🧠",
          nodeCount: graphStore.nodeCount,
          linkCount: graphStore.linkCount,
          lastUpdate: formatLastUpdate(graphStore.lastUpdate),
          defaultView: graphStore.viewMode === "3d" ? "3D" : "2D"
        }];
      }
      return [];
    });
    const sortedGraphList = ref([]);
    watch(graphList, (newList) => {
      const savedOrder = JSON.parse(localStorage.getItem("nexus_graph_order") || "[]");
      if (savedOrder.length > 0) {
        const sorted = [];
        savedOrder.forEach((id) => {
          const graph = newList.find((g) => g.id === id);
          if (graph) sorted.push(graph);
        });
        newList.forEach((g) => {
          if (!sorted.find((s) => s.id === g.id)) sorted.push(g);
        });
        sortedGraphList.value = sorted;
      } else {
        sortedGraphList.value = [...newList];
      }
    }, { immediate: true });
    const onDragEnd = () => {
      const order = sortedGraphList.value.map((g) => g.id);
      localStorage.setItem("nexus_graph_order", JSON.stringify(order));
      ElMessage({ message: "排序已儲存", type: "success", duration: 1200 });
    };
    const openGraph = async (graphId) => {
      try {
        await graphStore.fetchGraphData(graphId);
        const graph = graphList.value.find((g) => g.id === graphId);
        ElMessage.success({
          message: `正在開啟「${graph.name}」`,
          duration: 1500
        });
        setTimeout(() => router.push("/graph-page"), 500);
      } catch (error) {
        ElMessage.error("圖譜載入失敗: " + error.message);
      }
    };
    const createNewGraph = () => {
      showCreateDialog.value = true;
      newGraphData.value = { name: "", description: "", icon: "🧠" };
      uploadedFile.value = null;
      useRAGFlow.value = false;
      selectedDataset.value = "";
    };
    const closeCreateDialog = () => {
      showCreateDialog.value = false;
      isDragging.value = false;
    };
    const handleFileDrop = (e) => {
      isDragging.value = false;
      const files = e.dataTransfer.files;
      if (files.length > 0) uploadedFile.value = files[0];
    };
    const handleFileSelect = (e) => {
      const files = e.target.files;
      if (files.length > 0) uploadedFile.value = files[0];
    };
    const uploadFileToGraph = async (graphId) => {
      if (!uploadedFile.value) return;
      try {
        const result = await graphStore.uploadFileToGraph(uploadedFile.value, graphId, "existing");
        if (result.success) {
          ElMessage.success(`📤 文件「${uploadedFile.value.name}」上傳成功`);
        }
      } catch (error) {
        ElMessage.error(`文件上傳失敗: ${error.message}`);
      }
    };
    const handleCreateGraph = async () => {
      if (!newGraphData.value.name) {
        ElMessage.warning("請輸入圖譜名稱");
        return;
      }
      isCreating.value = true;
      try {
        const createdGraph = await graphStore.createGraph(newGraphData.value);
        ElMessage.success(`✅ 圖譜「${createdGraph.name}」創建成功！`);
        graphStore.currentGraphId = createdGraph.id;
        if (uploadedFile.value) {
          await uploadFileToGraph(createdGraph.id);
        }
        closeCreateDialog();
        await graphStore.fetchGraphData(createdGraph.id);
        setTimeout(() => router.push("/graph-page"), 300);
      } catch (error) {
        ElMessage.error(`創建失敗: ${error.message}`);
      } finally {
        isCreating.value = false;
      }
    };
    const fetchRAGFlowDatasets = async () => {
      try {
        const response = await axios.get("/api/ragflow/datasets");
        if (response.data && response.data.code === 0) {
          ragflowDatasets.value = response.data.data || [];
        }
      } catch (error) {
        console.warn("⚠️ 獲取 RAGFlow 數據集失敗:", error);
      }
    };
    const loadGraphData = async (forceRefresh = false) => {
      try {
        await graphStore.loadGraphMetadataList({ forceRefresh });
        console.log("✅ NexusPage: 圖譜列表已重新載入", graphStore.graphMetadataList.length);
      } catch (error) {
        console.warn("⚠️ 圖譜列表載入失敗:", error.message);
      }
    };
    onMounted(async () => {
      await loadGraphData();
      await fetchRAGFlowDatasets();
    });
    onActivated(async () => {
      console.log("🔄 NexusPage 已激活，重新載入圖譜列表");
      await loadGraphData(true);
    });
    watch(
      () => route.path,
      (newPath) => {
        if (newPath === "/nexus") {
          console.log("🔄 路由切換到 Nexus，重新載入圖譜列表");
          loadGraphData(true);
        }
      }
    );
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", _hoisted_1, [
        _cache[27] || (_cache[27] = createBaseVNode("div", { class: "absolute inset-0 overflow-hidden pointer-events-none" }, [
          createBaseVNode("div", { class: "stars" }),
          createBaseVNode("div", { class: "stars2" })
        ], -1)),
        createBaseVNode("div", _hoisted_2, [
          _cache[17] || (_cache[17] = createStaticVNode('<header class="flex items-center justify-between px-8 py-6 border-b border-white/5" data-v-5abcebfc><div class="flex items-center gap-4" data-v-5abcebfc><div class="w-10 h-10 rounded-lg bg-gradient-to-br from-neon-blue to-neon-purple flex items-center justify-center" data-v-5abcebfc><span class="text-xl" data-v-5abcebfc>✦</span></div><div data-v-5abcebfc><h1 class="text-xl font-bold text-white tracking-tight" data-v-5abcebfc>Nexus</h1><p class="text-xs text-text-secondary uppercase tracking-wider" data-v-5abcebfc>LOCAL KNOWLEDGE BASE</p></div></div><div class="flex items-center gap-3" data-v-5abcebfc><button class="p-2 rounded-lg hover:bg-white/5 transition-colors" data-v-5abcebfc><span class="text-text-secondary" data-v-5abcebfc>⚙️</span></button></div></header>', 1)),
          createBaseVNode("div", _hoisted_3, [
            createBaseVNode("div", _hoisted_4, [
              createVNode(unref(draggable), {
                modelValue: sortedGraphList.value,
                "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => sortedGraphList.value = $event),
                "item-key": "id",
                handle: ".drag-handle",
                "ghost-class": "drag-ghost",
                "chosen-class": "drag-chosen",
                animation: "300",
                class: "grid grid-cols-1 md:grid-cols-2 gap-6",
                onEnd: onDragEnd
              }, {
                item: withCtx(({ element: graph }) => [
                  createBaseVNode("div", {
                    onClick: ($event) => openGraph(graph.id),
                    class: "group relative bg-nexus-surface rounded-2xl p-6 border border-white/5 hover:border-neon-blue/50 transition-all duration-300 cursor-pointer overflow-hidden"
                  }, [
                    createBaseVNode("div", {
                      class: "drag-handle absolute top-3 right-3 w-7 h-7 flex items-center justify-center rounded-lg bg-white/5 opacity-0 group-hover:opacity-100 hover:bg-white/10 cursor-grab active:cursor-grabbing transition-all z-10",
                      onClick: _cache[0] || (_cache[0] = withModifiers(() => {
                      }, ["stop"]))
                    }, [..._cache[10] || (_cache[10] = [
                      createBaseVNode("span", { class: "text-text-tertiary text-sm" }, "⠿", -1)
                    ])]),
                    _cache[13] || (_cache[13] = createBaseVNode("div", { class: "absolute top-0 right-0 w-32 h-32 bg-neon-blue/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" }, null, -1)),
                    _cache[14] || (_cache[14] = createBaseVNode("div", { class: "relative h-32 mb-4 rounded-xl bg-black/20 border border-white/5 overflow-hidden" }, [
                      createBaseVNode("div", { class: "absolute inset-0 flex items-center justify-center" }, [
                        createBaseVNode("div", { class: "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-neon-blue/30 border-2 border-neon-blue shadow-neon-blue animate-pulse-glow" }),
                        createBaseVNode("div", { class: "absolute top-4 right-8 w-6 h-6 rounded-full bg-neon-purple/30 border border-neon-purple" }),
                        createBaseVNode("div", { class: "absolute bottom-6 left-10 w-6 h-6 rounded-full bg-neon-cyan/30 border border-neon-cyan" }),
                        createBaseVNode("div", { class: "absolute top-1/2 right-4 w-4 h-4 rounded-full bg-neon-pink/30 border border-neon-pink" })
                      ])
                    ], -1)),
                    createBaseVNode("div", _hoisted_6, [
                      createBaseVNode("div", _hoisted_7, [
                        createBaseVNode("h3", _hoisted_8, toDisplayString(graph.name), 1),
                        graph.defaultView ? (openBlock(), createElementBlock("span", _hoisted_9, toDisplayString(graph.defaultView), 1)) : createCommentVNode("", true)
                      ]),
                      createBaseVNode("div", _hoisted_10, [
                        createBaseVNode("div", _hoisted_11, [
                          _cache[11] || (_cache[11] = createBaseVNode("span", { class: "text-neon-blue" }, "✦", -1)),
                          createBaseVNode("span", _hoisted_12, toDisplayString(graph.nodeCount) + " Nodes", 1)
                        ]),
                        createBaseVNode("div", _hoisted_13, [
                          _cache[12] || (_cache[12] = createBaseVNode("span", { class: "text-text-tertiary" }, "⏱", -1)),
                          createBaseVNode("span", _hoisted_14, toDisplayString(graph.lastUpdate), 1)
                        ])
                      ])
                    ]),
                    _cache[15] || (_cache[15] = createBaseVNode("div", { class: "absolute inset-0 flex items-center justify-center bg-neon-blue/0 group-hover:bg-neon-blue/10 transition-all duration-300 rounded-2xl opacity-0 group-hover:opacity-100 pointer-events-none" }, [
                      createBaseVNode("span", { class: "text-white font-medium transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300" }, "Open Graph")
                    ], -1))
                  ], 8, _hoisted_5)
                ]),
                _: 1
              }, 8, ["modelValue"]),
              createBaseVNode("div", { class: "mt-6 grid grid-cols-1 md:grid-cols-2 gap-6" }, [
                createBaseVNode("div", {
                  onClick: createNewGraph,
                  class: "group relative bg-nexus-surface/30 rounded-2xl p-6 border-2 border-dashed border-white/10 hover:border-neon-blue/50 transition-all duration-300 cursor-pointer flex flex-col items-center justify-center gap-4 min-h-[280px]"
                }, [..._cache[16] || (_cache[16] = [
                  createStaticVNode('<div class="w-16 h-16 rounded-full bg-white/5 group-hover:bg-neon-blue/10 border border-white/10 group-hover:border-neon-blue/30 flex items-center justify-center transition-all duration-300" data-v-5abcebfc><span class="text-3xl text-text-tertiary group-hover:text-neon-blue transition-colors" data-v-5abcebfc>+</span></div><div class="text-center" data-v-5abcebfc><h3 class="text-base font-medium text-white mb-1" data-v-5abcebfc>Create New Universe</h3><p class="text-sm text-text-tertiary" data-v-5abcebfc>Start a fresh knowledge graph</p></div>', 2)
                ])])
              ])
            ])
          ]),
          _cache[18] || (_cache[18] = createStaticVNode('<footer class="flex items-center justify-center gap-12 px-8 py-4 border-t border-white/5" data-v-5abcebfc><button class="flex flex-col items-center gap-1 px-4 py-2 rounded-lg bg-neon-blue/10 border border-neon-blue/30" data-v-5abcebfc><span class="text-xl" data-v-5abcebfc>▦</span><span class="text-xs text-neon-blue font-medium uppercase tracking-wider" data-v-5abcebfc>Universes</span></button><button class="flex flex-col items-center gap-1 px-4 py-2 rounded-lg hover:bg-white/5 transition-colors" data-v-5abcebfc><span class="text-xl text-text-tertiary" data-v-5abcebfc>🔍</span><span class="text-xs text-text-tertiary font-medium uppercase tracking-wider" data-v-5abcebfc>Search</span></button><button class="flex flex-col items-center gap-1 px-4 py-2 rounded-lg hover:bg-white/5 transition-colors" data-v-5abcebfc><span class="text-xl text-text-tertiary" data-v-5abcebfc>⚙️</span><span class="text-xs text-text-tertiary font-medium uppercase tracking-wider" data-v-5abcebfc>Settings</span></button></footer>', 1))
        ]),
        showCreateDialog.value ? (openBlock(), createElementBlock("div", {
          key: 0,
          onClick: withModifiers(closeCreateDialog, ["self"]),
          class: "fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 animate-fade-in"
        }, [
          createBaseVNode("div", _hoisted_15, [
            createBaseVNode("div", { class: "px-6 py-4 border-b border-white/10 flex items-center justify-between" }, [
              _cache[19] || (_cache[19] = createBaseVNode("h2", { class: "text-xl font-bold text-white" }, "Create New Graph", -1)),
              createBaseVNode("button", {
                onClick: closeCreateDialog,
                class: "w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/5 transition-colors text-text-tertiary hover:text-white"
              }, " ✕ ")
            ]),
            createBaseVNode("div", _hoisted_16, [
              createBaseVNode("div", null, [
                _cache[20] || (_cache[20] = createBaseVNode("label", { class: "block text-sm font-medium text-text-secondary mb-2" }, "Graph Name", -1)),
                withDirectives(createBaseVNode("input", {
                  "onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => newGraphData.value.name = $event),
                  type: "text",
                  placeholder: "e.g., Project Notes, Research Hub...",
                  class: "w-full px-4 py-2.5 bg-black/20 border border-white/10 rounded-lg text-white placeholder-text-tertiary focus:outline-none focus:border-neon-blue transition-colors"
                }, null, 512), [
                  [vModelText, newGraphData.value.name]
                ])
              ]),
              createBaseVNode("div", null, [
                _cache[21] || (_cache[21] = createBaseVNode("label", { class: "block text-sm font-medium text-text-secondary mb-2" }, "Description", -1)),
                withDirectives(createBaseVNode("textarea", {
                  "onUpdate:modelValue": _cache[3] || (_cache[3] = ($event) => newGraphData.value.description = $event),
                  placeholder: "Brief description of this graph...",
                  rows: "3",
                  class: "w-full px-4 py-2.5 bg-black/20 border border-white/10 rounded-lg text-white placeholder-text-tertiary focus:outline-none focus:border-neon-blue transition-colors resize-none"
                }, null, 512), [
                  [vModelText, newGraphData.value.description]
                ])
              ]),
              createBaseVNode("div", null, [
                _cache[22] || (_cache[22] = createBaseVNode("label", { class: "block text-sm font-medium text-text-secondary mb-2" }, "Icon", -1)),
                createBaseVNode("div", _hoisted_17, [
                  (openBlock(), createElementBlock(Fragment, null, renderList(iconOptions, (icon) => {
                    return createBaseVNode("button", {
                      key: icon,
                      onClick: ($event) => newGraphData.value.icon = icon,
                      class: normalizeClass(["w-12 h-12 flex items-center justify-center text-2xl rounded-lg border transition-all", newGraphData.value.icon === icon ? "bg-neon-blue/20 border-neon-blue" : "bg-black/20 border-white/10 hover:border-white/20"])
                    }, toDisplayString(icon), 11, _hoisted_18);
                  }), 64))
                ])
              ]),
              createBaseVNode("div", {
                onDrop: withModifiers(handleFileDrop, ["prevent"]),
                onDragover: _cache[6] || (_cache[6] = withModifiers(($event) => isDragging.value = true, ["prevent"])),
                onDragleave: _cache[7] || (_cache[7] = ($event) => isDragging.value = false),
                class: normalizeClass(["border-2 border-dashed rounded-lg p-6 text-center transition-all", isDragging.value ? "border-neon-blue bg-neon-blue/5" : "border-white/20 hover:border-neon-blue/50 hover:bg-black/10"])
              }, [
                createBaseVNode("input", {
                  type: "file",
                  onChange: handleFileSelect,
                  ref_key: "fileInputRef",
                  ref: fileInputRef,
                  class: "hidden",
                  accept: ".xlsx,.xls,.pdf,.docx,.txt,.md"
                }, null, 544),
                !uploadedFile.value ? (openBlock(), createElementBlock("div", {
                  key: 0,
                  onClick: _cache[4] || (_cache[4] = ($event) => _ctx.$refs.fileInputRef.click()),
                  class: "cursor-pointer"
                }, [..._cache[23] || (_cache[23] = [
                  createBaseVNode("div", { class: "text-4xl mb-2" }, "📁", -1),
                  createBaseVNode("p", { class: "text-sm text-text-secondary" }, "Drop file here or click to browse", -1),
                  createBaseVNode("p", { class: "text-xs text-text-tertiary mt-1" }, "Supports: Excel, PDF, Word, Text, Markdown", -1)
                ])])) : (openBlock(), createElementBlock("div", _hoisted_19, [
                  createBaseVNode("div", _hoisted_20, [
                    _cache[24] || (_cache[24] = createBaseVNode("span", { class: "text-2xl" }, "📄", -1)),
                    createBaseVNode("span", _hoisted_21, toDisplayString(uploadedFile.value.name), 1)
                  ]),
                  createBaseVNode("button", {
                    onClick: _cache[5] || (_cache[5] = ($event) => uploadedFile.value = null),
                    class: "text-danger hover:text-red-400"
                  }, "✕")
                ]))
              ], 34),
              createBaseVNode("div", _hoisted_22, [
                withDirectives(createBaseVNode("input", {
                  "onUpdate:modelValue": _cache[8] || (_cache[8] = ($event) => useRAGFlow.value = $event),
                  type: "checkbox",
                  id: "ragflow-upload",
                  class: "w-4 h-4 rounded border-white/20"
                }, null, 512), [
                  [vModelCheckbox, useRAGFlow.value]
                ]),
                _cache[25] || (_cache[25] = createBaseVNode("label", {
                  for: "ragflow-upload",
                  class: "text-sm text-text-secondary"
                }, "Upload to RAGFlow dataset", -1))
              ]),
              useRAGFlow.value ? (openBlock(), createElementBlock("div", _hoisted_23, [
                withDirectives(createBaseVNode("select", {
                  "onUpdate:modelValue": _cache[9] || (_cache[9] = ($event) => selectedDataset.value = $event),
                  class: "w-full px-4 py-2.5 bg-black/20 border border-white/10 rounded-lg text-white focus:outline-none focus:border-neon-blue transition-colors"
                }, [
                  _cache[26] || (_cache[26] = createBaseVNode("option", {
                    value: "",
                    disabled: ""
                  }, "Choose a dataset...", -1)),
                  (openBlock(true), createElementBlock(Fragment, null, renderList(ragflowDatasets.value, (dataset) => {
                    return openBlock(), createElementBlock("option", {
                      key: dataset.id,
                      value: dataset.id
                    }, toDisplayString(dataset.name), 9, _hoisted_24);
                  }), 128))
                ], 512), [
                  [vModelSelect, selectedDataset.value]
                ])
              ])) : createCommentVNode("", true)
            ]),
            createBaseVNode("div", _hoisted_25, [
              createBaseVNode("button", {
                onClick: closeCreateDialog,
                class: "px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-text-secondary hover:text-white transition-all"
              }, " Cancel "),
              createBaseVNode("button", {
                onClick: handleCreateGraph,
                disabled: !newGraphData.value.name || isCreating.value,
                class: "px-6 py-2 rounded-lg bg-neon-blue hover:bg-neon-blue/80 text-white font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-neon-blue"
              }, toDisplayString(isCreating.value ? "Creating..." : "Create Graph"), 9, _hoisted_26)
            ])
          ])
        ])) : createCommentVNode("", true)
      ]);
    };
  }
};
const NexusPage = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-5abcebfc"]]);
export {
  NexusPage as default
};
