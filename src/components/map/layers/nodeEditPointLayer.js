import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import Style from 'ol/style/Style';
import Stroke from 'ol/style/Stroke';
import Fill from 'ol/style/Fill';
import Text from 'ol/style/Text';
import Circle from 'ol/style/Circle';

const setEditPointStyle = (labelsOn, fillColor = '#319FD3') => {
  return (() => {
    const style = new Style({
      text: new Text({
        text: 'null',
        textBaseline: 'top',
        offsetY: 10,
        font: '14px Arial, Verdana, Helvetica, sans-serif',
        scale: 1,
        fill: new Fill({
          color: '#ffde00',
        }),
        stroke: new Stroke({
          color: '#000000',
          width: 3,
        }),
      }),
      fill: new Fill({
        color: 'rgba(255, 255, 255, 0.2)',
      }),
      stroke: new Stroke({
        color: '#ff002a',
        width: 5,
      }),
      image: new Circle({
        radius: 5,
        fill: new Fill({
          color: fillColor,
        }),
      }),
    });

    return (feature) => {
      if (labelsOn) {
        style.getText().setText(feature.get('situs'));
      } else {
        style.getText().setText();
      }
      return [style];
    };
  })();
};

const nodeEditPointFeature = (feature) => {
  const splitId = feature.getId().split('.');
  return {
    header: [
      { // Region
        name: feature.get('situs'),
        bold: false,
      },
    ],
    body: {
      text: 'N/A',
      table: [],
    },
    actions: [
      {
        type: 'callback',
        label: 'Edit',
        id: `${feature.getId()}`,
        app_id: `${feature.get('app_id')}`,
      },
    ],
    contentSidebar: null,
  };
};

const nodeEditPointFeatureNoEdit = (feature) => {
  const splitId = feature.getId().split('.');
  return {
    header: [
      { // Region
        name: feature.get('situs'),
        bold: false,
      },
    ],
    body: {
      text: 'N/A',
      table: [],
    },
    actions: [],
    contentSidebar: null,
  };
};

class NodeEditPointsLayer {
  constructor(visibility) {
    this.visibility = visibility;
    this.name = 'pl_node_edit_points';
    this.style = setEditPointStyle;
    this.layer = new VectorLayer({
      title: 'Node Edit Points',
      label_toggle: false,
      type: 'object',
      name: this.name,
      style: this.style(false),
      source: new VectorSource(),
      zIndex: 5000,
      crossOrigin: 'anonymous',
      visible: visibility,
      minResolution: 0,
      getStyle: (state) => {
        return this.style(state);
      },
    });
  }

  getFeatureStyle(labels, color) {
    return this.style(labels, color);
  }

  getLayer() {
    return this.layer;
  }
}


export { NodeEditPointsLayer, nodeEditPointFeature, nodeEditPointFeatureNoEdit };
