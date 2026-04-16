// Default masks. Each surface holds an array of polygons.
// A polygon is an array of [x, y] points in image coordinates (pixels, not %).
// Once you draw masks in edit mode, they're saved to localStorage under
// "hv:masks" and these defaults are ignored.
window.DEFAULT_MASKS = {
  siding: [],
  trim:   [],
  stucco: [],
};
