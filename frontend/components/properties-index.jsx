import React, { useState, useEffect } from "react";
import { GrayedOut, Spinner } from "handy-components";
import Modal from "react-modal";
import Moment from "moment";
import PropertyNew from "./property-new.jsx";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import DifferenceIcon from "@mui/icons-material/Difference";

const ModalStyles = {
  overlay: {
    background: "rgba(0, 0, 0, 0.50)",
  },
  content: {
    background: "#F5F6F7",
    padding: 0,
    margin: "auto",
    maxWidth: 700,
    height: 462,
  },
};

const fetchProperties = (
  setProperties,
  setMonthlyBudget,
  setAmountSaved,
  setSpinner,
) => {
  fetch(`/api/properties`)
    .then((data) => data.json())
    .then((response) => {
      setProperties(response.properties);
      setMonthlyBudget(response.monthlyBudget);
      setAmountSaved(response.amountSaved);
      setSpinner(false);
    });
};

const DEFAULT_SORT_DIR = {
  dateAdded: "desc",
};

export default function PropertiesIndex() {
  const [spinner, setSpinner] = useState(true);
  const [properties, setProperties] = useState([]);
  const [monthlyBudget, setMonthlyBudget] = useState(null);
  const [differenceMode, setDifferenceMode] = useState(
    () => localStorage.getItem("properties:differenceMode") === "true",
  );
  const [amountSaved, setAmountSaved] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [sortColumn, setSortColumn] = useState("dateAdded");
  const [sortDirection, setSortDirection] = useState("desc");

  useEffect(() => {
    fetchProperties(
      setProperties,
      setMonthlyBudget,
      setAmountSaved,
      setSpinner,
    );
  }, []);

  const handleSort = (column) => {
    if (column === sortColumn) {
      setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortColumn(column);
      setSortDirection(DEFAULT_SORT_DIR[column] || "asc");
    }
  };

  const sortedProperties = [...properties].sort((a, b) => {
    let aVal = a[sortColumn];
    let bVal = b[sortColumn];
    if (aVal == null && bVal == null) return 0;
    if (aVal == null) return 1;
    if (bVal == null) return -1;
    if (sortColumn === "dateAdded") {
      aVal = new Date(aVal);
      bVal = new Date(bVal);
    } else if (
      sortColumn === "monthlyPayment" ||
      sortColumn === "amountNeeded"
    ) {
      aVal = Number(aVal);
      bVal = Number(bVal);
    } else {
      aVal = String(aVal).toLowerCase();
      bVal = String(bVal).toLowerCase();
    }
    if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
    if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

  const thStyle = (column) => ({
    cursor: "pointer",
    userSelect: "none",
    color: sortColumn === column ? "#6f42c1" : undefined,
  });

  return (
    <div className="handy-component container widened-container index-component">
      <div className="row">
        <div className="col-xs-12">
          <div className="white-box">
            <table>
              <thead>
                <tr>
                  <th
                    style={thStyle("status")}
                    onClick={() => handleSort("status")}
                  ></th>
                  <th
                    style={thStyle("dateAdded")}
                    onClick={() => handleSort("dateAdded")}
                  >
                    Date Added
                  </th>
                  <th
                    style={thStyle("label")}
                    onClick={() => handleSort("label")}
                  >
                    Label
                  </th>
                  <th
                    style={thStyle("neighborhood")}
                    onClick={() => handleSort("neighborhood")}
                  >
                    Neighborhood
                  </th>
                  <th
                    style={thStyle("propertyType")}
                    onClick={() => handleSort("propertyType")}
                  >
                    Type
                  </th>
                  <th
                    style={thStyle("zonedPrimarySchool")}
                    onClick={() => handleSort("zonedPrimarySchool")}
                  >
                    Zoned School
                  </th>
                  <th
                    style={thStyle("monthlyPayment")}
                    onClick={() => handleSort("monthlyPayment")}
                  >
                    Monthly Payment
                  </th>
                  <th
                    style={thStyle("cashToClose")}
                    onClick={() => handleSort("cashToClose")}
                  >
                    Cash to Close
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="below-header">
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                </tr>
                {sortedProperties.map((property) => {
                  const {
                    id,
                    label,
                    neighborhood,
                    cashToClose,
                    monthlyPayment,
                    monthlyRemainder,
                    closeRemainder,
                    zonedPrimarySchool,
                    propertyType,
                    dateAdded,
                    status,
                  } = property;
                  const displayMonthly = differenceMode
                    ? monthlyRemainder
                    : monthlyPayment;
                  const displayClose = differenceMode
                    ? closeRemainder
                    : cashToClose;
                  return (
                    <tr
                      key={id}
                      style={{ cursor: "pointer" }}
                      onClick={() => window.open(`/properties/${id}`, "_blank")}
                    >
                      <td style={{ verticalAlign: "middle" }}>
                        <div style={{ display: "flex", alignItems: "center" }}>
                          {status === "available" ? (
                            <CheckCircleIcon
                              style={{ fontSize: 16, color: "green" }}
                            />
                          ) : (
                            <CancelIcon
                              style={{ fontSize: 16, color: "red" }}
                            />
                          )}
                        </div>
                      </td>
                      <td>{Moment(dateAdded).format("l")}</td>
                      <td>{label}</td>
                      <td>{neighborhood}</td>
                      <td>{propertyType}</td>
                      <td
                        style={{
                          color:
                            zonedPrimarySchool === 130
                              ? "red"
                              : [10, 39, 154].indexOf(zonedPrimarySchool) >= 0
                                ? "green"
                                : undefined,
                        }}
                      >
                        {zonedPrimarySchool}
                      </td>
                      <td
                        style={{
                          color: differenceMode
                            ? displayMonthly > 0
                              ? "green"
                              : "red"
                            : monthlyPayment != null &&
                                monthlyBudget != null &&
                                monthlyPayment > monthlyBudget
                              ? "red"
                              : undefined,
                        }}
                      >
                        {displayMonthly != null
                          ? `${differenceMode ? (displayMonthly >= 0 ? "+" : "-") : ""}$${Number(Math.abs(displayMonthly)).toLocaleString()}`
                          : ""}
                      </td>
                      <td
                        style={{
                          color: differenceMode
                            ? displayClose > 0
                              ? "green"
                              : "red"
                            : cashToClose != null &&
                                amountSaved != null &&
                                cashToClose > amountSaved
                              ? "red"
                              : undefined,
                        }}
                      >
                        {displayClose != null
                          ? `${differenceMode ? (displayClose >= 0 ? "+" : "-") : ""}$${Number(Math.abs(displayClose)).toLocaleString()}`
                          : ""}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div
              className="btn"
              style={{
                backgroundColor: "#6f42c1",
                color: "white",
              }}
              onClick={() => setModalOpen(true)}
            >
              Add New
            </div>
            <DifferenceIcon
              onClick={() =>
                setDifferenceMode((prev) => {
                  localStorage.setItem(
                    "properties:differenceMode",
                    String(!prev),
                  );
                  return !prev;
                })
              }
              style={{
                position: "absolute",
                bottom: 26,
                right: 26,
                cursor: "pointer",
                fontSize: 28,
                color: differenceMode ? "#6f42c1" : "black",
              }}
            />
            <GrayedOut visible={spinner} />
            <Spinner visible={spinner} />
          </div>
        </div>
      </div>
      <Modal
        isOpen={modalOpen}
        onRequestClose={() => setModalOpen(false)}
        contentLabel="Modal"
        style={ModalStyles}
      >
        <PropertyNew
          afterCreate={() => {
            setModalOpen(false);
            setSpinner(true);
            fetchProperties(setProperties, setSpinner);
          }}
        />
      </Modal>
    </div>
  );
}
