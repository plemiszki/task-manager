import React from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { Common, Details } from 'handy-components'
import HandyTools from 'handy-tools'
import DetailsComponent from './_details.jsx'
import { ERRORS } from '../errors.js'
import { createEntity } from '../actions/index'

class RecurringTaskNew extends DetailsComponent {
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
    HandyTools.setUpNiceSelect({ selector: 'select', func: Details.changeField.bind(this, this.changeFieldArgs()) });
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
    this.props.createEntity({
      directory: 'recurring_tasks',
      entityName: 'recurringTask',
      entity: this.state.recurringTask
    }).then(() => {
      this.props.afterCreate(this.props.recurringTasks);
    }, () => {
      this.setState({
        fetching: false,
        errors: this.props.errors
      });
    });
  }

  render() {
    return(
      <div id="recurring-task-new" className="admin-modal">
          <div className="white-box">
            { Common.renderSpinner(this.state.fetching) }
            { Common.renderGrayedOut(this.state.fetching, -26, -26, 6) }
            <div className="row">
              <div className="col-xs-4">
                <h2>Text</h2>
                <input className={ Details.errorClass(this.state.errors, ERRORS.text) } onChange={ Details.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.recurringTask.text || "" } data-entity="recurringTask" data-field="text" />
                { Details.renderFieldError(this.state.errors, ERRORS.text) }
              </div>
              <div className="col-xs-2">
                <h2>Time Frame</h2>
                <select onChange={ () => {} } value={ this.state.recurringTask.timeframe || "" } data-entity="recurringTask" data-field="timeframe">
                  <option value="Day">Day</option>
                  <option value="Weekend">Weekend</option>
                  <option value="Month">Month</option>
                </select>
                { Details.renderFieldError([], []) }
              </div>
              <div className="col-xs-2">
                <h2>Position</h2>
                <select onChange={ () => {} } value={ HandyTools.convertBooleanToTFString(this.state.recurringTask.addToEnd) } data-entity="recurringTask" data-field="addToEnd">
                  <option value="f">Beginning</option>
                  <option value="t">End</option>
                </select>
                { Details.renderFieldError([], []) }
              </div>
              { this.renderColorField(4) }
            </div>
            <div className="row">
              <div className="col-xs-4 recurrence-field-column">
                <h2>Recurrence</h2>
                <input className={ Details.errorClass([], []) } onChange={ Details.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.recurringTask.recurrence ? this.convertToEnglish(this.state.recurringTask) : "" } readOnly={ true } data-entity="recurringTask" data-field="recurrence" />
                <a onClick={ this.editRecurrence.bind(this) }>Edit</a>
                { Details.renderFieldError([], []) }
              </div>
              <div className="col-xs-2">
                <h2>Expires</h2>
                <select onChange={ () => {} } value={ HandyTools.convertBooleanToTFString(this.state.recurringTask.expires) } data-entity="recurringTask" data-field="expires">
                  <option value="t">Yes</option>
                  <option value="f">No</option>
                </select>
                { Details.renderFieldError([], []) }
              </div>
              <div className="col-xs-3">
                <h2>Joint User</h2>
                <select onChange={ () => {} } value={ this.state.recurringTask.jointUserId || "" } data-entity="recurringTask" data-field="jointUserId">
                  <option value="">None</option>
                  { this.props.users.map((user, index) => {
                    return(
                      <option key={ index } value={ user.id }>{ user.email }</option>
                    );
                  }) }
                </select>
                { Details.renderFieldError([], []) }
              </div>
              <div className={ "col-xs-3" + (this.state.recurringTask.jointUserId ? "" : " hidden") }>
                <h2>Joint Text</h2>
                <input className={ Details.errorClass(this.state.errors, ERRORS.jointText) } onChange={ Details.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.recurringTask.jointText || "" } data-entity="recurringTask" data-field="jointText" />
                { Details.renderFieldError(this.state.errors, ERRORS.jointText) }
              </div>
            </div>
            <a className={ "btn btn-success" + Common.renderDisabledButtonClass(this.state.fetching) } onClick={ this.clickSave.bind(this) }>
              Add Recurring Task
            </a>
          </div>
          { this.renderRecurrenceModal() }
      </div>
    );
  }
}

const mapStateToProps = (reducers) => {
  return reducers.standardReducer;
};

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ createEntity }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(RecurringTaskNew);
