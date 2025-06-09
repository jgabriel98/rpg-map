import { A } from '@solidjs/router';
import type { ParentComponent } from 'solid-js';

// import styles from './App.module.css';

const App: ParentComponent = ({children}) => {

  return (
    <>
    <nav>
      <A href="/maps">Listar mapas</A>
    </nav>
    {children}
    </>
  );
};

export default App;
