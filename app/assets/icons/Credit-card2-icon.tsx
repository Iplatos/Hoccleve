import React from 'react';
import {Defs, LinearGradient, Path, Stop, Svg, SvgProps} from 'react-native-svg';

interface GroupsIconProps extends SvgProps {
    focused?: boolean;
    width?: number;
    height?: number;
}

export default function CreditCard2Icon({focused, width = 24, height = 24}: GroupsIconProps) {
    return (
        // @ts-ignore
        <Svg width={width} height={height} viewBox="0 0 24 24" id="credit_card_2" xmlns="http://www.w3.org/2000/svg">
            <Path fill-rule="evenodd" clip-rule="evenodd"
                  fill={focused ? "#9828D3" : "#2B2D3E"}
                  d="M1 10.256a3.75 3.75 0 013.75-3.75h14a3.75 3.75 0 013.75 3.75v8a3.75 3.75 0 01-3.75 3.75h-14A3.75 3.75 0 011 18.256v-8zm3.75-2.25a2.25 2.25 0 00-2.25 2.25v8a2.25 2.25 0 002.25 2.25h14a2.25 2.25 0 002.25-2.25v-8a2.25 2.25 0 00-2.25-2.25h-14z"/>
            <Path fill-rule="evenodd" clip-rule="evenodd"
                  fill={focused ? "#9828D3" : "#2B2D3E"}
                  d="M18 2.752a.25.25 0 00-.346-.231l-9.63 3.985H18V2.752zm-.92-1.617a1.75 1.75 0 012.42 1.617v4.404c0 .47-.38.85-.85.85H4.753c-.93 0-1.184-1.28-.325-1.636l12.653-5.235zM2 12.256a.75.75 0 01.75-.75h18a.75.75 0 010 1.5h-18a.75.75 0 01-.75-.75zm2 5a.75.75 0 01.75-.75h6a.75.75 0 010 1.5h-6a.75.75 0 01-.75-.75z"/>
        </Svg>
    );
}











