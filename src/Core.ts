import { Api as ApiTypes } from "@wymp/types";

export type TemplateTransaction = {
  /** The description to use for the created transaction */
  description: string;

  /** An array of tags to apply to the created transaction */
  tags: Array<string>;

  /** An array of splits that define the created transaction */
  splits: Array<{
    /** The virtual account id of this split */
    virtualAccountId: string;

    /**
     * The percentage of the total amount that this split represents (100% == 100). The total of
     * all splits of a given sign (+/-) should add up to 100, and the sum of all splits should be
     * 0.
     */
    amountPerc: number;
  }>;
};

export namespace Attributes {
  export type CashAccount = {
    type: "debit-accounts" | "credit-accounts";
    name: string;
    currencyId: string;
    accountNum: string;
    balanceBaseUnits: string;
  };

  export type EmailAddress = {
    email: string;
    verifiedMs: number;
  };

  export type MatchingRule = {
    type: "description" | "counterparty" | "date-amount";
    exactMatch: number;
    valueJson: string;
  };

  export type Membership = {
    manage: number;
    delete: number;
  };

  export type MessageThread = {
    title: string;
  };

  export type Message = {
    content: string;
    timestampMs: number;
  };

  export type DailyRecurrence = {
    rectype: "day";
    recUnitInterval: number;
    recStartTimeMs: number;
  };

  export type WeeklyRecurrence = {
    recType: "week";
    recUnitInterval: number;
    recUnitDayList: string;
    recStartTimeMs: number;
  };

  export type MonthlyRecurrence = {
    recType: "month";
    recUnitInterval: number;
    recUnitDayList: string;
    recStartTimeMs: number;
  };

  export type YearlyRecurrence = {
    recType: "year";
    recUnitInterval: number;
    recUnitDayList: string;
    recMonths: string;
    recStartTimeMs: number;
  };

  export type Recurrence =
    | DailyRecurrence
    | WeeklyRecurrence
    | MonthlyRecurrence
    | YearlyRecurrence;

  export type FixedRecurringTransaction = Recurrence & {
    name: string;
    templateJson: string;
    type: "fixed";
  };

  export type AdaptiveEstimatedRecurringTransaction = Recurrence & {
    name: string;
    templateJson: string;
    type: "adaptive";
    nature: "estimated";
    scope: "seasonal" | "trailing";
  };

  export type AdaptiveExactRecurringTransaction = Recurrence & {
    name: string;
    templateJson: string;
    type: "adaptive";
    nature: "exact";
  };

  export type RecurringTransaction =
    | FixedRecurringTransaction
    | AdaptiveEstimatedRecurringTransaction
    | AdaptiveExactRecurringTransaction;

  export type Space = {
    name: string;
  };

  export type Split = {
    amountBaseUnits: number;
    timestampMs: number;
  };

  export type User = {
    name: string;
    createdMs: number;
  };

  export type VirtualAccountTypes =
    | "income-accounts"
    | "expense-accounts"
    | "transfer-accounts"
    | "default-accounts"
    | "budget-accounts"
    | "goal-accounts";
  export type VirtualAccount = {
    type: VirtualAccountTypes;
    name: string;
    targetDateMs: number | null;
    targetAmountBaseUnits: number | null;
    balanceBaseUnits: number;
  };

  type BaseTransaction = {
    description: string | null;
    timestampMs: number;
    amountBaseUnits: number;
    serialNumber: number;
    splits: Array<{
      amountBaseUnits: number;
      virtualAccountId: string;
    }>;
  };
  export type ExpectedTransaction = BaseTransaction & {
    status: "expected";
    balanceBaseUnits: number | null;
  };
  export type SkippedExpectedTransaction = BaseTransaction & {
    status: "skipped-expected";
    balanceBaseUnits: number | null;
  };
  export type ClearedTransaction = BaseTransaction & {
    status: "cleared";
    balanceBaseUnits: number;
  };
  export type Transaction = ExpectedTransaction | SkippedExpectedTransaction | ClearedTransaction;
}

export namespace Api {
  export type CashAccount = Attributes.CashAccount & {
    id: string;
    bankingProviderId: string;
    owner: ApiTypes.ToOneRelationship<"users">;
    space: ApiTypes.ToOneRelationship<"spaces">;
  };

  export type EmailAddress = Attributes.EmailAddress & {
    type: "email-addresses";
    user: ApiTypes.ToOneRelationship<"users">;
  };

  export type MatchingRule = Attributes.MatchingRule & {
    id: string;
    type: "matching-rules";
    target: { data: { id: string; type: "recurring-transactions" | "virtual-accounts" | "tags" } };
  };

  export type Membership = Attributes.Membership & {
    id: string;
    type: "memberships";
    user: ApiTypes.ToOneRelationship<"users">;
    space: ApiTypes.ToOneRelationship<"spaces">;
  };

  export type Message = Attributes.Message & {
    id: string;
    type: "messsage";
    author: ApiTypes.ToOneRelationship<"users">;
  };

  export type MessageThread = Attributes.MessageThread & {
    id: string;
    type: "message-threads";
    transaction: ApiTypes.ToOneRelationship<"transactions", "nullable">;
    lastMessage: { data: Message };
  };

  declare type RecurringTransCommon = {
    id: string;
    type: "recurring-transactions";
    virtualAccount: ApiTypes.ToOneRelationship<"virtual-accounts">;
    recurrence: Attributes.Recurrence;
  };
  export type FixedRecurringTransaction = RecurringTransCommon &
    Attributes.FixedRecurringTransaction & { type: "fixed-recurring-transactions" };
  export type AdaptiveEstimatedRecurringTransaction = RecurringTransCommon &
    Attributes.AdaptiveEstimatedRecurringTransaction & {
      type: "adaptive-estimated-recurring-transactions";
    };
  export type AdaptiveExactRecurringTransaction = RecurringTransCommon &
    Attributes.AdaptiveExactRecurringTransaction & {
      type: "adaptive-exact-recurring-transactions";
    };
  export type RecurringTransaction =
    | FixedRecurringTransaction
    | AdaptiveEstimatedRecurringTransaction
    | AdaptiveExactRecurringTransaction;

  export type Space = Attributes.Space & {
    id: string;
    type: "spaces";
  };

  export type Split = Attributes.Split & {
    id: string;
    type: "splits";
    transaction: ApiTypes.ToOneRelationship<"transactions">;
    virtualAccount: ApiTypes.ToOneRelationship<"virtual-accounts">;
  };

  export type User = Attributes.User & {
    id: string;
    type: "users";
    defaultSpace: ApiTypes.ToOneRelationship<"spaces">;
    emailAddresses: ApiTypes.ToManyRelationship<"email-addresses">;
  };

  export type VirtualAccount = Attributes.VirtualAccount & {
    id: string;
    cashAccount: ApiTypes.ToOneRelationship<"cash-accounts">;
  };

  export type Transaction = Attributes.Transaction & {
    id: string;
    type: "transactions";
    cashAccount: ApiTypes.ToOneRelationship<"cash-accounts">;
    recurringTransaction: ApiTypes.ToOneRelationship<"cash-accounts", "nullable">;
  };

  export type Resource =
    | CashAccount
    | EmailAddress
    | MatchingRule
    | Membership
    | Message
    | MessageThread
    | RecurringTransaction
    | Space
    | Split
    | User
    | VirtualAccount
    | Transaction;
}
