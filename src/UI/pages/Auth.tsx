import { useLocation, useNavigate, useSearchParams } from '@solidjs/router'
import { createRenderEffect, createSignal } from 'solid-js'
import { useSession } from '~/contexts/Session'
import { supabase } from '~/lib/supabase'


const handleAuthToken = async (token_hash: string) => {
  const { error } = await supabase.auth.verifyOtp({
    token_hash: token_hash,
    type: 'magiclink',
  })

  if (error) alert(error.message);
  throw error;
}

type SearchParams = {
  token_hash: string
  type: string
}

export default function Auth() {
  const [loading, setLoading] = createSignal(false)
  const [email, setEmail] = createSignal('')

  const [searchParams] = useSearchParams<SearchParams>();
  const location = useLocation();
  const navigate = useNavigate();
  const session = useSession();

  createRenderEffect(() => {
    if (session()) navigate('/', { replace: true })
  })

  if (location.pathname == '/auth/confirm' && searchParams.token_hash) {
    handleAuthToken(searchParams.token_hash)
  }

  const handleLogin = async (e: SubmitEvent) => {
    e.preventDefault();

    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({
      email: email(),
      options: { emailRedirectTo: `${window.location.origin}/auth/confirm` }
    })

    if (error) alert(error.message);
    else alert('Check your email for the login link!');
    setLoading(false);
  }


  return (
    <div class="row flex-center flex">
      <div class="col-6 form-widget" aria-live="polite">
        <h1 class="header">RPG Map do gaba</h1>
        <p class="description">Sign in via magic link with your email below</p>
        <form class="form-widget" onSubmit={handleLogin}>
          <div>
            <label for="email">Email</label>
            <input
              id="email"
              class="inputField"
              type="email"
              placeholder="Your email"
              value={email()}
              onChange={(e) => setEmail(e.currentTarget.value)}
            />
          </div>
          <div>
            <button type="submit" class="button block" aria-live="polite">
              {loading() ? <span>Loading</span> : <span>Send magic link</span>}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}