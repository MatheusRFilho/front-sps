import React from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { LanguageOption } from '../../types';

interface LanguageSelectProps {
  currentLanguage: string;
  onChange: (language: string) => void;
  disabled?: boolean;
}

const SelectContainer = styled.div`
  position: relative;
  display: inline-block;
`;

const Select = styled.select`
  appearance: none;
  background: none;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  padding-right: ${({ theme }) => theme.spacing.xl};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.text};
  background-color: ${({ theme }) => theme.colors.background};
  cursor: pointer;
  min-width: 120px;
  
  &:hover {
    background-color: ${({ theme }) => theme.colors.surface};
    border-color: ${({ theme }) => theme.colors.primary};
  }
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.primary}33;
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const SelectArrow = styled.div`
  position: absolute;
  right: ${({ theme }) => theme.spacing.sm};
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
`;

const Option = styled.option`
  background-color: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.text};
  padding: ${({ theme }) => theme.spacing.sm};
`;

const languages: LanguageOption[] = [
  { 
    code: 'pt', 
    name: 'Português', 
    flag: '🇧🇷',
    nativeName: 'Português'
  },
  { 
    code: 'en', 
    name: 'English', 
    flag: '🇺🇸',
    nativeName: 'English'
  },
  { 
    code: 'es', 
    name: 'Español', 
    flag: '🇪🇸',
    nativeName: 'Español'
  },
];

export const LanguageSelect: React.FC<LanguageSelectProps> = ({
  currentLanguage,
  onChange,
  disabled = false,
}) => {
  const { t } = useTranslation();
  
  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(event.target.value);
  };

  return (
    <SelectContainer>
      <Select
        value={currentLanguage}
        onChange={handleChange}
        disabled={disabled}
        title={t('language.changeLanguage', 'Alterar idioma')}
        aria-label={t('language.changeLanguage', 'Alterar idioma')}
      >
        {languages.map((language) => (
          <Option key={language.code} value={language.code}>
            {language.flag} {language.nativeName}
          </Option>
        ))}
      </Select>
      <SelectArrow>▼</SelectArrow>
    </SelectContainer>
  );
};