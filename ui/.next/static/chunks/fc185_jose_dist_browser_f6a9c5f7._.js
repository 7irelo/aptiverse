(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/util/errors.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "JOSEAlgNotAllowed",
    ()=>JOSEAlgNotAllowed,
    "JOSEError",
    ()=>JOSEError,
    "JOSENotSupported",
    ()=>JOSENotSupported,
    "JWEDecompressionFailed",
    ()=>JWEDecompressionFailed,
    "JWEDecryptionFailed",
    ()=>JWEDecryptionFailed,
    "JWEInvalid",
    ()=>JWEInvalid,
    "JWKInvalid",
    ()=>JWKInvalid,
    "JWKSInvalid",
    ()=>JWKSInvalid,
    "JWKSMultipleMatchingKeys",
    ()=>JWKSMultipleMatchingKeys,
    "JWKSNoMatchingKey",
    ()=>JWKSNoMatchingKey,
    "JWKSTimeout",
    ()=>JWKSTimeout,
    "JWSInvalid",
    ()=>JWSInvalid,
    "JWSSignatureVerificationFailed",
    ()=>JWSSignatureVerificationFailed,
    "JWTClaimValidationFailed",
    ()=>JWTClaimValidationFailed,
    "JWTExpired",
    ()=>JWTExpired,
    "JWTInvalid",
    ()=>JWTInvalid
]);
class JOSEError extends Error {
    static get code() {
        return 'ERR_JOSE_GENERIC';
    }
    constructor(message){
        var _a;
        super(message);
        this.code = 'ERR_JOSE_GENERIC';
        this.name = this.constructor.name;
        (_a = Error.captureStackTrace) === null || _a === void 0 ? void 0 : _a.call(Error, this, this.constructor);
    }
}
class JWTClaimValidationFailed extends JOSEError {
    static get code() {
        return 'ERR_JWT_CLAIM_VALIDATION_FAILED';
    }
    constructor(message, claim = 'unspecified', reason = 'unspecified'){
        super(message);
        this.code = 'ERR_JWT_CLAIM_VALIDATION_FAILED';
        this.claim = claim;
        this.reason = reason;
    }
}
class JWTExpired extends JOSEError {
    static get code() {
        return 'ERR_JWT_EXPIRED';
    }
    constructor(message, claim = 'unspecified', reason = 'unspecified'){
        super(message);
        this.code = 'ERR_JWT_EXPIRED';
        this.claim = claim;
        this.reason = reason;
    }
}
class JOSEAlgNotAllowed extends JOSEError {
    static get code() {
        return 'ERR_JOSE_ALG_NOT_ALLOWED';
    }
    constructor(){
        super(...arguments);
        this.code = 'ERR_JOSE_ALG_NOT_ALLOWED';
    }
}
class JOSENotSupported extends JOSEError {
    static get code() {
        return 'ERR_JOSE_NOT_SUPPORTED';
    }
    constructor(){
        super(...arguments);
        this.code = 'ERR_JOSE_NOT_SUPPORTED';
    }
}
class JWEDecryptionFailed extends JOSEError {
    static get code() {
        return 'ERR_JWE_DECRYPTION_FAILED';
    }
    constructor(){
        super(...arguments);
        this.code = 'ERR_JWE_DECRYPTION_FAILED';
        this.message = 'decryption operation failed';
    }
}
class JWEDecompressionFailed extends JOSEError {
    static get code() {
        return 'ERR_JWE_DECOMPRESSION_FAILED';
    }
    constructor(){
        super(...arguments);
        this.code = 'ERR_JWE_DECOMPRESSION_FAILED';
        this.message = 'decompression operation failed';
    }
}
class JWEInvalid extends JOSEError {
    static get code() {
        return 'ERR_JWE_INVALID';
    }
    constructor(){
        super(...arguments);
        this.code = 'ERR_JWE_INVALID';
    }
}
class JWSInvalid extends JOSEError {
    static get code() {
        return 'ERR_JWS_INVALID';
    }
    constructor(){
        super(...arguments);
        this.code = 'ERR_JWS_INVALID';
    }
}
class JWTInvalid extends JOSEError {
    static get code() {
        return 'ERR_JWT_INVALID';
    }
    constructor(){
        super(...arguments);
        this.code = 'ERR_JWT_INVALID';
    }
}
class JWKInvalid extends JOSEError {
    static get code() {
        return 'ERR_JWK_INVALID';
    }
    constructor(){
        super(...arguments);
        this.code = 'ERR_JWK_INVALID';
    }
}
class JWKSInvalid extends JOSEError {
    static get code() {
        return 'ERR_JWKS_INVALID';
    }
    constructor(){
        super(...arguments);
        this.code = 'ERR_JWKS_INVALID';
    }
}
class JWKSNoMatchingKey extends JOSEError {
    static get code() {
        return 'ERR_JWKS_NO_MATCHING_KEY';
    }
    constructor(){
        super(...arguments);
        this.code = 'ERR_JWKS_NO_MATCHING_KEY';
        this.message = 'no applicable key found in the JSON Web Key Set';
    }
}
class JWKSMultipleMatchingKeys extends JOSEError {
    static get code() {
        return 'ERR_JWKS_MULTIPLE_MATCHING_KEYS';
    }
    constructor(){
        super(...arguments);
        this.code = 'ERR_JWKS_MULTIPLE_MATCHING_KEYS';
        this.message = 'multiple matching keys found in the JSON Web Key Set';
    }
}
Symbol.asyncIterator;
class JWKSTimeout extends JOSEError {
    static get code() {
        return 'ERR_JWKS_TIMEOUT';
    }
    constructor(){
        super(...arguments);
        this.code = 'ERR_JWKS_TIMEOUT';
        this.message = 'request timed out';
    }
}
class JWSSignatureVerificationFailed extends JOSEError {
    static get code() {
        return 'ERR_JWS_SIGNATURE_VERIFICATION_FAILED';
    }
    constructor(){
        super(...arguments);
        this.code = 'ERR_JWS_SIGNATURE_VERIFICATION_FAILED';
        this.message = 'signature verification failed';
    }
}
}),
"[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/runtime/webcrypto.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__,
    "isCryptoKey",
    ()=>isCryptoKey
]);
const __TURBOPACK__default__export__ = crypto;
const isCryptoKey = (key)=>key instanceof CryptoKey;
}),
"[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/runtime/digest.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$webcrypto$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/runtime/webcrypto.js [app-client] (ecmascript)");
;
const digest = async (algorithm, data)=>{
    const subtleDigest = "SHA-".concat(algorithm.slice(-3));
    return new Uint8Array(await __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$webcrypto$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].subtle.digest(subtleDigest, data));
};
const __TURBOPACK__default__export__ = digest;
}),
"[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/lib/buffer_utils.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "concat",
    ()=>concat,
    "concatKdf",
    ()=>concatKdf,
    "decoder",
    ()=>decoder,
    "encoder",
    ()=>encoder,
    "lengthAndInput",
    ()=>lengthAndInput,
    "p2s",
    ()=>p2s,
    "uint32be",
    ()=>uint32be,
    "uint64be",
    ()=>uint64be
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$digest$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/runtime/digest.js [app-client] (ecmascript)");
;
const encoder = new TextEncoder();
const decoder = new TextDecoder();
const MAX_INT32 = 2 ** 32;
function concat() {
    for(var _len = arguments.length, buffers = new Array(_len), _key = 0; _key < _len; _key++){
        buffers[_key] = arguments[_key];
    }
    const size = buffers.reduce((acc, param)=>{
        let { length } = param;
        return acc + length;
    }, 0);
    const buf = new Uint8Array(size);
    let i = 0;
    buffers.forEach((buffer)=>{
        buf.set(buffer, i);
        i += buffer.length;
    });
    return buf;
}
function p2s(alg, p2sInput) {
    return concat(encoder.encode(alg), new Uint8Array([
        0
    ]), p2sInput);
}
function writeUInt32BE(buf, value, offset) {
    if (value < 0 || value >= MAX_INT32) {
        throw new RangeError("value must be >= 0 and <= ".concat(MAX_INT32 - 1, ". Received ").concat(value));
    }
    buf.set([
        value >>> 24,
        value >>> 16,
        value >>> 8,
        value & 0xff
    ], offset);
}
function uint64be(value) {
    const high = Math.floor(value / MAX_INT32);
    const low = value % MAX_INT32;
    const buf = new Uint8Array(8);
    writeUInt32BE(buf, high, 0);
    writeUInt32BE(buf, low, 4);
    return buf;
}
function uint32be(value) {
    const buf = new Uint8Array(4);
    writeUInt32BE(buf, value);
    return buf;
}
function lengthAndInput(input) {
    return concat(uint32be(input.length), input);
}
async function concatKdf(secret, bits, value) {
    const iterations = Math.ceil((bits >> 3) / 32);
    const res = new Uint8Array(iterations * 32);
    for(let iter = 0; iter < iterations; iter++){
        const buf = new Uint8Array(4 + secret.length + value.length);
        buf.set(uint32be(iter + 1));
        buf.set(secret, 4);
        buf.set(value, 4 + secret.length);
        res.set(await (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$digest$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])('sha256', buf), iter * 32);
    }
    return res.slice(0, bits >> 3);
}
}),
"[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/runtime/base64url.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "decode",
    ()=>decode,
    "decodeBase64",
    ()=>decodeBase64,
    "encode",
    ()=>encode,
    "encodeBase64",
    ()=>encodeBase64
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$lib$2f$buffer_utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/lib/buffer_utils.js [app-client] (ecmascript)");
;
const encodeBase64 = (input)=>{
    let unencoded = input;
    if (typeof unencoded === 'string') {
        unencoded = __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$lib$2f$buffer_utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["encoder"].encode(unencoded);
    }
    const CHUNK_SIZE = 0x8000;
    const arr = [];
    for(let i = 0; i < unencoded.length; i += CHUNK_SIZE){
        arr.push(String.fromCharCode.apply(null, unencoded.subarray(i, i + CHUNK_SIZE)));
    }
    return btoa(arr.join(''));
};
const encode = (input)=>{
    return encodeBase64(input).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
};
const decodeBase64 = (encoded)=>{
    const binary = atob(encoded);
    const bytes = new Uint8Array(binary.length);
    for(let i = 0; i < binary.length; i++){
        bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
};
const decode = (input)=>{
    let encoded = input;
    if (encoded instanceof Uint8Array) {
        encoded = __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$lib$2f$buffer_utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["decoder"].decode(encoded);
    }
    encoded = encoded.replace(/-/g, '+').replace(/_/g, '/').replace(/\s/g, '');
    try {
        return decodeBase64(encoded);
    } catch (_a) {
        throw new TypeError('The input to be decoded is not correctly encoded.');
    }
};
}),
"[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/util/base64url.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "decode",
    ()=>decode,
    "encode",
    ()=>encode
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$base64url$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/runtime/base64url.js [app-client] (ecmascript)");
;
const encode = __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$base64url$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["encode"];
const decode = __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$base64url$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["decode"];
}),
"[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/index.js [app-client] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$util$2f$errors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/util/errors.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$util$2f$base64url$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/util/base64url.js [app-client] (ecmascript)");
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
}),
"[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/runtime/random.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$webcrypto$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/runtime/webcrypto.js [app-client] (ecmascript)");
;
const __TURBOPACK__default__export__ = __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$webcrypto$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].getRandomValues.bind(__TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$webcrypto$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"]);
}),
"[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/lib/iv.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "bitLength",
    ()=>bitLength,
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$util$2f$errors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/util/errors.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$random$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/runtime/random.js [app-client] (ecmascript)");
;
;
function bitLength(alg) {
    switch(alg){
        case 'A128GCM':
        case 'A128GCMKW':
        case 'A192GCM':
        case 'A192GCMKW':
        case 'A256GCM':
        case 'A256GCMKW':
            return 96;
        case 'A128CBC-HS256':
        case 'A192CBC-HS384':
        case 'A256CBC-HS512':
            return 128;
        default:
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$util$2f$errors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["JOSENotSupported"]("Unsupported JWE Algorithm: ".concat(alg));
    }
}
const __TURBOPACK__default__export__ = (alg)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$random$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(new Uint8Array(bitLength(alg) >> 3));
}),
"[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/lib/check_iv_length.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$util$2f$errors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/util/errors.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$lib$2f$iv$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/lib/iv.js [app-client] (ecmascript)");
;
;
const checkIvLength = (enc, iv)=>{
    if (iv.length << 3 !== (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$lib$2f$iv$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["bitLength"])(enc)) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$util$2f$errors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["JWEInvalid"]('Invalid Initialization Vector length');
    }
};
const __TURBOPACK__default__export__ = checkIvLength;
}),
"[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/runtime/check_cek_length.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$util$2f$errors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/util/errors.js [app-client] (ecmascript)");
;
const checkCekLength = (cek, expected)=>{
    const actual = cek.byteLength << 3;
    if (actual !== expected) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$util$2f$errors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["JWEInvalid"]("Invalid Content Encryption Key length. Expected ".concat(expected, " bits, got ").concat(actual, " bits"));
    }
};
const __TURBOPACK__default__export__ = checkCekLength;
}),
"[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/runtime/timing_safe_equal.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
const timingSafeEqual = (a, b)=>{
    if (!(a instanceof Uint8Array)) {
        throw new TypeError('First argument must be a buffer');
    }
    if (!(b instanceof Uint8Array)) {
        throw new TypeError('Second argument must be a buffer');
    }
    if (a.length !== b.length) {
        throw new TypeError('Input buffers must have the same length');
    }
    const len = a.length;
    let out = 0;
    let i = -1;
    while(++i < len){
        out |= a[i] ^ b[i];
    }
    return out === 0;
};
const __TURBOPACK__default__export__ = timingSafeEqual;
}),
"[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/lib/crypto_key.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "checkEncCryptoKey",
    ()=>checkEncCryptoKey,
    "checkSigCryptoKey",
    ()=>checkSigCryptoKey
]);
function unusable(name) {
    let prop = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 'algorithm.name';
    return new TypeError("CryptoKey does not support this operation, its ".concat(prop, " must be ").concat(name));
}
function isAlgorithm(algorithm, name) {
    return algorithm.name === name;
}
function getHashLength(hash) {
    return parseInt(hash.name.slice(4), 10);
}
function getNamedCurve(alg) {
    switch(alg){
        case 'ES256':
            return 'P-256';
        case 'ES384':
            return 'P-384';
        case 'ES512':
            return 'P-521';
        default:
            throw new Error('unreachable');
    }
}
function checkUsage(key, usages) {
    if (usages.length && !usages.some((expected)=>key.usages.includes(expected))) {
        let msg = 'CryptoKey does not support this operation, its usages must include ';
        if (usages.length > 2) {
            const last = usages.pop();
            msg += "one of ".concat(usages.join(', '), ", or ").concat(last, ".");
        } else if (usages.length === 2) {
            msg += "one of ".concat(usages[0], " or ").concat(usages[1], ".");
        } else {
            msg += "".concat(usages[0], ".");
        }
        throw new TypeError(msg);
    }
}
function checkSigCryptoKey(key, alg) {
    for(var _len = arguments.length, usages = new Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++){
        usages[_key - 2] = arguments[_key];
    }
    switch(alg){
        case 'HS256':
        case 'HS384':
        case 'HS512':
            {
                if (!isAlgorithm(key.algorithm, 'HMAC')) throw unusable('HMAC');
                const expected = parseInt(alg.slice(2), 10);
                const actual = getHashLength(key.algorithm.hash);
                if (actual !== expected) throw unusable("SHA-".concat(expected), 'algorithm.hash');
                break;
            }
        case 'RS256':
        case 'RS384':
        case 'RS512':
            {
                if (!isAlgorithm(key.algorithm, 'RSASSA-PKCS1-v1_5')) throw unusable('RSASSA-PKCS1-v1_5');
                const expected = parseInt(alg.slice(2), 10);
                const actual = getHashLength(key.algorithm.hash);
                if (actual !== expected) throw unusable("SHA-".concat(expected), 'algorithm.hash');
                break;
            }
        case 'PS256':
        case 'PS384':
        case 'PS512':
            {
                if (!isAlgorithm(key.algorithm, 'RSA-PSS')) throw unusable('RSA-PSS');
                const expected = parseInt(alg.slice(2), 10);
                const actual = getHashLength(key.algorithm.hash);
                if (actual !== expected) throw unusable("SHA-".concat(expected), 'algorithm.hash');
                break;
            }
        case 'EdDSA':
            {
                if (key.algorithm.name !== 'Ed25519' && key.algorithm.name !== 'Ed448') {
                    throw unusable('Ed25519 or Ed448');
                }
                break;
            }
        case 'ES256':
        case 'ES384':
        case 'ES512':
            {
                if (!isAlgorithm(key.algorithm, 'ECDSA')) throw unusable('ECDSA');
                const expected = getNamedCurve(alg);
                const actual = key.algorithm.namedCurve;
                if (actual !== expected) throw unusable(expected, 'algorithm.namedCurve');
                break;
            }
        default:
            throw new TypeError('CryptoKey does not support this operation');
    }
    checkUsage(key, usages);
}
function checkEncCryptoKey(key, alg) {
    for(var _len = arguments.length, usages = new Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++){
        usages[_key - 2] = arguments[_key];
    }
    switch(alg){
        case 'A128GCM':
        case 'A192GCM':
        case 'A256GCM':
            {
                if (!isAlgorithm(key.algorithm, 'AES-GCM')) throw unusable('AES-GCM');
                const expected = parseInt(alg.slice(1, 4), 10);
                const actual = key.algorithm.length;
                if (actual !== expected) throw unusable(expected, 'algorithm.length');
                break;
            }
        case 'A128KW':
        case 'A192KW':
        case 'A256KW':
            {
                if (!isAlgorithm(key.algorithm, 'AES-KW')) throw unusable('AES-KW');
                const expected = parseInt(alg.slice(1, 4), 10);
                const actual = key.algorithm.length;
                if (actual !== expected) throw unusable(expected, 'algorithm.length');
                break;
            }
        case 'ECDH':
            {
                switch(key.algorithm.name){
                    case 'ECDH':
                    case 'X25519':
                    case 'X448':
                        break;
                    default:
                        throw unusable('ECDH, X25519, or X448');
                }
                break;
            }
        case 'PBES2-HS256+A128KW':
        case 'PBES2-HS384+A192KW':
        case 'PBES2-HS512+A256KW':
            if (!isAlgorithm(key.algorithm, 'PBKDF2')) throw unusable('PBKDF2');
            break;
        case 'RSA-OAEP':
        case 'RSA-OAEP-256':
        case 'RSA-OAEP-384':
        case 'RSA-OAEP-512':
            {
                if (!isAlgorithm(key.algorithm, 'RSA-OAEP')) throw unusable('RSA-OAEP');
                const expected = parseInt(alg.slice(9), 10) || 1;
                const actual = getHashLength(key.algorithm.hash);
                if (actual !== expected) throw unusable("SHA-".concat(expected), 'algorithm.hash');
                break;
            }
        default:
            throw new TypeError('CryptoKey does not support this operation');
    }
    checkUsage(key, usages);
}
}),
"[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/lib/invalid_key_input.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__,
    "withAlg",
    ()=>withAlg
]);
function message(msg, actual) {
    for(var _len = arguments.length, types = new Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++){
        types[_key - 2] = arguments[_key];
    }
    if (types.length > 2) {
        const last = types.pop();
        msg += "one of type ".concat(types.join(', '), ", or ").concat(last, ".");
    } else if (types.length === 2) {
        msg += "one of type ".concat(types[0], " or ").concat(types[1], ".");
    } else {
        msg += "of type ".concat(types[0], ".");
    }
    if (actual == null) {
        msg += " Received ".concat(actual);
    } else if (typeof actual === 'function' && actual.name) {
        msg += " Received function ".concat(actual.name);
    } else if (typeof actual === 'object' && actual != null) {
        if (actual.constructor && actual.constructor.name) {
            msg += " Received an instance of ".concat(actual.constructor.name);
        }
    }
    return msg;
}
const __TURBOPACK__default__export__ = function(actual) {
    for(var _len = arguments.length, types = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++){
        types[_key - 1] = arguments[_key];
    }
    return message('Key must be ', actual, ...types);
};
function withAlg(alg, actual) {
    for(var _len = arguments.length, types = new Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++){
        types[_key - 2] = arguments[_key];
    }
    return message("Key for the ".concat(alg, " algorithm must be "), actual, ...types);
}
}),
"[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/runtime/is_key_like.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__,
    "types",
    ()=>types
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$webcrypto$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/runtime/webcrypto.js [app-client] (ecmascript)");
;
const __TURBOPACK__default__export__ = (key)=>{
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$webcrypto$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isCryptoKey"])(key);
};
const types = [
    'CryptoKey'
];
}),
"[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/runtime/decrypt.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$lib$2f$buffer_utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/lib/buffer_utils.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$lib$2f$check_iv_length$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/lib/check_iv_length.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$check_cek_length$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/runtime/check_cek_length.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$timing_safe_equal$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/runtime/timing_safe_equal.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$util$2f$errors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/util/errors.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$webcrypto$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/runtime/webcrypto.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$lib$2f$crypto_key$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/lib/crypto_key.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$lib$2f$invalid_key_input$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/lib/invalid_key_input.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$is_key_like$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/runtime/is_key_like.js [app-client] (ecmascript)");
;
;
;
;
;
;
;
;
;
async function cbcDecrypt(enc, cek, ciphertext, iv, tag, aad) {
    if (!(cek instanceof Uint8Array)) {
        throw new TypeError((0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$lib$2f$invalid_key_input$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(cek, 'Uint8Array'));
    }
    const keySize = parseInt(enc.slice(1, 4), 10);
    const encKey = await __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$webcrypto$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].subtle.importKey('raw', cek.subarray(keySize >> 3), 'AES-CBC', false, [
        'decrypt'
    ]);
    const macKey = await __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$webcrypto$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].subtle.importKey('raw', cek.subarray(0, keySize >> 3), {
        hash: "SHA-".concat(keySize << 1),
        name: 'HMAC'
    }, false, [
        'sign'
    ]);
    const macData = (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$lib$2f$buffer_utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["concat"])(aad, iv, ciphertext, (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$lib$2f$buffer_utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["uint64be"])(aad.length << 3));
    const expectedTag = new Uint8Array((await __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$webcrypto$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].subtle.sign('HMAC', macKey, macData)).slice(0, keySize >> 3));
    let macCheckPassed;
    try {
        macCheckPassed = (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$timing_safe_equal$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(tag, expectedTag);
    } catch (_a) {}
    if (!macCheckPassed) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$util$2f$errors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["JWEDecryptionFailed"]();
    }
    let plaintext;
    try {
        plaintext = new Uint8Array(await __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$webcrypto$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].subtle.decrypt({
            iv,
            name: 'AES-CBC'
        }, encKey, ciphertext));
    } catch (_b) {}
    if (!plaintext) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$util$2f$errors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["JWEDecryptionFailed"]();
    }
    return plaintext;
}
async function gcmDecrypt(enc, cek, ciphertext, iv, tag, aad) {
    let encKey;
    if (cek instanceof Uint8Array) {
        encKey = await __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$webcrypto$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].subtle.importKey('raw', cek, 'AES-GCM', false, [
            'decrypt'
        ]);
    } else {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$lib$2f$crypto_key$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["checkEncCryptoKey"])(cek, enc, 'decrypt');
        encKey = cek;
    }
    try {
        return new Uint8Array(await __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$webcrypto$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].subtle.decrypt({
            additionalData: aad,
            iv,
            name: 'AES-GCM',
            tagLength: 128
        }, encKey, (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$lib$2f$buffer_utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["concat"])(ciphertext, tag)));
    } catch (_a) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$util$2f$errors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["JWEDecryptionFailed"]();
    }
}
const decrypt = async (enc, cek, ciphertext, iv, tag, aad)=>{
    if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$webcrypto$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isCryptoKey"])(cek) && !(cek instanceof Uint8Array)) {
        throw new TypeError((0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$lib$2f$invalid_key_input$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(cek, ...__TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$is_key_like$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["types"], 'Uint8Array'));
    }
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$lib$2f$check_iv_length$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(enc, iv);
    switch(enc){
        case 'A128CBC-HS256':
        case 'A192CBC-HS384':
        case 'A256CBC-HS512':
            if (cek instanceof Uint8Array) (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$check_cek_length$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(cek, parseInt(enc.slice(-3), 10));
            return cbcDecrypt(enc, cek, ciphertext, iv, tag, aad);
        case 'A128GCM':
        case 'A192GCM':
        case 'A256GCM':
            if (cek instanceof Uint8Array) (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$check_cek_length$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(cek, parseInt(enc.slice(1, 4), 10));
            return gcmDecrypt(enc, cek, ciphertext, iv, tag, aad);
        default:
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$util$2f$errors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["JOSENotSupported"]('Unsupported JWE Content Encryption Algorithm');
    }
};
const __TURBOPACK__default__export__ = decrypt;
}),
"[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/runtime/zlib.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "deflate",
    ()=>deflate,
    "inflate",
    ()=>inflate
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$util$2f$errors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/util/errors.js [app-client] (ecmascript)");
;
const inflate = async ()=>{
    throw new __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$util$2f$errors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["JOSENotSupported"]('JWE "zip" (Compression Algorithm) Header Parameter is not supported by your javascript runtime. You need to use the `inflateRaw` decrypt option to provide Inflate Raw implementation.');
};
const deflate = async ()=>{
    throw new __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$util$2f$errors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["JOSENotSupported"]('JWE "zip" (Compression Algorithm) Header Parameter is not supported by your javascript runtime. You need to use the `deflateRaw` encrypt option to provide Deflate Raw implementation.');
};
}),
"[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/lib/is_disjoint.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
const isDisjoint = function() {
    for(var _len = arguments.length, headers = new Array(_len), _key = 0; _key < _len; _key++){
        headers[_key] = arguments[_key];
    }
    const sources = headers.filter(Boolean);
    if (sources.length === 0 || sources.length === 1) {
        return true;
    }
    let acc;
    for (const header of sources){
        const parameters = Object.keys(header);
        if (!acc || acc.size === 0) {
            acc = new Set(parameters);
            continue;
        }
        for (const parameter of parameters){
            if (acc.has(parameter)) {
                return false;
            }
            acc.add(parameter);
        }
    }
    return true;
};
const __TURBOPACK__default__export__ = isDisjoint;
}),
"[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/lib/is_object.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>isObject
]);
function isObjectLike(value) {
    return typeof value === 'object' && value !== null;
}
function isObject(input) {
    if (!isObjectLike(input) || Object.prototype.toString.call(input) !== '[object Object]') {
        return false;
    }
    if (Object.getPrototypeOf(input) === null) {
        return true;
    }
    let proto = input;
    while(Object.getPrototypeOf(proto) !== null){
        proto = Object.getPrototypeOf(proto);
    }
    return Object.getPrototypeOf(input) === proto;
}
}),
"[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/runtime/bogus.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
const bogusWebCrypto = [
    {
        hash: 'SHA-256',
        name: 'HMAC'
    },
    true,
    [
        'sign'
    ]
];
const __TURBOPACK__default__export__ = bogusWebCrypto;
}),
"[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/runtime/aeskw.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "unwrap",
    ()=>unwrap,
    "wrap",
    ()=>wrap
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$bogus$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/runtime/bogus.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$webcrypto$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/runtime/webcrypto.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$lib$2f$crypto_key$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/lib/crypto_key.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$lib$2f$invalid_key_input$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/lib/invalid_key_input.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$is_key_like$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/runtime/is_key_like.js [app-client] (ecmascript)");
;
;
;
;
;
function checkKeySize(key, alg) {
    if (key.algorithm.length !== parseInt(alg.slice(1, 4), 10)) {
        throw new TypeError("Invalid key size for alg: ".concat(alg));
    }
}
function getCryptoKey(key, alg, usage) {
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$webcrypto$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isCryptoKey"])(key)) {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$lib$2f$crypto_key$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["checkEncCryptoKey"])(key, alg, usage);
        return key;
    }
    if (key instanceof Uint8Array) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$webcrypto$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].subtle.importKey('raw', key, 'AES-KW', true, [
            usage
        ]);
    }
    throw new TypeError((0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$lib$2f$invalid_key_input$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(key, ...__TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$is_key_like$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["types"], 'Uint8Array'));
}
const wrap = async (alg, key, cek)=>{
    const cryptoKey = await getCryptoKey(key, alg, 'wrapKey');
    checkKeySize(cryptoKey, alg);
    const cryptoKeyCek = await __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$webcrypto$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].subtle.importKey('raw', cek, ...__TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$bogus$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"]);
    return new Uint8Array(await __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$webcrypto$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].subtle.wrapKey('raw', cryptoKeyCek, cryptoKey, 'AES-KW'));
};
const unwrap = async (alg, key, encryptedKey)=>{
    const cryptoKey = await getCryptoKey(key, alg, 'unwrapKey');
    checkKeySize(cryptoKey, alg);
    const cryptoKeyCek = await __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$webcrypto$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].subtle.unwrapKey('raw', encryptedKey, cryptoKey, 'AES-KW', ...__TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$bogus$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"]);
    return new Uint8Array(await __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$webcrypto$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].subtle.exportKey('raw', cryptoKeyCek));
};
}),
"[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/runtime/ecdhes.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "deriveKey",
    ()=>deriveKey,
    "ecdhAllowed",
    ()=>ecdhAllowed,
    "generateEpk",
    ()=>generateEpk
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$lib$2f$buffer_utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/lib/buffer_utils.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$webcrypto$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/runtime/webcrypto.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$lib$2f$crypto_key$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/lib/crypto_key.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$lib$2f$invalid_key_input$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/lib/invalid_key_input.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$is_key_like$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/runtime/is_key_like.js [app-client] (ecmascript)");
;
;
;
;
;
async function deriveKey(publicKey, privateKey, algorithm, keyLength) {
    let apu = arguments.length > 4 && arguments[4] !== void 0 ? arguments[4] : new Uint8Array(0), apv = arguments.length > 5 && arguments[5] !== void 0 ? arguments[5] : new Uint8Array(0);
    if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$webcrypto$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isCryptoKey"])(publicKey)) {
        throw new TypeError((0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$lib$2f$invalid_key_input$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(publicKey, ...__TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$is_key_like$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["types"]));
    }
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$lib$2f$crypto_key$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["checkEncCryptoKey"])(publicKey, 'ECDH');
    if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$webcrypto$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isCryptoKey"])(privateKey)) {
        throw new TypeError((0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$lib$2f$invalid_key_input$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(privateKey, ...__TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$is_key_like$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["types"]));
    }
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$lib$2f$crypto_key$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["checkEncCryptoKey"])(privateKey, 'ECDH', 'deriveBits');
    const value = (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$lib$2f$buffer_utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["concat"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$lib$2f$buffer_utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["lengthAndInput"])(__TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$lib$2f$buffer_utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["encoder"].encode(algorithm)), (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$lib$2f$buffer_utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["lengthAndInput"])(apu), (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$lib$2f$buffer_utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["lengthAndInput"])(apv), (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$lib$2f$buffer_utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["uint32be"])(keyLength));
    let length;
    if (publicKey.algorithm.name === 'X25519') {
        length = 256;
    } else if (publicKey.algorithm.name === 'X448') {
        length = 448;
    } else {
        length = Math.ceil(parseInt(publicKey.algorithm.namedCurve.substr(-3), 10) / 8) << 3;
    }
    const sharedSecret = new Uint8Array(await __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$webcrypto$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].subtle.deriveBits({
        name: publicKey.algorithm.name,
        public: publicKey
    }, privateKey, length));
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$lib$2f$buffer_utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["concatKdf"])(sharedSecret, keyLength, value);
}
async function generateEpk(key) {
    if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$webcrypto$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isCryptoKey"])(key)) {
        throw new TypeError((0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$lib$2f$invalid_key_input$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(key, ...__TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$is_key_like$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["types"]));
    }
    return __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$webcrypto$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].subtle.generateKey(key.algorithm, true, [
        'deriveBits'
    ]);
}
function ecdhAllowed(key) {
    if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$webcrypto$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isCryptoKey"])(key)) {
        throw new TypeError((0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$lib$2f$invalid_key_input$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(key, ...__TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$is_key_like$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["types"]));
    }
    return [
        'P-256',
        'P-384',
        'P-521'
    ].includes(key.algorithm.namedCurve) || key.algorithm.name === 'X25519' || key.algorithm.name === 'X448';
}
}),
"[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/lib/check_p2s.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>checkP2s
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$util$2f$errors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/util/errors.js [app-client] (ecmascript)");
;
function checkP2s(p2s) {
    if (!(p2s instanceof Uint8Array) || p2s.length < 8) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$util$2f$errors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["JWEInvalid"]('PBES2 Salt Input must be 8 or more octets');
    }
}
}),
"[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/runtime/pbes2kw.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "decrypt",
    ()=>decrypt,
    "encrypt",
    ()=>encrypt
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$random$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/runtime/random.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$lib$2f$buffer_utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/lib/buffer_utils.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$base64url$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/runtime/base64url.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$aeskw$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/runtime/aeskw.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$lib$2f$check_p2s$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/lib/check_p2s.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$webcrypto$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/runtime/webcrypto.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$lib$2f$crypto_key$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/lib/crypto_key.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$lib$2f$invalid_key_input$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/lib/invalid_key_input.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$is_key_like$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/runtime/is_key_like.js [app-client] (ecmascript)");
;
;
;
;
;
;
;
;
;
function getCryptoKey(key, alg) {
    if (key instanceof Uint8Array) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$webcrypto$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].subtle.importKey('raw', key, 'PBKDF2', false, [
            'deriveBits'
        ]);
    }
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$webcrypto$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isCryptoKey"])(key)) {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$lib$2f$crypto_key$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["checkEncCryptoKey"])(key, alg, 'deriveBits', 'deriveKey');
        return key;
    }
    throw new TypeError((0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$lib$2f$invalid_key_input$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(key, ...__TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$is_key_like$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["types"], 'Uint8Array'));
}
async function deriveKey(p2s, alg, p2c, key) {
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$lib$2f$check_p2s$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(p2s);
    const salt = (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$lib$2f$buffer_utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["p2s"])(alg, p2s);
    const keylen = parseInt(alg.slice(13, 16), 10);
    const subtleAlg = {
        hash: "SHA-".concat(alg.slice(8, 11)),
        iterations: p2c,
        name: 'PBKDF2',
        salt
    };
    const wrapAlg = {
        length: keylen,
        name: 'AES-KW'
    };
    const cryptoKey = await getCryptoKey(key, alg);
    if (cryptoKey.usages.includes('deriveBits')) {
        return new Uint8Array(await __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$webcrypto$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].subtle.deriveBits(subtleAlg, cryptoKey, keylen));
    }
    if (cryptoKey.usages.includes('deriveKey')) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$webcrypto$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].subtle.deriveKey(subtleAlg, cryptoKey, wrapAlg, false, [
            'wrapKey',
            'unwrapKey'
        ]);
    }
    throw new TypeError('PBKDF2 key "usages" must include "deriveBits" or "deriveKey"');
}
const encrypt = async function(alg, key, cek) {
    let p2c = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : 2048, p2s = arguments.length > 4 && arguments[4] !== void 0 ? arguments[4] : (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$random$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(new Uint8Array(16));
    const derived = await deriveKey(p2s, alg, p2c, key);
    const encryptedKey = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$aeskw$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["wrap"])(alg.slice(-6), derived, cek);
    return {
        encryptedKey,
        p2c,
        p2s: (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$base64url$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["encode"])(p2s)
    };
};
const decrypt = async (alg, key, encryptedKey, p2c, p2s)=>{
    const derived = await deriveKey(p2s, alg, p2c, key);
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$aeskw$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["unwrap"])(alg.slice(-6), derived, encryptedKey);
};
}),
"[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/runtime/subtle_rsaes.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>subtleRsaEs
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$util$2f$errors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/util/errors.js [app-client] (ecmascript)");
;
function subtleRsaEs(alg) {
    switch(alg){
        case 'RSA-OAEP':
        case 'RSA-OAEP-256':
        case 'RSA-OAEP-384':
        case 'RSA-OAEP-512':
            return 'RSA-OAEP';
        default:
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$util$2f$errors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["JOSENotSupported"]("alg ".concat(alg, " is not supported either by JOSE or your javascript runtime"));
    }
}
}),
"[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/runtime/check_key_length.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
const __TURBOPACK__default__export__ = (alg, key)=>{
    if (alg.startsWith('RS') || alg.startsWith('PS')) {
        const { modulusLength } = key.algorithm;
        if (typeof modulusLength !== 'number' || modulusLength < 2048) {
            throw new TypeError("".concat(alg, " requires key modulusLength to be 2048 bits or larger"));
        }
    }
};
}),
"[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/runtime/rsaes.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "decrypt",
    ()=>decrypt,
    "encrypt",
    ()=>encrypt
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$subtle_rsaes$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/runtime/subtle_rsaes.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$bogus$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/runtime/bogus.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$webcrypto$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/runtime/webcrypto.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$lib$2f$crypto_key$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/lib/crypto_key.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$check_key_length$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/runtime/check_key_length.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$lib$2f$invalid_key_input$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/lib/invalid_key_input.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$is_key_like$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/runtime/is_key_like.js [app-client] (ecmascript)");
;
;
;
;
;
;
;
const encrypt = async (alg, key, cek)=>{
    if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$webcrypto$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isCryptoKey"])(key)) {
        throw new TypeError((0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$lib$2f$invalid_key_input$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(key, ...__TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$is_key_like$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["types"]));
    }
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$lib$2f$crypto_key$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["checkEncCryptoKey"])(key, alg, 'encrypt', 'wrapKey');
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$check_key_length$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(alg, key);
    if (key.usages.includes('encrypt')) {
        return new Uint8Array(await __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$webcrypto$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].subtle.encrypt((0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$subtle_rsaes$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(alg), key, cek));
    }
    if (key.usages.includes('wrapKey')) {
        const cryptoKeyCek = await __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$webcrypto$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].subtle.importKey('raw', cek, ...__TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$bogus$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"]);
        return new Uint8Array(await __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$webcrypto$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].subtle.wrapKey('raw', cryptoKeyCek, key, (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$subtle_rsaes$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(alg)));
    }
    throw new TypeError('RSA-OAEP key "usages" must include "encrypt" or "wrapKey" for this operation');
};
const decrypt = async (alg, key, encryptedKey)=>{
    if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$webcrypto$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isCryptoKey"])(key)) {
        throw new TypeError((0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$lib$2f$invalid_key_input$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(key, ...__TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$is_key_like$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["types"]));
    }
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$lib$2f$crypto_key$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["checkEncCryptoKey"])(key, alg, 'decrypt', 'unwrapKey');
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$check_key_length$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(alg, key);
    if (key.usages.includes('decrypt')) {
        return new Uint8Array(await __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$webcrypto$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].subtle.decrypt((0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$subtle_rsaes$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(alg), key, encryptedKey));
    }
    if (key.usages.includes('unwrapKey')) {
        const cryptoKeyCek = await __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$webcrypto$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].subtle.unwrapKey('raw', encryptedKey, key, (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$subtle_rsaes$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(alg), ...__TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$bogus$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"]);
        return new Uint8Array(await __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$webcrypto$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].subtle.exportKey('raw', cryptoKeyCek));
    }
    throw new TypeError('RSA-OAEP key "usages" must include "decrypt" or "unwrapKey" for this operation');
};
}),
"[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/lib/cek.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "bitLength",
    ()=>bitLength,
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$util$2f$errors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/util/errors.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$random$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/runtime/random.js [app-client] (ecmascript)");
;
;
function bitLength(alg) {
    switch(alg){
        case 'A128GCM':
            return 128;
        case 'A192GCM':
            return 192;
        case 'A256GCM':
        case 'A128CBC-HS256':
            return 256;
        case 'A192CBC-HS384':
            return 384;
        case 'A256CBC-HS512':
            return 512;
        default:
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$util$2f$errors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["JOSENotSupported"]("Unsupported JWE Algorithm: ".concat(alg));
    }
}
const __TURBOPACK__default__export__ = (alg)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$random$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(new Uint8Array(bitLength(alg) >> 3));
}),
"[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/lib/format_pem.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
const __TURBOPACK__default__export__ = (b64, descriptor)=>{
    const newlined = (b64.match(/.{1,64}/g) || []).join('\n');
    return "-----BEGIN ".concat(descriptor, "-----\n").concat(newlined, "\n-----END ").concat(descriptor, "-----");
};
}),
"[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/runtime/asn1.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "fromPKCS8",
    ()=>fromPKCS8,
    "fromSPKI",
    ()=>fromSPKI,
    "fromX509",
    ()=>fromX509,
    "toPKCS8",
    ()=>toPKCS8,
    "toSPKI",
    ()=>toSPKI
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$webcrypto$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/runtime/webcrypto.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$lib$2f$invalid_key_input$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/lib/invalid_key_input.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$base64url$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/runtime/base64url.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$lib$2f$format_pem$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/lib/format_pem.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$util$2f$errors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/util/errors.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$is_key_like$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/runtime/is_key_like.js [app-client] (ecmascript)");
;
;
;
;
;
;
const genericExport = async (keyType, keyFormat, key)=>{
    if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$webcrypto$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isCryptoKey"])(key)) {
        throw new TypeError((0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$lib$2f$invalid_key_input$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(key, ...__TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$is_key_like$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["types"]));
    }
    if (!key.extractable) {
        throw new TypeError('CryptoKey is not extractable');
    }
    if (key.type !== keyType) {
        throw new TypeError("key is not a ".concat(keyType, " key"));
    }
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$lib$2f$format_pem$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$base64url$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["encodeBase64"])(new Uint8Array(await __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$webcrypto$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].subtle.exportKey(keyFormat, key))), "".concat(keyType.toUpperCase(), " KEY"));
};
const toSPKI = (key)=>{
    return genericExport('public', 'spki', key);
};
const toPKCS8 = (key)=>{
    return genericExport('private', 'pkcs8', key);
};
const findOid = function(keyData, oid) {
    let from = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : 0;
    if (from === 0) {
        oid.unshift(oid.length);
        oid.unshift(0x06);
    }
    let i = keyData.indexOf(oid[0], from);
    if (i === -1) return false;
    const sub = keyData.subarray(i, i + oid.length);
    if (sub.length !== oid.length) return false;
    return sub.every((value, index)=>value === oid[index]) || findOid(keyData, oid, i + 1);
};
const getNamedCurve = (keyData)=>{
    switch(true){
        case findOid(keyData, [
            0x2a,
            0x86,
            0x48,
            0xce,
            0x3d,
            0x03,
            0x01,
            0x07
        ]):
            return 'P-256';
        case findOid(keyData, [
            0x2b,
            0x81,
            0x04,
            0x00,
            0x22
        ]):
            return 'P-384';
        case findOid(keyData, [
            0x2b,
            0x81,
            0x04,
            0x00,
            0x23
        ]):
            return 'P-521';
        case findOid(keyData, [
            0x2b,
            0x65,
            0x6e
        ]):
            return 'X25519';
        case findOid(keyData, [
            0x2b,
            0x65,
            0x6f
        ]):
            return 'X448';
        case findOid(keyData, [
            0x2b,
            0x65,
            0x70
        ]):
            return 'Ed25519';
        case findOid(keyData, [
            0x2b,
            0x65,
            0x71
        ]):
            return 'Ed448';
        default:
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$util$2f$errors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["JOSENotSupported"]('Invalid or unsupported EC Key Curve or OKP Key Sub Type');
    }
};
const genericImport = async (replace, keyFormat, pem, alg, options)=>{
    var _a;
    let algorithm;
    let keyUsages;
    const keyData = new Uint8Array(atob(pem.replace(replace, '')).split('').map((c)=>c.charCodeAt(0)));
    const isPublic = keyFormat === 'spki';
    switch(alg){
        case 'PS256':
        case 'PS384':
        case 'PS512':
            algorithm = {
                name: 'RSA-PSS',
                hash: "SHA-".concat(alg.slice(-3))
            };
            keyUsages = isPublic ? [
                'verify'
            ] : [
                'sign'
            ];
            break;
        case 'RS256':
        case 'RS384':
        case 'RS512':
            algorithm = {
                name: 'RSASSA-PKCS1-v1_5',
                hash: "SHA-".concat(alg.slice(-3))
            };
            keyUsages = isPublic ? [
                'verify'
            ] : [
                'sign'
            ];
            break;
        case 'RSA-OAEP':
        case 'RSA-OAEP-256':
        case 'RSA-OAEP-384':
        case 'RSA-OAEP-512':
            algorithm = {
                name: 'RSA-OAEP',
                hash: "SHA-".concat(parseInt(alg.slice(-3), 10) || 1)
            };
            keyUsages = isPublic ? [
                'encrypt',
                'wrapKey'
            ] : [
                'decrypt',
                'unwrapKey'
            ];
            break;
        case 'ES256':
            algorithm = {
                name: 'ECDSA',
                namedCurve: 'P-256'
            };
            keyUsages = isPublic ? [
                'verify'
            ] : [
                'sign'
            ];
            break;
        case 'ES384':
            algorithm = {
                name: 'ECDSA',
                namedCurve: 'P-384'
            };
            keyUsages = isPublic ? [
                'verify'
            ] : [
                'sign'
            ];
            break;
        case 'ES512':
            algorithm = {
                name: 'ECDSA',
                namedCurve: 'P-521'
            };
            keyUsages = isPublic ? [
                'verify'
            ] : [
                'sign'
            ];
            break;
        case 'ECDH-ES':
        case 'ECDH-ES+A128KW':
        case 'ECDH-ES+A192KW':
        case 'ECDH-ES+A256KW':
            {
                const namedCurve = getNamedCurve(keyData);
                algorithm = namedCurve.startsWith('P-') ? {
                    name: 'ECDH',
                    namedCurve
                } : {
                    name: namedCurve
                };
                keyUsages = isPublic ? [] : [
                    'deriveBits'
                ];
                break;
            }
        case 'EdDSA':
            algorithm = {
                name: getNamedCurve(keyData)
            };
            keyUsages = isPublic ? [
                'verify'
            ] : [
                'sign'
            ];
            break;
        default:
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$util$2f$errors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["JOSENotSupported"]('Invalid or unsupported "alg" (Algorithm) value');
    }
    return __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$webcrypto$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].subtle.importKey(keyFormat, keyData, algorithm, (_a = options === null || options === void 0 ? void 0 : options.extractable) !== null && _a !== void 0 ? _a : false, keyUsages);
};
const fromPKCS8 = (pem, alg, options)=>{
    return genericImport(/(?:-----(?:BEGIN|END) PRIVATE KEY-----|\s)/g, 'pkcs8', pem, alg, options);
};
const fromSPKI = (pem, alg, options)=>{
    return genericImport(/(?:-----(?:BEGIN|END) PUBLIC KEY-----|\s)/g, 'spki', pem, alg, options);
};
function getElement(seq) {
    let result = [];
    let next = 0;
    while(next < seq.length){
        let nextPart = parseElement(seq.subarray(next));
        result.push(nextPart);
        next += nextPart.byteLength;
    }
    return result;
}
function parseElement(bytes) {
    let position = 0;
    let tag = bytes[0] & 0x1f;
    position++;
    if (tag === 0x1f) {
        tag = 0;
        while(bytes[position] >= 0x80){
            tag = tag * 128 + bytes[position] - 0x80;
            position++;
        }
        tag = tag * 128 + bytes[position] - 0x80;
        position++;
    }
    let length = 0;
    if (bytes[position] < 0x80) {
        length = bytes[position];
        position++;
    } else if (length === 0x80) {
        length = 0;
        while(bytes[position + length] !== 0 || bytes[position + length + 1] !== 0){
            if (length > bytes.byteLength) {
                throw new TypeError('invalid indefinite form length');
            }
            length++;
        }
        const byteLength = position + length + 2;
        return {
            byteLength,
            contents: bytes.subarray(position, position + length),
            raw: bytes.subarray(0, byteLength)
        };
    } else {
        let numberOfDigits = bytes[position] & 0x7f;
        position++;
        length = 0;
        for(let i = 0; i < numberOfDigits; i++){
            length = length * 256 + bytes[position];
            position++;
        }
    }
    const byteLength = position + length;
    return {
        byteLength,
        contents: bytes.subarray(position, byteLength),
        raw: bytes.subarray(0, byteLength)
    };
}
function spkiFromX509(buf) {
    const tbsCertificate = getElement(getElement(parseElement(buf).contents)[0].contents);
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$base64url$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["encodeBase64"])(tbsCertificate[tbsCertificate[0].raw[0] === 0xa0 ? 6 : 5].raw);
}
function getSPKI(x509) {
    const pem = x509.replace(/(?:-----(?:BEGIN|END) CERTIFICATE-----|\s)/g, '');
    const raw = (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$base64url$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["decodeBase64"])(pem);
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$lib$2f$format_pem$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(spkiFromX509(raw), 'PUBLIC KEY');
}
const fromX509 = (pem, alg, options)=>{
    let spki;
    try {
        spki = getSPKI(pem);
    } catch (cause) {
        throw new TypeError('Failed to parse the X.509 certificate', {
            cause
        });
    }
    return fromSPKI(spki, alg, options);
};
}),
"[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/runtime/jwk_to_key.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$webcrypto$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/runtime/webcrypto.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$util$2f$errors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/util/errors.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$base64url$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/runtime/base64url.js [app-client] (ecmascript)");
;
;
;
function subtleMapping(jwk) {
    let algorithm;
    let keyUsages;
    switch(jwk.kty){
        case 'oct':
            {
                switch(jwk.alg){
                    case 'HS256':
                    case 'HS384':
                    case 'HS512':
                        algorithm = {
                            name: 'HMAC',
                            hash: "SHA-".concat(jwk.alg.slice(-3))
                        };
                        keyUsages = [
                            'sign',
                            'verify'
                        ];
                        break;
                    case 'A128CBC-HS256':
                    case 'A192CBC-HS384':
                    case 'A256CBC-HS512':
                        throw new __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$util$2f$errors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["JOSENotSupported"]("".concat(jwk.alg, " keys cannot be imported as CryptoKey instances"));
                    case 'A128GCM':
                    case 'A192GCM':
                    case 'A256GCM':
                    case 'A128GCMKW':
                    case 'A192GCMKW':
                    case 'A256GCMKW':
                        algorithm = {
                            name: 'AES-GCM'
                        };
                        keyUsages = [
                            'encrypt',
                            'decrypt'
                        ];
                        break;
                    case 'A128KW':
                    case 'A192KW':
                    case 'A256KW':
                        algorithm = {
                            name: 'AES-KW'
                        };
                        keyUsages = [
                            'wrapKey',
                            'unwrapKey'
                        ];
                        break;
                    case 'PBES2-HS256+A128KW':
                    case 'PBES2-HS384+A192KW':
                    case 'PBES2-HS512+A256KW':
                        algorithm = {
                            name: 'PBKDF2'
                        };
                        keyUsages = [
                            'deriveBits'
                        ];
                        break;
                    default:
                        throw new __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$util$2f$errors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["JOSENotSupported"]('Invalid or unsupported JWK "alg" (Algorithm) Parameter value');
                }
                break;
            }
        case 'RSA':
            {
                switch(jwk.alg){
                    case 'PS256':
                    case 'PS384':
                    case 'PS512':
                        algorithm = {
                            name: 'RSA-PSS',
                            hash: "SHA-".concat(jwk.alg.slice(-3))
                        };
                        keyUsages = jwk.d ? [
                            'sign'
                        ] : [
                            'verify'
                        ];
                        break;
                    case 'RS256':
                    case 'RS384':
                    case 'RS512':
                        algorithm = {
                            name: 'RSASSA-PKCS1-v1_5',
                            hash: "SHA-".concat(jwk.alg.slice(-3))
                        };
                        keyUsages = jwk.d ? [
                            'sign'
                        ] : [
                            'verify'
                        ];
                        break;
                    case 'RSA-OAEP':
                    case 'RSA-OAEP-256':
                    case 'RSA-OAEP-384':
                    case 'RSA-OAEP-512':
                        algorithm = {
                            name: 'RSA-OAEP',
                            hash: "SHA-".concat(parseInt(jwk.alg.slice(-3), 10) || 1)
                        };
                        keyUsages = jwk.d ? [
                            'decrypt',
                            'unwrapKey'
                        ] : [
                            'encrypt',
                            'wrapKey'
                        ];
                        break;
                    default:
                        throw new __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$util$2f$errors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["JOSENotSupported"]('Invalid or unsupported JWK "alg" (Algorithm) Parameter value');
                }
                break;
            }
        case 'EC':
            {
                switch(jwk.alg){
                    case 'ES256':
                        algorithm = {
                            name: 'ECDSA',
                            namedCurve: 'P-256'
                        };
                        keyUsages = jwk.d ? [
                            'sign'
                        ] : [
                            'verify'
                        ];
                        break;
                    case 'ES384':
                        algorithm = {
                            name: 'ECDSA',
                            namedCurve: 'P-384'
                        };
                        keyUsages = jwk.d ? [
                            'sign'
                        ] : [
                            'verify'
                        ];
                        break;
                    case 'ES512':
                        algorithm = {
                            name: 'ECDSA',
                            namedCurve: 'P-521'
                        };
                        keyUsages = jwk.d ? [
                            'sign'
                        ] : [
                            'verify'
                        ];
                        break;
                    case 'ECDH-ES':
                    case 'ECDH-ES+A128KW':
                    case 'ECDH-ES+A192KW':
                    case 'ECDH-ES+A256KW':
                        algorithm = {
                            name: 'ECDH',
                            namedCurve: jwk.crv
                        };
                        keyUsages = jwk.d ? [
                            'deriveBits'
                        ] : [];
                        break;
                    default:
                        throw new __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$util$2f$errors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["JOSENotSupported"]('Invalid or unsupported JWK "alg" (Algorithm) Parameter value');
                }
                break;
            }
        case 'OKP':
            {
                switch(jwk.alg){
                    case 'EdDSA':
                        algorithm = {
                            name: jwk.crv
                        };
                        keyUsages = jwk.d ? [
                            'sign'
                        ] : [
                            'verify'
                        ];
                        break;
                    case 'ECDH-ES':
                    case 'ECDH-ES+A128KW':
                    case 'ECDH-ES+A192KW':
                    case 'ECDH-ES+A256KW':
                        algorithm = {
                            name: jwk.crv
                        };
                        keyUsages = jwk.d ? [
                            'deriveBits'
                        ] : [];
                        break;
                    default:
                        throw new __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$util$2f$errors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["JOSENotSupported"]('Invalid or unsupported JWK "alg" (Algorithm) Parameter value');
                }
                break;
            }
        default:
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$util$2f$errors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["JOSENotSupported"]('Invalid or unsupported JWK "kty" (Key Type) Parameter value');
    }
    return {
        algorithm,
        keyUsages
    };
}
const parse = async (jwk)=>{
    var _a, _b;
    if (!jwk.alg) {
        throw new TypeError('"alg" argument is required when "jwk.alg" is not present');
    }
    const { algorithm, keyUsages } = subtleMapping(jwk);
    const rest = [
        algorithm,
        (_a = jwk.ext) !== null && _a !== void 0 ? _a : false,
        (_b = jwk.key_ops) !== null && _b !== void 0 ? _b : keyUsages
    ];
    if (algorithm.name === 'PBKDF2') {
        return __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$webcrypto$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].subtle.importKey('raw', (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$base64url$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["decode"])(jwk.k), ...rest);
    }
    const keyData = {
        ...jwk
    };
    delete keyData.alg;
    delete keyData.use;
    return __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$webcrypto$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].subtle.importKey('jwk', keyData, ...rest);
};
const __TURBOPACK__default__export__ = parse;
}),
"[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/key/import.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "importJWK",
    ()=>importJWK,
    "importPKCS8",
    ()=>importPKCS8,
    "importSPKI",
    ()=>importSPKI,
    "importX509",
    ()=>importX509
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$base64url$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/runtime/base64url.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$asn1$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/runtime/asn1.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$jwk_to_key$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/runtime/jwk_to_key.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$util$2f$errors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/util/errors.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$lib$2f$is_object$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/lib/is_object.js [app-client] (ecmascript)");
;
;
;
;
;
async function importSPKI(spki, alg, options) {
    if (typeof spki !== 'string' || spki.indexOf('-----BEGIN PUBLIC KEY-----') !== 0) {
        throw new TypeError('"spki" must be SPKI formatted string');
    }
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$asn1$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["fromSPKI"])(spki, alg, options);
}
async function importX509(x509, alg, options) {
    if (typeof x509 !== 'string' || x509.indexOf('-----BEGIN CERTIFICATE-----') !== 0) {
        throw new TypeError('"x509" must be X.509 formatted string');
    }
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$asn1$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["fromX509"])(x509, alg, options);
}
async function importPKCS8(pkcs8, alg, options) {
    if (typeof pkcs8 !== 'string' || pkcs8.indexOf('-----BEGIN PRIVATE KEY-----') !== 0) {
        throw new TypeError('"pkcs8" must be PKCS#8 formatted string');
    }
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$asn1$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["fromPKCS8"])(pkcs8, alg, options);
}
async function importJWK(jwk, alg, octAsKeyObject) {
    var _a;
    if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$lib$2f$is_object$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(jwk)) {
        throw new TypeError('JWK must be an object');
    }
    alg || (alg = jwk.alg);
    switch(jwk.kty){
        case 'oct':
            if (typeof jwk.k !== 'string' || !jwk.k) {
                throw new TypeError('missing "k" (Key Value) Parameter value');
            }
            octAsKeyObject !== null && octAsKeyObject !== void 0 ? octAsKeyObject : octAsKeyObject = jwk.ext !== true;
            if (octAsKeyObject) {
                return (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$jwk_to_key$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])({
                    ...jwk,
                    alg,
                    ext: (_a = jwk.ext) !== null && _a !== void 0 ? _a : false
                });
            }
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$base64url$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["decode"])(jwk.k);
        case 'RSA':
            if (jwk.oth !== undefined) {
                throw new __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$util$2f$errors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["JOSENotSupported"]('RSA JWK "oth" (Other Primes Info) Parameter value is not supported');
            }
        case 'EC':
        case 'OKP':
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$jwk_to_key$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])({
                ...jwk,
                alg
            });
        default:
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$util$2f$errors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["JOSENotSupported"]('Unsupported "kty" (Key Type) Parameter value');
    }
}
}),
"[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/lib/check_key_type.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$lib$2f$invalid_key_input$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/lib/invalid_key_input.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$is_key_like$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/runtime/is_key_like.js [app-client] (ecmascript)");
;
;
const symmetricTypeCheck = (alg, key)=>{
    if (key instanceof Uint8Array) return;
    if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$is_key_like$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(key)) {
        throw new TypeError((0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$lib$2f$invalid_key_input$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["withAlg"])(alg, key, ...__TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$is_key_like$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["types"], 'Uint8Array'));
    }
    if (key.type !== 'secret') {
        throw new TypeError("".concat(__TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$is_key_like$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["types"].join(' or '), ' instances for symmetric algorithms must be of type "secret"'));
    }
};
const asymmetricTypeCheck = (alg, key, usage)=>{
    if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$is_key_like$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(key)) {
        throw new TypeError((0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$lib$2f$invalid_key_input$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["withAlg"])(alg, key, ...__TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$is_key_like$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["types"]));
    }
    if (key.type === 'secret') {
        throw new TypeError("".concat(__TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$is_key_like$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["types"].join(' or '), ' instances for asymmetric algorithms must not be of type "secret"'));
    }
    if (usage === 'sign' && key.type === 'public') {
        throw new TypeError("".concat(__TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$is_key_like$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["types"].join(' or '), ' instances for asymmetric algorithm signing must be of type "private"'));
    }
    if (usage === 'decrypt' && key.type === 'public') {
        throw new TypeError("".concat(__TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$is_key_like$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["types"].join(' or '), ' instances for asymmetric algorithm decryption must be of type "private"'));
    }
    if (key.algorithm && usage === 'verify' && key.type === 'private') {
        throw new TypeError("".concat(__TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$is_key_like$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["types"].join(' or '), ' instances for asymmetric algorithm verifying must be of type "public"'));
    }
    if (key.algorithm && usage === 'encrypt' && key.type === 'private') {
        throw new TypeError("".concat(__TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$is_key_like$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["types"].join(' or '), ' instances for asymmetric algorithm encryption must be of type "public"'));
    }
};
const checkKeyType = (alg, key, usage)=>{
    const symmetric = alg.startsWith('HS') || alg === 'dir' || alg.startsWith('PBES2') || /^A\d{3}(?:GCM)?KW$/.test(alg);
    if (symmetric) {
        symmetricTypeCheck(alg, key);
    } else {
        asymmetricTypeCheck(alg, key, usage);
    }
};
const __TURBOPACK__default__export__ = checkKeyType;
}),
"[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/runtime/encrypt.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$lib$2f$buffer_utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/lib/buffer_utils.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$lib$2f$check_iv_length$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/lib/check_iv_length.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$check_cek_length$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/runtime/check_cek_length.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$webcrypto$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/runtime/webcrypto.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$lib$2f$crypto_key$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/lib/crypto_key.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$lib$2f$invalid_key_input$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/lib/invalid_key_input.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$util$2f$errors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/util/errors.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$is_key_like$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/runtime/is_key_like.js [app-client] (ecmascript)");
;
;
;
;
;
;
;
;
async function cbcEncrypt(enc, plaintext, cek, iv, aad) {
    if (!(cek instanceof Uint8Array)) {
        throw new TypeError((0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$lib$2f$invalid_key_input$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(cek, 'Uint8Array'));
    }
    const keySize = parseInt(enc.slice(1, 4), 10);
    const encKey = await __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$webcrypto$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].subtle.importKey('raw', cek.subarray(keySize >> 3), 'AES-CBC', false, [
        'encrypt'
    ]);
    const macKey = await __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$webcrypto$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].subtle.importKey('raw', cek.subarray(0, keySize >> 3), {
        hash: "SHA-".concat(keySize << 1),
        name: 'HMAC'
    }, false, [
        'sign'
    ]);
    const ciphertext = new Uint8Array(await __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$webcrypto$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].subtle.encrypt({
        iv,
        name: 'AES-CBC'
    }, encKey, plaintext));
    const macData = (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$lib$2f$buffer_utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["concat"])(aad, iv, ciphertext, (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$lib$2f$buffer_utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["uint64be"])(aad.length << 3));
    const tag = new Uint8Array((await __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$webcrypto$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].subtle.sign('HMAC', macKey, macData)).slice(0, keySize >> 3));
    return {
        ciphertext,
        tag
    };
}
async function gcmEncrypt(enc, plaintext, cek, iv, aad) {
    let encKey;
    if (cek instanceof Uint8Array) {
        encKey = await __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$webcrypto$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].subtle.importKey('raw', cek, 'AES-GCM', false, [
            'encrypt'
        ]);
    } else {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$lib$2f$crypto_key$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["checkEncCryptoKey"])(cek, enc, 'encrypt');
        encKey = cek;
    }
    const encrypted = new Uint8Array(await __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$webcrypto$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].subtle.encrypt({
        additionalData: aad,
        iv,
        name: 'AES-GCM',
        tagLength: 128
    }, encKey, plaintext));
    const tag = encrypted.slice(-16);
    const ciphertext = encrypted.slice(0, -16);
    return {
        ciphertext,
        tag
    };
}
const encrypt = async (enc, plaintext, cek, iv, aad)=>{
    if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$webcrypto$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isCryptoKey"])(cek) && !(cek instanceof Uint8Array)) {
        throw new TypeError((0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$lib$2f$invalid_key_input$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(cek, ...__TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$is_key_like$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["types"], 'Uint8Array'));
    }
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$lib$2f$check_iv_length$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(enc, iv);
    switch(enc){
        case 'A128CBC-HS256':
        case 'A192CBC-HS384':
        case 'A256CBC-HS512':
            if (cek instanceof Uint8Array) (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$check_cek_length$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(cek, parseInt(enc.slice(-3), 10));
            return cbcEncrypt(enc, plaintext, cek, iv, aad);
        case 'A128GCM':
        case 'A192GCM':
        case 'A256GCM':
            if (cek instanceof Uint8Array) (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$check_cek_length$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(cek, parseInt(enc.slice(1, 4), 10));
            return gcmEncrypt(enc, plaintext, cek, iv, aad);
        default:
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$util$2f$errors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["JOSENotSupported"]('Unsupported JWE Content Encryption Algorithm');
    }
};
const __TURBOPACK__default__export__ = encrypt;
}),
"[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/lib/aesgcmkw.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "unwrap",
    ()=>unwrap,
    "wrap",
    ()=>wrap
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$encrypt$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/runtime/encrypt.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$decrypt$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/runtime/decrypt.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$lib$2f$iv$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/lib/iv.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$base64url$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/runtime/base64url.js [app-client] (ecmascript)");
;
;
;
;
async function wrap(alg, key, cek, iv) {
    const jweAlgorithm = alg.slice(0, 7);
    iv || (iv = (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$lib$2f$iv$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(jweAlgorithm));
    const { ciphertext: encryptedKey, tag } = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$encrypt$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(jweAlgorithm, cek, key, iv, new Uint8Array(0));
    return {
        encryptedKey,
        iv: (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$base64url$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["encode"])(iv),
        tag: (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$base64url$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["encode"])(tag)
    };
}
async function unwrap(alg, key, encryptedKey, iv, tag) {
    const jweAlgorithm = alg.slice(0, 7);
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$decrypt$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(jweAlgorithm, key, encryptedKey, iv, tag, new Uint8Array(0));
}
}),
"[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/lib/decrypt_key_management.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$aeskw$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/runtime/aeskw.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$ecdhes$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/runtime/ecdhes.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$pbes2kw$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/runtime/pbes2kw.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$rsaes$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/runtime/rsaes.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$base64url$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/runtime/base64url.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$util$2f$errors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/util/errors.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$lib$2f$cek$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/lib/cek.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$key$2f$import$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/key/import.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$lib$2f$check_key_type$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/lib/check_key_type.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$lib$2f$is_object$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/lib/is_object.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$lib$2f$aesgcmkw$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/lib/aesgcmkw.js [app-client] (ecmascript)");
;
;
;
;
;
;
;
;
;
;
;
async function decryptKeyManagement(alg, key, encryptedKey, joseHeader, options) {
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$lib$2f$check_key_type$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(alg, key, 'decrypt');
    switch(alg){
        case 'dir':
            {
                if (encryptedKey !== undefined) throw new __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$util$2f$errors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["JWEInvalid"]('Encountered unexpected JWE Encrypted Key');
                return key;
            }
        case 'ECDH-ES':
            if (encryptedKey !== undefined) throw new __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$util$2f$errors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["JWEInvalid"]('Encountered unexpected JWE Encrypted Key');
        case 'ECDH-ES+A128KW':
        case 'ECDH-ES+A192KW':
        case 'ECDH-ES+A256KW':
            {
                if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$lib$2f$is_object$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(joseHeader.epk)) throw new __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$util$2f$errors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["JWEInvalid"]('JOSE Header "epk" (Ephemeral Public Key) missing or invalid');
                if (!__TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$ecdhes$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ecdhAllowed"](key)) throw new __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$util$2f$errors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["JOSENotSupported"]('ECDH with the provided key is not allowed or not supported by your javascript runtime');
                const epk = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$key$2f$import$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["importJWK"])(joseHeader.epk, alg);
                let partyUInfo;
                let partyVInfo;
                if (joseHeader.apu !== undefined) {
                    if (typeof joseHeader.apu !== 'string') throw new __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$util$2f$errors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["JWEInvalid"]('JOSE Header "apu" (Agreement PartyUInfo) invalid');
                    try {
                        partyUInfo = (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$base64url$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["decode"])(joseHeader.apu);
                    } catch (_a) {
                        throw new __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$util$2f$errors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["JWEInvalid"]('Failed to base64url decode the apu');
                    }
                }
                if (joseHeader.apv !== undefined) {
                    if (typeof joseHeader.apv !== 'string') throw new __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$util$2f$errors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["JWEInvalid"]('JOSE Header "apv" (Agreement PartyVInfo) invalid');
                    try {
                        partyVInfo = (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$base64url$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["decode"])(joseHeader.apv);
                    } catch (_b) {
                        throw new __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$util$2f$errors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["JWEInvalid"]('Failed to base64url decode the apv');
                    }
                }
                const sharedSecret = await __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$ecdhes$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["deriveKey"](epk, key, alg === 'ECDH-ES' ? joseHeader.enc : alg, alg === 'ECDH-ES' ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$lib$2f$cek$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["bitLength"])(joseHeader.enc) : parseInt(alg.slice(-5, -2), 10), partyUInfo, partyVInfo);
                if (alg === 'ECDH-ES') return sharedSecret;
                if (encryptedKey === undefined) throw new __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$util$2f$errors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["JWEInvalid"]('JWE Encrypted Key missing');
                return (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$aeskw$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["unwrap"])(alg.slice(-6), sharedSecret, encryptedKey);
            }
        case 'RSA1_5':
        case 'RSA-OAEP':
        case 'RSA-OAEP-256':
        case 'RSA-OAEP-384':
        case 'RSA-OAEP-512':
            {
                if (encryptedKey === undefined) throw new __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$util$2f$errors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["JWEInvalid"]('JWE Encrypted Key missing');
                return (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$rsaes$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["decrypt"])(alg, key, encryptedKey);
            }
        case 'PBES2-HS256+A128KW':
        case 'PBES2-HS384+A192KW':
        case 'PBES2-HS512+A256KW':
            {
                if (encryptedKey === undefined) throw new __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$util$2f$errors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["JWEInvalid"]('JWE Encrypted Key missing');
                if (typeof joseHeader.p2c !== 'number') throw new __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$util$2f$errors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["JWEInvalid"]('JOSE Header "p2c" (PBES2 Count) missing or invalid');
                const p2cLimit = (options === null || options === void 0 ? void 0 : options.maxPBES2Count) || 10000;
                if (joseHeader.p2c > p2cLimit) throw new __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$util$2f$errors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["JWEInvalid"]('JOSE Header "p2c" (PBES2 Count) out is of acceptable bounds');
                if (typeof joseHeader.p2s !== 'string') throw new __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$util$2f$errors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["JWEInvalid"]('JOSE Header "p2s" (PBES2 Salt) missing or invalid');
                let p2s;
                try {
                    p2s = (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$base64url$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["decode"])(joseHeader.p2s);
                } catch (_c) {
                    throw new __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$util$2f$errors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["JWEInvalid"]('Failed to base64url decode the p2s');
                }
                return (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$pbes2kw$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["decrypt"])(alg, key, encryptedKey, joseHeader.p2c, p2s);
            }
        case 'A128KW':
        case 'A192KW':
        case 'A256KW':
            {
                if (encryptedKey === undefined) throw new __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$util$2f$errors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["JWEInvalid"]('JWE Encrypted Key missing');
                return (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$aeskw$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["unwrap"])(alg, key, encryptedKey);
            }
        case 'A128GCMKW':
        case 'A192GCMKW':
        case 'A256GCMKW':
            {
                if (encryptedKey === undefined) throw new __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$util$2f$errors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["JWEInvalid"]('JWE Encrypted Key missing');
                if (typeof joseHeader.iv !== 'string') throw new __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$util$2f$errors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["JWEInvalid"]('JOSE Header "iv" (Initialization Vector) missing or invalid');
                if (typeof joseHeader.tag !== 'string') throw new __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$util$2f$errors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["JWEInvalid"]('JOSE Header "tag" (Authentication Tag) missing or invalid');
                let iv;
                try {
                    iv = (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$base64url$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["decode"])(joseHeader.iv);
                } catch (_d) {
                    throw new __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$util$2f$errors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["JWEInvalid"]('Failed to base64url decode the iv');
                }
                let tag;
                try {
                    tag = (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$base64url$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["decode"])(joseHeader.tag);
                } catch (_e) {
                    throw new __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$util$2f$errors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["JWEInvalid"]('Failed to base64url decode the tag');
                }
                return (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$lib$2f$aesgcmkw$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["unwrap"])(alg, key, encryptedKey, iv, tag);
            }
        default:
            {
                throw new __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$util$2f$errors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["JOSENotSupported"]('Invalid or unsupported "alg" (JWE Algorithm) header value');
            }
    }
}
const __TURBOPACK__default__export__ = decryptKeyManagement;
}),
"[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/lib/validate_crit.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$util$2f$errors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/util/errors.js [app-client] (ecmascript)");
;
function validateCrit(Err, recognizedDefault, recognizedOption, protectedHeader, joseHeader) {
    if (joseHeader.crit !== undefined && protectedHeader.crit === undefined) {
        throw new Err('"crit" (Critical) Header Parameter MUST be integrity protected');
    }
    if (!protectedHeader || protectedHeader.crit === undefined) {
        return new Set();
    }
    if (!Array.isArray(protectedHeader.crit) || protectedHeader.crit.length === 0 || protectedHeader.crit.some((input)=>typeof input !== 'string' || input.length === 0)) {
        throw new Err('"crit" (Critical) Header Parameter MUST be an array of non-empty strings when present');
    }
    let recognized;
    if (recognizedOption !== undefined) {
        recognized = new Map([
            ...Object.entries(recognizedOption),
            ...recognizedDefault.entries()
        ]);
    } else {
        recognized = recognizedDefault;
    }
    for (const parameter of protectedHeader.crit){
        if (!recognized.has(parameter)) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$util$2f$errors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["JOSENotSupported"]('Extension Header Parameter "'.concat(parameter, '" is not recognized'));
        }
        if (joseHeader[parameter] === undefined) {
            throw new Err('Extension Header Parameter "'.concat(parameter, '" is missing'));
        } else if (recognized.get(parameter) && protectedHeader[parameter] === undefined) {
            throw new Err('Extension Header Parameter "'.concat(parameter, '" MUST be integrity protected'));
        }
    }
    return new Set(protectedHeader.crit);
}
const __TURBOPACK__default__export__ = validateCrit;
}),
"[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/lib/validate_algorithms.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
const validateAlgorithms = (option, algorithms)=>{
    if (algorithms !== undefined && (!Array.isArray(algorithms) || algorithms.some((s)=>typeof s !== 'string'))) {
        throw new TypeError('"'.concat(option, '" option must be an array of strings'));
    }
    if (!algorithms) {
        return undefined;
    }
    return new Set(algorithms);
};
const __TURBOPACK__default__export__ = validateAlgorithms;
}),
"[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/jwe/flattened/decrypt.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "flattenedDecrypt",
    ()=>flattenedDecrypt
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$base64url$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/runtime/base64url.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$decrypt$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/runtime/decrypt.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$zlib$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/runtime/zlib.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$util$2f$errors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/util/errors.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$lib$2f$is_disjoint$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/lib/is_disjoint.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$lib$2f$is_object$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/lib/is_object.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$lib$2f$decrypt_key_management$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/lib/decrypt_key_management.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$lib$2f$buffer_utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/lib/buffer_utils.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$lib$2f$cek$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/lib/cek.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$lib$2f$validate_crit$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/lib/validate_crit.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$lib$2f$validate_algorithms$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/lib/validate_algorithms.js [app-client] (ecmascript)");
;
;
;
;
;
;
;
;
;
;
;
async function flattenedDecrypt(jwe, key, options) {
    var _a;
    if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$lib$2f$is_object$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(jwe)) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$util$2f$errors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["JWEInvalid"]('Flattened JWE must be an object');
    }
    if (jwe.protected === undefined && jwe.header === undefined && jwe.unprotected === undefined) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$util$2f$errors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["JWEInvalid"]('JOSE Header missing');
    }
    if (typeof jwe.iv !== 'string') {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$util$2f$errors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["JWEInvalid"]('JWE Initialization Vector missing or incorrect type');
    }
    if (typeof jwe.ciphertext !== 'string') {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$util$2f$errors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["JWEInvalid"]('JWE Ciphertext missing or incorrect type');
    }
    if (typeof jwe.tag !== 'string') {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$util$2f$errors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["JWEInvalid"]('JWE Authentication Tag missing or incorrect type');
    }
    if (jwe.protected !== undefined && typeof jwe.protected !== 'string') {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$util$2f$errors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["JWEInvalid"]('JWE Protected Header incorrect type');
    }
    if (jwe.encrypted_key !== undefined && typeof jwe.encrypted_key !== 'string') {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$util$2f$errors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["JWEInvalid"]('JWE Encrypted Key incorrect type');
    }
    if (jwe.aad !== undefined && typeof jwe.aad !== 'string') {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$util$2f$errors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["JWEInvalid"]('JWE AAD incorrect type');
    }
    if (jwe.header !== undefined && !(0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$lib$2f$is_object$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(jwe.header)) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$util$2f$errors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["JWEInvalid"]('JWE Shared Unprotected Header incorrect type');
    }
    if (jwe.unprotected !== undefined && !(0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$lib$2f$is_object$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(jwe.unprotected)) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$util$2f$errors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["JWEInvalid"]('JWE Per-Recipient Unprotected Header incorrect type');
    }
    let parsedProt;
    if (jwe.protected) {
        try {
            const protectedHeader = (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$base64url$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["decode"])(jwe.protected);
            parsedProt = JSON.parse(__TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$lib$2f$buffer_utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["decoder"].decode(protectedHeader));
        } catch (_b) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$util$2f$errors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["JWEInvalid"]('JWE Protected Header is invalid');
        }
    }
    if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$lib$2f$is_disjoint$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(parsedProt, jwe.header, jwe.unprotected)) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$util$2f$errors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["JWEInvalid"]('JWE Protected, JWE Unprotected Header, and JWE Per-Recipient Unprotected Header Parameter names must be disjoint');
    }
    const joseHeader = {
        ...parsedProt,
        ...jwe.header,
        ...jwe.unprotected
    };
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$lib$2f$validate_crit$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(__TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$util$2f$errors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["JWEInvalid"], new Map(), options === null || options === void 0 ? void 0 : options.crit, parsedProt, joseHeader);
    if (joseHeader.zip !== undefined) {
        if (!parsedProt || !parsedProt.zip) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$util$2f$errors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["JWEInvalid"]('JWE "zip" (Compression Algorithm) Header MUST be integrity protected');
        }
        if (joseHeader.zip !== 'DEF') {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$util$2f$errors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["JOSENotSupported"]('Unsupported JWE "zip" (Compression Algorithm) Header Parameter value');
        }
    }
    const { alg, enc } = joseHeader;
    if (typeof alg !== 'string' || !alg) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$util$2f$errors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["JWEInvalid"]('missing JWE Algorithm (alg) in JWE Header');
    }
    if (typeof enc !== 'string' || !enc) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$util$2f$errors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["JWEInvalid"]('missing JWE Encryption Algorithm (enc) in JWE Header');
    }
    const keyManagementAlgorithms = options && (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$lib$2f$validate_algorithms$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])('keyManagementAlgorithms', options.keyManagementAlgorithms);
    const contentEncryptionAlgorithms = options && (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$lib$2f$validate_algorithms$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])('contentEncryptionAlgorithms', options.contentEncryptionAlgorithms);
    if (keyManagementAlgorithms && !keyManagementAlgorithms.has(alg)) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$util$2f$errors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["JOSEAlgNotAllowed"]('"alg" (Algorithm) Header Parameter not allowed');
    }
    if (contentEncryptionAlgorithms && !contentEncryptionAlgorithms.has(enc)) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$util$2f$errors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["JOSEAlgNotAllowed"]('"enc" (Encryption Algorithm) Header Parameter not allowed');
    }
    let encryptedKey;
    if (jwe.encrypted_key !== undefined) {
        try {
            encryptedKey = (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$base64url$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["decode"])(jwe.encrypted_key);
        } catch (_c) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$util$2f$errors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["JWEInvalid"]('Failed to base64url decode the encrypted_key');
        }
    }
    let resolvedKey = false;
    if (typeof key === 'function') {
        key = await key(parsedProt, jwe);
        resolvedKey = true;
    }
    let cek;
    try {
        cek = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$lib$2f$decrypt_key_management$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(alg, key, encryptedKey, joseHeader, options);
    } catch (err) {
        if (err instanceof TypeError || err instanceof __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$util$2f$errors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["JWEInvalid"] || err instanceof __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$util$2f$errors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["JOSENotSupported"]) {
            throw err;
        }
        cek = (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$lib$2f$cek$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(enc);
    }
    let iv;
    let tag;
    try {
        iv = (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$base64url$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["decode"])(jwe.iv);
    } catch (_d) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$util$2f$errors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["JWEInvalid"]('Failed to base64url decode the iv');
    }
    try {
        tag = (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$base64url$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["decode"])(jwe.tag);
    } catch (_e) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$util$2f$errors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["JWEInvalid"]('Failed to base64url decode the tag');
    }
    const protectedHeader = __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$lib$2f$buffer_utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["encoder"].encode((_a = jwe.protected) !== null && _a !== void 0 ? _a : '');
    let additionalData;
    if (jwe.aad !== undefined) {
        additionalData = (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$lib$2f$buffer_utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["concat"])(protectedHeader, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$lib$2f$buffer_utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["encoder"].encode('.'), __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$lib$2f$buffer_utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["encoder"].encode(jwe.aad));
    } else {
        additionalData = protectedHeader;
    }
    let ciphertext;
    try {
        ciphertext = (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$base64url$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["decode"])(jwe.ciphertext);
    } catch (_f) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$util$2f$errors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["JWEInvalid"]('Failed to base64url decode the ciphertext');
    }
    let plaintext = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$decrypt$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(enc, cek, ciphertext, iv, tag, additionalData);
    if (joseHeader.zip === 'DEF') {
        plaintext = await ((options === null || options === void 0 ? void 0 : options.inflateRaw) || __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$zlib$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["inflate"])(plaintext);
    }
    const result = {
        plaintext
    };
    if (jwe.protected !== undefined) {
        result.protectedHeader = parsedProt;
    }
    if (jwe.aad !== undefined) {
        try {
            result.additionalAuthenticatedData = (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$base64url$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["decode"])(jwe.aad);
        } catch (_g) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$util$2f$errors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["JWEInvalid"]('Failed to base64url decode the aad');
        }
    }
    if (jwe.unprotected !== undefined) {
        result.sharedUnprotectedHeader = jwe.unprotected;
    }
    if (jwe.header !== undefined) {
        result.unprotectedHeader = jwe.header;
    }
    if (resolvedKey) {
        return {
            ...result,
            key
        };
    }
    return result;
}
}),
"[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/jwe/compact/decrypt.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "compactDecrypt",
    ()=>compactDecrypt
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$jwe$2f$flattened$2f$decrypt$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/jwe/flattened/decrypt.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$util$2f$errors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/util/errors.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$lib$2f$buffer_utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/lib/buffer_utils.js [app-client] (ecmascript)");
;
;
;
async function compactDecrypt(jwe, key, options) {
    if (jwe instanceof Uint8Array) {
        jwe = __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$lib$2f$buffer_utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["decoder"].decode(jwe);
    }
    if (typeof jwe !== 'string') {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$util$2f$errors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["JWEInvalid"]('Compact JWE must be a string or Uint8Array');
    }
    const { 0: protectedHeader, 1: encryptedKey, 2: iv, 3: ciphertext, 4: tag, length } = jwe.split('.');
    if (length !== 5) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$util$2f$errors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["JWEInvalid"]('Invalid Compact JWE');
    }
    const decrypted = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$jwe$2f$flattened$2f$decrypt$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["flattenedDecrypt"])({
        ciphertext,
        iv: iv || undefined,
        protected: protectedHeader || undefined,
        tag: tag || undefined,
        encrypted_key: encryptedKey || undefined
    }, key, options);
    const result = {
        plaintext: decrypted.plaintext,
        protectedHeader: decrypted.protectedHeader
    };
    if (typeof key === 'function') {
        return {
            ...result,
            key: decrypted.key
        };
    }
    return result;
}
}),
"[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/jwe/general/decrypt.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "generalDecrypt",
    ()=>generalDecrypt
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$jwe$2f$flattened$2f$decrypt$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/jwe/flattened/decrypt.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$util$2f$errors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/util/errors.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$lib$2f$is_object$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/lib/is_object.js [app-client] (ecmascript)");
;
;
;
async function generalDecrypt(jwe, key, options) {
    if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$lib$2f$is_object$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(jwe)) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$util$2f$errors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["JWEInvalid"]('General JWE must be an object');
    }
    if (!Array.isArray(jwe.recipients) || !jwe.recipients.every(__TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$lib$2f$is_object$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$util$2f$errors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["JWEInvalid"]('JWE Recipients missing or incorrect type');
    }
    if (!jwe.recipients.length) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$util$2f$errors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["JWEInvalid"]('JWE Recipients has no members');
    }
    for (const recipient of jwe.recipients){
        try {
            return await (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$jwe$2f$flattened$2f$decrypt$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["flattenedDecrypt"])({
                aad: jwe.aad,
                ciphertext: jwe.ciphertext,
                encrypted_key: recipient.encrypted_key,
                header: recipient.header,
                iv: jwe.iv,
                protected: jwe.protected,
                tag: jwe.tag,
                unprotected: jwe.unprotected
            }, key, options);
        } catch (_a) {}
    }
    throw new __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$util$2f$errors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["JWEDecryptionFailed"]();
}
}),
"[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/runtime/key_to_jwk.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$webcrypto$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/runtime/webcrypto.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$lib$2f$invalid_key_input$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/lib/invalid_key_input.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$base64url$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/runtime/base64url.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$is_key_like$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/runtime/is_key_like.js [app-client] (ecmascript)");
;
;
;
;
const keyToJWK = async (key)=>{
    if (key instanceof Uint8Array) {
        return {
            kty: 'oct',
            k: (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$base64url$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["encode"])(key)
        };
    }
    if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$webcrypto$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isCryptoKey"])(key)) {
        throw new TypeError((0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$lib$2f$invalid_key_input$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(key, ...__TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$is_key_like$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["types"], 'Uint8Array'));
    }
    if (!key.extractable) {
        throw new TypeError('non-extractable CryptoKey cannot be exported as a JWK');
    }
    const { ext, key_ops, alg, use, ...jwk } = await __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$webcrypto$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].subtle.exportKey('jwk', key);
    return jwk;
};
const __TURBOPACK__default__export__ = keyToJWK;
}),
"[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/key/export.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "exportJWK",
    ()=>exportJWK,
    "exportPKCS8",
    ()=>exportPKCS8,
    "exportSPKI",
    ()=>exportSPKI
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$asn1$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/runtime/asn1.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$key_to_jwk$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/runtime/key_to_jwk.js [app-client] (ecmascript)");
;
;
;
async function exportSPKI(key) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$asn1$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toSPKI"])(key);
}
async function exportPKCS8(key) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$asn1$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toPKCS8"])(key);
}
async function exportJWK(key) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$key_to_jwk$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(key);
}
}),
"[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/lib/encrypt_key_management.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$aeskw$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/runtime/aeskw.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$ecdhes$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/runtime/ecdhes.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$pbes2kw$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/runtime/pbes2kw.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$rsaes$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/runtime/rsaes.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$base64url$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/runtime/base64url.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$lib$2f$cek$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/lib/cek.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$util$2f$errors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/util/errors.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$key$2f$export$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/key/export.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$lib$2f$check_key_type$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/lib/check_key_type.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$lib$2f$aesgcmkw$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/lib/aesgcmkw.js [app-client] (ecmascript)");
;
;
;
;
;
;
;
;
;
;
async function encryptKeyManagement(alg, enc, key, providedCek) {
    let providedParameters = arguments.length > 4 && arguments[4] !== void 0 ? arguments[4] : {};
    let encryptedKey;
    let parameters;
    let cek;
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$lib$2f$check_key_type$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(alg, key, 'encrypt');
    switch(alg){
        case 'dir':
            {
                cek = key;
                break;
            }
        case 'ECDH-ES':
        case 'ECDH-ES+A128KW':
        case 'ECDH-ES+A192KW':
        case 'ECDH-ES+A256KW':
            {
                if (!__TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$ecdhes$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ecdhAllowed"](key)) {
                    throw new __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$util$2f$errors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["JOSENotSupported"]('ECDH with the provided key is not allowed or not supported by your javascript runtime');
                }
                const { apu, apv } = providedParameters;
                let { epk: ephemeralKey } = providedParameters;
                ephemeralKey || (ephemeralKey = (await __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$ecdhes$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["generateEpk"](key)).privateKey);
                const { x, y, crv, kty } = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$key$2f$export$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["exportJWK"])(ephemeralKey);
                const sharedSecret = await __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$ecdhes$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["deriveKey"](key, ephemeralKey, alg === 'ECDH-ES' ? enc : alg, alg === 'ECDH-ES' ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$lib$2f$cek$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["bitLength"])(enc) : parseInt(alg.slice(-5, -2), 10), apu, apv);
                parameters = {
                    epk: {
                        x,
                        crv,
                        kty
                    }
                };
                if (kty === 'EC') parameters.epk.y = y;
                if (apu) parameters.apu = (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$base64url$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["encode"])(apu);
                if (apv) parameters.apv = (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$base64url$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["encode"])(apv);
                if (alg === 'ECDH-ES') {
                    cek = sharedSecret;
                    break;
                }
                cek = providedCek || (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$lib$2f$cek$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(enc);
                const kwAlg = alg.slice(-6);
                encryptedKey = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$aeskw$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["wrap"])(kwAlg, sharedSecret, cek);
                break;
            }
        case 'RSA1_5':
        case 'RSA-OAEP':
        case 'RSA-OAEP-256':
        case 'RSA-OAEP-384':
        case 'RSA-OAEP-512':
            {
                cek = providedCek || (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$lib$2f$cek$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(enc);
                encryptedKey = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$rsaes$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["encrypt"])(alg, key, cek);
                break;
            }
        case 'PBES2-HS256+A128KW':
        case 'PBES2-HS384+A192KW':
        case 'PBES2-HS512+A256KW':
            {
                cek = providedCek || (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$lib$2f$cek$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(enc);
                const { p2c, p2s } = providedParameters;
                ({ encryptedKey, ...parameters } = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$pbes2kw$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["encrypt"])(alg, key, cek, p2c, p2s));
                break;
            }
        case 'A128KW':
        case 'A192KW':
        case 'A256KW':
            {
                cek = providedCek || (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$lib$2f$cek$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(enc);
                encryptedKey = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$aeskw$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["wrap"])(alg, key, cek);
                break;
            }
        case 'A128GCMKW':
        case 'A192GCMKW':
        case 'A256GCMKW':
            {
                cek = providedCek || (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$lib$2f$cek$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(enc);
                const { iv } = providedParameters;
                ({ encryptedKey, ...parameters } = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$lib$2f$aesgcmkw$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["wrap"])(alg, key, cek, iv));
                break;
            }
        default:
            {
                throw new __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$util$2f$errors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["JOSENotSupported"]('Invalid or unsupported "alg" (JWE Algorithm) header value');
            }
    }
    return {
        cek,
        encryptedKey,
        parameters
    };
}
const __TURBOPACK__default__export__ = encryptKeyManagement;
}),
"[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/jwe/flattened/encrypt.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "FlattenedEncrypt",
    ()=>FlattenedEncrypt,
    "unprotected",
    ()=>unprotected
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$base64url$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/runtime/base64url.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$encrypt$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/runtime/encrypt.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$zlib$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/runtime/zlib.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$lib$2f$iv$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/lib/iv.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$lib$2f$encrypt_key_management$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/lib/encrypt_key_management.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$util$2f$errors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/util/errors.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$lib$2f$is_disjoint$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/lib/is_disjoint.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$lib$2f$buffer_utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/lib/buffer_utils.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$lib$2f$validate_crit$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/lib/validate_crit.js [app-client] (ecmascript)");
;
;
;
;
;
;
;
;
;
const unprotected = Symbol();
class FlattenedEncrypt {
    setKeyManagementParameters(parameters) {
        if (this._keyManagementParameters) {
            throw new TypeError('setKeyManagementParameters can only be called once');
        }
        this._keyManagementParameters = parameters;
        return this;
    }
    setProtectedHeader(protectedHeader) {
        if (this._protectedHeader) {
            throw new TypeError('setProtectedHeader can only be called once');
        }
        this._protectedHeader = protectedHeader;
        return this;
    }
    setSharedUnprotectedHeader(sharedUnprotectedHeader) {
        if (this._sharedUnprotectedHeader) {
            throw new TypeError('setSharedUnprotectedHeader can only be called once');
        }
        this._sharedUnprotectedHeader = sharedUnprotectedHeader;
        return this;
    }
    setUnprotectedHeader(unprotectedHeader) {
        if (this._unprotectedHeader) {
            throw new TypeError('setUnprotectedHeader can only be called once');
        }
        this._unprotectedHeader = unprotectedHeader;
        return this;
    }
    setAdditionalAuthenticatedData(aad) {
        this._aad = aad;
        return this;
    }
    setContentEncryptionKey(cek) {
        if (this._cek) {
            throw new TypeError('setContentEncryptionKey can only be called once');
        }
        this._cek = cek;
        return this;
    }
    setInitializationVector(iv) {
        if (this._iv) {
            throw new TypeError('setInitializationVector can only be called once');
        }
        this._iv = iv;
        return this;
    }
    async encrypt(key, options) {
        if (!this._protectedHeader && !this._unprotectedHeader && !this._sharedUnprotectedHeader) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$util$2f$errors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["JWEInvalid"]('either setProtectedHeader, setUnprotectedHeader, or sharedUnprotectedHeader must be called before #encrypt()');
        }
        if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$lib$2f$is_disjoint$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(this._protectedHeader, this._unprotectedHeader, this._sharedUnprotectedHeader)) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$util$2f$errors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["JWEInvalid"]('JWE Protected, JWE Shared Unprotected and JWE Per-Recipient Header Parameter names must be disjoint');
        }
        const joseHeader = {
            ...this._protectedHeader,
            ...this._unprotectedHeader,
            ...this._sharedUnprotectedHeader
        };
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$lib$2f$validate_crit$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(__TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$util$2f$errors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["JWEInvalid"], new Map(), options === null || options === void 0 ? void 0 : options.crit, this._protectedHeader, joseHeader);
        if (joseHeader.zip !== undefined) {
            if (!this._protectedHeader || !this._protectedHeader.zip) {
                throw new __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$util$2f$errors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["JWEInvalid"]('JWE "zip" (Compression Algorithm) Header MUST be integrity protected');
            }
            if (joseHeader.zip !== 'DEF') {
                throw new __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$util$2f$errors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["JOSENotSupported"]('Unsupported JWE "zip" (Compression Algorithm) Header Parameter value');
            }
        }
        const { alg, enc } = joseHeader;
        if (typeof alg !== 'string' || !alg) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$util$2f$errors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["JWEInvalid"]('JWE "alg" (Algorithm) Header Parameter missing or invalid');
        }
        if (typeof enc !== 'string' || !enc) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$util$2f$errors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["JWEInvalid"]('JWE "enc" (Encryption Algorithm) Header Parameter missing or invalid');
        }
        let encryptedKey;
        if (alg === 'dir') {
            if (this._cek) {
                throw new TypeError('setContentEncryptionKey cannot be called when using Direct Encryption');
            }
        } else if (alg === 'ECDH-ES') {
            if (this._cek) {
                throw new TypeError('setContentEncryptionKey cannot be called when using Direct Key Agreement');
            }
        }
        let cek;
        {
            let parameters;
            ({ cek, encryptedKey, parameters } = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$lib$2f$encrypt_key_management$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(alg, enc, key, this._cek, this._keyManagementParameters));
            if (parameters) {
                if (options && unprotected in options) {
                    if (!this._unprotectedHeader) {
                        this.setUnprotectedHeader(parameters);
                    } else {
                        this._unprotectedHeader = {
                            ...this._unprotectedHeader,
                            ...parameters
                        };
                    }
                } else {
                    if (!this._protectedHeader) {
                        this.setProtectedHeader(parameters);
                    } else {
                        this._protectedHeader = {
                            ...this._protectedHeader,
                            ...parameters
                        };
                    }
                }
            }
        }
        this._iv || (this._iv = (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$lib$2f$iv$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(enc));
        let additionalData;
        let protectedHeader;
        let aadMember;
        if (this._protectedHeader) {
            protectedHeader = __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$lib$2f$buffer_utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["encoder"].encode((0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$base64url$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["encode"])(JSON.stringify(this._protectedHeader)));
        } else {
            protectedHeader = __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$lib$2f$buffer_utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["encoder"].encode('');
        }
        if (this._aad) {
            aadMember = (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$base64url$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["encode"])(this._aad);
            additionalData = (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$lib$2f$buffer_utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["concat"])(protectedHeader, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$lib$2f$buffer_utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["encoder"].encode('.'), __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$lib$2f$buffer_utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["encoder"].encode(aadMember));
        } else {
            additionalData = protectedHeader;
        }
        let ciphertext;
        let tag;
        if (joseHeader.zip === 'DEF') {
            const deflated = await ((options === null || options === void 0 ? void 0 : options.deflateRaw) || __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$zlib$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["deflate"])(this._plaintext);
            ({ ciphertext, tag } = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$encrypt$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(enc, deflated, cek, this._iv, additionalData));
        } else {
            ;
            ({ ciphertext, tag } = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$encrypt$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(enc, this._plaintext, cek, this._iv, additionalData));
        }
        const jwe = {
            ciphertext: (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$base64url$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["encode"])(ciphertext),
            iv: (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$base64url$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["encode"])(this._iv),
            tag: (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$base64url$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["encode"])(tag)
        };
        if (encryptedKey) {
            jwe.encrypted_key = (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$base64url$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["encode"])(encryptedKey);
        }
        if (aadMember) {
            jwe.aad = aadMember;
        }
        if (this._protectedHeader) {
            jwe.protected = __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$lib$2f$buffer_utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["decoder"].decode(protectedHeader);
        }
        if (this._sharedUnprotectedHeader) {
            jwe.unprotected = this._sharedUnprotectedHeader;
        }
        if (this._unprotectedHeader) {
            jwe.header = this._unprotectedHeader;
        }
        return jwe;
    }
    constructor(plaintext){
        if (!(plaintext instanceof Uint8Array)) {
            throw new TypeError('plaintext must be an instance of Uint8Array');
        }
        this._plaintext = plaintext;
    }
}
}),
"[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/jwe/general/encrypt.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GeneralEncrypt",
    ()=>GeneralEncrypt
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$jwe$2f$flattened$2f$encrypt$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/jwe/flattened/encrypt.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$util$2f$errors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/util/errors.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$lib$2f$cek$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/lib/cek.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$lib$2f$is_disjoint$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/lib/is_disjoint.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$lib$2f$encrypt_key_management$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/lib/encrypt_key_management.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$base64url$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/runtime/base64url.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$lib$2f$validate_crit$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/lib/validate_crit.js [app-client] (ecmascript)");
;
;
;
;
;
;
;
class IndividualRecipient {
    setUnprotectedHeader(unprotectedHeader) {
        if (this.unprotectedHeader) {
            throw new TypeError('setUnprotectedHeader can only be called once');
        }
        this.unprotectedHeader = unprotectedHeader;
        return this;
    }
    addRecipient() {
        for(var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++){
            args[_key] = arguments[_key];
        }
        return this.parent.addRecipient(...args);
    }
    encrypt() {
        for(var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++){
            args[_key] = arguments[_key];
        }
        return this.parent.encrypt(...args);
    }
    done() {
        return this.parent;
    }
    constructor(enc, key, options){
        this.parent = enc;
        this.key = key;
        this.options = options;
    }
}
class GeneralEncrypt {
    addRecipient(key, options) {
        const recipient = new IndividualRecipient(this, key, {
            crit: options === null || options === void 0 ? void 0 : options.crit
        });
        this._recipients.push(recipient);
        return recipient;
    }
    setProtectedHeader(protectedHeader) {
        if (this._protectedHeader) {
            throw new TypeError('setProtectedHeader can only be called once');
        }
        this._protectedHeader = protectedHeader;
        return this;
    }
    setSharedUnprotectedHeader(sharedUnprotectedHeader) {
        if (this._unprotectedHeader) {
            throw new TypeError('setSharedUnprotectedHeader can only be called once');
        }
        this._unprotectedHeader = sharedUnprotectedHeader;
        return this;
    }
    setAdditionalAuthenticatedData(aad) {
        this._aad = aad;
        return this;
    }
    async encrypt(options) {
        var _a, _b, _c;
        if (!this._recipients.length) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$util$2f$errors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["JWEInvalid"]('at least one recipient must be added');
        }
        options = {
            deflateRaw: options === null || options === void 0 ? void 0 : options.deflateRaw
        };
        if (this._recipients.length === 1) {
            const [recipient] = this._recipients;
            const flattened = await new __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$jwe$2f$flattened$2f$encrypt$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FlattenedEncrypt"](this._plaintext).setAdditionalAuthenticatedData(this._aad).setProtectedHeader(this._protectedHeader).setSharedUnprotectedHeader(this._unprotectedHeader).setUnprotectedHeader(recipient.unprotectedHeader).encrypt(recipient.key, {
                ...recipient.options,
                ...options
            });
            let jwe = {
                ciphertext: flattened.ciphertext,
                iv: flattened.iv,
                recipients: [
                    {}
                ],
                tag: flattened.tag
            };
            if (flattened.aad) jwe.aad = flattened.aad;
            if (flattened.protected) jwe.protected = flattened.protected;
            if (flattened.unprotected) jwe.unprotected = flattened.unprotected;
            if (flattened.encrypted_key) jwe.recipients[0].encrypted_key = flattened.encrypted_key;
            if (flattened.header) jwe.recipients[0].header = flattened.header;
            return jwe;
        }
        let enc;
        for(let i = 0; i < this._recipients.length; i++){
            const recipient = this._recipients[i];
            if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$lib$2f$is_disjoint$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(this._protectedHeader, this._unprotectedHeader, recipient.unprotectedHeader)) {
                throw new __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$util$2f$errors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["JWEInvalid"]('JWE Protected, JWE Shared Unprotected and JWE Per-Recipient Header Parameter names must be disjoint');
            }
            const joseHeader = {
                ...this._protectedHeader,
                ...this._unprotectedHeader,
                ...recipient.unprotectedHeader
            };
            const { alg } = joseHeader;
            if (typeof alg !== 'string' || !alg) {
                throw new __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$util$2f$errors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["JWEInvalid"]('JWE "alg" (Algorithm) Header Parameter missing or invalid');
            }
            if (alg === 'dir' || alg === 'ECDH-ES') {
                throw new __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$util$2f$errors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["JWEInvalid"]('"dir" and "ECDH-ES" alg may only be used with a single recipient');
            }
            if (typeof joseHeader.enc !== 'string' || !joseHeader.enc) {
                throw new __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$util$2f$errors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["JWEInvalid"]('JWE "enc" (Encryption Algorithm) Header Parameter missing or invalid');
            }
            if (!enc) {
                enc = joseHeader.enc;
            } else if (enc !== joseHeader.enc) {
                throw new __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$util$2f$errors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["JWEInvalid"]('JWE "enc" (Encryption Algorithm) Header Parameter must be the same for all recipients');
            }
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$lib$2f$validate_crit$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(__TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$util$2f$errors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["JWEInvalid"], new Map(), recipient.options.crit, this._protectedHeader, joseHeader);
            if (joseHeader.zip !== undefined) {
                if (!this._protectedHeader || !this._protectedHeader.zip) {
                    throw new __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$util$2f$errors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["JWEInvalid"]('JWE "zip" (Compression Algorithm) Header MUST be integrity protected');
                }
            }
        }
        const cek = (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$lib$2f$cek$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(enc);
        let jwe = {
            ciphertext: '',
            iv: '',
            recipients: [],
            tag: ''
        };
        for(let i = 0; i < this._recipients.length; i++){
            const recipient = this._recipients[i];
            const target = {};
            jwe.recipients.push(target);
            const joseHeader = {
                ...this._protectedHeader,
                ...this._unprotectedHeader,
                ...recipient.unprotectedHeader
            };
            const p2c = joseHeader.alg.startsWith('PBES2') ? 2048 + i : undefined;
            if (i === 0) {
                const flattened = await new __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$jwe$2f$flattened$2f$encrypt$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FlattenedEncrypt"](this._plaintext).setAdditionalAuthenticatedData(this._aad).setContentEncryptionKey(cek).setProtectedHeader(this._protectedHeader).setSharedUnprotectedHeader(this._unprotectedHeader).setUnprotectedHeader(recipient.unprotectedHeader).setKeyManagementParameters({
                    p2c
                }).encrypt(recipient.key, {
                    ...recipient.options,
                    ...options,
                    [__TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$jwe$2f$flattened$2f$encrypt$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["unprotected"]]: true
                });
                jwe.ciphertext = flattened.ciphertext;
                jwe.iv = flattened.iv;
                jwe.tag = flattened.tag;
                if (flattened.aad) jwe.aad = flattened.aad;
                if (flattened.protected) jwe.protected = flattened.protected;
                if (flattened.unprotected) jwe.unprotected = flattened.unprotected;
                target.encrypted_key = flattened.encrypted_key;
                if (flattened.header) target.header = flattened.header;
                continue;
            }
            const { encryptedKey, parameters } = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$lib$2f$encrypt_key_management$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(((_a = recipient.unprotectedHeader) === null || _a === void 0 ? void 0 : _a.alg) || ((_b = this._protectedHeader) === null || _b === void 0 ? void 0 : _b.alg) || ((_c = this._unprotectedHeader) === null || _c === void 0 ? void 0 : _c.alg), enc, recipient.key, cek, {
                p2c
            });
            target.encrypted_key = (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$base64url$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["encode"])(encryptedKey);
            if (recipient.unprotectedHeader || parameters) target.header = {
                ...recipient.unprotectedHeader,
                ...parameters
            };
        }
        return jwe;
    }
    constructor(plaintext){
        this._recipients = [];
        this._plaintext = plaintext;
    }
}
}),
"[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/runtime/subtle_dsa.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>subtleDsa
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$util$2f$errors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/util/errors.js [app-client] (ecmascript)");
;
function subtleDsa(alg, algorithm) {
    const hash = "SHA-".concat(alg.slice(-3));
    switch(alg){
        case 'HS256':
        case 'HS384':
        case 'HS512':
            return {
                hash,
                name: 'HMAC'
            };
        case 'PS256':
        case 'PS384':
        case 'PS512':
            return {
                hash,
                name: 'RSA-PSS',
                saltLength: alg.slice(-3) >> 3
            };
        case 'RS256':
        case 'RS384':
        case 'RS512':
            return {
                hash,
                name: 'RSASSA-PKCS1-v1_5'
            };
        case 'ES256':
        case 'ES384':
        case 'ES512':
            return {
                hash,
                name: 'ECDSA',
                namedCurve: algorithm.namedCurve
            };
        case 'EdDSA':
            return {
                name: algorithm.name
            };
        default:
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$util$2f$errors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["JOSENotSupported"]("alg ".concat(alg, " is not supported either by JOSE or your javascript runtime"));
    }
}
}),
"[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/runtime/get_sign_verify_key.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>getCryptoKey
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$webcrypto$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/runtime/webcrypto.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$lib$2f$crypto_key$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/lib/crypto_key.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$lib$2f$invalid_key_input$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/lib/invalid_key_input.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$is_key_like$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/runtime/is_key_like.js [app-client] (ecmascript)");
;
;
;
;
function getCryptoKey(alg, key, usage) {
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$webcrypto$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isCryptoKey"])(key)) {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$lib$2f$crypto_key$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["checkSigCryptoKey"])(key, alg, usage);
        return key;
    }
    if (key instanceof Uint8Array) {
        if (!alg.startsWith('HS')) {
            throw new TypeError((0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$lib$2f$invalid_key_input$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(key, ...__TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$is_key_like$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["types"]));
        }
        return __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$webcrypto$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].subtle.importKey('raw', key, {
            hash: "SHA-".concat(alg.slice(-3)),
            name: 'HMAC'
        }, false, [
            usage
        ]);
    }
    throw new TypeError((0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$lib$2f$invalid_key_input$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(key, ...__TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$is_key_like$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["types"], 'Uint8Array'));
}
}),
"[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/runtime/verify.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$subtle_dsa$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/runtime/subtle_dsa.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$webcrypto$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/runtime/webcrypto.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$check_key_length$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/runtime/check_key_length.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$get_sign_verify_key$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/runtime/get_sign_verify_key.js [app-client] (ecmascript)");
;
;
;
;
const verify = async (alg, key, signature, data)=>{
    const cryptoKey = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$get_sign_verify_key$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(alg, key, 'verify');
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$check_key_length$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(alg, cryptoKey);
    const algorithm = (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$subtle_dsa$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(alg, cryptoKey.algorithm);
    try {
        return await __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$webcrypto$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].subtle.verify(algorithm, cryptoKey, signature, data);
    } catch (_a) {
        return false;
    }
};
const __TURBOPACK__default__export__ = verify;
}),
"[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/jws/flattened/verify.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "flattenedVerify",
    ()=>flattenedVerify
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$base64url$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/runtime/base64url.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$verify$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/runtime/verify.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$util$2f$errors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/util/errors.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$lib$2f$buffer_utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/lib/buffer_utils.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$lib$2f$is_disjoint$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/lib/is_disjoint.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$lib$2f$is_object$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/lib/is_object.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$lib$2f$check_key_type$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/lib/check_key_type.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$lib$2f$validate_crit$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/lib/validate_crit.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$lib$2f$validate_algorithms$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/lib/validate_algorithms.js [app-client] (ecmascript)");
;
;
;
;
;
;
;
;
;
async function flattenedVerify(jws, key, options) {
    var _a;
    if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$lib$2f$is_object$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(jws)) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$util$2f$errors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["JWSInvalid"]('Flattened JWS must be an object');
    }
    if (jws.protected === undefined && jws.header === undefined) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$util$2f$errors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["JWSInvalid"]('Flattened JWS must have either of the "protected" or "header" members');
    }
    if (jws.protected !== undefined && typeof jws.protected !== 'string') {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$util$2f$errors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["JWSInvalid"]('JWS Protected Header incorrect type');
    }
    if (jws.payload === undefined) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$util$2f$errors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["JWSInvalid"]('JWS Payload missing');
    }
    if (typeof jws.signature !== 'string') {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$util$2f$errors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["JWSInvalid"]('JWS Signature missing or incorrect type');
    }
    if (jws.header !== undefined && !(0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$lib$2f$is_object$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(jws.header)) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$util$2f$errors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["JWSInvalid"]('JWS Unprotected Header incorrect type');
    }
    let parsedProt = {};
    if (jws.protected) {
        try {
            const protectedHeader = (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$base64url$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["decode"])(jws.protected);
            parsedProt = JSON.parse(__TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$lib$2f$buffer_utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["decoder"].decode(protectedHeader));
        } catch (_b) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$util$2f$errors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["JWSInvalid"]('JWS Protected Header is invalid');
        }
    }
    if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$lib$2f$is_disjoint$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(parsedProt, jws.header)) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$util$2f$errors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["JWSInvalid"]('JWS Protected and JWS Unprotected Header Parameter names must be disjoint');
    }
    const joseHeader = {
        ...parsedProt,
        ...jws.header
    };
    const extensions = (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$lib$2f$validate_crit$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(__TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$util$2f$errors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["JWSInvalid"], new Map([
        [
            'b64',
            true
        ]
    ]), options === null || options === void 0 ? void 0 : options.crit, parsedProt, joseHeader);
    let b64 = true;
    if (extensions.has('b64')) {
        b64 = parsedProt.b64;
        if (typeof b64 !== 'boolean') {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$util$2f$errors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["JWSInvalid"]('The "b64" (base64url-encode payload) Header Parameter must be a boolean');
        }
    }
    const { alg } = joseHeader;
    if (typeof alg !== 'string' || !alg) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$util$2f$errors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["JWSInvalid"]('JWS "alg" (Algorithm) Header Parameter missing or invalid');
    }
    const algorithms = options && (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$lib$2f$validate_algorithms$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])('algorithms', options.algorithms);
    if (algorithms && !algorithms.has(alg)) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$util$2f$errors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["JOSEAlgNotAllowed"]('"alg" (Algorithm) Header Parameter not allowed');
    }
    if (b64) {
        if (typeof jws.payload !== 'string') {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$util$2f$errors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["JWSInvalid"]('JWS Payload must be a string');
        }
    } else if (typeof jws.payload !== 'string' && !(jws.payload instanceof Uint8Array)) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$util$2f$errors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["JWSInvalid"]('JWS Payload must be a string or an Uint8Array instance');
    }
    let resolvedKey = false;
    if (typeof key === 'function') {
        key = await key(parsedProt, jws);
        resolvedKey = true;
    }
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$lib$2f$check_key_type$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(alg, key, 'verify');
    const data = (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$lib$2f$buffer_utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["concat"])(__TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$lib$2f$buffer_utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["encoder"].encode((_a = jws.protected) !== null && _a !== void 0 ? _a : ''), __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$lib$2f$buffer_utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["encoder"].encode('.'), typeof jws.payload === 'string' ? __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$lib$2f$buffer_utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["encoder"].encode(jws.payload) : jws.payload);
    let signature;
    try {
        signature = (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$base64url$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["decode"])(jws.signature);
    } catch (_c) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$util$2f$errors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["JWSInvalid"]('Failed to base64url decode the signature');
    }
    const verified = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$verify$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(alg, key, signature, data);
    if (!verified) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$util$2f$errors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["JWSSignatureVerificationFailed"]();
    }
    let payload;
    if (b64) {
        try {
            payload = (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$base64url$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["decode"])(jws.payload);
        } catch (_d) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$util$2f$errors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["JWSInvalid"]('Failed to base64url decode the payload');
        }
    } else if (typeof jws.payload === 'string') {
        payload = __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$lib$2f$buffer_utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["encoder"].encode(jws.payload);
    } else {
        payload = jws.payload;
    }
    const result = {
        payload
    };
    if (jws.protected !== undefined) {
        result.protectedHeader = parsedProt;
    }
    if (jws.header !== undefined) {
        result.unprotectedHeader = jws.header;
    }
    if (resolvedKey) {
        return {
            ...result,
            key
        };
    }
    return result;
}
}),
"[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/jws/compact/verify.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "compactVerify",
    ()=>compactVerify
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$jws$2f$flattened$2f$verify$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/jws/flattened/verify.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$util$2f$errors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/util/errors.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$lib$2f$buffer_utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/lib/buffer_utils.js [app-client] (ecmascript)");
;
;
;
async function compactVerify(jws, key, options) {
    if (jws instanceof Uint8Array) {
        jws = __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$lib$2f$buffer_utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["decoder"].decode(jws);
    }
    if (typeof jws !== 'string') {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$util$2f$errors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["JWSInvalid"]('Compact JWS must be a string or Uint8Array');
    }
    const { 0: protectedHeader, 1: payload, 2: signature, length } = jws.split('.');
    if (length !== 3) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$util$2f$errors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["JWSInvalid"]('Invalid Compact JWS');
    }
    const verified = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$jws$2f$flattened$2f$verify$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["flattenedVerify"])({
        payload,
        protected: protectedHeader,
        signature
    }, key, options);
    const result = {
        payload: verified.payload,
        protectedHeader: verified.protectedHeader
    };
    if (typeof key === 'function') {
        return {
            ...result,
            key: verified.key
        };
    }
    return result;
}
}),
"[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/jws/general/verify.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "generalVerify",
    ()=>generalVerify
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$jws$2f$flattened$2f$verify$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/jws/flattened/verify.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$util$2f$errors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/util/errors.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$lib$2f$is_object$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/lib/is_object.js [app-client] (ecmascript)");
;
;
;
async function generalVerify(jws, key, options) {
    if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$lib$2f$is_object$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(jws)) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$util$2f$errors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["JWSInvalid"]('General JWS must be an object');
    }
    if (!Array.isArray(jws.signatures) || !jws.signatures.every(__TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$lib$2f$is_object$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$util$2f$errors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["JWSInvalid"]('JWS Signatures missing or incorrect type');
    }
    for (const signature of jws.signatures){
        try {
            return await (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$jws$2f$flattened$2f$verify$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["flattenedVerify"])({
                header: signature.header,
                payload: jws.payload,
                protected: signature.protected,
                signature: signature.signature
            }, key, options);
        } catch (_a) {}
    }
    throw new __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$util$2f$errors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["JWSSignatureVerificationFailed"]();
}
}),
"[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/lib/epoch.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
const __TURBOPACK__default__export__ = (date)=>Math.floor(date.getTime() / 1000);
}),
"[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/lib/secs.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
const minute = 60;
const hour = minute * 60;
const day = hour * 24;
const week = day * 7;
const year = day * 365.25;
const REGEX = /^(\d+|\d+\.\d+) ?(seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)$/i;
const __TURBOPACK__default__export__ = (str)=>{
    const matched = REGEX.exec(str);
    if (!matched) {
        throw new TypeError('Invalid time period format');
    }
    const value = parseFloat(matched[1]);
    const unit = matched[2].toLowerCase();
    switch(unit){
        case 'sec':
        case 'secs':
        case 'second':
        case 'seconds':
        case 's':
            return Math.round(value);
        case 'minute':
        case 'minutes':
        case 'min':
        case 'mins':
        case 'm':
            return Math.round(value * minute);
        case 'hour':
        case 'hours':
        case 'hr':
        case 'hrs':
        case 'h':
            return Math.round(value * hour);
        case 'day':
        case 'days':
        case 'd':
            return Math.round(value * day);
        case 'week':
        case 'weeks':
        case 'w':
            return Math.round(value * week);
        default:
            return Math.round(value * year);
    }
};
}),
"[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/lib/jwt_claims_set.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$util$2f$errors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/util/errors.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$lib$2f$buffer_utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/lib/buffer_utils.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$lib$2f$epoch$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/lib/epoch.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$lib$2f$secs$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/lib/secs.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$lib$2f$is_object$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/lib/is_object.js [app-client] (ecmascript)");
;
;
;
;
;
const normalizeTyp = (value)=>value.toLowerCase().replace(/^application\//, '');
const checkAudiencePresence = (audPayload, audOption)=>{
    if (typeof audPayload === 'string') {
        return audOption.includes(audPayload);
    }
    if (Array.isArray(audPayload)) {
        return audOption.some(Set.prototype.has.bind(new Set(audPayload)));
    }
    return false;
};
const __TURBOPACK__default__export__ = function(protectedHeader, encodedPayload) {
    let options = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
    const { typ } = options;
    if (typ && (typeof protectedHeader.typ !== 'string' || normalizeTyp(protectedHeader.typ) !== normalizeTyp(typ))) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$util$2f$errors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["JWTClaimValidationFailed"]('unexpected "typ" JWT header value', 'typ', 'check_failed');
    }
    let payload;
    try {
        payload = JSON.parse(__TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$lib$2f$buffer_utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["decoder"].decode(encodedPayload));
    } catch (_a) {}
    if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$lib$2f$is_object$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(payload)) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$util$2f$errors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["JWTInvalid"]('JWT Claims Set must be a top-level JSON object');
    }
    const { requiredClaims = [], issuer, subject, audience, maxTokenAge } = options;
    if (maxTokenAge !== undefined) requiredClaims.push('iat');
    if (audience !== undefined) requiredClaims.push('aud');
    if (subject !== undefined) requiredClaims.push('sub');
    if (issuer !== undefined) requiredClaims.push('iss');
    for (const claim of new Set(requiredClaims.reverse())){
        if (!(claim in payload)) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$util$2f$errors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["JWTClaimValidationFailed"]('missing required "'.concat(claim, '" claim'), claim, 'missing');
        }
    }
    if (issuer && !(Array.isArray(issuer) ? issuer : [
        issuer
    ]).includes(payload.iss)) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$util$2f$errors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["JWTClaimValidationFailed"]('unexpected "iss" claim value', 'iss', 'check_failed');
    }
    if (subject && payload.sub !== subject) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$util$2f$errors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["JWTClaimValidationFailed"]('unexpected "sub" claim value', 'sub', 'check_failed');
    }
    if (audience && !checkAudiencePresence(payload.aud, typeof audience === 'string' ? [
        audience
    ] : audience)) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$util$2f$errors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["JWTClaimValidationFailed"]('unexpected "aud" claim value', 'aud', 'check_failed');
    }
    let tolerance;
    switch(typeof options.clockTolerance){
        case 'string':
            tolerance = (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$lib$2f$secs$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(options.clockTolerance);
            break;
        case 'number':
            tolerance = options.clockTolerance;
            break;
        case 'undefined':
            tolerance = 0;
            break;
        default:
            throw new TypeError('Invalid clockTolerance option type');
    }
    const { currentDate } = options;
    const now = (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$lib$2f$epoch$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(currentDate || new Date());
    if ((payload.iat !== undefined || maxTokenAge) && typeof payload.iat !== 'number') {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$util$2f$errors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["JWTClaimValidationFailed"]('"iat" claim must be a number', 'iat', 'invalid');
    }
    if (payload.nbf !== undefined) {
        if (typeof payload.nbf !== 'number') {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$util$2f$errors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["JWTClaimValidationFailed"]('"nbf" claim must be a number', 'nbf', 'invalid');
        }
        if (payload.nbf > now + tolerance) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$util$2f$errors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["JWTClaimValidationFailed"]('"nbf" claim timestamp check failed', 'nbf', 'check_failed');
        }
    }
    if (payload.exp !== undefined) {
        if (typeof payload.exp !== 'number') {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$util$2f$errors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["JWTClaimValidationFailed"]('"exp" claim must be a number', 'exp', 'invalid');
        }
        if (payload.exp <= now - tolerance) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$util$2f$errors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["JWTExpired"]('"exp" claim timestamp check failed', 'exp', 'check_failed');
        }
    }
    if (maxTokenAge) {
        const age = now - payload.iat;
        const max = typeof maxTokenAge === 'number' ? maxTokenAge : (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$lib$2f$secs$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(maxTokenAge);
        if (age - tolerance > max) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$util$2f$errors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["JWTExpired"]('"iat" claim timestamp check failed (too far in the past)', 'iat', 'check_failed');
        }
        if (age < 0 - tolerance) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$util$2f$errors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["JWTClaimValidationFailed"]('"iat" claim timestamp check failed (it should be in the past)', 'iat', 'check_failed');
        }
    }
    return payload;
};
}),
"[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/jwt/verify.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "jwtVerify",
    ()=>jwtVerify
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$jws$2f$compact$2f$verify$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/jws/compact/verify.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$lib$2f$jwt_claims_set$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/lib/jwt_claims_set.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$util$2f$errors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/util/errors.js [app-client] (ecmascript)");
;
;
;
async function jwtVerify(jwt, key, options) {
    var _a;
    const verified = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$jws$2f$compact$2f$verify$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["compactVerify"])(jwt, key, options);
    if (((_a = verified.protectedHeader.crit) === null || _a === void 0 ? void 0 : _a.includes('b64')) && verified.protectedHeader.b64 === false) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$util$2f$errors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["JWTInvalid"]('JWTs MUST NOT use unencoded payload');
    }
    const payload = (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$lib$2f$jwt_claims_set$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(verified.protectedHeader, verified.payload, options);
    const result = {
        payload,
        protectedHeader: verified.protectedHeader
    };
    if (typeof key === 'function') {
        return {
            ...result,
            key: verified.key
        };
    }
    return result;
}
}),
"[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/jwt/decrypt.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "jwtDecrypt",
    ()=>jwtDecrypt
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$jwe$2f$compact$2f$decrypt$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/jwe/compact/decrypt.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$lib$2f$jwt_claims_set$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/lib/jwt_claims_set.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$util$2f$errors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/util/errors.js [app-client] (ecmascript)");
;
;
;
async function jwtDecrypt(jwt, key, options) {
    const decrypted = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$jwe$2f$compact$2f$decrypt$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["compactDecrypt"])(jwt, key, options);
    const payload = (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$lib$2f$jwt_claims_set$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(decrypted.protectedHeader, decrypted.plaintext, options);
    const { protectedHeader } = decrypted;
    if (protectedHeader.iss !== undefined && protectedHeader.iss !== payload.iss) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$util$2f$errors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["JWTClaimValidationFailed"]('replicated "iss" claim header parameter mismatch', 'iss', 'mismatch');
    }
    if (protectedHeader.sub !== undefined && protectedHeader.sub !== payload.sub) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$util$2f$errors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["JWTClaimValidationFailed"]('replicated "sub" claim header parameter mismatch', 'sub', 'mismatch');
    }
    if (protectedHeader.aud !== undefined && JSON.stringify(protectedHeader.aud) !== JSON.stringify(payload.aud)) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$util$2f$errors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["JWTClaimValidationFailed"]('replicated "aud" claim header parameter mismatch', 'aud', 'mismatch');
    }
    const result = {
        payload,
        protectedHeader
    };
    if (typeof key === 'function') {
        return {
            ...result,
            key: decrypted.key
        };
    }
    return result;
}
}),
"[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/jwe/compact/encrypt.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "CompactEncrypt",
    ()=>CompactEncrypt
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$jwe$2f$flattened$2f$encrypt$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/jwe/flattened/encrypt.js [app-client] (ecmascript)");
;
class CompactEncrypt {
    setContentEncryptionKey(cek) {
        this._flattened.setContentEncryptionKey(cek);
        return this;
    }
    setInitializationVector(iv) {
        this._flattened.setInitializationVector(iv);
        return this;
    }
    setProtectedHeader(protectedHeader) {
        this._flattened.setProtectedHeader(protectedHeader);
        return this;
    }
    setKeyManagementParameters(parameters) {
        this._flattened.setKeyManagementParameters(parameters);
        return this;
    }
    async encrypt(key, options) {
        const jwe = await this._flattened.encrypt(key, options);
        return [
            jwe.protected,
            jwe.encrypted_key,
            jwe.iv,
            jwe.ciphertext,
            jwe.tag
        ].join('.');
    }
    constructor(plaintext){
        this._flattened = new __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$jwe$2f$flattened$2f$encrypt$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FlattenedEncrypt"](plaintext);
    }
}
}),
"[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/runtime/sign.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$subtle_dsa$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/runtime/subtle_dsa.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$webcrypto$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/runtime/webcrypto.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$check_key_length$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/runtime/check_key_length.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$get_sign_verify_key$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/runtime/get_sign_verify_key.js [app-client] (ecmascript)");
;
;
;
;
const sign = async (alg, key, data)=>{
    const cryptoKey = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$get_sign_verify_key$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(alg, key, 'sign');
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$check_key_length$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(alg, cryptoKey);
    const signature = await __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$webcrypto$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].subtle.sign((0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$subtle_dsa$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(alg, cryptoKey.algorithm), cryptoKey, data);
    return new Uint8Array(signature);
};
const __TURBOPACK__default__export__ = sign;
}),
"[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/jws/flattened/sign.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "FlattenedSign",
    ()=>FlattenedSign
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$base64url$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/runtime/base64url.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$sign$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/runtime/sign.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$lib$2f$is_disjoint$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/lib/is_disjoint.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$util$2f$errors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/util/errors.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$lib$2f$buffer_utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/lib/buffer_utils.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$lib$2f$check_key_type$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/lib/check_key_type.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$lib$2f$validate_crit$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/lib/validate_crit.js [app-client] (ecmascript)");
;
;
;
;
;
;
;
class FlattenedSign {
    setProtectedHeader(protectedHeader) {
        if (this._protectedHeader) {
            throw new TypeError('setProtectedHeader can only be called once');
        }
        this._protectedHeader = protectedHeader;
        return this;
    }
    setUnprotectedHeader(unprotectedHeader) {
        if (this._unprotectedHeader) {
            throw new TypeError('setUnprotectedHeader can only be called once');
        }
        this._unprotectedHeader = unprotectedHeader;
        return this;
    }
    async sign(key, options) {
        if (!this._protectedHeader && !this._unprotectedHeader) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$util$2f$errors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["JWSInvalid"]('either setProtectedHeader or setUnprotectedHeader must be called before #sign()');
        }
        if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$lib$2f$is_disjoint$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(this._protectedHeader, this._unprotectedHeader)) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$util$2f$errors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["JWSInvalid"]('JWS Protected and JWS Unprotected Header Parameter names must be disjoint');
        }
        const joseHeader = {
            ...this._protectedHeader,
            ...this._unprotectedHeader
        };
        const extensions = (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$lib$2f$validate_crit$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(__TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$util$2f$errors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["JWSInvalid"], new Map([
            [
                'b64',
                true
            ]
        ]), options === null || options === void 0 ? void 0 : options.crit, this._protectedHeader, joseHeader);
        let b64 = true;
        if (extensions.has('b64')) {
            b64 = this._protectedHeader.b64;
            if (typeof b64 !== 'boolean') {
                throw new __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$util$2f$errors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["JWSInvalid"]('The "b64" (base64url-encode payload) Header Parameter must be a boolean');
            }
        }
        const { alg } = joseHeader;
        if (typeof alg !== 'string' || !alg) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$util$2f$errors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["JWSInvalid"]('JWS "alg" (Algorithm) Header Parameter missing or invalid');
        }
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$lib$2f$check_key_type$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(alg, key, 'sign');
        let payload = this._payload;
        if (b64) {
            payload = __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$lib$2f$buffer_utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["encoder"].encode((0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$base64url$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["encode"])(payload));
        }
        let protectedHeader;
        if (this._protectedHeader) {
            protectedHeader = __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$lib$2f$buffer_utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["encoder"].encode((0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$base64url$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["encode"])(JSON.stringify(this._protectedHeader)));
        } else {
            protectedHeader = __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$lib$2f$buffer_utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["encoder"].encode('');
        }
        const data = (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$lib$2f$buffer_utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["concat"])(protectedHeader, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$lib$2f$buffer_utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["encoder"].encode('.'), payload);
        const signature = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$sign$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(alg, key, data);
        const jws = {
            signature: (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$base64url$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["encode"])(signature),
            payload: ''
        };
        if (b64) {
            jws.payload = __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$lib$2f$buffer_utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["decoder"].decode(payload);
        }
        if (this._unprotectedHeader) {
            jws.header = this._unprotectedHeader;
        }
        if (this._protectedHeader) {
            jws.protected = __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$lib$2f$buffer_utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["decoder"].decode(protectedHeader);
        }
        return jws;
    }
    constructor(payload){
        if (!(payload instanceof Uint8Array)) {
            throw new TypeError('payload must be an instance of Uint8Array');
        }
        this._payload = payload;
    }
}
}),
"[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/jws/compact/sign.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "CompactSign",
    ()=>CompactSign
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$jws$2f$flattened$2f$sign$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/jws/flattened/sign.js [app-client] (ecmascript)");
;
class CompactSign {
    setProtectedHeader(protectedHeader) {
        this._flattened.setProtectedHeader(protectedHeader);
        return this;
    }
    async sign(key, options) {
        const jws = await this._flattened.sign(key, options);
        if (jws.payload === undefined) {
            throw new TypeError('use the flattened module for creating JWS with b64: false');
        }
        return "".concat(jws.protected, ".").concat(jws.payload, ".").concat(jws.signature);
    }
    constructor(payload){
        this._flattened = new __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$jws$2f$flattened$2f$sign$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FlattenedSign"](payload);
    }
}
}),
"[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/jws/general/sign.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GeneralSign",
    ()=>GeneralSign
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$jws$2f$flattened$2f$sign$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/jws/flattened/sign.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$util$2f$errors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/util/errors.js [app-client] (ecmascript)");
;
;
class IndividualSignature {
    setProtectedHeader(protectedHeader) {
        if (this.protectedHeader) {
            throw new TypeError('setProtectedHeader can only be called once');
        }
        this.protectedHeader = protectedHeader;
        return this;
    }
    setUnprotectedHeader(unprotectedHeader) {
        if (this.unprotectedHeader) {
            throw new TypeError('setUnprotectedHeader can only be called once');
        }
        this.unprotectedHeader = unprotectedHeader;
        return this;
    }
    addSignature() {
        for(var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++){
            args[_key] = arguments[_key];
        }
        return this.parent.addSignature(...args);
    }
    sign() {
        for(var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++){
            args[_key] = arguments[_key];
        }
        return this.parent.sign(...args);
    }
    done() {
        return this.parent;
    }
    constructor(sig, key, options){
        this.parent = sig;
        this.key = key;
        this.options = options;
    }
}
class GeneralSign {
    addSignature(key, options) {
        const signature = new IndividualSignature(this, key, options);
        this._signatures.push(signature);
        return signature;
    }
    async sign() {
        if (!this._signatures.length) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$util$2f$errors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["JWSInvalid"]('at least one signature must be added');
        }
        const jws = {
            signatures: [],
            payload: ''
        };
        for(let i = 0; i < this._signatures.length; i++){
            const signature = this._signatures[i];
            const flattened = new __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$jws$2f$flattened$2f$sign$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FlattenedSign"](this._payload);
            flattened.setProtectedHeader(signature.protectedHeader);
            flattened.setUnprotectedHeader(signature.unprotectedHeader);
            const { payload, ...rest } = await flattened.sign(signature.key, signature.options);
            if (i === 0) {
                jws.payload = payload;
            } else if (jws.payload !== payload) {
                throw new __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$util$2f$errors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["JWSInvalid"]('inconsistent use of JWS Unencoded Payload (RFC7797)');
            }
            jws.signatures.push(rest);
        }
        return jws;
    }
    constructor(payload){
        this._signatures = [];
        this._payload = payload;
    }
}
}),
"[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/jwt/produce.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ProduceJWT",
    ()=>ProduceJWT
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$lib$2f$epoch$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/lib/epoch.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$lib$2f$is_object$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/lib/is_object.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$lib$2f$secs$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/lib/secs.js [app-client] (ecmascript)");
;
;
;
class ProduceJWT {
    setIssuer(issuer) {
        this._payload = {
            ...this._payload,
            iss: issuer
        };
        return this;
    }
    setSubject(subject) {
        this._payload = {
            ...this._payload,
            sub: subject
        };
        return this;
    }
    setAudience(audience) {
        this._payload = {
            ...this._payload,
            aud: audience
        };
        return this;
    }
    setJti(jwtId) {
        this._payload = {
            ...this._payload,
            jti: jwtId
        };
        return this;
    }
    setNotBefore(input) {
        if (typeof input === 'number') {
            this._payload = {
                ...this._payload,
                nbf: input
            };
        } else {
            this._payload = {
                ...this._payload,
                nbf: (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$lib$2f$epoch$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(new Date()) + (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$lib$2f$secs$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(input)
            };
        }
        return this;
    }
    setExpirationTime(input) {
        if (typeof input === 'number') {
            this._payload = {
                ...this._payload,
                exp: input
            };
        } else {
            this._payload = {
                ...this._payload,
                exp: (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$lib$2f$epoch$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(new Date()) + (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$lib$2f$secs$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(input)
            };
        }
        return this;
    }
    setIssuedAt(input) {
        if (typeof input === 'undefined') {
            this._payload = {
                ...this._payload,
                iat: (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$lib$2f$epoch$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(new Date())
            };
        } else {
            this._payload = {
                ...this._payload,
                iat: input
            };
        }
        return this;
    }
    constructor(payload){
        if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$lib$2f$is_object$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(payload)) {
            throw new TypeError('JWT Claims Set MUST be an object');
        }
        this._payload = payload;
    }
}
}),
"[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/jwt/sign.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "SignJWT",
    ()=>SignJWT
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$jws$2f$compact$2f$sign$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/jws/compact/sign.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$util$2f$errors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/util/errors.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$lib$2f$buffer_utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/lib/buffer_utils.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$jwt$2f$produce$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/jwt/produce.js [app-client] (ecmascript)");
;
;
;
;
class SignJWT extends __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$jwt$2f$produce$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ProduceJWT"] {
    setProtectedHeader(protectedHeader) {
        this._protectedHeader = protectedHeader;
        return this;
    }
    async sign(key, options) {
        var _a;
        const sig = new __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$jws$2f$compact$2f$sign$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CompactSign"](__TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$lib$2f$buffer_utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["encoder"].encode(JSON.stringify(this._payload)));
        sig.setProtectedHeader(this._protectedHeader);
        if (Array.isArray((_a = this._protectedHeader) === null || _a === void 0 ? void 0 : _a.crit) && this._protectedHeader.crit.includes('b64') && this._protectedHeader.b64 === false) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$util$2f$errors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["JWTInvalid"]('JWTs MUST NOT use unencoded payload');
        }
        return sig.sign(key, options);
    }
}
}),
"[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/jwt/encrypt.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "EncryptJWT",
    ()=>EncryptJWT
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$jwe$2f$compact$2f$encrypt$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/jwe/compact/encrypt.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$lib$2f$buffer_utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/lib/buffer_utils.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$jwt$2f$produce$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/jwt/produce.js [app-client] (ecmascript)");
;
;
;
class EncryptJWT extends __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$jwt$2f$produce$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ProduceJWT"] {
    setProtectedHeader(protectedHeader) {
        if (this._protectedHeader) {
            throw new TypeError('setProtectedHeader can only be called once');
        }
        this._protectedHeader = protectedHeader;
        return this;
    }
    setKeyManagementParameters(parameters) {
        if (this._keyManagementParameters) {
            throw new TypeError('setKeyManagementParameters can only be called once');
        }
        this._keyManagementParameters = parameters;
        return this;
    }
    setContentEncryptionKey(cek) {
        if (this._cek) {
            throw new TypeError('setContentEncryptionKey can only be called once');
        }
        this._cek = cek;
        return this;
    }
    setInitializationVector(iv) {
        if (this._iv) {
            throw new TypeError('setInitializationVector can only be called once');
        }
        this._iv = iv;
        return this;
    }
    replicateIssuerAsHeader() {
        this._replicateIssuerAsHeader = true;
        return this;
    }
    replicateSubjectAsHeader() {
        this._replicateSubjectAsHeader = true;
        return this;
    }
    replicateAudienceAsHeader() {
        this._replicateAudienceAsHeader = true;
        return this;
    }
    async encrypt(key, options) {
        const enc = new __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$jwe$2f$compact$2f$encrypt$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CompactEncrypt"](__TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$lib$2f$buffer_utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["encoder"].encode(JSON.stringify(this._payload)));
        if (this._replicateIssuerAsHeader) {
            this._protectedHeader = {
                ...this._protectedHeader,
                iss: this._payload.iss
            };
        }
        if (this._replicateSubjectAsHeader) {
            this._protectedHeader = {
                ...this._protectedHeader,
                sub: this._payload.sub
            };
        }
        if (this._replicateAudienceAsHeader) {
            this._protectedHeader = {
                ...this._protectedHeader,
                aud: this._payload.aud
            };
        }
        enc.setProtectedHeader(this._protectedHeader);
        if (this._iv) {
            enc.setInitializationVector(this._iv);
        }
        if (this._cek) {
            enc.setContentEncryptionKey(this._cek);
        }
        if (this._keyManagementParameters) {
            enc.setKeyManagementParameters(this._keyManagementParameters);
        }
        return enc.encrypt(key, options);
    }
}
}),
"[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/jwk/thumbprint.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "calculateJwkThumbprint",
    ()=>calculateJwkThumbprint,
    "calculateJwkThumbprintUri",
    ()=>calculateJwkThumbprintUri
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$digest$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/runtime/digest.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$base64url$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/runtime/base64url.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$util$2f$errors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/util/errors.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$lib$2f$buffer_utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/lib/buffer_utils.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$lib$2f$is_object$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/lib/is_object.js [app-client] (ecmascript)");
;
;
;
;
;
const check = (value, description)=>{
    if (typeof value !== 'string' || !value) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$util$2f$errors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["JWKInvalid"]("".concat(description, " missing or invalid"));
    }
};
async function calculateJwkThumbprint(jwk, digestAlgorithm) {
    if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$lib$2f$is_object$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(jwk)) {
        throw new TypeError('JWK must be an object');
    }
    digestAlgorithm !== null && digestAlgorithm !== void 0 ? digestAlgorithm : digestAlgorithm = 'sha256';
    if (digestAlgorithm !== 'sha256' && digestAlgorithm !== 'sha384' && digestAlgorithm !== 'sha512') {
        throw new TypeError('digestAlgorithm must one of "sha256", "sha384", or "sha512"');
    }
    let components;
    switch(jwk.kty){
        case 'EC':
            check(jwk.crv, '"crv" (Curve) Parameter');
            check(jwk.x, '"x" (X Coordinate) Parameter');
            check(jwk.y, '"y" (Y Coordinate) Parameter');
            components = {
                crv: jwk.crv,
                kty: jwk.kty,
                x: jwk.x,
                y: jwk.y
            };
            break;
        case 'OKP':
            check(jwk.crv, '"crv" (Subtype of Key Pair) Parameter');
            check(jwk.x, '"x" (Public Key) Parameter');
            components = {
                crv: jwk.crv,
                kty: jwk.kty,
                x: jwk.x
            };
            break;
        case 'RSA':
            check(jwk.e, '"e" (Exponent) Parameter');
            check(jwk.n, '"n" (Modulus) Parameter');
            components = {
                e: jwk.e,
                kty: jwk.kty,
                n: jwk.n
            };
            break;
        case 'oct':
            check(jwk.k, '"k" (Key Value) Parameter');
            components = {
                k: jwk.k,
                kty: jwk.kty
            };
            break;
        default:
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$util$2f$errors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["JOSENotSupported"]('"kty" (Key Type) Parameter missing or unsupported');
    }
    const data = __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$lib$2f$buffer_utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["encoder"].encode(JSON.stringify(components));
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$base64url$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["encode"])(await (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$digest$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(digestAlgorithm, data));
}
async function calculateJwkThumbprintUri(jwk, digestAlgorithm) {
    digestAlgorithm !== null && digestAlgorithm !== void 0 ? digestAlgorithm : digestAlgorithm = 'sha256';
    const thumbprint = await calculateJwkThumbprint(jwk, digestAlgorithm);
    return "urn:ietf:params:oauth:jwk-thumbprint:sha-".concat(digestAlgorithm.slice(-3), ":").concat(thumbprint);
}
}),
"[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/jwk/embedded.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "EmbeddedJWK",
    ()=>EmbeddedJWK
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$key$2f$import$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/key/import.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$lib$2f$is_object$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/lib/is_object.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$util$2f$errors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/util/errors.js [app-client] (ecmascript)");
;
;
;
async function EmbeddedJWK(protectedHeader, token) {
    const joseHeader = {
        ...protectedHeader,
        ...token === null || token === void 0 ? void 0 : token.header
    };
    if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$lib$2f$is_object$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(joseHeader.jwk)) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$util$2f$errors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["JWSInvalid"]('"jwk" (JSON Web Key) Header Parameter must be a JSON object');
    }
    const key = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$key$2f$import$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["importJWK"])({
        ...joseHeader.jwk,
        ext: true
    }, joseHeader.alg, true);
    if (key instanceof Uint8Array || key.type !== 'public') {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$util$2f$errors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["JWSInvalid"]('"jwk" (JSON Web Key) Header Parameter must be a public key');
    }
    return key;
}
}),
"[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/jwks/local.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "LocalJWKSet",
    ()=>LocalJWKSet,
    "createLocalJWKSet",
    ()=>createLocalJWKSet,
    "isJWKSLike",
    ()=>isJWKSLike
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$key$2f$import$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/key/import.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$util$2f$errors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/util/errors.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$lib$2f$is_object$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/lib/is_object.js [app-client] (ecmascript)");
;
;
;
function getKtyFromAlg(alg) {
    switch(typeof alg === 'string' && alg.slice(0, 2)){
        case 'RS':
        case 'PS':
            return 'RSA';
        case 'ES':
            return 'EC';
        case 'Ed':
            return 'OKP';
        default:
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$util$2f$errors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["JOSENotSupported"]('Unsupported "alg" value for a JSON Web Key Set');
    }
}
function isJWKSLike(jwks) {
    return jwks && typeof jwks === 'object' && Array.isArray(jwks.keys) && jwks.keys.every(isJWKLike);
}
function isJWKLike(key) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$lib$2f$is_object$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(key);
}
function clone(obj) {
    if (typeof structuredClone === 'function') {
        return structuredClone(obj);
    }
    return JSON.parse(JSON.stringify(obj));
}
class LocalJWKSet {
    async getKey(protectedHeader, token) {
        const { alg, kid } = {
            ...protectedHeader,
            ...token === null || token === void 0 ? void 0 : token.header
        };
        const kty = getKtyFromAlg(alg);
        const candidates = this._jwks.keys.filter((jwk)=>{
            let candidate = kty === jwk.kty;
            if (candidate && typeof kid === 'string') {
                candidate = kid === jwk.kid;
            }
            if (candidate && typeof jwk.alg === 'string') {
                candidate = alg === jwk.alg;
            }
            if (candidate && typeof jwk.use === 'string') {
                candidate = jwk.use === 'sig';
            }
            if (candidate && Array.isArray(jwk.key_ops)) {
                candidate = jwk.key_ops.includes('verify');
            }
            if (candidate && alg === 'EdDSA') {
                candidate = jwk.crv === 'Ed25519' || jwk.crv === 'Ed448';
            }
            if (candidate) {
                switch(alg){
                    case 'ES256':
                        candidate = jwk.crv === 'P-256';
                        break;
                    case 'ES256K':
                        candidate = jwk.crv === 'secp256k1';
                        break;
                    case 'ES384':
                        candidate = jwk.crv === 'P-384';
                        break;
                    case 'ES512':
                        candidate = jwk.crv === 'P-521';
                        break;
                }
            }
            return candidate;
        });
        const { 0: jwk, length } = candidates;
        if (length === 0) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$util$2f$errors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["JWKSNoMatchingKey"]();
        } else if (length !== 1) {
            const error = new __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$util$2f$errors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["JWKSMultipleMatchingKeys"]();
            const { _cached } = this;
            error[Symbol.asyncIterator] = async function*() {
                for (const jwk of candidates){
                    try {
                        yield await importWithAlgCache(_cached, jwk, alg);
                    } catch (_a) {
                        continue;
                    }
                }
            };
            throw error;
        }
        return importWithAlgCache(this._cached, jwk, alg);
    }
    constructor(jwks){
        this._cached = new WeakMap();
        if (!isJWKSLike(jwks)) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$util$2f$errors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["JWKSInvalid"]('JSON Web Key Set malformed');
        }
        this._jwks = clone(jwks);
    }
}
async function importWithAlgCache(cache, jwk, alg) {
    const cached = cache.get(jwk) || cache.set(jwk, {}).get(jwk);
    if (cached[alg] === undefined) {
        const key = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$key$2f$import$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["importJWK"])({
            ...jwk,
            ext: true
        }, alg);
        if (key instanceof Uint8Array || key.type !== 'public') {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$util$2f$errors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["JWKSInvalid"]('JSON Web Key Set members must be public keys');
        }
        cached[alg] = key;
    }
    return cached[alg];
}
function createLocalJWKSet(jwks) {
    const set = new LocalJWKSet(jwks);
    return async function(protectedHeader, token) {
        return set.getKey(protectedHeader, token);
    };
}
}),
"[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/runtime/fetch_jwks.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$util$2f$errors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/util/errors.js [app-client] (ecmascript)");
;
const fetchJwks = async (url, timeout, options)=>{
    let controller;
    let id;
    let timedOut = false;
    if (typeof AbortController === 'function') {
        controller = new AbortController();
        id = setTimeout(()=>{
            timedOut = true;
            controller.abort();
        }, timeout);
    }
    const response = await fetch(url.href, {
        signal: controller ? controller.signal : undefined,
        redirect: 'manual',
        headers: options.headers
    }).catch((err)=>{
        if (timedOut) throw new __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$util$2f$errors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["JWKSTimeout"]();
        throw err;
    });
    if (id !== undefined) clearTimeout(id);
    if (response.status !== 200) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$util$2f$errors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["JOSEError"]('Expected 200 OK from the JSON Web Key Set HTTP response');
    }
    try {
        return await response.json();
    } catch (_a) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$util$2f$errors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["JOSEError"]('Failed to parse the JSON Web Key Set HTTP response as JSON');
    }
};
const __TURBOPACK__default__export__ = fetchJwks;
}),
"[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/jwks/remote.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "createRemoteJWKSet",
    ()=>createRemoteJWKSet
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$fetch_jwks$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/runtime/fetch_jwks.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$util$2f$errors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/util/errors.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$jwks$2f$local$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/jwks/local.js [app-client] (ecmascript)");
;
;
;
function isCloudflareWorkers() {
    return typeof WebSocketPair !== 'undefined' || typeof navigator !== 'undefined' && navigator.userAgent === 'Cloudflare-Workers' || typeof EdgeRuntime !== 'undefined' && EdgeRuntime === 'vercel';
}
class RemoteJWKSet extends __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$jwks$2f$local$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["LocalJWKSet"] {
    coolingDown() {
        return typeof this._jwksTimestamp === 'number' ? Date.now() < this._jwksTimestamp + this._cooldownDuration : false;
    }
    fresh() {
        return typeof this._jwksTimestamp === 'number' ? Date.now() < this._jwksTimestamp + this._cacheMaxAge : false;
    }
    async getKey(protectedHeader, token) {
        if (!this._jwks || !this.fresh()) {
            await this.reload();
        }
        try {
            return await super.getKey(protectedHeader, token);
        } catch (err) {
            if (err instanceof __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$util$2f$errors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["JWKSNoMatchingKey"]) {
                if (this.coolingDown() === false) {
                    await this.reload();
                    return super.getKey(protectedHeader, token);
                }
            }
            throw err;
        }
    }
    async reload() {
        if (this._pendingFetch && isCloudflareWorkers()) {
            this._pendingFetch = undefined;
        }
        this._pendingFetch || (this._pendingFetch = (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$fetch_jwks$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(this._url, this._timeoutDuration, this._options).then((json)=>{
            if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$jwks$2f$local$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isJWKSLike"])(json)) {
                throw new __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$util$2f$errors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["JWKSInvalid"]('JSON Web Key Set malformed');
            }
            this._jwks = {
                keys: json.keys
            };
            this._jwksTimestamp = Date.now();
            this._pendingFetch = undefined;
        }).catch((err)=>{
            this._pendingFetch = undefined;
            throw err;
        }));
        await this._pendingFetch;
    }
    constructor(url, options){
        super({
            keys: []
        });
        this._jwks = undefined;
        if (!(url instanceof URL)) {
            throw new TypeError('url must be an instance of URL');
        }
        this._url = new URL(url.href);
        this._options = {
            agent: options === null || options === void 0 ? void 0 : options.agent,
            headers: options === null || options === void 0 ? void 0 : options.headers
        };
        this._timeoutDuration = typeof (options === null || options === void 0 ? void 0 : options.timeoutDuration) === 'number' ? options === null || options === void 0 ? void 0 : options.timeoutDuration : 5000;
        this._cooldownDuration = typeof (options === null || options === void 0 ? void 0 : options.cooldownDuration) === 'number' ? options === null || options === void 0 ? void 0 : options.cooldownDuration : 30000;
        this._cacheMaxAge = typeof (options === null || options === void 0 ? void 0 : options.cacheMaxAge) === 'number' ? options === null || options === void 0 ? void 0 : options.cacheMaxAge : 600000;
    }
}
function createRemoteJWKSet(url, options) {
    const set = new RemoteJWKSet(url, options);
    return async function(protectedHeader, token) {
        return set.getKey(protectedHeader, token);
    };
}
}),
"[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/jwt/unsecured.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "UnsecuredJWT",
    ()=>UnsecuredJWT
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$base64url$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/runtime/base64url.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$lib$2f$buffer_utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/lib/buffer_utils.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$util$2f$errors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/util/errors.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$lib$2f$jwt_claims_set$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/lib/jwt_claims_set.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$jwt$2f$produce$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/jwt/produce.js [app-client] (ecmascript)");
;
;
;
;
;
class UnsecuredJWT extends __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$jwt$2f$produce$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ProduceJWT"] {
    encode() {
        const header = __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$base64url$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["encode"](JSON.stringify({
            alg: 'none'
        }));
        const payload = __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$base64url$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["encode"](JSON.stringify(this._payload));
        return "".concat(header, ".").concat(payload, ".");
    }
    static decode(jwt, options) {
        if (typeof jwt !== 'string') {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$util$2f$errors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["JWTInvalid"]('Unsecured JWT must be a string');
        }
        const { 0: encodedHeader, 1: encodedPayload, 2: signature, length } = jwt.split('.');
        if (length !== 3 || signature !== '') {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$util$2f$errors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["JWTInvalid"]('Invalid Unsecured JWT');
        }
        let header;
        try {
            header = JSON.parse(__TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$lib$2f$buffer_utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["decoder"].decode(__TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$base64url$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["decode"](encodedHeader)));
            if (header.alg !== 'none') throw new Error();
        } catch (_a) {
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$util$2f$errors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["JWTInvalid"]('Invalid Unsecured JWT');
        }
        const payload = (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$lib$2f$jwt_claims_set$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(header, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$base64url$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["decode"](encodedPayload), options);
        return {
            payload,
            header
        };
    }
}
}),
"[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/util/decode_protected_header.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "decodeProtectedHeader",
    ()=>decodeProtectedHeader
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$util$2f$base64url$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/util/base64url.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$lib$2f$buffer_utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/lib/buffer_utils.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$lib$2f$is_object$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/lib/is_object.js [app-client] (ecmascript)");
;
;
;
function decodeProtectedHeader(token) {
    let protectedB64u;
    if (typeof token === 'string') {
        const parts = token.split('.');
        if (parts.length === 3 || parts.length === 5) {
            ;
            [protectedB64u] = parts;
        }
    } else if (typeof token === 'object' && token) {
        if ('protected' in token) {
            protectedB64u = token.protected;
        } else {
            throw new TypeError('Token does not contain a Protected Header');
        }
    }
    try {
        if (typeof protectedB64u !== 'string' || !protectedB64u) {
            throw new Error();
        }
        const result = JSON.parse(__TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$lib$2f$buffer_utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["decoder"].decode((0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$util$2f$base64url$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["decode"])(protectedB64u)));
        if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$lib$2f$is_object$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(result)) {
            throw new Error();
        }
        return result;
    } catch (_a) {
        throw new TypeError('Invalid Token or Protected Header formatting');
    }
}
}),
"[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/util/decode_jwt.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "decodeJwt",
    ()=>decodeJwt
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$util$2f$base64url$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/util/base64url.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$lib$2f$buffer_utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/lib/buffer_utils.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$lib$2f$is_object$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/lib/is_object.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$util$2f$errors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/util/errors.js [app-client] (ecmascript)");
;
;
;
;
function decodeJwt(jwt) {
    if (typeof jwt !== 'string') throw new __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$util$2f$errors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["JWTInvalid"]('JWTs must use Compact JWS serialization, JWT must be a string');
    const { 1: payload, length } = jwt.split('.');
    if (length === 5) throw new __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$util$2f$errors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["JWTInvalid"]('Only JWTs using Compact JWS serialization can be decoded');
    if (length !== 3) throw new __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$util$2f$errors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["JWTInvalid"]('Invalid JWT');
    if (!payload) throw new __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$util$2f$errors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["JWTInvalid"]('JWTs must contain a payload');
    let decoded;
    try {
        decoded = (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$util$2f$base64url$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["decode"])(payload);
    } catch (_a) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$util$2f$errors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["JWTInvalid"]('Failed to base64url decode the payload');
    }
    let result;
    try {
        result = JSON.parse(__TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$lib$2f$buffer_utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["decoder"].decode(decoded));
    } catch (_b) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$util$2f$errors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["JWTInvalid"]('Failed to parse the decoded payload as JSON');
    }
    if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$lib$2f$is_object$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(result)) throw new __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$util$2f$errors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["JWTInvalid"]('Invalid JWT Claims Set');
    return result;
}
}),
"[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/runtime/generate.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "generateKeyPair",
    ()=>generateKeyPair,
    "generateSecret",
    ()=>generateSecret
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$webcrypto$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/runtime/webcrypto.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$util$2f$errors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/util/errors.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$random$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/runtime/random.js [app-client] (ecmascript)");
;
;
;
async function generateSecret(alg, options) {
    var _a;
    let length;
    let algorithm;
    let keyUsages;
    switch(alg){
        case 'HS256':
        case 'HS384':
        case 'HS512':
            length = parseInt(alg.slice(-3), 10);
            algorithm = {
                name: 'HMAC',
                hash: "SHA-".concat(length),
                length
            };
            keyUsages = [
                'sign',
                'verify'
            ];
            break;
        case 'A128CBC-HS256':
        case 'A192CBC-HS384':
        case 'A256CBC-HS512':
            length = parseInt(alg.slice(-3), 10);
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$random$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(new Uint8Array(length >> 3));
        case 'A128KW':
        case 'A192KW':
        case 'A256KW':
            length = parseInt(alg.slice(1, 4), 10);
            algorithm = {
                name: 'AES-KW',
                length
            };
            keyUsages = [
                'wrapKey',
                'unwrapKey'
            ];
            break;
        case 'A128GCMKW':
        case 'A192GCMKW':
        case 'A256GCMKW':
        case 'A128GCM':
        case 'A192GCM':
        case 'A256GCM':
            length = parseInt(alg.slice(1, 4), 10);
            algorithm = {
                name: 'AES-GCM',
                length
            };
            keyUsages = [
                'encrypt',
                'decrypt'
            ];
            break;
        default:
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$util$2f$errors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["JOSENotSupported"]('Invalid or unsupported JWK "alg" (Algorithm) Parameter value');
    }
    return __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$webcrypto$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].subtle.generateKey(algorithm, (_a = options === null || options === void 0 ? void 0 : options.extractable) !== null && _a !== void 0 ? _a : false, keyUsages);
}
function getModulusLengthOption(options) {
    var _a;
    const modulusLength = (_a = options === null || options === void 0 ? void 0 : options.modulusLength) !== null && _a !== void 0 ? _a : 2048;
    if (typeof modulusLength !== 'number' || modulusLength < 2048) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$util$2f$errors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["JOSENotSupported"]('Invalid or unsupported modulusLength option provided, 2048 bits or larger keys must be used');
    }
    return modulusLength;
}
async function generateKeyPair(alg, options) {
    var _a, _b, _c;
    let algorithm;
    let keyUsages;
    switch(alg){
        case 'PS256':
        case 'PS384':
        case 'PS512':
            algorithm = {
                name: 'RSA-PSS',
                hash: "SHA-".concat(alg.slice(-3)),
                publicExponent: new Uint8Array([
                    0x01,
                    0x00,
                    0x01
                ]),
                modulusLength: getModulusLengthOption(options)
            };
            keyUsages = [
                'sign',
                'verify'
            ];
            break;
        case 'RS256':
        case 'RS384':
        case 'RS512':
            algorithm = {
                name: 'RSASSA-PKCS1-v1_5',
                hash: "SHA-".concat(alg.slice(-3)),
                publicExponent: new Uint8Array([
                    0x01,
                    0x00,
                    0x01
                ]),
                modulusLength: getModulusLengthOption(options)
            };
            keyUsages = [
                'sign',
                'verify'
            ];
            break;
        case 'RSA-OAEP':
        case 'RSA-OAEP-256':
        case 'RSA-OAEP-384':
        case 'RSA-OAEP-512':
            algorithm = {
                name: 'RSA-OAEP',
                hash: "SHA-".concat(parseInt(alg.slice(-3), 10) || 1),
                publicExponent: new Uint8Array([
                    0x01,
                    0x00,
                    0x01
                ]),
                modulusLength: getModulusLengthOption(options)
            };
            keyUsages = [
                'decrypt',
                'unwrapKey',
                'encrypt',
                'wrapKey'
            ];
            break;
        case 'ES256':
            algorithm = {
                name: 'ECDSA',
                namedCurve: 'P-256'
            };
            keyUsages = [
                'sign',
                'verify'
            ];
            break;
        case 'ES384':
            algorithm = {
                name: 'ECDSA',
                namedCurve: 'P-384'
            };
            keyUsages = [
                'sign',
                'verify'
            ];
            break;
        case 'ES512':
            algorithm = {
                name: 'ECDSA',
                namedCurve: 'P-521'
            };
            keyUsages = [
                'sign',
                'verify'
            ];
            break;
        case 'EdDSA':
            keyUsages = [
                'sign',
                'verify'
            ];
            const crv = (_a = options === null || options === void 0 ? void 0 : options.crv) !== null && _a !== void 0 ? _a : 'Ed25519';
            switch(crv){
                case 'Ed25519':
                case 'Ed448':
                    algorithm = {
                        name: crv
                    };
                    break;
                default:
                    throw new __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$util$2f$errors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["JOSENotSupported"]('Invalid or unsupported crv option provided');
            }
            break;
        case 'ECDH-ES':
        case 'ECDH-ES+A128KW':
        case 'ECDH-ES+A192KW':
        case 'ECDH-ES+A256KW':
            {
                keyUsages = [
                    'deriveKey',
                    'deriveBits'
                ];
                const crv = (_b = options === null || options === void 0 ? void 0 : options.crv) !== null && _b !== void 0 ? _b : 'P-256';
                switch(crv){
                    case 'P-256':
                    case 'P-384':
                    case 'P-521':
                        {
                            algorithm = {
                                name: 'ECDH',
                                namedCurve: crv
                            };
                            break;
                        }
                    case 'X25519':
                    case 'X448':
                        algorithm = {
                            name: crv
                        };
                        break;
                    default:
                        throw new __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$util$2f$errors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["JOSENotSupported"]('Invalid or unsupported crv option provided, supported values are P-256, P-384, P-521, X25519, and X448');
                }
                break;
            }
        default:
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$util$2f$errors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["JOSENotSupported"]('Invalid or unsupported JWK "alg" (Algorithm) Parameter value');
    }
    return __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$webcrypto$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].subtle.generateKey(algorithm, (_c = options === null || options === void 0 ? void 0 : options.extractable) !== null && _c !== void 0 ? _c : false, keyUsages);
}
}),
"[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/key/generate_key_pair.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "generateKeyPair",
    ()=>generateKeyPair
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$generate$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/runtime/generate.js [app-client] (ecmascript)");
;
async function generateKeyPair(alg, options) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$generate$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["generateKeyPair"])(alg, options);
}
}),
"[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/key/generate_secret.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "generateSecret",
    ()=>generateSecret
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$generate$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/runtime/generate.js [app-client] (ecmascript)");
;
async function generateSecret(alg, options) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$generate$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["generateSecret"])(alg, options);
}
}),
"[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/runtime/runtime.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
const __TURBOPACK__default__export__ = 'WebCryptoAPI';
}),
"[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/util/runtime.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/runtime/runtime.js [app-client] (ecmascript)");
;
const __TURBOPACK__default__export__ = __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$runtime$2f$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"];
}),
"[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/index.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "CompactEncrypt",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$jwe$2f$compact$2f$encrypt$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CompactEncrypt"],
    "CompactSign",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$jws$2f$compact$2f$sign$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CompactSign"],
    "EmbeddedJWK",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$jwk$2f$embedded$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["EmbeddedJWK"],
    "EncryptJWT",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$jwt$2f$encrypt$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["EncryptJWT"],
    "FlattenedEncrypt",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$jwe$2f$flattened$2f$encrypt$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FlattenedEncrypt"],
    "FlattenedSign",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$jws$2f$flattened$2f$sign$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FlattenedSign"],
    "GeneralEncrypt",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$jwe$2f$general$2f$encrypt$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["GeneralEncrypt"],
    "GeneralSign",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$jws$2f$general$2f$sign$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["GeneralSign"],
    "SignJWT",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$jwt$2f$sign$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SignJWT"],
    "UnsecuredJWT",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$jwt$2f$unsecured$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["UnsecuredJWT"],
    "base64url",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$util$2f$base64url$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__,
    "calculateJwkThumbprint",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$jwk$2f$thumbprint$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["calculateJwkThumbprint"],
    "calculateJwkThumbprintUri",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$jwk$2f$thumbprint$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["calculateJwkThumbprintUri"],
    "compactDecrypt",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$jwe$2f$compact$2f$decrypt$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["compactDecrypt"],
    "compactVerify",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$jws$2f$compact$2f$verify$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["compactVerify"],
    "createLocalJWKSet",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$jwks$2f$local$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createLocalJWKSet"],
    "createRemoteJWKSet",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$jwks$2f$remote$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createRemoteJWKSet"],
    "cryptoRuntime",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$util$2f$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"],
    "decodeJwt",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$util$2f$decode_jwt$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["decodeJwt"],
    "decodeProtectedHeader",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$util$2f$decode_protected_header$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["decodeProtectedHeader"],
    "errors",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$util$2f$errors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__,
    "exportJWK",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$key$2f$export$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["exportJWK"],
    "exportPKCS8",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$key$2f$export$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["exportPKCS8"],
    "exportSPKI",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$key$2f$export$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["exportSPKI"],
    "flattenedDecrypt",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$jwe$2f$flattened$2f$decrypt$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["flattenedDecrypt"],
    "flattenedVerify",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$jws$2f$flattened$2f$verify$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["flattenedVerify"],
    "generalDecrypt",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$jwe$2f$general$2f$decrypt$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["generalDecrypt"],
    "generalVerify",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$jws$2f$general$2f$verify$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["generalVerify"],
    "generateKeyPair",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$key$2f$generate_key_pair$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["generateKeyPair"],
    "generateSecret",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$key$2f$generate_secret$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["generateSecret"],
    "importJWK",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$key$2f$import$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["importJWK"],
    "importPKCS8",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$key$2f$import$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["importPKCS8"],
    "importSPKI",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$key$2f$import$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["importSPKI"],
    "importX509",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$key$2f$import$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["importX509"],
    "jwtDecrypt",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$jwt$2f$decrypt$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jwtDecrypt"],
    "jwtVerify",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$jwt$2f$verify$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jwtVerify"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/index.js [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$jwe$2f$compact$2f$decrypt$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/jwe/compact/decrypt.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$jwe$2f$flattened$2f$decrypt$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/jwe/flattened/decrypt.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$jwe$2f$general$2f$decrypt$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/jwe/general/decrypt.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$jwe$2f$general$2f$encrypt$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/jwe/general/encrypt.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$jws$2f$compact$2f$verify$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/jws/compact/verify.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$jws$2f$flattened$2f$verify$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/jws/flattened/verify.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$jws$2f$general$2f$verify$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/jws/general/verify.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$jwt$2f$verify$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/jwt/verify.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$jwt$2f$decrypt$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/jwt/decrypt.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$jwe$2f$compact$2f$encrypt$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/jwe/compact/encrypt.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$jwe$2f$flattened$2f$encrypt$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/jwe/flattened/encrypt.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$jws$2f$compact$2f$sign$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/jws/compact/sign.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$jws$2f$flattened$2f$sign$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/jws/flattened/sign.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$jws$2f$general$2f$sign$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/jws/general/sign.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$jwt$2f$sign$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/jwt/sign.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$jwt$2f$encrypt$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/jwt/encrypt.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$jwk$2f$thumbprint$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/jwk/thumbprint.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$jwk$2f$embedded$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/jwk/embedded.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$jwks$2f$local$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/jwks/local.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$jwks$2f$remote$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/jwks/remote.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$jwt$2f$unsecured$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/jwt/unsecured.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$key$2f$export$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/key/export.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$key$2f$import$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/key/import.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$util$2f$decode_protected_header$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/util/decode_protected_header.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$util$2f$decode_jwt$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/util/decode_jwt.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$util$2f$errors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/util/errors.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$key$2f$generate_key_pair$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/key/generate_key_pair.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$key$2f$generate_secret$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/key/generate_secret.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$util$2f$base64url$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/util/base64url.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$jose$2f$dist$2f$browser$2f$util$2f$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/jose/dist/browser/util/runtime.js [app-client] (ecmascript)");
}),
]);

//# sourceMappingURL=fc185_jose_dist_browser_f6a9c5f7._.js.map