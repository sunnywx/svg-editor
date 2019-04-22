import React from 'react';
import { hot } from 'react-hot-loader';
import { browserHistory as history, Router } from 'react-router';
import routes from 'routes';
import './App.css';

const App = () => (
  <div className='App'>
    <Router history={history} routes={routes} key={Math.random()} />
  </div>
);

export default hot(module)(App);
