import React from 'react';
import AsyncSelect from 'react-select/lib/Async';
import { Button, Row, Col, ListGroup, Card, Form, Container, Table, Modal } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import GeoJSON from 'ol/format/GeoJSON';
import { faExclamationTriangle, faCheckCircle, faQuestionCircle } from '@fortawesome/free-solid-svg-icons';
import { jsonRequest } from '../../js/common';
import { global } from '../../config';
import Collection from 'ol/Collection';
import DefaultMap from '../map/defaultMap';

const geoJson = new GeoJSON();

class SpanList extends React.Component {

  constructor(props) {
    super(props);
    this.mounted = false;
    this.child = null;
    this.state = {
      loading: false,
      editing: false,
      showModal: false,
      modalStatus: 'active',
      modalName: '',
      modalOwner: '',
      modalLocationA: null,
      modalLocationB: null,
      spans: [],
      pulledLocations: [],
    };

    this.feature = null;
    this.attributeTable = new Collection();
    this.map = new DefaultMap();
    this.toggleModal = this.toggleModal.bind(this);
    this.pushGeoPointFeature = this.pushGeoPointFeature.bind(this);
    this.setText = this.setText.bind(this);
    this.addSpan = this.addSpan.bind(this);
    this.editNode = this.editNode.bind(this);
    this.editNodeAction = this.editNodeAction.bind(this);
    this.deleteNodeAction = this.deleteNodeAction.bind(this);
    this.getLocationsA = this.getLocationsA.bind(this);
    this.getLocationsB = this.getLocationsB.bind(this);
    this.setLocationA = this.setLocationA.bind(this);
    this.setLocationB = this.setLocationB.bind(this);

    document.title = global.header.siteTitleAbv + ' :: DWDM Spans';
  }

  componentDidMount() {
    this.grabList();
  }

  async grabList() {
    const result = await jsonRequest(`${global.apiServer}/v1/spans/get-spans`, 'get', {});
    this.setState({
      spans: result.data,
    });
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
          modalName: '',
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

  async addSpan() {
    const {
      modalName,
      modalOwner,
      modalStatus,
      modalLocationA,
      modalLocationB,
    } = this.state;


    try {
      let feature = null

      this.attributeTable.forEach(arr => feature = arr);

      const result = await jsonRequest(`${global.apiServer}/v1/spans/add-span`, 'post', {
        name: modalName,
        owner: modalOwner,
        status: modalStatus === 'active' ? true : false,
        locationa: modalLocationA.value,
        locationb: modalLocationB.value,
      });

      this.setState({
        modalName: '',
        modalStatus: 'active',
        showModal: false,
      }, () => {
        this.attributeTable.clear();
        this.grabList();
      })
    } catch (error) {
      console.error(error);
    }
  }

  async editNode(id) {
    try {
      const result = await jsonRequest(`${global.apiServer}/v1/spans/get-span/${id}`, 'get', {});
      // const format = new WKT();
      // const feature = new Feature({
      //   geometry: new Point(transform(format.readGeometry(`Point(${result.data.geom.coordinates[0]} ${result.data.geom.coordinates[1]})`).getCoordinates(), 'EPSG:4326', 'EPSG:3857')),
      //   name: 'Edit Node',
      //   label: 'Edit Node',
      // });
      // const featureTimeStamp = (new Date).getTime();
      // feature.setId(featureTimeStamp);
      // this.feature = feature;

      const nodes = await jsonRequest(`${global.apiServer}/v1/nodes/get-nodes`, 'get', {});
      const locA = nodes.data.filter(node => node.id === result.data.loc_a);
      const locB = nodes.data.filter(node => node.id === result.data.loc_b);

      this.setState({
        editing: id,
      }, () => {
        this.setState({
          modalName: result.data.name,
          modalOwner: result.data.owner,
          modalLocationA: {label: locA[0].name, value: locA[0].id},
          modalLocationB: {label: locB[0].name, value: locB[0].id},
          modalStatus: result.data.status ? 'active' : 'inactive',
          showModal: true,
        });
      });
    } catch (error) {
      console.error(error);
    }
  }

  async editNodeAction() {
    const {
      modalName,
      modalOwner,
      modalStatus,
      modalLocationA,
      modalLocationB,
      editing,
    } = this.state;


    try {
      let feature = null

      this.attributeTable.forEach(arr => feature = arr);
      // const geom = geoJson.writeGeometryObject(feature.getGeometry(), {
      //   dataProjection: 'EPSG:4326',
      //   featureProjection: 'EPSG:3857',
      // });

      const result = await jsonRequest(`${global.apiServer}/v1/spans/update-span`, 'put', {
        id: editing,
        name: modalName,
        owner: modalOwner,
        status: modalStatus === 'active' ? true : false,
        locationa: modalLocationA.value,
        locationb: modalLocationB.value,
      });

      this.setState({
        name: '',
        owner: '',
        status: 'active',
        locationa: null,
        locationb: null,
        showModal: false,
        editing: false,
      }, () => {
        this.attributeTable.clear();
        this.grabList();
      })
    } catch (error) {
      console.error(error);
    }
  }

  async deleteNodeAction() {
    const {
      editing,
    } = this.state;


    try {
      const result = await jsonRequest(`${global.apiServer}/v1/spans/del-span/${editing}`, 'delete', {});

      this.setState({
        modalName: '',
        modalStatus: 'active',
        showModal: false,
        editing: false,
      }, () => {
        this.attributeTable.clear();
        this.grabList();
      })
    } catch (error) {
      console.error(error);
    }
  }

  async getLocationsA(e) {
    const {
      modalLocationB,
    } = this.state;

    const result = await jsonRequest(`${global.apiServer}/v1/nodes/search-node-filtered`, 'get', {
      name: e,
      exclude: (modalLocationB && modalLocationB.hasOwnProperty('value')) ? modalLocationB.value : '',
    });
    return result.data.map(item => ({label: item.label, value: item.value}));
  }

  async getLocationsB(e) {
    const {
      modalLocationA,
    } = this.state;

    const result = await jsonRequest(`${global.apiServer}/v1/nodes/search-node-filtered`, 'get', {
      name: e,
      exclude: (modalLocationA && modalLocationA.hasOwnProperty('value')) ? modalLocationA.value : '',
    });
    return result.data.map(item => ({label: item.label, value: item.value}));
  }

  async setLocationA(e) {
    this.setState({
      modalLocationA: e,
    })
  }

  async setLocationB(e) {
    this.setState({
      modalLocationB: e,
    })
  }

  render() {
    const {
      loading,
      editing,
      showModal,
      modalName,
      modalOwner,
      modalLocationA,
      modalLocationB,
      modalStatus,
      spans,
    } = this.state;


    return (
      <Container>
        <Button variant="success" onClick={this.toggleModal}>Add Span</Button>
        <Row>
          <Col lg="12">
            <Table striped>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Loc A</th>
                  <th>Loc B</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {spans.map((node, nodeIdx) => (
                  <tr key={'node-' + nodeIdx}>
                    <td>{node.id}</td>
                    <td>{node.name}</td>
                    <td>{node.loc_a}</td>
                    <td>{node.loc_b}</td>
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
            <Modal.Title>Add/Edit Span</Modal.Title>
          </Modal.Header>
          <Modal.Body>

            <Form>
              <Form.Group>
                <Form.Label>Name</Form.Label>
                <Form.Control type="text" placeholder="Enter Name" name="modalName" value={modalName} onChange={this.setText} />
              </Form.Group>

              <Form.Group>
                <Form.Label>Owner</Form.Label>
                <Form.Control type="text" placeholder="Enter Owner" name="modalOwner" value={modalOwner} onChange={this.setText} />
              </Form.Group>

              <Form.Group>
                <Form.Label>Location A</Form.Label>
                <AsyncSelect
                  loadOptions={this.getLocationsA}
                  onChange={this.setLocationA}
                  value={modalLocationA}
                  isDisabled={loading} 
                />
              </Form.Group>

              <Form.Group>
                <Form.Label>Location B</Form.Label>
                <AsyncSelect
                  loadOptions={this.getLocationsB}
                  onChange={this.setLocationB}
                  value={modalLocationB}
                  isDisabled={loading || !modalLocationA} 
                />
              </Form.Group>

              <Form.Group>
                <Form.Label>Status</Form.Label>
                <Form.Control as="select" value={modalStatus} name="modalStatus" onChange={this.setText}>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </Form.Control>
              </Form.Group>
            </Form>

            {/* <AddNodeMap map={this.map} editing={editing} editFeature={this.feature} attributeTable={this.attributeTable} pushGeoPointFeature={this.pushGeoPointFeature} onRef={ref => (this.child = ref)}/> */}

          </Modal.Body>
          <Modal.Footer>
            { editing ? (
              <span>
                <Button variant="danger" onClick={this.deleteNodeAction} disabled={loading} style={{float: 'left'}}>
                  Delete Node
                </Button>
                &nbsp;
                <Button variant="warning" onClick={this.editNodeAction} disabled={loading || modalName.length < 1 || !modalLocationA || !modalLocationB}>
                  Update Node
                </Button>
              </span>
            ):(
              <Button variant="primary" onClick={this.addSpan} disabled={loading || modalName.length < 1 || !modalLocationA || !modalLocationB}>
                Add Span
              </Button>
            )}

          </Modal.Footer>
        </Modal>
      </Container>
    );
  }
}

export default SpanList;
