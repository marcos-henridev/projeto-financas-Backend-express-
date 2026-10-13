import { SignatureUsage } from 'typescript/unstable/sync';
import { prisma } from '../../prisma';

export type kindTransaction = 'receita' | 'despesa' | 'transferencia';
export type statusTransaction = 'pendente' | 'pago' | 'vencido' | 'cancelado';
class TransactionsRepository {
  createTrnsaction = async (data: {
    user_id: string;
    account_id: string;
    destination_account_id?: string;
    category_id?: string;
    kind: kindTransaction;
    status: statusTransaction;
    description: string;
    amount: number;
    due_date: Date;
  }) => {
    return prisma.$transaction(async (tx) => {
      const isPaid = data.status === 'pago';

      // 1) gravação de trransação
      const transaction = await tx.transactions.create({
        data: {
          user_id: data.user_id,
          account_id: data.account_id,
          destination_account_id: data.destination_account_id,
          kind: data.kind,
          category_id: data.category_id,
          status: data.status,
          description: data.description,
          amount: data.amount,
          due_date: data.due_date,
        },
      });

      //   2) só mexe no saldo se o status estiver pago
      if (isPaid) {
        await tx.accounts.update({
          where: {
            id: data.account_id,
            user_id: data.user_id,
          },
          data: {
            current_balance:
              data.kind === 'receita' ? { increment: data.amount } : { decrement: data.amount },
            updated_at: new Date(),
          },
        });

        // transferencia: a conta de destino recebe
        if (data.kind === 'transferencia') {
          await tx.accounts.update({
            where: { id: data.destination_account_id, user_id: data.user_id },
            data: {
              current_balance: { increment: data.amount },
              updated_at: new Date(),
            },
          });
        }
      }
      return transaction;
    });
  };
}
const transactionsRepository = new TransactionsRepository();
export default transactionsRepository;
