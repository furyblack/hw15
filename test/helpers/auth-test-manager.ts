import { HttpStatus, INestApplication } from '@nestjs/common';
import { CreateUserDto } from '../../src/moduls/user-accounts/dto/create-user.dto';
import { UserViewDto } from '../../src/moduls/user-accounts/api/view-dto/users.view-dto';
import request from 'supertest';

export class AuthTestManager {
  constructor(
    private app: INestApplication,
    // private readonly userTestManager: UsersTestManager,
  ) {}
  // async registrationUser(dto: CreateUserDto): Promise<void> {
  //   const createdUserId = await this.userTestManager.createUser(dto);
  //   const confirmCode = 'uuid';
  //
  //   const user = await this.userTestManager.findUserById(createdUserId);
  //   user.setConfirmationCode(confirmCode);
  //   await this.usersRepository.save(user);
  //
  //   this.emailService
  //     .sendConfirmationEmail(user.email, confirmCode)
  //     .catch(console.error);
  // }

  async registerUser(
    registerModel: CreateUserDto,
    statusCode: number = HttpStatus.CREATED,
  ): Promise<UserViewDto> {
    const response = await request(this.app.getHttpServer())
      .post('/api/auth/registration')
      .send(registerModel)
      .expect(statusCode);
    return response.body;
  }
}
