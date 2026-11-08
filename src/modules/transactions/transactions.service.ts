import accountRepository from '../accounts/accounts.repository';
import transactionsRepository, {
  kindTransaction,
  statusTransaction,
} from './transactions.repository';
import categoriesRepository from '../categories/categories.repository';
import { AppError } from '../../errors/AppError';

const VALID_KINDS = ['receita', 'despesa', 'transferencia'];
const VALID_STATUS = ['pendente', 'pago', 'vencido', 'cancelado'];

class TransactionService {
  addPaid_at = async (data: { user_id: string; id_transaction: string }) => {
    const transaction = data.id_transaction;

    const findTransaction = await transactionsRepository.findUserById({
      id: transaction,
      user_id: data.user_id,
    });
    if (!findTransaction) throw new AppError('Transaction not found', 404);

    if (findTransaction.status === 'pendente') {
      const transactionPaid = await transactionsRepository.addPaid_at({
        user_id: data.user_id,
        id: transaction,
      });
      return transactionPaid;
    } else {
      throw new AppError('Only pending transactions can be paid', 400);
    }
  };
  editPatch = async (data: {
    id: string;
    user_id: string;
    category_id?: string;
    due_date?: string;
    description?: string;
  }) => {
    let description;
    if (data.description) {
      description = data.description.trim();
      if (description.length > 255)
        throw new AppError('Description must be at most 255 characters', 400);
    }
    //validando a transação
    const transaction = await transactionsRepository.findUserById({
      user_id: data.user_id,
      id: data.id,
    });
    if (!transaction) throw new AppError('Transaction not found', 404);

    if (transaction.kind === 'transferencia') {
      if (data.category_id) {
        throw new AppError('Cannot set a category on a transfer transaction', 400);
      }
    }

    if (data.category_id) {
      const category = await categoriesRepository.categorieUserExist({
        id: data.category_id as string,
        userId: data.user_id,
      });
      if (!category) throw new AppError('Category not found', 404);
      if (category.kind !== transaction.kind) {
        throw new AppError('Category kind must match the transaction kind', 400);
      }
    }

    //validação da data
    const due_date = data.due_date ? new Date(data.due_date) : undefined;
    if (due_date && Number.isNaN(due_date.getTime())) throw new AppError('Invalid date', 400);

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
    if (existTransaction.length === 0) throw new AppError('Transaction not found', 404);

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
    if (uniqueTransiction.length === 0) throw new AppError('Transaction not found', 404);

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
      if (!VALID_KINDS.includes(kind)) throw new AppError('Invalid transaction kind', 400);
    }

    //validation status
    if (data.status) {
      status = data.status as statusTransaction;
      if (!VALID_STATUS.includes(status)) throw new AppError('Invalid transaction kind', 400);
    }

    // validation account
    const account = await accountRepository.findByIdAndUser({
      id: data.account_id as string,
      userId: data.user_id,
    });
    if (!account) throw new AppError('Account not found', 404);

    //validation from e to (De - Até)
    const from = data.from ? new Date(data.from) : undefined;
    const to = data.to ? new Date(data.to) : undefined;
    if (from && Number.isNaN(from.getTime())) throw new AppError('Invalid date', 400);
    if (to && Number.isNaN(to.getTime())) throw new AppError('Invalid date', 400);
    if (from && to && from > to) throw new AppError('Start date cannot be after end date', 400);

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
    if (!description) throw new AppError('Description is required', 400);
    if (description.length > 255)
      throw new AppError('Description must be at most 255 characters', 400);

    //2) kind and status
    const kind = data.kind as kindTransaction;
    if (!VALID_KINDS.includes(kind as kindTransaction))
      throw new AppError('Invalid transaction kind', 400);

    const status = (data.status as statusTransaction) ?? 'pendente';
    if (!VALID_STATUS.includes(status as statusTransaction))
      throw new AppError('Invalid transaction status', 400);

    // 3) amount
    const amount = Number(data.amount);
    if (!Number.isFinite(amount) || amount < 0) throw new AppError('Invalid amount', 400);
    if (Math.round(amount * 100) / 100 !== amount)
      throw new AppError('Amount must have at most two decimal places', 400);

    //4) due_date: se não vier, usa hoje
    const due_date = data.due_date ? new Date(data.due_date) : new Date();
    if (Number.isNaN(due_date.getTime())) throw new AppError('Invalid date', 400);

    //5) conta origem
    const accountOrigin = await accountRepository.findByIdAndUser({
      id: data.account_id,
      userId: data.user_id,
    });
    if (!accountOrigin) throw new AppError('Account not found', 404);

    // 6) receita ou despesa
    if (kind !== 'transferencia') {
      if (data.destination_account_id)
        throw new AppError('Destination account is only allowed for transfers', 400);
      if (!data.category_id) throw new AppError('Category is required', 400);

      const category = await categoriesRepository.findAllCategories({
        id: data.category_id,
        user_id: data.user_id,
      });
      if (!category) throw new AppError('Category not found', 404);

      if (category[0].kind !== kind)
        throw new AppError('Category kind must match the transaction kind', 400);
    }

    // 7) transferencia
    if (kind === 'transferencia') {
      if (!data.destination_account_id)
        throw new AppError('Destination account is required for transfers', 400);
      if (data.destination_account_id === data.account_id)
        throw new AppError('Source and destination accounts must be different', 400);

      const destination = await accountRepository.findByIdAndUser({
        id: data.destination_account_id,
        userId: data.user_id,
      });
      if (!destination) throw new AppError('Destination account not found', 404);
      if (destination.currency !== accountOrigin.currency)
        throw new AppError('Accounts have different currencies', 400);
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
