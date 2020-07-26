import React from 'react';
import { Home } from './views/Home';
import { About } from './views/About';
import {Register} from "./views/Register";
import { Route, Switch, Redirect } from 'react-router-dom';

import Navbar from "react-bootstrap/Navbar";
import Nav from "react-bootstrap/Nav";
import logo from './nestle.svg'

export const Routes = () => {
  return (
    <div>
        <Navbar collapseOnSelect expand="lg" bg="dark" variant="light">
            <Navbar.Brand><img src={logo} height="30" /></Navbar.Brand>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav">
                <Nav activeKey={window.location.pathname} className="mr-auto">
                    <Nav.Link href="/">Home</Nav.Link>
                    <Nav.Link href="/About">About</Nav.Link>
                    <Nav.Link href="/Register">Register</Nav.Link>
                </Nav>
            </Navbar.Collapse>
        </Navbar>
          <Switch>
            <Route exact path="/" component={Home} />
            <Route exact path="/About" component={About} />
            <Route exact path="/Register" component={Register} />
          </Switch>
    </div>
  );
};
