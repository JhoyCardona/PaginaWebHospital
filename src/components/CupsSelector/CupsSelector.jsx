import React, { useState, useEffect, useCallback } from 'react';
import CupsService from '../../services/cupsService';

const CupsSelector = ({ 
  tipo, 
  selectedItems = [], 
  onSelectionChange, 
  placeholder = "Buscar códigos CUPS...",
  especialidad = null 
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  const loadSuggestions = useCallback(async () => {
    setIsLoading(true);
    try {
      const suggestionsCodes = await CupsService.getSuggestionsBySpecialty(especialidad);
      const codes = suggestionsCodes[tipo] || [];
      
      const suggestionsData = [];
      for (const code of codes) {
        const codeData = await CupsService.getCupsByCodigo(code);
        if (codeData) {
          suggestionsData.push(codeData);
        }
      }
      
      setSuggestions(suggestionsData);
    } catch {
      // Error cargando sugerencias
    }
    setIsLoading(false);
  }, [especialidad, tipo]);

  const loadInitialData = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await CupsService.getCupsByType(tipo);
      setSuggestions(data.slice(0, 10)); // Mostrar solo los primeros 10
    } catch {
      // Error cargando datos iniciales
    }
    setIsLoading(false);
  }, [tipo]);

  const searchCups = useCallback(async () => {
    setIsLoading(true);
    try {
      const results = await CupsService.searchCups(tipo, searchQuery);
      setSearchResults(results);
      setShowDropdown(true);
    } catch {
      // Error en búsqueda
    }
    setIsLoading(false);
  }, [tipo, searchQuery]);

  useEffect(() => {
    // Cargar sugerencias basadas en especialidad
    if (especialidad) {
      loadSuggestions();
    } else {
      loadInitialData();
    }
  }, [especialidad, loadSuggestions, loadInitialData]);

  useEffect(() => {
    // Buscar cuando cambie la query
    if (searchQuery.length >= 2) {
      searchCups();
    } else {
      setSearchResults([]);
      // Mostrar sugerencias cuando no hay búsqueda
      if (suggestions.length === 0) {
        if (especialidad) {
          loadSuggestions();
        } else {
          loadInitialData();
        }
      }
    }
  }, [searchQuery, searchCups, suggestions.length, especialidad, loadSuggestions, loadInitialData]);

  const handleItemSelect = (item) => {
    const isSelected = selectedItems.some(selected => selected.codigo === item.codigo);
    
    let newSelection;
    if (isSelected) {
      newSelection = selectedItems.filter(selected => selected.codigo !== item.codigo);
    } else {
      newSelection = [...selectedItems, item];
    }
    
    onSelectionChange(newSelection);
    setSearchQuery('');
    setShowDropdown(false);
  };

  const handleRemoveItem = (codigo) => {
    const newSelection = selectedItems.filter(item => item.codigo !== codigo);
    onSelectionChange(newSelection);
  };

  const displayResults = searchQuery.length >= 2 ? searchResults : suggestions;

  return (
    <div className="cups-selector">
      <div className="search-container">
        <input
          type="text"
          className="form-control"
          placeholder={placeholder}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => setShowDropdown(true)}
        />
        
        {isLoading && (
          <div className="loading-indicator">
            <small className="text-muted">Buscando...</small>
          </div>
        )}
        
        {showDropdown && displayResults.length > 0 && (
          <div className="cups-dropdown">
            <div className="dropdown-header">
              {searchQuery.length >= 2 ? 'Resultados de búsqueda:' : 'Sugerencias:'}
            </div>
            {displayResults.map((item) => {
              const isSelected = selectedItems.some(selected => selected.codigo === item.codigo);
              return (
                <div
                  key={item.codigo}
                  className={`dropdown-item ${isSelected ? 'selected' : ''}`}
                  onClick={() => handleItemSelect(item)}
                >
                  <div className="item-code">{item.codigo}</div>
                  <div className="item-description">{item.descripcion}</div>
                  {isSelected && <div className="selected-indicator">✓</div>}
                </div>
              );
            })}
          </div>
        )}
      </div>
      
      {selectedItems.length > 0 && (
        <div className="selected-items">
          <div className="selected-header">Códigos seleccionados:</div>
          {selectedItems.map((item) => (
            <div key={item.codigo} className="selected-item">
              <span className="item-info">
                <strong>{item.codigo}</strong> - {item.descripcion}
              </span>
              <button
                type="button"
                className="remove-btn"
                onClick={() => handleRemoveItem(item.codigo)}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
      
      {/* Cerrar dropdown al hacer clic fuera */}
      {showDropdown && (
        <div 
          className="dropdown-backdrop" 
          onClick={() => setShowDropdown(false)}
        />
      )}
    </div>
  );
};

export default CupsSelector;