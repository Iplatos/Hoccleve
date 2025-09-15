import React, { useRef, useState, useEffect } from 'react';
import { TextInput, Text, View, StyleSheet } from 'react-native';
import {Colors} from "../../../constants/Colors.ts";

interface DynamicInputProps {
    value: string;
    onInput: (text: string) => void;
}

export const DynamicInput: React.FC<DynamicInputProps> = ({ value, onInput }) => {
    const [inputWidth, setInputWidth] = useState(20);
    const textRef = useRef<Text>(null);

    useEffect(() => {
        if (textRef.current) {
            textRef.current.measure((x, y, width) => {
                setInputWidth(width + 10);
            });
        }
    }, [value]);

    return (
        <View style={styles.wrapper}>
            <Text
                ref={textRef}
                style={styles.hiddenText}
                numberOfLines={1}
            >
                {value || ' '}
            </Text>

            <TextInput
                style={[styles.input, { width: inputWidth }]}
                value={value}
                placeholderTextColor={Colors.textGray}
                onChangeText={onInput}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    wrapper: {
        position: 'relative',
    },
    hiddenText: {
        position: 'absolute',
        opacity: 0,
        fontSize: 16,
    },
    input: {
        fontSize: 16,
        padding: 0,
        minWidth: 20,
        borderBottomWidth: 1,
        borderColor: '#ccc',
    },
});
