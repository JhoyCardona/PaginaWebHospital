-- FINAL SUMMARY
-- ============================================

SELECT '========================================' AS '';
SELECT 'DATABASE CREATED SUCCESSFULLY!' AS 'Status';
SELECT '========================================' AS '';
SELECT 'Database Name: medilink_db' AS 'Info';
SELECT CONCAT('Total Tables: ', COUNT(*)) AS 'Info' FROM information_schema.tables WHERE table_schema = 'medilink_db';
SELECT '========================================' AS '';

-- Show table counts
SELECT 'Data Summary:' AS '';
SELECT CONCAT('Users: ', COUNT(*)) AS 'Count' FROM users;
SELECT CONCAT('Medical Centers: ', COUNT(*)) AS 'Count' FROM medical_centers;
SELECT CONCAT('Doctors: ', COUNT(*)) AS 'Count' FROM doctors;
SELECT CONCAT('Appointment Status: ', COUNT(*)) AS 'Count' FROM appointment_status;
SELECT CONCAT('Available Slots: ', COUNT(*)) AS 'Count' FROM available_slots;

SELECT '========================================' AS '';
SELECT 'Test Credentials:' AS '';
SELECT 'ID: 123455 | Password: pass1234' AS 'Credential';
SELECT 'ID: 1234   | Password: 123456' AS 'Credential';
SELECT 'ID: 5678   | Password: clave123' AS 'Credential';
SELECT '========================================' AS '';
SELECT 'Next Steps:' AS '';
SELECT '1. Hash passwords in users table' AS 'Step';
SELECT '2. Configure backend .env file' AS 'Step';
SELECT '3. Test database connection' AS 'Step';
SELECT '========================================' AS '';
```