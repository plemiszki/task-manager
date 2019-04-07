import React from 'react'
import Modal from 'react-modal'
import { Common, Details } from 'handy-components'
import HandyTools from 'handy-tools'
import ClientActions from '../actions/client-actions.js'
import RecipesStore from '../stores/recipes-store.js'
import ErrorsStore from '../stores/errors-store'
import DetailsComponent from './_details.jsx'
import { ERRORS } from '../errors.js'

export default class RecipeDetails extends DetailsComponent {

  constructor(props) {
    super(props);
    this.state = Object.assign(this.defaultState(), {
      recipe: {},
      recipeSaved: {}
    });
  }

  componentDidMount() {
    this.errorsListener = ErrorsStore.addListener(this.getErrors.bind(this));
    this.recipesListener = RecipesStore.addListener(this.getRecipe.bind(this));
    ClientActions.standardFetch('recipes', window.location.pathname.split('/')[2]);
  }

  componentWillUnmount() {
    this.errorsListener.remove();
    this.recipesListener.remove();
  }

  checkForChanges() {
    return !HandyTools.objectsAreEqual(this.state.recipe, this.state.recipeSaved);
  }

  changeFieldArgs() {
    return {
      allErrors: ERRORS,
      errorsArray: this.state.errors,
      changesFunction: () => this.checkForChanges()
    }
  }

  getRecipe() {
    var recipe = RecipesStore.find(window.location.pathname.split('/')[2]);
    this.setState({
      fetching: false,
      changesToSave: false,
      recipe: recipe,
      recipeSaved: HandyTools.deepCopy(recipe)
    });
  }

  clickSave() {
    this.setState({
      fetching: true,
      justSaved: true
    });
    ClientActions.standardUpdate('recipes', 'recipe', this.state.recipe);
  }

  render() {
    return(
      <div className="container widened-container">
        <div className="recipe-details component">
          <h1>Edit Recipe</h1>
          <div className="white-box">
            { Common.renderSpinner(this.state.fetching) }
            { Common.renderGrayedOut(this.state.fetching, -26, -26, 6) }
            <div className="row">
              <div className="col-xs-6">
                <h2>Name</h2>
                <input className={ Details.errorClass(this.state.errors, ERRORS.name) } onChange={ Details.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.recipe.name || "" } data-entity="recipe" data-field="name" />
                { Details.renderFieldError(this.state.errors, ERRORS.name) }
              </div>
              <div className="col-xs-6">
                <h2>Category</h2>
                <input className={ Details.errorClass(this.state.errors, []) } onChange={ Details.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.recipe.category || "" } data-entity="recipe" data-field="category" />
                { Details.renderFieldError(this.state.errors, []) }
              </div>
            </div>
            <div className="row">
              <div className="col-xs-6">
                <h2>Ingredients</h2>
                <textarea rows={ 10 } className={ Details.errorClass(this.state.errors, []) } onChange={ Details.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.recipe.ingredients } data-entity="recipe" data-field="ingredients"></textarea>
                { Details.renderFieldError(this.state.errors, []) }
              </div>
              <div className="col-xs-6">
                <h2>Preparation</h2>
                <textarea rows={ 10 } className={ Details.errorClass(this.state.errors, []) } onChange={ Details.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.recipe.prep } data-entity="recipe" data-field="prep"></textarea>
                { Details.renderFieldError(this.state.errors, []) }
              </div>
            </div>
            { this.renderButtons() }
          </div>
        </div>
      </div>
    );
  }

  renderButtons() {
    if (this.state.changesToSave) {
      var buttonText = "Save";
    } else {
      var buttonText = this.state.justSaved ? "Saved" : "No Changes";
    }
    return(
      <div>
        <a className={ "standard-width btn btn-info recipe-button save-button" + Common.renderDisabledButtonClass(this.state.fetching || !this.state.changesToSave) } onClick={ this.clickSave.bind(this) }>
          { buttonText }
        </a>
      </div>
    );
  }
};
