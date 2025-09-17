import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Module({
  providers: [
    {
      provide: 'APP_CONFIG',
      useFactory: (configService: ConfigService) => ({
        port: configService.get('PORT', 8000),
        nodeEnv: configService.get('NODE_ENV', 'development'),
        apiPrefix: configService.get('API_PREFIX', 'api/v1'),
        frontendUrl: configService.get('FRONTEND_URL', 'http://localhost:3000'),
        adminUrl: configService.get('ADMIN_URL', 'http://localhost:3001'),
        corsOrigin: configService.get('CORS_ORIGIN', 'http://localhost:3000'),
        jwtSecret: configService.get('JWT_SECRET'),
        jwtExpiresIn: configService.get('JWT_EXPIRES_IN', '7d'),
        jwtRefreshSecret: configService.get('JWT_REFRESH_SECRET'),
        jwtRefreshExpiresIn: configService.get('JWT_REFRESH_EXPIRES_IN', '30d'),
        bcryptRounds: parseInt(configService.get('BCRYPT_ROUNDS', '12')),
        maxFileSize: parseInt(configService.get('MAX_FILE_SIZE', '10485760')), // 10MB
        maxFiles: parseInt(configService.get('MAX_FILES', '5')),
        throttleTtl: parseInt(configService.get('THROTTLE_TTL', '60')),
        throttleLimit: parseInt(configService.get('THROTTLE_LIMIT', '100')),
      }),
      inject: [ConfigService],
    },
  ],
  exports: ['APP_CONFIG'],
})
export class AppConfigModule {}
