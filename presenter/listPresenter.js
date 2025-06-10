import { fetchStories } from '../api.js';
import { renderList } from '../view/listView.js';

export const initListPresenter = async () => {
  const stories = await fetchStories();
  renderList(stories);
};
