import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { Pool } from "pg";
import { AppModule } from "./app.module";

async function bootstrap() {
  if (process.env.DATABASE_URL) {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const schema = readFileSync(join(__dirname, "..", "schema.sql"), "utf8");
    await pool.query(schema);
    await pool.end();
  }
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT || 3000);
}

bootstrap();
