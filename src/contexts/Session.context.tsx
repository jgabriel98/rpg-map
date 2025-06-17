import { createAsync } from '@solidjs/router';
import { AuthSession, Subscription } from "@supabase/supabase-js";
import { Accessor, createContext, JSXElement, onCleanup, ParentComponent, Suspense, useContext } from "solid-js";
import { createAsyncSignal } from '~/lib/solidjs-helpers';
import { supabase } from "~/lib/supabase";

const SessionContext = createContext<Accessor<AuthSession | null>>(() => null);

type SessionProviderProps = {
  fallback?: JSXElement;
};

export const SessionProvider: ParentComponent<SessionProviderProps> = (props) => {
  const intialSessionQuery = createAsync(() => supabase.auth.getSession().then(q => q.data.session));
  const [session, setSession] = createAsyncSignal(() => intialSessionQuery() ?? null);

  const { data } = supabase.auth.onAuthStateChange((_event, newSession) => {
    // workarround for firing event on every tab focus: https://github.com/supabase/auth-js/issues/579
    if (newSession?.expires_at !== session()?.expires_at) {
      console.log('auth state changed!', _event, newSession);
      setSession(newSession);
    }
  });
  const subscription: Subscription = data.subscription;

  onCleanup(() => subscription.unsubscribe());

  return <SessionContext.Provider value={session}>
    <Suspense fallback={props.fallback}>
      {props.children}
    </Suspense>
  </SessionContext.Provider>;
};

export const useSession = () => {
  return useContext(SessionContext);
};