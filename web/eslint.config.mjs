import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import prettier from "eslint-config-prettier/flat";

import aptiverse from "./eslint/aptiverse-plugin.mjs";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  prettier,
  {
    files: ["**/*.{js,mjs,cjs,ts,tsx,mts}"],
    plugins: { aptiverse },
    rules: {
      "aptiverse/no-hex-colors": "error",
      "aptiverse/no-emoji-or-long-dash": "error",
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: [
                "@mui/*",
                "@mui/icons-material",
                "@mui/icons-material/*",
                "@emotion/*",
              ],
              message:
                "MUI and Emotion are gone. Use Tailwind tokens and shadcn/ui in src/components/ui.",
            },
            {
              group: [
                "react-icons",
                "react-icons/*",
                "@heroicons/*",
                "@tabler/icons-react",
                "@radix-ui/react-icons",
                "@phosphor-icons/*",
                "phosphor-react",
              ],
              message: "Lucide (lucide-react) is the only icon set.",
            },
          ],
        },
      ],
    },
  },
  {
    // The rule definitions themselves have to name the characters they ban.
    files: ["eslint/**"],
    rules: {
      "aptiverse/no-emoji-or-long-dash": "off",
      "aptiverse/no-hex-colors": "off",
    },
  },
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "coverage/**",
    "playwright-report/**",
    "test-results/**",
    "next-env.d.ts",
    // Orval output: regenerate instead of editing (npm run api:gen).
    "src/lib/api/generated/**",
  ]),
]);

export default eslintConfig;
