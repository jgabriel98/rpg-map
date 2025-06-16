import { ParentComponent, Suspense } from 'solid-js';
import ThemeProvider from './UI/helpers/ThemeProvider';
import { Toaster } from './lib/solidui/toast';

const Layout: ParentComponent = (props) => {
  return <ThemeProvider>
    <Suspense>
      {props.children}
      <Toaster />
    </Suspense>
  </ThemeProvider>;
};

export default Layout;