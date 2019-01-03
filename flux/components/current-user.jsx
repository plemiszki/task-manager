import React from 'react';
import ClientActions from '../actions/client-actions.js';
import UserStore from '../stores/user-store.js';
import CongressStore from '../stores/congress-store.js';

export default class CurrentUser extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      user: null,
      congressObj: {
        senate: {},
        house: {}
      }
    }
  }

  componentDidMount() {
    this.userListener = UserStore.addListener(this.getUser.bind(this));
    this.congressListener = CongressStore.addListener(this.getCongress.bind(this));
    ClientActions.fetchUser();
  }

  getUser() {
    this.setState({
      user: UserStore.user()
    });
  }

  getCongress() {
    this.setState({
      congressObj: CongressStore.obj()
    });
  }

  houseClass(chamber) {
    if (this.state.congressObj[chamber].dems == this.state.congressObj[chamber].repubs) {
      return '';
    } else if (this.state.congressObj[chamber].dems > this.state.congressObj[chamber].repubs) {
      return 'd-majority';
    } else {
      return 'r-majority';
    }
  }

  render() {
    return(
      <div className="container widened-container">
        <div className="row">
          <div className="col-xs-12">
            <div className="current-user group">
              <a className="btn btn-primary" rel="nofollow" data-method="delete" href="/sign_out">Log Out</a>
              <a className="btn btn-success" rel="nofollow" href="/recurring_tasks">Recurring Tasks</a>
              <a className="btn btn-info" rel="nofollow" href="/future_tasks">Future Tasks</a>
              <a className="btn btn-primary" rel="nofollow" href="/">Home</a>
              <div className="email">
                { this.state.user ? this.state.user.email : "(loading)" }
              </div>
              <div className="widget congress">
                <img src={ Images.democrat } />
                <div>
                  <p className={ this.houseClass('senate') }>{ this.state.congressObj.senate.dems } - Senate - { this.state.congressObj.senate.repubs }</p>
                  <p className="elections">{ this.state.congressObj.senate.dems_up } - 2018 Elections - { this.state.congressObj.senate.repubs_up }</p>
                  <hr />
                  <p className={ this.houseClass('house') }>{ this.state.congressObj.house.dems } - House - { this.state.congressObj.house.repubs }</p>
                </div>
                <img src={ Images.republican } />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
