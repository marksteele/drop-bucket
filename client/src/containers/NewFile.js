import React, { Component } from "react";
import { s3Upload } from "../libs/awsLib";
import config from "../config";
import Dropzone from 'react-dropzone'
import classNames from 'classnames'
import LoadingOverlay from 'react-loading-overlay';
import { toast } from 'react-toastify';

import "./NewFile.css";

export default class NewFile extends Component {
  constructor(props) {
    super(props);
    this.refresh = props.refresh;
    this.state = {
      isLoading: true,
    };
  }

  async componentDidMount() {
    this.setState({ isLoading: false });
  }

  onDrop = acceptedFiles => {
    this.setState({ isLoading: true });
    const promises = [];
    acceptedFiles.forEach(file => {
      if (file.size > config.MAX_ATTACHMENT_SIZE) {
        this.setState({ isLoading: false });
        toast.error(`💩 - One or more files exceeded maximum file size. Please pick a file smaller than ${config.MAX_ATTACHMENT_SIZE/1000000} MB.`, {
          position: toast.POSITION.TOP_CENTER
        });
        return;
      }
      promises.push(s3Upload(file));
    });
    this.setState({ isLoading: true });
    return Promise.all(promises).then(() => {
      toast.success("File(s) uploaded successfully!", {
        position: toast.POSITION.TOP_CENTER
      });
      this.setState({ isLoading: false });
      this.refresh();
    }).catch(e => { 
      console.log(e);
      toast.error('💩 - One or more errors occurred while uploading files. Please try again.', {
        position: toast.POSITION.TOP_CENTER
      });
      this.setState({ isLoading: false });
      this.refresh();
    });
  }

  render() {
    return (
      <LoadingOverlay active={this.state.isLoading} spinner text="Storing file(s)" styles={{
        overlay: (base) => ({
          ...base,
          background: 'rgba(0, 0, 0, 0.9)'
          
        })
      }} >
      <div className='square'>
       <Dropzone onDrop={this.onDrop}  disabled={this.state.isLoading}>
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
    );
  }
}
