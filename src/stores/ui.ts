import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useUiStore = defineStore('ui', () => {
  // Track active loading tasks by ID and their message
  const loadingTasks = ref<Map<string, string>>(new Map());

  // App is loading if there is at least one task
  const isAppLoading = computed(() => loadingTasks.value.size > 0);
  
  // Show the message from the most recently added task
  const currentMessage = computed(() => {
    if (loadingTasks.value.size === 0) return '';
    const values = Array.from(loadingTasks.value.values());
    return values[values.length - 1];
  });

  function startLoading(id: string, message: string = 'Preparing your workspace...') {
    const newTasks = new Map(loadingTasks.value);
    newTasks.set(id, message);
    loadingTasks.value = newTasks;
  }

  function stopLoading(id: string) {
    const newTasks = new Map(loadingTasks.value);
    newTasks.delete(id);
    loadingTasks.value = newTasks;
  }

  return {
    loadingTasks,
    isAppLoading,
    currentMessage,
    startLoading,
    stopLoading
  };
});
