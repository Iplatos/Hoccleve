import React from 'react';
import {Path, Svg, SvgProps} from 'react-native-svg';

interface WritingIconProps extends SvgProps {
    focused?: boolean;
    width?: number;
    height?: number;
}

export default function WritingIcon({focused, width = 24, height = 24, ...props}: WritingIconProps) {
    return (
        <Svg width={width} height={height} viewBox="0 0 24 24" id="writing" xmlns="http://www.w3.org/2000/svg">
            <Path
                d="M5.24 18l4-1a1 1 0 00.47-.26l9.58-9.59a3 3 0 000-4.24l-.17-.17a3 3 0 00-4.24 0l-9.59 9.55a1 1 0 00-.26.47l-1 4A1 1 0 005.24 18zM17 3.83a1 1 0 01.71.29l.17.17a1 1 0 010 1.42l-1.4 1.39-1.58-1.58 1.39-1.4a1 1 0 01.71-.29zM6.9 13.51l6.58-6.58 1.59 1.59-6.58 6.58-2.12.53.53-2.12zM22 20a1 1 0 01-1 1H5a1 1 0 010-2h16a1 1 0 011 1zm-8-5h7a1 1 0 010 2h-7a1 1 0 010-2z"
                fill={props.color ? props.color : "grey"}/>
        </Svg>

    );
}











