/* eslint-disable @typescript-eslint/no-namespace */
import createPanZoom, { PanZoom } from "panzoom";
import { Accessor, createEffect, createRenderEffect, createSignal, onCleanup } from "solid-js";

declare module "solid-js" {
  namespace JSX {
    interface Directives {
      panZoom: PanZoomOptions;
    }
  }
}

type PanZoomOptions = {
  enable: boolean;
} | undefined;


/** positive value means edge is outside of screen */
function getEdgeDistance(elementRect: DOMRect) {
  return {
    top: -elementRect.top,
    left: -elementRect.left,
    right: (elementRect.x + elementRect.width - document.documentElement.clientWidth),
    bottom: (elementRect.y + elementRect.height - document.documentElement.clientHeight)
  };
}

export default function panZoom(elRef: HTMLElement, options: Accessor<PanZoomOptions>) {
  const [panZoomInstance, setPanZoomInstance] = createSignal<PanZoom>();

  createRenderEffect(() => {
    if (options()?.enable) {
      const instance = createPanZoom(elRef!, {
        bounds: true,
        boundsPadding: 0.5,
        beforeWheel: (e) => {
          // allow wheel-zoom only if cmd|ctrl is down. Otherwise - ignore
          const shouldIgnore = !(e.metaKey || e.ctrlKey);
          return shouldIgnore;
        },
        // disables doubleClick zoom (source: https://github.com/anvaka/panzoom?tab=readme-ov-file#adjust-double-click-zoom)
        zoomDoubleClickSpeed: 1,
        smoothScroll: false,
        maxZoom: 4,
        minZoom: 0.25,
        initialZoom: 0.5,
      });

      setPanZoomInstance(instance);
      adjustTransformToBounds(instance, false);
    }
  });

  onCleanup(() => panZoomInstance()?.dispose());


  const adjustTransformToBounds = (e: PanZoom, smooth = true) => {
    const elementRect = elRef.getBoundingClientRect();

    const edgesDistance = getEdgeDistance(elementRect);

    const isXFullScreen = elementRect.width >= document.documentElement.clientWidth;
    const isYFullScreen = elementRect.height >= document.documentElement.clientHeight;


    const translateFix = {
      x: e.getTransform().x,
      y: e.getTransform().y
    };

    if (isYFullScreen) {
      if (edgesDistance.top < 0) translateFix.y += edgesDistance.top;
      if (edgesDistance.bottom < 0) translateFix.y += -edgesDistance.bottom;
    } else {
      // if (edgesDistance.top > 0) translateFix.y += edgesDistance.top
      // else if (edgesDistance.bottom > 0) translateFix.y += -edgesDistance.bottom
      // if there is no Y-axis overlap, neither bottom or top
      translateFix.y = (document.documentElement.clientHeight - elementRect.height) / 2;
    }

    if (isXFullScreen) {
      if (edgesDistance.left < 0) translateFix.x += edgesDistance.left;
      if (edgesDistance.right < 0) translateFix.x += -edgesDistance.right;
    } else {
      // if (edgesDistance.left > 0) translateFix.x += edgesDistance.left
      // else if (edgesDistance.right > 0) translateFix.x += -edgesDistance.right
      // if there is no X-axis overlap, neither left or right
      translateFix.x = (document.documentElement.clientWidth - elementRect.width) / 2;
    }

    if (smooth) e.smoothMoveTo(translateFix.x, translateFix.y);
    else e.moveTo(translateFix.x, translateFix.y);
  };


  createEffect(() => {
    const _panZoomInstance = panZoomInstance();
    if (!_panZoomInstance) return;

    _panZoomInstance.on('panend', (e: PanZoom) => {
      adjustTransformToBounds(e);
    });
  });

}