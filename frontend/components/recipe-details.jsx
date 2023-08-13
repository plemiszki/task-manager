import React from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { Common, Details } from 'handy-components'
import HandyTools from 'handy-tools'
import DetailsComponent from './_details.jsx'
import { fetchEntity, updateEntity } from '../actions/index'

class RecipeDetails extends DetailsComponent {

  constructor(props) {
    super(props);
    this.state = Object.assign(this.defaultState(), {
      recipe: {},
      recipeSaved: {}
    });
  }

  componentDidMount() {
    this.props.fetchEntity({
      id: window.location.pathname.split('/')[2],
      directory: 'recipes',
      entityName: 'recipe'
    }).then(() => {
      this.setState({
        fetching: false,
        recipe: this.props.recipe,
        recipeSaved: HandyTools.deepCopy(this.props.recipe),
        changesToSave: false
      });
    });
  }

  checkForChanges() {
    return !HandyTools.objectsAreEqual(this.state.recipe, this.state.recipeSaved);
  }

  changeFieldArgs() {
    return {
      errorsArray: this.state.errors,
      changesFunction: () => this.checkForChanges()
    }
  }

  clickSave() {
    this.setState({
      fetching: true,
      justSaved: true
    }, () => {
      this.props.updateEntity({
        id: window.location.pathname.split('/')[2],
        directory: 'recipes',
        entity: this.state.recipe,
        entityName: 'recipe'
      }).then(() => {
        this.setState({
          fetching: false,
          recipe: this.props.recipe,
          recipeSaved: HandyTools.deepCopy(this.props.recipe),
          changesToSave: false
        });
      }, () => {
        this.setState({
          fetching: false,
          errors: this.props.errors
        });
      });
    });
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
              <div className="col-xs-4">
                <h2>Category</h2>
                <input className={ Details.errorClass(this.state.errors, []) } onChange={ Details.changeField.bind(this, this.changeFieldArgs()) } value={ this.state.recipe.category || "" } data-entity="recipe" data-field="category" />
                { Details.renderFieldError(this.state.errors, []) }
              </div>
              { Details.renderField.bind(this)({ columnWidth: 2, entity: 'recipe', property: 'time' }) }
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

const mapStateToProps = (reducers) => {
  return reducers.standardReducer;
};

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ fetchEntity, updateEntity }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(RecipeDetails);
