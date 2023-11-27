import React from 'react'
import Modal from 'react-modal'
import { SaveButton, Details, Common, deepCopy, objectsAreEqual, fetchEntity, updateEntity, Spinner, GrayedOut, ListBoxReorderable, createEntity, deleteEntity } from 'handy-components'
import NewEntity from './new-entity'

export default class ListDetails extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      spinner: true,
      list: {},
      listSaved: {},
      listItems: [],
      errors: {},
      changesToSave: false,
      justSaved: false,
      deleteModalOpen: false,
      newItemModalOpen: false,
    };
  }

  componentDidMount() {
    fetchEntity().then((response) => {
      const { list, listItems } = response;
      this.setState({
        spinner: false,
        list,
        listSaved: deepCopy(list),
        listItems,
      });
    });
  }

  checkForChanges() {
    const { list, listSaved } = this.state;
    return !objectsAreEqual(list, listSaved);
  }

  changeFieldArgs() {
    return {
      changesFunction: this.checkForChanges.bind(this),
    }
  }

  clickAddItem() {
    this.setState({
      itemsModalOpen: true,
    });
  }

  clickDeleteItem(id) {
    this.setState({
      spinner: true,
    });
    deleteEntity({
      directory: 'list_items',
      id,
    }).then((response) => {
      const { listItems } = response;
      this.setState({
        spinner: false,
        listItems,
      });
    });
  }

  selectItem(option) {
    const { list } = this.state;
    this.setState({
      itemsModalOpen: false,
      spinner: true,
    });
    createEntity({
      directory: 'list_items',
      entityName: 'list_item',
      entity: {
        listId: list.id,
      }
    }).then((response) => {
      const { listItems } = response;
      this.setState({
        spinner: false,
        listItems,
      });
    });
  }

  clickSave() {
    this.setState({
      spinner: true,
      justSaved: true,
    }, () => {
      const { list } = this.state;
      updateEntity({
        entityName: 'list',
        entity: list,
      }).then((response) => {
        const { list } = response;
        this.setState({
          spinner: false,
          list,
          listSaved: deepCopy(list),
          changesToSave: false,
        });
      }, (response) => {
        const { errors } = response;
        this.setState({
          spinner: false,
          errors,
        });
      });
    });
  }

  render() {
    const { justSaved, changesToSave, spinner, listItems, newItemModalOpen, list } = this.state;
    return (
      <>
        <div className="handy-component">
          <h1>Edit List</h1>
          <div className="white-box">
            <div className="row">
              { Details.renderField.bind(this)({ columnWidth: 6, entity: 'list', property: 'name' }) }
            </div>
            <div className="row">
              <div className="col-xs-12">
                <p className="section-header">Items</p>
                <ListBoxReorderable
                  entityName="listItem"
                  entities={ listItems }
                  clickAdd={ () => { this.setState({ newItemModalOpen: true }) } }
                  clickDelete={ listItemId => this.clickDeleteItem(listItemId) }
                  displayProperty="text"
                  style={ { marginBottom: 15 } }
                />
              </div>
            </div>
            <hr />
            <SaveButton
              justSaved={ justSaved }
              changesToSave={ changesToSave }
              disabled={ spinner }
              onClick={ () => { this.clickSave() } }
            />
            <GrayedOut visible={ spinner } />
            <Spinner visible={ spinner } />
          </div>
        </div>
        <Modal isOpen={ newItemModalOpen } onRequestClose={ Common.closeModals.bind(this) } contentLabel="Modal" style={ Common.newEntityModalStyles({ width: 500 }, 1) }>
          <NewEntity
            entityName="listItem"
            initialEntity={ { text: '', listId: list.id } }
            callback={ listItems => this.setState({ listItems, newItemModalOpen: false, spinner: false }) }
            responseKey="listItems"
            buttonText="Add Item"
          />
        </Modal>
      </>
    );
  }
};
