import { DynamicProps } from "@corvu/otp-field";
import { ComponentProps, splitProps, ValidComponent } from "solid-js";
import { cn } from "~/lib/utils/solidui";

// export interface LoadingSpinnerProps extends ComponentProps<'svg'> {
//   size?: number;
//   className?: string;
// }

type LoadingSpinnerProps<T extends ValidComponent = "svg"> = ComponentProps<T> & { class?: string; size?: number }

export const LoadingSpinner = <T extends ValidComponent = "svg">(props: DynamicProps<T, LoadingSpinnerProps<T>>) => {
  const [local, others] = splitProps(props as LoadingSpinnerProps, ["class", "size"])
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={local.size}
      height={local.size}
      {...others}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      class={cn("animate-spin", local.class)}
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
};