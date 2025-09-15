import React, { useState } from 'react';
import {Modal, View, Text, TouchableOpacity, StyleSheet, FlatList, Dimensions} from 'react-native';
import {Colors} from "../../constants/Colors.ts";

type Option = {
    label: string;
    value: string;
};

type Props = {
    selectedValue: string;
    onValueChange: (value: string) => void;
    options: Option[];
    label?: string
    disabled?: boolean
};

export const CustomPicker = ({ selectedValue, onValueChange, options, label, disabled = false }: Props) => {
    const [modalVisible, setModalVisible] = useState(false);

    const currentLabel =
        options.find(opt => opt.value === selectedValue)?.label ||
        label ||
        'Выберите действие';

    return (
        <>
            <TouchableOpacity
                disabled={disabled}
                style={[styles.pickerButton, disabled && {opacity: 0.5}]}
                onPress={() => setModalVisible(true)}
            >
                <Text style={styles.pickerButtonText}>{currentLabel}</Text>
            </TouchableOpacity>

            <Modal transparent={true} visible={modalVisible} animationType="fade">
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPressOut={() => setModalVisible(false)}
                >
                    <View style={styles.modalContent}>
                        {options.length === 0 ? (
                            <Text style={styles.noDataText}>Нет данных</Text>
                        ) : (
                            <FlatList
                                data={options}
                                keyExtractor={item => item.value}
                                renderItem={({ item }) => (
                                    <TouchableOpacity

                                        style={[styles.option, ]}
                                        onPress={() => {
                                            onValueChange(item.value);
                                            setModalVisible(false);
                                        }}
                                    >
                                        <Text style={styles.optionText}>{item.label}</Text>
                                    </TouchableOpacity>
                                )}
                            />
                        )}
                    </View>
                </TouchableOpacity>
            </Modal>
        </>
    );
};

const styles = StyleSheet.create({
    pickerButton: {
        padding: 14,
        backgroundColor: '#f0f0f0',
        borderRadius: 6,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#dddce3',
    },
    pickerButtonText: {
        fontSize: 16,
        color: '#333',
    },
    noDataText: {
        textAlign: 'center',
        fontSize: 16,
        color: '#000',
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
        paddingHorizontal: 30,
    },
    modalContent: {
        backgroundColor: '#fff',
        borderRadius: 8,
        paddingVertical: 10,
    },
    option: {
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    optionText: {
        fontSize: 14,
        color: '#333',
    },
});
