export const askAI = async (messages) => {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages }),
  });
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(data?.error || `Chat request failed (${response.status}).`);
  }
  if (!data?.text) throw new Error('The chat service returned no text. Please try again.');
  return data.text;
};
