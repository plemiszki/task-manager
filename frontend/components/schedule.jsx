import React from "react";
import { sendRequest } from "handy-components";
import ScheduleTable from "./schedule-table.jsx";
import ScheduleSidebar from "./schedule-sidebar.jsx";
import ScheduleAddBlockModal from "./schedule-add-block-modal.jsx";

export default class Schedule extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      now: new Date(),
      scheduleBlocks: [],
      scheduleHeight: 0,
      addBlockModalOpen: false,
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

  render() {
    const { now, scheduleBlocks, scheduleHeight, addBlockModalOpen } =
      this.state;

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
          <ScheduleTable scheduleBlocks={scheduleBlocks} now={now} />
        </div>
        <ScheduleSidebar
          height={scheduleHeight}
          onAddBlock={() => this.setState({ addBlockModalOpen: true })}
        />
        <ScheduleAddBlockModal
          isOpen={addBlockModalOpen}
          onClose={() => this.setState({ addBlockModalOpen: false })}
          onBlockCreated={(scheduleBlocks) =>
            this.setState({ scheduleBlocks, addBlockModalOpen: false })
          }
        />
      </div>
    );
  }
}
