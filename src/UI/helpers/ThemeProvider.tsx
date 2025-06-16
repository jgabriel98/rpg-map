import { ColorModeProvider, ColorModeScript, createLocalStorageManager } from "@kobalte/core";
import { ParentComponent } from "solid-js";

/** source: {@link https://www.solid-ui.com/docs/dark-mode/vite} */
const ThemeProvider: ParentComponent = (props) => {
  const storageManager = createLocalStorageManager("vite-ui-theme");

  return <>
    <ColorModeScript storageType={storageManager.type} />
    <ColorModeProvider storageManager={storageManager}>
      {props.children}
    </ColorModeProvider>
  </>;

};

export default ThemeProvider;