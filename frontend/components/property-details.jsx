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

const HTML_MODAL_STYLES = {
  overlay: {
    background: "rgba(0, 0, 0, 0.50)",
    zIndex: 3,
  },
  content: {
    background: "#F5F6F7",
    padding: 0,
    margin: "auto",
    maxWidth: 700,
    height: "fit-content",
  },
};

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

const PROPERTY_TYPE_LABELS = {
  townhouse: "Townhouse",
  condo: "Condo",
  "co-op": "Co-op",
  "single-family-house": "Single-Family House",
  "double-family-house": "Double-Family House",
  "multi-family-house": "Multi-Family House",
};

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
      htmlModalOpen: false,
      htmlForm: { html: "" },
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

  confirmDelete() {
    const { property } = this.state;
    this.setState({ deleteModalOpen: false, spinner: true }, () => {
      fetch(`/api/properties/${property.id}`, {
        method: "DELETE",
        headers: {
          "X-CSRF-Token": document.querySelector('meta[name="csrf-token"]')
            ?.content,
        },
      }).then(() => {
        window.location.href = "/properties";
      });
    });
  }

  clickSave() {
    this.setState({ spinner: true, justSaved: true }, () => {
      const property = {
        ...this.state.property,
        price: this.state.property.price.toString().replace(/[$,]/g, ""),
        taxes: this.state.property.taxes.toString().replace(/[$,]/g, ""),
        hoaFees: this.state.property.hoaFees.toString().replace(/[$,]/g, ""),
        area: this.state.property.area.toString().replace(/,/g, ""),
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
                  flex: 1,
                  minHeight: 450,
                  backgroundImage: `url(${this.state.property.imageUrl})`,
                  backgroundSize: "cover",
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "center",
                }}
              />
            )}
            <div
              style={{
                flex: 1,
                minWidth: 0,
                fontFamily: "Helvetica Neue",
                fontSize: 14,
              }}
            >
              {[
                ["Street Address", this.state.property.streetAddress],
                ["Apt #", this.state.property.aptNumber],
                [
                  "Type",
                  PROPERTY_TYPE_LABELS[this.state.property.propertyType],
                ],
                ["Neighborhood", this.state.property.neighborhood],
                ["Area", this.state.property.area],
                ["Bedrooms", this.state.property.bedrooms],
                ["Full Baths", this.state.property.fullBathrooms],
                ["Half Baths", this.state.property.halfBathrooms],
                ["Price", this.state.property.price],
                ["Taxes", this.state.property.taxes],
                ["Insurance", this.state.property.insurance],
                ["HOA Fees", this.state.property.hoaFees],
              ].map(([label, value]) =>
                value ? (
                  <div key={label} style={{ marginBottom: 6 }}>
                    <strong>{label}:</strong> {value}
                  </div>
                ) : null,
              )}
              {this.state.property.dateAdded && (
                <div style={{ marginBottom: 6 }}>
                  <strong>Date Added:</strong> {this.state.property.dateAdded}
                </div>
              )}
              {this.state.property.url && (
                <div style={{ marginBottom: 6 }}>
                  <a href={this.state.property.url} target="_blank" rel="noreferrer" style={{ textDecoration: "underline" }}>
                    Visit Link
                  </a>
                </div>
              )}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="row">
                {Details.renderDropDown.bind(this)({
                  columnWidth: 6,
                  entity: "property",
                  property: "status",
                  type: "dropdown",
                  options: STATUSES,
                  optionDisplayProperty: "text",
                })}
                {Details.renderField.bind(this)({
                  columnWidth: 3,
                  entity: "property",
                  property: "schoolZone",
                  columnHeader: "Zone",
                })}
                {Details.renderField.bind(this)({
                  columnWidth: 3,
                  entity: "property",
                  property: "schoolDistrict",
                  columnHeader: "District",
                })}
              </div>
              <div className="row">
                {Details.renderField.bind(this)({
                  columnWidth: 12,
                  entity: "property",
                  property: "notes",
                  columnHeader: "Notes",
                  type: "textbox",
                  rows: 4,
                })}
              </div>
            </div>
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
              this.setState({
                htmlModalOpen: true,
                htmlForm: { html: property.html || "" },
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
                          : key === "area"
                            ? String(v ?? "").replace(/,/g, "")
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
                  : key === "area"
                    ? String(v ?? "").replace(/,/g, "")
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
          <Modal
            isOpen={this.state.htmlModalOpen}
            onRequestClose={() => this.setState({ htmlModalOpen: false })}
            contentLabel="Re-extract Property"
            style={HTML_MODAL_STYLES}
          >
            <div className="handy-component admin-modal">
              <div className="white-box" style={{ position: "relative" }}>
                <div className="row">
                  {Details.renderField.bind(this)({
                    columnWidth: 12,
                    entity: "htmlForm",
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
                      onClick={() => {
                        const { property, htmlForm } = this.state;
                        this.setState(
                          { htmlModalOpen: false, spinner: true },
                          () => {
                            fetch(`/api/properties/${property.id}/reextract`, {
                              method: "POST",
                              headers: {
                                "Content-Type": "application/json",
                                "X-CSRF-Token": document.querySelector(
                                  'meta[name="csrf-token"]',
                                )?.content,
                              },
                              body: JSON.stringify({ html: htmlForm.html }),
                            })
                              .then((r) => r.json())
                              .then((response) => {
                                this.setState({
                                  spinner: false,
                                  refreshedData: response.property,
                                  refreshModalOpen: true,
                                });
                              });
                          },
                        );
                      }}
                    >
                      Update
                    </div>
                  </div>
                </div>
              </div>
            </div>
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
            onConfirm={() => this.confirmDelete()}
            onClose={() => this.setState({ deleteModalOpen: false })}
          />
        </div>
      </div>
    );
  }
}
