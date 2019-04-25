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
    const { icon, iconType = 'svg', color } = this.options;
    if (!icon) return;
    if (iconType === 'url') {
      const iconSvg = this.drawer.image(icon).addClass('marker-image').size(30, 30);
      this.addMarker(iconSvg, 'topLeft', 6, 10);
    } else {
      const iconBg = this.drawer.rect(30, 30).radius(5).fill(color).addClass('marker-image-bg');
      this.addMarker(iconBg, 'topLeft', 6, 10);
      const iconSvg = this.drawer.group().addClass('marker-image').attr('fill-rule', 'evenodd');
      iconSvg.svg(icon);
      this.addMarker(iconSvg, 'topLeft', 9, 13);
    }
  }

  addAlertIcon() {
    this.iconEl = this.drawer.path('m0,0l0,10.687459l4.499979,0l0,-10.687459l-4.499979,0zm0,14.249946l0,3.562486l4.499979,0l0,-3.562486l-4.499979,0z');
    this.iconEl.size(3, 12).addClass('marker-alert');
    this.addMarker(this.iconEl, 'topRight', -8, 3);
  }

  removeAlertIcon() {
    this.iconEl && this.iconEl.remove();
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
