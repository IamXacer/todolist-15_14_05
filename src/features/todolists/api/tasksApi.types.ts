import { TaskPriority, TaskStatus } from "@/common/enums/enums"

// Добавляем RequestStatus
export type RequestStatus = "idle" | "loading" | "succeeded" | "failed"

export type DomainTask = {
  description: string
  title: string
  status: TaskStatus
  priority: TaskPriority
  startDate: string
  deadline: string
  id: string
  todoListId: string
  order: number
  addedDate: string
  entityStatus: RequestStatus // Добавляем entityStatus
}

export type GetTasksResponse = {
  error: string | null
  totalCount: number
  items: DomainTask[]
}

export type UpdateTaskModel = {
  description: string
  title: string
  status: TaskStatus
  priority: TaskPriority
  startDate: string
  deadline: string
}
export type Task = DomainTask & { entityStatus: RequestStatus }

export type TasksState = Record<string, Task[]> // Структура состояния: ключ — это todolistId, а значение — массив задач
