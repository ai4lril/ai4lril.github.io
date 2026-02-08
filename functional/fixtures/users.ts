/**
 * User test fixtures
 */

export const testUserData = {
    valid: {
        email: 'testuser@example.com',
        password: 'TestPassword123!',
        first_name: 'Test',
        last_name: 'User',
        display_name: 'Test User',
        username: 'testuser',
        phone_number: '1234567890',
        current_residence_pincode: '123456',
        birth_place_pincode: '123456',
        birth_date: '1990-01-01',
        gender: 'male',
        first_language: 'en',
    },
    minimal: {
        email: 'minimal@example.com',
        password: 'MinimalPass123!',
        first_name: 'Minimal',
        last_name: 'User',
        display_name: 'Minimal User',
        username: 'minimaluser',
        phone_number: '',
        current_residence_pincode: '',
        birth_place_pincode: '',
        birth_date: '1995-01-01',
        gender: 'prefer-not-to-say',
        first_language: 'en',
    },
    admin: {
        email: 'admin@example.com',
        password: 'AdminPassword123!',
        first_name: 'Admin',
        last_name: 'User',
        display_name: 'Admin User',
        username: 'adminuser',
        phone_number: '9876543210',
        current_residence_pincode: '654321',
        birth_place_pincode: '654321',
        birth_date: '1985-01-01',
        gender: 'male',
        first_language: 'en',
    },
};

export const invalidUserData = {
    missingEmail: {
        password: 'TestPassword123!',
        first_name: 'Test',
        last_name: 'User',
    },
    invalidEmail: {
        email: 'notanemail',
        password: 'TestPassword123!',
        first_name: 'Test',
        last_name: 'User',
    },
    shortPassword: {
        email: 'test@example.com',
        password: 'short',
        first_name: 'Test',
        last_name: 'User',
    },
    missingRequiredFields: {
        email: 'test@example.com',
        password: 'TestPassword123!',
    },
};

