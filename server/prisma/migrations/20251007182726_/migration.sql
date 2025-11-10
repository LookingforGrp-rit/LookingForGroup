-- CreateTable
CREATE TABLE `mediums` (
    `medium_id` INTEGER NOT NULL AUTO_INCREMENT,
    `label` VARCHAR(50) NOT NULL,

    UNIQUE INDEX `mediums_label_key`(`label`),
    PRIMARY KEY (`medium_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `roles` (
    `title_id` INTEGER NOT NULL AUTO_INCREMENT,
    `label` VARCHAR(50) NOT NULL,

    UNIQUE INDEX `roles_label_key`(`label`),
    PRIMARY KEY (`title_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `jobs` (
    `job_id` INTEGER NOT NULL AUTO_INCREMENT,
    `project_id` INTEGER NOT NULL,
    `role_id` INTEGER NOT NULL,
    `contact_user_id` INTEGER NOT NULL,
    `availability` ENUM('Full-time', 'Part-time', 'Flexible') NOT NULL,
    `duration` ENUM('Short-term', 'Long-term') NOT NULL,
    `location` ENUM('On-site', 'Remote', 'Hybrid') NOT NULL,
    `compensation` ENUM('Unpaid', 'Paid') NOT NULL,
    `description` VARCHAR(500) NOT NULL DEFAULT '',
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NOT NULL,

    INDEX `FK2_project_id`(`project_id`),
    INDEX `FK_jobs_job_titles`(`role_id`),
    PRIMARY KEY (`job_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `majors` (
    `major_id` INTEGER NOT NULL AUTO_INCREMENT,
    `label` VARCHAR(100) NOT NULL,

    UNIQUE INDEX `majors_label_key`(`label`),
    PRIMARY KEY (`major_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `members` (
    `project_id` INTEGER NOT NULL,
    `user_id` INTEGER NOT NULL,
    `title_id` INTEGER NOT NULL,
    `profile_visibility` ENUM('private', 'public') NOT NULL DEFAULT 'public',
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `FK_members_job_titles`(`title_id`),
    INDEX `FK_members_users`(`user_id`),
    PRIMARY KEY (`project_id`, `user_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `project_followings` (
    `user_id` INTEGER NOT NULL,
    `project_id` INTEGER NOT NULL,
    `followed_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `FK_project_followings_projects`(`project_id`),
    INDEX `FK_project_followings_users`(`user_id`),
    PRIMARY KEY (`user_id`, `project_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `project_images` (
    `image_id` INTEGER NOT NULL AUTO_INCREMENT,
    `image` VARCHAR(100) NOT NULL,
    `altText` VARCHAR(150) NOT NULL,
    `position` INTEGER NOT NULL,
    `project_id` INTEGER NOT NULL,

    INDEX `FK_project_images_projects`(`project_id`),
    PRIMARY KEY (`image_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `project_socials` (
    `project_id` INTEGER NOT NULL,
    `website_id` INTEGER NOT NULL,
    `url` VARCHAR(2000) NOT NULL,

    INDEX `FK_project_socials_socials`(`website_id`),
    PRIMARY KEY (`project_id`, `website_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `projects` (
    `project_id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(150) NOT NULL,
    `hook` VARCHAR(200) NOT NULL DEFAULT '',
    `description` VARCHAR(2000) NOT NULL DEFAULT '',
    `thumbnail_id` INTEGER NULL,
    `purpose` ENUM('Personal', 'Portfolio Piece', 'Academic', 'Co-op') NULL,
    `status` ENUM('Planning', 'Development', 'Post-Production', 'Complete') NOT NULL DEFAULT 'Planning',
    `audience` VARCHAR(300) NOT NULL DEFAULT '',
    `user_id` INTEGER NOT NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NOT NULL,

    INDEX `FK_user_id`(`user_id`),
    PRIMARY KEY (`project_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `socials` (
    `website_id` INTEGER NOT NULL AUTO_INCREMENT,
    `label` VARCHAR(50) NOT NULL,
    `base_url` VARCHAR(50) NOT NULL,

    UNIQUE INDEX `socials_label_key`(`label`),
    PRIMARY KEY (`website_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tags` (
    `tag_id` INTEGER NOT NULL AUTO_INCREMENT,
    `label` VARCHAR(50) NOT NULL,
    `type` VARCHAR(50) NOT NULL,

    UNIQUE INDEX `tags_label_type_key`(`label`, `type`),
    PRIMARY KEY (`tag_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_followings` (
    `sender_id` INTEGER NOT NULL,
    `receiver_id` INTEGER NOT NULL,
    `followed_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `FK_user_followings_sender`(`sender_id`),
    INDEX `FK_user_followings_receiver`(`receiver_id`),
    PRIMARY KEY (`sender_id`, `receiver_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_skills` (
    `user_id` INTEGER NOT NULL,
    `skill_id` INTEGER NOT NULL,
    `position` INTEGER NOT NULL,
    `proficiency` ENUM('Novice', 'Intermediate', 'Advanced', 'Expert') NOT NULL,

    INDEX `FK_user_skills_skills`(`skill_id`),
    INDEX `FK_user_skills_users`(`user_id`),
    PRIMARY KEY (`user_id`, `skill_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_socials` (
    `user_id` INTEGER NOT NULL,
    `website_id` INTEGER NOT NULL,
    `url` VARCHAR(2000) NOT NULL,

    INDEX `FK_user_socials_socials`(`website_id`),
    PRIMARY KEY (`user_id`, `website_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `users` (
    `user_id` INTEGER NOT NULL AUTO_INCREMENT,
    `username` VARCHAR(50) NOT NULL,
    `rit_email` VARCHAR(50) NOT NULL,
    `first_name` TEXT NOT NULL,
    `last_name` TEXT NOT NULL,
    `profile_image` VARCHAR(100) NULL,
    `headline` VARCHAR(100) NOT NULL DEFAULT '',
    `pronouns` VARCHAR(20) NOT NULL DEFAULT '',
    `title` VARCHAR(50) NOT NULL DEFAULT '',
    `academic_year` ENUM('Freshman', 'Sophomore', 'Junior', 'Senior', 'Graduate') NULL,
    `location` VARCHAR(150) NOT NULL DEFAULT '',
    `fun_fact` VARCHAR(100) NOT NULL DEFAULT '',
    `bio` VARCHAR(600) NOT NULL DEFAULT '',
    `visibility` TINYINT NOT NULL DEFAULT 1,
    `mentor` BOOLEAN NOT NULL DEFAULT false,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NOT NULL,
    `phone_number` VARCHAR(20) NULL,
    `university_id` VARCHAR(9) NOT NULL,

    UNIQUE INDEX `users_username_key`(`username`),
    UNIQUE INDEX `users_rit_email_key`(`rit_email`),
    UNIQUE INDEX `users_phone_number_key`(`phone_number`),
    UNIQUE INDEX `university_id_UNIQUE`(`university_id`),
    PRIMARY KEY (`user_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `skills` (
    `skill_id` INTEGER NOT NULL AUTO_INCREMENT,
    `label` VARCHAR(50) NOT NULL,
    `type` VARCHAR(50) NOT NULL,

    UNIQUE INDEX `skills_label_type_key`(`label`, `type`),
    PRIMARY KEY (`skill_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_MediumsToProjects` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_MediumsToProjects_AB_unique`(`A`, `B`),
    INDEX `_MediumsToProjects_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_MajorsToUsers` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_MajorsToUsers_AB_unique`(`A`, `B`),
    INDEX `_MajorsToUsers_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_ProjectsToTags` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_ProjectsToTags_AB_unique`(`A`, `B`),
    INDEX `_ProjectsToTags_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `jobs` ADD CONSTRAINT `jobs_project_id_contact_user_id_fkey` FOREIGN KEY (`project_id`, `contact_user_id`) REFERENCES `members`(`project_id`, `user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `jobs` ADD CONSTRAINT `FK2_project_id` FOREIGN KEY (`project_id`) REFERENCES `projects`(`project_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `jobs` ADD CONSTRAINT `FK_jobs_job_titles` FOREIGN KEY (`role_id`) REFERENCES `roles`(`title_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `members` ADD CONSTRAINT `FK_members_job_titles` FOREIGN KEY (`title_id`) REFERENCES `roles`(`title_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `members` ADD CONSTRAINT `FK_members_projects` FOREIGN KEY (`project_id`) REFERENCES `projects`(`project_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `members` ADD CONSTRAINT `FK_members_users` FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `project_followings` ADD CONSTRAINT `FK_project_followings_projects` FOREIGN KEY (`project_id`) REFERENCES `projects`(`project_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `project_followings` ADD CONSTRAINT `FK_project_followings_users` FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `project_images` ADD CONSTRAINT `FK_project_images_projects` FOREIGN KEY (`project_id`) REFERENCES `projects`(`project_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `project_socials` ADD CONSTRAINT `FK_project_socials_projects` FOREIGN KEY (`project_id`) REFERENCES `projects`(`project_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `project_socials` ADD CONSTRAINT `FK_project_socials_socials` FOREIGN KEY (`website_id`) REFERENCES `socials`(`website_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `projects` ADD CONSTRAINT `FK_user_id` FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_followings` ADD CONSTRAINT `FK_user_followings_sender` FOREIGN KEY (`sender_id`) REFERENCES `users`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_followings` ADD CONSTRAINT `FK_user_followings_receiver` FOREIGN KEY (`receiver_id`) REFERENCES `users`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_skills` ADD CONSTRAINT `FK_user_skills_skills` FOREIGN KEY (`skill_id`) REFERENCES `skills`(`skill_id`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_skills` ADD CONSTRAINT `FK_user_skills_users` FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_socials` ADD CONSTRAINT `FK_user_socials_socials` FOREIGN KEY (`website_id`) REFERENCES `socials`(`website_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_socials` ADD CONSTRAINT `FK_user_socials_users` FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_MediumsToProjects` ADD CONSTRAINT `_MediumsToProjects_A_fkey` FOREIGN KEY (`A`) REFERENCES `mediums`(`medium_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_MediumsToProjects` ADD CONSTRAINT `_MediumsToProjects_B_fkey` FOREIGN KEY (`B`) REFERENCES `projects`(`project_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_MajorsToUsers` ADD CONSTRAINT `_MajorsToUsers_A_fkey` FOREIGN KEY (`A`) REFERENCES `majors`(`major_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_MajorsToUsers` ADD CONSTRAINT `_MajorsToUsers_B_fkey` FOREIGN KEY (`B`) REFERENCES `users`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_ProjectsToTags` ADD CONSTRAINT `_ProjectsToTags_A_fkey` FOREIGN KEY (`A`) REFERENCES `projects`(`project_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_ProjectsToTags` ADD CONSTRAINT `_ProjectsToTags_B_fkey` FOREIGN KEY (`B`) REFERENCES `tags`(`tag_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- MySQL dump 10.13  Distrib 8.0.42, for Win64 (x86_64)
--
-- Host: localhost    Database: lfg
-- ------------------------------------------------------
-- Server version	8.0.42

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
-- Dumping data for table `mediums`
--

LOCK TABLES `mediums` WRITE;
TRUNCATE TABLE `mediums`;
/*!40000 ALTER TABLE `mediums` DISABLE KEYS */;
REPLACE INTO `mediums` VALUES (1,'Video Game'),(2,'Analog Game'),(3,'Mobile Application'),(4,'Website'),(5,'Animation'),(6,'Film'),(7,'Software'),(8,'Other');
/*!40000 ALTER TABLE `mediums` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `roles`
--

LOCK TABLES `roles` WRITE;
TRUNCATE TABLE `roles`;
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;
INSERT INTO `roles` VALUES (1,'Full-Stack Developer'),(2,'Front-End Developer'),(3,'Back-End Developer'),(4,'Software Developer'),(5,'Cloud Developer'),(6,'Mobile Developer'),(7,'Embedded Systems Developer'),(8,'Video Game Developer'),(9,'Database Developer'),(10,'PHP Developer'),(11,'Blockchain Developer'),(12,'DevOps Developer'),(13,'VR Developer'),(14,'UI/UX Designer'),(15,'Mobile UI/UX Designer'),(16,'Graphic Designer'),(17,'Web Designer'),(18,'Technical Designer'),(19,'Video Game Designer'),(20,'Product Designer'),(21,'Visual Designer'),(22,'Motion Graphics Designer'),(23,'Packaging Designer'),(24,'Interior Designer '),(25,'Industrial Designer'),(26,'Mentor'),(27,'Video Editor'),(28,'Manager'),(29,'Project Manager'),(30,'Graphic Artist'),(31,'Instructor'),(32,'VFX Artist'),(33,'SFX Artist'),(34,'Marketing Specialist'),(35,'Cyber Security'),(36,'Web Developer'),(37,'Mobile App Developer'),(38,'Digital Strategist'),(39,'Technical Writer'),(40,'IT Support Specialist'),(41,'Music Composer'),(42,'Video Game Composer'),(43,'2D Animator'),(44,'Illustrator'),(45,'3D Animator'),(46,'Sound Designer'),(47,'Electrical Engineer'),(48,'Computer Engineer'),(49,'Mechanical Engineer'),(50,'Industrial Engineer'),(51,'2D Artist'),(52,'3D Artist'),(53,'Concept Artist'),(54,'Financing'),(55,'Film Producer'),(56,'Photographer'),(57,'Actor'),(58,'Voice Actor'),(59,'Writer'),(60,'Scriptwriter'),(61,'Level Designer'),(62,'Character Designer'),(63,'Film Director'),(64,'Background Artist'),(65,'3D Modeler'),(66,'Render Wrangler'),(67,'Fashion Designer'),(68,'Creative Director'),(69,'Art Director'),(70,'Social Media Manager'),(71,'Environment Artist'),(72,'AR/XR Developer'),(73,'Project Lead'),(74,'Team Lead'),(75,'Open'),(76,'Member'),(77,'Owner');
/*!40000 ALTER TABLE `roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `majors`
--

LOCK TABLES `majors` WRITE;
TRUNCATE TABLE `majors`;
/*!40000 ALTER TABLE `majors` DISABLE KEYS */;
INSERT INTO `majors` VALUES (1,'Animation'),(2,'Computer Engineering'),(3,'Computing Engineering Technology'),(4,'Computing Exploration'),(5,'Computing and Information Technologies'),(6,'Computer Science'),(7,'Cybersecurity'),(8,'3D Digital Design'),(9,'Electrical Engineering'),(10,'Electrical Engineering Technology'),(11,'Engineering Exploration'),(12,'Engineering Technology Exploration'),(13,'Film and Animation'),(14,'Fine Art Photography'),(15,'Game Arts'),(16,'Game Design and Development'),(17,'Graphic Design'),(18,'Humanities, Computing, and Design'),(19,'Human-Centered Computing'),(20,'Illustration'),(21,'Industrial Design'),(22,'Industrial Engineering'),(23,'Motion Picture Science'),(24,'New Media Design'),(25,'New Media Interactive Development'),(26,'Software Engineering'),(27,'Web and Mobile Computing'),(28,'Print and Graphic Media Technology'),(29,'Printmaking'),(30,'Product Design'),(31,'Production Option'),(32,'Robotics and Automation'),(33,'Robotics and Manufacturing'),(34,'Robotics'),(35,'Other');

--
-- Dumping data for table `skills`
--

LOCK TABLES `skills` WRITE;
TRUNCATE TABLE `skills`;
/*!40000 ALTER TABLE `skills` DISABLE KEYS */;
INSERT INTO `skills` VALUES (1,'C++','Developer'),(2,'CSS','Developer'),(3,'C#','Developer'),(4,'Operating Systems','Developer'),(5,'Linux','Developer'),(6,'Windows','Developer'),(7,'Full-Stack Development','Developer'),(8,'Front-End Development','Developer'),(9,'Back-End Development','Developer'),(10,'Java','Developer'),(11,'JavaScript','Developer'),(12,'SQL','Developer'),(13,'Debugging','Developer'),(14,'Visual Studio','Developer'),(15,'Visual Studio Code','Developer'),(16,'Xcode','Developer'),(17,'PyCharm','Developer'),(18,'Go','Developer'),(19,'Microsoft Azure','Developer'),(20,'API','Developer'),(21,'Github','Developer'),(22,'Git','Developer'),(23,'Ruby','Developer'),(24,'PHP','Developer'),(25,'C','Developer'),(26,'Kotlin','Developer'),(27,'Unity','Developer'),(28,'Unreal Engine','Developer'),(29,'Godot','Developer'),(30,'React','Developer'),(31,'Node.js','Developer'),(32,'OpenAI','Developer'),(33,'Html','Developer'),(34,'Python','Developer'),(35,'TypeScript','Developer'),(36,'MongoDB','Developer'),(37,'Vue.js','Developer'),(38,'Bootstrap','Developer'),(39,'Lua','Developer'),(40,'Sketch','Designer'),(41,'Figma','Designer'),(42,'Adobe','Designer'),(43,'Adobe Photoshop','Designer'),(44,'Canva','Designer'),(45,'Fotor','Designer'),(46,'GIMP','Designer'),(47,'Adobe XD','Designer'),(48,'Axure','Designer'),(49,'Adobe Illustrator','Designer'),(50,'Clip Studio Paint','Designer'),(51,'Desygner','Designer'),(52,'Coolors','Designer'),(53,'Pixlr','Designer'),(54,'Visme','Designer'),(55,'Webflow','Designer'),(56,'Blender','Designer'),(57,'Procreate','Designer'),(58,'Autodesk Maya','Designer'),(59,'Krita','Designer'),(60,'Cinema 4D','Designer'),(61,'ZBrush','Designer'),(62,'SketchUp','Designer'),(63,'Video Editing','Designer'),(64,'Image Editing','Designer'),(65,'Photography','Designer'),(66,'Adobe After Effects','Designer'),(67,'Collaboration','Soft'),(68,'Problem Solving','Soft'),(69,'Creativity ','Soft'),(70,'Leadership','Soft'),(71,'Organization','Soft'),(72,'Critical Thinking','Soft'),(73,'Public Speaking','Soft'),(74,'Team Work','Soft'),(75,'Interpersonal Communication','Soft'),(76,'Intrapersonal Communication','Soft'),(77,'Innovation','Soft'),(78,'Work Ethic','Soft'),(79,'Trustworthiness','Soft'),(80,'Flexibility','Soft'),(81,'Open to Criticism','Soft'),(82,'Decision-Making','Soft'),(83,'Responsiveness','Soft'),(84,'Curiosity','Soft'),(85,'Professionalism','Soft'),(86,'Attention to Detail','Soft'),(87,'Analytical Thinking','Soft'),(88,'Conflict Management','Soft'),(89,'Fast Learner','Soft'),(90,'Organizational Skills','Soft'),(91,'Time Management','Soft'),(92,'Adaptability','Soft');
/*!40000 ALTER TABLE `skills` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `socials`
--

LOCK TABLES `socials` WRITE;
TRUNCATE TABLE `socials`;
/*!40000 ALTER TABLE `socials` DISABLE KEYS */;
INSERT INTO `socials` VALUES (1,'Instagram','instagram.com'),(2,'Twitter','x.com'),(3,'Facebook','facebook.com'),(4,'Discord','discord.gg'),(5,'Bluesky','bsky.social'),(6,'LinkedIn','linkedin.com'),(7,'YouTube','youtube.com'),(8,'Steam','steampowered.com'),(9,'Itch','itch.io'),(10,'Other','.com');
/*!40000 ALTER TABLE `socials` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `tags`
--

LOCK TABLES `tags` WRITE;
TRUNCATE TABLE `tags`;
/*!40000 ALTER TABLE `tags` DISABLE KEYS */;
INSERT INTO `tags` VALUES (1,'Indie','Creative'),(2,'Abstract','Creative'),(3,'Horror','Creative'),(4,'Sci-Fi','Creative'),(5,'Narrative','Creative'),(6,'Action','Creative'),(7,'Informative','Creative'),(8,'Cute','Creative'),(9,'Fantasy','Creative'),(10,'Comedy','Creative'),(11,'Drama','Creative'),(12,'Coming-of-age','Creative'),(13,'Historical','Creative'),(14,'Romance','Creative'),(15,'Mystery','Creative'),(16,'Slice of Life','Creative'),(17,'Supernatural','Creative'),(18,'Thriller','Creative'),(19,'Adventure','Creative'),(20,'Psychological','Creative'),(21,'Psychological Horror','Creative'),(22,'Sports','Creative'),(23,'Dystopian','Creative'),(24,'Retro','Creative'),(25,'Dark','Creative'),(26,'Realistic','Creative'),(27,'Programs','Technical'),(28,'Automation','Technical'),(29,'Dev Tools','Technical'),(30,'Modding','Technical'),(31,'Management','Technical'),(32,'Accessibility','Technical'),(33,'Strategy','Games'),(34,'Multiplayer','Games'),(35,'Co-op','Games'),(36,'RPG','Games'),(37,'Puzzle','Games'),(38,'Casual','Games'),(39,'Racing','Games'),(40,'Rogue-Like','Games'),(41,'VR','Games'),(42,'Fighting','Games'),(43,'Open World','Games'),(44,'Survival','Games'),(45,'Shooter','Games'),(46,'First-Person Shooter','Games'),(47,'Third-Person Shooter','Games'),(48,'Stealth','Games'),(49,'Shoot-em Up','Games'),(50,'Cards','Games'),(51,'Deck-Building','Games'),(52,'Metroidvania','Games'),(53,'Visual Novel','Games'),(54,'Real-Time','Games'),(55,'Turn-Based','Games'),(56,'Platformer','Games'),(57,'Rhythm','Games'),(58,'MOBA','Games'),(59,'MMORPG','Games'),(60,'Battle Royale','Games'),(61,'Educational','Games'),(62,'Resource Management','Games'),(63,'Drawing','Games'),(64,'Simulation','Games'),(65,'Singleplayer','Games'),(66,'Exploration','Games'),(67,'Puppetry','Multimedia'),(68,'Episodic','Multimedia'),(69,'Feature-Length','Multimedia'),(70,'Short','Multimedia'),(71,'Live-action','Multimedia'),(72,'Documentary','Multimedia'),(73,'Stop-motion','Multimedia'),(74,'2D Animation','Multimedia'),(75,'3D Animation','Multimedia'),(76,'Music Video','Multimedia'),(77,'Trailer','Multimedia'),(78,'Commercial','Multimedia'),(79,'Synth-Pop','Music'),(80,'Electronic','Music'),(81,'Metal','Music'),(82,'Country','Music'),(83,'Rock','Music'),(84,'Acappella','Music'),(85,'Orchestral','Music'),(86,'Hip Hop','Music'),(87,'Jazz','Music'),(88,'Classical','Music'),(89,'Folk','Music'),(90,'Rnb','Music'),(91,'Alternative','Music'),(92,'Rap','Music'),(93,'Reggae','Music'),(94,'Techno','Music'),(95,'K-Pop','Music'),(96,'Disco','Music'),(97,'Funk','Music'),(98,'Pop','Music'),(99,'Blues','Music'),(100,'Experimental','Music'),(101,'Lo-Fi','Music'),(102,'Gospel','Music'),(103,'Lua','Developer Skill'),(104,'Bootstrap','Developer Skill'),(105,'C++','Developer Skill'),(106,'CSS','Developer Skill'),(107,'C#','Developer Skill'),(108,'Operating Systems','Developer Skill'),(109,'Linux','Developer Skill'),(110,'Windows','Developer Skill'),(111,'Full-Stack Development','Developer Skill'),(112,'Front-End Development','Developer Skill'),(113,'Back-End Development','Developer Skill'),(114,'Java','Developer Skill'),(115,'JavaScript','Developer Skill'),(116,'SQL','Developer Skill'),(117,'Debugging','Developer Skill'),(118,'Visual Studio','Developer Skill'),(119,'Visual Studio Code','Developer Skill'),(120,'Xcode','Developer Skill'),(121,'PyCharm','Developer Skill'),(122,'Go','Developer Skill'),(123,'Microsoft Azure','Developer Skill'),(124,'API','Developer Skill'),(125,'Github','Developer Skill'),(126,'Git','Developer Skill'),(127,'Ruby','Developer Skill'),(128,'PHP','Developer Skill'),(129,'C','Developer Skill'),(130,'Kotlin','Developer Skill'),(131,'Vue.js','Developer Skill'),(132,'Unity','Developer Skill'),(133,'Unreal Engine','Developer Skill'),(134,'Godot','Developer Skill'),(135,'React','Developer Skill'),(136,'Node.js','Developer Skill'),(137,'OpenAI','Developer Skill'),(138,'Html','Developer Skill'),(139,'Python','Developer Skill'),(140,'TypeScript','Developer Skill'),(141,'MongoDB','Developer Skill'),(142,'Photography','Designer Skill'),(143,'Adobe After Effects','Designer Skill'),(144,'Clip Studio Paint','Designer Skill'),(145,'Sketch','Designer Skill'),(146,'Figma','Designer Skill'),(147,'Adobe','Designer Skill'),(148,'Adobe Photoshop','Designer Skill'),(149,'Canva','Designer Skill'),(150,'Fotor','Designer Skill'),(151,'GIMP','Designer Skill'),(152,'Adobe XD','Designer Skill'),(153,'Axure','Designer Skill'),(154,'Adobe Illustrator','Designer Skill'),(155,'Desygner','Designer Skill'),(156,'Coolors','Designer Skill'),(157,'Pixlr','Designer Skill'),(158,'Visme','Designer Skill'),(159,'Webflow','Designer Skill'),(160,'Blender','Designer Skill'),(161,'Procreate','Designer Skill'),(162,'Autodesk Maya','Designer Skill'),(163,'Krita','Designer Skill'),(164,'Cinema 4D','Designer Skill'),(165,'ZBrush','Designer Skill'),(166,'SketchUp','Designer Skill'),(167,'Video Editing','Designer Skill'),(168,'Image Editing','Designer Skill'),(169,'Organizational Skills','Soft Skill'),(170,'Adaptability','Soft Skill'),(171,'Collaboration','Soft Skill'),(172,'Problem Solving','Soft Skill'),(173,'Creativity','Soft Skill'),(174,'Leadership','Soft Skill'),(175,'Organization','Soft Skill'),(176,'Critical Thinking','Soft Skill'),(177,'Public Speaking','Soft Skill'),(178,'Team Work','Soft Skill'),(179,'Interpersonal Communication','Soft Skill'),(180,'Intrapersonal Communication','Soft Skill'),(181,'Innovation','Soft Skill'),(182,'Work Ethic','Soft Skill'),(183,'Trustworthiness','Soft Skill'),(184,'Flexibility','Soft Skill'),(185,'Open to Criticism','Soft Skill'),(186,'Decision-Making','Soft Skill'),(187,'Responsiveness','Soft Skill'),(188,'Curiosity','Soft Skill'),(189,'Professionalism','Soft Skill'),(190,'Attention to Detail','Soft Skill'),(191,'Analytical Thinking','Soft Skill'),(192,'Conflict Management','Soft Skill'),(193,'Fast Learner','Soft Skill'),(194,'Time Management','Soft Skill'),(195,'Portfolio Piece','Purpose'),(196,'Academic','Purpose'),(197,'Co-op','Purpose'),(198,'Personal','Purpose'),(199,'Other','Other');
/*!40000 ALTER TABLE `tags` ENABLE KEYS */;
UNLOCK TABLES;

/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-07-10 10:56:56