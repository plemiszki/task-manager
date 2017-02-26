var React = require('react');
var ClientActions = require('../actions/client-actions.js');
var UserStore = require('../stores/user-store.js');

var CurrentUser = React.createClass({

  getInitialState: function() {
    return({
      user: null
    });
  },

  componentDidMount: function() {
    this.userListener = UserStore.addListener(this.getUser);
  },

  getUser: function() {
    this.setState({
      user: UserStore.user()
    });
  },

  render: function() {
    return(
      <div className="current-user">
        {this.state.user ? this.state.user.email : "(loading)"}
        <a className="btn btn-primary" rel="nofollow" data-method="delete" href="/sign_out">Log Out</a>
      </div>
    )
  }

});

module.exports = CurrentUser;
