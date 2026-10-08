// import bcrypt from "bcrypt";
import { prisma } from '../../prisma';

class AuthRepository {
  findUserByEmail = async (email: string) => {
    return prisma.users.findUnique({ where: { email } });
  };

  createUser = async (data: { name: string; email: string; password_hash: string }) => {
    return prisma.users.create({
      data: {
        name: data.name,
        email: data.email,
        password_hash: data.password_hash,
      },
    });
  };

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
}
const authRepository = new AuthRepository();

export default authRepository;
