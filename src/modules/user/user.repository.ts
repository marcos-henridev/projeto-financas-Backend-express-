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
}

const userRepository = new UserRepository();
export default userRepository;
