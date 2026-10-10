import { prisma } from '../../prisma';
class UserRepository {
  updateUser = async (data: { id: string; email?: string; name?: string }) => {
    return prisma.users.update({
      where: {
        id: data.id,
      },
      data: {
        name: data.name,
        email: data.email,
        updated_at: new Date(),
      },
    });
  };
  findUserId = async (data: { id: string }) => {
    return prisma.users.findFirst({ where: { id: data.id, deleted_at: null } });
  };
  deleteMe = async (id: string) => {
    return prisma.users.update({
      where: { id: id },
      data: {
        is_active: false,
        updated_at: new Date(),
        deleted_at: new Date(),
      },
    });
  };
}

const userRepository = new UserRepository();
export default userRepository;
