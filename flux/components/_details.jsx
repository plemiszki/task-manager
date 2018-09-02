import React from 'react';
import Modal from 'react-modal';
import HandyTools from 'handy-tools';
import ClientActions from '../actions/client-actions.js';
import ErrorsStore from '../stores/errors-store';
import Recurrence from './recurrence.jsx';

const ConfirmDeleteModalStyles = {
  overlay: {
    background: 'rgba(0, 0, 0, 0.50)'
  },
  content: {
    background: '#FFFFFF',
    margin: 'auto',
    maxWidth: 500,
    height: 217,
    border: 'solid 1px black',
    borderRadius: '6px',
    textAlign: 'center',
    color: '#5F5F5F',
    padding: '26px 20px'
  }
};

const RecurrenceModalStyles = {
  overlay: {
    background: 'rgba(0, 0, 0, 0.50)'
  },
  content: {
    background: '#FFFFFF',
    margin: 'auto',
    maxWidth: 300,
    height: 328,
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

  getErrors() {
    this.setState({
      fetching: false,
      errors: ErrorsStore.all()
    });
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
    }, function() {
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
      result = `{\"every\":\"week\",\"on\":\"${recurrence.weekday.toLowerCase()}\"}`;
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
    }, function() {
      if (this.checkForChanges) {
        this.setState({
          changesToSave: this.checkForChanges()
        });
      }
    });
  }

  convertToEnglish(input) {
    input = JSON.parse(input);
    var months = HandyTools.MONTHS;
    if (input.every) {
      if (input.every === 'day') {
        if (input.interval) {
          return `Every ${input.interval} days`;
        } else {
          return 'Daily';
        }
      } else if (input.every === 'week') {
        return `${HandyTools.capitalize(input.on)}s`;
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
    return(
      <div className={ `col-xs-${columnWidth}` + (entity.jointUserId ? ' hidden' : '') }>
        <h2>Color</h2>
        <div className="colors">
          <div className={ 'color' + (entity.color === 'rgb(234, 30, 30)' ? ' selected' : '') } onClick={ this.clickColor.bind(this) } style={{'backgroundColor': 'rgb(234, 30, 30)'}} ></div>
          <div className={ 'color' + (entity.color === 'rgb(255, 175, 163)' ? ' selected' : '') } onClick={ this.clickColor.bind(this) } style={{'backgroundColor': 'rgb(255, 175, 163)'}} ></div>
          <div className={ 'color' + (entity.color === 'rgb(255, 175, 36)' ? ' selected' : '') } onClick={ this.clickColor.bind(this) } style={{'backgroundColor': 'rgb(255, 175, 36)'}} ></div>
          <div className={ 'color' + (entity.color === 'rgb(238, 244, 66)' ? ' selected' : '') } onClick={ this.clickColor.bind(this) } style={{'backgroundColor': 'rgb(238, 244, 66)'}} ></div>
          <div className={ 'color' + (entity.color === 'rgb(30, 124, 33)' ? ' selected' : '') } onClick={ this.clickColor.bind(this) } style={{'backgroundColor': 'rgb(30, 124, 33)'}} ></div>
          <div className={ 'color' + (entity.color === 'rgb(111, 138, 240)' ? ' selected' : '') } onClick={ this.clickColor.bind(this) } style={{'backgroundColor': 'rgb(111, 138, 240)'}} ></div>
          <div className={ 'color' + (entity.color === 'rgb(181, 111, 240)' ? ' selected' : '') } onClick={ this.clickColor.bind(this) } style={{'backgroundColor': 'rgb(181, 111, 240)'}} ></div>
          <div className={ 'color' + (entity.color === 'rgb(175, 96, 26)' ? ' selected' : '') } onClick={ this.clickColor.bind(this) } style={{'backgroundColor': 'rgb(175, 96, 26)'}} ></div>
          <div className={ 'color' + (entity.color === 'rgb(210, 206, 200)' ? ' selected' : '') } onClick={ this.clickColor.bind(this) } style={{'backgroundColor': 'rgb(210, 206, 200)'}} ></div>
        </div>
        { HandyTools.renderFieldError([], []) }
      </div>
    );
  }

  renderButtons() {
    if (this.state.changesToSave) {
      var buttonText = "Save";
    } else {
      var buttonText = this.state.justSaved ? "Saved" : "No Changes";
    }
    return(
      <div>
        <a className={ "blue-button standard-width btn save-button" + HandyTools.renderDisabledButtonClass(this.state.fetching || !this.state.changesToSave) } onClick={ this.clickSave.bind(this) }>
          { buttonText }
        </a>
      </div>
    );
  }

  // renderModal(entity) {
  //   return(
  //     <Modal isOpen={ this.state.deleteModalOpen } onRequestClose={ this.closeModal.bind(this) } contentLabel="Modal" style={ ConfirmDeleteModalStyles }>
  //       <div className="admin-modal">
  //         <div className="confirm-delete">
  //           <h1>Are you sure you want to permanently delete this { entity }&#63;</h1>
  //           <a className="btn red-button" onClick={ this.confirmDelete.bind(this) }>
  //             Yes
  //           </a>
  //           <a className="btn gray-outline-button" onClick={ this.closeModal.bind(this) }>
  //             No
  //           </a>
  //         </div>
  //       </div>
  //     </Modal>
  //   );
  // }

  renderRecurrenceModal() {
    return(
      <Modal isOpen={ this.state.recurrenceModalOpen } onRequestClose={ this.closeModal.bind(this) } contentLabel="Modal" style={ RecurrenceModalStyles }>
        <Recurrence recurringTask={ this.state.recurringTask } updateRecurrence={ this.updateRecurrence.bind(this) } />
      </Modal>
    );
  }

  componentDidUpdate() {
    // $('.match-height-layout').matchHeight();
  }
}
