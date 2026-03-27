import React from "react";
import Modal from "react-modal";
import GroceryList from "./grocery-list";
import { sendRequest, Common } from "handy-components";
import UpdateIcon from "@mui/icons-material/Update";
import LogoutIcon from "@mui/icons-material/Logout";
import SettingsIcon from "@mui/icons-material/Settings";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import RamenDiningIcon from "@mui/icons-material/RamenDining";
import HomeIcon from "@mui/icons-material/Home";
import RocketLaunchIcon from "@mui/icons-material/RocketLaunch";
import PrecisionManufacturingIcon from "@mui/icons-material/PrecisionManufacturing";
import LocalGroceryStoreIcon from "@mui/icons-material/LocalGroceryStore";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ConfirmModal from "./confirm-modal.jsx";
import NavIconButton from "./nav-icon-button.jsx";

const modalStyles = {
  overlay: {
    background: "rgba(0, 0, 0, 0.50)",
    zIndex: 3,
  },
  content: {
    background: "white",
    margin: "auto",
    width: 700,
    maxWidth: "90%",
    height: 535.5,
    border: "solid 1px black",
    borderRadius: "6px",
    color: "black",
    lineHeight: "30px",
  },
};

export default class TopBar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      user: null,
      resetEarly: false,
      groceryListModalOpen: false,
      confirmResetModalOpen: false,
      job: {
        firstLine: "",
      },
      jobModalOpen: false,
    };
  }

  componentDidMount() {
    sendRequest("/api/user").then((response) => {
      const { user, resetEarly } = response;
      this.setState({ user, resetEarly });
    });
  }

  componentDidUpdate() {
    Common.updateJobModal.call(this, {
      successCallback: () => {
        window.location.reload();
      },
    });
  }

  clickResetTasksEarly() {
    sendRequest("/api/reset_tasks_early", {
      method: "post",
    }).then((response) => {
      const { job } = response;
      this.setState({
        jobModalOpen: true,
        job,
      });
    });
  }

  render() {
    const {
      user,
      groceryListModalOpen,
      resetEarly,
      confirmResetModalOpen,
      job,
    } = this.state;
    const pageTitles = {
      "/": "Tasks",
      "/schedule": "Schedule",
      "/future_tasks": "Future Tasks",
      "/recurring_tasks": "Recurring Tasks",
      "/recipes": "Recipes",
      "/settings": "Settings",
    };
    const { pathname } = window.location;
    let pageTitle = pageTitles[pathname] || "";
    let backPath = null;
    if (!pageTitle) {
      if (/^\/recurring_tasks\/\d+/.test(pathname)) {
        pageTitle = "Edit Recurring Task";
        backPath = "/recurring_tasks";
      } else if (/^\/future_tasks\/\d+/.test(pathname)) {
        pageTitle = "Edit Future Task";
        backPath = "/future_tasks";
      } else if (/^\/recipes\/\d+/.test(pathname)) {
        pageTitle = "Edit Recipe";
        backPath = "/recipes";
      }
    }
    return (
      <>
        <div className="container widened-container">
          <div className="row">
            <div className="col-xs-12">
              <div className="current-user group">
                <div
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    gap: 10,
                    alignItems: "center",
                    justifyContent: "flex-end",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginRight: "auto" }}>
                    {backPath && (
                      <a href={backPath} style={{ display: "inline-flex" }}>
                        <ArrowBackIcon style={{ fontSize: 22, color: "#2c2f33" }} />
                      </a>
                    )}
                    <span
                      style={{
                        fontFamily: "Helvetica Neue",
                        fontSize: 22,
                        color: "#2c2f33",
                        letterSpacing: "1.08px",
                        fontWeight: 500,
                      }}
                    >
                      {pageTitle}
                    </span>
                  </div>
                  <NavIconButton href="/" icon={HomeIcon} activePath="/" />
                  <NavIconButton
                    href="/schedule"
                    icon={CalendarMonthIcon}
                    activePath="/schedule"
                  />
                  <NavIconButton
                    href="/future_tasks"
                    icon={RocketLaunchIcon}
                    activePath="/future_tasks"
                  />
                  <NavIconButton
                    href="/recurring_tasks"
                    icon={PrecisionManufacturingIcon}
                    activePath="/recurring_tasks"
                  />
                  <NavIconButton
                    href="/recipes"
                    icon={RamenDiningIcon}
                    activePath="/recipes"
                  />
                  <span
                    style={{ display: "inline-flex", cursor: "pointer" }}
                    onClick={() =>
                      this.setState({ groceryListModalOpen: true })
                    }
                  >
                    <LocalGroceryStoreIcon
                      style={{ fontSize: 30, color: "#333" }}
                    />
                  </span>
                  <NavIconButton
                    href="/settings"
                    icon={SettingsIcon}
                    activePath="/settings"
                  />
                  <UpdateIcon
                    fontSize="large"
                    style={{
                      fontSize: 30,
                      cursor: resetEarly ? "default" : "pointer",
                      color: resetEarly ? "#ccc" : undefined,
                    }}
                    onClick={resetEarly ? undefined : () => this.setState({ confirmResetModalOpen: true })}
                  />
                  <NavIconButton
                    href="/sign_out"
                    icon={LogoutIcon}
                    dataMethod="delete"
                  />
                </div>
              </div>
            </div>
          </div>
          <Modal
            isOpen={groceryListModalOpen}
            onRequestClose={Common.closeModals.bind(this)}
            contentLabel="Modal"
            style={modalStyles}
          >
            <GroceryList />
          </Modal>
          <ConfirmModal
            isOpen={confirmResetModalOpen}
            header="Run the nightly reset now?"
            confirmText="DO IT"
            onConfirm={() => {
              this.clickResetTasksEarly();
              this.setState({ confirmResetModalOpen: false });
            }}
            onClose={Common.closeModals.bind(this)}
          />
          {Common.renderJobModal.call(this, job)}
        </div>
      </>
    );
  }
}
