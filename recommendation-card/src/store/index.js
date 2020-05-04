import Vue from 'vue'
import Vuex from 'vuex'
import createPersistedState from "vuex-persistedstate";

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    recommendations: [],
    recommendationCardStyle: {}
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
      state.recommendationCardStyle[`${patientId}`] = style
    }
  },
  actions: {

  },
  modules: {
  },
  plugins: [createPersistedState()]
})
