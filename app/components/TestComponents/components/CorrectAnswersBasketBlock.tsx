import {Basket} from "../../../redux/slises/homeWorkDetailSlice.ts";
import React from "react";
import {StyleSheet, Text, View} from "react-native";
import {Colors} from "../../../constants/Colors.ts";
import {AnswerOption} from "../BasketSortTask.tsx";

interface BasketBlockProps {
    baskets: Basket[];
    correctAnswer: Record<string, string[]>;
    answerOptions: AnswerOption[];
    renderOption: (opt: AnswerOption) => React.ReactNode;
}

export const CorrectAnswersBasketBlock = (
    {
        baskets,
        correctAnswer,
        answerOptions,
        renderOption,
    }: BasketBlockProps) => {
    return (
        <View style={{marginTop: 20}}>
            <View
                style={{
                    backgroundColor: Colors.colorAccentRGB,
                    padding: 10,
                    borderRadius: 8,
                    marginVertical: 10
                }}
            >
                <Text style={{color: Colors.colorWhite, fontSize: 16}}>
                    Правильные ответы
                </Text>
            </View>
            {baskets.map((basket) => {
                const correctIds = correctAnswer?.[basket.id];
                if (!correctIds) return null;

                const correctOptions = answerOptions.filter(opt =>
                    correctIds.map(String).includes(opt.id)
                );

                return (
                    <View key={basket.id} style={styles.basketsBlock}>
                        <Text style={styles.basketItem}>{basket.name}</Text>
                        <View style={{flexDirection: 'row', flexWrap: 'wrap'}}>
                            {correctOptions.map((opt) => (
                                <View key={opt.id} style={{flexDirection: 'column'}}>
                                    {renderOption(opt)}
                                </View>
                            ))}
                        </View>
                    </View>
                );
            })}
        </View>
    );
};

const styles = StyleSheet.create({

    basketsBlock: {
        //  marginTop: 16,
        marginBottom: 15,
        padding: 10,
        borderRadius: 10,
        backgroundColor: '#f8f0ff',
    },
    basketItem: {
        fontSize: 16,
        fontWeight: '600'
    }

})