import React from "react";
import ColorPicker from "./color-picker";
import HandyTools from "handy-tools";
import { Common as HandyComponentsCommon } from "handy-components";
import { titleCase } from "title-case";
import { DateTime } from "luxon";

export default class TaskIndexItem extends React.Component {
  constructor(props) {
    super(props);
    this.inputRef = React.createRef();
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
    const { task, shiftPressed, selected } = this.props;
    e.preventDefault();
    if (shiftPressed) {
      if (selected) {
        this.props.unselectTask(task.id);
      } else {
        this.props.selectTask({
          id: task.id,
          parentId: task.parentId,
          timeframe: task.timeframe,
        });
      }
    } else {
      if (
        $(e.target.parentElement.parentElement).hasClass("duplicate") === false
      ) {
        this.setState(
          {
            editing: true,
          },
          () => {
            this.inputRef.current.focus();
          }
        );
      }
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

  convertToFutureTask({ monday } = {}) {
    this.setState({
      menuOpen: false,
    });
    this.props.convertToFutureTask({
      id: this.state.task.id,
      monday,
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
    const { debug, debugPositions } = this.props;
    const { task, subtasks, editing } = this.state;
    const { id, text, duplicateId, position } = task;
    if (editing) {
      return text;
    }
    let alteredText = text;
    if (debug) {
      alteredText = `${id} - ${text} - ${duplicateId}`;
      if (text.indexOf("$cc") > -1 || text.indexOf("$tc") > -1) {
        let completedChildren = subtasks.reduce((accum, current) => {
          return accum + (current.complete ? 1 : 0);
        }, 0);
        alteredText = alteredText.split("$cc").join(completedChildren);
        alteredText = alteredText.split("$tc").join(subtasks.length);
      }
    }
    if (debugPositions) {
      alteredText = `${text} - ${position}`;
    }
    return alteredText;
  }

  moveTask(e) {
    const timeframe = e.target.dataset.timeframe;
    if (timeframe) {
      this.setState({
        menuOpen: false,
      });
      this.props.moveTask({
        id: this.state.task.id,
        timeframe,
      });
    }
  }

  copyTask(e) {
    const timeframe = e.target.dataset.timeframe;
    if (timeframe) {
      this.setState({
        menuOpen: false,
      });
      this.props.copyTask({
        duplicateOf: this.state.task.id,
        timeframe,
      });
    }
  }

  copyIncompleteSubtasks(e) {
    const timeframe = e.target.dataset.timeframe;
    if (timeframe) {
      this.setState({
        menuOpen: false,
      });
      this.props.copyIncompleteSubtasks({
        taskId: this.state.task.id,
        timeframe,
      });
    }
  }

  mouseLeave(e) {
    if (this.state.menuOpen) {
      this.setState({
        menuOpen: false,
      });
    }
  }

  render() {
    const { openListsModal, setActiveTaskId } = this.props;
    const { task, editing, subtasks, showColorPicker } = this.state;
    const { timeframe, duplicateId, parentId } = task;

    let menuOptions = [];
    if (!duplicateId) {
      menuOptions.push({
        label: "Move",
        expandTimeframes: true,
        func: (e) => {
          this.moveTask(e);
        },
      });
    }
    if (["day", "backlog"].indexOf(timeframe) === -1) {
      menuOptions.push({
        label: "Copy",
        expandTimeframes: true,
        shorterTimeframesOnly: true,
        func: (e) => {
          this.copyTask(e);
        },
      });
    }
    if (subtasks.length > 0 && ["day", "backlog"].indexOf(timeframe) === -1) {
      menuOptions.push({
        label: "Copy Subs",
        expandTimeframes: true,
        shorterTimeframesOnly: true,
        func: (e) => {
          this.copyIncompleteSubtasks(e);
        },
      });
    }
    if (!duplicateId && !parentId && timeframe === "day") {
      menuOptions.push({
        label: "Do Tomorrow",
        func: () => {
          this.convertToFutureTask();
        },
      });
    }
    if (
      !duplicateId &&
      !parentId &&
      timeframe === "day" &&
      DateTime.now().weekday === 5
    ) {
      menuOptions.push({
        label: "Do Monday",
        func: () => {
          this.convertToFutureTask({ monday: true });
        },
      });
    }
    if (!duplicateId && !parentId) {
      menuOptions.push({
        label: "Change Color",
        func: () => {
          this.setState({
            showColorPicker: !showColorPicker,
            menuOpen: false,
          });
        },
      });
    }
    if (!duplicateId && !parentId) {
      menuOptions.push({
        label: "Add From List",
        func: () => {
          this.setState({ menuOpen: false });
          setActiveTaskId(task.id);
          openListsModal();
        },
      });
    }
    const hideDeleteButton = duplicateId && parentId;
    const hideSubtaskButton = duplicateId;
    const hideMenuButton = menuOptions.length === 0;
    return (
      <div className="group">
        <div
          id={this.createTaskId()}
          className={
            "task" +
            (task.expanded ? " expanded" : "") +
            (task.duplicateId ? " duplicate" : "") +
            (task.jointId ? " joint" : "") +
            (this.props.selected ? " selected" : "")
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
          {editing ? (
            <input
              value={this.formatTaskText.call(this)}
              onChange={this.changeText.bind(this)}
              onKeyPress={this.clickEnter.bind(this)}
              ref={this.inputRef}
            />
          ) : (
            <div className="click-area" onClick={this.clickText.bind(this)}>
              <div className="handle"></div>
              <p>{this.formatTaskText.call(this)}</p>
            </div>
          )}
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
    const { expandTimeframes, shorterTimeframesOnly } = option;
    const { task } = this.state;

    if (expandTimeframes) {
      let timeframes = ["day", "weekend", "month", "year", "life", "backlog"];
      if (shorterTimeframesOnly) {
        const index = timeframes.indexOf(task.timeframe);
        timeframes = timeframes.slice(0, index);
      } else {
        timeframes = HandyTools.removeFromArray(timeframes, task.timeframe);
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
    const {
      debug,
      debugPositions,
      selectTask,
      unselectTask,
      selectedTasks,
      shiftPressed,
    } = this.props;
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
                copyIncompleteSubtasks={this.props.copyIncompleteSubtasks.bind(
                  this
                )}
                moveTask={this.props.moveTask.bind(this)}
                deleteTask={this.props.deleteTask.bind(this)}
                dropHandler={this.props.dropHandler.bind(this)}
                debug={debug}
                debugPositions={debugPositions}
                selected={selectedTasks.includes(task.id)}
                shiftPressed={shiftPressed}
                selectTask={selectTask}
                unselectTask={unselectTask}
                selectedTasks={selectedTasks}
              />
            );
          })}
        </div>
      );
    }
  }
}
