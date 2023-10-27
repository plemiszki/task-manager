import React from 'react'
import { snakeCase } from 'change-case'
import { titleCase } from 'title-case'
import { Details, deepCopy, setUpNiceSelect, resetNiceSelect, createEntity, sendRequest, GrayedOut, Spinner, Button } from 'handy-components'

let entityNamePlural;
let directory;

export default class NewEntity extends React.Component {
  constructor(props) {
    super(props);

    const { entityName, fetchData, initialEntity, passData } = this.props;

    entityNamePlural = this.props.entityNamePlural || `${entityName}s`;
    directory = snakeCase(entityNamePlural);
    let state_obj = {
      spinner: !!fetchData,
      [entityName]: deepCopy(initialEntity),
      errors: {},
    }

    if (passData) {
      Object.keys(passData).forEach((arrayName) => {
        state_obj[arrayName] = passData[arrayName];
      });
    }

    if (fetchData) {
      fetchData.forEach((arrayName) => {
        state_obj[arrayName] = [];
      });
    }

    this.state = state_obj;
  }

  componentDidMount() {
    const { entityName, fetchData } = this.props;

    setUpNiceSelect({ selector: '.admin-modal select', func: Details.changeDropdownField.bind(this) });
    if (fetchData) {
      sendRequest(`/api/${directory}/new`).then((response) => {
        let entity = deepCopy(this.state[entityName]);
        let obj = { spinner: false };
        fetchData.forEach((arrayName) => {
          obj[arrayName] = response[arrayName];
        })
        obj[entityName] = entity;

        this.setState(obj, () => {
          resetNiceSelect({ selector: '.admin-modal select', func: Details.changeDropdownField.bind(this) });
        });
      });
    } else {
      resetNiceSelect({ selector: '.admin-modal select', func: Details.changeDropdownField.bind(this) });
    }
  }

  clickAdd() {
    const { entityNamePlural: entityNamePluralProps, responseKey, entityName, redirectAfterCreate, callback, callbackFullProps } = this.props;
    const entityNamePlural = entityNamePluralProps || `${entityName}s`;
    const directory = snakeCase(entityNamePlural);
    this.setState({
      spinner: true
    });
    createEntity({
      directory,
      entityName,
      entity: this.state[entityName],
    }).then((response) => {
      if (redirectAfterCreate) {
        window.location.href = `/${directory}/${response[entityName].id}`;
      } else {
        if (callback) {
          callback(response[responseKey || entityNamePlural], entityNamePlural);
        }
        if (callbackFullProps) {
          callbackFullProps(response, entityNamePlural);
        }
      }
    }, (response) => {
      this.setState({
        spinner: false,
        errors: response.errors,
      }, () => {
        resetNiceSelect({ selector: '.admin-modal select', func: Details.changeField.bind(this, this.changeFieldArgs()) });
      });
    });
  }

  changeFieldArgs() {
    return {}
  }

  render() {
    const { buttonText, entityName } = this.props;
    const { spinner } = this.state;
    return (
      <div className="new-entity handy-component admin-modal">
        <form className="white-box">
          { this.renderFields() }
          <Button
            submit
            disabled={ spinner }
            text={ buttonText || `Add ${titleCase(entityName)}` }
            onClick={ () => { this.clickAdd() } }
          />
          <GrayedOut visible={ spinner } />
          <Spinner visible={ spinner } />
        </form>
      </div>
    );
  }

  renderFields() {
    switch (this.props.entityName) {
      case 'groceryStore':
        return([
          <div key="1" className="row">
            { Details.renderField.bind(this)({ columnWidth: 12, entity: 'groceryStore', property: 'name' }) }
          </div>,
        ]);
      case 'groceryItem':
        return([
          <div key="1" className="row">
            { Details.renderField.bind(this)({ columnWidth: 12, entity: 'groceryItem', property: 'name' }) }
          </div>,
        ]);
      case 'groceryList':
        return([
          <div key="1" className="row">
            { Details.renderField.bind(this)({ columnWidth: 12, entity: 'groceryList', property: 'name' }) }
          </div>,
        ]);
    }
  }
}
