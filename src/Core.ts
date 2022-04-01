import { Api as ApiTypes } from "@wymp/types";

/**
 * A matching rule. The match score of a rule is calculated against a given transaction by
 * calculating the match percentage of each individual given component (date, desc or price),
 * summing those numbers, then dividing them by the 10,000 times the number of components present.
 * This gives us a percentage (0 to 100) indicating the final match score for the given rule.
 */
export type MatchingRule = {
  date?:
    | {
        t: "proximal-date";
        centerMs: number;
        radiusDays: number;
      }
    | {
        t: "date-range";
        from: number;
        to: number;
      };
  desc?: {
    term: string;
    regexp: boolean;
  };
  price?: {
    centerBaseUnits: number;
    radiusBaseUnits: number;
  };
  template: {
    splits: Array<SplitTemplate>;
    tags?: Array<string>;
  };
};

/**
 * A split template indicating various parameters of a split
 */
export type SplitTemplate = {
  /** The id of the virtual account for this split */
  virtualAccountId: string;
  /** Whether this split is a credit or a debit against the given virtual account */
  side: "credit" | "debit";
  /**
   * If unit is "%", a value from 0 to 100 indicating what percent of the total value of the tx this
   * split should consume. If unit is "$", a monetary value in base units. If "rest", this split
   * will take up whatever is left over after other splits have been calculated. Note that there
   * can be multiple "rest" splits.
   */
  value: number | "rest";
  /** Whether "value" is a percentage (0-100) or a monetary value in base units */
  unit: "%" | "$";
};

/**
 * A selection of transactions. This may be either a set of search criteria or a concrete set of
 * transaction ids.
 */
export type Selection =
  | {
      t: "search";
      date?: {
        from: number;
        to: number;
      };
      desc?: {
        term: string;
        regexp: boolean;
      };
    }
  | {
      t: "set";
      ids: Array<string>;
    };

/**
 * Attributes for the API data model. These are used in the database data model as well.
 */
export namespace Attributes {
  export type CashAccount = {
    type: "debit-accounts" | "credit-accounts";
    name: string;
    currencyId: string;
    accountNum: string;
    balanceBaseUnits: number;
  };

  export type EmailAddress = {
    email: string;
    verifiedMs: number;
  };

  export type MatchingRule = {
    value: MatchingRule;
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
    cashAccount: ApiTypes.ToOneRelationship<"cash-accounts">;
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
    recurringTransaction: ApiTypes.ToOneRelationship<"recurring-transactions", "nullable">;
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

  /**
   * A namespace containing the concrete transactional data for API endpoints. Note that this
   * describes the "data" value, NOT the entire request/response body. This is because the
   * luminous client uses types that operate at the "data" level.
   *
   * For these definitions, "tx" indicates the shape of the object _transmitted_ to the endpoint,
   * "rx" indicates the shape of the object _received_ from the endpoint, and "filter" indicates
   * possible filter values that can be passed to the endpoint.
   */
  export type Endpoints = {
    ["POST /cash-accounts"]: {
      tx: {
        type: "debit-accounts" | "credit-accounts";
        name: string;
        accountNum: string;
        currencyId: "USD";
        bankingProviderId: string;
        owner?: {
          type: "users";
          id: string;
        };
      };
      rx: CashAccount;
    };

    ["PATCH /cash-accounts/:id"]: {
      tx: {
        type: "cash-accounts";
        name: string;
      };
      rx: CashAccount;
    };

    ["POST /spaces"]: {
      tx: {
        type: "spaces";
        name?: string | null;
      };
      rx: Space;
    };

    /**
     * NOTE: This endpoint is intended to be used internally by the gateway service. Therefore
     * it requires an id.
     */
    ["POST /users"]: {
      tx: {
        type: "users";
        id: string;
        name: string;
        email: string;
      };
    };

    ["POST /virtual-accounts"]: {
      tx:
        | {
            type: "budget-accounts";
            name: string;
            targetAmountBaseUnits?: number | null;
          }
        | {
            type: "goal-accounts";
            name: string;
            targetAmountBaseUnits?: number | null;
            targetDateMs?: number | null;
          };
      rx: VirtualAccount;
    };

    /**
     * NOTE: This endpoint is generally not intended to be used for "external" transactions, i.e.,
     * money moving into and out of a given cash account. It is more intended for internal
     * transactions.
     */
    ["POST /transactions"]: {
      tx: {
        type: "transactions";
        status: "expected" | "cleared";
        description?: string;
        timestampMs?: number;
        amountBaseUnits: number;
        balanceBaseUnits?: number;
        splits: Array<{
          virtualAccountId: string;
          amountBaseUnits: number;
        }>;
      };
      rx: Transaction;
    };

    ["GET /transactions"]: {
      filter: {
        date?: {
          from: number;
          to: number;
        };
        desc?: {
          term: string;
          regexp: boolean;
        };
      };
    };

    ["PATCH /transactions/:id"]: {
      tx: {
        type: "transactions";
        description?: string;
        splits?: Array<SplitTemplate>;
      };
      rx: Transaction;
    };

    ["POST /transactions/bulk-edit"]: {
      tx: {
        transaction: {
          type: "transactions";
          description?: string;
          splits?: Array<SplitTemplate>;
        };
        selection: Selection;
      };
      rx: {
        type: "warnings";
        warnings: Array<string>;
      };
    };
  };
}
