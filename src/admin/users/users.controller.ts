import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto } from './dto/create-user.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { AdminUserResponseDto } from './dto/user-response.dto';
import { UserDetailsResponseDto } from './dto/user-details.dto';
import { UpdateUserStatusDto, UserStatusResponseDto } from './dto/user-status.dto';
import { AdminAuthGuard } from '../common/guards/admin-auth.guard';
import { MODERATOR_AND_ABOVE } from '../common/decorators/admin-roles.decorator';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';

@ApiTags('Admin - Users')
@Controller('admin/users')
@UseGuards(AdminAuthGuard)
@ApiBearerAuth('JWT-auth')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @MODERATOR_AND_ABOVE
  @ApiOperation({ summary: 'Get all users with pagination and filtering' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'role', required: false, enum: ['BUYER', 'SELLER', 'BOTH'] })
  @ApiQuery({ name: 'kycStatus', required: false, enum: ['NOT_SUBMITTED', 'PENDING', 'APPROVED', 'REJECTED'] })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  @ApiQuery({ name: 'sortBy', required: false, type: String })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'] })
  @ApiResponse({ 
    status: 200, 
    description: 'Users retrieved successfully',
    type: [AdminUserResponseDto]
  })
  getUsers(
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
    @Query('search') search?: string,
    @Query('role') role?: 'BUYER' | 'SELLER' | 'BOTH',
    @Query('kycStatus') kycStatus?: 'NOT_SUBMITTED' | 'PENDING' | 'APPROVED' | 'REJECTED',
    @Query('isActive') isActive?: boolean,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
  ) {
    const paginationDto: PaginationDto = {
      page,
      limit,
      search,
      role,
      kycStatus,
      isActive,
      sortBy,
      sortOrder,
    };
    return this.usersService.getUsers(paginationDto);
  }

  @Post()
  @MODERATOR_AND_ABOVE
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({ 
    status: 201, 
    description: 'User created successfully',
    type: AdminUserResponseDto
  })
  @ApiResponse({ status: 409, description: 'User with this email already exists' })
  createUser(
    @Body() createUserDto: CreateUserDto,
    @CurrentUser('id') adminId: string,
  ) {
    return this.usersService.createUser(createUserDto, adminId);
  }

  @Get(':id')
  @MODERATOR_AND_ABOVE
  @ApiOperation({ summary: 'Get user details by ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'User details retrieved successfully',
    type: UserDetailsResponseDto
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  getUserDetails(@Param('id') userId: string) {
    return this.usersService.getUserDetails(userId);
  }

  @Put(':id')
  @MODERATOR_AND_ABOVE
  @ApiOperation({ summary: 'Update user information' })
  @ApiResponse({ 
    status: 200, 
    description: 'User updated successfully',
    type: AdminUserResponseDto
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  updateUser(
    @Param('id') userId: string,
    @Body() updateUserDto: UpdateUserDto,
    @CurrentUser('id') adminId: string,
  ) {
    return this.usersService.updateUser(userId, updateUserDto, adminId);
  }

  @Put(':id/status')
  @MODERATOR_AND_ABOVE
  @ApiOperation({ summary: 'Update user account status (enable/disable)' })
  @ApiResponse({ 
    status: 200, 
    description: 'User status updated successfully',
    type: UserStatusResponseDto
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  updateUserStatus(
    @Param('id') userId: string,
    @Body() statusDto: UpdateUserStatusDto,
  ) {
    return this.usersService.updateUserStatus(userId, statusDto);
  }

  @Put(':id/enable')
  @MODERATOR_AND_ABOVE
  @ApiOperation({ summary: 'Enable user account' })
  @ApiResponse({ 
    status: 200, 
    description: 'User account enabled successfully',
    type: UserStatusResponseDto
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  enableUser(
    @Param('id') userId: string,
    @Body() body: { reason?: string } = {},
  ) {
    return this.usersService.enableUser(userId, body.reason);
  }

  @Put(':id/disable')
  @MODERATOR_AND_ABOVE
  @ApiOperation({ summary: 'Disable user account' })
  @ApiResponse({ 
    status: 200, 
    description: 'User account disabled successfully',
    type: UserStatusResponseDto
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  disableUser(
    @Param('id') userId: string,
    @Body() body: { reason?: string } = {},
  ) {
    return this.usersService.disableUser(userId, body.reason);
  }
}
