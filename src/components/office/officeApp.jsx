import React from 'react';
import { Route } from 'react-router-dom';

import { App } from '../navigation/nav';
import { global } from '../../config';

import PgeOutages from './pgeOutages';



const MODULE_PREFIX = '/office';

class Puppet extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      modulePrefix: MODULE_PREFIX,
    };

    document.title = global.header.siteTitleAbv + ' :: PGE Outage Map';
  }

  render() {
    const { modulePrefix, nav } = this.state;

    return (
      <App nav={nav}>
        <div>
          <Route exact path={modulePrefix + '/pge-outages'} component={PgeOutages} />
        </div>
      </App>
    );
  }
}

export default Puppet;
