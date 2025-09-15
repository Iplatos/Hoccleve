import React from 'react';
import {StyleSheet} from "react-native";
import {Colors} from "../constants/Colors.ts";

//     НЕ ИСПОЛЬЗУЕТСЯ    /////

export const RepeatHomeWorkScreen = () => {

    // const navigation = useNavigation();
    // const {homeWork, loading, error} = useAppSelector(state => state.homeworkDetail);
    //
    // const [attempts, setAttempts] = useState(1); // Начальное значение по умолчанию
    // const [buttonSendText, setButtonSendText] = useState('Ответить');
    // const {result} = useAppSelector((state) => state.answerPost);
    //
    // const getButtonText = (task) => {
    //     let buttonText = ''
    //
    //     const correct_answer = homeWork?.homeWorkResults.find(el => el.task_id === task.task.id)
    //
    //     console.log(correct_answer)
    //
    //     // Проверяем, если результат уже решен
    //     if (result[task.task.id]?.decided || correct_answer?.decided_right === 1) {
    //         buttonText = 'Ответ принят';
    //         setAttempts(1); // Обновляем количество попыток
    //     } else if ((correct_answer?.attempt === 2 && correct_answer?.score === 0) || attempts === 2) {
    //         // Первая попытка, ответ неверный
    //         buttonText = 'Ответить еще раз';
    //     } else if ((correct_answer?.attempt === 1 && correct_answer?.score === 0) || attempts === 1) {
    //         // Вторая попытка или правильный ответ
    //         buttonText = 'Ответ принят';
    //     } else if ((correct_answer?.attempt === 2 && correct_answer?.score === 0) || attempts === 1) {
    //         // Вторая попытка или правильный ответ
    //         buttonText = 'Ответ принят';
    //     } else {
    //         buttonText = 'Ответить';
    //     }
    //
    //
    //     return buttonText
    // }
    //
    // const openLink = (url: string) => {
    //     if (url) {
    //         Linking.openURL(url).catch(err => Alert.alert('Ошибка', `Не удалось открыть ссылку. Адрес ссылки: ${url}`));
    //     }
    // };
    //
    // const renderItem = ({item, index}) => {
    //     const buttonText= getButtonText(item)
    //     console.log(buttonText)
    //     switch (item.task.type) {
    //         case "test":
    //             return <TestComponent
    //                 task={item.task}
    //                 index={index + 1}
    //                 // handleSubmit={handleSubmit}
    //                 // resultText={resultText}
    //                 // buttonSendText={buttonSendText}
    //                 // showCorrectAnswer={showCorrectAnswer}
    //             />
    //         case "pass-words":
    //             return <PassWordsComponent
    //                 task={item.task}
    //                 index={index + 1}
    //                 // buttonSendText={buttonSendText}
    //                 // handleSubmit={handleSubmit}
    //
    //             />;
    //         case "match":
    //             return <MatchComponent
    //                 task={item.task}
    //                 index={index + 1}
    //                 // resultText={resultText}
    //                 // buttonSendText={buttonSendText}
    //                 // handleSubmit={handleSubmit}
    //
    //             />;
    //         case "detail-answer":
    //             return <RepeatDetailAnswerComponent
    //                 task={item.task}
    //                 index={index + 1}
    //                 // resultText={resultText}
    //                //  buttonSendText={buttonSendText}
    //                 // handleSubmit={handleSubmit}
    //             />;
    //         case "file-answer":
    //             return <FileAnswerComponent
    //                 task={item.task}
    //                 index={index + 1}
    //                 // handleSubmit={handleSubmit}
    //                 // resultText={resultText}
    //                 // buttonSendText={buttonSendText}
    //             />;
    //         case "order":
    //             return <OrderComponent
    //                 task={item.task}
    //                 index={index + 1}
    //                 // handleSubmit={handleSubmit}
    //                 //   resultText={resultText} удалил из пропсов
    //                 // showHintCondition={showHintCondition}
    //                 // showInput={showInput}
    //                 // buttonSendText={buttonSendText}
    //                 // correctAnswerHtml={correct_answerHtml}
    //                 // showCorrectAnswer={showCorrectAnswer}
    //             />;
    //         case "multiple-choice":
    //             return <MultipleChoiceComponent
    //                 task={item.task}
    //                 index={index + 1}
    //                 // handleSubmit={handleSubmit}
    //                 // showHintCondition={showHintCondition}
    //                 // showInput={showInput}
    //                 // buttonSendText={buttonSendText}
    //                 // showCorrectAnswer={showCorrectAnswer}
    //                 // correctAnswerHtml={correct_answerHtml}
    //             />;
    //         case "exact-answer":
    //             return <ExactAnswerComponent
    //                 task={item.task}
    //                 index={index + 1}
    //                 // handleSubmit={handleSubmit}
    //                 // //   resultText={resultText} удалил из пропсов
    //                 // showHintCondition={showHintCondition}
    //                 // showInput={showInput}
    //                 // buttonSendText={buttonSendText}
    //                 // correctAnswerHtml={correct_answerHtml}
    //                 // showCorrectAnswer={showCorrectAnswer}
    //
    //             />;
    //         default:
    //             return <Text>Неизвестный тип задания</Text>;
    //     }
    // };

    return (
        <>
        </>
        // <ScrollView style={styles.container}>
        //     <View style={styles.headerBlock}>
        //         <TouchableOpacity style={styles.btn} onPress={() => {
        //             // @ts-ignore
        //             navigation.navigate(ROUTES.HOME_WORK)
        //         }}>
        //             <Svg width="7" height="12" viewBox="0 0 7 12"
        //                  fill="none">
        //                 <Path fillRule="evenodd" clipRule="evenodd"
        //                       d="M0.21967 6.53033C-0.0732233 6.23744 -0.0732233 5.76256 0.21967 5.46967L5.21967 0.46967C5.51256 0.176777 5.98744 0.176777 6.28033 0.46967C6.57322 0.762563 6.57322 1.23744 6.28033 1.53033L1.81066 6L6.28033 10.4697C6.57322 10.7626 6.57322 11.2374 6.28033 11.5303C5.98744 11.8232 5.51256 11.8232 5.21967 11.5303L0.21967 6.53033Z"
        //                       fill="#2B2D3E">
        //
        //                 </Path>
        //             </Svg>
        //             <Text>Назад</Text>
        //         </TouchableOpacity>
        //         <Text style={[GlobalStyle.titleGL, {marginBottom: 0, flex: 1}]}>Домашняя работа</Text>
        //     </View>
        //     <LessonVideoPlayer
        //         videos={homeWork?.lesson?.lessonVideos}
        //         lessonName={homeWork?.lesson?.name}
        //     />
        //     <View style={{marginBottom: 20}}>
        //         {(homeWork?.lesson && homeWork?.lesson?.lessonMaterials.length > 0) && (
        //             <>
        //                 <Text style={styles.materialsTitle}>Полезные материалы:</Text>
        //                 <LessonMaterials materials={homeWork?.lesson.lessonMaterials}/>
        //             </>)}
        //         {homeWork?.lesson.lesson_file && <View style={{flex: 1}}>
        //             {homeWork?.lesson.lesson_file && (
        //                 <View style={{flex: 1}}>
        //                     <View style={{flex: 1}}>
        //                         <TouchableOpacity
        //                             onPress={() => {
        //                                 openLink(`${axios.defaults.baseURL}${homeWork.lesson.lesson_file}`)
        //                                 /* Обработчик открытия файла */
        //                             }}
        //                             style={styles.button}
        //                         >
        //                             <Text style={{}}>Материалы к уроку</Text>
        //                         </TouchableOpacity>
        //                     </View>
        //
        //                 </View>
        //             )}
        //         </View>}
        //
        //     </View>
        //     <ScormFile lesson={homeWork?.lesson}/>
        //     {
        //         homeWork?.only_content === 1
        //             ? <View style={styles.hintButton}>
        //                 <Text>Материал изучен</Text>
        //             </View>
        //             : <FlatList
        //                 data={homeWork?.lesson.lessonTasks}
        //                 renderItem={renderItem}
        //                 keyExtractor={(item) => item.id.toString()}
        //             />
        //     }
        // </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
        backgroundColor: Colors.white,
    },
    headerBlock: {
        flexDirection: 'row',
        gap: 30,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
        marginTop: 10
    },
    btn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        backgroundColor: Colors.bgCard,
        paddingVertical: 5,
        paddingHorizontal: 7,
        borderRadius: 8
    },
    materialsTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginVertical: 10,
    },
    button: {
        flexDirection: 'row',
        backgroundColor: '#f1e6f6',
        borderRadius: 10,
        //  alignItems: 'center',
        justifyContent: 'center',
        gap: 5,
        padding: 10
    },
    hintButton: {
        backgroundColor: '#fdc243',
        padding: 10,
        // width: '50%',
        borderRadius: 10,
        marginBottom: 10,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 5,
    },
    hintButtonText: {
        color: Colors.colorBlack,
        fontWeight: 'bold',
    },
})
