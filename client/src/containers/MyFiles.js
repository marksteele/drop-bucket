import React, { Component } from "react";
import { API } from "aws-amplify";
import { PageHeader, ListGroup, ListGroupItem } from "react-bootstrap";
import {CopyToClipboard} from 'react-copy-to-clipboard';
import { deleteFile } from "../libs/awsLib";
import { toast } from 'react-toastify';
import ShareFile from "./ShareFile";
import DownloadFile from "./DownloadFile";
import LoadingOverlay from 'react-loading-overlay';

import "./MyFiles.css";

export default class MyFiles extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: true,
      files: []
    };
  }

  handleSubmit(event) {
    console.log(`Sharing file ${this.state.shareFile} with ${this.state.emailShareRecipient}`);
    event.preventDefault();
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
    return API.get("api", "/list");
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
    if (files.length) {
      return files.map(
        (file, i) =>
                <ListGroupItem key={i}>
                  {`File name:  ${file.Key}`}<br/>
                  {`Virus scan status: ${file.Tags.virusScanStatus || 'UKNOWN'}`}<br/>
                  {`Last modified: ${file.LastModified}`}<br/>
                  {`Size: ${file.Size}`}<br/>
                  <button onClick={ this.delete.bind(this, file.Key) }>Delete</button>
                  {file.Tags.virusScanStatus === 'CLEAN' ? (
                  <span>
                    <DownloadFile url={file.Url} fileName={file.Key} />
                    <CopyToClipboard text={file.Url}><button>Copy sharing link</button></CopyToClipboard>              
                    <ShareFile shareFile={file.Key} />
                  </span>
                  ) : (<span></span>)}
                </ListGroupItem>
      );
    } else {
      return (
        <p style={{"min-height": '500px'}}>Nothing shared yet!</p>
      );
    }
  }

  render() {
    return (
      <>
      <div className="MyFiles">
        <div className="files">
          <PageHeader>Your Files <img height="30" alt="refresh" src="/refresh.png" onClick={this.refresh} /></PageHeader>
          <LoadingOverlay active={this.state.isLoading} spinner text="Retrieving file list" styles={{
        overlay: (base) => ({
          ...base,
          background: 'rgba(0, 0, 0, 0.9)'
          
        })
      }} >
          <ListGroup>
            {!this.state.isLoading && this.renderFilesList(this.state.files)}
          </ListGroup>
        </LoadingOverlay>

      </div>
      </div>

      </>
    );
  }
}
