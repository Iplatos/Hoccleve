import React from 'react';
import {Path, Svg, SvgProps} from 'react-native-svg';

interface UnevenLineIconProps extends SvgProps {
    focused?: boolean;
    width?: number;
    height?: number;
}

export default function UnevenLineIcon({focused, width = 24, height = 24, ...props}: UnevenLineIconProps) {
    return (
        <Svg width={width} height={height} viewBox="0 0 24 24" id="uneven_line_copy" xmlns="http://www.w3.org/2000/svg">
            <Path
                d="M22 13.2a1 1 0 01-1 1h-2.13a.69.69 0 00-.1.25l-.66 3.36a2.54 2.54 0 01-.64 1.3 1.779 1.779 0 01-2.65-.11 2.67 2.67 0 01-.62-1.41l-1.35-9.78-1.18 6.27a2.46 2.46 0 01-.64 1.3 1.81 1.81 0 01-1.31.62 1.84 1.84 0 01-1.16-.44 2.39 2.39 0 01-.68-1l-1-3L6.21 13a2.28 2.28 0 01-.66.85 1.76 1.76 0 01-1.09.38H3a1 1 0 010-2h1.35v-.06l.75-1.63a2.22 2.22 0 01.68-.87A1.78 1.78 0 018 9.73c.31.268.545.613.68 1l1 2.9 1.22-6.29A2.64 2.64 0 0111.54 6a1.78 1.78 0 012.66.05 2.6 2.6 0 01.62 1.41l1.35 9.82.64-3.24c.083-.46.29-.889.6-1.24a1.85 1.85 0 011.34-.62H21a1.001 1.001 0 011 1.02z"
                fill={props.color ? props.color : "grey"}/>
        </Svg>

    );
}











