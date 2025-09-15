import React from 'react';
import {Defs, LinearGradient, Path, Stop, Svg, SvgProps} from 'react-native-svg';

interface GroupsIconProps extends SvgProps {
    focused?: boolean;
    width?: number;
    height?: number;
}

export default function DocumentMinusIcon({focused, width = 24, height = 24}: GroupsIconProps) {
    return (
        // @ts-ignore
        <Svg width={width} height={height} viewBox="0 0 24 24" id="document_minus" xmlns="http://www.w3.org/2000/svg">
            <Path fill-rule="evenodd" clip-rule="evenodd"
                  d="M5 2.75c-.69 0-1.25.56-1.25 1.25v16c0 .69.56 1.25 1.25 1.25h14c.69 0 1.25-.56 1.25-1.25V8.31l-5.56-5.56H5zM2.25 4A2.75 2.75 0 015 1.25h9.793c.331 0 .65.132.884.366l5.707 5.707c.234.235.366.553.366.884V20A2.75 2.75 0 0119 22.75H5A2.75 2.75 0 012.25 20V4z"
                  fill={focused ? "#9828D3" : "grey"}
            />
            <Path fill-rule="evenodd" clip-rule="evenodd"
                  d="M14.25 2.241c0-.757.916-1.136 1.451-.6l5.659 5.658c.535.535.156 1.451-.601 1.451H15.1a.85.85 0 01-.85-.85V2.241zm1.5 1.57V7.25h3.44l-3.44-3.44zM7.25 14a.75.75 0 01.75-.75h8a.75.75 0 010 1.5H8a.75.75 0 01-.75-.75z"
                  fill={focused ? "#9828D3" : "grey"}
            />
        </Svg>
    );
}











