export default function(state = {}, action) {
  switch (action.type) {
  case 'FETCH_ENTITIES':
  case 'CREATE_ENTITY':
  case 'FETCH_ENTITY':
  case 'UPDATE_ENTITY':
  case 'DELETE_ENTITY':
  case 'REARRANGE_ENTITIES':
  case 'SEND_REQUEST':
    delete action["type"]
    return Object.assign({}, state, action);
  case 'ERRORS':
    return Object.assign({}, state, {
      errors: action.errors.responseJSON
    });
  default:
    return state;
  }
}
