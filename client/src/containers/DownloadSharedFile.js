import React, { Component } from "react";
import { createWriteStream, supported } from 'streamsaver'
import { API } from "aws-amplify";

export default class DownloadSharedFile extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: true,
      shareId: this.props.shareId,
      fileName: this.props.fileName,
      getUrl: this.props.getUrl,
      supported,
      download: {}
    };
  }

  componentDidMount() {
    API.get("api", `/shareLink/${this.state.shareId}`)
      .then(({url}) => {
        this.setState({url, isLoading: false});
      });
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
      button = <a href={this.state.url} disabled={this.state.isLoading} download target="_blank"><button>Download</button></a>;
    } else {
      button = <button disabled={this.state.isLoading} onClick={this.downloadFile.bind(this)}>Download</button>;
    }
    return (
      button
    );
  }
}