import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import Style from 'ol/style/Style';
import Stroke from 'ol/style/Stroke';
import Fill from 'ol/style/Fill';
import Text from 'ol/style/Text';
import RegularShape from 'ol/style/RegularShape';

const nodesLayerStyle = (labelsOn, fillColor = '#000000') => {
  return (() => {
    const labelStyle = new Style({
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
          width: 3.5,
        }),
      }),
    });

    const squareStyle = new Style({
      image: new RegularShape({
        fill: new Fill({
          color: fillColor,
        }),
        points: 4,
        radius: 100,
        angle: Math.PI / 4,
        snapToPixel: true,
      }),
      text: new Text({
        text: 'N',
        font: '100px Arial, Verdana, Helvetica, sans-serif',
        fill: new Fill({
          color: '#FFFFFF',
        }),
      }),
    });
    return (feature, resolution) => {
      const scale = .2

      squareStyle.getImage().setScale(scale);
      squareStyle.getText().setScale(scale);

      if (labelsOn) {
        labelStyle.getText().setText(feature.get('node'));
      } else {
        labelStyle.getText().setText();
      }

      return [labelStyle, squareStyle];
    };
  })();
};

class NodeLayerLayer {
  constructor(visibility) {
    this.visibility = visibility;
    this.name = 'pl_node_layer';
    this.style = nodesLayerStyle;
    this.layer = new VectorLayer({
      title: 'Node Layer',
      name: this.name,
      type: 'object',
      label_toggle: false,
      style: this.style(true),
      source: new VectorSource(),
      zIndex: 10,
      crossOrigin: 'anonymous',
      visible: visibility,
      getStyle: (state) => {
        return this.style(state);
      },
    });
  }

  getLayer() {
    return this.layer;
  }
}

export { NodeLayerLayer };
