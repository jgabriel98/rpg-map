import { useNavigate, useSearchParams } from '@solidjs/router';
import { batch, createEffect, createRenderEffect, createSignal, Setter } from 'solid-js';
import { useSession } from '~/contexts/Session.context';
import { Button } from '~/lib/solidui/button';
import { OTPField, OTPFieldGroup, OTPFieldInput, OTPFieldSeparator, OTPFieldSlot } from '~/lib/solidui/otp-field';
import { TextField, TextFieldErrorMessage, TextFieldInput, TextFieldLabel } from '~/lib/solidui/text-field';
import { Tooltip, TooltipContent, TooltipTrigger } from '~/lib/solidui/tooltip';
import { supabase } from '~/lib/supabase';
import { LoadingSpinner } from '../components/loading/LoadingSpinner.component';


const handleAuthToken = async (token_hash: string) => {
  const { error } = await supabase.auth.verifyOtp({
    token_hash: token_hash,
    type: 'magiclink',
  });
  if (error) alert(error.message);
};

type SearchParams = {
  token_hash: string;
  type?: string;
};

const MIN_RESEND_TIME_SECONDS = 30;

function useCounter<T>(start: T, stepper: ((current: T) => T), delayMs: number) {
  const [count, setCount] = createSignal<T>();
  let timeoutRef: ReturnType<typeof setInterval> | undefined;

  const clear = () => {
    if (timeoutRef) clearTimeout(timeoutRef);
    setCount(undefined);
  };
  const starter = () => {
    setCount(start as Setter<T>);
    timeoutRef = setInterval(() => setCount(stepper as Setter<T>), delayMs);
  };

  return [
    count,
    (start: boolean) => start ? starter() : clear()
  ] as const;
}

export default function Auth() {
  const [loading, setLoading] = createSignal(false);
  const [email, setEmail] = createSignal('');
  const [emailError, setEmailError] = createSignal(false);
  const [confirmCode, setConfirmationCode] = createSignal<string>();
  const [hasSentCode, setHasSentCode] = createSignal(false);
  const [canResendCode, setCanResendCode] = createSignal(false);


  const isSubmitEnabled = () => email() && !emailError() && !loading() && (!hasSentCode() || canResendCode());

  const [resendTimeout, setResendTimeoutActive] = useCounter(MIN_RESEND_TIME_SECONDS, (prev) => prev - 1, 1000);
  const startResendCountdown = () => batch(() => {
    setResendTimeoutActive(true);
    setCanResendCode(false);
  });

  createEffect(() => {
    if (resendTimeout() === 0) batch(() => {
      setResendTimeoutActive(false);
      setCanResendCode(true);
    });
  });

  const submitButonLabel = () => resendTimeout() ? `wait ${resendTimeout()!} seconds to send code again` : "Send confirmation code";

  const [searchParams] = useSearchParams<SearchParams>();
  const navigate = useNavigate();
  const session = useSession();

  createRenderEffect(() => {
    if (session()) navigate('/', { replace: true });
  });

  if (searchParams.type == "magiclink" && searchParams.token_hash) {
    handleAuthToken(searchParams.token_hash);
  }

  const verifyEmailInput = (value: string) => {
    const isValid = /^.+@.+\..+$/.test(value) && value.length < 256;
    setEmailError(!isValid);
    setEmail(value);
  };

  const handleSendCode = async (e: SubmitEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signInWithOtp({
      email: email(),
      options: { emailRedirectTo: `${window.location.origin}${window.location.pathname}`, },
    });
    if (error) alert(error.message);
    else {
      setHasSentCode(true);
      startResendCountdown();
    }
    setLoading(false);
  };

  const handleConfirmCode = async (token: string) => {
    setConfirmationCode(token);
    if (token.length < 6) return;
    const { error } = await supabase.auth.verifyOtp({ email: email(), token, type: 'email' });
    if (error) {
      alert(error.message);
    }
  };

  return (
    <div class="flex flex-col max-w-md w-full justify-self-center">

      <p class="description">Sign in via Confirmation Code</p>
      <form class="form-widget" onSubmit={handleSendCode}>
        <div>
          <TextField value={email()} onChange={verifyEmailInput} validationState={emailError() ? "invalid" : "valid"} disabled={hasSentCode()}>
            <TextFieldLabel for="email">Email</TextFieldLabel>

            <Tooltip>
              <TooltipTrigger as={() => <TextFieldInput type='email' id="email" placeholder="Email" />} required />
              <TooltipContent>
                <TextFieldErrorMessage>Please enter a valid email.</TextFieldErrorMessage>
              </TooltipContent>
            </Tooltip>
          </TextField>
        </div>

        <Button type="submit" class="button w-full p-0" aria-live="polite" disabled={!isSubmitEnabled()}>
          {loading() ? <LoadingSpinner class='!size-6' /> : submitButonLabel()}
        </Button>
      </form>

      <OTPField maxLength={6} id="otp" onValueChange={handleConfirmCode} class='self-center' value={confirmCode()}>
        <OTPFieldInput disabled={!hasSentCode()} />
        <OTPFieldGroup>
          <OTPFieldSlot index={0} />
          <OTPFieldSlot index={1} />
          <OTPFieldSlot index={2} />
        </OTPFieldGroup>
        <OTPFieldSeparator />
        <OTPFieldGroup>
          <OTPFieldSlot index={3} />
          <OTPFieldSlot index={4} />
          <OTPFieldSlot index={5} />
        </OTPFieldGroup>
      </OTPField>
    </div>
  );
}