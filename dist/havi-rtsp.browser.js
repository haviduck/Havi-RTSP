var HaviRtsp = (() => {
  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __typeError = (msg) => {
    throw TypeError(msg);
  };
  var __esm = (fn, res) => function __init() {
    return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
  };
  var __commonJS = (cb, mod) => function __require() {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  };
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc2) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc2 = __getOwnPropDesc(from, key)) || desc2.enumerable });
    }
    return to;
  };
  var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
    // If the importer is in node compatibility mode or this is not an ESM
    // file that has been converted to a CommonJS file using a Babel-
    // compatible transform (i.e. "__esModule" has not been set), then set
    // "default" to the CommonJS "module.exports" for node compatibility.
    isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
    mod
  ));
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
  var __accessCheck = (obj, member, msg) => member.has(obj) || __typeError("Cannot " + msg);
  var __privateAdd = (obj, member, value) => member.has(obj) ? __typeError("Cannot add the same private member more than once") : member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
  var __privateMethod = (obj, member, method) => (__accessCheck(obj, member, "access private method"), method);

  // node_modules/base64-js/index.js
  var require_base64_js = __commonJS({
    "node_modules/base64-js/index.js"(exports) {
      "use strict";
      init_buffer_shim();
      exports.byteLength = byteLength;
      exports.toByteArray = toByteArray;
      exports.fromByteArray = fromByteArray;
      var lookup = [];
      var revLookup = [];
      var Arr = typeof Uint8Array !== "undefined" ? Uint8Array : Array;
      var code = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
      for (i = 0, len = code.length; i < len; ++i) {
        lookup[i] = code[i];
        revLookup[code.charCodeAt(i)] = i;
      }
      var i;
      var len;
      revLookup["-".charCodeAt(0)] = 62;
      revLookup["_".charCodeAt(0)] = 63;
      function getLens(b64) {
        var len2 = b64.length;
        if (len2 % 4 > 0) {
          throw new Error("Invalid string. Length must be a multiple of 4");
        }
        var validLen = b64.indexOf("=");
        if (validLen === -1) validLen = len2;
        var placeHoldersLen = validLen === len2 ? 0 : 4 - validLen % 4;
        return [validLen, placeHoldersLen];
      }
      function byteLength(b64) {
        var lens = getLens(b64);
        var validLen = lens[0];
        var placeHoldersLen = lens[1];
        return (validLen + placeHoldersLen) * 3 / 4 - placeHoldersLen;
      }
      function _byteLength(b64, validLen, placeHoldersLen) {
        return (validLen + placeHoldersLen) * 3 / 4 - placeHoldersLen;
      }
      function toByteArray(b64) {
        var tmp;
        var lens = getLens(b64);
        var validLen = lens[0];
        var placeHoldersLen = lens[1];
        var arr = new Arr(_byteLength(b64, validLen, placeHoldersLen));
        var curByte = 0;
        var len2 = placeHoldersLen > 0 ? validLen - 4 : validLen;
        var i2;
        for (i2 = 0; i2 < len2; i2 += 4) {
          tmp = revLookup[b64.charCodeAt(i2)] << 18 | revLookup[b64.charCodeAt(i2 + 1)] << 12 | revLookup[b64.charCodeAt(i2 + 2)] << 6 | revLookup[b64.charCodeAt(i2 + 3)];
          arr[curByte++] = tmp >> 16 & 255;
          arr[curByte++] = tmp >> 8 & 255;
          arr[curByte++] = tmp & 255;
        }
        if (placeHoldersLen === 2) {
          tmp = revLookup[b64.charCodeAt(i2)] << 2 | revLookup[b64.charCodeAt(i2 + 1)] >> 4;
          arr[curByte++] = tmp & 255;
        }
        if (placeHoldersLen === 1) {
          tmp = revLookup[b64.charCodeAt(i2)] << 10 | revLookup[b64.charCodeAt(i2 + 1)] << 4 | revLookup[b64.charCodeAt(i2 + 2)] >> 2;
          arr[curByte++] = tmp >> 8 & 255;
          arr[curByte++] = tmp & 255;
        }
        return arr;
      }
      function tripletToBase64(num) {
        return lookup[num >> 18 & 63] + lookup[num >> 12 & 63] + lookup[num >> 6 & 63] + lookup[num & 63];
      }
      function encodeChunk(uint8, start, end) {
        var tmp;
        var output = [];
        for (var i2 = start; i2 < end; i2 += 3) {
          tmp = (uint8[i2] << 16 & 16711680) + (uint8[i2 + 1] << 8 & 65280) + (uint8[i2 + 2] & 255);
          output.push(tripletToBase64(tmp));
        }
        return output.join("");
      }
      function fromByteArray(uint8) {
        var tmp;
        var len2 = uint8.length;
        var extraBytes = len2 % 3;
        var parts = [];
        var maxChunkLength = 16383;
        for (var i2 = 0, len22 = len2 - extraBytes; i2 < len22; i2 += maxChunkLength) {
          parts.push(encodeChunk(uint8, i2, i2 + maxChunkLength > len22 ? len22 : i2 + maxChunkLength));
        }
        if (extraBytes === 1) {
          tmp = uint8[len2 - 1];
          parts.push(
            lookup[tmp >> 2] + lookup[tmp << 4 & 63] + "=="
          );
        } else if (extraBytes === 2) {
          tmp = (uint8[len2 - 2] << 8) + uint8[len2 - 1];
          parts.push(
            lookup[tmp >> 10] + lookup[tmp >> 4 & 63] + lookup[tmp << 2 & 63] + "="
          );
        }
        return parts.join("");
      }
    }
  });

  // node_modules/ieee754/index.js
  var require_ieee754 = __commonJS({
    "node_modules/ieee754/index.js"(exports) {
      init_buffer_shim();
      exports.read = function(buffer, offset, isLE, mLen, nBytes) {
        var e, m;
        var eLen = nBytes * 8 - mLen - 1;
        var eMax = (1 << eLen) - 1;
        var eBias = eMax >> 1;
        var nBits = -7;
        var i = isLE ? nBytes - 1 : 0;
        var d = isLE ? -1 : 1;
        var s = buffer[offset + i];
        i += d;
        e = s & (1 << -nBits) - 1;
        s >>= -nBits;
        nBits += eLen;
        for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8) {
        }
        m = e & (1 << -nBits) - 1;
        e >>= -nBits;
        nBits += mLen;
        for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8) {
        }
        if (e === 0) {
          e = 1 - eBias;
        } else if (e === eMax) {
          return m ? NaN : (s ? -1 : 1) * Infinity;
        } else {
          m = m + Math.pow(2, mLen);
          e = e - eBias;
        }
        return (s ? -1 : 1) * m * Math.pow(2, e - mLen);
      };
      exports.write = function(buffer, value, offset, isLE, mLen, nBytes) {
        var e, m, c;
        var eLen = nBytes * 8 - mLen - 1;
        var eMax = (1 << eLen) - 1;
        var eBias = eMax >> 1;
        var rt = mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0;
        var i = isLE ? 0 : nBytes - 1;
        var d = isLE ? 1 : -1;
        var s = value < 0 || value === 0 && 1 / value < 0 ? 1 : 0;
        value = Math.abs(value);
        if (isNaN(value) || value === Infinity) {
          m = isNaN(value) ? 1 : 0;
          e = eMax;
        } else {
          e = Math.floor(Math.log(value) / Math.LN2);
          if (value * (c = Math.pow(2, -e)) < 1) {
            e--;
            c *= 2;
          }
          if (e + eBias >= 1) {
            value += rt / c;
          } else {
            value += rt * Math.pow(2, 1 - eBias);
          }
          if (value * c >= 2) {
            e++;
            c /= 2;
          }
          if (e + eBias >= eMax) {
            m = 0;
            e = eMax;
          } else if (e + eBias >= 1) {
            m = (value * c - 1) * Math.pow(2, mLen);
            e = e + eBias;
          } else {
            m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen);
            e = 0;
          }
        }
        for (; mLen >= 8; buffer[offset + i] = m & 255, i += d, m /= 256, mLen -= 8) {
        }
        e = e << mLen | m;
        eLen += mLen;
        for (; eLen > 0; buffer[offset + i] = e & 255, i += d, e /= 256, eLen -= 8) {
        }
        buffer[offset + i - d] |= s * 128;
      };
    }
  });

  // node_modules/buffer/index.js
  var require_buffer = __commonJS({
    "node_modules/buffer/index.js"(exports) {
      "use strict";
      init_buffer_shim();
      var base64 = require_base64_js();
      var ieee754 = require_ieee754();
      var customInspectSymbol = typeof Symbol === "function" && typeof Symbol["for"] === "function" ? Symbol["for"]("nodejs.util.inspect.custom") : null;
      exports.Buffer = Buffer3;
      exports.SlowBuffer = SlowBuffer;
      exports.INSPECT_MAX_BYTES = 50;
      var K_MAX_LENGTH = 2147483647;
      exports.kMaxLength = K_MAX_LENGTH;
      Buffer3.TYPED_ARRAY_SUPPORT = typedArraySupport();
      if (!Buffer3.TYPED_ARRAY_SUPPORT && typeof console !== "undefined" && typeof console.error === "function") {
        console.error(
          "This browser lacks typed array (Uint8Array) support which is required by `buffer` v5.x. Use `buffer` v4.x if you require old browser support."
        );
      }
      function typedArraySupport() {
        try {
          const arr = new Uint8Array(1);
          const proto = { foo: function() {
            return 42;
          } };
          Object.setPrototypeOf(proto, Uint8Array.prototype);
          Object.setPrototypeOf(arr, proto);
          return arr.foo() === 42;
        } catch (e) {
          return false;
        }
      }
      Object.defineProperty(Buffer3.prototype, "parent", {
        enumerable: true,
        get: function() {
          if (!Buffer3.isBuffer(this)) return void 0;
          return this.buffer;
        }
      });
      Object.defineProperty(Buffer3.prototype, "offset", {
        enumerable: true,
        get: function() {
          if (!Buffer3.isBuffer(this)) return void 0;
          return this.byteOffset;
        }
      });
      function createBuffer(length) {
        if (length > K_MAX_LENGTH) {
          throw new RangeError('The value "' + length + '" is invalid for option "size"');
        }
        const buf = new Uint8Array(length);
        Object.setPrototypeOf(buf, Buffer3.prototype);
        return buf;
      }
      function Buffer3(arg, encodingOrOffset, length) {
        if (typeof arg === "number") {
          if (typeof encodingOrOffset === "string") {
            throw new TypeError(
              'The "string" argument must be of type string. Received type number'
            );
          }
          return allocUnsafe(arg);
        }
        return from(arg, encodingOrOffset, length);
      }
      Buffer3.poolSize = 8192;
      function from(value, encodingOrOffset, length) {
        if (typeof value === "string") {
          return fromString(value, encodingOrOffset);
        }
        if (ArrayBuffer.isView(value)) {
          return fromArrayView(value);
        }
        if (value == null) {
          throw new TypeError(
            "The first argument must be one of type string, Buffer, ArrayBuffer, Array, or Array-like Object. Received type " + typeof value
          );
        }
        if (isInstance(value, ArrayBuffer) || value && isInstance(value.buffer, ArrayBuffer)) {
          return fromArrayBuffer(value, encodingOrOffset, length);
        }
        if (typeof SharedArrayBuffer !== "undefined" && (isInstance(value, SharedArrayBuffer) || value && isInstance(value.buffer, SharedArrayBuffer))) {
          return fromArrayBuffer(value, encodingOrOffset, length);
        }
        if (typeof value === "number") {
          throw new TypeError(
            'The "value" argument must not be of type number. Received type number'
          );
        }
        const valueOf = value.valueOf && value.valueOf();
        if (valueOf != null && valueOf !== value) {
          return Buffer3.from(valueOf, encodingOrOffset, length);
        }
        const b = fromObject(value);
        if (b) return b;
        if (typeof Symbol !== "undefined" && Symbol.toPrimitive != null && typeof value[Symbol.toPrimitive] === "function") {
          return Buffer3.from(value[Symbol.toPrimitive]("string"), encodingOrOffset, length);
        }
        throw new TypeError(
          "The first argument must be one of type string, Buffer, ArrayBuffer, Array, or Array-like Object. Received type " + typeof value
        );
      }
      Buffer3.from = function(value, encodingOrOffset, length) {
        return from(value, encodingOrOffset, length);
      };
      Object.setPrototypeOf(Buffer3.prototype, Uint8Array.prototype);
      Object.setPrototypeOf(Buffer3, Uint8Array);
      function assertSize(size) {
        if (typeof size !== "number") {
          throw new TypeError('"size" argument must be of type number');
        } else if (size < 0) {
          throw new RangeError('The value "' + size + '" is invalid for option "size"');
        }
      }
      function alloc(size, fill, encoding) {
        assertSize(size);
        if (size <= 0) {
          return createBuffer(size);
        }
        if (fill !== void 0) {
          return typeof encoding === "string" ? createBuffer(size).fill(fill, encoding) : createBuffer(size).fill(fill);
        }
        return createBuffer(size);
      }
      Buffer3.alloc = function(size, fill, encoding) {
        return alloc(size, fill, encoding);
      };
      function allocUnsafe(size) {
        assertSize(size);
        return createBuffer(size < 0 ? 0 : checked(size) | 0);
      }
      Buffer3.allocUnsafe = function(size) {
        return allocUnsafe(size);
      };
      Buffer3.allocUnsafeSlow = function(size) {
        return allocUnsafe(size);
      };
      function fromString(string, encoding) {
        if (typeof encoding !== "string" || encoding === "") {
          encoding = "utf8";
        }
        if (!Buffer3.isEncoding(encoding)) {
          throw new TypeError("Unknown encoding: " + encoding);
        }
        const length = byteLength(string, encoding) | 0;
        let buf = createBuffer(length);
        const actual = buf.write(string, encoding);
        if (actual !== length) {
          buf = buf.slice(0, actual);
        }
        return buf;
      }
      function fromArrayLike(array) {
        const length = array.length < 0 ? 0 : checked(array.length) | 0;
        const buf = createBuffer(length);
        for (let i = 0; i < length; i += 1) {
          buf[i] = array[i] & 255;
        }
        return buf;
      }
      function fromArrayView(arrayView) {
        if (isInstance(arrayView, Uint8Array)) {
          const copy = new Uint8Array(arrayView);
          return fromArrayBuffer(copy.buffer, copy.byteOffset, copy.byteLength);
        }
        return fromArrayLike(arrayView);
      }
      function fromArrayBuffer(array, byteOffset, length) {
        if (byteOffset < 0 || array.byteLength < byteOffset) {
          throw new RangeError('"offset" is outside of buffer bounds');
        }
        if (array.byteLength < byteOffset + (length || 0)) {
          throw new RangeError('"length" is outside of buffer bounds');
        }
        let buf;
        if (byteOffset === void 0 && length === void 0) {
          buf = new Uint8Array(array);
        } else if (length === void 0) {
          buf = new Uint8Array(array, byteOffset);
        } else {
          buf = new Uint8Array(array, byteOffset, length);
        }
        Object.setPrototypeOf(buf, Buffer3.prototype);
        return buf;
      }
      function fromObject(obj) {
        if (Buffer3.isBuffer(obj)) {
          const len = checked(obj.length) | 0;
          const buf = createBuffer(len);
          if (buf.length === 0) {
            return buf;
          }
          obj.copy(buf, 0, 0, len);
          return buf;
        }
        if (obj.length !== void 0) {
          if (typeof obj.length !== "number" || numberIsNaN(obj.length)) {
            return createBuffer(0);
          }
          return fromArrayLike(obj);
        }
        if (obj.type === "Buffer" && Array.isArray(obj.data)) {
          return fromArrayLike(obj.data);
        }
      }
      function checked(length) {
        if (length >= K_MAX_LENGTH) {
          throw new RangeError("Attempt to allocate Buffer larger than maximum size: 0x" + K_MAX_LENGTH.toString(16) + " bytes");
        }
        return length | 0;
      }
      function SlowBuffer(length) {
        if (+length != length) {
          length = 0;
        }
        return Buffer3.alloc(+length);
      }
      Buffer3.isBuffer = function isBuffer(b) {
        return b != null && b._isBuffer === true && b !== Buffer3.prototype;
      };
      Buffer3.compare = function compare(a, b) {
        if (isInstance(a, Uint8Array)) a = Buffer3.from(a, a.offset, a.byteLength);
        if (isInstance(b, Uint8Array)) b = Buffer3.from(b, b.offset, b.byteLength);
        if (!Buffer3.isBuffer(a) || !Buffer3.isBuffer(b)) {
          throw new TypeError(
            'The "buf1", "buf2" arguments must be one of type Buffer or Uint8Array'
          );
        }
        if (a === b) return 0;
        let x = a.length;
        let y = b.length;
        for (let i = 0, len = Math.min(x, y); i < len; ++i) {
          if (a[i] !== b[i]) {
            x = a[i];
            y = b[i];
            break;
          }
        }
        if (x < y) return -1;
        if (y < x) return 1;
        return 0;
      };
      Buffer3.isEncoding = function isEncoding(encoding) {
        switch (String(encoding).toLowerCase()) {
          case "hex":
          case "utf8":
          case "utf-8":
          case "ascii":
          case "latin1":
          case "binary":
          case "base64":
          case "ucs2":
          case "ucs-2":
          case "utf16le":
          case "utf-16le":
            return true;
          default:
            return false;
        }
      };
      Buffer3.concat = function concat(list, length) {
        if (!Array.isArray(list)) {
          throw new TypeError('"list" argument must be an Array of Buffers');
        }
        if (list.length === 0) {
          return Buffer3.alloc(0);
        }
        let i;
        if (length === void 0) {
          length = 0;
          for (i = 0; i < list.length; ++i) {
            length += list[i].length;
          }
        }
        const buffer = Buffer3.allocUnsafe(length);
        let pos = 0;
        for (i = 0; i < list.length; ++i) {
          let buf = list[i];
          if (isInstance(buf, Uint8Array)) {
            if (pos + buf.length > buffer.length) {
              if (!Buffer3.isBuffer(buf)) buf = Buffer3.from(buf);
              buf.copy(buffer, pos);
            } else {
              Uint8Array.prototype.set.call(
                buffer,
                buf,
                pos
              );
            }
          } else if (!Buffer3.isBuffer(buf)) {
            throw new TypeError('"list" argument must be an Array of Buffers');
          } else {
            buf.copy(buffer, pos);
          }
          pos += buf.length;
        }
        return buffer;
      };
      function byteLength(string, encoding) {
        if (Buffer3.isBuffer(string)) {
          return string.length;
        }
        if (ArrayBuffer.isView(string) || isInstance(string, ArrayBuffer)) {
          return string.byteLength;
        }
        if (typeof string !== "string") {
          throw new TypeError(
            'The "string" argument must be one of type string, Buffer, or ArrayBuffer. Received type ' + typeof string
          );
        }
        const len = string.length;
        const mustMatch = arguments.length > 2 && arguments[2] === true;
        if (!mustMatch && len === 0) return 0;
        let loweredCase = false;
        for (; ; ) {
          switch (encoding) {
            case "ascii":
            case "latin1":
            case "binary":
              return len;
            case "utf8":
            case "utf-8":
              return utf8ToBytes(string).length;
            case "ucs2":
            case "ucs-2":
            case "utf16le":
            case "utf-16le":
              return len * 2;
            case "hex":
              return len >>> 1;
            case "base64":
              return base64ToBytes(string).length;
            default:
              if (loweredCase) {
                return mustMatch ? -1 : utf8ToBytes(string).length;
              }
              encoding = ("" + encoding).toLowerCase();
              loweredCase = true;
          }
        }
      }
      Buffer3.byteLength = byteLength;
      function slowToString(encoding, start, end) {
        let loweredCase = false;
        if (start === void 0 || start < 0) {
          start = 0;
        }
        if (start > this.length) {
          return "";
        }
        if (end === void 0 || end > this.length) {
          end = this.length;
        }
        if (end <= 0) {
          return "";
        }
        end >>>= 0;
        start >>>= 0;
        if (end <= start) {
          return "";
        }
        if (!encoding) encoding = "utf8";
        while (true) {
          switch (encoding) {
            case "hex":
              return hexSlice(this, start, end);
            case "utf8":
            case "utf-8":
              return utf8Slice(this, start, end);
            case "ascii":
              return asciiSlice(this, start, end);
            case "latin1":
            case "binary":
              return latin1Slice(this, start, end);
            case "base64":
              return base64Slice(this, start, end);
            case "ucs2":
            case "ucs-2":
            case "utf16le":
            case "utf-16le":
              return utf16leSlice(this, start, end);
            default:
              if (loweredCase) throw new TypeError("Unknown encoding: " + encoding);
              encoding = (encoding + "").toLowerCase();
              loweredCase = true;
          }
        }
      }
      Buffer3.prototype._isBuffer = true;
      function swap(b, n, m) {
        const i = b[n];
        b[n] = b[m];
        b[m] = i;
      }
      Buffer3.prototype.swap16 = function swap16() {
        const len = this.length;
        if (len % 2 !== 0) {
          throw new RangeError("Buffer size must be a multiple of 16-bits");
        }
        for (let i = 0; i < len; i += 2) {
          swap(this, i, i + 1);
        }
        return this;
      };
      Buffer3.prototype.swap32 = function swap32() {
        const len = this.length;
        if (len % 4 !== 0) {
          throw new RangeError("Buffer size must be a multiple of 32-bits");
        }
        for (let i = 0; i < len; i += 4) {
          swap(this, i, i + 3);
          swap(this, i + 1, i + 2);
        }
        return this;
      };
      Buffer3.prototype.swap64 = function swap64() {
        const len = this.length;
        if (len % 8 !== 0) {
          throw new RangeError("Buffer size must be a multiple of 64-bits");
        }
        for (let i = 0; i < len; i += 8) {
          swap(this, i, i + 7);
          swap(this, i + 1, i + 6);
          swap(this, i + 2, i + 5);
          swap(this, i + 3, i + 4);
        }
        return this;
      };
      Buffer3.prototype.toString = function toString() {
        const length = this.length;
        if (length === 0) return "";
        if (arguments.length === 0) return utf8Slice(this, 0, length);
        return slowToString.apply(this, arguments);
      };
      Buffer3.prototype.toLocaleString = Buffer3.prototype.toString;
      Buffer3.prototype.equals = function equals(b) {
        if (!Buffer3.isBuffer(b)) throw new TypeError("Argument must be a Buffer");
        if (this === b) return true;
        return Buffer3.compare(this, b) === 0;
      };
      Buffer3.prototype.inspect = function inspect() {
        let str3 = "";
        const max = exports.INSPECT_MAX_BYTES;
        str3 = this.toString("hex", 0, max).replace(/(.{2})/g, "$1 ").trim();
        if (this.length > max) str3 += " ... ";
        return "<Buffer " + str3 + ">";
      };
      if (customInspectSymbol) {
        Buffer3.prototype[customInspectSymbol] = Buffer3.prototype.inspect;
      }
      Buffer3.prototype.compare = function compare(target, start, end, thisStart, thisEnd) {
        if (isInstance(target, Uint8Array)) {
          target = Buffer3.from(target, target.offset, target.byteLength);
        }
        if (!Buffer3.isBuffer(target)) {
          throw new TypeError(
            'The "target" argument must be one of type Buffer or Uint8Array. Received type ' + typeof target
          );
        }
        if (start === void 0) {
          start = 0;
        }
        if (end === void 0) {
          end = target ? target.length : 0;
        }
        if (thisStart === void 0) {
          thisStart = 0;
        }
        if (thisEnd === void 0) {
          thisEnd = this.length;
        }
        if (start < 0 || end > target.length || thisStart < 0 || thisEnd > this.length) {
          throw new RangeError("out of range index");
        }
        if (thisStart >= thisEnd && start >= end) {
          return 0;
        }
        if (thisStart >= thisEnd) {
          return -1;
        }
        if (start >= end) {
          return 1;
        }
        start >>>= 0;
        end >>>= 0;
        thisStart >>>= 0;
        thisEnd >>>= 0;
        if (this === target) return 0;
        let x = thisEnd - thisStart;
        let y = end - start;
        const len = Math.min(x, y);
        const thisCopy = this.slice(thisStart, thisEnd);
        const targetCopy = target.slice(start, end);
        for (let i = 0; i < len; ++i) {
          if (thisCopy[i] !== targetCopy[i]) {
            x = thisCopy[i];
            y = targetCopy[i];
            break;
          }
        }
        if (x < y) return -1;
        if (y < x) return 1;
        return 0;
      };
      function bidirectionalIndexOf(buffer, val, byteOffset, encoding, dir) {
        if (buffer.length === 0) return -1;
        if (typeof byteOffset === "string") {
          encoding = byteOffset;
          byteOffset = 0;
        } else if (byteOffset > 2147483647) {
          byteOffset = 2147483647;
        } else if (byteOffset < -2147483648) {
          byteOffset = -2147483648;
        }
        byteOffset = +byteOffset;
        if (numberIsNaN(byteOffset)) {
          byteOffset = dir ? 0 : buffer.length - 1;
        }
        if (byteOffset < 0) byteOffset = buffer.length + byteOffset;
        if (byteOffset >= buffer.length) {
          if (dir) return -1;
          else byteOffset = buffer.length - 1;
        } else if (byteOffset < 0) {
          if (dir) byteOffset = 0;
          else return -1;
        }
        if (typeof val === "string") {
          val = Buffer3.from(val, encoding);
        }
        if (Buffer3.isBuffer(val)) {
          if (val.length === 0) {
            return -1;
          }
          return arrayIndexOf(buffer, val, byteOffset, encoding, dir);
        } else if (typeof val === "number") {
          val = val & 255;
          if (typeof Uint8Array.prototype.indexOf === "function") {
            if (dir) {
              return Uint8Array.prototype.indexOf.call(buffer, val, byteOffset);
            } else {
              return Uint8Array.prototype.lastIndexOf.call(buffer, val, byteOffset);
            }
          }
          return arrayIndexOf(buffer, [val], byteOffset, encoding, dir);
        }
        throw new TypeError("val must be string, number or Buffer");
      }
      function arrayIndexOf(arr, val, byteOffset, encoding, dir) {
        let indexSize = 1;
        let arrLength = arr.length;
        let valLength = val.length;
        if (encoding !== void 0) {
          encoding = String(encoding).toLowerCase();
          if (encoding === "ucs2" || encoding === "ucs-2" || encoding === "utf16le" || encoding === "utf-16le") {
            if (arr.length < 2 || val.length < 2) {
              return -1;
            }
            indexSize = 2;
            arrLength /= 2;
            valLength /= 2;
            byteOffset /= 2;
          }
        }
        function read(buf, i2) {
          if (indexSize === 1) {
            return buf[i2];
          } else {
            return buf.readUInt16BE(i2 * indexSize);
          }
        }
        let i;
        if (dir) {
          let foundIndex = -1;
          for (i = byteOffset; i < arrLength; i++) {
            if (read(arr, i) === read(val, foundIndex === -1 ? 0 : i - foundIndex)) {
              if (foundIndex === -1) foundIndex = i;
              if (i - foundIndex + 1 === valLength) return foundIndex * indexSize;
            } else {
              if (foundIndex !== -1) i -= i - foundIndex;
              foundIndex = -1;
            }
          }
        } else {
          if (byteOffset + valLength > arrLength) byteOffset = arrLength - valLength;
          for (i = byteOffset; i >= 0; i--) {
            let found = true;
            for (let j = 0; j < valLength; j++) {
              if (read(arr, i + j) !== read(val, j)) {
                found = false;
                break;
              }
            }
            if (found) return i;
          }
        }
        return -1;
      }
      Buffer3.prototype.includes = function includes(val, byteOffset, encoding) {
        return this.indexOf(val, byteOffset, encoding) !== -1;
      };
      Buffer3.prototype.indexOf = function indexOf(val, byteOffset, encoding) {
        return bidirectionalIndexOf(this, val, byteOffset, encoding, true);
      };
      Buffer3.prototype.lastIndexOf = function lastIndexOf(val, byteOffset, encoding) {
        return bidirectionalIndexOf(this, val, byteOffset, encoding, false);
      };
      function hexWrite(buf, string, offset, length) {
        offset = Number(offset) || 0;
        const remaining = buf.length - offset;
        if (!length) {
          length = remaining;
        } else {
          length = Number(length);
          if (length > remaining) {
            length = remaining;
          }
        }
        const strLen = string.length;
        if (length > strLen / 2) {
          length = strLen / 2;
        }
        let i;
        for (i = 0; i < length; ++i) {
          const parsed = parseInt(string.substr(i * 2, 2), 16);
          if (numberIsNaN(parsed)) return i;
          buf[offset + i] = parsed;
        }
        return i;
      }
      function utf8Write(buf, string, offset, length) {
        return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length);
      }
      function asciiWrite(buf, string, offset, length) {
        return blitBuffer(asciiToBytes(string), buf, offset, length);
      }
      function base64Write(buf, string, offset, length) {
        return blitBuffer(base64ToBytes(string), buf, offset, length);
      }
      function ucs2Write(buf, string, offset, length) {
        return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length);
      }
      Buffer3.prototype.write = function write(string, offset, length, encoding) {
        if (offset === void 0) {
          encoding = "utf8";
          length = this.length;
          offset = 0;
        } else if (length === void 0 && typeof offset === "string") {
          encoding = offset;
          length = this.length;
          offset = 0;
        } else if (isFinite(offset)) {
          offset = offset >>> 0;
          if (isFinite(length)) {
            length = length >>> 0;
            if (encoding === void 0) encoding = "utf8";
          } else {
            encoding = length;
            length = void 0;
          }
        } else {
          throw new Error(
            "Buffer.write(string, encoding, offset[, length]) is no longer supported"
          );
        }
        const remaining = this.length - offset;
        if (length === void 0 || length > remaining) length = remaining;
        if (string.length > 0 && (length < 0 || offset < 0) || offset > this.length) {
          throw new RangeError("Attempt to write outside buffer bounds");
        }
        if (!encoding) encoding = "utf8";
        let loweredCase = false;
        for (; ; ) {
          switch (encoding) {
            case "hex":
              return hexWrite(this, string, offset, length);
            case "utf8":
            case "utf-8":
              return utf8Write(this, string, offset, length);
            case "ascii":
            case "latin1":
            case "binary":
              return asciiWrite(this, string, offset, length);
            case "base64":
              return base64Write(this, string, offset, length);
            case "ucs2":
            case "ucs-2":
            case "utf16le":
            case "utf-16le":
              return ucs2Write(this, string, offset, length);
            default:
              if (loweredCase) throw new TypeError("Unknown encoding: " + encoding);
              encoding = ("" + encoding).toLowerCase();
              loweredCase = true;
          }
        }
      };
      Buffer3.prototype.toJSON = function toJSON() {
        return {
          type: "Buffer",
          data: Array.prototype.slice.call(this._arr || this, 0)
        };
      };
      function base64Slice(buf, start, end) {
        if (start === 0 && end === buf.length) {
          return base64.fromByteArray(buf);
        } else {
          return base64.fromByteArray(buf.slice(start, end));
        }
      }
      function utf8Slice(buf, start, end) {
        end = Math.min(buf.length, end);
        const res = [];
        let i = start;
        while (i < end) {
          const firstByte = buf[i];
          let codePoint = null;
          let bytesPerSequence = firstByte > 239 ? 4 : firstByte > 223 ? 3 : firstByte > 191 ? 2 : 1;
          if (i + bytesPerSequence <= end) {
            let secondByte, thirdByte, fourthByte, tempCodePoint;
            switch (bytesPerSequence) {
              case 1:
                if (firstByte < 128) {
                  codePoint = firstByte;
                }
                break;
              case 2:
                secondByte = buf[i + 1];
                if ((secondByte & 192) === 128) {
                  tempCodePoint = (firstByte & 31) << 6 | secondByte & 63;
                  if (tempCodePoint > 127) {
                    codePoint = tempCodePoint;
                  }
                }
                break;
              case 3:
                secondByte = buf[i + 1];
                thirdByte = buf[i + 2];
                if ((secondByte & 192) === 128 && (thirdByte & 192) === 128) {
                  tempCodePoint = (firstByte & 15) << 12 | (secondByte & 63) << 6 | thirdByte & 63;
                  if (tempCodePoint > 2047 && (tempCodePoint < 55296 || tempCodePoint > 57343)) {
                    codePoint = tempCodePoint;
                  }
                }
                break;
              case 4:
                secondByte = buf[i + 1];
                thirdByte = buf[i + 2];
                fourthByte = buf[i + 3];
                if ((secondByte & 192) === 128 && (thirdByte & 192) === 128 && (fourthByte & 192) === 128) {
                  tempCodePoint = (firstByte & 15) << 18 | (secondByte & 63) << 12 | (thirdByte & 63) << 6 | fourthByte & 63;
                  if (tempCodePoint > 65535 && tempCodePoint < 1114112) {
                    codePoint = tempCodePoint;
                  }
                }
            }
          }
          if (codePoint === null) {
            codePoint = 65533;
            bytesPerSequence = 1;
          } else if (codePoint > 65535) {
            codePoint -= 65536;
            res.push(codePoint >>> 10 & 1023 | 55296);
            codePoint = 56320 | codePoint & 1023;
          }
          res.push(codePoint);
          i += bytesPerSequence;
        }
        return decodeCodePointsArray(res);
      }
      var MAX_ARGUMENTS_LENGTH = 4096;
      function decodeCodePointsArray(codePoints) {
        const len = codePoints.length;
        if (len <= MAX_ARGUMENTS_LENGTH) {
          return String.fromCharCode.apply(String, codePoints);
        }
        let res = "";
        let i = 0;
        while (i < len) {
          res += String.fromCharCode.apply(
            String,
            codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH)
          );
        }
        return res;
      }
      function asciiSlice(buf, start, end) {
        let ret = "";
        end = Math.min(buf.length, end);
        for (let i = start; i < end; ++i) {
          ret += String.fromCharCode(buf[i] & 127);
        }
        return ret;
      }
      function latin1Slice(buf, start, end) {
        let ret = "";
        end = Math.min(buf.length, end);
        for (let i = start; i < end; ++i) {
          ret += String.fromCharCode(buf[i]);
        }
        return ret;
      }
      function hexSlice(buf, start, end) {
        const len = buf.length;
        if (!start || start < 0) start = 0;
        if (!end || end < 0 || end > len) end = len;
        let out = "";
        for (let i = start; i < end; ++i) {
          out += hexSliceLookupTable[buf[i]];
        }
        return out;
      }
      function utf16leSlice(buf, start, end) {
        const bytes = buf.slice(start, end);
        let res = "";
        for (let i = 0; i < bytes.length - 1; i += 2) {
          res += String.fromCharCode(bytes[i] + bytes[i + 1] * 256);
        }
        return res;
      }
      Buffer3.prototype.slice = function slice(start, end) {
        const len = this.length;
        start = ~~start;
        end = end === void 0 ? len : ~~end;
        if (start < 0) {
          start += len;
          if (start < 0) start = 0;
        } else if (start > len) {
          start = len;
        }
        if (end < 0) {
          end += len;
          if (end < 0) end = 0;
        } else if (end > len) {
          end = len;
        }
        if (end < start) end = start;
        const newBuf = this.subarray(start, end);
        Object.setPrototypeOf(newBuf, Buffer3.prototype);
        return newBuf;
      };
      function checkOffset(offset, ext, length) {
        if (offset % 1 !== 0 || offset < 0) throw new RangeError("offset is not uint");
        if (offset + ext > length) throw new RangeError("Trying to access beyond buffer length");
      }
      Buffer3.prototype.readUintLE = Buffer3.prototype.readUIntLE = function readUIntLE(offset, byteLength2, noAssert) {
        offset = offset >>> 0;
        byteLength2 = byteLength2 >>> 0;
        if (!noAssert) checkOffset(offset, byteLength2, this.length);
        let val = this[offset];
        let mul = 1;
        let i = 0;
        while (++i < byteLength2 && (mul *= 256)) {
          val += this[offset + i] * mul;
        }
        return val;
      };
      Buffer3.prototype.readUintBE = Buffer3.prototype.readUIntBE = function readUIntBE(offset, byteLength2, noAssert) {
        offset = offset >>> 0;
        byteLength2 = byteLength2 >>> 0;
        if (!noAssert) {
          checkOffset(offset, byteLength2, this.length);
        }
        let val = this[offset + --byteLength2];
        let mul = 1;
        while (byteLength2 > 0 && (mul *= 256)) {
          val += this[offset + --byteLength2] * mul;
        }
        return val;
      };
      Buffer3.prototype.readUint8 = Buffer3.prototype.readUInt8 = function readUInt8(offset, noAssert) {
        offset = offset >>> 0;
        if (!noAssert) checkOffset(offset, 1, this.length);
        return this[offset];
      };
      Buffer3.prototype.readUint16LE = Buffer3.prototype.readUInt16LE = function readUInt16LE(offset, noAssert) {
        offset = offset >>> 0;
        if (!noAssert) checkOffset(offset, 2, this.length);
        return this[offset] | this[offset + 1] << 8;
      };
      Buffer3.prototype.readUint16BE = Buffer3.prototype.readUInt16BE = function readUInt16BE(offset, noAssert) {
        offset = offset >>> 0;
        if (!noAssert) checkOffset(offset, 2, this.length);
        return this[offset] << 8 | this[offset + 1];
      };
      Buffer3.prototype.readUint32LE = Buffer3.prototype.readUInt32LE = function readUInt32LE(offset, noAssert) {
        offset = offset >>> 0;
        if (!noAssert) checkOffset(offset, 4, this.length);
        return (this[offset] | this[offset + 1] << 8 | this[offset + 2] << 16) + this[offset + 3] * 16777216;
      };
      Buffer3.prototype.readUint32BE = Buffer3.prototype.readUInt32BE = function readUInt32BE(offset, noAssert) {
        offset = offset >>> 0;
        if (!noAssert) checkOffset(offset, 4, this.length);
        return this[offset] * 16777216 + (this[offset + 1] << 16 | this[offset + 2] << 8 | this[offset + 3]);
      };
      Buffer3.prototype.readBigUInt64LE = defineBigIntMethod(function readBigUInt64LE(offset) {
        offset = offset >>> 0;
        validateNumber(offset, "offset");
        const first = this[offset];
        const last = this[offset + 7];
        if (first === void 0 || last === void 0) {
          boundsError(offset, this.length - 8);
        }
        const lo = first + this[++offset] * 2 ** 8 + this[++offset] * 2 ** 16 + this[++offset] * 2 ** 24;
        const hi = this[++offset] + this[++offset] * 2 ** 8 + this[++offset] * 2 ** 16 + last * 2 ** 24;
        return BigInt(lo) + (BigInt(hi) << BigInt(32));
      });
      Buffer3.prototype.readBigUInt64BE = defineBigIntMethod(function readBigUInt64BE(offset) {
        offset = offset >>> 0;
        validateNumber(offset, "offset");
        const first = this[offset];
        const last = this[offset + 7];
        if (first === void 0 || last === void 0) {
          boundsError(offset, this.length - 8);
        }
        const hi = first * 2 ** 24 + this[++offset] * 2 ** 16 + this[++offset] * 2 ** 8 + this[++offset];
        const lo = this[++offset] * 2 ** 24 + this[++offset] * 2 ** 16 + this[++offset] * 2 ** 8 + last;
        return (BigInt(hi) << BigInt(32)) + BigInt(lo);
      });
      Buffer3.prototype.readIntLE = function readIntLE(offset, byteLength2, noAssert) {
        offset = offset >>> 0;
        byteLength2 = byteLength2 >>> 0;
        if (!noAssert) checkOffset(offset, byteLength2, this.length);
        let val = this[offset];
        let mul = 1;
        let i = 0;
        while (++i < byteLength2 && (mul *= 256)) {
          val += this[offset + i] * mul;
        }
        mul *= 128;
        if (val >= mul) val -= Math.pow(2, 8 * byteLength2);
        return val;
      };
      Buffer3.prototype.readIntBE = function readIntBE(offset, byteLength2, noAssert) {
        offset = offset >>> 0;
        byteLength2 = byteLength2 >>> 0;
        if (!noAssert) checkOffset(offset, byteLength2, this.length);
        let i = byteLength2;
        let mul = 1;
        let val = this[offset + --i];
        while (i > 0 && (mul *= 256)) {
          val += this[offset + --i] * mul;
        }
        mul *= 128;
        if (val >= mul) val -= Math.pow(2, 8 * byteLength2);
        return val;
      };
      Buffer3.prototype.readInt8 = function readInt8(offset, noAssert) {
        offset = offset >>> 0;
        if (!noAssert) checkOffset(offset, 1, this.length);
        if (!(this[offset] & 128)) return this[offset];
        return (255 - this[offset] + 1) * -1;
      };
      Buffer3.prototype.readInt16LE = function readInt16LE(offset, noAssert) {
        offset = offset >>> 0;
        if (!noAssert) checkOffset(offset, 2, this.length);
        const val = this[offset] | this[offset + 1] << 8;
        return val & 32768 ? val | 4294901760 : val;
      };
      Buffer3.prototype.readInt16BE = function readInt16BE(offset, noAssert) {
        offset = offset >>> 0;
        if (!noAssert) checkOffset(offset, 2, this.length);
        const val = this[offset + 1] | this[offset] << 8;
        return val & 32768 ? val | 4294901760 : val;
      };
      Buffer3.prototype.readInt32LE = function readInt32LE(offset, noAssert) {
        offset = offset >>> 0;
        if (!noAssert) checkOffset(offset, 4, this.length);
        return this[offset] | this[offset + 1] << 8 | this[offset + 2] << 16 | this[offset + 3] << 24;
      };
      Buffer3.prototype.readInt32BE = function readInt32BE(offset, noAssert) {
        offset = offset >>> 0;
        if (!noAssert) checkOffset(offset, 4, this.length);
        return this[offset] << 24 | this[offset + 1] << 16 | this[offset + 2] << 8 | this[offset + 3];
      };
      Buffer3.prototype.readBigInt64LE = defineBigIntMethod(function readBigInt64LE(offset) {
        offset = offset >>> 0;
        validateNumber(offset, "offset");
        const first = this[offset];
        const last = this[offset + 7];
        if (first === void 0 || last === void 0) {
          boundsError(offset, this.length - 8);
        }
        const val = this[offset + 4] + this[offset + 5] * 2 ** 8 + this[offset + 6] * 2 ** 16 + (last << 24);
        return (BigInt(val) << BigInt(32)) + BigInt(first + this[++offset] * 2 ** 8 + this[++offset] * 2 ** 16 + this[++offset] * 2 ** 24);
      });
      Buffer3.prototype.readBigInt64BE = defineBigIntMethod(function readBigInt64BE(offset) {
        offset = offset >>> 0;
        validateNumber(offset, "offset");
        const first = this[offset];
        const last = this[offset + 7];
        if (first === void 0 || last === void 0) {
          boundsError(offset, this.length - 8);
        }
        const val = (first << 24) + // Overflow
        this[++offset] * 2 ** 16 + this[++offset] * 2 ** 8 + this[++offset];
        return (BigInt(val) << BigInt(32)) + BigInt(this[++offset] * 2 ** 24 + this[++offset] * 2 ** 16 + this[++offset] * 2 ** 8 + last);
      });
      Buffer3.prototype.readFloatLE = function readFloatLE(offset, noAssert) {
        offset = offset >>> 0;
        if (!noAssert) checkOffset(offset, 4, this.length);
        return ieee754.read(this, offset, true, 23, 4);
      };
      Buffer3.prototype.readFloatBE = function readFloatBE(offset, noAssert) {
        offset = offset >>> 0;
        if (!noAssert) checkOffset(offset, 4, this.length);
        return ieee754.read(this, offset, false, 23, 4);
      };
      Buffer3.prototype.readDoubleLE = function readDoubleLE(offset, noAssert) {
        offset = offset >>> 0;
        if (!noAssert) checkOffset(offset, 8, this.length);
        return ieee754.read(this, offset, true, 52, 8);
      };
      Buffer3.prototype.readDoubleBE = function readDoubleBE(offset, noAssert) {
        offset = offset >>> 0;
        if (!noAssert) checkOffset(offset, 8, this.length);
        return ieee754.read(this, offset, false, 52, 8);
      };
      function checkInt(buf, value, offset, ext, max, min) {
        if (!Buffer3.isBuffer(buf)) throw new TypeError('"buffer" argument must be a Buffer instance');
        if (value > max || value < min) throw new RangeError('"value" argument is out of bounds');
        if (offset + ext > buf.length) throw new RangeError("Index out of range");
      }
      Buffer3.prototype.writeUintLE = Buffer3.prototype.writeUIntLE = function writeUIntLE(value, offset, byteLength2, noAssert) {
        value = +value;
        offset = offset >>> 0;
        byteLength2 = byteLength2 >>> 0;
        if (!noAssert) {
          const maxBytes = Math.pow(2, 8 * byteLength2) - 1;
          checkInt(this, value, offset, byteLength2, maxBytes, 0);
        }
        let mul = 1;
        let i = 0;
        this[offset] = value & 255;
        while (++i < byteLength2 && (mul *= 256)) {
          this[offset + i] = value / mul & 255;
        }
        return offset + byteLength2;
      };
      Buffer3.prototype.writeUintBE = Buffer3.prototype.writeUIntBE = function writeUIntBE(value, offset, byteLength2, noAssert) {
        value = +value;
        offset = offset >>> 0;
        byteLength2 = byteLength2 >>> 0;
        if (!noAssert) {
          const maxBytes = Math.pow(2, 8 * byteLength2) - 1;
          checkInt(this, value, offset, byteLength2, maxBytes, 0);
        }
        let i = byteLength2 - 1;
        let mul = 1;
        this[offset + i] = value & 255;
        while (--i >= 0 && (mul *= 256)) {
          this[offset + i] = value / mul & 255;
        }
        return offset + byteLength2;
      };
      Buffer3.prototype.writeUint8 = Buffer3.prototype.writeUInt8 = function writeUInt8(value, offset, noAssert) {
        value = +value;
        offset = offset >>> 0;
        if (!noAssert) checkInt(this, value, offset, 1, 255, 0);
        this[offset] = value & 255;
        return offset + 1;
      };
      Buffer3.prototype.writeUint16LE = Buffer3.prototype.writeUInt16LE = function writeUInt16LE(value, offset, noAssert) {
        value = +value;
        offset = offset >>> 0;
        if (!noAssert) checkInt(this, value, offset, 2, 65535, 0);
        this[offset] = value & 255;
        this[offset + 1] = value >>> 8;
        return offset + 2;
      };
      Buffer3.prototype.writeUint16BE = Buffer3.prototype.writeUInt16BE = function writeUInt16BE(value, offset, noAssert) {
        value = +value;
        offset = offset >>> 0;
        if (!noAssert) checkInt(this, value, offset, 2, 65535, 0);
        this[offset] = value >>> 8;
        this[offset + 1] = value & 255;
        return offset + 2;
      };
      Buffer3.prototype.writeUint32LE = Buffer3.prototype.writeUInt32LE = function writeUInt32LE(value, offset, noAssert) {
        value = +value;
        offset = offset >>> 0;
        if (!noAssert) checkInt(this, value, offset, 4, 4294967295, 0);
        this[offset + 3] = value >>> 24;
        this[offset + 2] = value >>> 16;
        this[offset + 1] = value >>> 8;
        this[offset] = value & 255;
        return offset + 4;
      };
      Buffer3.prototype.writeUint32BE = Buffer3.prototype.writeUInt32BE = function writeUInt32BE(value, offset, noAssert) {
        value = +value;
        offset = offset >>> 0;
        if (!noAssert) checkInt(this, value, offset, 4, 4294967295, 0);
        this[offset] = value >>> 24;
        this[offset + 1] = value >>> 16;
        this[offset + 2] = value >>> 8;
        this[offset + 3] = value & 255;
        return offset + 4;
      };
      function wrtBigUInt64LE(buf, value, offset, min, max) {
        checkIntBI(value, min, max, buf, offset, 7);
        let lo = Number(value & BigInt(4294967295));
        buf[offset++] = lo;
        lo = lo >> 8;
        buf[offset++] = lo;
        lo = lo >> 8;
        buf[offset++] = lo;
        lo = lo >> 8;
        buf[offset++] = lo;
        let hi = Number(value >> BigInt(32) & BigInt(4294967295));
        buf[offset++] = hi;
        hi = hi >> 8;
        buf[offset++] = hi;
        hi = hi >> 8;
        buf[offset++] = hi;
        hi = hi >> 8;
        buf[offset++] = hi;
        return offset;
      }
      function wrtBigUInt64BE(buf, value, offset, min, max) {
        checkIntBI(value, min, max, buf, offset, 7);
        let lo = Number(value & BigInt(4294967295));
        buf[offset + 7] = lo;
        lo = lo >> 8;
        buf[offset + 6] = lo;
        lo = lo >> 8;
        buf[offset + 5] = lo;
        lo = lo >> 8;
        buf[offset + 4] = lo;
        let hi = Number(value >> BigInt(32) & BigInt(4294967295));
        buf[offset + 3] = hi;
        hi = hi >> 8;
        buf[offset + 2] = hi;
        hi = hi >> 8;
        buf[offset + 1] = hi;
        hi = hi >> 8;
        buf[offset] = hi;
        return offset + 8;
      }
      Buffer3.prototype.writeBigUInt64LE = defineBigIntMethod(function writeBigUInt64LE(value, offset = 0) {
        return wrtBigUInt64LE(this, value, offset, BigInt(0), BigInt("0xffffffffffffffff"));
      });
      Buffer3.prototype.writeBigUInt64BE = defineBigIntMethod(function writeBigUInt64BE(value, offset = 0) {
        return wrtBigUInt64BE(this, value, offset, BigInt(0), BigInt("0xffffffffffffffff"));
      });
      Buffer3.prototype.writeIntLE = function writeIntLE(value, offset, byteLength2, noAssert) {
        value = +value;
        offset = offset >>> 0;
        if (!noAssert) {
          const limit = Math.pow(2, 8 * byteLength2 - 1);
          checkInt(this, value, offset, byteLength2, limit - 1, -limit);
        }
        let i = 0;
        let mul = 1;
        let sub = 0;
        this[offset] = value & 255;
        while (++i < byteLength2 && (mul *= 256)) {
          if (value < 0 && sub === 0 && this[offset + i - 1] !== 0) {
            sub = 1;
          }
          this[offset + i] = (value / mul >> 0) - sub & 255;
        }
        return offset + byteLength2;
      };
      Buffer3.prototype.writeIntBE = function writeIntBE(value, offset, byteLength2, noAssert) {
        value = +value;
        offset = offset >>> 0;
        if (!noAssert) {
          const limit = Math.pow(2, 8 * byteLength2 - 1);
          checkInt(this, value, offset, byteLength2, limit - 1, -limit);
        }
        let i = byteLength2 - 1;
        let mul = 1;
        let sub = 0;
        this[offset + i] = value & 255;
        while (--i >= 0 && (mul *= 256)) {
          if (value < 0 && sub === 0 && this[offset + i + 1] !== 0) {
            sub = 1;
          }
          this[offset + i] = (value / mul >> 0) - sub & 255;
        }
        return offset + byteLength2;
      };
      Buffer3.prototype.writeInt8 = function writeInt8(value, offset, noAssert) {
        value = +value;
        offset = offset >>> 0;
        if (!noAssert) checkInt(this, value, offset, 1, 127, -128);
        if (value < 0) value = 255 + value + 1;
        this[offset] = value & 255;
        return offset + 1;
      };
      Buffer3.prototype.writeInt16LE = function writeInt16LE(value, offset, noAssert) {
        value = +value;
        offset = offset >>> 0;
        if (!noAssert) checkInt(this, value, offset, 2, 32767, -32768);
        this[offset] = value & 255;
        this[offset + 1] = value >>> 8;
        return offset + 2;
      };
      Buffer3.prototype.writeInt16BE = function writeInt16BE(value, offset, noAssert) {
        value = +value;
        offset = offset >>> 0;
        if (!noAssert) checkInt(this, value, offset, 2, 32767, -32768);
        this[offset] = value >>> 8;
        this[offset + 1] = value & 255;
        return offset + 2;
      };
      Buffer3.prototype.writeInt32LE = function writeInt32LE(value, offset, noAssert) {
        value = +value;
        offset = offset >>> 0;
        if (!noAssert) checkInt(this, value, offset, 4, 2147483647, -2147483648);
        this[offset] = value & 255;
        this[offset + 1] = value >>> 8;
        this[offset + 2] = value >>> 16;
        this[offset + 3] = value >>> 24;
        return offset + 4;
      };
      Buffer3.prototype.writeInt32BE = function writeInt32BE(value, offset, noAssert) {
        value = +value;
        offset = offset >>> 0;
        if (!noAssert) checkInt(this, value, offset, 4, 2147483647, -2147483648);
        if (value < 0) value = 4294967295 + value + 1;
        this[offset] = value >>> 24;
        this[offset + 1] = value >>> 16;
        this[offset + 2] = value >>> 8;
        this[offset + 3] = value & 255;
        return offset + 4;
      };
      Buffer3.prototype.writeBigInt64LE = defineBigIntMethod(function writeBigInt64LE(value, offset = 0) {
        return wrtBigUInt64LE(this, value, offset, -BigInt("0x8000000000000000"), BigInt("0x7fffffffffffffff"));
      });
      Buffer3.prototype.writeBigInt64BE = defineBigIntMethod(function writeBigInt64BE(value, offset = 0) {
        return wrtBigUInt64BE(this, value, offset, -BigInt("0x8000000000000000"), BigInt("0x7fffffffffffffff"));
      });
      function checkIEEE754(buf, value, offset, ext, max, min) {
        if (offset + ext > buf.length) throw new RangeError("Index out of range");
        if (offset < 0) throw new RangeError("Index out of range");
      }
      function writeFloat(buf, value, offset, littleEndian, noAssert) {
        value = +value;
        offset = offset >>> 0;
        if (!noAssert) {
          checkIEEE754(buf, value, offset, 4, 34028234663852886e22, -34028234663852886e22);
        }
        ieee754.write(buf, value, offset, littleEndian, 23, 4);
        return offset + 4;
      }
      Buffer3.prototype.writeFloatLE = function writeFloatLE(value, offset, noAssert) {
        return writeFloat(this, value, offset, true, noAssert);
      };
      Buffer3.prototype.writeFloatBE = function writeFloatBE(value, offset, noAssert) {
        return writeFloat(this, value, offset, false, noAssert);
      };
      function writeDouble(buf, value, offset, littleEndian, noAssert) {
        value = +value;
        offset = offset >>> 0;
        if (!noAssert) {
          checkIEEE754(buf, value, offset, 8, 17976931348623157e292, -17976931348623157e292);
        }
        ieee754.write(buf, value, offset, littleEndian, 52, 8);
        return offset + 8;
      }
      Buffer3.prototype.writeDoubleLE = function writeDoubleLE(value, offset, noAssert) {
        return writeDouble(this, value, offset, true, noAssert);
      };
      Buffer3.prototype.writeDoubleBE = function writeDoubleBE(value, offset, noAssert) {
        return writeDouble(this, value, offset, false, noAssert);
      };
      Buffer3.prototype.copy = function copy(target, targetStart, start, end) {
        if (!Buffer3.isBuffer(target)) throw new TypeError("argument should be a Buffer");
        if (!start) start = 0;
        if (!end && end !== 0) end = this.length;
        if (targetStart >= target.length) targetStart = target.length;
        if (!targetStart) targetStart = 0;
        if (end > 0 && end < start) end = start;
        if (end === start) return 0;
        if (target.length === 0 || this.length === 0) return 0;
        if (targetStart < 0) {
          throw new RangeError("targetStart out of bounds");
        }
        if (start < 0 || start >= this.length) throw new RangeError("Index out of range");
        if (end < 0) throw new RangeError("sourceEnd out of bounds");
        if (end > this.length) end = this.length;
        if (target.length - targetStart < end - start) {
          end = target.length - targetStart + start;
        }
        const len = end - start;
        if (this === target && typeof Uint8Array.prototype.copyWithin === "function") {
          this.copyWithin(targetStart, start, end);
        } else {
          Uint8Array.prototype.set.call(
            target,
            this.subarray(start, end),
            targetStart
          );
        }
        return len;
      };
      Buffer3.prototype.fill = function fill(val, start, end, encoding) {
        if (typeof val === "string") {
          if (typeof start === "string") {
            encoding = start;
            start = 0;
            end = this.length;
          } else if (typeof end === "string") {
            encoding = end;
            end = this.length;
          }
          if (encoding !== void 0 && typeof encoding !== "string") {
            throw new TypeError("encoding must be a string");
          }
          if (typeof encoding === "string" && !Buffer3.isEncoding(encoding)) {
            throw new TypeError("Unknown encoding: " + encoding);
          }
          if (val.length === 1) {
            const code = val.charCodeAt(0);
            if (encoding === "utf8" && code < 128 || encoding === "latin1") {
              val = code;
            }
          }
        } else if (typeof val === "number") {
          val = val & 255;
        } else if (typeof val === "boolean") {
          val = Number(val);
        }
        if (start < 0 || this.length < start || this.length < end) {
          throw new RangeError("Out of range index");
        }
        if (end <= start) {
          return this;
        }
        start = start >>> 0;
        end = end === void 0 ? this.length : end >>> 0;
        if (!val) val = 0;
        let i;
        if (typeof val === "number") {
          for (i = start; i < end; ++i) {
            this[i] = val;
          }
        } else {
          const bytes = Buffer3.isBuffer(val) ? val : Buffer3.from(val, encoding);
          const len = bytes.length;
          if (len === 0) {
            throw new TypeError('The value "' + val + '" is invalid for argument "value"');
          }
          for (i = 0; i < end - start; ++i) {
            this[i + start] = bytes[i % len];
          }
        }
        return this;
      };
      var errors = {};
      function E(sym, getMessage, Base) {
        errors[sym] = class NodeError extends Base {
          constructor() {
            super();
            Object.defineProperty(this, "message", {
              value: getMessage.apply(this, arguments),
              writable: true,
              configurable: true
            });
            this.name = `${this.name} [${sym}]`;
            this.stack;
            delete this.name;
          }
          get code() {
            return sym;
          }
          set code(value) {
            Object.defineProperty(this, "code", {
              configurable: true,
              enumerable: true,
              value,
              writable: true
            });
          }
          toString() {
            return `${this.name} [${sym}]: ${this.message}`;
          }
        };
      }
      E(
        "ERR_BUFFER_OUT_OF_BOUNDS",
        function(name) {
          if (name) {
            return `${name} is outside of buffer bounds`;
          }
          return "Attempt to access memory outside buffer bounds";
        },
        RangeError
      );
      E(
        "ERR_INVALID_ARG_TYPE",
        function(name, actual) {
          return `The "${name}" argument must be of type number. Received type ${typeof actual}`;
        },
        TypeError
      );
      E(
        "ERR_OUT_OF_RANGE",
        function(str3, range, input) {
          let msg = `The value of "${str3}" is out of range.`;
          let received = input;
          if (Number.isInteger(input) && Math.abs(input) > 2 ** 32) {
            received = addNumericalSeparator(String(input));
          } else if (typeof input === "bigint") {
            received = String(input);
            if (input > BigInt(2) ** BigInt(32) || input < -(BigInt(2) ** BigInt(32))) {
              received = addNumericalSeparator(received);
            }
            received += "n";
          }
          msg += ` It must be ${range}. Received ${received}`;
          return msg;
        },
        RangeError
      );
      function addNumericalSeparator(val) {
        let res = "";
        let i = val.length;
        const start = val[0] === "-" ? 1 : 0;
        for (; i >= start + 4; i -= 3) {
          res = `_${val.slice(i - 3, i)}${res}`;
        }
        return `${val.slice(0, i)}${res}`;
      }
      function checkBounds(buf, offset, byteLength2) {
        validateNumber(offset, "offset");
        if (buf[offset] === void 0 || buf[offset + byteLength2] === void 0) {
          boundsError(offset, buf.length - (byteLength2 + 1));
        }
      }
      function checkIntBI(value, min, max, buf, offset, byteLength2) {
        if (value > max || value < min) {
          const n = typeof min === "bigint" ? "n" : "";
          let range;
          if (byteLength2 > 3) {
            if (min === 0 || min === BigInt(0)) {
              range = `>= 0${n} and < 2${n} ** ${(byteLength2 + 1) * 8}${n}`;
            } else {
              range = `>= -(2${n} ** ${(byteLength2 + 1) * 8 - 1}${n}) and < 2 ** ${(byteLength2 + 1) * 8 - 1}${n}`;
            }
          } else {
            range = `>= ${min}${n} and <= ${max}${n}`;
          }
          throw new errors.ERR_OUT_OF_RANGE("value", range, value);
        }
        checkBounds(buf, offset, byteLength2);
      }
      function validateNumber(value, name) {
        if (typeof value !== "number") {
          throw new errors.ERR_INVALID_ARG_TYPE(name, "number", value);
        }
      }
      function boundsError(value, length, type) {
        if (Math.floor(value) !== value) {
          validateNumber(value, type);
          throw new errors.ERR_OUT_OF_RANGE(type || "offset", "an integer", value);
        }
        if (length < 0) {
          throw new errors.ERR_BUFFER_OUT_OF_BOUNDS();
        }
        throw new errors.ERR_OUT_OF_RANGE(
          type || "offset",
          `>= ${type ? 1 : 0} and <= ${length}`,
          value
        );
      }
      var INVALID_BASE64_RE = /[^+/0-9A-Za-z-_]/g;
      function base64clean(str3) {
        str3 = str3.split("=")[0];
        str3 = str3.trim().replace(INVALID_BASE64_RE, "");
        if (str3.length < 2) return "";
        while (str3.length % 4 !== 0) {
          str3 = str3 + "=";
        }
        return str3;
      }
      function utf8ToBytes(string, units) {
        units = units || Infinity;
        let codePoint;
        const length = string.length;
        let leadSurrogate = null;
        const bytes = [];
        for (let i = 0; i < length; ++i) {
          codePoint = string.charCodeAt(i);
          if (codePoint > 55295 && codePoint < 57344) {
            if (!leadSurrogate) {
              if (codePoint > 56319) {
                if ((units -= 3) > -1) bytes.push(239, 191, 189);
                continue;
              } else if (i + 1 === length) {
                if ((units -= 3) > -1) bytes.push(239, 191, 189);
                continue;
              }
              leadSurrogate = codePoint;
              continue;
            }
            if (codePoint < 56320) {
              if ((units -= 3) > -1) bytes.push(239, 191, 189);
              leadSurrogate = codePoint;
              continue;
            }
            codePoint = (leadSurrogate - 55296 << 10 | codePoint - 56320) + 65536;
          } else if (leadSurrogate) {
            if ((units -= 3) > -1) bytes.push(239, 191, 189);
          }
          leadSurrogate = null;
          if (codePoint < 128) {
            if ((units -= 1) < 0) break;
            bytes.push(codePoint);
          } else if (codePoint < 2048) {
            if ((units -= 2) < 0) break;
            bytes.push(
              codePoint >> 6 | 192,
              codePoint & 63 | 128
            );
          } else if (codePoint < 65536) {
            if ((units -= 3) < 0) break;
            bytes.push(
              codePoint >> 12 | 224,
              codePoint >> 6 & 63 | 128,
              codePoint & 63 | 128
            );
          } else if (codePoint < 1114112) {
            if ((units -= 4) < 0) break;
            bytes.push(
              codePoint >> 18 | 240,
              codePoint >> 12 & 63 | 128,
              codePoint >> 6 & 63 | 128,
              codePoint & 63 | 128
            );
          } else {
            throw new Error("Invalid code point");
          }
        }
        return bytes;
      }
      function asciiToBytes(str3) {
        const byteArray = [];
        for (let i = 0; i < str3.length; ++i) {
          byteArray.push(str3.charCodeAt(i) & 255);
        }
        return byteArray;
      }
      function utf16leToBytes(str3, units) {
        let c, hi, lo;
        const byteArray = [];
        for (let i = 0; i < str3.length; ++i) {
          if ((units -= 2) < 0) break;
          c = str3.charCodeAt(i);
          hi = c >> 8;
          lo = c % 256;
          byteArray.push(lo);
          byteArray.push(hi);
        }
        return byteArray;
      }
      function base64ToBytes(str3) {
        return base64.toByteArray(base64clean(str3));
      }
      function blitBuffer(src, dst, offset, length) {
        let i;
        for (i = 0; i < length; ++i) {
          if (i + offset >= dst.length || i >= src.length) break;
          dst[i + offset] = src[i];
        }
        return i;
      }
      function isInstance(obj, type) {
        return obj instanceof type || obj != null && obj.constructor != null && obj.constructor.name != null && obj.constructor.name === type.name;
      }
      function numberIsNaN(obj) {
        return obj !== obj;
      }
      var hexSliceLookupTable = (function() {
        const alphabet = "0123456789abcdef";
        const table = new Array(256);
        for (let i = 0; i < 16; ++i) {
          const i16 = i * 16;
          for (let j = 0; j < 16; ++j) {
            table[i16 + j] = alphabet[i] + alphabet[j];
          }
        }
        return table;
      })();
      function defineBigIntMethod(fn) {
        return typeof BigInt === "undefined" ? BufferBigIntNotDefined : fn;
      }
      function BufferBigIntNotDefined() {
        throw new Error("BigInt not supported");
      }
    }
  });

  // scripts/buffer-shim.js
  var import_buffer;
  var init_buffer_shim = __esm({
    "scripts/buffer-shim.js"() {
      import_buffer = __toESM(require_buffer(), 1);
    }
  });

  // src/browser.js
  var browser_exports = {};
  __export(browser_exports, {
    AacFmp4Muxer: () => AacFmp4Muxer,
    DEFAULT_PIPE: () => DEFAULT_PIPE,
    Emitter: () => Emitter,
    Fmp4Muxer: () => Fmp4Muxer,
    GATEWAY_PIPE: () => GATEWAY_PIPE,
    HaviPlayerElement: () => HaviPlayerElement,
    RtspClient: () => RtspClient,
    RtspPipeline: () => RtspPipeline,
    STANDALONE_PIPE: () => STANDALONE_PIPE,
    canDirectConnect: () => canDirectConnect,
    configureLayer: () => configureLayer,
    configurePipe: () => configurePipe,
    createBrowserConnect: () => createBrowserConnect,
    createBrowserPlayer: () => createBrowserPlayer,
    createHttpTransport: () => createHttpTransport,
    createPipeline: () => createPipeline,
    createWebSocketTransport: () => createWebSocketTransport,
    directConnect: () => directConnect,
    directSocketsStatus: () => directSocketsStatus,
    explainDirectSockets: () => explainDirectSockets,
    getDefaultTransport: () => getDefaultTransport,
    inferHttpBase: () => inferHttpBase,
    inferPipe: () => inferPipe,
    isDenoHost: () => isDenoHost,
    isHttpUrl: () => isHttpUrl,
    normalizeRtspUrl: () => normalizeRtspUrl,
    normalizeStreamUrl: () => normalizeStreamUrl,
    parseRtp: () => parseRtp,
    parseSdp: () => parseSdp,
    pickAudioTrack: () => pickAudioTrack,
    pickVideoTrack: () => pickVideoTrack,
    play: () => play,
    setDefaultTransport: () => setDefaultTransport,
    startDenoHost: () => startDenoHost
  });
  init_buffer_shim();

  // src/stream/pipeline.js
  init_buffer_shim();

  // src/util/emitter.js
  init_buffer_shim();
  var Emitter = class {
    constructor() {
      this._listeners = /* @__PURE__ */ new Map();
    }
    on(event, fn) {
      if (!this._listeners.has(event)) this._listeners.set(event, /* @__PURE__ */ new Set());
      this._listeners.get(event).add(fn);
      return this;
    }
    once(event, fn) {
      const wrapped = (...args) => {
        this.off(event, wrapped);
        fn(...args);
      };
      wrapped._original = fn;
      return this.on(event, wrapped);
    }
    off(event, fn) {
      const set = this._listeners.get(event);
      if (!set) return this;
      for (const listener of set) {
        if (listener === fn || listener._original === fn) set.delete(listener);
      }
      if (!set.size) this._listeners.delete(event);
      return this;
    }
    emit(event, ...args) {
      const set = this._listeners.get(event);
      if (!set || !set.size) return false;
      for (const fn of [...set]) fn(...args);
      return true;
    }
    removeAllListeners(event) {
      if (event === void 0) this._listeners.clear();
      else this._listeners.delete(event);
      return this;
    }
    listenerCount(event) {
      return this._listeners.get(event)?.size || 0;
    }
  };

  // src/mux/fmp4.js
  init_buffer_shim();

  // src/mux/bits.js
  init_buffer_shim();
  var BitReader = class {
    constructor(buffer) {
      this.buffer = buffer;
      this.bit = 0;
    }
    u(n) {
      let v = 0;
      for (let i = 0; i < n; i++) {
        const byte = this.buffer[this.bit >> 3] || 0;
        v = v * 2 + (byte >> 7 - (this.bit & 7) & 1);
        this.bit++;
      }
      return v;
    }
    ue() {
      let zeros3 = 0;
      while (this.u(1) === 0) zeros3++;
      return zeros3 === 0 ? 0 : (1 << zeros3) - 1 + this.u(zeros3);
    }
    se() {
      const v = this.ue();
      return v & 1 ? v + 1 >> 1 : -(v >> 1);
    }
  };
  function unescapeEmulationPrevention(data) {
    const out = [];
    for (let i = 0; i < data.length; i++) {
      if (i + 2 < data.length && data[i] === 0 && data[i + 1] === 0 && data[i + 2] === 3) {
        out.push(0, 0);
        i += 2;
        continue;
      }
      out.push(data[i]);
    }
    return import_buffer.Buffer.from(out);
  }
  function stripStartCode(nal) {
    if (nal.length >= 4 && nal[0] === 0 && nal[1] === 0 && nal[2] === 0 && nal[3] === 1) {
      return nal.subarray(4);
    }
    if (nal.length >= 3 && nal[0] === 0 && nal[1] === 0 && nal[2] === 1) {
      return nal.subarray(3);
    }
    return nal;
  }
  function sameNal(a, b) {
    return Boolean(a && b && a.length === b.length && a.equals(b));
  }

  // src/mux/sps.js
  init_buffer_shim();
  function parseSps(nal) {
    const rbsp = unescapeEmulationPrevention(nal.subarray(1));
    const bits = new BitReader(rbsp);
    const profileIdc = bits.u(8);
    const profileCompatibility = bits.u(8);
    const levelIdc = bits.u(8);
    bits.ue();
    let chromaFormatIdc = 1;
    if ([100, 110, 122, 244, 44, 83, 86, 118, 128, 138, 139, 134, 135].includes(profileIdc)) {
      chromaFormatIdc = bits.ue();
      if (chromaFormatIdc === 3) bits.u(1);
      bits.ue();
      bits.ue();
      bits.u(1);
      if (bits.u(1)) {
        const count = chromaFormatIdc !== 3 ? 8 : 12;
        for (let i = 0; i < count; i++) {
          if (bits.u(1)) skipScalingList(bits, i < 6 ? 16 : 64);
        }
      }
    }
    bits.ue();
    const pocType = bits.ue();
    if (pocType === 0) {
      bits.ue();
    } else if (pocType === 1) {
      bits.u(1);
      bits.se();
      bits.se();
      const n = bits.ue();
      for (let i = 0; i < n; i++) bits.se();
    }
    bits.ue();
    bits.u(1);
    const picWidthInMbsMinus1 = bits.ue();
    const picHeightInMapUnitsMinus1 = bits.ue();
    const frameMbsOnlyFlag = bits.u(1);
    if (!frameMbsOnlyFlag) bits.u(1);
    bits.u(1);
    let cropLeft = 0;
    let cropRight = 0;
    let cropTop = 0;
    let cropBottom = 0;
    if (bits.u(1)) {
      cropLeft = bits.ue();
      cropRight = bits.ue();
      cropTop = bits.ue();
      cropBottom = bits.ue();
    }
    const cropUnitX = chromaFormatIdc === 0 ? 1 : 2;
    const cropUnitY = (chromaFormatIdc === 0 ? 1 : 2) * (2 - frameMbsOnlyFlag);
    const width = (picWidthInMbsMinus1 + 1) * 16 - cropUnitX * (cropLeft + cropRight);
    const height = (2 - frameMbsOnlyFlag) * (picHeightInMapUnitsMinus1 + 1) * 16 - cropUnitY * (cropTop + cropBottom);
    return {
      profileIdc,
      profileCompatibility,
      levelIdc,
      width,
      height,
      codec: codecString(profileIdc, profileCompatibility, levelIdc)
    };
  }
  function codecString(profileIdc, compat, levelIdc) {
    return `avc1.${hex2(profileIdc)}${hex2(compat)}${hex2(levelIdc)}`;
  }
  function buildAvcC(sps, pps) {
    const spsNal = stripStartCode(sps);
    const ppsNal = stripStartCode(pps);
    const info = parseSps(spsNal);
    const buf = import_buffer.Buffer.alloc(11 + spsNal.length + ppsNal.length);
    let o = 0;
    buf[o++] = 1;
    buf[o++] = info.profileIdc;
    buf[o++] = info.profileCompatibility;
    buf[o++] = info.levelIdc;
    buf[o++] = 255;
    buf[o++] = 225;
    buf.writeUInt16BE(spsNal.length, o);
    o += 2;
    spsNal.copy(buf, o);
    o += spsNal.length;
    buf[o++] = 1;
    buf.writeUInt16BE(ppsNal.length, o);
    o += 2;
    ppsNal.copy(buf, o);
    return { avcC: buf, info };
  }
  function hex2(n) {
    return n.toString(16).padStart(2, "0");
  }
  function skipScalingList(bits, size) {
    let lastScale = 8;
    let nextScale = 8;
    for (let i = 0; i < size; i++) {
      if (nextScale !== 0) {
        const delta = bits.se();
        nextScale = (lastScale + delta + 256) % 256;
      }
      lastScale = nextScale === 0 ? lastScale : nextScale;
    }
  }

  // src/mux/hevc.js
  init_buffer_shim();
  function parseHevcSps(nal) {
    const raw = stripStartCode(nal);
    const rbsp = unescapeEmulationPrevention(raw.subarray(2));
    const bits = new BitReader(rbsp);
    bits.u(4);
    const maxSubLayersMinus1 = bits.u(3);
    bits.u(1);
    const ptl = parseProfileTierLevel(bits, maxSubLayersMinus1);
    bits.ue();
    const chromaFormatIdc = bits.ue();
    if (chromaFormatIdc === 3) bits.u(1);
    let width = bits.ue();
    let height = bits.ue();
    if (bits.u(1)) {
      const left = bits.ue();
      const right = bits.ue();
      const top = bits.ue();
      const bottom = bits.ue();
      const subX = chromaFormatIdc === 1 || chromaFormatIdc === 2 ? 2 : 1;
      const subY = chromaFormatIdc === 1 ? 2 : 1;
      width -= subX * (left + right);
      height -= subY * (top + bottom);
    }
    const bitDepthLumaMinus8 = bits.ue();
    const bitDepthChromaMinus8 = bits.ue();
    return {
      width,
      height,
      chromaFormatIdc,
      bitDepthLumaMinus8,
      bitDepthChromaMinus8,
      ...ptl,
      codec: hevcCodecString(ptl)
    };
  }
  function hevcCodecString(ptl) {
    const space = ptl.profileSpace ? `${ptl.profileSpace}` : "";
    const compat = (ptl.compatibilityFlags >>> 0).toString(16).replace(/0+$/, "") || "0";
    const tier = ptl.tierFlag ? "H" : "L";
    const constraints = constraintHex(ptl.constraintFlags);
    return `hvc1.${space}${ptl.profileIdc}.${compat}.${tier}${ptl.levelIdc}.${constraints}`;
  }
  function buildHvcC({ vps, sps, pps }) {
    const spsNal = stripStartCode(sps);
    const ppsNal = stripStartCode(pps);
    const vpsNal = vps ? stripStartCode(vps) : null;
    const info = parseHevcSps(spsNal);
    const arrays = [];
    if (vpsNal) arrays.push(nalArray(32, [vpsNal]));
    arrays.push(nalArray(33, [spsNal]));
    arrays.push(nalArray(34, [ppsNal]));
    const header = import_buffer.Buffer.alloc(23);
    let o = 0;
    header[o++] = 1;
    header[o++] = (info.profileSpace & 3) << 6 | (info.tierFlag & 1) << 5 | info.profileIdc & 31;
    header.writeUInt32BE(info.compatibilityFlags >>> 0, o);
    o += 4;
    const c = info.constraintFlags;
    header[o++] = Number(c >> 40n & 0xffn);
    header[o++] = Number(c >> 32n & 0xffn);
    header[o++] = Number(c >> 24n & 0xffn);
    header[o++] = Number(c >> 16n & 0xffn);
    header[o++] = Number(c >> 8n & 0xffn);
    header[o++] = Number(c & 0xffn);
    header[o++] = info.levelIdc;
    header.writeUInt16BE(61440, o);
    o += 2;
    header[o++] = 252;
    header[o++] = 252 | info.chromaFormatIdc & 3;
    header[o++] = 248 | info.bitDepthLumaMinus8 & 7;
    header[o++] = 248 | info.bitDepthChromaMinus8 & 7;
    header.writeUInt16BE(0, o);
    o += 2;
    header[o++] = 3;
    header[o++] = arrays.length;
    return { hvcC: import_buffer.Buffer.concat([header, ...arrays]), info };
  }
  function nalArray(type, nals) {
    const pieces = [import_buffer.Buffer.from([128 | type & 63])];
    const count = import_buffer.Buffer.alloc(2);
    count.writeUInt16BE(nals.length);
    pieces.push(count);
    for (const nal of nals) {
      const len = import_buffer.Buffer.alloc(2);
      len.writeUInt16BE(nal.length);
      pieces.push(len, nal);
    }
    return import_buffer.Buffer.concat(pieces);
  }
  function parseProfileTierLevel(bits, maxSubLayersMinus1) {
    const profileSpace = bits.u(2);
    const tierFlag = bits.u(1);
    const profileIdc = bits.u(5);
    const compatibilityFlags = bits.u(32);
    const constraintFlags = BigInt(bits.u(24)) << 24n | BigInt(bits.u(24));
    const levelIdc = bits.u(8);
    const profilePresent = [];
    const levelPresent = [];
    for (let i = 0; i < maxSubLayersMinus1; i++) {
      profilePresent[i] = bits.u(1);
      levelPresent[i] = bits.u(1);
    }
    if (maxSubLayersMinus1 > 0) {
      for (let i = maxSubLayersMinus1; i < 8; i++) bits.u(2);
    }
    for (let i = 0; i < maxSubLayersMinus1; i++) {
      if (profilePresent[i]) {
        bits.u(88);
      }
      if (levelPresent[i]) bits.u(8);
    }
    return { profileSpace, tierFlag, profileIdc, compatibilityFlags, constraintFlags, levelIdc };
  }
  function constraintHex(flags) {
    const bytes = [];
    for (let i = 5; i >= 0; i--) bytes.push(Number(flags >> BigInt(i * 8) & 0xffn));
    while (bytes.length > 1 && bytes[bytes.length - 1] === 0) bytes.pop();
    return bytes.map((b) => b.toString(16).padStart(2, "0")).join("").toUpperCase();
  }

  // src/rtp/h264.js
  init_buffer_shim();
  var NAL_STAP_A = 24;
  var NAL_FU_A = 28;
  function createH264Depayloader() {
    let fragments = [];
    let fuIndicator = 0;
    let fuType = 0;
    function resetFu() {
      fragments = [];
      fuIndicator = 0;
      fuType = 0;
    }
    return function depay(payload) {
      if (!payload.length) return [];
      const nalType2 = payload[0] & 31;
      if (nalType2 > 0 && nalType2 < 24) {
        resetFu();
        return [import_buffer.Buffer.from(payload)];
      }
      if (nalType2 === NAL_STAP_A) {
        resetFu();
        return splitStapA(payload);
      }
      if (nalType2 === NAL_FU_A) {
        if (payload.length < 2) return [];
        const indicator = payload[0];
        const header = payload[1];
        const start = Boolean(header & 128);
        const end = Boolean(header & 64);
        const type = header & 31;
        if (start) {
          fragments = [payload.subarray(2)];
          fuIndicator = indicator;
          fuType = type;
        } else if (fragments.length) {
          fragments.push(payload.subarray(2));
        } else {
          return [];
        }
        if (!end) return [];
        const nalu = import_buffer.Buffer.concat([
          import_buffer.Buffer.from([fuIndicator & 224 | fuType]),
          ...fragments
        ]);
        resetFu();
        return [nalu];
      }
      resetFu();
      return [];
    };
  }
  function splitStapA(payload) {
    const nals = [];
    let offset = 1;
    while (offset + 2 <= payload.length) {
      const size = payload.readUInt16BE(offset);
      offset += 2;
      if (offset + size > payload.length) break;
      nals.push(import_buffer.Buffer.from(payload.subarray(offset, offset + size)));
      offset += size;
    }
    return nals;
  }
  function nalType(nal) {
    return nal[0] & 31;
  }
  function isIdr(nal) {
    return nalType(nal) === 5;
  }
  function isSps(nal) {
    return nalType(nal) === 7;
  }
  function isPps(nal) {
    return nalType(nal) === 8;
  }
  function isVcl(nal) {
    const type = nalType(nal);
    return type >= 1 && type <= 5;
  }

  // src/rtp/h265.js
  init_buffer_shim();
  var HEVC_VPS = 32;
  var HEVC_SPS = 33;
  var HEVC_PPS = 34;
  var HEVC_FU = 49;
  var HEVC_AP = 48;
  function hevcNalType(nal) {
    if (!nal?.length) return -1;
    return nal[0] >> 1 & 63;
  }
  function isHevcKeyframe(nal) {
    const type = hevcNalType(nal);
    return type >= 16 && type <= 21;
  }
  function isHevcVps(nal) {
    return hevcNalType(nal) === HEVC_VPS;
  }
  function isHevcSps(nal) {
    return hevcNalType(nal) === HEVC_SPS;
  }
  function isHevcPps(nal) {
    return hevcNalType(nal) === HEVC_PPS;
  }
  function isHevcVcl(nal) {
    const type = hevcNalType(nal);
    return type >= 0 && type <= 31;
  }
  function createH265Depayloader({ donl = false } = {}) {
    let fragments = [];
    let payloadHdr = null;
    function resetFu() {
      fragments = [];
      payloadHdr = null;
    }
    return function depay(payload) {
      if (payload.length < 2) return [];
      const type = payload[0] >> 1 & 63;
      if (type === HEVC_FU) {
        let offset = 2;
        if (donl) offset += 2;
        if (payload.length <= offset) return [];
        const fuHeader = payload[offset];
        const start = Boolean(fuHeader & 128);
        const end = Boolean(fuHeader & 64);
        const fuType = fuHeader & 63;
        const body = payload.subarray(offset + 1);
        if (start) {
          payloadHdr = import_buffer.Buffer.from([payload[0] & 129 | fuType << 1, payload[1]]);
          fragments = [body];
        } else if (fragments.length) {
          fragments.push(body);
        } else {
          return [];
        }
        if (!end) return [];
        const nalu = import_buffer.Buffer.concat([payloadHdr, ...fragments]);
        resetFu();
        return [nalu];
      }
      resetFu();
      if (type === HEVC_AP) {
        return splitAggregation(payload, donl);
      }
      if (type < 48) {
        return [import_buffer.Buffer.from(payload)];
      }
      return [];
    };
  }
  function splitAggregation(payload, donl) {
    const nals = [];
    let offset = 2 + (donl ? 2 : 0);
    while (offset + 2 <= payload.length) {
      const size = payload.readUInt16BE(offset);
      offset += 2;
      if (offset + size > payload.length) break;
      nals.push(import_buffer.Buffer.from(payload.subarray(offset, offset + size)));
      offset += size;
    }
    return nals;
  }

  // src/mux/fmp4.js
  var _Fmp4Muxer_instances, configure_fn;
  var Fmp4Muxer = class {
    constructor({ family = "h264", vps, sps, pps, timescale = 9e4 } = {}) {
      __privateAdd(this, _Fmp4Muxer_instances);
      this.family = family;
      this.timescale = timescale;
      this.sequence = 1;
      this.baseTime = 0n;
      this.lastTimestamp = null;
      this.defaultDuration = 3e3;
      this.ready = false;
      this.vps = vps || null;
      this.sps = sps || null;
      this.pps = pps || null;
      this.info = null;
      this.decoderConfig = null;
      if (sps && pps && (family === "h264" || vps || family === "h265")) {
        __privateMethod(this, _Fmp4Muxer_instances, configure_fn).call(this);
      }
    }
    updateParameterSets(nals) {
      let changed = false;
      for (const nal of nals) {
        if (this.family === "h265") {
          if (isHevcVps(nal) && !sameNal(nal, this.vps)) {
            this.vps = nal;
            changed = true;
          }
          if (isHevcSps(nal) && !sameNal(nal, this.sps)) {
            this.sps = nal;
            changed = true;
          }
          if (isHevcPps(nal) && !sameNal(nal, this.pps)) {
            this.pps = nal;
            changed = true;
          }
        } else {
          if (isSps(nal) && !sameNal(nal, this.sps)) {
            this.sps = nal;
            changed = true;
          }
          if (isPps(nal) && !sameNal(nal, this.pps)) {
            this.pps = nal;
            changed = true;
          }
        }
      }
      if ((changed || !this.ready) && this.sps && this.pps) {
        const before = this.ready;
        __privateMethod(this, _Fmp4Muxer_instances, configure_fn).call(this);
        return this.ready && (!before || changed);
      }
      return false;
    }
    initSegment() {
      if (!this.ready) throw new Error("Parameter sets required before init segment");
      const { width, height, codec } = this.info;
      const hevc = this.family === "h265";
      const brands = hevc ? [str("iso5"), u32(512), str("iso5"), str("iso6"), str("mp41"), str("hvc1")] : [str("iso5"), u32(512), str("iso5"), str("iso6"), str("mp41")];
      return import_buffer.Buffer.concat([
        box("ftyp", ...brands),
        box(
          "moov",
          fullBox("mvhd", 0, 0, u32(0), u32(0), u32(this.timescale), u32(0), u32(65536), u16(256), u16(0), u32(0), u32(0), matrix(), zeros(24), u32(2)),
          box(
            "trak",
            fullBox(
              "tkhd",
              0,
              7,
              u32(0),
              u32(0),
              u32(1),
              u32(0),
              u32(0),
              u32(0),
              u32(0),
              u16(0),
              u16(0),
              u16(0),
              u16(0),
              matrix(),
              u32(width << 16),
              u32(height << 16)
            ),
            box(
              "mdia",
              fullBox("mdhd", 0, 0, u32(0), u32(0), u32(this.timescale), u32(0), u16(21956), u16(0)),
              fullBox("hdlr", 0, 0, u32(0), str("vide"), u32(0), u32(0), u32(0), str("Havi Video\0")),
              box(
                "minf",
                fullBox("vmhd", 0, 1, u16(0), u16(0), u16(0), u16(0)),
                box("dinf", fullBox("dref", 0, 0, u32(1), fullBox("url ", 0, 1))),
                box(
                  "stbl",
                  fullBox(
                    "stsd",
                    0,
                    0,
                    u32(1),
                    hevc ? visualSampleEntry("hvc1", width, height, box("hvcC", this.decoderConfig)) : visualSampleEntry("avc1", width, height, box("avcC", this.decoderConfig))
                  ),
                  fullBox("stts", 0, 0, u32(0)),
                  fullBox("stsc", 0, 0, u32(0)),
                  fullBox("stsz", 0, 0, u32(0), u32(0)),
                  fullBox("stco", 0, 0, u32(0))
                )
              )
            )
          ),
          box("mvex", fullBox("trex", 0, 0, u32(1), u32(1), u32(0), u32(0), u32(0)))
        )
      ]);
    }
    mediaFragment(accessUnit) {
      if (!this.ready) return null;
      const sample = this.family === "h265" ? toHvccSample(accessUnit.nals, this.vps, this.sps, this.pps, accessUnit.keyframe) : toAvccSample(accessUnit.nals, this.sps, this.pps, accessUnit.keyframe);
      if (!sample) return null;
      let duration = this.defaultDuration;
      if (this.lastTimestamp !== null) {
        duration = unsignedDelta(accessUnit.timestamp, this.lastTimestamp);
        if (duration <= 0 || duration > this.timescale) duration = this.defaultDuration;
        else this.defaultDuration = duration;
      }
      this.lastTimestamp = accessUnit.timestamp;
      const decodeTime = this.baseTime;
      this.baseTime += BigInt(duration);
      const sampleFlags = accessUnit.keyframe ? 33554432 : 16842752;
      const trunFlags = 1 | 256 | 512 | 1024;
      const mfhd = fullBox("mfhd", 0, 0, u32(this.sequence++));
      const tfhd = fullBox("tfhd", 0, 131072, u32(1));
      const tfdt = fullBox("tfdt", 1, 0, u64(decodeTime));
      const trun = fullBox(
        "trun",
        0,
        trunFlags,
        u32(1),
        u32(0),
        u32(duration),
        u32(sample.length),
        u32(sampleFlags)
      );
      const moofSize = 8 + mfhd.length + 8 + tfhd.length + tfdt.length + trun.length;
      trun.writeUInt32BE(moofSize + 8, 16);
      const moof = box("moof", mfhd, box("traf", tfhd, tfdt, trun));
      return import_buffer.Buffer.concat([moof, box("mdat", sample)]);
    }
  };
  _Fmp4Muxer_instances = new WeakSet();
  configure_fn = function() {
    if (this.family === "h265") {
      if (!this.sps || !this.pps) return;
      const { hvcC, info } = buildHvcC({ vps: this.vps, sps: this.sps, pps: this.pps });
      this.decoderConfig = hvcC;
      this.info = { ...info, family: "h265" };
    } else {
      if (!this.sps || !this.pps) return;
      const { avcC, info } = buildAvcC(this.sps, this.pps);
      this.decoderConfig = avcC;
      this.info = { ...info, family: "h264" };
    }
    this.ready = true;
  };
  function toAvccSample(nals, sps, pps, keyframe) {
    const pieces = [];
    const filtered = nals.filter((nal) => nal.length && (nal[0] & 31) !== 12);
    const hasSps = filtered.some(isSps);
    const hasPps = filtered.some(isPps);
    if (keyframe && sps && !hasSps) pieces.push(lengthPrefixed(sps));
    if (keyframe && pps && !hasPps) pieces.push(lengthPrefixed(pps));
    let vcl = 0;
    for (const nal of filtered) {
      if (isVcl(nal) || isSps(nal) || isPps(nal) || (nal[0] & 31) === 6) {
        pieces.push(lengthPrefixed(nal));
        if (isVcl(nal)) vcl++;
      }
    }
    if (!vcl) return null;
    return import_buffer.Buffer.concat(pieces);
  }
  function toHvccSample(nals, vps, sps, pps, keyframe) {
    const pieces = [];
    const filtered = nals.filter((nal) => nal.length >= 2);
    if (keyframe && vps && !filtered.some(isHevcVps)) pieces.push(lengthPrefixed(vps));
    if (keyframe && sps && !filtered.some(isHevcSps)) pieces.push(lengthPrefixed(sps));
    if (keyframe && pps && !filtered.some(isHevcPps)) pieces.push(lengthPrefixed(pps));
    let vcl = 0;
    for (const nal of filtered) {
      const type = nal[0] >> 1 & 63;
      if (type === 35 || type === 38) continue;
      if (isHevcVcl(nal) || isHevcVps(nal) || isHevcSps(nal) || isHevcPps(nal) || type === 39 || type === 40) {
        pieces.push(lengthPrefixed(nal));
        if (isHevcVcl(nal)) vcl++;
      }
    }
    if (!vcl) return null;
    return import_buffer.Buffer.concat(pieces);
  }
  function lengthPrefixed(nal) {
    const header = import_buffer.Buffer.alloc(4);
    header.writeUInt32BE(nal.length);
    return import_buffer.Buffer.concat([header, nal]);
  }
  function visualSampleEntry(type, width, height, configBox) {
    return box(
      type,
      zeros(6),
      u16(1),
      u16(0),
      u16(0),
      u32(0),
      u32(0),
      u32(0),
      u16(width),
      u16(height),
      u32(4718592),
      u32(4718592),
      u32(0),
      u16(1),
      compressorName(),
      u16(24),
      import_buffer.Buffer.from([255, 255]),
      configBox
    );
  }
  function box(type, ...parts) {
    const body = import_buffer.Buffer.concat(parts.flat().filter(Boolean));
    const header = import_buffer.Buffer.alloc(8);
    header.writeUInt32BE(8 + body.length, 0);
    header.write(type, 4, "ascii");
    return import_buffer.Buffer.concat([header, body]);
  }
  function fullBox(type, version, flags, ...parts) {
    const vf = import_buffer.Buffer.alloc(4);
    vf.writeUInt32BE((version & 255) << 24 | flags & 16777215);
    return box(type, vf, ...parts);
  }
  function str(value) {
    return import_buffer.Buffer.from(value, "ascii");
  }
  function u16(value) {
    const b = import_buffer.Buffer.alloc(2);
    b.writeUInt16BE(value);
    return b;
  }
  function u32(value) {
    const b = import_buffer.Buffer.alloc(4);
    b.writeUInt32BE(value >>> 0);
    return b;
  }
  function u64(value) {
    const b = import_buffer.Buffer.alloc(8);
    b.writeBigUInt64BE(BigInt(value));
    return b;
  }
  function zeros(n) {
    return import_buffer.Buffer.alloc(n);
  }
  function matrix() {
    return import_buffer.Buffer.concat([
      u32(65536),
      u32(0),
      u32(0),
      u32(0),
      u32(65536),
      u32(0),
      u32(0),
      u32(0),
      u32(1073741824)
    ]);
  }
  function compressorName() {
    const b = import_buffer.Buffer.alloc(32);
    const name = "Havi-RTSP";
    b[0] = name.length;
    b.write(name, 1, "ascii");
    return b;
  }
  function unsignedDelta(now, prev) {
    return now - prev >>> 0;
  }

  // src/mux/fmp4-audio.js
  init_buffer_shim();
  var AacFmp4Muxer = class {
    constructor({ sampleRate = 44100, channels = 1, asc } = {}) {
      this.sampleRate = sampleRate;
      this.channels = channels;
      this.timescale = sampleRate;
      this.asc = asc && asc.length ? import_buffer.Buffer.from(asc) : audioSpecificConfig(sampleRate, channels);
      this.codec = "mp4a.40.2";
      this.sequence = 1;
      this.baseTime = 0n;
      this.frameDuration = 1024;
    }
    initSegment() {
      const rate = this.sampleRate;
      const ch = this.channels;
      return import_buffer.Buffer.concat([
        box2("ftyp", str2("iso5"), u322(512), str2("iso5"), str2("iso6"), str2("mp41")),
        box2(
          "moov",
          fullBox2("mvhd", 0, 0, u322(0), u322(0), u322(this.timescale), u322(0), u322(65536), u162(256), u162(0), u322(0), u322(0), matrix2(), zeros2(24), u322(2)),
          box2(
            "trak",
            fullBox2(
              "tkhd",
              0,
              7,
              u322(0),
              u322(0),
              u322(1),
              u322(0),
              u322(0),
              u322(0),
              u322(0),
              u162(0),
              u162(0),
              u162(256),
              u162(0),
              matrix2(),
              u322(0),
              u322(0)
            ),
            box2(
              "mdia",
              fullBox2("mdhd", 0, 0, u322(0), u322(0), u322(this.timescale), u322(0), u162(21956), u162(0)),
              fullBox2("hdlr", 0, 0, u322(0), str2("soun"), u322(0), u322(0), u322(0), str2("Havi Audio\0")),
              box2(
                "minf",
                fullBox2("smhd", 0, 0, u162(0), u162(0)),
                box2("dinf", fullBox2("dref", 0, 0, u322(1), fullBox2("url ", 0, 1))),
                box2(
                  "stbl",
                  fullBox2("stsd", 0, 0, u322(1), audioSampleEntry(rate, ch, this.asc)),
                  fullBox2("stts", 0, 0, u322(0)),
                  fullBox2("stsc", 0, 0, u322(0)),
                  fullBox2("stsz", 0, 0, u322(0), u322(0)),
                  fullBox2("stco", 0, 0, u322(0))
                )
              )
            )
          ),
          box2("mvex", fullBox2("trex", 0, 0, u322(1), u322(1), u322(0), u322(0), u322(0)))
        )
      ]);
    }
    mediaFragment(payload, duration = this.frameDuration) {
      if (!payload?.length) return null;
      const sample = import_buffer.Buffer.from(payload);
      const decodeTime = this.baseTime;
      this.baseTime += BigInt(duration);
      const trunFlags = 1 | 256 | 512 | 1024;
      const mfhd = fullBox2("mfhd", 0, 0, u322(this.sequence++));
      const tfhd = fullBox2("tfhd", 0, 131072, u322(1));
      const tfdt = fullBox2("tfdt", 1, 0, u642(decodeTime));
      const trun = fullBox2(
        "trun",
        0,
        trunFlags,
        u322(1),
        u322(0),
        u322(duration),
        u322(sample.length),
        u322(33554432)
      );
      const moofSize = 8 + mfhd.length + 8 + tfhd.length + tfdt.length + trun.length;
      trun.writeUInt32BE(moofSize + 8, 16);
      return import_buffer.Buffer.concat([box2("moof", mfhd, box2("traf", tfhd, tfdt, trun)), box2("mdat", sample)]);
    }
  };
  function audioSpecificConfig(sampleRate, channels) {
    const table = [96e3, 88200, 64e3, 48e3, 44100, 32e3, 24e3, 22050, 16e3, 12e3, 11025, 8e3];
    const freq = table.indexOf(sampleRate);
    const fi = freq >= 0 ? freq : 4;
    const ch = Math.max(1, Math.min(channels || 1, 7));
    const b1 = 2 << 3 | fi >> 1;
    const b2 = (fi & 1) << 7 | ch << 3;
    return import_buffer.Buffer.from([b1, b2]);
  }
  function audioSampleEntry(sampleRate, channels, asc) {
    return box2(
      "mp4a",
      zeros2(6),
      u162(1),
      zeros2(8),
      u162(channels),
      u162(16),
      u162(0),
      u162(0),
      u322((sampleRate & 65535) << 16),
      esdsBox(asc)
    );
  }
  function esdsBox(asc) {
    const dsi = desc(5, import_buffer.Buffer.from(asc));
    const decoder = desc(4, import_buffer.Buffer.concat([
      import_buffer.Buffer.from([64, 21]),
      import_buffer.Buffer.from([0, 1, 119]),
      u322(128e3),
      u322(64e3),
      dsi
    ]));
    const sl = desc(6, import_buffer.Buffer.from([2]));
    const es = desc(3, import_buffer.Buffer.concat([u162(1), import_buffer.Buffer.from([0]), decoder, sl]));
    return fullBox2("esds", 0, 0, es);
  }
  function desc(tag, body) {
    return import_buffer.Buffer.concat([import_buffer.Buffer.from([tag, 128, 128, 128, body.length]), body]);
  }
  function box2(type, ...parts) {
    const body = import_buffer.Buffer.concat(parts.flat().filter(Boolean));
    const header = import_buffer.Buffer.alloc(8);
    header.writeUInt32BE(8 + body.length, 0);
    header.write(type, 4, "ascii");
    return import_buffer.Buffer.concat([header, body]);
  }
  function fullBox2(type, version, flags, ...parts) {
    const vf = import_buffer.Buffer.alloc(4);
    vf.writeUInt32BE((version & 255) << 24 | flags & 16777215);
    return box2(type, vf, ...parts);
  }
  function str2(value) {
    return import_buffer.Buffer.from(value, "ascii");
  }
  function u162(value) {
    const b = import_buffer.Buffer.alloc(2);
    b.writeUInt16BE(value);
    return b;
  }
  function u322(value) {
    const b = import_buffer.Buffer.alloc(4);
    b.writeUInt32BE(value >>> 0);
    return b;
  }
  function u642(value) {
    const b = import_buffer.Buffer.alloc(8);
    b.writeBigUInt64BE(BigInt(value));
    return b;
  }
  function zeros2(n) {
    return import_buffer.Buffer.alloc(n);
  }
  function matrix2() {
    return import_buffer.Buffer.concat([
      u322(65536),
      u322(0),
      u322(0),
      u322(0),
      u322(65536),
      u322(0),
      u322(0),
      u322(0),
      u322(1073741824)
    ]);
  }

  // src/rtsp/client.js
  init_buffer_shim();

  // src/transport/registry.js
  init_buffer_shim();
  var defaultConnect = null;
  function setDefaultTransport(connect) {
    defaultConnect = connect;
  }
  function getDefaultTransport() {
    return defaultConnect;
  }

  // src/rtp/packet.js
  init_buffer_shim();
  function parseRtp(packet) {
    if (packet.length < 12) return null;
    const b0 = packet[0];
    const b1 = packet[1];
    const version = b0 >> 6;
    if (version !== 2) return null;
    const padding = Boolean(b0 & 32);
    const extension = Boolean(b0 & 16);
    const csrcCount = b0 & 15;
    const marker = Boolean(b1 & 128);
    const payloadType = b1 & 127;
    const sequence = packet.readUInt16BE(2);
    const timestamp = packet.readUInt32BE(4);
    const ssrc = packet.readUInt32BE(8);
    let offset = 12 + csrcCount * 4;
    if (offset > packet.length) return null;
    if (extension) {
      if (offset + 4 > packet.length) return null;
      const extLen = packet.readUInt16BE(offset + 2);
      offset += 4 + extLen * 4;
      if (offset > packet.length) return null;
    }
    let end = packet.length;
    if (padding) {
      const pad = packet[packet.length - 1];
      end -= pad;
      if (end < offset) return null;
    }
    return {
      marker,
      payloadType,
      sequence,
      timestamp,
      ssrc,
      payload: packet.subarray(offset, end)
    };
  }

  // src/rtp/aac.js
  init_buffer_shim();
  function createAacDepayloader({ sizeLength = 13, indexLength = 3 } = {}) {
    const sizeBits = Number(sizeLength) || 0;
    const indexBits = Number(indexLength) || 0;
    return function depay(payload) {
      if (!payload?.length) return [];
      if (sizeBits <= 0) return [import_buffer.Buffer.from(payload)];
      if (payload.length < 2) return [];
      const headerBits = payload[0] << 8 | payload[1];
      const headerBytes = Math.ceil(headerBits / 8);
      const headerStart = 2;
      const body = payload.subarray(headerStart + headerBytes);
      if (!body.length) return [];
      const sizes = [];
      let bit = 0;
      while (bit + sizeBits <= headerBits) {
        sizes.push(readBits(payload, headerStart, bit, sizeBits));
        bit += sizeBits + indexBits;
      }
      if (!sizes.length) return [body];
      const aus = [];
      let offset = 0;
      for (const size of sizes) {
        if (size <= 0 || offset + size > body.length) break;
        aus.push(body.subarray(offset, offset + size));
        offset += size;
      }
      return aus;
    };
  }
  function readBits(buf, byteOffset, bitOffset, count) {
    let value = 0;
    for (let i = 0; i < count; i++) {
      const abs = byteOffset * 8 + bitOffset + i;
      const bit = buf[abs >> 3] >> 7 - (abs & 7) & 1;
      value = value << 1 | bit;
    }
    return value;
  }

  // src/rtsp/sdp.js
  init_buffer_shim();
  function parseSdp(text) {
    const lines = String(text).split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    const session = { attributes: {}, raw: text };
    const medias = [];
    let current = session;
    for (const line of lines) {
      const eq = line.indexOf("=");
      if (eq !== 1) continue;
      const type = line[0];
      const value = line.slice(2);
      if (type === "m") {
        const [kind, port, proto, ...fmts] = value.split(/\s+/);
        current = {
          kind,
          port: Number(port),
          proto,
          payloads: fmts,
          attributes: {},
          rtpmap: {},
          fmtp: {},
          control: null
        };
        medias.push(current);
        continue;
      }
      if (type === "a") {
        const colon = value.indexOf(":");
        const key = colon === -1 ? value : value.slice(0, colon);
        const val = colon === -1 ? true : value.slice(colon + 1);
        current.attributes[key] = val;
        if (key === "control") current.control = val;
        if (key === "rtpmap" && typeof val === "string") {
          const [pt, rest] = val.split(/\s+/);
          const [codec, clock, channels] = (rest || "").split("/");
          current.rtpmap[pt] = {
            codec: (codec || "").toUpperCase(),
            clock: Number(clock) || 0,
            channels: channels ? Number(channels) : void 0
          };
        }
        if (key === "fmtp" && typeof val === "string") {
          const space = val.indexOf(" ");
          const pt = space === -1 ? val : val.slice(0, space);
          const params = {};
          const body = space === -1 ? "" : val.slice(space + 1);
          for (const part of body.split(";")) {
            const trimmed = part.trim();
            if (!trimmed) continue;
            const eqIdx = trimmed.indexOf("=");
            if (eqIdx === -1) params[trimmed.toLowerCase()] = true;
            else params[trimmed.slice(0, eqIdx).trim().toLowerCase()] = trimmed.slice(eqIdx + 1).trim();
          }
          current.fmtp[pt] = params;
        }
        continue;
      }
      if (type === "c") current.connection = value;
      if (type === "s") session.name = value;
      if (type === "o") session.origin = value;
    }
    return { session, medias };
  }
  function codecFamily(name) {
    const codec = String(name || "").toUpperCase();
    if (codec === "H264" || codec === "AVC") return "h264";
    if (codec === "H265" || codec === "HEVC" || codec === "HVC1" || codec === "HEV1") return "h265";
    if (codec === "JPEG" || codec === "MJPEG" || codec === "MPJPEG") return "jpeg";
    return "unknown";
  }
  function audioFamily(name) {
    const codec = String(name || "").toUpperCase();
    if (codec === "MPEG4-GENERIC" || codec === "MP4A-LATM" || codec === "AAC") return "aac";
    if (codec === "OPUS") return "opus";
    if (codec === "PCMU" || codec === "PCMA" || codec.startsWith("G7") || codec === "L16") return "legacy";
    return "unknown";
  }
  function pickAudioTrack(sdp) {
    if (!sdp?.medias) return null;
    for (const media of sdp.medias) {
      if (media.kind !== "audio") continue;
      for (const pt of media.payloads) {
        const map = media.rtpmap[pt] || { codec: "UNKNOWN", clock: 8e3 };
        const fmtp = media.fmtp[pt] || {};
        return {
          payloadType: Number(pt),
          clockRate: map.clock || 8e3,
          channels: map.channels || 1,
          sdpCodec: map.codec,
          family: audioFamily(map.codec),
          control: media.control,
          sizeLength: Number(fmtp.sizelength || 13),
          indexLength: Number(fmtp.indexlength || 3),
          config: typeof fmtp.config === "string" ? fmtp.config : null,
          fmtp
        };
      }
    }
    return null;
  }
  function pickVideoTrack(sdp) {
    for (const media of sdp.medias) {
      if (media.kind !== "video") continue;
      for (const pt of media.payloads) {
        const map = media.rtpmap[pt] || (Number(pt) === 26 ? { codec: "JPEG", clock: 9e4 } : { codec: "UNKNOWN", clock: 9e4 });
        const fmtp = media.fmtp[pt] || {};
        const family = codecFamily(map.codec);
        const b64 = (key) => {
          const value = fmtp[key];
          if (!value || value === true) return null;
          try {
            return import_buffer.Buffer.from(String(value), "base64");
          } catch {
            return null;
          }
        };
        const sets = String(fmtp["sprop-parameter-sets"] || "").split(",").map((s) => s.trim()).filter(Boolean);
        return {
          media,
          payloadType: Number(pt),
          clockRate: map.clock || 9e4,
          family,
          sdpCodec: map.codec,
          packetizationMode: Number(fmtp["packetization-mode"] || 0),
          profileLevelId: String(fmtp["profile-level-id"] || fmtp["profile-id"] || ""),
          donl: Number(fmtp["sprop-max-don-diff"] || 0) > 0,
          sps: family === "h264" && sets[0] ? import_buffer.Buffer.from(sets[0], "base64") : b64("sprop-sps"),
          pps: family === "h264" && sets[1] ? import_buffer.Buffer.from(sets[1], "base64") : b64("sprop-pps"),
          vps: b64("sprop-vps"),
          control: media.control,
          fmtp
        };
      }
    }
    return null;
  }
  function resolveControlUrl(contentBase, requestUrl, control) {
    if (!control) return requestUrl.replace(/\/?$/, "/");
    if (/^rtsp:\/\//i.test(control)) return control;
    const base = (contentBase || requestUrl).replace(/\/?$/, "/");
    if (control === "*") return base;
    return new URL(control, base).toString();
  }

  // src/rtp/jpeg.js
  init_buffer_shim();
  var LUMA_Q = [
    16,
    11,
    12,
    14,
    12,
    10,
    16,
    14,
    13,
    14,
    18,
    17,
    16,
    19,
    24,
    40,
    26,
    24,
    22,
    22,
    24,
    49,
    35,
    37,
    29,
    40,
    58,
    51,
    61,
    60,
    57,
    51,
    56,
    55,
    64,
    72,
    92,
    78,
    64,
    68,
    87,
    69,
    55,
    56,
    80,
    109,
    81,
    87,
    95,
    98,
    103,
    104,
    103,
    62,
    77,
    113,
    121,
    112,
    100,
    120,
    92,
    101,
    103,
    99
  ];
  var CHROMA_Q = [
    17,
    18,
    18,
    24,
    21,
    24,
    47,
    26,
    26,
    47,
    99,
    66,
    56,
    66,
    99,
    99,
    99,
    99,
    99,
    99,
    99,
    99,
    99,
    99,
    99,
    99,
    99,
    99,
    99,
    99,
    99,
    99,
    99,
    99,
    99,
    99,
    99,
    99,
    99,
    99,
    99,
    99,
    99,
    99,
    99,
    99,
    99,
    99,
    99,
    99,
    99,
    99,
    99,
    99,
    99,
    99,
    99,
    99,
    99,
    99,
    99,
    99,
    99,
    99
  ];
  var LUM_DC_LEN = [0, 1, 5, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0];
  var LUM_DC_SYM = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
  var LUM_AC_LEN = [0, 2, 1, 3, 3, 2, 4, 3, 5, 5, 4, 4, 0, 0, 1, 125];
  var LUM_AC_SYM = [
    1,
    2,
    3,
    0,
    4,
    17,
    5,
    18,
    33,
    49,
    65,
    6,
    19,
    81,
    97,
    7,
    34,
    113,
    20,
    50,
    129,
    145,
    161,
    8,
    35,
    66,
    177,
    193,
    21,
    82,
    209,
    240,
    36,
    51,
    98,
    114,
    130,
    9,
    10,
    22,
    23,
    24,
    25,
    26,
    37,
    38,
    39,
    40,
    41,
    42,
    52,
    53,
    54,
    55,
    56,
    57,
    58,
    67,
    68,
    69,
    70,
    71,
    72,
    73,
    74,
    83,
    84,
    85,
    86,
    87,
    88,
    89,
    90,
    99,
    100,
    101,
    102,
    103,
    104,
    105,
    106,
    115,
    116,
    117,
    118,
    119,
    120,
    121,
    122,
    131,
    132,
    133,
    134,
    135,
    136,
    137,
    138,
    146,
    147,
    148,
    149,
    150,
    151,
    152,
    153,
    154,
    162,
    163,
    164,
    165,
    166,
    167,
    168,
    169,
    170,
    178,
    179,
    180,
    181,
    182,
    183,
    184,
    185,
    186,
    194,
    195,
    196,
    197,
    198,
    199,
    200,
    201,
    202,
    210,
    211,
    212,
    213,
    214,
    215,
    216,
    217,
    218,
    225,
    226,
    227,
    228,
    229,
    230,
    231,
    232,
    233,
    234,
    241,
    242,
    243,
    244,
    245,
    246,
    247,
    248,
    249,
    250
  ];
  var CH_DC_LEN = [0, 3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0];
  var CH_DC_SYM = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
  var CH_AC_LEN = [0, 2, 1, 2, 4, 4, 3, 4, 7, 5, 4, 4, 0, 1, 2, 119];
  var CH_AC_SYM = [
    0,
    1,
    2,
    3,
    17,
    4,
    5,
    33,
    49,
    6,
    18,
    65,
    81,
    7,
    97,
    113,
    19,
    34,
    50,
    129,
    8,
    20,
    66,
    145,
    161,
    177,
    193,
    9,
    35,
    51,
    82,
    240,
    21,
    98,
    114,
    209,
    10,
    22,
    36,
    52,
    225,
    37,
    241,
    23,
    24,
    25,
    26,
    38,
    39,
    40,
    41,
    42,
    53,
    54,
    55,
    56,
    57,
    58,
    67,
    68,
    69,
    70,
    71,
    72,
    73,
    74,
    83,
    84,
    85,
    86,
    87,
    88,
    89,
    90,
    99,
    100,
    101,
    102,
    103,
    104,
    105,
    106,
    115,
    116,
    117,
    118,
    119,
    120,
    121,
    122,
    130,
    131,
    132,
    133,
    134,
    135,
    136,
    137,
    138,
    146,
    147,
    148,
    149,
    150,
    151,
    152,
    153,
    154,
    162,
    163,
    164,
    165,
    166,
    167,
    168,
    169,
    170,
    178,
    179,
    180,
    181,
    182,
    183,
    184,
    185,
    186,
    194,
    195,
    196,
    197,
    198,
    199,
    200,
    201,
    202,
    210,
    211,
    212,
    213,
    214,
    215,
    216,
    217,
    218,
    226,
    227,
    228,
    229,
    230,
    231,
    232,
    233,
    234,
    242,
    243,
    244,
    245,
    246,
    247,
    248,
    249,
    250
  ];
  function createJpegDepayloader() {
    let raw = [];
    let rawTs = null;
    let rfc = null;
    return function depay(rtp) {
      const payload = rtp?.payload;
      if (!payload?.length) return null;
      if (raw.length || payload[0] === 255 && payload[1] === 216) {
        rfc = null;
        return depayRaw(rtp, payload);
      }
      return depayRfc(rtp, payload);
    };
    function depayRaw(rtp, payload) {
      if (rawTs !== null && rawTs !== rtp.timestamp && raw.length) {
        const previous = finishRaw();
        rawTs = rtp.timestamp;
        raw = [payload];
        if (rtp.marker || hasEoi(payload)) {
          const current = finishRaw();
          return current || previous;
        }
        return previous;
      }
      rawTs = rtp.timestamp;
      raw.push(payload);
      if (rtp.marker || hasEoi(payload)) return finishRaw();
      return null;
    }
    function finishRaw() {
      const data = import_buffer.Buffer.concat(raw);
      raw = [];
      rawTs = null;
      return toFrame(data);
    }
    function depayRfc(rtp, payload) {
      if (payload.length < 8) return null;
      const fragmentOffset = payload[1] << 16 | payload[2] << 8 | payload[3];
      const type = payload[4];
      const q = payload[5];
      const width = payload[6] * 8;
      const height = payload[7] * 8;
      let o = 8;
      let dri = 0;
      if (type >= 64) {
        if (payload.length < o + 4) return null;
        dri = payload[o] << 8 | payload[o + 1];
        o += 4;
      }
      let qTable = null;
      if (fragmentOffset === 0 && q > 127) {
        if (payload.length < o + 4) return null;
        const length = payload[o + 2] << 8 | payload[o + 3];
        o += 4;
        if (payload.length < o + length) return null;
        qTable = import_buffer.Buffer.from(payload.subarray(o, o + length));
        o += length;
      }
      const scan = payload.subarray(o);
      if (fragmentOffset === 0) {
        rfc = { type, q, width, height, dri, qTable, parts: [scan], next: scan.length };
      } else if (!rfc || fragmentOffset !== rfc.next) {
        rfc = null;
        return null;
      } else {
        rfc.parts.push(scan);
        rfc.next += scan.length;
      }
      if (!rtp.marker || !rfc) return null;
      const scanData = import_buffer.Buffer.concat(rfc.parts);
      const jpeg = wrapRfcJpeg(rfc, scanData);
      rfc = null;
      return toFrame(jpeg);
    }
  }
  function wrapRfcJpeg(meta, scan) {
    const type = meta.type & 63;
    const tables = quantTables(meta.q, meta.qTable);
    const header = jpegHeader({
      type,
      width: meta.width,
      height: meta.height,
      dri: meta.dri,
      luma: tables.luma,
      chroma: tables.chroma
    });
    const end = hasEoi(scan) ? scan : import_buffer.Buffer.concat([scan, import_buffer.Buffer.from([255, 217])]);
    return import_buffer.Buffer.concat([header, end]);
  }
  function quantTables(q, supplied) {
    if (supplied && supplied.length >= 64) {
      const luma = supplied.subarray(0, 64);
      const chroma = supplied.length >= 128 ? supplied.subarray(64, 128) : luma;
      return { luma: import_buffer.Buffer.from(luma), chroma: import_buffer.Buffer.from(chroma) };
    }
    let factor = q;
    if (factor < 1) factor = 1;
    if (factor > 99) factor = 99;
    const scale = factor < 50 ? Math.floor(5e3 / factor) : 200 - factor * 2;
    const scaleTable = (base) => {
      const out = import_buffer.Buffer.alloc(64);
      for (let i = 0; i < 64; i++) {
        const v = Math.floor((base[i] * scale + 50) / 100);
        out[i] = v < 1 ? 1 : v > 255 ? 255 : v;
      }
      return out;
    };
    return { luma: scaleTable(LUMA_Q), chroma: scaleTable(CHROMA_Q) };
  }
  function jpegHeader({ type, width, height, dri, luma, chroma }) {
    const parts = [import_buffer.Buffer.from([255, 216])];
    parts.push(dqt(0, luma), dqt(1, chroma));
    if (dri) parts.push(driBox(dri));
    parts.push(sof(type, width, height));
    parts.push(dht(0, LUM_DC_LEN, LUM_DC_SYM));
    parts.push(dht(16, LUM_AC_LEN, LUM_AC_SYM));
    parts.push(dht(1, CH_DC_LEN, CH_DC_SYM));
    parts.push(dht(17, CH_AC_LEN, CH_AC_SYM));
    parts.push(sos());
    return import_buffer.Buffer.concat(parts);
  }
  function dqt(id, table) {
    const body = import_buffer.Buffer.alloc(67);
    body[0] = 255;
    body[1] = 219;
    body.writeUInt16BE(67 - 2, 2);
    body[4] = id;
    table.copy(body, 5);
    return body;
  }
  function driBox(dri) {
    const b = import_buffer.Buffer.alloc(6);
    b[0] = 255;
    b[1] = 221;
    b.writeUInt16BE(4, 2);
    b.writeUInt16BE(dri, 4);
    return b;
  }
  function sof(type, width, height) {
    const hv = type === 0 ? 33 : 34;
    const b = import_buffer.Buffer.alloc(19);
    b[0] = 255;
    b[1] = 192;
    b.writeUInt16BE(17, 2);
    b[4] = 8;
    b.writeUInt16BE(height, 5);
    b.writeUInt16BE(width, 7);
    b[9] = 3;
    b[10] = 1;
    b[11] = hv;
    b[12] = 0;
    b[13] = 2;
    b[14] = 17;
    b[15] = 1;
    b[16] = 3;
    b[17] = 17;
    b[18] = 1;
    return b;
  }
  function dht(cls, lengths, symbols) {
    const body = import_buffer.Buffer.alloc(5 + 16 + symbols.length);
    body[0] = 255;
    body[1] = 196;
    body.writeUInt16BE(body.length - 2, 2);
    body[4] = cls;
    import_buffer.Buffer.from(lengths).copy(body, 5);
    import_buffer.Buffer.from(symbols).copy(body, 21);
    return body;
  }
  function sos() {
    return import_buffer.Buffer.from([
      255,
      218,
      0,
      12,
      3,
      1,
      0,
      2,
      17,
      3,
      17,
      0,
      63,
      0
    ]);
  }
  function hasEoi(buf) {
    return buf.length >= 2 && buf[buf.length - 2] === 255 && buf[buf.length - 1] === 217;
  }
  function jpegSize(buf) {
    if (!buf || buf.length < 10) return { width: 0, height: 0 };
    let i = 2;
    while (i + 8 < buf.length) {
      if (buf[i] !== 255) break;
      const marker = buf[i + 1];
      if (marker === 216 || marker === 217) {
        i += 2;
        continue;
      }
      const len = buf[i + 2] << 8 | buf[i + 3];
      if (marker === 192 || marker === 194) {
        return {
          height: buf[i + 5] << 8 | buf[i + 6],
          width: buf[i + 7] << 8 | buf[i + 8]
        };
      }
      i += 2 + len;
    }
    return { width: 0, height: 0 };
  }
  function toFrame(data) {
    if (!data?.length || data[0] !== 255 || data[1] !== 216) return null;
    const size = jpegSize(data);
    return { data, width: size.width, height: size.height };
  }

  // src/rtsp/auth.js
  init_buffer_shim();

  // src/util/md5.js
  init_buffer_shim();
  function md5Hex(input) {
    const bytes = typeof input === "string" ? new TextEncoder().encode(input) : input;
    const digest = md5(bytes);
    let hex = "";
    for (const b of digest) hex += b.toString(16).padStart(2, "0");
    return hex;
  }
  function randomHex(byteLength = 8) {
    const out = new Uint8Array(byteLength);
    if (globalThis.crypto?.getRandomValues) globalThis.crypto.getRandomValues(out);
    else for (let i = 0; i < byteLength; i++) out[i] = Math.floor(Math.random() * 256);
    let hex = "";
    for (const b of out) hex += b.toString(16).padStart(2, "0");
    return hex;
  }
  var S = [
    7,
    12,
    17,
    22,
    7,
    12,
    17,
    22,
    7,
    12,
    17,
    22,
    7,
    12,
    17,
    22,
    5,
    9,
    14,
    20,
    5,
    9,
    14,
    20,
    5,
    9,
    14,
    20,
    5,
    9,
    14,
    20,
    4,
    11,
    16,
    23,
    4,
    11,
    16,
    23,
    4,
    11,
    16,
    23,
    4,
    11,
    16,
    23,
    6,
    10,
    15,
    21,
    6,
    10,
    15,
    21,
    6,
    10,
    15,
    21,
    6,
    10,
    15,
    21
  ];
  var K = new Uint32Array(64);
  for (let i = 0; i < 64; i++) K[i] = Math.floor(Math.abs(Math.sin(i + 1)) * 2 ** 32) >>> 0;
  function md5(bytes) {
    const bitLen = bytes.length * 8;
    const padded = new Uint8Array((bytes.length + 8 >> 6 << 6) + 64);
    padded.set(bytes);
    padded[bytes.length] = 128;
    const view = new DataView(padded.buffer);
    view.setUint32(padded.length - 8, bitLen >>> 0, true);
    view.setUint32(padded.length - 4, Math.floor(bitLen / 2 ** 32), true);
    let a0 = 1732584193;
    let b0 = 4023233417;
    let c0 = 2562383102;
    let d0 = 271733878;
    const M = new Uint32Array(16);
    for (let off = 0; off < padded.length; off += 64) {
      for (let i = 0; i < 16; i++) M[i] = view.getUint32(off + i * 4, true);
      let A = a0;
      let B = b0;
      let C = c0;
      let D = d0;
      for (let i = 0; i < 64; i++) {
        let F;
        let g;
        if (i < 16) {
          F = B & C | ~B & D;
          g = i;
        } else if (i < 32) {
          F = D & B | ~D & C;
          g = (5 * i + 1) % 16;
        } else if (i < 48) {
          F = B ^ C ^ D;
          g = (3 * i + 5) % 16;
        } else {
          F = C ^ (B | ~D);
          g = 7 * i % 16;
        }
        F = F + A + K[i] + M[g] >>> 0;
        A = D;
        D = C;
        C = B;
        B = B + (F << S[i] | F >>> 32 - S[i]) >>> 0;
      }
      a0 = a0 + A >>> 0;
      b0 = b0 + B >>> 0;
      c0 = c0 + C >>> 0;
      d0 = d0 + D >>> 0;
    }
    const out = new Uint8Array(16);
    const ov = new DataView(out.buffer);
    ov.setUint32(0, a0, true);
    ov.setUint32(4, b0, true);
    ov.setUint32(8, c0, true);
    ov.setUint32(12, d0, true);
    return out;
  }

  // src/rtsp/auth.js
  function credentialsFromUrl(url) {
    try {
      const parsed = new URL(url);
      if (!parsed.username) return null;
      return {
        username: decodeURIComponent(parsed.username),
        password: decodeURIComponent(parsed.password || "")
      };
    } catch {
      return null;
    }
  }
  function parseWwwAuthenticate(header) {
    if (!header) return null;
    const scheme = header.split(/\s+/, 1)[0];
    const params = {};
    const re = /(\w+)=(?:"([^"]*)"|([^,\s]+))/g;
    let match;
    while (match = re.exec(header)) {
      params[match[1].toLowerCase()] = match[2] ?? match[3];
    }
    return { scheme: scheme.toLowerCase(), params };
  }
  function authorize({ method, uri, header, credentials, nc = 1 }) {
    if (!credentials) return null;
    const parsed = parseWwwAuthenticate(header);
    if (!parsed) return null;
    if (parsed.scheme === "basic") {
      const token = import_buffer.Buffer.from(`${credentials.username}:${credentials.password}`).toString("base64");
      return `Basic ${token}`;
    }
    if (parsed.scheme !== "digest") return null;
    const realm = parsed.params.realm || "";
    const nonce = parsed.params.nonce || "";
    const qop = (parsed.params.qop || "").split(",")[0].trim();
    const opaque = parsed.params.opaque;
    const algorithm = parsed.params.algorithm || "MD5";
    const cnonce = randomHex(8);
    const ncStr = nc.toString(16).padStart(8, "0");
    const ha1 = md52(`${credentials.username}:${realm}:${credentials.password}`);
    const ha2 = md52(`${method}:${uri}`);
    const response = qop ? md52(`${ha1}:${nonce}:${ncStr}:${cnonce}:${qop}:${ha2}`) : md52(`${ha1}:${nonce}:${ha2}`);
    const parts = [
      `Digest username="${credentials.username}"`,
      `realm="${realm}"`,
      `nonce="${nonce}"`,
      `uri="${uri}"`,
      `response="${response}"`,
      `algorithm=${algorithm}`
    ];
    if (qop) parts.push(`qop=${qop}`, `nc=${ncStr}`, `cnonce="${cnonce}"`);
    if (opaque) parts.push(`opaque="${opaque}"`);
    return parts.join(", ");
  }
  function md52(value) {
    return md5Hex(value);
  }

  // src/rtsp/protocol.js
  init_buffer_shim();
  function buildRequest(method, uri, headers = {}) {
    const lines = [`${method} ${uri} RTSP/1.0`];
    for (const [key, value] of Object.entries(headers)) {
      if (value === void 0 || value === null) continue;
      lines.push(`${key}: ${value}`);
    }
    lines.push("", "");
    return lines.join("\r\n");
  }
  function parseRtspMessage(buffer) {
    if (!buffer.length) return null;
    if (buffer[0] === 36) {
      if (buffer.length < 4) return { need: 4 };
      const channel = buffer[1];
      const size = buffer.readUInt16BE(2);
      const total2 = 4 + size;
      if (buffer.length < total2) return { need: total2 };
      return {
        interleaved: true,
        channel,
        packet: buffer.subarray(4, total2),
        consumed: total2
      };
    }
    const headerEnd = indexOfCrlfCrlf(buffer);
    if (headerEnd === -1) return { need: buffer.length + 1 };
    const headerText = buffer.subarray(0, headerEnd).toString("utf8");
    const lines = headerText.split("\r\n");
    const statusLine = lines[0];
    const headers = {};
    for (const line of lines.slice(1)) {
      const idx = line.indexOf(":");
      if (idx === -1) continue;
      headers[line.slice(0, idx).toLowerCase()] = line.slice(idx + 1).trim();
    }
    const contentLength = Number(headers["content-length"] || 0);
    const total = headerEnd + 4 + contentLength;
    if (buffer.length < total) return { need: total };
    return {
      interleaved: false,
      statusLine,
      status: Number((statusLine.match(/RTSP\/1\.0\s+(\d+)/) || [])[1] || 0),
      headers,
      body: buffer.subarray(headerEnd + 4, total).toString("utf8"),
      consumed: total
    };
  }
  function indexOfCrlfCrlf(buffer) {
    for (let i = 0; i < buffer.length - 3; i++) {
      if (buffer[i] === 13 && buffer[i + 1] === 10 && buffer[i + 2] === 13 && buffer[i + 3] === 10) {
        return i;
      }
    }
    return -1;
  }
  function sessionId(sessionHeader) {
    if (!sessionHeader) return null;
    return sessionHeader.split(";")[0].trim();
  }
  function sessionTimeoutMs(sessionHeader) {
    const match = String(sessionHeader || "").match(/timeout=(\d+)/i);
    if (!match) return 3e4;
    return Math.max(5e3, Number(match[1]) * 1e3 - 1e4);
  }

  // src/rtsp/client.js
  var USER_AGENT = "Havi-RTSP/1.0";
  var _RtspClient_instances, rawRequest_fn, connect_fn, startKeepAlive_fn, installDepay_fn, onData_fn, onRtp_fn, onAudioRtp_fn, pushNals_fn, flushAccessUnit_fn;
  var RtspClient = class extends Emitter {
    constructor(url, options = {}) {
      super();
      __privateAdd(this, _RtspClient_instances);
      this.url = normalizeRtspUrl(url);
      this.options = options;
      this.connect = options.connect || getDefaultTransport();
      this.credentials = credentialsFromUrl(this.url);
      this.digestNc = 1;
      this.socket = null;
      this.buffer = import_buffer.Buffer.alloc(0);
      this.cseq = 1;
      this.pending = /* @__PURE__ */ new Map();
      this.session = null;
      this.track = null;
      this.audioTrack = null;
      this.audioChannel = null;
      this.audioDepay = null;
      this.sdp = null;
      this.closed = false;
      this.keepAlive = null;
      this.depay = null;
      this.jpegDepay = null;
      this.accessUnit = null;
      this.sniffed = 0;
      this.authHeader = null;
    }
    async play() {
      const parsed = new URL(this.url);
      const port = Number(parsed.port) || 554;
      await __privateMethod(this, _RtspClient_instances, connect_fn).call(this, parsed.hostname, port);
      await this.request("OPTIONS", this.url);
      const describe = await this.request("DESCRIBE", this.url, {
        Accept: "application/sdp"
      });
      this.sdp = parseSdp(describe.body);
      this.track = pickVideoTrack(this.sdp);
      if (!this.track) {
        throw new Error("RTSP DESCRIBE succeeded but SDP has no video track.");
      }
      __privateMethod(this, _RtspClient_instances, installDepay_fn).call(this, this.track.family, this.track.donl);
      const contentBase = describe.headers["content-base"] || this.url;
      const controlUrl = resolveControlUrl(contentBase, this.url, this.track.control);
      const setup = await this.request("SETUP", controlUrl, {
        Transport: "RTP/AVP/TCP;unicast;interleaved=0-1"
      });
      this.session = sessionId(setup.headers.session);
      if (!this.session) throw new Error("RTSP SETUP did not return a session");
      this.audioTrack = pickAudioTrack(this.sdp);
      if (this.audioTrack?.family === "aac") {
        try {
          const audioUrl = resolveControlUrl(contentBase, this.url, this.audioTrack.control);
          await this.request("SETUP", audioUrl, {
            Transport: "RTP/AVP/TCP;unicast;interleaved=2-3",
            Session: this.session
          });
          this.audioChannel = 2;
          this.audioDepay = createAacDepayloader(this.audioTrack);
        } catch {
          this.audioTrack = null;
          this.audioChannel = null;
          this.audioDepay = null;
        }
      } else {
        this.audioTrack = null;
      }
      const playUrl = (contentBase || this.url).replace(/\/?$/, "/");
      await this.request("PLAY", playUrl, {
        Session: this.session,
        Range: "npt=0.000-"
      });
      __privateMethod(this, _RtspClient_instances, startKeepAlive_fn).call(this, sessionTimeoutMs(setup.headers.session));
      this.emit("ready", {
        url: this.url,
        track: this.track,
        sdp: this.sdp
      });
    }
    async close() {
      if (this.closed) return;
      this.closed = true;
      if (this.keepAlive) clearInterval(this.keepAlive);
      try {
        if (this.socket && this.session) {
          await this.request("TEARDOWN", this.url, { Session: this.session });
        }
      } catch {
      }
      this.socket?.destroy();
      this.emit("close");
    }
    async request(method, uri, headers = {}) {
      const msg = await __privateMethod(this, _RtspClient_instances, rawRequest_fn).call(this, method, uri, headers);
      if (msg.status === 401) {
        const header = msg.headers["www-authenticate"];
        this.authHeader = authorize({
          method,
          uri,
          header,
          credentials: this.credentials,
          nc: this.digestNc++
        });
        if (!this.authHeader) {
          throw new Error("Camera returned 401. Put credentials in the URL: rtsp://user:pass@host/path");
        }
        const retry = await __privateMethod(this, _RtspClient_instances, rawRequest_fn).call(this, method, uri, headers);
        if (retry.status >= 200 && retry.status < 300) return retry;
        throw new Error(`${retry.statusLine}
${retry.body}`);
      }
      if (msg.status >= 200 && msg.status < 300) return msg;
      throw new Error(`${msg.statusLine}
${msg.body}`);
    }
  };
  _RtspClient_instances = new WeakSet();
  rawRequest_fn = function(method, uri, headers = {}) {
    const cseq = this.cseq++;
    const extra = { CSeq: cseq, "User-Agent": USER_AGENT, ...headers };
    if (this.authHeader) extra.Authorization = this.authHeader;
    if (this.session && !extra.Session && method !== "SETUP") extra.Session = this.session;
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pending.delete(cseq);
        reject(new Error(`RTSP ${method} timed out`));
      }, this.options.timeoutMs || 8e3);
      this.pending.set(cseq, {
        resolve: (msg) => {
          clearTimeout(timer);
          resolve(msg);
        },
        reject: (err) => {
          clearTimeout(timer);
          reject(err);
        }
      });
      try {
        this.socket.write(buildRequest(method, uri, extra));
      } catch (err) {
        this.pending.delete(cseq);
        clearTimeout(timer);
        reject(err);
      }
    });
  };
  connect_fn = async function(host, port) {
    if (!this.connect) {
      throw new Error("No transport configured. Import the package entry (Node) or set one with setDefaultTransport().");
    }
    const socket = await this.connect({ host, port, url: this.url });
    socket.on("data", (chunk) => __privateMethod(this, _RtspClient_instances, onData_fn).call(this, chunk));
    socket.on("error", (err) => this.emit("error", err));
    socket.on("close", () => {
      if (!this.closed) this.emit("error", new Error("RTSP socket closed"));
    });
    this.socket = socket;
  };
  startKeepAlive_fn = function(intervalMs) {
    this.keepAlive = setInterval(() => {
      this.request("GET_PARAMETER", this.url, { Session: this.session }).catch(() => this.request("OPTIONS", this.url).catch(() => {
      }));
    }, intervalMs);
    this.keepAlive.unref?.();
  };
  installDepay_fn = function(family, donl = false) {
    this.jpegDepay = null;
    if (family === "h265") this.depay = createH265Depayloader({ donl });
    else if (family === "h264") this.depay = createH264Depayloader();
    else if (family === "jpeg") {
      this.depay = null;
      this.jpegDepay = createJpegDepayloader();
    } else this.depay = null;
  };
  onData_fn = function(chunk) {
    this.buffer = import_buffer.Buffer.concat([this.buffer, chunk]);
    while (this.buffer.length) {
      const msg = parseRtspMessage(this.buffer);
      if (!msg || msg.need) break;
      this.buffer = this.buffer.subarray(msg.consumed);
      if (msg.interleaved) {
        __privateMethod(this, _RtspClient_instances, onRtp_fn).call(this, msg.channel, msg.packet);
        continue;
      }
      const cseq = Number(msg.headers.cseq || 0);
      const pending = this.pending.get(cseq);
      if (!pending) continue;
      this.pending.delete(cseq);
      pending.resolve(msg);
    }
  };
  onRtp_fn = function(channel, packet) {
    if (this.audioDepay && channel === this.audioChannel) {
      __privateMethod(this, _RtspClient_instances, onAudioRtp_fn).call(this, packet);
      return;
    }
    if (channel !== 0) return;
    const rtp = parseRtp(packet);
    if (!rtp || !this.track || rtp.payloadType !== this.track.payloadType) return;
    if (this.jpegDepay) {
      const frame = this.jpegDepay(rtp);
      if (frame) this.emit("jpeg-frame", { timestamp: rtp.timestamp, ...frame });
      return;
    }
    if (!this.depay) {
      let family = rtp.payloadType === 26 ? "jpeg" : sniffFamily(rtp.payload);
      this.sniffed++;
      if (family !== "unknown") {
        this.track.family = family;
        __privateMethod(this, _RtspClient_instances, installDepay_fn).call(this, family, this.track.donl);
        this.emit("sniffed", { family, sdpCodec: this.track.sdpCodec });
        if (this.jpegDepay) {
          const frame = this.jpegDepay(rtp);
          if (frame) this.emit("jpeg-frame", { timestamp: rtp.timestamp, ...frame });
          return;
        }
      } else if (this.sniffed >= 24) {
        this.emit("unsupported", {
          sdpCodec: this.track.sdpCodec,
          payloadType: this.track.payloadType,
          reason: `PLAY succeeded, but RTP payload is not H.264, H.265, or JPEG (SDP codec ${this.track.sdpCodec}).`
        });
        return;
      } else {
        return;
      }
    }
    const nals = this.depay(rtp.payload);
    if (!nals.length && !rtp.marker) return;
    __privateMethod(this, _RtspClient_instances, pushNals_fn).call(this, rtp, nals);
    if (rtp.marker) __privateMethod(this, _RtspClient_instances, flushAccessUnit_fn).call(this);
  };
  onAudioRtp_fn = function(packet) {
    const rtp = parseRtp(packet);
    if (!rtp || !this.audioTrack || rtp.payloadType !== this.audioTrack.payloadType) return;
    const aus = this.audioDepay(rtp.payload);
    for (const data of aus) {
      if (data.length) this.emit("audio-au", { timestamp: rtp.timestamp, data });
    }
  };
  pushNals_fn = function(rtp, nals) {
    if (this.accessUnit && this.accessUnit.timestamp !== rtp.timestamp) {
      __privateMethod(this, _RtspClient_instances, flushAccessUnit_fn).call(this);
    }
    if (!this.accessUnit) {
      this.accessUnit = { timestamp: rtp.timestamp, nals: [], keyframe: false };
    }
    const keyOf = this.track.family === "h265" ? isHevcKeyframe : isIdr;
    for (const nal of nals) {
      this.accessUnit.nals.push(nal);
      if (keyOf(nal)) this.accessUnit.keyframe = true;
    }
  };
  flushAccessUnit_fn = function() {
    const unit = this.accessUnit;
    this.accessUnit = null;
    if (!unit || !unit.nals.length) return;
    this.emit("access-unit", unit);
  };
  function sniffFamily(payload) {
    if (!payload.length) return "unknown";
    if (payload[0] === 255 && payload[1] === 216) return "jpeg";
    const h264 = payload[0] & 31;
    if (h264 === 7 || h264 === 8 || h264 === 5 || h264 === 1 || h264 === 28 || h264 === 24) return "h264";
    if (payload.length >= 2) {
      const h265 = payload[0] >> 1 & 63;
      if (h265 === 32 || h265 === 33 || h265 === 34 || h265 === 19 || h265 === 20 || h265 === 49 || h265 === 48) {
        return "h265";
      }
    }
    return "unknown";
  }
  function normalizeRtspUrl(url) {
    const value = String(url || "").trim();
    if (!/^rtsp:\/\//i.test(value)) {
      throw new Error("URL must start with rtsp://");
    }
    return value;
  }

  // src/stream/url.js
  init_buffer_shim();
  function normalizeStreamUrl(url) {
    const value = String(url || "").trim();
    if (/^rtsp:\/\//i.test(value)) return value;
    if (/^https?:\/\//i.test(value)) return value;
    throw new Error("URL must start with rtsp:// or http://");
  }
  function isHttpUrl(url) {
    return /^https?:\/\//i.test(String(url || "").trim());
  }

  // src/stream/backoff.js
  init_buffer_shim();
  function backoffMs(attempt, { base = 600, max = 12e3 } = {}) {
    const exp = Math.min(max, base * 2 ** Math.max(0, attempt - 1));
    const jitter = Math.floor(Math.random() * 250);
    return exp + jitter;
  }
  function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // src/stream/pipeline.js
  var _RtspPipeline_instances, run_fn, session_fn, httpSession_fn, rtspSession_fn, bootMuxer_fn, ensureAudio_fn, publishInit_fn, publishJpeg_fn, onJpeg_fn, onUnit_fn, onAudio_fn, sendAll_fn, emit_fn;
  var RtspPipeline = class extends Emitter {
    constructor(url, options = {}) {
      super();
      __privateAdd(this, _RtspPipeline_instances);
      this.url = url;
      this.options = options;
      this.client = null;
      this.muxer = null;
      this.audioMuxer = null;
      this.init = null;
      this.audioInit = null;
      this.info = null;
      this.subscribers = /* @__PURE__ */ new Set();
      this.needKeyframe = /* @__PURE__ */ new Set();
      this.running = false;
      this.loop = null;
      this.stats = { frames: 0, bytes: 0, startedAt: Date.now(), reconnects: 0 };
    }
    async start() {
      if (this.running) return;
      this.running = true;
      this.loop = __privateMethod(this, _RtspPipeline_instances, run_fn).call(this);
      this.loop.catch((err) => this.emit("error", err));
    }
    subscribe(send) {
      this.subscribers.add(send);
      this.needKeyframe.add(send);
      if (this.info) send({ type: "info", ...this.info });
      if (this.init) __privateMethod(this, _RtspPipeline_instances, emit_fn).call(this, send, this.init, { kind: 1 });
      if (this.audioInit) __privateMethod(this, _RtspPipeline_instances, emit_fn).call(this, send, this.audioInit, { kind: 2 });
      return () => {
        this.subscribers.delete(send);
        this.needKeyframe.delete(send);
      };
    }
    async stop() {
      this.running = false;
      for (const send of this.subscribers) {
        try {
          send({ type: "ended" });
        } catch {
        }
      }
      this.subscribers.clear();
      await this.client?.close();
      this.client = null;
    }
  };
  _RtspPipeline_instances = new WeakSet();
  run_fn = async function() {
    let attempt = 0;
    while (this.running) {
      try {
        __privateMethod(this, _RtspPipeline_instances, sendAll_fn).call(this, { type: "connecting", attempt, url: this.url });
        await __privateMethod(this, _RtspPipeline_instances, session_fn).call(this);
        attempt = 0;
        if (!this.running) break;
        this.stats.reconnects += 1;
        const delay = backoffMs(1, { base: 800 });
        __privateMethod(this, _RtspPipeline_instances, sendAll_fn).call(this, { type: "reconnect", attempt: 1, delayMs: delay, message: "RTSP session ended" });
        await sleep(delay);
      } catch (err) {
        if (!this.running) break;
        attempt += 1;
        this.stats.reconnects += 1;
        const delay = backoffMs(attempt);
        __privateMethod(this, _RtspPipeline_instances, sendAll_fn).call(this, {
          type: "reconnect",
          attempt,
          delayMs: delay,
          message: err.message
        });
        await sleep(delay);
      }
    }
  };
  session_fn = function() {
    if (isHttpUrl(this.url)) return __privateMethod(this, _RtspPipeline_instances, httpSession_fn).call(this);
    return __privateMethod(this, _RtspPipeline_instances, rtspSession_fn).call(this);
  };
  httpSession_fn = function() {
    return new Promise((resolve, reject) => {
      if (!this.options.createHttpClient) {
        reject(new Error("HTTP MJPEG is not available on this platform. Use an <img> tag for http(s) URLs."));
        return;
      }
      const client = this.options.createHttpClient(this.url);
      this.client = client;
      this.muxer = null;
      this.audioMuxer = null;
      this.init = null;
      this.audioInit = null;
      this.info = null;
      let settled = false;
      const finish = (err) => {
        if (settled) return;
        settled = true;
        client.close().catch(() => {
        });
        this.client = null;
        if (!this.running || !err) resolve();
        else reject(err);
      };
      client.on("ready", ({ track }) => {
        __privateMethod(this, _RtspPipeline_instances, publishJpeg_fn).call(this, track);
      });
      client.on("jpeg-frame", (frame) => {
        try {
          __privateMethod(this, _RtspPipeline_instances, onJpeg_fn).call(this, frame);
        } catch (err) {
          finish(err);
        }
      });
      client.on("error", (err) => finish(err));
      client.on("close", () => finish());
      client.play().catch((err) => finish(err));
    });
  };
  rtspSession_fn = function() {
    return new Promise((resolve, reject) => {
      const client = new RtspClient(this.url, this.options.client || {});
      this.client = client;
      this.muxer = null;
      this.audioMuxer = null;
      this.init = null;
      this.audioInit = null;
      this.info = null;
      let settled = false;
      const finish = (err) => {
        if (settled) return;
        settled = true;
        client.close().catch(() => {
        });
        this.client = null;
        if (!this.running || !err) resolve();
        else reject(err);
      };
      client.on("unsupported", (detail) => {
        __privateMethod(this, _RtspPipeline_instances, sendAll_fn).call(this, { type: "unsupported", afterAttempt: true, ...detail });
      });
      client.on("ready", ({ track }) => {
        __privateMethod(this, _RtspPipeline_instances, bootMuxer_fn).call(this, track);
      });
      client.on("sniffed", ({ family, sdpCodec }) => {
        __privateMethod(this, _RtspPipeline_instances, sendAll_fn).call(this, { type: "sniffed", family, sdpCodec });
      });
      client.on("access-unit", (unit) => {
        try {
          __privateMethod(this, _RtspPipeline_instances, onUnit_fn).call(this, unit, client.track);
        } catch (err) {
          finish(err);
        }
      });
      client.on("audio-au", (unit) => {
        try {
          __privateMethod(this, _RtspPipeline_instances, onAudio_fn).call(this, unit.data);
        } catch (err) {
          finish(err);
        }
      });
      client.on("jpeg-frame", (frame) => {
        try {
          __privateMethod(this, _RtspPipeline_instances, onJpeg_fn).call(this, frame);
        } catch (err) {
          finish(err);
        }
      });
      client.on("error", (err) => finish(err));
      client.on("close", () => finish());
      client.play().catch((err) => finish(err));
    });
  };
  bootMuxer_fn = function(track) {
    if (track.family === "jpeg") {
      __privateMethod(this, _RtspPipeline_instances, publishJpeg_fn).call(this, track);
      return;
    }
    if (track.family === "unknown") return;
    if (track.family === "h264" && !(track.sps && track.pps)) return;
    if (track.family === "h265" && !(track.sps && track.pps)) return;
    this.muxer = new Fmp4Muxer({
      family: track.family,
      vps: track.vps,
      sps: track.sps,
      pps: track.pps,
      timescale: track.clockRate || 9e4
    });
    if (!this.muxer.ready) return;
    __privateMethod(this, _RtspPipeline_instances, publishInit_fn).call(this, track);
  };
  ensureAudio_fn = function() {
    if (this.audioMuxer) {
      return this.info?.audio || {
        codec: this.audioMuxer.codec,
        family: "aac"
      };
    }
    const real = pickAudioTrack(this.client?.sdp);
    if (real?.family !== "aac" || !this.client?.audioDepay) return null;
    this.audioMuxer = new AacFmp4Muxer({
      sampleRate: real.clockRate || 44100,
      channels: real.channels || 1,
      asc: parseAsc(real.config)
    });
    this.audioInit = this.audioMuxer.initSegment();
    return {
      codec: this.audioMuxer.codec,
      family: "aac",
      sdpCodec: real.sdpCodec,
      clockRate: real.clockRate,
      channels: real.channels || 1
    };
  };
  publishInit_fn = function(track) {
    this.init = this.muxer.initSegment();
    const audio = __privateMethod(this, _RtspPipeline_instances, ensureAudio_fn).call(this);
    this.info = {
      url: this.url,
      codec: this.muxer.info.codec,
      family: this.muxer.info.family || track.family,
      sdpCodec: track.sdpCodec,
      width: this.muxer.info.width,
      height: this.muxer.info.height,
      clockRate: track.clockRate || this.muxer.timescale,
      description: this.muxer.decoderConfig.toString("base64"),
      audio,
      reconnects: this.stats.reconnects
    };
    this.emit("info", this.info);
    __privateMethod(this, _RtspPipeline_instances, sendAll_fn).call(this, { type: "info", ...this.info });
    __privateMethod(this, _RtspPipeline_instances, sendAll_fn).call(this, this.init);
    if (this.audioInit) __privateMethod(this, _RtspPipeline_instances, sendAll_fn).call(this, this.audioInit, { audio: true });
    for (const send of this.subscribers) this.needKeyframe.add(send);
  };
  publishJpeg_fn = function(track, frame) {
    const width = frame?.width || this.info?.width || 0;
    const height = frame?.height || this.info?.height || 0;
    this.info = {
      url: this.url,
      codec: String(track?.sdpCodec || "JPEG").toLowerCase(),
      family: "jpeg",
      sdpCodec: track?.sdpCodec || "JPEG",
      width,
      height,
      clockRate: track?.clockRate || 9e4,
      audio: __privateMethod(this, _RtspPipeline_instances, ensureAudio_fn).call(this),
      reconnects: this.stats.reconnects
    };
    this.emit("info", this.info);
    __privateMethod(this, _RtspPipeline_instances, sendAll_fn).call(this, { type: "info", ...this.info });
  };
  onJpeg_fn = function(frame) {
    if (!frame?.data?.length) return;
    if (!this.info || this.info.family !== "jpeg") {
      __privateMethod(this, _RtspPipeline_instances, publishJpeg_fn).call(this, this.client?.track, frame);
    } else if (!this.info.width && frame.width) {
      this.info.width = frame.width;
      this.info.height = frame.height;
      __privateMethod(this, _RtspPipeline_instances, sendAll_fn).call(this, { type: "info", ...this.info });
    }
    this.stats.frames += 1;
    this.stats.bytes += frame.data.length;
    __privateMethod(this, _RtspPipeline_instances, sendAll_fn).call(this, frame.data, { media: true, keyframe: true, jpeg: true });
  };
  onUnit_fn = function(unit, track) {
    if (!this.muxer) {
      this.muxer = new Fmp4Muxer({
        family: track?.family || "h264",
        vps: track?.vps,
        sps: track?.sps,
        pps: track?.pps,
        timescale: track?.clockRate || 9e4
      });
      if (!this.muxer.updateParameterSets(unit.nals) || !this.muxer.ready) return;
      __privateMethod(this, _RtspPipeline_instances, publishInit_fn).call(this, track || { sdpCodec: this.muxer.info.codec, family: this.muxer.info.family });
    } else if (this.muxer.updateParameterSets(unit.nals) && this.muxer.ready) {
      __privateMethod(this, _RtspPipeline_instances, publishInit_fn).call(this, track || { sdpCodec: this.info?.sdpCodec, family: this.muxer.info.family });
    }
    const fragment = this.muxer.mediaFragment(unit);
    if (!fragment) return;
    this.stats.frames += 1;
    this.stats.bytes += fragment.length;
    __privateMethod(this, _RtspPipeline_instances, sendAll_fn).call(this, fragment, { media: true, keyframe: unit.keyframe });
  };
  onAudio_fn = function(data) {
    if (!this.audioMuxer) return;
    const fragment = this.audioMuxer.mediaFragment(data);
    if (!fragment) return;
    this.stats.bytes += fragment.length;
    __privateMethod(this, _RtspPipeline_instances, sendAll_fn).call(this, fragment, { media: true, audio: true, keyframe: true });
  };
  sendAll_fn = function(payload, { media = false, keyframe = false, audio = false, jpeg = false } = {}) {
    const kind = import_buffer.Buffer.isBuffer(payload) ? jpeg ? 3 : audio ? 2 : 1 : 0;
    for (const send of this.subscribers) {
      if (media && !audio && !jpeg && this.needKeyframe.has(send) && !keyframe) continue;
      try {
        __privateMethod(this, _RtspPipeline_instances, emit_fn).call(this, send, payload, { kind });
        if (media && keyframe && !audio) this.needKeyframe.delete(send);
      } catch {
        this.subscribers.delete(send);
        this.needKeyframe.delete(send);
      }
    }
  };
  emit_fn = function(send, payload, { kind = 0 } = {}) {
    if (import_buffer.Buffer.isBuffer(payload) && kind) {
      send(import_buffer.Buffer.concat([import_buffer.Buffer.from([kind]), payload]));
      return;
    }
    send(payload);
  };
  function parseAsc(hex) {
    if (!hex) return null;
    try {
      return import_buffer.Buffer.from(String(hex).replace(/\s+/g, ""), "hex");
    } catch {
      return null;
    }
  }

  // src/browser/connect.js
  init_buffer_shim();

  // src/transport/websocket.js
  init_buffer_shim();
  function createWebSocketTransport({ proxy, WebSocketImpl } = {}) {
    if (!proxy) throw new Error("WebSocket transport needs a proxy URL");
    const WS = WebSocketImpl || globalThis.WebSocket;
    if (!WS) throw new Error("No WebSocket implementation available");
    return function wsConnect(target) {
      const url = typeof proxy === "function" ? proxy(target) : fillTemplate(proxy, target);
      return new Promise((resolve, reject) => {
        const ws = new WS(url);
        ws.binaryType = "arraybuffer";
        const transport = new WsTransport(ws);
        let opened = false;
        ws.onopen = () => {
          opened = true;
          resolve(transport);
        };
        ws.onerror = () => {
          const err = new Error(`WebSocket pipe failed (${url})`);
          if (!opened) reject(err);
          transport.emit("error", err);
        };
        ws.onclose = () => {
          if (!opened) reject(new Error(`WebSocket pipe closed before open (${url})`));
          transport.emit("close");
        };
        ws.onmessage = (event) => {
          const data = event.data;
          if (data instanceof ArrayBuffer) transport.emit("data", import_buffer.Buffer.from(data));
          else if (typeof data === "string") transport.emit("data", import_buffer.Buffer.from(data, "latin1"));
          else if (data?.arrayBuffer) data.arrayBuffer().then((ab) => transport.emit("data", import_buffer.Buffer.from(ab)));
        };
      });
    };
  }
  var WsTransport = class extends Emitter {
    constructor(ws) {
      super();
      this.ws = ws;
    }
    write(buf) {
      if (this.ws.readyState !== 1) throw new Error("WebSocket pipe not open");
      this.ws.send(buf);
    }
    destroy() {
      try {
        this.ws.close();
      } catch {
      }
    }
  };
  function fillTemplate(template, { host, port }) {
    return String(template).replace("{host}", encodeURIComponent(host)).replace("{port}", String(port));
  }

  // src/transport/http.js
  init_buffer_shim();
  function createHttpTransport({ base } = {}) {
    const root = resolveBase(base);
    if (!root) throw new Error("HTTP TCP layer needs a base URL");
    return async function httpConnect({ host, port }) {
      const opened = await fetch(`${root}/tcp/open?host=${encodeURIComponent(host)}&port=${Number(port) || 554}`, {
        method: "POST"
      });
      if (!opened.ok) {
        const err = new Error(`TCP layer open failed (${opened.status})`);
        err.status = opened.status;
        throw err;
      }
      const { id } = await opened.json();
      if (!id) throw new Error("TCP layer open returned no id");
      const transport = new HttpTransport(root, id);
      transport.startRead();
      return transport;
    };
  }
  function resolveBase(base) {
    if (base) return String(base).replace(/\/$/, "");
    if (typeof location !== "undefined" && /^https?:$/.test(location.protocol) && location.origin) {
      return location.origin;
    }
    return "";
  }
  var HttpTransport = class extends Emitter {
    constructor(root, id) {
      super();
      this.root = root;
      this.id = id;
      this.closed = false;
      this.abort = new AbortController();
      this.writes = Promise.resolve();
    }
    startRead() {
      fetch(`${this.root}/tcp/read?id=${encodeURIComponent(this.id)}`, { signal: this.abort.signal }).then(async (res) => {
        if (!res.ok || !res.body) {
          const err = new Error(`TCP layer read failed (${res.status})`);
          err.status = res.status;
          throw err;
        }
        const reader = res.body.getReader();
        while (!this.closed) {
          const { value, done } = await reader.read();
          if (done) break;
          if (value?.length) this.emit("data", import_buffer.Buffer.from(value));
        }
      }).catch((err) => {
        if (this.closed || err.name === "AbortError") return;
        this.emit("error", err);
      }).finally(() => {
        if (!this.closed) this.emit("close");
      });
    }
    write(buf) {
      if (this.closed) throw new Error("TCP layer is closed");
      const bytes = typeof buf === "string" ? new TextEncoder().encode(buf) : buf;
      this.writes = this.writes.then(async () => {
        if (this.closed) return;
        const res = await fetch(`${this.root}/tcp/write?id=${encodeURIComponent(this.id)}`, {
          method: "POST",
          headers: { "Content-Type": "application/octet-stream" },
          body: bytes
        });
        if (!res.ok) throw new Error(`TCP layer write failed (${res.status})`);
      }).catch((err) => {
        if (!this.closed) this.emit("error", err);
      });
      return true;
    }
    destroy() {
      if (this.closed) return;
      this.closed = true;
      this.abort.abort();
      fetch(`${this.root}/tcp/close?id=${encodeURIComponent(this.id)}`, { method: "POST" }).catch(() => {
      });
    }
  };

  // src/transport/direct.js
  init_buffer_shim();
  function directSocketsStatus() {
    const g = globalThis;
    const fp = typeof document !== "undefined" ? document.featurePolicy || document.permissionsPolicy : null;
    let policy = null;
    if (fp && typeof fp.allowsFeature === "function") {
      try {
        policy = fp.allowsFeature("direct-sockets");
      } catch {
        policy = null;
      }
    }
    return {
      tcp: typeof g.TCPSocket === "function",
      udp: typeof g.UDPSocket === "function",
      crossOriginIsolated: Boolean(g.crossOriginIsolated),
      policy,
      origin: typeof location !== "undefined" ? location.origin : ""
    };
  }
  function canDirectConnect() {
    return typeof globalThis.TCPSocket === "function";
  }
  function explainDirectSockets() {
    if (canDirectConnect()) return "Direct Sockets available.";
    return "This page has no raw TCP. Serve it from a host with a /tcp layer, or run the local host (deno run --allow-net --allow-read havi-rtsp.browser.js).";
  }
  async function directConnect({ host, port }) {
    const TCPSocket = globalThis.TCPSocket;
    if (!TCPSocket) throw new Error(explainDirectSockets());
    let socket;
    try {
      socket = new TCPSocket(String(host), Number(port), { noDelay: true });
    } catch (err) {
      throw wrapError(err, host, port);
    }
    let opened;
    try {
      opened = await socket.opened;
    } catch (err) {
      throw wrapError(err, host, port);
    }
    return new DirectTransport(socket, opened);
  }
  function wrapError(err, host, port) {
    const base = `${host}:${port}`;
    if (err?.name === "NotAllowedError") return new Error(`Direct Sockets blocked for ${base}: ${err.message}`);
    if (err?.name === "NetworkError") return new Error(`TCP connect to ${base} failed: ${err.message}`);
    return err instanceof Error ? err : new Error(String(err));
  }
  var _DirectTransport_instances, read_fn, finish_fn;
  var DirectTransport = class extends Emitter {
    constructor(socket, opened) {
      super();
      __privateAdd(this, _DirectTransport_instances);
      this.socket = socket;
      this.remoteAddress = opened.remoteAddress;
      this.remotePort = opened.remotePort;
      this.writer = opened.writable.getWriter();
      this.reader = opened.readable.getReader();
      this.closed = false;
      __privateMethod(this, _DirectTransport_instances, read_fn).call(this);
      socket.closed.then(() => __privateMethod(this, _DirectTransport_instances, finish_fn).call(this), (err) => __privateMethod(this, _DirectTransport_instances, finish_fn).call(this, err));
    }
    write(buf) {
      if (this.closed) return Promise.resolve();
      const bytes = typeof buf === "string" ? new TextEncoder().encode(buf) : toBytes(buf);
      return this.writer.write(bytes).catch((err) => {
        if (!this.closed) this.emit("error", err);
      });
    }
    destroy() {
      if (this.closed) return;
      this.writer.close().catch(() => {
      });
      this.reader.cancel().catch(() => {
      });
      this.socket.close().catch(() => {
      });
      __privateMethod(this, _DirectTransport_instances, finish_fn).call(this);
    }
  };
  _DirectTransport_instances = new WeakSet();
  read_fn = async function() {
    try {
      while (true) {
        const { value, done } = await this.reader.read();
        if (done) break;
        if (value && value.byteLength) this.emit("data", import_buffer.Buffer.from(value.buffer, value.byteOffset, value.byteLength));
      }
      __privateMethod(this, _DirectTransport_instances, finish_fn).call(this);
    } catch (err) {
      __privateMethod(this, _DirectTransport_instances, finish_fn).call(this, err);
    }
  };
  finish_fn = function(err) {
    if (this.closed) return;
    this.closed = true;
    if (err && err.name !== "AbortError") this.emit("error", err);
    this.emit("close");
  };
  function toBytes(buf) {
    if (buf instanceof Uint8Array) return buf;
    if (ArrayBuffer.isView(buf)) return new Uint8Array(buf.buffer, buf.byteOffset, buf.byteLength);
    if (buf instanceof ArrayBuffer) return new Uint8Array(buf);
    return new Uint8Array(buf);
  }

  // src/browser/connect.js
  var GATEWAY_PIPE = "ws://127.0.0.1:8787/tcp?host={host}&port={port}";
  var STANDALONE_PIPE = "ws://127.0.0.1:8788/?host={host}&port={port}";
  function inferPipe() {
    if (typeof location !== "undefined" && /^https?:$/.test(location.protocol) && location.host) {
      const scheme = location.protocol === "https:" ? "wss:" : "ws:";
      return `${scheme}//${location.host}/tcp?host={host}&port={port}`;
    }
    return GATEWAY_PIPE;
  }
  function inferHttpBase() {
    if (typeof location !== "undefined" && /^https?:$/.test(location.protocol) && location.origin) {
      return location.origin;
    }
    return "";
  }
  function createBrowserConnect(options = {}) {
    const proxy = options.proxy || options.pipe;
    const base = options.base || (!proxy ? inferHttpBase() : "");
    return async (target) => {
      if (canDirectConnect()) {
        try {
          return await directConnect(target);
        } catch (err) {
          if (!base && !proxy) throw err;
        }
      }
      if (base && !proxy) {
        try {
          return await createHttpTransport({ base })(target);
        } catch (err) {
          try {
            return await createWebSocketTransport({ proxy: inferPipe() })(target);
          } catch {
            throw err;
          }
        }
      }
      if (proxy) return createWebSocketTransport({ proxy })(target);
      try {
        return await createWebSocketTransport({ proxy: GATEWAY_PIPE })(target);
      } catch (err) {
        throw new Error(`${explainDirectSockets()} No local host at ${GATEWAY_PIPE.split("?")[0]}. ${err.message}`);
      }
    };
  }

  // src/browser/element.js
  init_buffer_shim();

  // src/browser/play.js
  init_buffer_shim();

  // src/browser/player.js
  init_buffer_shim();
  var TARGET_LIVE = 0.3;
  var MAX_LIVE = 1.2;
  function createBrowserPlayer({ video, canvas, onStatus = () => {
  }, onInfo = () => {
  } }) {
    let mediaSource = null;
    let sourceBuffer = null;
    let audioSourceBuffer = null;
    let objectUrl = null;
    let videoQueue = [];
    let audioQueue = [];
    let mode = null;
    let info = null;
    let unsubscribe = null;
    let stats = { frames: 0, bytes: 0 };
    const canvasCtx = canvas ? canvas.getContext("2d") : null;
    const clock = setInterval(catchUp, 400);
    function attach(pipeline) {
      detach();
      unsubscribe = pipeline.subscribe(onPayload);
    }
    function detach() {
      unsubscribe?.();
      unsubscribe = null;
      teardownMedia();
      info = null;
      mode = null;
    }
    function destroy() {
      detach();
      clearInterval(clock);
    }
    function onPayload(payload) {
      if (!(payload instanceof Uint8Array)) {
        onControl(payload);
        return;
      }
      const kind = payload[0];
      const data = payload.subarray(1);
      stats.bytes += data.length;
      if (kind === 3) {
        drawJpeg(data);
        return;
      }
      if (mode !== "mse") return;
      if (kind === 2) audioQueue.push(data);
      else {
        stats.frames += 1;
        videoQueue.push(data);
      }
      if (videoQueue.length > 48) videoQueue = videoQueue.filter(isInitSegment).concat(videoQueue.slice(-10));
      if (audioQueue.length > 64) audioQueue = audioQueue.filter(isInitSegment).concat(audioQueue.slice(-16));
      flush();
      maybePlay();
    }
    function onControl(msg) {
      if (msg.type === "info") {
        info = msg;
        onInfo(msg);
        if (msg.family === "jpeg") {
          if (mode !== "jpeg") {
            teardownMedia();
            mode = "jpeg";
            if (video) video.hidden = true;
            if (canvas) canvas.hidden = false;
            onStatus("JPEG. Drawing frames.", "ok");
          }
          return;
        }
        teardownMedia();
        mode = "mse";
        if (video) video.hidden = false;
        if (canvas) canvas.hidden = true;
        openMse(msg).catch((err) => onStatus(`Cannot play ${msg.codec}: ${err.message}`, "err"));
        return;
      }
      if (msg.type === "connecting") onStatus("RTSP connecting\u2026", "warn");
      else if (msg.type === "reconnect") onStatus(`Retry ${msg.attempt} in ${(msg.delayMs / 1e3).toFixed(1)}s. ${msg.message || ""}`.trim(), "warn");
      else if (msg.type === "unsupported") onStatus(msg.reason, "err");
      else if (msg.type === "error") onStatus(msg.message, "err");
      else if (msg.type === "ended") onStatus("Stream ended.", "warn");
    }
    async function openMse(streamInfo) {
      if (!video) throw new Error("no <video> element");
      const audioMime = streamInfo.audio?.family === "aac" ? 'audio/mp4; codecs="mp4a.40.2"' : null;
      let lastErr = null;
      for (const mime of mimeCandidates(streamInfo.codec)) {
        if (!MediaSource.isTypeSupported(mime)) {
          lastErr = new Error(`${mime} not supported`);
          continue;
        }
        try {
          await openSourceBuffers(mime, audioMime);
          flush();
          onStatus(`Playing ${streamInfo.codec}${streamInfo.width ? ` ${streamInfo.width}\xD7${streamInfo.height}` : ""}.`, "ok");
          return;
        } catch (err) {
          lastErr = err;
        }
      }
      throw lastErr || new Error("MSE refused every mime");
    }
    function openSourceBuffers(mime, audioMime) {
      return new Promise((resolve, reject) => {
        mediaSource = new MediaSource();
        objectUrl = URL.createObjectURL(mediaSource);
        video.src = objectUrl;
        const timer = setTimeout(() => reject(new Error("MSE sourceopen timeout")), 15e3);
        mediaSource.addEventListener("sourceopen", () => {
          try {
            sourceBuffer = mediaSource.addSourceBuffer(mime);
            try {
              sourceBuffer.mode = "sequence";
            } catch {
            }
            sourceBuffer.addEventListener("updateend", flush);
            if (audioMime && MediaSource.isTypeSupported(audioMime)) {
              try {
                audioSourceBuffer = mediaSource.addSourceBuffer(audioMime);
                try {
                  audioSourceBuffer.mode = "sequence";
                } catch {
                }
                audioSourceBuffer.addEventListener("updateend", flush);
              } catch {
                audioSourceBuffer = null;
              }
            }
            clearTimeout(timer);
            resolve();
          } catch (err) {
            clearTimeout(timer);
            reject(err);
          }
        }, { once: true });
      });
    }
    function flush() {
      flushOne(sourceBuffer, videoQueue);
      flushOne(audioSourceBuffer, audioQueue);
    }
    function flushOne(sb, queue) {
      if (!sb || sb.updating || !queue.length) return;
      const chunk = queue.shift();
      try {
        sb.appendBuffer(chunk);
      } catch (err) {
        if (err.name === "QuotaExceededError") {
          trim(sb, true);
          queue.unshift(chunk);
          return;
        }
        onStatus(`Append failed: ${err.message}`, "err");
      }
      trim(sb, false);
    }
    function trim(sb, aggressive) {
      if (!sb || sb.updating) return;
      const ranges = sb.buffered;
      if (!ranges.length) return;
      const end = ranges.end(ranges.length - 1);
      const keep = aggressive ? 1.2 : 3.5;
      if (end - ranges.start(0) > keep + 1) {
        try {
          sb.remove(0, end - keep);
        } catch {
        }
      }
    }
    function catchUp() {
      if (mode !== "mse" || !video || video.paused || !video.buffered.length) return;
      const end = video.buffered.end(video.buffered.length - 1);
      const latency = end - video.currentTime;
      if (latency > MAX_LIVE) {
        video.currentTime = Math.max(0, end - TARGET_LIVE);
        video.playbackRate = 1;
      } else {
        video.playbackRate = latency > 0.7 ? 1.06 : 1;
      }
    }
    async function maybePlay() {
      if (!video || !video.paused) return;
      try {
        await video.play();
      } catch {
        video.muted = true;
        video.play().catch(() => onStatus("Autoplay blocked. Press play.", "warn"));
      }
    }
    function drawJpeg(data) {
      if (!canvas || mode !== "jpeg") return;
      stats.frames += 1;
      const blob = new Blob([data], { type: "image/jpeg" });
      createImageBitmap(blob).then((bmp) => {
        canvas.width = bmp.width;
        canvas.height = bmp.height;
        canvasCtx.drawImage(bmp, 0, 0);
        bmp.close();
      }).catch(() => {
      });
    }
    function teardownMedia() {
      videoQueue = [];
      audioQueue = [];
      sourceBuffer = null;
      audioSourceBuffer = null;
      if (mediaSource && mediaSource.readyState === "open") {
        try {
          mediaSource.endOfStream();
        } catch {
        }
      }
      mediaSource = null;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
      objectUrl = null;
      if (video) {
        video.removeAttribute("src");
        video.load();
      }
    }
    return {
      attach,
      detach,
      destroy,
      get info() {
        return info;
      },
      get mode() {
        return mode;
      },
      get stats() {
        return stats;
      }
    };
  }
  function mimeCandidates(codec) {
    const list = [`video/mp4; codecs="${codec}"`];
    if (codec.startsWith("hvc1.")) list.push(`video/mp4; codecs="${codec.replace("hvc1.", "hev1.")}"`);
    if (codec.startsWith("hev1.")) list.push(`video/mp4; codecs="${codec.replace("hev1.", "hvc1.")}"`);
    return list;
  }
  function isInitSegment(bytes) {
    return bytes.length > 8 && String.fromCharCode(bytes[4], bytes[5], bytes[6], bytes[7]) === "ftyp";
  }

  // src/browser/styles.js
  init_buffer_shim();
  var HAVI_BASE_CSS = `
havi-player{display:block;position:relative;width:100%;background:#000;aspect-ratio:16/9}
havi-player video,havi-player canvas,havi-player img,.havi-canvas,.havi-img{display:block;width:100%;height:100%;object-fit:contain;background:#000}
havi-player video[hidden],havi-player canvas[hidden],havi-player img[hidden],.havi-canvas[hidden],.havi-img[hidden]{display:none}
`;
  var STYLE_ID = "havi-rtsp-base";
  function ensureBaseStyles() {
    if (typeof document === "undefined") return;
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = HAVI_BASE_CSS;
    document.head.appendChild(style);
  }

  // src/browser/play.js
  function play(target, url, options = {}) {
    const els = resolveTarget(target, options);
    ensureBaseStyles();
    const handle = {
      player: null,
      pipeline: null,
      stop() {
        handle.player?.detach();
        const done = handle.pipeline?.stop() || Promise.resolve();
        handle.pipeline = null;
        if (els.img) {
          els.img.removeAttribute("src");
          els.img.hidden = true;
        }
        if (els.video) els.video.hidden = false;
        if (els.canvas) els.canvas.hidden = true;
        return done;
      }
    };
    const stream = String(url || "").trim();
    if (!stream) throw new Error("play() needs an RTSP or HTTP URL");
    if (isHttpUrl(stream)) {
      const img = els.img || ensureSibling(els.video, "img", "haviImg");
      els.img = img;
      if (els.video) els.video.hidden = true;
      if (els.canvas) els.canvas.hidden = true;
      img.hidden = false;
      img.alt = "";
      img.src = stream;
      options.onStatus?.("HTTP MJPEG via <img>.", "ok");
      options.onInfo?.({ family: "jpeg", codec: "mjpeg" });
      return handle;
    }
    normalizeRtspUrl(stream);
    const player = createBrowserPlayer({
      video: els.video,
      canvas: els.canvas,
      onStatus: options.onStatus || (() => {
      }),
      onInfo: options.onInfo || (() => {
      })
    });
    const connect = options.client?.connect || createBrowserConnect({
      proxy: options.proxy || options.pipe,
      base: options.base
    });
    const pipeline = new RtspPipeline(stream, {
      ...options,
      client: { connect, ...options.client || {} }
    });
    player.attach(pipeline);
    pipeline.on("error", (err) => options.onStatus?.(err.message, "err"));
    pipeline.start();
    handle.player = player;
    handle.pipeline = pipeline;
    return handle;
  }
  function resolveTarget(target, options = {}) {
    if (!target) throw new Error("play() needs a <video>, selector, or { video, canvas }");
    if (typeof target === "string") {
      const el = document.querySelector(target);
      if (!el) throw new Error(`play() found no element for ${target}`);
      target = el;
    }
    if (target.tagName === "HAVI-PLAYER") {
      return { video: target.video, canvas: target.canvas, img: target.img };
    }
    if (typeof HTMLVideoElement !== "undefined" && target instanceof HTMLVideoElement) {
      return {
        video: target,
        canvas: options.canvas || ensureSibling(target, "canvas", "haviCanvas"),
        img: options.img || null
      };
    }
    if (target.video) {
      return {
        video: target.video,
        canvas: target.canvas || options.canvas || ensureSibling(target.video, "canvas", "haviCanvas"),
        img: target.img || options.img || null
      };
    }
    throw new Error("play() needs a <video> or { video, canvas }");
  }
  function ensureSibling(anchor, tag, mark) {
    if (!anchor || !anchor.parentNode) {
      const el2 = document.createElement(tag);
      el2.hidden = true;
      el2.dataset[mark] = "1";
      el2.className = tag === "canvas" ? "havi-canvas" : "havi-img";
      return el2;
    }
    const next = anchor.nextElementSibling;
    if (next && next.dataset[mark] === "1") return next;
    const el = document.createElement(tag);
    el.hidden = true;
    el.dataset[mark] = "1";
    el.className = tag === "canvas" ? "havi-canvas" : "havi-img";
    anchor.insertAdjacentElement("afterend", el);
    return el;
  }

  // src/browser/element.js
  var BaseElement = typeof HTMLElement === "function" ? HTMLElement : class {
  };
  var _HaviPlayerElement_instances, syncMediaAttrs_fn, start_fn;
  var HaviPlayerElement = class extends BaseElement {
    constructor() {
      super();
      __privateAdd(this, _HaviPlayerElement_instances);
      this.video = document.createElement("video");
      this.canvas = document.createElement("canvas");
      this.img = document.createElement("img");
      this.video.playsInline = true;
      this.video.autoplay = true;
      this.video.muted = true;
      this.canvas.hidden = true;
      this.img.hidden = true;
      this.img.alt = "";
      this._handle = null;
      this._gen = 0;
    }
    static get observedAttributes() {
      return ["src", "pipe", "base", "muted", "controls"];
    }
    connectedCallback() {
      ensureBaseStyles();
      if (!this.video.parentNode) this.append(this.video, this.canvas, this.img);
      __privateMethod(this, _HaviPlayerElement_instances, syncMediaAttrs_fn).call(this);
      if (this.getAttribute("src")) __privateMethod(this, _HaviPlayerElement_instances, start_fn).call(this);
    }
    disconnectedCallback() {
      this._gen += 1;
      this._handle?.stop();
      this._handle = null;
    }
    attributeChangedCallback(name) {
      if (!this.isConnected) return;
      if (name === "src" || name === "pipe" || name === "base") __privateMethod(this, _HaviPlayerElement_instances, start_fn).call(this);
      else __privateMethod(this, _HaviPlayerElement_instances, syncMediaAttrs_fn).call(this);
    }
    get src() {
      return this.getAttribute("src") || "";
    }
    set src(value) {
      if (value) this.setAttribute("src", value);
      else this.removeAttribute("src");
    }
  };
  _HaviPlayerElement_instances = new WeakSet();
  syncMediaAttrs_fn = function() {
    this.video.muted = this.getAttribute("muted") !== "false";
    this.video.controls = this.hasAttribute("controls");
  };
  start_fn = function() {
    const url = this.getAttribute("src");
    const gen = ++this._gen;
    this._handle?.stop();
    this._handle = null;
    if (!url) return;
    try {
      this._handle = play(
        { video: this.video, canvas: this.canvas, img: this.img },
        url,
        {
          proxy: this.getAttribute("pipe") || void 0,
          base: this.getAttribute("base") || void 0,
          onStatus: (text, kind) => {
            if (gen !== this._gen) return;
            this.dispatchEvent(new CustomEvent("havi-status", { detail: { text, kind } }));
          },
          onInfo: (info) => {
            if (gen !== this._gen) return;
            this.dispatchEvent(new CustomEvent("havi-info", { detail: info }));
          }
        }
      );
    } catch (err) {
      this.dispatchEvent(new CustomEvent("havi-status", { detail: { text: err.message, kind: "err" } }));
    }
  };
  function defineHaviPlayer() {
    if (typeof customElements === "undefined") return;
    if (!customElements.get("havi-player")) customElements.define("havi-player", HaviPlayerElement);
  }

  // src/browser/autoload.js
  init_buffer_shim();
  function autoload() {
    if (typeof document === "undefined") return;
    const run = () => {
      document.querySelectorAll("[data-havi-src]").forEach((el) => {
        if (el.tagName === "HAVI-PLAYER") return;
        if (el.__haviHandle) return;
        const url = el.getAttribute("data-havi-src");
        if (!url) return;
        const target = el.tagName === "VIDEO" ? el : el.querySelector("video") || el;
        try {
          el.__haviHandle = play(target, url, {
            proxy: el.getAttribute("data-havi-pipe") || void 0,
            base: el.getAttribute("data-havi-base") || void 0
          });
        } catch (err) {
          el.dispatchEvent(new CustomEvent("havi-status", { detail: { text: err.message, kind: "err" } }));
        }
      });
    };
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", run, { once: true });
    } else {
      run();
    }
  }

  // src/host/deno.js
  init_buffer_shim();

  // src/util/target.js
  init_buffer_shim();
  function splitTarget(value) {
    const i = String(value).lastIndexOf(":");
    if (i <= 0) throw new Error("target must be host:port");
    return { host: value.slice(0, i), port: Number(value.slice(i + 1)) };
  }
  function isLoopback(host) {
    return host === "127.0.0.1" || host === "localhost" || host === "::1";
  }
  function normalizeAllow(allow) {
    if (!allow) return null;
    if (allow instanceof Set) return allow;
    const set = new Set(String(allow).split(",").map((s) => s.trim()).filter(Boolean));
    return set.size ? set : null;
  }
  function checkTarget(target, { allow, fixed, requireAllow }) {
    if (!target.host || !Number.isFinite(target.port) || !target.port) return "host and port required";
    if (requireAllow && !allow && !fixed) return "allow list required when not bound to localhost";
    if (allow && !allow.has(`${target.host}:${target.port}`)) return "target not allowed";
    return null;
  }
  function targetFromQuery(url, fixed) {
    return fixed || {
      host: url.searchParams.get("host"),
      port: Number(url.searchParams.get("port") || 554)
    };
  }

  // src/host/args.js
  init_buffer_shim();
  var HOST_DEFAULTS = { host: "127.0.0.1", port: 8787, root: "", allow: "", target: "", url: "" };
  function parseHostArgs(argv = []) {
    const out = { ...HOST_DEFAULTS, help: false };
    for (let i = 0; i < argv.length; i++) {
      const arg = argv[i];
      if (arg === "--help" || arg === "-h") {
        out.help = true;
        continue;
      }
      if (!arg.startsWith("--")) continue;
      const eq = arg.indexOf("=");
      const key = eq > 0 ? arg.slice(2, eq) : arg.slice(2);
      const value = eq > 0 ? arg.slice(eq + 1) : argv[++i];
      if (!(key in HOST_DEFAULTS)) throw new Error(`unknown option --${key}`);
      out[key] = key === "port" ? Number(value) : String(value ?? "");
    }
    if (!Number.isFinite(out.port) || out.port <= 0) throw new Error("--port must be a number");
    return out;
  }
  var HOST_HELP = `havi-rtsp host (same file as the browser script)

  deno run --allow-net --allow-read havi-rtsp.browser.js [options]

  --host 127.0.0.1     bind address (off-localhost needs --allow or --target)
  --port 8787          bind port
  --root ./public      serve this directory (default: built-in page)
  --allow host:port,\u2026  camera targets the browser may open
  --target host:port   single fixed camera; browser cannot pick another
  --url rtsp://\u2026       preset for the built-in page

  Routes: /tcp (WebSocket byte pipe), /tcp/open|read|write|close (HTTP byte layer), /havi-rtsp.browser.js (this file).
  No RTSP in this process. The page does RTSP, depay and remux.`;

  // src/host/page.js
  init_buffer_shim();
  function builtinPage({ url = "" } = {}) {
    const preset = escapeAttr(url);
    return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Havi-RTSP</title>
<style>
.havi-app{margin:0;background:#0b0d10;color:#e6e8eb;font:14px/1.4 system-ui,Segoe UI,Roboto,sans-serif}
.havi-app-layout{max-width:1100px;margin:0 auto;padding:20px;display:grid;gap:14px}
.havi-app-title{margin:0;font-size:20px;font-weight:600}
.havi-app-sub{margin:2px 0 0;color:#98a2ad;font-size:12px}
.havi-app-form{display:grid;grid-template-columns:1fr auto;gap:10px;align-items:end}
.havi-app-field{display:grid;gap:4px;font-size:12px;color:#98a2ad}
.havi-app-field input{width:100%;box-sizing:border-box;padding:9px 10px;border:1px solid #262b33;background:#12161b;color:#e6e8eb;font:inherit}
.havi-app-actions{display:flex;gap:8px}
.havi-app-btn{padding:9px 16px;border:1px solid #262b33;background:#171c22;color:#e6e8eb;font:inherit;cursor:pointer}
.havi-app-btn-primary{background:#2f6feb;border-color:#2f6feb;color:#fff}
.havi-app-stage{background:#000;aspect-ratio:16/9;display:grid}
.havi-app-stage havi-player,.havi-app-stage video,.havi-app-stage canvas,.havi-app-stage img{width:100%;height:100%;object-fit:contain;grid-area:1/1}
.havi-app-status{margin:0;color:#98a2ad}
.havi-app-status[data-kind="ok"]{color:#7bd88f}
.havi-app-status[data-kind="err"]{color:#ff8a80}
</style>
</head>
<body class="havi-app havi-app-page">
<main class="havi-app-layout">
  <header><h1 class="havi-app-title">Havi-RTSP</h1><p class="havi-app-sub">RTSP, depay and remux run in this page. This host only copies bytes.</p></header>
  <form class="havi-app-form" id="app-form">
    <label class="havi-app-field"><span>Camera</span>
      <input id="app-url" type="text" value="${preset}" placeholder="rtsp://user:pass@camera:554/path" autocomplete="off" spellcheck="false" /></label>
    <div class="havi-app-actions">
      <button type="submit" class="havi-app-btn havi-app-btn-primary">Play</button>
      <button type="button" class="havi-app-btn" id="app-stop">Stop</button>
    </div>
  </form>
  <section class="havi-app-stage"><havi-player id="app-player" muted controls></havi-player></section>
  <p class="havi-app-status" id="app-status">Idle. Paste a camera URL.</p>
</main>
<script src="/havi-rtsp.browser.js"><\/script>
<script>
(() => {
  const player = document.getElementById("app-player");
  const status = document.getElementById("app-status");
  const input = document.getElementById("app-url");
  player.addEventListener("havi-status", (e) => { status.textContent = e.detail.text; status.dataset.kind = e.detail.kind || ""; });
  document.getElementById("app-form").addEventListener("submit", (e) => { e.preventDefault(); player.src = input.value.trim(); });
  document.getElementById("app-stop").addEventListener("click", () => { player.src = ""; status.textContent = "Stopped."; });
  const q = new URLSearchParams(location.search).get("src");
  if (q) input.value = q;
  if (input.value) player.src = input.value;
})();
<\/script>
</body>
</html>`;
  }
  function escapeAttr(value) {
    return String(value).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
  }

  // src/host/deno.js
  var TYPES = {
    ".html": "text/html; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".mjs": "text/javascript; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".json": "application/json",
    ".png": "image/png",
    ".gif": "image/gif",
    ".svg": "image/svg+xml",
    ".ico": "image/x-icon",
    ".map": "application/json",
    ".webmanifest": "application/manifest+json"
  };
  function isDenoHost() {
    return typeof globalThis.Deno?.serve === "function" && typeof document === "undefined";
  }
  async function startDenoHost(argv = globalThis.Deno?.args || []) {
    const D = globalThis.Deno;
    if (!D) throw new Error("startDenoHost needs Deno");
    let opts;
    try {
      opts = parseHostArgs(argv);
    } catch (err) {
      console.error(err.message);
      console.error(HOST_HELP);
      D.exit(2);
    }
    if (opts.help) {
      console.log(HOST_HELP);
      return null;
    }
    const allow = normalizeAllow(opts.allow);
    const fixed = opts.target ? splitTarget(opts.target) : null;
    const requireAllow = !isLoopback(opts.host);
    const policy = { allow, fixed, requireAllow };
    const sessions = /* @__PURE__ */ new Map();
    const log = (text) => console.error(`[havi-host] ${text}`);
    const selfBytes = await readSelf(D);
    async function dial(url) {
      const target = targetFromQuery(url, fixed);
      const reason = checkTarget(target, policy);
      if (reason) return { error: reason, status: reason === "host and port required" ? 400 : 403 };
      try {
        const conn = await D.connect({ hostname: target.host, port: target.port });
        try {
          conn.setNoDelay(true);
        } catch {
        }
        return { conn, target };
      } catch (err) {
        return { error: err.message, status: 502 };
      }
    }
    function handleWs(req, url) {
      const { socket, response } = D.upgradeWebSocket(req);
      socket.binaryType = "arraybuffer";
      let writer = null;
      let finished = false;
      let done = () => {
        finished = true;
      };
      const pending = [];
      socket.onmessage = (e) => {
        const bytes = typeof e.data === "string" ? new TextEncoder().encode(e.data) : new Uint8Array(e.data);
        if (writer) writer.write(bytes).catch((err) => done(err.message));
        else pending.push(bytes);
      };
      socket.onclose = () => done("ws closed");
      socket.onerror = () => done("ws error");
      socket.onopen = async () => {
        const d = await dial(url);
        if (finished) {
          if (d.conn) try {
            d.conn.close();
          } catch {
          }
          return;
        }
        if (d.error) {
          socket.close(1008, d.error);
          return;
        }
        const { conn, target } = d;
        log(`open  ${target.host}:${target.port} ws`);
        writer = conn.writable.getWriter();
        done = (why) => {
          if (finished) return;
          finished = true;
          writer.close().catch(() => {
          });
          try {
            conn.close();
          } catch {
          }
          if (socket.readyState <= 1) socket.close();
          log(`close ${target.host}:${target.port} ${why}`);
        };
        for (const bytes of pending.splice(0)) writer.write(bytes).catch((err) => done(err.message));
        pump(conn.readable, (chunk) => {
          if (socket.readyState === 1) socket.send(chunk);
        }).then(() => done("tcp closed"), (err) => done(err.message));
      };
      return response;
    }
    async function handleHttpTcp(req, url) {
      const id = url.searchParams.get("id");
      if (url.pathname === "/tcp/open" && req.method === "POST") {
        const d = await dial(url);
        if (d.error) return json({ error: d.error }, d.status);
        const sid = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;
        const s2 = { conn: d.conn, writer: d.conn.writable.getWriter(), target: d.target };
        sessions.set(sid, s2);
        log(`open  ${d.target.host}:${d.target.port} http ${sid}`);
        return json({ id: sid });
      }
      const s = sessions.get(id);
      if (!s) return json({ error: "unknown session" }, 404);
      if (url.pathname === "/tcp/read" && req.method === "GET") {
        req.signal?.addEventListener("abort", () => closeSession(id, "read aborted"));
        const body = s.conn.readable.pipeThrough(new TransformStream({ flush: () => closeSession(id, "tcp closed") }));
        return new Response(body, { headers: { "content-type": "application/octet-stream", "cache-control": "no-store", "x-accel-buffering": "no" } });
      }
      if (url.pathname === "/tcp/write" && req.method === "POST") {
        const bytes = new Uint8Array(await req.arrayBuffer());
        try {
          if (bytes.length) await s.writer.write(bytes);
          return new Response(null, { status: 204 });
        } catch (err) {
          closeSession(id, err.message);
          return json({ error: err.message }, 502);
        }
      }
      if (url.pathname === "/tcp/close" && (req.method === "POST" || req.method === "DELETE")) {
        closeSession(id, "closed by client");
        return new Response(null, { status: 204 });
      }
      return json({ error: "not found" }, 404);
    }
    function closeSession(id, why) {
      const s = sessions.get(id);
      if (!s) return;
      sessions.delete(id);
      s.writer.close().catch(() => {
      });
      try {
        s.conn.close();
      } catch {
      }
      log(`close ${s.target.host}:${s.target.port} ${why}`);
    }
    async function handleStatic(url) {
      if (url.pathname === "/havi-rtsp.browser.js" && selfBytes) {
        return new Response(selfBytes, { headers: { "content-type": TYPES[".js"], "cache-control": "no-store" } });
      }
      if (opts.root) {
        const rel = decodeURIComponent(url.pathname).replace(/\/+$/, "") || "/index.html";
        if (!rel.includes("..")) {
          const file = `${opts.root.replace(/[\\/]+$/, "")}${rel.split("/").join("/")}`;
          try {
            const bytes = await D.readFile(file);
            const ext = rel.slice(rel.lastIndexOf(".")).toLowerCase();
            return new Response(bytes, { headers: { "content-type": TYPES[ext] || "application/octet-stream" } });
          } catch {
          }
        }
      }
      if (url.pathname === "/" || url.pathname === "/index.html") {
        return new Response(builtinPage({ url: opts.url }), { headers: { "content-type": TYPES[".html"] } });
      }
      return new Response("not found", { status: 404 });
    }
    const server = D.serve({
      hostname: opts.host,
      port: opts.port,
      onListen: ({ hostname, port }) => {
        log(`listening http://${hostname}:${port}/  (ws pipe /tcp, http layer /tcp/open)`);
        if (requireAllow && !allow && !fixed) log("warning: bound off localhost without --allow or --target; camera opens will be refused");
      }
    }, async (req) => {
      const url = new URL(req.url);
      if (url.pathname === "/tcp" && req.headers.get("upgrade")?.toLowerCase() === "websocket") return handleWs(req, url);
      if (url.pathname.startsWith("/tcp/")) return handleHttpTcp(req, url);
      return handleStatic(url);
    });
    return server;
  }
  async function pump(readable, onChunk) {
    const reader = readable.getReader();
    try {
      while (true) {
        const { value, done } = await reader.read();
        if (done) return;
        if (value?.byteLength) onChunk(value);
      }
    } finally {
      reader.releaseLock();
    }
  }
  async function readSelf(D) {
    try {
      const main = D.mainModule || "";
      if (main.startsWith("file:")) return await D.readFile(new URL(main));
    } catch {
    }
    return null;
  }
  function json(body, status = 200) {
    return new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json; charset=utf-8" } });
  }

  // src/browser.js
  var DEFAULT_PIPE = GATEWAY_PIPE;
  var currentLayer = {};
  function configureLayer(options = {}) {
    currentLayer = options || {};
    setDefaultTransport(createBrowserConnect(currentLayer));
  }
  function configurePipe(proxy) {
    configureLayer({ proxy: proxy || inferPipe() });
  }
  function createPipeline(url, options = {}) {
    const connect = options.client?.connect || createBrowserConnect({
      ...currentLayer,
      proxy: options.proxy || currentLayer.proxy,
      base: options.base || currentLayer.base
    });
    return new RtspPipeline(url, {
      ...options,
      client: { connect, ...options.client || {} }
    });
  }
  if (!getDefaultTransport()) configureLayer();
  defineHaviPlayer();
  autoload();
  if (isDenoHost()) {
    startDenoHost();
  }
  return __toCommonJS(browser_exports);
})();
//# sourceMappingURL=havi-rtsp.browser.js.map
