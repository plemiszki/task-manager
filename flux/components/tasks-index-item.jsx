import React from 'react';
import ClientActions from '../actions/client-actions.js';
import TasksStore from '../stores/tasks-store.js';

export default class TaskIndexItem extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      editing: false,
      task: this.props.task,
      subtasks: TasksStore.subTasks(this.props.task)
    }
  }

  componentDidMount() {
    this.attachDragHandler();
    this.attachDropZoneHandlers();
  }

  componentWillReceiveProps(nextProps) {
    $('.color-picker').addClass('hidden');
    this.setState({
      task: nextProps.task,
      subtasks: TasksStore.subTasks(nextProps.task)
    }, function() {
      this.attachDragHandler();
      this.attachDropZoneHandlers();
    });
  }

  attachDragHandler() {
    $('#' + this.createTaskId()).draggable({
      cursor: '-webkit-grabbing',
      handle: '.handle',
      helper: function() { return '<div></div>'; },
      start: this.dragStartHandler,
      stop: this.dragEndHandler
    });
  }

  attachDropZoneHandlers() {
    $('#' + this.createDropAreaId() + ', #' + this.createSubtaskTopDropAreaId()).droppable({
      accept: Common.canIDrop,
      tolerance: 'pointer',
      over: Common.dragOverHandler,
      out: Common.dragOutHandler,
      drop: this.props.dropHandler
    });
  }

  clickText(e) {
    e.preventDefault();
    if ($(e.target.parentElement.parentElement).hasClass('duplicate') === false) {
      e.target.classList.remove('handle');
      this.setState({
        editing: true
      });
    }
  }

  changeText(e) {
    var task = this.state.task;
    task.text = e.target.value;
    this.setState({
      task: task
    });
  }

  clickEnter(e) {
    if (e.key == 'Enter') {
      e.target.parentElement.children[0].classList.add('handle');
      this.setState({
        editing: false
      });
      this.props.updateTask(this.state.task);
    }
  }

  clickExpand() {
    var task = this.state.task;
    task.expanded = !task.expanded;
    this.setState({
      task: task
    }, function() {
      this.props.updateTask(this.state.task);
    });
  }

  deleteTask(e) {
    e.preventDefault();
    this.props.deleteTask(this.state.task);
  }

  finishedTask(e) {
    e.preventDefault();
    var task = this.state.task;
    task.complete = !task.complete;
    this.setState({
      task: task
    }, function() {
      this.props.updateTask(this.state.task);
    });
  }

  clickColorPicker(e) {
    e.preventDefault();
    $(e.target.parentElement.parentElement.children[1]).toggleClass('hidden');
  }

  pickColor(e) {
    var style = e.target.getAttribute('style');
    var color = style.split('(')[1].slice(0, -2);
    var task = this.state.task;
    task.color = color;
    this.setState({
      task: task
    }, function() {
      this.props.updateTask(this.state.task);
    })
  }

  addSubTask(e) {
    e.preventDefault();
    this.props.addSubTask(this.state.task);
  }

  dragStartHandler(e) {
    $('.task').addClass('dragging');
    $('.task, a, input').addClass('grabbing');
    e.target.classList.add('dragging-this');
  }

  dragEndHandler() {
    $('.dragging').removeClass('dragging');
    $('.task, a, input').removeClass('grabbing');
    $('.dragging-this').removeClass('dragging-this');
    $('.highlight-black').removeClass('highlight-black');
    $('.highlight-blue').removeClass('highlight-blue');
  }

  createTaskId() {
    var currentId = this.props.parentId || this.props.task.timeframe;
    return currentId + "-" + this.props.index;
  }

  createDropAreaId() {
    var currentId = this.props.parentId || this.props.task.timeframe;
    return currentId + "-" + this.props.index + "-drop";
  }

  createSubtaskTopDropAreaId() {
    return this.props.parentId + "-top-drop";
  }

  taskStyle() {
    if (this.state.task.duplicate_id) {
      return { background: 'rgba(' + this.state.task.color + ', 0.5)' };
    } else {
      return { background: 'rgb(' + this.state.task.color + ')' };
    }
  }

  formatTaskText() {
    let task = this.state.task;
    let text = task.text;
    if (this.state.editing) {
      return text;
    }
    let alteredText = text;
    if (text.indexOf('$cc') > -1 || text.indexOf('$tc') > -1) {
      let completedChildren = this.state.subtasks.reduce((accum, current) => {
        return accum + (current.complete ? 1 : 0)
      }, 0)
      alteredText = alteredText.split('$cc').join(completedChildren);
      alteredText = alteredText.split('$tc').join(this.state.subtasks.length);
    }
    return alteredText;
  }

  render() {
    return(
      <div className="group">
        <div id={ this.createTaskId() } className={ "task" + (this.state.task.expanded ? " expanded" : "") + (this.state.task.duplicate_id ? " duplicate" : "") + (this.state.task.joint_id ? " joint" : "") } style={ this.taskStyle() } data-taskid={ this.props.task.id }>
          <div className={ "controls" + (this.state.editing ? " hidden" : "") }>
            <a href="" className={ "delete-button" + (this.state.task.duplicate_id && this.state.task.parent_id ? " hidden" : "") } onClick={ this.deleteTask.bind(this) }></a>
            <a href="" className="done-button" onClick={ this.finishedTask.bind(this) }></a>
            <a href="" className={ "add-subtask-button" + (this.state.task.duplicate_id ? " hidden" : "")} onClick={ this.addSubTask.bind(this) }></a>
            <a href="" className={ "color-button" + ((this.state.task.duplicate_id || this.state.task.parent_id) ? " hidden" : "") } onClick={ this.clickColorPicker.bind(this) }></a>
          </div>
          <div className="hidden color-picker">
            <div onClick={ this.pickColor.bind(this) } style={ { 'backgroundColor': 'rgb(234, 30, 30)' } }></div>
            <div onClick={ this.pickColor.bind(this) } style={ { 'backgroundColor': 'rgb(255, 175, 163)' } }></div>
            <div onClick={ this.pickColor.bind(this) } style={ { 'backgroundColor': 'rgb(255, 175, 36)' } }></div>
            <div onClick={ this.pickColor.bind(this) } style={ { 'backgroundColor': 'rgb(238, 244, 66)' } }></div>
            <div onClick={ this.pickColor.bind(this) } style={ { 'backgroundColor': 'rgb(92, 184, 92)' } }></div>
            <div onClick={ this.pickColor.bind(this) } style={ { 'backgroundColor': 'rgb(111, 138, 240)' } }></div>
            <div onClick={ this.pickColor.bind(this) } style={ { 'backgroundColor': 'rgb(181, 111, 240)' } }></div>
            <div onClick={ this.pickColor.bind(this) } style={ { 'backgroundColor': 'rgb(175, 96, 26)' } }></div>
            <div onClick={ this.pickColor.bind(this) } style={ { 'backgroundColor': 'rgb(210, 206, 200)' } }></div>
          </div>
          <div className={ ((this.state.editing) ? "hidden" : (this.state.task.complete ? "check" : (this.state.subtasks == 0 ? "hidden" : (this.state.task.expanded ? "minus" : "plus")))) } onClick={ this.clickExpand.bind(this) }>
          </div>
          <div className="click-area" onClick={ this.clickText.bind(this) }>
            <div className="handle"></div>
            <input className={ this.state.editing ? "" : "disabled" } disabled={ !this.state.editing } value={ this.formatTaskText.call(this) } onChange={ this.changeText.bind(this) } onKeyPress={ this.clickEnter.bind(this) } />
          </div>
        </div>
        { this.renderBottomDropArea() }
        { this.renderSubTasks() }
      </div>
    );
  }

  renderBottomDropArea() {
    if (!this.state.task.expanded) {
      return(
        <div id={ this.createDropAreaId() } className="drop-area"></div>
      );
    }
  }

  renderSubTasks() {
    if (this.state.task.expanded) {
      return(
        <div id={ "subtasks-" + this.createTaskId() } className="subtasks">
          <div id={ this.createTaskId() + '-top-drop' } className="drop-area"></div>
          { this.state.subtasks.map(function(task, index) {
            return(
              <TaskIndexItem key={ index } index={ index } task={ task } parentId={ this.createTaskId() } updateTask={ this.props.updateTask.bind(this) } addSubTask={ this.props.addSubTask.bind(this) } deleteTask={ this.props.deleteTask.bind(this) } dropHandler={ this.props.dropHandler.bind(this) } />
            );
          }.bind(this)) }
        </div>
      )
    }
  }
};
