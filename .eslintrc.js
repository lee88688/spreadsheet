module.exports = {
  env: {
    browser: true
  },
  extends: [
    "plugin:react/recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/eslint-recommended"
  ],
  plugins: [
    "@typescript-eslint"
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaFeatures: {
      jsx: true
    },
    ecmaVersion:  2018,
    sourceType: "module",
  },
  rules: {
    "react/no-unknown-property": ["error", { ignore: ["class"] }],
    "semi": "error",
    "quotes": ["error", "single"],
    "no-spaced-func": "error",
    "comma-style": ["error", "last"]
  },
  settings: {
    react: {
      pragma: "h",
      version: "detect",
    },
  },
  overrides: [
    {
      files: ["*.ts", "*.tsx"],
      rules: {
        "@typescript-eslint/explicit-function-return-type": "off",
      }
    }
  ]
};
