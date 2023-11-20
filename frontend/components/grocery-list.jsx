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
      itemIds: [],
    }
  }

  componentDidMount() {
    sendRequest('/api/active_list').then(response => {
      const { groceryLists, groceryItems, groceryStores, recipes, ids } = response;
      this.setState({
        spinner: false,
        groceryItems,
        groceryLists,
        groceryStores,
        recipes,
        itemIds: ids,
      });
    });
  }

  selectItem(option) {
    sendRequest(`/api/active_list/${option.id}`, {
      method: 'post',
    }).then(response => {
      const { ids } = response;
      this.setState({
        itemIds: ids,
        itemsModalOpen: false,
      });
    });
  }

  selectRecipe(option) {
    console.log('select recipe')
  }

  selectList(option) {
    console.log('select list')
  }

  render() {
    const { spinner, itemsModalOpen, listsModalOpen, recipesModalOpen, groceryItems, groceryLists, recipes, itemIds } = this.state;
    const itemNames = itemIds.map(id => groceryItems.find(item => item.id === +id).name);
    return (
      <>
        <div className="root">
          {
            itemNames.sort().map(name => {
              return (
                <p key={ name }>{ name }</p>
              );
            })
          }
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
            zIndex={ 3 }
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
          <GrayedOut visible={ spinner } style={{
            top: -20,
            left: -20,
            width: 'calc(100% + 40px)',
            height: 'calc(100% + 40px)',
          }} />
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
