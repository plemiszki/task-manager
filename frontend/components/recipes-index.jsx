import React, { useState, useEffect } from "react";
import Modal from "react-modal";
import { Spinner, GrayedOut, deleteEntity } from "handy-components";
import RecipeNew from "./recipe-new.jsx";

const ModalStyles = {
  overlay: {
    background: "rgba(0, 0, 0, 0.50)",
  },
  content: {
    background: "#F5F6F7",
    padding: 0,
    margin: "auto",
    maxWidth: 1000,
    height: 513,
  },
};

export default function RecipesIndex() {
  const [spinner, setSpinner] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [recipes, setRecipes] = useState([]);

  useEffect(() => {
    fetch(`/api/recipes`)
      .then((data) => data.json())
      .then((response) => {
        setRecipes(response.recipes);
        setSpinner(false);
      });
  }, []);

  const deleteRecipe = (id) => {
    setSpinner(true);
    deleteEntity({
      directory: "recipes",
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
            <div
              className="btn btn-info recipe-button"
              style={{ position: "absolute", right: 26, top: 26 }}
              onClick={() => {
                setModalOpen(true);
              }}
            >
              Add New
            </div>
            <table className="with-links" style={{ marginTop: 20 }}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th className="x-button-column"></th>
                </tr>
              </thead>
              <tbody>
                <tr className="below-header">
                  <td></td>
                  <td></td>
                </tr>
                {recipes.map((recipe) => {
                  return (
                    <tr key={recipe.id}>
                      <td>
                        <a href={`/recipes/${recipe.id}`}>{recipe.name}</a>
                      </td>
                      <td>
                        <div
                          className="x-button"
                          onClick={() => {
                            deleteRecipe(recipe.id);
                          }}
                          data-id={recipe.id}
                        ></div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <GrayedOut visible={spinner} />
            <Spinner visible={spinner} />
          </div>
        </div>
      </div>
      <Modal
        isOpen={modalOpen}
        onRequestClose={() => {
          setModalOpen(false);
        }}
        contentLabel="Modal"
        style={ModalStyles}
      >
        <RecipeNew
          afterCreate={(recipes) => {
            setRecipes(recipes);
            setModalOpen(false);
          }}
        />
      </Modal>
    </div>
  );
}
