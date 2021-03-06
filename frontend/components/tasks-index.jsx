import React from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { Common, Index } from 'handy-components'
import HandyTools from 'handy-tools'
import TasksCommon from '../../app/assets/javascripts/common.jsx'
import TasksTimeframe from './tasks-timeframe.jsx'
import { fetchEntities, createEntity, fetchEntity, updateEntity, deleteEntity, rearrangeEntities, sendRequest } from '../actions/index'

class TasksIndex extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      fetching: true,
      tasks: {
        day: [],
        weekend: [],
        month: [],
        year: [],
        life: [],
        backlog: []
      }
    }
  }

  componentDidMount() {
    this.props.fetchEntities({ directory: 'tasks' }).then(() => {
      this.updateComponentTasks();
    });
  }

  createTask(args) {
    let { timeframe, parentId, color, position } = args;
    this.setState({
      fetching: true
    });
    this.props.createEntity({
      directory: 'tasks',
      additionalData: {
        timeframe,
        parentId,
        color,
        position
      }
    }).then(() => {
      this.updateComponentTasks();
    });
  }

  updateTask(newTask) {
    this.setState({
      fetching: true
    });
    this.props.updateEntity({
      url: 'api/tasks',
      entityName: 'task',
      entity: newTask
    }).then(() => {
      this.updateComponentTasks();
    });
  }

  copyTask(args) {
    let { duplicateOf, timeframe, position } = args;
    this.setState({
      fetching: true
    });
    this.props.createEntity({
      directory: 'tasks',
      additionalData: {
        duplicateOf,
        timeframe,
        position
      }
    }).then(() => {
      this.setState({
        fetching: false,
        tasks: this.props.tasks
      });
    }, () => {
      alert('A duplicate of this task already exists!');
      this.setState({
        fetching: false
      });
    });
  }

  moveTask(args) {
    let { timeframe, id } = args;
    this.setState({
      fetching: true
    });
    this.props.sendRequest({
      directory: `/api/tasks/${id}/move`,
      method: 'patch',
      data: {
        timeframe
      }
    }).then(() => {
      this.setState({
        fetching: false,
        tasks: this.props.tasks
      });
    });
  }

  rearrangeTasks(args) {
    this.setState({
      fetching: true
    });
    this.props.rearrangeEntities({
      directory: 'tasks',
      data: {
        tasks: args.newPositions
      }
    }).then(() => {
      this.updateComponentTasks();
    });
  }

  convertToFutureTask(args) {
    this.setState({
      fetching: true
    });
    this.props.sendRequest({
      directory: `/api/tasks/${args.id}/convert_to_future`,
      method: 'post'
    }).then(() => {
      this.setState({
        fetching: false,
        tasks: this.props.tasks
      });
    });
  }

  deleteTask(id) {
    this.setState({
      fetching: true
    });
    this.props.deleteEntity({
      id,
      directory: 'tasks',
      entityName: 'task'
    }).then(() => {
      this.updateComponentTasks();
    });
  }

  updateComponentTasks() {
    let tasks;
    let timeframeKeys = Object.keys(this.props.tasks);
    if (timeframeKeys.length === 1) {
      tasks = this.state.tasks;
      tasks[timeframeKeys[0]] = this.props.tasks[timeframeKeys[0]];
    } else {
      tasks = this.props.tasks;
    }
    this.setState({
      fetching: false,
      tasks
    });
  }

  render() {
    return(
      <div className="container widened-container">
        <div className="row">
          { this.renderTimeframes() }
        </div>
      </div>
    );
  }

  renderTimeframes() {
    return ['day', 'weekend', 'month', 'year', 'life', 'backlog'].map((timeframe) => {
      return(
        <div key={ timeframe } id={ `tasks-index-${timeframe}` } className="col-xs-12 col-md-4">
          <TasksTimeframe
            fetching={ this.state.fetching }
            timeframe={ timeframe }
            timeframeTasks={ this.state.tasks[timeframe] }
            createTask={ this.createTask.bind(this) }
            updateTask={ this.updateTask.bind(this) }
            convertToFutureTask={ this.convertToFutureTask.bind(this) }
            copyTask={ this.copyTask.bind(this) }
            moveTask={ this.moveTask.bind(this) }
            deleteTask={ this.deleteTask.bind(this) }
            rearrangeTasks={ this.rearrangeTasks.bind(this) }
          />
        </div>
      );
    });
  }

  componentDidUpdate() {
    $('.match-height').matchHeight();
  }
}

const mapStateToProps = (reducers) => {
  return reducers.standardReducer;
};

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ fetchEntities, createEntity, fetchEntity, updateEntity, deleteEntity, rearrangeEntities, sendRequest }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(TasksIndex);
