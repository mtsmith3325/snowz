let skillLevel = '';

function setSkill(level) {
  skillLevel = level;
  document.getElementById('user-input').placeholder = `Asking as a ${level} rider...`;
}

async function sendMessage() {
  const input = document.getElementById('user-input');
  const messages = document.getElementById('messages');
  const userText = input.value.trim();
  if (!userText) return;

  const fullMessage = skillLevel
    ? `[Skill Level: ${skillLevel}] ${userText}`
    : userText;

  appendMessage('You', userText, 'user');
  input.value = '';

  const botMsg = appendMessage('SnowBot', 'Thinking...', 'bot');

  const res = await fetch('http://localhost:3001/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: fullMessage })
  });

  const data = await res.json();
  botMsg.querySelector('.msg-text').textContent = data.reply;
}

function appendMessage(sender, text, type) {
  const messages = document.getElementById('messages');
  const div = document.createElement('div');
  div.className = `message ${type}-message`;
  div.innerHTML = `<strong>${sender}:</strong> <span class="msg-text">${text}</span>`;
  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
  return div;
}
