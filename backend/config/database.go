package config

import (
	"fmt"
	"log"
	"os"

	"github.com/sensejourney/backend/models"
	"gorm.io/driver/mysql"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

var DB *gorm.DB

// InitDatabase 初始化数据库连接
func InitDatabase() {
	// 优先使用MySQL，如果MYSQL_DSN环境变量存在则使用MySQL
	// 否则使用SQLite作为回退方案
	mysqlDSN := os.Getenv("MYSQL_DSN")
	if mysqlDSN != "" {
		connectMySQL(mysqlDSN)
		return
	}

	// 默认使用MySQL连接（使用用户提供的凭据）
	dsn := "root:password@tcp(localhost:3306)/sensejourney?charset=utf8mb4&parseTime=True&loc=Local"
	connectMySQL(dsn)
}

// connectMySQL 连接MySQL数据库
func connectMySQL(dsn string) {
	db, err := gorm.Open(mysql.Open(dsn), &gorm.Config{
		DisableForeignKeyConstraintWhenMigrating: true,
	})
	if err != nil {
		log.Printf("Failed to connect to MySQL: %v", err)
		log.Println("Falling back to SQLite...")
		connectSQLite()
		return
	}

	DB = db

	// 自动迁移表结构
	err = db.AutoMigrate(&models.User{}, &models.JourneySelection{})
	if err != nil {
		log.Fatalf("Failed to migrate database: %v", err)
	}

	// 迁移users表：检查并重命名uuid列为uid列
	migrateUsersTableMySQL(db)

	fmt.Println("MySQL database connected and migrated successfully")
}

// connectSQLite 连接SQLite数据库（回退方案）
func connectSQLite() {
	dsn := "sensejourney.db"
	db, err := gorm.Open(sqlite.Open(dsn), &gorm.Config{
		DisableForeignKeyConstraintWhenMigrating: true,
	})
	if err != nil {
		log.Fatalf("Failed to connect to SQLite: %v", err)
	}

	DB = db

	// 自动迁移表结构
	err = db.AutoMigrate(&models.User{}, &models.JourneySelection{})
	if err != nil {
		log.Fatalf("Failed to migrate database: %v", err)
	}

	// 迁移users表：检查并重命名uuid列为uid列
	migrateUsersTableSQLite(db)

	fmt.Println("SQLite database connected and migrated successfully")
}

// migrateUsersTableMySQL MySQL版本的users表迁移
func migrateUsersTableMySQL(db *gorm.DB) {
	// 检查是否存在uuid列
	if db.Migrator().HasColumn(&models.User{}, "uuid") {
		log.Println("Migrating users table: renaming uuid column to uid...")

		// 检查是否存在uid列
		if !db.Migrator().HasColumn(&models.User{}, "uid") {
			// 添加uid列
			err := db.Exec("ALTER TABLE users ADD COLUMN uid BIGINT UNSIGNED").Error
			if err != nil && !contains(err.Error(), "Duplicate column name") {
				log.Printf("Warning: Failed to add uid column: %v", err)
			} else {
				log.Println("Added uid column to users table")
			}
		}

		// 检查表是否为空
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

// migrateUsersTableSQLite SQLite版本的users表迁移
func migrateUsersTableSQLite(db *gorm.DB) {
	// 检查是否存在uuid列
	var columnExists bool
	db.Raw("SELECT COUNT(*) > 0 FROM pragma_table_info('users') WHERE name = 'uuid'").Scan(&columnExists)

	if columnExists {
		log.Println("Migrating users table: renaming uuid column to uid...")

		// 检查是否存在uid列
		var uidColumnExists bool
		db.Raw("SELECT COUNT(*) > 0 FROM pragma_table_info('users') WHERE name = 'uid'").Scan(&uidColumnExists)

		if !uidColumnExists {
			// 添加uid列
			err := db.Exec("ALTER TABLE users ADD COLUMN uid INTEGER").Error
			if err != nil && !contains(err.Error(), "duplicate column name") {
				log.Printf("Warning: Failed to add uid column: %v", err)
			} else {
				log.Println("Added uid column to users table")
			}
		}

		// 检查表是否为空
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

// contains 检查字符串是否包含子串
func contains(s, substr string) bool {
	return len(s) >= len(substr) && (s == substr || len(s) > len(substr) && (s[:len(substr)] == substr || contains(s[1:], substr)))
}
