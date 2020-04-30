import Vue from 'vue'
import Vuex from 'vuex'
import createPersistedState from "vuex-persistedstate";


Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    recommendations: []
  },
  mutations: {
    addRecommendation(state, newData) {
      state.recommendations.push(newData)
    },
    setRecommendationList(state, data) {
      state.recommendations = data
    }
  },
  actions: {
  },
  modules: {
  },
  plugins: [createPersistedState()]
})
