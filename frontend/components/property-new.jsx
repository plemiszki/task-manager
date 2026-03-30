import React from "react";
import { Details, createEntity } from "handy-components";
import DetailsComponent from "./_details.jsx";

export default class PropertyNew extends DetailsComponent {
  constructor(props) {
    super(props);
    this.state = {
      fetching: false,
      property: {
        url: "",
        html: "",
      },
      errors: {},
    };
  }

  changeFieldArgs() {
    return {
      entity: "property",
      errorsArray: this.state.errors,
    };
  }

  clickSave() {
    this.setState({ spinner: true });
    createEntity({
      directory: "properties",
      entityName: "property",
      entity: this.state.property,
    }).then(
      (response) => {
        this.props.afterCreate(response);
      },
      (response) => {
        this.setState({
          spinner: false,
          errors: response.errors || { url: ["Failed to process property"] },
        });
      },
    );
  }

  render() {
    return (
      <div
        id="property-new"
        className="handy-component admin-modal"
        onKeyDown={(e) => e.key === "Enter" && this.clickSave()}
      >
        <div className="white-box">
          <div className="row">
            {Details.renderField.bind(this)({
              columnWidth: 12,
              entity: "property",
              property: "url",
              columnHeader: "URL",
            })}
          </div>
          <div className="row">
            {Details.renderField.bind(this)({
              columnWidth: 12,
              entity: "property",
              property: "html",
              columnHeader: "HTML",
              type: "textbox",
              rows: 8,
            })}
          </div>
          <div className="row">
            <div className="col-xs-12">
              <div
                className="btn"
                style={{ backgroundColor: "#6f42c1", color: "white" }}
                onClick={this.clickSave.bind(this)}
              >
                Add Property
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
