import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": "warn",
      "@next/next/no-img-element": "warn",
    },
  },
  {
    files: ["**/*.js"],
    rules: {
      // Repository utility scripts and Jest setup are intentionally CommonJS.
      "@typescript-eslint/no-require-imports": "off",
    },
  },
  {
    files: ["lib/services/recurringOrderService.ts"],
    rules: {
      // RRULE is intentionally loaded lazily on the optional RRULE path.
      "@typescript-eslint/no-require-imports": "off",
    },
  },
];

export default eslintConfig;
