import flattern from 'lodash/flatten';
import Base from './Base';

const defaultOptions = {
  stroke: '#4b5f71',
  fill: 'none',
  'stroke-width': 2,
  cursor: 'pointer',
};

export default class BezierCurveLine extends Base {
  draw(...points) {
    points = flattern(points);
    let pathData;
    if (this.isPlainCoordinate(points)) {
      const from = points[0];
      const to = points[1];
      pathData = this.getPathData(from.x, from.y, to.x, to.y);
    } else {
      const coordFrom = this.getElementCoordinate(points[0]);
      const coordTo = this.getElementCoordinate(points[1]);
      pathData = this.getPathData(coordFrom.x, coordFrom.y, coordTo.x, coordTo.y);
    }
    const line = this.canvas.path(pathData).attr({ ...defaultOptions, ...this.options.lineAttr });

    this.setMarker(line);

    return line;
  }

  isPlainCoordinate(elem) {
    if (Array.isArray(elem)) {
      [elem] = [...elem];
    }
    return elem && typeof elem === 'object' && Object.keys(elem).join(',') === 'x,y';
  }

  getPathData(x1, y1, x2, y2, tension) {
    tension = tension || this.options.tension || 0.5;
    const delta = (x2 - x1) * tension;
    const hx1 = x1 + delta;
    const hy1 = y1;
    const hx2 = x2 - delta;
    const hy2 = y2;
    return `M ${x1} ${y1} C ${hx1} ${hy1} ${hx2} ${hy2} ${x2} ${y2}`;
  }

  refresh(connection, elementFrom, elementTo) {
    let coordFrom;
    let coordTo;
    if (this.isPlainCoordinate(elementFrom) && elementTo === undefined) {
      [coordFrom, coordTo] = [...elementFrom];
    } else {
      coordFrom = this.getElementCoordinate(elementFrom);
      coordTo = this.getElementCoordinate(elementTo);
    }
    const d = this.getPathData(coordFrom.x, coordFrom.y, coordTo.x, coordTo.y);

    connection.plot(d);
  }
}
