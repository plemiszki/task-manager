import React from 'react'
import { Common, Details } from 'handy-components'
import HandyTools from 'handy-tools'
import ChangeCase from 'change-case'

export default class Recurrence extends React.Component {

  constructor(props) {
    super(props);

    let recurrence = JSON.parse(this.props.recurringTask.recurrence);
    let today = new Date;
    let result = {
      weekdays: [],
      month: 'January',
      starts: `${today.getFullYear()}-${('0' + (today.getMonth() + 1)).slice(-2)}-${('0' + today.getDate()).slice(-2)}`,
      interval: 2,
      monthday: 1
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
      result.weekdays = [];
      if (typeof recurrence.on === 'string') {
        result.weekdays.push(ChangeCase.titleCase(recurrence.on));
      } else {
        result.weekdays = recurrence.on.map((day) => ChangeCase.titleCase(day));
      }
    } else if (recurrence.every === 'month') {
      result.type = 'Monthly';
    } else if (recurrence.every === 'year') {
      result.type = 'Yearly';
      result.month = HandyTools.MONTHS[+recurrence.month - 1];
      result.monthday = recurrence.mday[0];
    }
    this.state = {
      recurrence: result,
      dateOptions: []
    };
  }

  componentDidMount() {
    HandyTools.setUpNiceSelect({
      selector: '.recurrence-modal select',
      func: Details.changeField.bind(this, this.changeFieldArgs())
    });
  }

  changeFieldArgs() {
    return {
      allErrors: [],
      errorsArray: []
    }
  }

  clickWeekdayCheckbox(e) {
    const ORDER = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    let clickedDay = e.target.dataset.day;
    let clickedDayValue = ORDER.indexOf(clickedDay);
    let recurrence = this.state.recurrence;
    let newWeekdays = [];
    if (e.target.checked) {
      let insertedClickedDay = false;
      recurrence.weekdays.forEach((day) => {
        if (ORDER.indexOf(day) < clickedDayValue) {
          newWeekdays.push(day);
        } else {
          if (!insertedClickedDay) {
            newWeekdays.push(clickedDay);
            insertedClickedDay = true;
          }
          newWeekdays.push(day);
        }
      })
      if (!insertedClickedDay) {
        newWeekdays.push(clickedDay);
      }
    } else {
      recurrence.weekdays.forEach((day) => {
        if (day !== clickedDay) {
          newWeekdays.push(day);
        }
      })
    }
    recurrence.weekdays = newWeekdays;
    this.setState({
      recurrence
    });
  }

  updateRecurrence() {
    if (this.state.recurrence.type === 'Daily (Interval)' && +this.state.recurrence.interval <= 1) {
      window.alert('Invalid Interval');
    } else if (this.state.recurrence.type === 'Weekly' && this.state.recurrence.weekdays.length === 0) {
      window.alert('You must select at least one day of the week');
    } else {
      this.props.updateRecurrence(this.state.recurrence);
    }
  }

  render() {
    this.getDateOptions.call(this);
    return(
      <div className="admin-modal recurrence-modal">
        <div className="white-box">
          <div className="row">
            <div className="col-xs-12">
              <h2>Type</h2>
              <select onChange={ () => {} } value={ this.state.recurrence.type } data-entity="recurrence" data-field="type">
                <option value="Daily">Daily</option>
                <option value="Daily (Interval)">Daily (Interval)</option>
                <option value="Weekly">Weekly</option>
                <option value="Monthly">Monthly</option>
                <option value="Yearly">Yearly</option>
              </select>
              { Details.renderDropdownFieldError([], []) }
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
        <>
          <div className="col-xs-5 second-row">
            <h2>Interval</h2>
            <input type="number" value={ this.state.recurrence.interval } onChange={ Details.changeField.bind(this, this.changeFieldArgs()) } data-entity="recurrence" data-field="interval" />
            { Details.renderFieldError([], []) }
          </div>
          <div className="col-xs-7 second-row">
            <h2>Next Occurrence</h2>
            <select onChange={ () => {} } value={ this.state.recurrence.type } data-entity="recurrence" data-field="type">
              <option value="Daily">Daily</option>
            </select>
            { Details.renderDropdownFieldError([], []) }
          </div>
        </>
      );
    } else if (this.state.recurrence.type === 'Weekly') {
      return(
        <div className="col-xs-12 second-row select-scroll-2">
          <h2>Weekdays</h2>
          <div className="weekday-checkboxes">
            <input id="sun" type="checkbox" checked={ this.state.recurrence.weekdays.indexOf("Sunday") > -1 } onChange={ this.clickWeekdayCheckbox.bind(this) } data-day="Sunday" /><label htmlFor="sun">Sun</label>
            <input id="mon" type="checkbox" checked={ this.state.recurrence.weekdays.indexOf("Monday") > -1 } onChange={ this.clickWeekdayCheckbox.bind(this) } data-day="Monday" /><label htmlFor="mon">Mon</label>
            <input id="tue" type="checkbox" checked={ this.state.recurrence.weekdays.indexOf("Tuesday") > -1 } onChange={ this.clickWeekdayCheckbox.bind(this) } data-day="Tuesday" /><label htmlFor="tue">Tue</label>
            <input id="wed" type="checkbox" checked={ this.state.recurrence.weekdays.indexOf("Wednesday") > -1 } onChange={ this.clickWeekdayCheckbox.bind(this) } data-day="Wednesday" /><label htmlFor="wed">Wed</label><br />
            <input id="thu" type="checkbox" checked={ this.state.recurrence.weekdays.indexOf("Thursday") > -1 } onChange={ this.clickWeekdayCheckbox.bind(this) } data-day="Thursday" /><label htmlFor="thu">Thu</label>
            <input id="fri" type="checkbox" checked={ this.state.recurrence.weekdays.indexOf("Friday") > -1 } onChange={ this.clickWeekdayCheckbox.bind(this) } data-day="Friday" /><label htmlFor="fri">Fri</label>
            <input id="sat" type="checkbox" checked={ this.state.recurrence.weekdays.indexOf("Saturday") > -1 } onChange={ this.clickWeekdayCheckbox.bind(this) } data-day="Saturday" /><label htmlFor="sat">Sat</label>
          </div>
        </div>
      );
    } else if (this.state.recurrence.type === 'Yearly') {
      return(
        <div>
          <div className="col-xs-7 second-row select-scroll-2">
            <h2>Month</h2>
            <select onChange={ () => {} } value={ this.state.recurrence.month } data-entity="recurrence" data-field="month">
              { HandyTools.MONTHS.map((month, index) => {
                return(
                  <option key={ index } value={ month }>{ month }</option>
                );
              }) }
            </select>
            { Details.renderDropdownFieldError([], []) }
          </div>
          <div className="col-xs-5 second-row select-scroll-2">
            <h2>Day</h2>
            <input type="number" value={ this.state.recurrence.monthday } onChange={ Details.changeField.bind(this, this.changeFieldArgs()) } data-entity="recurrence" data-field="monthday" />
            { Details.renderFieldError([], []) }
          </div>
        </div>
      );
    } else {
      return(
        <div className="col-xs-6">
          <div style={ { height: 119 } }>
          </div>
        </div>
      );
    }
  }

  getDateOptions() {
    const nextOccurrence = new Date(this.props.recurringTask.nextOccurrence);
    let today = new Date();
    today = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const daysUntilNext = ((nextOccurrence - today) / 1000 / 60 / 60 / 24);
    const daysAfterNext = +this.state.recurrence.interval - daysUntilNext - 1;
    let result = [];
    return result;
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
      func: Details.changeField.bind(this, this.changeFieldArgs())
    });
  }
}
