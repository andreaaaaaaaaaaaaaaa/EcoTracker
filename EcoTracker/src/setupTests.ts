import '@testing-library/jest-dom/extend-expect';

// Mock matchmedia con la interfaz completa de MediaQueryList
window.matchMedia = window.matchMedia || function (query: string): MediaQueryList {
  return {
    matches: false,
    media: query,
    onchange: null,
    addListener: function () { },      // deprecated pero necesario para compatibilidad
    removeListener: function () { },   // deprecated
    addEventListener: function () { },
    removeEventListener: function () { },
    dispatchEvent: function () { return true; },
  };
};