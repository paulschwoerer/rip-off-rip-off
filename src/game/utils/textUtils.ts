export const getKeyName = (key : string) : string => {
  switch(key) {
    case 'ArrowUp':
      return '&#11105;';
    case 'ArrowDown':
      return '&#11107;';
    case 'ArrowLeft':
      return '&#11104;';
    case 'ArrowRight':
      return '&#11106;';
    default:
      return key.replace('Key', '').toUpperCase();
  }
};