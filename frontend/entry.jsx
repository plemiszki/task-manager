import React from 'react'
import { createRoot } from 'react-dom/client'
import ReactModal from 'react-modal'
import CurrentUser from './components/current-user.jsx'
import TasksIndex from './components/tasks-index.jsx'
import FutureTasksIndex from './components/future-tasks-index.jsx'
import RecurringTasksIndex from './components/recurring-tasks-index.jsx'
import RecurringTaskDetails from './components/recurring-task-details.jsx'
import RecipesIndex from './components/recipes-index.jsx'
import { SimpleDetails } from 'handy-components'

document.addEventListener('DOMContentLoaded', () => {

  ReactModal.setAppElement(document.body);

  const currentUserNode = document.getElementById('current-user');
  if (currentUserNode) {
    createRoot(currentUserNode).render(
      <CurrentUser />
    );
  }

  const tasksIndexNode = document.getElementById('tasks-index');
  if (tasksIndexNode) {
    createRoot(tasksIndexNode).render(
      <TasksIndex />
    );
  }

  const futureTasksIndexNode = document.getElementById('future-tasks-index');
  if (futureTasksIndexNode) {
    createRoot(futureTasksIndexNode).render(
      <FutureTasksIndex />
    );
  }

  const recurringTasksIndexNode = document.getElementById('recurring-tasks-index');
  if (recurringTasksIndexNode) {
    createRoot(recurringTasksIndexNode).render(
      <RecurringTasksIndex />
    );
  }

  const recurringTaskDetailsNode = document.getElementById('recurring-task-details');
  if (recurringTaskDetailsNode) {
    createRoot(recurringTaskDetailsNode).render(
      <RecurringTaskDetails />
    );
  }

  const recipesIndex = document.getElementById('recipes-index');
  if (recipesIndex) {
    createRoot(recipesIndex).render(
      <RecipesIndex />
    );
  }

  const recipeDetails = document.getElementById('recipe-details');
  if (recipeDetails) {
    createRoot(recipeDetails).render(
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
    );
  }
});
