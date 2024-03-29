import React from 'react'
import Modal from 'react-modal'
import { GrayedOut, Spinner, fetchEntities, deleteEntity, rearrangeFields, sendRequest, Common, updateEntity } from 'handy-components'
import { capitalize } from 'lodash'
import RecurringTaskNew from './recurring-task-new'

const ModalStyles = {
  overlay: {
    background: 'rgba(0, 0, 0, 0.50)'
  },
  content: {
    background: '#F5F6F7',
    padding: 0,
    margin: 'auto',
    maxWidth: 1270,
    height: 343,
  }
};

const TIMEFRAMES_FRONT_TO_BACK = {
  daily: 'Day',
  weekend: 'Weekend',
  monthly: 'Month'
}

export default class RecurringTasksIndex extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      modalOpen: false,
      spinner: true,
      dailyTasks: [],
      weekendTasks: [],
      monthlyTasks: [],
    }
  }

  componentDidMount() {
    fetchEntities({ directory: 'recurring_tasks' }).then((response) => {
      const { dailyTasks, weekendTasks, monthlyTasks } = response;
      this.setState({
        spinner: false,
        dailyTasks,
        weekendTasks,
        monthlyTasks,
      });
    });
  }

  clickTask(e) {
    const classList = e.target.classList;
    if (classList.contains('x-button')) {
      this.setState({
        spinner: true,
      });
      deleteEntity({
        directory: 'recurring_tasks',
        id: e.target.parentElement.parentElement.dataset.id
      }).then((response) => {
        const { dailyTasks, weekendTasks, monthlyTasks } = response;
        this.setState({
          spinner: false,
          dailyTasks,
          weekendTasks,
          monthlyTasks,
        });
      });
    } else if (classList.contains('handle') || classList.contains('oval') || classList.contains('switch')) {
      // do nothing
    } else {
      window.location.pathname = `/recurring_tasks/${e.target.parentElement.dataset.id}`
    }
  }

  mouseDownHandle(e) {
    $('*').addClass('grabbing');
    let row = e.target.parentElement.parentElement;
    row.classList.add('grabbed-element');
    let section = e.target.parentElement.parentElement.parentElement.parentElement;
    section.classList.add('grab-section');
  }

  mouseUpHandle(e) {
    $('*').removeClass('grabbing');
    let row = e.target.parentElement.parentElement;
    row.classList.remove('grabbed-element');
    let section = e.target.parentElement.parentElement.parentElement.parentElement;
    section.classList.remove('grab-section');
  }

  canIDrop($e) {
    let draggedRow = $e[0];
    let draggedIndex = +draggedRow.dataset.index;
    let draggedSection = draggedRow.dataset.section;
    if (draggedSection !== this.dataset.section) {
      return false;
    }
    let dropZoneIndex = +this.dataset.index;
    let difference = Math.abs(draggedIndex - dropZoneIndex);
    if (difference >= 2 || (difference === 1 && draggedIndex < dropZoneIndex)) {
      return true;
    } else {
      return false;
    }
  }

  dragOverHandler(e) {
    e.target.classList.add('highlight');
  }

  dragOutHandler(e) {
    e.target.classList.remove('highlight');
  }

  dragEndHandler() {
    $('*').removeClass('grabbing');
    $('body').removeAttr('style');
    $('tr.grabbed-element').removeClass('grabbed-element');
    $('tr.highlight').removeClass('highlight');
  }

  dropHandler(e, ui) {
    let draggedIndex = ui.draggable[0].dataset.index;
    let dropZoneIndex = e.target.dataset.index;
    let currentOrder = {};
    switch (e.target.dataset.section) {
      case 'daily':
        this.state.dailyTasks.forEach((task) => {
          currentOrder[task.position] = task.id;
        });
        break;
      case 'weekend':
        this.state.weekendTasks.forEach((task) => {
          currentOrder[task.position] = task.id;
        });
        break;
      case 'monthly':
        this.state.monthlyTasks.forEach((task) => {
          currentOrder[task.position] = task.id;
        });
    }
    const newOrder = rearrangeFields({ currentOrder, draggedIndex, dropZoneIndex });
    this.setState({
      spinner: true,
    });
    sendRequest('/api/recurring_tasks/rearrange', {
      method: 'PATCH',
      data: {
        new_order: newOrder,
        timeframe: TIMEFRAMES_FRONT_TO_BACK[e.target.dataset.section],
      },
    }).then((response) => {
      const { dailyTasks, weekendTasks, monthlyTasks } = response;
      this.setState({
        spinner: false,
        dailyTasks,
        weekendTasks,
        monthlyTasks,
      });
    });
  }

  afterCreate(response) {
    const { dailyTasks, weekendTasks, monthlyTasks } = response;
    this.setState({
      spinner: false,
      modalOpen: false,
      dailyTasks,
      weekendTasks,
      monthlyTasks,
    });
  }

  render() {
    const { spinner, modalOpen } = this.state;
    return (
      <div className="handy-component container widened-container index-component">
        <div className="row">
          <div className="col-xs-12">
            <div className="white-box">
              { this.renderTable('daily') }
              { this.renderTable('weekend') }
              { this.renderTable('monthly') }
              <div className="btn btn-success" onClick={ () => this.setState({ modalOpen: true }) }>Add New</div>
              <Spinner visible={ spinner } />
              <GrayedOut visible={ spinner } />
            </div>
          </div>
        </div>
        <Modal isOpen={ modalOpen } onRequestClose={ () => this.setState({ modalOpen: false }) } contentLabel="Modal" style={ ModalStyles }>
          <RecurringTaskNew afterCreate={ (response) => this.afterCreate(response) } />
        </Modal>
      </div>
    );
  }

  renderTable(timeframe) {
    return (
      <div>
        <h1>{ capitalize(timeframe) } Recurring Tasks</h1>
        <table className="extra-margin">
          <thead>
            <tr className="headers">
              <th>Text</th>
              <th>Frequency</th>
              <th>Position</th>
              <th>Expires</th>
              <th>Color</th>
              <th>Active</th>
              <th></th>
              <th className="x-button-column"></th>
            </tr>
          </thead>
          <tbody>
            <tr className="below-header"><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
            <tr className="drop-zone" data-index="-1" data-section={ timeframe }><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
            { this.state[timeframe.toLowerCase() + "Tasks"].map((task, index) => {
              var backgroundColor = (task.jointUserId ? 'rgb(0,0,0)' : task.color);
              return([
                <tr key={ task.id } className={ task.active ? '' : 'inactive' } onClick={ this.clickTask.bind(this) } data-id={ task.id } data-index={ index } data-section={ timeframe }>
                  <td>{ task.text }</td>
                  <td>{ task.recurrence }</td>
                  <td>{ task.addToEnd ? "End" : "Beginning" }</td>
                  <td>{ task.expires ? "Yes" : "No" }</td>
                  <td><div className="swatch" style={ { backgroundColor } }></div></td>
                  <td>{ Common.renderSwitchComponent({
                    onChange: () => {
                      task.active = !task.active;
                      this.setState({
                        spinner: true,
                      });
                      sendRequest('/api/recurring_tasks/toggle_active', {
                        method: 'PATCH',
                        data: {
                          id: task.id,
                        },
                      }).then((response) => {
                        const { dailyTasks, weekendTasks, monthlyTasks } = response;
                        this.setState({
                          spinner: false,
                          dailyTasks,
                          weekendTasks,
                          monthlyTasks,
                        });
                      });
                    },
                    color: '5cb85c',
                    height: 17,
                    width: 30,
                    circleSize: 9,
                    inputClassName: 'switch',
                    checked: task.active,
                  }) }</td>
                  <td><div className="handle" onMouseDown={ this.mouseDownHandle.bind(this) } onMouseUp={ this.mouseUpHandle.bind(this) }></div></td>
                  <td><div className="x-button"></div></td>
                </tr>,
                <tr key={ `${task.id}-drop` } className="drop-zone" data-index={ index } data-section={ timeframe }>
                  <td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>
                </tr>
              ]);
            }) }
          </tbody>
        </table>
        { this.renderLine(timeframe === "daily" || timeframe === "weekend") }
      </div>
    );
  }

  renderLine(condition) {
    if (condition) {
      return (
        <hr />
      );
    }
  }

  componentDidUpdate() {
    $("tr:not('.headers, .below-header, .drop-zone')").draggable({
      cursor: '-webkit-grabbing',
      handle: '.handle',
      helper: function() { return '<div></div>'; },
      stop: this.dragEndHandler.bind(this),
    });
    $('tr.drop-zone').droppable({
      accept: this.canIDrop,
      tolerance: 'pointer',
      over: this.dragOverHandler,
      out: this.dragOutHandler,
      drop: this.dropHandler.bind(this),
    });
  }
};
