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
/*!40000 ALTER TABLE `mediums` DISABLE KEYS */;
INSERT INTO `mediums` VALUES (1,'Video Game'),(2,'Analog Game'),(3,'Mobile Application'),(4,'Website'),(5,'Animation'),(6,'Film'),(7,'Software'),(8,'Other');
/*!40000 ALTER TABLE `mediums` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `roles`
--

LOCK TABLES `roles` WRITE;
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;
INSERT INTO `roles` VALUES (1,'Full-Stack Developer'),(2,'Front-End Developer'),(3,'Back-End Developer'),(4,'Software Developer'),(5,'Cloud Developer'),(6,'Mobile Developer'),(7,'Embedded Systems Developer'),(8,'Video Game Developer'),(9,'Database Developer'),(10,'PHP Developer'),(11,'Blockchain Developer'),(12,'DevOps Developer'),(13,'VR Developer'),(14,'UI/UX Designer'),(15,'Mobile UI/UX Designer'),(16,'Graphic Designer'),(17,'Web Designer'),(18,'Technical Designer'),(19,'Video Game Designer'),(20,'Product Designer'),(21,'Visual Designer'),(22,'Motion Graphics Designer'),(23,'Packaging Designer'),(24,'Interior Designer '),(25,'Industrial Designer'),(26,'Mentor'),(27,'Video Editor'),(28,'Manager'),(29,'Project Manager'),(30,'Graphic Artist'),(31,'Instructor'),(32,'VFX Artist'),(33,'SFX Artist'),(34,'Marketing Specialist'),(35,'Cyber Security'),(36,'Web Developer'),(37,'Mobile App Developer'),(38,'Digital Strategist'),(39,'Technical Writer'),(40,'IT Support Specialist'),(41,'Music Composer'),(42,'Video Game Composer'),(43,'2D Animator'),(44,'Illustrator'),(45,'3D Animator'),(46,'Sound Designer'),(47,'Electrical Engineer'),(48,'Computer Engineer'),(49,'Mechanical Engineer'),(50,'Industrial Engineer'),(51,'2D Artist'),(52,'3D Artist'),(53,'Concept Artist'),(54,'Financing'),(55,'Film Producer'),(56,'Photographer'),(57,'Actor'),(58,'Voice Actor'),(59,'Writer'),(60,'Scriptwriter'),(61,'Level Designer'),(62,'Character Designer'),(63,'Film Director'),(64,'Background Artist'),(65,'3D Modeler'),(66,'Render Wrangler'),(67,'Fashion Designer'),(68,'Creative Director'),(69,'Art Director'),(70,'Social Media Manager'),(71,'Environment Artist'),(72,'AR/XR Developer'),(73,'Project Lead'),(74,'Team Lead'),(75,'Open'),(76,'Member'),(77,'Owner');
/*!40000 ALTER TABLE `roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `majors`
--

LOCK TABLES `majors` WRITE;
/*!40000 ALTER TABLE `majors` DISABLE KEYS */;
INSERT INTO `majors` VALUES (1,'Animation'),(2,'Computer Engineering'),(3,'Computing Engineering Technology'),(4,'Computing Exploration'),(5,'Computing and Information Technologies'),(6,'Computer Science'),(7,'Cybersecurity'),(8,'3D Digital Design'),(9,'Electrical Engineering'),(10,'Electrical Engineering Technology'),(11,'Engineering Exploration'),(12,'Engineering Technology Exploration'),(13,'Film and Animation'),(14,'Fine Art Photography'),(15,'Game Arts'),(16,'Game Design and Development'),(17,'Graphic Design'),(18,'Humanities, Computing, and Design'),(19,'Human-Centered Computing'),(20,'Illustration'),(21,'Industrial Design'),(22,'Industrial Engineering'),(23,'Motion Picture Science'),(24,'New Media Design'),(25,'New Media Interactive Development'),(26,'Software Engineering'),(27,'Web and Mobile Computing'),(28,'Print and Graphic Media Technology'),(29,'Printmaking'),(30,'Product Design'),(31,'Production Option'),(32,'Robotics and Automation'),(33,'Robotics and Manufacturing'),(34,'Robotics'),(35,'Other');

--
-- Dumping data for table `skills`
--

LOCK TABLES `skills` WRITE;
/*!40000 ALTER TABLE `skills` DISABLE KEYS */;
INSERT INTO `skills` VALUES (1,'C++','Developer'),(2,'CSS','Developer'),(3,'C#','Developer'),(4,'Operating Systems','Developer'),(5,'Linux','Developer'),(6,'Windows','Developer'),(7,'Full-Stack Development','Developer'),(8,'Front-End Development','Developer'),(9,'Back-End Development','Developer'),(10,'Java','Developer'),(11,'JavaScript','Developer'),(12,'SQL','Developer'),(13,'Debugging','Developer'),(14,'Visual Studio','Developer'),(15,'Visual Studio Code','Developer'),(16,'Xcode','Developer'),(17,'PyCharm','Developer'),(18,'Go','Developer'),(19,'Microsoft Azure','Developer'),(20,'API','Developer'),(21,'Github','Developer'),(22,'Git','Developer'),(23,'Ruby','Developer'),(24,'PHP','Developer'),(25,'C','Developer'),(26,'Kotlin','Developer'),(27,'Unity','Developer'),(28,'Unreal Engine','Developer'),(29,'Godot','Developer'),(30,'React','Developer'),(31,'Node.js','Developer'),(32,'OpenAI','Developer'),(33,'Html','Developer'),(34,'Python','Developer'),(35,'TypeScript','Developer'),(36,'MongoDB','Developer'),(37,'Vue.js','Developer'),(38,'Bootstrap','Developer'),(39,'Lua','Developer'),(40,'Sketch','Designer'),(41,'Figma','Designer'),(42,'Adobe','Designer'),(43,'Adobe Photoshop','Designer'),(44,'Canva','Designer'),(45,'Fotor','Designer'),(46,'GIMP','Designer'),(47,'Adobe XD','Designer'),(48,'Axure','Designer'),(49,'Adobe Illustrator','Designer'),(50,'Clip Studio Paint','Designer'),(51,'Desygner','Designer'),(52,'Coolers','Designer'),(53,'Pixlr','Designer'),(54,'Visme','Designer'),(55,'Webflow','Designer'),(56,'Blender','Designer'),(57,'Procreate','Designer'),(58,'Autodesk Maya','Designer'),(59,'Krita','Designer'),(60,'Cinema 4D','Designer'),(61,'ZBrush','Designer'),(62,'SketchUp','Designer'),(63,'Video Editing','Designer'),(64,'Image Editing','Designer'),(65,'Photography','Designer'),(66,'Adobe After Effects','Designer'),(67,'Collaboration','Soft'),(68,'Problem Solving','Soft'),(69,'Creativity ','Soft'),(70,'Leadership','Soft'),(71,'Organization','Soft'),(72,'Critical Thinking','Soft'),(73,'Public Speaking','Soft'),(74,'Team Work','Soft'),(75,'Interpersonal Communication','Soft'),(76,'Intrapersonal Communcation','Soft'),(77,'Innovation','Soft'),(78,'Work Ethic','Soft'),(79,'Trustworthiness','Soft'),(80,'Flexibility','Soft'),(81,'Open to Criticism','Soft'),(82,'Decision-Making','Soft'),(83,'Responsiveness','Soft'),(84,'Curiosity','Soft'),(85,'Professionalism','Soft'),(86,'Attention to Detail','Soft'),(87,'Analytical Thinking','Soft'),(88,'Conflict Management','Soft'),(89,'Fast Learner','Soft'),(90,'Organizational Skills','Soft'),(91,'Time Management','Soft'),(92,'Adaptability','Soft');
/*!40000 ALTER TABLE `skills` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `socials`
--

LOCK TABLES `socials` WRITE;
/*!40000 ALTER TABLE `socials` DISABLE KEYS */;
INSERT INTO `socials` VALUES (1,'Instagram'),(2,'Twitter'),(3,'Facebook'),(4,'Discord'),(5,'Bluesky'),(6,'LinkedIn'),(7,'YouTube'),(8,'Steam'),(9,'Itch'),(10,'Other');
/*!40000 ALTER TABLE `socials` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `tags`
--

LOCK TABLES `tags` WRITE;
/*!40000 ALTER TABLE `tags` DISABLE KEYS */;
INSERT INTO `tags` VALUES (1,'Indie','Creative'),(2,'Abstract','Creative'),(3,'Horror','Creative'),(4,'Sci-Fi','Creative'),(5,'Narrative','Creative'),(6,'Action','Creative'),(7,'Informative','Creative'),(8,'Cute','Creative'),(9,'Fantasy','Creative'),(10,'Comedy','Creative'),(11,'Drama','Creative'),(12,'Coming-of-age','Creative'),(13,'Historical','Creative'),(14,'Romance','Creative'),(15,'Mystery','Creative'),(16,'Slice of Life','Creative'),(17,'Supernatural','Creative'),(18,'Thriller','Creative'),(19,'Adventure','Creative'),(20,'Psychological','Creative'),(21,'Psychological Horror','Creative'),(22,'Sports','Creative'),(23,'Dystopian','Creative'),(24,'Retro','Creative'),(25,'Dark','Creative'),(26,'Realistic','Creative'),(27,'Programs','Technical'),(28,'Automation','Technical'),(29,'Dev Tools','Technical'),(30,'Modding','Technical'),(31,'Management','Technical'),(32,'Accessibility','Technical'),(33,'Strategy','Games'),(34,'Multiplayer','Games'),(35,'Co-op','Games'),(36,'RPG','Games'),(37,'Puzzle','Games'),(38,'Casual','Games'),(39,'Racing','Games'),(40,'Rogue-Like','Games'),(41,'VR','Games'),(42,'Fighting','Games'),(43,'Open World','Games'),(44,'Survival','Games'),(45,'Shooter','Games'),(46,'First-Person Shooter','Games'),(47,'Third-Person Shooter','Games'),(48,'Stealth','Games'),(49,'Shoot-em Up','Games'),(50,'Cards','Games'),(51,'Deck-Building','Games'),(52,'Metroidvania','Games'),(53,'Visual Novel','Games'),(54,'Real-Time','Games'),(55,'Turn-Based','Games'),(56,'Platformer','Games'),(57,'Rhythm','Games'),(58,'MOBA','Games'),(59,'MMORPG','Games'),(60,'Battle Royale','Games'),(61,'Educational','Games'),(62,'Resource Management','Games'),(63,'Drawing','Games'),(64,'Simulation','Games'),(65,'Singleplayer','Games'),(66,'Exploration','Games'),(67,'Puppetry','Multimedia'),(68,'Episodic','Multimedia'),(69,'Feature-Length','Multimedia'),(70,'Short','Multimedia'),(71,'Live-action','Multimedia'),(72,'Documentary','Multimedia'),(73,'Stop-motion','Multimedia'),(74,'2D Animation','Multimedia'),(75,'3D Animation','Multimedia'),(76,'Music Video','Multimedia'),(77,'Trailer','Multimedia'),(78,'Commercial','Multimedia'),(79,'Synth-Pop','Music'),(80,'Electronic','Music'),(81,'Metal','Music'),(82,'Country','Music'),(83,'Rock','Music'),(84,'Acappella','Music'),(85,'Orchestral','Music'),(86,'Hip Hop','Music'),(87,'Jazz','Music'),(88,'Classical','Music'),(89,'Folk','Music'),(90,'Rnb','Music'),(91,'Alternative','Music'),(92,'Rap','Music'),(93,'Reggae','Music'),(94,'Techno','Music'),(95,'K-Pop','Music'),(96,'Disco','Music'),(97,'Funk','Music'),(98,'Pop','Music'),(99,'Blues','Music'),(100,'Experimental','Music'),(101,'Lo-Fi','Music'),(102,'Gospel','Music'),(103,'Lua','Developer Skill'),(104,'Bootstrap','Developer Skill'),(105,'C++','Developer Skill'),(106,'CSS','Developer Skill'),(107,'C#','Developer Skill'),(108,'Operating Systems','Developer Skill'),(109,'Linux','Developer Skill'),(110,'Windows','Developer Skill'),(111,'Full-Stack Development','Developer Skill'),(112,'Front-End Development','Developer Skill'),(113,'Back-End Development','Developer Skill'),(114,'Java','Developer Skill'),(115,'JavaScript','Developer Skill'),(116,'SQL','Developer Skill'),(117,'Debugging','Developer Skill'),(118,'Visual Studio','Developer Skill'),(119,'Visual Studio Code','Developer Skill'),(120,'Xcode','Developer Skill'),(121,'PyCharm','Developer Skill'),(122,'Go','Developer Skill'),(123,'Microsoft Azure','Developer Skill'),(124,'API','Developer Skill'),(125,'Github','Developer Skill'),(126,'Git','Developer Skill'),(127,'Ruby','Developer Skill'),(128,'PHP','Developer Skill'),(129,'C','Developer Skill'),(130,'Kotlin','Developer Skill'),(131,'Vue.js','Developer Skill'),(132,'Unity','Developer Skill'),(133,'Unreal Engine','Developer Skill'),(134,'Godot','Developer Skill'),(135,'React','Developer Skill'),(136,'Node.js','Developer Skill'),(137,'OpenAI','Developer Skill'),(138,'Html','Developer Skill'),(139,'Python','Developer Skill'),(140,'TypeScript','Developer Skill'),(141,'MongoDB','Developer Skill'),(142,'Photography','Designer Skill'),(143,'Adobe After Effects','Designer Skill'),(144,'Clip Studio Paint','Designer Skill'),(145,'Sketch','Designer Skill'),(146,'Figma','Designer Skill'),(147,'Adobe','Designer Skill'),(148,'Adobe Photoshop','Designer Skill'),(149,'Canva','Designer Skill'),(150,'Fotor','Designer Skill'),(151,'GIMP','Designer Skill'),(152,'Adobe XD','Designer Skill'),(153,'Axure','Designer Skill'),(154,'Adobe Illustrator','Designer Skill'),(155,'Desygner','Designer Skill'),(156,'Coolers','Designer Skill'),(157,'Pixlr','Designer Skill'),(158,'Visme','Designer Skill'),(159,'Webflow','Designer Skill'),(160,'Blender','Designer Skill'),(161,'Procreate','Designer Skill'),(162,'Autodesk Maya','Designer Skill'),(163,'Krita','Designer Skill'),(164,'Cinema 4D','Designer Skill'),(165,'ZBrush','Designer Skill'),(166,'SketchUp','Designer Skill'),(167,'Video Editing','Designer Skill'),(168,'Image Editing','Designer Skill'),(169,'Organizational Skills','Soft Skill'),(170,'Adaptability','Soft Skill'),(171,'Collaboration','Soft Skill'),(172,'Problem Solving','Soft Skill'),(173,'Creativity','Soft Skill'),(174,'Leadership','Soft Skill'),(175,'Organization','Soft Skill'),(176,'Critical Thinking','Soft Skill'),(177,'Public Speaking','Soft Skill'),(178,'Team Work','Soft Skill'),(179,'Interpersonal Communication','Soft Skill'),(180,'Intrapersonal Communication','Soft Skill'),(181,'Innovation','Soft Skill'),(182,'Work Ethic','Soft Skill'),(183,'Trustworthiness','Soft Skill'),(184,'Flexibility','Soft Skill'),(185,'Open to Criticism','Soft Skill'),(186,'Decision-Making','Soft Skill'),(187,'Responsiveness','Soft Skill'),(188,'Curiosity','Soft Skill'),(189,'Professionalism','Soft Skill'),(190,'Attention to Detail','Soft Skill'),(191,'Analytical Thinking','Soft Skill'),(192,'Conflict Management','Soft Skill'),(193,'Fast Learner','Soft Skill'),(194,'Time Management','Soft Skill'),(195,'Portfolio Piece','Purpose'),(196,'Academic','Purpose'),(197,'Co-op','Purpose'),(198,'Personal','Purpose'),(199,'Other','Other');
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
