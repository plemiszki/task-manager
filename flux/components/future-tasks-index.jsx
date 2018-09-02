var React = require('react');
var Modal = require('react-modal');
var Moment = require('moment');
var HandyTools = require('handy-tools');
var ClientActions = require('../actions/client-actions.js');
var FutureTasksStore = require('../stores/future-tasks-store.js');
import FutureTaskNew from './future-task-new.jsx';

var ModalStyles = {
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

var FutureTasksIndex = React.createClass({

  getInitialState: function() {
    return({
      modalOpen: false,
      fetching: true,
      modalFetching: false,
      tasks: [],
      errors: []
    });
  },

  componentDidMount: function() {
    this.tasksListener = FutureTasksStore.addListener(this.getFutureTasks);
    ClientActions.fetchFutureTasks();
  },

  getFutureTasks: function() {
    this.setState({
      fetching: false,
      modalFetching: false,
      modalOpen: false,
      tasks: FutureTasksStore.all()
    });
  },

  clickAddNewButton: function() {
    this.setState({
      modalOpen: true
    });
  },

  clickXButton: function(e) {
    this.setState({
      fetching: true
    });
    ClientActions.deleteFutureTask(e.target.dataset.id);
  },

  closeModal: function() {
    this.setState({ modalOpen: false, errors: [] });
  },

  clickColor: function(e) {
    $('.color').removeClass('selected');
    e.target.classList.add('selected');
  },

  render: function() {
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
                        <td><div className="x-button" onClick={ this.clickXButton } data-id={ task.id }></div></td>
                      </tr>
                    );
                  }.bind(this)) }
                </tbody>
              </table>
              <div className="btn btn-info" onClick={ this.clickAddNewButton }>Add New</div>
            </div>
          </div>
        </div>
        <Modal isOpen={ this.state.modalOpen } onRequestClose={ this.closeModal } contentLabel="Modal" style={ ModalStyles }>
          <FutureTaskNew />
        </Modal>
      </div>
    );
  }
});

module.exports = FutureTasksIndex;
