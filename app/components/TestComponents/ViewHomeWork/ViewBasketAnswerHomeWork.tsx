import React, {useEffect, useMemo, useState} from 'react';
import {GlobalStyle} from "../../../constants/GlobalStyle.ts";
import {Image, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import {Task} from '../../../redux/slises/homeWorkDetailSlice.ts';
import {Colors} from "../../../constants/Colors.ts";
import HTML from "react-native-render-html";
import {convertJsonToHtml, renderFile} from "../../../settings/helpers.tsx";
import {FileData} from "../../../redux/slises/probeWorkSlice.ts";
import {AnswerOption} from "../BasketSortTask.tsx";
import {useAppSelector} from "../../../redux/hooks.ts";
import {CorrectAnswersBasketBlock} from "../components/CorrectAnswersBasketBlock.tsx";

type Props = {
    task: Task;
    index: number
    url: string
}
export const ViewBasketAnswerHomeWork = (
    {
        task,
        index,
        url
    }: Props) => {
    console.log('ViewBasketAnswerHomeWork', index, task)
    const {homeWork} = useAppSelector(state => state.homeworkDetail);
    const userAnswerJson = homeWork?.homeWorkResults?.find(el => el.task_id === task.id)?.answer


    const userAnswer = userAnswerJson?.toString() && JSON.parse(userAnswerJson)

    const [selectedId, setSelectedId] = useState<string | null>(null);
    const correct_answer = task.correct_answer;
    const baskets = task?.baskets;
    const rawOptions = task?.answer_options;

    const [basketItems, setBasketItems] = useState<{ [key: string]: AnswerOption[] }>({});

    const answerOptions: AnswerOption[] = useMemo(() => {
        if (typeof rawOptions === 'string') {
            try {
                return JSON.parse(rawOptions);
            } catch (e) {
                console.warn('Invalid JSON in rawOptions');
                return [];
            }
        }
        return Array.isArray(rawOptions) ? rawOptions : [];
    }, [rawOptions]);

    const unassignedItems = answerOptions?.filter(
        (opt) => !Object.values(basketItems).flat().some((o) => o.id === opt.id)
    );

    const parsedCorrectAnswer = useMemo(() => {
        return correct_answer ? JSON.parse(correct_answer) : null;
    }, [correct_answer]);

    useEffect(() => {
        if (parsedCorrectAnswer) {
            const newBasketItems: { [key: string]: AnswerOption[] } = {};
            for (const basketId of Object.keys(parsedCorrectAnswer)) {
                const optionIds: string[] = parsedCorrectAnswer[basketId];
                newBasketItems[basketId] = answerOptions.filter(opt => optionIds.includes(opt.id));
            }

            // сравнение старого и нового состояния, чтобы избежать лишнего setState
            const isEqual = JSON.stringify(newBasketItems) === JSON.stringify(basketItems);
            if (!isEqual) {
                setBasketItems(newBasketItems);
                setSelectedId(null);
            }
        }
    }, [parsedCorrectAnswer, answerOptions]);

    const renderOption = (opt: AnswerOption) => {
        const text = opt.text?.content?.[0]?.content?.[0]?.text;
        return (
            <TouchableOpacity
                key={opt.id}
             //   onPress={showCorrectAnswer ? undefined : () => handleItemPress(opt.id)}
                disabled={true}
                style={{
                    borderWidth: 1,
                    borderColor: selectedId === opt.id ? '#d0ebff' : '#fff',
                    borderRadius: 5,
                    paddingHorizontal: 10,
                    paddingVertical: 7,
                    margin: 4,
                    backgroundColor: selectedId === opt.id ? '#d0ebff' : '#fff',
                    opacity:  1 ,
                }}
            >
                {opt.type === 'text' && <Text>{text}</Text>}
                {opt.type === 'img' && opt.img && (
                    <Image source={{uri: `${url}${opt.img}`}} style={{width: 60, height: 60}}/>
                )}
            </TouchableOpacity>
        );
    };

    const userBasketItems: { [key: string]: AnswerOption[] } = useMemo(() => {
        if (!userAnswer || typeof userAnswer !== 'object') return {};

        const result: { [key: string]: AnswerOption[] } = {};
        Object.keys(userAnswer).forEach(basketId => {
            const ids: string[] = userAnswer[basketId];
            result[basketId] = answerOptions.filter(opt => ids.includes(opt.id));
        });
        return result;
    }, [userAnswer, answerOptions]);


    return (
        <View style={GlobalStyle.taskContainer}>
            <Text style={{color: Colors.colorGray, marginBottom: 10}}>Задача {index}</Text>
            <View style={styles.section}>
                <HTML
                    baseStyle={{paddingBottom: 0, fontSize: 16, marginBottom: 10}}
                    source={{html: convertJsonToHtml(task.question)}}
                    contentWidth={300}
                />

            </View>

            {task?.homeTaskFiles?.map((el: FileData) => (
                <View key={el.id}>
                    {renderFile(el)}
                </View>
            ))}

            <TouchableOpacity
             //   onPress={showCorrectAnswer ? undefined : handleUnassign}
                disabled={true}
                style={[styles.optionsBlock, {opacity: 0.6}]}
            >
                <Text style={styles.title}>Распредели слова по группам</Text>
                <View style={{flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center'}}>
                    {unassignedItems.map(renderOption)}
                </View>
            </TouchableOpacity>
            {baskets?.map((basket) => (
                <TouchableOpacity
                    key={basket.id}
                    style={[styles.basketsBlock, {opacity: 1}]}
                    disabled={true}
                >
                    <Text style={styles.basketItem}>{basket.name}</Text>
                    <View style={{flexDirection: 'row', flexWrap: 'wrap'}}>
                        {userBasketItems[basket.id]?.map(renderOption)}
                    </View>
                </TouchableOpacity>
            ))}

            <CorrectAnswersBasketBlock
                baskets={baskets!}
                correctAnswer={parsedCorrectAnswer}
                answerOptions={answerOptions}
                renderOption={renderOption}
            />
        </View>
    );
};


const styles = StyleSheet.create({
    optionsBlock: {
        backgroundColor: Colors.backgroundCard,
        borderRadius: 10,
        paddingVertical: 10
    },
    section: {
        marginBottom: 10,
    },
    title: {
        color: Colors.colorBlack,
        fontSize: 16,
        fontWeight: 'bold',
        marginVertical: 8
    },
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

});
