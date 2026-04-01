export const checkInteractions = async (drugs) => {
  try {
    const res = await fetch("http://localhost:8000/check", {
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
