// Every API call goes through this one function, so sending cookies,
// reading JSON and turning error responses into errors is written once.
export async function request(path, { method = "GET", body } = {}) {
  const response = await fetch(path, {
    method,
    // Send the login cookie with the request.
    credentials: "include",
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });

  // 204 No Content: success, but there is no body to read.
  if (response.status === 204) return null;

  const data = await response.json().catch(() => null);

  // fetch() only fails when the network does; a 400 or 500 still "succeeds",
  // so check the status and throw the server's message ourselves.
  if (!response.ok) {
    throw new Error(data?.error ?? "Something went wrong");
  }
  return data;
}
