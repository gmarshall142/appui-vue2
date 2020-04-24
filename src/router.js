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
import NoteMaint from './views/notes/NoteMaint.vue';
import NotesView from './views/notes/NotesView.vue';
import Profile from './views/Profile.vue';
import { authGuard } from "./auth";

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
      path: '/apps/notemaint',
      name: 'notemaint',
      component: NoteMaint,
    },
    {
      path: '/apps/noteslist',
      name: 'noteslist',
      component: NotesView,
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
    {
      path: "/profile",
      name: "profile",
      component: Profile,
      beforeEnter: authGuard
    }
  ],
});
