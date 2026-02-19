// ---------------------------------------------------------------------------
// Sale — core domain model
// ---------------------------------------------------------------------------

export interface Sale {
    /** UUID primary key */
    id: string;

    /** The shop owner who made the sale */
    userId: string;

    /** The product that was sold */
    productId: string;

    /** Snapshot of product name at time of sale */
    productName: string;

    /** Number of units sold */
    quantity: number;

    /** Price per unit at time of sale */
    unitPrice: number;

    /** quantity × unitPrice — stored by DB */
    totalAmount: number;

    /** ISO 8601 timestamp — set by the database on insert */
    createdAt: string;
}
