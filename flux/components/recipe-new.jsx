import React from 'react'
import { Common, Details } from 'handy-components'
import HandyTools from 'handy-tools'
import ErrorsStore from '../stores/errors-store.js'
import ClientActions from '../actions/client-actions.js'
import DetailsComponent from './_details.jsx'
import { ERRORS } from '../errors.js'

export default class RecipeNew extends DetailsComponent {
  constructor(props) {
    super(props);
    this.state = {
      fetching: false,
      recipe: {
        name: '',
        category: '',
        ingredients: '',
        prep: ''
      },
      errors: []
    };
  }

  componentDidMount() {
    this.errorsListener = ErrorsStore.addListener(this.getErrors.bind(this));
  }

  componentWillUnmount() {
    this.errorsListener.remove();
  }

  getErrors() {
    this.setState({
      fetching: false,
      errors: ErrorsStore.all()
    });
  }

  changeFieldArgs() {
    return {
      allErrors: ERRORS,
      errorsArray: this.state.errors
    }
  }

  clickSave() {
    this.setState({
      fetching: true
    });
    ClientActions.standardCreate('recipes', 'recipe', this.state.recipe);
  }

  render() {
    return(
      <div id="future-task-new" className="admin-modal">
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
            <div className="row">
              <div className="col-xs-12">
                <div className="btn btn-info recipe-button" onClick={ this.clickSave.bind(this) }>Add Recipe</div>
              </div>
            </div>
          </div>
      </div>
    );
  }
}
