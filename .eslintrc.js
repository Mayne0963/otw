module.exports = {
  root: true,
  extends: [
    "next/core-web-vitals",
    "plugin:react/recommended",
    "plugin:@typescript-eslint/recommended",
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: "module",
    ecmaFeatures: {
      jsx: true,
    },
    project: "./tsconfig.json",
    tsconfigRootDir: ".",
  },
  plugins: ["@typescript-eslint", "react", "react-hooks"],
  rules: {
    // Disable TypeScript ESLint rules that are causing issues
    "@typescript-eslint/no-unused-vars": "warn",
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/no-empty-function": "off",
    "@typescript-eslint/no-empty-interface": "off",
    "@typescript-eslint/no-inferrable-types": "off",
    "@typescript-eslint/no-non-null-assertion": "off",
    "@typescript-eslint/no-require-imports": "off",
    "@typescript-eslint/ban-types": "off",
    "@typescript-eslint/explicit-module-boundary-types": "off",
    "@typescript-eslint/ban-ts-comment": "off",
    // React rules
    "react/react-in-jsx-scope": "off",
    "react/prop-types": "off",
    "react/no-unescaped-entities": "off",
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn",
    // General rules
    "no-console": "off",
  },
  ignorePatterns: [
    "node_modules/**",
    ".next/**",
    "out/**",
    "build/**",
    "public/**",
    "src/types/**",
    "**/*.d.ts",
    "*.config.js",
    "*.config.mjs",
    "next.config.js",
    "postcss.config.js",
    "tailwind.config.js",
    "src/lib/firebase.js",
    "src/lib/analytics.ts",
    "src/lib/analytics.tsx",
    "src/components/ui/use-toast.tsx",
  ],
  settings: {
    react: {
      version: "detect",
    },
  },
  overrides: [
    {
      files: ["tailwind.config.js", "postcss.config.js"],
      parserOptions: {
        project: null,
        sourceType: "script",
      },
      rules: {
        "@typescript-eslint/no-var-requires": "off",
      },
    },
    {
      files: ["next.config.mjs"],
      parserOptions: {
        project: null,
        sourceType: "module",
      },
    },
    {
      files: ["*.jsx"],
      parserOptions: {
        project: null,
      },
      rules: {
        "@typescript-eslint/no-var-requires": "off",
      },
    },
  ],
};
