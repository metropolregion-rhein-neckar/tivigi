import Vue from 'vue';

//###################### BEGIN Store data structure ######################
let data = {}
//###################### END Store data structure ######################

// Create store object:
const store = Vue.observable(data) as any;

export { store }

