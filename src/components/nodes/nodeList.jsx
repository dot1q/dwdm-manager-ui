import React from 'react';
import { Button, Row, Col, ListGroup, Card, Form, Container, Table, Modal } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import GeoJSON from 'ol/format/GeoJSON';
import { transform, fromLonLat } from 'ol/proj';
import WKT from 'ol/format/WKT';
import { faExclamationTriangle, faCheckCircle, faQuestionCircle } from '@fortawesome/free-solid-svg-icons';
import { jsonRequest } from '../../js/common';
import { global } from '../../config';
import AddNodeMap from '../map/addNodeMap';
import Collection from 'ol/Collection';
import DefaultMap from '../map/defaultMap';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';

const geoJson = new GeoJSON();

class NodeList extends React.Component {

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
      nodes: [],

    };

    this.feature = null;
    this.attributeTable = new Collection();
    this.map = new DefaultMap();
    this.toggleModal = this.toggleModal.bind(this);
    this.pushGeoPointFeature = this.pushGeoPointFeature.bind(this);
    this.setText = this.setText.bind(this);
    this.addNode = this.addNode.bind(this);
    this.editNode = this.editNode.bind(this);
    this.editNodeAction = this.editNodeAction.bind(this);
    this.deleteNodeAction = this.deleteNodeAction.bind(this);

  }

  componentDidMount() {
    this.grabList();
  }

  async grabList() {
    const result = await jsonRequest(`${global.apiServer}/v1/nodes/get-nodes`, 'get', {});
    this.setState({
      nodes: result.data,
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

  async addNode() {
    const {
      modalName,
      modalStatus,
    } = this.state;


    try {
      let feature = null

      this.attributeTable.forEach(arr => feature = arr);
      const geom = geoJson.writeGeometryObject(feature.getGeometry(), {
        dataProjection: 'EPSG:4326',
        featureProjection: 'EPSG:3857',
      });

      console.log(modalName, modalStatus, geom);
      const result = await jsonRequest(`${global.apiServer}/v1/nodes/add-node`, 'post', {
        name: modalName,
        status: modalStatus === 'active' ? true : false,
        geom
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
      const result = await jsonRequest(`${global.apiServer}/v1/nodes/get-node/${id}`, 'get', {});
      console.log(result);
      const format = new WKT();
      const feature = new Feature({
        geometry: new Point(transform(format.readGeometry(`Point(${result.data.geom.coordinates[0]} ${result.data.geom.coordinates[1]})`).getCoordinates(), 'EPSG:4326', 'EPSG:3857')),
        name: 'Edit Node',
        label: 'Edit Node',
      });
      
      const featureTimeStamp = (new Date).getTime();
      feature.setId(featureTimeStamp);

      this.feature = feature;

      this.setState({
        editing: id,
      }, () => {
        this.setState({
          modalName: result.data.name,
          modalStatus: result.data.status ? 'active' : 'inactive',
          showModal: true,
        });
      });
    } catch (error) {

    }
  }

  async editNodeAction() {
    const {
      modalName,
      modalStatus,
      editing,
    } = this.state;


    try {
      let feature = null

      this.attributeTable.forEach(arr => feature = arr);
      const geom = geoJson.writeGeometryObject(feature.getGeometry(), {
        dataProjection: 'EPSG:4326',
        featureProjection: 'EPSG:3857',
      });

      console.log(modalName, modalStatus, geom);
      const result = await jsonRequest(`${global.apiServer}/v1/nodes/update-node`, 'put', {
        id: editing,
        name: modalName,
        status: modalStatus === 'active' ? true : false,
        geom
      });

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

  async deleteNodeAction() {
    const {
      editing,
    } = this.state;


    try {
      const result = await jsonRequest(`${global.apiServer}/v1/nodes/del-node/${editing}`, 'delete', {});

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

  render() {
    const {
      loading,
      editing,
      showModal,
      modalName,
      modalStatus,
      nodes,
    } = this.state;


    return (
      <Container>
        <Button variant="success" onClick={this.toggleModal}>Add Node</Button>
        <Row>
          <Col lg="12">
            <Table striped>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {nodes.map((node, nodeIdx) => (
                  <tr key={'node-' + nodeIdx}>
                    <td>{node.id}</td>
                    <td>{node.name}</td>
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
            <Modal.Title>Add/Edit Node</Modal.Title>
          </Modal.Header>
          <Modal.Body>

            <Form>
              <Form.Group>
                <Form.Label>Name</Form.Label>
                <Form.Control type="text" placeholder="Enter email" name="modalName" value={modalName} onChange={this.setText} />
              </Form.Group>

              <Form.Group>
                <Form.Label>Status</Form.Label>
                <Form.Control as="select" value={modalStatus} name="modalStatus" onChange={this.setText}>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </Form.Control>
              </Form.Group>
            </Form>

            <AddNodeMap map={this.map} editing={editing} editFeature={this.feature} attributeTable={this.attributeTable} pushGeoPointFeature={this.pushGeoPointFeature} onRef={ref => (this.child = ref)}/>

          </Modal.Body>
          <Modal.Footer>
            { editing ? (
              <span>
                <Button variant="danger" onClick={this.deleteNodeAction} disabled={loading} style={{float: 'left'}}>
                  Delete Node
                </Button>
                &nbsp;
                <Button variant="warning" onClick={this.editNodeAction} disabled={loading || modalName.length < 1 || this.attributeTable.getLength() < 1}>
                  Update Node
                </Button>
              </span>
            ):(
              <Button variant="primary" onClick={this.addNode} disabled={loading || modalName.length < 1 || this.attributeTable.getLength() < 1}>
                Add Node
              </Button>
            )}

          </Modal.Footer>
        </Modal>
      </Container>
    );
  }
}

export default NodeList;
