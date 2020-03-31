import Vue from 'vue';
import Vuex from 'vuex';
// import createPersistedState from "vuex-persistedstate";
Vue.use(Vuex);

import { mutations } from './mutations';
import * as actions from './actions';

const state = {
  to_do_lists: {}
};

export default new Vuex.Store({
  state,
  mutations,
  actions,
  modules: {}
});
