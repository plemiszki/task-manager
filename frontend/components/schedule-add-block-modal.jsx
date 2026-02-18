import React from "react";
import Modal from "react-modal";
import {
  Details,
  sendRequest,
  createEntity,
  updateEntity,
  deleteEntity,
  setUpNiceSelect,
  resetNiceSelect,
  Spinner,
  GrayedOut,
} from "handy-components";

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const COLORS = [
  "rgb(234, 30, 30)",
  "rgb(255, 175, 163)",
  "rgb(255, 175, 36)",
  "rgb(214, 220, 42)",
  "rgb(92, 184, 92)",
  "rgb(111, 138, 240)",
  "rgb(181, 111, 240)",
  "rgb(175, 96, 26)",
  "rgb(170, 165, 158)",
];

function formatTime(hour, minute) {
  const period = hour >= 12 ? "PM" : "AM";
  const displayHour = hour > 12 ? hour - 12 : hour;
  return `${displayHour}:${minute.toString().padStart(2, "0")} ${period}`;
}

const DAY_OPTIONS = DAYS.map((day, i) => ({ value: i, text: day }));

function buildTimeOptions() {
  const options = [];
  for (let hour = 6; hour <= 22; hour++) {
    for (let minute = 0; minute < 60; minute += 15) {
      if (hour === 22 && minute > 30) break;
      options.push({
        value: `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`,
        text: formatTime(hour, minute),
      });
    }
  }
  return options;
}

function addMinutes(timeStr, mins) {
  const [h, m] = timeStr.split(":").map(Number);
  const total = h * 60 + m + mins;
  const newH = Math.floor(total / 60);
  const newM = total % 60;
  return `${newH.toString().padStart(2, "0")}:${newM.toString().padStart(2, "0")}`;
}

const TIME_OPTIONS = buildTimeOptions();

const DEFAULT_BLOCK = {
  weekday: 0,
  startTime: "09:00",
  endTime: "09:15",
  color: COLORS[0],
  text: "",
  scheduleCategoryId: "",
};

const modalStyles = {
  overlay: {
    background: "rgba(0, 0, 0, 0.50)",
    zIndex: 10,
  },
  content: {
    background: "#FFFFFF",
    margin: "auto",
    maxWidth: 600,
    height: 477,
    border: "solid 1px black",
    borderRadius: "6px",
    padding: 0,
  },
};

export default class ScheduleAddBlockModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      newBlock: { ...DEFAULT_BLOCK },
      spinner: false,
      errors: [],
      categoryOptions: [],
    };
  }

  componentDidUpdate(prevProps) {
    if (this.props.isOpen && !prevProps.isOpen) {
      const { block, defaults } = this.props;
      let newBlock;
      if (block) {
        newBlock = {
          weekday: block.weekday,
          startTime: block.startTime,
          endTime: block.endTime,
          color: block.color,
          text: block.text,
          scheduleCategoryId: block.scheduleCategoryId || "",
        };
      } else if (defaults) {
        newBlock = {
          ...DEFAULT_BLOCK,
          weekday: defaults.weekday,
          startTime: defaults.startTime,
          endTime: addMinutes(defaults.startTime, 15),
        };
      } else {
        newBlock = { ...DEFAULT_BLOCK };
      }
      this.setState({ newBlock, errors: [] });
      sendRequest("/api/schedule_categories").then((response) => {
        const categoryOptions = response.scheduleCategories.map((c) => ({
          value: c.id,
          text: c.name,
        }));
        this.setState({ categoryOptions }, () => {
          setTimeout(() => {
            resetNiceSelect({
              selector: "select",
              func: Details.changeDropdownField.bind(this),
            });
          }, 0);
        });
      });
    }
  }

  changeFieldArgs() {
    return {
      entity: "newBlock",
      errorsArray: this.state.errors,
      beforeSave: (obj, property, newValue) => {
        if (property === "startTime") {
          obj.endTime = addMinutes(newValue, 15);
          setTimeout(() => {
            resetNiceSelect({
              selector: "select",
              func: Details.changeDropdownField.bind(this),
            });
          }, 0);
        }
      },
    };
  }

  changeNewBlockField(field, value) {
    const { newBlock } = this.state;
    this.setState({ newBlock: { ...newBlock, [field]: value } });
  }

  deleteBlock() {
    const { block, onSave } = this.props;
    this.setState({ spinner: true });
    deleteEntity({
      id: block.id,
      directory: "schedule_blocks",
    }).then((response) => {
      this.setState({ spinner: false });
      onSave(response.scheduleBlocks);
    });
  }

  submitBlock() {
    const { block, onSave } = this.props;
    const { newBlock } = this.state;
    const entity = {
      weekday: newBlock.weekday,
      startTime: newBlock.startTime,
      endTime: newBlock.endTime,
      color: newBlock.color,
      text: newBlock.text,
      scheduleCategoryId: newBlock.scheduleCategoryId || null,
    };
    this.setState({ spinner: true });
    const request = block
      ? updateEntity({
          id: block.id,
          directory: "schedule_blocks",
          entityName: "scheduleBlock",
          entity,
        })
      : createEntity({
          directory: "schedule_blocks",
          entityName: "scheduleBlock",
          entity,
        });
    request.then(
      (response) => {
        this.setState({ spinner: false });
        onSave(response.scheduleBlocks);
      },
      (response) => {
        this.setState({
          spinner: false,
          errors: response.errors,
        });
      },
    );
  }

  render() {
    const { isOpen, onClose, block } = this.props;
    const { newBlock, spinner, errors, categoryOptions } = this.state;

    return (
      <Modal
        isOpen={isOpen}
        onRequestClose={onClose}
        contentLabel="Modal"
        style={modalStyles}
        onAfterOpen={() => {
          setUpNiceSelect({
            selector: "select",
            func: Details.changeDropdownField.bind(this),
          });
        }}
      >
        <div className="admin-modal handy-component">
          <div className="white-box" style={{ marginBottom: 0 }}>
            <div className="row">
              {Details.renderDropDown.bind(this)({
                columnWidth: 4,
                entity: "newBlock",
                property: "weekday",
                columnHeader: "Day",
                options: DAY_OPTIONS,
                optionDisplayProperty: "text",
                optionSortProperty: "value",
              })}
              {Details.renderDropDown.bind(this)({
                columnWidth: 4,
                entity: "newBlock",
                property: "startTime",
                columnHeader: "Start Time",
                options: TIME_OPTIONS,
                optionDisplayProperty: "text",
                optionSortProperty: "value",
              })}
              {Details.renderDropDown.bind(this)({
                columnWidth: 4,
                entity: "newBlock",
                property: "endTime",
                columnHeader: "End Time",
                options: TIME_OPTIONS,
                optionDisplayProperty: "text",
                optionSortProperty: "value",
              })}
            </div>
            <div className="row">
              {Details.renderDropDown.bind(this)({
                columnWidth: 6,
                entity: "newBlock",
                property: "scheduleCategoryId",
                columnHeader: "Category",
                options: categoryOptions,
                optionDisplayProperty: "text",
                optionSortProperty: "text",
                optional: true,
              })}
              <div className="col-xs-6">
                <h2>Color</h2>
                <div
                  className="colors"
                  style={{ display: "flex", flexWrap: "wrap", gap: 6 }}
                >
                  {COLORS.map((color) => (
                    <div
                      key={color}
                      className={
                        "color" + (newBlock.color === color ? " selected" : "")
                      }
                      style={{
                        backgroundColor: color,
                        width: 28,
                        height: 28,
                        margin: 0,
                      }}
                      onClick={() => this.changeNewBlockField("color", color)}
                    />
                  ))}
                </div>
              </div>
            </div>
            <div
              className="row"
              onKeyDown={(e) => {
                if (e.key === "Enter") this.submitBlock();
              }}
            >
              {Details.renderField.bind(this)({
                columnWidth: 12,
                entity: "newBlock",
                property: "text",
              })}
            </div>
            {errors.length > 0 && (
              <div className="row">
                <div className="col-xs-12">
                  <div style={{ color: "red", fontSize: 12, marginTop: 10 }}>
                    {errors.join(", ")}
                  </div>
                </div>
              </div>
            )}
            <div className="row" style={{ marginTop: 15 }}>
              <div className="col-xs-12" style={{ textAlign: "right" }}>
                <div
                  className="btn"
                  style={{
                    backgroundColor: "black",
                    color: "white",
                  }}
                  onClick={this.submitBlock.bind(this)}
                >
                  {block ? "Edit Block" : "Add Block"}
                </div>
                {block && (
                  <div
                    className="btn btn-danger"
                    style={{
                      marginLeft: 10,
                    }}
                    onClick={this.deleteBlock.bind(this)}
                  >
                    Delete Block
                  </div>
                )}
              </div>
            </div>
            <GrayedOut visible={spinner} />
            <Spinner visible={spinner} />
          </div>
        </div>
      </Modal>
    );
  }
}
