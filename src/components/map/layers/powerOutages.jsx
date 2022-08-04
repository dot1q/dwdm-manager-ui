import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import Style from 'ol/style/Style';
import Stroke from 'ol/style/Stroke';
import Fill from 'ol/style/Fill';
import Text from 'ol/style/Text';
import Icon from 'ol/style/Icon';

const powerOutageStyle = (labelsOn, fillColor = '#000000') => {
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
      image: new Icon({
        src: '/assets/img/bolt.png'
      })
    });
    return (feature, resolution) => {
      const scale = 0.4 / Math.pow(resolution, 0.5);

      squareStyle.getImage().setScale(scale);
      //squareStyle.getText().setScale(scale);

      if (labelsOn) {
        labelStyle.getText().setText(feature.get('impacted') + ' Impacted Customers');
      } else {
        labelStyle.getText().setText();
      }

      return [labelStyle, squareStyle];
    };
  })();
};

class PowerOutagesLayer {
  constructor(visibility) {
    this.name = 'pl_optical_terminals';
    this.style = powerOutageStyle;
    this.layer = new VectorLayer({
      title: 'Terminal',
      name: this.name,
      type: 'object',
      label_toggle: false,
      style: this.style(true),
      source: new VectorSource(),
      zIndex: 30,
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

export { PowerOutagesLayer };
