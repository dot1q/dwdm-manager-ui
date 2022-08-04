if (process.env.NODE_ENV !== 'production') {
  console.log('**** Development mode enabled ****');
}

const global = {
  header: {
    siteTitleAbv: 'GB',
    siteTitle: 'Greg Brewster',
    version: '0.0.0.1',
  },
  apiServer: 'http://localhost:3000',
  map: {
    default3857: [
      -13611786.54,
      5683213.89,
    ],
    defaultZoom: 12,
  },
  defaultCoords: [-13647410.187159823, 5705063.217222869],
};

export { global };
