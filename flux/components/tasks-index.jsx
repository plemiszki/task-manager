var React = require('react');
var Common = require('../../app/assets/javascripts/common.jsx');
var ClientActions = require('../actions/client-actions.js');
var TasksDayStore = require('../stores/tasks-day-store.js');
var TasksMonthStore = require('../stores/tasks-month-store.js');
var TasksYearStore = require('../stores/tasks-year-store.js');
var TasksLifeStore = require('../stores/tasks-life-store.js');
var TasksIndexItem = require('./tasks-index-item.jsx');

var TasksIndex = React.createClass({

  properStore: null,

  getInitialState: function() {
    return({
      fetching: true,
      tasks: []
    });
  },

  componentDidMount: function() {
    switch (this.props.timeframe) {
      case "day":
        this.properStore = TasksDayStore;
        break;
      case "month":
        this.properStore = TasksMonthStore;
        break;
      case "year":
        this.properStore = TasksYearStore;
        break;
      case "life":
        this.properStore = TasksLifeStore;
    }
    this.tasksListener = this.properStore.addListener(this.getTasks);
    ClientActions.fetchTasks(this.props.timeframe);
  },

  getTasks: function() {
    this.setState({
      fetching: false,
      tasks: this.properStore.all()
    });
  },

  clickAddButton: function(event) {
    event.preventDefault();
    ClientActions.addTask(this.props.timeframe);
  },

  updateTask: function(task) {
    this.setState({
      fetching: true
    });
    ClientActions.updateTask(task);
  },

  addSubTask: function(task) {
    this.setState({
      fetching: true
    });
    ClientActions.addTask(this.props.timeframe, task.id);
  },

  deleteTask: function(task) {
    this.setState({
      fetching: true
    });
    ClientActions.deleteTask(task);
  },

  render: function() {
    return(
      <div className="tasks-index">
        {Common.renderSpinner(this.state.fetching)}
        {Common.renderGrayedOut(this.state.fetching)}
        {this.renderHeader()}
        <a href="" onClick={this.clickAddButton}>Add Task</a>
        <hr />
        {this.state.tasks.map(function(task, index) {
          if (!task.parent_id) {
            return(
              <TasksIndexItem key={index} task={task} store={this.properStore} updateTask={this.updateTask} addSubTask={this.addSubTask} deleteTask={this.deleteTask} />
            )
          }
        }.bind(this))}
      </div>
    )
  },

  renderHeader: function() {
    switch (this.props.timeframe) {
      case "day":
        return(
          <h1>Today</h1>
        )
      case "month":
        return(
          <h1>This Month</h1>
        )
      case "year":
        return(
          <h1>This Year</h1>
        )
      case "life":
        return(
          <h1>Lifetime</h1>
        )
    }
  }
});

module.exports = TasksIndex;
