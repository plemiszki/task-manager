import React from 'react'

const nextShortestTimeframe = {
  'backlog': 'life',
  'life': 'year',
  'year': 'month',
  'month': 'weekend',
  'weekend': 'day'
};

export default class TaskIndexItem extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      editing: false,
      task: this.props.task,
      subtasks: this.props.task.subtasks || []
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
      subtasks: nextProps.task.subtasks || []
    }, () => {
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
    let task = this.state.task;
    task.expanded = !task.expanded;
    this.setState({
      task: task
    }, () => {
      this.props.updateTask(this.state.task);
    });
  }

  deleteTask(e) {
    e.preventDefault();
    this.props.deleteTask(this.state.task.id);
  }

  finishedTask(e) {
    e.preventDefault();
    let task = this.state.task;
    task.complete = !task.complete;
    this.setState({
      task: task
    }, () => {
      this.props.updateTask(this.state.task);
    });
  }

  clickColorPicker(e) {
    e.preventDefault();
    $(e.target.parentElement.parentElement.children[1]).toggleClass('hidden');
  }

  pickColor(e) {
    let style = e.target.getAttribute('style');
    let color = style.split('(')[1].slice(0, -2);
    let task = this.state.task;
    task.color = color;
    this.setState({
      task: task
    }, () => {
      this.props.updateTask(this.state.task);
    })
  }

  clickAddSubtask(e, task) {
    e.preventDefault();
    this.props.createTask({
      timeframe: this.props.timeframe,
      parentId: this.state.task.id
    });
  }

  copySubTask(e) {
    e.preventDefault();
    this.props.copyTask({
      timeframe: nextShortestTimeframe[this.state.task.timeframe],
      duplicateOf: this.state.task.id
    });
  }

  copySubTaskToDay(e) {
    e.preventDefault();
    this.props.copyTask({
      timeframe: 'day',
      duplicateOf: this.state.task.id
    });
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
    let currentId = this.props.parentId || this.props.task.timeframe;
    return currentId + "-" + this.props.index;
  }

  createDropAreaId() {
    let currentId = this.props.parentId || this.props.task.timeframe;
    return currentId + "-" + this.props.index + "-drop";
  }

  createSubtaskTopDropAreaId() {
    return this.props.parentId + "-top-drop";
  }

  taskStyle() {
    if (this.state.task.duplicateId) {
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
    let { task, editing, subtasks } = this.state;
    return(
      <div className="group">
        <div id={ this.createTaskId() } className={ "task" + (task.expanded ? " expanded" : "") + (task.duplicateId ? " duplicate" : "") + (task.jointId ? " joint" : "") } style={ this.taskStyle() } data-taskid={ this.props.task.id }>
          <div className={ "controls" + (editing ? " hidden" : "") }>
            <a href="" className={ "delete-button" + (task.duplicateId && task.parentId ? " hidden" : "") } onClick={ this.deleteTask.bind(this) }></a>
            <a href="" className="done-button" onClick={ this.finishedTask.bind(this) }></a>
            <a href="" className={ "add-subtask-button" + (task.duplicateId ? " hidden" : "")} onClick={ this.clickAddSubtask.bind(this) }></a>
            <a href="" className={ "color-button" + ((task.duplicateId || task.parentId) ? " hidden" : "") } onClick={ this.clickColorPicker.bind(this) }></a>
            <a href="" className={ "copy-subtask-button" + (((task.duplicateId || task.parentId) && task.timeframe !== 'day') ? "" : " hidden") } onClick={ this.copySubTask.bind(this) }></a>
            <a href="" className={ "copy-subtask-to-day-button" + (((task.duplicateId || task.parentId) && task.timeframe === 'month') ? "" : " hidden") } onClick={ this.copySubTaskToDay.bind(this) }></a>
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
          <div className={ (editing ? "hidden" : (task.complete ? "check" : (subtasks.length == 0 ? "hidden" : (task.expanded ? "minus" : "plus")))) } onClick={ this.clickExpand.bind(this) }>
          </div>
          <div className="click-area" onClick={ this.clickText.bind(this) }>
            <div className="handle"></div>
            <input className={ editing ? "" : "disabled" } disabled={ !editing } value={ this.formatTaskText.call(this) } onChange={ this.changeText.bind(this) } onKeyPress={ this.clickEnter.bind(this) } />
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
          { this.state.subtasks.map((task, index) => {
            return(
              <TaskIndexItem
                key={ index }
                index={ index }
                task={ task }
                parentId={ this.createTaskId() }
                createTask={ this.props.createTask.bind(this) }
                updateTask={ this.props.updateTask.bind(this) }
                copyTask={ this.props.copyTask.bind(this) }
                deleteTask={ this.props.deleteTask.bind(this) }
                dropHandler={ this.props.dropHandler.bind(this) }
              />
            );
          }) }
        </div>
      );
    }
  }
};