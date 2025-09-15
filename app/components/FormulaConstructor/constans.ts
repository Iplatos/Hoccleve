export const MULTIPLICATION = 'multiplication';
export const FRACTION = 'fraction';
export const SQUAREROOT = 'squareRoot';
export const NTHROOT = 'nthRoot';
export const DIVIDE = 'divide';
export const ADDITION = 'addition';
export const SUBTRACTION = 'subtraction';


// types/formula.ts

export type FormulaItemType =
    | 'fraction'
    | 'squareRoot'
    | 'nthRoot'
    | 'multiplication'
    | 'divide'
    | 'addition'
    | 'subtraction'
    | 'value';

export interface BaseFormulaItem {
    id: string;
    type: FormulaItemType;
}

export interface FractionItem extends BaseFormulaItem {
    type: 'fraction';
    numerator: string;
    denominator: string;
}

export interface SquareRootItem extends BaseFormulaItem {
    type: 'squareRoot';
    value: string;
}

export interface NthRootItem extends BaseFormulaItem {
    type: 'nthRoot';
    value: string;
    degree: string;
}

export interface ValueItem extends BaseFormulaItem {
    type: 'value';
    value?: string;
}

export interface OperatorItem extends BaseFormulaItem {
    type: 'multiplication' | 'divide' | 'addition' | 'subtraction';
}

export type FormulaItem =
    | FractionItem
    | SquareRootItem
    | NthRootItem
    | ValueItem
    | OperatorItem;

export interface FormulaError {
    value: string;
}

export interface FormulaValidationResult {
    items: Record<string, FormulaError>;
    valid: boolean;
}

