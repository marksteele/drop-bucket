import React, { Component } from "react";
import { createWriteStream, supported } from 'streamsaver'
import { API } from "aws-amplify";

export default class SharedWithMe extends Component {
  constructor(props) {
    super(props);
    this.state = {
      shareId: this.props.shareId,
      fileName: this.props.fileName,
      supported,
      download: {}
    };
  }

  async getDownloadLink() {
    const download = await API.get("api", `/shareLink/${this.state.shareId}`);
    return download.url;
  }

  async downloadFile() {
    return API.get("api", `/shareLink/${this.state.shareId}`)
    .then((download) => fetch(download.url)
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
    }));
  }

  render() {
    let button;
    if (!supported) {
      button = <a href={this.getDownloadLink()} download target="_blank"><button>Download</button></a>;
    } else {
      button = <button onClick={this.downloadFile.bind(this)}>Download</button>;
    }
    return (
      button
    );
  }
}