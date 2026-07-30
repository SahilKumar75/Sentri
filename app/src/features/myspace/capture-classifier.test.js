import { classifyCapture } from './capture-classifier';

describe('Capture Classifier', () => {
  describe('ML Classification', () => {
    test('classifies note content', () => {
      const content = 'This is a personal note about my thoughts';
      const result = classifyCapture(content);
      expect(result.category).toBe('note');
    });

    test('classifies timetable content', () => {
      const content = 'Meeting at 3pm with team for project review';
      const result = classifyCapture(content);
      expect(result.category).toBe('timetable');
    });

    test('classifies screenshot references', () => {
      const content = 'Screenshot_2023-01-01_12-00-00.png';
      const result = classifyCapture(content);
      expect(result.category).toBe('screenshot');
    });

    test('classifies link content', () => {
      const content = 'Check out this article: https://example.com';
      const result = classifyCapture(content);
      expect(result.category).toBe('link');
    });

    test('classifies file attachments', () => {
      const content = 'document.pdf';
      const result = classifyCapture(content);
      expect(result.category).toBe('file');
    });

    test('classifies study material', () => {
      const content = 'Chapter 5 notes for mathematics exam';
      const result = classifyCapture(content);
      expect(result.category).toBe('study material');
    });
  });

  describe('Fallback Rules', () => {
    test('uses URL pattern fallback', () => {
      const content = 'Visit https://github.com for code repositories';
      const result = classifyCapture(content);
      expect(result.category).toBe('link');
    });

    test('uses file extension fallback', () => {
      const content = 'presentation.pptx';
      const result = classifyCapture(content);
      expect(result.category).toBe('file');
    });

    test('uses screenshot pattern fallback', () => {
      const content = 'Screen Shot 2023-12-25 at 14.30.45.png';
      const result = classifyCapture(content);
      expect(result.category).toBe('screenshot');
    });

    test('defaults to note for unknown content', () => {
      const content = 'Random text without clear pattern';
      const result = classifyCapture(content);
      expect(result.category).toBe('note');
    });
  });

  describe('Myspace Capture Fixtures', () => {
    test('handles typical note capture', () => {
      const content = 'Remember to complete the project by Friday';
      const result = classifyCapture(content);
      expect(result.category).toBe('note');
    });

    test('handles meeting capture', () => {
      const content = 'Team meeting tomorrow 10am agenda discussion';
      const result = classifyCapture(content);
      expect(result.category).toBe('timetable');
    });

    test('handles web capture with URL', () => {
      const content = 'Interesting read: https://medium.com/article';
      const result = classifyCapture(content);
      expect(result.category).toBe('link');
    });

    test('handles document capture', () => {
      const content = 'Final_report_v2.docx';
      const result = classifyCapture(content);
      expect(result.category).toBe('file');
    });

    test('handles study related capture', () => {
      const content = 'Biology chapter 7 summary notes';
      const result = classifyCapture(content);
      expect(result.category).toBe('study material');
    });
  });
});