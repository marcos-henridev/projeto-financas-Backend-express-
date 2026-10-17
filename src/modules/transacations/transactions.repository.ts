import { SignatureUsage } from 'typescript/unstable/sync';
import { prisma } from '../../prisma';
import { account_kind } from '../../../generated/prisma/enums';

export type kindTransaction = 'receita' | 'despesa' | 'transferencia';
export type statusTransaction = 'pendente' | 'pago' | 'vencido' | 'cancelado';
class TransactionsRepository {
  // findUnique = async ()=>{
  //   return prisma.
  // }
  Deleted = async (data: { id: string; user_id: string }) => {
    return prisma.$transaction(async (tx) => {
      const transaction = await tx.transactions.update({
        where: {
          id: data.id,
          user_id: data.user_id,
          deleted_at: null,
        },
        data: {
          updated_at: new Date(),
          deleted_at: new Date(),
        },
      });

      // origem: receita desce, despesa e trasferencia sobe
      if (transaction.status === 'pago') {
        const origem = await tx.accounts.update({
          where: {
            user_id: data.user_id,
            id: transaction.account_id,
            deleted_at: null,
          },
          data: {
            current_balance:
              transaction.kind === 'receita'
                ? { decrement: transaction.amount }
                : { increment: transaction.amount },
            updated_at: new Date(),
          },
        });

        // transferencia: o destino devolve o que recebeu
        if (transaction.kind === 'transferencia') {
          const destination = await tx.accounts.update({
            where: {
              id: transaction.destination_account_id as string,
              user_id: data.user_id,
              deleted_at: null,
            },
            data: {
              current_balance: { decrement: transaction.amount },
              updated_at: new Date(),
            },
          });
        }
      }
      return transaction;
    });
  };

  getAllTransactions = async (data: {
    user_id: string;
    id?: string;
    account_id?: string;
    kind?: kindTransaction;
    status?: statusTransaction;
    from?: Date;
    to?: Date;
  }) => {
    return prisma.transactions.findMany({
      where: {
        user_id: data.user_id,
        id: data.id,
        ...(data.kind ? { kind: data.kind } : {}),
        ...(data.status ? { status: data.status } : {}),
        ...(data.account_id ? { account_id: data.account_id } : {}),
        ...(data.from || data.to
          ? {
              due_date: {
                ...(data.from ? { gte: data.from } : {}),
                ...(data.to ? { lte: data.to } : {}),
              },
            }
          : {}),
        deleted_at: null,
      },
      orderBy: { due_date: 'desc' },
    });
  };
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
            is_active: true,
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
            where: { id: data.destination_account_id, user_id: data.user_id, is_active: true },
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
