import React from 'react';
import {Link} from 'react-router-dom';
import { Navbar, Nav, NavDropdown, Container } from 'react-bootstrap';
import { global } from '../../config';
import { UserContext } from '../context/global';

class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      userData: {},
      headerTitle: global.header.siteTitle,
    };
  }

  render() {
    const {
      userData,
      headerTitle,
    } = this.state;

    return (
      <div className="wrapper">
        <UserContext.Provider value={userData}>
          <React.Fragment>
            <Navbar className="bg-white" expand="lg">
              <Container>
                <Navbar.Brand>
                  <Link to="/">
                    <img src="../../assets/img/brand.svg" className="navbar-brand-img" alt="..." />
                  </Link>
                </Navbar.Brand>
                <Navbar.Toggle aria-controls="navbarCollapse" />

                <Navbar.Collapse id="navbarCollapse">

                  <Navbar.Toggle aria-controls="navbarCollapse">
                    <i className="fe fe-x"></i>
                  </Navbar.Toggle>

                  <Nav className="ml-auto">

                  </Nav>

                  <Link className="navbar-btn btn btn-sm btn-primary lift ml-auto" to="/spans/circuit-search">
                    Circuit Search
                  </Link>

                </Navbar.Collapse>

              </Container>
            </Navbar>
            <div id="page-wrapper" className="content-wrapper" onClick={this.clickContentWrapper}>
              {this.props.children}
            </div>
          </React.Fragment>

        </UserContext.Provider>
      </div>
    );
  }
}

export { App };
