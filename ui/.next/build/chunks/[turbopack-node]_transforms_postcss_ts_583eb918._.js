module.exports = [
"[turbopack-node]/transforms/postcss.ts { CONFIG => \"[project]/aptiverse-ui/postcss.config.mjs [postcss] (ecmascript)\" } [postcss] (ecmascript, async loader)", ((__turbopack_context__) => {

__turbopack_context__.v((parentImport) => {
    return Promise.all([
  "build/chunks/e810b_7fb54bfc._.js",
  "build/chunks/[root-of-the-server]__b2bd42d5._.js"
].map((chunk) => __turbopack_context__.l(chunk))).then(() => {
        return parentImport("[turbopack-node]/transforms/postcss.ts { CONFIG => \"[project]/aptiverse-ui/postcss.config.mjs [postcss] (ecmascript)\" } [postcss] (ecmascript)");
    });
});
}),
];