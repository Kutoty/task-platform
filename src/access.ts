export type Task = { id: number; title: string; owner: string };

export function visibleTasks(role: string, username: string, tasks: Task[]) {
  if (role === "admin") return tasks;
  return tasks.filter((task) => task.owner === username);
}
