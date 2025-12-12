-- ============================================
-- Database Schema for POS System
-- ============================================
-- انسخ هذا المحتوى وشغّله في phpMyAdmin
-- Copy this content and run it in phpMyAdmin

-- Create User table
CREATE TABLE IF NOT EXISTS `User` (
    id VARCHAR(255) PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    role VARCHAR(50) NOT NULL DEFAULT 'CASHIER',
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create Product table
CREATE TABLE IF NOT EXISTS `Product` (
    id VARCHAR(255) PRIMARY KEY,
    productCode VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    stockQuantity INT NOT NULL,
    imageUrl TEXT,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create Sale table
CREATE TABLE IF NOT EXISTS `Sale` (
    id VARCHAR(255) PRIMARY KEY,
    date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    subtotal DECIMAL(10, 2) NOT NULL,
    tax DECIMAL(10, 2) NOT NULL,
    totalAmount DECIMAL(10, 2) NOT NULL,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create SoldItem table
CREATE TABLE IF NOT EXISTS `SoldItem` (
    id VARCHAR(255) PRIMARY KEY,
    saleId VARCHAR(255) NOT NULL,
    productId VARCHAR(255) NOT NULL,
    productCode VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    quantity INT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    imageUrl TEXT,
    FOREIGN KEY (saleId) REFERENCES `Sale`(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (productId) REFERENCES `Product`(id) ON DELETE RESTRICT ON UPDATE CASCADE
);

-- Create indexes
CREATE UNIQUE INDEX IF NOT EXISTS `User_username_key` ON `User`(username);
CREATE UNIQUE INDEX IF NOT EXISTS `Product_productCode_key` ON `Product`(productCode);

