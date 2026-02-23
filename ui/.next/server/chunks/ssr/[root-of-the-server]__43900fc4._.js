module.exports = [
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
"[project]/aptiverse/aptiverse-ui/src/lib/hooks/useApiClient.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useApiClient",
    ()=>useApiClient
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$axios$2f$lib$2f$axios$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/axios/lib/axios.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$next$2d$auth$2f$react$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/next-auth/react/index.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
'use client';
;
;
;
const API_BASE_URL = ("TURBOPACK compile-time value", "http://localhost:5196/api") || "http://localhost:5196/api";
function useApiClient() {
    const { data: session } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$next$2d$auth$2f$react$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useSession"])();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        const client = __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$axios$2f$lib$2f$axios$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].create({
            baseURL: API_BASE_URL,
            headers: {
                'Content-Type': 'application/json'
            },
            timeout: 10000
        });
        client.interceptors.request.use((config)=>{
            if (session?.accessToken) {
                config.headers.Authorization = `Bearer ${session.accessToken}`;
            }
            return config;
        }, (error)=>Promise.reject(error));
        return client;
    }, [
        session?.accessToken
    ]);
}
}),
"[project]/aptiverse/aptiverse-ui/src/lib/hooks/useStudentData.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useStudentData",
    ()=>useStudentData
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$src$2f$lib$2f$hooks$2f$useApiClient$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/src/lib/hooks/useApiClient.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
'use client';
;
;
function useStudentData(studentId) {
    const [student, setStudent] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [isLoading, setIsLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(true);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const apiClient = (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$src$2f$lib$2f$hooks$2f$useApiClient$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useApiClient"])();
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const fetchStudent = async ()=>{
            try {
                setIsLoading(true);
                const id = studentId || 4;
                const response = await apiClient.get(`/students/${id}`);
                setStudent(response.data);
                setError(null);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to fetch student data');
                console.error('Error fetching student:', err);
            } finally{
                setIsLoading(false);
            }
        };
        fetchStudent();
    }, [
        studentId,
        apiClient
    ]);
    return {
        student,
        isLoading,
        error
    };
}
}),
"[project]/aptiverse/aptiverse-ui/src/app/(dashboard)/subjects/constants.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "subjectsData",
    ()=>subjectsData
]);
const subjectsData = [
    {
        id: 'mathematics',
        name: 'Mathematics',
        code: 'MAT',
        description: 'Algebra, Calculus, Geometry and Mathematical Literacy',
        progress: 75,
        target: 80,
        averageScore: 72,
        studyHours: 18,
        assignmentsCompleted: 12,
        upcomingDeadlines: 2,
        strength: 'Algebra',
        weakness: 'Calculus',
        lastActivity: '2 days ago',
        color: 'bg-blue-500',
        textColor: 'text-blue-600',
        borderColor: 'border-blue-200'
    },
    {
        id: 'physical-sciences',
        name: 'Physical Sciences',
        code: 'PSC',
        description: 'Physics and Chemistry fundamentals',
        progress: 68,
        target: 75,
        averageScore: 65,
        studyHours: 15,
        assignmentsCompleted: 8,
        upcomingDeadlines: 3,
        strength: 'Chemistry',
        weakness: 'Physics',
        lastActivity: '1 day ago',
        color: 'bg-purple-500',
        textColor: 'text-purple-600',
        borderColor: 'border-purple-200'
    },
    {
        id: 'life-sciences',
        name: 'Life Sciences',
        code: 'LSC',
        description: 'Biology, Ecology and Human Anatomy',
        progress: 82,
        target: 78,
        averageScore: 79,
        studyHours: 12,
        assignmentsCompleted: 10,
        upcomingDeadlines: 1,
        strength: 'Human Biology',
        weakness: 'Ecology',
        lastActivity: '3 days ago',
        color: 'bg-green-500',
        textColor: 'text-green-600',
        borderColor: 'border-green-200'
    },
    {
        id: 'english',
        name: 'English Home Language',
        code: 'ENG',
        description: 'Language, Literature and Communication',
        progress: 88,
        target: 85,
        averageScore: 84,
        studyHours: 10,
        assignmentsCompleted: 15,
        upcomingDeadlines: 0,
        strength: 'Literature',
        weakness: 'Creative Writing',
        lastActivity: 'Today',
        color: 'bg-red-500',
        textColor: 'text-red-600',
        borderColor: 'border-red-200'
    },
    {
        id: 'afrikaans',
        name: 'Afrikaans FAL',
        code: 'AFR',
        description: 'First Additional Language - Reading and Writing',
        progress: 65,
        target: 70,
        averageScore: 62,
        studyHours: 8,
        assignmentsCompleted: 6,
        upcomingDeadlines: 2,
        strength: 'Reading',
        weakness: 'Writing',
        lastActivity: '4 days ago',
        color: 'bg-orange-500',
        textColor: 'text-orange-600',
        borderColor: 'border-orange-200'
    },
    {
        id: 'geography',
        name: 'Geography',
        code: 'GEO',
        description: 'Physical and Human Geography',
        progress: 72,
        target: 75,
        averageScore: 70,
        studyHours: 9,
        assignmentsCompleted: 7,
        upcomingDeadlines: 1,
        strength: 'Map Work',
        weakness: 'Climate Studies',
        lastActivity: '2 days ago',
        color: 'bg-cyan-500',
        textColor: 'text-cyan-600',
        borderColor: 'border-cyan-200'
    },
    {
        id: 'accounting',
        name: 'Accounting',
        code: 'ACC',
        description: 'Financial Accounting and Business Principles',
        progress: 79,
        target: 82,
        averageScore: 76,
        studyHours: 14,
        assignmentsCompleted: 9,
        upcomingDeadlines: 2,
        strength: 'Financial Statements',
        weakness: 'Cost Accounting',
        lastActivity: 'Yesterday',
        color: 'bg-indigo-500',
        textColor: 'text-indigo-600',
        borderColor: 'border-indigo-200'
    },
    {
        id: 'business-studies',
        name: 'Business Studies',
        code: 'BUS',
        description: 'Business Management and Entrepreneurship',
        progress: 85,
        target: 80,
        averageScore: 82,
        studyHours: 11,
        assignmentsCompleted: 11,
        upcomingDeadlines: 1,
        strength: 'Business Management',
        weakness: 'Entrepreneurship',
        lastActivity: 'Today',
        color: 'bg-emerald-500',
        textColor: 'text-emerald-600',
        borderColor: 'border-emerald-200'
    }
];
}),
"[project]/aptiverse/aptiverse-ui/src/app/(dashboard)/subjects/page.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$src$2f$lib$2f$hooks$2f$useStudentData$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/src/lib/hooks/useStudentData.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$book$2d$open$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__BookOpen$3e$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/lucide-react/dist/esm/icons/book-open.js [app-ssr] (ecmascript) <export default as BookOpen>");
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$right$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronRight$3e$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/lucide-react/dist/esm/icons/chevron-right.js [app-ssr] (ecmascript) <export default as ChevronRight>");
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$square$2d$pen$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Edit$3e$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/lucide-react/dist/esm/icons/square-pen.js [app-ssr] (ecmascript) <export default as Edit>");
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$ellipsis$2d$vertical$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__MoreVertical$3e$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/lucide-react/dist/esm/icons/ellipsis-vertical.js [app-ssr] (ecmascript) <export default as MoreVertical>");
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$plus$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Plus$3e$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/lucide-react/dist/esm/icons/plus.js [app-ssr] (ecmascript) <export default as Plus>");
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$search$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Search$3e$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/lucide-react/dist/esm/icons/search.js [app-ssr] (ecmascript) <export default as Search>");
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trash$2d$2$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Trash2$3e$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/lucide-react/dist/esm/icons/trash-2.js [app-ssr] (ecmascript) <export default as Trash2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/next/dist/client/app-dir/link.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$src$2f$app$2f28$dashboard$292f$subjects$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/src/app/(dashboard)/subjects/constants.ts [app-ssr] (ecmascript)");
"use client";
;
;
;
;
;
;
const Subjects = ()=>{
    const [openDropdown, setOpenDropdown] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [searchTerm, setSearchTerm] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('');
    const [isCreateModalOpen, setIsCreateModalOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const dropdownRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const { student } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$src$2f$lib$2f$hooks$2f$useStudentData$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useStudentData"])(4);
    const filteredSubjects = __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$src$2f$app$2f28$dashboard$292f$subjects$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["subjectsData"].filter((subject)=>subject.name.toLowerCase().includes(searchTerm.toLowerCase()) || subject.code.toLowerCase().includes(searchTerm.toLowerCase()));
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const handleClickOutside = (event)=>{
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setOpenDropdown(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return ()=>document.removeEventListener('mousedown', handleClickOutside);
    }, []);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "min-h-screen bg-gray-50 py-4 px-4 sm:px-6 lg:px-8",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "max-w-7xl mx-auto",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "mb-6",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                                className: "text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight",
                                                children: "Academic Subjects"
                                            }, void 0, false, {
                                                fileName: "[project]/aptiverse/aptiverse-ui/src/app/(dashboard)/subjects/page.tsx",
                                                lineNumber: 39,
                                                columnNumber: 15
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "mt-1 sm:mt-2 text-sm text-gray-600",
                                                children: "National Senior Certificate Curriculum"
                                            }, void 0, false, {
                                                fileName: "[project]/aptiverse/aptiverse-ui/src/app/(dashboard)/subjects/page.tsx",
                                                lineNumber: 40,
                                                columnNumber: 15
                                            }, ("TURBOPACK compile-time value", void 0))
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/aptiverse/aptiverse-ui/src/app/(dashboard)/subjects/page.tsx",
                                        lineNumber: 38,
                                        columnNumber: 13
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: ()=>setIsCreateModalOpen(true),
                                        className: "inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 w-full sm:w-auto",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$plus$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Plus$3e$__["Plus"], {
                                                size: 18
                                            }, void 0, false, {
                                                fileName: "[project]/aptiverse/aptiverse-ui/src/app/(dashboard)/subjects/page.tsx",
                                                lineNumber: 46,
                                                columnNumber: 15
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            "Add Subject"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/aptiverse/aptiverse-ui/src/app/(dashboard)/subjects/page.tsx",
                                        lineNumber: 42,
                                        columnNumber: 13
                                    }, ("TURBOPACK compile-time value", void 0))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/aptiverse/aptiverse-ui/src/app/(dashboard)/subjects/page.tsx",
                                lineNumber: 37,
                                columnNumber: 11
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "mt-4 sm:mt-6 max-w-md",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "relative",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$search$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Search$3e$__["Search"], {
                                            size: 18,
                                            className: "absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                                        }, void 0, false, {
                                            fileName: "[project]/aptiverse/aptiverse-ui/src/app/(dashboard)/subjects/page.tsx",
                                            lineNumber: 54,
                                            columnNumber: 15
                                        }, ("TURBOPACK compile-time value", void 0)),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                            type: "text",
                                            placeholder: "Search subjects...",
                                            value: searchTerm,
                                            onChange: (e)=>setSearchTerm(e.target.value),
                                            className: "w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 bg-white"
                                        }, void 0, false, {
                                            fileName: "[project]/aptiverse/aptiverse-ui/src/app/(dashboard)/subjects/page.tsx",
                                            lineNumber: 55,
                                            columnNumber: 15
                                        }, ("TURBOPACK compile-time value", void 0))
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/aptiverse/aptiverse-ui/src/app/(dashboard)/subjects/page.tsx",
                                    lineNumber: 53,
                                    columnNumber: 13
                                }, ("TURBOPACK compile-time value", void 0))
                            }, void 0, false, {
                                fileName: "[project]/aptiverse/aptiverse-ui/src/app/(dashboard)/subjects/page.tsx",
                                lineNumber: 52,
                                columnNumber: 11
                            }, ("TURBOPACK compile-time value", void 0))
                        ]
                    }, void 0, true, {
                        fileName: "[project]/aptiverse/aptiverse-ui/src/app/(dashboard)/subjects/page.tsx",
                        lineNumber: 36,
                        columnNumber: 9
                    }, ("TURBOPACK compile-time value", void 0)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "lg:hidden space-y-3",
                        children: filteredSubjects.map((subject)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "bg-white rounded-xl shadow-sm border border-gray-200 p-4",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-start justify-between mb-3",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex items-center gap-3 flex-1",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: `w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${subject.color}`,
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$book$2d$open$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__BookOpen$3e$__["BookOpen"], {
                                                            size: 16,
                                                            className: "text-white"
                                                        }, void 0, false, {
                                                            fileName: "[project]/aptiverse/aptiverse-ui/src/app/(dashboard)/subjects/page.tsx",
                                                            lineNumber: 73,
                                                            columnNumber: 21
                                                        }, ("TURBOPACK compile-time value", void 0))
                                                    }, void 0, false, {
                                                        fileName: "[project]/aptiverse/aptiverse-ui/src/app/(dashboard)/subjects/page.tsx",
                                                        lineNumber: 72,
                                                        columnNumber: 19
                                                    }, ("TURBOPACK compile-time value", void 0)),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "flex-1 min-w-0",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                                className: "text-sm font-semibold text-gray-900 truncate",
                                                                children: subject.name
                                                            }, void 0, false, {
                                                                fileName: "[project]/aptiverse/aptiverse-ui/src/app/(dashboard)/subjects/page.tsx",
                                                                lineNumber: 76,
                                                                columnNumber: 21
                                                            }, ("TURBOPACK compile-time value", void 0)),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                className: "text-xs text-gray-500 font-mono mt-0.5",
                                                                children: subject.code
                                                            }, void 0, false, {
                                                                fileName: "[project]/aptiverse/aptiverse-ui/src/app/(dashboard)/subjects/page.tsx",
                                                                lineNumber: 77,
                                                                columnNumber: 21
                                                            }, ("TURBOPACK compile-time value", void 0))
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/aptiverse/aptiverse-ui/src/app/(dashboard)/subjects/page.tsx",
                                                        lineNumber: 75,
                                                        columnNumber: 19
                                                    }, ("TURBOPACK compile-time value", void 0))
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/aptiverse/aptiverse-ui/src/app/(dashboard)/subjects/page.tsx",
                                                lineNumber: 71,
                                                columnNumber: 17
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                ref: dropdownRef,
                                                className: "relative",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                        onClick: ()=>setOpenDropdown(openDropdown === subject.id ? null : subject.id),
                                                        className: "p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200",
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$ellipsis$2d$vertical$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__MoreVertical$3e$__["MoreVertical"], {
                                                            size: 16
                                                        }, void 0, false, {
                                                            fileName: "[project]/aptiverse/aptiverse-ui/src/app/(dashboard)/subjects/page.tsx",
                                                            lineNumber: 85,
                                                            columnNumber: 21
                                                        }, ("TURBOPACK compile-time value", void 0))
                                                    }, void 0, false, {
                                                        fileName: "[project]/aptiverse/aptiverse-ui/src/app/(dashboard)/subjects/page.tsx",
                                                        lineNumber: 81,
                                                        columnNumber: 19
                                                    }, ("TURBOPACK compile-time value", void 0)),
                                                    openDropdown === subject.id && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "absolute top-full right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                                                href: `/subjects/${subject.id}`,
                                                                className: "block",
                                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                    onClick: ()=>setOpenDropdown(null),
                                                                    className: "flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150",
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$square$2d$pen$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Edit$3e$__["Edit"], {
                                                                            size: 14
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/aptiverse/aptiverse-ui/src/app/(dashboard)/subjects/page.tsx",
                                                                            lineNumber: 94,
                                                                            columnNumber: 27
                                                                        }, ("TURBOPACK compile-time value", void 0)),
                                                                        "Edit Details"
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/aptiverse/aptiverse-ui/src/app/(dashboard)/subjects/page.tsx",
                                                                    lineNumber: 90,
                                                                    columnNumber: 25
                                                                }, ("TURBOPACK compile-time value", void 0))
                                                            }, void 0, false, {
                                                                fileName: "[project]/aptiverse/aptiverse-ui/src/app/(dashboard)/subjects/page.tsx",
                                                                lineNumber: 89,
                                                                columnNumber: 23
                                                            }, ("TURBOPACK compile-time value", void 0)),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                onClick: ()=>{
                                                                    // Handle delete logic
                                                                    setOpenDropdown(null);
                                                                },
                                                                className: "flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-150",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trash$2d$2$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Trash2$3e$__["Trash2"], {
                                                                        size: 14
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/aptiverse/aptiverse-ui/src/app/(dashboard)/subjects/page.tsx",
                                                                        lineNumber: 105,
                                                                        columnNumber: 25
                                                                    }, ("TURBOPACK compile-time value", void 0)),
                                                                    "Remove Subject"
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/aptiverse/aptiverse-ui/src/app/(dashboard)/subjects/page.tsx",
                                                                lineNumber: 98,
                                                                columnNumber: 23
                                                            }, ("TURBOPACK compile-time value", void 0))
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/aptiverse/aptiverse-ui/src/app/(dashboard)/subjects/page.tsx",
                                                        lineNumber: 88,
                                                        columnNumber: 21
                                                    }, ("TURBOPACK compile-time value", void 0))
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/aptiverse/aptiverse-ui/src/app/(dashboard)/subjects/page.tsx",
                                                lineNumber: 80,
                                                columnNumber: 17
                                            }, ("TURBOPACK compile-time value", void 0))
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/aptiverse/aptiverse-ui/src/app/(dashboard)/subjects/page.tsx",
                                        lineNumber: 70,
                                        columnNumber: 15
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "mb-3",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex items-center justify-between mb-1",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "text-xs font-medium text-gray-700",
                                                        children: "Progress"
                                                    }, void 0, false, {
                                                        fileName: "[project]/aptiverse/aptiverse-ui/src/app/(dashboard)/subjects/page.tsx",
                                                        lineNumber: 116,
                                                        columnNumber: 19
                                                    }, ("TURBOPACK compile-time value", void 0)),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "text-xs font-semibold text-gray-900",
                                                        children: [
                                                            subject.progress,
                                                            "%"
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/aptiverse/aptiverse-ui/src/app/(dashboard)/subjects/page.tsx",
                                                        lineNumber: 117,
                                                        columnNumber: 19
                                                    }, ("TURBOPACK compile-time value", void 0))
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/aptiverse/aptiverse-ui/src/app/(dashboard)/subjects/page.tsx",
                                                lineNumber: 115,
                                                columnNumber: 17
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "h-1.5 bg-gray-200 rounded-full overflow-hidden",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: `h-full rounded-full transition-all duration-300 ${subject.color}`,
                                                    style: {
                                                        width: `${subject.progress}%`
                                                    }
                                                }, void 0, false, {
                                                    fileName: "[project]/aptiverse/aptiverse-ui/src/app/(dashboard)/subjects/page.tsx",
                                                    lineNumber: 120,
                                                    columnNumber: 19
                                                }, ("TURBOPACK compile-time value", void 0))
                                            }, void 0, false, {
                                                fileName: "[project]/aptiverse/aptiverse-ui/src/app/(dashboard)/subjects/page.tsx",
                                                lineNumber: 119,
                                                columnNumber: 17
                                            }, ("TURBOPACK compile-time value", void 0))
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/aptiverse/aptiverse-ui/src/app/(dashboard)/subjects/page.tsx",
                                        lineNumber: 114,
                                        columnNumber: 15
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "grid grid-cols-2 gap-3 text-xs",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "text-center p-2 bg-gray-50 rounded-lg",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "font-semibold text-gray-900",
                                                        children: [
                                                            subject.averageScore,
                                                            "%"
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/aptiverse/aptiverse-ui/src/app/(dashboard)/subjects/page.tsx",
                                                        lineNumber: 130,
                                                        columnNumber: 19
                                                    }, ("TURBOPACK compile-time value", void 0)),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "text-gray-500",
                                                        children: "Avg Score"
                                                    }, void 0, false, {
                                                        fileName: "[project]/aptiverse/aptiverse-ui/src/app/(dashboard)/subjects/page.tsx",
                                                        lineNumber: 131,
                                                        columnNumber: 19
                                                    }, ("TURBOPACK compile-time value", void 0))
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/aptiverse/aptiverse-ui/src/app/(dashboard)/subjects/page.tsx",
                                                lineNumber: 129,
                                                columnNumber: 17
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "text-center p-2 bg-gray-50 rounded-lg",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "font-semibold text-gray-900",
                                                        children: [
                                                            subject.studyHours,
                                                            "h"
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/aptiverse/aptiverse-ui/src/app/(dashboard)/subjects/page.tsx",
                                                        lineNumber: 134,
                                                        columnNumber: 19
                                                    }, ("TURBOPACK compile-time value", void 0)),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "text-gray-500",
                                                        children: "Study Hours"
                                                    }, void 0, false, {
                                                        fileName: "[project]/aptiverse/aptiverse-ui/src/app/(dashboard)/subjects/page.tsx",
                                                        lineNumber: 135,
                                                        columnNumber: 19
                                                    }, ("TURBOPACK compile-time value", void 0))
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/aptiverse/aptiverse-ui/src/app/(dashboard)/subjects/page.tsx",
                                                lineNumber: 133,
                                                columnNumber: 17
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "text-center p-2 bg-gray-50 rounded-lg",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "font-semibold text-gray-900",
                                                        children: subject.assignmentsCompleted
                                                    }, void 0, false, {
                                                        fileName: "[project]/aptiverse/aptiverse-ui/src/app/(dashboard)/subjects/page.tsx",
                                                        lineNumber: 138,
                                                        columnNumber: 19
                                                    }, ("TURBOPACK compile-time value", void 0)),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "text-gray-500",
                                                        children: "Assignments"
                                                    }, void 0, false, {
                                                        fileName: "[project]/aptiverse/aptiverse-ui/src/app/(dashboard)/subjects/page.tsx",
                                                        lineNumber: 139,
                                                        columnNumber: 19
                                                    }, ("TURBOPACK compile-time value", void 0))
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/aptiverse/aptiverse-ui/src/app/(dashboard)/subjects/page.tsx",
                                                lineNumber: 137,
                                                columnNumber: 17
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "text-center p-2 bg-gray-50 rounded-lg",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: `font-semibold ${subject.upcomingDeadlines > 0 ? 'text-yellow-700' : 'text-gray-600'}`,
                                                        children: subject.upcomingDeadlines
                                                    }, void 0, false, {
                                                        fileName: "[project]/aptiverse/aptiverse-ui/src/app/(dashboard)/subjects/page.tsx",
                                                        lineNumber: 142,
                                                        columnNumber: 19
                                                    }, ("TURBOPACK compile-time value", void 0)),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "text-gray-500",
                                                        children: "Due Soon"
                                                    }, void 0, false, {
                                                        fileName: "[project]/aptiverse/aptiverse-ui/src/app/(dashboard)/subjects/page.tsx",
                                                        lineNumber: 146,
                                                        columnNumber: 19
                                                    }, ("TURBOPACK compile-time value", void 0))
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/aptiverse/aptiverse-ui/src/app/(dashboard)/subjects/page.tsx",
                                                lineNumber: 141,
                                                columnNumber: 17
                                            }, ("TURBOPACK compile-time value", void 0))
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/aptiverse/aptiverse-ui/src/app/(dashboard)/subjects/page.tsx",
                                        lineNumber: 128,
                                        columnNumber: 15
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                        href: `/subjects/${subject.id}`,
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            className: "w-full mt-3 flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200",
                                            children: [
                                                "View Details",
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$right$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronRight$3e$__["ChevronRight"], {
                                                    size: 14
                                                }, void 0, false, {
                                                    fileName: "[project]/aptiverse/aptiverse-ui/src/app/(dashboard)/subjects/page.tsx",
                                                    lineNumber: 154,
                                                    columnNumber: 19
                                                }, ("TURBOPACK compile-time value", void 0))
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/aptiverse/aptiverse-ui/src/app/(dashboard)/subjects/page.tsx",
                                            lineNumber: 152,
                                            columnNumber: 17
                                        }, ("TURBOPACK compile-time value", void 0))
                                    }, void 0, false, {
                                        fileName: "[project]/aptiverse/aptiverse-ui/src/app/(dashboard)/subjects/page.tsx",
                                        lineNumber: 151,
                                        columnNumber: 15
                                    }, ("TURBOPACK compile-time value", void 0))
                                ]
                            }, subject.id, true, {
                                fileName: "[project]/aptiverse/aptiverse-ui/src/app/(dashboard)/subjects/page.tsx",
                                lineNumber: 69,
                                columnNumber: 13
                            }, ("TURBOPACK compile-time value", void 0)))
                    }, void 0, false, {
                        fileName: "[project]/aptiverse/aptiverse-ui/src/app/(dashboard)/subjects/page.tsx",
                        lineNumber: 67,
                        columnNumber: 9
                    }, ("TURBOPACK compile-time value", void 0)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "hidden lg:block bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "overflow-x-auto",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("table", {
                                className: "w-full",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("thead", {
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                            className: "border-b border-gray-200",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                    className: "px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider bg-gray-50",
                                                    children: "Subject"
                                                }, void 0, false, {
                                                    fileName: "[project]/aptiverse/aptiverse-ui/src/app/(dashboard)/subjects/page.tsx",
                                                    lineNumber: 167,
                                                    columnNumber: 19
                                                }, ("TURBOPACK compile-time value", void 0)),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                    className: "px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider bg-gray-50",
                                                    children: "Code"
                                                }, void 0, false, {
                                                    fileName: "[project]/aptiverse/aptiverse-ui/src/app/(dashboard)/subjects/page.tsx",
                                                    lineNumber: 168,
                                                    columnNumber: 19
                                                }, ("TURBOPACK compile-time value", void 0)),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                    className: "px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider bg-gray-50",
                                                    children: "Progress"
                                                }, void 0, false, {
                                                    fileName: "[project]/aptiverse/aptiverse-ui/src/app/(dashboard)/subjects/page.tsx",
                                                    lineNumber: 169,
                                                    columnNumber: 19
                                                }, ("TURBOPACK compile-time value", void 0)),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                    className: "px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider bg-gray-50",
                                                    children: "Avg Score"
                                                }, void 0, false, {
                                                    fileName: "[project]/aptiverse/aptiverse-ui/src/app/(dashboard)/subjects/page.tsx",
                                                    lineNumber: 170,
                                                    columnNumber: 19
                                                }, ("TURBOPACK compile-time value", void 0)),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                    className: "px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider bg-gray-50",
                                                    children: "Study Hours"
                                                }, void 0, false, {
                                                    fileName: "[project]/aptiverse/aptiverse-ui/src/app/(dashboard)/subjects/page.tsx",
                                                    lineNumber: 171,
                                                    columnNumber: 19
                                                }, ("TURBOPACK compile-time value", void 0)),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                    className: "px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider bg-gray-50",
                                                    children: "Assignments"
                                                }, void 0, false, {
                                                    fileName: "[project]/aptiverse/aptiverse-ui/src/app/(dashboard)/subjects/page.tsx",
                                                    lineNumber: 172,
                                                    columnNumber: 19
                                                }, ("TURBOPACK compile-time value", void 0)),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                    className: "px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider bg-gray-50",
                                                    children: "Due Soon"
                                                }, void 0, false, {
                                                    fileName: "[project]/aptiverse/aptiverse-ui/src/app/(dashboard)/subjects/page.tsx",
                                                    lineNumber: 173,
                                                    columnNumber: 19
                                                }, ("TURBOPACK compile-time value", void 0)),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                    className: "px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider bg-gray-50",
                                                    children: "Actions"
                                                }, void 0, false, {
                                                    fileName: "[project]/aptiverse/aptiverse-ui/src/app/(dashboard)/subjects/page.tsx",
                                                    lineNumber: 174,
                                                    columnNumber: 19
                                                }, ("TURBOPACK compile-time value", void 0))
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/aptiverse/aptiverse-ui/src/app/(dashboard)/subjects/page.tsx",
                                            lineNumber: 166,
                                            columnNumber: 17
                                        }, ("TURBOPACK compile-time value", void 0))
                                    }, void 0, false, {
                                        fileName: "[project]/aptiverse/aptiverse-ui/src/app/(dashboard)/subjects/page.tsx",
                                        lineNumber: 165,
                                        columnNumber: 15
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tbody", {
                                        className: "divide-y divide-gray-200",
                                        children: filteredSubjects.map((subject)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                                className: "hover:bg-gray-50 transition-colors duration-150",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                        className: "px-6 py-4 whitespace-nowrap",
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "flex items-center gap-3",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: `w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${subject.color}`,
                                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$book$2d$open$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__BookOpen$3e$__["BookOpen"], {
                                                                        size: 14,
                                                                        className: "text-white"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/aptiverse/aptiverse-ui/src/app/(dashboard)/subjects/page.tsx",
                                                                        lineNumber: 183,
                                                                        columnNumber: 27
                                                                    }, ("TURBOPACK compile-time value", void 0))
                                                                }, void 0, false, {
                                                                    fileName: "[project]/aptiverse/aptiverse-ui/src/app/(dashboard)/subjects/page.tsx",
                                                                    lineNumber: 182,
                                                                    columnNumber: 25
                                                                }, ("TURBOPACK compile-time value", void 0)),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                        className: "text-sm font-medium text-gray-900",
                                                                        children: subject.name
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/aptiverse/aptiverse-ui/src/app/(dashboard)/subjects/page.tsx",
                                                                        lineNumber: 186,
                                                                        columnNumber: 27
                                                                    }, ("TURBOPACK compile-time value", void 0))
                                                                }, void 0, false, {
                                                                    fileName: "[project]/aptiverse/aptiverse-ui/src/app/(dashboard)/subjects/page.tsx",
                                                                    lineNumber: 185,
                                                                    columnNumber: 25
                                                                }, ("TURBOPACK compile-time value", void 0))
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/aptiverse/aptiverse-ui/src/app/(dashboard)/subjects/page.tsx",
                                                            lineNumber: 181,
                                                            columnNumber: 23
                                                        }, ("TURBOPACK compile-time value", void 0))
                                                    }, void 0, false, {
                                                        fileName: "[project]/aptiverse/aptiverse-ui/src/app/(dashboard)/subjects/page.tsx",
                                                        lineNumber: 180,
                                                        columnNumber: 21
                                                    }, ("TURBOPACK compile-time value", void 0)),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                        className: "px-6 py-4 whitespace-nowrap",
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "text-sm text-gray-600 font-mono",
                                                            children: subject.code
                                                        }, void 0, false, {
                                                            fileName: "[project]/aptiverse/aptiverse-ui/src/app/(dashboard)/subjects/page.tsx",
                                                            lineNumber: 191,
                                                            columnNumber: 23
                                                        }, ("TURBOPACK compile-time value", void 0))
                                                    }, void 0, false, {
                                                        fileName: "[project]/aptiverse/aptiverse-ui/src/app/(dashboard)/subjects/page.tsx",
                                                        lineNumber: 190,
                                                        columnNumber: 21
                                                    }, ("TURBOPACK compile-time value", void 0)),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                        className: "px-6 py-4 whitespace-nowrap",
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "flex items-center gap-3 min-w-[120px]",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    className: "text-sm font-medium text-gray-900 w-8",
                                                                    children: [
                                                                        subject.progress,
                                                                        "%"
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/aptiverse/aptiverse-ui/src/app/(dashboard)/subjects/page.tsx",
                                                                    lineNumber: 195,
                                                                    columnNumber: 25
                                                                }, ("TURBOPACK compile-time value", void 0)),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden",
                                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                        className: `h-full rounded-full transition-all duration-300 ${subject.color}`,
                                                                        style: {
                                                                            width: `${subject.progress}%`
                                                                        }
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/aptiverse/aptiverse-ui/src/app/(dashboard)/subjects/page.tsx",
                                                                        lineNumber: 197,
                                                                        columnNumber: 27
                                                                    }, ("TURBOPACK compile-time value", void 0))
                                                                }, void 0, false, {
                                                                    fileName: "[project]/aptiverse/aptiverse-ui/src/app/(dashboard)/subjects/page.tsx",
                                                                    lineNumber: 196,
                                                                    columnNumber: 25
                                                                }, ("TURBOPACK compile-time value", void 0))
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/aptiverse/aptiverse-ui/src/app/(dashboard)/subjects/page.tsx",
                                                            lineNumber: 194,
                                                            columnNumber: 23
                                                        }, ("TURBOPACK compile-time value", void 0))
                                                    }, void 0, false, {
                                                        fileName: "[project]/aptiverse/aptiverse-ui/src/app/(dashboard)/subjects/page.tsx",
                                                        lineNumber: 193,
                                                        columnNumber: 21
                                                    }, ("TURBOPACK compile-time value", void 0)),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                        className: "px-6 py-4 whitespace-nowrap",
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "text-sm font-medium text-gray-900",
                                                            children: [
                                                                subject.averageScore,
                                                                "%"
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/aptiverse/aptiverse-ui/src/app/(dashboard)/subjects/page.tsx",
                                                            lineNumber: 205,
                                                            columnNumber: 23
                                                        }, ("TURBOPACK compile-time value", void 0))
                                                    }, void 0, false, {
                                                        fileName: "[project]/aptiverse/aptiverse-ui/src/app/(dashboard)/subjects/page.tsx",
                                                        lineNumber: 204,
                                                        columnNumber: 21
                                                    }, ("TURBOPACK compile-time value", void 0)),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                        className: "px-6 py-4 whitespace-nowrap",
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "text-sm text-gray-600",
                                                            children: [
                                                                subject.studyHours,
                                                                "h"
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/aptiverse/aptiverse-ui/src/app/(dashboard)/subjects/page.tsx",
                                                            lineNumber: 208,
                                                            columnNumber: 23
                                                        }, ("TURBOPACK compile-time value", void 0))
                                                    }, void 0, false, {
                                                        fileName: "[project]/aptiverse/aptiverse-ui/src/app/(dashboard)/subjects/page.tsx",
                                                        lineNumber: 207,
                                                        columnNumber: 21
                                                    }, ("TURBOPACK compile-time value", void 0)),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                        className: "px-6 py-4 whitespace-nowrap",
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "text-sm text-gray-600",
                                                            children: subject.assignmentsCompleted
                                                        }, void 0, false, {
                                                            fileName: "[project]/aptiverse/aptiverse-ui/src/app/(dashboard)/subjects/page.tsx",
                                                            lineNumber: 211,
                                                            columnNumber: 23
                                                        }, ("TURBOPACK compile-time value", void 0))
                                                    }, void 0, false, {
                                                        fileName: "[project]/aptiverse/aptiverse-ui/src/app/(dashboard)/subjects/page.tsx",
                                                        lineNumber: 210,
                                                        columnNumber: 21
                                                    }, ("TURBOPACK compile-time value", void 0)),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                        className: "px-6 py-4 whitespace-nowrap",
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${subject.upcomingDeadlines > 0 ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-600'}`,
                                                            children: subject.upcomingDeadlines
                                                        }, void 0, false, {
                                                            fileName: "[project]/aptiverse/aptiverse-ui/src/app/(dashboard)/subjects/page.tsx",
                                                            lineNumber: 214,
                                                            columnNumber: 23
                                                        }, ("TURBOPACK compile-time value", void 0))
                                                    }, void 0, false, {
                                                        fileName: "[project]/aptiverse/aptiverse-ui/src/app/(dashboard)/subjects/page.tsx",
                                                        lineNumber: 213,
                                                        columnNumber: 21
                                                    }, ("TURBOPACK compile-time value", void 0)),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                        className: "px-6 py-4 whitespace-nowrap text-right text-sm font-medium",
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            ref: dropdownRef,
                                                            className: "relative inline-flex justify-end",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                    onClick: ()=>setOpenDropdown(openDropdown === subject.id ? null : subject.id),
                                                                    className: "p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-1",
                                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$ellipsis$2d$vertical$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__MoreVertical$3e$__["MoreVertical"], {
                                                                        size: 16
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/aptiverse/aptiverse-ui/src/app/(dashboard)/subjects/page.tsx",
                                                                        lineNumber: 227,
                                                                        columnNumber: 27
                                                                    }, ("TURBOPACK compile-time value", void 0))
                                                                }, void 0, false, {
                                                                    fileName: "[project]/aptiverse/aptiverse-ui/src/app/(dashboard)/subjects/page.tsx",
                                                                    lineNumber: 223,
                                                                    columnNumber: 25
                                                                }, ("TURBOPACK compile-time value", void 0)),
                                                                openDropdown === subject.id && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "absolute top-full right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10",
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                                                            href: `/subjects/${subject.id}`,
                                                                            className: "block",
                                                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                                onClick: ()=>setOpenDropdown(null),
                                                                                className: "flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150",
                                                                                children: [
                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$square$2d$pen$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Edit$3e$__["Edit"], {
                                                                                        size: 14
                                                                                    }, void 0, false, {
                                                                                        fileName: "[project]/aptiverse/aptiverse-ui/src/app/(dashboard)/subjects/page.tsx",
                                                                                        lineNumber: 236,
                                                                                        columnNumber: 33
                                                                                    }, ("TURBOPACK compile-time value", void 0)),
                                                                                    "Edit Details"
                                                                                ]
                                                                            }, void 0, true, {
                                                                                fileName: "[project]/aptiverse/aptiverse-ui/src/app/(dashboard)/subjects/page.tsx",
                                                                                lineNumber: 232,
                                                                                columnNumber: 31
                                                                            }, ("TURBOPACK compile-time value", void 0))
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/aptiverse/aptiverse-ui/src/app/(dashboard)/subjects/page.tsx",
                                                                            lineNumber: 231,
                                                                            columnNumber: 29
                                                                        }, ("TURBOPACK compile-time value", void 0)),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                            onClick: ()=>{
                                                                                // Handle delete logic
                                                                                setOpenDropdown(null);
                                                                            },
                                                                            className: "flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-150",
                                                                            children: [
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trash$2d$2$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Trash2$3e$__["Trash2"], {
                                                                                    size: 14
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/aptiverse/aptiverse-ui/src/app/(dashboard)/subjects/page.tsx",
                                                                                    lineNumber: 247,
                                                                                    columnNumber: 31
                                                                                }, ("TURBOPACK compile-time value", void 0)),
                                                                                "Remove Subject"
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/aptiverse/aptiverse-ui/src/app/(dashboard)/subjects/page.tsx",
                                                                            lineNumber: 240,
                                                                            columnNumber: 29
                                                                        }, ("TURBOPACK compile-time value", void 0))
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/aptiverse/aptiverse-ui/src/app/(dashboard)/subjects/page.tsx",
                                                                    lineNumber: 230,
                                                                    columnNumber: 27
                                                                }, ("TURBOPACK compile-time value", void 0))
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/aptiverse/aptiverse-ui/src/app/(dashboard)/subjects/page.tsx",
                                                            lineNumber: 222,
                                                            columnNumber: 23
                                                        }, ("TURBOPACK compile-time value", void 0))
                                                    }, void 0, false, {
                                                        fileName: "[project]/aptiverse/aptiverse-ui/src/app/(dashboard)/subjects/page.tsx",
                                                        lineNumber: 221,
                                                        columnNumber: 21
                                                    }, ("TURBOPACK compile-time value", void 0))
                                                ]
                                            }, subject.id, true, {
                                                fileName: "[project]/aptiverse/aptiverse-ui/src/app/(dashboard)/subjects/page.tsx",
                                                lineNumber: 179,
                                                columnNumber: 19
                                            }, ("TURBOPACK compile-time value", void 0)))
                                    }, void 0, false, {
                                        fileName: "[project]/aptiverse/aptiverse-ui/src/app/(dashboard)/subjects/page.tsx",
                                        lineNumber: 177,
                                        columnNumber: 15
                                    }, ("TURBOPACK compile-time value", void 0))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/aptiverse/aptiverse-ui/src/app/(dashboard)/subjects/page.tsx",
                                lineNumber: 164,
                                columnNumber: 13
                            }, ("TURBOPACK compile-time value", void 0))
                        }, void 0, false, {
                            fileName: "[project]/aptiverse/aptiverse-ui/src/app/(dashboard)/subjects/page.tsx",
                            lineNumber: 163,
                            columnNumber: 11
                        }, ("TURBOPACK compile-time value", void 0))
                    }, void 0, false, {
                        fileName: "[project]/aptiverse/aptiverse-ui/src/app/(dashboard)/subjects/page.tsx",
                        lineNumber: 162,
                        columnNumber: 9
                    }, ("TURBOPACK compile-time value", void 0))
                ]
            }, void 0, true, {
                fileName: "[project]/aptiverse/aptiverse-ui/src/app/(dashboard)/subjects/page.tsx",
                lineNumber: 34,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0)),
            isCreateModalOpen && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-50 p-4 sm:p-6",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "bg-white rounded-t-2xl sm:rounded-xl w-full max-w-md max-h-[85vh] overflow-auto border border-gray-200 shadow-lg sm:shadow-xl",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                    className: "text-lg font-semibold text-gray-900",
                                    children: "Add New Subject"
                                }, void 0, false, {
                                    fileName: "[project]/aptiverse/aptiverse-ui/src/app/(dashboard)/subjects/page.tsx",
                                    lineNumber: 267,
                                    columnNumber: 15
                                }, ("TURBOPACK compile-time value", void 0)),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: ()=>setIsCreateModalOpen(false),
                                    className: "p-1 text-gray-400 hover:text-gray-600 transition-colors duration-200 text-2xl",
                                    children: "×"
                                }, void 0, false, {
                                    fileName: "[project]/aptiverse/aptiverse-ui/src/app/(dashboard)/subjects/page.tsx",
                                    lineNumber: 268,
                                    columnNumber: 15
                                }, ("TURBOPACK compile-time value", void 0))
                            ]
                        }, void 0, true, {
                            fileName: "[project]/aptiverse/aptiverse-ui/src/app/(dashboard)/subjects/page.tsx",
                            lineNumber: 266,
                            columnNumber: 13
                        }, ("TURBOPACK compile-time value", void 0)),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "p-6",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                                className: "space-y-4",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                className: "block text-sm font-medium text-gray-700 mb-1",
                                                children: "Subject Name"
                                            }, void 0, false, {
                                                fileName: "[project]/aptiverse/aptiverse-ui/src/app/(dashboard)/subjects/page.tsx",
                                                lineNumber: 278,
                                                columnNumber: 19
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                type: "text",
                                                className: "w-full px-3 py-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500",
                                                placeholder: "Mathematics, Physics, etc."
                                            }, void 0, false, {
                                                fileName: "[project]/aptiverse/aptiverse-ui/src/app/(dashboard)/subjects/page.tsx",
                                                lineNumber: 279,
                                                columnNumber: 19
                                            }, ("TURBOPACK compile-time value", void 0))
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/aptiverse/aptiverse-ui/src/app/(dashboard)/subjects/page.tsx",
                                        lineNumber: 277,
                                        columnNumber: 17
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                className: "block text-sm font-medium text-gray-700 mb-1",
                                                children: "Subject Code"
                                            }, void 0, false, {
                                                fileName: "[project]/aptiverse/aptiverse-ui/src/app/(dashboard)/subjects/page.tsx",
                                                lineNumber: 286,
                                                columnNumber: 19
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                type: "text",
                                                className: "w-full px-3 py-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500",
                                                placeholder: "MAT, PHY, etc."
                                            }, void 0, false, {
                                                fileName: "[project]/aptiverse/aptiverse-ui/src/app/(dashboard)/subjects/page.tsx",
                                                lineNumber: 287,
                                                columnNumber: 19
                                            }, ("TURBOPACK compile-time value", void 0))
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/aptiverse/aptiverse-ui/src/app/(dashboard)/subjects/page.tsx",
                                        lineNumber: 285,
                                        columnNumber: 17
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                className: "block text-sm font-medium text-gray-700 mb-1",
                                                children: "Target Grade (%)"
                                            }, void 0, false, {
                                                fileName: "[project]/aptiverse/aptiverse-ui/src/app/(dashboard)/subjects/page.tsx",
                                                lineNumber: 294,
                                                columnNumber: 19
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                type: "number",
                                                min: "0",
                                                max: "100",
                                                className: "w-full px-3 py-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500",
                                                placeholder: "75"
                                            }, void 0, false, {
                                                fileName: "[project]/aptiverse/aptiverse-ui/src/app/(dashboard)/subjects/page.tsx",
                                                lineNumber: 295,
                                                columnNumber: 19
                                            }, ("TURBOPACK compile-time value", void 0))
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/aptiverse/aptiverse-ui/src/app/(dashboard)/subjects/page.tsx",
                                        lineNumber: 293,
                                        columnNumber: 17
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex gap-3 pt-4",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                type: "button",
                                                onClick: ()=>setIsCreateModalOpen(false),
                                                className: "flex-1 px-4 py-3 text-base font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200",
                                                children: "Cancel"
                                            }, void 0, false, {
                                                fileName: "[project]/aptiverse/aptiverse-ui/src/app/(dashboard)/subjects/page.tsx",
                                                lineNumber: 304,
                                                columnNumber: 19
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                type: "submit",
                                                className: "flex-1 px-4 py-3 text-base font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors duration-200",
                                                children: "Create Subject"
                                            }, void 0, false, {
                                                fileName: "[project]/aptiverse/aptiverse-ui/src/app/(dashboard)/subjects/page.tsx",
                                                lineNumber: 311,
                                                columnNumber: 19
                                            }, ("TURBOPACK compile-time value", void 0))
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/aptiverse/aptiverse-ui/src/app/(dashboard)/subjects/page.tsx",
                                        lineNumber: 303,
                                        columnNumber: 17
                                    }, ("TURBOPACK compile-time value", void 0))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/aptiverse/aptiverse-ui/src/app/(dashboard)/subjects/page.tsx",
                                lineNumber: 276,
                                columnNumber: 15
                            }, ("TURBOPACK compile-time value", void 0))
                        }, void 0, false, {
                            fileName: "[project]/aptiverse/aptiverse-ui/src/app/(dashboard)/subjects/page.tsx",
                            lineNumber: 275,
                            columnNumber: 13
                        }, ("TURBOPACK compile-time value", void 0))
                    ]
                }, void 0, true, {
                    fileName: "[project]/aptiverse/aptiverse-ui/src/app/(dashboard)/subjects/page.tsx",
                    lineNumber: 265,
                    columnNumber: 11
                }, ("TURBOPACK compile-time value", void 0))
            }, void 0, false, {
                fileName: "[project]/aptiverse/aptiverse-ui/src/app/(dashboard)/subjects/page.tsx",
                lineNumber: 264,
                columnNumber: 9
            }, ("TURBOPACK compile-time value", void 0))
        ]
    }, void 0, true, {
        fileName: "[project]/aptiverse/aptiverse-ui/src/app/(dashboard)/subjects/page.tsx",
        lineNumber: 33,
        columnNumber: 5
    }, ("TURBOPACK compile-time value", void 0));
};
const __TURBOPACK__default__export__ = Subjects;
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__43900fc4._.js.map