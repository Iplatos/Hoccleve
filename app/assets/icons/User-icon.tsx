import React from 'react';
import {Path, Svg, SvgProps} from 'react-native-svg';

interface UserIconProps extends SvgProps {
    focused?: boolean;
    width?: number;
    height?: number;
}

export default function UserIcon({focused, width = 24, height = 24, ...props}: UserIconProps) {
    return (
        <Svg width={width} height={height} viewBox="0 0 24 24" id="user" xmlns="http://www.w3.org/2000/svg">
            <Path
                d="M12 13a5 5 0 100-10 5 5 0 000 10zm0-8a3 3 0 110 6 3 3 0 010-6zm7 13v2a1 1 0 01-2 0v-2a1 1 0 00-1-1H8a1 1 0 00-1 1v2a1 1 0 11-2 0v-2a3 3 0 013-3h8a3 3 0 013 3z"
                fill={props.color ? props.color : "grey"}/>
        </Svg>
    );
}


