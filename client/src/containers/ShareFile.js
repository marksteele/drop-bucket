import React, { Component } from "react";
import Modal from 'react-modal';
import { toast } from 'react-toastify';
import { API } from "aws-amplify";

export default class ShareFile extends Component {
  constructor(props) {
    super(props);
    this.state = {
      modalIsOpen: false,
      emailShareRecipient: '',
      shareFile: props.shareFile
    };
    this.openModal = this.openModal.bind(this);
    this.afterOpenModal = this.afterOpenModal.bind(this);
    this.closeModal = this.closeModal.bind(this);
  }

  async componentDidMount() {
    this.setState({ isLoading: false });
  }

  openModal() {
    this.setState({modalIsOpen: true});
  }

  afterOpenModal() {
    // references are now sync'd and can be accessed.
  }

  closeModal() {
    this.setState({modalIsOpen: false});
  }

  shareFile(filePath, to) {
    return API.post("shareFile", "/share", { body: { filePath, to } });
  }

  async handleSubmit(event) {
    event.preventDefault();
    const shareId = await this.shareFile(this.state.shareFile, this.state.emailShareRecipient);
    console.log(`Sharing file ${this.state.shareFile} with ${this.state.emailShareRecipient} shareId: ${shareId}`);
    this.setState({modalIsOpen: false, emailShareRecipient: ''});
    toast.success("File shared successfully!", {
      position: toast.POSITION.TOP_CENTER
    });
  }

  handleChange(event) {
    this.setState({emailShareRecipient: event.target.value});
  }

  render() {
    return (
      <>
      <button onClick={this.openModal}>Share file with...</button>
      <Modal ariaHideApp={false}
                isOpen={this.state.modalIsOpen}
                onAfterOpen={this.afterOpenModal}
                onRequestClose={this.closeModal}
                contentLabel="Share file with...">
                <form onSubmit={this.handleSubmit.bind(this)}>
                  <label> Recipient email:
                    <input type="text" value={this.state.emailShareRecipient} onChange={this.handleChange.bind(this)}/>
                  </label>
                  <input type="submit" value="Submit" />
              </form>                
      </Modal>
      </>
    );
  }
}
