import React, { Component } from "react";
import { createWriteStream, supported } from 'streamsaver'

export default class DownloadFile extends Component {
  constructor(props) {
    super(props);
    this.state = {
      fileName: this.props.fileName,
      url: this.props.url,
      supported
    };
  }

  async downloadFile() {
    return fetch(this.state.url)
    .then(res => {
      const fileStream = createWriteStream(this.state.fileName);
      const writer = fileStream.getWriter()
      if (res.body.pipeTo) {
        writer.releaseLock()
        return res.body.pipeTo(fileStream)
      }
      const reader = res.body.getReader()
      const pump = () => reader.read()
        .then(({ value, done }) => done ? writer.close() : writer.write(value)
        .then(pump));

      // Start the reader
      pump().then(() => {
        console.log('Closed the stream, Done writing');
      });
    });
  }

  render() {
    let button;
    if (!supported) {
      button = <a href={this.state.url} download target="_blank"><button>Download</button></a>;
    } else {
      button = <button onClick={this.downloadFile.bind(this)}>Download</button>;
    }
    return (
      button
    );
  }
}