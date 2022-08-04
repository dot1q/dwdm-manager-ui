import React from 'react';
import { Button, Row, Col, ListGroup, Card, Form, Container, Table, Modal } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import GeoJSON from 'ol/format/GeoJSON';
import AsyncSelect from 'react-select/lib/Async';
import WKT from 'ol/format/WKT';
import { faExclamationTriangle, faCheckCircle, faQuestionCircle } from '@fortawesome/free-solid-svg-icons';
import { jsonRequest } from '../../js/common';
import { global } from '../../config';
import Collection from 'ol/Collection';
import DefaultMap from '../map/defaultMap';

import ViewCircuitMap from '../map/viewCircuitMap';

const geoJson = new GeoJSON();

class CircuitSearch extends React.Component {

  constructor(props) {
    super(props);
    this.mounted = false;
    this.child = null;
    this.state = {
      loading: false,
      circuitId: null,

      id: '',
      customer: '',
      status: '',
      tableDataFiltered: [],
      spans: [],
      nodes: [],

    };

    this.feature = null;
    this.attributeTable = new Collection();
    this.map = new DefaultMap();
    this.setText = this.setText.bind(this);
    this.getCircuits = this.getCircuits.bind(this);
    this.setCircuitId = this.setCircuitId.bind(this);
  }

  componentDidMount() {

  }

  async getCircuits(e) {
    const result = await jsonRequest(`${global.apiServer}/v1/wavelength/search-circuits`, 'get', {
      id: e,
    });
    return result.data.map(item => ({label: item.circuit_id, value: item.id}));
  }

  async selectCircuit() {
    const {
      circuitId,
    } = this.state;

    // get circuit record and wavelengths
    const circuitRecord = await jsonRequest(`${global.apiServer}/v1/wavelength/get-wavelength/${circuitId.value}`, 'get', {});
    const circuitWaveLengthDetail = await jsonRequest(`${global.apiServer}/v1/wavelength/get-wavelength-span-joins/${circuitId.value}`, 'get', {});
    const cwld = circuitWaveLengthDetail.data.tableData;

    cwld.forEach(wave => {
      if (wave.loc_a > wave.loc_b) {
        const a_id = wave.loc_a;
        const a_name = wave.loc_a_name;
        wave.loc_a = wave.loc_b;
        wave.loc_b = a_id;
        wave.loc_a_name = wave.loc_b_name;
        wave.loc_b_name = a_name;
      }
    });

    const compare = (a, b) => {
      if (a.loc_b === b.loc_a) {
        return -1;
      }

      if (a.loc_a === b.loc_b) {
        return 1;
      }
    };

    // console.log(cwld);
    // console.log(cwld.sort(compare));



    this.setState({
      id: circuitRecord.data.circuit_id,
      customer: circuitRecord.data.customer,
      status: circuitRecord.data.status,
      tableDataFiltered: cwld,
    });
  }



  setText(e) {
    const { name, value } = e.target;
    this.setState({
      [name]: value,
    });
  }

  setCircuitId(e) {
    this.setState({
      circuitId: null,
    }, () => {
      this.setState({
        circuitId: e,
      }, () => {
        this.selectCircuit();
      });
    });
  }

  render() {
    const {
      loading,
      nodes,
      circuitId,
      id,
      status,
      customer,
      tableDataFiltered,
    } = this.state;

    const header = {};
    {tableDataFiltered.forEach(item => {
      if(header.hasOwnProperty(item.loc_a)){
        header[item.loc_a].count++;
      } else {
        header[item.loc_a] = {label: item.loc_a_name, count: 1};
      }

      if(header.hasOwnProperty(item.loc_b)){
        header[item.loc_b].count++;
      } else {
        header[item.loc_b] = {label: item.loc_b_name, count: 1};
      }
    })}

    const spans = {};


    return (
      <Container>
        <Row>
          <Col lg="6">
            <Form.Group>
              <Form.Label>Select Circuit</Form.Label>
              <AsyncSelect
                loadOptions={this.getCircuits}
                onChange={this.setCircuitId}
                value={circuitId}
                isDisabled={loading} 
              />
            </Form.Group>
          </Col>
        </Row>
        {circuitId && (
          <div>

            <Row>
              <Col lg="4">
                <label>Circuit ID</label>
                <p>{id}</p>
              </Col>
              <Col lg="4">
                <label>Customer</label>
                <p>{customer}</p>
              </Col>
              <Col lg="4">
                <label>Status</label>
                <p>{status ? 'Active' : 'Inactive'}</p>
              </Col>
            </Row>

            <Row>
              <Col lg="12">
                <h2>Map</h2>
                <ViewCircuitMap id={circuitId.value} />
              </Col>
            </Row>
            <br />
            <br />
            
            <Row>
              <Col lg="12">
                <h2>Experimental Table</h2>
                <Table striped bordered hover resonsive size="sm" style={{textAlign: 'center'}}>
                  <thead>
                    <tr>
                      {[...Array(tableDataFiltered.length*2)].map((e, i) => <th key={"col-id-" + i}>Node Side</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      {Object.keys(header).map((key, index) => {
                        return (
                          <th colSpan={header[key].count} key={`node-id-${index}`}>{header[key].label}</th>
                        );
                      })}
                    </tr>
                    <tr>
                      {tableDataFiltered.map((span, spanIdx) => (
                        <td colSpan={2} key={`span-id-${spanIdx}`}>{span.name}</td>
                      ))}
                    </tr>
                    <tr>
                      {[...Array(tableDataFiltered.length*2)].map((e, i) => <th key={"col-id-" + i}>{((i+1) % 2 == 0) ? 'LOC B' : 'LOC A'}</th>)}
                    </tr>
                    <tr>
                      {tableDataFiltered.map((wave, waveChIdx) => (
                        <td colSpan={2} key={`wave-id-${waveChIdx}`}>{"CH. " + wave.channel}</td>
                      ))}
                    </tr>
                  </tbody>
                </Table>
              </Col>
            </Row>
          </div>
        )}

      </Container>
    );
  }
}

export default CircuitSearch;
