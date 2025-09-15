import {StyleSheet} from "react-native";
import {Colors} from "./Colors.ts";
import {RFValue} from "react-native-responsive-fontsize";
import {TestQuestion} from "../components/Survey/TestQuestion/TestQuestion.tsx";

export const GlobalStyle = StyleSheet.create({
    wrapperGL: {
        flex: 1,
        width: '100%',
        paddingHorizontal: 15,
    },
    input: {
        width: '100%',
        padding: 15,
        borderRadius: 8,
        backgroundColor: Colors.white,
        fontSize: 16,
        color: Colors.textGray
    },

    // Стили тасок
    taskInput:{
        flex: 1,
        height: 40,
        borderColor: Colors.colorBlueGray,
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 8,
        backgroundColor: Colors.colorWhite,
      //  marginLeft: 10,
    },
    taskInputTextArea: {
        height: 80,
        fontSize: 16,
        borderColor: Colors.colorBlueGray,
        borderWidth: 1,
        borderRadius: 10,
        paddingHorizontal: 16,
        paddingTop: 10,
        backgroundColor: Colors.colorWhite,
        marginBottom: 10,
        width: '100%',
        shadowColor: Colors.colorBlack,
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 5,
    },
    taskAnswerBtn: {
        width: '50%',
        backgroundColor: Colors.white,
        borderRadius: 10,
        paddingVertical: 15,
        paddingHorizontal: 5,
        color: Colors.colorBlack,
        alignItems: 'center',
        fontWeight: 'bold',
        marginBottom: 10,
        justifyContent: "center"
    },
    taskQuestion: {
        paddingBottom: 0,
        fontSize: 16,
        marginBottom: 10
    },
    formula:{
        marginBottom: 15,
        marginTop: 0
    },


    titleGL: {
        color: Colors.textBlack,
        fontSize: 18,
       // fontSize: RFValue(14, 680),
        fontWeight: 'bold',
        textAlign: 'left',
        // width: '100%',
        marginBottom: 22,
        //  paddingHorizontal: 20
    },
    taskContainer: {
        padding: 15,
        backgroundColor: '#e7ecf2',
        borderRadius: 10,
        marginBottom: 20
    },
    btnOpenFile: {
        backgroundColor: '#fcbf49',
        borderRadius: 8,
        paddingVertical: 15,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
        marginBottom: 10
    },
    mark: {
        padding: 8,
        borderRadius: 5,
        borderColor: Colors.colorGray,
        borderWidth: 1,
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 10
       // backgroundColor: Colors.colorAccent,
    },
    ////  survey- ОПРОСЫ
    surveyQuestionContainer: {
        width: '100%',
        backgroundColor: '#e1e8f0',
        padding: 15,
        borderRadius: 10,
        marginVertical: 10,
    },
    surveyQuestionNumber: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    surveyQuestionText: {
        fontSize: 16,
        marginBottom: 10,
    },
    loaderContainer: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(255,255,255,0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 2,
    },
})


