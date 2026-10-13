import accountRepository from '../accounts/accounts.repository';
import transactionsRepository, {
  kindTransaction,
  statusTransaction,
} from './transactions.repository';
import categoriesRepository from '../categories/categories.repository';

const VALID_KINDS = ['receita', 'despesa', 'tranferencia'];
const VALID_STATUS = ['pendente', 'pago', 'vencido', 'cancelado'];

class TransactionService {
  create = async (data: {
    user_id: string;

    account_id: string;
    destination_account_id?: string;
    category_id?: string;
    kind: string;
    status?: string;
    description: string;
    due_date?: Date;
    amount: number;
  }) => {
    //1) description
    const description = data.description;
    if (!description) throw new Error('Descrição é obrigatoria');
    if (description.length > 255) throw new Error('Descrição muito longa');

    //2) kind and status
    const kind = data.kind as kindTransaction;
    if (!VALID_KINDS.includes(kind as kindTransaction)) throw new Error('tipo inválido');

    const status = (data.status as statusTransaction) ?? 'pendente';
    if (!VALID_STATUS.includes(status as statusTransaction)) throw new Error('status inválido');

    // 3) amount
    const amount = Number(data.amount);
    if (!Number.isFinite(amount) || amount < 0) throw new Error('Valor inválido');
    if (Math.round(amount * 100) / 100 !== amount)
      throw new Error('Use no maximo duas casas decimais');

    //4) due_date: se não vier, usa hoje
    const due_date = data.due_date ? new Date(data.due_date) : new Date();
    if (Number.isNaN(due_date.getTime())) throw new Error('Data inválida');

    //5) conta origem
    const accountOrigin = await accountRepository.findByIdAndUser({
      id: data.account_id,
      userId: data.user_id,
    });
    if (!accountOrigin) throw new Error('Conta não encontrada');

    // 6) receita ou despesa
    if (kind !== 'transferencia') {
      if (data.destination_account_id)
        throw new Error('Conta destino somente quando o tipo for tranferencia');
      if (!data.category_id) throw new Error('Categoria é obrigatória');

      const category = await categoriesRepository.findAllCategories({
        id: data.category_id,
        user_id: data.user_id,
      });
      if (!category) throw new Error('categoria não encontrada');

      if (category[0].kind !== kind)
        throw new Error('A categoria não é do mesmo tipo da transferencia');
    }

    // 7) transferencia
    if (kind === 'transferencia') {
      if (!data.destination_account_id)
        throw new Error('Conta de destino obrigatoria para tipo "trasferencia"');
      if (data.destination_account_id === data.account_id)
        throw new Error('Origem e destino devem ser diferentes');

      const destination = await accountRepository.findByIdAndUser({
        id: data.destination_account_id,
        userId: data.user_id,
      });
      if (!destination) throw new Error('Conta destino não encontrada');
      if (destination.currency !== accountOrigin.currency)
        throw new Error('As contas têm moedas diferentes');
    }

    // 8) gravar os dados
    const createTransactionUnique = await transactionsRepository.createTrnsaction({
      user_id: data.user_id,
      account_id: data.account_id,
      destination_account_id: data.destination_account_id,
      category_id: data.category_id,
      kind,
      status,
      description,
      amount,
      due_date,
    });
    return createTransactionUnique;
  };
}
const transactionService = new TransactionService();
export default transactionService;
