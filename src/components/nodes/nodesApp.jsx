import React from 'react';
import { Route } from 'react-router-dom';

import { App } from '../navigation/nav';
import { global } from '../../config';

import NodeMap from './nodeMap';
import NodeList from './nodeList';



const MODULE_PREFIX = '/nodes';

class Nodes extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      modulePrefix: MODULE_PREFIX,
    };

    document.title = global.header.siteTitleAbv + ' :: DWDM Nodes';
  }

  render() {
    const { modulePrefix, nav } = this.state;

    return (
      <App nav={nav}>
        <div>
          <Route exact path={modulePrefix + '/list'} component={NodeList} />
          <Route exact path={modulePrefix + '/map'} component={NodeMap} />
        </div>
      </App>
    );
  }
}

export default Nodes;
