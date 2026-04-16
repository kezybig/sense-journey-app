package api

import (
	"fmt"
	"net/http"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/sensejourney/backend/config"
	"github.com/sensejourney/backend/models"
	"github.com/sensejourney/backend/utils"
	"gorm.io/gorm"
)

// LoginRequest 登录请求结构
type LoginRequest struct {
	Phone    string `json:"phone" binding:"required"`
	Password string `json:"password" binding:"required"`
}

// RegisterRequest 注册请求结构
type RegisterRequest struct {
	Phone    string `json:"phone" binding:"required"`
	Email    string `json:"email" binding:"omitempty,email"`
	Password string `json:"password" binding:"required,min=6"`
}

// Login 处理登录请求
func Login(c *gin.Context) {
	var req LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	// 根据输入值判断是邮箱还是手机号
	var user *models.User
	var err error

	// 简单判断：包含@符号的是邮箱
	if strings.Contains(req.Phone, "@") {
		// 根据邮箱查找用户
		user, err = models.FindByEmail(config.DB, req.Phone)
	} else {
		// 根据手机号查找用户
		user, err = models.FindByPhone(config.DB, req.Phone)
	}

	if err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "User not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Internal server error"})
		return
	}

	// 校验密码
	if !user.CheckPassword(req.Password) {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid password"})
		return
	}

	// 生成Hashid
	hashid, err := utils.EncodeUIDToHashid(user.UID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate user identifier"})
		return
	}

	// 登录成功
	c.JSON(http.StatusOK, gin.H{
		"message": "Login successful",
		"user": gin.H{
			"uid":   hashid,
			"phone": user.Phone,
			"email": user.Email,
		},
	})
}

// Register 处理注册请求
func Register(c *gin.Context) {
	var req RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	// 检查用户是否已存在
	existingUser, err := models.FindByPhone(config.DB, req.Phone)
	if err == nil && existingUser != nil {
		c.JSON(http.StatusConflict, gin.H{"error": "User already exists"})
		return
	}

	// 创建新用户，生成数字UID
	uid := utils.GenerateUID()
	user := &models.User{
		Phone: req.Phone,
		Email: req.Email,
		UID:   uid,
	}

	// 设置密码
	if err := user.SetPassword(req.Password); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to set password"})
		return
	}

	// 保存用户
	if err := user.Save(config.DB); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create user"})
		return
	}

	// 生成Hashid
	hashid, err := utils.EncodeUIDToHashid(user.UID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate user identifier"})
		return
	}

	// 注册成功
	c.JSON(http.StatusCreated, gin.H{
		"message": "Registration successful",
		"user": gin.H{
			"uid":   hashid,
			"phone": user.Phone,
			"email": user.Email,
		},
	})
}

// GetUserByPhone 根据手机号获取用户信息
func GetUserByPhone(c *gin.Context) {
	phone := c.Param("phone")

	user, err := models.FindByPhone(config.DB, phone)
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Internal server error"})
		return
	}

	// 生成Hashid
	hashid, err := utils.EncodeUIDToHashid(user.UID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate user identifier"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"user": gin.H{
			"uid":   hashid,
			"phone": user.Phone,
			"email": user.Email,
		},
	})
}

// JourneySelectionRequest 旅程选择请求结构
type JourneySelectionRequest struct {
	UID       string           `json:"uid" binding:"required"`
	Budget    models.Budget    `json:"budget" binding:"required"`
	Duration  models.Duration  `json:"duration" binding:"required"`
	Proximity models.Proximity `json:"proximity" binding:"required"`
	Transport models.Transport `json:"transport" binding:"required"`
	Moods     models.MoodList  `json:"moods" binding:"required"`
	Status    uint             `json:"status"` // 状态：1-规划完成，2-进行中，3-已结束，4-已放弃，可选，默认1
}

// CreateJourneySelection 创建旅程选择
func CreateJourneySelection(c *gin.Context) {
	var req JourneySelectionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request: " + err.Error()})
		return
	}

	// 解码Hashid获取UID
	uid, err := utils.DecodeHashidToUID(req.UID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user identifier"})
		return
	}

	// 根据UID查找用户
	var user models.User
	err = config.DB.Where("uid = ?", uid).First(&user).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusBadRequest, gin.H{"error": "User not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Internal server error"})
		return
	}

	// 设置状态，如果未提供则使用默认值1（规划完成）
	status := req.Status
	if status == 0 {
		status = 1
	}

	// 创建旅程选择
	selection := &models.JourneySelection{
		UID:       user.UID,
		Budget:    req.Budget,
		Duration:  req.Duration,
		Proximity: req.Proximity,
		Transport: req.Transport,
		Moods:     req.Moods,
		Status:    status,
	}

	// 保存到数据库
	if err := selection.Create(config.DB); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create journey selection: " + err.Error()})
		return
	}

	// 将Mood枚举数组转换为字符串数组
	moodStrings := make([]string, len(selection.Moods))
	for i, mood := range selection.Moods {
		moodStrings[i] = mood.String()
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Journey selection created successfully",
		"selection": gin.H{
			"id":         selection.ID,
			"uid":        req.UID, // 返回前端传递的Hashid
			"budget":     selection.Budget.String(),
			"duration":   selection.Duration.String(),
			"proximity":  selection.Proximity.String(),
			"transport":  selection.Transport.String(),
			"moods":      moodStrings,
			"status":     selection.Status,
			"created_at": selection.CreatedAt,
		},
	})
}

// GetJourneySelectionsByUID 根据用户ID获取所有旅程选择
func GetJourneySelectionsByUID(c *gin.Context) {
	uidHashid := c.Param("uid")

	// 解码Hashid获取UID
	uid, err := utils.DecodeHashidToUID(uidHashid)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user identifier"})
		return
	}

	// 根据UID查找用户
	var user models.User
	err = config.DB.Where("uid = ?", uid).First(&user).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusBadRequest, gin.H{"error": "User not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Internal server error"})
		return
	}

	selections, err := models.FindJourneySelectionsByUID(config.DB, user.UID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve journey selections: " + err.Error()})
		return
	}

	// 将selections中的UID字段替换为Hashid返回给前端
	type selectionResponse struct {
		ID        uint      `json:"id"`
		UID       string    `json:"uid"`
		Budget    string    `json:"budget"`
		Duration  string    `json:"duration"`
		Proximity string    `json:"proximity"`
		Transport string    `json:"transport"`
		Moods     []string  `json:"moods"`
		Status    uint      `json:"status"`
		CreatedAt time.Time `json:"created_at"`
	}

	var responseSelections []selectionResponse
	for _, selection := range selections {
		// 将Mood枚举数组转换为字符串数组
		moodStrings := make([]string, len(selection.Moods))
		for i, mood := range selection.Moods {
			moodStrings[i] = mood.String()
		}

		responseSelections = append(responseSelections, selectionResponse{
			ID:        selection.ID,
			UID:       uidHashid, // 返回Hashid而不是数字ID
			Budget:    selection.Budget.String(),
			Duration:  selection.Duration.String(),
			Proximity: selection.Proximity.String(),
			Transport: selection.Transport.String(),
			Moods:     moodStrings,
			Status:    selection.Status,
			CreatedAt: selection.CreatedAt,
		})
	}

	c.JSON(http.StatusOK, gin.H{
		"selections": responseSelections,
	})
}

// GetLatestJourneySelectionByUID 获取用户最新的旅程选择
func GetLatestJourneySelectionByUID(c *gin.Context) {
	uidHashid := c.Param("uid")

	// 解码Hashid获取UID
	uid, err := utils.DecodeHashidToUID(uidHashid)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user identifier"})
		return
	}

	// 根据UID查找用户
	var user models.User
	err = config.DB.Where("uid = ?", uid).First(&user).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusBadRequest, gin.H{"error": "User not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Internal server error"})
		return
	}

	selection, err := models.FindLatestJourneySelectionByUID(config.DB, user.UID)
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "No journey selection found for this user"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve journey selection: " + err.Error()})
		return
	}

	// 创建响应结构，将UID替换为Hashid
	// 将Mood枚举数组转换为字符串数组
	moodStrings := make([]string, len(selection.Moods))
	for i, mood := range selection.Moods {
		moodStrings[i] = mood.String()
	}

	responseSelection := gin.H{
		"id":         selection.ID,
		"uid":        uidHashid, // 返回Hashid而不是数字ID
		"budget":     selection.Budget.String(),
		"duration":   selection.Duration.String(),
		"proximity":  selection.Proximity.String(),
		"transport":  selection.Transport.String(),
		"moods":      moodStrings,
		"status":     selection.Status,
		"created_at": selection.CreatedAt,
	}

	c.JSON(http.StatusOK, gin.H{
		"selection": responseSelection,
	})
}

// DeleteJourneySelection 删除旅程选择
func DeleteJourneySelection(c *gin.Context) {
	id := c.Param("id")

	// 验证ID参数
	var selectionID uint
	if _, err := fmt.Sscanf(id, "%d", &selectionID); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid selection ID"})
		return
	}

	err := models.DeleteJourneySelectionByID(config.DB, selectionID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete journey selection: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Journey selection deleted successfully",
	})
}

// UpdateJourneySelectionStatusRequest 更新旅程选择状态请求结构
type UpdateJourneySelectionStatusRequest struct {
	Status uint `json:"status" binding:"required,min=1,max=4"` // 状态：1-规划完成，2-进行中，3-已结束，4-已放弃
}

// UpdateJourneySelectionStatus 更新旅程选择状态
func UpdateJourneySelectionStatus(c *gin.Context) {
	id := c.Param("id")

	// 验证ID参数
	var selectionID uint
	if _, err := fmt.Sscanf(id, "%d", &selectionID); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid selection ID"})
		return
	}

	var req UpdateJourneySelectionStatusRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body: " + err.Error()})
		return
	}

	// 验证状态值是否在有效范围内（1-4）
	if req.Status < 1 || req.Status > 4 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Status must be between 1 and 4"})
		return
	}

	// 检查旅程选择是否存在
	var selection models.JourneySelection
	err := config.DB.First(&selection, selectionID).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Journey selection not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve journey selection: " + err.Error()})
		return
	}

	// 更新状态
	err = models.UpdateJourneySelectionStatus(config.DB, selectionID, req.Status)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update journey selection status: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Journey selection status updated successfully",
		"status":  req.Status,
	})
}
