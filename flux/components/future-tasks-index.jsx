var React = require('react');
var Modal = require('react-modal');
var HandyTools = require('handy-tools');
var Moment = require('moment');
var ClientActions = require('../actions/client-actions.js');
var FutureTasksStore = require('../stores/future-tasks-store.js');
var ErrorsStore = require('../stores/errors-store.js');

var ModalStyles = {
  overlay: {
    background: 'rgba(0, 0, 0, 0.50)'
  },
  content: {
    background: '#F5F6F7',
    padding: 0,
    margin: 'auto',
    maxWidth: 1000,
    height: 276
  }
};

var FutureTasksIndex = React.createClass({

  getInitialState: function() {
    return({
      modalOpen: false,
      fetching: true,
      modalFetching: false,
      tasks: [],
      errors: []
    });
  },

  componentDidMount: function() {
    this.tasksListener = FutureTasksStore.addListener(this.getFutureTasks);
    this.errorsListener = ErrorsStore.addListener(this.getErrors);
    ClientActions.fetchFutureTasks();
  },

  getFutureTasks: function() {
    this.setState({
      fetching: false,
      modalFetching: false,
      modalOpen: false,
      tasks: FutureTasksStore.all()
    });
  },

  clickAddNewButton: function() {
    this.setState({
      modalOpen: true
    }, function() {
      Common.resetNiceSelect('select');
      $('[data-field="date"]').val(Moment().add(1, 'days').format('l'));
    });
  },

  clickXButton: function(e) {
    this.setState({
      fetching: true
    });
    ClientActions.deleteFutureTask(e.target.dataset.id);
  },

  handleModalClose: function() {
    this.setState({ modalOpen: false, errors: [] });
  },

  clickColor: function(e) {
    $('.color').removeClass('selected');
    e.target.classList.add('selected');
  },

  clickAddButton: function() {
    var date = $('[data-field="date"]')[0].value;
    var text = $('[data-field="text"]')[0].value;
    var timeframe = $('[data-field="timeframe"]')[0].value;
    var position = $('[data-field="position"]')[0].value;
    var color = $('.color.selected')[0].style.backgroundColor;
    this.setState({
      modalFetching: true
    });
    ClientActions.createFutureTask({ date, text, timeframe, add_to_end: (position == "End"), color });
  },

  getErrors: function() {
    this.setState({
      modalFetching: false,
      errors: ErrorsStore.all()
    });
  },

  clearError: function(e) {
    var errors = this.state.errors;
    if (e.target.dataset.field == "date") {
      HandyTools.removeFromArray(errors, "Date is not a valid date");
    } else if (e.target.dataset.field == "text") {
      HandyTools.removeFromArray(errors, "Text can't be blank");
    }
    this.setState({
      errors: errors
    });
  },

  render: function() {
    return(
      <div className="container">
        <div className="row">
          <div className="col-xs-12">
            { HandyTools.renderSpinner(this.state.fetching) }
            { HandyTools.renderGrayedOut(this.state.fetching, -20, -25) }
            <h1>Future Tasks</h1>
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Text</th>
                  <th>Time Frame</th>
                  <th>Position</th>
                  <th>Color</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                <tr className="below-header"><td></td><td></td><td></td><td></td><td></td></tr>
                {this.state.tasks.map(function(task) {
                  return(
                    <tr key={ task.id }>
                      <td>{ Moment(task.date).format('l') }</td>
                      <td>{ task.text }</td>
                      <td>{ task.timeframe }</td>
                      <td>{ task.addToEnd ? "End" : "Beginning" }</td>
                      <td><div className="swatch" style={ { backgroundColor: task.color } }></div></td>
                      <td><div className="x-button" onClick={ this.clickXButton } data-id={ task.id }></div></td>
                    </tr>
                  )
                }.bind(this))}
              </tbody>
            </table>
            <div className="btn btn-primary" onClick={ this.clickAddNewButton }>Add New</div>
          </div>
        </div>
        <Modal isOpen={ this.state.modalOpen } onRequestClose={ this.handleModalClose } contentLabel="Modal" style={ ModalStyles }>
          <div className="my-modal">
            { HandyTools.renderSpinner(this.state.modalFetching) }
            { HandyTools.renderGrayedOut(this.state.modalFetching, -20, -20) }
            <div className="container">
              <div className="row">
                <div className="col-xs-3">
                  <h1>Date</h1>
                  <input className={ this.state.errors.indexOf("Date is not a valid date") >= 0 ? "error" : "" } onChange={ this.clearError } data-field="date" />
                </div>
                <div className="col-xs-9">
                  <h1>Text</h1>
                  <input className={ this.state.errors.indexOf("Text can't be blank") >= 0 ? "error" : "" } onChange={ this.clearError } data-field="text" />
                </div>
              </div>
              <div className="row">
                <div className="col-xs-3">
                  <h1>Time Frame</h1>
                    <select data-field="timeframe">
                      <option>Day</option>
                      <option>Weekend</option>
                      <option>Month</option>
                      <option>Year</option>
                    </select>
                </div>
                <div className="col-xs-3">
                  <h1>Position</h1>
                  <select data-field="position">
                    <option>Beginning</option>
                    <option>End</option>
                  </select>
                </div>
                <div className="col-xs-6">
                  <h1>Color</h1>
                  <div className="colors">
                    <div className="color" onClick={ this.clickColor } style={{'backgroundColor': 'rgb(234, 30, 30)'}} ></div>
                    <div className="color" onClick={ this.clickColor } style={{'backgroundColor': 'rgb(255, 175, 163)'}} ></div>
                    <div className="color" onClick={ this.clickColor } style={{'backgroundColor': 'rgb(255, 175, 36)'}} ></div>
                    <div className="color" onClick={ this.clickColor } style={{'backgroundColor': 'rgb(238, 244, 66)'}} ></div>
                    <div className="color" onClick={ this.clickColor } style={{'backgroundColor': 'rgb(30, 124, 33)'}} ></div>
                    <div className="color" onClick={ this.clickColor } style={{'backgroundColor': 'rgb(111, 138, 240)'}} ></div>
                    <div className="color" onClick={ this.clickColor } style={{'backgroundColor': 'rgb(181, 111, 240)'}} ></div>
                    <div className="color" onClick={ this.clickColor } style={{'backgroundColor': 'rgb(175, 96, 26)'}} ></div>
                    <div className="color selected" onClick={ this.clickColor } style={{'backgroundColor': 'rgb(210, 206, 200)'}} ></div>
                  </div>
                </div>
              </div>
              <div className="row">
                <div className="col-xs-12">
                  <div className="btn btn-primary" onClick={ this.clickAddButton }>Add</div>
                </div>
              </div>
            </div>
          </div>
        </Modal>
      </div>
    )
  }
});

module.exports = FutureTasksIndex;
