import React, { Suspense, lazy } from 'react';
import { render } from 'react-dom';
import AOS from 'aos';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import LoadingScreen from './components/initalLoad/loading';
// import 'bootstrap/dist/css/bootstrap.min.css';
import './assets/fonts/Feather/feather.css';
import './assets/css/theme.css';
import 'aos/dist/aos.css';



import * as HttpStatuses from './components/errorMessages/httpStatus';
import * as ErrPages from './components/errorMessages/errPages';

// Common libraries
import { global } from './config';

// Modules
const Homepage = lazy(() => import('./components/homepage/homepageApp'));
const Office = lazy(() => import('./components/office/officeApp'));
const Nodes = lazy(() => import('./components/nodes/nodesApp'));
const Spans = lazy(() => import('./components/spans/spanApp'));
AOS.init();

document.title = global.header.siteTitleAbv + ' :: Landing Page';

const PrivateRoute = ({ component: Component, ...rest }) => {
  return (
    <Route
      {...rest}
      render={props => <Component {...props} />
      }
    />
  );
};

const CsrRouter = () => (
  <Router>
    <Suspense fallback={LoadingScreen}>
      <Switch>
        <PrivateRoute path="/office" component={Office} />
        <PrivateRoute path="/nodes" component={Nodes} />
        <PrivateRoute path="/spans" component={Spans} />
        <PrivateRoute exact path="/" component={Homepage} />

        <Route path="/lockout" component={ErrPages.lockout} />
        <Route path="/blockedip" component={ErrPages.blockedip} />
        <Route path="/denied" component={ErrPages.denied} />
        <Route path="/incompatible" component={ErrPages.incompatible} />
        <Route path="/400" component={HttpStatuses.status400} />
        <Route path="/401" component={HttpStatuses.status401} />
        <Route path="/403" component={HttpStatuses.status403} />
        <Route path="/404" component={HttpStatuses.status404} />
        <Route path="/500" component={HttpStatuses.status500} />
        <Route component={HttpStatuses.status404} />
      </Switch>
    </Suspense>
  </Router>
);

render(
  <CsrRouter />,
  document.getElementById('app'),
);
