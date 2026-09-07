const fs = require('fs');
const ts = require('/opt/nvm/versions/node/v22.16.0/lib/node_modules/typescript');

function prepHost(src) {
  return src
    .replace(/^import[^\n]*\n/gm, '')
    .replace(/export\s+function\s+/g, 'function ')
    .replace(/export\s+const\s+/g, 'const ')
    .replace(/export\s+interface[\s\S]*?\n}\n/g, '');
}
function prepIndex(src) {
  return src
    .replace(/^import[^\n]*\n/gm, '')
    .replace(/export\s+default\s+function\s+HomeworkPlugin/g, 'function HomeworkPlugin');
}
function transpile(src) {
  return ts.transpileModule(src, {
    compilerOptions: {
      target: ts.ScriptTarget.ES2020,
      module: ts.ModuleKind.None,
      jsx: ts.JsxEmit.React,
      esModuleInterop: true,
    }
  }).outputText;
}
const host = transpile(prepHost(fs.readFileSync('src/host-style.ts', 'utf8')));
const index = transpile(prepIndex(fs.readFileSync('src/index.tsx', 'utf8')));
const out = `/* FAB Homework for Home Screens v1.0.1 */\n(function (React) {\n'use strict';\n${host}\n${index}\nwindow.__HS_PLUGIN__ = { default: HomeworkPlugin };\n})(window.React);\n`;
fs.writeFileSync('dist/bundle.js', out);
