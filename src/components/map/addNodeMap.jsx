import React from 'react';
import { Draw, Modify } from 'ol/interaction';
import GeoJSON from 'ol/format/GeoJSON';
import LayerGroup from 'ol/layer/Group';
import { NodeEditPointsLayer} from './layers/nodeEditPointLayer';


const geoJson = new GeoJSON();


class AddNodeMap extends React.Component {
  constructor(props) {
    super(props);
    this.mounted = false;
    this.mapRef = React.createRef();
    this.map = this.props.map;
    this.state = {
      errType: null,
      message: null,
      mapHeight: 500,
    };
    this.attributeTable = this.props.attributeTable;
    this.nodeEditPointLayer = new NodeEditPointsLayer(true);

    this.toDo = new LayerGroup({
      name: 'DWDM',
      layers: [

      ],
    });


    this.draw = new Draw({
      type: 'Point',
    });

    this.modify = new Modify({
      features: this.attributeTable,
    });
  }

  componentDidMount() {
    this.props.onRef(this);
    this.map.getMap().setTarget(this.mapRef.current);
    this.map.getMap().addLayer(this.nodeEditPointLayer.getLayer());
    //this.map.getMap().addLayer(this.toDo);

    this.map.getMap().addInteraction(this.modify);
    if (this.props.editing && this.props.editFeature) {
      console.log(this.props.editFeature);
      this.editNodePoint();
    } else {
      this.addNodePoint();
    }
  }

  componentWillUnmount() {
    console.log('unmounting');
    this.mounted = false;
    this.props.onRef(null);
    window.removeEventListener('resize', this.updateDimensions.bind(this));
    this.map.getMap().removeInteraction(this.draw);
    this.map.getMap().removeInteraction(this.modify);
    this.map.getMap().removeLayer(this.nodeEditPointLayer.getLayer());
  }

  // async getCurrentWorkOrders() {
  //   try{
  //     const extent = Extent.createEmpty();
  //     this.toDo.getLayers().forEach((layer) => {
  //       Extent.extend(extent, layer.getSource().getExtent());
  //     });
  //     this.map.getMap().getView().fit(
  //       extent, { maxZoom: 19 },
  //     );

  //   } catch (error) {
  //     this.setAlert('danger', error);
  //     console.log(error);
  //   }


  // }

  setAlert(alertMessage, alertVariant) {
    this.setState({
      alertVariant,
      alertMessage,
    });
  }

  setFeatureStyle(feature) {
    return feature.setStyle(this.nodeEditPointLayer.getFeatureStyle(true, '#ff7800'));
  }

  editNodePoint() {
    const NodeFeaturesLayerSource = this.nodeEditPointLayer.getLayer().getSource();
    NodeFeaturesLayerSource.clear();
    NodeFeaturesLayerSource.addFeature(this.props.editFeature);
    this.props.pushGeoPointFeature(this.props.editFeature);

    this.map.getMap().getView().fit(
      NodeFeaturesLayerSource.getExtent(), { maxZoom: 15 },
    );
  }


  addNodePoint() {
    const NodeFeaturesLayerSource = this.nodeEditPointLayer.getLayer().getSource();
    NodeFeaturesLayerSource.clear();

    this.draw.on('drawend', (event) => {
      const featureTimeStamp = (new Date).getTime();
      this.setFeatureStyle(event.feature);
      event.feature.setId(featureTimeStamp);
      event.feature.setProperties({
        app_id: featureTimeStamp,
        action: 'create',
        situs: 'New Node',
      });
      NodeFeaturesLayerSource.addFeature(event.feature);
      this.props.pushGeoPointFeature(event.feature);
      this.map.getMap().removeInteraction(this.draw);
    });
    this.map.getMap().addInteraction(this.draw);
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
    const { mapHeight, errType, message } = this.state;
    const mapStyle = {
      height: mapHeight + 'px',
    };


    return (
      <div ref={this.mapRef} style={mapStyle} />
    );
  }
}

export default AddNodeMap;
