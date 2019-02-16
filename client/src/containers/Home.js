import React, { Component } from "react";
import { API } from "aws-amplify";
import { PageHeader, ListGroup, ListGroupItem } from "react-bootstrap";
import {CopyToClipboard} from 'react-copy-to-clipboard';
import { deleteFile } from "../libs/awsLib";
import { toast } from 'react-toastify';
import NewFile from "./NewFile";

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
    try {
      const files = await this.files();
      this.setState({ files });
    } catch (e) {
      toast.error("💩 - Something went wrong, sorry!", {
        position: toast.POSITION.TOP_CENTER
      });
      console.log(e);
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
      toast.success("File list refreshed!", {
        position: toast.POSITION.TOP_CENTER
      });
    } catch (e) {
      toast.error("💩 - Something went wrong, sorry!", {
        position: toast.POSITION.TOP_CENTER
      });
      console.log(e);
    }
    this.setState({ isLoading: false });
  };

  delete(file) {
    deleteFile(file);
    toast.success("File deleted successfully!", {
      position: toast.POSITION.TOP_CENTER
    });
    this.setState(
      {
        files: this.state.files.filter((f) => { 
          return f.Key !== file
        })
      }
    );
  }

  renderFilesList(files) {
    return files.map(
      (file, i) =>
              <ListGroupItem key={i}>
                {`File name:  ${file.Key}`}<br/>
                {`Virus scan status: ${file.Tags.virusScanStatus || 'UKNOWN'}`}<br/>
                {`Last modified: ${file.LastModified}`}<br/>
                {`Size: ${file.Size}`}<br/>
                <button onClick={ this.delete.bind(this, file.Key) }>Delete</button>
                {file.Tags.virusScanStatus === 'CLEAN' ? (<span>
                <a href={file.Url} target='_new' style={{textDecoration: 'none', 'color': 'black'}}><button>Download</button></a> 
                <CopyToClipboard text={file.Url}><button>Copy sharing link</button></CopyToClipboard></span>
                ) : (<span></span>)}
              </ListGroupItem>
    );
  }

  render() {
    return (
      <>
      <div className="Home">
        <NewFile refresh={this.refresh} />
        <div className="files">
          <PageHeader>Your Files <button onClick={this.refresh}>&#x21bb;</button></PageHeader>
          <div>Note: files auto-delete after 7 days.</div>
          <ListGroup>
            {!this.state.isLoading && this.renderFilesList(this.state.files)}
          </ListGroup>
      </div>
      </div>
      </>
    );
  }
}
