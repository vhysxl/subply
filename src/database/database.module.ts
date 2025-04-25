import { Module } from '@nestjs/common';
import { DATABASE_CONNECTION } from './database-connection';
import { ConfigService } from '@nestjs/config';
import { neonConfig, Pool } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';

neonConfig.webSocketConstructor = WebSocket;

@Module({
  providers: [
    {
      provide: DATABASE_CONNECTION,
      useFactory: (ConfigService: ConfigService) => {
        const pool = new Pool({
          connectionString: ConfigService.getOrThrow('DATABASE_URL'),
        });
        const db = drizzle({ client: pool });
        return db;
      },
      inject: [ConfigService],
    },
  ],
  exports: [DATABASE_CONNECTION],
})
export class DatabaseModule {}
