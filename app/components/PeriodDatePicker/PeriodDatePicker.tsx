import React, { useState } from 'react';
import { View, Text, Button, TouchableOpacity, StyleSheet } from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import dayjs from 'dayjs';

interface Props {
    fromDate: Date | null;
    toDate: Date | null;
    onChange: (from: Date | null, to: Date | null) => void;
}

export const PeriodDatePicker = ({ onChange, toDate, fromDate }:Props) => {
    const [isPickerVisible, setPickerVisible] = useState(false);
    const [currentPicker, setCurrentPicker] = useState<'from' | 'to' | null>(null);

    const showPicker = (type: 'from' | 'to') => {
        setCurrentPicker(type);
        setPickerVisible(true);
    };

    const hidePicker = () => {
        setPickerVisible(false);
        setCurrentPicker(null);
    };

    const handleConfirm = (date: Date) => {
        hidePicker();

        if (currentPicker === 'from') {
            onChange(date, toDate && date > toDate ? null : toDate); // если from > to, сбрасываем to
        } else if (currentPicker === 'to') {
            if (fromDate && date < fromDate) {
                // нельзя выбрать to меньше from
                return;
            }
            onChange(fromDate, date);
        }
    };

    const getMinDate = () => {
        if (currentPicker === 'to' && fromDate) return fromDate;
        return undefined;
    };

    const getMaxDate = () => {
        if (currentPicker === 'from' && toDate) return toDate;
        return undefined;
    };

    return (
        <View style={styles.container}>

            <View style={styles.row}>
                <TouchableOpacity style={styles.button} onPress={() => showPicker('from')}>
                    <Text style={styles.buttonText}>
                        {fromDate ? fromDate.toLocaleDateString() : 'Начало'}
                    </Text>
                </TouchableOpacity>

                <Text style={{ marginHorizontal: 4 }}>—</Text>

                <TouchableOpacity style={styles.button} onPress={() => showPicker('to')}>
                    <Text style={styles.buttonText}>
                        {toDate ? toDate.toLocaleDateString() : 'Конец'}
                    </Text>
                </TouchableOpacity>
            </View>

            <DateTimePickerModal
                isVisible={isPickerVisible}
                mode="date"
                date={
                    currentPicker === 'from'
                        ? fromDate || new Date()
                        : toDate || new Date()
                }
                onConfirm={handleConfirm}
                onCancel={hidePicker}
                minimumDate={getMinDate()}
                maximumDate={getMaxDate()}
                locale="ru"
                cancelTextIOS="Отмена"
                confirmTextIOS={'Выбрать'}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
     //   marginBottom: 16,
        marginRight: 10,
    },
    label: {
        fontWeight: 'bold',
        marginBottom: 6,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    button: {
        paddingVertical: 10,
        paddingHorizontal: 10,
        backgroundColor: '#f1e6f6',
        borderRadius: 8,
    },
    buttonText: {
        color: '#000',
        fontSize: 16
    },
});