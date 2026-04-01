export const checkInteractions = async (drugs) => {
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
  try {
    const res = await fetch(`${API_URL}/check`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(drugs)
    });

    if (!res.ok) {
      return { results: [] };
    }

    return await res.json();
  } catch (error) {
    return { results: [] };
  }
};
