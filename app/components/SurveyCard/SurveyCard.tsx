import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import Toast from "react-native-toast-message";

interface SurveyCardProps {
    title: string;
    description: string;
    isSurveyRequired: boolean;
    onPress: () => void;
}

export const SurveyCard: React.FC<SurveyCardProps> = ({title, description, isSurveyRequired, onPress}) => {

    return (
        <View style={styles.card}>
            <View style={styles.header}>
                <Text style={styles.headerText}>Опрос</Text>
                {isSurveyRequired &&
                    <TouchableOpacity
                        onPress={() => {
                            Toast.show({
                                type: 'info',
                                text1: 'Обязательный опрос',
                                position: 'bottom',
                                bottomOffset: 50,
                            });
                        }}
                        style={styles.alert}>
                        <Text style={styles.alertText}>!</Text>
                    </TouchableOpacity>}
            </View>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.description}>{description}</Text>
            <TouchableOpacity style={styles.button} onPress={onPress}>
                <Text style={styles.buttonText}>Пройти опрос</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#f8f8f8',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#e2d4e9',
        padding: 16,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    headerText: {
        color: 'gray',
        fontSize: 14,
    },
    alert: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#ff6b6b',
        justifyContent: 'center',
        alignItems: 'center',
    },
    alertText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    description: {
        fontSize: 16,
        color: '#444',
        marginBottom: 16,
    },
    button: {
        backgroundColor: '#f1e6f6',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 10,
        alignSelf: 'flex-end',
    },
    buttonText: {
        fontSize: 16,
        color: 'black',
        fontWeight: 'bold',
    },
});

