import React from 'react';
import { Row, Col } from 'react-bootstrap';
import GeoJSON from 'ol/format/GeoJSON';
import Feature from 'ol/Feature';
import { transform, fromLonLat } from 'ol/proj';
import LayerGroup from 'ol/layer/Group';
import * as Extent from 'ol/extent';
import LineString from 'ol/geom/LineString';
import { global } from '../../config';
import { jsonRequest } from '../../js/common';
import DefaultMap from './defaultMap';
import AlertMsg from '../common/alerts';
import { SpansLayer } from './layers/spansLayer';
import { NodeLayerLayer } from './layers/nodesLayer';

const geoJson = new GeoJSON();


class ViewNodeMap extends React.Component {
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
    this.spansLayer = new SpansLayer(true);
    this.nodesLayer = new NodeLayerLayer(true);

    this.toDo = new LayerGroup({
      name: 'ToDo',
      layers: [
        this.spansLayer.getLayer(),
        this.nodesLayer.getLayer(),
      ],
    });
  }

  componentDidMount() {
    this.map.getMap().setTarget(this.mapRef.current);
    this.map.getMap().addLayer(this.toDo);
    this.getNodes();
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.updateDimensions.bind(this));
  }

  async getNodes() {
    // Stats uri
    try {
      const nodes = await jsonRequest(`${global.apiServer}/v1/nodes/get-nodes`, 'get', {});
      const spans = await jsonRequest(`${global.apiServer}/v1/spans/get-spans-geom`, 'get', {});
      const { data } = nodes;
      const spanData = spans.data;
    

      this.spansLayer.getLayer().getSource().clear();
      for (let i = 0; i < spanData.length; i++) {
        const points = [ spanData[i].loc_a_geom.coordinates, spanData[i].loc_b_geom.coordinates ];
        for (let ii = 0; ii < points.length; ii++) {
          points[ii] = transform(points[ii], 'EPSG:4326', 'EPSG:3857');
        }

        const feature = new Feature({
          geometry: new LineString(points),
          name: spanData[i].name,
          status: spanData[i].status,
        });
        feature.setId(`${this.spansLayer.name}.${spanData[i].id}`);
        this.spansLayer.getLayer().getSource().addFeature(feature);
        console.log(`${this.spansLayer.name}.${spanData[i].id}`)
      }

      this.nodesLayer.getLayer().getSource().clear();
      for (let i = 0; i < data.length; i++) {
        const geom = geoJson.readGeometry(data[i].geom, {
          featureProjection: 'EPSG:3857',
        });
        const feature = new Feature({
          geometry: geom,
          name: data[i].name,
          status: data[i].status,
        });
        feature.setId(`${this.nodesLayer.name}.${data[i].id}`);
        this.nodesLayer.getLayer().getSource().addFeature(feature);
        console.log(`${this.nodesLayer.name}.${data[i].id}`)
      }

      const extent = Extent.createEmpty();
      this.toDo.getLayers().forEach((layer) => {
        Extent.extend(extent, layer.getSource().getExtent());
      });
      this.map.getMap().getView().fit(
        extent, { maxZoom: 19 },
      );

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
      <div style={{ height: '1000px' }}>
        <AlertMsg
          errType={this.state.errType}
          message={this.state.message}
        />
        <div ref={this.mapRef} style={{ height: '100%' }}/>
      </div>
    );
  }
}

export default ViewNodeMap;
