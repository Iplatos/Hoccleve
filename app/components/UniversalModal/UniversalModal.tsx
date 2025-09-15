import React from 'react';
import {
    Modal,
    Pressable,
    Text,
    TouchableOpacity,
    View,
    StyleSheet,
} from 'react-native';
import {Colors} from "../../constants/Colors.ts";

interface UniversalModalProps {
    visible: boolean;
    onClose: () => void;
    onConfirm?: () => void;
    confirmText?: string;
    cancelText?: string;
    title?: string;
}

export const UniversalModal: React.FC<UniversalModalProps> = (
    {
        visible,
        onClose,
        onConfirm,
        confirmText = 'Да',
        cancelText = 'Отмена',
        title = 'Вы уверены?',
    }) => {
    return (
        <Modal
            visible={visible}
            onDismiss={onClose}
            animationType="fade"
            transparent
            onRequestClose={onClose}
        >
            <Pressable style={styles.overlay} onPress={onClose}>
                <View style={styles.wrapper}>
                    <View style={styles.container}>
                        <Text style={styles.text}>{title}</Text>
                        <View style={styles.buttonRow}>
                            {onConfirm && (
                                <TouchableOpacity onPress={onConfirm} style={styles.confirmButton}>
                                    <Text style={styles.confirmText}>{confirmText}</Text>
                                </TouchableOpacity>
                            )}
                            <TouchableOpacity onPress={onClose} style={styles.cancelButton}>
                                <Text style={styles.cancelText}>{cancelText}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Pressable>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: '#00000088',
        justifyContent: 'center',
        alignItems: 'center',
    },
    wrapper: {
        width: '70%',
    },
    container: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 20,
    },
    text: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 20,
        color: Colors.colorBlack,
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 20
    },
    confirmButton: {
        backgroundColor: Colors.colorAccentFirst,
        borderRadius: 8,
        paddingVertical: 10,
        paddingHorizontal: 20,
    },
    cancelButton: {
        backgroundColor: Colors.colorGray,
        borderRadius: 8,
        paddingVertical: 10,
        paddingHorizontal: 20,
    },
    confirmText: {
        color: Colors.white,
        fontWeight: '600',
    },
    cancelText: {
        color: Colors.white,
    },
});
