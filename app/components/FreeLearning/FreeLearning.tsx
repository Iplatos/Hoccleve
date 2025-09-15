import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity, ToastAndroid, Platform, Alert} from 'react-native';
import {Colors} from "../../constants/Colors.ts";
import * as Clipboard from 'expo-clipboard';
import {LinearGradient} from "expo-linear-gradient";
import {RFValue} from "react-native-responsive-fontsize";
import PlayIcon from "../../assets/img/PlayIcon.tsx";
import CopyIcon from "../../assets/img/CopyIcon.tsx";
import {useAppSelector} from "../../redux/hooks.ts";

export const FreeLearning: React.FC = () => {
    const settings = useAppSelector((state) => state.settings.data);
    const user = useAppSelector((state) => state.user.user);

    const isShowReferral = settings?.find(el => el.key === 'isShowReferral');

    const copyToClipboard = () => {
        if (user?.promo_code) {
            Clipboard.setString(user.promo_code);
            if (Platform.OS === 'android') {
                ToastAndroid.show('Код скопирован', ToastAndroid.SHORT);
            } else if (Platform.OS === 'ios') {
                Alert.alert('Копирование', 'Код успешно скопирован в буфер обмена');
            }
        }
    };

    if (isShowReferral?.value === '0' || !isShowReferral) {
        return null;
    }

    return (
        <LinearGradient colors={['#f5f4f8', '#f5f4f8', '#f5f4f8']} style={styles.container}>
            <Text style={styles.title}>Учись бесплатно!</Text>
            <TouchableOpacity onPress={copyToClipboard} style={styles.codeContainer}>
                <Text style={styles.code}>{user?.promo_code}</Text>
                <CopyIcon />
            </TouchableOpacity>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        borderRadius: 8,
    },
    title: {
        color: Colors.darkBlue,
        fontSize: RFValue(12, 680),
        fontWeight: 'semibold',
        flex: 1
    },
    codeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: Colors.white,
        paddingVertical: 2,
        paddingHorizontal: 8,
        borderRadius: 4
    },
    code: {
        fontSize: RFValue(12, 680),
        fontWeight: 'semibold',
        color: Colors.darkBlue,
    },
});

