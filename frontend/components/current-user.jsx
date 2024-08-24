import React from "react";
import Modal from "react-modal";
import GroceryList from "./grocery-list";
import { sendRequest, Common } from "handy-components";
import UpdateIcon from "@mui/icons-material/Update";

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

export default class CurrentUser extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      user: null,
      congress: {
        senate: {},
        house: {},
      },
      groceryListModalOpen: false,
    };
  }

  componentDidMount() {
    sendRequest("/api/user").then((response) => {
      const { user } = response;
      this.setState({ user });
    });
  }

  render() {
    const { user, groceryListModalOpen } = this.state;
    return (
      <>
        <div className="container widened-container">
          <div className="row">
            <div className="col-xs-12">
              <div className="current-user group">
                <a
                  className="btn btn-primary"
                  rel="nofollow"
                  data-method="delete"
                  href="/sign_out"
                >
                  Log Out
                </a>
                <UpdateIcon
                  fontSize="large"
                  style={{
                    float: "right",
                    marginTop: 2,
                    marginRight: 10,
                    fontSize: 30,
                    cursor: "pointer",
                  }}
                />
                <a
                  className="btn btn-info settings-button"
                  rel="nofollow"
                  href="/settings"
                >
                  Settings
                </a>
                <a
                  className="btn btn-info recipe-button"
                  rel="nofollow"
                  href="/recipes"
                >
                  Recipes
                </a>
                <a
                  className="btn btn-success"
                  rel="nofollow"
                  href="/recurring_tasks"
                >
                  Recurring Tasks
                </a>
                <a className="btn btn-info" rel="nofollow" href="/future_tasks">
                  Future Tasks
                </a>
                <a className="btn btn-primary" rel="nofollow" href="/">
                  Home
                </a>
                <div className="email">{user ? user.email : "(loading)"}</div>
                <div className="widget grocery-list">
                  <img
                    src={Images.groceries}
                    onClick={() =>
                      this.setState({ groceryListModalOpen: true })
                    }
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
        </div>
        <style jsx>{`
          .widget.grocery-list {
            display: inline-block;
          }
          .widget.grocery-list img {
            display: block;
            height: 58px;
            cursor: pointer;
          }
        `}</style>
      </>
    );
  }
}
