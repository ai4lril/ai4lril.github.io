import { getErrorMessage, isPrismaErrorCode } from './error-utils';

describe('error-utils', () => {
  describe('getErrorMessage', () => {
    it('should return message from Error instance', () => {
      expect(getErrorMessage(new Error('test error'))).toBe('test error');
    });

    it('should return message from object with message property', () => {
      expect(getErrorMessage({ message: 'object error' })).toBe('object error');
    });

    it('should return stringified object when message is not string', () => {
      const obj = { message: 123, code: 'P2002' };
      expect(getErrorMessage(obj)).toBe(JSON.stringify(obj));
    });

    it('should return string for primitive', () => {
      expect(getErrorMessage('string')).toBe('string');
      expect(getErrorMessage(42)).toBe('42');
    });

    it('should return [object Error] for non-serializable object', () => {
      const circular: Record<string, unknown> = {};
      circular.self = circular;
      expect(getErrorMessage(circular)).toContain('object');
    });
  });

  describe('isPrismaErrorCode', () => {
    it('should return true when error has matching code', () => {
      expect(isPrismaErrorCode({ code: 'P2002' }, 'P2002')).toBe(true);
    });

    it('should return false when error has different code', () => {
      expect(isPrismaErrorCode({ code: 'P2003' }, 'P2002')).toBe(false);
    });

    it('should return false when error has no code', () => {
      expect(isPrismaErrorCode({ message: 'error' }, 'P2002')).toBe(false);
    });

    it('should return false for null or non-object', () => {
      expect(isPrismaErrorCode(null, 'P2002')).toBe(false);
      expect(isPrismaErrorCode('string', 'P2002')).toBe(false);
    });
  });
});
