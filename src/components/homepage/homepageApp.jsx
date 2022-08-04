import React from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col } from 'react-bootstrap';
import { App } from '../navigation/nav';
import { global } from '../../config';


const MODULE_PREFIX = '/';


class Homepage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      modulePrefix: MODULE_PREFIX,
    };

    document.title = global.header.siteTitleAbv + ' :: Homepage';
  }

  render() {
    const { modulePrefix, nav } = this.state;

    return (
      <App nav={nav}>
        <Container>
          <Row>
            <h1>Homepage</h1>
          </Row>
          <Row>
            <Col lg="6">
              <h2>
                Node Management
              </h2>
              <ul>
                <li>
                  <Link to="/nodes/list">View and Edit Nodes</Link>
                </li>

              </ul>
            </Col>
            <Col lg="6">
              <h2>
                Maps?
              </h2>
              <ul>
                <li>
                  <Link to="/nodes/map">Node Map</Link>
                </li>
                <li>
                  <Link to="/office/pge-outages">PGE Power Outages</Link>
                </li>
              </ul>
            </Col>
          </Row>
          <Row>
            <Col lg="6">
              <h2>
                Spans/Links
              </h2>
              <ul>
                <li>
                  <Link to="/spans/list">View and Edit Spans</Link>
                </li>
                <li>
                  <Link to="/spans/wavelengths">View and Edit Wavelengths</Link>
                </li>
              </ul>
            </Col>
            <Col lg="6">
              <h2>
                Circuit Search
              </h2>
              <ul>
                <li>
                  <Link to="/spans/circuit-search">Search by Circuit Spans</Link>
                </li>
              </ul>
            </Col>
          </Row>
        </Container>
      </App>
    );
  }
}

export default Homepage;
