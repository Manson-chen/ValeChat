import Vue from 'vue'
import App from './App.vue'
import router from './router'
import VueRouter from 'vue-router';
import locale from 'element-ui/lib/locale/lang/en'
import VueCalendly from 'vue-calendly';
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';


import axios from 'axios'

Vue.prototype.$http = axios


// import './assets/gloable.css';

/* import the fontawesome core */
import { library } from '@fortawesome/fontawesome-svg-core'
//import { VueCalendly } from 'vue-calendly';
/* import font awesome icon component */
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

/* import specific icons */
import { faFaceSmile } from '@fortawesome/free-regular-svg-icons'

// import { Button} from 'element-ui';
// Avatar 局部注册测试用
// import { Avatar} from 'element-ui';
// import 'element-ui/lib/theme-chalk/index.css';

/* add icons to the library */
library.add(faFaceSmile)
/* add font awesome icon component */
Vue.component('font-awesome-icon', FontAwesomeIcon)
Vue.use(VueCalendly);
Vue.use(VueRouter);
Vue.use(ElementUI, { locale });
// Vue.use(Button);
// Vue.use(Avatar);


Vue.config.productionTip = false

new Vue({
  el: '#app',
  router,
  render: h => h(App),
}).$mount('#app')
