import React from 'react'
import { Spinner, GrayedOut, sendRequest, ModalSelect, Common } from 'handy-components'

export default class GroceryList extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      spinner: true,
      groceryItems: [],
      groceryLists: [],
      groceryStores: [],
      recipes: [],
      itemsModalOpen: false,
      listsModalOpen: false,
      storesModalOpen: false,
    }
  }

  componentDidMount() {
    sendRequest('/api/active_list').then(response => {
      const { groceryLists, groceryItems, groceryStores, recipes } = response;
      this.setState({
        spinner: false,
        groceryItems,
        groceryLists,
        groceryStores,
        recipes,
      });
    });
  }

  selectItem(option) {
    console.log('select item')
  }

  selectRecipe(option) {
    console.log('select recipe')
  }

  selectList(option) {
    console.log('select list')
  }

  render() {
    const { spinner, itemsModalOpen, listsModalOpen, recipesModalOpen, groceryItems, groceryLists, recipes } = this.state;
    return (
      <>
        <div className="root">
          <p>Grocery list will go here.</p>

          <div className="buttons">
            <a className="btn btn-primary" rel="nofollow" onClick={ () => this.setState({ itemsModalOpen: true }) }>Add Item</a>
            <a className="btn btn-success" rel="nofollow" onClick={ () => this.setState({ listsModalOpen: true }) }>Add List</a>
            <a className="btn btn-info recipe-button" rel="nofollow" onClick={ () => this.setState({ recipesModalOpen: true }) }>Add From Recipe</a>
            <a className="btn btn-warning" rel="nofollow">Clear</a>
            <a className="btn btn-primary" rel="nofollow">Export</a>
          </div>
          <ModalSelect
            isOpen={ itemsModalOpen }
            onClose={ Common.closeModals.bind(this) }
            options={ groceryItems }
            property="name"
            func={ this.selectItem.bind(this) }
          />
          <ModalSelect
            isOpen={ recipesModalOpen }
            onClose={ Common.closeModals.bind(this) }
            options={ recipes }
            property="name"
            func={ this.selectRecipe.bind(this) }
          />
          <ModalSelect
            isOpen={ listsModalOpen }
            onClose={ Common.closeModals.bind(this) }
            options={ groceryLists }
            property="name"
            func={ this.selectList.bind(this) }
          />
          <GrayedOut visible={ spinner } />
          <Spinner visible={ spinner } />
        </div>
        <style jsx>{`
          .root {
            position: relative;
            height: 100%;
          }
          .buttons {
            display: flex;
            position: absolute;
            bottom: 0;
            justify-content: space-between;
            width: 100%;
          }
        `}</style>
      </>
    );
  }
}
