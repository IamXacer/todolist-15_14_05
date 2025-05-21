import { TaskPriority, TaskStatus } from "@/common/enums"
import { nanoid } from "@reduxjs/toolkit"
import { beforeEach, expect, test } from "vitest"
import { createTaskTC, deleteTaskTC, tasksReducer, type TasksState } from "../tasks-slice"

import { RequestStatus } from "@/features/todolists/api/tasksApi.types.ts"

let startState: TasksState = {}

const taskDefaultValues = {
  description: "",
  deadline: "",
  addedDate: "",
  startDate: "",
  priority: TaskPriority.Low,
  order: 0,
  entityStatus: "idle" as RequestStatus,  // Используем тип RequestStatus
}

beforeEach(() => {
  startState = {
    todolistId1: [
      { id: "1", title: "CSS", status: TaskStatus.New, todoListId: "todolistId1", ...taskDefaultValues },
      { id: "2", title: "JS", status: TaskStatus.Completed, todoListId: "todolistId1", ...taskDefaultValues },
      { id: "3", title: "React", status: TaskStatus.New, todoListId: "todolistId1", ...taskDefaultValues },
    ],
    todolistId2: [
      { id: "1", title: "bread", status: TaskStatus.New, todoListId: "todolistId2", ...taskDefaultValues },
      { id: "2", title: "milk", status: TaskStatus.Completed, todoListId: "todolistId2", ...taskDefaultValues },
      { id: "3", title: "tea", status: TaskStatus.New, todoListId: "todolistId2", ...taskDefaultValues },
    ],
  }
})

test("correct task should be deleted", () => {
  const endState = tasksReducer(
    startState,
    deleteTaskTC.fulfilled({ todolistId: "todolistId2", taskId: "2" }, "requestId", {
      todolistId: "todolistId2",
      taskId: "2",
    }),
  )

  expect(endState).toEqual({
    todolistId1: [
      {
        id: "1",
        title: "CSS",
        status: TaskStatus.New,
        description: "",
        deadline: "",
        addedDate: "",
        startDate: "",
        priority: TaskPriority.Low,
        order: 0,
        todoListId: "todolistId1",
        entityStatus: "idle", // Добавляем entityStatus
      },
      {
        id: "2",
        title: "JS",
        status: TaskStatus.Completed,
        description: "",
        deadline: "",
        addedDate: "",
        startDate: "",
        priority: TaskPriority.Low,
        order: 0,
        todoListId: "todolistId1",
        entityStatus: "idle", // Добавляем entityStatus
      },
      {
        id: "3",
        title: "React",
        status: TaskStatus.New,
        description: "",
        deadline: "",
        addedDate: "",
        startDate: "",
        priority: TaskPriority.Low,
        order: 0,
        todoListId: "todolistId1",
        entityStatus: "idle", // Добавляем entityStatus
      },
    ],
    todolistId2: [
      {
        id: "1",
        title: "bread",
        status: TaskStatus.New,
        description: "",
        deadline: "",
        addedDate: "",
        startDate: "",
        priority: TaskPriority.Low,
        order: 0,
        todoListId: "todolistId2",
        entityStatus: "idle", // Добавляем entityStatus
      },
      {
        id: "3",
        title: "tea",
        status: TaskStatus.New,
        description: "",
        deadline: "",
        addedDate: "",
        startDate: "",
        priority: TaskPriority.Low,
        order: 0,
        todoListId: "todolistId2",
        entityStatus: "idle", // Добавляем entityStatus
      },
    ],
  })
})

test("correct task should be created at correct array", () => {
  const task = {
    id: nanoid(),
    title: "juice",
    status: TaskStatus.New,
    description: "",
    deadline: "",
    addedDate: "",
    startDate: "",
    priority: TaskPriority.Low,
    order: 0,
    todoListId: "todolistId2",
    entityStatus: "idle" as RequestStatus,  // Используем тип RequestStatus
  }
  const endState = tasksReducer(
    startState,
    createTaskTC.fulfilled({ task }, "requestId", { todolistId: "todolistId2", title: "juice" }),
  )

  expect(endState.todolistId1.length).toBe(3)
  expect(endState.todolistId2.length).toBe(4)
  expect(endState.todolistId2[0].id).toBeDefined()
  expect(endState.todolistId2[0].title).toBe("juice")
  expect(endState.todolistId2[0].status).toBe(TaskStatus.New)
  expect(endState.todolistId2[0].entityStatus).toBe("idle")  // Проверяем, что entityStatus установлен
})
