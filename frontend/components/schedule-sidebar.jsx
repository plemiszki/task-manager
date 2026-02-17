import React from "react";

const SIDEBAR_WIDTH = 250;

export default class ScheduleSidebar extends React.Component {
  render() {
    const { height, onAddBlock, onAddCategory, currentActivity } = this.props;

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
        <div
          style={{
            marginBottom: 20,
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
          className="btn"
          style={{ width: "100%", backgroundColor: "black", color: "white", marginTop: 10 }}
          onClick={onAddCategory}
        >
          Add Category
        </div>
      </div>
    );
  }
}
