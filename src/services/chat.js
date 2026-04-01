export const fetchMessage = async (message, history = [], abortSignal = null, model_version = "v2") => {
  const API_URL = import.meta.env.VITE_API_URL || "https://medai-ve79.onrender.com";
  const res = await fetch(`${API_URL}/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ message, history, model_version }),
    signal: abortSignal
  });

  if (!res.ok) {
    throw new Error(`API error: ${res.status}`);
  }

  return await res.json();
};

export const uploadFile = async (file) => {
  const API_URL = import.meta.env.VITE_API_URL || "https://medai-ve79.onrender.com";
  try {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(`${API_URL}/upload`, {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      return { reply: `Upload error: ${res.status}` };
    }

    return await res.json();
  } catch (error) {
    return { reply: `Network Error: ${error.message}` };
  }
};
