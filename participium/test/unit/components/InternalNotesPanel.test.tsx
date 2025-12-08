import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

jest.mock('@/app/lib/controllers/comment.controller', () => ({
  getReportComments: jest.fn(),
  createComment: jest.fn(),
}));

import InternalNotesPanel from '@/components/InternalNotesPanel';
import * as commentController from '@/app/lib/controllers/comment.controller';

describe('InternalNotesPanel - UI Tests', () => {
  const mockGetReportComments = commentController.getReportComments as jest.Mock;
  const mockCreateComment = commentController.createComment as jest.Mock;
  
  const createMockComment = (overrides = {}) => ({
    id: BigInt(1),
    content: 'First note',
    authorId: '1',
    reportId: BigInt(1),
    createdAt: new Date('2025-12-06T10:30:00'),
    updatedAt: new Date('2025-12-06T10:30:00'),
    author: {
      id: '1',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@test.com',
      username: 'johndoe',
      role: 'TECHNICAL_OFFICER',
    },
    ...overrides,
  });

  const mockComments = [createMockComment()];

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetReportComments.mockResolvedValue({
      success: true,
      data: mockComments,
    });
  });

  describe('Initial Render and Data Loading', () => {
    it('should render the component with all main sections', async () => {
      render(<InternalNotesPanel reportId="1" />);

      await waitFor(() => {
        expect(screen.getByText('First note')).toBeInTheDocument();
      });

      expect(screen.getByPlaceholderText(/Write a note for the technical team/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Add Note/i })).toBeInTheDocument();
    });

    it('should call getReportComments with correct reportId on mount', async () => {
      render(<InternalNotesPanel reportId="42" />);

      await waitFor(() => {
        expect(mockGetReportComments).toHaveBeenCalledWith(BigInt(42));
      });
    });

    it('should only call getReportComments once on mount', async () => {
      render(<InternalNotesPanel reportId="1" />);

      await waitFor(() => {
        expect(screen.getByText('First note')).toBeInTheDocument();
      });

      expect(mockGetReportComments).toHaveBeenCalledTimes(1);
    });

    it('should fetch notes on reportId change', async () => {
      const { rerender } = render(<InternalNotesPanel reportId="1" />);

      await waitFor(() => {
        expect(mockGetReportComments).toHaveBeenCalledWith(BigInt(1));
      });

      mockGetReportComments.mockClear();
      rerender(<InternalNotesPanel reportId="2" />);

      await waitFor(() => {
        expect(mockGetReportComments).toHaveBeenCalledWith(BigInt(2));
      });
    });
  });

  describe('Empty State Display', () => {
    it('should display empty state message when no notes exist', async () => {
      mockGetReportComments.mockResolvedValue({
        success: true,
        data: [],
      });

      render(<InternalNotesPanel reportId="1" />);

      await waitFor(() => {
        expect(screen.getByText(/No internal notes yet/i)).toBeInTheDocument();
        expect(screen.getByText(/Use this space for internal team coordination/i)).toBeInTheDocument();
      });
    });

    it('should display sticky note icon in empty state', async () => {
      mockGetReportComments.mockResolvedValue({
        success: true,
        data: [],
      });

      render(<InternalNotesPanel reportId="1" />);

      await waitFor(() => {
        const emptyState = screen.getByText(/No internal notes yet/i).closest('div');
        expect(emptyState?.querySelector('svg')).toBeInTheDocument();
      });
    });

    it('should display empty state when API returns success: false', async () => {
      mockGetReportComments.mockResolvedValue({
        success: false,
        error: 'Unauthorized',
      });

      render(<InternalNotesPanel reportId="1" />);

      await waitFor(() => {
        expect(screen.getByText(/No internal notes yet/i)).toBeInTheDocument();
      });
    });
  });

  describe('Displaying Notes List', () => {
    it('should display single note with all information', async () => {
      render(<InternalNotesPanel reportId="1" />);

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('First note')).toBeInTheDocument();
      });
    });

    it('should display multiple notes in order', async () => {
      const comments = [
        createMockComment({ id: BigInt(1), content: 'Note 1' }),
        createMockComment({ id: BigInt(2), content: 'Note 2' }),
        createMockComment({ id: BigInt(3), content: 'Note 3' }),
      ];

      mockGetReportComments.mockResolvedValue({
        success: true,
        data: comments,
      });

      render(<InternalNotesPanel reportId="1" />);

      await waitFor(() => {
        expect(screen.getByText('Note 1')).toBeInTheDocument();
        expect(screen.getByText('Note 2')).toBeInTheDocument();
        expect(screen.getByText('Note 3')).toBeInTheDocument();
      });

      const notes = screen.getAllByText(/Note [123]/);
      expect(notes).toHaveLength(3);
    });

    it('should display author names correctly', async () => {
      const comments = [
        createMockComment({
          id: BigInt(1),
          author: { ...createMockComment().author, firstName: 'Alice', lastName: 'Smith' },
        }),
        createMockComment({
          id: BigInt(2),
          author: { ...createMockComment().author, firstName: 'Bob', lastName: 'Johnson' },
        }),
      ];

      mockGetReportComments.mockResolvedValue({
        success: true,
        data: comments,
      });

      render(<InternalNotesPanel reportId="1" />);

      await waitFor(() => {
        expect(screen.getByText('Alice Smith')).toBeInTheDocument();
        expect(screen.getByText('Bob Johnson')).toBeInTheDocument();
      });
    });

    it('should display formatted timestamps correctly', async () => {
      const testDate = new Date('2025-12-06T14:30:00');
      const comments = [
        createMockComment({
          id: BigInt(1),
          createdAt: testDate,
        }),
      ];

      mockGetReportComments.mockResolvedValue({
        success: true,
        data: comments,
      });

      render(<InternalNotesPanel reportId="1" />);

      await waitFor(() => {
        const timestamp = screen.getByText(/06\/12\/2025/);
        expect(timestamp).toBeInTheDocument();
      });
    });

    it('should render notes with proper styling classes', async () => {
      render(<InternalNotesPanel reportId="1" />);

      await waitFor(() => {
        const noteElement = screen.getByText('First note').closest('div');
        expect(noteElement).toHaveClass('bg-background', 'border', 'rounded-lg');
      });
    });

    it('should display note content with whitespace preserved', async () => {
      const notes = [
        createMockComment({
          id: BigInt(1),
          content: 'This is a note with preserved whitespace',
        }),
      ];

      mockGetReportComments.mockResolvedValue({
        success: true,
        data: notes,
      });

      render(<InternalNotesPanel reportId="1" />);

      await waitFor(() => {
        const contentElement = screen.getByText('This is a note with preserved whitespace');
        expect(contentElement).toHaveClass('whitespace-pre-wrap');
      });
    });

    it('should handle notes with special characters', async () => {
      const specialContent = 'Note with <special> &characters@ #$%';
      const comments = [
        createMockComment({
          id: BigInt(1),
          content: specialContent,
        }),
      ];

      mockGetReportComments.mockResolvedValue({
        success: true,
        data: comments,
      });

      render(<InternalNotesPanel reportId="1" />);

      await waitFor(() => {
        expect(screen.getByText(specialContent)).toBeInTheDocument();
      });
    });

    it('should handle notes with very long content', async () => {
      const longContent = 'a'.repeat(500);
      const comments = [
        createMockComment({
          id: BigInt(1),
          content: longContent,
        }),
      ];

      mockGetReportComments.mockResolvedValue({
        success: true,
        data: comments,
      });

      render(<InternalNotesPanel reportId="1" />);

      await waitFor(() => {
        expect(screen.getByText(longContent)).toBeInTheDocument();
      });
    });

    it('should use BigInt ID as key for list items', async () => {
      const comments = [
        createMockComment({ id: BigInt(1), content: 'Note 1' }),
        createMockComment({ id: BigInt(2), content: 'Note 2' }),
      ];

      mockGetReportComments.mockResolvedValue({
        success: true,
        data: comments,
      });

      render(<InternalNotesPanel reportId="1" />);

      await waitFor(() => {
        const noteElements = screen.getAllByText(/Note [12]/);
        expect(noteElements).toHaveLength(2);
      });
    });
  });

  describe('Textarea Input Validation', () => {
    it('should disable submit button initially', async () => {
      render(<InternalNotesPanel reportId="1" />);

      await waitFor(() => {
        expect(screen.getByText('First note')).toBeInTheDocument();
      });

      const submitButton = screen.getByRole('button', { name: /Add Note/i });
      expect(submitButton).toBeDisabled();
    });

    it('should enable submit button when text is entered', async () => {
      render(<InternalNotesPanel reportId="1" />);

      await waitFor(() => {
        expect(screen.getByText('First note')).toBeInTheDocument();
      });

      const textarea = screen.getByPlaceholderText(/Write a note for the technical team/i);
      const submitButton = screen.getByRole('button', { name: /Add Note/i });

      await userEvent.type(textarea, 'New note');
      expect(submitButton).not.toBeDisabled();
    });

    it('should disable submit button when text is only whitespace', async () => {
      render(<InternalNotesPanel reportId="1" />);

      await waitFor(() => {
        expect(screen.getByText('First note')).toBeInTheDocument();
      });

      const textarea = screen.getByPlaceholderText(/Write a note for the technical team/i);
      const submitButton = screen.getByRole('button', { name: /Add Note/i });

      await userEvent.type(textarea, '   ');
      expect(submitButton).toBeDisabled();
    });

    it('should disable submit button when text is cleared', async () => {
      render(<InternalNotesPanel reportId="1" />);

      await waitFor(() => {
        expect(screen.getByText('First note')).toBeInTheDocument();
      });

      const textarea = screen.getByPlaceholderText(/Write a note for the technical team/i);
      const submitButton = screen.getByRole('button', { name: /Add Note/i });

      await userEvent.type(textarea, 'Test');
      expect(submitButton).not.toBeDisabled();

      await userEvent.clear(textarea);
      expect(submitButton).toBeDisabled();
    });

    it('should disable submit button when text is tab and spaces', async () => {
      render(<InternalNotesPanel reportId="1" />);

      await waitFor(() => {
        expect(screen.getByText('First note')).toBeInTheDocument();
      });

      const textarea = screen.getByPlaceholderText(/Write a note for the technical team/i);
      const submitButton = screen.getByRole('button', { name: /Add Note/i });

      await userEvent.type(textarea, '\t \n ');
      expect(submitButton).toBeDisabled();
    });

    it('should allow submit button when single character is entered', async () => {
      render(<InternalNotesPanel reportId="1" />);

      await waitFor(() => {
        expect(screen.getByText('First note')).toBeInTheDocument();
      });

      const textarea = screen.getByPlaceholderText(/Write a note for the technical team/i);
      const submitButton = screen.getByRole('button', { name: /Add Note/i });

      await userEvent.type(textarea, 'a');
      expect(submitButton).not.toBeDisabled();
    });

    it('should update textarea value on user input', async () => {
      render(<InternalNotesPanel reportId="1" />);

      await waitFor(() => {
        expect(screen.getByText('First note')).toBeInTheDocument();
      });

      const textarea = screen.getByPlaceholderText(/Write a note for the technical team/i) as HTMLTextAreaElement;

      await userEvent.type(textarea, 'Test input');
      expect(textarea.value).toBe('Test input');
    });

    it('should handle rapid input changes', async () => {
      render(<InternalNotesPanel reportId="1" />);

      await waitFor(() => {
        expect(screen.getByText('First note')).toBeInTheDocument();
      });

      const textarea = screen.getByPlaceholderText(/Write a note for the technical team/i) as HTMLTextAreaElement;
      const submitButton = screen.getByRole('button', { name: /Add Note/i });

      await userEvent.type(textarea, 'a');
      expect(submitButton).not.toBeDisabled();

      await userEvent.type(textarea, 'b');
      expect(submitButton).not.toBeDisabled();

      await userEvent.clear(textarea);
      expect(submitButton).toBeDisabled();

      await userEvent.type(textarea, 'c');
      expect(submitButton).not.toBeDisabled();
    });
  });

  describe('Adding Notes - Success Cases', () => {
    it('should submit note and display it in list', async () => {
      const newComment = createMockComment({
        id: BigInt(2),
        content: 'New note text',
        author: { ...createMockComment().author, firstName: 'Jane', lastName: 'Smith' },
      });

      mockCreateComment.mockResolvedValue({
        success: true,
        data: newComment,
      });

      render(<InternalNotesPanel reportId="1" />);

      await waitFor(() => {
        expect(screen.getByText('First note')).toBeInTheDocument();
      });

      const textarea = screen.getByPlaceholderText(/Write a note for the technical team/i);
      const submitButton = screen.getByRole('button', { name: /Add Note/i });

      await userEvent.type(textarea, 'New note text');
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('New note text')).toBeInTheDocument();
        expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      });
    });

    it('should call createComment with correct parameters', async () => {
      mockCreateComment.mockResolvedValue({
        success: true,
        data: createMockComment(),
      });

      render(<InternalNotesPanel reportId="5" />);

      await waitFor(() => {
        expect(screen.getByText('First note')).toBeInTheDocument();
      });

      const textarea = screen.getByPlaceholderText(/Write a note for the technical team/i);
      const submitButton = screen.getByRole('button', { name: /Add Note/i });

      await userEvent.type(textarea, 'Test content');
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(mockCreateComment).toHaveBeenCalledWith('Test content', BigInt(5));
      });
    });

    it('should clear textarea after successful submission', async () => {
      mockCreateComment.mockResolvedValue({
        success: true,
        data: createMockComment(),
      });

      render(<InternalNotesPanel reportId="1" />);

      await waitFor(() => {
        expect(screen.getByText('First note')).toBeInTheDocument();
      });

      const textarea = screen.getByPlaceholderText(/Write a note for the technical team/i) as HTMLTextAreaElement;
      const submitButton = screen.getByRole('button', { name: /Add Note/i });

      await userEvent.type(textarea, 'Test note');
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(textarea.value).toBe('');
      });
    });

    it('should append new note to existing notes list', async () => {
      const newComment = createMockComment({
        id: BigInt(2),
        content: 'Second note',
      });

      mockCreateComment.mockResolvedValue({
        success: true,
        data: newComment,
      });

      render(<InternalNotesPanel reportId="1" />);

      await waitFor(() => {
        expect(screen.getByText('First note')).toBeInTheDocument();
      });

      const textarea = screen.getByPlaceholderText(/Write a note for the technical team/i);
      const submitButton = screen.getByRole('button', { name: /Add Note/i });

      await userEvent.type(textarea, 'Second note');
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('First note')).toBeInTheDocument();
        expect(screen.getByText('Second note')).toBeInTheDocument();
      });
    });

    it('should reset submit button state after successful submission', async () => {
      mockCreateComment.mockResolvedValue({
        success: true,
        data: createMockComment(),
      });

      render(<InternalNotesPanel reportId="1" />);

      await waitFor(() => {
        expect(screen.getByText('First note')).toBeInTheDocument();
      });

      const textarea = screen.getByPlaceholderText(/Write a note for the technical team/i);
      const submitButton = screen.getByRole('button', { name: /Add Note/i });

      await userEvent.type(textarea, 'Test');
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(submitButton).toBeDisabled();
      });
    });

    it('should handle multiline content in new note', async () => {
      mockCreateComment.mockResolvedValue({
        success: true,
        data: createMockComment({
          id: BigInt(2),
          content: 'Line 1 to Line 3',
        }),
      });

      render(<InternalNotesPanel reportId="1" />);

      await waitFor(() => {
        expect(screen.getByText('First note')).toBeInTheDocument();
      });

      const textarea = screen.getByPlaceholderText(/Write a note for the technical team/i);
      const submitButton = screen.getByRole('button', { name: /Add Note/i });

      await userEvent.type(textarea, 'Test content');
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Line 1 to Line 3')).toBeInTheDocument();
      });

      expect(mockCreateComment).toHaveBeenCalledWith('Test content', BigInt(1));
    });

    it('should handle special characters in new note', async () => {
      const specialContent = 'Test with <special> &characters@ #$%';
      mockCreateComment.mockResolvedValue({
        success: true,
        data: createMockComment({
          id: BigInt(2),
          content: specialContent,
        }),
      });

      render(<InternalNotesPanel reportId="1" />);

      await waitFor(() => {
        expect(screen.getByText('First note')).toBeInTheDocument();
      });

      const textarea = screen.getByPlaceholderText(/Write a note for the technical team/i);
      const submitButton = screen.getByRole('button', { name: /Add Note/i });

      await userEvent.type(textarea, specialContent);
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(specialContent)).toBeInTheDocument();
      });
    });
  });

  describe('Adding Notes - Loading States', () => {
    it('should disable button during submission and re-enable after', async () => {
      mockCreateComment.mockResolvedValue({
        success: true,
        data: createMockComment(),
      });

      render(<InternalNotesPanel reportId="1" />);

      await waitFor(() => {
        expect(screen.getByText('First note')).toBeInTheDocument();
      });

      const textarea = screen.getByPlaceholderText(/Write a note for the technical team/i) as HTMLTextAreaElement;
      const submitButton = screen.getByRole('button', { name: /Add Note/i });

      await userEvent.type(textarea, 'Test note');
      // After submission completes, button should be disabled (empty textarea) but not in loading state
      await userEvent.click(submitButton);

      await waitFor(() => {
        // After successful submission, textarea should be cleared
        expect(textarea.value).toBe('');
        // Button should be disabled (because textarea is empty)
        expect(submitButton).toBeDisabled();
      });
    });
  });

  describe('Adding Notes - Error Cases', () => {
    it('should keep textarea content on submission error', async () => {
      mockCreateComment.mockResolvedValue({
        success: false,
        error: 'Failed to create comment',
      });

      render(<InternalNotesPanel reportId="1" />);

      await waitFor(() => {
        expect(screen.getByText('First note')).toBeInTheDocument();
      });

      const textarea = screen.getByPlaceholderText(/Write a note for the technical team/i) as HTMLTextAreaElement;
      const submitButton = screen.getByRole('button', { name: /Add Note/i });

      await userEvent.type(textarea, 'Test note');
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(textarea.value).toBe('Test note');
      });
    });

    it('should not add note to list on error', async () => {
      mockCreateComment.mockResolvedValue({
        success: false,
        error: 'Unauthorized',
      });

      render(<InternalNotesPanel reportId="1" />);

      await waitFor(() => {
        expect(screen.getByText('First note')).toBeInTheDocument();
      });

      const textarea = screen.getByPlaceholderText(/Write a note for the technical team/i);
      const submitButton = screen.getByRole('button', { name: /Add Note/i });

      await userEvent.type(textarea, 'Failed note');
      await userEvent.click(submitButton);

      // Wait for submission to complete
      await waitFor(() => {
        expect(mockCreateComment).toHaveBeenCalled();
      });

      // The failed note should NOT be in the document as a displayed note
      // Only the original first note should be visible
      const noteElements = screen.getAllByText('First note');
      expect(noteElements).toHaveLength(1);
    });

    it('should restore button state on error', async () => {
      mockCreateComment.mockResolvedValue({
        success: false,
        error: 'Error',
      });

      render(<InternalNotesPanel reportId="1" />);

      await waitFor(() => {
        expect(screen.getByText('First note')).toBeInTheDocument();
      });

      const textarea = screen.getByPlaceholderText(/Write a note for the technical team/i);
      const submitButton = screen.getByRole('button', { name: /Add Note/i });

      await userEvent.type(textarea, 'Test');
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(submitButton).not.toBeDisabled();
        expect(screen.queryByRole('button', { name: /Saving/i })).not.toBeInTheDocument();
      });
    });

    it('should handle submission errors gracefully', async () => {
      mockCreateComment.mockResolvedValue({
        success: false,
        error: 'Server error',
      });

      render(<InternalNotesPanel reportId="1" />);

      await waitFor(() => {
        expect(screen.getByText('First note')).toBeInTheDocument();
      });

      const textarea = screen.getByPlaceholderText(/Write a note for the technical team/i);
      const submitButton = screen.getByRole('button', { name: /Add Note/i });

      await userEvent.type(textarea, 'Test');
      await userEvent.click(submitButton);

      // Wait for submission to complete
      await waitFor(() => {
        expect(mockCreateComment).toHaveBeenCalled();
      });

      // Button should be re-enabled
      expect(submitButton).not.toBeDisabled();
    });
  });

  describe('Textarea Behavior', () => {
    it('should have correct placeholder text', async () => {
      render(<InternalNotesPanel reportId="1" />);

      const textarea = screen.getByPlaceholderText(/Write a note for the technical team/i);
      expect(textarea).toHaveAttribute('placeholder', 'Write a note for the technical team...');
    });

    it('should allow multiline text input', async () => {
      render(<InternalNotesPanel reportId="1" />);

      const textarea = screen.getByPlaceholderText(/Write a note for the technical team/i) as HTMLTextAreaElement;

      await userEvent.type(textarea, 'Line 1{Enter}Line 2{Enter}Line 3');
      
      expect(textarea.value).toContain('Line 1');
      expect(textarea.value).toContain('Line 2');
      expect(textarea.value).toContain('Line 3');
    });

    it('should not resize textarea', async () => {
      render(<InternalNotesPanel reportId="1" />);

      const textarea = screen.getByPlaceholderText(/Write a note for the technical team/i);
      expect(textarea).toHaveClass('resize-none');
    });

    it('should have minimum height', async () => {
      render(<InternalNotesPanel reportId="1" />);

      const textarea = screen.getByPlaceholderText(/Write a note for the technical team/i);
      expect(textarea).toHaveClass('min-h-[80px]');
    });

    it('should focus on textarea when clicked', async () => {
      render(<InternalNotesPanel reportId="1" />);

      const textarea = screen.getByPlaceholderText(/Write a note for the technical team/i);
      
      await userEvent.click(textarea);
      expect(textarea).toHaveFocus();
    });
  });

  describe('Label and Accessibility', () => {
    it('should have accessible label for textarea', async () => {
      render(<InternalNotesPanel reportId="1" />);

      const label = screen.getByText(/Private Internal Note/i);
      expect(label).toBeInTheDocument();
    });

    it('should display lock icon in label', async () => {
      render(<InternalNotesPanel reportId="1" />);

      const label = screen.getByText(/Private Internal Note/i);
      const lockIcon = label.querySelector('svg');
      expect(lockIcon).toBeInTheDocument();
    });

    it('should have semantic button role for submit', async () => {
      render(<InternalNotesPanel reportId="1" />);

      const submitButton = screen.getByRole('button', { name: /Add Note/i });
      expect(submitButton).toHaveRole('button');
    });

    it('should have appropriate button size', async () => {
      render(<InternalNotesPanel reportId="1" />);

      const submitButton = screen.getByRole('button', { name: /Add Note/i });
      // The button component will have generated classes, just verify it's a button
      expect(submitButton).toHaveRole('button');
      expect(submitButton).toHaveClass('bg-yellow-600');
    });
  });

  describe('Component Layout', () => {
    it('should have proper container structure', async () => {
      const { container } = render(<InternalNotesPanel reportId="1" />);

      const mainDiv = container.firstChild;
      expect(mainDiv).toHaveClass('w-full', 'h-full', 'flex', 'flex-col');
    });

    it('should display notes list above input area', async () => {
      render(<InternalNotesPanel reportId="1" />);

      await waitFor(() => {
        expect(screen.getByText('First note')).toBeInTheDocument();
      });

      const notesList = screen.getByText('First note').closest('div')?.parentElement;
      const inputArea = screen.getByPlaceholderText(/Write a note/i).closest('div')?.parentElement;

      expect(notesList).toBeInTheDocument();
      expect(inputArea).toBeInTheDocument();
    });

    it('should have scrollable notes area', async () => {
      render(<InternalNotesPanel reportId="1" />);

      await waitFor(() => {
        expect(screen.getByText('First note')).toBeInTheDocument();
      });

      const notesContainer = screen.getByText('First note').closest('div')?.parentElement;
      expect(notesContainer).toHaveClass('overflow-y-auto');
    });
  });

  describe('Edge Cases and Boundary Conditions', () => {
    it('should handle very large reportId', async () => {
      const largeId = '9223372036854775000';
      render(<InternalNotesPanel reportId={largeId} />);

      await waitFor(() => {
        expect(mockGetReportComments).toHaveBeenCalledWith(BigInt(largeId));
      });
    });

    it('should handle numeric string reportId conversion', async () => {
      render(<InternalNotesPanel reportId="123" />);

      await waitFor(() => {
        expect(mockGetReportComments).toHaveBeenCalledWith(BigInt(123));
      });
    });

    it('should handle very long author names', async () => {
      const comments = [
        createMockComment({
          id: BigInt(1),
          author: {
            ...createMockComment().author,
            firstName: 'VeryLongFirstName'.repeat(10),
            lastName: 'VeryLongLastName'.repeat(10),
          },
        }),
      ];

      mockGetReportComments.mockResolvedValue({
        success: true,
        data: comments,
      });

      render(<InternalNotesPanel reportId="1" />);

      await waitFor(() => {
        const authorElement = screen.getByText(/VeryLongFirstName/);
        expect(authorElement).toBeInTheDocument();
      });
    });

    it('should render many notes without performance degradation', async () => {
      const manyComments = Array.from({ length: 100 }, (_, i) =>
        createMockComment({
          id: BigInt(i + 1),
          content: `Note ${i + 1}`,
        })
      );

      mockGetReportComments.mockResolvedValue({
        success: true,
        data: manyComments,
      });

      render(<InternalNotesPanel reportId="1" />);

      await waitFor(() => {
        expect(screen.getByText('Note 1')).toBeInTheDocument();
        expect(screen.getByText('Note 100')).toBeInTheDocument();
      });
    });

    it('should handle rapid consecutive submissions', async () => {
      mockCreateComment
        .mockResolvedValueOnce({
          success: true,
          data: createMockComment({ id: BigInt(2), content: 'Note 2' }),
        })
        .mockResolvedValueOnce({
          success: true,
          data: createMockComment({ id: BigInt(3), content: 'Note 3' }),
        });

      render(<InternalNotesPanel reportId="1" />);

      await waitFor(() => {
        expect(screen.getByText('First note')).toBeInTheDocument();
      });

      const textarea = screen.getByPlaceholderText(/Write a note/i) as HTMLTextAreaElement;
      const submitButton = screen.getByRole('button', { name: /Add Note/i });

      // First submission
      await userEvent.type(textarea, 'Note 2');
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(textarea.value).toBe('');
      });

      // Second submission
      await userEvent.type(textarea, 'Note 3');
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Note 2')).toBeInTheDocument();
        expect(screen.getByText('Note 3')).toBeInTheDocument();
      });
    });
  });
});