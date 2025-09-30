import { configureStore } from '@reduxjs/toolkit'

import { baseApi } from '../../services/base-api'
import platformSlice from '../slises/platformSlice.ts'
import userSlice from '../slises/userSlice.ts'

import menuSlice from '../slises/menuSlice.ts'
import settingSlice from '../slises/settingSlice.ts'
import newsSlice from '../slises/newsSlice.ts'

import bannerSlice from '../slises/bannerSlice.ts'
import coursesSlice from '../slises/CoursesSlise.ts'
import calendarSlice from '../slises/calendarSlice.ts'
import homeworkSlice from '../slises/homeworkSlice.ts'
import studentCoursesSlice from '../slises/studentCoursesSlice.ts'
import directionPlanSlice from '../slises/directionPlanSlice.ts'
import reportsSlice from '../slises/reportsSlice.ts'
import blockThemesSlice from '../slises/blockThemesSlice.ts'
import lessonSlice from '../slises/lessonSlice.ts'
import videoRatingSlice from '../slises/videoRatingSlice.ts'
import homeWorkDetailSlice from '../slises/homeWorkDetailSlice.ts'
import answerSlice from '../slises/answerSlice.ts'
import passWorkSlice from '../slises/passWorkSlice.ts'
import uploadAbstractSlice from '../slises/uploadAbstractSlice.ts'
import probeWorkSlice from '../slises/probeWorkSlice.ts'
import controlWorkSlice from '../slises/controlWorkSlice.ts'
import controlWorkStartStopSlice from '../slises/controlWorkStartStopSlice.ts'
import createHomeWorkSlice from '../slises/createHomeWorkSlice.ts'
import controlWorkSendAnswerSlice from '../slises/controlWorkSendAnswerSlice.ts'
import supportSlice from '../slises/supportSlice.ts'
import workSlice from '../slises/workSlice.ts'
import chatSlice from '../slises/chat/chatSlice.ts'
import activeUsersSlice from '../slises/chat/activeUsersSlice.ts'
import currentScreenSlice from '../currentScreenSlice.ts'
import themeLessonsSlice from '../slises/themeLessonsSlice.ts'
import SurveySlice from '../slises/surveySlice.ts'
import directionsBySeminarianSlice from '../slises/seminarian/directionsBySeminarianSlice.ts'
import seminarianTopicsSlice from '../slises/seminarian/seminarianTopicsSlice.ts'
import conferenceWithoutStatusSlice, {
  fetchConferencesWithoutStatus,
} from '../slises/conferenceWithoutStatusSlice.ts'
import homeworkTimerSlice from '../slises/homeworkTimerSlice.ts'
import generalStudentJournalSlice from '../slises/generalStudentJournalSlice.ts'

const store = configureStore({
  reducer: {
    user: userSlice,
    settings: settingSlice,
    news: newsSlice,
    courses: coursesSlice,
    studentCourses: studentCoursesSlice,
    directionPlan: directionPlanSlice,
    directionsBySeminarian: directionsBySeminarianSlice,

    support: supportSlice,

    works: workSlice,

    themeLessons: themeLessonsSlice,

    seminarianTopics: seminarianTopicsSlice,

    conferenceWithoutStatus: conferenceWithoutStatusSlice,

    homework: homeworkSlice,
    probeWork: probeWorkSlice,
    controlWork: controlWorkSlice,
    controlWorkStartStop: controlWorkStartStopSlice,
    createHomeWork: createHomeWorkSlice,

    answerPost: answerSlice,
    sendControlWorkAnswer: controlWorkSendAnswerSlice,

    homeworkTimer: homeworkTimerSlice,

    uploadAbstract: uploadAbstractSlice,
    submitVideoRating: videoRatingSlice,
    passWork: passWorkSlice,
    homeworkDetail: homeWorkDetailSlice,
    lesson: lessonSlice,
    videoRating: videoRatingSlice,
    blockThemes: blockThemesSlice,
    reports: reportsSlice,
    menu: menuSlice,
    calendar: calendarSlice,
    platform: platformSlice,
    banners: bannerSlice,
    survey: SurveySlice,

    chats: chatSlice,
    chatActiveUsers: activeUsersSlice,

    currentScreen: currentScreenSlice,
    generalStudentJournal: generalStudentJournalSlice,
    [baseApi.reducerPath]: baseApi.reducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(baseApi.middleware),
})

export default store

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
