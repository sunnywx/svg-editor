import Line from './connection/lines/StraightLine';
import BezierCurveLine from './connection/lines/BezierCurveLine';

class DragManager {
  constructor(raphy) {
    this.raphy = raphy;
    this.canvas = raphy.drawer;
    this.store = raphy.store;
    this.options = raphy.options;
    if (this.options.lineType === 'bezier') {
      this.line = new BezierCurveLine(this.canvas);
    } else {
      this.line = new Line(this.canvas);
    }
    this.placeholderPoint = {};
    this.tmpConnection = null;
    this.isDragging = false;
    this.currentSource = null;
    this.currentTarget = null;
    this.currentSourcePoint = null;
    this.currentTargetPoint = null;
  }

  /**
   * register an element to be draggable
   * @param element
   */
  register(element) {
    const { group } = element;
    this.addEventListener(group, element);
    const { connectionPoints } = element;
    connectionPoints.forEach(point => {
      this.addEventListener(point, element);
    });
  }

  addEventListener(svgElement, element) {
    svgElement.on('dragstart.raphy', event => {
      this.onDragStart(svgElement, element, event);
    });
    svgElement.on('dragend.raphy', event => {
      this.onDragEnd(svgElement, element, event);
    });
    svgElement.on('dragmove.raphy', () => {
      this.onDragMove(svgElement, element);
    });
    svgElement.on('mouseover.raphy', () => {
      this.onMouseOver(svgElement, element);
    });
    svgElement.on('mouseout.raphy', () => {
      this.onMouseOut(svgElement, element);
    });
    svgElement.on('drop', event => {
      event.stopPropagation();
      this.raphy.addElementByDrop(event, element, true);
    });
  }

  onDragStart(svgElement, element) {
    element.setDraggingStatus(true); // todo delete ?
    this.isDragging = true;
    this.currentSource = element;

    if (svgElement.remember('type') === 'connectionPoint') {
      this.placeholderPoint = svgElement.clone();
      this.placeholderPoint.addClass(`${this.options.elementClassName}__marker-point--dragging`);
      svgElement.style('visibility: hidden');

      this.tmpConnection = this.line.draw(this.placeholderPoint, svgElement);
      this.tmpConnection.back();
    }

    this.canvas.addClass('Raphy--dragging');
    element.group.addClass(`${this.options.elementClassName}--dragging`);
    this.raphy.highlightConnectibleElement(element);
  }

  /**
   * handler for moving
   * @param svgElement
   * @param element
   * @param event
   */
  onDragMove(svgElement, element) {
    if (svgElement.remember('type') === 'connectionPoint') {
      this.line.refresh(this.tmpConnection, this.placeholderPoint, svgElement);
    } else {
      this.raphy.refreshConnection(element);
    }
  }

  onDragEnd(svgElement, element) {
    element.setDraggingStatus(false);
    this.isDragging = false;

    if (svgElement.remember('type') === 'connectionPoint') {
      const x = this.placeholderPoint.x();
      const y = this.placeholderPoint.y();
      svgElement.x(x).y(y);
      svgElement.style('visibility', null);

      this.placeholderPoint.remove();
      this.placeholderPoint = null;
      this.tmpConnection.remove();
      this.tmpConnection = null;

      this.raphy.addConnection(this.currentSource, this.currentTarget);
    }

    this.currentSource = null;
    this.currentTarget = null;
    this.canvas.removeClass('Raphy--dragging');
    element.group.removeClass(`${this.options.elementClassName}--dragging`);
    this.raphy.unHighlightConnectibleElement();
  }

  onMouseOver(svgElement, element) {
    if (!this.isDragging || element.id === this.currentSource.id) return;
    element.group.addClass(`${this.options.elementClassName}--dragover`);
    this.currentTarget = element;
  }

  onMouseOut(svgElement, element) {
    if (this.isDragging && element.id !== this.currentSource.id) {
      element.group.removeClass(`${this.options.elementClassName}--dragover`);
      this.currentTarget = null;
    }
  }
}

export default DragManager;
