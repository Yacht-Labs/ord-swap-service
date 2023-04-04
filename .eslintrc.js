module.exports = {
  parser: "@typescript-eslint/parser",
  extends: [
    "plugin:@typescript-eslint/recommended",
    "plugin:prettier/recommended",
  ],
  plugins: ["@typescript-eslint", "import"],
  env: {
    node: true,
    es2021: true,
  },
  rules: {
    "@typescript-eslint/no-explicit-any": "off",
    "no-restricted-syntax": "off",
    "no-plusplus": "off",
    "consistent-return": "off",
    "prettier/prettier": "error",
    "no-console": "warn",
    "import/prefer-default-export": "off",
    "import/extensions": [
      "error",
      "ignorePackages",
      {
        ts: "never",
      },
    ],
    "import/no-extraneous-dependencies": [
      "error",
      {
        devDependencies: true,
      },
    ],
  },
  overrides: [
    {
      files: ["**/*.test.**"],
      rules: {
        "no-console": "off",
        "@typescript-eslint/no-empty-function": "off",
        "lines-between-class-members": "off",
      },
    },
  ],
  settings: {
    "import/resolver": {
      node: {
        extensions: [".js", ".ts"],
      },
    },
  },
};
