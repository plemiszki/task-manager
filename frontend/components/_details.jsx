import React from 'react'
import Modal from 'react-modal'
import { Details } from 'handy-components'
import HandyTools from 'handy-tools'
import Recurrence from './recurrence.jsx'
import { titleCase } from 'title-case'
import { lowerCase } from 'lower-case'

const RecurrenceModalStyles = {
  overlay: {
    background: 'rgba(0, 0, 0, 0.50)'
  },
  content: {
    background: '#FFFFFF',
    margin: 'auto',
    maxWidth: 300,
    height: 348,
    border: 'solid 1px black',
    borderRadius: '6px',
    padding: 0
  }
};

export default class _Details extends React.Component {
  constructor(props) {
    super(props);
  }

  defaultState() {
    return {
      changesToSave: false,
      recurrenceModalOpen: false,
      errors: [],
      fetching: true,
      justSaved: false
    };
  }

  closeModal() {
    this.setState({
      deleteModalOpen: false,
      recurrenceModalOpen: false
    });
  }

  clickColor(e) {
    let entity = this.state.recurringTask || this.state.futureTask;
    entity.color = e.target.style.backgroundColor;
    this.setState({
      [this.state.recurringTask ? 'recurringTask' : 'futureTask']: entity
    }, () => {
      if (this.checkForChanges) {
        var changesToSave = this.checkForChanges();
        this.setState({
          changesToSave: changesToSave
        });
      }
    });
  }

  editRecurrence() {
    this.setState({
      recurrenceModalOpen: true
    });
  }

  updateRecurrence(recurrence) {
    let result;
    if (recurrence.type === 'Daily') {
      result = "{\"every\":\"day\"}";
    } else if (recurrence.type === 'Daily (Interval)') {
      result = `{\"every\":\"day\",\"starts\":\"${recurrence.starts}\",\"interval\":${recurrence.interval}}`;
    } else if (recurrence.type === 'Weekly') {
      result = `{\"every\":\"week\",\"on\":[${recurrence.weekdays.map((day) => `\"${lowerCase(day)}\"`).join(',')}]}`;
    } else if (recurrence.type === 'Monthly') {
      result = "{\"every\":\"month\",\"mday\":[1]}";
    } else if (recurrence.type === 'Yearly') {
      let n = HandyTools.MONTHS.indexOf(recurrence.month);
      result = `{\"every\":\"year\",\"mday\":[${recurrence.monthday}],\"month\":[${n + 1}]}`;
    }
    let recurringTask = this.state.recurringTask;
    recurringTask.recurrence = result;
    this.setState({
      recurrenceModalOpen: false,
      recurringTask: recurringTask
    }, () => {
      if (this.checkForChanges) {
        this.setState({
          changesToSave: this.checkForChanges()
        });
      }
    });
  }

  convertToEnglish(task) {
    let input = JSON.parse(task.recurrence);
    const months = HandyTools.MONTHS;
    if (input.every) {
      if (input.every === 'day') {
        if (input.interval) {
          return `Every ${input.interval} days - next on ${input.starts.slice(5).replace('-', '/')}`;
        } else {
          return 'Daily';
        }
      } else if (input.every === 'week') {
        if (typeof input.on === 'string') {
          return `${HandyTools.capitalize(input.on)}s`;
        } else {
          return input.on.map((day) => `${titleCase(day)}s`).join(', ');
        }
      } else if (input.every === 'month') {
        return 'Monthly';
      } else if (input.every === 'year') {
        if (input.mday[0] !== 1) {
          return `Every ${months[input.month[0] - 1]} ${HandyTools.ordinatize(input.mday[0])}`;
        } else {
          return `Every ${months[input.month[0] - 1]}`;
        }
      } else {
        return 'Custom';
      }
    } else {
      return 'Custom';
    }
  }

  renderColorField(columnWidth) {
    let entity = this.state.recurringTask || this.state.futureTask;
    return (
      <div className={ `col-xs-${columnWidth}` + (entity.jointUserId ? ' hidden' : '') }>
        <h2>Color</h2>
        <div className="colors">
          <div className={ 'color' + (entity.color === 'rgb(234, 30, 30)' ? ' selected' : '') } onClick={ this.clickColor.bind(this) } style={{'backgroundColor': 'rgb(234, 30, 30)'}} ></div>
          <div className={ 'color' + (entity.color === 'rgb(255, 175, 163)' ? ' selected' : '') } onClick={ this.clickColor.bind(this) } style={{'backgroundColor': 'rgb(255, 175, 163)'}} ></div>
          <div className={ 'color' + (entity.color === 'rgb(255, 175, 36)' ? ' selected' : '') } onClick={ this.clickColor.bind(this) } style={{'backgroundColor': 'rgb(255, 175, 36)'}} ></div>
          <div className={ 'color' + (entity.color === 'rgb(238, 244, 66)' ? ' selected' : '') } onClick={ this.clickColor.bind(this) } style={{'backgroundColor': 'rgb(238, 244, 66)'}} ></div>
          <div className={ 'color' + (entity.color === 'rgb(92, 184, 92)' ? ' selected' : '') } onClick={ this.clickColor.bind(this) } style={{'backgroundColor': 'rgb(92, 184, 92)'}} ></div>
          <div className={ 'color' + (entity.color === 'rgb(111, 138, 240)' ? ' selected' : '') } onClick={ this.clickColor.bind(this) } style={{'backgroundColor': 'rgb(111, 138, 240)'}} ></div>
          <div className={ 'color' + (entity.color === 'rgb(181, 111, 240)' ? ' selected' : '') } onClick={ this.clickColor.bind(this) } style={{'backgroundColor': 'rgb(181, 111, 240)'}} ></div>
          <div className={ 'color' + (entity.color === 'rgb(175, 96, 26)' ? ' selected' : '') } onClick={ this.clickColor.bind(this) } style={{'backgroundColor': 'rgb(175, 96, 26)'}} ></div>
          <div className={ 'color' + (entity.color === 'rgb(210, 206, 200)' ? ' selected' : '') } onClick={ this.clickColor.bind(this) } style={{'backgroundColor': 'rgb(210, 206, 200)'}} ></div>
        </div>
        { Details.renderFieldError([], []) }
      </div>
    );
  }

  renderButtons() {
    let buttonText;
    if (this.state.changesToSave) {
      buttonText = 'Save';
    } else {
      buttonText = this.state.justSaved ? 'Saved' : 'No Changes';
    }
    return (
      <div>
        <a className={ "blue-button standard-width btn save-button" + HandyTools.renderDisabledButtonClass(this.state.fetching || !this.state.changesToSave) } onClick={ this.clickSave.bind(this) }>
          { buttonText }
        </a>
      </div>
    );
  }

  renderRecurrenceModal() {
    return(
      <Modal isOpen={ this.state.recurrenceModalOpen } onRequestClose={ this.closeModal.bind(this) } contentLabel="Modal" style={ RecurrenceModalStyles }>
        <Recurrence recurringTask={ this.state.recurringTask } updateRecurrence={ this.updateRecurrence.bind(this) } />
      </Modal>
    );
  }
}
