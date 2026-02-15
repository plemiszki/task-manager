import React from "react";

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

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

const TIME_SLOTS = buildTimeSlots();

export default class Schedule extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      now: new Date(),
    };
  }

  componentDidMount() {
    this.timer = setInterval(() => {
      this.setState({ now: new Date() });
    }, 60000);
  }

  componentWillUnmount() {
    clearInterval(this.timer);
  }

  render() {
    const { now } = this.state;
    const currentDayIndex = getCurrentDayIndex();
    const currentHour = now.getHours();
    const currentMinutes = now.getMinutes();
    const isInRange =
      currentHour >= 6 &&
      (currentHour < 22 || (currentHour === 22 && currentMinutes <= 30));

    return (
      <div
        className="container"
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: 20,
          backgroundColor: "white",
          borderRadius: 6,
          boxShadow: "1px 2px 3px 0px #e6e9ec",
          marginBottom: 20,
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
                  {DAYS.map((day, dayIndex) => (
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
                      {isInRange &&
                        dayIndex === currentDayIndex &&
                        hour === Math.floor(currentHour) &&
                        minute === (currentMinutes >= 30 ? 30 : 0) && (
                          <div
                            style={{
                              position: "absolute",
                              top: ((currentMinutes % 30) / 30) * 24,
                              left: 0,
                              right: 0,
                              height: 2,
                              backgroundColor: "#d9534f",
                              zIndex: 1,
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
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
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
    height: 24,
  },
  cell: {
    borderLeft: "1px solid #ddd",
    borderRight: "1px solid #ddd",
    height: 24,
    padding: 0,
  },
};
