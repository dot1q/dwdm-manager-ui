import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import Style from 'ol/style/Style';
import Stroke from 'ol/style/Stroke';
import Fill from 'ol/style/Fill';
import Text from 'ol/style/Text';

const setSpansLayerStyle = (labelsOn = true) => {
  return (() => {
    const style = new Style({
      stroke: new Stroke({
        color: '#ff87dd',
        width: 5,
        lineCap: 'butt',
        lineJoin: 'bevel',
      }),
    });

    const labelStyle = new Style({
      text: new Text({
        text: 'null',
        placement: 'point',
        font: '14px Arial, Verdana, Helvetica, sans-serif',
        scale: 1,
        offsetY: -20,
        fill: new Fill({
          color: '#ffde00',
        }),
        stroke: new Stroke({
          color: '#000000',
          width: 3,
        }),
      }),
    });

    return (feature) => {
      if (feature.get('build_out') === 'Buried') {
        style.getStroke().setColor('#AD3DFF');
      } else if (feature.get('build_out') === 'Aerial') {
        style.getStroke().setColor('#ff7e00');
      } else { // Hybrid
        style.getStroke().setColor('#8600b8');
      }

      if (feature.get('status') === 'Development') {
        //style.getStroke().setLineDash([7, 4]);
      } else if (feature.get('status') === 'Non Production') {
        style.getStroke().setLineDash([3, 4]);
        style.getStroke().setColor('#969696');
      } else {
        style.getStroke().setLineDash();
      }

      if (labelsOn) {
        labelStyle.getText().setText(feature.get('name'));
      } else {
        labelStyle.getText().setText();
      }

      return [style, labelStyle];
    };
  })();
};

class SpansLayer {
  constructor(visibility) {
    this.visibility = visibility;
    this.name = 'pl_spans_layer';
    this.style = setSpansLayerStyle;
    this.layer = new VectorLayer({
      title: 'Spans Layer',
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

export { SpansLayer };
