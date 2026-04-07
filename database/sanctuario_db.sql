-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Nov 20, 2025 at 06:18 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `sanctuario_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `activity_logs`
--

CREATE TABLE `activity_logs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `admin`
--

CREATE TABLE `admin` (
  `james` varchar(250) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `admins`
--

CREATE TABLE `admins` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `department` varchar(255) DEFAULT NULL,
  `position` varchar(255) DEFAULT NULL,
  `access_level` enum('super_admin','admin','moderator') NOT NULL DEFAULT 'admin',
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `remember_token` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `admins`
--

INSERT INTO `admins` (`id`, `name`, `email`, `email_verified_at`, `password`, `department`, `position`, `access_level`, `is_active`, `remember_token`, `created_at`, `updated_at`) VALUES
(1, 'My Admin', 'myadmin@sanctuario.com', NULL, '$2y$12$uY2jciPZee7nStHCPrH4I./2108Ss7LIExB8NlAHBKC.ASxGukPkO', 'Administration', 'Administrator', 'admin', 1, NULL, '2025-11-06 03:19:30', '2025-11-06 03:19:30'),
(2, 'Test Admin', 'testadmin@sanctuario.com', NULL, '$2y$12$/235iBxhScI9vd1moZmy/e17lzGRn3Ohqc3sevuNlYri/rPiyv4GO', 'Administration', 'Administrator', 'admin', 1, NULL, '2025-11-06 03:22:18', '2025-11-06 03:22:18'),
(3, 'Super Admin', 'admin@sanctuario.com', NULL, '$2y$12$3L1ObwDSCCTo1KpkgoE7U.0J7ylAuGIkq7Iz6o/5U5ryykJdtj1BW', 'Administration', 'System Administrator', 'super_admin', 1, NULL, '2025-11-06 12:58:35', '2025-11-06 12:58:35'),
(4, 'John Admin', 'john@sanctuario.com', NULL, '$2y$12$4tf4WapSj1BeU5b015//4uFjSNxzDR0.RKeQexviRaG4VqP2d2uvm', 'Operations', 'Manager', 'admin', 1, NULL, '2025-11-06 12:58:35', '2025-11-06 12:58:35'),
(5, 'Super Administrator', 'superadmin@sanctuario.com', NULL, '$2y$12$oh8KUIQjH9O8NkpuyhTUButdB8CAzmoQdRBZvXf3S7UgksyJ.g62a', 'Management', 'Super Administrator', 'super_admin', 1, NULL, '2025-11-07 05:18:35', '2025-11-07 05:18:35');

-- --------------------------------------------------------

--
-- Table structure for table `bookings`
--

CREATE TABLE `bookings` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `requirement_status` enum('not_required','pending_submission','pending_review','approved','rejected') NOT NULL DEFAULT 'not_required',
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `service_id` bigint(20) UNSIGNED NOT NULL,
  `status` enum('PendingRequirements','PendingReview','ReadyForPayment','Paid','InProgress','Completed','Cancelled') NOT NULL DEFAULT 'ReadyForPayment',
  `total_amount` decimal(10,2) NOT NULL,
  `payment_id` bigint(20) UNSIGNED DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `bookings`
--

INSERT INTO `bookings` (`id`, `created_at`, `updated_at`, `requirement_status`, `user_id`, `service_id`, `status`, `total_amount`, `payment_id`) VALUES
(1, '2025-11-19 19:48:10', '2025-11-19 19:48:10', 'not_required', 9, 6, 'ReadyForPayment', 121212.00, NULL),
(2, '2025-11-19 19:49:27', '2025-11-19 19:49:27', 'not_required', 9, 6, 'ReadyForPayment', 121212.00, NULL),
(3, '2025-11-19 19:50:05', '2025-11-19 19:50:05', 'not_required', 9, 2, 'ReadyForPayment', 1000.00, NULL),
(4, '2025-11-19 19:54:07', '2025-11-19 19:54:07', 'not_required', 9, 1, 'PendingRequirements', 800.00, NULL),
(5, '2025-11-19 19:54:41', '2025-11-19 19:54:41', 'not_required', 9, 2, 'PendingRequirements', 12000.00, NULL),
(6, '2025-11-19 19:55:02', '2025-11-19 19:55:02', 'not_required', 9, 2, 'PendingRequirements', 1000.00, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `clients`
--

CREATE TABLE `clients` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `username` varchar(255) NOT NULL,
  `deceased_name` varchar(255) DEFAULT NULL,
  `grave_location` varchar(255) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `plot_number` varchar(255) DEFAULT NULL,
  `phone` varchar(255) DEFAULT NULL,
  `date_of_burial` date DEFAULT NULL,
  `relationship` varchar(255) DEFAULT NULL,
  `remember_token` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `clients`
--

INSERT INTO `clients` (`id`, `name`, `email`, `email_verified_at`, `password`, `username`, `deceased_name`, `grave_location`, `address`, `plot_number`, `phone`, `date_of_burial`, `relationship`, `remember_token`, `created_at`, `updated_at`) VALUES
(1, 'Maria Dela Cruz', 'maria.delacruz@email.com', NULL, '$2y$12$wVZmWueaG2OLjcpeH4.aZ.kRab/f9wxWFj.J9POfjbk4HhCazRdti', 'maria_dc', 'Juan Dela Cruz', 'Section A, Plot 12', '123 Sampaguita Street, Carmona, Cavite', 'A-012', '0917-123-4567', '2024-06-01', 'Wife', NULL, '2025-11-07 01:46:56', '2025-11-07 01:46:56'),
(2, 'Robert Reyes', 'robert.reyes@email.com', NULL, '$2y$12$Z4AY19l8J0q75iOUliibAur.sUdZzBmuASkMy8cQZZ9yRRjgkkqI.', 'robert_r', 'Elena Reyes', 'Section A, Plot 13', '456 Rose Avenue, Carmona, Cavite', 'A-013', '0922-456-7890', '2024-05-15', 'Son', NULL, '2025-11-07 01:46:56', '2025-11-07 01:46:56'),
(3, 'Angelica Gomez', 'angelica.gomez@email.com', NULL, '$2y$12$Ch.bLBIyAR.H5ICiKlhGQex740Rt06c1c.dZt6wJoQnsRsOsE6k6y', 'angel_g', 'Carlos Gomez', 'Section B, Plot 1', '789 Lily Street, Carmona, Cavite', 'B-001', '0918-555-6789', '2024-06-10', 'Daughter', NULL, '2025-11-07 01:46:56', '2025-11-07 01:46:56'),
(4, 'Daniel Ortega', 'daniel.ortega@email.com', NULL, '$2y$12$YpOCfHIvs6I.c5jXvRjDaeORhFI4A6HO3ZVNqNiCszhNslLf8Mlhm', 'daniel_o', 'Rosa Ortega', 'Section C, Plot 3', '321 Jasmine Road, Carmona, Cavite', 'C-003', '0905-888-9999', '2024-04-20', 'Son', NULL, '2025-11-07 01:46:56', '2025-11-07 01:46:56'),
(5, 'Kristine Santos', 'kristine.santos@email.com', NULL, '$2y$12$fGibuBR0o9vNXsjyrjLsheMFqAIbr8aU9MsNPDqP6tCPkKckBytf6', 'kris_s', 'Miguel Santos', 'Section B, Plot 5', '654 Orchid Lane, Carmona, Cavite', 'B-005', '0933-222-4444', '2024-06-18', 'Wife', NULL, '2025-11-07 01:46:56', '2025-11-07 01:46:56'),
(6, 'Test New Customer', 'newcustomer@test.com', NULL, '$2y$12$sR.XyfeJZIB459Tv9C1m7eZYBHG18vMEJ3U08gQYh3Z/H5pUCZICm', 'newcustomer123', 'Test Deceased Person', 'Section D, Plot 1', '999 Test Avenue, Carmona, Cavite', 'D-001', '0999-888-7777', '2024-11-07', 'Daughter', NULL, '2025-11-07 01:50:07', '2025-11-07 01:50:07'),
(7, 'wadid', 'jamestojon62@gmail.com', NULL, '$2y$12$7wE0CQbFidsGvX2DeRVCCOko4MjijZxGLv76xwHmoVaob7.zeP4Fq', 'alahu', 'different', 'Section a, Plot 1', 'wdwdd', '1', '1232', '2025-11-05', 'ohhyeahh', NULL, '2025-11-07 03:27:39', '2025-11-07 03:27:39'),
(8, 'john lloyd', 'john@gmail.com', NULL, '$2y$12$cBDMGL5XptY4fSEpopWcrOFLeAbYzhTqqkOq86W2aOWQQciUptRCS', 'John', 'juan', 'Section B, Plot 1', 'wdwdd', '1', '12345', '2025-11-04', 'brother', NULL, '2025-11-07 06:41:11', '2025-11-07 06:41:11'),
(9, 'dudumegadidi', 'james@sanctuario', NULL, '$2y$12$jnBtKCMXnjwgTTYkXkffLuAyNTDuoySE7TFmyFgwiBK2PNnvKNBIC', 'dudu', '2d2d', 'Section a, Plot 1', '2d2d', '1', '12121212', NULL, 'brother', NULL, '2025-11-12 14:54:53', '2025-11-12 14:54:53');

-- --------------------------------------------------------

--
-- Table structure for table `documents`
--

CREATE TABLE `documents` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `graves`
--

CREATE TABLE `graves` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `deceased_name` varchar(255) NOT NULL,
  `section` varchar(255) NOT NULL,
  `plot_number` varchar(255) NOT NULL,
  `grave_location` varchar(255) NOT NULL,
  `client_id` bigint(20) UNSIGNED NOT NULL,
  `relationship_to_deceased` varchar(255) NOT NULL,
  `status` enum('Active','Inactive') NOT NULL DEFAULT 'Active',
  `burial_date` date DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `graves`
--

INSERT INTO `graves` (`id`, `deceased_name`, `section`, `plot_number`, `grave_location`, `client_id`, `relationship_to_deceased`, `status`, `burial_date`, `notes`, `created_at`, `updated_at`) VALUES
(1, 'Mia', 'A', '12', 'Section A, Plot 12', 1, 'Wife', 'Active', '2010-01-01', 'Regular maintenance required', '2025-11-07 02:19:55', '2025-11-07 02:19:55'),
(2, 'Zane', 'B', '13', 'Section B, Plot 13', 2, 'Son', 'Active', '2020-02-04', 'Memorial flowers weekly', '2025-11-07 02:19:55', '2025-11-07 02:19:55'),
(3, 'Leo', 'C', '14', 'Section C, Plot 14', 3, 'Daughter', 'Active', '2023-03-05', 'Recent burial, special care needed', '2025-11-07 02:19:55', '2025-11-07 02:19:55'),
(4, 'Ava', 'D', '15', 'Section D, Plot 15', 4, 'Husband', 'Active', '2024-04-04', 'Premium maintenance package', '2025-11-07 02:19:55', '2025-11-07 02:19:55'),
(5, 'Max', 'E', '16', 'Section E, Plot 16', 5, 'Mother', 'Active', '2021-05-04', 'Monthly cleaning service', '2025-11-07 02:19:55', '2025-11-07 02:19:55'),
(6, 'Ivy', 'A', '17', 'Section A, Plot 17', 1, 'Father', 'Inactive', '2015-06-07', 'Payment overdue', '2025-11-07 02:19:55', '2025-11-07 02:19:55'),
(7, 'Zoe', 'B', '18', 'Section B, Plot 18', 2, 'Sister', 'Inactive', '2003-07-02', 'Maintenance suspended', '2025-11-07 02:19:55', '2025-11-07 02:19:55'),
(8, 'Kai', 'C', '20', 'Section C, Plot 20', 3, 'Brother', 'Inactive', '2001-08-05', 'Contact client for renewal', '2025-11-07 02:19:55', '2025-11-07 02:19:55'),
(9, 'Liv', 'D', '21', 'Section D, Plot 21', 4, 'Daughter', 'Inactive', '2020-09-01', 'Service discontinued', '2025-11-07 02:19:55', '2025-11-07 02:19:55'),
(10, 'Mat', 'E', '22', 'Section E, Plot 22', 5, 'Son', 'Inactive', '2025-10-08', 'Future burial planned', '2025-11-07 02:19:55', '2025-11-07 02:19:55'),
(11, 'Mia', 'A', '12', 'Section A, Plot 12', 1, 'Wife', 'Active', '2010-01-01', 'Regular maintenance required', '2025-11-07 03:21:58', '2025-11-07 03:21:58'),
(12, 'Zane', 'B', '13', 'Section B, Plot 13', 2, 'Son', 'Active', '2020-02-04', 'Memorial flowers weekly', '2025-11-07 03:21:58', '2025-11-07 03:21:58'),
(13, 'Leo', 'C', '14', 'Section C, Plot 14', 3, 'Daughter', 'Active', '2023-03-05', 'Recent burial, special care needed', '2025-11-07 03:21:58', '2025-11-07 03:21:58'),
(14, 'Ava', 'D', '15', 'Section D, Plot 15', 4, 'Husband', 'Active', '2024-04-04', 'Premium maintenance package', '2025-11-07 03:21:58', '2025-11-07 03:21:58'),
(15, 'Max', 'E', '16', 'Section E, Plot 16', 5, 'Mother', 'Active', '2021-05-04', 'Monthly cleaning service', '2025-11-07 03:21:58', '2025-11-07 03:21:58'),
(16, 'Ivy', 'A', '17', 'Section A, Plot 17', 1, 'Father', 'Inactive', '2015-06-07', 'Payment overdue', '2025-11-07 03:21:58', '2025-11-07 03:21:58'),
(17, 'Zoe', 'B', '18', 'Section B, Plot 18', 2, 'Sister', 'Inactive', '2003-07-02', 'Maintenance suspended', '2025-11-07 03:21:58', '2025-11-07 03:21:58'),
(18, 'Kai', 'C', '20', 'Section C, Plot 20', 3, 'Brother', 'Inactive', '2001-08-05', 'Contact client for renewal', '2025-11-07 03:21:58', '2025-11-07 03:21:58'),
(19, 'Liv', 'D', '21', 'Section D, Plot 21', 4, 'Daughter', 'Inactive', '2020-09-01', 'Service discontinued', '2025-11-07 03:21:58', '2025-11-07 03:21:58'),
(20, 'Mat', 'E', '22', 'Section E, Plot 22', 5, 'Son', 'Inactive', '2025-10-08', 'Future burial planned', '2025-11-07 03:21:58', '2025-11-07 03:21:58');

-- --------------------------------------------------------

--
-- Table structure for table `migrations`
--

CREATE TABLE `migrations` (
  `id` int(10) UNSIGNED NOT NULL,
  `migration` varchar(255) NOT NULL,
  `batch` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `migrations`
--

INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES
(1, '0001_01_01_000000_create_users_table', 1),
(2, '0001_01_01_000001_create_cache_table', 1),
(3, '0001_01_01_000002_create_jobs_table', 1),
(4, '2025_11_06_002548_create_personal_access_tokens_table', 2),
(5, '2025_11_06_004621_cleanup_unnecessary_tables', 3),
(6, '2025_11_06_105114_add_role_to_users_table', 4),
(10, '2025_11_06_202101_add_profile_data_to_users_table', 5),
(11, '2025_11_06_204340_create_clients_table', 5),
(12, '2025_11_06_204449_create_admins_table', 5),
(13, '2025_11_06_205356_migrate_users_to_separate_tables', 5),
(14, '2025_11_07_101753_create_graves_table', 6),
(15, '2025_11_10_035626_create_services_table', 7),
(17, '2025_11_11_105445_create_payment_plans_table', 8),
(18, '2025_11_11_105449_create_sms_logs_table', 8),
(19, '2025_11_11_105452_create_sms_templates_table', 8),
(20, '2025_11_11_105454_create_bookings_table', 8),
(21, '2025_11_11_105457_create_service_packages_table', 8),
(22, '2025_11_11_105500_create_reviews_table', 8),
(23, '2025_11_11_105502_create_documents_table', 8),
(24, '2025_11_11_105504_create_activity_logs_table', 8),
(25, '2025_11_11_105507_create_staff_tasks_table', 8),
(26, '2025_11_11_105219_create_payments_table', 9),
(27, '2025_11_20_000001_create_requirements_table', 10),
(29, '2025_11_20_000002_create_service_requirements_table', 11),
(30, '2025_11_20_000003_create_requirement_submissions_table', 12),
(31, '2025_11_20_000004_add_requirement_status_to_bookings_table', 13),
(32, '2025_11_20_000005_update_bookings_table_structure', 14);

-- --------------------------------------------------------

--
-- Table structure for table `payments`
--

CREATE TABLE `payments` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `client_id` bigint(20) UNSIGNED NOT NULL,
  `grave_id` bigint(20) UNSIGNED DEFAULT NULL,
  `service_id` bigint(20) UNSIGNED DEFAULT NULL,
  `payment_reference` varchar(255) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `payment_method` enum('GCash','Card','Bank Transfer','Cash','PayMongo','GrabPay','PayMaya') NOT NULL,
  `payment_type` enum('full','installment','partial') NOT NULL,
  `status` enum('pending','completed','failed','refunded','overdue') NOT NULL DEFAULT 'pending',
  `due_date` date NOT NULL,
  `paid_date` date DEFAULT NULL,
  `description` text DEFAULT NULL,
  `metadata` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`metadata`)),
  `penalty_amount` decimal(10,2) NOT NULL DEFAULT 0.00,
  `reminder_sent` tinyint(1) NOT NULL DEFAULT 0,
  `reminder_sent_at` timestamp NULL DEFAULT NULL,
  `receipt_path` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `payments`
--

INSERT INTO `payments` (`id`, `client_id`, `grave_id`, `service_id`, `payment_reference`, `amount`, `payment_method`, `payment_type`, `status`, `due_date`, `paid_date`, `description`, `metadata`, `penalty_amount`, `reminder_sent`, `reminder_sent_at`, `receipt_path`, `created_at`, `updated_at`) VALUES
(1, 1, NULL, NULL, 'PAY-6913BD1649AA2', 12000.00, 'PayMaya', 'full', 'completed', '2025-11-11', '2025-11-11', 'Grave Repainting - Yearly Plan', NULL, 0.00, 0, NULL, NULL, '2025-11-11 14:47:50', '2025-11-11 14:47:50'),
(2, 1, NULL, NULL, 'PAY-6913BE53A231D', 14400.00, 'GrabPay', 'full', 'completed', '2025-11-11', '2025-11-11', 'Grave Restoration - Yearly Plan', NULL, 0.00, 0, NULL, NULL, '2025-11-11 14:53:07', '2025-11-11 14:53:07'),
(3, 1, NULL, NULL, 'PAY-6913BEF3A3C9E', 12000.00, 'Card', 'full', 'completed', '2025-11-11', '2025-11-11', 'Grave Repainting - Yearly Plan', NULL, 0.00, 0, NULL, NULL, '2025-11-11 14:55:47', '2025-11-11 14:55:47'),
(4, 1, NULL, NULL, 'PAY-6913BEF43759C', 12000.00, 'Card', 'full', 'completed', '2025-11-11', '2025-11-11', 'Payment via Card - Client Portal', NULL, 0.00, 0, NULL, NULL, '2025-11-11 14:55:48', '2025-11-11 14:55:48'),
(5, 1, NULL, NULL, 'PAY-6913BEF46E786', 12000.00, 'Card', 'full', 'completed', '2025-11-11', '2025-11-11', 'Payment via Card - Client Portal', NULL, 0.00, 0, NULL, NULL, '2025-11-11 14:55:48', '2025-11-11 14:55:48'),
(6, 1, NULL, NULL, 'PAY-6913BF050A7B7', 12000.00, 'PayMongo', 'full', 'completed', '2025-11-11', '2025-11-11', 'Grave Repainting - Yearly Plan', NULL, 0.00, 0, NULL, NULL, '2025-11-11 14:56:05', '2025-11-11 14:56:05'),
(7, 1, NULL, NULL, 'PAY-6913BF2136C2E', 12000.00, 'GrabPay', 'full', 'completed', '2025-11-11', '2025-11-11', 'Grave Repainting - Yearly Plan', NULL, 0.00, 0, NULL, NULL, '2025-11-11 14:56:33', '2025-11-11 14:56:33'),
(8, 1, NULL, NULL, 'PAY-6913C1A8D9ACA', 12000.00, 'GCash', 'full', 'completed', '2025-11-11', '2025-11-11', 'Grave Repainting - Yearly Plan', '\"{\\\"payment_method_type\\\":\\\"gcash\\\",\\\"service_type\\\":\\\"grave-repainting\\\",\\\"paymongo_session_id\\\":\\\"cs_pxdXp6vfPthjhpKnpuMZm938\\\"}\"', 0.00, 0, NULL, NULL, '2025-11-11 15:07:20', '2025-11-11 15:07:34'),
(9, 1, NULL, NULL, 'PAY-6913C2438F8D8', 12000.00, 'GCash', 'full', 'completed', '2025-11-11', '2025-11-11', 'Grave Repainting - Yearly Plan', '\"{\\\"payment_method_type\\\":\\\"gcash\\\",\\\"service_type\\\":\\\"grave-repainting\\\",\\\"paymongo_session_id\\\":\\\"cs_ekLoEQ856CG9M5e9T4cEWeUm\\\"}\"', 0.00, 0, NULL, NULL, '2025-11-11 15:09:55', '2025-11-11 15:10:10'),
(10, 1, NULL, NULL, 'PAY-6913C3694FD7F', 12000.00, 'GCash', 'full', 'completed', '2025-11-11', '2025-11-11', 'Grave Repainting - Yearly Plan', '\"{\\\"payment_method_type\\\":\\\"gcash\\\",\\\"service_type\\\":\\\"grave-repainting\\\",\\\"customer_name\\\":\\\"pupu\\\",\\\"paymongo_session_id\\\":\\\"cs_FTJr1UGf41bsTeX2QkNyAh28\\\"}\"', 0.00, 0, NULL, NULL, '2025-11-11 15:14:49', '2025-11-11 15:15:11'),
(11, 1, NULL, NULL, 'PAY-6913C3D468283', 12000.00, 'GCash', 'full', 'completed', '2025-11-11', '2025-11-15', 'Grave Repainting - Yearly Plan', '\"{\\\"payment_method_type\\\":\\\"gcash\\\",\\\"service_type\\\":\\\"grave-repainting\\\",\\\"customer_name\\\":null,\\\"paymongo_session_id\\\":\\\"cs_3P5BnDY6dP1rcieBwQMunJZU\\\"}\"', 0.00, 0, NULL, NULL, '2025-11-11 15:16:36', '2025-11-15 13:36:49'),
(12, 1, NULL, NULL, 'PAY-6913C3E4D74EB', 12000.00, 'GCash', 'full', 'overdue', '2025-11-11', NULL, 'Grave Repainting - Yearly Plan', '\"{\\\"payment_method_type\\\":\\\"gcash\\\",\\\"service_type\\\":\\\"grave-repainting\\\",\\\"customer_name\\\":null,\\\"paymongo_session_id\\\":\\\"cs_ZEpDUcmnE1ZjP1L8s4hzm5zw\\\"}\"', -2141.26, 0, NULL, NULL, '2025-11-11 15:16:52', '2025-11-19 14:07:32'),
(13, 1, NULL, NULL, 'PAY-6913C4F1284D5', 12000.00, 'Card', 'full', 'completed', '2025-11-11', '2025-11-11', 'Grave Repainting - Yearly Plan', '\"{\\\"payment_method_type\\\":\\\"card\\\",\\\"service_type\\\":\\\"grave-repainting\\\",\\\"customer_name\\\":null,\\\"paymongo_session_id\\\":\\\"cs_dUnikEGvhbEapSDprwd2AX5k\\\"}\"', 0.00, 0, NULL, NULL, '2025-11-11 15:21:21', '2025-11-11 15:28:13'),
(14, 1, NULL, NULL, 'PAY-6913C626E50EF', 12000.00, 'Card', 'full', 'overdue', '2025-11-11', NULL, 'Grave Repainting - Yearly Plan', '\"{\\\"payment_method_type\\\":\\\"card\\\",\\\"service_type\\\":\\\"grave-repainting\\\",\\\"customer_name\\\":null,\\\"paymongo_session_id\\\":\\\"cs_rD3uwTqiS9gGdi8n5rA4mSBZ\\\"}\"', -2141.32, 0, NULL, NULL, '2025-11-11 15:26:30', '2025-11-19 14:07:55'),
(15, 1, NULL, NULL, 'PAY-6913C74626DEF', 12000.00, 'GCash', 'full', 'overdue', '2025-11-11', NULL, 'Grave Repainting - Yearly Plan', '\"{\\\"payment_method_type\\\":\\\"gcash\\\",\\\"service_type\\\":\\\"grave-repainting\\\",\\\"customer_name\\\":null,\\\"paymongo_session_id\\\":\\\"cs_pEgJsjueK23nb9wX7F57cQfT\\\"}\"', -2141.38, 0, NULL, NULL, '2025-11-11 15:31:18', '2025-11-19 14:08:15'),
(16, 1, NULL, NULL, 'PAY-69150AC0A9292', 121212.00, 'GCash', 'full', 'completed', '2025-11-12', '2025-11-12', 'poopyyy - Yearly Plan', '\"{\\\"payment_method_type\\\":\\\"gcash\\\",\\\"service_type\\\":\\\"general\\\",\\\"customer_name\\\":\\\"James\\\",\\\"paymongo_session_id\\\":\\\"cs_rwEB3Hw99hyQ7rJBV1gAvQ7K\\\"}\"', 0.00, 0, NULL, NULL, '2025-11-12 14:31:28', '2025-11-12 14:31:57'),
(17, 1, NULL, NULL, 'PAY-69150CE2839CC', 9600.00, 'GCash', 'full', 'completed', '2025-11-12', '2025-11-12', 'Grave Maintenance - Yearly Plan', '\"{\\\"payment_method_type\\\":\\\"gcash\\\",\\\"service_type\\\":\\\"general\\\",\\\"customer_name\\\":\\\"James\\\",\\\"paymongo_session_id\\\":\\\"cs_9ZCTVQrz3j9cS1su7jvm8pZV\\\"}\"', 0.00, 0, NULL, NULL, '2025-11-12 14:40:34', '2025-11-12 14:40:52'),
(18, 1, NULL, NULL, 'PAY-69150D4A0DCDB', 121212.00, 'GCash', 'full', 'completed', '2025-11-12', '2025-11-12', 'poopyyy - Yearly Plan', '\"{\\\"payment_method_type\\\":\\\"gcash\\\",\\\"service_type\\\":\\\"general\\\",\\\"customer_name\\\":\\\"James\\\",\\\"paymongo_session_id\\\":\\\"cs_SHqjZzCbJQ4UuMYuMHoBkc4g\\\"}\"', 0.00, 0, NULL, NULL, '2025-11-12 14:42:18', '2025-11-12 14:42:32'),
(19, 1, NULL, NULL, 'PAY-69150E72567C6', 9600.00, 'GCash', 'full', 'completed', '2025-11-12', '2025-11-12', 'Grave Maintenance - Yearly Plan', '\"{\\\"payment_method_type\\\":\\\"gcash\\\",\\\"service_type\\\":\\\"general\\\",\\\"customer_name\\\":\\\"James\\\",\\\"paymongo_session_id\\\":\\\"cs_vPsvLG6R46AjpD2MdUzweHhn\\\"}\"', 0.00, 0, NULL, NULL, '2025-11-12 14:47:14', '2025-11-12 14:47:28'),
(20, 1, NULL, NULL, 'PAY-69150F6324A91', 9600.00, 'GCash', 'full', 'completed', '2025-11-12', '2025-11-12', 'Grave Maintenance - Yearly Plan', '\"{\\\"payment_method_type\\\":\\\"gcash\\\",\\\"service_type\\\":\\\"general\\\",\\\"customer_name\\\":\\\"pupu\\\",\\\"paymongo_session_id\\\":\\\"cs_aRzMLh7orsc5t1Q13TnmucLR\\\"}\"', 0.00, 0, NULL, NULL, '2025-11-12 14:51:15', '2025-11-12 14:51:47'),
(21, 1, NULL, NULL, 'PAY-6915106915DD8', 121212.00, 'GCash', 'full', 'completed', '2025-11-12', '2025-11-12', 'poopyyy - Yearly Plan', '\"{\\\"payment_method_type\\\":\\\"gcash\\\",\\\"service_type\\\":\\\"general\\\",\\\"customer_name\\\":\\\"James\\\",\\\"paymongo_session_id\\\":\\\"cs_252PgG7Tv2pWywEFrWhEBw7c\\\"}\"', 0.00, 0, NULL, NULL, '2025-11-12 14:55:37', '2025-11-12 14:55:51'),
(22, 1, NULL, NULL, 'PAY-6915117DB0E5D', 121212.00, 'GCash', 'full', 'completed', '2025-11-12', '2025-11-12', 'poopyyy - Yearly Plan', '\"{\\\"payment_method_type\\\":\\\"gcash\\\",\\\"service_type\\\":\\\"general\\\",\\\"customer_name\\\":\\\"wdwd\\\",\\\"paymongo_session_id\\\":\\\"cs_inpNwAMd1vHPLYFfQK8aqbUf\\\"}\"', 0.00, 0, NULL, NULL, '2025-11-12 15:00:13', '2025-11-12 15:00:30'),
(23, 7, NULL, NULL, 'PAY-69151245B2D15', 121212.00, 'GCash', 'full', 'completed', '2025-11-12', '2025-11-12', 'poopyyy - Yearly Plan', '\"{\\\"payment_method_type\\\":\\\"gcash\\\",\\\"service_type\\\":\\\"general\\\",\\\"customer_name\\\":\\\"pupu\\\",\\\"paymongo_session_id\\\":\\\"cs_gcGT7oQUbChi13FeeuJGCyhg\\\"}\"', 0.00, 0, NULL, NULL, '2025-11-12 15:03:33', '2025-11-12 15:03:50'),
(24, 7, NULL, NULL, 'PAY-69163234B6EAE', 9600.00, 'GCash', 'full', 'completed', '2025-11-13', '2025-11-13', 'Grave Maintenance - Yearly Plan', '\"{\\\"payment_method_type\\\":\\\"gcash\\\",\\\"service_type\\\":\\\"general\\\",\\\"customer_name\\\":\\\"James\\\",\\\"paymongo_session_id\\\":\\\"cs_gwu3MZHCXeYYC3CfK3bUfdDS\\\"}\"', 0.00, 0, NULL, NULL, '2025-11-13 11:32:04', '2025-11-13 11:32:28'),
(25, 7, NULL, NULL, 'PAY-691E3A4DE1967', 9600.00, 'GCash', 'full', 'completed', '2025-11-19', '2025-11-19', 'Grave Maintenance - Yearly Plan', '\"{\\\"payment_method_type\\\":\\\"gcash\\\",\\\"service_type\\\":\\\"general\\\",\\\"customer_name\\\":\\\"James\\\",\\\"paymongo_session_id\\\":\\\"cs_42WnukwVzpm6QPWeTfzie3Ui\\\"}\"', 0.00, 0, NULL, NULL, '2025-11-19 13:44:45', '2025-11-19 13:45:07'),
(26, 9, NULL, NULL, 'PAY-691E8DB9DA224', 1200.00, 'GCash', 'full', 'pending', '2025-11-20', NULL, 'Grave Restoration - Monthly Plan', '\"{\\\"payment_method_type\\\":\\\"gcash\\\",\\\"service_type\\\":\\\"grave-restoration\\\",\\\"customer_name\\\":null,\\\"paymongo_session_id\\\":\\\"cs_kSedxiVEyXnYkeYbyvaU7EKV\\\"}\"', 0.00, 0, NULL, NULL, '2025-11-19 19:40:41', '2025-11-19 19:40:42'),
(27, 9, NULL, NULL, 'PAY-691E8FCC4508B', 121212.00, 'GCash', 'full', 'pending', '2025-11-20', NULL, 'poopyyy - Monthly Plan', '\"{\\\"payment_method_type\\\":\\\"gcash\\\",\\\"service_type\\\":\\\"poopyyy\\\",\\\"customer_name\\\":null,\\\"paymongo_session_id\\\":\\\"cs_CwyxaY8V2NSjdF3W7HVKRoBM\\\"}\"', 0.00, 0, NULL, NULL, '2025-11-19 19:49:32', '2025-11-19 19:49:33'),
(28, 9, NULL, NULL, 'PAY-691E8FF0E6773', 1000.00, 'GCash', 'full', 'pending', '2025-11-20', NULL, 'Grave Repainting - Monthly Plan', '\"{\\\"payment_method_type\\\":\\\"gcash\\\",\\\"service_type\\\":\\\"grave-repainting\\\",\\\"customer_name\\\":null,\\\"paymongo_session_id\\\":\\\"cs_i7qcPDVkPqAt3ay8v8bhfr4s\\\"}\"', 0.00, 0, NULL, NULL, '2025-11-19 19:50:08', '2025-11-19 19:50:09');

-- --------------------------------------------------------

--
-- Table structure for table `payment_plans`
--

CREATE TABLE `payment_plans` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `client_id` bigint(20) UNSIGNED NOT NULL,
  `service_id` bigint(20) UNSIGNED NOT NULL,
  `plan_name` varchar(255) NOT NULL,
  `total_amount` decimal(10,2) NOT NULL,
  `amount_paid` decimal(10,2) NOT NULL DEFAULT 0.00,
  `total_installments` int(11) NOT NULL,
  `installments_paid` int(11) NOT NULL DEFAULT 0,
  `installment_amount` decimal(10,2) NOT NULL,
  `frequency` enum('monthly','quarterly','yearly') NOT NULL,
  `start_date` date NOT NULL,
  `next_due_date` date NOT NULL,
  `status` enum('active','completed','cancelled','overdue') NOT NULL DEFAULT 'active',
  `notes` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `personal_access_tokens`
--

CREATE TABLE `personal_access_tokens` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `tokenable_type` varchar(255) NOT NULL,
  `tokenable_id` bigint(20) UNSIGNED NOT NULL,
  `name` text NOT NULL,
  `token` varchar(64) NOT NULL,
  `abilities` text DEFAULT NULL,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `personal_access_tokens`
--

INSERT INTO `personal_access_tokens` (`id`, `tokenable_type`, `tokenable_id`, `name`, `token`, `abilities`, `last_used_at`, `expires_at`, `created_at`, `updated_at`) VALUES
(6, 'App\\Models\\User', 3, 'auth-token', '5fcda166a5548ba2ee8db799c4c1f124211c461307b736a9891b8c6d12561222', '[\"*\"]', '2025-11-06 02:59:16', NULL, '2025-11-05 19:08:41', '2025-11-06 02:59:16'),
(7, 'App\\Models\\User', 3, 'client-token', '116295677e7e306157c8882a556ac43cd7ef30261b07feef4e93978ad117390a', '[\"*\"]', NULL, NULL, '2025-11-06 03:09:33', '2025-11-06 03:09:33'),
(8, 'App\\Models\\User', 7, 'admin-token', 'c3395f0e5a679f4b6f2a71fd90f415acd31f642612e7676fb1e27a4cc114af78', '[\"*\"]', NULL, NULL, '2025-11-06 03:27:40', '2025-11-06 03:27:40'),
(11, 'App\\Models\\User', 3, 'client-token', '854f0096cfc4709bbdc74bc9323852a99bc970ea33812e3949f3013e848c341e', '[\"*\"]', NULL, NULL, '2025-11-06 03:36:24', '2025-11-06 03:36:24'),
(12, 'App\\Models\\User', 3, 'client-token', 'ecae23bbe0a0ac7c82e7ff6f40f931880c9774fd45c867cee1cd20ee7b9151e3', '[\"*\"]', NULL, NULL, '2025-11-06 03:39:45', '2025-11-06 03:39:45'),
(15, 'App\\Models\\User', 3, 'client-token', 'da5bb220ad8b32bba92d75beb8b88ff85727e3e2bdf055c74036f5934ced91cf', '[\"*\"]', NULL, NULL, '2025-11-06 04:03:34', '2025-11-06 04:03:34'),
(16, 'App\\Models\\User', 7, 'admin-token', '484a1cbb1530b7abb349491a88a03621bc790c187866621e8f41e9a113949fde', '[\"*\"]', '2025-11-06 04:04:22', NULL, '2025-11-06 04:04:08', '2025-11-06 04:04:22'),
(18, 'App\\Models\\User', 9, 'auth-token', 'fd951e2ce996c5c9c10ba57a78b42916775b9f14ebf511c3adbc49ba0f238acc', '[\"*\"]', NULL, NULL, '2025-11-06 12:28:09', '2025-11-06 12:28:09'),
(19, 'App\\Models\\User', 9, 'client-token', '624715312010385155437204fb326cfbcce925a62fb3eea6ac9a3f9746274a11', '[\"*\"]', NULL, NULL, '2025-11-06 12:28:47', '2025-11-06 12:28:47'),
(20, 'App\\Models\\User', 9, 'client-token', '644edec3f34be7571758d6810fc6df1440dd9b6b5af5322ba6d1bb7a513f9abf', '[\"*\"]', NULL, NULL, '2025-11-06 12:28:54', '2025-11-06 12:28:54'),
(21, 'App\\Models\\User', 9, 'client-token', '361f1d8a6481b7e8375c52c33f0a0518524458ca75293208ab16a550b57eb53c', '[\"*\"]', NULL, NULL, '2025-11-06 12:29:30', '2025-11-06 12:29:30'),
(24, 'App\\Models\\User', 7, 'admin-token', '19726503fc9bf4c3a495dbbe14e5bed9571da3dfe9d84e269ef7347a2e2c207b', '[\"*\"]', '2025-11-06 12:53:41', NULL, '2025-11-06 12:42:20', '2025-11-06 12:53:41'),
(25, 'App\\Models\\Client', 4, 'client-token', '1176cf42cfc59d28737d4e1106138d4057b0de8f10a5a2c0561aba93eeb77f92', '[\"*\"]', NULL, NULL, '2025-11-06 12:59:50', '2025-11-06 12:59:50'),
(26, 'App\\Models\\Client', 5, 'client-token', '8e8f5efc1590bf5f443de9db6e83ef9ad814ce4579b1772befc62adb70370a87', '[\"*\"]', NULL, NULL, '2025-11-06 13:00:32', '2025-11-06 13:00:32'),
(27, 'App\\Models\\Client', 5, 'client-token', '9aa7a7dc40124a5d2d0364249cf71458e71f86bdcaae05db6357a4d53fe9b0a2', '[\"*\"]', NULL, NULL, '2025-11-06 13:00:42', '2025-11-06 13:00:42'),
(30, 'App\\Models\\Client', 4, 'client-token', 'a4da8eb98ab1b74d9b80af7d18171533531c5a0147bea22bbada1639b4ac89d6', '[\"*\"]', NULL, NULL, '2025-11-06 13:16:53', '2025-11-06 13:16:53'),
(31, 'App\\Models\\Client', 4, 'client-token', '267c3260b1a2c05b7bc44c5f59e10831709e3e7a88202a8a289007a515638aee', '[\"*\"]', NULL, NULL, '2025-11-07 00:31:47', '2025-11-07 00:31:47'),
(32, 'App\\Models\\Client', 4, 'client-token', '2d2ba2f2f553e1488a16fa6266c1ff06e7c56b74b14f8975f1ce0264ba0df234', '[\"*\"]', NULL, NULL, '2025-11-07 01:08:34', '2025-11-07 01:08:34'),
(34, 'App\\Models\\Client', 7, 'client-token', '5f5d8fb8fe87edbdf1e953866d56346d53b841d046a2bf951ebfd1b2d13937e3', '[\"*\"]', NULL, NULL, '2025-11-07 03:27:39', '2025-11-07 03:27:39'),
(35, 'App\\Models\\Client', 7, 'client-token', '441f1d2dbbca7b8fb507ce7bd04eb77f9598213707b492bb2948b6f72e40df1a', '[\"*\"]', '2025-11-07 03:58:49', NULL, '2025-11-07 03:28:01', '2025-11-07 03:58:49'),
(36, 'App\\Models\\Client', 7, 'client-token', 'dc52bc7c0965732437c4338e40b23a2bc119743a4340d7a056f5a09f6be9b145', '[\"*\"]', '2025-11-07 05:02:31', NULL, '2025-11-07 04:23:09', '2025-11-07 05:02:31'),
(37, 'App\\Models\\Client', 7, 'client-token', 'bd316102a0785468de4981ce09b4c173fb68ad9423715f57971a778ac81f1fe2', '[\"*\"]', '2025-11-07 05:05:40', NULL, '2025-11-07 05:04:33', '2025-11-07 05:05:40'),
(38, 'App\\Models\\Client', 7, 'client-token', '8cd0cb6d2af1b4f8959797214e856cca9c382f510be9d6fd46aeaa1b9a4d0628', '[\"*\"]', '2025-11-07 06:03:53', NULL, '2025-11-07 05:17:52', '2025-11-07 06:03:53'),
(39, 'App\\Models\\Admin', 5, 'admin-token', '3e7caeb37ed45537495a1ea94b7a5b5369c13af257a808de377a8d92d155ab9e', '[\"*\"]', '2025-11-07 05:22:12', NULL, '2025-11-07 05:19:26', '2025-11-07 05:22:12'),
(41, 'App\\Models\\Client', 7, 'client-token', 'c944bc43312895ed675e0faec69939e7bb731149001b95d900f389de9b64f660', '[\"*\"]', '2025-11-07 06:35:46', NULL, '2025-11-07 06:10:52', '2025-11-07 06:35:47'),
(42, 'App\\Models\\Client', 8, 'client-token', 'a028737c3c66dd252bf892f65b43075a38d6ced6075eebcc4ccd5a2dd95147c3', '[\"*\"]', NULL, NULL, '2025-11-07 06:41:11', '2025-11-07 06:41:11'),
(43, 'App\\Models\\Client', 8, 'client-token', 'ae0aa8786a6fc068dba6d6ea5246edf068d2670c5baf73207b3109db05a6d78c', '[\"*\"]', NULL, NULL, '2025-11-07 06:41:27', '2025-11-07 06:41:27'),
(45, 'App\\Models\\Client', 7, 'client-token', '367cac47e1494f8725eef6dc6ea1a64af335c92b4ba411d6b0d447dd0d769d69', '[\"*\"]', NULL, NULL, '2025-11-07 06:48:13', '2025-11-07 06:48:13'),
(46, 'App\\Models\\Client', 7, 'client-token', 'af04b8e45bb991d2604739658583c5c726496cab127c8bf04f31751dc3784cc4', '[\"*\"]', NULL, NULL, '2025-11-07 12:25:55', '2025-11-07 12:25:55'),
(47, 'App\\Models\\Client', 7, 'client-token', '982f39c89513b5dfdd07df104a3913ba8202b73232ff14895edaeb0a1c606b8b', '[\"*\"]', '2025-11-09 15:48:56', NULL, '2025-11-09 15:45:37', '2025-11-09 15:48:56'),
(48, 'App\\Models\\Client', 7, 'client-token', 'f7998f15d9bd551e4fdf25d6c9775834c575329c5494cc8f333e4b577f433f28', '[\"*\"]', NULL, NULL, '2025-11-09 16:37:38', '2025-11-09 16:37:38'),
(49, 'App\\Models\\Client', 7, 'client-token', '514f3410cdf0336ee537bace17c2d8ea06154dd05060a2eb2e22b265aafc0190', '[\"*\"]', '2025-11-09 23:26:14', NULL, '2025-11-09 16:43:16', '2025-11-09 23:26:14'),
(50, 'App\\Models\\Client', 7, 'client-token', '4a0b5bac16f9095bbb9165efe1226e664cb22d30a75463158f8522b2306d7797', '[\"*\"]', NULL, NULL, '2025-11-11 02:59:20', '2025-11-11 02:59:20'),
(51, 'App\\Models\\Client', 7, 'client-token', '9adca5e58aca8e91ef257fdb693d14f72473653da13c122753c7aff98e48f2c9', '[\"*\"]', '2025-11-11 06:43:37', NULL, '2025-11-11 06:31:04', '2025-11-11 06:43:37'),
(52, 'App\\Models\\Client', 7, 'client-token', '61225ce4642ea9f1825703e08cd74f36e508060373a3706a2c476387615de1e7', '[\"*\"]', NULL, NULL, '2025-11-11 12:40:52', '2025-11-11 12:40:52'),
(53, 'App\\Models\\Client', 7, 'client-token', 'a6fa0c575a304ce672b3a64024e99b067c68d0cf3a6c160ffec21c124fea299d', '[\"*\"]', NULL, NULL, '2025-11-11 12:46:10', '2025-11-11 12:46:10'),
(54, 'App\\Models\\Client', 7, 'client-token', 'c7506a983883e48e6cb2402e2efa8e1acd7a3d8dadb228b90e8f6cfcaea4298d', '[\"*\"]', NULL, NULL, '2025-11-11 13:31:19', '2025-11-11 13:31:19'),
(55, 'App\\Models\\Client', 7, 'client-token', 'c58eaa5e7bd83410f7bb958f9cc0f75b4c6381331bd1441eeebe380249c781ae', '[\"*\"]', NULL, NULL, '2025-11-12 13:19:24', '2025-11-12 13:19:24'),
(56, 'App\\Models\\Client', 7, 'client-token', 'b270fa8861b64df16b1b47224a83d8fe8ebfada3f4a2dff04e80dbec2f71fcc9', '[\"*\"]', NULL, NULL, '2025-11-12 13:26:51', '2025-11-12 13:26:51'),
(57, 'App\\Models\\Client', 7, 'client-token', '4357fc7f93bb052dee01489942d29dee00aaee2f329f1b16ddc2472a74d8b5d4', '[\"*\"]', NULL, NULL, '2025-11-12 13:41:37', '2025-11-12 13:41:37'),
(58, 'App\\Models\\Client', 7, 'client-token', 'a3620a3f9b839c7a981da0745bb071e0acac13164cb6064d8e26d3439cf17fbd', '[\"*\"]', NULL, NULL, '2025-11-12 13:52:42', '2025-11-12 13:52:42'),
(59, 'App\\Models\\Client', 7, 'client-token', 'c028eaedf346c3c08cc00810a14949e64df5604485438a1df094d4c90d7faa80', '[\"*\"]', NULL, NULL, '2025-11-12 14:26:21', '2025-11-12 14:26:21'),
(60, 'App\\Models\\Client', 9, 'client-token', 'f812f4c3e67c51dc05cfb6afe35da034350c2d1512aab5e72706b07c98f9444f', '[\"*\"]', NULL, NULL, '2025-11-12 14:54:53', '2025-11-12 14:54:53'),
(61, 'App\\Models\\Client', 9, 'client-token', '4372b60e95452fd57d2e5ef92775c9a567ab4a1ffacae458ffa1890c34ca133e', '[\"*\"]', NULL, NULL, '2025-11-12 14:55:15', '2025-11-12 14:55:15'),
(62, 'App\\Models\\Client', 7, 'client-token', 'fbcff5596ff732424c3da0dd41c2f55e79ffabab826256b382786a0e556f4e3e', '[\"*\"]', NULL, NULL, '2025-11-12 15:03:13', '2025-11-12 15:03:13'),
(63, 'App\\Models\\Client', 7, 'client-token', 'f0768c94190b7c9546674c9c5eec35b556905f29c38874c83ddda6ae337f63c2', '[\"*\"]', '2025-11-19 19:36:09', NULL, '2025-11-12 15:34:58', '2025-11-19 19:36:09'),
(64, 'App\\Models\\Client', 9, 'client-token', 'bec673702031e3f076f53aa3176bcf8ceb94a31dfa81ad7780815e35200b6984', '[\"*\"]', '2025-11-19 19:55:02', NULL, '2025-11-12 15:38:21', '2025-11-19 19:55:02'),
(65, 'App\\Models\\Client', 9, 'client-token', '3da473257dde83f4024c54c3c7c9a25c92bc167daea13b0c09b760ff644f67f2', '[\"*\"]', NULL, NULL, '2025-11-12 15:44:39', '2025-11-12 15:44:39'),
(66, 'App\\Models\\Client', 7, 'client-token', '591792b969c4be07f6f34575ed964cfbdb365f60bf280b1e528c0a0f0db58075', '[\"*\"]', NULL, NULL, '2025-11-12 15:47:06', '2025-11-12 15:47:06'),
(67, 'App\\Models\\Client', 7, 'client-token', '7cab64086252da86d6386c2dbaf79dbe7f621c4cd566a56baad361f3e929ea6d', '[\"*\"]', '2025-11-12 15:55:46', NULL, '2025-11-12 15:48:30', '2025-11-12 15:55:46'),
(68, 'App\\Models\\Client', 7, 'client-token', 'b53b581b7a501eb577ed3bf593326591251b2b9b54aed3f0de2246feef24eb62', '[\"*\"]', NULL, NULL, '2025-11-13 02:50:56', '2025-11-13 02:50:56'),
(69, 'App\\Models\\Client', 7, 'client-token', '4d5b23618e8c6b5532174e62fc52a350af08f516989266350254490779463cc4', '[\"*\"]', NULL, NULL, '2025-11-13 04:02:41', '2025-11-13 04:02:41'),
(70, 'App\\Models\\Client', 7, 'client-token', '1259704beeebd70f78e9475b37d87f523ea7418f04d71a60d5e462617ff02c88', '[\"*\"]', NULL, NULL, '2025-11-13 04:12:06', '2025-11-13 04:12:06'),
(71, 'App\\Models\\Client', 7, 'client-token', '8604126704c3e1e0617f8a4f877d1326721745f775b8bac817b85f1b5369b390', '[\"*\"]', '2025-11-13 04:31:18', NULL, '2025-11-13 04:12:38', '2025-11-13 04:31:18'),
(73, 'App\\Models\\Client', 7, 'client-token', '49a881a33d5e7776c23ddf5768ba1bc886ab357a2743281f7fa0f253f7a06e4f', '[\"*\"]', '2025-11-19 16:36:24', NULL, '2025-11-19 13:42:38', '2025-11-19 16:36:24'),
(75, 'App\\Models\\Admin', 1, 'admin-token', '37f9b7a960590e030a5ab3d6309e037bc0d1059459604bf51524bfe5dfc4b5d4', '[\"*\"]', '2025-11-19 19:54:30', NULL, '2025-11-19 14:39:10', '2025-11-19 19:54:30');

-- --------------------------------------------------------

--
-- Table structure for table `requirements`
--

CREATE TABLE `requirements` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `file_type` varchar(255) NOT NULL,
  `max_file_size` int(11) NOT NULL DEFAULT 5242880,
  `is_mandatory` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `requirement_submissions`
--

CREATE TABLE `requirement_submissions` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `booking_id` bigint(20) UNSIGNED NOT NULL,
  `requirement_id` bigint(20) UNSIGNED NOT NULL,
  `file_path` varchar(255) NOT NULL,
  `original_filename` varchar(255) NOT NULL,
  `status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  `admin_notes` text DEFAULT NULL,
  `reviewed_by` bigint(20) UNSIGNED DEFAULT NULL,
  `reviewed_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `reviews`
--

CREATE TABLE `reviews` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `services`
--

CREATE TABLE `services` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `title` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `category` enum('Lot Purchases','Burial Services','Grave Maintenance') NOT NULL,
  `description` text NOT NULL,
  `image_path` varchar(255) DEFAULT NULL,
  `price_monthly` decimal(10,2) DEFAULT NULL,
  `price_quarterly` decimal(10,2) DEFAULT NULL,
  `price_yearly` decimal(10,2) DEFAULT NULL,
  `status` enum('Active','Inactive') NOT NULL DEFAULT 'Active',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `services`
--

INSERT INTO `services` (`id`, `title`, `slug`, `category`, `description`, `image_path`, `price_monthly`, `price_quarterly`, `price_yearly`, `status`, `created_at`, `updated_at`) VALUES
(1, 'Grave Maintenance', 'grave-maintenance', 'Grave Maintenance', 'Trusted to perfection, every step. Our Grave Maintenance service provides respectful and thorough bundle of care, including diligent cleaning, precise grass cutting, careful flower watering, and complete debris removal. We ensure existing is treated with the care it deserves. We trim the grass evenly, apply fertilizer to maintain a vibrant growth, remove debris, sweep the area clean, and treat the gravesite with the honor it deserves. The result is a pristine memorial that families can visit with comfort and pride.', 'uploads/services/grave-maintenance.webp', 800.00, 2400.00, 9600.00, 'Active', '2025-11-09 20:05:31', '2025-11-19 19:53:39'),
(2, 'Grave Repainting', 'grave-repainting', 'Grave Maintenance', 'Restore with dignity, painted with care. Our Grave Repainting service ensures that the final resting place of your loved ones remains in pristine condition. We provide professional repainting services to preserve the dignity and beauty of the memorial site.', 'uploads/services/grave-repainting.jpg', 1000.00, 3000.00, 12000.00, 'Active', '2025-11-09 20:05:31', '2025-11-19 19:53:39'),
(3, 'Grave Restoration', 'grave-restoration', 'Grave Maintenance', 'Bringing honor through proper restoration. Our Grave Restoration service focuses on the preservation and maintenance of headstones, monuments, and other memorial structures. We clean, polish, and protect these important tributes to ensure they remain beautiful and legible for generations to come.', 'uploads/services/grave-restoration.jpg', 1200.00, 3600.00, 14400.00, 'Active', '2025-11-09 20:05:31', '2025-11-19 19:53:39'),
(6, 'poopyyy', 'poopyyy', 'Lot Purchases', 'efewfwfwfwf', NULL, 121212.00, 121212.00, 121212.00, 'Active', '2025-11-12 13:28:16', '2025-11-12 13:28:16');

-- --------------------------------------------------------

--
-- Table structure for table `service_packages`
--

CREATE TABLE `service_packages` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `service_requirements`
--

CREATE TABLE `service_requirements` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `service_id` bigint(20) UNSIGNED NOT NULL,
  `requirement_id` bigint(20) UNSIGNED NOT NULL,
  `order` int(11) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `sms_logs`
--

CREATE TABLE `sms_logs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `client_id` bigint(20) UNSIGNED DEFAULT NULL,
  `phone_number` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `type` enum('payment_reminder','payment_confirmation','overdue_notice','general') NOT NULL,
  `status` enum('sent','failed','pending') NOT NULL DEFAULT 'pending',
  `error_message` varchar(255) DEFAULT NULL,
  `sent_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `sms_templates`
--

CREATE TABLE `sms_templates` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `staff_tasks`
--

CREATE TABLE `staff_tasks` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `activity_logs`
--
ALTER TABLE `activity_logs`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `admins`
--
ALTER TABLE `admins`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `admins_email_unique` (`email`);

--
-- Indexes for table `bookings`
--
ALTER TABLE `bookings`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `clients`
--
ALTER TABLE `clients`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `clients_email_unique` (`email`),
  ADD UNIQUE KEY `clients_username_unique` (`username`);

--
-- Indexes for table `documents`
--
ALTER TABLE `documents`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `graves`
--
ALTER TABLE `graves`
  ADD PRIMARY KEY (`id`),
  ADD KEY `graves_section_plot_number_index` (`section`,`plot_number`),
  ADD KEY `graves_status_index` (`status`),
  ADD KEY `graves_client_id_index` (`client_id`);

--
-- Indexes for table `migrations`
--
ALTER TABLE `migrations`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `payments`
--
ALTER TABLE `payments`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `payments_payment_reference_unique` (`payment_reference`),
  ADD KEY `payments_grave_id_foreign` (`grave_id`),
  ADD KEY `payments_service_id_foreign` (`service_id`),
  ADD KEY `payments_client_id_status_index` (`client_id`,`status`),
  ADD KEY `payments_due_date_index` (`due_date`);

--
-- Indexes for table `payment_plans`
--
ALTER TABLE `payment_plans`
  ADD PRIMARY KEY (`id`),
  ADD KEY `payment_plans_service_id_foreign` (`service_id`),
  ADD KEY `payment_plans_client_id_status_index` (`client_id`,`status`);

--
-- Indexes for table `personal_access_tokens`
--
ALTER TABLE `personal_access_tokens`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `personal_access_tokens_token_unique` (`token`),
  ADD KEY `personal_access_tokens_tokenable_type_tokenable_id_index` (`tokenable_type`,`tokenable_id`),
  ADD KEY `personal_access_tokens_expires_at_index` (`expires_at`);

--
-- Indexes for table `requirements`
--
ALTER TABLE `requirements`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `requirement_submissions`
--
ALTER TABLE `requirement_submissions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `requirement_submissions_booking_id_requirement_id_unique` (`booking_id`,`requirement_id`),
  ADD KEY `requirement_submissions_requirement_id_foreign` (`requirement_id`);

--
-- Indexes for table `reviews`
--
ALTER TABLE `reviews`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `services`
--
ALTER TABLE `services`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `services_slug_unique` (`slug`);

--
-- Indexes for table `service_packages`
--
ALTER TABLE `service_packages`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `service_requirements`
--
ALTER TABLE `service_requirements`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `service_requirements_service_id_requirement_id_unique` (`service_id`,`requirement_id`),
  ADD KEY `service_requirements_requirement_id_foreign` (`requirement_id`);

--
-- Indexes for table `sms_logs`
--
ALTER TABLE `sms_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `sms_logs_client_id_type_index` (`client_id`,`type`),
  ADD KEY `sms_logs_created_at_index` (`created_at`);

--
-- Indexes for table `sms_templates`
--
ALTER TABLE `sms_templates`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `staff_tasks`
--
ALTER TABLE `staff_tasks`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `activity_logs`
--
ALTER TABLE `activity_logs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `admins`
--
ALTER TABLE `admins`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `bookings`
--
ALTER TABLE `bookings`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `clients`
--
ALTER TABLE `clients`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `documents`
--
ALTER TABLE `documents`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `graves`
--
ALTER TABLE `graves`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT for table `migrations`
--
ALTER TABLE `migrations`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=33;

--
-- AUTO_INCREMENT for table `payments`
--
ALTER TABLE `payments`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=29;

--
-- AUTO_INCREMENT for table `payment_plans`
--
ALTER TABLE `payment_plans`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `personal_access_tokens`
--
ALTER TABLE `personal_access_tokens`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=76;

--
-- AUTO_INCREMENT for table `requirements`
--
ALTER TABLE `requirements`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `requirement_submissions`
--
ALTER TABLE `requirement_submissions`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `reviews`
--
ALTER TABLE `reviews`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `services`
--
ALTER TABLE `services`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `service_packages`
--
ALTER TABLE `service_packages`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `service_requirements`
--
ALTER TABLE `service_requirements`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `sms_logs`
--
ALTER TABLE `sms_logs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `sms_templates`
--
ALTER TABLE `sms_templates`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `staff_tasks`
--
ALTER TABLE `staff_tasks`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `graves`
--
ALTER TABLE `graves`
  ADD CONSTRAINT `graves_client_id_foreign` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `payments`
--
ALTER TABLE `payments`
  ADD CONSTRAINT `payments_client_id_foreign` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `payments_grave_id_foreign` FOREIGN KEY (`grave_id`) REFERENCES `graves` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `payments_service_id_foreign` FOREIGN KEY (`service_id`) REFERENCES `services` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `payment_plans`
--
ALTER TABLE `payment_plans`
  ADD CONSTRAINT `payment_plans_client_id_foreign` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `payment_plans_service_id_foreign` FOREIGN KEY (`service_id`) REFERENCES `services` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `requirement_submissions`
--
ALTER TABLE `requirement_submissions`
  ADD CONSTRAINT `requirement_submissions_booking_id_foreign` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `requirement_submissions_requirement_id_foreign` FOREIGN KEY (`requirement_id`) REFERENCES `requirements` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `service_requirements`
--
ALTER TABLE `service_requirements`
  ADD CONSTRAINT `service_requirements_requirement_id_foreign` FOREIGN KEY (`requirement_id`) REFERENCES `requirements` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `service_requirements_service_id_foreign` FOREIGN KEY (`service_id`) REFERENCES `services` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `sms_logs`
--
ALTER TABLE `sms_logs`
  ADD CONSTRAINT `sms_logs_client_id_foreign` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
