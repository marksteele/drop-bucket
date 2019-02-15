import { withAuthenticator } from 'aws-amplify-react';
import React, { Component, Fragment } from "react";
import { Auth } from "aws-amplify";
import { Link } from "react-router-dom";
import { Nav, Navbar, NavItem } from "react-bootstrap";
import Routes from "./Routes";
import "./App.css";

class App extends Component {

  handleLogout = async event => {
    await Auth.signOut();
  }

  render() {
    return (
      <div className="App container">
        <Navbar fluid collapseOnSelect>
          <Navbar.Header>
            <Navbar.Brand><Link to="/">
              <img alt="" src="favicon.ico" style={{display: 'inline'}}/>{' DropBucket'}</Link>
            </Navbar.Brand>
            <Navbar.Toggle />
          </Navbar.Header>
          <Navbar.Collapse>
            <Nav pullRight>
                 <Fragment>
                    <NavItem onClick={this.handleLogout}>Logout</NavItem>
                  </Fragment>
            </Nav>
          </Navbar.Collapse>
        
        <Routes />
        </Navbar>
        <Navbar fixed="bottom" bg="dark">
        <Navbar.Brand>{"\u00a9"} 2019 - Mark Steele </Navbar.Brand>
      </Navbar>
      </div>
    );
  }
}

export default withAuthenticator(App);
