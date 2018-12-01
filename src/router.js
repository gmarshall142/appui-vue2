import Vue from 'vue';
import Router from 'vue-router';
import Home from './views/Home.vue';
import About from './views/About.vue';
import Application from './views/Application.vue';
import Administration from './views/Administration.vue';
// import FormBuilder from './views/FormBuilder.vue';
import MenuMaint from './views/menu/MenuMaint.vue';
import MenuTree from './views/menu/DemoMenuTree2';
import Help from './views/Help.vue';
import QuoteMaint from './views/quotes/QuoteMaint.vue';
import QuotesView from './views/quotes/QuotesView.vue';

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home,
    },
    {
      path: '/home',
      name: 'home',
      component: Home,
    },
    {
      path: '/apps/quotemaint',
      name: 'quotemaint',
      component: QuoteMaint,
    },
    {
      path: '/apps/quoteslist',
      name: 'quoteslist',
      component: QuotesView,
    },
    {
      path: '/about',
      name: 'about',
      component: About,
    },
    {
      path: '/administration',
      name: 'administration',
      component: Administration,
    },
    {
      path: '/menuedit',
      name: 'menumaint',
      component: MenuMaint,
    },
    {
      path: '/menutree',
      name: 'menutree',
      component: MenuTree,
    },
    {
      path: '/help',
      name: 'help',
      component: Help,
    },
    // {
    //   path: '/form builder',
    //   name: 'formbuilder',
    //   component: FormBuilder,
    // },
    {
      path: '/apps/:appid/:pageid',
      name: 'application',
      component: Application,
    },
  ],
});
