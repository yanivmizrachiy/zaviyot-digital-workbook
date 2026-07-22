import next from "eslint-config-next";

// ESLint flat config לאתר הזוויות. `next lint` הוסר ב-Next 16, ולכן משתמשים
// ב-eslint ישירות עם ה-flat config הרשמי של Next (core-web-vitals + typescript).
const eslintConfig = [
  { ignores: [".next/**", "node_modules/**", "next-env.d.ts"] },
  ...next,
];

export default eslintConfig;
