import { withAuthenticator } from 'aws-amplify-react';
import React, { Component, Fragment } from "react";
import { Auth } from "aws-amplify";
import { Link } from "react-router-dom";
import { Nav, Navbar, NavItem } from "react-bootstrap";
import Routes from "./Routes";
import { ToastContainer } from 'react-toastify';

import 'react-toastify/dist/ReactToastify.min.css';

import "./App.css";

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loggedInUser: {}
    };
  }
  handleLogout = async event => {
    await Auth.signOut();
  }

  async componentDidMount() {
    try {
      const user = await Auth.currentUserInfo();
      this.setState({loggedInUser: user});
    } catch (e) {
      console.log(e);
    }
  }


  render() {
    return (
      <>
      <div className="App container">
      <ToastContainer />
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
                    <NavItem onClick={this.handleLogout}>Logout {this.state.loggedInUser.attributes ? this.state.loggedInUser.attributes.email : ''}</NavItem>
                  </Fragment>
            </Nav>
          </Navbar.Collapse>
        
        <Routes />
        </Navbar>
        <Navbar fixed="bottom" bg="dark">
        <Navbar.Brand><a href="https://www.control-alt-del.org">{"\u00a9"} 2019 - Mark Steele</a></Navbar.Brand>
      </Navbar>
      </div>
      </>
    );
  }
}

export default withAuthenticator(App, { signUpConfig: {
  hideAllDefaults: true,
  signUpFields: [
    {
      label:"Email",
      key:"username",
      required: true,
      displayOrder: 1,
      type: 'email',
      custom: false
    },
    {
      label:"Password",
      key:"password",
      required: true,
      displayOrder: 2,
      type: 'password',
      custom: false
    }
  ]
}});
