import React from 'react'
import { Details, Spinner, GrayedOut, createEntity } from 'handy-components'
import DetailsComponent from './_details.jsx'

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

  changeFieldArgs() {
    return {
      entity: 'recipe',
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
        errors: response.errors,
      });
    });
  }

  render() {
    const { spinner } = this.state;
    return (
      <div id="recipe-new" className="admin-modal handy-component">
          <div className="white-box">
            <div className="row">
              { Details.renderField.bind(this)({ columnWidth: 6, entity: 'recipe', property: 'name' }) }
              { Details.renderField.bind(this)({ columnWidth: 6, entity: 'recipe', property: 'category' }) }
            </div>
            <div className="row">
              { Details.renderField.bind(this)({ columnWidth: 6, entity: 'recipe', property: 'ingredients', type: 'textbox', rows: 11 }) }
              { Details.renderField.bind(this)({ columnWidth: 6, entity: 'recipe', property: 'preparation', type: 'textbox', rows: 11 }) }
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
