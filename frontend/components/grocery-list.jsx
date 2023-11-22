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
    this.setState({ spinner: true });
    sendRequest(`/api/active_list/${option.id}`, {
      method: 'post',
    }).then(response => {
      const { ids } = response;
      this.setState({
        itemIds: ids,
        itemsModalOpen: false,
        spinner: false,
      });
    });
  }

  selectRecipe(option) {
    this.setState({ spinner: true });
    sendRequest(`/api/active_list/add_from_recipe/${option.id}`, {
      method: 'post',
    }).then(response => {
      const { ids } = response;
      this.setState({
        itemIds: ids,
        spinner: false,
        recipesModalOpen: false,
      });
    });
  }

  selectList(option) {
    this.setState({ spinner: true });
    sendRequest(`/api/active_list/add_from_list/${option.id}`, {
      method: 'post',
    }).then(response => {
      const { ids } = response;
      this.setState({
        itemIds: ids,
        spinner: false,
        listsModalOpen: false,
      });
    });
  }

  clearList() {
    this.setState({ spinner: true });
    sendRequest('/api/active_list/', {
      method: 'delete',
    }).then(response => {
      const { ids } = response;
      this.setState({
        itemIds: ids,
        spinner: false,
      });
    });
  }

  render() {
    const { spinner, itemsModalOpen, listsModalOpen, recipesModalOpen, groceryItems, groceryLists, recipes, itemIds } = this.state;
    const itemNames = itemIds.map(id => groceryItems.find(item => item.id === +id).name);
    return (
      <>
        <div className="root">
          <div className="list">
            {
              itemNames.sort().map(name => {
                return (
                  <p key={ name }>{ name }</p>
                );
              })
            }
          </div>
          <div className="buttons">
            <a className="btn btn-primary" rel="nofollow" onClick={ () => this.setState({ itemsModalOpen: true }) }>Add Item</a>
            <a className="btn btn-success" rel="nofollow" onClick={ () => this.setState({ listsModalOpen: true }) }>Add List</a>
            <a className="btn btn-info recipe-button" rel="nofollow" onClick={ () => this.setState({ recipesModalOpen: true }) }>Add From Recipe</a>
            <a className="btn btn-warning" rel="nofollow" onClick={ () => this.clearList() }>Clear</a>
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
          .list {
            display: grid;
            grid-auto-flow: column;
            grid-template: repeat(15, 1fr) / repeat(3, 1fr);
          }
          .list p {
            white-space: nowrap;
            text-overflow: ellipsis;
            overflow: hidden;
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
