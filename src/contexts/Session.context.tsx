// type AuthContextType = Accessor<AuthSession | null>;

import { AuthSession, Subscription } from "@supabase/supabase-js";
import { Accessor, createContext, createSignal, onCleanup, ParentComponent, useContext } from "solid-js";
import { supabase } from "~/lib/supabase";

const SessionContext = createContext<Accessor<AuthSession | null>>(() => null);

export const SessionProvider: ParentComponent = (props) => {
  const [session, setSession] = createSignal<AuthSession | null>(null);

  const { data } = supabase.auth.onAuthStateChange((_event, newSession) => {
    // workarround for firing event on every tab focus: https://github.com/supabase/auth-js/issues/579
    if (newSession?.expires_at !== session()?.expires_at) {
      console.log('auth state changed!', _event, newSession);
      setSession(newSession);
    }
  });
  const subscription: Subscription = data.subscription;

  onCleanup(() => subscription.unsubscribe());

  return <SessionContext.Provider children={props.children} value={session} />;
};

export const useSession = () => {
  return useContext(SessionContext);
};