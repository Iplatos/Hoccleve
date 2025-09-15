import React, {useState} from 'react';
import {View, Text, TouchableOpacity, TextInput, ScrollView, StyleSheet} from 'react-native';
import {v4 as uuidv4} from 'uuid';
import {DynamicInput} from "./components/DynamicInput.tsx";
import {SquareRootIcon} from "../../assets/icons/SquareRoot-Icon.tsx";

export type FormulaElement =
    | { type: 'fraction'; numerator: string; denominator: string }
    | { type: 'sqrt'; value: string }
    | { type: 'nthRoot'; degree: string; value: string }
    | { type: 'text'; value: string }
    | { type: 'operator'; value: string };

const initialOptions = ['fraction', 'sqrt', 'nthRoot', '+', '-', '×', '÷'];

export const FormulaConstructor = () => {
    const [formula, setFormula] = useState<FormulaElement[]>([]);
    // console.log(formula)

    const createElement = (type: string): FormulaElement => {
        switch (type) {
            case 'fraction':
                return {
                    type: 'fraction',
                    numerator: '',
                    denominator: '',
                };
            case 'sqrt':
                return {
                    type: 'sqrt',
                    value: '',
                };
            case 'nthRoot':
                return {
                    type: 'nthRoot',
                    degree: '',
                    value: '',
                };
            case '+':
            case '-':
            case '×':
            case '÷':
                return {
                    type: 'operator',
                    value: type,
                };
            default:
                return {
                    type: 'text',
                    value: '',
                };
        }
    };

    const addElement = (type: string) => {
        const newElement = createElement(type);
        setFormula(prev => [...prev, newElement]);
    };

    const removeElementAtIndex = (index: number) => {
        setFormula(prev => prev.filter((_, i) => i !== index));
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.panel}>
                <Text style={styles.title}>Выберите элементы конструктора</Text>
                <View style={styles.buttonRow}>
                    {initialOptions.map(opt => (
                        <TouchableOpacity
                            key={opt}
                            onPress={() => addElement(opt)}
                            style={styles.button}
                        >
                            <Text style={styles.buttonText}>{opt}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            <View style={styles.formulaContainer}>
                <FormulaRenderer
                    formula={formula}
                    onChange={setFormula}
                    onRemove={removeElementAtIndex}
                />
            </View>
        </ScrollView>
    );
};

type Props = {
    formula: FormulaElement[];
    onChange: (newFormula: FormulaElement[]) => void;
    onRemove?: (index: number) => void;
};

export const FormulaRenderer: React.FC<Props> = ({formula, onChange, onRemove}) => {
    const handleUpdate = (index: number, updatedElement: FormulaElement) => {
        const newFormula = [...formula];
        newFormula[index] = updatedElement;
        onChange(newFormula);
    };

    return (
        <View style={{flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center'}}>
            {formula.map((el, idx) => (
                <TouchableOpacity
                    key={idx}
                    onLongPress={() => onRemove?.(idx)}
                    delayLongPress={300}
                >
                    <FormulaElementComponent
                        element={el}
                        onUpdate={(updatedEl) => handleUpdate(idx, updatedEl)}
                    />
                </TouchableOpacity>
            ))}
        </View>
    );
};

type FormulaElementProps = {
    element: FormulaElement;
    onUpdate?: (updated: FormulaElement) => void;
};

export const FormulaElementComponent: React.FC<FormulaElementProps> = ({element, onUpdate}) => {
    const updateChild = (key: string, value: any) => {
        onUpdate?.({...element, [key]: value});
    };

    switch (element.type) {
        case 'fraction':
            return (
                <View style={styles.fraction}>
                    <DynamicInput
                        value={element.numerator}
                        onInput={(val) => updateChild('numerator', val)}
                    />
                    <View style={styles.line}/>
                    <DynamicInput
                        value={element.denominator}
                        onInput={(val) => updateChild('denominator', val)}
                    />
                </View>
            );
        case 'sqrt':
            return (
                <View style={styles.sqrt}>
                    {/*<SquareRootIcon/>*/}
                    <Text style={styles.symbol}>√</Text>
                    <DynamicInput
                        value={element.value}
                        onInput={(val) => updateChild('value', val)}
                    />
                </View>
            );
        case 'nthRoot':
            return (
                <View style={styles.root}>

                    <DynamicInput
                        value={element.degree}
                        onInput={(val) => updateChild('degree', val)}
                    />


                    <Text style={styles.symbol}>√</Text>
                    <DynamicInput
                        value={element.value}
                        onInput={(val) => updateChild('value', val)}
                    />
                </View>
            );
        case 'text':
            return (
                <DynamicInput
                    value={element.value}
                    onInput={(val) => updateChild('value', val)}
                />
            );
        case 'operator':
            return <Text style={styles.operator}>{element.value}</Text>;
        default:
            return null;
    }
};

const styles = StyleSheet.create({
    container: {padding: 16},
    panel: {backgroundColor: '#f5eaff', borderRadius: 8, padding: 10},
    title: {marginBottom: 8, fontWeight: 'bold'},
    buttonRow: {flexDirection: 'row', flexWrap: 'wrap', gap: 6},
    button: {
        backgroundColor: '#b089f4',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
        marginRight: 6,
        marginBottom: 6,
    },
    buttonText: {color: '#fff', fontWeight: 'bold'},
    formulaContainer: {
        marginTop: 16,
        padding: 12,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 8,
        minHeight: 60,
    },
    input: {
        //  borderBottomWidth: 1,
        width: 30,
        textAlign: 'center',
        marginHorizontal: 2,
        fontSize: 16,
    },
    operation: {
        marginHorizontal: 6,
        fontSize: 18,
        fontWeight: 'bold',
    },
    fraction: {
        alignItems: 'center',
        marginHorizontal: 6,
    },
    fractionLine: {
        borderTopWidth: 1,
        width: 30,
        marginVertical: 2,
    },
    sqrt: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 6,
    },
    sqrtSymbol: {
        fontSize: 20,
        marginRight: 2,
    },
    nthRoot: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 6,
    },
    rootDegree: {
        width: 20,
        fontSize: 12,
        textAlign: 'center',
        borderBottomWidth: 1,
        marginRight: 2,
    },

    // fraction: {
    //     alignItems: 'center',
    //     justifyContent: 'center',
    //     marginHorizontal: 4,
    // },
    line: {
        height: 1,
        width: '100%',
        backgroundColor: '#000',
        marginVertical: 2,
    },
    // sqrt: {
    //     flexDirection: 'row',
    //     alignItems: 'center',
    //     marginHorizontal: 4,
    // },
    root: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        marginHorizontal: 4,
    },
    symbol: {
        fontSize: 18,
        marginRight: 2,
    },
    operator: {
        fontSize: 20,
        marginHorizontal: 4,
    },
});

export default FormulaConstructor;
