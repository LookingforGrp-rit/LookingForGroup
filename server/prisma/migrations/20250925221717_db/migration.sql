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
    `thumbnail` VARCHAR(100) NULL,
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
    `mentor` TINYINT NOT NULL DEFAULT 0,
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
