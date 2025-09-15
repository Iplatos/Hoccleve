import React, {useEffect, useState} from 'react';
import WebView from "react-native-webview";
import {Linking, Text, TouchableOpacity, View} from "react-native";
import {GlobalStyle} from "../../constants/GlobalStyle.ts";
import {getUrl} from '../../settings/utils.ts';

type ScormFileProps = {
    lesson: any
}
export const ScormFile = ({lesson}: ScormFileProps) => {
    const [url, setUrlState] = useState<string | null>(null);

    useEffect(() => {
        const fetchUrl = async () => {
            const value = await getUrl();
            setUrlState(value);
        };
        fetchUrl();
    }, []);



    const scormUrl = lesson?.scormFileMedia
        ? `${url}${lesson.scormFileMedia.scorm_index_file || lesson.scormFileMedia.path}`
        : '';
    const openInBrowser = () => {
        if (scormUrl) {
            Linking.openURL(scormUrl).catch(err => console.error("Failed to open URL:", err));
        }
    };

    if (!lesson?.scormFileMedia?.length) {
        return null
    }

    return (
        <>
            {
                lesson?.scormFileMedia &&
                <View>
                    <WebView
                        source={{uri: scormUrl}}
                        style={{flex: 1, height: 180}}
                        originWhitelist={['*']}
                        startInLoadingState={true}
                        javaScriptEnabled={true}
                        domStorageEnabled={true}
                        allowFileAccess={true}
                        allowFileAccessFromFileURLs={true}
                        allowUniversalAccessFromFileURLs={true}
                        mixedContentMode="always"
                        onError={(syntheticEvent) => {
                            const {nativeEvent} = syntheticEvent;
                            console.error('WebView error: ', nativeEvent);
                        }}
                        onHttpError={(syntheticEvent) => {
                            const {nativeEvent} = syntheticEvent;
                            console.error('WebView HTTP error: ', nativeEvent);
                        }}
                    />
                    <TouchableOpacity onPress={openInBrowser} style={GlobalStyle.btnOpenFile}>
                        <Text>
                            Открыть SCORM файл
                        </Text>
                    </TouchableOpacity>
                </View>
            }

            {
                lesson?.scorm_index_file &&
                <View>
                    <WebView
                        source={{uri: `${url}/${lesson.scorm_index_file}`}}
                        style={{flex: 1, height: 180}}
                        originWhitelist={['*']}
                        startInLoadingState={true}
                        javaScriptEnabled={true}
                        domStorageEnabled={true}
                        allowFileAccess={true}
                        allowFileAccessFromFileURLs={true}
                        allowUniversalAccessFromFileURLs={true}
                        mixedContentMode="always"
                        onError={(syntheticEvent) => {
                            const {nativeEvent} = syntheticEvent;
                            console.error('WebView error: ', nativeEvent);
                        }}
                        onHttpError={(syntheticEvent) => {
                            const {nativeEvent} = syntheticEvent;
                            console.error('WebView HTTP error: ', nativeEvent);
                        }}
                    />
                    <TouchableOpacity onPress={openInBrowser} style={GlobalStyle.btnOpenFile}>
                        <Text>
                            Открыть SCORM файл
                        </Text>
                    </TouchableOpacity>
                </View>
            }
        </>
    );
};

