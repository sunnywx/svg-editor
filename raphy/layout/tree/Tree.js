import NodeDB from './NodeDB';

class Tree {
  constructor(config, treeId) {
    this.reset(config, treeId);

    this.CONFIG = {
      maxDepth: 100,
      rootOrientation: 'WEST', // NORTH || EAST || WEST || SOUTH
      nodeAlign: 'BOTTOM', // CENTER || TOP || BOTTOM
      levelSeparation: 100,
      siblingSeparation: 30,
      subTeeSeparation: 5,

      hideRootNode: false,

      animateOnInit: false,
      animateOnInitDelay: 500,

      padding: 15, // the difference is seen only when the scrollbar is shown

      connectors: {
        type: 'step', // 'curve' || 'step' || 'straight' || 'bCurve'
        style: {
          stroke: 'black'
        },
        stackIndent: 15
      },
    };
  }

  reset(config, treeId) {
    this.initJsonConfig = config;
    this.initTreeId = treeId;

    this.id = treeId;
    this.nodeDB = new NodeDB(config.nodeStructure, this);

    return this;
  }

  getNodeDb() {
    return this.nodeDB;
  }

  addNode(parentNode, node) {

  }

  positionTree() {
    const root = this.getRootNode();
    this.resetLevelData();

    this.firstWalk(root, 0);
    this.secondWalk(root, 0, 0, 0);
  }

  resetLevelData() {
    this.lastNodeOnLevel = [];
    this.levelMaxDim = [];
  }

  calcLevelDim(node, level) { // root node is on level 0
    this.levelMaxDim[level] = {
      width: Math.max(this.levelMaxDim[level]? this.levelMaxDim[level].width: 0, node.width),
      height: Math.max(this.levelMaxDim[level]? this.levelMaxDim[level].height: 0, node.height),
    };
    return this;
  }

  firstWalk(node, level) {
    node.prelim = null;
    node.modifier = null;

    this.setNeighbors(node, level);
    this.calcLevelDim(node, level);

    const leftSibling = node.leftSibling();
    const childrenCount = node.childrenCount();
    if (childrenCount === 0 || level === this.CONFIG.maxDepth) {
      // set preliminary x-coordinate
      if (leftSibling) {
        node.prelim = leftSibling.prelim + leftSibling.size() + this.CONFIG.siblingSeparation;
      } else {
        node.prelim = 0;
      }
    } else {
      // node is not a leaf,  firstWalk for each child todo 能否更直接的获取 child
      for (let i = 0, n = childrenCount; i < n; i++) {
        this.firstWalk(node.childAt(i), level + 1);
      }

      const midPoint = node.childrenCenter() - node.size() / 2;

      if (leftSibling) {
        node.prelim = leftSibling.prelim + leftSibling.size() + this.CONFIG.siblingSeparation;
        node.modifier = node.prelim - midPoint;
        // if (!node.pseudo) { // 控制主机 2 todo
        //   node.prelim += 30;
        // }
        this.apportion(node, level);
      } else {
        node.prelim = midPoint;
      }

      // handle stacked children positioning
      if (node.stackParent) { // handle the parent of stacked children
        node.modifier += this.nodeDB.get(node.stackChildren[0]).size() / 2 + 15; // todo 15 is stackIndent
      } else if (node.stackParentId) { // handle stacked children
        node.prelim = 0;
      }
    }
  }

  apportion(node, level) {
    let firstChild = node.firstChild();
    let firstChildLeftNeighbor = firstChild.leftNeighbor();
    let compareDepth = 1;
    const depthToStop = this.CONFIG.maxDepth - level;

    while (firstChild && firstChildLeftNeighbor && compareDepth <= depthToStop) {
      let modifierSumRight = 0;
      let modifierSumLeft = 0;
      let leftAncestor = firstChildLeftNeighbor;
      let rightAncestor = firstChild;

      for (let i = 0; i < compareDepth; i++) {
        leftAncestor = leftAncestor.parent();
        rightAncestor = rightAncestor.parent();
        modifierSumLeft += leftAncestor.modifier;
        modifierSumRight += rightAncestor.modifier;

        if (rightAncestor.stackParent) {
          modifierSumRight += rightAncestor.size() / 2;
        }
      }

      let totalGap = (firstChildLeftNeighbor.prelim + modifierSumLeft + firstChildLeftNeighbor.size() + this.CONFIG.subTeeSeparation) - (firstChild.prelim + modifierSumRight);
      if (totalGap > 0) {
        let subtreeAux = node;
        let numSubtrees = 0;

        while (subtreeAux && subtreeAux.id !== leftAncestor.id) {
          subtreeAux = subtreeAux.leftSibling();
          numSubtrees++;
        }

        if (subtreeAux) {
          let subtreeMOveAux = node;
          let singleGap = totalGap / numSubtrees;
          while (subtreeMOveAux.id !== leftAncestor.id) {
            subtreeMOveAux.prelim += totalGap;
            subtreeMOveAux.modifier += totalGap;

            totalGap -= singleGap;
            subtreeMOveAux = subtreeMOveAux.leftSibling();
          }
        }
      }

      compareDepth++;

      firstChild = firstChild.childrenCount() === 0 ? node.leftMost(0, compareDepth) : firstChild = firstChild.firstChild();

      if (firstChild) {
        firstChildLeftNeighbor = firstChild.leftNeighbor();
      }
    }
  }

  secondWalk(node, level, X, Y) {
    if (level <= this.CONFIG.maxDepth) {
      const xTmp = node.prelim + X;
      const yTmp = Y;
      const { nodeAlign, rootOrientation } = this.CONFIG;
      let levelHeight = 0;
      let nodeSizeTmp = 0;

      if (rootOrientation === 'NORTH' || rootOrientation === 'SOUTH') {
        levelHeight = this.levelMaxDim[level].height;
        nodeSizeTmp = node.height;
        if (node.pseudo) {
          node.height = levelHeight;
        }
      } else if (rootOrientation === 'WEST' || rootOrientation === 'EAST') {
        levelHeight = this.levelMaxDim[level].width;
        nodeSizeTmp = node.width;
        if (node.pseudo) {
          node.width = levelHeight;
        }
      }

      node.X = xTmp;
      if (node.pseudo) {
        if (rootOrientation === 'NORTH' || rootOrientation === 'WEST') {
          node.Y = yTmp;
        } else if (rootOrientation === 'SOUTH' || rootOrientation === 'EAST') {
          node.Y = (yTmp + (levelHeight - nodeSizeTmp));
        }
      } else {
        node.Y = (nodeAlign === 'CENTER') ? (yTmp + (levelHeight - nodeSizeTmp) / 2) :
          (nodeAlign === 'TOP') ? (yTmp + (levelHeight - nodeSizeTmp)) : yTmp;
      }

      if (rootOrientation === 'WEST' || rootOrientation === 'EAST') {
        const swapTmp = node.X;
        node.X = node.Y;
        node.Y = swapTmp;
      }

      if (rootOrientation === 'SOUTH') {
        node.Y = -node.Y - nodeSizeTmp;
      } else if (rootOrientation === 'EAST') {
        node.X = -node.X - nodeSizeTmp;
      }

      if (node.childrenCount() !== 0) {
        if (node.id === 0 && this.CONFIG.hideRootNode) {
          this.secondWalk(node.firstChild(), level + 1, X + node.modifier, Y);
        } else {
          this.secondWalk(node.firstChild(), level + 1, X + node.modifier, Y + levelHeight + this.CONFIG.levelSeparation);
        }
      }

      if (node.rightSibling()) {
        const addition = node.pseudo || node.rightSibling().childrenCount() < 1 ? 0 : 60;
        this.secondWalk(node.rightSibling(), level, X + addition, Y);
      }
    }
  }

  setNeighbors(node, level) {
    node.leftNeighborId = this.lastNodeOnLevel[level];
    if (node.leftNeighborId) {
      node.leftNeighbor().rightNeighborId = node.id;
    }
    this.lastNodeOnLevel[level] = node.id;
    // return this;
  }

  getRootNode() {
    return this.nodeDB.get(0);
  }
}

export default Tree;
