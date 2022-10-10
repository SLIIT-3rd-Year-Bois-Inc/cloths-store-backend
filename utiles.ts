export function errorResponse({ ...params }) {
  return { error: true, ...params };
}
