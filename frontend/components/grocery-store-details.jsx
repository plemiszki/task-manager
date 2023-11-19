import React from 'react'
import Modal from 'react-modal'
import NewEntity from './new-entity';
import { Table, Common, BottomButtons, Details, deepCopy, objectsAreEqual, fetchEntity, createEntity, updateEntity, deleteEntity, Spinner, GrayedOut, OutlineButton, ModalSelect } from 'handy-components'

export default class GroceryStoreDetails extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      spinner: true,
      groceryStore: {},
      groceryStoreSaved: {},
      grocerySections: [],
      groceryItems: [],
      errors: {},
      changesToSave: false,
      justSaved: false,
      deleteModalOpen: false,
      newSectionModalOpen: false,
    };
  }

  componentDidMount() {
    fetchEntity().then((response) => {
      const { groceryStore, grocerySections, groceryItems } = response;
      this.setState({
        spinner: false,
        groceryStore,
        groceryStoreSaved: deepCopy(groceryStore),
        grocerySections,
        groceryItems,
      });
    });
  }

  selectItem(option) {
    const { selectedSectionId, groceryStore } = this.state;
    this.setState({
      itemsModalOpen: false,
      spinner: true,
    });
    createEntity({
      directory: 'grocery_section_items',
      entityName: 'grocery_section_item',
      entity: {
        grocerySectionId: selectedSectionId,
        groceryItemId: option.id,
        groceryStoreId: groceryStore.id,
      }
    }).then((response) => {
      const { grocerySections, groceryItems } = response;
      this.setState({
        spinner: false,
        grocerySections,
        groceryItems,
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
    const { justSaved, changesToSave, spinner, grocerySections, newSectionModalOpen, groceryStore, groceryItems } = this.state;

    let tableData = [];
    grocerySections.forEach(section => {
      const { id, name, grocerySectionItems } = section;
      tableData.push({
        id,
        text: name,
        section: true,
      });
      grocerySectionItems.forEach(item => {
        const { id, name } = item;
        tableData.push({
          id,
          text: name,
        });
      })
    })

    return (
      <>
        <div className="handy-component">
          <h1>Grocery Store Details</h1>
          <div className="white-box">
            <div className="row">
              { Details.renderField.bind(this)({ columnWidth: 12, entity: 'groceryStore', property: 'name' }) }
            </div>
            <hr />
            <Table
              columns={ [
                {
                  name: 'text',
                  header: 'Sections',
                  boldIf: row => row.section,
                },
                {
                  isButton: true,
                  buttonText: 'Add Item',
                  width: 120,
                  clickButton: row => { this.setState({ itemsModalOpen: true, selectedSectionId: row.id }) },
                  displayIf: row => row.section,
                },
              ] }
              rows={ tableData }
              links={ false }
              sortable={ false }
              clickDelete={ row => {
                const { section, id } = row;
                this.setState({ spinner: true })
                deleteEntity({
                  directory: (section ? 'grocery_sections' : 'grocery_section_items'),
                  id,
                }).then((response) => {
                  const { grocerySections, groceryItems } = response;
                  this.setState({
                    spinner: false,
                    grocerySections,
                    groceryItems,
                  });
                });
              } }
              marginBottom
            />
            <OutlineButton
              color="#5F5F5F"
              text="Add Section"
              onClick={ () => this.setState({ newSectionModalOpen: true }) }
              marginBottom
            />
            <hr />
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
        <Modal isOpen={ newSectionModalOpen } onRequestClose={ Common.closeModals.bind(this) } contentLabel="Modal" style={ Common.newEntityModalStyles({ width: 500 }, 1) }>
          <NewEntity
            entityName="grocerySection"
            initialEntity={ { name: '', groceryStoreId: groceryStore.id } }
            callback={ grocerySections => this.setState({ grocerySections, newSectionModalOpen: false }) }
            responseKey="grocerySections"
            buttonText="Add Section"
          />
        </Modal>
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
