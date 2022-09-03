import { Api as ApiTypes } from "@wymp/types";

/**
 * Matching clauses. The match score of a rule is calculated against a given transaction by
 * calculating the match percentage of each individual given component (date, desc or price),
 * summing those numbers, then dividing them by 10,000 times the number of components present.
 * This gives us a percentage (0 to 100) indicating the final match score for the given rule.
 */
export type MatchingClauses = {
  /**
   * A disqualifying clause that, if specified, requires the transaction to be on the specified
   * side
   */
  side?: "credit" | "debit";

  /**
   * A disqualifying clause matching either a date range or a date radius (e.g., "within 7 days
   * of..."). If the tx's date is within the range, it is scored. Otherwise, the rule is discarded.
   */
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

  /**
   * A non-disqualifying clause specifying a description to match. If the clause matches, this
   * increases the score of this rule. Otherwise, there is no penalty for not matching.
   */
  desc?: {
    term: string;
    regexp: boolean;
  };

  /**
   * A non-disqualifying clause specifying a price range to match. If the clause matches, this
   * increases the score of this rule. Otherwise, there is no penalty for not matching.
   */
  price?: {
    centerBaseUnits: number;
    radiusBaseUnits: number;
  };
};

/**
 * A transaction matching rule.
 */
export type TransactionMatchingRule = MatchingClauses & {
  t: "transaction-matching-rules";
  template: TransactionTemplate;
};

/**
 * A tag matching rule. These rules are used to apply tags to transactions. Multiple tag matching
 * rules may match a single transaction.
 */
export type TagMatchingRule = MatchingClauses & {
  t: "tag-matching-rules";
  tags: Array<string>;
};

export type MatchingRule = TransactionMatchingRule | TagMatchingRule;

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
  isTransfer?: boolean;
};

/**
 * A split template indicating various parameters of a split. Note that "splits templates" (i.e.,
 * _arrays_ of split templates) are understood to represent _one side_ of a transaction. The side
 * of the splits is determined by the transaction amount. If the amount is negative, the splits
 * are created as debit splits; if the amount is positive, they are created as credit splits.
 */
export type SplitTemplate = {
  /** The id of the virtual account for this split */
  virtualAccountId: string;
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
    matchingRule: TransactionMatchingRule;
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
    archivedMs: number | null;
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
    matchingRule: TransactionMatchingRule;
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

  export type VirtualAccountRelationship = {
    id: string;
    type: "virtual-account-relationships";
    parent: ApiTypes.ToOneRelationship<"virtual-accounts">;
    child: ApiTypes.ToOneRelationship<"virtual-accounts">;
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
    | VirtualAccountRelationship
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
    /**
     *
     *
     *
     * Cash Accounts
     *
     *
     *
     */

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

    /**
     *
     *
     *
     * Spaces
     *
     *
     *
     */
    ["POST /spaces"]: {
      tx: {
        type: "spaces";
        name?: string | null;
      };
      rx: Space;
    };

    /**
     *
     *
     *
     * Users
     *
     *
     *
     */

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

    /**
     *
     *
     *
     * Virtual Accounts
     *
     *
     *
     */

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
            targetAmountBaseUnits: number;
            targetDateMs?: number | null;
          };
      rx: VirtualAccount;
    };

    ["POST /cash-accounts/:id/recalculate-budget-targets"]: {
      tx:
        | { type: "null" }
        | {
            type: "budget-recalculation-params";
            targetMonthMs: number;
          };
      rx: null;
    };

    /**
     *
     *
     *
     * Virtual Account Relationships
     *
     *
     *
     */

    ["POST /cash-accounts/:id/virtual-account-relationships"]: {
      tx: Array<{
        type: "virtual-account-relationships";
        parent: { type: "virtual-accounts"; id: string };
        child: { type: "virtual-accounts"; id: string };
      }>;
      rx: Array<Api.VirtualAccountRelationship>;
    };

    ["GET /cash-accounts/:id/virtual-account-relationships"]: {
      rx: Array<Api.VirtualAccountRelationship>;
    };

    ["DELETE /cash-accounts/:id/virtual-account-relationships/:id"]: {
      rx: Array<Api.VirtualAccountRelationship>;
    };

    /**
     *
     *
     *
     * Transactions
     *
     *
     *
     */

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
     *
     *
     *
     * Expected Transactions
     *
     *
     *
     */

    ["POST /expected-transactions"]: {
      tx: {
        type: "expected-transactions";
        description: string;
        timestampMs: number;
        amountBaseUnits: number;
        matchingRule: TransactionMatchingRule;
      };
      rx: ExpectedTransaction;
    };

    ["GET /expected-transactions"]: {
      filter: {
        status?: ExpectedTransaction["status"];
      };
    };

    /**
     *
     *
     *
     * Recurring Transactions
     *
     *
     *
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
