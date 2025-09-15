import React, {useRef} from 'react';
import {Text, View} from "react-native";
import LottieView from "lottie-react-native";

export const JournalScreen = () => {
    const animation = useRef<LottieView>(null);

    return (
        <View style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
        }}>
            <LottieView
                autoPlay
                ref={animation}
                style={{
                    width: 300,
                    height: 300,
                    //  backgroundColor: '#eee',
                }}
                source={require('../assets/inDevelopment.json')}
            />
            <Text style={{
                fontSize: 20,

            }}>Страница в разработке</Text>
        </View>
    );
};

