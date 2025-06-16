/* @refresh reload */
import { Route, Router } from "@solidjs/router";
import { render } from 'solid-js/web';

import Layout from './Layout';
import { AuthGuard } from './UI/helpers/Auth';
import Auth from './UI/pages/Auth.page';
import CreateMap from './UI/pages/CreateMap.page';
import EditMap from './UI/pages/EditMap.page';
import Map from './UI/pages/Map.page';
import Maps from './UI/pages/Maps.page';

import './index.css';

const root = document.getElementById('root');

if (import.meta.env.DEV && !(root instanceof HTMLElement)) {
  throw new Error(
    'Root element not found. Did you forget to add it to your index.html? Or maybe the id attribute got misspelled?',
  );
}

// SUGESTÃO PARA ROTAS AUTENTICADAS: https://github.com/solidjs/solid-router/discussions/364#discussioncomment-11537405
render(() => (
  <Router root={Layout}>
    <Route path={['/auth', '/auth/confirm']} component={Auth} />

    <Route path='/' component={AuthGuard}>
      <Route path={['/', '/maps']} component={Maps} />
      <Route path='/maps/:id' component={Map} />
      <Route path='/maps/:id/edit' component={EditMap} />
      <Route path='/maps/create' component={CreateMap} />
    </Route>

  </Router>
), root!);
