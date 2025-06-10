export const applyTransition = () => {
    if (document.startViewTransition) {
      document.startViewTransition(() => {});
    }
  };
  
  