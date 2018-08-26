import React from 'react';
import Modal from 'react-modal';
import HandyTools from 'handy-tools';
import ClientActions from '../actions/client-actions.js';
import ErrorsStore from '../stores/errors-store';

const ConfirmDeleteModalStyles = {
  overlay: {
    background: 'rgba(0, 0, 0, 0.50)'
  },
  content: {
    background: '#FFFFFF',
    margin: 'auto',
    maxWidth: 500,
    height: 217,
    border: 'solid 1px black',
    borderRadius: '6px',
    textAlign: 'center',
    color: '#5F5F5F',
    padding: '26px 20px'
  }
};

export default class _Details extends React.Component {
  constructor(props) {
    super(props);
  }

  defaultState() {
    return {
      changesToSave: false,
      deleteModalOpen: false,
      errors: [],
      fetching: true,
      justSaved: false
    };
  }

  getErrors() {
    console.log('get errors');
    this.setState({
      fetching: false,
      errors: ErrorsStore.all()
    });
  }

  clickDelete() {
    this.setState({
      deleteModalOpen: true
    });
  }

  closeModal() {
    this.setState({
      deleteModalOpen: false
    });
  }

  renderButtons() {
    if (this.state.changesToSave) {
      var buttonText = "Save";
    } else {
      var buttonText = this.state.justSaved ? "Saved" : "No Changes";
    }
    return(
      <div>
        <a className={ "blue-button standard-width btn save-button" + HandyTools.renderDisabledButtonClass(this.state.fetching || !this.state.changesToSave) } onClick={ this.clickSave.bind(this) }>
          { buttonText }
        </a>
        <a className={ "btn delete-button " + HandyTools.renderDisabledButtonClass(this.state.fetching) } onClick={ this.clickDelete.bind(this) }>
          Delete
        </a>
      </div>
    );
  }

  renderModal(entity) {
    return(
      <Modal isOpen={ this.state.deleteModalOpen } onRequestClose={ this.closeModal.bind(this) } contentLabel="Modal" style={ ConfirmDeleteModalStyles }>
        <div className="admin-modal">
          <div className="confirm-delete">
            <h1>Are you sure you want to permanently delete this { entity }&#63;</h1>
            <a className="btn red-button" onClick={ this.confirmDelete.bind(this) }>
              Yes
            </a>
            <a className="btn gray-outline-button" onClick={ this.closeModal.bind(this) }>
              No
            </a>
          </div>
        </div>
      </Modal>
    );
  }

  componentDidUpdate() {
    // $('.match-height-layout').matchHeight();
  }
}
