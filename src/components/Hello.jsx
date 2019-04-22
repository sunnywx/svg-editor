import React from 'react';
import PropTypes from 'prop-types';
import './Hello.css';
import './style.scss';

const Hello = ({ msg }) => (
  <div id='Hello'>
    <h2>{msg}</h2>
    <p className='doc'>
      <i className='router'>react-router's</i> <a href='https://github.com/ReactTraining/react-router/tree/v3/docs' target='_blank'>doc</a>
      ( or <a href='http://react-guide.github.io/react-router-cn/index.html' target='_blank'>zh-doc</a> )
    </p>
  </div>
);

Hello.prototype.propTypes = {
  msg: PropTypes.string,
};

export default Hello;
