import React from 'react'
import { Spinner, GrayedOut, sendRequest } from 'handy-components'

export default class GroceryList extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      spinner: true,
      groceryItems: [],
      groceryLists: [],
      groceryStores: [],
    }
  }

  componentDidMount() {
    sendRequest('/api/active_list').then(response => {
      const { groceryLists, groceryItems, groceryStores } = response;
      this.setState({
        spinner: false,
        groceryItems,
        groceryLists,
        groceryStores,
      });
    });
  }

  render() {
    const { spinner } = this.state;
    return (
      <>
        <div className="root">
          <p>Grocery list will go here.</p>
          <GrayedOut visible={ spinner } />
          <Spinner visible={ spinner } />
          <div className="buttons">
            <a className="btn btn-primary" rel="nofollow">Add Item</a>
            <a className="btn btn-success" rel="nofollow">Add List</a>
            <a className="btn btn-info recipe-button" rel="nofollow">Add From Recipe</a>
            <a className="btn btn-warning" rel="nofollow">Clear</a>
            <a className="btn btn-primary" rel="nofollow">Export</a>
          </div>
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
