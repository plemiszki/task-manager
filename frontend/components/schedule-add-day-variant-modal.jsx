import React from "react";
import Modal from "react-modal";
import { Details, createEntity, Spinner, GrayedOut } from "handy-components";

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const modalStyles = {
  overlay: {
    background: "rgba(0, 0, 0, 0.50)",
    zIndex: 10,
  },
  content: {
    background: "#FFFFFF",
    margin: "auto",
    maxWidth: 400,
    height: 239,
    border: "solid 1px black",
    borderRadius: "6px",
    padding: 0,
  },
};

export default class ScheduleAddDayVariantModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      newVariant: { name: "" },
      spinner: false,
      errors: [],
    };
  }

  componentDidUpdate(prevProps) {
    if (this.props.isOpen && !prevProps.isOpen) {
      this.setState({ newVariant: { name: "" }, errors: [] });
    }
  }

  changeFieldArgs() {
    return {
      entity: "newVariant",
      errorsArray: this.state.errors,
    };
  }

  submitVariant() {
    const { weekday, onSave } = this.props;
    const { newVariant } = this.state;
    this.setState({ spinner: true });
    createEntity({
      directory: "schedule_day_variants",
      entityName: "scheduleDayVariant",
      entity: { name: newVariant.name, weekday },
    }).then(
      (response) => {
        this.setState({ spinner: false });
        onSave(response.scheduleDayVariants);
      },
      (response) => {
        this.setState({
          spinner: false,
          errors: response.errors,
        });
      },
    );
  }

  render() {
    const { isOpen, onClose, weekday } = this.props;
    const { spinner, errors } = this.state;

    return (
      <Modal
        isOpen={isOpen}
        onRequestClose={onClose}
        contentLabel="Modal"
        style={modalStyles}
      >
        <div className="admin-modal handy-component">
          <div className="white-box" style={{ marginBottom: 0 }}>
            <div
              className="row"
              onKeyDown={(e) => {
                if (e.key === "Enter") this.submitVariant();
              }}
            >
              {Details.renderField.bind(this)({
                columnWidth: 12,
                entity: "newVariant",
                property: "name",
              })}
            </div>
            {errors.length > 0 && (
              <div className="row">
                <div className="col-xs-12">
                  <div style={{ color: "red", fontSize: 12, marginTop: 10 }}>
                    {errors.join(", ")}
                  </div>
                </div>
              </div>
            )}
            <div className="row" style={{ marginTop: 15 }}>
              <div className="col-xs-12" style={{ textAlign: "right" }}>
                <div
                  className="btn"
                  style={{
                    backgroundColor: "black",
                    color: "white",
                  }}
                  onClick={this.submitVariant.bind(this)}
                >
                  Add {DAYS[weekday]} Variant
                </div>
              </div>
            </div>
            <GrayedOut visible={spinner} />
            <Spinner visible={spinner} />
          </div>
        </div>
      </Modal>
    );
  }
}
