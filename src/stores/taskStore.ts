// src/stores/taskStore.ts
import Base from "../lib/api/base";

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
      const base: any = Base.getAuthStore();
      if (!base.isValid) {
        return [];
      }
      try {
        const fetchedTasks = await getTasks();
        // Clear the current tasks and doneTasks arrays
        this.tasks = [];
        this.doneTasks = [];
        // Iterate over fetched tasks and categorize them based on `task_done` status
        fetchedTasks.forEach((task) => {
          if (task.task_done) {
            this.doneTasks.push(task);
          } else {
            this.tasks.push(task);
          }
        });
      } catch (error) {
        console.error("Failed to fetch tasks:", error);
      }
    },

    async addTask(
      title,
      description,
      category_id,
      prio_id,
      due_date,
      task_done,
    ) {
      const base: any = Base.getAuthStore();
      console.log(base);
      if (!base.isValid) {
        return;
      }
      try {
        const newTask = await createTask(
          title,
          description,
          category_id,
          prio_id,
          due_date,
          task_done,
        );
        this.tasks.push(newTask);
      } catch (error) {
        console.error("Failed to add task:", error);
      }
    },

    async updateTask(
      taskId,
      title,
      description,
      category_id,
      prio_id,
      due_date,
      task_done,
    ) {
      const base: any = Base.getAuthStore();
      if (!base.isValid) {
        return;
      }
      try {
        const updatedTask = await updateTask(
          taskId,
          title,
          description,
          category_id,
          prio_id,
          due_date,
          task_done,
        );
        const index = this.tasks.findIndex((task) => task.id === taskId);
        if (index !== -1) {
          this.tasks[index] = updatedTask;
        }
      } catch (error) {
        console.error("Failed to update task:", error);
      }
    },

    async deleteTask(taskId) {
      const base: any = Base.getAuthStore();
      if (!base.isValid) {
        return;
      }
      try {
        await deleteTask(taskId);
        this.tasks = this.tasks.filter((task) => task.id !== taskId);
      } catch (error) {
        console.error("Failed to delete task:", error);
      }
    },

    selectTask(task) {
      const base: any = Base.getAuthStore();
      if (!base.isValid) {
        return {};
      }
      this.selectedTask = task;
    },
    clearSelectedTask() {
      const base: any = Base.getAuthStore();
      if (!base.isValid) {
        return;
      }
      this.selectedTask = null;
    },
    selectPriority(priorityId) {
      const base: any = Base.getAuthStore();
      if (!base.isValid) {
        return;
      }
      this.selectedPriority = priorityId;
    },

    // In taskStore.ts
    markTaskAsDone(taskId) {
      const base: any = Base.getAuthStore();
      if (!base.isValid) {
        return;
      }
      const taskIndex = this.tasks.findIndex((task) => task.id === taskId);
      if (taskIndex !== -1) {
        // First, update the task's `task_done` status in the database
        const task = this.tasks[taskIndex];
        this.updateTask(
          task.id,
          task.title,
          task.description,
          task.category_id,
          task.prio_id,
          new Date(task.due_date),
          true,
        )
          .then(() => {
            // Once the task is updated, move it to the doneTasks array
            const [doneTask] = this.tasks.splice(taskIndex, 1);
            this.doneTasks.push(doneTask);
          })
          .catch((error) =>
            console.error("Failed to mark task as done:", error),
          );
      }
    },

    async unmarkTaskAsDone(taskId) {
      const base: any = Base.getAuthStore();
      if (!base.isValid) {
        return;
      }
      // Find the task in either tasks or doneTasks
      let taskIndex = this.doneTasks.findIndex((task) => task.id === taskId);
      let task = taskIndex !== -1 ? this.doneTasks[taskIndex] : null;

      if (task) {
        try {
          // Call API to update task_done to false
          await updateTask(
            task.id,
            task.title,
            task.description,
            task.category_id,
            task.prio_id,
            task.due_date,
            false,
          );
          // Update local state to reflect the change
          task.task_done = false;
          // Optionally move the task from doneTasks to tasks if you're maintaining separate lists
          this.tasks.push(task);
          this.doneTasks.splice(taskIndex, 1);
        } catch (error) {
          console.error("Failed to unmark task as done:", error);
        }
      }
    },

    toggleShowDoneTasks() {
      const base: any = Base.getAuthStore();
      if (!base.isValid) {
        return;
      }
      this.showDoneTasks = !this.showDoneTasks;
    },
    getVisibleTasks() {
      const base: any = Base.getAuthStore();
      if (!base.isValid) {
        return [];
      }
      return this.showDoneTasks ? this.doneTasks : this.tasks;
    },
  },
});
