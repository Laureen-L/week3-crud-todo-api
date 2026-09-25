const express = require('express');
const app = express();
app.use(express.json()); // Parse JSON bodies

// Catch malformed JSON bodies (must come right after express.json())
app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Malformed JSON in request body' });
  }
  next(err);
});

let todos = [
  { id: 1, task: 'Learn Node.js', completed: false },
  { id: 2, task: 'Build CRUD API', completed: false },
];

// GET All – Read
app.get('/todos', (req, res) => {
  res.status(200).json(todos); // Send array as JSON
});

// GET /todos/active – Array bonus (filter !completed)
// Declared BEFORE /todos/:id so "active" isn't swallowed as an id
app.get('/todos/active', (req, res) => {
  const active = todos.filter((t) => !t.completed);
  res.status(200).json(active);
});

// GET /todos/completed – Custom Read (kept from original)
app.get('/todos/completed', (req, res) => {
  const completed = todos.filter((t) => t.completed);
  res.status(200).json(completed);
});

// GET /todos/:id – single read
app.get('/todos/:id', (req, res) => {
  const id = parseInt(req.params.id);

  if (isNaN(id)) {
    return res.status(400).json({ error: 'Invalid id — must be a number' });
  }

  const todo = todos.find((t) => t.id === id);

  if (!todo) {
    return res.status(404).json({ error: 'Todo not found' });
  }

  res.status(200).json(todo);
});

// POST New – Create, with validation requiring "task"
app.post('/todos', (req, res) => {
  const { task, completed } = req.body;

  if (!task || typeof task !== 'string' || task.trim() === '') {
    return res
      .status(400)
      .json({ error: '"task" field is required and must be a non-empty string' });
  }

  const newTodo = {
    id: todos.length + 1,
    task: task.trim(),
    completed: completed ?? false, // default if not provided
  };
  todos.push(newTodo);
  res.status(201).json(newTodo); // Echo back
});

// PATCH Update – Partial
app.patch('/todos/:id', (req, res) => {
  const id = parseInt(req.params.id);

  if (isNaN(id)) {
    return res.status(400).json({ error: 'Invalid id — must be a number' });
  }

  const todo = todos.find((t) => t.id === id); // Array.find()
  if (!todo) return res.status(404).json({ error: 'Todo not found' });

  // If a task is being updated, validate it the same way as POST
  if ('task' in req.body) {
    const { task } = req.body;
    if (!task || typeof task !== 'string' || task.trim() === '') {
      return res
        .status(400)
        .json({ error: '"task" field must be a non-empty string' });
    }
  }

  Object.assign(todo, req.body); // Merge: e.g., {completed: true}
  res.status(200).json(todo);
});

// DELETE Remove
app.delete('/todos/:id', (req, res) => {
  const id = parseInt(req.params.id);

  if (isNaN(id)) {
    return res.status(400).json({ error: 'Invalid id — must be a number' });
  }

  const initialLength = todos.length;
  todos = todos.filter((t) => t.id !== id); // Array.filter() – non-destructive
  if (todos.length === initialLength)
    return res.status(404).json({ error: 'Not found' });
  res.status(204).send(); // Silent success
});

// Generic fallback error handler (keep last)
app.use((err, req, res, next) => {
  res.status(500).json({ error: 'Server error!' });
});

const PORT = 3002;
app.listen(PORT, () => console.log(`Server on port ${PORT}`));