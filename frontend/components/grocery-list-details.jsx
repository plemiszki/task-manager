import React from 'react'
import { Common, BottomButtons, Details, deepCopy, objectsAreEqual, fetchEntity, createEntity, updateEntity, deleteEntity, Spinner, GrayedOut, OutlineButton, ModalSelect, ListBox } from 'handy-components'

export default class GroceryListDetails extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      spinner: true,
      groceryList: {},
      groceryListSaved: {},
      groceryItems: [],
      groceryListItems: [],
      errors: [],
      changesToSave: false,
      justSaved: false,
      deleteModalOpen: false,
    };
  }

  componentDidMount() {
    fetchEntity().then((response) => {
      const { groceryList, groceryListItems, groceryItems } = response;
      this.setState({
        spinner: false,
        groceryList,
        groceryListSaved: deepCopy(groceryList),
        groceryItems,
        groceryListItems,
      });
    });
  }

  clickAddItem() {
    this.setState({
      itemsModalOpen: true,
    });
  }

  selectItem(option) {
    const { groceryList } = this.state;
    this.setState({
      itemsModalOpen: false,
      spinner: true,
    });
    createEntity({
      directory: 'grocery_list_items',
      entityName: 'grocery_list_item',
      entity: {
        groceryListId: groceryList.id,
        groceryItemId: option.id,
      }
    }).then((response) => {
      const { groceryItems, groceryListItems } = response;
      this.setState({
        spinner: false,
        groceryItems,
        groceryListItems,
      });
    });
  }

  clickDeleteItem(id) {
    this.setState({
      spinner: true,
    });
    deleteEntity({
      directory: 'grocery_list_items',
      id,
    }).then((response) => {
      const { groceryItems, groceryListItems } = response;
      this.setState({
        spinner: false,
        groceryItems,
        groceryListItems,
      });
    });
  }

  clickSave() {
    this.setState({
      spinner: true,
      justSaved: true,
    }, () => {
      const { groceryList } = this.state;
      updateEntity({
        entityName: 'groceryList',
        entity: groceryList,
      }).then((response) => {
        const { groceryList } = response;
        this.setState({
          spinner: false,
          groceryList,
          groceryListSaved: deepCopy(groceryList),
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
    const { groceryList, groceryListSaved } = this.state;
    return !objectsAreEqual(groceryList, groceryListSaved);
  }

  changeFieldArgs() {
    return {
      changesFunction: this.checkForChanges.bind(this)
    }
  }

  render() {
    const { justSaved, changesToSave, spinner, groceryItems, groceryListItems } = this.state;
    return (
      <>
        <div className="handy-component">
          <h1>Grocery List Details</h1>
          <div className="white-box">
            <div className="row">
              { Details.renderField.bind(this)({ columnWidth: 12, entity: 'groceryList', property: 'name' }) }
            </div>
            <div className="row">
              <div className="col-xs-12">
                <p className="section-header">Items</p>
                <ListBox
                  entityName="groceryItem"
                  entities={ groceryListItems }
                  clickDelete={ listItem => { this.clickDeleteItem(listItem.id) } }
                  displayProperty="name"
                  style={ { marginBottom: 15 } }
                />
                <OutlineButton
                  text="Add Item"
                  onClick={ () => { this.clickAddItem() } }
                  marginBottom
                />
              </div>
            </div>
            <BottomButtons
              entityName="groceryList"
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
        <ModalSelect
          isOpen={ this.state.itemsModalOpen }
          onClose={ Common.closeModals.bind(this) }
          options={ groceryItems }
          property="name"
          func={ this.selectItem.bind(this) }
        />
      </>
    );
  }
}
