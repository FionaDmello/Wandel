import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import { defineConfig, globalIgnores } from "eslint/config";

export default defineConfig([
  globalIgnores(["dist", "src/routeTree.gen.ts"]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    plugins: {
      "simple-import-sort": simpleImportSort,
    },
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    rules: {
      "@typescript-eslint/no-explicit-any": "error",
      "simple-import-sort/imports": "error",
      "simple-import-sort/exports": "error",
      "no-restricted-syntax": [
        "error",
        {
          selector:
            "JSXOpeningElement[name.name=/^(input|textarea)$/] JSXAttribute[name.name='className'] Literal[value=/text-\\[(?:[1-9]|1[0-5])px\\]/]",
          message:
            "Font-size below 16px on a form control triggers iOS Safari's auto-zoom-on-focus (issue #5). Use INPUT_TEXT_SIZE from @/constants/inputClasses instead.",
        },
      ],
    },
  },
  {
    files: ["src/routes/**/*.{ts,tsx}"],
    rules: {
      "react-refresh/only-export-components": [
        "warn",
        { allowExportNames: ["Route"] },
      ],
    },
  },
]);
