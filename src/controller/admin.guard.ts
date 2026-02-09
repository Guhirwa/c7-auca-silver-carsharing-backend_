import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common'
import { type Request } from 'express'

import { AuthenticationGuard } from './authentication.guard'
import { Role } from './car-type/role.enum'

@Injectable()
export class AdminGuard implements CanActivate {
  public canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>()
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const user = request[AuthenticationGuard.USER_REQUEST_PROPERTY]

    if (!user || user.role !== Role.Admin) {
      throw new ForbiddenException('Admin access required')
    }

    return true
  }
}
