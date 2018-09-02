var React = require('react');
var Modal = require('react-modal');
var HandyTools = require('handy-tools');
var ClientActions = require('../actions/client-actions.js');
var RecurringTasksStore = require('../stores/recurring-tasks-store.js');
import RecurringTaskNew from './recurring-task-new';

var ModalStyles = {
  overlay: {
    background: 'rgba(0, 0, 0, 0.50)'
  },
  content: {
    background: '#F5F6F7',
    padding: 0,
    margin: 'auto',
    maxWidth: 1270,
    height: 323
  }
};

var RecurringTasksIndex = React.createClass({

  getInitialState: function() {
    return({
      modalOpen: false,
      fetching: true,
      dailyTasks: [],
      weekendTasks: [],
      monthlyTasks: [],
      users: []
    });
  },

  componentDidMount: function() {
    this.tasksListener = RecurringTasksStore.addListener(this.getRecurringTasks);
    ClientActions.fetchRecurringTasks();
  },

  getRecurringTasks: function() {
    this.setState({
      fetching: false,
      modalFetching: false,
      modalOpen: false,
      dailyTasks: RecurringTasksStore.dailyTasks(),
      weekendTasks: RecurringTasksStore.weekendTasks(),
      monthlyTasks: RecurringTasksStore.monthlyTasks(),
      users: RecurringTasksStore.users()
    });
  },

  clickNew: function() {
    this.setState({
      modalOpen: true
    });
  },

  closeModal: function() {
    this.setState({
      modalOpen: false
    });
  },

  clickTask: function(e) {
    if (e.target.classList.contains('x-button')) {
      this.setState({
        fetching: true
      });
      ClientActions.deleteRecurringTask(e.target.parentElement.parentElement.dataset.id);
    } else if (e.target.classList.contains('handle')) {
      // do nothing
    } else {
      window.location.pathname = `/recurring_tasks/${e.target.parentElement.dataset.id}`
    }
  },

  mouseDownHandle: function(e) {
    $('*').addClass('grabbing');
    let row = e.target.parentElement.parentElement;
    row.classList.add('grabbed-element');
    let section = e.target.parentElement.parentElement.parentElement.parentElement;
    section.classList.add('grab-section');
  },

  mouseUpHandle: function(e) {
    $('*').removeClass('grabbing');
    let row = e.target.parentElement.parentElement;
    row.classList.remove('grabbed-element');
    let section = e.target.parentElement.parentElement.parentElement.parentElement;
    section.classList.remove('grab-section');
  },

  render: function() {
    return(
      <div className="container widened-container index-component">
        <div className="row">
          <div className="col-xs-12">
            <div className="white-box">
              { HandyTools.renderSpinner(this.state.fetching) }
              { HandyTools.renderGrayedOut(this.state.fetching, -26, -26, 6) }
              { this.renderTable('daily') }
              { this.renderTable('weekend') }
              { this.renderTable('monthly') }
              <div className="btn btn-success" onClick={ this.clickNew }>Add New</div>
            </div>
          </div>
        </div>
        <Modal isOpen={ this.state.modalOpen } onRequestClose={ this.closeModal } contentLabel="Modal" style={ ModalStyles }>
          <RecurringTaskNew users={ this.state.users } />
        </Modal>
      </div>
    );
  },

  renderTable: function(timeframe) {
    return(
      <div>
        <h1>{ HandyTools.capitalize(timeframe) } Recurring Tasks</h1>
        <table className="extra-margin">
          <thead>
            <tr>
              <th>Text</th>
              <th>Order</th>
              <th>Frequency</th>
              <th>Position</th>
              <th>Expires</th>
              <th>Color</th>
              <th></th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr className="below-header"><td></td><td></td><td></td><td></td><td></td><td></td></tr>
            { this.state[timeframe.toLowerCase() + "Tasks"].map(function(task) {
              var backgroundColor = (task.jointUserId ? 'rgb(0,0,0)' : task.color);
              return(
                <tr key={ task.id } onClick={ this.clickTask } data-id={ task.id }>
                  <td>{ task.text }</td>
                  <td>{ task.order }</td>
                  <td>{ task.recurrence }</td>
                  <td>{ task.addToEnd ? "End" : "Beginning" }</td>
                  <td>{ task.expires ? "Yes" : "No" }</td>
                  <td><div className="swatch" style={ { backgroundColor } }></div></td>
                  <td><div className="handle" onMouseDown={ this.mouseDownHandle } onMouseUp={ this.mouseUpHandle }></div></td>
                  <td><div className="x-button"></div></td>
                </tr>
              );
            }.bind(this)) }
          </tbody>
        </table>
        { this.renderLine(timeframe === "daily" || timeframe === "weekend") }
      </div>
    );
  },

  renderLine: function(condition) {
    if (condition) {
      return(
        <hr />
      );
    }
  }
});

module.exports = RecurringTasksIndex;
