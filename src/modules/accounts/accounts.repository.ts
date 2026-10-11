import { prisma } from '../../prisma';
type KindAccount = 'corrente' | 'poupanca' | 'carteira' | 'investimento' | 'outro';
class AccountRepository {
  findAccountById = async (data: {
    user_id: string;
    name: string;
    kind: string;
    excludeId?: string;
  }) => {
    return prisma.accounts.findFirst({
      where: {
        user_id: data.user_id,
        deleted_at: null,
        name: { equals: data.name, mode: 'insensitive' },
        kind: data.kind as KindAccount,
      },
    });
  };
  findByIdAndUser = async (data: { id: string; userId: string }) => {
    return prisma.accounts.findFirst({
      where: {
        id: data.id,
        user_id: data.userId,
        deleted_at: null,
      },
    });
  };
  findAccountsMany = async (userId: string) => {
    return prisma.accounts.findMany({
      where: {
        user_id: userId,
        deleted_at: null,
      },
    });
  };
  create = async (data: {
    user_Id: string;
    kind: string;
    name: string;
    initial_balance: number;
  }) => {
    const account = await prisma.accounts.create({
      data: {
        user_id: data.user_Id,
        kind: data.kind as KindAccount,
        name: data.name,
        initial_balance: data.initial_balance,
        current_balance: data.initial_balance,
      },
    });
    return account;
  };
  deleteAccount = async (data: { id: string; userId: string }) => {
    return prisma.accounts.update({
      where: {
        id: data.id,
        user_id: data.userId,
      },
      data: {
        deleted_at: new Date(),
        is_active: false,
        updated_at: new Date(),
      },
    });
  };
  updateAccount = async (data: {
    id: string;
    userId: string;
    kind?: KindAccount;
    name?: string;
  }) => {
    return prisma.accounts.update({
      where: { id: data.id, user_id: data.userId },
      data: {
        kind: data.kind,
        name: data.name,
        updated_at: new Date(),
      },
    });
  };
}
const accountRepository = new AccountRepository();
export default accountRepository;
