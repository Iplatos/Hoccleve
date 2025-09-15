import React from 'react';
import {Path, Svg, SvgProps} from 'react-native-svg';

interface TableIconProps extends SvgProps {
    focused?: boolean;
    width?: number;
    height?: number;
}

export default function TableIcon({focused, width = 24, height = 24, ...props}: TableIconProps) {
    return (
        <Svg width={width} height={height} viewBox="0 0 24 24" id="table" xmlns="http://www.w3.org/2000/svg">
            <Path
                d="M19 2H5a3 3 0 00-3 3v14a3 3 0 003 3h14a3 3 0 003-3V5a3 3 0 00-3-3zM4 10h4v4H4v-4zm6 0h10v4H10v-4zm9-6a1 1 0 011 1v3H10V4h9zM5 4h3v4H4V5a1 1 0 011-1zM4 19v-3h4v4H5a1 1 0 01-1-1zm16 0a1 1 0 01-1 1h-9v-4h10v3z"
                fill={props.color ? props.color : "grey"}/>
        </Svg>
    );
}











