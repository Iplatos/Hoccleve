import React from 'react';
import {Defs, LinearGradient, Path, Stop, Svg, SvgProps} from 'react-native-svg';

interface BalanceRadientIconProps extends SvgProps {
    focused?: boolean;
    width?: number | string;
    height?: number | string;
}

export default function BalanceRadientIcon({focused, width = 20, height = 20, ...props}: BalanceRadientIconProps) {
    return (
        <Svg width={width} height={height} viewBox="0 0 351 72" fill="none" xmlns="http://www.w3.org/2000/svg">
            <Path
                d="M111.246 49C15.5973 20.3697 -16.3156 81 -24 105L351 100.5V-17C329.397 43.3091 214.217 79.8222 111.246 49Z"
                fill="url(#paint0_linear_3595_4809)"/>

                    <Defs>
                        <LinearGradient
                            id="paint0_linear_3595_4809" x1="-138.498" y1="251" x2="463.228" y2="15.716"
                            gradientUnits="userSpaceOnUse"
                        >
                            <Stop stopColor="#F2D9FF"/>
                            <Stop offset="1" stopColor="#F8ECFF"/>
                        </LinearGradient>
                    </Defs>

        </Svg>



    );
}











