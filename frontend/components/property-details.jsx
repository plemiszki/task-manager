import React from "react";
import Modal from "react-modal";
import RefreshIcon from "@mui/icons-material/Refresh";
import DeleteIcon from "@mui/icons-material/Delete";
import ConfirmModal from "./confirm-modal.jsx";
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

const REFRESH_MODAL_STYLES = {
  overlay: {
    background: "rgba(0, 0, 0, 0.50)",
    zIndex: 3,
  },
  content: {
    background: "white",
    margin: "auto",
    width: 400,
    height: "fit-content",
    border: "solid 1px black",
    borderRadius: "6px",
    color: "black",
  },
};

const STATUSES = [
  { value: "available", text: "Available" },
  { value: "not_available", text: "Not Available" },
];

const PROPERTY_TYPES = [
  { value: "townhouse", text: "Townhouse" },
  { value: "condo", text: "Condo" },
  { value: "co-op", text: "Co-op" },
  { value: "single-family-house", text: "Single-Family House" },
  { value: "double-family-house", text: "Double-Family House" },
  { value: "multi-family-house", text: "Multi-Family House" },
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
      refreshModalOpen: false,
      refreshedData: null,
      deleteModalOpen: false,
    };
  }

  componentDidMount() {
    fetchEntity().then((response) => {
      const { property } = response;
      this.setState(
        { spinner: false, property, propertySaved: deepCopy(property) },
        () => {
          setUpNiceSelect({
            selector: "select",
            func: Details.changeDropdownField.bind(this),
          });
        },
      );
    });
    this.handleKeyDown = (e) => {
      if (e.metaKey && e.key === "s") {
        e.preventDefault();
        this.clickSave();
      }
    };
    document.addEventListener("keydown", this.handleKeyDown);
  }

  componentWillUnmount() {
    document.removeEventListener("keydown", this.handleKeyDown);
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
        price:   this.state.property.price.toString().replace(/[$,]/g, ""),
        taxes:   this.state.property.taxes.toString().replace(/[$,]/g, ""),
        hoaFees: this.state.property.hoaFees.toString().replace(/[$,]/g, ""),
        area:    this.state.property.area.toString().replace(/,/g, ""),
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
          <div style={{ display: "flex", gap: 20, marginBottom: 20 }}>
            {this.state.property.imageUrl && (
              <div
                style={{
                  width: "30%",
                  flexShrink: 0,
                  backgroundImage: `url(${this.state.property.imageUrl})`,
                  backgroundSize: "cover",
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "center",
                }}
              />
            )}
            <div style={{ flex: 1 }}>
              <div className="row">
                {Details.renderField.bind(this)({
                  columnWidth: 3,
                  entity: "property",
                  property: "label",
                })}
                {Details.renderField.bind(this)({
                  columnWidth: 3,
                  entity: "property",
                  property: "price",
                })}
                {Details.renderDropDown.bind(this)({
                  columnWidth: 3,
                  entity: "property",
                  columnHeader: "Type",
                  property: "propertyType",
                  type: "dropdown",
                  options: PROPERTY_TYPES,
                  optionDisplayProperty: "text",
                })}
                {Details.renderField.bind(this)({
                  columnWidth: 3,
                  entity: "property",
                  property: "neighborhood",
                })}
              </div>
              <div className="row">
                {Details.renderDropDown.bind(this)({
                  columnWidth: 3,
                  entity: "property",
                  property: "status",
                  type: "dropdown",
                  options: STATUSES,
                  optionDisplayProperty: "text",
                })}
                {Details.renderField.bind(this)({
                  columnWidth: 2,
                  entity: "property",
                  property: "bedrooms",
                })}
                {Details.renderField.bind(this)({
                  columnWidth: 2,
                  entity: "property",
                  property: "fullBathrooms",
                  columnHeader: "Full Baths",
                })}
                {Details.renderField.bind(this)({
                  columnWidth: 2,
                  entity: "property",
                  property: "halfBathrooms",
                  columnHeader: "Half Baths",
                })}
              </div>
              <div className="row">
                {Details.renderField.bind(this)({
                  columnWidth: 6,
                  entity: "property",
                  property: "streetAddress",
                  columnHeader: "Street Address",
                })}
                {Details.renderField.bind(this)({
                  columnWidth: 2,
                  entity: "property",
                  property: "aptNumber",
                  columnHeader: "Apt #",
                })}
                {Details.renderField.bind(this)({
                  columnWidth: 2,
                  entity: "property",
                  property: "schoolZone",
                  columnHeader: "Zone",
                })}
                {Details.renderField.bind(this)({
                  columnWidth: 2,
                  entity: "property",
                  property: "schoolDistrict",
                  columnHeader: "District",
                })}
              </div>
              <div className="row">
                {Details.renderField.bind(this)({
                  columnWidth: 3,
                  entity: "property",
                  property: "taxes",
                })}
                {Details.renderField.bind(this)({
                  columnWidth: 3,
                  entity: "property",
                  property: "insurance",
                })}
                {Details.renderField.bind(this)({
                  columnWidth: 3,
                  entity: "property",
                  property: "hoaFees",
                  columnHeader: "HOA Fees",
                })}
                {Details.renderField.bind(this)({
                  columnWidth: 3,
                  entity: "property",
                  property: "area",
                })}
              </div>
            </div>
          </div>
          <div className="row">
            {Details.renderField.bind(this)({
              columnWidth: 9,
              entity: "property",
              property: "url",
              columnHeader: "URL",
              readOnly: true,
              linkText: "Visit Link",
              linkUrl: this.state.property.url,
              linkNewWindow: true,
            })}
            {Details.renderField.bind(this)({
              columnWidth: 3,
              entity: "property",
              property: "dateAdded",
              columnHeader: "Date Added",
              readOnly: true,
            })}
          </div>
          <RefreshIcon
            style={{
              position: "absolute",
              bottom: 26,
              right: 66,
              cursor: "pointer",
              color: "#333",
              fontSize: 30,
            }}
            onClick={() => {
              const { property } = this.state;
              this.setState({ spinner: true }, () => {
                fetch(`/api/properties/${property.id}/refetch`, {
                  method: "POST",
                  headers: {
                    "X-CSRF-Token": document.querySelector(
                      'meta[name="csrf-token"]',
                    )?.content,
                  },
                })
                  .then((r) => r.json())
                  .then((response) => {
                    this.setState({
                      spinner: false,
                      refreshedData: response.property,
                      refreshModalOpen: true,
                    });
                  });
              });
            }}
          />
          <DeleteIcon
            style={{
              position: "absolute",
              bottom: 26,
              right: 26,
              cursor: "pointer",
              color: "#333",
              fontSize: 30,
            }}
            onClick={() => this.setState({ deleteModalOpen: true })}
          />
          <Modal
            isOpen={this.state.refreshModalOpen}
            onRequestClose={() => this.setState({ refreshModalOpen: false })}
            contentLabel="Refreshed Data"
            style={REFRESH_MODAL_STYLES}
          >
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontFamily: "Helvetica Neue",
                fontSize: 14,
              }}
            >
              <tbody>
                {this.state.refreshedData &&
                  (() => {
                    const FIELD_ORDER = [
                      "label",
                      "price",
                      "neighborhood",
                      "propertyType",
                      "status",
                      "streetAddress",
                      "aptNumber",
                      "bedrooms",
                      "fullBathrooms",
                      "halfBathrooms",
                      "taxes",
                      "insurance",
                      "hoaFees",
                      "area",
                      "schoolDistrict",
                      "schoolZone",
                    ];
                    const LABEL_OVERRIDES = { hoaFees: "HOA Fees" };
                    const CURRENCY_FIELDS = ["price", "taxes", "hoaFees"];
                    const CAPITALIZE_FIELDS = ["status", "propertyType"];
                    const { refreshedData, propertySaved } = this.state;
                    const formatValue = (key, value) => {
                      if (value == null || value === "") return "-";
                      if (CURRENCY_FIELDS.includes(key))
                        return `$${Number(value).toLocaleString()}`;
                      if (CAPITALIZE_FIELDS.includes(key))
                        return value
                          .replace(/_/g, " ")
                          .replace(/\b\w/g, (c) => c.toUpperCase());
                      return value;
                    };
                    const rows = FIELD_ORDER.filter(
                      (key) => key in refreshedData,
                    );
                    return rows.map((key, index) => {
                      const value = refreshedData[key];
                      const label =
                        LABEL_OVERRIDES[key] ||
                        key
                          .replace(/([A-Z])/g, " $1")
                          .replace(/^./, (c) => c.toUpperCase());
                      const normalize = (v) =>
                        CURRENCY_FIELDS.includes(key)
                          ? String(
                              parseFloat(
                                String(v ?? "").replace(/[$,]/g, ""),
                              ) || 0,
                            )
                          : String(v ?? "");
                      const changed =
                        propertySaved[key] != null &&
                        normalize(propertySaved[key]) !== normalize(value);
                      const isLast = index === rows.length - 1;
                      const displayValue = changed ? (
                        <span>
                          {formatValue(key, propertySaved[key])} →{" "}
                          {formatValue(key, value)}
                        </span>
                      ) : (
                        formatValue(key, value)
                      );
                      return (
                        <tr
                          key={key}
                          style={{
                            borderBottom: isLast ? "none" : "1px solid #eee",
                            background: changed ? "#fffde7" : "transparent",
                          }}
                        >
                          <td
                            style={{
                              padding: "6px 10px",
                              fontWeight: 600,
                              color: "#555",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {label}
                          </td>
                          <td style={{ padding: "6px 10px" }}>
                            {displayValue}
                          </td>
                        </tr>
                      );
                    });
                  })()}
              </tbody>
            </table>
            {(() => {
              const { refreshedData, propertySaved } = this.state;
              const CURRENCY_FIELDS = ["price", "taxes", "hoaFees"];
              const normalize = (key, v) =>
                CURRENCY_FIELDS.includes(key)
                  ? String(
                      parseFloat(String(v ?? "").replace(/[$,]/g, "")) || 0,
                    )
                  : String(v ?? "");
              const hasChanges =
                refreshedData &&
                Object.entries(refreshedData).some(
                  ([key, value]) =>
                    normalize(key, propertySaved[key]) !==
                    normalize(key, value),
                );
              return (
                <div style={{ textAlign: "center", marginTop: 12 }}>
                  <a
                    className="btn"
                    style={{
                      background: "#333",
                      color: "white",
                      opacity: hasChanges ? 1 : 0.4,
                      pointerEvents: hasChanges ? "auto" : "none",
                    }}
                    onClick={() => {
                      const { refreshedData, propertySaved } = this.state;
                      const changedFields = Object.fromEntries(
                        Object.entries(refreshedData).filter(
                          ([key, value]) =>
                            normalize(key, propertySaved[key]) !==
                            normalize(key, value),
                        ),
                      );
                      this.setState(
                        { refreshModalOpen: false, spinner: true },
                        () => {
                          updateEntity({
                            entityName: "property",
                            entity: { ...changedFields },
                          }).then(
                            (response) => {
                              this.setState({
                                spinner: false,
                                property: response.property,
                                propertySaved: deepCopy(response.property),
                                changesToSave: false,
                              });
                            },
                            (response) => {
                              this.setState({
                                spinner: false,
                                errors: response.errors,
                              });
                            },
                          );
                        },
                      );
                    }}
                  >
                    Update
                  </a>
                </div>
              );
            })()}
          </Modal>
          <SaveButton
            justSaved={justSaved}
            changesToSave={changesToSave}
            disabled={spinner}
            onClick={() => this.clickSave()}
          />
          <GrayedOut visible={spinner} />
          <Spinner visible={spinner} />
          <ConfirmModal
            isOpen={this.state.deleteModalOpen}
            header="Delete this property?"
            confirmText="Delete"
            onConfirm={() => {
              const { property } = this.state;
              this.setState({ deleteModalOpen: false, spinner: true }, () => {
                fetch(`/api/properties/${property.id}`, {
                  method: "DELETE",
                  headers: {
                    "X-CSRF-Token": document.querySelector(
                      'meta[name="csrf-token"]',
                    )?.content,
                  },
                }).then(() => {
                  window.location.href = "/properties";
                });
              });
            }}
            onClose={() => this.setState({ deleteModalOpen: false })}
          />
        </div>
      </div>
    );
  }
}
