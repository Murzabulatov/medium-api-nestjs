import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateUserDto } from '@app/user/dto/createUser.dto';
import { UserEntity } from '@app/user/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { sign } from 'jsonwebtoken';
import { JWT_SECRET } from '@app/config';
import { UserResponseInterface } from '@app/user/types/userResponse.interface';
import { SignInDto } from '@app/user/dto/signIn.dto';
import { compare } from 'bcrypt';
import { UpdateUserDto } from '@app/user/dto/updateUser.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}
  async createUser(createUserDto: CreateUserDto): Promise<UserEntity> {
    const userByEmail = await this.userRepository.findOne({
      where: {
        email: createUserDto.email,
      },
    });

    const userByUsername = await this.userRepository.findOne({
      where: {
        username: createUserDto.username,
      },
    });

    if (userByEmail || userByUsername) {
      throw new HttpException(
        'Email or username are taken',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    const newUser = new UserEntity();
    Object.assign(newUser, createUserDto);
    return await this.userRepository.save(newUser);
  }

  async updateUser(
    userId: number,
    updateUserDto: UpdateUserDto,
  ): Promise<UserEntity> {
    const user = await this.userRepository.findOne({
      where: {
        id: userId,
      },
    });

    Object.assign(user, updateUserDto);

    return await this.userRepository.save(user);
  }

  async signIn(signInDto: SignInDto): Promise<UserEntity> {
    const userByEmail = await this.userRepository.findOne({
      where: {
        email: signInDto.email,
      },
      select: ['id', 'username', 'email', 'bio', 'image', 'password'],
    });

    if (!userByEmail) {
      throw new HttpException('User is not found', HttpStatus.UNAUTHORIZED);
    }

    const comparedPassword = await this.comparePassword(
      signInDto.password,
      userByEmail.password,
    );

    if (!comparedPassword) {
      throw new HttpException('Access denied', HttpStatus.UNAUTHORIZED);
    }

    delete userByEmail.password;

    return userByEmail;
  }

  comparePassword(password: string, hashPasword: string) {
    return compare(password, hashPasword);
  }

  findById(id: number): Promise<UserEntity> {
    return this.userRepository.findOne({
      where: { id },
    });
  }

  buildUserResponse(user: UserEntity): UserResponseInterface {
    return {
      user: {
        ...user,
        token: this.generateJWT(user),
      },
    };
  }

  generateJWT(user: UserEntity): string {
    return sign(
      {
        id: user.id,
        username: user.username,
        email: user.email,
      },
      JWT_SECRET,
    );
  }
}
