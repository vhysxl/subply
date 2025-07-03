import { Module } from '@nestjs/common';
import { DATABASE_CONNECTION } from './database-connection';
import { ConfigService } from '@nestjs/config';
import { neonConfig, Pool } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';

neonConfig.webSocketConstructor = WebSocket; // konfigurasi ke tipe websocket

@Module({
  providers: [
    {
      provide: DATABASE_CONNECTION, //initial provider (variable) yang di inject
      useFactory: (ConfigService: ConfigService) => {
        const pool = new Pool({
          connectionString: ConfigService.getOrThrow('DATABASE_URL'),
        }); // lookup env cari url db kalau tidak ada throw
        const db = drizzle({ client: pool }); // koneksi ke neon via pool
        return db; // Ini yang akan di-inject nanti
      },
      inject: [ConfigService], // yang dibutuhkan (import)
    },
  ],
  exports: [DATABASE_CONNECTION], // Supaya bisa dipakai di module lain
})
export class DatabaseModule {}
