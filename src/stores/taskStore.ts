// src/stores/taskStore.ts
import { defineStore } from "pinia";
import { createTask, getTasks, updateTask, deleteTask } from "@/lib/api/task";

export const useTaskStore = defineStore("task", {
  state: () => ({
    tasks: [],
  }),
  actions: {
    async fetchTasks() {
      this.tasks = await getTasks();
    },
    async addTask(title, description, category_id, due_date) {
      const newTask = await createTask(
        title,
        description,
        category_id,
        due_date,
      );
      this.tasks.push(newTask);
    },
    async updateTask(taskId, title, description, category_id, due_date) {
      const updatedTask = await updateTask(
        taskId,
        title,
        description,
        category_id,
        due_date,
      );
      const index = this.tasks.findIndex((task) => task.id === taskId);
      if (index !== -1) {
        this.tasks[index] = updatedTask;
      }
    },
    async removeTask(taskId) {
      await deleteTask(taskId);
      this.tasks = this.tasks.filter((task) => task.id !== taskId);
    },
  },
});
