import React from 'react';
import logoImg from '../assets/TASKTACTICS.png';

const Logo = ({ className = '', size = 'md', showText = true }) => {
    const sizeClasses = {
        xs: 'h-4 w-4',
        sm: 'h-6 w-6',
        md: 'h-8 w-8', // Increased from 6x6
        lg: 'h-12 w-12', // Increased from 10x10
        xl: 'h-24 w-24'
    };

    const textSizes = {
        xs: 'text-[10px]',
        sm: 'text-sm',
        md: 'text-lg',
        lg: 'text-xl',
        xl: 'text-4xl'
    };

    return (
        <div className={`flex items-center gap-4 ${className}`}>
            <img
                src={logoImg}
                alt="TaskTactics Logo"
                className={`${sizeClasses[size] || sizeClasses.md} object-contain transition-all duration-500`}
            />
            {showText && (
                <span className={`font-black text-zinc-100 tracking-[-0.05em] ${textSizes[size] || textSizes.md} uppercase leading-none mt-1.5`}>
                    TaskTactics
                </span>
            )}
        </div>
    );
};

export default Logo;
