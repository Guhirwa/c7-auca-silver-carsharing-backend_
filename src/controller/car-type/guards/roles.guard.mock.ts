import { type CanActivate, type ExecutionContext } from '@nestjs/common'
import { Reflector } from '@nestjs/core'

import { ROLES_KEY } from '../role.decorator'
import { Role } from '../role.enum'

export class RolesGuardMock implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const reflector = new Reflector()
    const requiredRoles = reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ])

    if (!requiredRoles) {
      return true
    }

    const { user } = context.switchToHttp().getRequest()

    if (!user) {
      return false
    }

    if (user.role === Role.Admin) {
      return true
    }

    return requiredRoles.includes(user.role)
  }
}
