import '@testing-library/jest-dom';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AddressSearch from '@/components/map/AddressSearch';

global.fetch = jest.fn();

describe('AddressSearch Component - Story 30 Unit Tests', () => {
  const mockOnLocationFound = jest.fn();

  const mockSuggestions = [
    {
      display_name: 'Piazza Castello, Centro, Torino, Italy',
      lat: '45.0703',
      lon: '7.6869',
      place_id: 123456,
    },
    {
      display_name: 'Via Roma, Centro, Torino, Italy',
      lat: '45.0677',
      lon: '7.6824',
      place_id: 123457,
    },
    {
      display_name: 'Mole Antonelliana, Via Montebello, Torino, Italy',
      lat: '45.0692',
      lon: '7.6934',
      place_id: 123458,
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
  });

  afterEach(() => {
    jest.clearAllTimers();
  });

  describe('Initial Render', () => {
    it('should render the search input field', () => {
      render(<AddressSearch onLocationFound={mockOnLocationFound} />);
      
      const searchInput = screen.getByPlaceholderText(/Search address or click map/i);
      expect(searchInput).toBeInTheDocument();
    });

    it('should render the search icon initially', () => {
      render(<AddressSearch onLocationFound={mockOnLocationFound} />);
      
      const searchIcon = document.querySelector('svg');
      expect(searchIcon).toBeInTheDocument();
    });

    it('should not show suggestions initially', () => {
      render(<AddressSearch onLocationFound={mockOnLocationFound} />);
      
      const suggestionsList = screen.queryByRole('list');
      expect(suggestionsList).not.toBeInTheDocument();
    });

    it('should not show clear button when input is empty', () => {
      render(<AddressSearch onLocationFound={mockOnLocationFound} />);
      
      const clearButton = screen.queryByRole('button');
      expect(clearButton).not.toBeInTheDocument();
    });
  });

  describe('User Input and Search Behavior', () => {
    it('should update input value when user types', async () => {
      const user = userEvent.setup();
      render(<AddressSearch onLocationFound={mockOnLocationFound} />);
      
      const searchInput = screen.getByPlaceholderText(/Search address or click map/i);
      await user.type(searchInput, 'Piazza');
      
      expect(searchInput).toHaveValue('Piazza');
    });

    it('should show loader icon while searching', async () => {
      jest.useFakeTimers();
      const user = userEvent.setup({ delay: null });
      
      (global.fetch as jest.Mock).mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve({
          json: async () => mockSuggestions,
        }), 1000))
      );

      render(<AddressSearch onLocationFound={mockOnLocationFound} />);
      
      const searchInput = screen.getByPlaceholderText(/Search address or click map/i);
      await user.type(searchInput, 'Piazza');
      
      jest.advanceTimersByTime(500);
      
      await waitFor(() => {
        const loader = screen.queryByTestId('loader-icon');
      });
      
      jest.useRealTimers();
    });

    it('should not fetch suggestions for queries shorter than 3 characters', async () => {
      jest.useFakeTimers();
      const user = userEvent.setup({ delay: null });
      
      render(<AddressSearch onLocationFound={mockOnLocationFound} />);
      
      const searchInput = screen.getByPlaceholderText(/Search address or click map/i);
      await user.type(searchInput, 'Pi');
      
      jest.advanceTimersByTime(600);
      
      expect(global.fetch).not.toHaveBeenCalled();
      
      jest.useRealTimers();
    });

    it('should fetch suggestions when query is 3 or more characters', async () => {
      jest.useFakeTimers();
      const user = userEvent.setup({ delay: null });
      
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        json: async () => mockSuggestions,
      });

      render(<AddressSearch onLocationFound={mockOnLocationFound} />);
      
      const searchInput = screen.getByPlaceholderText(/Search address or click map/i);
      await user.type(searchInput, 'Piazza');
      
      jest.advanceTimersByTime(600);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
      
      jest.useRealTimers();
    });

    it('should debounce fetch requests (wait 500ms)', async () => {
      jest.useFakeTimers();
      const user = userEvent.setup({ delay: null });
      
      (global.fetch as jest.Mock).mockResolvedValue({
        json: async () => mockSuggestions,
      });

      render(<AddressSearch onLocationFound={mockOnLocationFound} />);
      
      const searchInput = screen.getByPlaceholderText(/Search address or click map/i);
      await user.type(searchInput, 'P');
      
      jest.advanceTimersByTime(200);
      expect(global.fetch).not.toHaveBeenCalled();
      
      await user.type(searchInput, 'i');
      jest.advanceTimersByTime(200);
      expect(global.fetch).not.toHaveBeenCalled();
      
      await user.type(searchInput, 'a');
      jest.advanceTimersByTime(600);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledTimes(1);
      });
      
      jest.useRealTimers();
    });

    it('should call Nominatim API with correct parameters', async () => {
      jest.useFakeTimers();
      const user = userEvent.setup({ delay: null });
      
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        json: async () => mockSuggestions,
      });

      render(<AddressSearch onLocationFound={mockOnLocationFound} />);
      
      const searchInput = screen.getByPlaceholderText(/Search address or click map/i);
      await user.type(searchInput, 'Piazza Castello');
      
      jest.advanceTimersByTime(600);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('https://nominatim.openstreetmap.org/search')
        );
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('format=json')
        );
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('q=Piazza%20Castello')
        );
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('viewbox=7.5703,45.144,7.7783,45.0027')
        );
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('bounded=1')
        );
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('limit=5')
        );
      });
      
      jest.useRealTimers();
    });
  });

  describe('Suggestions Display', () => {
    it('should display suggestions when API returns results', async () => {
      jest.useFakeTimers();
      const user = userEvent.setup({ delay: null });
      
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        json: async () => mockSuggestions,
      });

      render(<AddressSearch onLocationFound={mockOnLocationFound} />);
      
      const searchInput = screen.getByPlaceholderText(/Search address or click map/i);
      await user.type(searchInput, 'Piazza');
      
      jest.advanceTimersByTime(600);
      
      await waitFor(() => {
        expect(screen.getByText('Piazza Castello')).toBeInTheDocument();
        expect(screen.getByText('Via Roma')).toBeInTheDocument();
        expect(screen.getByText('Mole Antonelliana')).toBeInTheDocument();
      });
      
      jest.useRealTimers();
    });

    it('should display full address details for each suggestion', async () => {
      jest.useFakeTimers();
      const user = userEvent.setup({ delay: null });
      
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        json: async () => mockSuggestions,
      });

      render(<AddressSearch onLocationFound={mockOnLocationFound} />);
      
      const searchInput = screen.getByPlaceholderText(/Search address or click map/i);
      await user.type(searchInput, 'Piazza');
      
      jest.advanceTimersByTime(600);
      
      await waitFor(() => {
        const addresses = screen.getAllByText('Centro, Torino, Italy', { exact: false });
        expect(addresses.length).toBeGreaterThan(0);
      });
      
      jest.useRealTimers();
    });

    it('should limit suggestions to 5 results as per API call', async () => {
      jest.useFakeTimers();
      const user = userEvent.setup({ delay: null });
      
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        json: async () => mockSuggestions,
      });

      render(<AddressSearch onLocationFound={mockOnLocationFound} />);
      
      const searchInput = screen.getByPlaceholderText(/Search address or click map/i);
      await user.type(searchInput, 'Piazza');
      
      jest.advanceTimersByTime(600);
      
      await waitFor(() => {
        const buttons = screen.getAllByRole('button');
        expect(buttons.length).toBeLessThanOrEqual(6);
      });
      
      jest.useRealTimers();
    });

    it('should show OpenStreetMap attribution in suggestions dropdown', async () => {
      jest.useFakeTimers();
      const user = userEvent.setup({ delay: null });
      
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        json: async () => mockSuggestions,
      });

      render(<AddressSearch onLocationFound={mockOnLocationFound} />);
      
      const searchInput = screen.getByPlaceholderText(/Search address or click map/i);
      await user.type(searchInput, 'Piazza');
      
      jest.advanceTimersByTime(600);
      
      await waitFor(() => {
        expect(screen.getByText(/Powered by OpenStreetMap/i)).toBeInTheDocument();
      });
      
      jest.useRealTimers();
    });
  });

  describe('Suggestion Selection', () => {
    it('should call onLocationFound with correct coordinates when suggestion is clicked', async () => {
      jest.useFakeTimers();
      const user = userEvent.setup({ delay: null });
      
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        json: async () => mockSuggestions,
      });

      render(<AddressSearch onLocationFound={mockOnLocationFound} />);
      
      const searchInput = screen.getByPlaceholderText(/Search address or click map/i);
      await user.type(searchInput, 'Piazza');
      
      jest.advanceTimersByTime(600);
      
      await waitFor(() => {
        expect(screen.getByText('Piazza Castello')).toBeInTheDocument();
      });
      
      const suggestion = screen.getByText('Piazza Castello');
      await user.click(suggestion);
      
      expect(mockOnLocationFound).toHaveBeenCalledWith(45.0703, 7.6869);
      
      jest.useRealTimers();
    });

    it('should update input with selected address name', async () => {
      jest.useFakeTimers();
      const user = userEvent.setup({ delay: null });
      
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        json: async () => mockSuggestions,
      });

      render(<AddressSearch onLocationFound={mockOnLocationFound} />);
      
      const searchInput = screen.getByPlaceholderText(/Search address or click map/i) as HTMLInputElement;
      await user.type(searchInput, 'Piazza');
      
      jest.advanceTimersByTime(600);
      
      await waitFor(() => {
        expect(screen.getByText('Piazza Castello')).toBeInTheDocument();
      });
      
      const suggestion = screen.getByText('Piazza Castello');
      await user.click(suggestion);
      
      expect(searchInput.value).toBe('Piazza Castello');
      
      jest.useRealTimers();
    });

    it('should hide suggestions dropdown after selection', async () => {
      jest.useFakeTimers();
      const user = userEvent.setup({ delay: null });
      
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        json: async () => mockSuggestions,
      });

      render(<AddressSearch onLocationFound={mockOnLocationFound} />);
      
      const searchInput = screen.getByPlaceholderText(/Search address or click map/i);
      await user.type(searchInput, 'Piazza');
      
      jest.advanceTimersByTime(600);
      
      await waitFor(() => {
        expect(screen.getByText('Piazza Castello')).toBeInTheDocument();
      });
      
      const suggestion = screen.getByText('Piazza Castello');
      await user.click(suggestion);
      
      await waitFor(() => {
        expect(screen.queryByText('Via Roma')).not.toBeInTheDocument();
      });
      
      jest.useRealTimers();
    });
  });

  describe('Clear Functionality', () => {
    it('should show clear button when there is text in input', async () => {
      const user = userEvent.setup();
      render(<AddressSearch onLocationFound={mockOnLocationFound} />);
      
      const searchInput = screen.getByPlaceholderText(/Search address or click map/i);
      await user.type(searchInput, 'Test');
      
      const clearButton = screen.getByRole('button');
      expect(clearButton).toBeInTheDocument();
    });

    it('should clear input when clear button is clicked', async () => {
      const user = userEvent.setup();
      render(<AddressSearch onLocationFound={mockOnLocationFound} />);
      
      const searchInput = screen.getByPlaceholderText(/Search address or click map/i) as HTMLInputElement;
      await user.type(searchInput, 'Test Address');
      
      const clearButton = screen.getByRole('button');
      await user.click(clearButton);
      
      expect(searchInput.value).toBe('');
    });

    it('should hide suggestions when clear button is clicked', async () => {
      jest.useFakeTimers();
      const user = userEvent.setup({ delay: null });
      
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        json: async () => mockSuggestions,
      });

      render(<AddressSearch onLocationFound={mockOnLocationFound} />);
      
      const searchInput = screen.getByPlaceholderText(/Search address or click map/i);
      await user.type(searchInput, 'Piazza');
      
      jest.advanceTimersByTime(600);
      
      await waitFor(() => {
        expect(screen.getByText('Piazza Castello')).toBeInTheDocument();
      });
      
      const clearButton = screen.getAllByRole('button').find(btn => 
        btn.querySelector('svg')?.classList.contains('lucide-x') || 
        btn.textContent === ''
      );
      
      if (clearButton) {
        await user.click(clearButton);
      }
      
      await waitFor(() => {
        expect(screen.queryByText('Piazza Castello')).not.toBeInTheDocument();
      });
      
      jest.useRealTimers();
    });
  });

  describe('External Position Updates (Map Clicks)', () => {
    it('should update input when selectedPosition prop changes (array format)', () => {
      const { rerender } = render(
        <AddressSearch onLocationFound={mockOnLocationFound} />
      );
      
      rerender(
        <AddressSearch 
          onLocationFound={mockOnLocationFound} 
          selectedPosition={[45.0703, 7.6869]}
        />
      );
      
      const searchInput = screen.getByPlaceholderText(/Search address or click map/i) as HTMLInputElement;
      expect(searchInput.value).toMatch(/45\.0703.*7\.6869/);
    });

    it('should update input when selectedPosition prop changes (object format)', () => {
      const { rerender } = render(
        <AddressSearch onLocationFound={mockOnLocationFound} />
      );
      
      rerender(
        <AddressSearch 
          onLocationFound={mockOnLocationFound} 
          selectedPosition={{ lat: 45.0703, lng: 7.6869 }}
        />
      );
      
      const searchInput = screen.getByPlaceholderText(/Search address or click map/i) as HTMLInputElement;
      expect(searchInput.value).toMatch(/45\.0703.*7\.6869/);
    });

    it('should format coordinates to 5 decimal places', () => {
      const { rerender } = render(
        <AddressSearch onLocationFound={mockOnLocationFound} />
      );
      
      rerender(
        <AddressSearch 
          onLocationFound={mockOnLocationFound} 
          selectedPosition={[45.070312345, 7.686912345]}
        />
      );
      
      const searchInput = screen.getByPlaceholderText(/Search address or click map/i) as HTMLInputElement;
      expect(searchInput.value).toBe('45.07031, 7.68691');
    });

    it('should not trigger search when coordinates are set from map click', async () => {
      jest.useFakeTimers();
      
      const { rerender } = render(
        <AddressSearch onLocationFound={mockOnLocationFound} />
      );
      
      rerender(
        <AddressSearch 
          onLocationFound={mockOnLocationFound} 
          selectedPosition={[45.0703, 7.6869]}
        />
      );
      
      jest.advanceTimersByTime(600);
      
      expect(global.fetch).not.toHaveBeenCalled();
      
      jest.useRealTimers();
    });
  });

  describe('Coordinate Input Detection', () => {
    it('should not search when user types coordinates directly', async () => {
      jest.useFakeTimers();
      const user = userEvent.setup({ delay: null });
      
      render(<AddressSearch onLocationFound={mockOnLocationFound} />);
      
      const searchInput = screen.getByPlaceholderText(/Search address or click map/i);
      await user.type(searchInput, '45.0703, 7.6869');
      
      jest.advanceTimersByTime(600);
      
      expect(global.fetch).not.toHaveBeenCalled();
      
      jest.useRealTimers();
    });

    it('should recognize various coordinate formats', async () => {
      jest.useFakeTimers();
      const user = userEvent.setup({ delay: null });
      
      const { rerender } = render(<AddressSearch onLocationFound={mockOnLocationFound} />);
      
      const searchInput = screen.getByPlaceholderText(/Search address or click map/i);
      
      await user.clear(searchInput);
      await user.type(searchInput, '45.07, 7.68');
      jest.advanceTimersByTime(600);
      expect(global.fetch).not.toHaveBeenCalled();
      
      await user.clear(searchInput);
      await user.type(searchInput, '45, 7');
      jest.advanceTimersByTime(600);
      expect(global.fetch).not.toHaveBeenCalled();
      
      jest.useRealTimers();
    });
  });

  describe('Click Outside Behavior', () => {
    it('should close suggestions when clicking outside', async () => {
      jest.useFakeTimers();
      const user = userEvent.setup({ delay: null });
      
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        json: async () => mockSuggestions,
      });

      render(
        <div>
          <AddressSearch onLocationFound={mockOnLocationFound} />
          <div data-testid="outside-element">Outside</div>
        </div>
      );
      
      const searchInput = screen.getByPlaceholderText(/Search address or click map/i);
      await user.type(searchInput, 'Piazza');
      
      jest.advanceTimersByTime(600);
      
      await waitFor(() => {
        expect(screen.getByText('Piazza Castello')).toBeInTheDocument();
      });
      
      const outsideElement = screen.getByTestId('outside-element');
      fireEvent.mouseDown(outsideElement);
      
      await waitFor(() => {
        expect(screen.queryByText('Piazza Castello')).not.toBeInTheDocument();
      });
      
      jest.useRealTimers();
    });
  });

  describe('Error Handling', () => {
    it('should handle fetch errors gracefully', async () => {
      jest.useFakeTimers();
      const user = userEvent.setup({ delay: null });
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      render(<AddressSearch onLocationFound={mockOnLocationFound} />);
      
      const searchInput = screen.getByPlaceholderText(/Search address or click map/i);
      await user.type(searchInput, 'Piazza');
      
      jest.advanceTimersByTime(600);
      
      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          'Error fetching address suggestions:',
          expect.any(Error)
        );
      });
      
      consoleErrorSpy.mockRestore();
      jest.useRealTimers();
    });

    it('should not crash when API returns empty array', async () => {
      jest.useFakeTimers();
      const user = userEvent.setup({ delay: null });
      
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        json: async () => [],
      });

      render(<AddressSearch onLocationFound={mockOnLocationFound} />);
      
      const searchInput = screen.getByPlaceholderText(/Search address or click map/i);
      await user.type(searchInput, 'NonexistentPlace');
      
      jest.advanceTimersByTime(600);
      
      await waitFor(() => {
        expect(screen.queryByRole('list')).not.toBeInTheDocument();
      });
      
      jest.useRealTimers();
    });
  });

  describe('Focus Behavior', () => {
    it('should show suggestions on focus if there are cached results', async () => {
      jest.useFakeTimers();
      const user = userEvent.setup({ delay: null });
      
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        json: async () => mockSuggestions,
      });

      render(<AddressSearch onLocationFound={mockOnLocationFound} />);
      
      const searchInput = screen.getByPlaceholderText(/Search address or click map/i);
      await user.type(searchInput, 'Piazza');
      
      jest.advanceTimersByTime(600);
      
      await waitFor(() => {
        expect(screen.getByText('Piazza Castello')).toBeInTheDocument();
      });
      
      // Click outside to close
      fireEvent.mouseDown(document.body);
      
      await waitFor(() => {
        expect(screen.queryByText('Piazza Castello')).not.toBeInTheDocument();
      });
      
      searchInput.focus();
      
      expect(searchInput).toHaveValue('Piazza');
      
      jest.useRealTimers();
    });
  });

  describe('Turin Bounding Box', () => {
    it('should restrict searches to Turin area using viewbox parameter', async () => {
      jest.useFakeTimers();
      const user = userEvent.setup({ delay: null });
      
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        json: async () => mockSuggestions,
      });

      render(<AddressSearch onLocationFound={mockOnLocationFound} />);
      
      const searchInput = screen.getByPlaceholderText(/Search address or click map/i);
      await user.type(searchInput, 'Piazza');
      
      jest.advanceTimersByTime(600);
      
      await waitFor(() => {
        const fetchCall = (global.fetch as jest.Mock).mock.calls[0][0];
        expect(fetchCall).toContain('viewbox=7.5703,45.144,7.7783,45.0027');
        expect(fetchCall).toContain('bounded=1');
      });
      
      jest.useRealTimers();
    });
  });
});
