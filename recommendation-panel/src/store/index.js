import Vue from 'vue'
import Vuex from 'vuex'
import createPersistedState from "vuex-persistedstate";


Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    recommendations: [],
    recommendationPanelStyle: {}
  },
  mutations: {
    addRecommendation(state, newData) {
      state.recommendations.push(newData)
    },
    setRecommendationList(state, data) {
      state.recommendations = data
    },
    saveStyle(state, data) {
      const { patientId, style } = data
      state.recommendationPanelStyle[`${patientId}`] = style
    }
  },
  actions: {
  },
  modules: {
  },
  plugins: [createPersistedState()]
})
