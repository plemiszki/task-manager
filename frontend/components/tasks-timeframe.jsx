import React from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { Common, Index } from 'handy-components'
import HandyTools from 'handy-tools'
import TasksCommon from '../../app/assets/javascripts/common.jsx'
import TasksIndexItem from './tasks-index-item.jsx'
import { fetchEntity, updateEntity } from '../actions/index'

class TasksTimeframe extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      fetching: true,
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
    if (this.props.timeframe == "weekend") {
      this.props.fetchEntity({
        url: '/api/user',
        entityName: 'user'
      }).then(() => {
        this.setState({
          longWeekend: this.props.user.long_weekend
        });
      });
    }
  }

  clickAdd(e) {
    e.preventDefault();
    this.props.createTask({
      timeframe: this.props.timeframe
    });
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
    if (parent.classList[0] == "tasks-timeframe") { // top drop zone
      parentId = parent.parentElement.getAttribute('id');
      $tasks = $('#' + parentId + ' > .tasks-timeframe > .group > .task');
    } else if (parent.parentElement.classList[0] == "tasks-timeframe") { // root level
      parentId = parent.parentElement.parentElement.getAttribute('id');
      $tasks = $('#' + parentId + ' > .tasks-timeframe > .group > .task');
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
      console.log(hash);
      newHash = this.rearrangeFields(hash, draggedIndex, dropZoneIndex);
      console.log(newHash);
      this.props.rearrangeTasks({
        newPositions: newHash
      });
    } else {
      let taskId = ui.draggable[0].dataset.taskid;
      let newTaskPosition = +dropZoneIndex + 1;
      this.props.copyTask({
        timeframe: dropZoneTimeFrame,
        position: newTaskPosition,
        duplicateOf: taskId
      });
    }
  }

  rearrangeFields(hash, draggedIndex, dropZoneIndex) {
    console.log(hash);
    console.log(draggedIndex);
    console.log(dropZoneIndex);
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

  getIndexFromId(id) {
    var array = id.split('-');
    return array[array.length - 1];
  }

  clickWeekend() {
    this.props.updateEntity({
      url: '/api/user',
      entityName: 'user',
      entity: {
        longWeekend: !this.state.longWeekend
      }
    }).then(() => {
      this.setState({
        longWeekend: this.props.user.long_weekend
      });
    })
  }

  render() {
    return(
      <div className="tasks-timeframe match-height" data-index={ this.props.timeframe }>
        { Common.renderSpinner(this.props.fetching) }
        { Common.renderGrayedOut(this.props.fetching, -10, -15) }
        { this.renderHeader() }
        <a href="" onClick={ this.clickAdd.bind(this) }>Add Task</a>
        <hr />
        <div id={ this.props.timeframe + '-top-drop' } className="drop-area"></div>
        { this.props.timeframeTasks.map((task, index) => {
          return(
            <TasksIndexItem
              key={ index }
              index={ index }
              task={ task }
              level="0"
              createTask={ this.props.createTask.bind(this) }
              updateTask={ this.props.updateTask.bind(this) }
              copyTask={ this.props.copyTask.bind(this) }
              deleteTask={ this.props.deleteTask.bind(this) }
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
          <h1 id="weekend-header" onClick={ this.clickWeekend.bind(this) }>{ text }</h1>
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
}

const mapStateToProps = (reducers) => {
  return reducers.standardReducer;
};

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ fetchEntity, updateEntity }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(TasksTimeframe);
