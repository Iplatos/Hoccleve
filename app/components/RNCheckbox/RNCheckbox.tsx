import React, {FC, useRef} from 'react';
import {
    Text,
    View,
    StyleSheet,
    Animated,
    TextStyle,
    ViewStyle,
    Pressable, TouchableOpacity,
} from 'react-native';

import {Colors} from "../../constants/Colors.ts";
import CheckedIcon from "../../assets/icons/CheckedIcon.tsx";

interface RNCheckboxProps {
    text?: string;
    onPress?: () => void;
    isChecked?: boolean;
    containerStyle?: ViewStyle;
    textStyle?: TextStyle;
    checkboxStyle?: any;
}

export const RNCheckbox: FC<RNCheckboxProps> = (
    {
        text,
        onPress,
        isChecked,
        containerStyle,
        textStyle,
        checkboxStyle,
    }) => {
    const animatedWidth = useRef(new Animated.Value(0)).current;

    const startAnimation = () => {
        const toValue = isChecked ? 30 : 0;
        Animated.timing(animatedWidth, {
            toValue,
            duration: 500,
            useNativeDriver: false,
        }).start();
    };

    return (
        <TouchableOpacity
            style={[styles.container, containerStyle]}
            onPress={() => {
                startAnimation();
                onPress?.();
            }}
        >
            <View
                style={[
                    styles.checkbox,
                    isChecked && styles.checkboxSelected,
                    checkboxStyle,
                ]}
            >
                <Animated.View style={{width: animatedWidth}}>
                    {isChecked && <CheckedIcon height={18} width={18}/>}
                </Animated.View>
            </View>
            {text && <Text style={[styles.checkboxText, textStyle]}>{text}</Text>}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
    },
    checkbox: {
        width: 24,
        height: 24,
        borderWidth: 1,
        borderRadius: 4,
        justifyContent: 'center',
        // alignItems: 'center',
    },
    checkboxSelected: {
        backgroundColor: Colors.backgroundPurple,
    },
    checkboxText: {
        marginLeft: 8,
    },
});
