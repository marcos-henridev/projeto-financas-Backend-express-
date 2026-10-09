import userRepository from './user.repository';

class UserService {
  updateUser = async (data: { userId: string; name?: string; email?: string }) => {
    const update = await userRepository.updateUser({
      id: data.userId,
      name: data.name,
      email: data.email,
    });
    const { password_hash, ...userWithoutPasswored } = update;
    return userWithoutPasswored;
  };
  getMe = async (id: string) => {
    const user = await userRepository.findUserId({ id });
    if (!user) {
      throw new Error('Usuario nao encontrado');
    }
    const { password_hash, ...userWithoutPasswored } = user;
    return userWithoutPasswored;
  };
}

const userService = new UserService();
export default userService;
