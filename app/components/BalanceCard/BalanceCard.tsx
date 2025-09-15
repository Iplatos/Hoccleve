import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {LinearGradient} from "expo-linear-gradient";
import {Colors} from "../../constants/Colors.ts";
import CurrencyIcon from "../../assets/icons/Сurrency-icon.tsx";
import {useAppSelector} from "../../redux/hooks.ts";


export const BalanceCard = () => {
    const user = useAppSelector(state => state.user.user)

    return (
        <LinearGradient colors={['#fff', 'rgba(248, 236, 255, 0)', '#f2d9ff',]} style={styles.container}>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <View style={styles.iconContainer}>
                    <CurrencyIcon/>
                </View>
                <View style={styles.balanceInfo}>
                    <Text style={styles.balanceLabel}>Баланс</Text>
                    <Text style={styles.balanceValue}>{user?.balance}₽</Text>
                </View>
            </View>
            <View style={styles.additionalBalances}>
                <Text style={styles.additionalBalance}>{user?.balance_euro} €</Text>
                <Text style={styles.additionalBalance}>{user?.balance_dollar} $</Text>
            </View>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        borderRadius: 12,
        paddingVertical: 12,
        paddingHorizontal: 15,
        borderWidth: 1,
        borderColor: Colors.colorLightStroke,
        gap: 40,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F5F5F5',

    },

    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: Colors.white,
        justifyContent: 'center',
        alignItems: 'center',
    },
    icon: {
        width: 20,
        height: 20,
    },
    balanceInfo: {
        //  flex: 1,
        marginLeft: 16,
    },
    balanceLabel: {
        fontSize: 12,
        color: '#AAAAAA',
    },
    balanceValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#000000',
    },
    additionalBalances: {
        alignItems: 'flex-end',
    },
    additionalBalance: {
        fontSize: 16,
        color: '#AAAAAA',
    },
});

