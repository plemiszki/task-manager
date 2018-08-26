import React from 'react';
import HandyTools from 'handy-tools';
import ClientActions from '../actions/client-actions.js';
import RecurringTasksStore from '../stores/recurring-tasks-store.js';
import ErrorsStore from '../stores/errors-store';
import DetailsComponent from './_details.jsx';
import { ERRORS } from '../errors.js';

export default class RecurringTaskDetails extends DetailsComponent {

  constructor(props) {
    super(props);
    this.state = Object.assign(this.defaultState(), {
      recurringTask: {},
      recurringTaskSaved: {},
      users: []
    });
  }

  componentDidMount() {
    this.errorsListener = ErrorsStore.addListener(this.getErrors.bind(this));
    this.recurringTasksListener = RecurringTasksStore.addListener(this.getRecurringTask.bind(this));
    ClientActions.standardFetch('recurring_tasks', window.location.pathname.split("/")[2]);
  }

  componentWillUnmount() {
    this.errorsListener.remove();
    this.recurringTasksListener.remove();
  }

  checkForChanges() {
    return !HandyTools.objectsAreEqual(this.state.recurringTask, this.state.recurringTaskSaved);
  }

  changeFieldArgs() {
    return {
      allErrors: ERRORS,
      beforeSave: this.beforeSave,
      errorsArray: this.state.errors,
      changesFunction: () => this.checkForChanges()
    }
  }

  beforeSave(key, value) {
    if (value.jointUserId == "") {
      value.jointText = "";
      HandyTools.removeFieldError(ERRORS, this.state.errors, 'jointText');
    }
    return { key, value }
  }

  getRecurringTask() {
    var recurringTask = RecurringTasksStore.find(window.location.pathname.split("/")[2]);
    this.setState({
      fetching: false,
      changesToSave: false,
      recurringTask: recurringTask,
      recurringTaskSaved: HandyTools.deepCopy(recurringTask),
      users: RecurringTasksStore.users()
    }, function() {
      HandyTools.setUpNiceSelect({ selector: 'select', func: HandyTools.changeField.bind(this, this.changeFieldArgs()) });
    });
  }

  clickColor(e) {
    let recurringTask = this.state.recurringTask;
    recurringTask.color = e.target.style.backgroundColor;
    this.setState({
      recurringTask
    }, function() {
      var changesToSave = this.checkForChanges();
      this.setState({
        changesToSave: changesToSave
      });
    });
  }

  clickSave() {
    this.setState({
      fetching: true,
      justSaved: true
    });
    ClientActions.updateRecurringTask(this.state.recurringTask);
  }

  render() {
    return(
      <div className="container widened-container">
        <div className="recurring-task-details component">
          <h1>Edit Recurring Task</h1>
          <div className="white-box">
            { HandyTools.renderSpinner(this.state.fetching) }
            { HandyTools.renderGrayedOut(this.state.fetching, -26, -26, 6) }
            <div className="row">
              <div className="col-xs-4">
                <h2>Text</h2>
                <input className={ HandyTools.errorClass(this.state.errors, ERRORS.text) } onChange={ HandyTools.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.recurringTask.text || "" } data-entity="recurringTask" data-field="text" />
                { HandyTools.renderFieldError(this.state.errors, ERRORS.text) }
              </div>
              <div className="col-xs-2">
                <h2>Time Frame</h2>
                <select onChange={ function() {} } value={ this.state.recurringTask.timeframe || "" } data-entity="recurringTask" data-field="timeframe">
                  <option value={ "Day" }>Day</option>
                  <option value={ "Weekend" }>Weekend</option>
                  <option value={ "Month" }>Month</option>
                </select>
                { HandyTools.renderFieldError([], []) }
              </div>
              <div className="col-xs-2">
                <h2>Position</h2>
                <select onChange={ function() {} } value={ HandyTools.convertBooleanToTFString(this.state.recurringTask.addToEnd) } data-entity="recurringTask" data-field="addToEnd">
                  <option value={ "f" }>Beginning</option>
                  <option value={ "t" }>End</option>
                </select>
                { HandyTools.renderFieldError([], []) }
              </div>
              { this.renderColorField() }
            </div>
            <div className="row">
              <div className="col-xs-4 recurrence-field-column">
                <h2>Recurrence</h2>
                <input className={ HandyTools.errorClass([], []) } onChange={ HandyTools.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.recurringTask.recurrence || "" } readOnly={ true } data-entity="recurringTask" data-field="recurrence" />
                <a>Edit</a>
                { HandyTools.renderFieldError([], []) }
              </div>
              <div className="col-xs-2">
                <h2>Expires</h2>
                <select onChange={ function() {} } value={ HandyTools.convertBooleanToTFString(this.state.recurringTask.expires) } data-entity="recurringTask" data-field="expires">
                  <option value={ "t" }>Yes</option>
                  <option value={ "f" }>No</option>
                </select>
                { HandyTools.renderFieldError([], []) }
              </div>
              <div className="col-xs-3">
                <h2>Joint User</h2>
                <select onChange={ function() {} } value={ this.state.recurringTask.jointUserId || "" } data-entity="recurringTask" data-field="jointUserId">
                  <option value={ "" }>None</option>
                  { this.state.users.map(function(user, index) {
                    return(
                      <option key={ index } value={ user.id }>{ user.email }</option>
                    );
                  }) }
                </select>
                { HandyTools.renderFieldError([], []) }
              </div>
              <div className={ "col-xs-3" + (this.state.recurringTask.jointUserId ? "" : " hidden") }>
                <h2>Joint Text</h2>
                <input className={ HandyTools.errorClass(this.state.errors, ERRORS.jointText) } onChange={ HandyTools.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.recurringTask.jointText || "" } data-entity="recurringTask" data-field="jointText" />
                { HandyTools.renderFieldError(this.state.errors, ERRORS.jointText) }
              </div>
            </div>
            { this.renderButtons() }
          </div>
        </div>
      </div>
    );
  }

  renderColorField() {
    return(
      <div className={ "col-xs-4" + (this.state.recurringTask.jointUserId ? ' hidden' : '') }>
        <h2>Color</h2>
        <div className="colors">
          <div className={ 'color' + (this.state.recurringTask.color === 'rgb(234, 30, 30)' ? ' selected' : '') } onClick={ this.clickColor.bind(this) } style={{'backgroundColor': 'rgb(234, 30, 30)'}} ></div>
          <div className={ 'color' + (this.state.recurringTask.color === 'rgb(255, 175, 163)' ? ' selected' : '') } onClick={ this.clickColor.bind(this) } style={{'backgroundColor': 'rgb(255, 175, 163)'}} ></div>
          <div className={ 'color' + (this.state.recurringTask.color === 'rgb(255, 175, 36)' ? ' selected' : '') } onClick={ this.clickColor.bind(this) } style={{'backgroundColor': 'rgb(255, 175, 36)'}} ></div>
          <div className={ 'color' + (this.state.recurringTask.color === 'rgb(238, 244, 66)' ? ' selected' : '') } onClick={ this.clickColor.bind(this) } style={{'backgroundColor': 'rgb(238, 244, 66)'}} ></div>
          <div className={ 'color' + (this.state.recurringTask.color === 'rgb(30, 124, 33)' ? ' selected' : '') } onClick={ this.clickColor.bind(this) } style={{'backgroundColor': 'rgb(30, 124, 33)'}} ></div>
          <div className={ 'color' + (this.state.recurringTask.color === 'rgb(111, 138, 240)' ? ' selected' : '') } onClick={ this.clickColor.bind(this) } style={{'backgroundColor': 'rgb(111, 138, 240)'}} ></div>
          <div className={ 'color' + (this.state.recurringTask.color === 'rgb(181, 111, 240)' ? ' selected' : '') } onClick={ this.clickColor.bind(this) } style={{'backgroundColor': 'rgb(181, 111, 240)'}} ></div>
          <div className={ 'color' + (this.state.recurringTask.color === 'rgb(175, 96, 26)' ? ' selected' : '') } onClick={ this.clickColor.bind(this) } style={{'backgroundColor': 'rgb(175, 96, 26)'}} ></div>
          <div className={ 'color' + (this.state.recurringTask.color === 'rgb(210, 206, 200)' ? ' selected' : '') } onClick={ this.clickColor.bind(this) } style={{'backgroundColor': 'rgb(210, 206, 200)'}} ></div>
        </div>
        { HandyTools.renderFieldError([], []) }
      </div>
    );
  }

  renderButtons() {
    if (this.state.changesToSave) {
      var buttonText = "Save";
    } else {
      var buttonText = this.state.justSaved ? "Saved" : "No Changes";
    }
    return(
      <div>
        <a className={ "standard-width btn btn-success save-button" + HandyTools.renderDisabledButtonClass(this.state.fetching || !this.state.changesToSave) } onClick={ this.clickSave.bind(this) }>
          { buttonText }
        </a>
      </div>
    );
  }
};
