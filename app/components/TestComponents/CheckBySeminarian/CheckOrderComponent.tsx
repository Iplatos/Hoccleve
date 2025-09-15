import React from 'react';
import {GlobalStyle} from "../../../constants/GlobalStyle.ts";
import {FlatList, StyleSheet, Text, TextInput, View} from "react-native";
import {Task} from "../../../redux/slises/homeworkSlice.ts";
import {FileData} from "../../../redux/slises/probeWorkSlice.ts";
import {convertJsonToHtml, renderFile} from "../../../settings/helpers.tsx";
import HTML from "react-native-render-html";
import {Colors} from "../../../constants/Colors.ts";

type Props = {
    task: Task;
    index: number
}
export const CheckOrderComponent = ({task,index}: Props) => {
    const parsedQuestion = JSON.parse(task.question); // Парсим JSON

    const listItems = parsedQuestion?.content.find((item: any) => item.type === 'orderedList')?.content; // Извлекаем список


    return (
        <View style={GlobalStyle.taskContainer}>
            <Text style={{color: Colors.colorGray}}>Задача {index + 1}</Text>

            {/* Отображение картинки или аудио */}
            {task?.homeTaskFiles?.map((el: FileData) => (renderFile(el)))}

            <HTML
                baseStyle={{paddingBottom: 0, fontSize: 16, marginBottom: 10}}
                source={{html: convertJsonToHtml(task.question)}}
                contentWidth={300}
            />
            {/* Список утверждений */}
            <FlatList
                data={listItems}
                style={{marginBottom: 15}}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({item, index}) => (
                    <Text style={styles.questionItem}>{index + 1}. {item.content[0].content[0].text}</Text>
                )}
            />
            <TextInput
                style={GlobalStyle.taskInput}
                placeholder="Напишите ответ"
                placeholderTextColor={Colors.textGray}
                editable={false}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    questionItem: {
        fontSize: 16,
        marginBottom: 5,
        color: '#333',
    }

});
