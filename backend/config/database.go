package config

import (
	"fmt"
	"log"
	"strings"

	"github.com/sensejourney/backend/models"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

var DB *gorm.DB

// InitDatabase 初始化数据库连接
func InitDatabase() {
	// 使用SQLite数据库
	dsn := "sensejourney.db"

	// 连接数据库
	db, err := gorm.Open(sqlite.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	DB = db

	// 自动迁移表结构
	err = db.AutoMigrate(&models.User{}, &models.JourneySelection{})
	if err != nil {
		log.Fatalf("Failed to migrate database: %v", err)
	}

	// 迁移users表：检查并重命名uuid列为uid列
	migrateUsersTable(db)

	fmt.Println("SQLite database connected and migrated successfully")
}

// migrateUsersTable 迁移users表结构
func migrateUsersTable(db *gorm.DB) {
	// 检查是否存在uuid列
	var columnExists bool
	db.Raw("SELECT COUNT(*) > 0 FROM pragma_table_info('users') WHERE name = 'uuid'").Scan(&columnExists)

	if columnExists {
		log.Println("Migrating users table: renaming uuid column to uid...")
		
		// SQLite不支持直接重命名列，需要创建新表
		// 我们采用更简单的方法：添加uid列，然后删除uuid列（如果有数据需要迁移，但现在是空表）
		
		// 检查是否存在uid列
		var uidColumnExists bool
		db.Raw("SELECT COUNT(*) > 0 FROM pragma_table_info('users') WHERE name = 'uid'").Scan(&uidColumnExists)
		
		if !uidColumnExists {
			// 添加uid列
			err := db.Exec("ALTER TABLE users ADD COLUMN uid INTEGER").Error
			if err != nil && !strings.Contains(err.Error(), "duplicate column name") {
				log.Printf("Warning: Failed to add uid column: %v", err)
			} else {
				log.Println("Added uid column to users table")
			}
		}
		
		// 删除uuid列（SQLite不支持直接删除列，需要创建新表）
		// 由于我们刚刚清空了数据库，可以删除整个表并重新创建
		// 但对于空表，最简单的方法是删除并重新创建
		var rowCount int64
		db.Table("users").Count(&rowCount)
		
		if rowCount == 0 {
			// 空表，直接删除并重新创建
			err := db.Migrator().DropTable(&models.User{})
			if err != nil {
				log.Printf("Warning: Failed to drop users table: %v", err)
			} else {
				log.Println("Dropped empty users table")
				// 重新创建表
				err = db.AutoMigrate(&models.User{})
				if err != nil {
					log.Fatalf("Failed to recreate users table: %v", err)
				}
				log.Println("Recreated users table with uid column")
			}
		} else {
			// 有数据，需要更复杂的迁移（但用户选择清空数据库，所以不应该执行到这里）
			log.Println("Users table has data, skipping column migration")
		}
	}
}
