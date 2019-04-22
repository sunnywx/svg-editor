class StraightLine {
  constructor(canvas, options) {
    this.canvas = canvas;
    this.options = options;
  }

  draw(elementFrom, elementTo) {
    const defaultOptions = {
      stroke: '#4b5f71',
      fill: 'none',
      'stroke-width': 2,
      cursor: 'pointer',
    };
    const coordFrom = this.getTransformedCoord(elementFrom);
    const coordTo = this.getTransformedCoord(elementTo);
    const line = this.canvas.line(coordFrom.x, coordFrom.y, coordTo.x, coordTo.y).attr(defaultOptions);
    line.marker('end', 4, 5, add => {
      add.path('M0,0 L0,6 L7,3 z').center(0.8, 2.5).attr({
        fill: defaultOptions.stroke,
      });
    });

    return line;
  }

  getTransformedCoord(element) {
    const { cx, cy } = element.bbox();
    const parent = element.parent();
    const px = parent.x();
    const py = parent.y();
    const x = cx + px;
    const y = cy + py;
    return { x, y };
  }

  refresh(connection, elementFrom, elementTo) {
    const coordFrom = this.getTransformedCoord(elementFrom);
    const coordTo = this.getTransformedCoord(elementTo);

    connection.plot(coordFrom.x, coordFrom.y, coordTo.x, coordTo.y);
  }
}

export default StraightLine;
