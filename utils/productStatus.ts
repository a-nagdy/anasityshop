// Determine product status based on quantity and active state
export const determineProductStatus = (quantity: number, active: boolean): string => {
    if (!active) {
        return 'draft';
    }

    if (quantity <= 0) {
        return 'out of stock';
    }

    if (quantity <= 5 && quantity > 0) {
        return 'low stock';
    }

    return 'in stock';
}; 