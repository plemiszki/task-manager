import React from 'react'
import Modal from 'react-modal'
import NewEntity from './new-entity';
import {
  BottomButtons,
  Common,
  createEntity,
  deepCopy,
  deleteEntity,
  Details,
  fetchEntity,
  GrayedOut,
  ListBoxReorderable,
  ModalSelect,
  objectsAreEqual,
  OutlineButton,
  rearrangeFields,
  sendRequest,
  Spinner,
  updateEntity,
} from 'handy-components'

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

  canIDrop($e) {
    var draggedIndex = $e[0].dataset.index;
    var dropZoneIndex = this.dataset.index;
    if ($e[0].dataset.section !== this.dataset.section) {
      return false;
    }
    var difference = Math.abs(draggedIndex - dropZoneIndex);
    if (difference >= 2) {
      return true;
    } else if (difference == 1 && draggedIndex < dropZoneIndex) {
      return true;
    }
    return false;
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
    $('.grabbed-element').removeClass('grabbed-element');
    $('.highlight').removeClass('highlight');
  }

  dropHandler(e, ui) {
    let sectionDiv = e.target.closest("div.section");
    let sectionId = sectionDiv.dataset["grocerySectionId"];
    const { grocerySections } = this.state;
    const grocerySection = grocerySections.find(section => section.id == sectionId)
    let draggedIndex = ui.draggable[0].dataset.index;
    let dropZoneIndex = e.target.dataset.index;
    let currentOrder = {};
    grocerySection.grocerySectionItems.forEach((item) => {
      currentOrder[item.position] = item.id;
    });
    let newOrder = rearrangeFields({ currentOrder, draggedIndex, dropZoneIndex });
    this.setState({
      spinner: true,
    });
    sendRequest('/api/grocery_section_items/rearrange', {
      method: 'PATCH',
      data: {
        new_order: newOrder,
        grocery_section_id: sectionId,
      },
    }).then((response) => {
      const { grocerySections } = response;
      this.setState({
        spinner: false,
        grocerySections,
      });
    });
  }

  clickDeleteItem(id) {
    this.setState({ spinner: true })
    deleteEntity({
      directory: 'grocery_section_items',
      id,
    }).then((response) => {
      const { grocerySections, groceryItems } = response;
      this.setState({
        spinner: false,
        grocerySections,
        groceryItems,
      });
    });
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
            <BottomButtons
              entityName="groceryStore"
              confirmDelete={ Details.confirmDelete.bind(this) }
              justSaved={ justSaved }
              changesToSave={ changesToSave }
              disabled={ spinner }
              clickSave={ () => { this.clickSave() } }
              marginBottom
            />
            <hr />
            <OutlineButton
              color="#5F5F5F"
              text="Add Section"
              onClick={ () => this.setState({ newSectionModalOpen: true }) }
              marginBottom
            />
            { grocerySections.map((grocerySection, index) => {
              let lastSection = grocerySections.length === (index + 1);
              return (
                <div className="section" key={ grocerySection.id } data-grocery-section-id={ grocerySection.id }>
                  <h2>{ grocerySection.name }</h2>
                  <ListBoxReorderable
                    entityName="grocerySectionItem"
                    entities={ grocerySection.grocerySectionItems }
                    clickAdd={ () => { this.setState({ itemsModalOpen: true, selectedSectionId: grocerySection.id }) } }
                    clickDelete={ listItemId => this.clickDeleteItem(listItemId) }
                    displayProperty="name"
                    style={ lastSection ? null : { marginBottom: 30 } }
                  />
                </div>
              );
            })}
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

  componentDidUpdate() {
    $("li:not('drop-zone'), div.quote").draggable({
      cursor: '-webkit-grabbing',
      handle: '.handle',
      helper: () => '<div></div>',
      stop: this.dragEndHandler
    });
    $('li.drop-zone, .quote-drop-zone').droppable({
      accept: this.canIDrop,
      tolerance: 'pointer',
      over: this.dragOverHandler,
      out: this.dragOutHandler,
      drop: this.dropHandler.bind(this)
    });
  }
}
