import React, { useState, useEffect } from 'react'
import Modal from 'react-modal'
import { Spinner, GrayedOut, deleteEntity } from 'handy-components'
import RecipeNew from './recipe-new.jsx'

const ModalStyles = {
  overlay: {
    background: 'rgba(0, 0, 0, 0.50)'
  },
  content: {
    background: '#F5F6F7',
    padding: 0,
    margin: 'auto',
    maxWidth: 1000,
    height: 513,
  }
};

export default function RecipesIndex() {

  const [spinner, setSpinner] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [recipes, setRecipes] = useState([])

  useEffect(() => {
    fetch(`/api/recipes`)
      .then(data => data.json())
      .then((response) => {
        setRecipes(response.recipes)
        setSpinner(false)
      });
  }, [])

  const deleteRecipe = (id) => {
    setSpinner(true);
    deleteEntity({
      directory: 'recipes',
      id,
    }).then((response) => {
      const { recipes } = response;
      setRecipes(recipes);
      setModalOpen(false);
      setSpinner(false);
    });
  };

  return (
    <div className="handy-component container widened-container index-component">
      <div className="row">
        <div className="col-xs-12">
          <div className="white-box">
            <h1>Recipes</h1>
            <table className="with-links">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Time</th>
                  <th className="x-button-column"></th>
                </tr>
              </thead>
              <tbody>
                <tr className="below-header"><td></td><td></td><td></td><td></td></tr>
                { recipes.map((recipe) => {
                  return(
                    <tr key={ recipe.id }>
                      <td>
                        <a href={ `/recipes/${recipe.id}` }>
                          { recipe.name }
                        </a>
                      </td>
                      <td>
                        <a href={ `/recipes/${recipe.id}` }>
                          { recipe.category }
                        </a>
                      </td>
                      <td>
                        <a href={ `/recipes/${recipe.id}` }>
                          { recipe.time }
                        </a>
                      </td>
                      <td><div className="x-button" onClick={ () => { deleteRecipe(recipe.id) } } data-id={ recipe.id }></div></td>
                    </tr>
                  );
                }) }
              </tbody>
            </table>
            <div className="btn btn-info recipe-button" onClick={ () => { setModalOpen(true) } }>Add New</div>
            <GrayedOut visible={ spinner } />
            <Spinner visible={ spinner } />
          </div>
        </div>
      </div>
      <Modal isOpen={ modalOpen } onRequestClose={ () => { setModalOpen(false) } } contentLabel="Modal" style={ ModalStyles }>
        <RecipeNew
          afterCreate={ (recipes) => {
            setRecipes(recipes);
            setModalOpen(false);
          } }
        />
      </Modal>
    </div>
  );
}
