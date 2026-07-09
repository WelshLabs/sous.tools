import { Controller, Post, Put, Delete, Body, Param, UseGuards, UsePipes } from '@nestjs/common';
import { AdminGuard } from '../../common/guards/admin.guard';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { PasswordUpdateSchema, type PasswordUpdateDto } from '@soustools/api-types';

@Controller('users')
export class UsersController {
  
  @Post()
  @UseGuards(AdminGuard)
  createUser(@Body() _body: any) {
    return { message: 'User created' };
  }

  @Put(':id')
  @UseGuards(AdminGuard)
  updateUser(@Param('id') id: string, @Body() _body: any) {
    return { message: `User ${id} updated` };
  }

  @Delete(':id')
  @UseGuards(AdminGuard)
  deleteUser(@Param('id') id: string) {
    return { message: `User ${id} deleted` };
  }

  @Put(':id/password')
  @UsePipes(new ZodValidationPipe(PasswordUpdateSchema))
  updatePassword(@Param('id') id: string, @Body() _body: PasswordUpdateDto) {
    // In reality this would call Supabase Admin API to update the password securely
    return { message: `Password for user ${id} updated` };
  }
}
