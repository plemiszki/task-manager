import React from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import Modal from 'react-modal'
import { Common, Index } from 'handy-components'
import HandyTools from 'handy-tools'
import RecipeNew from './recipe-new.jsx'
import { fetchEntities, deleteEntity } from '../actions/index'

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

class RecipesIndex extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      modalOpen: false,
      fetching: true,
      recipes: []
    }
  }

  componentDidMount() {
    this.props.fetchEntities({ directory: 'recipes' }).then(() => {
      this.setState({
        fetching: false,
        recipes: this.props.recipes,
        modalOpen: false
      });
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
    this.props.deleteEntity({
      directory: 'recipes',
      id: e.target.dataset.id,
      callback: (response) => {
        this.setState({
          fetching: false,
          recipes: response.recipes,
          modalOpen: false
        });
      }
    });
  }

  render() {
    return(
      <div className="container widened-container index-component">
        <div className="row">
          <div className="col-xs-12">
            <div className="white-box">
              { Common.renderSpinner(this.state.fetching) }
              { Common.renderGrayedOut(this.state.fetching, -26, -26, 6) }
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
                  { this.state.recipes.map((recipe) => {
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
                  }) }
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

const mapStateToProps = (reducers) => {
  return reducers.standardReducer;
};

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ fetchEntities, deleteEntity }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(RecipesIndex);
