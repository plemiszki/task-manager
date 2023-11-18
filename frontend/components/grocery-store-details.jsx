import React from 'react'
import { Common, BottomButtons, Details, deepCopy, objectsAreEqual, fetchEntity, createEntity, updateEntity, deleteEntity, Spinner, GrayedOut, OutlineButton, ModalSelect, ListBox } from 'handy-components'

export default class GroceryStoreDetails extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      spinner: true,
      groceryStore: {},
      groceryStoreSaved: {},
      errors: {},
      changesToSave: false,
      justSaved: false,
      deleteModalOpen: false,
    };
  }

  componentDidMount() {
    fetchEntity().then((response) => {
      const { groceryStore } = response;
      this.setState({
        spinner: false,
        groceryStore,
        groceryStoreSaved: deepCopy(groceryStore),
      });
    });
  }

  clickSave() {
    this.setState({
      spinner: true,
      justSaved: true,
    }, () => {
      const { groceryStore } = this.state;
      updateEntity({
        entityName: 'groceryStore',
        entity: groceryStore,
      }).then((response) => {
        const { groceryStore } = response;
        this.setState({
          spinner: false,
          groceryStore,
          groceryStoreSaved: deepCopy(groceryStore),
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

  checkForChanges() {
    const { groceryStore, groceryStoreSaved } = this.state;
    return !objectsAreEqual(groceryStore, groceryStoreSaved);
  }

  changeFieldArgs() {
    return {
      changesFunction: this.checkForChanges.bind(this)
    }
  }

  render() {
    const { justSaved, changesToSave, spinner } = this.state;
    return (
      <>
        <div className="handy-component">
          <h1>Grocery Store Details</h1>
          <div className="white-box">
            <div className="row">
              { Details.renderField.bind(this)({ columnWidth: 12, entity: 'groceryStore', property: 'name' }) }
            </div>
            <BottomButtons
              entityName="groceryStore"
              confirmDelete={ Details.confirmDelete.bind(this) }
              justSaved={ justSaved }
              changesToSave={ changesToSave }
              disabled={ spinner }
              clickSave={ () => { this.clickSave() } }
            />
            <GrayedOut visible={ spinner } />
            <Spinner visible={ spinner } />
          </div>
        </div>
        {/* <ModalSelect
          isOpen={ this.state.itemsModalOpen }
          onClose={ Common.closeModals.bind(this) }
          options={ groceryItems }
          property="name"
          func={ this.selectItem.bind(this) }
        /> */}
      </>
    );
  }
}
