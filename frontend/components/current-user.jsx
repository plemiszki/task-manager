import React from 'react'
import { sendRequest } from 'handy-components';

export default class CurrentUser extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      user: null,
      congress: {
        senate: {},
        house: {}
      }
    }
  }

  componentDidMount() {
    sendRequest('/api/user').then(response => {
      const { user } = response;
      this.setState({ user });
    });
    sendRequest('/api/congress').then(response => {
      const { congress } = response;
      this.setState({ congress });
    });
  }

  houseClass(chamber) {
    if (this.state.congress[chamber].dems == this.state.congress[chamber].repubs) {
      return '';
    } else if (this.state.congress[chamber].dems > this.state.congress[chamber].repubs) {
      return 'd-majority';
    } else {
      return 'r-majority';
    }
  }

  render() {
    const { congress, user } = this.state;
    const { house, senate, next_election } = congress;
    return (
      <div className="container widened-container">
        <div className="row">
          <div className="col-xs-12">
            <div className="current-user group">
              <a className="btn btn-primary" rel="nofollow" data-method="delete" href="/sign_out">Log Out</a>
              <a className="btn btn-info groceries-button" rel="nofollow" href="/groceries">Groceries</a>
              <a className="btn btn-info recipe-button" rel="nofollow" href="/recipes">Recipes</a>
              <a className="btn btn-success" rel="nofollow" href="/recurring_tasks">Recurring Tasks</a>
              <a className="btn btn-info" rel="nofollow" href="/future_tasks">Future Tasks</a>
              <a className="btn btn-primary" rel="nofollow" href="/">Home</a>
              <div className="email">
                { user ? user.email : "(loading)" }
              </div>
              <div className="widget congress">
                <img src={ Images.democrat } />
                <div>
                  <p className={ this.houseClass('senate') }>{ senate.dems } - Senate - { senate.repubs }</p>
                  <p className="elections">{ senate.dems_up } - { next_election } Elections - { senate.repubs_up }</p>
                  <hr />
                  <p className={ this.houseClass('house') }>{ house.dems } - House - { house.repubs }</p>
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
