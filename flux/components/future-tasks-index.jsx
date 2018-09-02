import React from 'react';
import Modal from 'react-modal';
import Moment from 'moment';
import HandyTools from 'handy-tools';
import ClientActions from '../actions/client-actions.js';
import FutureTasksStore from '../stores/future-tasks-store.js';
import FutureTaskNew from './future-task-new.jsx';

const ModalStyles = {
  overlay: {
    background: 'rgba(0, 0, 0, 0.50)'
  },
  content: {
    background: '#F5F6F7',
    padding: 0,
    margin: 'auto',
    maxWidth: 1000,
    height: 321
  }
};

export default class FutureTasksIndex extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      modalOpen: false,
      fetching: true,
      tasks: []
    }
  }

  componentDidMount() {
    this.tasksListener = FutureTasksStore.addListener(this.getFutureTasks.bind(this));
    ClientActions.fetchFutureTasks();
  }

  getFutureTasks() {
    this.setState({
      fetching: false,
      modalFetching: false,
      modalOpen: false,
      tasks: FutureTasksStore.all()
    });
  }

  clickAddNewButton() {
    this.setState({
      modalOpen: true
    });
  }

  clickXButton(e) {
    this.setState({
      fetching: true
    });
    ClientActions.deleteFutureTask(e.target.dataset.id);
  }

  closeModal() {
    this.setState({
      modalOpen: false
    });
  }

  clickColor(e) {
    $('.color').removeClass('selected');
    e.target.classList.add('selected');
  }

  render() {
    return(
      <div className="container widened-container index-component">
        <div className="row">
          <div className="col-xs-12">
            <div className="white-box">
              { HandyTools.renderSpinner(this.state.fetching) }
              { HandyTools.renderGrayedOut(this.state.fetching, -26, -26, 6) }
              <h1>Future Tasks</h1>
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Text</th>
                    <th>Time Frame</th>
                    <th>Position</th>
                    <th>Color</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="below-header"><td></td><td></td><td></td><td></td><td></td></tr>
                  { this.state.tasks.map(function(task) {
                    return(
                      <tr key={ task.id }>
                        <td>{ Moment(task.date).format('l') }</td>
                        <td>{ task.text }</td>
                        <td>{ task.timeframe }</td>
                        <td>{ task.addToEnd ? "End" : "Beginning" }</td>
                        <td><div className="swatch" style={ { backgroundColor: task.color } }></div></td>
                        <td><div className="x-button" onClick={ this.clickXButton.bind(this) } data-id={ task.id }></div></td>
                      </tr>
                    );
                  }.bind(this)) }
                </tbody>
              </table>
              <div className="btn btn-info" onClick={ this.clickAddNewButton.bind(this) }>Add New</div>
            </div>
          </div>
        </div>
        <Modal isOpen={ this.state.modalOpen } onRequestClose={ this.closeModal.bind(this) } contentLabel="Modal" style={ ModalStyles }>
          <FutureTaskNew />
        </Modal>
      </div>
    );
  }
}
