import React from "react";
import RefreshIcon from "@mui/icons-material/Refresh";
import {
  Details,
  deepCopy,
  objectsAreEqual,
  fetchEntity,
  updateEntity,
  setUpNiceSelect,
  SaveButton,
  Spinner,
  GrayedOut,
} from "handy-components";

const STATUSES = [
  { value: "available", text: "Available" },
  { value: "not_available", text: "Not Available" },
];

const PROPERTY_TYPES = [
  { value: "townhouse", text: "Townhouse" },
  { value: "condo", text: "Condo" },
  { value: "co-op", text: "Co-op" },
  { value: "single-family", text: "Single-Family" },
  { value: "double-family", text: "Double-Family" },
  { value: "multi-family", text: "Multi-Family" },
];

export default class PropertyDetails extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      spinner: true,
      property: {},
      propertySaved: {},
      errors: {},
      changesToSave: false,
      justSaved: false,
    };
  }

  componentDidMount() {
    fetchEntity().then((response) => {
      const { property } = response;
      this.setState(
        { spinner: false, property, propertySaved: deepCopy(property) },
        () => {
          setUpNiceSelect({ selector: "select", func: Details.changeDropdownField.bind(this) });
        },
      );
    });
  }

  checkForChanges() {
    const { property, propertySaved } = this.state;
    return !objectsAreEqual(property, propertySaved);
  }

  changeFieldArgs() {
    return {
      changesFunction: this.checkForChanges.bind(this),
    };
  }

  clickSave() {
    this.setState({ spinner: true, justSaved: true }, () => {
      const property = {
        ...this.state.property,
        price: this.state.property.price.toString().replace(/[$,]/g, ''),
      };
      updateEntity({
        entityName: "property",
        entity: property,
      }).then(
        (response) => {
          const { property } = response;
          this.setState({
            spinner: false,
            property,
            propertySaved: deepCopy(property),
            changesToSave: false,
          });
        },
        (response) => {
          this.setState({ spinner: false, errors: response.errors });
        },
      );
    });
  }

  render() {
    const { spinner, justSaved, changesToSave } = this.state;
    return (
      <div className="handy-component">
        <div className="white-box">
          <div className="row">
            {Details.renderField.bind(this)({ columnWidth: 3, entity: "property", property: "label" })}
            {Details.renderField.bind(this)({ columnWidth: 2, entity: "property", property: "price" })}
            {Details.renderField.bind(this)({ columnWidth: 2, entity: "property", property: "neighborhood" })}
            {Details.renderDropDown.bind(this)({
              columnWidth: 3,
              entity: "property",
              columnHeader: "Type",
              property: "propertyType",
              type: "dropdown",
              options: PROPERTY_TYPES,
              optionDisplayProperty: "text",
            })}
            {Details.renderDropDown.bind(this)({
              columnWidth: 2,
              entity: "property",
              property: "status",
              type: "dropdown",
              options: STATUSES,
              optionDisplayProperty: "text",
            })}
          </div>
          <div className="row">
            {Details.renderField.bind(this)({ columnWidth: 6, entity: "property", property: "streetAddress", columnHeader: "Street Address" })}
            {Details.renderField.bind(this)({ columnWidth: 2, entity: "property", property: "aptNumber", columnHeader: "Apt #" })}
            {Details.renderField.bind(this)({ columnWidth: 2, entity: "property", property: "bedrooms" })}
            {Details.renderField.bind(this)({ columnWidth: 2, entity: "property", property: "bathrooms" })}
          </div>
          <div className="row">
            {Details.renderField.bind(this)({ columnWidth: 2, entity: "property", property: "taxes" })}
            {Details.renderField.bind(this)({ columnWidth: 2, entity: "property", property: "insurance" })}
            {Details.renderField.bind(this)({ columnWidth: 2, entity: "property", property: "hoaFees", columnHeader: "HOA Fees" })}
            {Details.renderField.bind(this)({ columnWidth: 2, entity: "property", property: "area" })}
            {Details.renderField.bind(this)({ columnWidth: 2, entity: "property", property: "schoolDistrict", columnHeader: "District" })}
            {Details.renderField.bind(this)({ columnWidth: 2, entity: "property", property: "schoolZone", columnHeader: "Zone" })}
          </div>
          <div className="row">
            {Details.renderField.bind(this)({ columnWidth: 9, entity: "property", property: "url", columnHeader: "URL", readOnly: true, linkText: "Visit Link", linkUrl: this.state.property.url, linkNewWindow: true })}
            {Details.renderField.bind(this)({ columnWidth: 3, entity: "property", property: "dateAdded", columnHeader: "Date Added", readOnly: true })}
          </div>
          <RefreshIcon
            style={{ position: "absolute", bottom: 26, right: 26, cursor: "pointer", color: "#333", fontSize: 30 }}
            onClick={() => {
              const { property } = this.state;
              fetch(`/api/properties/${property.id}/refetch`, { method: "POST", headers: { "X-CSRF-Token": document.querySelector('meta[name="csrf-token"]')?.content } })
                .then((r) => r.json())
                .then((response) => console.log(response));
            }}
          />
          <SaveButton
            justSaved={justSaved}
            changesToSave={changesToSave}
            disabled={spinner}
            onClick={() => this.clickSave()}
          />
          <GrayedOut visible={spinner} />
          <Spinner visible={spinner} />
        </div>
      </div>
    );
  }
}
