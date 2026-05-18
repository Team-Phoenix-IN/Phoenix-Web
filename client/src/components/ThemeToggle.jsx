import { useTheme } from '../context/ThemeContext';
import { SunIcon, MoonIcon } from './icons/SvgIcons';

export default function ThemeToggle({ id, className }) {
    const { isLight, toggleTheme } = useTheme();

    return (
        <label className={`theme-switch ${className || ''}`} title="Toggle Theme">
            <input
                type="checkbox"
                id={id}
                checked={isLight}
                onChange={toggleTheme}
            />
            <span className="slider">
                <SunIcon />
                <MoonIcon />
            </span>
        </label>
    );
}
