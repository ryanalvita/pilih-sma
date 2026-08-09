module.exports = {
  root: true,
  env: {
    browser: true,
    es2022: true,
    node: true,
  },
  extends: ["eslint:recommended", "plugin:astro/recommended"],
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
  },
  ignorePatterns: ["dist", ".astro", "node_modules"],
  overrides: [
    {
      // .astro files: parse the frontmatter/script as TS via astro-eslint-parser.
      files: ["*.astro"],
      parser: "astro-eslint-parser",
      parserOptions: {
        parser: "@typescript-eslint/parser",
        extraFileExtensions: [".astro"],
        sourceType: "module",
      },
      rules: {
        // Client-side <script> blocks in .astro files reference DOM globals/ids
        // that ESLint can't see are defined; astro/recommended already covers
        // component-specific correctness, so don't fight it with no-undef here.
        "no-undef": "off",
      },
    },
    {
      files: ["*.ts", "*.tsx"],
      parser: "@typescript-eslint/parser",
      plugins: ["@typescript-eslint"],
      extends: ["plugin:@typescript-eslint/recommended"],
    },
    {
      files: ["*.tsx", "*.jsx"],
      plugins: ["react", "react-hooks"],
      extends: ["plugin:react/recommended", "plugin:react-hooks/recommended"],
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
      settings: {
        react: { version: "detect" },
      },
      rules: {
        // React 19 + the automatic JSX runtime (via @astrojs/react) don't need
        // React in scope.
        "react/react-in-jsx-scope": "off",
      },
    },
  ],
};
