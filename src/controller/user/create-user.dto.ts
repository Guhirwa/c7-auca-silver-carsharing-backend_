import { ApiProperty } from '@nestjs/swagger'
import { IsEnum, IsNotEmpty, IsString } from 'class-validator'

import { Role } from '../car-type/role.enum'
import { validate } from '../../util'

export class CreateUserDTO {
  @ApiProperty({
    description: 'The name of the user.',
    example: 'Alice',
  })
  @IsString()
  @IsNotEmpty()
  public readonly name!: string

  @ApiProperty({
    description: 'The password of the user.',
    example: 'secure-password-123',
  })
  @IsString()
  @IsNotEmpty()
  public readonly password!: string

  @ApiProperty({
    description: 'The role of the user.',
    enum: Role,
    example: Role.User,
  })
  @IsEnum(Role)
  public readonly role!: Role

  public static create(data: {
    name: string
    password: string
    role: Role
  }): CreateUserDTO {
    const instance = Object.assign(new CreateUserDTO(), data)
    return validate(instance)
  }
}
