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
}
const accountService = new AccountService();
export default accountService;
