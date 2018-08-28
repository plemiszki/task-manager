import React from 'react';
import HandyTools from 'handy-tools';

export default class Recurrence extends React.Component {

  constructor(props) {
    super(props);

    let recurrence = JSON.parse(this.props.recurringTask.recurrence);
    let result = {};
    if (recurrence.every) {
      if (recurrence.every === 'day') {
        result.type = 'Daily';
      } else if (recurrence.every === 'month') {
        result.type = 'Monthly';
      } else {
        result.type = 'Daily';
      }
    } else {
      result.type = 'Daily';
    }

    this.state = {
      recurrence: result
    };
  }

  componentDidMount() {
    HandyTools.setUpNiceSelect({ selector: '.recurrence-modal select', func: HandyTools.changeField.bind(this, this.changeFieldArgs()) });
  }

  changeFieldArgs() {
    return {
      allErrors: [],
      errorsArray: []
    }
  }

  updateRecurrence() {
    this.props.updateRecurrence(this.state.recurrence);
  }

  render() {
    return(
      <div className="admin-modal recurrence-modal">
        <div className="white-box">
          <div className="row">
            <div className="col-xs-12">
              <h2>Type</h2>
              <select onChange={ function() {} } value={ this.state.recurrence.type } data-entity="recurrence" data-field="type">
                <option value={ "Daily" }>Daily</option>
                <option value={ "Monthly" }>Monthly</option>
              </select>
              { HandyTools.renderDropdownFieldError([], []) }
            </div>
          </div>
          <div className="text-center">
            <a className="btn btn-success standard-width" onClick={ this.updateRecurrence.bind(this) }>Update Recurrence</a>
          </div>
        </div>
      </div>
    );
  }
}
