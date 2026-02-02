import { forwardRef } from 'react';
import './header.scss';

/**
 * Переиспользуемый компонент кнопки в стиле header__iconBtn
 * Используется для кнопок логина, избранного, языка и темы
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Содержимое кнопки (иконка или текст)
 * @param {string} [props.className] - Дополнительные CSS классы
 * @param {React.ComponentProps<'button'>} props - Остальные пропсы кнопки
 */
export const HeaderIconButton = forwardRef(({ children, className = '', ...props }, ref) => {
  return (
    <button
      ref={ref}
      type="button"
      className={`header__iconBtn ${className}`.trim()}
      {...props}
    >
      {children}
    </button>
  );
});

HeaderIconButton.displayName = 'HeaderIconButton';
