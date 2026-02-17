import React from "react";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";

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

export default class ScheduleTable extends React.Component {
  getVariantLabel(dayIndex) {
    const { scheduleDayVariants, activeDayVariants } = this.props;
    const activeId = activeDayVariants[dayIndex] || null;
    if (activeId === null) return "Normal";
    const variant = scheduleDayVariants.find((v) => v.id === activeId);
    return variant ? variant.name : "Normal";
  }

  getBlockForCell(dayIndex, hour, minute) {
    const { scheduleBlocks } = this.props;
    const cellStart = hour * 60 + minute;
    const cellEnd = cellStart + 30;
    return scheduleBlocks.find((block) => {
      if (block.weekday !== dayIndex) return false;
      const startMinutes = timeToMinutes(block.startTime);
      return startMinutes >= cellStart && startMinutes < cellEnd;
    });
  }

  render() {
    const { now } = this.props;
    const currentDayIndex = getCurrentDayIndex();
    const currentHour = now.getHours();
    const currentMinutes = now.getMinutes();
    const isInRange =
      currentHour >= 6 &&
      (currentHour < 22 || (currentHour === 22 && currentMinutes <= 30));

    return (
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
                  <div style={{ marginBottom: 4 }}>{day}</div>
                  <div
                    style={{
                      fontSize: 11,
                      color: "#888",
                      position: "relative",
                      textAlign: "center",
                    }}
                  >
                    <span
                      style={{ cursor: (this.props.scheduleDayVariants || []).some((v) => v.weekday === i) ? "pointer" : "default" }}
                      onClick={() => this.props.onCycleDayVariant(i)}
                    >
                      {this.getVariantLabel(i)}
                    </span>
                    <AddCircleOutlineIcon
                      style={{ fontSize: 14, cursor: "pointer", position: "absolute", right: 0, top: "50%", transform: "translateY(-50%)" }}
                      onClick={() => this.props.onAddDayVariant(i)}
                    />
                  </div>
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
                  const cellStart = hour * 60 + minute;
                  const startMinutes = block
                    ? timeToMinutes(block.startTime)
                    : 0;
                  const endMinutes = block ? timeToMinutes(block.endTime) : 0;
                  const offsetWithinCell = block
                    ? ((startMinutes - cellStart) / 30) * SLOT_HEIGHT
                    : 0;
                  const blockHeight = block
                    ? ((endMinutes - startMinutes) / 30) * SLOT_HEIGHT
                    : 0;

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
                      onDoubleClick={() => {
                        if (!block) {
                          const startTime = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
                          this.props.onCellDoubleClick(dayIndex, startTime);
                        }
                      }}
                    >
                      {block && (
                        <div
                          style={{
                            position: "absolute",
                            top: offsetWithinCell,
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
                            cursor: "pointer",
                          }}
                          onClick={() => this.props.onBlockClick(block)}
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
