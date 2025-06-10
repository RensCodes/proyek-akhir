import { initListPresenter } from './presenter/listPresenter.js';
import { initFormPresenter } from './presenter/formPresenter.js';
import { applyTransition } from './utils/viewTransition.js';

export const router = () => {
  const hash = location.hash;
  applyTransition();

  if (hash === '#/add') {
    initFormPresenter();
  } else {
    initListPresenter();
  }
};
