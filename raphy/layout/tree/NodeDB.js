import groupBy from 'lodash/groupBy';
import TreeNode from './TreeNode';

class NodeDB {
  constructor(nodeStructure, tree) {
    this.reset(nodeStructure, tree);
  }

  reset(nodeStructure, tree) {
    this.db = [];
    const self = this;

    function iterateChildren(node, parentId) {
      let newNode = self.createNode(node, parentId, tree, null);

      if (node.children) {
        // pseudo node is used for descending children to the next level
        if (node.childrenDropLevel && node.childrenDropLevel > 0) {
          while (node.childrenDropLevel--) {
            // pseudo node needs to inherit the connection style from its parent for continuous connectors
            // var connStyle = UTIL.cloneObj( newNode.connStyle );
            newNode = self.createNode({ pseudo: true }, newNode.id, tree, null);
            // newNode.connStyle = connStyle;
            newNode.children = [];
          }
        }

        const autoStack = true; // todo in config
        if (autoStack && node.parent && node.children.length > 2 && !self.hasGrandChildren(node)) {
          const parentId = newNode.id;
          // auto stack by type.
          const stackMap = groupBy(node.children, 'type');
          Object.keys(stackMap).forEach(key => {
            newNode = self.createNode({ pseudo: true, type: key }, parentId, tree, null);
            const stackChildren = stackMap[key];
            const stackId = newNode.id;
            newNode.stackChildren = [];

            stackChildren.forEach((child, index) => {
              newNode = self.createNode(child, newNode.id, tree, stackId);
              if (index + 1 === child.length) {
                newNode.children = [];
              }
            });
          });
        } else {
          if (autoStack && node.children.length < 1) {
            node.stackChildren = true;
          }
          // original logic
          const stack = (node.stackChildren && !self.hasGrandChildren(node)) ? newNode.id: null;
          if (stack !== null) {
            newNode.stackChildren = [];
          }

          node.children.forEach((child, index) => {
            if (stack !== null) {
              newNode = self.createNode(child, newNode.id, tree, stack);
              if (index + 1 === child.length) {
                newNode.children = [];
              }
            } else {
              iterateChildren(child, newNode.id);
            }
          });
        }
      }
    }

    iterateChildren(nodeStructure, -1);
    // this.createGeometries( tree );

    return this;
  }

  createNode(nodeStructure, parentId, tree, stackParentId) {
    const id = this.db.length;
    const node = new TreeNode(nodeStructure, id, parentId, tree, stackParentId);
    this.db.push(node);

    if (parentId >= 0) {
      const parent = this.get(parentId);

      if (nodeStructure.position) {
        if (nodeStructure.position === 'left') {
          parent.children.push(node.id);
        } else if (nodeStructure.position === 'right') {
          parent.children.splice(0, 0, node.id);
        } else if (nodeStructure.position === 'center') {
          parent.children.splice(Math.floor( parent.children.length / 2 ), 0, node.id);
        } else {
          // edge case when there's only 1 child
          const position = parseInt(nodeStructure.position);
          if (parent.children.length === 1 && position > 0) {
            parent.children.splice(0, 0, node.id);
          } else {
            parent.children.splice(Math.max(position, parent.children.length - 1 ), 0, node.id);
          }
        }
      } else {
        parent.children.push(node.id);
      }
    }

    if (stackParentId) {
      this.get(stackParentId).stackParent = true;
      this.get(stackParentId).stackChildren.push(node.id);
    }

    return node;
  }

  get(nodeId) {
    return this.db[nodeId];
  }

  hasGrandChildren(nodeStructure) {
    let i = nodeStructure.children.length;
    while (i--) {
      if (nodeStructure.children[i].children && nodeStructure.children[i].children.length) { return true; }
    }
    return false;
  }
}

export default NodeDB;
