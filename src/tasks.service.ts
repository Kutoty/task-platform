import { Injectable } from "@nestjs/common";
import { Pool } from "pg";
import { visibleTasks, type Task } from "./access";

@Injectable()
export class TasksService {
  private pool = new Pool({ connectionString: process.env.DATABASE_URL });

  async list(role: string, username: string): Promise<Task[]> {
    const result = await this.pool.query<Task>("select id, title, owner from tasks order by id");
    return visibleTasks(role, username, result.rows);
  }

  async add(title: string, owner: string): Promise<Task> {
    const result = await this.pool.query<Task>(
      "insert into tasks (title, owner) values ($1, $2) returning id, title, owner",
      [title, owner],
    );
    return result.rows[0];
  }
}
