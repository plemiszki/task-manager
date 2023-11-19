import React from 'react'
import { Spinner, GrayedOut } from 'handy-components'

export default class GroceryList extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      spinner: true,
    }
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
