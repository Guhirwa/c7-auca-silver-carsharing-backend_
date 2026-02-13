import { createHash } from 'node:crypto'

import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  ParseIntPipe,
  UseGuards,
  ConflictException,
  HttpCode,
  HttpStatus,
} from '@nestjs/common'
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger'

import {
  IUserService,
  User,
  type UserID,
  UserAlreadyExistsError,
  CannotDeleteSelfError,
  UserNotFoundError,
} from '../../application'
import { AdminGuard } from '../admin.guard'
import { AuthenticationGuard } from '../authentication.guard'
import { CurrentUser } from '../current-user.decorator'

import { CreateUserDTO } from './create-user.dto'
import { UserDTO } from './user.dto'

/**********************************************************************************************************************\
 *                                                                                                                     *
 *     ██╗     PROCEED WITH CAUTION                                                                                    *
 *     ██║                                                                                                             *
 *     ██║     This file implements some core functionality for the application. You will not need to modify or        *
 *     ╚═╝     fully understand this file to successfully finish your project.                                         *
 *     ██╗                                                                                                             *
 *     ╚═╝     That said, feel free to browse around and try things - you can always revert your changes!              *
 *                                                                                                                     *
 \*********************************************************************************************************************/

@ApiTags(User.name)
@ApiInternalServerErrorResponse({
  description: 'An internal server error occurred.',
})
@UseGuards(AuthenticationGuard)
@Controller('/users')
export class UserController {
  private readonly userService: IUserService

  public constructor(authenticationService: IUserService) {
    this.userService = authenticationService
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Return all registered users.',
  })
  @ApiOkResponse({
    description: 'The request was successful.',
    type: [UserDTO],
  })
  @ApiUnauthorizedResponse({
    description:
      'The request was not authorized because the JWT was missing, expired or otherwise invalid.',
  })
  @Get()
  public async getAll(): Promise<UserDTO[]> {
    const users = await this.userService.getAll()

    return users.map(user => UserDTO.fromModel(user))
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Retrieve a specific user.',
  })
  @ApiOkResponse({
    description: 'The request was successful.',
    type: UserDTO,
  })
  @ApiBadRequestResponse({
    description:
      'The request was malformed, e.g. missing or invalid parameter or property in the request body.',
  })
  @ApiNotFoundResponse({
    description: 'No user with the given id was found.',
  })
  @Get(':id')
  public async get(@Param('id', ParseIntPipe) id: UserID): Promise<UserDTO> {
    const user = await this.userService.get(id)

    return UserDTO.fromModel(user)
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create a new user.',
  })
  @ApiCreatedResponse({
    description: 'The user was created successfully.',
    type: UserDTO,
  })
  @ApiBadRequestResponse({
    description:
      'The request was malformed, e.g. missing or invalid parameter or property in the request body.',
  })
  @ApiConflictResponse({
    description: 'A user with the given name already exists.',
  })
  @ApiUnauthorizedResponse({
    description:
      'The request was not authorized because the JWT was missing, expired or otherwise invalid.',
  })
  @ApiForbiddenResponse({
    description: 'Admin access required.',
  })
  @UseGuards(AdminGuard)
  @Post()
  public async create(@Body() data: CreateUserDTO): Promise<UserDTO> {
    try {
      const hash = createHash('sha512')
      const passwordHash = hash.update(data.password).digest('hex')

      const user = await this.userService.create({
        name: data.name,
        passwordHash,
        role: data.role,
      })

      return UserDTO.fromModel(user)
    } catch (error) {
      if (error instanceof UserAlreadyExistsError) {
        throw new ConflictException(error.message)
      }
      throw error
    }
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Delete a user.',
  })
  @ApiNoContentResponse({
    description: 'The user was deleted successfully.',
  })
  @ApiBadRequestResponse({
    description: 'The user ID parameter is missing or invalid.',
  })
  @ApiNotFoundResponse({
    description: 'No user with the given id was found.',
  })
  @ApiConflictResponse({
    description: 'You cannot delete yourself.',
  })
  @ApiUnauthorizedResponse({
    description:
      'The request was not authorized because the JWT was missing, expired or otherwise invalid.',
  })
  @ApiForbiddenResponse({
    description: 'Admin access required.',
  })
  @UseGuards(AdminGuard)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  public async delete(
    @CurrentUser() currentUser: User,
    @Param('id', ParseIntPipe) id: UserID,
  ): Promise<void> {
    try {
      await this.userService.delete(id, currentUser.id)
    } catch (error) {
      if (error instanceof CannotDeleteSelfError) {
        throw new ConflictException(error.message)
      }
      throw error
    }
  }
}
