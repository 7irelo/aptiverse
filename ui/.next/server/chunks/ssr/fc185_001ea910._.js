module.exports = [
"[project]/aptiverse/aptiverse-ui/node_modules/lucide-react/dist/esm/shared/src/utils.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ __turbopack_context__.s([
    "hasA11yProp",
    ()=>hasA11yProp,
    "mergeClasses",
    ()=>mergeClasses,
    "toCamelCase",
    ()=>toCamelCase,
    "toKebabCase",
    ()=>toKebabCase,
    "toPascalCase",
    ()=>toPascalCase
]);
const toKebabCase = (string)=>string.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
const toCamelCase = (string)=>string.replace(/^([A-Z])|[\s-_]+(\w)/g, (match, p1, p2)=>p2 ? p2.toUpperCase() : p1.toLowerCase());
const toPascalCase = (string)=>{
    const camelCase = toCamelCase(string);
    return camelCase.charAt(0).toUpperCase() + camelCase.slice(1);
};
const mergeClasses = (...classes)=>classes.filter((className, index, array)=>{
        return Boolean(className) && className.trim() !== "" && array.indexOf(className) === index;
    }).join(" ").trim();
const hasA11yProp = (props)=>{
    for(const prop in props){
        if (prop.startsWith("aria-") || prop === "role" || prop === "title") {
            return true;
        }
    }
};
;
 //# sourceMappingURL=utils.js.map
}),
"[project]/aptiverse/aptiverse-ui/node_modules/lucide-react/dist/esm/defaultAttributes.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ __turbopack_context__.s([
    "default",
    ()=>defaultAttributes
]);
var defaultAttributes = {
    xmlns: "http://www.w3.org/2000/svg",
    width: 24,
    height: 24,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round",
    strokeLinejoin: "round"
};
;
 //# sourceMappingURL=defaultAttributes.js.map
}),
"[project]/aptiverse/aptiverse-ui/node_modules/lucide-react/dist/esm/Icon.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ __turbopack_context__.s([
    "default",
    ()=>Icon
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$defaultAttributes$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/lucide-react/dist/esm/defaultAttributes.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$shared$2f$src$2f$utils$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/lucide-react/dist/esm/shared/src/utils.js [app-rsc] (ecmascript)");
;
;
;
const Icon = (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["forwardRef"])(({ color = "currentColor", size = 24, strokeWidth = 2, absoluteStrokeWidth, className = "", children, iconNode, ...rest }, ref)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["createElement"])("svg", {
        ref,
        ...__TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$defaultAttributes$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"],
        width: size,
        height: size,
        stroke: color,
        strokeWidth: absoluteStrokeWidth ? Number(strokeWidth) * 24 / Number(size) : strokeWidth,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$shared$2f$src$2f$utils$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["mergeClasses"])("lucide", className),
        ...!children && !(0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$shared$2f$src$2f$utils$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["hasA11yProp"])(rest) && {
            "aria-hidden": "true"
        },
        ...rest
    }, [
        ...iconNode.map(([tag, attrs])=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["createElement"])(tag, attrs)),
        ...Array.isArray(children) ? children : [
            children
        ]
    ]));
;
 //# sourceMappingURL=Icon.js.map
}),
"[project]/aptiverse/aptiverse-ui/node_modules/lucide-react/dist/esm/createLucideIcon.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ __turbopack_context__.s([
    "default",
    ()=>createLucideIcon
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$shared$2f$src$2f$utils$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/lucide-react/dist/esm/shared/src/utils.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$Icon$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/lucide-react/dist/esm/Icon.js [app-rsc] (ecmascript)");
;
;
;
const createLucideIcon = (iconName, iconNode)=>{
    const Component = (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["forwardRef"])(({ className, ...props }, ref)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["createElement"])(__TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$Icon$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"], {
            ref,
            iconNode,
            className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$shared$2f$src$2f$utils$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["mergeClasses"])(`lucide-${(0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$shared$2f$src$2f$utils$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["toKebabCase"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$shared$2f$src$2f$utils$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["toPascalCase"])(iconName))}`, `lucide-${iconName}`, className),
            ...props
        }));
    Component.displayName = (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$shared$2f$src$2f$utils$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["toPascalCase"])(iconName);
    return Component;
};
;
 //# sourceMappingURL=createLucideIcon.js.map
}),
"[project]/aptiverse/aptiverse-ui/node_modules/lucide-react/dist/esm/icons/arrow-down.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ __turbopack_context__.s([
    "__iconNode",
    ()=>__iconNode,
    "default",
    ()=>ArrowDown
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/lucide-react/dist/esm/createLucideIcon.js [app-rsc] (ecmascript)");
;
const __iconNode = [
    [
        "path",
        {
            d: "M12 5v14",
            key: "s699le"
        }
    ],
    [
        "path",
        {
            d: "m19 12-7 7-7-7",
            key: "1idqje"
        }
    ]
];
const ArrowDown = (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"])("arrow-down", __iconNode);
;
 //# sourceMappingURL=arrow-down.js.map
}),
"[project]/aptiverse/aptiverse-ui/node_modules/lucide-react/dist/esm/icons/arrow-down.js [app-rsc] (ecmascript) <export default as ArrowDown>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ArrowDown",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$down$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$down$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/lucide-react/dist/esm/icons/arrow-down.js [app-rsc] (ecmascript)");
}),
"[project]/aptiverse/aptiverse-ui/node_modules/lucide-react/dist/esm/icons/arrow-up.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ __turbopack_context__.s([
    "__iconNode",
    ()=>__iconNode,
    "default",
    ()=>ArrowUp
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/lucide-react/dist/esm/createLucideIcon.js [app-rsc] (ecmascript)");
;
const __iconNode = [
    [
        "path",
        {
            d: "m5 12 7-7 7 7",
            key: "hav0vg"
        }
    ],
    [
        "path",
        {
            d: "M12 19V5",
            key: "x0mq9r"
        }
    ]
];
const ArrowUp = (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"])("arrow-up", __iconNode);
;
 //# sourceMappingURL=arrow-up.js.map
}),
"[project]/aptiverse/aptiverse-ui/node_modules/lucide-react/dist/esm/icons/arrow-up.js [app-rsc] (ecmascript) <export default as ArrowUp>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ArrowUp",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$up$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$up$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/lucide-react/dist/esm/icons/arrow-up.js [app-rsc] (ecmascript)");
}),
"[project]/aptiverse/aptiverse-ui/node_modules/lucide-react/dist/esm/icons/award.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ __turbopack_context__.s([
    "__iconNode",
    ()=>__iconNode,
    "default",
    ()=>Award
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/lucide-react/dist/esm/createLucideIcon.js [app-rsc] (ecmascript)");
;
const __iconNode = [
    [
        "path",
        {
            d: "m15.477 12.89 1.515 8.526a.5.5 0 0 1-.81.47l-3.58-2.687a1 1 0 0 0-1.197 0l-3.586 2.686a.5.5 0 0 1-.81-.469l1.514-8.526",
            key: "1yiouv"
        }
    ],
    [
        "circle",
        {
            cx: "12",
            cy: "8",
            r: "6",
            key: "1vp47v"
        }
    ]
];
const Award = (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"])("award", __iconNode);
;
 //# sourceMappingURL=award.js.map
}),
"[project]/aptiverse/aptiverse-ui/node_modules/lucide-react/dist/esm/icons/award.js [app-rsc] (ecmascript) <export default as Award>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Award",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$award$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$award$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/lucide-react/dist/esm/icons/award.js [app-rsc] (ecmascript)");
}),
"[project]/aptiverse/aptiverse-ui/node_modules/lucide-react/dist/esm/icons/book-open.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ __turbopack_context__.s([
    "__iconNode",
    ()=>__iconNode,
    "default",
    ()=>BookOpen
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/lucide-react/dist/esm/createLucideIcon.js [app-rsc] (ecmascript)");
;
const __iconNode = [
    [
        "path",
        {
            d: "M12 7v14",
            key: "1akyts"
        }
    ],
    [
        "path",
        {
            d: "M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z",
            key: "ruj8y"
        }
    ]
];
const BookOpen = (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"])("book-open", __iconNode);
;
 //# sourceMappingURL=book-open.js.map
}),
"[project]/aptiverse/aptiverse-ui/node_modules/lucide-react/dist/esm/icons/book-open.js [app-rsc] (ecmascript) <export default as BookOpen>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "BookOpen",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$book$2d$open$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$book$2d$open$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/lucide-react/dist/esm/icons/book-open.js [app-rsc] (ecmascript)");
}),
"[project]/aptiverse/aptiverse-ui/node_modules/lucide-react/dist/esm/icons/clock.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ __turbopack_context__.s([
    "__iconNode",
    ()=>__iconNode,
    "default",
    ()=>Clock
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/lucide-react/dist/esm/createLucideIcon.js [app-rsc] (ecmascript)");
;
const __iconNode = [
    [
        "path",
        {
            d: "M12 6v6l4 2",
            key: "mmk7yg"
        }
    ],
    [
        "circle",
        {
            cx: "12",
            cy: "12",
            r: "10",
            key: "1mglay"
        }
    ]
];
const Clock = (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"])("clock", __iconNode);
;
 //# sourceMappingURL=clock.js.map
}),
"[project]/aptiverse/aptiverse-ui/node_modules/lucide-react/dist/esm/icons/clock.js [app-rsc] (ecmascript) <export default as Clock>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Clock",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$clock$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$clock$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/lucide-react/dist/esm/icons/clock.js [app-rsc] (ecmascript)");
}),
"[project]/aptiverse/aptiverse-ui/node_modules/lucide-react/dist/esm/icons/target.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ __turbopack_context__.s([
    "__iconNode",
    ()=>__iconNode,
    "default",
    ()=>Target
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/lucide-react/dist/esm/createLucideIcon.js [app-rsc] (ecmascript)");
;
const __iconNode = [
    [
        "circle",
        {
            cx: "12",
            cy: "12",
            r: "10",
            key: "1mglay"
        }
    ],
    [
        "circle",
        {
            cx: "12",
            cy: "12",
            r: "6",
            key: "1vlfrh"
        }
    ],
    [
        "circle",
        {
            cx: "12",
            cy: "12",
            r: "2",
            key: "1c9p78"
        }
    ]
];
const Target = (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"])("target", __iconNode);
;
 //# sourceMappingURL=target.js.map
}),
"[project]/aptiverse/aptiverse-ui/node_modules/lucide-react/dist/esm/icons/target.js [app-rsc] (ecmascript) <export default as Target>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Target",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$target$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$target$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/lucide-react/dist/esm/icons/target.js [app-rsc] (ecmascript)");
}),
"[project]/aptiverse/aptiverse-ui/node_modules/lucide-react/dist/esm/icons/bookmark.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ __turbopack_context__.s([
    "__iconNode",
    ()=>__iconNode,
    "default",
    ()=>Bookmark
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/lucide-react/dist/esm/createLucideIcon.js [app-rsc] (ecmascript)");
;
const __iconNode = [
    [
        "path",
        {
            d: "m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z",
            key: "1fy3hk"
        }
    ]
];
const Bookmark = (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"])("bookmark", __iconNode);
;
 //# sourceMappingURL=bookmark.js.map
}),
"[project]/aptiverse/aptiverse-ui/node_modules/lucide-react/dist/esm/icons/bookmark.js [app-rsc] (ecmascript) <export default as Bookmark>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Bookmark",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$bookmark$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$bookmark$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/lucide-react/dist/esm/icons/bookmark.js [app-rsc] (ecmascript)");
}),
"[project]/aptiverse/aptiverse-ui/node_modules/lucide-react/dist/esm/icons/users.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ __turbopack_context__.s([
    "__iconNode",
    ()=>__iconNode,
    "default",
    ()=>Users
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/lucide-react/dist/esm/createLucideIcon.js [app-rsc] (ecmascript)");
;
const __iconNode = [
    [
        "path",
        {
            d: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2",
            key: "1yyitq"
        }
    ],
    [
        "path",
        {
            d: "M16 3.128a4 4 0 0 1 0 7.744",
            key: "16gr8j"
        }
    ],
    [
        "path",
        {
            d: "M22 21v-2a4 4 0 0 0-3-3.87",
            key: "kshegd"
        }
    ],
    [
        "circle",
        {
            cx: "9",
            cy: "7",
            r: "4",
            key: "nufk8"
        }
    ]
];
const Users = (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"])("users", __iconNode);
;
 //# sourceMappingURL=users.js.map
}),
"[project]/aptiverse/aptiverse-ui/node_modules/lucide-react/dist/esm/icons/users.js [app-rsc] (ecmascript) <export default as Users>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Users",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$users$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$users$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/lucide-react/dist/esm/icons/users.js [app-rsc] (ecmascript)");
}),
"[project]/aptiverse/aptiverse-ui/node_modules/lucide-react/dist/esm/icons/chart-pie.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ __turbopack_context__.s([
    "__iconNode",
    ()=>__iconNode,
    "default",
    ()=>ChartPie
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/lucide-react/dist/esm/createLucideIcon.js [app-rsc] (ecmascript)");
;
const __iconNode = [
    [
        "path",
        {
            d: "M21 12c.552 0 1.005-.449.95-.998a10 10 0 0 0-8.953-8.951c-.55-.055-.998.398-.998.95v8a1 1 0 0 0 1 1z",
            key: "pzmjnu"
        }
    ],
    [
        "path",
        {
            d: "M21.21 15.89A10 10 0 1 1 8 2.83",
            key: "k2fpak"
        }
    ]
];
const ChartPie = (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"])("chart-pie", __iconNode);
;
 //# sourceMappingURL=chart-pie.js.map
}),
"[project]/aptiverse/aptiverse-ui/node_modules/lucide-react/dist/esm/icons/chart-pie.js [app-rsc] (ecmascript) <export default as PieChart>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "PieChart",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chart$2d$pie$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chart$2d$pie$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/lucide-react/dist/esm/icons/chart-pie.js [app-rsc] (ecmascript)");
}),
"[project]/aptiverse/aptiverse-ui/node_modules/lucide-react/dist/esm/icons/chart-column.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ __turbopack_context__.s([
    "__iconNode",
    ()=>__iconNode,
    "default",
    ()=>ChartColumn
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/lucide-react/dist/esm/createLucideIcon.js [app-rsc] (ecmascript)");
;
const __iconNode = [
    [
        "path",
        {
            d: "M3 3v16a2 2 0 0 0 2 2h16",
            key: "c24i48"
        }
    ],
    [
        "path",
        {
            d: "M18 17V9",
            key: "2bz60n"
        }
    ],
    [
        "path",
        {
            d: "M13 17V5",
            key: "1frdt8"
        }
    ],
    [
        "path",
        {
            d: "M8 17v-3",
            key: "17ska0"
        }
    ]
];
const ChartColumn = (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"])("chart-column", __iconNode);
;
 //# sourceMappingURL=chart-column.js.map
}),
"[project]/aptiverse/aptiverse-ui/node_modules/lucide-react/dist/esm/icons/chart-column.js [app-rsc] (ecmascript) <export default as BarChart3>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "BarChart3",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chart$2d$column$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chart$2d$column$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/lucide-react/dist/esm/icons/chart-column.js [app-rsc] (ecmascript)");
}),
"[project]/aptiverse/aptiverse-ui/node_modules/lucide-react/dist/esm/icons/brain.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ __turbopack_context__.s([
    "__iconNode",
    ()=>__iconNode,
    "default",
    ()=>Brain
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/lucide-react/dist/esm/createLucideIcon.js [app-rsc] (ecmascript)");
;
const __iconNode = [
    [
        "path",
        {
            d: "M12 18V5",
            key: "adv99a"
        }
    ],
    [
        "path",
        {
            d: "M15 13a4.17 4.17 0 0 1-3-4 4.17 4.17 0 0 1-3 4",
            key: "1e3is1"
        }
    ],
    [
        "path",
        {
            d: "M17.598 6.5A3 3 0 1 0 12 5a3 3 0 1 0-5.598 1.5",
            key: "1gqd8o"
        }
    ],
    [
        "path",
        {
            d: "M17.997 5.125a4 4 0 0 1 2.526 5.77",
            key: "iwvgf7"
        }
    ],
    [
        "path",
        {
            d: "M18 18a4 4 0 0 0 2-7.464",
            key: "efp6ie"
        }
    ],
    [
        "path",
        {
            d: "M19.967 17.483A4 4 0 1 1 12 18a4 4 0 1 1-7.967-.517",
            key: "1gq6am"
        }
    ],
    [
        "path",
        {
            d: "M6 18a4 4 0 0 1-2-7.464",
            key: "k1g0md"
        }
    ],
    [
        "path",
        {
            d: "M6.003 5.125a4 4 0 0 0-2.526 5.77",
            key: "q97ue3"
        }
    ]
];
const Brain = (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"])("brain", __iconNode);
;
 //# sourceMappingURL=brain.js.map
}),
"[project]/aptiverse/aptiverse-ui/node_modules/lucide-react/dist/esm/icons/brain.js [app-rsc] (ecmascript) <export default as Brain>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Brain",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$brain$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$brain$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/lucide-react/dist/esm/icons/brain.js [app-rsc] (ecmascript)");
}),
"[project]/aptiverse/aptiverse-ui/node_modules/lucide-react/dist/esm/icons/triangle-alert.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ __turbopack_context__.s([
    "__iconNode",
    ()=>__iconNode,
    "default",
    ()=>TriangleAlert
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/lucide-react/dist/esm/createLucideIcon.js [app-rsc] (ecmascript)");
;
const __iconNode = [
    [
        "path",
        {
            d: "m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3",
            key: "wmoenq"
        }
    ],
    [
        "path",
        {
            d: "M12 9v4",
            key: "juzpu7"
        }
    ],
    [
        "path",
        {
            d: "M12 17h.01",
            key: "p32p05"
        }
    ]
];
const TriangleAlert = (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"])("triangle-alert", __iconNode);
;
 //# sourceMappingURL=triangle-alert.js.map
}),
"[project]/aptiverse/aptiverse-ui/node_modules/lucide-react/dist/esm/icons/triangle-alert.js [app-rsc] (ecmascript) <export default as AlertTriangle>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AlertTriangle",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$triangle$2d$alert$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$triangle$2d$alert$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/lucide-react/dist/esm/icons/triangle-alert.js [app-rsc] (ecmascript)");
}),
"[project]/aptiverse/aptiverse-ui/node_modules/lucide-react/dist/esm/icons/calendar.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ __turbopack_context__.s([
    "__iconNode",
    ()=>__iconNode,
    "default",
    ()=>Calendar
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/lucide-react/dist/esm/createLucideIcon.js [app-rsc] (ecmascript)");
;
const __iconNode = [
    [
        "path",
        {
            d: "M8 2v4",
            key: "1cmpym"
        }
    ],
    [
        "path",
        {
            d: "M16 2v4",
            key: "4m81vk"
        }
    ],
    [
        "rect",
        {
            width: "18",
            height: "18",
            x: "3",
            y: "4",
            rx: "2",
            key: "1hopcy"
        }
    ],
    [
        "path",
        {
            d: "M3 10h18",
            key: "8toen8"
        }
    ]
];
const Calendar = (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"])("calendar", __iconNode);
;
 //# sourceMappingURL=calendar.js.map
}),
"[project]/aptiverse/aptiverse-ui/node_modules/lucide-react/dist/esm/icons/calendar.js [app-rsc] (ecmascript) <export default as Calendar>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Calendar",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$calendar$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$calendar$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/lucide-react/dist/esm/icons/calendar.js [app-rsc] (ecmascript)");
}),
"[project]/aptiverse/aptiverse-ui/node_modules/lucide-react/dist/esm/icons/trending-up.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ __turbopack_context__.s([
    "__iconNode",
    ()=>__iconNode,
    "default",
    ()=>TrendingUp
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/lucide-react/dist/esm/createLucideIcon.js [app-rsc] (ecmascript)");
;
const __iconNode = [
    [
        "path",
        {
            d: "M16 7h6v6",
            key: "box55l"
        }
    ],
    [
        "path",
        {
            d: "m22 7-8.5 8.5-5-5L2 17",
            key: "1t1m79"
        }
    ]
];
const TrendingUp = (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"])("trending-up", __iconNode);
;
 //# sourceMappingURL=trending-up.js.map
}),
"[project]/aptiverse/aptiverse-ui/node_modules/lucide-react/dist/esm/icons/trending-up.js [app-rsc] (ecmascript) <export default as TrendingUp>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "TrendingUp",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trending$2d$up$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trending$2d$up$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/lucide-react/dist/esm/icons/trending-up.js [app-rsc] (ecmascript)");
}),
"[project]/aptiverse/aptiverse-ui/node_modules/lucide-react/dist/esm/icons/zap.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ __turbopack_context__.s([
    "__iconNode",
    ()=>__iconNode,
    "default",
    ()=>Zap
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/lucide-react/dist/esm/createLucideIcon.js [app-rsc] (ecmascript)");
;
const __iconNode = [
    [
        "path",
        {
            d: "M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z",
            key: "1xq2db"
        }
    ]
];
const Zap = (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"])("zap", __iconNode);
;
 //# sourceMappingURL=zap.js.map
}),
"[project]/aptiverse/aptiverse-ui/node_modules/lucide-react/dist/esm/icons/zap.js [app-rsc] (ecmascript) <export default as Zap>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Zap",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$zap$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$zap$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/lucide-react/dist/esm/icons/zap.js [app-rsc] (ecmascript)");
}),
"[project]/aptiverse/aptiverse-ui/node_modules/@babel/runtime/helpers/interopRequireDefault.js [app-rsc] (ecmascript)", ((__turbopack_context__, module, exports) => {

function _interopRequireDefault(e) {
    return e && e.__esModule ? e : {
        "default": e
    };
}
module.exports = _interopRequireDefault, module.exports.__esModule = true, module.exports["default"] = module.exports;
}),
"[project]/aptiverse/aptiverse-ui/node_modules/@babel/runtime/helpers/OverloadYield.js [app-rsc] (ecmascript)", ((__turbopack_context__, module, exports) => {

function _OverloadYield(e, d) {
    this.v = e, this.k = d;
}
module.exports = _OverloadYield, module.exports.__esModule = true, module.exports["default"] = module.exports;
}),
"[project]/aptiverse/aptiverse-ui/node_modules/@babel/runtime/helpers/regeneratorDefine.js [app-rsc] (ecmascript)", ((__turbopack_context__, module, exports) => {

function _regeneratorDefine(e, r, n, t) {
    var i = Object.defineProperty;
    try {
        i({}, "", {});
    } catch (e) {
        i = 0;
    }
    module.exports = _regeneratorDefine = function regeneratorDefine(e, r, n, t) {
        function o(r, n) {
            _regeneratorDefine(e, r, function(e) {
                return this._invoke(r, n, e);
            });
        }
        r ? i ? i(e, r, {
            value: n,
            enumerable: !t,
            configurable: !t,
            writable: !t
        }) : e[r] = n : (o("next", 0), o("throw", 1), o("return", 2));
    }, module.exports.__esModule = true, module.exports["default"] = module.exports, _regeneratorDefine(e, r, n, t);
}
module.exports = _regeneratorDefine, module.exports.__esModule = true, module.exports["default"] = module.exports;
}),
"[project]/aptiverse/aptiverse-ui/node_modules/@babel/runtime/helpers/regenerator.js [app-rsc] (ecmascript)", ((__turbopack_context__, module, exports) => {

var regeneratorDefine = __turbopack_context__.r("[project]/aptiverse/aptiverse-ui/node_modules/@babel/runtime/helpers/regeneratorDefine.js [app-rsc] (ecmascript)");
function _regenerator() {
    /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/babel/babel/blob/main/packages/babel-helpers/LICENSE */ var e, t, r = "function" == typeof Symbol ? Symbol : {}, n = r.iterator || "@@iterator", o = r.toStringTag || "@@toStringTag";
    function i(r, n, o, i) {
        var c = n && n.prototype instanceof Generator ? n : Generator, u = Object.create(c.prototype);
        return regeneratorDefine(u, "_invoke", function(r, n, o) {
            var i, c, u, f = 0, p = o || [], y = !1, G = {
                p: 0,
                n: 0,
                v: e,
                a: d,
                f: d.bind(e, 4),
                d: function d(t, r) {
                    return i = t, c = 0, u = e, G.n = r, a;
                }
            };
            function d(r, n) {
                for(c = r, u = n, t = 0; !y && f && !o && t < p.length; t++){
                    var o, i = p[t], d = G.p, l = i[2];
                    r > 3 ? (o = l === n) && (u = i[(c = i[4]) ? 5 : (c = 3, 3)], i[4] = i[5] = e) : i[0] <= d && ((o = r < 2 && d < i[1]) ? (c = 0, G.v = n, G.n = i[1]) : d < l && (o = r < 3 || i[0] > n || n > l) && (i[4] = r, i[5] = n, G.n = l, c = 0));
                }
                if (o || r > 1) return a;
                throw y = !0, n;
            }
            return function(o, p, l) {
                if (f > 1) throw TypeError("Generator is already running");
                for(y && 1 === p && d(p, l), c = p, u = l; (t = c < 2 ? e : u) || !y;){
                    i || (c ? c < 3 ? (c > 1 && (G.n = -1), d(c, u)) : G.n = u : G.v = u);
                    try {
                        if (f = 2, i) {
                            if (c || (o = "next"), t = i[o]) {
                                if (!(t = t.call(i, u))) throw TypeError("iterator result is not an object");
                                if (!t.done) return t;
                                u = t.value, c < 2 && (c = 0);
                            } else 1 === c && (t = i["return"]) && t.call(i), c < 2 && (u = TypeError("The iterator does not provide a '" + o + "' method"), c = 1);
                            i = e;
                        } else if ((t = (y = G.n < 0) ? u : r.call(n, G)) !== a) break;
                    } catch (t) {
                        i = e, c = 1, u = t;
                    } finally{
                        f = 1;
                    }
                }
                return {
                    value: t,
                    done: y
                };
            };
        }(r, o, i), !0), u;
    }
    var a = {};
    function Generator() {}
    function GeneratorFunction() {}
    function GeneratorFunctionPrototype() {}
    t = Object.getPrototypeOf;
    var c = [][n] ? t(t([][n]())) : (regeneratorDefine(t = {}, n, function() {
        return this;
    }), t), u = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(c);
    function f(e) {
        return Object.setPrototypeOf ? Object.setPrototypeOf(e, GeneratorFunctionPrototype) : (e.__proto__ = GeneratorFunctionPrototype, regeneratorDefine(e, o, "GeneratorFunction")), e.prototype = Object.create(u), e;
    }
    return GeneratorFunction.prototype = GeneratorFunctionPrototype, regeneratorDefine(u, "constructor", GeneratorFunctionPrototype), regeneratorDefine(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = "GeneratorFunction", regeneratorDefine(GeneratorFunctionPrototype, o, "GeneratorFunction"), regeneratorDefine(u), regeneratorDefine(u, o, "Generator"), regeneratorDefine(u, n, function() {
        return this;
    }), regeneratorDefine(u, "toString", function() {
        return "[object Generator]";
    }), (module.exports = _regenerator = function _regenerator() {
        return {
            w: i,
            m: f
        };
    }, module.exports.__esModule = true, module.exports["default"] = module.exports)();
}
module.exports = _regenerator, module.exports.__esModule = true, module.exports["default"] = module.exports;
}),
"[project]/aptiverse/aptiverse-ui/node_modules/@babel/runtime/helpers/regeneratorAsyncIterator.js [app-rsc] (ecmascript)", ((__turbopack_context__, module, exports) => {

var OverloadYield = __turbopack_context__.r("[project]/aptiverse/aptiverse-ui/node_modules/@babel/runtime/helpers/OverloadYield.js [app-rsc] (ecmascript)");
var regeneratorDefine = __turbopack_context__.r("[project]/aptiverse/aptiverse-ui/node_modules/@babel/runtime/helpers/regeneratorDefine.js [app-rsc] (ecmascript)");
function AsyncIterator(t, e) {
    function n(r, o, i, f) {
        try {
            var c = t[r](o), u = c.value;
            return u instanceof OverloadYield ? e.resolve(u.v).then(function(t) {
                n("next", t, i, f);
            }, function(t) {
                n("throw", t, i, f);
            }) : e.resolve(u).then(function(t) {
                c.value = t, i(c);
            }, function(t) {
                return n("throw", t, i, f);
            });
        } catch (t) {
            f(t);
        }
    }
    var r;
    this.next || (regeneratorDefine(AsyncIterator.prototype), regeneratorDefine(AsyncIterator.prototype, "function" == typeof Symbol && Symbol.asyncIterator || "@asyncIterator", function() {
        return this;
    })), regeneratorDefine(this, "_invoke", function(t, o, i) {
        function f() {
            return new e(function(e, r) {
                n(t, i, e, r);
            });
        }
        return r = r ? r.then(f, f) : f();
    }, !0);
}
module.exports = AsyncIterator, module.exports.__esModule = true, module.exports["default"] = module.exports;
}),
"[project]/aptiverse/aptiverse-ui/node_modules/@babel/runtime/helpers/regeneratorAsyncGen.js [app-rsc] (ecmascript)", ((__turbopack_context__, module, exports) => {

var regenerator = __turbopack_context__.r("[project]/aptiverse/aptiverse-ui/node_modules/@babel/runtime/helpers/regenerator.js [app-rsc] (ecmascript)");
var regeneratorAsyncIterator = __turbopack_context__.r("[project]/aptiverse/aptiverse-ui/node_modules/@babel/runtime/helpers/regeneratorAsyncIterator.js [app-rsc] (ecmascript)");
function _regeneratorAsyncGen(r, e, t, o, n) {
    return new regeneratorAsyncIterator(regenerator().w(r, e, t, o), n || Promise);
}
module.exports = _regeneratorAsyncGen, module.exports.__esModule = true, module.exports["default"] = module.exports;
}),
"[project]/aptiverse/aptiverse-ui/node_modules/@babel/runtime/helpers/regeneratorAsync.js [app-rsc] (ecmascript)", ((__turbopack_context__, module, exports) => {

var regeneratorAsyncGen = __turbopack_context__.r("[project]/aptiverse/aptiverse-ui/node_modules/@babel/runtime/helpers/regeneratorAsyncGen.js [app-rsc] (ecmascript)");
function _regeneratorAsync(n, e, r, t, o) {
    var a = regeneratorAsyncGen(n, e, r, t, o);
    return a.next().then(function(n) {
        return n.done ? n.value : a.next();
    });
}
module.exports = _regeneratorAsync, module.exports.__esModule = true, module.exports["default"] = module.exports;
}),
"[project]/aptiverse/aptiverse-ui/node_modules/@babel/runtime/helpers/regeneratorKeys.js [app-rsc] (ecmascript)", ((__turbopack_context__, module, exports) => {

function _regeneratorKeys(e) {
    var n = Object(e), r = [];
    for(var t in n)r.unshift(t);
    return function e() {
        for(; r.length;)if ((t = r.pop()) in n) return e.value = t, e.done = !1, e;
        return e.done = !0, e;
    };
}
module.exports = _regeneratorKeys, module.exports.__esModule = true, module.exports["default"] = module.exports;
}),
"[project]/aptiverse/aptiverse-ui/node_modules/@babel/runtime/helpers/typeof.js [app-rsc] (ecmascript)", ((__turbopack_context__, module, exports) => {

function _typeof(o) {
    "@babel/helpers - typeof";
    return module.exports = _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(o) {
        return typeof o;
    } : function(o) {
        return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o;
    }, module.exports.__esModule = true, module.exports["default"] = module.exports, _typeof(o);
}
module.exports = _typeof, module.exports.__esModule = true, module.exports["default"] = module.exports;
}),
"[project]/aptiverse/aptiverse-ui/node_modules/@babel/runtime/helpers/regeneratorValues.js [app-rsc] (ecmascript)", ((__turbopack_context__, module, exports) => {

var _typeof = __turbopack_context__.r("[project]/aptiverse/aptiverse-ui/node_modules/@babel/runtime/helpers/typeof.js [app-rsc] (ecmascript)")["default"];
function _regeneratorValues(e) {
    if (null != e) {
        var t = e["function" == typeof Symbol && Symbol.iterator || "@@iterator"], r = 0;
        if (t) return t.call(e);
        if ("function" == typeof e.next) return e;
        if (!isNaN(e.length)) return {
            next: function next() {
                return e && r >= e.length && (e = void 0), {
                    value: e && e[r++],
                    done: !e
                };
            }
        };
    }
    throw new TypeError(_typeof(e) + " is not iterable");
}
module.exports = _regeneratorValues, module.exports.__esModule = true, module.exports["default"] = module.exports;
}),
"[project]/aptiverse/aptiverse-ui/node_modules/@babel/runtime/helpers/regeneratorRuntime.js [app-rsc] (ecmascript)", ((__turbopack_context__, module, exports) => {

var OverloadYield = __turbopack_context__.r("[project]/aptiverse/aptiverse-ui/node_modules/@babel/runtime/helpers/OverloadYield.js [app-rsc] (ecmascript)");
var regenerator = __turbopack_context__.r("[project]/aptiverse/aptiverse-ui/node_modules/@babel/runtime/helpers/regenerator.js [app-rsc] (ecmascript)");
var regeneratorAsync = __turbopack_context__.r("[project]/aptiverse/aptiverse-ui/node_modules/@babel/runtime/helpers/regeneratorAsync.js [app-rsc] (ecmascript)");
var regeneratorAsyncGen = __turbopack_context__.r("[project]/aptiverse/aptiverse-ui/node_modules/@babel/runtime/helpers/regeneratorAsyncGen.js [app-rsc] (ecmascript)");
var regeneratorAsyncIterator = __turbopack_context__.r("[project]/aptiverse/aptiverse-ui/node_modules/@babel/runtime/helpers/regeneratorAsyncIterator.js [app-rsc] (ecmascript)");
var regeneratorKeys = __turbopack_context__.r("[project]/aptiverse/aptiverse-ui/node_modules/@babel/runtime/helpers/regeneratorKeys.js [app-rsc] (ecmascript)");
var regeneratorValues = __turbopack_context__.r("[project]/aptiverse/aptiverse-ui/node_modules/@babel/runtime/helpers/regeneratorValues.js [app-rsc] (ecmascript)");
function _regeneratorRuntime() {
    "use strict";
    var r = regenerator(), e = r.m(_regeneratorRuntime), t = (Object.getPrototypeOf ? Object.getPrototypeOf(e) : e.__proto__).constructor;
    function n(r) {
        var e = "function" == typeof r && r.constructor;
        return !!e && (e === t || "GeneratorFunction" === (e.displayName || e.name));
    }
    var o = {
        "throw": 1,
        "return": 2,
        "break": 3,
        "continue": 3
    };
    function a(r) {
        var e, t;
        return function(n) {
            e || (e = {
                stop: function stop() {
                    return t(n.a, 2);
                },
                "catch": function _catch() {
                    return n.v;
                },
                abrupt: function abrupt(r, e) {
                    return t(n.a, o[r], e);
                },
                delegateYield: function delegateYield(r, o, a) {
                    return e.resultName = o, t(n.d, regeneratorValues(r), a);
                },
                finish: function finish(r) {
                    return t(n.f, r);
                }
            }, t = function t(r, _t, o) {
                n.p = e.prev, n.n = e.next;
                try {
                    return r(_t, o);
                } finally{
                    e.next = n.n;
                }
            }), e.resultName && (e[e.resultName] = n.v, e.resultName = void 0), e.sent = n.v, e.next = n.n;
            try {
                return r.call(this, e);
            } finally{
                n.p = e.prev, n.n = e.next;
            }
        };
    }
    return (module.exports = _regeneratorRuntime = function _regeneratorRuntime() {
        return {
            wrap: function wrap(e, t, n, o) {
                return r.w(a(e), t, n, o && o.reverse());
            },
            isGeneratorFunction: n,
            mark: r.m,
            awrap: function awrap(r, e) {
                return new OverloadYield(r, e);
            },
            AsyncIterator: regeneratorAsyncIterator,
            async: function async(r, e, t, o, u) {
                return (n(e) ? regeneratorAsyncGen : regeneratorAsync)(a(r), e, t, o, u);
            },
            keys: regeneratorKeys,
            values: regeneratorValues
        };
    }, module.exports.__esModule = true, module.exports["default"] = module.exports)();
}
module.exports = _regeneratorRuntime, module.exports.__esModule = true, module.exports["default"] = module.exports;
}),
"[project]/aptiverse/aptiverse-ui/node_modules/@babel/runtime/regenerator/index.js [app-rsc] (ecmascript)", ((__turbopack_context__, module, exports) => {

// TODO(Babel 8): Remove this file.
var runtime = __turbopack_context__.r("[project]/aptiverse/aptiverse-ui/node_modules/@babel/runtime/helpers/regeneratorRuntime.js [app-rsc] (ecmascript)")();
module.exports = runtime;
// Copied from https://github.com/facebook/regenerator/blob/main/packages/runtime/runtime.js#L736=
try {
    regeneratorRuntime = runtime;
} catch (accidentalStrictMode) {
    if (typeof globalThis === "object") {
        globalThis.regeneratorRuntime = runtime;
    } else {
        Function("r", "regeneratorRuntime = r")(runtime);
    }
}
}),
"[project]/aptiverse/aptiverse-ui/node_modules/@babel/runtime/helpers/toPrimitive.js [app-rsc] (ecmascript)", ((__turbopack_context__, module, exports) => {

var _typeof = __turbopack_context__.r("[project]/aptiverse/aptiverse-ui/node_modules/@babel/runtime/helpers/typeof.js [app-rsc] (ecmascript)")["default"];
function toPrimitive(t, r) {
    if ("object" != _typeof(t) || !t) return t;
    var e = t[Symbol.toPrimitive];
    if (void 0 !== e) {
        var i = e.call(t, r || "default");
        if ("object" != _typeof(i)) return i;
        throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return ("string" === r ? String : Number)(t);
}
module.exports = toPrimitive, module.exports.__esModule = true, module.exports["default"] = module.exports;
}),
"[project]/aptiverse/aptiverse-ui/node_modules/@babel/runtime/helpers/toPropertyKey.js [app-rsc] (ecmascript)", ((__turbopack_context__, module, exports) => {

var _typeof = __turbopack_context__.r("[project]/aptiverse/aptiverse-ui/node_modules/@babel/runtime/helpers/typeof.js [app-rsc] (ecmascript)")["default"];
var toPrimitive = __turbopack_context__.r("[project]/aptiverse/aptiverse-ui/node_modules/@babel/runtime/helpers/toPrimitive.js [app-rsc] (ecmascript)");
function toPropertyKey(t) {
    var i = toPrimitive(t, "string");
    return "symbol" == _typeof(i) ? i : i + "";
}
module.exports = toPropertyKey, module.exports.__esModule = true, module.exports["default"] = module.exports;
}),
"[project]/aptiverse/aptiverse-ui/node_modules/@babel/runtime/helpers/defineProperty.js [app-rsc] (ecmascript)", ((__turbopack_context__, module, exports) => {

var toPropertyKey = __turbopack_context__.r("[project]/aptiverse/aptiverse-ui/node_modules/@babel/runtime/helpers/toPropertyKey.js [app-rsc] (ecmascript)");
function _defineProperty(e, r, t) {
    return (r = toPropertyKey(r)) in e ? Object.defineProperty(e, r, {
        value: t,
        enumerable: !0,
        configurable: !0,
        writable: !0
    }) : e[r] = t, e;
}
module.exports = _defineProperty, module.exports.__esModule = true, module.exports["default"] = module.exports;
}),
"[project]/aptiverse/aptiverse-ui/node_modules/@babel/runtime/helpers/asyncToGenerator.js [app-rsc] (ecmascript)", ((__turbopack_context__, module, exports) => {

function asyncGeneratorStep(n, t, e, r, o, a, c) {
    try {
        var i = n[a](c), u = i.value;
    } catch (n) {
        return void e(n);
    }
    i.done ? t(u) : Promise.resolve(u).then(r, o);
}
function _asyncToGenerator(n) {
    return function() {
        var t = this, e = arguments;
        return new Promise(function(r, o) {
            var a = n.apply(t, e);
            function _next(n) {
                asyncGeneratorStep(a, r, o, _next, _throw, "next", n);
            }
            function _throw(n) {
                asyncGeneratorStep(a, r, o, _next, _throw, "throw", n);
            }
            _next(void 0);
        });
    };
}
module.exports = _asyncToGenerator, module.exports.__esModule = true, module.exports["default"] = module.exports;
}),
"[project]/aptiverse/aptiverse-ui/node_modules/@babel/runtime/helpers/classCallCheck.js [app-rsc] (ecmascript)", ((__turbopack_context__, module, exports) => {

function _classCallCheck(a, n) {
    if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function");
}
module.exports = _classCallCheck, module.exports.__esModule = true, module.exports["default"] = module.exports;
}),
"[project]/aptiverse/aptiverse-ui/node_modules/@babel/runtime/helpers/createClass.js [app-rsc] (ecmascript)", ((__turbopack_context__, module, exports) => {

var toPropertyKey = __turbopack_context__.r("[project]/aptiverse/aptiverse-ui/node_modules/@babel/runtime/helpers/toPropertyKey.js [app-rsc] (ecmascript)");
function _defineProperties(e, r) {
    for(var t = 0; t < r.length; t++){
        var o = r[t];
        o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, toPropertyKey(o.key), o);
    }
}
function _createClass(e, r, t) {
    return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", {
        writable: !1
    }), e;
}
module.exports = _createClass, module.exports.__esModule = true, module.exports["default"] = module.exports;
}),
"[project]/aptiverse/aptiverse-ui/node_modules/@babel/runtime/helpers/assertThisInitialized.js [app-rsc] (ecmascript)", ((__turbopack_context__, module, exports) => {

function _assertThisInitialized(e) {
    if (void 0 === e) throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    return e;
}
module.exports = _assertThisInitialized, module.exports.__esModule = true, module.exports["default"] = module.exports;
}),
"[project]/aptiverse/aptiverse-ui/node_modules/@babel/runtime/helpers/possibleConstructorReturn.js [app-rsc] (ecmascript)", ((__turbopack_context__, module, exports) => {

var _typeof = __turbopack_context__.r("[project]/aptiverse/aptiverse-ui/node_modules/@babel/runtime/helpers/typeof.js [app-rsc] (ecmascript)")["default"];
var assertThisInitialized = __turbopack_context__.r("[project]/aptiverse/aptiverse-ui/node_modules/@babel/runtime/helpers/assertThisInitialized.js [app-rsc] (ecmascript)");
function _possibleConstructorReturn(t, e) {
    if (e && ("object" == _typeof(e) || "function" == typeof e)) return e;
    if (void 0 !== e) throw new TypeError("Derived constructors may only return object or undefined");
    return assertThisInitialized(t);
}
module.exports = _possibleConstructorReturn, module.exports.__esModule = true, module.exports["default"] = module.exports;
}),
"[project]/aptiverse/aptiverse-ui/node_modules/@babel/runtime/helpers/getPrototypeOf.js [app-rsc] (ecmascript)", ((__turbopack_context__, module, exports) => {

function _getPrototypeOf(t) {
    return module.exports = _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function(t) {
        return t.__proto__ || Object.getPrototypeOf(t);
    }, module.exports.__esModule = true, module.exports["default"] = module.exports, _getPrototypeOf(t);
}
module.exports = _getPrototypeOf, module.exports.__esModule = true, module.exports["default"] = module.exports;
}),
"[project]/aptiverse/aptiverse-ui/node_modules/@babel/runtime/helpers/setPrototypeOf.js [app-rsc] (ecmascript)", ((__turbopack_context__, module, exports) => {

function _setPrototypeOf(t, e) {
    return module.exports = _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function(t, e) {
        return t.__proto__ = e, t;
    }, module.exports.__esModule = true, module.exports["default"] = module.exports, _setPrototypeOf(t, e);
}
module.exports = _setPrototypeOf, module.exports.__esModule = true, module.exports["default"] = module.exports;
}),
"[project]/aptiverse/aptiverse-ui/node_modules/@babel/runtime/helpers/inherits.js [app-rsc] (ecmascript)", ((__turbopack_context__, module, exports) => {

var setPrototypeOf = __turbopack_context__.r("[project]/aptiverse/aptiverse-ui/node_modules/@babel/runtime/helpers/setPrototypeOf.js [app-rsc] (ecmascript)");
function _inherits(t, e) {
    if ("function" != typeof e && null !== e) throw new TypeError("Super expression must either be null or a function");
    t.prototype = Object.create(e && e.prototype, {
        constructor: {
            value: t,
            writable: !0,
            configurable: !0
        }
    }), Object.defineProperty(t, "prototype", {
        writable: !1
    }), e && setPrototypeOf(t, e);
}
module.exports = _inherits, module.exports.__esModule = true, module.exports["default"] = module.exports;
}),
"[project]/aptiverse/aptiverse-ui/node_modules/@babel/runtime/helpers/isNativeFunction.js [app-rsc] (ecmascript)", ((__turbopack_context__, module, exports) => {

function _isNativeFunction(t) {
    try {
        return -1 !== Function.toString.call(t).indexOf("[native code]");
    } catch (n) {
        return "function" == typeof t;
    }
}
module.exports = _isNativeFunction, module.exports.__esModule = true, module.exports["default"] = module.exports;
}),
"[project]/aptiverse/aptiverse-ui/node_modules/@babel/runtime/helpers/isNativeReflectConstruct.js [app-rsc] (ecmascript)", ((__turbopack_context__, module, exports) => {

function _isNativeReflectConstruct() {
    try {
        var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function() {}));
    } catch (t) {}
    return (module.exports = _isNativeReflectConstruct = function _isNativeReflectConstruct() {
        return !!t;
    }, module.exports.__esModule = true, module.exports["default"] = module.exports)();
}
module.exports = _isNativeReflectConstruct, module.exports.__esModule = true, module.exports["default"] = module.exports;
}),
"[project]/aptiverse/aptiverse-ui/node_modules/@babel/runtime/helpers/construct.js [app-rsc] (ecmascript)", ((__turbopack_context__, module, exports) => {

var isNativeReflectConstruct = __turbopack_context__.r("[project]/aptiverse/aptiverse-ui/node_modules/@babel/runtime/helpers/isNativeReflectConstruct.js [app-rsc] (ecmascript)");
var setPrototypeOf = __turbopack_context__.r("[project]/aptiverse/aptiverse-ui/node_modules/@babel/runtime/helpers/setPrototypeOf.js [app-rsc] (ecmascript)");
function _construct(t, e, r) {
    if (isNativeReflectConstruct()) return Reflect.construct.apply(null, arguments);
    var o = [
        null
    ];
    o.push.apply(o, e);
    var p = new (t.bind.apply(t, o))();
    return r && setPrototypeOf(p, r.prototype), p;
}
module.exports = _construct, module.exports.__esModule = true, module.exports["default"] = module.exports;
}),
"[project]/aptiverse/aptiverse-ui/node_modules/@babel/runtime/helpers/wrapNativeSuper.js [app-rsc] (ecmascript)", ((__turbopack_context__, module, exports) => {

var getPrototypeOf = __turbopack_context__.r("[project]/aptiverse/aptiverse-ui/node_modules/@babel/runtime/helpers/getPrototypeOf.js [app-rsc] (ecmascript)");
var setPrototypeOf = __turbopack_context__.r("[project]/aptiverse/aptiverse-ui/node_modules/@babel/runtime/helpers/setPrototypeOf.js [app-rsc] (ecmascript)");
var isNativeFunction = __turbopack_context__.r("[project]/aptiverse/aptiverse-ui/node_modules/@babel/runtime/helpers/isNativeFunction.js [app-rsc] (ecmascript)");
var construct = __turbopack_context__.r("[project]/aptiverse/aptiverse-ui/node_modules/@babel/runtime/helpers/construct.js [app-rsc] (ecmascript)");
function _wrapNativeSuper(t) {
    var r = "function" == typeof Map ? new Map() : void 0;
    return module.exports = _wrapNativeSuper = function _wrapNativeSuper(t) {
        if (null === t || !isNativeFunction(t)) return t;
        if ("function" != typeof t) throw new TypeError("Super expression must either be null or a function");
        if (void 0 !== r) {
            if (r.has(t)) return r.get(t);
            r.set(t, Wrapper);
        }
        function Wrapper() {
            return construct(t, arguments, getPrototypeOf(this).constructor);
        }
        return Wrapper.prototype = Object.create(t.prototype, {
            constructor: {
                value: Wrapper,
                enumerable: !1,
                writable: !0,
                configurable: !0
            }
        }), setPrototypeOf(Wrapper, t);
    }, module.exports.__esModule = true, module.exports["default"] = module.exports, _wrapNativeSuper(t);
}
module.exports = _wrapNativeSuper, module.exports.__esModule = true, module.exports["default"] = module.exports;
}),
"[project]/aptiverse/aptiverse-ui/node_modules/@babel/runtime/helpers/extends.js [app-rsc] (ecmascript)", ((__turbopack_context__, module, exports) => {

function _extends() {
    return module.exports = _extends = ("TURBOPACK compile-time truthy", 1) ? Object.assign.bind() : "TURBOPACK unreachable", module.exports.__esModule = true, module.exports["default"] = module.exports, _extends.apply(null, arguments);
}
module.exports = _extends, module.exports.__esModule = true, module.exports["default"] = module.exports;
}),
"[project]/aptiverse/aptiverse-ui/node_modules/oidc-token-hash/lib/index.js [app-rsc] (ecmascript)", ((__turbopack_context__, module, exports) => {

const { strict: assert } = __turbopack_context__.r("[externals]/assert [external] (assert, cjs)");
const { createHash } = __turbopack_context__.r("[externals]/crypto [external] (crypto, cjs)");
const { format } = __turbopack_context__.r("[externals]/util [external] (util, cjs)");
let encode;
if (Buffer.isEncoding('base64url')) {
    encode = (input)=>input.toString('base64url');
} else {
    const fromBase64 = (base64)=>base64.replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
    encode = (input)=>fromBase64(input.toString('base64'));
}
/** SPECIFICATION
 * Its (_hash) value is the base64url encoding of the left-most half of the hash of the octets of
 * the ASCII representation of the token value, where the hash algorithm used is the hash algorithm
 * used in the alg Header Parameter of the ID Token's JOSE Header. For instance, if the alg is
 * RS256, hash the token value with SHA-256, then take the left-most 128 bits and base64url encode
 * them. The _hash value is a case sensitive string.
 */ /**
 * @name getHash
 * @api private
 *
 * returns the sha length based off the JOSE alg heade value, defaults to sha256
 *
 * @param token {String} token value to generate the hash from
 * @param alg {String} ID Token JOSE header alg value (i.e. RS256, HS384, ES512, PS256)
 * @param [crv] {String} For EdDSA the curve decides what hash algorithm is used. Required for EdDSA
 */ function getHash(alg, crv) {
    switch(alg){
        case 'HS256':
        case 'RS256':
        case 'PS256':
        case 'ES256':
        case 'ES256K':
            return createHash('sha256');
        case 'HS384':
        case 'RS384':
        case 'PS384':
        case 'ES384':
            return createHash('sha384');
        case 'HS512':
        case 'RS512':
        case 'PS512':
        case 'ES512':
        case 'Ed25519':
            return createHash('sha512');
        case 'Ed448':
            return createHash('shake256', {
                outputLength: 114
            });
        case 'ML-DSA-44':
        case 'ML-DSA-65':
        case 'ML-DSA-87':
            return createHash('shake256', {
                outputLength: 64
            });
        case 'EdDSA':
            switch(crv){
                case 'Ed25519':
                    return createHash('sha512');
                case 'Ed448':
                    return createHash('shake256', {
                        outputLength: 114
                    });
                default:
                    throw new TypeError('unrecognized or invalid EdDSA curve provided');
            }
        default:
            throw new TypeError('unrecognized or invalid JWS algorithm provided');
    }
}
function generate(token, alg, crv) {
    const digest = getHash(alg, crv).update(token).digest();
    return encode(digest.slice(0, digest.length / 2));
}
function validate(names, actual, source, alg, crv) {
    if (typeof names.claim !== 'string' || !names.claim) {
        throw new TypeError('names.claim must be a non-empty string');
    }
    if (typeof names.source !== 'string' || !names.source) {
        throw new TypeError('names.source must be a non-empty string');
    }
    assert(typeof actual === 'string' && actual, `${names.claim} must be a non-empty string`);
    assert(typeof source === 'string' && source, `${names.source} must be a non-empty string`);
    let expected;
    let msg;
    try {
        expected = generate(source, alg, crv);
    } catch (err) {
        msg = format('%s could not be validated (%s)', names.claim, err.message);
    }
    msg = msg || format('%s mismatch, expected %s, got: %s', names.claim, expected, actual);
    assert.equal(expected, actual, msg);
}
module.exports = {
    validate,
    generate
};
}),
"[project]/aptiverse/aptiverse-ui/node_modules/yallist/iterator.js [app-rsc] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

module.exports = function(Yallist) {
    Yallist.prototype[Symbol.iterator] = function*() {
        for(let walker = this.head; walker; walker = walker.next){
            yield walker.value;
        }
    };
};
}),
"[project]/aptiverse/aptiverse-ui/node_modules/yallist/yallist.js [app-rsc] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

module.exports = Yallist;
Yallist.Node = Node;
Yallist.create = Yallist;
function Yallist(list) {
    var self = this;
    if (!(self instanceof Yallist)) {
        self = new Yallist();
    }
    self.tail = null;
    self.head = null;
    self.length = 0;
    if (list && typeof list.forEach === 'function') {
        list.forEach(function(item) {
            self.push(item);
        });
    } else if (arguments.length > 0) {
        for(var i = 0, l = arguments.length; i < l; i++){
            self.push(arguments[i]);
        }
    }
    return self;
}
Yallist.prototype.removeNode = function(node) {
    if (node.list !== this) {
        throw new Error('removing node which does not belong to this list');
    }
    var next = node.next;
    var prev = node.prev;
    if (next) {
        next.prev = prev;
    }
    if (prev) {
        prev.next = next;
    }
    if (node === this.head) {
        this.head = next;
    }
    if (node === this.tail) {
        this.tail = prev;
    }
    node.list.length--;
    node.next = null;
    node.prev = null;
    node.list = null;
    return next;
};
Yallist.prototype.unshiftNode = function(node) {
    if (node === this.head) {
        return;
    }
    if (node.list) {
        node.list.removeNode(node);
    }
    var head = this.head;
    node.list = this;
    node.next = head;
    if (head) {
        head.prev = node;
    }
    this.head = node;
    if (!this.tail) {
        this.tail = node;
    }
    this.length++;
};
Yallist.prototype.pushNode = function(node) {
    if (node === this.tail) {
        return;
    }
    if (node.list) {
        node.list.removeNode(node);
    }
    var tail = this.tail;
    node.list = this;
    node.prev = tail;
    if (tail) {
        tail.next = node;
    }
    this.tail = node;
    if (!this.head) {
        this.head = node;
    }
    this.length++;
};
Yallist.prototype.push = function() {
    for(var i = 0, l = arguments.length; i < l; i++){
        push(this, arguments[i]);
    }
    return this.length;
};
Yallist.prototype.unshift = function() {
    for(var i = 0, l = arguments.length; i < l; i++){
        unshift(this, arguments[i]);
    }
    return this.length;
};
Yallist.prototype.pop = function() {
    if (!this.tail) {
        return undefined;
    }
    var res = this.tail.value;
    this.tail = this.tail.prev;
    if (this.tail) {
        this.tail.next = null;
    } else {
        this.head = null;
    }
    this.length--;
    return res;
};
Yallist.prototype.shift = function() {
    if (!this.head) {
        return undefined;
    }
    var res = this.head.value;
    this.head = this.head.next;
    if (this.head) {
        this.head.prev = null;
    } else {
        this.tail = null;
    }
    this.length--;
    return res;
};
Yallist.prototype.forEach = function(fn, thisp) {
    thisp = thisp || this;
    for(var walker = this.head, i = 0; walker !== null; i++){
        fn.call(thisp, walker.value, i, this);
        walker = walker.next;
    }
};
Yallist.prototype.forEachReverse = function(fn, thisp) {
    thisp = thisp || this;
    for(var walker = this.tail, i = this.length - 1; walker !== null; i--){
        fn.call(thisp, walker.value, i, this);
        walker = walker.prev;
    }
};
Yallist.prototype.get = function(n) {
    for(var i = 0, walker = this.head; walker !== null && i < n; i++){
        // abort out of the list early if we hit a cycle
        walker = walker.next;
    }
    if (i === n && walker !== null) {
        return walker.value;
    }
};
Yallist.prototype.getReverse = function(n) {
    for(var i = 0, walker = this.tail; walker !== null && i < n; i++){
        // abort out of the list early if we hit a cycle
        walker = walker.prev;
    }
    if (i === n && walker !== null) {
        return walker.value;
    }
};
Yallist.prototype.map = function(fn, thisp) {
    thisp = thisp || this;
    var res = new Yallist();
    for(var walker = this.head; walker !== null;){
        res.push(fn.call(thisp, walker.value, this));
        walker = walker.next;
    }
    return res;
};
Yallist.prototype.mapReverse = function(fn, thisp) {
    thisp = thisp || this;
    var res = new Yallist();
    for(var walker = this.tail; walker !== null;){
        res.push(fn.call(thisp, walker.value, this));
        walker = walker.prev;
    }
    return res;
};
Yallist.prototype.reduce = function(fn, initial) {
    var acc;
    var walker = this.head;
    if (arguments.length > 1) {
        acc = initial;
    } else if (this.head) {
        walker = this.head.next;
        acc = this.head.value;
    } else {
        throw new TypeError('Reduce of empty list with no initial value');
    }
    for(var i = 0; walker !== null; i++){
        acc = fn(acc, walker.value, i);
        walker = walker.next;
    }
    return acc;
};
Yallist.prototype.reduceReverse = function(fn, initial) {
    var acc;
    var walker = this.tail;
    if (arguments.length > 1) {
        acc = initial;
    } else if (this.tail) {
        walker = this.tail.prev;
        acc = this.tail.value;
    } else {
        throw new TypeError('Reduce of empty list with no initial value');
    }
    for(var i = this.length - 1; walker !== null; i--){
        acc = fn(acc, walker.value, i);
        walker = walker.prev;
    }
    return acc;
};
Yallist.prototype.toArray = function() {
    var arr = new Array(this.length);
    for(var i = 0, walker = this.head; walker !== null; i++){
        arr[i] = walker.value;
        walker = walker.next;
    }
    return arr;
};
Yallist.prototype.toArrayReverse = function() {
    var arr = new Array(this.length);
    for(var i = 0, walker = this.tail; walker !== null; i++){
        arr[i] = walker.value;
        walker = walker.prev;
    }
    return arr;
};
Yallist.prototype.slice = function(from, to) {
    to = to || this.length;
    if (to < 0) {
        to += this.length;
    }
    from = from || 0;
    if (from < 0) {
        from += this.length;
    }
    var ret = new Yallist();
    if (to < from || to < 0) {
        return ret;
    }
    if (from < 0) {
        from = 0;
    }
    if (to > this.length) {
        to = this.length;
    }
    for(var i = 0, walker = this.head; walker !== null && i < from; i++){
        walker = walker.next;
    }
    for(; walker !== null && i < to; i++, walker = walker.next){
        ret.push(walker.value);
    }
    return ret;
};
Yallist.prototype.sliceReverse = function(from, to) {
    to = to || this.length;
    if (to < 0) {
        to += this.length;
    }
    from = from || 0;
    if (from < 0) {
        from += this.length;
    }
    var ret = new Yallist();
    if (to < from || to < 0) {
        return ret;
    }
    if (from < 0) {
        from = 0;
    }
    if (to > this.length) {
        to = this.length;
    }
    for(var i = this.length, walker = this.tail; walker !== null && i > to; i--){
        walker = walker.prev;
    }
    for(; walker !== null && i > from; i--, walker = walker.prev){
        ret.push(walker.value);
    }
    return ret;
};
Yallist.prototype.splice = function(start, deleteCount, ...nodes) {
    if (start > this.length) {
        start = this.length - 1;
    }
    if (start < 0) {
        start = this.length + start;
    }
    for(var i = 0, walker = this.head; walker !== null && i < start; i++){
        walker = walker.next;
    }
    var ret = [];
    for(var i = 0; walker && i < deleteCount; i++){
        ret.push(walker.value);
        walker = this.removeNode(walker);
    }
    if (walker === null) {
        walker = this.tail;
    }
    if (walker !== this.head && walker !== this.tail) {
        walker = walker.prev;
    }
    for(var i = 0; i < nodes.length; i++){
        walker = insert(this, walker, nodes[i]);
    }
    return ret;
};
Yallist.prototype.reverse = function() {
    var head = this.head;
    var tail = this.tail;
    for(var walker = head; walker !== null; walker = walker.prev){
        var p = walker.prev;
        walker.prev = walker.next;
        walker.next = p;
    }
    this.head = tail;
    this.tail = head;
    return this;
};
function insert(self, node, value) {
    var inserted = node === self.head ? new Node(value, null, node, self) : new Node(value, node, node.next, self);
    if (inserted.next === null) {
        self.tail = inserted;
    }
    if (inserted.prev === null) {
        self.head = inserted;
    }
    self.length++;
    return inserted;
}
function push(self, item) {
    self.tail = new Node(item, self.tail, null, self);
    if (!self.head) {
        self.head = self.tail;
    }
    self.length++;
}
function unshift(self, item) {
    self.head = new Node(item, null, self.head, self);
    if (!self.tail) {
        self.tail = self.head;
    }
    self.length++;
}
function Node(value, prev, next, list) {
    if (!(this instanceof Node)) {
        return new Node(value, prev, next, list);
    }
    this.list = list;
    this.value = value;
    if (prev) {
        prev.next = this;
        this.prev = prev;
    } else {
        this.prev = null;
    }
    if (next) {
        next.prev = this;
        this.next = next;
    } else {
        this.next = null;
    }
}
try {
    // add if support for Symbol.iterator is present
    __turbopack_context__.r("[project]/aptiverse/aptiverse-ui/node_modules/yallist/iterator.js [app-rsc] (ecmascript)")(Yallist);
} catch (er) {}
}),
"[project]/aptiverse/aptiverse-ui/node_modules/lru-cache/index.js [app-rsc] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

// A linked list to keep track of recently-used-ness
const Yallist = __turbopack_context__.r("[project]/aptiverse/aptiverse-ui/node_modules/yallist/yallist.js [app-rsc] (ecmascript)");
const MAX = Symbol('max');
const LENGTH = Symbol('length');
const LENGTH_CALCULATOR = Symbol('lengthCalculator');
const ALLOW_STALE = Symbol('allowStale');
const MAX_AGE = Symbol('maxAge');
const DISPOSE = Symbol('dispose');
const NO_DISPOSE_ON_SET = Symbol('noDisposeOnSet');
const LRU_LIST = Symbol('lruList');
const CACHE = Symbol('cache');
const UPDATE_AGE_ON_GET = Symbol('updateAgeOnGet');
const naiveLength = ()=>1;
// lruList is a yallist where the head is the youngest
// item, and the tail is the oldest.  the list contains the Hit
// objects as the entries.
// Each Hit object has a reference to its Yallist.Node.  This
// never changes.
//
// cache is a Map (or PseudoMap) that matches the keys to
// the Yallist.Node object.
class LRUCache {
    constructor(options){
        if (typeof options === 'number') options = {
            max: options
        };
        if (!options) options = {};
        if (options.max && (typeof options.max !== 'number' || options.max < 0)) throw new TypeError('max must be a non-negative number');
        // Kind of weird to have a default max of Infinity, but oh well.
        const max = this[MAX] = options.max || Infinity;
        const lc = options.length || naiveLength;
        this[LENGTH_CALCULATOR] = typeof lc !== 'function' ? naiveLength : lc;
        this[ALLOW_STALE] = options.stale || false;
        if (options.maxAge && typeof options.maxAge !== 'number') throw new TypeError('maxAge must be a number');
        this[MAX_AGE] = options.maxAge || 0;
        this[DISPOSE] = options.dispose;
        this[NO_DISPOSE_ON_SET] = options.noDisposeOnSet || false;
        this[UPDATE_AGE_ON_GET] = options.updateAgeOnGet || false;
        this.reset();
    }
    // resize the cache when the max changes.
    set max(mL) {
        if (typeof mL !== 'number' || mL < 0) throw new TypeError('max must be a non-negative number');
        this[MAX] = mL || Infinity;
        trim(this);
    }
    get max() {
        return this[MAX];
    }
    set allowStale(allowStale) {
        this[ALLOW_STALE] = !!allowStale;
    }
    get allowStale() {
        return this[ALLOW_STALE];
    }
    set maxAge(mA) {
        if (typeof mA !== 'number') throw new TypeError('maxAge must be a non-negative number');
        this[MAX_AGE] = mA;
        trim(this);
    }
    get maxAge() {
        return this[MAX_AGE];
    }
    // resize the cache when the lengthCalculator changes.
    set lengthCalculator(lC) {
        if (typeof lC !== 'function') lC = naiveLength;
        if (lC !== this[LENGTH_CALCULATOR]) {
            this[LENGTH_CALCULATOR] = lC;
            this[LENGTH] = 0;
            this[LRU_LIST].forEach((hit)=>{
                hit.length = this[LENGTH_CALCULATOR](hit.value, hit.key);
                this[LENGTH] += hit.length;
            });
        }
        trim(this);
    }
    get lengthCalculator() {
        return this[LENGTH_CALCULATOR];
    }
    get length() {
        return this[LENGTH];
    }
    get itemCount() {
        return this[LRU_LIST].length;
    }
    rforEach(fn, thisp) {
        thisp = thisp || this;
        for(let walker = this[LRU_LIST].tail; walker !== null;){
            const prev = walker.prev;
            forEachStep(this, fn, walker, thisp);
            walker = prev;
        }
    }
    forEach(fn, thisp) {
        thisp = thisp || this;
        for(let walker = this[LRU_LIST].head; walker !== null;){
            const next = walker.next;
            forEachStep(this, fn, walker, thisp);
            walker = next;
        }
    }
    keys() {
        return this[LRU_LIST].toArray().map((k)=>k.key);
    }
    values() {
        return this[LRU_LIST].toArray().map((k)=>k.value);
    }
    reset() {
        if (this[DISPOSE] && this[LRU_LIST] && this[LRU_LIST].length) {
            this[LRU_LIST].forEach((hit)=>this[DISPOSE](hit.key, hit.value));
        }
        this[CACHE] = new Map(); // hash of items by key
        this[LRU_LIST] = new Yallist(); // list of items in order of use recency
        this[LENGTH] = 0; // length of items in the list
    }
    dump() {
        return this[LRU_LIST].map((hit)=>isStale(this, hit) ? false : {
                k: hit.key,
                v: hit.value,
                e: hit.now + (hit.maxAge || 0)
            }).toArray().filter((h)=>h);
    }
    dumpLru() {
        return this[LRU_LIST];
    }
    set(key, value, maxAge) {
        maxAge = maxAge || this[MAX_AGE];
        if (maxAge && typeof maxAge !== 'number') throw new TypeError('maxAge must be a number');
        const now = maxAge ? Date.now() : 0;
        const len = this[LENGTH_CALCULATOR](value, key);
        if (this[CACHE].has(key)) {
            if (len > this[MAX]) {
                del(this, this[CACHE].get(key));
                return false;
            }
            const node = this[CACHE].get(key);
            const item = node.value;
            // dispose of the old one before overwriting
            // split out into 2 ifs for better coverage tracking
            if (this[DISPOSE]) {
                if (!this[NO_DISPOSE_ON_SET]) this[DISPOSE](key, item.value);
            }
            item.now = now;
            item.maxAge = maxAge;
            item.value = value;
            this[LENGTH] += len - item.length;
            item.length = len;
            this.get(key);
            trim(this);
            return true;
        }
        const hit = new Entry(key, value, len, now, maxAge);
        // oversized objects fall out of cache automatically.
        if (hit.length > this[MAX]) {
            if (this[DISPOSE]) this[DISPOSE](key, value);
            return false;
        }
        this[LENGTH] += hit.length;
        this[LRU_LIST].unshift(hit);
        this[CACHE].set(key, this[LRU_LIST].head);
        trim(this);
        return true;
    }
    has(key) {
        if (!this[CACHE].has(key)) return false;
        const hit = this[CACHE].get(key).value;
        return !isStale(this, hit);
    }
    get(key) {
        return get(this, key, true);
    }
    peek(key) {
        return get(this, key, false);
    }
    pop() {
        const node = this[LRU_LIST].tail;
        if (!node) return null;
        del(this, node);
        return node.value;
    }
    del(key) {
        del(this, this[CACHE].get(key));
    }
    load(arr) {
        // reset the cache
        this.reset();
        const now = Date.now();
        // A previous serialized cache has the most recent items first
        for(let l = arr.length - 1; l >= 0; l--){
            const hit = arr[l];
            const expiresAt = hit.e || 0;
            if (expiresAt === 0) // the item was created without expiration in a non aged cache
            this.set(hit.k, hit.v);
            else {
                const maxAge = expiresAt - now;
                // dont add already expired items
                if (maxAge > 0) {
                    this.set(hit.k, hit.v, maxAge);
                }
            }
        }
    }
    prune() {
        this[CACHE].forEach((value, key)=>get(this, key, false));
    }
}
const get = (self, key, doUse)=>{
    const node = self[CACHE].get(key);
    if (node) {
        const hit = node.value;
        if (isStale(self, hit)) {
            del(self, node);
            if (!self[ALLOW_STALE]) return undefined;
        } else {
            if (doUse) {
                if (self[UPDATE_AGE_ON_GET]) node.value.now = Date.now();
                self[LRU_LIST].unshiftNode(node);
            }
        }
        return hit.value;
    }
};
const isStale = (self, hit)=>{
    if (!hit || !hit.maxAge && !self[MAX_AGE]) return false;
    const diff = Date.now() - hit.now;
    return hit.maxAge ? diff > hit.maxAge : self[MAX_AGE] && diff > self[MAX_AGE];
};
const trim = (self)=>{
    if (self[LENGTH] > self[MAX]) {
        for(let walker = self[LRU_LIST].tail; self[LENGTH] > self[MAX] && walker !== null;){
            // We know that we're about to delete this one, and also
            // what the next least recently used key will be, so just
            // go ahead and set it now.
            const prev = walker.prev;
            del(self, walker);
            walker = prev;
        }
    }
};
const del = (self, node)=>{
    if (node) {
        const hit = node.value;
        if (self[DISPOSE]) self[DISPOSE](hit.key, hit.value);
        self[LENGTH] -= hit.length;
        self[CACHE].delete(hit.key);
        self[LRU_LIST].removeNode(node);
    }
};
class Entry {
    constructor(key, value, length, now, maxAge){
        this.key = key;
        this.value = value;
        this.length = length;
        this.now = now;
        this.maxAge = maxAge || 0;
    }
}
const forEachStep = (self, fn, node, thisp)=>{
    let hit = node.value;
    if (isStale(self, hit)) {
        del(self, node);
        if (!self[ALLOW_STALE]) hit = undefined;
    }
    if (hit) fn.call(thisp, hit.value, hit.key, self);
};
module.exports = LRUCache;
}),
"[project]/aptiverse/aptiverse-ui/node_modules/object-hash/index.js [app-rsc] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

var crypto = __turbopack_context__.r("[externals]/crypto [external] (crypto, cjs)");
/**
 * Exported function
 *
 * Options:
 *
 *  - `algorithm` hash algo to be used by this instance: *'sha1', 'md5'
 *  - `excludeValues` {true|*false} hash object keys, values ignored
 *  - `encoding` hash encoding, supports 'buffer', '*hex', 'binary', 'base64'
 *  - `ignoreUnknown` {true|*false} ignore unknown object types
 *  - `replacer` optional function that replaces values before hashing
 *  - `respectFunctionProperties` {*true|false} consider function properties when hashing
 *  - `respectFunctionNames` {*true|false} consider 'name' property of functions for hashing
 *  - `respectType` {*true|false} Respect special properties (prototype, constructor)
 *    when hashing to distinguish between types
 *  - `unorderedArrays` {true|*false} Sort all arrays before hashing
 *  - `unorderedSets` {*true|false} Sort `Set` and `Map` instances before hashing
 *  * = default
 *
 * @param {object} object value to hash
 * @param {object} options hashing options
 * @return {string} hash value
 * @api public
 */ exports = module.exports = objectHash;
function objectHash(object, options) {
    options = applyDefaults(object, options);
    return hash(object, options);
}
/**
 * Exported sugar methods
 *
 * @param {object} object value to hash
 * @return {string} hash value
 * @api public
 */ exports.sha1 = function(object) {
    return objectHash(object);
};
exports.keys = function(object) {
    return objectHash(object, {
        excludeValues: true,
        algorithm: 'sha1',
        encoding: 'hex'
    });
};
exports.MD5 = function(object) {
    return objectHash(object, {
        algorithm: 'md5',
        encoding: 'hex'
    });
};
exports.keysMD5 = function(object) {
    return objectHash(object, {
        algorithm: 'md5',
        encoding: 'hex',
        excludeValues: true
    });
};
// Internals
var hashes = crypto.getHashes ? crypto.getHashes().slice() : [
    'sha1',
    'md5'
];
hashes.push('passthrough');
var encodings = [
    'buffer',
    'hex',
    'binary',
    'base64'
];
function applyDefaults(object, sourceOptions) {
    sourceOptions = sourceOptions || {};
    // create a copy rather than mutating
    var options = {};
    options.algorithm = sourceOptions.algorithm || 'sha1';
    options.encoding = sourceOptions.encoding || 'hex';
    options.excludeValues = sourceOptions.excludeValues ? true : false;
    options.algorithm = options.algorithm.toLowerCase();
    options.encoding = options.encoding.toLowerCase();
    options.ignoreUnknown = sourceOptions.ignoreUnknown !== true ? false : true; // default to false
    options.respectType = sourceOptions.respectType === false ? false : true; // default to true
    options.respectFunctionNames = sourceOptions.respectFunctionNames === false ? false : true;
    options.respectFunctionProperties = sourceOptions.respectFunctionProperties === false ? false : true;
    options.unorderedArrays = sourceOptions.unorderedArrays !== true ? false : true; // default to false
    options.unorderedSets = sourceOptions.unorderedSets === false ? false : true; // default to false
    options.unorderedObjects = sourceOptions.unorderedObjects === false ? false : true; // default to true
    options.replacer = sourceOptions.replacer || undefined;
    options.excludeKeys = sourceOptions.excludeKeys || undefined;
    if (typeof object === 'undefined') {
        throw new Error('Object argument required.');
    }
    // if there is a case-insensitive match in the hashes list, accept it
    // (i.e. SHA256 for sha256)
    for(var i = 0; i < hashes.length; ++i){
        if (hashes[i].toLowerCase() === options.algorithm.toLowerCase()) {
            options.algorithm = hashes[i];
        }
    }
    if (hashes.indexOf(options.algorithm) === -1) {
        throw new Error('Algorithm "' + options.algorithm + '"  not supported. ' + 'supported values: ' + hashes.join(', '));
    }
    if (encodings.indexOf(options.encoding) === -1 && options.algorithm !== 'passthrough') {
        throw new Error('Encoding "' + options.encoding + '"  not supported. ' + 'supported values: ' + encodings.join(', '));
    }
    return options;
}
/** Check if the given function is a native function */ function isNativeFunction(f) {
    if (typeof f !== 'function') {
        return false;
    }
    var exp = /^function\s+\w*\s*\(\s*\)\s*{\s+\[native code\]\s+}$/i;
    return exp.exec(Function.prototype.toString.call(f)) != null;
}
function hash(object, options) {
    var hashingStream;
    if (options.algorithm !== 'passthrough') {
        hashingStream = crypto.createHash(options.algorithm);
    } else {
        hashingStream = new PassThrough();
    }
    if (typeof hashingStream.write === 'undefined') {
        hashingStream.write = hashingStream.update;
        hashingStream.end = hashingStream.update;
    }
    var hasher = typeHasher(options, hashingStream);
    hasher.dispatch(object);
    if (!hashingStream.update) {
        hashingStream.end('');
    }
    if (hashingStream.digest) {
        return hashingStream.digest(options.encoding === 'buffer' ? undefined : options.encoding);
    }
    var buf = hashingStream.read();
    if (options.encoding === 'buffer') {
        return buf;
    }
    return buf.toString(options.encoding);
}
/**
 * Expose streaming API
 *
 * @param {object} object  Value to serialize
 * @param {object} options  Options, as for hash()
 * @param {object} stream  A stream to write the serializiation to
 * @api public
 */ exports.writeToStream = function(object, options, stream) {
    if (typeof stream === 'undefined') {
        stream = options;
        options = {};
    }
    options = applyDefaults(object, options);
    return typeHasher(options, stream).dispatch(object);
};
function typeHasher(options, writeTo, context) {
    context = context || [];
    var write = function(str) {
        if (writeTo.update) {
            return writeTo.update(str, 'utf8');
        } else {
            return writeTo.write(str, 'utf8');
        }
    };
    return {
        dispatch: function(value) {
            if (options.replacer) {
                value = options.replacer(value);
            }
            var type = typeof value;
            if (value === null) {
                type = 'null';
            }
            //console.log("[DEBUG] Dispatch: ", value, "->", type, " -> ", "_" + type);
            return this['_' + type](value);
        },
        _object: function(object) {
            var pattern = /\[object (.*)\]/i;
            var objString = Object.prototype.toString.call(object);
            var objType = pattern.exec(objString);
            if (!objType) {
                objType = 'unknown:[' + objString + ']';
            } else {
                objType = objType[1]; // take only the class name
            }
            objType = objType.toLowerCase();
            var objectNumber = null;
            if ((objectNumber = context.indexOf(object)) >= 0) {
                return this.dispatch('[CIRCULAR:' + objectNumber + ']');
            } else {
                context.push(object);
            }
            if (typeof Buffer !== 'undefined' && Buffer.isBuffer && Buffer.isBuffer(object)) {
                write('buffer:');
                return write(object);
            }
            if (objType !== 'object' && objType !== 'function' && objType !== 'asyncfunction') {
                if (this['_' + objType]) {
                    this['_' + objType](object);
                } else if (options.ignoreUnknown) {
                    return write('[' + objType + ']');
                } else {
                    throw new Error('Unknown object type "' + objType + '"');
                }
            } else {
                var keys = Object.keys(object);
                if (options.unorderedObjects) {
                    keys = keys.sort();
                }
                // Make sure to incorporate special properties, so
                // Types with different prototypes will produce
                // a different hash and objects derived from
                // different functions (`new Foo`, `new Bar`) will
                // produce different hashes.
                // We never do this for native functions since some
                // seem to break because of that.
                if (options.respectType !== false && !isNativeFunction(object)) {
                    keys.splice(0, 0, 'prototype', '__proto__', 'constructor');
                }
                if (options.excludeKeys) {
                    keys = keys.filter(function(key) {
                        return !options.excludeKeys(key);
                    });
                }
                write('object:' + keys.length + ':');
                var self = this;
                return keys.forEach(function(key) {
                    self.dispatch(key);
                    write(':');
                    if (!options.excludeValues) {
                        self.dispatch(object[key]);
                    }
                    write(',');
                });
            }
        },
        _array: function(arr, unordered) {
            unordered = typeof unordered !== 'undefined' ? unordered : options.unorderedArrays !== false; // default to options.unorderedArrays
            var self = this;
            write('array:' + arr.length + ':');
            if (!unordered || arr.length <= 1) {
                return arr.forEach(function(entry) {
                    return self.dispatch(entry);
                });
            }
            // the unordered case is a little more complicated:
            // since there is no canonical ordering on objects,
            // i.e. {a:1} < {a:2} and {a:1} > {a:2} are both false,
            // we first serialize each entry using a PassThrough stream
            // before sorting.
            // also: we can’t use the same context array for all entries
            // since the order of hashing should *not* matter. instead,
            // we keep track of the additions to a copy of the context array
            // and add all of them to the global context array when we’re done
            var contextAdditions = [];
            var entries = arr.map(function(entry) {
                var strm = new PassThrough();
                var localContext = context.slice(); // make copy
                var hasher = typeHasher(options, strm, localContext);
                hasher.dispatch(entry);
                // take only what was added to localContext and append it to contextAdditions
                contextAdditions = contextAdditions.concat(localContext.slice(context.length));
                return strm.read().toString();
            });
            context = context.concat(contextAdditions);
            entries.sort();
            return this._array(entries, false);
        },
        _date: function(date) {
            return write('date:' + date.toJSON());
        },
        _symbol: function(sym) {
            return write('symbol:' + sym.toString());
        },
        _error: function(err) {
            return write('error:' + err.toString());
        },
        _boolean: function(bool) {
            return write('bool:' + bool.toString());
        },
        _string: function(string) {
            write('string:' + string.length + ':');
            write(string.toString());
        },
        _function: function(fn) {
            write('fn:');
            if (isNativeFunction(fn)) {
                this.dispatch('[native]');
            } else {
                this.dispatch(fn.toString());
            }
            if (options.respectFunctionNames !== false) {
                // Make sure we can still distinguish native functions
                // by their name, otherwise String and Function will
                // have the same hash
                this.dispatch("function-name:" + String(fn.name));
            }
            if (options.respectFunctionProperties) {
                this._object(fn);
            }
        },
        _number: function(number) {
            return write('number:' + number.toString());
        },
        _xml: function(xml) {
            return write('xml:' + xml.toString());
        },
        _null: function() {
            return write('Null');
        },
        _undefined: function() {
            return write('Undefined');
        },
        _regexp: function(regex) {
            return write('regex:' + regex.toString());
        },
        _uint8array: function(arr) {
            write('uint8array:');
            return this.dispatch(Array.prototype.slice.call(arr));
        },
        _uint8clampedarray: function(arr) {
            write('uint8clampedarray:');
            return this.dispatch(Array.prototype.slice.call(arr));
        },
        _int8array: function(arr) {
            write('uint8array:');
            return this.dispatch(Array.prototype.slice.call(arr));
        },
        _uint16array: function(arr) {
            write('uint16array:');
            return this.dispatch(Array.prototype.slice.call(arr));
        },
        _int16array: function(arr) {
            write('uint16array:');
            return this.dispatch(Array.prototype.slice.call(arr));
        },
        _uint32array: function(arr) {
            write('uint32array:');
            return this.dispatch(Array.prototype.slice.call(arr));
        },
        _int32array: function(arr) {
            write('uint32array:');
            return this.dispatch(Array.prototype.slice.call(arr));
        },
        _float32array: function(arr) {
            write('float32array:');
            return this.dispatch(Array.prototype.slice.call(arr));
        },
        _float64array: function(arr) {
            write('float64array:');
            return this.dispatch(Array.prototype.slice.call(arr));
        },
        _arraybuffer: function(arr) {
            write('arraybuffer:');
            return this.dispatch(new Uint8Array(arr));
        },
        _url: function(url) {
            return write('url:' + url.toString(), 'utf8');
        },
        _map: function(map) {
            write('map:');
            var arr = Array.from(map);
            return this._array(arr, options.unorderedSets !== false);
        },
        _set: function(set) {
            write('set:');
            var arr = Array.from(set);
            return this._array(arr, options.unorderedSets !== false);
        },
        _file: function(file) {
            write('file:');
            return this.dispatch([
                file.name,
                file.size,
                file.type,
                file.lastModfied
            ]);
        },
        _blob: function() {
            if (options.ignoreUnknown) {
                return write('[blob]');
            }
            throw Error('Hashing Blob objects is currently not supported\n' + '(see https://github.com/puleos/object-hash/issues/26)\n' + 'Use "options.replacer" or "options.ignoreUnknown"\n');
        },
        _domwindow: function() {
            return write('domwindow');
        },
        _bigint: function(number) {
            return write('bigint:' + number.toString());
        },
        /* Node.js standard native objects */ _process: function() {
            return write('process');
        },
        _timer: function() {
            return write('timer');
        },
        _pipe: function() {
            return write('pipe');
        },
        _tcp: function() {
            return write('tcp');
        },
        _udp: function() {
            return write('udp');
        },
        _tty: function() {
            return write('tty');
        },
        _statwatcher: function() {
            return write('statwatcher');
        },
        _securecontext: function() {
            return write('securecontext');
        },
        _connection: function() {
            return write('connection');
        },
        _zlib: function() {
            return write('zlib');
        },
        _context: function() {
            return write('context');
        },
        _nodescript: function() {
            return write('nodescript');
        },
        _httpparser: function() {
            return write('httpparser');
        },
        _dataview: function() {
            return write('dataview');
        },
        _signal: function() {
            return write('signal');
        },
        _fsevent: function() {
            return write('fsevent');
        },
        _tlswrap: function() {
            return write('tlswrap');
        }
    };
}
// Mini-implementation of stream.PassThrough
// We are far from having need for the full implementation, and we can
// make assumptions like "many writes, then only one final read"
// and we can ignore encoding specifics
function PassThrough() {
    return {
        buf: '',
        write: function(b) {
            this.buf += b;
        },
        end: function(b) {
            this.buf += b;
        },
        read: function() {
            return this.buf;
        }
    };
}
}),
"[project]/aptiverse/aptiverse-ui/node_modules/oauth/lib/sha1.js [app-rsc] (ecmascript)", ((__turbopack_context__, module, exports) => {

/*
 * A JavaScript implementation of the Secure Hash Algorithm, SHA-1, as defined
 * in FIPS 180-1
 * Version 2.2 Copyright Paul Johnston 2000 - 2009.
 * Other contributors: Greg Holt, Andrew Kepert, Ydnar, Lostinet
 * Distributed under the BSD License
 * See http://pajhome.org.uk/crypt/md5 for details.
 */ /*
 * Configurable variables. You may need to tweak these to be compatible with
 * the server-side, but the defaults work in most cases.
 */ var hexcase = 1; /* hex output format. 0 - lowercase; 1 - uppercase        */ 
var b64pad = "="; /* base-64 pad character. "=" for strict RFC compliance   */ 
/*
 * These are the functions you'll usually want to call
 * They take string arguments and return either hex or base-64 encoded strings
 */ function hex_sha1(s) {
    return rstr2hex(rstr_sha1(str2rstr_utf8(s)));
}
function b64_sha1(s) {
    return rstr2b64(rstr_sha1(str2rstr_utf8(s)));
}
function any_sha1(s, e) {
    return rstr2any(rstr_sha1(str2rstr_utf8(s)), e);
}
function hex_hmac_sha1(k, d) {
    return rstr2hex(rstr_hmac_sha1(str2rstr_utf8(k), str2rstr_utf8(d)));
}
function b64_hmac_sha1(k, d) {
    return rstr2b64(rstr_hmac_sha1(str2rstr_utf8(k), str2rstr_utf8(d)));
}
function any_hmac_sha1(k, d, e) {
    return rstr2any(rstr_hmac_sha1(str2rstr_utf8(k), str2rstr_utf8(d)), e);
}
/*
 * Perform a simple self-test to see if the VM is working
 */ function sha1_vm_test() {
    return hex_sha1("abc").toLowerCase() == "a9993e364706816aba3e25717850c26c9cd0d89d";
}
/*
 * Calculate the SHA1 of a raw string
 */ function rstr_sha1(s) {
    return binb2rstr(binb_sha1(rstr2binb(s), s.length * 8));
}
/*
 * Calculate the HMAC-SHA1 of a key and some data (raw strings)
 */ function rstr_hmac_sha1(key, data) {
    var bkey = rstr2binb(key);
    if (bkey.length > 16) bkey = binb_sha1(bkey, key.length * 8);
    var ipad = Array(16), opad = Array(16);
    for(var i = 0; i < 16; i++){
        ipad[i] = bkey[i] ^ 0x36363636;
        opad[i] = bkey[i] ^ 0x5C5C5C5C;
    }
    var hash = binb_sha1(ipad.concat(rstr2binb(data)), 512 + data.length * 8);
    return binb2rstr(binb_sha1(opad.concat(hash), 512 + 160));
}
/*
 * Convert a raw string to a hex string
 */ function rstr2hex(input) {
    try {
        hexcase;
    } catch (e) {
        hexcase = 0;
    }
    var hex_tab = hexcase ? "0123456789ABCDEF" : "0123456789abcdef";
    var output = "";
    var x;
    for(var i = 0; i < input.length; i++){
        x = input.charCodeAt(i);
        output += hex_tab.charAt(x >>> 4 & 0x0F) + hex_tab.charAt(x & 0x0F);
    }
    return output;
}
/*
 * Convert a raw string to a base-64 string
 */ function rstr2b64(input) {
    try {
        b64pad;
    } catch (e) {
        b64pad = '';
    }
    var tab = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    var output = "";
    var len = input.length;
    for(var i = 0; i < len; i += 3){
        var triplet = input.charCodeAt(i) << 16 | (i + 1 < len ? input.charCodeAt(i + 1) << 8 : 0) | (i + 2 < len ? input.charCodeAt(i + 2) : 0);
        for(var j = 0; j < 4; j++){
            if (i * 8 + j * 6 > input.length * 8) output += b64pad;
            else output += tab.charAt(triplet >>> 6 * (3 - j) & 0x3F);
        }
    }
    return output;
}
/*
 * Convert a raw string to an arbitrary string encoding
 */ function rstr2any(input, encoding) {
    var divisor = encoding.length;
    var remainders = Array();
    var i, q, x, quotient;
    /* Convert to an array of 16-bit big-endian values, forming the dividend */ var dividend = Array(Math.ceil(input.length / 2));
    for(i = 0; i < dividend.length; i++){
        dividend[i] = input.charCodeAt(i * 2) << 8 | input.charCodeAt(i * 2 + 1);
    }
    /*
   * Repeatedly perform a long division. The binary array forms the dividend,
   * the length of the encoding is the divisor. Once computed, the quotient
   * forms the dividend for the next step. We stop when the dividend is zero.
   * All remainders are stored for later use.
   */ while(dividend.length > 0){
        quotient = Array();
        x = 0;
        for(i = 0; i < dividend.length; i++){
            x = (x << 16) + dividend[i];
            q = Math.floor(x / divisor);
            x -= q * divisor;
            if (quotient.length > 0 || q > 0) quotient[quotient.length] = q;
        }
        remainders[remainders.length] = x;
        dividend = quotient;
    }
    /* Convert the remainders to the output string */ var output = "";
    for(i = remainders.length - 1; i >= 0; i--)output += encoding.charAt(remainders[i]);
    /* Append leading zero equivalents */ var full_length = Math.ceil(input.length * 8 / (Math.log(encoding.length) / Math.log(2)));
    for(i = output.length; i < full_length; i++)output = encoding[0] + output;
    return output;
}
/*
 * Encode a string as utf-8.
 * For efficiency, this assumes the input is valid utf-16.
 */ function str2rstr_utf8(input) {
    var output = "";
    var i = -1;
    var x, y;
    while(++i < input.length){
        /* Decode utf-16 surrogate pairs */ x = input.charCodeAt(i);
        y = i + 1 < input.length ? input.charCodeAt(i + 1) : 0;
        if (0xD800 <= x && x <= 0xDBFF && 0xDC00 <= y && y <= 0xDFFF) {
            x = 0x10000 + ((x & 0x03FF) << 10) + (y & 0x03FF);
            i++;
        }
        /* Encode output as utf-8 */ if (x <= 0x7F) output += String.fromCharCode(x);
        else if (x <= 0x7FF) output += String.fromCharCode(0xC0 | x >>> 6 & 0x1F, 0x80 | x & 0x3F);
        else if (x <= 0xFFFF) output += String.fromCharCode(0xE0 | x >>> 12 & 0x0F, 0x80 | x >>> 6 & 0x3F, 0x80 | x & 0x3F);
        else if (x <= 0x1FFFFF) output += String.fromCharCode(0xF0 | x >>> 18 & 0x07, 0x80 | x >>> 12 & 0x3F, 0x80 | x >>> 6 & 0x3F, 0x80 | x & 0x3F);
    }
    return output;
}
/*
 * Encode a string as utf-16
 */ function str2rstr_utf16le(input) {
    var output = "";
    for(var i = 0; i < input.length; i++)output += String.fromCharCode(input.charCodeAt(i) & 0xFF, input.charCodeAt(i) >>> 8 & 0xFF);
    return output;
}
function str2rstr_utf16be(input) {
    var output = "";
    for(var i = 0; i < input.length; i++)output += String.fromCharCode(input.charCodeAt(i) >>> 8 & 0xFF, input.charCodeAt(i) & 0xFF);
    return output;
}
/*
 * Convert a raw string to an array of big-endian words
 * Characters >255 have their high-byte silently ignored.
 */ function rstr2binb(input) {
    var output = Array(input.length >> 2);
    for(var i = 0; i < output.length; i++)output[i] = 0;
    for(var i = 0; i < input.length * 8; i += 8)output[i >> 5] |= (input.charCodeAt(i / 8) & 0xFF) << 24 - i % 32;
    return output;
}
/*
 * Convert an array of big-endian words to a string
 */ function binb2rstr(input) {
    var output = "";
    for(var i = 0; i < input.length * 32; i += 8)output += String.fromCharCode(input[i >> 5] >>> 24 - i % 32 & 0xFF);
    return output;
}
/*
 * Calculate the SHA-1 of an array of big-endian words, and a bit length
 */ function binb_sha1(x, len) {
    /* append padding */ x[len >> 5] |= 0x80 << 24 - len % 32;
    x[(len + 64 >> 9 << 4) + 15] = len;
    var w = Array(80);
    var a = 1732584193;
    var b = -271733879;
    var c = -1732584194;
    var d = 271733878;
    var e = -1009589776;
    for(var i = 0; i < x.length; i += 16){
        var olda = a;
        var oldb = b;
        var oldc = c;
        var oldd = d;
        var olde = e;
        for(var j = 0; j < 80; j++){
            if (j < 16) w[j] = x[i + j];
            else w[j] = bit_rol(w[j - 3] ^ w[j - 8] ^ w[j - 14] ^ w[j - 16], 1);
            var t = safe_add(safe_add(bit_rol(a, 5), sha1_ft(j, b, c, d)), safe_add(safe_add(e, w[j]), sha1_kt(j)));
            e = d;
            d = c;
            c = bit_rol(b, 30);
            b = a;
            a = t;
        }
        a = safe_add(a, olda);
        b = safe_add(b, oldb);
        c = safe_add(c, oldc);
        d = safe_add(d, oldd);
        e = safe_add(e, olde);
    }
    return Array(a, b, c, d, e);
}
/*
 * Perform the appropriate triplet combination function for the current
 * iteration
 */ function sha1_ft(t, b, c, d) {
    if (t < 20) return b & c | ~b & d;
    if (t < 40) return b ^ c ^ d;
    if (t < 60) return b & c | b & d | c & d;
    return b ^ c ^ d;
}
/*
 * Determine the appropriate additive constant for the current iteration
 */ function sha1_kt(t) {
    return t < 20 ? 1518500249 : t < 40 ? 1859775393 : t < 60 ? -1894007588 : -899497514;
}
/*
 * Add integers, wrapping at 2^32. This uses 16-bit operations internally
 * to work around bugs in some JS interpreters.
 */ function safe_add(x, y) {
    var lsw = (x & 0xFFFF) + (y & 0xFFFF);
    var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
    return msw << 16 | lsw & 0xFFFF;
}
/*
 * Bitwise rotate a 32-bit number to the left.
 */ function bit_rol(num, cnt) {
    return num << cnt | num >>> 32 - cnt;
}
exports.HMACSHA1 = function(key, data) {
    return b64_hmac_sha1(key, data);
};
}),
"[project]/aptiverse/aptiverse-ui/node_modules/oauth/lib/_utils.js [app-rsc] (ecmascript)", ((__turbopack_context__, module, exports) => {

// Returns true if this is a host that closes *before* it ends?!?!
module.exports.isAnEarlyCloseHost = function(hostName) {
    return hostName && hostName.match(".*google(apis)?.com$");
};
}),
"[project]/aptiverse/aptiverse-ui/node_modules/oauth/lib/oauth.js [app-rsc] (ecmascript)", ((__turbopack_context__, module, exports) => {

var crypto = __turbopack_context__.r("[externals]/crypto [external] (crypto, cjs)"), sha1 = __turbopack_context__.r("[project]/aptiverse/aptiverse-ui/node_modules/oauth/lib/sha1.js [app-rsc] (ecmascript)"), http = __turbopack_context__.r("[externals]/http [external] (http, cjs)"), https = __turbopack_context__.r("[externals]/https [external] (https, cjs)"), URL = __turbopack_context__.r("[externals]/url [external] (url, cjs)"), querystring = __turbopack_context__.r("[externals]/querystring [external] (querystring, cjs)"), OAuthUtils = __turbopack_context__.r("[project]/aptiverse/aptiverse-ui/node_modules/oauth/lib/_utils.js [app-rsc] (ecmascript)");
exports.OAuth = function(requestUrl, accessUrl, consumerKey, consumerSecret, version, authorize_callback, signatureMethod, nonceSize, customHeaders) {
    this._isEcho = false;
    this._requestUrl = requestUrl;
    this._accessUrl = accessUrl;
    this._consumerKey = consumerKey;
    this._consumerSecret = this._encodeData(consumerSecret);
    if (signatureMethod == "RSA-SHA1") {
        this._privateKey = consumerSecret;
    }
    this._version = version;
    if (authorize_callback === undefined) {
        this._authorize_callback = "oob";
    } else {
        this._authorize_callback = authorize_callback;
    }
    if (signatureMethod != "PLAINTEXT" && signatureMethod != "HMAC-SHA1" && signatureMethod != "RSA-SHA1") throw new Error("Un-supported signature method: " + signatureMethod);
    this._signatureMethod = signatureMethod;
    this._nonceSize = nonceSize || 32;
    this._headers = customHeaders || {
        "Accept": "*/*",
        "Connection": "close",
        "User-Agent": "Node authentication"
    };
    this._clientOptions = this._defaultClientOptions = {
        "requestTokenHttpMethod": "POST",
        "accessTokenHttpMethod": "POST",
        "followRedirects": true
    };
    this._oauthParameterSeperator = ",";
};
exports.OAuthEcho = function(realm, verify_credentials, consumerKey, consumerSecret, version, signatureMethod, nonceSize, customHeaders) {
    this._isEcho = true;
    this._realm = realm;
    this._verifyCredentials = verify_credentials;
    this._consumerKey = consumerKey;
    this._consumerSecret = this._encodeData(consumerSecret);
    if (signatureMethod == "RSA-SHA1") {
        this._privateKey = consumerSecret;
    }
    this._version = version;
    if (signatureMethod != "PLAINTEXT" && signatureMethod != "HMAC-SHA1" && signatureMethod != "RSA-SHA1") throw new Error("Un-supported signature method: " + signatureMethod);
    this._signatureMethod = signatureMethod;
    this._nonceSize = nonceSize || 32;
    this._headers = customHeaders || {
        "Accept": "*/*",
        "Connection": "close",
        "User-Agent": "Node authentication"
    };
    this._oauthParameterSeperator = ",";
};
exports.OAuthEcho.prototype = exports.OAuth.prototype;
exports.OAuth.prototype._getTimestamp = function() {
    return Math.floor(new Date().getTime() / 1000);
};
exports.OAuth.prototype._encodeData = function(toEncode) {
    if (toEncode == null || toEncode == "") return "";
    else {
        var result = encodeURIComponent(toEncode);
        // Fix the mismatch between OAuth's  RFC3986's and Javascript's beliefs in what is right and wrong ;)
        return result.replace(/\!/g, "%21").replace(/\'/g, "%27").replace(/\(/g, "%28").replace(/\)/g, "%29").replace(/\*/g, "%2A");
    }
};
exports.OAuth.prototype._decodeData = function(toDecode) {
    if (toDecode != null) {
        toDecode = toDecode.replace(/\+/g, " ");
    }
    return decodeURIComponent(toDecode);
};
exports.OAuth.prototype._getSignature = function(method, url, parameters, tokenSecret) {
    var signatureBase = this._createSignatureBase(method, url, parameters);
    return this._createSignature(signatureBase, tokenSecret);
};
exports.OAuth.prototype._normalizeUrl = function(url) {
    var parsedUrl = URL.parse(url, true);
    var port = "";
    if (parsedUrl.port) {
        if (parsedUrl.protocol == "http:" && parsedUrl.port != "80" || parsedUrl.protocol == "https:" && parsedUrl.port != "443") {
            port = ":" + parsedUrl.port;
        }
    }
    if (!parsedUrl.pathname || parsedUrl.pathname == "") parsedUrl.pathname = "/";
    return parsedUrl.protocol + "//" + parsedUrl.hostname + port + parsedUrl.pathname;
};
// Is the parameter considered an OAuth parameter
exports.OAuth.prototype._isParameterNameAnOAuthParameter = function(parameter) {
    var m = parameter.match('^oauth_');
    if (m && m[0] === "oauth_") {
        return true;
    } else {
        return false;
    }
};
// build the OAuth request authorization header
exports.OAuth.prototype._buildAuthorizationHeaders = function(orderedParameters) {
    var authHeader = "OAuth ";
    if (this._isEcho) {
        authHeader += 'realm="' + this._realm + '",';
    }
    for(var i = 0; i < orderedParameters.length; i++){
        // Whilst the all the parameters should be included within the signature, only the oauth_ arguments
        // should appear within the authorization header.
        if (this._isParameterNameAnOAuthParameter(orderedParameters[i][0])) {
            authHeader += "" + this._encodeData(orderedParameters[i][0]) + "=\"" + this._encodeData(orderedParameters[i][1]) + "\"" + this._oauthParameterSeperator;
        }
    }
    authHeader = authHeader.substring(0, authHeader.length - this._oauthParameterSeperator.length);
    return authHeader;
};
// Takes an object literal that represents the arguments, and returns an array
// of argument/value pairs.
exports.OAuth.prototype._makeArrayOfArgumentsHash = function(argumentsHash) {
    var argument_pairs = [];
    for(var key in argumentsHash){
        if (argumentsHash.hasOwnProperty(key)) {
            var value = argumentsHash[key];
            if (Array.isArray(value)) {
                for(var i = 0; i < value.length; i++){
                    argument_pairs[argument_pairs.length] = [
                        key,
                        value[i]
                    ];
                }
            } else {
                argument_pairs[argument_pairs.length] = [
                    key,
                    value
                ];
            }
        }
    }
    return argument_pairs;
};
// Sorts the encoded key value pairs by encoded name, then encoded value
exports.OAuth.prototype._sortRequestParams = function(argument_pairs) {
    // Sort by name, then value.
    argument_pairs.sort(function(a, b) {
        if (a[0] == b[0]) {
            return a[1] < b[1] ? -1 : 1;
        } else return a[0] < b[0] ? -1 : 1;
    });
    return argument_pairs;
};
exports.OAuth.prototype._normaliseRequestParams = function(args) {
    var argument_pairs = this._makeArrayOfArgumentsHash(args);
    // First encode them #3.4.1.3.2 .1
    for(var i = 0; i < argument_pairs.length; i++){
        argument_pairs[i][0] = this._encodeData(argument_pairs[i][0]);
        argument_pairs[i][1] = this._encodeData(argument_pairs[i][1]);
    }
    // Then sort them #3.4.1.3.2 .2
    argument_pairs = this._sortRequestParams(argument_pairs);
    // Then concatenate together #3.4.1.3.2 .3 & .4
    var args = "";
    for(var i = 0; i < argument_pairs.length; i++){
        args += argument_pairs[i][0];
        args += "=";
        args += argument_pairs[i][1];
        if (i < argument_pairs.length - 1) args += "&";
    }
    return args;
};
exports.OAuth.prototype._createSignatureBase = function(method, url, parameters) {
    url = this._encodeData(this._normalizeUrl(url));
    parameters = this._encodeData(parameters);
    return method.toUpperCase() + "&" + url + "&" + parameters;
};
exports.OAuth.prototype._createSignature = function(signatureBase, tokenSecret) {
    if (tokenSecret === undefined) var tokenSecret = "";
    else tokenSecret = this._encodeData(tokenSecret);
    // consumerSecret is already encoded
    var key = this._consumerSecret + "&" + tokenSecret;
    var hash = "";
    if (this._signatureMethod == "PLAINTEXT") {
        hash = key;
    } else if (this._signatureMethod == "RSA-SHA1") {
        key = this._privateKey || "";
        hash = crypto.createSign("RSA-SHA1").update(signatureBase).sign(key, 'base64');
    } else {
        if (crypto.Hmac) {
            hash = crypto.createHmac("sha1", key).update(signatureBase).digest("base64");
        } else {
            hash = sha1.HMACSHA1(key, signatureBase);
        }
    }
    return hash;
};
exports.OAuth.prototype.NONCE_CHARS = [
    'a',
    'b',
    'c',
    'd',
    'e',
    'f',
    'g',
    'h',
    'i',
    'j',
    'k',
    'l',
    'm',
    'n',
    'o',
    'p',
    'q',
    'r',
    's',
    't',
    'u',
    'v',
    'w',
    'x',
    'y',
    'z',
    'A',
    'B',
    'C',
    'D',
    'E',
    'F',
    'G',
    'H',
    'I',
    'J',
    'K',
    'L',
    'M',
    'N',
    'O',
    'P',
    'Q',
    'R',
    'S',
    'T',
    'U',
    'V',
    'W',
    'X',
    'Y',
    'Z',
    '0',
    '1',
    '2',
    '3',
    '4',
    '5',
    '6',
    '7',
    '8',
    '9'
];
exports.OAuth.prototype._getNonce = function(nonceSize) {
    var result = [];
    var chars = this.NONCE_CHARS;
    var char_pos;
    var nonce_chars_length = chars.length;
    for(var i = 0; i < nonceSize; i++){
        char_pos = Math.floor(Math.random() * nonce_chars_length);
        result[i] = chars[char_pos];
    }
    return result.join('');
};
exports.OAuth.prototype._createClient = function(port, hostname, method, path, headers, sslEnabled) {
    var options = {
        host: hostname,
        port: port,
        path: path,
        method: method,
        headers: headers
    };
    var httpModel;
    if (sslEnabled) {
        httpModel = https;
    } else {
        httpModel = http;
    }
    return httpModel.request(options);
};
exports.OAuth.prototype._prepareParameters = function(oauth_token, oauth_token_secret, method, url, extra_params) {
    var oauthParameters = {
        "oauth_timestamp": this._getTimestamp(),
        "oauth_nonce": this._getNonce(this._nonceSize),
        "oauth_version": this._version,
        "oauth_signature_method": this._signatureMethod,
        "oauth_consumer_key": this._consumerKey
    };
    if (oauth_token) {
        oauthParameters["oauth_token"] = oauth_token;
    }
    var sig;
    if (this._isEcho) {
        sig = this._getSignature("GET", this._verifyCredentials, this._normaliseRequestParams(oauthParameters), oauth_token_secret);
    } else {
        if (extra_params) {
            for(var key in extra_params){
                if (extra_params.hasOwnProperty(key)) oauthParameters[key] = extra_params[key];
            }
        }
        var parsedUrl = URL.parse(url, false);
        if (parsedUrl.query) {
            var key2;
            var extraParameters = querystring.parse(parsedUrl.query);
            for(var key in extraParameters){
                var value = extraParameters[key];
                if (typeof value == "object") {
                    // TODO: This probably should be recursive
                    for(key2 in value){
                        oauthParameters[key + "[" + key2 + "]"] = value[key2];
                    }
                } else {
                    oauthParameters[key] = value;
                }
            }
        }
        sig = this._getSignature(method, url, this._normaliseRequestParams(oauthParameters), oauth_token_secret);
    }
    var orderedParameters = this._sortRequestParams(this._makeArrayOfArgumentsHash(oauthParameters));
    orderedParameters[orderedParameters.length] = [
        "oauth_signature",
        sig
    ];
    return orderedParameters;
};
exports.OAuth.prototype._performSecureRequest = function(oauth_token, oauth_token_secret, method, url, extra_params, post_body, post_content_type, callback) {
    var orderedParameters = this._prepareParameters(oauth_token, oauth_token_secret, method, url, extra_params);
    if (!post_content_type) {
        post_content_type = "application/x-www-form-urlencoded";
    }
    var parsedUrl = URL.parse(url, false);
    if (parsedUrl.protocol == "http:" && !parsedUrl.port) parsedUrl.port = 80;
    if (parsedUrl.protocol == "https:" && !parsedUrl.port) parsedUrl.port = 443;
    var headers = {};
    var authorization = this._buildAuthorizationHeaders(orderedParameters);
    if (this._isEcho) {
        headers["X-Verify-Credentials-Authorization"] = authorization;
    } else {
        headers["Authorization"] = authorization;
    }
    headers["Host"] = parsedUrl.host;
    for(var key in this._headers){
        if (this._headers.hasOwnProperty(key)) {
            headers[key] = this._headers[key];
        }
    }
    // Filter out any passed extra_params that are really to do with OAuth
    for(var key in extra_params){
        if (this._isParameterNameAnOAuthParameter(key)) {
            delete extra_params[key];
        }
    }
    if ((method == "POST" || method == "PUT") && post_body == null && extra_params != null) {
        // Fix the mismatch between the output of querystring.stringify() and this._encodeData()
        post_body = querystring.stringify(extra_params).replace(/\!/g, "%21").replace(/\'/g, "%27").replace(/\(/g, "%28").replace(/\)/g, "%29").replace(/\*/g, "%2A");
    }
    if (post_body) {
        if (Buffer.isBuffer(post_body)) {
            headers["Content-length"] = post_body.length;
        } else {
            headers["Content-length"] = Buffer.byteLength(post_body);
        }
    } else {
        headers["Content-length"] = 0;
    }
    headers["Content-Type"] = post_content_type;
    var path;
    if (!parsedUrl.pathname || parsedUrl.pathname == "") parsedUrl.pathname = "/";
    if (parsedUrl.query) path = parsedUrl.pathname + "?" + parsedUrl.query;
    else path = parsedUrl.pathname;
    var request;
    if (parsedUrl.protocol == "https:") {
        request = this._createClient(parsedUrl.port, parsedUrl.hostname, method, path, headers, true);
    } else {
        request = this._createClient(parsedUrl.port, parsedUrl.hostname, method, path, headers);
    }
    var clientOptions = this._clientOptions;
    if (callback) {
        var data = "";
        var self = this;
        // Some hosts *cough* google appear to close the connection early / send no content-length header
        // allow this behaviour.
        var allowEarlyClose = OAuthUtils.isAnEarlyCloseHost(parsedUrl.hostname);
        var callbackCalled = false;
        var passBackControl = function(response) {
            if (!callbackCalled) {
                callbackCalled = true;
                if (response.statusCode >= 200 && response.statusCode <= 299) {
                    callback(null, data, response);
                } else {
                    // Follow 301 or 302 redirects with Location HTTP header
                    if ((response.statusCode == 301 || response.statusCode == 302) && clientOptions.followRedirects && response.headers && response.headers.location) {
                        self._performSecureRequest(oauth_token, oauth_token_secret, method, response.headers.location, extra_params, post_body, post_content_type, callback);
                    } else {
                        callback({
                            statusCode: response.statusCode,
                            data: data
                        }, data, response);
                    }
                }
            }
        };
        request.on('response', function(response) {
            response.setEncoding('utf8');
            response.on('data', function(chunk) {
                data += chunk;
            });
            response.on('end', function() {
                passBackControl(response);
            });
            response.on('close', function() {
                if (allowEarlyClose) {
                    passBackControl(response);
                }
            });
        });
        request.on("error", function(err) {
            if (!callbackCalled) {
                callbackCalled = true;
                callback(err);
            }
        });
        if ((method == "POST" || method == "PUT") && post_body != null && post_body != "") {
            request.write(post_body);
        }
        request.end();
    } else {
        if ((method == "POST" || method == "PUT") && post_body != null && post_body != "") {
            request.write(post_body);
        }
        return request;
    }
    return;
};
exports.OAuth.prototype.setClientOptions = function(options) {
    var key, mergedOptions = {}, hasOwnProperty = Object.prototype.hasOwnProperty;
    for(key in this._defaultClientOptions){
        if (!hasOwnProperty.call(options, key)) {
            mergedOptions[key] = this._defaultClientOptions[key];
        } else {
            mergedOptions[key] = options[key];
        }
    }
    this._clientOptions = mergedOptions;
};
exports.OAuth.prototype.getOAuthAccessToken = function(oauth_token, oauth_token_secret, oauth_verifier, callback) {
    var extraParams = {};
    if (typeof oauth_verifier == "function") {
        callback = oauth_verifier;
    } else {
        extraParams.oauth_verifier = oauth_verifier;
    }
    this._performSecureRequest(oauth_token, oauth_token_secret, this._clientOptions.accessTokenHttpMethod, this._accessUrl, extraParams, null, null, function(error, data, response) {
        if (error) callback(error);
        else {
            var results = querystring.parse(data);
            var oauth_access_token = results["oauth_token"];
            delete results["oauth_token"];
            var oauth_access_token_secret = results["oauth_token_secret"];
            delete results["oauth_token_secret"];
            callback(null, oauth_access_token, oauth_access_token_secret, results);
        }
    });
};
// Deprecated
exports.OAuth.prototype.getProtectedResource = function(url, method, oauth_token, oauth_token_secret, callback) {
    this._performSecureRequest(oauth_token, oauth_token_secret, method, url, null, "", null, callback);
};
exports.OAuth.prototype.delete = function(url, oauth_token, oauth_token_secret, callback) {
    return this._performSecureRequest(oauth_token, oauth_token_secret, "DELETE", url, null, "", null, callback);
};
exports.OAuth.prototype.get = function(url, oauth_token, oauth_token_secret, callback) {
    return this._performSecureRequest(oauth_token, oauth_token_secret, "GET", url, null, "", null, callback);
};
exports.OAuth.prototype._putOrPost = function(method, url, oauth_token, oauth_token_secret, post_body, post_content_type, callback) {
    var extra_params = null;
    if (typeof post_content_type == "function") {
        callback = post_content_type;
        post_content_type = null;
    }
    if (typeof post_body != "string" && !Buffer.isBuffer(post_body)) {
        post_content_type = "application/x-www-form-urlencoded";
        extra_params = post_body;
        post_body = null;
    }
    return this._performSecureRequest(oauth_token, oauth_token_secret, method, url, extra_params, post_body, post_content_type, callback);
};
exports.OAuth.prototype.put = function(url, oauth_token, oauth_token_secret, post_body, post_content_type, callback) {
    return this._putOrPost("PUT", url, oauth_token, oauth_token_secret, post_body, post_content_type, callback);
};
exports.OAuth.prototype.post = function(url, oauth_token, oauth_token_secret, post_body, post_content_type, callback) {
    return this._putOrPost("POST", url, oauth_token, oauth_token_secret, post_body, post_content_type, callback);
};
/**
 * Gets a request token from the OAuth provider and passes that information back
 * to the calling code.
 *
 * The callback should expect a function of the following form:
 *
 * function(err, token, token_secret, parsedQueryString) {}
 *
 * This method has optional parameters so can be called in the following 2 ways:
 *
 * 1) Primary use case: Does a basic request with no extra parameters
 *  getOAuthRequestToken( callbackFunction )
 *
 * 2) As above but allows for provision of extra parameters to be sent as part of the query to the server.
 *  getOAuthRequestToken( extraParams, callbackFunction )
 *
 * N.B. This method will HTTP POST verbs by default, if you wish to override this behaviour you will
 * need to provide a requestTokenHttpMethod option when creating the client.
 *
 **/ exports.OAuth.prototype.getOAuthRequestToken = function(extraParams, callback) {
    if (typeof extraParams == "function") {
        callback = extraParams;
        extraParams = {};
    }
    // Callbacks are 1.0A related
    if (this._authorize_callback) {
        extraParams["oauth_callback"] = this._authorize_callback;
    }
    this._performSecureRequest(null, null, this._clientOptions.requestTokenHttpMethod, this._requestUrl, extraParams, null, null, function(error, data, response) {
        if (error) callback(error);
        else {
            var results = querystring.parse(data);
            var oauth_token = results["oauth_token"];
            var oauth_token_secret = results["oauth_token_secret"];
            delete results["oauth_token"];
            delete results["oauth_token_secret"];
            callback(null, oauth_token, oauth_token_secret, results);
        }
    });
};
exports.OAuth.prototype.signUrl = function(url, oauth_token, oauth_token_secret, method) {
    if (method === undefined) {
        var method = "GET";
    }
    var orderedParameters = this._prepareParameters(oauth_token, oauth_token_secret, method, url, {});
    var parsedUrl = URL.parse(url, false);
    var query = "";
    for(var i = 0; i < orderedParameters.length; i++){
        query += orderedParameters[i][0] + "=" + this._encodeData(orderedParameters[i][1]) + "&";
    }
    query = query.substring(0, query.length - 1);
    return parsedUrl.protocol + "//" + parsedUrl.host + parsedUrl.pathname + "?" + query;
};
exports.OAuth.prototype.authHeader = function(url, oauth_token, oauth_token_secret, method) {
    if (method === undefined) {
        var method = "GET";
    }
    var orderedParameters = this._prepareParameters(oauth_token, oauth_token_secret, method, url, {});
    return this._buildAuthorizationHeaders(orderedParameters);
};
}),
"[project]/aptiverse/aptiverse-ui/node_modules/oauth/lib/oauth2.js [app-rsc] (ecmascript)", ((__turbopack_context__, module, exports) => {

var querystring = __turbopack_context__.r("[externals]/querystring [external] (querystring, cjs)"), crypto = __turbopack_context__.r("[externals]/crypto [external] (crypto, cjs)"), https = __turbopack_context__.r("[externals]/https [external] (https, cjs)"), http = __turbopack_context__.r("[externals]/http [external] (http, cjs)"), URL = __turbopack_context__.r("[externals]/url [external] (url, cjs)"), OAuthUtils = __turbopack_context__.r("[project]/aptiverse/aptiverse-ui/node_modules/oauth/lib/_utils.js [app-rsc] (ecmascript)");
exports.OAuth2 = function(clientId, clientSecret, baseSite, authorizePath, accessTokenPath, customHeaders) {
    this._clientId = clientId;
    this._clientSecret = clientSecret;
    this._baseSite = baseSite;
    this._authorizeUrl = authorizePath || "/oauth/authorize";
    this._accessTokenUrl = accessTokenPath || "/oauth/access_token";
    this._accessTokenName = "access_token";
    this._authMethod = "Bearer";
    this._customHeaders = customHeaders || {};
    this._useAuthorizationHeaderForGET = false;
    //our agent
    this._agent = undefined;
};
// Allows you to set an agent to use instead of the default HTTP or
// HTTPS agents. Useful when dealing with your own certificates.
exports.OAuth2.prototype.setAgent = function(agent) {
    this._agent = agent;
};
// This 'hack' method is required for sites that don't use
// 'access_token' as the name of the access token (for requests).
// ( http://tools.ietf.org/html/draft-ietf-oauth-v2-16#section-7 )
// it isn't clear what the correct value should be atm, so allowing
// for specific (temporary?) override for now.
exports.OAuth2.prototype.setAccessTokenName = function(name) {
    this._accessTokenName = name;
};
// Sets the authorization method for Authorization header.
// e.g. Authorization: Bearer <token>  # "Bearer" is the authorization method.
exports.OAuth2.prototype.setAuthMethod = function(authMethod) {
    this._authMethod = authMethod;
};
// If you use the OAuth2 exposed 'get' method (and don't construct your own _request call )
// this will specify whether to use an 'Authorize' header instead of passing the access_token as a query parameter
exports.OAuth2.prototype.useAuthorizationHeaderforGET = function(useIt) {
    this._useAuthorizationHeaderForGET = useIt;
};
exports.OAuth2.prototype._getAccessTokenUrl = function() {
    return this._baseSite + this._accessTokenUrl; /* + "?" + querystring.stringify(params); */ 
};
// Build the authorization header. In particular, build the part after the colon.
// e.g. Authorization: Bearer <token>  # Build "Bearer <token>"
exports.OAuth2.prototype.buildAuthHeader = function(token) {
    return this._authMethod + ' ' + token;
};
exports.OAuth2.prototype._chooseHttpLibrary = function(parsedUrl) {
    var http_library = https;
    // As this is OAUth2, we *assume* https unless told explicitly otherwise.
    if (parsedUrl.protocol != "https:") {
        http_library = http;
    }
    return http_library;
};
exports.OAuth2.prototype._request = function(method, url, headers, post_body, access_token, callback) {
    var parsedUrl = URL.parse(url, true);
    if (parsedUrl.protocol == "https:" && !parsedUrl.port) {
        parsedUrl.port = 443;
    }
    var http_library = this._chooseHttpLibrary(parsedUrl);
    var realHeaders = {};
    for(var key in this._customHeaders){
        realHeaders[key] = this._customHeaders[key];
    }
    if (headers) {
        for(var key in headers){
            realHeaders[key] = headers[key];
        }
    }
    realHeaders['Host'] = parsedUrl.host;
    if (!realHeaders['User-Agent']) {
        realHeaders['User-Agent'] = 'Node-oauth';
    }
    if (post_body) {
        if (Buffer.isBuffer(post_body)) {
            realHeaders["Content-Length"] = post_body.length;
        } else {
            realHeaders["Content-Length"] = Buffer.byteLength(post_body);
        }
    } else {
        realHeaders["Content-length"] = 0;
    }
    if (access_token && !('Authorization' in realHeaders)) {
        if (!parsedUrl.query) parsedUrl.query = {};
        parsedUrl.query[this._accessTokenName] = access_token;
    }
    var queryStr = querystring.stringify(parsedUrl.query);
    if (queryStr) queryStr = "?" + queryStr;
    var options = {
        host: parsedUrl.hostname,
        port: parsedUrl.port,
        path: parsedUrl.pathname + queryStr,
        method: method,
        headers: realHeaders
    };
    this._executeRequest(http_library, options, post_body, callback);
};
exports.OAuth2.prototype._executeRequest = function(http_library, options, post_body, callback) {
    // Some hosts *cough* google appear to close the connection early / send no content-length header
    // allow this behaviour.
    var allowEarlyClose = OAuthUtils.isAnEarlyCloseHost(options.host);
    var callbackCalled = false;
    function passBackControl(response, result) {
        if (!callbackCalled) {
            callbackCalled = true;
            if (!(response.statusCode >= 200 && response.statusCode <= 299) && response.statusCode != 301 && response.statusCode != 302) {
                callback({
                    statusCode: response.statusCode,
                    data: result
                });
            } else {
                callback(null, result, response);
            }
        }
    }
    var result = "";
    //set the agent on the request options
    if (this._agent) {
        options.agent = this._agent;
    }
    var request = http_library.request(options);
    request.on('response', function(response) {
        response.on("data", function(chunk) {
            result += chunk;
        });
        response.on("close", function(err) {
            if (allowEarlyClose) {
                passBackControl(response, result);
            }
        });
        response.addListener("end", function() {
            passBackControl(response, result);
        });
    });
    request.on('error', function(e) {
        callbackCalled = true;
        callback(e);
    });
    if ((options.method == 'POST' || options.method == 'PUT') && post_body) {
        request.write(post_body);
    }
    request.end();
};
exports.OAuth2.prototype.getAuthorizeUrl = function(params) {
    var params = params || {};
    params['client_id'] = this._clientId;
    return this._baseSite + this._authorizeUrl + "?" + querystring.stringify(params);
};
exports.OAuth2.prototype.getOAuthAccessToken = function(code, params, callback) {
    var params = params || {};
    params['client_id'] = this._clientId;
    params['client_secret'] = this._clientSecret;
    var codeParam = params.grant_type === 'refresh_token' ? 'refresh_token' : 'code';
    params[codeParam] = code;
    var post_data = querystring.stringify(params);
    var post_headers = {
        'Content-Type': 'application/x-www-form-urlencoded'
    };
    this._request("POST", this._getAccessTokenUrl(), post_headers, post_data, null, function(error, data, response) {
        if (error) callback(error);
        else {
            var results;
            try {
                // As of http://tools.ietf.org/html/draft-ietf-oauth-v2-07
                // responses should be in JSON
                results = JSON.parse(data);
            } catch (e) {
                // .... However both Facebook + Github currently use rev05 of the spec
                // and neither seem to specify a content-type correctly in their response headers :(
                // clients of these services will suffer a *minor* performance cost of the exception
                // being thrown
                results = querystring.parse(data);
            }
            var access_token = results["access_token"];
            var refresh_token = results["refresh_token"];
            delete results["refresh_token"];
            callback(null, access_token, refresh_token, results); // callback results =-=
        }
    });
};
// Deprecated
exports.OAuth2.prototype.getProtectedResource = function(url, access_token, callback) {
    this._request("GET", url, {}, "", access_token, callback);
};
exports.OAuth2.prototype.get = function(url, access_token, callback) {
    if (this._useAuthorizationHeaderForGET) {
        var headers = {
            'Authorization': this.buildAuthHeader(access_token)
        };
        access_token = null;
    } else {
        headers = {};
    }
    this._request("GET", url, headers, "", access_token, callback);
};
}),
"[project]/aptiverse/aptiverse-ui/node_modules/oauth/index.js [app-rsc] (ecmascript)", ((__turbopack_context__, module, exports) => {

exports.OAuth = __turbopack_context__.r("[project]/aptiverse/aptiverse-ui/node_modules/oauth/lib/oauth.js [app-rsc] (ecmascript)").OAuth;
exports.OAuthEcho = __turbopack_context__.r("[project]/aptiverse/aptiverse-ui/node_modules/oauth/lib/oauth.js [app-rsc] (ecmascript)").OAuthEcho;
exports.OAuth2 = __turbopack_context__.r("[project]/aptiverse/aptiverse-ui/node_modules/oauth/lib/oauth2.js [app-rsc] (ecmascript)").OAuth2;
}),
"[project]/aptiverse/aptiverse-ui/node_modules/@panva/hkdf/dist/node/cjs/runtime/fallback.js [app-rsc] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
const crypto_1 = __turbopack_context__.r("[externals]/crypto [external] (crypto, cjs)");
exports.default = (digest, ikm, salt, info, keylen)=>{
    const hashlen = parseInt(digest.substr(3), 10) >> 3 || 20;
    const prk = (0, crypto_1.createHmac)(digest, salt.byteLength ? salt : new Uint8Array(hashlen)).update(ikm).digest();
    const N = Math.ceil(keylen / hashlen);
    const T = new Uint8Array(hashlen * N + info.byteLength + 1);
    let prev = 0;
    let start = 0;
    for(let c = 1; c <= N; c++){
        T.set(info, start);
        T[start + info.byteLength] = c;
        T.set((0, crypto_1.createHmac)(digest, prk).update(T.subarray(prev, start + info.byteLength + 1)).digest(), start);
        prev = start;
        start += hashlen;
    }
    return T.slice(0, keylen);
};
}),
"[project]/aptiverse/aptiverse-ui/node_modules/@panva/hkdf/dist/node/cjs/runtime/hkdf.js [app-rsc] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
const crypto = __turbopack_context__.r("[externals]/crypto [external] (crypto, cjs)");
const fallback_js_1 = __turbopack_context__.r("[project]/aptiverse/aptiverse-ui/node_modules/@panva/hkdf/dist/node/cjs/runtime/fallback.js [app-rsc] (ecmascript)");
let hkdf;
if (typeof crypto.hkdf === 'function' && !process.versions.electron) {
    hkdf = async (...args)=>new Promise((resolve, reject)=>{
            crypto.hkdf(...args, (err, arrayBuffer)=>{
                if (err) reject(err);
                else resolve(new Uint8Array(arrayBuffer));
            });
        });
}
exports.default = async (digest, ikm, salt, info, keylen)=>(hkdf || fallback_js_1.default)(digest, ikm, salt, info, keylen);
}),
"[project]/aptiverse/aptiverse-ui/node_modules/@panva/hkdf/dist/node/cjs/index.js [app-rsc] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = exports.hkdf = void 0;
const hkdf_js_1 = __turbopack_context__.r("[project]/aptiverse/aptiverse-ui/node_modules/@panva/hkdf/dist/node/cjs/runtime/hkdf.js [app-rsc] (ecmascript)");
function normalizeDigest(digest) {
    switch(digest){
        case 'sha256':
        case 'sha384':
        case 'sha512':
        case 'sha1':
            return digest;
        default:
            throw new TypeError('unsupported "digest" value');
    }
}
function normalizeUint8Array(input, label) {
    if (typeof input === 'string') return new TextEncoder().encode(input);
    if (!(input instanceof Uint8Array)) throw new TypeError(`"${label}"" must be an instance of Uint8Array or a string`);
    return input;
}
function normalizeIkm(input) {
    const ikm = normalizeUint8Array(input, 'ikm');
    if (!ikm.byteLength) throw new TypeError(`"ikm" must be at least one byte in length`);
    return ikm;
}
function normalizeInfo(input) {
    const info = normalizeUint8Array(input, 'info');
    if (info.byteLength > 1024) {
        throw TypeError('"info" must not contain more than 1024 bytes');
    }
    return info;
}
function normalizeKeylen(input, digest) {
    if (typeof input !== 'number' || !Number.isInteger(input) || input < 1) {
        throw new TypeError('"keylen" must be a positive integer');
    }
    const hashlen = parseInt(digest.substr(3), 10) >> 3 || 20;
    if (input > 255 * hashlen) {
        throw new TypeError('"keylen" too large');
    }
    return input;
}
async function hkdf(digest, ikm, salt, info, keylen) {
    return (0, hkdf_js_1.default)(normalizeDigest(digest), normalizeIkm(ikm), normalizeUint8Array(salt, 'salt'), normalizeInfo(info), normalizeKeylen(keylen, digest));
}
exports.hkdf = hkdf;
exports.default = hkdf;
}),
"[project]/aptiverse/aptiverse-ui/node_modules/uuid/dist/esm-node/index.js [app-rsc] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
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
"[project]/aptiverse/aptiverse-ui/node_modules/uuid/dist/esm-node/rng.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>rng
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/crypto [external] (crypto, cjs)");
;
const rnds8Pool = new Uint8Array(256); // # of random values to pre-allocate
let poolPtr = rnds8Pool.length;
function rng() {
    if (poolPtr > rnds8Pool.length - 16) {
        __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__["default"].randomFillSync(rnds8Pool);
        poolPtr = 0;
    }
    return rnds8Pool.slice(poolPtr, poolPtr += 16);
}
}),
"[project]/aptiverse/aptiverse-ui/node_modules/uuid/dist/esm-node/regex.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
const __TURBOPACK__default__export__ = /^(?:[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}|00000000-0000-0000-0000-000000000000)$/i;
}),
"[project]/aptiverse/aptiverse-ui/node_modules/uuid/dist/esm-node/validate.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$uuid$2f$dist$2f$esm$2d$node$2f$regex$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/uuid/dist/esm-node/regex.js [app-rsc] (ecmascript)");
;
function validate(uuid) {
    return typeof uuid === 'string' && __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$uuid$2f$dist$2f$esm$2d$node$2f$regex$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"].test(uuid);
}
const __TURBOPACK__default__export__ = validate;
}),
"[project]/aptiverse/aptiverse-ui/node_modules/uuid/dist/esm-node/stringify.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$uuid$2f$dist$2f$esm$2d$node$2f$validate$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/uuid/dist/esm-node/validate.js [app-rsc] (ecmascript)");
;
/**
 * Convert array of 16 byte values to UUID string format of the form:
 * XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX
 */ const byteToHex = [];
for(let i = 0; i < 256; ++i){
    byteToHex.push((i + 0x100).toString(16).substr(1));
}
function stringify(arr, offset = 0) {
    // Note: Be careful editing this code!  It's been tuned for performance
    // and works in ways you may not expect. See https://github.com/uuidjs/uuid/pull/434
    const uuid = (byteToHex[arr[offset + 0]] + byteToHex[arr[offset + 1]] + byteToHex[arr[offset + 2]] + byteToHex[arr[offset + 3]] + '-' + byteToHex[arr[offset + 4]] + byteToHex[arr[offset + 5]] + '-' + byteToHex[arr[offset + 6]] + byteToHex[arr[offset + 7]] + '-' + byteToHex[arr[offset + 8]] + byteToHex[arr[offset + 9]] + '-' + byteToHex[arr[offset + 10]] + byteToHex[arr[offset + 11]] + byteToHex[arr[offset + 12]] + byteToHex[arr[offset + 13]] + byteToHex[arr[offset + 14]] + byteToHex[arr[offset + 15]]).toLowerCase(); // Consistency check for valid UUID.  If this throws, it's likely due to one
    // of the following:
    // - One or more input array values don't map to a hex octet (leading to
    // "undefined" in the uuid)
    // - Invalid input values for the RFC `version` or `variant` fields
    if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$uuid$2f$dist$2f$esm$2d$node$2f$validate$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"])(uuid)) {
        throw TypeError('Stringified UUID is invalid');
    }
    return uuid;
}
const __TURBOPACK__default__export__ = stringify;
}),
"[project]/aptiverse/aptiverse-ui/node_modules/uuid/dist/esm-node/v1.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$uuid$2f$dist$2f$esm$2d$node$2f$rng$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/uuid/dist/esm-node/rng.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$uuid$2f$dist$2f$esm$2d$node$2f$stringify$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/uuid/dist/esm-node/stringify.js [app-rsc] (ecmascript)"); // **`v1()` - Generate time-based UUID**
;
;
//
// Inspired by https://github.com/LiosK/UUID.js
// and http://docs.python.org/library/uuid.html
let _nodeId;
let _clockseq; // Previous uuid creation time
let _lastMSecs = 0;
let _lastNSecs = 0; // See https://github.com/uuidjs/uuid for API details
function v1(options, buf, offset) {
    let i = buf && offset || 0;
    const b = buf || new Array(16);
    options = options || {};
    let node = options.node || _nodeId;
    let clockseq = options.clockseq !== undefined ? options.clockseq : _clockseq; // node and clockseq need to be initialized to random values if they're not
    // specified.  We do this lazily to minimize issues related to insufficient
    // system entropy.  See #189
    if (node == null || clockseq == null) {
        const seedBytes = options.random || (options.rng || __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$uuid$2f$dist$2f$esm$2d$node$2f$rng$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"])();
        if (node == null) {
            // Per 4.5, create and 48-bit node id, (47 random bits + multicast bit = 1)
            node = _nodeId = [
                seedBytes[0] | 0x01,
                seedBytes[1],
                seedBytes[2],
                seedBytes[3],
                seedBytes[4],
                seedBytes[5]
            ];
        }
        if (clockseq == null) {
            // Per 4.2.2, randomize (14 bit) clockseq
            clockseq = _clockseq = (seedBytes[6] << 8 | seedBytes[7]) & 0x3fff;
        }
    } // UUID timestamps are 100 nano-second units since the Gregorian epoch,
    // (1582-10-15 00:00).  JSNumbers aren't precise enough for this, so
    // time is handled internally as 'msecs' (integer milliseconds) and 'nsecs'
    // (100-nanoseconds offset from msecs) since unix epoch, 1970-01-01 00:00.
    let msecs = options.msecs !== undefined ? options.msecs : Date.now(); // Per 4.2.1.2, use count of uuid's generated during the current clock
    // cycle to simulate higher resolution clock
    let nsecs = options.nsecs !== undefined ? options.nsecs : _lastNSecs + 1; // Time since last uuid creation (in msecs)
    const dt = msecs - _lastMSecs + (nsecs - _lastNSecs) / 10000; // Per 4.2.1.2, Bump clockseq on clock regression
    if (dt < 0 && options.clockseq === undefined) {
        clockseq = clockseq + 1 & 0x3fff;
    } // Reset nsecs if clock regresses (new clockseq) or we've moved onto a new
    // time interval
    if ((dt < 0 || msecs > _lastMSecs) && options.nsecs === undefined) {
        nsecs = 0;
    } // Per 4.2.1.2 Throw error if too many uuids are requested
    if (nsecs >= 10000) {
        throw new Error("uuid.v1(): Can't create more than 10M uuids/sec");
    }
    _lastMSecs = msecs;
    _lastNSecs = nsecs;
    _clockseq = clockseq; // Per 4.1.4 - Convert from unix epoch to Gregorian epoch
    msecs += 12219292800000; // `time_low`
    const tl = ((msecs & 0xfffffff) * 10000 + nsecs) % 0x100000000;
    b[i++] = tl >>> 24 & 0xff;
    b[i++] = tl >>> 16 & 0xff;
    b[i++] = tl >>> 8 & 0xff;
    b[i++] = tl & 0xff; // `time_mid`
    const tmh = msecs / 0x100000000 * 10000 & 0xfffffff;
    b[i++] = tmh >>> 8 & 0xff;
    b[i++] = tmh & 0xff; // `time_high_and_version`
    b[i++] = tmh >>> 24 & 0xf | 0x10; // include version
    b[i++] = tmh >>> 16 & 0xff; // `clock_seq_hi_and_reserved` (Per 4.2.2 - include variant)
    b[i++] = clockseq >>> 8 | 0x80; // `clock_seq_low`
    b[i++] = clockseq & 0xff; // `node`
    for(let n = 0; n < 6; ++n){
        b[i + n] = node[n];
    }
    return buf || (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$uuid$2f$dist$2f$esm$2d$node$2f$stringify$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"])(b);
}
const __TURBOPACK__default__export__ = v1;
}),
"[project]/aptiverse/aptiverse-ui/node_modules/uuid/dist/esm-node/parse.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$uuid$2f$dist$2f$esm$2d$node$2f$validate$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/uuid/dist/esm-node/validate.js [app-rsc] (ecmascript)");
;
function parse(uuid) {
    if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$uuid$2f$dist$2f$esm$2d$node$2f$validate$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"])(uuid)) {
        throw TypeError('Invalid UUID');
    }
    let v;
    const arr = new Uint8Array(16); // Parse ########-....-....-....-............
    arr[0] = (v = parseInt(uuid.slice(0, 8), 16)) >>> 24;
    arr[1] = v >>> 16 & 0xff;
    arr[2] = v >>> 8 & 0xff;
    arr[3] = v & 0xff; // Parse ........-####-....-....-............
    arr[4] = (v = parseInt(uuid.slice(9, 13), 16)) >>> 8;
    arr[5] = v & 0xff; // Parse ........-....-####-....-............
    arr[6] = (v = parseInt(uuid.slice(14, 18), 16)) >>> 8;
    arr[7] = v & 0xff; // Parse ........-....-....-####-............
    arr[8] = (v = parseInt(uuid.slice(19, 23), 16)) >>> 8;
    arr[9] = v & 0xff; // Parse ........-....-....-....-############
    // (Use "/" to avoid 32-bit truncation when bit-shifting high-order bytes)
    arr[10] = (v = parseInt(uuid.slice(24, 36), 16)) / 0x10000000000 & 0xff;
    arr[11] = v / 0x100000000 & 0xff;
    arr[12] = v >>> 24 & 0xff;
    arr[13] = v >>> 16 & 0xff;
    arr[14] = v >>> 8 & 0xff;
    arr[15] = v & 0xff;
    return arr;
}
const __TURBOPACK__default__export__ = parse;
}),
"[project]/aptiverse/aptiverse-ui/node_modules/uuid/dist/esm-node/v35.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "DNS",
    ()=>DNS,
    "URL",
    ()=>URL,
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$uuid$2f$dist$2f$esm$2d$node$2f$stringify$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/uuid/dist/esm-node/stringify.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$uuid$2f$dist$2f$esm$2d$node$2f$parse$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/uuid/dist/esm-node/parse.js [app-rsc] (ecmascript)");
;
;
function stringToBytes(str) {
    str = unescape(encodeURIComponent(str)); // UTF8 escape
    const bytes = [];
    for(let i = 0; i < str.length; ++i){
        bytes.push(str.charCodeAt(i));
    }
    return bytes;
}
const DNS = '6ba7b810-9dad-11d1-80b4-00c04fd430c8';
const URL = '6ba7b811-9dad-11d1-80b4-00c04fd430c8';
function __TURBOPACK__default__export__(name, version, hashfunc) {
    function generateUUID(value, namespace, buf, offset) {
        if (typeof value === 'string') {
            value = stringToBytes(value);
        }
        if (typeof namespace === 'string') {
            namespace = (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$uuid$2f$dist$2f$esm$2d$node$2f$parse$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"])(namespace);
        }
        if (namespace.length !== 16) {
            throw TypeError('Namespace must be array-like (16 iterable integer values, 0-255)');
        } // Compute hash of namespace and value, Per 4.3
        // Future: Use spread syntax when supported on all platforms, e.g. `bytes =
        // hashfunc([...namespace, ... value])`
        let bytes = new Uint8Array(16 + value.length);
        bytes.set(namespace);
        bytes.set(value, namespace.length);
        bytes = hashfunc(bytes);
        bytes[6] = bytes[6] & 0x0f | version;
        bytes[8] = bytes[8] & 0x3f | 0x80;
        if (buf) {
            offset = offset || 0;
            for(let i = 0; i < 16; ++i){
                buf[offset + i] = bytes[i];
            }
            return buf;
        }
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$uuid$2f$dist$2f$esm$2d$node$2f$stringify$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"])(bytes);
    } // Function#name is not settable on some platforms (#270)
    try {
        generateUUID.name = name; // eslint-disable-next-line no-empty
    } catch (err) {} // For CommonJS default export support
    generateUUID.DNS = DNS;
    generateUUID.URL = URL;
    return generateUUID;
}
}),
"[project]/aptiverse/aptiverse-ui/node_modules/uuid/dist/esm-node/md5.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/crypto [external] (crypto, cjs)");
;
function md5(bytes) {
    if (Array.isArray(bytes)) {
        bytes = Buffer.from(bytes);
    } else if (typeof bytes === 'string') {
        bytes = Buffer.from(bytes, 'utf8');
    }
    return __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__["default"].createHash('md5').update(bytes).digest();
}
const __TURBOPACK__default__export__ = md5;
}),
"[project]/aptiverse/aptiverse-ui/node_modules/uuid/dist/esm-node/v3.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$uuid$2f$dist$2f$esm$2d$node$2f$v35$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/uuid/dist/esm-node/v35.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$uuid$2f$dist$2f$esm$2d$node$2f$md5$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/uuid/dist/esm-node/md5.js [app-rsc] (ecmascript)");
;
;
const v3 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$uuid$2f$dist$2f$esm$2d$node$2f$v35$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"])('v3', 0x30, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$uuid$2f$dist$2f$esm$2d$node$2f$md5$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"]);
const __TURBOPACK__default__export__ = v3;
}),
"[project]/aptiverse/aptiverse-ui/node_modules/uuid/dist/esm-node/v4.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$uuid$2f$dist$2f$esm$2d$node$2f$rng$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/uuid/dist/esm-node/rng.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$uuid$2f$dist$2f$esm$2d$node$2f$stringify$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/uuid/dist/esm-node/stringify.js [app-rsc] (ecmascript)");
;
;
function v4(options, buf, offset) {
    options = options || {};
    const rnds = options.random || (options.rng || __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$uuid$2f$dist$2f$esm$2d$node$2f$rng$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"])(); // Per 4.4, set bits for version and `clock_seq_hi_and_reserved`
    rnds[6] = rnds[6] & 0x0f | 0x40;
    rnds[8] = rnds[8] & 0x3f | 0x80; // Copy bytes to buffer, if provided
    if (buf) {
        offset = offset || 0;
        for(let i = 0; i < 16; ++i){
            buf[offset + i] = rnds[i];
        }
        return buf;
    }
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$uuid$2f$dist$2f$esm$2d$node$2f$stringify$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"])(rnds);
}
const __TURBOPACK__default__export__ = v4;
}),
"[project]/aptiverse/aptiverse-ui/node_modules/uuid/dist/esm-node/sha1.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/crypto [external] (crypto, cjs)");
;
function sha1(bytes) {
    if (Array.isArray(bytes)) {
        bytes = Buffer.from(bytes);
    } else if (typeof bytes === 'string') {
        bytes = Buffer.from(bytes, 'utf8');
    }
    return __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__["default"].createHash('sha1').update(bytes).digest();
}
const __TURBOPACK__default__export__ = sha1;
}),
"[project]/aptiverse/aptiverse-ui/node_modules/uuid/dist/esm-node/v5.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$uuid$2f$dist$2f$esm$2d$node$2f$v35$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/uuid/dist/esm-node/v35.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$uuid$2f$dist$2f$esm$2d$node$2f$sha1$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/uuid/dist/esm-node/sha1.js [app-rsc] (ecmascript)");
;
;
const v5 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$uuid$2f$dist$2f$esm$2d$node$2f$v35$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"])('v5', 0x50, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$uuid$2f$dist$2f$esm$2d$node$2f$sha1$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"]);
const __TURBOPACK__default__export__ = v5;
}),
"[project]/aptiverse/aptiverse-ui/node_modules/uuid/dist/esm-node/nil.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
const __TURBOPACK__default__export__ = '00000000-0000-0000-0000-000000000000';
}),
"[project]/aptiverse/aptiverse-ui/node_modules/uuid/dist/esm-node/version.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$uuid$2f$dist$2f$esm$2d$node$2f$validate$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/uuid/dist/esm-node/validate.js [app-rsc] (ecmascript)");
;
function version(uuid) {
    if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$uuid$2f$dist$2f$esm$2d$node$2f$validate$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"])(uuid)) {
        throw TypeError('Invalid UUID');
    }
    return parseInt(uuid.substr(14, 1), 16);
}
const __TURBOPACK__default__export__ = version;
}),
"[project]/aptiverse/aptiverse-ui/node_modules/uuid/dist/esm-node/index.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "NIL",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$uuid$2f$dist$2f$esm$2d$node$2f$nil$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"],
    "parse",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$uuid$2f$dist$2f$esm$2d$node$2f$parse$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"],
    "stringify",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$uuid$2f$dist$2f$esm$2d$node$2f$stringify$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"],
    "v1",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$uuid$2f$dist$2f$esm$2d$node$2f$v1$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"],
    "v3",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$uuid$2f$dist$2f$esm$2d$node$2f$v3$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"],
    "v4",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$uuid$2f$dist$2f$esm$2d$node$2f$v4$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"],
    "v5",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$uuid$2f$dist$2f$esm$2d$node$2f$v5$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"],
    "validate",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$uuid$2f$dist$2f$esm$2d$node$2f$validate$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"],
    "version",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$uuid$2f$dist$2f$esm$2d$node$2f$version$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$uuid$2f$dist$2f$esm$2d$node$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/uuid/dist/esm-node/index.js [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$uuid$2f$dist$2f$esm$2d$node$2f$v1$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/uuid/dist/esm-node/v1.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$uuid$2f$dist$2f$esm$2d$node$2f$v3$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/uuid/dist/esm-node/v3.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$uuid$2f$dist$2f$esm$2d$node$2f$v4$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/uuid/dist/esm-node/v4.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$uuid$2f$dist$2f$esm$2d$node$2f$v5$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/uuid/dist/esm-node/v5.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$uuid$2f$dist$2f$esm$2d$node$2f$nil$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/uuid/dist/esm-node/nil.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$uuid$2f$dist$2f$esm$2d$node$2f$version$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/uuid/dist/esm-node/version.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$uuid$2f$dist$2f$esm$2d$node$2f$validate$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/uuid/dist/esm-node/validate.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$uuid$2f$dist$2f$esm$2d$node$2f$stringify$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/uuid/dist/esm-node/stringify.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$aptiverse$2f$aptiverse$2d$ui$2f$node_modules$2f$uuid$2f$dist$2f$esm$2d$node$2f$parse$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/aptiverse/aptiverse-ui/node_modules/uuid/dist/esm-node/parse.js [app-rsc] (ecmascript)");
}),
"[project]/aptiverse/aptiverse-ui/node_modules/preact/dist/preact.js [app-rsc] (ecmascript)", ((__turbopack_context__, module, exports) => {

var n, l, t, u, r, i, o, e, f, c, s, p, a, h = {}, v = [], y = /acit|ex(?:s|g|n|p|$)|rph|grid|ows|mnc|ntw|ine[ch]|zoo|^ord|itera/i, w = Array.isArray;
function d(n, l) {
    for(var t in l)n[t] = l[t];
    return n;
}
function g(n) {
    n && n.parentNode && n.parentNode.removeChild(n);
}
function _(l, t, u) {
    var r, i, o, e = {};
    for(o in t)"key" == o ? r = t[o] : "ref" == o ? i = t[o] : e[o] = t[o];
    if (arguments.length > 2 && (e.children = arguments.length > 3 ? n.call(arguments, 2) : u), "function" == typeof l && null != l.defaultProps) for(o in l.defaultProps)void 0 === e[o] && (e[o] = l.defaultProps[o]);
    return x(l, e, r, i, null);
}
function x(n, u, r, i, o) {
    var e = {
        type: n,
        props: u,
        key: r,
        ref: i,
        __k: null,
        __: null,
        __b: 0,
        __e: null,
        __c: null,
        constructor: void 0,
        __v: null == o ? ++t : o,
        __i: -1,
        __u: 0
    };
    return null == o && null != l.vnode && l.vnode(e), e;
}
function m(n) {
    return n.children;
}
function b(n, l) {
    this.props = n, this.context = l;
}
function k(n, l) {
    if (null == l) return n.__ ? k(n.__, n.__i + 1) : null;
    for(var t; l < n.__k.length; l++)if (null != (t = n.__k[l]) && null != t.__e) return t.__e;
    return "function" == typeof n.type ? k(n) : null;
}
function S(n) {
    var l, t;
    if (null != (n = n.__) && null != n.__c) {
        for(n.__e = n.__c.base = null, l = 0; l < n.__k.length; l++)if (null != (t = n.__k[l]) && null != t.__e) {
            n.__e = n.__c.base = t.__e;
            break;
        }
        return S(n);
    }
}
function M(n) {
    (!n.__d && (n.__d = !0) && r.push(n) && !$.__r++ || i != l.debounceRendering) && ((i = l.debounceRendering) || o)($);
}
function $() {
    for(var n, t, u, i, o, f, c, s = 1; r.length;)r.length > s && r.sort(e), n = r.shift(), s = r.length, n.__d && (u = void 0, i = void 0, o = (i = (t = n).__v).__e, f = [], c = [], t.__P && ((u = d({}, i)).__v = i.__v + 1, l.vnode && l.vnode(u), j(t.__P, u, i, t.__n, t.__P.namespaceURI, 32 & i.__u ? [
        o
    ] : null, f, null == o ? k(i) : o, !!(32 & i.__u), c), u.__v = i.__v, u.__.__k[u.__i] = u, O(f, u, c), i.__e = i.__ = null, u.__e != o && S(u)));
    $.__r = 0;
}
function C(n, l, t, u, r, i, o, e, f, c, s) {
    var p, a, y, w, d, g, _, x = u && u.__k || v, m = l.length;
    for(f = I(t, l, x, f, m), p = 0; p < m; p++)null != (y = t.__k[p]) && (a = -1 == y.__i ? h : x[y.__i] || h, y.__i = p, g = j(n, y, a, r, i, o, e, f, c, s), w = y.__e, y.ref && a.ref != y.ref && (a.ref && V(a.ref, null, y), s.push(y.ref, y.__c || w, y)), null == d && null != w && (d = w), (_ = !!(4 & y.__u)) || a.__k === y.__k ? f = P(y, f, n, _) : "function" == typeof y.type && void 0 !== g ? f = g : w && (f = w.nextSibling), y.__u &= -7);
    return t.__e = d, f;
}
function I(n, l, t, u, r) {
    var i, o, e, f, c, s = t.length, p = s, a = 0;
    for(n.__k = new Array(r), i = 0; i < r; i++)null != (o = l[i]) && "boolean" != typeof o && "function" != typeof o ? (f = i + a, (o = n.__k[i] = "string" == typeof o || "number" == typeof o || "bigint" == typeof o || o.constructor == String ? x(null, o, null, null, null) : w(o) ? x(m, {
        children: o
    }, null, null, null) : null == o.constructor && o.__b > 0 ? x(o.type, o.props, o.key, o.ref ? o.ref : null, o.__v) : o).__ = n, o.__b = n.__b + 1, e = null, -1 != (c = o.__i = A(o, t, f, p)) && (p--, (e = t[c]) && (e.__u |= 2)), null == e || null == e.__v ? (-1 == c && (r > s ? a-- : r < s && a++), "function" != typeof o.type && (o.__u |= 4)) : c != f && (c == f - 1 ? a-- : c == f + 1 ? a++ : (c > f ? a-- : a++, o.__u |= 4))) : n.__k[i] = null;
    if (p) for(i = 0; i < s; i++)null != (e = t[i]) && 0 == (2 & e.__u) && (e.__e == u && (u = k(e)), q(e, e));
    return u;
}
function P(n, l, t, u) {
    var r, i;
    if ("function" == typeof n.type) {
        for(r = n.__k, i = 0; r && i < r.length; i++)r[i] && (r[i].__ = n, l = P(r[i], l, t, u));
        return l;
    }
    n.__e != l && (u && (l && n.type && !l.parentNode && (l = k(n)), t.insertBefore(n.__e, l || null)), l = n.__e);
    do {
        l = l && l.nextSibling;
    }while (null != l && 8 == l.nodeType)
    return l;
}
function A(n, l, t, u) {
    var r, i, o, e = n.key, f = n.type, c = l[t], s = null != c && 0 == (2 & c.__u);
    if (null === c && null == n.key || s && e == c.key && f == c.type) return t;
    if (u > (s ? 1 : 0)) {
        for(r = t - 1, i = t + 1; r >= 0 || i < l.length;)if (null != (c = l[o = r >= 0 ? r-- : i++]) && 0 == (2 & c.__u) && e == c.key && f == c.type) return o;
    }
    return -1;
}
function H(n, l, t) {
    "-" == l[0] ? n.setProperty(l, null == t ? "" : t) : n[l] = null == t ? "" : "number" != typeof t || y.test(l) ? t : t + "px";
}
function L(n, l, t, u, r) {
    var i, o;
    n: if ("style" == l) if ("string" == typeof t) n.style.cssText = t;
    else {
        if ("string" == typeof u && (n.style.cssText = u = ""), u) for(l in u)t && l in t || H(n.style, l, "");
        if (t) for(l in t)u && t[l] == u[l] || H(n.style, l, t[l]);
    }
    else if ("o" == l[0] && "n" == l[1]) i = l != (l = l.replace(f, "$1")), o = l.toLowerCase(), l = o in n || "onFocusOut" == l || "onFocusIn" == l ? o.slice(2) : l.slice(2), n.l || (n.l = {}), n.l[l + i] = t, t ? u ? t.t = u.t : (t.t = c, n.addEventListener(l, i ? p : s, i)) : n.removeEventListener(l, i ? p : s, i);
    else {
        if ("http://www.w3.org/2000/svg" == r) l = l.replace(/xlink(H|:h)/, "h").replace(/sName$/, "s");
        else if ("width" != l && "height" != l && "href" != l && "list" != l && "form" != l && "tabIndex" != l && "download" != l && "rowSpan" != l && "colSpan" != l && "role" != l && "popover" != l && l in n) try {
            n[l] = null == t ? "" : t;
            break n;
        } catch (n) {}
        "function" == typeof t || (null == t || !1 === t && "-" != l[4] ? n.removeAttribute(l) : n.setAttribute(l, "popover" == l && 1 == t ? "" : t));
    }
}
function T(n) {
    return function(t) {
        if (this.l) {
            var u = this.l[t.type + n];
            if (null == t.u) t.u = c++;
            else if (t.u < u.t) return;
            return u(l.event ? l.event(t) : t);
        }
    };
}
function j(n, t, u, r, i, o, e, f, c, s) {
    var p, a, h, v, y, _, x, k, S, M, $, I, P, A, H, L, T, j = t.type;
    if (null != t.constructor) return null;
    128 & u.__u && (c = !!(32 & u.__u), o = [
        f = t.__e = u.__e
    ]), (p = l.__b) && p(t);
    n: if ("function" == typeof j) try {
        if (k = t.props, S = "prototype" in j && j.prototype.render, M = (p = j.contextType) && r[p.__c], $ = p ? M ? M.props.value : p.__ : r, u.__c ? x = (a = t.__c = u.__c).__ = a.__E : (S ? t.__c = a = new j(k, $) : (t.__c = a = new b(k, $), a.constructor = j, a.render = B), M && M.sub(a), a.props = k, a.state || (a.state = {}), a.context = $, a.__n = r, h = a.__d = !0, a.__h = [], a._sb = []), S && null == a.__s && (a.__s = a.state), S && null != j.getDerivedStateFromProps && (a.__s == a.state && (a.__s = d({}, a.__s)), d(a.__s, j.getDerivedStateFromProps(k, a.__s))), v = a.props, y = a.state, a.__v = t, h) S && null == j.getDerivedStateFromProps && null != a.componentWillMount && a.componentWillMount(), S && null != a.componentDidMount && a.__h.push(a.componentDidMount);
        else {
            if (S && null == j.getDerivedStateFromProps && k !== v && null != a.componentWillReceiveProps && a.componentWillReceiveProps(k, $), !a.__e && null != a.shouldComponentUpdate && !1 === a.shouldComponentUpdate(k, a.__s, $) || t.__v == u.__v) {
                for(t.__v != u.__v && (a.props = k, a.state = a.__s, a.__d = !1), t.__e = u.__e, t.__k = u.__k, t.__k.some(function(n) {
                    n && (n.__ = t);
                }), I = 0; I < a._sb.length; I++)a.__h.push(a._sb[I]);
                a._sb = [], a.__h.length && e.push(a);
                break n;
            }
            null != a.componentWillUpdate && a.componentWillUpdate(k, a.__s, $), S && null != a.componentDidUpdate && a.__h.push(function() {
                a.componentDidUpdate(v, y, _);
            });
        }
        if (a.context = $, a.props = k, a.__P = n, a.__e = !1, P = l.__r, A = 0, S) {
            for(a.state = a.__s, a.__d = !1, P && P(t), p = a.render(a.props, a.state, a.context), H = 0; H < a._sb.length; H++)a.__h.push(a._sb[H]);
            a._sb = [];
        } else do {
            a.__d = !1, P && P(t), p = a.render(a.props, a.state, a.context), a.state = a.__s;
        }while (a.__d && ++A < 25)
        a.state = a.__s, null != a.getChildContext && (r = d(d({}, r), a.getChildContext())), S && !h && null != a.getSnapshotBeforeUpdate && (_ = a.getSnapshotBeforeUpdate(v, y)), L = p, null != p && p.type === m && null == p.key && (L = z(p.props.children)), f = C(n, w(L) ? L : [
            L
        ], t, u, r, i, o, e, f, c, s), a.base = t.__e, t.__u &= -161, a.__h.length && e.push(a), x && (a.__E = a.__ = null);
    } catch (n) {
        if (t.__v = null, c || null != o) if (n.then) {
            for(t.__u |= c ? 160 : 128; f && 8 == f.nodeType && f.nextSibling;)f = f.nextSibling;
            o[o.indexOf(f)] = null, t.__e = f;
        } else {
            for(T = o.length; T--;)g(o[T]);
            F(t);
        }
        else t.__e = u.__e, t.__k = u.__k, n.then || F(t);
        l.__e(n, t, u);
    }
    else null == o && t.__v == u.__v ? (t.__k = u.__k, t.__e = u.__e) : f = t.__e = N(u.__e, t, u, r, i, o, e, c, s);
    return (p = l.diffed) && p(t), 128 & t.__u ? void 0 : f;
}
function F(n) {
    n && n.__c && (n.__c.__e = !0), n && n.__k && n.__k.forEach(F);
}
function O(n, t, u) {
    for(var r = 0; r < u.length; r++)V(u[r], u[++r], u[++r]);
    l.__c && l.__c(t, n), n.some(function(t) {
        try {
            n = t.__h, t.__h = [], n.some(function(n) {
                n.call(t);
            });
        } catch (n) {
            l.__e(n, t.__v);
        }
    });
}
function z(n) {
    return "object" != typeof n || null == n || n.__b && n.__b > 0 ? n : w(n) ? n.map(z) : d({}, n);
}
function N(t, u, r, i, o, e, f, c, s) {
    var p, a, v, y, d, _, x, m = r.props, b = u.props, S = u.type;
    if ("svg" == S ? o = "http://www.w3.org/2000/svg" : "math" == S ? o = "http://www.w3.org/1998/Math/MathML" : o || (o = "http://www.w3.org/1999/xhtml"), null != e) {
        for(p = 0; p < e.length; p++)if ((d = e[p]) && "setAttribute" in d == !!S && (S ? d.localName == S : 3 == d.nodeType)) {
            t = d, e[p] = null;
            break;
        }
    }
    if (null == t) {
        if (null == S) return document.createTextNode(b);
        t = document.createElementNS(o, S, b.is && b), c && (l.__m && l.__m(u, e), c = !1), e = null;
    }
    if (null == S) m === b || c && t.data == b || (t.data = b);
    else {
        if (e = e && n.call(t.childNodes), m = r.props || h, !c && null != e) for(m = {}, p = 0; p < t.attributes.length; p++)m[(d = t.attributes[p]).name] = d.value;
        for(p in m)if (d = m[p], "children" == p) ;
        else if ("dangerouslySetInnerHTML" == p) v = d;
        else if (!(p in b)) {
            if ("value" == p && "defaultValue" in b || "checked" == p && "defaultChecked" in b) continue;
            L(t, p, null, d, o);
        }
        for(p in b)d = b[p], "children" == p ? y = d : "dangerouslySetInnerHTML" == p ? a = d : "value" == p ? _ = d : "checked" == p ? x = d : c && "function" != typeof d || m[p] === d || L(t, p, d, m[p], o);
        if (a) c || v && (a.__html == v.__html || a.__html == t.innerHTML) || (t.innerHTML = a.__html), u.__k = [];
        else if (v && (t.innerHTML = ""), C("template" == u.type ? t.content : t, w(y) ? y : [
            y
        ], u, r, i, "foreignObject" == S ? "http://www.w3.org/1999/xhtml" : o, e, f, e ? e[0] : r.__k && k(r, 0), c, s), null != e) for(p = e.length; p--;)g(e[p]);
        c || (p = "value", "progress" == S && null == _ ? t.removeAttribute("value") : null != _ && (_ !== t[p] || "progress" == S && !_ || "option" == S && _ != m[p]) && L(t, p, _, m[p], o), p = "checked", null != x && x != t[p] && L(t, p, x, m[p], o));
    }
    return t;
}
function V(n, t, u) {
    try {
        if ("function" == typeof n) {
            var r = "function" == typeof n.__u;
            r && n.__u(), r && null == t || (n.__u = n(t));
        } else n.current = t;
    } catch (n) {
        l.__e(n, u);
    }
}
function q(n, t, u) {
    var r, i;
    if (l.unmount && l.unmount(n), (r = n.ref) && (r.current && r.current != n.__e || V(r, null, t)), null != (r = n.__c)) {
        if (r.componentWillUnmount) try {
            r.componentWillUnmount();
        } catch (n) {
            l.__e(n, t);
        }
        r.base = r.__P = null;
    }
    if (r = n.__k) for(i = 0; i < r.length; i++)r[i] && q(r[i], t, u || "function" != typeof n.type);
    u || g(n.__e), n.__c = n.__ = n.__e = void 0;
}
function B(n, l, t) {
    return this.constructor(n, t);
}
function D(t, u, r) {
    var i, o, e, f;
    u == document && (u = document.documentElement), l.__ && l.__(t, u), o = (i = "function" == typeof r) ? null : r && r.__k || u.__k, e = [], f = [], j(u, t = (!i && r || u).__k = _(m, null, [
        t
    ]), o || h, h, u.namespaceURI, !i && r ? [
        r
    ] : o ? null : u.firstChild ? n.call(u.childNodes) : null, e, !i && r ? r : o ? o.__e : u.firstChild, i, f), O(e, t, f);
}
n = v.slice, l = {
    __e: function(n, l, t, u) {
        for(var r, i, o; l = l.__;)if ((r = l.__c) && !r.__) try {
            if ((i = r.constructor) && null != i.getDerivedStateFromError && (r.setState(i.getDerivedStateFromError(n)), o = r.__d), null != r.componentDidCatch && (r.componentDidCatch(n, u || {}), o = r.__d), o) return r.__E = r;
        } catch (l) {
            n = l;
        }
        throw n;
    }
}, t = 0, u = function(n) {
    return null != n && null == n.constructor;
}, b.prototype.setState = function(n, l) {
    var t;
    t = null != this.__s && this.__s != this.state ? this.__s : this.__s = d({}, this.state), "function" == typeof n && (n = n(d({}, t), this.props)), n && d(t, n), null != n && this.__v && (l && this._sb.push(l), M(this));
}, b.prototype.forceUpdate = function(n) {
    this.__v && (this.__e = !0, n && this.__h.push(n), M(this));
}, b.prototype.render = m, r = [], o = "function" == typeof Promise ? Promise.prototype.then.bind(Promise.resolve()) : setTimeout, e = function(n, l) {
    return n.__v.__b - l.__v.__b;
}, $.__r = 0, f = /(PointerCapture)$|Capture$/i, c = 0, s = T(!1), p = T(!0), a = 0, exports.Component = b, exports.Fragment = m, exports.cloneElement = function(l, t, u) {
    var r, i, o, e, f = d({}, l.props);
    for(o in l.type && l.type.defaultProps && (e = l.type.defaultProps), t)"key" == o ? r = t[o] : "ref" == o ? i = t[o] : f[o] = void 0 === t[o] && null != e ? e[o] : t[o];
    return arguments.length > 2 && (f.children = arguments.length > 3 ? n.call(arguments, 2) : u), x(l.type, f, r || l.key, i || l.ref, null);
}, exports.createContext = function(n) {
    function l(n) {
        var t, u;
        return this.getChildContext || (t = new Set, (u = {})[l.__c] = this, this.getChildContext = function() {
            return u;
        }, this.componentWillUnmount = function() {
            t = null;
        }, this.shouldComponentUpdate = function(n) {
            this.props.value != n.value && t.forEach(function(n) {
                n.__e = !0, M(n);
            });
        }, this.sub = function(n) {
            t.add(n);
            var l = n.componentWillUnmount;
            n.componentWillUnmount = function() {
                t && t.delete(n), l && l.call(n);
            };
        }), n.children;
    }
    return l.__c = "__cC" + a++, l.__ = n, l.Provider = l.__l = (l.Consumer = function(n, l) {
        return n.children(l);
    }).contextType = l, l;
}, exports.createElement = _, exports.createRef = function() {
    return {
        current: null
    };
}, exports.h = _, exports.hydrate = function n(l, t) {
    D(l, t, n);
}, exports.isValidElement = u, exports.options = l, exports.render = D, exports.toChildArray = function n(l, t) {
    return t = t || [], null == l || "boolean" == typeof l || (w(l) ? l.some(function(l) {
        n(l, t);
    }) : t.push(l)), t;
}; //# sourceMappingURL=preact.js.map
}),
"[project]/aptiverse/aptiverse-ui/node_modules/preact-render-to-string/dist/commonjs.js [app-rsc] (ecmascript)", ((__turbopack_context__, module, exports) => {

!function(e, t) {
    ("TURBOPACK compile-time truthy", 1) ? t(exports, __turbopack_context__.r("[project]/aptiverse/aptiverse-ui/node_modules/preact/dist/preact.js [app-rsc] (ecmascript)")) : "TURBOPACK unreachable";
}(/*TURBOPACK member replacement*/ __turbopack_context__.e, function(e, t) {
    var n = /acit|ex(?:s|g|n|p|$)|rph|grid|ows|mnc|ntw|ine[ch]|zoo|^ord|^--/i, r = /^(area|base|br|col|embed|hr|img|input|link|meta|param|source|track|wbr)$/, o = /[\s\n\\/='"\0<>]/, i = /^xlink:?./, s = /["&<]/;
    function a(e) {
        if (!1 === s.test(e += "")) return e;
        for(var t = 0, n = 0, r = "", o = ""; n < e.length; n++){
            switch(e.charCodeAt(n)){
                case 34:
                    o = "&quot;";
                    break;
                case 38:
                    o = "&amp;";
                    break;
                case 60:
                    o = "&lt;";
                    break;
                default:
                    continue;
            }
            n !== t && (r += e.slice(t, n)), r += o, t = n + 1;
        }
        return n !== t && (r += e.slice(t, n)), r;
    }
    var l = function(e, t) {
        return String(e).replace(/(\n+)/g, "$1" + (t || "\t"));
    }, f = function(e, t, n) {
        return String(e).length > (t || 40) || !n && -1 !== String(e).indexOf("\n") || -1 !== String(e).indexOf("<");
    }, u = {}, p = /([A-Z])/g;
    function c(e) {
        var t = "";
        for(var r in e){
            var o = e[r];
            null != o && "" !== o && (t && (t += " "), t += "-" == r[0] ? r : u[r] || (u[r] = r.replace(p, "-$1").toLowerCase()), t = "number" == typeof o && !1 === n.test(r) ? t + ": " + o + "px;" : t + ": " + o + ";");
        }
        return t || void 0;
    }
    function _(e, t) {
        return Array.isArray(t) ? t.reduce(_, e) : null != t && !1 !== t && e.push(t), e;
    }
    function d() {
        this.__d = !0;
    }
    function v(e, t) {
        return {
            __v: e,
            context: t,
            props: e.props,
            setState: d,
            forceUpdate: d,
            __d: !0,
            __h: []
        };
    }
    function g(e, t) {
        var n = e.contextType, r = n && t[n.__c];
        return null != n ? r ? r.props.value : n.__ : t;
    }
    var h = [];
    function y(e, n, s, u, p, d) {
        if (null == e || "boolean" == typeof e) return "";
        if ("object" != typeof e) return "function" == typeof e ? "" : a(e);
        var m = s.pretty, b = m && "string" == typeof m ? m : "\t";
        if (Array.isArray(e)) {
            for(var x = "", k = 0; k < e.length; k++)m && k > 0 && (x += "\n"), x += y(e[k], n, s, u, p, d);
            return x;
        }
        if (void 0 !== e.constructor) return "";
        var S, w = e.type, C = e.props, O = !1;
        if ("function" == typeof w) {
            if (O = !0, !s.shallow || !u && !1 !== s.renderRootComponent) {
                if (w === t.Fragment) {
                    var j = [];
                    return _(j, e.props.children), y(j, n, s, !1 !== s.shallowHighOrder, p, d);
                }
                var F, A = e.__c = v(e, n);
                t.options.__b && t.options.__b(e);
                var T = t.options.__r;
                if (w.prototype && "function" == typeof w.prototype.render) {
                    var H = g(w, n);
                    (A = e.__c = new w(C, H)).__v = e, A._dirty = A.__d = !0, A.props = C, null == A.state && (A.state = {}), null == A._nextState && null == A.__s && (A._nextState = A.__s = A.state), A.context = H, w.getDerivedStateFromProps ? A.state = Object.assign({}, A.state, w.getDerivedStateFromProps(A.props, A.state)) : A.componentWillMount && (A.componentWillMount(), A.state = A._nextState !== A.state ? A._nextState : A.__s !== A.state ? A.__s : A.state), T && T(e), F = A.render(A.props, A.state, A.context);
                } else for(var M = g(w, n), L = 0; A.__d && L++ < 25;)A.__d = !1, T && T(e), F = w.call(e.__c, C, M);
                return A.getChildContext && (n = Object.assign({}, n, A.getChildContext())), t.options.diffed && t.options.diffed(e), y(F, n, s, !1 !== s.shallowHighOrder, p, d);
            }
            w = (S = w).displayName || S !== Function && S.name || function(e) {
                var t = (Function.prototype.toString.call(e).match(/^\s*function\s+([^( ]+)/) || "")[1];
                if (!t) {
                    for(var n = -1, r = h.length; r--;)if (h[r] === e) {
                        n = r;
                        break;
                    }
                    n < 0 && (n = h.push(e) - 1), t = "UnnamedComponent" + n;
                }
                return t;
            }(S);
        }
        var E, $, D = "<" + w;
        if (C) {
            var N = Object.keys(C);
            s && !0 === s.sortAttributes && N.sort();
            for(var P = 0; P < N.length; P++){
                var R = N[P], W = C[R];
                if ("children" !== R) {
                    if (!o.test(R) && (s && s.allAttributes || "key" !== R && "ref" !== R && "__self" !== R && "__source" !== R)) {
                        if ("defaultValue" === R) R = "value";
                        else if ("defaultChecked" === R) R = "checked";
                        else if ("defaultSelected" === R) R = "selected";
                        else if ("className" === R) {
                            if (void 0 !== C.class) continue;
                            R = "class";
                        } else p && i.test(R) && (R = R.toLowerCase().replace(/^xlink:?/, "xlink:"));
                        if ("htmlFor" === R) {
                            if (C.for) continue;
                            R = "for";
                        }
                        "style" === R && W && "object" == typeof W && (W = c(W)), "a" === R[0] && "r" === R[1] && "boolean" == typeof W && (W = String(W));
                        var q = s.attributeHook && s.attributeHook(R, W, n, s, O);
                        if (q || "" === q) D += q;
                        else if ("dangerouslySetInnerHTML" === R) $ = W && W.__html;
                        else if ("textarea" === w && "value" === R) E = W;
                        else if ((W || 0 === W || "" === W) && "function" != typeof W) {
                            if (!(!0 !== W && "" !== W || (W = R, s && s.xml))) {
                                D = D + " " + R;
                                continue;
                            }
                            if ("value" === R) {
                                if ("select" === w) {
                                    d = W;
                                    continue;
                                }
                                "option" === w && d == W && void 0 === C.selected && (D += " selected");
                            }
                            D = D + " " + R + '="' + a(W) + '"';
                        }
                    }
                } else E = W;
            }
        }
        if (m) {
            var I = D.replace(/\n\s*/, " ");
            I === D || ~I.indexOf("\n") ? m && ~D.indexOf("\n") && (D += "\n") : D = I;
        }
        if (D += ">", o.test(w)) throw new Error(w + " is not a valid HTML tag name in " + D);
        var U, V = r.test(w) || s.voidElements && s.voidElements.test(w), z = [];
        if ($) m && f($) && ($ = "\n" + b + l($, b)), D += $;
        else if (null != E && _(U = [], E).length) {
            for(var Z = m && ~D.indexOf("\n"), B = !1, G = 0; G < U.length; G++){
                var J = U[G];
                if (null != J && !1 !== J) {
                    var K = y(J, n, s, !0, "svg" === w || "foreignObject" !== w && p, d);
                    if (m && !Z && f(K) && (Z = !0), K) if (m) {
                        var Q = K.length > 0 && "<" != K[0];
                        B && Q ? z[z.length - 1] += K : z.push(K), B = Q;
                    } else z.push(K);
                }
            }
            if (m && Z) for(var X = z.length; X--;)z[X] = "\n" + b + l(z[X], b);
        }
        if (z.length || $) D += z.join("");
        else if (s && s.xml) return D.substring(0, D.length - 1) + " />";
        return !V || U || $ ? (m && ~D.indexOf("\n") && (D += "\n"), D = D + "</" + w + ">") : D = D.replace(/>$/, " />"), D;
    }
    var m = {
        shallow: !0
    };
    k.render = k;
    var b = function(e, t) {
        return k(e, t, m);
    }, x = [];
    function k(e, n, r) {
        n = n || {};
        var o = t.options.__s;
        t.options.__s = !0;
        var i, s = t.h(t.Fragment, null);
        return s.__k = [
            e
        ], i = r && (r.pretty || r.voidElements || r.sortAttributes || r.shallow || r.allAttributes || r.xml || r.attributeHook) ? y(e, n, r) : F(e, n, !1, void 0, s), t.options.__c && t.options.__c(e, x), t.options.__s = o, x.length = 0, i;
    }
    function S(e) {
        return null == e || "boolean" == typeof e ? null : "string" == typeof e || "number" == typeof e || "bigint" == typeof e ? t.h(null, null, e) : e;
    }
    function w(e, t) {
        return "className" === e ? "class" : "htmlFor" === e ? "for" : "defaultValue" === e ? "value" : "defaultChecked" === e ? "checked" : "defaultSelected" === e ? "selected" : t && i.test(e) ? e.toLowerCase().replace(/^xlink:?/, "xlink:") : e;
    }
    function C(e, t) {
        return "style" === e && null != t && "object" == typeof t ? c(t) : "a" === e[0] && "r" === e[1] && "boolean" == typeof t ? String(t) : t;
    }
    var O = Array.isArray, j = Object.assign;
    function F(e, n, i, s, l) {
        if (null == e || !0 === e || !1 === e || "" === e) return "";
        if ("object" != typeof e) return "function" == typeof e ? "" : a(e);
        if (O(e)) {
            var f = "";
            l.__k = e;
            for(var u = 0; u < e.length; u++)f += F(e[u], n, i, s, l), e[u] = S(e[u]);
            return f;
        }
        if (void 0 !== e.constructor) return "";
        e.__ = l, t.options.__b && t.options.__b(e);
        var p = e.type, c = e.props;
        if ("function" == typeof p) {
            var _;
            if (p === t.Fragment) _ = c.children;
            else {
                _ = p.prototype && "function" == typeof p.prototype.render ? function(e, n) {
                    var r = e.type, o = g(r, n), i = new r(e.props, o);
                    e.__c = i, i.__v = e, i.__d = !0, i.props = e.props, null == i.state && (i.state = {}), null == i.__s && (i.__s = i.state), i.context = o, r.getDerivedStateFromProps ? i.state = j({}, i.state, r.getDerivedStateFromProps(i.props, i.state)) : i.componentWillMount && (i.componentWillMount(), i.state = i.__s !== i.state ? i.__s : i.state);
                    var s = t.options.__r;
                    return s && s(e), i.render(i.props, i.state, i.context);
                }(e, n) : function(e, n) {
                    var r, o = v(e, n), i = g(e.type, n);
                    e.__c = o;
                    for(var s = t.options.__r, a = 0; o.__d && a++ < 25;)o.__d = !1, s && s(e), r = e.type.call(o, e.props, i);
                    return r;
                }(e, n);
                var d = e.__c;
                d.getChildContext && (n = j({}, n, d.getChildContext()));
            }
            var h = F(_ = null != _ && _.type === t.Fragment && null == _.key ? _.props.children : _, n, i, s, e);
            return t.options.diffed && t.options.diffed(e), e.__ = void 0, t.options.unmount && t.options.unmount(e), h;
        }
        var y, m, b = "<";
        if (b += p, c) for(var x in y = c.children, c){
            var k = c[x];
            if (!("key" === x || "ref" === x || "__self" === x || "__source" === x || "children" === x || "className" === x && "class" in c || "htmlFor" === x && "for" in c || o.test(x))) {
                if (k = C(x = w(x, i), k), "dangerouslySetInnerHTML" === x) m = k && k.__html;
                else if ("textarea" === p && "value" === x) y = k;
                else if ((k || 0 === k || "" === k) && "function" != typeof k) {
                    if (!0 === k || "" === k) {
                        k = x, b = b + " " + x;
                        continue;
                    }
                    if ("value" === x) {
                        if ("select" === p) {
                            s = k;
                            continue;
                        }
                        "option" !== p || s != k || "selected" in c || (b += " selected");
                    }
                    b = b + " " + x + '="' + a(k) + '"';
                }
            }
        }
        var A = b;
        if (b += ">", o.test(p)) throw new Error(p + " is not a valid HTML tag name in " + b);
        var T = "", H = !1;
        if (m) T += m, H = !0;
        else if ("string" == typeof y) T += a(y), H = !0;
        else if (O(y)) {
            e.__k = y;
            for(var M = 0; M < y.length; M++){
                var L = y[M];
                if (y[M] = S(L), null != L && !1 !== L) {
                    var E = F(L, n, "svg" === p || "foreignObject" !== p && i, s, e);
                    E && (T += E, H = !0);
                }
            }
        } else if (null != y && !1 !== y && !0 !== y) {
            e.__k = [
                S(y)
            ];
            var $ = F(y, n, "svg" === p || "foreignObject" !== p && i, s, e);
            $ && (T += $, H = !0);
        }
        if (t.options.diffed && t.options.diffed(e), e.__ = void 0, t.options.unmount && t.options.unmount(e), H) b += T;
        else if (r.test(p)) return A + " />";
        return b + "</" + p + ">";
    }
    k.shallowRender = b, e.default = k, e.render = k, e.renderToStaticMarkup = k, e.renderToString = k, e.shallowRender = b;
}); //# sourceMappingURL=index.js.map
}),
"[project]/aptiverse/aptiverse-ui/node_modules/preact-render-to-string/dist/index.js [app-rsc] (ecmascript)", ((__turbopack_context__, module, exports) => {

module.exports = __turbopack_context__.r("[project]/aptiverse/aptiverse-ui/node_modules/preact-render-to-string/dist/commonjs.js [app-rsc] (ecmascript)").default;
}),
"[project]/aptiverse/aptiverse-ui/node_modules/cookie/index.js [app-rsc] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/*!
 * cookie
 * Copyright(c) 2012-2014 Roman Shtylman
 * Copyright(c) 2015 Douglas Christopher Wilson
 * MIT Licensed
 */ /**
 * Module exports.
 * @public
 */ exports.parse = parse;
exports.serialize = serialize;
/**
 * Module variables.
 * @private
 */ var __toString = Object.prototype.toString;
var __hasOwnProperty = Object.prototype.hasOwnProperty;
/**
 * RegExp to match cookie-name in RFC 6265 sec 4.1.1
 * This refers out to the obsoleted definition of token in RFC 2616 sec 2.2
 * which has been replaced by the token definition in RFC 7230 appendix B.
 *
 * cookie-name       = token
 * token             = 1*tchar
 * tchar             = "!" / "#" / "$" / "%" / "&" / "'" /
 *                     "*" / "+" / "-" / "." / "^" / "_" /
 *                     "`" / "|" / "~" / DIGIT / ALPHA
 */ var cookieNameRegExp = /^[!#$%&'*+\-.^_`|~0-9A-Za-z]+$/;
/**
 * RegExp to match cookie-value in RFC 6265 sec 4.1.1
 *
 * cookie-value      = *cookie-octet / ( DQUOTE *cookie-octet DQUOTE )
 * cookie-octet      = %x21 / %x23-2B / %x2D-3A / %x3C-5B / %x5D-7E
 *                     ; US-ASCII characters excluding CTLs,
 *                     ; whitespace DQUOTE, comma, semicolon,
 *                     ; and backslash
 */ var cookieValueRegExp = /^("?)[\u0021\u0023-\u002B\u002D-\u003A\u003C-\u005B\u005D-\u007E]*\1$/;
/**
 * RegExp to match domain-value in RFC 6265 sec 4.1.1
 *
 * domain-value      = <subdomain>
 *                     ; defined in [RFC1034], Section 3.5, as
 *                     ; enhanced by [RFC1123], Section 2.1
 * <subdomain>       = <label> | <subdomain> "." <label>
 * <label>           = <let-dig> [ [ <ldh-str> ] <let-dig> ]
 *                     Labels must be 63 characters or less.
 *                     'let-dig' not 'letter' in the first char, per RFC1123
 * <ldh-str>         = <let-dig-hyp> | <let-dig-hyp> <ldh-str>
 * <let-dig-hyp>     = <let-dig> | "-"
 * <let-dig>         = <letter> | <digit>
 * <letter>          = any one of the 52 alphabetic characters A through Z in
 *                     upper case and a through z in lower case
 * <digit>           = any one of the ten digits 0 through 9
 *
 * Keep support for leading dot: https://github.com/jshttp/cookie/issues/173
 *
 * > (Note that a leading %x2E ("."), if present, is ignored even though that
 * character is not permitted, but a trailing %x2E ("."), if present, will
 * cause the user agent to ignore the attribute.)
 */ var domainValueRegExp = /^([.]?[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)([.][a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)*$/i;
/**
 * RegExp to match path-value in RFC 6265 sec 4.1.1
 *
 * path-value        = <any CHAR except CTLs or ";">
 * CHAR              = %x01-7F
 *                     ; defined in RFC 5234 appendix B.1
 */ var pathValueRegExp = /^[\u0020-\u003A\u003D-\u007E]*$/;
/**
 * Parse a cookie header.
 *
 * Parse the given cookie header string into an object
 * The object has the various cookies as keys(names) => values
 *
 * @param {string} str
 * @param {object} [opt]
 * @return {object}
 * @public
 */ function parse(str, opt) {
    if (typeof str !== 'string') {
        throw new TypeError('argument str must be a string');
    }
    var obj = {};
    var len = str.length;
    // RFC 6265 sec 4.1.1, RFC 2616 2.2 defines a cookie name consists of one char minimum, plus '='.
    if (len < 2) return obj;
    var dec = opt && opt.decode || decode;
    var index = 0;
    var eqIdx = 0;
    var endIdx = 0;
    do {
        eqIdx = str.indexOf('=', index);
        if (eqIdx === -1) break; // No more cookie pairs.
        endIdx = str.indexOf(';', index);
        if (endIdx === -1) {
            endIdx = len;
        } else if (eqIdx > endIdx) {
            // backtrack on prior semicolon
            index = str.lastIndexOf(';', eqIdx - 1) + 1;
            continue;
        }
        var keyStartIdx = startIndex(str, index, eqIdx);
        var keyEndIdx = endIndex(str, eqIdx, keyStartIdx);
        var key = str.slice(keyStartIdx, keyEndIdx);
        // only assign once
        if (!__hasOwnProperty.call(obj, key)) {
            var valStartIdx = startIndex(str, eqIdx + 1, endIdx);
            var valEndIdx = endIndex(str, endIdx, valStartIdx);
            if (str.charCodeAt(valStartIdx) === 0x22 /* " */  && str.charCodeAt(valEndIdx - 1) === 0x22 /* " */ ) {
                valStartIdx++;
                valEndIdx--;
            }
            var val = str.slice(valStartIdx, valEndIdx);
            obj[key] = tryDecode(val, dec);
        }
        index = endIdx + 1;
    }while (index < len)
    return obj;
}
function startIndex(str, index, max) {
    do {
        var code = str.charCodeAt(index);
        if (code !== 0x20 /*   */  && code !== 0x09 /* \t */ ) return index;
    }while (++index < max)
    return max;
}
function endIndex(str, index, min) {
    while(index > min){
        var code = str.charCodeAt(--index);
        if (code !== 0x20 /*   */  && code !== 0x09 /* \t */ ) return index + 1;
    }
    return min;
}
/**
 * Serialize data into a cookie header.
 *
 * Serialize a name value pair into a cookie string suitable for
 * http headers. An optional options object specifies cookie parameters.
 *
 * serialize('foo', 'bar', { httpOnly: true })
 *   => "foo=bar; httpOnly"
 *
 * @param {string} name
 * @param {string} val
 * @param {object} [opt]
 * @return {string}
 * @public
 */ function serialize(name, val, opt) {
    var enc = opt && opt.encode || encodeURIComponent;
    if (typeof enc !== 'function') {
        throw new TypeError('option encode is invalid');
    }
    if (!cookieNameRegExp.test(name)) {
        throw new TypeError('argument name is invalid');
    }
    var value = enc(val);
    if (!cookieValueRegExp.test(value)) {
        throw new TypeError('argument val is invalid');
    }
    var str = name + '=' + value;
    if (!opt) return str;
    if (null != opt.maxAge) {
        var maxAge = Math.floor(opt.maxAge);
        if (!isFinite(maxAge)) {
            throw new TypeError('option maxAge is invalid');
        }
        str += '; Max-Age=' + maxAge;
    }
    if (opt.domain) {
        if (!domainValueRegExp.test(opt.domain)) {
            throw new TypeError('option domain is invalid');
        }
        str += '; Domain=' + opt.domain;
    }
    if (opt.path) {
        if (!pathValueRegExp.test(opt.path)) {
            throw new TypeError('option path is invalid');
        }
        str += '; Path=' + opt.path;
    }
    if (opt.expires) {
        var expires = opt.expires;
        if (!isDate(expires) || isNaN(expires.valueOf())) {
            throw new TypeError('option expires is invalid');
        }
        str += '; Expires=' + expires.toUTCString();
    }
    if (opt.httpOnly) {
        str += '; HttpOnly';
    }
    if (opt.secure) {
        str += '; Secure';
    }
    if (opt.partitioned) {
        str += '; Partitioned';
    }
    if (opt.priority) {
        var priority = typeof opt.priority === 'string' ? opt.priority.toLowerCase() : opt.priority;
        switch(priority){
            case 'low':
                str += '; Priority=Low';
                break;
            case 'medium':
                str += '; Priority=Medium';
                break;
            case 'high':
                str += '; Priority=High';
                break;
            default:
                throw new TypeError('option priority is invalid');
        }
    }
    if (opt.sameSite) {
        var sameSite = typeof opt.sameSite === 'string' ? opt.sameSite.toLowerCase() : opt.sameSite;
        switch(sameSite){
            case true:
                str += '; SameSite=Strict';
                break;
            case 'lax':
                str += '; SameSite=Lax';
                break;
            case 'strict':
                str += '; SameSite=Strict';
                break;
            case 'none':
                str += '; SameSite=None';
                break;
            default:
                throw new TypeError('option sameSite is invalid');
        }
    }
    return str;
}
/**
 * URL-decode string value. Optimized to skip native call when no %.
 *
 * @param {string} str
 * @returns {string}
 */ function decode(str) {
    return str.indexOf('%') !== -1 ? decodeURIComponent(str) : str;
}
/**
 * Determine if value is a Date.
 *
 * @param {*} val
 * @private
 */ function isDate(val) {
    return __toString.call(val) === '[object Date]';
}
/**
 * Try decoding a string using a decoding function.
 *
 * @param {string} str
 * @param {function} decode
 * @private
 */ function tryDecode(str, decode) {
    try {
        return decode(str);
    } catch (e) {
        return str;
    }
}
}),
"[project]/aptiverse/aptiverse-ui/node_modules/delayed-stream/lib/delayed_stream.js [app-rsc] (ecmascript)", ((__turbopack_context__, module, exports) => {

var Stream = __turbopack_context__.r("[externals]/stream [external] (stream, cjs)").Stream;
var util = __turbopack_context__.r("[externals]/util [external] (util, cjs)");
module.exports = DelayedStream;
function DelayedStream() {
    this.source = null;
    this.dataSize = 0;
    this.maxDataSize = 1024 * 1024;
    this.pauseStream = true;
    this._maxDataSizeExceeded = false;
    this._released = false;
    this._bufferedEvents = [];
}
util.inherits(DelayedStream, Stream);
DelayedStream.create = function(source, options) {
    var delayedStream = new this();
    options = options || {};
    for(var option in options){
        delayedStream[option] = options[option];
    }
    delayedStream.source = source;
    var realEmit = source.emit;
    source.emit = function() {
        delayedStream._handleEmit(arguments);
        return realEmit.apply(source, arguments);
    };
    source.on('error', function() {});
    if (delayedStream.pauseStream) {
        source.pause();
    }
    return delayedStream;
};
Object.defineProperty(DelayedStream.prototype, 'readable', {
    configurable: true,
    enumerable: true,
    get: function() {
        return this.source.readable;
    }
});
DelayedStream.prototype.setEncoding = function() {
    return this.source.setEncoding.apply(this.source, arguments);
};
DelayedStream.prototype.resume = function() {
    if (!this._released) {
        this.release();
    }
    this.source.resume();
};
DelayedStream.prototype.pause = function() {
    this.source.pause();
};
DelayedStream.prototype.release = function() {
    this._released = true;
    this._bufferedEvents.forEach((function(args) {
        this.emit.apply(this, args);
    }).bind(this));
    this._bufferedEvents = [];
};
DelayedStream.prototype.pipe = function() {
    var r = Stream.prototype.pipe.apply(this, arguments);
    this.resume();
    return r;
};
DelayedStream.prototype._handleEmit = function(args) {
    if (this._released) {
        this.emit.apply(this, args);
        return;
    }
    if (args[0] === 'data') {
        this.dataSize += args[1].length;
        this._checkIfMaxDataSizeExceeded();
    }
    this._bufferedEvents.push(args);
};
DelayedStream.prototype._checkIfMaxDataSizeExceeded = function() {
    if (this._maxDataSizeExceeded) {
        return;
    }
    if (this.dataSize <= this.maxDataSize) {
        return;
    }
    this._maxDataSizeExceeded = true;
    var message = 'DelayedStream#maxDataSize of ' + this.maxDataSize + ' bytes exceeded.';
    this.emit('error', new Error(message));
};
}),
"[project]/aptiverse/aptiverse-ui/node_modules/combined-stream/lib/combined_stream.js [app-rsc] (ecmascript)", ((__turbopack_context__, module, exports) => {

var util = __turbopack_context__.r("[externals]/util [external] (util, cjs)");
var Stream = __turbopack_context__.r("[externals]/stream [external] (stream, cjs)").Stream;
var DelayedStream = __turbopack_context__.r("[project]/aptiverse/aptiverse-ui/node_modules/delayed-stream/lib/delayed_stream.js [app-rsc] (ecmascript)");
module.exports = CombinedStream;
function CombinedStream() {
    this.writable = false;
    this.readable = true;
    this.dataSize = 0;
    this.maxDataSize = 2 * 1024 * 1024;
    this.pauseStreams = true;
    this._released = false;
    this._streams = [];
    this._currentStream = null;
    this._insideLoop = false;
    this._pendingNext = false;
}
util.inherits(CombinedStream, Stream);
CombinedStream.create = function(options) {
    var combinedStream = new this();
    options = options || {};
    for(var option in options){
        combinedStream[option] = options[option];
    }
    return combinedStream;
};
CombinedStream.isStreamLike = function(stream) {
    return typeof stream !== 'function' && typeof stream !== 'string' && typeof stream !== 'boolean' && typeof stream !== 'number' && !Buffer.isBuffer(stream);
};
CombinedStream.prototype.append = function(stream) {
    var isStreamLike = CombinedStream.isStreamLike(stream);
    if (isStreamLike) {
        if (!(stream instanceof DelayedStream)) {
            var newStream = DelayedStream.create(stream, {
                maxDataSize: Infinity,
                pauseStream: this.pauseStreams
            });
            stream.on('data', this._checkDataSize.bind(this));
            stream = newStream;
        }
        this._handleErrors(stream);
        if (this.pauseStreams) {
            stream.pause();
        }
    }
    this._streams.push(stream);
    return this;
};
CombinedStream.prototype.pipe = function(dest, options) {
    Stream.prototype.pipe.call(this, dest, options);
    this.resume();
    return dest;
};
CombinedStream.prototype._getNext = function() {
    this._currentStream = null;
    if (this._insideLoop) {
        this._pendingNext = true;
        return; // defer call
    }
    this._insideLoop = true;
    try {
        do {
            this._pendingNext = false;
            this._realGetNext();
        }while (this._pendingNext)
    } finally{
        this._insideLoop = false;
    }
};
CombinedStream.prototype._realGetNext = function() {
    var stream = this._streams.shift();
    if (typeof stream == 'undefined') {
        this.end();
        return;
    }
    if (typeof stream !== 'function') {
        this._pipeNext(stream);
        return;
    }
    var getStream = stream;
    getStream((function(stream) {
        var isStreamLike = CombinedStream.isStreamLike(stream);
        if (isStreamLike) {
            stream.on('data', this._checkDataSize.bind(this));
            this._handleErrors(stream);
        }
        this._pipeNext(stream);
    }).bind(this));
};
CombinedStream.prototype._pipeNext = function(stream) {
    this._currentStream = stream;
    var isStreamLike = CombinedStream.isStreamLike(stream);
    if (isStreamLike) {
        stream.on('end', this._getNext.bind(this));
        stream.pipe(this, {
            end: false
        });
        return;
    }
    var value = stream;
    this.write(value);
    this._getNext();
};
CombinedStream.prototype._handleErrors = function(stream) {
    var self = this;
    stream.on('error', function(err) {
        self._emitError(err);
    });
};
CombinedStream.prototype.write = function(data) {
    this.emit('data', data);
};
CombinedStream.prototype.pause = function() {
    if (!this.pauseStreams) {
        return;
    }
    if (this.pauseStreams && this._currentStream && typeof this._currentStream.pause == 'function') this._currentStream.pause();
    this.emit('pause');
};
CombinedStream.prototype.resume = function() {
    if (!this._released) {
        this._released = true;
        this.writable = true;
        this._getNext();
    }
    if (this.pauseStreams && this._currentStream && typeof this._currentStream.resume == 'function') this._currentStream.resume();
    this.emit('resume');
};
CombinedStream.prototype.end = function() {
    this._reset();
    this.emit('end');
};
CombinedStream.prototype.destroy = function() {
    this._reset();
    this.emit('close');
};
CombinedStream.prototype._reset = function() {
    this.writable = false;
    this._streams = [];
    this._currentStream = null;
};
CombinedStream.prototype._checkDataSize = function() {
    this._updateDataSize();
    if (this.dataSize <= this.maxDataSize) {
        return;
    }
    var message = 'DelayedStream#maxDataSize of ' + this.maxDataSize + ' bytes exceeded.';
    this._emitError(new Error(message));
};
CombinedStream.prototype._updateDataSize = function() {
    this.dataSize = 0;
    var self = this;
    this._streams.forEach(function(stream) {
        if (!stream.dataSize) {
            return;
        }
        self.dataSize += stream.dataSize;
    });
    if (this._currentStream && this._currentStream.dataSize) {
        this.dataSize += this._currentStream.dataSize;
    }
};
CombinedStream.prototype._emitError = function(err) {
    this._reset();
    this.emit('error', err);
};
}),
"[project]/aptiverse/aptiverse-ui/node_modules/mime-types/index.js [app-rsc] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/*!
 * mime-types
 * Copyright(c) 2014 Jonathan Ong
 * Copyright(c) 2015 Douglas Christopher Wilson
 * MIT Licensed
 */ /**
 * Module dependencies.
 * @private
 */ var db = __turbopack_context__.r("[project]/aptiverse/aptiverse-ui/node_modules/mime-db/index.js [app-rsc] (ecmascript)");
var extname = __turbopack_context__.r("[externals]/path [external] (path, cjs)").extname;
/**
 * Module variables.
 * @private
 */ var EXTRACT_TYPE_REGEXP = /^\s*([^;\s]*)(?:;|\s|$)/;
var TEXT_TYPE_REGEXP = /^text\//i;
/**
 * Module exports.
 * @public
 */ exports.charset = charset;
exports.charsets = {
    lookup: charset
};
exports.contentType = contentType;
exports.extension = extension;
exports.extensions = Object.create(null);
exports.lookup = lookup;
exports.types = Object.create(null);
// Populate the extensions/types maps
populateMaps(exports.extensions, exports.types);
/**
 * Get the default charset for a MIME type.
 *
 * @param {string} type
 * @return {boolean|string}
 */ function charset(type) {
    if (!type || typeof type !== 'string') {
        return false;
    }
    // TODO: use media-typer
    var match = EXTRACT_TYPE_REGEXP.exec(type);
    var mime = match && db[match[1].toLowerCase()];
    if (mime && mime.charset) {
        return mime.charset;
    }
    // default text/* to utf-8
    if (match && TEXT_TYPE_REGEXP.test(match[1])) {
        return 'UTF-8';
    }
    return false;
}
/**
 * Create a full Content-Type header given a MIME type or extension.
 *
 * @param {string} str
 * @return {boolean|string}
 */ function contentType(str) {
    // TODO: should this even be in this module?
    if (!str || typeof str !== 'string') {
        return false;
    }
    var mime = str.indexOf('/') === -1 ? exports.lookup(str) : str;
    if (!mime) {
        return false;
    }
    // TODO: use content-type or other module
    if (mime.indexOf('charset') === -1) {
        var charset = exports.charset(mime);
        if (charset) mime += '; charset=' + charset.toLowerCase();
    }
    return mime;
}
/**
 * Get the default extension for a MIME type.
 *
 * @param {string} type
 * @return {boolean|string}
 */ function extension(type) {
    if (!type || typeof type !== 'string') {
        return false;
    }
    // TODO: use media-typer
    var match = EXTRACT_TYPE_REGEXP.exec(type);
    // get extensions
    var exts = match && exports.extensions[match[1].toLowerCase()];
    if (!exts || !exts.length) {
        return false;
    }
    return exts[0];
}
/**
 * Lookup the MIME type for a file path/extension.
 *
 * @param {string} path
 * @return {boolean|string}
 */ function lookup(path) {
    if (!path || typeof path !== 'string') {
        return false;
    }
    // get the extension ("ext" or ".ext" or full path)
    var extension = extname('x.' + path).toLowerCase().substr(1);
    if (!extension) {
        return false;
    }
    return exports.types[extension] || false;
}
/**
 * Populate the extensions and types maps.
 * @private
 */ function populateMaps(extensions, types) {
    // source preference (least -> most)
    var preference = [
        'nginx',
        'apache',
        undefined,
        'iana'
    ];
    Object.keys(db).forEach(function forEachMimeType(type) {
        var mime = db[type];
        var exts = mime.extensions;
        if (!exts || !exts.length) {
            return;
        }
        // mime -> extensions
        extensions[type] = exts;
        // extension -> mime
        for(var i = 0; i < exts.length; i++){
            var extension = exts[i];
            if (types[extension]) {
                var from = preference.indexOf(db[types[extension]].source);
                var to = preference.indexOf(mime.source);
                if (types[extension] !== 'application/octet-stream' && (from > to || from === to && types[extension].substr(0, 12) === 'application/')) {
                    continue;
                }
            }
            // set the extension -> mime
            types[extension] = type;
        }
    });
}
}),
"[project]/aptiverse/aptiverse-ui/node_modules/asynckit/lib/defer.js [app-rsc] (ecmascript)", ((__turbopack_context__, module, exports) => {

module.exports = defer;
/**
 * Runs provided function on next iteration of the event loop
 *
 * @param {function} fn - function to run
 */ function defer(fn) {
    var nextTick = typeof setImmediate == 'function' ? setImmediate : typeof process == 'object' && typeof process.nextTick == 'function' ? process.nextTick : null;
    if (nextTick) {
        nextTick(fn);
    } else {
        setTimeout(fn, 0);
    }
}
}),
"[project]/aptiverse/aptiverse-ui/node_modules/asynckit/lib/async.js [app-rsc] (ecmascript)", ((__turbopack_context__, module, exports) => {

var defer = __turbopack_context__.r("[project]/aptiverse/aptiverse-ui/node_modules/asynckit/lib/defer.js [app-rsc] (ecmascript)");
// API
module.exports = async;
/**
 * Runs provided callback asynchronously
 * even if callback itself is not
 *
 * @param   {function} callback - callback to invoke
 * @returns {function} - augmented callback
 */ function async(callback) {
    var isAsync = false;
    // check if async happened
    defer(function() {
        isAsync = true;
    });
    return function async_callback(err, result) {
        if (isAsync) {
            callback(err, result);
        } else {
            defer(function nextTick_callback() {
                callback(err, result);
            });
        }
    };
}
}),
"[project]/aptiverse/aptiverse-ui/node_modules/asynckit/lib/abort.js [app-rsc] (ecmascript)", ((__turbopack_context__, module, exports) => {

// API
module.exports = abort;
/**
 * Aborts leftover active jobs
 *
 * @param {object} state - current state object
 */ function abort(state) {
    Object.keys(state.jobs).forEach(clean.bind(state));
    // reset leftover jobs
    state.jobs = {};
}
/**
 * Cleans up leftover job by invoking abort function for the provided job id
 *
 * @this  state
 * @param {string|number} key - job id to abort
 */ function clean(key) {
    if (typeof this.jobs[key] == 'function') {
        this.jobs[key]();
    }
}
}),
"[project]/aptiverse/aptiverse-ui/node_modules/asynckit/lib/iterate.js [app-rsc] (ecmascript)", ((__turbopack_context__, module, exports) => {

var async = __turbopack_context__.r("[project]/aptiverse/aptiverse-ui/node_modules/asynckit/lib/async.js [app-rsc] (ecmascript)"), abort = __turbopack_context__.r("[project]/aptiverse/aptiverse-ui/node_modules/asynckit/lib/abort.js [app-rsc] (ecmascript)");
// API
module.exports = iterate;
/**
 * Iterates over each job object
 *
 * @param {array|object} list - array or object (named list) to iterate over
 * @param {function} iterator - iterator to run
 * @param {object} state - current job status
 * @param {function} callback - invoked when all elements processed
 */ function iterate(list, iterator, state, callback) {
    // store current index
    var key = state['keyedList'] ? state['keyedList'][state.index] : state.index;
    state.jobs[key] = runJob(iterator, key, list[key], function(error, output) {
        // don't repeat yourself
        // skip secondary callbacks
        if (!(key in state.jobs)) {
            return;
        }
        // clean up jobs
        delete state.jobs[key];
        if (error) {
            // don't process rest of the results
            // stop still active jobs
            // and reset the list
            abort(state);
        } else {
            state.results[key] = output;
        }
        // return salvaged results
        callback(error, state.results);
    });
}
/**
 * Runs iterator over provided job element
 *
 * @param   {function} iterator - iterator to invoke
 * @param   {string|number} key - key/index of the element in the list of jobs
 * @param   {mixed} item - job description
 * @param   {function} callback - invoked after iterator is done with the job
 * @returns {function|mixed} - job abort function or something else
 */ function runJob(iterator, key, item, callback) {
    var aborter;
    // allow shortcut if iterator expects only two arguments
    if (iterator.length == 2) {
        aborter = iterator(item, async(callback));
    } else {
        aborter = iterator(item, key, async(callback));
    }
    return aborter;
}
}),
"[project]/aptiverse/aptiverse-ui/node_modules/asynckit/lib/state.js [app-rsc] (ecmascript)", ((__turbopack_context__, module, exports) => {

// API
module.exports = state;
/**
 * Creates initial state object
 * for iteration over list
 *
 * @param   {array|object} list - list to iterate over
 * @param   {function|null} sortMethod - function to use for keys sort,
 *                                     or `null` to keep them as is
 * @returns {object} - initial state object
 */ function state(list, sortMethod) {
    var isNamedList = !Array.isArray(list), initState = {
        index: 0,
        keyedList: isNamedList || sortMethod ? Object.keys(list) : null,
        jobs: {},
        results: isNamedList ? {} : [],
        size: isNamedList ? Object.keys(list).length : list.length
    };
    if (sortMethod) {
        // sort array keys based on it's values
        // sort object's keys just on own merit
        initState.keyedList.sort(isNamedList ? sortMethod : function(a, b) {
            return sortMethod(list[a], list[b]);
        });
    }
    return initState;
}
}),
"[project]/aptiverse/aptiverse-ui/node_modules/asynckit/lib/terminator.js [app-rsc] (ecmascript)", ((__turbopack_context__, module, exports) => {

var abort = __turbopack_context__.r("[project]/aptiverse/aptiverse-ui/node_modules/asynckit/lib/abort.js [app-rsc] (ecmascript)"), async = __turbopack_context__.r("[project]/aptiverse/aptiverse-ui/node_modules/asynckit/lib/async.js [app-rsc] (ecmascript)");
// API
module.exports = terminator;
/**
 * Terminates jobs in the attached state context
 *
 * @this  AsyncKitState#
 * @param {function} callback - final callback to invoke after termination
 */ function terminator(callback) {
    if (!Object.keys(this.jobs).length) {
        return;
    }
    // fast forward iteration index
    this.index = this.size;
    // abort jobs
    abort(this);
    // send back results we have so far
    async(callback)(null, this.results);
}
}),
"[project]/aptiverse/aptiverse-ui/node_modules/asynckit/parallel.js [app-rsc] (ecmascript)", ((__turbopack_context__, module, exports) => {

var iterate = __turbopack_context__.r("[project]/aptiverse/aptiverse-ui/node_modules/asynckit/lib/iterate.js [app-rsc] (ecmascript)"), initState = __turbopack_context__.r("[project]/aptiverse/aptiverse-ui/node_modules/asynckit/lib/state.js [app-rsc] (ecmascript)"), terminator = __turbopack_context__.r("[project]/aptiverse/aptiverse-ui/node_modules/asynckit/lib/terminator.js [app-rsc] (ecmascript)");
// Public API
module.exports = parallel;
/**
 * Runs iterator over provided array elements in parallel
 *
 * @param   {array|object} list - array or object (named list) to iterate over
 * @param   {function} iterator - iterator to run
 * @param   {function} callback - invoked when all elements processed
 * @returns {function} - jobs terminator
 */ function parallel(list, iterator, callback) {
    var state = initState(list);
    while(state.index < (state['keyedList'] || list).length){
        iterate(list, iterator, state, function(error, result) {
            if (error) {
                callback(error, result);
                return;
            }
            // looks like it's the last one
            if (Object.keys(state.jobs).length === 0) {
                callback(null, state.results);
                return;
            }
        });
        state.index++;
    }
    return terminator.bind(state, callback);
}
}),
"[project]/aptiverse/aptiverse-ui/node_modules/asynckit/serialOrdered.js [app-rsc] (ecmascript)", ((__turbopack_context__, module, exports) => {

var iterate = __turbopack_context__.r("[project]/aptiverse/aptiverse-ui/node_modules/asynckit/lib/iterate.js [app-rsc] (ecmascript)"), initState = __turbopack_context__.r("[project]/aptiverse/aptiverse-ui/node_modules/asynckit/lib/state.js [app-rsc] (ecmascript)"), terminator = __turbopack_context__.r("[project]/aptiverse/aptiverse-ui/node_modules/asynckit/lib/terminator.js [app-rsc] (ecmascript)");
// Public API
module.exports = serialOrdered;
// sorting helpers
module.exports.ascending = ascending;
module.exports.descending = descending;
/**
 * Runs iterator over provided sorted array elements in series
 *
 * @param   {array|object} list - array or object (named list) to iterate over
 * @param   {function} iterator - iterator to run
 * @param   {function} sortMethod - custom sort function
 * @param   {function} callback - invoked when all elements processed
 * @returns {function} - jobs terminator
 */ function serialOrdered(list, iterator, sortMethod, callback) {
    var state = initState(list, sortMethod);
    iterate(list, iterator, state, function iteratorHandler(error, result) {
        if (error) {
            callback(error, result);
            return;
        }
        state.index++;
        // are we there yet?
        if (state.index < (state['keyedList'] || list).length) {
            iterate(list, iterator, state, iteratorHandler);
            return;
        }
        // done here
        callback(null, state.results);
    });
    return terminator.bind(state, callback);
}
/*
 * -- Sort methods
 */ /**
 * sort helper to sort array elements in ascending order
 *
 * @param   {mixed} a - an item to compare
 * @param   {mixed} b - an item to compare
 * @returns {number} - comparison result
 */ function ascending(a, b) {
    return a < b ? -1 : a > b ? 1 : 0;
}
/**
 * sort helper to sort array elements in descending order
 *
 * @param   {mixed} a - an item to compare
 * @param   {mixed} b - an item to compare
 * @returns {number} - comparison result
 */ function descending(a, b) {
    return -1 * ascending(a, b);
}
}),
"[project]/aptiverse/aptiverse-ui/node_modules/asynckit/serial.js [app-rsc] (ecmascript)", ((__turbopack_context__, module, exports) => {

var serialOrdered = __turbopack_context__.r("[project]/aptiverse/aptiverse-ui/node_modules/asynckit/serialOrdered.js [app-rsc] (ecmascript)");
// Public API
module.exports = serial;
/**
 * Runs iterator over provided array elements in series
 *
 * @param   {array|object} list - array or object (named list) to iterate over
 * @param   {function} iterator - iterator to run
 * @param   {function} callback - invoked when all elements processed
 * @returns {function} - jobs terminator
 */ function serial(list, iterator, callback) {
    return serialOrdered(list, iterator, null, callback);
}
}),
"[project]/aptiverse/aptiverse-ui/node_modules/asynckit/index.js [app-rsc] (ecmascript)", ((__turbopack_context__, module, exports) => {

module.exports = {
    parallel: __turbopack_context__.r("[project]/aptiverse/aptiverse-ui/node_modules/asynckit/parallel.js [app-rsc] (ecmascript)"),
    serial: __turbopack_context__.r("[project]/aptiverse/aptiverse-ui/node_modules/asynckit/serial.js [app-rsc] (ecmascript)"),
    serialOrdered: __turbopack_context__.r("[project]/aptiverse/aptiverse-ui/node_modules/asynckit/serialOrdered.js [app-rsc] (ecmascript)")
};
}),
"[project]/aptiverse/aptiverse-ui/node_modules/es-object-atoms/index.js [app-rsc] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/** @type {import('.')} */ module.exports = Object;
}),
"[project]/aptiverse/aptiverse-ui/node_modules/es-errors/index.js [app-rsc] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/** @type {import('.')} */ module.exports = Error;
}),
"[project]/aptiverse/aptiverse-ui/node_modules/es-errors/eval.js [app-rsc] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/** @type {import('./eval')} */ module.exports = EvalError;
}),
"[project]/aptiverse/aptiverse-ui/node_modules/es-errors/range.js [app-rsc] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/** @type {import('./range')} */ module.exports = RangeError;
}),
"[project]/aptiverse/aptiverse-ui/node_modules/es-errors/ref.js [app-rsc] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/** @type {import('./ref')} */ module.exports = ReferenceError;
}),
"[project]/aptiverse/aptiverse-ui/node_modules/es-errors/syntax.js [app-rsc] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/** @type {import('./syntax')} */ module.exports = SyntaxError;
}),
"[project]/aptiverse/aptiverse-ui/node_modules/es-errors/type.js [app-rsc] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/** @type {import('./type')} */ module.exports = TypeError;
}),
"[project]/aptiverse/aptiverse-ui/node_modules/es-errors/uri.js [app-rsc] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/** @type {import('./uri')} */ module.exports = URIError;
}),
"[project]/aptiverse/aptiverse-ui/node_modules/math-intrinsics/abs.js [app-rsc] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/** @type {import('./abs')} */ module.exports = Math.abs;
}),
"[project]/aptiverse/aptiverse-ui/node_modules/math-intrinsics/floor.js [app-rsc] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/** @type {import('./floor')} */ module.exports = Math.floor;
}),
"[project]/aptiverse/aptiverse-ui/node_modules/math-intrinsics/max.js [app-rsc] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/** @type {import('./max')} */ module.exports = Math.max;
}),
"[project]/aptiverse/aptiverse-ui/node_modules/math-intrinsics/min.js [app-rsc] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/** @type {import('./min')} */ module.exports = Math.min;
}),
"[project]/aptiverse/aptiverse-ui/node_modules/math-intrinsics/pow.js [app-rsc] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/** @type {import('./pow')} */ module.exports = Math.pow;
}),
"[project]/aptiverse/aptiverse-ui/node_modules/math-intrinsics/round.js [app-rsc] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/** @type {import('./round')} */ module.exports = Math.round;
}),
"[project]/aptiverse/aptiverse-ui/node_modules/math-intrinsics/isNaN.js [app-rsc] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/** @type {import('./isNaN')} */ module.exports = Number.isNaN || function isNaN(a) {
    return a !== a;
};
}),
"[project]/aptiverse/aptiverse-ui/node_modules/math-intrinsics/sign.js [app-rsc] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

var $isNaN = __turbopack_context__.r("[project]/aptiverse/aptiverse-ui/node_modules/math-intrinsics/isNaN.js [app-rsc] (ecmascript)");
/** @type {import('./sign')} */ module.exports = function sign(number) {
    if ($isNaN(number) || number === 0) {
        return number;
    }
    return number < 0 ? -1 : +1;
};
}),
"[project]/aptiverse/aptiverse-ui/node_modules/gopd/gOPD.js [app-rsc] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/** @type {import('./gOPD')} */ module.exports = Object.getOwnPropertyDescriptor;
}),
"[project]/aptiverse/aptiverse-ui/node_modules/gopd/index.js [app-rsc] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/** @type {import('.')} */ var $gOPD = __turbopack_context__.r("[project]/aptiverse/aptiverse-ui/node_modules/gopd/gOPD.js [app-rsc] (ecmascript)");
if ($gOPD) {
    try {
        $gOPD([], 'length');
    } catch (e) {
        // IE 8 has a broken gOPD
        $gOPD = null;
    }
}
module.exports = $gOPD;
}),
"[project]/aptiverse/aptiverse-ui/node_modules/es-define-property/index.js [app-rsc] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/** @type {import('.')} */ var $defineProperty = Object.defineProperty || false;
if ($defineProperty) {
    try {
        $defineProperty({}, 'a', {
            value: 1
        });
    } catch (e) {
        // IE 8 has a broken defineProperty
        $defineProperty = false;
    }
}
module.exports = $defineProperty;
}),
"[project]/aptiverse/aptiverse-ui/node_modules/has-symbols/shams.js [app-rsc] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/** @type {import('./shams')} */ /* eslint complexity: [2, 18], max-statements: [2, 33] */ module.exports = function hasSymbols() {
    if (typeof Symbol !== 'function' || typeof Object.getOwnPropertySymbols !== 'function') {
        return false;
    }
    if (typeof Symbol.iterator === 'symbol') {
        return true;
    }
    /** @type {{ [k in symbol]?: unknown }} */ var obj = {};
    var sym = Symbol('test');
    var symObj = Object(sym);
    if (typeof sym === 'string') {
        return false;
    }
    if (Object.prototype.toString.call(sym) !== '[object Symbol]') {
        return false;
    }
    if (Object.prototype.toString.call(symObj) !== '[object Symbol]') {
        return false;
    }
    // temp disabled per https://github.com/ljharb/object.assign/issues/17
    // if (sym instanceof Symbol) { return false; }
    // temp disabled per https://github.com/WebReflection/get-own-property-symbols/issues/4
    // if (!(symObj instanceof Symbol)) { return false; }
    // if (typeof Symbol.prototype.toString !== 'function') { return false; }
    // if (String(sym) !== Symbol.prototype.toString.call(sym)) { return false; }
    var symVal = 42;
    obj[sym] = symVal;
    for(var _ in obj){
        return false;
    } // eslint-disable-line no-restricted-syntax, no-unreachable-loop
    if (typeof Object.keys === 'function' && Object.keys(obj).length !== 0) {
        return false;
    }
    if (typeof Object.getOwnPropertyNames === 'function' && Object.getOwnPropertyNames(obj).length !== 0) {
        return false;
    }
    var syms = Object.getOwnPropertySymbols(obj);
    if (syms.length !== 1 || syms[0] !== sym) {
        return false;
    }
    if (!Object.prototype.propertyIsEnumerable.call(obj, sym)) {
        return false;
    }
    if (typeof Object.getOwnPropertyDescriptor === 'function') {
        // eslint-disable-next-line no-extra-parens
        var descriptor = Object.getOwnPropertyDescriptor(obj, sym);
        if (descriptor.value !== symVal || descriptor.enumerable !== true) {
            return false;
        }
    }
    return true;
};
}),
"[project]/aptiverse/aptiverse-ui/node_modules/has-symbols/index.js [app-rsc] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

var origSymbol = typeof Symbol !== 'undefined' && Symbol;
var hasSymbolSham = __turbopack_context__.r("[project]/aptiverse/aptiverse-ui/node_modules/has-symbols/shams.js [app-rsc] (ecmascript)");
/** @type {import('.')} */ module.exports = function hasNativeSymbols() {
    if (typeof origSymbol !== 'function') {
        return false;
    }
    if (typeof Symbol !== 'function') {
        return false;
    }
    if (typeof origSymbol('foo') !== 'symbol') {
        return false;
    }
    if (typeof Symbol('bar') !== 'symbol') {
        return false;
    }
    return hasSymbolSham();
};
}),
"[project]/aptiverse/aptiverse-ui/node_modules/get-proto/Reflect.getPrototypeOf.js [app-rsc] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/** @type {import('./Reflect.getPrototypeOf')} */ module.exports = typeof Reflect !== 'undefined' && Reflect.getPrototypeOf || null;
}),
"[project]/aptiverse/aptiverse-ui/node_modules/get-proto/Object.getPrototypeOf.js [app-rsc] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

var $Object = __turbopack_context__.r("[project]/aptiverse/aptiverse-ui/node_modules/es-object-atoms/index.js [app-rsc] (ecmascript)");
/** @type {import('./Object.getPrototypeOf')} */ module.exports = $Object.getPrototypeOf || null;
}),
"[project]/aptiverse/aptiverse-ui/node_modules/get-proto/index.js [app-rsc] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

var reflectGetProto = __turbopack_context__.r("[project]/aptiverse/aptiverse-ui/node_modules/get-proto/Reflect.getPrototypeOf.js [app-rsc] (ecmascript)");
var originalGetProto = __turbopack_context__.r("[project]/aptiverse/aptiverse-ui/node_modules/get-proto/Object.getPrototypeOf.js [app-rsc] (ecmascript)");
var getDunderProto = __turbopack_context__.r("[project]/aptiverse/aptiverse-ui/node_modules/dunder-proto/get.js [app-rsc] (ecmascript)");
/** @type {import('.')} */ module.exports = reflectGetProto ? function getProto(O) {
    // @ts-expect-error TS can't narrow inside a closure, for some reason
    return reflectGetProto(O);
} : originalGetProto ? function getProto(O) {
    if (!O || typeof O !== 'object' && typeof O !== 'function') {
        throw new TypeError('getProto: not an object');
    }
    // @ts-expect-error TS can't narrow inside a closure, for some reason
    return originalGetProto(O);
} : getDunderProto ? function getProto(O) {
    // @ts-expect-error TS can't narrow inside a closure, for some reason
    return getDunderProto(O);
} : null;
}),
"[project]/aptiverse/aptiverse-ui/node_modules/function-bind/implementation.js [app-rsc] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/* eslint no-invalid-this: 1 */ var ERROR_MESSAGE = 'Function.prototype.bind called on incompatible ';
var toStr = Object.prototype.toString;
var max = Math.max;
var funcType = '[object Function]';
var concatty = function concatty(a, b) {
    var arr = [];
    for(var i = 0; i < a.length; i += 1){
        arr[i] = a[i];
    }
    for(var j = 0; j < b.length; j += 1){
        arr[j + a.length] = b[j];
    }
    return arr;
};
var slicy = function slicy(arrLike, offset) {
    var arr = [];
    for(var i = offset || 0, j = 0; i < arrLike.length; i += 1, j += 1){
        arr[j] = arrLike[i];
    }
    return arr;
};
var joiny = function(arr, joiner) {
    var str = '';
    for(var i = 0; i < arr.length; i += 1){
        str += arr[i];
        if (i + 1 < arr.length) {
            str += joiner;
        }
    }
    return str;
};
module.exports = function bind(that) {
    var target = this;
    if (typeof target !== 'function' || toStr.apply(target) !== funcType) {
        throw new TypeError(ERROR_MESSAGE + target);
    }
    var args = slicy(arguments, 1);
    var bound;
    var binder = function() {
        if (this instanceof bound) {
            var result = target.apply(this, concatty(args, arguments));
            if (Object(result) === result) {
                return result;
            }
            return this;
        }
        return target.apply(that, concatty(args, arguments));
    };
    var boundLength = max(0, target.length - args.length);
    var boundArgs = [];
    for(var i = 0; i < boundLength; i++){
        boundArgs[i] = '$' + i;
    }
    bound = Function('binder', 'return function (' + joiny(boundArgs, ',') + '){ return binder.apply(this,arguments); }')(binder);
    if (target.prototype) {
        var Empty = function Empty() {};
        Empty.prototype = target.prototype;
        bound.prototype = new Empty();
        Empty.prototype = null;
    }
    return bound;
};
}),
"[project]/aptiverse/aptiverse-ui/node_modules/function-bind/index.js [app-rsc] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

var implementation = __turbopack_context__.r("[project]/aptiverse/aptiverse-ui/node_modules/function-bind/implementation.js [app-rsc] (ecmascript)");
module.exports = Function.prototype.bind || implementation;
}),
"[project]/aptiverse/aptiverse-ui/node_modules/call-bind-apply-helpers/functionCall.js [app-rsc] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/** @type {import('./functionCall')} */ module.exports = Function.prototype.call;
}),
"[project]/aptiverse/aptiverse-ui/node_modules/call-bind-apply-helpers/functionApply.js [app-rsc] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/** @type {import('./functionApply')} */ module.exports = Function.prototype.apply;
}),
"[project]/aptiverse/aptiverse-ui/node_modules/call-bind-apply-helpers/reflectApply.js [app-rsc] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/** @type {import('./reflectApply')} */ module.exports = typeof Reflect !== 'undefined' && Reflect && Reflect.apply;
}),
"[project]/aptiverse/aptiverse-ui/node_modules/call-bind-apply-helpers/actualApply.js [app-rsc] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

var bind = __turbopack_context__.r("[project]/aptiverse/aptiverse-ui/node_modules/function-bind/index.js [app-rsc] (ecmascript)");
var $apply = __turbopack_context__.r("[project]/aptiverse/aptiverse-ui/node_modules/call-bind-apply-helpers/functionApply.js [app-rsc] (ecmascript)");
var $call = __turbopack_context__.r("[project]/aptiverse/aptiverse-ui/node_modules/call-bind-apply-helpers/functionCall.js [app-rsc] (ecmascript)");
var $reflectApply = __turbopack_context__.r("[project]/aptiverse/aptiverse-ui/node_modules/call-bind-apply-helpers/reflectApply.js [app-rsc] (ecmascript)");
/** @type {import('./actualApply')} */ module.exports = $reflectApply || bind.call($call, $apply);
}),
"[project]/aptiverse/aptiverse-ui/node_modules/call-bind-apply-helpers/index.js [app-rsc] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

var bind = __turbopack_context__.r("[project]/aptiverse/aptiverse-ui/node_modules/function-bind/index.js [app-rsc] (ecmascript)");
var $TypeError = __turbopack_context__.r("[project]/aptiverse/aptiverse-ui/node_modules/es-errors/type.js [app-rsc] (ecmascript)");
var $call = __turbopack_context__.r("[project]/aptiverse/aptiverse-ui/node_modules/call-bind-apply-helpers/functionCall.js [app-rsc] (ecmascript)");
var $actualApply = __turbopack_context__.r("[project]/aptiverse/aptiverse-ui/node_modules/call-bind-apply-helpers/actualApply.js [app-rsc] (ecmascript)");
/** @type {(args: [Function, thisArg?: unknown, ...args: unknown[]]) => Function} TODO FIXME, find a way to use import('.') */ module.exports = function callBindBasic(args) {
    if (args.length < 1 || typeof args[0] !== 'function') {
        throw new $TypeError('a function is required');
    }
    return $actualApply(bind, $call, args);
};
}),
"[project]/aptiverse/aptiverse-ui/node_modules/dunder-proto/get.js [app-rsc] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

var callBind = __turbopack_context__.r("[project]/aptiverse/aptiverse-ui/node_modules/call-bind-apply-helpers/index.js [app-rsc] (ecmascript)");
var gOPD = __turbopack_context__.r("[project]/aptiverse/aptiverse-ui/node_modules/gopd/index.js [app-rsc] (ecmascript)");
var hasProtoAccessor;
try {
    // eslint-disable-next-line no-extra-parens, no-proto
    hasProtoAccessor = /** @type {{ __proto__?: typeof Array.prototype }} */ [].__proto__ === Array.prototype;
} catch (e) {
    if (!e || typeof e !== 'object' || !('code' in e) || e.code !== 'ERR_PROTO_ACCESS') {
        throw e;
    }
}
// eslint-disable-next-line no-extra-parens
var desc = !!hasProtoAccessor && gOPD && gOPD(Object.prototype, '__proto__');
var $Object = Object;
var $getPrototypeOf = $Object.getPrototypeOf;
/** @type {import('./get')} */ module.exports = desc && typeof desc.get === 'function' ? callBind([
    desc.get
]) : typeof $getPrototypeOf === 'function' ? /** @type {import('./get')} */ function getDunder(value) {
    // eslint-disable-next-line eqeqeq
    return $getPrototypeOf(value == null ? value : $Object(value));
} : false;
}),
"[project]/aptiverse/aptiverse-ui/node_modules/hasown/index.js [app-rsc] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

var call = Function.prototype.call;
var $hasOwn = Object.prototype.hasOwnProperty;
var bind = __turbopack_context__.r("[project]/aptiverse/aptiverse-ui/node_modules/function-bind/index.js [app-rsc] (ecmascript)");
/** @type {import('.')} */ module.exports = bind.call(call, $hasOwn);
}),
"[project]/aptiverse/aptiverse-ui/node_modules/get-intrinsic/index.js [app-rsc] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

var undefined1;
var $Object = __turbopack_context__.r("[project]/aptiverse/aptiverse-ui/node_modules/es-object-atoms/index.js [app-rsc] (ecmascript)");
var $Error = __turbopack_context__.r("[project]/aptiverse/aptiverse-ui/node_modules/es-errors/index.js [app-rsc] (ecmascript)");
var $EvalError = __turbopack_context__.r("[project]/aptiverse/aptiverse-ui/node_modules/es-errors/eval.js [app-rsc] (ecmascript)");
var $RangeError = __turbopack_context__.r("[project]/aptiverse/aptiverse-ui/node_modules/es-errors/range.js [app-rsc] (ecmascript)");
var $ReferenceError = __turbopack_context__.r("[project]/aptiverse/aptiverse-ui/node_modules/es-errors/ref.js [app-rsc] (ecmascript)");
var $SyntaxError = __turbopack_context__.r("[project]/aptiverse/aptiverse-ui/node_modules/es-errors/syntax.js [app-rsc] (ecmascript)");
var $TypeError = __turbopack_context__.r("[project]/aptiverse/aptiverse-ui/node_modules/es-errors/type.js [app-rsc] (ecmascript)");
var $URIError = __turbopack_context__.r("[project]/aptiverse/aptiverse-ui/node_modules/es-errors/uri.js [app-rsc] (ecmascript)");
var abs = __turbopack_context__.r("[project]/aptiverse/aptiverse-ui/node_modules/math-intrinsics/abs.js [app-rsc] (ecmascript)");
var floor = __turbopack_context__.r("[project]/aptiverse/aptiverse-ui/node_modules/math-intrinsics/floor.js [app-rsc] (ecmascript)");
var max = __turbopack_context__.r("[project]/aptiverse/aptiverse-ui/node_modules/math-intrinsics/max.js [app-rsc] (ecmascript)");
var min = __turbopack_context__.r("[project]/aptiverse/aptiverse-ui/node_modules/math-intrinsics/min.js [app-rsc] (ecmascript)");
var pow = __turbopack_context__.r("[project]/aptiverse/aptiverse-ui/node_modules/math-intrinsics/pow.js [app-rsc] (ecmascript)");
var round = __turbopack_context__.r("[project]/aptiverse/aptiverse-ui/node_modules/math-intrinsics/round.js [app-rsc] (ecmascript)");
var sign = __turbopack_context__.r("[project]/aptiverse/aptiverse-ui/node_modules/math-intrinsics/sign.js [app-rsc] (ecmascript)");
var $Function = Function;
// eslint-disable-next-line consistent-return
var getEvalledConstructor = function(expressionSyntax) {
    try {
        return $Function('"use strict"; return (' + expressionSyntax + ').constructor;')();
    } catch (e) {}
};
var $gOPD = __turbopack_context__.r("[project]/aptiverse/aptiverse-ui/node_modules/gopd/index.js [app-rsc] (ecmascript)");
var $defineProperty = __turbopack_context__.r("[project]/aptiverse/aptiverse-ui/node_modules/es-define-property/index.js [app-rsc] (ecmascript)");
var throwTypeError = function() {
    throw new $TypeError();
};
var ThrowTypeError = $gOPD ? function() {
    try {
        // eslint-disable-next-line no-unused-expressions, no-caller, no-restricted-properties
        arguments.callee; // IE 8 does not throw here
        return throwTypeError;
    } catch (calleeThrows) {
        try {
            // IE 8 throws on Object.getOwnPropertyDescriptor(arguments, '')
            return $gOPD(arguments, 'callee').get;
        } catch (gOPDthrows) {
            return throwTypeError;
        }
    }
}() : throwTypeError;
var hasSymbols = __turbopack_context__.r("[project]/aptiverse/aptiverse-ui/node_modules/has-symbols/index.js [app-rsc] (ecmascript)")();
var getProto = __turbopack_context__.r("[project]/aptiverse/aptiverse-ui/node_modules/get-proto/index.js [app-rsc] (ecmascript)");
var $ObjectGPO = __turbopack_context__.r("[project]/aptiverse/aptiverse-ui/node_modules/get-proto/Object.getPrototypeOf.js [app-rsc] (ecmascript)");
var $ReflectGPO = __turbopack_context__.r("[project]/aptiverse/aptiverse-ui/node_modules/get-proto/Reflect.getPrototypeOf.js [app-rsc] (ecmascript)");
var $apply = __turbopack_context__.r("[project]/aptiverse/aptiverse-ui/node_modules/call-bind-apply-helpers/functionApply.js [app-rsc] (ecmascript)");
var $call = __turbopack_context__.r("[project]/aptiverse/aptiverse-ui/node_modules/call-bind-apply-helpers/functionCall.js [app-rsc] (ecmascript)");
var needsEval = {};
var TypedArray = typeof Uint8Array === 'undefined' || !getProto ? undefined : getProto(Uint8Array);
var INTRINSICS = {
    __proto__: null,
    '%AggregateError%': typeof AggregateError === 'undefined' ? undefined : AggregateError,
    '%Array%': Array,
    '%ArrayBuffer%': typeof ArrayBuffer === 'undefined' ? undefined : ArrayBuffer,
    '%ArrayIteratorPrototype%': hasSymbols && getProto ? getProto([][Symbol.iterator]()) : undefined,
    '%AsyncFromSyncIteratorPrototype%': undefined,
    '%AsyncFunction%': needsEval,
    '%AsyncGenerator%': needsEval,
    '%AsyncGeneratorFunction%': needsEval,
    '%AsyncIteratorPrototype%': needsEval,
    '%Atomics%': typeof Atomics === 'undefined' ? undefined : Atomics,
    '%BigInt%': typeof BigInt === 'undefined' ? undefined : BigInt,
    '%BigInt64Array%': typeof BigInt64Array === 'undefined' ? undefined : BigInt64Array,
    '%BigUint64Array%': typeof BigUint64Array === 'undefined' ? undefined : BigUint64Array,
    '%Boolean%': Boolean,
    '%DataView%': typeof DataView === 'undefined' ? undefined : DataView,
    '%Date%': Date,
    '%decodeURI%': decodeURI,
    '%decodeURIComponent%': decodeURIComponent,
    '%encodeURI%': encodeURI,
    '%encodeURIComponent%': encodeURIComponent,
    '%Error%': $Error,
    '%eval%': eval,
    '%EvalError%': $EvalError,
    '%Float16Array%': typeof Float16Array === 'undefined' ? undefined : Float16Array,
    '%Float32Array%': typeof Float32Array === 'undefined' ? undefined : Float32Array,
    '%Float64Array%': typeof Float64Array === 'undefined' ? undefined : Float64Array,
    '%FinalizationRegistry%': typeof FinalizationRegistry === 'undefined' ? undefined : FinalizationRegistry,
    '%Function%': $Function,
    '%GeneratorFunction%': needsEval,
    '%Int8Array%': typeof Int8Array === 'undefined' ? undefined : Int8Array,
    '%Int16Array%': typeof Int16Array === 'undefined' ? undefined : Int16Array,
    '%Int32Array%': typeof Int32Array === 'undefined' ? undefined : Int32Array,
    '%isFinite%': isFinite,
    '%isNaN%': isNaN,
    '%IteratorPrototype%': hasSymbols && getProto ? getProto(getProto([][Symbol.iterator]())) : undefined,
    '%JSON%': typeof JSON === 'object' ? JSON : undefined,
    '%Map%': typeof Map === 'undefined' ? undefined : Map,
    '%MapIteratorPrototype%': typeof Map === 'undefined' || !hasSymbols || !getProto ? undefined : getProto(new Map()[Symbol.iterator]()),
    '%Math%': Math,
    '%Number%': Number,
    '%Object%': $Object,
    '%Object.getOwnPropertyDescriptor%': $gOPD,
    '%parseFloat%': parseFloat,
    '%parseInt%': parseInt,
    '%Promise%': typeof Promise === 'undefined' ? undefined : Promise,
    '%Proxy%': typeof Proxy === 'undefined' ? undefined : Proxy,
    '%RangeError%': $RangeError,
    '%ReferenceError%': $ReferenceError,
    '%Reflect%': typeof Reflect === 'undefined' ? undefined : Reflect,
    '%RegExp%': RegExp,
    '%Set%': typeof Set === 'undefined' ? undefined : Set,
    '%SetIteratorPrototype%': typeof Set === 'undefined' || !hasSymbols || !getProto ? undefined : getProto(new Set()[Symbol.iterator]()),
    '%SharedArrayBuffer%': typeof SharedArrayBuffer === 'undefined' ? undefined : SharedArrayBuffer,
    '%String%': String,
    '%StringIteratorPrototype%': hasSymbols && getProto ? getProto(''[Symbol.iterator]()) : undefined,
    '%Symbol%': hasSymbols ? Symbol : undefined,
    '%SyntaxError%': $SyntaxError,
    '%ThrowTypeError%': ThrowTypeError,
    '%TypedArray%': TypedArray,
    '%TypeError%': $TypeError,
    '%Uint8Array%': typeof Uint8Array === 'undefined' ? undefined : Uint8Array,
    '%Uint8ClampedArray%': typeof Uint8ClampedArray === 'undefined' ? undefined : Uint8ClampedArray,
    '%Uint16Array%': typeof Uint16Array === 'undefined' ? undefined : Uint16Array,
    '%Uint32Array%': typeof Uint32Array === 'undefined' ? undefined : Uint32Array,
    '%URIError%': $URIError,
    '%WeakMap%': typeof WeakMap === 'undefined' ? undefined : WeakMap,
    '%WeakRef%': typeof WeakRef === 'undefined' ? undefined : WeakRef,
    '%WeakSet%': typeof WeakSet === 'undefined' ? undefined : WeakSet,
    '%Function.prototype.call%': $call,
    '%Function.prototype.apply%': $apply,
    '%Object.defineProperty%': $defineProperty,
    '%Object.getPrototypeOf%': $ObjectGPO,
    '%Math.abs%': abs,
    '%Math.floor%': floor,
    '%Math.max%': max,
    '%Math.min%': min,
    '%Math.pow%': pow,
    '%Math.round%': round,
    '%Math.sign%': sign,
    '%Reflect.getPrototypeOf%': $ReflectGPO
};
if (getProto) {
    try {
        null.error; // eslint-disable-line no-unused-expressions
    } catch (e) {
        // https://github.com/tc39/proposal-shadowrealm/pull/384#issuecomment-1364264229
        var errorProto = getProto(getProto(e));
        INTRINSICS['%Error.prototype%'] = errorProto;
    }
}
var doEval = function doEval(name) {
    var value;
    if (name === '%AsyncFunction%') {
        value = getEvalledConstructor('async function () {}');
    } else if (name === '%GeneratorFunction%') {
        value = getEvalledConstructor('function* () {}');
    } else if (name === '%AsyncGeneratorFunction%') {
        value = getEvalledConstructor('async function* () {}');
    } else if (name === '%AsyncGenerator%') {
        var fn = doEval('%AsyncGeneratorFunction%');
        if (fn) {
            value = fn.prototype;
        }
    } else if (name === '%AsyncIteratorPrototype%') {
        var gen = doEval('%AsyncGenerator%');
        if (gen && getProto) {
            value = getProto(gen.prototype);
        }
    }
    INTRINSICS[name] = value;
    return value;
};
var LEGACY_ALIASES = {
    __proto__: null,
    '%ArrayBufferPrototype%': [
        'ArrayBuffer',
        'prototype'
    ],
    '%ArrayPrototype%': [
        'Array',
        'prototype'
    ],
    '%ArrayProto_entries%': [
        'Array',
        'prototype',
        'entries'
    ],
    '%ArrayProto_forEach%': [
        'Array',
        'prototype',
        'forEach'
    ],
    '%ArrayProto_keys%': [
        'Array',
        'prototype',
        'keys'
    ],
    '%ArrayProto_values%': [
        'Array',
        'prototype',
        'values'
    ],
    '%AsyncFunctionPrototype%': [
        'AsyncFunction',
        'prototype'
    ],
    '%AsyncGenerator%': [
        'AsyncGeneratorFunction',
        'prototype'
    ],
    '%AsyncGeneratorPrototype%': [
        'AsyncGeneratorFunction',
        'prototype',
        'prototype'
    ],
    '%BooleanPrototype%': [
        'Boolean',
        'prototype'
    ],
    '%DataViewPrototype%': [
        'DataView',
        'prototype'
    ],
    '%DatePrototype%': [
        'Date',
        'prototype'
    ],
    '%ErrorPrototype%': [
        'Error',
        'prototype'
    ],
    '%EvalErrorPrototype%': [
        'EvalError',
        'prototype'
    ],
    '%Float32ArrayPrototype%': [
        'Float32Array',
        'prototype'
    ],
    '%Float64ArrayPrototype%': [
        'Float64Array',
        'prototype'
    ],
    '%FunctionPrototype%': [
        'Function',
        'prototype'
    ],
    '%Generator%': [
        'GeneratorFunction',
        'prototype'
    ],
    '%GeneratorPrototype%': [
        'GeneratorFunction',
        'prototype',
        'prototype'
    ],
    '%Int8ArrayPrototype%': [
        'Int8Array',
        'prototype'
    ],
    '%Int16ArrayPrototype%': [
        'Int16Array',
        'prototype'
    ],
    '%Int32ArrayPrototype%': [
        'Int32Array',
        'prototype'
    ],
    '%JSONParse%': [
        'JSON',
        'parse'
    ],
    '%JSONStringify%': [
        'JSON',
        'stringify'
    ],
    '%MapPrototype%': [
        'Map',
        'prototype'
    ],
    '%NumberPrototype%': [
        'Number',
        'prototype'
    ],
    '%ObjectPrototype%': [
        'Object',
        'prototype'
    ],
    '%ObjProto_toString%': [
        'Object',
        'prototype',
        'toString'
    ],
    '%ObjProto_valueOf%': [
        'Object',
        'prototype',
        'valueOf'
    ],
    '%PromisePrototype%': [
        'Promise',
        'prototype'
    ],
    '%PromiseProto_then%': [
        'Promise',
        'prototype',
        'then'
    ],
    '%Promise_all%': [
        'Promise',
        'all'
    ],
    '%Promise_reject%': [
        'Promise',
        'reject'
    ],
    '%Promise_resolve%': [
        'Promise',
        'resolve'
    ],
    '%RangeErrorPrototype%': [
        'RangeError',
        'prototype'
    ],
    '%ReferenceErrorPrototype%': [
        'ReferenceError',
        'prototype'
    ],
    '%RegExpPrototype%': [
        'RegExp',
        'prototype'
    ],
    '%SetPrototype%': [
        'Set',
        'prototype'
    ],
    '%SharedArrayBufferPrototype%': [
        'SharedArrayBuffer',
        'prototype'
    ],
    '%StringPrototype%': [
        'String',
        'prototype'
    ],
    '%SymbolPrototype%': [
        'Symbol',
        'prototype'
    ],
    '%SyntaxErrorPrototype%': [
        'SyntaxError',
        'prototype'
    ],
    '%TypedArrayPrototype%': [
        'TypedArray',
        'prototype'
    ],
    '%TypeErrorPrototype%': [
        'TypeError',
        'prototype'
    ],
    '%Uint8ArrayPrototype%': [
        'Uint8Array',
        'prototype'
    ],
    '%Uint8ClampedArrayPrototype%': [
        'Uint8ClampedArray',
        'prototype'
    ],
    '%Uint16ArrayPrototype%': [
        'Uint16Array',
        'prototype'
    ],
    '%Uint32ArrayPrototype%': [
        'Uint32Array',
        'prototype'
    ],
    '%URIErrorPrototype%': [
        'URIError',
        'prototype'
    ],
    '%WeakMapPrototype%': [
        'WeakMap',
        'prototype'
    ],
    '%WeakSetPrototype%': [
        'WeakSet',
        'prototype'
    ]
};
var bind = __turbopack_context__.r("[project]/aptiverse/aptiverse-ui/node_modules/function-bind/index.js [app-rsc] (ecmascript)");
var hasOwn = __turbopack_context__.r("[project]/aptiverse/aptiverse-ui/node_modules/hasown/index.js [app-rsc] (ecmascript)");
var $concat = bind.call($call, Array.prototype.concat);
var $spliceApply = bind.call($apply, Array.prototype.splice);
var $replace = bind.call($call, String.prototype.replace);
var $strSlice = bind.call($call, String.prototype.slice);
var $exec = bind.call($call, RegExp.prototype.exec);
/* adapted from https://github.com/lodash/lodash/blob/4.17.15/dist/lodash.js#L6735-L6744 */ var rePropName = /[^%.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|%$))/g;
var reEscapeChar = /\\(\\)?/g; /** Used to match backslashes in property paths. */ 
var stringToPath = function stringToPath(string) {
    var first = $strSlice(string, 0, 1);
    var last = $strSlice(string, -1);
    if (first === '%' && last !== '%') {
        throw new $SyntaxError('invalid intrinsic syntax, expected closing `%`');
    } else if (last === '%' && first !== '%') {
        throw new $SyntaxError('invalid intrinsic syntax, expected opening `%`');
    }
    var result = [];
    $replace(string, rePropName, function(match, number, quote, subString) {
        result[result.length] = quote ? $replace(subString, reEscapeChar, '$1') : number || match;
    });
    return result;
};
/* end adaptation */ var getBaseIntrinsic = function getBaseIntrinsic(name, allowMissing) {
    var intrinsicName = name;
    var alias;
    if (hasOwn(LEGACY_ALIASES, intrinsicName)) {
        alias = LEGACY_ALIASES[intrinsicName];
        intrinsicName = '%' + alias[0] + '%';
    }
    if (hasOwn(INTRINSICS, intrinsicName)) {
        var value = INTRINSICS[intrinsicName];
        if (value === needsEval) {
            value = doEval(intrinsicName);
        }
        if (typeof value === 'undefined' && !allowMissing) {
            throw new $TypeError('intrinsic ' + name + ' exists, but is not available. Please file an issue!');
        }
        return {
            alias: alias,
            name: intrinsicName,
            value: value
        };
    }
    throw new $SyntaxError('intrinsic ' + name + ' does not exist!');
};
module.exports = function GetIntrinsic(name, allowMissing) {
    if (typeof name !== 'string' || name.length === 0) {
        throw new $TypeError('intrinsic name must be a non-empty string');
    }
    if (arguments.length > 1 && typeof allowMissing !== 'boolean') {
        throw new $TypeError('"allowMissing" argument must be a boolean');
    }
    if ($exec(/^%?[^%]*%?$/, name) === null) {
        throw new $SyntaxError('`%` may not be present anywhere but at the beginning and end of the intrinsic name');
    }
    var parts = stringToPath(name);
    var intrinsicBaseName = parts.length > 0 ? parts[0] : '';
    var intrinsic = getBaseIntrinsic('%' + intrinsicBaseName + '%', allowMissing);
    var intrinsicRealName = intrinsic.name;
    var value = intrinsic.value;
    var skipFurtherCaching = false;
    var alias = intrinsic.alias;
    if (alias) {
        intrinsicBaseName = alias[0];
        $spliceApply(parts, $concat([
            0,
            1
        ], alias));
    }
    for(var i = 1, isOwn = true; i < parts.length; i += 1){
        var part = parts[i];
        var first = $strSlice(part, 0, 1);
        var last = $strSlice(part, -1);
        if ((first === '"' || first === "'" || first === '`' || last === '"' || last === "'" || last === '`') && first !== last) {
            throw new $SyntaxError('property names with quotes must have matching quotes');
        }
        if (part === 'constructor' || !isOwn) {
            skipFurtherCaching = true;
        }
        intrinsicBaseName += '.' + part;
        intrinsicRealName = '%' + intrinsicBaseName + '%';
        if (hasOwn(INTRINSICS, intrinsicRealName)) {
            value = INTRINSICS[intrinsicRealName];
        } else if (value != null) {
            if (!(part in value)) {
                if (!allowMissing) {
                    throw new $TypeError('base intrinsic for ' + name + ' exists, but the property is not available.');
                }
                return void undefined;
            }
            if ($gOPD && i + 1 >= parts.length) {
                var desc = $gOPD(value, part);
                isOwn = !!desc;
                // By convention, when a data property is converted to an accessor
                // property to emulate a data property that does not suffer from
                // the override mistake, that accessor's getter is marked with
                // an `originalValue` property. Here, when we detect this, we
                // uphold the illusion by pretending to see that original data
                // property, i.e., returning the value rather than the getter
                // itself.
                if (isOwn && 'get' in desc && !('originalValue' in desc.get)) {
                    value = desc.get;
                } else {
                    value = value[part];
                }
            } else {
                isOwn = hasOwn(value, part);
                value = value[part];
            }
            if (isOwn && !skipFurtherCaching) {
                INTRINSICS[intrinsicRealName] = value;
            }
        }
    }
    return value;
};
}),
"[project]/aptiverse/aptiverse-ui/node_modules/has-tostringtag/shams.js [app-rsc] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

var hasSymbols = __turbopack_context__.r("[project]/aptiverse/aptiverse-ui/node_modules/has-symbols/shams.js [app-rsc] (ecmascript)");
/** @type {import('.')} */ module.exports = function hasToStringTagShams() {
    return hasSymbols() && !!Symbol.toStringTag;
};
}),
"[project]/aptiverse/aptiverse-ui/node_modules/es-set-tostringtag/index.js [app-rsc] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

var GetIntrinsic = __turbopack_context__.r("[project]/aptiverse/aptiverse-ui/node_modules/get-intrinsic/index.js [app-rsc] (ecmascript)");
var $defineProperty = GetIntrinsic('%Object.defineProperty%', true);
var hasToStringTag = __turbopack_context__.r("[project]/aptiverse/aptiverse-ui/node_modules/has-tostringtag/shams.js [app-rsc] (ecmascript)")();
var hasOwn = __turbopack_context__.r("[project]/aptiverse/aptiverse-ui/node_modules/hasown/index.js [app-rsc] (ecmascript)");
var $TypeError = __turbopack_context__.r("[project]/aptiverse/aptiverse-ui/node_modules/es-errors/type.js [app-rsc] (ecmascript)");
var toStringTag = hasToStringTag ? Symbol.toStringTag : null;
/** @type {import('.')} */ module.exports = function setToStringTag(object, value) {
    var overrideIfSet = arguments.length > 2 && !!arguments[2] && arguments[2].force;
    var nonConfigurable = arguments.length > 2 && !!arguments[2] && arguments[2].nonConfigurable;
    if (typeof overrideIfSet !== 'undefined' && typeof overrideIfSet !== 'boolean' || typeof nonConfigurable !== 'undefined' && typeof nonConfigurable !== 'boolean') {
        throw new $TypeError('if provided, the `overrideIfSet` and `nonConfigurable` options must be booleans');
    }
    if (toStringTag && (overrideIfSet || !hasOwn(object, toStringTag))) {
        if ($defineProperty) {
            $defineProperty(object, toStringTag, {
                configurable: !nonConfigurable,
                enumerable: false,
                value: value,
                writable: false
            });
        } else {
            object[toStringTag] = value; // eslint-disable-line no-param-reassign
        }
    }
};
}),
"[project]/aptiverse/aptiverse-ui/node_modules/form-data/lib/populate.js [app-rsc] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

// populates missing values
module.exports = function(dst, src) {
    Object.keys(src).forEach(function(prop) {
        dst[prop] = dst[prop] || src[prop]; // eslint-disable-line no-param-reassign
    });
    return dst;
};
}),
"[project]/aptiverse/aptiverse-ui/node_modules/form-data/lib/form_data.js [app-rsc] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

var CombinedStream = __turbopack_context__.r("[project]/aptiverse/aptiverse-ui/node_modules/combined-stream/lib/combined_stream.js [app-rsc] (ecmascript)");
var util = __turbopack_context__.r("[externals]/util [external] (util, cjs)");
var path = __turbopack_context__.r("[externals]/path [external] (path, cjs)");
var http = __turbopack_context__.r("[externals]/http [external] (http, cjs)");
var https = __turbopack_context__.r("[externals]/https [external] (https, cjs)");
var parseUrl = __turbopack_context__.r("[externals]/url [external] (url, cjs)").parse;
var fs = __turbopack_context__.r("[externals]/fs [external] (fs, cjs)");
var Stream = __turbopack_context__.r("[externals]/stream [external] (stream, cjs)").Stream;
var crypto = __turbopack_context__.r("[externals]/crypto [external] (crypto, cjs)");
var mime = __turbopack_context__.r("[project]/aptiverse/aptiverse-ui/node_modules/mime-types/index.js [app-rsc] (ecmascript)");
var asynckit = __turbopack_context__.r("[project]/aptiverse/aptiverse-ui/node_modules/asynckit/index.js [app-rsc] (ecmascript)");
var setToStringTag = __turbopack_context__.r("[project]/aptiverse/aptiverse-ui/node_modules/es-set-tostringtag/index.js [app-rsc] (ecmascript)");
var hasOwn = __turbopack_context__.r("[project]/aptiverse/aptiverse-ui/node_modules/hasown/index.js [app-rsc] (ecmascript)");
var populate = __turbopack_context__.r("[project]/aptiverse/aptiverse-ui/node_modules/form-data/lib/populate.js [app-rsc] (ecmascript)");
/**
 * Create readable "multipart/form-data" streams.
 * Can be used to submit forms
 * and file uploads to other web applications.
 *
 * @constructor
 * @param {object} options - Properties to be added/overriden for FormData and CombinedStream
 */ function FormData(options) {
    if (!(this instanceof FormData)) {
        return new FormData(options);
    }
    this._overheadLength = 0;
    this._valueLength = 0;
    this._valuesToMeasure = [];
    CombinedStream.call(this);
    options = options || {}; // eslint-disable-line no-param-reassign
    for(var option in options){
        this[option] = options[option];
    }
}
// make it a Stream
util.inherits(FormData, CombinedStream);
FormData.LINE_BREAK = '\r\n';
FormData.DEFAULT_CONTENT_TYPE = 'application/octet-stream';
FormData.prototype.append = function(field, value, options) {
    options = options || {}; // eslint-disable-line no-param-reassign
    // allow filename as single option
    if (typeof options === 'string') {
        options = {
            filename: options
        }; // eslint-disable-line no-param-reassign
    }
    var append = CombinedStream.prototype.append.bind(this);
    // all that streamy business can't handle numbers
    if (typeof value === 'number' || value == null) {
        value = String(value); // eslint-disable-line no-param-reassign
    }
    // https://github.com/felixge/node-form-data/issues/38
    if (Array.isArray(value)) {
        /*
     * Please convert your array into string
     * the way web server expects it
     */ this._error(new Error('Arrays are not supported.'));
        return;
    }
    var header = this._multiPartHeader(field, value, options);
    var footer = this._multiPartFooter();
    append(header);
    append(value);
    append(footer);
    // pass along options.knownLength
    this._trackLength(header, value, options);
};
FormData.prototype._trackLength = function(header, value, options) {
    var valueLength = 0;
    /*
   * used w/ getLengthSync(), when length is known.
   * e.g. for streaming directly from a remote server,
   * w/ a known file a size, and not wanting to wait for
   * incoming file to finish to get its size.
   */ if (options.knownLength != null) {
        valueLength += Number(options.knownLength);
    } else if (Buffer.isBuffer(value)) {
        valueLength = value.length;
    } else if (typeof value === 'string') {
        valueLength = Buffer.byteLength(value);
    }
    this._valueLength += valueLength;
    // @check why add CRLF? does this account for custom/multiple CRLFs?
    this._overheadLength += Buffer.byteLength(header) + FormData.LINE_BREAK.length;
    // empty or either doesn't have path or not an http response or not a stream
    if (!value || !value.path && !(value.readable && hasOwn(value, 'httpVersion')) && !(value instanceof Stream)) {
        return;
    }
    // no need to bother with the length
    if (!options.knownLength) {
        this._valuesToMeasure.push(value);
    }
};
FormData.prototype._lengthRetriever = function(value, callback) {
    if (hasOwn(value, 'fd')) {
        // take read range into a account
        // `end` = Infinity –> read file till the end
        //
        // TODO: Looks like there is bug in Node fs.createReadStream
        // it doesn't respect `end` options without `start` options
        // Fix it when node fixes it.
        // https://github.com/joyent/node/issues/7819
        if (value.end != undefined && value.end != Infinity && value.start != undefined) {
            // when end specified
            // no need to calculate range
            // inclusive, starts with 0
            callback(null, value.end + 1 - (value.start ? value.start : 0)); // eslint-disable-line callback-return
        // not that fast snoopy
        } else {
            // still need to fetch file size from fs
            fs.stat(value.path, function(err, stat) {
                if (err) {
                    callback(err);
                    return;
                }
                // update final size based on the range options
                var fileSize = stat.size - (value.start ? value.start : 0);
                callback(null, fileSize);
            });
        }
    // or http response
    } else if (hasOwn(value, 'httpVersion')) {
        callback(null, Number(value.headers['content-length'])); // eslint-disable-line callback-return
    // or request stream http://github.com/mikeal/request
    } else if (hasOwn(value, 'httpModule')) {
        // wait till response come back
        value.on('response', function(response) {
            value.pause();
            callback(null, Number(response.headers['content-length']));
        });
        value.resume();
    // something else
    } else {
        callback('Unknown stream'); // eslint-disable-line callback-return
    }
};
FormData.prototype._multiPartHeader = function(field, value, options) {
    /*
   * custom header specified (as string)?
   * it becomes responsible for boundary
   * (e.g. to handle extra CRLFs on .NET servers)
   */ if (typeof options.header === 'string') {
        return options.header;
    }
    var contentDisposition = this._getContentDisposition(value, options);
    var contentType = this._getContentType(value, options);
    var contents = '';
    var headers = {
        // add custom disposition as third element or keep it two elements if not
        'Content-Disposition': [
            'form-data',
            'name="' + field + '"'
        ].concat(contentDisposition || []),
        // if no content type. allow it to be empty array
        'Content-Type': [].concat(contentType || [])
    };
    // allow custom headers.
    if (typeof options.header === 'object') {
        populate(headers, options.header);
    }
    var header;
    for(var prop in headers){
        if (hasOwn(headers, prop)) {
            header = headers[prop];
            // skip nullish headers.
            if (header == null) {
                continue; // eslint-disable-line no-restricted-syntax, no-continue
            }
            // convert all headers to arrays.
            if (!Array.isArray(header)) {
                header = [
                    header
                ];
            }
            // add non-empty headers.
            if (header.length) {
                contents += prop + ': ' + header.join('; ') + FormData.LINE_BREAK;
            }
        }
    }
    return '--' + this.getBoundary() + FormData.LINE_BREAK + contents + FormData.LINE_BREAK;
};
FormData.prototype._getContentDisposition = function(value, options) {
    var filename;
    if (typeof options.filepath === 'string') {
        // custom filepath for relative paths
        filename = path.normalize(options.filepath).replace(/\\/g, '/');
    } else if (options.filename || value && (value.name || value.path)) {
        /*
     * custom filename take precedence
     * formidable and the browser add a name property
     * fs- and request- streams have path property
     */ filename = path.basename(options.filename || value && (value.name || value.path));
    } else if (value && value.readable && hasOwn(value, 'httpVersion')) {
        // or try http response
        filename = path.basename(value.client._httpMessage.path || '');
    }
    if (filename) {
        return 'filename="' + filename + '"';
    }
};
FormData.prototype._getContentType = function(value, options) {
    // use custom content-type above all
    var contentType = options.contentType;
    // or try `name` from formidable, browser
    if (!contentType && value && value.name) {
        contentType = mime.lookup(value.name);
    }
    // or try `path` from fs-, request- streams
    if (!contentType && value && value.path) {
        contentType = mime.lookup(value.path);
    }
    // or if it's http-reponse
    if (!contentType && value && value.readable && hasOwn(value, 'httpVersion')) {
        contentType = value.headers['content-type'];
    }
    // or guess it from the filepath or filename
    if (!contentType && (options.filepath || options.filename)) {
        contentType = mime.lookup(options.filepath || options.filename);
    }
    // fallback to the default content type if `value` is not simple value
    if (!contentType && value && typeof value === 'object') {
        contentType = FormData.DEFAULT_CONTENT_TYPE;
    }
    return contentType;
};
FormData.prototype._multiPartFooter = function() {
    return (function(next) {
        var footer = FormData.LINE_BREAK;
        var lastPart = this._streams.length === 0;
        if (lastPart) {
            footer += this._lastBoundary();
        }
        next(footer);
    }).bind(this);
};
FormData.prototype._lastBoundary = function() {
    return '--' + this.getBoundary() + '--' + FormData.LINE_BREAK;
};
FormData.prototype.getHeaders = function(userHeaders) {
    var header;
    var formHeaders = {
        'content-type': 'multipart/form-data; boundary=' + this.getBoundary()
    };
    for(header in userHeaders){
        if (hasOwn(userHeaders, header)) {
            formHeaders[header.toLowerCase()] = userHeaders[header];
        }
    }
    return formHeaders;
};
FormData.prototype.setBoundary = function(boundary) {
    if (typeof boundary !== 'string') {
        throw new TypeError('FormData boundary must be a string');
    }
    this._boundary = boundary;
};
FormData.prototype.getBoundary = function() {
    if (!this._boundary) {
        this._generateBoundary();
    }
    return this._boundary;
};
FormData.prototype.getBuffer = function() {
    var dataBuffer = new Buffer.alloc(0); // eslint-disable-line new-cap
    var boundary = this.getBoundary();
    // Create the form content. Add Line breaks to the end of data.
    for(var i = 0, len = this._streams.length; i < len; i++){
        if (typeof this._streams[i] !== 'function') {
            // Add content to the buffer.
            if (Buffer.isBuffer(this._streams[i])) {
                dataBuffer = Buffer.concat([
                    dataBuffer,
                    this._streams[i]
                ]);
            } else {
                dataBuffer = Buffer.concat([
                    dataBuffer,
                    Buffer.from(this._streams[i])
                ]);
            }
            // Add break after content.
            if (typeof this._streams[i] !== 'string' || this._streams[i].substring(2, boundary.length + 2) !== boundary) {
                dataBuffer = Buffer.concat([
                    dataBuffer,
                    Buffer.from(FormData.LINE_BREAK)
                ]);
            }
        }
    }
    // Add the footer and return the Buffer object.
    return Buffer.concat([
        dataBuffer,
        Buffer.from(this._lastBoundary())
    ]);
};
FormData.prototype._generateBoundary = function() {
    // This generates a 50 character boundary similar to those used by Firefox.
    // They are optimized for boyer-moore parsing.
    this._boundary = '--------------------------' + crypto.randomBytes(12).toString('hex');
};
// Note: getLengthSync DOESN'T calculate streams length
// As workaround one can calculate file size manually and add it as knownLength option
FormData.prototype.getLengthSync = function() {
    var knownLength = this._overheadLength + this._valueLength;
    // Don't get confused, there are 3 "internal" streams for each keyval pair so it basically checks if there is any value added to the form
    if (this._streams.length) {
        knownLength += this._lastBoundary().length;
    }
    // https://github.com/form-data/form-data/issues/40
    if (!this.hasKnownLength()) {
        /*
     * Some async length retrievers are present
     * therefore synchronous length calculation is false.
     * Please use getLength(callback) to get proper length
     */ this._error(new Error('Cannot calculate proper length in synchronous way.'));
    }
    return knownLength;
};
// Public API to check if length of added values is known
// https://github.com/form-data/form-data/issues/196
// https://github.com/form-data/form-data/issues/262
FormData.prototype.hasKnownLength = function() {
    var hasKnownLength = true;
    if (this._valuesToMeasure.length) {
        hasKnownLength = false;
    }
    return hasKnownLength;
};
FormData.prototype.getLength = function(cb) {
    var knownLength = this._overheadLength + this._valueLength;
    if (this._streams.length) {
        knownLength += this._lastBoundary().length;
    }
    if (!this._valuesToMeasure.length) {
        process.nextTick(cb.bind(this, null, knownLength));
        return;
    }
    asynckit.parallel(this._valuesToMeasure, this._lengthRetriever, function(err, values) {
        if (err) {
            cb(err);
            return;
        }
        values.forEach(function(length) {
            knownLength += length;
        });
        cb(null, knownLength);
    });
};
FormData.prototype.submit = function(params, cb) {
    var request;
    var options;
    var defaults = {
        method: 'post'
    };
    // parse provided url if it's string or treat it as options object
    if (typeof params === 'string') {
        params = parseUrl(params); // eslint-disable-line no-param-reassign
        /* eslint sort-keys: 0 */ options = populate({
            port: params.port,
            path: params.pathname,
            host: params.hostname,
            protocol: params.protocol
        }, defaults);
    } else {
        options = populate(params, defaults);
        // if no port provided use default one
        if (!options.port) {
            options.port = options.protocol === 'https:' ? 443 : 80;
        }
    }
    // put that good code in getHeaders to some use
    options.headers = this.getHeaders(params.headers);
    // https if specified, fallback to http in any other case
    if (options.protocol === 'https:') {
        request = https.request(options);
    } else {
        request = http.request(options);
    }
    // get content length and fire away
    this.getLength((function(err, length) {
        if (err && err !== 'Unknown stream') {
            this._error(err);
            return;
        }
        // add content length
        if (length) {
            request.setHeader('Content-Length', length);
        }
        this.pipe(request);
        if (cb) {
            var onResponse;
            var callback = function(error, responce) {
                request.removeListener('error', callback);
                request.removeListener('response', onResponse);
                return cb.call(this, error, responce); // eslint-disable-line no-invalid-this
            };
            onResponse = callback.bind(this, null);
            request.on('error', callback);
            request.on('response', onResponse);
        }
    }).bind(this));
    return request;
};
FormData.prototype._error = function(err) {
    if (!this.error) {
        this.error = err;
        this.pause();
        this.emit('error', err);
    }
};
FormData.prototype.toString = function() {
    return '[object FormData]';
};
setToStringTag(FormData, 'FormData');
// Public API
module.exports = FormData;
}),
"[project]/aptiverse/aptiverse-ui/node_modules/proxy-from-env/index.js [app-rsc] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

var parseUrl = __turbopack_context__.r("[externals]/url [external] (url, cjs)").parse;
var DEFAULT_PORTS = {
    ftp: 21,
    gopher: 70,
    http: 80,
    https: 443,
    ws: 80,
    wss: 443
};
var stringEndsWith = String.prototype.endsWith || function(s) {
    return s.length <= this.length && this.indexOf(s, this.length - s.length) !== -1;
};
/**
 * @param {string|object} url - The URL, or the result from url.parse.
 * @return {string} The URL of the proxy that should handle the request to the
 *  given URL. If no proxy is set, this will be an empty string.
 */ function getProxyForUrl(url) {
    var parsedUrl = typeof url === 'string' ? parseUrl(url) : url || {};
    var proto = parsedUrl.protocol;
    var hostname = parsedUrl.host;
    var port = parsedUrl.port;
    if (typeof hostname !== 'string' || !hostname || typeof proto !== 'string') {
        return ''; // Don't proxy URLs without a valid scheme or host.
    }
    proto = proto.split(':', 1)[0];
    // Stripping ports in this way instead of using parsedUrl.hostname to make
    // sure that the brackets around IPv6 addresses are kept.
    hostname = hostname.replace(/:\d*$/, '');
    port = parseInt(port) || DEFAULT_PORTS[proto] || 0;
    if (!shouldProxy(hostname, port)) {
        return ''; // Don't proxy URLs that match NO_PROXY.
    }
    var proxy = getEnv('npm_config_' + proto + '_proxy') || getEnv(proto + '_proxy') || getEnv('npm_config_proxy') || getEnv('all_proxy');
    if (proxy && proxy.indexOf('://') === -1) {
        // Missing scheme in proxy, default to the requested URL's scheme.
        proxy = proto + '://' + proxy;
    }
    return proxy;
}
/**
 * Determines whether a given URL should be proxied.
 *
 * @param {string} hostname - The host name of the URL.
 * @param {number} port - The effective port of the URL.
 * @returns {boolean} Whether the given URL should be proxied.
 * @private
 */ function shouldProxy(hostname, port) {
    var NO_PROXY = (getEnv('npm_config_no_proxy') || getEnv('no_proxy')).toLowerCase();
    if (!NO_PROXY) {
        return true; // Always proxy if NO_PROXY is not set.
    }
    if (NO_PROXY === '*') {
        return false; // Never proxy if wildcard is set.
    }
    return NO_PROXY.split(/[,\s]/).every(function(proxy) {
        if (!proxy) {
            return true; // Skip zero-length hosts.
        }
        var parsedProxy = proxy.match(/^(.+):(\d+)$/);
        var parsedProxyHostname = parsedProxy ? parsedProxy[1] : proxy;
        var parsedProxyPort = parsedProxy ? parseInt(parsedProxy[2]) : 0;
        if (parsedProxyPort && parsedProxyPort !== port) {
            return true; // Skip if ports don't match.
        }
        if (!/^[.*]/.test(parsedProxyHostname)) {
            // No wildcards, so stop proxying if there is an exact match.
            return hostname !== parsedProxyHostname;
        }
        if (parsedProxyHostname.charAt(0) === '*') {
            // Remove leading wildcard.
            parsedProxyHostname = parsedProxyHostname.slice(1);
        }
        // Stop proxying if the hostname ends with the no_proxy host.
        return !stringEndsWith.call(hostname, parsedProxyHostname);
    });
}
/**
 * Get the value for an environment variable.
 *
 * @param {string} key - The name of the environment variable.
 * @return {string} The value of the environment variable.
 * @private
 */ function getEnv(key) {
    return process.env[key.toLowerCase()] || process.env[key.toUpperCase()] || '';
}
exports.getProxyForUrl = getProxyForUrl;
}),
"[project]/aptiverse/aptiverse-ui/node_modules/ms/index.js [app-rsc] (ecmascript)", ((__turbopack_context__, module, exports) => {

/**
 * Helpers.
 */ var s = 1000;
var m = s * 60;
var h = m * 60;
var d = h * 24;
var w = d * 7;
var y = d * 365.25;
/**
 * Parse or format the given `val`.
 *
 * Options:
 *
 *  - `long` verbose formatting [false]
 *
 * @param {String|Number} val
 * @param {Object} [options]
 * @throws {Error} throw an error if val is not a non-empty string or a number
 * @return {String|Number}
 * @api public
 */ module.exports = function(val, options) {
    options = options || {};
    var type = typeof val;
    if (type === 'string' && val.length > 0) {
        return parse(val);
    } else if (type === 'number' && isFinite(val)) {
        return options.long ? fmtLong(val) : fmtShort(val);
    }
    throw new Error('val is not a non-empty string or a valid number. val=' + JSON.stringify(val));
};
/**
 * Parse the given `str` and return milliseconds.
 *
 * @param {String} str
 * @return {Number}
 * @api private
 */ function parse(str) {
    str = String(str);
    if (str.length > 100) {
        return;
    }
    var match = /^(-?(?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)?$/i.exec(str);
    if (!match) {
        return;
    }
    var n = parseFloat(match[1]);
    var type = (match[2] || 'ms').toLowerCase();
    switch(type){
        case 'years':
        case 'year':
        case 'yrs':
        case 'yr':
        case 'y':
            return n * y;
        case 'weeks':
        case 'week':
        case 'w':
            return n * w;
        case 'days':
        case 'day':
        case 'd':
            return n * d;
        case 'hours':
        case 'hour':
        case 'hrs':
        case 'hr':
        case 'h':
            return n * h;
        case 'minutes':
        case 'minute':
        case 'mins':
        case 'min':
        case 'm':
            return n * m;
        case 'seconds':
        case 'second':
        case 'secs':
        case 'sec':
        case 's':
            return n * s;
        case 'milliseconds':
        case 'millisecond':
        case 'msecs':
        case 'msec':
        case 'ms':
            return n;
        default:
            return undefined;
    }
}
/**
 * Short format for `ms`.
 *
 * @param {Number} ms
 * @return {String}
 * @api private
 */ function fmtShort(ms) {
    var msAbs = Math.abs(ms);
    if (msAbs >= d) {
        return Math.round(ms / d) + 'd';
    }
    if (msAbs >= h) {
        return Math.round(ms / h) + 'h';
    }
    if (msAbs >= m) {
        return Math.round(ms / m) + 'm';
    }
    if (msAbs >= s) {
        return Math.round(ms / s) + 's';
    }
    return ms + 'ms';
}
/**
 * Long format for `ms`.
 *
 * @param {Number} ms
 * @return {String}
 * @api private
 */ function fmtLong(ms) {
    var msAbs = Math.abs(ms);
    if (msAbs >= d) {
        return plural(ms, msAbs, d, 'day');
    }
    if (msAbs >= h) {
        return plural(ms, msAbs, h, 'hour');
    }
    if (msAbs >= m) {
        return plural(ms, msAbs, m, 'minute');
    }
    if (msAbs >= s) {
        return plural(ms, msAbs, s, 'second');
    }
    return ms + ' ms';
}
/**
 * Pluralization helper.
 */ function plural(ms, msAbs, n, name) {
    var isPlural = msAbs >= n * 1.5;
    return Math.round(ms / n) + ' ' + name + (isPlural ? 's' : '');
}
}),
"[project]/aptiverse/aptiverse-ui/node_modules/debug/src/common.js [app-rsc] (ecmascript)", ((__turbopack_context__, module, exports) => {

/**
 * This is the common logic for both the Node.js and web browser
 * implementations of `debug()`.
 */ function setup(env) {
    createDebug.debug = createDebug;
    createDebug.default = createDebug;
    createDebug.coerce = coerce;
    createDebug.disable = disable;
    createDebug.enable = enable;
    createDebug.enabled = enabled;
    createDebug.humanize = __turbopack_context__.r("[project]/aptiverse/aptiverse-ui/node_modules/ms/index.js [app-rsc] (ecmascript)");
    createDebug.destroy = destroy;
    Object.keys(env).forEach((key)=>{
        createDebug[key] = env[key];
    });
    /**
	* The currently active debug mode names, and names to skip.
	*/ createDebug.names = [];
    createDebug.skips = [];
    /**
	* Map of special "%n" handling functions, for the debug "format" argument.
	*
	* Valid key names are a single, lower or upper-case letter, i.e. "n" and "N".
	*/ createDebug.formatters = {};
    /**
	* Selects a color for a debug namespace
	* @param {String} namespace The namespace string for the debug instance to be colored
	* @return {Number|String} An ANSI color code for the given namespace
	* @api private
	*/ function selectColor(namespace) {
        let hash = 0;
        for(let i = 0; i < namespace.length; i++){
            hash = (hash << 5) - hash + namespace.charCodeAt(i);
            hash |= 0; // Convert to 32bit integer
        }
        return createDebug.colors[Math.abs(hash) % createDebug.colors.length];
    }
    createDebug.selectColor = selectColor;
    /**
	* Create a debugger with the given `namespace`.
	*
	* @param {String} namespace
	* @return {Function}
	* @api public
	*/ function createDebug(namespace) {
        let prevTime;
        let enableOverride = null;
        let namespacesCache;
        let enabledCache;
        function debug(...args) {
            // Disabled?
            if (!debug.enabled) {
                return;
            }
            const self = debug;
            // Set `diff` timestamp
            const curr = Number(new Date());
            const ms = curr - (prevTime || curr);
            self.diff = ms;
            self.prev = prevTime;
            self.curr = curr;
            prevTime = curr;
            args[0] = createDebug.coerce(args[0]);
            if (typeof args[0] !== 'string') {
                // Anything else let's inspect with %O
                args.unshift('%O');
            }
            // Apply any `formatters` transformations
            let index = 0;
            args[0] = args[0].replace(/%([a-zA-Z%])/g, (match, format)=>{
                // If we encounter an escaped % then don't increase the array index
                if (match === '%%') {
                    return '%';
                }
                index++;
                const formatter = createDebug.formatters[format];
                if (typeof formatter === 'function') {
                    const val = args[index];
                    match = formatter.call(self, val);
                    // Now we need to remove `args[index]` since it's inlined in the `format`
                    args.splice(index, 1);
                    index--;
                }
                return match;
            });
            // Apply env-specific formatting (colors, etc.)
            createDebug.formatArgs.call(self, args);
            const logFn = self.log || createDebug.log;
            logFn.apply(self, args);
        }
        debug.namespace = namespace;
        debug.useColors = createDebug.useColors();
        debug.color = createDebug.selectColor(namespace);
        debug.extend = extend;
        debug.destroy = createDebug.destroy; // XXX Temporary. Will be removed in the next major release.
        Object.defineProperty(debug, 'enabled', {
            enumerable: true,
            configurable: false,
            get: ()=>{
                if (enableOverride !== null) {
                    return enableOverride;
                }
                if (namespacesCache !== createDebug.namespaces) {
                    namespacesCache = createDebug.namespaces;
                    enabledCache = createDebug.enabled(namespace);
                }
                return enabledCache;
            },
            set: (v)=>{
                enableOverride = v;
            }
        });
        // Env-specific initialization logic for debug instances
        if (typeof createDebug.init === 'function') {
            createDebug.init(debug);
        }
        return debug;
    }
    function extend(namespace, delimiter) {
        const newDebug = createDebug(this.namespace + (typeof delimiter === 'undefined' ? ':' : delimiter) + namespace);
        newDebug.log = this.log;
        return newDebug;
    }
    /**
	* Enables a debug mode by namespaces. This can include modes
	* separated by a colon and wildcards.
	*
	* @param {String} namespaces
	* @api public
	*/ function enable(namespaces) {
        createDebug.save(namespaces);
        createDebug.namespaces = namespaces;
        createDebug.names = [];
        createDebug.skips = [];
        const split = (typeof namespaces === 'string' ? namespaces : '').trim().replace(/\s+/g, ',').split(',').filter(Boolean);
        for (const ns of split){
            if (ns[0] === '-') {
                createDebug.skips.push(ns.slice(1));
            } else {
                createDebug.names.push(ns);
            }
        }
    }
    /**
	 * Checks if the given string matches a namespace template, honoring
	 * asterisks as wildcards.
	 *
	 * @param {String} search
	 * @param {String} template
	 * @return {Boolean}
	 */ function matchesTemplate(search, template) {
        let searchIndex = 0;
        let templateIndex = 0;
        let starIndex = -1;
        let matchIndex = 0;
        while(searchIndex < search.length){
            if (templateIndex < template.length && (template[templateIndex] === search[searchIndex] || template[templateIndex] === '*')) {
                // Match character or proceed with wildcard
                if (template[templateIndex] === '*') {
                    starIndex = templateIndex;
                    matchIndex = searchIndex;
                    templateIndex++; // Skip the '*'
                } else {
                    searchIndex++;
                    templateIndex++;
                }
            } else if (starIndex !== -1) {
                // Backtrack to the last '*' and try to match more characters
                templateIndex = starIndex + 1;
                matchIndex++;
                searchIndex = matchIndex;
            } else {
                return false; // No match
            }
        }
        // Handle trailing '*' in template
        while(templateIndex < template.length && template[templateIndex] === '*'){
            templateIndex++;
        }
        return templateIndex === template.length;
    }
    /**
	* Disable debug output.
	*
	* @return {String} namespaces
	* @api public
	*/ function disable() {
        const namespaces = [
            ...createDebug.names,
            ...createDebug.skips.map((namespace)=>'-' + namespace)
        ].join(',');
        createDebug.enable('');
        return namespaces;
    }
    /**
	* Returns true if the given mode name is enabled, false otherwise.
	*
	* @param {String} name
	* @return {Boolean}
	* @api public
	*/ function enabled(name) {
        for (const skip of createDebug.skips){
            if (matchesTemplate(name, skip)) {
                return false;
            }
        }
        for (const ns of createDebug.names){
            if (matchesTemplate(name, ns)) {
                return true;
            }
        }
        return false;
    }
    /**
	* Coerce `val`.
	*
	* @param {Mixed} val
	* @return {Mixed}
	* @api private
	*/ function coerce(val) {
        if (val instanceof Error) {
            return val.stack || val.message;
        }
        return val;
    }
    /**
	* XXX DO NOT USE. This is a temporary stub function.
	* XXX It WILL be removed in the next major release.
	*/ function destroy() {
        console.warn('Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.');
    }
    createDebug.enable(createDebug.load());
    return createDebug;
}
module.exports = setup;
}),
"[project]/aptiverse/aptiverse-ui/node_modules/debug/src/node.js [app-rsc] (ecmascript)", ((__turbopack_context__, module, exports) => {

/**
 * Module dependencies.
 */ const tty = __turbopack_context__.r("[externals]/tty [external] (tty, cjs)");
const util = __turbopack_context__.r("[externals]/util [external] (util, cjs)");
/**
 * This is the Node.js implementation of `debug()`.
 */ exports.init = init;
exports.log = log;
exports.formatArgs = formatArgs;
exports.save = save;
exports.load = load;
exports.useColors = useColors;
exports.destroy = util.deprecate(()=>{}, 'Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.');
/**
 * Colors.
 */ exports.colors = [
    6,
    2,
    3,
    4,
    5,
    1
];
try {
    // Optional dependency (as in, doesn't need to be installed, NOT like optionalDependencies in package.json)
    // eslint-disable-next-line import/no-extraneous-dependencies
    const supportsColor = __turbopack_context__.r("[project]/aptiverse/aptiverse-ui/node_modules/supports-color/index.js [app-rsc] (ecmascript)");
    if (supportsColor && (supportsColor.stderr || supportsColor).level >= 2) {
        exports.colors = [
            20,
            21,
            26,
            27,
            32,
            33,
            38,
            39,
            40,
            41,
            42,
            43,
            44,
            45,
            56,
            57,
            62,
            63,
            68,
            69,
            74,
            75,
            76,
            77,
            78,
            79,
            80,
            81,
            92,
            93,
            98,
            99,
            112,
            113,
            128,
            129,
            134,
            135,
            148,
            149,
            160,
            161,
            162,
            163,
            164,
            165,
            166,
            167,
            168,
            169,
            170,
            171,
            172,
            173,
            178,
            179,
            184,
            185,
            196,
            197,
            198,
            199,
            200,
            201,
            202,
            203,
            204,
            205,
            206,
            207,
            208,
            209,
            214,
            215,
            220,
            221
        ];
    }
} catch (error) {
// Swallow - we only care if `supports-color` is available; it doesn't have to be.
}
/**
 * Build up the default `inspectOpts` object from the environment variables.
 *
 *   $ DEBUG_COLORS=no DEBUG_DEPTH=10 DEBUG_SHOW_HIDDEN=enabled node script.js
 */ exports.inspectOpts = Object.keys(process.env).filter((key)=>{
    return /^debug_/i.test(key);
}).reduce((obj, key)=>{
    // Camel-case
    const prop = key.substring(6).toLowerCase().replace(/_([a-z])/g, (_, k)=>{
        return k.toUpperCase();
    });
    // Coerce string value into JS value
    let val = process.env[key];
    if (/^(yes|on|true|enabled)$/i.test(val)) {
        val = true;
    } else if (/^(no|off|false|disabled)$/i.test(val)) {
        val = false;
    } else if (val === 'null') {
        val = null;
    } else {
        val = Number(val);
    }
    obj[prop] = val;
    return obj;
}, {});
/**
 * Is stdout a TTY? Colored output is enabled when `true`.
 */ function useColors() {
    return 'colors' in exports.inspectOpts ? Boolean(exports.inspectOpts.colors) : tty.isatty(process.stderr.fd);
}
/**
 * Adds ANSI color escape codes if enabled.
 *
 * @api public
 */ function formatArgs(args) {
    const { namespace: name, useColors } = this;
    if (useColors) {
        const c = this.color;
        const colorCode = '\u001B[3' + (c < 8 ? c : '8;5;' + c);
        const prefix = `  ${colorCode};1m${name} \u001B[0m`;
        args[0] = prefix + args[0].split('\n').join('\n' + prefix);
        args.push(colorCode + 'm+' + module.exports.humanize(this.diff) + '\u001B[0m');
    } else {
        args[0] = getDate() + name + ' ' + args[0];
    }
}
function getDate() {
    if (exports.inspectOpts.hideDate) {
        return '';
    }
    return new Date().toISOString() + ' ';
}
/**
 * Invokes `util.formatWithOptions()` with the specified arguments and writes to stderr.
 */ function log(...args) {
    return process.stderr.write(util.formatWithOptions(exports.inspectOpts, ...args) + '\n');
}
/**
 * Save `namespaces`.
 *
 * @param {String} namespaces
 * @api private
 */ function save(namespaces) {
    if (namespaces) {
        process.env.DEBUG = namespaces;
    } else {
        // If you set a process.env field to null or undefined, it gets cast to the
        // string 'null' or 'undefined'. Just delete instead.
        delete process.env.DEBUG;
    }
}
/**
 * Load `namespaces`.
 *
 * @return {String} returns the previously persisted debug modes
 * @api private
 */ function load() {
    return process.env.DEBUG;
}
/**
 * Init logic for `debug` instances.
 *
 * Create a new `inspectOpts` object in case `useColors` is set
 * differently for a particular `debug` instance.
 */ function init(debug) {
    debug.inspectOpts = {};
    const keys = Object.keys(exports.inspectOpts);
    for(let i = 0; i < keys.length; i++){
        debug.inspectOpts[keys[i]] = exports.inspectOpts[keys[i]];
    }
}
module.exports = __turbopack_context__.r("[project]/aptiverse/aptiverse-ui/node_modules/debug/src/common.js [app-rsc] (ecmascript)")(exports);
const { formatters } = module.exports;
/**
 * Map %o to `util.inspect()`, all on a single line.
 */ formatters.o = function(v) {
    this.inspectOpts.colors = this.useColors;
    return util.inspect(v, this.inspectOpts).split('\n').map((str)=>str.trim()).join(' ');
};
/**
 * Map %O to `util.inspect()`, allowing multiple lines if needed.
 */ formatters.O = function(v) {
    this.inspectOpts.colors = this.useColors;
    return util.inspect(v, this.inspectOpts);
};
}),
"[project]/aptiverse/aptiverse-ui/node_modules/debug/src/browser.js [app-rsc] (ecmascript)", ((__turbopack_context__, module, exports) => {

/* eslint-env browser */ /**
 * This is the web browser implementation of `debug()`.
 */ exports.formatArgs = formatArgs;
exports.save = save;
exports.load = load;
exports.useColors = useColors;
exports.storage = localstorage();
exports.destroy = (()=>{
    let warned = false;
    return ()=>{
        if (!warned) {
            warned = true;
            console.warn('Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.');
        }
    };
})();
/**
 * Colors.
 */ exports.colors = [
    '#0000CC',
    '#0000FF',
    '#0033CC',
    '#0033FF',
    '#0066CC',
    '#0066FF',
    '#0099CC',
    '#0099FF',
    '#00CC00',
    '#00CC33',
    '#00CC66',
    '#00CC99',
    '#00CCCC',
    '#00CCFF',
    '#3300CC',
    '#3300FF',
    '#3333CC',
    '#3333FF',
    '#3366CC',
    '#3366FF',
    '#3399CC',
    '#3399FF',
    '#33CC00',
    '#33CC33',
    '#33CC66',
    '#33CC99',
    '#33CCCC',
    '#33CCFF',
    '#6600CC',
    '#6600FF',
    '#6633CC',
    '#6633FF',
    '#66CC00',
    '#66CC33',
    '#9900CC',
    '#9900FF',
    '#9933CC',
    '#9933FF',
    '#99CC00',
    '#99CC33',
    '#CC0000',
    '#CC0033',
    '#CC0066',
    '#CC0099',
    '#CC00CC',
    '#CC00FF',
    '#CC3300',
    '#CC3333',
    '#CC3366',
    '#CC3399',
    '#CC33CC',
    '#CC33FF',
    '#CC6600',
    '#CC6633',
    '#CC9900',
    '#CC9933',
    '#CCCC00',
    '#CCCC33',
    '#FF0000',
    '#FF0033',
    '#FF0066',
    '#FF0099',
    '#FF00CC',
    '#FF00FF',
    '#FF3300',
    '#FF3333',
    '#FF3366',
    '#FF3399',
    '#FF33CC',
    '#FF33FF',
    '#FF6600',
    '#FF6633',
    '#FF9900',
    '#FF9933',
    '#FFCC00',
    '#FFCC33'
];
/**
 * Currently only WebKit-based Web Inspectors, Firefox >= v31,
 * and the Firebug extension (any Firefox version) are known
 * to support "%c" CSS customizations.
 *
 * TODO: add a `localStorage` variable to explicitly enable/disable colors
 */ // eslint-disable-next-line complexity
function useColors() {
    // NB: In an Electron preload script, document will be defined but not fully
    // initialized. Since we know we're in Chrome, we'll just detect this case
    // explicitly
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    // Internet Explorer and Edge do not support colors.
    if (typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/(edge|trident)\/(\d+)/)) {
        return false;
    }
    let m;
    // Is webkit? http://stackoverflow.com/a/16459606/376773
    // document is undefined in react-native: https://github.com/facebook/react-native/pull/1632
    // eslint-disable-next-line no-return-assign
    return typeof document !== 'undefined' && document.documentElement && document.documentElement.style && document.documentElement.style.WebkitAppearance || "undefined" !== 'undefined' && window.console && (window.console.firebug || window.console.exception && window.console.table) || typeof navigator !== 'undefined' && navigator.userAgent && (m = navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/)) && parseInt(m[1], 10) >= 31 || typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/);
}
/**
 * Colorize log arguments if enabled.
 *
 * @api public
 */ function formatArgs(args) {
    args[0] = (this.useColors ? '%c' : '') + this.namespace + (this.useColors ? ' %c' : ' ') + args[0] + (this.useColors ? '%c ' : ' ') + '+' + module.exports.humanize(this.diff);
    if (!this.useColors) {
        return;
    }
    const c = 'color: ' + this.color;
    args.splice(1, 0, c, 'color: inherit');
    // The final "%c" is somewhat tricky, because there could be other
    // arguments passed either before or after the %c, so we need to
    // figure out the correct index to insert the CSS into
    let index = 0;
    let lastC = 0;
    args[0].replace(/%[a-zA-Z%]/g, (match)=>{
        if (match === '%%') {
            return;
        }
        index++;
        if (match === '%c') {
            // We only are interested in the *last* %c
            // (the user may have provided their own)
            lastC = index;
        }
    });
    args.splice(lastC, 0, c);
}
/**
 * Invokes `console.debug()` when available.
 * No-op when `console.debug` is not a "function".
 * If `console.debug` is not available, falls back
 * to `console.log`.
 *
 * @api public
 */ exports.log = console.debug || console.log || (()=>{});
/**
 * Save `namespaces`.
 *
 * @param {String} namespaces
 * @api private
 */ function save(namespaces) {
    try {
        if (namespaces) {
            exports.storage.setItem('debug', namespaces);
        } else {
            exports.storage.removeItem('debug');
        }
    } catch (error) {
    // Swallow
    // XXX (@Qix-) should we be logging these?
    }
}
/**
 * Load `namespaces`.
 *
 * @return {String} returns the previously persisted debug modes
 * @api private
 */ function load() {
    let r;
    try {
        r = exports.storage.getItem('debug') || exports.storage.getItem('DEBUG');
    } catch (error) {
    // Swallow
    // XXX (@Qix-) should we be logging these?
    }
    // If debug isn't set in LS, and we're in Electron, try to load $DEBUG
    if (!r && typeof process !== 'undefined' && 'env' in process) {
        r = process.env.DEBUG;
    }
    return r;
}
/**
 * Localstorage attempts to return the localstorage.
 *
 * This is necessary because safari throws
 * when a user disables cookies/localstorage
 * and you attempt to access it.
 *
 * @return {LocalStorage}
 * @api private
 */ function localstorage() {
    try {
        // TVMLKit (Apple TV JS Runtime) does not have a window object, just localStorage in the global context
        // The Browser also has localStorage in the global context.
        return localStorage;
    } catch (error) {
    // Swallow
    // XXX (@Qix-) should we be logging these?
    }
}
module.exports = __turbopack_context__.r("[project]/aptiverse/aptiverse-ui/node_modules/debug/src/common.js [app-rsc] (ecmascript)")(exports);
const { formatters } = module.exports;
/**
 * Map %j to `JSON.stringify()`, since no Web Inspectors do that by default.
 */ formatters.j = function(v) {
    try {
        return JSON.stringify(v);
    } catch (error) {
        return '[UnexpectedJSONParseError]: ' + error.message;
    }
};
}),
"[project]/aptiverse/aptiverse-ui/node_modules/debug/src/index.js [app-rsc] (ecmascript)", ((__turbopack_context__, module, exports) => {

/**
 * Detect Electron renderer / nwjs process, which is node, but we should
 * treat as a browser.
 */ if (typeof process === 'undefined' || process.type === 'renderer' || ("TURBOPACK compile-time value", false) === true || process.__nwjs) {
    module.exports = __turbopack_context__.r("[project]/aptiverse/aptiverse-ui/node_modules/debug/src/browser.js [app-rsc] (ecmascript)");
} else {
    module.exports = __turbopack_context__.r("[project]/aptiverse/aptiverse-ui/node_modules/debug/src/node.js [app-rsc] (ecmascript)");
}
}),
"[project]/aptiverse/aptiverse-ui/node_modules/has-flag/index.js [app-rsc] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

module.exports = (flag, argv = process.argv)=>{
    const prefix = flag.startsWith('-') ? '' : flag.length === 1 ? '-' : '--';
    const position = argv.indexOf(prefix + flag);
    const terminatorPosition = argv.indexOf('--');
    return position !== -1 && (terminatorPosition === -1 || position < terminatorPosition);
};
}),
"[project]/aptiverse/aptiverse-ui/node_modules/supports-color/index.js [app-rsc] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

const os = __turbopack_context__.r("[externals]/os [external] (os, cjs)");
const tty = __turbopack_context__.r("[externals]/tty [external] (tty, cjs)");
const hasFlag = __turbopack_context__.r("[project]/aptiverse/aptiverse-ui/node_modules/has-flag/index.js [app-rsc] (ecmascript)");
const { env } = process;
let forceColor;
if (hasFlag('no-color') || hasFlag('no-colors') || hasFlag('color=false') || hasFlag('color=never')) {
    forceColor = 0;
} else if (hasFlag('color') || hasFlag('colors') || hasFlag('color=true') || hasFlag('color=always')) {
    forceColor = 1;
}
if ('FORCE_COLOR' in env) {
    if (env.FORCE_COLOR === 'true') {
        forceColor = 1;
    } else if (env.FORCE_COLOR === 'false') {
        forceColor = 0;
    } else {
        forceColor = env.FORCE_COLOR.length === 0 ? 1 : Math.min(parseInt(env.FORCE_COLOR, 10), 3);
    }
}
function translateLevel(level) {
    if (level === 0) {
        return false;
    }
    return {
        level,
        hasBasic: true,
        has256: level >= 2,
        has16m: level >= 3
    };
}
function supportsColor(haveStream, streamIsTTY) {
    if (forceColor === 0) {
        return 0;
    }
    if (hasFlag('color=16m') || hasFlag('color=full') || hasFlag('color=truecolor')) {
        return 3;
    }
    if (hasFlag('color=256')) {
        return 2;
    }
    if (haveStream && !streamIsTTY && forceColor === undefined) {
        return 0;
    }
    const min = forceColor || 0;
    if (env.TERM === 'dumb') {
        return min;
    }
    if ("TURBOPACK compile-time truthy", 1) {
        // Windows 10 build 10586 is the first Windows release that supports 256 colors.
        // Windows 10 build 14931 is the first release that supports 16m/TrueColor.
        const osRelease = os.release().split('.');
        if (Number(osRelease[0]) >= 10 && Number(osRelease[2]) >= 10586) {
            return Number(osRelease[2]) >= 14931 ? 3 : 2;
        }
        return 1;
    }
    //TURBOPACK unreachable
    ;
}
function getSupportLevel(stream) {
    const level = supportsColor(stream, stream && stream.isTTY);
    return translateLevel(level);
}
module.exports = {
    supportsColor: getSupportLevel,
    stdout: translateLevel(supportsColor(true, tty.isatty(1))),
    stderr: translateLevel(supportsColor(true, tty.isatty(2)))
};
}),
"[project]/aptiverse/aptiverse-ui/node_modules/follow-redirects/debug.js [app-rsc] (ecmascript)", ((__turbopack_context__, module, exports) => {

var debug;
module.exports = function() {
    if (!debug) {
        try {
            /* eslint global-require: off */ debug = __turbopack_context__.r("[project]/aptiverse/aptiverse-ui/node_modules/debug/src/index.js [app-rsc] (ecmascript)")("follow-redirects");
        } catch (error) {}
        if (typeof debug !== "function") {
            debug = function() {};
        }
    }
    debug.apply(null, arguments);
};
}),
"[project]/aptiverse/aptiverse-ui/node_modules/follow-redirects/index.js [app-rsc] (ecmascript)", ((__turbopack_context__, module, exports) => {

var url = __turbopack_context__.r("[externals]/url [external] (url, cjs)");
var URL = url.URL;
var http = __turbopack_context__.r("[externals]/http [external] (http, cjs)");
var https = __turbopack_context__.r("[externals]/https [external] (https, cjs)");
var Writable = __turbopack_context__.r("[externals]/stream [external] (stream, cjs)").Writable;
var assert = __turbopack_context__.r("[externals]/assert [external] (assert, cjs)");
var debug = __turbopack_context__.r("[project]/aptiverse/aptiverse-ui/node_modules/follow-redirects/debug.js [app-rsc] (ecmascript)");
// Preventive platform detection
// istanbul ignore next
(function detectUnsupportedEnvironment() {
    var looksLikeNode = typeof process !== "undefined";
    var looksLikeBrowser = "undefined" !== "undefined" && typeof document !== "undefined";
    var looksLikeV8 = isFunction(Error.captureStackTrace);
    if (!looksLikeNode && (looksLikeBrowser || !looksLikeV8)) {
        console.warn("The follow-redirects package should be excluded from browser builds.");
    }
})();
// Whether to use the native URL object or the legacy url module
var useNativeURL = false;
try {
    assert(new URL(""));
} catch (error) {
    useNativeURL = error.code === "ERR_INVALID_URL";
}
// URL fields to preserve in copy operations
var preservedUrlFields = [
    "auth",
    "host",
    "hostname",
    "href",
    "path",
    "pathname",
    "port",
    "protocol",
    "query",
    "search",
    "hash"
];
// Create handlers that pass events from native requests
var events = [
    "abort",
    "aborted",
    "connect",
    "error",
    "socket",
    "timeout"
];
var eventHandlers = Object.create(null);
events.forEach(function(event) {
    eventHandlers[event] = function(arg1, arg2, arg3) {
        this._redirectable.emit(event, arg1, arg2, arg3);
    };
});
// Error types with codes
var InvalidUrlError = createErrorType("ERR_INVALID_URL", "Invalid URL", TypeError);
var RedirectionError = createErrorType("ERR_FR_REDIRECTION_FAILURE", "Redirected request failed");
var TooManyRedirectsError = createErrorType("ERR_FR_TOO_MANY_REDIRECTS", "Maximum number of redirects exceeded", RedirectionError);
var MaxBodyLengthExceededError = createErrorType("ERR_FR_MAX_BODY_LENGTH_EXCEEDED", "Request body larger than maxBodyLength limit");
var WriteAfterEndError = createErrorType("ERR_STREAM_WRITE_AFTER_END", "write after end");
// istanbul ignore next
var destroy = Writable.prototype.destroy || noop;
// An HTTP(S) request that can be redirected
function RedirectableRequest(options, responseCallback) {
    // Initialize the request
    Writable.call(this);
    this._sanitizeOptions(options);
    this._options = options;
    this._ended = false;
    this._ending = false;
    this._redirectCount = 0;
    this._redirects = [];
    this._requestBodyLength = 0;
    this._requestBodyBuffers = [];
    // Attach a callback if passed
    if (responseCallback) {
        this.on("response", responseCallback);
    }
    // React to responses of native requests
    var self = this;
    this._onNativeResponse = function(response) {
        try {
            self._processResponse(response);
        } catch (cause) {
            self.emit("error", cause instanceof RedirectionError ? cause : new RedirectionError({
                cause: cause
            }));
        }
    };
    // Perform the first request
    this._performRequest();
}
RedirectableRequest.prototype = Object.create(Writable.prototype);
RedirectableRequest.prototype.abort = function() {
    destroyRequest(this._currentRequest);
    this._currentRequest.abort();
    this.emit("abort");
};
RedirectableRequest.prototype.destroy = function(error) {
    destroyRequest(this._currentRequest, error);
    destroy.call(this, error);
    return this;
};
// Writes buffered data to the current native request
RedirectableRequest.prototype.write = function(data, encoding, callback) {
    // Writing is not allowed if end has been called
    if (this._ending) {
        throw new WriteAfterEndError();
    }
    // Validate input and shift parameters if necessary
    if (!isString(data) && !isBuffer(data)) {
        throw new TypeError("data should be a string, Buffer or Uint8Array");
    }
    if (isFunction(encoding)) {
        callback = encoding;
        encoding = null;
    }
    // Ignore empty buffers, since writing them doesn't invoke the callback
    // https://github.com/nodejs/node/issues/22066
    if (data.length === 0) {
        if (callback) {
            callback();
        }
        return;
    }
    // Only write when we don't exceed the maximum body length
    if (this._requestBodyLength + data.length <= this._options.maxBodyLength) {
        this._requestBodyLength += data.length;
        this._requestBodyBuffers.push({
            data: data,
            encoding: encoding
        });
        this._currentRequest.write(data, encoding, callback);
    } else {
        this.emit("error", new MaxBodyLengthExceededError());
        this.abort();
    }
};
// Ends the current native request
RedirectableRequest.prototype.end = function(data, encoding, callback) {
    // Shift parameters if necessary
    if (isFunction(data)) {
        callback = data;
        data = encoding = null;
    } else if (isFunction(encoding)) {
        callback = encoding;
        encoding = null;
    }
    // Write data if needed and end
    if (!data) {
        this._ended = this._ending = true;
        this._currentRequest.end(null, null, callback);
    } else {
        var self = this;
        var currentRequest = this._currentRequest;
        this.write(data, encoding, function() {
            self._ended = true;
            currentRequest.end(null, null, callback);
        });
        this._ending = true;
    }
};
// Sets a header value on the current native request
RedirectableRequest.prototype.setHeader = function(name, value) {
    this._options.headers[name] = value;
    this._currentRequest.setHeader(name, value);
};
// Clears a header value on the current native request
RedirectableRequest.prototype.removeHeader = function(name) {
    delete this._options.headers[name];
    this._currentRequest.removeHeader(name);
};
// Global timeout for all underlying requests
RedirectableRequest.prototype.setTimeout = function(msecs, callback) {
    var self = this;
    // Destroys the socket on timeout
    function destroyOnTimeout(socket) {
        socket.setTimeout(msecs);
        socket.removeListener("timeout", socket.destroy);
        socket.addListener("timeout", socket.destroy);
    }
    // Sets up a timer to trigger a timeout event
    function startTimer(socket) {
        if (self._timeout) {
            clearTimeout(self._timeout);
        }
        self._timeout = setTimeout(function() {
            self.emit("timeout");
            clearTimer();
        }, msecs);
        destroyOnTimeout(socket);
    }
    // Stops a timeout from triggering
    function clearTimer() {
        // Clear the timeout
        if (self._timeout) {
            clearTimeout(self._timeout);
            self._timeout = null;
        }
        // Clean up all attached listeners
        self.removeListener("abort", clearTimer);
        self.removeListener("error", clearTimer);
        self.removeListener("response", clearTimer);
        self.removeListener("close", clearTimer);
        if (callback) {
            self.removeListener("timeout", callback);
        }
        if (!self.socket) {
            self._currentRequest.removeListener("socket", startTimer);
        }
    }
    // Attach callback if passed
    if (callback) {
        this.on("timeout", callback);
    }
    // Start the timer if or when the socket is opened
    if (this.socket) {
        startTimer(this.socket);
    } else {
        this._currentRequest.once("socket", startTimer);
    }
    // Clean up on events
    this.on("socket", destroyOnTimeout);
    this.on("abort", clearTimer);
    this.on("error", clearTimer);
    this.on("response", clearTimer);
    this.on("close", clearTimer);
    return this;
};
// Proxy all other public ClientRequest methods
[
    "flushHeaders",
    "getHeader",
    "setNoDelay",
    "setSocketKeepAlive"
].forEach(function(method) {
    RedirectableRequest.prototype[method] = function(a, b) {
        return this._currentRequest[method](a, b);
    };
});
// Proxy all public ClientRequest properties
[
    "aborted",
    "connection",
    "socket"
].forEach(function(property) {
    Object.defineProperty(RedirectableRequest.prototype, property, {
        get: function() {
            return this._currentRequest[property];
        }
    });
});
RedirectableRequest.prototype._sanitizeOptions = function(options) {
    // Ensure headers are always present
    if (!options.headers) {
        options.headers = {};
    }
    // Since http.request treats host as an alias of hostname,
    // but the url module interprets host as hostname plus port,
    // eliminate the host property to avoid confusion.
    if (options.host) {
        // Use hostname if set, because it has precedence
        if (!options.hostname) {
            options.hostname = options.host;
        }
        delete options.host;
    }
    // Complete the URL object when necessary
    if (!options.pathname && options.path) {
        var searchPos = options.path.indexOf("?");
        if (searchPos < 0) {
            options.pathname = options.path;
        } else {
            options.pathname = options.path.substring(0, searchPos);
            options.search = options.path.substring(searchPos);
        }
    }
};
// Executes the next native request (initial or redirect)
RedirectableRequest.prototype._performRequest = function() {
    // Load the native protocol
    var protocol = this._options.protocol;
    var nativeProtocol = this._options.nativeProtocols[protocol];
    if (!nativeProtocol) {
        throw new TypeError("Unsupported protocol " + protocol);
    }
    // If specified, use the agent corresponding to the protocol
    // (HTTP and HTTPS use different types of agents)
    if (this._options.agents) {
        var scheme = protocol.slice(0, -1);
        this._options.agent = this._options.agents[scheme];
    }
    // Create the native request and set up its event handlers
    var request = this._currentRequest = nativeProtocol.request(this._options, this._onNativeResponse);
    request._redirectable = this;
    for (var event of events){
        request.on(event, eventHandlers[event]);
    }
    // RFC7230§5.3.1: When making a request directly to an origin server, […]
    // a client MUST send only the absolute path […] as the request-target.
    this._currentUrl = /^\//.test(this._options.path) ? url.format(this._options) : // When making a request to a proxy, […]
    // a client MUST send the target URI in absolute-form […].
    this._options.path;
    // End a redirected request
    // (The first request must be ended explicitly with RedirectableRequest#end)
    if (this._isRedirect) {
        // Write the request entity and end
        var i = 0;
        var self = this;
        var buffers = this._requestBodyBuffers;
        (function writeNext(error) {
            // Only write if this request has not been redirected yet
            // istanbul ignore else
            if (request === self._currentRequest) {
                // Report any write errors
                // istanbul ignore if
                if (error) {
                    self.emit("error", error);
                } else if (i < buffers.length) {
                    var buffer = buffers[i++];
                    // istanbul ignore else
                    if (!request.finished) {
                        request.write(buffer.data, buffer.encoding, writeNext);
                    }
                } else if (self._ended) {
                    request.end();
                }
            }
        })();
    }
};
// Processes a response from the current native request
RedirectableRequest.prototype._processResponse = function(response) {
    // Store the redirected response
    var statusCode = response.statusCode;
    if (this._options.trackRedirects) {
        this._redirects.push({
            url: this._currentUrl,
            headers: response.headers,
            statusCode: statusCode
        });
    }
    // RFC7231§6.4: The 3xx (Redirection) class of status code indicates
    // that further action needs to be taken by the user agent in order to
    // fulfill the request. If a Location header field is provided,
    // the user agent MAY automatically redirect its request to the URI
    // referenced by the Location field value,
    // even if the specific status code is not understood.
    // If the response is not a redirect; return it as-is
    var location = response.headers.location;
    if (!location || this._options.followRedirects === false || statusCode < 300 || statusCode >= 400) {
        response.responseUrl = this._currentUrl;
        response.redirects = this._redirects;
        this.emit("response", response);
        // Clean up
        this._requestBodyBuffers = [];
        return;
    }
    // The response is a redirect, so abort the current request
    destroyRequest(this._currentRequest);
    // Discard the remainder of the response to avoid waiting for data
    response.destroy();
    // RFC7231§6.4: A client SHOULD detect and intervene
    // in cyclical redirections (i.e., "infinite" redirection loops).
    if (++this._redirectCount > this._options.maxRedirects) {
        throw new TooManyRedirectsError();
    }
    // Store the request headers if applicable
    var requestHeaders;
    var beforeRedirect = this._options.beforeRedirect;
    if (beforeRedirect) {
        requestHeaders = Object.assign({
            // The Host header was set by nativeProtocol.request
            Host: response.req.getHeader("host")
        }, this._options.headers);
    }
    // RFC7231§6.4: Automatic redirection needs to done with
    // care for methods not known to be safe, […]
    // RFC7231§6.4.2–3: For historical reasons, a user agent MAY change
    // the request method from POST to GET for the subsequent request.
    var method = this._options.method;
    if ((statusCode === 301 || statusCode === 302) && this._options.method === "POST" || // RFC7231§6.4.4: The 303 (See Other) status code indicates that
    // the server is redirecting the user agent to a different resource […]
    // A user agent can perform a retrieval request targeting that URI
    // (a GET or HEAD request if using HTTP) […]
    statusCode === 303 && !/^(?:GET|HEAD)$/.test(this._options.method)) {
        this._options.method = "GET";
        // Drop a possible entity and headers related to it
        this._requestBodyBuffers = [];
        removeMatchingHeaders(/^content-/i, this._options.headers);
    }
    // Drop the Host header, as the redirect might lead to a different host
    var currentHostHeader = removeMatchingHeaders(/^host$/i, this._options.headers);
    // If the redirect is relative, carry over the host of the last request
    var currentUrlParts = parseUrl(this._currentUrl);
    var currentHost = currentHostHeader || currentUrlParts.host;
    var currentUrl = /^\w+:/.test(location) ? this._currentUrl : url.format(Object.assign(currentUrlParts, {
        host: currentHost
    }));
    // Create the redirected request
    var redirectUrl = resolveUrl(location, currentUrl);
    debug("redirecting to", redirectUrl.href);
    this._isRedirect = true;
    spreadUrlObject(redirectUrl, this._options);
    // Drop confidential headers when redirecting to a less secure protocol
    // or to a different domain that is not a superdomain
    if (redirectUrl.protocol !== currentUrlParts.protocol && redirectUrl.protocol !== "https:" || redirectUrl.host !== currentHost && !isSubdomain(redirectUrl.host, currentHost)) {
        removeMatchingHeaders(/^(?:(?:proxy-)?authorization|cookie)$/i, this._options.headers);
    }
    // Evaluate the beforeRedirect callback
    if (isFunction(beforeRedirect)) {
        var responseDetails = {
            headers: response.headers,
            statusCode: statusCode
        };
        var requestDetails = {
            url: currentUrl,
            method: method,
            headers: requestHeaders
        };
        beforeRedirect(this._options, responseDetails, requestDetails);
        this._sanitizeOptions(this._options);
    }
    // Perform the redirected request
    this._performRequest();
};
// Wraps the key/value object of protocols with redirect functionality
function wrap(protocols) {
    // Default settings
    var exports = {
        maxRedirects: 21,
        maxBodyLength: 10 * 1024 * 1024
    };
    // Wrap each protocol
    var nativeProtocols = {};
    Object.keys(protocols).forEach(function(scheme) {
        var protocol = scheme + ":";
        var nativeProtocol = nativeProtocols[protocol] = protocols[scheme];
        var wrappedProtocol = exports[scheme] = Object.create(nativeProtocol);
        // Executes a request, following redirects
        function request(input, options, callback) {
            // Parse parameters, ensuring that input is an object
            if (isURL(input)) {
                input = spreadUrlObject(input);
            } else if (isString(input)) {
                input = spreadUrlObject(parseUrl(input));
            } else {
                callback = options;
                options = validateUrl(input);
                input = {
                    protocol: protocol
                };
            }
            if (isFunction(options)) {
                callback = options;
                options = null;
            }
            // Set defaults
            options = Object.assign({
                maxRedirects: exports.maxRedirects,
                maxBodyLength: exports.maxBodyLength
            }, input, options);
            options.nativeProtocols = nativeProtocols;
            if (!isString(options.host) && !isString(options.hostname)) {
                options.hostname = "::1";
            }
            assert.equal(options.protocol, protocol, "protocol mismatch");
            debug("options", options);
            return new RedirectableRequest(options, callback);
        }
        // Executes a GET request, following redirects
        function get(input, options, callback) {
            var wrappedRequest = wrappedProtocol.request(input, options, callback);
            wrappedRequest.end();
            return wrappedRequest;
        }
        // Expose the properties on the wrapped protocol
        Object.defineProperties(wrappedProtocol, {
            request: {
                value: request,
                configurable: true,
                enumerable: true,
                writable: true
            },
            get: {
                value: get,
                configurable: true,
                enumerable: true,
                writable: true
            }
        });
    });
    return exports;
}
function noop() {}
function parseUrl(input) {
    var parsed;
    // istanbul ignore else
    if (useNativeURL) {
        parsed = new URL(input);
    } else {
        // Ensure the URL is valid and absolute
        parsed = validateUrl(url.parse(input));
        if (!isString(parsed.protocol)) {
            throw new InvalidUrlError({
                input
            });
        }
    }
    return parsed;
}
function resolveUrl(relative, base) {
    // istanbul ignore next
    return useNativeURL ? new URL(relative, base) : parseUrl(url.resolve(base, relative));
}
function validateUrl(input) {
    if (/^\[/.test(input.hostname) && !/^\[[:0-9a-f]+\]$/i.test(input.hostname)) {
        throw new InvalidUrlError({
            input: input.href || input
        });
    }
    if (/^\[/.test(input.host) && !/^\[[:0-9a-f]+\](:\d+)?$/i.test(input.host)) {
        throw new InvalidUrlError({
            input: input.href || input
        });
    }
    return input;
}
function spreadUrlObject(urlObject, target) {
    var spread = target || {};
    for (var key of preservedUrlFields){
        spread[key] = urlObject[key];
    }
    // Fix IPv6 hostname
    if (spread.hostname.startsWith("[")) {
        spread.hostname = spread.hostname.slice(1, -1);
    }
    // Ensure port is a number
    if (spread.port !== "") {
        spread.port = Number(spread.port);
    }
    // Concatenate path
    spread.path = spread.search ? spread.pathname + spread.search : spread.pathname;
    return spread;
}
function removeMatchingHeaders(regex, headers) {
    var lastValue;
    for(var header in headers){
        if (regex.test(header)) {
            lastValue = headers[header];
            delete headers[header];
        }
    }
    return lastValue === null || typeof lastValue === "undefined" ? undefined : String(lastValue).trim();
}
function createErrorType(code, message, baseClass) {
    // Create constructor
    function CustomError(properties) {
        // istanbul ignore else
        if (isFunction(Error.captureStackTrace)) {
            Error.captureStackTrace(this, this.constructor);
        }
        Object.assign(this, properties || {});
        this.code = code;
        this.message = this.cause ? message + ": " + this.cause.message : message;
    }
    // Attach constructor and set default properties
    CustomError.prototype = new (baseClass || Error)();
    Object.defineProperties(CustomError.prototype, {
        constructor: {
            value: CustomError,
            enumerable: false
        },
        name: {
            value: "Error [" + code + "]",
            enumerable: false
        }
    });
    return CustomError;
}
function destroyRequest(request, error) {
    for (var event of events){
        request.removeListener(event, eventHandlers[event]);
    }
    request.on("error", noop);
    request.destroy(error);
}
function isSubdomain(subdomain, domain) {
    assert(isString(subdomain) && isString(domain));
    var dot = subdomain.length - domain.length - 1;
    return dot > 0 && subdomain[dot] === "." && subdomain.endsWith(domain);
}
function isString(value) {
    return typeof value === "string" || value instanceof String;
}
function isFunction(value) {
    return typeof value === "function";
}
function isBuffer(value) {
    return typeof value === "object" && "length" in value;
}
function isURL(value) {
    return URL && value instanceof URL;
}
// Exports
module.exports = wrap({
    http: http,
    https: https
});
module.exports.wrap = wrap;
}),
];

//# sourceMappingURL=fc185_001ea910._.js.map