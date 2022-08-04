import React from 'react';
import Select from 'react-select';
import AsyncSelect from 'react-select/lib/Async';
import { Button, Row, Col, ListGroup, Card, Form, Container, Table, Modal } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import GeoJSON from 'ol/format/GeoJSON';
import { faExclamationTriangle, faCheckCircle, faQuestionCircle } from '@fortawesome/free-solid-svg-icons';
import { jsonRequest } from '../../js/common';
import { global } from '../../config';
import Collection from 'ol/Collection';
import DefaultMap from '../map/defaultMap';
import GenericAlert from '../common/alerts';

const geoJson = new GeoJSON();

class WavelengthList extends React.Component {

  constructor(props) {
    super(props);
    this.mounted = false;
    this.child = null;
    this.state = {
      errType: null,
      errMsg: null,
      errModalMsg: null,
      errModalType: null,
      loading: false,
      editing: false,
      showModal: false,
      modalStatus: 'active',
      modalCustomer: '',
      modalCircuitId: '',
      modalChannel: null,
      modalSpanSelect: null,
      spans: [],
      channelSpanTable: [],
    };

    this.channels = [{
      label: 'CH 20',
      value: 20
    },{
      label: 'CH 21',
      value: 21
    },{
      label: 'CH 22',
      value: 22
    },{
      label: 'CH 23',
      value: 23
    },{
      label: 'CH 24',
      value: 24
    },{
      label: 'CH 25',
      value: 25
    },{
      label: 'CH 26',
      value: 26
    },{
      label: 'CH 27',
      value: 27
    },{
      label: 'CH 28',
      value: 28
    }];

    this.feature = null;
    this.attributeTable = new Collection();
    this.map = new DefaultMap();
    this.toggleModal = this.toggleModal.bind(this);
    this.pushGeoPointFeature = this.pushGeoPointFeature.bind(this);
    this.setText = this.setText.bind(this);
    this.addWavelength = this.addWavelength.bind(this);
    this.editNode = this.editNode.bind(this);
    this.editNodeAction = this.editNodeAction.bind(this);
    this.deleteNodeAction = this.deleteNodeAction.bind(this);
    this.getSpans = this.getSpans.bind(this);
    this.setSpan = this.setSpan.bind(this);
    this.setChannel = this.setChannel.bind(this);
    this.addToTable = this.addToTable.bind(this);

    document.title = global.header.siteTitleAbv + ' :: DWDM Wavelengths';
  }

  componentDidMount() {
    this.grabList();
  }

  setAlert(errType, errMsg) {
    this.setState({
      errMsg,
      errType,
    });
  }

  setModalAlert(errModalType, errModalMsg) {
    this.setState({
      errModalMsg,
      errModalType,
    });
  }

  async grabList() {
    try {
      const result = await jsonRequest(`${global.apiServer}/v1/wavelength/get-wavelengths`, 'get', {});
      this.setState({
        spans: result.data,
      });
    } catch (error) {
      this.setAlert('danger', error);
    }
  }

  pushGeoPointFeature(feature) {
    console.log(feature);
    const attributeMap = this.attributeTable.getArray().map(x => x.getId());
    if (!attributeMap.includes(feature.getId())) {
      this.attributeTable.push(feature);
    }
    this.forceUpdate();
  }

  toggleModal() {
    const {
      showModal,
    } = this.state;

    this.setState({
      showModal: !showModal
    }, () => {
      if (showModal) {
        this.setState({
          modalCustomer: '',
          modalStatus: 'active',
          editing: false,
        });
      }
    });
  }

  setText(e) {
    const { name, value } = e.target;
    this.setState({
      [name]: value,
    });
  }

  async addWavelength() {
    const {
      modalCustomer,
      modalCircuitId,
      modalChannel,
      modalStatus,
      channelSpanTable,
    } = this.state;


    try {
      let feature = null

      this.attributeTable.forEach(arr => feature = arr);

      const result = await jsonRequest(`${global.apiServer}/v1/wavelength/add-wavelength`, 'post', {
        name: modalCustomer,
        circuitId: modalCircuitId,
        status: modalStatus === 'active' ? true : false,
        channels: channelSpanTable,
      });

      this.setState({
        modalCustomer: '',
        modalStatus: 'active',
        modalSpanSelect: null,
        modalChannel: null,
        channelSpanTable: [],
        showModal: false,
      }, () => {
        this.setModalAlert(null, null);
        this.attributeTable.clear();
        this.grabList();
      })
    } catch (error) {
      this.setModalAlert('danger', error);
      console.error(error);
    }
  }

  async editNode(id) {
    try {
      const result = await jsonRequest(`${global.apiServer}/v1/wavelength/get-wavelength/${id}`, 'get', {});
      const resultJoins = await jsonRequest(`${global.apiServer}/v1/wavelength/get-wavelength-joins/${id}`, 'get', {});

      let table = [];

      resultJoins.data.forEach(join => {
        table.push({
          spanId: join.wavelength_span_id,
          spanLabel: join.name,
          channel: join.channel,
        });
      })

      this.setState({
        editing: id,
      }, () => {
        this.setState({
          modalCustomer: result.data.customer,
          modalCircuitId: result.data.circuit_id,
          modalStatus: result.data.status ? 'active' : 'inactive',
          showModal: true,
          modalSpanSelect: null,
          modalChannel: null,
          channelSpanTable: table,
        });
        this.setModalAlert(null, null);
      });
    } catch (error) {
      this.setAlert('danger', error);
      console.error(error);
    }
  }

  async editNodeAction() {
    const {
      modalCustomer,
      modalCircuitId,
      modalStatus,
      editing,
      channelSpanTable
    } = this.state;


    try {
      let feature = null

      this.attributeTable.forEach(arr => feature = arr);

      const result = await jsonRequest(`${global.apiServer}/v1/wavelength/update-wavelength`, 'put', {
        id: editing,
        customer: modalCustomer,
        circuitId: modalCircuitId,
        status: modalStatus === 'active' ? true : false,
        channelSpanTable,
      });

      this.setState({
        name: '',
        owner: '',
        status: 'active',
        showModal: false,
        editing: false,
        modalSpanSelect: null,
        modalChannel: null,
      }, () => {
        this.setModalAlert(null, null);
        this.attributeTable.clear();
        this.grabList();
      })
    } catch (error) {
      this.setModalAlert('danger', error);
      console.error(error);
    }
  }

  async deleteNodeAction() {
    const {
      editing,
    } = this.state;


    try {
      const result = await jsonRequest(`${global.apiServer}/v1/wavelength/del-wavelength/${editing}`, 'delete', {});

      this.setState({
        modalCustomer: '',
        modalStatus: 'active',
        showModal: false,
        editing: false,
      }, () => {
        this.setModalAlert(null, null);
        this.attributeTable.clear();
        this.grabList();
      })
    } catch (error) {
      this.setModalAlert('danger', error);
      console.error(error);
    }
  }

  async getSpans(e) {
    const {
      channelSpanTable,
    } = this.state;

    const exclude = channelSpanTable.map(cst => cst.spanId);

    const result = await jsonRequest(`${global.apiServer}/v1/spans/get-spans-filtered`, 'post', {
      name: e,
      exclude,
    });
    return result.data.map(item => ({label: item.label, value: item.value}));
  }

  async setSpan(e) {
    this.setState({
      modalSpanSelect: e,
    });
  }

  async setChannel(e) {
    this.setState({
      modalChannel: e,
    });
  }

  addToTable() {
    const {
      modalChannel,
      modalSpanSelect,
      channelSpanTable,
    } = this.state;

    channelSpanTable.push({
      spanId: modalSpanSelect.value,
      spanLabel: modalSpanSelect.label,
      channel: modalChannel.value,
    });
    this.setState({
      channelSpanTable,
      modalSpanSelect: null,
      modalChannel: null,
    });
  }

  removeFromTable(id) {
    console.log(id);
    const {
      channelSpanTable
    } = this.state;

    channelSpanTable.splice(id, 1);
    this.setState({
      channelSpanTable,
    });
  }

  render() {
    const {
      errType,
      errMsg,
      errModalMsg,
      errModalType,
      loading,
      editing,
      showModal,
      modalCustomer,
      modalCircuitId,
      modalChannel,
      modalSpanSelect,
      modalStatus,
      spans,
      channelSpanTable,
    } = this.state;


    return (
      <Container>
        <Button variant="success" onClick={this.toggleModal}>Add Wavelength</Button>
        <Row>
          <Col lg="12">
            <GenericAlert variant={errType} message={errMsg} />
            <Table striped>
              <thead>
                <tr>
                  <th>Circuit ID</th>
                  <th>Customer</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {spans.map((node, nodeIdx) => (
                  <tr key={'node-' + nodeIdx}>
                    <td>{node.circuit_id}</td>
                    <td>{node.customer}</td>
                    <td>{node.status === true ? 'Active' : 'Inactive'}</td>
                    <td>
                      <Button variant={"dark"} onClick={() => this.editNode(node.id)} block>Edit</Button>
                    </td>
                  </tr>
                ))}

              </tbody>
            </Table>
          </Col>
        </Row>
        <Modal show={showModal} onHide={this.toggleModal} animation={false}>
          <Modal.Header closeButton>
            <Modal.Title>Add/Edit Wavelength</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <GenericAlert variant={errModalType} message={errModalMsg} />
            <Form>
              <Form.Group>
                <Form.Label>Customer</Form.Label>
                <Form.Control type="text" placeholder="Enter Name" name="modalCustomer" value={modalCustomer} onChange={this.setText} />
              </Form.Group>

              <Form.Group>
                <Form.Label>Circuit ID</Form.Label>
                <Form.Control type="text" placeholder="Enter Circuit ID" name="modalCircuitId" value={modalCircuitId} onChange={this.setText} />
              </Form.Group>

              <Form.Group>
                <Form.Label>Status</Form.Label>
                <Form.Control as="select" value={modalStatus} name="modalStatus" onChange={this.setText}>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </Form.Control>
              </Form.Group>
            </Form>

            <label>Span/Channels</label>
            <Table striped bordered hover size="sm">
              <thead>
                <tr>
                  <th>Channel</th>
                  <th>Span</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {channelSpanTable.map((item, itemIdx) => (
                  <tr key={`channel-span-table-${itemIdx}`}>
                    <td>{item.channel}</td>
                    <td>{item.spanLabel}</td>
                    <td><Button variant="danger" size="sm" onClick={() => this.removeFromTable(itemIdx)}>Delete</Button></td>
                  </tr>
                ))}

              </tbody>
            </Table>

            <Row>
              <Col lg="6">
                <Form.Group>
                  <Form.Label>Wavelength</Form.Label>
                  <Select
                    options={this.channels}
                    onChange={this.setChannel}
                    value={modalChannel}
                    isDisabled={loading} 
                  />
                </Form.Group>
              </Col>
              <Col lg="6">
                <Form.Group>
                  <Form.Label>Span</Form.Label>
                  <AsyncSelect
                    loadOptions={this.getSpans}
                    onChange={this.setSpan}
                    value={modalSpanSelect}
                    isDisabled={loading} 
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col lg="12">
                <Button variant="primary" onClick={this.addToTable} disabled={loading || modalChannel === null || modalSpanSelect === null}>
                  Add to Table
                </Button>
              </Col>
            </Row>

            {/* <AddNodeMap map={this.map} editing={editing} editFeature={this.feature} attributeTable={this.attributeTable} pushGeoPointFeature={this.pushGeoPointFeature} onRef={ref => (this.child = ref)}/> */}

          </Modal.Body>
          <Modal.Footer>
            { editing ? (
              <span>
                <Button variant="danger" onClick={this.deleteNodeAction} disabled={loading} style={{float: 'left'}}>
                  Delete Wavelength
                </Button>
                &nbsp;
                <Button variant="warning" onClick={this.editNodeAction} disabled={loading || modalCustomer.length < 1 || modalCircuitId.length < 1 || channelSpanTable.length < 1}>
                  Update Wavelength
                </Button>
              </span>
            ):(
              <Button variant="primary" onClick={this.addWavelength} disabled={loading || modalCustomer.length < 1 || modalCircuitId.length < 1 || channelSpanTable.length < 1}>
                Add Wavelength
              </Button>
            )}

          </Modal.Footer>
        </Modal>
      </Container>
    );
  }
}

export default WavelengthList;
