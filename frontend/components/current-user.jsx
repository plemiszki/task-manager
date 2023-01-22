import React from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { fetchEntity } from '../actions/index'
import Mileage from './mileage'

class CurrentUser extends React.Component {

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
    this.props.fetchEntity({ url: '/api/user' }).then(() => {
      this.setState({
        user: this.props.user
      });
    });
    this.props.fetchEntity({ url: '/api/congress' }).then(() => {
      this.setState({
        congress: this.props.congress
      });
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
              <Mileage />
            </div>
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (reducers) => {
  return reducers.standardReducer;
};

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ fetchEntity }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(CurrentUser);
