import React from 'react';
import { Link } from 'react-router-dom';
import { Button, Row, Col, Form, Card, Spinner, Container, Table } from 'react-bootstrap';
import AlarmAlert from '../common/alerts';
import CrewTodoMap from './map/crewTodoMap';

class PgeOutages extends React.Component {
  constructor(props) {
    super(props);
    this.mounted = false;
    this.state = {
      loading: false,
      alertVariant: null,
      alertMessage: null,
    };
  }

  componentDidMount() {}

  setAlert(alertMessage, alertVariant) {
    this.setState({
      alertVariant,
      alertMessage,
    });
  }

  render() {
    const {
      loading,
    } = this.state;
    
    return (
      <div className="min-vh-100-minus-header" style={{ minWidth: '100%'}}>
        <div style={{
          position: 'absolute',
          height: 'calc(100% - 50px)',
          width: '100%',
        }}>
          <Col lg="12" style={{
            position: 'absolute',
            top: '0px',
            overflow: 'auto',
            width: '100%',
            height: 'calc(100% - 130px)',
          }}>
            <CrewTodoMap/>
          </Col>
        </div>
      </div>
    );
  }
}

export default PgeOutages;
