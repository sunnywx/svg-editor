import cloneDeep from 'lodash/cloneDeep';
import MathUtil from '../../utils/MathUtil';

class OrthogonalRouter {
  constructor() {
    this.opposites = {
      N: 'S',
      S: 'N',
      E: 'W',
      W: 'E',
    };
  }

  router(source, target, oriVertices = []) {
    const sourceAnchor = this.getAnchor(source);
    const targetAnchor = this.getAnchor(target);

    // Todo, if anchor lies outside of bbox, the bbox expands to include it.
    const vertices = cloneDeep(oriVertices);
    vertices.unshift(sourceAnchor);
    vertices.push(targetAnchor);

    let bearing = null;
    const orthogonalVertices = [];

    for (let i = 0, max = vertices.length - 1; i < max; i++) {
      let route = null;

      const from = vertices[i];
      const to = vertices[i + 1];
      const isOrthogonal = !!this.getBearing(from, to);

      if (i === 0) {
        if (i + 1 === max) { // only two elements, without vertices.
          // if (source.intersect(target.clone().inflate(1))) // TODO Expand one of the elements by 1px to detect has no gap between
          if (!isOrthogonal) {
            route = this.elementToElement(from, to, source, target);
          }
        } else { // source  to vertex
          // TODO source contain to ,vertex inside the source
          if (!isOrthogonal) { // eslint-disable-line
            route = this.elementToVertex(from, to, source);
          }
        }
      } else if (i + 1 === max) { // vertex to target
        if (!isOrthogonal) {
          route = this.vertexToElement(from, to, target, bearing);
        }
      } else if (!isOrthogonal) { // vertex to vertex
        route = this.vertexToVertex(from, to, bearing);
      }

      if (route) {
        Array.prototype.push.apply(orthogonalVertices, route.points);
        bearing = route.direction;
      }

      if (i + 1 < max) {
        orthogonalVertices.push(to);
      }
    }

    return orthogonalVertices;
  }

  getAnchor(element, anchor) {
    // if (anchor) return element.getKeyPointCoord(anchor);
    return element.getKeyPointCoord(anchor, true);
  }

  getBearing(from, to) {
    if (from.x === to.x) return (from.y > to.y) ? 'N' : 'S';
    if (from.y === to.y) return (from.x > to.x) ? 'W' : 'E';
    return null;
  }

  freeJoin(p1, p2, element) {
    let p = { x: p1.x, y: p2.y };
    if (element.containsPoint(p)) {
      p = { x: p2.x, y: p1.y };
    }
    return p;
  }

  getBBoxSize(bbox, bearing) {
    return bbox[(bearing === 'W' || bearing === 'E') ? 'width' : 'height'];
  }

  elementToElement(fromPoint, toPoint, fromElement, toElement) {
    let route = this.elementToVertex(toPoint, fromPoint, toElement);
    const p1 = route.points[0];

    if (fromElement.containsPoint(p1)) {
      route = this.elementToVertex(fromPoint, toPoint, fromElement);
      const p2 = route.points[0];

      if (toElement.containsPoint(p2)) {
        const fromBorder = MathUtil.movePoint(fromPoint, p2, this.getBBoxSize(fromElement, this.getBearing(fromPoint, p2)) / 2);
        const toBorder = MathUtil.movePoint(toPoint, p1, this.getBBoxSize(toElement, this.getBearing(toPoint, p1)) / 2);
        const midPoint = MathUtil.midPoint(fromBorder, toBorder);

        const startRoute = this.elementToVertex(fromPoint, midPoint, fromElement);
        const endRoute = this.vertexToVertex(midPoint, toPoint, startRoute.direction);
        route.points = [startRoute.points[0], endRoute.points[0]];
        route.direction = endRoute.direction;
      }
    }

    return route;
  }

  elementToVertex(formPoint, toPoint, fromElement) {
    const p = this.freeJoin(toPoint, formPoint, fromElement);
    return { points: [p], direction: this.getBearing(p, toPoint) };
  }

  vertexToElement(fromPoint, toPoint, toElement, bearing) {
    const route = {};
    const points = [{ x: fromPoint.x, y: toPoint.y }, { x: toPoint.x, y: fromPoint.y }];
    const freePoints = points.filter(point => !toElement.containsPoint(point));
    const freeBearingPoints = freePoints.filter(point => this.getBearing(point, fromPoint) !== bearing);

    let p = null;
    if (freeBearingPoints.length > 0) {
      p = freeBearingPoints.filter(point => this.getBearing(fromPoint, point) === bearing).pop() || freeBearingPoints[0];

      route.points = [p];
      route.direction = this.getBearing(p, toPoint);
    } else {
      console.log('todo: ....');
    }
    return route;
  }

  vertexToVertex(fromPoint, toPoint, bearing) {
    const p1 = { x: fromPoint.x, y: toPoint.y };
    const p2 = { x: toPoint.x, y: fromPoint.y };
    const d1 = this.getBearing(fromPoint, p1);
    const d2 = this.getBearing(fromPoint, p2);

    const opposite = this.opposites[bearing];
    const p = (d1 === bearing || (d1 !== opposite && (d2 === opposite || d2 !== bearing))) ? p1 : p2;

    return { points: [p], direction: this.getBearing(p, toPoint) };
  }
}

export default OrthogonalRouter;
