import NodeGeocoder from 'node-geocoder';

const options = {
  provider: 'openstreetmap',
  formatter: null,
  headers: {
    'user-agent': 'tourist-safety-backend/0.1 (contact: email@example.com)'
  }
};

const geocoder = NodeGeocoder(options);
export default geocoder;
