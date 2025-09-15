import React from 'react';
import {View, TextInput, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {FRACTION, MULTIPLICATION, SQUAREROOT, NTHROOT, DIVIDE, ADDITION, SUBTRACTION, FormulaItem} from './constans.ts';
import {Colors} from "../../constants/Colors.ts";
import {SquareRootIcon} from "../../assets/icons/SquareRoot-Icon.tsx";

type ContentProps = {
    value: FormulaItem[];
    edit?: (newValue: FormulaItem[]) => void;
    prohibitEditing?: boolean;
};

const Content: React.FC<ContentProps> = ({value, edit, prohibitEditing}) => {
    const editData = (
        {
            id,
            type,
            passedValue,
        }: {
            id: string;
            type: string;
            passedValue: string;
        }) => {
        if (prohibitEditing) return;
        if (!edit) return;

        edit(
            value.map((el) =>
                el.id === id ? {...el, [type]: passedValue} : el
            )
        );
    };

    const deleteItem = (id: string) => {
        if (!edit) return;

        edit(value.filter((el) => el.id !== id));
    };

    return (
        <View style={styles.container}>
            {value?.map((el) => {
                const commonProps = {
                    editable: !prohibitEditing,
                    style: styles.input,
                };
                // const commonProps = {editable: !prohibitEditing, style: styles.input};

                switch (el.type) {
                    case FRACTION:
                        return (
                            <View key={el.id} style={{flexDirection: 'row',}}>
                                <View style={styles.fraction}>
                                    <TextInput
                                        value={el.numerator}
                                        placeholderTextColor={Colors.textGray}
                                        onChangeText={(text) => editData({
                                            id: el.id,
                                            type: 'numerator',
                                            passedValue: text
                                        })}
                                        {...commonProps}
                                        style={[commonProps.style, {borderBottomWidth: 0, borderRadius: 5}]}
                                    />
                                    <View style={styles.fractionLine}/>
                                    <TextInput
                                        value={el.denominator}
                                        placeholderTextColor={Colors.textGray}
                                        onChangeText={(text) => editData({
                                            id: el.id,
                                            type: 'denominator',
                                            passedValue: text
                                        })}
                                        {...commonProps}
                                        style={[commonProps.style, {borderBottomWidth: 0, borderRadius: 5}]}
                                    />
                                </View>

                                {!prohibitEditing && <TouchableOpacity
                                    style={styles.deleteBtn}
                                    onPress={() => deleteItem(el.id)}><Text
                                    style={styles.deleteBtnText}>Х</Text></TouchableOpacity>}
                            </View>
                        );
                    case SQUAREROOT:
                        return (
                            <View key={el.id} style={styles.sqrt}>
                                <SquareRootIcon
                                    width={60}
                                    height={30}/>
                                {/*<Text>√</Text>*/}
                                <TextInput
                                    value={el.value}
                                    placeholderTextColor={Colors.textGray}
                                    onChangeText={(text) => editData({id: el.id, type: 'value', passedValue: text})}
                                    {...commonProps}
                                    style={[commonProps.style, {borderRadius: 5, marginLeft: 0, top: 10, left: -40}]}
                                />
                                {!prohibitEditing && <TouchableOpacity
                                    style={[styles.deleteBtn, {position: 'absolute'}]}
                                    onPress={() => deleteItem(el.id)}><Text
                                    style={styles.deleteBtnText}>Х</Text>
                                </TouchableOpacity>}

                            </View>
                        );
                    case NTHROOT:
                        return (
                            <View key={el.id} style={styles.sqrt}>
                                <TextInput
                                    value={el.degree}
                                    placeholderTextColor={Colors.textGray}
                                    onChangeText={(text) => editData({id: el.id, type: 'degree', passedValue: text})}
                                    editable={!prohibitEditing}
                                    style={[{
                                        backgroundColor: '#f9edff',
                                        paddingHorizontal: 5,
                                        fontSize: 15,
                                     //   lineHeight: 1,
                                        top: -5,
                                        borderRadius: 5,
                                        height: 35,
                                    }]}

                                    //  editable={!prohibitEditing}
                                />
                                {/*<Text>√</Text>*/}
                                <SquareRootIcon
                                    width={60}
                                    height={30}/>
                                <TextInput
                                    value={el.value}
                                    placeholderTextColor={Colors.textGray}
                                    onChangeText={(text) => editData({id: el.id, type: 'value', passedValue: text})}
                                    {...commonProps}
                                    style={[commonProps.style, {borderRadius: 5, marginLeft: 0, top: 10, left: -40}]}
                                />
                                {!prohibitEditing && <TouchableOpacity
                                    style={[styles.deleteBtn, {position: 'absolute'}]}
                                    onPress={() => deleteItem(el.id)}><Text
                                    style={styles.deleteBtnText}>Х</Text></TouchableOpacity>}

                            </View>
                        );
                    case MULTIPLICATION:
                        return (
                            <View key={el.id} style={styles.root}>
                                <Text style={styles.item}>×</Text>
                                {!prohibitEditing && <TouchableOpacity
                                    style={styles.deleteBtn}
                                    onPress={() => deleteItem(el.id)}><Text
                                    style={styles.deleteBtnText}>Х</Text></TouchableOpacity>}
                            </View>

                        );
                    case DIVIDE:
                        return (
                            <View key={el.id} style={styles.root}>
                                <Text style={styles.item}>÷</Text>
                                {!prohibitEditing && <TouchableOpacity
                                    style={styles.deleteBtn}
                                    onPress={() => deleteItem(el.id)}><Text
                                    style={styles.deleteBtnText}>Х</Text></TouchableOpacity>}
                            </View>
                        );
                    case ADDITION:
                        return (
                            <View key={el.id} style={styles.root}>
                                <Text style={styles.item}>+</Text>
                                {!prohibitEditing && <TouchableOpacity
                                    style={styles.deleteBtn}
                                    onPress={() => deleteItem(el.id)}><Text
                                    style={styles.deleteBtnText}>Х</Text></TouchableOpacity>}
                            </View>
                        );
                    case SUBTRACTION:
                        return (
                            <View key={el.id} style={styles.root}>
                                <Text style={styles.item}>-</Text>
                                {!prohibitEditing && <TouchableOpacity
                                    style={styles.deleteBtn}
                                    onPress={() => deleteItem(el.id)}><Text
                                    style={styles.deleteBtnText}>Х</Text></TouchableOpacity>}
                            </View>
                        );
                    default:
                        return null;
                }
            })}
        </View>
    );
};

export default Content;

const styles = StyleSheet.create({
    container: {
        marginTop: 16,
        paddingHorizontal: 5,
        paddingVertical: 20,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 8,
        minHeight: 60,
        flexDirection: 'row',
        flexWrap: 'wrap',
        columnGap: 5,
        rowGap: 35,
        alignItems: 'center'
    },
    deleteBtn: {
        top: -20,
        right: 15,
        paddingHorizontal: 9,
        paddingVertical: 4,
        backgroundColor: '#ff4d4f',
        alignSelf: 'flex-start',
        borderRadius: 8,
        // position: 'absolute'
    },
    deleteBtnText: {
        color: Colors.colorWhite
    },
    item: {
        fontSize: 26,
        //  marginHorizontal: 4,
    },
    input: {
        borderBottomWidth: 1,
        borderColor: '#ccc',
        paddingHorizontal: 5,
        minWidth: 40,
        height: 40,
        alignItems: 'center',
        backgroundColor: '#f9edff',
        // textAlign: 'center',
        fontSize: 16,
    },
    fraction: {
        //  flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    sqrt: {
        flexDirection: 'row',
        position: 'relative',
        // alignSelf: 'flex-start',
        //   justifyContent: 'flex-start',
        //  marginHorizontal: 6,
        // backgroundColor: '#ba1616',
    },
    root: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        //  padding: 8
    },
    fractionLine: {
        width: '100%',
        height: 1,
        flex: 1,
        backgroundColor: '#000',
    },
});
