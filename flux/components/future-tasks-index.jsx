var React = require('react');
var ClientActions = require('../actions/client-actions.js');
var FutureTasksStore = require('../stores/future-tasks-store.js');

var FutureTasksIndex = React.createClass({

  getInitialState: function() {
    return({
      fetching: true,
      tasks: []
    });
  },

  componentDidMount: function() {
    this.tasksListener = FutureTasksStore.addListener(this.getFutureTasks);
    ClientActions.fetchFutureTasks();
  },

  getFutureTasks: function() {
    this.setState({
      fetching: false,
      tasks: FutureTasksStore.all()
    });
  },

  getError: function() {
    this.setState({
      fetching: false
    });
  },

  clickAddButton: function(event) {
    // event.preventDefault();
    // this.setState({
    //   fetching: true
    // });
    // ClientActions.addTask(this.props.timeframe);
  },

  deleteTask: function(task) {
    this.setState({
      fetching: true
    });
    ClientActions.deleteTask(task);
  },

  render: function() {
    return(
      <div className="container">
        <div className="row">
          <div className="col-xs-12">
            <a className="btn btn-info" rel="nofollow" href="/">Home</a>
            <h1>Future Tasks</h1>
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Text</th>
                  <th>Timeframe</th>
                  <th>Color</th>
                </tr>
              </thead>
              <tbody>
                <tr className="below-header"><td></td><td></td><td></td><td></td></tr>
                {this.state.tasks.map(function(task) {
                  return(
                    <tr key={ task.id }>
                      <td>{ task.date }</td>
                      <td>{ task.text }</td>
                      <td>{ task.timeframe }</td>
                      <td>{ task.color }</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            <div className="btn btn-primary">Add New</div>
          </div>
        </div>
      </div>
    )
  }
});

module.exports = FutureTasksIndex;
