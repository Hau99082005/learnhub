CREATE DATABASE  IF NOT EXISTS `learnhub` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `learnhub`;
-- MySQL dump 10.13  Distrib 8.0.45, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: learnhub
-- ------------------------------------------------------
-- Server version	8.0.45

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `announcements`
--

DROP TABLE IF EXISTS `announcements`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `announcements` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `course_id` bigint DEFAULT NULL,
  `author_id` bigint NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `content` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_ann_course` (`course_id`),
  KEY `fk_ann_author` (`author_id`),
  CONSTRAINT `fk_ann_author` FOREIGN KEY (`author_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_ann_course` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `announcements`
--

LOCK TABLES `announcements` WRITE;
/*!40000 ALTER TABLE `announcements` DISABLE KEYS */;
/*!40000 ALTER TABLE `announcements` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `api_clients`
--

DROP TABLE IF EXISTS `api_clients`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `api_clients` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `client_id` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `api_key_hash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `scopes` json DEFAULT NULL,
  `status` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ACTIVE',
  `last_used_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `client_id` (`client_id`),
  CONSTRAINT `api_clients_chk_1` CHECK ((`status` in (_utf8mb4'ACTIVE',_utf8mb4'INACTIVE',_utf8mb4'REVOKED')))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `api_clients`
--

LOCK TABLES `api_clients` WRITE;
/*!40000 ALTER TABLE `api_clients` DISABLE KEYS */;
/*!40000 ALTER TABLE `api_clients` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `assignment_submissions`
--

DROP TABLE IF EXISTS `assignment_submissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `assignment_submissions` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `assignment_id` bigint NOT NULL,
  `user_id` bigint NOT NULL,
  `media_id` bigint DEFAULT NULL,
  `content` text COLLATE utf8mb4_unicode_ci,
  `score` decimal(5,2) DEFAULT NULL,
  `feedback` text COLLATE utf8mb4_unicode_ci,
  `status` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'SUBMITTED',
  `submitted_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `graded_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_as_assignment` (`assignment_id`),
  KEY `fk_as_user` (`user_id`),
  KEY `fk_as_media` (`media_id`),
  CONSTRAINT `fk_as_assignment` FOREIGN KEY (`assignment_id`) REFERENCES `assignments` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_as_media` FOREIGN KEY (`media_id`) REFERENCES `media_assets` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_as_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `assignment_submissions_chk_1` CHECK ((`status` in (_utf8mb4'SUBMITTED',_utf8mb4'GRADED',_utf8mb4'RETURNED')))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `assignment_submissions`
--

LOCK TABLES `assignment_submissions` WRITE;
/*!40000 ALTER TABLE `assignment_submissions` DISABLE KEYS */;
/*!40000 ALTER TABLE `assignment_submissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `assignments`
--

DROP TABLE IF EXISTS `assignments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `assignments` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `lesson_id` bigint NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `due_at` timestamp NULL DEFAULT NULL,
  `max_score` int NOT NULL DEFAULT '100',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `lesson_id` (`lesson_id`),
  CONSTRAINT `fk_assignments_lesson` FOREIGN KEY (`lesson_id`) REFERENCES `lessons` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `assignments`
--

LOCK TABLES `assignments` WRITE;
/*!40000 ALTER TABLE `assignments` DISABLE KEYS */;
/*!40000 ALTER TABLE `assignments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `audit_logs`
--

DROP TABLE IF EXISTS `audit_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `audit_logs` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `actor_id` bigint DEFAULT NULL,
  `action` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `entity_type` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `entity_id` bigint DEFAULT NULL,
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `old_values` json DEFAULT NULL,
  `new_values` json DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_audit_entity` (`entity_type`,`entity_id`),
  KEY `fk_audit_actor` (`actor_id`),
  CONSTRAINT `fk_audit_actor` FOREIGN KEY (`actor_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `audit_logs`
--

LOCK TABLES `audit_logs` WRITE;
/*!40000 ALTER TABLE `audit_logs` DISABLE KEYS */;
/*!40000 ALTER TABLE `audit_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `banners`
--

DROP TABLE IF EXISTS `banners`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `banners` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `image_url` varchar(500) NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_banners_active` (`is_active`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `banners`
--

LOCK TABLES `banners` WRITE;
/*!40000 ALTER TABLE `banners` DISABLE KEYS */;
INSERT INTO `banners` VALUES (3,'Thiết kế chưa có tên','/uploads/banners/39ff79e4-5e8a-4e50-b756-06e852fa40ba.png',1,'2026-09-12 23:08:17','2026-09-12 23:08:17'),(4,'Vibrant LearnHub Website Banner with Young Learner','/uploads/banners/65381a02-f7be-4f29-93a3-d23d1a88b505.png',1,'2026-09-12 23:08:23','2026-09-12 23:08:30');
/*!40000 ALTER TABLE `banners` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cart_items`
--

DROP TABLE IF EXISTS `cart_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cart_items` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `cart_id` bigint NOT NULL,
  `course_id` bigint NOT NULL,
  `unit_price` decimal(12,2) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `cart_id` (`cart_id`,`course_id`),
  KEY `fk_cart_items_course` (`course_id`),
  CONSTRAINT `fk_cart_items_cart` FOREIGN KEY (`cart_id`) REFERENCES `carts` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_cart_items_course` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=79 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cart_items`
--

LOCK TABLES `cart_items` WRITE;
/*!40000 ALTER TABLE `cart_items` DISABLE KEYS */;
/*!40000 ALTER TABLE `cart_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `carts`
--

DROP TABLE IF EXISTS `carts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `carts` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `status` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ACTIVE',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_carts_user_status` (`user_id`,`status`),
  CONSTRAINT `fk_carts_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `carts_chk_1` CHECK ((`status` in (_utf8mb4'ACTIVE',_utf8mb4'CHECKED_OUT',_utf8mb4'ABANDONED')))
) ENGINE=InnoDB AUTO_INCREMENT=71 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `carts`
--

LOCK TABLES `carts` WRITE;
/*!40000 ALTER TABLE `carts` DISABLE KEYS */;
INSERT INTO `carts` VALUES (1,11,'ACTIVE','2026-09-22 08:08:27','2026-09-22 08:08:27'),(2,6,'CHECKED_OUT','2026-09-22 08:14:42','2026-10-01 09:45:45'),(3,12,'CHECKED_OUT','2026-09-22 08:38:14','2026-09-22 08:38:14'),(4,13,'CHECKED_OUT','2026-09-22 08:38:33','2026-09-22 08:38:33'),(5,13,'ACTIVE','2026-09-22 08:38:33','2026-09-22 08:38:33'),(6,14,'CHECKED_OUT','2026-09-22 08:39:49','2026-09-22 08:39:49'),(7,6,'CHECKED_OUT','2026-10-01 09:46:16','2026-10-01 09:51:52'),(8,6,'CHECKED_OUT','2026-10-01 10:01:28','2026-10-01 10:01:42'),(9,6,'CHECKED_OUT','2026-10-01 10:02:52','2026-10-01 10:03:12'),(10,6,'CHECKED_OUT','2026-10-01 10:03:29','2026-10-01 10:03:37'),(11,6,'CHECKED_OUT','2026-10-01 10:15:18','2026-10-01 10:15:25'),(12,15,'CHECKED_OUT','2026-10-01 10:19:33','2026-10-01 10:19:39'),(13,6,'CHECKED_OUT','2026-10-13 20:57:20','2026-10-13 20:57:31'),(14,6,'CHECKED_OUT','2026-10-13 21:02:32','2026-10-13 21:02:41'),(15,6,'CHECKED_OUT','2026-10-13 21:15:30','2026-10-13 21:15:47'),(16,6,'CHECKED_OUT','2026-10-13 21:21:40','2026-10-13 21:21:57'),(17,17,'CHECKED_OUT','2026-10-13 21:26:49','2026-10-13 21:27:05'),(18,17,'CHECKED_OUT','2026-10-13 21:33:48','2026-10-13 21:33:53'),(19,18,'CHECKED_OUT','2026-10-13 21:38:39','2026-10-13 21:38:45'),(20,18,'CHECKED_OUT','2026-10-13 21:42:01','2026-10-13 21:42:08'),(21,18,'CHECKED_OUT','2026-10-13 21:56:03','2026-10-13 21:56:09'),(22,18,'CHECKED_OUT','2026-10-13 22:01:01','2026-10-13 22:01:08'),(23,18,'CHECKED_OUT','2026-10-13 22:05:16','2026-10-13 22:08:42'),(24,18,'CHECKED_OUT','2026-10-13 22:11:50','2026-10-13 22:11:56'),(25,18,'CHECKED_OUT','2026-10-13 22:20:52','2026-10-13 22:21:00'),(26,15,'CHECKED_OUT','2026-10-13 23:06:49','2026-10-13 23:06:56'),(27,15,'CHECKED_OUT','2026-10-13 23:08:29','2026-10-13 23:08:40'),(28,15,'CHECKED_OUT','2026-10-14 04:16:06','2026-10-14 04:16:12'),(29,15,'CHECKED_OUT','2026-10-14 04:21:40','2026-10-14 04:21:53'),(30,19,'CHECKED_OUT','2026-10-14 06:13:47','2026-10-14 06:16:59'),(31,19,'CHECKED_OUT','2026-10-14 06:24:20','2026-10-14 06:43:42'),(32,19,'CHECKED_OUT','2026-10-14 06:45:42','2026-10-14 06:45:54'),(33,20,'ACTIVE','2026-10-14 06:50:31','2026-10-14 06:50:31'),(34,21,'CHECKED_OUT','2026-10-14 07:38:40','2026-10-14 07:39:47'),(35,21,'CHECKED_OUT','2026-10-14 08:10:16','2026-10-14 08:10:41'),(36,22,'CHECKED_OUT','2026-10-14 08:22:26','2026-10-14 08:23:06'),(37,22,'CHECKED_OUT','2026-10-14 08:23:35','2026-10-14 08:23:39'),(38,22,'CHECKED_OUT','2026-10-14 08:26:59','2026-10-14 08:27:07'),(39,22,'CHECKED_OUT','2026-10-14 08:33:14','2026-10-14 08:33:20'),(40,22,'CHECKED_OUT','2026-10-14 08:33:58','2026-10-14 08:34:04'),(41,22,'CHECKED_OUT','2026-10-14 08:46:48','2026-10-14 08:47:02'),(42,22,'CHECKED_OUT','2026-10-14 08:47:21','2026-10-14 08:47:28'),(43,23,'CHECKED_OUT','2026-10-14 15:28:23','2026-10-14 15:28:28'),(44,23,'CHECKED_OUT','2026-10-14 15:28:54','2026-10-14 15:30:33'),(45,23,'CHECKED_OUT','2026-10-14 15:30:50','2026-10-14 15:30:56'),(46,23,'CHECKED_OUT','2026-10-14 15:38:39','2026-10-14 15:38:49'),(47,23,'CHECKED_OUT','2026-10-14 15:39:07','2026-10-14 15:39:12'),(48,23,'CHECKED_OUT','2026-10-14 15:39:50','2026-10-14 15:39:56'),(49,23,'CHECKED_OUT','2026-10-14 15:44:03','2026-10-14 15:44:08'),(50,23,'CHECKED_OUT','2026-10-14 15:44:19','2026-10-14 15:44:26'),(51,23,'CHECKED_OUT','2026-10-14 15:44:55','2026-10-14 15:45:03'),(52,23,'CHECKED_OUT','2026-10-14 15:45:50','2026-10-14 15:45:56'),(53,23,'CHECKED_OUT','2026-10-14 15:54:55','2026-10-14 15:55:02'),(54,23,'CHECKED_OUT','2026-10-14 15:55:11','2026-10-14 15:55:21'),(55,23,'CHECKED_OUT','2026-10-14 16:00:10','2026-10-14 16:00:15'),(56,23,'CHECKED_OUT','2026-10-14 16:00:24','2026-10-14 16:00:35'),(57,23,'CHECKED_OUT','2026-10-15 00:17:53','2026-10-15 00:18:07'),(58,23,'CHECKED_OUT','2026-10-15 00:18:25','2026-10-15 00:18:29'),(59,23,'CHECKED_OUT','2026-10-15 01:02:11','2026-10-15 01:02:16'),(60,23,'CHECKED_OUT','2026-10-15 01:02:36','2026-10-15 01:02:44'),(61,23,'CHECKED_OUT','2026-10-15 10:49:29','2026-10-15 10:49:43'),(62,23,'CHECKED_OUT','2026-10-15 10:49:53','2026-10-15 10:50:07'),(63,23,'CHECKED_OUT','2026-10-16 06:26:56','2026-10-16 06:27:28'),(64,23,'CHECKED_OUT','2026-10-16 06:44:09','2026-10-16 06:44:16'),(65,23,'CHECKED_OUT','2026-10-16 06:44:30','2026-10-16 06:44:34'),(66,23,'CHECKED_OUT','2026-10-16 06:45:06','2026-10-16 06:45:12'),(67,23,'CHECKED_OUT','2026-10-16 06:56:18','2026-10-16 06:56:25'),(68,18,'CHECKED_OUT','2026-10-16 17:42:49','2026-10-16 17:42:54'),(69,18,'CHECKED_OUT','2026-10-16 17:43:19','2026-10-16 17:43:23'),(70,18,'CHECKED_OUT','2026-10-16 17:47:57','2026-10-16 17:48:17');
/*!40000 ALTER TABLE `carts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `categories`
--

DROP TABLE IF EXISTS `categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categories` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `images` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categories`
--

LOCK TABLES `categories` WRITE;
/*!40000 ALTER TABLE `categories` DISABLE KEYS */;
INSERT INTO `categories` VALUES (1,'Lập Trình','lap-trinh','/uploads/categories/e6378ee2-eb18-42d7-99b9-eecb5073205a.webp',1,'2026-09-12 17:31:05','2026-09-12 17:31:39'),(2,'THPT','thpt','/uploads/categories/36aa1e40-8f80-441d-bec8-e73a653bcf2c.png',1,'2026-09-12 17:33:45','2026-09-12 17:33:45'),(3,'Thiết Kế','thiet-ke','/uploads/categories/29e01a82-1f43-4571-b1c3-403f79bb6e3c.jpg',1,'2026-09-12 17:34:17','2026-09-12 17:34:17'),(4,'Lập Trình Game','lap-trinh-game','/uploads/categories/45ac5acc-f193-4d1a-91e6-08b3b8104df9.webp',1,'2026-09-12 17:34:51','2026-09-12 17:34:51');
/*!40000 ALTER TABLE `categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `certificates`
--

DROP TABLE IF EXISTS `certificates`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `certificates` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `enrollment_id` bigint NOT NULL,
  `certificate_code` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `media_id` bigint DEFAULT NULL,
  `issued_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `course_title` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `grade` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `instructor_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `learner_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `watch_percent` decimal(5,2) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `enrollment_id` (`enrollment_id`),
  UNIQUE KEY `certificate_code` (`certificate_code`),
  KEY `fk_cert_media` (`media_id`),
  CONSTRAINT `fk_cert_enrollment` FOREIGN KEY (`enrollment_id`) REFERENCES `enrollments` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_cert_media` FOREIGN KEY (`media_id`) REFERENCES `media_assets` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `certificates`
--

LOCK TABLES `certificates` WRITE;
/*!40000 ALTER TABLE `certificates` DISABLE KEYS */;
/*!40000 ALTER TABLE `certificates` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `comments`
--

DROP TABLE IF EXISTS `comments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `comments` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `course_id` bigint DEFAULT NULL,
  `lesson_id` bigint DEFAULT NULL,
  `parent_id` bigint DEFAULT NULL,
  `content` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PUBLISHED',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_comments_user` (`user_id`),
  KEY `fk_comments_course` (`course_id`),
  KEY `fk_comments_lesson` (`lesson_id`),
  KEY `fk_comments_parent` (`parent_id`),
  CONSTRAINT `fk_comments_course` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_comments_lesson` FOREIGN KEY (`lesson_id`) REFERENCES `lessons` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_comments_parent` FOREIGN KEY (`parent_id`) REFERENCES `comments` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_comments_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `comments_chk_1` CHECK ((`status` in (_utf8mb4'PUBLISHED',_utf8mb4'HIDDEN',_utf8mb4'DELETED')))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `comments`
--

LOCK TABLES `comments` WRITE;
/*!40000 ALTER TABLE `comments` DISABLE KEYS */;
/*!40000 ALTER TABLE `comments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `coupon_courses`
--

DROP TABLE IF EXISTS `coupon_courses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `coupon_courses` (
  `coupon_id` bigint NOT NULL,
  `course_id` bigint NOT NULL,
  PRIMARY KEY (`coupon_id`,`course_id`),
  KEY `fk_cc_course` (`course_id`),
  CONSTRAINT `fk_cc_coupon` FOREIGN KEY (`coupon_id`) REFERENCES `coupons` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_cc_course` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `coupon_courses`
--

LOCK TABLES `coupon_courses` WRITE;
/*!40000 ALTER TABLE `coupon_courses` DISABLE KEYS */;
/*!40000 ALTER TABLE `coupon_courses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `coupon_usages`
--

DROP TABLE IF EXISTS `coupon_usages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `coupon_usages` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `coupon_id` bigint NOT NULL,
  `user_id` bigint NOT NULL,
  `order_id` bigint NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `coupon_id` (`coupon_id`,`order_id`),
  KEY `fk_cu_user` (`user_id`),
  KEY `fk_cu_order` (`order_id`),
  CONSTRAINT `fk_cu_coupon` FOREIGN KEY (`coupon_id`) REFERENCES `coupons` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_cu_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_cu_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `coupon_usages`
--

LOCK TABLES `coupon_usages` WRITE;
/*!40000 ALTER TABLE `coupon_usages` DISABLE KEYS */;
INSERT INTO `coupon_usages` VALUES (1,1,19,33,'2026-10-14 06:45:54'),(2,1,21,34,'2026-10-14 07:39:47'),(3,1,18,71,'2026-10-16 17:48:17');
/*!40000 ALTER TABLE `coupon_usages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `coupons`
--

DROP TABLE IF EXISTS `coupons`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `coupons` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `code` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `discount_type` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `discount_value` decimal(12,2) NOT NULL,
  `min_order_amount` decimal(12,2) NOT NULL DEFAULT '0.00',
  `max_uses` int NOT NULL DEFAULT '0',
  `used_count` int NOT NULL DEFAULT '0',
  `starts_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `status` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ACTIVE',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`),
  CONSTRAINT `coupons_chk_1` CHECK ((`discount_type` in (_utf8mb4'PERCENT',_utf8mb4'FIXED'))),
  CONSTRAINT `coupons_chk_2` CHECK ((`discount_value` > 0)),
  CONSTRAINT `coupons_chk_3` CHECK ((`status` in (_utf8mb4'ACTIVE',_utf8mb4'INACTIVE',_utf8mb4'EXPIRED')))
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `coupons`
--

LOCK TABLES `coupons` WRITE;
/*!40000 ALTER TABLE `coupons` DISABLE KEYS */;
INSERT INTO `coupons` VALUES (1,'LE10202026','PERCENT',20.00,0.00,0,3,'2026-10-13 17:00:00','2026-10-23 16:59:59','ACTIVE','2026-10-14 06:44:54','2026-10-16 17:48:17');
/*!40000 ALTER TABLE `coupons` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `course_faqs`
--

DROP TABLE IF EXISTS `course_faqs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `course_faqs` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `course_id` bigint NOT NULL,
  `question` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `answer` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `sort_order` int NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_faq_course` (`course_id`),
  CONSTRAINT `fk_faq_course` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `course_faqs`
--

LOCK TABLES `course_faqs` WRITE;
/*!40000 ALTER TABLE `course_faqs` DISABLE KEYS */;
/*!40000 ALTER TABLE `course_faqs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `course_instructors`
--

DROP TABLE IF EXISTS `course_instructors`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `course_instructors` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `course_id` bigint NOT NULL,
  `user_id` bigint NOT NULL,
  `role` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'INSTRUCTOR',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `course_id` (`course_id`,`user_id`),
  KEY `fk_course_instructors_user` (`user_id`),
  CONSTRAINT `fk_course_instructors_course` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_course_instructors_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `course_instructors_chk_1` CHECK ((`role` in (_utf8mb4'OWNER',_utf8mb4'INSTRUCTOR',_utf8mb4'ASSISTANT')))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `course_instructors`
--

LOCK TABLES `course_instructors` WRITE;
/*!40000 ALTER TABLE `course_instructors` DISABLE KEYS */;
/*!40000 ALTER TABLE `course_instructors` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `course_notes`
--

DROP TABLE IF EXISTS `course_notes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `course_notes` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `body` text NOT NULL,
  `course_id` bigint NOT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `lesson_id` bigint NOT NULL,
  `timestamp_seconds` int DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `user_id` bigint NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `course_notes`
--

LOCK TABLES `course_notes` WRITE;
/*!40000 ALTER TABLE `course_notes` DISABLE KEYS */;
INSERT INTO `course_notes` VALUES (2,'Hay á',5,'2026-10-15 18:39:37.616347',273,NULL,'2026-10-15 18:39:37.616347',23),(3,'Bài này quá Hay',5,'2026-10-15 18:40:08.942209',277,13,'2026-10-15 18:40:08.942209',23),(4,'Qúa Hay',5,'2026-10-16 13:29:32.267621',278,9,'2026-10-16 13:29:32.267621',23);
/*!40000 ALTER TABLE `course_notes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `course_sections`
--

DROP TABLE IF EXISTS `course_sections`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `course_sections` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `course_id` bigint NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(1000) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `sort_order` int NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_sections_course_order` (`course_id`,`sort_order`),
  CONSTRAINT `fk_sections_course` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=29 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `course_sections`
--

LOCK TABLES `course_sections` WRITE;
/*!40000 ALTER TABLE `course_sections` DISABLE KEYS */;
/*!40000 ALTER TABLE `course_sections` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `course_tags`
--

DROP TABLE IF EXISTS `course_tags`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `course_tags` (
  `course_id` bigint NOT NULL,
  `tag_id` bigint NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`course_id`,`tag_id`),
  KEY `fk_course_tags_tag` (`tag_id`),
  CONSTRAINT `fk_course_tags_course` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_course_tags_tag` FOREIGN KEY (`tag_id`) REFERENCES `tags` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `course_tags`
--

LOCK TABLES `course_tags` WRITE;
/*!40000 ALTER TABLE `course_tags` DISABLE KEYS */;
/*!40000 ALTER TABLE `course_tags` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `courses`
--

DROP TABLE IF EXISTS `courses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `courses` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `instructor_id` bigint NOT NULL,
  `category_id` bigint DEFAULT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `subtitle` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `language` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'vi',
  `level` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'BEGINNER',
  `status` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'DRAFT',
  `price` decimal(12,2) NOT NULL DEFAULT '0.00',
  `compare_at_price` decimal(12,2) DEFAULT NULL,
  `currency` char(3) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'VND',
  `is_free` bit(1) NOT NULL,
  `issues_certificate` bit(1) NOT NULL,
  `duration_seconds` int NOT NULL DEFAULT '0',
  `enrolled_count` int NOT NULL DEFAULT '0',
  `rating_avg` decimal(3,2) NOT NULL DEFAULT '0.00',
  `rating_count` int NOT NULL DEFAULT '0',
  `what_you_will_learn` json DEFAULT NULL,
  `requirements` json DEFAULT NULL,
  `published_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `images` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `preview_video` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`),
  UNIQUE KEY `uk_courses_slug` (`slug`),
  KEY `idx_courses_instructor` (`instructor_id`),
  KEY `idx_courses_category_status` (`category_id`,`status`),
  KEY `idx_courses_public` (`status`,`deleted_at`,`published_at`),
  CONSTRAINT `fk_courses_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_courses_instructor` FOREIGN KEY (`instructor_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `courses_chk_1` CHECK ((`level` in (_utf8mb4'BEGINNER',_utf8mb4'INTERMEDIATE',_utf8mb4'ADVANCED',_utf8mb4'ALL'))),
  CONSTRAINT `courses_chk_2` CHECK ((`status` in (_utf8mb4'DRAFT',_utf8mb4'PENDING_REVIEW',_utf8mb4'PUBLISHED',_utf8mb4'ARCHIVED'))),
  CONSTRAINT `courses_chk_3` CHECK ((`price` >= 0))
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `courses`
--

LOCK TABLES `courses` WRITE;
/*!40000 ALTER TABLE `courses` DISABLE KEYS */;
/*!40000 ALTER TABLE `courses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `enrollments`
--

DROP TABLE IF EXISTS `enrollments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `enrollments` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `course_id` bigint NOT NULL,
  `order_id` bigint DEFAULT NULL,
  `source` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PURCHASE',
  `status` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ACTIVE',
  `progress_percent` decimal(5,2) NOT NULL DEFAULT '0.00',
  `enrolled_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `completed_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`user_id`,`course_id`),
  KEY `idx_enrollments_course` (`course_id`),
  KEY `fk_enroll_order` (`order_id`),
  CONSTRAINT `fk_enroll_course` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_enroll_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_enroll_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `enrollments_chk_1` CHECK ((`source` in (_utf8mb4'PURCHASE',_utf8mb4'FREE',_utf8mb4'ADMIN_GRANT',_utf8mb4'GIFT'))),
  CONSTRAINT `enrollments_chk_2` CHECK ((`status` in (_utf8mb4'ACTIVE',_utf8mb4'COMPLETED',_utf8mb4'EXPIRED',_utf8mb4'REVOKED'))),
  CONSTRAINT `enrollments_chk_3` CHECK (((`progress_percent` >= 0) and (`progress_percent` <= 100)))
) ENGINE=InnoDB AUTO_INCREMENT=35 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `enrollments`
--

LOCK TABLES `enrollments` WRITE;
/*!40000 ALTER TABLE `enrollments` DISABLE KEYS */;
/*!40000 ALTER TABLE `enrollments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `flyway_schema_history`
--

DROP TABLE IF EXISTS `flyway_schema_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `flyway_schema_history` (
  `installed_rank` int NOT NULL,
  `version` varchar(50) DEFAULT NULL,
  `description` varchar(200) NOT NULL,
  `type` varchar(20) NOT NULL,
  `script` varchar(1000) NOT NULL,
  `checksum` int DEFAULT NULL,
  `installed_by` varchar(100) NOT NULL,
  `installed_on` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `execution_time` int NOT NULL,
  `success` tinyint(1) NOT NULL,
  PRIMARY KEY (`installed_rank`),
  KEY `flyway_schema_history_s_idx` (`success`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `flyway_schema_history`
--

LOCK TABLES `flyway_schema_history` WRITE;
/*!40000 ALTER TABLE `flyway_schema_history` DISABLE KEYS */;
INSERT INTO `flyway_schema_history` VALUES (1,'1','init','SQL','V1__schema.sql',1335090721,'root','2026-09-08 03:44:05',1287,1),(2,'2','create banners','SQL','V2__create_banners.sql',-623752506,'root','2026-09-12 02:49:15',432,1),(3,'3','add user role','SQL','V3__add_user_role.sql',2041410524,'root','2026-09-12 10:02:30',431,1),(4,'4','create user catalogues','SQL','V4__create_user_catalogues.sql',-943375611,'root','2026-09-12 10:02:30',432,1),(5,'5','simplify banners','SQL','V5__simplify_banners.sql',-593186357,'root','2026-09-12 15:50:59',92,1),(6,'6','simplify categories','SQL','V6__simplify_categories.sql',487306340,'root','2026-09-12 17:06:31',621,1),(7,'7','fix user catalogue fk','SQL','V7__fix_user_catalogue_fk.sql',2093448103,'root','2026-09-12 17:26:36',305,1),(8,'8','instructor studio','SQL','V8__instructor_studio.sql',1151875697,'root','2026-09-13 17:25:33',353,1),(9,'9','create news and newsblogs','SQL','V9__create_news_and_newsblogs.sql',1428415884,'root','2026-09-15 07:44:45',373,1),(10,'10','expand courses','SQL','V10__expand_courses.sql',-1603120702,'root','2026-09-20 21:47:14',68,1),(11,'1','init','DELETE','V1__schema.sql',1335090721,'root','2026-09-23 19:49:25',0,1),(12,'2','create banners','DELETE','V2__create_banners.sql',-623752506,'root','2026-09-23 19:49:25',0,1),(13,'3','add user role','DELETE','V3__add_user_role.sql',2041410524,'root','2026-09-23 19:49:25',0,1),(14,'4','create user catalogues','DELETE','V4__create_user_catalogues.sql',-943375611,'root','2026-09-23 19:49:25',0,1),(15,'5','simplify banners','DELETE','V5__simplify_banners.sql',-593186357,'root','2026-09-23 19:49:25',0,1),(16,'6','simplify categories','DELETE','V6__simplify_categories.sql',487306340,'root','2026-09-23 19:49:25',0,1),(17,'7','fix user catalogue fk','DELETE','V7__fix_user_catalogue_fk.sql',2093448103,'root','2026-09-23 19:49:25',0,1),(18,'8','instructor studio','DELETE','V8__instructor_studio.sql',1151875697,'root','2026-09-23 19:49:25',0,1),(19,'9','create news and newsblogs','DELETE','V9__create_news_and_newsblogs.sql',1428415884,'root','2026-09-23 19:49:25',0,1),(20,'10','expand courses','DELETE','V10__expand_courses.sql',-1603120702,'root','2026-09-23 19:49:25',0,1);
/*!40000 ALTER TABLE `flyway_schema_history` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `instructor_bank_accounts`
--

DROP TABLE IF EXISTS `instructor_bank_accounts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `instructor_bank_accounts` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `account_name` varchar(128) NOT NULL,
  `account_number` varchar(32) NOT NULL,
  `bank_code` varchar(64) NOT NULL,
  `bank_name` varchar(128) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `user_id` bigint NOT NULL,
  `sepay_account_id` varchar(64) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKbyx1coflv5y5m1ywya60wrfe` (`user_id`),
  CONSTRAINT `FKfxh26jxvultxm2y2eiwihbeql` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `instructor_bank_accounts`
--

LOCK TABLES `instructor_bank_accounts` WRITE;
/*!40000 ALTER TABLE `instructor_bank_accounts` DISABLE KEYS */;
INSERT INTO `instructor_bank_accounts` VALUES (1,'LE VAN HAU','37186488888','TPBank','TPBank','2026-10-14 15:21:43.042963','2026-10-14 15:21:43.042963',21,NULL),(2,'LE VAN HAU','37186488888','TPBank','TPBank','2026-10-14 22:25:29.642042','2026-10-14 22:25:29.642042',23,NULL);
/*!40000 ALTER TABLE `instructor_bank_accounts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `instructor_copy_templates`
--

DROP TABLE IF EXISTS `instructor_copy_templates`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `instructor_copy_templates` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `body` text NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `kind` varchar(32) NOT NULL,
  `title` varchar(255) NOT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `user_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FKa8yx03lseuvhhh7wm5b3hvf6b` (`user_id`),
  CONSTRAINT `FKa8yx03lseuvhhh7wm5b3hvf6b` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `instructor_copy_templates`
--

LOCK TABLES `instructor_copy_templates` WRITE;
/*!40000 ALTER TABLE `instructor_copy_templates` DISABLE KEYS */;
INSERT INTO `instructor_copy_templates` VALUES (1,'Khóa học thực chiến giúp bạn làm được sản phẩm hoàn chỉnh, không chỉ nghe lý thuyết.','2026-10-14 14:57:34.891136','SUBTITLE','Phụ đề hấp dẫn','2026-10-14 14:57:34.891136',21),(2,'Khóa học này dành cho người muốn đi từ nền tảng đến thực hành.\n\nBạn sẽ được hướng dẫn từng bước, làm bài tập sát thực tế và hoàn thiện một sản phẩm có thể mang đi giới thiệu.\n\nNội dung được chia nhỏ theo chủ đề, mỗi bài tập trung một kỹ năng để bạn theo kịp dù đang đi làm.\n\nSau khóa học, bạn tự tin áp dụng ngay vào công việc thay vì chỉ nhớ lý thuyết.','2026-10-14 14:57:34.973841','DESCRIPTION','Mô tả chuẩn','2026-10-14 14:57:34.973841',21),(3,'Xác định mục tiêu và lộ trình học rõ ràng\nThực hành trên bài tập sát tình huống thật\nTự xây dựng được sản phẩm hoàn chỉnh\nBiết cách sửa lỗi và tối ưu sau khi hoàn thành','2026-10-14 14:57:34.978354','LEARN','Bạn sẽ học được gì','2026-10-14 14:57:34.978354',21),(4,'Khóa học thực chiến giúp bạn làm được sản phẩm hoàn chỉnh, không chỉ nghe lý thuyết.','2026-10-14 22:24:06.632241','SUBTITLE','Phụ đề hấp dẫn','2026-10-14 22:24:06.632241',23),(5,'Khóa học này dành cho người muốn đi từ nền tảng đến thực hành.\n\nBạn sẽ được hướng dẫn từng bước, làm bài tập sát thực tế và hoàn thiện một sản phẩm có thể mang đi giới thiệu.\n\nNội dung được chia nhỏ theo chủ đề, mỗi bài tập trung một kỹ năng để bạn theo kịp dù đang đi làm.\n\nSau khóa học, bạn tự tin áp dụng ngay vào công việc thay vì chỉ nhớ lý thuyết.','2026-10-14 22:24:06.635243','DESCRIPTION','Mô tả chuẩn','2026-10-14 22:24:06.635243',23),(6,'Xác định mục tiêu và lộ trình học rõ ràng\nThực hành trên bài tập sát tình huống thật\nTự xây dựng được sản phẩm hoàn chỉnh\nBiết cách sửa lỗi và tối ưu sau khi hoàn thành','2026-10-14 22:24:06.636241','LEARN','Bạn sẽ học được gì','2026-10-14 22:24:06.636241',23);
/*!40000 ALTER TABLE `instructor_copy_templates` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `instructor_onboarding`
--

DROP TABLE IF EXISTS `instructor_onboarding`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `instructor_onboarding` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `teaching_format` varchar(64) NOT NULL,
  `recording_experience` varchar(64) NOT NULL,
  `audience_size` varchar(64) NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_instructor_onboarding_user` (`user_id`),
  CONSTRAINT `fk_instructor_onboarding_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `instructor_onboarding`
--

LOCK TABLES `instructor_onboarding` WRITE;
/*!40000 ALTER TABLE `instructor_onboarding` DISABLE KEYS */;
INSERT INTO `instructor_onboarding` VALUES (1,6,'truc-tiep-chuyen-mon','moi-bat-dau','nhom-nho','2026-09-14 00:32:17','2026-09-14 20:32:44'),(2,21,'truc-tiep-chua-chinh-thuc','moi-bat-dau','nhom-nho','2026-10-14 14:12:30','2026-10-14 14:12:49');
/*!40000 ALTER TABLE `instructor_onboarding` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `instructor_profiles`
--

DROP TABLE IF EXISTS `instructor_profiles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `instructor_profiles` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `headline` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `expertise` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `website_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `payout_provider` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `payout_account` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `total_students` int NOT NULL DEFAULT '0',
  `total_courses` int NOT NULL DEFAULT '0',
  `rating_avg` decimal(3,2) NOT NULL DEFAULT '0.00',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`user_id`),
  CONSTRAINT `fk_instructor_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `instructor_profiles`
--

LOCK TABLES `instructor_profiles` WRITE;
/*!40000 ALTER TABLE `instructor_profiles` DISABLE KEYS */;
/*!40000 ALTER TABLE `instructor_profiles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `instructor_resource_progress`
--

DROP TABLE IF EXISTS `instructor_resource_progress`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `instructor_resource_progress` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `checked` tinyint(1) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `item_key` varchar(64) NOT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `user_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKqve0pxi4s7lgj5bndqrulp934` (`user_id`,`item_key`),
  CONSTRAINT `FKdui2osom7s11qr11ligljr04d` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `instructor_resource_progress`
--

LOCK TABLES `instructor_resource_progress` WRITE;
/*!40000 ALTER TABLE `instructor_resource_progress` DISABLE KEYS */;
/*!40000 ALTER TABLE `instructor_resource_progress` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `instructor_support_tickets`
--

DROP TABLE IF EXISTS `instructor_support_tickets`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `instructor_support_tickets` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `body` text NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `status` varchar(20) NOT NULL,
  `title` varchar(255) NOT NULL,
  `topic` varchar(32) NOT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `user_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK3gflarcspfjxqq909odh92xtu` (`user_id`),
  CONSTRAINT `FK3gflarcspfjxqq909odh92xtu` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `instructor_support_tickets`
--

LOCK TABLES `instructor_support_tickets` WRITE;
/*!40000 ALTER TABLE `instructor_support_tickets` DISABLE KEYS */;
/*!40000 ALTER TABLE `instructor_support_tickets` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `instructor_tool_checks`
--

DROP TABLE IF EXISTS `instructor_tool_checks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `instructor_tool_checks` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `checked` tinyint(1) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `item_key` varchar(64) NOT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `user_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKodj542upegkg7h09ajyktsweo` (`user_id`,`item_key`),
  CONSTRAINT `FK4lxl6i1s568hkku0m5c8ve6kp` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `instructor_tool_checks`
--

LOCK TABLES `instructor_tool_checks` WRITE;
/*!40000 ALTER TABLE `instructor_tool_checks` DISABLE KEYS */;
INSERT INTO `instructor_tool_checks` VALUES (1,1,'2026-10-14 14:58:07.596826','lighting','2026-10-14 14:58:07.596826',21),(2,1,'2026-10-14 14:58:10.319315','noise','2026-10-14 14:58:10.319315',21);
/*!40000 ALTER TABLE `instructor_tool_checks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `lesson_progress`
--

DROP TABLE IF EXISTS `lesson_progress`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `lesson_progress` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `enrollment_id` bigint NOT NULL,
  `lesson_id` bigint NOT NULL,
  `status` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'NOT_STARTED',
  `last_position_seconds` int NOT NULL DEFAULT '0',
  `completed_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `enrollment_id` (`enrollment_id`,`lesson_id`),
  KEY `fk_lp_lesson` (`lesson_id`),
  CONSTRAINT `fk_lp_enrollment` FOREIGN KEY (`enrollment_id`) REFERENCES `enrollments` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_lp_lesson` FOREIGN KEY (`lesson_id`) REFERENCES `lessons` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `lesson_progress_chk_1` CHECK ((`status` in (_utf8mb4'NOT_STARTED',_utf8mb4'IN_PROGRESS',_utf8mb4'COMPLETED')))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `lesson_progress`
--

LOCK TABLES `lesson_progress` WRITE;
/*!40000 ALTER TABLE `lesson_progress` DISABLE KEYS */;
/*!40000 ALTER TABLE `lesson_progress` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `lesson_resources`
--

DROP TABLE IF EXISTS `lesson_resources`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `lesson_resources` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `lesson_id` bigint NOT NULL,
  `media_id` bigint DEFAULT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `resource_url` varchar(1000) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_lr_lesson` (`lesson_id`),
  KEY `fk_lr_media` (`media_id`),
  CONSTRAINT `fk_lr_lesson` FOREIGN KEY (`lesson_id`) REFERENCES `lessons` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_lr_media` FOREIGN KEY (`media_id`) REFERENCES `media_assets` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `lesson_resources`
--

LOCK TABLES `lesson_resources` WRITE;
/*!40000 ALTER TABLE `lesson_resources` DISABLE KEYS */;
/*!40000 ALTER TABLE `lesson_resources` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `lessons`
--

DROP TABLE IF EXISTS `lessons`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `lessons` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `section_id` bigint NOT NULL,
  `media_id` bigint DEFAULT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `lesson_type` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'VIDEO',
  `content` text COLLATE utf8mb4_unicode_ci,
  `duration_seconds` int NOT NULL DEFAULT '0',
  `sort_order` int NOT NULL DEFAULT '0',
  `is_preview` int NOT NULL,
  `is_published` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_lessons_section_order` (`section_id`,`sort_order`),
  KEY `fk_lessons_media` (`media_id`),
  CONSTRAINT `fk_lessons_media` FOREIGN KEY (`media_id`) REFERENCES `media_assets` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_lessons_section` FOREIGN KEY (`section_id`) REFERENCES `course_sections` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `lessons_chk_1` CHECK ((`lesson_type` in (_utf8mb4'VIDEO',_utf8mb4'DOCUMENT',_utf8mb4'TEXT',_utf8mb4'QUIZ',_utf8mb4'ASSIGNMENT',_utf8mb4'LIVE')))
) ENGINE=InnoDB AUTO_INCREMENT=403 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `lessons`
--

LOCK TABLES `lessons` WRITE;
/*!40000 ALTER TABLE `lessons` DISABLE KEYS */;
/*!40000 ALTER TABLE `lessons` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `live_sessions`
--

DROP TABLE IF EXISTS `live_sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `live_sessions` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `course_id` bigint NOT NULL,
  `instructor_id` bigint NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `provider` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'BUNNY_STREAM',
  `join_url` varchar(1000) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `playback_url` varchar(1000) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `starts_at` timestamp NOT NULL,
  `ends_at` timestamp NULL DEFAULT NULL,
  `status` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'SCHEDULED',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_live_course` (`course_id`),
  KEY `fk_live_instructor` (`instructor_id`),
  CONSTRAINT `fk_live_course` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_live_instructor` FOREIGN KEY (`instructor_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `live_sessions_chk_1` CHECK ((`provider` in (_utf8mb4'BUNNY_STREAM',_utf8mb4'AWS_IVS',_utf8mb4'ZOOM',_utf8mb4'CUSTOM'))),
  CONSTRAINT `live_sessions_chk_2` CHECK ((`status` in (_utf8mb4'SCHEDULED',_utf8mb4'LIVE',_utf8mb4'ENDED',_utf8mb4'CANCELLED')))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `live_sessions`
--

LOCK TABLES `live_sessions` WRITE;
/*!40000 ALTER TABLE `live_sessions` DISABLE KEYS */;
/*!40000 ALTER TABLE `live_sessions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `media_assets`
--

DROP TABLE IF EXISTS `media_assets`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `media_assets` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `uploaded_by` bigint DEFAULT NULL,
  `provider` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `asset_type` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `original_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `mime_type` varchar(120) COLLATE utf8mb4_unicode_ci NOT NULL,
  `size_bytes` bigint NOT NULL DEFAULT '0',
  `checksum_sha256` char(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `bucket_or_library` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `region` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `storage_key` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `external_id` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `public_url` varchar(1000) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `cdn_url` varchar(1000) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `thumbnail_url` varchar(1000) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `hls_url` varchar(1000) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `encoding_status` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'READY',
  `duration_seconds` int DEFAULT NULL,
  `width` int DEFAULT NULL,
  `height` int DEFAULT NULL,
  `metadata` json DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_media_uploaded_by` (`uploaded_by`),
  KEY `idx_media_provider_external` (`provider`,`external_id`),
  CONSTRAINT `fk_media_uploaded_by` FOREIGN KEY (`uploaded_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `media_assets_chk_1` CHECK ((`provider` in (_utf8mb4'BUNNY_CDN',_utf8mb4'BUNNY_STREAM',_utf8mb4'AWS_S3',_utf8mb4'AWS_CLOUDFRONT',_utf8mb4'FIREBASE_STORAGE',_utf8mb4'LOCAL'))),
  CONSTRAINT `media_assets_chk_2` CHECK ((`asset_type` in (_utf8mb4'IMAGE',_utf8mb4'VIDEO',_utf8mb4'DOCUMENT',_utf8mb4'AUDIO',_utf8mb4'OTHER'))),
  CONSTRAINT `media_assets_chk_3` CHECK ((`encoding_status` in (_utf8mb4'PENDING',_utf8mb4'PROCESSING',_utf8mb4'READY',_utf8mb4'FAILED')))
) ENGINE=InnoDB AUTO_INCREMENT=392 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `media_assets`
--

LOCK TABLES `media_assets` WRITE;
/*!40000 ALTER TABLE `media_assets` DISABLE KEYS */;
INSERT INTO `media_assets` VALUES (174,6,'LOCAL','VIDEO','1 GenAI Revolution in Mobile Apps.mp4','video/mp4',63799445,NULL,NULL,NULL,'/api/media/videos/n0/09c3193f-875e-456f-ba30-8d0768eaa232.mp4',NULL,'/api/media/videos/n0/09c3193f-875e-456f-ba30-8d0768eaa232.mp4',NULL,NULL,NULL,'READY',231,NULL,NULL,NULL,'2026-09-22 07:24:59','2026-09-22 07:24:59'),(175,6,'LOCAL','VIDEO','2 What is Flutter.mp4','video/mp4',16795299,NULL,NULL,NULL,'/api/media/videos/n0/74e124bc-1656-4c00-9e19-2090ba2477c8.mp4',NULL,'/api/media/videos/n0/74e124bc-1656-4c00-9e19-2090ba2477c8.mp4',NULL,NULL,NULL,'READY',92,NULL,NULL,NULL,'2026-09-22 07:24:59','2026-09-22 07:24:59'),(176,6,'LOCAL','VIDEO','3 Installing the Flutter SDK Step-by-Step Guide.mp4','video/mp4',87898868,NULL,NULL,NULL,'/api/media/videos/n0/9d838193-631b-4993-bcca-be483c2b1187.mp4',NULL,'/api/media/videos/n0/9d838193-631b-4993-bcca-be483c2b1187.mp4',NULL,NULL,NULL,'READY',404,NULL,NULL,NULL,'2026-09-22 07:25:01','2026-09-22 07:25:01'),(177,6,'LOCAL','VIDEO','4 Android Studio Installation Guide for Flutter Developers.mp4','video/mp4',57132716,NULL,NULL,NULL,'/api/media/videos/n0/0c980f16-6dd0-4766-ba02-e44a0e78a32d.mp4',NULL,'/api/media/videos/n0/0c980f16-6dd0-4766-ba02-e44a0e78a32d.mp4',NULL,NULL,NULL,'READY',199,NULL,NULL,NULL,'2026-09-22 07:25:02','2026-09-22 07:25:02'),(178,6,'LOCAL','VIDEO','5 Setting Up Xcode for Building iOS Apps with Flutter.mp4','video/mp4',55263575,NULL,NULL,NULL,'/api/media/videos/n0/d5f2fa6a-a0f8-4dbf-8b7b-cb147e0f83b1.mp4',NULL,'/api/media/videos/n0/d5f2fa6a-a0f8-4dbf-8b7b-cb147e0f83b1.mp4',NULL,NULL,NULL,'READY',176,NULL,NULL,NULL,'2026-09-22 07:25:03','2026-09-22 07:25:03'),(179,6,'LOCAL','VIDEO','6 Flutter Project Setup Running Your App on the iOS Simulator.mp4','video/mp4',50802714,NULL,NULL,NULL,'/api/media/videos/n0/3c725774-00cd-40fc-84ea-a4c3f0a0c26d.mp4',NULL,'/api/media/videos/n0/3c725774-00cd-40fc-84ea-a4c3f0a0c26d.mp4',NULL,NULL,NULL,'READY',202,NULL,NULL,NULL,'2026-09-22 07:25:04','2026-09-22 07:25:04'),(180,6,'LOCAL','VIDEO','7 Setting Up the Android Emulator to Run Flutter Projects.mp4','video/mp4',35686211,NULL,NULL,NULL,'/api/media/videos/n0/15ef93e1-5bd0-40fb-9bf7-dceb09b0c041.mp4',NULL,'/api/media/videos/n0/15ef93e1-5bd0-40fb-9bf7-dceb09b0c041.mp4',NULL,NULL,NULL,'READY',156,NULL,NULL,NULL,'2026-09-22 07:25:05','2026-09-22 07:25:05'),(181,6,'LOCAL','VIDEO','8 Installing Flutter SDK on Windows Step-by-Step Guide.mp4','video/mp4',43938766,NULL,NULL,NULL,'/api/media/videos/n0/28b56afc-2b83-4afb-8ceb-0492a52e87a0.mp4',NULL,'/api/media/videos/n0/28b56afc-2b83-4afb-8ceb-0492a52e87a0.mp4',NULL,NULL,NULL,'READY',320,NULL,NULL,NULL,'2026-09-22 07:25:06','2026-09-22 07:25:06'),(182,6,'LOCAL','VIDEO','9 Setting Up Android Studio for Flutter on Windows.mp4','video/mp4',58167288,NULL,NULL,NULL,'/api/media/videos/n0/b44d50fa-e834-4ec2-9272-60262d5fda0c.mp4',NULL,'/api/media/videos/n0/b44d50fa-e834-4ec2-9272-60262d5fda0c.mp4',NULL,NULL,NULL,'READY',418,NULL,NULL,NULL,'2026-09-22 07:25:08','2026-09-22 07:25:08'),(183,6,'LOCAL','VIDEO','10 Setting Up an Android Emulator (AVD) for Flutter Apps.mp4','video/mp4',19792771,NULL,NULL,NULL,'/api/media/videos/n0/ef02e308-1603-42bc-a4b3-abe9e0efe127.mp4',NULL,'/api/media/videos/n0/ef02e308-1603-42bc-a4b3-abe9e0efe127.mp4',NULL,NULL,NULL,'READY',151,NULL,NULL,NULL,'2026-09-22 07:25:08','2026-09-22 07:25:08'),(184,6,'LOCAL','VIDEO','11 Create a New Flutter Project & Build Chat App UI (Google Gemini).mp4','video/mp4',86204502,NULL,NULL,NULL,'/api/media/videos/n0/7386ef2a-48a5-4555-a6a0-e2d706a254ce.mp4',NULL,'/api/media/videos/n0/7386ef2a-48a5-4555-a6a0-e2d706a254ce.mp4',NULL,NULL,NULL,'READY',640,NULL,NULL,NULL,'2026-09-22 07:25:31','2026-09-22 07:25:31'),(185,6,'LOCAL','VIDEO','12 What is Application Programming Interface.mp4','video/mp4',40903992,NULL,NULL,NULL,'/api/media/videos/n0/2acc81fb-a454-4fe4-a74f-43fafa9d478c.mp4',NULL,'/api/media/videos/n0/2acc81fb-a454-4fe4-a74f-43fafa9d478c.mp4',NULL,NULL,NULL,'READY',140,NULL,NULL,NULL,'2026-09-22 07:25:32','2026-09-22 07:25:32'),(186,6,'LOCAL','VIDEO','13 Components of API.mp4','video/mp4',68197857,NULL,NULL,NULL,'/api/media/videos/n0/39d4e588-aa9e-48f0-a8ec-15509273616c.mp4',NULL,'/api/media/videos/n0/39d4e588-aa9e-48f0-a8ec-15509273616c.mp4',NULL,NULL,NULL,'READY',222,NULL,NULL,NULL,'2026-09-22 07:25:34','2026-09-22 07:25:34'),(187,6,'LOCAL','VIDEO','14 Exploring Google AI Studio for Gemini API Integration.mp4','video/mp4',33128717,NULL,NULL,NULL,'/api/media/videos/n0/60c5b597-78e1-4361-b506-436c17cb1648.mp4',NULL,'/api/media/videos/n0/60c5b597-78e1-4361-b506-436c17cb1648.mp4',NULL,NULL,NULL,'READY',307,NULL,NULL,NULL,'2026-09-22 07:25:35','2026-09-22 07:25:35'),(188,6,'LOCAL','VIDEO','15 Making Gemini API Calls in Flutter Send Input & Get Output.mp4','video/mp4',96223311,NULL,NULL,NULL,'/api/media/videos/n0/3c702f33-fe4b-42a7-85b2-5a2be8739085.mp4',NULL,'/api/media/videos/n0/3c702f33-fe4b-42a7-85b2-5a2be8739085.mp4',NULL,NULL,NULL,'READY',662,NULL,NULL,NULL,'2026-09-22 07:25:37','2026-09-22 07:25:37'),(189,6,'LOCAL','VIDEO','16 Building Q&A Chatbot in Flutter with Google Gemini.mp4','video/mp4',73361049,NULL,NULL,NULL,'/api/media/videos/n0/9da1fa9b-4138-43c1-8348-8e64c5993a07.mp4',NULL,'/api/media/videos/n0/9da1fa9b-4138-43c1-8348-8e64c5993a07.mp4',NULL,NULL,NULL,'READY',510,NULL,NULL,NULL,'2026-09-22 07:25:38','2026-09-22 07:25:38'),(190,6,'LOCAL','VIDEO','17 GUI & Logic Improvements in Flutter.mp4','video/mp4',26510941,NULL,NULL,NULL,'/api/media/videos/n0/89826517-42ef-4cf6-af1f-297db0e821b8.mp4',NULL,'/api/media/videos/n0/89826517-42ef-4cf6-af1f-297db0e821b8.mp4',NULL,NULL,NULL,'READY',176,NULL,NULL,NULL,'2026-09-22 07:25:39','2026-09-22 07:25:39'),(191,6,'LOCAL','VIDEO','18 Using Different Google Gemini Models in Flutter.mp4','video/mp4',21825616,NULL,NULL,NULL,'/api/media/videos/n0/6597501e-49d6-45a8-a46d-3773dab9e4e7.mp4',NULL,'/api/media/videos/n0/6597501e-49d6-45a8-a46d-3773dab9e4e7.mp4',NULL,NULL,NULL,'READY',136,NULL,NULL,NULL,'2026-09-22 07:25:39','2026-09-22 07:25:39'),(192,6,'LOCAL','VIDEO','19 Using Gemini’s Advanced Reasoning (Thinking) Feature in Flutter.mp4','video/mp4',22486323,NULL,NULL,NULL,'/api/media/videos/n0/dce0421e-bcb1-49dd-991c-8464aa42d827.mp4',NULL,'/api/media/videos/n0/dce0421e-bcb1-49dd-991c-8464aa42d827.mp4',NULL,NULL,NULL,'READY',156,NULL,NULL,NULL,'2026-09-22 07:25:40','2026-09-22 07:25:40'),(193,6,'LOCAL','VIDEO','20 Using System Instructions with Google Gemini in Flutter.mp4','video/mp4',26301201,NULL,NULL,NULL,'/api/media/videos/n0/a7505890-5c2a-4d14-8597-352f27494249.mp4',NULL,'/api/media/videos/n0/a7505890-5c2a-4d14-8597-352f27494249.mp4',NULL,NULL,NULL,'READY',191,NULL,NULL,NULL,'2026-09-22 07:25:40','2026-09-22 07:25:40'),(194,6,'LOCAL','VIDEO','21 Updating AppBar and Send Bar in Flutter Chat App.mp4','video/mp4',54012895,NULL,NULL,NULL,'/api/media/videos/n0/8098bad6-0d82-49c0-a88a-6c1c4895a8cf.mp4',NULL,'/api/media/videos/n0/8098bad6-0d82-49c0-a88a-6c1c4895a8cf.mp4',NULL,NULL,NULL,'READY',289,NULL,NULL,NULL,'2026-09-22 07:27:07','2026-09-22 07:27:07'),(195,6,'LOCAL','VIDEO','22 Adding DashChat and Displaying Messages in Flutter Chat App.mp4','video/mp4',83529264,NULL,NULL,NULL,'/api/media/videos/n0/8ce5e6a8-657c-46fa-873e-52bc913257b8.mp4',NULL,'/api/media/videos/n0/8ce5e6a8-657c-46fa-873e-52bc913257b8.mp4',NULL,NULL,NULL,'READY',520,NULL,NULL,NULL,'2026-09-22 07:27:09','2026-09-22 07:27:09'),(196,6,'LOCAL','VIDEO','23 Displaying Received Messages in Correct Order in Flutter Chat App.mp4','video/mp4',42149433,NULL,NULL,NULL,'/api/media/videos/n0/add20f70-30dd-4655-9fa7-fd0ac2254213.mp4',NULL,'/api/media/videos/n0/add20f70-30dd-4655-9fa7-fd0ac2254213.mp4',NULL,NULL,NULL,'READY',259,NULL,NULL,NULL,'2026-09-22 07:27:10','2026-09-22 07:27:10'),(197,6,'LOCAL','VIDEO','24 Introduction to Chat Feature in Flutter with Google Gemini.mp4','video/mp4',13877889,NULL,NULL,NULL,'/api/media/videos/n0/c479383e-bf9e-418c-b901-24a0a7a9e767.mp4',NULL,'/api/media/videos/n0/c479383e-bf9e-418c-b901-24a0a7a9e767.mp4',NULL,NULL,NULL,'READY',76,NULL,NULL,NULL,'2026-09-22 07:27:11','2026-09-22 07:27:11'),(198,6,'LOCAL','VIDEO','25 Adding Chat Feature in Flutter App with Google Gemini.mp4','video/mp4',71405949,NULL,NULL,NULL,'/api/media/videos/n0/c6087c8b-1927-4380-a7d5-9acc9eb42a69.mp4',NULL,'/api/media/videos/n0/c6087c8b-1927-4380-a7d5-9acc9eb42a69.mp4',NULL,NULL,NULL,'READY',419,NULL,NULL,NULL,'2026-09-22 07:27:13','2026-09-22 07:27:13'),(199,6,'LOCAL','VIDEO','26 Adding Service Class for Google Gemini Integration in Flutter.mp4','video/mp4',60128016,NULL,NULL,NULL,'/api/media/videos/n0/7b2b1504-00d4-4791-8d37-c0d78fa4e02f.mp4',NULL,'/api/media/videos/n0/7b2b1504-00d4-4791-8d37-c0d78fa4e02f.mp4',NULL,NULL,NULL,'READY',373,NULL,NULL,NULL,'2026-09-22 07:27:14','2026-09-22 07:27:14'),(200,6,'LOCAL','VIDEO','27 Adding Text-to-Speech (TTS) Library in Flutter Chat App.mp4','video/mp4',38978164,NULL,NULL,NULL,'/api/media/videos/n0/e7211250-41f2-4cfc-ba62-140dae649af2.mp4',NULL,'/api/media/videos/n0/e7211250-41f2-4cfc-ba62-140dae649af2.mp4',NULL,NULL,NULL,'READY',245,NULL,NULL,NULL,'2026-09-22 07:27:16','2026-09-22 07:27:16'),(201,6,'LOCAL','VIDEO','28 Using Text-to-Speech (TTS) in Flutter Chat App.mp4','video/mp4',13442632,NULL,NULL,NULL,'/api/media/videos/n0/7af71cfe-bd92-41f1-aa0e-571a880fb61c.mp4',NULL,'/api/media/videos/n0/7af71cfe-bd92-41f1-aa0e-571a880fb61c.mp4',NULL,NULL,NULL,'READY',106,NULL,NULL,NULL,'2026-09-22 07:27:16','2026-09-22 07:27:16'),(202,6,'LOCAL','VIDEO','29 Enable and Disable Text-to-Speech (TTS) in Flutter Chat App.mp4','video/mp4',54663912,NULL,NULL,NULL,'/api/media/videos/n0/af512dbc-890e-4af5-8abb-dde01cef149a.mp4',NULL,'/api/media/videos/n0/af512dbc-890e-4af5-8abb-dde01cef149a.mp4',NULL,NULL,NULL,'READY',391,NULL,NULL,NULL,'2026-09-22 07:27:18','2026-09-22 07:27:18'),(203,6,'LOCAL','VIDEO','30 Adding Multi-Language Support to TTS in Flutter Gemini App.mp4','video/mp4',44535852,NULL,NULL,NULL,'/api/media/videos/n0/60c636be-5927-46e8-a000-5aed2fc3b227.mp4',NULL,'/api/media/videos/n0/60c636be-5927-46e8-a000-5aed2fc3b227.mp4',NULL,NULL,NULL,'READY',293,NULL,NULL,NULL,'2026-09-22 07:27:19','2026-09-22 07:27:19'),(204,6,'LOCAL','VIDEO','31 Customizing Chatbot Voice Different TTS Voices in Flutter Gemini App.mp4','video/mp4',50583715,NULL,NULL,NULL,'/api/media/videos/n0/5b1f3953-6c93-46c7-8af7-af73d4012839.mp4',NULL,'/api/media/videos/n0/5b1f3953-6c93-46c7-8af7-af73d4012839.mp4',NULL,NULL,NULL,'READY',256,NULL,NULL,NULL,'2026-09-22 07:27:37','2026-09-22 07:27:37'),(205,6,'LOCAL','VIDEO','32 Generate Images with Google Gemini in Flutter.mp4','video/mp4',57259252,NULL,NULL,NULL,'/api/media/videos/n0/4c149a66-52b9-4bb8-9692-dc82c9efa6be.mp4',NULL,'/api/media/videos/n0/4c149a66-52b9-4bb8-9692-dc82c9efa6be.mp4',NULL,NULL,NULL,'READY',344,NULL,NULL,NULL,'2026-09-22 07:27:39','2026-09-22 07:27:39'),(206,6,'LOCAL','VIDEO','33 Combine Text & Image Generation in Flutter.mp4','video/mp4',65023964,NULL,NULL,NULL,'/api/media/videos/n0/ad1611d8-2c1a-4754-9760-460a79673205.mp4',NULL,'/api/media/videos/n0/ad1611d8-2c1a-4754-9760-460a79673205.mp4',NULL,NULL,NULL,'READY',411,NULL,NULL,NULL,'2026-09-22 07:27:41','2026-09-22 07:27:41'),(207,6,'LOCAL','VIDEO','34 Displaying Generated Images in Flutter Gemini App.mp4','video/mp4',61603080,NULL,NULL,NULL,'/api/media/videos/n0/97002f4c-f249-4d3e-bde0-c000e3fdd97a.mp4',NULL,'/api/media/videos/n0/97002f4c-f249-4d3e-bde0-c000e3fdd97a.mp4',NULL,NULL,NULL,'READY',408,NULL,NULL,NULL,'2026-09-22 07:27:42','2026-09-22 07:27:42'),(208,6,'LOCAL','VIDEO','35 Image Generation Overview with Google Gemini in Flutter.mp4','video/mp4',20028401,NULL,NULL,NULL,'/api/media/videos/n0/ffa2d13f-7bbb-43e1-be06-a2117a7ded0f.mp4',NULL,'/api/media/videos/n0/ffa2d13f-7bbb-43e1-be06-a2117a7ded0f.mp4',NULL,NULL,NULL,'READY',119,NULL,NULL,NULL,'2026-09-22 07:27:43','2026-09-22 07:27:43'),(209,6,'LOCAL','VIDEO','36 Choosing an Image for Editing in Flutter with Google Gemini.mp4','video/mp4',73873121,NULL,NULL,NULL,'/api/media/videos/n0/410cd432-c5a5-46c8-bce3-35239fbcbc58.mp4',NULL,'/api/media/videos/n0/410cd432-c5a5-46c8-bce3-35239fbcbc58.mp4',NULL,NULL,NULL,'READY',444,NULL,NULL,NULL,'2026-09-22 07:27:45','2026-09-22 07:27:45'),(210,6,'LOCAL','VIDEO','37 Flutter Gemini App Display Selected Images & Improve Workflow.mp4','video/mp4',64784246,NULL,NULL,NULL,'/api/media/videos/n0/dd26e55f-c22b-4015-bb7b-a3d370e0016d.mp4',NULL,'/api/media/videos/n0/dd26e55f-c22b-4015-bb7b-a3d370e0016d.mp4',NULL,NULL,NULL,'READY',427,NULL,NULL,NULL,'2026-09-22 07:27:47','2026-09-22 07:27:47'),(211,6,'LOCAL','VIDEO','38 Exploring Image Editing API Documentation.mp4','video/mp4',26237545,NULL,NULL,NULL,'/api/media/videos/n0/0c8075d7-13c2-4205-9526-09dba6476833.mp4',NULL,'/api/media/videos/n0/0c8075d7-13c2-4205-9526-09dba6476833.mp4',NULL,NULL,NULL,'READY',149,NULL,NULL,NULL,'2026-09-22 07:27:48','2026-09-22 07:27:48'),(212,6,'LOCAL','VIDEO','39 Displaying Edited Images in Flutter by Converting Base64 Output.mp4','video/mp4',47013477,NULL,NULL,NULL,'/api/media/videos/n0/3a592aca-9313-4126-9239-2e2e1935e897.mp4',NULL,'/api/media/videos/n0/3a592aca-9313-4126-9239-2e2e1935e897.mp4',NULL,NULL,NULL,'READY',321,NULL,NULL,NULL,'2026-09-22 07:27:49','2026-09-22 07:27:49'),(213,6,'LOCAL','VIDEO','40 Flutter Gemini App Text, Image & Editing Features.mp4','video/mp4',42631864,NULL,NULL,NULL,'/api/media/videos/n0/0c001e61-e1c0-4d37-b44c-1e7f91c1d91b.mp4',NULL,'/api/media/videos/n0/0c001e61-e1c0-4d37-b44c-1e7f91c1d91b.mp4',NULL,NULL,NULL,'READY',325,NULL,NULL,NULL,'2026-09-22 07:27:50','2026-09-22 07:27:50'),(214,6,'LOCAL','VIDEO','41 Displaying Progress Indicator in Flutter Gemini App.mp4','video/mp4',36133759,NULL,NULL,NULL,'/api/media/videos/n0/ff027704-169d-4c12-9f4a-21f4631fb4a6.mp4',NULL,'/api/media/videos/n0/ff027704-169d-4c12-9f4a-21f4631fb4a6.mp4',NULL,NULL,NULL,'READY',231,NULL,NULL,NULL,'2026-09-22 07:29:15','2026-09-22 07:29:15'),(215,6,'LOCAL','VIDEO','42 Image Understanding in Flutter Apps with Gemini – Demo.mp4','video/mp4',7824503,NULL,NULL,NULL,'/api/media/videos/n0/693f9f40-3cdd-4a45-81e4-afe7548e2d37.mp4',NULL,'/api/media/videos/n0/693f9f40-3cdd-4a45-81e4-afe7548e2d37.mp4',NULL,NULL,NULL,'READY',64,NULL,NULL,NULL,'2026-09-22 07:29:16','2026-09-22 07:29:16'),(216,6,'LOCAL','VIDEO','43 Setting Up GUI for Understanding Feature in Flutter Gemini App.mp4','video/mp4',45983325,NULL,NULL,NULL,'/api/media/videos/n0/fd619ecc-e271-46f0-8eca-e1a646e3a691.mp4',NULL,'/api/media/videos/n0/fd619ecc-e271-46f0-8eca-e1a646e3a691.mp4',NULL,NULL,NULL,'READY',277,NULL,NULL,NULL,'2026-09-22 07:29:17','2026-09-22 07:29:17'),(217,6,'LOCAL','VIDEO','44 Building Image Understanding Workflow in Flutter with Gemini.mp4','video/mp4',73007647,NULL,NULL,NULL,'/api/media/videos/n0/77b28cee-f11e-4e72-9ab5-0f56d275cd14.mp4',NULL,'/api/media/videos/n0/77b28cee-f11e-4e72-9ab5-0f56d275cd14.mp4',NULL,NULL,NULL,'READY',436,NULL,NULL,NULL,'2026-09-22 07:29:19','2026-09-22 07:29:19'),(218,6,'LOCAL','VIDEO','45 Passing Images to Google Gemini in Flutter.mp4','video/mp4',43364951,NULL,NULL,NULL,'/api/media/videos/n0/c4782f07-35ca-4b44-b30e-75f6e1540915.mp4',NULL,'/api/media/videos/n0/c4782f07-35ca-4b44-b30e-75f6e1540915.mp4',NULL,NULL,NULL,'READY',240,NULL,NULL,NULL,'2026-09-22 07:29:20','2026-09-22 07:29:20'),(219,6,'LOCAL','VIDEO','46 Document Understanding in Flutter Apps with Gemini – Demo.mp4','video/mp4',8436129,NULL,NULL,NULL,'/api/media/videos/n0/e464f16f-5000-4ee4-a27c-e6239b861767.mp4',NULL,'/api/media/videos/n0/e464f16f-5000-4ee4-a27c-e6239b861767.mp4',NULL,NULL,NULL,'READY',80,NULL,NULL,NULL,'2026-09-22 07:29:20','2026-09-22 07:29:20'),(220,6,'LOCAL','VIDEO','47 Flutter Gemini App Setup File Picker for selecting documents.mp4','video/mp4',86472082,NULL,NULL,NULL,'/api/media/videos/n0/07d8c821-c1ca-414c-bcd6-8ccbfbac62d0.mp4',NULL,'/api/media/videos/n0/07d8c821-c1ca-414c-bcd6-8ccbfbac62d0.mp4',NULL,NULL,NULL,'READY',514,NULL,NULL,NULL,'2026-09-22 07:29:23','2026-09-22 07:29:23'),(221,6,'LOCAL','VIDEO','48 Using Google Gemini for Document Understanding in Flutter Apps.mp4','video/mp4',45453544,NULL,NULL,NULL,'/api/media/videos/n0/885f9cf1-4215-4383-aee6-df7e1acce33d.mp4',NULL,'/api/media/videos/n0/885f9cf1-4215-4383-aee6-df7e1acce33d.mp4',NULL,NULL,NULL,'READY',287,NULL,NULL,NULL,'2026-09-22 07:29:24','2026-09-22 07:29:24'),(222,6,'LOCAL','VIDEO','49 Audio Understanding in Flutter Apps with Gemini – Demo.mp4','video/mp4',7594946,NULL,NULL,NULL,'/api/media/videos/n0/e13a3b20-223b-432f-b28b-9c2d826b25f3.mp4',NULL,'/api/media/videos/n0/e13a3b20-223b-432f-b28b-9c2d826b25f3.mp4',NULL,NULL,NULL,'READY',73,NULL,NULL,NULL,'2026-09-22 07:29:24','2026-09-22 07:29:24'),(223,6,'LOCAL','VIDEO','50 Setting Up Audio Understanding in Flutter with Google Gemini.mp4','video/mp4',29471597,NULL,NULL,NULL,'/api/media/videos/n0/5cf9a4c3-6bd8-428a-9a62-06d7625d7450.mp4',NULL,'/api/media/videos/n0/5cf9a4c3-6bd8-428a-9a62-06d7625d7450.mp4',NULL,NULL,NULL,'READY',188,NULL,NULL,NULL,'2026-09-22 07:29:25','2026-09-22 07:29:25'),(224,6,'LOCAL','VIDEO','51 Implement Audio Transcription & Understanding in Flutter.mp4','video/mp4',60514572,NULL,NULL,NULL,'/api/media/videos/n0/62e2e201-20d6-41da-bafc-c12beffcac2c.mp4',NULL,'/api/media/videos/n0/62e2e201-20d6-41da-bafc-c12beffcac2c.mp4',NULL,NULL,NULL,'READY',349,NULL,NULL,NULL,'2026-09-22 07:29:27','2026-09-22 07:29:27'),(225,6,'LOCAL','VIDEO','52 Working with Gemini Audio API in Flutter Apps.mp4','video/mp4',37827990,NULL,NULL,NULL,'/api/media/videos/n0/97701d0d-3112-4540-8f86-45ea17f85fe1.mp4',NULL,'/api/media/videos/n0/97701d0d-3112-4540-8f86-45ea17f85fe1.mp4',NULL,NULL,NULL,'READY',205,NULL,NULL,NULL,'2026-09-22 07:29:28','2026-09-22 07:29:28'),(226,6,'LOCAL','VIDEO','53 Video Understanding in Flutter Apps with Gemini – Demo.mp4','video/mp4',8066617,NULL,NULL,NULL,'/api/media/videos/n0/eba43382-cc17-4d4a-9589-af6ad563eaa5.mp4',NULL,'/api/media/videos/n0/eba43382-cc17-4d4a-9589-af6ad563eaa5.mp4',NULL,NULL,NULL,'READY',72,NULL,NULL,NULL,'2026-09-22 07:29:29','2026-09-22 07:29:29'),(227,6,'LOCAL','VIDEO','54 Selecting and Displaying Videos in Flutter.mp4','video/mp4',31310757,NULL,NULL,NULL,'/api/media/videos/n0/c05b3123-d5eb-4118-aab8-dce3c54d09ed.mp4',NULL,'/api/media/videos/n0/c05b3123-d5eb-4118-aab8-dce3c54d09ed.mp4',NULL,NULL,NULL,'READY',180,NULL,NULL,NULL,'2026-09-22 07:29:29','2026-09-22 07:29:29'),(228,6,'LOCAL','VIDEO','55 Implementing Video Understanding in Flutter with Google Gemini.mp4','video/mp4',54469051,NULL,NULL,NULL,'/api/media/videos/n0/7752e94b-7ad9-460c-8925-41a0a62bd15c.mp4',NULL,'/api/media/videos/n0/7752e94b-7ad9-460c-8925-41a0a62bd15c.mp4',NULL,NULL,NULL,'READY',293,NULL,NULL,NULL,'2026-09-22 07:29:31','2026-09-22 07:29:31'),(229,6,'LOCAL','VIDEO','001 Tổng quan về Spring Framework.mp4','video/mp4',235831187,NULL,NULL,NULL,'/api/media/videos/n0/e1a563a1-9582-4c9d-8bb4-c70308777642.mp4',NULL,'/api/media/videos/n0/e1a563a1-9582-4c9d-8bb4-c70308777642.mp4',NULL,NULL,NULL,'READY',1196,NULL,NULL,NULL,'2026-10-13 18:50:10','2026-10-13 18:50:10'),(230,6,'LOCAL','VIDEO','002 Spring Boot.mp4','video/mp4',55566533,NULL,NULL,NULL,'/api/media/videos/n0/0354458c-6b80-413d-8c90-52ddcc07eae8.mp4',NULL,'/api/media/videos/n0/0354458c-6b80-413d-8c90-52ddcc07eae8.mp4',NULL,NULL,NULL,'READY',483,NULL,NULL,NULL,'2026-10-13 18:50:11','2026-10-13 18:50:11'),(231,6,'LOCAL','VIDEO','003 Cài đặt JDK.mp4','video/mp4',19011754,NULL,NULL,NULL,'/api/media/videos/n0/6454d99a-8924-4588-85f6-b2819024efc2.mp4',NULL,'/api/media/videos/n0/6454d99a-8924-4588-85f6-b2819024efc2.mp4',NULL,NULL,NULL,'READY',199,NULL,NULL,NULL,'2026-10-13 18:50:11','2026-10-13 18:50:11'),(232,6,'LOCAL','VIDEO','004 Cài đặt Spring Tool 4 for Visual Studio Code.mp4','video/mp4',152696867,NULL,NULL,NULL,'/api/media/videos/n0/8b2411d8-93fb-4237-a53d-1e4cbcbf3d9e.mp4',NULL,'/api/media/videos/n0/8b2411d8-93fb-4237-a53d-1e4cbcbf3d9e.mp4',NULL,NULL,NULL,'READY',647,NULL,NULL,NULL,'2026-10-13 18:50:14','2026-10-13 18:50:14'),(233,6,'LOCAL','VIDEO','005 Tạo dự án bằng Spring Initializr và mở trong Visual Studio Code.mp4','video/mp4',60640702,NULL,NULL,NULL,'/api/media/videos/n0/4fd8c3d3-50d6-45f1-86c2-ac3f86af3f30.mp4',NULL,'/api/media/videos/n0/4fd8c3d3-50d6-45f1-86c2-ac3f86af3f30.mp4',NULL,NULL,NULL,'READY',393,NULL,NULL,NULL,'2026-10-13 18:50:15','2026-10-13 18:50:15'),(234,6,'LOCAL','VIDEO','006 Tạo dự án Spring Boot trong Visual Studio Code.mp4','video/mp4',43131455,NULL,NULL,NULL,'/api/media/videos/n0/59dc3954-ce97-4a85-9f10-045066ec04af.mp4',NULL,'/api/media/videos/n0/59dc3954-ce97-4a85-9f10-045066ec04af.mp4',NULL,NULL,NULL,'READY',273,NULL,NULL,NULL,'2026-10-13 18:50:16','2026-10-13 18:50:16'),(235,6,'LOCAL','VIDEO','007 Tích hợp Github Copilot với Visual Studio Code.mp4','video/mp4',63704803,NULL,NULL,NULL,'/api/media/videos/n0/7992c4f9-968b-4dcc-9886-05a2d46aefa1.mp4',NULL,'/api/media/videos/n0/7992c4f9-968b-4dcc-9886-05a2d46aefa1.mp4',NULL,NULL,NULL,'READY',727,NULL,NULL,NULL,'2026-10-13 18:50:17','2026-10-13 18:50:17'),(236,6,'LOCAL','VIDEO','001 Dự án Lombok.mp4','video/mp4',37766831,NULL,NULL,NULL,'/api/media/videos/n0/a8ab3d48-adb6-4b1e-9c79-01f060d2127f.mp4',NULL,'/api/media/videos/n0/a8ab3d48-adb6-4b1e-9c79-01f060d2127f.mp4',NULL,NULL,NULL,'READY',264,NULL,NULL,NULL,'2026-10-13 18:51:31','2026-10-13 18:51:31'),(237,6,'LOCAL','VIDEO','002 Tạo Getters và Setters.mp4','video/mp4',46129314,NULL,NULL,NULL,'/api/media/videos/n0/22e79afe-b899-4953-8478-39a03b77a150.mp4',NULL,'/api/media/videos/n0/22e79afe-b899-4953-8478-39a03b77a150.mp4',NULL,NULL,NULL,'READY',280,NULL,NULL,NULL,'2026-10-13 18:51:32','2026-10-13 18:51:32'),(238,6,'LOCAL','VIDEO','003 Tạo hàm tạo (Constructors).mp4','video/mp4',41368552,NULL,NULL,NULL,'/api/media/videos/n0/737de7b3-5586-4a60-9f5e-c7d81dff96ea.mp4',NULL,'/api/media/videos/n0/737de7b3-5586-4a60-9f5e-c7d81dff96ea.mp4',NULL,NULL,NULL,'READY',227,NULL,NULL,NULL,'2026-10-13 18:51:33','2026-10-13 18:51:33'),(239,6,'LOCAL','VIDEO','004 Tạo phương thức toString, equals, hashCode.mp4','video/mp4',89477419,NULL,NULL,NULL,'/api/media/videos/n0/2ad905ee-82c9-45ad-be0e-af9f6cce3bcc.mp4',NULL,'/api/media/videos/n0/2ad905ee-82c9-45ad-be0e-af9f6cce3bcc.mp4',NULL,NULL,NULL,'READY',475,NULL,NULL,NULL,'2026-10-13 18:51:35','2026-10-13 18:51:35'),(240,6,'LOCAL','VIDEO','005 Kiểm tra giá trị null.mp4','video/mp4',32408122,NULL,NULL,NULL,'/api/media/videos/n0/1be54066-31cf-4500-a920-8e1f875a25c1.mp4',NULL,'/api/media/videos/n0/1be54066-31cf-4500-a920-8e1f875a25c1.mp4',NULL,NULL,NULL,'READY',239,NULL,NULL,NULL,'2026-10-13 18:51:36','2026-10-13 18:51:36'),(241,6,'LOCAL','VIDEO','006 Lombok Builder.mp4','video/mp4',89222564,NULL,NULL,NULL,'/api/media/videos/n0/6c10099b-0b6c-4e8f-bdc6-343bd6bfb138.mp4',NULL,'/api/media/videos/n0/6c10099b-0b6c-4e8f-bdc6-343bd6bfb138.mp4',NULL,NULL,NULL,'READY',453,NULL,NULL,NULL,'2026-10-13 18:51:38','2026-10-13 18:51:38'),(242,6,'LOCAL','VIDEO','007 Lombok Logging.mp4','video/mp4',219562253,NULL,NULL,NULL,'/api/media/videos/n0/64f4a6c7-fcac-41f3-991c-1d45c48be582.mp4',NULL,'/api/media/videos/n0/64f4a6c7-fcac-41f3-991c-1d45c48be582.mp4',NULL,NULL,NULL,'READY',838,NULL,NULL,NULL,'2026-10-13 18:51:42','2026-10-13 18:51:42'),(243,6,'LOCAL','VIDEO','001 Auto Configuration (Cấu hình tự động).mp4','video/mp4',61818313,NULL,NULL,NULL,'/api/media/videos/n0/399da2bc-7bff-4ae1-9637-96e329d610b2.mp4',NULL,'/api/media/videos/n0/399da2bc-7bff-4ae1-9637-96e329d610b2.mp4',NULL,NULL,NULL,'READY',611,NULL,NULL,NULL,'2026-10-13 18:52:07','2026-10-13 18:52:07'),(244,6,'LOCAL','VIDEO','002 applicationproperties và applicationyml.mp4','video/mp4',88203319,NULL,NULL,NULL,'/api/media/videos/n0/358b08d6-78af-45af-96eb-4af1334bca2b.mp4',NULL,'/api/media/videos/n0/358b08d6-78af-45af-96eb-4af1334bca2b.mp4',NULL,NULL,NULL,'READY',562,NULL,NULL,NULL,'2026-10-13 18:52:08','2026-10-13 18:52:08'),(245,6,'LOCAL','VIDEO','003 Tự tạo Auto Configuration riêng.mp4','video/mp4',109471396,NULL,NULL,NULL,'/api/media/videos/n0/6ef2f187-4f40-4d62-b086-cd1920439503.mp4',NULL,'/api/media/videos/n0/6ef2f187-4f40-4d62-b086-cd1920439503.mp4',NULL,NULL,NULL,'READY',491,NULL,NULL,NULL,'2026-10-13 18:52:10','2026-10-13 18:52:10'),(246,6,'LOCAL','VIDEO','004 Ưu và nhược điểm của Auto Configuration.mp4','video/mp4',3668789,NULL,NULL,NULL,'/api/media/videos/n0/dd290981-c42d-41f2-b872-38de96eb1a06.mp4',NULL,'/api/media/videos/n0/dd290981-c42d-41f2-b872-38de96eb1a06.mp4',NULL,NULL,NULL,'READY',57,NULL,NULL,NULL,'2026-10-13 18:52:11','2026-10-13 18:52:11'),(247,6,'LOCAL','VIDEO','005 Spring Boot Developer Tools (DevTools).mp4','video/mp4',89220500,NULL,NULL,NULL,'/api/media/videos/n0/8ea1c109-16d7-4a6b-8f95-cde2c1fd9d93.mp4',NULL,'/api/media/videos/n0/8ea1c109-16d7-4a6b-8f95-cde2c1fd9d93.mp4',NULL,NULL,NULL,'READY',395,NULL,NULL,NULL,'2026-10-13 18:52:12','2026-10-13 18:52:12'),(248,6,'LOCAL','VIDEO','001 Dependency Injection (DI) trong Spring.mp4','video/mp4',62232769,NULL,NULL,NULL,'/api/media/videos/n0/bf6744cc-913d-43e4-9aa4-080ea33da2e6.mp4',NULL,'/api/media/videos/n0/bf6744cc-913d-43e4-9aa4-080ea33da2e6.mp4',NULL,NULL,NULL,'READY',420,NULL,NULL,NULL,'2026-10-13 18:52:38','2026-10-13 18:52:38'),(249,6,'LOCAL','VIDEO','002 Spring Application Context.mp4','video/mp4',121103064,NULL,NULL,NULL,'/api/media/videos/n0/4c9db9b4-63c0-4680-9547-24944b0d9a03.mp4',NULL,'/api/media/videos/n0/4c9db9b4-63c0-4680-9547-24944b0d9a03.mp4',NULL,NULL,NULL,'READY',708,NULL,NULL,NULL,'2026-10-13 18:52:40','2026-10-13 18:52:40'),(250,6,'LOCAL','VIDEO','003 Tạo Spring Beans và thực hiện DI qua trường (Fields).mp4','video/mp4',161751752,NULL,NULL,NULL,'/api/media/videos/n0/1518872e-cddc-40bd-8388-5e3a05561573.mp4',NULL,'/api/media/videos/n0/1518872e-cddc-40bd-8388-5e3a05561573.mp4',NULL,NULL,NULL,'READY',889,NULL,NULL,NULL,'2026-10-13 18:52:43','2026-10-13 18:52:43'),(251,6,'LOCAL','VIDEO','004 Tạo Spring Beans và thực hiện DI qua hàm tạo.mp4','video/mp4',84678324,NULL,NULL,NULL,'/api/media/videos/n0/466d020a-504f-4d8d-9e62-bf6222cd12f8.mp4',NULL,'/api/media/videos/n0/466d020a-504f-4d8d-9e62-bf6222cd12f8.mp4',NULL,NULL,NULL,'READY',398,NULL,NULL,NULL,'2026-10-13 18:52:45','2026-10-13 18:52:45'),(252,6,'LOCAL','VIDEO','005 Tạo Spring Beans và thực hiện DI qua phương thức Setters.mp4','video/mp4',100927563,NULL,NULL,NULL,'/api/media/videos/n0/bbd25b88-9048-46b7-8b8d-e49991afda3a.mp4',NULL,'/api/media/videos/n0/bbd25b88-9048-46b7-8b8d-e49991afda3a.mp4',NULL,NULL,NULL,'READY',440,NULL,NULL,NULL,'2026-10-13 18:52:47','2026-10-13 18:52:47'),(253,6,'LOCAL','VIDEO','006 Vòng đời của Spring Beans (Spring bean lifecycle).mp4','video/mp4',142134449,NULL,NULL,NULL,'/api/media/videos/n0/7e1a8afa-a298-4812-bc42-d543d390e568.mp4',NULL,'/api/media/videos/n0/7e1a8afa-a298-4812-bc42-d543d390e568.mp4',NULL,NULL,NULL,'READY',655,NULL,NULL,NULL,'2026-10-13 18:52:50','2026-10-13 18:52:50'),(254,6,'LOCAL','VIDEO','007 Lazy initialization.mp4','video/mp4',78743571,NULL,NULL,NULL,'/api/media/videos/n0/22f0a7ea-1a86-4126-86e6-a39ab3d15773.mp4',NULL,'/api/media/videos/n0/22f0a7ea-1a86-4126-86e6-a39ab3d15773.mp4',NULL,NULL,NULL,'READY',448,NULL,NULL,NULL,'2026-10-13 18:52:51','2026-10-13 18:52:51'),(255,6,'LOCAL','VIDEO','001 Cấu hình Spring beans bằng Java.mp4','video/mp4',109681989,NULL,NULL,NULL,'/api/media/videos/n0/5224852a-0792-4844-8a94-b32b14b5f718.mp4',NULL,'/api/media/videos/n0/5224852a-0792-4844-8a94-b32b14b5f718.mp4',NULL,NULL,NULL,'READY',742,NULL,NULL,NULL,'2026-10-13 18:53:16','2026-10-13 18:53:16'),(256,6,'LOCAL','VIDEO','002 Inject (Tiêm) các phụ thuộc beans.mp4','video/mp4',36635219,NULL,NULL,NULL,'/api/media/videos/n0/7ab9d72c-e9e1-405c-9aee-82a2f3cae69a.mp4',NULL,'/api/media/videos/n0/7ab9d72c-e9e1-405c-9aee-82a2f3cae69a.mp4',NULL,NULL,NULL,'READY',322,NULL,NULL,NULL,'2026-10-13 18:53:17','2026-10-13 18:53:17'),(257,6,'LOCAL','VIDEO','003 Annotation @Import.mp4','video/mp4',36002042,NULL,NULL,NULL,'/api/media/videos/n0/3bf2bdba-22c3-4694-8a64-3086d7ece903.mp4',NULL,'/api/media/videos/n0/3bf2bdba-22c3-4694-8a64-3086d7ece903.mp4',NULL,NULL,NULL,'READY',339,NULL,NULL,NULL,'2026-10-13 18:53:18','2026-10-13 18:53:18'),(258,6,'LOCAL','VIDEO','004 Giải quyết xung đột Beans.mp4','video/mp4',62091204,NULL,NULL,NULL,'/api/media/videos/n0/cd30fe0e-4064-46a1-9570-8dc783a1a941.mp4',NULL,'/api/media/videos/n0/cd30fe0e-4064-46a1-9570-8dc783a1a941.mp4',NULL,NULL,NULL,'READY',331,NULL,NULL,NULL,'2026-10-13 18:53:19','2026-10-13 18:53:19'),(259,6,'LOCAL','VIDEO','005 Inject Spring Bean sử dụng @Autowired và @Qualifier.mp4','video/mp4',50901964,NULL,NULL,NULL,'/api/media/videos/n0/e46d4c42-1454-43bf-a328-a900bd51b41e.mp4',NULL,'/api/media/videos/n0/e46d4c42-1454-43bf-a328-a900bd51b41e.mp4',NULL,NULL,NULL,'READY',392,NULL,NULL,NULL,'2026-10-13 18:53:20','2026-10-13 18:53:20'),(260,6,'LOCAL','VIDEO','006 Bean Scopes (Phạm vi của bean).mp4','video/mp4',95917892,NULL,NULL,NULL,'/api/media/videos/n0/a553f57f-c22b-47b0-9edd-54e77a459c12.mp4',NULL,'/api/media/videos/n0/a553f57f-c22b-47b0-9edd-54e77a459c12.mp4',NULL,NULL,NULL,'READY',395,NULL,NULL,NULL,'2026-10-13 18:53:22','2026-10-13 18:53:22'),(261,6,'LOCAL','VIDEO','007 Bean scopes prototype.mp4','video/mp4',34278295,NULL,NULL,NULL,'/api/media/videos/n0/77f40eb7-a499-4b47-925d-fca2aa07d89d.mp4',NULL,'/api/media/videos/n0/77f40eb7-a499-4b47-925d-fca2aa07d89d.mp4',NULL,NULL,NULL,'READY',184,NULL,NULL,NULL,'2026-10-13 18:53:23','2026-10-13 18:53:23'),(262,6,'LOCAL','VIDEO','001 Github Copilot.mp4','video/mp4',152404635,NULL,NULL,NULL,'/api/media/videos/n0/e3dcbaaf-641b-4cdd-9e8e-be3dcf8c28fd.mp4',NULL,'/api/media/videos/n0/e3dcbaaf-641b-4cdd-9e8e-be3dcf8c28fd.mp4',NULL,NULL,NULL,'READY',768,NULL,NULL,NULL,'2026-10-13 18:53:51','2026-10-13 18:53:51'),(263,6,'LOCAL','VIDEO','002 Tạo mã Java bằng Github Copilot.mp4','video/mp4',84585493,NULL,NULL,NULL,'/api/media/videos/n0/2fc29753-1c30-4c1c-97f8-99d0ffaa4ea2.mp4',NULL,'/api/media/videos/n0/2fc29753-1c30-4c1c-97f8-99d0ffaa4ea2.mp4',NULL,NULL,NULL,'READY',574,NULL,NULL,NULL,'2026-10-13 18:53:52','2026-10-13 18:53:52'),(264,6,'LOCAL','VIDEO','003 Tạo mã Java bằng Github Copilot.mp4','video/mp4',42671884,NULL,NULL,NULL,'/api/media/videos/n0/b054e6d9-7d87-498d-8c36-d6e287f34888.mp4',NULL,'/api/media/videos/n0/b054e6d9-7d87-498d-8c36-d6e287f34888.mp4',NULL,NULL,NULL,'READY',416,NULL,NULL,NULL,'2026-10-13 18:53:53','2026-10-13 18:53:53'),(265,6,'LOCAL','VIDEO','004 Giải thích mã.mp4','video/mp4',12426643,NULL,NULL,NULL,'/api/media/videos/n0/4c9d907c-e688-474e-abff-a97f17516cbe.mp4',NULL,'/api/media/videos/n0/4c9d907c-e688-474e-abff-a97f17516cbe.mp4',NULL,NULL,NULL,'READY',107,NULL,NULL,NULL,'2026-10-13 18:53:53','2026-10-13 18:53:53'),(266,6,'LOCAL','VIDEO','005 Debug và Fix lỗi mã.mp4','video/mp4',49937933,NULL,NULL,NULL,'/api/media/videos/n0/05121779-a811-4405-873f-0d39bced70ad.mp4',NULL,'/api/media/videos/n0/05121779-a811-4405-873f-0d39bced70ad.mp4',NULL,NULL,NULL,'READY',265,NULL,NULL,NULL,'2026-10-13 18:53:54','2026-10-13 18:53:54'),(267,6,'LOCAL','VIDEO','006 Review và Refactor.mp4','video/mp4',31174402,NULL,NULL,NULL,'/api/media/videos/n0/5d0394db-ecaa-4850-b041-48de0bb6390d.mp4',NULL,'/api/media/videos/n0/5d0394db-ecaa-4850-b041-48de0bb6390d.mp4',NULL,NULL,NULL,'READY',194,NULL,NULL,NULL,'2026-10-13 18:53:55','2026-10-13 18:53:55'),(268,6,'LOCAL','VIDEO','007 Tạo kiểm thử đơn vị (Unit Tests).mp4','video/mp4',47777886,NULL,NULL,NULL,'/api/media/videos/n0/a50ada9f-165f-47af-8ed3-85990acf1632.mp4',NULL,'/api/media/videos/n0/a50ada9f-165f-47af-8ed3-85990acf1632.mp4',NULL,NULL,NULL,'READY',332,NULL,NULL,NULL,'2026-10-13 18:53:56','2026-10-13 18:53:56'),(269,6,'LOCAL','VIDEO','008 Trợ giúp và tài liệu.mp4','video/mp4',38583619,NULL,NULL,NULL,'/api/media/videos/n0/e4388b49-3108-4a44-9d9d-adc8cd29b92a.mp4',NULL,'/api/media/videos/n0/e4388b49-3108-4a44-9d9d-adc8cd29b92a.mp4',NULL,NULL,NULL,'READY',176,NULL,NULL,NULL,'2026-10-13 18:53:57','2026-10-13 18:53:57'),(270,6,'LOCAL','VIDEO','009 Review và Improve.mp4','video/mp4',12882852,NULL,NULL,NULL,'/api/media/videos/n0/50e03863-b065-4b4e-99e8-448b119c1139.mp4',NULL,'/api/media/videos/n0/50e03863-b065-4b4e-99e8-448b119c1139.mp4',NULL,NULL,NULL,'READY',151,NULL,NULL,NULL,'2026-10-13 18:53:57','2026-10-13 18:53:57'),(271,6,'LOCAL','VIDEO','001 Spring Web MVC.mp4','video/mp4',30648011,NULL,NULL,NULL,'/api/media/videos/n0/a93c8a98-9667-42eb-a3ed-1a1708e0edfa.mp4',NULL,'/api/media/videos/n0/a93c8a98-9667-42eb-a3ed-1a1708e0edfa.mp4',NULL,NULL,NULL,'READY',324,NULL,NULL,NULL,'2026-10-13 18:54:22','2026-10-13 18:54:22'),(272,6,'LOCAL','VIDEO','002 Tạo ứng dụng Web đơn giản bằng Spring Boot trong VSCode.mp4','video/mp4',29065529,NULL,NULL,NULL,'/api/media/videos/n0/990b0612-ed21-4eeb-b2ad-d81914b2ca4d.mp4',NULL,'/api/media/videos/n0/990b0612-ed21-4eeb-b2ad-d81914b2ca4d.mp4',NULL,NULL,NULL,'READY',335,NULL,NULL,NULL,'2026-10-13 18:54:23','2026-10-13 18:54:23'),(273,6,'LOCAL','VIDEO','003 Template Engines.mp4','video/mp4',15523358,NULL,NULL,NULL,'/api/media/videos/n0/faa73366-ceca-4144-825e-22b3a06fd1a2.mp4',NULL,'/api/media/videos/n0/faa73366-ceca-4144-825e-22b3a06fd1a2.mp4',NULL,NULL,NULL,'READY',172,NULL,NULL,NULL,'2026-10-13 18:54:23','2026-10-13 18:54:23'),(274,6,'LOCAL','VIDEO','004 Tạo dự án Spring Boot hỗ trợ Thymeleaf Template Engine.mp4','video/mp4',100255556,NULL,NULL,NULL,'/api/media/videos/n0/02b1b245-8fed-47b6-8317-6ffa0d95cb9a.mp4',NULL,'/api/media/videos/n0/02b1b245-8fed-47b6-8317-6ffa0d95cb9a.mp4',NULL,NULL,NULL,'READY',591,NULL,NULL,NULL,'2026-10-13 18:54:25','2026-10-13 18:54:25'),(275,6,'LOCAL','VIDEO','001 Spring Controller.mp4','video/mp4',70198204,NULL,NULL,NULL,'/api/media/videos/n0/e3a92612-9abf-4c17-893c-c56ff69719bc.mp4',NULL,'/api/media/videos/n0/e3a92612-9abf-4c17-893c-c56ff69719bc.mp4',NULL,NULL,NULL,'READY',764,NULL,NULL,NULL,'2026-10-13 18:54:52','2026-10-13 18:54:52'),(276,6,'LOCAL','VIDEO','002 Request Mapping (Ánh xạ yêu cầu).mp4','video/mp4',103516685,NULL,NULL,NULL,'/api/media/videos/n0/6517e109-382c-4a02-aa29-86cdcf43b891.mp4',NULL,'/api/media/videos/n0/6517e109-382c-4a02-aa29-86cdcf43b891.mp4',NULL,NULL,NULL,'READY',894,NULL,NULL,NULL,'2026-10-13 18:54:54','2026-10-13 18:54:54'),(277,6,'LOCAL','VIDEO','003 Khai báo ánh xạ với nhiều URIs.mp4','video/mp4',33177769,NULL,NULL,NULL,'/api/media/videos/n0/529b4983-aae9-4235-8eef-165d5b4fc089.mp4',NULL,'/api/media/videos/n0/529b4983-aae9-4235-8eef-165d5b4fc089.mp4',NULL,NULL,NULL,'READY',225,NULL,NULL,NULL,'2026-10-13 18:54:54','2026-10-13 18:54:54'),(278,6,'LOCAL','VIDEO','004 @RequestMapping với Dynamic URIs (URI động).mp4','video/mp4',59469467,NULL,NULL,NULL,'/api/media/videos/n0/ca3ee418-08e5-496d-b292-6260f9734b3e.mp4',NULL,'/api/media/videos/n0/ca3ee418-08e5-496d-b292-6260f9734b3e.mp4',NULL,NULL,NULL,'READY',537,NULL,NULL,NULL,'2026-10-13 18:54:56','2026-10-13 18:54:56'),(279,6,'LOCAL','VIDEO','005 URI patterns.mp4','video/mp4',233713453,NULL,NULL,NULL,'/api/media/videos/n0/46baab11-c19f-45ca-9efd-b7762936a4a3.mp4',NULL,'/api/media/videos/n0/46baab11-c19f-45ca-9efd-b7762936a4a3.mp4',NULL,NULL,NULL,'READY',1009,NULL,NULL,NULL,'2026-10-13 18:55:00','2026-10-13 18:55:00'),(280,6,'LOCAL','VIDEO','006 Parameters, headers.mp4','video/mp4',115808246,NULL,NULL,NULL,'/api/media/videos/n0/8b3e9fae-d56e-4ac6-ae53-77f2e755ba11.mp4',NULL,'/api/media/videos/n0/8b3e9fae-d56e-4ac6-ae53-77f2e755ba11.mp4',NULL,NULL,NULL,'READY',686,NULL,NULL,NULL,'2026-10-13 18:55:03','2026-10-13 18:55:03'),(281,6,'LOCAL','VIDEO','007 Xử lý dữ liệu người dùng gởi từ client.mp4','video/mp4',8615728,NULL,NULL,NULL,'/api/media/videos/n0/53230fa5-6b5a-467d-b580-72649778836b.mp4',NULL,'/api/media/videos/n0/53230fa5-6b5a-467d-b580-72649778836b.mp4',NULL,NULL,NULL,'READY',58,NULL,NULL,NULL,'2026-10-13 18:55:03','2026-10-13 18:55:03'),(282,6,'LOCAL','VIDEO','008 @RequestParam.mp4','video/mp4',140330940,NULL,NULL,NULL,'/api/media/videos/n0/9d6bb6f2-53c5-41cf-98a1-9a1800f52fe1.mp4',NULL,'/api/media/videos/n0/9d6bb6f2-53c5-41cf-98a1-9a1800f52fe1.mp4',NULL,NULL,NULL,'READY',695,NULL,NULL,NULL,'2026-10-13 18:55:05','2026-10-13 18:55:05'),(283,6,'LOCAL','VIDEO','009 @PathVariable.mp4','video/mp4',153103617,NULL,NULL,NULL,'/api/media/videos/n0/f44b8610-2e55-4d82-bafc-4347a3a4bdcf.mp4',NULL,'/api/media/videos/n0/f44b8610-2e55-4d82-bafc-4347a3a4bdcf.mp4',NULL,NULL,NULL,'READY',838,NULL,NULL,NULL,'2026-10-13 18:55:09','2026-10-13 18:55:09'),(284,6,'LOCAL','VIDEO','010 @CookieValue.mp4','video/mp4',84343328,NULL,NULL,NULL,'/api/media/videos/n0/0e392473-89bd-4e29-9aec-1b7d62f7ab0b.mp4',NULL,'/api/media/videos/n0/0e392473-89bd-4e29-9aec-1b7d62f7ab0b.mp4',NULL,NULL,NULL,'READY',522,NULL,NULL,NULL,'2026-10-13 18:55:11','2026-10-13 18:55:11'),(285,6,'LOCAL','VIDEO','011 @RequestPart.mp4','video/mp4',89352313,NULL,NULL,NULL,'/api/media/videos/n0/4c02c250-fe29-4617-978e-02b9c5cdc344.mp4',NULL,'/api/media/videos/n0/4c02c250-fe29-4617-978e-02b9c5cdc344.mp4',NULL,NULL,NULL,'READY',498,NULL,NULL,NULL,'2026-10-13 18:55:13','2026-10-13 18:55:13'),(286,6,'LOCAL','VIDEO','012 @RequestHeader.mp4','video/mp4',62976456,NULL,NULL,NULL,'/api/media/videos/n0/213c6e1a-47cd-428e-9173-255c447829c0.mp4',NULL,'/api/media/videos/n0/213c6e1a-47cd-428e-9173-255c447829c0.mp4',NULL,NULL,NULL,'READY',359,NULL,NULL,NULL,'2026-10-13 18:55:14','2026-10-13 18:55:14'),(287,6,'LOCAL','VIDEO','013 Sử dụng JavaBean đọc dữ liệu.mp4','video/mp4',102036844,NULL,NULL,NULL,'/api/media/videos/n0/a67a5985-cfb8-4bd8-ac87-b835b2e1a20e.mp4',NULL,'/api/media/videos/n0/a67a5985-cfb8-4bd8-ac87-b835b2e1a20e.mp4',NULL,NULL,NULL,'READY',634,NULL,NULL,NULL,'2026-10-13 18:55:17','2026-10-13 18:55:17'),(288,6,'LOCAL','VIDEO','014 Chia sẽ dữ liệu và trả lại giá trị.mp4','video/mp4',134917387,NULL,NULL,NULL,'/api/media/videos/n0/7b6ed3a0-3bec-4ef6-b945-15ed009ab52d.mp4',NULL,'/api/media/videos/n0/7b6ed3a0-3bec-4ef6-b945-15ed009ab52d.mp4',NULL,NULL,NULL,'READY',719,NULL,NULL,NULL,'2026-10-13 18:55:20','2026-10-13 18:55:20'),(289,6,'LOCAL','VIDEO','015 Thêm thuộc tính vào model.mp4','video/mp4',115631682,NULL,NULL,NULL,'/api/media/videos/n0/dd8c014c-529f-406e-998a-fd019ec05998.mp4',NULL,'/api/media/videos/n0/dd8c014c-529f-406e-998a-fd019ec05998.mp4',NULL,NULL,NULL,'READY',701,NULL,NULL,NULL,'2026-10-13 18:55:23','2026-10-13 18:55:23'),(290,6,'LOCAL','VIDEO','016 Annotation  @ModelAttribute.mp4','video/mp4',93337252,NULL,NULL,NULL,'/api/media/videos/n0/db70c74c-f14d-4a4a-b41d-999e138fdd16.mp4',NULL,'/api/media/videos/n0/db70c74c-f14d-4a4a-b41d-999e138fdd16.mp4',NULL,NULL,NULL,'READY',538,NULL,NULL,NULL,'2026-10-13 18:55:25','2026-10-13 18:55:25'),(291,6,'LOCAL','VIDEO','017 @SessionAttributes.mp4','video/mp4',52253523,NULL,NULL,NULL,'/api/media/videos/n0/a8048b15-59cd-4dd6-bd65-a351ef7a3503.mp4',NULL,'/api/media/videos/n0/a8048b15-59cd-4dd6-bd65-a351ef7a3503.mp4',NULL,NULL,NULL,'READY',598,NULL,NULL,NULL,'2026-10-13 18:55:27','2026-10-13 18:55:27'),(292,6,'LOCAL','VIDEO','018 @RequestAttribute.mp4','video/mp4',36573269,NULL,NULL,NULL,'/api/media/videos/n0/0cac1013-26fd-442b-99a0-a239f1a91dea.mp4',NULL,'/api/media/videos/n0/0cac1013-26fd-442b-99a0-a239f1a91dea.mp4',NULL,NULL,NULL,'READY',430,NULL,NULL,NULL,'2026-10-13 18:55:29','2026-10-13 18:55:29'),(293,6,'LOCAL','VIDEO','019 Ánh xạ kết quả trả về của phương thức handler.mp4','video/mp4',28022096,NULL,NULL,NULL,'/api/media/videos/n0/dac6759f-f96b-4613-a9ea-aba59b9afe80.mp4',NULL,'/api/media/videos/n0/dac6759f-f96b-4613-a9ea-aba59b9afe80.mp4',NULL,NULL,NULL,'READY',141,NULL,NULL,NULL,'2026-10-13 18:55:31','2026-10-13 18:55:31'),(294,6,'LOCAL','VIDEO','020 Forward (Chuyển tiếp) yêu cầu.mp4','video/mp4',127857606,NULL,NULL,NULL,'/api/media/videos/n0/17f1043b-919d-4dc7-9a20-b817e6556c5e.mp4',NULL,'/api/media/videos/n0/17f1043b-919d-4dc7-9a20-b817e6556c5e.mp4',NULL,NULL,NULL,'READY',597,NULL,NULL,NULL,'2026-10-13 18:55:36','2026-10-13 18:55:36'),(295,6,'LOCAL','VIDEO','021 Redirect (Chuyển hướng) yêu cầu.mp4','video/mp4',118475974,NULL,NULL,NULL,'/api/media/videos/n0/8e285a30-da3d-472b-83da-dc8397bc024c.mp4',NULL,'/api/media/videos/n0/8e285a30-da3d-472b-83da-dc8397bc024c.mp4',NULL,NULL,NULL,'READY',600,NULL,NULL,NULL,'2026-10-13 18:55:41','2026-10-13 18:55:41'),(296,6,'LOCAL','VIDEO','022 Dữ liệu gốc  @ResponseBody.mp4','video/mp4',7571358,NULL,NULL,NULL,'/api/media/videos/n0/d858f5bd-f8b2-4404-a15a-8158861edaac.mp4',NULL,'/api/media/videos/n0/d858f5bd-f8b2-4404-a15a-8158861edaac.mp4',NULL,NULL,NULL,'READY',86,NULL,NULL,NULL,'2026-10-13 18:55:42','2026-10-13 18:55:42'),(297,6,'LOCAL','VIDEO','1 Introduction.mp4','video/mp4',41108683,NULL,NULL,NULL,'/api/media/videos/n0/02e7f55f-94d3-4699-8078-9944b18490c7.mp4',NULL,'/api/media/videos/n0/02e7f55f-94d3-4699-8078-9944b18490c7.mp4',NULL,NULL,NULL,'READY',315,NULL,NULL,NULL,'2026-10-13 18:58:10','2026-10-13 18:58:10'),(298,6,'LOCAL','VIDEO','3 Udemy ratings and reviews.mp4','video/mp4',12017778,NULL,NULL,NULL,'/api/media/videos/n0/84d8f0c7-2ef2-4860-a86e-0f889c1e56e2.mp4',NULL,'/api/media/videos/n0/84d8f0c7-2ef2-4860-a86e-0f889c1e56e2.mp4',NULL,NULL,NULL,'READY',38,NULL,NULL,NULL,'2026-10-13 18:58:10','2026-10-13 18:58:10'),(299,6,'LOCAL','VIDEO','4 How this setup differs from traditional React + Firebase apps.mp4','video/mp4',27594558,NULL,NULL,NULL,'/api/media/videos/n0/b266588e-e24f-4a69-8208-a1caf2859bc2.mp4',NULL,'/api/media/videos/n0/b266588e-e24f-4a69-8208-a1caf2859bc2.mp4',NULL,NULL,NULL,'READY',388,NULL,NULL,NULL,'2026-10-13 18:58:11','2026-10-13 18:58:11'),(300,6,'LOCAL','VIDEO','5 Overview of stack + helpful tools for this course.mp4','video/mp4',14611239,NULL,NULL,NULL,'/api/media/videos/n0/e4e959d1-07fe-4549-b293-daec8cdacce9.mp4',NULL,'/api/media/videos/n0/e4e959d1-07fe-4549-b293-daec8cdacce9.mp4',NULL,NULL,NULL,'READY',193,NULL,NULL,NULL,'2026-10-13 18:58:12','2026-10-13 18:58:12'),(301,6,'LOCAL','VIDEO','6 Set up Next JS project.mp4','video/mp4',20352167,NULL,NULL,NULL,'/api/media/videos/n0/89bc50e4-ffea-4254-b0de-2275ec5af150.mp4',NULL,'/api/media/videos/n0/89bc50e4-ffea-4254-b0de-2275ec5af150.mp4',NULL,NULL,NULL,'READY',258,NULL,NULL,NULL,'2026-10-13 18:58:12','2026-10-13 18:58:12'),(302,6,'LOCAL','VIDEO','7 Set up Firebase project.mp4','video/mp4',68002275,NULL,NULL,NULL,'/api/media/videos/n0/09b06cce-69d8-49ea-a88a-ea773d5282dc.mp4',NULL,'/api/media/videos/n0/09b06cce-69d8-49ea-a88a-ea773d5282dc.mp4',NULL,NULL,NULL,'READY',706,NULL,NULL,NULL,'2026-10-13 18:58:14','2026-10-13 18:58:14'),(303,6,'LOCAL','VIDEO','8 Connect Next JS to Firebase.mp4','video/mp4',148570043,NULL,NULL,NULL,'/api/media/videos/n0/bb2651c8-a2ea-4a8e-a817-55a79e74b124.mp4',NULL,'/api/media/videos/n0/bb2651c8-a2ea-4a8e-a817-55a79e74b124.mp4',NULL,NULL,NULL,'READY',1003,NULL,NULL,NULL,'2026-10-13 18:58:17','2026-10-13 18:58:17'),(304,6,'LOCAL','VIDEO','9 Add the navbar with auth links.mp4','video/mp4',64364491,NULL,NULL,NULL,'/api/media/videos/n0/2d1a2be3-0162-4f7f-8ac8-dbc28d63feb2.mp4',NULL,'/api/media/videos/n0/2d1a2be3-0162-4f7f-8ac8-dbc28d63feb2.mp4',NULL,NULL,NULL,'READY',547,NULL,NULL,NULL,'2026-10-13 18:58:19','2026-10-13 18:58:19'),(305,6,'LOCAL','VIDEO','10 Install shadcn ui and add login with Google.mp4','video/mp4',79288251,NULL,NULL,NULL,'/api/media/videos/n0/b07422ec-c017-4855-934f-4698eba67f5e.mp4',NULL,'/api/media/videos/n0/b07422ec-c017-4855-934f-4698eba67f5e.mp4',NULL,NULL,NULL,'READY',637,NULL,NULL,NULL,'2026-10-13 18:58:20','2026-10-13 18:58:20'),(306,6,'LOCAL','VIDEO','11 Create auth context and display logged in user.mp4','video/mp4',121894334,NULL,NULL,NULL,'/api/media/videos/n0/712fdb5e-6f29-4cf4-a72e-3afaa155d527.mp4',NULL,'/api/media/videos/n0/712fdb5e-6f29-4cf4-a72e-3afaa155d527.mp4',NULL,NULL,NULL,'READY',875,NULL,NULL,NULL,'2026-10-13 18:58:23','2026-10-13 18:58:23'),(307,6,'LOCAL','VIDEO','12 Add logout functionality.mp4','video/mp4',51935310,NULL,NULL,NULL,'/api/media/videos/n0/9fa4087d-0322-40e7-b043-00c400089ce2.mp4',NULL,'/api/media/videos/n0/9fa4087d-0322-40e7-b043-00c400089ce2.mp4',NULL,NULL,NULL,'READY',368,NULL,NULL,NULL,'2026-10-13 18:58:24','2026-10-13 18:58:24'),(308,6,'LOCAL','VIDEO','13 Improve navbar styling.mp4','video/mp4',82268006,NULL,NULL,NULL,'/api/media/videos/n0/f0bc88a4-48f2-4350-805a-ac6fd9799e3c.mp4',NULL,'/api/media/videos/n0/f0bc88a4-48f2-4350-805a-ac6fd9799e3c.mp4',NULL,NULL,NULL,'READY',597,NULL,NULL,NULL,'2026-10-13 18:58:26','2026-10-13 18:58:26'),(309,6,'LOCAL','VIDEO','14 Improve login page styling.mp4','video/mp4',99054346,NULL,NULL,NULL,'/api/media/videos/n0/39ab3770-8686-486c-9f40-ea932e8748b0.mp4',NULL,'/api/media/videos/n0/39ab3770-8686-486c-9f40-ea932e8748b0.mp4',NULL,NULL,NULL,'READY',738,NULL,NULL,NULL,'2026-10-13 18:58:28','2026-10-13 18:58:28'),(310,6,'LOCAL','VIDEO','15 Add the current user dropdown to the navbar.mp4','video/mp4',112576083,NULL,NULL,NULL,'/api/media/videos/n0/0d0c86ee-32a1-41f4-b596-89ba3aaae195.mp4',NULL,'/api/media/videos/n0/0d0c86ee-32a1-41f4-b596-89ba3aaae195.mp4',NULL,NULL,NULL,'READY',806,NULL,NULL,NULL,'2026-10-13 18:58:31','2026-10-13 18:58:31'),(311,6,'LOCAL','VIDEO','16 Add the admin role to a user and save auth tokens in cookies.mp4','video/mp4',136158438,NULL,NULL,NULL,'/api/media/videos/n0/2244e5a3-974c-4d6e-83fc-269f00d93f57.mp4',NULL,'/api/media/videos/n0/2244e5a3-974c-4d6e-83fc-269f00d93f57.mp4',NULL,NULL,NULL,'READY',892,NULL,NULL,NULL,'2026-10-13 18:58:35','2026-10-13 18:58:35'),(312,6,'LOCAL','VIDEO','17 Conditionally render user profile menu items.mp4','video/mp4',40497671,NULL,NULL,NULL,'/api/media/videos/n0/7476202e-700e-48db-9ec3-0bc1cf6f1fed.mp4',NULL,'/api/media/videos/n0/7476202e-700e-48db-9ec3-0bc1cf6f1fed.mp4',NULL,NULL,NULL,'READY',274,NULL,NULL,NULL,'2026-10-13 18:58:36','2026-10-13 18:58:36'),(313,6,'LOCAL','VIDEO','18 Add the admin dashboard page + route protection with Next JS middleware.mp4','video/mp4',72455623,NULL,NULL,NULL,'/api/media/videos/n0/8d05a284-d857-4354-8df3-fa06757b3fec.mp4',NULL,'/api/media/videos/n0/8d05a284-d857-4354-8df3-fa06757b3fec.mp4',NULL,NULL,NULL,'READY',596,NULL,NULL,NULL,'2026-10-13 18:58:38','2026-10-13 18:58:38'),(314,6,'LOCAL','VIDEO','19 Build the admin dashboard main page.mp4','video/mp4',91790190,NULL,NULL,NULL,'/api/media/videos/n0/84f50254-f601-48c0-ba00-4175ce06dc00.mp4',NULL,'/api/media/videos/n0/84f50254-f601-48c0-ba00-4175ce06dc00.mp4',NULL,NULL,NULL,'READY',675,NULL,NULL,NULL,'2026-10-13 18:58:41','2026-10-13 18:58:41'),(315,6,'LOCAL','VIDEO','20 Create the New Property page.mp4','video/mp4',29322707,NULL,NULL,NULL,'/api/media/videos/n0/08956191-4c34-485b-81b3-4167e9b595c0.mp4',NULL,'/api/media/videos/n0/08956191-4c34-485b-81b3-4167e9b595c0.mp4',NULL,NULL,NULL,'READY',252,NULL,NULL,NULL,'2026-10-13 18:58:41','2026-10-13 18:58:41'),(316,6,'LOCAL','VIDEO','21 Create the new property form schema.mp4','video/mp4',107689387,NULL,NULL,NULL,'/api/media/videos/n0/6f64c3aa-e9df-4eaa-9c2e-040302f50d20.mp4',NULL,'/api/media/videos/n0/6f64c3aa-e9df-4eaa-9c2e-040302f50d20.mp4',NULL,NULL,NULL,'READY',737,NULL,NULL,NULL,'2026-10-13 18:58:44','2026-10-13 18:58:44'),(317,6,'LOCAL','VIDEO','22 Create PropertyForm component and start building form UI.mp4','video/mp4',131296717,NULL,NULL,NULL,'/api/media/videos/n0/e0d01faf-05d4-4786-bb7c-0a91fc15ed30.mp4',NULL,'/api/media/videos/n0/e0d01faf-05d4-4786-bb7c-0a91fc15ed30.mp4',NULL,NULL,NULL,'READY',880,NULL,NULL,NULL,'2026-10-13 18:58:48','2026-10-13 18:58:48'),(318,6,'LOCAL','VIDEO','23 Finish rendering the PropertyForm fields.mp4','video/mp4',110839945,NULL,NULL,NULL,'/api/media/videos/n0/1a3ff3bb-31ea-4bec-a54e-878e2a0b1f6c.mp4',NULL,'/api/media/videos/n0/1a3ff3bb-31ea-4bec-a54e-878e2a0b1f6c.mp4',NULL,NULL,NULL,'READY',720,NULL,NULL,NULL,'2026-10-13 18:58:52','2026-10-13 18:58:52'),(319,6,'LOCAL','VIDEO','24 Create the saveNewProperty server action and save data to firestore.mp4','video/mp4',98857516,NULL,NULL,NULL,'/api/media/videos/n0/9066a0bf-ade4-49dd-ae2d-c2d80a0fb306.mp4',NULL,'/api/media/videos/n0/9066a0bf-ade4-49dd-ae2d-c2d80a0fb306.mp4',NULL,NULL,NULL,'READY',706,NULL,NULL,NULL,'2026-10-13 18:58:58','2026-10-13 18:58:58'),(320,6,'LOCAL','VIDEO','25 Improve the UI when submitting the new property form.mp4','video/mp4',81300082,NULL,NULL,NULL,'/api/media/videos/n0/59a0d689-ae8e-4842-8550-a22a7eb78e92.mp4',NULL,'/api/media/videos/n0/59a0d689-ae8e-4842-8550-a22a7eb78e92.mp4',NULL,NULL,NULL,'READY',621,NULL,NULL,NULL,'2026-10-13 18:59:03','2026-10-13 18:59:03'),(321,6,'LOCAL','VIDEO','26 Query for properties data.mp4','video/mp4',111786765,NULL,NULL,NULL,'/api/media/videos/n0/cf4a9385-b6b7-491e-ae6f-a2d23802da2c.mp4',NULL,'/api/media/videos/n0/cf4a9385-b6b7-491e-ae6f-a2d23802da2c.mp4',NULL,NULL,NULL,'READY',756,NULL,NULL,NULL,'2026-10-13 18:59:07','2026-10-13 18:59:07'),(322,6,'LOCAL','VIDEO','27 Render the properties list in a table.mp4','video/mp4',95282745,NULL,NULL,NULL,'/api/media/videos/n0/6834ffe4-07d0-4bb6-9fcd-deed52c48fd5.mp4',NULL,'/api/media/videos/n0/6834ffe4-07d0-4bb6-9fcd-deed52c48fd5.mp4',NULL,NULL,NULL,'READY',658,NULL,NULL,NULL,'2026-10-13 18:59:10','2026-10-13 18:59:10'),(323,6,'LOCAL','VIDEO','28 Calculate the total pages for a firestore query.mp4','video/mp4',61459373,NULL,NULL,NULL,'/api/media/videos/n0/8e70ff44-4574-47dc-9c37-f2945f3ad36b.mp4',NULL,'/api/media/videos/n0/8e70ff44-4574-47dc-9c37-f2945f3ad36b.mp4',NULL,NULL,NULL,'READY',411,NULL,NULL,NULL,'2026-10-13 18:59:11','2026-10-13 18:59:11'),(324,6,'LOCAL','VIDEO','29 Render the pagination buttons under the properties table.mp4','video/mp4',61807924,NULL,NULL,NULL,'/api/media/videos/n0/aa061a85-dfed-4715-8bec-862b23bd3810.mp4',NULL,'/api/media/videos/n0/aa061a85-dfed-4715-8bec-862b23bd3810.mp4',NULL,NULL,NULL,'READY',445,NULL,NULL,NULL,'2026-10-13 18:59:13','2026-10-13 18:59:13'),(325,6,'LOCAL','VIDEO','30 Create the edit property page.mp4','video/mp4',84949752,NULL,NULL,NULL,'/api/media/videos/n0/c4c45541-59b7-40cd-be18-a1b08179fec1.mp4',NULL,'/api/media/videos/n0/c4c45541-59b7-40cd-be18-a1b08179fec1.mp4',NULL,NULL,NULL,'READY',549,NULL,NULL,NULL,'2026-10-13 18:59:15','2026-10-13 18:59:15'),(326,6,'LOCAL','VIDEO','31 Create the edit property form.mp4','video/mp4',95899037,NULL,NULL,NULL,'/api/media/videos/n0/78d595c4-c5cb-4910-a891-6f70e366e83f.mp4',NULL,'/api/media/videos/n0/78d595c4-c5cb-4910-a891-6f70e366e83f.mp4',NULL,NULL,NULL,'READY',638,NULL,NULL,NULL,'2026-10-13 18:59:18','2026-10-13 18:59:18'),(327,6,'LOCAL','VIDEO','32 Create the updateProperty server action.mp4','video/mp4',114696464,NULL,NULL,NULL,'/api/media/videos/n0/2be64692-99f9-4d68-aa82-5979a2bc90c2.mp4',NULL,'/api/media/videos/n0/2be64692-99f9-4d68-aa82-5979a2bc90c2.mp4',NULL,NULL,NULL,'READY',827,NULL,NULL,NULL,'2026-10-13 18:59:20','2026-10-13 18:59:20'),(328,6,'LOCAL','VIDEO','33 Add route protection for all admin-dashboard routes and auth pages.mp4','video/mp4',98953169,NULL,NULL,NULL,'/api/media/videos/n0/02172739-9cbe-469c-9cb1-fbdadcd5f80e.mp4',NULL,'/api/media/videos/n0/02172739-9cbe-469c-9cb1-fbdadcd5f80e.mp4',NULL,NULL,NULL,'READY',800,NULL,NULL,NULL,'2026-10-13 18:59:22','2026-10-13 18:59:22'),(329,6,'LOCAL','VIDEO','34 Improve the styling of the properties table.mp4','video/mp4',133064263,NULL,NULL,NULL,'/api/media/videos/n0/0b474809-c6f2-4182-bab1-2ca9fce07963.mp4',NULL,'/api/media/videos/n0/0b474809-c6f2-4182-bab1-2ca9fce07963.mp4',NULL,NULL,NULL,'READY',925,NULL,NULL,NULL,'2026-10-13 18:59:25','2026-10-13 18:59:25'),(330,6,'LOCAL','VIDEO','35 Create the image uploader component.mp4','video/mp4',77828725,NULL,NULL,NULL,'/api/media/videos/n0/0f5eaa64-9e41-49aa-b587-e33ed494d5e4.mp4',NULL,'/api/media/videos/n0/0f5eaa64-9e41-49aa-b587-e33ed494d5e4.mp4',NULL,NULL,NULL,'READY',647,NULL,NULL,NULL,'2026-10-13 18:59:28','2026-10-13 18:59:28'),(331,6,'LOCAL','VIDEO','36 Store selected images in the form state.mp4','video/mp4',143151160,NULL,NULL,NULL,'/api/media/videos/n0/6775e4a2-2d84-4862-9419-ae852a3e43e1.mp4',NULL,'/api/media/videos/n0/6775e4a2-2d84-4862-9419-ae852a3e43e1.mp4',NULL,NULL,NULL,'READY',821,NULL,NULL,NULL,'2026-10-13 18:59:31','2026-10-13 18:59:31'),(332,6,'LOCAL','VIDEO','37 Render the images list.mp4','video/mp4',136486179,NULL,NULL,NULL,'/api/media/videos/n0/7aadaabc-801a-46b4-8953-c3aaeadbad9f.mp4',NULL,'/api/media/videos/n0/7aadaabc-801a-46b4-8953-c3aaeadbad9f.mp4',NULL,NULL,NULL,'READY',848,NULL,NULL,NULL,'2026-10-13 18:59:35','2026-10-13 18:59:35'),(333,6,'LOCAL','VIDEO','38 Implement reorder and delete images.mp4','video/mp4',60679766,NULL,NULL,NULL,'/api/media/videos/n0/ce8361d2-ac0b-49ec-a8b7-a8821c168649.mp4',NULL,'/api/media/videos/n0/ce8361d2-ac0b-49ec-a8b7-a8821c168649.mp4',NULL,NULL,NULL,'READY',381,NULL,NULL,NULL,'2026-10-13 18:59:36','2026-10-13 18:59:36'),(334,6,'LOCAL','VIDEO','39 Implement upload images to firebase storage for new properties.mp4','video/mp4',172714926,NULL,NULL,NULL,'/api/media/videos/n0/c9001b95-696d-4736-87ba-722486f5f9cb.mp4',NULL,'/api/media/videos/n0/c9001b95-696d-4736-87ba-722486f5f9cb.mp4',NULL,NULL,NULL,'READY',1164,NULL,NULL,NULL,'2026-10-13 18:59:40','2026-10-13 18:59:40'),(335,6,'LOCAL','VIDEO','40 Load existing uploaded images into the edit property form.mp4','video/mp4',133222621,NULL,NULL,NULL,'/api/media/videos/n0/211cb288-4304-4c82-8579-8a6975110941.mp4',NULL,'/api/media/videos/n0/211cb288-4304-4c82-8579-8a6975110941.mp4',NULL,NULL,NULL,'READY',813,NULL,NULL,NULL,'2026-10-13 18:59:43','2026-10-13 18:59:43'),(336,6,'LOCAL','VIDEO','41 Implement upload + delete images when updating a property.mp4','video/mp4',169603583,NULL,NULL,NULL,'/api/media/videos/n0/dc823492-1545-4f9e-ae60-648a371fb873.mp4',NULL,'/api/media/videos/n0/dc823492-1545-4f9e-ae60-648a371fb873.mp4',NULL,NULL,NULL,'READY',1044,NULL,NULL,NULL,'2026-10-13 18:59:47','2026-10-13 18:59:47'),(337,6,'LOCAL','VIDEO','42 Create the property page and render the description as markdown.mp4','video/mp4',156119293,NULL,NULL,NULL,'/api/media/videos/n0/37e3038f-0683-4f0d-9df2-4d00b2c2ebf9.mp4',NULL,'/api/media/videos/n0/37e3038f-0683-4f0d-9df2-4d00b2c2ebf9.mp4',NULL,NULL,NULL,'READY',991,NULL,NULL,NULL,'2026-10-13 18:59:51','2026-10-13 18:59:51'),(338,6,'LOCAL','VIDEO','43 Render the property details.mp4','video/mp4',106131724,NULL,NULL,NULL,'/api/media/videos/n0/80edf310-5f38-4604-bc97-e53bb215a6e6.mp4',NULL,'/api/media/videos/n0/80edf310-5f38-4604-bc97-e53bb215a6e6.mp4',NULL,NULL,NULL,'READY',582,NULL,NULL,NULL,'2026-10-13 18:59:54','2026-10-13 18:59:54'),(339,6,'LOCAL','VIDEO','44 Render the property images carousel and back button.mp4','video/mp4',116019880,NULL,NULL,NULL,'/api/media/videos/n0/8d323472-a2aa-43d4-a74d-3d728a30afca.mp4',NULL,'/api/media/videos/n0/8d323472-a2aa-43d4-a74d-3d728a30afca.mp4',NULL,NULL,NULL,'READY',590,NULL,NULL,NULL,'2026-10-13 18:59:56','2026-10-13 18:59:56'),(340,6,'LOCAL','VIDEO','45 Create the property search page and search filters.mp4','video/mp4',91573807,NULL,NULL,NULL,'/api/media/videos/n0/66d346a4-5051-4591-9e4a-1445b84be1dd.mp4',NULL,'/api/media/videos/n0/66d346a4-5051-4591-9e4a-1445b84be1dd.mp4',NULL,NULL,NULL,'READY',636,NULL,NULL,NULL,'2026-10-13 18:59:59','2026-10-13 18:59:59'),(341,6,'LOCAL','VIDEO','46 Hook up the search filters to the URL and create firestore indexes.mp4','video/mp4',156954736,NULL,NULL,NULL,'/api/media/videos/n0/171f12a4-445f-4f4b-885a-4deff4604d0d.mp4',NULL,'/api/media/videos/n0/171f12a4-445f-4f4b-885a-4deff4604d0d.mp4',NULL,NULL,NULL,'READY',1114,NULL,NULL,NULL,'2026-10-13 19:00:03','2026-10-13 19:00:03'),(342,6,'LOCAL','VIDEO','47 Render the filtered property list.mp4','video/mp4',170288419,NULL,NULL,NULL,'/api/media/videos/n0/804abc9a-3de2-462c-a17a-39c6c6b28d3e.mp4',NULL,'/api/media/videos/n0/804abc9a-3de2-462c-a17a-39c6c6b28d3e.mp4',NULL,NULL,NULL,'READY',1085,NULL,NULL,NULL,'2026-10-13 19:00:07','2026-10-13 19:00:07'),(343,6,'LOCAL','VIDEO','48 Add the pagination buttons for property search.mp4','video/mp4',98894334,NULL,NULL,NULL,'/api/media/videos/n0/42296aa3-4dfb-4703-bbf2-79b39f55860a.mp4',NULL,'/api/media/videos/n0/42296aa3-4dfb-4703-bbf2-79b39f55860a.mp4',NULL,NULL,NULL,'READY',671,NULL,NULL,NULL,'2026-10-13 19:00:09','2026-10-13 19:00:09'),(344,6,'LOCAL','VIDEO','49 Create the register form schema.mp4','video/mp4',85889432,NULL,NULL,NULL,'/api/media/videos/n0/104f9a36-fee8-4a5c-878e-41df4b6dd837.mp4',NULL,'/api/media/videos/n0/104f9a36-fee8-4a5c-878e-41df4b6dd837.mp4',NULL,NULL,NULL,'READY',676,NULL,NULL,NULL,'2026-10-13 19:01:08','2026-10-13 19:01:08'),(345,6,'LOCAL','VIDEO','50 Render the register form UI.mp4','video/mp4',56564432,NULL,NULL,NULL,'/api/media/videos/n0/406e6e3e-f19b-401a-b30a-7ab2eec1d03c.mp4',NULL,'/api/media/videos/n0/406e6e3e-f19b-401a-b30a-7ab2eec1d03c.mp4',NULL,NULL,NULL,'READY',408,NULL,NULL,NULL,'2026-10-13 19:01:10','2026-10-13 19:01:10'),(346,6,'LOCAL','VIDEO','51 Create the register user server action.mp4','video/mp4',78444511,NULL,NULL,NULL,'/api/media/videos/n0/65286713-a61e-464e-af0f-937dfbccce1f.mp4',NULL,'/api/media/videos/n0/65286713-a61e-464e-af0f-937dfbccce1f.mp4',NULL,NULL,NULL,'READY',554,NULL,NULL,NULL,'2026-10-13 19:01:12','2026-10-13 19:01:12'),(347,6,'LOCAL','VIDEO','52 Build the login with email and password form.mp4','video/mp4',141713011,NULL,NULL,NULL,'/api/media/videos/n0/59ece307-f556-4576-a04c-caf03ababad6.mp4',NULL,'/api/media/videos/n0/59ece307-f556-4576-a04c-caf03ababad6.mp4',NULL,NULL,NULL,'READY',1058,NULL,NULL,NULL,'2026-10-13 19:01:16','2026-10-13 19:01:16'),(348,6,'LOCAL','VIDEO','53 Improve validation and errors for login and register.mp4','video/mp4',134736263,NULL,NULL,NULL,'/api/media/videos/n0/814c4e8e-97c8-4d18-a1e8-9313c04f51cd.mp4',NULL,'/api/media/videos/n0/814c4e8e-97c8-4d18-a1e8-9313c04f51cd.mp4',NULL,NULL,NULL,'READY',1009,NULL,NULL,NULL,'2026-10-13 19:01:19','2026-10-13 19:01:19'),(349,6,'LOCAL','VIDEO','54 Update the middleware to cater for expiring auth tokens.mp4','video/mp4',140083804,NULL,NULL,NULL,'/api/media/videos/n0/d35500ff-f750-4f8d-a172-71352127b0b2.mp4',NULL,'/api/media/videos/n0/d35500ff-f750-4f8d-a172-71352127b0b2.mp4',NULL,NULL,NULL,'READY',1025,NULL,NULL,NULL,'2026-10-13 19:01:22','2026-10-13 19:01:22'),(350,6,'LOCAL','VIDEO','55 Add the my-favourites page and toggle favourite button.mp4','video/mp4',94460337,NULL,NULL,NULL,'/api/media/videos/n0/e16145ac-3d36-419e-aa4a-c45975cc270f.mp4',NULL,'/api/media/videos/n0/e16145ac-3d36-419e-aa4a-c45975cc270f.mp4',NULL,NULL,NULL,'READY',784,NULL,NULL,NULL,'2026-10-13 19:01:24','2026-10-13 19:01:24'),(351,6,'LOCAL','VIDEO','56 Implement the add to favourites functionality.mp4','video/mp4',122294208,NULL,NULL,NULL,'/api/media/videos/n0/c4958286-5685-4ac5-8c0d-434e706d9a21.mp4',NULL,'/api/media/videos/n0/c4958286-5685-4ac5-8c0d-434e706d9a21.mp4',NULL,NULL,NULL,'READY',859,NULL,NULL,NULL,'2026-10-13 19:01:28','2026-10-13 19:01:28'),(352,6,'LOCAL','VIDEO','57 Implement the remove from favourites functionality.mp4','video/mp4',99137717,NULL,NULL,NULL,'/api/media/videos/n0/90888546-0e86-4ce1-bd0c-b739be9a5392.mp4',NULL,'/api/media/videos/n0/90888546-0e86-4ce1-bd0c-b739be9a5392.mp4',NULL,NULL,NULL,'READY',642,NULL,NULL,NULL,'2026-10-13 19:01:37','2026-10-13 19:01:37'),(353,6,'LOCAL','VIDEO','58 Implement parallel and intercepting routes for login modal.mp4','video/mp4',66577420,NULL,NULL,NULL,'/api/media/videos/n0/7fb435fe-534f-44db-9e0b-71ef98a40cb6.mp4',NULL,'/api/media/videos/n0/7fb435fe-534f-44db-9e0b-71ef98a40cb6.mp4',NULL,NULL,NULL,'READY',565,NULL,NULL,NULL,'2026-10-13 19:01:42','2026-10-13 19:01:42'),(354,6,'LOCAL','VIDEO','59 Render the login form in the login modal.mp4','video/mp4',133641933,NULL,NULL,NULL,'/api/media/videos/n0/e8c70ecc-a3b4-4185-9e59-27c709d96816.mp4',NULL,'/api/media/videos/n0/e8c70ecc-a3b4-4185-9e59-27c709d96816.mp4',NULL,NULL,NULL,'READY',928,NULL,NULL,NULL,'2026-10-13 19:01:45','2026-10-13 19:01:45'),(355,6,'LOCAL','VIDEO','60 Query for the list of favourites.mp4','video/mp4',97498769,NULL,NULL,NULL,'/api/media/videos/n0/5e3fd802-921e-4a2e-b0de-f406e0f0b389.mp4',NULL,'/api/media/videos/n0/5e3fd802-921e-4a2e-b0de-f406e0f0b389.mp4',NULL,NULL,NULL,'READY',642,NULL,NULL,NULL,'2026-10-13 19:01:47','2026-10-13 19:01:47'),(356,6,'LOCAL','VIDEO','61 Render the list of favourites in the my-favourites page.mp4','video/mp4',114543381,NULL,NULL,NULL,'/api/media/videos/n0/2201c378-2691-4110-8cc6-d03b87aaa462.mp4',NULL,'/api/media/videos/n0/2201c378-2691-4110-8cc6-d03b87aaa462.mp4',NULL,NULL,NULL,'READY',780,NULL,NULL,NULL,'2026-10-13 19:01:50','2026-10-13 19:01:50'),(357,6,'LOCAL','VIDEO','62 Implement the favourites table pagination and remove favourite.mp4','video/mp4',101605656,NULL,NULL,NULL,'/api/media/videos/n0/d2cdbbdb-f7c5-41d3-b993-e43eb0be6707.mp4',NULL,'/api/media/videos/n0/d2cdbbdb-f7c5-41d3-b993-e43eb0be6707.mp4',NULL,NULL,NULL,'READY',742,NULL,NULL,NULL,'2026-10-13 19:01:53','2026-10-13 19:01:53'),(358,6,'LOCAL','VIDEO','63 Add the account page and render user details.mp4','video/mp4',62517909,NULL,NULL,NULL,'/api/media/videos/n0/2ca3d0b4-4841-4098-871b-4847755cae8e.mp4',NULL,'/api/media/videos/n0/2ca3d0b4-4841-4098-871b-4847755cae8e.mp4',NULL,NULL,NULL,'READY',547,NULL,NULL,NULL,'2026-10-13 19:01:54','2026-10-13 19:01:54'),(359,6,'LOCAL','VIDEO','64 Implement change password form.mp4','video/mp4',157707554,NULL,NULL,NULL,'/api/media/videos/n0/87a31e03-5024-43e4-af4b-0113e990b883.mp4',NULL,'/api/media/videos/n0/87a31e03-5024-43e4-af4b-0113e990b883.mp4',NULL,NULL,NULL,'READY',1029,NULL,NULL,NULL,'2026-10-13 19:01:58','2026-10-13 19:01:58'),(360,6,'LOCAL','VIDEO','65 Implement delete account functionality.mp4','video/mp4',148223238,NULL,NULL,NULL,'/api/media/videos/n0/02b04a21-27ad-4847-b5a3-19877fe967da.mp4',NULL,'/api/media/videos/n0/02b04a21-27ad-4847-b5a3-19877fe967da.mp4',NULL,NULL,NULL,'READY',938,NULL,NULL,NULL,'2026-10-13 19:02:01','2026-10-13 19:02:01'),(361,6,'LOCAL','VIDEO','66 Delete user favourites on account deletion.mp4','video/mp4',32462723,NULL,NULL,NULL,'/api/media/videos/n0/44d92e9c-36f1-44ff-84c1-59b653714fc3.mp4',NULL,'/api/media/videos/n0/44d92e9c-36f1-44ff-84c1-59b653714fc3.mp4',NULL,NULL,NULL,'READY',270,NULL,NULL,NULL,'2026-10-13 19:02:02','2026-10-13 19:02:02'),(362,6,'LOCAL','VIDEO','67 Implement forgot password functionality.mp4','video/mp4',81518536,NULL,NULL,NULL,'/api/media/videos/n0/2d271fee-65c7-4e8d-8981-b458dd7c8157.mp4',NULL,'/api/media/videos/n0/2d271fee-65c7-4e8d-8981-b458dd7c8157.mp4',NULL,NULL,NULL,'READY',592,NULL,NULL,NULL,'2026-10-13 19:02:04','2026-10-13 19:02:04'),(363,6,'LOCAL','VIDEO','68 Enable caching for property pages.mp4','video/mp4',34423219,NULL,NULL,NULL,'/api/media/videos/n0/ebafaf20-7e40-4ed7-8bcf-0fa5460f3bb8.mp4',NULL,'/api/media/videos/n0/ebafaf20-7e40-4ed7-8bcf-0fa5460f3bb8.mp4',NULL,NULL,NULL,'READY',222,NULL,NULL,NULL,'2026-10-13 19:02:05','2026-10-13 19:02:05'),(364,6,'LOCAL','VIDEO','69 Add loading states to app.mp4','video/mp4',42197821,NULL,NULL,NULL,'/api/media/videos/n0/78cb7105-3f87-4e16-8658-a3207c117a39.mp4',NULL,'/api/media/videos/n0/78cb7105-3f87-4e16-8658-a3207c117a39.mp4',NULL,NULL,NULL,'READY',352,NULL,NULL,NULL,'2026-10-13 19:02:06','2026-10-13 19:02:06'),(365,6,'LOCAL','VIDEO','70 Build the landing page (optional).mp4','video/mp4',94497133,NULL,NULL,NULL,'/api/media/videos/n0/485848a2-b0f9-4776-b58b-6c99dcaadd6f.mp4',NULL,'/api/media/videos/n0/485848a2-b0f9-4776-b58b-6c99dcaadd6f.mp4',NULL,NULL,NULL,'READY',583,NULL,NULL,NULL,'2026-10-13 19:02:09','2026-10-13 19:02:09'),(366,6,'LOCAL','VIDEO','71 Implement delete property functionality.mp4','video/mp4',199996124,NULL,NULL,NULL,'/api/media/videos/n0/ebc60554-9a40-4c0e-b769-4eb81df10c03.mp4',NULL,'/api/media/videos/n0/ebc60554-9a40-4c0e-b769-4eb81df10c03.mp4',NULL,NULL,NULL,'READY',1154,NULL,NULL,NULL,'2026-10-13 19:02:14','2026-10-13 19:02:14'),(367,6,'LOCAL','VIDEO','72 Deploy to vercel.mp4','video/mp4',46986265,NULL,NULL,NULL,'/api/media/videos/n0/72539bba-3be4-4d2a-8c28-bfc8e9476431.mp4',NULL,'/api/media/videos/n0/72539bba-3be4-4d2a-8c28-bfc8e9476431.mp4',NULL,NULL,NULL,'READY',386,NULL,NULL,NULL,'2026-10-13 19:02:16','2026-10-13 19:02:16'),(368,18,'LOCAL','VIDEO','AQOrsD8II0bLvn3dccYKeGzdpghDukQUdlcRlVi7J7ogy_6AzlfJIFwSSgSeB3KfmVDLbzx5aLnDjuXvIUqSnRMRkz7LfKtV_YjakVUHnw.mp4','video/mp4',2818536,NULL,NULL,NULL,'/api/media/videos/n0/ece0f4d7-a178-4996-b8b3-40fbd381bd7b.mp4',NULL,'/api/media/videos/n0/ece0f4d7-a178-4996-b8b3-40fbd381bd7b.mp4',NULL,NULL,NULL,'READY',38,NULL,NULL,NULL,'2026-10-13 23:10:35','2026-10-13 23:10:35'),(369,18,'LOCAL','VIDEO','demo giao diện web gỗ.mp4','video/mp4',69891618,NULL,NULL,NULL,'/api/media/videos/n0/29177250-25c1-4a45-b989-2273dd361714.mp4',NULL,'/api/media/videos/n0/29177250-25c1-4a45-b989-2273dd361714.mp4',NULL,NULL,NULL,'READY',211,NULL,NULL,NULL,'2026-10-13 23:10:36','2026-10-13 23:10:36'),(370,21,'LOCAL','VIDEO','1 GenAI Revolution in Mobile Apps.mp4','video/mp4',63799445,NULL,NULL,NULL,'/api/media/videos/n0/f5980d5a-24b4-42bc-a34f-d25774db19ef.mp4',NULL,'/api/media/videos/n0/f5980d5a-24b4-42bc-a34f-d25774db19ef.mp4',NULL,NULL,NULL,'READY',231,NULL,NULL,NULL,'2026-10-14 07:25:44','2026-10-14 07:25:44'),(371,21,'LOCAL','VIDEO','2 What is Flutter.mp4','video/mp4',16795299,NULL,NULL,NULL,'/api/media/videos/n0/a375efd8-17c3-44ad-93d0-c403dcc23b5f.mp4',NULL,'/api/media/videos/n0/a375efd8-17c3-44ad-93d0-c403dcc23b5f.mp4',NULL,NULL,NULL,'READY',92,NULL,NULL,NULL,'2026-10-14 07:25:45','2026-10-14 07:25:45'),(372,21,'LOCAL','VIDEO','3 Installing the Flutter SDK Step-by-Step Guide.mp4','video/mp4',87898868,NULL,NULL,NULL,'/api/media/videos/n0/665fd89e-c547-4f0b-9b30-b6e20daaa86f.mp4',NULL,'/api/media/videos/n0/665fd89e-c547-4f0b-9b30-b6e20daaa86f.mp4',NULL,NULL,NULL,'READY',404,NULL,NULL,NULL,'2026-10-14 07:25:46','2026-10-14 07:25:46'),(373,21,'LOCAL','VIDEO','4 Android Studio Installation Guide for Flutter Developers.mp4','video/mp4',57132716,NULL,NULL,NULL,'/api/media/videos/n0/d66385d7-001e-4825-adae-5d87f432b87c.mp4',NULL,'/api/media/videos/n0/d66385d7-001e-4825-adae-5d87f432b87c.mp4',NULL,NULL,NULL,'READY',199,NULL,NULL,NULL,'2026-10-14 07:25:46','2026-10-14 07:25:46'),(374,21,'LOCAL','VIDEO','5 Setting Up Xcode for Building iOS Apps with Flutter.mp4','video/mp4',55263575,NULL,NULL,NULL,'/api/media/videos/n0/7543575c-eb8e-49c5-bd0a-82d67b293a15.mp4',NULL,'/api/media/videos/n0/7543575c-eb8e-49c5-bd0a-82d67b293a15.mp4',NULL,NULL,NULL,'READY',176,NULL,NULL,NULL,'2026-10-14 07:25:47','2026-10-14 07:25:47'),(375,21,'LOCAL','VIDEO','6 Flutter Project Setup Running Your App on the iOS Simulator.mp4','video/mp4',50802714,NULL,NULL,NULL,'/api/media/videos/n0/20e88ace-bd2c-4c32-aa10-a7d15fe9c6ba.mp4',NULL,'/api/media/videos/n0/20e88ace-bd2c-4c32-aa10-a7d15fe9c6ba.mp4',NULL,NULL,NULL,'READY',202,NULL,NULL,NULL,'2026-10-14 07:25:47','2026-10-14 07:25:47'),(376,21,'LOCAL','VIDEO','7 Setting Up the Android Emulator to Run Flutter Projects.mp4','video/mp4',35686211,NULL,NULL,NULL,'/api/media/videos/n0/60d2fac8-ce3f-45d3-8301-89405bde09c9.mp4',NULL,'/api/media/videos/n0/60d2fac8-ce3f-45d3-8301-89405bde09c9.mp4',NULL,NULL,NULL,'READY',156,NULL,NULL,NULL,'2026-10-14 07:25:48','2026-10-14 07:25:48'),(377,21,'LOCAL','VIDEO','8 Installing Flutter SDK on Windows Step-by-Step Guide.mp4','video/mp4',43938766,NULL,NULL,NULL,'/api/media/videos/n0/875aad97-139d-4e60-b6d5-d95533c561bd.mp4',NULL,'/api/media/videos/n0/875aad97-139d-4e60-b6d5-d95533c561bd.mp4',NULL,NULL,NULL,'READY',320,NULL,NULL,NULL,'2026-10-14 07:25:48','2026-10-14 07:25:48'),(378,21,'LOCAL','VIDEO','9 Setting Up Android Studio for Flutter on Windows.mp4','video/mp4',58167288,NULL,NULL,NULL,'/api/media/videos/n0/130279cc-c65f-4a3d-a032-963386750cc6.mp4',NULL,'/api/media/videos/n0/130279cc-c65f-4a3d-a032-963386750cc6.mp4',NULL,NULL,NULL,'READY',418,NULL,NULL,NULL,'2026-10-14 07:25:49','2026-10-14 07:25:49'),(379,21,'LOCAL','VIDEO','10 Setting Up an Android Emulator (AVD) for Flutter Apps.mp4','video/mp4',19792771,NULL,NULL,NULL,'/api/media/videos/n0/8a9db94d-41b6-4d60-956f-cefa495ca13d.mp4',NULL,'/api/media/videos/n0/8a9db94d-41b6-4d60-956f-cefa495ca13d.mp4',NULL,NULL,NULL,'READY',151,NULL,NULL,NULL,'2026-10-14 07:25:49','2026-10-14 07:25:49'),(380,21,'LOCAL','VIDEO','ghi-hinh-1791963364632.webm','video/mp4',2438010,NULL,NULL,NULL,'/api/media/videos/n0/8ddd71c8-4a44-4150-a93b-6a9244f7a60d.mp4',NULL,'/api/media/videos/n0/8ddd71c8-4a44-4150-a93b-6a9244f7a60d.mp4',NULL,NULL,NULL,'READY',0,NULL,NULL,NULL,'2026-10-14 07:36:08','2026-10-14 07:36:08'),(381,21,'LOCAL','VIDEO','ghi-hinh-1791963480172.webm','video/mp4',5236726,NULL,NULL,NULL,'/api/media/videos/n0/7fa59084-949c-44de-bd74-464843b6fa6e.mp4',NULL,'/api/media/videos/n0/7fa59084-949c-44de-bd74-464843b6fa6e.mp4',NULL,NULL,NULL,'READY',0,NULL,NULL,NULL,'2026-10-14 07:38:12','2026-10-14 07:38:12'),(382,23,'LOCAL','VIDEO','1 GenAI Revolution in Mobile Apps.mp4','video/mp4',63799445,NULL,NULL,NULL,'/api/media/videos/n0/8896ed60-155f-4241-bddd-33bff918fb8b.mp4',NULL,'/api/media/videos/n0/8896ed60-155f-4241-bddd-33bff918fb8b.mp4',NULL,NULL,NULL,'READY',231,NULL,NULL,NULL,'2026-10-14 15:27:46','2026-10-14 15:27:46'),(383,23,'LOCAL','VIDEO','2 What is Flutter.mp4','video/mp4',16795299,NULL,NULL,NULL,'/api/media/videos/n0/33dd219b-dc7c-4198-b960-1f301aa9a3aa.mp4',NULL,'/api/media/videos/n0/33dd219b-dc7c-4198-b960-1f301aa9a3aa.mp4',NULL,NULL,NULL,'READY',92,NULL,NULL,NULL,'2026-10-14 15:27:46','2026-10-14 15:27:46'),(384,23,'LOCAL','VIDEO','3 Installing the Flutter SDK Step-by-Step Guide.mp4','video/mp4',87898868,NULL,NULL,NULL,'/api/media/videos/n0/a75b6ad2-71fb-4ba3-b631-fa34740883d1.mp4',NULL,'/api/media/videos/n0/a75b6ad2-71fb-4ba3-b631-fa34740883d1.mp4',NULL,NULL,NULL,'READY',404,NULL,NULL,NULL,'2026-10-14 15:27:47','2026-10-14 15:27:47'),(385,23,'LOCAL','VIDEO','4 Android Studio Installation Guide for Flutter Developers.mp4','video/mp4',57132716,NULL,NULL,NULL,'/api/media/videos/n0/d5936496-c095-4ca7-b758-41d4cd5001bb.mp4',NULL,'/api/media/videos/n0/d5936496-c095-4ca7-b758-41d4cd5001bb.mp4',NULL,NULL,NULL,'READY',199,NULL,NULL,NULL,'2026-10-14 15:27:48','2026-10-14 15:27:48'),(386,23,'LOCAL','VIDEO','5 Setting Up Xcode for Building iOS Apps with Flutter.mp4','video/mp4',55263575,NULL,NULL,NULL,'/api/media/videos/n0/619bf520-a6ef-45c4-b5b7-c6b8b11c1584.mp4',NULL,'/api/media/videos/n0/619bf520-a6ef-45c4-b5b7-c6b8b11c1584.mp4',NULL,NULL,NULL,'READY',176,NULL,NULL,NULL,'2026-10-14 15:27:48','2026-10-14 15:27:48'),(387,18,'LOCAL','VIDEO','1 GenAI Revolution in Mobile Apps.mp4','video/mp4',63799445,NULL,NULL,NULL,'/api/media/videos/n0/69fc0cf7-391a-41bc-a56e-325b85dfc991.mp4',NULL,'/api/media/videos/n0/69fc0cf7-391a-41bc-a56e-325b85dfc991.mp4',NULL,NULL,NULL,'READY',231,NULL,NULL,NULL,'2026-10-16 06:30:54','2026-10-16 06:30:54'),(388,18,'LOCAL','VIDEO','2 What is Flutter.mp4','video/mp4',16795299,NULL,NULL,NULL,'/api/media/videos/n0/e88ed3cb-f3a0-43ea-90b5-7d80ab68b177.mp4',NULL,'/api/media/videos/n0/e88ed3cb-f3a0-43ea-90b5-7d80ab68b177.mp4',NULL,NULL,NULL,'READY',92,NULL,NULL,NULL,'2026-10-16 06:30:54','2026-10-16 06:30:54'),(389,18,'LOCAL','VIDEO','3 Installing the Flutter SDK Step-by-Step Guide.mp4','video/mp4',87898868,NULL,NULL,NULL,'/api/media/videos/n0/41ae9ef7-abd7-4482-aca6-fd6b75f380d7.mp4',NULL,'/api/media/videos/n0/41ae9ef7-abd7-4482-aca6-fd6b75f380d7.mp4',NULL,NULL,NULL,'READY',404,NULL,NULL,NULL,'2026-10-16 06:30:56','2026-10-16 06:30:56'),(390,18,'LOCAL','VIDEO','4 Android Studio Installation Guide for Flutter Developers.mp4','video/mp4',57132716,NULL,NULL,NULL,'/api/media/videos/n0/b601933f-a3e9-41f7-b60b-cc5fd7316e57.mp4',NULL,'/api/media/videos/n0/b601933f-a3e9-41f7-b60b-cc5fd7316e57.mp4',NULL,NULL,NULL,'READY',199,NULL,NULL,NULL,'2026-10-16 06:30:57','2026-10-16 06:30:57'),(391,18,'LOCAL','VIDEO','5 Setting Up Xcode for Building iOS Apps with Flutter.mp4','video/mp4',55263575,NULL,NULL,NULL,'/api/media/videos/n0/7a2a9ff9-5c17-409b-9c93-bf26601c73c8.mp4',NULL,'/api/media/videos/n0/7a2a9ff9-5c17-409b-9c93-bf26601c73c8.mp4',NULL,NULL,NULL,'READY',176,NULL,NULL,NULL,'2026-10-16 06:30:58','2026-10-16 06:30:58');
/*!40000 ALTER TABLE `media_assets` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `news`
--

DROP TABLE IF EXISTS `news`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `news` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `image_url` varchar(500) NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_news_active` (`is_active`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `news`
--

LOCK TABLES `news` WRITE;
/*!40000 ALTER TABLE `news` DISABLE KEYS */;
/*!40000 ALTER TABLE `news` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `newsblogs`
--

DROP TABLE IF EXISTS `newsblogs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `newsblogs` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `excerpt` text,
  `image_url` varchar(500) NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `published_at` datetime NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_newsblogs_slug` (`slug`),
  KEY `idx_newsblogs_public` (`is_active`,`published_at`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `newsblogs`
--

LOCK TABLES `newsblogs` WRITE;
/*!40000 ALTER TABLE `newsblogs` DISABLE KEYS */;
INSERT INTO `newsblogs` VALUES (2,'[TopCourse] Top 5 Khoá Học Online Miễn Phí Về Nghệ Thuật Viết Essay: Từ Ý Tưởng Đến Bài Viết Hoàn Chỉnh','topcourse-top-5-khoa-hoc-online-mien-phi-ve-nghe-thuat-viet-essay-tu-y-tuong-den-bai-viet-hoan-chinh','Tóm Tắt Bài Viết (Tự Động Bởi AI)\r\nKhóa học hướng dẫn toàn diện từ bước đầu viết essay đến hoàn thành bài luận mạch lạc, thuyết phục, bao gồm lập dàn ý, viết câu chủ đề, tổ chức ý tưởng, sử dụng ngữ pháp và từ vựng chính xác. TopCourse giới thiệu 5 khóa học miễn phí nổi bật: kỹ năng viết luận và báo cáo (OpenLearn), cải thiện viết học thuật (Coursera), viết luận tiếng Anh cơ bản (UC Berkeley), viết luận học thuật chuẩn trong 10 tuần (ĐH Queensland), và viết luận cá nhân (ĐH Wesleyan). Tất cả đều do các nền tảng uy tín cung cấp, phù hợp cho học sinh, sinh viên và người đi làm muốn nâng cao kỹ năng viết và tư duy phản biện.\r\nĐây là một hành trình hướng dẫn bạn từ những bước đầu tiên của quá trình viết essay cho đến khi hoàn thành một bài viết hoàn chỉnh. Khóa học cung cấp các kỹ thuật để phát triển và tổ chức ý tưởng, từ cách lập dàn ý, viết câu chủ đề cho từng đoạn, đến việc xây dựng một bài viết mạch lạc và thuyết phục. Bên cạnh đó, bạn còn được học cách sử dụng ngữ pháp và từ vựng sao cho chính xác và phù hợp, giúp bài essay của bạn trở nên rõ ràng và chuyên nghiệp. TopCourse xin giới thiêu những khóa học lý tưởng cho những ai muốn nâng cao kỹ năng viết và tư duy phản biện, giúp bạn tự tin hơn trong việc thể hiện ý tưởng của mình qua từng bài viết.  \r\n\r\n1.[TopCourse] Khóa Học Online Miễn Phí Giới Thiệu Về Kỹ Năng Viết Bài Luận Và Báo Cáo \"Essay And Report Writing Skills\" Từ OpenLearn\r\n\r\nChỉ tiết khoá học: https://ybox.vn/a/WritingEssayAndReports_TC\r\n\r\n2.[TopCourse] Khóa Học Online Miễn Phí Kỹ Năng Viết Luận: \"Essay Essentials: Improve Your Academic Writing\"\r\n\r\nChi tiết khoá học: https://ybox.vn/EssayEssentials_TC\r\n\r\n3.[TopCourse] Khóa Học Online Miễn Phí Về Hướng Dẫn Viết Luận Tiếng Anh \"Getting Started With Essay Writing\" Từ Đại Học California\r\n\r\nChi tiết khoá học: https://ybox.vn/a/StartedEssayWriting_TC\r\n\r\n4. [TopCourse] Khóa Học Online Miễn Phí Giúp Bạn Viết Luận Học Thuật Bằng Tiếng Anh Đúng Chuẩn Trong 10 Tuần \"How To Write An Essay\" Từ Đại Học Queensland\r\n\r\nChi tiết khoá học: https://ybox.vn/a/EssayWritingSkills_TC\r\n\r\n5. [TopCourse] Khóa Học Online Miễn Phí Cải Thiện Viết Luận Cá Nhân: \"Writing A Personal Essay\" Từ Đại Học Wesleyan\r\n\r\nChi tiết khoá học: https://ybox.vn/PersonalEssay_TC\r\n\r\n---------------------------------------------------------------------------------------------\r\n\r\n(*) TopCourse là nơi chia sẻ và tổng hợp những khóa học miễn phí hay, bổ ích dành cho học sinh, sinh viên và người đi làm.\r\n\r\n(*) Tại thời điểm CTV TopCourse thu thập, tổng hợp và chia sẻ, khoá học này là miễn phí. Tuy nhiên nền tảng cung cấp khoá học này có thể chuyển thành trả phí lúc nào mà không cần thông báo trước. Cảm ơn bạn đã quan tâm đến các khoá học mà TopCourse chia sẻ.','/uploads/newsblogs/4d357a66-5807-45bc-8357-fea2ec7c9dd6.jpg',1,'2026-10-14 02:03:43','2026-10-14 02:03:43','2026-10-14 02:03:43'),(3,'4 khóa học viết content online giúp bạn tự học content tại nhà','4-khoa-hoc-viet-content-online-giup-ban-tu-hoc-content-tai-nha','Bạn là chủ doanh nghiệp, người đi làm, người kinh doanh online, hay thậm chí là sinh viên ngành marketing/trái ngành muốn phát triển kỹ năng viết content để phục vụ công việc và kiếm tiền từ nó nhưng băn khoăn trước nhiều chương trình học hiện nay, thì đây là 4 khoá học viết content online tại nguyenphucthao.com bạn có thể tham khảo.\r\n\r\nĐây là 4 chương trình học mình tự tin có thể mang lại cho bạn hiệu quả sau khi nghiêm túc học và thực hành theo. Bởi tất cả những nội dung mình chia sẻ tại đây được đúc kết từ những kinh nghiệm, trải nghiệm trong suốt 7 năm làm trong lĩnh vực tiếp thị nội dung có sự đánh giá cao từ phía chuyên gia và review tốt từ phía người học.\r\n\r\nNào, bây giờ chúng ta cùng tìm hiểu chi tiết hơn 4 khóa khóa học viết content online này nhé!\r\n\r\n1. Khóa học viết Content website \r\n– Dành cho:\r\n\r\nChủ doanh nghiệp (đa lĩnh vực) muốn tự sáng tạo nội dung trên website của mình hoặc đo lường, nắm bắt tiến độ cũng như hiệu quả công việc nếu thuê nhân sự.\r\nSinh viên ngành Marketing/trái ngành muốn học kiến thức viết content website để phục vụ cho công việc sau khi ra trường.\r\nFreelance Writer muốn nắm vững kỹ năng viết Content chuẩn Seo website để tìm kiếm việc làm tự do trên các nền tảng.\r\nNgười kinh doanh chuyên môn riêng, Blogger,…muốn xây dựng thương hiệu cá nhân để khách hàng tự tìm đến với mình.\r\n– Nội dung: Xem chi tiết \r\n\r\n– Thời gian: 31 video bài giảng\r\n\r\n– Tài liệu đi kèm: Ebook 50+ bí kíp chinh phục viết hiệu quả, 8 bảng drive hướng dẫn chi tiết, 2 file PDF giáo trình chuyên sâu.\r\n\r\n– Cơ hội kiếm tiền: \r\n\r\nTăng doanh thu nhờ content thu hút khách hàng tự nhiên đến từ Google.\r\nTiết kiệm chi phí thuê nhân sự hoặc làm việc hiệu quả hơn với team content.\r\nTạo dựng sự uy tín cho doanh nghiệp cũng như thương hiệu cá nhân.\r\nTìm được công việc full-time trong lĩnh vực Content Marketing, SEO.\r\nNhận job freelance từ khi còn là sinh viên\r\n Xây dựng blog cá nhân và kiếm tiền từ Google Adsense hoặc Affiliate Marketing.\r\nNhận dự án viết content website, content SEO từ khách hàng cá nhân, doanh nghiệp, agency.\r\nXây dựng thương hiệu cá nhân trên LinkedIn, Facebook để thu hút khách hàng.\r\nHợp tác với nhãn hàng để viết bài quảng cáo (sponsored post).\r\n\r\n\r\nXem thêm: \r\n\r\nBạn đã hiểu đúng về Content website\r\nĐể bài viết chuẩn SEO mang nhiều “bản sắc” hơn\r\nCác dạng content thường được triển khai trên một website\r\n2. Khóa học Viết Content Facebook\r\n– Dành cho:\r\n\r\nBất kỳ ai muốn xây dựng chiến lược nội dung Facebook để bán hàng, xây dựng Thương hiệu cá nhân.\r\nNgười muốn xây dựng fanpage, phát triển nội dung bền vững, viết bài quảng cáo,….để bán hàng ra đơn.\r\n– Nội dung: Xem chi tiết\r\n\r\n– Thời gian: 22 video bài giảng\r\n\r\n– Tài liệu đi kèm: Ebook 50+ bí kíp chinh phục viết hiệu quả, 2 bảng drive hướng dẫn chi tiết, 2 file PDF giáo trình chuyên sâu.\r\n\r\n– Cơ hội kiếm tiền:\r\n\r\nBán bất kế sản phẩm vật lý hay dịch vụ, giải pháp nào đó bạn đang muốn đưa đến tay người sử dụng, tiêu dùng như quần áo, mỹ phẩm, đồ gia dụng,..trên trang cá nhân facebook và fanpage của bạn.\r\nQuản trị fanpage cho doanh nghiệp, cá nhân, thương hiệu với mức giá từ vài trăm đến hàng chục triệu đồng mỗi tháng.\r\nTạo dựng fanpage cá nhân rồi bán lại hoặc nhận quảng cáo (nếu bạn có khả năng làm KOL, KOC, Influencer Marketing,…)\r\nKiếm tiền từ Affiliate Marketing (Tiếp thị liên kết), một nghề nghiệp đang rất thịnh hành ở thời điểm hiện tại và tương lai.\r\n\r\n\r\nXem thêm:\r\n\r\nCác dạng Content facebook thường gặp hằng ngày\r\n10 sai lầm cần tránh để có cách viết Content facebook thu hút\r\n4 mục tiêu cần xác định khi viết bài đăng trên facebook\r\n3. Khóa học viết Content PR\r\n– Dành cho:\r\n\r\nChủ doanh nghiệp, cá nhân kinh doanh muốn xây dựng hình ảnh thương hiệu qua các bài viết PR chuyên nghiệp.\r\nNhân sự marketing, content writer muốn nâng cao kỹ năng viết bài PR trên báo chí, blog, website doanh nghiệp.\r\nSinh viên ngành Marketing, Truyền thông hoặc trái ngành muốn học cách viết bài PR để tìm việc hoặc làm freelancer.\r\nFreelancer, người viết tự do muốn mở rộng dịch vụ viết bài PR cho doanh nghiệp, nhãn hàng, agency truyền thông.\r\n– Nội dung khóa học: Xem chi tiết\r\n\r\n– Thời gian: 15 video bài giảng\r\n\r\n– Tài liệu đi kèm: Ebook 50+ bí kíp chinh phục viết hiệu quả, 2 bảng drive hướng dẫn chi tiết, 2 file PDF giáo trình chuyên sâu.\r\n\r\nCơ hội kiếm tiền: \r\n\r\nCá nhân, chủ Doanh nghiệp viết bài PR chuyên nghiệp để tăng uy tín, thu hút khách hàng mà không cần thuê ngoài.\r\nĐăng bài trên báo chí, website, fanpage giúp thương hiệu tiếp cận khách hàng một cách tự nhiên một cách uy tín.\r\nXây dựng hình ảnh cá nhân trên các nền tảng truyền thông như website, facebook, báo chí,…\r\nViết bài PR thuê cho doanh nghiệp, cá nhân, thương hiệu,..\r\nHợp tác với các agency PR để cung cấp dịch vụ viết bài PR chuyên nghiệp.  \r\nTạo dựng hồ sơ cá nhân chuyên nghiệp để xin việc dễ dàng hơn.\r\nKiếm tiền từ dịch vụ viết bài PR trên các nền tảng như Upwork, Vlance,…\r\n\r\n\r\n4. Khóa học viết content “Basic Content Writing 3IN1” (khóa học viết content đa kênh)\r\n– Dành cho:\r\n\r\nNgười muốn mở rộng kỹ năng viết content trên nhiều nền tảng khác nhau như website, Facebook, báo chí,…\r\nChủ doanh nghiệp, cá nhân kinh doanh muốn triển khai chiến lược nội dung đa kênh để tối ưu hiệu quả tiếp thị.\r\nNhân sự marketing, content writer muốn học cách triển khai nội dung xuyên suốt trên các kênh truyền thông.\r\nFreelancer, blogger muốn khai thác tối đa khả năng viết để kiếm tiền từ nhiều nguồn khác nhau.\r\n– Nội dung khóa học: Xem chi tiết\r\n\r\n– Thời gian: 58 video bài giảng (bao gồm cả 3 khóa trên)\r\n\r\n– Tài liệu đi kèm: Ebook 50+ bí kíp chinh phục viết hiệu quả, 12 bảng drive hướng dẫn chi tiết, 4 file PDF giáo trình chuyên sâu.\r\n\r\n– Cơ hội kiếm tiền:\r\n\r\nTự xây dựng nội dung trên nhiều kênh để tiếp cận khách hàng đa nền tảng một cách lâu dài và thu hút.\r\nQuản lý nhân sự hoặc làm việc hiệu quả hơn với team content marketing nội bộ hoặc thuê ngoài.\r\nTối ưu chiến lược content marketing để gia tăng doanh số bán hàng mà không tốn nhiều chi phí.\r\nBiết cách sáng tạo content marketing để bán được hàng mà không mất tiền quảng cáo.\r\nNhận job freelance viết content trên nhiều nền tảng.\r\nTrở thành chuyên gia tư vấn chiến lược nội dung đa kênh cho doanh nghiệp.\r\nXây dựng thương hiệu cá nhân và kiếm tiền từ content marketing.\r\n\r\n\r\nHiện tại, các khóa học viết content online trên đều giữ ở mức giá khuyến mãi cho những học viên đăng ký sớm trong năm 2025. Trong thời gian đến, mình sẽ tiếp tục nhập nhật kiến thức trong các Module bài giảng liên quan đến tiếp thị nội dung đa kênh sâu rộng hơn nữa. Do đó, mức giá khóa học viết content marketing online sẽ có sự điều chỉnh tăng lên.\r\n\r\nTrường hợp bạn sở hữu chương trình học cũng như tài liệu học viết content từ những ngày đầu tiên thì sẽ được học thêm các kiến thức mới liên tục được cập nhật mà không phải mất thêm chi phí. \r\n\r\nVới lợi thế học trực tuyến linh hoạt, nội dung thực chiến từ kinh nghiệm trong hơn 7 năm làm nghề content marketing, mình tin rằng bạn sẽ không thất vọng khi bước ra từ các khóa học viết content chuẩn SEO này.\r\n\r\nMột số cảm nhận từ phía học viên:\r\n\r\n\r\n\r\n\r\n\r\nĐể được hỗ trợ thêm về các khóa học viết content online mình đang cung cấp, bạn có thể liên hệ mình tại facebook cá nhân Thảo Nguyễn, zalo 036.899.2489. Hoặc tìm mình tại Cộng đồng học viết Content website, PR và Social Media để chia sẻ kiến thức cùng nhau nhé!','/uploads/newsblogs/bed0454a-04af-429b-8509-e58400f60185.jpg',1,'2026-10-14 02:11:10','2026-10-14 02:11:10','2026-10-14 02:11:10'),(4,'Top các blog học lập trình web mà bạn không nên bỏ qua 2023','top-cac-blog-hoc-lap-trinh-web-ma-ban-khong-nen-bo-qua-2023','Các Blog Lập trình tiếng Việt nổi bật nhất\r\nCông nghệ thông tin là ngành đòi hỏi người trong nghề phải cập nhật kiến thức liên tục để bắt kịp với sự tiến bộ nhanh chóng của thời đại và đáp ứng được yêu cầu ngày càng cao từ thị trường và khách hàng.\r\n\r\nBởi vậy, việc tự học và tìm hiểu thông qua các nguồn tài nguyên như blog, tài liệu học lập trình web, hay khóa học trực tuyến là một phần quan trọng với người lập trình web. Chính vì thế, chúng tôi đã giúp bạn liệt kê các blog tiếng Việt về lập trình nổi tiếng trong danh sách dưới đây:\r\n\r\nAdvanced Programming (duythanhcse.wordpress.com)\r\nBlog này được sở hữu bởi thạc sĩ Trần Duy Thanh, giảng viên của trường đại học Công nghệ thông tin. Những kiến thức được anh chia sẻ tập trung chủ yếu vào lập trình C#, Java, Python hay công nghệ liên quan đến Android, Windows phone, Webservice,...\r\n\r\nĐặc biệt, Blog của Trần Duy Thanh có mục học qua Video và Học qua LiveStream, giúp người mới có thể nhanh chóng hiểu và áp dụng kiến thức vào thực tiễn. \r\n\r\nHiện tại, các bài chia sẻ mới nhất của Thanh đã chuyển sang một trang blog mới chuyên nghiệp hơn https://tranduythanh.com/, các bạn có thể đón đọc các bài viết về lập trình mới nhất ở đây nhé.','/uploads/newsblogs/b4d61fe0-70ce-4a6b-b56a-391d41eb3ccd.png',1,'2026-10-14 02:13:19','2026-10-14 02:13:19','2026-10-14 02:13:19'),(5,'Hướng dẫn cách dùng thẻ IMG hiển thị hình ảnh trong HTML','huong-dan-cach-dung-the-img-hien-thi-hinh-anh-trong-html','Bạn muốn đưa hình ảnh vào file HTML nhưng chưa biết cách làm? Hay đọc ngay hướng dẫn chi tiết cách dùng thẻ IMG hiển thị hình ảnh trong HTML của Gitiho nhé.\r\n\r\nTrong các bài viết trước, chúng mình đã hướng dẫn các bạn kiến thức cơ bản về HTML. Đồng thời, chúng ta cũng đã tìm hiểu về các thẻ Text trong HTML dùng để viết chữ và hiệu chỉnh định dạng của chữ. Tuy nhiên, trong thực tế thì các trang web mà bạn từng xem, ngoại trừ phần văn bản thì sẽ có cả hình ảnh. Vậy làm thế nào thể hiển thị hình ảnh trong HTML?\r\n\r\nChún﻿g ta sẽ cùng tìm hiểu về thẻ IMG dùng để hiển thị hình ảnh trong HTML ngay dưới đây các bạn nhé.\r\n\r\nXEM NHANH BÀI VIẾT\r\n\r\n1 Cách dùng thẻ IMG hiển thị hình ảnh trong HTML\r\n1.1 Bước 1: Tạo file HTML và chuẩn bị ảnh\r\n1.2 Bước 2: Nhập thẻ IMG\r\n1.3 Bước 3: Thay đổi đường dẫn của file ảnh\r\n2 Kết luận\r\nCách dùng thẻ IMG hiển thị hình ảnh trong HTML\r\nBước 1: Tạo file HTML và chuẩn bị ảnh\r\nTương tự như khi làm việc với thẻ Text, trước khi bắt đầu tìm hiểu về thẻ IMG trong HTML thì các bạn cũng cần tạo một thư mục mới rồi mở nó lên trong VSCode. Tiếp theo, các bạn tạo một New File trên VS Code. Sau đó gõ \"html:5\" rồi bấm phím Tab để tạo khung code.\r\n\r\nPhần chuẩn bị ảnh thì các bạn chỉ cần tải sẵn bức ảnh mình muốn dùng về máy tính là được. Bức ảnh này sẽ được lưu cùng thư mục với file HTML các bạn nhé.\r\n\r\nHướng dẫn cách dùng thẻ IMG hiển thị hình ảnh trong HTML\r\n \r\n\r\nSau đó các bạn quay lại VSCode sẽ thấy bức ảnh đã được cập nhật vào như trong hình ảnh dưới đây:\r\n\r\nHướng dẫn cách dùng thẻ IMG hiển thị hình ảnh trong HTML\r\n \r\n\r\nXem thêm: Tìm hiểu chi tiết về các thẻ định dạng chữ (Text) trong HTML\r\n\r\nBước 2: Nhập thẻ IMG\r\nCác bạn dưa con trỏ chuột về giữa cặp thẻ và sau đó nhập \"img\" rồi bấm phím Tab thì sẽ thấy thẻ IMG hiện lên như sau:\r\n\r\nHướng dẫn cách dùng thẻ IMG hiển thị hình ảnh trong HTML\r\n \r\n\r\nTrong hình ảnh trên bạn có thấy được 2 thuộc tính đi kèm thẻ IMG là:\r\n\r\nsrc: Là thuộc tính dùng để trỏ đến file ảnh mà bạn muốn hiển thị trong HTML. Để dùng thuộc tính này, các bạn đặt con trỏ chuột vào giữa dấu ngoặc kép của nó => gõ \"./\" => thấy file hiện lên thì chọn vào file ảnh.\r\nHướng dẫn cách dùng thẻ IMG hiển thị hình ảnh trong HTML    =>     Hướng dẫn cách dùng thẻ IMG hiển thị hình ảnh trong HTML\r\n\r\nNếu các bạn thao tác đúng nhưng file ảnh không hiện ra thì các bạn cài thêm một tiện ích mở rộng cho VSCode nhé. Tiện ích đó tên là: Path Intellisense. Cách cài tiện ích mở rộng cho VSCode chúng mình đã hướng dẫn ở bài trước rồi, các bạn hãy dành chút thời gian để tìm hiểu nhé.\r\n\r\nSau đó các bạn bấm chuột phải vào file HTML => chọn View in Browser để xem khi hiển thị trên trình duyệt thì bức ảnh trông sẽ như thế nào. Dưới đây là kết quả mà chúng mình thu được:\r\n\r\nHướng dẫn cách dùng thẻ IMG hiển thị hình ảnh trong HTML\r\n \r\n\r\nalt: Là thuộc tính dùng để thông báo khi lỗi ảnh. Giả sử chúng mình tạo một file khác trong VSCode và đưa bức ảnh ban đầu vào trong file đó, không để nó nằm cùng thư mục với file HTML như sau:\r\nHướng dẫn cách dùng thẻ IMG hiển thị hình ảnh trong HTML\r\n \r\n\r\nLúc này đường dẫn mà chúng ta điền vào thuộc tính src đang bị sai. Chúng ta sẽ điền nội dung trong thuộc tính alt là \"ảnh chưa hiển thị\". Các bạn bấm F5 lại file HTML đang mở trên trình duyệt thì sẽ thấy thông báo như thế này khi ảnh lỗi do đường dẫn sai:\r\n\r\nHướng dẫn cách dùng thẻ IMG hiển thị hình ảnh trong HTML\r\n \r\n\r\nXem thêm: Hướng dẫn cách chuyển file Word sang HTML đơn giản nhất\r\n\r\nBước 3: Thay đổi đường dẫn của file ảnh\r\nTrong bước 2 chúng ta đã thực hiện một thao tác khiến đường dẫn của ảnh trong thuộc tính src đang bị sai. Để chỉnh lại thì các bạn xóa đường dẫn cũ đi, vẫn nhập \"./\", sau đó kích vào file đang lưu bức ảnh => chọn bức ảnh:\r\n\r\n      Hướng dẫn cách dùng thẻ IMG hiển thị hình ảnh trong HTML Hướng dẫn cách dùng thẻ IMG hiển thị hình ảnh trong HTML\r\n \r\n\r\nSau đó các bạn bấm F5 trên file HTML đang mở trên trình duyệt thì sẽ thấy bức ảnh lại hiển thị bình thường.\r\n\r\nLưu ý: Có một trường hợp khác khiến bức ảnh của bạn không hiển thị. Đó là khi các bạn tạo một file mới, không thuộc file đã lưu bức ảnh và đưa file HTML vào đó. Cụ thể như sau:\r\n\r\nHướng dẫn cách dùng thẻ IMG hiển thị hình ảnh trong HTML\r\n \r\n\r\nKhi chạy lại file HTML trên trình duyệt các bạn sẽ thấy thông báo như sau:\r\n\r\nHướng dẫn cách dùng thẻ IMG hiển thị hình ảnh trong HTML\r\n\r\nKhi gặp trường hợp này, các bạn chỉ cần xóa đường dẫn cũ ở trong đoạn code => nhập vào thuộc tính src là \"../\" => thấy các thư mục hiện ra thì chọn nơi lưu bức ảnh => chọn bức ảnh là được.\r\n\r\nHướng dẫn cách dùng thẻ IMG hiển thị hình ảnh trong HTML\r\n\r\nSau đó các bạn tải lại trang trên trình duyệt đang mở file HTML là sẽ thấy bức ảnh hiện lên như bình thường.\r\n\r\nKết luận\r\nCó thể thấy việc sử dụng thẻ IMG trong HTML rất đơn giản. Các bạn hãy thực hành ngay để ghi nhớ các thao tác nhé. Chúng mình sẽ thường xuyên chia sẻ kiến thức về HTML nên các bạn nhớ theo dõi Gitiho để đón đọc bài viết mới. Nếu bạn muốn được học về HTML một cách đầy đủ, chi tiết với video bài giảng trực quan, dễ hiểu thì các bạn hãy tham gia khóa học dưới đây:\r\n\r\nNhập môn HTML cùng chuyên gia Nguyễn Đình Nam\r\n\r\nKhóa học phù hợp với các bạn đang tìm hiểu về lập trình web với ngôn ngữ HTML và CSS. Hoàn thành khóa học, các bạn sẽ nắm chắc được bản chất và cách thức hoạt động của HTML. Các bạn sẽ có thể sử dụng kiến thức và kỹ năng đã học để xây dựng bộ khung cho website.\r\n\r\nGitiho không giới hạn thời gian và số lượt học nên bạn có thể học bất cứ khi nào bạn muốn. Trong quá trình học, các bạn có thể trao đổi về vấn đề chưa hiểu với chuyên gia ngay trong phần Hỏi - Đáp dưới video bài giảng. Mọi thắc mắc sẽ được phản hồi trong vòng 24h các bạn nhé. Chúc các bạn học tập hiệu quả.﻿﻿﻿\r\n\r\n \r\n\r\n\r\nThẻ hội viên tự cường','/uploads/newsblogs/81708347-ea3b-4b76-993a-9e3544218eb9.png',1,'2026-10-14 02:14:17','2026-10-14 02:14:17','2026-10-14 02:14:17'),(6,'Hành trình tự học lập trình Web từ con số 0: Những bài học xương máu cho người mới','hanh-trinh-tu-hoc-lap-trinh-web-tu-con-so-0-nhung-bai-hoc-xuong-mau-cho-nguoi-moi','Chào mọi người, mình là một người mới (Newbie) vừa dấn thân vào con đường tự học lập trình Web được một thời gian. Hôm nay, mình muốn viết bài này để chia sẻ lại hành trình từ lúc không biết gì cho đến khi tự tay làm được giao diện web đầu tiên, hy vọng sẽ giúp ích cho những bạn có ý định bắt đầu giống mình.\r\n\r\n1. Xuất phát điểm và những bỡ ngỡ ban đầu\r\nLúc mới tìm hiểu, mình hoàn toàn bị ngợp bởi lượng kiến thức khổng lồ trên Internet. Nào là HTML, CSS, JavaScript, rồi lại đến các Framework như React, Vue, Angular... Mình không biết phải học từ đâu và học như thế nào cho hiệu quả. Sau một thời gian loay hoay, mình nhận ra một bài học xương máu: Đừng tham lam học nhiều thứ cùng lúc.\r\n\r\n2. Lộ trình học Front-end mà mình đã áp dụng\r\nĐể không bị nản, mình đã đơn giản hóa lộ trình và tập trung tuyệt đối vào 3 nền tảng cốt lõi:\r\n\r\nHTML (HyperText Markup Language): Định dạng và xây dựng bộ khung cho trang web. Phần này khá dễ và trực quan, mất khoảng 3-5 ngày để nắm cơ bản.\r\nCSS (Cascading Style Sheets): Trang trí, tô màu và căn chỉnh bố cục cho đẹp mắt. Đây là phần tốn nhiều thời gian vì phải làm quen với Flexbox, Grid và Responsive (hiển thị trên điện thoại).\r\nJavaScript (JS): Thổi hồn vào trang web, tạo ra các hiệu ứng tương tác (như click mở menu, hiệu ứng chuyển ảnh...). Đây là phần tư duy logic thực sự nên rất dễ nản, cần kiên trì làm nhiều bài tập.\r\n3. Những công cụ và nguồn học miễn phí mình đã dùng\r\nTrong quá trình học, mình chủ yếu sử dụng các công cụ và nguồn tài liệu miễn phí sau:\r\n\r\nTrình soạn thảo code: VS Code (Visual Studio Code) - Nhẹ, nhiều extension hỗ trợ rất tốt.\r\nNguồn học: Kênh Youtube tự học (như F8 Official, Evondev) và trang web học tương tác W3Schools, freeCodeCamp.\r\n4. Lời khuyên dành cho các bạn Newbie\r\nHọc đi đôi với hành: Đừng chỉ xem video lý thuyết suông. Cứ cài đặt VS Code lên, vừa xem video vừa gõ lại code (Code along).\r\nTự làm project nhỏ: Sau khi học xong HTML/CSS, hãy thử clone lại giao diện của một trang web đơn giản (như trang đăng nhập Facebook, giao diện Shopee đơn giản). Việc này giúp lên tay rất nhanh.\r\nKhông sợ lỗi (Bug): Khi code bị lỗi, hãy tập thói quen copy dòng lỗi đó dán lên Google hoặc hỏi ChatGPT để tìm cách sửa. Sửa được bug chính là lúc bạn giỏi lên. Trên đây là những chia sẻ ngắn gọn của mình sau thời gian đầu tự học. Con đường phía trước còn rất dài (phải học thêm Framework, Back-end...), nhưng mình tin chỉ cần kiên trì thì ai cũng có thể làm được. Mọi người có kinh nghiệm gì hay khi mới học lập trình không? Hãy cùng bình luận chia sẻ bên dưới để mình học hỏi thêm nhé! Cảm ơn mọi người đã đọc bài.','/uploads/newsblogs/cc05abf7-8b59-490f-b730-ca634255fcee.png',1,'2026-10-14 02:16:08','2026-10-14 02:16:08','2026-10-14 02:16:08'),(8,'Nhà nghiên cứu tại OpenAI tiêu tốn 7.000 USD cho token mỗi ngày','nha-nghien-cuu-tai-openai-tieu-ton-7-000-usd-cho-token-moi-ngay','Khoảng 10% nhà nghiên cứu sử dụng tác nhân lập trình nhiều nhất tại OpenAI tiêu thụ mỗi ngày 7.000 USD token, cho thấy cách làm việc đã thay đổi đáng kể.\r\n\r\nTrong bài đăng trên blog cuối tuần qua, OpenAI cho biết nhờ sự phát triển của tác nhân lập trình, nhân viên có thể triển khai mã nhanh hơn, thực hiện nhiều thí nghiệm hơn và giao phó nhiệm vụ ngày càng cao cấp cho chúng.\r\n\r\nCụ thể, mức sử dụng tác nhân lập trình của nhóm nhà nghiên cứu tăng vọt trong ba tháng qua và vượt xa tốc độ tăng trưởng của những nhóm khác. Tính đến giữa tháng 8, mỗi nhà nghiên cứu dùng trung bình mỗi ngày hơn 600 USD token - đơn vị dữ liệu đầu vào cơ bản của AI, tăng mạnh so với mức 162 USD hồi tháng 7, riêng nhóm 10% có mức sử dụng cao nhất tốn hơn 7.000 USD token. Số liệu được tính theo chi phí suy luận thông qua giao diện lập trình ứng dụng (API), tức là chi phí ước tính theo giá niêm yết, không phải số tiền thực OpenAI đã trả.\r\n\r\nNhà phát triển ChatGPT cho biết, tác nhân của họ được sử dụng ngày càng nhiều để khắc phục sự cố kỹ thuật, đến mức số bài đăng hàng ngày trên kênh hỗ trợ kỹ thuật nội bộ do con người điều hành giảm hơn một nửa kể từ tháng 1.\r\n\r\nCông ty cũng tuyên bố đã đạt mục tiêu CEO Sam Altman đặt ra năm ngoái là phát triển một \"thực tập sinh nghiên cứu tự động\", có thể thực hiện nhiệm vụ dưới sự hướng dẫn của con người, và đang đi đúng lộ trình để tạo ra \"nhà nghiên cứu AI hoàn toàn tự động\" vào tháng 3/2028.\r\n\r\nGiao diện website OpenAI. Ảnh: Bảo Lâm\r\nGiao diện website OpenAI. Ảnh: Bảo Lâm, Nguyễn Thanh\r\n\r\nBusiness Insider nhận định, sự phổ biến và hiệu quả ngày càng tăng của tác nhân lập trình khiến ngành kỹ thuật phần mềm năm qua thay đổi đáng kể. Nhiều lập trình viên giao phó nhiệm vụ cho tác nhân, sau đó chỉ cần xem lại kết quả đầu ra. Một số cho rằng điều này giúp họ làm việc hiệu quả hơn, trong khi số khác chia sẻ vẫn gặp nhiều rắc rối khi chỉnh sửa mã.\r\n\r\nTheo báo cáo công bố giữa tháng 6 của Viện nghiên cứu AI Công việc (WAI) thuộc công ty Glean (Mỹ) cùng Đại học Notre Dame, Đại học Stanford, Đại học California Berkeley, nhân viên văn phòng dành trung bình 6,4 tiếng mỗi tuần để cung cấp ngữ cảnh, kiểm tra đầu ra, sửa lỗi, xử lý sai sót của bot AI.','/uploads/newsblogs/44857bce-ccf7-490e-9c10-614d8ec91cdd.webp',1,'2026-10-14 02:18:38','2026-10-14 02:18:38','2026-10-14 02:18:38');
/*!40000 ALTER TABLE `newsblogs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notifications` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `body` varchar(1000) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `type` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `reference_type` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `reference_id` bigint DEFAULT NULL,
  `is_read` tinyint NOT NULL DEFAULT '0',
  `read_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_notifications_user_read` (`user_id`,`is_read`),
  CONSTRAINT `fk_notifications_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=33 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications`
--

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
INSERT INTO `notifications` VALUES (1,1,'Mã giảm giá Phụ nữ Việt Nam','Mã LE10202026 giảm 20% cho đơn hàng dịp Phụ nữ Việt Nam. Áp dụng đến 23/10/2026.','COUPON','COUPON',1,0,NULL,'2026-10-14 06:44:54'),(2,2,'Mã giảm giá Phụ nữ Việt Nam','Mã LE10202026 giảm 20% cho đơn hàng dịp Phụ nữ Việt Nam. Áp dụng đến 23/10/2026.','COUPON','COUPON',1,0,NULL,'2026-10-14 06:44:54'),(3,3,'Mã giảm giá Phụ nữ Việt Nam','Mã LE10202026 giảm 20% cho đơn hàng dịp Phụ nữ Việt Nam. Áp dụng đến 23/10/2026.','COUPON','COUPON',1,0,NULL,'2026-10-14 06:44:54'),(4,4,'Mã giảm giá Phụ nữ Việt Nam','Mã LE10202026 giảm 20% cho đơn hàng dịp Phụ nữ Việt Nam. Áp dụng đến 23/10/2026.','COUPON','COUPON',1,0,NULL,'2026-10-14 06:44:54'),(5,5,'Mã giảm giá Phụ nữ Việt Nam','Mã LE10202026 giảm 20% cho đơn hàng dịp Phụ nữ Việt Nam. Áp dụng đến 23/10/2026.','COUPON','COUPON',1,0,NULL,'2026-10-14 06:44:54'),(6,6,'Mã giảm giá Phụ nữ Việt Nam','Mã LE10202026 giảm 20% cho đơn hàng dịp Phụ nữ Việt Nam. Áp dụng đến 23/10/2026.','COUPON','COUPON',1,0,NULL,'2026-10-14 06:44:54'),(7,7,'Mã giảm giá Phụ nữ Việt Nam','Mã LE10202026 giảm 20% cho đơn hàng dịp Phụ nữ Việt Nam. Áp dụng đến 23/10/2026.','COUPON','COUPON',1,0,NULL,'2026-10-14 06:44:54'),(8,8,'Mã giảm giá Phụ nữ Việt Nam','Mã LE10202026 giảm 20% cho đơn hàng dịp Phụ nữ Việt Nam. Áp dụng đến 23/10/2026.','COUPON','COUPON',1,0,NULL,'2026-10-14 06:44:54'),(9,9,'Mã giảm giá Phụ nữ Việt Nam','Mã LE10202026 giảm 20% cho đơn hàng dịp Phụ nữ Việt Nam. Áp dụng đến 23/10/2026.','COUPON','COUPON',1,0,NULL,'2026-10-14 06:44:54'),(10,10,'Mã giảm giá Phụ nữ Việt Nam','Mã LE10202026 giảm 20% cho đơn hàng dịp Phụ nữ Việt Nam. Áp dụng đến 23/10/2026.','COUPON','COUPON',1,0,NULL,'2026-10-14 06:44:54'),(11,11,'Mã giảm giá Phụ nữ Việt Nam','Mã LE10202026 giảm 20% cho đơn hàng dịp Phụ nữ Việt Nam. Áp dụng đến 23/10/2026.','COUPON','COUPON',1,0,NULL,'2026-10-14 06:44:54'),(12,12,'Mã giảm giá Phụ nữ Việt Nam','Mã LE10202026 giảm 20% cho đơn hàng dịp Phụ nữ Việt Nam. Áp dụng đến 23/10/2026.','COUPON','COUPON',1,0,NULL,'2026-10-14 06:44:54'),(13,13,'Mã giảm giá Phụ nữ Việt Nam','Mã LE10202026 giảm 20% cho đơn hàng dịp Phụ nữ Việt Nam. Áp dụng đến 23/10/2026.','COUPON','COUPON',1,0,NULL,'2026-10-14 06:44:54'),(14,14,'Mã giảm giá Phụ nữ Việt Nam','Mã LE10202026 giảm 20% cho đơn hàng dịp Phụ nữ Việt Nam. Áp dụng đến 23/10/2026.','COUPON','COUPON',1,0,NULL,'2026-10-14 06:44:54'),(15,15,'Mã giảm giá Phụ nữ Việt Nam','Mã LE10202026 giảm 20% cho đơn hàng dịp Phụ nữ Việt Nam. Áp dụng đến 23/10/2026.','COUPON','COUPON',1,0,NULL,'2026-10-14 06:44:54'),(16,16,'Mã giảm giá Phụ nữ Việt Nam','Mã LE10202026 giảm 20% cho đơn hàng dịp Phụ nữ Việt Nam. Áp dụng đến 23/10/2026.','COUPON','COUPON',1,0,NULL,'2026-10-14 06:44:54'),(17,17,'Mã giảm giá Phụ nữ Việt Nam','Mã LE10202026 giảm 20% cho đơn hàng dịp Phụ nữ Việt Nam. Áp dụng đến 23/10/2026.','COUPON','COUPON',1,0,NULL,'2026-10-14 06:44:54'),(18,18,'Mã giảm giá Phụ nữ Việt Nam','Mã LE10202026 giảm 20% cho đơn hàng dịp Phụ nữ Việt Nam. Áp dụng đến 23/10/2026.','COUPON','COUPON',1,1,'2026-10-16 17:42:34','2026-10-14 06:44:54'),(19,19,'Mã giảm giá Phụ nữ Việt Nam','Mã LE10202026 giảm 20% cho đơn hàng dịp Phụ nữ Việt Nam. Áp dụng đến 23/10/2026.','COUPON','COUPON',1,1,'2026-10-14 06:49:27','2026-10-14 06:44:54'),(20,19,'Thanh toán thành công','Đơn LHC1BE7DC6 đã được thanh toán. Khóa học đã mở trong mục Học tập.','PAYMENT','ORDER',33,1,'2026-10-14 06:46:42','2026-10-14 06:46:24'),(21,20,'Mã giảm giá Phụ nữ Việt Nam','Mã LE10202026 giảm 20% cho đơn hàng dịp Phụ nữ Việt Nam. Áp dụng đến 23/10/2026.','COUPON','COUPON',1,0,NULL,'2026-10-14 07:12:20'),(22,21,'Mã giảm giá Phụ nữ Việt Nam','Mã LE10202026 giảm 20% cho đơn hàng dịp Phụ nữ Việt Nam. Áp dụng đến 23/10/2026.','COUPON','COUPON',1,1,'2026-10-14 07:38:45','2026-10-14 07:12:20'),(23,21,'Thanh toán thành công','Đơn LH07D1EE28 đã được thanh toán. Khóa học đã mở trong mục Học tập.','PAYMENT','ORDER',34,0,NULL,'2026-10-14 07:40:15'),(24,21,'Thanh toán thành công','Đơn LH550C8765 đã được thanh toán. Khóa học đã mở trong mục Học tập.','PAYMENT','ORDER',37,0,NULL,'2026-10-14 08:11:03'),(25,22,'Mã giảm giá Phụ nữ Việt Nam','Mã LE10202026 giảm 20% cho đơn hàng dịp Phụ nữ Việt Nam. Áp dụng đến 23/10/2026.','COUPON','COUPON',1,0,NULL,'2026-10-14 08:26:50'),(26,22,'Thanh toán thành công','Đơn LH79008F71 đã được thanh toán. Khóa học đã mở trong mục Học tập.','PAYMENT','ORDER',41,0,NULL,'2026-10-14 08:33:50'),(27,23,'Mã giảm giá Phụ nữ Việt Nam','Mã LE10202026 giảm 20% cho đơn hàng dịp Phụ nữ Việt Nam. Áp dụng đến 23/10/2026.','COUPON','COUPON',1,1,'2026-10-15 11:30:48','2026-10-14 15:38:00'),(28,23,'Thanh toán thành công','Đơn GV6E29EDFE0 đã được thanh toán. Khóa học đã mở trong mục Học tập.','PAYMENT','ORDER',53,1,'2026-10-15 11:30:48','2026-10-14 15:45:31'),(29,23,'Thanh toán thành công','Đơn GV21F26D2113 đã được thanh toán. Khóa học đã mở trong mục Học tập.','PAYMENT','ORDER',65,1,'2026-10-16 06:29:04','2026-10-16 06:27:49'),(30,23,'Đã lưu kết quả bài tập','Bạn đạt 31.67 điểm (19/60) khóa \"Lập trình Spring Boot và Spring Data JPA với Github Copilot\". Kết quả đã được ghi vào lịch sử học tập.','PRACTICE','PRACTICE',4,1,'2026-10-16 10:47:09','2026-10-16 10:46:59'),(31,18,'Thanh toán thành công','Đơn GV218E7476F1 đã được thanh toán. Khóa học đã mở trong mục Học tập.','PAYMENT','ORDER',71,0,NULL,'2026-10-16 17:48:49'),(32,18,'Đã lưu kết quả bài tập','Bạn đạt 40 điểm (24/60) khóa \"Next.js 15 & Firebase\". Kết quả đã được ghi vào lịch sử học tập.','PRACTICE','PRACTICE',5,0,NULL,'2026-10-16 17:52:07');
/*!40000 ALTER TABLE `notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `order_items`
--

DROP TABLE IF EXISTS `order_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `order_items` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `order_id` bigint NOT NULL,
  `course_id` bigint NOT NULL,
  `course_title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `unit_price` decimal(12,2) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `order_id` (`order_id`,`course_id`),
  KEY `fk_oi_course` (`course_id`),
  CONSTRAINT `fk_oi_course` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_oi_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=76 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_items`
--

LOCK TABLES `order_items` WRITE;
/*!40000 ALTER TABLE `order_items` DISABLE KEYS */;
/*!40000 ALTER TABLE `order_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `orders`
--

DROP TABLE IF EXISTS `orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `orders` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `coupon_id` bigint DEFAULT NULL,
  `order_code` varchar(40) COLLATE utf8mb4_unicode_ci NOT NULL,
  `subtotal` decimal(12,2) NOT NULL DEFAULT '0.00',
  `discount_amount` decimal(12,2) NOT NULL DEFAULT '0.00',
  `total_amount` decimal(12,2) NOT NULL DEFAULT '0.00',
  `currency` char(3) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'VND',
  `status` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PENDING',
  `notes` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `paid_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `order_code` (`order_code`),
  KEY `idx_orders_user_status` (`user_id`,`status`),
  KEY `fk_orders_coupon` (`coupon_id`),
  CONSTRAINT `fk_orders_coupon` FOREIGN KEY (`coupon_id`) REFERENCES `coupons` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_orders_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `orders_chk_1` CHECK ((`status` in (_utf8mb4'PENDING',_utf8mb4'PAID',_utf8mb4'FAILED',_utf8mb4'CANCELLED',_utf8mb4'REFUNDED')))
) ENGINE=InnoDB AUTO_INCREMENT=72 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orders`
--

LOCK TABLES `orders` WRITE;
/*!40000 ALTER TABLE `orders` DISABLE KEYS */;
INSERT INTO `orders` VALUES (1,12,NULL,'LH179006629374063',20000.00,0.00,20000.00,'VND','PAID','BANK_TRANSFER','2026-09-22 08:38:14','2026-09-22 08:38:14','2026-09-22 08:38:14'),(2,13,NULL,'LH179006631297429',20000.00,0.00,20000.00,'VND','PENDING','VNPAY',NULL,'2026-09-22 08:38:33','2026-09-22 08:38:33'),(3,14,NULL,'LH179006638910440',20000.00,0.00,20000.00,'VND','PENDING','MOMO',NULL,'2026-09-22 08:39:49','2026-09-22 08:39:49'),(4,6,NULL,'LH179084794453332',30000.00,0.00,30000.00,'VND','PENDING','VNPAY',NULL,'2026-10-01 09:45:45','2026-10-01 09:45:45'),(8,6,NULL,'LH179084831185093',70000.00,0.00,70000.00,'VND','PAID','BANK_TRANSFER','2026-10-01 09:52:29','2026-10-01 09:51:52','2026-10-01 09:52:29'),(9,6,NULL,'LH179084890213239',30000.00,0.00,30000.00,'VND','PENDING','BANK_TRANSFER',NULL,'2026-10-01 10:01:42','2026-10-01 10:01:42'),(10,6,NULL,'LH179084899222454',30000.00,0.00,30000.00,'VND','PENDING','VNPAY',NULL,'2026-10-01 10:03:12','2026-10-01 10:03:12'),(11,6,NULL,'LH179084901665081',30000.00,0.00,30000.00,'VND','PENDING','BANK_TRANSFER',NULL,'2026-10-01 10:03:37','2026-10-01 10:03:37'),(12,6,NULL,'LH179084972529746',30000.00,0.00,30000.00,'VND','PENDING','BANK_TRANSFER',NULL,'2026-10-01 10:15:25','2026-10-01 10:15:25'),(13,15,NULL,'LH179084997902658',30000.00,0.00,30000.00,'VND','PENDING','BANK_TRANSFER',NULL,'2026-10-01 10:19:39','2026-10-01 10:19:39'),(14,6,NULL,'LH179192505090882',30000.00,0.00,30000.00,'VND','PENDING','BANK_TRANSFER',NULL,'2026-10-13 20:57:31','2026-10-13 20:57:31'),(15,6,NULL,'LH179192536105998',30000.00,0.00,30000.00,'VND','PENDING','BANK_TRANSFER',NULL,'2026-10-13 21:02:41','2026-10-13 21:02:41'),(16,6,NULL,'LH30A6EDC7',30000.00,0.00,30000.00,'VND','PENDING','BANK_TRANSFER',NULL,'2026-10-13 21:15:47','2026-10-13 21:15:47'),(17,6,NULL,'LHFF12D175',30000.00,0.00,30000.00,'VND','PENDING','BANK_TRANSFER',NULL,'2026-10-13 21:21:57','2026-10-13 21:21:57'),(18,17,NULL,'LHF5BE648E',30000.00,0.00,30000.00,'VND','PENDING','BANK_TRANSFER',NULL,'2026-10-13 21:27:05','2026-10-13 21:27:05'),(19,17,NULL,'LHB1EB522A',30000.00,0.00,30000.00,'VND','PENDING','BANK_TRANSFER',NULL,'2026-10-13 21:33:53','2026-10-13 21:33:53'),(20,18,NULL,'LHB1EDBB74',30000.00,0.00,30000.00,'VND','PENDING','BANK_TRANSFER',NULL,'2026-10-13 21:38:45','2026-10-13 21:38:45'),(21,18,NULL,'LH790CCD36',30000.00,0.00,30000.00,'VND','PENDING','BANK_TRANSFER',NULL,'2026-10-13 21:42:08','2026-10-13 21:42:08'),(22,18,NULL,'LHE4681181',30000.00,0.00,30000.00,'VND','PENDING','BANK_TRANSFER',NULL,'2026-10-13 21:56:09','2026-10-13 21:56:09'),(23,18,NULL,'LH3DFB49F9',30000.00,0.00,30000.00,'VND','PAID','BANK_TRANSFER','2026-10-13 22:05:21','2026-10-13 22:01:08','2026-10-13 22:05:21'),(24,18,NULL,'LH01ACDDD5',20000.00,0.00,20000.00,'VND','PENDING','BANK_TRANSFER',NULL,'2026-10-13 22:08:42','2026-10-13 22:08:42'),(25,18,NULL,'LH931FB562',20000.00,0.00,20000.00,'VND','PAID','BANK_TRANSFER','2026-10-13 22:12:30','2026-10-13 22:11:56','2026-10-13 22:12:30'),(26,18,NULL,'LH48DB9D46',50000.00,0.00,50000.00,'VND','PAID','BANK_TRANSFER','2026-10-13 22:21:26','2026-10-13 22:21:00','2026-10-13 22:21:26'),(27,15,NULL,'LH963C5C87',30000.00,0.00,30000.00,'VND','PAID','BANK_TRANSFER','2026-10-13 23:07:21','2026-10-13 23:06:56','2026-10-13 23:07:21'),(28,15,NULL,'LH1D2A225B',20000.00,0.00,20000.00,'VND','PAID','BANK_TRANSFER','2026-10-13 23:09:00','2026-10-13 23:08:40','2026-10-13 23:09:00'),(29,15,NULL,'LH2F25B73D',50000.00,0.00,50000.00,'VND','PENDING','BANK_TRANSFER',NULL,'2026-10-14 04:16:12','2026-10-14 04:16:12'),(30,15,NULL,'LH56E2B988',50000.00,0.00,50000.00,'VND','PAID','BANK_TRANSFER','2026-10-14 04:22:12','2026-10-14 04:21:53','2026-10-14 04:22:12'),(31,19,NULL,'LH0794F074',20000.00,0.00,20000.00,'VND','PAID','BANK_TRANSFER','2026-10-14 06:17:27','2026-10-14 06:16:59','2026-10-14 06:17:27'),(32,19,NULL,'LH6C9F3F4A',30000.00,0.00,30000.00,'VND','PAID','BANK_TRANSFER','2026-10-14 06:44:04','2026-10-14 06:43:42','2026-10-14 06:44:04'),(33,19,1,'LHC1BE7DC6',50000.00,10000.00,40000.00,'VND','PAID','BANK_TRANSFER','2026-10-14 06:46:23','2026-10-14 06:45:54','2026-10-14 06:46:23'),(34,21,1,'LH07D1EE28',20000.00,4000.00,16000.00,'VND','PAID','BANK_TRANSFER','2026-10-14 07:40:15','2026-10-14 07:39:47','2026-10-14 07:40:15'),(37,21,NULL,'LH550C8765',50000.00,0.00,50000.00,'VND','PAID','BANK_TRANSFER','2026-10-14 08:11:02','2026-10-14 08:10:41','2026-10-14 08:11:03'),(38,22,NULL,'LH2E3AF58F',20000.00,0.00,20000.00,'VND','PENDING','BANK_TRANSFER',NULL,'2026-10-14 08:23:06','2026-10-14 08:23:06'),(39,22,NULL,'LHF79A7C42',20000.00,0.00,20000.00,'VND','PENDING','BANK_TRANSFER',NULL,'2026-10-14 08:23:39','2026-10-14 08:23:39'),(40,22,NULL,'LH2C886B67',20000.00,0.00,20000.00,'VND','PENDING','BANK_TRANSFER',NULL,'2026-10-14 08:27:07','2026-10-14 08:27:07'),(41,22,NULL,'LH79008F71',20000.00,0.00,20000.00,'VND','PAID','BANK_TRANSFER','2026-10-14 08:33:50','2026-10-14 08:33:20','2026-10-14 08:33:50'),(42,22,NULL,'LH123840D1',20000.00,0.00,20000.00,'VND','PENDING','BANK_TRANSFER',NULL,'2026-10-14 08:34:04','2026-10-14 08:34:04'),(43,22,NULL,'GV63E9476B5',30000.00,0.00,30000.00,'VND','PENDING','BANK_TRANSFER',NULL,'2026-10-14 08:47:02','2026-10-14 08:47:02'),(44,22,NULL,'GV21EB76DA94',20000.00,0.00,20000.00,'VND','PENDING','BANK_TRANSFER',NULL,'2026-10-14 08:47:28','2026-10-14 08:47:28'),(45,23,NULL,'GV216D4C4CF3',20000.00,0.00,20000.00,'VND','PENDING','BANK_TRANSFER',NULL,'2026-10-14 15:28:28','2026-10-14 15:28:28'),(46,23,NULL,'GV67B5E1DEF',20000.00,0.00,20000.00,'VND','PENDING','BANK_TRANSFER',NULL,'2026-10-14 15:30:33','2026-10-14 15:30:33'),(47,23,NULL,'GV23A7996F08',20000.00,0.00,20000.00,'VND','PENDING','BANK_TRANSFER',NULL,'2026-10-14 15:30:56','2026-10-14 15:30:56'),(48,23,NULL,'GV23FB6721ED',20000.00,0.00,20000.00,'VND','PENDING','BANK_TRANSFER',NULL,'2026-10-14 15:38:46','2026-10-14 15:38:46'),(49,23,NULL,'GV61E1CFFCB',20000.00,0.00,20000.00,'VND','PENDING','BANK_TRANSFER',NULL,'2026-10-14 15:39:12','2026-10-14 15:39:12'),(50,23,NULL,'GV2312DE7A0A',20000.00,0.00,20000.00,'VND','PENDING','BANK_TRANSFER',NULL,'2026-10-14 15:39:54','2026-10-14 15:39:54'),(51,23,NULL,'GV61466D996',20000.00,0.00,20000.00,'VND','PENDING','BANK_TRANSFER',NULL,'2026-10-14 15:44:08','2026-10-14 15:44:08'),(52,23,NULL,'GV235F2554CD',20000.00,0.00,20000.00,'VND','PENDING','BANK_TRANSFER',NULL,'2026-10-14 15:44:23','2026-10-14 15:44:23'),(53,23,NULL,'GV6E29EDFE0',20000.00,0.00,20000.00,'VND','PAID','BANK_TRANSFER','2026-10-14 15:45:31','2026-10-14 15:45:03','2026-10-14 15:45:31'),(54,23,NULL,'GV23398D4F27',20000.00,0.00,20000.00,'VND','PENDING','BANK_TRANSFER',NULL,'2026-10-14 15:45:53','2026-10-14 15:45:53'),(55,23,NULL,'GV67073444B',30000.00,0.00,30000.00,'VND','PENDING','BANK_TRANSFER',NULL,'2026-10-14 15:55:02','2026-10-14 15:55:02'),(56,23,NULL,'GV2392CDBC0C',20000.00,0.00,20000.00,'VND','PENDING','BANK_TRANSFER',NULL,'2026-10-14 15:55:17','2026-10-14 15:55:17'),(57,23,NULL,'GV67C985574',30000.00,0.00,30000.00,'VND','PENDING','BANK_TRANSFER',NULL,'2026-10-14 16:00:15','2026-10-14 16:00:15'),(58,23,NULL,'GV237B0FA2EA',20000.00,0.00,20000.00,'VND','PENDING','BANK_TRANSFER',NULL,'2026-10-14 16:00:28','2026-10-14 16:00:28'),(59,23,NULL,'GV21A811FD89',20000.00,0.00,20000.00,'VND','PENDING','BANK_TRANSFER',NULL,'2026-10-15 00:17:58','2026-10-15 00:17:58'),(60,23,NULL,'GV644002ECC',30000.00,0.00,30000.00,'VND','PENDING','BANK_TRANSFER',NULL,'2026-10-15 00:18:29','2026-10-15 00:18:29'),(61,23,NULL,'GV64603AC82',30000.00,0.00,30000.00,'VND','PENDING','BANK_TRANSFER',NULL,'2026-10-15 01:02:16','2026-10-15 01:02:16'),(62,23,NULL,'GV239422078A',20000.00,0.00,20000.00,'VND','PENDING','BANK_TRANSFER',NULL,'2026-10-15 01:02:40','2026-10-15 01:02:40'),(63,23,NULL,'GV6FEE2692B',30000.00,0.00,30000.00,'VND','PENDING','BANK_TRANSFER',NULL,'2026-10-15 10:49:33','2026-10-15 10:49:33'),(64,23,NULL,'GV230A7DEAC2',20000.00,0.00,20000.00,'VND','PENDING','BANK_TRANSFER',NULL,'2026-10-15 10:49:57','2026-10-15 10:49:57'),(65,23,NULL,'GV21F26D2113',20000.00,0.00,20000.00,'VND','PAID','BANK_TRANSFER','2026-10-16 06:27:48','2026-10-16 06:27:18','2026-10-16 06:27:49'),(66,23,NULL,'GV61CB69B73',30000.00,0.00,30000.00,'VND','PENDING','BANK_TRANSFER',NULL,'2026-10-16 06:44:15','2026-10-16 06:44:15'),(67,23,NULL,'GV66D725A59',30000.00,0.00,30000.00,'VND','PENDING','BANK_TRANSFER',NULL,'2026-10-16 06:44:34','2026-10-16 06:44:34'),(68,23,NULL,'GV6ED0C9762',30000.00,0.00,30000.00,'VND','PENDING','BANK_TRANSFER',NULL,'2026-10-16 06:45:11','2026-10-16 06:45:11'),(69,23,NULL,'GV6C92179F4',30000.00,0.00,30000.00,'VND','PENDING','BANK_TRANSFER',NULL,'2026-10-16 06:56:21','2026-10-16 06:56:21'),(70,18,NULL,'GV21FD6BE4BD',20000.00,0.00,20000.00,'VND','PENDING','BANK_TRANSFER',NULL,'2026-10-16 17:42:54','2026-10-16 17:42:54'),(71,18,1,'GV218E7476F1',20000.00,4000.00,16000.00,'VND','PAID','BANK_TRANSFER','2026-10-16 17:48:48','2026-10-16 17:48:17','2026-10-16 17:48:48');
/*!40000 ALTER TABLE `orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payments`
--

DROP TABLE IF EXISTS `payments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payments` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `order_id` bigint NOT NULL,
  `provider` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `provider_txn_id` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `amount` decimal(12,2) NOT NULL,
  `currency` char(3) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'VND',
  `status` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PENDING',
  `checkout_url` varchar(1000) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `raw_payload` json DEFAULT NULL,
  `paid_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `payee_account_name` varchar(128) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `payee_account_number` varchar(32) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `payee_bank` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_payments_provider_txn` (`provider`,`provider_txn_id`),
  KEY `fk_payments_order` (`order_id`),
  CONSTRAINT `fk_payments_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `payments_chk_1` CHECK ((`provider` in (_utf8mb4'VNPAY',_utf8mb4'MOMO',_utf8mb4'STRIPE',_utf8mb4'PAYPAL',_utf8mb4'BANK_TRANSFER',_utf8mb4'WALLET'))),
  CONSTRAINT `payments_chk_2` CHECK ((`status` in (_utf8mb4'PENDING',_utf8mb4'SUCCEEDED',_utf8mb4'FAILED',_utf8mb4'CANCELLED',_utf8mb4'REFUNDED')))
) ENGINE=InnoDB AUTO_INCREMENT=70 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payments`
--

LOCK TABLES `payments` WRITE;
/*!40000 ALTER TABLE `payments` DISABLE KEYS */;
INSERT INTO `payments` VALUES (1,1,'BANK_TRANSFER','BANK_TRANSFER-LH179006629374063',20000.00,'VND','SUCCEEDED','/thanh-toan/LH179006629374063',NULL,'2026-09-22 08:38:14','2026-09-22 08:38:14','2026-09-22 08:38:14',NULL,NULL,NULL),(2,2,'VNPAY','VNPAY-LH179006631297429',20000.00,'VND','PENDING','/thanh-toan/LH179006631297429',NULL,NULL,'2026-09-22 08:38:33','2026-09-22 08:38:33',NULL,NULL,NULL),(3,3,'MOMO','MOMO-LH179006638910440',20000.00,'VND','PENDING','/thanh-toan/LH179006638910440',NULL,NULL,'2026-09-22 08:39:49','2026-09-22 08:39:49',NULL,NULL,NULL),(4,4,'VNPAY','VNPAY-LH179084794453332',30000.00,'VND','PENDING','/thanh-toan/LH179084794453332',NULL,NULL,'2026-10-01 09:45:45','2026-10-01 09:45:45',NULL,NULL,NULL),(8,8,'BANK_TRANSFER','BANK_TRANSFER-LH179084831185093',70000.00,'VND','SUCCEEDED','/thanh-toan/LH179084831185093',NULL,'2026-10-01 09:52:29','2026-10-01 09:51:52','2026-10-01 09:52:29',NULL,NULL,NULL),(9,9,'BANK_TRANSFER','BANK_TRANSFER-LH179084890213239',30000.00,'VND','PENDING','/thanh-toan/LH179084890213239',NULL,NULL,'2026-10-01 10:01:42','2026-10-01 10:01:42',NULL,NULL,NULL),(10,10,'VNPAY','VNPAY-LH179084899222454',30000.00,'VND','PENDING','/thanh-toan/LH179084899222454',NULL,NULL,'2026-10-01 10:03:12','2026-10-01 10:03:12',NULL,NULL,NULL),(11,11,'BANK_TRANSFER','BANK_TRANSFER-LH179084901665081',30000.00,'VND','PENDING','/thanh-toan/LH179084901665081',NULL,NULL,'2026-10-01 10:03:37','2026-10-01 10:03:37',NULL,NULL,NULL),(12,12,'BANK_TRANSFER','BANK_TRANSFER-LH179084972529746',30000.00,'VND','PENDING','/thanh-toan/LH179084972529746',NULL,NULL,'2026-10-01 10:15:25','2026-10-01 10:15:25',NULL,NULL,NULL),(13,13,'BANK_TRANSFER','BANK_TRANSFER-LH179084997902658',30000.00,'VND','PENDING','/thanh-toan/LH179084997902658',NULL,NULL,'2026-10-01 10:19:39','2026-10-01 10:19:39',NULL,NULL,NULL),(14,14,'BANK_TRANSFER','BANK_TRANSFER-LH179192505090882',30000.00,'VND','PENDING','/thanh-toan/LH179192505090882',NULL,NULL,'2026-10-13 20:57:31','2026-10-13 20:57:31',NULL,NULL,NULL),(15,15,'BANK_TRANSFER','BANK_TRANSFER-LH179192536105998',30000.00,'VND','PENDING','/thanh-toan/LH179192536105998',NULL,NULL,'2026-10-13 21:02:41','2026-10-13 21:02:41',NULL,NULL,NULL),(16,16,'BANK_TRANSFER','BANK_TRANSFER-LH30A6EDC7',30000.00,'VND','PENDING','/thanh-toan/LH30A6EDC7',NULL,NULL,'2026-10-13 21:15:47','2026-10-13 21:15:47',NULL,NULL,NULL),(17,17,'BANK_TRANSFER','BANK_TRANSFER-LHFF12D175',30000.00,'VND','PENDING','/thanh-toan/LHFF12D175',NULL,NULL,'2026-10-13 21:21:57','2026-10-13 21:21:57',NULL,NULL,NULL),(18,18,'BANK_TRANSFER','BANK_TRANSFER-LHF5BE648E',30000.00,'VND','PENDING','/thanh-toan/LHF5BE648E',NULL,NULL,'2026-10-13 21:27:05','2026-10-13 21:27:05',NULL,NULL,NULL),(19,19,'BANK_TRANSFER','BANK_TRANSFER-LHB1EB522A',30000.00,'VND','PENDING','/thanh-toan/LHB1EB522A',NULL,NULL,'2026-10-13 21:33:53','2026-10-13 21:33:53',NULL,NULL,NULL),(20,20,'BANK_TRANSFER','BANK_TRANSFER-LHB1EDBB74',30000.00,'VND','PENDING','/thanh-toan/LHB1EDBB74',NULL,NULL,'2026-10-13 21:38:45','2026-10-13 21:38:45',NULL,NULL,NULL),(21,21,'BANK_TRANSFER','BANK_TRANSFER-LH790CCD36',30000.00,'VND','PENDING','/thanh-toan/LH790CCD36',NULL,NULL,'2026-10-13 21:42:08','2026-10-13 21:42:08',NULL,NULL,NULL),(22,22,'BANK_TRANSFER','BANK_TRANSFER-LHE4681181',30000.00,'VND','PENDING','/thanh-toan/LHE4681181',NULL,NULL,'2026-10-13 21:56:09','2026-10-13 21:56:09',NULL,NULL,NULL),(23,23,'BANK_TRANSFER','SEPAY-PAY48136ACEAA1979E38',30000.00,'VND','SUCCEEDED','/thanh-toan/LH3DFB49F9',NULL,'2026-10-13 22:05:21','2026-10-13 22:01:08','2026-10-13 22:05:21',NULL,NULL,NULL),(24,24,'BANK_TRANSFER','BANK_TRANSFER-LH01ACDDD5',20000.00,'VND','PENDING','/thanh-toan/LH01ACDDD5',NULL,NULL,'2026-10-13 22:08:42','2026-10-13 22:08:42',NULL,NULL,NULL),(25,25,'BANK_TRANSFER','SEPAY-PAY48136ACEACA75D1AD',20000.00,'VND','SUCCEEDED','/thanh-toan/LH931FB562',NULL,'2026-10-13 22:12:30','2026-10-13 22:11:56','2026-10-13 22:12:30',NULL,NULL,NULL),(26,26,'BANK_TRANSFER','SEPAY-PAY48136ACEAEC6CC086',50000.00,'VND','SUCCEEDED','/thanh-toan/LH48DB9D46',NULL,'2026-10-13 22:21:26','2026-10-13 22:21:00','2026-10-13 22:21:26',NULL,NULL,NULL),(27,27,'BANK_TRANSFER','SEPAY-PAY48136ACEB98AA1654',30000.00,'VND','SUCCEEDED','/thanh-toan/LH963C5C87',NULL,'2026-10-13 23:07:21','2026-10-13 23:06:56','2026-10-13 23:07:21',NULL,NULL,NULL),(28,28,'BANK_TRANSFER','SEPAY-PAY48136ACEB9F172A04',20000.00,'VND','SUCCEEDED','/thanh-toan/LH1D2A225B',NULL,'2026-10-13 23:09:00','2026-10-13 23:08:40','2026-10-13 23:09:00',NULL,NULL,NULL),(29,29,'BANK_TRANSFER','BANK_TRANSFER-LH2F25B73D',50000.00,'VND','PENDING','/thanh-toan/LH2F25B73D',NULL,NULL,'2026-10-14 04:16:12','2026-10-14 04:16:12',NULL,NULL,NULL),(30,30,'BANK_TRANSFER','SEPAY-PAY48136ACF03546D44A',50000.00,'VND','SUCCEEDED','/thanh-toan/LH56E2B988',NULL,'2026-10-14 04:22:12','2026-10-14 04:21:53','2026-10-14 04:22:12',NULL,NULL,NULL),(31,31,'BANK_TRANSFER','SEPAY-PAY48136ACF1E4F61CDB',20000.00,'VND','SUCCEEDED','/thanh-toan/LH0794F074',NULL,'2026-10-14 06:17:27','2026-10-14 06:16:59','2026-10-14 06:17:27',NULL,NULL,NULL),(32,32,'BANK_TRANSFER','SEPAY-PAY48136ACF24923B53B',30000.00,'VND','SUCCEEDED','/thanh-toan/LH6C9F3F4A',NULL,'2026-10-14 06:44:04','2026-10-14 06:43:42','2026-10-14 06:44:04',NULL,NULL,NULL),(33,33,'BANK_TRANSFER','SEPAY-PAY48136ACF251651C87',40000.00,'VND','SUCCEEDED','/thanh-toan/LHC1BE7DC6',NULL,'2026-10-14 06:46:23','2026-10-14 06:45:54','2026-10-14 06:46:23',NULL,NULL,NULL),(34,34,'BANK_TRANSFER','SEPAY-PAY48136ACF31B7278F4',16000.00,'VND','SUCCEEDED','/thanh-toan/LH07D1EE28',NULL,'2026-10-14 07:40:15','2026-10-14 07:39:47','2026-10-14 07:40:15',NULL,NULL,NULL),(35,37,'BANK_TRANSFER','SEPAY-PAY48136ACF38F53BC66',50000.00,'VND','SUCCEEDED','/thanh-toan/LH550C8765',NULL,'2026-10-14 08:11:02','2026-10-14 08:10:41','2026-10-14 08:11:03',NULL,NULL,NULL),(36,38,'BANK_TRANSFER','BANK_TRANSFER-LH2E3AF58F',20000.00,'VND','PENDING','/thanh-toan/LH2E3AF58F',NULL,NULL,'2026-10-14 08:23:06','2026-10-14 08:23:06','LE VAN HAU','1847400043862','MBBank'),(37,39,'BANK_TRANSFER','BANK_TRANSFER-LHF79A7C42',20000.00,'VND','PENDING','/thanh-toan/LHF79A7C42',NULL,NULL,'2026-10-14 08:23:39','2026-10-14 08:23:39','LE VAN HAU','37186488888','TPBank'),(38,40,'BANK_TRANSFER','BANK_TRANSFER-LH2C886B67',20000.00,'VND','PENDING','/thanh-toan/LH2C886B67',NULL,NULL,'2026-10-14 08:27:07','2026-10-14 08:27:07','LE VAN HAU','1847400043862','MBBank'),(39,41,'BANK_TRANSFER','SEPAY-PAY48136ACF3E4488A59',20000.00,'VND','SUCCEEDED','/thanh-toan/LH79008F71',NULL,'2026-10-14 08:33:50','2026-10-14 08:33:20','2026-10-14 08:33:50','LE VAN HAU','1847400043862','MBBank'),(40,42,'BANK_TRANSFER','BANK_TRANSFER-LH123840D1',20000.00,'VND','PENDING','/thanh-toan/LH123840D1',NULL,NULL,'2026-10-14 08:34:04','2026-10-14 08:34:04','LE VAN HAU','37186488888','TPBank'),(41,43,'BANK_TRANSFER','BANK_TRANSFER-GV63E9476B5',30000.00,'VND','PENDING','/thanh-toan/GV63E9476B5',NULL,NULL,'2026-10-14 08:47:02','2026-10-14 08:47:02','LE VAN HAU','1847400043862','MBBank'),(42,44,'BANK_TRANSFER','BANK_TRANSFER-GV21EB76DA94',20000.00,'VND','PENDING','/thanh-toan/GV21EB76DA94',NULL,NULL,'2026-10-14 08:47:28','2026-10-14 08:47:28','LE VAN HAU','37186488888','TPBank'),(43,45,'BANK_TRANSFER','BANK_TRANSFER-GV216D4C4CF3',20000.00,'VND','PENDING','/thanh-toan/GV216D4C4CF3',NULL,NULL,'2026-10-14 15:28:28','2026-10-14 15:28:28','LE VAN HAU','37186488888','TPBank'),(44,46,'BANK_TRANSFER','BANK_TRANSFER-GV67B5E1DEF',20000.00,'VND','PENDING','/thanh-toan/GV67B5E1DEF',NULL,NULL,'2026-10-14 15:30:33','2026-10-14 15:30:33','LE VAN HAU','1847400043862','MBBank'),(45,47,'BANK_TRANSFER','BANK_TRANSFER-GV23A7996F08',20000.00,'VND','PENDING','/thanh-toan/GV23A7996F08',NULL,NULL,'2026-10-14 15:30:56','2026-10-14 15:30:56','LE VAN HAU','37186488888','TPBank'),(46,48,'BANK_TRANSFER','BANK_TRANSFER-GV23FB6721ED',20000.00,'VND','PENDING','/thanh-toan/GV23FB6721ED',NULL,NULL,'2026-10-14 15:38:46','2026-10-14 15:38:46','LE VAN HAU','37186488888','TPBank'),(47,49,'BANK_TRANSFER','BANK_TRANSFER-GV61E1CFFCB',20000.00,'VND','PENDING','/thanh-toan/GV61E1CFFCB',NULL,NULL,'2026-10-14 15:39:12','2026-10-14 15:39:12','LE VAN HAU','1847400043862','MBBank'),(48,50,'BANK_TRANSFER','BANK_TRANSFER-GV2312DE7A0A',20000.00,'VND','PENDING','/thanh-toan/GV2312DE7A0A',NULL,NULL,'2026-10-14 15:39:54','2026-10-14 15:39:54','LE VAN HAU','37186488888','TPBank'),(49,51,'BANK_TRANSFER','BANK_TRANSFER-GV61466D996',20000.00,'VND','PENDING','/thanh-toan/GV61466D996',NULL,NULL,'2026-10-14 15:44:08','2026-10-14 15:44:08','LE VAN HAU','1847400043862','MBBank'),(50,52,'BANK_TRANSFER','BANK_TRANSFER-GV235F2554CD',20000.00,'VND','PENDING','/thanh-toan/GV235F2554CD',NULL,NULL,'2026-10-14 15:44:24','2026-10-14 15:44:24','LE VAN HAU','37186488888','TPBank'),(51,53,'BANK_TRANSFER','SEPAY-PAY48136ACFA37232266',20000.00,'VND','SUCCEEDED','/thanh-toan/GV6E29EDFE0',NULL,'2026-10-14 15:45:31','2026-10-14 15:45:03','2026-10-14 15:45:31','LE VAN HAU','1847400043862','MBBank'),(52,54,'BANK_TRANSFER','BANK_TRANSFER-GV23398D4F27',20000.00,'VND','PENDING','/thanh-toan/GV23398D4F27',NULL,NULL,'2026-10-14 15:45:53','2026-10-14 15:45:53','LE VAN HAU','37186488888','TPBank'),(53,55,'BANK_TRANSFER','BANK_TRANSFER-GV67073444B',30000.00,'VND','PENDING','/thanh-toan/GV67073444B',NULL,NULL,'2026-10-14 15:55:02','2026-10-14 15:55:02','LE VAN HAU','1847400043862','MBBank'),(54,56,'BANK_TRANSFER','BANK_TRANSFER-GV2392CDBC0C',20000.00,'VND','PENDING','/thanh-toan/GV2392CDBC0C',NULL,NULL,'2026-10-14 15:55:18','2026-10-14 15:55:18','LE VAN HAU','37186488888','TPBank'),(55,57,'BANK_TRANSFER','BANK_TRANSFER-GV67C985574',30000.00,'VND','PENDING','/thanh-toan/GV67C985574',NULL,NULL,'2026-10-14 16:00:15','2026-10-14 16:00:15','LE VAN HAU','1847400043862','MBBank'),(56,58,'BANK_TRANSFER','BANK_TRANSFER-GV237B0FA2EA',20000.00,'VND','PENDING','/thanh-toan/GV237B0FA2EA',NULL,NULL,'2026-10-14 16:00:29','2026-10-14 16:00:29','LE VAN HAU','37186488888','TPBank'),(57,59,'BANK_TRANSFER','BANK_TRANSFER-GV21A811FD89',20000.00,'VND','PENDING','/thanh-toan/GV21A811FD89',NULL,NULL,'2026-10-15 00:18:00','2026-10-15 00:18:00','LE VAN HAU','37186488888','TPBank'),(58,60,'BANK_TRANSFER','BANK_TRANSFER-GV644002ECC',30000.00,'VND','PENDING','/thanh-toan/GV644002ECC',NULL,NULL,'2026-10-15 00:18:29','2026-10-15 00:18:29','LE VAN HAU','1847400043862','MBBank'),(59,61,'BANK_TRANSFER','BANK_TRANSFER-GV64603AC82',30000.00,'VND','PENDING','/thanh-toan/GV64603AC82',NULL,NULL,'2026-10-15 01:02:16','2026-10-15 01:02:16','LE VAN HAU','1847400043862','MBBank'),(60,62,'BANK_TRANSFER','BANK_TRANSFER-GV239422078A',20000.00,'VND','PENDING','/thanh-toan/GV239422078A',NULL,NULL,'2026-10-15 01:02:40','2026-10-15 01:02:40','LE VAN HAU','37186488888','TPBank'),(61,63,'BANK_TRANSFER','BANK_TRANSFER-GV6FEE2692B',30000.00,'VND','PENDING','/thanh-toan/GV6FEE2692B',NULL,NULL,'2026-10-15 10:49:33','2026-10-15 10:49:33','LE VAN HAU','1847400043862','MBBank'),(62,64,'BANK_TRANSFER','BANK_TRANSFER-GV230A7DEAC2',20000.00,'VND','PENDING','/thanh-toan/GV230A7DEAC2',NULL,NULL,'2026-10-15 10:49:58','2026-10-15 10:49:58','LE VAN HAU','37186488888','TPBank'),(63,65,'BANK_TRANSFER','SEPAY-PAY48136AD1C3BE21E41',20000.00,'VND','SUCCEEDED','/thanh-toan/GV21F26D2113',NULL,'2026-10-16 06:27:48','2026-10-16 06:27:19','2026-10-16 06:27:49','LE VAN HAU','37186488888','TPBank'),(64,66,'BANK_TRANSFER','BANK_TRANSFER-GV61CB69B73',30000.00,'VND','PENDING','/thanh-toan/GV61CB69B73',NULL,NULL,'2026-10-16 06:44:15','2026-10-16 06:44:15','LE VAN HAU','1847400043862','MBBank'),(65,67,'BANK_TRANSFER','BANK_TRANSFER-GV66D725A59',30000.00,'VND','PENDING','/thanh-toan/GV66D725A59',NULL,NULL,'2026-10-16 06:44:34','2026-10-16 06:44:34','LE VAN HAU','1847400043862','MBBank'),(66,68,'BANK_TRANSFER','BANK_TRANSFER-GV6ED0C9762',30000.00,'VND','PENDING','/thanh-toan/GV6ED0C9762',NULL,NULL,'2026-10-16 06:45:11','2026-10-16 06:45:11','LE VAN HAU','1847400043862','MBBank'),(67,69,'BANK_TRANSFER','BANK_TRANSFER-GV6C92179F4',30000.00,'VND','PENDING','/thanh-toan/GV6C92179F4',NULL,NULL,'2026-10-16 06:56:21','2026-10-16 06:56:21','LE VAN HAU','1847400043862','MBBank'),(68,70,'BANK_TRANSFER','BANK_TRANSFER-GV21FD6BE4BD',20000.00,'VND','PENDING','/thanh-toan/GV21FD6BE4BD',NULL,NULL,'2026-10-16 17:42:54','2026-10-16 17:42:54','LE VAN HAU','37186488888','TPBank'),(69,71,'BANK_TRANSFER','SEPAY-PAY48136AD2634E59B33',16000.00,'VND','SUCCEEDED','/thanh-toan/GV218E7476F1',NULL,'2026-10-16 17:48:48','2026-10-16 17:48:17','2026-10-16 17:48:48','LE VAN HAU','37186488888','TPBank');
/*!40000 ALTER TABLE `payments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `permissions`
--

DROP TABLE IF EXISTS `permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `permissions` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `code` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `module` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `action` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`),
  UNIQUE KEY `module` (`module`,`action`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `permissions`
--

LOCK TABLES `permissions` WRITE;
/*!40000 ALTER TABLE `permissions` DISABLE KEYS */;
INSERT INTO `permissions` VALUES (1,'users.view','users','view','Xem người dùng','2026-09-08 03:44:05','2026-09-08 03:44:05'),(2,'users.manage','users','manage','Quản lý người dùng','2026-09-08 03:44:05','2026-09-08 03:44:05'),(3,'courses.view','courses','view','Xem khóa học','2026-09-08 03:44:05','2026-09-08 03:44:05'),(4,'courses.manage','courses','manage','Tạo/sửa khóa học','2026-09-08 03:44:05','2026-09-08 03:44:05'),(5,'courses.publish','courses','publish','Xuất bản khóa học','2026-09-08 03:44:05','2026-09-08 03:44:05'),(6,'orders.view','orders','view','Xem đơn hàng','2026-09-08 03:44:05','2026-09-08 03:44:05'),(7,'orders.manage','orders','manage','Quản lý đơn hàng','2026-09-08 03:44:05','2026-09-08 03:44:05'),(8,'media.upload','media','upload','Upload media CDN','2026-09-08 03:44:05','2026-09-08 03:44:05'),(9,'reports.view','reports','view','Xem báo cáo','2026-09-08 03:44:05','2026-09-08 03:44:05');
/*!40000 ALTER TABLE `permissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `quiz_attempt_answers`
--

DROP TABLE IF EXISTS `quiz_attempt_answers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `quiz_attempt_answers` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `attempt_id` bigint NOT NULL,
  `question_id` bigint NOT NULL,
  `option_id` bigint DEFAULT NULL,
  `answer_text` varchar(2000) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_correct` tinyint NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_qaa_attempt` (`attempt_id`),
  KEY `fk_qaa_question` (`question_id`),
  KEY `fk_qaa_option` (`option_id`),
  CONSTRAINT `fk_qaa_attempt` FOREIGN KEY (`attempt_id`) REFERENCES `quiz_attempts` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_qaa_option` FOREIGN KEY (`option_id`) REFERENCES `quiz_options` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_qaa_question` FOREIGN KEY (`question_id`) REFERENCES `quiz_questions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=201 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `quiz_attempt_answers`
--

LOCK TABLES `quiz_attempt_answers` WRITE;
/*!40000 ALTER TABLE `quiz_attempt_answers` DISABLE KEYS */;
/*!40000 ALTER TABLE `quiz_attempt_answers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `quiz_attempts`
--

DROP TABLE IF EXISTS `quiz_attempts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `quiz_attempts` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `quiz_id` bigint NOT NULL,
  `user_id` bigint NOT NULL,
  `enrollment_id` bigint DEFAULT NULL,
  `score` decimal(5,2) NOT NULL DEFAULT '0.00',
  `passed` tinyint NOT NULL DEFAULT '0',
  `started_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `submitted_at` timestamp NULL DEFAULT NULL,
  `correct_count` int DEFAULT NULL,
  `total_questions` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_qa_quiz` (`quiz_id`),
  KEY `fk_qa_user` (`user_id`),
  KEY `fk_qa_enrollment` (`enrollment_id`),
  CONSTRAINT `fk_qa_enrollment` FOREIGN KEY (`enrollment_id`) REFERENCES `enrollments` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_qa_quiz` FOREIGN KEY (`quiz_id`) REFERENCES `quizzes` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_qa_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `quiz_attempts`
--

LOCK TABLES `quiz_attempts` WRITE;
/*!40000 ALTER TABLE `quiz_attempts` DISABLE KEYS */;
/*!40000 ALTER TABLE `quiz_attempts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `quiz_options`
--

DROP TABLE IF EXISTS `quiz_options`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `quiz_options` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `question_id` bigint NOT NULL,
  `option_text` varchar(1000) COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_correct` tinyint NOT NULL DEFAULT '0',
  `sort_order` int NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_qo_question` (`question_id`),
  CONSTRAINT `fk_qo_question` FOREIGN KEY (`question_id`) REFERENCES `quiz_questions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=987 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `quiz_options`
--

LOCK TABLES `quiz_options` WRITE;
/*!40000 ALTER TABLE `quiz_options` DISABLE KEYS */;
/*!40000 ALTER TABLE `quiz_options` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `quiz_questions`
--

DROP TABLE IF EXISTS `quiz_questions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `quiz_questions` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `quiz_id` bigint NOT NULL,
  `question` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `question_type` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'SINGLE_CHOICE',
  `points` int NOT NULL DEFAULT '1',
  `sort_order` int NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_qq_quiz` (`quiz_id`),
  CONSTRAINT `fk_qq_quiz` FOREIGN KEY (`quiz_id`) REFERENCES `quizzes` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `quiz_questions_chk_1` CHECK ((`question_type` in (_utf8mb4'SINGLE_CHOICE',_utf8mb4'MULTIPLE_CHOICE',_utf8mb4'TRUE_FALSE',_utf8mb4'SHORT_ANSWER')))
) ENGINE=InnoDB AUTO_INCREMENT=281 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `quiz_questions`
--

LOCK TABLES `quiz_questions` WRITE;
/*!40000 ALTER TABLE `quiz_questions` DISABLE KEYS */;
/*!40000 ALTER TABLE `quiz_questions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `quizzes`
--

DROP TABLE IF EXISTS `quizzes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `quizzes` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `lesson_id` bigint NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(1000) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `pass_score` int NOT NULL DEFAULT '70',
  `time_limit_seconds` int DEFAULT NULL,
  `max_attempts` int NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `lesson_id` (`lesson_id`),
  CONSTRAINT `fk_quizzes_lesson` FOREIGN KEY (`lesson_id`) REFERENCES `lessons` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `quizzes_chk_1` CHECK (((`pass_score` >= 0) and (`pass_score` <= 100)))
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `quizzes`
--

LOCK TABLES `quizzes` WRITE;
/*!40000 ALTER TABLE `quizzes` DISABLE KEYS */;
/*!40000 ALTER TABLE `quizzes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `refresh_tokens`
--

DROP TABLE IF EXISTS `refresh_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `refresh_tokens` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `token_hash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_agent` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `expires_at` timestamp NOT NULL,
  `revoked_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `token_hash` (`token_hash`),
  KEY `idx_refresh_user` (`user_id`),
  CONSTRAINT `fk_refresh_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `refresh_tokens`
--

LOCK TABLES `refresh_tokens` WRITE;
/*!40000 ALTER TABLE `refresh_tokens` DISABLE KEYS */;
/*!40000 ALTER TABLE `refresh_tokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `refunds`
--

DROP TABLE IF EXISTS `refunds`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `refunds` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `payment_id` bigint NOT NULL,
  `amount` decimal(12,2) NOT NULL,
  `reason` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PENDING',
  `provider_refund_id` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `processed_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_refunds_payment` (`payment_id`),
  CONSTRAINT `fk_refunds_payment` FOREIGN KEY (`payment_id`) REFERENCES `payments` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `refunds_chk_1` CHECK ((`status` in (_utf8mb4'PENDING',_utf8mb4'SUCCEEDED',_utf8mb4'FAILED')))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `refunds`
--

LOCK TABLES `refunds` WRITE;
/*!40000 ALTER TABLE `refunds` DISABLE KEYS */;
/*!40000 ALTER TABLE `refunds` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reviews`
--

DROP TABLE IF EXISTS `reviews`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reviews` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `course_id` bigint NOT NULL,
  `user_id` bigint NOT NULL,
  `rating` tinyint NOT NULL,
  `comment` text COLLATE utf8mb4_unicode_ci,
  `status` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PUBLISHED',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `course_id` (`course_id`,`user_id`),
  KEY `fk_reviews_user` (`user_id`),
  CONSTRAINT `fk_reviews_course` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_reviews_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `reviews_chk_1` CHECK ((`rating` between 1 and 5)),
  CONSTRAINT `reviews_chk_2` CHECK ((`status` in (_utf8mb4'PENDING',_utf8mb4'PUBLISHED',_utf8mb4'HIDDEN')))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reviews`
--

LOCK TABLES `reviews` WRITE;
/*!40000 ALTER TABLE `reviews` DISABLE KEYS */;
/*!40000 ALTER TABLE `reviews` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sepay_inboxes`
--

DROP TABLE IF EXISTS `sepay_inboxes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sepay_inboxes` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `account_number` varchar(40) DEFAULT NULL,
  `amount` decimal(12,2) NOT NULL,
  `content` varchar(1000) DEFAULT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `matched_order_code` varchar(40) DEFAULT NULL,
  `provider_txn_id` varchar(120) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKas9kltdtju01fr00v7ano613a` (`provider_txn_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sepay_inboxes`
--

LOCK TABLES `sepay_inboxes` WRITE;
/*!40000 ALTER TABLE `sepay_inboxes` DISABLE KEYS */;
/*!40000 ALTER TABLE `sepay_inboxes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `system_settings`
--

DROP TABLE IF EXISTS `system_settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `system_settings` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `setting_key` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `setting_value` text COLLATE utf8mb4_unicode_ci,
  `description` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `setting_key` (`setting_key`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `system_settings`
--

LOCK TABLES `system_settings` WRITE;
/*!40000 ALTER TABLE `system_settings` DISABLE KEYS */;
INSERT INTO `system_settings` VALUES (1,'site.name','LearnHub','Tên nền tảng','2026-09-08 03:44:05','2026-09-08 03:44:05'),(2,'site.currency','VND','Đơn vị tiền mặc định','2026-09-08 03:44:05','2026-09-08 03:44:05'),(3,'media.default_provider','BUNNY_CDN','Provider lưu trữ mặc định','2026-09-08 03:44:05','2026-09-08 03:44:05'),(4,'video.default_provider','BUNNY_STREAM','Provider video mặc định','2026-09-08 03:44:05','2026-09-08 03:44:05'),(5,'payment.default_provider','VNPAY','Cổng thanh toán mặc định','2026-09-08 03:44:05','2026-09-08 03:44:05');
/*!40000 ALTER TABLE `system_settings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tags`
--

DROP TABLE IF EXISTS `tags`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tags` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(80) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`),
  UNIQUE KEY `slug` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tags`
--

LOCK TABLES `tags` WRITE;
/*!40000 ALTER TABLE `tags` DISABLE KEYS */;
/*!40000 ALTER TABLE `tags` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_catalogues`
--

DROP TABLE IF EXISTS `user_catalogues`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_catalogues` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `canonical` varchar(50) NOT NULL,
  `publish` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_catalogues_canonical` (`canonical`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_catalogues`
--

LOCK TABLES `user_catalogues` WRITE;
/*!40000 ALTER TABLE `user_catalogues` DISABLE KEYS */;
INSERT INTO `user_catalogues` VALUES (1,'Quản trị','admin',1,'2026-09-12 17:02:34','2026-09-12 17:02:34'),(2,'Giảng viên','instructor',1,'2026-09-12 17:02:34','2026-09-12 17:02:34'),(3,'Học viên','user',1,'2026-09-12 17:02:34','2026-09-12 17:02:34');
/*!40000 ALTER TABLE `user_catalogues` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `firebase_uid` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_catalogue_id` bigint DEFAULT NULL,
  `username` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `address` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `images` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `full_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `bio` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ACTIVE',
  `email_verified` bit(1) NOT NULL,
  `last_login_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `role` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'USER',
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `phone` (`phone`),
  UNIQUE KEY `images` (`images`),
  UNIQUE KEY `firebase_uid` (`firebase_uid`),
  KEY `fk_users_user_catalogue` (`user_catalogue_id`),
  CONSTRAINT `fk_user_catalogue_id` FOREIGN KEY (`user_catalogue_id`) REFERENCES `users_catalogues` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_users_user_catalogue` FOREIGN KEY (`user_catalogue_id`) REFERENCES `user_catalogues` (`id`),
  CONSTRAINT `users_chk_1` CHECK (((char_length(`phone`) >= 10) and (char_length(`phone`) <= 20))),
  CONSTRAINT `users_chk_2` CHECK (((char_length(`username`) >= 3) and (char_length(`username`) <= 255))),
  CONSTRAINT `users_chk_3` CHECK (((char_length(`password`) >= 8) and (char_length(`password`) <= 255))),
  CONSTRAINT `users_chk_4` CHECK (((char_length(`address`) >= 5) and (char_length(`address`) <= 255))),
  CONSTRAINT `users_chk_5` CHECK (((char_length(`images`) >= 5) and (char_length(`images`) <= 255))),
  CONSTRAINT `users_chk_6` CHECK (((char_length(`firebase_uid`) >= 5) and (char_length(`firebase_uid`) <= 255))),
  CONSTRAINT `users_chk_7` CHECK ((`status` in (_utf8mb4'ACTIVE',_utf8mb4'INACTIVE',_utf8mb4'BANNED',_utf8mb4'PENDING')))
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'seed-admin-001',1,'admin','admin@learnhub.local','$2a$10$y9JezN0vIilr8kjSuufW3eEqq5ZlrFuvNR2COJug9bv1xGMc53JRm','0901234567','12 Nguyen Hue, Quan 1, TP.HCM','https://cdn.learnhub.local/avatars/admin.png','LearnHub Admin','Quan tri vien he thong','ACTIVE',_binary '',NULL,NULL,'2026-09-08 08:42:25','2026-09-08 08:42:25','USER'),(2,'seed-instructor-001',3,'instructor','instructor@learnhub.local','$2a$10$y9JezN0vIilr8kjSuufW3eEqq5ZlrFuvNR2COJug9bv1xGMc53JRm','0901234568','25 Le Loi, Quan 1, TP.HCM','https://cdn.learnhub.local/avatars/instructor.png','Nguyen Van Giang','Giang vien lap trinh','ACTIVE',_binary '',NULL,NULL,'2026-09-08 08:42:25','2026-09-08 08:42:25','USER'),(3,'seed-student-001',3,'student','student@learnhub.local','$2a$10$y9JezN0vIilr8kjSuufW3eEqq5ZlrFuvNR2COJug9bv1xGMc53JRm','0901234569','48 Tran Hung Dao, Quan 5, TP.HCM','https://cdn.learnhub.local/avatars/student.png','Tran Thi Hoc','Hoc vien','ACTIVE',_binary '\0',NULL,NULL,'2026-09-08 08:42:25','2026-09-12 17:26:35','USER'),(4,'local-da5a7479-0f88-4f0e-9597-326127e42528',3,'minh','minh@gmail.com','$2a$10$dTtiLKQGuZKqc4G4N9FX2OESEpWY7DIkp.buxfMfnww/Tutq7AL8.','0999212815','Chưa cập nhật','default-26b6e923-5a3a-45b3-af59-1e806cf22a1f.png','Nguyễn MInh','','ACTIVE',_binary '\0',NULL,NULL,'2026-09-12 09:36:48','2026-09-12 17:26:35','USER'),(5,'local-fab1ee6d-9c35-401c-8cef-bbe04b941117',3,'hau123','hau123@gmail.com','$2a$10$nNxuJyu4lLF1tHuBvi7zG.WYFhemzpZvirTaazqfx/1tejBX/5l9C','0966226214','Chưa cập nhật','default-00bb4155-2340-4bd3-a1f2-9727635c7512.png','Hậu Lê','','ACTIVE',_binary '\0','2026-09-12 12:00:20',NULL,'2026-09-12 09:49:23','2026-09-12 12:00:20','USER'),(6,'local-f914381d-998e-4716-88c9-ab4012ee297a',1,'thienminh','thienminh@gmail.com','$2a$10$JmqxNgcMystz4yqwfdteFOw66o11o9jb8o1XzHMapJuKUXRUQRtLi','0918802381','Chưa cập nhật','default-aa53e4de-e486-45be-bc31-edd36bad0b1c.png','Thiên Minh','','ACTIVE',_binary '\0','2026-10-13 21:21:35',NULL,'2026-09-12 09:54:06','2026-10-13 21:21:35','ADMIN'),(7,'local-7ae5f34f-2fa7-4da9-aff7-719ed1010eb4',2,'lephuc','lephuc@gmail.com','$2a$10$qOas8ngOD8r4UeilL/03LeOAjnzzDSbWkpSoSKDtmJHDkYNyugR2i','0994584285','Chưa cập nhật','default-8da073af-daee-416f-8f67-9622096aedc6.png','Lê Phúc','','ACTIVE',_binary '\0',NULL,NULL,'2026-09-12 10:03:42','2026-09-12 10:03:42','INSTRUCTOR'),(8,'nQTm6Y9CGEer9wU7rRnkDEihLKk2',3,'hau99082005','hau99082005@gmail.com','$2a$10$IzMy7ennBLhtaryuxVEo.em22aTxMdQyKAhnww7hAooLXwMHQmKje','0955223486','Chưa cập nhật','google-nQTm6Y9CGEer9wU7rRnkDEihLKk2.png','Hậu Lê văn','','ACTIVE',_binary '','2026-09-13 09:02:53',NULL,'2026-09-13 09:02:53','2026-09-13 09:02:53','USER'),(9,'local-8a1b0acb-9e4a-4b75-a850-89d8fc737a30',2,'hien','hien@gmail.com','$2a$10$5kOVcpGqN0bF5vvGYtai1O7baWqwWu8oQyQoORDI6BCFB0slVOx1W','0966691709','Chưa cập nhật','default-7aecc08a-0714-46a3-921e-9f5054e3577c.png','Lê Hiền','','ACTIVE',_binary '\0','2026-09-13 09:14:47',NULL,'2026-09-13 09:04:00','2026-09-13 09:14:47','INSTRUCTOR'),(10,'mRJJVgmXqragRXtMWKtuISmBIep2',3,'thienminh200202','thienminh200202@gmail.com','$2a$10$MLbNH./qW9yZBzXhtie3/uO9nu/5fddf9aS5r4YZHVUO7WUxicrq.','0908600146','Chưa cập nhật','google-mRJJVgmXqragRXtMWKtuISmBIep2.png','minh Thien','','ACTIVE',_binary '','2026-09-13 09:04:19',NULL,'2026-09-13 09:04:19','2026-09-13 09:04:19','USER'),(11,'local-0bc31f3b-b115-4974-a389-adc1563c519e',3,'cart.test.1199314277','cart.test.1199314277@learnhub.local','$2a$10$0UDKqbXKpjImpDraD1R1XOAxHqHalJncX5waOYc6QWy/QGPuXWUuG','0924057501','Chưa cập nhật','default-f6637f6d-c80d-46c7-bb69-5000fd3d82ea.png','Hoc Vien Cart','','ACTIVE',_binary '\0','2026-09-22 08:08:10',NULL,'2026-09-22 08:06:15','2026-09-22 08:08:10','USER'),(12,'local-a52ed138-dbeb-46b9-84f9-a224bbf3cf62',3,'paytest461837','paytest461837@learnhub.test','$2a$10$pmRKjevVvE6l70AgantvTur2EtQ8B3NobhzyP.kAU1eEawtHoi4YG','0931942176','Chưa cập nhật','default-03466728-70fa-460f-88ec-70ddaecd6f9e.png','Pay Test','','ACTIVE',_binary '\0',NULL,NULL,'2026-09-22 08:38:14','2026-09-22 08:38:14','USER'),(13,'local-6be1c19c-b72a-4d9f-937b-239cb2a4cd70',3,'payui914312','payui914312@learnhub.test','$2a$10$m3MRcTWSz1JBJwc42qyDfeIUROCWy3KVaHHCtHKmGTESUDOJSTn.m','0962269642','Chưa cập nhật','default-bf615f69-826a-4050-a949-6b8421a5da03.png','Pay UI','','ACTIVE',_binary '\0',NULL,NULL,'2026-09-22 08:38:33','2026-09-22 08:38:33','USER'),(14,'local-ce8c5d77-2954-45d9-895b-628831eece26',3,'paymomo52664','paymomo52664@learnhub.test','$2a$10$JMaPI2eDz5PzlIWyJIGX0.qzeMgzUSKQxIwF1xHXjbfa3FPqJxruK','0939800805','Chưa cập nhật','default-2648f2c8-ed2b-457a-8543-f6a43feb7926.png','MoMo Test','','ACTIVE',_binary '\0',NULL,NULL,'2026-09-22 08:39:49','2026-09-22 08:39:49','USER'),(15,'6HApwA8EINcK21KzEkPb8fEYkOi2',3,'levanhau200508','levanhau200508@gmail.com','$2a$10$WszacJHie9WBQ5f.W0qpZ.rSKp9Own1uCA73isZw6zVFdOdbxDRlu','0969963432','Chưa cập nhật','google-6HApwA8EINcK21KzEkPb8fEYkOi2.png','Hậu Lê Văn','','ACTIVE',_binary '','2026-10-14 06:09:29',NULL,'2026-10-01 10:19:17','2026-10-14 06:09:29','USER'),(16,'local-c6d15e01-f6bd-4068-bd51-95d649f8146b',3,'player.verify','player.verify@learnhub.test','$2a$10$ztm.9h3YLAOxIDJQRVV9HOrVu2lCTR1EmiCTJraA.z/kb/hSuYTi2','0968715124','Chưa cập nhật','default-fec04738-f8bc-4280-b38c-b8ec3541e2fe.png','Player Test','','ACTIVE',_binary '\0',NULL,NULL,'2026-10-13 18:40:54','2026-10-13 18:40:54','USER'),(17,'Wpqz4FHWN2cVPEvaZbPMPDtppXi2',3,'lehau200522','lehau200522@gmail.com','$2a$10$KZPLrA8E8ybP5bU6VauZWuTSyNVMH3OCdzvSYB4vDSNw7zQKjHuAm','0959743998','Chưa cập nhật','google-Wpqz4FHWN2cVPEvaZbPMPDtppXi2.png','Hậu Lê','','ACTIVE',_binary '','2026-10-13 21:33:42',NULL,'2026-10-13 21:24:30','2026-10-13 21:33:42','USER'),(18,'eD3hFu9V8UNy9exVzx4RjoOCoSx1',1,'hau20050822','hau20050822@gmail.com','$2a$10$.TRu1NZrDpUVp.7zV2xv8eisFwZG78WGMSOJrUITo4/jsQrGKKNWG','0903173389','Chưa cập nhật','google-eD3hFu9V8UNy9exVzx4RjoOCoSx1.png','Hậu Lê Văn','','ACTIVE',_binary '','2026-10-16 17:36:12',NULL,'2026-10-13 21:38:36','2026-10-16 17:36:12','ADMIN'),(19,'local-3c66a5f2-2d3f-4b07-8f97-fa2d6e7f9a5d',3,'hau','hau@gmail.com','$2a$10$I9ONS50wlq540SqG01NeTutgDt5VrGhJcA0gJAebCdVwxLotacFfe','0930412669','Chưa cập nhật','default-4d53eed8-1f8e-4481-8d05-7e4e7682d75b.png','Hậu','','ACTIVE',_binary '\0','2026-10-14 06:45:20',NULL,'2026-10-14 06:10:01','2026-10-14 06:45:20','USER'),(20,'local-7220e933-f892-4ecb-843a-281b4be1caba',3,'thien','thien@gmail.com','$2a$10$WacdP.X6x5KPaQqAmSca4enghbDmQiHG9CqbeEwazHaIeIw1LLYj.','0980314438','Chưa cập nhật','default-187b2bba-fe7a-430a-b450-7bcd9ffd96dc.png','Thiên','','ACTIVE',_binary '\0',NULL,NULL,'2026-10-14 06:50:10','2026-10-14 06:50:10','USER'),(21,'local-7ef996b9-2a7e-40e7-9fcf-86b0eec893c5',2,'phuc','phuc@gmail.com','$2a$10$LyzhpjtNwn2k0Vr/sp3rS.km6Q0Cn27fqWCvEHqXsLtxD9fIBljJW','0967528794','Chưa cập nhật','default-c58c1d0d-6eee-4229-b918-e24426793046.png','Phúc','','ACTIVE',_binary '\0','2026-10-14 08:20:44',NULL,'2026-10-14 07:03:06','2026-10-14 08:20:44','INSTRUCTOR'),(22,'local-d390c578-569e-4cb2-9d16-2951a12873ad',3,'nguyen','nguyen@gmail.com','$2a$10$oVgDnmcO62z///dnsT.hIeCZFuAZ6FaRSBXOgIFEFEhyfjCTjm9rq','0938120548','Chưa cập nhật','default-2b53108e-18ce-4846-a98a-7d39bfa998f7.png','Nguyên','','ACTIVE',_binary '\0','2026-10-14 08:46:36',NULL,'2026-10-14 08:22:20','2026-10-14 08:46:36','USER'),(23,'local-0f2d3b8b-c48f-428a-a083-7a372d765a96',2,'minh123','minh123@gmail.com','$2a$10$POze5mVAbQoqDq82saAsiuVOO7QBWQgTzvAmAw/gk6fIBu9NKTo.u','0984536334','73 phan dinh phung, 70 nguyen hue','default-485eb076-a073-4d2d-ad46-a8e620d34c8d.png','MINH','','ACTIVE',_binary '\0','2026-10-16 16:55:51',NULL,'2026-10-14 15:23:57','2026-10-16 16:55:51','INSTRUCTOR');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users_catalogue_permissions`
--

DROP TABLE IF EXISTS `users_catalogue_permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users_catalogue_permissions` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_catalogue_id` bigint NOT NULL,
  `permission_id` bigint NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_catalogue_id` (`user_catalogue_id`,`permission_id`),
  KEY `fk_ucp_permission` (`permission_id`),
  CONSTRAINT `fk_ucp_catalogue` FOREIGN KEY (`user_catalogue_id`) REFERENCES `users_catalogues` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_ucp_permission` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=35 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users_catalogue_permissions`
--

LOCK TABLES `users_catalogue_permissions` WRITE;
/*!40000 ALTER TABLE `users_catalogue_permissions` DISABLE KEYS */;
INSERT INTO `users_catalogue_permissions` VALUES (1,1,4,'2026-09-08 03:44:05'),(2,1,5,'2026-09-08 03:44:05'),(3,1,3,'2026-09-08 03:44:05'),(4,1,8,'2026-09-08 03:44:05'),(5,1,7,'2026-09-08 03:44:05'),(6,1,6,'2026-09-08 03:44:05'),(7,1,9,'2026-09-08 03:44:05'),(8,1,2,'2026-09-08 03:44:05'),(9,1,1,'2026-09-08 03:44:05'),(16,2,4,'2026-09-08 03:44:05'),(17,2,5,'2026-09-08 03:44:05'),(18,2,3,'2026-09-08 03:44:05'),(19,2,8,'2026-09-08 03:44:05'),(20,2,7,'2026-09-08 03:44:05'),(21,2,6,'2026-09-08 03:44:05'),(22,2,9,'2026-09-08 03:44:05'),(23,2,2,'2026-09-08 03:44:05'),(24,2,1,'2026-09-08 03:44:05'),(31,3,4,'2026-09-08 03:44:05'),(32,3,3,'2026-09-08 03:44:05'),(33,3,8,'2026-09-08 03:44:05'),(34,4,3,'2026-09-08 03:44:05');
/*!40000 ALTER TABLE `users_catalogue_permissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users_catalogues`
--

DROP TABLE IF EXISTS `users_catalogues`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users_catalogues` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`),
  CONSTRAINT `users_catalogues_chk_1` CHECK (((char_length(`name`) >= 3) and (char_length(`name`) <= 50)))
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users_catalogues`
--

LOCK TABLES `users_catalogues` WRITE;
/*!40000 ALTER TABLE `users_catalogues` DISABLE KEYS */;
INSERT INTO `users_catalogues` VALUES (1,'Super Admin','Toàn quyền hệ thống','2026-09-08 03:44:05','2026-09-08 03:44:05'),(2,'Admin','Quản trị nội dung và người dùng','2026-09-08 03:44:05','2026-09-08 03:44:05'),(3,'Instructor','Giảng viên tạo và dạy khóa học','2026-09-08 03:44:05','2026-09-08 03:44:05'),(4,'Student','Học viên','2026-09-08 03:44:05','2026-09-08 03:44:05');
/*!40000 ALTER TABLE `users_catalogues` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `webhook_events`
--

DROP TABLE IF EXISTS `webhook_events`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `webhook_events` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `source` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `event_id` varchar(128) COLLATE utf8mb4_unicode_ci NOT NULL,
  `event_type` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `payload` json NOT NULL,
  `status` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PENDING',
  `error_message` varchar(1000) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `processed_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `source` (`source`,`event_id`),
  CONSTRAINT `webhook_events_chk_1` CHECK ((`source` in (_utf8mb4'FIREBASE',_utf8mb4'BUNNY',_utf8mb4'AWS',_utf8mb4'VNPAY',_utf8mb4'MOMO',_utf8mb4'STRIPE',_utf8mb4'GATEWAY'))),
  CONSTRAINT `webhook_events_chk_2` CHECK ((`status` in (_utf8mb4'PENDING',_utf8mb4'PROCESSED',_utf8mb4'FAILED',_utf8mb4'IGNORED')))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `webhook_events`
--

LOCK TABLES `webhook_events` WRITE;
/*!40000 ALTER TABLE `webhook_events` DISABLE KEYS */;
/*!40000 ALTER TABLE `webhook_events` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `wishlists`
--

DROP TABLE IF EXISTS `wishlists`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `wishlists` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `course_id` bigint NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`user_id`,`course_id`),
  UNIQUE KEY `UKlclcbuwpdp9s40mu8ayo8pv0l` (`user_id`,`course_id`),
  KEY `fk_wish_course` (`course_id`),
  CONSTRAINT `fk_wish_course` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_wish_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `wishlists`
--

LOCK TABLES `wishlists` WRITE;
/*!40000 ALTER TABLE `wishlists` DISABLE KEYS */;
/*!40000 ALTER TABLE `wishlists` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-10-17  1:00:51
