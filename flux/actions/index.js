import HandyTools from 'handy-tools'

export function fetchEntities(args) {
  return (dispatch) => {
    return $.ajax({
      method: 'GET',
      url: `/api/${args.directory}`
    }).then(
      (response) => {
        let obj = Object.assign(response, { type: 'FETCH_ENTITIES' });
        dispatch(obj);
      }
    );
  }
}

export function createEntity(args) {
  let { url, entityName, entity, directory, additionalData } = args;
  let data = {};
  if (entityName && entity) {
    data = { [HandyTools.convertToUnderscore(entityName)]: HandyTools.convertObjectKeysToUnderscore(entity) };
  }
  if (args.additionalData) {
    data = Object.assign(data, HandyTools.convertObjectKeysToUnderscore(additionalData));
  }
  return (dispatch) => {
    return $.ajax({
      method: 'POST',
      url: url || `/api/${directory}`,
      data
    }).then(
      (response) => {
        let obj = Object.assign(response, { type: 'CREATE_ENTITY' });
        dispatch(obj);
      },
      (response) => dispatch({
        type: 'ERRORS',
        errors: response
      })
    );
  }
}

export function fetchEntity(args) {
  return (dispatch) => {
    return $.ajax({
      method: 'GET',
      url: args.url || `/api/${args.directory}/${args.id}`
    }).then(
      (response) => {
        let obj = Object.assign(response, { type: 'FETCH_ENTITY' });
        dispatch(obj);
      }
    );
  }
}

export function updateEntity(args) {
  return (dispatch) => {
    return $.ajax({
      method: 'PATCH',
      url: args.url || `/api/${args.directory}/${args.id}`,
      data: {
        [HandyTools.convertToUnderscore(args.entityName)]: HandyTools.convertObjectKeysToUnderscore(args.entity)
      }
    }).then(
      (response) => {
        let obj = Object.assign(response, { type: 'UPDATE_ENTITY' });
        dispatch(obj);
      },
      (response) => dispatch({
        type: 'ERRORS',
        errors: response
      })
    );
  }
}

export function deleteEntity(args) {
  let { directory, id, callback, redirect } = args;
  return (dispatch) => {
    return $.ajax({
      method: 'DELETE',
      url: `/api/${directory}/${id}`
    }).then(
      (response) => {
        if (redirect) {
          window.location.pathname = `/${directory}`;
        } else {
          let obj = Object.assign(response, { type: 'DELETE_ENTITY' });
          dispatch(obj);
        }
      }
    );
  }
}

export function rearrangeEntities(args) {
  let { directory, data } = args;
  return (dispatch) => {
    return $.ajax({
      method: 'PATCH',
      url: `/api/${directory}/rearrange`,
      data
    }).then(
      (response) => {
        let obj = Object.assign(response, { type: 'REARRANGE_ENTITIES' });
        dispatch(obj);
      }
    );
  }
}
