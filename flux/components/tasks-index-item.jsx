var React = require('react');
var ClientActions = require('../actions/client-actions.js');

var TaskIndexItem = React.createClass({

  getInitialState: function() {
    return({
      editing: false,
      task: this.props.task,
      subtasks: this.props.store.subTasks(this.props.task.id)
    });
  },

  componentDidMount: function() {
    $('.task').draggable({
      cursor: '-webkit-grabbing',
      handle: '.handle',
      helper: function() { return "<div></div>"; },
      start: this.dragStartHandler,
      stop: this.dragEndHandler,
    });
    // $('.drop-zone').droppable({
    //   accept: Admin.canIDrop,
    //   over: this.dragOverHandler,
    //   out: this.dragOutHandler,
    //   drop: this.dropHandler
    // });
  },

  componentWillReceiveProps: function(nextProps) {
    this.setState({
      task: nextProps.task,
      subtasks: this.props.store.subTasks(this.props.task.id)
    });
  },

  clickText: function(event) {
    event.preventDefault();
    event.target.classList.remove('handle');
    this.setState({
      editing: true
    });
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
    // var field = e.target.parentElement.parentElement;
    // field.classList.add('highlight');
    // var children = field.parentElement.children;
    // var bottomDropZone = children[children.length - 1];
    // bottomDropZone.classList.add('smaller');
    // if (children.length == 3) {
    //   var topDropZone = children[0];
    // } else {
    //   var fieldIndex = +field.getAttribute('id').split('-')[1];
    //   var fields = field.parentElement.parentElement.children;
    //   var topField = fields[fieldIndex + 1];
    //   var topDropZone = topField.children[topField.children.length - 1];
    // }
    // topDropZone.classList.add('smaller');
  },

  dragOverHandler: function(e) {
    console.log("drag over");
    // e.target.classList.add('highlight');
  },

  dragOutHandler: function(e) {
    console.log("drag out");
    // e.target.classList.remove('highlight');
  },

  dragEndHandler: function(e) {
    $('.dragging').removeClass('dragging');
    $('.task, a, input').removeClass('grabbing');
    $('.dragging-this').removeClass('dragging-this');
  },

  // dropHandler: function(e, ui) {
  //   draggedIndex = ui.draggable.attr('id').split('-')[1];
  //   dropZoneIndex = e.target.dataset.index;
  //   $('.highlight').removeClass('highlight');
  //   this.props.rearrangeFields(draggedIndex, dropZoneIndex);
  // },

  render: function() {
    return(
      <div className="group">
        <div className="task">
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
        {this.renderSubTasks()}
      </div>
    );
  },

  renderSubTasks: function() {
    if (this.state.task.expanded) {
      return(
        <div className="subtasks">
          {this.state.subtasks.map(function(task, index) {
            return(
              <TaskIndexItem key={index} task={task} store={this.props.store} updateTask={this.props.updateTask} addSubTask={this.props.addSubTask} deleteTask={this.props.deleteTask} />
            );
          }.bind(this))}
        </div>
      )
    }
  }
});

module.exports = TaskIndexItem;
