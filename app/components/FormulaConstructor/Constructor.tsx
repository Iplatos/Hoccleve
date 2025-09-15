import React, {FC, useEffect, useState} from 'react';
import {View, Text, TouchableOpacity, StyleSheet, TextInput, Platform, KeyboardAvoidingView} from 'react-native';
import {nanoid} from 'nanoid/non-secure';
import Content from './Content';
import {
    FRACTION,
    MULTIPLICATION,
    SQUAREROOT,
    NTHROOT,
    DIVIDE,
    ADDITION,
    SUBTRACTION,
    FormulaValidationResult, FormulaItemType, FormulaItem, FormulaError
} from './constans.ts';
import {RFValue} from "react-native-responsive-fontsize";
import {Colors} from "../../constants/Colors.ts";

interface ConstructorProps {
    value?: FormulaItem[];
    edit?: (items: FormulaItem[]) => void;
    prohibitEditing?: boolean;
    validate?: boolean;
    name?: string;
    onError?: (val: (prev: FormulaValidationResult) => FormulaValidationResult) => void;
}


const Constructor: FC<ConstructorProps> = (
    {
        edit,
        value = [],
        prohibitEditing,
        onError = () => {
        },
        validate,
        name = '',
    }) => {
    const [isShowMenu, setIsShowMenu] = useState(false);

    const menuToggle = () => setIsShowMenu(prev => !prev);

    const add = ({type}: { type: FormulaItemType }) => {
        if (!edit) return;

        if (type === 'fraction') {
            edit([...value, {type, numerator: '', denominator: '', id: nanoid()}]);
        } else if (type === 'squareRoot') {
            edit([...value, {type, value: '', id: nanoid()}]);
        } else if (type === 'nthRoot') {
            edit([...value, {type, value: '', degree: '', id: nanoid()}]);
        } else {
            edit([...value, {type, id: nanoid()} as FormulaItem]);
        }
    };

    const setError = (val: FormulaError) => {
        onError((prev) => {
            const items = {...prev.items, [name]: val};
            const valid = !Object.values(items).some((v) => v.value);
            return {items, valid};
        });
    };


    useEffect(() => {
        if (!name) return;
        const hasError = value.length === 0;
        setError({value: hasError ? 'Формула должна содержать хотя бы один элемент' : ''});
    }, [value.length]);

    return (

        <View style={styles.wrapper}>
            {isShowMenu && !prohibitEditing && (
                <View style={styles.menu}>
                    <TouchableOpacity
                        onPress={() => setIsShowMenu(prev => !prev)}
                        style={{
                            position: 'absolute',
                            right: 5,
                            top: 5,
                            paddingHorizontal: 9,
                            paddingVertical: 4,
                            backgroundColor: '#ff4d4f',
                            alignSelf: 'flex-start',
                            borderRadius: 8,
                        }}>
                        <Text style={{color: Colors.colorWhite}}>X</Text>
                    </TouchableOpacity>
                    <Text style={styles.title}>Выберите элементы конструктора</Text>
                    <View style={styles.buttonRow}>
                        <TouchableOpacity
                            style={{paddingHorizontal: 5}}
                            onPress={() => add({type: FRACTION})}>
                            <View style={styles.fraction}>
                                <Text style={{fontSize: 16}}>X</Text>
                                <View style={styles.fractionLine}/>
                                <Text style={{fontSize: 16}}>Y</Text>
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={{padding: 10}}
                            onPress={() => add({type: SQUAREROOT})}><Text
                            style={{fontSize: 20}}>√</Text></TouchableOpacity>
                        <TouchableOpacity style={{padding: 10}} onPress={() => add({type: NTHROOT})}><Text
                            style={{fontSize: 20}}>ⁿ√</Text></TouchableOpacity>
                        <TouchableOpacity style={{padding: 10}} onPress={() => add({type: MULTIPLICATION})}><Text
                            style={{fontSize: 20}}>×</Text></TouchableOpacity>
                        <TouchableOpacity style={{padding: 10}} onPress={() => add({type: DIVIDE})}><Text
                            style={{fontSize: 20}}>÷</Text></TouchableOpacity>
                        <TouchableOpacity style={{padding: 10}} onPress={() => add({type: ADDITION})}><Text
                            style={{fontSize: 20}}>+</Text></TouchableOpacity>
                        <TouchableOpacity style={{padding: 10}} onPress={() => add({type: SUBTRACTION})}><Text
                            style={{fontSize: 20}}>-</Text></TouchableOpacity>
                    </View>

                </View>
            )}

            {value.length > 0 ? (
                <Content value={value} edit={edit} prohibitEditing={prohibitEditing}/>
            ) : prohibitEditing ? (
                <Text style={styles.placeholder}>Конструктор</Text>
            ) : null}

            {!prohibitEditing && (
                <TouchableOpacity onPress={menuToggle} style={styles.addButton}>
                    <Text style={styles.plus}>＋</Text>
                </TouchableOpacity>
            )}

            {validate && value.length === 0 && (
                <Text style={styles.errorText}>Поле не заполнено</Text>
            )}
        </View>


    );
};

export default Constructor;

const styles = StyleSheet.create({

    fraction: {
        //  flexDirection: 'row',
        //   alignItems: 'center',
        gap: 4,
    },

    fractionLine: {
        width: '100%',
        height: 1,
        flex: 1,
        backgroundColor: '#000',
    },
    wrapper: {
        flex: 1,
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 13,
        borderWidth: 1,
        borderColor: '#e2dfdf',
        gap: 8,
       // marginBottom: 10
    },
    title: {marginBottom: 8, fontWeight: 'bold', textAlign: 'left',},

    placeholder: {
        fontSize: 14,
        color: '#7b7b7b',
    },
    errorText: {
        marginTop: 5,
        fontSize: 13,
        fontWeight: '500',
        color: '#ff4d4f',
    },
    addButton: {
        alignSelf: 'flex-start',
        paddingHorizontal: 12,
        paddingVertical: 6,
        backgroundColor: '#eee',
        borderRadius: 6,
    },
    plus: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    menu: {
        position: 'absolute',
        width: "100%",
        // alignItems: 'center',
        zIndex: 1,
        top: -115,
        right: 10,
        gap: 10,
        backgroundColor: '#f5eaff',
        borderRadius: 8,
        paddingVertical: 15,
        paddingHorizontal: 15
        // marginBottom: 8,
    },
    buttonRow: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
        //   gap: 15
    },

});
