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

  componentWillReceiveProps: function(nextProps) {
    this.setState({
      task: nextProps.task,
      subtasks: this.props.store.subTasks(this.props.task.id)
    });
  },

  clickText: function(event) {
    event.preventDefault();
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

  render: function() {
    return(
      <div className="group">
        <div className="task">
          <div className={"controls" + (this.state.editing ? " hidden" : "")}>
            <a href="" className="delete-button" onClick={this.deleteTask}></a>
            <a href="" className="done-button" onClick={this.finishedTask}></a>
            <a href="" className="color-button"></a>
            <a href="" className="add-subtask-button" onClick={this.addSubTask}></a>
          </div>
          <div className={((this.state.editing) ? "hidden" : (this.state.task.complete ? "check" : (this.state.subtasks == 0 ? "hidden" : (this.state.task.expanded ? "minus" : "plus"))))} onClick={this.clickExpand}>
          </div>
          <div className="click-area" onClick={this.clickText}>
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
