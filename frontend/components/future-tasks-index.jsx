import React, { useState, useEffect } from 'react'
import { GrayedOut, Spinner, deleteEntity } from 'handy-components'
import Modal from 'react-modal'
import Moment from 'moment'
import FutureTaskNew from './future-task-new.jsx'

const ModalStyles = {
  overlay: {
    background: 'rgba(0, 0, 0, 0.50)'
  },
  content: {
    background: '#F5F6F7',
    padding: 0,
    margin: 'auto',
    maxWidth: 1000,
    height: 321
  }
};

export default function FutureTasksIndex() {

  const [spinner, setSpinner] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [futureTasks, setFutureTasks] = useState([])

  useEffect(() => {
    fetch(`/api/future_tasks`)
      .then(data => data.json())
      .then((response) => {
        setFutureTasks(response.futureTasks)
        setSpinner(false)
      });
  }, [])

  const deleteFutureTask = (id) => {
    setSpinner(true);
    deleteEntity({
      directory: 'future_tasks',
      id,
    }).then((response) => {
      const { futureTasks } = response;
      setFutureTasks(futureTasks);
      setModalOpen(false);
      setSpinner(false);
    });
  };

  return (
    <div className="handy-component container widened-container index-component">
      <div className="row">
        <div className="col-xs-12">
          <div className="white-box">
            <h1>Future Tasks</h1>
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Text</th>
                  <th>Time Frame</th>
                  <th>Position</th>
                  <th>Color</th>
                  <th className="x-button-column"></th>
                </tr>
              </thead>
              <tbody>
                <tr className="below-header"><td></td><td></td><td></td><td></td><td></td></tr>
                { futureTasks.map((task) => {
                  const { text, timeframe, addToEnd, color, id, date } = task;
                  return(
                    <tr key={ id }>
                      <td>{ Moment(date).format('l') }</td>
                      <td>{ text }</td>
                      <td>{ timeframe }</td>
                      <td>{ addToEnd ? "End" : "Beginning" }</td>
                      <td><div className="swatch" style={ { backgroundColor: color } }></div></td>
                      <td><div className="x-button" onClick={ () => deleteFutureTask(id) }></div></td>
                    </tr>
                  );
                }) }
              </tbody>
            </table>
            <div className="btn btn-info" onClick={ () => setModalOpen(true) }>Add New</div>
            <GrayedOut visible={ spinner } />
            <Spinner visible={ spinner } />
          </div>
        </div>
      </div>
      <Modal isOpen={ modalOpen } onRequestClose={ () => setModalOpen(false) } contentLabel="Modal" style={ ModalStyles }>
        <FutureTaskNew
          afterCreate={ (futureTasks) => {
            setFutureTasks(futureTasks);
            setModalOpen(false);
          } }
        />
      </Modal>
    </div>
  );
}
