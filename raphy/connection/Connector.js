import OrthogonalRouter from './routers/OrthogonalRouter';
import PolyLine from './lines/PolyLine';
import CurveLine from './lines/CurveLine';
import BezierLine from './lines/BezierCurveLine';

class Connector {
  constructor(source, target, raphy, type) {
    this.id = `${source.id}@@${target.id}`;
    this.source = source;
    this.target = target;
    this.type = type || raphy.options.lineType || 'primary';
    this.raphy = raphy;
    // this.canvas = canvas;
    this.vertices = [];

    this.router = new OrthogonalRouter();
    this.connection = this.connect();
  }

  connect() {
    let connection = null;
    const points = this.getConnectionPoints();
    if (this.type === 'primary') {
      connection = new PolyLine(this.raphy, this.source.options.color);
    } else if (this.type === 'bezier') {
      connection = new BezierLine(this.raphy.drawer);
    } else {
      connection = new CurveLine(this.raphy, this.source.options.color);
    }
    this.line = connection.draw(points);
    this.line.back();
    return connection;
  }

  getConnectionPoints() {
    const startPoint = this.source.getKeyPointCoord('center', true);
    const endPoint = this.target.getKeyPointCoord('center', true);
    const points = [];

    if (this.type === 'primary') {
      const routerPoints = this.router.router(this.source, this.target, this.vertices);

      points.push([startPoint.x, startPoint.y]);
      routerPoints.forEach(point => {
        points.push([point.x, point.y]);
      });
      points.push([endPoint.x, endPoint.y]);
    } else {
      points.push(startPoint);
      points.push(endPoint);
    }

    return points;
  }

  setVertices(vertices) {
    this.vertices = vertices;
  }

  update() {
    const points = this.getConnectionPoints();
    this.connection.refresh(this.line, points);
  }

  remove() {
    this.line.remove();
    if (this.source) {
      this.source.removeConnection(this.id);
    }
    if (this.target) {
      this.target.removeConnection(this.id);
    }
  }
}

export default Connector;
