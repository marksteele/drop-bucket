import React, { Component } from "react";
import { API } from "aws-amplify";
import { Link } from "react-router-dom";
import { LinkContainer } from "react-router-bootstrap";
import { PageHeader, ListGroup, ListGroupItem } from "react-bootstrap";
import {CopyToClipboard} from 'react-copy-to-clipboard';
//import { listFiles } from "../libs/awsLib";
import { deleteFile } from "../libs/awsLib";

import "./Home.css";

//window.LOG_LEVEL = 'DEBUG';

export default class Home extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isLoading: true,
      files: []
    };
  }

  async componentDidMount() {
    if (!this.props.isAuthenticated) {
      return;
    }

    try {
      const files = await this.files();
      this.setState({ files });
    } catch (e) {
      alert(e);
    }

    this.setState({ isLoading: false });
  }

  files() {
    //return listFiles();
    return API.get("files", "/");
  }

  refresh = async () => {
    this.setState({
      isLoading: true,
      files: []
    });
    try {
      const files = await this.files();
      this.setState({ files });
    } catch (e) {
      alert(e);
    }
    this.setState({ isLoading: false });
  };

  delete(file) {
    deleteFile(file);
    this.setState(
      {
        files: this.state.files.filter((f) => { 
          return f.Key !== file
        })
      }
    );
  }

  renderFilesList(files) {
    return [{}].concat(files).map(
      (file, i) =>
        i !== 0
          ?
              <ListGroupItem key={i}>
                {`File name:  ${file.Key}`}<br/>
                {`Virus scan status: ${file.Tags.virusScanStatus || 'UKNOWN'}`}<br/>
                {`Last modified: ${file.LastModified}`}<br/>
                {`Size: ${file.Size}`}<br/>
                <button onClick={ this.delete.bind(this, file.Key) }>Delete</button>
                {file.Tags.virusScanStatus === 'CLEAN' ? (<span>
                <a href={file.Url} target='_new'><button>Download</button></a> 
                <CopyToClipboard text={file.Url}><button>Copy sharing link</button></CopyToClipboard></span>
                ) : (<span></span>)}
              </ListGroupItem>
          : <LinkContainer
              key="new"
              to="/files/new"
            >
              <ListGroupItem>
                <h4>
                  <b>{"\uFF0B"}</b> Create a new file
                </h4>
              </ListGroupItem>
            </LinkContainer>
    );
  }

  renderLander() {
    return (
      <div className="lander">
        <h1>DropBucket</h1>
        <p>A simple file sharing app</p>
        <div>
          <Link to="/login" className="btn btn-info btn-lg">
            Login
          </Link>
          <Link to="/signup" className="btn btn-success btn-lg">
            Signup
          </Link>
        </div>
      </div>
    );
  }

  renderFiles() {
    return (
      <div className="files">
        <PageHeader>Your Files <button onClick={this.refresh}>&#x21bb;</button></PageHeader>
        <div>Note: files auto-delete after 7 days. Links expire after 7 days.</div>
        <ListGroup>
          {!this.state.isLoading && this.renderFilesList(this.state.files)}
        </ListGroup>
      </div>
    );
  }

  render() {
    return (
      <div className="Home">
        {this.props.isAuthenticated ? this.renderFiles() : this.renderLander()}
      </div>
    );
  }
}
