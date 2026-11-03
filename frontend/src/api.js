/** Send a JSON request to the backend and return its JSON response. */
export async function apiRequest(
  path,
  options = {},
  fallbackMessage = 'Máy chủ chưa thể xử lý yêu cầu.',
) {
  const response = await fetch(path, {
    credentials: 'same-origin',
    ...options,
    headers: { 'Content-Type': 'application/json', ...options.headers },
  });
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || fallbackMessage);
  }

  return data;
}
