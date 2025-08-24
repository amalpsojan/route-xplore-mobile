const API_BASE = process.env.EXPO_PUBLIC_API_BASE_URL || "http://localhost:5050";

export async function parseLink(link: string) {
  const res = await fetch(`${API_BASE}/api/parse-link`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ link }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`parse-link failed: ${res.status} ${text}`);
  }
  return res.json();
}


