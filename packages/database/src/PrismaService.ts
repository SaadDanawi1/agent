import { PrismaClient } from '@prisma/client';
import { env } from '@delivery/config';

export class PrismaService extends PrismaClient {
  constructor() {
    super({
      log: env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
      datasources: {
        db: {
          url: env.DATABASE_URL,
        },
      },
    });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  async cleanDatabase() {
    if (env.NODE_ENV === 'production') {
      throw new Error('Cannot clean database in production');
    }
    const models = Reflect.ownKeys(this).filter(
      key => key !== 'constructor' && key !== 'onModuleInit' && key !== 'onModuleDestroy'
    );
    for (const model of models) {
      if (typeof this[model as string]?.deleteMany === 'function') {
        await this[model as string].deleteMany();
      }
    }
  }
}

export const prismaService = new PrismaService();
export default prismaService;