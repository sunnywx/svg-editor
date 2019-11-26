export default class Base {
  constructor(canvas, options = {}) {
    this.canvas = canvas;
    this.options = options;
  }

  draw() {

  }

  getElementCoordinate(element) {
    const { cx, cy } = element.bbox();
    const parent = element.parent();
    const px = parent.x();
    const py = parent.y();
    const x = cx + px;
    const y = cy + py;
    return { x, y };
  }

  refresh() {

  }

  setMarker() {

  }
}
