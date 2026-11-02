import accountRepository from './accounts.repository';
import { AppError } from '../../errors/AppError';
type AccountKind = 'corrente' | 'poupanca' | 'carteira' | 'investimento' | 'outro';
const VALID_KINDS = ['corrente', 'poupanca', 'carteira', 'investimento', 'outro'];
class AccountService {
  create = async (data: {
    user_Id: string;
    kind: string;
    name: string;
    initial_balance: number;
  }) => {
    //IMPORTANT validation
    const name = data.name.trim();
    if (!name) throw new AppError('Account name is required', 400);

    if (!VALID_KINDS.includes(data.kind as AccountKind))
      throw new AppError('Invalid account kind', 400);
    const existing = await accountRepository.findAccountById({
      user_id: data.user_Id,
      name,
      kind: data.kind as AccountKind,
    });

    if (existing) throw new AppError('Account already exists', 409);

    const initialBalance = Number(data.initial_balance ?? 0);

    if (!Number.isFinite(initialBalance)) throw new AppError('Invalid initial balance', 400);

    const accounts = await accountRepository.create({
      user_Id: data.user_Id,
      kind: data.kind as AccountKind,
      name,
      initial_balance: data.initial_balance,
    });
    return accounts;
  };
  findAll = async (userId: string) => {
    return accountRepository.findAccountsMany(userId);
  };
  findAccountUrl = async (id: string, userId: string) => {
    const accountUrl = await accountRepository.findByIdAndUser({
      id,
      userId,
    });
    if (!accountUrl) throw new AppError('Account not found', 404);
    return accountUrl;
  };
  deletedAccount = async (id: string, userId: string) => {
    //*Importante validação da existencia da conta
    const find = await accountRepository.findByIdAndUser({ id, userId });

    if (!find) throw new AppError('Account not found', 404);

    const deleted = await accountRepository.deleteAccount({
      id,
      userId,
    });
    return deleted;
  };
  update = async (data: { id: string; userId: string; kind?: string; name?: string }) => {
    const accountUrl = await accountRepository.findByIdAndUser({
      id: data.id,
      userId: data.userId,
    });
    if (!accountUrl) throw new AppError('Account not found', 404);

    let name: string | undefined;
    if (data.name) {
      name = data.name.trim();
      if (!name) {
        throw new AppError('Account name cannot be empty', 400);
      }
    }

    if (data.kind) {
      if (!VALID_KINDS.includes(data.kind as AccountKind))
        throw new AppError('Invalid account kind', 400);
    }

    const finalName = name ?? accountUrl.name;
    const finalKind = (data.kind as AccountKind | undefined) ?? accountUrl.kind;

    const duplicate = await accountRepository.findAccountById({
      user_id: data.userId,
      name: finalName,
      kind: finalKind,
    });
    if (duplicate) throw new AppError('Account already exists', 409);

    const modifyer = await accountRepository.updateAccount({
      id: data.id,
      userId: data.userId,
      kind: data.kind as AccountKind | undefined,
      name,
    });
    return modifyer;
  };
}
const accountService = new AccountService();
export default accountService;
