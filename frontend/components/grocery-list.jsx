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
        <div>
          <p>Grocery list will go here.</p>
          <GrayedOut visible={ spinner } />
          <Spinner visible={ spinner } />
        </div>
        <style jsx>{`

        `}</style>
      </>
    );
  }
}
