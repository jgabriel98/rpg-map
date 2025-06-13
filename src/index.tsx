/* @refresh reload */
import { Route, Router, useNavigate } from "@solidjs/router";
import { Component, lazy, ParentComponent, ParentProps, Suspense } from 'solid-js';
import { render } from 'solid-js/web';

import { SessionProvider } from './contexts/Session.context';
import { supabase } from "./lib/supabase";
import Auth from './UI/pages/Auth.page';
import CreateMap from './UI/pages/CreateMap.page';
import Map from './UI/pages/Map.page';
import Maps from './UI/pages/Maps.page';

import './index.css';
import ThemeProvider from "./UI/providers/ThemeProvider";
import { LoadingSpinner } from "./UI/components/loading/LoadingSpinner.component";

const root = document.getElementById('root');

if (import.meta.env.DEV && !(root instanceof HTMLElement)) {
  throw new Error(
    'Root element not found. Did you forget to add it to your index.html? Or maybe the id attribute got misspelled?',
  );
}

const AuthGuard: ParentComponent = ({ children }) => {
  const AsyncSessionChecker = lazy(async () => {
    const navigate = useNavigate();
    const { session } = (await supabase.auth.getSession()).data;

    console.log('getting session', session)
    if (session === null) navigate('/auth', { replace: true });

    return {
      default: ({ children }: ParentProps) => children
    };
  })

  return <Suspense fallback={<LoadingSpinner />}>
    <AsyncSessionChecker children={children} />
  </Suspense>
}

const withAuthGuard = <P extends Record<string, any>>(Component: Component<P>): Component<P> => {
  return (props: P) => <AuthGuard>
    <Component {...props} />
  </AuthGuard>
}

// SUGESTÃO PARA ROTAS AUTENTICADAS: https://github.com/solidjs/solid-router/discussions/364#discussioncomment-11537405
render(() => (
  <SessionProvider>
    <Router root={ThemeProvider}>
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
