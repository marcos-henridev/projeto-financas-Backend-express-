import accountRepository from './accounts.repository';
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
    if (!name) throw new Error('Nome da conta é obrigatorio');

    if (!VALID_KINDS.includes(data.kind as AccountKind)) throw new Error('Tipo de conta invalido');
    const existing = await accountRepository.findAccountById({
      user_id: data.user_Id,
      name,
      kind: data.kind as AccountKind,
    });

    if (existing) throw new Error('Already has an account whith that name');

    const initialBalance = Number(data.initial_balance ?? 0);

    if (!Number.isFinite(initialBalance)) throw new Error('initial_balance invalid');

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
    if (!accountUrl) throw new Error('conta nao encontrada');
    return accountUrl;
  };
  deletedAccount = async (id: string, userId: string) => {
    //*Importante validação da existencia da conta
    const find = await accountRepository.findByIdAndUser({ id, userId });

    if (!find) throw new Error('Account notfound');

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
    if (!accountUrl) throw new Error('conta nao encontrada');

    let name: string | undefined;
    if (data.name) {
      name = data.name.trim();
      if (!name) {
        throw new Error('Nome da conta não pode ser vazio');
      }
    }

    if (data.kind) {
      if (!VALID_KINDS.includes(data.kind as AccountKind))
        throw new Error('Invalid account type value');
    }

    const finalName = name ?? accountUrl.name;
    const finalKind = (data.kind as AccountKind | undefined) ?? accountUrl.kind;

    const duplicate = await accountRepository.findAccountById({
      user_id: data.userId,
      name: finalName,
      kind: finalKind,
    });
    if (duplicate) throw new Error('Você já possui uma conta com esses dados');

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
