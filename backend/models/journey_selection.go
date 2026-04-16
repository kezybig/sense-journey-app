package models

import (
	"time"

	"gorm.io/gorm"
)

// 旅程选择状态常量
const (
	StatusPlanningCompleted uint = 1 // 规划完成
	StatusInProgress        uint = 2 // 进行中
	StatusEnded             uint = 3 // 已结束
	StatusAbandoned         uint = 4 // 已放弃
)

// JourneySelection 用户旅程选择模型
type JourneySelection struct {
	ID        uint      `json:"id" gorm:"primaryKey"`
	UID       uint64    `json:"uid" gorm:"index;not null"`                // 关联用户UID
	Budget    Budget    `json:"budget" gorm:"type:MEDIUMINT;not null"`    // 预算枚举
	Duration  Duration  `json:"duration" gorm:"type:MEDIUMINT;not null"`  // 持续时间枚举
	Proximity Proximity `json:"proximity" gorm:"type:MEDIUMINT;not null"` // 距离范围枚举
	Transport Transport `json:"transport" gorm:"type:BIGINT;not null"`    // 交通方式枚举
	Moods     MoodList  `json:"moods" gorm:"type:json"`                   // 情绪选择枚举数组
	Status    uint      `json:"status" gorm:"default:1"`                  // 状态：1-规划完成，2-进行中，3-已结束，4-已放弃
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`

	// 关联关系
	User User `json:"user,omitempty" gorm:"foreignKey:UID;references:UID"`
}

// TableName 设置表名
func (JourneySelection) TableName() string {
	return "journey_selections"
}

// Save 保存旅程选择到数据库
func (js *JourneySelection) Save(db *gorm.DB) error {
	return db.Save(js).Error
}

// Create 创建新的旅程选择
func (js *JourneySelection) Create(db *gorm.DB) error {
	return db.Create(js).Error
}

// FindByID 根据ID查找旅程选择
func FindJourneySelectionByID(db *gorm.DB, id uint) (*JourneySelection, error) {
	var selection JourneySelection
	err := db.Preload("User").First(&selection, id).Error
	if err != nil {
		return nil, err
	}
	return &selection, nil
}

// FindJourneySelectionsByUID 根据用户ID查找旅程选择（按创建时间倒序）
func FindJourneySelectionsByUID(db *gorm.DB, uid uint64) ([]JourneySelection, error) {
	var selections []JourneySelection
	err := db.Preload("User").Where("uid = ?", uid).Order("created_at DESC").Find(&selections).Error
	if err != nil {
		return nil, err
	}
	return selections, nil
}

// FindLatestJourneySelectionByUID 查找用户最新的旅程选择
func FindLatestJourneySelectionByUID(db *gorm.DB, uid uint64) (*JourneySelection, error) {
	var selection JourneySelection
	err := db.Preload("User").Where("uid = ?", uid).Order("created_at DESC").First(&selection).Error
	if err != nil {
		return nil, err
	}
	return &selection, nil
}

// DeleteByID 根据ID删除旅程选择
func DeleteJourneySelectionByID(db *gorm.DB, id uint) error {
	return db.Delete(&JourneySelection{}, id).Error
}

// UpdateStatus 更新旅程选择状态
func UpdateJourneySelectionStatus(db *gorm.DB, id uint, status uint) error {
	return db.Model(&JourneySelection{}).Where("id = ?", id).Update("status", status).Error
}
