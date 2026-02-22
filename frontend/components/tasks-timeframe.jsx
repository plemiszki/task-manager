import React from "react";
import { Common, sendRequest, Spinner, GrayedOut } from "handy-components";
import ColorPicker from "./color-picker";
import TasksCommon from "../../app/assets/javascripts/common.jsx";
import TasksIndexItem from "./tasks-index-item.jsx";
import { orderBy } from "lodash";
import CheckBoxOutlinedIcon from "@mui/icons-material/CheckBoxOutlined";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";

const SLOT_HEIGHT = 24;

function buildTimeSlots() {
  const slots = [];
  for (let hour = 6; hour <= 22; hour++) {
    slots.push({ hour, minute: 0 });
    if (hour < 22) slots.push({ hour, minute: 30 });
  }
  return slots;
}

const TIME_SLOTS = buildTimeSlots();

function formatSlotTime(hour, minute) {
  const period = hour >= 12 ? "p" : "a";
  const displayHour = hour > 12 ? hour - 12 : hour;
  return `${displayHour}:${minute.toString().padStart(2, "0")}${period}`;
}

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
      scheduleView: "checkbox",
      scheduleBlocks: null,
      scheduleDayVariants: null,
      activeDayVariants: {},
      now: new Date(),
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
      this.timer = setInterval(() => this.setState({ now: new Date() }), 60000);
    }
  }

  componentWillUnmount() {
    window.removeEventListener("keydown", this.handleKeyDown);
    window.removeEventListener("keyup", this.handleKeyUp);
    clearInterval(this.timer);
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
    const { selectedTasks } = this.props;
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
      if (selectedTasks.length > 0) {
        newHash = this.rearrangeMultipleFields(
          hash,
          dropZoneIndex,
          selectedTasks
        );
      } else {
        newHash = this.rearrangeFields(hash, draggedIndex, dropZoneIndex);
      }
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

  rearrangeMultipleFields(hash, dropZoneIndex, selectedTasks) {
    let result = {};
    const orderedSelectedTasks = orderBy(
      this.props.timeframeTasks.filter((task) =>
        selectedTasks.includes(task.id)
      ),
      "position"
    );
    if (dropZoneIndex == -1) {
      selectedTasks.forEach((selectedTaskId, index) => {
        result[index] = selectedTaskId;
      });
    }
    for (let index = 0; index < Object.keys(hash).length; index++) {
      const hashTaskId = hash[index];
      if (!selectedTasks.includes(hashTaskId)) {
        // for all tasks not included in the selection - new position is the current length of result
        result[Object.keys(result).length] = hash[index];
      }
      if (index == dropZoneIndex) {
        // once we get to the drop zone index, insert all of the selected tasks
        orderedSelectedTasks.forEach((task) => {
          result[Object.keys(result).length] = task.id;
        });
      }
    }
    return result;
  }

  getIndexFromId(id) {
    var array = id.split("-");
    return array[array.length - 1];
  }

  onCalendarClick() {
    this.setState({ scheduleView: "calendar" });
    if (this.state.scheduleBlocks === null) {
      Promise.all([
        sendRequest("/api/schedule_blocks"),
        sendRequest("/api/schedule_day_variants"),
      ]).then(([blocksRes, variantsRes]) => {
        const activeDayVariants = {};
        variantsRes.scheduleDayVariants.forEach((v) => {
          if (v.active) activeDayVariants[v.weekday] = v.id;
        });
        this.setState({
          scheduleBlocks: blocksRes.scheduleBlocks,
          scheduleDayVariants: variantsRes.scheduleDayVariants,
          activeDayVariants,
        });
      });
    }
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

  render() {
    const { timeframe, spinner: propsSpinner } = this.props;
    const { spinner, scheduleView } = this.state;
    return (
      <div className="tasks-timeframe match-height" data-index={timeframe}>
        {!(this.props.timeframe === "weekend" && this.state.scheduleView === "calendar") && this.renderHeader()}
        {this.props.scheduleToggle && this.renderScheduleToggle()}
        {scheduleView === "calendar"
          ? this.renderCalendarView()
          : this.renderTaskList()}
        <Spinner visible={propsSpinner || spinner} />
        <GrayedOut visible={propsSpinner || spinner} />
      </div>
    );
  }

  renderCalendarView() {
    const { scheduleBlocks, activeDayVariants, now } = this.state;
    if (scheduleBlocks === null) {
      return <div style={{ position: "relative", height: 60 }}><Spinner visible={true} /></div>;
    }
    const jsDay = now.getDay();
    const todayIndex = jsDay === 0 ? 6 : jsDay - 1;
    const activeVariantId = activeDayVariants[todayIndex] || null;
    const currentHour = now.getHours();
    const currentMinutes = now.getMinutes();
    const isInRange = currentHour >= 6 && currentHour < 22;
    return (
      <div style={{ paddingTop: 24 }}>
        <div style={{ borderTop: "2px solid #333", borderBottom: "2px solid #333" }}>
        {TIME_SLOTS.map(({ hour, minute }) => {
          const cellStart = hour * 60 + minute;
          const blocks = scheduleBlocks.filter((block) => {
            if (block.weekday !== todayIndex) return false;
            const [h, m] = block.startTime.split(":").map(Number);
            const startMinutes = h * 60 + m;
            if (startMinutes < cellStart || startMinutes >= cellStart + 30) return false;
            if (block.scheduleDayVariantId) return block.scheduleDayVariantId === activeVariantId;
            if (block.normalDayOnly) return activeVariantId === null;
            return true;
          });
          const isCurrentSlot =
            isInRange &&
            hour === currentHour &&
            minute === (currentMinutes >= 30 ? 30 : 0);
          return (
            <div
              key={`${hour}-${minute}`}
              style={{
                display: "flex",
                height: SLOT_HEIGHT,
                borderTop: minute === 0 && hour > 6 ? "1px solid #ccc" : "none",
              }}
            >
              <div
                style={{
                  width: 60,
                  textAlign: "right",
                  paddingRight: 6,
                  fontSize: 11,
                  color: "#888",
                  flexShrink: 0,
                  lineHeight: `${SLOT_HEIGHT}px`,
                }}
              >
                {minute === 0 ? formatSlotTime(hour, minute) : ""}
              </div>
              <div style={{ flex: 1, position: "relative", borderLeft: "1px solid #ddd" }}>
                {blocks.map((block) => {
                  const [sh, sm] = block.startTime.split(":").map(Number);
                  const [eh, em] = block.endTime.split(":").map(Number);
                  const durationMinutes = (eh * 60 + em) - (sh * 60 + sm);
                  const offsetWithinCell = ((sh * 60 + sm - cellStart) / 30) * SLOT_HEIGHT;
                  return (
                    <div
                      key={block.id}
                      style={{
                        position: "absolute",
                        top: offsetWithinCell,
                        left: 2,
                        right: 2,
                        height: (durationMinutes / 30) * SLOT_HEIGHT,
                        backgroundColor: block.color,
                        borderRadius: 4,
                        padding: durationMinutes <= 15 ? "1px 3px" : "2px 6px",
                        fontSize: durationMinutes <= 15 ? 9 : 11,
                        color: "white",
                        overflow: "hidden",
                        zIndex: 2,
                        lineHeight: "14px",
                      }}
                    >
                      {block.text}
                    </div>
                  );
                })}
                {isCurrentSlot && (
                  <div
                    style={{
                      position: "absolute",
                      top: ((currentMinutes % 30) / 30) * SLOT_HEIGHT,
                      left: 0,
                      right: 0,
                      height: 2,
                      backgroundColor: "#d9534f",
                      zIndex: 3,
                    }}
                  >
                    <div
                      style={{
                        position: "absolute",
                        left: -4,
                        top: -3,
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        backgroundColor: "#d9534f",
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          );
        })}
        </div>
      </div>
    );
  }

  renderTaskList() {
    const { debug, debugPositions, selectedTasks, selectTask, unselectTask } =
      this.props;
    const { showTopColorPicker, shiftPressed } = this.state;
    const {
      timeframeTasks,
      openListsModal,
      setActiveTaskId,
    } = this.props;
    return (
      <>
        {this.renderAddButton()}
        <hr />
        {this.renderTopColorPicker()}
        <div
          id={this.props.timeframe + "-top-drop"}
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
              }}
              copyIncompleteSubtasks={this.props.copyIncompleteSubtasks.bind(
                this
              )}
              moveTask={(args) => {
                this.props.moveTask.call(this, { ...args, selectedTasks });
              }}
              deleteTask={this.props.deleteTask.bind(this)}
              convertToFutureTask={this.props.convertToFutureTask.bind(this)}
              dropHandler={this.dropHandler.bind(this)}
              openListsModal={openListsModal}
              setActiveTaskId={setActiveTaskId}
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
      </>
    );
  }

  renderScheduleToggle() {
    const { scheduleView } = this.state;
    const activeColor = "#cc0000";
    const inactiveColor = "#aaaaaa";
    return (
      <div style={{ position: "absolute", top: 10, right: 12, display: "flex", gap: 4 }}>
        <CheckBoxOutlinedIcon
          style={{ color: scheduleView === "checkbox" ? activeColor : inactiveColor, cursor: "pointer" }}
          onClick={() => this.setState({ scheduleView: "checkbox" })}
        />
        <CalendarMonthOutlinedIcon
          style={{ color: scheduleView === "calendar" ? activeColor : inactiveColor, cursor: "pointer" }}
          onClick={() => this.onCalendarClick()}
        />
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
          <h1 id="weekend-header">
            <span onClick={this.clickWeekend.bind(this)}>{text}</span>
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
