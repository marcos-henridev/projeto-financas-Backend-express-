import { prisma } from '../../prisma';
type KindAccount = 'corrente' | 'poupanca' | 'carteira' | 'investimento' | 'outro';
class AccountRepository {
  findAccountById = async (data: { user_id: string; name: string; kind: string }) => {
    return prisma.accounts.findFirst({
      where: {
        user_id: data.user_id,
        deleted_at: null,
        name: { equals: data.name, mode: 'insensitive' },
        kind: data.kind as KindAccount,
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
}
const accountRepository = new AccountRepository();
export default accountRepository;
