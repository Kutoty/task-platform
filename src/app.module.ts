import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { TasksController } from "./tasks.controller";
import { TasksService } from "./tasks.service";

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || "demo-secret",
      signOptions: { expiresIn: "1d" },
    }),
  ],
  controllers: [TasksController],
  providers: [TasksService],
})
export class AppModule {}
