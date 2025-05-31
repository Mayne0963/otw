"use client";

import type React from "react";

import { useState } from "react";
import { Search, X, ChevronDown, ChevronUp } from "lucide-react";
import type {
  RestaurantFilters,
  Category,
  DietaryOption,
  RestaurantFeature,
} from "../../types/restaurant";
import { Button } from "../ui/button";
import { Slider } from "../ui/slider";
import { Badge } from "../ui/badge";

interface AdvancedSearchProps {
  filters: RestaurantFilters;
  setFilters: (filters: RestaurantFilters) => void;
  categories: Category[];
  dietaryOptions: DietaryOption[];
  features: RestaurantFeature[];
  resetFilters: () => void;
}

export default function AdvancedSearch({
  filters,
  setFilters,
  categories,
  dietaryOptions,
  features,
  resetFilters,
}: AdvancedSearchProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [searchQuery, setSearchQuery] = useState(filters.search);
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);

  // Count active filters for the badge
  const countActiveFilters = (currentFilters: RestaurantFilters) => {
    let count = 0;
    if (currentFilters.category !== "all") count++;
    if (currentFilters.priceLevel.length > 0) count++;
    if (currentFilters.partnerOnly) count++;
    if (currentFilters.dietaryOptions.length > 0) count++;
    if (currentFilters.deliveryTimeMax !== null) count++;
    if (currentFilters.distance !== null) count++;
    if (currentFilters.features.length > 0) count++;
    return count;
  };

  // Handle search submission
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters({ ...filters, search: searchQuery });
    const newCount = countActiveFilters({ ...filters, search: searchQuery });
    setActiveFiltersCount(newCount);
  };

  // Handle category change
  const handleCategoryChange = (category: string) => {
    const newFilters = { ...filters, category };
    setFilters(newFilters);
    setActiveFiltersCount(countActiveFilters(newFilters));
  };

  // Handle price level change
  const handlePriceLevelChange = (level: string) => {
    const newPriceLevels = filters.priceLevel.includes(level)
      ? filters.priceLevel.filter((pl) => pl !== level)
      : [...filters.priceLevel, level];

    const newFilters = { ...filters, priceLevel: newPriceLevels };
    setFilters(newFilters);
    setActiveFiltersCount(countActiveFilters(newFilters));
  };

  // Handle dietary options change
  const handleDietaryChange = (option: string) => {
    const newOptions = filters.dietaryOptions.includes(option)
      ? filters.dietaryOptions.filter((o) => o !== option)
      : [...filters.dietaryOptions, option];

    const newFilters = { ...filters, dietaryOptions: newOptions };
    setFilters(newFilters);
    setActiveFiltersCount(countActiveFilters(newFilters));
  };

  // Handle features change
  const handleFeatureChange = (feature: string) => {
    const newFeatures = filters.features.includes(feature)
      ? filters.features.filter((f) => f !== feature)
      : [...filters.features, feature];

    const newFilters = { ...filters, features: newFeatures };
    setFilters(newFilters);
    setActiveFiltersCount(countActiveFilters(newFilters));
  };

  // Handle delivery time change
  const handleDeliveryTimeChange = (value: number[]) => {
    const newFilters = { ...filters, deliveryTimeMax: value[0] || null };
    setFilters(newFilters);
    setActiveFiltersCount(countActiveFilters(newFilters));
  };

  // Handle distance change
  const handleDistanceChange = (value: number[]) => {
    const newFilters = { ...filters, distance: value[0] };
    setFilters(newFilters);
    setActiveFiltersCount(countActiveFilters(newFilters));
  };

  // Handle partner only change
  const handlePartnerOnlyChange = () => {
    const newFilters = { ...filters, partnerOnly: !filters.partnerOnly };
    setFilters(newFilters);
    setActiveFiltersCount(countActiveFilters(newFilters));
  };

  // Handle sort change
  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilters({
      ...filters,
      sortBy: e.target.value as RestaurantFilters["sortBy"],
    });
  };

  // Handle reset
  const handleReset = () => {
    resetFilters();
    setSearchQuery("");
    setActiveFiltersCount(0);
  };

  return (
    <div className="w-full bg-[#111111] border-b border-[#333333] sticky top-20 z-30">
      <div className="container mx-auto px-4 py-4">
        {/* Main Search Bar */}
        <form
          onSubmit={handleSearchSubmit}
          className="relative flex items-center mb-4"
        >
          <div className="relative flex-grow">
            <input
              type="text"
              placeholder="Search for restaurants, cuisines, or dishes..."
              className="w-full pl-10 pr-4 py-3 bg-[#1A1A1A] border border-[#333333] rounded-lg text-white focus:outline-none focus:border-[#FFD700]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={18}
            />
            {searchQuery && (
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                onClick={() => {
                  setSearchQuery("");
                  setFilters({ ...filters, search: "" });
                }}
              >
                <X size={18} />
              </button>
            )}
          </div>
          <Button
            type="submit"
            className="ml-2 bg-[#C1272D] hover:bg-[#A01F24] text-white"
          >
            Search
          </Button>
        </form>

        {/* Quick Filters */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <div className="flex items-center gap-2 mr-4">
            <span className="text-white text-sm">Sort by:</span>
            <select
              className="bg-[#1A1A1A] border border-[#333333] rounded-lg text-white py-2 px-3 focus:outline-none focus:border-[#FFD700]"
              value={filters.sortBy}
              onChange={handleSortChange}
            >
              <option value="recommended">Recommended</option>
              <option value="rating">Highest Rated</option>
              <option value="deliveryTime">Fastest Delivery</option>
              <option value="deliveryFee">Lowest Delivery Fee</option>
              <option value="distance">Nearest</option>
            </select>
          </div>

          <div className="flex flex-wrap gap-2">
            {categories.slice(0, 5).map((category) => (
              <button
                key={category.id}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  filters.category === category.id
                    ? "bg-[#FFD700] text-black"
                    : "bg-[#1A1A1A] text-white hover:bg-[#333333]"
                }`}
                onClick={() => handleCategoryChange(category.id)}
              >
                {category.name}
              </button>
            ))}
            <button
              className="flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-[#1A1A1A] text-white hover:bg-[#333333] transition-colors relative"
              onClick={() => setShowAdvanced(!showAdvanced)}
            >
              More Filters
              {showAdvanced ? (
                <ChevronUp size={14} />
              ) : (
                <ChevronDown size={14} />
              )}
              {activeFiltersCount > 0 && (
                <Badge className="absolute -top-2 -right-2 bg-[#FFD700] text-black text-xs">
                  {activeFiltersCount}
                </Badge>
              )}
            </button>
          </div>
        </div>

        {/* Advanced Filters Panel */}
        {showAdvanced && (
          <div className="bg-[#1A1A1A] rounded-lg border border-[#333333] p-6 mt-2 animate-in fade-in duration-200">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Categories */}
              <div>
                <h3 className="text-white font-medium mb-3">Cuisine Types</h3>
                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                        filters.category === category.id
                          ? "bg-[#FFD700] text-black"
                          : "bg-[#222222] text-white hover:bg-[#333333]"
                      }`}
                      onClick={() => handleCategoryChange(category.id)}
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div>
                <h3 className="text-white font-medium mb-3">Price Range</h3>
                <div className="flex gap-2">
                  {["$", "$$", "$$$", "$$$$"].map((level) => (
                    <button
                      key={level}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                        filters.priceLevel.includes(level)
                          ? "bg-[#FFD700] text-black"
                          : "bg-[#222222] text-white hover:bg-[#333333]"
                      }`}
                      onClick={() => handlePriceLevelChange(level)}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dietary Options */}
              <div>
                <h3 className="text-white font-medium mb-3">Dietary Options</h3>
                <div className="flex flex-wrap gap-2">
                  {dietaryOptions.map((option) => (
                    <button
                      key={option.id}
                      className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                        filters.dietaryOptions.includes(option.id)
                          ? "bg-[#FFD700] text-black"
                          : "bg-[#222222] text-white hover:bg-[#333333]"
                      }`}
                      onClick={() => handleDietaryChange(option.id)}
                    >
                      {option.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Restaurant Features */}
              <div>
                <h3 className="text-white font-medium mb-3">Features</h3>
                <div className="flex flex-wrap gap-2">
                  {features.map((feature) => (
                    <button
                      key={feature.id}
                      className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                        filters.features.includes(feature.id)
                          ? "bg-[#FFD700] text-black"
                          : "bg-[#222222] text-white hover:bg-[#333333]"
                      }`}
                      onClick={() => handleFeatureChange(feature.id)}
                    >
                      {feature.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              {/* Delivery Time */}
              <div>
                <div className="flex justify-between mb-2">
                  <h3 className="text-white font-medium">Max Delivery Time</h3>
                  <span className="text-white">
                    {filters.deliveryTimeMax
                      ? `${filters.deliveryTimeMax} min`
                      : "Any"}
                  </span>
                </div>
                <Slider
                  defaultValue={[filters.deliveryTimeMax || 60]}
                  max={60}
                  step={5}
                  onValueChange={handleDeliveryTimeChange}
                  className="py-4"
                />
                <div className="flex justify-between text-xs text-gray-400">
                  <span>15 min</span>
                  <span>30 min</span>
                  <span>45 min</span>
                  <span>60 min</span>
                </div>
              </div>

              {/* Distance */}
              <div>
                <div className="flex justify-between mb-2">
                  <h3 className="text-white font-medium">Max Distance</h3>
                  <span className="text-white">
                    {filters.distance ? `${filters.distance} miles` : "Any"}
                  </span>
                </div>
                <Slider
                  defaultValue={[filters.distance || 10]}
                  max={10}
                  step={0.5}
                  onValueChange={handleDistanceChange}
                  className="py-4"
                />
                <div className="flex justify-between text-xs text-gray-400">
                  <span>1 mile</span>
                  <span>3 miles</span>
                  <span>5 miles</span>
                  <span>10 miles</span>
                </div>
              </div>
            </div>

            {/* Additional Options */}
            <div className="mt-6 flex flex-wrap items-center gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.partnerOnly}
                  onChange={handlePartnerOnlyChange}
                  className="rounded border-[#333333] text-[#C1272D] focus:ring-[#C1272D]"
                />
                <span className="text-white">OTW Partners Only</span>
              </label>

              <div className="flex gap-4 ml-auto">
                <button
                  className="text-[#FFD700] hover:underline"
                  onClick={handleReset}
                >
                  Reset All Filters
                </button>
                <Button
                  className="bg-[#C1272D] hover:bg-[#A01F24] text-white"
                  onClick={() => setShowAdvanced(false)}
                >
                  Apply Filters
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
