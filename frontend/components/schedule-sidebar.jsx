import React from "react";

const SIDEBAR_WIDTH = 250;

export default class ScheduleSidebar extends React.Component {
  render() {
    const { height, onAddBlock } = this.props;

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
          className="btn"
          style={{ width: "100%", backgroundColor: "black", color: "white" }}
          onClick={onAddBlock}
        >
          Add Block
        </div>
      </div>
    );
  }
}
