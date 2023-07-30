import React from 'react'


import { Common, Details } from 'handy-components'
import DetailsComponent from './_details.jsx'
import { fetchEntity, updateEntity } from '../actions/index'
import { ERRORS } from '../errors.js'

class RecurringTaskDetails extends DetailsComponent {

  constructor(props) {
    super(props);
    this.state = Object.assign(this.defaultState(), {
      recurringTask: {},
      recurringTaskSaved: {},
      users: []
    });
  }

  componentDidMount() {
    this.props.fetchEntity({
      id: window.location.pathname.split('/')[2],
      directory: 'recurring_tasks',
      entityName: 'recurringTask'
    }).then(() => {
      this.setState({
        fetching: false,
        recurringTask: this.props.recurringTask,
        recurringTaskSaved: HandyTools.deepCopy(this.props.recurringTask),
        changesToSave: false
      }, () => {
        HandyTools.setUpNiceSelect({ selector: 'select', func: Details.changeField.bind(this, this.changeFieldArgs()) });
      });
    });
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
    if (value.jointUserId == '') {
      value.jointText = '';
      Details.removeFieldError(ERRORS, this.state.errors, 'jointText');
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
      HandyTools.setUpNiceSelect({ selector: 'select', func: Details.changeField.bind(this, this.changeFieldArgs()) });
    });
  }

  clickSave() {
    this.setState({
      fetching: true,
      justSaved: true
    }, () => {
      this.props.updateEntity({
        id: window.location.pathname.split('/')[2],
        directory: 'recurring_tasks',
        entity: this.state.recurringTask,
        entityName: 'recurringTask'
      }).then(() => {
        this.setState({
          fetching: false,
          recurringTask: this.props.recurringTask,
          recurringTaskSaved: HandyTools.deepCopy(this.props.recurringTask),
          changesToSave: false
        });
      }, () => {
        this.setState({
          fetching: false,
          errors: this.props.errors
        });
      });
    });
  }

  render() {
    return(
      <div className="container widened-container">
        <div className="recurring-task-details component">
          <h1>Edit Recurring Task</h1>
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
              { Details.renderDropDown.bind(this)({ columnWidth: 1, boolean: true, entity: 'recurringTask', property: 'expires' }) }
              { Details.renderDropDown.bind(this)({ columnWidth: 1, boolean: true, entity: 'recurringTask', property: 'active' }) }
              <div className="col-xs-3">
                <h2>Joint User</h2>
                <select onChange={ () => {} } value={ this.state.recurringTask.jointUserId || '' } data-entity="recurringTask" data-field="jointUserId">
                  <option value="">None</option>
                  { this.state.users.map((user, index) => {
                    return(
                      <option key={ index } value={ user.id }>{ user.email }</option>
                    );
                  }) }
                </select>
                { Details.renderFieldError([], []) }
              </div>
              <div className={ 'col-xs-3' + (this.state.recurringTask.jointUserId ? '' : ' hidden') }>
                <h2>Joint Text</h2>
                <input className={ Details.errorClass(this.state.errors, ERRORS.jointText) } onChange={ Details.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.recurringTask.jointText || "" } data-entity="recurringTask" data-field="jointText" />
                { Details.renderFieldError(this.state.errors, ERRORS.jointText) }
              </div>
            </div>
            { this.renderButtons() }
          </div>
        </div>
        { this.renderRecurrenceModal() }
      </div>
    );
  }

  renderButtons() {
    if (this.state.changesToSave) {
      var buttonText = 'Save';
    } else {
      var buttonText = this.state.justSaved ? 'Saved' : 'No Changes';
    }
    return(
      <div>
        <a className={ "standard-width btn btn-success save-button" + Common.renderDisabledButtonClass(this.state.fetching || !this.state.changesToSave) } onClick={ this.clickSave.bind(this) }>
          { buttonText }
        </a>
      </div>
    );
  }
};

const mapStateToProps = (reducers) => {
  return reducers.standardReducer;
};

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ fetchEntity, updateEntity }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(RecurringTaskDetails);
