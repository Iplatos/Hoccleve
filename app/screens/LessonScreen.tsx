import React, {useEffect, useMemo, useState} from 'react';
import {
    ActivityIndicator,
    Alert,
    Linking,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import {useAppDispatch, useAppSelector, useFileUpload} from "../redux/hooks.ts";
import axios from "axios";
import {LessonMaterials} from "../components/LessonMaterials/LessonMaterials.tsx";
import {Colors} from "../constants/Colors.ts";
import {CoursesHeader} from "../components/CoursesHeader/CoursesHeader.tsx";
import {LessonNavigation} from "../components/LessonNavigation/LessonNavigation.tsx";
import {LessonDescription} from "../components/LessonDescription/LessonDescription.tsx";
import {LessonVideoPlayer} from "../components/LessonVideoPlayer/LessonVideoPlayer.tsx";

import {fetchHomeWork} from "../redux/slises/homeWorkDetailSlice.ts";
import {ROUTES} from "../constants/Routes.ts";
import {useNavigation} from "@react-navigation/native";
import {ScormFile} from "../components/ScormFile/ScormFile.tsx";
import {uploadAbstract} from "../redux/slises/uploadAbstractSlice.ts";
import Toast from "react-native-toast-message";
import {toastConfig} from "../settings/ToastHelper.tsx";
import {HomeWorkRequest, setHomeWork} from "../redux/slises/createHomeWorkSlice.ts";
import {useAuth} from "../context/AuthContext.tsx";
import {AnimatedButtonNextLesson} from "../components/AnimatedButtonNextLesson/AnimatedButtonNextLesson.tsx";
import {LessonBnnottomNavigation} from "../components/LessonBottomNavigation/LessonBottomNavigation.tsx";
import WebView from "react-native-webview";
import {GlobalStyle} from "../constants/GlobalStyle.ts";
import {getUrl} from "../settings/utils.ts";
import {CourseVisibility, fetchLessonData} from "../redux/slises/lessonSlice.ts";
import {fetchThemeLessons} from "../redux/slises/themeLessonsSlice.ts";
import {fetchControlWork} from "../redux/slises/controlWorkSlice.ts";
import {SurveyCard} from "../components/SurveyCard/SurveyCard.tsx";
import {createSurveyReport, fetchSurvey} from "../redux/slises/surveySlice.ts";
import {setThemeID} from "../redux/slises/studentCoursesSlice.ts";
import {BlocksRenderer} from "../components/BlocksRenderer/BlocksRenderer.tsx";


export const LessonScreen: React.FC = ({route}: any) => {
    const dispatch = useAppDispatch();
    const navigation = useNavigation();

    const {authState} = useAuth()

    const {groupID, type, blockID, course_id} = useAppSelector(state => state.studentCourses);
    // console.log(groupID, type, blockID, course_id)
    const {theme_name: themeTitle, data: allLessens} = useAppSelector(state => state.themeLessons)
    const lesson = useAppSelector(state => state.lesson);
    console.log('lesson', lesson)
    const {selectedFiles, setSelectedFiles, handleFileUpload, removeFile} = useFileUpload();
    const [url, setUrlState] = useState<string | null>(null);
    const [tooltip, setTooltip] = useState<string | null>(null)

    //обязателен ли конспект
    const [isSummaryRequired, setIsSummaryRequired] = useState(lesson?.data?.required_abstract === 1 && lesson?.data?.show_abstract === 1)
    useEffect(() => {
        setIsSummaryRequired(lesson?.data?.required_abstract === 1 && lesson?.data?.show_abstract === 1)
    }, [lesson?.data?.required_abstract, lesson?.data?.show_abstract])

    //сдан ли конспект
    const [isAbstractSubmitted, setIsAbstractSubmitted] = useState(lesson?.data?.abstract != null)
    useEffect(() => {
        setIsAbstractSubmitted(lesson?.data?.abstract !== null)
    }, [lesson?.data?.abstract])

    const disabledIsAbstract = isSummaryRequired && !isAbstractSubmitted


    const courseVisibility: CourseVisibility = lesson?.data?.courseVisibility ?? 1;
    const isLinearCourse = courseVisibility === 3

    useEffect(() => {
        const fetchUrl = async () => {
            const value = await getUrl();
            setUrlState(value);
        };
        fetchUrl();
    }, []);

    const returnTextNextLesson = () => {
        if (lesson?.data?.last_in_course) return 'Конец обучения';
        if (lesson?.data?.last_in_block) return 'Следующий блок';
        if (lesson?.data?.last_in_theme) return 'Следующая тема';
        return 'Следующий урок';
    };
    const returnTextPrevLesson = () => {
        if (lesson?.data?.first_in_course) return 'Предыдущий урок';
        if (lesson?.data?.first_in_block) return 'Предыдущий блок';
        if (lesson?.data?.first_in_theme) return 'Предыдущая тема';
        return 'Предыдущий урок';
    };

    // console.log('lesson', lesson)
    // console.log('allLessens', allLessens)

    const homeWorkVerified = lesson?.data?.homeWork?.status === 10;

    const lessonStatusDescription = (isLinearCourse: boolean, homeWorkVerified: boolean) => {

        if (lesson?.data?.homeWork?.status && lesson?.data?.homeWork?.status < 5) {
            return 'Практические задания к этой теме не выполнены, постарайся решить задачи до следующего урока';
        }

        if (lesson?.data?.ignoring_homework_status == 1 && lesson?.data?.homeWork?.status && lesson?.data?.homeWork?.status > 0) {
            if (isLinearCourse
                //  && !lesson?.data?.endOfTraining
            ) {
                return 'Вам открыт доступ к следующему уроку';
            }
        }

        if (homeWorkVerified && isLinearCourse
            // && !lesson?.data?.endOfTraining
        ) {
            return lesson?.data?.homeWork?.min_points_scored
                ? 'Вам открыт доступ к следующему уроку'
                : 'Вы не сможете перейти к следующему уроку, пока не выполните задание правильно';
        }

        return '';
    };

    const shouldBlockLessonsDueToUncompletedSurvey = lesson?.data?.lessonSurvey &&
        lesson?.data?.lessonSurvey.is_survey_passed === false &&
        lesson?.data?.survey_required == 1;

    const isAccessToNextLessonAllowed = useMemo(() => {
        let access = !!lesson?.data?.next_lesson?.lessonId && !!lesson?.data?.next_lesson?.themeId && !!lesson?.data?.next_lesson?.blockId;
        let tooltip = null;
        if (!access) {
            if (lesson?.data?.last_in_course && !shouldBlockLessonsDueToUncompletedSurvey && (!lesson?.data?.lessonTasksCount || lesson?.data?.homeWork?.status == 10 && lesson?.data?.homeWork?.min_points_scored)) {
                access = true;
                tooltip = 'Поздравляем Вас c завершением курса';
            } else if (lesson?.data?.courseVisibility === 3) {
                if (lesson?.data?.last_in_course) {
                    tooltip = `Для завершения обучения необходимо ${!!lesson?.data?.ignoring_homework_status ? '' : 'успешно'} пройти задания и/или опрос`;
                } else {
                    tooltip = `Для перехода к следующему уроку необходимо ${!!lesson?.data?.ignoring_homework_status ? '' : 'успешно'} пройти задания и/или опрос`;
                }
            } else if (lesson?.data?.last_in_course) {
                access = true;
                tooltip = 'Поздравляем Вас c завершением курса';
            } else {
                tooltip = 'Педагог ещё не открыл вам доступ к следующему уроку';
            }
        } else if (lesson?.data?.last_in_course) {
            access = true;
            tooltip = 'Поздравляем Вас c завершением курса';
        }
        setTooltip(tooltip)
        return {
            access,
            tooltip
        }
    }, [
        shouldBlockLessonsDueToUncompletedSurvey,
        lesson?.data?.next_lesson?.lessonId,
        lesson?.data?.next_lesson?.themeId,
        lesson?.data?.next_lesson?.blockId,
        lesson?.data?.last_in_course
    ])

    const lessonStatusTitle = () => {
        const under_inspection_text = lesson?.data?.under_inspection_text || 'Домашняя работа на проверке педагогом';
        const success_text_liner = lesson?.data?.success_text_liner || 'Домашняя работа выполнена успешно';
        const unsuccessfully_text_liner = lesson?.data?.unsuccessfully_text_liner || 'Домашняя работа выполнена неуспешно';
        const completed_text = lesson?.data?.completed_text || 'Домашняя работа выполнена';
        const not_passed_text = lesson?.data?.not_passed_text || 'Домашняя работа не выполнена';

        const homeWork = lesson?.data?.homeWork;
        const courseVisibility = lesson?.data?.courseVisibility;

        const status = homeWork?.status ?? 0;

        if (status > 4 && status < 10) {
            return under_inspection_text;
        }

        if (status === 10) {
            if (courseVisibility === 3) {
                return homeWork?.min_points_scored ? success_text_liner : unsuccessfully_text_liner;
            }
            return completed_text;
        }

        return not_passed_text;
    };

    const homeWorkCompleted = lesson?.data?.homeWork?.status === 0 ? 'notCompleted' : 'completed';

    // Функция для отправки файлов на сервер
    const handleSubmitFiles = () => {
        if (selectedFiles.length === 0) {
            Toast.show({
                type: 'error',
                text1: 'Ошибка',
                text2: 'Нет выбранных файлов для отправки',
                position: 'bottom',
                bottomOffset: 50,
            });
            return;
        }

        const formData = new FormData();
        formData.append('plan_id', String(lesson?.data?.plan_id));

        selectedFiles.forEach((file) => {
            formData.append('files[]', file);
        });

        dispatch(uploadAbstract(formData)).then((res) => {
            if (res.meta.requestStatus === 'fulfilled') {
                setSelectedFiles([]);
                Toast.show({
                    type: 'success',
                    text1: 'Успешно',
                    text2: 'Конспект сдан на проверку',
                    position: 'bottom',
                    bottomOffset: 50,
                });

                // ✅ Повторно загружаем урок
                dispatch(fetchLessonData({
                    groupId: groupID!,
                    lessonId: lesson?.data?.id!,
                    type: type,
                }));
            } else if (res.meta.requestStatus === 'rejected') {
                const errorData = typeof res.payload === 'string' ? res.payload : 'Произошла ошибка';

                Toast.show({
                    type: 'error',
                    text1: 'Ошибка',
                    text2: errorData,
                    position: 'bottom',
                    bottomOffset: 50,
                });
            }
        });
    };


    // Функция создания ДЗ
    const createHomeWork = async () => {
        try {
            const date = new Date().toLocaleDateString("ru-RU"); // "ДД.ММ.ГГГГ"
          //  const courseId = lesson?.data?.topic?.course_id
            const courseId = lesson?.data?.next_lesson?.blockId
            //  const courseId = lesson?.data?.prev_lesson ? lesson?.data?.prev_lesson?.blockId : lesson?.data?.next_lesson?.blockId
            const baseData: any = {
                course_id: String(courseId ?? ""),
                material_type: "topic",
                material_id: String(lesson?.data?.theme_id ?? ""),
                direction_id: lesson?.data?.directionId ?? 0,
                lesson_id: lesson?.data?.id ?? 0,
                deadline_date: date,
                groups_childrens: {
                    [groupID ?? 0]: [authState?.userId ?? 0],
                },
                only_content: false,
                remove_check: false,
                send_at: null,
                type: "group",
            };

            const dataPrivate = {
                children_ids: [authState?.userId],
                type: "private",
                direction_id: lesson?.data?.directionId,
                course_id: blockID,
                material_id: lesson?.data?.theme_id,
                material_type: "topic",
                lesson_id: lesson?.data?.id,
                deadline_date: date,
                remove_check: false,
                send_at: null,
                only_content: false,
                is_classwork: false,
            };

            const response = await dispatch(setHomeWork(type === 'private' ? dataPrivate : baseData));

            if (!setHomeWork.fulfilled.match(response)) {
                throw new Error(response.error?.message || "Ошибка при создании домашней работы");
            }

            const {id: homeworkId, group_id, direction_id} = response.payload;
            await dispatch(fetchHomeWork(homeworkId));
            // @ts-ignore
            navigation.navigate(ROUTES.HOME_WORK, {
                isCompleted: "notCompleted",
                groupId: group_id ? group_id : direction_id,
                homeworkId,
                lessonId: lesson?.data?.id,
            });

        } catch (error) {
            console.error("Ошибка при создании домашней работы:", error);
        }
    };
    //
    //   const handleLoadComplete = (numberOfPages) => {
    //       setTotalPages(numberOfPages);
    //   };
    //
    //   const handlePreviousPage = () => {
    //       if (currentPage > 1) {
    //           setCurrentPage(currentPage - 1);
    //       }
    //   };
    //
    //   const handleNextPage = () => {
    //       if (currentPage < totalPages) {
    //           setCurrentPage(currentPage + 1);
    //       }
    //   };
    //
    const openLink = (url: string) => {
        if (url) {
            Linking.openURL(url).catch(err => Alert.alert('Ошибка', `Не удалось открыть ссылку. Адрес ссылки: ${url}`));
        }
    };

    // Функция для извлечения URL из HTML iframe
    const extractIframeUrl = (iframeHtml: string): string | null => {
        const match = iframeHtml.match(/src="([^"]+)"/);
        return match ? match[1] : null;
    };

    const openIframe = () => {
        const iframeUrl = extractIframeUrl(lesson?.data?.iframe || '');
        if (iframeUrl) {
            Linking.openURL(iframeUrl); // Открыть URL в браузере
        } else {
            console.error('Не удалось извлечь URL из iframe.');
        }
    };

    const getNextLesson = async () => {
        try {
            const nextLessonId = lesson?.data?.next_lesson?.lessonId;
            const nextThemeId = lesson?.data?.next_lesson?.themeId;
            dispatch(setThemeID(nextThemeId))

            if (groupID === null || groupID === undefined || nextThemeId === undefined || nextLessonId === undefined) {
                console.error("Ошибка: groupID не задан");
                return;
            }

            const lessons = await dispatch(
                fetchThemeLessons({type, groupId: groupID, themeId: nextThemeId})
            ).unwrap();

            if (lessons.data?.length === 1 && lessons.data[0]?.type === 'control') {
                dispatch(fetchControlWork(lessons.data[0]?.work_id));
                // @ts-ignore
                navigation.navigate(ROUTES.CONTROL_WORK);

            } else {
                dispatch(fetchLessonData({lessonId: nextLessonId, groupId: groupID, type,}));
            }
        } catch (error) {
            console.error("Ошибка загрузки уроков:", error);
        }
    }

    const getPrevLesson = async () => {
        try {
            if (groupID === null || groupID === undefined) {
                console.error("Ошибка: groupID не задан");
                return;
            }
            const prevLessonId = lesson?.data?.prev_lesson?.lessonId;
            const prevThemeId = lesson?.data?.prev_lesson?.themeId;

            if (prevThemeId !== undefined && prevLessonId !== undefined) {
                await dispatch(
                    fetchThemeLessons({type, groupId: groupID, themeId: prevThemeId})).unwrap();
            }
            if (prevLessonId !== null && prevLessonId !== undefined) {
                dispatch(fetchLessonData({lessonId: prevLessonId, groupId: groupID, type,}));
            }
        } catch (error) {
            console.error("Ошибка загрузки уроков:", error);
        }
    }

    const createSurveyHandler = async () => {
        try {
            const lessonId = lesson?.data?.id;
            const surveyId = lesson?.data?.lessonSurvey?.id
            if (!lessonId) {
                return;
            }
            if (!surveyId) {
                throw new Error("Параметр 'survey_id' обязателен");
            }
            // Отправляем запрос на создание отчета
            if (authState?.userId != null) {
                await dispatch(
                    createSurveyReport({
                        openLesson: 1,
                        forLesson: Number(lessonId),
                        survey_id: surveyId,
                        user_id: authState?.userId
                    })
                ).unwrap();
            }

            // Проверяем, есть ли survey_id в ответе
            if (!surveyId) {
                throw new Error("Параметр 'survey_id' обязателен");
            }

            // Запрашиваем данные опроса
            await dispatch(fetchSurvey(+surveyId)).unwrap();

            // @ts-ignore
            navigation.navigate(ROUTES.SURVEY);
        } catch (error: any) {
            //console.error("Ошибка запроса:", error);

            // Определяем текст ошибки
            const errorMessage =
                error?.error?.[0] || error?.message || "Произошла ошибка";

            // Показываем Toast с сообщением
            Toast.show({
                type: 'error',
                text1: 'Ошибка',
                text2: errorMessage,
                position: 'bottom',
                bottomOffset: 50,
            });
        }
    }

    return (
        <>
            <Toast config={toastConfig}/>
            <ScrollView style={styles.container}>
                <CoursesHeader title={themeTitle}/>

                <LessonNavigation
                    // courseVisibility={1}
                    lessons={allLessens}
                    //  allLessons={allLessens}
                    currentLessonId={lesson?.data?.id}
                    onLessonSelect={(lessonId) => {
                        //   const isActiveLesson = newGroups?.lessonPlans?.find(el => el.lesson.id === lessonId)?.status === 1
                        if (groupID) {
                            dispatch(fetchLessonData({groupId: groupID, lessonId, type}))
                        }

                    }}
                />
                <LessonDescription description={lesson?.data?.description ?? ''}/>
                <BlocksRenderer blocksData={lesson?.data?.blocks!}/>
                {/*<LessonVideoPlayer*/}
                {/*    videos={lesson?.data?.videos}*/}
                {/*    lessonName={lesson?.data?.name}*/}
                {/*/>*/}

                {/*<ScormFile lesson={lesson?.data}/>*/}

                {/* Загрузка файла */}
                {
                    lesson?.data?.show_abstract === 1 &&
                    <View style={styles.downloadHomeWork}>
                        <Text
                            style={styles.noteTitle}>{lesson?.data?.required_abstract == 1 ? "Обязательно сделай" : "Не забудь сделать"} конспект
                            урока</Text>
                        <Text style={styles.noteText}>
                            Это поможет тебе быстрее запомнить новую информацию, а если что-то забудешь - быстро
                            вернуться к записям
                        </Text>
                        {lesson?.data?.abstract != null ? <TouchableOpacity
                            disabled={true}
                            style={[styles.button, {opacity: 0.6}]}
                        >
                            <Text>Вы уже сдали конспект</Text>
                        </TouchableOpacity> : <TouchableOpacity
                            style={styles.button}
                            onPress={handleFileUpload}
                        >
                            <Text>Загрузить файл</Text>
                        </TouchableOpacity>}

                    </View>

                }


                {/* Список выбранных файлов */}
                {selectedFiles.length > 0 && (
                    <ScrollView style={styles.fileList}>
                        {selectedFiles.map((file, index) => (
                            <View key={index} style={styles.fileItem}>
                                <Text style={styles.fileName}>{file.name}</Text>
                                <TouchableOpacity onPress={() => removeFile(file)}>
                                    <Text style={styles.removeFile}>✕</Text>
                                </TouchableOpacity>
                            </View>
                        ))}
                    </ScrollView>
                )}

                {/* Кнопка отправки файлов на сервер */}
                {selectedFiles.length > 0 && (
                    <TouchableOpacity
                        style={{
                            flex: 1,
                            backgroundColor: Colors.yellow,
                            paddingVertical: 10,
                            paddingHorizontal: 20,
                            borderRadius: 10,
                            alignItems: 'center',
                            marginVertical: 15,
                        }}
                        onPress={handleSubmitFiles}>
                        {<Text>Отправить конспект на проверку</Text>}
                    </TouchableOpacity>
                )}
                {/*<ScormFile lesson={lessons?.lesson}/>*/}

                {/* Полезные материалы */}
                <View style={{marginBottom: 20}}>
                    {/*{(lesson?.data?.lessonMaterials && lesson?.data?.lessonMaterials.length > 0) && (*/}
                    {/*    <>*/}
                    {/*        <Text style={styles.materialsTitle}>Полезные материалы:</Text>*/}
                    {/*        <LessonMaterials materials={lesson?.data?.lessonMaterials}/>*/}
                    {/*    </>*/}
                    {/*)}*/}

                    {lesson?.data?.iframe && (
                        <View style={{flex: 1, marginTop: 15}}>
                            <WebView
                                originWhitelist={['*']}
                                source={{
                                    html: `
                                          <!DOCTYPE html>
                                          <html>
                                            <head>
                                              <meta name="viewport" content="width=device-width, initial-scale=1.0">
                                            </head>
                                            <body style="margin: 0; padding: 0;">
                                              ${lesson?.data?.iframe}
                                            </body>
                                          </html>
                                        `,
                                }}
                                style={{width: '100%', height: 240}}
                                javaScriptEnabled={true}
                                domStorageEnabled={true}
                                //  onLoadEnd={() => handleLoadComplete(totalPages)} // Передайте общее количество страниц
                            />
                            <TouchableOpacity
                                onPress={openIframe}
                                style={GlobalStyle.btnOpenFile}
                            >
                                <Text>Открыть IFRAME</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {/*{lessons?.lesson.lesson_file && (*/}
                    {/*    <View style={{flex: 1, marginTop: 15}}>*/}

                    {/*        <WebView*/}
                    {/*            originWhitelist={['*']}*/}
                    {/*            source={{uri: `${axios.defaults.baseURL}${lessons.lesson.lesson_file}`}}*/}
                    {/*            style={{width: '100%', height: 240}}*/}
                    {/*            onLoadEnd={() => handleLoadComplete(totalPages)} // Передайте общее количество страниц*/}
                    {/*        />*/}
                    {/*        <TouchableOpacity*/}
                    {/*            onPress={() => openLink(`${axios.defaults.baseURL}${lessons.lesson.lesson_file}`)}*/}
                    {/*            style={GlobalStyle.btnOpenFile}>*/}
                    {/*            <Text>*/}
                    {/*                Открыть файл PDF*/}
                    {/*            </Text>*/}
                    {/*        </TouchableOpacity>*/}
                    {/*    </View>*/}
                    {/*)}*/}

                    {/*{lesson?.data?.lessonFileMedia && (*/}
                    {/*    <View style={{flex: 1}}>*/}
                    {/*        {Platform.OS === 'ios' && <WebView*/}
                    {/*            originWhitelist={['*']}*/}
                    {/*            source={{uri: `${url}/${lesson?.data?.lessonFileMedia.path}`}}*/}
                    {/*            style={{width: '100%', height: 240}}*/}
                    {/*            //  onLoadEnd={() => handleLoadComplete(totalPages)} // Передайте общее количество страниц*/}
                    {/*        />}*/}

                    {/*        <TouchableOpacity*/}
                    {/*            onPress={() => openLink(`${url}/${lesson?.data?.lessonFileMedia.path}`)}*/}
                    {/*            style={GlobalStyle.btnOpenFile}>*/}
                    {/*            <Text>*/}
                    {/*                Открыть файл PDF*/}
                    {/*            </Text>*/}
                    {/*        </TouchableOpacity>*/}
                    {/*    </View>*/}
                    {/*)}*/}


                    {/*{lesson?.data?.lesson_file &&*/}
                    {/*    <View style={{flex: 1}}>*/}
                    {/*        <TouchableOpacity*/}
                    {/*            onPress={() => {*/}
                    {/*                openLink(`${url}${lesson?.data?.lesson_file}`)*/}
                    {/*            }}*/}
                    {/*            style={styles.button}*/}
                    {/*        >*/}
                    {/*            <Text style={{}}>Материалы к уроку</Text>*/}
                    {/*        </TouchableOpacity>*/}
                    {/*    </View>*/}
                    {/*}*/}
                </View>

                {/*/!* Блок с комментарием *!/*/}
                {
                    lesson?.data?.text_block_content &&
                    <View style={styles.textBlockContent}>
                        <Text style={{fontSize: 16}}>{extractTextFromContent(lesson.data.text_block_content)}</Text>
                    </View>
                }

                {/*/!* Статус домашней работы *!/*/}
                {
                    !!lesson?.data?.lessonTasksCount && <View style={styles.homeworkStatusContainer}>
                        <Text style={styles.homeworkStatusText}>{lessonStatusTitle()}</Text>
                        {
                            lessonStatusDescription(isLinearCourse, homeWorkVerified).length > 2 &&
                            <Text style={{marginBottom: 15}}>
                                {lessonStatusDescription(isLinearCourse, homeWorkVerified)}
                            </Text>
                        }
                        <TouchableOpacity
                            style={[styles.button, {backgroundColor: Colors.textLight}]}
                            onPress={() => {
                                if (disabledIsAbstract) {
                                    Toast.show({
                                        type: 'info',
                                        text1: 'Нет доступа',
                                        position: 'bottom',
                                        bottomOffset: 50,
                                        text2: 'ДЗ можно будет выполнить после сдачи конспекта',
                                    });
                                    return
                                }

                                if (lesson?.data?.homeWork) {
                                    dispatch(fetchHomeWork(+lesson?.data?.homeWork.id));
                                    // @ts-ignore
                                    navigation.navigate(ROUTES.HOME_WORK, {
                                            isCompleted: homeWorkCompleted,
                                            title: 'ХЗ ДЛЯ ЧЕГО',
                                            // title: params.title,
                                            groupId: groupID,
                                            lessonId: lesson.data.id,
                                            homeWorkId: lesson?.data.homeWork.id
                                        }
                                    )
                                } else {
                                    createHomeWork()
                                }
                            }
                            }
                        >
                            <Text style={{color: Colors.colorBlack, fontWeight: 'bold'}}>
                                {lesson?.data?.homeWork?.status < 5 ? "Выполнить" : "Перейти"}
                            </Text>
                        </TouchableOpacity>

                        {isAccessToNextLessonAllowed.access &&
                            <TouchableOpacity
                                style={[styles.button, {backgroundColor: Colors.textLight, marginTop: 10}]}
                                onPress={() => {
                                    getNextLesson();
                                }}
                            >
                                <Text style={{color: Colors.colorBlack, fontWeight: 'bold'}}>
                                    {returnTextNextLesson()}
                                </Text>
                            </TouchableOpacity>
                        }
                    </View>
                }


                {/*/!* Опросы *!/*/}
                {lesson?.data?.lessonSurvey && <SurveyCard
                    title={lesson?.data?.lessonSurvey.title}
                    description={lesson?.data?.lessonSurvey.description}
                    //  isSurveyPassed={lesson?.data?.lessonSurvey.is_survey_passed}
                    isSurveyRequired={!!lesson?.data?.survey_required}
                    onPress={createSurveyHandler}
                />}


                {/*{*/}
                {/*    lessons?.hasTasks && (*/}
                {/*        <View style={styles.homeworkStatusContainer}>*/}
                {/*            <Text style={styles.homeworkStatusText}>{lessonStatusTitle()}</Text>*/}
                {/*            <Text style={styles.homeworkStatusText}>{lessonStatusDescription()}</Text>*/}
                {/*            {isSummaryRequired && !hasTheAbstractBeenHandedIn ? (*/}
                {/*                <>*/}
                {/*                    <TouchableOpacity*/}
                {/*                        style={[styles.button, {backgroundColor: Colors.textLight}]}*/}
                {/*                        onPress={() => {*/}
                {/*                            if (lessons?.homeWork) {*/}
                {/*                                dispatch(fetchHomeWork(lessons.homeWork.id));*/}
                {/*                                // @ts-ignore*/}
                {/*                                navigation.navigate(ROUTES.HOME_WORK, {*/}
                {/*                                    isCompleted: homeWorkCompleted,*/}
                {/*                                    title: params.title,*/}
                {/*                                    groupId: lessons.homeWork.group_id,*/}
                {/*                                    lessonId: lessons.lesson.id,*/}
                {/*                                    homeWorkId: lessons.homeWork.id,*/}
                {/*                                });*/}
                {/*                            } else {*/}
                {/*                                createHomeWork();*/}
                {/*                            }*/}
                {/*                        }}*/}
                {/*                        disabled={true} // Блокируем кнопку, если не переданы обязательные данные*/}
                {/*                    >*/}
                {/*                        <Text style={{color: Colors.colorBlack, fontWeight: 'bold'}}>*/}
                {/*                            {lessons?.homeWork?.status && lessons.homeWork.status < 5 ? 'Выполнить' : 'Перейти'}*/}
                {/*                        </Text>*/}
                {/*                    </TouchableOpacity>*/}

                {/*                    <Text style={styles.text}>ДЗ можно будет выполнить после сдачи конспекта</Text>*/}
                {/*                </>*/}
                {/*            ) : (*/}
                {/*                <TouchableOpacity*/}
                {/*                    style={[styles.button, {backgroundColor: Colors.textLight}]}*/}
                {/*                    onPress={() => {*/}
                {/*                        if (lessons?.homeWork) {*/}
                {/*                            dispatch(fetchHomeWork(lessons.homeWork.id));*/}
                {/*                            // @ts-ignore*/}
                {/*                            navigation.navigate(ROUTES.HOME_WORK, {*/}
                {/*                                isCompleted: homeWorkCompleted,*/}
                {/*                                title: params.title,*/}
                {/*                                groupId: lessons.homeWork.group_id,*/}
                {/*                                lessonId: lessons.lesson.id,*/}
                {/*                                homeWorkId: lessons.homeWork.id,*/}
                {/*                            });*/}
                {/*                        } else {*/}
                {/*                            createHomeWork();*/}
                {/*                        }*/}
                {/*                    }}*/}
                {/*                >*/}
                {/*                    <Text style={{color: Colors.colorBlack, fontWeight: 'bold'}}>*/}
                {/*                        {lessons?.homeWork?.status && lessons.homeWork.status < 5 ? 'Выполнить' : 'Перейти'}*/}
                {/*                    </Text>*/}
                {/*                </TouchableOpacity>*/}
                {/*            )}*/}

                {/*            /!* Кнопка для перерешивания ДЗ *!/*/}
                {/*            {lessons?.homeWork?.id && lessons?.homeWork?.can_redo && (*/}
                {/*                <TouchableOpacity*/}
                {/*                    style={[styles.button, {backgroundColor: Colors.colorTextSecondary}]}*/}
                {/*                    onPress={() => {*/}
                {/*                        dispatch(fetchHomeWork(lessons?.homeWork?.id));*/}
                {/*                        navigation.navigate(ROUTES.HOME_WORK, {isCompleted: 'notCompleted'});*/}

                {/*                    }}*/}
                {/*                >*/}
                {/*                    <Text style={{color: Colors.colorWhite, fontWeight: 'bold'}}>Перерешать ДЗ</Text>*/}
                {/*                </TouchableOpacity>*/}
                {/*            )}*/}

                {/*        </View>*/}
                {/*    )*/}
                {/*}*/}


                {/*<AnimatedButtonNextLesson*/}
                {/*    isVisible={courseVisibility === 3 && isNextLessonOpen && isShowButton}*/}
                {/*    onPressNextLessonHandler={goToNextLesson}*/}
                {/*    nextLessonId={lessons?.nextLesson?.lessonId}*/}
                {/*    groupId={params.groupId}*/}
                {/*/>*/}


                {/* Навигация между уроками */}

                <LessonBnnottomNavigation
                    shouldBlockLessonsDueToUncompletedSurvey={shouldBlockLessonsDueToUncompletedSurvey}
                    isAccessToNextLessonAllowed={isAccessToNextLessonAllowed.access}
                    accessTooltip={isAccessToNextLessonAllowed.tooltip}
                    prevButtonTitle={returnTextPrevLesson()}
                    nextButtonTitle={returnTextNextLesson()}
                    //  prevLessonId={lessons?.prevLesson?.lessonId}
                    // nextLessonId={lessons?.nextLesson?.lessonId}

                    prevLessonHandler={getPrevLesson}
                    nextLessonHandler={() => {
                        if (courseVisibility === 1) {
                            getNextLesson();
                            return;
                        }
                        if (courseVisibility === 2) {
                            if (isAccessToNextLessonAllowed.access) {
                                getNextLesson();
                            } else {
                                Toast.show({
                                    type: 'info',
                                    text1: 'Нет доступа',
                                    position: 'bottom',
                                    bottomOffset: 50,
                                    text2: isAccessToNextLessonAllowed.tooltip ?? '',
                                });
                            }
                            return;
                        }
                        if (courseVisibility === 3 && isAccessToNextLessonAllowed.access) {
                            getNextLesson();
                            return;
                        } else {
                            Toast.show({
                                type: 'info',
                                text1: 'Нет доступа',
                                position: 'bottom',
                                bottomOffset: 50,
                                text2: isAccessToNextLessonAllowed.tooltip ?? '',
                            });
                        }
                    }}
                />

            </ScrollView>
        </>

    );
};

const extractTextFromContent = (textBlockContent: string): string => {
    try {
        const data = JSON.parse(textBlockContent);

        if (!data.content || !Array.isArray(data.content)) {
            return "";
        }

        return data.content
            .flatMap((block: { content?: { text: string }[] }) => block.content?.map((item: {
                text: string
            }) => item.text) || [])
            .join("\n");
    } catch (error) {
        console.error("Invalid JSON format", error);
        return "";
    }
};


const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 10,
        paddingVertical: 0,
        backgroundColor: Colors.white,
        zIndex: -1
    },
    scrollView: {
        marginBottom: 20,
    },
    textBlockContent: {
        borderWidth: 1,
        borderColor: '#f4f4f4',
        borderRadius: 8,
        padding: 10,
        marginBottom: 20,
    },
    videoBlock: {
        borderWidth: 1,
        borderColor: '#e7e7e8',
        borderRadius: 8,
        //  padding: 15,
    },
    textDesc: {
        borderWidth: 1,
        borderColor: '#e7e7e8',
        borderRadius: 8,
        padding: 15,
        fontSize: 16
    },
    downloadHomeWork: {
        borderWidth: 1,
        borderColor: '#e7e7e8',
        borderRadius: 8,
        padding: 15,
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
    text: {
        fontSize: 18,
    },


    card: {
        borderWidth: 1,
        borderColor: Colors.colorGreyNd,
        paddingHorizontal: 15,
        paddingVertical: 5,
        marginHorizontal: 5,
        borderRadius: 8,
    },
    title: {
        fontSize: 18,
        // fontWeight: 'bold',
    },
    video: {
        width: '100%',
        height: 300,
        alignSelf: 'stretch'
    },
    description: {
        fontSize: 16,
        marginVertical: 10,
    },
    ratingContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginVertical: 10,
    },
    noteTitle: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    noteText: {
        fontSize: 14,
        marginVertical: 10,
    },
    materialsTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginVertical: 10,
    },
    image: {
        width: '100%',
        height: 200,
        marginVertical: 10,
    },
    homeworkStatusContainer: {
        borderRadius: 10,
        zIndex: -1,
        borderWidth: 1,
        borderColor: '#e2d4e9',
        justifyContent: 'center',
        backgroundColor: '#efefef',
        paddingHorizontal: 15,
        paddingVertical: 10,
        marginBottom: 20
    },
    homeworkStatusText: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    navigationContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    fileList: {
        marginTop: 16,
        maxHeight: 150,
    },
    fileItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#f0f0f0',
        padding: 10,
        marginBottom: 5,
        borderRadius: 8,
    },
    removeFile: {
        color: 'red',
        fontSize: 18,
        paddingHorizontal: 10,
    },
    fileName: {
        fontSize: 14,
        color: '#555',
        marginBottom: 4,
    },
});
