import userRepository from './user.repository';
import { AppError } from '../../errors/AppError';

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
      throw new AppError('User not found', 404);
    }
    const { password_hash, ...userWithoutPasswored } = user;
    return userWithoutPasswored;
  };
  deleteId = async (id: string) => {
    const userDel = await userRepository.deleteMe(id);
    return userDel;
  };
}

const userService = new UserService();
export default userService;
