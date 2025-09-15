import React from 'react';
import {View, Text, StyleSheet, ActivityIndicator} from 'react-native';
import {useAppSelector} from "../../redux/hooks.ts";
import {Colors} from "../../constants/Colors.ts";
import {LinearGradient} from "expo-linear-gradient";
import {RFValue} from "react-native-responsive-fontsize";
import RatingTabIcon from "../../assets/img/RatingTabIcon.tsx";

export const UserLevel: React.FC = () => {
    const settings = useAppSelector((state) => state.settings.data);

    const user = useAppSelector((state) => state.user.user);
    const status = useAppSelector((state) => state.user.status);
    const isShowRating = settings?.find(el => el.key === 'isShowRating')?.value === '0'

    if (isShowRating) {
        return <></>
    }

    if (status === 'loading') {
        return (
            <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
                <ActivityIndicator/>
            </View>

        );
    }

    const pulses = user?.pulses || 0;
    const level = Math.floor(pulses / 100) + 1; // Уровень пользователя
    const progressWidth = pulses % 100; // Ширина прогресс-бара в процентах (от 0 до 100)
    const levelText = level >= 2 ? 'Падаван' : 'Новичок'

    return (
        <LinearGradient colors={['#f5f4f8', '#f5f4f8', '#f5f4f8']} style={styles.container}>
            <Text style={styles.title}>{levelText}</Text>
            <View style={{flexDirection:'row', alignItems: 'center', gap: 15, marginBottom: 8 }}>
                <Text style={styles.level}>{level} уровень</Text>
                <RatingTabIcon width={23} height={23} fill={Colors.yellow}/>
            </View>
            <View style={styles.progressBar}>
                <View style={[styles.progress, {width: `${progressWidth}%`}]}/>
            </View>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 12,
        borderRadius: 12,
        flex: 1
    },
    title: {
        color: Colors.textGray,
        fontSize: RFValue(12, 680),
        flex: 1
    },
    level: {
        color: Colors.darkBlue,
        fontSize: RFValue(15, 680),
        fontWeight: 'semibold',
    },
    progressBar: {
        height: 4,
        backgroundColor: Colors.backgroundCard,
        borderRadius: 2,
    },
    progress: {
        height: 4,
        backgroundColor: Colors.yellow,
        borderRadius: 2,
    },
});


