import React from 'react'
import { createRoot } from 'react-dom/client'
import ReactModal from 'react-modal'
import CurrentUser from './components/current-user.jsx'

import { SimpleDetails, FullIndex } from 'handy-components'

import FutureTasksIndex from './components/future-tasks-index.jsx'
import GroceryListDetails from './components/grocery-list-details.jsx'
import GroceryStoreDetails from './components/grocery-store-details.jsx'
import ListDetails from './components/list-details.jsx'
import NewEntity from './components/new-entity'
import RecipeDetails from './components/recipe-details.jsx'
import RecipesIndex from './components/recipes-index.jsx'
import RecurringTaskDetails from './components/recurring-task-details.jsx'
import RecurringTasksIndex from './components/recurring-tasks-index.jsx'
import TasksIndex from './components/tasks-index.jsx'

const renderFullIndex = (id, props = {}, args = {}) => {
  const { newEntity: newEntityProps } = args;
  const node = document.getElementById(id);
  if (node) {
    const root = createRoot(node);
    root.render(
      <div className="container widened-container">
        <FullIndex csrfToken={ true } { ...props }>
          { newEntityProps && (<NewEntity { ...newEntityProps } />) }
        </FullIndex>
      </div>
    );
  }
}

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
      <div className="container widened-container">
        <RecipeDetails />
      </div>
    );
  }

  renderFullIndex('lists-index', {
    entityName: 'list',
    columns: [
      'name',
    ],
    modalRows: 1,
    modalDimensions: { width: 700 },
    includeLinks: true,
    includeHover: true,
    includeNewButton: true,
    includeSearchBar: false,
    addButtonText: 'Add New',
  }, { newEntity: {
    initialEntity: { name: '' },
    buttonText: 'Add List',
  }});

  const listDetails = document.getElementById('list-details');
  if (listDetails) {
    createRoot(listDetails).render(
      <div className="container widened-container">
        <ListDetails />
      </div>
    );
  }

  renderFullIndex('grocery-stores-index', {
    entityName: 'groceryStore',
    entityNamePlural: 'groceryStores',
    columns: [
      'name',
    ],
    modalRows: 1,
    modalDimensions: { width: 700 },
    includeLinks: true,
    includeHover: true,
    includeNewButton: true,
    includeSearchBar: false,
    addButtonText: 'Add New',
  }, { newEntity: {
    initialEntity: { name: '' },
    buttonText: 'Add Grocery Store',
  }});

  const groceryStoreDetails = document.getElementById('grocery-store-details');
  if (groceryStoreDetails) {
    createRoot(groceryStoreDetails).render(
      <div className="container widened-container">
        <GroceryStoreDetails />
      </div>
    );
  }

  renderFullIndex('grocery-items-index', {
    entityName: 'groceryItem',
    entityNamePlural: 'groceryItems',
    columns: [
      'name',
    ],
    modalRows: 1,
    modalDimensions: { width: 700 },
    includeLinks: true,
    includeHover: true,
    includeNewButton: true,
    includeSearchBar: false,
    addButtonText: 'Add New',
  }, { newEntity: {
    initialEntity: { name: '' },
    buttonText: 'Add Grocery Item',
  }});

  const groceryItemDetails = document.getElementById('grocery-item-details');
  if (groceryItemDetails) {
    createRoot(groceryItemDetails).render(
      <div className="container widened-container">
        <SimpleDetails
          entityName='groceryItem'
          header='Edit Grocery Item'
          initialEntity={{
            name: '',
          }}
          fields = {[
            [
              { columnWidth: 12, property: 'name' },
            ],
          ]}
          deleteCallback={ () => { window.location.pathname = '/settings' }}
        />
      </div>
    );
  }

  renderFullIndex('grocery-lists-index', {
    entityName: 'groceryList',
    entityNamePlural: 'groceryLists',
    columns: [
      'name',
    ],
    modalRows: 1,
    modalDimensions: { width: 700 },
    includeLinks: true,
    includeHover: true,
    includeNewButton: true,
    includeSearchBar: false,
    addButtonText: 'Add New',
  }, { newEntity: {
    initialEntity: { name: '' },
    buttonText: 'Add Grocery List',
  }});

  const groceryListDetails = document.getElementById('grocery-list-details');
  if (groceryListDetails) {
    createRoot(groceryListDetails).render(
      <div className="container widened-container">
        <GroceryListDetails />
      </div>
    );
  }
});
