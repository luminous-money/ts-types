import { Api as ApiTypes } from "@wymp/types";

export namespace Attributes {
  export type CashAccount = {
    type: "debit-accounts" | "credit-accounts";
    name: string;
    currencyId: string;
    accountNum: string;
  };

  export type CashTransaction = {
    status: "cleared" | "pending";
    amountBaseUnits: number;
    counterparty: string | null;
    comment: string;
    timestampMs: number;
  };

  export type EmailAddress = {
    email: string;
    verifiedMs: number;
  };

  export type ExpectedTransaction = {
    amountBaseUnits: number;
    timestampMs: number;
    skipped: number;
  };

  export type MatchingRule = {
    type: "comment" | "counterparty" | "date-amount";
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

  export type BankingProvider = {
    name: string;
  };

  export type DailyRecurrence = {
    type: "day";
    unitInterval: number;
    startTimeMs: number;
  };

  export type WeeklyRecurrence = {
    type: "week";
    unitInterval: number;
    unitDayList: string;
    startTimeMs: number;
  };

  export type MonthlyRecurrence = {
    type: "month";
    unitInterval: number;
    unitDayList: string;
    startTimeMs: number;
  };

  export type YearlyRecurrence = {
    type: "year";
    unitInterval: number;
    unitDayList: string;
    months: string;
    startTimeMs: number;
  };

  export type Recurrence =
    | DailyRecurrence
    | WeeklyRecurrence
    | MonthlyRecurrence
    | YearlyRecurrence;

  export type FixedRecurringTransaction = {
    amountBaseUnits: number;
    name: string;
    type: "fixed";
    suggested: number;
    accepted: number | null;
  };

  export type AdaptiveEstimatedRecurringTransaction = {
    amountBaseUnits: number;
    name: string;
    type: "adaptive";
    nature: "estimated";
    scope: "seasonal" | "trailing";
    suggested: number;
    accepted: number;
  };

  export type AdaptiveExactRecurringTransaction = {
    amountBaseUnits: number;
    name: string;
    type: "adaptive";
    nature: "exact";
    suggested: number;
    accepted: number;
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
  };

  export type VirtualTransaction = {
    comment: string | null;
    timestampMs: number;
  };
}

export namespace Api {
  export type CashAccount = Attributes.CashAccount & {
    id: string;
    bankingProvider: { data: { id: string; type: "banking-providers" } };
    owner: ApiTypes.ToOneRelationship<"users">;
    space: ApiTypes.ToOneRelationship<"spaces">;
  };

  export type CashTransaction = Attributes.CashTransaction & {
    id: string;
    type: "cash-transactions";
    meta: null | any;
    cashAccount: ApiTypes.ToOneRelationship<"cash-accounts">;
    virtualTransaction: ApiTypes.ToOneRelationship<"virtual-transactions", "nullable">;
  };

  export type EmailAddress = Attributes.EmailAddress & {
    type: "email-addresses";
    user: ApiTypes.ToOneRelationship<"users">;
  };

  export type ExpectedTransaction = Attributes.ExpectedTransaction & {
    id: string;
    type: "expected-transactions";
    recurringTransaction: { data: { id: string; type: "recurring-transactions" } };
    fulfilledBy: { data: { id: string; type: "virtual-transactions" } | null };
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
    virtualTransaction: ApiTypes.ToOneRelationship<"virtual-transactions", "nullable">;
    lastMessage: { data: Message };
  };

  export type BankingProvider = Attributes.BankingProvider & {
    id: string;
    type: "banking-providers";
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
    virtualTransaction: ApiTypes.ToOneRelationship<"virtual-transactions">;
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
    critical: boolean;
    targetDateMs: number | null;
    cashAccount: ApiTypes.ToOneRelationship<"cash-accounts">;
  };

  export type VirtualTransaction = Attributes.VirtualTransaction & {
    id: string;
    type: "virtual-transactions";
    splits: ApiTypes.ToManyRelationship<"splits">;
  };

  export type Resource =
    | CashAccount
    | CashTransaction
    | EmailAddress
    | ExpectedTransaction
    | MatchingRule
    | Membership
    | Message
    | MessageThread
    | BankingProvider
    | RecurringTransaction
    | Space
    | Split
    | User
    | VirtualAccount
    | VirtualTransaction;
}
