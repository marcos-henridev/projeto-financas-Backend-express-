// import bcrypt from "bcrypt";
import { prisma } from '../../prisma';
import { DEFAULT_CATEGORIES } from '../categories/default-categories';

class AuthRepository {
  findUserByEmail = async (email: string) => {
    return prisma.users.findFirst({ where: { email, deleted_at: null } });
  };

  createUserWithDefaults = async (data: { name: string; email: string; password_hash: string }) => {
    return prisma.$transaction(async (tx) => {
      // ! criar o usuario
      const user = await tx.users.create({
        data: {
          name: data.name,
          email: data.email,
          password_hash: data.password_hash,
        },
      });
      // ! criar as categorias padrão
      await tx.categories.createMany({
        data: DEFAULT_CATEGORIES.map((c) => ({
          user_id: user.id,
          name: c.name,
          kind: c.kind,
        })),
      });

      return user;
    });
  };
}
const authRepository = new AuthRepository();

export default authRepository;
