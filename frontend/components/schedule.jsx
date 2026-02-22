import React from "react";
import { sendRequest, deleteEntity, Spinner } from "handy-components";
import ScheduleTable from "./schedule-table.jsx";
import ScheduleSidebar from "./schedule-sidebar.jsx";
import ScheduleAddBlockModal from "./schedule-add-block-modal.jsx";
import ScheduleAddCategoryModal from "./schedule-add-category-modal.jsx";
import ScheduleAddDayVariantModal from "./schedule-add-day-variant-modal.jsx";
import ConfirmModal from "./confirm-modal.jsx";

export default class Schedule extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      now: new Date(),
      loading: true,
      scheduleBlocks: [],
      scheduleHeight: 0,
      modalOpen: false,
      categoryModalOpen: false,
      dayVariantModalOpen: false,
      dayVariantWeekday: null,
      editingDayVariant: null,
      deletingDayVariant: null,
      variantViewWeekday: null,
      editingBlock: null,
      newBlockDefaults: null,
      editingCategory: null,
      scheduleCategories: [],
      scheduleDayVariants: [],
      activeDayVariants: {},
    };
    this.scheduleRef = React.createRef();
  }

  componentDidMount() {
    Promise.all([
      sendRequest("/api/schedule_blocks"),
      sendRequest("/api/schedule_categories"),
      sendRequest("/api/schedule_day_variants"),
    ]).then(([blocksRes, categoriesRes, variantsRes]) => {
      const activeDayVariants = {};
      variantsRes.scheduleDayVariants.forEach((v) => {
        if (v.active) activeDayVariants[v.weekday] = v.id;
      });
      this.setState({
        loading: false,
        scheduleBlocks: blocksRes.scheduleBlocks,
        scheduleCategories: categoriesRes.scheduleCategories,
        scheduleDayVariants: variantsRes.scheduleDayVariants,
        activeDayVariants,
      });
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

  confirmDeleteVariant() {
    const { deletingDayVariant, activeDayVariants } = this.state;
    deleteEntity({
      id: deletingDayVariant.id,
      directory: "schedule_day_variants",
    }).then((response) => {
      const newActiveDayVariants = { ...activeDayVariants };
      if (newActiveDayVariants[deletingDayVariant.weekday] === deletingDayVariant.id) {
        newActiveDayVariants[deletingDayVariant.weekday] = null;
      }
      this.setState({
        scheduleDayVariants: response.scheduleDayVariants,
        activeDayVariants: newActiveDayVariants,
        deletingDayVariant: null,
      });
    });
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
      scheduleCategories,
      scheduleHeight,
      modalOpen,
      editingBlock,
      newBlockDefaults,
    } = this.state;

    if (this.state.loading) {
      return (
        <div
          className="container widened-container"
          style={{ position: "relative", height: 200 }}
        >
          <Spinner visible={true} />
        </div>
      );
    }

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
            scheduleDayVariants={this.state.scheduleDayVariants}
            activeDayVariants={this.state.activeDayVariants}
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
            variantViewWeekday={this.state.variantViewWeekday}
            onDayDoubleClick={(weekday) => this.setState({ variantViewWeekday: weekday })}
            onExitVariantView={() => this.setState({ variantViewWeekday: null })}
            onAddDayVariant={(weekday) =>
              this.setState({
                dayVariantModalOpen: true,
                dayVariantWeekday: weekday,
                editingDayVariant: null,
              })
            }
            onEditDayVariant={(variant) =>
              this.setState({
                dayVariantModalOpen: true,
                dayVariantWeekday: variant.weekday,
                editingDayVariant: variant,
              })
            }
            onDeleteDayVariant={(variant) =>
              this.setState({ deletingDayVariant: variant })
            }
            onCycleDayVariant={(weekday) => {
              const { scheduleDayVariants, activeDayVariants } = this.state;
              const variants = scheduleDayVariants.filter(
                (v) => v.weekday === weekday,
              );
              const currentId = activeDayVariants[weekday] || null;
              let nextId = null;
              if (currentId === null && variants.length > 0) {
                nextId = variants[0].id;
              } else if (currentId !== null) {
                const idx = variants.findIndex((v) => v.id === currentId);
                if (idx < variants.length - 1) {
                  nextId = variants[idx + 1].id;
                }
              }
              this.setState({
                activeDayVariants: { ...activeDayVariants, [weekday]: nextId },
              });
              const activateParams = nextId
                ? `weekday=${weekday}&id=${nextId}`
                : `weekday=${weekday}`;
              sendRequest(
                `/api/schedule_day_variants/activate?${activateParams}`,
                {
                  method: "PATCH",
                },
              );
            }}
          />
        </div>
        <ScheduleSidebar
          height={scheduleHeight}
          currentActivity={currentBlock ? currentBlock.text : null}
          scheduleBlocks={scheduleBlocks}
          scheduleCategories={scheduleCategories}
          activeDayVariants={this.state.activeDayVariants}
          onAddBlock={() =>
            this.setState({
              modalOpen: true,
              editingBlock: null,
              newBlockDefaults: null,
            })
          }
          onAddCategory={() => this.setState({ categoryModalOpen: true, editingCategory: null })}
          onEditCategory={(category) => this.setState({ categoryModalOpen: true, editingCategory: category })}
        />
        <ScheduleAddBlockModal
          isOpen={modalOpen}
          block={editingBlock}
          defaults={newBlockDefaults}
          activeDayVariants={this.state.activeDayVariants}
          scheduleDayVariants={this.state.scheduleDayVariants}
          onClose={() => this.setState({ modalOpen: false })}
          onSave={(scheduleBlocks) =>
            this.setState({ scheduleBlocks, modalOpen: false })
          }
        />
        <ScheduleAddCategoryModal
          isOpen={this.state.categoryModalOpen}
          category={this.state.editingCategory}
          onClose={() => this.setState({ categoryModalOpen: false })}
          onSave={(scheduleCategories) =>
            this.setState({ scheduleCategories, categoryModalOpen: false })
          }
        />
        <ScheduleAddDayVariantModal
          isOpen={this.state.dayVariantModalOpen}
          weekday={this.state.dayVariantWeekday}
          editingVariant={this.state.editingDayVariant}
          onClose={() => this.setState({ dayVariantModalOpen: false, editingDayVariant: null })}
          onSave={(scheduleDayVariants) =>
            this.setState({ scheduleDayVariants, dayVariantModalOpen: false, editingDayVariant: null })
          }
        />
        <ConfirmModal
          isOpen={!!this.state.deletingDayVariant}
          header="Delete this variant?"
          confirmText="Delete"
          onConfirm={this.confirmDeleteVariant.bind(this)}
          onClose={() => this.setState({ deletingDayVariant: null })}
        />
      </div>
    );
  }
}
