const messageInput = document.getElementById('messageInput');
const subjectSelect = document.getElementById('subjectSelect');
const postBtn = document.getElementById('postBtn');
const messagesList = document.getElementById('messagesList');

let isPosting = false;
const replyTexts = {};  // key = doubt.id, value = typed text

async function loadMessages() {
  try {
    const res = await fetch('/api/doubts');
    if (!res.ok) throw new Error(`Load failed: ${res.status}`);
    const data = await res.json();
    renderMessages(data);
  } catch (err) {
    console.error('Failed to load:', err);
  }
}

function renderMessages(messages) {
  messagesList.innerHTML = '';

  if (messages.length === 0) {
    messagesList.innerHTML = '<p style="text-align:center; color:#888; padding:40px;">No doubts yet... Be the first! 🙌</p>';
    return;
  }

  messages.forEach(msg => {
    const div = document.createElement('div');
    div.className = 'message';
    div.innerHTML = `
      <div class="subject-tag">[${msg.subject || 'General'}]</div>
      <div class="message-text">${escapeHtml(msg.text)}</div>
      <div class="timestamp">${new Date(msg.timestamp).toLocaleString('en-IN')}</div>

      <div class="reply-section">
        <input 
          type="text" 
          class="reply-input" 
          placeholder="Write your answer..." 
          id="replyInput-${msg.id}"
          value="${replyTexts[msg.id] || ''}"
          oninput="replyTexts['${msg.id}'] = this.value"
        >
        <button class="reply-btn" onclick="postReply('${msg.id}')">Reply Anonymously</button>
      </div>

      <div class="replies">
        ${msg.replies ? msg.replies.map((reply, rIndex) => `
          <div class="reply">
            ${escapeHtml(reply.text)}
            <button class="upvote-btn" onclick="upvoteReply('${msg.id}', ${rIndex})">
              👍 ${reply.upvotes || 0}
            </button>
          </div>
        `).join('') : ''}
      </div>
    `;
    messagesList.appendChild(div);
  });

  messagesList.scrollTop = messagesList.scrollHeight;
}

function escapeHtml(unsafe) {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

async function postMessage() {
  const text = messageInput.value.trim();
  const subject = subjectSelect.value;

  if (!text) return alert('Write a doubt');
  if (!subject) return alert('Select a subject');

  if (isPosting) return;
  isPosting = true;
  postBtn.disabled = true;

  try {
    const res = await fetch('/api/doubts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, subject })
    });

    if (!res.ok) throw new Error('Server error');

    messageInput.value = '';
    subjectSelect.value = '';
    await loadMessages();
  } catch (err) {
    console.error('Post failed:', err);
    alert('Something went wrong.');
  } finally {
    isPosting = false;
    postBtn.disabled = false;
  }
}

async function postReply(doubtId) {
  const replyInput = document.getElementById(`replyInput-${doubtId}`);
  const text = replyInput.value.trim();
  if (!text) return alert('Write a reply');

  try {
    const res = await fetch('/api/doubts/reply', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ doubtId: Number(doubtId), text })
    });

    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.error || 'Server error');
    }

    replyInput.value = '';
    replyTexts[doubtId] = '';
    await loadMessages();
  } catch (err) {
    console.error('Reply failed:', err);
    alert('Could not post reply: ' + err.message);
  }
}

async function upvoteReply(doubtId, replyIndex) {
  try {
    const res = await fetch('/api/doubts/upvote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ doubtId: Number(doubtId), replyIndex })
    });

    if (!res.ok) throw new Error('Upvote failed');
    await loadMessages();
  } catch (err) {
    console.error('Upvote failed:', err);
  }
}

postBtn.addEventListener('click', postMessage);

messageInput.addEventListener('keypress', e => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    postMessage();
  }
});

// Load once
loadMessages();