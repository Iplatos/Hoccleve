import React from 'react';
import {Defs, LinearGradient, Path, Stop, Svg, SvgProps} from 'react-native-svg';

interface GroupsIconProps extends SvgProps {
    focused?: boolean;
    width?: number;
    height?: number;
}

export default function GroupsIcon({focused, width = 24, height = 24}: GroupsIconProps) {

    return (
        // @ts-ignore
        <Svg width={width} height={height} viewBox="0 0 24 24" id="grops" xmlns="http://www.w3.org/2000/svg">
            <Path fillRule="evenodd" clipRule="evenodd"
                  d="M11.75 4.5a2.25 2.25 0 100 4.5 2.25 2.25 0 000-4.5zm-2.652-.402a3.75 3.75 0 115.304 5.304 3.75 3.75 0 01-5.304-5.304zM4.75 8.5a1.25 1.25 0 100 2.5 1.25 1.25 0 000-2.5zm-1.945-.695a2.75 2.75 0 113.89 3.89 2.75 2.75 0 01-3.89-3.89zM18.75 8.5a1.25 1.25 0 100 2.5 1.25 1.25 0 000-2.5zm-1.945-.695a2.75 2.75 0 113.89 3.89 2.75 2.75 0 01-3.89-3.89zM11.75 13.5a4.252 4.252 0 00-3.358 1.644h6.716A4.25 4.25 0 0011.75 13.5zm3.96 3.144L15.928 19H7.572l.218-2.357h7.92zm-8.818-1.971a3.748 3.748 0 00-5.197.904A3.75 3.75 0 001 17.75v2c0 .414.336.75.75.75h20a.75.75 0 00.75-.75v-2a3.75 3.75 0 00-5.892-3.078 5.75 5.75 0 00-9.716 0zM17.5 19H21v-1.25a2.25 2.25 0 00-3.749-1.678c.162.532.249 1.096.249 1.678V19zM6 19v-1.25c0-.582.087-1.146.249-1.678A2.249 2.249 0 002.5 17.75V19H6z"
                  fill={focused ? "url(#paint0_linear)" : "grey"}
            />
            {
                focused && (
                    <Defs>
                        <LinearGradient
                            id="paint0_linear"
                            x1="27.3327"
                            y1="17.4997"
                            x2="-2.61092"
                            y2="12.8332"
                            gradientUnits="userSpaceOnUse"
                        >
                            <Stop stopColor="#9828D3"/>
                            <Stop offset="1" stopColor="#ED6B6A"/>
                        </LinearGradient>
                    </Defs>
                )
            }
        </Svg>
    );
}











