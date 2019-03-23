import React from 'react';
import Modal from 'react-modal';
import HandyTools from 'handy-tools';
import ClientActions from '../actions/client-actions.js';
import RecipesStore from '../stores/recipes-store.js';
import RecipeNew from './recipe-new.jsx';

const ModalStyles = {
  overlay: {
    background: 'rgba(0, 0, 0, 0.50)'
  },
  content: {
    background: '#F5F6F7',
    padding: 0,
    margin: 'auto',
    maxWidth: 1000,
    height: 481
  }
};

export default class RecipesIndex extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      modalOpen: false,
      fetching: true,
      recipes: []
    }
  }

  componentDidMount() {
    this.recipesListener = RecipesStore.addListener(this.getRecipes.bind(this));
    ClientActions.standardFetch('recipes');
  }

  getRecipes() {
    this.setState({
      fetching: false,
      modalFetching: false,
      modalOpen: false,
      recipes: RecipesStore.all()
    });
  }

  clickNew() {
    this.setState({
      modalOpen: true
    });
  }

  closeModal() {
    this.setState({
      modalOpen: false
    });
  }

  clickX(e) {
    this.setState({
      fetching: true
    });
    ClientActions.standardDelete('recipes', e.target.dataset.id);
  }

  render() {
    return(
      <div className="container widened-container index-component">
        <div className="row">
          <div className="col-xs-12">
            <div className="white-box">
              { HandyTools.renderSpinner(this.state.fetching) }
              { HandyTools.renderGrayedOut(this.state.fetching, -26, -26, 6) }
              <h1>Recipes</h1>
              <table className="with-links">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Category</th>
                    <th className="x-button-column"></th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="below-header"><td></td><td></td><td></td></tr>
                  { this.state.recipes.map(function(recipe) {
                    return(
                      <tr key={ recipe.id }>
                        <td>
                          <a href={`/recipes/${recipe.id}`}>
                            { recipe.name }
                          </a>
                        </td>
                        <td>
                          <a href={`/recipes/${recipe.id}`}>
                            { recipe.category }
                          </a>
                        </td>
                        <td><div className="x-button" onClick={ this.clickX.bind(this) } data-id={ recipe.id }></div></td>
                      </tr>
                    );
                  }.bind(this)) }
                </tbody>
              </table>
              <div className="btn btn-info recipe-button" onClick={ this.clickNew.bind(this) }>Add New</div>
            </div>
          </div>
        </div>
        <Modal isOpen={ this.state.modalOpen } onRequestClose={ this.closeModal.bind(this) } contentLabel="Modal" style={ ModalStyles }>
          <RecipeNew />
        </Modal>
      </div>
    );
  }
}
