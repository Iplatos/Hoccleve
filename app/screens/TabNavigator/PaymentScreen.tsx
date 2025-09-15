import React, {useEffect, useRef, useState} from 'react';
import {Linking, Text, TouchableOpacity, View} from "react-native";
import LottieView from "lottie-react-native";
import {getUrl} from "../../settings/utils.ts";

export const PaymentScreen = () => {

    const animation = useRef<LottieView>(null);
    const [url, setUrlState] = useState<string | null>(null);

    const cleanedUrl = url?.replace(/\b(?:backend|api|back)\./gi, '');

    useEffect(() => {
        const fetchUrl = async () => {
            const value = await getUrl();
            setUrlState(value);
        };

        fetchUrl();
    }, []);

    const handleOpenPaymentPage = () => {
        Linking.openURL(`${cleanedUrl}/payment`);
    };

    return (
        <View style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: 20
        }}>
            <LottieView
                autoPlay
                ref={animation}
                style={{
                    width: 300,
                    height: 300,
                }}
                source={require('../../assets/inDevelopment.json')}
            />
            <Text style={{
                fontSize: 20,
                textAlign: "center",
                marginBottom: 20,
            }}>
                Оплатить обучение Вы можете в веб-версии платформы.
            </Text>

            <TouchableOpacity
                onPress={handleOpenPaymentPage}
                style={{
                    backgroundColor: '#4CAF50',
                    paddingVertical: 12,
                    paddingHorizontal: 24,
                    borderRadius: 10,
                }}
            >
                <Text style={{ color: 'white', fontSize: 16 }}>Перейти к оплате</Text>
            </TouchableOpacity>
        </View>
    );
};


