
const express = require("express");

require("dotenv").config();

const Joi = require("joi");

const app = express();

app.use(express.json());

app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next(); 
});


let todos = [
  { id: 1, task: "Learn Node.js", completed: false },
  { id: 2, task: "Build CRUD API", completed: false },
  { id: 3, task: "Add gitignore file", completed: true },
];


const todoSchema = Joi.object({
  task: Joi.string().trim().min(3).required(),
  completed: Joi.boolean().optional()
});


app.get("/todos", (req, res) => {
  res.status(200).json(todos);
});

app.get("/todos/active", (req, res) => {
  const activeTodos = todos.filter((t) => !t.completed);
  res.status(200).json(activeTodos);
});

/**
 * GET TODO BY ID
 */
app.get("/todos/:id", (req, res) => {
  const todo = todos.find((t) => t.id === parseInt(req.params.id));

  if (!todo) {
    return res.status(404).json({ message: "Todo not found" });
  }

  res.status(200).json(todo);
});

app.post("/todos", (req, res, next) => {
  try {
    console.log("BODY:", req.body);

    
    const validation = todoSchema.validate(req.body);

    if (validation.error) {
      console.log("VALIDATION FAILED:", validation.error.details[0].message);

      return res.status(400).json({
        error: validation.error.details[0].message,
      });
    }

    console.log("✅ VALIDATION PASSED");

    const newTodo = {
      id: todos.length ? todos[todos.length - 1].id + 1 : 1,
      task: validation.value.task,
      completed: validation.value.completed || false,
    };

    todos.push(newTodo);

    res.status(201).json(newTodo);
  } catch (err) {
    next(err);
  }
});

app.patch("/todos/:id", (req, res, next) => {
  try {
    const todo = todos.find((t) => t.id === parseInt(req.params.id));

    if (!todo) {
      return res.status(404).json({ message: "Todo not found" });
    }

    
    const updateSchema = Joi.object({
      task: Joi.string().min(3),
      completed: Joi.boolean(),
    }).min(1); 

    const { error, value } = updateSchema.validate(req.body);

    if (error) {
      console.log("PATCH VALIDATION ERROR:", error.details[0].message);
      return res.status(400).json({
        error: error.details[0].message,
      });
    }

    // Apply & Merge updates into existing todo
    Object.assign(todo, value);

    console.log("✅ PATCH SUCCESS:", todo);

    res.status(200).json(todo);
  } catch (err) {
    next(err);
  }
});


app.delete("/todos/:id", (req, res, next) => {
  try {
    const id = parseInt(req.params.id);

    const initialLength = todos.length;

    todos = todos.filter((t) => t.id !== id);

    if (todos.length === initialLength) {
      return res.status(404).json({ error: "Not found" });
    }

    res.status(200).json({ message: "Todo deleted successfully" });
  } catch (err) {
    next(err);
  }
});


app.use((err, req, res, next) => {
  console.error(err.message); 
  res.status(500).json({ error: "Internal Server Error" });
});


const PORT = process.env.PORT || 3000;

app.listen(PORT, () => console.log(`App is running on port ${PORT}`));
