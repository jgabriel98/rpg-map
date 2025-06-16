// type AuthContextType = Accessor<AuthSession | null>;

import { AuthSession, Subscription } from "@supabase/supabase-js";
import { Accessor, batch, createContext, createSignal, JSXElement, onCleanup, ParentComponent, Show, useContext } from "solid-js";
import { supabase } from "~/lib/supabase";

const SessionContext = createContext<Accessor<AuthSession | null>>(() => null);

type SessionProviderProps = {
  fallback?: JSXElement;
};

export const SessionProvider: ParentComponent<SessionProviderProps> = (props) => {
  const [session, setSession] = createSignal<AuthSession | null>(null);
  const [isSessionSet, setIsSessionSet] = createSignal(false);

  const { data } = supabase.auth.onAuthStateChange((_event, newSession) => {
    // workarround for firing event on every tab focus: https://github.com/supabase/auth-js/issues/579
    if (newSession?.expires_at !== session()?.expires_at) {
      console.log('auth state changed!', _event, newSession);
      batch(() => {
        setSession(newSession);
        setIsSessionSet(true);
      });
    }
  });
  const subscription: Subscription = data.subscription;

  onCleanup(() => subscription.unsubscribe());

  return <SessionContext.Provider value={session}>
    <Show when={isSessionSet()} fallback={props.fallback}>
      {props.children}
    </Show>
  </SessionContext.Provider>;
};

export const useSession = () => {
  return useContext(SessionContext);
};;