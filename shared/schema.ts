import { mysqlTable, text, int, boolean, timestamp, uniqueIndex, varchar } from "drizzle-orm/mysql-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull().default("5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8"), // hash of "password"
  role: varchar("role", { length: 20 }).notNull().default("user"), // user, admin
  createdAt: timestamp("created_at").defaultNow(),
});

export const tasks = mysqlTable("tasks", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  status: varchar("status", { length: 20 }).notNull().default("todo"), // todo, in_progress, done
  priority: varchar("priority", { length: 20 }).notNull().default("medium"), // low, medium, high
  completed: boolean("completed").default(false),
  assignedToId: int("assigned_to_id").references(() => users.id),
  assignedToIds: text("assigned_to_ids"),
  createdById: int("created_by_id").references(() => users.id),
  attachments: text("attachments").default("[]"),
  dueDate: timestamp("due_date"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const messages = mysqlTable("messages", {
  id: int("id").autoincrement().primaryKey(),
  fromUserId: int("from_user_id").notNull().references(() => users.id),
  toUserId: int("to_user_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  readAt: timestamp("read_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const taskGroupMessages = mysqlTable("task_group_messages", {
  id: int("id").autoincrement().primaryKey(),
  taskId: int("task_id").notNull().references(() => tasks.id),
  fromUserId: int("from_user_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const taskChatGroups = mysqlTable("task_chat_groups", {
  id: int("id").autoincrement().primaryKey(),
  taskId: int("task_id").notNull().references(() => tasks.id).unique(),
  createdById: int("created_by_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const taskGroupReadStates = mysqlTable(
  "task_group_read_states",
  {
    id: int("id").autoincrement().primaryKey(),
    taskId: int("task_id").notNull().references(() => tasks.id),
    userId: int("user_id").notNull().references(() => users.id),
    lastReadAt: timestamp("last_read_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => ({
    userTaskUnique: uniqueIndex("task_group_read_states_user_task_idx").on(table.userId, table.taskId),
  })
);

export const notifications = mysqlTable("notifications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull().references(() => users.id),
  actorUserId: int("actor_user_id").references(() => users.id),
  type: varchar("type", { length: 50 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  entityType: varchar("entity_type", { length: 50 }),
  entityId: int("entity_id"),
  readAt: timestamp("read_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users)
  .omit({ id: true, createdAt: true })
  .extend({
    password: z.string().min(6, "Password must be at least 6 characters"),
    role: z.enum(["user", "admin"]).default("user"),
  });
export const insertTaskSchema = createInsertSchema(tasks)
  .omit({ id: true, createdAt: true })
  .extend({
    attachments: z.array(z.object({ name: z.string(), data: z.string(), type: z.string(), reason: z.string().optional() })).optional(),
    dueDate: z.string().nullable().optional(),
    assignedToIds: z.array(z.number()).optional(),
  });
export const insertMessageSchema = createInsertSchema(messages)
  .omit({ id: true, createdAt: true })
  .extend({
    content: z.string().min(1, "Message is required").max(1000, "Message is too long"),
  });
export const insertTaskGroupMessageSchema = createInsertSchema(taskGroupMessages)
  .omit({ id: true, createdAt: true })
  .extend({
    content: z.string().min(1, "Message is required").max(1000, "Message is too long"),
  });
export const insertTaskChatGroupSchema = createInsertSchema(taskChatGroups)
  .omit({ id: true, createdAt: true });
export const insertTaskGroupReadStateSchema = createInsertSchema(taskGroupReadStates)
  .omit({ id: true, updatedAt: true });
export const insertNotificationSchema = createInsertSchema(notifications)
  .omit({ id: true, createdAt: true, readAt: true });

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Task = typeof tasks.$inferSelect;
export type InsertTask = z.infer<typeof insertTaskSchema>;
export type UpdateTaskRequest = Partial<InsertTask>;
export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type TaskGroupMessage = typeof taskGroupMessages.$inferSelect;
export type InsertTaskGroupMessage = z.infer<typeof insertTaskGroupMessageSchema>;
export type TaskChatGroup = typeof taskChatGroups.$inferSelect;
export type InsertTaskChatGroup = z.infer<typeof insertTaskChatGroupSchema>;
export type TaskGroupReadState = typeof taskGroupReadStates.$inferSelect;
export type InsertTaskGroupReadState = z.infer<typeof insertTaskGroupReadStateSchema>;
export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
