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

  clickColor(e) {
    let recurringTask = this.state.recurringTask;
    recurringTask.color = e.target.style.backgroundColor;
    this.setState({
      recurringTask
    }, function() {
      var changesToSave = this.checkForChanges();
      this.setState({
        changesToSave: changesToSave
      });
    });
  }

  renderColorField() {
    return(
      <div className={ "col-xs-4" + (this.state.recurringTask.jointUserId ? ' hidden' : '') }>
        <h2>Color</h2>
        <div className="colors">
          <div className={ 'color' + (this.state.recurringTask.color === 'rgb(234, 30, 30)' ? ' selected' : '') } onClick={ this.clickColor.bind(this) } style={{'backgroundColor': 'rgb(234, 30, 30)'}} ></div>
          <div className={ 'color' + (this.state.recurringTask.color === 'rgb(255, 175, 163)' ? ' selected' : '') } onClick={ this.clickColor.bind(this) } style={{'backgroundColor': 'rgb(255, 175, 163)'}} ></div>
          <div className={ 'color' + (this.state.recurringTask.color === 'rgb(255, 175, 36)' ? ' selected' : '') } onClick={ this.clickColor.bind(this) } style={{'backgroundColor': 'rgb(255, 175, 36)'}} ></div>
          <div className={ 'color' + (this.state.recurringTask.color === 'rgb(238, 244, 66)' ? ' selected' : '') } onClick={ this.clickColor.bind(this) } style={{'backgroundColor': 'rgb(238, 244, 66)'}} ></div>
          <div className={ 'color' + (this.state.recurringTask.color === 'rgb(30, 124, 33)' ? ' selected' : '') } onClick={ this.clickColor.bind(this) } style={{'backgroundColor': 'rgb(30, 124, 33)'}} ></div>
          <div className={ 'color' + (this.state.recurringTask.color === 'rgb(111, 138, 240)' ? ' selected' : '') } onClick={ this.clickColor.bind(this) } style={{'backgroundColor': 'rgb(111, 138, 240)'}} ></div>
          <div className={ 'color' + (this.state.recurringTask.color === 'rgb(181, 111, 240)' ? ' selected' : '') } onClick={ this.clickColor.bind(this) } style={{'backgroundColor': 'rgb(181, 111, 240)'}} ></div>
          <div className={ 'color' + (this.state.recurringTask.color === 'rgb(175, 96, 26)' ? ' selected' : '') } onClick={ this.clickColor.bind(this) } style={{'backgroundColor': 'rgb(175, 96, 26)'}} ></div>
          <div className={ 'color' + (this.state.recurringTask.color === 'rgb(210, 206, 200)' ? ' selected' : '') } onClick={ this.clickColor.bind(this) } style={{'backgroundColor': 'rgb(210, 206, 200)'}} ></div>
        </div>
        { HandyTools.renderFieldError([], []) }
      </div>
    );
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
