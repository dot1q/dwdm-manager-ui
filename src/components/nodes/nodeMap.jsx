import React from 'react';
import { Button, Row, Col, ListGroup, Card, Form, Container, Table, Modal } from 'react-bootstrap';
import ViewNodeMap from '../map/viewNodeMap';

class NodeMap extends React.Component {

  constructor(props) {
    super(props);
    this.mounted = false;
    this.child = null;
    this.state = {
      loading: false,

    };

  }

  componentDidMount() {

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
        <Row>
          <Col lg="12">
            <ViewNodeMap />
          </Col>
        </Row>

      </Container>
    );
  }
}

export default NodeMap;
