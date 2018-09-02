import React from 'react';
import ErrorsStore from '../stores/errors-store.js';
import ClientActions from '../actions/client-actions.js';
import DetailsComponent from './_details.jsx';
import HandyTools from 'handy-tools';
import { ERRORS } from '../errors.js';

export default class RecurringTaskNew extends DetailsComponent {
  constructor(props) {
    super(props);
    this.state = {
      fetching: false,
      recurringTask: {
        text: '',
        timeframe: 'Day',
        addToEnd: false,
        color: 'rgb(210, 206, 200)',
        recurrence: "{\"every\":\"day\"}",
        expires: true,
        jointUserId: '',
        jointText: ''
      },
      errors: []
    };
  }

  componentDidMount() {
    this.errorsListener = ErrorsStore.addListener(this.getErrors.bind(this));
    HandyTools.setUpNiceSelect({ selector: 'select', func: HandyTools.changeField.bind(this, this.changeFieldArgs()) });
  }

  componentWillUnmount() {
    this.errorsListener.remove();
  }

  getErrors() {
    this.setState({
      fetching: false,
      errors: ErrorsStore.all()
    });
  }

  changeFieldArgs() {
    return {
      allErrors: ERRORS,
      errorsArray: this.state.errors
    }
  }

  clickSave() {
    this.setState({
      fetching: true
    });
    ClientActions.standardCreate('recurring_tasks', 'recurring_task', this.state.recurringTask);
  }

  render() {
    return(
      <div id="recurring-task-new" className="admin-modal">
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
              { this.renderColorField(4) }
            </div>
            <div className="row">
              <div className="col-xs-4 recurrence-field-column">
                <h2>Recurrence</h2>
                <input className={ HandyTools.errorClass([], []) } onChange={ HandyTools.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.recurringTask.recurrence ? this.convertToEnglish(this.state.recurringTask.recurrence) : "" } readOnly={ true } data-entity="recurringTask" data-field="recurrence" />
                <a onClick={ this.editRecurrence.bind(this) }>Edit</a>
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
                  { this.props.users.map(function(user, index) {
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
            <a className={ "btn btn-success" + HandyTools.renderDisabledButtonClass(this.state.fetching) } onClick={ this.clickSave.bind(this) }>
              Add Recurring Task
            </a>
          </div>
          { this.renderRecurrenceModal() }
      </div>
    );
  }
}
