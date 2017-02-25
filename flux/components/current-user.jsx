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
      <div>
        {this.state.user ? this.state.user.email : "(loading)"}
      </div>
    )
  }

});

module.exports = CurrentUser;
