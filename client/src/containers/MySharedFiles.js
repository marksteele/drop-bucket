import React, { Component } from "react";
import { API } from "aws-amplify";
import { PageHeader, ListGroup, ListGroupItem } from "react-bootstrap";
import { toast } from 'react-toastify';
import LoadingOverlay from 'react-loading-overlay';

import "./MySharedFiles.css";

export default class MySharedFiles extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: true,
      files: [],
    };
  }

  async componentDidMount() {
    try {
      const res = await this.listMySharedFiles();
      this.setState({ files: res.files });
    } catch (e) {
      toast.error("💩 - Something went wrong, sorry!", {
        position: toast.POSITION.TOP_CENTER
      });
      console.log(e);
    }
    this.setState({ isLoading: false });
  }

  listMySharedFiles() {
    return API.get("api", "/share/email_from");
  }

  async delete(shareId) {
    try {
      await API.del("api",`/share/email_from/${shareId}`);
      toast.success("File share deleted successfully!", {
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
      const res = await this.listMySharedFiles();
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
                  {`Shared with: ${file.email_to}`}<br/>
                  <button onClick={ this.delete.bind(this,  file.shareId) }>Delete</button><br/>
                </ListGroupItem>
      );
    } else {
      return (
        <p>Nothing shared yet!</p>
      );
    }

  }

  render() {
    return (
      <>
      <div className="MySharedFiles">
        <div className="files">
        <PageHeader>Your shared files <img height="30" alt="refresh" src="/refresh.png" onClick={this.refresh} /></PageHeader>
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
