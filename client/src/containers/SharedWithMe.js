import React, { Component } from "react";
import { API } from "aws-amplify";
import { PageHeader, ListGroup, ListGroupItem } from "react-bootstrap";
import { toast } from 'react-toastify';
import DownloadSharedFile from "./DownloadSharedFile";
import LoadingOverlay from 'react-loading-overlay';

import "./SharedWithMe.css";

export default class SharedWithMe extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: true,
      files: [],
    };
  }

  async componentDidMount() {
    try {
      const res = await this.listSharedFiles();
      this.setState({ files: res.files });
    } catch (e) {
      toast.error("💩 - Something went wrong, sorry!", {
        position: toast.POSITION.TOP_CENTER
      });
      console.log(e);
    }
    this.setState({ isLoading: false });
  }

  listSharedFiles() {
    return API.get("api", "/share/email_to");
  }

  async delete(shareId) {
    try {
      await API.del("api",`/share/email_to/${shareId}`);
      toast.success("Shared file deleted successfully!", {
        position: toast.POSITION.TOP_CENTER
      });
      this.setState(
        {
          files: this.state.files.filter((f) => { 
            return f.shareId !== shareId
          })
        }
      );
    } catch (e) {
      toast.error("💩 - Something went wrong, sorry!", {
        position: toast.POSITION.TOP_CENTER
      });
      console.log(e);
    }
  }

  refresh = async () => {
    this.setState({
      isLoading: true,
      files: []
    });
    try {
      const res = await this.listSharedFiles();
      this.setState({ files: res.files });

    } catch (e) {
      toast.error("💩 - Something went wrong, sorry!", {
        position: toast.POSITION.TOP_CENTER
      });
      console.log(e);
    }
    this.setState({ isLoading: false });
  };

  renderFilesList(files) {
    if (files.length) {
      return files.map(
        (file, i) =>
                <ListGroupItem key={i}>
                  {`File name:  ${file.filePath}`}<br/>
                  {`Shared from: ${file.email_from}`}<br/>
                  <DownloadSharedFile shareId={ file.shareId} fileName={file.filePath} />
                  <button onClick={ this.delete.bind(this,  file.shareId) }>Delete</button><br/>
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
      <div className="MySharedFiles">
        <div className="files">
        <PageHeader>Files shared with you <img height="30" alt="refresh" src="/refresh.png" onClick={this.refresh} /></PageHeader>
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
