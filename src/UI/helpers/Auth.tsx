import { createAsync, useNavigate } from '@solidjs/router';
import { Component, createComputed, ParentComponent, Show, Suspense } from 'solid-js';
import { supabase } from '~/lib/supabase';
import { LoadingSpinner } from '../components/loading/LoadingSpinner.component';

export const AuthGuard: ParentComponent = (props) => {
  const navigate = useNavigate();
  const session = createAsync(() => supabase.auth.getSession().then(q => q.data.session));

  createComputed(() => {
    console.log('getting session', session());
    if (session() === null) navigate('/auth', { replace: true });
  });

  return <Suspense fallback={<LoadingSpinner />}>
    <Show when={session()}>
      {props.children}
    </Show>
  </Suspense>;
};

export const withAuthGuard = <P extends Record<string, unknown>>(Component: Component<P>): Component<P> => {
  return (props: P) => <AuthGuard>
    <Component {...props} />
  </AuthGuard>;
};