import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type TaskPriority = 'alta' | 'media' | 'baja';
export type TaskStatus = 'pendiente' | 'en_progreso' | 'completada' | 'cancelada';

export interface MedicalTask {
  id: string;
  title: string;
  description: string;
  patientId?: number;
  patientName?: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate?: string;
  created: string;
  updated: string;
  tags: string[];
  assignedToId?: number;
  assignedToName?: string;
  notes?: string;
}

interface MedicalTasksState {
  tasks: MedicalTask[];
  addTask: (task: Omit<MedicalTask, 'id' | 'created' | 'updated'>) => void;
  updateTask: (id: string, updates: Partial<Omit<MedicalTask, 'id' | 'created' | 'updated'>>) => void;
  deleteTask: (id: string) => void;
  completeTask: (id: string) => void;
  cancelTask: (id: string) => void;
  setTaskStatus: (id: string, status: TaskStatus) => void;
  filterTasksByStatus: (status: TaskStatus | 'todas') => MedicalTask[];
  filterTasksByPriority: (priority: TaskPriority | 'todas') => MedicalTask[];
  filterTasksByPatient: (patientId: number) => MedicalTask[];
  getTasksByDueDate: (date: string) => MedicalTask[];
  getTasksForToday: () => MedicalTask[];
  getTasksForTomorrow: () => MedicalTask[];
  getOverdueTasks: () => MedicalTask[];
}

export const useMedicalTasksStore = create<MedicalTasksState>()(
  persist(
    (set, get) => ({
      tasks: [],
      
      addTask: (taskData) => {
        const now = new Date().toISOString();
        const task: MedicalTask = {
          ...taskData,
          id: `task_${Date.now()}`,
          created: now,
          updated: now,
        };
        
        set((state) => ({
          tasks: [...state.tasks, task]
        }));
      },
      
      updateTask: (id, updates) => {
        set((state) => ({
          tasks: state.tasks.map((task) => 
            task.id === id
              ? { ...task, ...updates, updated: new Date().toISOString() }
              : task
          )
        }));
      },
      
      deleteTask: (id) => {
        set((state) => ({
          tasks: state.tasks.filter((task) => task.id !== id)
        }));
      },
      
      completeTask: (id) => {
        set((state) => ({
          tasks: state.tasks.map((task) => 
            task.id === id
              ? { ...task, status: 'completada', updated: new Date().toISOString() }
              : task
          )
        }));
      },
      
      cancelTask: (id) => {
        set((state) => ({
          tasks: state.tasks.map((task) => 
            task.id === id
              ? { ...task, status: 'cancelada', updated: new Date().toISOString() }
              : task
          )
        }));
      },
      
      setTaskStatus: (id, status) => {
        set((state) => ({
          tasks: state.tasks.map((task) => 
            task.id === id
              ? { ...task, status, updated: new Date().toISOString() }
              : task
          )
        }));
      },
      
      filterTasksByStatus: (status) => {
        const { tasks } = get();
        return status === 'todas' 
          ? tasks 
          : tasks.filter((task) => task.status === status);
      },
      
      filterTasksByPriority: (priority) => {
        const { tasks } = get();
        return priority === 'todas' 
          ? tasks 
          : tasks.filter((task) => task.priority === priority);
      },
      
      filterTasksByPatient: (patientId) => {
        const { tasks } = get();
        return tasks.filter((task) => task.patientId === patientId);
      },
      
      getTasksByDueDate: (date) => {
        const { tasks } = get();
        const dateToCheck = new Date(date);
        dateToCheck.setHours(0, 0, 0, 0);
        
        return tasks.filter((task) => {
          if (!task.dueDate) return false;
          
          const taskDate = new Date(task.dueDate);
          taskDate.setHours(0, 0, 0, 0);
          
          return taskDate.getTime() === dateToCheck.getTime();
        });
      },
      
      getTasksForToday: () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return get().getTasksByDueDate(today.toISOString());
      },
      
      getTasksForTomorrow: () => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);
        return get().getTasksByDueDate(tomorrow.toISOString());
      },
      
      getOverdueTasks: () => {
        const { tasks } = get();
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        return tasks.filter((task) => {
          if (!task.dueDate || task.status === 'completada' || task.status === 'cancelada') return false;
          
          const taskDate = new Date(task.dueDate);
          taskDate.setHours(0, 0, 0, 0);
          
          return taskDate.getTime() < today.getTime();
        });
      },
    }),
    {
      name: 'medical-tasks-storage',
    }
  )
);