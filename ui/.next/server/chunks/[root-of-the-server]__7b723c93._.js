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
"[externals]/util [external] (util, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("util", () => require("util"));

module.exports = mod;
}),
"[externals]/stream [external] (stream, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("stream", () => require("stream"));

module.exports = mod;
}),
"[externals]/path [external] (path, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("path", () => require("path"));

module.exports = mod;
}),
"[externals]/http [external] (http, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("http", () => require("http"));

module.exports = mod;
}),
"[externals]/https [external] (https, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("https", () => require("https"));

module.exports = mod;
}),
"[externals]/url [external] (url, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("url", () => require("url"));

module.exports = mod;
}),
"[externals]/fs [external] (fs, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("fs", () => require("fs"));

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
"[externals]/tty [external] (tty, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("tty", () => require("tty"));

module.exports = mod;
}),
"[externals]/os [external] (os, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("os", () => require("os"));

module.exports = mod;
}),
"[externals]/zlib [external] (zlib, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("zlib", () => require("zlib"));

module.exports = mod;
}),
"[externals]/events [external] (events, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("events", () => require("events"));

module.exports = mod;
}),
"[project]/aptiverse-ui/src/lib/services/api-client.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// lib/services/api-client.ts
__turbopack_context__.s([
    "api",
    ()=>api,
    "apiClient",
    ()=>apiClient,
    "authApi",
    ()=>authApi,
    "authClient",
    ()=>authClient
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2d$ui$2f$node_modules$2f$axios$2f$lib$2f$axios$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse-ui/node_modules/axios/lib/axios.js [app-route] (ecmascript)");
;
const API_BASE_URL = ("TURBOPACK compile-time value", "https://localhost:44390/api") || (("TURBOPACK compile-time falsy", 0) ? "TURBOPACK unreachable" : 'https://localhost:44390/api');
const createApiClients = ()=>{
    let httpsAgent = undefined;
    // Always allow self-signed certificates in development
    if ("TURBOPACK compile-time truthy", 1) {
        try {
            const https = __turbopack_context__.r("[externals]/https [external] (https, cjs)");
            console.log('🔧 Creating HTTPS agent for development (self-signed certs allowed)');
            httpsAgent = new https.Agent({
                rejectUnauthorized: false,
                keepAlive: true,
                maxSockets: 50
            });
        } catch (error) {
            console.error('❌ Failed to create HTTPS agent:', error);
        }
    }
    const baseConfig = {
        baseURL: API_BASE_URL,
        headers: {
            'Content-Type': 'application/json'
        },
        timeout: 10000,
        ...httpsAgent && {
            httpsAgent
        }
    };
    console.log('🔧 API Client Config:', {
        baseURL: baseConfig.baseURL,
        hasHttpsAgent: !!httpsAgent,
        nodeEnv: ("TURBOPACK compile-time value", "development"),
        timeout: baseConfig.timeout
    });
    const authClient = __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2d$ui$2f$node_modules$2f$axios$2f$lib$2f$axios$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].create(baseConfig);
    const apiClient = __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2d$ui$2f$node_modules$2f$axios$2f$lib$2f$axios$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].create(baseConfig);
    // Add request logging
    authClient.interceptors.request.use((config)=>{
        console.log('📤 API Request:', {
            method: config.method?.toUpperCase(),
            url: config.url,
            baseURL: config.baseURL,
            hasHttpsAgent: !!config.httpsAgent
        });
        return config;
    }, (error)=>{
        console.error('❌ API Request Error:', error);
        return Promise.reject(error);
    });
    // Add response logging with more details
    authClient.interceptors.response.use((response)=>{
        console.log('✅ API Response Success:', {
            status: response.status,
            statusText: response.statusText,
            url: response.config.url,
            data: response.data ? 'Has data' : 'No data'
        });
        return response;
    }, (error)=>{
        console.error('❌ API Response Error:', {
            message: error.message,
            code: error.code,
            status: error.response?.status,
            statusText: error.response?.statusText,
            url: error.config?.url,
            baseURL: error.config?.baseURL,
            stack: error.stack
        });
        return Promise.reject(error);
    });
    return {
        authClient,
        apiClient
    };
};
const clients = createApiClients();
const authClient = clients.authClient;
const apiClient = clients.apiClient;
const getAuthToken = async ()=>{
    try {
        if ("TURBOPACK compile-time truthy", 1) {
            const { getServerSession } = await __turbopack_context__.A("[project]/aptiverse-ui/node_modules/next-auth/index.js [app-route] (ecmascript, async loader)");
            const session = await getServerSession();
            return session?.accessToken || null;
        } else //TURBOPACK unreachable
        ;
    } catch (error) {
        console.error('❌ Error getting auth token:', error);
        return null;
    }
};
apiClient.interceptors.request.use(async (config)=>{
    try {
        const token = await getAuthToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
            console.log('🔑 Added auth token to request');
        }
    } catch (error) {
        console.error('❌ Error adding auth token:', error);
    }
    return config;
}, (error)=>{
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
});
const authApi = {
    login: async (data)=>{
        console.log('🔐 authApi.login called with:', {
            email: data.email,
            passwordLength: data.password.length
        });
        try {
            const response = await authClient.post('/auth/login', data);
            console.log('✅ authApi.login successful:', {
                status: response.status,
                userId: response.data.user.id,
                userEmail: response.data.user.email
            });
            return response.data;
        } catch (error) {
            console.error('❌ authApi.login failed:', {
                message: error.message,
                status: error.response?.status,
                data: error.response?.data
            });
            throw error;
        }
    },
    register: async (data)=>{
        const response = await authClient.post('/auth/register', data);
        return response.data;
    }
};
const api = {
    get: (url)=>apiClient.get(url).then((response)=>response.data),
    post: (url, data)=>apiClient.post(url, data).then((response)=>response.data),
    put: (url, data)=>apiClient.put(url, data).then((response)=>response.data),
    delete: (url)=>apiClient.delete(url).then((response)=>response.data)
};
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
                        throw new Error('Authentication service timeout. Please try again.');
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
];

//# sourceMappingURL=%5Broot-of-the-server%5D__7b723c93._.js.map