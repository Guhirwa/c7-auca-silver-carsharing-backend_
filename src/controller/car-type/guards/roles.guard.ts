import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'

import { type User } from '../../../application'
import { AuthenticationGuard } from '../../authentication.guard'
import { ROLES_KEY } from '../role.decorator'
import { Role } from '../role.enum'

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ])

    if (!requiredRoles) {
      return true
    }

    const request = context.switchToHttp().getRequest()
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const user = request[AuthenticationGuard.USER_REQUEST_PROPERTY] as
      | User
      | undefined

    if (!user) {
      throw new ForbiddenException('Admin access required')
    }

    // Admin role includes all user rights
    if (user.role === Role.Admin) {
      return true
    }

    if (!requiredRoles.includes(user.role)) {
      throw new ForbiddenException('Admin access required')
    }

    return true
  }
}
