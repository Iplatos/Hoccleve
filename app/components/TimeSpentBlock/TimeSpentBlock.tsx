import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import {formatTime} from "../../settings/utils.ts";

type Props = {
    timeSpent: number;
    isTimedTask: boolean;
};

export const TimeSpentBlock: React.FC<Props> = ({ timeSpent, isTimedTask }) => {
    if (!isTimedTask || timeSpent == null) return null;

    return (
        <View style={styles.container}>
            <View style={styles.block}>
                <Text style={styles.label}>Потрачено время</Text>
            </View>
            <View style={styles.block}>
                <Text style={styles.time}>{formatTime(timeSpent)}</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        gap: 10,
        marginTop: 10,
    },
    block: {
        backgroundColor: '#fff',
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 8,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
        elevation: 3,
    },
    label: {
        fontWeight: '500',
        fontSize: 14,
    },
    time: {
        fontWeight: 'bold',
        fontSize: 14,
    },
});
