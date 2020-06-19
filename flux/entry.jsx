import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import ReactModal from 'react-modal'
import CurrentUser from './components/current-user.jsx'
import TasksIndex from './components/tasks-index.jsx'
import FutureTasksIndex from './components/future-tasks-index.jsx'
import RecurringTasksIndex from './components/recurring-tasks-index.jsx'
import RecurringTaskDetails from './components/recurring-task-details.jsx'
import RecipesIndex from './components/recipes-index.jsx'
import RecipeDetails from './components/recipe-details.jsx'

import configureStore from './store/store'
let store = configureStore();

$(document).ready(() => {
  ReactModal.setAppElement(document.body);
  if ($('#current-user')[0]) {
    ReactDOM.render(
      <Provider store={ store }>
        <CurrentUser />
      </Provider>,
      document.getElementById("current-user")
    );
  }
  if ($('#tasks-index-day')[0]) {
    ReactDOM.render(<TasksIndex timeframe="day" />, document.getElementById("tasks-index-day"));
    ReactDOM.render(<TasksIndex timeframe="weekend" />, document.getElementById("tasks-index-weekend"));
    ReactDOM.render(<TasksIndex timeframe="month" />, document.getElementById("tasks-index-month"));
    ReactDOM.render(<TasksIndex timeframe="year" />, document.getElementById("tasks-index-year"));
    ReactDOM.render(<TasksIndex timeframe="life" />, document.getElementById("tasks-index-life"));
    ReactDOM.render(<TasksIndex timeframe="backlog" />, document.getElementById("tasks-index-backlog"));
  }
  if ($('#future-tasks-index')[0]) {
    ReactDOM.render(
      <Provider store={ store }>
        <FutureTasksIndex />
      </Provider>,
      document.getElementById("future-tasks-index")
    );
  }
  if ($('#recurring-tasks-index')[0]) {
    ReactDOM.render(<RecurringTasksIndex />, document.getElementById("recurring-tasks-index"));
  }
  if ($('#recurring-task-details')[0]) {
    ReactDOM.render(<RecurringTaskDetails />, document.getElementById("recurring-task-details"));
  }
  if ($('#recipes-index')[0]) {
    ReactDOM.render(
      <Provider store={ store }>
        <RecipesIndex />
      </Provider>,
      document.getElementById("recipes-index")
    );
  }
  if ($('#recipe-details')[0]) {
    ReactDOM.render(<RecipeDetails />, document.getElementById("recipe-details"));
  }
});
