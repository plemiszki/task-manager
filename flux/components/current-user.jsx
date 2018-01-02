var React = require('react');
var ClientActions = require('../actions/client-actions.js');
var UserStore = require('../stores/user-store.js');
var CongressStore = require('../stores/congress-store.js');

var CurrentUser = React.createClass({

  getInitialState: function() {
    return({
      user: null,
      congressObj: {
        senate: {},
        house: {}
      }
    });
  },

  componentDidMount: function() {
    this.userListener = UserStore.addListener(this.getUser);
    this.congressListener = CongressStore.addListener(this.getCongress);
  },

  getUser: function() {
    this.setState({
      user: UserStore.user()
    });
  },

  getCongress: function() {
    this.setState({
      congressObj: CongressStore.obj()
    });
  },

  render: function() {
    return(
      <div className="current-user">
        <a className="btn btn-primary" rel="nofollow" data-method="delete" href="/sign_out">Log Out</a>
        <a className="btn btn-info" rel="nofollow" href="/future_tasks">Future Tasks</a>
        <div className="email">
          { this.state.user ? this.state.user.email : "(loading)" }
        </div>
        <div className="widget congress">
          <img src={ Images.democrat } />
          <div>
            <p>{ this.state.congressObj.senate.dems } - Senate - { this.state.congressObj.senate.repubs }</p>
            <p className="elections">{ this.state.congressObj.senate.dems_up } - 2018 Elections - { this.state.congressObj.senate.repubs_up }</p>
            <hr />
            <p>{ this.state.congressObj.house.dems } - House - { this.state.congressObj.house.repubs }</p>
          </div>
          <img src={ Images.republican } />
        </div>
      </div>
    )
  }
});

module.exports = CurrentUser;
