import * as types from './mutations-types';

export const mutations = {
  // set todo list
  [types.SET_TO_DO_LIST](state, todos) {
    state.to_do_lists = todos;
  },
  // store todos
  [types.STORE_TODOS](state, todos) {
    state.to_dos = todos;
  }
};
