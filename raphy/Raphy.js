import { EventEmitter2 } from 'eventemitter2';
import defaultsDeep from 'lodash/defaultsDeep';
import isFunction from 'lodash/isFunction';
import arrayToTree from 'array-to-tree';
import TreeStore from './layout/tree/TreeStore';
import Canvas from './Canvas';
import Store from './Store';
import DragManager from './DragManager';
import Connector from './connection/Connector';
import './style.scss';

class Raphy extends EventEmitter2 {
  constructor(mountHtmlId, options) {
    super();
    this.options = {
      width: 800,
      height: 600,
      gridSize: 10,
      drawGrid: true,
      background: false,
      preventContextMenu: true,
      elementClassName: 'Raphy-element',
      connectionPointRadius: 4,
    };

    this.options = defaultsDeep(options, this.options);
    this.store = new Store();
    this.store.setOptions(this.options);
    this.canvas = new Canvas(mountHtmlId, this);
    this.drawer = this.canvas.drawer;
    this.viewBox = this.drawer.viewbox();
    this.dragManager = new DragManager(this);
  }

  addElement(element) {
    if (!element) {
      throw new Error('No Element defined.');
    }
    if (!element.id) {
      throw new Error('No Element Id defined.');
    }
    if (this.checkElementId(element.id)) {
      throw new Error(`The element id [${element.id}] already exists`);
    }
    element.draw(this);
    this.dragManager.register(element);
    this.store.addElement(element);
  }

  import(data = []) {
    if (!Array.isArray(data)) {
      throw new Error('wrong data format!');
    }
    const { elementFactory } = this.options;
    data.forEach(item => {
      if (item.id && item.type) {
        const element = elementFactory(item);
        this.addElement(element);
      }
    });

    data.forEach(item => {
      const { parent, subParent } = item;
      if (parent) {
        this.addConnection(this.store.getElement(item.parent), this.store.getElement(item.id));
      }
      if (Array.isArray(subParent) && subParent.length) {
        subParent.forEach(p => {
          this.addConnection(this.store.getElement(p), this.store.getElement(item.id));
        });
      }
    });

    this.autoLayout();
  }

  export(isSimple) {
    return this.store.export(isSimple);
  }

  clear() {
    this.drawer.clear();
    this.store.clear();
  }

  exportImage() {
    return this.drawer.svg();
  }

  downloadSVG(filename) {
    const data = this.drawer.svg();
    const svgBob = new Blob([data], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBob);
    const downloadLink = document.createElement('a');
    downloadLink.href = url;
    const downloadName = filename || 'Raphy';
    downloadLink.download = `${downloadName}.svg`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  }

  zoom(level, point) {
    return this.drawer.zoom(level, point);
  }

  resetPanZoom() {
    const { width, height } = this.viewBox;
    this.drawer.viewbox({
      x: 0, y: 0, zoom: 1, width, height,
    });
  }

  checkElementId(id) {
    return this.store.elements.some(element => (id === element.id));
  }

  checkConnectible(sourceElement, targetElement, twoWay = true) {
    if (!sourceElement || !targetElement) return false;
    const { checkConnectible } = this.options;
    if (isFunction(checkConnectible)) {
      return checkConnectible(sourceElement, targetElement, twoWay);
    }
    return true;
  }

  highlightConnectibleElement(source, twoWay = true) {
    this.store.elements.forEach(element => {
      if (this.checkConnectible(source, element, twoWay)) {
        this.store.addTmpConnectibleElements(element);
        element.applyConnectibleStatus();
      }
    });
  }

  unHighlightConnectibleElement() {
    this.store.tmpConnectibleElements.forEach(element => {
      element.removeConnectibleStatus();
    });
    this.store.clearTmpConnectibleElements();
  }

  addConnection(sourceElement, targetElement) {
    const connectible = this.checkConnectible(sourceElement, targetElement);
    if (!connectible) return;
    const { connectionType, lineType } = connectible;

    let source = sourceElement;
    let target = targetElement;
    if (connectionType === 'c2p') {
      source = targetElement;
      target = sourceElement;
    }

    const connectionKey = `${source.id}@@${target.id}`;
    if (!this.store.connections[connectionKey]) {
      // const { currentSourcePoint, currentTargetPoint } = this; // TODO remember connection position
      const connection = new Connector(source, target, this, lineType);
      this.store.setConnection(connectionKey, connection);

      sourceElement.addConnection(connection.id); // as source element.
      targetElement.addConnection(connection.id);
    }
  }

  refreshConnection(element) {
    if (element) {
      element.connections.forEach(cid => {
        this.store.connections[cid].update();
      });
    } else {
      const { connections } = this.store;
      Object.keys(connections).forEach(key => {
        const connection = connections[key];
        connection.update();
      });
    }
  }

  // todo, 拿到外面
  addElementByDrop(e, target, autoLayout = false) {
    const type = e.dataTransfer.getData('type');
    const { elementFactory } = this.options;
    if (elementFactory) {
      const element = elementFactory({ type });

      if (!autoLayout) {
        const canvasViewbox = this.drawer.viewbox();
        const x = e.offsetX - 55 + canvasViewbox.x;
        const y = e.offsetY - 30 + canvasViewbox.y;
        element.x = x;
        element.y = y;
        this.addElement(element);
      } else {
        this.addElement(element);
      }
      // add connections.
      if (target) {
        this.addConnection(element, target);
      }

      if (autoLayout) {
        this.autoLayout();
      }
    }
  }

  autoLayout(centered = true) {
    const elements = this.store.export(true);
    const treeData = arrayToTree(elements, {
      parentProperty: 'parent',
    });

    const treeStore = new TreeStore();
    treeData.forEach(data => {
      data.parent = '';
      const tree = treeStore.createTree({ nodeStructure: data });
      tree.positionTree();
      const nodes = tree.nodeDB.db;
      let offsetX = 0;
      let offsetY = 0;
      if (centered) {
        offsetX = 50;
        const canvasHeight = document.getElementById(this.canvas.wrapperId).clientHeight;
        const lastNodeY = nodes[nodes.length - 1].Y;
        offsetY = (canvasHeight - lastNodeY) / 2;
      }
      let pseudo = {};
      nodes.forEach(node => {
        const id = node.realId;
        // add pseudo element?
        if (id) {
          const element = this.store.getElement(id);
          element.group.x(node.X + offsetX).y(node.Y + offsetY);

          const connectionId = `${node.realParentId}@@${id}`;
          const connection = this.store.connections[connectionId];
          if (connection) connection.setVertices([]);

          if (node.stackParentId === pseudo.id) {
            connection.setVertices([{ x: pseudo.X + offsetX, y: pseudo.Y + offsetY }]);
          }
        } else {
          pseudo = node;
        }
      });
      // refresh connection
      this.refreshConnection();
    });
  }

  setIsDragging(status) {
    if (status) {
      this.drawer.addClass('Raphy--dragging');
    } else {
      this.drawer.removeClass('Raphy--dragging');
    }
  }
}

export default Raphy;
