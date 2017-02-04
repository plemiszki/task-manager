var React = require('react');
var ClientActions = require('../actions/client-actions.js');
var TasksStore = require('../stores/tasks-store.js');

var TaskIndexItem = React.createClass({

  getInitialState: function() {
    return({
      editing: false,
      task: this.props.task,
      subtasks: TasksStore.subTasks(this.props.task)
    });
  },

  componentDidMount: function() {
    $('#' + this.createTaskId()).draggable({
      cursor: '-webkit-grabbing',
      handle: '.handle',
      helper: function() { return '<div></div>'; },
      start: this.dragStartHandler,
      stop: this.dragEndHandler
    });
    this.attachDropZoneHandlers();
  },

  componentWillReceiveProps: function(nextProps) {
    var $bottomDropArea = $('#' + this.createDropAreaId());
    if ($bottomDropArea.data('droppable')) {
      $bottomDropArea.droppable('destroy');
    }
    var $subtasksTopDropArea = $('#' + this.createSubtaskTopDropAreaId());
    if ($subtasksTopDropArea.data('droppable')) {
      $subtasksTopDropArea.droppable('destroy');
    }
    this.setState({
      task: nextProps.task,
      subtasks: TasksStore.subTasks(nextProps.task)
    }, function() {
      this.attachDropZoneHandlers();
    });
  },

  attachDropZoneHandlers: function() {
    $('#' + this.createDropAreaId() + ', #' + this.createSubtaskTopDropAreaId()).droppable({
      accept: Common.canIDrop,
      tolerance: 'pointer',
      over: Common.dragOverHandler,
      out: Common.dragOutHandler,
      drop: this.props.dropHandler
    });
  },

  clickText: function(event) {
    event.preventDefault();
    if ($(event.target.parentElement.parentElement).hasClass('duplicate') === false) {
      event.target.classList.remove('handle');
      this.setState({
        editing: true
      });
    }
  },

  changeText: function(event) {
    var task = this.state.task;
    task.text = event.target.value;
    this.setState({
      task: task
    });
  },

  clickEnter: function(event) {
    if (event.key == 'Enter') {
      event.target.parentElement.children[0].classList.add('handle');
      this.setState({
        editing: false
      });
      this.props.updateTask(this.state.task);
    }
  },

  clickExpand: function(event) {
    var task = this.state.task;
    task.expanded = !task.expanded;
    this.setState({
      task: task
    }, function() {
      this.props.updateTask(this.state.task);
    });
  },

  deleteTask: function(event) {
    event.preventDefault();
    this.props.deleteTask(this.state.task);
  },

  finishedTask: function(event) {
    event.preventDefault();
    var task = this.state.task;
    task.complete = !task.complete;
    this.setState({
      task: task
    }, function() {
      this.props.updateTask(this.state.task);
    });
  },

  addSubTask: function(event) {
    event.preventDefault();
    this.props.addSubTask(this.state.task);
  },

  dragStartHandler: function(e) {
    $('.task').addClass('dragging');
    $('.task, a, input').addClass('grabbing');
    e.target.classList.add('dragging-this');
  },

  dragEndHandler: function(e) {
    $('.dragging').removeClass('dragging');
    $('.task, a, input').removeClass('grabbing');
    $('.dragging-this').removeClass('dragging-this');
    $('.highlight-black').removeClass('highlight-black');
    $('.highlight-blue').removeClass('highlight-blue');
  },

  createTaskId: function() {
    var currentId = this.props.parentId || this.props.task.timeframe;
    return currentId + "-" + this.props.index;
  },

  createDropAreaId: function() {
    var currentId = this.props.parentId || this.props.task.timeframe;
    return currentId + "-" + this.props.index + "-drop";
  },

  createSubtaskTopDropAreaId: function() {
    return this.props.parentId + "-top-drop";
  },

  render: function() {
    return(
      <div className="group">
        <div id={this.createTaskId()} className={"task" + (this.state.task.expanded ? " expanded" : "") + (this.state.task.duplicate_id ? " duplicate" : "")} data-taskid={this.props.task.id}>
          {this.state.task.order}
          <div className={"controls" + (this.state.editing ? " hidden" : "")}>
            <a href="" className="delete-button" onClick={this.deleteTask}></a>
            <a href="" className="done-button" onClick={this.finishedTask}></a>
            <a href="" className="add-subtask-button" onClick={this.addSubTask}></a>
            <a href="" className="color-button"></a>
          </div>
          <div className={((this.state.editing) ? "hidden" : (this.state.task.complete ? "check" : (this.state.subtasks == 0 ? "hidden" : (this.state.task.expanded ? "minus" : "plus"))))} onClick={this.clickExpand}>
          </div>
          <div className="click-area" onClick={this.clickText}>
            <div className="handle"></div>
            <input className={this.state.editing ? "" : "disabled"} disabled={!this.state.editing} value={this.state.task.text} onChange={this.changeText} onKeyPress={this.clickEnter} />
          </div>
        </div>
        {this.renderBottomDropArea()}
        {this.renderSubTasks()}
      </div>
    );
  },

  renderBottomDropArea: function() {
    if (!this.state.task.expanded) {
      return(
        <div id={this.createDropAreaId()} className="drop-area"></div>
      )
    }
  },

  renderSubTasks: function() {
    if (this.state.task.expanded) {
      return(
        <div id={"subtasks-" + this.createTaskId()} className="subtasks">
          <div id={this.createTaskId() + '-top-drop'} className="drop-area"></div>
          {this.state.subtasks.map(function(task, index) {
            return(
              <TaskIndexItem key={index} index={index} task={task} parentId={this.createTaskId()} updateTask={this.props.updateTask} addSubTask={this.props.addSubTask} deleteTask={this.props.deleteTask} dropHandler={this.props.dropHandler} />
            );
          }.bind(this))}
        </div>
      )
    }
  }
});

module.exports = TaskIndexItem;
