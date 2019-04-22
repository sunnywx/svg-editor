import React from 'react';
import PropTypes from 'prop-types';
import autobind from 'autobind-decorator';
import shortid from 'shortid';
import countBy from 'lodash/countBy';
import find from 'lodash/find';
// import { Link } from 'react-router';
import { Raphy, Element } from 'raphy';
import { data as initData, sourceMapper, connectionRules } from 'src/data/data';
import './MainView.css';
// import { Raphy, Element } from '../../dist/raphy.min';
// import '../../dist/raphy.min.css';

class MainView extends React.Component {
  static propTypes = {
    children: PropTypes.element,
  }

  constructor(props) {
    super(props);

    const data = JSON.stringify(initData, null, ' ');
    this.state = {
      initData: data,
    };
    // const r = new Ra();
    // console.log(r);
  }

  @autobind
  elementFactory(option) {
    const { type } = option;
    const count = countBy(this.raphy.store.elements, 'type');
    const id = option.id || shortid.generate();
    const typeCount = count[type] || 0;
    const { icon, label, connectionType = 'primary', color, anchor } = sourceMapper[type];
    const title = option.label || `${label} ${typeCount + 1}`;
    const element = new Element({
      id, type, label: title, icon, connectionType, color, anchor,
    });

    return element;
  }

  /**
   *
   * @param source
   * @param target
   * @param connectType p2p or drag-in
   * @returns
   */
  checkConnectible(source, target, twoWay = true) {
    // child to parent
    let rules = connectionRules[source.type];
    let rule = find(rules, { resourceType: target.type });

    if (rule) {
      return {
        connectionType: 'c2p',
        lineType: rule.connectionType,
      };
    }

    // parent to child
    if (twoWay) {
      rules = connectionRules[target.type];
      rule = find(rules, { resourceType: source.type });
      if (rule) {
        return {
          connectionType: 'p2c',
          lineType: rule.connectionType,
        };
      }
    }

    return false;
  }

  @autobind
  handleDataChange(e) {
    const { value } = e.target;
    this.setState({
      initData: value,
    });
  }

  @autobind
  handleClear() {
    this.raphy.clear();
  }


  @autobind
  import() {
    this.handleClear();
    const data = JSON.parse(this.state.initData);
    this.raphy.import(data);
  }

  @autobind
  export() {
    const data = this.raphy.export(false);
    const dataStr = JSON.stringify(data, null, '  ');
    this.setState({
      initData: dataStr,
    });
  }

  @autobind
  zoom(level) {
    const currentZoom = this.raphy.zoom();
    this.raphy.zoom(level + currentZoom);
  }

  @autobind
  resetPanZoom() {
    this.raphy.resetPanZoom();
  }

  @autobind
  exportImage() {
    console.log(this.raphy.exportImage());
    this.raphy.downloadSVG();
  }

  @autobind
  onDragStart(e, type) {
    console.log(type);
    e.dataTransfer.setData('type', type);
    // highlightConnectible
    this.raphy.highlightConnectibleElement({ type }, false);
  }

  @autobind
  onDragEnd() {
    this.raphy.unHighlightConnectibleElement();
  }

  @autobind
  autoLayout() {
    this.raphy.autoLayout();
  }

  componentDidMount() {
    this.raphy = new Raphy('canvas', {
      width: '100%',
      height: '100%',
      // gridSize: 15,
      drawGrid: true,
      checkConnectible: this.checkConnectible,
      elementFactory: this.elementFactory,
    });

    // this.raphy.canvas.setGrid({
    //   name: 'mesh',
    // });

    this.raphy.on('element.click', element => {
      console.log(element);
      element.setLabel('aasdf');
    });
    this.raphy.on('canvas.click', () => {
      console.log(123);
    });

    // const shape1 = new Element({ id: 1, x: 50, y: 50, label: '网络1' });
    // const shape2 = new Element({ id: 2, x: 150, y: 150, label: '主机1' });
    // this.raphy.addElement(shape1);
    // this.raphy.addElement(shape2);
  }

  render() {
    return (
      <div className="main">
        <div className="left-area">
          <h3>Data</h3>
          <div className="input">
            <textarea onChange={this.handleDataChange} value={this.state.initData}></textarea>
          </div>
        </div>
        <div className="right-area">
          <div style={{ height: '100%' }}>
            <div className="actions">
              <span>数据：</span>
              <button onClick={this.import}>导入</button>
              <button onClick={this.export}>导出</button>
              <button onClick={this.handleClear}>清空</button>
              <span>图像：</span>
              <button onClick={this.exportImage}>导出</button>
              <button onClick={() => this.zoom(0.1)}>放大</button>
              <button onClick={() => this.zoom(-0.1)}>缩小</button>
              <button onClick={this.resetPanZoom}>复原</button>
              <button onClick={this.autoLayout}>自动布局</button>
              <span>资源：</span>
              <button draggable={true} onDragEnd={this.onDragEnd} onDragStart={(e) => this.onDragStart(e, 'router')}>路由器</button>
              <button draggable={true} onDragEnd={this.onDragEnd} onDragStart={(e) => this.onDragStart(e, 'vxnet')}>网络</button>
              <button draggable={true} onDragEnd={this.onDragEnd} onDragStart={(e) => this.onDragStart(e, 'instance')}>主机</button>
              <button draggable={true} onDragEnd={this.onDragEnd} onDragStart={(e) => this.onDragStart(e, 'volume')}>硬盘</button>
              <button draggable={true} onDragEnd={this.onDragEnd} onDragStart={(e) => this.onDragStart(e, 'eip')}>公网 IP</button>
              <button draggable={true} onDragEnd={this.onDragEnd} onDragStart={(e) => this.onDragStart(e, 'keypair')}>SSH 密钥</button>
              <button draggable={true} onDragEnd={this.onDragEnd} onDragStart={(e) => this.onDragStart(e, 'loadbalancer')}>负载均衡器</button>
              <button draggable={true} onDragEnd={this.onDragEnd} onDragStart={(e) => this.onDragStart(e, 'loadbalancer_listener')}>负载均衡器监听器</button>
              <button draggable={true} onDragEnd={this.onDragEnd} onDragStart={(e) => this.onDragStart(e, 'loadbalancer_backend')}>负载均衡器后端</button>
            </div>
            <div id="canvas" className="canvas"></div>
          </div>
        </div>
      </div>
    );
  }
}

export default MainView;
