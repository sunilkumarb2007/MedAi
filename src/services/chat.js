export const streamMessage = async function*(message, history = [], abortSignal = null, model_version = "v2") {
  const res = await fetch("http://localhost:8000/chat", {
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

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    
    buffer += decoder.decode(value, { stream: true });
    
    let boundary = buffer.indexOf('\n\n');
    while (boundary !== -1) {
       const chunkText = buffer.slice(0, boundary);
       buffer = buffer.slice(boundary + 2);
       
       if (chunkText.startsWith('data: ')) {
           try {
               const payload = JSON.parse(chunkText.slice(6));
               yield payload;
           } catch (e) { }
       }
       boundary = buffer.indexOf('\n\n');
    }
  }
};

export const uploadFile = async (file) => {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("http://localhost:8000/upload", {
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
