import React from 'react';
import {Path, Svg, SvgProps} from 'react-native-svg';

interface ArrowLeftIconProps extends SvgProps {
    focused?: boolean;
    width?: number;
    height?: number;
}

export default function MicrophoneIcon({focused, width = 24, height = 24, ...props}: ArrowLeftIconProps) {
    return (
        // @ts-ignore
        <Svg width={width} height={height} viewBox="0 0 24 24" id="microphone" xmlns="http://www.w3.org/2000/svg">
            <Path
                d="M13 18.14V20h2a1 1 0 010 2H9a1 1 0 010-2h2v-1.86a6.45 6.45 0 01-5.44-6.36 1 1 0 112 0 4.44 4.44 0 108.88 0 1 1 0 012 0A6.45 6.45 0 0113 18.14zM9 12V6a3 3 0 116 0v6a3 3 0 01-6 0zm2-6v6a1 1 0 002 0V6a1 1 0 00-2 0z"/>
        </Svg>
    );
}











