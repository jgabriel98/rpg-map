import { ParentComponent, Suspense } from 'solid-js';
import ThemeProvider from './UI/helpers/ThemeProvider';
import { Toaster } from './lib/solidui/toast';
import { SessionProvider } from './contexts/Session.context';

const Layout: ParentComponent = (props) => {
  return <ThemeProvider>
    <SessionProvider >
      <Suspense>
        {props.children}
        <Toaster />
      </Suspense>
    </SessionProvider>
  </ThemeProvider>;
};

export default Layout;