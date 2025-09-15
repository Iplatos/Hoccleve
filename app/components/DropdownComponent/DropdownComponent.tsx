import React, {useEffect, useState} from 'react';
import {ActivityIndicator, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import {Dropdown} from "react-native-element-dropdown";
import {Colors} from "../../constants/Colors.ts";
import {useAppDispatch, useAppSelector} from "../../redux/hooks.ts";
import {fetchWorks} from "../../redux/slises/workSlice.ts";


// Пример данных для выпадающих списков
const homeworkData = [
    {label: 'Домашняя работа', value: 'homework'},
    // { label: 'Практическое задание', value: 'practical' },
    {label: 'Контрольная работа', value: 'controlwork'},
    {label: 'Классная работа', value: 'classwork'},
];

export const statusData = [
    {label: 'Не выполнено', value: 0},
    {label: 'Выполнено', value: 5},
    {label: 'Проверено', value: 10},
];

const directionData = [
    {label: 'Нет направления', value: 'no_direction'},
    {label: 'Математика', value: 'math'},
    {label: 'Физика', value: 'physics'},
];

type Props = {
    setHomeworkType: (value: 'homework' | 'controlwork' | 'classwork') => void;
    setStatus: (value: 0 | 5 | 10) => void;
    totalCount: number
};


export const DropdownComponent = (
    {
        setHomeworkType,
        totalCount,
        setStatus
    }: Props) => {

    const homeworkState = useAppSelector((state) => state.homework);

    // Состояние для выбранного типа работы и статуса
    const [selectedHomeworkType, setSelectedHomeworkType] = useState(homeworkData[0].value);
    const [selectedStatus, setSelectedStatus] = useState(statusData[0].value);


    useEffect(() => {
        setSelectedStatus(statusData[0].value)
    }, [selectedHomeworkType]);


    // Функция для сброса фильтров
    const resetFilters = () => {
        setSelectedHomeworkType(homeworkData[0].value);
        setSelectedStatus(statusData[0].value);
        setHomeworkType("homework")
        setStatus(0)
    };

    return (
        <View style={{height: 250}}>
            {/* Dropdown для типа работы */}
            <Dropdown
                style={styles.dropdown}
                containerStyle={styles.modalContainer}
                selectedTextStyle={styles.selectedTextStyle}
                data={homeworkData}
                maxHeight={150}
                labelField="label"
                valueField="value"
                value={selectedHomeworkType}
                placeholder="Выберите задание"
                onChange={(item) => {
                    setHomeworkType(item.value)
                    setSelectedHomeworkType(item.value);
                }}
            />

            {/* Dropdown для статуса */}
            <Dropdown
                style={styles.dropdown}
                containerStyle={styles.modalContainer}
                selectedTextStyle={styles.selectedTextStyle}
                data={statusData}
                maxHeight={150}
                labelField="label"
                valueField="value"
                value={selectedStatus}
                placeholder="Выберите статус"
                onChange={(item) => {
                    setStatus(item.value);
                    setSelectedStatus(item.value);
                }}
            />

            {/* Кнопка сброса фильтров */}
            <TouchableOpacity style={styles.resetButton} onPress={resetFilters}>
                <Text style={styles.resetButtonText}>Сбросить</Text>
            </TouchableOpacity>

            {/* Информационный блок */}
            <View style={styles.totalContainer}>
                <Text style={styles.totalText}>Всего работ: {totalCount}</Text>
            </View>
        </View>
    );
};

// Стили для компонента
const styles = StyleSheet.create({
    modalContainer: {
        borderBottomLeftRadius: 10,
        borderBottomRightRadius: 10,
        overflow: 'hidden',
    },
    resultContainer: {
        backgroundColor: '#ffc107',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
        alignItems: 'center',
    },
    resultText: {
        color: '#000',
        fontSize: 16,
        fontWeight: 'bold',
    },
    selectedTextStyle: {
        padding: 10,
        marginRight: 8,
        textAlign: 'left',
        // fontFamily: 'Inter-Medium',
        fontSize: 18,
        color: Colors.colorBlack,
    },
    itemContainer: {
        paddingVertical: 10,
    },
    itemTextStyle: {
        textAlign: 'center',
        //  fontFamily: 'Inter-Medium',
        fontSize: 16,
    },
    dropdown: {
        flex: 1,
        backgroundColor: '#f3e8ff',
        borderRadius: 8,
        overflow: 'hidden',
        marginBottom: 10,
    },
    resetButton: {
        backgroundColor: '#f3e8ff',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 10,
    },
    resetButtonText: {
        color: '#5a5a5a',
        fontSize: 16,
    },
    totalContainer: {
        backgroundColor: '#ffc107',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
        alignItems: 'center',
    },
    totalText: {
        color: '#000',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

