export async function logout() {
  await fetch("/auth/logout", {
    method: "POST",
    credentials: "include",
  });
}
