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
import { WavelengthLayer } from './layers/wavelengthLayer';
import { NodeLayerLayer } from './layers/nodesLayer';

const geoJson = new GeoJSON();


class ViewCircuitMap extends React.Component {
  constructor(props) {
    super(props);
    this.mounted = false;
    this.mapRef = React.createRef();
    this.map = new DefaultMap();
    this.state = {
      errType: null,
      message: null,
      mapHeight: 500,
      circuitId: this.props.id,
    };
    this.waveLengthLayer = new WavelengthLayer(true);
    this.nodesLayer = new NodeLayerLayer(true);

    this.toDo = new LayerGroup({
      name: 'ToDo',
      layers: [
        this.waveLengthLayer.getLayer(),
        this.nodesLayer.getLayer(),
      ],
    });
  }

  componentDidMount() {
    this.map.getMap().setTarget(this.mapRef.current);
    this.map.getMap().addLayer(this.toDo);
    this.getNodes();
    console.log(this.state.circuitId);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.updateDimensions.bind(this));
  }

  async getNodes() {
    // Stats uri
    try {
      const circuitWaveLengthDetail = await jsonRequest(`${global.apiServer}/v1/wavelength/get-wavelength-span-joins/${this.state.circuitId}`, 'get', {});
      const nodesArr = [];
      circuitWaveLengthDetail.data.tableData.forEach(item => {
        if(nodesArr.hasOwnProperty(item.loc_a)){
          nodesArr[item.loc_a].count++;
        } else {
          nodesArr[item.loc_a] = {id: item.loc_a, label: item.loc_a_name, geom: item.loc_a_geom, count: 1};
        }
  
        if(nodesArr.hasOwnProperty(item.loc_b)){
          nodesArr[item.loc_b].count++;
        } else {
          nodesArr[item.loc_b] = {id: item.loc_b, label: item.loc_b_name, geom: item.loc_b_geom, count: 1};
        }
      });
      console.log(nodesArr);
      const nodes = Object.values(nodesArr);
      console.log(nodes);

      const spanData = circuitWaveLengthDetail.data.tableData;
    

      this.waveLengthLayer.getLayer().getSource().clear();
      for (let i = 0; i < spanData.length; i++) {
        const points = [ spanData[i].loc_a_geom.coordinates, spanData[i].loc_b_geom.coordinates ];
        for (let ii = 0; ii < points.length; ii++) {
          points[ii] = transform(points[ii], 'EPSG:4326', 'EPSG:3857');
        }

        const feature = new Feature({
          geometry: new LineString(points),
          name: spanData[i].name,
          status: spanData[i].status,
          channel: spanData[i].channel,
        });
        feature.setId(`${this.waveLengthLayer.name}.${spanData[i].id}`);
        this.waveLengthLayer.getLayer().getSource().addFeature(feature);
        console.log(`${this.waveLengthLayer.name}.${spanData[i].id}`)
      }

      this.nodesLayer.getLayer().getSource().clear();
      for (let i = 0; i < nodes.length; i++) {
        const geom = geoJson.readGeometry(nodes[i].geom, {
          featureProjection: 'EPSG:3857',
        });
        const feature = new Feature({
          geometry: geom,
          label: nodes[i].label,
        });
        feature.setId(`${this.nodesLayer.label}.${nodes[i].id}`);
        this.nodesLayer.getLayer().getSource().addFeature(feature);
        console.log(`${this.nodesLayer.label}.${nodes[i].id}`)
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
      <div style={{ height: '600px' }}>
        <AlertMsg
          errType={this.state.errType}
          message={this.state.message}
        />
        <div ref={this.mapRef} style={{ height: '100%' }}/>
      </div>
    );
  }
}

export default ViewCircuitMap;
