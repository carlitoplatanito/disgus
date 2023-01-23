import { useState } from 'react';
import { classNames } from '../helpers/utils';


export default function Button({ children, Component = 'button', variant, className, ...props }) {

    let classes = ['rounded'];

    switch (variant) {
        case 'primary':
            classes.push('py-2', 'px-4', 'whitespace-nowrap', 'bg-black', 'text-white', 'font-bold');
            break;
        case 'secondary':
            classes.push('py-1', 'px-2', 'hover:ring', 'hover:ring-gray-300');
            break;
        default:
            classes.push('');
            break;
    }

    if (className) {
        classes.push(className);
    }

    return <Component className={classes.join(' ')} {...props}>{children}</Component>
    
}