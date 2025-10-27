import React, { useState, useEffect, useRef, useCallback } from "react";
import { HiMagnifyingGlass, HiMiniXMark } from "react-icons/hi2";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  fetchProductsByFilters,
  setFilters,
} from "../../redux/slice/productsSlice";
import axios from "axios";

const SearchBar = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const debounceRef = useRef(null);
  const inputRef = useRef(null);

  // Debounced search for suggestions
  const fetchSuggestions = useCallback(async (term) => {
    if (term.length < 2) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000'}/api/products?search=${encodeURIComponent(term)}&limit=5`
      );
      
      // Extract unique product names and create suggestions
      const productNames = response.data.map(product => product.name);
      const uniqueSuggestions = [...new Set(productNames)].slice(0, 5);
      
      setSuggestions(uniqueSuggestions);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Debounce the search suggestions
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (searchTerm.trim()) {
      debounceRef.current = setTimeout(() => {
        fetchSuggestions(searchTerm);
      }, 300); // 300ms debounce
    } else {
      setSuggestions([]);
    }

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [searchTerm, fetchSuggestions]);

  const handleSearchToggle = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      // Focus input when opening
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 100);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    
    dispatch(setFilters({ search: searchTerm }));
    dispatch(fetchProductsByFilters({ search: searchTerm }));
    navigate(`/collections/all?search=${encodeURIComponent(searchTerm)}`);
    setIsOpen(false);
    setShowSuggestions(false);
  };

  const handleSuggestionClick = (suggestion) => {
    setSearchTerm(suggestion);
    setShowSuggestions(false);
    dispatch(setFilters({ search: suggestion }));
    dispatch(fetchProductsByFilters({ search: suggestion }));
    navigate(`/collections/all?search=${encodeURIComponent(suggestion)}`);
    setIsOpen(false);
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setShowSuggestions(value.length > 0);
  };

  const handleInputFocus = () => {
    if (suggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  const handleInputBlur = () => {
    // Delay hiding suggestions to allow clicking on them
    setTimeout(() => {
      setShowSuggestions(false);
    }, 200);
  };

  return (
    <div
      className={`flex items-center justify-center w-full transition-all duration-300 ${
        isOpen ? "absolute top-0 left-0 w-full bg-white h-24 z-50" : "w-auto"
      }`}
    >
      {isOpen ? (
        <form
          onSubmit={handleSearch}
          className="relative flex justify-center items-center w-full"
        >
          <div className="relative w-1/2">
            <input
              ref={inputRef}
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={handleInputChange}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
              className="bg-gray-100 px-4 py-2 pl-2 pr-12 rounded-lg focus:outline-none w-full placeholder:text-gray-700 focus:ring-2 focus:ring-blue-500"
            />
            
            {/* Loading spinner */}
            {isLoading && (
              <div className="absolute right-10 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
              </div>
            )}
            
            {/* search icon */}
            <button
              type="submit"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-600 hover:text-gray-800"
            >
              <HiMagnifyingGlass className="h-6 w-6" />
            </button>
            
            {/* Suggestions dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="w-full px-4 py-2 text-left hover:bg-gray-100 focus:bg-gray-100 focus:outline-none border-b border-gray-100 last:border-b-0"
                  >
                    <div className="flex items-center">
                      <HiMagnifyingGlass className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-700">{suggestion}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
            
            {/* No suggestions message */}
            {showSuggestions && !isLoading && suggestions.length === 0 && searchTerm.length >= 2 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                <div className="px-4 py-2 text-sm text-gray-500">
                  No products found for "{searchTerm}"
                </div>
              </div>
            )}
          </div>
          
          {/* close icon */}
          <button
            type="button"
            onClick={handleSearchToggle}
            className="absolute right-4 top-1/2 transform -translate-y-0.5 text-gray-600 hover:text-gray-800"
          >
            <HiMiniXMark className="h-6 w-6" />
          </button>
        </form>
      ) : (
        <button className="flex items-center" onClick={handleSearchToggle}>
          <HiMagnifyingGlass className="h-6 w-6 text-gray-700" />
        </button>
      )}
    </div>
  );
};

export default SearchBar;
