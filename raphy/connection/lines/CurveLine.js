class PolyLine {
  constructor(raphy, color) {
    this.raphy = raphy;
    this.drawer = raphy.drawer;
    this.color = color || '#4b5f71';
  }

  draw(points) {
    const defaultOptions = {
      stroke: this.color,
      'stroke-dasharray': '5, 5',
      fill: 'none',
      'stroke-width': 2,
      cursor: 'pointer',
    };

    const path = this.getPath(points);
    const line = this.drawer.path(path).attr(defaultOptions);
    line.marker('end', 100, 30, add => {
      add.text('http:80 => 80').font({
        size: '7',
      });
    });

    return line;
  }

  getPath(points) {
    const startPoint = points[0];
    const endPoint = points[1];
    const pathString = `M${startPoint.x} ${startPoint.y}Q${endPoint.x},${startPoint.y} ${endPoint.x},${endPoint.y}`;
    return pathString;
  }

  refresh(connection, points) {
    const path = this.getPath(points);
    connection.plot(path);
  }
}

export default PolyLine;
