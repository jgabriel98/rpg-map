import { ParentComponent, Suspense } from "solid-js";
import { ColorModeProvider, ColorModeScript, createLocalStorageManager } from "@kobalte/core"

/** source: {@link https://www.solid-ui.com/docs/dark-mode/vite} */
const ThemeProvider: ParentComponent = (props) => {
  const storageManager = createLocalStorageManager("vite-ui-theme")

  return <>
    <ColorModeScript storageType={storageManager.type} />
    <ColorModeProvider storageManager={storageManager}>
      {/* <Nav /> */}
      <Suspense>{props.children}</Suspense>
    </ColorModeProvider>
  </>

}

export default ThemeProvider;