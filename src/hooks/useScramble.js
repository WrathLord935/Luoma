import { useState, useEffect } from 'react';

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()";

export const useScramble = (text, speed = 40) => {
    const [displayText, setDisplayText] = useState(text);
    const [isHovering, setIsHovering] = useState(false);

    useEffect(() => {
        if (!isHovering) {
            setDisplayText(text);
            return;
        }

        let iterations = 0;
        const interval = setInterval(() => {
            setDisplayText(prev =>
                params_scramble(text, iterations)
            );

            if (iterations >= text.length) {
                clearInterval(interval);
            }

            iterations += 1 / 3;
        }, speed);

        return () => clearInterval(interval);
    }, [isHovering, text, speed]);

    const params_scramble = (target, index) => {
        return target
            .split("")
            .map((char, i) => {
                if (i < index) return target[i];
                return CHARS[Math.floor(Math.random() * CHARS.length)];
            })
            .join("");
    };

    return { displayText, play: () => setIsHovering(true), stop: () => setIsHovering(false) };
};

export default useScramble;
