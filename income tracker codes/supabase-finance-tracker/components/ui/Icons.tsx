import React from 'react';

type IconProps = React.SVGProps<SVGSVGElement>;

export const CloseIcon: React.FC<IconProps> = ({ className, ...props }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-6 h-6 ${className || ''}`} {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);

export const EyeIcon: React.FC<IconProps> = ({ className, ...props }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-6 h-6 ${className || ''}`} {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.432 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

export const EyeSlashIcon: React.FC<IconProps> = ({ className, ...props }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-6 h-6 ${className || ''}`} {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.243 4.243L6.228 6.228" />
    </svg>
);

export const PlusIcon: React.FC<IconProps> = ({ className, ...props }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-6 h-6 ${className || ''}`} {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
);

export const LogoutIcon: React.FC<IconProps> = ({ className, ...props }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-6 h-6 ${className || ''}`} {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
    </svg>
);

export const SettingsIcon: React.FC<IconProps> = ({ className, ...props }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-6 h-6 ${className || ''}`} {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.343 3.94c.09-.542.56-1.007 1.11-1.226l.052-.022c.51-.223 1.072-.223 1.582 0l.052.022a1.21 1.21 0 011.11 1.226c.09.542-.163 1.11-.644 1.49l-.08.061a1.186 1.186 0 00-1.054 1.846l.003.004a1.186 1.186 0 001.846 1.054l.061-.08c.38-.481.948-.734 1.49-.644.542.09 1.007.56 1.226 1.11l.022.052c.223.51.223 1.072 0 1.582l-.022.052a1.21 1.21 0 01-1.226 1.11c-.542-.09-1.11-.163-1.49-.644l-.08-.061a1.186 1.186 0 00-1.846 1.054l.004.003a1.186 1.186 0 00-1.054 1.846l-.08.061c-.481.38-.734.948-.644 1.49.09.542.56 1.007 1.11 1.226l.052.022c.51.223 1.072.223 1.582 0l.052-.022a1.21 1.21 0 011.11-1.226c.09-.542-.163-1.11-.644-1.49l-.08-.061a1.186 1.186 0 00-1.054-1.846l.003-.004a1.186 1.186 0 001.846-1.054l.061.08c.38.481.948.734 1.49.644.542.09 1.007.56 1.226 1.11l.022.052c.223.51.223 1.072 0 1.582l-.022.052a1.21 1.21 0 01-1.226 1.11c-.542-.09-1.11-.163-1.49-.644l-.08-.061a1.186 1.186 0 00-1.846 1.054l.004.003a1.186 1.186 0 00-1.054 1.846l-.08.061c-.481.38-.734.948-.644 1.49-.09-.542-.56-1.007-1.11-1.226l-.052-.022c-.51-.223-1.072-.223-1.582 0l-.052.022a1.21 1.21 0 01-1.11-1.226c-.09-.542.163-1.11.644-1.49l.08-.061a1.186 1.186 0 001.054-1.846l-.003-.004a1.186 1.186 0 00-1.846-1.054l-.061.08c-.38-.481-.948-.734-1.49-.644-.542-.09-1.007-.56-1.226-1.11l-.022-.052c-.223-.51-.223-1.072 0-1.582l.022-.052a1.21 1.21 0 011.226-1.11c.542.09 1.11.163 1.49.644l.08.061a1.186 1.186 0 001.846-1.054l-.004-.003a1.186 1.186 0 00-1.054-1.846l-.08-.061c-.481-.38-.734-.948-.644-1.49zM12 15.75a3.75 3.75 0 100-7.5 3.75 3.75 0 000 7.5z" />
    </svg>
);

export const EditIcon: React.FC<IconProps> = ({ className, ...props }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-5 h-5 ${className || ''}`} {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
    </svg>
);

export const TrashIcon: React.FC<IconProps> = ({ className, ...props }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-5 h-5 ${className || ''}`} {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
    </svg>
);

export const Spinner: React.FC<IconProps> = ({ className, ...props }) => (
    <svg 
        className={`animate-spin ${className || ''}`} 
        xmlns="http://www.w3.org/2000/svg" 
        fill="none" 
        viewBox="0 0 24 24" 
        {...props}
    >
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);

export const UploadIcon: React.FC<IconProps> = ({ className, ...props }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-6 h-6 ${className || ''}`} {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
    </svg>
);

export const DownloadIcon: React.FC<IconProps> = ({ className, ...props }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-6 h-6 ${className || ''}`} {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
    </svg>
);
