import React, { Component } from "react";
import config from "../config";
import Dropzone from 'react-dropzone'
import classNames from 'classnames'
import LoadingOverlay from 'react-loading-overlay';
import { toast } from 'react-toastify';
import { Line } from 'rc-progress';
import { Storage } from "aws-amplify";
import { ListGroup, ListGroupItem } from "react-bootstrap";

import "./NewFile.css";

export default class NewFile extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: true,
      progress: [],
      isUploading: false
    };
  }

  async componentDidMount() {
    this.setState({ isLoading: false });
  }

  s3Upload(file) {
    Storage.configure({ level: 'private' });
    const that = this;
    return Storage.vault.put(file.name, file, {
      contentType: file.type,
      serverSideEncryption: 'AES256',
      progressCallback(progress) {
        if (that.state.progress.length === 0) {
          that.setState({progress: [{name: file.name, progress: progress.loaded/progress.total}]});
        } else {
          const idx = that.state.progress.findIndex((e) => e.name === file.name);
          const newProgress = Array.from(that.state.progress);
          newProgress.splice(idx,1,{name: file.name, progress: progress.loaded/progress.total});
          console.log(JSON.stringify(newProgress));
          that.setState({ progress: newProgress});    
        }
      }
    });
  }

  onDrop = acceptedFiles => {
    this.setState({ isLoading: true ,progress: []});
    const promises = [];
    let newList = Array.from(this.state.progress);
    acceptedFiles.forEach(file => {
      if (file.size > config.MAX_ATTACHMENT_SIZE) {
        this.setState({ isLoading: false });
        toast.error(`💩 - One or more files exceeded maximum file size. Please pick a file smaller than ${config.MAX_ATTACHMENT_SIZE/1000000} MB.`, {
          position: toast.POSITION.TOP_CENTER
        });
        throw new Error('Ack');
      }
      newList.push({name: file.name, progress: 0});
      promises.push(this.s3Upload(file));
    });
    this.setState({isUploading: true, progress: newList});
    return Promise.all(promises).then(() => {
      this.setState({isUploading: false});
      toast.success("File(s) uploaded successfully!", {
        position: toast.POSITION.TOP_CENTER
      });
      this.setState({ isLoading: false ,progress: []});
    }).catch(e => { 
      console.log(e);
      toast.error('💩 - One or more errors occurred while uploading files. Please try again.', {
        position: toast.POSITION.TOP_CENTER
      });
      this.setState({ isLoading: false ,progress: []});
    });
  }

  renderFilesList(files) {
    if (files.length) {
      return files.map(
        (file, i) =>
        <>
          <ListGroupItem key={i}>
            <p>{file.name} {parseInt(file.progress*100)}%</p>
            <Line percent={file.progress*100} strokeWidth="4" strokeColor="#42f4c5" /><br />
          </ListGroupItem>
        </>
      );
    } else {
      return (
        <></>
      );
    }
  }

  render() {
    return (
      <>
      <LoadingOverlay active={this.state.isLoading} spinner text="Storing file(s)" styles={{
        overlay: (base) => ({
          ...base,
          background: 'rgba(0, 0, 0, 0.9)'
          
        })
      }} >
      <div className='square'>
       <Dropzone onDrop={this.onDrop} disabled={this.state.isLoading}>
               {({getRootProps, getInputProps, isDragActive}) => {
          return (
            <div
              {...getRootProps()}
              className={classNames('dropzone', {'dropzone--isActive': isDragActive})}
            >
            <center>
            <div className="circle">
 
              <input {...getInputProps()} />
              {
                isDragActive ?
                  <p>Drop files here...</p> :
                  <p>Drop files here, or click to select files to upload.</p>
              }
              </div>
              </center>
            </div>
          )
        }}
      </Dropzone>
      </div>
      </LoadingOverlay>
      <div>
      <ListGroup>
        {this.state.isUploading && this.renderFilesList(this.state.progress)}
      </ListGroup>
      </div>
      </>
    );
  }
}
