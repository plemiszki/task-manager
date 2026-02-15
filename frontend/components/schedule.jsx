import React from "react";
import { sendRequest } from "handy-components";

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const SLOT_HEIGHT = 24;
const SIDEBAR_WIDTH = 250;

function buildTimeSlots() {
  const slots = [];
  for (let hour = 6; hour <= 22; hour++) {
    slots.push({ hour, minute: 0 });
    if (hour < 22 || (hour === 22 && false)) {
      slots.push({ hour, minute: 30 });
    }
  }
  return slots;
}

function formatTime(hour, minute) {
  const period = hour >= 12 ? "PM" : "AM";
  const displayHour = hour > 12 ? hour - 12 : hour;
  return `${displayHour}:${minute.toString().padStart(2, "0")} ${period}`;
}

function getCurrentDayIndex() {
  const jsDay = new Date().getDay();
  return jsDay === 0 ? 6 : jsDay - 1;
}

function parseTime(timeStr) {
  const [h, m] = timeStr.split(":").map(Number);
  return { hour: h, minute: m };
}

function timeToMinutes(timeStr) {
  const { hour, minute } = parseTime(timeStr);
  return hour * 60 + minute;
}

const TIME_SLOTS = buildTimeSlots();

export default class Schedule extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      now: new Date(),
      scheduleBlocks: [],
      scheduleHeight: 0,
    };
    this.scheduleRef = React.createRef();
  }

  componentDidMount() {
    sendRequest("/api/schedule_blocks").then((response) => {
      this.setState({ scheduleBlocks: response.scheduleBlocks });
    });
    this.timer = setInterval(() => {
      this.setState({ now: new Date() });
    }, 60000);
    this.updateHeight();
  }

  componentDidUpdate() {
    this.updateHeight();
  }

  componentWillUnmount() {
    clearInterval(this.timer);
  }

  updateHeight() {
    if (this.scheduleRef.current) {
      const height = this.scheduleRef.current.offsetHeight;
      if (height !== this.state.scheduleHeight) {
        this.setState({ scheduleHeight: height });
      }
    }
  }

  getBlockForCell(dayIndex, hour, minute) {
    const { scheduleBlocks } = this.state;
    const cellMinutes = hour * 60 + minute;
    return scheduleBlocks.find((block) => {
      if (block.weekday !== dayIndex) return false;
      const startMinutes = timeToMinutes(block.startTime);
      return startMinutes === cellMinutes;
    });
  }

  render() {
    const { now, scheduleHeight } = this.state;
    const currentDayIndex = getCurrentDayIndex();
    const currentHour = now.getHours();
    const currentMinutes = now.getMinutes();
    const isInRange =
      currentHour >= 6 &&
      (currentHour < 22 || (currentHour === 22 && currentMinutes <= 30));

    return (
      <div
        className="container widened-container"
        style={{
          display: "flex",
          userSelect: "none",
          marginBottom: 20,
        }}
      >
        <div
          ref={this.scheduleRef}
          style={{
            flex: 1,
            padding: 20,
            backgroundColor: "white",
            borderRadius: 6,
            boxShadow: "1px 2px 3px 0px #e6e9ec",
          }}
        >
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                tableLayout: "fixed",
              }}
            >
              <thead>
                <tr>
                  <th style={styles.timeHeader}></th>
                  {DAYS.map((day, i) => (
                    <th
                      key={day}
                      style={{
                        ...styles.dayHeader,
                        ...(i === currentDayIndex
                          ? { color: "#d9534f", fontWeight: "bold" }
                          : {}),
                      }}
                    >
                      {day}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {TIME_SLOTS.map(({ hour, minute }) => (
                  <tr key={`${hour}-${minute}`}>
                    <td style={styles.timeCell}>
                      {minute === 0 ? formatTime(hour, minute) : ""}
                    </td>
                    {DAYS.map((day, dayIndex) => {
                      const block = this.getBlockForCell(dayIndex, hour, minute);
                      const startMinutes = block ? timeToMinutes(block.startTime) : 0;
                      const endMinutes = block ? timeToMinutes(block.endTime) : 0;
                      const durationSlots = block ? (endMinutes - startMinutes) / 30 : 0;
                      const blockHeight = durationSlots * SLOT_HEIGHT;

                      return (
                        <td
                          key={`${day}-${hour}-${minute}`}
                          style={{
                            ...styles.cell,
                            borderTopWidth: minute === 0 ? 1 : 0,
                            borderTopStyle: minute === 0 ? "solid" : "none",
                            borderTopColor: "#ccc",
                            position: "relative",
                          }}
                        >
                          {block && (
                            <div
                              style={{
                                position: "absolute",
                                top: 0,
                                left: 2,
                                right: 2,
                                height: blockHeight,
                                backgroundColor: block.color,
                                borderRadius: 4,
                                padding: "2px 6px",
                                fontSize: 11,
                                color: "white",
                                overflow: "hidden",
                                zIndex: 2,
                                lineHeight: "14px",
                              }}
                            >
                              {block.text}
                            </div>
                          )}
                          {isInRange &&
                            dayIndex === currentDayIndex &&
                            hour === Math.floor(currentHour) &&
                            minute === (currentMinutes >= 30 ? 30 : 0) && (
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
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div
          style={{
            marginLeft: 15,
            width: SIDEBAR_WIDTH,
            minWidth: SIDEBAR_WIDTH,
            height: scheduleHeight || "auto",
            padding: 20,
            backgroundColor: "white",
            borderRadius: 6,
            boxShadow: "1px 2px 3px 0px #e6e9ec",
          }}
        >
        </div>
      </div>
    );
  }
}

const styles = {
  timeHeader: {
    width: 90,
    padding: "8px 4px",
    textAlign: "right",
    fontSize: 12,
    color: "#666",
  },
  dayHeader: {
    padding: "8px 4px",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 14,
    borderBottom: "2px solid #333",
  },
  timeCell: {
    padding: "0 8px 0 0",
    textAlign: "right",
    fontSize: 11,
    color: "#888",
    verticalAlign: "top",
    whiteSpace: "nowrap",
    height: SLOT_HEIGHT,
  },
  cell: {
    borderLeft: "1px solid #ddd",
    borderRight: "1px solid #ddd",
    height: SLOT_HEIGHT,
    padding: 0,
  },
};
