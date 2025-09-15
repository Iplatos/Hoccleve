import React, {useState} from 'react';
import {Modal, View, Text, Button, StyleSheet, TouchableOpacity} from 'react-native';
import {Picker} from '@react-native-picker/picker';

interface MonthYearPickerProps {
    visible: boolean;
    onClose: () => void;
    onSelect: (month: number, year: number) => void;
    initialMonth?: number;
    initialYear?: number;
}

const months = [
    'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
    'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
];

const years = Array.from({length: 20}, (_, i) => new Date().getFullYear() - i);


export const MonthYearPicker: React.FC<MonthYearPickerProps> = (
    {
        visible,
        onClose,
        onSelect,
        initialMonth = new Date().getMonth(),
        initialYear = new Date().getFullYear()
    }) => {
    const [selectedMonth, setSelectedMonth] = useState(initialMonth);
    const [selectedYear, setSelectedYear] = useState(initialYear);

    const handleConfirm = () => {
        onSelect(selectedMonth, selectedYear);
        onClose();
    };

    return (
        <Modal animationType="slide" transparent visible={visible} onRequestClose={onClose}>
            <View style={styles.modalBackground}>
                <View style={styles.modalContent}>
                    <Text style={styles.title}>Выберите месяц и год</Text>

                    <View style={styles.pickersRow}>
                        <View style={styles.pickerContainer}>
                            <Text style={styles.label}>Месяц</Text>
                            <Picker
                                selectedValue={selectedMonth}
                                style={styles.picker}
                                onValueChange={(value) => setSelectedMonth(value)}
                            >
                                {months.map((month, index) => (
                                    <Picker.Item key={index} label={month} value={index}/>
                                ))}
                            </Picker>
                        </View>

                        <View style={styles.pickerContainer}>
                            <Text style={styles.label}>Год</Text>
                            <Picker
                                selectedValue={selectedYear}
                                style={styles.picker}
                                onValueChange={(value) => setSelectedYear(value)}
                            >
                                {years.map((year) => (
                                    <Picker.Item key={year} label={year.toString()} value={year}/>
                                ))}
                            </Picker>
                        </View>
                    </View>

                    <View style={styles.buttonsRow}>
                        <Button title="Отмена" onPress={onClose}/>
                        <Button title="Выбрать" onPress={handleConfirm}/>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

export const formatMonthYear = (month: number, year: number) => {
    return `${months[month]} ${year}`;
};

const styles = StyleSheet.create({
    modalBackground: {
        flex: 1,
        justifyContent: 'center',
        backgroundColor: '#00000088',
    },
    modalContent: {
        backgroundColor: 'white',
        margin: 20,
        padding: 16,
        borderRadius: 10,
        elevation: 10,
    },
    title: {
        fontSize: 18,
        textAlign: 'center',
        marginBottom: 12,
    },
    pickersRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    pickerContainer: {
        flex: 1,
        marginHorizontal: 5,
    },
    label: {
        textAlign: 'center',
        marginBottom: 4,
    },
    picker: {
        height: 150,
        width: '100%',
        backgroundColor: '#000',
        borderRadius: 8
    },
    buttonsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 12,
    },
});
