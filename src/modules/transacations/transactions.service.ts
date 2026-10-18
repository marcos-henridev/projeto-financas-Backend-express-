import accountRepository from '../accounts/accounts.repository';
import transactionsRepository, {
  kindTransaction,
  statusTransaction,
} from './transactions.repository';
import categoriesRepository from '../categories/categories.repository';
import console, { log } from 'node:console';

const VALID_KINDS = ['receita', 'despesa', 'transferencia'];
const VALID_STATUS = ['pendente', 'pago', 'vencido', 'cancelado'];

class TransactionService {
  editPatch = async (data: {
    id: string;
    user_id: string;
    category_id?: string;
    due_date?: string;
    description?: string;
  }) => {
    let description;
    if (data.description) {
      description = data.description;
      if (description.length > 255) throw new Error('tamanho da descrição inválida');
    }
    //validando a transação
    const transaction = await transactionsRepository.findUserById({
      user_id: data.user_id,
      id: data.id,
    });
    if (!transaction) throw new Error('transação não encontrada');

    if (transaction.kind === 'transferencia') {
      if (data.category_id) {
        throw new Error('nao pode editar categoria com o tipo transferencia');
      }
    }

    console.log('entrando em processamento');
    if (data.category_id) {
      const category = await categoriesRepository.categorieUserExist({
        id: data.category_id as string,
        userId: data.user_id,
      });
      if (!category) throw new Error('Categoria não existe');
      if (category.kind !== transaction.kind) {
        throw new Error('tipo da categoria tem que ser a mesma da transação');
      }
    }

    //validação da data
    const due_date = data.due_date ? new Date(data.due_date) : undefined;
    if (due_date && Number.isNaN(due_date.getTime())) throw new Error('Data inválida');

    const update = await transactionsRepository.Patch({
      id: data.id,
      user_id: data.user_id,
      category_id: data.category_id,
      due_date,
    });

    return update;
  };
  DeletedTransaction = async (data: { id: string; user_id: string }) => {
    const existTransaction = await transactionsRepository.getAllTransactions({
      user_id: data.user_id,
      id: data.id,
    });
    if (existTransaction.length === 0) throw new Error('Transaction NotFound');

    // grava o objeto
    const transaction = await transactionsRepository.Deleted({
      id: data.id,
      user_id: data.user_id,
    });

    return transaction;
  };

  GetUnique = async (user_id: string, id?: string) => {
    const uniqueTransiction = await transactionsRepository.getAllTransactions({
      user_id: user_id,
      id: id,
    });
    if (!uniqueTransiction) {
      throw new Error('Categoria não encontrada');
    }
    return uniqueTransiction;
  };

  GetAll = async (data: {
    user_id: string;
    id?: string;
    account_id?: string;
    kind?: string;
    status?: string;
    from?: string;
    to?: string;
  }) => {
    let kind: kindTransaction | undefined;
    let status: statusTransaction | undefined;

    //validation Kind
    if (data.kind) {
      kind = data.kind as kindTransaction;
      if (!VALID_KINDS.includes(kind)) throw new Error('Tipo inválido');
    }

    //validation status
    if (data.status) {
      status = data.status as statusTransaction;
      if (!VALID_STATUS.includes(status)) throw new Error('Tipo inválido');
    }

    // validation account
    const account = await accountRepository.findByIdAndUser({
      id: data.account_id as string,
      userId: data.user_id,
    });
    if (!account) throw new Error('Conta não existe');

    //validation from e to (De - Até)
    const from = data.from ? new Date(data.from) : undefined;
    const to = data.to ? new Date(data.to) : undefined;
    if (from && Number.isNaN(from.getTime())) throw new Error('Data inválida');
    if (to && Number.isNaN(to.getTime())) throw new Error('Data inválida');
    if (from && to && from > to) throw new Error('Data inicial não pode ser maior que data final');

    const transaction = await transactionsRepository.getAllTransactions({
      user_id: data.user_id,
      id: data.id as string,
      account_id: data.account_id,
      kind,
      status,
      from,
      to,
    });
    return transaction;
  };
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
    // 1) description
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
