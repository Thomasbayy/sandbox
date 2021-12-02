import Vue from 'vue';
import VueRouter from 'vue-router';
import Home from '../views/Home.vue';
import Gravity from '../views/Gravity.vue';
import Pathfinder from '../views/Pathfinder.vue';

Vue.use(VueRouter);

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
  },
  {
    path: '/gravity',
    name: 'Gravity',
    component: Gravity,
  },
  {
    path: '/pathfinder',
    name: 'Pathfinder',
    component: Pathfinder,
  },
];

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes,
});

export default router;
