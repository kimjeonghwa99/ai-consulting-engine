const toggleBtn = document.getElementById("ai-toggle");
const chatBox = document.getElementById("ai-chat");
const sendBtn = document.getElementById("sendBtn");
const input = document.getElementById("userInput");
const messages = document.getElementById("messages");

// ⚠️ Codespaces / 로컬 모두 대응
const API_URL = "http://localhost:3000/api/chat";

toggleBtn.onclick = () => {
  chatBox.classList.toggle("hidden");
};

function addMessage(text, role) {
  const div = document.createElement("div");
  div.className = `message ${role}`;
  div.innerText = text;
  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
}

sendBtn.onclick = sendMessage;
input.addEventListener("keydown", (e) => {
  if (e.key === "Enter") sendMessage();
});

async function sendMessage() {
  const text = input.value.trim();
  if (!text) return;

  addMessage(text, "user");
  input.value = "";

  const loading = document.createElement("div");
  loading.className = "message ai";
  loading.innerText = "답변 중...";
  messages.appendChild(loading);
  messages.scrollTop = messages.scrollHeight;

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        scenario: "company",
        message: text,
      }),
    });

    // 서버가 살아있지만 에러인 경우
    if (!res.ok) {
      throw new Error("API response not ok");
    }

    const data = await res.json();
    loading.remove();
    addMessage(
      data.answer ||
        "🧪 Mock 응답입니다. (API 키 없이 테스트 중)",
      "ai"
    );
  } catch (err) {
    // 🔥 API 키 없음 / 서버 미실행 / CORS 등 모든 경우 fallback
    loading.remove();
    addMessage(
      "🧪 Mock 응답입니다. 현재 AI 서버 없이 위젯 UI만 테스트 중입니다.",
      "ai"
    );
    console.warn("Mock mode:", err.message);
  }
}
