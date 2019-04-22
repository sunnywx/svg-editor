import Tree from './Tree';

class TreeStore {
  constructor(config) {
    this.store = [];
    // this.createTree(config);
  }

  createTree(config) {
    const treeId = this.store.length;
    const tree = new Tree(config, treeId);
    this.store.push(tree);

    return tree;
  }

  getTree(treeId) {
    return this.store[treeId];
  }

  destroy(treeId) {
    console.log('destroy treeStore', treeId);
  }
}

export default TreeStore;
