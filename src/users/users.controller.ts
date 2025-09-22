import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { KycSubmissionDto } from './dto/kyc-submission.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles('SUPER_ADMIN', 'COMPLIANCE')
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles('SUPER_ADMIN', 'COMPLIANCE', 'MODERATOR')
  @ApiOperation({ summary: 'Get all users with pagination' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Search term' })
  @ApiQuery({ name: 'role', required: false, type: String, description: 'Filter by role' })
  @ApiResponse({ status: 200, description: 'Users retrieved successfully' })
  findAll(
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 10,
    @Query('search') search?: string,
    @Query('role') role?: string,
  ) {
    return this.usersService.findAll(page, limit, search, role);
  }

  @Get('stats')
  @UseGuards(RolesGuard)
  @Roles('SUPER_ADMIN', 'COMPLIANCE')
  @ApiOperation({ summary: 'Get user statistics' })
  @ApiResponse({ status: 200, description: 'User statistics retrieved successfully' })
  getStats() {
    return this.usersService.getStats();
  }

  @Get('test-db')
  @ApiOperation({ summary: 'Test database connection' })
  @ApiResponse({ status: 200, description: 'Database connection test' })
  async testDb() {
    try {
      const userCount = await this.usersService.testDatabaseConnection();
      return { message: 'Database connection successful', userCount };
    } catch (error) {
      console.error('Database test error:', error);
      return { message: 'Database connection failed', error: error.message };
    }
  }

  @Get('profile')
  @ApiOperation({ summary: 'Get current user profile with KYC details' })
  @ApiResponse({ status: 200, description: 'User profile retrieved successfully' })
  async getProfile(@CurrentUser() user: any) {
    try {
      console.log('Profile endpoint called with user:', user);
      const result = await this.usersService.getUserDetails(user.sub);
      console.log('Profile endpoint result:', result);
      return result;
    } catch (error) {
      console.error('Profile endpoint error:', error);
      throw error;
    }
  }

  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles('SUPER_ADMIN', 'COMPLIANCE', 'MODERATOR')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiResponse({ status: 200, description: 'User retrieved successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles('SUPER_ADMIN', 'COMPLIANCE')
  @ApiOperation({ summary: 'Update user' })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Post('kyc-submission')
  @ApiOperation({ summary: 'Submit KYC documents for current user' })
  @ApiResponse({ status: 201, description: 'KYC submitted successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  submitKyc(@CurrentUser() user: any, @Body() kycData: KycSubmissionDto) {
    return this.usersService.submitKyc(user.sub, kycData);
  }

  @Patch(':id/kyc-status')
  @UseGuards(RolesGuard)
  @Roles('SUPER_ADMIN', 'COMPLIANCE')
  @ApiOperation({ summary: 'Update user KYC status' })
  @ApiResponse({ status: 200, description: 'KYC status updated successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  updateKycStatus(
    @Param('id') id: string,
    @Body() body: { status: string; reason?: string },
  ) {
    return this.usersService.updateKycStatus(id, body.status, body.reason);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('SUPER_ADMIN')
  @ApiOperation({ summary: 'Delete user' })
  @ApiResponse({ status: 200, description: 'User deleted successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
