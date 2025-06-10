export function transitionTo(callback) {
    if (document.startViewTransition) {
      document.startViewTransition(() => callback());
    } else {
      callback();
    }
  }
  
