import React from 'react';
import { Row, Col } from 'react-bootstrap';
import GeoJSON from 'ol/format/GeoJSON';
import Feature from 'ol/Feature';
import { transform, fromLonLat } from 'ol/proj';
import LayerGroup from 'ol/layer/Group';
import * as Extent from 'ol/extent';
import WKT from 'ol/format/WKT';
import Point from 'ol/geom/Point';
import { httpRequest, jsonRequest } from '../../../js/common';
import DefaultMap from './defaultMap';
import AlertMsg from '../../common/alerts';

import { PowerOutagesLayer } from './layers/powerOutages';

const geoJson = new GeoJSON();


class CrewTodoMap extends React.Component {
  constructor(props) {
    super(props);
    this.mounted = false;
    this.mapRef = React.createRef();
    this.map = new DefaultMap();
    this.state = {
      errType: null,
      message: null,
      mapHeight: 500,
    };

    this.powerOutagesLayer = new PowerOutagesLayer(true);

    this.pge = new LayerGroup({
      name: 'PGE',
      layers: [
        this.powerOutagesLayer.getLayer(),
      ],
    });
  }

  componentDidMount() {
    this.map.getMap().setTarget(this.mapRef.current);
    this.map.getMap().addLayer(this.pge);
    this.getCurrentWorkOrders();
    setInterval(this.getCurrentWorkOrders.bind(this), 15000);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.updateDimensions.bind(this));
  }

  async getCurrentWorkOrders() {
    // Stats uri
    try {
      const powerOutageList = await jsonRequest('https://api.portlandgeneral.com/pge-graphql', 'post', {
        operationName: "getAllOutageEvents",
        query: "query getAllOutageEvents {\n  getAllOutageEvents\n}\n",
        variables: {}
      });
      const powerList = powerOutageList.data.getAllOutageEvents.events;

      // Power outages
      for (let i = 0; i < powerList.length; i++) {
        const format = new WKT();
        const feature = new Feature({
          geometry: new Point(transform(format.readGeometry(`Point(${powerList[i].long} ${powerList[i].lat})`).getCoordinates(), 'EPSG:4326', 'EPSG:3857')),
          type: 'T',
          impacted: powerList[i].totalCustomersImpacted,
          uid: powerList[i].eventId,
        });
        feature.setId(`${this.powerOutagesLayer.name}.${powerList[i].eventId}`); // Custom id for feature style parsing
        this.powerOutagesLayer.getLayer().getSource().addFeature(feature);
      }

      if (powerList.length > 0) {
        const extent = Extent.createEmpty();
        this.pge.getLayers().forEach((layer) => {
          Extent.extend(extent, layer.getSource().getExtent());
        });
        this.map.getMap().getView().fit(
          extent, { maxZoom: 19 },
        );
      }
    } catch (error) {
      this.setAlert('danger', error);
      console.log(error);
    }


  }

  setAlert(alertMessage, alertVariant) {
    this.setState({
      alertVariant,
      alertMessage,
    });
  }

  updateDimensions() {
    window.setTimeout(() => {
      const windowHeight = window.innerHeight;
      const heighCalc = windowHeight - 30
        - document.getElementsByClassName('main-footer')[0].offsetHeight
        - document.getElementsByClassName('content-header')[0].offsetHeight
        - document.getElementById('ReactHeader').clientHeight;
      this.setState({
        mapHeight: heighCalc,
      });
      this.map.getMap().updateSize();
    }, 300);
  }

  render() {
    return (
      <div style={{ height: '100%' }}>
        <AlertMsg
          errType={this.state.errType}
          message={this.state.message}
        />
        <div ref={this.mapRef} style={{ height: '100%' }}/>
      </div>
    );
  }
}

export default CrewTodoMap;
