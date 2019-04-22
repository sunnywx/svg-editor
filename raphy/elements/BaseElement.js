import defaultsDeep from 'lodash/defaultsDeep';

const defaultOptions = {
  x: 0,
  y: 0,
  width: 110,
  height: 50,
  r: 4,
  className: 'Raphy-element',
  defaultAttr: {
    fill: 'white',
    stroke: '#8b9cac',
    'stroke-width': 1.5,
    cursor: 'move',
    // 'stroke-dasharray': 4,
  },
};

class BaseElement {
  constructor(options = {}) {
    this.options = defaultsDeep(options, defaultOptions);
    if (this.options.color) {
      this.options.defaultAttr.stroke = this.options.color;
    }
    if (!this.options.anchor) {
      this.options.defaultAttr['stroke-dasharray'] = 4;
    }
    const {
      id,
      x = 0,
      y = 0,
      type,
      width,
      height,
      label,
      metadata,
    } = this.options;

    this.id = id;
    this.type = type;
    this.label = label;
    this.width = width;
    this.height = height;
    this.x = x;
    this.y = y;
    this.metadata = metadata;

    this.group = null;
    this.drawer = null;
    this.store = {};

    this.isDragging = false;
    this.currentConnectible = false;
    this.connections = [];
  }

  draw(raphy) {
    this.raphy = raphy;
    this.store = raphy.store;
    this.drawer = raphy.drawer;
    this.className = this.options.className || this.store.options.elementClassName;

    const shape = this.drawShape();
    this.svgElement = shape; // todo rename svgElement to shape ?
    this.group = this.drawer.nested().addClass(this.className).add(shape).draggable();
    this.group.x(this.x).y(this.y).front();
    this.addBuildInMarker();
    this.addEventListener();
  }

  drawShape() {
    const {
      width,
      height,
      defaultAttr,
      r,
    } = this.options;

    const shape = this.drawer.rect(width, height).radius(r);
    shape.attr({ ...defaultAttr }).addClass('main-el');
    shape.remember('element', this);

    return shape;
  }

  addBuildInMarker() {
  }

  /**
   *
   * @param marker SVG element
   * @param position. 'top' 'right' 'bottom' 'left', topLeft topRight bottomLeft bottomRight.
   * @param dx shift the element in x direction, relative to its current position.
   * @param dy shift the element in y direction
   */
  addMarker(marker, position = 'topLeft', dx = 0, dy = 0) {
    const coord = this.getKeyPointCoord(position);
    const { x, y } = coord;
    marker.x(x).y(y).addClass('marker-el').dmove(dx, dy);
    this.group.add(marker);
  }

  addEventListener() {
    this.group.on('click', event => {
      this.applyFocusStatus();
      this.raphy.emit('element.click', this, event);
    });
  }

  applyFocusStatus() {
    // this.isFocus = true;
    this.store.setFocusElement(this.group.id());
    const focusClassName = `${this.className}--focus`;
    this.group.addClass(focusClassName);
  }

  applyConnectibleStatus() {
    this.currentConnectible = true;
    const connectibleClassName = `${this.className}--connectible`;
    this.group.addClass(connectibleClassName);
  }

  removeConnectibleStatus() {
    this.currentConnectible = false;
    const connectibleClassName = `${this.className}--connectible`;
    const dragoverClassName = `${this.className}--dragover`;
    this.group.removeClass(connectibleClassName).removeClass(dragoverClassName);
  }

  setDraggingStatus(status) {
    this.isDragging = status;
  }

  addConnection(connection) {
    this.connections.push(connection);
  }

  removeConnection(connection) {
    const index = this.connections.indexOf(connection);
    this.connections.splice(index, 1);
  }

  /**
   *
   * @param position
   * @param absolute if is absolute position
   * @returns {{x: *, y: *}}
   */
  getKeyPointCoord(position, absolute = false) {
    const elementBbox = this.svgElement.bbox();
    const {
      x, y, x2, y2, cx, cy,
    } = elementBbox;

    let posX = 0;
    let posY = 0;
    switch (position) {
      case 'top':
        posX = cx;
        posY = y;
        break;
      case 'right':
        posX = x2;
        posY = cy;
        break;
      case 'bottom':
        posX = cx;
        posY = y2;
        break;
      case 'left':
        posX = x;
        posY = cy;
        break;
      case 'topLeft':
        posX = x;
        posY = y;
        break;
      case 'topRight':
        posX = x2;
        posY = y;
        break;
      case 'bottomLeft':
        posX = x;
        posY = y2;
        break;
      case 'bottomRight':
        posX = x2;
        posY = y2;
        break;
      default:
        posX = cx;
        posY = cy;
    }

    if (absolute) {
      const px = this.group.x();
      const py = this.group.y();
      posX += px;
      posY += py;
    }

    return { x: posX, y: posY };
  }

  containsPoint(point) {
    // return this.svgElement.inside(point.x, point.y);
    const { x, y } = this.getKeyPointCoord('topLeft', true);
    return point.x >= x && point.x <= x + this.width && point.y >= y && point.y <= y + this.height;
  }

  setData(key, value) {
    this.metadata[key] = value;
  }

  remove() {
    this.group.remove();
    this.store.removeElement(this);
  }
}

export default BaseElement;
