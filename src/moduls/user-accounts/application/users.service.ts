import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from '../domain/user.entity';
import { CreateUserDto } from '../dto/create-user.dto';
import { UsersRepository } from '../infrastructure/users.repository';
import { Types } from 'mongoose';
import { CreateUserUseCase } from '../use-cases/create-user-use-case';
import { RegisterUserUseCase } from '../use-cases/register-user-use-case';
import { DeleteUserUseCase } from '../use-cases/delete-user-use-case';

@Injectable()
export class UsersService {
  constructor(
    //инжектирование модели в сервис через DI
    @InjectModel(User.name)
    private usersRepository: UsersRepository,
    private createUserUseCase: CreateUserUseCase,
    private registerUserUseCase: RegisterUserUseCase,
    private deleteUserUseCase: DeleteUserUseCase,
  ) {}
  async isLoginTaken(login: string): Promise<boolean> {
    return this.usersRepository.loginIsExist(login);
  }
  async createUser(dto: CreateUserDto): Promise<Types.ObjectId> {
    return this.createUserUseCase.execute(dto);
  }

  async deleteUser(id: string): Promise<void> {
    return this.deleteUserUseCase.execute(id);
  }
  async registerUser(dto: CreateUserDto): Promise<void> {
    return this.registerUserUseCase.execute(dto);
  }
}
