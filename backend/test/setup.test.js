const express = require('express');
const setupTestApp = require('./setup');

jest.mock('express');

describe('setupTestApp', () => {
  let mockApp;
  let mockUse;
  let mockJson;

  beforeEach(() => {
    mockUse = jest.fn();
    mockJson = jest.fn();
    mockApp = {
      use: mockUse
    };

    express.json = jest.fn().mockReturnValue(mockJson);
    express.mockReturnValue(mockApp);
  });

  it('express uygulamasını doğru şekilde yapılandırmalı', () => {
    const app = setupTestApp();

    expect(express).toHaveBeenCalled();
    expect(express.json).toHaveBeenCalled();
    expect(mockApp.use).toHaveBeenCalledWith(mockJson);
    expect(app).toBe(mockApp);
  });
}); 