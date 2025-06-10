const BASE_URL = 'https://story-api.dicoding.dev/v1/stories';

export const fetchStories = async () => {
  const res = await fetch(`${BASE_URL}`);
  const data = await res.json();
  return data.listStory;
};

export const postStory = async (payload, token) => {
  const res = await fetch(`${BASE_URL}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: payload,
  });
  return res.json();
};
