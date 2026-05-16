import type Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { safeScrollTriggerRefresh } from "./scrollTriggerSafe";

gsap.registerPlugin(ScrollTrigger);

export function bindLenisToScrollTrigger(lenis: Lenis): () => void {
  lenis.on("scroll", ScrollTrigger.update);

  ScrollTrigger.scrollerProxy(document.documentElement, {
    scrollTop(value?: number) {
      if (typeof value === "number") {
        lenis.scrollTo(value, { immediate: true });
      }
      return lenis.scroll;
    },
    getBoundingClientRect() {
      return {
        top: 0,
        left: 0,
        width: window.innerWidth,
        height: window.innerHeight,
      };
    },
  });

  const onRefresh = () => {
    try {
      lenis.resize();
    } catch {
      /* lenis may be destroyed */
    }
  };
  ScrollTrigger.addEventListener("refresh", onRefresh);
  safeScrollTriggerRefresh();

  return () => {
    ScrollTrigger.removeEventListener("refresh", onRefresh);
    ScrollTrigger.scrollerProxy(document.documentElement, {});
  };
}
