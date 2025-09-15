import React, {useEffect, useMemo, useState} from 'react';
import {View, Text, TouchableOpacity, Image, ScrollView, useWindowDimensions, StyleSheet} from 'react-native';
import {Basket, Task} from "../../redux/slises/homeWorkDetailSlice.ts";
import {GlobalStyle} from "../../constants/GlobalStyle.ts";
import HTML from "react-native-render-html";
import {convertJsonToHtml, renderFile} from "../../settings/helpers.tsx";
import {TaskHeader} from "../TaskHeader/TaskHeader.tsx";
import {ResultType} from "../../redux/slises/answerSlice.ts";
import {Colors} from "../../constants/Colors.ts";
import {FileData} from "../../redux/slises/probeWorkSlice.ts";
import {SendAnswerComponent} from "../SendAnswerComponent/SendAnswerComponent.tsx";
import {CorrectAnswersBasketBlock} from "./components/CorrectAnswersBasketBlock.tsx";

export type AnswerOption = {
    id: string;
    type: 'text' | 'img';
    text: any; // содержимое текста, если есть
    img: string | null;
    basket_id: string;
};


interface Props {
    task: Task;
    url: string;
    index: number;
    result: ResultType;
    resultText: string,
    buttonSendText: string,
    correctAnswerHtml: string,
    showHintCondition: boolean,
    showCorrectAnswer: boolean,
    showInput: boolean,
    handleSubmit: (option: string, taskId?: string) => void
}

const MemoizedRenderHtml = React.memo(HTML);

export const BasketSortTask: React.FC<Props> = (
    {
        task,
        url,
        result,
        resultText,
        handleSubmit,
        correctAnswerHtml,
        showHintCondition,
        buttonSendText,
        showCorrectAnswer,
        index
    }) => {
    const [isLoading, setIsLoading] = useState(false);
    console.log('BasketSortTask',)
    const {width: contentWidth} = useWindowDimensions();

    const baskets = task?.baskets;
    const rawOptions = task?.answer_options;
    const memoizedHtml = useMemo(() => convertJsonToHtml(task.question), [task.question]);
    const [basketItems, setBasketItems] = useState<{ [key: string]: AnswerOption[] }>({});
    const correct_answer = task.correct_answer;

    const parsedCorrectAnswer = useMemo(() => {
        return correct_answer ? JSON.parse(correct_answer) : null;
    }, [correct_answer]);

    //  console.log('parsedCorrectAnswer', parsedCorrectAnswer)

    const showCorrectAnswer2 = buttonSendText === 'Ответ принят' && (resultText === 'Решено неверно' || resultText === 'Не верный ответ');

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

    useEffect(() => {
        if (baskets && answerOptions.length > 0) {
            const initial: { [key: string]: AnswerOption[] } = {};
            for (const basket of baskets) {
                initial[basket.id] = [];
            }
            setBasketItems(initial);
        }
    }, [baskets, answerOptions]);

    const [selectedId, setSelectedId] = useState<string | null>(null);

    useEffect(() => {
        if (showCorrectAnswer && parsedCorrectAnswer) {
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
    }, [showCorrectAnswer, parsedCorrectAnswer, answerOptions]);

    const unassignedItems = answerOptions?.filter(
        (opt) => !Object.values(basketItems).flat().some((o) => o.id === opt.id)
    );

    const handleItemPress = (id: string) => {
        setSelectedId(id === selectedId ? null : id);
    };

    const handleBasketPress = (basketId: string) => {
        if (showCorrectAnswer) return;
        if (!selectedId) return;

        const item = answerOptions.find((opt) => opt.id === selectedId);
        if (!item) return;

        setBasketItems((prev) => {
            const updated: { [key: string]: AnswerOption[] } = {};
            for (const key of Object.keys(prev)) {
                updated[key] = prev[key].filter((opt) => opt.id !== selectedId);
            }
            updated[basketId] = [...updated[basketId], item];
            return updated;
        });

        setSelectedId(null);
    };

    const renderOption = (opt: AnswerOption) => {
        const text = opt.text?.content?.[0]?.content?.[0]?.text;
        return (
            <TouchableOpacity
                key={opt.id}
                onPress={showCorrectAnswer ? undefined : () => handleItemPress(opt.id)}
                disabled={showCorrectAnswer}
                style={{
                    borderWidth: 1,
                    borderColor: selectedId === opt.id ? '#d0ebff' : '#fff',
                    borderRadius: 5,
                    paddingHorizontal: 10,
                    paddingVertical: 7,
                    margin: 4,
                    backgroundColor: selectedId === opt.id ? '#d0ebff' : '#fff',
                    opacity: showCorrectAnswer ? 0.6 : 1,
                }}
            >
                {opt.type === 'text' && <Text>{text}</Text>}
                {opt.type === 'img' && opt.img && (
                    <Image source={{uri: `${url}${opt.img}`}} style={{width: 60, height: 60}}/>
                )}
            </TouchableOpacity>
        );
    };

    const handleUnassign = () => {
        if (showCorrectAnswer) return;
        if (!selectedId) return;

        setBasketItems((prev) => {
            const updated: { [key: string]: AnswerOption[] } = {};
            for (const key of Object.keys(prev)) {
                updated[key] = prev[key].filter((opt) => opt.id !== selectedId);
            }
            return updated;
        });

        setSelectedId(null);
    };

    const onSubmit = async () => {
        setIsLoading(true);

        // преобразуем данные в нужный формат
        const formattedAnswer: { [key: string]: string[] } = {};
        for (const basketId of Object.keys(basketItems)) {
            formattedAnswer[basketId] = basketItems[basketId].map(item => item.id);
        }
        console.log(formattedAnswer)

        try {
            await handleSubmit(JSON.stringify(formattedAnswer));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <View style={GlobalStyle.taskContainer}>
            <TaskHeader
                taskId={task.id}
                index={index}
                result={result}
                resultText={resultText}
            />

            {task.homeTaskFiles.map((el: FileData) => (
                <View key={el.id}>
                    {renderFile(el)}
                </View>
            ))}

            <MemoizedRenderHtml
                baseStyle={GlobalStyle.taskQuestion}
                source={{html: memoizedHtml}}
                contentWidth={contentWidth}
            />

            <TouchableOpacity
                onPress={showCorrectAnswer ? undefined : handleUnassign}
                disabled={showCorrectAnswer}
                style={[styles.optionsBlock, showCorrectAnswer && {opacity: 0.6}]}
            >
                <Text style={styles.title}>Распредели слова по группам</Text>
                <View style={{flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center'}}>
                    {unassignedItems.map(renderOption)}
                </View>
            </TouchableOpacity>

            {baskets?.map((basket) => (
                <TouchableOpacity
                    key={basket.id}
                    style={styles.basketsBlock}
                    onPress={showCorrectAnswer ? undefined : () => handleBasketPress(basket.id)}
                    disabled={showCorrectAnswer}
                >
                    <View>
                        {/*<TouchableOpacity*/}
                        {/*    onPress={showCorrectAnswer ? undefined : () => handleBasketPress(basket.id)}*/}
                        {/*    disabled={showCorrectAnswer}*/}
                        {/*>*/}
                        <Text style={styles.basketItem}>{basket.name}</Text>
                        {/*</TouchableOpacity>*/}
                        <View style={{flexDirection: 'row', flexWrap: 'wrap'}}>
                            {basketItems[basket.id]?.map(renderOption)}
                        </View>
                    </View>
                </TouchableOpacity>
            ))}

            <SendAnswerComponent
                loading={isLoading}
                buttonTitle={buttonSendText}
                showInput={false}
                hint={task?.prompt!}
                handleSubmit={onSubmit}
                showHintCondition={showHintCondition}
                taskId={task?.id}
                correctAnswerHtml={correctAnswerHtml}
                showCorrectAnswer={showCorrectAnswer2}
            />

            {
                showCorrectAnswer && <CorrectAnswersBasketBlock
                    baskets={baskets!}
                    correctAnswer={parsedCorrectAnswer}
                    answerOptions={answerOptions}
                    renderOption={renderOption}
                />
            }

        </View>
    );
};



const styles = StyleSheet.create({
    optionsBlock: {
        backgroundColor: Colors.backgroundCard,
        borderRadius: 10,
        paddingVertical: 10
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

})