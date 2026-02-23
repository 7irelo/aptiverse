(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/aptiverse/aptiverse-ui/node_modules/next/dist/server/web/spec-extension/cookies.js [app-client] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
0 && (module.exports = {
    RequestCookies: null,
    ResponseCookies: null,
    stringifyCookie: null
});
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    RequestCookies: function() {
        return _cookies.RequestCookies;
    },
    ResponseCookies: function() {
        return _cookies.ResponseCookies;
    },
    stringifyCookie: function() {
        return _cookies.stringifyCookie;
    }
});
const _cookies = __turbopack_context__.r("[project]/aptiverse/aptiverse-ui/node_modules/next/dist/compiled/@edge-runtime/cookies/index.js [app-client] (ecmascript)"); //# sourceMappingURL=cookies.js.map
}),
"[project]/aptiverse/aptiverse-ui/node_modules/next/dist/server/web/spec-extension/adapters/reflect.js [app-client] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "ReflectAdapter", {
    enumerable: true,
    get: function() {
        return ReflectAdapter;
    }
});
class ReflectAdapter {
    static get(target, prop, receiver) {
        const value = Reflect.get(target, prop, receiver);
        if (typeof value === 'function') {
            return value.bind(target);
        }
        return value;
    }
    static set(target, prop, value, receiver) {
        return Reflect.set(target, prop, value, receiver);
    }
    static has(target, prop) {
        return Reflect.has(target, prop);
    }
    static deleteProperty(target, prop) {
        return Reflect.deleteProperty(target, prop);
    }
} //# sourceMappingURL=reflect.js.map
}),
"[project]/aptiverse/aptiverse-ui/node_modules/next/dist/server/web/spec-extension/adapters/request-cookies.js [app-client] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
0 && (module.exports = {
    MutableRequestCookiesAdapter: null,
    ReadonlyRequestCookiesError: null,
    RequestCookiesAdapter: null,
    appendMutableCookies: null,
    areCookiesMutableInCurrentPhase: null,
    createCookiesWithMutableAccessCheck: null,
    getModifiedCookieValues: null,
    responseCookiesToRequestCookies: null
});
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    MutableRequestCookiesAdapter: function() {
        return MutableRequestCookiesAdapter;
    },
    ReadonlyRequestCookiesError: function() {
        return ReadonlyRequestCookiesError;
    },
    RequestCookiesAdapter: function() {
        return RequestCookiesAdapter;
    },
    appendMutableCookies: function() {
        return appendMutableCookies;
    },
    areCookiesMutableInCurrentPhase: function() {
        return areCookiesMutableInCurrentPhase;
    },
    createCookiesWithMutableAccessCheck: function() {
        return createCookiesWithMutableAccessCheck;
    },
    getModifiedCookieValues: function() {
        return getModifiedCookieValues;
    },
    responseCookiesToRequestCookies: function() {
        return responseCookiesToRequestCookies;
    }
});
const _cookies = __turbopack_context__.r("[project]/aptiverse/aptiverse-ui/node_modules/next/dist/server/web/spec-extension/cookies.js [app-client] (ecmascript)");
const _reflect = __turbopack_context__.r("[project]/aptiverse/aptiverse-ui/node_modules/next/dist/server/web/spec-extension/adapters/reflect.js [app-client] (ecmascript)");
const _workasyncstorageexternal = __turbopack_context__.r("[project]/aptiverse/aptiverse-ui/node_modules/next/dist/server/app-render/work-async-storage.external.js [app-client] (ecmascript)");
class ReadonlyRequestCookiesError extends Error {
    static callable() {
        throw new ReadonlyRequestCookiesError();
    }
    constructor(){
        super('Cookies can only be modified in a Server Action or Route Handler. Read more: https://nextjs.org/docs/app/api-reference/functions/cookies#options');
    }
}
class RequestCookiesAdapter {
    static seal(cookies) {
        return new Proxy(cookies, {
            get (target, prop, receiver) {
                switch(prop){
                    case 'clear':
                    case 'delete':
                    case 'set':
                        return ReadonlyRequestCookiesError.callable;
                    default:
                        return _reflect.ReflectAdapter.get(target, prop, receiver);
                }
            }
        });
    }
}
const SYMBOL_MODIFY_COOKIE_VALUES = Symbol.for('next.mutated.cookies');
function getModifiedCookieValues(cookies) {
    const modified = cookies[SYMBOL_MODIFY_COOKIE_VALUES];
    if (!modified || !Array.isArray(modified) || modified.length === 0) {
        return [];
    }
    return modified;
}
function appendMutableCookies(headers, mutableCookies) {
    const modifiedCookieValues = getModifiedCookieValues(mutableCookies);
    if (modifiedCookieValues.length === 0) {
        return false;
    }
    // Return a new response that extends the response with
    // the modified cookies as fallbacks. `res` cookies
    // will still take precedence.
    const resCookies = new _cookies.ResponseCookies(headers);
    const returnedCookies = resCookies.getAll();
    // Set the modified cookies as fallbacks.
    for (const cookie of modifiedCookieValues){
        resCookies.set(cookie);
    }
    // Set the original cookies as the final values.
    for (const cookie of returnedCookies){
        resCookies.set(cookie);
    }
    return true;
}
class MutableRequestCookiesAdapter {
    static wrap(cookies, onUpdateCookies) {
        const responseCookies = new _cookies.ResponseCookies(new Headers());
        for (const cookie of cookies.getAll()){
            responseCookies.set(cookie);
        }
        let modifiedValues = [];
        const modifiedCookies = new Set();
        const updateResponseCookies = ()=>{
            // TODO-APP: change method of getting workStore
            const workStore = _workasyncstorageexternal.workAsyncStorage.getStore();
            if (workStore) {
                workStore.pathWasRevalidated = true;
            }
            const allCookies = responseCookies.getAll();
            modifiedValues = allCookies.filter((c)=>modifiedCookies.has(c.name));
            if (onUpdateCookies) {
                const serializedCookies = [];
                for (const cookie of modifiedValues){
                    const tempCookies = new _cookies.ResponseCookies(new Headers());
                    tempCookies.set(cookie);
                    serializedCookies.push(tempCookies.toString());
                }
                onUpdateCookies(serializedCookies);
            }
        };
        const wrappedCookies = new Proxy(responseCookies, {
            get (target, prop, receiver) {
                switch(prop){
                    // A special symbol to get the modified cookie values
                    case SYMBOL_MODIFY_COOKIE_VALUES:
                        return modifiedValues;
                    // TODO: Throw error if trying to set a cookie after the response
                    // headers have been set.
                    case 'delete':
                        return function() {
                            for(var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++){
                                args[_key] = arguments[_key];
                            }
                            modifiedCookies.add(typeof args[0] === 'string' ? args[0] : args[0].name);
                            try {
                                target.delete(...args);
                                return wrappedCookies;
                            } finally{
                                updateResponseCookies();
                            }
                        };
                    case 'set':
                        return function() {
                            for(var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++){
                                args[_key] = arguments[_key];
                            }
                            modifiedCookies.add(typeof args[0] === 'string' ? args[0] : args[0].name);
                            try {
                                target.set(...args);
                                return wrappedCookies;
                            } finally{
                                updateResponseCookies();
                            }
                        };
                    default:
                        return _reflect.ReflectAdapter.get(target, prop, receiver);
                }
            }
        });
        return wrappedCookies;
    }
}
function createCookiesWithMutableAccessCheck(requestStore) {
    const wrappedCookies = new Proxy(requestStore.mutableCookies, {
        get (target, prop, receiver) {
            switch(prop){
                case 'delete':
                    return function() {
                        for(var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++){
                            args[_key] = arguments[_key];
                        }
                        ensureCookiesAreStillMutable(requestStore, 'cookies().delete');
                        target.delete(...args);
                        return wrappedCookies;
                    };
                case 'set':
                    return function() {
                        for(var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++){
                            args[_key] = arguments[_key];
                        }
                        ensureCookiesAreStillMutable(requestStore, 'cookies().set');
                        target.set(...args);
                        return wrappedCookies;
                    };
                default:
                    return _reflect.ReflectAdapter.get(target, prop, receiver);
            }
        }
    });
    return wrappedCookies;
}
function areCookiesMutableInCurrentPhase(requestStore) {
    return requestStore.phase === 'action';
}
/** Ensure that cookies() starts throwing on mutation
 * if we changed phases and can no longer mutate.
 *
 * This can happen when going:
 *   'render' -> 'after'
 *   'action' -> 'render'
 * */ function ensureCookiesAreStillMutable(requestStore, _callingExpression) {
    if (!areCookiesMutableInCurrentPhase(requestStore)) {
        // TODO: maybe we can give a more precise error message based on callingExpression?
        throw new ReadonlyRequestCookiesError();
    }
}
function responseCookiesToRequestCookies(responseCookies) {
    const requestCookies = new _cookies.RequestCookies(new Headers());
    for (const cookie of responseCookies.getAll()){
        requestCookies.set(cookie);
    }
    return requestCookies;
} //# sourceMappingURL=request-cookies.js.map
}),
"[project]/aptiverse/aptiverse-ui/node_modules/next/dist/server/create-deduped-by-callsite-server-error-logger.js [app-client] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "createDedupedByCallsiteServerErrorLoggerDev", {
    enumerable: true,
    get: function() {
        return createDedupedByCallsiteServerErrorLoggerDev;
    }
});
const _react = /*#__PURE__*/ _interop_require_wildcard(__turbopack_context__.r("[project]/aptiverse/aptiverse-ui/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)"));
function _getRequireWildcardCache(nodeInterop) {
    if (typeof WeakMap !== "function") return null;
    var cacheBabelInterop = new WeakMap();
    var cacheNodeInterop = new WeakMap();
    return (_getRequireWildcardCache = function(nodeInterop) {
        return nodeInterop ? cacheNodeInterop : cacheBabelInterop;
    })(nodeInterop);
}
function _interop_require_wildcard(obj, nodeInterop) {
    if (!nodeInterop && obj && obj.__esModule) {
        return obj;
    }
    if (obj === null || typeof obj !== "object" && typeof obj !== "function") {
        return {
            default: obj
        };
    }
    var cache = _getRequireWildcardCache(nodeInterop);
    if (cache && cache.has(obj)) {
        return cache.get(obj);
    }
    var newObj = {
        __proto__: null
    };
    var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor;
    for(var key in obj){
        if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) {
            var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null;
            if (desc && (desc.get || desc.set)) {
                Object.defineProperty(newObj, key, desc);
            } else {
                newObj[key] = obj[key];
            }
        }
    }
    newObj.default = obj;
    if (cache) {
        cache.set(obj, newObj);
    }
    return newObj;
}
const errorRef = {
    current: null
};
// React.cache is currently only available in canary/experimental React channels.
const cache = typeof _react.cache === 'function' ? _react.cache : (fn)=>fn;
// When Cache Components is enabled, we record these as errors so that they
// are captured by the dev overlay as it's more critical to fix these
// when enabled.
const logErrorOrWarn = ("TURBOPACK compile-time falsy", 0) ? "TURBOPACK unreachable" : console.warn;
// We don't want to dedupe across requests.
// The developer might've just attempted to fix the warning so we should warn again if it still happens.
const flushCurrentErrorIfNew = cache((key)=>{
    try {
        logErrorOrWarn(errorRef.current);
    } finally{
        errorRef.current = null;
    }
});
function createDedupedByCallsiteServerErrorLoggerDev(getMessage) {
    return function logDedupedError() {
        for(var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++){
            args[_key] = arguments[_key];
        }
        const message = getMessage(...args);
        if ("TURBOPACK compile-time truthy", 1) {
            var _stack;
            const callStackFrames = (_stack = new Error().stack) == null ? void 0 : _stack.split('\n');
            if (callStackFrames === undefined || callStackFrames.length < 4) {
                logErrorOrWarn(message);
            } else {
                // Error:
                //   logDedupedError
                //   asyncApiBeingAccessedSynchronously
                //   <userland callsite>
                // TODO: This breaks if sourcemaps with ignore lists are enabled.
                const key = callStackFrames[4];
                errorRef.current = message;
                flushCurrentErrorIfNew(key);
            }
        } else //TURBOPACK unreachable
        ;
    };
} //# sourceMappingURL=create-deduped-by-callsite-server-error-logger.js.map
}),
"[project]/aptiverse/aptiverse-ui/node_modules/next/dist/server/app-render/after-task-async-storage-instance.js [app-client] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "afterTaskAsyncStorageInstance", {
    enumerable: true,
    get: function() {
        return afterTaskAsyncStorageInstance;
    }
});
const _asynclocalstorage = __turbopack_context__.r("[project]/aptiverse/aptiverse-ui/node_modules/next/dist/server/app-render/async-local-storage.js [app-client] (ecmascript)");
const afterTaskAsyncStorageInstance = (0, _asynclocalstorage.createAsyncLocalStorage)(); //# sourceMappingURL=after-task-async-storage-instance.js.map
}),
"[project]/aptiverse/aptiverse-ui/node_modules/next/dist/server/app-render/after-task-async-storage.external.js [app-client] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "afterTaskAsyncStorage", {
    enumerable: true,
    get: function() {
        return _aftertaskasyncstorageinstance.afterTaskAsyncStorageInstance;
    }
});
const _aftertaskasyncstorageinstance = __turbopack_context__.r("[project]/aptiverse/aptiverse-ui/node_modules/next/dist/server/app-render/after-task-async-storage-instance.js [app-client] (ecmascript)"); //# sourceMappingURL=after-task-async-storage.external.js.map
}),
"[project]/aptiverse/aptiverse-ui/node_modules/next/dist/server/request/utils.js [app-client] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
0 && (module.exports = {
    isRequestAPICallableInsideAfter: null,
    throwForSearchParamsAccessInUseCache: null,
    throwWithStaticGenerationBailoutError: null,
    throwWithStaticGenerationBailoutErrorWithDynamicError: null
});
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    isRequestAPICallableInsideAfter: function() {
        return isRequestAPICallableInsideAfter;
    },
    throwForSearchParamsAccessInUseCache: function() {
        return throwForSearchParamsAccessInUseCache;
    },
    throwWithStaticGenerationBailoutError: function() {
        return throwWithStaticGenerationBailoutError;
    },
    throwWithStaticGenerationBailoutErrorWithDynamicError: function() {
        return throwWithStaticGenerationBailoutErrorWithDynamicError;
    }
});
const _staticgenerationbailout = __turbopack_context__.r("[project]/aptiverse/aptiverse-ui/node_modules/next/dist/client/components/static-generation-bailout.js [app-client] (ecmascript)");
const _aftertaskasyncstorageexternal = __turbopack_context__.r("[project]/aptiverse/aptiverse-ui/node_modules/next/dist/server/app-render/after-task-async-storage.external.js [app-client] (ecmascript)");
function throwWithStaticGenerationBailoutError(route, expression) {
    throw Object.defineProperty(new _staticgenerationbailout.StaticGenBailoutError("Route ".concat(route, " couldn't be rendered statically because it used ").concat(expression, ". See more info here: https://nextjs.org/docs/app/building-your-application/rendering/static-and-dynamic#dynamic-rendering")), "__NEXT_ERROR_CODE", {
        value: "E576",
        enumerable: false,
        configurable: true
    });
}
function throwWithStaticGenerationBailoutErrorWithDynamicError(route, expression) {
    throw Object.defineProperty(new _staticgenerationbailout.StaticGenBailoutError("Route ".concat(route, ' with `dynamic = "error"` couldn\'t be rendered statically because it used ').concat(expression, ". See more info here: https://nextjs.org/docs/app/building-your-application/rendering/static-and-dynamic#dynamic-rendering")), "__NEXT_ERROR_CODE", {
        value: "E543",
        enumerable: false,
        configurable: true
    });
}
function throwForSearchParamsAccessInUseCache(workStore, constructorOpt) {
    var _workStore;
    const error = Object.defineProperty(new Error("Route ".concat(workStore.route, ' used "searchParams" inside "use cache". Accessing dynamic request data inside a cache scope is not supported. If you need some search params inside a cached function await "searchParams" outside of the cached function and pass only the required search params as arguments to the cached function. See more info here: https://nextjs.org/docs/messages/next-request-in-use-cache')), "__NEXT_ERROR_CODE", {
        value: "E779",
        enumerable: false,
        configurable: true
    });
    Error.captureStackTrace(error, constructorOpt);
    var _invalidDynamicUsageError;
    (_invalidDynamicUsageError = (_workStore = workStore).invalidDynamicUsageError) !== null && _invalidDynamicUsageError !== void 0 ? _invalidDynamicUsageError : _workStore.invalidDynamicUsageError = error;
    throw error;
}
function isRequestAPICallableInsideAfter() {
    const afterTaskStore = _aftertaskasyncstorageexternal.afterTaskAsyncStorage.getStore();
    return (afterTaskStore == null ? void 0 : afterTaskStore.rootTaskSpawnPhase) === 'action';
} //# sourceMappingURL=utils.js.map
}),
"[project]/aptiverse/aptiverse-ui/node_modules/next/dist/server/request/cookies.js [app-client] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "cookies", {
    enumerable: true,
    get: function() {
        return cookies;
    }
});
const _requestcookies = __turbopack_context__.r("[project]/aptiverse/aptiverse-ui/node_modules/next/dist/server/web/spec-extension/adapters/request-cookies.js [app-client] (ecmascript)");
const _cookies = __turbopack_context__.r("[project]/aptiverse/aptiverse-ui/node_modules/next/dist/server/web/spec-extension/cookies.js [app-client] (ecmascript)");
const _workasyncstorageexternal = __turbopack_context__.r("[project]/aptiverse/aptiverse-ui/node_modules/next/dist/server/app-render/work-async-storage.external.js [app-client] (ecmascript)");
const _workunitasyncstorageexternal = __turbopack_context__.r("[project]/aptiverse/aptiverse-ui/node_modules/next/dist/server/app-render/work-unit-async-storage.external.js [app-client] (ecmascript)");
const _dynamicrendering = __turbopack_context__.r("[project]/aptiverse/aptiverse-ui/node_modules/next/dist/server/app-render/dynamic-rendering.js [app-client] (ecmascript)");
const _staticgenerationbailout = __turbopack_context__.r("[project]/aptiverse/aptiverse-ui/node_modules/next/dist/client/components/static-generation-bailout.js [app-client] (ecmascript)");
const _dynamicrenderingutils = __turbopack_context__.r("[project]/aptiverse/aptiverse-ui/node_modules/next/dist/server/dynamic-rendering-utils.js [app-client] (ecmascript)");
const _creatededupedbycallsiteservererrorlogger = __turbopack_context__.r("[project]/aptiverse/aptiverse-ui/node_modules/next/dist/server/create-deduped-by-callsite-server-error-logger.js [app-client] (ecmascript)");
const _utils = __turbopack_context__.r("[project]/aptiverse/aptiverse-ui/node_modules/next/dist/server/request/utils.js [app-client] (ecmascript)");
const _invarianterror = __turbopack_context__.r("[project]/aptiverse/aptiverse-ui/node_modules/next/dist/shared/lib/invariant-error.js [app-client] (ecmascript)");
const _reflect = __turbopack_context__.r("[project]/aptiverse/aptiverse-ui/node_modules/next/dist/server/web/spec-extension/adapters/reflect.js [app-client] (ecmascript)");
function cookies() {
    const callingExpression = 'cookies';
    const workStore = _workasyncstorageexternal.workAsyncStorage.getStore();
    const workUnitStore = _workunitasyncstorageexternal.workUnitAsyncStorage.getStore();
    if (workStore) {
        if (workUnitStore && workUnitStore.phase === 'after' && !(0, _utils.isRequestAPICallableInsideAfter)()) {
            throw Object.defineProperty(new Error("Route ".concat(workStore.route, ' used "cookies" inside "after(...)". This is not supported. If you need this data inside an "after" callback, use "cookies" outside of the callback. See more info here: https://nextjs.org/docs/canary/app/api-reference/functions/after')), "__NEXT_ERROR_CODE", {
                value: "E88",
                enumerable: false,
                configurable: true
            });
        }
        if (workStore.forceStatic) {
            // When using forceStatic we override all other logic and always just return an empty
            // cookies object without tracking
            const underlyingCookies = createEmptyCookies();
            return makeUntrackedExoticCookies(underlyingCookies);
        }
        if (workStore.dynamicShouldError) {
            throw Object.defineProperty(new _staticgenerationbailout.StaticGenBailoutError("Route ".concat(workStore.route, ' with `dynamic = "error"` couldn\'t be rendered statically because it used `cookies`. See more info here: https://nextjs.org/docs/app/building-your-application/rendering/static-and-dynamic#dynamic-rendering')), "__NEXT_ERROR_CODE", {
                value: "E549",
                enumerable: false,
                configurable: true
            });
        }
        if (workUnitStore) {
            switch(workUnitStore.type){
                case 'cache':
                    var _workStore;
                    const error = Object.defineProperty(new Error("Route ".concat(workStore.route, ' used "cookies" inside "use cache". Accessing Dynamic data sources inside a cache scope is not supported. If you need this data inside a cached function use "cookies" outside of the cached function and pass the required dynamic data in as an argument. See more info here: https://nextjs.org/docs/messages/next-request-in-use-cache')), "__NEXT_ERROR_CODE", {
                        value: "E398",
                        enumerable: false,
                        configurable: true
                    });
                    Error.captureStackTrace(error, cookies);
                    var _invalidDynamicUsageError;
                    (_invalidDynamicUsageError = (_workStore = workStore).invalidDynamicUsageError) !== null && _invalidDynamicUsageError !== void 0 ? _invalidDynamicUsageError : _workStore.invalidDynamicUsageError = error;
                    throw error;
                case 'unstable-cache':
                    throw Object.defineProperty(new Error("Route ".concat(workStore.route, ' used "cookies" inside a function cached with "unstable_cache(...)". Accessing Dynamic data sources inside a cache scope is not supported. If you need this data inside a cached function use "cookies" outside of the cached function and pass the required dynamic data in as an argument. See more info here: https://nextjs.org/docs/app/api-reference/functions/unstable_cache')), "__NEXT_ERROR_CODE", {
                        value: "E157",
                        enumerable: false,
                        configurable: true
                    });
                case 'prerender':
                    return makeHangingCookies(workStore, workUnitStore);
                case 'prerender-client':
                    const exportName = '`cookies`';
                    throw Object.defineProperty(new _invarianterror.InvariantError("".concat(exportName, " must not be used within a client component. Next.js should be preventing ").concat(exportName, " from being included in client components statically, but did not in this case.")), "__NEXT_ERROR_CODE", {
                        value: "E693",
                        enumerable: false,
                        configurable: true
                    });
                case 'prerender-ppr':
                    // We need track dynamic access here eagerly to keep continuity with
                    // how cookies has worked in PPR without cacheComponents.
                    return (0, _dynamicrendering.postponeWithTracking)(workStore.route, callingExpression, workUnitStore.dynamicTracking);
                case 'prerender-legacy':
                    // We track dynamic access here so we don't need to wrap the cookies
                    // in individual property access tracking.
                    return (0, _dynamicrendering.throwToInterruptStaticGeneration)(callingExpression, workStore, workUnitStore);
                case 'prerender-runtime':
                    return (0, _dynamicrendering.delayUntilRuntimeStage)(workUnitStore, makeUntrackedCookies(workUnitStore.cookies));
                case 'private-cache':
                    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
                    ;
                    return makeUntrackedExoticCookies(workUnitStore.cookies);
                case 'request':
                    (0, _dynamicrendering.trackDynamicDataInDynamicRender)(workUnitStore);
                    let underlyingCookies;
                    if ((0, _requestcookies.areCookiesMutableInCurrentPhase)(workUnitStore)) {
                        // We can't conditionally return different types here based on the context.
                        // To avoid confusion, we always return the readonly type here.
                        underlyingCookies = workUnitStore.userspaceMutableCookies;
                    } else {
                        underlyingCookies = workUnitStore.cookies;
                    }
                    if ("TURBOPACK compile-time truthy", 1) {
                        // Semantically we only need the dev tracking when running in `next dev`
                        // but since you would never use next dev with production NODE_ENV we use this
                        // as a proxy so we can statically exclude this code from production builds.
                        if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
                        ;
                        return makeUntrackedExoticCookiesWithDevWarnings(underlyingCookies, workStore == null ? void 0 : workStore.route);
                    } else //TURBOPACK unreachable
                    ;
                default:
                    workUnitStore;
            }
        }
    }
    // If we end up here, there was no work store or work unit store present.
    (0, _workunitasyncstorageexternal.throwForMissingRequestStore)(callingExpression);
}
function createEmptyCookies() {
    return _requestcookies.RequestCookiesAdapter.seal(new _cookies.RequestCookies(new Headers({})));
}
const CachedCookies = new WeakMap();
function makeHangingCookies(workStore, prerenderStore) {
    const cachedPromise = CachedCookies.get(prerenderStore);
    if (cachedPromise) {
        return cachedPromise;
    }
    const promise = (0, _dynamicrenderingutils.makeHangingPromise)(prerenderStore.renderSignal, workStore.route, '`cookies()`');
    CachedCookies.set(prerenderStore, promise);
    return promise;
}
function makeUntrackedCookies(underlyingCookies) {
    const cachedCookies = CachedCookies.get(underlyingCookies);
    if (cachedCookies) {
        return cachedCookies;
    }
    const promise = Promise.resolve(underlyingCookies);
    CachedCookies.set(underlyingCookies, promise);
    return promise;
}
function makeUntrackedExoticCookies(underlyingCookies) {
    const cachedCookies = CachedCookies.get(underlyingCookies);
    if (cachedCookies) {
        return cachedCookies;
    }
    const promise = Promise.resolve(underlyingCookies);
    CachedCookies.set(underlyingCookies, promise);
    Object.defineProperties(promise, {
        [Symbol.iterator]: {
            value: underlyingCookies[Symbol.iterator] ? underlyingCookies[Symbol.iterator].bind(underlyingCookies) : // but that's already a hard thing to debug so we may as well implement it consistently. The biggest problem with
            // implementing this in this way is the underlying cookie type is a ResponseCookie and not a RequestCookie and so it
            // has extra properties not available on RequestCookie instances.
            polyfilledResponseCookiesIterator.bind(underlyingCookies)
        },
        size: {
            get () {
                return underlyingCookies.size;
            }
        },
        get: {
            value: underlyingCookies.get.bind(underlyingCookies)
        },
        getAll: {
            value: underlyingCookies.getAll.bind(underlyingCookies)
        },
        has: {
            value: underlyingCookies.has.bind(underlyingCookies)
        },
        set: {
            value: underlyingCookies.set.bind(underlyingCookies)
        },
        delete: {
            value: underlyingCookies.delete.bind(underlyingCookies)
        },
        clear: {
            value: typeof underlyingCookies.clear === 'function' ? underlyingCookies.clear.bind(underlyingCookies) : // but that's already a hard thing to debug so we may as well implement it consistently. The biggest problem with
            // implementing this in this way is the underlying cookie type is a ResponseCookie and not a RequestCookie and so it
            // has extra properties not available on RequestCookie instances.
            polyfilledResponseCookiesClear.bind(underlyingCookies, promise)
        },
        toString: {
            value: underlyingCookies.toString.bind(underlyingCookies)
        }
    });
    return promise;
}
function makeUntrackedExoticCookiesWithDevWarnings(underlyingCookies, route) {
    const cachedCookies = CachedCookies.get(underlyingCookies);
    if (cachedCookies) {
        return cachedCookies;
    }
    const promise = (0, _dynamicrenderingutils.makeDevtoolsIOAwarePromise)(underlyingCookies);
    CachedCookies.set(underlyingCookies, promise);
    Object.defineProperties(promise, {
        [Symbol.iterator]: {
            value: function() {
                const expression = '`...cookies()` or similar iteration';
                syncIODev(route, expression);
                return underlyingCookies[Symbol.iterator] ? underlyingCookies[Symbol.iterator].apply(underlyingCookies, arguments) : // but that's already a hard thing to debug so we may as well implement it consistently. The biggest problem with
                // implementing this in this way is the underlying cookie type is a ResponseCookie and not a RequestCookie and so it
                // has extra properties not available on RequestCookie instances.
                polyfilledResponseCookiesIterator.call(underlyingCookies);
            },
            writable: false
        },
        size: {
            get () {
                const expression = '`cookies().size`';
                syncIODev(route, expression);
                return underlyingCookies.size;
            }
        },
        get: {
            value: function get() {
                let expression;
                if (arguments.length === 0) {
                    expression = '`cookies().get()`';
                } else {
                    expression = "`cookies().get(".concat(describeNameArg(arguments[0]), ")`");
                }
                syncIODev(route, expression);
                return underlyingCookies.get.apply(underlyingCookies, arguments);
            },
            writable: false
        },
        getAll: {
            value: function getAll() {
                let expression;
                if (arguments.length === 0) {
                    expression = '`cookies().getAll()`';
                } else {
                    expression = "`cookies().getAll(".concat(describeNameArg(arguments[0]), ")`");
                }
                syncIODev(route, expression);
                return underlyingCookies.getAll.apply(underlyingCookies, arguments);
            },
            writable: false
        },
        has: {
            value: function get() {
                let expression;
                if (arguments.length === 0) {
                    expression = '`cookies().has()`';
                } else {
                    expression = "`cookies().has(".concat(describeNameArg(arguments[0]), ")`");
                }
                syncIODev(route, expression);
                return underlyingCookies.has.apply(underlyingCookies, arguments);
            },
            writable: false
        },
        set: {
            value: function set() {
                let expression;
                if (arguments.length === 0) {
                    expression = '`cookies().set()`';
                } else {
                    const arg = arguments[0];
                    if (arg) {
                        expression = "`cookies().set(".concat(describeNameArg(arg), ", ...)`");
                    } else {
                        expression = '`cookies().set(...)`';
                    }
                }
                syncIODev(route, expression);
                return underlyingCookies.set.apply(underlyingCookies, arguments);
            },
            writable: false
        },
        delete: {
            value: function() {
                let expression;
                if (arguments.length === 0) {
                    expression = '`cookies().delete()`';
                } else if (arguments.length === 1) {
                    expression = "`cookies().delete(".concat(describeNameArg(arguments[0]), ")`");
                } else {
                    expression = "`cookies().delete(".concat(describeNameArg(arguments[0]), ", ...)`");
                }
                syncIODev(route, expression);
                return underlyingCookies.delete.apply(underlyingCookies, arguments);
            },
            writable: false
        },
        clear: {
            value: function clear() {
                const expression = '`cookies().clear()`';
                syncIODev(route, expression);
                // @ts-ignore clear is defined in RequestCookies implementation but not in the type
                return typeof underlyingCookies.clear === 'function' ? underlyingCookies.clear.apply(underlyingCookies, arguments) : // but that's already a hard thing to debug so we may as well implement it consistently. The biggest problem with
                // implementing this in this way is the underlying cookie type is a ResponseCookie and not a RequestCookie and so it
                // has extra properties not available on RequestCookie instances.
                polyfilledResponseCookiesClear.call(underlyingCookies, promise);
            },
            writable: false
        },
        toString: {
            value: function toString() {
                const expression = '`cookies().toString()` or implicit casting';
                syncIODev(route, expression);
                return underlyingCookies.toString.apply(underlyingCookies, arguments);
            },
            writable: false
        }
    });
    return promise;
}
// Similar to `makeUntrackedExoticCookiesWithDevWarnings`, but just logging the
// sync access without actually defining the cookies properties on the promise.
function makeUntrackedCookiesWithDevWarnings(underlyingCookies, route) {
    const cachedCookies = CachedCookies.get(underlyingCookies);
    if (cachedCookies) {
        return cachedCookies;
    }
    const promise = (0, _dynamicrenderingutils.makeDevtoolsIOAwarePromise)(underlyingCookies);
    const proxiedPromise = new Proxy(promise, {
        get (target, prop, receiver) {
            switch(prop){
                case Symbol.iterator:
                    {
                        warnForSyncAccess(route, '`...cookies()` or similar iteration');
                        break;
                    }
                case 'size':
                case 'get':
                case 'getAll':
                case 'has':
                case 'set':
                case 'delete':
                case 'clear':
                case 'toString':
                    {
                        warnForSyncAccess(route, "`cookies().".concat(prop, "`"));
                        break;
                    }
                default:
                    {
                    // We only warn for well-defined properties of the cookies object.
                    }
            }
            return _reflect.ReflectAdapter.get(target, prop, receiver);
        }
    });
    CachedCookies.set(underlyingCookies, proxiedPromise);
    return proxiedPromise;
}
function describeNameArg(arg) {
    return typeof arg === 'object' && arg !== null && typeof arg.name === 'string' ? "'".concat(arg.name, "'") : typeof arg === 'string' ? "'".concat(arg, "'") : '...';
}
function syncIODev(route, expression) {
    const workUnitStore = _workunitasyncstorageexternal.workUnitAsyncStorage.getStore();
    if (workUnitStore) {
        switch(workUnitStore.type){
            case 'request':
                if (workUnitStore.prerenderPhase === true) {
                    // When we're rendering dynamically in dev, we need to advance out of
                    // the Prerender environment when we read Request data synchronously.
                    (0, _dynamicrendering.trackSynchronousRequestDataAccessInDev)(workUnitStore);
                }
                break;
            case 'prerender':
            case 'prerender-client':
            case 'prerender-runtime':
            case 'prerender-ppr':
            case 'prerender-legacy':
            case 'cache':
            case 'private-cache':
            case 'unstable-cache':
                break;
            default:
                workUnitStore;
        }
    }
    // In all cases we warn normally
    warnForSyncAccess(route, expression);
}
const warnForSyncAccess = (0, _creatededupedbycallsiteservererrorlogger.createDedupedByCallsiteServerErrorLoggerDev)(createCookiesAccessError);
function createCookiesAccessError(route, expression) {
    const prefix = route ? 'Route "'.concat(route, '" ') : 'This route ';
    return Object.defineProperty(new Error("".concat(prefix, "used ").concat(expression, ". ") + "`cookies()` should be awaited before using its value. " + "Learn more: https://nextjs.org/docs/messages/sync-dynamic-apis"), "__NEXT_ERROR_CODE", {
        value: "E223",
        enumerable: false,
        configurable: true
    });
}
function polyfilledResponseCookiesIterator() {
    return this.getAll().map((c)=>[
            c.name,
            c
        ]).values();
}
function polyfilledResponseCookiesClear(returnable) {
    for (const cookie of this.getAll()){
        this.delete(cookie.name);
    }
    return returnable;
} //# sourceMappingURL=cookies.js.map
}),
"[project]/aptiverse/aptiverse-ui/node_modules/next/dist/server/web/spec-extension/adapters/headers.js [app-client] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
0 && (module.exports = {
    HeadersAdapter: null,
    ReadonlyHeadersError: null
});
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    HeadersAdapter: function() {
        return HeadersAdapter;
    },
    ReadonlyHeadersError: function() {
        return ReadonlyHeadersError;
    }
});
const _reflect = __turbopack_context__.r("[project]/aptiverse/aptiverse-ui/node_modules/next/dist/server/web/spec-extension/adapters/reflect.js [app-client] (ecmascript)");
class ReadonlyHeadersError extends Error {
    static callable() {
        throw new ReadonlyHeadersError();
    }
    constructor(){
        super('Headers cannot be modified. Read more: https://nextjs.org/docs/app/api-reference/functions/headers');
    }
}
class HeadersAdapter extends Headers {
    /**
   * Seals a Headers instance to prevent modification by throwing an error when
   * any mutating method is called.
   */ static seal(headers) {
        return new Proxy(headers, {
            get (target, prop, receiver) {
                switch(prop){
                    case 'append':
                    case 'delete':
                    case 'set':
                        return ReadonlyHeadersError.callable;
                    default:
                        return _reflect.ReflectAdapter.get(target, prop, receiver);
                }
            }
        });
    }
    /**
   * Merges a header value into a string. This stores multiple values as an
   * array, so we need to merge them into a string.
   *
   * @param value a header value
   * @returns a merged header value (a string)
   */ merge(value) {
        if (Array.isArray(value)) return value.join(', ');
        return value;
    }
    /**
   * Creates a Headers instance from a plain object or a Headers instance.
   *
   * @param headers a plain object or a Headers instance
   * @returns a headers instance
   */ static from(headers) {
        if (headers instanceof Headers) return headers;
        return new HeadersAdapter(headers);
    }
    append(name, value) {
        const existing = this.headers[name];
        if (typeof existing === 'string') {
            this.headers[name] = [
                existing,
                value
            ];
        } else if (Array.isArray(existing)) {
            existing.push(value);
        } else {
            this.headers[name] = value;
        }
    }
    delete(name) {
        delete this.headers[name];
    }
    get(name) {
        const value = this.headers[name];
        if (typeof value !== 'undefined') return this.merge(value);
        return null;
    }
    has(name) {
        return typeof this.headers[name] !== 'undefined';
    }
    set(name, value) {
        this.headers[name] = value;
    }
    forEach(callbackfn, thisArg) {
        for (const [name, value] of this.entries()){
            callbackfn.call(thisArg, value, name, this);
        }
    }
    *entries() {
        for (const key of Object.keys(this.headers)){
            const name = key.toLowerCase();
            // We assert here that this is a string because we got it from the
            // Object.keys() call above.
            const value = this.get(name);
            yield [
                name,
                value
            ];
        }
    }
    *keys() {
        for (const key of Object.keys(this.headers)){
            const name = key.toLowerCase();
            yield name;
        }
    }
    *values() {
        for (const key of Object.keys(this.headers)){
            // We assert here that this is a string because we got it from the
            // Object.keys() call above.
            const value = this.get(key);
            yield value;
        }
    }
    [Symbol.iterator]() {
        return this.entries();
    }
    constructor(headers){
        // We've already overridden the methods that would be called, so we're just
        // calling the super constructor to ensure that the instanceof check works.
        super();
        this.headers = new Proxy(headers, {
            get (target, prop, receiver) {
                // Because this is just an object, we expect that all "get" operations
                // are for properties. If it's a "get" for a symbol, we'll just return
                // the symbol.
                if (typeof prop === 'symbol') {
                    return _reflect.ReflectAdapter.get(target, prop, receiver);
                }
                const lowercased = prop.toLowerCase();
                // Let's find the original casing of the key. This assumes that there is
                // no mixed case keys (e.g. "Content-Type" and "content-type") in the
                // headers object.
                const original = Object.keys(headers).find((o)=>o.toLowerCase() === lowercased);
                // If the original casing doesn't exist, return undefined.
                if (typeof original === 'undefined') return;
                // If the original casing exists, return the value.
                return _reflect.ReflectAdapter.get(target, original, receiver);
            },
            set (target, prop, value, receiver) {
                if (typeof prop === 'symbol') {
                    return _reflect.ReflectAdapter.set(target, prop, value, receiver);
                }
                const lowercased = prop.toLowerCase();
                // Let's find the original casing of the key. This assumes that there is
                // no mixed case keys (e.g. "Content-Type" and "content-type") in the
                // headers object.
                const original = Object.keys(headers).find((o)=>o.toLowerCase() === lowercased);
                // If the original casing doesn't exist, use the prop as the key.
                return _reflect.ReflectAdapter.set(target, original !== null && original !== void 0 ? original : prop, value, receiver);
            },
            has (target, prop) {
                if (typeof prop === 'symbol') return _reflect.ReflectAdapter.has(target, prop);
                const lowercased = prop.toLowerCase();
                // Let's find the original casing of the key. This assumes that there is
                // no mixed case keys (e.g. "Content-Type" and "content-type") in the
                // headers object.
                const original = Object.keys(headers).find((o)=>o.toLowerCase() === lowercased);
                // If the original casing doesn't exist, return false.
                if (typeof original === 'undefined') return false;
                // If the original casing exists, return true.
                return _reflect.ReflectAdapter.has(target, original);
            },
            deleteProperty (target, prop) {
                if (typeof prop === 'symbol') return _reflect.ReflectAdapter.deleteProperty(target, prop);
                const lowercased = prop.toLowerCase();
                // Let's find the original casing of the key. This assumes that there is
                // no mixed case keys (e.g. "Content-Type" and "content-type") in the
                // headers object.
                const original = Object.keys(headers).find((o)=>o.toLowerCase() === lowercased);
                // If the original casing doesn't exist, return true.
                if (typeof original === 'undefined') return true;
                // If the original casing exists, delete the property.
                return _reflect.ReflectAdapter.deleteProperty(target, original);
            }
        });
    }
} //# sourceMappingURL=headers.js.map
}),
"[project]/aptiverse/aptiverse-ui/node_modules/next/dist/server/request/headers.js [app-client] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "headers", {
    enumerable: true,
    get: function() {
        return headers;
    }
});
const _headers = __turbopack_context__.r("[project]/aptiverse/aptiverse-ui/node_modules/next/dist/server/web/spec-extension/adapters/headers.js [app-client] (ecmascript)");
const _workasyncstorageexternal = __turbopack_context__.r("[project]/aptiverse/aptiverse-ui/node_modules/next/dist/server/app-render/work-async-storage.external.js [app-client] (ecmascript)");
const _workunitasyncstorageexternal = __turbopack_context__.r("[project]/aptiverse/aptiverse-ui/node_modules/next/dist/server/app-render/work-unit-async-storage.external.js [app-client] (ecmascript)");
const _dynamicrendering = __turbopack_context__.r("[project]/aptiverse/aptiverse-ui/node_modules/next/dist/server/app-render/dynamic-rendering.js [app-client] (ecmascript)");
const _staticgenerationbailout = __turbopack_context__.r("[project]/aptiverse/aptiverse-ui/node_modules/next/dist/client/components/static-generation-bailout.js [app-client] (ecmascript)");
const _dynamicrenderingutils = __turbopack_context__.r("[project]/aptiverse/aptiverse-ui/node_modules/next/dist/server/dynamic-rendering-utils.js [app-client] (ecmascript)");
const _creatededupedbycallsiteservererrorlogger = __turbopack_context__.r("[project]/aptiverse/aptiverse-ui/node_modules/next/dist/server/create-deduped-by-callsite-server-error-logger.js [app-client] (ecmascript)");
const _utils = __turbopack_context__.r("[project]/aptiverse/aptiverse-ui/node_modules/next/dist/server/request/utils.js [app-client] (ecmascript)");
const _invarianterror = __turbopack_context__.r("[project]/aptiverse/aptiverse-ui/node_modules/next/dist/shared/lib/invariant-error.js [app-client] (ecmascript)");
const _reflect = __turbopack_context__.r("[project]/aptiverse/aptiverse-ui/node_modules/next/dist/server/web/spec-extension/adapters/reflect.js [app-client] (ecmascript)");
function headers() {
    const callingExpression = 'headers';
    const workStore = _workasyncstorageexternal.workAsyncStorage.getStore();
    const workUnitStore = _workunitasyncstorageexternal.workUnitAsyncStorage.getStore();
    if (workStore) {
        if (workUnitStore && workUnitStore.phase === 'after' && !(0, _utils.isRequestAPICallableInsideAfter)()) {
            throw Object.defineProperty(new Error("Route ".concat(workStore.route, ' used "headers" inside "after(...)". This is not supported. If you need this data inside an "after" callback, use "headers" outside of the callback. See more info here: https://nextjs.org/docs/canary/app/api-reference/functions/after')), "__NEXT_ERROR_CODE", {
                value: "E367",
                enumerable: false,
                configurable: true
            });
        }
        if (workStore.forceStatic) {
            // When using forceStatic we override all other logic and always just return an empty
            // headers object without tracking
            const underlyingHeaders = _headers.HeadersAdapter.seal(new Headers({}));
            return makeUntrackedExoticHeaders(underlyingHeaders);
        }
        if (workUnitStore) {
            switch(workUnitStore.type){
                case 'cache':
                    {
                        var _workStore;
                        const error = Object.defineProperty(new Error("Route ".concat(workStore.route, ' used "headers" inside "use cache". Accessing Dynamic data sources inside a cache scope is not supported. If you need this data inside a cached function use "headers" outside of the cached function and pass the required dynamic data in as an argument. See more info here: https://nextjs.org/docs/messages/next-request-in-use-cache')), "__NEXT_ERROR_CODE", {
                            value: "E304",
                            enumerable: false,
                            configurable: true
                        });
                        Error.captureStackTrace(error, headers);
                        var _invalidDynamicUsageError;
                        (_invalidDynamicUsageError = (_workStore = workStore).invalidDynamicUsageError) !== null && _invalidDynamicUsageError !== void 0 ? _invalidDynamicUsageError : _workStore.invalidDynamicUsageError = error;
                        throw error;
                    }
                case 'private-cache':
                    {
                        var _workStore1;
                        const error = Object.defineProperty(new Error("Route ".concat(workStore.route, ' used "headers" inside "use cache: private". Accessing "headers" inside a private cache scope is not supported. If you need this data inside a cached function use "headers" outside of the cached function and pass the required dynamic data in as an argument. See more info here: https://nextjs.org/docs/messages/next-request-in-use-cache')), "__NEXT_ERROR_CODE", {
                            value: "E742",
                            enumerable: false,
                            configurable: true
                        });
                        Error.captureStackTrace(error, headers);
                        var _invalidDynamicUsageError1;
                        (_invalidDynamicUsageError1 = (_workStore1 = workStore).invalidDynamicUsageError) !== null && _invalidDynamicUsageError1 !== void 0 ? _invalidDynamicUsageError1 : _workStore1.invalidDynamicUsageError = error;
                        throw error;
                    }
                case 'unstable-cache':
                    throw Object.defineProperty(new Error("Route ".concat(workStore.route, ' used "headers" inside a function cached with "unstable_cache(...)". Accessing Dynamic data sources inside a cache scope is not supported. If you need this data inside a cached function use "headers" outside of the cached function and pass the required dynamic data in as an argument. See more info here: https://nextjs.org/docs/app/api-reference/functions/unstable_cache')), "__NEXT_ERROR_CODE", {
                        value: "E127",
                        enumerable: false,
                        configurable: true
                    });
                case 'prerender':
                case 'prerender-client':
                case 'prerender-runtime':
                case 'prerender-ppr':
                case 'prerender-legacy':
                case 'request':
                    break;
                default:
                    workUnitStore;
            }
        }
        if (workStore.dynamicShouldError) {
            throw Object.defineProperty(new _staticgenerationbailout.StaticGenBailoutError("Route ".concat(workStore.route, ' with `dynamic = "error"` couldn\'t be rendered statically because it used `headers`. See more info here: https://nextjs.org/docs/app/building-your-application/rendering/static-and-dynamic#dynamic-rendering')), "__NEXT_ERROR_CODE", {
                value: "E525",
                enumerable: false,
                configurable: true
            });
        }
        if (workUnitStore) {
            switch(workUnitStore.type){
                case 'prerender':
                case 'prerender-runtime':
                    return makeHangingHeaders(workStore, workUnitStore);
                case 'prerender-client':
                    const exportName = '`headers`';
                    throw Object.defineProperty(new _invarianterror.InvariantError("".concat(exportName, " must not be used within a client component. Next.js should be preventing ").concat(exportName, " from being included in client components statically, but did not in this case.")), "__NEXT_ERROR_CODE", {
                        value: "E693",
                        enumerable: false,
                        configurable: true
                    });
                case 'prerender-ppr':
                    // PPR Prerender (no cacheComponents)
                    // We are prerendering with PPR. We need track dynamic access here eagerly
                    // to keep continuity with how headers has worked in PPR without cacheComponents.
                    // TODO consider switching the semantic to throw on property access instead
                    return (0, _dynamicrendering.postponeWithTracking)(workStore.route, callingExpression, workUnitStore.dynamicTracking);
                case 'prerender-legacy':
                    // Legacy Prerender
                    // We are in a legacy static generation mode while prerendering
                    // We track dynamic access here so we don't need to wrap the headers in
                    // individual property access tracking.
                    return (0, _dynamicrendering.throwToInterruptStaticGeneration)(callingExpression, workStore, workUnitStore);
                case 'request':
                    (0, _dynamicrendering.trackDynamicDataInDynamicRender)(workUnitStore);
                    if ("TURBOPACK compile-time truthy", 1) {
                        // Semantically we only need the dev tracking when running in `next dev`
                        // but since you would never use next dev with production NODE_ENV we use this
                        // as a proxy so we can statically exclude this code from production builds.
                        if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
                        ;
                        return makeUntrackedExoticHeadersWithDevWarnings(workUnitStore.headers, workStore == null ? void 0 : workStore.route);
                    } else //TURBOPACK unreachable
                    ;
                    //TURBOPACK unreachable
                    ;
                default:
                    workUnitStore;
            }
        }
    }
    // If we end up here, there was no work store or work unit store present.
    (0, _workunitasyncstorageexternal.throwForMissingRequestStore)(callingExpression);
}
const CachedHeaders = new WeakMap();
function makeHangingHeaders(workStore, prerenderStore) {
    const cachedHeaders = CachedHeaders.get(prerenderStore);
    if (cachedHeaders) {
        return cachedHeaders;
    }
    const promise = (0, _dynamicrenderingutils.makeHangingPromise)(prerenderStore.renderSignal, workStore.route, '`headers()`');
    CachedHeaders.set(prerenderStore, promise);
    return promise;
}
function makeUntrackedHeaders(underlyingHeaders) {
    const cachedHeaders = CachedHeaders.get(underlyingHeaders);
    if (cachedHeaders) {
        return cachedHeaders;
    }
    const promise = Promise.resolve(underlyingHeaders);
    CachedHeaders.set(underlyingHeaders, promise);
    return promise;
}
function makeUntrackedExoticHeaders(underlyingHeaders) {
    const cachedHeaders = CachedHeaders.get(underlyingHeaders);
    if (cachedHeaders) {
        return cachedHeaders;
    }
    const promise = Promise.resolve(underlyingHeaders);
    CachedHeaders.set(underlyingHeaders, promise);
    Object.defineProperties(promise, {
        append: {
            value: underlyingHeaders.append.bind(underlyingHeaders)
        },
        delete: {
            value: underlyingHeaders.delete.bind(underlyingHeaders)
        },
        get: {
            value: underlyingHeaders.get.bind(underlyingHeaders)
        },
        has: {
            value: underlyingHeaders.has.bind(underlyingHeaders)
        },
        set: {
            value: underlyingHeaders.set.bind(underlyingHeaders)
        },
        getSetCookie: {
            value: underlyingHeaders.getSetCookie.bind(underlyingHeaders)
        },
        forEach: {
            value: underlyingHeaders.forEach.bind(underlyingHeaders)
        },
        keys: {
            value: underlyingHeaders.keys.bind(underlyingHeaders)
        },
        values: {
            value: underlyingHeaders.values.bind(underlyingHeaders)
        },
        entries: {
            value: underlyingHeaders.entries.bind(underlyingHeaders)
        },
        [Symbol.iterator]: {
            value: underlyingHeaders[Symbol.iterator].bind(underlyingHeaders)
        }
    });
    return promise;
}
function makeUntrackedExoticHeadersWithDevWarnings(underlyingHeaders, route) {
    const cachedHeaders = CachedHeaders.get(underlyingHeaders);
    if (cachedHeaders) {
        return cachedHeaders;
    }
    const promise = (0, _dynamicrenderingutils.makeDevtoolsIOAwarePromise)(underlyingHeaders);
    CachedHeaders.set(underlyingHeaders, promise);
    Object.defineProperties(promise, {
        append: {
            value: function append() {
                const expression = "`headers().append(".concat(describeNameArg(arguments[0]), ", ...)`");
                syncIODev(route, expression);
                return underlyingHeaders.append.apply(underlyingHeaders, arguments);
            }
        },
        delete: {
            value: function _delete() {
                const expression = "`headers().delete(".concat(describeNameArg(arguments[0]), ")`");
                syncIODev(route, expression);
                return underlyingHeaders.delete.apply(underlyingHeaders, arguments);
            }
        },
        get: {
            value: function get() {
                const expression = "`headers().get(".concat(describeNameArg(arguments[0]), ")`");
                syncIODev(route, expression);
                return underlyingHeaders.get.apply(underlyingHeaders, arguments);
            }
        },
        has: {
            value: function has() {
                const expression = "`headers().has(".concat(describeNameArg(arguments[0]), ")`");
                syncIODev(route, expression);
                return underlyingHeaders.has.apply(underlyingHeaders, arguments);
            }
        },
        set: {
            value: function set() {
                const expression = "`headers().set(".concat(describeNameArg(arguments[0]), ", ...)`");
                syncIODev(route, expression);
                return underlyingHeaders.set.apply(underlyingHeaders, arguments);
            }
        },
        getSetCookie: {
            value: function getSetCookie() {
                const expression = '`headers().getSetCookie()`';
                syncIODev(route, expression);
                return underlyingHeaders.getSetCookie.apply(underlyingHeaders, arguments);
            }
        },
        forEach: {
            value: function forEach() {
                const expression = '`headers().forEach(...)`';
                syncIODev(route, expression);
                return underlyingHeaders.forEach.apply(underlyingHeaders, arguments);
            }
        },
        keys: {
            value: function keys() {
                const expression = '`headers().keys()`';
                syncIODev(route, expression);
                return underlyingHeaders.keys.apply(underlyingHeaders, arguments);
            }
        },
        values: {
            value: function values() {
                const expression = '`headers().values()`';
                syncIODev(route, expression);
                return underlyingHeaders.values.apply(underlyingHeaders, arguments);
            }
        },
        entries: {
            value: function entries() {
                const expression = '`headers().entries()`';
                syncIODev(route, expression);
                return underlyingHeaders.entries.apply(underlyingHeaders, arguments);
            }
        },
        [Symbol.iterator]: {
            value: function() {
                const expression = '`...headers()` or similar iteration';
                syncIODev(route, expression);
                return underlyingHeaders[Symbol.iterator].apply(underlyingHeaders, arguments);
            }
        }
    });
    return promise;
}
// Similar to `makeUntrackedExoticHeadersWithDevWarnings`, but just logging the
// sync access without actually defining the headers properties on the promise.
function makeUntrackedHeadersWithDevWarnings(underlyingHeaders, route) {
    const cachedHeaders = CachedHeaders.get(underlyingHeaders);
    if (cachedHeaders) {
        return cachedHeaders;
    }
    const promise = (0, _dynamicrenderingutils.makeDevtoolsIOAwarePromise)(underlyingHeaders);
    const proxiedPromise = new Proxy(promise, {
        get (target, prop, receiver) {
            switch(prop){
                case Symbol.iterator:
                    {
                        warnForSyncAccess(route, '`...headers()` or similar iteration');
                        break;
                    }
                case 'append':
                case 'delete':
                case 'get':
                case 'has':
                case 'set':
                case 'getSetCookie':
                case 'forEach':
                case 'keys':
                case 'values':
                case 'entries':
                    {
                        warnForSyncAccess(route, "`headers().".concat(prop, "`"));
                        break;
                    }
                default:
                    {
                    // We only warn for well-defined properties of the headers object.
                    }
            }
            return _reflect.ReflectAdapter.get(target, prop, receiver);
        }
    });
    CachedHeaders.set(underlyingHeaders, proxiedPromise);
    return proxiedPromise;
}
function describeNameArg(arg) {
    return typeof arg === 'string' ? "'".concat(arg, "'") : '...';
}
function syncIODev(route, expression) {
    const workUnitStore = _workunitasyncstorageexternal.workUnitAsyncStorage.getStore();
    if (workUnitStore) {
        switch(workUnitStore.type){
            case 'request':
                if (workUnitStore.prerenderPhase === true) {
                    // When we're rendering dynamically in dev, we need to advance out of
                    // the Prerender environment when we read Request data synchronously.
                    (0, _dynamicrendering.trackSynchronousRequestDataAccessInDev)(workUnitStore);
                }
                break;
            case 'prerender':
            case 'prerender-client':
            case 'prerender-runtime':
            case 'prerender-ppr':
            case 'prerender-legacy':
            case 'cache':
            case 'private-cache':
            case 'unstable-cache':
                break;
            default:
                workUnitStore;
        }
    }
    // In all cases we warn normally
    warnForSyncAccess(route, expression);
}
const warnForSyncAccess = (0, _creatededupedbycallsiteservererrorlogger.createDedupedByCallsiteServerErrorLoggerDev)(createHeadersAccessError);
function createHeadersAccessError(route, expression) {
    const prefix = route ? 'Route "'.concat(route, '" ') : 'This route ';
    return Object.defineProperty(new Error("".concat(prefix, "used ").concat(expression, ". ") + "`headers()` should be awaited before using its value. " + "Learn more: https://nextjs.org/docs/messages/sync-dynamic-apis"), "__NEXT_ERROR_CODE", {
        value: "E277",
        enumerable: false,
        configurable: true
    });
} //# sourceMappingURL=headers.js.map
}),
"[project]/aptiverse/aptiverse-ui/node_modules/next/dist/server/request/draft-mode.js [app-client] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "draftMode", {
    enumerable: true,
    get: function() {
        return draftMode;
    }
});
const _workunitasyncstorageexternal = __turbopack_context__.r("[project]/aptiverse/aptiverse-ui/node_modules/next/dist/server/app-render/work-unit-async-storage.external.js [app-client] (ecmascript)");
const _workasyncstorageexternal = __turbopack_context__.r("[project]/aptiverse/aptiverse-ui/node_modules/next/dist/server/app-render/work-async-storage.external.js [app-client] (ecmascript)");
const _dynamicrendering = __turbopack_context__.r("[project]/aptiverse/aptiverse-ui/node_modules/next/dist/server/app-render/dynamic-rendering.js [app-client] (ecmascript)");
const _creatededupedbycallsiteservererrorlogger = __turbopack_context__.r("[project]/aptiverse/aptiverse-ui/node_modules/next/dist/server/create-deduped-by-callsite-server-error-logger.js [app-client] (ecmascript)");
const _staticgenerationbailout = __turbopack_context__.r("[project]/aptiverse/aptiverse-ui/node_modules/next/dist/client/components/static-generation-bailout.js [app-client] (ecmascript)");
const _hooksservercontext = __turbopack_context__.r("[project]/aptiverse/aptiverse-ui/node_modules/next/dist/client/components/hooks-server-context.js [app-client] (ecmascript)");
const _invarianterror = __turbopack_context__.r("[project]/aptiverse/aptiverse-ui/node_modules/next/dist/shared/lib/invariant-error.js [app-client] (ecmascript)");
const _reflect = __turbopack_context__.r("[project]/aptiverse/aptiverse-ui/node_modules/next/dist/server/web/spec-extension/adapters/reflect.js [app-client] (ecmascript)");
function draftMode() {
    const callingExpression = 'draftMode';
    const workStore = _workasyncstorageexternal.workAsyncStorage.getStore();
    const workUnitStore = _workunitasyncstorageexternal.workUnitAsyncStorage.getStore();
    if (!workStore || !workUnitStore) {
        (0, _workunitasyncstorageexternal.throwForMissingRequestStore)(callingExpression);
    }
    switch(workUnitStore.type){
        case 'prerender-runtime':
            // TODO(runtime-ppr): does it make sense to delay this? normally it's always microtasky
            return (0, _dynamicrendering.delayUntilRuntimeStage)(workUnitStore, createOrGetCachedDraftMode(workUnitStore.draftMode, workStore));
        case 'request':
            return createOrGetCachedDraftMode(workUnitStore.draftMode, workStore);
        case 'cache':
        case 'private-cache':
        case 'unstable-cache':
            // Inside of `"use cache"` or `unstable_cache`, draft mode is available if
            // the outmost work unit store is a request store (or a runtime prerender),
            // and if draft mode is enabled.
            const draftModeProvider = (0, _workunitasyncstorageexternal.getDraftModeProviderForCacheScope)(workStore, workUnitStore);
            if (draftModeProvider) {
                return createOrGetCachedDraftMode(draftModeProvider, workStore);
            }
        // Otherwise, we fall through to providing an empty draft mode.
        // eslint-disable-next-line no-fallthrough
        case 'prerender':
        case 'prerender-client':
        case 'prerender-ppr':
        case 'prerender-legacy':
            // Return empty draft mode
            return createOrGetCachedDraftMode(null, workStore);
        default:
            return workUnitStore;
    }
}
function createOrGetCachedDraftMode(draftModeProvider, workStore) {
    const cacheKey = draftModeProvider !== null && draftModeProvider !== void 0 ? draftModeProvider : NullDraftMode;
    const cachedDraftMode = CachedDraftModes.get(cacheKey);
    if (cachedDraftMode) {
        return cachedDraftMode;
    }
    let promise;
    if (("TURBOPACK compile-time value", "development") === 'development' && !(workStore == null ? void 0 : workStore.isPrefetchRequest)) {
        const route = workStore == null ? void 0 : workStore.route;
        if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
        ;
        promise = createExoticDraftModeWithDevWarnings(draftModeProvider, route);
    } else {
        if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
        ;
        promise = createExoticDraftMode(draftModeProvider);
    }
    CachedDraftModes.set(cacheKey, promise);
    return promise;
}
const NullDraftMode = {};
const CachedDraftModes = new WeakMap();
function createExoticDraftMode(underlyingProvider) {
    const instance = new DraftMode(underlyingProvider);
    const promise = Promise.resolve(instance);
    Object.defineProperty(promise, 'isEnabled', {
        get () {
            return instance.isEnabled;
        },
        enumerable: true,
        configurable: true
    });
    promise.enable = instance.enable.bind(instance);
    promise.disable = instance.disable.bind(instance);
    return promise;
}
function createExoticDraftModeWithDevWarnings(underlyingProvider, route) {
    const instance = new DraftMode(underlyingProvider);
    const promise = Promise.resolve(instance);
    Object.defineProperty(promise, 'isEnabled', {
        get () {
            const expression = '`draftMode().isEnabled`';
            syncIODev(route, expression);
            return instance.isEnabled;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(promise, 'enable', {
        value: function get() {
            const expression = '`draftMode().enable()`';
            syncIODev(route, expression);
            return instance.enable.apply(instance, arguments);
        }
    });
    Object.defineProperty(promise, 'disable', {
        value: function get() {
            const expression = '`draftMode().disable()`';
            syncIODev(route, expression);
            return instance.disable.apply(instance, arguments);
        }
    });
    return promise;
}
// Similar to `createExoticDraftModeWithDevWarnings`, but just logging the sync
// access without actually defining the draftMode properties on the promise.
function createDraftModeWithDevWarnings(underlyingProvider, route) {
    const instance = new DraftMode(underlyingProvider);
    const promise = Promise.resolve(instance);
    const proxiedPromise = new Proxy(promise, {
        get (target, prop, receiver) {
            switch(prop){
                case 'isEnabled':
                    warnForSyncAccess(route, "`draftMode().".concat(prop, "`"));
                    break;
                case 'enable':
                case 'disable':
                    {
                        warnForSyncAccess(route, "`draftMode().".concat(prop, "()`"));
                        break;
                    }
                default:
                    {
                    // We only warn for well-defined properties of the draftMode object.
                    }
            }
            return _reflect.ReflectAdapter.get(target, prop, receiver);
        }
    });
    return proxiedPromise;
}
class DraftMode {
    get isEnabled() {
        if (this._provider !== null) {
            return this._provider.isEnabled;
        }
        return false;
    }
    enable() {
        // We have a store we want to track dynamic data access to ensure we
        // don't statically generate routes that manipulate draft mode.
        trackDynamicDraftMode('draftMode().enable()', this.enable);
        if (this._provider !== null) {
            this._provider.enable();
        }
    }
    disable() {
        trackDynamicDraftMode('draftMode().disable()', this.disable);
        if (this._provider !== null) {
            this._provider.disable();
        }
    }
    constructor(provider){
        this._provider = provider;
    }
}
function syncIODev(route, expression) {
    const workUnitStore = _workunitasyncstorageexternal.workUnitAsyncStorage.getStore();
    if (workUnitStore) {
        switch(workUnitStore.type){
            case 'request':
                if (workUnitStore.prerenderPhase === true) {
                    // When we're rendering dynamically in dev, we need to advance out of
                    // the Prerender environment when we read Request data synchronously.
                    (0, _dynamicrendering.trackSynchronousRequestDataAccessInDev)(workUnitStore);
                }
                break;
            case 'prerender':
            case 'prerender-client':
            case 'prerender-runtime':
            case 'prerender-ppr':
            case 'prerender-legacy':
            case 'cache':
            case 'private-cache':
            case 'unstable-cache':
                break;
            default:
                workUnitStore;
        }
    }
    // In all cases we warn normally
    warnForSyncAccess(route, expression);
}
const warnForSyncAccess = (0, _creatededupedbycallsiteservererrorlogger.createDedupedByCallsiteServerErrorLoggerDev)(createDraftModeAccessError);
function createDraftModeAccessError(route, expression) {
    const prefix = route ? 'Route "'.concat(route, '" ') : 'This route ';
    return Object.defineProperty(new Error("".concat(prefix, "used ").concat(expression, ". ") + "`draftMode()` should be awaited before using its value. " + "Learn more: https://nextjs.org/docs/messages/sync-dynamic-apis"), "__NEXT_ERROR_CODE", {
        value: "E377",
        enumerable: false,
        configurable: true
    });
}
function trackDynamicDraftMode(expression, constructorOpt) {
    const workStore = _workasyncstorageexternal.workAsyncStorage.getStore();
    const workUnitStore = _workunitasyncstorageexternal.workUnitAsyncStorage.getStore();
    if (workStore) {
        // We have a store we want to track dynamic data access to ensure we
        // don't statically generate routes that manipulate draft mode.
        if ((workUnitStore == null ? void 0 : workUnitStore.phase) === 'after') {
            throw Object.defineProperty(new Error("Route ".concat(workStore.route, ' used "').concat(expression, '" inside `after`. The enabled status of draftMode can be read inside `after` but you cannot enable or disable draftMode. See more info here: https://nextjs.org/docs/app/api-reference/functions/after')), "__NEXT_ERROR_CODE", {
                value: "E348",
                enumerable: false,
                configurable: true
            });
        }
        if (workStore.dynamicShouldError) {
            throw Object.defineProperty(new _staticgenerationbailout.StaticGenBailoutError("Route ".concat(workStore.route, ' with `dynamic = "error"` couldn\'t be rendered statically because it used `').concat(expression, "`. See more info here: https://nextjs.org/docs/app/building-your-application/rendering/static-and-dynamic#dynamic-rendering")), "__NEXT_ERROR_CODE", {
                value: "E553",
                enumerable: false,
                configurable: true
            });
        }
        if (workUnitStore) {
            switch(workUnitStore.type){
                case 'cache':
                case 'private-cache':
                    {
                        var _workStore;
                        const error = Object.defineProperty(new Error("Route ".concat(workStore.route, ' used "').concat(expression, '" inside "use cache". The enabled status of draftMode can be read in caches but you must not enable or disable draftMode inside a cache. See more info here: https://nextjs.org/docs/messages/next-request-in-use-cache')), "__NEXT_ERROR_CODE", {
                            value: "E246",
                            enumerable: false,
                            configurable: true
                        });
                        Error.captureStackTrace(error, constructorOpt);
                        var _invalidDynamicUsageError;
                        (_invalidDynamicUsageError = (_workStore = workStore).invalidDynamicUsageError) !== null && _invalidDynamicUsageError !== void 0 ? _invalidDynamicUsageError : _workStore.invalidDynamicUsageError = error;
                        throw error;
                    }
                case 'unstable-cache':
                    throw Object.defineProperty(new Error("Route ".concat(workStore.route, ' used "').concat(expression, '" inside a function cached with "unstable_cache(...)". The enabled status of draftMode can be read in caches but you must not enable or disable draftMode inside a cache. See more info here: https://nextjs.org/docs/app/api-reference/functions/unstable_cache')), "__NEXT_ERROR_CODE", {
                        value: "E259",
                        enumerable: false,
                        configurable: true
                    });
                case 'prerender':
                case 'prerender-runtime':
                    {
                        const error = Object.defineProperty(new Error("Route ".concat(workStore.route, " used ").concat(expression, " without first calling `await connection()`. See more info here: https://nextjs.org/docs/messages/next-prerender-sync-headers")), "__NEXT_ERROR_CODE", {
                            value: "E126",
                            enumerable: false,
                            configurable: true
                        });
                        return (0, _dynamicrendering.abortAndThrowOnSynchronousRequestDataAccess)(workStore.route, expression, error, workUnitStore);
                    }
                case 'prerender-client':
                    const exportName = '`draftMode`';
                    throw Object.defineProperty(new _invarianterror.InvariantError("".concat(exportName, " must not be used within a client component. Next.js should be preventing ").concat(exportName, " from being included in client components statically, but did not in this case.")), "__NEXT_ERROR_CODE", {
                        value: "E693",
                        enumerable: false,
                        configurable: true
                    });
                case 'prerender-ppr':
                    return (0, _dynamicrendering.postponeWithTracking)(workStore.route, expression, workUnitStore.dynamicTracking);
                case 'prerender-legacy':
                    workUnitStore.revalidate = 0;
                    const err = Object.defineProperty(new _hooksservercontext.DynamicServerError("Route ".concat(workStore.route, " couldn't be rendered statically because it used `").concat(expression, "`. See more info here: https://nextjs.org/docs/messages/dynamic-server-error")), "__NEXT_ERROR_CODE", {
                        value: "E558",
                        enumerable: false,
                        configurable: true
                    });
                    workStore.dynamicUsageDescription = expression;
                    workStore.dynamicUsageStack = err.stack;
                    throw err;
                case 'request':
                    (0, _dynamicrendering.trackDynamicDataInDynamicRender)(workUnitStore);
                    break;
                default:
                    workUnitStore;
            }
        }
    }
} //# sourceMappingURL=draft-mode.js.map
}),
]);

//# sourceMappingURL=fc185_next_dist_server_51e2cadd._.js.map