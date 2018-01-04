var React = require('react');
var ReactDOM = require('react-dom');
var ReactModal = require('react-modal');
var CurrentUser = require('./components/current-user.jsx');
var TasksIndex = require('./components/tasks-index.jsx');
var FutureTasksIndex = require('./components/future-tasks-index.jsx');

$(document).ready(function() {
  ReactModal.setAppElement(document.body);
  if ($('#current-user')[0]) {
    ReactDOM.render(<CurrentUser />, document.getElementById("current-user"));
  }
  if ($('#tasks-index-day')[0]) {
    ReactDOM.render(<TasksIndex timeframe={"day"} />, document.getElementById("tasks-index-day"));
  }
  if ($('#tasks-index-weekend')[0]) {
    ReactDOM.render(<TasksIndex timeframe={"weekend"} />, document.getElementById("tasks-index-weekend"));
  }
  if ($('#tasks-index-month')[0]) {
    ReactDOM.render(<TasksIndex timeframe={"month"} />, document.getElementById("tasks-index-month"));
  }
  if ($('#tasks-index-year')[0]) {
    ReactDOM.render(<TasksIndex timeframe={"year"} />, document.getElementById("tasks-index-year"));
  }
  if ($('#tasks-index-life')[0]) {
    ReactDOM.render(<TasksIndex timeframe={"life"} />, document.getElementById("tasks-index-life"));
  }
  if ($('#future-tasks-index')[0]) {
    ReactDOM.render(<FutureTasksIndex />, document.getElementById("future-tasks-index"));
  }
});
