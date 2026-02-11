import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Users API
  app.get(api.users.list.path, async (req, res) => {
    const users = await storage.getUsers();
    res.json(users);
  });

  app.post(api.users.create.path, async (req, res) => {
    try {
      const input = api.users.create.input.parse(req.body);
      const user = await storage.createUser(input);
      res.status(201).json(user);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.delete(api.users.delete.path, async (req, res) => {
    const id = Number(req.params.id);
    await storage.deleteUser(id);
    res.status(204).send();
  });

  // Tasks API
  app.get(api.tasks.list.path, async (req, res) => {
    const tasks = await storage.getTasks();
    res.json(tasks);
  });

  app.get(api.tasks.get.path, async (req, res) => {
    const task = await storage.getTask(Number(req.params.id));
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    res.json(task);
  });

  app.post(api.tasks.create.path, async (req, res) => {
    try {
      const input = api.tasks.create.input.parse(req.body);
      const task = await storage.createTask(input);
      res.status(201).json(task);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.patch(api.tasks.update.path, async (req, res) => {
    try {
      const id = Number(req.params.id);
      const input = api.tasks.update.input.parse(req.body);
      
      const existing = await storage.getTask(id);
      if (!existing) {
        return res.status(404).json({ message: 'Task not found' });
      }

      const updated = await storage.updateTask(id, input);
      res.json(updated);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.delete(api.tasks.delete.path, async (req, res) => {
    const id = Number(req.params.id);
    const existing = await storage.getTask(id);
    if (!existing) {
      return res.status(404).json({ message: 'Task not found' });
    }
    await storage.deleteTask(id);
    res.status(204).send();
  });

  // Seed Data
  await seedDatabase();

  return httpServer;
}

async function seedDatabase() {
  const existingUsers = await storage.getUsers();
  if (existingUsers.length === 0) {
    const user1 = await storage.createUser({ name: "Alice Smith", email: "alice@example.com" });
    const user2 = await storage.createUser({ name: "Bob Johnson", email: "bob@example.com" });
    
    const existingTasks = await storage.getTasks();
    if (existingTasks.length === 0) {
      await storage.createTask({
        title: "Initial Setup",
        description: "Set up the project structure and database.",
        status: "done",
        priority: "high",
        completed: true,
        assignedToId: user1.id,
        createdById: user2.id
      });
      await storage.createTask({
        title: "Review Design",
        description: "Review the new dashboard design and centered dialogs.",
        status: "todo",
        priority: "medium",
        completed: false,
        assignedToId: user2.id,
        createdById: user1.id
      });
    }
    console.log("Database seeded with users and tasks!");
  }
}
