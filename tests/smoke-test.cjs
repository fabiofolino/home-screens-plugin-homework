const fs = require('fs');
const vm = require('vm');
const code = fs.readFileSync('dist/bundle.js', 'utf8');
const React = {
  Fragment: Symbol('Fragment'),
  createElement: (type, props, ...children) => ({ type, props: props || {}, children }),
  useState: (initial) => [typeof initial === 'function' ? initial() : initial, () => {}],
  useEffect: () => {},
  useMemo: (fn) => fn(),
};
const context = {
  window: {
    React,
    __HS_SDK__: { displayCache: { get: () => null, set: () => {} } },
    setInterval: () => 1,
    clearInterval: () => {},
  },
  React,
  console,
  fetch: async () => { throw new Error('not called in smoke test'); },
  Intl,
  Date,
  Map,
  Number,
  Math,
  String,
  Array,
  Object,
  RegExp,
  Error,
};
vm.createContext(context);
vm.runInContext(code, context);
if (!context.window.__HS_PLUGIN__ || typeof context.window.__HS_PLUGIN__.default !== 'function') {
  throw new Error('Plugin default export missing');
}
const element = context.window.__HS_PLUGIN__.default({
  config: { feedUrl: 'http://192.168.0.42:8787/homework-5th.json', layout: 'columns' },
  style: {
    fontSize: 18, fontFamily: 'inter', textColor: '#fff', backgroundColor: '#000000',
    borderRadius: 16, padding: 18, opacity: 1, backdropBlur: 0,
  },
  timezone: 'America/Detroit',
});
if (!element || element.type !== 'div') throw new Error('Plugin did not render a root div');
console.log('FAB Homework smoke test: PASS');
