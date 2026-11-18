import { Body, Controller, Get, Post, Req, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { TasksService } from "./tasks.service";

type User = { username: string; role: string };

@Controller()
export class TasksController {
  constructor(
    private readonly tasks: TasksService,
    private readonly jwt: JwtService,
  ) {}

  @Post("api/login")
  login(@Body() body: { username?: string; password?: string }) {
    const users: Record<string, { password: string; role: string }> = {
      admin: { password: "admin", role: "admin" },
      member: { password: "member", role: "member" },
    };
    const user = body.username ? users[body.username] : undefined;
    if (!user || user.password !== body.password) {
      throw new UnauthorizedException("Invalid login");
    }
    return {
      token: this.jwt.sign({ username: body.username, role: user.role }),
    };
  }

  @Get("api/tasks")
  list(@Req() req: { headers: { authorization?: string } }) {
    const user = this.readUser(req.headers.authorization);
    return this.tasks.list(user.role, user.username);
  }

  @Post("api/tasks")
  add(
    @Req() req: { headers: { authorization?: string } },
    @Body() body: { title?: string },
  ) {
    const user = this.readUser(req.headers.authorization);
    if (!body.title) throw new UnauthorizedException("Title required");
    return this.tasks.add(body.title, user.username);
  }

  private readUser(header?: string): User {
    const token = header?.startsWith("Bearer ") ? header.slice(7) : "";
    try {
      return this.jwt.verify<User>(token);
    } catch {
      throw new UnauthorizedException("Sign in required");
    }
  }
}
