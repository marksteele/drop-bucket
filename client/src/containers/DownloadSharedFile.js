import React, { Component } from "react";
import { createWriteStream, supported } from 'streamsaver'
import { API } from "aws-amplify";

export default class DownloadSharedFile extends Component {
  constructor(props) {
    super(props);
    this.state = {
      shareId: this.props.shareId,
      fileName: this.props.fileName,
      url: '',
      supported,
      download: {}
    };
  }

  async redirectLink() {
    const {url} = await API.get("api", `/shareLink/${this.state.shareId}`);
    window.open(url);
  }

  async downloadFile() {
    return API.get("api", `/shareLink/${this.state.shareId}`)
    .then(({url}) => fetch(url)
    .then(res => {
      const fileStream = createWriteStream(this.state.fileName);
      const writer = fileStream.getWriter()
      if (res.body.pipeTo) {
        writer.releaseLock()
        return res.body.pipeTo(fileStream)
      }
      const reader = res.body.getReader();
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
      button = <button onClick={this.redirectLink.bind(this)}>Download</button>;
    } else {
      button = <button onClick={this.downloadFile.bind(this)}>Download</button>;
    }
    return (
      button
    );
  }
}