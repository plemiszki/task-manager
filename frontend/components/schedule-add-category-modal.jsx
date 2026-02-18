import React from "react";
import Modal from "react-modal";
import { Details, createEntity, updateEntity, Spinner, GrayedOut } from "handy-components";

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

export default class ScheduleAddCategoryModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      newCategory: { name: "" },
      spinner: false,
      errors: [],
    };
  }

  componentDidUpdate(prevProps) {
    if (this.props.isOpen && !prevProps.isOpen) {
      const { category } = this.props;
      this.setState({
        newCategory: { name: category ? category.name : "" },
        errors: [],
      });
    }
  }

  changeFieldArgs() {
    return {
      entity: "newCategory",
      errorsArray: this.state.errors,
    };
  }

  submitCategory() {
    const { category, onSave } = this.props;
    const { newCategory } = this.state;
    this.setState({ spinner: true });
    const request = category
      ? updateEntity({
          id: category.id,
          directory: "schedule_categories",
          entityName: "scheduleCategory",
          entity: { name: newCategory.name },
        })
      : createEntity({
          directory: "schedule_categories",
          entityName: "scheduleCategory",
          entity: { name: newCategory.name },
        });
    request.then(
      (response) => {
        this.setState({ spinner: false });
        onSave(response.scheduleCategories);
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
    const { isOpen, onClose, category } = this.props;
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
                if (e.key === "Enter") this.submitCategory();
              }}
            >
              {Details.renderField.bind(this)({
                columnWidth: 12,
                entity: "newCategory",
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
                  onClick={this.submitCategory.bind(this)}
                >
                  {category ? "Edit Category" : "Add Category"}
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
