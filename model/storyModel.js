const API_URL = 'https://story-api.dicoding.dev/v1/stories';

export async function fetchStories() {
  const res = await fetch(`${API_URL}?size=10`);
  const data = await res.json();
  return data.listStory || [];
}

export async function addStory(formData) {
  const res = await fetch(API_URL, {
    method: 'POST',
    body: formData,
  });
  return res.json();
}
