#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function loadJsonFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    return null;
  }
}

function collectKeys(obj, prefix = '') {
  const keys = [];
  
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const fullKey = prefix ? `${prefix}.${key}` : key;
      
      if (typeof obj[key] === 'object' && obj[key] !== null) {
        keys.push(...collectKeys(obj[key], fullKey));
      } else {
        keys.push(fullKey);
      }
    }
  }
  
  return keys;
}

function getNestedValue(obj, key) {
  return key.split('.').reduce((current, k) => current && current[k], obj);
}

function checkI18nKeys() {
  const localesDir = path.join(__dirname, '..', 'src', 'i18n', 'locales');
  const languages = ['pt', 'en', 'es'];
  
  
  const translations = {};
  const allKeys = new Set();
  
  for (const lang of languages) {
    const filePath = path.join(localesDir, `${lang}.json`);
    const data = loadJsonFile(filePath);
    
    if (!data) {
      process.exit(1);
    }
    
    translations[lang] = data;
    const keys = collectKeys(data);
    keys.forEach(key => allKeys.add(key));
    
  }
  
  
  let hasErrors = false;
  const missingKeys = {};
  const emptyValues = {};
  const duplicateValues = {};
  
  for (const lang of languages) {
    missingKeys[lang] = [];
    emptyValues[lang] = [];
    
    for (const key of allKeys) {
      const value = getNestedValue(translations[lang], key);
      
      if (value === undefined) {
        missingKeys[lang].push(key);
        hasErrors = true;
      } else if (value === '' || (typeof value === 'string' && value.trim() === '')) {
        emptyValues[lang].push(key);
        hasErrors = true;
      }
    }
  }
  
  for (const lang of languages) {
    const valueMap = new Map();
    duplicateValues[lang] = [];
    
    for (const key of allKeys) {
      const value = getNestedValue(translations[lang], key);
      if (typeof value === 'string' && value.trim() !== '') {
        if (valueMap.has(value)) {
          const existingKey = valueMap.get(value);
          duplicateValues[lang].push({
            value,
            keys: [existingKey, key]
          });
        } else {
          valueMap.set(value, key);
        }
      }
    }
  }
  
  
  if (hasErrors) {
    
    const allMissingKeys = new Set();
    for (const lang of languages) {
      missingKeys[lang].forEach(key => allMissingKeys.add(key));
      emptyValues[lang].forEach(key => allMissingKeys.add(key));
    }
  }
  
  if (hasErrors) {
    process.exit(1);
  }
}

checkI18nKeys();