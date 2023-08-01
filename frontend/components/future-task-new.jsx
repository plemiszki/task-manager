import React from 'react'
import Moment from 'moment'
import { Details, setUpNiceSelect, createEntity } from 'handy-components'
import DetailsComponent from './_details.jsx'

export default class FutureTaskNew extends DetailsComponent {

  constructor(props) {
    super(props);
    this.state = {
      fetching: false,
      futureTask: {
        text: '',
        timeframe: 'Day',
        addToEnd: false,
        color: 'rgb(210, 206, 200)',
        date: (Moment().add(1, 'days').format('l')),
      },
      errors: [],
    };
  }

  componentDidMount() {
    setUpNiceSelect({ selector: 'select', func: Details.changeDropdownField.bind(this) });
  }

  changeFieldArgs() {
    return {
      entity: 'futureTask',
      errorsArray: this.state.errors,
    }
  }

  clickSave() {
    this.setState({
      spinner: true,
    });
    createEntity({
      directory: 'future_tasks',
      entityName: 'futureTask',
      entity: this.state.futureTask,
    }).then((response) => {
      this.props.afterCreate(response.futureTasks);
    }, (response) => {
      this.setState({
        spinner: false,
        errors: response.errors,
      });
    });
  }

  render() {
    return(
      <div id="future-task-new" className="handy-component admin-modal">
          <div className="white-box">
            <div className="row">
              { Details.renderField.bind(this)({ columnWidth: 3, entity: 'futureTask', property: 'date' }) }
              { Details.renderField.bind(this)({ columnWidth: 9, entity: 'futureTask', property: 'text' }) }
            </div>
            <div className="row">
              { Details.renderDropDown.bind(this)({
                columnWidth: 3,
                entity: 'futureTask',
                columnHeader: "Time Frame",
                property: 'timeframe',
                type: 'dropdown',
                options: [
                  { value: "Day" },
                  { value: "Weekend" },
                  { value: "Month" },
                  { value: "Year" },
                ],
                optionDisplayProperty: 'value',
                maxOptions: 2,
              }) }
              { Details.renderDropDown.bind(this)({
                columnWidth: 3,
                entity: 'futureTask',
                columnHeader: "Position",
                property: 'addToEnd',
                type: 'dropdown',
                options: [
                  { value: "f", text: "Beginning" },
                  { value: "t", text: "End" },
                ],
                optionDisplayProperty: 'text',
              }) }
              { this.renderColorField(5) }
            </div>
            <div className="row">
              <div className="col-xs-12">
                <div className="btn btn-info" onClick={ this.clickSave.bind(this) }>Add Future Task</div>
              </div>
            </div>
          </div>
      </div>
    );
  }
}
