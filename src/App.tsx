import type { Component } from 'solid-js';

// import logo from './logo.svg';
// import styles from './App.module.css';
import { Map } from './UI/components/Map';
import { HexGridProvider } from './UI/directives';

const App: Component = () => {
  return (
    // <div class={styles.App}>
    //   <header class={styles.header}>
    //     <img src={logo} class={styles.logo} alt="logo" />

    //     <a
    //       class={styles.link}
    //       href="https://github.com/solidjs/solid"
    //       target="_blank"
    //       rel="noopener noreferrer"
    //     >
    //       Learn Solid
    //     </a>
    //   </header>

    <HexGridProvider>
      <Map />
    </HexGridProvider>

    // </div>
  );
};

export default App;
