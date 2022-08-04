// Libraries
import Map from 'ol/Map';
import View from 'ol/View';
import { defaults } from 'ol/interaction';
import { ScaleLine } from 'ol/control';
import WKT from 'ol/format/WKT';
import { transform } from 'ol/proj';
import TileLayer from 'ol/layer/Tile';
import XYZ from 'ol/source/XYZ';
import Stamen from 'ol/source/Stamen';

const ARCGISONLINE_URI = 'https://server.arcgisonline.com/arcgis/rest/services/';

// CSS Imports
import 'ol/ol.css';


class DefaultMap {
  constructor() {
    this.cqlRegionString = ''; // TODO: finish this
    this.popUpRef = null;
    this.scaleLine = new ScaleLine({
      units: 'us',
      minWidth: 100,
    });
    this.map = null;
    this.select = null;
    this.layers = null;
    this.cursor = 'pointer';
    this.setUp();
  }

  setUp() {
    this.setUpMap();
  }


  setUpMap() {
    this.map = new Map({
      layers: [
        new TileLayer({
          title: 'Esri Street',
          type: 'base',
          base_name: 'esri_street',
          source: new XYZ({
            url: ARCGISONLINE_URI + 'World_Street_Map/MapServer/Tile/{z}/{y}/{x}',
          }),
          zIndex: 0,
          minResolution: 0.25,
          crossOrigin: 'anonymous',
        }),
        // new TileLayer({
        //   title: 'Esri Satellite',
        //   type: 'base',
        //   base_name: 'esri_satellite',
        //   source: new Stamen({
        //     layer: 'toner',
        //   }),
        //   zIndex: 0,
        //   minResolution: 0.25,
        //   crossOrigin: 'anonymous',
        // }),
      ],
      interactions: defaults({
        doubleClickZoom: false,
      }),
      logo: false,
      view: new View({
        center: [0, 0],
        zoom: 3,
      }),
    });
  }

  centerMapEpsg4326(lng, lat, zoom) {
    const format = new WKT();
    this.map.getView().setCenter(transform(format.readGeometry(`Point(${lng} ${lat})`).getCoordinates(), 'EPSG:4326', 'EPSG:3857'));
    this.map.getView().setZoom(zoom);
  }

  exportMap() {
    this.map.once('rendercomplete', (event) => {
      const canvas = event.context.canvas;
      if (navigator.msSaveBlob) {
        navigator.msSaveBlob(canvas.msToBlob(), 'map.png');
      } else {
        canvas.toBlob((blob) => {
          saveAs(blob, 'map.png');
        });
      }
    });
    this.map.renderSync();
  }

  getMap() {
    return this.map;
  }
}

export default DefaultMap;
