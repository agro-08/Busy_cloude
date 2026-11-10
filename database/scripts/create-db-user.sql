-- =====================================================================
-- Least-privilege MySQL user for the backend (do NOT use 'root' in .env).
-- CHANGE THE PASSWORD before running.
-- =====================================================================
CREATE USER IF NOT EXISTS 'boc_app'@'%' IDENTIFIED BY 'ChangeMe#StrongPassword1';
ALTER USER 'boc_app'@'%' IDENTIFIED BY 'ChangeMe#StrongPassword1';

GRANT SELECT, INSERT, UPDATE, DELETE, EXECUTE ON `BusyOnCloud`.* TO 'boc_app'@'%';
FLUSH PRIVILEGES;
