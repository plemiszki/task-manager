var React = require('react');
var ClientActions = require('../actions/client-actions.js');
var UserStore = require('../stores/user-store.js');
var CongressStore = require('../stores/congress-store.js');

var CurrentUser = React.createClass({

  getInitialState: function() {
    return({
      user: null,
      congressObj: {
        senate: { repubs: "...", dems: "..." },
        house: { repubs: "...", dems: "..." }
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
        <div className="email">
          { this.state.user ? this.state.user.email : "(loading)" }
        </div>
        <a className="btn btn-primary" rel="nofollow" data-method="delete" href="/sign_out">Log Out</a>
        <div className="widget congress">
          <img src={ Images.democrat } />
          <div><p>{ this.state.congressObj.senate.dems } - Senate - { this.state.congressObj.senate.repubs }</p><p>{ this.state.congressObj.house.dems } - House - { this.state.congressObj.house.repubs }</p></div>
          <img src={ Images.republican } />
        </div>
      </div>
    )
  }
});

module.exports = CurrentUser;
