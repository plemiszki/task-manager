import React from 'react'
import Moment from 'moment'
import { Common, Details } from 'handy-components'
import HandyTools from 'handy-tools'
import ErrorsStore from '../stores/errors-store.js'
import ClientActions from '../actions/client-actions.js'
import DetailsComponent from './_details.jsx'
import { ERRORS } from '../errors.js'

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
        date: (Moment().add(1, 'days').format('l'))
      },
      errors: []
    };
  }

  componentDidMount() {
    this.errorsListener = ErrorsStore.addListener(this.getErrors.bind(this));
    HandyTools.setUpNiceSelect({ selector: 'select', func: Details.changeField.bind(this, this.changeFieldArgs()) });
  }

  componentWillUnmount() {
    this.errorsListener.remove();
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
    ClientActions.standardCreate('future_tasks', 'future_task', this.state.futureTask);
  }

  render() {
    return(
      <div id="future-task-new" className="admin-modal">
          <div className="white-box">
            { Common.renderSpinner(this.state.fetching) }
            { Common.renderGrayedOut(this.state.fetching, -26, -26, 6) }
            <div className="row">
              <div className="col-xs-3">
                <h2>Date</h2>
                <input className={ Details.errorClass(this.state.errors, ERRORS.date) } onChange={ Details.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.futureTask.date || "" } data-entity="futureTask" data-field="date" />
                { Details.renderFieldError(this.state.errors, ERRORS.date) }
              </div>
              <div className="col-xs-9">
                <h2>Text</h2>
                <input className={ Details.errorClass(this.state.errors, ERRORS.text) } onChange={ Details.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.futureTask.text || "" } data-entity="futureTask" data-field="text" />
                { Details.renderFieldError(this.state.errors, ERRORS.text) }
              </div>
            </div>
            <div className="row">
              <div className="col-xs-3 select-scroll-2">
                <h2>Time Frame</h2>
                <select onChange={ function() {} } data-entity="futureTask" data-field="timeframe">
                  <option>Day</option>
                  <option>Weekend</option>
                  <option>Month</option>
                  <option>Year</option>
                </select>
                { Details.renderFieldError([], []) }
              </div>
              <div className="col-xs-3">
                <h2>Position</h2>
                <select onChange={ function() {} } value={ HandyTools.convertBooleanToTFString(this.state.futureTask.addToEnd) } data-entity="futureTask" data-field="addToEnd">
                  <option value={ "f" }>Beginning</option>
                  <option value={ "t" }>End</option>
                </select>
                { Details.renderFieldError([], []) }
              </div>
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
