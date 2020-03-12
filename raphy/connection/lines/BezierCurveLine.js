import flattern from 'lodash/flatten';
import defaultsDeep from 'lodash/defaultsDeep';
import Base from './Base';

const defaultOptions = {
  stroke: '#00aa72',
  fill: 'none',
  'stroke-width': 2,
  cursor: 'pointer',
  threshold: 64,
  tension: 0.5,
};

export default class BezierCurveLine extends Base {
  constructor(canvas, options) {
    super(canvas, options);
    this.options = defaultsDeep(this.options, defaultOptions);
    this.from = { x: 0, y: 0 };
    this.to = { x: 0, y: 0 };
    this.line = null;
    this.arrow = null;
  }

  draw(...points) {
    points = flattern(points);
    let pathData;
    if (this.isPlainCoordinate(points)) {
      [this.from, this.to] = [...points];
      pathData = this.getPathData();
    } else {
      this.from = this.getElementCoordinate(points[0]);
      this.to = this.getElementCoordinate(points[1]);
      pathData = this.getPathData();
    }
    this.line = this.canvas.path(pathData).attr(this.options).addClass(this.options.className || 'Raphy-line');
    this.setMarker();

    return this.line;
  }

  setMarker(line = this.line) {
    const dir = Math.abs(this.from.x - this.to.x) > this.options.threshold ? 'horizon' : 'vertical';
    let points = [];
    if (dir === 'horizon') {
      points = [[0, 0], [3, 3], [0, 6]];
    } else {
      points = [[0, 0], [3, 3], [6, 0]];
    }
    if (!this.arrow) {
      line.marker('end', 6, 6, add => {
        add.polyline(points).fill('none').stroke({ width: 1, color: this.options.stroke });
      });

      this.arrow = line.reference('marker-end');
    } else {
      this.arrow.update(add => {
        add.polyline(points).fill('none').stroke({ width: 1, color: this.options.stroke });
      });
    }
  }

  isPlainCoordinate(elem) {
    if (Array.isArray(elem)) {
      [elem] = [...elem];
    }
    return elem && typeof elem === 'object' && Object.keys(elem).join(',') === 'x,y';
  }

  getPathData(from = this.from, to = this.to, tension = this.options.tension) {
    const { x: x1, y: y1 } = from;
    const { x: x2, y: y2 } = to;
    const delta = (x2 - x1) * tension;
    const hx1 = x1 + delta;
    const hy1 = y1;
    const hx2 = x2 - delta;
    const hy2 = y2;
    return `M ${x1} ${y1} C ${hx1} ${hy1} ${hx2} ${hy2} ${x2} ${y2}`;
  }

  refresh(line, elementFrom, elementTo) {
    if (this.isPlainCoordinate(elementFrom) && elementTo === undefined) {
      [this.from, this.to] = [...elementFrom];
    } else {
      this.from = this.getElementCoordinate(elementFrom);
      this.to = this.getElementCoordinate(elementTo);
    }
    const d = this.getPathData();

    line.plot(d);
    this.setMarker(line);
  }
}
