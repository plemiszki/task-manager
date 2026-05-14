import React from "react";
import Modal from "react-modal";
import RefreshIcon from "@mui/icons-material/Refresh";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import CloseIcon from "@mui/icons-material/Close";
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

const MODAL_OVERLAY = { background: "rgba(0, 0, 0, 0.50)", zIndex: 3 };

const HTML_MODAL_STYLES = {
  overlay: MODAL_OVERLAY,
  content: {
    background: "#F5F6F7",
    padding: 0,
    margin: "auto",
    maxWidth: 700,
    height: "fit-content",
  },
};

const REFRESH_MODAL_STYLES = {
  overlay: MODAL_OVERLAY,
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

const EDIT_MODAL_STYLES = {
  overlay: MODAL_OVERLAY,
  content: {
    background: "white",
    margin: "auto",
    width: 300,
    height: "fit-content",
    border: "solid 1px #ddd",
    borderRadius: "8px",
    padding: "20px 24px",
    color: "black",
  },
};

const CONFIG_FIELD_LABELS = {
  monthlyPayment: "Monthly Budget",
  interestRate: "Interest Rate",
  amountSaved: "Amount Saved",
  ourOffer: "Our Offer",
  closingCosts: "Closing Costs",
};

const CURRENCY_FIELDS = ["price", "taxes", "hoaFees"];

function normalizeFieldValue(key, v) {
  if (CURRENCY_FIELDS.includes(key))
    return String(parseFloat(String(v ?? "").replace(/[$,]/g, "")) || 0);
  if (key === "area") return String(v ?? "").replace(/,/g, "");
  return String(v ?? "");
}

function cardStyle(background, marginBottom = 8) {
  return {
    border: "1px solid #ddd",
    borderRadius: 8,
    padding: "12px 16px",
    boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
    display: "flex",
    flexDirection: "column",
    gap: 6,
    ...(marginBottom != null && { marginBottom }),
    ...(background != null && { background }),
  };
}

function HoverableField({
  fieldKey,
  hoveredField,
  onHover,
  onEdit,
  onClear,
  iconSize = 14,
  style,
  children,
}) {
  return (
    <div
      style={{ display: "flex", alignItems: "center", gap: 6, ...style }}
      onMouseEnter={() => onHover(fieldKey)}
      onMouseLeave={() => onHover(null)}
    >
      {children}
      {hoveredField === fieldKey && (
        <>
          <EditIcon
            style={{ fontSize: iconSize, cursor: "pointer", color: "#555" }}
            onClick={onEdit}
          />
          {onClear && (
            <CloseIcon
              style={{ fontSize: iconSize, cursor: "pointer", color: "#555" }}
              onClick={onClear}
            />
          )}
        </>
      )}
    </div>
  );
}

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
      hoveredField: null,
      editModalOpen: false,
      editField: null,
      editValue: "",
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
        price: this.state.property.price,
        taxes: this.state.property.taxes,
        hoaFees: this.state.property.hoaFees,
        area: this.state.property.area.toString().replace(/,/g, ""),
      };
      updateEntity({
        entityName: "property",
        entity: property,
      }).then(
        (response) => this.handleSaveSuccess(response),
        (response) => {
          this.setState({ spinner: false, errors: response.errors });
        },
      );
    });
  }

  openEditModal(fieldKey) {
    const { property } = this.state;
    const editValue =
      fieldKey === "interestRate"
        ? (property.interestRate * 100).toFixed(2)
        : String(property[fieldKey] ?? "");
    this.setState({ editModalOpen: true, editField: fieldKey, editValue });
  }

  clearPropertyField(field) {
    const { property } = this.state;
    fetch("/api/property_config", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-Token": document.querySelector('meta[name="csrf-token"]')
          ?.content,
      },
      body: JSON.stringify({ field, property_id: property.id }),
    }).then(() => {
      fetchEntity().then((response) => {
        this.setState({
          property: response.property,
          propertySaved: deepCopy(response.property),
        });
      });
    });
  }

  submitConfigEdit() {
    const { editField, editValue, property } = this.state;
    const value =
      editField === "interestRate"
        ? parseFloat(editValue) / 100
        : parseFloat(editValue);
    const body = { field: editField, value };
    if (editField === "ourOffer" || editField === "closingCosts")
      body.property_id = property.id;
    fetch("/api/property_config", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-Token": document.querySelector('meta[name="csrf-token"]')
          ?.content,
      },
      body: JSON.stringify(body),
    }).then(() => {
      this.setState({ editModalOpen: false }, () => {
        fetchEntity().then((response) => {
          const { property } = response;
          this.setState({ property, propertySaved: deepCopy(property) });
        });
      });
    });
  }

  handleSaveSuccess(response) {
    this.setState({
      spinner: false,
      property: response.property,
      propertySaved: deepCopy(response.property),
      changesToSave: false,
    });
  }

  render() {
    const { spinner, justSaved, changesToSave, property, hoveredField } =
      this.state;
    const {
      adjustedMonthlyPayment,
      maxLoan,
      amountNeeded,
      canAfford,
      actualLoan,
      actualMonthlyPayment,
      amountSaved,
      monthlyPayment,
      interestRate,
      ourOffer,
      ourOfferSet,
      closingCostsSet,
      totalCarryingCosts,
      piBudget,
      piPayment,
      canAffordPi,
      piRemainder,
      downPayment,
      closingCosts,
      cashToClose,
      canAffordClose,
      remainder,
      amountNeededForClose,
    } = property;
    const setHovered = (field) => this.setState({ hoveredField: field });
    return (
      <div className="handy-component">
        <div className="white-box">
          <div style={{ display: "flex", gap: 20, marginBottom: 20 }}>
            <div
              style={{
                flex: 0.85,
                minHeight: 450,
                ...(property.imageUrl
                  ? {
                      backgroundImage: `url(${property.imageUrl})`,
                      backgroundSize: "cover",
                      backgroundRepeat: "no-repeat",
                      backgroundPosition: "center",
                    }
                  : {
                      background: "#e0e0e0",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#888",
                      fontSize: 16,
                      fontFamily: "Helvetica Neue",
                    }),
              }}
            >
              {!property.imageUrl && "Image Missing"}
            </div>
            <div
              style={{
                flex: 0.85,
                minWidth: 0,
                fontFamily: "Helvetica Neue",
                fontSize: 14,
              }}
            >
              <div style={cardStyle("#fffde7")}>
                <HoverableField
                  fieldKey="monthlyPayment"
                  hoveredField={hoveredField}
                  onHover={setHovered}
                  onEdit={() => this.openEditModal("monthlyPayment")}
                >
                  <strong>Monthly Budget:</strong> $
                  {monthlyPayment?.toLocaleString()}
                </HoverableField>
                <HoverableField
                  fieldKey="interestRate"
                  hoveredField={hoveredField}
                  onHover={setHovered}
                  onEdit={() => this.openEditModal("interestRate")}
                >
                  <strong>Interest Rate:</strong>{" "}
                  {interestRate ? (interestRate * 100).toFixed(2) : ""}%
                </HoverableField>
              </div>
              <div style={cardStyle("white")}>
                {(!!property.taxes || !!property.hoaFees) && (
                  <div>
                    <strong>Total Carrying Costs:</strong> $
                    {totalCarryingCosts?.toLocaleString()}
                  </div>
                )}
                {!!property.taxes && (
                  <div style={{ paddingLeft: 12, fontSize: 12 }}>
                    <strong>Taxes:</strong> {property.taxesFormatted}
                  </div>
                )}
                {!!property.hoaFees && (
                  <div style={{ paddingLeft: 12, fontSize: 12 }}>
                    <strong>HOA Fees:</strong> {property.hoaFeesFormatted}
                  </div>
                )}
                {(!!property.taxes || !!property.hoaFees) &&
                  !!monthlyPayment && (
                    <div>
                      <strong>P&amp;I Budget:</strong> $
                      {piBudget?.toLocaleString()}
                    </div>
                  )}
                {piPayment != null && (
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 2 }}
                  >
                    <strong>P&amp;I:</strong>&nbsp;${piPayment.toLocaleString()}
                    {canAffordPi ? (
                      <CheckCircleIcon
                        style={{ fontSize: 16, color: "green", marginLeft: 2 }}
                      />
                    ) : (
                      <CancelIcon
                        style={{ fontSize: 16, color: "red", marginLeft: 2 }}
                      />
                    )}
                  </div>
                )}
                {!!piRemainder && (
                  <div style={{ color: "green" }}>
                    <strong>Remainder:</strong> ${piRemainder.toLocaleString()}
                  </div>
                )}
              </div>
              <div style={cardStyle("#e8f4fd")}>
                <div>
                  <strong>Listed Price:</strong> {property.priceFormatted}
                </div>
                <HoverableField
                  fieldKey="ourOffer"
                  hoveredField={hoveredField}
                  onHover={setHovered}
                  onEdit={() => this.openEditModal("ourOffer")}
                  onClear={
                    ourOfferSet
                      ? () => this.clearPropertyField("ourOffer")
                      : undefined
                  }
                >
                  <strong>Our Offer:</strong> ${ourOffer?.toLocaleString()}
                </HoverableField>
                {cashToClose != null && (
                  <div>
                    <strong>Cash to Close:</strong> $
                    {cashToClose.toLocaleString()}
                  </div>
                )}
                {downPayment != null && (
                  <div style={{ paddingLeft: 12, fontSize: 12 }}>
                    <strong>Down Payment:</strong> $
                    {downPayment.toLocaleString()}
                  </div>
                )}
                {closingCosts != null && (
                  <HoverableField
                    fieldKey="closingCosts"
                    hoveredField={hoveredField}
                    onHover={setHovered}
                    onEdit={() => this.openEditModal("closingCosts")}
                    onClear={
                      closingCostsSet
                        ? () => this.clearPropertyField("closingCosts")
                        : undefined
                    }
                    iconSize={11}
                    style={{ paddingLeft: 12, fontSize: 12 }}
                  >
                    <strong>Closing Costs:</strong> $
                    {closingCosts.toLocaleString()}
                  </HoverableField>
                )}
                <HoverableField
                  fieldKey="amountSaved"
                  hoveredField={hoveredField}
                  onHover={setHovered}
                  onEdit={() => this.openEditModal("amountSaved")}
                >
                  <strong>Amount Saved:</strong> $
                  {amountSaved?.toLocaleString()}
                  {canAffordClose && (
                    <CheckCircleIcon
                      style={{ fontSize: 16, color: "green", marginLeft: 2 }}
                    />
                  )}
                  {!canAffordClose && amountSaved != null && (
                    <CancelIcon
                      style={{ fontSize: 16, color: "red", marginLeft: 2 }}
                    />
                  )}
                </HoverableField>
                {canAffordClose && remainder != null && (
                  <div style={{ color: "green" }}>
                    <strong>Remainder:</strong> ${remainder.toLocaleString()}
                  </div>
                )}
                {!!amountNeededForClose && (
                  <div style={{ color: "red" }}>
                    <strong>Amount Needed:</strong> $
                    {amountNeededForClose.toLocaleString()}
                  </div>
                )}
              </div>
              <div style={cardStyle(undefined, null)}>
                {[
                  ["Street Address", property.streetAddress],
                  ["Apt #", property.aptNumber],
                  ["Type", PROPERTY_TYPE_LABELS[property.propertyType]],
                  ["Neighborhood", property.neighborhood],
                  ["Area", property.area],
                  ["Bedrooms", property.bedrooms],
                  ["Full Baths", property.fullBathrooms],
                  ["Half Baths", property.halfBathrooms],
                  ["Insurance", property.insurance],
                ].map(([label, value]) =>
                  value ? (
                    <div key={label}>
                      <strong>{label}:</strong> {value}
                    </div>
                  ) : null,
                )}
                {property.dateAdded && (
                  <div>
                    <strong>Date Added:</strong> {property.dateAdded}
                  </div>
                )}
                {property.url && (
                  <div>
                    <a
                      href={property.url}
                      target="_blank"
                      rel="noreferrer"
                      style={{ textDecoration: "underline" }}
                    >
                      Visit Link
                    </a>
                  </div>
                )}
              </div>
            </div>
            <div style={{ flex: 1.3, minWidth: 0 }}>
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
                  property: "schoolDistrict",
                  columnHeader: "District",
                })}
                {Details.renderField.bind(this)({
                  columnWidth: 3,
                  entity: "property",
                  property: "zonedPrimarySchool",
                  columnHeader: "Zoned School",
                })}
              </div>
              <div className="row">
                {Details.renderField.bind(this)({
                  columnWidth: 12,
                  entity: "property",
                  property: "notes",
                  columnHeader: "Notes",
                  type: "textbox",
                  rows: 18,
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
                      "zonedPrimarySchool",
                    ];
                    const LABEL_OVERRIDES = { hoaFees: "HOA Fees" };
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
                      const changed =
                        propertySaved[key] != null &&
                        normalizeFieldValue(key, propertySaved[key]) !==
                          normalizeFieldValue(key, value);
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
              const hasChanges =
                refreshedData &&
                Object.entries(refreshedData).some(
                  ([key, value]) =>
                    normalizeFieldValue(key, propertySaved[key]) !==
                    normalizeFieldValue(key, value),
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
                            normalizeFieldValue(key, propertySaved[key]) !==
                            normalizeFieldValue(key, value),
                        ),
                      );
                      this.setState(
                        { refreshModalOpen: false, spinner: true },
                        () => {
                          updateEntity({
                            entityName: "property",
                            entity: { ...changedFields },
                          }).then(
                            (response) => this.handleSaveSuccess(response),
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
          <Modal
            isOpen={this.state.editModalOpen}
            onRequestClose={() => this.setState({ editModalOpen: false })}
            style={EDIT_MODAL_STYLES}
          >
            <div style={{ fontFamily: "Helvetica Neue", fontSize: 14 }}>
              <div style={{ fontWeight: 600, marginBottom: 12 }}>
                Edit {CONFIG_FIELD_LABELS[this.state.editField]}
              </div>
              <input
                type="number"
                value={this.state.editValue}
                onChange={(e) => this.setState({ editValue: e.target.value })}
                onKeyDown={(e) => e.key === "Enter" && this.submitConfigEdit()}
                autoFocus
                style={{
                  width: "100%",
                  padding: "6px 8px",
                  fontSize: 14,
                  border: "1px solid #ccc",
                  borderRadius: 4,
                  boxSizing: "border-box",
                  marginBottom: 12,
                }}
              />
              <div style={{ textAlign: "right" }}>
                <a
                  className="btn"
                  style={{ background: "#333", color: "white" }}
                  onClick={() => this.submitConfigEdit()}
                >
                  Update
                </a>
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
