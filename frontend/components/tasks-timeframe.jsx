import React from "react";
import { Common, sendRequest, Spinner, GrayedOut } from "handy-components";
import ColorPicker from "./color-picker";
import TasksCommon from "../../app/assets/javascripts/common.jsx";
import TasksIndexItem from "./tasks-index-item.jsx";

export default class TasksTimeframe extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      spinner: false,
      tasks: [],
      longWeekend: false,
      showNewTaskColorPicker: false,
      showTopColorPicker: false,
      shiftPressed: false,
      selectedTasks: [],
    };
  }

  handleKeyDown = (event) => {
    if (event.key === "Shift") {
      this.setState({ shiftPressed: true });
    }
  };

  handleKeyUp = (event) => {
    if (event.key === "Shift") {
      this.setState({ shiftPressed: false });
    }
  };

  componentDidMount() {
    window.addEventListener("keydown", this.handleKeyDown);
    window.addEventListener("keyup", this.handleKeyUp);
    const { timeframe } = this.props;
    $("#" + timeframe + "-top-drop").droppable({
      accept: TasksCommon.canIDrop,
      tolerance: "pointer",
      over: TasksCommon.dragOverHandler,
      out: TasksCommon.dragOutHandler,
      drop: this.dropHandler.bind(this),
    });
    if (timeframe == "day") {
      sendRequest("/api/user").then((response) => {
        this.setState({
          resetEarly: response.resetEarly,
        });
      });
    }
    if (timeframe == "weekend") {
      sendRequest("/api/user").then((response) => {
        this.setState({
          longWeekend: response.user.long_weekend,
        });
      });
    }
  }

  componentWillUnmount() {
    window.removeEventListener("keydown", this.handleKeyDown);
    window.removeEventListener("keyup", this.handleKeyUp);
  }

  addTask(color, position) {
    this.setState({
      showNewTaskColorPicker: false,
    });
    this.props.createTask({
      timeframe: this.props.timeframe,
      color,
      position,
    });
  }

  dropHandler(e, ui) {
    let draggedTimeFrame = ui.draggable.attr("id").split("-")[0];
    let droppedTimeFrame = e.target.getAttribute("id").split("-")[0];
    let draggedIndex = this.getIndexFromId(ui.draggable.attr("id"));
    let dropZoneArray = e.target.getAttribute("id").split("-");
    let dropZoneIndex = dropZoneArray[dropZoneArray.length - 2];
    if (dropZoneIndex == "top") {
      dropZoneIndex = -1;
    }

    let hash = {};
    let parent = e.target.parentElement;
    let parentId, $tasks, timeframe;
    if (parent.classList[0] == "tasks-timeframe") {
      // top drop zone
      parentId = parent.parentElement.getAttribute("id");
      $tasks = $("#" + parentId + " > .tasks-timeframe > .group > .task");
    } else if (parent.parentElement.classList[0] == "tasks-timeframe") {
      // root level
      parentId = parent.parentElement.parentElement.getAttribute("id");
      $tasks = $("#" + parentId + " > .tasks-timeframe > .group > .task");
    } else if (
      parent.getAttribute("id") &&
      parent.getAttribute("id").split("-")[0] == "subtasks"
    ) {
      // subtasks top drop zone
      parentId = parent.getAttribute("id");
      $tasks = $("#" + parentId + " .task"); // <-- this will grab all of the child tasks within the subtask, even grandchildren (etc.) not involved in the rearrange
      var properLevelsDeep = parentId.split("-").length - 1;
      $tasks = $tasks.filter((index, task) => {
        var levelsDeep = task.id.split("-").length - 1;
        return properLevelsDeep === levelsDeep;
      });
    } else {
      // subtasks
      parentId =
        parent.parentElement.parentElement.children[0].getAttribute("id");
      $tasks = $("#subtasks-" + parentId + " .task");
      var properLevelsDeep = parentId.split("-").length;
      $tasks = $tasks.filter((index, task) => {
        var levelsDeep = task.id.split("-").length - 1;
        return properLevelsDeep === levelsDeep;
      });
    }

    $tasks.each((index, task) => {
      var index = this.getIndexFromId(task.getAttribute("id"));
      var id = task.dataset.taskid;
      hash[index] = +id;
    });

    let newHash;
    if (draggedTimeFrame === droppedTimeFrame) {
      newHash = this.rearrangeFields(hash, draggedIndex, dropZoneIndex);
      this.props.rearrangeTasks({
        newPositions: newHash,
      });
    } else {
      let taskId = ui.draggable[0].dataset.taskid;
      let newTaskPosition = +dropZoneIndex + 1;
      this.props.copyTask({
        timeframe: dropZoneTimeFrame,
        position: newTaskPosition,
        duplicateOf: taskId,
        selectedTasks: this.state.selectedTasks,
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

  getIndexFromId(id) {
    var array = id.split("-");
    return array[array.length - 1];
  }

  clickWeekend() {
    const { longWeekend } = this.state;
    const { user } = this.props;
    sendRequest("/api/user", {
      method: "PATCH",
      data: {
        user: {
          longWeekend: !longWeekend,
        },
      },
    }).then((response) => {
      this.setState({
        longWeekend: response.user.long_weekend,
      });
    });
  }

  renderTopColorPicker() {
    if (this.state.showTopColorPicker) {
      return (
        <div className="color-picker-container drop-zone-color-picker-container">
          <ColorPicker func={this.addTaskAtBeginning.bind(this)} />
          <div
            className="cancel-new"
            onClick={Common.changeState.bind(this, "showTopColorPicker", false)}
          ></div>
        </div>
      );
    }
  }

  addTaskAtBeginning(color) {
    this.setState({
      showTopColorPicker: false,
    });
    this.addTask(color, "0");
  }

  selectTask(id) {
    this.setState({
      selectedTasks: [...this.state.selectedTasks, id],
    });
  }

  unselectTask(id) {
    const index = this.state.selectedTasks.indexOf(id);
    const newSelectedTasks = [...this.state.selectedTasks];
    newSelectedTasks.splice(index, 1);
    this.setState({
      selectedTasks: newSelectedTasks,
    });
  }

  render() {
    const { debug } = this.props;
    const { showTopColorPicker, spinner, shiftPressed, selectedTasks } =
      this.state;
    const {
      timeframe,
      timeframeTasks,
      spinner: propsSpinner,
      openListsModal,
      setActiveTaskId,
    } = this.props;
    return (
      <div className="tasks-timeframe match-height" data-index={timeframe}>
        {this.renderHeader()}
        {this.renderAddButton()}
        <hr />
        {this.renderTopColorPicker()}
        <div
          id={timeframe + "-top-drop"}
          className="drop-area"
          onDoubleClick={Common.changeState.bind(
            this,
            "showTopColorPicker",
            !showTopColorPicker
          )}
        ></div>
        {timeframeTasks.map((task, index) => {
          return (
            <TasksIndexItem
              key={index}
              index={index}
              task={task}
              level="0"
              createTask={this.props.createTask.bind(this)}
              updateTask={this.props.updateTask.bind(this)}
              copyTask={(args) => {
                this.props.copyTask.call(this, { ...args, selectedTasks });
                this.setState({ selectedTasks: [] });
              }}
              copyIncompleteSubtasks={this.props.copyIncompleteSubtasks.bind(
                this
              )}
              moveTask={(args) => {
                this.props.moveTask.call(this, { ...args, selectedTasks });
                this.setState({ selectedTasks: [] });
              }}
              deleteTask={this.props.deleteTask.bind(this)}
              convertToFutureTask={this.props.convertToFutureTask.bind(this)}
              dropHandler={this.dropHandler.bind(this)}
              openListsModal={openListsModal}
              setActiveTaskId={setActiveTaskId}
              debug={debug}
              selected={selectedTasks.includes(task.id)}
              shiftPressed={shiftPressed}
              selectTask={this.selectTask.bind(this)}
              unselectTask={this.unselectTask.bind(this)}
            />
          );
        })}
        <Spinner visible={propsSpinner || spinner} />
        <GrayedOut visible={propsSpinner || spinner} />
      </div>
    );
  }

  renderHeader() {
    const { timeframe } = this.props;
    const { resetEarly, longWeekend } = this.state;
    switch (timeframe) {
      case "day":
        return <h1>{resetEarly ? "Tomorrow" : "Today"}</h1>;
      case "weekend":
        var text = longWeekend ? "Long Weekend" : "Weekend";
        return (
          <h1 id="weekend-header" onClick={this.clickWeekend.bind(this)}>
            {text}
          </h1>
        );
      case "month":
        return <h1>This Month</h1>;
      case "year":
        return <h1>This Year</h1>;
      case "life":
        return <h1>Lifetime</h1>;
      case "backlog":
        return <h1>Backlog</h1>;
    }
  }

  renderAddButton() {
    if (this.state.showNewTaskColorPicker) {
      return (
        <div className="color-picker-container index-top-color-picker-container">
          <ColorPicker
            func={(color) => {
              this.addTask(color);
            }}
          />
          <div
            className="cancel-new"
            onClick={Common.changeState.bind(
              this,
              "showNewTaskColorPicker",
              false
            )}
          ></div>
        </div>
      );
    } else {
      return (
        <div
          className="add-task"
          href=""
          onClick={Common.changeState.bind(
            this,
            "showNewTaskColorPicker",
            true
          )}
        >
          Add Task
        </div>
      );
    }
  }
}
