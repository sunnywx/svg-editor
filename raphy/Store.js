import findIndex from 'lodash/findIndex';

class Store {
  constructor() {
    this.elements = [];
    this.isDragging = false;
    this.draggingElement = null;
    this.options = {};
    this.tmpConnectibleElements = [];
    this.connections = {};
  }

  setDraggingStatus(status) {
    this.isDragging = status;
  }

  setFocusElement(element) {
    this.focusElement = element;
  }

  setDraggingElement(element) {
    this.draggingElement = element;
  }

  setOptions(options) {
    this.options = options;
  }

  addElement(element) {
    this.elements.push(element);
  }

  removeElement(element) {
    const { id } = element;
    const index = findIndex(this.elements, { id });
    this.elements[index] = null;
    this.elements.splice(index, 1);
    Object.keys(this.connections).forEach(key => {
      if (key.indexOf(id) > -1) {
        this.connections[key].remove();
        this.connections[key] = null;
        delete this.connections[key];
      }
    });
  }

  getElement(id) {
    const index = findIndex(this.elements, { id });
    return this.elements[index];
  }

  addTmpConnectibleElements(element) {
    this.tmpConnectibleElements.push(element);
  }

  clearTmpConnectibleElements() {
    this.tmpConnectibleElements = [];
  }

  setConnection(id, value) {
    this.connections[id] = value;
  }

  removeConnection(id) {
    this.connections[id] = null;
    delete this.connections[id];
  }

  export(simple = true) {
    const elements = [];
    const connections = [];
    this.elements.forEach(element => {
      const {
        type, label, metadata, id,
      } = element;

      const children = [];
      let parent = 0;
      const subParent = [];
      element.connections.forEach(connectionId => {
        const connection = this.connections[connectionId];
        const tmpArr = connectionId.split('@@');

        if (tmpArr[0] === id) {
          if (!simple) children.push({ type: connection.type, id: tmpArr[1] });
        } else if (connection.type === 'secondary') {
          subParent.push(tmpArr[0]);
        } else {
          [parent] = tmpArr;
        }
      });

      const data = {
        id, type, label, metadata, parent, children, subParent,
      };
      elements.push(data);
    });

    if (simple) return elements;

    Object.keys(this.connections).forEach(key => {
      const connection = this.connections[key];
      const data = {
        from: connection.source.id,
        to: connection.target.id,
      };

      connections.push(data);
    });

    return { elements, connections };
  }

  // import(data) {
  //   data.forEach(item => {
  //
  //   });
  // }

  clear() {
    this.elements = [];
    this.isDragging = false;
    this.draggingElement = null;
    this.options = {};
    this.tmpConnectibleElements = [];
    this.connections = {};
  }
}

export default Store;
