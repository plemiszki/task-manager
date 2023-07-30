import React from 'react'
import { createRoot } from 'react-dom/client'
import ReactModal from 'react-modal'
import CurrentUser from './components/current-user.jsx'
// import TasksIndex from './components/tasks-index.jsx'
// import TasksTimeframe from './components/tasks-timeframe.jsx'
// import FutureTasksIndex from './components/future-tasks-index.jsx'
// import RecurringTasksIndex from './components/recurring-tasks-index.jsx'
// import RecurringTaskDetails from './components/recurring-task-details.jsx'
// import RecipesIndex from './components/recipes-index.jsx'
// import RecipeDetails from './components/recipe-details.jsx'

const renderIf = (id, component, props = {}) => {
  const node = document.getElementById(id);
  if (node) {
    const root = createRoot(node);
    root.render(React.createElement(component, props));
  }
}

document.addEventListener("DOMContentLoaded", () => {

  ReactModal.setAppElement(document.body);

  renderIf('current-user', CurrentUser);

});

// $(document).ready(() => {
  // ReactModal.setAppElement(document.body);
  // if ($('#current-user')[0]) {
  //   ReactDOM.render(
  //     <Provider store={ store }>
  //       <CurrentUser />
  //     </Provider>,
  //     document.getElementById("current-user")
  //   );
  // }
  // if ($('#tasks-index')[0]) {
  //   ReactDOM.render(
  //     <Provider store={ store }>
  //       <TasksIndex />
  //     </Provider>,
  //     document.getElementById("tasks-index")
  //   );
  // }
  // if ($('#future-tasks-index')[0]) {
  //   ReactDOM.render(
  //     <Provider store={ store }>
  //       <FutureTasksIndex />
  //     </Provider>,
  //     document.getElementById("future-tasks-index")
  //   );
  // }
  // if ($('#recurring-tasks-index')[0]) {
  //   ReactDOM.render(
  //     <Provider store={ store }>
  //       <RecurringTasksIndex />
  //     </Provider>,
  //     document.getElementById("recurring-tasks-index")
  //   );
  // }
  // if ($('#recurring-task-details')[0]) {
  //   ReactDOM.render(
  //     <Provider store={ store }>
  //       <RecurringTaskDetails />
  //     </Provider>,
  //     document.getElementById("recurring-task-details")
  //   );
  // }
  // if ($('#recipes-index')[0]) {
  //   ReactDOM.render(
  //     <Provider store={ store }>
  //       <RecipesIndex />
  //     </Provider>,
  //     document.getElementById("recipes-index")
  //   );
  // }
  // if ($('#recipe-details')[0]) {
  //   ReactDOM.render(
  //     <Provider store={ store }>
  //       <RecipeDetails />
  //     </Provider>,
  //     document.getElementById("recipe-details")
  //   );
  // }
// });
