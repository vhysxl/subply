import {
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { NeonDatabase } from 'drizzle-orm/neon-serverless';
import { DATABASE_CONNECTION } from 'src/database/database-connection';
import * as schemas from 'schemas/index';
import { desc, eq } from 'drizzle-orm';

@Injectable()
export class AuditLogRepository {
  constructor(
    @Inject(DATABASE_CONNECTION) private db: NeonDatabase<typeof schemas>,
  ) {}

  async createLog(userId: string, activity: string) {
    try {
      const [result] = await this.db
        .insert(schemas.auditLogs)
        .values({
          admin_id: userId,
          action: activity,
        })
        .returning();

      return result;
    } catch (error) {
      console.error('Error creating Audit:', error);
      throw new InternalServerErrorException('Failed creating audit');
    }
  }

  async getAllAudits(page: number = 1, limit: number = 20) {
    try {
      const offset = (page - 1) * limit;
      const audits = await this.db
        .select({
          auditId: schemas.auditLogs.auditId,
          adminId: schemas.auditLogs.admin_id,
          adminName: schemas.usersTable.name,
          activity: schemas.auditLogs.action,
          createdAt: schemas.auditLogs.created_at,
        })
        .from(schemas.auditLogs)
        .leftJoin(
          schemas.usersTable,
          eq(schemas.auditLogs.admin_id, schemas.usersTable.userId),
        )
        .limit(limit)
        .offset(offset)
        .orderBy(desc(schemas.auditLogs.created_at));

      return audits;
    } catch (error) {
      console.error('Error fetching all users:', error);
      throw new InternalServerErrorException('Error fetching all users');
    }
  }
}
