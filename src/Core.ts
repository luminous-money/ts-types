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
  template: TransactionTemplate;
};

/**
 * This internal type is necessary for referencing the MatchingRule type within lower namespaces,
 * since there are conflicing `MatchingRule` types in those namespaces.
 */
type MatchingRuleType = MatchingRule;

/**
 * A template for a transaction
 */
export type TransactionTemplate = {
  description?: string;
  splits: Array<SplitTemplate>;
  tags?: Array<string>;
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
export type TransactionSelection =
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

/** An object defining a daily recurrence */
export type DailyRecurrence = {
  type: "daily-recurrences";
  /** Every x days */
  interval: number;
};

/** An object defining a weekly recurrence */
export type WeeklyRecurrence = {
  type: "weekly-recurrences";
  /** Every x weeks */
  interval: number;
  /** On these days */
  dayList: { [k in "m" | "tu" | "w" | "th" | "f" | "sa" | "su"]?: 1 };
};

/** An object defining a monthly recurrence */
export type MonthlyRecurrence = {
  type: "monthly-recurrences";
  /** Every x months */
  interval: number;
  /**
   * On these days of the month
   *
   * This must be an array of numbers between 1 and 31. When a number higher than the last day of
   * the month is specified, the number is coerced to be the last day of the given month.
   */
  dayList: Array<number>;
};

/** An object defining a yearly recurrence */
export type YearlyRecurrence = {
  type: "yearly-recurrences";
  /** Recur in these months */
  monthList: {
    [k in
      | "jan"
      | "feb"
      | "mar"
      | "apr"
      | "may"
      | "jun"
      | "jul"
      | "aug"
      | "sep"
      | "oct"
      | "nov"
      | "dec"]?: 1;
  };
  /**
   * On these days
   *
   * This must be an array of numbers between 1 and 31. When a number higher than the last day of
   * the given month is specified, the number is coerced to be the last day of the given month.
   */
  dayList: Array<number>;
};

/** Aggregate of all types of recurrence */
export type Recurrence = DailyRecurrence | WeeklyRecurrence | MonthlyRecurrence | YearlyRecurrence;

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
    value: MatchingRuleType;
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

  export type RecurringTransaction = {
    algorithm: "fixed" | "seasonal" | "trailing" | "last";
    description: string;
    amountBaseUnits: number;
    startTimeMs: number;
    matchingRule: MatchingRuleType;
    recurrence: Recurrence;
  };

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

  export type Transaction = {
    description: string;
    timestampMs: number;
    amountBaseUnits: number;
    balanceBaseUnits: number;
    serialNumber: number;
    splits: Array<{
      amountBaseUnits: number;
      virtualAccountId: string;
    }>;
  };

  export type ExpectedTransaction = {
    status: "open" | "matched" | "skipped";
    description: string | null;
    amountBaseUnits: number;
    timestampMs: number;
    matchingRule: MatchingRuleType;
  };
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

  export type RecurringTransaction = Attributes.RecurringTransaction & {
    id: string;
    type: "recurring-transactions";
    cashAccount: ApiTypes.ToOneRelationship<"cash-accounts">;
  };

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
    expectedTx: ApiTypes.ToOneRelationship<"expected-transactions", "nullable">;
  };

  export type ExpectedTransaction = Attributes.ExpectedTransaction & {
    id: string;
    type: "expected-transactions";
    cashAccount: ApiTypes.ToOneRelationship<"cash-accounts">;
    recurringTx: ApiTypes.ToOneRelationship<"recurring-transactions", "nullable">;
  };

  export type Resource =
    | CashAccount
    | EmailAddress
    | ExpectedTransaction
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
        description: string;
        timestampMs?: number;
        amountBaseUnits: number;
        balanceBaseUnits: number;
        expectedTxId?: string | null;
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
      tx: Partial<TransactionTemplate> & { type: "transaction-templates" };
      rx: Transaction;
    };

    ["POST /transactions/bulk-edit"]: {
      tx: {
        transaction: Partial<TransactionTemplate> & { type: "transaction-templates" };
        selection: TransactionSelection;
      };
      rx: {
        type: "warnings";
        warnings: Array<string>;
      };
    };

    /**
     * Expected Transactions
     */

    ["POST /expected-transactions"]: {
      tx: {
        type: "expected-transactions";
        description: string;
        timestampMs: number;
        amountBaseUnits: number;
        matchingRule: MatchingRuleType;
      };
      rx: ExpectedTransaction;
    };

    ["GET /expected-transactions"]: {
      filter: {
        status?: ExpectedTransaction["status"];
      };
    };

    /**
     * Recurring Transactions
     */

    ["POST /recurring-transactions"]: {
      tx: { type: "recurring-transactions" } & Attributes.RecurringTransaction;
      rx: RecurringTransaction;
    };

    ["GET /recurring-transactions"]: {
      filter: {
        startTimeMs: ["<" | ">" | "=" | "<=" | ">=", number];
      };
    };

    ["POST /cash-accounts/:id/recurring-transactions/process"]: {
      tx: {
        type: "recurring-tx-process-limits";
        fromMs: number;
        untilMs: number;
      };
      rx: null;
    };

    ["POST /spaces/:id/recurring-transactions/process"]: {
      tx: {
        type: "recurring-tx-process-limits";
        fromMs: number;
        untilMs: number;
      };
      rx: null;
    };
  };
}
