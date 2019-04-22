import defaultsDeep from 'lodash/defaultsDeep';
import BaseElement from './BaseElement';

class Rect extends BaseElement {
  constructor(options = {}) {
    const defaultOptions = {
      connectionPointRadius: 4,
      connectionPointAttr: {
        'stroke-width': 1,
        cursor: 'crosshair',
        'fill-opacity': 1,
        stroke: '#8b9cac',
      },
    };
    const mergedOptions = defaultsDeep(options, defaultOptions);
    super(mergedOptions);
    if (this.options.color) {
      this.options.connectionPointAttr.stroke = this.options.color;
    }

    this.connectionPoints = [];
    this.connections = [];
  }

  addBuildInMarker() {
    this.setLabel(this.label);
    this.setIdLabel(this.id);
    this.addIcon();
    // this.addRemoveBtn();
    this.addConnectionPoints();
  }

  setLabel(label) {
    if (label) {
      this.labelEl && this.labelEl.remove();
      this.label = label;
      this.labelEl = this.drawer.text(this.label).font({ size: 12, anchor: 'start', fill: this.options.color }).addClass('marker-text');
      this.addMarker(this.labelEl, 'topLeft', 40, 10);
    }
  }

  setIdLabel(id) {
    if (id) {
      this.idLabel && this.idLabel.remove();
      this.id = id;
      this.idLabel = this.drawer.text(this.id).font({ size: 12, anchor: 'start', fill: this.options.color }).addClass('marker-text');
      this.addMarker(this.idLabel, 'topLeft', 40, 28);
    }
  }

  addIcon() {
    const { icon } = this.options;
    if (icon) {
      const iconSvg = this.drawer.image(icon).addClass('marker-image').size(30, 30);
      this.addMarker(iconSvg, 'topLeft', 6, 10);
    }
  }

  addRemoveBtn() {
    const removeBtn = this.drawer.path('M13.4142136,12 L19.0710678,17.6568542 L17.6568542,19.0710678 L12,13.4142136 L6.34314575,19.0710678 L4.92893219,17.6568542 L10.5857864,12 L4.92893219,6.34314575 L6.34314575,4.92893219 L12,10.5857864 L17.6568542,4.92893219 L19.0710678,6.34314575 L13.4142136,12 Z').addClass('marker-tool');
    removeBtn.size(10, 10).style({ cursor: 'pointer' });
    removeBtn.click(() => this.remove());
    this.addMarker(removeBtn, 'topRight', 6, -5);
  }

  addConnectionPoints() {
    const offset = 0 - this.options.connectionPointRadius;
    const positions = ['top', 'right', 'bottom', 'left'];
    positions.forEach(position => {
      const point = this.drawConnectionPoint();
      point.remember({
        parentElement: this,
        type: 'connectionPoint',
      });
      this.addMarker(point, position, offset, offset);
      this.connectionPoints.push(point);
    });
  }

  drawConnectionPoint() {
    const { connectionPointRadius, connectionPointAttr, defaultAttr } = this.options;
    const point = this.drawer.circle(connectionPointRadius * 2).addClass('marker-point').draggable();
    point.attr(connectionPointAttr).fill(defaultAttr.fill);

    return point;
  }
}

export default Rect;
