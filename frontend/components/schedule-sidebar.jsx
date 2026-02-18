import React from "react";

const SIDEBAR_WIDTH = 250;
const TOTAL_WEEKLY_MINUTES = 7 * 16.5 * 60; // 6:00-22:30, 7 days

function formatMinutes(totalMinutes) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}:${minutes.toString().padStart(2, "0")}`;
}

function blockDuration(block) {
  const [sh, sm] = block.startTime.split(":").map(Number);
  const [eh, em] = block.endTime.split(":").map(Number);
  return eh * 60 + em - (sh * 60 + sm);
}

export default class ScheduleSidebar extends React.Component {
  render() {
    const {
      height,
      onAddBlock,
      onAddCategory,
      currentActivity,
      scheduleBlocks,
      scheduleCategories,
    } = this.props;

    const categoryMap = {};
    scheduleCategories.forEach((c) => {
      categoryMap[c.id] = c.name;
    });

    const minutesByCategory = {};
    let totalScheduled = 0;
    scheduleBlocks.forEach((block) => {
      const dur = blockDuration(block);
      totalScheduled += dur;
      const key = block.scheduleCategoryId || "uncategorized";
      minutesByCategory[key] = (minutesByCategory[key] || 0) + dur;
    });

    const breakdown = [];
    scheduleCategories.forEach((c) => {
      if (minutesByCategory[c.id]) {
        breakdown.push({ name: c.name, minutes: minutesByCategory[c.id] });
      }
    });
    if (minutesByCategory["uncategorized"]) {
      breakdown.push({
        name: "Uncategorized",
        minutes: minutesByCategory["uncategorized"],
      });
    }
    breakdown.push({
      name: "Free",
      minutes: TOTAL_WEEKLY_MINUTES - totalScheduled,
    });

    return (
      <div
        style={{
          marginLeft: 15,
          width: SIDEBAR_WIDTH,
          minWidth: SIDEBAR_WIDTH,
          height: height || "auto",
          padding: 20,
          backgroundColor: "white",
          borderRadius: 6,
          boxShadow: "1px 2px 3px 0px #e6e9ec",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
          <div
            style={{
              border: "solid 1px lightgray",
              borderRadius: 5,
              padding: 10,
            }}
          >
            <div style={{ fontSize: 12, color: "#888", marginBottom: 4 }}>
              Current Activity
            </div>
            <div style={{ fontSize: 14, fontWeight: "bold" }}>
              {currentActivity || "(None)"}
            </div>
          </div>
          <div
            className="btn"
            style={{ width: "100%", backgroundColor: "black", color: "white" }}
            onClick={onAddBlock}
          >
            Add Block
          </div>
          <div
            style={{
              border: "solid 1px lightgray",
              borderRadius: 5,
              padding: 10,
            }}
          >
            {breakdown.map((item) => {
              const isUncategorized = item.name === "Uncategorized";
              return (
                <div
                  key={item.name}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: 13,
                    marginBottom: 4,
                    fontStyle: isUncategorized ? "italic" : "normal",
                  }}
                >
                  <span>{item.name}</span>
                  <span style={{ fontWeight: "bold" }}>
                    {formatMinutes(item.minutes)}
                  </span>
                </div>
              );
            })}
          </div>
          <div
            className="btn"
            style={{
              width: "100%",
              backgroundColor: "black",
              color: "white",
            }}
            onClick={onAddCategory}
          >
            Add Category
          </div>
        </div>
      </div>
    );
  }
}
