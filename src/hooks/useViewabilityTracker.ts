import { useSyncExternalStore, RefObject, useEffect, useRef, useState } from 'react';
import { View } from 'react-native';



/**
 * Mini Store declarations
 */

const createStore = (initialState) => {
  let state = initialState;
  const listeners = new Set<() => void>();

  const getState = () => state;

  const setState = (updater) => {
    const nextState =
      typeof updater === 'function' ? updater(state) : updater;
    state = nextState;
    listeners.forEach((l) => l());
  };

  const subscribe = (listener) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  };

  const useStore = (selector = (s) => s) =>
    useSyncExternalStore(subscribe, () => selector(state));

  return { getState, setState, useStore };
}




/**
 * Viewability Tracker Declarations
 */


type ItemState = {
  visible: boolean;
  playing: boolean;
  ref?: RefObject<View>;
};

type StoreState = {
  items: Record<string, ItemState>;
};

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

export function play(key: string) {
  viewabilityStore.setState((s) => ({
    items: {
      ...s.items,
      [key]: { ...(s.items[key] || {}), playing: true },
    },
  }));
}

export function pause(key: string) {
  viewabilityStore.setState((s) => ({
    items: {
      ...s.items,
      [key]: { ...(s.items[key] || {}), playing: false },
    },
  }));
}

export function registerRef(key: string, ref: RefObject<View>) {
  viewabilityStore.setState((s) => ({
    items: {
      ...s.items,
      [key]: { ...(s.items[key] || { playing: false }), ref },
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



/**
 * Veiwability tracker hook
 */

export const useViewabilityTracker = () => {
  const ref = useRef<View>(null);
  const [key, setKey] = useState<string>('');

  // Register ref once
  useEffect(() => {
    const totalItems = Object.keys(viewabilityStore.getState().items).length;
    setKey("Img-" + totalItems);
    registerRef("Img-" + totalItems, ref);
    // return () => unregisterKey(key);
  }, []);

  const state = viewabilityStore.useStore((s) => s.items[key] || { visible: false, playing: false });

  // Auto play/pause when visibility changes
  useEffect(() => {
    if (state.visible) play(key);
    else pause(key);
  }, [state.visible]);

  return { ref, key, visible: state.visible, playing: state.playing };
}