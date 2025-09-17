import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    super({
      log: ['query', 'info', 'warn', 'error'],
    });
  }

  async onModuleInit() {
    await this.$connect();
    console.log('📊 Database connected successfully');
  }

  async onModuleDestroy() {
    await this.$disconnect();
    console.log('📊 Database disconnected');
  }

  async cleanDatabase() {
    if (process.env.NODE_ENV === 'production') return;

    const models = Reflect.ownKeys(this).filter(key => 
      typeof key === 'string' && key[0] !== '_'
    ) as string[];

    return Promise.all(models.map((modelKey) => 
      (this as any)[modelKey].deleteMany()
    ));
  }
}
