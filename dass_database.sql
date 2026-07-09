-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jul 09, 2026 at 11:24 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `dass_database`
--

-- --------------------------------------------------------

--
-- Table structure for table `audit_logs`
--

CREATE TABLE `audit_logs` (
  `id` bigint(20) NOT NULL,
  `user_id` bigint(20) NOT NULL,
  `session_id` varchar(100) NOT NULL,
  `action` varchar(50) NOT NULL,
  `entity_type` varchar(50) DEFAULT NULL,
  `entity_id` bigint(20) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `old_values` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`old_values`)),
  `new_values` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`new_values`)),
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent_raw` text DEFAULT NULL,
  `browser` varchar(100) DEFAULT NULL,
  `os` varchar(100) DEFAULT NULL,
  `device` varchar(100) DEFAULT NULL,
  `status` varchar(50) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `logout_at` timestamp NULL DEFAULT NULL,
  `session_duration` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `audit_logs`
--

INSERT INTO `audit_logs` (`id`, `user_id`, `session_id`, `action`, `entity_type`, `entity_id`, `description`, `old_values`, `new_values`, `ip_address`, `user_agent_raw`, `browser`, `os`, `device`, `status`, `created_at`, `logout_at`, `session_duration`) VALUES
(909, 1, '98b879bf-f651-4b24-a240-d34c3335e9c6', 'LOGIN', 'AUTH', NULL, 'User logged in', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'Chrome 148.0.0.0', 'Windows 10', 'Desktop', 'COMPLETED', '2026-05-12 09:11:22', '2026-05-12 09:21:57', 635),
(910, 1, '98b879bf-f651-4b24-a240-d34c3335e9c6', 'UPLOAD DOCUMENT', 'DOCUMENT', 67, 'Uploaded document \"STRATEGIC PLAN\"', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'Chrome 148.0.0.0', 'Windows 10', 'Desktop', 'SUCCESS', '2026-05-12 09:18:20', NULL, NULL),
(911, 1, '98b879bf-f651-4b24-a240-d34c3335e9c6', 'UPLOAD DOCUMENT', 'DOCUMENT', 68, 'Uploaded document \"IUUIW WUIUIW\"', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'Chrome 148.0.0.0', 'Windows 10', 'Desktop', 'SUCCESS', '2026-05-12 09:19:12', NULL, NULL),
(912, 2, '8147ebf5-40d3-499b-85b3-78078bc00d18', 'LOGIN', 'AUTH', NULL, 'User logged in', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'Chrome 148.0.0.0', 'Windows 10', 'Desktop', 'COMPLETED', '2026-05-12 09:22:08', '2026-05-12 09:25:15', 187),
(913, 2, '8147ebf5-40d3-499b-85b3-78078bc00d18', 'UPLOAD DOCUMENT', 'DOCUMENT', 69, 'Uploaded document \"JKWEJKJKWJ\"', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'Chrome 148.0.0.0', 'Windows 10', 'Desktop', 'SUCCESS', '2026-05-12 09:22:59', NULL, NULL),
(914, 2, '8147ebf5-40d3-499b-85b3-78078bc00d18', 'UPLOAD DOCUMENT', 'DOCUMENT', 70, 'Uploaded document \"HSHHJS\"', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'Chrome 148.0.0.0', 'Windows 10', 'Desktop', 'SUCCESS', '2026-05-12 09:23:52', NULL, NULL),
(915, 2, '8147ebf5-40d3-499b-85b3-78078bc00d18', 'DOWNLOAD', 'DOCUMENT', 99, 'Downloaded document \"STRATEGIC PLAN\" version_1.0', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'Chrome 148.0.0.0', 'Windows 10', 'Desktop', 'SUCCESS', '2026-05-12 09:24:42', NULL, NULL),
(916, 2, '8147ebf5-40d3-499b-85b3-78078bc00d18', 'ACCESS REQUEST', 'DOCUMENT', 100, 'Access request submitted for document \"IUUIW WUIUIW\". Reason: \"for planning\"', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'Chrome 148.0.0.0', 'Windows 10', 'Desktop', 'SUCCESS', '2026-05-12 09:25:03', NULL, NULL),
(917, 1, '9873f8c0-8306-4f9c-81d4-60b15305ce94', 'LOGIN', 'AUTH', NULL, 'User logged in', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'Chrome 148.0.0.0', 'Windows 10', 'Desktop', 'COMPLETED', '2026-05-12 09:25:26', '2026-05-12 09:30:47', 321),
(918, 1, '9873f8c0-8306-4f9c-81d4-60b15305ce94', 'REMOVED STAFF', 'USER', 7, 'Miss. Aisha Adamu removed from department (TRANSFER)', '{\"is_removed\":0,\"is_active\":1,\"is_locked\":0,\"department_id\":1}', '{\"is_removed\":1,\"is_active\":0,\"is_locked\":1,\"department_id\":1,\"movement_reason\":\"TRANSFER\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'Chrome 148.0.0.0', 'Windows 10', 'Desktop', 'SUCCESS', '2026-05-12 09:30:30', NULL, NULL),
(919, 2, '62d1209d-7aa9-46c3-8109-d376b57b9a13', 'LOGIN', 'AUTH', NULL, 'User logged in', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'Chrome 148.0.0.0', 'Windows 10', 'Desktop', 'COMPLETED', '2026-05-12 09:30:59', '2026-05-12 09:40:02', 543),
(920, 2, '62d1209d-7aa9-46c3-8109-d376b57b9a13', 'TRANSFER STAFF', 'USER', 7, 'Miss. Aisha Adamu transferred to department via lookup', '{\"department_id\":1,\"is_removed\":1,\"is_active\":0,\"is_locked\":1}', '{\"department_id\":2,\"is_removed\":0,\"is_active\":1,\"is_locked\":0}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'Chrome 148.0.0.0', 'Windows 10', 'Desktop', 'SUCCESS', '2026-05-12 09:31:16', NULL, NULL),
(921, 2, '62d1209d-7aa9-46c3-8109-d376b57b9a13', 'CREATE TICKET', 'SUPPORT', 27, 'Created support ticket #740217', NULL, '{\"ticket_number\":\"740217\",\"subject\":\"jhsdjhdhj\",\"description\":\"kjhhhjjkkhd\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'Chrome 148.0.0.0', 'Windows 10', 'Desktop', 'SUCCESS', '2026-05-12 09:32:56', NULL, NULL),
(922, 2, '62d1209d-7aa9-46c3-8109-d376b57b9a13', 'CREATE PROGRAM', 'PROGRAM', 21, 'Created new program: MR 2025', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'Chrome 148.0.0.0', 'Windows 10', 'Desktop', 'SUCCESS', '2026-05-12 09:34:46', NULL, NULL),
(923, 2, '62d1209d-7aa9-46c3-8109-d376b57b9a13', 'ASSIGN TEAM LEAD', 'PROGRAM', 19, 'Assigned Usman Ohagenyi Abubakar (1791) as Team Lead for \"MR 2025\" in Bauchi', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'Chrome 148.0.0.0', 'Windows 10', 'Desktop', 'SUCCESS', '2026-05-12 09:35:54', NULL, NULL),
(924, 1, 'ac09ad9c-21d7-4a43-91c6-4186b9ce10cb', 'LOGIN', 'AUTH', NULL, 'User logged in', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36 OPR/130.0.0.0', 'Opera 130.0.0.0', 'Windows 10', 'Desktop', 'SUCCESS', '2026-05-12 09:36:55', NULL, NULL),
(925, 1, 'ac09ad9c-21d7-4a43-91c6-4186b9ce10cb', 'UPLOAD PROGRAM REPORT', 'PROGRAM', 14, 'Uploaded report \"BAUCHI STARE MR 2025 REPORT\" for program \"MR 2025\" (Bauchi)', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36 OPR/130.0.0.0', 'Opera 130.0.0.0', 'Windows 10', 'Desktop', 'SUCCESS', '2026-05-12 09:38:03', NULL, NULL),
(926, 11, '664f712d-ca70-44f2-8390-1fa3504ff338', 'LOGIN', 'AUTH', NULL, 'User logged in', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'Chrome 148.0.0.0', 'Windows 10', 'Desktop', 'COMPLETED', '2026-05-12 09:40:36', '2026-05-12 09:45:08', 272),
(927, 11, '664f712d-ca70-44f2-8390-1fa3504ff338', 'SHARE DOCUMENT', 'DOCUMENT', 99, 'Shared \"STRATEGIC PLAN\" with 1 partner(s) via portal', NULL, '{\"document_title\":\"STRATEGIC PLAN\",\"shared_with\":[\"Nigeria Centre for Disease Control and Prevention (NCDC)\"],\"expiry_date\":\"2026-05-19T10:43\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'Chrome 148.0.0.0', 'Windows 10', 'Desktop', 'SUCCESS', '2026-05-12 09:43:54', NULL, NULL),
(928, 11, '664f712d-ca70-44f2-8390-1fa3504ff338', 'GENERATE PUBLIC LINK', 'DOCUMENT', 99, 'Generated public access link for \"STRATEGIC PLAN\"', NULL, '{\"document_title\":\"STRATEGIC PLAN\",\"link\":\"http://localhost:5173/public/document/6601d15a1e63d37694dd2aa9b359ff016ea48d1d69de54ea0661011d55a4ba24\",\"expiry_date\":\"2026-05-13T10:44\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'Chrome 148.0.0.0', 'Windows 10', 'Desktop', 'SUCCESS', '2026-05-12 09:44:28', NULL, NULL),
(929, 18, '2d31a29a-7ef6-42d0-a50c-b4744b557b8d', 'LOGIN', 'AUTH', NULL, 'User logged in', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'Chrome 148.0.0.0', 'Windows 10', 'Desktop', 'COMPLETED', '2026-05-12 09:45:30', '2026-05-12 09:47:26', 116),
(930, 18, '2d31a29a-7ef6-42d0-a50c-b4744b557b8d', 'DOWNLOAD', 'DOCUMENT', 99, 'Downloaded document \"STRATEGIC PLAN\" version_1.0', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'Chrome 148.0.0.0', 'Windows 10', 'Desktop', 'SUCCESS', '2026-05-12 09:47:04', NULL, NULL),
(931, 18, 'd365dfae-e09d-4408-8769-0dae80572747', 'LOGIN', 'AUTH', NULL, 'User logged in', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'Chrome 148.0.0.0', 'Windows 10', 'Desktop', 'COMPLETED', '2026-05-12 09:49:39', '2026-05-13 08:28:53', 81554),
(932, 1, 'a6e9f662-7339-4036-9543-6f088950c08e', 'LOGIN', 'AUTH', NULL, 'User logged in', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', 'Edge 148.0.0.0', 'Windows 10', 'Desktop', 'SUCCESS', '2026-05-12 09:54:41', NULL, NULL),
(933, 1, '3b3894f8-0e8e-4758-8783-c3d6a0c57c3f', 'LOGIN', 'AUTH', NULL, 'User logged in', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'Chrome 148.0.0.0', 'Windows 10', 'Desktop', 'COMPLETED', '2026-05-13 08:30:17', '2026-05-13 08:48:06', 1069),
(934, 1, '3b3894f8-0e8e-4758-8783-c3d6a0c57c3f', 'CREATE PROGRAM', 'PROGRAM', 22, 'Created new program: MR 2026', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'Chrome 148.0.0.0', 'Windows 10', 'Desktop', 'SUCCESS', '2026-05-13 08:35:23', NULL, NULL),
(935, 1, 'e7f13bf3-d483-48e8-b67e-074290d738f5', 'LOGIN', 'AUTH', NULL, 'User logged in', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'Chrome 148.0.0.0', 'Windows 10', 'Desktop', 'SUCCESS', '2026-05-13 09:04:03', NULL, NULL),
(936, 1, '8ddf1115-37e5-485b-baad-7677a5b8abd0', 'LOGIN', 'AUTH', NULL, 'User logged in', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'Chrome 148.0.0.0', 'Windows 10', 'Desktop', 'COMPLETED', '2026-05-14 14:49:16', '2026-05-14 15:30:39', 2483),
(937, 11, '35624594-271c-49d4-bfd4-fbb36422134e', 'LOGIN', 'AUTH', NULL, 'User logged in', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', 'Edge 148.0.0.0', 'Windows 10', 'Desktop', 'COMPLETED', '2026-05-14 14:50:01', '2026-05-14 15:30:44', 2443),
(938, 1, '354aba8e-026a-4583-a9f6-e6104fd61db2', 'LOGIN', 'AUTH', NULL, 'User logged in', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'Chrome 148.0.0.0', 'Windows 10', 'Desktop', 'COMPLETED', '2026-05-15 13:32:30', '2026-05-15 16:54:45', 12135),
(939, 1, '354aba8e-026a-4583-a9f6-e6104fd61db2', 'DELETE DOCUMENT', 'DOCUMENT', 100, 'Deleted document \"IUUIW WUIUIW\". Reason: over due. Requested at: 2026-05-15 13:34:47', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'Chrome 148.0.0.0', 'Windows 10', 'Desktop', 'SUCCESS', '2026-05-15 13:34:47', NULL, NULL),
(940, 11, 'd95f0092-171d-4739-aca8-8b5bf5e2d9bc', 'LOGIN', 'AUTH', NULL, 'User logged in', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', 'Edge 148.0.0.0', 'Windows 10', 'Desktop', 'COMPLETED', '2026-05-15 13:35:27', '2026-05-15 16:54:56', 11969),
(941, 11, 'd95f0092-171d-4739-aca8-8b5bf5e2d9bc', 'APPROVED RESTORE DOCUMENT', 'DOCUMENT', 100, 'Approved restore document request for \"IUUIW WUIUIW\"', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', 'Edge 148.0.0.0', 'Windows 10', 'Desktop', 'SUCCESS', '2026-05-15 13:36:52', NULL, NULL),
(942, 1, '354aba8e-026a-4583-a9f6-e6104fd61db2', 'DOWNLOAD', 'DOCUMENT', 100, 'Downloaded document \"IUUIW WUIUIW\" version_1.0', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'Chrome 148.0.0.0', 'Windows 10', 'Desktop', 'SUCCESS', '2026-05-15 13:53:27', NULL, NULL),
(943, 1, '354aba8e-026a-4583-a9f6-e6104fd61db2', 'DOCUMENT_UPDATED', 'DOCUMENT', 99, 'Updated: Title', '{\"title\":\"STRATEGIC PLAN\"}', '{\"title\":\"Health Insurance Portability and Accountability Act (HIPAA)\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'Chrome 148.0.0.0', 'Windows 10', 'Desktop', 'SUCCESS', '2026-05-15 13:56:11', NULL, NULL),
(944, 1, '354aba8e-026a-4583-a9f6-e6104fd61db2', 'DOCUMENT_NEW_VERSION_UPLOADED', 'DOCUMENT', 71, 'Uploaded version v2 for document \"IUUIW WUIUIW\" (DOC-PRS-2026-000002-C54252E7-5DBF-445B-B622-7A3985F6B060)', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'Chrome 148.0.0.0', 'Windows 10', 'Desktop', 'SUCCESS', '2026-05-15 14:36:50', NULL, NULL),
(945, 1, '354aba8e-026a-4583-a9f6-e6104fd61db2', 'DOCUMENT_UPDATED', 'DOCUMENT', 100, 'Updated: Description', '{\"description\":\"JKAJKAJK\"}', '{\"description\":\"Documents are usually deleted only after expiration. However, early deletion may be requested in exceptional circumstances with a valid reason.\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'Chrome 148.0.0.0', 'Windows 10', 'Desktop', 'SUCCESS', '2026-05-15 14:43:59', NULL, NULL),
(946, 11, '1f004a9a-eb12-4cd5-80bd-e5fee71f104e', 'LOGIN', 'AUTH', NULL, 'User logged in', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', 'Edge 148.0.0.0', 'Windows 10', 'Desktop', 'COMPLETED', '2026-05-19 10:09:20', '2026-05-20 04:16:05', 65205),
(947, 1, '832f7aea-fec1-4d10-8fbc-5be170499607', 'LOGIN', 'AUTH', NULL, 'User logged in', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'Chrome 148.0.0.0', 'Windows 10', 'Desktop', 'COMPLETED', '2026-05-19 10:09:40', '2026-05-20 07:47:36', 77876),
(948, 1, '832f7aea-fec1-4d10-8fbc-5be170499607', 'DOWNLOAD', 'DOCUMENT', 100, 'Downloaded document \"IUUIW WUIUIW\" version_2.0', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'Chrome 148.0.0.0', 'Windows 10', 'Desktop', 'SUCCESS', '2026-05-19 10:18:57', NULL, NULL),
(949, 1, '832f7aea-fec1-4d10-8fbc-5be170499607', 'DOCUMENT_UPDATED', 'DOCUMENT', 100, 'Updated: Title', '{\"title\":\"IUUIW WUIUIW\"}', '{\"title\":\"Documents are usually deleted only after expiration. However, early deletion may be requested in exceptional circumstances with a valid reason.\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'Chrome 148.0.0.0', 'Windows 10', 'Desktop', 'SUCCESS', '2026-05-19 10:20:43', NULL, NULL),
(950, 1, '832f7aea-fec1-4d10-8fbc-5be170499607', 'ACCESS REQUEST', 'DOCUMENT', 101, 'Access request submitted for document \"JKWEJKJKWJ\". Reason: \"for analysis\"', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'Chrome 148.0.0.0', 'Windows 10', 'Desktop', 'SUCCESS', '2026-05-19 10:43:56', NULL, NULL),
(951, 1, '832f7aea-fec1-4d10-8fbc-5be170499607', 'CREATE USER', 'USER', 43, 'Created new staff account for Salma Saidu', NULL, '{\"full_name\":\"Salma Saidu\",\"gender\":\"Female\",\"designation\":\"Program Analyst\",\"file_number\":\"4445\",\"email\":\"salma@gmail.com\",\"phone_number\":\"07056369110\",\"department_id\":1}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'Chrome 148.0.0.0', 'Windows 10', 'Desktop', 'SUCCESS', '2026-05-19 11:31:44', NULL, NULL),
(952, 1, '832f7aea-fec1-4d10-8fbc-5be170499607', 'DEACTIVATE USER', 'USER', 43, 'DEACTIVATE USER for Salma Saidu', '{\"is_active\":1}', '{\"is_active\":0}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'Chrome 148.0.0.0', 'Windows 10', 'Desktop', 'SUCCESS', '2026-05-19 11:47:39', NULL, NULL),
(953, 1, '832f7aea-fec1-4d10-8fbc-5be170499607', 'ACTIVATE USER', 'USER', 43, 'ACTIVATE USER for Salma Saidu', '{\"is_active\":0}', '{\"is_active\":1}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'Chrome 148.0.0.0', 'Windows 10', 'Desktop', 'SUCCESS', '2026-05-19 11:47:43', NULL, NULL),
(954, 1, '832f7aea-fec1-4d10-8fbc-5be170499607', 'RESET PASSWORD', 'USER', 43, 'Password reset for staff: Salma Saidu', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'Chrome 148.0.0.0', 'Windows 10', 'Desktop', 'SUCCESS', '2026-05-19 11:49:07', NULL, NULL),
(955, 1, '832f7aea-fec1-4d10-8fbc-5be170499607', 'LOCK USER', 'USER', 43, 'LOCK USER for staff: Salma Saidu', '{\"is_locked\":0}', '{\"is_locked\":1}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'Chrome 148.0.0.0', 'Windows 10', 'Desktop', 'SUCCESS', '2026-05-19 11:49:18', NULL, NULL),
(956, 1, '832f7aea-fec1-4d10-8fbc-5be170499607', 'UNLOCK USER', 'USER', 43, 'UNLOCK USER for staff: Salma Saidu', '{\"is_locked\":1}', '{\"is_locked\":0}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'Chrome 148.0.0.0', 'Windows 10', 'Desktop', 'SUCCESS', '2026-05-19 11:49:25', NULL, NULL),
(957, 1, '832f7aea-fec1-4d10-8fbc-5be170499607', 'CREATE USER', 'USER', 44, 'Created new staff account for Musa Yunusa', NULL, '{\"full_name\":\"Musa Yunusa\",\"gender\":\"Male\",\"designation\":\"Program Analyst\",\"file_number\":\"4446\",\"email\":\"musa@gmail.com\",\"phone_number\":\"07056369111\",\"department_id\":1}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'Chrome 148.0.0.0', 'Windows 10', 'Desktop', 'SUCCESS', '2026-05-19 11:50:20', NULL, NULL),
(958, 1, '832f7aea-fec1-4d10-8fbc-5be170499607', 'DEACTIVATE USER', 'USER', 43, 'DEACTIVATE USER for Salma Saidu', '{\"is_active\":1}', '{\"is_active\":0}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'Chrome 148.0.0.0', 'Windows 10', 'Desktop', 'SUCCESS', '2026-05-19 11:50:40', NULL, NULL),
(959, 1, '832f7aea-fec1-4d10-8fbc-5be170499607', 'LOCK USER', 'USER', 44, 'LOCK USER for staff: Musa Yunusa', '{\"is_locked\":0}', '{\"is_locked\":1}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'Chrome 148.0.0.0', 'Windows 10', 'Desktop', 'SUCCESS', '2026-05-19 11:50:48', NULL, NULL),
(960, 1, '832f7aea-fec1-4d10-8fbc-5be170499607', 'UNLOCK USER', 'USER', 44, 'UNLOCK USER for staff: Musa Yunusa', '{\"is_locked\":1}', '{\"is_locked\":0}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'Chrome 148.0.0.0', 'Windows 10', 'Desktop', 'SUCCESS', '2026-05-19 11:50:58', NULL, NULL),
(961, 1, '832f7aea-fec1-4d10-8fbc-5be170499607', 'ACTIVATE USER', 'USER', 43, 'ACTIVATE USER for Salma Saidu', '{\"is_active\":0}', '{\"is_active\":1}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'Chrome 148.0.0.0', 'Windows 10', 'Desktop', 'SUCCESS', '2026-05-19 11:51:09', NULL, NULL),
(962, 1, '832f7aea-fec1-4d10-8fbc-5be170499607', 'UPDATE STAFF', 'USER', 44, 'Updated staff fields: designation', '{\"designation\":\"Program Analyst\"}', '{\"designation\":\"Program Analyst II\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'Chrome 148.0.0.0', 'Windows 10', 'Desktop', 'SUCCESS', '2026-05-19 11:59:00', NULL, NULL),
(963, 1, '832f7aea-fec1-4d10-8fbc-5be170499607', 'UPLOAD DOCUMENT', 'DOCUMENT', 72, 'Uploaded document \"dfeerer\"', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'Chrome 148.0.0.0', 'Windows 10', 'Desktop', 'SUCCESS', '2026-05-19 14:06:55', NULL, NULL),
(964, 1, '832f7aea-fec1-4d10-8fbc-5be170499607', 'DOWNLOAD', 'DOCUMENT', 103, 'Downloaded document \"dfeerer\" version_1.0', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'Chrome 148.0.0.0', 'Windows 10', 'Desktop', 'SUCCESS', '2026-05-20 04:47:25', NULL, NULL),
(965, 8, '4ec5843c-d23e-4fa4-8d62-f73f089fbd2e', 'LOGIN', 'AUTH', NULL, 'User logged in', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', 'Edge 148.0.0.0', 'Windows 10', 'Desktop', 'COMPLETED', '2026-05-20 05:19:49', '2026-05-20 05:44:40', 1491),
(966, 8, '4ec5843c-d23e-4fa4-8d62-f73f089fbd2e', 'ACCESS REQUEST', 'DOCUMENT', 100, 'Access request submitted for document \"Documents are usually deleted only after expiration. However, early deletion may be requested in exceptional circumstances with a valid reason.\". Reason: \"fgfghghhg\"', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', 'Edge 148.0.0.0', 'Windows 10', 'Desktop', 'SUCCESS', '2026-05-20 05:20:17', NULL, NULL),
(967, 2, '20f98313-35ff-4e0d-abad-833c5c64b71c', 'LOGIN', 'AUTH', NULL, 'User logged in', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', 'Edge 148.0.0.0', 'Windows 10', 'Desktop', 'SUCCESS', '2026-05-20 05:44:53', NULL, NULL),
(968, 2, '20f98313-35ff-4e0d-abad-833c5c64b71c', 'DOCUMENT_UPDATED', 'DOCUMENT', 101, 'Updated: Title, Description', '{\"title\":\"JKWEJKJKWJ\",\"description\":\"JKLJKJKWK\"}', '{\"title\":\"National Immunization Strengthening Policy 2026\",\"description\":\"Policy framework for improving vaccine coverage, cold chain management, and routine immunization services nationwide.\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', 'Edge 148.0.0.0', 'Windows 10', 'Desktop', 'SUCCESS', '2026-05-20 05:45:39', NULL, NULL),
(969, 2, '20f98313-35ff-4e0d-abad-833c5c64b71c', 'DOCUMENT_UPDATED', 'DOCUMENT', 102, 'Updated: Title, Description', '{\"title\":\"HSHHJS\",\"description\":\"JKJA\"}', '{\"title\":\"Primary Healthcare Service Delivery Guidelines\",\"description\":\"Operational standards and procedures for effective primary healthcare delivery across health facilities.\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', 'Edge 148.0.0.0', 'Windows 10', 'Desktop', 'SUCCESS', '2026-05-20 05:47:28', NULL, NULL),
(970, 1, '832f7aea-fec1-4d10-8fbc-5be170499607', 'DEACTIVATE USER', 'USER', 44, 'DEACTIVATE USER for Musa Yunusa', '{\"is_active\":1}', '{\"is_active\":0}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'Chrome 148.0.0.0', 'Windows 10', 'Desktop', 'SUCCESS', '2026-05-20 06:36:37', NULL, NULL),
(971, 1, '832f7aea-fec1-4d10-8fbc-5be170499607', 'ACTIVATE USER', 'USER', 44, 'ACTIVATE USER for Musa Yunusa', '{\"is_active\":0}', '{\"is_active\":1}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'Chrome 148.0.0.0', 'Windows 10', 'Desktop', 'SUCCESS', '2026-05-20 06:36:53', NULL, NULL),
(972, 1, '832f7aea-fec1-4d10-8fbc-5be170499607', 'DEACTIVATE USER', 'USER', 44, 'DEACTIVATE USER for Musa Yunusa', '{\"is_active\":1}', '{\"is_active\":0}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'Chrome 148.0.0.0', 'Windows 10', 'Desktop', 'SUCCESS', '2026-05-20 06:41:37', NULL, NULL),
(973, 1, '832f7aea-fec1-4d10-8fbc-5be170499607', 'ACTIVATE USER', 'USER', 44, 'ACTIVATE USER for Musa Yunusa', '{\"is_active\":0}', '{\"is_active\":1}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'Chrome 148.0.0.0', 'Windows 10', 'Desktop', 'SUCCESS', '2026-05-20 06:41:45', NULL, NULL),
(974, 1, '832f7aea-fec1-4d10-8fbc-5be170499607', 'DEACTIVATE USER', 'USER', 44, 'DEACTIVATE USER for Musa Yunusa', '{\"is_active\":1}', '{\"is_active\":0}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'Chrome 148.0.0.0', 'Windows 10', 'Desktop', 'SUCCESS', '2026-05-20 06:43:57', NULL, NULL),
(975, 1, '832f7aea-fec1-4d10-8fbc-5be170499607', 'LOCK USER', 'USER', 44, 'LOCK USER for staff: Musa Yunusa', '{\"is_locked\":0}', '{\"is_locked\":1}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'Chrome 148.0.0.0', 'Windows 10', 'Desktop', 'SUCCESS', '2026-05-20 06:44:07', NULL, NULL),
(976, 1, '832f7aea-fec1-4d10-8fbc-5be170499607', 'UNLOCK USER', 'USER', 44, 'UNLOCK USER for staff: Musa Yunusa', '{\"is_locked\":1}', '{\"is_locked\":0}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'Chrome 148.0.0.0', 'Windows 10', 'Desktop', 'SUCCESS', '2026-05-20 06:56:59', NULL, NULL),
(977, 1, '832f7aea-fec1-4d10-8fbc-5be170499607', 'DOWNLOAD', 'PROGRAM REPORT', 14, 'Downloaded report \"BAUCHI STARE MR 2025 REPORT\"', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'Chrome 148.0.0.0', 'Windows 10', 'Desktop', 'SUCCESS', '2026-05-20 07:45:17', NULL, NULL),
(978, 1, '832f7aea-fec1-4d10-8fbc-5be170499607', 'DOWNLOAD', 'PROGRAM REPORT', 14, 'Downloaded report \"BAUCHI STARE MR 2025 REPORT\"', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'Chrome 148.0.0.0', 'Windows 10', 'Desktop', 'SUCCESS', '2026-05-20 07:45:31', NULL, NULL),
(979, 1, '5a52b2b7-22de-4176-81d5-8eb52bc42327', 'LOGIN', 'AUTH', NULL, 'User logged in', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'Chrome 148.0.0.0', 'Windows 10', 'Desktop', 'COMPLETED', '2026-05-21 08:42:48', '2026-05-21 14:15:16', 19948),
(980, 1, '5a52b2b7-22de-4176-81d5-8eb52bc42327', 'ACTIVATE USER', 'USER', 44, 'ACTIVATE USER for Musa Yunusa', '{\"is_active\":0}', '{\"is_active\":1}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'Chrome 148.0.0.0', 'Windows 10', 'Desktop', 'SUCCESS', '2026-05-21 08:44:39', NULL, NULL),
(981, 2, '1dd5b6da-4b8c-4fa2-8d1f-4d3ef3ab1ee8', 'LOGIN', 'AUTH', NULL, 'User logged in', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', 'Edge 148.0.0.0', 'Windows 10', 'Desktop', 'COMPLETED', '2026-05-21 09:05:37', '2026-05-21 09:08:05', 148),
(982, 2, 'c345f15e-4ba6-499e-b98c-3855b5def59e', 'LOGIN', 'AUTH', NULL, 'User logged in', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', 'Edge 148.0.0.0', 'Windows 10', 'Desktop', 'COMPLETED', '2026-05-21 09:08:17', '2026-05-21 09:10:21', 124),
(983, 2, 'ce14da20-8316-4fb4-aa1c-e3914adc8382', 'LOGIN', 'AUTH', NULL, 'User logged in', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', 'Edge 148.0.0.0', 'Windows 10', 'Desktop', 'COMPLETED', '2026-05-21 09:10:31', '2026-05-21 09:10:39', 8),
(984, 8, '15f4bf57-aefd-42e2-b996-6da1667919b4', 'LOGIN', 'AUTH', NULL, 'User logged in', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', 'Edge 148.0.0.0', 'Windows 10', 'Desktop', 'COMPLETED', '2026-05-21 09:10:58', '2026-05-21 14:19:27', 18509),
(985, 8, '15f4bf57-aefd-42e2-b996-6da1667919b4', 'DOWNLOAD', 'DOCUMENT', 103, 'Downloaded document \"dfeerer\" version_1.0', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', 'Edge 148.0.0.0', 'Windows 10', 'Desktop', 'SUCCESS', '2026-01-21 09:12:13', NULL, NULL),
(986, 1, '5a52b2b7-22de-4176-81d5-8eb52bc42327', 'APPROVE ACCESS', 'DOCUMENT', 100, 'Approved access to document \"Documents are usually deleted only after expiration. However, early deletion may be requested in exceptional circumstances with a valid reason.\" for Fatima Lukman expires at: 2026-05-25T10:13', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'Chrome 148.0.0.0', 'Windows 10', 'Desktop', 'SUCCESS', '2026-05-21 09:13:23', NULL, NULL),
(987, 8, '15f4bf57-aefd-42e2-b996-6da1667919b4', 'DOWNLOAD', 'DOCUMENT', 100, 'Downloaded document \"Documents are usually deleted only after expiration. However, early deletion may be requested in exceptional circumstances with a valid reason.\" version_2.0', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', 'Edge 148.0.0.0', 'Windows 10', 'Desktop', 'SUCCESS', '2026-04-21 09:13:37', NULL, NULL),
(988, 8, '15f4bf57-aefd-42e2-b996-6da1667919b4', 'UPDATE PROFILE', 'USER', 8, 'Updated profile fields: title', '{\"title\":\"Miss.\"}', '{\"title\":\"Mrs.\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', 'Edge 148.0.0.0', 'Windows 10', 'Desktop', 'SUCCESS', '2026-06-21 10:24:53', NULL, NULL),
(989, 8, '15f4bf57-aefd-42e2-b996-6da1667919b4', 'UPDATE PROFILE', 'USER', 8, 'Updated profile fields: division_unit_state', '{\"division_unit_state\":\"\"}', '{\"division_unit_state\":\"ICT\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', 'Edge 148.0.0.0', 'Windows 10', 'Desktop', 'SUCCESS', '2026-07-21 10:26:59', NULL, NULL),
(990, 8, '15f4bf57-aefd-42e2-b996-6da1667919b4', 'UPDATE PROFILE', 'USER', 8, 'Updated profile fields: designation', '{\"designation\":\"Accountant\"}', '{\"designation\":\"Accountant 1\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', 'Edge 148.0.0.0', 'Windows 10', 'Desktop', 'SUCCESS', '2026-02-21 10:27:17', NULL, NULL),
(991, 8, '15f4bf57-aefd-42e2-b996-6da1667919b4', 'UPDATE PROFILE', 'USER', 8, 'Updated profile fields: phone_number', '{\"phone_number\":\"08042537629\"}', '{\"phone_number\":\"08042537624\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', 'Edge 148.0.0.0', 'Windows 10', 'Desktop', 'SUCCESS', '2026-03-21 10:28:44', NULL, NULL),
(992, 8, '15f4bf57-aefd-42e2-b996-6da1667919b4', 'UPDATE PROFILE', 'USER', 8, 'Updated profile fields: division_unit_state', '{\"division_unit_state\":\"ICT\"}', '{\"division_unit_state\":\"M&E\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', 'Edge 148.0.0.0', 'Windows 10', 'Desktop', 'SUCCESS', '2026-08-21 10:29:05', NULL, NULL),
(993, 8, '15f4bf57-aefd-42e2-b996-6da1667919b4', 'DOWNLOAD', 'DOCUMENT', 99, 'Downloaded document \"Health Insurance Portability and Accountability Act (HIPAA)\" version_1.0', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', 'Edge 148.0.0.0', 'Windows 10', 'Desktop', 'SUCCESS', '2026-09-21 10:30:27', NULL, NULL),
(994, 8, '15f4bf57-aefd-42e2-b996-6da1667919b4', 'DOWNLOAD', 'DOCUMENT', 99, 'Downloaded document \"Health Insurance Portability and Accountability Act (HIPAA)\" version_1.0', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', 'Edge 148.0.0.0', 'Windows 10', 'Desktop', 'SUCCESS', '2026-10-21 10:30:35', NULL, NULL),
(995, 8, '15f4bf57-aefd-42e2-b996-6da1667919b4', 'DOWNLOAD', 'DOCUMENT', 99, 'Downloaded document \"Health Insurance Portability and Accountability Act (HIPAA)\" version_1.0', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', 'Edge 148.0.0.0', 'Windows 10', 'Desktop', 'SUCCESS', '2026-11-21 10:30:42', NULL, NULL),
(996, 8, '15f4bf57-aefd-42e2-b996-6da1667919b4', 'DOWNLOAD', 'DOCUMENT', 99, 'Downloaded document \"Health Insurance Portability and Accountability Act (HIPAA)\" version_1.0', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', 'Edge 148.0.0.0', 'Windows 10', 'Desktop', 'SUCCESS', '2026-05-21 10:30:50', NULL, NULL),
(997, 1, '5a52b2b7-22de-4176-81d5-8eb52bc42327', 'DOCUMENT_UPDATED', 'DOCUMENT', 103, 'Updated: Classification', '{\"classification\":\"Public\"}', '{\"classification\":\"Confidential\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'Chrome 148.0.0.0', 'Windows 10', 'Desktop', 'SUCCESS', '2026-05-21 12:37:27', NULL, NULL),
(998, 8, '15f4bf57-aefd-42e2-b996-6da1667919b4', 'ACCESS REQUEST', 'DOCUMENT', 103, 'Access request submitted for document \"dfeerer\". Reason: \"gghghhg\"', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', 'Edge 148.0.0.0', 'Windows 10', 'Desktop', 'SUCCESS', '2026-05-21 12:37:55', NULL, NULL),
(999, 1, '5a52b2b7-22de-4176-81d5-8eb52bc42327', 'DENIED ACCESS', 'DOCUMENT', 103, 'Denied access to document \"dfeerer\" for Fatima Lukman', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'Chrome 148.0.0.0', 'Windows 10', 'Desktop', 'SUCCESS', '2026-05-21 12:38:41', NULL, NULL),
(1000, 1, '5a52b2b7-22de-4176-81d5-8eb52bc42327', 'DOCUMENT_UPDATED', 'DOCUMENT', 99, 'Updated: Classification', '{\"classification\":\"Public\"}', '{\"classification\":\"Confidential\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'Chrome 148.0.0.0', 'Windows 10', 'Desktop', 'SUCCESS', '2026-05-21 12:47:11', NULL, NULL),
(1001, 8, '15f4bf57-aefd-42e2-b996-6da1667919b4', 'ACCESS REQUEST', 'DOCUMENT', 99, 'Access request submitted for document \"Health Insurance Portability and Accountability Act (HIPAA)\". Reason: \"uyyuu\"', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', 'Edge 148.0.0.0', 'Windows 10', 'Desktop', 'SUCCESS', '2026-05-21 12:47:32', NULL, NULL),
(1002, 1, '5a52b2b7-22de-4176-81d5-8eb52bc42327', 'DOCUMENT_UPDATED', 'DOCUMENT', 100, 'Updated: Classification', '{\"classification\":\"Confidential\"}', '{\"classification\":\"Internal\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'Chrome 148.0.0.0', 'Windows 10', 'Desktop', 'SUCCESS', '2026-05-21 13:21:19', NULL, NULL),
(1003, 8, '15f4bf57-aefd-42e2-b996-6da1667919b4', 'DOWNLOAD', 'DOCUMENT', 100, 'Downloaded document \"Documents are usually deleted only after expiration. However, early deletion may be requested in exceptional circumstances with a valid reason.\" version_2.0', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', 'Edge 148.0.0.0', 'Windows 10', 'Desktop', 'SUCCESS', '2026-05-21 13:21:32', NULL, NULL),
(1004, 8, '15f4bf57-aefd-42e2-b996-6da1667919b4', 'DOWNLOAD', 'DOCUMENT', 100, 'Downloaded document \"Documents are usually deleted only after expiration. However, early deletion may be requested in exceptional circumstances with a valid reason.\" version_2.0', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', 'Edge 148.0.0.0', 'Windows 10', 'Desktop', 'SUCCESS', '2026-05-21 13:37:34', NULL, NULL),
(1005, 8, '15f4bf57-aefd-42e2-b996-6da1667919b4', 'DOWNLOAD', 'DOCUMENT', 100, 'Downloaded document \"Documents are usually deleted only after expiration. However, early deletion may be requested in exceptional circumstances with a valid reason.\" version_2.0', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', 'Edge 148.0.0.0', 'Windows 10', 'Desktop', 'SUCCESS', '2026-05-21 13:37:55', NULL, NULL),
(1006, 1, '5a52b2b7-22de-4176-81d5-8eb52bc42327', 'DOCUMENT_UPDATED', 'DOCUMENT', 100, 'Updated: Classification', '{\"classification\":\"Internal\"}', '{\"classification\":\"Confidential\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'Chrome 148.0.0.0', 'Windows 10', 'Desktop', 'SUCCESS', '2026-05-21 13:38:35', NULL, NULL),
(1007, 8, '15f4bf57-aefd-42e2-b996-6da1667919b4', 'ACCESS REQUEST', 'DOCUMENT', 103, 'Access request submitted for document \"dfeerer\". Reason: \"sdwdww\"', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', 'Edge 148.0.0.0', 'Windows 10', 'Desktop', 'SUCCESS', '2026-05-21 13:40:33', NULL, NULL),
(1008, 8, '15f4bf57-aefd-42e2-b996-6da1667919b4', 'ACCESS REQUEST', 'DOCUMENT', 101, 'Access request submitted for document \"National Immunization Strengthening Policy 2026\". Reason: \"gfhfxf\"', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', 'Edge 148.0.0.0', 'Windows 10', 'Desktop', 'SUCCESS', '2026-05-21 14:10:04', NULL, NULL),
(1009, 2, '939fd467-5be5-46dd-a6e3-0f59a4319897', 'LOGIN', 'AUTH', NULL, 'User logged in', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'Chrome 148.0.0.0', 'Windows 10', 'Desktop', 'COMPLETED', '2026-05-21 14:15:29', '2026-05-21 14:19:00', 211),
(1010, 11, '498cbbc7-c259-41ae-a080-0323610bf0a0', 'LOGIN', 'AUTH', NULL, 'User logged in', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', 'Edge 148.0.0.0', 'Windows 10', 'Desktop', 'COMPLETED', '2026-05-21 14:19:36', '2026-05-21 14:24:53', 317),
(1011, 8, '82c9335b-1919-46bc-a1a1-9cc523fd6c94', 'LOGIN', 'AUTH', NULL, 'User logged in', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'Chrome 148.0.0.0', 'Windows 10', 'Desktop', 'COMPLETED', '2026-05-21 14:19:50', '2026-05-21 14:34:50', 900),
(1012, 11, '498cbbc7-c259-41ae-a080-0323610bf0a0', 'APPROVE ACCESS REQUEST', 'DOCUMENT', 101, 'Approved access request for \"National Immunization Strengthening Policy 2026\"', '{\"previous_status\":\"Pending_Admin_Approval\"}', '{\"new_status\":\"Approved\",\"document_title\":\"National Immunization Strengthening Policy 2026\",\"comment\":\"approved\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', 'Edge 148.0.0.0', 'Windows 10', 'Desktop', 'SUCCESS', '2026-05-21 14:20:34', NULL, NULL),
(1013, 8, '82c9335b-1919-46bc-a1a1-9cc523fd6c94', 'DOWNLOAD', 'DOCUMENT', 101, 'Downloaded document \"National Immunization Strengthening Policy 2026\" v1.0', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'Chrome 148.0.0.0', 'Windows 10', 'Desktop', 'SUCCESS', '2026-05-21 14:20:57', NULL, NULL),
(1014, 8, '82c9335b-1919-46bc-a1a1-9cc523fd6c94', 'DOWNLOAD', 'DOCUMENT', 101, 'Downloaded document \"National Immunization Strengthening Policy 2026\" v1.0', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'Chrome 148.0.0.0', 'Windows 10', 'Desktop', 'SUCCESS', '2026-05-21 14:21:36', NULL, NULL),
(1015, 1, '5ef66c95-ecac-4907-ab4c-fbf91c637422', 'LOGIN', 'AUTH', NULL, 'User logged in', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', 'Edge 148.0.0.0', 'Windows 10', 'Desktop', 'COMPLETED', '2026-05-21 14:25:13', '2026-05-21 14:35:07', 594),
(1016, 8, '82c9335b-1919-46bc-a1a1-9cc523fd6c94', 'DOWNLOAD', 'DOCUMENT', 101, 'Downloaded document \"National Immunization Strengthening Policy 2026\" v1.0', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'Chrome 148.0.0.0', 'Windows 10', 'Desktop', 'SUCCESS', '2026-05-21 14:26:11', NULL, NULL),
(1017, 8, '82c9335b-1919-46bc-a1a1-9cc523fd6c94', 'DOWNLOAD', 'DOCUMENT', 100, 'Downloaded document \"Documents are usually deleted only after expiration. However, early deletion may be requested in exceptional circumstances with a valid reason.\" version_2.0', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'Chrome 148.0.0.0', 'Windows 10', 'Desktop', 'SUCCESS', '2026-05-21 14:27:20', NULL, NULL),
(1018, 8, '82c9335b-1919-46bc-a1a1-9cc523fd6c94', 'DOWNLOAD', 'DOCUMENT', 100, 'Downloaded document \"Documents are usually deleted only after expiration. However, early deletion may be requested in exceptional circumstances with a valid reason.\" version_2.0', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'Chrome 148.0.0.0', 'Windows 10', 'Desktop', 'SUCCESS', '2026-05-21 14:28:58', NULL, NULL),
(1019, 8, 'd8dfe108-1539-4613-9fa6-c5b2919830d1', 'LOGIN', 'AUTH', NULL, 'User logged in', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', 'Edge 148.0.0.0', 'Windows 10', 'Desktop', 'COMPLETED', '2026-05-22 20:00:59', '2026-05-22 20:01:54', 55),
(1020, 8, '2a31c751-c55c-459f-ae86-9ade5cd01e3b', 'LOGIN', 'AUTH', NULL, 'User logged in', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'Chrome 148.0.0.0', 'Windows 10', 'Desktop', 'COMPLETED', '2026-05-22 20:01:49', '2026-05-22 21:45:16', 6207),
(1021, 1, 'b58decc4-929b-48dc-9d54-b1b562258e0a', 'LOGIN', 'AUTH', NULL, 'User logged in', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', 'Edge 148.0.0.0', 'Windows 10', 'Desktop', 'COMPLETED', '2026-05-22 20:02:00', '2026-05-22 21:45:35', 6215),
(1022, 8, '2a31c751-c55c-459f-ae86-9ade5cd01e3b', 'CREATE TICKET', 'SUPPORT', 28, 'Created support ticket #505293', NULL, '{\"ticket_number\":\"505293\",\"subject\":\"jfhhjf\",\"description\":\"shjjhhjjhdf\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'Chrome 148.0.0.0', 'Windows 10', 'Desktop', 'SUCCESS', '2026-05-22 21:19:27', NULL, NULL),
(1023, 8, '2a31c751-c55c-459f-ae86-9ade5cd01e3b', 'CREATE TICKET', 'SUPPORT', 29, 'Created support ticket #141354', NULL, '{\"ticket_number\":\"141354\",\"subject\":\"kjjhhj\",\"description\":\"hjhhjhjjh\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'Chrome 148.0.0.0', 'Windows 10', 'Desktop', 'SUCCESS', '2026-05-22 21:20:22', NULL, NULL),
(1024, 1, 'b58decc4-929b-48dc-9d54-b1b562258e0a', 'ASSIGN TEAM LEAD', 'PROGRAM', 20, 'Assigned Fatima Lukman (1708) as Team Lead for \"MR 2026\" in Enugu', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', 'Edge 148.0.0.0', 'Windows 10', 'Desktop', 'SUCCESS', '2026-05-22 21:28:37', NULL, NULL),
(1025, 1, 'b58decc4-929b-48dc-9d54-b1b562258e0a', 'CREATE PROGRAM', 'PROGRAM', 23, 'Created new program: yyuiuuiui', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', 'Edge 148.0.0.0', 'Windows 10', 'Desktop', 'SUCCESS', '2026-05-22 21:35:35', NULL, NULL),
(1026, 1, 'b58decc4-929b-48dc-9d54-b1b562258e0a', 'ASSIGN TEAM LEAD', 'PROGRAM', 21, 'Assigned Fatima Lukman (1708) as Team Lead for \"yyuiuuiui\" in Delta', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', 'Edge 148.0.0.0', 'Windows 10', 'Desktop', 'SUCCESS', '2026-05-22 21:36:17', NULL, NULL),
(1027, 8, '2a31c751-c55c-459f-ae86-9ade5cd01e3b', 'UPLOAD PROGRAM REPORT', 'PROGRAM', 15, 'Uploaded report \"hhyuuyuy\" for program \"MR 2026\" (Enugu)', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'Chrome 148.0.0.0', 'Windows 10', 'Desktop', 'SUCCESS', '2026-05-22 21:41:00', NULL, NULL),
(1028, 8, '2a31c751-c55c-459f-ae86-9ade5cd01e3b', 'DOWNLOAD', 'PROGRAM REPORT', 15, 'Downloaded report \"hhyuuyuy\"', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'Chrome 148.0.0.0', 'Windows 10', 'Desktop', 'SUCCESS', '2026-05-22 21:41:11', NULL, NULL),
(1029, 8, '2a31c751-c55c-459f-ae86-9ade5cd01e3b', 'DOWNLOAD', 'PROGRAM REPORT', 15, 'Downloaded report \"hhyuuyuy\"', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'Chrome 148.0.0.0', 'Windows 10', 'Desktop', 'SUCCESS', '2026-05-22 21:41:22', NULL, NULL),
(1030, 11, '154af459-434f-4782-a8d8-67e5b31e32de', 'LOGIN', 'AUTH', NULL, 'User logged in', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', 'Edge 148.0.0.0', 'Windows 10', 'Desktop', 'COMPLETED', '2026-05-23 04:48:37', '2026-05-23 06:09:08', 4831),
(1031, 8, '6d97924a-da51-42a7-ab6f-5b03e3c656c7', 'LOGIN', 'AUTH', NULL, 'User logged in', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'Chrome 148.0.0.0', 'Windows 10', 'Desktop', 'COMPLETED', '2026-05-23 04:48:45', '2026-05-23 06:09:12', 4827),
(1032, 1, 'e50ba555-4208-45f9-9d53-29f2908f7b25', 'LOGIN', 'AUTH', NULL, 'User logged in', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 OPR/131.0.0.0', 'Opera 131.0.0.0', 'Windows 10', 'Desktop', 'COMPLETED', '2026-05-23 04:50:09', '2026-05-23 06:20:19', 5410),
(1033, 11, '52f1a8ee-5050-43e7-91d1-b704a9e4de19', 'LOGIN', 'AUTH', NULL, 'User logged in', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'Chrome 148.0.0.0', 'Windows 10', 'Desktop', 'COMPLETED', '2026-05-23 06:09:33', '2026-05-23 06:20:05', 632);
INSERT INTO `audit_logs` (`id`, `user_id`, `session_id`, `action`, `entity_type`, `entity_id`, `description`, `old_values`, `new_values`, `ip_address`, `user_agent_raw`, `browser`, `os`, `device`, `status`, `created_at`, `logout_at`, `session_duration`) VALUES
(1034, 11, '6b9c92a0-8dc0-40d8-8f0d-ec990a3103f3', 'LOGIN', 'AUTH', NULL, 'User logged in', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', 'Edge 148.0.0.0', 'Windows 10', 'Desktop', 'SUCCESS', '2026-05-25 08:04:04', NULL, NULL),
(1035, 11, '70848707-c211-4f30-8fe4-e4ec4387c972', 'LOGIN', 'AUTH', NULL, 'User logged in', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', 'Edge 148.0.0.0', 'Windows 10', 'Desktop', 'COMPLETED', '2026-05-26 08:58:03', '2026-05-26 09:22:25', 1462),
(1036, 11, 'eee6edb6-13e9-4d9e-b344-4b242cf2ce7e', 'LOGIN', 'AUTH', NULL, 'User logged in', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', 'Edge 148.0.0.0', 'Windows 10', 'Desktop', 'COMPLETED', '2026-06-01 08:17:57', '2026-06-01 20:24:52', 43615),
(1037, 1, '03d1f4e1-03fb-4924-acfb-bcf3d0e0059c', 'LOGIN', 'AUTH', NULL, 'User logged in', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'Chrome 148.0.0.0', 'Windows 10', 'Desktop', 'COMPLETED', '2026-06-01 08:19:01', '2026-06-01 20:24:58', 43557),
(1038, 11, 'eee6edb6-13e9-4d9e-b344-4b242cf2ce7e', 'GENERATE PUBLIC LINK', 'DOCUMENT', 99, 'Generated public access link for \"Health Insurance Portability and Accountability Act (HIPAA)\"', NULL, '{\"document_title\":\"Health Insurance Portability and Accountability Act (HIPAA)\",\"link\":\"http://localhost:5173/public/document/e230316dd36034b9bd3ca09f6f0db800423749043b7e160085c5d73700e1429b\",\"expiry_date\":\"2026-06-10T10:27\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', 'Edge 148.0.0.0', 'Windows 10', 'Desktop', 'SUCCESS', '2026-06-01 09:28:02', NULL, NULL),
(1039, 11, 'eee6edb6-13e9-4d9e-b344-4b242cf2ce7e', 'DOWNLOAD', 'DOCUMENT', 101, 'Downloaded document \"National Immunization Strengthening Policy 2026\" version_1.0', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', 'Edge 148.0.0.0', 'Windows 10', 'Desktop', 'SUCCESS', '2026-06-01 09:41:46', NULL, NULL),
(1040, 1, '03d1f4e1-03fb-4924-acfb-bcf3d0e0059c', 'DELETE DOCUMENT', 'DOCUMENT', 100, 'Deleted document \"Documents are usually deleted only after expiration. However, early deletion may be requested in exceptional circumstances with a valid reason.\". Reason: ttt. Requested at: 2026-06-01 09:43:54', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'Chrome 148.0.0.0', 'Windows 10', 'Desktop', 'SUCCESS', '2026-06-01 09:43:54', NULL, NULL),
(1041, 11, 'eee6edb6-13e9-4d9e-b344-4b242cf2ce7e', 'DEACTIVATE PARTNER', 'USER', 18, 'Deactivated partner \"Nigeria Centre for Disease Control and Prevention (NCDC)\" account', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', 'Edge 148.0.0.0', 'Windows 10', 'Desktop', 'SUCCESS', '2026-06-01 10:13:25', NULL, NULL),
(1042, 11, 'eee6edb6-13e9-4d9e-b344-4b242cf2ce7e', 'ACTIVATE PARTNER', 'USER', 18, 'Activated partner \"Nigeria Centre for Disease Control and Prevention (NCDC)\" account', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', 'Edge 148.0.0.0', 'Windows 10', 'Desktop', 'SUCCESS', '2026-06-01 10:22:58', NULL, NULL),
(1043, 11, 'eee6edb6-13e9-4d9e-b344-4b242cf2ce7e', 'DEACTIVATE PARTNER', 'USER', 18, 'Deactivated partner \"Nigeria Centre for Disease Control and Prevention (NCDC)\" account', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', 'Edge 148.0.0.0', 'Windows 10', 'Desktop', 'SUCCESS', '2026-06-01 10:29:42', NULL, NULL),
(1044, 11, 'eee6edb6-13e9-4d9e-b344-4b242cf2ce7e', 'ACTIVATE PARTNER', 'USER', 18, 'Activated partner \"Nigeria Centre for Disease Control and Prevention (NCDC)\" account', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', 'Edge 148.0.0.0', 'Windows 10', 'Desktop', 'SUCCESS', '2026-06-01 10:40:12', NULL, NULL),
(1045, 11, 'eee6edb6-13e9-4d9e-b344-4b242cf2ce7e', 'APPROVE ACCESS REQUEST', 'DOCUMENT', 101, 'Approved access request for \"National Immunization Strengthening Policy 2026\"', '{\"previous_status\":\"Pending_Admin_Approval\"}', '{\"new_status\":\"Approved\",\"document_title\":\"National Immunization Strengthening Policy 2026\",\"comment\":\"Approved\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', 'Edge 148.0.0.0', 'Windows 10', 'Desktop', 'SUCCESS', '2026-06-01 11:03:09', NULL, NULL),
(1046, 1, '03d1f4e1-03fb-4924-acfb-bcf3d0e0059c', 'DOWNLOAD', 'DOCUMENT', 101, 'Downloaded document \"National Immunization Strengthening Policy 2026\" v1.0', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'Chrome 148.0.0.0', 'Windows 10', 'Desktop', 'SUCCESS', '2026-06-01 11:03:40', NULL, NULL),
(1047, 1, '03d1f4e1-03fb-4924-acfb-bcf3d0e0059c', 'DOWNLOAD', 'DOCUMENT', 103, 'Downloaded document \"dfeerer\" version_1.0', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'Chrome 148.0.0.0', 'Windows 10', 'Desktop', 'SUCCESS', '2026-06-01 11:19:52', NULL, NULL),
(1048, 1, '03d1f4e1-03fb-4924-acfb-bcf3d0e0059c', 'DOWNLOAD', 'DOCUMENT', 103, 'Downloaded document \"dfeerer\" version_1.0', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'Chrome 148.0.0.0', 'Windows 10', 'Desktop', 'SUCCESS', '2026-06-01 11:19:59', NULL, NULL),
(1049, 1, '03d1f4e1-03fb-4924-acfb-bcf3d0e0059c', 'DOWNLOAD', 'DOCUMENT', 103, 'Downloaded document \"dfeerer\" version_1.0', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'Chrome 148.0.0.0', 'Windows 10', 'Desktop', 'SUCCESS', '2026-06-01 11:25:51', NULL, NULL),
(1050, 1, '03d1f4e1-03fb-4924-acfb-bcf3d0e0059c', 'DOWNLOAD', 'DOCUMENT', 103, 'Downloaded document \"dfeerer\" version_1.0', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'Chrome 148.0.0.0', 'Windows 10', 'Desktop', 'SUCCESS', '2026-06-01 11:26:06', NULL, NULL),
(1051, 1, '03d1f4e1-03fb-4924-acfb-bcf3d0e0059c', 'DOCUMENT ARCHIVED', 'DOCUMENT', 103, 'Archived document \"dfeerer\"', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'Chrome 148.0.0.0', 'Windows 10', 'Desktop', 'SUCCESS', '2026-06-01 11:27:25', NULL, NULL),
(1052, 1, '03d1f4e1-03fb-4924-acfb-bcf3d0e0059c', 'UPLOAD DOCUMENT', 'DOCUMENT', 73, 'Uploaded document \"ytytuyuyy\"', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'Chrome 148.0.0.0', 'Windows 10', 'Desktop', 'SUCCESS', '2026-06-01 11:29:53', NULL, NULL),
(1053, 1, '03d1f4e1-03fb-4924-acfb-bcf3d0e0059c', 'DOCUMENT DELETION REQUEST', 'DOCUMENT', 104, 'Sent deletion request for document \"ytytuyuyy\". Reason: erertrtr. Requested at: 2026-06-01 11:30:56', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'Chrome 148.0.0.0', 'Windows 10', 'Desktop', 'SUCCESS', '2026-06-01 11:30:56', NULL, NULL),
(1054, 11, 'eee6edb6-13e9-4d9e-b344-4b242cf2ce7e', 'DELETE DOCUMENT', 'DOCUMENT', 104, 'Deleted document \"ytytuyuyy\"', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', 'Edge 148.0.0.0', 'Windows 10', 'Desktop', 'SUCCESS', '2026-06-01 11:43:08', NULL, NULL),
(1055, 11, 'eee6edb6-13e9-4d9e-b344-4b242cf2ce7e', 'REJECT RESTORE DOCUMENT', 'DOCUMENT', 103, 'Rejected restore document request for \"dfeerer\"', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', 'Edge 148.0.0.0', 'Windows 10', 'Desktop', 'SUCCESS', '2026-06-01 12:01:47', NULL, NULL),
(1056, 11, 'eee6edb6-13e9-4d9e-b344-4b242cf2ce7e', 'APPROVED RESTORE DOCUMENT', 'DOCUMENT', 103, 'Approved restore document request for \"dfeerer\"', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', 'Edge 148.0.0.0', 'Windows 10', 'Desktop', 'SUCCESS', '2026-06-01 12:03:52', NULL, NULL),
(1057, 1, '03d1f4e1-03fb-4924-acfb-bcf3d0e0059c', 'ASSIGN TEAM LEAD', 'PROGRAM', 22, 'Assigned Otowo (2015) as Team Lead for \"MR 2026\" in Bauchi', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'Chrome 148.0.0.0', 'Windows 10', 'Desktop', 'SUCCESS', '2026-06-01 12:35:32', NULL, NULL),
(1058, 11, 'eee6edb6-13e9-4d9e-b344-4b242cf2ce7e', 'UPLOAD PROGRAM REPORT', 'PROGRAM', 16, 'Uploaded report \"erreerereer\" for program \"MR 2026\" (Bauchi)', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', 'Edge 148.0.0.0', 'Windows 10', 'Desktop', 'SUCCESS', '2026-06-01 12:43:26', NULL, NULL),
(1059, 11, 'eee6edb6-13e9-4d9e-b344-4b242cf2ce7e', 'DOWNLOAD', 'PROGRAM REPORT', 16, 'Downloaded report \"erreerereer\"', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', 'Edge 148.0.0.0', 'Windows 10', 'Desktop', 'SUCCESS', '2026-06-01 12:44:30', NULL, NULL),
(1060, 11, 'eee6edb6-13e9-4d9e-b344-4b242cf2ce7e', 'DOWNLOAD', 'PROGRAM REPORT', 16, 'Downloaded report \"erreerereer\"', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', 'Edge 148.0.0.0', 'Windows 10', 'Desktop', 'SUCCESS', '2026-06-01 12:46:21', NULL, NULL),
(1061, 11, 'eee6edb6-13e9-4d9e-b344-4b242cf2ce7e', 'DOWNLOAD', 'PROGRAM REPORT', 16, 'Downloaded report \"erreerereer\"', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', 'Edge 148.0.0.0', 'Windows 10', 'Desktop', 'SUCCESS', '2026-06-01 12:46:46', NULL, NULL),
(1062, 1, '03d1f4e1-03fb-4924-acfb-bcf3d0e0059c', 'DOWNLOAD', 'PROGRAM REPORT', 14, 'Downloaded report \"BAUCHI STARE MR 2025 REPORT\"', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'Chrome 148.0.0.0', 'Windows 10', 'Desktop', 'SUCCESS', '2026-06-01 12:50:58', NULL, NULL),
(1063, 1, '03d1f4e1-03fb-4924-acfb-bcf3d0e0059c', 'UPLOAD DOCUMENT', 'DOCUMENT', 74, 'Uploaded document \"Testing Me\"', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'Chrome 148.0.0.0', 'Windows 10', 'Desktop', 'SUCCESS', '2026-06-01 14:18:46', NULL, NULL),
(1064, 1, '03d1f4e1-03fb-4924-acfb-bcf3d0e0059c', 'DOCUMENT_UPDATED', 'DOCUMENT', 105, 'Updated: Title', '{\"title\":\"Testing Me\"}', '{\"title\":\"Testing Me2\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'Chrome 148.0.0.0', 'Windows 10', 'Desktop', 'SUCCESS', '2026-06-01 20:09:52', NULL, NULL),
(1065, 1, '03d1f4e1-03fb-4924-acfb-bcf3d0e0059c', 'UPDATE DOCUMENT', 'DOCUMENT', 105, 'Updated: Title', '{\"title\":\"Testing Me2\"}', '{\"title\":\"Testing Me3\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'Chrome 148.0.0.0', 'Windows 10', 'Desktop', 'SUCCESS', '2026-06-01 20:13:08', NULL, NULL),
(1066, 1, 'fabbfcbd-a397-4319-b488-be91b8796cbb', 'LOGIN', 'AUTH', NULL, 'User logged in', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'Chrome 148.0.0.0', 'Windows 10', 'Desktop', 'COMPLETED', '2026-06-02 08:29:26', '2026-06-02 10:43:46', 8060),
(1067, 11, '3ec49fd7-f2a6-40f3-86bf-1f13296cb997', 'LOGIN', 'AUTH', NULL, 'User logged in', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', 'Edge 148.0.0.0', 'Windows 10', 'Desktop', 'COMPLETED', '2026-06-02 08:29:32', '2026-06-02 14:53:38', 23046),
(1068, 31, 'b0f42c6a-4276-433e-a378-61da40b88609', 'LOGIN', 'AUTH', NULL, 'User logged in', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'Chrome 148.0.0.0', 'Windows 10', 'Desktop', 'COMPLETED', '2026-06-02 10:44:44', '2026-06-02 14:53:22', 14918),
(1069, 31, 'b0f42c6a-4276-433e-a378-61da40b88609', 'UPDATE TICKET STATUS', 'TICKET', 29, 'Update support ticket #141354: status', '{\"status\":\"Open\"}', '{\"status\":\"Resolved\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'Chrome 148.0.0.0', 'Windows 10', 'Desktop', 'SUCCESS', '2026-06-02 10:54:51', NULL, NULL),
(1070, 11, 'fd524895-cfb4-4375-8d72-402475f2b0ae', 'LOGIN', 'AUTH', NULL, 'User logged in', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', 'Edge 148.0.0.0', 'Windows 10', 'Desktop', 'SUCCESS', '2026-06-03 08:14:36', NULL, NULL),
(1071, 31, '3f61a4bb-a5af-4d4e-9730-2903ff8c88a8', 'LOGIN', 'AUTH', NULL, 'User logged in', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'Chrome 148.0.0.0', 'Windows 10', 'Desktop', 'COMPLETED', '2026-06-03 08:15:34', '2026-06-03 11:45:39', 12605),
(1072, 31, '3f61a4bb-a5af-4d4e-9730-2903ff8c88a8', 'UPDATE TICKET STATUS', 'TICKET', 21, 'Update support ticket #285120: status', '{\"status\":\"In Progress\"}', '{\"status\":\"Resolved\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'Chrome 148.0.0.0', 'Windows 10', 'Desktop', 'SUCCESS', '2026-06-03 11:08:59', NULL, NULL),
(1073, 31, '3f61a4bb-a5af-4d4e-9730-2903ff8c88a8', 'UPDATE TICKET STATUS', 'TICKET', 11, 'Update support ticket #926075: status', '{\"status\":\"Open\"}', '{\"status\":\"In Progress\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'Chrome 148.0.0.0', 'Windows 10', 'Desktop', 'SUCCESS', '2026-06-03 11:09:53', NULL, NULL),
(1074, 31, '48f41ff4-0c9d-459f-895b-ba2ee24d093a', 'LOGIN', 'AUTH', NULL, 'User logged in', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'Chrome 148.0.0.0', 'Windows 10', 'Desktop', 'SUCCESS', '2026-06-03 12:49:21', NULL, NULL),
(1075, 31, '4e80d5a2-0ed4-45e3-b1ab-6db9dca1272c', 'LOGIN', 'AUTH', NULL, 'User logged in', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'Chrome 148.0.0.0', 'Windows 10', 'Desktop', 'COMPLETED', '2026-06-03 13:51:28', '2026-06-03 14:13:02', 1294),
(1076, 11, 'ecfc796a-2a99-47e0-b7ad-45563e6d8f3c', 'LOGIN', 'AUTH', NULL, 'User logged in', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', 'Edge 148.0.0.0', 'Windows 10', 'Desktop', 'COMPLETED', '2026-06-04 08:59:18', '2026-06-04 08:59:23', 5),
(1077, 31, '4c162f52-a7bd-47dd-a719-f4979d5a7681', 'LOGIN', 'AUTH', NULL, 'User logged in', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'Chrome 148.0.0.0', 'Windows 10', 'Desktop', 'SUCCESS', '2026-06-04 08:59:37', NULL, NULL),
(1078, 31, 'f7b978c8-16f2-4529-84e1-b65ff53bc277', 'LOGIN', 'AUTH', NULL, 'User logged in', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'Chrome 148.0.0.0', 'Windows 10', 'Desktop', 'COMPLETED', '2026-06-05 10:35:35', '2026-06-05 10:35:44', 9),
(1079, 31, '1db4302b-b494-4d85-9a76-02eda7ed0607', 'LOGIN', 'AUTH', NULL, 'User logged in', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'Chrome 148.0.0.0', 'Windows 10', 'Desktop', 'COMPLETED', '2026-06-05 10:39:54', '2026-06-05 10:39:57', 3),
(1080, 31, '8d91f479-8e5e-4cad-b381-918a90f76dc1', 'LOGIN', 'AUTH', NULL, 'User logged in', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'Chrome 148.0.0.0', 'Windows 10', 'Desktop', 'COMPLETED', '2026-06-05 11:10:39', '2026-06-05 11:11:00', 21),
(1081, 31, '8d91f479-8e5e-4cad-b381-918a90f76dc1', 'UPDATE FOCAL PERSON ACCOUNT', 'USER', 40, 'Update focal person \"yuyyu uyuuyu\" profile fields: department_id', '{\"department_id\":6}', '{\"department_id\":\"6\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'Chrome 148.0.0.0', 'Windows 10', 'Desktop', 'SUCCESS', '2026-06-05 11:10:50', NULL, NULL),
(1082, 11, '1e9ebbe3-ad67-4a3c-9e1d-65ca6c60b534', 'LOGIN', 'AUTH', NULL, 'User logged in', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', 'Edge 148.0.0.0', 'Windows 10', 'Desktop', 'COMPLETED', '2026-06-05 11:11:17', '2026-06-05 11:16:02', 285),
(1083, 11, '78f22bba-50b5-42ac-b4ad-dc859e7b0360', 'LOGIN', 'AUTH', NULL, 'User logged in', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', 'Edge 148.0.0.0', 'Windows 10', 'Desktop', 'SUCCESS', '2026-06-05 11:16:05', NULL, NULL),
(1084, 34, '2e51595b-f7db-4b50-9c71-babd381f8faa', 'LOGIN', 'AUTH', NULL, 'User logged in', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'Chrome 149.0.0.0', 'Windows 10', 'Desktop', 'COMPLETED', '2026-06-08 12:01:15', '2026-06-08 13:14:33', 4398),
(1085, 34, '', 'CHANGE PASSWORD', 'AUTH', 34, 'User changed password', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'Chrome 149.0.0.0', 'Windows 10', 'Desktop', 'SUCCESS', '2026-06-08 13:14:33', NULL, NULL),
(1086, 34, '9711659a-0eed-4c48-b69c-30b62a048939', 'LOGIN', 'AUTH', NULL, 'User logged in', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'Chrome 149.0.0.0', 'Windows 10', 'Desktop', 'COMPLETED', '2026-06-08 13:15:13', '2026-06-08 13:30:05', 892),
(1087, 11, 'e3bb439d-2ce7-4a0e-9d9d-4091b1216dd1', 'LOGIN', 'AUTH', NULL, 'User logged in', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'Chrome 149.0.0.0', 'Windows 10', 'Desktop', 'COMPLETED', '2026-06-08 13:30:34', '2026-06-08 14:05:51', 2117),
(1088, 1, 'dbb64166-f385-4613-9799-ecc4bba15c6b', 'LOGIN', 'AUTH', NULL, 'User logged in', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'Chrome 149.0.0.0', 'Windows 10', 'Desktop', 'COMPLETED', '2026-06-08 14:07:12', '2026-06-08 14:27:21', 1209),
(1089, 11, 'f5f59228-b27b-4d95-8ba8-5c150ff2fa4f', 'LOGIN', 'AUTH', NULL, 'User logged in', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'Chrome 149.0.0.0', 'Windows 10', 'Desktop', 'COMPLETED', '2026-06-08 14:28:08', '2026-06-08 15:04:18', 2170),
(1090, 11, 'f5f59228-b27b-4d95-8ba8-5c150ff2fa4f', 'GENERATE PUBLIC LINK', 'DOCUMENT', 103, 'Generated public access link for \"dfeerer\"', NULL, '{\"document_title\":\"dfeerer\",\"link\":\"http://localhost:5173/public/document/1fe7bab76845f32d33e95096f2326bbf7f65aeab653149945ec084c479134d9f\",\"expiry_date\":\"2026-06-16T15:34\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'Chrome 149.0.0.0', 'Windows 10', 'Desktop', 'SUCCESS', '2026-06-08 14:34:21', NULL, NULL),
(1091, 11, 'f5f59228-b27b-4d95-8ba8-5c150ff2fa4f', 'GENERATE PUBLIC LINK', 'DOCUMENT', 105, 'Generated public access link for \"Testing Me3\"', NULL, '{\"document_title\":\"Testing Me3\",\"link\":\"http://localhost:5173/public/document/49ffc6cc0aca06fa7983de341cb3092c97eb1d404020443b46b949dbf54b7cd4\",\"expiry_date\":\"2026-06-16T15:48\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'Chrome 149.0.0.0', 'Windows 10', 'Desktop', 'SUCCESS', '2026-06-08 14:48:19', NULL, NULL),
(1092, 1, 'b6393210-b662-49fa-a0e6-0fc1f832f7cf', 'LOGIN', 'AUTH', NULL, 'User logged in', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'Chrome 149.0.0.0', 'Windows 10', 'Desktop', 'COMPLETED', '2026-06-09 09:17:28', '2026-06-09 09:23:03', 335),
(1093, 1, '2dcfcc76-5283-4a25-ac9a-7a4a90b12724', 'LOGIN', 'AUTH', NULL, 'User logged in', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'Chrome 149.0.0.0', 'Windows 10', 'Desktop', 'COMPLETED', '2026-06-09 09:23:22', '2026-06-09 09:31:46', 504),
(1094, 18, '0502c59e-1c81-47b5-8cc6-153ba412bbe4', 'LOGIN', 'AUTH', NULL, 'User logged in', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'Chrome 149.0.0.0', 'Windows 10', 'Desktop', 'COMPLETED', '2026-06-09 09:32:19', '2026-06-09 09:32:29', 10),
(1095, 18, 'c4479343-bc1f-46cc-824b-b6f8f379bc63', 'LOGIN', 'AUTH', NULL, 'User logged in', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'Chrome 149.0.0.0', 'Windows 10', 'Desktop', 'COMPLETED', '2026-06-09 09:32:55', '2026-06-09 09:55:32', 1357),
(1096, 1, 'b296316b-a63f-417b-b4fc-fc1fe8c72f86', 'LOGIN', 'AUTH', NULL, 'User logged in', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'Chrome 149.0.0.0', 'Windows 10', 'Desktop', 'COMPLETED', '2026-06-09 09:55:55', '2026-06-09 10:14:18', 1103),
(1097, 18, '2da20293-e3ef-4ecc-83e3-48c21adf61ee', 'LOGIN', 'AUTH', NULL, 'User logged in', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'Chrome 149.0.0.0', 'Windows 10', 'Desktop', 'COMPLETED', '2026-06-09 10:14:54', '2026-06-09 10:20:28', 334),
(1098, 18, '2da20293-e3ef-4ecc-83e3-48c21adf61ee', 'DOWNLOAD', 'DOCUMENT', 99, 'Downloaded document \"Health Insurance Portability and Accountability Act (HIPAA)\" version_1.0', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'Chrome 149.0.0.0', 'Windows 10', 'Desktop', 'SUCCESS', '2026-06-09 10:15:52', NULL, NULL),
(1099, 18, '2da20293-e3ef-4ecc-83e3-48c21adf61ee', 'DOWNLOAD', 'DOCUMENT', 99, 'Downloaded document \"Health Insurance Portability and Accountability Act (HIPAA)\" version_1.0', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'Chrome 149.0.0.0', 'Windows 10', 'Desktop', 'SUCCESS', '2026-06-09 10:19:57', NULL, NULL),
(1100, 1, '4b50d456-1244-4e99-bdc6-1a157064c30e', 'LOGIN', 'AUTH', NULL, 'User logged in', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'Chrome 149.0.0.0', 'Windows 10', 'Desktop', 'COMPLETED', '2026-06-09 10:21:04', '2026-06-09 11:48:49', 5265),
(1101, 1, '9ff05fa3-c228-404f-be00-7ece408fbb23', 'LOGIN', 'AUTH', NULL, 'User logged in', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'Chrome 149.0.0.0', 'Windows 10', 'Desktop', 'COMPLETED', '2026-06-09 11:49:29', '2026-06-09 11:50:12', 43),
(1102, 1, '56bdf5bb-fd89-471c-a8de-151eb949f261', 'LOGIN', 'AUTH', NULL, 'User logged in', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'Chrome 149.0.0.0', 'Windows 10', 'Desktop', 'COMPLETED', '2026-06-10 08:21:29', '2026-06-10 11:13:42', 10333),
(1103, 2, '06f2b2d3-e452-4457-86b8-e46ce35af7e6', 'LOGIN', 'AUTH', NULL, 'User logged in', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 OPR/131.0.0.0', 'Opera 131.0.0.0', 'Windows 10', 'Desktop', 'COMPLETED', '2026-06-10 08:44:53', '2026-06-10 09:57:01', 4328),
(1104, 2, '06f2b2d3-e452-4457-86b8-e46ce35af7e6', 'ACCESS REQUEST', 'DOCUMENT', 103, 'Access request submitted for document \"dfeerer\". Reason: \"I am requesting access to this document to support official duties, review relevant information, and facilitate departmental operations. Access will be used strictly for authorized work purposes in accordance with DASS policies.\"', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 OPR/131.0.0.0', 'Opera 131.0.0.0', 'Windows 10', 'Desktop', 'SUCCESS', '2026-06-10 09:05:24', NULL, NULL),
(1105, 8, '377b11ba-ef42-43d1-8147-94c54c699891', 'LOGIN', 'AUTH', NULL, 'User logged in', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 OPR/131.0.0.0', 'Opera 131.0.0.0', 'Windows 10', 'Desktop', 'COMPLETED', '2026-06-10 09:57:36', '2026-06-10 09:59:59', 143),
(1106, 8, '377b11ba-ef42-43d1-8147-94c54c699891', 'DOWNLOAD', 'DOCUMENT', 101, 'Downloaded document \"National Immunization Strengthening Policy 2026\" v1.0', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 OPR/131.0.0.0', 'Opera 131.0.0.0', 'Windows 10', 'Desktop', 'SUCCESS', '2026-06-10 09:58:31', NULL, NULL),
(1107, 43, '6f39503a-5eda-4560-b954-237cf2f8f497', 'LOGIN', 'AUTH', NULL, 'User logged in', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 OPR/131.0.0.0', 'Opera 131.0.0.0', 'Windows 10', 'Desktop', 'COMPLETED', '2026-06-10 10:00:24', '2026-06-10 11:42:12', 6108),
(1108, 43, '6f39503a-5eda-4560-b954-237cf2f8f497', 'ACCESS REQUEST', 'DOCUMENT', 101, 'Access request submitted for document \"National Immunization Strengthening Policy 2026\". Reason: \"I am requesting access to this document to support official duties, review relevant information, and facilitate departmental operations. Access will be used strictly for authorized work purposes in accordance with NPHCDA-DASS policies.\"', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 OPR/131.0.0.0', 'Opera 131.0.0.0', 'Windows 10', 'Desktop', 'SUCCESS', '2026-06-10 11:04:34', NULL, NULL),
(1109, 43, '7c262ec4-c409-4c34-b29e-88371a0ceebf', 'LOGIN', 'AUTH', NULL, 'User logged in', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'Chrome 149.0.0.0', 'Windows 10', 'Desktop', 'COMPLETED', '2026-06-10 11:30:45', '2026-06-10 12:25:57', 3312),
(1110, 11, 'b0c722ef-f3da-4b4b-b285-030193cc6278', 'LOGIN', 'AUTH', NULL, 'User logged in', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 OPR/131.0.0.0', 'Opera 131.0.0.0', 'Windows 10', 'Desktop', 'COMPLETED', '2026-06-10 11:42:40', '2026-06-10 13:08:58', 5178),
(1111, 1, '26d28268-c568-4b5e-84d9-f91275b3d9b8', 'LOGIN', 'AUTH', NULL, 'User logged in', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'Chrome 149.0.0.0', 'Windows 10', 'Desktop', 'COMPLETED', '2026-06-10 12:38:06', '2026-06-10 12:55:43', 1057),
(1112, 1, '26d28268-c568-4b5e-84d9-f91275b3d9b8', 'UPLOAD DOCUMENT', 'DOCUMENT', 75, 'Uploaded document \"dwwwe\"', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'Chrome 149.0.0.0', 'Windows 10', 'Desktop', 'SUCCESS', '2026-06-10 12:53:14', NULL, NULL),
(1113, 1, 'e22d60a1-a3f8-450f-8909-ffd2036337c4', 'LOGIN', 'AUTH', NULL, 'User logged in', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'Chrome 149.0.0.0', 'Windows 10', 'Desktop', 'COMPLETED', '2026-06-26 11:06:10', '2026-06-26 13:29:33', 8603),
(1114, 8, '190633d7-3f98-4756-8a84-32663647b9d2', 'LOGIN', 'AUTH', NULL, 'User logged in', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0', 'Edge 149.0.0.0', 'Windows 10', 'Desktop', 'SUCCESS', '2026-06-26 11:07:59', NULL, NULL),
(1115, 8, '190633d7-3f98-4756-8a84-32663647b9d2', 'ACCESS REQUEST', 'DOCUMENT', 103, 'Access request submitted for document \"dfeerer\". Reason: \"I am requesting access to this document to support official departmental duties\"', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0', 'Edge 149.0.0.0', 'Windows 10', 'Desktop', 'SUCCESS', '2026-06-26 11:21:49', NULL, NULL),
(1116, 1, 'e22d60a1-a3f8-450f-8909-ffd2036337c4', 'DENIED ACCESS', 'DOCUMENT', 103, 'Denied access to document \"dfeerer\" for Fatima Lukman', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'Chrome 149.0.0.0', 'Windows 10', 'Desktop', 'SUCCESS', '2026-06-26 11:26:48', NULL, NULL),
(1117, 8, '190633d7-3f98-4756-8a84-32663647b9d2', 'ACCESS REQUEST', 'DOCUMENT', 103, 'Access request submitted for document \"dfeerer\". Reason: \"Im request again\"', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0', 'Edge 149.0.0.0', 'Windows 10', 'Desktop', 'SUCCESS', '2026-06-26 12:44:43', NULL, NULL),
(1118, 1, 'e22d60a1-a3f8-450f-8909-ffd2036337c4', 'APPROVE ACCESS', 'DOCUMENT', 103, 'Approved access to document \"dfeerer\" for Fatima Lukman expires at: 2026-06-28T13:45', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'Chrome 149.0.0.0', 'Windows 10', 'Desktop', 'SUCCESS', '2026-06-26 12:45:27', NULL, NULL),
(1119, 8, '190633d7-3f98-4756-8a84-32663647b9d2', 'DOWNLOAD', 'DOCUMENT', 103, 'Downloaded document \"dfeerer\" version_1.0', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0', 'Edge 149.0.0.0', 'Windows 10', 'Desktop', 'SUCCESS', '2026-06-26 13:12:36', NULL, NULL),
(1120, 8, '190633d7-3f98-4756-8a84-32663647b9d2', 'ACCESS REQUEST', 'DOCUMENT', 101, 'Request submitted for document \"National Immunization Strengthening Policy 2026\". Reason: \"I am requesting access to this document to support official duties, review relevant information, and facilitate departmental operations. Access will be used strictly for authorized work purposes in accordance with NPHCDA-DASS policies.\"', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0', 'Edge 149.0.0.0', 'Windows 10', 'Desktop', 'SUCCESS', '2026-06-26 13:15:30', NULL, NULL),
(1121, 2, '51d4c872-2f64-4625-baa7-de72e2774b16', 'LOGIN', 'AUTH', NULL, 'User logged in', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'Chrome 149.0.0.0', 'Windows 10', 'Desktop', 'COMPLETED', '2026-06-26 13:29:51', '2026-06-26 13:32:48', 177),
(1122, 11, '45c328d7-69ba-4d0a-9570-2363ca1b2a44', 'LOGIN', 'AUTH', NULL, 'User logged in', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'Chrome 149.0.0.0', 'Windows 10', 'Desktop', 'COMPLETED', '2026-06-26 13:33:52', '2026-06-26 13:43:53', 601),
(1123, 11, '45c328d7-69ba-4d0a-9570-2363ca1b2a44', 'REJECT ACCESS REQUEST', 'DOCUMENT', 101, 'Rejected access request for \"National Immunization Strengthening Policy 2026\"', '{\"previous_status\":\"Pending_Admin_Approval\"}', '{\"new_status\":\"Rejected\",\"document_title\":\"National Immunization Strengthening Policy 2026\",\"comment\":\"this document can not share with staff is highly confidential\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'Chrome 149.0.0.0', 'Windows 10', 'Desktop', 'SUCCESS', '2026-06-26 13:34:35', NULL, NULL),
(1124, 8, '190633d7-3f98-4756-8a84-32663647b9d2', 'ACCESS REQUEST', 'DOCUMENT', 101, 'Request submitted for document \"National Immunization Strengthening Policy 2026\". Reason: \"I am requesting access to this document to support official duties, review relevant information, and facilitate departmental operations. Access will be used strictly for authorized work purposes in accordance with NPHCDA-DASS policies.\"', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0', 'Edge 149.0.0.0', 'Windows 10', 'Desktop', 'SUCCESS', '2026-06-26 13:43:40', NULL, NULL),
(1125, 2, 'e53d6e67-9292-411e-bd79-cf48a621c962', 'LOGIN', 'AUTH', NULL, 'User logged in', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'Chrome 149.0.0.0', 'Windows 10', 'Desktop', 'COMPLETED', '2026-06-26 13:44:06', '2026-06-26 13:44:22', 16),
(1126, 11, 'af2663dc-a66c-472b-b286-464860bb3198', 'LOGIN', 'AUTH', NULL, 'User logged in', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'Chrome 149.0.0.0', 'Windows 10', 'Desktop', 'COMPLETED', '2026-06-26 13:44:43', '2026-06-26 14:02:05', 1042),
(1127, 11, 'af2663dc-a66c-472b-b286-464860bb3198', 'APPROVE ACCESS REQUEST', 'DOCUMENT', 101, 'Approved access request for \"National Immunization Strengthening Policy 2026\"', '{\"previous_status\":\"Pending_Admin_Approval\"}', '{\"new_status\":\"Approved\",\"document_title\":\"National Immunization Strengthening Policy 2026\",\"comment\":\"this has been approve\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'Chrome 149.0.0.0', 'Windows 10', 'Desktop', 'SUCCESS', '2026-06-26 13:45:12', NULL, NULL),
(1128, 1, '46df0e7b-ab81-415f-9a15-066d099559ad', 'LOGIN', 'AUTH', NULL, 'User logged in', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'Chrome 149.0.0.0', 'Windows 10', 'Desktop', 'SUCCESS', '2026-06-26 14:02:22', NULL, NULL),
(1129, 1, '46df0e7b-ab81-415f-9a15-066d099559ad', 'CREATE USER', 'USER', 45, 'Created new staff account for Zulaha Adamu Sani', NULL, '{\"full_name\":\"Zulaha Adamu Sani\",\"gender\":\"Female\",\"designation\":\"Program Analyst I\",\"file_number\":\"10004\",\"email\":\"zul@gmail.com\",\"phone_number\":\"07056369222\",\"department_id\":1}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'Chrome 149.0.0.0', 'Windows 10', 'Desktop', 'SUCCESS', '2026-06-26 14:03:44', NULL, NULL),
(1130, 8, '9fab4819-998a-4894-a20d-b3c16ba47803', 'LOGIN', 'AUTH', NULL, 'User logged in', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0', 'Edge 149.0.0.0', 'Windows 10', 'Desktop', 'COMPLETED', '2026-06-28 17:15:13', '2026-06-29 04:49:55', 41682),
(1131, 8, 'ed0ed416-3425-4d23-ba1a-d02a6a5a8ea2', 'LOGIN', 'AUTH', NULL, 'User logged in', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0', 'Edge 149.0.0.0', 'Windows 10', 'Desktop', 'COMPLETED', '2026-06-29 06:03:22', '2026-06-29 06:03:29', 7),
(1132, 8, '5c8d6c00-3d4f-4607-b7c3-9ffb7f4dec29', 'LOGIN', 'AUTH', NULL, 'User logged in', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0', 'Edge 149.0.0.0', 'Windows 10', 'Desktop', 'COMPLETED', '2026-06-29 06:08:59', '2026-06-29 06:09:13', 14),
(1133, 8, '81932916-c411-400d-a9b0-4876fef3656c', 'LOGIN', 'AUTH', NULL, 'User logged in', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'Chrome 149.0.0.0', 'Windows 10', 'Desktop', 'COMPLETED', '2026-06-29 06:10:20', '2026-06-29 06:31:47', 1287),
(1134, 8, 'cea7f869-79d7-4b27-959d-69692c1f6206', 'LOGIN', 'AUTH', NULL, 'User logged in', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'Chrome 149.0.0.0', 'Windows 10', 'Desktop', 'COMPLETED', '2026-06-29 06:32:17', '2026-06-29 06:32:27', 10),
(1135, 8, 'b73b3fe8-6ec9-4282-947a-d28b20b7e7ec', 'LOGIN', 'AUTH', NULL, 'User logged in', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0', 'Edge 149.0.0.0', 'Windows 10', 'Desktop', 'COMPLETED', '2026-06-29 06:34:01', '2026-06-29 06:34:08', 7),
(1136, 1, '0afc2097-5545-46bb-b59c-0db239e98813', 'LOGIN', 'AUTH', NULL, 'User logged in', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'Chrome 149.0.0.0', 'Windows 10', 'Desktop', 'COMPLETED', '2026-07-09 08:34:09', '2026-07-09 09:03:25', 1756),
(1137, 8, 'aabae56d-b573-4917-9087-481ebb576f51', 'LOGIN', 'AUTH', NULL, 'User logged in', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 OPR/132.0.0.0', 'Opera 132.0.0.0', 'Windows 10', 'Desktop', 'SUCCESS', '2026-07-09 08:35:11', NULL, NULL),
(1138, 11, 'b53b0185-1b3e-4671-ac58-069248342eca', 'LOGIN', 'AUTH', NULL, 'User logged in', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0', 'Edge 150.0.0.0', 'Windows 10', 'Desktop', 'SUCCESS', '2026-07-09 08:49:55', NULL, NULL),
(1139, 31, 'e07e9264-75fd-4047-92fd-24113368201b', 'LOGIN', 'AUTH', NULL, 'User logged in', NULL, NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'Chrome 149.0.0.0', 'Windows 10', 'Desktop', 'COMPLETED', '2026-07-09 09:04:16', '2026-07-09 09:18:07', 831);

-- --------------------------------------------------------

--
-- Table structure for table `departments`
--

CREATE TABLE `departments` (
  `id` int(11) NOT NULL,
  `name` varchar(150) NOT NULL,
  `name_abbreviation` varchar(20) NOT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `departments`
--

INSERT INTO `departments` (`id`, `name`, `name_abbreviation`, `description`, `created_at`) VALUES
(1, 'Planing Research and statistic', 'PRS', 'kjsjskjkjs lksksksklks', '2026-02-14 17:33:15'),
(2, 'Disease Control and Immunization', 'DCI', NULL, '2026-03-06 11:53:20'),
(3, 'Primary Health Care Systems Development', 'PHCSD', NULL, '2026-03-06 11:54:11'),
(4, 'Nutrition', 'Nutrition', '', '2026-03-06 11:54:55'),
(5, 'Administration and Human Resource', 'Admin & HR', NULL, '2026-03-06 11:56:05'),
(6, 'Community Health Services', 'CHS', NULL, '2026-03-06 11:56:05'),
(7, 'Partner', 'Partner', 'Partner', '2026-04-05 12:43:50'),
(8, 'North East Zonal Office', 'NEZ', NULL, '2026-04-27 09:07:26'),
(9, 'North Central Zonal Office', 'NCZ', NULL, '2026-04-27 09:08:35'),
(10, 'North West Zonal Office', 'NWZ', NULL, '2026-04-27 11:46:21'),
(11, 'South East Zonal Office', 'SEZ', NULL, '2026-04-28 16:46:32'),
(12, 'South South Zonal Office', 'SSZ', NULL, '2026-04-28 16:47:04'),
(13, 'South West Zonal Office', 'SWZ', NULL, '2026-04-28 16:47:39'),
(14, 'Finance and Accounts', 'F&A', NULL, '2026-04-30 08:46:36'),
(15, 'Advocacy and Communication', 'AC', NULL, '2026-04-30 08:47:29'),
(16, 'Logistics and Health Commodities', 'L&HC', NULL, '2026-04-30 08:48:16'),
(17, 'Special Duties', 'SD', NULL, '2026-04-30 08:48:37'),
(18, 'Internal Audit', 'IA', NULL, '2026-04-30 08:49:18'),
(19, 'ED\'s Office', 'ED', NULL, '2026-04-30 08:51:41');

-- --------------------------------------------------------

--
-- Table structure for table `department_document_access_grants`
--

CREATE TABLE `department_document_access_grants` (
  `id` int(11) NOT NULL,
  `request_id` int(11) DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  `document_id` int(11) DEFAULT NULL,
  `granted_by` int(11) DEFAULT NULL,
  `expires_at` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `department_document_access_grants`
--

INSERT INTO `department_document_access_grants` (`id`, `request_id`, `user_id`, `document_id`, `granted_by`, `expires_at`, `created_at`) VALUES
(13, 23, 8, 103, 1, '2026-06-28 13:45:00', '2026-06-26 12:45:27');

-- --------------------------------------------------------

--
-- Table structure for table `department_document_access_requests`
--

CREATE TABLE `department_document_access_requests` (
  `id` int(11) NOT NULL,
  `document_id` int(11) NOT NULL,
  `requested_by` int(11) NOT NULL,
  `department_id` int(4) NOT NULL,
  `reason` text DEFAULT NULL,
  `status` enum('PENDING','APPROVED','DECLINED') DEFAULT 'PENDING',
  `reviewed_by` int(11) DEFAULT NULL,
  `reviewed_at` datetime DEFAULT NULL,
  `review_note` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `department_document_access_requests`
--

INSERT INTO `department_document_access_requests` (`id`, `document_id`, `requested_by`, `department_id`, `reason`, `status`, `reviewed_by`, `reviewed_at`, `review_note`, `created_at`) VALUES
(22, 103, 8, 1, 'I am requesting access to this document to support official departmental duties', 'DECLINED', 1, '2026-06-26 12:26:48', 'It is strictly confidential', '2026-06-26 11:21:49'),
(23, 103, 8, 1, 'Im request again', 'APPROVED', 1, '2026-06-26 13:45:27', NULL, '2026-06-26 12:44:43');

-- --------------------------------------------------------

--
-- Table structure for table `documents`
--

CREATE TABLE `documents` (
  `id` int(11) NOT NULL,
  `category_id` int(5) NOT NULL,
  `subcategory_id` int(5) NOT NULL,
  `title` text NOT NULL,
  `description` text NOT NULL,
  `classification` enum('Public','Internal','Restricted','Confidential') NOT NULL,
  `document_search_keywords` text NOT NULL,
  `document_code` varchar(200) DEFAULT NULL,
  `department_id` int(11) DEFAULT NULL,
  `document_date` date NOT NULL,
  `document_version` decimal(10,1) NOT NULL,
  `current_version_id` bigint(20) NOT NULL,
  `retention_period_years` int(4) NOT NULL,
  `retention_expiry_date` date NOT NULL,
  `is_flagged` tinyint(1) NOT NULL,
  `is_archived` tinyint(1) NOT NULL,
  `archived_at` varchar(50) DEFAULT NULL,
  `is_delete_flagged` tinyint(1) NOT NULL,
  `deletion_reason` text NOT NULL,
  `is_delete` tinyint(1) NOT NULL,
  `delete_at` varchar(50) DEFAULT NULL,
  `document_status` enum('Active','Archived','Expired','Deleted','Pending Deletion') NOT NULL,
  `uploaded_by` int(5) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `documents`
--

INSERT INTO `documents` (`id`, `category_id`, `subcategory_id`, `title`, `description`, `classification`, `document_search_keywords`, `document_code`, `department_id`, `document_date`, `document_version`, `current_version_id`, `retention_period_years`, `retention_expiry_date`, `is_flagged`, `is_archived`, `archived_at`, `is_delete_flagged`, `deletion_reason`, `is_delete`, `delete_at`, `document_status`, `uploaded_by`, `created_at`, `updated_at`) VALUES
(99, 2, 8, 'Health Insurance Portability and Accountability Act (HIPAA)', 'AHGHHJSHJJH SDHJS', 'Confidential', 'Strategic, Budget', 'DOC-PRS-2026-000001-87DF3AD6-F984-446A-B89B-E27930A65B5C', 1, '2026-02-19', 1.0, 67, 6, '2032-05-12', 0, 0, NULL, 0, '', 0, NULL, 'Active', 1, '2026-05-12 09:18:20', '2026-05-21 12:47:11'),
(100, 1, 3, 'Documents are usually deleted only after expiration. However, early deletion may be requested in exceptional circumstances with a valid reason.', 'Documents are usually deleted only after expiration. However, early deletion may be requested in exceptional circumstances with a valid reason.', 'Confidential', 'Me, You', 'DOC-PRS-2026-000002-C54252E7-5DBF-445B-B622-7A3985F6B060', 1, '2026-02-19', 2.0, 71, 5, '2036-05-12', 1, 0, NULL, 1, 'ttt', 1, '2026-06-01 09:43:54', 'Deleted', 1, '2026-05-12 09:19:12', '2026-06-01 09:43:54'),
(101, 6, 25, 'National Immunization Strengthening Policy 2026', 'Policy framework for improving vaccine coverage, cold chain management, and routine immunization services nationwide.', 'Confidential', 'Y, T', 'DOC-DCI-2026-000003-C2A63EA2-9E75-4C5B-B121-F5921F270B18', 2, '2026-02-19', 1.0, 69, 6, '2032-05-12', 0, 0, NULL, 0, '', 0, NULL, 'Active', 2, '2026-05-12 09:22:59', '2026-05-20 05:45:39'),
(102, 4, 16, 'Primary Healthcare Service Delivery Guidelines', 'Operational standards and procedures for effective primary healthcare delivery across health facilities.', 'Restricted', 'Tyty, Ytyuy', 'DOC-DCI-2026-000004-2FEDB59B-74A6-46C5-AE35-251F86A973DC', 2, '2026-02-19', 1.0, 70, 5, '2031-05-12', 0, 0, NULL, 0, '', 0, NULL, 'Active', 2, '2026-05-12 09:23:52', '2026-05-20 05:47:28'),
(103, 6, 24, 'dfeerer', 'terreerer', 'Confidential', 'Erre', 'DOC-PRS-2026-000005-01CFD49B-8676-4D03-83C3-2346EED7F1AF', 1, '2026-02-19', 1.0, 72, 6, '2031-05-19', 0, 0, NULL, 0, '', 0, NULL, 'Active', 1, '2026-05-19 14:06:55', '2026-06-01 12:03:52'),
(104, 5, 21, 'ytytuyuyy', 'qwertyuiop', 'Confidential', 'Uyuy Yuuy Uiiu', 'DOC-PRS-2026-000006-71749060-1EE0-41E0-9005-F50BE7BEF6D5', 1, '2026-02-19', 1.0, 73, 5, '2026-05-01', 1, 0, NULL, 1, 'erertrtr', 1, '2026-06-01 12:43:08', 'Deleted', 1, '2026-06-01 11:29:53', '2026-06-01 11:43:08'),
(105, 6, 29, 'Testing Me3', 'fdghjk', 'Internal', 'Bg', 'DOC-PRS-2026-000007-C5175AE5-CCDA-444B-87E6-BB7BD4622F14', 1, '2026-02-19', 1.0, 74, 5, '2031-06-01', 0, 0, NULL, 0, '', 0, NULL, 'Active', 1, '2026-06-01 14:18:46', '2026-06-01 20:13:08'),
(106, 7, 32, 'dwwwe', 'wweww', 'Public', 'Me, You, She', 'DOC-PRS-2026-000008-D915DC72-C4C4-49F4-B2C9-A47E014E23BF', 1, '2026-02-19', 1.0, 75, 6, '2032-06-10', 0, 0, NULL, 0, '', 0, NULL, 'Active', 1, '2026-06-10 12:53:14', '2026-06-10 12:53:14');

-- --------------------------------------------------------

--
-- Table structure for table `document_access_permissions`
--

CREATE TABLE `document_access_permissions` (
  `id` int(11) NOT NULL,
  `document_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `granted_by` int(11) NOT NULL,
  `request_id` int(11) DEFAULT NULL,
  `expires_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `document_access_permissions`
--

INSERT INTO `document_access_permissions` (`id`, `document_id`, `user_id`, `granted_by`, `request_id`, `expires_at`) VALUES
(9, 101, 8, 11, 31, '2026-08-26 14:45:12');

-- --------------------------------------------------------

--
-- Table structure for table `document_access_requests`
--

CREATE TABLE `document_access_requests` (
  `id` int(11) NOT NULL,
  `document_id` int(11) NOT NULL,
  `requested_by` int(11) NOT NULL,
  `reason` text DEFAULT NULL,
  `status` enum('Pending_Department_Review','Pending_Admin_Approval','Approved','Rejected') DEFAULT 'Pending_Department_Review',
  `department_reviewer_id` int(11) DEFAULT NULL,
  `department_comment` text DEFAULT NULL,
  `department_reviewed_at` datetime DEFAULT NULL,
  `admin_reviewer_id` int(11) DEFAULT NULL,
  `admin_comment` text DEFAULT NULL,
  `admin_reviewed_at` datetime DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `owner_department_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `document_access_requests`
--

INSERT INTO `document_access_requests` (`id`, `document_id`, `requested_by`, `reason`, `status`, `department_reviewer_id`, `department_comment`, `department_reviewed_at`, `admin_reviewer_id`, `admin_comment`, `admin_reviewed_at`, `created_at`, `owner_department_id`) VALUES
(30, 101, 8, 'I am requesting access to this document to support official duties, review relevant information, and facilitate departmental operations. Access will be used strictly for authorized work purposes in accordance with NPHCDA-DASS policies.', 'Rejected', 2, 'I have reviewed this request and confirm it meets the required criteria. I recommend approval and forwarding to the admin for final processing.', '2026-06-26 14:30:11', 11, 'this document can not share with staff is highly confidential', '2026-06-26 14:34:35', '2026-06-26 14:15:30', 2),
(31, 101, 8, 'I am requesting access to this document to support official duties, review relevant information, and facilitate departmental operations. Access will be used strictly for authorized work purposes in accordance with NPHCDA-DASS policies.', 'Approved', 2, 'I have reviewed this request and confirm it meets the required criteria. I recommend approval and forwarding to the admin for final processing.', '2026-06-26 14:44:17', 11, 'this has been approve', '2026-06-26 14:45:12', '2026-06-26 14:43:40', 2);

-- --------------------------------------------------------

--
-- Table structure for table `document_categories`
--

CREATE TABLE `document_categories` (
  `id` int(11) NOT NULL,
  `name` varchar(150) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `document_categories`
--

INSERT INTO `document_categories` (`id`, `name`, `created_at`) VALUES
(1, 'Governance & Policy', '2026-02-23 06:45:07'),
(2, 'Administrative & Operations', '2026-02-23 06:45:07'),
(3, 'Finance & Procurement', '2026-02-23 06:45:07'),
(4, 'Human Resource', '2026-02-23 06:45:07'),
(5, 'Technical / Program', '2026-02-23 06:45:07'),
(6, 'Legal & Compliance', '2026-02-23 06:45:07'),
(7, 'Meetings & Communication', '2026-02-23 06:45:07');

-- --------------------------------------------------------

--
-- Table structure for table `document_public_links`
--

CREATE TABLE `document_public_links` (
  `id` int(11) NOT NULL,
  `document_id` int(11) NOT NULL,
  `token` varchar(255) DEFAULT NULL,
  `expiry_date` datetime DEFAULT NULL,
  `generated_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `document_public_links`
--

INSERT INTO `document_public_links` (`id`, `document_id`, `token`, `expiry_date`, `generated_by`, `created_at`) VALUES
(10, 99, '6601d15a1e63d37694dd2aa9b359ff016ea48d1d69de54ea0661011d55a4ba24', '2026-05-13 10:44:00', 11, '2026-05-12 09:44:28'),
(11, 99, 'e230316dd36034b9bd3ca09f6f0db800423749043b7e160085c5d73700e1429b', '2026-06-10 10:27:00', 11, '2026-06-01 09:28:02'),
(12, 103, '1fe7bab76845f32d33e95096f2326bbf7f65aeab653149945ec084c479134d9f', '2026-06-16 15:34:00', 11, '2026-06-08 14:34:21'),
(13, 105, '49ffc6cc0aca06fa7983de341cb3092c97eb1d404020443b46b949dbf54b7cd4', '2026-06-16 15:48:00', 11, '2026-06-08 14:48:19');

-- --------------------------------------------------------

--
-- Table structure for table `document_shares`
--

CREATE TABLE `document_shares` (
  `id` int(11) NOT NULL,
  `document_id` int(11) NOT NULL,
  `partner_id` int(11) NOT NULL,
  `expiry_date` datetime NOT NULL,
  `shared_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `document_shares`
--

INSERT INTO `document_shares` (`id`, `document_id`, `partner_id`, `expiry_date`, `shared_by`, `created_at`) VALUES
(18, 99, 18, '2026-06-19 10:43:00', 11, '2026-05-12 09:43:54');

-- --------------------------------------------------------

--
-- Table structure for table `document_subcategories`
--

CREATE TABLE `document_subcategories` (
  `id` int(11) NOT NULL,
  `category_id` int(11) NOT NULL,
  `name` varchar(150) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `document_subcategories`
--

INSERT INTO `document_subcategories` (`id`, `category_id`, `name`, `created_at`) VALUES
(1, 1, 'Policy', '2026-02-23 06:45:57'),
(2, 1, 'Strategy', '2026-02-23 06:45:57'),
(3, 1, 'Guidelines', '2026-02-23 06:45:57'),
(4, 1, 'Framework', '2026-02-23 06:45:57'),
(5, 2, 'Circular', '2026-02-23 06:45:57'),
(6, 2, 'Memo', '2026-02-23 06:45:57'),
(7, 2, 'Internal Notice', '2026-02-23 06:45:57'),
(8, 2, 'Standard Operating Procedure (SOP)', '2026-02-23 06:45:57'),
(9, 2, 'Workflow', '2026-02-23 06:45:57'),
(10, 2, 'Process Document', '2026-02-23 06:45:57'),
(11, 3, 'Budget', '2026-02-23 06:45:57'),
(12, 3, 'Financial Report', '2026-02-23 06:45:57'),
(13, 3, 'Invoice', '2026-02-23 06:45:57'),
(14, 3, 'Purchase Order', '2026-02-23 06:45:57'),
(15, 3, 'Audit Report', '2026-02-23 06:45:57'),
(16, 4, 'Recruitment', '2026-02-23 06:45:57'),
(17, 4, 'Staff Record', '2026-02-23 06:45:57'),
(18, 4, 'Training Material', '2026-02-23 06:45:57'),
(19, 4, 'Performance Appraisal', '2026-02-23 06:45:57'),
(20, 5, 'Project Proposal', '2026-02-23 06:45:57'),
(21, 5, 'Project Report', '2026-02-23 06:45:57'),
(22, 5, 'Research Document', '2026-02-23 06:45:57'),
(23, 5, 'Technical Specification', '2026-02-23 06:45:57'),
(24, 6, 'Agreement', '2026-02-23 06:45:57'),
(25, 6, 'Contract', '2026-02-23 06:45:57'),
(26, 6, 'Legal Opinion', '2026-02-23 06:45:57'),
(27, 6, 'MOU', '2026-02-23 06:45:57'),
(28, 6, 'MOA', '2026-02-23 06:45:57'),
(29, 6, 'Compliance Document', '2026-02-23 06:45:57'),
(30, 7, 'Minutes of Meeting', '2026-02-23 06:45:57'),
(31, 7, 'Presentation', '2026-02-23 06:45:57'),
(32, 7, 'Speech', '2026-02-23 06:45:57'),
(33, 7, 'Correspondence', '2026-02-23 06:45:57');

-- --------------------------------------------------------

--
-- Table structure for table `document_versions`
--

CREATE TABLE `document_versions` (
  `id` bigint(20) NOT NULL,
  `file_name` varchar(255) NOT NULL,
  `original_file_name` varchar(255) DEFAULT NULL,
  `file_path` varchar(255) NOT NULL,
  `checksum` text NOT NULL,
  `file_size` bigint(20) NOT NULL,
  `type` varchar(200) NOT NULL,
  `mime_type` varchar(200) NOT NULL,
  `version_notes` text NOT NULL,
  `version_number` decimal(10,1) NOT NULL,
  `version_verified_by` varchar(100) NOT NULL,
  `document_id` bigint(20) NOT NULL,
  `uploaded_by` int(4) NOT NULL,
  `is_active` tinyint(1) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `document_versions`
--

INSERT INTO `document_versions` (`id`, `file_name`, `original_file_name`, `file_path`, `checksum`, `file_size`, `type`, `mime_type`, `version_notes`, `version_number`, `version_verified_by`, `document_id`, `uploaded_by`, `is_active`, `created_at`) VALUES
(67, '20260326_DIH_update_meeting_v1_4_20260512_101820.pdf', '20260326_DIH update meeting_v1.4.pdf', '/Documents/20260326_DIH_update_meeting_v1_4_20260512_101820.pdf', '050339a0a1199ca3de7a640dfd28b675c76b6bdb9fb704180c77f3866282e80a', 2533264, 'pdf', 'application/pdf', 'Initial upload', 1.0, 'DPRS', 99, 1, 1, '2026-05-12 09:18:20'),
(68, 'General_Data_Protection_Regulation__GDPR__20260512_101912.pdf', 'General Data Protection Regulation (GDPR).pdf', '/Documents/General_Data_Protection_Regulation__GDPR__20260512_101912.pdf', 'bd84e63f5b622b739a83389afc3b30d240f792bb88d8eb03a816c9a82b0c2499', 982296, 'pdf', 'application/pdf', 'Initial upload', 1.0, 'USMAN', 100, 1, 0, '2026-05-12 09:19:12'),
(69, 'ANC_DAK_20260512_102259.pdf', 'ANC_DAK.pdf', '/Documents/ANC_DAK_20260512_102259.pdf', '27dcd2fc950be0212e8adfbdd1aac87ccfee541c6948f4526a99a83080d1dc6e', 2828632, 'pdf', 'application/pdf', 'Initial upload', 1.0, 'USMAN', 101, 2, 1, '2026-05-12 09:22:59'),
(70, '20260326_DIH_Workstreams_and_Contact_Details_20260512_102352.xlsx', '20260326_DIH_Workstreams and Contact Details.xlsx', '/Documents/20260326_DIH_Workstreams_and_Contact_Details_20260512_102352.xlsx', 'b41154f3c8f7ab67055699a8f8f18174875565331939c1304cdbb12e5bfcb6a6', 14337, 'xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'Initial upload', 1.0, 'UMAR', 102, 2, 1, '2026-05-12 09:23:52'),
(71, 'Minutes_of_Management_Review_Meeting_____January_2026_20260515_153650.pdf', 'Minutes of Management Review Meeting â January 2026.pdf', '/Documents/Minutes_of_Management_Review_Meeting_____January_2026_20260515_153650.pdf', '795d3e616254889859fafd9eab824e8fcc323b6e7794d3177ffec3ef931b010a', 417860, 'pdf', 'application/pdf', 'ghghgh hui wuyuw wiuwuiw wuiwuiwio', 2.0, 'Dr. Usman', 100, 1, 1, '2026-05-15 14:36:50'),
(72, 'Steps_to_access_KM_Hub_20260519_150655.pdf', 'Steps to access KM Hub.pdf', '/Documents/Steps_to_access_KM_Hub_20260519_150655.pdf', '5d2f8de6229b9da5e33f0daa391a622ec166121e9e1945e2b4748d5b9a6c2932', 735854, 'pdf', 'application/pdf', 'Initial upload', 1.0, 'rererer', 103, 1, 1, '2026-05-19 14:06:55'),
(73, 'How_to_Deploy_a_Full-Stack_Web_Application_-_React_Frontend___Node_js_Backend___MySQL_Database_20260601_122953.mp4', 'How to Deploy a Full-Stack Web Application - React Frontend _ Node.js Backend _ MySQL Database.mp4', '/Documents/How_to_Deploy_a_Full-Stack_Web_Application_-_React_Frontend___Node_js_Backend___MySQL_Database_20260601_122953.mp4', 'b3166f317a95fb086384fec5ec535662fce042c87b50ff3bd0a8e7da1c838690', 41486491, 'mp4', 'video/mp4', 'Initial upload', 1.0, 'me', 104, 1, 1, '2026-06-01 11:29:53'),
(74, 'how_to_convert_html_template_to_reactjs___Reactjs_Tutorial_20260506_1240_v1_0_20260601_151845.mp4', 'how to convert html template to reactjs _ Reactjs Tutorial_20260506_1240_v1.0.mp4', '/Documents/how_to_convert_html_template_to_reactjs___Reactjs_Tutorial_20260506_1240_v1_0_20260601_151845.mp4', '0ae3c97059e9a50c7c860cdb6cd40491ebdfa2000f6dd37f306a6efed53b9bfe', 51196021, 'mp4', 'video/mp4', 'Initial upload', 1.0, 'me', 105, 1, 1, '2026-06-01 14:18:46'),
(75, 'README_20260610_135314.md', 'README.md', '/Documents/README_20260610_135314.md', '7a6f004c103a2e323a5677758071ad4dfe22ea8a92883aadd5f5b39b46dd729d', 1157, 'md', 'text/markdown', 'Initial upload', 1.0, 'DPRS', 106, 1, 1, '2026-06-10 12:53:14');

-- --------------------------------------------------------

--
-- Table structure for table `download_logs`
--

CREATE TABLE `download_logs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `document_id` int(10) UNSIGNED NOT NULL,
  `version_id` int(10) UNSIGNED NOT NULL,
  `category` enum('USER','GUEST') NOT NULL,
  `downloaded_at` datetime NOT NULL DEFAULT current_timestamp(),
  `ip_address` varchar(50) NOT NULL,
  `user_agent` text DEFAULT NULL,
  `browser` varchar(100) DEFAULT NULL,
  `os` varchar(100) DEFAULT NULL,
  `device` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `download_logs`
--

INSERT INTO `download_logs` (`id`, `document_id`, `version_id`, `category`, `downloaded_at`, `ip_address`, `user_agent`, `browser`, `os`, `device`) VALUES
(212, 99, 67, 'USER', '2026-05-12 10:24:42', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'Chrome 148.0.0.0', 'Windows 10', 'Desktop'),
(213, 99, 67, 'USER', '2026-05-12 10:47:04', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'Chrome 148.0.0.0', 'Windows 10', 'Desktop'),
(214, 100, 68, 'USER', '2026-05-15 14:53:27', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'Chrome 148.0.0.0', 'Windows 10', 'Desktop'),
(215, 100, 71, 'USER', '2026-05-19 11:18:57', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'Chrome 148.0.0.0', 'Windows 10', 'Desktop'),
(216, 103, 72, 'USER', '2026-05-20 05:47:25', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'Chrome 148.0.0.0', 'Windows 10', 'Desktop'),
(217, 103, 72, 'USER', '2026-05-21 10:12:13', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', 'Edge 148.0.0.0', 'Windows 10', 'Desktop'),
(218, 100, 71, 'USER', '2026-05-21 10:13:37', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', 'Edge 148.0.0.0', 'Windows 10', 'Desktop'),
(219, 99, 67, 'USER', '2026-05-21 11:30:27', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', 'Edge 148.0.0.0', 'Windows 10', 'Desktop'),
(220, 99, 67, 'USER', '2026-05-21 11:30:35', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', 'Edge 148.0.0.0', 'Windows 10', 'Desktop'),
(221, 99, 67, 'USER', '2026-05-21 11:30:42', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', 'Edge 148.0.0.0', 'Windows 10', 'Desktop'),
(222, 99, 67, 'USER', '2026-05-21 11:30:50', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', 'Edge 148.0.0.0', 'Windows 10', 'Desktop'),
(223, 100, 71, 'USER', '2026-05-21 14:21:32', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', 'Edge 148.0.0.0', 'Windows 10', 'Desktop'),
(224, 100, 71, 'USER', '2026-05-21 14:37:34', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', 'Edge 148.0.0.0', 'Windows 10', 'Desktop'),
(225, 100, 71, 'USER', '2026-05-21 14:37:55', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', 'Edge 148.0.0.0', 'Windows 10', 'Desktop'),
(226, 101, 69, '', '2026-05-21 15:20:57', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'Chrome 148.0.0.0', 'Windows 10', 'Desktop'),
(227, 101, 69, '', '2026-05-21 15:21:36', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'Chrome 148.0.0.0', 'Windows 10', 'Desktop'),
(228, 101, 69, '', '2026-05-21 15:26:11', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'Chrome 148.0.0.0', 'Windows 10', 'Desktop'),
(229, 100, 71, 'USER', '2026-05-21 15:27:20', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'Chrome 148.0.0.0', 'Windows 10', 'Desktop'),
(230, 100, 71, 'USER', '2026-05-21 15:28:58', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'Chrome 148.0.0.0', 'Windows 10', 'Desktop'),
(231, 101, 69, 'USER', '2026-06-01 10:41:46', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', 'Edge 148.0.0.0', 'Windows 10', 'Desktop'),
(232, 101, 69, '', '2026-06-01 12:03:40', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'Chrome 148.0.0.0', 'Windows 10', 'Desktop'),
(233, 103, 72, 'USER', '2026-06-01 12:19:52', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'Chrome 148.0.0.0', 'Windows 10', 'Desktop'),
(234, 103, 72, 'USER', '2026-06-01 12:19:59', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'Chrome 148.0.0.0', 'Windows 10', 'Desktop'),
(235, 103, 72, 'USER', '2026-06-01 12:25:51', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'Chrome 148.0.0.0', 'Windows 10', 'Desktop'),
(236, 103, 72, 'USER', '2026-06-01 12:26:06', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'Chrome 148.0.0.0', 'Windows 10', 'Desktop'),
(237, 99, 67, 'USER', '2026-06-09 11:15:52', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'Chrome 149.0.0.0', 'Windows 10', 'Desktop'),
(238, 99, 67, 'USER', '2026-06-09 11:19:57', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'Chrome 149.0.0.0', 'Windows 10', 'Desktop'),
(239, 101, 69, '', '2026-06-10 10:58:31', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 OPR/131.0.0.0', 'Opera 131.0.0.0', 'Windows 10', 'Desktop'),
(240, 103, 72, 'USER', '2026-06-26 14:12:36', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0', 'Edge 149.0.0.0', 'Windows 10', 'Desktop');

-- --------------------------------------------------------

--
-- Table structure for table `partner_document_downloads`
--

CREATE TABLE `partner_document_downloads` (
  `id` int(11) NOT NULL,
  `document_id` int(11) DEFAULT NULL,
  `partner_id` int(11) DEFAULT NULL,
  `downloaded_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `partner_document_downloads`
--

INSERT INTO `partner_document_downloads` (`id`, `document_id`, `partner_id`, `downloaded_at`) VALUES
(9, 99, 18, '2026-05-12 09:47:04'),
(10, 99, 18, '2026-06-09 10:15:52'),
(11, 99, 18, '2026-06-09 10:19:57');

-- --------------------------------------------------------

--
-- Table structure for table `password_history`
--

CREATE TABLE `password_history` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `password_hash` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `password_history`
--

INSERT INTO `password_history` (`id`, `user_id`, `password_hash`, `created_at`) VALUES
(6, 11, '$2b$10$sFNwcGSeIA9i9TwU0/CrXeMNUwBXBbsAY90AOUlddEedkyw63nMh6', '2026-04-05 09:49:18'),
(7, 11, '$2b$10$S.Zv7LjnxX7CdjbmSgpNNecVmb8ZUT281TeSKz83nrpVeRlYU8GWC', '2026-04-11 06:58:57'),
(8, 28, '$2b$10$aHz8U4WCZomnh2mfna8/ruvPQuL85PH4RIyKxhKmRw4G1pCwDMy3q', '2026-04-12 14:55:28'),
(9, 31, '$2b$10$sFNwcGSeIA9i9TwU0/CrXeMNUwBXBbsAY90AOUlddEedkyw63nMh6', '2026-04-20 11:40:17'),
(10, 34, '$2b$10$sFNwcGSeIA9i9TwU0/CrXeMNUwBXBbsAY90AOUlddEedkyw63nMh6', '2026-06-08 13:14:33');

-- --------------------------------------------------------

--
-- Table structure for table `password_recovery_sessions`
--

CREATE TABLE `password_recovery_sessions` (
  `id` int(11) NOT NULL,
  `staff_id` int(11) NOT NULL,
  `token` varchar(255) NOT NULL,
  `verified` tinyint(1) DEFAULT 0,
  `expires_at` datetime NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `password_recovery_sessions`
--

INSERT INTO `password_recovery_sessions` (`id`, `staff_id`, `token`, `verified`, `expires_at`, `created_at`) VALUES
(1, 1, '8a4fd487f1a761db5ad20721ee022bd2e9a97c592b7d9c795d3696ef074b4b1c', 0, '2026-06-29 07:05:46', '2026-06-29 05:55:46'),
(2, 1, 'ad9336f6b9ec01bec4df88fee2f67dcfb7350844ace85f523c0421272d414512', 0, '2026-06-29 07:12:22', '2026-06-29 06:02:22'),
(3, 1, '89be153381d0dd5896294aefb2862923f31e043abba6756d91528a40d06dc29c', 0, '2026-06-29 07:13:51', '2026-06-29 06:03:51'),
(4, 1, '63c10f7645bca6ad0bb1973534b5698cb709b2a138d72f51900f4f8c8637837e', 0, '2026-06-29 07:17:21', '2026-06-29 06:07:21'),
(5, 8, '06375a54af41143e53afa585e1ff34344ce8f28a61fa35ded2af2b0c3b13cc8c', 0, '2026-06-29 07:19:51', '2026-06-29 06:09:51'),
(6, 8, 'c7896607a711a42913b301d667ac089617dea3c24afcab5bad7c83b166b78116', 1, '2026-06-29 07:26:46', '2026-06-29 06:16:46'),
(8, 8, 'a506dd793bf6bff67052939ffb1fe7b2d5f64f3d59791590e9f99950c4b2915a', 0, '2026-06-29 08:08:24', '2026-06-29 06:58:24'),
(9, 8, '26ca2bc5e3980c9306cfc06d5983c90570a82911bd65b008bc357cc710b5df9f', 1, '2026-06-29 08:14:56', '2026-06-29 07:04:56'),
(10, 1, '1cb5eb541fd93dfa1cc3d661de13d81d910625fc0372ee30dd8cf085932f8b09', 0, '2026-06-29 08:21:57', '2026-06-29 07:11:57'),
(11, 11, 'be7eb494ca7a597c3fd8dd1c25414d20c52794f4cc0322886b3b35dc1b476344', 0, '2026-07-09 10:28:59', '2026-07-09 09:19:00');

-- --------------------------------------------------------

--
-- Table structure for table `programs`
--

CREATE TABLE `programs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `reportNameFormat` varchar(200) NOT NULL,
  `department_id` int(11) DEFAULT NULL,
  `role_id` int(11) DEFAULT NULL,
  `created_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `programs`
--

INSERT INTO `programs` (`id`, `name`, `description`, `reportNameFormat`, `department_id`, `role_id`, `created_by`, `created_at`) VALUES
(21, 'MR 2025', 'YTYDYYU YUYUWYUWYU', 'state_MR_2025_REPORT', 2, 3, 2, '2026-05-12 09:34:46'),
(22, 'MR 2026', 'JHSHJSHJS', 'state_MR_2025_REPORT', 1, 3, 1, '2026-05-13 08:35:23'),
(23, 'yyuiuuiui', 'kkjkjjk', 'jjjjkkj', 1, 3, 1, '2026-05-22 21:35:35');

-- --------------------------------------------------------

--
-- Table structure for table `program_reports`
--

CREATE TABLE `program_reports` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `program_id` int(11) DEFAULT NULL,
  `state` varchar(100) DEFAULT NULL,
  `uploaded_by` int(11) DEFAULT NULL,
  `file_url` text DEFAULT NULL,
  `file_name` varchar(255) DEFAULT NULL,
  `file_size` int(11) DEFAULT NULL,
  `file_type` varchar(50) DEFAULT NULL,
  `report_title` varchar(255) DEFAULT NULL,
  `submitted_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `file_extension` varchar(10) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `program_reports`
--

INSERT INTO `program_reports` (`id`, `program_id`, `state`, `uploaded_by`, `file_url`, `file_name`, `file_size`, `file_type`, `report_title`, `submitted_at`, `file_extension`) VALUES
(14, 21, 'Bauchi', 1, '/Reports/20260326_DIH_update_meeting_v1_4_20260511_1036_v1_0_20260512_103803.pdf', '20260326_DIH update meeting_v1.4_20260511_1036_v1.0.pdf', 2533264, 'application/pdf', 'BAUCHI STARE MR 2025 REPORT', '2026-05-12 09:38:03', '.pdf'),
(15, 22, 'Enugu', 8, '/Reports/downloaded-file__1__20260522_224100.pdf', 'downloaded-file (1).pdf', 417860, 'application/pdf', 'hhyuuyuy', '2026-05-22 21:41:00', '.pdf'),
(16, 22, 'Bauchi', 11, '/Reports/USMAN_OHAGENYI_ABUBAKAR_CPN_PROJECT_SIGNED_COPY_20260601_134326.pdf', 'USMAN OHAGENYI ABUBAKAR CPN PROJECT SIGNED COPY.pdf', 1680496, 'application/pdf', 'erreerereer', '2026-06-01 12:43:26', '.pdf');

-- --------------------------------------------------------

--
-- Table structure for table `program_team_leads`
--

CREATE TABLE `program_team_leads` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `program_id` int(11) DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  `state` varchar(100) DEFAULT NULL,
  `submission_status` enum('pending','submitted','','') NOT NULL DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `program_team_leads`
--

INSERT INTO `program_team_leads` (`id`, `program_id`, `user_id`, `state`, `submission_status`, `created_at`) VALUES
(19, 21, 1, 'Bauchi', 'submitted', '2026-05-12 09:35:54'),
(20, 22, 8, 'Enugu', 'submitted', '2026-05-22 21:28:36'),
(21, 23, 8, 'Delta', 'pending', '2026-05-22 21:36:17'),
(22, 22, 11, 'Bauchi', 'submitted', '2026-06-01 12:35:32');

-- --------------------------------------------------------

--
-- Table structure for table `restore_requests`
--

CREATE TABLE `restore_requests` (
  `id` int(11) NOT NULL,
  `document_id` int(11) DEFAULT NULL,
  `department_id` int(4) NOT NULL,
  `requested_by` int(11) DEFAULT NULL,
  `reason` text DEFAULT NULL,
  `action_taken_by` int(11) DEFAULT NULL,
  `status` enum('Pending','Approved','Rejected') DEFAULT 'Pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `action_date` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `restore_requests`
--

INSERT INTO `restore_requests` (`id`, `document_id`, `department_id`, `requested_by`, `reason`, `action_taken_by`, `status`, `created_at`, `action_date`) VALUES
(17, 100, 1, 1, 'ehhe', 11, 'Approved', '2026-05-15 13:35:53', '2026-05-15 14:36:52'),
(18, 103, 1, 1, 'hep restore', 11, 'Rejected', '2026-06-01 11:50:10', '2026-06-01 13:01:47'),
(19, 103, 1, 1, 'second request', 11, 'Approved', '2026-06-01 12:02:55', '2026-06-01 13:03:52');

-- --------------------------------------------------------

--
-- Table structure for table `roles`
--

CREATE TABLE `roles` (
  `id` int(11) NOT NULL,
  `name` varchar(50) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `roles`
--

INSERT INTO `roles` (`id`, `name`, `description`, `created_at`) VALUES
(1, 'SUPER_ADMIN', 'Full system access', '2026-02-14 05:33:07'),
(2, 'ADMIN', 'Department administrator', '2026-02-14 05:33:07'),
(3, 'FOCAL_PERSON', 'Department focal person', '2026-02-14 05:33:07'),
(4, 'STAFF', 'Regular staff member', '2026-02-14 05:33:07'),
(5, 'PARTNER', 'Our partners', '2026-04-05 10:31:48');

-- --------------------------------------------------------

--
-- Table structure for table `security_questions`
--

CREATE TABLE `security_questions` (
  `id` int(11) NOT NULL,
  `question` varchar(255) NOT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `security_questions`
--

INSERT INTO `security_questions` (`id`, `question`, `is_active`, `created_at`) VALUES
(1, 'What was the name of your first school?', 1, '2026-06-26 14:28:06'),
(2, 'What city were you born in?', 1, '2026-06-26 14:28:06'),
(3, 'What is your mother\'s maiden name?', 1, '2026-06-26 14:28:06'),
(4, 'What was your childhood nickname?', 1, '2026-06-26 14:28:06'),
(5, 'Who was your favourite teacher?', 1, '2026-06-26 14:28:06'),
(6, 'What was your first job title?', 1, '2026-06-26 14:28:06'),
(7, 'What was the make of your first vehicle?', 1, '2026-06-26 14:28:06'),
(8, 'What is your favourite local government area?', 1, '2026-06-26 14:28:06'),
(9, 'What is the name of your childhood best friend?', 1, '2026-06-26 14:28:06'),
(10, 'What street did you grow up on?', 1, '2026-06-26 14:28:06');

-- --------------------------------------------------------

--
-- Table structure for table `staff_movements`
--

CREATE TABLE `staff_movements` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `file_number` varchar(50) NOT NULL,
  `from_department_id` int(11) NOT NULL,
  `to_department_id` int(11) DEFAULT NULL,
  `movement_type` enum('TRANSFER','RETIRED','RESIGNED','TERMINATED') NOT NULL,
  `processed` tinyint(4) DEFAULT 0,
  `created_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `staff_movements`
--

INSERT INTO `staff_movements` (`id`, `user_id`, `file_number`, `from_department_id`, `to_department_id`, `movement_type`, `processed`, `created_by`, `created_at`) VALUES
(10, 7, '1700', 1, 2, 'TRANSFER', 1, 1, '2026-05-12 09:30:30');

-- --------------------------------------------------------

--
-- Table structure for table `staff_security_answers`
--

CREATE TABLE `staff_security_answers` (
  `id` int(11) NOT NULL,
  `staff_id` int(11) NOT NULL,
  `slot_number` tinyint(4) NOT NULL,
  `question_id` int(11) NOT NULL,
  `answer_hash` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `staff_security_answers`
--

INSERT INTO `staff_security_answers` (`id`, `staff_id`, `slot_number`, `question_id`, `answer_hash`, `created_at`) VALUES
(10, 8, 1, 2, '$2b$10$GEyNqAeOpCDqpjqk11txHO7PIZbAArHzeuzGNZp3LsbSpSxaIkyU.', '2026-06-29 06:16:30'),
(11, 8, 2, 8, '$2b$10$kd01V7MJ5bLV86kzOFcMg.3SuWn7TYSnV.O9ND8FppdU4Zl7lBfy6', '2026-06-29 06:16:30'),
(12, 8, 3, 4, '$2b$10$p4U7PH6VTQ6gZabYrBqAeOVkPa2ba9c0drk6fp9wNtCBhlJInq.Za', '2026-06-29 06:16:30'),
(13, 1, 1, 2, '$2b$10$fVfLKZt094LzHM0DqMyZ8epIgwjMb35r45VqXa0dasoB6rsE.ZO3a', '2026-07-09 08:48:52'),
(14, 1, 2, 6, '$2b$10$6eSUtEPbOcr2CcFF3tKtf.jB9JI1q1aQYdlDn9y47oKIzVuvMKI6G', '2026-07-09 08:48:52'),
(15, 1, 3, 1, '$2b$10$5tFUhpSpnVpPJ227C5Jn5eBnmphqx9Ni1AhmYZc0PBL3k3YAR0i0e', '2026-07-09 08:48:52'),
(16, 11, 1, 6, '$2b$10$xhQWOiBfDIu/vtQNyfRuu.HiEpfJcB3oPe1rBNXCUxdiU9cNqIlii', '2026-07-09 09:02:29'),
(17, 11, 2, 10, '$2b$10$9sahKxhn36Z.fwlhyAjYTeJTjJlBi3ZEddQxbxQ19.4wEbfLmkU0.', '2026-07-09 09:02:29'),
(18, 11, 3, 5, '$2b$10$hW6Af4mFnrKlv4jikM.LKeNqItG5hbkw6wfUnRKCC.o4Q332xkHB2', '2026-07-09 09:02:29'),
(19, 31, 1, 6, '$2b$10$RYEKMptzyXt0qhDo1ha0GOL/F3KkpDgHzYEmD0Spbkgd0y7aCQkpG', '2026-07-09 09:17:41'),
(20, 31, 2, 4, '$2b$10$Ct1Fhom1CGK27VGQ5n0F9evtyzxiRkWXUEkmxjtu.n.xE/9c1OJZy', '2026-07-09 09:17:41'),
(21, 31, 3, 7, '$2b$10$GM/JbjxwfAflAU5AdP3xXezPWeOLs9muq248nKkedQlLS.8ykMKMu', '2026-07-09 09:17:41');

-- --------------------------------------------------------

--
-- Table structure for table `support_tickets`
--

CREATE TABLE `support_tickets` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `subject` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `screenshot` varchar(255) DEFAULT NULL,
  `status` enum('Open','In Progress','Resolved','Closed') DEFAULT 'Open',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT NULL,
  `ticket_number` varchar(6) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `support_tickets`
--

INSERT INTO `support_tickets` (`id`, `user_id`, `subject`, `description`, `screenshot`, `status`, `created_at`, `updated_at`, `ticket_number`) VALUES
(5, 1, 'Neque porro quisquam est qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit', 'rrerrr', NULL, 'Closed', '2026-03-23 15:04:12', NULL, NULL),
(6, 1, 'Neque porro quisquam est qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit', 'dddd', NULL, 'Open', '2026-03-23 15:07:30', NULL, NULL),
(7, 1, 'Neque porro quisquam est qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque egestas tortor rhoncus tellus porta, eu laoreet nisi vehicula. Aenean et ultrices urna, ut fermentum quam. Morbi et nisi turpis. Phasellus egestas sed mauris vitae feugiat. Fusce consequat, sapien et laoreet sodales, lorem dui ultrices magna, eu blandit risus elit vitae risus. Ut ultricies lacus felis, non hendrerit ligula faucibus ut. Maecenas ut neque risus. Sed vitae ipsum sed nisi ultrices auctor nec vitae eros. Donec dolor dolor, pharetra id diam quis, rhoncus sollicitudin mauris. Suspendisse efficitur dui at elit bibendum tincidunt vel in purus. Morbi vel libero sed lorem consequat mattis a at dolor. In finibus, libero eget ullamcorper eleifend, urna tellus sagittis purus, a commodo enim nunc eu felis. Nullam ornare placerat nunc nec tempus.', NULL, 'In Progress', '2026-03-23 15:08:04', NULL, NULL),
(8, 1, 'dsdsds', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque egestas tortor rhoncus tellus porta, eu laoreet nisi vehicula. Aenean et ultrices urna, ut fermentum quam. Morbi et nisi turpis. Phasellus egestas sed mauris vitae feugiat. Fusce consequat, sapien et laoreet sodales, lorem dui ultrices magna, eu blandit risus elit vitae risus. Ut ultricies lacus felis, non hendrerit ligula faucibus ut. Maecenas ut neque risus. Sed vitae ipsum sed nisi ultrices auctor nec vitae eros. Donec dolor dolor, pharetra id diam quis, rhoncus sollicitudin mauris. Suspendisse efficitur dui at elit bibendum tincidunt vel in purus. Morbi vel libero sed lorem consequat mattis a at dolor. In finibus, libero eget ullamcorper eleifend, urna tellus sagittis purus, a commodo enim nunc eu felis. Nullam ornare placerat nunc nec tempus.', '/Supports/Won_By_Party_20260323_160931.PNG', 'Resolved', '2026-03-23 15:09:31', NULL, NULL),
(9, 1, 'fdghfhyy', 'ftrtrtrtrtrtr', NULL, 'Open', '2026-03-24 05:33:05', NULL, '855856'),
(10, 1, 'ytytyyu jyu', 'yuiuiuiuiuiu iioio ioiiooi', NULL, 'Open', '2026-03-24 05:46:34', NULL, '686625'),
(11, 1, 'from staff', 'jsjhjhjs shjshj', '/Supports/Coat_of_arms_of_Nigeria_svg_20260324_132638.png', 'In Progress', '2026-03-24 12:26:38', '2026-06-03 11:09:53', '926075'),
(12, 7, 'rrrr', 'rrrrr', NULL, 'Open', '2026-03-24 12:41:12', NULL, '435978'),
(13, 7, 'hjhjhjhjjk', 'jjiuiijhjkjk', NULL, 'Open', '2026-03-29 08:20:06', NULL, '399594'),
(14, 7, 'opopop', 'nbbnvbvb', NULL, 'Resolved', '2026-03-29 08:20:16', NULL, '786357'),
(15, 7, 'uiuiuinnnm bhghgh', 'jkkjhjhhjhj', NULL, 'In Progress', '2026-03-29 08:20:29', NULL, '936969'),
(16, 7, 'uyyuuy', 'jhhjhjjh', NULL, 'Open', '2026-04-03 18:13:50', NULL, '340199'),
(17, 11, 'from admin', 'testing', '/Supports/Screenshot_2026-04-04_175726_20260405_110009.png', 'Open', '2026-04-05 10:00:09', NULL, '620765'),
(18, 11, 'trrttr', 'rthh fdggdgd', '/Supports/Screenshot_2026-04-04_184009_20260405_110642.png', 'Open', '2026-04-05 10:06:42', NULL, '680537'),
(19, 11, 'ewer', 'wrrw', NULL, 'Open', '2026-04-11 07:02:35', NULL, '526583'),
(20, 28, 'usman', 'me', '/Supports/Screenshot_2026-04-01_121636_20260412_164914.png', 'Closed', '2026-04-12 15:49:14', '2026-04-27 10:43:30', '425593'),
(21, 28, 'ttrrt', 'eeee', NULL, 'Resolved', '2026-04-12 15:49:28', '2026-06-03 11:08:59', '285120'),
(22, 28, 'Unable to download document', 'i was unable to download strategic document share with us', '/Supports/Screenshot_2026-04-04_184009_20260412_173432.png', 'Resolved', '2026-04-12 16:34:32', '2026-04-27 11:17:30', '272377'),
(23, 1, 'fdfddf', 'gffgfhfh', NULL, 'Resolved', '2026-04-30 10:47:53', '2026-04-30 10:48:48', '926589'),
(24, 1, 'uiiuiuiu', 'jkkjjkkj', NULL, 'Open', '2026-05-06 12:54:59', NULL, '431675'),
(25, 1, 'oioio', 'l;l;l;ll;l;', NULL, 'Open', '2026-05-06 12:55:08', NULL, '501031'),
(26, 1, 'oioioi', 'wqertyuio', NULL, 'Open', '2026-05-06 12:55:17', NULL, '315256'),
(27, 2, 'jhsdjhdhj', 'kjhhhjjkkhd', NULL, 'Open', '2026-05-12 09:32:56', NULL, '740217'),
(28, 8, 'jfhhjf', 'shjjhhjjhdf', NULL, 'Open', '2026-05-22 21:19:27', NULL, '505293'),
(29, 8, 'kjjhhj', 'hjhhjhjjh', '/Supports/IMG_20250306_084742_251_20260522_222022.jpg', 'Resolved', '2026-05-22 21:20:22', '2026-06-02 10:54:51', '141354');

-- --------------------------------------------------------

--
-- Table structure for table `system_storage_settings`
--

CREATE TABLE `system_storage_settings` (
  `id` int(11) NOT NULL,
  `allocated_storage_mb` bigint(20) NOT NULL,
  `updated_by` int(11) DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `system_storage_settings`
--

INSERT INTO `system_storage_settings` (`id`, `allocated_storage_mb`, `updated_by`, `updated_at`) VALUES
(1, 512000, 31, '2026-06-03 09:46:47');

-- --------------------------------------------------------

--
-- Table structure for table `system_support_contacts`
--

CREATE TABLE `system_support_contacts` (
  `id` int(11) NOT NULL,
  `type` enum('LINE_MANAGER','DEVELOPER','HELP_DESK') NOT NULL,
  `title` varchar(100) DEFAULT NULL,
  `subtitle` varchar(150) DEFAULT NULL,
  `name` varchar(150) DEFAULT NULL,
  `email` varchar(150) DEFAULT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `extra_info` varchar(150) DEFAULT NULL,
  `color` varchar(20) DEFAULT '#198754',
  `initials` varchar(10) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `system_support_contacts`
--

INSERT INTO `system_support_contacts` (`id`, `type`, `title`, `subtitle`, `name`, `email`, `phone`, `extra_info`, `color`, `initials`, `created_at`, `updated_at`) VALUES
(1, 'LINE_MANAGER', 'Line Manager', 'Head, ICT Unit', 'Dr. Aisha Yakubu', 'aishayakubu@nphcda.gov.ng', '+2348174909607', '24/7 Support', '#0e7134', 'LM', '2026-04-29 10:48:08', '2026-04-29 13:42:08'),
(2, 'DEVELOPER', 'System Developer', 'ICT Software Development Team', 'Usman Ohagenyi Abubakar', 'usman.abubakar@nphcda.gov.ng', '+2349051523522', '24/7 Support', '#0d6efd', 'DEV', '2026-04-29 10:48:08', '2026-04-29 13:36:28'),
(3, 'HELP_DESK', 'ICT Help Desk', 'Technical Support', NULL, 'helpdesk@nphcda.gov.ng', '+2348090000000', 'Mon - Fri (8am - 5pm)', '#ffc107', 'HD', '2026-04-29 10:48:08', '2026-04-29 10:48:08');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `title` varchar(100) NOT NULL,
  `full_name` varchar(255) NOT NULL,
  `gender` enum('Male','Female','None') DEFAULT NULL,
  `designation` varchar(100) DEFAULT NULL,
  `division_unit_state` varchar(255) NOT NULL,
  `file_number` int(4) DEFAULT NULL,
  `email` varchar(150) NOT NULL,
  `phone_number` varchar(30) DEFAULT NULL,
  `username` varchar(100) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `department_id` int(11) NOT NULL,
  `role_id` int(11) NOT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `is_locked` tinyint(1) DEFAULT 0,
  `is_removed` tinyint(1) DEFAULT 0,
  `last_login` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `title`, `full_name`, `gender`, `designation`, `division_unit_state`, `file_number`, `email`, `phone_number`, `username`, `password_hash`, `department_id`, `role_id`, `is_active`, `is_locked`, `is_removed`, `last_login`, `created_at`, `updated_at`) VALUES
(1, 'Mr.', 'Usman Ohagenyi Abubakar', 'Male', 'Scientific Officer I', 'Monitoring & Evaluation Division', 1791, 'usmanohas@gmail.com', '090515235100', 'PRSFP001', '$2b$10$sFNwcGSeIA9i9TwU0/CrXeMNUwBXBbsAY90AOUlddEedkyw63nMh6', 1, 3, 1, 0, 0, '2026-07-09 08:34:09', '2026-02-14 17:36:23', '2026-07-09 08:34:09'),
(2, 'Dr.', 'Lukman Ibrahim', 'Male', 'System Analyst 1', 'AEFI', 1010, 'lukman@gmail.com', '09051523522', 'DCIFP001', '$2b$10$sFNwcGSeIA9i9TwU0/CrXeMNUwBXBbsAY90AOUlddEedkyw63nMh6', 2, 3, 1, 0, 0, '2026-06-26 13:44:06', '2026-03-06 12:52:35', '2026-06-26 13:44:06'),
(7, 'Miss.', 'Aisha Adamu', 'Female', 'Program Analyst II', 'ICT', 1700, 'aisha@gmail.com', '07056369101', 'aisha@gmail.com', '$2b$10$sFNwcGSeIA9i9TwU0/CrXeMNUwBXBbsAY90AOUlddEedkyw63nMh6', 2, 4, 1, 0, 0, '2026-05-07 14:17:14', '2026-03-13 18:23:21', '2026-05-12 09:31:16'),
(8, 'Mrs.', 'Fatima Lukman', 'Female', 'Accountant 1', 'M&E', 1708, 'fati@gmail.com', '08042537624', 'fati@gmail.com', '$2b$10$sFNwcGSeIA9i9TwU0/CrXeMNUwBXBbsAY90AOUlddEedkyw63nMh6', 1, 4, 1, 0, 0, '2026-07-09 08:35:11', '2026-03-13 19:33:37', '2026-07-09 08:35:11'),
(9, 'Pharm.', 'Rahmatu Aliyu', 'Female', 'Program Analyst', '', 1283, 'usmanohas400@gmail.com', '07056369109', 'rahmat@gmail.com', '$2b$10$sFNwcGSeIA9i9TwU0/CrXeMNUwBXBbsAY90AOUlddEedkyw63nMh6', 2, 4, 1, 0, 0, '2026-04-03 15:49:00', '2026-03-16 14:19:29', '2026-05-12 08:49:47'),
(10, 'Mr.', 'Yahaya Umar', 'Male', 'Program Analyst I', '', 3434, 'usmanohas40@gmail.com', '08042537620', 'yahaya@gmail.com', '$2b$10$gQwMDUpSmrzDoyQLw6geuuJtFfygrWEZ.SFBkc1A5D5/c.KEbjWa6', 3, 4, 1, 1, 1, NULL, '2026-03-16 14:22:41', '2026-04-26 06:48:23'),
(11, 'Engr.', 'Otowo', 'Male', 'Director PRS2', 'PRS', 2015, 'otowo@gmail.com', '08064729847', 'otowo@gmail.com', '$2b$10$sFNwcGSeIA9i9TwU0/CrXeMNUwBXBbsAY90AOUlddEedkyw63nMh6', 1, 2, 1, 0, 0, '2026-07-09 08:49:55', '2026-04-05 06:58:40', '2026-07-09 08:49:55'),
(18, 'Partners', 'Nigeria Centre for Disease Control and Prevention (NCDC)', 'None', 'Partner', 'Plot 801, Ebitu Ukiwe Street, Jabi, Abuja, Nigeria', NULL, 'info@ncdc.gov.ng', '+234 708 711 0839', 'info@ncdc.gov.ng', '$2b$10$sFNwcGSeIA9i9TwU0/CrXeMNUwBXBbsAY90AOUlddEedkyw63nMh6', 7, 5, 1, 0, 0, '2026-06-09 10:14:54', '2026-04-05 12:44:30', '2026-06-09 10:14:54'),
(28, 'Partners', 'African Field Epidemiology Network (AFENET)', 'None', 'Partner', 'Ground Floor, Wings B & C,\nLugogo House,\nPlot 42, Lugogo By-Pass P.O. Box 12874 Kampala,', NULL, 'communications@afenet.net', '+256-312-700650', 'communications@afenet.net', '$2b$10$Tl42pQkKyC/GkHoRdmg1MOU3yTYuKWrIpHmZ5i2tEjxUkY4CKLtSi', 7, 5, 1, 0, 0, '2026-04-13 09:45:24', '2026-04-06 11:42:51', '2026-04-13 09:45:24'),
(29, 'Partners', 'eHealth Africa (eHA)', 'None', 'Partner', '28 Osun crescent, Maitama, Abuja.', NULL, 'info@ehealthafrica.org', '+256-312-700633', 'info@ehealthafrica.org', '$2b$10$hVd3pA2CzmCeuuvAcrtpBuJIiJuNuW22c0YZOl4MJE9qcBzYlODVa', 7, 5, 1, 0, 0, '2026-04-12 10:26:15', '2026-04-06 11:50:46', '2026-04-12 10:26:15'),
(30, 'Partners', 'SOLINA 5', 'None', 'Partner', 'ewrr address3', NULL, 'hagtech2@gmail.com', '0806472984734', 'hagtech@gmail.com', '$2b$10$66prO0vfXf90zlmgyp13d.zBlK4hh3eK1FHgIJQFsA7qaURVkSef2', 7, 5, 1, 0, 0, '2026-04-12 16:49:45', '2026-04-11 07:04:30', '2026-04-28 06:02:42'),
(31, 'Dr.', 'Kasim Simgbabi Abdullahi', 'Male', 'DPO II', 'M&E', 1788, 'kasim@gmail.com', '08160643658', 'kas', '$2b$10$sFNwcGSeIA9i9TwU0/CrXeMNUwBXBbsAY90AOUlddEedkyw63nMh6', 1, 1, 1, 0, 0, '2026-07-09 09:04:16', '2026-04-20 08:05:50', '2026-07-09 09:04:16'),
(32, 'Engr.', 'Aminu', 'Male', 'Director', 'DCI', 603298, 'aminu@gmail.com', '09023451728', 'aminu@gmail.com', '$2b$10$7nv4fXpZywmvhksid6glnuLWR3145/VjfxiPZAqaN0fM7U5qvwtqe', 2, 2, 1, 0, 0, '2026-04-24 06:36:07', '2026-04-24 06:02:14', '2026-04-28 13:58:48'),
(33, 'Miss.', 'Fatima usman', 'Female', 'Director', 'Nutrition', 107303, 'fatima@gmail.com', '0812345678', 'fatima@gmail.com', '$2b$10$XKSFegWYtibOsv/54v/ZneCkN5aEf/PUN9Fz/fnwH4C6ru30XFYH2', 5, 4, 1, 0, 0, NULL, '2026-04-24 19:19:29', '2026-04-28 12:25:37'),
(34, 'Pharm.', 'Ruth Aminu', 'Female', 'Scientific Officer I', 'AEFI', 1993, 'ruth@gmail.com', '09035267834', 'ruth', '$2b$10$g2FMNpkKVyzEFsSXCAAIIOhg.qjaMx6tWlGhUih2UcIyYvt4.Zlba', 2, 4, 1, 0, 0, '2026-06-08 13:15:13', '2026-04-26 05:44:42', '2026-06-08 13:15:13'),
(35, 'Partner', 'FIONET 4', 'None', 'Partner', 'fionet address h', NULL, 'info3@fionet.com', '234567890-767', 'info@fionet.com', '$2b$10$e5o.fV.5lbx73eWmyJo1nONn8xsi/IZfPOQChBvmoSpQhtAu0UzMe', 7, 5, 1, 0, 0, '2026-04-26 16:40:40', '2026-04-26 16:37:36', '2026-04-28 06:23:00'),
(36, 'Partner', 'uiu', 'None', 'Partner', 'hjkl', NULL, 'n@c', '2345678890678', 'n@c', '$2b$10$G6mYLMvkeqx98Cd.13P6xOzJ6kyx10RSO43IUGETnv7GAKxZnjp3q', 7, 5, 1, 0, 0, NULL, '2026-04-28 06:35:26', '2026-04-28 06:49:23'),
(37, 'Partner', 'tyui', 'None', 'Partner', 'wertyui', NULL, 'h@com', '123456789076', 'h@x', '$2b$10$avUqvCDNAnrHDiraaULiIu3XJLGetsfHTVxUf73aU5cPPdJ/VkSZe', 7, 5, 1, 0, 0, NULL, '2026-04-28 06:37:13', '2026-04-28 14:43:10'),
(38, 'Miss.', 'Usman Aliyu', 'Male', 'ict', 'M&E', 5637, 'a@com', '12345678967', 'aliyu', '$2b$10$VDX8dBjwjmmxnctDIIgK6utFn8e.pSkUQIkf1J.W9s3z4nBEyql2S', 6, 2, 1, 0, 0, NULL, '2026-04-28 12:02:57', '2026-04-28 14:13:57'),
(39, 'Ms.', 'bnt gg', 'Female', 'rtt', 'wertyu', 3443, 'ss@rr', '123456789056', 'wer', '$2b$10$nar2MLe.URGu6vl5s.D9SOJ1coCPq7glHl/zPOdzXixXIExAp11wa', 6, 3, 1, 0, 0, NULL, '2026-04-28 12:11:24', '2026-04-28 12:55:54'),
(40, 'Dr.', 'yuyyu uyuuyu', 'Male', 'wertyu', 'sdfghj', 67676, 'y@v', '23456789078', 'wertyu', '$2b$10$xq8EGabye9GuOc3F5JqUJ.F1zv3q/Axa7gdJZ78kiSUEOgZPENBmO', 6, 3, 1, 0, 0, NULL, '2026-04-28 12:46:43', '2026-06-05 11:10:50'),
(41, 'Mrs.', 'wertyuiop rtyuiop', 'Female', 'weweerr', 'weewerre', 266973, 'd@d', '1234567890', 'ewrty', '$2b$10$3FNqeRfiz0H2RAU4nO1lpOrJ0t.Er1YVmE0bno7fYfITgpZVw.dX.', 10, 2, 1, 0, 0, NULL, '2026-04-28 14:03:12', '2026-04-28 14:03:12'),
(42, 'Ms.', 'ertyu tyyuuy', 'Male', 'fg', 'wertyui', 986212, 'f@f', '123456785454f', 'ssd', '$2b$10$N3eJXisFkGk/Q6esPQN6X.ZwYHXr1xBovDxNAbvJi.LB4r1GMOmXe', 9, 2, 1, 0, 0, NULL, '2026-04-28 14:07:05', '2026-04-28 14:07:05'),
(43, 'Dr.', 'Salma Saidu', 'Female', 'Program Analyst', '', 4445, 'salma@gmail.com', '07056369110', 'salma@gmail.com', '$2b$10$S/WCxs/sTtPtMSr13TOHH.3z6/tCIeMpxD3ju73RuNNBZ6mlS44Ou', 1, 4, 1, 0, 0, '2026-06-10 11:30:45', '2026-05-19 11:31:44', '2026-06-10 11:30:45'),
(44, 'Mr.', 'Musa Yunusa', 'Male', 'Program Analyst II', '', 4446, 'musa@gmail.com', '07056369111', 'musa@gmail.com', '$2b$10$.SBr5wO1vrGkh7e/1zUdq.k/AvKp6UJv.nqOcZX9dg3OWyL/WQMPm', 1, 4, 1, 0, 0, NULL, '2026-05-19 11:50:20', '2026-05-21 08:44:39'),
(45, 'Ms.', 'Zulaha Adamu Sani', 'Female', 'Program Analyst I', '', 10004, 'zul@gmail.com', '07056369222', 'zul@gmail.com', '$2b$10$z/a8WzEairgQQFuCh.4s..9hHHFs0NuyUuTLco6fhqI1BokETsfFy', 1, 4, 1, 0, 0, NULL, '2026-06-26 14:03:44', '2026-06-26 14:03:44');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `audit_logs`
--
ALTER TABLE `audit_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `session_id` (`session_id`),
  ADD KEY `action` (`action`);

--
-- Indexes for table `departments`
--
ALTER TABLE `departments`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`),
  ADD UNIQUE KEY `name_abbreviation` (`name_abbreviation`);

--
-- Indexes for table `department_document_access_grants`
--
ALTER TABLE `department_document_access_grants`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `department_document_access_requests`
--
ALTER TABLE `department_document_access_requests`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `documents`
--
ALTER TABLE `documents`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `document_access_permissions`
--
ALTER TABLE `document_access_permissions`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `document_access_requests`
--
ALTER TABLE `document_access_requests`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `document_categories`
--
ALTER TABLE `document_categories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Indexes for table `document_public_links`
--
ALTER TABLE `document_public_links`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `token` (`token`);

--
-- Indexes for table `document_shares`
--
ALTER TABLE `document_shares`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `document_subcategories`
--
ALTER TABLE `document_subcategories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_subcategory` (`category_id`,`name`);

--
-- Indexes for table `document_versions`
--
ALTER TABLE `document_versions`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `download_logs`
--
ALTER TABLE `download_logs`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `partner_document_downloads`
--
ALTER TABLE `partner_document_downloads`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `password_history`
--
ALTER TABLE `password_history`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `password_recovery_sessions`
--
ALTER TABLE `password_recovery_sessions`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `programs`
--
ALTER TABLE `programs`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `program_reports`
--
ALTER TABLE `program_reports`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `program_team_leads`
--
ALTER TABLE `program_team_leads`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `restore_requests`
--
ALTER TABLE `restore_requests`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Indexes for table `security_questions`
--
ALTER TABLE `security_questions`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `staff_movements`
--
ALTER TABLE `staff_movements`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `staff_security_answers`
--
ALTER TABLE `staff_security_answers`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_staff_slot` (`staff_id`,`slot_number`);

--
-- Indexes for table `support_tickets`
--
ALTER TABLE `support_tickets`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `ticket_id` (`ticket_number`);

--
-- Indexes for table `system_storage_settings`
--
ALTER TABLE `system_storage_settings`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `system_support_contacts`
--
ALTER TABLE `system_support_contacts`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `file_number` (`file_number`),
  ADD KEY `department_id` (`department_id`),
  ADD KEY `role_id` (`role_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `audit_logs`
--
ALTER TABLE `audit_logs`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1140;

--
-- AUTO_INCREMENT for table `departments`
--
ALTER TABLE `departments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT for table `department_document_access_grants`
--
ALTER TABLE `department_document_access_grants`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `department_document_access_requests`
--
ALTER TABLE `department_document_access_requests`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=24;

--
-- AUTO_INCREMENT for table `documents`
--
ALTER TABLE `documents`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=107;

--
-- AUTO_INCREMENT for table `document_access_permissions`
--
ALTER TABLE `document_access_permissions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `document_access_requests`
--
ALTER TABLE `document_access_requests`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=32;

--
-- AUTO_INCREMENT for table `document_categories`
--
ALTER TABLE `document_categories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `document_public_links`
--
ALTER TABLE `document_public_links`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `document_shares`
--
ALTER TABLE `document_shares`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT for table `document_subcategories`
--
ALTER TABLE `document_subcategories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=34;

--
-- AUTO_INCREMENT for table `document_versions`
--
ALTER TABLE `document_versions`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=76;

--
-- AUTO_INCREMENT for table `download_logs`
--
ALTER TABLE `download_logs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=241;

--
-- AUTO_INCREMENT for table `partner_document_downloads`
--
ALTER TABLE `partner_document_downloads`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `password_history`
--
ALTER TABLE `password_history`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `password_recovery_sessions`
--
ALTER TABLE `password_recovery_sessions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `programs`
--
ALTER TABLE `programs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=24;

--
-- AUTO_INCREMENT for table `program_reports`
--
ALTER TABLE `program_reports`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT for table `program_team_leads`
--
ALTER TABLE `program_team_leads`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

--
-- AUTO_INCREMENT for table `restore_requests`
--
ALTER TABLE `restore_requests`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT for table `roles`
--
ALTER TABLE `roles`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `security_questions`
--
ALTER TABLE `security_questions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `staff_movements`
--
ALTER TABLE `staff_movements`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `staff_security_answers`
--
ALTER TABLE `staff_security_answers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- AUTO_INCREMENT for table `support_tickets`
--
ALTER TABLE `support_tickets`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=30;

--
-- AUTO_INCREMENT for table `system_storage_settings`
--
ALTER TABLE `system_storage_settings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `system_support_contacts`
--
ALTER TABLE `system_support_contacts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=46;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `document_subcategories`
--
ALTER TABLE `document_subcategories`
  ADD CONSTRAINT `document_subcategories_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `document_categories` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `users_ibfk_1` FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`),
  ADD CONSTRAINT `users_ibfk_2` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
