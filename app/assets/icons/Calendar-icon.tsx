import React from 'react';
import {Defs, LinearGradient, Path, Stop, Svg, SvgProps} from 'react-native-svg';

interface GroupsIconProps extends SvgProps {
    focused?: boolean;
    width?: number;
    height?: number;
}

export default function CalendarIcon({focused, width = 24, height = 24}: GroupsIconProps) {
    return (
        // @ts-ignore
        <Svg width={width} height={height} viewBox="0 0 24 24" id="calendar" xmlns="http://www.w3.org/2000/svg">
            <Path
                fill={focused ? "#9828D3" : "grey"}
                d="M5.75 13a1.25 1.25 0 112.5 0 1.25 1.25 0 01-2.5 0zM7 18.25a1.25 1.25 0 100-2.5 1.25 1.25 0 000 2.5zm5-4a1.25 1.25 0 100-2.5 1.25 1.25 0 000 2.5zm0 4a1.25 1.25 0 100-2.5 1.25 1.25 0 000 2.5zm5-4a1.25 1.25 0 100-2.5 1.25 1.25 0 000 2.5zM22 7v12a3 3 0 01-3 3H5a3 3 0 01-3-3V7a3 3 0 013-3h1V3a1 1 0 012 0v1h8V3a1 1 0 012 0v1h1a3 3 0 013 3zM4 7v1h16V7a1 1 0 00-1-1H5a1 1 0 00-1 1zm16 3H4v9a1 1 0 001 1h14a1 1 0 001-1v-9z"/>
        </Svg>
    );
}











