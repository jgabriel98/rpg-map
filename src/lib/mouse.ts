export type MouseEventWithDrag = HTMLElementEventMap['mouseup'] & {
  isDrag: boolean
}

let mouseMoved = false;
function onMouseDown(e: MouseEvent) {
  mouseMoved = false;
}
function onMouseMove(e: MouseEvent) {
  mouseMoved = true;
}
function createOnMouseUp(listener: (ev: MouseEventWithDrag) => any) {
  return (e: MouseEvent) => {
    const enrichedEvent = e as MouseEventWithDrag;
    enrichedEvent.isDrag = mouseMoved;
    return listener(enrichedEvent);
  }
}




export function listenToMouseClick<T extends HTMLElement>(el: T, listener: (ev: MouseEventWithDrag) => any) {
  el.addEventListener('pointerdown', onMouseDown);
  el.addEventListener('pointermove', onMouseMove);

  const mouseUpListener = createOnMouseUp(listener);
  el.addEventListener('pointerup', mouseUpListener);

  return function removeMouseClickListener() {
    el.removeEventListener('pointerdown', onMouseDown);
    el.removeEventListener('pointermove', onMouseMove);
    el.removeEventListener('pointerup', mouseUpListener);
  }

}



