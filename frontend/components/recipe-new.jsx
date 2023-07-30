import React from 'react'
import { Details, Spinner, GrayedOut, createEntity } from 'handy-components'
import DetailsComponent from './_details.jsx'
import { ERRORS } from '../errors.js'

export default class RecipeNew extends DetailsComponent {

  constructor(props) {
    super(props);
    this.state = {
      spinner: false,
      recipe: {
        name: '',
        category: '',
        ingredients: '',
        prep: ''
      },
      errors: []
    };
  }

  getErrors() {
    this.setState({
      fetching: false,
      errors: ErrorsStore.all()
    });
  }

  changeFieldArgs() {
    return {
      entity: 'recipe',
      allErrors: ERRORS,
      errorsArray: this.state.errors
    }
  }

  clickSave() {
    this.setState({
      spinner: true
    });
    createEntity({
      directory: 'recipes',
      entityName: 'recipe',
      entity: this.state.recipe,
    }).then((response) => {
      this.props.afterCreate(response.recipes);
    }, (response) => {
      this.setState({
        spinner: false,
        errors: response,
      });
    });
  }

  render() {
    const { spinner, errors } = this.state;
    return (
      <div id="recipe-new" className="admin-modal handy-component">
          <div className="white-box">
            <div className="row">
              <div className="col-xs-6">
                <h2>Name</h2>
                <input className={ Details.errorClass(this.state.errors, ERRORS.name) } onChange={ Details.changeField.bind(this, { ...this.changeFieldArgs(), property: 'name' }) } value={ this.state.recipe.name || "" } />
                { Details.renderFieldError(this.state.errors, []) }
              </div>
              <div className="col-xs-6">
                <h2>Category</h2>
                <input className={ Details.errorClass(this.state.errors, []) } onChange={ Details.changeField.bind(this, { ...this.changeFieldArgs(), property: 'category' }) } value={ this.state.recipe.category || "" } />
                { Details.renderFieldError([], []) }
              </div>
            </div>
            <div className="row">
              <div className="col-xs-6">
                <h2>Ingredients</h2>
                <textarea rows={ 10 } className={ Details.errorClass(this.state.errors, []) } onChange={ Details.changeField.bind(this, { ...this.changeFieldArgs(), property: 'ingredients' }) } value={ this.state.recipe.ingredients }></textarea>
                { Details.renderFieldError([], []) }
              </div>
              <div className="col-xs-6">
                <h2>Preparation</h2>
                <textarea rows={ 10 } className={ Details.errorClass(this.state.errors, []) } onChange={ Details.changeField.bind(this, { ...this.changeFieldArgs(), property: 'prep' }) } value={ this.state.recipe.prep }></textarea>
                { Details.renderFieldError([], []) }
              </div>
            </div>
            <div className="row">
              <div className="col-xs-12">
                <div className="btn btn-info recipe-button" onClick={ this.clickSave.bind(this) }>Add Recipe</div>
              </div>
            </div>
            <GrayedOut visible={ spinner } />
            <Spinner visible={ spinner } />
          </div>
      </div>
    );
  }
}
