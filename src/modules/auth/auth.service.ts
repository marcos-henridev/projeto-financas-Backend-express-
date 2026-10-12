import authRepository from './auth.repository';
import bcrypt from 'bcrypt';
import JWT from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();
class AuthService {
  register = async (data: { name: string; email: string; passaword: string }) => {
    // verificar se existe o email no banco
    const findUser = await authRepository.findUserByEmail(data.email);
    if (findUser) {
      throw new Error('email já casdastrado');
    }

    // *IMPORTANT gerar o hash de senha
    const hash = await bcrypt.hash(data.passaword, 10);
    //*criando o usuário
    const user = await authRepository.createUserWithDefaults({
      name: data.name,
      email: data.email,
      password_hash: hash,
    });
    //tira o hash do passaword do retorno da função e ela permanece no auth.service
    const { password_hash, ...userWithoutPassaword } = user;
    return userWithoutPassaword;
  };
  ////////////////////////////// LOGIN ////////////////////////////////////
  login = async (data: { email: string; passaword: string }) => {
    const findUser = await authRepository.findUserByEmail(data.email);

    if (!findUser) {
      throw new Error('USUARIO NAO ENCONTRADO');
    }

    //COMPARAR SENHA HASH
    const compare = await bcrypt.compare(data.passaword, findUser.password_hash);

    //GERA O JWT
    const token = JWT.sign({ signId: findUser.id }, process.env.JWT_SECRET as string, {
      expiresIn: '1d',
    });
    // *retornando sempre os dados sem a senha e dessa vez com  o tokem
    const { password_hash, ...userWithoutPassaword } = findUser;
    return { userWithoutPassaword, token };
  };
  ///////////////////////////////UPDATE//////////////////////////////////////
}

export const authService = new AuthService();
