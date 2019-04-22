class TreeNode {
  constructor(nodeStructure, id, parentId, tree, stackParentId) {
    this.tree = tree;
    this.reset(nodeStructure, id, parentId, tree, stackParentId);
  }

  reset(nodeStructure, id, parentId, tree, stackParentId) {
    this.id = id;
    this.parentId = parentId;
    this.treeId = tree.id;

    this.prelim = 0;
    this.modifier = 0;
    this.leftNeighborId = null;

    this.stackParentId = stackParentId;

    // pseudo node is a node with width=height=0, it is invisible, but necessary for the correct positioning of the tree
    this.pseudo = nodeStructure === 'pseudo' || nodeStructure['pseudo']; // todo: surely if nodeStructure is a scalar then the rest will error:
    this.children = [];

    // this.collapsable = nodeStructure.collapsable === false ? false : ( nodeStructure.collapsable || tree.CONFIG.node.collapsable );
    this.collapsed = nodeStructure.collapsed;
    this.text = nodeStructure.title;
    this.width = nodeStructure.width || 60; // todo tmp
    this.height = nodeStructure.height || 60;
    if (this.pseudo) {
      this.width = 1;
      this.height = 1;
    }
    this.type = nodeStructure.type;
    this.realId = nodeStructure.id;
    this.realParentId = nodeStructure.parent;

    return this;
  }

  parent() {
    return this.lookupNode(this.parentId);
  }

  leftNeighbor() {
    if (this.leftNeighborId) {
      return this.lookupNode(this.leftNeighborId);
    }
  }

  rightNeighbor() {
    if (this.rightNeighborId) {
      return this.lookupNode(this.rightNeighborId);
    }
  }

  leftSibling() {
    const leftNeighbor = this.leftNeighbor();

    if (leftNeighbor && leftNeighbor.parentId === this.parentId) {
      return leftNeighbor;
    }
  }

  rightSibling() {
    const rightNeighbor = this.rightNeighbor();

    if (rightNeighbor && rightNeighbor.parentId === this.parentId) {
      return rightNeighbor;
    }
  }

  lookupNode(nodeId) {
    return this.getTreeNodeDb().get(nodeId);
  }

  getTreeNodeDb() {
    return this.tree.getNodeDb();
  }

  childrenCount() {
    return ((this.collapsed || !this.children) ? 0: this.children.length);
  }

  childAt(index) {
    return this.getTreeNodeDb().get(this.children[index]);
  }

  firstChild() {
    return this.childAt(0);
  }

  lastChild() {
    return this.childAt(this.children.length - 1);
  }

  size() {
    if (this.pseudo) {
      // prevents separating the subtrees
      return (-this.tree.CONFIG.subTeeSeparation);
    }

    return 60; // todo
  }

  childrenCenter() {
    const first = this.firstChild();
    const last = this.lastChild();

    return (first.prelim + ((last.prelim - first.prelim) + last.size()) / 2);
  }

  leftMost(level, depth) {
    if (level >= depth) {
      return this;
    }
    if (this.childrenCount() === 0) {
      return;
    }

    for (let i = 0, n = this.childrenCount(); i < n; i++) {
      const leftmostDescendant = this.childAt(i).leftMost(level + 1, depth);
      if (leftmostDescendant) {
        return leftmostDescendant;
      }
    }
  }
  // getTree() {
  //   return TreeStore.get(this.treeId);
  // }
}

export default TreeNode;
