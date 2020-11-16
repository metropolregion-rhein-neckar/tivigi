
import Vue from 'vue'
import {formatNumberString} from "tivigi/src/util/formatters"

//###################### BEGIN Vue.js number formatter filter #########################
Vue.filter('formatNumber', formatNumberString);
