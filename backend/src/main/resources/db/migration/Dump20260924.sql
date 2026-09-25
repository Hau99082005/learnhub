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
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cart_items`
--

LOCK TABLES `cart_items` WRITE;
/*!40000 ALTER TABLE `cart_items` DISABLE KEYS */;
INSERT INTO `cart_items` VALUES (2,2,3,50000.00,'2026-09-22 08:14:42'),(3,2,5,20000.00,'2026-09-22 08:15:06'),(4,2,4,30000.00,'2026-09-22 08:15:54'),(5,3,5,20000.00,'2026-09-22 08:38:14'),(6,4,5,20000.00,'2026-09-22 08:38:33'),(7,5,5,20000.00,'2026-09-22 08:38:33'),(8,6,5,20000.00,'2026-09-22 08:39:49');
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
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `carts`
--

LOCK TABLES `carts` WRITE;
/*!40000 ALTER TABLE `carts` DISABLE KEYS */;
INSERT INTO `carts` VALUES (1,11,'ACTIVE','2026-09-22 08:08:27','2026-09-22 08:08:27'),(2,6,'ACTIVE','2026-09-22 08:14:42','2026-09-22 08:14:42'),(3,12,'CHECKED_OUT','2026-09-22 08:38:14','2026-09-22 08:38:14'),(4,13,'CHECKED_OUT','2026-09-22 08:38:33','2026-09-22 08:38:33'),(5,13,'ACTIVE','2026-09-22 08:38:33','2026-09-22 08:38:33'),(6,14,'CHECKED_OUT','2026-09-22 08:39:49','2026-09-22 08:39:49');
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
  PRIMARY KEY (`id`),
  UNIQUE KEY `enrollment_id` (`enrollment_id`),
  UNIQUE KEY `certificate_code` (`certificate_code`),
  KEY `fk_cert_media` (`media_id`),
  CONSTRAINT `fk_cert_enrollment` FOREIGN KEY (`enrollment_id`) REFERENCES `enrollments` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_cert_media` FOREIGN KEY (`media_id`) REFERENCES `media_assets` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `coupon_usages`
--

LOCK TABLES `coupon_usages` WRITE;
/*!40000 ALTER TABLE `coupon_usages` DISABLE KEYS */;
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `coupons`
--

LOCK TABLES `coupons` WRITE;
/*!40000 ALTER TABLE `coupons` DISABLE KEYS */;
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
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `course_sections`
--

LOCK TABLES `course_sections` WRITE;
/*!40000 ALTER TABLE `course_sections` DISABLE KEYS */;
INSERT INTO `course_sections` VALUES (4,5,'01 Giới thiệu tổng quan',NULL,0,'2026-09-21 10:22:53','2026-09-21 10:22:53'),(5,5,'02 Lombok',NULL,1,'2026-09-21 10:46:01','2026-09-21 10:46:01'),(6,5,'03 Auto Configuration (Cấu hình tự động)',NULL,2,'2026-09-21 10:49:55','2026-09-21 10:49:55'),(7,5,'04 Dependency Injection (DI) trong Spring',NULL,3,'2026-09-21 10:50:48','2026-09-21 10:50:48'),(8,5,'05 Cấu hình Spring beans bằng Java',NULL,4,'2026-09-21 10:51:54','2026-09-21 10:51:54'),(9,5,'06 AI Tool Github Copilot',NULL,5,'2026-09-21 10:52:35','2026-09-21 10:52:35'),(10,5,'07 Spring Web MVC',NULL,6,'2026-09-21 16:42:06','2026-09-21 16:42:06'),(11,5,'08 Spring Web MVC Controller',NULL,7,'2026-09-21 16:43:21','2026-09-21 16:43:21'),(12,5,'09 Template engine Thymeleaf',NULL,8,'2026-09-21 16:52:24','2026-09-21 16:52:24'),(13,5,'10 Template Engine Thymeleaf Fragment',NULL,9,'2026-09-21 16:53:08','2026-09-21 16:53:08'),(14,4,'Next.js 15 & Firebase',NULL,0,'2026-09-21 16:54:12','2026-09-21 16:54:12'),(15,3,'GenAI for Flutter - Claude, ChatGPT, Perplexity, Grok & More',NULL,0,'2026-09-22 07:24:42','2026-09-22 07:24:42');
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
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `courses`
--

LOCK TABLES `courses` WRITE;
/*!40000 ALTER TABLE `courses` DISABLE KEYS */;
INSERT INTO `courses` VALUES (3,6,1,'GenAI for Flutter - Claude, ChatGPT, Perplexity, Grok & More','genai-for-flutter-claude-chatgpt-perplexity-grok-more','Master GenAI use in Flutter - Build 10+ AI Apps with Perplexity, Grok, ChatGPT, Claude, Gemini & DeepSeek use in Flutter','Build 10+ AI-Powered Flutter Apps Using Every Major AI Platform - Complete Hands-On Course\r\n\r\nTransform your Flutter development skills and master AI integration with this comprehensive course that teaches you to build custom chatbots and intelligent assistant apps using all major generative AI platforms. Learn to harness the power of ChatGPT, Claude, Gemini, Grok, Perplexity, and DeepSeek to create specialized AI applications that solve real-world problems.\r\n\r\nWhat You\'ll Build:\r\n\r\nPlatform-Specific AI Applications:\r\n\r\nClaude Writing Coach - Leverage Claude\'s superior writing capabilities for content creation and editing assistance\r\n\r\nGrok Fact Checker - Utilize real-time data access for instant fact verification and news validation\r\n\r\nPerplexity Research Assistant - Build a powerful research tool using advanced search and analysis features\r\n\r\nChatGPT Super App - Create a comprehensive app with text, image, document, and audio AI features\r\n\r\nGemini Multi-Purpose Suite - Develop a diet meal planner, customer support bot, and language tutor\r\n\r\nDeepSeek Medical Advisor & Resume Builder - Specialized healthcare guidance and professional resume creation tools\r\n\r\nAdvanced Flutter AI Features:\r\n\r\nText-to-Speech (TTS) integration for natural voice responses\r\n\r\nSpeech Recognition for voice-activated AI interactions\r\n\r\nMulti-modal AI support (text, chat, image, audio, document, video)\r\n\r\nReal-time AI streaming responses\r\n\r\nCustom UI/UX for each AI platform\'s strengths\r\n\r\nCross-platform deployment (iOS & Android)\r\n\r\nComplete Learning Path:\r\n\r\nFlutter Environment Setup:\r\n\r\nWindows development environment configuration\r\n\r\nmacOS development environment setup\r\n\r\nIDE optimization for AI development\r\n\r\nPlatform-specific SDK installation and configuration\r\n\r\nAI Platform Integration:\r\n\r\nOpenAI ChatGPT - GPT-4, DALL-E, Whisper API integration\r\n\r\nAnthropic Claude - Advanced reasoning and writing assistance\r\n\r\nGoogle Gemini - Multi-modal AI capabilities and Google ecosystem\r\n\r\nX-AI Grok - Real-time information and social media insights\r\n\r\nPerplexity AI - Internet-connected search and research\r\n\r\nDeepSeek - Cost-effective AI with specialized capabilities\r\n\r\nTechnical Skills Covered:\r\n\r\nRESTful API integration with HTTP clients\r\n\r\nAsynchronous programming with Dart Futures and Streams\r\n\r\nState management for AI applications (Provider, Riverpod, or Bloc)\r\n\r\nCustom Flutter widgets for AI interfaces\r\n\r\nError handling and retry mechanisms for API calls\r\n\r\nLocal storage and caching strategies\r\n\r\nAudio recording and playback implementation\r\n\r\nImage processing and display optimization\r\n\r\nDocument parsing and text extraction\r\n\r\nVideo handling and multimedia integration\r\n\r\nKey Learning Outcomes:\r\n\r\nMaster AI Integration - Learn to integrate and optimize every major AI platform in Flutter apps Build Production-Ready Apps - Create polished, user-friendly AI applications ready for app stores Platform-Specific Optimization - Understand each AI platform\'s strengths and build specialized use cases Advanced Flutter Skills - Master complex UI/UX patterns, state management, and multimedia handling Real-World Problem Solving - Develop AI solutions for writing, research, fact-checking, health, and more Cross-Platform Development - Deploy your AI apps on both iOS and Android platforms Voice & Speech Integration - Implement natural voice interactions in your AI applications Multi-Modal AI Development - Work with text, image, audio, document, and video AI models\r\n\r\nPerfect For:\r\n\r\nFlutter Developers looking to add AI capabilities to their skill set\r\n\r\nMobile App Developers wanting to build cutting-edge AI applications\r\n\r\nEntrepreneurs seeking to create AI-powered mobile solutions\r\n\r\nStudents & Professionals interested in practical AI application development\r\n\r\nAnyone wanting to build custom chatbots and AI assistants without backend complexity\r\n\r\nPrerequisites:\r\n\r\nBasic Flutter and Dart knowledge\r\n\r\nUnderstanding of mobile app development concepts\r\n\r\nNo prior AI/ML experience required - we start from fundamentals\r\n\r\nCourse Highlights:\r\n\r\n13+ Hours of hands-on video content\r\n\r\n10+ Complete AI Applications built from scratch\r\n\r\nSource Code for all projects included\r\n\r\nStep-by-Step Tutorials for environment setup on Windows & Mac\r\n\r\nReal API Integration with live AI services\r\n\r\nBest Practices for production AI app development\r\n\r\nDeployment Guides for app store submission\r\n\r\nStart building the future of mobile AI applications today! Join thousands of developers who are already creating intelligent, voice-enabled, and multi-modal AI experiences in Flutter.\r\n\r\nNhững kiến thức bạn sẽ học\r\nMaster ChatGPT, Claude, Gemini, DeepSeek, Grok & Perplexity API integration in Flutter applications\r\nBuild 10+ production-ready AI chatbots and assistant apps from scratch using real-world projects\r\nImplement text-to-speech (TTS) and speech recognition features for voice-enabled AI interactions\r\nCreate multi-modal AI applications supporting text, image, audio, document, and video processing\r\nDevelop a Writing Coach app using Claude\'s advanced writing and editing capabilities\r\nBuild a Real-time Fact Checker using Grok\'s live data access and verification features\r\nCreate a Research Assistant bot leveraging Perplexity\'s internet search and analysis powers\r\nDesign a comprehensive ChatGPT Super App with text, image, document, and audio AI features\r\nConstruct a Diet Meal Planner and Language Tutor using Gemini\'s multi-modal capabilities\r\nBuild a Medical Advisor and Resume Builder using DeepSeek\'s specialized AI models\r\nDevelop a Customer Support Bot with natural language processing and automated responses\r\nCreate AI-powered content creation tools for writing, editing, and document generation\r\nUnderstand each AI platform\'s pricing, rate limits, and cost optimization strategies\r\nLearn when to use specific AI platforms based on their unique strengths and capabilities\r\nCreate responsive and adaptive UI designs that work across different device sizes and orientations\r\nCó bất kỳ yêu cầu hoặc điều kiện tiên quyết nào về khóa học không?\r\nA computer running Windows 10/11 or macOS (Intel or Apple Silicon) for Flutter development\r\nNo prior AI or Machine Learning experience required - we start from fundamentals\r\nEnthusiasm to learn cutting-edge AI integration techniques in mobile development\r\nĐối tượng của khóa học này:\r\nFlutter beginners with basic to intermediate experience who want to integrate cutting-edge AI capabilities\r\nMobile developers seeking to increase their market value with in-demand AI development expertise\r\nFreelancers and consultants looking to offer AI chatbot and assistant app development services\r\nMobile app developers looking to build the next generation of intelligent, AI-powered applications\r\nStartup founders who want to build AI-powered mobile products without hiring expensive AI specialists\r\nComputer science students interested in practical AI application development beyond theory\r\nWeb developers wanting to transition into mobile AI development with transferable programming skills\r\nIT professionals seeking to pivot into the high-growth AI development sector\r\nHealthcare IT professionals wanting to build AI-powered medical advisor and health assistant apps','vi','BEGINNER','PUBLISHED',50000.00,100000.00,'VND',_binary '\0',_binary '',15153,0,0.00,0,'[]','[]','2026-09-21 05:04:41',NULL,'2026-09-21 05:04:41','2026-09-22 07:29:31','/uploads/courses/c40891b6-9015-4110-93d3-e980c4e64f4f.jfif','/api/media/videos/n0/11834e7f-edf5-4ccf-997c-db02f10e9966.mp4'),(4,6,1,'Next.js 15 & Firebase','next-js-15-firebase','Build a Real Estate App with Next.js 15 + Firebase (with Firestore, Auth, Storage, User Roles, TypeScript, Zod + more!)','Take your web development skills to the next level! In this course we’ll build Fire Homes, a fully functional real estate application for a fictional real estate agency. By combining the power of Next.js 15 and Firebase, you’ll gain real-world experience building modern, scalable applications with cutting-edge tools.\r\n\r\nThis course covers everything you need to know to build a professional grade app, including authentication, cloud storage, and a Firestore powered database.\r\n\r\nWhat You’ll Build:\r\n\r\nA complete real estate app packed with the following features:\r\n\r\nUser Roles: Support for admin and non-admin users, with role-specific functionality.\r\n\r\nAuthentication: Log in or register using email/password or Google authentication.\r\n\r\nAdmin Dashboard: Manage property listings (add, delete, and update) through an intuitive interface.\r\n\r\nCloud Storage: Upload and manage property images with Firebase Cloud Storage.\r\n\r\nFirestore Database: Store and retrieve property data.\r\n\r\nProperty Search: Help users find their perfect home with search functionality.\r\n\r\nFavorites: Allow non-admin users to save and manage their favorite properties.\r\n\r\nWhat You’ll Learn:\r\n\r\nNext.js 15: Build modern web applications with the latest App Router.\r\n\r\nTypeScript: Write clean, maintainable, and error-resistant code.\r\n\r\nZod for Validation: Ensure data integrity with powerful validation tools.\r\n\r\nNext.js Server Actions: Simplify server-side functionality with cutting-edge features.\r\n\r\nFirebase Integration:\r\n\r\nFirestore: Use Firestore to store and retrieve data.\r\n\r\nAuthentication: Securely log in users using Firebase Auth.\r\n\r\nCloud Storage: Handle image uploads and organization seamlessly.\r\n\r\nRole-Based Access Control: Implement robust user management with tailored functionality for admins and regular users.\r\n\r\nCRUD Operations: Create, read, update, and delete property listings in Firestore.\r\n\r\nUser-Focused Features: Add search and favorites for an engaging user experience.\r\n\r\nWho Is This Course For?\r\n\r\nAspiring Developers: Learn to build your first full-stack app with Next.js and Firebase.\r\n\r\nIntermediate Web Developers: Gain deeper knowledge of scalable app development.\r\n\r\nCareer Switchers: Build a portfolio project that demonstrates modern web development skills.\r\n\r\nWhy Enroll in This Course?\r\n\r\nThis course isn’t just about coding - it’s about understanding the thought process behind building scalable, efficient apps. By the end of the course, you’ll have a production-ready app and the confidence to tackle your own projects.\r\n\r\nTools You’ll Use:\r\n\r\nNext.js 15 (App Router)\r\n\r\nTypeScript\r\n\r\nZod\r\n\r\nFirestore Database\r\n\r\nFirebase Authentication & Cloud Storage\r\n\r\nNhững kiến thức bạn sẽ học\r\nIncrease your value and improve your knowledge as a web developer\r\nImplement Secure Authentication with Firebase Auth\r\nBuild and Manage Databases with Firebase Firestore\r\nStore and Manage files with Firebase Cloud Storage\r\nMaster the integration of TypeScript, shadcn/ui, Tailwind CSS, Zod, and React Hook Form to build robust, type-safe, and user-friendly applications\r\nProtect specific routes to ensure that only authenticated users have access to certain parts of their application\r\nCó bất kỳ yêu cầu hoặc điều kiện tiên quyết nào về khóa học không?\r\nWillingness to Learn and Experiment: A proactive attitude and eagerness to explore new technologies, such as Firebase, TypeScript, and database management, will help students get the most out of the course\r\nA basic understanding of React is required, as the course builds upon React concepts and integrates them with Next JS\r\nFamiliarity with Node and NPM is recommended for managing dependencies and running development environments\r\nĐối tượng của khóa học này:\r\nThis course is ideal for web developers who want to increase their value as a web developer and enhance their skills in building websites and apps using modern tools and technologies like Next JS 15 and Firebase','vi','ALL','PUBLISHED',30000.00,1000000.00,'VND',_binary '\0',_binary '',55477,0,0.00,0,'[]','[]','2026-09-21 05:07:07',NULL,'2026-09-21 05:07:08','2026-09-21 17:02:02','/uploads/courses/80b644d4-bc88-40ad-b851-b6fce8ca5a08.jfif','/api/media/videos/n0/c67287b7-174c-4a0a-9a85-40cd4541b151.mp4'),(5,6,1,'Lập trình Spring Boot và Spring Data JPA với Github Copilot','lap-trinh-spring-boot-va-spring-data-jpa-voi-github-copilot','Làm chủ Spring Boot & Spring Data JPA qua thực hành thực tế với hỗ trợ từ GitHub Copilot.','Khóa học “Lập trình Spring Boot và Spring Data JPA với GitHub Copilot” được thiết kế dành cho những lập trình viên muốn nắm vững nền tảng của Spring Boot, Spring Data JPA và tăng tốc năng suất làm việc với sự hỗ trợ của GitHub Copilot. Thông qua hệ thống bài học trực quan, ví dụ thực tế và từng bước hướng dẫn, bạn sẽ hiểu sâu cách xây dựng ứng dụng Java hiện đại, sạch và hiệu quả.\r\n\r\nKhóa học bao gồm toàn bộ kiến thức từ cơ bản đến nâng cao: cách định nghĩa JPA Entity, sử dụng Repository & Service theo chuẩn Spring, thiết lập và quản lý mối quan hệ giữa các Entity, xử lý khóa chính, kế thừa, auditing, locking, truy vấn JPQL, native query, join, NamedQuery, query methods, phân trang, sắp xếp, Stored Procedure và quản lý giao dịch.\r\n\r\nBên cạnh đó, bạn sẽ được hướng dẫn cách kết hợp GitHub Copilot để tự động gợi ý code, giảm sai sót và tăng tốc phát triển phần mềm. Đây là khóa học thực hành, tập trung vào ví dụ sát thực tế, giúp bạn tự tin áp dụng Spring Boot và JPA vào dự án doanh nghiệp.\r\n\r\nSau khi hoàn thành khóa học, bạn sẽ có khả năng:\r\n\r\nHiểu và sử dụng thành thạo Spring Data JPA trong dự án\r\n\r\nTối ưu hiệu năng truy vấn và tổ chức entity đúng chuẩn\r\n\r\nÁp dụng đúng các loại query: JPQL, native query, join, NamedQuery\r\n\r\nXây dựng API chuyên nghiệp với phân trang, sắp xếp, transaction\r\n\r\nKhai thác GitHub Copilot để lập trình nhanh và hiệu quả\r\n\r\nTự tin xây dựng backend hoàn chỉnh với Spring Boot\r\n\r\nĐối tượng của khóa học này:\r\nSinh viên CNTT đam mê và lựa chọn lập trình Java và Spring\r\nCác nhà phát triển ứng dụng Java và Spring muốn chuyên sâu về Spring Data JPA\r\nCác nhà phát triển mong muốn ứng dụng AI Tool: Github Copilot tăng tốc hiệu quả','vi','BEGINNER','PUBLISHED',20000.00,120000.00,'VND',_binary '\0',_binary '',42191,0,0.00,0,'[]','[]','2026-09-21 09:45:03',NULL,'2026-09-21 09:45:03','2026-09-21 16:53:27','/uploads/courses/a154487a-20c3-4bff-a216-b7631dbcc342.jfif','/api/media/videos/n0/f5169b65-890a-45ef-a1da-aafbe4e36deb.mp4');
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
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `enrollments`
--

LOCK TABLES `enrollments` WRITE;
/*!40000 ALTER TABLE `enrollments` DISABLE KEYS */;
INSERT INTO `enrollments` VALUES (1,12,5,1,'PURCHASE','ACTIVE',0.00,'2026-09-22 08:38:13',NULL,NULL,'2026-09-22 08:38:13','2026-09-22 08:38:13');
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
INSERT INTO `flyway_schema_history` VALUES (1,'1','init','SQL','V1__schema.sql',1335090721,'root','2026-09-08 03:44:05',1287,1),(2,'2','create banners','SQL','V2__create_banners.sql',-623752506,'root','2026-09-12 02:49:15',432,1),(3,'3','add user role','SQL','V3__add_user_role.sql',2041410524,'root','2026-09-12 10:02:30',431,1),(4,'4','create user catalogues','SQL','V4__create_user_catalogues.sql',-943375611,'root','2026-09-12 10:02:30',432,1),(5,'5','simplify banners','SQL','V5__simplify_banners.sql',-593186357,'root','2026-09-12 15:50:59',92,1),(6,'6','simplify categories','SQL','V6__simplify_categories.sql',487306340,'root','2026-09-12 17:06:31',621,1),(7,'7','fix user catalogue fk','SQL','V7__fix_user_catalogue_fk.sql',2093448103,'root','2026-09-12 17:26:36',305,1),(8,'8','instructor studio','SQL','V8__instructor_studio.sql',1151875697,'root','2026-09-13 17:25:33',353,1),(9,'9','create news and newsblogs','SQL','V9__create_news_and_newsblogs.sql',1428415884,'root','2026-09-15 07:44:45',373,1),(10,'10','expand courses','SQL','V10__expand_courses.sql',-1603120702,'root','2026-09-20 21:47:14',68,1);
/*!40000 ALTER TABLE `flyway_schema_history` ENABLE KEYS */;
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
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `instructor_onboarding`
--

LOCK TABLES `instructor_onboarding` WRITE;
/*!40000 ALTER TABLE `instructor_onboarding` DISABLE KEYS */;
INSERT INTO `instructor_onboarding` VALUES (1,6,'truc-tiep-chuyen-mon','moi-bat-dau','nhom-nho','2026-09-14 00:32:17','2026-09-14 20:32:44');
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
) ENGINE=InnoDB AUTO_INCREMENT=236 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `lessons`
--

LOCK TABLES `lessons` WRITE;
/*!40000 ALTER TABLE `lessons` DISABLE KEYS */;
INSERT INTO `lessons` VALUES (9,4,2,'001 Tổng quan về Spring Framework','001-tong-quan-ve-spring-framework','VIDEO',NULL,1196,0,0,1,'2026-09-21 10:34:21','2026-09-21 10:34:21'),(10,4,3,'002 Spring Boot','002-spring-boot','VIDEO',NULL,483,1,0,1,'2026-09-21 10:36:14','2026-09-21 10:36:14'),(11,4,4,'003 Cài đặt JDK','003-cai-dat-jdk','VIDEO',NULL,199,2,0,1,'2026-09-21 10:40:32','2026-09-21 10:40:32'),(12,4,5,'004 Cài đặt Spring Tool 4 for Visual Studio Code','004-cai-dat-spring-tool-4-for-visual-studio-code','VIDEO',NULL,647,3,0,1,'2026-09-21 10:40:54','2026-09-21 10:40:54'),(13,4,6,'005 Tạo dự án bằng Spring Initializr và mở trong Visual Studio Code','005-tao-du-an-bang-spring-initializr-va-mo-trong-visual-studio-code','VIDEO',NULL,393,4,0,1,'2026-09-21 10:42:46','2026-09-21 10:42:46'),(14,4,7,'006 Tạo dự án Spring Boot trong Visual Studio Code','006-tao-du-an-spring-boot-trong-visual-studio-code','VIDEO',NULL,273,5,0,1,'2026-09-21 10:43:05','2026-09-21 10:43:05'),(15,4,8,'007 Tích hợp Github Copilot với Visual Studio Code','007-tich-hop-github-copilot-voi-visual-studio-code','VIDEO',NULL,727,6,0,1,'2026-09-21 10:43:17','2026-09-21 10:43:17'),(16,5,9,'001 Dự án Lombok','001-du-an-lombok','VIDEO',NULL,264,0,0,1,'2026-09-21 10:46:21','2026-09-21 10:46:21'),(17,5,10,'002 Tạo Getters và Setters','002-tao-getters-va-setters','VIDEO',NULL,280,1,0,1,'2026-09-21 10:48:41','2026-09-21 10:48:41'),(18,5,11,'003 Tạo hàm tạo (Constructors)','003-tao-ham-tao-constructors','VIDEO',NULL,227,2,0,1,'2026-09-21 10:48:42','2026-09-21 10:48:42'),(19,5,12,'004 Tạo phương thức toString, equals, hashCode','004-tao-phuong-thuc-tostring-equals-hashcode','VIDEO',NULL,475,3,0,1,'2026-09-21 10:48:44','2026-09-21 10:48:44'),(20,5,13,'005 Kiểm tra giá trị null','005-kiem-tra-gia-tri-null','VIDEO',NULL,239,4,0,1,'2026-09-21 10:48:46','2026-09-21 10:48:46'),(21,5,14,'006 Lombok Builder','006-lombok-builder','VIDEO',NULL,453,5,0,1,'2026-09-21 10:48:48','2026-09-21 10:48:48'),(22,5,15,'007 Lombok Logging','007-lombok-logging','VIDEO',NULL,838,6,0,1,'2026-09-21 10:48:54','2026-09-21 10:48:54'),(23,6,16,'001 Auto Configuration (Cấu hình tự động)','001-auto-configuration-cau-hinh-tu-dong','VIDEO',NULL,611,0,0,1,'2026-09-21 10:50:08','2026-09-21 10:50:08'),(24,6,17,'002 applicationproperties và applicationyml','002-applicationproperties-va-applicationyml','VIDEO',NULL,562,1,1,1,'2026-09-21 10:50:10','2026-09-21 10:50:22'),(25,6,18,'003 Tự tạo Auto Configuration riêng','003-tu-tao-auto-configuration-rieng','VIDEO',NULL,491,2,0,1,'2026-09-21 10:50:14','2026-09-21 10:50:14'),(26,6,19,'004 Ưu và nhược điểm của Auto Configuration','004-uu-va-nhuoc-diem-cua-auto-configuration','VIDEO',NULL,57,3,0,1,'2026-09-21 10:50:14','2026-09-21 10:50:14'),(27,6,20,'005 Spring Boot Developer Tools (DevTools)','005-spring-boot-developer-tools-devtools','VIDEO',NULL,395,4,0,1,'2026-09-21 10:50:17','2026-09-21 10:50:17'),(28,7,21,'001 Dependency Injection (DI) trong Spring','001-dependency-injection-di-trong-spring','VIDEO',NULL,420,0,0,1,'2026-09-21 10:51:07','2026-09-21 10:51:07'),(29,7,22,'002 Spring Application Context','002-spring-application-context','VIDEO',NULL,708,1,0,1,'2026-09-21 10:51:10','2026-09-21 10:51:10'),(30,7,23,'003 Tạo Spring Beans và thực hiện DI qua trường (Fields)','003-tao-spring-beans-va-thuc-hien-di-qua-truong-fields','VIDEO',NULL,889,2,0,1,'2026-09-21 10:51:15','2026-09-21 10:51:15'),(31,7,24,'004 Tạo Spring Beans và thực hiện DI qua hàm tạo','004-tao-spring-beans-va-thuc-hien-di-qua-ham-tao','VIDEO',NULL,398,3,0,1,'2026-09-21 10:51:19','2026-09-21 10:51:19'),(32,7,25,'005 Tạo Spring Beans và thực hiện DI qua phương thức Setters','005-tao-spring-beans-va-thuc-hien-di-qua-phuong-thuc-setters','VIDEO',NULL,440,4,0,1,'2026-09-21 10:51:22','2026-09-21 10:51:22'),(33,7,26,'006 Vòng đời của Spring Beans (Spring bean lifecycle)','006-vong-doi-cua-spring-beans-spring-bean-lifecycle','VIDEO',NULL,655,5,0,1,'2026-09-21 10:51:26','2026-09-21 10:51:26'),(34,7,27,'007 Lazy initialization','007-lazy-initialization','VIDEO',NULL,448,6,0,1,'2026-09-21 10:51:28','2026-09-21 10:51:28'),(35,8,28,'001 Cấu hình Spring beans bằng Java','001-cau-hinh-spring-beans-bang-java','VIDEO',NULL,742,0,0,1,'2026-09-21 10:52:08','2026-09-21 10:52:08'),(36,8,29,'002 Inject (Tiêm) các phụ thuộc beans','002-inject-tiem-cac-phu-thuoc-beans','VIDEO',NULL,322,1,0,1,'2026-09-21 10:52:09','2026-09-21 10:52:09'),(37,8,30,'003 Annotation @Import','003-annotation-import','VIDEO',NULL,339,2,0,1,'2026-09-21 10:52:10','2026-09-21 10:52:10'),(38,8,31,'004 Giải quyết xung đột Beans','004-giai-quyet-xung-dot-beans','VIDEO',NULL,331,3,0,1,'2026-09-21 10:52:13','2026-09-21 10:52:13'),(39,8,32,'005 Inject Spring Bean sử dụng @Autowired và @Qualifier','005-inject-spring-bean-su-dung-autowired-va-qualifier','VIDEO',NULL,392,4,0,1,'2026-09-21 10:52:14','2026-09-21 10:52:14'),(40,8,33,'006 Bean Scopes (Phạm vi của bean)','006-bean-scopes-pham-vi-cua-bean','VIDEO',NULL,395,5,0,1,'2026-09-21 10:52:17','2026-09-21 10:52:17'),(41,8,34,'007 Bean scopes prototype','007-bean-scopes-prototype','VIDEO',NULL,184,6,0,1,'2026-09-21 10:52:18','2026-09-21 10:52:18'),(42,9,35,'001 Github Copilot','001-github-copilot','VIDEO',NULL,768,0,0,1,'2026-09-21 10:52:58','2026-09-21 10:52:58'),(43,9,36,'002 Tạo mã Java bằng Github Copilot','002-tao-ma-java-bang-github-copilot','VIDEO',NULL,574,1,0,1,'2026-09-21 10:53:00','2026-09-21 10:53:00'),(44,9,37,'003 Tạo mã Java bằng Github Copilot','003-tao-ma-java-bang-github-copilot','VIDEO',NULL,416,2,0,1,'2026-09-21 10:53:01','2026-09-21 10:53:01'),(45,9,38,'004 Giải thích mã','004-giai-thich-ma','VIDEO',NULL,107,3,0,1,'2026-09-21 10:53:01','2026-09-21 10:53:01'),(46,9,39,'005 Debug và Fix lỗi mã','005-debug-va-fix-loi-ma','VIDEO',NULL,265,4,0,1,'2026-09-21 10:53:03','2026-09-21 10:53:03'),(47,9,40,'006 Review và Refactor','006-review-va-refactor','VIDEO',NULL,194,5,0,1,'2026-09-21 10:53:04','2026-09-21 10:53:04'),(48,9,41,'007 Tạo kiểm thử đơn vị (Unit Tests)','007-tao-kiem-thu-don-vi-unit-tests','VIDEO',NULL,332,6,0,1,'2026-09-21 10:53:05','2026-09-21 10:53:05'),(49,9,42,'008 Trợ giúp và tài liệu','008-tro-giup-va-tai-lieu','VIDEO',NULL,176,7,0,1,'2026-09-21 10:53:06','2026-09-21 10:53:06'),(50,9,43,'009 Review và Improve','009-review-va-improve','VIDEO',NULL,151,8,0,1,'2026-09-21 10:53:06','2026-09-21 10:53:06'),(51,10,44,'001 Spring Web MVC','001-spring-web-mvc','VIDEO',NULL,324,0,0,1,'2026-09-21 16:42:21','2026-09-21 16:42:21'),(52,10,45,'002 Tạo ứng dụng Web đơn giản bằng Spring Boot trong VSCode','002-tao-ung-dung-web-don-gian-bang-spring-boot-trong-vscode','VIDEO',NULL,335,1,0,1,'2026-09-21 16:42:22','2026-09-21 16:42:22'),(53,10,46,'003 Template Engines','003-template-engines','VIDEO',NULL,172,2,0,1,'2026-09-21 16:42:22','2026-09-21 16:42:22'),(54,10,47,'004 Tạo dự án Spring Boot hỗ trợ Thymeleaf Template Engine','004-tao-du-an-spring-boot-ho-tro-thymeleaf-template-engine','VIDEO',NULL,591,3,0,1,'2026-09-21 16:42:24','2026-09-21 16:42:24'),(55,11,48,'001 Spring Controller','001-spring-controller','VIDEO',NULL,764,0,0,1,'2026-09-21 16:43:37','2026-09-21 16:43:37'),(56,11,49,'002 Request Mapping (Ánh xạ yêu cầu)','002-request-mapping-anh-xa-yeu-cau','VIDEO',NULL,894,1,0,1,'2026-09-21 16:43:40','2026-09-21 16:43:40'),(57,11,50,'003 Khai báo ánh xạ với nhiều URIs','003-khai-bao-anh-xa-voi-nhieu-uris','VIDEO',NULL,225,2,0,1,'2026-09-21 16:43:40','2026-09-21 16:43:40'),(58,11,51,'004 @RequestMapping với Dynamic URIs (URI động)','004-requestmapping-voi-dynamic-uris-uri-dong','VIDEO',NULL,537,3,0,1,'2026-09-21 16:43:42','2026-09-21 16:43:42'),(59,11,52,'005 URI patterns','005-uri-patterns','VIDEO',NULL,1009,4,0,1,'2026-09-21 16:43:47','2026-09-21 16:43:47'),(60,11,53,'006 Parameters, headers','006-parameters-headers','VIDEO',NULL,686,5,0,1,'2026-09-21 16:43:49','2026-09-21 16:43:49'),(61,11,54,'007 Xử lý dữ liệu người dùng gởi từ client','007-xu-ly-du-lieu-nguoi-dung-goi-tu-client','VIDEO',NULL,58,6,0,1,'2026-09-21 16:43:49','2026-09-21 16:43:49'),(62,11,55,'008 @RequestParam','008-requestparam','VIDEO',NULL,695,7,0,1,'2026-09-21 16:43:53','2026-09-21 16:43:53'),(63,11,56,'009 @PathVariable','009-pathvariable','VIDEO',NULL,838,8,0,1,'2026-09-21 16:43:56','2026-09-21 16:43:56'),(64,11,57,'010 @CookieValue','010-cookievalue','VIDEO',NULL,522,9,0,1,'2026-09-21 16:43:58','2026-09-21 16:43:58'),(65,11,58,'011 @RequestPart','011-requestpart','VIDEO',NULL,498,10,0,1,'2026-09-21 16:44:00','2026-09-21 16:44:00'),(66,11,59,'012 @RequestHeader','012-requestheader','VIDEO',NULL,359,11,0,1,'2026-09-21 16:44:01','2026-09-21 16:44:01'),(67,11,60,'013 Sử dụng JavaBean đọc dữ liệu','013-su-dung-javabean-doc-du-lieu','VIDEO',NULL,634,12,0,1,'2026-09-21 16:44:04','2026-09-21 16:44:04'),(68,11,61,'014 Chia sẽ dữ liệu và trả lại giá trị','014-chia-se-du-lieu-va-tra-lai-gia-tri','VIDEO',NULL,719,13,0,1,'2026-09-21 16:44:07','2026-09-21 16:44:07'),(69,11,62,'015 Thêm thuộc tính vào model','015-them-thuoc-tinh-vao-model','VIDEO',NULL,701,14,0,1,'2026-09-21 16:44:10','2026-09-21 16:44:10'),(70,11,63,'016 Annotation  @ModelAttribute','016-annotation-modelattribute','VIDEO',NULL,538,15,0,1,'2026-09-21 16:44:12','2026-09-21 16:44:12'),(71,11,64,'017 @SessionAttributes','017-sessionattributes','VIDEO',NULL,598,16,0,1,'2026-09-21 16:44:13','2026-09-21 16:44:13'),(72,11,65,'018 @RequestAttribute','018-requestattribute','VIDEO',NULL,430,17,0,1,'2026-09-21 16:44:14','2026-09-21 16:44:14'),(73,11,66,'019 Ánh xạ kết quả trả về của phương thức handler','019-anh-xa-ket-qua-tra-ve-cua-phuong-thuc-handler','VIDEO',NULL,141,18,0,1,'2026-09-21 16:44:14','2026-09-21 16:44:14'),(74,11,67,'020 Forward (Chuyển tiếp) yêu cầu','020-forward-chuyen-tiep-yeu-cau','VIDEO',NULL,597,19,0,1,'2026-09-21 16:44:17','2026-09-21 16:44:17'),(75,11,68,'021 Redirect (Chuyển hướng) yêu cầu','021-redirect-chuyen-huong-yeu-cau','VIDEO',NULL,600,20,0,1,'2026-09-21 16:44:20','2026-09-21 16:44:20'),(76,11,69,'022 Dữ liệu gốc  @ResponseBody','022-du-lieu-goc-responsebody','VIDEO',NULL,86,21,0,1,'2026-09-21 16:44:20','2026-09-21 16:44:20'),(77,12,70,'001 Template engine Thymeleaf','001-template-engine-thymeleaf','VIDEO',NULL,760,0,0,1,'2026-09-21 16:52:42','2026-09-21 16:52:42'),(78,12,71,'002 Các thành phần của Thymeleaf','002-cac-thanh-phan-cua-thymeleaf','VIDEO',NULL,415,1,0,1,'2026-09-21 16:52:42','2026-09-21 16:52:42'),(79,12,72,'003 Biểu thức chuẩn (Standard Expressions)','003-bieu-thuc-chuan-standard-expressions','VIDEO',NULL,914,2,0,1,'2026-09-21 16:52:44','2026-09-21 16:52:44'),(80,12,73,'004 Biểu thức chuẩn Variable expressions {…}','004-bieu-thuc-chuan-variable-expressions','VIDEO',NULL,268,3,0,1,'2026-09-21 16:52:44','2026-09-21 16:52:44'),(81,12,74,'005 Biểu thức {…} Selection expressions','005-bieu-thuc-selection-expressions','VIDEO',NULL,332,4,0,1,'2026-09-21 16:52:44','2026-09-21 16:52:44'),(82,12,75,'006 Biểu thức {} Message (i18n) expressions','006-bieu-thuc-message-i18n-expressions','VIDEO',NULL,371,5,0,1,'2026-09-21 16:52:45','2026-09-21 16:52:45'),(83,12,76,'007 Hỗ trợ đa ngữ (I18N)','007-ho-tro-da-ngu-i18n','VIDEO',NULL,373,6,0,1,'2026-09-21 16:52:45','2026-09-21 16:52:45'),(84,12,77,'008 Biểu thức @{}  Link (URL) expressions','008-bieu-thuc-link-url-expressions','VIDEO',NULL,930,7,0,1,'2026-09-21 16:52:47','2026-09-21 16:52:47'),(85,12,78,'009 Toán tử (Operators)','009-toan-tu-operators','VIDEO',NULL,120,8,0,1,'2026-09-21 16:52:47','2026-09-21 16:52:47'),(86,12,79,'010 Toán tử chuỗi (String Operators)','010-toan-tu-chuoi-string-operators','VIDEO',NULL,417,9,0,1,'2026-09-21 16:52:47','2026-09-21 16:52:47'),(87,12,80,'011 Toán tử số học  (Arithmetic Operators)','011-toan-tu-so-hoc-arithmetic-operators','VIDEO',NULL,302,10,0,1,'2026-09-21 16:52:48','2026-09-21 16:52:48'),(88,12,81,'012 Toán tử so sánh (Comparison Operators)','012-toan-tu-so-sanh-comparison-operators','VIDEO',NULL,396,11,0,1,'2026-09-21 16:52:48','2026-09-21 16:52:48'),(89,12,82,'013 Toán tử logic (Logic Operators)','013-toan-tu-logic-logic-operators','VIDEO',NULL,159,12,0,1,'2026-09-21 16:52:49','2026-09-21 16:52:49'),(90,12,83,'014 Toán tử điều kiện (Conditional Operators)','014-toan-tu-dieu-kien-conditional-operators','VIDEO',NULL,213,13,0,1,'2026-09-21 16:52:49','2026-09-21 16:52:49'),(91,12,84,'015 Thuộc tính kiểm soát luồng thực hiện','015-thuoc-tinh-kiem-soat-luong-thuc-hien','VIDEO',NULL,148,14,0,1,'2026-09-21 16:52:49','2026-09-21 16:52:49'),(92,12,85,'016 Thuộc tính  thif và thunless','016-thuoc-tinh-thif-va-thunless','VIDEO',NULL,627,15,0,1,'2026-09-21 16:52:50','2026-09-21 16:52:50'),(93,12,86,'017 Thuộc tính  thswitch','017-thuoc-tinh-thswitch','VIDEO',NULL,210,16,0,1,'2026-09-21 16:52:51','2026-09-21 16:52:51'),(94,12,87,'018 Thuộc tính  theach','018-thuoc-tinh-theach','VIDEO',NULL,411,17,0,1,'2026-09-21 16:52:51','2026-09-21 16:52:51'),(95,13,88,'001 Thymeleaf Fragments','001-thymeleaf-fragments','VIDEO',NULL,835,0,0,1,'2026-09-21 16:53:24','2026-09-21 16:53:24'),(96,13,89,'002 Gộp nội dung với Markup Selectors (Bộ lựa chọn đánh dấu)','002-gop-noi-dung-voi-markup-selectors-bo-lua-chon-danh-dau','VIDEO',NULL,398,1,0,1,'2026-09-21 16:53:25','2026-09-21 16:53:25'),(97,13,90,'003 Parameterized Fragments','003-parameterized-fragments','VIDEO',NULL,503,2,0,1,'2026-09-21 16:53:25','2026-09-21 16:53:25'),(98,13,91,'004 Fragment Inclusion Expressions','004-fragment-inclusion-expressions','VIDEO',NULL,142,3,0,1,'2026-09-21 16:53:26','2026-09-21 16:53:26'),(99,13,92,'005 Thymeleaf Layout Dialect','005-thymeleaf-layout-dialect','VIDEO',NULL,940,4,0,1,'2026-09-21 16:53:27','2026-09-21 16:53:27'),(100,14,93,'1 Introduction','1-introduction','VIDEO',NULL,315,0,0,1,'2026-09-21 16:54:31','2026-09-21 16:54:31'),(101,14,94,'3 Udemy ratings and reviews','3-udemy-ratings-and-reviews','VIDEO',NULL,38,1,0,1,'2026-09-21 16:54:31','2026-09-21 16:54:31'),(102,14,95,'4 How this setup differs from traditional React + Firebase apps','4-how-this-setup-differs-from-traditional-react-firebase-apps','VIDEO',NULL,388,2,0,1,'2026-09-21 16:54:31','2026-09-21 16:54:31'),(103,14,96,'5 Overview of stack + helpful tools for this course','5-overview-of-stack-helpful-tools-for-this-course','VIDEO',NULL,193,3,0,1,'2026-09-21 16:54:31','2026-09-21 16:54:31'),(104,14,97,'6 Set up Next JS project','6-set-up-next-js-project','VIDEO',NULL,258,4,0,1,'2026-09-21 16:54:32','2026-09-21 16:54:32'),(105,14,98,'7 Set up Firebase project','7-set-up-firebase-project','VIDEO',NULL,706,5,0,1,'2026-09-21 16:54:32','2026-09-21 16:54:32'),(106,14,99,'8 Connect Next JS to Firebase','8-connect-next-js-to-firebase','VIDEO',NULL,1003,6,0,1,'2026-09-21 16:54:34','2026-09-21 16:54:34'),(107,14,100,'9 Add the navbar with auth links','9-add-the-navbar-with-auth-links','VIDEO',NULL,547,7,0,1,'2026-09-21 16:54:35','2026-09-21 16:54:35'),(108,14,101,'10 Install shadcn ui and add login with Google','10-install-shadcn-ui-and-add-login-with-google','VIDEO',NULL,637,8,0,1,'2026-09-21 16:54:36','2026-09-21 16:54:36'),(109,14,102,'11 Create auth context and display logged in user','11-create-auth-context-and-display-logged-in-user','VIDEO',NULL,875,9,0,1,'2026-09-21 16:54:37','2026-09-21 16:54:37'),(110,14,103,'12 Add logout functionality','12-add-logout-functionality','VIDEO',NULL,368,10,0,1,'2026-09-21 16:54:37','2026-09-21 16:54:37'),(111,14,104,'13 Improve navbar styling','13-improve-navbar-styling','VIDEO',NULL,597,11,0,1,'2026-09-21 16:54:38','2026-09-21 16:54:38'),(112,14,105,'14 Improve login page styling','14-improve-login-page-styling','VIDEO',NULL,738,12,0,1,'2026-09-21 16:54:39','2026-09-21 16:54:39'),(113,14,106,'15 Add the current user dropdown to the navbar','15-add-the-current-user-dropdown-to-the-navbar','VIDEO',NULL,806,13,0,1,'2026-09-21 16:54:40','2026-09-21 16:54:40'),(114,14,107,'16 Add the admin role to a user and save auth tokens in cookies','16-add-the-admin-role-to-a-user-and-save-auth-tokens-in-cookies','VIDEO',NULL,892,14,0,1,'2026-09-21 16:54:42','2026-09-21 16:54:42'),(115,14,108,'17 Conditionally render user profile menu items','17-conditionally-render-user-profile-menu-items','VIDEO',NULL,274,15,0,1,'2026-09-21 16:54:42','2026-09-21 16:54:42'),(116,14,109,'18 Add the admin dashboard page + route protection with Next JS middleware','18-add-the-admin-dashboard-page-route-protection-with-next-js-middleware','VIDEO',NULL,596,16,0,1,'2026-09-21 16:54:43','2026-09-21 16:54:43'),(117,14,110,'19 Build the admin dashboard main page','19-build-the-admin-dashboard-main-page','VIDEO',NULL,675,17,0,1,'2026-09-21 16:54:45','2026-09-21 16:54:45'),(118,14,111,'20 Create the New Property page','20-create-the-new-property-page','VIDEO',NULL,252,18,0,1,'2026-09-21 16:54:46','2026-09-21 16:54:46'),(119,14,112,'21 Create the new property form schema','21-create-the-new-property-form-schema','VIDEO',NULL,737,19,0,1,'2026-09-21 16:54:47','2026-09-21 16:54:47'),(120,14,113,'22 Create PropertyForm component and start building form UI','22-create-propertyform-component-and-start-building-form-ui','VIDEO',NULL,880,20,0,1,'2026-09-21 16:54:48','2026-09-21 16:54:48'),(121,14,114,'23 Finish rendering the PropertyForm fields','23-finish-rendering-the-propertyform-fields','VIDEO',NULL,720,21,0,1,'2026-09-21 16:54:50','2026-09-21 16:54:50'),(122,14,115,'24 Create the saveNewProperty server action and save data to firestore','24-create-the-savenewproperty-server-action-and-save-data-to-firestore','VIDEO',NULL,706,22,0,1,'2026-09-21 16:54:52','2026-09-21 16:54:52'),(123,14,116,'25 Improve the UI when submitting the new property form','25-improve-the-ui-when-submitting-the-new-property-form','VIDEO',NULL,621,23,0,1,'2026-09-21 16:54:53','2026-09-21 16:54:53'),(124,14,117,'26 Query for properties data','26-query-for-properties-data','VIDEO',NULL,756,24,0,1,'2026-09-21 16:54:55','2026-09-21 16:54:55'),(125,14,118,'27 Render the properties list in a table','27-render-the-properties-list-in-a-table','VIDEO',NULL,658,25,0,1,'2026-09-21 16:54:57','2026-09-21 16:54:57'),(126,14,119,'28 Calculate the total pages for a firestore query','28-calculate-the-total-pages-for-a-firestore-query','VIDEO',NULL,411,26,0,1,'2026-09-21 16:54:58','2026-09-21 16:54:58'),(127,14,120,'29 Render the pagination buttons under the properties table','29-render-the-pagination-buttons-under-the-properties-table','VIDEO',NULL,445,27,0,1,'2026-09-21 16:54:59','2026-09-21 16:54:59'),(128,14,121,'30 Create the edit property page','30-create-the-edit-property-page','VIDEO',NULL,549,28,0,1,'2026-09-21 16:55:00','2026-09-21 16:55:00'),(129,14,122,'31 Create the edit property form','31-create-the-edit-property-form','VIDEO',NULL,638,29,0,1,'2026-09-21 16:55:01','2026-09-21 16:55:01'),(130,14,123,'32 Create the updateProperty server action','32-create-the-updateproperty-server-action','VIDEO',NULL,827,30,0,1,'2026-09-21 16:55:03','2026-09-21 16:55:03'),(131,14,124,'33 Add route protection for all admin dashboard routes and auth pages','33-add-route-protection-for-all-admin-dashboard-routes-and-auth-pages','VIDEO',NULL,800,31,0,1,'2026-09-21 16:57:49','2026-09-21 16:57:49'),(132,14,125,'34 Improve the styling of the properties table','34-improve-the-styling-of-the-properties-table','VIDEO',NULL,925,32,0,1,'2026-09-21 16:57:51','2026-09-21 16:57:51'),(133,14,126,'35 Create the image uploader component','35-create-the-image-uploader-component','VIDEO',NULL,647,33,0,1,'2026-09-21 16:57:52','2026-09-21 16:57:52'),(134,14,127,'36 Store selected images in the form state','36-store-selected-images-in-the-form-state','VIDEO',NULL,821,34,0,1,'2026-09-21 16:57:53','2026-09-21 16:57:53'),(135,14,128,'37 Render the images list','37-render-the-images-list','VIDEO',NULL,848,35,0,1,'2026-09-21 16:57:55','2026-09-21 16:57:55'),(136,14,129,'38 Implement reorder and delete images','38-implement-reorder-and-delete-images','VIDEO',NULL,381,36,0,1,'2026-09-21 16:57:56','2026-09-21 16:57:56'),(137,14,130,'39 Implement upload images to firebase storage for new properties','39-implement-upload-images-to-firebase-storage-for-new-properties','VIDEO',NULL,1164,37,0,1,'2026-09-21 16:57:58','2026-09-21 16:57:58'),(138,14,131,'40 Load existing uploaded images into the edit property form','40-load-existing-uploaded-images-into-the-edit-property-form','VIDEO',NULL,813,38,0,1,'2026-09-21 16:57:59','2026-09-21 16:57:59'),(139,14,132,'41 Implement upload + delete images when updating a property','41-implement-upload-delete-images-when-updating-a-property','VIDEO',NULL,1044,39,0,1,'2026-09-21 16:58:01','2026-09-21 16:58:01'),(140,14,133,'42 Create the property page and render the description as markdown','42-create-the-property-page-and-render-the-description-as-markdown','VIDEO',NULL,991,40,0,1,'2026-09-21 16:58:03','2026-09-21 16:58:03'),(141,14,134,'43 Render the property details','43-render-the-property-details','VIDEO',NULL,582,41,0,1,'2026-09-21 16:58:04','2026-09-21 16:58:04'),(142,14,135,'44 Render the property images carousel and back button','44-render-the-property-images-carousel-and-back-button','VIDEO',NULL,590,42,0,1,'2026-09-21 16:58:06','2026-09-21 16:58:06'),(143,14,136,'45 Create the property search page and search filters','45-create-the-property-search-page-and-search-filters','VIDEO',NULL,636,43,0,1,'2026-09-21 16:58:07','2026-09-21 16:58:07'),(144,14,137,'46 Hook up the search filters to the URL and create firestore indexes','46-hook-up-the-search-filters-to-the-url-and-create-firestore-indexes','VIDEO',NULL,1114,44,0,1,'2026-09-21 16:58:09','2026-09-21 16:58:09'),(145,14,138,'47 Render the filtered property list','47-render-the-filtered-property-list','VIDEO',NULL,1085,45,0,1,'2026-09-21 16:58:11','2026-09-21 16:58:11'),(146,14,139,'48 Add the pagination buttons for property search','48-add-the-pagination-buttons-for-property-search','VIDEO',NULL,671,46,0,1,'2026-09-21 16:58:13','2026-09-21 16:58:13'),(147,14,140,'49 Create the register form schema','49-create-the-register-form-schema','VIDEO',NULL,676,47,0,1,'2026-09-21 16:58:14','2026-09-21 16:58:14'),(148,14,141,'50 Render the register form UI','50-render-the-register-form-ui','VIDEO',NULL,408,48,0,1,'2026-09-21 16:58:15','2026-09-21 16:58:15'),(149,14,142,'51 Create the register user server action','51-create-the-register-user-server-action','VIDEO',NULL,554,49,0,1,'2026-09-21 16:58:17','2026-09-21 16:58:17'),(150,14,143,'52 Build the login with email and password form','52-build-the-login-with-email-and-password-form','VIDEO',NULL,1058,50,0,1,'2026-09-21 16:58:19','2026-09-21 16:58:19'),(151,14,144,'53 Improve validation and errors for login and register','53-improve-validation-and-errors-for-login-and-register','VIDEO',NULL,1009,51,0,1,'2026-09-21 16:58:22','2026-09-21 16:58:22'),(152,14,145,'54 Update the middleware to cater for expiring auth tokens','54-update-the-middleware-to-cater-for-expiring-auth-tokens','VIDEO',NULL,1025,52,0,1,'2026-09-21 16:59:27','2026-09-21 16:59:27'),(153,14,146,'55 Add the my favourites page and toggle favourite button','55-add-the-my-favourites-page-and-toggle-favourite-button','VIDEO',NULL,784,53,0,1,'2026-09-21 16:59:28','2026-09-21 16:59:28'),(154,14,147,'56 Implement the add to favourites functionality','56-implement-the-add-to-favourites-functionality','VIDEO',NULL,859,54,0,1,'2026-09-21 16:59:29','2026-09-21 16:59:29'),(155,14,148,'57 Implement the remove from favourites functionality','57-implement-the-remove-from-favourites-functionality','VIDEO',NULL,642,55,0,1,'2026-09-21 16:59:31','2026-09-21 16:59:31'),(156,14,149,'58 Implement parallel and intercepting routes for login modal','58-implement-parallel-and-intercepting-routes-for-login-modal','VIDEO',NULL,565,56,0,1,'2026-09-21 16:59:32','2026-09-21 16:59:32'),(157,14,150,'59 Render the login form in the login modal','59-render-the-login-form-in-the-login-modal','VIDEO',NULL,928,57,0,1,'2026-09-21 16:59:33','2026-09-21 16:59:33'),(158,14,151,'60 Query for the list of favourites','60-query-for-the-list-of-favourites','VIDEO',NULL,642,58,0,1,'2026-09-21 16:59:35','2026-09-21 16:59:35'),(159,14,152,'61 Render the list of favourites in the my favourites page','61-render-the-list-of-favourites-in-the-my-favourites-page','VIDEO',NULL,780,59,0,1,'2026-09-21 16:59:36','2026-09-21 16:59:36'),(160,14,153,'62 Implement the favourites table pagination and remove favourite','62-implement-the-favourites-table-pagination-and-remove-favourite','VIDEO',NULL,742,60,0,1,'2026-09-21 16:59:38','2026-09-21 16:59:38'),(161,14,154,'63 Add the account page and render user details','63-add-the-account-page-and-render-user-details','VIDEO',NULL,547,61,0,1,'2026-09-21 16:59:40','2026-09-21 16:59:40'),(162,14,155,'54 Update the middleware to cater for expiring auth tokens','54-update-the-middleware-to-cater-for-expiring-auth-tokens-2','VIDEO',NULL,1025,62,0,1,'2026-09-21 17:00:25','2026-09-21 17:00:25'),(163,14,156,'55 Add the my favourites page and toggle favourite button','55-add-the-my-favourites-page-and-toggle-favourite-button-2','VIDEO',NULL,784,63,0,1,'2026-09-21 17:00:26','2026-09-21 17:00:26'),(164,14,157,'56 Implement the add to favourites functionality','56-implement-the-add-to-favourites-functionality-2','VIDEO',NULL,859,64,0,1,'2026-09-21 17:00:28','2026-09-21 17:00:28'),(165,14,158,'57 Implement the remove from favourites functionality','57-implement-the-remove-from-favourites-functionality-2','VIDEO',NULL,642,65,0,1,'2026-09-21 17:00:29','2026-09-21 17:00:29'),(166,14,159,'58 Implement parallel and intercepting routes for login modal','58-implement-parallel-and-intercepting-routes-for-login-modal-2','VIDEO',NULL,565,66,0,1,'2026-09-21 17:00:30','2026-09-21 17:00:30'),(167,14,160,'59 Render the login form in the login modal','59-render-the-login-form-in-the-login-modal-2','VIDEO',NULL,928,67,0,1,'2026-09-21 17:00:31','2026-09-21 17:00:31'),(168,14,161,'60 Query for the list of favourites','60-query-for-the-list-of-favourites-2','VIDEO',NULL,642,68,0,1,'2026-09-21 17:00:34','2026-09-21 17:00:34'),(169,14,162,'61 Render the list of favourites in the my favourites page','61-render-the-list-of-favourites-in-the-my-favourites-page-2','VIDEO',NULL,780,69,0,1,'2026-09-21 17:00:37','2026-09-21 17:00:37'),(170,14,163,'62 Implement the favourites table pagination and remove favourite','62-implement-the-favourites-table-pagination-and-remove-favourite-2','VIDEO',NULL,742,70,0,1,'2026-09-21 17:00:40','2026-09-21 17:00:40'),(171,14,164,'63 Add the account page and render user details','63-add-the-account-page-and-render-user-details-2','VIDEO',NULL,547,71,0,1,'2026-09-21 17:00:42','2026-09-21 17:00:42'),(172,14,165,'64 Implement change password form','64-implement-change-password-form','VIDEO',NULL,1029,72,0,1,'2026-09-21 17:00:48','2026-09-21 17:00:48'),(173,14,166,'65 Implement delete account functionality','65-implement-delete-account-functionality','VIDEO',NULL,938,73,0,1,'2026-09-21 17:00:52','2026-09-21 17:00:52'),(174,14,167,'66 Delete user favourites on account deletion','66-delete-user-favourites-on-account-deletion','VIDEO',NULL,270,74,0,1,'2026-09-21 17:00:53','2026-09-21 17:00:53'),(175,14,168,'67 Implement forgot password functionality','67-implement-forgot-password-functionality','VIDEO',NULL,592,75,0,1,'2026-09-21 17:00:54','2026-09-21 17:00:54'),(176,14,169,'68 Enable caching for property pages','68-enable-caching-for-property-pages','VIDEO',NULL,222,76,0,1,'2026-09-21 17:00:55','2026-09-21 17:00:55'),(177,14,170,'69 Add loading states to app','69-add-loading-states-to-app','VIDEO',NULL,352,77,0,1,'2026-09-21 17:00:56','2026-09-21 17:00:56'),(178,14,171,'70 Build the landing page (optional)','70-build-the-landing-page-optional','VIDEO',NULL,583,78,0,1,'2026-09-21 17:01:59','2026-09-21 17:01:59'),(179,14,172,'71 Implement delete property functionality','71-implement-delete-property-functionality','VIDEO',NULL,1154,79,0,1,'2026-09-21 17:02:01','2026-09-21 17:02:01'),(180,14,173,'72 Deploy to vercel','72-deploy-to-vercel','VIDEO',NULL,386,80,0,1,'2026-09-21 17:02:02','2026-09-21 17:02:02'),(181,15,174,'1 GenAI Revolution in Mobile Apps','1-genai-revolution-in-mobile-apps','VIDEO',NULL,231,0,0,1,'2026-09-22 07:24:59','2026-09-22 07:24:59'),(182,15,175,'2 What is Flutter','2-what-is-flutter','VIDEO',NULL,92,1,0,1,'2026-09-22 07:24:59','2026-09-22 07:24:59'),(183,15,176,'3 Installing the Flutter SDK Step by Step Guide','3-installing-the-flutter-sdk-step-by-step-guide','VIDEO',NULL,404,2,0,1,'2026-09-22 07:25:01','2026-09-22 07:25:01'),(184,15,177,'4 Android Studio Installation Guide for Flutter Developers','4-android-studio-installation-guide-for-flutter-developers','VIDEO',NULL,199,3,0,1,'2026-09-22 07:25:02','2026-09-22 07:25:02'),(185,15,178,'5 Setting Up Xcode for Building iOS Apps with Flutter','5-setting-up-xcode-for-building-ios-apps-with-flutter','VIDEO',NULL,176,4,0,1,'2026-09-22 07:25:03','2026-09-22 07:25:03'),(186,15,179,'6 Flutter Project Setup Running Your App on the iOS Simulator','6-flutter-project-setup-running-your-app-on-the-ios-simulator','VIDEO',NULL,202,5,0,1,'2026-09-22 07:25:04','2026-09-22 07:25:04'),(187,15,180,'7 Setting Up the Android Emulator to Run Flutter Projects','7-setting-up-the-android-emulator-to-run-flutter-projects','VIDEO',NULL,156,6,0,1,'2026-09-22 07:25:05','2026-09-22 07:25:05'),(188,15,181,'8 Installing Flutter SDK on Windows Step by Step Guide','8-installing-flutter-sdk-on-windows-step-by-step-guide','VIDEO',NULL,320,7,0,1,'2026-09-22 07:25:06','2026-09-22 07:25:06'),(189,15,182,'9 Setting Up Android Studio for Flutter on Windows','9-setting-up-android-studio-for-flutter-on-windows','VIDEO',NULL,418,8,0,1,'2026-09-22 07:25:08','2026-09-22 07:25:08'),(190,15,183,'10 Setting Up an Android Emulator (AVD) for Flutter Apps','10-setting-up-an-android-emulator-avd-for-flutter-apps','VIDEO',NULL,151,9,0,1,'2026-09-22 07:25:08','2026-09-22 07:25:08'),(191,15,184,'11 Create a New Flutter Project & Build Chat App UI (Google Gemini)','11-create-a-new-flutter-project-build-chat-app-ui-google-gemini','VIDEO',NULL,640,10,0,1,'2026-09-22 07:25:31','2026-09-22 07:25:31'),(192,15,185,'12 What is Application Programming Interface','12-what-is-application-programming-interface','VIDEO',NULL,140,11,0,1,'2026-09-22 07:25:32','2026-09-22 07:25:32'),(193,15,186,'13 Components of API','13-components-of-api','VIDEO',NULL,222,12,0,1,'2026-09-22 07:25:34','2026-09-22 07:25:34'),(194,15,187,'14 Exploring Google AI Studio for Gemini API Integration','14-exploring-google-ai-studio-for-gemini-api-integration','VIDEO',NULL,307,13,0,1,'2026-09-22 07:25:35','2026-09-22 07:25:35'),(195,15,188,'15 Making Gemini API Calls in Flutter Send Input & Get Output','15-making-gemini-api-calls-in-flutter-send-input-get-output','VIDEO',NULL,662,14,0,1,'2026-09-22 07:25:37','2026-09-22 07:25:37'),(196,15,189,'16 Building Q&A Chatbot in Flutter with Google Gemini','16-building-q-a-chatbot-in-flutter-with-google-gemini','VIDEO',NULL,510,15,0,1,'2026-09-22 07:25:38','2026-09-22 07:25:38'),(197,15,190,'17 GUI & Logic Improvements in Flutter','17-gui-logic-improvements-in-flutter','VIDEO',NULL,176,16,0,1,'2026-09-22 07:25:39','2026-09-22 07:25:39'),(198,15,191,'18 Using Different Google Gemini Models in Flutter','18-using-different-google-gemini-models-in-flutter','VIDEO',NULL,136,17,0,1,'2026-09-22 07:25:39','2026-09-22 07:25:39'),(199,15,192,'19 Using Gemini’s Advanced Reasoning (Thinking) Feature in Flutter','19-using-gemini-s-advanced-reasoning-thinking-feature-in-flutter','VIDEO',NULL,156,18,0,1,'2026-09-22 07:25:40','2026-09-22 07:25:40'),(200,15,193,'20 Using System Instructions with Google Gemini in Flutter','20-using-system-instructions-with-google-gemini-in-flutter','VIDEO',NULL,191,19,0,1,'2026-09-22 07:25:40','2026-09-22 07:25:40'),(201,15,194,'21 Updating AppBar and Send Bar in Flutter Chat App','21-updating-appbar-and-send-bar-in-flutter-chat-app','VIDEO',NULL,289,20,0,1,'2026-09-22 07:27:07','2026-09-22 07:27:07'),(202,15,195,'22 Adding DashChat and Displaying Messages in Flutter Chat App','22-adding-dashchat-and-displaying-messages-in-flutter-chat-app','VIDEO',NULL,520,21,0,1,'2026-09-22 07:27:09','2026-09-22 07:27:09'),(203,15,196,'23 Displaying Received Messages in Correct Order in Flutter Chat App','23-displaying-received-messages-in-correct-order-in-flutter-chat-app','VIDEO',NULL,259,22,0,1,'2026-09-22 07:27:10','2026-09-22 07:27:10'),(204,15,197,'24 Introduction to Chat Feature in Flutter with Google Gemini','24-introduction-to-chat-feature-in-flutter-with-google-gemini','VIDEO',NULL,76,23,0,1,'2026-09-22 07:27:11','2026-09-22 07:27:11'),(205,15,198,'25 Adding Chat Feature in Flutter App with Google Gemini','25-adding-chat-feature-in-flutter-app-with-google-gemini','VIDEO',NULL,419,24,0,1,'2026-09-22 07:27:13','2026-09-22 07:27:13'),(206,15,199,'26 Adding Service Class for Google Gemini Integration in Flutter','26-adding-service-class-for-google-gemini-integration-in-flutter','VIDEO',NULL,373,25,0,1,'2026-09-22 07:27:14','2026-09-22 07:27:14'),(207,15,200,'27 Adding Text to Speech (TTS) Library in Flutter Chat App','27-adding-text-to-speech-tts-library-in-flutter-chat-app','VIDEO',NULL,245,26,0,1,'2026-09-22 07:27:16','2026-09-22 07:27:16'),(208,15,201,'28 Using Text to Speech (TTS) in Flutter Chat App','28-using-text-to-speech-tts-in-flutter-chat-app','VIDEO',NULL,106,27,0,1,'2026-09-22 07:27:16','2026-09-22 07:27:16'),(209,15,202,'29 Enable and Disable Text to Speech (TTS) in Flutter Chat App','29-enable-and-disable-text-to-speech-tts-in-flutter-chat-app','VIDEO',NULL,391,28,0,1,'2026-09-22 07:27:18','2026-09-22 07:27:18'),(210,15,203,'30 Adding Multi Language Support to TTS in Flutter Gemini App','30-adding-multi-language-support-to-tts-in-flutter-gemini-app','VIDEO',NULL,293,29,0,1,'2026-09-22 07:27:19','2026-09-22 07:27:19'),(211,15,204,'31 Customizing Chatbot Voice Different TTS Voices in Flutter Gemini App','31-customizing-chatbot-voice-different-tts-voices-in-flutter-gemini-app','VIDEO',NULL,256,30,0,1,'2026-09-22 07:27:37','2026-09-22 07:27:37'),(212,15,205,'32 Generate Images with Google Gemini in Flutter','32-generate-images-with-google-gemini-in-flutter','VIDEO',NULL,344,31,0,1,'2026-09-22 07:27:39','2026-09-22 07:27:39'),(213,15,206,'33 Combine Text & Image Generation in Flutter','33-combine-text-image-generation-in-flutter','VIDEO',NULL,411,32,0,1,'2026-09-22 07:27:41','2026-09-22 07:27:41'),(214,15,207,'34 Displaying Generated Images in Flutter Gemini App','34-displaying-generated-images-in-flutter-gemini-app','VIDEO',NULL,408,33,0,1,'2026-09-22 07:27:42','2026-09-22 07:27:42'),(215,15,208,'35 Image Generation Overview with Google Gemini in Flutter','35-image-generation-overview-with-google-gemini-in-flutter','VIDEO',NULL,119,34,0,1,'2026-09-22 07:27:43','2026-09-22 07:27:43'),(216,15,209,'36 Choosing an Image for Editing in Flutter with Google Gemini','36-choosing-an-image-for-editing-in-flutter-with-google-gemini','VIDEO',NULL,444,35,0,1,'2026-09-22 07:27:45','2026-09-22 07:27:45'),(217,15,210,'37 Flutter Gemini App Display Selected Images & Improve Workflow','37-flutter-gemini-app-display-selected-images-improve-workflow','VIDEO',NULL,427,36,0,1,'2026-09-22 07:27:47','2026-09-22 07:27:47'),(218,15,211,'38 Exploring Image Editing API Documentation','38-exploring-image-editing-api-documentation','VIDEO',NULL,149,37,0,1,'2026-09-22 07:27:48','2026-09-22 07:27:48'),(219,15,212,'39 Displaying Edited Images in Flutter by Converting Base64 Output','39-displaying-edited-images-in-flutter-by-converting-base64-output','VIDEO',NULL,321,38,0,1,'2026-09-22 07:27:49','2026-09-22 07:27:49'),(220,15,213,'40 Flutter Gemini App Text, Image & Editing Features','40-flutter-gemini-app-text-image-editing-features','VIDEO',NULL,325,39,0,1,'2026-09-22 07:27:50','2026-09-22 07:27:50'),(221,15,214,'41 Displaying Progress Indicator in Flutter Gemini App','41-displaying-progress-indicator-in-flutter-gemini-app','VIDEO',NULL,231,40,0,1,'2026-09-22 07:29:15','2026-09-22 07:29:15'),(222,15,215,'42 Image Understanding in Flutter Apps with Gemini – Demo','42-image-understanding-in-flutter-apps-with-gemini-demo','VIDEO',NULL,64,41,0,1,'2026-09-22 07:29:16','2026-09-22 07:29:16'),(223,15,216,'43 Setting Up GUI for Understanding Feature in Flutter Gemini App','43-setting-up-gui-for-understanding-feature-in-flutter-gemini-app','VIDEO',NULL,277,42,0,1,'2026-09-22 07:29:17','2026-09-22 07:29:17'),(224,15,217,'44 Building Image Understanding Workflow in Flutter with Gemini','44-building-image-understanding-workflow-in-flutter-with-gemini','VIDEO',NULL,436,43,0,1,'2026-09-22 07:29:19','2026-09-22 07:29:19'),(225,15,218,'45 Passing Images to Google Gemini in Flutter','45-passing-images-to-google-gemini-in-flutter','VIDEO',NULL,240,44,0,1,'2026-09-22 07:29:20','2026-09-22 07:29:20'),(226,15,219,'46 Document Understanding in Flutter Apps with Gemini – Demo','46-document-understanding-in-flutter-apps-with-gemini-demo','VIDEO',NULL,80,45,0,1,'2026-09-22 07:29:20','2026-09-22 07:29:20'),(227,15,220,'47 Flutter Gemini App Setup File Picker for selecting documents','47-flutter-gemini-app-setup-file-picker-for-selecting-documents','VIDEO',NULL,514,46,0,1,'2026-09-22 07:29:23','2026-09-22 07:29:23'),(228,15,221,'48 Using Google Gemini for Document Understanding in Flutter Apps','48-using-google-gemini-for-document-understanding-in-flutter-apps','VIDEO',NULL,287,47,0,1,'2026-09-22 07:29:24','2026-09-22 07:29:24'),(229,15,222,'49 Audio Understanding in Flutter Apps with Gemini – Demo','49-audio-understanding-in-flutter-apps-with-gemini-demo','VIDEO',NULL,73,48,0,1,'2026-09-22 07:29:24','2026-09-22 07:29:24'),(230,15,223,'50 Setting Up Audio Understanding in Flutter with Google Gemini','50-setting-up-audio-understanding-in-flutter-with-google-gemini','VIDEO',NULL,188,49,0,1,'2026-09-22 07:29:25','2026-09-22 07:29:25'),(231,15,224,'51 Implement Audio Transcription & Understanding in Flutter','51-implement-audio-transcription-understanding-in-flutter','VIDEO',NULL,349,50,0,1,'2026-09-22 07:29:27','2026-09-22 07:29:27'),(232,15,225,'52 Working with Gemini Audio API in Flutter Apps','52-working-with-gemini-audio-api-in-flutter-apps','VIDEO',NULL,205,51,0,1,'2026-09-22 07:29:28','2026-09-22 07:29:28'),(233,15,226,'53 Video Understanding in Flutter Apps with Gemini – Demo','53-video-understanding-in-flutter-apps-with-gemini-demo','VIDEO',NULL,72,52,0,1,'2026-09-22 07:29:29','2026-09-22 07:29:29'),(234,15,227,'54 Selecting and Displaying Videos in Flutter','54-selecting-and-displaying-videos-in-flutter','VIDEO',NULL,180,53,0,1,'2026-09-22 07:29:29','2026-09-22 07:29:29'),(235,15,228,'55 Implementing Video Understanding in Flutter with Google Gemini','55-implementing-video-understanding-in-flutter-with-google-gemini','VIDEO',NULL,293,54,0,1,'2026-09-22 07:29:31','2026-09-22 07:29:31');
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
) ENGINE=InnoDB AUTO_INCREMENT=229 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `media_assets`
--

LOCK TABLES `media_assets` WRITE;
/*!40000 ALTER TABLE `media_assets` DISABLE KEYS */;
INSERT INTO `media_assets` VALUES (2,6,'LOCAL','VIDEO','001 Tổng quan về Spring Framework.mp4','video/mp4',235831187,NULL,NULL,NULL,'/api/media/videos/n0/0db0f992-a284-47a8-9bf8-d96f5922fd43.mp4',NULL,'/api/media/videos/n0/0db0f992-a284-47a8-9bf8-d96f5922fd43.mp4',NULL,NULL,NULL,'READY',1196,NULL,NULL,NULL,'2026-09-21 10:34:21','2026-09-21 10:34:21'),(3,6,'LOCAL','VIDEO','002 Spring Boot.mp4','video/mp4',55566533,NULL,NULL,NULL,'/api/media/videos/n0/f564b5ec-6b77-4b13-afbc-ce32f139b254.mp4',NULL,'/api/media/videos/n0/f564b5ec-6b77-4b13-afbc-ce32f139b254.mp4',NULL,NULL,NULL,'READY',483,NULL,NULL,NULL,'2026-09-21 10:36:14','2026-09-21 10:36:14'),(4,6,'LOCAL','VIDEO','003 Cài đặt JDK.mp4','video/mp4',19011754,NULL,NULL,NULL,'/api/media/videos/n0/dd65e71e-9205-4f39-9a08-a0ca68662828.mp4',NULL,'/api/media/videos/n0/dd65e71e-9205-4f39-9a08-a0ca68662828.mp4',NULL,NULL,NULL,'READY',199,NULL,NULL,NULL,'2026-09-21 10:40:32','2026-09-21 10:40:32'),(5,6,'LOCAL','VIDEO','004 Cài đặt Spring Tool 4 for Visual Studio Code.mp4','video/mp4',152696867,NULL,NULL,NULL,'/api/media/videos/n0/6d37dd28-be62-4062-aa11-232f63494404.mp4',NULL,'/api/media/videos/n0/6d37dd28-be62-4062-aa11-232f63494404.mp4',NULL,NULL,NULL,'READY',647,NULL,NULL,NULL,'2026-09-21 10:40:54','2026-09-21 10:40:54'),(6,6,'LOCAL','VIDEO','005 Tạo dự án bằng Spring Initializr và mở trong Visual Studio Code.mp4','video/mp4',60640702,NULL,NULL,NULL,'/api/media/videos/n0/0115a6a0-9a81-488a-b25d-af939ec99a2e.mp4',NULL,'/api/media/videos/n0/0115a6a0-9a81-488a-b25d-af939ec99a2e.mp4',NULL,NULL,NULL,'READY',393,NULL,NULL,NULL,'2026-09-21 10:42:46','2026-09-21 10:42:46'),(7,6,'LOCAL','VIDEO','006 Tạo dự án Spring Boot trong Visual Studio Code.mp4','video/mp4',43131455,NULL,NULL,NULL,'/api/media/videos/n0/7799ec33-5e96-4537-8fce-716755dc15c0.mp4',NULL,'/api/media/videos/n0/7799ec33-5e96-4537-8fce-716755dc15c0.mp4',NULL,NULL,NULL,'READY',273,NULL,NULL,NULL,'2026-09-21 10:43:05','2026-09-21 10:43:05'),(8,6,'LOCAL','VIDEO','007 Tích hợp Github Copilot với Visual Studio Code.mp4','video/mp4',63704803,NULL,NULL,NULL,'/api/media/videos/n0/bbff8762-3e60-4590-b303-0d0117afc25f.mp4',NULL,'/api/media/videos/n0/bbff8762-3e60-4590-b303-0d0117afc25f.mp4',NULL,NULL,NULL,'READY',727,NULL,NULL,NULL,'2026-09-21 10:43:17','2026-09-21 10:43:17'),(9,6,'LOCAL','VIDEO','001 Dự án Lombok.mp4','video/mp4',37766831,NULL,NULL,NULL,'/api/media/videos/n0/c390694e-372a-4f1e-a959-c8b7c0aa8867.mp4',NULL,'/api/media/videos/n0/c390694e-372a-4f1e-a959-c8b7c0aa8867.mp4',NULL,NULL,NULL,'READY',264,NULL,NULL,NULL,'2026-09-21 10:46:21','2026-09-21 10:46:21'),(10,6,'LOCAL','VIDEO','002 Tạo Getters và Setters.mp4','video/mp4',46129314,NULL,NULL,NULL,'/api/media/videos/n0/2e6583ff-4bdf-498f-91e6-3ed1595932d7.mp4',NULL,'/api/media/videos/n0/2e6583ff-4bdf-498f-91e6-3ed1595932d7.mp4',NULL,NULL,NULL,'READY',280,NULL,NULL,NULL,'2026-09-21 10:48:41','2026-09-21 10:48:41'),(11,6,'LOCAL','VIDEO','003 Tạo hàm tạo (Constructors).mp4','video/mp4',41368552,NULL,NULL,NULL,'/api/media/videos/n0/22fffa4d-e647-4f53-9ce3-d257702cb9fb.mp4',NULL,'/api/media/videos/n0/22fffa4d-e647-4f53-9ce3-d257702cb9fb.mp4',NULL,NULL,NULL,'READY',227,NULL,NULL,NULL,'2026-09-21 10:48:42','2026-09-21 10:48:42'),(12,6,'LOCAL','VIDEO','004 Tạo phương thức toString, equals, hashCode.mp4','video/mp4',89477419,NULL,NULL,NULL,'/api/media/videos/n0/22ab0855-d9a5-4bc7-bbf2-27e87ffc2ff4.mp4',NULL,'/api/media/videos/n0/22ab0855-d9a5-4bc7-bbf2-27e87ffc2ff4.mp4',NULL,NULL,NULL,'READY',475,NULL,NULL,NULL,'2026-09-21 10:48:44','2026-09-21 10:48:44'),(13,6,'LOCAL','VIDEO','005 Kiểm tra giá trị null.mp4','video/mp4',32408122,NULL,NULL,NULL,'/api/media/videos/n0/1216aaff-4273-47c3-b9e2-a593aa72e3c4.mp4',NULL,'/api/media/videos/n0/1216aaff-4273-47c3-b9e2-a593aa72e3c4.mp4',NULL,NULL,NULL,'READY',239,NULL,NULL,NULL,'2026-09-21 10:48:46','2026-09-21 10:48:46'),(14,6,'LOCAL','VIDEO','006 Lombok Builder.mp4','video/mp4',89222564,NULL,NULL,NULL,'/api/media/videos/n0/8df627ae-9083-471d-a5e0-5c7d601ab0d5.mp4',NULL,'/api/media/videos/n0/8df627ae-9083-471d-a5e0-5c7d601ab0d5.mp4',NULL,NULL,NULL,'READY',453,NULL,NULL,NULL,'2026-09-21 10:48:48','2026-09-21 10:48:48'),(15,6,'LOCAL','VIDEO','007 Lombok Logging.mp4','video/mp4',219562253,NULL,NULL,NULL,'/api/media/videos/n0/44a07bd7-91e3-4211-a239-540248224f8d.mp4',NULL,'/api/media/videos/n0/44a07bd7-91e3-4211-a239-540248224f8d.mp4',NULL,NULL,NULL,'READY',838,NULL,NULL,NULL,'2026-09-21 10:48:54','2026-09-21 10:48:54'),(16,6,'LOCAL','VIDEO','001 Auto Configuration (Cấu hình tự động).mp4','video/mp4',61818313,NULL,NULL,NULL,'/api/media/videos/n0/14761747-7289-4f9d-a32d-1ed90b40bbf1.mp4',NULL,'/api/media/videos/n0/14761747-7289-4f9d-a32d-1ed90b40bbf1.mp4',NULL,NULL,NULL,'READY',611,NULL,NULL,NULL,'2026-09-21 10:50:08','2026-09-21 10:50:08'),(17,6,'LOCAL','VIDEO','002 applicationproperties và applicationyml.mp4','video/mp4',88203319,NULL,NULL,NULL,'/api/media/videos/n0/3484e6a0-4099-428f-9055-99a22084dcaa.mp4',NULL,'/api/media/videos/n0/3484e6a0-4099-428f-9055-99a22084dcaa.mp4',NULL,NULL,NULL,'READY',562,NULL,NULL,NULL,'2026-09-21 10:50:10','2026-09-21 10:50:10'),(18,6,'LOCAL','VIDEO','003 Tự tạo Auto Configuration riêng.mp4','video/mp4',109471396,NULL,NULL,NULL,'/api/media/videos/n0/5f14ba28-6040-47e7-9233-bc57e4aa20d7.mp4',NULL,'/api/media/videos/n0/5f14ba28-6040-47e7-9233-bc57e4aa20d7.mp4',NULL,NULL,NULL,'READY',491,NULL,NULL,NULL,'2026-09-21 10:50:14','2026-09-21 10:50:14'),(19,6,'LOCAL','VIDEO','004 Ưu và nhược điểm của Auto Configuration.mp4','video/mp4',3668789,NULL,NULL,NULL,'/api/media/videos/n0/bf205c72-baa9-461f-8e84-81757f2daa24.mp4',NULL,'/api/media/videos/n0/bf205c72-baa9-461f-8e84-81757f2daa24.mp4',NULL,NULL,NULL,'READY',57,NULL,NULL,NULL,'2026-09-21 10:50:14','2026-09-21 10:50:14'),(20,6,'LOCAL','VIDEO','005 Spring Boot Developer Tools (DevTools).mp4','video/mp4',89220500,NULL,NULL,NULL,'/api/media/videos/n0/9d54fa5c-46cf-445e-ae6a-ed2caf5d31b9.mp4',NULL,'/api/media/videos/n0/9d54fa5c-46cf-445e-ae6a-ed2caf5d31b9.mp4',NULL,NULL,NULL,'READY',395,NULL,NULL,NULL,'2026-09-21 10:50:17','2026-09-21 10:50:17'),(21,6,'LOCAL','VIDEO','001 Dependency Injection (DI) trong Spring.mp4','video/mp4',62232769,NULL,NULL,NULL,'/api/media/videos/n0/29c56c4c-03b3-4666-9777-416e73e2386c.mp4',NULL,'/api/media/videos/n0/29c56c4c-03b3-4666-9777-416e73e2386c.mp4',NULL,NULL,NULL,'READY',420,NULL,NULL,NULL,'2026-09-21 10:51:07','2026-09-21 10:51:07'),(22,6,'LOCAL','VIDEO','002 Spring Application Context.mp4','video/mp4',121103064,NULL,NULL,NULL,'/api/media/videos/n0/d80608bb-9d39-4314-afdb-9f7a4416821a.mp4',NULL,'/api/media/videos/n0/d80608bb-9d39-4314-afdb-9f7a4416821a.mp4',NULL,NULL,NULL,'READY',708,NULL,NULL,NULL,'2026-09-21 10:51:10','2026-09-21 10:51:10'),(23,6,'LOCAL','VIDEO','003 Tạo Spring Beans và thực hiện DI qua trường (Fields).mp4','video/mp4',161751752,NULL,NULL,NULL,'/api/media/videos/n0/eba2b1b2-d53d-476a-8d5d-cdc58cf7d9d9.mp4',NULL,'/api/media/videos/n0/eba2b1b2-d53d-476a-8d5d-cdc58cf7d9d9.mp4',NULL,NULL,NULL,'READY',889,NULL,NULL,NULL,'2026-09-21 10:51:15','2026-09-21 10:51:15'),(24,6,'LOCAL','VIDEO','004 Tạo Spring Beans và thực hiện DI qua hàm tạo.mp4','video/mp4',84678324,NULL,NULL,NULL,'/api/media/videos/n0/d2897afc-fc41-46ec-af71-820e73f97618.mp4',NULL,'/api/media/videos/n0/d2897afc-fc41-46ec-af71-820e73f97618.mp4',NULL,NULL,NULL,'READY',398,NULL,NULL,NULL,'2026-09-21 10:51:19','2026-09-21 10:51:19'),(25,6,'LOCAL','VIDEO','005 Tạo Spring Beans và thực hiện DI qua phương thức Setters.mp4','video/mp4',100927563,NULL,NULL,NULL,'/api/media/videos/n0/a81c8112-0a56-4d1b-981e-02d485c79a8f.mp4',NULL,'/api/media/videos/n0/a81c8112-0a56-4d1b-981e-02d485c79a8f.mp4',NULL,NULL,NULL,'READY',440,NULL,NULL,NULL,'2026-09-21 10:51:22','2026-09-21 10:51:22'),(26,6,'LOCAL','VIDEO','006 Vòng đời của Spring Beans (Spring bean lifecycle).mp4','video/mp4',142134449,NULL,NULL,NULL,'/api/media/videos/n0/2e215a43-48b8-4c3f-bd24-e4d82421b1ac.mp4',NULL,'/api/media/videos/n0/2e215a43-48b8-4c3f-bd24-e4d82421b1ac.mp4',NULL,NULL,NULL,'READY',655,NULL,NULL,NULL,'2026-09-21 10:51:26','2026-09-21 10:51:26'),(27,6,'LOCAL','VIDEO','007 Lazy initialization.mp4','video/mp4',78743571,NULL,NULL,NULL,'/api/media/videos/n0/79f7e4f4-b206-429a-a689-9b3f508b2d1a.mp4',NULL,'/api/media/videos/n0/79f7e4f4-b206-429a-a689-9b3f508b2d1a.mp4',NULL,NULL,NULL,'READY',448,NULL,NULL,NULL,'2026-09-21 10:51:28','2026-09-21 10:51:28'),(28,6,'LOCAL','VIDEO','001 Cấu hình Spring beans bằng Java.mp4','video/mp4',109681989,NULL,NULL,NULL,'/api/media/videos/n0/03512197-166e-4d49-a955-4923face9610.mp4',NULL,'/api/media/videos/n0/03512197-166e-4d49-a955-4923face9610.mp4',NULL,NULL,NULL,'READY',742,NULL,NULL,NULL,'2026-09-21 10:52:08','2026-09-21 10:52:08'),(29,6,'LOCAL','VIDEO','002 Inject (Tiêm) các phụ thuộc beans.mp4','video/mp4',36635219,NULL,NULL,NULL,'/api/media/videos/n0/f8c02c5e-13c5-409d-8900-635b9c1ac967.mp4',NULL,'/api/media/videos/n0/f8c02c5e-13c5-409d-8900-635b9c1ac967.mp4',NULL,NULL,NULL,'READY',322,NULL,NULL,NULL,'2026-09-21 10:52:09','2026-09-21 10:52:09'),(30,6,'LOCAL','VIDEO','003 Annotation @Import.mp4','video/mp4',36002042,NULL,NULL,NULL,'/api/media/videos/n0/f262ad9e-fd35-4c26-a332-642dee85a558.mp4',NULL,'/api/media/videos/n0/f262ad9e-fd35-4c26-a332-642dee85a558.mp4',NULL,NULL,NULL,'READY',339,NULL,NULL,NULL,'2026-09-21 10:52:10','2026-09-21 10:52:10'),(31,6,'LOCAL','VIDEO','004 Giải quyết xung đột Beans.mp4','video/mp4',62091204,NULL,NULL,NULL,'/api/media/videos/n0/fd9fa6ec-4bfb-4b56-9976-8509fc6ac3f6.mp4',NULL,'/api/media/videos/n0/fd9fa6ec-4bfb-4b56-9976-8509fc6ac3f6.mp4',NULL,NULL,NULL,'READY',331,NULL,NULL,NULL,'2026-09-21 10:52:13','2026-09-21 10:52:13'),(32,6,'LOCAL','VIDEO','005 Inject Spring Bean sử dụng @Autowired và @Qualifier.mp4','video/mp4',50901964,NULL,NULL,NULL,'/api/media/videos/n0/bb6e2c6d-0c5d-46b4-b8f3-b44dbe2afca0.mp4',NULL,'/api/media/videos/n0/bb6e2c6d-0c5d-46b4-b8f3-b44dbe2afca0.mp4',NULL,NULL,NULL,'READY',392,NULL,NULL,NULL,'2026-09-21 10:52:14','2026-09-21 10:52:14'),(33,6,'LOCAL','VIDEO','006 Bean Scopes (Phạm vi của bean).mp4','video/mp4',95917892,NULL,NULL,NULL,'/api/media/videos/n0/a41c00f8-7f97-4d4b-bad6-a61dba8dfc13.mp4',NULL,'/api/media/videos/n0/a41c00f8-7f97-4d4b-bad6-a61dba8dfc13.mp4',NULL,NULL,NULL,'READY',395,NULL,NULL,NULL,'2026-09-21 10:52:17','2026-09-21 10:52:17'),(34,6,'LOCAL','VIDEO','007 Bean scopes prototype.mp4','video/mp4',34278295,NULL,NULL,NULL,'/api/media/videos/n0/94ac3c0a-248a-4ca9-8fb1-1042e4010010.mp4',NULL,'/api/media/videos/n0/94ac3c0a-248a-4ca9-8fb1-1042e4010010.mp4',NULL,NULL,NULL,'READY',184,NULL,NULL,NULL,'2026-09-21 10:52:18','2026-09-21 10:52:18'),(35,6,'LOCAL','VIDEO','001 Github Copilot.mp4','video/mp4',152404635,NULL,NULL,NULL,'/api/media/videos/n0/63963a8f-6aa0-4299-b6ba-725e6bd09fee.mp4',NULL,'/api/media/videos/n0/63963a8f-6aa0-4299-b6ba-725e6bd09fee.mp4',NULL,NULL,NULL,'READY',768,NULL,NULL,NULL,'2026-09-21 10:52:58','2026-09-21 10:52:58'),(36,6,'LOCAL','VIDEO','002 Tạo mã Java bằng Github Copilot.mp4','video/mp4',84585493,NULL,NULL,NULL,'/api/media/videos/n0/e1bcc22d-1130-4ad7-b923-9d7e0d05c529.mp4',NULL,'/api/media/videos/n0/e1bcc22d-1130-4ad7-b923-9d7e0d05c529.mp4',NULL,NULL,NULL,'READY',574,NULL,NULL,NULL,'2026-09-21 10:53:00','2026-09-21 10:53:00'),(37,6,'LOCAL','VIDEO','003 Tạo mã Java bằng Github Copilot.mp4','video/mp4',42671884,NULL,NULL,NULL,'/api/media/videos/n0/38eb4356-23b9-463d-878d-993f5ee5bebc.mp4',NULL,'/api/media/videos/n0/38eb4356-23b9-463d-878d-993f5ee5bebc.mp4',NULL,NULL,NULL,'READY',416,NULL,NULL,NULL,'2026-09-21 10:53:01','2026-09-21 10:53:01'),(38,6,'LOCAL','VIDEO','004 Giải thích mã.mp4','video/mp4',12426643,NULL,NULL,NULL,'/api/media/videos/n0/c3110a18-55a9-4fab-afc5-b11375f418b2.mp4',NULL,'/api/media/videos/n0/c3110a18-55a9-4fab-afc5-b11375f418b2.mp4',NULL,NULL,NULL,'READY',107,NULL,NULL,NULL,'2026-09-21 10:53:01','2026-09-21 10:53:01'),(39,6,'LOCAL','VIDEO','005 Debug và Fix lỗi mã.mp4','video/mp4',49937933,NULL,NULL,NULL,'/api/media/videos/n0/fb720ebe-49d0-43ee-9300-181cc458d8bf.mp4',NULL,'/api/media/videos/n0/fb720ebe-49d0-43ee-9300-181cc458d8bf.mp4',NULL,NULL,NULL,'READY',265,NULL,NULL,NULL,'2026-09-21 10:53:03','2026-09-21 10:53:03'),(40,6,'LOCAL','VIDEO','006 Review và Refactor.mp4','video/mp4',31174402,NULL,NULL,NULL,'/api/media/videos/n0/3db5995b-76b4-428f-9862-7d6f8d04e6aa.mp4',NULL,'/api/media/videos/n0/3db5995b-76b4-428f-9862-7d6f8d04e6aa.mp4',NULL,NULL,NULL,'READY',194,NULL,NULL,NULL,'2026-09-21 10:53:04','2026-09-21 10:53:04'),(41,6,'LOCAL','VIDEO','007 Tạo kiểm thử đơn vị (Unit Tests).mp4','video/mp4',47777886,NULL,NULL,NULL,'/api/media/videos/n0/bac6f0b7-3d77-4334-b4df-621874c3affc.mp4',NULL,'/api/media/videos/n0/bac6f0b7-3d77-4334-b4df-621874c3affc.mp4',NULL,NULL,NULL,'READY',332,NULL,NULL,NULL,'2026-09-21 10:53:05','2026-09-21 10:53:05'),(42,6,'LOCAL','VIDEO','008 Trợ giúp và tài liệu.mp4','video/mp4',38583619,NULL,NULL,NULL,'/api/media/videos/n0/ac00a619-1df6-414a-8b4f-80588897f817.mp4',NULL,'/api/media/videos/n0/ac00a619-1df6-414a-8b4f-80588897f817.mp4',NULL,NULL,NULL,'READY',176,NULL,NULL,NULL,'2026-09-21 10:53:06','2026-09-21 10:53:06'),(43,6,'LOCAL','VIDEO','009 Review và Improve.mp4','video/mp4',12882852,NULL,NULL,NULL,'/api/media/videos/n0/919daa44-c0c6-49d3-aed7-ba02a8c2ce59.mp4',NULL,'/api/media/videos/n0/919daa44-c0c6-49d3-aed7-ba02a8c2ce59.mp4',NULL,NULL,NULL,'READY',151,NULL,NULL,NULL,'2026-09-21 10:53:06','2026-09-21 10:53:06'),(44,6,'LOCAL','VIDEO','001 Spring Web MVC.mp4','video/mp4',30648011,NULL,NULL,NULL,'/api/media/videos/n0/2ba33cf8-52a1-4557-9cc7-29526221c8bb.mp4',NULL,'/api/media/videos/n0/2ba33cf8-52a1-4557-9cc7-29526221c8bb.mp4',NULL,NULL,NULL,'READY',324,NULL,NULL,NULL,'2026-09-21 16:42:21','2026-09-21 16:42:21'),(45,6,'LOCAL','VIDEO','002 Tạo ứng dụng Web đơn giản bằng Spring Boot trong VSCode.mp4','video/mp4',29065529,NULL,NULL,NULL,'/api/media/videos/n0/670e4ef3-a240-4824-a94e-4dab4e563425.mp4',NULL,'/api/media/videos/n0/670e4ef3-a240-4824-a94e-4dab4e563425.mp4',NULL,NULL,NULL,'READY',335,NULL,NULL,NULL,'2026-09-21 16:42:22','2026-09-21 16:42:22'),(46,6,'LOCAL','VIDEO','003 Template Engines.mp4','video/mp4',15523358,NULL,NULL,NULL,'/api/media/videos/n0/8b2c11da-60b0-4b1f-997b-c06f1fac0435.mp4',NULL,'/api/media/videos/n0/8b2c11da-60b0-4b1f-997b-c06f1fac0435.mp4',NULL,NULL,NULL,'READY',172,NULL,NULL,NULL,'2026-09-21 16:42:22','2026-09-21 16:42:22'),(47,6,'LOCAL','VIDEO','004 Tạo dự án Spring Boot hỗ trợ Thymeleaf Template Engine.mp4','video/mp4',100255556,NULL,NULL,NULL,'/api/media/videos/n0/1f4a5e0a-5216-434d-9e9e-298732b71c4c.mp4',NULL,'/api/media/videos/n0/1f4a5e0a-5216-434d-9e9e-298732b71c4c.mp4',NULL,NULL,NULL,'READY',591,NULL,NULL,NULL,'2026-09-21 16:42:24','2026-09-21 16:42:24'),(48,6,'LOCAL','VIDEO','001 Spring Controller.mp4','video/mp4',70198204,NULL,NULL,NULL,'/api/media/videos/n0/522b0bfd-0faf-4f56-8965-20a255ce6c37.mp4',NULL,'/api/media/videos/n0/522b0bfd-0faf-4f56-8965-20a255ce6c37.mp4',NULL,NULL,NULL,'READY',764,NULL,NULL,NULL,'2026-09-21 16:43:37','2026-09-21 16:43:37'),(49,6,'LOCAL','VIDEO','002 Request Mapping (Ánh xạ yêu cầu).mp4','video/mp4',103516685,NULL,NULL,NULL,'/api/media/videos/n0/5506209c-74ea-4ee0-9af2-b26aa4e62556.mp4',NULL,'/api/media/videos/n0/5506209c-74ea-4ee0-9af2-b26aa4e62556.mp4',NULL,NULL,NULL,'READY',894,NULL,NULL,NULL,'2026-09-21 16:43:40','2026-09-21 16:43:40'),(50,6,'LOCAL','VIDEO','003 Khai báo ánh xạ với nhiều URIs.mp4','video/mp4',33177769,NULL,NULL,NULL,'/api/media/videos/n0/7c54be3a-c515-4477-a13d-71d8c2b5f574.mp4',NULL,'/api/media/videos/n0/7c54be3a-c515-4477-a13d-71d8c2b5f574.mp4',NULL,NULL,NULL,'READY',225,NULL,NULL,NULL,'2026-09-21 16:43:40','2026-09-21 16:43:40'),(51,6,'LOCAL','VIDEO','004 @RequestMapping với Dynamic URIs (URI động).mp4','video/mp4',59469467,NULL,NULL,NULL,'/api/media/videos/n0/38fc2a5f-9453-4f46-8ae1-b6963c81671c.mp4',NULL,'/api/media/videos/n0/38fc2a5f-9453-4f46-8ae1-b6963c81671c.mp4',NULL,NULL,NULL,'READY',537,NULL,NULL,NULL,'2026-09-21 16:43:42','2026-09-21 16:43:42'),(52,6,'LOCAL','VIDEO','005 URI patterns.mp4','video/mp4',233713453,NULL,NULL,NULL,'/api/media/videos/n0/a5aa4972-7dc4-403a-bd39-601a867e6cdb.mp4',NULL,'/api/media/videos/n0/a5aa4972-7dc4-403a-bd39-601a867e6cdb.mp4',NULL,NULL,NULL,'READY',1009,NULL,NULL,NULL,'2026-09-21 16:43:47','2026-09-21 16:43:47'),(53,6,'LOCAL','VIDEO','006 Parameters, headers.mp4','video/mp4',115808246,NULL,NULL,NULL,'/api/media/videos/n0/8730d7f7-09c5-42b0-9a83-3b502f4d0825.mp4',NULL,'/api/media/videos/n0/8730d7f7-09c5-42b0-9a83-3b502f4d0825.mp4',NULL,NULL,NULL,'READY',686,NULL,NULL,NULL,'2026-09-21 16:43:49','2026-09-21 16:43:49'),(54,6,'LOCAL','VIDEO','007 Xử lý dữ liệu người dùng gởi từ client.mp4','video/mp4',8615728,NULL,NULL,NULL,'/api/media/videos/n0/f75b60de-2ef5-436e-a855-cbfa68df7a14.mp4',NULL,'/api/media/videos/n0/f75b60de-2ef5-436e-a855-cbfa68df7a14.mp4',NULL,NULL,NULL,'READY',58,NULL,NULL,NULL,'2026-09-21 16:43:49','2026-09-21 16:43:49'),(55,6,'LOCAL','VIDEO','008 @RequestParam.mp4','video/mp4',140330940,NULL,NULL,NULL,'/api/media/videos/n0/d8659210-7a18-4995-a860-661359c0ec29.mp4',NULL,'/api/media/videos/n0/d8659210-7a18-4995-a860-661359c0ec29.mp4',NULL,NULL,NULL,'READY',695,NULL,NULL,NULL,'2026-09-21 16:43:53','2026-09-21 16:43:53'),(56,6,'LOCAL','VIDEO','009 @PathVariable.mp4','video/mp4',153103617,NULL,NULL,NULL,'/api/media/videos/n0/ff38dba5-990c-470b-bd0b-25c56fa35224.mp4',NULL,'/api/media/videos/n0/ff38dba5-990c-470b-bd0b-25c56fa35224.mp4',NULL,NULL,NULL,'READY',838,NULL,NULL,NULL,'2026-09-21 16:43:56','2026-09-21 16:43:56'),(57,6,'LOCAL','VIDEO','010 @CookieValue.mp4','video/mp4',84343328,NULL,NULL,NULL,'/api/media/videos/n0/19cebe56-badc-4ac3-bbcb-24198053d984.mp4',NULL,'/api/media/videos/n0/19cebe56-badc-4ac3-bbcb-24198053d984.mp4',NULL,NULL,NULL,'READY',522,NULL,NULL,NULL,'2026-09-21 16:43:58','2026-09-21 16:43:58'),(58,6,'LOCAL','VIDEO','011 @RequestPart.mp4','video/mp4',89352313,NULL,NULL,NULL,'/api/media/videos/n0/a3c5d5c8-7cbb-4e8e-926c-38f68f930a1e.mp4',NULL,'/api/media/videos/n0/a3c5d5c8-7cbb-4e8e-926c-38f68f930a1e.mp4',NULL,NULL,NULL,'READY',498,NULL,NULL,NULL,'2026-09-21 16:44:00','2026-09-21 16:44:00'),(59,6,'LOCAL','VIDEO','012 @RequestHeader.mp4','video/mp4',62976456,NULL,NULL,NULL,'/api/media/videos/n0/e9284e1a-6e14-43ac-8016-a2b0d259beff.mp4',NULL,'/api/media/videos/n0/e9284e1a-6e14-43ac-8016-a2b0d259beff.mp4',NULL,NULL,NULL,'READY',359,NULL,NULL,NULL,'2026-09-21 16:44:01','2026-09-21 16:44:01'),(60,6,'LOCAL','VIDEO','013 Sử dụng JavaBean đọc dữ liệu.mp4','video/mp4',102036844,NULL,NULL,NULL,'/api/media/videos/n0/27feca02-34f2-44a5-a6d4-5c7a2aaa9955.mp4',NULL,'/api/media/videos/n0/27feca02-34f2-44a5-a6d4-5c7a2aaa9955.mp4',NULL,NULL,NULL,'READY',634,NULL,NULL,NULL,'2026-09-21 16:44:04','2026-09-21 16:44:04'),(61,6,'LOCAL','VIDEO','014 Chia sẽ dữ liệu và trả lại giá trị.mp4','video/mp4',134917387,NULL,NULL,NULL,'/api/media/videos/n0/8227f044-a478-4653-bbf7-c1ef8a56d188.mp4',NULL,'/api/media/videos/n0/8227f044-a478-4653-bbf7-c1ef8a56d188.mp4',NULL,NULL,NULL,'READY',719,NULL,NULL,NULL,'2026-09-21 16:44:07','2026-09-21 16:44:07'),(62,6,'LOCAL','VIDEO','015 Thêm thuộc tính vào model.mp4','video/mp4',115631682,NULL,NULL,NULL,'/api/media/videos/n0/9bc7b206-f4ec-4e33-baf3-3f95556d0721.mp4',NULL,'/api/media/videos/n0/9bc7b206-f4ec-4e33-baf3-3f95556d0721.mp4',NULL,NULL,NULL,'READY',701,NULL,NULL,NULL,'2026-09-21 16:44:10','2026-09-21 16:44:10'),(63,6,'LOCAL','VIDEO','016 Annotation  @ModelAttribute.mp4','video/mp4',93337252,NULL,NULL,NULL,'/api/media/videos/n0/b98976cb-aa3a-4435-b884-3773b6e5f86f.mp4',NULL,'/api/media/videos/n0/b98976cb-aa3a-4435-b884-3773b6e5f86f.mp4',NULL,NULL,NULL,'READY',538,NULL,NULL,NULL,'2026-09-21 16:44:12','2026-09-21 16:44:12'),(64,6,'LOCAL','VIDEO','017 @SessionAttributes.mp4','video/mp4',52253523,NULL,NULL,NULL,'/api/media/videos/n0/8453afdc-3af3-47a4-897e-14d18d833449.mp4',NULL,'/api/media/videos/n0/8453afdc-3af3-47a4-897e-14d18d833449.mp4',NULL,NULL,NULL,'READY',598,NULL,NULL,NULL,'2026-09-21 16:44:13','2026-09-21 16:44:13'),(65,6,'LOCAL','VIDEO','018 @RequestAttribute.mp4','video/mp4',36573269,NULL,NULL,NULL,'/api/media/videos/n0/9ad2665b-2a59-4692-b4ae-34dafdbe0e6b.mp4',NULL,'/api/media/videos/n0/9ad2665b-2a59-4692-b4ae-34dafdbe0e6b.mp4',NULL,NULL,NULL,'READY',430,NULL,NULL,NULL,'2026-09-21 16:44:14','2026-09-21 16:44:14'),(66,6,'LOCAL','VIDEO','019 Ánh xạ kết quả trả về của phương thức handler.mp4','video/mp4',28022096,NULL,NULL,NULL,'/api/media/videos/n0/09522ec3-6b3a-402a-884e-29fddd524a9f.mp4',NULL,'/api/media/videos/n0/09522ec3-6b3a-402a-884e-29fddd524a9f.mp4',NULL,NULL,NULL,'READY',141,NULL,NULL,NULL,'2026-09-21 16:44:14','2026-09-21 16:44:14'),(67,6,'LOCAL','VIDEO','020 Forward (Chuyển tiếp) yêu cầu.mp4','video/mp4',127857606,NULL,NULL,NULL,'/api/media/videos/n0/6b081a74-f373-4f6f-902d-001bd2f23b03.mp4',NULL,'/api/media/videos/n0/6b081a74-f373-4f6f-902d-001bd2f23b03.mp4',NULL,NULL,NULL,'READY',597,NULL,NULL,NULL,'2026-09-21 16:44:17','2026-09-21 16:44:17'),(68,6,'LOCAL','VIDEO','021 Redirect (Chuyển hướng) yêu cầu.mp4','video/mp4',118475974,NULL,NULL,NULL,'/api/media/videos/n0/378e48cf-6893-4bed-8f37-6ecfbaab8685.mp4',NULL,'/api/media/videos/n0/378e48cf-6893-4bed-8f37-6ecfbaab8685.mp4',NULL,NULL,NULL,'READY',600,NULL,NULL,NULL,'2026-09-21 16:44:20','2026-09-21 16:44:20'),(69,6,'LOCAL','VIDEO','022 Dữ liệu gốc  @ResponseBody.mp4','video/mp4',7571358,NULL,NULL,NULL,'/api/media/videos/n0/d4927d71-3c0e-4b36-b235-47dda35eb8e7.mp4',NULL,'/api/media/videos/n0/d4927d71-3c0e-4b36-b235-47dda35eb8e7.mp4',NULL,NULL,NULL,'READY',86,NULL,NULL,NULL,'2026-09-21 16:44:20','2026-09-21 16:44:20'),(70,6,'LOCAL','VIDEO','001 Template engine Thymeleaf.mp4','video/mp4',108758310,NULL,NULL,NULL,'/api/media/videos/n0/62e3a09b-b8a7-4967-83f1-8473456cea2c.mp4',NULL,'/api/media/videos/n0/62e3a09b-b8a7-4967-83f1-8473456cea2c.mp4',NULL,NULL,NULL,'READY',760,NULL,NULL,NULL,'2026-09-21 16:52:42','2026-09-21 16:52:42'),(71,6,'LOCAL','VIDEO','002 Các thành phần của Thymeleaf.mp4','video/mp4',68090730,NULL,NULL,NULL,'/api/media/videos/n0/cb26a83c-54a1-4a3f-8257-217772d2a5a4.mp4',NULL,'/api/media/videos/n0/cb26a83c-54a1-4a3f-8257-217772d2a5a4.mp4',NULL,NULL,NULL,'READY',415,NULL,NULL,NULL,'2026-09-21 16:52:42','2026-09-21 16:52:42'),(72,6,'LOCAL','VIDEO','003 Biểu thức chuẩn (Standard Expressions).mp4','video/mp4',150620796,NULL,NULL,NULL,'/api/media/videos/n0/b84e797c-6263-47ee-8ec4-f686ad977990.mp4',NULL,'/api/media/videos/n0/b84e797c-6263-47ee-8ec4-f686ad977990.mp4',NULL,NULL,NULL,'READY',914,NULL,NULL,NULL,'2026-09-21 16:52:44','2026-09-21 16:52:44'),(73,6,'LOCAL','VIDEO','004 Biểu thức chuẩn Variable expressions {…}.mp4','video/mp4',24390021,NULL,NULL,NULL,'/api/media/videos/n0/0c3d6552-5ad8-46ce-9cd4-514605dfbfc5.mp4',NULL,'/api/media/videos/n0/0c3d6552-5ad8-46ce-9cd4-514605dfbfc5.mp4',NULL,NULL,NULL,'READY',268,NULL,NULL,NULL,'2026-09-21 16:52:44','2026-09-21 16:52:44'),(74,6,'LOCAL','VIDEO','005 Biểu thức {…} Selection expressions.mp4','video/mp4',21592598,NULL,NULL,NULL,'/api/media/videos/n0/613eb584-272c-4348-a614-8cf93e135ae1.mp4',NULL,'/api/media/videos/n0/613eb584-272c-4348-a614-8cf93e135ae1.mp4',NULL,NULL,NULL,'READY',332,NULL,NULL,NULL,'2026-09-21 16:52:44','2026-09-21 16:52:44'),(75,6,'LOCAL','VIDEO','006 Biểu thức {} Message (i18n) expressions.mp4','video/mp4',38460214,NULL,NULL,NULL,'/api/media/videos/n0/a40c1452-d4d0-477d-9424-c8296088bfe0.mp4',NULL,'/api/media/videos/n0/a40c1452-d4d0-477d-9424-c8296088bfe0.mp4',NULL,NULL,NULL,'READY',371,NULL,NULL,NULL,'2026-09-21 16:52:45','2026-09-21 16:52:45'),(76,6,'LOCAL','VIDEO','007 Hỗ trợ đa ngữ (I18N).mp4','video/mp4',56589192,NULL,NULL,NULL,'/api/media/videos/n0/5589cafa-d498-441a-b438-5839ef5221e6.mp4',NULL,'/api/media/videos/n0/5589cafa-d498-441a-b438-5839ef5221e6.mp4',NULL,NULL,NULL,'READY',373,NULL,NULL,NULL,'2026-09-21 16:52:45','2026-09-21 16:52:45'),(77,6,'LOCAL','VIDEO','008 Biểu thức @{}  Link (URL) expressions.mp4','video/mp4',98854431,NULL,NULL,NULL,'/api/media/videos/n0/6df2228d-90ad-46e1-a066-f1fb3c7df42a.mp4',NULL,'/api/media/videos/n0/6df2228d-90ad-46e1-a066-f1fb3c7df42a.mp4',NULL,NULL,NULL,'READY',930,NULL,NULL,NULL,'2026-09-21 16:52:47','2026-09-21 16:52:47'),(78,6,'LOCAL','VIDEO','009 Toán tử (Operators).mp4','video/mp4',9349364,NULL,NULL,NULL,'/api/media/videos/n0/00bae5cf-9c66-46f4-9f56-6d636c2088f8.mp4',NULL,'/api/media/videos/n0/00bae5cf-9c66-46f4-9f56-6d636c2088f8.mp4',NULL,NULL,NULL,'READY',120,NULL,NULL,NULL,'2026-09-21 16:52:47','2026-09-21 16:52:47'),(79,6,'LOCAL','VIDEO','010 Toán tử chuỗi (String Operators).mp4','video/mp4',28578287,NULL,NULL,NULL,'/api/media/videos/n0/faaa3c19-1aee-48b6-bd2e-68e81bd0b487.mp4',NULL,'/api/media/videos/n0/faaa3c19-1aee-48b6-bd2e-68e81bd0b487.mp4',NULL,NULL,NULL,'READY',417,NULL,NULL,NULL,'2026-09-21 16:52:47','2026-09-21 16:52:47'),(80,6,'LOCAL','VIDEO','011 Toán tử số học  (Arithmetic Operators).mp4','video/mp4',46126728,NULL,NULL,NULL,'/api/media/videos/n0/a9fdd7bb-bb8d-406f-9e44-b4e2c0456707.mp4',NULL,'/api/media/videos/n0/a9fdd7bb-bb8d-406f-9e44-b4e2c0456707.mp4',NULL,NULL,NULL,'READY',302,NULL,NULL,NULL,'2026-09-21 16:52:48','2026-09-21 16:52:48'),(81,6,'LOCAL','VIDEO','012 Toán tử so sánh (Comparison Operators).mp4','video/mp4',49371293,NULL,NULL,NULL,'/api/media/videos/n0/258242d1-6923-4092-9cd4-2353706fc36d.mp4',NULL,'/api/media/videos/n0/258242d1-6923-4092-9cd4-2353706fc36d.mp4',NULL,NULL,NULL,'READY',396,NULL,NULL,NULL,'2026-09-21 16:52:48','2026-09-21 16:52:48'),(82,6,'LOCAL','VIDEO','013 Toán tử logic (Logic Operators).mp4','video/mp4',11885982,NULL,NULL,NULL,'/api/media/videos/n0/f3f3d954-5c79-4e9b-9682-e1b2306c6b9d.mp4',NULL,'/api/media/videos/n0/f3f3d954-5c79-4e9b-9682-e1b2306c6b9d.mp4',NULL,NULL,NULL,'READY',159,NULL,NULL,NULL,'2026-09-21 16:52:49','2026-09-21 16:52:49'),(83,6,'LOCAL','VIDEO','014 Toán tử điều kiện (Conditional Operators).mp4','video/mp4',42902715,NULL,NULL,NULL,'/api/media/videos/n0/6678d9fe-8b11-4d62-8b47-9f6c4f73ad06.mp4',NULL,'/api/media/videos/n0/6678d9fe-8b11-4d62-8b47-9f6c4f73ad06.mp4',NULL,NULL,NULL,'READY',213,NULL,NULL,NULL,'2026-09-21 16:52:49','2026-09-21 16:52:49'),(84,6,'LOCAL','VIDEO','015 Thuộc tính kiểm soát luồng thực hiện.mp4','video/mp4',13058295,NULL,NULL,NULL,'/api/media/videos/n0/01bec4f9-6da8-49ab-aabd-a8179ff0a7e1.mp4',NULL,'/api/media/videos/n0/01bec4f9-6da8-49ab-aabd-a8179ff0a7e1.mp4',NULL,NULL,NULL,'READY',148,NULL,NULL,NULL,'2026-09-21 16:52:49','2026-09-21 16:52:49'),(85,6,'LOCAL','VIDEO','016 Thuộc tính  thif và thunless.mp4','video/mp4',104377478,NULL,NULL,NULL,'/api/media/videos/n0/3f5c69df-0ac5-4cdd-90ef-2e78ccd48801.mp4',NULL,'/api/media/videos/n0/3f5c69df-0ac5-4cdd-90ef-2e78ccd48801.mp4',NULL,NULL,NULL,'READY',627,NULL,NULL,NULL,'2026-09-21 16:52:50','2026-09-21 16:52:50'),(86,6,'LOCAL','VIDEO','017 Thuộc tính  thswitch.mp4','video/mp4',35453166,NULL,NULL,NULL,'/api/media/videos/n0/5b67cb9e-8650-47a8-80dc-0eee2d65672d.mp4',NULL,'/api/media/videos/n0/5b67cb9e-8650-47a8-80dc-0eee2d65672d.mp4',NULL,NULL,NULL,'READY',210,NULL,NULL,NULL,'2026-09-21 16:52:51','2026-09-21 16:52:51'),(87,6,'LOCAL','VIDEO','018 Thuộc tính  theach.mp4','video/mp4',80550990,NULL,NULL,NULL,'/api/media/videos/n0/4950a997-fd47-4d91-a98b-ea10f2f82115.mp4',NULL,'/api/media/videos/n0/4950a997-fd47-4d91-a98b-ea10f2f82115.mp4',NULL,NULL,NULL,'READY',411,NULL,NULL,NULL,'2026-09-21 16:52:51','2026-09-21 16:52:51'),(88,6,'LOCAL','VIDEO','001 Thymeleaf Fragments.mp4','video/mp4',117931414,NULL,NULL,NULL,'/api/media/videos/n0/7f289bed-8f9e-4253-ad2b-a68508fa9a8a.mp4',NULL,'/api/media/videos/n0/7f289bed-8f9e-4253-ad2b-a68508fa9a8a.mp4',NULL,NULL,NULL,'READY',835,NULL,NULL,NULL,'2026-09-21 16:53:24','2026-09-21 16:53:24'),(89,6,'LOCAL','VIDEO','002 Gộp nội dung với Markup Selectors (Bộ lựa chọn đánh dấu).mp4','video/mp4',49591980,NULL,NULL,NULL,'/api/media/videos/n0/67326a2f-b086-4808-b17b-bc18faa119b1.mp4',NULL,'/api/media/videos/n0/67326a2f-b086-4808-b17b-bc18faa119b1.mp4',NULL,NULL,NULL,'READY',398,NULL,NULL,NULL,'2026-09-21 16:53:25','2026-09-21 16:53:25'),(90,6,'LOCAL','VIDEO','003 Parameterized Fragments.mp4','video/mp4',88974836,NULL,NULL,NULL,'/api/media/videos/n0/0a24419d-6b19-4173-be98-73aea7095e53.mp4',NULL,'/api/media/videos/n0/0a24419d-6b19-4173-be98-73aea7095e53.mp4',NULL,NULL,NULL,'READY',503,NULL,NULL,NULL,'2026-09-21 16:53:25','2026-09-21 16:53:25'),(91,6,'LOCAL','VIDEO','004 Fragment Inclusion Expressions.mp4','video/mp4',22477392,NULL,NULL,NULL,'/api/media/videos/n0/450346c0-69a5-4bc1-9c0b-0cef7261e1b0.mp4',NULL,'/api/media/videos/n0/450346c0-69a5-4bc1-9c0b-0cef7261e1b0.mp4',NULL,NULL,NULL,'READY',142,NULL,NULL,NULL,'2026-09-21 16:53:26','2026-09-21 16:53:26'),(92,6,'LOCAL','VIDEO','005 Thymeleaf Layout Dialect.mp4','video/mp4',136047042,NULL,NULL,NULL,'/api/media/videos/n0/fb70ba04-40a1-4f09-8b3c-2f5706556cd6.mp4',NULL,'/api/media/videos/n0/fb70ba04-40a1-4f09-8b3c-2f5706556cd6.mp4',NULL,NULL,NULL,'READY',940,NULL,NULL,NULL,'2026-09-21 16:53:27','2026-09-21 16:53:27'),(93,6,'LOCAL','VIDEO','1 Introduction.mp4','video/mp4',41108683,NULL,NULL,NULL,'/api/media/videos/n0/786814ef-fcff-4d57-a078-a5cc98de792f.mp4',NULL,'/api/media/videos/n0/786814ef-fcff-4d57-a078-a5cc98de792f.mp4',NULL,NULL,NULL,'READY',315,NULL,NULL,NULL,'2026-09-21 16:54:31','2026-09-21 16:54:31'),(94,6,'LOCAL','VIDEO','3 Udemy ratings and reviews.mp4','video/mp4',12017778,NULL,NULL,NULL,'/api/media/videos/n0/321595b0-e1e9-4b5c-acf2-230b336d896b.mp4',NULL,'/api/media/videos/n0/321595b0-e1e9-4b5c-acf2-230b336d896b.mp4',NULL,NULL,NULL,'READY',38,NULL,NULL,NULL,'2026-09-21 16:54:31','2026-09-21 16:54:31'),(95,6,'LOCAL','VIDEO','4 How this setup differs from traditional React + Firebase apps.mp4','video/mp4',27594558,NULL,NULL,NULL,'/api/media/videos/n0/148f2172-372b-4fe4-ac0f-275a0bd3cf64.mp4',NULL,'/api/media/videos/n0/148f2172-372b-4fe4-ac0f-275a0bd3cf64.mp4',NULL,NULL,NULL,'READY',388,NULL,NULL,NULL,'2026-09-21 16:54:31','2026-09-21 16:54:31'),(96,6,'LOCAL','VIDEO','5 Overview of stack + helpful tools for this course.mp4','video/mp4',14611239,NULL,NULL,NULL,'/api/media/videos/n0/e9a5d4fb-9c67-4216-a7f0-cb3895efa466.mp4',NULL,'/api/media/videos/n0/e9a5d4fb-9c67-4216-a7f0-cb3895efa466.mp4',NULL,NULL,NULL,'READY',193,NULL,NULL,NULL,'2026-09-21 16:54:31','2026-09-21 16:54:31'),(97,6,'LOCAL','VIDEO','6 Set up Next JS project.mp4','video/mp4',20352167,NULL,NULL,NULL,'/api/media/videos/n0/8c427ad7-5c6f-4ac9-ac59-40466f254f18.mp4',NULL,'/api/media/videos/n0/8c427ad7-5c6f-4ac9-ac59-40466f254f18.mp4',NULL,NULL,NULL,'READY',258,NULL,NULL,NULL,'2026-09-21 16:54:32','2026-09-21 16:54:32'),(98,6,'LOCAL','VIDEO','7 Set up Firebase project.mp4','video/mp4',68002275,NULL,NULL,NULL,'/api/media/videos/n0/b5ba4b0b-08ae-456e-850f-8016685eba36.mp4',NULL,'/api/media/videos/n0/b5ba4b0b-08ae-456e-850f-8016685eba36.mp4',NULL,NULL,NULL,'READY',706,NULL,NULL,NULL,'2026-09-21 16:54:32','2026-09-21 16:54:32'),(99,6,'LOCAL','VIDEO','8 Connect Next JS to Firebase.mp4','video/mp4',148570043,NULL,NULL,NULL,'/api/media/videos/n0/3bccf87d-d4e3-4f57-b5fa-167f0cddc41e.mp4',NULL,'/api/media/videos/n0/3bccf87d-d4e3-4f57-b5fa-167f0cddc41e.mp4',NULL,NULL,NULL,'READY',1003,NULL,NULL,NULL,'2026-09-21 16:54:34','2026-09-21 16:54:34'),(100,6,'LOCAL','VIDEO','9 Add the navbar with auth links.mp4','video/mp4',64364491,NULL,NULL,NULL,'/api/media/videos/n0/1fc087ac-cd57-4727-ab7c-798c4e2e8c5b.mp4',NULL,'/api/media/videos/n0/1fc087ac-cd57-4727-ab7c-798c4e2e8c5b.mp4',NULL,NULL,NULL,'READY',547,NULL,NULL,NULL,'2026-09-21 16:54:35','2026-09-21 16:54:35'),(101,6,'LOCAL','VIDEO','10 Install shadcn ui and add login with Google.mp4','video/mp4',79288251,NULL,NULL,NULL,'/api/media/videos/n0/2380155f-eede-4f90-bd68-8995e94c7f8c.mp4',NULL,'/api/media/videos/n0/2380155f-eede-4f90-bd68-8995e94c7f8c.mp4',NULL,NULL,NULL,'READY',637,NULL,NULL,NULL,'2026-09-21 16:54:36','2026-09-21 16:54:36'),(102,6,'LOCAL','VIDEO','11 Create auth context and display logged in user.mp4','video/mp4',121894334,NULL,NULL,NULL,'/api/media/videos/n0/cd055269-7813-4c67-8ab1-d52578cb305d.mp4',NULL,'/api/media/videos/n0/cd055269-7813-4c67-8ab1-d52578cb305d.mp4',NULL,NULL,NULL,'READY',875,NULL,NULL,NULL,'2026-09-21 16:54:37','2026-09-21 16:54:37'),(103,6,'LOCAL','VIDEO','12 Add logout functionality.mp4','video/mp4',51935310,NULL,NULL,NULL,'/api/media/videos/n0/b95cf487-599f-4204-8f58-c747dde355bd.mp4',NULL,'/api/media/videos/n0/b95cf487-599f-4204-8f58-c747dde355bd.mp4',NULL,NULL,NULL,'READY',368,NULL,NULL,NULL,'2026-09-21 16:54:37','2026-09-21 16:54:37'),(104,6,'LOCAL','VIDEO','13 Improve navbar styling.mp4','video/mp4',82268006,NULL,NULL,NULL,'/api/media/videos/n0/80f775ae-3896-4a41-b344-63ad7c468f8e.mp4',NULL,'/api/media/videos/n0/80f775ae-3896-4a41-b344-63ad7c468f8e.mp4',NULL,NULL,NULL,'READY',597,NULL,NULL,NULL,'2026-09-21 16:54:38','2026-09-21 16:54:38'),(105,6,'LOCAL','VIDEO','14 Improve login page styling.mp4','video/mp4',99054346,NULL,NULL,NULL,'/api/media/videos/n0/50f3a572-0d09-40ea-9111-038f20a9af83.mp4',NULL,'/api/media/videos/n0/50f3a572-0d09-40ea-9111-038f20a9af83.mp4',NULL,NULL,NULL,'READY',738,NULL,NULL,NULL,'2026-09-21 16:54:39','2026-09-21 16:54:39'),(106,6,'LOCAL','VIDEO','15 Add the current user dropdown to the navbar.mp4','video/mp4',112576083,NULL,NULL,NULL,'/api/media/videos/n0/f84cf8ba-aa5f-479c-8703-15ee9b6435d3.mp4',NULL,'/api/media/videos/n0/f84cf8ba-aa5f-479c-8703-15ee9b6435d3.mp4',NULL,NULL,NULL,'READY',806,NULL,NULL,NULL,'2026-09-21 16:54:40','2026-09-21 16:54:40'),(107,6,'LOCAL','VIDEO','16 Add the admin role to a user and save auth tokens in cookies.mp4','video/mp4',136158438,NULL,NULL,NULL,'/api/media/videos/n0/42868f24-5735-4073-96f5-92de2094892e.mp4',NULL,'/api/media/videos/n0/42868f24-5735-4073-96f5-92de2094892e.mp4',NULL,NULL,NULL,'READY',892,NULL,NULL,NULL,'2026-09-21 16:54:42','2026-09-21 16:54:42'),(108,6,'LOCAL','VIDEO','17 Conditionally render user profile menu items.mp4','video/mp4',40497671,NULL,NULL,NULL,'/api/media/videos/n0/bc214448-6200-4f8e-9d38-18e99f38002d.mp4',NULL,'/api/media/videos/n0/bc214448-6200-4f8e-9d38-18e99f38002d.mp4',NULL,NULL,NULL,'READY',274,NULL,NULL,NULL,'2026-09-21 16:54:42','2026-09-21 16:54:42'),(109,6,'LOCAL','VIDEO','18 Add the admin dashboard page + route protection with Next JS middleware.mp4','video/mp4',72455623,NULL,NULL,NULL,'/api/media/videos/n0/df0357d9-fa25-402c-9c39-fa904f4100c2.mp4',NULL,'/api/media/videos/n0/df0357d9-fa25-402c-9c39-fa904f4100c2.mp4',NULL,NULL,NULL,'READY',596,NULL,NULL,NULL,'2026-09-21 16:54:43','2026-09-21 16:54:43'),(110,6,'LOCAL','VIDEO','19 Build the admin dashboard main page.mp4','video/mp4',91790190,NULL,NULL,NULL,'/api/media/videos/n0/53728740-254e-47f1-81fe-31ccd0e2141b.mp4',NULL,'/api/media/videos/n0/53728740-254e-47f1-81fe-31ccd0e2141b.mp4',NULL,NULL,NULL,'READY',675,NULL,NULL,NULL,'2026-09-21 16:54:45','2026-09-21 16:54:45'),(111,6,'LOCAL','VIDEO','20 Create the New Property page.mp4','video/mp4',29322707,NULL,NULL,NULL,'/api/media/videos/n0/f6ead6a0-8f4e-47f1-b9f4-f7aa41a97164.mp4',NULL,'/api/media/videos/n0/f6ead6a0-8f4e-47f1-b9f4-f7aa41a97164.mp4',NULL,NULL,NULL,'READY',252,NULL,NULL,NULL,'2026-09-21 16:54:46','2026-09-21 16:54:46'),(112,6,'LOCAL','VIDEO','21 Create the new property form schema.mp4','video/mp4',107689387,NULL,NULL,NULL,'/api/media/videos/n0/a1d48c73-8611-4034-9095-b9a8788727e4.mp4',NULL,'/api/media/videos/n0/a1d48c73-8611-4034-9095-b9a8788727e4.mp4',NULL,NULL,NULL,'READY',737,NULL,NULL,NULL,'2026-09-21 16:54:47','2026-09-21 16:54:47'),(113,6,'LOCAL','VIDEO','22 Create PropertyForm component and start building form UI.mp4','video/mp4',131296717,NULL,NULL,NULL,'/api/media/videos/n0/9c133629-0735-4390-9fc5-5a374be1f391.mp4',NULL,'/api/media/videos/n0/9c133629-0735-4390-9fc5-5a374be1f391.mp4',NULL,NULL,NULL,'READY',880,NULL,NULL,NULL,'2026-09-21 16:54:48','2026-09-21 16:54:48'),(114,6,'LOCAL','VIDEO','23 Finish rendering the PropertyForm fields.mp4','video/mp4',110839945,NULL,NULL,NULL,'/api/media/videos/n0/7629047d-23c7-435d-aeeb-208bf02ea6a1.mp4',NULL,'/api/media/videos/n0/7629047d-23c7-435d-aeeb-208bf02ea6a1.mp4',NULL,NULL,NULL,'READY',720,NULL,NULL,NULL,'2026-09-21 16:54:50','2026-09-21 16:54:50'),(115,6,'LOCAL','VIDEO','24 Create the saveNewProperty server action and save data to firestore.mp4','video/mp4',98857516,NULL,NULL,NULL,'/api/media/videos/n0/889abc78-283a-4d19-9821-6fb1c66958f9.mp4',NULL,'/api/media/videos/n0/889abc78-283a-4d19-9821-6fb1c66958f9.mp4',NULL,NULL,NULL,'READY',706,NULL,NULL,NULL,'2026-09-21 16:54:52','2026-09-21 16:54:52'),(116,6,'LOCAL','VIDEO','25 Improve the UI when submitting the new property form.mp4','video/mp4',81300082,NULL,NULL,NULL,'/api/media/videos/n0/7c98063d-cc4b-4e07-b078-e5410513c26c.mp4',NULL,'/api/media/videos/n0/7c98063d-cc4b-4e07-b078-e5410513c26c.mp4',NULL,NULL,NULL,'READY',621,NULL,NULL,NULL,'2026-09-21 16:54:53','2026-09-21 16:54:53'),(117,6,'LOCAL','VIDEO','26 Query for properties data.mp4','video/mp4',111786765,NULL,NULL,NULL,'/api/media/videos/n0/2d8ba10e-767a-4ff0-8d14-845a4668198a.mp4',NULL,'/api/media/videos/n0/2d8ba10e-767a-4ff0-8d14-845a4668198a.mp4',NULL,NULL,NULL,'READY',756,NULL,NULL,NULL,'2026-09-21 16:54:55','2026-09-21 16:54:55'),(118,6,'LOCAL','VIDEO','27 Render the properties list in a table.mp4','video/mp4',95282745,NULL,NULL,NULL,'/api/media/videos/n0/9eded158-0901-41ce-97ef-342e1262a300.mp4',NULL,'/api/media/videos/n0/9eded158-0901-41ce-97ef-342e1262a300.mp4',NULL,NULL,NULL,'READY',658,NULL,NULL,NULL,'2026-09-21 16:54:57','2026-09-21 16:54:57'),(119,6,'LOCAL','VIDEO','28 Calculate the total pages for a firestore query.mp4','video/mp4',61459373,NULL,NULL,NULL,'/api/media/videos/n0/d6b06d30-4293-4700-ba1f-d2067c1eb365.mp4',NULL,'/api/media/videos/n0/d6b06d30-4293-4700-ba1f-d2067c1eb365.mp4',NULL,NULL,NULL,'READY',411,NULL,NULL,NULL,'2026-09-21 16:54:58','2026-09-21 16:54:58'),(120,6,'LOCAL','VIDEO','29 Render the pagination buttons under the properties table.mp4','video/mp4',61807924,NULL,NULL,NULL,'/api/media/videos/n0/77881386-f9ba-4d7a-abbd-e3799110fb6c.mp4',NULL,'/api/media/videos/n0/77881386-f9ba-4d7a-abbd-e3799110fb6c.mp4',NULL,NULL,NULL,'READY',445,NULL,NULL,NULL,'2026-09-21 16:54:59','2026-09-21 16:54:59'),(121,6,'LOCAL','VIDEO','30 Create the edit property page.mp4','video/mp4',84949752,NULL,NULL,NULL,'/api/media/videos/n0/37349f4e-c14a-45f4-817f-ede2f5f51cab.mp4',NULL,'/api/media/videos/n0/37349f4e-c14a-45f4-817f-ede2f5f51cab.mp4',NULL,NULL,NULL,'READY',549,NULL,NULL,NULL,'2026-09-21 16:55:00','2026-09-21 16:55:00'),(122,6,'LOCAL','VIDEO','31 Create the edit property form.mp4','video/mp4',95899037,NULL,NULL,NULL,'/api/media/videos/n0/3d5d8d2b-1664-43f3-8314-65cea58e5199.mp4',NULL,'/api/media/videos/n0/3d5d8d2b-1664-43f3-8314-65cea58e5199.mp4',NULL,NULL,NULL,'READY',638,NULL,NULL,NULL,'2026-09-21 16:55:01','2026-09-21 16:55:01'),(123,6,'LOCAL','VIDEO','32 Create the updateProperty server action.mp4','video/mp4',114696464,NULL,NULL,NULL,'/api/media/videos/n0/5df4ab38-e330-4d20-be9b-6b8c6eff5533.mp4',NULL,'/api/media/videos/n0/5df4ab38-e330-4d20-be9b-6b8c6eff5533.mp4',NULL,NULL,NULL,'READY',827,NULL,NULL,NULL,'2026-09-21 16:55:03','2026-09-21 16:55:03'),(124,6,'LOCAL','VIDEO','33 Add route protection for all admin-dashboard routes and auth pages.mp4','video/mp4',98953169,NULL,NULL,NULL,'/api/media/videos/n0/bc39d340-8202-435f-8f75-90f4491f9ca7.mp4',NULL,'/api/media/videos/n0/bc39d340-8202-435f-8f75-90f4491f9ca7.mp4',NULL,NULL,NULL,'READY',800,NULL,NULL,NULL,'2026-09-21 16:57:49','2026-09-21 16:57:49'),(125,6,'LOCAL','VIDEO','34 Improve the styling of the properties table.mp4','video/mp4',133064263,NULL,NULL,NULL,'/api/media/videos/n0/019d76fb-8390-48f9-8fcb-00a39f74ab52.mp4',NULL,'/api/media/videos/n0/019d76fb-8390-48f9-8fcb-00a39f74ab52.mp4',NULL,NULL,NULL,'READY',925,NULL,NULL,NULL,'2026-09-21 16:57:51','2026-09-21 16:57:51'),(126,6,'LOCAL','VIDEO','35 Create the image uploader component.mp4','video/mp4',77828725,NULL,NULL,NULL,'/api/media/videos/n0/ce0b52d9-5499-4196-a121-31abe624a6fe.mp4',NULL,'/api/media/videos/n0/ce0b52d9-5499-4196-a121-31abe624a6fe.mp4',NULL,NULL,NULL,'READY',647,NULL,NULL,NULL,'2026-09-21 16:57:52','2026-09-21 16:57:52'),(127,6,'LOCAL','VIDEO','36 Store selected images in the form state.mp4','video/mp4',143151160,NULL,NULL,NULL,'/api/media/videos/n0/0ede2aa1-73d1-480b-9b71-3339396c9367.mp4',NULL,'/api/media/videos/n0/0ede2aa1-73d1-480b-9b71-3339396c9367.mp4',NULL,NULL,NULL,'READY',821,NULL,NULL,NULL,'2026-09-21 16:57:53','2026-09-21 16:57:53'),(128,6,'LOCAL','VIDEO','37 Render the images list.mp4','video/mp4',136486179,NULL,NULL,NULL,'/api/media/videos/n0/79696a2d-6502-4f7b-9cc9-492be1effb8d.mp4',NULL,'/api/media/videos/n0/79696a2d-6502-4f7b-9cc9-492be1effb8d.mp4',NULL,NULL,NULL,'READY',848,NULL,NULL,NULL,'2026-09-21 16:57:55','2026-09-21 16:57:55'),(129,6,'LOCAL','VIDEO','38 Implement reorder and delete images.mp4','video/mp4',60679766,NULL,NULL,NULL,'/api/media/videos/n0/68f669b5-5096-4e49-ba6e-02352f1501c4.mp4',NULL,'/api/media/videos/n0/68f669b5-5096-4e49-ba6e-02352f1501c4.mp4',NULL,NULL,NULL,'READY',381,NULL,NULL,NULL,'2026-09-21 16:57:56','2026-09-21 16:57:56'),(130,6,'LOCAL','VIDEO','39 Implement upload images to firebase storage for new properties.mp4','video/mp4',172714926,NULL,NULL,NULL,'/api/media/videos/n0/1d8ae62a-e33b-4218-bd74-780380ec3d4b.mp4',NULL,'/api/media/videos/n0/1d8ae62a-e33b-4218-bd74-780380ec3d4b.mp4',NULL,NULL,NULL,'READY',1164,NULL,NULL,NULL,'2026-09-21 16:57:58','2026-09-21 16:57:58'),(131,6,'LOCAL','VIDEO','40 Load existing uploaded images into the edit property form.mp4','video/mp4',133222621,NULL,NULL,NULL,'/api/media/videos/n0/1bd447fa-a5e5-47df-ae49-7f8c29bc14dd.mp4',NULL,'/api/media/videos/n0/1bd447fa-a5e5-47df-ae49-7f8c29bc14dd.mp4',NULL,NULL,NULL,'READY',813,NULL,NULL,NULL,'2026-09-21 16:57:59','2026-09-21 16:57:59'),(132,6,'LOCAL','VIDEO','41 Implement upload + delete images when updating a property.mp4','video/mp4',169603583,NULL,NULL,NULL,'/api/media/videos/n0/24d6936b-18e8-4d53-8dd1-e8a7e19e9f46.mp4',NULL,'/api/media/videos/n0/24d6936b-18e8-4d53-8dd1-e8a7e19e9f46.mp4',NULL,NULL,NULL,'READY',1044,NULL,NULL,NULL,'2026-09-21 16:58:01','2026-09-21 16:58:01'),(133,6,'LOCAL','VIDEO','42 Create the property page and render the description as markdown.mp4','video/mp4',156119293,NULL,NULL,NULL,'/api/media/videos/n0/c4f17acd-ea93-4fe8-afc7-ce579aac2229.mp4',NULL,'/api/media/videos/n0/c4f17acd-ea93-4fe8-afc7-ce579aac2229.mp4',NULL,NULL,NULL,'READY',991,NULL,NULL,NULL,'2026-09-21 16:58:03','2026-09-21 16:58:03'),(134,6,'LOCAL','VIDEO','43 Render the property details.mp4','video/mp4',106131724,NULL,NULL,NULL,'/api/media/videos/n0/b68de0fe-284a-4d90-929d-42be9f0eb209.mp4',NULL,'/api/media/videos/n0/b68de0fe-284a-4d90-929d-42be9f0eb209.mp4',NULL,NULL,NULL,'READY',582,NULL,NULL,NULL,'2026-09-21 16:58:04','2026-09-21 16:58:04'),(135,6,'LOCAL','VIDEO','44 Render the property images carousel and back button.mp4','video/mp4',116019880,NULL,NULL,NULL,'/api/media/videos/n0/b0abc6e9-aac2-487d-b87e-f0b20e320803.mp4',NULL,'/api/media/videos/n0/b0abc6e9-aac2-487d-b87e-f0b20e320803.mp4',NULL,NULL,NULL,'READY',590,NULL,NULL,NULL,'2026-09-21 16:58:06','2026-09-21 16:58:06'),(136,6,'LOCAL','VIDEO','45 Create the property search page and search filters.mp4','video/mp4',91573807,NULL,NULL,NULL,'/api/media/videos/n0/cd01480d-72bb-4bd7-9305-b20f20997f79.mp4',NULL,'/api/media/videos/n0/cd01480d-72bb-4bd7-9305-b20f20997f79.mp4',NULL,NULL,NULL,'READY',636,NULL,NULL,NULL,'2026-09-21 16:58:07','2026-09-21 16:58:07'),(137,6,'LOCAL','VIDEO','46 Hook up the search filters to the URL and create firestore indexes.mp4','video/mp4',156954736,NULL,NULL,NULL,'/api/media/videos/n0/9b94d619-0781-455f-b4e6-7cf362f7755e.mp4',NULL,'/api/media/videos/n0/9b94d619-0781-455f-b4e6-7cf362f7755e.mp4',NULL,NULL,NULL,'READY',1114,NULL,NULL,NULL,'2026-09-21 16:58:09','2026-09-21 16:58:09'),(138,6,'LOCAL','VIDEO','47 Render the filtered property list.mp4','video/mp4',170288419,NULL,NULL,NULL,'/api/media/videos/n0/f53e9042-7771-4a91-8006-6b8efa974e88.mp4',NULL,'/api/media/videos/n0/f53e9042-7771-4a91-8006-6b8efa974e88.mp4',NULL,NULL,NULL,'READY',1085,NULL,NULL,NULL,'2026-09-21 16:58:11','2026-09-21 16:58:11'),(139,6,'LOCAL','VIDEO','48 Add the pagination buttons for property search.mp4','video/mp4',98894334,NULL,NULL,NULL,'/api/media/videos/n0/fec79df1-83ac-4f11-9b52-a0b5f77ec2f9.mp4',NULL,'/api/media/videos/n0/fec79df1-83ac-4f11-9b52-a0b5f77ec2f9.mp4',NULL,NULL,NULL,'READY',671,NULL,NULL,NULL,'2026-09-21 16:58:13','2026-09-21 16:58:13'),(140,6,'LOCAL','VIDEO','49 Create the register form schema.mp4','video/mp4',85889432,NULL,NULL,NULL,'/api/media/videos/n0/fae3ba51-dbfa-4ef8-bddd-22aadce7b776.mp4',NULL,'/api/media/videos/n0/fae3ba51-dbfa-4ef8-bddd-22aadce7b776.mp4',NULL,NULL,NULL,'READY',676,NULL,NULL,NULL,'2026-09-21 16:58:14','2026-09-21 16:58:14'),(141,6,'LOCAL','VIDEO','50 Render the register form UI.mp4','video/mp4',56564432,NULL,NULL,NULL,'/api/media/videos/n0/bb14d0a4-a14d-4404-a81c-6042cd01324d.mp4',NULL,'/api/media/videos/n0/bb14d0a4-a14d-4404-a81c-6042cd01324d.mp4',NULL,NULL,NULL,'READY',408,NULL,NULL,NULL,'2026-09-21 16:58:15','2026-09-21 16:58:15'),(142,6,'LOCAL','VIDEO','51 Create the register user server action.mp4','video/mp4',78444511,NULL,NULL,NULL,'/api/media/videos/n0/d292bff0-9f53-4d68-a233-ad820659fa97.mp4',NULL,'/api/media/videos/n0/d292bff0-9f53-4d68-a233-ad820659fa97.mp4',NULL,NULL,NULL,'READY',554,NULL,NULL,NULL,'2026-09-21 16:58:17','2026-09-21 16:58:17'),(143,6,'LOCAL','VIDEO','52 Build the login with email and password form.mp4','video/mp4',141713011,NULL,NULL,NULL,'/api/media/videos/n0/8ec63d7b-5de3-409d-8e79-bc3fcf67d876.mp4',NULL,'/api/media/videos/n0/8ec63d7b-5de3-409d-8e79-bc3fcf67d876.mp4',NULL,NULL,NULL,'READY',1058,NULL,NULL,NULL,'2026-09-21 16:58:19','2026-09-21 16:58:19'),(144,6,'LOCAL','VIDEO','53 Improve validation and errors for login and register.mp4','video/mp4',134736263,NULL,NULL,NULL,'/api/media/videos/n0/8c9aff00-4ac7-492a-9855-f51338c60d4a.mp4',NULL,'/api/media/videos/n0/8c9aff00-4ac7-492a-9855-f51338c60d4a.mp4',NULL,NULL,NULL,'READY',1009,NULL,NULL,NULL,'2026-09-21 16:58:22','2026-09-21 16:58:22'),(145,6,'LOCAL','VIDEO','54 Update the middleware to cater for expiring auth tokens.mp4','video/mp4',140083804,NULL,NULL,NULL,'/api/media/videos/n0/7ab16822-22a5-4113-a617-2b67ca573f40.mp4',NULL,'/api/media/videos/n0/7ab16822-22a5-4113-a617-2b67ca573f40.mp4',NULL,NULL,NULL,'READY',1025,NULL,NULL,NULL,'2026-09-21 16:59:27','2026-09-21 16:59:27'),(146,6,'LOCAL','VIDEO','55 Add the my-favourites page and toggle favourite button.mp4','video/mp4',94460337,NULL,NULL,NULL,'/api/media/videos/n0/cc60ce0a-33b5-4b35-b34d-d38312b73174.mp4',NULL,'/api/media/videos/n0/cc60ce0a-33b5-4b35-b34d-d38312b73174.mp4',NULL,NULL,NULL,'READY',784,NULL,NULL,NULL,'2026-09-21 16:59:28','2026-09-21 16:59:28'),(147,6,'LOCAL','VIDEO','56 Implement the add to favourites functionality.mp4','video/mp4',122294208,NULL,NULL,NULL,'/api/media/videos/n0/a87370f2-b23a-47c9-95db-0b86eda1e480.mp4',NULL,'/api/media/videos/n0/a87370f2-b23a-47c9-95db-0b86eda1e480.mp4',NULL,NULL,NULL,'READY',859,NULL,NULL,NULL,'2026-09-21 16:59:29','2026-09-21 16:59:29'),(148,6,'LOCAL','VIDEO','57 Implement the remove from favourites functionality.mp4','video/mp4',99137717,NULL,NULL,NULL,'/api/media/videos/n0/ce42e817-516d-46d0-8f8c-684d63705068.mp4',NULL,'/api/media/videos/n0/ce42e817-516d-46d0-8f8c-684d63705068.mp4',NULL,NULL,NULL,'READY',642,NULL,NULL,NULL,'2026-09-21 16:59:31','2026-09-21 16:59:31'),(149,6,'LOCAL','VIDEO','58 Implement parallel and intercepting routes for login modal.mp4','video/mp4',66577420,NULL,NULL,NULL,'/api/media/videos/n0/de0754b9-d176-4c23-a313-e0eefb0262ea.mp4',NULL,'/api/media/videos/n0/de0754b9-d176-4c23-a313-e0eefb0262ea.mp4',NULL,NULL,NULL,'READY',565,NULL,NULL,NULL,'2026-09-21 16:59:32','2026-09-21 16:59:32'),(150,6,'LOCAL','VIDEO','59 Render the login form in the login modal.mp4','video/mp4',133641933,NULL,NULL,NULL,'/api/media/videos/n0/7ec0fa36-72db-4c84-abd2-358852f9f9fb.mp4',NULL,'/api/media/videos/n0/7ec0fa36-72db-4c84-abd2-358852f9f9fb.mp4',NULL,NULL,NULL,'READY',928,NULL,NULL,NULL,'2026-09-21 16:59:33','2026-09-21 16:59:33'),(151,6,'LOCAL','VIDEO','60 Query for the list of favourites.mp4','video/mp4',97498769,NULL,NULL,NULL,'/api/media/videos/n0/93646d82-715c-40a9-9075-402d98fa72a0.mp4',NULL,'/api/media/videos/n0/93646d82-715c-40a9-9075-402d98fa72a0.mp4',NULL,NULL,NULL,'READY',642,NULL,NULL,NULL,'2026-09-21 16:59:35','2026-09-21 16:59:35'),(152,6,'LOCAL','VIDEO','61 Render the list of favourites in the my-favourites page.mp4','video/mp4',114543381,NULL,NULL,NULL,'/api/media/videos/n0/70d0204e-b015-4fb0-ac11-7fa1cdde4af5.mp4',NULL,'/api/media/videos/n0/70d0204e-b015-4fb0-ac11-7fa1cdde4af5.mp4',NULL,NULL,NULL,'READY',780,NULL,NULL,NULL,'2026-09-21 16:59:36','2026-09-21 16:59:36'),(153,6,'LOCAL','VIDEO','62 Implement the favourites table pagination and remove favourite.mp4','video/mp4',101605656,NULL,NULL,NULL,'/api/media/videos/n0/0d057226-fc33-4ca5-a608-ba866ccf4ec1.mp4',NULL,'/api/media/videos/n0/0d057226-fc33-4ca5-a608-ba866ccf4ec1.mp4',NULL,NULL,NULL,'READY',742,NULL,NULL,NULL,'2026-09-21 16:59:38','2026-09-21 16:59:38'),(154,6,'LOCAL','VIDEO','63 Add the account page and render user details.mp4','video/mp4',62517909,NULL,NULL,NULL,'/api/media/videos/n0/cbfd15a7-a66b-4171-b8dc-7af47c701941.mp4',NULL,'/api/media/videos/n0/cbfd15a7-a66b-4171-b8dc-7af47c701941.mp4',NULL,NULL,NULL,'READY',547,NULL,NULL,NULL,'2026-09-21 16:59:40','2026-09-21 16:59:40'),(155,6,'LOCAL','VIDEO','54 Update the middleware to cater for expiring auth tokens.mp4','video/mp4',140083804,NULL,NULL,NULL,'/api/media/videos/n0/affcd047-a09c-48bb-9320-c71bec88b3c4.mp4',NULL,'/api/media/videos/n0/affcd047-a09c-48bb-9320-c71bec88b3c4.mp4',NULL,NULL,NULL,'READY',1025,NULL,NULL,NULL,'2026-09-21 17:00:25','2026-09-21 17:00:25'),(156,6,'LOCAL','VIDEO','55 Add the my-favourites page and toggle favourite button.mp4','video/mp4',94460337,NULL,NULL,NULL,'/api/media/videos/n0/f478efe4-5663-4592-8b56-f263cd2a3e62.mp4',NULL,'/api/media/videos/n0/f478efe4-5663-4592-8b56-f263cd2a3e62.mp4',NULL,NULL,NULL,'READY',784,NULL,NULL,NULL,'2026-09-21 17:00:26','2026-09-21 17:00:26'),(157,6,'LOCAL','VIDEO','56 Implement the add to favourites functionality.mp4','video/mp4',122294208,NULL,NULL,NULL,'/api/media/videos/n0/ae29a45a-503a-48f9-a097-43898bd0052e.mp4',NULL,'/api/media/videos/n0/ae29a45a-503a-48f9-a097-43898bd0052e.mp4',NULL,NULL,NULL,'READY',859,NULL,NULL,NULL,'2026-09-21 17:00:28','2026-09-21 17:00:28'),(158,6,'LOCAL','VIDEO','57 Implement the remove from favourites functionality.mp4','video/mp4',99137717,NULL,NULL,NULL,'/api/media/videos/n0/b556d753-c456-41b0-a9c3-7ce156567a31.mp4',NULL,'/api/media/videos/n0/b556d753-c456-41b0-a9c3-7ce156567a31.mp4',NULL,NULL,NULL,'READY',642,NULL,NULL,NULL,'2026-09-21 17:00:29','2026-09-21 17:00:29'),(159,6,'LOCAL','VIDEO','58 Implement parallel and intercepting routes for login modal.mp4','video/mp4',66577420,NULL,NULL,NULL,'/api/media/videos/n0/c6049974-feab-4295-9d52-f9d2d69865bc.mp4',NULL,'/api/media/videos/n0/c6049974-feab-4295-9d52-f9d2d69865bc.mp4',NULL,NULL,NULL,'READY',565,NULL,NULL,NULL,'2026-09-21 17:00:30','2026-09-21 17:00:30'),(160,6,'LOCAL','VIDEO','59 Render the login form in the login modal.mp4','video/mp4',133641933,NULL,NULL,NULL,'/api/media/videos/n0/e4d8a082-c518-44a9-b8bc-fb8b62f1e94b.mp4',NULL,'/api/media/videos/n0/e4d8a082-c518-44a9-b8bc-fb8b62f1e94b.mp4',NULL,NULL,NULL,'READY',928,NULL,NULL,NULL,'2026-09-21 17:00:31','2026-09-21 17:00:31'),(161,6,'LOCAL','VIDEO','60 Query for the list of favourites.mp4','video/mp4',97498769,NULL,NULL,NULL,'/api/media/videos/n0/ca62ee0c-eacb-4fe1-8c19-a49dbafe77a5.mp4',NULL,'/api/media/videos/n0/ca62ee0c-eacb-4fe1-8c19-a49dbafe77a5.mp4',NULL,NULL,NULL,'READY',642,NULL,NULL,NULL,'2026-09-21 17:00:34','2026-09-21 17:00:34'),(162,6,'LOCAL','VIDEO','61 Render the list of favourites in the my-favourites page.mp4','video/mp4',114543381,NULL,NULL,NULL,'/api/media/videos/n0/4bdf67ae-57db-4033-8c5e-3f59f3040482.mp4',NULL,'/api/media/videos/n0/4bdf67ae-57db-4033-8c5e-3f59f3040482.mp4',NULL,NULL,NULL,'READY',780,NULL,NULL,NULL,'2026-09-21 17:00:37','2026-09-21 17:00:37'),(163,6,'LOCAL','VIDEO','62 Implement the favourites table pagination and remove favourite.mp4','video/mp4',101605656,NULL,NULL,NULL,'/api/media/videos/n0/943d91cb-ca9b-467a-8209-e654e6d43298.mp4',NULL,'/api/media/videos/n0/943d91cb-ca9b-467a-8209-e654e6d43298.mp4',NULL,NULL,NULL,'READY',742,NULL,NULL,NULL,'2026-09-21 17:00:40','2026-09-21 17:00:40'),(164,6,'LOCAL','VIDEO','63 Add the account page and render user details.mp4','video/mp4',62517909,NULL,NULL,NULL,'/api/media/videos/n0/64c07a0d-ce78-4d23-9fcd-d9b839670fd6.mp4',NULL,'/api/media/videos/n0/64c07a0d-ce78-4d23-9fcd-d9b839670fd6.mp4',NULL,NULL,NULL,'READY',547,NULL,NULL,NULL,'2026-09-21 17:00:42','2026-09-21 17:00:42'),(165,6,'LOCAL','VIDEO','64 Implement change password form.mp4','video/mp4',157707554,NULL,NULL,NULL,'/api/media/videos/n0/b32cff03-d77f-49c2-9c32-8abda145c58d.mp4',NULL,'/api/media/videos/n0/b32cff03-d77f-49c2-9c32-8abda145c58d.mp4',NULL,NULL,NULL,'READY',1029,NULL,NULL,NULL,'2026-09-21 17:00:48','2026-09-21 17:00:48'),(166,6,'LOCAL','VIDEO','65 Implement delete account functionality.mp4','video/mp4',148223238,NULL,NULL,NULL,'/api/media/videos/n0/37dd1878-01cf-402a-a2fa-f78d2d452564.mp4',NULL,'/api/media/videos/n0/37dd1878-01cf-402a-a2fa-f78d2d452564.mp4',NULL,NULL,NULL,'READY',938,NULL,NULL,NULL,'2026-09-21 17:00:52','2026-09-21 17:00:52'),(167,6,'LOCAL','VIDEO','66 Delete user favourites on account deletion.mp4','video/mp4',32462723,NULL,NULL,NULL,'/api/media/videos/n0/17eb1787-83a3-4ef4-b22b-80ba883a5ab7.mp4',NULL,'/api/media/videos/n0/17eb1787-83a3-4ef4-b22b-80ba883a5ab7.mp4',NULL,NULL,NULL,'READY',270,NULL,NULL,NULL,'2026-09-21 17:00:53','2026-09-21 17:00:53'),(168,6,'LOCAL','VIDEO','67 Implement forgot password functionality.mp4','video/mp4',81518536,NULL,NULL,NULL,'/api/media/videos/n0/a5c459d5-66ed-491c-99e8-a6a0b579c0fe.mp4',NULL,'/api/media/videos/n0/a5c459d5-66ed-491c-99e8-a6a0b579c0fe.mp4',NULL,NULL,NULL,'READY',592,NULL,NULL,NULL,'2026-09-21 17:00:54','2026-09-21 17:00:54'),(169,6,'LOCAL','VIDEO','68 Enable caching for property pages.mp4','video/mp4',34423219,NULL,NULL,NULL,'/api/media/videos/n0/d1d04d43-56c6-4e84-a7da-2b18eec52ef3.mp4',NULL,'/api/media/videos/n0/d1d04d43-56c6-4e84-a7da-2b18eec52ef3.mp4',NULL,NULL,NULL,'READY',222,NULL,NULL,NULL,'2026-09-21 17:00:55','2026-09-21 17:00:55'),(170,6,'LOCAL','VIDEO','69 Add loading states to app.mp4','video/mp4',42197821,NULL,NULL,NULL,'/api/media/videos/n0/23fea606-3b6a-45ec-b7e2-6fcb9a37f3ad.mp4',NULL,'/api/media/videos/n0/23fea606-3b6a-45ec-b7e2-6fcb9a37f3ad.mp4',NULL,NULL,NULL,'READY',352,NULL,NULL,NULL,'2026-09-21 17:00:56','2026-09-21 17:00:56'),(171,6,'LOCAL','VIDEO','70 Build the landing page (optional).mp4','video/mp4',94497133,NULL,NULL,NULL,'/api/media/videos/n0/db2eb658-f19c-4721-b557-5240fc1edab1.mp4',NULL,'/api/media/videos/n0/db2eb658-f19c-4721-b557-5240fc1edab1.mp4',NULL,NULL,NULL,'READY',583,NULL,NULL,NULL,'2026-09-21 17:01:59','2026-09-21 17:01:59'),(172,6,'LOCAL','VIDEO','71 Implement delete property functionality.mp4','video/mp4',199996124,NULL,NULL,NULL,'/api/media/videos/n0/31a75533-5722-49a0-82f1-b27f7f5d4bdc.mp4',NULL,'/api/media/videos/n0/31a75533-5722-49a0-82f1-b27f7f5d4bdc.mp4',NULL,NULL,NULL,'READY',1154,NULL,NULL,NULL,'2026-09-21 17:02:01','2026-09-21 17:02:01'),(173,6,'LOCAL','VIDEO','72 Deploy to vercel.mp4','video/mp4',46986265,NULL,NULL,NULL,'/api/media/videos/n0/dbcdff8e-6c8c-4cc9-801c-b067225f1156.mp4',NULL,'/api/media/videos/n0/dbcdff8e-6c8c-4cc9-801c-b067225f1156.mp4',NULL,NULL,NULL,'READY',386,NULL,NULL,NULL,'2026-09-21 17:02:02','2026-09-21 17:02:02'),(174,6,'LOCAL','VIDEO','1 GenAI Revolution in Mobile Apps.mp4','video/mp4',63799445,NULL,NULL,NULL,'/api/media/videos/n0/09c3193f-875e-456f-ba30-8d0768eaa232.mp4',NULL,'/api/media/videos/n0/09c3193f-875e-456f-ba30-8d0768eaa232.mp4',NULL,NULL,NULL,'READY',231,NULL,NULL,NULL,'2026-09-22 07:24:59','2026-09-22 07:24:59'),(175,6,'LOCAL','VIDEO','2 What is Flutter.mp4','video/mp4',16795299,NULL,NULL,NULL,'/api/media/videos/n0/74e124bc-1656-4c00-9e19-2090ba2477c8.mp4',NULL,'/api/media/videos/n0/74e124bc-1656-4c00-9e19-2090ba2477c8.mp4',NULL,NULL,NULL,'READY',92,NULL,NULL,NULL,'2026-09-22 07:24:59','2026-09-22 07:24:59'),(176,6,'LOCAL','VIDEO','3 Installing the Flutter SDK Step-by-Step Guide.mp4','video/mp4',87898868,NULL,NULL,NULL,'/api/media/videos/n0/9d838193-631b-4993-bcca-be483c2b1187.mp4',NULL,'/api/media/videos/n0/9d838193-631b-4993-bcca-be483c2b1187.mp4',NULL,NULL,NULL,'READY',404,NULL,NULL,NULL,'2026-09-22 07:25:01','2026-09-22 07:25:01'),(177,6,'LOCAL','VIDEO','4 Android Studio Installation Guide for Flutter Developers.mp4','video/mp4',57132716,NULL,NULL,NULL,'/api/media/videos/n0/0c980f16-6dd0-4766-ba02-e44a0e78a32d.mp4',NULL,'/api/media/videos/n0/0c980f16-6dd0-4766-ba02-e44a0e78a32d.mp4',NULL,NULL,NULL,'READY',199,NULL,NULL,NULL,'2026-09-22 07:25:02','2026-09-22 07:25:02'),(178,6,'LOCAL','VIDEO','5 Setting Up Xcode for Building iOS Apps with Flutter.mp4','video/mp4',55263575,NULL,NULL,NULL,'/api/media/videos/n0/d5f2fa6a-a0f8-4dbf-8b7b-cb147e0f83b1.mp4',NULL,'/api/media/videos/n0/d5f2fa6a-a0f8-4dbf-8b7b-cb147e0f83b1.mp4',NULL,NULL,NULL,'READY',176,NULL,NULL,NULL,'2026-09-22 07:25:03','2026-09-22 07:25:03'),(179,6,'LOCAL','VIDEO','6 Flutter Project Setup Running Your App on the iOS Simulator.mp4','video/mp4',50802714,NULL,NULL,NULL,'/api/media/videos/n0/3c725774-00cd-40fc-84ea-a4c3f0a0c26d.mp4',NULL,'/api/media/videos/n0/3c725774-00cd-40fc-84ea-a4c3f0a0c26d.mp4',NULL,NULL,NULL,'READY',202,NULL,NULL,NULL,'2026-09-22 07:25:04','2026-09-22 07:25:04'),(180,6,'LOCAL','VIDEO','7 Setting Up the Android Emulator to Run Flutter Projects.mp4','video/mp4',35686211,NULL,NULL,NULL,'/api/media/videos/n0/15ef93e1-5bd0-40fb-9bf7-dceb09b0c041.mp4',NULL,'/api/media/videos/n0/15ef93e1-5bd0-40fb-9bf7-dceb09b0c041.mp4',NULL,NULL,NULL,'READY',156,NULL,NULL,NULL,'2026-09-22 07:25:05','2026-09-22 07:25:05'),(181,6,'LOCAL','VIDEO','8 Installing Flutter SDK on Windows Step-by-Step Guide.mp4','video/mp4',43938766,NULL,NULL,NULL,'/api/media/videos/n0/28b56afc-2b83-4afb-8ceb-0492a52e87a0.mp4',NULL,'/api/media/videos/n0/28b56afc-2b83-4afb-8ceb-0492a52e87a0.mp4',NULL,NULL,NULL,'READY',320,NULL,NULL,NULL,'2026-09-22 07:25:06','2026-09-22 07:25:06'),(182,6,'LOCAL','VIDEO','9 Setting Up Android Studio for Flutter on Windows.mp4','video/mp4',58167288,NULL,NULL,NULL,'/api/media/videos/n0/b44d50fa-e834-4ec2-9272-60262d5fda0c.mp4',NULL,'/api/media/videos/n0/b44d50fa-e834-4ec2-9272-60262d5fda0c.mp4',NULL,NULL,NULL,'READY',418,NULL,NULL,NULL,'2026-09-22 07:25:08','2026-09-22 07:25:08'),(183,6,'LOCAL','VIDEO','10 Setting Up an Android Emulator (AVD) for Flutter Apps.mp4','video/mp4',19792771,NULL,NULL,NULL,'/api/media/videos/n0/ef02e308-1603-42bc-a4b3-abe9e0efe127.mp4',NULL,'/api/media/videos/n0/ef02e308-1603-42bc-a4b3-abe9e0efe127.mp4',NULL,NULL,NULL,'READY',151,NULL,NULL,NULL,'2026-09-22 07:25:08','2026-09-22 07:25:08'),(184,6,'LOCAL','VIDEO','11 Create a New Flutter Project & Build Chat App UI (Google Gemini).mp4','video/mp4',86204502,NULL,NULL,NULL,'/api/media/videos/n0/7386ef2a-48a5-4555-a6a0-e2d706a254ce.mp4',NULL,'/api/media/videos/n0/7386ef2a-48a5-4555-a6a0-e2d706a254ce.mp4',NULL,NULL,NULL,'READY',640,NULL,NULL,NULL,'2026-09-22 07:25:31','2026-09-22 07:25:31'),(185,6,'LOCAL','VIDEO','12 What is Application Programming Interface.mp4','video/mp4',40903992,NULL,NULL,NULL,'/api/media/videos/n0/2acc81fb-a454-4fe4-a74f-43fafa9d478c.mp4',NULL,'/api/media/videos/n0/2acc81fb-a454-4fe4-a74f-43fafa9d478c.mp4',NULL,NULL,NULL,'READY',140,NULL,NULL,NULL,'2026-09-22 07:25:32','2026-09-22 07:25:32'),(186,6,'LOCAL','VIDEO','13 Components of API.mp4','video/mp4',68197857,NULL,NULL,NULL,'/api/media/videos/n0/39d4e588-aa9e-48f0-a8ec-15509273616c.mp4',NULL,'/api/media/videos/n0/39d4e588-aa9e-48f0-a8ec-15509273616c.mp4',NULL,NULL,NULL,'READY',222,NULL,NULL,NULL,'2026-09-22 07:25:34','2026-09-22 07:25:34'),(187,6,'LOCAL','VIDEO','14 Exploring Google AI Studio for Gemini API Integration.mp4','video/mp4',33128717,NULL,NULL,NULL,'/api/media/videos/n0/60c5b597-78e1-4361-b506-436c17cb1648.mp4',NULL,'/api/media/videos/n0/60c5b597-78e1-4361-b506-436c17cb1648.mp4',NULL,NULL,NULL,'READY',307,NULL,NULL,NULL,'2026-09-22 07:25:35','2026-09-22 07:25:35'),(188,6,'LOCAL','VIDEO','15 Making Gemini API Calls in Flutter Send Input & Get Output.mp4','video/mp4',96223311,NULL,NULL,NULL,'/api/media/videos/n0/3c702f33-fe4b-42a7-85b2-5a2be8739085.mp4',NULL,'/api/media/videos/n0/3c702f33-fe4b-42a7-85b2-5a2be8739085.mp4',NULL,NULL,NULL,'READY',662,NULL,NULL,NULL,'2026-09-22 07:25:37','2026-09-22 07:25:37'),(189,6,'LOCAL','VIDEO','16 Building Q&A Chatbot in Flutter with Google Gemini.mp4','video/mp4',73361049,NULL,NULL,NULL,'/api/media/videos/n0/9da1fa9b-4138-43c1-8348-8e64c5993a07.mp4',NULL,'/api/media/videos/n0/9da1fa9b-4138-43c1-8348-8e64c5993a07.mp4',NULL,NULL,NULL,'READY',510,NULL,NULL,NULL,'2026-09-22 07:25:38','2026-09-22 07:25:38'),(190,6,'LOCAL','VIDEO','17 GUI & Logic Improvements in Flutter.mp4','video/mp4',26510941,NULL,NULL,NULL,'/api/media/videos/n0/89826517-42ef-4cf6-af1f-297db0e821b8.mp4',NULL,'/api/media/videos/n0/89826517-42ef-4cf6-af1f-297db0e821b8.mp4',NULL,NULL,NULL,'READY',176,NULL,NULL,NULL,'2026-09-22 07:25:39','2026-09-22 07:25:39'),(191,6,'LOCAL','VIDEO','18 Using Different Google Gemini Models in Flutter.mp4','video/mp4',21825616,NULL,NULL,NULL,'/api/media/videos/n0/6597501e-49d6-45a8-a46d-3773dab9e4e7.mp4',NULL,'/api/media/videos/n0/6597501e-49d6-45a8-a46d-3773dab9e4e7.mp4',NULL,NULL,NULL,'READY',136,NULL,NULL,NULL,'2026-09-22 07:25:39','2026-09-22 07:25:39'),(192,6,'LOCAL','VIDEO','19 Using Gemini’s Advanced Reasoning (Thinking) Feature in Flutter.mp4','video/mp4',22486323,NULL,NULL,NULL,'/api/media/videos/n0/dce0421e-bcb1-49dd-991c-8464aa42d827.mp4',NULL,'/api/media/videos/n0/dce0421e-bcb1-49dd-991c-8464aa42d827.mp4',NULL,NULL,NULL,'READY',156,NULL,NULL,NULL,'2026-09-22 07:25:40','2026-09-22 07:25:40'),(193,6,'LOCAL','VIDEO','20 Using System Instructions with Google Gemini in Flutter.mp4','video/mp4',26301201,NULL,NULL,NULL,'/api/media/videos/n0/a7505890-5c2a-4d14-8597-352f27494249.mp4',NULL,'/api/media/videos/n0/a7505890-5c2a-4d14-8597-352f27494249.mp4',NULL,NULL,NULL,'READY',191,NULL,NULL,NULL,'2026-09-22 07:25:40','2026-09-22 07:25:40'),(194,6,'LOCAL','VIDEO','21 Updating AppBar and Send Bar in Flutter Chat App.mp4','video/mp4',54012895,NULL,NULL,NULL,'/api/media/videos/n0/8098bad6-0d82-49c0-a88a-6c1c4895a8cf.mp4',NULL,'/api/media/videos/n0/8098bad6-0d82-49c0-a88a-6c1c4895a8cf.mp4',NULL,NULL,NULL,'READY',289,NULL,NULL,NULL,'2026-09-22 07:27:07','2026-09-22 07:27:07'),(195,6,'LOCAL','VIDEO','22 Adding DashChat and Displaying Messages in Flutter Chat App.mp4','video/mp4',83529264,NULL,NULL,NULL,'/api/media/videos/n0/8ce5e6a8-657c-46fa-873e-52bc913257b8.mp4',NULL,'/api/media/videos/n0/8ce5e6a8-657c-46fa-873e-52bc913257b8.mp4',NULL,NULL,NULL,'READY',520,NULL,NULL,NULL,'2026-09-22 07:27:09','2026-09-22 07:27:09'),(196,6,'LOCAL','VIDEO','23 Displaying Received Messages in Correct Order in Flutter Chat App.mp4','video/mp4',42149433,NULL,NULL,NULL,'/api/media/videos/n0/add20f70-30dd-4655-9fa7-fd0ac2254213.mp4',NULL,'/api/media/videos/n0/add20f70-30dd-4655-9fa7-fd0ac2254213.mp4',NULL,NULL,NULL,'READY',259,NULL,NULL,NULL,'2026-09-22 07:27:10','2026-09-22 07:27:10'),(197,6,'LOCAL','VIDEO','24 Introduction to Chat Feature in Flutter with Google Gemini.mp4','video/mp4',13877889,NULL,NULL,NULL,'/api/media/videos/n0/c479383e-bf9e-418c-b901-24a0a7a9e767.mp4',NULL,'/api/media/videos/n0/c479383e-bf9e-418c-b901-24a0a7a9e767.mp4',NULL,NULL,NULL,'READY',76,NULL,NULL,NULL,'2026-09-22 07:27:11','2026-09-22 07:27:11'),(198,6,'LOCAL','VIDEO','25 Adding Chat Feature in Flutter App with Google Gemini.mp4','video/mp4',71405949,NULL,NULL,NULL,'/api/media/videos/n0/c6087c8b-1927-4380-a7d5-9acc9eb42a69.mp4',NULL,'/api/media/videos/n0/c6087c8b-1927-4380-a7d5-9acc9eb42a69.mp4',NULL,NULL,NULL,'READY',419,NULL,NULL,NULL,'2026-09-22 07:27:13','2026-09-22 07:27:13'),(199,6,'LOCAL','VIDEO','26 Adding Service Class for Google Gemini Integration in Flutter.mp4','video/mp4',60128016,NULL,NULL,NULL,'/api/media/videos/n0/7b2b1504-00d4-4791-8d37-c0d78fa4e02f.mp4',NULL,'/api/media/videos/n0/7b2b1504-00d4-4791-8d37-c0d78fa4e02f.mp4',NULL,NULL,NULL,'READY',373,NULL,NULL,NULL,'2026-09-22 07:27:14','2026-09-22 07:27:14'),(200,6,'LOCAL','VIDEO','27 Adding Text-to-Speech (TTS) Library in Flutter Chat App.mp4','video/mp4',38978164,NULL,NULL,NULL,'/api/media/videos/n0/e7211250-41f2-4cfc-ba62-140dae649af2.mp4',NULL,'/api/media/videos/n0/e7211250-41f2-4cfc-ba62-140dae649af2.mp4',NULL,NULL,NULL,'READY',245,NULL,NULL,NULL,'2026-09-22 07:27:16','2026-09-22 07:27:16'),(201,6,'LOCAL','VIDEO','28 Using Text-to-Speech (TTS) in Flutter Chat App.mp4','video/mp4',13442632,NULL,NULL,NULL,'/api/media/videos/n0/7af71cfe-bd92-41f1-aa0e-571a880fb61c.mp4',NULL,'/api/media/videos/n0/7af71cfe-bd92-41f1-aa0e-571a880fb61c.mp4',NULL,NULL,NULL,'READY',106,NULL,NULL,NULL,'2026-09-22 07:27:16','2026-09-22 07:27:16'),(202,6,'LOCAL','VIDEO','29 Enable and Disable Text-to-Speech (TTS) in Flutter Chat App.mp4','video/mp4',54663912,NULL,NULL,NULL,'/api/media/videos/n0/af512dbc-890e-4af5-8abb-dde01cef149a.mp4',NULL,'/api/media/videos/n0/af512dbc-890e-4af5-8abb-dde01cef149a.mp4',NULL,NULL,NULL,'READY',391,NULL,NULL,NULL,'2026-09-22 07:27:18','2026-09-22 07:27:18'),(203,6,'LOCAL','VIDEO','30 Adding Multi-Language Support to TTS in Flutter Gemini App.mp4','video/mp4',44535852,NULL,NULL,NULL,'/api/media/videos/n0/60c636be-5927-46e8-a000-5aed2fc3b227.mp4',NULL,'/api/media/videos/n0/60c636be-5927-46e8-a000-5aed2fc3b227.mp4',NULL,NULL,NULL,'READY',293,NULL,NULL,NULL,'2026-09-22 07:27:19','2026-09-22 07:27:19'),(204,6,'LOCAL','VIDEO','31 Customizing Chatbot Voice Different TTS Voices in Flutter Gemini App.mp4','video/mp4',50583715,NULL,NULL,NULL,'/api/media/videos/n0/5b1f3953-6c93-46c7-8af7-af73d4012839.mp4',NULL,'/api/media/videos/n0/5b1f3953-6c93-46c7-8af7-af73d4012839.mp4',NULL,NULL,NULL,'READY',256,NULL,NULL,NULL,'2026-09-22 07:27:37','2026-09-22 07:27:37'),(205,6,'LOCAL','VIDEO','32 Generate Images with Google Gemini in Flutter.mp4','video/mp4',57259252,NULL,NULL,NULL,'/api/media/videos/n0/4c149a66-52b9-4bb8-9692-dc82c9efa6be.mp4',NULL,'/api/media/videos/n0/4c149a66-52b9-4bb8-9692-dc82c9efa6be.mp4',NULL,NULL,NULL,'READY',344,NULL,NULL,NULL,'2026-09-22 07:27:39','2026-09-22 07:27:39'),(206,6,'LOCAL','VIDEO','33 Combine Text & Image Generation in Flutter.mp4','video/mp4',65023964,NULL,NULL,NULL,'/api/media/videos/n0/ad1611d8-2c1a-4754-9760-460a79673205.mp4',NULL,'/api/media/videos/n0/ad1611d8-2c1a-4754-9760-460a79673205.mp4',NULL,NULL,NULL,'READY',411,NULL,NULL,NULL,'2026-09-22 07:27:41','2026-09-22 07:27:41'),(207,6,'LOCAL','VIDEO','34 Displaying Generated Images in Flutter Gemini App.mp4','video/mp4',61603080,NULL,NULL,NULL,'/api/media/videos/n0/97002f4c-f249-4d3e-bde0-c000e3fdd97a.mp4',NULL,'/api/media/videos/n0/97002f4c-f249-4d3e-bde0-c000e3fdd97a.mp4',NULL,NULL,NULL,'READY',408,NULL,NULL,NULL,'2026-09-22 07:27:42','2026-09-22 07:27:42'),(208,6,'LOCAL','VIDEO','35 Image Generation Overview with Google Gemini in Flutter.mp4','video/mp4',20028401,NULL,NULL,NULL,'/api/media/videos/n0/ffa2d13f-7bbb-43e1-be06-a2117a7ded0f.mp4',NULL,'/api/media/videos/n0/ffa2d13f-7bbb-43e1-be06-a2117a7ded0f.mp4',NULL,NULL,NULL,'READY',119,NULL,NULL,NULL,'2026-09-22 07:27:43','2026-09-22 07:27:43'),(209,6,'LOCAL','VIDEO','36 Choosing an Image for Editing in Flutter with Google Gemini.mp4','video/mp4',73873121,NULL,NULL,NULL,'/api/media/videos/n0/410cd432-c5a5-46c8-bce3-35239fbcbc58.mp4',NULL,'/api/media/videos/n0/410cd432-c5a5-46c8-bce3-35239fbcbc58.mp4',NULL,NULL,NULL,'READY',444,NULL,NULL,NULL,'2026-09-22 07:27:45','2026-09-22 07:27:45'),(210,6,'LOCAL','VIDEO','37 Flutter Gemini App Display Selected Images & Improve Workflow.mp4','video/mp4',64784246,NULL,NULL,NULL,'/api/media/videos/n0/dd26e55f-c22b-4015-bb7b-a3d370e0016d.mp4',NULL,'/api/media/videos/n0/dd26e55f-c22b-4015-bb7b-a3d370e0016d.mp4',NULL,NULL,NULL,'READY',427,NULL,NULL,NULL,'2026-09-22 07:27:47','2026-09-22 07:27:47'),(211,6,'LOCAL','VIDEO','38 Exploring Image Editing API Documentation.mp4','video/mp4',26237545,NULL,NULL,NULL,'/api/media/videos/n0/0c8075d7-13c2-4205-9526-09dba6476833.mp4',NULL,'/api/media/videos/n0/0c8075d7-13c2-4205-9526-09dba6476833.mp4',NULL,NULL,NULL,'READY',149,NULL,NULL,NULL,'2026-09-22 07:27:48','2026-09-22 07:27:48'),(212,6,'LOCAL','VIDEO','39 Displaying Edited Images in Flutter by Converting Base64 Output.mp4','video/mp4',47013477,NULL,NULL,NULL,'/api/media/videos/n0/3a592aca-9313-4126-9239-2e2e1935e897.mp4',NULL,'/api/media/videos/n0/3a592aca-9313-4126-9239-2e2e1935e897.mp4',NULL,NULL,NULL,'READY',321,NULL,NULL,NULL,'2026-09-22 07:27:49','2026-09-22 07:27:49'),(213,6,'LOCAL','VIDEO','40 Flutter Gemini App Text, Image & Editing Features.mp4','video/mp4',42631864,NULL,NULL,NULL,'/api/media/videos/n0/0c001e61-e1c0-4d37-b44c-1e7f91c1d91b.mp4',NULL,'/api/media/videos/n0/0c001e61-e1c0-4d37-b44c-1e7f91c1d91b.mp4',NULL,NULL,NULL,'READY',325,NULL,NULL,NULL,'2026-09-22 07:27:50','2026-09-22 07:27:50'),(214,6,'LOCAL','VIDEO','41 Displaying Progress Indicator in Flutter Gemini App.mp4','video/mp4',36133759,NULL,NULL,NULL,'/api/media/videos/n0/ff027704-169d-4c12-9f4a-21f4631fb4a6.mp4',NULL,'/api/media/videos/n0/ff027704-169d-4c12-9f4a-21f4631fb4a6.mp4',NULL,NULL,NULL,'READY',231,NULL,NULL,NULL,'2026-09-22 07:29:15','2026-09-22 07:29:15'),(215,6,'LOCAL','VIDEO','42 Image Understanding in Flutter Apps with Gemini – Demo.mp4','video/mp4',7824503,NULL,NULL,NULL,'/api/media/videos/n0/693f9f40-3cdd-4a45-81e4-afe7548e2d37.mp4',NULL,'/api/media/videos/n0/693f9f40-3cdd-4a45-81e4-afe7548e2d37.mp4',NULL,NULL,NULL,'READY',64,NULL,NULL,NULL,'2026-09-22 07:29:16','2026-09-22 07:29:16'),(216,6,'LOCAL','VIDEO','43 Setting Up GUI for Understanding Feature in Flutter Gemini App.mp4','video/mp4',45983325,NULL,NULL,NULL,'/api/media/videos/n0/fd619ecc-e271-46f0-8eca-e1a646e3a691.mp4',NULL,'/api/media/videos/n0/fd619ecc-e271-46f0-8eca-e1a646e3a691.mp4',NULL,NULL,NULL,'READY',277,NULL,NULL,NULL,'2026-09-22 07:29:17','2026-09-22 07:29:17'),(217,6,'LOCAL','VIDEO','44 Building Image Understanding Workflow in Flutter with Gemini.mp4','video/mp4',73007647,NULL,NULL,NULL,'/api/media/videos/n0/77b28cee-f11e-4e72-9ab5-0f56d275cd14.mp4',NULL,'/api/media/videos/n0/77b28cee-f11e-4e72-9ab5-0f56d275cd14.mp4',NULL,NULL,NULL,'READY',436,NULL,NULL,NULL,'2026-09-22 07:29:19','2026-09-22 07:29:19'),(218,6,'LOCAL','VIDEO','45 Passing Images to Google Gemini in Flutter.mp4','video/mp4',43364951,NULL,NULL,NULL,'/api/media/videos/n0/c4782f07-35ca-4b44-b30e-75f6e1540915.mp4',NULL,'/api/media/videos/n0/c4782f07-35ca-4b44-b30e-75f6e1540915.mp4',NULL,NULL,NULL,'READY',240,NULL,NULL,NULL,'2026-09-22 07:29:20','2026-09-22 07:29:20'),(219,6,'LOCAL','VIDEO','46 Document Understanding in Flutter Apps with Gemini – Demo.mp4','video/mp4',8436129,NULL,NULL,NULL,'/api/media/videos/n0/e464f16f-5000-4ee4-a27c-e6239b861767.mp4',NULL,'/api/media/videos/n0/e464f16f-5000-4ee4-a27c-e6239b861767.mp4',NULL,NULL,NULL,'READY',80,NULL,NULL,NULL,'2026-09-22 07:29:20','2026-09-22 07:29:20'),(220,6,'LOCAL','VIDEO','47 Flutter Gemini App Setup File Picker for selecting documents.mp4','video/mp4',86472082,NULL,NULL,NULL,'/api/media/videos/n0/07d8c821-c1ca-414c-bcd6-8ccbfbac62d0.mp4',NULL,'/api/media/videos/n0/07d8c821-c1ca-414c-bcd6-8ccbfbac62d0.mp4',NULL,NULL,NULL,'READY',514,NULL,NULL,NULL,'2026-09-22 07:29:23','2026-09-22 07:29:23'),(221,6,'LOCAL','VIDEO','48 Using Google Gemini for Document Understanding in Flutter Apps.mp4','video/mp4',45453544,NULL,NULL,NULL,'/api/media/videos/n0/885f9cf1-4215-4383-aee6-df7e1acce33d.mp4',NULL,'/api/media/videos/n0/885f9cf1-4215-4383-aee6-df7e1acce33d.mp4',NULL,NULL,NULL,'READY',287,NULL,NULL,NULL,'2026-09-22 07:29:24','2026-09-22 07:29:24'),(222,6,'LOCAL','VIDEO','49 Audio Understanding in Flutter Apps with Gemini – Demo.mp4','video/mp4',7594946,NULL,NULL,NULL,'/api/media/videos/n0/e13a3b20-223b-432f-b28b-9c2d826b25f3.mp4',NULL,'/api/media/videos/n0/e13a3b20-223b-432f-b28b-9c2d826b25f3.mp4',NULL,NULL,NULL,'READY',73,NULL,NULL,NULL,'2026-09-22 07:29:24','2026-09-22 07:29:24'),(223,6,'LOCAL','VIDEO','50 Setting Up Audio Understanding in Flutter with Google Gemini.mp4','video/mp4',29471597,NULL,NULL,NULL,'/api/media/videos/n0/5cf9a4c3-6bd8-428a-9a62-06d7625d7450.mp4',NULL,'/api/media/videos/n0/5cf9a4c3-6bd8-428a-9a62-06d7625d7450.mp4',NULL,NULL,NULL,'READY',188,NULL,NULL,NULL,'2026-09-22 07:29:25','2026-09-22 07:29:25'),(224,6,'LOCAL','VIDEO','51 Implement Audio Transcription & Understanding in Flutter.mp4','video/mp4',60514572,NULL,NULL,NULL,'/api/media/videos/n0/62e2e201-20d6-41da-bafc-c12beffcac2c.mp4',NULL,'/api/media/videos/n0/62e2e201-20d6-41da-bafc-c12beffcac2c.mp4',NULL,NULL,NULL,'READY',349,NULL,NULL,NULL,'2026-09-22 07:29:27','2026-09-22 07:29:27'),(225,6,'LOCAL','VIDEO','52 Working with Gemini Audio API in Flutter Apps.mp4','video/mp4',37827990,NULL,NULL,NULL,'/api/media/videos/n0/97701d0d-3112-4540-8f86-45ea17f85fe1.mp4',NULL,'/api/media/videos/n0/97701d0d-3112-4540-8f86-45ea17f85fe1.mp4',NULL,NULL,NULL,'READY',205,NULL,NULL,NULL,'2026-09-22 07:29:28','2026-09-22 07:29:28'),(226,6,'LOCAL','VIDEO','53 Video Understanding in Flutter Apps with Gemini – Demo.mp4','video/mp4',8066617,NULL,NULL,NULL,'/api/media/videos/n0/eba43382-cc17-4d4a-9589-af6ad563eaa5.mp4',NULL,'/api/media/videos/n0/eba43382-cc17-4d4a-9589-af6ad563eaa5.mp4',NULL,NULL,NULL,'READY',72,NULL,NULL,NULL,'2026-09-22 07:29:29','2026-09-22 07:29:29'),(227,6,'LOCAL','VIDEO','54 Selecting and Displaying Videos in Flutter.mp4','video/mp4',31310757,NULL,NULL,NULL,'/api/media/videos/n0/c05b3123-d5eb-4118-aab8-dce3c54d09ed.mp4',NULL,'/api/media/videos/n0/c05b3123-d5eb-4118-aab8-dce3c54d09ed.mp4',NULL,NULL,NULL,'READY',180,NULL,NULL,NULL,'2026-09-22 07:29:29','2026-09-22 07:29:29'),(228,6,'LOCAL','VIDEO','55 Implementing Video Understanding in Flutter with Google Gemini.mp4','video/mp4',54469051,NULL,NULL,NULL,'/api/media/videos/n0/7752e94b-7ad9-460c-8925-41a0a62bd15c.mp4',NULL,'/api/media/videos/n0/7752e94b-7ad9-460c-8925-41a0a62bd15c.mp4',NULL,NULL,NULL,'READY',293,NULL,NULL,NULL,'2026-09-22 07:29:31','2026-09-22 07:29:31');
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
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `newsblogs`
--

LOCK TABLES `newsblogs` WRITE;
/*!40000 ALTER TABLE `newsblogs` DISABLE KEYS */;
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications`
--

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
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
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_items`
--

LOCK TABLES `order_items` WRITE;
/*!40000 ALTER TABLE `order_items` DISABLE KEYS */;
INSERT INTO `order_items` VALUES (1,1,5,'Lập trình Spring Boot và Spring Data JPA với Github Copilot',20000.00,'2026-09-22 08:38:14'),(2,2,5,'Lập trình Spring Boot và Spring Data JPA với Github Copilot',20000.00,'2026-09-22 08:38:33'),(3,3,5,'Lập trình Spring Boot và Spring Data JPA với Github Copilot',20000.00,'2026-09-22 08:39:49');
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
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orders`
--

LOCK TABLES `orders` WRITE;
/*!40000 ALTER TABLE `orders` DISABLE KEYS */;
INSERT INTO `orders` VALUES (1,12,NULL,'LH179006629374063',20000.00,0.00,20000.00,'VND','PAID','BANK_TRANSFER','2026-09-22 08:38:14','2026-09-22 08:38:14','2026-09-22 08:38:14'),(2,13,NULL,'LH179006631297429',20000.00,0.00,20000.00,'VND','PENDING','VNPAY',NULL,'2026-09-22 08:38:33','2026-09-22 08:38:33'),(3,14,NULL,'LH179006638910440',20000.00,0.00,20000.00,'VND','PENDING','MOMO',NULL,'2026-09-22 08:39:49','2026-09-22 08:39:49');
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
  PRIMARY KEY (`id`),
  KEY `idx_payments_provider_txn` (`provider`,`provider_txn_id`),
  KEY `fk_payments_order` (`order_id`),
  CONSTRAINT `fk_payments_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `payments_chk_1` CHECK ((`provider` in (_utf8mb4'VNPAY',_utf8mb4'MOMO',_utf8mb4'STRIPE',_utf8mb4'PAYPAL',_utf8mb4'BANK_TRANSFER',_utf8mb4'WALLET'))),
  CONSTRAINT `payments_chk_2` CHECK ((`status` in (_utf8mb4'PENDING',_utf8mb4'SUCCEEDED',_utf8mb4'FAILED',_utf8mb4'CANCELLED',_utf8mb4'REFUNDED')))
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payments`
--

LOCK TABLES `payments` WRITE;
/*!40000 ALTER TABLE `payments` DISABLE KEYS */;
INSERT INTO `payments` VALUES (1,1,'BANK_TRANSFER','BANK_TRANSFER-LH179006629374063',20000.00,'VND','SUCCEEDED','/thanh-toan/LH179006629374063',NULL,'2026-09-22 08:38:14','2026-09-22 08:38:14','2026-09-22 08:38:14'),(2,2,'VNPAY','VNPAY-LH179006631297429',20000.00,'VND','PENDING','/thanh-toan/LH179006631297429',NULL,NULL,'2026-09-22 08:38:33','2026-09-22 08:38:33'),(3,3,'MOMO','MOMO-LH179006638910440',20000.00,'VND','PENDING','/thanh-toan/LH179006638910440',NULL,NULL,'2026-09-22 08:39:49','2026-09-22 08:39:49');
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
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
  PRIMARY KEY (`id`),
  KEY `fk_qa_quiz` (`quiz_id`),
  KEY `fk_qa_user` (`user_id`),
  KEY `fk_qa_enrollment` (`enrollment_id`),
  CONSTRAINT `fk_qa_enrollment` FOREIGN KEY (`enrollment_id`) REFERENCES `enrollments` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_qa_quiz` FOREIGN KEY (`quiz_id`) REFERENCES `quizzes` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_qa_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
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
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'seed-admin-001',1,'admin','admin@learnhub.local','$2a$10$y9JezN0vIilr8kjSuufW3eEqq5ZlrFuvNR2COJug9bv1xGMc53JRm','0901234567','12 Nguyen Hue, Quan 1, TP.HCM','https://cdn.learnhub.local/avatars/admin.png','LearnHub Admin','Quan tri vien he thong','ACTIVE',_binary '',NULL,NULL,'2026-09-08 08:42:25','2026-09-08 08:42:25','USER'),(2,'seed-instructor-001',3,'instructor','instructor@learnhub.local','$2a$10$y9JezN0vIilr8kjSuufW3eEqq5ZlrFuvNR2COJug9bv1xGMc53JRm','0901234568','25 Le Loi, Quan 1, TP.HCM','https://cdn.learnhub.local/avatars/instructor.png','Nguyen Van Giang','Giang vien lap trinh','ACTIVE',_binary '',NULL,NULL,'2026-09-08 08:42:25','2026-09-08 08:42:25','USER'),(3,'seed-student-001',3,'student','student@learnhub.local','$2a$10$y9JezN0vIilr8kjSuufW3eEqq5ZlrFuvNR2COJug9bv1xGMc53JRm','0901234569','48 Tran Hung Dao, Quan 5, TP.HCM','https://cdn.learnhub.local/avatars/student.png','Tran Thi Hoc','Hoc vien','ACTIVE',_binary '\0',NULL,NULL,'2026-09-08 08:42:25','2026-09-12 17:26:35','USER'),(4,'local-da5a7479-0f88-4f0e-9597-326127e42528',3,'minh','minh@gmail.com','$2a$10$dTtiLKQGuZKqc4G4N9FX2OESEpWY7DIkp.buxfMfnww/Tutq7AL8.','0999212815','Chưa cập nhật','default-26b6e923-5a3a-45b3-af59-1e806cf22a1f.png','Nguyễn MInh','','ACTIVE',_binary '\0',NULL,NULL,'2026-09-12 09:36:48','2026-09-12 17:26:35','USER'),(5,'local-fab1ee6d-9c35-401c-8cef-bbe04b941117',3,'hau123','hau123@gmail.com','$2a$10$nNxuJyu4lLF1tHuBvi7zG.WYFhemzpZvirTaazqfx/1tejBX/5l9C','0966226214','Chưa cập nhật','default-00bb4155-2340-4bd3-a1f2-9727635c7512.png','Hậu Lê','','ACTIVE',_binary '\0','2026-09-12 12:00:20',NULL,'2026-09-12 09:49:23','2026-09-12 12:00:20','USER'),(6,'local-f914381d-998e-4716-88c9-ab4012ee297a',1,'thienminh','thienminh@gmail.com','$2a$10$JmqxNgcMystz4yqwfdteFOw66o11o9jb8o1XzHMapJuKUXRUQRtLi','0918802381','Chưa cập nhật','default-aa53e4de-e486-45be-bc31-edd36bad0b1c.png','Thiên Minh','','ACTIVE',_binary '\0','2026-09-23 19:28:21',NULL,'2026-09-12 09:54:06','2026-09-23 19:28:21','ADMIN'),(7,'local-7ae5f34f-2fa7-4da9-aff7-719ed1010eb4',2,'lephuc','lephuc@gmail.com','$2a$10$qOas8ngOD8r4UeilL/03LeOAjnzzDSbWkpSoSKDtmJHDkYNyugR2i','0994584285','Chưa cập nhật','default-8da073af-daee-416f-8f67-9622096aedc6.png','Lê Phúc','','ACTIVE',_binary '\0',NULL,NULL,'2026-09-12 10:03:42','2026-09-12 10:03:42','INSTRUCTOR'),(8,'nQTm6Y9CGEer9wU7rRnkDEihLKk2',3,'hau99082005','hau99082005@gmail.com','$2a$10$IzMy7ennBLhtaryuxVEo.em22aTxMdQyKAhnww7hAooLXwMHQmKje','0955223486','Chưa cập nhật','google-nQTm6Y9CGEer9wU7rRnkDEihLKk2.png','Hậu Lê văn','','ACTIVE',_binary '','2026-09-13 09:02:53',NULL,'2026-09-13 09:02:53','2026-09-13 09:02:53','USER'),(9,'local-8a1b0acb-9e4a-4b75-a850-89d8fc737a30',2,'hien','hien@gmail.com','$2a$10$5kOVcpGqN0bF5vvGYtai1O7baWqwWu8oQyQoORDI6BCFB0slVOx1W','0966691709','Chưa cập nhật','default-7aecc08a-0714-46a3-921e-9f5054e3577c.png','Lê Hiền','','ACTIVE',_binary '\0','2026-09-13 09:14:47',NULL,'2026-09-13 09:04:00','2026-09-13 09:14:47','INSTRUCTOR'),(10,'mRJJVgmXqragRXtMWKtuISmBIep2',3,'thienminh200202','thienminh200202@gmail.com','$2a$10$MLbNH./qW9yZBzXhtie3/uO9nu/5fddf9aS5r4YZHVUO7WUxicrq.','0908600146','Chưa cập nhật','google-mRJJVgmXqragRXtMWKtuISmBIep2.png','minh Thien','','ACTIVE',_binary '','2026-09-13 09:04:19',NULL,'2026-09-13 09:04:19','2026-09-13 09:04:19','USER'),(11,'local-0bc31f3b-b115-4974-a389-adc1563c519e',3,'cart.test.1199314277','cart.test.1199314277@learnhub.local','$2a$10$0UDKqbXKpjImpDraD1R1XOAxHqHalJncX5waOYc6QWy/QGPuXWUuG','0924057501','Chưa cập nhật','default-f6637f6d-c80d-46c7-bb69-5000fd3d82ea.png','Hoc Vien Cart','','ACTIVE',_binary '\0','2026-09-22 08:08:10',NULL,'2026-09-22 08:06:15','2026-09-22 08:08:10','USER'),(12,'local-a52ed138-dbeb-46b9-84f9-a224bbf3cf62',3,'paytest461837','paytest461837@learnhub.test','$2a$10$pmRKjevVvE6l70AgantvTur2EtQ8B3NobhzyP.kAU1eEawtHoi4YG','0931942176','Chưa cập nhật','default-03466728-70fa-460f-88ec-70ddaecd6f9e.png','Pay Test','','ACTIVE',_binary '\0',NULL,NULL,'2026-09-22 08:38:14','2026-09-22 08:38:14','USER'),(13,'local-6be1c19c-b72a-4d9f-937b-239cb2a4cd70',3,'payui914312','payui914312@learnhub.test','$2a$10$m3MRcTWSz1JBJwc42qyDfeIUROCWy3KVaHHCtHKmGTESUDOJSTn.m','0962269642','Chưa cập nhật','default-bf615f69-826a-4050-a949-6b8421a5da03.png','Pay UI','','ACTIVE',_binary '\0',NULL,NULL,'2026-09-22 08:38:33','2026-09-22 08:38:33','USER'),(14,'local-ce8c5d77-2954-45d9-895b-628831eece26',3,'paymomo52664','paymomo52664@learnhub.test','$2a$10$JMaPI2eDz5PzlIWyJIGX0.qzeMgzUSKQxIwF1xHXjbfa3FPqJxruK','0939800805','Chưa cập nhật','default-2648f2c8-ed2b-457a-8543-f6a43feb7926.png','MoMo Test','','ACTIVE',_binary '\0',NULL,NULL,'2026-09-22 08:39:49','2026-09-22 08:39:49','USER');
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
  KEY `fk_wish_course` (`course_id`),
  CONSTRAINT `fk_wish_course` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_wish_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
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

-- Dump completed on 2026-09-24  2:47:29
