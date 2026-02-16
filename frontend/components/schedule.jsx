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
      modalOpen: false,
      editingBlock: null,
      newBlockDefaults: null,
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
    const {
      now,
      scheduleBlocks,
      scheduleHeight,
      modalOpen,
      editingBlock,
      newBlockDefaults,
    } = this.state;

    const jsDay = now.getDay();
    const currentDayIndex = jsDay === 0 ? 6 : jsDay - 1;
    const nowMinutes = now.getHours() * 60 + now.getMinutes();
    const currentBlock = scheduleBlocks.find((block) => {
      if (block.weekday !== currentDayIndex) return false;
      const [sh, sm] = block.startTime.split(":").map(Number);
      const [eh, em] = block.endTime.split(":").map(Number);
      return nowMinutes >= sh * 60 + sm && nowMinutes < eh * 60 + em;
    });

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
          <ScheduleTable
            scheduleBlocks={scheduleBlocks}
            now={now}
            onBlockClick={(block) =>
              this.setState({ modalOpen: true, editingBlock: block })
            }
            onCellDoubleClick={(weekday, startTime) =>
              this.setState({
                modalOpen: true,
                editingBlock: null,
                newBlockDefaults: { weekday, startTime },
              })
            }
          />
        </div>
        <ScheduleSidebar
          height={scheduleHeight}
          currentActivity={currentBlock ? currentBlock.text : null}
          onAddBlock={() =>
            this.setState({ modalOpen: true, editingBlock: null, newBlockDefaults: null })
          }
        />
        <ScheduleAddBlockModal
          isOpen={modalOpen}
          block={editingBlock}
          defaults={newBlockDefaults}
          onClose={() => this.setState({ modalOpen: false })}
          onSave={(scheduleBlocks) =>
            this.setState({ scheduleBlocks, modalOpen: false })
          }
        />
      </div>
    );
  }
}
