import { createAction, createSlice } from "@reduxjs/toolkit"
import { RequestStatus } from "@/common/types"
import { DomainTask } from "@/features/todolists/api/tasksApi.types"

// Тип для задачи, включая статус
export type Task = DomainTask & { entityStatus: RequestStatus }

// Тип состояния задач
export type TasksState = Record<string, Task[]> // Массив задач по ключу todolistId

// Экшен для изменения статуса задачи
export const changeTaskEntityStatusAC = createAction<{
  todolistId: string;
  taskId: string;
  entityStatus: RequestStatus;
}>('tasks/changeTaskEntityStatus')

export const appSlice = createSlice({
  name: "app",
  initialState: {
    themeMode: "light" as ThemeMode,
    status: "idle" as RequestStatus,
    error: null as string | null,
    tasks: {} as TasksState, // Добавляем состояние для задач
  },
  selectors: {
    selectThemeMode: (state) => state.themeMode,
    selectAppStatus: (state) => state.status,
    selectAppError: (state) => state.error,
    selectTasks: (state) => state.tasks, // Селектор для задач
  },
  reducers: (create) => ({
    setAppErrorAC: create.reducer<{ error: string | null }>((state, action) => {
      state.error = action.payload.error
    }),
    changeThemeModeAC: create.reducer<{ themeMode: ThemeMode }>((state, action) => {
      state.themeMode = action.payload.themeMode
    }),
    setAppStatusAC: create.reducer<{ status: RequestStatus }>((state, action) => {
      state.status = action.payload.status
    }),
  }),
  extraReducers: (builder) => {
    builder.addCase(changeTaskEntityStatusAC, (state, action) => {
      // Обновляем состояние задачи по todolistId
      const tasks = state.tasks[action.payload.todolistId]
      const task = tasks?.find(t => t.id === action.payload.taskId)
      if (task) {
        task.entityStatus = action.payload.entityStatus
      }
    })
  }
})

export const { selectThemeMode, selectAppStatus, selectAppError, selectTasks } = appSlice.selectors
export const { changeThemeModeAC, setAppStatusAC, setAppErrorAC } = appSlice.actions
export const appReducer = appSlice.reducer

export type ThemeMode = "dark" | "light"
