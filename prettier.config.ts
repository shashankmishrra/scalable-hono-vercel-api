import type { Config } from "prettier";

const config: Config = {
  semi: true,
  singleQuote: false,
  trailingComma: "all",
  printWidth: 120,
  tabWidth: 2,
  useTabs: false,
  endOfLine: "lf",
  arrowParens: "always",
  bracketSpacing: true,
  bracketSameLine: false,
  quoteProps: "as-needed",
  singleAttributePerLine: false,
  proseWrap: "preserve",
};

export default config;
