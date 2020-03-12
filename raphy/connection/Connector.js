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
    this.className = 'Raphy-line';
    this.router = new OrthogonalRouter();
    this.connection = this.connect();
    this.addEventListener();
  }

  addEventListener() {
    this.line.on('click', event => {
      this.onFocus();
      this.raphy.emit('line.click', this, event);
    });
  }

  onFocus() {
    this.raphy.store.setFocusLine(this.id);
    this.line.addClass(`${this.className}--focus`);
  }

  onBlur() {
    this.raphy.store.setFocusLine(null);
    this.line.removeClass(`${this.className}--focus`);
    this.removeBtn && this.removeBtn.remove();
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

  getKeyPos() {
    let start = 'right';
    let end = 'right';
    const horizontalThreshold = this.source.svgElement.width() * 2;
    const { x: srcX, y: srcY } = this.source.svgElement.rbox();
    const { x: dstX, y: dstY } = this.target.svgElement.rbox();
    const checkAxisX = Math.abs(srcX - dstX) >= horizontalThreshold;

    if (checkAxisX) {
      if (srcX > dstX) {
        start = 'left';
        end = 'right';
      } else if (srcX < dstX) {
        start = 'right';
        end = 'left';
      }
    } else {
      if (srcY > dstY) {  // eslint-disable-line
        start = 'top';
        end = 'bottom';
      } else if (srcY < dstY) {
        start = 'bottom';
        end = 'top';
      }
    }

    return {
      start,
      end,
    };
  }

  getConnectionPoints() {
    const { start, end } = this.getKeyPos();
    const startPoint = this.source.getKeyPointCoord(start, true);
    const endPoint = this.target.getKeyPointCoord(end, true);
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

  addRemoveBtn() {
    if (this.removeBtn) {
      this.removeBtn.remove();
    }

    this.removeBtn = this.raphy.drawer.path('M13.4142136,12 L19.0710678,17.6568542 L17.6568542,19.0710678 L12,13.4142136 L6.34314575,19.0710678 L4.92893219,17.6568542 L10.5857864,12 L4.92893219,6.34314575 L6.34314575,4.92893219 L12,10.5857864 L17.6568542,4.92893219 L19.0710678,6.34314575 L13.4142136,12 Z')
      .addClass('marker-tool');
    this.removeBtn.size(10, 10).style({ cursor: 'pointer' });
    this.removeBtn.click(() => this.remove());

    const { x, y, x2, y2 } = this.line.bbox();
    this.removeBtn.x((x + x2) / 2).y((y + y2) / 2)
      .addClass('marker-remove-line')
      .dx(6)
      .dy(-6);
  }

  remove() {
    this.line.remove();
    this.removeBtn && this.removeBtn.remove();
    if (this.source) {
      this.source.removeConnection(this.id);
    }
    if (this.target) {
      this.target.removeConnection(this.id);
    }
    this.raphy.store.removeConnection(this.id);
  }
}

export default Connector;
