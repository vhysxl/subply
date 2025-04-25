import { Inject, Injectable } from '@nestjs/common';
import { NeonDatabase } from 'drizzle-orm/neon-serverless';
import { DATABASE_CONNECTION } from 'src/database/database-connection';
import * as schemas from 'schemas/index';
import { User } from '../../../interfaces/user.interface';
import { eq } from 'drizzle-orm';

@Injectable()
export class UserRepository {
  constructor(
    @Inject(DATABASE_CONNECTION) private db: NeonDatabase<typeof schemas>,
  ) {}

  async createUser({ email, name, password }: User) {
    try {
      const user = await this.db.insert(schemas.usersTable).values({
        email,
        name,
        password,
      });

      return user;
    } catch (error) {
      console.error('Error creating user:', error);
      throw new Error('Error creating user');
    }
  }

  async findUserByEmail(email: string) {
    try {
      const user = await this.db
        .select()
        .from(schemas.usersTable)
        .where(eq(schemas.usersTable.email, email));

      return user;
    } catch (error) {
      console.error('Error finding user by email:', error);
      throw new Error('Error finding user by email');
    }
  }
}
