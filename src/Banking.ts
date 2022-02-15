import { Api as ApiTypes } from "@wymp/types";

export namespace Attributes {
  export type BankingProvider = {
    name: string;
  };

  export type Import = {
    src: "csv" | "pull";
    comment: string | null;
    timestampMs: number;
  };

  export type Transaction = {
    status: "cleared" | "pending";
    amountBaseUnits: number;
    reconciledBaseUnits: number;
    description: string;
    timestampMs: number;
    recordedMs: number;
  };
}

export namespace Api {
  export type BankingProvider = Attributes.BankingProvider & {
    id: string;
    type: "banking-providers";
  };

  export type Import = Attributes.Import & {
    id: string;
    type: "imports";
    accountId: string;
  };

  export type Transaction<Meta extends object = object> = Attributes.Transaction & {
    id: string;
    type: "transactions";
    meta: Meta;
    uniqueHash: string;
    import: ApiTypes.ToOneRelationship<"imports">;
  };
}

export namespace Mq {
  export type Transaction = {
    domain: "banking";
    action: "created" | "updated" | "deleted";
    resource: {
      t: "transactions";
      id: string;
      status: "cleared" | "pending";
      amountBaseUnits: number;
      reconciledBaseUnits: number;
      description: string;
      timestampMs: number;
      recordedMs: number;
      accountId: string;
      meta: object;
      importId: string;
    };
  };
}
