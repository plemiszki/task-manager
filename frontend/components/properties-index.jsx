import React, { useState, useEffect } from "react";
import { GrayedOut, Spinner } from "handy-components";
import Modal from "react-modal";
import Moment from "moment";
import PropertyNew from "./property-new.jsx";

const PROPERTY_TYPE_LABELS = {
  townhouse: "Townhouse",
  condo: "Condo",
  "co-op": "Co-op",
  "single-family-house": "Single-Family House",
  "double-family-house": "Double-Family House",
  "multi-family-house": "Multi-Family House",
};

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

const fetchProperties = (setProperties, setSpinner) => {
  fetch(`/api/properties`)
    .then((data) => data.json())
    .then((response) => {
      setProperties(response.properties);
      setSpinner(false);
    });
};

export default function PropertiesIndex() {
  const [spinner, setSpinner] = useState(true);
  const [properties, setProperties] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    fetchProperties(setProperties, setSpinner);
  }, []);

  return (
    <div className="handy-component container widened-container index-component">
      <div className="row">
        <div className="col-xs-12">
          <div className="white-box">
            <table>
              <thead>
                <tr>
                  <th>Label</th>
                  <th>Neighborhood</th>
                  <th>Type</th>
                  <th>Zoned School</th>
                  <th>Monthly Payment</th>
                  <th>Amount Needed</th>
                  <th>Date Added</th>
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
                </tr>
                {properties.map((property) => {
                  const {
                    id,
                    label,
                    neighborhood,
                    amountNeeded,
                    monthlyPayment,
                    zonedPrimarySchool,
                    propertyType,
                    dateAdded,
                  } = property;
                  return (
                    <tr
                      key={id}
                      style={{ cursor: "pointer" }}
                      onClick={() =>
                        (window.location.href = `/properties/${id}`)
                      }
                    >
                      <td>{label}</td>
                      <td>{neighborhood}</td>
                      <td>{PROPERTY_TYPE_LABELS[propertyType]}</td>
                      <td>{zonedPrimarySchool}</td>
                      <td>{monthlyPayment != null ? `$${Number(monthlyPayment).toLocaleString()}` : ""}</td>
                      <td style={{ color: amountNeeded > 0 ? "red" : undefined }}>{amountNeeded == null ? "" : amountNeeded <= 0 ? "-" : `$${Number(amountNeeded).toLocaleString()}`}</td>
                      <td>{Moment(dateAdded).format("l")}</td>
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
