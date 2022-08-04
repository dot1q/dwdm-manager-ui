import React from 'react';
import { Route } from 'react-router-dom';

import { App } from '../navigation/nav';
import { global } from '../../config';

import SpanList from './spanList';
import WavelengthList from './wavelengthList';
import CircuitSearch from './circuitSearch';



const MODULE_PREFIX = '/spans';

class Spans extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      modulePrefix: MODULE_PREFIX,
    };

    document.title = global.header.siteTitleAbv + ' :: DWDM Spans';
  }

  render() {
    const { modulePrefix, nav } = this.state;

    return (
      <App nav={nav}>
        <div>
          <Route exact path={modulePrefix + '/list'} component={SpanList} />
          <Route exact path={modulePrefix + '/wavelengths'} component={WavelengthList} />
          <Route exact path={modulePrefix + '/circuit-search'} component={CircuitSearch} />
          
        </div>
      </App>
    );
  }
}

export default Spans;
