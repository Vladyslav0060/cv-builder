import { SafeUser } from 'src/user/user.select';
import { MeDto } from '../dto/me.dto';

export function toMeDto(user: SafeUser): MeDto {
  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName ?? '',
    lastName: user.lastName ?? '',
    avatarUrl: user.avatarUrl ?? '',
    role: user.role,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}
