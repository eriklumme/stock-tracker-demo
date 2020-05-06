import {Flow} from '@vaadin/flow-frontend/Flow';
import {Router} from '@vaadin/router';

const {serverSideRoutes} = new Flow({
  imports: () => import('../target/frontend/generated-flow-imports')
});

const routes = [
  {
    path: '',
    component: 'stock-tracker',
    action: async () => { await import('./views/stock-tracker'); }
  },
  // fallback to server-side Flow routes if no client-side routes match
  ...serverSideRoutes
];

const router = new Router(document.querySelector('#outlet'));
router.setRoutes(routes);
