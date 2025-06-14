import css from "@eslint/css";
import js from "@eslint/js";
import json from "@eslint/json";
import * as tsParser from "@typescript-eslint/parser";
import solid from "eslint-plugin-solid/configs/typescript";
import { defineConfig } from "eslint/config";
import globals from "globals";
import tseslint from "typescript-eslint";


export default defineConfig([
  js.configs.recommended,
  {
    files: ["**/*.{ts,tsx}"],
    ...solid,
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: "tsconfig.json",
      },
    },
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          "argsIgnorePattern": "^_[^_].*$|^_$",
          "varsIgnorePattern": "^_[^_].*$|^_$",
          "caughtErrorsIgnorePattern": "^_[^_].*$|^_$"
        }
      ]
    }
  },
  { files: ["**/*.{js,mjs,cjs,ts,mts,cts}"], plugins: { js }, extends: ["js/recommended"] },
  { files: ["**/*.{js,mjs,cjs,ts,mts,cts}"], languageOptions: { globals: globals.browser } },
  tseslint.configs.recommended,
  { files: ["**/*.json"], plugins: { json }, language: "json/json", extends: ["json/recommended"] },
  { files: ["**/*.css"], plugins: { css }, language: "css/css", extends: ["css/recommended"] },
],);
