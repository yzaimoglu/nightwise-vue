// src/stores/taskStore.ts
import { defineStore } from "pinia";
import { createTask, getTasks, updateTask, deleteTask } from "@/lib/api/task";

export const useTaskStore = defineStore("task", {
  state: () => ({
    tasks: [],
    doneTasks: [], // Array to store done tasks
    showDoneTasks: false, // Flag to toggle done tasks visibility
    selectedTask: null,
    selectedPriority: null, // Add this line
  }),
  actions: {
    async fetchTasks() {
      this.tasks = await getTasks();
      console.log("Tasks fetched:", this.tasks); // Log fetched tasks
    },
    async addTask(title, description, category_id, prio_id, due_date) {
      const newTask = await createTask(
        title,
        description,
        category_id,
        prio_id,
        due_date,
      );
      this.tasks.push(newTask);
    },
    async updateTask(
      taskId,
      title,
      description,
      category_id,
      prio_id,
      due_date,
    ) {
      const updatedTask = await updateTask(
        taskId,
        title,
        description,
        category_id,
        prio_id,
        due_date,
      );
      const index = this.tasks.findIndex((task) => task.id === taskId);
      if (index !== -1) {
        this.tasks[index] = updatedTask;
      }
    },
    async deleteTask(taskId) {
      try {
        await deleteTask(taskId);
        this.tasks = this.tasks.filter((task) => task.id !== taskId);
      } catch (error) {
        console.error("Failed to delete task:", error);
      }
    },

    selectTask(task) {
      this.selectedTask = task;
    },
    clearSelectedTask() {
      this.selectedTask = null;
    },
    selectPriority(priorityId) {
      this.selectedPriority = priorityId;
    },

    markTaskAsDone(taskId) {
      const taskIndex = this.tasks.findIndex((task) => task.id === taskId);
      if (taskIndex !== -1) {
        const [doneTask] = this.tasks.splice(taskIndex, 1);
        this.doneTasks.push(doneTask);
      }
    },
    toggleShowDoneTasks() {
      this.showDoneTasks = !this.showDoneTasks;
    },
    getVisibleTasks() {
      return this.showDoneTasks ? this.doneTasks : this.tasks;
    },
  },
});
