import React from 'react';
import HandyTools from 'handy-tools';

export default class Recurrence extends React.Component {

  constructor(props) {
    super(props);

    let recurrence = JSON.parse(this.props.recurringTask.recurrence);
    let result = {
      weekday: 'Sunday'
    };
    if (recurrence.every) {
      if (recurrence.every === 'day') {
        result.type = 'Daily';
      } else if (recurrence.every === 'week') {
        result.type = 'Weekly';
        result.weekday = HandyTools.capitalize(recurrence.on);
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
    HandyTools.setUpNiceSelect({
      selector: '.recurrence-modal select',
      func: HandyTools.changeField.bind(this, this.changeFieldArgs())
    });
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
                <option value={ "Weekly" }>Weekly</option>
                <option value={ "Monthly" }>Monthly</option>
              </select>
              { HandyTools.renderDropdownFieldError([], []) }
            </div>
            { this.renderSecondRow() }
          </div>
          <div className="text-center">
            <a className="btn btn-success standard-width update-recurrence-button" onClick={ this.updateRecurrence.bind(this) }>Update Recurrence</a>
          </div>
        </div>
      </div>
    );
  }

  renderSecondRow() {
    if (this.state.recurrence.type === 'Weekly') {
      return(
        <div className="col-xs-12 second-row select-scroll-2">
          <h2>Weekday</h2>
          <select onChange={ function() {} } value={ this.state.recurrence.weekday } data-entity="recurrence" data-field="weekday">
            { HandyTools.WEEKDAYS.map(function(weekday, index) {
              return(
                <option key={ index } value={ weekday }>{ weekday }</option>
              );
            }) }
          </select>
          { HandyTools.renderDropdownFieldError([], []) }
        </div>
      );
    } else {
      return(
        <div className="col-xs-6">
          <div style={ { height: 104 } }>
          </div>
        </div>
      );
    }
  }

  componentWillUpdate(nextProps, nextState) {
    if (nextState.recurrence.type === 'Daily' || nextState.recurrence.type === 'Monthly') {
      var $dropDownsToDestroy = $('.recurrence-modal .second-row select');
      $dropDownsToDestroy.niceSelect('destroy');
    }
  }

  componentDidUpdate() {
    HandyTools.setUpNiceSelect({
      selector: '.recurrence-modal .second-row select',
      func: HandyTools.changeField.bind(this, this.changeFieldArgs())
    });
  }
}
