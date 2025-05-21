import { changeTaskEntityStatusAC, setAppStatusAC } from "@/app/app-slice"
import type { RootState } from "@/app/store"
import { createAppSlice } from "@/common/utils"
import { tasksApi } from "@/features/todolists/api/tasksApi"
import type { DomainTask, UpdateTaskModel } from "@/features/todolists/api/tasksApi.types"
import { createTodolistTC, deleteTodolistTC } from "./todolists-slice"
import { ResultCode } from "@/common/enums"
import { handleServerAppError } from "@/common/utils/handleServerAppError.ts"
import { handleServerNetworkError } from "@/common/utils/handleServerNetworkError.ts"
import axios from "axios"
import { RequestStatus } from "@/common/types"

export const tasksSlice = createAppSlice({
  name: "tasks",
  initialState: {} as TasksState,
  selectors: {
    selectTasks: (state) => state,
  },
  extraReducers: (builder) => {
    builder
      .addCase(changeTaskEntityStatusAC, (state, action) => {
        const tasks = state[action.payload.todolistId];
        const task = tasks.find((t) => t.id === action.payload.taskId);
        if (task) {
          task.entityStatus = action.payload.entityStatus;
        }
      })
      .addCase(createTodolistTC.fulfilled, (state, action) => {
        state[action.payload.todolist.id] = []
      })
      .addCase(deleteTodolistTC.fulfilled, (state, action) => {
        delete state[action.payload.id]
      })
  },
  reducers: (create) => ({
    fetchTasksTC: create.asyncThunk(
      async (todolistId: string, { dispatch, rejectWithValue }) => {
        try {
          dispatch(setAppStatusAC({ status: "loading" })) // Устанавливаем статус загрузки
          const res = await tasksApi.getTasks(todolistId) // Запрашиваем задачи
          dispatch(setAppStatusAC({ status: "succeeded" })) // Статус успешного выполнения
          return { todolistId, tasks: res.data.items } // Возвращаем задачи
        } catch (error: any) {
          console.error("Error in fetchTasksTC:", error) // Логирование ошибки

          // Обработка ошибок сети (например, ошибка от axios)
          if (axios.isAxiosError(error)) {
            handleServerNetworkError(dispatch, error) // Обработка ошибок сети
          } else {
            // Если ошибка от сервера с сообщениями
            handleServerAppError(error.response?.data, dispatch) // Обработка ошибок от сервера (если есть данные с ошибкой)
          }
          return rejectWithValue(null) // Возвращаем ошибку
        }
      },
      {
        fulfilled: (state, action) => {
          state[action.payload.todolistId] = action.payload.tasks // Добавляем задачи в состояние
        },
      }
    )


    ,
    createTaskTC: create.asyncThunk(
      async (payload: { todolistId: string; title: string }, { dispatch, rejectWithValue }) => {
        try {
          dispatch(setAppStatusAC({ status: "loading" }))
          const res = await tasksApi.createTask(payload)
          if (res.data.resultCode === ResultCode.Success) {
            dispatch(setAppStatusAC({ status: "succeeded" }))
            return { task: res.data.data.item }
          }  else {
            handleServerAppError(res.data, dispatch)
            dispatch(setAppStatusAC({ status: "failed" }))
            return rejectWithValue(null)
          }
        } catch (error: any) {
          handleServerNetworkError(dispatch, error) // Общая обработка ошибок сети и прочего
          return rejectWithValue(null)
        }
      },
      {
        fulfilled: (state, action) => {
          state[action.payload.task.todoListId].unshift(action.payload.task) // Добавление задачи в состояние
        },
      }
    )
    ,

    deleteTaskTC: create.asyncThunk(
      async (payload: { todolistId: string; taskId: string }, { dispatch, rejectWithValue }) => {
        try {
          dispatch(setAppStatusAC({ status: "loading" }))
          await tasksApi.deleteTask(payload)
          dispatch(setAppStatusAC({ status: "succeeded" }))
          return payload
        }catch (error: any) {
          // Обработка ошибок сети
          handleServerNetworkError(dispatch, error);
          return rejectWithValue(null);
        }
      },
      {
        fulfilled: (state, action) => {
          const tasks = state[action.payload.todolistId]
          const index = tasks.findIndex((task) => task.id === action.payload.taskId)
          if (index !== -1) {
            tasks.splice(index, 1)
          }
        },
      },
    )
    ,
      updateTaskTC: create.asyncThunk(
        async (
          payload: { todolistId: string; taskId: string; domainModel: Partial<UpdateTaskModel> },
          { dispatch, getState, rejectWithValue },
        ) => {
          const { todolistId, taskId, domainModel } = payload
          const allTodolistTasks = (getState() as RootState).tasks[todolistId]
          const task = allTodolistTasks.find((task) => task.id === taskId)
          if (!task) {
            return rejectWithValue(null)
          }
          const model: UpdateTaskModel = {
            description: task.description,
            title: task.title,
            priority: task.priority,
            startDate: task.startDate,
            deadline: task.deadline,
            status: task.status,
            ...domainModel,  }
          try {
            dispatch(setAppStatusAC({ status: "loading" }))
            const res = await tasksApi.updateTask({ todolistId, taskId, model })
            if (res.data.resultCode === ResultCode.Success) {
              dispatch(setAppStatusAC({ status: "succeeded" }))
              return { task: res.data.data.item }
            }  else {
              handleServerAppError(res.data, dispatch)
              dispatch(setAppStatusAC({ status: "failed" }))
              return rejectWithValue(null)
            }
          }
          catch (error: any) {
            // Обработка ошибок сети
            handleServerNetworkError(dispatch, error);
            return rejectWithValue(null);
          }
        },
        {
          fulfilled: (state, action) => {
            const allTodolistTasks = state[action.payload.task.todoListId]
            const taskIndex = allTodolistTasks.findIndex((task) => task.id === action.payload.task.id)
            if (taskIndex !== -1) {
              allTodolistTasks[taskIndex] = action.payload.task
            }
          },
        },
      )
    ,
    changeTaskTitleAC: create.reducer<{ todolistId: string; taskId: string; title: string }>((state, action) => {
      const task = state[action.payload.todolistId].find((task) => task.id === action.payload.taskId)
      if (task) {
        task.title = action.payload.title
      }
    }),
  }),
})

export const { selectTasks } = tasksSlice.selectors
export const { fetchTasksTC, createTaskTC, deleteTaskTC, updateTaskTC } = tasksSlice.actions
export const tasksReducer = tasksSlice.reducer

/*export type TasksState = Record<string, DomainTask[]>*/
export type TasksState = Record<string, TaskWithStatus[]>
export type TaskWithStatus = DomainTask & {entityStatus:RequestStatus}
