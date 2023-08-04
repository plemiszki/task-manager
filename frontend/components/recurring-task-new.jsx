import React from 'react'
import { Common, Details, GrayedOut, Spinner, setUpNiceSelect, createEntity, fetchEntities } from 'handy-components'
import DetailsComponent from './_details.jsx'

export default class RecurringTaskNew extends DetailsComponent {

  constructor(props) {
    super(props);
    this.state = {
      spinner: false,
      recurringTask: {
        text: '',
        timeframe: 'Day',
        addToEnd: false,
        color: 'rgb(210, 206, 200)',
        recurrence: "{\"every\":\"day\"}",
        expires: true,
        jointUserId: '',
        jointText: '',
      },
      errors: [],
      users: [],
    };
  }

  componentDidMount() {
    fetchEntities({
      directory: 'users',
    }).then((response) => {
      const { users } = response;
      this.setState({
        spinner: false,
        users,
      }, () => {
        setUpNiceSelect({ selector: 'select', func: Details.changeDropdownField.bind(this) });
      });
    });
  }

  changeFieldArgs() {
    return {
      entity: 'recurringTask',
      errorsArray: this.state.errors,
    }
  }

  clickSave() {
    this.setState({
      spinner: true,
    });
    createEntity({
      directory: 'recurring_tasks',
      entityName: 'recurringTask',
      entity: this.state.recurringTask,
    }).then((response) => {
      this.props.afterCreate(response);
    }, (response) => {
      this.setState({
        spinner: false,
        errors: response.errors,
      });
    });
  }

  render() {
    const { spinner, recurringTask, users } = this.state;
    return (
      <>
        <div id="recurring-task-new" className="handy-component admin-modal">
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
                <input className={ Details.errorClass([], []) } onChange={ Details.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.recurringTask.recurrence ? this.convertToEnglish(this.state.recurringTask) : "" } readOnly={ true } data-entity="recurringTask" data-field="recurrence" />
                <a onClick={ this.editRecurrence.bind(this) }>Edit</a>
                { Details.renderFieldError([], []) }
              </div>
              { Details.renderDropDown.bind(this)({
                columnWidth: 2,
                entity: 'recurringTask',
                columnHeader: "Expires",
                property: 'expires',
                type: 'dropdown',
                options: [
                  { value: "t", text: "Yes" },
                  { value: "f", text: "No" },
                ],
                optionDisplayProperty: 'text',
              }) }
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
            <a className={ "btn btn-success" + Common.renderDisabledButtonClass(spinner) } onClick={ () => this.clickSave() }>
              Add Recurring Task
            </a>
            <GrayedOut visible={ spinner } />
            <Spinner visible={ spinner } />
          </div>
          { this.renderRecurrenceModal() }
        </div>
        <style jsx>{`
          a.btn, a.btn:hover {
            color: white;
          }
        `}</style>
      </>
    );
  }
}
