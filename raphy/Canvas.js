import SVG from 'svg.js';
import 'svg.draggable.js';
import './plugins/svg.panzoom';
import './plugins/svg.foreignobject';
import './plugins/svg.filter';
import defaultsDeep from 'lodash/defaultsDeep';
import pick from 'lodash/pick';

class Canvas {
  constructor(mountHtmlId, raphy) {
    this.mountHtmlId = mountHtmlId;
    this.raphy = raphy;
    this.store = raphy.store;

    this.options = raphy.options;
    this.initCanvas();
  }

  initCanvas() {
    const mountHtmlElement = document.getElementById(this.mountHtmlId);
    if (!mountHtmlElement) {
      throw new Error(`Element with id [${this.mountHtmlId}] not found.`);
    }

    this.wrapperId = this.createWrapperDiv(mountHtmlElement, this.mountHtmlId);
    const { width, height, drawGrid } = this.options;
    const zoomOptions = pick(this.options, ['zoomMin', 'zoomMax', 'enableWheel']);

    this.drawer = SVG(this.wrapperId).size(width, height).panZoom({
      zoomMin: 0.8,
      zoomMax: 3,
      enableWheel: true,
      ...zoomOptions,
    });
    this.setSvgId();

    if (drawGrid) {
      this.drawGrid();
    }

    this.addEventListener();
  }

  createWrapperDiv(parentElement, parentId) {
    const wrapperId = `__wrapper__${parentId}`;
    const wrapperDiv = document.createElement('div');
    wrapperDiv.id = wrapperId;
    wrapperDiv.style.cssText = 'width: 100%; height: 100%; margin: 0, padding: 0, position: relative';
    parentElement.append(wrapperDiv);

    return wrapperId;
  }

  setSvgId() {
    const svg = document.getElementById(this.wrapperId).childNodes[0];
    if (svg) {
      this.svgId = `__svg__${this.mountHtmlId}`;
      svg.id = this.svgId;

      svg.addEventListener('click', this.clearFocus.bind(this), true);
      svg.addEventListener('drop', this.raphy.addElementByDrop.bind(this.raphy));
      svg.addEventListener('dragover', this.handleDragOver.bind(this));
    }
  }

  setOptions(options) {
    this.options = defaultsDeep(options, this.options);
    const { width, height, drawGrid } = this.options;

    this.drawer.size(width, height);
    if (drawGrid) {
      this.drawGrid();
    }
  }

  setGrid(options) {
    this.options.drawGrid = options;
    this.drawGrid();
  }

  setGridSize(size) {
    this.options.gridSize = size;
    this.drawGrid();
  }

  drawGrid() {
    const {
      gridSize, width, height, drawGrid,
    } = this.options;

    let patterStr = '';
    let gridStr = '';
    let svgPattern = '';
    const gridPattern = drawGrid.name ? Canvas.gridPatterns[drawGrid.name] : Canvas.gridPatterns['dot'];

    gridPattern.forEach((pattern, index) => {
      pattern = defaultsDeep(drawGrid.option && drawGrid.option[index], pattern);
      pattern.width = gridSize * (pattern.scaleFactor || 1);
      pattern.height = gridSize * (pattern.scaleFactor || 1);
      const { color, thickness, markup, render } = pattern;

      if (markup === 'rect') {
        svgPattern = this.drawer.pattern(pattern.width, pattern.height, add => {
          add.rect(thickness, thickness).fill(color);
        });
      } else if (markup === 'path') {
        const path = render({ width: pattern.width, height: pattern.height, thickness });
        svgPattern = this.drawer.pattern(pattern.width, pattern.height, add => {
          add.path(path).attr({
            stroke: color,
            'stroke-width': thickness,
          });
        });
      }

      const grid = this.drawer.rect(width, height).fill(svgPattern);
      gridStr += grid.svg();
      grid.remove();
      patterStr += svgPattern.svg();
    });

    const svgStr = `<svg xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' 
version='1.1' width='100%' height='100%'><defs>${patterStr}</defs>${gridStr}</svg>`;
    const base64 = `url(data:image/svg+xml;base64,${btoa(svgStr)})`;
    document.getElementById(this.svgId).style.backgroundImage = base64;
  }

  clearGrid() {
    document.getElementById(this.svgId).style.backgroundImage = 'none';
  }

  addEventListener() {
    this.drawer.on('click', event => {
      this.raphy.emit('canvas.click', event);
    });

    this.drawer.on('dblclick', event => {
      this.raphy.emit('canvas.dblclick', event);
    });

    this.drawer.on('contextmenu', event => {
      if (this.options.preventContextMenu) event.preventDefault();
      this.raphy.emit('canvas.contextmenu', event);
    });
  }

  clearFocus() {
    const { focusElement, focusLine } = this.store;
    const element = SVG.get(focusElement);
    if (element) {
      this.store.setFocusElement(null);
      const focusClassName = `${this.options.elementClassName}--focus`;
      element.removeClass(focusClassName);
    }

    if (focusLine) {
      this.store.connections[focusLine].onBlur();
    }
  }

  handleDragOver(e) {
    e.preventDefault();
  }

  static gridPatterns = {
    dot: [{
      color: '#aaaaaa',
      thickness: 1,
      markup: 'rect',
    }],
    mesh: [{
      color: '#aaaaaa',
      thickness: 1,
      markup: 'path',
      render: option => {
        let d = '';
        const { width, height, thickness } = option;
        if (width - thickness >= 0 && height - thickness >= 0) {
          d = ['M', width, 0, 'H0 M0 0 V0', height].join(' ');
        } else {
          d = 'M 0 0 0 0';
        }
        return d;
      },
    }],
  };
}

export default Canvas;
