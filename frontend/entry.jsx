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
import { SimpleDetails } from 'handy-components'

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
  if ($('#tasks-index')[0]) {
    ReactDOM.render(
      <Provider store={ store }>
        <TasksIndex />
      </Provider>,
      document.getElementById("tasks-index")
    );
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
    ReactDOM.render(
      <Provider store={ store }>
        <RecurringTasksIndex />
      </Provider>,
      document.getElementById("recurring-tasks-index")
    );
  }
  if ($('#recurring-task-details')[0]) {
    ReactDOM.render(
      <Provider store={ store }>
        <RecurringTaskDetails />
      </Provider>,
      document.getElementById("recurring-task-details")
    );
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
    ReactDOM.render(
      <Provider store={ store }>
        <div class="container widened-container">
          <SimpleDetails
            entityName='recipe'
            header='Edit Recipe'
            hideDeleteButton={ true }
            initialEntity={{
              name: '',
              category: '',
              time: '',
              ingredients: '',
              prep: '',
            }}
            fields = {[
              [
                { columnWidth: 6, property: 'name' },
                { columnWidth: 4, property: 'category' },
                { columnWidth: 2, property: 'time' }
              ],
              [
                { columnWidth: 6, property: 'ingredients', type: 'textbox', rows: 11 },
                { columnWidth: 6, property: 'prep', columnHeader: 'Preparation', type: 'textbox', rows: 11 },
              ],
            ]}
          />
        </div>
      </Provider>,
      document.getElementById("recipe-details")
    );
  }
});
