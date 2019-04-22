class PolyLine {
  constructor(raphy, color) {
    this.raphy = raphy;
    this.drawer = raphy.drawer;
    this.color = color || '#4b5f71';
  }

  draw(points) {
    const defaultOptions = {
      stroke: this.color,
      fill: 'none',
      'stroke-width': 2,
      cursor: 'pointer',
    };
    const line = this.drawer.polyline(points).attr(defaultOptions);

    return line;
  }

  // addEventListener() {
  //   this.group.on('click', event => {
  //     // this.applyFocusStatus();
  //     this.raphy.emit('element.click', this, event);
  //   });
  // }

  refresh(connection, points) {
    connection.plot(points);
  }
}

export default PolyLine;
