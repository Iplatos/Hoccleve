import {createStackNavigator} from "@react-navigation/stack";
import React from "react";
import {HomeworkScreen} from "../screens/HomeworkScreen.tsx";
import {PaymentScreen} from "../screens/TabNavigator/PaymentScreen.tsx";
import {LoginScreen} from "../screens/auth/LoginScreen.tsx";
import {ROUTES} from "../constants/Routes.ts";
import Home from "../screens/Home.tsx";
import {RequestsScreen} from "../screens/RequestsScreen.tsx";
import {JournalScreen} from "../screens/JournalScreen.tsx";
import {LibraryScreen} from "../screens/LibraryScreen.tsx";
import {CoursesScreen} from "../screens/CoursesScreen.tsx";
import {SupportScreen} from "../screens/SupportScreen.tsx";
import {ReportsScreen} from "../screens/ReportsScreen.tsx";
import {DirectionEditorScreen} from "../screens/DirectionEditorScreen.tsx";
import {TaskBankScreen} from "../screens/TaskBankScreen.tsx";
import {PlatformSettingsScreen} from "../screens/PlatformSettingsScreen.tsx";
import {AdvertisementScreen} from "../screens/AdvertisementScreen.tsx";
import {DepartmentsScreen} from "../screens/DepartmentsScreen.tsx";
import {NewsScreen} from "../screens/NewsScreen.tsx";
import {CourseDetailScreen} from "../screens/CourseDetailScreen.tsx";
import {RecordLessonScreen} from "../screens/RecordLessonScreen.tsx";
import {BlockThemesScreen} from "../screens/BlockThemesScreen.tsx";
import {LessonScreen} from "../screens/LessonScreen.tsx";
import {ProbeWorkScreen} from "../screens/ProbeWorkScreen.tsx";
import {ControlWorkScreen} from "../screens/ControlWorkScreen.tsx";
import { RepeatHomeWorkScreen} from "../screens/RepeatHomeWorkScreen.tsx";
import {ChatScreen} from "../screens/ChatScreen.tsx";
import {ChatDetailScreen} from "../screens/ChatDetailScreen.tsx";
import {CalendarScreen} from "../screens/CalendarScreen.tsx";
import {useRoute} from "@react-navigation/native";
import {SurveyScreen} from "../screens/SurveyScreen.tsx";
import {LessonScreenBySeminarian} from "../screens/LessonScreenBySeminarian.tsx";
import {ControlWorkCheck} from "../screens/ControlWorkCheck.tsx";

import {MySurveyScreen} from "../screens/MySurveyScreen.tsx";
import {CreateChatScreen} from "../screens/CreateChatScreen.tsx";
import NotFoundScreen from "../screens/NotFoundScreen.tsx";


const Stack = createStackNavigator();

export const AppNavigator = () => {

    return (
        <Stack.Navigator
            initialRouteName="main"
            screenOptions={{headerShown: false}}

        >
            <Stack.Screen name={ROUTES.MAIN} component={Home}/>

            <Stack.Screen name={ROUTES.HOME_WORK} component={HomeworkScreen}/>
            <Stack.Screen name={ROUTES.REPEAT_HOME_WORK} component={RepeatHomeWorkScreen}/>

            <Stack.Screen name={ROUTES.PAYMENT} component={PaymentScreen}/>
            <Stack.Screen name={ROUTES.REQUESTS} component={RequestsScreen}/>
            <Stack.Screen name={ROUTES.JOURNAL} component={JournalScreen}/>
            <Stack.Screen name={ROUTES.LIBRARY} component={LibraryScreen}/>
            {/*Уроки*/}
            <Stack.Screen name={ROUTES.LESSON} component={LessonScreen}/>
            <Stack.Screen name={ROUTES.LESSON_CHECK} component={LessonScreenBySeminarian}/>

            <Stack.Screen name={ROUTES.CALENDAR} component={CalendarScreen}/>
            {/*Пробники*/}
            <Stack.Screen name={ROUTES.PROBE_WORK} component={ProbeWorkScreen}/>
            {/*Контрольные*/}
            <Stack.Screen name={ROUTES.CONTROL_WORK} component={ControlWorkScreen}/>
            <Stack.Screen name={ROUTES.CONTROL_WORK_CHECK} component={ControlWorkCheck}/>

            <Stack.Screen name={ROUTES.SUPPORT} component={SupportScreen}/>
            <Stack.Screen name={ROUTES.RECORD_LESSON} component={RecordLessonScreen}/>

            {/*Опросы*/}
            <Stack.Screen name={ROUTES.SURVEY} component={SurveyScreen}/>
            <Stack.Screen name={ROUTES.MY_SURVEY} component={MySurveyScreen}/>

             {/*Курсы*/}
            <Stack.Screen name={ROUTES.COURSES} component={CoursesScreen}/>
            <Stack.Screen name={ROUTES.COURSE_DETAIL} component={CourseDetailScreen}/>
            <Stack.Screen name={ROUTES.BLOCK_THEMES} component={BlockThemesScreen}/>


            <Stack.Screen name={ROUTES.REPORTS} component={ReportsScreen}/>
            <Stack.Screen name={ROUTES.DIRECTION_EDITOR} component={DirectionEditorScreen}/>
            <Stack.Screen name={ROUTES.TASK_BANK} component={TaskBankScreen}/>
            <Stack.Screen name={ROUTES.PLATFORM_SETTINGS} component={PlatformSettingsScreen}/>
            <Stack.Screen name={ROUTES.ADVERTISEMENT} component={AdvertisementScreen}/>
            <Stack.Screen name={ROUTES.DEPARTMENTS} component={DepartmentsScreen}/>
            <Stack.Screen name={ROUTES.NEWS} component={NewsScreen}/>

            <Stack.Screen name={ROUTES.CHAT} component={ChatScreen}/>
            {/*<Stack.Screen name={ROUTES.CHAT} component={ChatScreenNew}/>*/}

            {/*<Stack.Screen name={ROUTES.CHAT_DETAIL} component={ChatDetailScreen}/>*/}
            <Stack.Screen name={ROUTES.NOT_FOUND} component={NotFoundScreen}/>

            <Stack.Screen name="Login" component={LoginScreen}/>
        </Stack.Navigator>

    );
};
