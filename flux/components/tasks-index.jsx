import React from 'react'
import { Common, Index } from 'handy-components'
import HandyTools from 'handy-tools'
import TasksCommon from '../../app/assets/javascripts/common.jsx'
import ClientActions from '../actions/client-actions.js'
import TasksStore from '../stores/tasks-store.js'
import UserStore from '../stores/user-store.js'
import ErrorStore from '../stores/error-store.js'
import TasksIndexItem from './tasks-index-item.jsx'

const nextShortestTimeframe = {
  'backlog': 'life',
  'life': 'year',
  'year': 'month',
  'month': 'weekend',
  'weekend': 'day'
};

export default class TasksIndex extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      fetching: true,
      rootTasks: [],
      tasks: [],
      longWeekend: false
    }
  }

  componentDidMount() {
    $('#' + this.props.timeframe + '-top-drop').droppable({
      accept: TasksCommon.canIDrop,
      tolerance: 'pointer',
      over: TasksCommon.dragOverHandler,
      out: TasksCommon.dragOutHandler,
      drop: this.dropHandler.bind(this)
    });
    this.tasksListener = TasksStore.addListener(this.getTasks.bind(this));
    this.errorListener = ErrorStore.addListener(this.getError.bind(this));
    if (this.props.timeframe == "life") {
      ClientActions.fetchTasks(this.props.timeframe);
    }
    if (this.props.timeframe == "weekend") {
      this.userListener = UserStore.addListener(this.getUser.bind(this));
    }
  }

  componentDidUpdate() {
    $('.match-height').matchHeight();
  }

  getTasks() {
    this.setState({
      fetching: false,
      rootTasks: TasksStore.rootTasks(this.props.timeframe),
      tasks: TasksStore.all(this.props.timeframe)
    });
  }

  getUser() {
    this.setState({
      longWeekend: UserStore.user().long_weekend
    });
  }

  getError() {
    this.setState({
      fetching: false
    });
  }

  clickAdd(e) {
    e.preventDefault();
    this.setState({
      fetching: true
    });
    ClientActions.addTask({
      timeframe: this.props.timeframe
    });
  }

  updateTask(task) {
    this.setState({
      fetching: true
    });
    ClientActions.updateTask(task);
  }

  addSubTask(task) {
    this.setState({
      fetching: true
    });
    ClientActions.addTask({
      timeframe: this.props.timeframe,
      parentId: task.id
    });
  }

  copySubTask(task) {
    this.setState({
      fetching: true
    });
    ClientActions.addTask({
      timeframe: nextShortestTimeframe[this.props.timeframe],
      task
    });
  }

  copySubTaskToDay(task) {
    this.setState({
      fetching: true
    });
    ClientActions.addTask({
      timeframe: 'day',
      task
    });
  }

  deleteTask(task) {
    this.setState({
      fetching: true
    });
    ClientActions.deleteTask(task);
  }

  dropHandler(e, ui) {
    let draggedTimeFrame = ui.draggable.attr('id').split('-')[0];
    let droppedTimeFrame = e.target.getAttribute('id').split('-')[0];
    let draggedIndex = this.getIndexFromId(ui.draggable.attr('id'));
    let dropZoneArray = e.target.getAttribute('id').split('-');
    let dropZoneIndex = dropZoneArray[dropZoneArray.length - 2];
    if (dropZoneIndex == "top") { dropZoneIndex = -1; }

    let hash = {};
    let parent = e.target.parentElement;
    let parentId, $tasks, timeframe;
    if (parent.classList[0] == "tasks-index") { // top drop zone
      parentId = parent.parentElement.getAttribute('id');
      $tasks = $('#' + parentId + ' > .tasks-index > .group > .task');
    } else if (parent.parentElement.classList[0] == "tasks-index") { // root level
      parentId = parent.parentElement.parentElement.getAttribute('id');
      $tasks = $('#' + parentId + ' > .tasks-index > .group > .task');
    } else if (parent.getAttribute('id') && parent.getAttribute('id').split('-')[0] == "subtasks") { // subtasks top drop zone
      parentId = parent.getAttribute('id');
      $tasks = $('#' + parentId + ' .task'); // <-- this will grab all of the child tasks within the subtask, even grandchildren (etc.) not involved in the rearrange
      var properLevelsDeep = parentId.split('-').length - 1;
      $tasks = $tasks.filter((index, task) => {
        var levelsDeep = task.id.split('-').length - 1;
        return properLevelsDeep === levelsDeep;
      });
    } else { // subtasks
      parentId = parent.parentElement.parentElement.children[0].getAttribute('id');
      $tasks = $('#subtasks-' + parentId + ' .task');
      var properLevelsDeep = parentId.split('-').length;
      $tasks = $tasks.filter((index, task) => {
        var levelsDeep = task.id.split('-').length - 1;
        return properLevelsDeep === levelsDeep;
      });
    }

    $tasks.each((index, task) => {
      var index = this.getIndexFromId(task.getAttribute('id'));
      var id = task.dataset.taskid;
      hash[index] = +id;
    })

    var newHash;
    this.setState({
      fetching: true
    });
    if (draggedTimeFrame === droppedTimeFrame) {
      newHash = this.rearrangeFields(hash, draggedIndex, dropZoneIndex);
      ClientActions.rearrangeTasks(newHash, droppedTimeFrame);
    } else {
      var taskid = ui.draggable[0].dataset.taskid;
      var task = TasksStore.find(taskid);
      task.order = +dropZoneIndex + 1;
      newHash = this.rearrangeOtherFields(hash, dropZoneIndex);
      ClientActions.addTask({
        timeframe: dropZoneTimeFrame,
        task,
        newOrder: newHash
      });
    }
  }

  rearrangeFields(hash, draggedIndex, dropZoneIndex) {
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
  }

  rearrangeOtherFields(hash, dropZoneIndex) {
    var result = {};
    var draggedTaskId;
    var n = 0;
    if (dropZoneIndex == -1) {
      n = 1;
    }
    for (var i = 0; i < Object.keys(hash).length; i++) {
      result[Object.keys(result).length + n] = hash[i];
      if (i == dropZoneIndex) {
        n = 1;
      }
    }
    return result;
  }

  getIndexFromId(id) {
    var array = id.split('-');
    return array[array.length - 1];
  }

  clickWeekend() {
    var user = UserStore.user();
    user.long_weekend = !user.long_weekend;
    ClientActions.updateUser(user);
  }

  render() {
    return(
      <div className="tasks-index match-height" data-index={ this.props.timeframe }>
        { Common.renderSpinner(this.state.fetching) }
        { Common.renderGrayedOut(this.state.fetching, -10, -15) }
        { this.renderHeader() }
        <a href="" onClick={ this.clickAdd.bind(this) }>Add Task</a>
        <hr />
        <div id={ this.props.timeframe + '-top-drop' } className="drop-area"></div>
        { this.state.rootTasks.map((task, index) => {
          return(
            <TasksIndexItem
              key={ index }
              index={ index }
              task={ task }
              level="0"
              updateTask={ this.updateTask.bind(this) }
              addSubTask={ this.addSubTask.bind(this) }
              copySubTask={ this.copySubTask.bind(this) }
              copySubTaskToDay={ this.copySubTaskToDay.bind(this) }
              deleteTask={ this.deleteTask.bind(this) }
              dropHandler={ this.dropHandler.bind(this) }
            />
          );
        }) }
      </div>
    );
  }

  renderHeader() {
    switch (this.props.timeframe) {
      case 'day':
        return(
          <h1>Today</h1>
        )
      case 'weekend':
        var text = this.state.longWeekend ? 'Long Weekend' : 'Weekend';
        return(
          <h1 id="weekend-header" onClick={ this.clickWeekend }>{ text }</h1>
        )
      case 'month':
        return(
          <h1>This Month</h1>
        )
      case 'year':
        return(
          <h1>This Year</h1>
        )
      case 'life':
        return(
          <h1>Lifetime</h1>
        )
      case 'backlog':
        return(
          <h1>Backlog</h1>
        )
    }
  }
};
