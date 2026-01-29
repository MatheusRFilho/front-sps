import React from 'react';
import styled from 'styled-components';
import { ThemeMode } from '../../types';

interface ThemeOption {
  value: ThemeMode;
  label: string;
  icon: string;
}

interface ThemeSelectProps {
  currentTheme: ThemeMode;
  onChange: (theme: ThemeMode) => void;
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

const themes: ThemeOption[] = [
  { value: 'light', label: 'Claro', icon: '☀️' },
  { value: 'dark', label: 'Escuro', icon: '🌙' },
  { value: 'system', label: 'Sistema', icon: '🔄' },
];

export const ThemeSelect: React.FC<ThemeSelectProps> = ({
  currentTheme,
  onChange,
  disabled = false,
}) => {
  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(event.target.value as ThemeMode);
  };

  return (
    <SelectContainer>
      <Select
        value={currentTheme}
        onChange={handleChange}
        disabled={disabled}
        title="Selecionar tema"
      >
        {themes.map((theme) => (
          <Option key={theme.value} value={theme.value}>
            {theme.icon} {theme.label}
          </Option>
        ))}
      </Select>
      <SelectArrow>▼</SelectArrow>
    </SelectContainer>
  );
};