# Root cause: `NotFoundError: Failed to execute 'removeChild' on 'Node'`

## What happens

React throws when it tries to remove a DOM node from its parent, but that node is no longer a child of that parent (already removed or reparented).

## Why it happens in this app

1. **GSAP animates the same nodes React owns**  
   `LocationModal` and `FinalCliffModal` animate `overlayRef` and `modalRef` (opacity, scale, y). When the user closes the modal, an `onComplete` callback runs in the same tick as the animation and calls `onClose()`, which updates parent state and unmounts the modal.

2. **Unmount in the same tick as GSAP**  
   React then runs its commit phase and tries to remove the modal’s root node from its parent. Because GSAP has just run in the same tick and may have left the DOM in an unexpected state (e.g. transforms, compositing), React’s idea of the tree can be out of sync and `removeChild` fails.

3. **Other possible contributors**  
   - **AmbientSound** uses `createPortal(..., document.body)`. If anything else (e.g. speed-of-light cleanup) mutates `document.body` around the same time, portal unmount could see a different tree.  
   - **speedOfLightAnimation** appends/removes a container from `document.body` and then calls `onComplete()` (e.g. `router.push`). That ordering is safe, but any extra DOM work in the same tick can increase the chance of confusion.

## Fixes applied

1. **LocationModal**
   - Render modal content with **createPortal** into a dedicated `#location-modal-root` so the modal is always a direct child of a single, stable container. Unmount then always removes from that container instead of from the middle of the WorldMap tree.
   - **Kill GSAP tweens** in `useEffect` cleanup and again in the close `onComplete`, so GSAP is not still animating nodes React is unmounting.
   - **Defer parent update**: in the close `onComplete`, call `onClose()` inside two `requestAnimationFrame` callbacks so the state update (and thus unmount) happens in a later frame, after GSAP and the current DOM updates are done.

2. **FinalCliffModal**
   - Same **GSAP kill** on unmount and in close `onComplete`.
   - Same **double requestAnimationFrame** before calling `onClose()` when closing from the cinematic view or after the close animation.

3. **Optional**  
   If the error ever points at the welcome → planet transition, ensure `createSpeedOfLightAnimation` only calls `onComplete()` after its own DOM cleanup and consider deferring `router.push` with `requestAnimationFrame` so it doesn’t run in the same tick as that cleanup.
