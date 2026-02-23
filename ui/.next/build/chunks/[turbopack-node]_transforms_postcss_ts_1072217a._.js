module.exports = [
"[turbopack-node]/transforms/postcss.ts { CONFIG => \"[project]/aptiverse/aptiverse-ui/postcss.config.mjs [postcss] (ecmascript)\" } [postcss] (ecmascript, async loader)", ((__turbopack_context__) => {

__turbopack_context__.v((parentImport) => {
    return Promise.all([
  "build/chunks/fc185_2cbf17b5._.js",
  "build/chunks/[root-of-the-server]__806309a6._.js"
].map((chunk) => __turbopack_context__.l(chunk))).then(() => {
        return parentImport("[turbopack-node]/transforms/postcss.ts { CONFIG => \"[project]/aptiverse/aptiverse-ui/postcss.config.mjs [postcss] (ecmascript)\" } [postcss] (ecmascript)");
    });
});
}),
];