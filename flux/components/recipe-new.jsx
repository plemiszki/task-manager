import React from 'react';
import ErrorsStore from '../stores/errors-store.js';
import ClientActions from '../actions/client-actions.js';
import DetailsComponent from './_details.jsx';
import HandyTools from 'handy-tools';
import { ERRORS } from '../errors.js';

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
            { HandyTools.renderSpinner(this.state.fetching) }
            { HandyTools.renderGrayedOut(this.state.fetching, -26, -26, 6) }
            <div className="row">
              <div className="col-xs-6">
                <h2>Name</h2>
                <input className={ HandyTools.errorClass(this.state.errors, ERRORS.name) } onChange={ HandyTools.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.recipe.name || "" } data-entity="recipe" data-field="name" />
                { HandyTools.renderFieldError(this.state.errors, ERRORS.name) }
              </div>
              <div className="col-xs-6">
                <h2>Category</h2>
                <input className={ HandyTools.errorClass(this.state.errors, []) } onChange={ HandyTools.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.recipe.category || "" } data-entity="recipe" data-field="category" />
                { HandyTools.renderFieldError(this.state.errors, []) }
              </div>
            </div>
            <div className="row">
              <div className="col-xs-6">
                <h2>Ingredients</h2>
                <textarea rows={ 10 } className={ HandyTools.errorClass(this.state.errors, []) } onChange={ HandyTools.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.recipe.ingredients } data-entity="recipe" data-field="ingredients"></textarea>
                { HandyTools.renderFieldError(this.state.errors, []) }
              </div>
              <div className="col-xs-6">
                <h2>Preparation</h2>
                <textarea rows={ 10 } className={ HandyTools.errorClass(this.state.errors, []) } onChange={ HandyTools.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.recipe.prep } data-entity="recipe" data-field="prep"></textarea>
                { HandyTools.renderFieldError(this.state.errors, []) }
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
