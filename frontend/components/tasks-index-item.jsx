import React from "react";
import ColorPicker from "./color-picker";
import HandyTools from "handy-tools";
import { Common as HandyComponentsCommon } from "handy-components";
import { titleCase } from "title-case";

export default class TaskIndexItem extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      editing: false,
      task: this.props.task,
      subtasks: this.props.task.subtasks || [],
      showColorPicker: false,
      showDropZoneColorPicker: false,
      menuOpen: false,
    };
  }

  componentDidMount() {
    this.attachDragHandler();
    this.attachDropZoneHandlers();
  }

  componentWillReceiveProps(nextProps) {
    this.setState(
      {
        task: nextProps.task,
        subtasks: nextProps.task.subtasks || [],
      },
      () => {
        this.attachDragHandler();
        this.attachDropZoneHandlers();
      }
    );
  }

  attachDragHandler() {
    $("#" + this.createTaskId()).draggable({
      cursor: "-webkit-grabbing",
      handle: ".handle",
      helper: function () {
        return "<div></div>";
      },
      start: this.dragStartHandler,
      stop: this.dragEndHandler,
    });
  }

  attachDropZoneHandlers() {
    $(
      "#" + this.createDropAreaId() + ", #" + this.createSubtaskTopDropAreaId()
    ).droppable({
      accept: Common.canIDrop,
      tolerance: "pointer",
      over: Common.dragOverHandler,
      out: Common.dragOutHandler,
      drop: this.props.dropHandler,
    });
  }

  clickText(e) {
    e.preventDefault();
    if (
      $(e.target.parentElement.parentElement).hasClass("duplicate") === false
    ) {
      e.target.classList.remove("handle");
      this.setState({
        editing: true,
      });
    }
  }

  changeText(e) {
    var task = this.state.task;
    task.text = e.target.value;
    this.setState({
      task,
    });
  }

  clickEnter(e) {
    if (e.key == "Enter") {
      e.target.parentElement.children[0].classList.add("handle");
      this.setState({
        editing: false,
      });
      this.props.updateTask(this.state.task);
    }
  }

  clickExpand() {
    let task = this.state.task;
    task.expanded = !task.expanded;
    this.setState(
      {
        task,
      },
      () => {
        this.props.updateTask(this.state.task);
      }
    );
  }

  deleteTask(e) {
    e.preventDefault();
    this.props.deleteTask(this.state.task.id);
  }

  finishedTask(e) {
    e.preventDefault();
    let task = this.state.task;
    task.complete = !task.complete;
    this.setState(
      {
        task,
      },
      () => {
        this.props.updateTask(this.state.task);
      }
    );
  }

  clickMenu(e) {
    e.preventDefault();
    let value = !this.state.menuOpen;
    this.setState({
      menuOpen: value,
    });
  }

  changeColor(color) {
    let task = this.state.task;
    task.color = color;
    this.setState(
      {
        task: task,
        showColorPicker: false,
      },
      () => {
        this.props.updateTask(this.state.task);
      }
    );
  }

  convertToFutureTask() {
    this.setState({
      menuOpen: false,
    });
    this.props.convertToFutureTask({
      id: this.state.task.id,
    });
  }

  clickAddSubtask(e) {
    e.preventDefault();
    this.props.createTask({
      timeframe: this.props.task.timeframe,
      parentId: this.state.task.id,
    });
  }

  dragStartHandler(e) {
    $(".task").addClass("dragging");
    $(".task, a, input").addClass("grabbing");
    e.target.classList.add("dragging-this");
  }

  dragEndHandler() {
    $(".dragging").removeClass("dragging");
    $(".task, a, input").removeClass("grabbing");
    $(".dragging-this").removeClass("dragging-this");
    $(".highlight-black").removeClass("highlight-black");
    $(".highlight-blue").removeClass("highlight-blue");
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
      return { background: "rgba(" + this.state.task.color + ", 0.5)" };
    } else {
      return { background: "rgb(" + this.state.task.color + ")" };
    }
  }

  formatTaskText() {
    const { debug } = this.props;
    const { task, subtasks, editing } = this.state;
    const { id, text, duplicateId } = task;
    if (editing) {
      return text;
    }
    let alteredText = debug ? `${id} - ${text} - ${duplicateId}` : text;
    if (text.indexOf("$cc") > -1 || text.indexOf("$tc") > -1) {
      let completedChildren = subtasks.reduce((accum, current) => {
        return accum + (current.complete ? 1 : 0);
      }, 0);
      alteredText = alteredText.split("$cc").join(completedChildren);
      alteredText = alteredText.split("$tc").join(subtasks.length);
    }
    return alteredText;
  }

  moveTask(e) {
    let timeframe = e.target.dataset.timeframe;
    this.setState({
      menuOpen: false,
    });
    this.props.moveTask({
      id: this.state.task.id,
      timeframe,
    });
  }

  copyTask(e) {
    let timeframe = e.target.dataset.timeframe;
    this.setState({
      menuOpen: false,
    });
    this.props.copyTask({
      duplicateOf: this.state.task.id,
      timeframe,
    });
  }

  mouseLeave(e) {
    if (this.state.menuOpen) {
      this.setState({
        menuOpen: false,
      });
    }
  }

  render() {
    let { task, editing, subtasks } = this.state;
    const { openListsModal, setActiveTaskId, debug } = this.props;

    let menuOptions = [];
    if (!task.duplicateId) {
      menuOptions.push({
        label: "Move",
        expandTimeframes: true,
        func: (e) => {
          this.moveTask(e);
        },
      });
    }
    if (["day", "backlog"].indexOf(this.state.task.timeframe) === -1) {
      menuOptions.push({
        label: "Copy",
        expandTimeframes: true,
        func: (e) => {
          this.copyTask(e);
        },
      });
    }
    if (
      !task.duplicateId &&
      !task.parentId &&
      this.state.task.timeframe === "day"
    ) {
      menuOptions.push({
        label: "Do Tomorrow",
        func: () => {
          this.convertToFutureTask();
        },
      });
    }
    if (!task.duplicateId && !task.parentId) {
      menuOptions.push({
        label: "Change Color",
        func: () => {
          this.setState({
            showColorPicker: !this.state.showColorPicker,
            menuOpen: false,
          });
        },
      });
    }
    if (!task.duplicateId && !task.parentId) {
      menuOptions.push({
        label: "Add From List",
        func: () => {
          this.setState({ menuOpen: false });
          setActiveTaskId(task.id);
          openListsModal();
        },
      });
    }
    let hideDeleteButton = task.duplicateId && task.parentId;
    let hideSubtaskButton = task.duplicateId;
    let hideMenuButton = menuOptions.length === 0;
    return (
      <div className="group">
        <div
          id={this.createTaskId()}
          className={
            "task" +
            (task.expanded ? " expanded" : "") +
            (task.duplicateId ? " duplicate" : "") +
            (task.jointId ? " joint" : "")
          }
          style={this.taskStyle()}
          data-taskid={this.props.task.id}
          onMouseLeave={this.mouseLeave.bind(this)}
        >
          <div
            className={
              "controls" +
              (editing ? " hidden" : "") +
              (hideDeleteButton && hideSubtaskButton ? " narrow" : "")
            }
          >
            <a
              href=""
              className={"delete-button" + (hideDeleteButton ? " hidden" : "")}
              onClick={this.deleteTask.bind(this)}
            ></a>
            <a
              href=""
              className="done-button"
              onClick={this.finishedTask.bind(this)}
            ></a>
            <a
              href=""
              className={"menu-button" + (hideMenuButton ? " hidden" : "")}
              onClick={this.clickMenu.bind(this)}
            ></a>
            <a
              href=""
              className={
                "add-subtask-button" + (hideSubtaskButton ? " hidden" : "")
              }
              onClick={this.clickAddSubtask.bind(this)}
            ></a>
          </div>
          {this.renderColorPicker()}
          <div
            className={
              editing
                ? "hidden"
                : task.complete
                ? "check"
                : subtasks.length == 0
                ? "hidden"
                : task.expanded
                ? "minus"
                : "plus"
            }
            onClick={this.clickExpand.bind(this)}
          ></div>
          {this.renderMenu(menuOptions)}
          <div className="click-area" onClick={this.clickText.bind(this)}>
            <div className="handle"></div>
            <input
              className={editing ? "" : "disabled"}
              disabled={!editing}
              value={this.formatTaskText.call(this)}
              onChange={this.changeText.bind(this)}
              onKeyPress={this.clickEnter.bind(this)}
            />
          </div>
        </div>
        {this.renderDropZoneColorPicker()}
        {this.renderBottomDropArea()}
        {this.renderSubTasks()}
      </div>
    );
  }

  renderDropZoneColorPicker() {
    if (this.state.showDropZoneColorPicker) {
      return (
        <div className="color-picker-container drop-zone-color-picker-container">
          <ColorPicker func={this.addTask.bind(this)} />
          <div
            className="cancel-new"
            onClick={HandyComponentsCommon.changeState.bind(
              this,
              "showDropZoneColorPicker",
              false
            )}
          ></div>
        </div>
      );
    }
  }

  addTask(color) {
    this.setState({
      showDropZoneColorPicker: false,
    });
    this.props.createTask({
      timeframe: this.props.task.timeframe,
      color,
      position: this.props.task.position + 1,
    });
  }

  renderMenu(menuOptions) {
    if (this.state.menuOpen) {
      return (
        <ul className="menu">
          {menuOptions.map((option, index) => {
            return (
              <li
                key={index}
                className={option.expandTimeframes ? "arrow" : ""}
                onClick={option.func.bind(this)}
              >
                {option.label}
                {this.renderTimeframeMenu(option)}
              </li>
            );
          })}
        </ul>
      );
    }
  }

  renderTimeframeMenu(option) {
    if (option.expandTimeframes) {
      let timeframes = ["day", "weekend", "month", "year", "life", "backlog"];
      if (option.label === "Copy") {
        let index = timeframes.indexOf(this.state.task.timeframe);
        timeframes = timeframes.slice(0, index);
      } else {
        timeframes = HandyTools.removeFromArray(
          timeframes,
          this.state.task.timeframe
        );
      }
      return (
        <ul className="timeframe-menu hidden">
          {timeframes.map((timeframe, index) => {
            return (
              <li key={index} data-timeframe={timeframe}>
                {titleCase(timeframe)}
              </li>
            );
          })}
        </ul>
      );
    }
  }

  renderColorPicker() {
    if (this.state.showColorPicker) {
      return <ColorPicker func={(color) => this.changeColor(color)} />;
    }
  }

  renderBottomDropArea() {
    if (!this.state.task.expanded) {
      return (
        <div
          id={this.createDropAreaId()}
          className="drop-area"
          onDoubleClick={this.doubleClickDropArea.bind(this, false)}
        ></div>
      );
    }
  }

  doubleClickDropArea(insertBeginningSubtask = false) {
    const { task } = this.props;
    if (task.parentId && task.duplicateId) {
      return;
    }
    if (insertBeginningSubtask && task.duplicateId) {
      return;
    }
    if (task.parentId || insertBeginningSubtask) {
      this.props.createTask({
        timeframe: task.timeframe,
        color: task.color,
        position: insertBeginningSubtask ? 0 : task.position + 1,
        parentId: insertBeginningSubtask ? task.id : task.parentId,
      });
    } else {
      this.setState({
        showDropZoneColorPicker: true,
      });
    }
  }

  renderSubTasks() {
    const { debug } = this.props;
    if (this.state.task.expanded) {
      return (
        <div id={"subtasks-" + this.createTaskId()} className="subtasks">
          <div
            id={this.createTaskId() + "-top-drop"}
            className="drop-area"
            onDoubleClick={this.doubleClickDropArea.bind(this, true)}
          ></div>
          {this.state.subtasks.map((task, index) => {
            return (
              <TaskIndexItem
                key={index}
                index={index}
                task={task}
                parentId={this.createTaskId()}
                createTask={this.props.createTask.bind(this)}
                updateTask={this.props.updateTask.bind(this)}
                copyTask={this.props.copyTask.bind(this)}
                moveTask={this.props.moveTask.bind(this)}
                deleteTask={this.props.deleteTask.bind(this)}
                dropHandler={this.props.dropHandler.bind(this)}
                debug={debug}
              />
            );
          })}
        </div>
      );
    }
  }
}
