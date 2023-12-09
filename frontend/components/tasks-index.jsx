import React from 'react'
import TasksTimeframe from './tasks-timeframe.jsx'
import { fetchEntities, sendRequest, updateEntity, createEntity, deleteEntity, ModalSelect, Common } from 'handy-components'
import { pascalCaseTransform } from 'change-case';

export default class TasksIndex extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      spinner: true,
      tasks: {
        day: [],
        weekend: [],
        month: [],
        year: [],
        life: [],
        backlog: [],
      },
      lists: [],
      listModalOpen: false,
    }
  }

  componentDidMount() {
    fetchEntities({ directory: 'lists' }).then((response) => {
      const { lists } = response;
      this.setState({ lists });
      fetchEntities({ directory: 'tasks' }).then((response) => {
        this.updateComponentTasks(response);
      });
    });
  }

  createTask(args) {
    let { timeframe, parentId, color, position } = args;
    this.setState({
      spinner: true,
    });
    createEntity({
      directory: 'tasks',
      entityName: 'task',
      entity: {
        timeframe,
        parentId,
        color,
        position,
      }
    }).then((response) => {
      this.updateComponentTasks(response);
    });
  }

  updateTask(newTask) {
    this.setState({
      spinner: true,
    });
    updateEntity({
      directory: 'tasks',
      entityName: 'task',
      entity: newTask,
    }).then((response) => {
      this.updateComponentTasks(response);
    });
  }

  copyTask(args) {
    let { duplicateOf, timeframe, position } = args;
    this.setState({
      spinner: true,
    });
    createEntity({
      directory: 'tasks',
      entityName: 'task',
      entity: {
        duplicateOf,
        timeframe,
        position,
      }
    }).then((response) => {
      this.updateComponentTasks(response);
    }, () => {
      alert('A duplicate of this task already exists!');
      this.setState({
        spinner: false,
      });
    });
  }

  moveTask(args) {
    let { timeframe, id } = args;
    this.setState({
      spinner: true,
    });
    sendRequest(`/api/tasks/${id}/move`, {
      method: 'PATCH',
      data: {
        timeframe,
      }
    }).then((response) => {
      this.setState({
        spinner: false,
        tasks: response.tasks,
      });
    });
  }

  rearrangeTasks(args) {
    this.setState({
      spinner: true,
    });
    sendRequest('/api/tasks/rearrange', {
      method: 'PATCH',
      data: {
        tasks: args.newPositions,
      },
    }).then((response) => {
      this.updateComponentTasks(response);
    });
  }

  convertToFutureTask(args) {
    this.setState({
      spinner: true,
    });
    sendRequest(`/api/tasks/${args.id}/convert_to_future`, {
      method: 'post',
    }).then((response) => {
      this.setState({
        spinner: false,
        tasks: response.tasks,
      });
    });
  }

  deleteTask(id) {
    this.setState({
      spinner: true,
    });
    deleteEntity({
      id,
      directory: 'tasks',
      entityName: 'task',
    }).then((response) => {
      this.updateComponentTasks(response);
    });
  }

  addSubtasksFromList(list) {
    const { activeTaskId } = this.state;
    this.setState({
      listModalOpen: false,
      spinner: true,
    });
    sendRequest(`/api/tasks/${activeTaskId}/add_subtasks_from_list/${list.id}`, {
      method: 'post',
    }).then((response) => {
      this.updateComponentTasks(response);
      this.setState({
        spinner: false,
      });
    });
  }

  updateComponentTasks(response) {
    const timeframeKeys = Object.keys(response.tasks);
    if (timeframeKeys.length === 1) { // response from an update, etc.
      let { tasks } = this.state;
      tasks[timeframeKeys[0]] = response.tasks[timeframeKeys[0]];
      this.setState({
        spinner: false,
        tasks,
      });
    } else { // response from fetch entities
      this.setState({
        spinner: false,
        tasks: response.tasks,
      });
    }
  }

  render() {
    const { lists, listModalOpen } = this.state;
    return(
      <div className="container widened-container">
        <div className="row">
          { this.renderTimeframes() }
        </div>
        <ModalSelect
          isOpen={ listModalOpen }
          options={ lists }
          property="name"
          func={ list => this.addSubtasksFromList(list) }
          onClose={ Common.closeModals.bind(this) }
          zIndex= { 3 }
        />
      </div>
    );
  }

  renderTimeframes() {
    return ['day', 'weekend', 'month', 'year', 'life', 'backlog'].map((timeframe) => {
      return(
        <div key={ timeframe } id={ `tasks-index-${timeframe}` } className="col-xs-12 col-md-4">
          <TasksTimeframe
            spinner={ this.state.spinner }
            timeframe={ timeframe }
            timeframeTasks={ this.state.tasks[timeframe] }
            createTask={ this.createTask.bind(this) }
            updateTask={ this.updateTask.bind(this) }
            convertToFutureTask={ this.convertToFutureTask.bind(this) }
            copyTask={ this.copyTask.bind(this) }
            moveTask={ this.moveTask.bind(this) }
            deleteTask={ this.deleteTask.bind(this) }
            rearrangeTasks={ this.rearrangeTasks.bind(this) }
            openListsModal={ task => this.setState({ listModalOpen: true }) }
            setActiveTaskId={ id => this.setState({ activeTaskId: id }) }
          />
        </div>
      );
    });
  }

  componentDidUpdate() {
    $('.match-height').matchHeight();
  }
}
