import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import FilterChips, { type FilterChipOption } from '../FilterChips';

const categories: FilterChipOption[] = [
  { value: 'todos', label: 'Todos' },
  { value: 'comida', label: 'Comida' },
];

const municipalities: FilterChipOption[] = [
  { value: 'todos', label: 'Todos' },
  { value: 'queretaro', label: 'Querétaro' },
];

describe('FilterChips', () => {
  it('propaga cambios de búsqueda y filtros', () => {
    const handleSearch = vi.fn();
    const handleCategory = vi.fn();
    const handleMunicipality = vi.fn();
    const handleClear = vi.fn();

    render(
      <FilterChips
        categories={categories}
        municipalities={municipalities}
        selectedCategory="todos"
        selectedMunicipality="todos"
        searchValue=""
        onSearchChange={handleSearch}
        onCategoryChange={handleCategory}
        onMunicipalityChange={handleMunicipality}
        onClear={handleClear}
      />
    );

    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'cine' } });
    expect(handleSearch).toHaveBeenCalledWith('cine');

    fireEvent.click(screen.getByRole('button', { name: 'Comida' }));
    expect(handleCategory).toHaveBeenCalledWith('comida');

    fireEvent.click(screen.getByRole('button', { name: 'Querétaro' }));
    expect(handleMunicipality).toHaveBeenCalledWith('queretaro');

    fireEvent.click(screen.getByRole('button', { name: /limpiar filtros/i }));
    expect(handleClear).toHaveBeenCalled();
  });
});
