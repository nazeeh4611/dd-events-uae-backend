// @desc    Generate pagination metadata
export const getPagination = (page, limit, totalItems) => {
    const totalPages = Math.ceil(totalItems / limit);
    const currentPage = parseInt(page, 10) || 1;
    const hasNextPage = currentPage < totalPages;
    const hasPrevPage = currentPage > 1;
  
    return {
      currentPage,
      totalPages,
      totalItems,
      hasNextPage,
      hasPrevPage,
      nextPage: hasNextPage ? currentPage + 1 : null,
      prevPage: hasPrevPage ? currentPage - 1 : null
    };
  };
  
  // @desc    Format API response
  export const formatResponse = (success, data, message = '', pagination = null) => {
    const response = {
      success,
      message
    };
  
    if (data !== undefined) {
      response.data = data;
    }
  
    if (pagination) {
      response.pagination = pagination;
    }
  
    return response;
  };
  
  // @desc    Generate random string
  export const generateRandomString = (length = 10) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };
  
  // @desc    Validate email format
  export const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };
  
  // @desc    Sanitize input
  export const sanitizeInput = (input) => {
    if (typeof input !== 'string') return input;
    
    return input
      .replace(/[<>]/g, '') // Remove < and >
      .trim();
  };
  
  // @desc    Format date
  export const formatDate = (date, format = 'YYYY-MM-DD') => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    
    if (format === 'YYYY-MM-DD') {
      return `${year}-${month}-${day}`;
    }
    
    return d.toLocaleDateString();
  };
  
  // @desc    Calculate file size
  export const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  
  // @desc    Create slug from string
  export const createSlug = (str) => {
    return str
      .toLowerCase()
      .replace(/[^\w\s-]/g, '') // Remove non-word chars
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/--+/g, '-') // Replace multiple hyphens with single
      .trim();
  };