interface ScrollSurface { scrollTop: number; scrollLeft: number; }
interface ScrollView { scrollTo(x: number, y: number): void; }
interface ScrollDocument {
  scrollingElement: ScrollSurface | null;
  documentElement: ScrollSurface;
  body: ScrollSurface;
}
type FrameScheduler = (callback: () => void) => number;

/** Reset every WebKit scroll owner; Safari may retain momentum across a DOM replacement. */
export function resetPageScroll(
  view: ScrollView = window,
  page: ScrollDocument = document,
  schedule: FrameScheduler = requestAnimationFrame,
): void {
  const reset = () => {
    view.scrollTo(0, 0);
    for (const surface of new Set([page.scrollingElement, page.documentElement, page.body])) {
      if (!surface) continue;
      surface.scrollTop = 0;
      surface.scrollLeft = 0;
    }
  };
  reset();
  schedule(() => {
    reset();
    schedule(reset);
  });
}
