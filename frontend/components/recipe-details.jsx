import React from 'react'
import { SaveButton, Details, deepCopy, objectsAreEqual, fetchEntity, updateEntity, Spinner, GrayedOut, ListBox, OutlineButton } from 'handy-components'

export default class RecipeDetails extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      spinner: true,
      recipe: {},
      recipedSaved: {},
      recipeItems: [],
      errors: {},
      changesToSave: false,
      justSaved: false,
      deleteModalOpen: false,
    };
  }

  componentDidMount() {
    fetchEntity().then((response) => {
      const { recipe, recipeItems } = response;
      this.setState({
        spinner: false,
        recipe,
        recipeSaved: deepCopy(recipe),
        recipeItems,
      });
    });
  }

  checkForChanges() {
    const { recipe, recipeSaved } = this.state;
    return !objectsAreEqual(recipe, recipeSaved);
  }

  changeFieldArgs() {
    return {
      changesFunction: this.checkForChanges.bind(this),
    }
  }

  clickAddItem() {
    console.log('click add item')
    // this.setState({
    //   itemsModalOpen: true,
    // });
  }

  clickDeleteItem(id) {
    console.log('click delete')
    // this.setState({
    //   spinner: true,
    // });
    // deleteEntity({
    //   directory: 'recipe_items',
    //   id,
    // }).then((response) => {
    //   const { groceryItems, recipeListItems } = response;
    //   this.setState({
    //     spinner: false,
    //     groceryItems,
    //     groceryListItems,
    //   });
    // });
  }

  clickSave() {
    this.setState({
      spinner: true,
      justSaved: true,
    }, () => {
      const { recipe } = this.state;
      updateEntity({
        entityName: 'recipe',
        entity: recipe,
      }).then((response) => {
        const { recipe } = response;
        this.setState({
          spinner: false,
          recipe,
          recipeSaved: deepCopy(recipe),
          changesToSave: false,
        });
      }, (response) => {
        const { errors } = response;
        this.setState({
          spinner: false,
          errors,
        });
      });
    });
  }

  render() {
    const { justSaved, changesToSave, spinner, recipeItems } = this.state;
    return (
      <>
        <div className="handy-component">
          <h1>Edit Recipe</h1>
          <div className="white-box">
            <div className="row">
              { Details.renderField.bind(this)({ columnWidth: 6, entity: 'recipe', property: 'name' }) }
              { Details.renderField.bind(this)({ columnWidth: 4, entity: 'recipe', property: 'category' }) }
              { Details.renderField.bind(this)({ columnWidth: 2, entity: 'recipe', property: 'time' }) }
            </div>
            <div className="row">
              { Details.renderField.bind(this)({ columnWidth: 6, entity: 'recipe', type: 'textbox', rows: 11, property: 'ingredients' }) }
              { Details.renderField.bind(this)({ columnWidth: 6, entity: 'recipe', type: 'textbox', rows: 11, columnHeader: 'Preparation', property: 'prep' }) }
            </div>
            <div className="row">
              <div className="col-xs-12">
                <p className="section-header">Items</p>
                <ListBox
                  entityName="recipeItem"
                  entities={ recipeItems }
                  clickDelete={ recipeItem => { this.clickDeleteItem(recipeItem.id) } }
                  displayProperty="name"
                  style={ { marginBottom: 15 } }
                />
                <OutlineButton
                  text="Add Item"
                  onClick={ () => { this.clickAddItem() } }
                  marginBottom
                />
              </div>
            </div>
            <SaveButton
              justSaved={ justSaved }
              changesToSave={ changesToSave }
              disabled={ spinner }
              onClick={ () => { this.clickSave() } }
            />
            <GrayedOut visible={ spinner } />
            <Spinner visible={ spinner } />
          </div>
        </div>
      </>
    );
  }
};
