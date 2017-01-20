var React = require('react');
var ReactDOM = require('react-dom');
var TasksIndex = require('./components/tasks-index.jsx');

$(document).ready(function() {
  if ($('#tasks-index-day')[0]) {
    ReactDOM.render(<TasksIndex timeframe={"day"} />, document.getElementById("tasks-index-day"));
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
});
