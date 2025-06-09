/* @refresh reload */
import { Route, Router, useNavigate } from "@solidjs/router";
import { lazy, ParentComponent, ParentProps, Suspense } from 'solid-js';
import { render } from 'solid-js/web';

import { SessionProvider } from './contexts/Session.context';
import { supabase } from "./lib/supabase";
import Auth from './UI/pages/Auth.page';
import CreateMap from './UI/pages/CreateMap.page';
import Map from './UI/pages/Map.page';
import Maps from './UI/pages/Maps.page';

import './index.css';
import Loading from "./UI/components/Loading.component";

const root = document.getElementById('root');

if (import.meta.env.DEV && !(root instanceof HTMLElement)) {
  throw new Error(
    'Root element not found. Did you forget to add it to your index.html? Or maybe the id attribute got misspelled?',
  );
}

const AuthGuard: ParentComponent = ({ children }) => {

  const AsyncSessionChecker = lazy(async () => {
    const navigate = useNavigate();
    const { data } = await supabase.auth.getSession();

    console.log('getting  session', data.session)
    if (data.session === null) navigate('/auth', { replace: true });

    return {
      default: ({ children }: ParentProps) => children
    };
  })

  return <Suspense fallback={<Loading />}>
    <AsyncSessionChecker children={children} />
  </Suspense>
}


// SUGESTÃO PARA ROTAS AUTENTICADAS: https://github.com/solidjs/solid-router/discussions/364#discussioncomment-11537405
render(() => (
  <SessionProvider>
    <Router>
      <Route path={['/auth', '/auth/confirm']} component={Auth} />

        <Route path='/' component={AuthGuard}>
          <Route path='/' component={Maps} />
          <Route path='/maps' component={Maps} />
          <Route path='/maps/:id' component={Map} />
          <Route path='/maps/create' component={CreateMap} />
        </Route>

    </Router>
  </SessionProvider>
), root!);
