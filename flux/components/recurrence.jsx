import React from 'react';
import HandyTools from 'handy-tools';

export default class Recurrence extends React.Component {

  constructor(props) {
    super(props);

    let recurrence = JSON.parse(this.props.recurringTask.recurrence);
    let today = new Date;
    let result = {
      weekday: 'Sunday',
      month: 'January',
      starts: `${today.getFullYear()}-${('0' + (today.getMonth() + 1)).slice(-2)}-${('0' + today.getDate()).slice(-2)}T00:00:00.000-05:00`,
      interval: 2
    };
    if (recurrence.every === 'day') {
      if (recurrence.interval) {
        result.type = 'Daily (Interval)';
        result.starts = recurrence.starts;
        result.interval = recurrence.interval.toString();
      } else {
        result.type = 'Daily';
      }
    } else if (recurrence.every === 'week') {
      result.type = 'Weekly';
      result.weekday = HandyTools.capitalize(recurrence.on);
    } else if (recurrence.every === 'month') {
      result.type = 'Monthly';
    } else if (recurrence.every === 'year') {
      result.type = 'Yearly';
      result.month = HandyTools.MONTHS[+recurrence.month - 1];
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
    console.log(this.state.recurrence);
    return(
      <div className="admin-modal recurrence-modal">
        <div className="white-box">
          <div className="row">
            <div className="col-xs-12">
              <h2>Type</h2>
              <select onChange={ function() {} } value={ this.state.recurrence.type } data-entity="recurrence" data-field="type">
                <option value={ "Daily" }>Daily</option>
                <option value={ "Daily (Interval)" }>Daily (Interval)</option>
                <option value={ "Weekly" }>Weekly</option>
                <option value={ "Monthly" }>Monthly</option>
                <option value={ "Yearly" }>Yearly</option>
              </select>
              { HandyTools.renderDropdownFieldError([], []) }
            </div>
          </div>
          <div className="row">
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
    if (this.state.recurrence.type === 'Daily (Interval)') {
      return(
        <div className="col-xs-12 second-row">
          <h2>Interval</h2>
          <input type="number" value={ this.state.recurrence.interval } onChange={ HandyTools.changeField.bind(this, this.changeFieldArgs()) } data-entity="recurrence" data-field="interval" />
          { HandyTools.renderFieldError([], []) }
        </div>
      );
    } else if (this.state.recurrence.type === 'Weekly') {
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
    } else if (this.state.recurrence.type === 'Yearly') {
      return(
        <div className="col-xs-12 second-row select-scroll-2">
          <h2>Month</h2>
          <select onChange={ function() {} } value={ this.state.recurrence.month } data-entity="recurrence" data-field="month">
            { HandyTools.MONTHS.map(function(month, index) {
              return(
                <option key={ index } value={ month }>{ month }</option>
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
    if (['Daily', 'Daily (Interval)', 'Monthly'].indexOf(nextState.recurrence.type) > -1) {
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
