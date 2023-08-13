import React from 'react'
import { Details, setUpNiceSelect, resetNiceSelect } from 'handy-components'
import HandyTools from 'handy-tools'
import { titleCase } from 'title-case'

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
        result.weekdays.push(titleCase(recurrence.on));
      } else {
        result.weekdays = recurrence.on.map((day) => titleCase(day));
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
      dateOptions: [],
      errors: [],
    };
  }

  componentDidMount() {
    setUpNiceSelect({ selector: '.recurrence-modal select', func: Details.changeDropdownField.bind(this) });
  }

  changeFieldArgs() {
    return {
      entity: 'recurrence',
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
    const { recurrence } = this.state;
    if (recurrence.type === 'Daily (Interval)' && +recurrence.interval <= 1) {
      window.alert('Invalid Interval');
    } else if (recurrence.type === 'Weekly' && recurrence.weekdays.length === 0) {
      window.alert('You must select at least one day of the week');
    } else {
      this.props.updateRecurrence(recurrence);
    }
  }

  render() {
    const { recurrence } = this.state;
    return (
      <>
        <div className="admin-modal recurrence-modal handy-component">
          <div className="white-box">
            <div className="row">
              <div className="col-xs-12">
                <h2>Type</h2>
                <select onChange={ () => {} } value={ recurrence.type } data-entity="recurrence" data-field="type">
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
        <style jsx>{`
          a.btn, a.btn:hover {
            color: white;
          }
        `}</style>
      </>
    );
  }

  renderSecondRow() {
    const { recurrence } = this.state;
    if (recurrence.type === 'Daily (Interval)') {
      return (
        <>
          { Details.renderField.bind(this)({ columnWidth: 5, entity: 'recurrence', property: 'interval', containerClassSuffix: 'second-row' }) }
          <div className="col-xs-7 second-row select-scroll-2">
            <h2>Next Occurrence</h2>
            { this.renderDateOptions() }
            { Details.renderDropdownFieldError([], []) }
          </div>
        </>
      );
    } else if (recurrence.type === 'Weekly') {
      return (
        <div className="col-xs-12 second-row select-scroll-2">
          <h2>Weekdays</h2>
          <div className="weekday-checkboxes">
            <input id="sun" type="checkbox" checked={ recurrence.weekdays.indexOf("Sunday") > -1 } onChange={ this.clickWeekdayCheckbox.bind(this) } data-day="Sunday" /><label htmlFor="sun">Sun</label>
            <input id="mon" type="checkbox" checked={ recurrence.weekdays.indexOf("Monday") > -1 } onChange={ this.clickWeekdayCheckbox.bind(this) } data-day="Monday" /><label htmlFor="mon">Mon</label>
            <input id="tue" type="checkbox" checked={ recurrence.weekdays.indexOf("Tuesday") > -1 } onChange={ this.clickWeekdayCheckbox.bind(this) } data-day="Tuesday" /><label htmlFor="tue">Tue</label>
            <input id="wed" type="checkbox" checked={ recurrence.weekdays.indexOf("Wednesday") > -1 } onChange={ this.clickWeekdayCheckbox.bind(this) } data-day="Wednesday" /><label htmlFor="wed">Wed</label><br />
            <input id="thu" type="checkbox" checked={ recurrence.weekdays.indexOf("Thursday") > -1 } onChange={ this.clickWeekdayCheckbox.bind(this) } data-day="Thursday" /><label htmlFor="thu">Thu</label>
            <input id="fri" type="checkbox" checked={ recurrence.weekdays.indexOf("Friday") > -1 } onChange={ this.clickWeekdayCheckbox.bind(this) } data-day="Friday" /><label htmlFor="fri">Fri</label>
            <input id="sat" type="checkbox" checked={ recurrence.weekdays.indexOf("Saturday") > -1 } onChange={ this.clickWeekdayCheckbox.bind(this) } data-day="Saturday" /><label htmlFor="sat">Sat</label>
          </div>
        </div>
      );
    } else if (recurrence.type === 'Yearly') {
      return (
        <div>
          <div className="col-xs-7 second-row select-scroll-2">
            <h2>Month</h2>
            <select onChange={ () => {} } value={ recurrence.month } data-entity="recurrence" data-field="month">
              { HandyTools.MONTHS.map((month, index) => {
                return(
                  <option key={ index } value={ month }>{ month }</option>
                );
              }) }
            </select>
            { Details.renderDropdownFieldError([], []) }
          </div>
          { Details.renderField.bind(this)({ columnWidth: 5, entity: 'recurrence', property: 'monthday', containerClassSuffix: 'second-row', maxOptions: 2, columnHeader: 'Day' }) }
        </div>
      );
    } else {
      return (
        <div className="col-xs-6">
          <div style={ { height: 119 } }>
          </div>
        </div>
      );
    }
  }

  renderDateOptions() {
    const { recurrence } = this.state;
    const dateOptions = this.getDateOptions.call(this);
    return(
      <select onChange={ () => {} } value={ recurrence.starts } data-entity="recurrence" data-field="starts">
        { dateOptions.map((dateOption, index) => {
          return (
            <option key={ index } value={ HandyTools.stringifyDateWithHyphens(dateOption) }>{ HandyTools.stringifyDate(dateOption) }</option>
          );
        }) }
      </select>
    );
  }

  getDateOptions() {
    const { recurrence } = this.state;
    const today = HandyTools.stripTimeFromDate(new Date());
    let result = [];
    for (let i = 0; i < +recurrence.interval; i++) {
      const date = HandyTools.addDaysToDate(today, i);
      result.push(date);
    }
    return result;
  }

  componentWillUpdate(nextProps, nextState) {
    if (['Daily', 'Daily (Interval)', 'Monthly'].indexOf(nextState.recurrence.type) > -1) {
      var $dropDownsToDestroy = $('.recurrence-modal .second-row select');
      $dropDownsToDestroy.niceSelect('destroy');
    }
  }

  componentDidUpdate() {
    resetNiceSelect({ selector: '.recurrence-modal .second-row select', func: Details.changeDropdownField.bind(this) });
  }
}
