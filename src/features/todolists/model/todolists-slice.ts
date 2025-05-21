import { setAppStatusAC } from "@/app/app-slice"
import { createAppSlice } from "@/common/utils"
import { todolistsApi } from "@/features/todolists/api/todolistsApi"
import type { Todolist } from "@/features/todolists/api/todolistsApi.types"
import { RequestStatus } from "@/common/types"
import { handleServerAppError } from "@/common/utils/handleServerAppError.ts"
import { handleServerNetworkError } from "@/common/utils/handleServerNetworkError.ts"
import { ResultCode } from "@/common/enums"


export const todolistsSlice = createAppSlice({
  name: "todolists",
  initialState: [] as DomainTodolist[],
  selectors: {
    selectTodolists: (state) => state,
  },
  reducers: (create) => ({
    changeTodolistStatusAC: create.reducer<{ id: string; entityStatus: RequestStatus }>
    ((state, action) => {
      const todolist = state.find((todolist)=>
        todolist.id === action.payload.id)
      if(todolist){
        todolist.entityStatus = action.payload.entityStatus
      }
    }),

    fetchTodolistsTC: create.asyncThunk(
      async (_, { dispatch, rejectWithValue }) => {
        try {
          dispatch(setAppStatusAC({ status: "loading" }))
          const res = await todolistsApi.getTodolists()
          dispatch(setAppStatusAC({ status: "succeeded" }))
          return { todolists: res.data }
        } catch (error) {
          dispatch(setAppStatusAC({ status: "failed" }))
          return rejectWithValue(null)
        }
      },
      {
        fulfilled: (state, action) => {
          action.payload?.todolists.forEach((tl) => {
            state.push({ ...tl, filter: "all" , entityStatus: "idle" })
          })
        },
      },
    ),
    createTodolistTC: create.asyncThunk(
      async (title: string, { dispatch, rejectWithValue }) => {
        try {
          dispatch(setAppStatusAC({ status: "loading" }));
          const res = await todolistsApi.createTodolist(title);

          // Добавляем проверку результата на успешность
          if (res.data.resultCode === ResultCode.Success) {
            dispatch(setAppStatusAC({ status: "succeeded" }));
            return { todolist: res.data.data.item };
          } else {
            // Обработка ошибки, если результат неуспешный
            handleServerAppError(res.data, dispatch);
           /* dispatch(setAppStatusAC({ status: "failed" }));*/
            return rejectWithValue(null);
          }
        } catch (error: any) {
          // Обработка ошибок сети
          handleServerNetworkError(dispatch, error); // Обработка ошибок сети
    /*      dispatch(setAppStatusAC({ status: "failed" }));*/
          return rejectWithValue(null);
        }
      },
      {
        fulfilled: (state, action) => {
          state.unshift({
            ...action.payload.todolist,
            filter: "all",
            entityStatus: "idle"
          });
        },
      }
    )
    ,
    deleteTodolistTC: create.asyncThunk(
      async (id: string, { dispatch, rejectWithValue }) => {
        try {
          dispatch(setAppStatusAC({ status: "loading" }))
          dispatch(changeTodolistStatusAC({id,entityStatus:'loading'}))
          await todolistsApi.deleteTodolist(id)
          dispatch(setAppStatusAC({ status: "succeeded" }))
          return { id }
        }catch (error: any) {
          // Обработка ошибок сети
          handleServerNetworkError(dispatch, error);
          return rejectWithValue(null);
        }
      },
      {
        fulfilled: (state, action) => {
          const index = state.findIndex((todolist) => todolist.id === action.payload.id)
          if (index !== -1) {
            state.splice(index, 1)
          }
        },
      },
    ),
    changeTodolistTitleTC: create.asyncThunk(
      async (payload: { id: string; title: string }, { dispatch, rejectWithValue }) => {
        try {
          dispatch(setAppStatusAC({ status: "loading" }))
          dispatch(changeTodolistStatusAC({ id: payload.id, entityStatus: 'loading' }))

          const res = await todolistsApi.changeTodolistTitle(payload)

          // Поскольку нет поля item, просто проверяем resultCode
          if (res.data.resultCode === ResultCode.Success) {
            dispatch(setAppStatusAC({ status: "succeeded" }))
            return { id: payload.id, title: payload.title }  // Возвращаем payload для обновления в state
          } else {
            handleServerAppError(res.data, dispatch)
            dispatch(setAppStatusAC({ status: "failed" }))
            return rejectWithValue(null)
          }
        } catch (error) {
          // Обработка ошибки сети с использованием функции handleServerNetworkError
          handleServerNetworkError(dispatch, error)
          return rejectWithValue(null)
        }
      },
      {
        fulfilled: (state, action) => {
          // Находим нужный список по ID и обновляем его название
          const index = state.findIndex((todolist) => todolist.id === action.payload.id)
          if (index !== -1) {
            state[index].title = action.payload.title
          }
        },
      },
    ),

    changeTodolistFilterAC: create.reducer<{ id: string; filter: FilterValues }>((state, action) => {
      const todolist = state.find((todolist) => todolist.id === action.payload.id)
      if (todolist) {
        todolist.filter = action.payload.filter
      }
    }),
  }),
})

export const { selectTodolists } = todolistsSlice.selectors
export const { fetchTodolistsTC,changeTodolistStatusAC, createTodolistTC, deleteTodolistTC, changeTodolistTitleTC, changeTodolistFilterAC } =
  todolistsSlice.actions
export const todolistsReducer = todolistsSlice.reducer

export type DomainTodolist = Todolist & {
  filter: FilterValues
  entityStatus: RequestStatus
}

export type FilterValues = "all" | "active" | "completed"
