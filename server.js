const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();

app.use(express.json());
app.use(cors());
app.use(express.static('public'));

const dataFile = path.join(__dirname, 'doubts.json');

function getDoubts() {
  try {
    if (fs.existsSync(dataFile)) {
      return JSON.parse(fs.readFileSync(dataFile, 'utf8'));
    }
    return [];
  } catch (err) {
    console.log('Read error:', err.message);
    return [];
  }
}

function saveDoubts(doubts) {
  try {
    fs.writeFileSync(dataFile, JSON.stringify(doubts, null, 2), 'utf8');
    console.log('Data saved!');
  } catch (err) {
    console.log('Save error:', err.message);
  }
}

app.get('/api/doubts', (req, res) => {
  let doubts = getDoubts();
  doubts.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  res.json(doubts);
});

app.post('/api/doubts', (req, res) => {
  const { text, subject } = req.body;
  if (!text || !subject) return res.status(400).json({ error: 'Text and subject required' });

  let doubts = getDoubts();
  const newDoubt = {
    id: Date.now(),  // unique ID
    text: text.trim(),
    subject,
    timestamp: new Date().toISOString(),
    replies: []
  };
  doubts.push(newDoubt);
  saveDoubts(doubts);
  res.status(201).json(newDoubt);
});

app.post('/api/doubts/reply', (req, res) => {
  const { doubtId, text } = req.body;
  if (!doubtId || !text) return res.status(400).json({ error: 'Doubt ID and text required' });

  let doubts = getDoubts();
  const doubt = doubts.find(d => d.id === Number(doubtId));
  if (!doubt) return res.status(404).json({ error: 'Doubt not found' });

  if (!doubt.replies) doubt.replies = [];

  doubt.replies.push({
    text: text.trim(),
    timestamp: new Date().toISOString(),
    upvotes: 0
  });

  saveDoubts(doubts);
  console.log('Reply added to doubt ID:', doubtId);
  res.status(201).json({ success: true });
});

app.post('/api/doubts/upvote', (req, res) => {
  const { doubtId, replyIndex } = req.body;
  if (!doubtId || replyIndex === undefined) return res.status(400).json({ error: 'Invalid data' });

  let doubts = getDoubts();
  const doubt = doubts.find(d => d.id === Number(doubtId));
  if (!doubt) return res.status(404).json({ error: 'Doubt not found' });

  let replies = doubt.replies || [];
  if (replyIndex < 0 || replyIndex >= replies.length) return res.status(400).json({ error: 'Reply not found' });

  replies[replyIndex].upvotes = (replies[replyIndex].upvotes || 0) + 1;

  saveDoubts(doubts);
  res.json({ success: true });
});

const port = 4000;
app.listen(port, () => {
  console.log(`Silent Struggle server running on http://localhost:${port}`);
  console.log('Doubts saved in doubts.json');
});