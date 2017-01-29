var React = require('react');
var Common = require('../../app/assets/javascripts/common.jsx');
var ClientActions = require('../actions/client-actions.js');
var TasksDayStore = require('../stores/tasks-day-store.js');
var TasksWeekendStore = require('../stores/tasks-weekend-store.js');
var TasksMonthStore = require('../stores/tasks-month-store.js');
var TasksYearStore = require('../stores/tasks-year-store.js');
var TasksLifeStore = require('../stores/tasks-life-store.js');
var TasksIndexItem = require('./tasks-index-item.jsx');

var TasksIndex = React.createClass({

  properStore: null,

  getInitialState: function() {
    return({
      fetching: true,
      rootTasks: [],
      tasks: []
    });
  },

  componentDidMount: function() {
    $('#' + this.props.timeframe + '-top-drop').droppable({
      accept: Common.canIDrop,
      tolerance: 'pointer',
      out: Common.dragOutHandler,
      drop: this.dropHandler
    });
    switch (this.props.timeframe) {
      case "day":
        this.properStore = TasksDayStore;
        break;
      case "weekend":
        this.properStore = TasksWeekendStore;
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

  componentDidUpdate: function() {
    $('.match-height').matchHeight();
  },

  getTasks: function() {
    this.setState({
      fetching: false,
      rootTasks: this.properStore.rootTasks(),
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

  dropHandler: function(e, ui) {
    var draggedIndex = this.getIndexFromId(ui.draggable.attr('id'));
    var dropZoneArray = e.target.getAttribute('id').split('-');
    var dropZoneIndex = dropZoneArray[dropZoneArray.length - 2];
    if (dropZoneIndex == "top") { dropZoneIndex = -1; }

    var hash = {};
    var parent = e.target.parentElement;
    var parentId, $tasks, timeframe;
    if (parent.classList[0] == "tasks-index") { // top drop zone
      parentId = parent.parentElement.getAttribute('id');
      timeframe = parentId.split('-')[parentId.split('-').length - 1];
      $tasks = $('#' + parentId + ' > .tasks-index > .group > .task');
    } else if (parent.parentElement.classList[0] == "tasks-index") { // root level
      parentId = parent.parentElement.parentElement.getAttribute('id');
      timeframe = parentId.split('-')[parentId.split('-').length - 1];
      $tasks = $('#' + parentId + ' > .tasks-index > .group > .task');
    } else { // subtasks
      parentId = parent.parentElement.parentElement.children[0].getAttribute('id');
      timeframe = parentId.split("-")[0];
      $tasks = $('#subtasks-' + parentId + ' .task');
    }

    $tasks.each(function(index, task) {
      var index = this.getIndexFromId(task.getAttribute('id'));
      var id = task.dataset.taskid;
      hash[index] = +id;
    }.bind(this))

    var newHash = this.rearrangeFields(hash, draggedIndex, dropZoneIndex);
    ClientActions.rearrangeTasks(newHash, timeframe);
  },

  rearrangeFields: function(hash, draggedIndex, dropZoneIndex) {
    var result = {};
    var draggedTaskId;
    if (dropZoneIndex == -1) {
      draggedTaskId = hash[draggedIndex];
      result[0] = draggedTaskId;
    }
    for (var i = 0; i < Object.keys(hash).length; i++) {
      if (i != draggedIndex) {
        result[Object.keys(result).length] = hash[i];
      }
      if (i == dropZoneIndex) {
        result[Object.keys(result).length] = hash[draggedIndex];
      }
    }
    return result;
  },

  getIndexFromId: function(id) {
    var array = id.split('-');
    return array[array.length - 1];
  },

  render: function() {
    return(
      <div className="tasks-index match-height" data-index={this.props.timeframe}>
        {Common.renderSpinner(this.state.fetching)}
        {Common.renderGrayedOut(this.state.fetching)}
        {this.renderHeader()}
        <a href="" onClick={this.clickAddButton}>Add Task</a>
        <hr />
        <div id={this.props.timeframe + '-top-drop'} className="drop-area"></div>
        {this.state.rootTasks.map(function(task, index) {
          return(
            <TasksIndexItem key={index} index={index} task={task} level={"0"} store={this.properStore} updateTask={this.updateTask} addSubTask={this.addSubTask} deleteTask={this.deleteTask} dropHandler={this.dropHandler} />
          )
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
      case "weekend":
        return(
          <h1>Weekend</h1>
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
