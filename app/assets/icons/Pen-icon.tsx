import React from 'react';
import {Defs, LinearGradient, Path, Stop, Svg, SvgProps} from 'react-native-svg';

interface GroupsIconProps extends SvgProps {
    focused?: boolean;
    width?: number;
    height?: number;
}

export default function PenIcon({focused, width = 24, height = 24}: GroupsIconProps) {
    return (
        // @ts-ignore
    <Svg width={width} height={height} viewBox="0 0 24 24" id="pen" xmlns="http://www.w3.org/2000/svg">
        <Path fill-rule="evenodd" clip-rule="evenodd"
              fill={focused ? "#9828D3" : "#2B2D3E"}
              d="M16.217 3.823l3.96 3.96a1.25 1.25 0 010 1.768l-9.94 9.938a1.25 1.25 0 01-.572.327l-5.327 1.367a1.25 1.25 0 01-1.521-1.521l1.367-5.327a1.25 1.25 0 01.327-.573l9.938-9.939a1.25 1.25 0 011.768 0zm-.884 1.238L5.62 14.774l-1.245 4.851 4.85-1.245 9.714-9.713-3.606-3.606z"/>
        <Path fill-rule="evenodd" clip-rule="evenodd"
              fill={focused ? "#9828D3" : "#2B2D3E"}
              d="M15.688 8.313a.5.5 0 010 .707l-6 6a.5.5 0 11-.707-.707l6-6a.5.5 0 01.707 0zM6.98 16.314a.5.5 0 01.707 0l2 2a.5.5 0 01-.707.707l-2-2a.5.5 0 010-.707zM17.47 1.47a.75.75 0 011.061 0l4 4a.75.75 0 01-1.06 1.06l-4-4a.75.75 0 010-1.06z"/>
    </Svg>
    );
}











