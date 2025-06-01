module.exports = [
"[project]/aptiverse-ui/.next-internal/server/app/api/auth/[...nextauth]/route/actions.js [app-rsc] (server actions loader, ecmascript)", ((__turbopack_context__, module, exports) => {

}),
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[project]/aptiverse-ui/src/lib/services/api-client.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>handler,
    "POST",
    ()=>handler
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2d$ui$2f$src$2f$lib$2f$services$2f$api$2d$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse-ui/src/lib/services/api-client.ts [app-route] (ecmascript)");
(()=>{
    const e = new Error("Cannot find module 'nextauth'");
    e.code = 'MODULE_NOT_FOUND';
    throw e;
})();
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2d$ui$2f$node_modules$2f$next$2d$auth$2f$providers$2f$credentials$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse-ui/node_modules/next-auth/providers/credentials.js [app-route] (ecmascript)");
;
;
;
const handler = NextAuth({
    secret: process.env.NEXTAUTH_SECRET,
    providers: [
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2d$ui$2f$node_modules$2f$next$2d$auth$2f$providers$2f$credentials$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"])({
            name: 'credentials',
            credentials: {
                email: {
                    label: 'Email',
                    type: 'email'
                },
                password: {
                    label: 'Password',
                    type: 'password'
                }
            },
            async authorize (credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error('Email and password are required');
                }
                try {
                    const data = await __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2d$ui$2f$src$2f$lib$2f$services$2f$api$2d$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["authApi"].login({
                        email: credentials.email,
                        password: credentials.password
                    });
                    if (data.token) {
                        return {
                            id: data.user.id,
                            email: data.user.email,
                            name: `${data.user.firstName} ${data.user.lastName}`,
                            firstName: data.user.firstName,
                            lastName: data.user.lastName,
                            userType: data.user.userType,
                            accessToken: data.token
                        };
                    }
                    return null;
                } catch (error) {
                    if (error.response?.status === 401) {
                        throw new Error('Invalid email or password');
                    } else if (error.response?.status === 400) {
                        throw new Error(error.response?.data?.message || 'Invalid request');
                    } else if (error.response?.status >= 500) {
                        throw new Error('Authentication service is temporarily unavailable');
                    } else if (error.code === 'ECONNABORTED') {
                        throw new Error('Connection timeout. Please try again.');
                    } else {
                        throw new Error('Authentication failed. Please try again.');
                    }
                }
            }
        })
    ],
    callbacks: {
        async jwt ({ token, user }) {
            if (user) {
                token.accessToken = user.accessToken;
                token.user = {
                    id: user.id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    userName: user.userName,
                    email: user.email,
                    userType: user.userType
                };
            }
            return token;
        },
        async session ({ session, token }) {
            session.accessToken = token.accessToken;
            session.user = token.user;
            return session;
        }
    },
    pages: {
        signIn: '/login',
        error: '/login'
    },
    session: {
        strategy: 'jwt',
        maxAge: 30 * 24 * 60 * 60
    },
    debug: ("TURBOPACK compile-time value", "development") === 'development'
});
;
}),
"[externals]/util [external] (util, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("util", () => require("util"));

module.exports = mod;
}),
"[externals]/url [external] (url, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("url", () => require("url"));

module.exports = mod;
}),
"[externals]/http [external] (http, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("http", () => require("http"));

module.exports = mod;
}),
"[externals]/crypto [external] (crypto, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("crypto", () => require("crypto"));

module.exports = mod;
}),
"[externals]/assert [external] (assert, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("assert", () => require("assert"));

module.exports = mod;
}),
"[externals]/querystring [external] (querystring, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("querystring", () => require("querystring"));

module.exports = mod;
}),
"[externals]/buffer [external] (buffer, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("buffer", () => require("buffer"));

module.exports = mod;
}),
"[externals]/zlib [external] (zlib, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("zlib", () => require("zlib"));

module.exports = mod;
}),
"[externals]/https [external] (https, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("https", () => require("https"));

module.exports = mod;
}),
"[externals]/events [external] (events, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("events", () => require("events"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[project]/aptiverse-ui/src/app/api/auth/[...nextauth]/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>handler,
    "POST",
    ()=>handler
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2d$ui$2f$src$2f$lib$2f$services$2f$api$2d$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse-ui/src/lib/services/api-client.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2d$ui$2f$node_modules$2f$next$2d$auth$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse-ui/node_modules/next-auth/index.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2d$ui$2f$node_modules$2f$next$2d$auth$2f$providers$2f$credentials$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse-ui/node_modules/next-auth/providers/credentials.js [app-route] (ecmascript)");
;
;
;
const handler = (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2d$ui$2f$node_modules$2f$next$2d$auth$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"])({
    secret: process.env.NEXTAUTH_SECRET,
    providers: [
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2d$ui$2f$node_modules$2f$next$2d$auth$2f$providers$2f$credentials$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"])({
            name: 'credentials',
            credentials: {
                email: {
                    label: 'Email',
                    type: 'email'
                },
                password: {
                    label: 'Password',
                    type: 'password'
                }
            },
            async authorize (credentials) {
                console.log('🔐 NextAuth authorize called with:', {
                    email: credentials?.email,
                    hasPassword: !!credentials?.password
                });
                try {
                    console.log('📡 Calling backend API:', `${("TURBOPACK compile-time value", "https://localhost:44390/api")}/auth/login`);
                    const data = await __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2d$ui$2f$src$2f$lib$2f$services$2f$api$2d$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["authApi"].login({
                        email: credentials?.email || '',
                        password: credentials?.password || ''
                    });
                    console.log('✅ Backend response:', {
                        userId: data.user.id,
                        email: data.user.email,
                        hasToken: !!data.token
                    });
                    if (data.token) {
                        const user = {
                            id: data.user.id,
                            email: data.user.email,
                            name: `${data.user.firstName} ${data.user.lastName}`,
                            firstName: data.user.firstName,
                            lastName: data.user.lastName,
                            userType: data.user.userType,
                            accessToken: data.token
                        };
                        console.log('👤 User object created:', user);
                        return user;
                    }
                    console.log('❌ No token in response');
                    return null;
                } catch (error) {
                    console.error('🚨 Auth error:', {
                        message: error.message,
                        status: error.response?.status,
                        data: error.response?.data,
                        stack: error.stack
                    });
                    if (error.response?.status === 401) {
                        throw new Error('Invalid email or password');
                    } else if (error.response?.status === 400) {
                        throw new Error(error.response?.data?.message || 'Invalid request');
                    } else if (error.response?.status >= 500) {
                        throw new Error('Authentication service is temporarily unavailable');
                    } else {
                        throw new Error('Authentication failed. Please try again.');
                    }
                }
            }
        })
    ],
    callbacks: {
        async jwt ({ token, user }) {
            console.log('🪙 JWT callback:', {
                tokenSub: token.sub,
                userEmail: user?.email
            });
            if (user) {
                token.accessToken = user.accessToken;
                token.user = {
                    id: user.id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    userName: user.userName,
                    email: user.email,
                    userType: user.userType
                };
            }
            return token;
        },
        async session ({ session, token }) {
            console.log('💼 Session callback:', {
                sessionUser: session.user?.email,
                tokenUser: token.user?.email
            });
            session.accessToken = token.accessToken;
            session.user = token.user;
            return session;
        }
    },
    pages: {
        signIn: '/login',
        error: '/login'
    },
    session: {
        strategy: 'jwt',
        maxAge: 30 * 24 * 60 * 60
    },
    debug: ("TURBOPACK compile-time value", "development") === 'development'
});
;
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__b00e98a3._.js.map