import React from 'react';
import {Path, Svg, SvgProps} from 'react-native-svg';

interface ArrowRightIconProps extends SvgProps {
    focused?: boolean;
    width?: number;
    height?: number;
}

export default function ArrowRightIcon({focused, width = 20, height = 20, ...props}: ArrowRightIconProps) {
    return (
        <Svg width={width} height={height} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <Path fillRule="evenodd" clipRule="evenodd"
                  d="M12.1086 9.55804C12.3526 9.80212 12.3526 10.1978 12.1086 10.4419L7.9419 14.6086C7.69782 14.8527 7.30209 14.8527 7.05802 14.6086C6.81394 14.3645 6.81394 13.9688 7.05802 13.7247L10.7827 9.99998L7.05802 6.27525C6.81394 6.03118 6.81394 5.63545 7.05802 5.39137C7.30209 5.14729 7.69782 5.14729 7.9419 5.39137L12.1086 9.55804Z"
                  fill={props.color ? props.color : "#2B2D3E"} />
        </Svg>

    );
}











