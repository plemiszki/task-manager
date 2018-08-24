var React = require('react');
var Modal = require('react-modal');
var HandyTools = require('handy-tools');
var Moment = require('moment');
var ClientActions = require('../actions/client-actions.js');
var RecurringTasksStore = require('../stores/recurring-tasks-store.js');
var ErrorsStore = require('../stores/errors-store.js');

var ModalStyles = {
  overlay: {
    background: 'rgba(0, 0, 0, 0.50)'
  },
  content: {
    background: '#F5F6F7',
    padding: 0,
    margin: 'auto',
    maxWidth: 1000,
    height: 276
  }
};

var RecurringTasksIndex = React.createClass({

  getInitialState: function() {
    return({
      modalOpen: false,
      fetching: true,
      modalFetching: false,
      dailyTasks: [],
      weekendTasks: [],
      monthlyTasks: [],
      errors: []
    });
  },

  componentDidMount: function() {
    this.tasksListener = RecurringTasksStore.addListener(this.getRecurringTasks);
    this.errorsListener = ErrorsStore.addListener(this.getErrors);
    ClientActions.fetchRecurringTasks();
  },

  getRecurringTasks: function() {
    this.setState({
      fetching: false,
      modalFetching: false,
      modalOpen: false,
      dailyTasks: RecurringTasksStore.dailyTasks(),
      weekendTasks: RecurringTasksStore.weekendTasks(),
      monthlyTasks: RecurringTasksStore.monthlyTasks()
    });
  },

  clickAddNewButton: function() {
    this.setState({
      modalOpen: true
    }, function() {
      Common.resetNiceSelect('select');
      $('[data-field="date"]').val(Moment().add(1, 'days').format('l'));
    });
  },

  clickXButton: function(e) {
    this.setState({
      fetching: true
    });
    ClientActions.deleteRecurringTask(e.target.dataset.id);
  },

  handleModalClose: function() {
    this.setState({ modalOpen: false, errors: [] });
  },

  getErrors: function() {
    this.setState({
      modalFetching: false,
      errors: ErrorsStore.all()
    });
  },

  clearError: function(e) {
    var errors = this.state.errors;
    if (e.target.dataset.field == "date") {
      HandyTools.removeFromArray(errors, "Date is not a valid date");
    } else if (e.target.dataset.field == "text") {
      HandyTools.removeFromArray(errors, "Text can't be blank");
    }
    this.setState({
      errors: errors
    });
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
              <div className="btn btn-primary" onClick={ this.clickAddNewButton }>Add New</div>
            </div>
          </div>
        </div>
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
              <th>Frequency</th>
              <th>Position</th>
              <th>Expires</th>
              <th>Color</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr className="below-header"><td></td><td></td><td></td><td></td><td></td><td></td></tr>
            { this.state[timeframe.toLowerCase() + "Tasks"].map(function(task) {
              return(
                <tr key={ task.id }>
                  <td>{ task.text }</td>
                  <td>{ task.recurrence }</td>
                  <td>{ task.addToEnd ? "End" : "Beginning" }</td>
                  <td>{ task.expires ? "Yes" : "No" }</td>
                  <td><div className="swatch" style={ { backgroundColor: task.color } }></div></td>
                  <td><div className="x-button" onClick={ this.clickXButton } data-id={ task.id }></div></td>
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
