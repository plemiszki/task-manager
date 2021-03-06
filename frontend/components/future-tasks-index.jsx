import React from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import Modal from 'react-modal'
import Moment from 'moment'
import { Common, Index } from 'handy-components'
import HandyTools from 'handy-tools'
import FutureTaskNew from './future-task-new.jsx'
import { fetchEntities, deleteEntity } from '../actions/index'

const ModalStyles = {
  overlay: {
    background: 'rgba(0, 0, 0, 0.50)'
  },
  content: {
    background: '#F5F6F7',
    padding: 0,
    margin: 'auto',
    maxWidth: 1000,
    height: 321
  }
};

class FutureTasksIndex extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      modalOpen: false,
      fetching: true,
      futureTasks: []
    }
  }

  componentDidMount() {
    this.props.fetchEntities({ directory: 'future_tasks' }).then(() => {
      this.setState({
        fetching: false,
        futureTasks: this.props.futureTasks
      });
    });
  }

  clickNew() {
    this.setState({
      modalOpen: true
    });
  }

  clickX(e) {
    this.setState({
      fetching: true
    });
    this.props.deleteEntity({
      directory: 'future_tasks',
      id: e.target.dataset.id
    }).then(() => {
      this.setState({
        fetching: false,
        futureTasks: this.props.futureTasks
      });
    });
  }

  closeModal() {
    this.setState({
      modalOpen: false
    });
  }

  render() {
    return(
      <div className="container widened-container index-component">
        <div className="row">
          <div className="col-xs-12">
            <div className="white-box">
              { Common.renderSpinner(this.state.fetching) }
              { Common.renderGrayedOut(this.state.fetching, -26, -26, 6) }
              <h1>Future Tasks</h1>
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Text</th>
                    <th>Time Frame</th>
                    <th>Position</th>
                    <th>Color</th>
                    <th className="x-button-column"></th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="below-header"><td></td><td></td><td></td><td></td><td></td></tr>
                  { this.state.futureTasks.map((task) => {
                    return(
                      <tr key={ task.id }>
                        <td>{ Moment(task.date).format('l') }</td>
                        <td>{ task.text }</td>
                        <td>{ task.timeframe }</td>
                        <td>{ task.addToEnd ? "End" : "Beginning" }</td>
                        <td><div className="swatch" style={ { backgroundColor: task.color } }></div></td>
                        <td><div className="x-button" onClick={ this.clickX.bind(this) } data-id={ task.id }></div></td>
                      </tr>
                    );
                  }) }
                </tbody>
              </table>
              <div className="btn btn-info" onClick={ this.clickNew.bind(this) }>Add New</div>
            </div>
          </div>
        </div>
        <Modal isOpen={ this.state.modalOpen } onRequestClose={ this.closeModal.bind(this) } contentLabel="Modal" style={ ModalStyles }>
          <FutureTaskNew afterCreate={ (futureTasks) => { this.setState({ futureTasks, modalOpen: false }) } } />
        </Modal>
      </div>
    );
  }
}

const mapStateToProps = (reducers) => {
  return reducers.standardReducer;
};

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ fetchEntities, deleteEntity }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(FutureTasksIndex);
