import { useSyncExternalStore } from "react"

function createBreakpointHook(query: string) {
    const mql =
        typeof window === "undefined"
            ? undefined
            : window.matchMedia(query)

    function subscribe(callback: (event: MediaQueryListEvent) => void) {
        if (!mql) return () => {}
        mql.addEventListener("change", callback)
        return () => mql.removeEventListener("change", callback)
    }

    function getSnapshot() {
        return mql?.matches ?? false
    }

    function getServerSnapshot() {
        return false
    }

    return function useBreakpoint(): boolean {
        return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
    }
}

export const useIsMobile = createBreakpointHook("(max-width: 767px)")
export const useIsTablet = createBreakpointHook("(min-width: 768px) and (max-width: 1023px)")
export const useIsAboveTablet = createBreakpointHook("(min-width: 768px)")
export const useIsDesktop = createBreakpointHook("(min-width: 1024px) and (max-width: 1279px)")
export const useIsAboveDesktop = createBreakpointHook("(min-width: 1024px)")
export const useIsLarge = createBreakpointHook("(min-width: 1280px)")
