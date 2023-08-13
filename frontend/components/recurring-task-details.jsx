import React from 'react'
import { Common, Details, deepCopy, fetchEntity, updateEntity, objectsAreEqual, setUpNiceSelect, GrayedOut, Spinner } from 'handy-components'
import DetailsComponent from './_details.jsx'

export default class RecurringTaskDetails extends DetailsComponent {

  constructor(props) {
    super(props);
    this.state = Object.assign(this.defaultState(), {
      recurringTask: {},
      recurringTaskSaved: {},
      users: [],
      spinner: true,
    });
  }

  componentDidMount() {
    fetchEntity({
      id: window.location.pathname.split('/')[2],
      directory: 'recurring_tasks',
      entityName: 'recurringTask',
    }).then((response) => {
      const { recurringTask, users } = response;
      this.setState({
        spinner: false,
        recurringTask,
        recurringTaskSaved: deepCopy(recurringTask),
        users,
        changesToSave: false,
      }, () => {
        setUpNiceSelect({ selector: 'select', func: Details.changeDropdownField.bind(this) });
      });
    });
  }

  checkForChanges() {
    const { recurringTask, recurringTaskSaved } = this.state;
    return !objectsAreEqual(recurringTask, recurringTaskSaved);
  }

  changeFieldArgs() {
    return {
      entity: 'recurringTask',
      beforeSave: this.beforeSave,
      changesFunction: () => this.checkForChanges(),
    }
  }

  beforeSave(key, value) {
    if (value.jointUserId == '') {
      value.jointText = '';
      // Details.removeFieldError(ERRORS, this.state.errors, 'jointText');
    }
    return { key, value }
  }

  clickSave() {
    const { recurringTask } = this.state;
    this.setState({
      spinner: true,
      justSaved: true,
    }, () => {
      updateEntity({
        id: window.location.pathname.split('/')[2],
        directory: 'recurring_tasks',
        entity: recurringTask,
        entityName: 'recurringTask',
      }).then((response) => {
        const { recurringTask } = response;
        this.setState({
          spinner: false,
          recurringTask,
          recurringTaskSaved: deepCopy(recurringTask),
          changesToSave: false,
        });
      }, (response) => {
        const { errors } = response;
        this.setState({
          spinner: false,
          errors,
        });
      });
    });
  }

  render() {
    const { spinner, recurringTask, users } = this.state;
    return (
      <div className="handy-component container widened-container">
        <div className="recurring-task-details component">
          <h1>Edit Recurring Task</h1>
          <div className="white-box">
            <div className="row">
              { Details.renderField.bind(this)({ columnWidth: 4, entity: 'recurringTask', property: 'text' }) }
              { Details.renderDropDown.bind(this)({
                columnWidth: 2,
                entity: 'recurringTask',
                columnHeader: "Time Frame",
                property: 'timeframe',
                type: 'dropdown',
                options: [
                  { value: "Day" },
                  { value: "Weekend" },
                  { value: "Month" },
                ],
                optionDisplayProperty: 'value',
              }) }
              { Details.renderDropDown.bind(this)({
                columnWidth: 2,
                entity: 'recurringTask',
                columnHeader: "Position",
                property: 'addToEnd',
                type: 'dropdown',
                options: [
                  { value: "f", text: "Beginning" },
                  { value: "t", text: "End" },
                ],
                optionDisplayProperty: 'text',
              }) }
              { this.renderColorField(4) }
            </div>
            <div className="row">
              <div className="col-xs-4 recurrence-field-column">
                <h2>Recurrence</h2>
                <input className={ Details.errorClass([], []) } onChange={ Details.changeField.bind(this, this.changeFieldArgs()) } value={ recurringTask.recurrence ? this.convertToEnglish(recurringTask) : "" } readOnly={ true } data-entity="recurringTask" data-field="recurrence" />
                <a onClick={ this.editRecurrence.bind(this) }>Edit</a>
                { Details.renderFieldError([], []) }
              </div>
              { Details.renderDropDown.bind(this)({ columnWidth: 1, boolean: true, entity: 'recurringTask', property: 'expires' }) }
              { Details.renderDropDown.bind(this)({ columnWidth: 1, boolean: true, entity: 'recurringTask', property: 'active' }) }
              { Details.renderDropDown.bind(this)({
                columnWidth: 3,
                entity: 'recurringTask',
                columnHeader: "Joint User",
                property: 'jointUserId',
                type: 'dropdown',
                options: users,
                optionDisplayProperty: 'email',
                optionValueProperty: 'id',
                optional: true,
                maxOptions: 2,
              }) }
              { Details.renderField.bind(this)({ columnWidth: 3, entity: 'recurringTask', property: 'jointText', hidden: !recurringTask.jointUserId }) }
            </div>
            { this.renderButtons() }
            <GrayedOut visible={ spinner } />
            <Spinner visible={ spinner } />
          </div>
        </div>
        { this.renderRecurrenceModal() }
      </div>
    );
  }

  renderButtons() {
    const { changesToSave, justSaved, spinner } = this.state;
    if (changesToSave) {
      var buttonText = 'Save';
    } else {
      var buttonText = justSaved ? 'Saved' : 'No Changes';
    }
    return (
      <>
        <div>
          <a className={ "standard-width btn btn-success save-button" + Common.renderDisabledButtonClass(spinner || !changesToSave) } onClick={ this.clickSave.bind(this) }>
            { buttonText }
          </a>
        </div>
        <style jsx>{`
          a.btn, a.btn:hover {
            color: white;
          }
        `}</style>
      </>
    );
  }
};
