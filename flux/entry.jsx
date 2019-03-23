import React from 'react';
import ReactDOM from 'react-dom';
import ReactModal from 'react-modal';
import CurrentUser from './components/current-user.jsx';
import TasksIndex from './components/tasks-index.jsx';
import FutureTasksIndex from './components/future-tasks-index.jsx';
import RecurringTasksIndex from './components/recurring-tasks-index.jsx';
import RecurringTaskDetails from './components/recurring-task-details.jsx';
import RecipesIndex from './components/recipes-index.jsx';
import RecipeDetails from './components/recipe-details.jsx';

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
  if ($('#recurring-tasks-index')[0]) {
    ReactDOM.render(<RecurringTasksIndex />, document.getElementById("recurring-tasks-index"));
  }
  if ($('#recurring-task-details')[0]) {
    ReactDOM.render(<RecurringTaskDetails />, document.getElementById("recurring-task-details"));
  }
  if ($('#recipes-index')[0]) {
    ReactDOM.render(<RecipesIndex />, document.getElementById("recipes-index"));
  }
  if ($('#recipe-details')[0]) {
    ReactDOM.render(<RecipeDetails />, document.getElementById("recipe-details"));
  }
});
