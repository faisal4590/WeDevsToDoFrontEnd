import * as types from './mutations-types';

// set todo list
export const setToDoList = ({ commit }, todos) => {
  commit(types.SET_TO_DO_LIST, todos);
};

// store todos
export const storeToDos = ({ commit }, todos) => {
  commit(types.STORE_TODOS, todos);
};
