import React from "react";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

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
  constructor(props) {
    super(props);
    this.state = { headerExpanded: false };
  }

  getVariantLabel(dayIndex) {
    const { scheduleDayVariants, activeDayVariants } = this.props;
    const activeId = activeDayVariants[dayIndex] || null;
    if (activeId === null) return "Normal";
    const variant = scheduleDayVariants.find((v) => v.id === activeId);
    return variant ? variant.name : "Normal";
  }

  getBlocksForColumn(weekday, activeVariantId, hour, minute) {
    const { scheduleBlocks } = this.props;
    const cellStart = hour * 60 + minute;
    const cellEnd = cellStart + 30;
    return scheduleBlocks.filter((block) => {
      if (block.weekday !== weekday) return false;
      const startMinutes = timeToMinutes(block.startTime);
      if (startMinutes < cellStart || startMinutes >= cellEnd) return false;
      if (block.scheduleDayVariantId) {
        return block.scheduleDayVariantId === activeVariantId;
      }
      if (block.normalDayOnly) {
        return activeVariantId === null;
      }
      return true;
    });
  }

  render() {
    const { now, variantViewWeekday, scheduleDayVariants, activeDayVariants } = this.props;
    const { headerExpanded } = this.state;
    const currentDayIndex = getCurrentDayIndex();
    const currentHour = now.getHours();
    const currentMinutes = now.getMinutes();
    const isInRange =
      currentHour >= 6 &&
      (currentHour < 22 || (currentHour === 22 && currentMinutes <= 30));

    const inVariantView = variantViewWeekday !== null;

    let columns;
    if (inVariantView) {
      const dayVariants = (scheduleDayVariants || [])
        .filter((v) => v.weekday === variantViewWeekday)
        .slice(0, 6);
      columns = [
        { label: DAYS[variantViewWeekday], weekday: variantViewWeekday, activeVariantId: null },
        ...dayVariants.map((v) => ({ label: v.name, weekday: variantViewWeekday, activeVariantId: v.id })),
      ];
    } else {
      columns = DAYS.map((day, i) => ({
        label: day,
        weekday: i,
        activeVariantId: (activeDayVariants || {})[i] || null,
      }));
    }

    return (
      <div style={{ overflowX: "auto", overflowY: "hidden", position: "relative" }}>
        <div style={{ position: "absolute", bottom: 0, left: 90, right: 0, height: 2, backgroundColor: "#333", zIndex: 10 }} />
        <table
          style={{
            width: inVariantView
              ? `calc(90px + ${columns.length} * (100% - 90px) / 7)`
              : "100%",
            borderCollapse: "collapse",
            tableLayout: "fixed",
          }}
        >
          <thead>
            <tr>
              <th style={styles.timeHeader}>
                {inVariantView ? (
                  <ArrowBackIcon
                    style={{ fontSize: 16, cursor: "pointer", color: "#666" }}
                    onClick={() => this.props.onExitVariantView()}
                  />
                ) : (
                  <ExpandMoreIcon
                    style={{ fontSize: 16, cursor: "pointer", color: "#666", transform: headerExpanded ? "rotate(0deg)" : "rotate(-90deg)", transition: "transform 0.2s" }}
                    onClick={() => this.setState({ headerExpanded: !headerExpanded })}
                  />
                )}
              </th>
              {columns.map((col) => (
                <th
                  key={col.label}
                  style={{
                    ...styles.dayHeader,
                    ...(!inVariantView && col.weekday === currentDayIndex
                      ? { color: "#d9534f", fontWeight: "bold" }
                      : {}),
                  }}
                >
                  <div
                    style={{
                      marginBottom: 4,
                      cursor: !inVariantView ? "pointer" : "default",
                    }}
                    onClick={() => {
                      if (!inVariantView) {
                        this.props.onDayDoubleClick(col.weekday);
                      }
                    }}
                  >
                    {col.label}
                  </div>
                  {!inVariantView && headerExpanded && (
                    <div
                      style={{
                        fontSize: 11,
                        color: "#888",
                        position: "relative",
                        textAlign: "center",
                      }}
                    >
                      <span
                        style={{ cursor: (scheduleDayVariants || []).some((v) => v.weekday === col.weekday) ? "pointer" : "default" }}
                        onClick={() => this.props.onCycleDayVariant(col.weekday)}
                      >
                        {this.getVariantLabel(col.weekday)}
                      </span>
                      <AddCircleOutlineIcon
                        style={{ fontSize: 14, cursor: "pointer", position: "absolute", right: 0, top: "50%", transform: "translateY(-50%)" }}
                        onClick={() => this.props.onAddDayVariant(col.weekday)}
                      />
                    </div>
                  )}
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
                {columns.map((col) => {
                  const blocks = this.getBlocksForColumn(col.weekday, col.activeVariantId, hour, minute);
                  const cellStart = hour * 60 + minute;

                  return (
                    <td
                      key={`${col.label}-${hour}-${minute}`}
                      style={{
                        ...styles.cell,
                        borderTopWidth: minute === 0 ? 1 : 0,
                        borderTopStyle: minute === 0 ? "solid" : "none",
                        borderTopColor: "#ccc",
                        position: "relative",
                      }}
                      onDoubleClick={() => {
                        if (blocks.length === 0) {
                          const startTime = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
                          this.props.onCellDoubleClick(col.weekday, startTime);
                        }
                      }}
                    >
                      {blocks.map((block) => {
                        const startMinutes = timeToMinutes(block.startTime);
                        const endMinutes = timeToMinutes(block.endTime);
                        const durationMinutes = endMinutes - startMinutes;
                        const offsetWithinCell = ((startMinutes - cellStart) / 30) * SLOT_HEIGHT;
                        const blockHeight = (durationMinutes / 30) * SLOT_HEIGHT;
                        return (
                          <div
                            key={block.id}
                            style={{
                              position: "absolute",
                              top: offsetWithinCell,
                              left: 2,
                              right: 2,
                              height: blockHeight,
                              backgroundColor: block.color,
                              borderRadius: 4,
                              padding: durationMinutes <= 15 ? "1px 3px" : "2px 6px",
                              fontSize: durationMinutes <= 15 ? 9 : 11,
                              color: "white",
                              overflow: "hidden",
                              zIndex: 2,
                              lineHeight: "14px",
                              cursor: "pointer",
                              display: durationMinutes <= 15 ? "flex" : "block",
                              alignItems: durationMinutes <= 15 ? "center" : undefined,
                            }}
                            onClick={() => this.props.onBlockClick(block)}
                          >
                            {block.text}
                          </div>
                        );
                      })}
                      {!inVariantView &&
                        isInRange &&
                        col.weekday === currentDayIndex &&
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
    verticalAlign: "top",
  },
  dayHeader: {
    padding: "8px 4px",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 14,
    borderBottom: "2px solid #333",
    verticalAlign: "top",
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
