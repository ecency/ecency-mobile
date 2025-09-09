import { useSyncExternalStore, RefObject, useEffect, useRef } from 'react';
import { useWindowDimensions, View } from 'react-native';

/**
 * Mini Store declarations
 */

type ItemState = {
  visible: boolean;
  ref?: RefObject<View>;
};

type StoreState = {
  items: Record<string, ItemState>;
};

const createStore = (initialState: StoreState) => {
  let state = initialState;
  const listeners = new Set<() => void>();

  const getState = () => state;

  const setState = (updater) => {
    const nextState = typeof updater === 'function' ? updater(state) : updater;
    state = nextState;
    listeners.forEach((l) => l());
  };

  const subscribe = (listener) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  };

  const useStore = (selector = (s) => s) => useSyncExternalStore(subscribe, () => selector(state));

  return { getState, setState, useStore };
};

/**
 * Viewability Tracker Declarations
 */

export const viewabilityStore = createStore({
  items: {},
});

// Set visible items
export function setViewable(keys: string[]) {
  viewabilityStore.setState((s) => {
    const newItems = { ...s.items };
    Object.keys(newItems).forEach((k) => {
      newItems[k] = { ...newItems[k], visible: keys.includes(k) };
    });
    return { ...s, items: newItems };
  });
}

export function registerRef(key: string, ref: RefObject<View>) {
  viewabilityStore.setState((s) => ({
    items: {
      ...s.items,
      [key]: { ...(s.items[key] || { visible: false }), ref },
    },
  }));
}

export function unregisterKey(key: string) {
  viewabilityStore.setState((s) => {
    const newItems = { ...s.items };
    delete newItems[key];
    return { ...s, items: newItems };
  });
}

export function isViewable(ref: RefObject<View | null>, windowHeight: number): boolean {
  if (!ref?.current) return false;

  // Check visibility using measure
  let viewable = false;
  ref.current.measure?.((x, y, width, height, pageX, pageY) => {
    if (
      pageY + height > 0 &&
      pageY < windowHeight + 100 // add some buffer early gif load
    ) {
      viewable = true;
    }
  });
  return viewable;
}

export function checkViewability(windowHeight: number) {
  const state = viewabilityStore.getState();
  const visibleKeys: string[] = [];

  Object.entries(state.items).forEach(([key, { ref }]) => {
    if (isViewable(ref, windowHeight)) {
      visibleKeys.push(key);
    }
  });

  setViewable(visibleKeys);
}

/**
 * Veiwability tracker hook
 */

export const useViewabilityTracker = (isDisabled: boolean = false) => {
  const ref = useRef<View>(null);
  const key = useRef<string>(`Img-${Math.random().toString(36).substring(2, 9)}`).current; // unique key
  const { height } = useWindowDimensions();

  // Register ref once
  useEffect(() => {
    if (!isDisabled) {
      registerRef(key, ref);
    }

    return () => {
      unregisterKey(key);
    };
  }, []);

  const handleIfViewable = () => {
    if (isDisabled) {
      return;
    }
    checkViewability(height);
  };

  const _default = { visible: false };
  const state = viewabilityStore.useStore((s) => s.items[key] || _default);

  return { ref, key, visible: state.visible, handleIfViewable };
};
