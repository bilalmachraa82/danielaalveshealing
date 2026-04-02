import "@testing-library/jest-dom";

// Node.js v25+ exposes a built-in localStorage global backed by --localstorage-file.
// When that flag is missing, its methods are non-functional and shadow jsdom's.
// vitest sets global.jsdom; use it to get the real jsdom window's localStorage.
const jsdomInstance = (globalThis as Record<string, unknown>).jsdom as
  | { window: { localStorage: Storage; sessionStorage: Storage } }
  | undefined;
if (jsdomInstance?.window) {
  Object.defineProperty(globalThis, "localStorage", {
    value: jsdomInstance.window.localStorage,
    writable: true,
    configurable: true,
  });
  Object.defineProperty(globalThis, "sessionStorage", {
    value: jsdomInstance.window.sessionStorage,
    writable: true,
    configurable: true,
  });
}

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
});
