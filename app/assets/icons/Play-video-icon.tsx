import React from 'react';
import {Path, Svg, SvgProps} from 'react-native-svg';

interface GroupsIconProps extends SvgProps {
    focused?: boolean;
    width?: number;
    height?: number;
}

export default function PlayVideoIcon({focused, width = 24, height = 24}: GroupsIconProps) {
    return (

        <Svg width={width} height={height} viewBox="0 0 24 24" id="play_video_rectangle"
            // @ts-ignore
             xmlns="http://www.w3.org/2000/svg">
            <Path
                d="M19 4H5a3 3 0 00-3 3v10a3 3 0 003 3h14a3 3 0 003-3V7a3 3 0 00-3-3zm1 13a1 1 0 01-1 1H5a1 1 0 01-1-1V7a1 1 0 011-1h14a1 1 0 011 1v10zm-4.38-6.73L11.69 8a2 2 0 00-3 1.73v4.54a2 2 0 001.757 1.985A2 2 0 0011.69 16l3.93-2.27a2 2 0 000-3.46zm-1 1.73l-3.93 2.27V9.73L14.62 12z"
                fill={focused ? "#9828D3" : "grey"}
            />
        </Svg>
    );
}











